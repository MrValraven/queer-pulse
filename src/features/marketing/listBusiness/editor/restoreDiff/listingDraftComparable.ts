import {
  DAYS,
  type DayHours,
  type HoursException,
  type ListingDraft,
} from "../../listBusiness.data";
import { normalizeAccessibilityDraft } from "../../listingAccessibility.data";
import {
  emptyMenuDraft,
  pricingModeOf,
  type ListingMenuDraft,
} from "../../listingMenu.data";
import { healListingDraft } from "./healListingDraft";

/**
 * A draft reduced to what a reader of the listing would actually see.
 *
 * The editor mints client-only row ids from module-level counters
 * (`newServiceRow`, `nextMenuRowId`, `witLine`) every time it builds a draft,
 * so the same listing loaded twice carries different ids and a plain
 * `JSON.stringify` calls it changed. Optional blocks have the same problem
 * from the other side: a draft written before menus existed has no `menu` at
 * all, which reads exactly like an empty menu. Everything here strips or
 * fills those differences away, so equality means "reads the same".
 */

/** The row without its client-only React key. */
function withoutId<Row extends { id: string }>(row: Row): Omit<Row, "id"> {
  const { id: _clientOnlyId, ...content } = row;
  return content;
}

function comparableMenu(menu: ListingMenuDraft | undefined): unknown {
  const source = menu ?? emptyMenuDraft();
  return {
    ...source,
    sections: source.sections.map((section) => ({
      ...withoutId(section),
      items: section.items.map(withoutId),
    })),
  };
}

/**
 * One day as the comparison reads it. A closed day keeps its last times in
 * the draft on purpose (reopening it brings them back) and nobody can see
 * them, so they do not count. An open day keeps every window, half-filled
 * ones included: restoring one brings back a window the save bar flags as
 * invalid, so it has to show in the review. The review's hours rows read
 * days through this too, which keeps "shown" and "restored" in step.
 */
export function comparableDay(day: DayHours | undefined): DayHours {
  const isOpen = Boolean(day?.open);
  return {
    open: isOpen,
    intervals: isOpen
      ? (day?.intervals ?? []).map((interval) => ({
          from: interval.from,
          to: interval.to,
        }))
      : [],
  };
}

/** Dated overrides in date order, so a list that was only reordered compares
 *  equal. The review matches them by date too. A stable sort keeps a date
 *  entered twice in its original order. */
function comparableExceptions(
  exceptions: readonly HoursException[] | undefined,
): unknown {
  return [...(exceptions ?? [])]
    .sort((first, second) =>
      first.date < second.date ? -1 : first.date > second.date ? 1 : 0,
    )
    .map((exception) => ({ ...exception, ...comparableDay(exception) }));
}

function comparableHours(hours: ListingDraft["hours"]): unknown {
  return Object.fromEntries(
    DAYS.map((day) => [day.id, comparableDay(hours[day.id])]),
  );
}

/** The fields that need more than a straight read to compare fairly. Every
 *  other field compares as it is stored. These expect a healed draft (see
 *  `healListingDraft`); an editor draft always is one. */
const COMPARABLE_NORMALISERS: Partial<
  Record<keyof ListingDraft, (draft: ListingDraft) => unknown>
> = {
  whatItIs: (draft) => draft.whatItIs.map(withoutId),
  services: (draft) => (draft.services ?? []).map(withoutId),
  menu: (draft) => comparableMenu(draft.menu),
  hours: (draft) => comparableHours(draft.hours),
  hoursExceptions: (draft) => comparableExceptions(draft.hoursExceptions),
  accessibility: (draft) => normalizeAccessibilityDraft(draft.accessibility),
  pricingMode: (draft) => pricingModeOf(draft),
};

function comparableValue<Key extends keyof ListingDraft>(
  draft: ListingDraft,
  key: Key,
): unknown {
  const normalise = COMPARABLE_NORMALISERS[key];
  return normalise ? normalise(draft) : draft[key];
}

/**
 * JSON with every object's keys sorted, so two values holding the same data
 * in a different key order serialise identically. `undefined` object entries
 * drop out, as they do in `JSON.stringify`.
 */
function stableStringify(value: unknown): string {
  return JSON.stringify(sortKeysDeep(value)) ?? "null";
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (!value || typeof value !== "object") return value;
  const record = value as Record<string, unknown>;
  return Object.fromEntries(
    Object.keys(record)
      .sort()
      .map((key) => [key, sortKeysDeep(record[key])]),
  );
}

/** The draft with client-only row ids removed and absent optional blocks
 *  filled with their empty form, so two drafts compare equal exactly when a
 *  reader would see the same listing. Heals first: the autosave hook
 *  fingerprints whatever local storage hands back, and that must never throw. */
export function comparableDraft(draft: ListingDraft): unknown {
  const healed = healListingDraft(draft);
  const comparable: Record<string, unknown> = { ...healed };
  for (const key of Object.keys(COMPARABLE_NORMALISERS) as Array<
    keyof ListingDraft
  >) {
    comparable[key] = comparableValue(healed, key);
  }
  return sortKeysDeep(comparable);
}

/** True when the two drafts would read the same. */
export function isSameListingContent(
  first: ListingDraft,
  second: ListingDraft,
): boolean {
  return (
    stableStringify(comparableDraft(first)) ===
    stableStringify(comparableDraft(second))
  );
}

/** Stable JSON of one field's comparable value, for equality checks per
 *  field. Expects a healed draft, as `buildRestoreDiff` passes it. */
export function comparableField<Key extends keyof ListingDraft>(
  draft: ListingDraft,
  key: Key,
): string {
  return stableStringify(comparableValue(draft, key));
}

import type { TFunction } from "../../../../../shared/i18n/types";
import { diffStringLists } from "../../../../../shared/lib/stringListDiff";
import { wordDiff } from "../../../../../shared/lib/wordDiff";
import type { ListingDraft, PhotoKey } from "../../listBusiness.data";
import { SOCIAL_FIELDS } from "../../fields/practicalFields.data";
import { comparableField } from "./listingDraftComparable";
import type {
  RestoreFieldChange,
  RestoreParagraphChange,
  RestoreRowChange,
} from "./restoreDiff.types";

/**
 * Field-level builders for the restore review: one draft field in, zero or
 * more `RestoreFieldChange`s out. Zero means "nothing a reader could see
 * changed", so the caller never has to filter empty entries itself.
 */

export const DIFF_KEY_PREFIX = "marketing:listBusiness.editor.restore.diff";

/** Both sides of the comparison plus the translator every label needs. */
export interface RestoreDiffContext {
  /** What is on screen now: the "before" of every change. */
  current: ListingDraft;
  /** The local copy: the "after", what bringing it back would put there. */
  saved: ListingDraft;
  t: TFunction;
  /** This session's upload previews, which the editor shows in place of
   *  `current.photos` (a fresh upload holds a bare storage key there). */
  photoPreviews?: Record<PhotoKey, string>;
}

type FieldChanges = RestoreFieldChange[];

/** Draft keys that hold a plain string, so a word diff applies directly. */
export type StringFieldKey = {
  [Key in keyof ListingDraft]-?: ListingDraft[Key] extends string ? Key : never;
}[keyof ListingDraft];

/** Draft keys that hold a list of plain strings. */
export type StringListFieldKey = "cats" | "tags" | "goodFor" | "langs";

/** Compared through `comparableField`, so a regenerated row id never counts. */
export function isFieldChanged(
  context: RestoreDiffContext,
  key: keyof ListingDraft,
): boolean {
  return (
    comparableField(context.current, key) !==
    comparableField(context.saved, key)
  );
}

/** Between the entries of a list shown as one value. */
export const LIST_SEPARATOR = ", ";

/** Draft keys shown under a sibling's name: the pin's three columns read as
 *  one map pin, and alt text lives on its photo's row. */
const LABEL_NAME_OF: Readonly<Record<string, string>> = {
  geocoded: "mapPin",
  latitude: "mapPin",
  longitude: "mapPin",
  alt: "photos",
};

/** The review's own label for a field, in label case ("Business name"). The
 *  history's keys are sentence fragments ("the business name") written to
 *  sit inside a sentence, so they read wrongly as a field heading. */
export function fieldLabelKey(key: string): string {
  return `${DIFF_KEY_PREFIX}.field.${LABEL_NAME_OF[key] ?? key}`;
}

export function yesNoLabel(t: TFunction, value: boolean): string {
  return t(`${DIFF_KEY_PREFIX}.value.${value ? "yes" : "no"}`);
}

export function textField(
  context: RestoreDiffContext,
  key: StringFieldKey,
): FieldChanges {
  if (!isFieldChanged(context, key)) return [];
  return [
    {
      kind: "text",
      key,
      labelKey: fieldLabelKey(key),
      segments: wordDiff(context.current[key], context.saved[key]),
    },
  ];
}

/** A single-choice field. `describe` reads the whole draft because some
 *  choices (the pricing mode) are derived from more than their own key. */
export function choiceField(
  context: RestoreDiffContext,
  key: keyof ListingDraft,
  describe: (draft: ListingDraft) => string,
): FieldChanges {
  if (!isFieldChanged(context, key)) return [];
  return [
    {
      kind: "choice",
      key,
      labelKey: fieldLabelKey(key),
      before: describe(context.current),
      after: describe(context.saved),
    },
  ];
}

/**
 * A multi-pick field, reported as what bringing the copy back would add and
 * remove. Order is visible too (the first category is the main one on the
 * directory card, and tags and languages print in stored order), so a list
 * holding the same values in a new order shows both orders in full. For
 * categories that change is named as the category order, since it can swap
 * which one leads, and a new leading category is named on its own.
 */
export function setField(
  context: RestoreDiffContext,
  key: StringListFieldKey,
  describe: (value: string) => string,
): FieldChanges {
  if (!isFieldChanged(context, key)) return [];
  const before = context.current[key];
  const after = context.saved[key];
  const { added, removed } = diffStringLists(before, after);
  if (added.length === 0 && removed.length === 0) {
    return [
      {
        kind: "choice",
        key,
        labelKey: fieldLabelKey(key === "cats" ? "catsOrder" : key),
        before: before.map(describe).join(LIST_SEPARATOR),
        after: after.map(describe).join(LIST_SEPARATOR),
      },
    ];
  }
  const setChange: RestoreFieldChange = {
    kind: "set",
    key,
    labelKey: fieldLabelKey(key),
    added: added.map(describe),
    removed: removed.map(describe),
  };
  const mainBefore = before[0];
  const mainAfter = after[0];
  // Adding "Café" in front of "Bar" also makes Café the main category, which
  // the added and removed lists alone never say. When both sides have one and
  // it differs, the new main category gets an entry of its own.
  const isMainCategoryChanged =
    key === "cats" &&
    mainBefore !== undefined &&
    mainAfter !== undefined &&
    mainBefore !== mainAfter;
  if (!isMainCategoryChanged) return [setChange];
  return [
    setChange,
    {
      kind: "choice",
      key: "cats.main",
      labelKey: fieldLabelKey("mainCategory"),
      before: describe(mainBefore),
      after: describe(mainAfter),
    },
  ];
}

/** Segments that mark a whole paragraph as added or removed. */
function wholeText(
  kind: "added" | "removed",
  text: string,
): RestoreParagraphChange["segments"] {
  return text ? [{ kind, text }] : [];
}

/** The description, matched paragraph by paragraph on position. Positions
 *  are shared by both sides here, so one `position` serves every status. */
export function paragraphsField(context: RestoreDiffContext): FieldChanges {
  if (!isFieldChanged(context, "whatItIs")) return [];
  const before = context.current.whatItIs;
  const after = context.saved.whatItIs;
  const paragraphs: RestoreParagraphChange[] = [];
  const paragraphCount = Math.max(before.length, after.length);
  for (let index = 0; index < paragraphCount; index += 1) {
    const beforeLine = before[index];
    const afterLine = after[index];
    const position = index + 1;
    const key = `paragraph-${position}`;
    if (beforeLine && afterLine) {
      if (beforeLine.text === afterLine.text) continue;
      const segments = wordDiff(beforeLine.text, afterLine.text);
      paragraphs.push({ key, status: "changed", position, segments });
    } else if (afterLine) {
      const segments = wholeText("added", afterLine.text);
      paragraphs.push({ key, status: "added", position, segments });
    } else if (beforeLine) {
      const segments = wholeText("removed", beforeLine.text);
      paragraphs.push({ key, status: "removed", position, segments });
    }
  }
  if (paragraphs.length === 0) return [];
  return [
    {
      kind: "paragraphs",
      key: "whatItIs",
      labelKey: fieldLabelKey("whatItIs"),
      paragraphs,
    },
  ];
}

export function isPinned(draft: ListingDraft): boolean {
  return draft.latitude !== null && draft.longitude !== null;
}

function pinLabel(t: TFunction, draft: ListingDraft): string {
  if (!isPinned(draft)) return t(`${DIFF_KEY_PREFIX}.pin.none`);
  return t(
    `${DIFF_KEY_PREFIX}.pin.${draft.geocoded ? "exact" : "approximate"}`,
  );
}

/**
 * The three map-pin columns as ONE change. An address lookup moves all three
 * together, and the history already names them as one thing, so listing
 * them separately would count one edit three times. A pin that moved but
 * kept its kind says so, since "Pinned" to "Pinned" tells the reader nothing.
 */
export function mapPinField(context: RestoreDiffContext): FieldChanges {
  const { current, saved, t } = context;
  const isPinChanged = (["geocoded", "latitude", "longitude"] as const).some(
    (key) => isFieldChanged(context, key),
  );
  if (!isPinChanged) return [];
  const before = pinLabel(t, current);
  let after = pinLabel(t, saved);
  if (before === after) {
    // Neither side is pinned: only the unseen geocoded flag differs.
    if (!isPinned(saved)) return [];
    after = t(`${DIFF_KEY_PREFIX}.pin.moved`);
  }
  return [
    {
      kind: "choice",
      key: "mapPin",
      labelKey: fieldLabelKey("mapPin"),
      before,
      after,
    },
  ];
}

/** Each contact link is its own field, so a changed phone number is not
 *  buried in a block that also lists three untouched links. */
export function socialFields(context: RestoreDiffContext): FieldChanges {
  const before = context.current.social;
  const after = context.saved.social;
  return SOCIAL_FIELDS.filter(
    (social) => before[social.key] !== after[social.key],
  ).map((social): RestoreFieldChange => ({
    kind: "text",
    key: `social.${social.key}`,
    labelKey: fieldLabelKey(social.key),
    segments: wordDiff(before[social.key], after[social.key]),
  }));
}

/** A structured field as a list of changed rows, or nothing when no row
 *  differs (the safety net in `buildRestoreDiff` then covers the field). */
export function rowsField(
  key: string,
  labelKey: string,
  rows: RestoreRowChange[],
): FieldChanges {
  if (rows.length === 0) return [];
  return [{ kind: "rows", key, labelKey, rows }];
}

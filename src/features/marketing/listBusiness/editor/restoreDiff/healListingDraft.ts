import {
  DAYS,
  normalizeDayHours,
  normalizeHoursException,
  type DayHours,
  type HoursException,
  type ListingDraft,
} from "../../listBusiness.data";
import { toMenuDraft } from "../../listingMenu.data";

/**
 * A draft read back from local storage, made safe to compare.
 *
 * The autosave slot hands back whatever an earlier build of the editor wrote,
 * and the review and the fingerprint both walk every field of it. A copy from
 * before a field existed, or one a browser extension mangled, still reads as
 * a complete draft here, so the editor keeps working. A well-formed draft comes
 * back with every value as it was (same text, same row ids), so healing an
 * editor draft is a no-op in everything the review compares or restores.
 */

const STRING_KEYS = [
  "path",
  "name",
  "hood",
  "badge",
  "evidence",
  "price",
  "blurb",
  "tagline",
  "address",
  "hoursNote",
  "rel",
  "ownerName",
  "ownerRole",
  "ownerBio",
] as const satisfies ReadonlyArray<keyof ListingDraft>;

const STRING_LIST_KEYS = ["cats", "tags", "goodFor", "langs"] as const;

const EMPTY_SOCIAL: ListingDraft["social"] = {
  instagram: "",
  website: "",
  email: "",
  phone: "",
};

const EMPTY_PHOTO_SLOTS: ListingDraft["photos"] = {
  wide: "",
  d1: "",
  d2: "",
  vibe: "",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

/** Already in the editor's own shape, so it is kept exactly as it is. */
function isDayHours(value: unknown): value is DayHours {
  if (!isRecord(value)) return false;
  return (
    typeof value.open === "boolean" &&
    Array.isArray(value.intervals) &&
    value.intervals.every(
      (interval) =>
        isRecord(interval) &&
        typeof interval.from === "string" &&
        typeof interval.to === "string",
    )
  );
}

function isHoursException(value: unknown): value is HoursException {
  return (
    isRecord(value) &&
    isDayHours(value) &&
    typeof value.date === "string" &&
    typeof value.note === "string"
  );
}

function healedHours(raw: unknown): ListingDraft["hours"] {
  const days = isRecord(raw) ? raw : {};
  return Object.fromEntries(
    DAYS.map((day): [string, DayHours] => {
      const value = days[day.id];
      return [day.id, isDayHours(value) ? value : normalizeDayHours(value)];
    }),
  );
}

function healedExceptions(raw: unknown): HoursException[] | undefined {
  if (raw === undefined) return undefined;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) =>
      isHoursException(entry) ? entry : normalizeHoursException(entry),
    )
    .filter((entry): entry is HoursException => entry !== null);
}

function healedMenu(raw: unknown): ListingDraft["menu"] {
  if (raw === undefined || raw === null) return undefined;
  const menu = raw as ListingDraft["menu"];
  const isWellFormed =
    isRecord(raw) &&
    Array.isArray(raw.sections) &&
    raw.sections.every(
      (section) =>
        isRecord(section) &&
        Array.isArray(section.items) &&
        section.items.every(isRecord),
    );
  return isWellFormed ? menu : toMenuDraft(raw);
}

export function healListingDraft(draft: ListingDraft): ListingDraft {
  const healed = { ...draft } as ListingDraft & Record<string, unknown>;
  for (const key of STRING_KEYS) {
    if (typeof healed[key] !== "string") healed[key] = "";
  }
  for (const key of STRING_LIST_KEYS) {
    healed[key] = stringList(draft[key]);
  }
  if (typeof healed.visibility !== "string") healed.visibility = "public";
  healed.whatItIs = Array.isArray(draft.whatItIs)
    ? draft.whatItIs.filter(
        (line) => isRecord(line) && typeof line.text === "string",
      )
    : [];
  // Rows are destructured later (ids stripped for comparison), so a stray
  // null or string in a mangled slot has to go before it gets there.
  healed.services = Array.isArray(draft.services)
    ? draft.services.filter(isRecord)
    : undefined;
  healed.menu = healedMenu(draft.menu);
  healed.hours = healedHours(draft.hours);
  healed.hoursExceptions = healedExceptions(draft.hoursExceptions);
  healed.social = { ...EMPTY_SOCIAL, ...draft.social };
  healed.photos = { ...EMPTY_PHOTO_SLOTS, ...draft.photos };
  healed.alt = { ...EMPTY_PHOTO_SLOTS, ...draft.alt };
  if (typeof healed.latitude !== "number") healed.latitude = null;
  if (typeof healed.longitude !== "number") healed.longitude = null;
  return healed;
}

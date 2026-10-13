import {
  COVER_FREE_BEFORE_PATTERN,
  LISTING_COVER_POLICIES,
  LISTING_ENTRY_MODES,
  normalizeCoverPolicy,
  normalizeEntryMode,
  type ListingCoverPolicy,
  type ListingEntryMode,
} from "../listingFacts.data";

/** The radio value for an unanswered question. */
export const NOT_SAYING = "notSaying" as const;
export const NOT_SAYING_LABEL_KEY = "marketing:listBusiness.step3.notSaying";

/** The inline error under "Free until" once the time is left empty. */
export const FREE_BEFORE_TIME_ERROR_KEY =
  "marketing:listBusiness.step3.cover.timeError";

/** The ids a fact question's legend and helper carry, derived from its
 *  anchor (one per page), so the choices inside can point at them. */
export function factFieldsetIds(anchor: string): {
  legendId: string;
  helperId: string;
} {
  return { legendId: `${anchor}-legend`, helperId: `${anchor}-helper` };
}

export type EntryChoice = ListingEntryMode | typeof NOT_SAYING;
export const ENTRY_CHOICES: readonly EntryChoice[] = [
  ...LISTING_ENTRY_MODES,
  NOT_SAYING,
];

export type CoverChoice = ListingCoverPolicy | typeof NOT_SAYING;
export const COVER_CHOICES: readonly CoverChoice[] = [
  ...LISTING_COVER_POLICIES,
  NOT_SAYING,
];

export type NifChoice = "yes" | "no" | typeof NOT_SAYING;
export const NIF_CHOICES: readonly NifChoice[] = ["yes", "no", NOT_SAYING];
export const NIF_CHOICE_LABEL_KEYS: Record<NifChoice, string> = {
  yes: "marketing:listingFacts.nif.yes",
  no: "marketing:listingFacts.nif.no",
  notSaying: NOT_SAYING_LABEL_KEY,
};

export function entryChoiceOf(raw: unknown): EntryChoice {
  return normalizeEntryMode(raw) ?? NOT_SAYING;
}

export function entryModeOf(choice: EntryChoice): ListingEntryMode | null {
  return choice === NOT_SAYING ? null : choice;
}

export function coverChoiceOf(raw: unknown): CoverChoice {
  return normalizeCoverPolicy(raw) ?? NOT_SAYING;
}

export function coverPolicyOf(choice: CoverChoice): ListingCoverPolicy | null {
  return choice === NOT_SAYING ? null : choice;
}

/** "Free before a set time" is picked and the time is still empty (or not a
 *  24-hour `HH:MM`), which holds the save (`factMissingFields`). */
export function isFreeBeforeTimeMissing(
  choice: CoverChoice,
  time: string | undefined,
): boolean {
  return choice === "freeBefore" && !COVER_FREE_BEFORE_PATTERN.test(time ?? "");
}

export function nifChoiceOf(value: boolean | null | undefined): NifChoice {
  if (value === true) return "yes";
  if (value === false) return "no";
  return NOT_SAYING;
}

export function nifValueOf(choice: NifChoice): boolean | null {
  if (choice === "yes") return true;
  if (choice === "no") return false;
  return null;
}

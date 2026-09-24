import type { SubprofileSectionView } from "../../api/subprofiles.adapters";
import type {
  SkinData,
  SubprofileKind,
  TherapistOnline,
  TherapistStatus,
  TherapistTravel,
  TherapyFees,
} from "../../api/subprofiles.api";
import { personaAddressName } from "../../subprofile-kinds";

/** Colour of a specialty group's bullets. Cycles in this order. */
export type SpecialtyTone = "accent" | "jade" | "violet";

/** One specialty group: a `specialisms` item, its description split into
 *  one bullet per line. */
export interface TherapistSpecialtyGroup {
  heading: string;
  bullets: string[];
  tone: SpecialtyTone;
}

/** A completeness check. Each key is the suffix of an i18n key:
 *  `t("subprofiles:therapist.completeness.<key>")`. */
export type TherapistCompletenessKey =
  | "portrait"
  | "quote"
  | "approach"
  | "specialties"
  | "fees"
  | "availability"
  | "faq"
  | "firstSession"
  | "access";

export interface TherapistCompleteness {
  /** Whole number, 0 to 100. */
  percent: number;
  /** Unfilled checks, in the order listed in `COMPLETENESS_ORDER`. */
  missing: TherapistCompletenessKey[];
}

/** One insurer row, with the euros back per session parsed to a number. */
export interface TherapistReimbursement {
  label: string;
  amount: number;
}

const SPECIALTY_TONES: SpecialtyTone[] = ["accent", "jade", "violet"];

const COMPLETENESS_ORDER: TherapistCompletenessKey[] = [
  "portrait",
  "quote",
  "approach",
  "specialties",
  "fees",
  "availability",
  "faq",
  "firstSession",
  "access",
];

const STATUSES: TherapistStatus[] = ["open", "wait", "closed"];

/** First number in an owner-typed amount ("65", "€60 per session", "12,5").
 *  `null` when the text holds no number. */
export function parseAmount(text: string | null | undefined): number | null {
  if (!text) return null;
  const digits = /\d+(?:[.,]\d+)?/.exec(text)?.[0];
  if (!digits) return null;
  const amount = Number(digits.replace(",", "."));
  return Number.isFinite(amount) ? amount : null;
}

/** Owner-typed text, trimmed. Tolerates a key missing from older jsonb. */
export function trimText(value: string | null | undefined): string {
  return (value ?? "").trim();
}

/** Trimmed, non-empty entries of an optional string list. */
export function cleanList(list: string[] | null | undefined): string[] {
  return (list ?? []).map((entry) => entry.trim()).filter(Boolean);
}

/** "Portuguese, English , Spanish" becomes three trimmed entries. */
export function splitCommaList(text: string | null | undefined): string[] {
  return cleanList((text ?? "").split(","));
}

/** A list field in either stored shape: the multi-select's list (option ids
 *  and the owner's own text), cleaned like `cleanList`, or an older
 *  comma-separated string, split like `splitCommaList`. */
export function storedList(
  value: string | string[] | null | undefined,
): string[] {
  if (!Array.isArray(value)) return splitCommaList(value);
  return cleanList(
    value.filter((entry): entry is string => typeof entry === "string"),
  );
}

/** Keeps the entries of an object list where `field` has text. */
export function keepFilled<Entry>(
  list: Entry[] | null | undefined,
  field: keyof Entry,
): Entry[] {
  return (list ?? []).filter((entry) => {
    const value = entry[field];
    return typeof value === "string" && value.trim() !== "";
  });
}

export function toStatus(value: string | null | undefined): TherapistStatus {
  return STATUSES.find((status) => status === value) ?? "open";
}

/** The stated online answer. Only a persona whose `therapist` key was never
 *  written (undefined) falls back to a guess from the older `practical.mode`
 *  text ("In person in Anjos, or online"). A cleared block (`null`) and a ""
 *  answer inside the block both mean "not said" and give "". */
export function resolveOnline(skinData: SkinData): TherapistOnline {
  const facts = skinData.therapist;
  if (facts === undefined) {
    return /online/i.test(skinData.practical?.mode ?? "") ? "yes" : "";
  }
  const stated = facts?.online;
  return stated === "yes" || stated === "no" ? stated : "";
}

// Leading titles to skip when picking a first name or initials, with or
// without the dot: Dr, Dra, Prof, Profª, Profa, Mx, Ms, Mr, Mrs.
const HONORIFIC_PREFIX = /^(?:dra?|prof(?:ª|a)?|mx|ms|mrs?)\.?\s+/i;

/** "Dr. Marta Reis" becomes "Marta Reis". Repeats, so "Prof. Dr. Ana Lima"
 *  becomes "Ana Lima". A name that is only a title comes back unchanged. */
export function stripHonorifics(name: string): string {
  let remaining = name.trim();
  while (HONORIFIC_PREFIX.test(remaining)) {
    remaining = remaining.replace(HONORIFIC_PREFIX, "").trim();
  }
  return remaining || name.trim();
}

/** Avatar initials for a person's name, skipping a leading title: first
 *  letter of the first and last words, upper-cased ("Dr. Marta Reis" is
 *  "MR"). One word gives one letter; an empty name gives "". */
export function initialsFor(name: string): string {
  const words = stripHonorifics(name).split(/\s+/).filter(Boolean);
  const first = words[0];
  if (!first) return "";
  const last = words.length > 1 ? words[words.length - 1] : undefined;
  const firstLetter = Array.from(first)[0] ?? "";
  const lastLetter = last ? (Array.from(last)[0] ?? "") : "";
  return (firstLetter + lastLetter).toUpperCase();
}

/** The first name to address the therapist by ("Message Sofia"). A persona
 *  still named after its kind ("Therapist") is addressed by the owner's
 *  first name, via `personaAddressName`; a leading title is skipped. Falls
 *  back to the display name as stored. */
export function therapistFirstName({
  displayName,
  kind,
  ownerName,
}: {
  displayName: string;
  kind: SubprofileKind;
  ownerName?: string;
}): string {
  // `personaAddressName` keeps only the owner's first word, so a title has
  // to go first: owner "Dr. Ana Lima" is addressed as "Ana".
  const addressName = personaAddressName({
    displayName,
    kind,
    ownerName: ownerName === undefined ? undefined : stripHonorifics(ownerName),
  });
  const firstWord = stripHonorifics(addressName).split(/\s+/)[0];
  return firstWord || displayName.trim();
}

export function buildSlidingRange(
  minText: string | undefined,
  maxText: string | undefined,
  standardFee: number | null,
): [number, number] | null {
  const low = parseAmount(minText);
  if (low === null) return null;
  const high = parseAmount(maxText) ?? standardFee ?? low;
  return [low, Math.max(low, high)];
}

export function buildReimbursement(
  rows: { label: string; value: string }[] | null | undefined,
): TherapistReimbursement[] {
  return keepFilled(rows, "label").map((row) => ({
    label: row.label.trim(),
    amount: parseAmount(row.value) ?? 0,
  }));
}

/** The in-person place; null when neither a name nor an address line is set. */
export function buildVenue(
  skinData: SkinData,
): { name: string; lines: string[] } | null {
  const venue = skinData.venue;
  if (!venue) return null;
  const lines = cleanList(venue.lines);
  const name = trimText(venue.name);
  return name || lines.length > 0 ? { name, lines } : null;
}

/** Stored payment choices, trimmed, without empties or repeats, in the
 *  owner's order. `[]` when the key is missing or not a list. */
function cleanPaymentMethods(methods: unknown): string[] {
  if (!Array.isArray(methods)) return [];
  const texts = methods.filter(
    (method): method is string => typeof method === "string",
  );
  return [...new Set(cleanList(texts))];
}

/** Fee small print with every key present and trimmed, so a key missing
 *  from older jsonb reads as "" (or `[]` for the payment choices). */
export function normalizeFees(
  fees: TherapyFees | null | undefined,
): Required<TherapyFees> | null {
  if (!fees) return null;
  return {
    standard: trimText(fees.standard),
    slidingMin: trimText(fees.slidingMin),
    slidingMax: trimText(fees.slidingMax),
    slidingPlaces: trimText(fees.slidingPlaces),
    slidingOpen: trimText(fees.slidingOpen),
    slidingRules: trimText(fees.slidingRules),
    firstContact: trimText(fees.firstContact),
    frequency: trimText(fees.frequency),
    receipts: trimText(fees.receipts),
    receiptTime: trimText(fees.receiptTime),
    paymentMethods: cleanPaymentMethods(fees.paymentMethods),
    payment: trimText(fees.payment),
    cancellationNotice: trimText(fees.cancellationNotice),
    cancellation: trimText(fees.cancellation),
  };
}

/** Getting-there notes, trimmed; null when all four are empty. */
export function normalizeTravel(
  travel: TherapistTravel | null | undefined,
): TherapistTravel | null {
  if (!travel) return null;
  const normalized: TherapistTravel = {
    metro: trimText(travel.metro),
    bus: trimText(travel.bus),
    bike: trimText(travel.bike),
    entrance: trimText(travel.entrance),
  };
  return Object.values(normalized).some(Boolean) ? normalized : null;
}

/** Specialty groups from the persona's `specialisms` section: item title is
 *  the heading, each non-empty line of the description is a bullet. */
export function buildSpecialtyGroups(
  sections: SubprofileSectionView[],
): TherapistSpecialtyGroup[] {
  const specialisms = sections.find(
    (section) => section.section === "specialisms",
  );
  const groups = (specialisms?.items ?? [])
    .map((item) => ({
      heading: item.title.trim(),
      bullets: cleanList(item.description.split(/\r?\n/)),
    }))
    .filter((group) => group.heading !== "" || group.bullets.length > 0);
  return groups.map((group, index) => ({
    ...group,
    tone: SPECIALTY_TONES[index % SPECIALTY_TONES.length] ?? "accent",
  }));
}

export function computeCompleteness(
  checks: Record<TherapistCompletenessKey, boolean>,
): TherapistCompleteness {
  const missing = COMPLETENESS_ORDER.filter((key) => !checks[key]);
  const filledCount = COMPLETENESS_ORDER.length - missing.length;
  return {
    percent: Math.round((filledCount / COMPLETENESS_ORDER.length) * 100),
    missing,
  };
}

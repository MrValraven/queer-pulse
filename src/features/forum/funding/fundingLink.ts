import { FUNDRAISING_HOSTS } from "./funding.data";

const MAX_LINK_LENGTH = 2048;
const MAX_LINK_KEY_LENGTH = 512;
const TRACKING_PARAMETER_NAMES = ["fbclid", "gclid", "igshid", "ref"];

/** Plain code-point order, so a key never depends on the browser's locale. */
function compareCodePoints(first: string, second: string): number {
  if (first < second) return -1;
  return first > second ? 1 : 0;
}

function isTrackingParameter(name: string): boolean {
  const lowered = name.toLowerCase();
  return (
    lowered.startsWith("utm_") ||
    lowered.startsWith("mc_") ||
    TRACKING_PARAMETER_NAMES.includes(lowered)
  );
}

/** The URL when it parses and passes the backend's shape rules: https, no
 *  credentials, a dotted host with no empty label, at most 2048 characters. */
export function parseHttpsUrl(raw: string): URL | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > MAX_LINK_LENGTH) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:") return null;
    if (url.username || url.password) return null;
    const hostname = url.hostname.toLowerCase();
    if (!hostname.includes(".")) return null;
    if (hostname.split(".").some((label) => label === "")) return null;
    // Percent-encoding can grow a short input past the limit.
    if (url.href.length > MAX_LINK_LENGTH) return null;
    return url;
  } catch {
    return null;
  }
}

/** Mirror of the backend's `stripLeadingWww`: a hostname with one leading
 *  `www.` removed, the one spelling of a funding link's host. */
export function stripLeadingWww(hostname: string): string {
  return hostname.startsWith("www.") ? hostname.slice(4) : hostname;
}

function bareHost(url: URL): string {
  return stripLeadingWww(url.hostname.toLowerCase());
}

/** The host a donor or applicant lands on, as the safety strip names it. */
export function fundingLinkHost(raw: string): string | null {
  const url = parseHttpsUrl(raw);
  return url ? bareHost(url) : null;
}

/** Mirror of the backend's `link_key`: lowercased host without "www.", the
 *  path without its trailing slash, then the query parameters that are not
 *  tracking ones (utm_*, mc_*, fbclid, gclid, igshid, ref), sorted; the
 *  fragment is dropped. Only the demo duplicate lookup reads it; live sends
 *  the raw link to the server. */
export function fundingLinkKey(raw: string): string | null {
  const url = parseHttpsUrl(raw);
  if (!url) return null;
  const keptParameters = [...url.searchParams.entries()]
    .filter(([name]) => !isTrackingParameter(name))
    .sort(([nameA, valueA], [nameB, valueB]) =>
      nameA === nameB
        ? compareCodePoints(valueA, valueB)
        : compareCodePoints(nameA, nameB),
    );
  const query =
    keptParameters.length > 0
      ? `?${new URLSearchParams(keptParameters).toString()}`
      : "";
  const key = `${bareHost(url)}${url.pathname.replace(/\/+$/, "")}${query}`;
  return key.length > MAX_LINK_KEY_LENGTH ? null : key;
}

/** A fundraiser link: an allow-listed host (or "www." plus one), no explicit
 *  port. */
export function isAllowedFundraisingHost(raw: string): boolean {
  const url = parseHttpsUrl(raw);
  if (!url || url.port !== "") return false;
  const host = url.hostname.toLowerCase();
  return FUNDRAISING_HOSTS.some(
    (entry) => host === entry || host === `www.${entry}`,
  );
}

export type PaymentDetailKind = "iban" | "phone";

/**
 * Mirror of the backend's `IBAN_LENGTH_BY_COUNTRY` (forum-funding.ts), copied
 * verbatim: the IBAN length of every country in the ISO 13616 registry (SWIFT,
 * release of 2025), keyed by the ISO 3166 code an IBAN opens with. A candidate
 * is tested at exactly its country's length, and a code missing here is no
 * IBAN at all, which keeps "PT2030 1000 2024 150 30 month" and "Covid19
 * grants" out of the payment-details rule.
 */
export const IBAN_LENGTH_BY_COUNTRY: Readonly<Record<string, number>> = {
  AD: 24,
  AE: 23,
  AL: 28,
  AT: 20,
  AZ: 28,
  BA: 20,
  BE: 16,
  BG: 22,
  BH: 22,
  BI: 27,
  BR: 29,
  BY: 28,
  CH: 21,
  CR: 22,
  CY: 28,
  CZ: 24,
  DE: 22,
  DJ: 27,
  DK: 18,
  DO: 28,
  EE: 20,
  EG: 29,
  ES: 24,
  FI: 18,
  FK: 18,
  FO: 18,
  FR: 27,
  GB: 22,
  GE: 22,
  GI: 23,
  GL: 18,
  GR: 27,
  GT: 28,
  HN: 28,
  HR: 21,
  HU: 28,
  IE: 22,
  IL: 23,
  IQ: 23,
  IS: 26,
  IT: 27,
  JO: 30,
  KW: 30,
  KZ: 20,
  LB: 28,
  LC: 32,
  LI: 21,
  LT: 20,
  LU: 20,
  LV: 21,
  LY: 25,
  MC: 27,
  MD: 24,
  ME: 22,
  MK: 19,
  MN: 20,
  MR: 27,
  MT: 31,
  MU: 30,
  NI: 28,
  NL: 18,
  NO: 15,
  OM: 23,
  PK: 24,
  PL: 28,
  PS: 29,
  PT: 25,
  QA: 29,
  RO: 24,
  RS: 22,
  RU: 33,
  SA: 24,
  SC: 31,
  SD: 18,
  SE: 24,
  SI: 19,
  SK: 24,
  SM: 27,
  SO: 23,
  ST: 25,
  SV: 28,
  TL: 23,
  TN: 24,
  TR: 26,
  UA: 29,
  VA: 22,
  VG: 24,
  XK: 20,
  YE: 30,
};

// Mirrors of the backend's body check, copied from forum-funding.ts. An IBAN
// candidate is two letters (any case) and two digits, then 11 to 30 more
// characters, each optionally preceded by up to three separators (space,
// NBSP, narrow NBSP, dot or dash). A preceding digit blocks a start; a
// preceding letter does not, so "IBANpt50..." glued to a label still matches.
// The zero-width lookahead capture lets every start position be tried, so an
// earlier look-alike ("PT2030", "AB12") never masks a real IBAN after it.
// The part after the country code and check digits must hold at least 8
// digits, and the candidate, read at exactly its country's length and ending
// on a word boundary, must pass the ISO 7064 mod-97 check.
const IBAN_CANDIDATE_PATTERN =
  /(?<![0-9])(?=([A-Za-z]{2}\d{2}(?:[ \u00A0\u202F.-]{0,3}[A-Za-z0-9]){11,30}))/g;
const MIN_IBAN_BBAN_DIGITS = 8;
const ALPHANUMERIC_PATTERN = /[A-Za-z0-9]/;
/** Mirror of the backend's `PT_MOBILE_PATTERN`: a Portuguese mobile (91, 92,
 *  93 or 96), with or without +351 / 00351, written solid or grouped 3-3-3,
 *  2-3-4 or 2-3-2-2, with up to three spaces, dashes or dots between groups. */
const PORTUGUESE_MOBILE_PATTERN =
  /(?:(?:\+|00)351[\s.-]{0,3}|(?<!\d))9[1236](?:\d[\s.-]{0,3}\d{3}[\s.-]{0,3}\d{3}|[\s.-]{0,3}\d{3}[\s.-]{0,3}\d{4}|[\s.-]{0,3}\d{3}[\s.-]{0,3}\d{2}[\s.-]{0,3}\d{2})(?!\d)/;

function hasValidIbanChecksum(compact: string): boolean {
  const rearranged = compact.slice(4) + compact.slice(0, 4);
  let remainder = 0;
  for (const character of rearranged) {
    const digits = /\d/.test(character)
      ? character
      : String(character.toUpperCase().charCodeAt(0) - 55);
    for (const digit of digits) {
      remainder = (remainder * 10 + Number(digit)) % 97;
    }
  }
  return remainder === 1;
}

function hasIban(text: string): boolean {
  for (const match of text.matchAll(IBAN_CANDIDATE_PATTERN)) {
    const candidate = match[1] ?? "";
    const countryCode = candidate.slice(0, 2).toUpperCase();
    const ibanLength = IBAN_LENGTH_BY_COUNTRY[countryCode];
    if (ibanLength === undefined) continue;
    const characterPositions: number[] = [];
    for (let offset = 0; offset < candidate.length; offset += 1) {
      if (ALPHANUMERIC_PATTERN.test(candidate.charAt(offset))) {
        characterPositions.push(match.index + offset);
      }
    }
    const lastPosition = characterPositions[ibanLength - 1];
    if (lastPosition === undefined) continue;
    const nextCharacter = text.charAt(lastPosition + 1);
    const isAtBoundary =
      nextCharacter === "" || !ALPHANUMERIC_PATTERN.test(nextCharacter);
    if (!isAtBoundary) continue;
    const compact = characterPositions
      .slice(0, ibanLength)
      .map((position) => text.charAt(position))
      .join("");
    const basicAccountNumber = compact.slice(4);
    const digitCount = basicAccountNumber.replace(/\D/g, "").length;
    if (digitCount >= MIN_IBAN_BBAN_DIGITS && hasValidIbanChecksum(compact)) {
      return true;
    }
  }
  return false;
}

export function findPaymentDetails(text: string): PaymentDetailKind | null {
  if (hasIban(text)) return "iban";
  if (PORTUGUESE_MOBILE_PATTERN.test(text)) return "phone";
  return null;
}

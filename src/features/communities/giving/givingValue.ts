import type { CommunityGivingKind } from "../api/communityGiving.api";
import {
  hasValidIbanChecksum,
  IBAN_LENGTH_BY_COUNTRY,
  parseHttpsUrl,
} from "../../forum/funding/fundingLink";
import { safeHref } from "../../../shared/lib/safeHref";
import { GIVING_LIMITS } from "./givingConstants";

/**
 * Value rules for a community's support section, mirroring the backend's
 * `community-giving-rules.ts` so the editor can refuse a value before Save.
 * The server stays authoritative. Nothing here logs or tracks a value.
 */

export type GivingFieldError =
  "required" | "invalidLink" | "invalidMbway" | "invalidIban" | "tooLong";

/** A bare host with at least one dot, an optional port, then a path, query,
 *  fragment or the end: input like `ko-fi.com/runners` typed without a
 *  scheme. A colon before the first dot (`javascript:`, `http:`) never
 *  matches, so another scheme is never rewritten. */
const SCHEMELESS_HOST_PATTERN =
  /^[\p{L}\p{N}-]+(?:\.[\p{L}\p{N}-]+)+(?::\d+)?(?:[/?#]|$)/u;

/** Mirror of the backend's whole-value MB WAY rule: its `PT_MOBILE_PATTERN`
 *  (91, 92, 93 or 96, optional +351 / 00351, solid or grouped 3-3-3, 2-3-4
 *  or 2-3-2-2 with up to three spaces, dots or dashes between groups)
 *  anchored so the field holds one number and nothing else. */
const MBWAY_WHOLE_VALUE_PATTERN =
  /^(?:(?:\+|00)351[\s.-]{0,3}|(?<!\d))9[1236](?:\d[\s.-]{0,3}\d{3}[\s.-]{0,3}\d{3}|[\s.-]{0,3}\d{3}[\s.-]{0,3}\d{4}|[\s.-]{0,3}\d{3}[\s.-]{0,3}\d{2}[\s.-]{0,3}\d{2})$/;
const MBWAY_NATIONAL_DIGITS = 9;

/** An optional leading `IBAN` or `IBAN:` label, in any case. */
const IBAN_LABEL_PREFIX_PATTERN = /^IBAN[\s:]*/i;
/** Spaces (NBSP and narrow NBSP included, both match `\s`), dots, dashes. */
const IBAN_SEPARATOR_PATTERN = /[\s.-]/g;
const IBAN_SHAPE_PATTERN = /^[A-Z]{2}\d{2}[A-Z0-9]+$/;

const INVALID_ERROR_BY_KIND: Record<CommunityGivingKind, GivingFieldError> = {
  link: "invalidLink",
  mbway: "invalidMbway",
  iban: "invalidIban",
};

/** Mirror of the backend's `HTTPS_SCHEME_PREFIX_PATTERN`: the value starts
 *  with `https://` in any case. */
const HTTPS_SCHEME_PREFIX_PATTERN = /^https:\/\//i;
const ASCII_SPACE_CODE = 0x20;
const ASCII_DELETE_CODE = 0x7f;

/** Mirror of the backend's `hasWhitespaceOrControlCharacter`: whether the
 *  value holds an ASCII space, tab, line break or other control character
 *  (U+0000 to U+0020, U+007F) anywhere. `new URL()` strips or encodes these,
 *  so the parser alone would pass a value the server refuses. */
function hasWhitespaceOrControlCharacter(value: string): boolean {
  for (let position = 0; position < value.length; position += 1) {
    const characterCode = value.charCodeAt(position);
    if (
      characterCode <= ASCII_SPACE_CODE ||
      characterCode === ASCII_DELETE_CODE
    ) {
      return true;
    }
  }
  return false;
}

/** The trimmed input with `https://` in front when it was typed as a bare
 *  host; anything else comes back unchanged. */
function withHttpsScheme(trimmed: string): string {
  return SCHEMELESS_HOST_PATTERN.test(trimmed) ? `https://${trimmed}` : trimmed;
}

/**
 * An https link as the owner typed it (trimmed, `https://` added to a bare
 * host), or null for any other scheme, credentials in the URL, a host
 * without a dot, ASCII whitespace or control characters anywhere, or more
 * than `GIVING_LIMITS.valueMax` characters.
 */
export function normalizeGivingLink(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const candidate = withHttpsScheme(trimmed);
  if (candidate.length > GIVING_LIMITS.valueMax) return null;
  if (!HTTPS_SCHEME_PREFIX_PATTERN.test(candidate)) return null;
  if (hasWhitespaceOrControlCharacter(candidate)) return null;
  if (parseHttpsUrl(candidate) === null || safeHref(candidate) === null) {
    return null;
  }
  return candidate;
}

/** A Portuguese mobile as its 9 national digits, or null. */
export function normalizeMbwayNumber(raw: string): string | null {
  const trimmed = raw.trim();
  if (!MBWAY_WHOLE_VALUE_PATTERN.test(trimmed)) return null;
  return trimmed.replace(/\D/g, "").slice(-MBWAY_NATIONAL_DIGITS);
}

/** An IBAN uppercase with no separators when its country is known, its
 *  length matches that country and the mod-97 checksum passes; else null. */
export function normalizeIban(raw: string): string | null {
  const compact = raw
    .trim()
    .replace(IBAN_LABEL_PREFIX_PATTERN, "")
    .replace(IBAN_SEPARATOR_PATTERN, "")
    .toUpperCase();
  if (!IBAN_SHAPE_PATTERN.test(compact)) return null;
  const expectedLength = IBAN_LENGTH_BY_COUNTRY[compact.slice(0, 2)];
  if (expectedLength === undefined || compact.length !== expectedLength) {
    return null;
  }
  return hasValidIbanChecksum(compact) ? compact : null;
}

/** The value the editor sends for a kind, or null when it is refused. */
export function normalizeGivingValue(
  kind: CommunityGivingKind,
  raw: string,
): string | null {
  if (kind === "link") return normalizeGivingLink(raw);
  if (kind === "mbway") return normalizeMbwayNumber(raw);
  return normalizeIban(raw);
}

/** The first problem with a value, or null when it can be saved. */
export function givingValueError(
  kind: CommunityGivingKind,
  raw: string,
): GivingFieldError | null {
  const trimmed = raw.trim();
  if (!trimmed) return "required";
  const sentLength =
    kind === "link" ? withHttpsScheme(trimmed).length : trimmed.length;
  if (sentLength > GIVING_LIMITS.valueMax) return "tooLong";
  return normalizeGivingValue(kind, raw) === null
    ? INVALID_ERROR_BY_KIND[kind]
    : null;
}

/** 9 digits shown as `912 345 678`; any other input comes back unchanged. */
export function formatMbwayNumber(digits: string): string {
  if (!/^\d{9}$/.test(digits)) return digits;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

/** A compact IBAN in groups of 4 joined by single spaces. */
export function formatIban(compact: string): string {
  return compact.replace(/(.{4})(?=.)/g, "$1 ");
}

/** How a stored value reads on screen. Links stay as stored; copy always
 *  writes the stored compact value. */
export function formatGivingValue(
  kind: CommunityGivingKind,
  value: string,
): string {
  if (kind === "mbway") return formatMbwayNumber(value);
  if (kind === "iban") return formatIban(value);
  return value;
}

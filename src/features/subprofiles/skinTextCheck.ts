import type { SkinBlockControl } from "./skinBlockFields.data";
import {
  emailHref,
  websiteHref,
} from "./skins/therapist/therapistContactLinks";

/**
 * The shape check behind a text control's `validate`: the public page's own
 * parsers decide, so a value passes here exactly when the page will show it.
 * Pure, so the blur warning, the refined fill check and the card count share
 * one answer.
 */

export type SkinTextCheck = NonNullable<SkinBlockControl["validate"]>;

const FIRST_YEAR = 1900;

/** The backend's literal rule for a link field: a trimmed value that starts
 *  with `https://` and parses with a dotted host. */
function parseHttpsUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed.startsWith("https://")) return null;
  try {
    return new URL(trimmed).hostname.includes(".") ? trimmed : null;
  } catch {
    return null;
  }
}

/** Four digits from 1900 to the current year. */
function parseYear(value: string): string | null {
  const trimmed = value.trim();
  if (!/^\d{4}$/.test(trimmed)) return null;
  const year = Number(trimmed);
  return year >= FIRST_YEAR && year <= new Date().getFullYear()
    ? trimmed
    : null;
}

/** The public page's own parsers: each returns null for a value it drops. */
const CHECK_PARSER: Record<SkinTextCheck, (value: string) => string | null> = {
  email: emailHref,
  url: websiteHref,
  httpsUrl: parseHttpsUrl,
  year: parseYear,
};

/** Whether `value` passes the control's `validate` check. A control without
 *  a check, and a blank or non-text value, pass: there is nothing to drop. */
export function isControlValueValid(
  control: Pick<SkinBlockControl, "validate">,
  value: unknown,
): boolean {
  const check = control.validate;
  if (!check || typeof value !== "string" || value.trim() === "") return true;
  return CHECK_PARSER[check](value) !== null;
}

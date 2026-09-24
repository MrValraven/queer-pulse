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

/** The public page's own parsers: each returns null for a value it drops. */
const CHECK_PARSER: Record<SkinTextCheck, (value: string) => string | null> = {
  email: emailHref,
  url: websiteHref,
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

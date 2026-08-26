import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";

export const sleep = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

/**
 * Shape check for the optional "who is this for?" address on the compose form.
 * Deliberately permissive (the same pattern `RequestInviteForm` uses): it only
 * catches an obvious typo before the POST, and the backend's `@IsEmail()` on
 * `CreateInviteDto` remains the real validation.
 */
export const RECIPIENT_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Format the live `expiresAt`; demo mode sends '' so we fall back to the 7-day line. */
export function expiryLabel(
  iso: string,
  t: TFunction,
  fmt: Formatters,
): string {
  if (!iso) return t("auth:invite.ready.expiresIn7Days");
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return t("auth:invite.ready.expiresIn7Days");
  return t("auth:invite.ready.expiresOn", { date: fmt.date(d) });
}

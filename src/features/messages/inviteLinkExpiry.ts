import type { TFunction } from "../../shared/i18n/types";

const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
const MILLISECONDS_PER_DAY = 24 * MILLISECONDS_PER_HOUR;

/** PRD-400: how long an invite link lasts after it is created or reset,
 *  mirroring the backend's `GROUP_INVITE_LINK_TTL_MS`. The server is the
 *  authority; demo mode uses this to stamp a freshly reset link. */
export const INVITE_LINK_TTL_MS = 7 * MILLISECONDS_PER_DAY;

/** PRD-400: how the invite-link panel describes when the link stops
 *  working, as a relative, localized phrase. `isExpired` lets the panel
 *  style the lapsed state and point at Reset. */
export interface InviteLinkExpiryLabel {
  text: string;
  isExpired: boolean;
}

/**
 * The invite link's expiry, relative to `nowMs`:
 * - a day or more left: whole days, rounded to the nearest, so a link reset
 *   a moment ago reads "Expires in 7 days";
 * - under a day: whole hours, rounded, with a minimum of one;
 * - under an hour: "Expires in under an hour";
 * - at or past the instant: the expired line.
 * Null when there is no usable expiry (no link, or an older cached row that
 * predates the field), so the panel simply shows no line.
 */
export function inviteLinkExpiryLabel(
  expiresAtIso: string | null | undefined,
  nowMs: number,
  t: TFunction,
): InviteLinkExpiryLabel | null {
  if (!expiresAtIso) return null;
  const expiresAtMs = Date.parse(expiresAtIso);
  if (Number.isNaN(expiresAtMs)) return null;
  const remainingMs = expiresAtMs - nowMs;
  if (remainingMs <= 0) {
    return { text: t("messages:group.inviteLink.expired"), isExpired: true };
  }
  if (remainingMs >= MILLISECONDS_PER_DAY) {
    const days = Math.round(remainingMs / MILLISECONDS_PER_DAY);
    return {
      text: t("messages:group.inviteLink.expiresInDays", { count: days }),
      isExpired: false,
    };
  }
  if (remainingMs >= MILLISECONDS_PER_HOUR) {
    const hours = Math.max(1, Math.round(remainingMs / MILLISECONDS_PER_HOUR));
    return {
      text: t("messages:group.inviteLink.expiresInHours", { count: hours }),
      isExpired: false,
    };
  }
  return {
    text: t("messages:group.inviteLink.expiresSoon"),
    isExpired: false,
  };
}

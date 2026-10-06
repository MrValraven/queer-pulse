import type { TFunction } from "../../shared/i18n/types";

/** PRD-400 (use cap): the caps an owner or admin can put on an invite link,
 *  mirroring the backend's `GROUP_INVITE_LINK_MAX_USES_OPTIONS`. */
export const INVITE_LINK_MAX_USES_OPTIONS = [1, 5, 25] as const;

/** One of the caps above, or null for unlimited (the default, so a link
 *  made without a choice behaves as it always has). */
export type InviteLinkMaxUses =
  (typeof INVITE_LINK_MAX_USES_OPTIONS)[number] | null;

/** Narrows a cap read off the server row to an offered choice; anything else
 *  (absent on an older cached row, or a value the picker does not offer)
 *  reads as unlimited. */
export function toInviteLinkMaxUses(
  value: number | null | undefined,
): InviteLinkMaxUses {
  const offered = INVITE_LINK_MAX_USES_OPTIONS.find(
    (option) => option === value,
  );
  return offered ?? null;
}

/** PRD-400 (use cap): how the invite-link panel describes the link's
 *  remaining uses. `isUsedUp` lets the panel style the spent state and point
 *  at Reset. */
export interface InviteLinkUsesLabel {
  text: string;
  isUsedUp: boolean;
}

/**
 * The invite link's remaining uses:
 * - no cap (null or absent): "Unlimited uses";
 * - a cap with uses left: "{count} uses left";
 * - a cap with none left: the used-up line.
 */
export function inviteLinkUsesLabel(
  maxUses: number | null | undefined,
  usesLeft: number | null | undefined,
  t: TFunction,
): InviteLinkUsesLabel {
  if (maxUses == null) {
    return {
      text: t("messages:group.inviteLink.unlimitedUses"),
      isUsedUp: false,
    };
  }
  const remaining = Math.max(0, usesLeft ?? maxUses);
  if (remaining === 0) {
    return { text: t("messages:group.inviteLink.usedUp"), isUsedUp: true };
  }
  return {
    text: t("messages:group.inviteLink.usesLeft", { count: remaining }),
    isUsedUp: false,
  };
}

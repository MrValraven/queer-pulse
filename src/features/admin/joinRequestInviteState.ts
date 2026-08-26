import type { TFunction } from "../../shared/i18n/types";
import type { AdminTone } from "./ui";
import type { JoinRequestView } from "./api/useJoinRequests";

const DAY_MS = 86_400_000;

/** How an approval-minted invite reads to the reviewer holding its link. */
export interface JoinRequestInviteState {
  /** Short status label for the chip beside the link. */
  chipLabel: string;
  chipTone: AdminTone;
  /** One sentence saying what the reviewer can still do about it. */
  note: string;
  /** True only for a lapsed invite, the one state a reissue can fix. */
  isReissuable: boolean;
}

const CHIP_TONE: Record<string, AdminTone> = {
  valid: "jade",
  used: "violet",
  expired: "amber",
  revoked: "ghost",
};

/**
 * Whole days from now until `expiresAt`, rounded down. Negative once it has
 * passed. Null for a missing or unparseable date, so a caller can fall back to
 * a line that promises no countdown rather than printing "NaN days".
 */
function daysUntil(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  const at = new Date(expiresAt).getTime();
  if (Number.isNaN(at)) return null;
  return Math.floor((at - Date.now()) / DAY_MS);
}

/**
 * Turn an approval's invite fields into the chip, the sentence and the one
 * action a reviewer can take on it.
 *
 * This exists because an approval invite lapses seven days after it is minted
 * and QueerPulse delivers no email: the link a reviewer copies out of the queue
 * is theirs to carry over by hand, and a queue that shows the link without
 * showing whether it still works quietly hands out dead ones. `valid` therefore
 * leads with the countdown, and `expired` leads with the fix.
 *
 * Returns null when no invite was minted at all — a declined, waitlisted or
 * still-pending request has nothing to say here.
 */
export function joinRequestInviteState(
  item: Pick<
    JoinRequestView,
    "inviteCode" | "inviteStatus" | "inviteExpiresAt"
  >,
  t: TFunction,
): JoinRequestInviteState | null {
  const status = item.inviteStatus;
  if (!status) return null;
  const chipLabel = t(`admin:members.verify.invite.chip.${status}`);
  const chipTone = CHIP_TONE[status] ?? "ghost";

  if (status === "valid") {
    const daysLeft = daysUntil(item.inviteExpiresAt);
    const note =
      daysLeft === null
        ? t("admin:members.verify.invite.validNoExpiry")
        : daysLeft <= 0
          ? t("admin:members.verify.invite.validToday")
          : t("admin:members.verify.invite.validDaysLeft", {
              count: daysLeft,
            });
    return { chipLabel, chipTone, note, isReissuable: false };
  }

  return {
    chipLabel,
    chipTone,
    note: t(`admin:members.verify.invite.${status}`),
    isReissuable: status === "expired",
  };
}

import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getInviteQuota, type InviteQuotaDTO } from "./invite.api";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Presentation-normalized invite allowance. Keeps the raw counts and turns
 * `resetsAt` into a `Date`. The whole-day countdown is deliberately NOT stored
 * here — it's derived at render via {@link daysUntilReset}, so a page left open
 * across midnight shows the correct number instead of a value frozen at fetch.
 */
export interface InviteQuotaView {
  limit: number;
  used: number;
  remaining: number;
  resetsAt: Date;
  memberCount: number;
}

/** Whole days from now until the allowance resets, floored at 0. Call at render
 *  (not at fetch) so the countdown stays fresh across a day boundary. */
export function daysUntilReset(resetsAt: Date): number {
  return Math.max(0, Math.ceil((resetsAt.getTime() - Date.now()) / DAY_MS));
}

function dtoToView(dto: InviteQuotaDTO): InviteQuotaView {
  return {
    limit: dto.limit,
    used: dto.used,
    remaining: dto.remaining,
    resetsAt: new Date(dto.resetsAt),
    memberCount: dto.memberCount,
  };
}

/**
 * The current member's invite allowance for this month. Demo mode returns the
 * colocated mock; live mode calls GET /invites/quota. Works with no backend.
 */
export function useInviteQuota() {
  const { demoMode } = useDemoMode();
  return useQuery<InviteQuotaView>({
    queryKey: ["invite-quota", demoMode],
    queryFn: async () => {
      // Demo mock is loaded on demand so it stays out of the live bundle.
      const dto = demoMode
        ? (await import("../inviteQuota.data")).INVITE_QUOTA
        : await getInviteQuota();
      return dtoToView(dto);
    },
  });
}

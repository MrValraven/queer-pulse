import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  reissueJoinRequestInvite,
  type JoinRequestDTO,
} from "../../auth/api/joinRequest.api";
import { JOIN_REQUESTS, demoInviteCode } from "./joinRequests.data";
import { useDemoAwareMutation } from "./demoAwareMutation";

/** The backend's invite lifetime, mirrored so the demo countdown matches live. */
const INVITE_TTL_MS = 7 * 86_400_000;

export interface ReissueJoinRequestInviteVars {
  id: string;
}

/** The stand-in row demo mode refreshes when an id isn't in the mock queue. */
function demoRow(id: string): JoinRequestDTO {
  const found = JOIN_REQUESTS.find((request) => request.id === id);
  if (found) return found;
  const now = new Date().toISOString();
  return {
    id,
    name: "",
    email: "",
    city: null,
    message: "",
    mutualMemberEmail: null,
    status: "approved",
    ageAttestedAt: now,
    termsVersion: "2.4",
    source: null,
    createdAt: now,
    reviewedAt: now,
    reviewedBy: null,
    inviteCode: demoInviteCode(id),
    inviteStatus: "expired",
    inviteExpiresAt: now,
    declineReason: null,
    flags: [],
    priorDeclineCount: 0,
    referenceMemberName: null,
    referenceMemberSlug: null,
    // OPS-04: a stand-in row nobody has claimed and that carries no clock —
    // there is no queue row behind it to have made a promise about.
    assignedStaffId: null,
    dueAt: null,
  };
}

/**
 * Bring a lapsed approval invite back to life, so the link a reviewer is about
 * to hand over actually works.
 *
 * This matters because QueerPulse delivers no email: an approval reaches the
 * applicant only when a reviewer carries the link over themselves, and the
 * invite expires seven days after it was minted. Without this, an approved
 * applicant whose link was never sent on had no route back in that a reviewer
 * could open.
 *
 * Live mode POSTs `/join-requests/:id/invite/reissue` (moderator or admin);
 * demo mode synthesizes the same refreshed row so the flow is exercisable with
 * no backend. The same code comes back with a fresh expiry, never a new code,
 * so a link already pasted somewhere keeps working.
 */
export function useReissueJoinRequestInvite() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<
    JoinRequestDTO,
    Error,
    ReissueJoinRequestInviteVars
  >({
    demoMode,
    // The decided row surfaces its own per-status error line, so silence the
    // global duplicate toast.
    meta: { silentError: true },
    demoResult: ({ id }) => ({
      ...demoRow(id),
      inviteStatus: "valid",
      inviteExpiresAt: new Date(Date.now() + INVITE_TTL_MS).toISOString(),
    }),
    live: ({ id }) => reissueJoinRequestInvite(id),
    logLabel: "admin.joinRequest.reissueInvite",
    logContext: ({ id }) => ({ id }),
    // Invalidates in BOTH modes: the decided tab is served by the same
    // ["join-requests"] queries the review mutation already refreshes.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["join-requests"] });
    },
  });
}

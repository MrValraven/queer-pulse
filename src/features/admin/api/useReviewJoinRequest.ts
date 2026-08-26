import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  reviewJoinRequest,
  type JoinRequestDTO,
} from "../../auth/api/joinRequest.api";
import { JOIN_REQUESTS, demoInviteCode } from "./joinRequests.data";
import { useDemoAwareMutation } from "./demoAwareMutation";

export interface ReviewJoinRequestVars {
  id: string;
  status: "approved" | "declined" | "waitlisted";
  declineReason?: string;
}

/** The stand-in row demo mode reviews when an id isn't in the mock queue. */
function demoRow(id: string): JoinRequestDTO {
  const found = JOIN_REQUESTS.find((r) => r.id === id);
  if (found) return found;
  const now = new Date().toISOString();
  return {
    id,
    name: "",
    email: "",
    city: null,
    message: "",
    mutualMemberEmail: null,
    status: "pending",
    ageAttestedAt: now,
    termsVersion: "2.4",
    source: null,
    createdAt: now,
    reviewedAt: null,
    reviewedBy: null,
    inviteCode: null,
    inviteStatus: null,
    inviteExpiresAt: null,
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
 * A moderator approves or declines a platform join request. Live mode PATCHes
 * /join-requests/:id and invalidates the queue so it refetches; demo mode
 * synthesizes the same shape locally (including a stable invite code on approve)
 * so the reviewer flow — decision, then the copyable invite link — is fully
 * exercisable with no backend. Mod/Admin only.
 *
 * Approving returns the updated row carrying `inviteCode`, its lifecycle and
 * its expiry. Nothing reaches the applicant's inbox: QueerPulse sends no email,
 * so handing that link over is the reviewer's own job, and the invite lapses
 * seven days after it is minted.
 */
export function useReviewJoinRequest() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<JoinRequestDTO, Error, ReviewJoinRequestVars>({
    demoMode,
    demoLatencyMs: 0,
    // AdminVerifyQueue toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    demoResult: ({ id, status, declineReason }) => ({
      ...demoRow(id),
      status,
      declineReason: status === "declined" ? (declineReason ?? null) : null,
      reviewedAt: new Date().toISOString(),
      reviewedBy: "demo-moderator",
      // The name the live backend resolves from `reviewedBy`, so a decision
      // made in demo mode reads the same way on the quality sample as the
      // pre-decided fixture rows do.
      reviewedByName: "Inês Duarte",
      inviteCode: status === "approved" ? demoInviteCode(id) : null,
      // A freshly minted approval invite is valid by construction, and the
      // backend's INVITE_TTL is 7 days — mirror both so the demo card shows
      // the same countdown a real approval would.
      inviteStatus: status === "approved" ? "valid" : null,
      inviteExpiresAt:
        status === "approved"
          ? new Date(Date.now() + 7 * 86_400_000).toISOString()
          : null,
    }),
    live: ({ id, status, declineReason }) =>
      reviewJoinRequest(id, status, declineReason),
    // Invalidates in BOTH modes: the demo queue is served by a mock queryFn that
    // re-derives from the (now updated) registry on refetch, so the reviewed row
    // must drop there too — hence onSuccess, not onLiveSuccess.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["join-requests"] });
    },
  });
}

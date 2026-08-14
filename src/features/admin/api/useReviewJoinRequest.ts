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
  status: "approved" | "declined";
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
    status: "pending",
    ageAttestedAt: now,
    termsVersion: "2.4",
    source: null,
    createdAt: now,
    reviewedAt: null,
    reviewedBy: null,
    inviteCode: null,
  };
}

/**
 * A moderator approves or declines a platform join request. Live mode PATCHes
 * /join-requests/:id and invalidates the queue so it refetches; demo mode
 * synthesizes the same shape locally (including a stable invite code on approve)
 * so the reviewer flow — decision, then the copyable invite link — is fully
 * exercisable with no backend. Mod/Admin only.
 *
 * Approving returns the updated row carrying `inviteCode`. There is no email
 * service: the reviewer copies the link and sends it themselves.
 */
export function useReviewJoinRequest() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<JoinRequestDTO, Error, ReviewJoinRequestVars>({
    demoMode,
    demoLatencyMs: 0,
    // AdminVerifyQueue toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    demoResult: ({ id, status }) => ({
      ...demoRow(id),
      status,
      reviewedAt: new Date().toISOString(),
      reviewedBy: "demo-moderator",
      inviteCode: status === "approved" ? demoInviteCode(id) : null,
    }),
    live: ({ id, status }) => reviewJoinRequest(id, status),
    // Invalidates in BOTH modes: the demo queue is served by a mock queryFn that
    // re-derives from the (now updated) registry on refetch, so the reviewed row
    // must drop there too — hence onSuccess, not onLiveSuccess.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["join-requests"] });
    },
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { reviewJoinRequest } from "../../auth/api/joinRequest.api";

export interface ReviewJoinRequestVars {
  id: string;
  status: "approved" | "declined";
}

/**
 * A moderator approves or declines a platform join request. Demo mode is a no-op
 * (the queue UI drops the row from local state); live mode PATCHes
 * /join-requests/:id and invalidates the queue so it refetches. Mod/Admin only.
 */
export function useReviewJoinRequest() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, ReviewJoinRequestVars>({
    mutationFn: async ({ id, status }) => {
      if (demoMode) return;
      await reviewJoinRequest(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["join-requests"] });
    },
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { demoFeedback, demoSaveFeedback } from "../goTogether.mock";
import {
  getGoTogetherFeedback,
  saveGoTogetherFeedback,
} from "./goTogether.api";
import type { FeedbackBody, GoTogetherFeedbackDTO } from "./goTogether.types";
import { goTogetherKeys } from "./goTogetherKeys";

/** The member's private after-gathering answers for one group,
 *  `GET /go-together/groups/:groupId/feedback`. */
export function useGoTogetherFeedback(groupId: string | undefined) {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking, status } = useAuth();
  const isActiveSession = !checking && loggedIn && status === "active";
  return useQuery<GoTogetherFeedbackDTO>({
    queryKey: goTogetherKeys.feedback(groupId, demoMode),
    enabled: Boolean(groupId) && (demoMode || isActiveSession),
    retry: false,
    queryFn: async () =>
      demoMode || !groupId
        ? demoFeedback(groupId ?? "")
        : getGoTogetherFeedback(groupId),
  });
}

/** PUT /go-together/groups/:groupId/feedback. The group's `hasAnswered` and
 *  the card's feedback prompt both change, so both refresh. */
export function useSaveGoTogetherFeedback(groupId: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<GoTogetherFeedbackDTO, Error, FeedbackBody>({
    meta: { silentError: true },
    mutationFn: async (body) =>
      demoMode
        ? demoSaveFeedback(groupId, body)
        : saveGoTogetherFeedback(groupId, body),
    onSuccess: (feedback) => {
      queryClient.setQueryData(
        goTogetherKeys.feedback(groupId, demoMode),
        feedback,
      );
      void queryClient.invalidateQueries({
        queryKey: goTogetherKeys.groupRoot,
      });
      void queryClient.invalidateQueries({ queryKey: goTogetherKeys.cardRoot });
    },
  });
}

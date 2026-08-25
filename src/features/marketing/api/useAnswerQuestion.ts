import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { DirectoryPlace, ListingPublicQuestion } from "../directoryPlaces";
import { answerListingQuestion } from "./directory.api";
import { DIRECTORY_KEY } from "./useDirectory";
import { DIRECTORY_QUESTIONS_KEY } from "./useListingQuestions";

export interface AnswerQuestionVariables {
  questionId: string;
  answer: string;
}

/**
 * The listing owner answering one of their public questions, addressed by the
 * listing's `ref` (its owner-facing id, distinct from the public `slug`; see
 * `DirectorySpacePage`'s `owned.ref`). The endpoint is owner-gated, so the
 * affordance is only rendered when the viewer owns the listing.
 *
 * Live mode POSTs, patches the server's own returned question into the cached
 * detail so the answer appears with no reload, and invalidates the paged
 * question list. Demo mode never hits the network and patches the cache with a
 * locally composed answer instead.
 */
export function useAnswerQuestion(ref: string, slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  return useMutation<ListingPublicQuestion | null, Error, AnswerQuestionVariables>(
    {
      // The answer composer toasts its own error, so silence the duplicate.
      meta: { silentError: true },
      mutationFn: async ({ questionId, answer }) => {
        if (demoMode) return null;
        return answerListingQuestion(ref, questionId, answer);
      },
      onSuccess: (updated, variables) => {
        queryClient.setQueriesData<DirectoryPlace | undefined>(
          { queryKey: [DIRECTORY_KEY, "detail", slug] },
          (place) => {
            if (!place?.questions) return place;
            return {
              ...place,
              questions: place.questions.map((question) => {
                if (question.id !== variables.questionId) return question;
                if (updated) return updated;
                return {
                  ...question,
                  answer: variables.answer,
                  answeredAt: new Date().toISOString(),
                  answeredByRole: "owner" as const,
                };
              }),
            };
          },
        );
        if (demoMode) return;
        void queryClient.invalidateQueries({
          queryKey: [DIRECTORY_KEY, DIRECTORY_QUESTIONS_KEY, slug],
        });
      },
    },
  );
}

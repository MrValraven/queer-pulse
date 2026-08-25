import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import type { DirectoryPlace, ListingPublicQuestion } from "../directoryPlaces";
import { askListingQuestion } from "./directory.api";
import { DIRECTORY_KEY } from "./useDirectory";
import { DIRECTORY_QUESTIONS_KEY } from "./useListingQuestions";

/**
 * The backend's own words for why an ask was refused, when it said something
 * worth repeating. A 429 carries a plain quota reason (how many, how long) that
 * is far more useful than "something went wrong", and a 400 says you cannot ask
 * your own listing a public question. Anything else, or a body with no message,
 * returns null and the caller falls back to its generic error copy.
 */
export function readAskQuestionReason(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  if (error.status !== 429 && error.status !== 400) return null;
  const reason = error.message.trim();
  return reason.length > 0 ? reason : null;
}

/**
 * Ask a listing a public question.
 *
 * Live mode POSTs to the member-gated, throttled endpoint, prepends the
 * server's own returned question into the cached detail so it appears with no
 * reload, and invalidates the paged question list so a reader who has already
 * expanded it sees the same thing. Demo mode never hits the network: it builds
 * the question from the signed-in mock session and patches it into the cached
 * detail, mirroring `useSubmitReview`.
 */
export function useAskQuestion(slug: string) {
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<ListingPublicQuestion, Error, string>({
    // The ask form renders the refusal reason itself, so silence the global
    // duplicate toast.
    meta: { silentError: true },
    mutationFn: async (body) => {
      if (demoMode) {
        const profile = user?.profile;
        return {
          id: crypto.randomUUID(),
          body,
          askerName: profile
            ? `${profile.firstName} ${profile.lastName}`.trim()
            : "",
          askerSlug: profile?.slug ?? null,
          askerAvatarUrl: profile?.avatarUrl ?? null,
          createdAt: new Date().toISOString(),
          answer: null,
          answeredAt: null,
          answeredByRole: null,
        };
      }
      return askListingQuestion(slug, body);
    },
    onSuccess: (question) => {
      queryClient.setQueriesData<DirectoryPlace | undefined>(
        { queryKey: [DIRECTORY_KEY, "detail", slug] },
        (place) =>
          place
            ? { ...place, questions: [question, ...(place.questions ?? [])] }
            : place,
      );
      if (demoMode) return;
      void queryClient.invalidateQueries({
        queryKey: [DIRECTORY_KEY, DIRECTORY_QUESTIONS_KEY, slug],
      });
    },
  });
}

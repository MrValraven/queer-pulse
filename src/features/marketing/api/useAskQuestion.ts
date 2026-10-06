import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import { reasonFor } from "../../../shared/api/errorMessage";
import type { TFunction } from "../../../shared/i18n/types";
import type { DirectoryPlace, ListingPublicQuestion } from "../directoryPlaces";
import { askListingQuestion } from "./directory.api";
import { DIRECTORY_KEY } from "./directoryQueryKey";
import { DIRECTORY_QUESTIONS_KEY } from "./useListingQuestions";

const RATE_LIMITED_KEY =
  "marketing:directory.detail.questions.errorRateLimited";

/**
 * Why an ask was refused, when there is something more useful to say than
 * "something went wrong". A 429 is a quota (open questions on this listing, or
 * questions per day, or the route throttle), and it always gets this form's own
 * translated quota line, in every language. A 400 says you cannot ask your own
 * listing a public question: English readers get the server's sentence through
 * `reasonFor`, and every other language gets null so the caller's translated
 * line shows. Anything else
 * returns null and the caller falls back to its generic error copy.
 */
export function readAskQuestionReason(
  error: unknown,
  t: TFunction,
  language: string,
): string | null {
  if (!(error instanceof ApiError)) return null;
  if (error.status === 429) {
    const rateLimitedMessage = t(RATE_LIMITED_KEY);
    // `t()` echoes the key while a catalog lacks it; the generic line beats it.
    return rateLimitedMessage === RATE_LIMITED_KEY ? null : rateLimitedMessage;
  }
  if (error.status !== 400) return null;
  // The backend words a 400 in English only: other languages get the form's
  // own translated line from the caller.
  return language.toLowerCase().startsWith("en") ? reasonFor(error) : null;
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

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import {
  QUIZSHOW_JOIN_CODE_PATTERN,
  type QuizshowJoinPreview,
} from "../../../shared/contracts/quizshow";
import { normaliseJoinCode } from "../quizshowPaths";
import { getQuizshowJoinPreview } from "./quizshow.api";
import { quizshowKeys } from "./quizshowKeys";
import { demoJoinPreview } from "./quizshowDemoStore";
import { shouldRetryQuizshowRead } from "./useQuizshowQuiz";

/** A finished session (410) and a rate limit (429) answer the same on an
 *  immediate retry, on top of the shared rule's access and absence refusals. */
const JOIN_PREVIEW_FINAL_STATUSES: ReadonlySet<number> = new Set([410, 429]);

/** The join preview's retry rule: the shared quizshow read rule, minus 410 and 429. */
export function shouldRetryJoinPreview(
  failureCount: number,
  error: unknown,
): boolean {
  if (
    error instanceof ApiError &&
    JOIN_PREVIEW_FINAL_STATUSES.has(error.status)
  ) {
    return false;
  }
  return shouldRetryQuizshowRead(failureCount, error);
}

/** The join card reads `{ quizTitle, status }` only; a typed code that is not
 *  six characters of the join alphabet never reaches the server. */
function shapedJoinCodeOf(code: string | null): string | null {
  if (code === null) return null;
  const normalisedCode = normaliseJoinCode(code);
  return QUIZSHOW_JOIN_CODE_PATTERN.test(normalisedCode)
    ? normalisedCode
    : null;
}

/**
 * The quiz title and status behind a join code, for the signed-out join card
 * (item 29). The server answers `no-store` (C5), so the cache never serves a
 * stale status: `staleTime: 0` refetches on every mount.
 */
export function useQuizshowJoinPreview(
  code: string | null,
): UseQueryResult<QuizshowJoinPreview> {
  const { demoMode } = useDemoMode();
  const shapedCode = shapedJoinCodeOf(code);
  return useQuery<QuizshowJoinPreview>({
    queryKey: quizshowKeys.joinPreview(shapedCode ?? "", demoMode),
    enabled: shapedCode !== null,
    staleTime: 0,
    retry: shouldRetryJoinPreview,
    // The join card names its own cause for 404, 410, 429 and 5xx.
    meta: { isPrivateQueryKey: true, silentError: true },
    queryFn: async ({ signal }) => {
      if (shapedCode === null) {
        throw new Error("A join preview needs a six-character join code");
      }
      return demoMode
        ? demoJoinPreview(shapedCode)
        : getQuizshowJoinPreview(shapedCode, signal);
    },
  });
}

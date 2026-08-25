import { useQuery } from "@tanstack/react-query";
import { ApiError } from "../../../shared/api/client";
import { verifyCard, type CardVerificationDTO } from "./cards.api";

/**
 * Why a scan produced no card.
 *
 * `unverified` is an ANSWER: the backend looked and this code does not resolve
 * to a card. `unreachable` is the absence of an answer — the request never got
 * one back. Keeping them apart is the difference between telling a door "this
 * card is not good" and "we could not ask", and only the first of those is a
 * reason to turn someone away.
 *
 * This split leaks nothing the platform withholds. The backend still collapses
 * bad signature, expired token and unknown card into one 404, and this reads
 * only whether a response arrived at all.
 */
export type CardVerifyFailure = "unverified" | "unreachable";

/**
 * Resolves a scanned token. Deliberately does NOT branch on demo mode: the
 * verify page is public and is reached from a stranger's camera, so it always
 * asks the real backend.
 *
 * `retry: false` because a 404 here is definitive (bad signature, expired, no
 * such card all land on it) and retrying a definitive answer just makes the
 * door wait. A transport failure is not definitive, but it is retried on the
 * verifier's command rather than silently: someone standing at a door needs to
 * see that nothing was decided, not watch a spinner.
 */
export function useCardVerification(token: string | undefined): {
  verification: CardVerificationDTO | null;
  isLoading: boolean;
  isInvalid: boolean;
  failure: CardVerifyFailure | null;
  /** Re-asks the backend. Only ever offered for `unreachable`. */
  retry: () => void;
  isRetrying: boolean;
} {
  const query = useQuery({
    queryKey: ["card-verify", token],
    enabled: Boolean(token),
    retry: false,
    // A token lives 60 seconds, so there is nothing worth caching past it.
    staleTime: 0,
    gcTime: 0,
    queryFn: () => verifyCard(token!),
  });

  return {
    verification: query.data ?? null,
    isLoading: query.isLoading,
    isInvalid: query.isError,
    failure: query.isError ? failureKind(query.error) : null,
    retry: () => void query.refetch(),
    isRetrying: query.isRefetching,
  };
}

/**
 * A 4xx means the backend answered. Anything else — a thrown `TypeError` from
 * an offline device, the client's own 408 timeout, a 5xx — means it did not,
 * and the card has not been judged.
 */
function failureKind(error: unknown): CardVerifyFailure {
  if (error instanceof ApiError) {
    return error.status >= 400 && error.status < 500 && error.status !== 408
      ? "unverified"
      : "unreachable";
  }
  return "unreachable";
}

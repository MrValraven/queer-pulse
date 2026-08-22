import { useQuery } from "@tanstack/react-query";
import { verifyCard, type CardVerificationDTO } from "./cards.api";

/**
 * Resolves a scanned token. Deliberately does NOT branch on demo mode: the
 * verify page is public and is reached from a stranger's camera, so it always
 * asks the real backend.
 *
 * `retry: false` because the backend returns a single 404 for every failure
 * (bad signature, expired, no such card). Retrying a definitive answer just
 * makes the door wait.
 */
export function useCardVerification(token: string | undefined): {
  verification: CardVerificationDTO | null;
  isLoading: boolean;
  isInvalid: boolean;
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
  };
}

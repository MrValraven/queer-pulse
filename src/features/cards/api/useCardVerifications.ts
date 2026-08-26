import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getCardVerificationCounts,
  type CardVerificationCountsDTO,
} from "./cards.api";
import { DEMO_CARD_VERIFICATION_COUNTS } from "../cards.data";

/**
 * How often this community's cards have been checked. Owner and mod only,
 * enforced server-side, and an aggregate at every layer: there is no
 * per-member read behind this hook and there must never be one.
 *
 * `isEnabled` mirrors the panel's own gate. A community with no card
 * programme has nothing to count, and the endpoint 404s for it, so the query
 * simply does not run.
 */
export function useCardVerifications(
  slug: string | undefined,
  isEnabled: boolean,
): { counts: CardVerificationCountsDTO | null; isLoading: boolean } {
  const { demoMode } = useDemoMode();
  const query = useQuery({
    queryKey: ["card-verifications", slug, demoMode],
    enabled: !demoMode && isEnabled && Boolean(slug),
    queryFn: () => getCardVerificationCounts(slug!),
  });

  if (demoMode) {
    return { counts: DEMO_CARD_VERIFICATION_COUNTS, isLoading: false };
  }
  return { counts: query.data ?? null, isLoading: query.isLoading };
}

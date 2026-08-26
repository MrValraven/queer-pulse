import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { demoBadgeState } from "../demoBadgeStates.data";
import {
  getSafeSpaceBadgeState,
  type SafeSpaceBadgeStateDTO,
} from "./safeSpaceGovernance.api";

/** Shared so the flag mutations can invalidate the badge state they change. */
export const SAFE_SPACE_BADGE_STATE_KEY = "safe-space-badge-state";

/**
 * The honest state of one space's safe-space badge.
 *
 * This exists because `listings.safe_space_status` alone cannot tell the truth:
 * it still reads `verified` while a badge is suspended, and it says nothing
 * about a space whose annual re-review has come due or whose visits are still
 * short of three. Any surface that renders the badge should read `state` from
 * here rather than trusting a `safeSpaceStatus === "verified"` check.
 *
 * Demo mode resolves the colocated per-slug fixture and never calls the
 * network. A slug with no fixture comes back as `none`, so nothing renders.
 */
export function useSafeSpaceBadgeState(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  const query = useQuery<SafeSpaceBadgeStateDTO>({
    queryKey: [SAFE_SPACE_BADGE_STATE_KEY, slug, demoMode],
    enabled: Boolean(slug),
    queryFn: async () => {
      // Per-slug in demo too: one fixed "verified" fixture answering for every
      // place would reproduce, on the detail page, the exact untruth the card
      // grid was fixed for.
      if (demoMode) return demoBadgeState(slug ?? "");
      return getSafeSpaceBadgeState(slug ?? "");
    },
  });
  return { ...query, badge: query.data ?? null };
}

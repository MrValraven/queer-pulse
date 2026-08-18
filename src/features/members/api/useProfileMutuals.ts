import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { apiGet } from "../../../shared/api/client";
import { DEMO_MUTUALS, type ProfileMutualsEntry } from "../profileMutuals.data";

const EMPTY_MUTUALS: ProfileMutualsEntry = { count: 0, members: [] };

/**
 * Mutual connections between the signed-in viewer and the profile at `slug` —
 * backs the visitor-only "You both know X and Y" card (`ProfileMutualsCard`).
 * Demo returns the fixture keyed by the visited profile's slug (see
 * `profileMutuals.data.ts`); live calls `GET /profiles/:slug/mutuals`.
 *
 * The query key includes `demoMode` (matching `useMemberProfile`'s
 * convention) so toggling demo/live refetches instead of serving a
 * cross-mode cache hit.
 */
export function useProfileMutuals(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  return useQuery<ProfileMutualsEntry>({
    queryKey: ["profile-mutuals", demoMode, slug],
    enabled: Boolean(slug),
    // Forward react-query's own cancellation signal into the fetch — navigating
    // away from the profile mid-fetch cancels the request at the network layer,
    // matching useMemberProfile's pattern for the same profile page.
    queryFn: async ({ signal }) => {
      if (!slug) return EMPTY_MUTUALS;
      if (demoMode) return DEMO_MUTUALS[slug] ?? EMPTY_MUTUALS;
      return apiGet<ProfileMutualsEntry>(
        `/profiles/${slug}/mutuals`,
        undefined,
        undefined,
        signal,
      );
    },
  });
}

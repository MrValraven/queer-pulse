import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import { getPublicProfile, type PublicProfileDTO } from "./publicProfile.api";
import { demoPublicProfile } from "../publicProfileDemo.data";

export interface PublicProfileResult {
  profile: PublicProfileDTO | undefined;
  isLoading: boolean;
  /**
   * The profile is not available. One flag on purpose — an unpublished profile,
   * a deactivated member and a slug that never existed are indistinguishable
   * here, exactly as the endpoint makes them.
   */
  notFound: boolean;
}

/**
 * A member's public profile, by slug — the logged-out view.
 *
 * Dual-mode: demo mode serves the seeded demo member from
 * `publicProfileDemo.data` and never touches the network; any other slug is
 * "not found" there, the same as an unknown slug in live mode. Live mode calls
 * GET /public/profiles/:slug, which needs no session.
 *
 * A 404 is a normal answer, not a failure, so it resolves to `notFound` rather
 * than being retried — retrying a deliberate 404 would just delay the empty
 * state. Other failures (network, 5xx) surface as `notFound` too: telling a
 * visitor "this member exists but we couldn't load them" would leak exactly the
 * thing the 404 is designed to hide.
 */
export function usePublicProfileBySlug(
  slug: string | undefined,
): PublicProfileResult {
  const { demoMode } = useDemoMode();

  const query = useQuery({
    queryKey: ["publicProfile", slug, demoMode],
    enabled: !!slug,
    // A 404 is resolved to `null` below rather than thrown, so it never reaches
    // the retry logic — retrying a deliberate 404 would only delay the empty
    // state. This retry covers transient failures (network, 5xx) instead.
    retry: 1,
    queryFn: async (): Promise<PublicProfileDTO | null> => {
      if (demoMode) return demoPublicProfile(slug as string);
      try {
        return await getPublicProfile(slug as string);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
  });

  return {
    profile: query.data ?? undefined,
    isLoading: !!slug && query.isLoading,
    notFound: !slug || query.data === null || query.isError,
  };
}

import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import { movedProfileSlugFromError } from "../useMovedHandleRedirect";
import { getPublicProfile, type PublicProfileDTO } from "./publicProfile.api";

export interface PublicProfileResult {
  profile: PublicProfileDTO | undefined;
  isLoading: boolean;
  /**
   * The profile is not available. One flag on purpose — an unpublished profile,
   * a deactivated member and a slug that never existed are indistinguishable
   * here, exactly as the endpoint makes them.
   */
  notFound: boolean;
  /**
   * The raw failure, kept only so a caller can recognise the PRD-204 moved
   * payload and forward. Every other failure is already folded into `notFound`
   * above, and must stay folded: telling a visitor apart from a visitor is the
   * whole thing this endpoint refuses to do.
   */
  error: unknown;
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
    //
    // The one 404 that does reach here is the moved-username payload, and it is
    // as deliberate as the others: retrying it would only hold the visitor on
    // the dead address for a second round trip before forwarding them.
    retry: (failureCount, error) =>
      failureCount < 1 && movedProfileSlugFromError(error) === null,
    queryFn: async (): Promise<PublicProfileDTO | null> => {
      if (demoMode) {
        const { demoPublicProfile } = await import("../publicProfileDemo.data");
        return demoPublicProfile(slug as string);
      }
      try {
        return await getPublicProfile(slug as string);
      } catch (err) {
        // PRD-204. A username its owner renamed away from answers 404 with a
        // moved payload naming the current one, and this page is the address
        // most likely to be old: the one printed on a card or left in a bio,
        // followed by someone with no account who cannot search for anybody.
        // It has to reach the caller as an error, because the whole point is to
        // forward rather than to report an absence. Every other 404 stays
        // indistinguishable, exactly as the endpoint makes it.
        if (movedProfileSlugFromError(err)) throw err;
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
  });

  return {
    profile: query.data ?? undefined,
    isLoading: !!slug && query.isLoading,
    notFound: !slug || query.data === null || query.isError,
    error: query.error,
  };
}

import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import { getProfile } from "./members.api";
import { profileToMember } from "./members.adapters";
import type { Member } from "../data/members";

export interface MemberProfileResult {
  member: Member | null;
  limited: boolean;
}

/**
 * Is this failure the server saying "there is no profile here for you"?
 *
 * Only 404 (no such member) and 403 (walled off) mean that. Everything else —
 * a 5xx, a timeout, an offline browser — is an outage, and rendering the
 * "no such member" wall for one tells a member that someone left QueerPulse
 * when the truth is that the request never landed. Callers use this to pick
 * between the not-found wall and a retryable error state.
 */
export function isMemberMissingError(error: unknown): boolean {
  return (
    error instanceof ApiError && (error.status === 404 || error.status === 403)
  );
}

/** Another member's profile. Demo returns the mock registry entry; live calls
 *  GET /profiles/:slug and reports the limited-card flag for visibility gating. */
export function useMemberProfile(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  return useQuery<MemberProfileResult>({
    queryKey: ["profile", demoMode, slug],
    enabled: Boolean(slug),
    // Forward react-query's own cancellation signal into the fetch — navigating
    // away from the profile page mid-fetch cancels the request at the network
    // layer, not just in the query cache.
    queryFn: async ({ signal }) => {
      if (!slug) return { member: null, limited: false };
      if (demoMode) {
        const { MEMBERS } = await import("../data/members");
        return { member: MEMBERS[slug] ?? null, limited: false };
      }
      const dto = await getProfile(slug, signal);
      return { member: profileToMember(dto), limited: dto.limited };
    },
  });
}

import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getProfile } from "./members.api";
import { profileToMember } from "./members.adapters";
import type { Member } from "../data/members";

export interface MemberProfileResult {
  member: Member | null;
  limited: boolean;
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

import { COMMUNITY_DETAILS } from "./communityDetails.data";
import type { CommunityDetail } from "./communityDetails";

/* Lookup helper split out of communityDetails.tsx so that file only exports
 * types + data (react-refresh/only-export-components). */
export function getCommunityDetail(
  slug: string | undefined,
): CommunityDetail | undefined {
  return slug ? COMMUNITY_DETAILS[slug] : undefined;
}

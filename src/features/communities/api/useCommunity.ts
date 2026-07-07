import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiError } from "../../../shared/api/client";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useCommunityMembership } from "../../../app/providers/CommunityMembershipProvider";
import {
  getCommunity,
  type JoinRequestStatus,
  type RosterRole,
} from "./communities.api";
import {
  detailDtoToCommunity,
  detailDtoToDetail,
  detailDtoToLiving,
} from "./communities.adapters";
import { useAllCommunities, useCreatedDetail } from "../useAllCommunities";
import { getCommunityDetail, type CommunityDetail } from "../communityDetails";
import { getLiving } from "../livingCommunities.data";
import type { Community } from "../../homepage/data/types";
import type { LivingCommunity } from "../community.model";

export interface CommunityResult {
  community: Community | null;
  detail: CommunityDetail | null;
  /** Enriched hub data (roster/posts filled by their own hooks) or undefined
   *  for non-flagship communities (→ the lighter fallback tabs). */
  living: LivingCommunity | undefined;
  myRole: RosterRole | null;
  myJoinRequestStatus: JoinRequestStatus | null;
  /** True when the community doesn't exist or is private + hidden (→ 404 path). */
  notFound: boolean;
  isLoading: boolean;
}

const EMPTY: CommunityResult = {
  community: null,
  detail: null,
  living: undefined,
  myRole: null,
  myJoinRequestStatus: null,
  notFound: false,
  isLoading: false,
};

/**
 * Community detail source. Demo assembles the view-models synchronously from
 * the mock registries + the session membership provider (byte-for-byte today's
 * behaviour, and reactive to created communities / join state). Live calls
 * GET /communities/:slug; a 404 (private + hidden, or missing) becomes the
 * not-found path rather than a thrown error.
 */
export function useCommunity(slug: string | undefined): CommunityResult {
  const { demoMode } = useDemoMode();
  const all = useAllCommunities();
  const createdDetail = useCreatedDetail(slug);
  const { roleIn, hasRequested } = useCommunityMembership();

  const demoResult = useMemo<CommunityResult>(() => {
    const community = all.find((c) => c.slug === slug) ?? null;
    const detail =
      (slug ? getCommunityDetail(slug) : undefined) ?? createdDetail ?? null;
    if (!community || !detail) return { ...EMPTY, notFound: true };
    return {
      community,
      detail,
      living: getLiving(slug),
      myRole: slug ? roleIn(slug) : null,
      myJoinRequestStatus: slug && hasRequested(slug) ? "pending" : null,
      notFound: false,
      isLoading: false,
    };
  }, [all, createdDetail, slug, roleIn, hasRequested]);

  const query = useQuery<CommunityResult>({
    queryKey: ["community", slug],
    enabled: !demoMode && Boolean(slug),
    queryFn: async () => {
      try {
        const dto = await getCommunity(slug!);
        return {
          community: detailDtoToCommunity(dto),
          detail: detailDtoToDetail(dto),
          living: detailDtoToLiving(dto),
          myRole: dto.myRole,
          myJoinRequestStatus: dto.myJoinRequestStatus,
          notFound: false,
          isLoading: false,
        };
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) {
          return { ...EMPTY, notFound: true };
        }
        throw e;
      }
    },
  });

  if (demoMode) return demoResult;
  return query.data ?? { ...EMPTY, isLoading: query.isLoading };
}

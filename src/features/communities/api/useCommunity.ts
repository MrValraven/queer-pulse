import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiError } from "../../../shared/api/client";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useCommunityMembership } from "../../../app/providers/useCommunityMembership";
import { useCommunityEdits } from "../../../app/providers/useCommunityEdits";
import {
  getCommunity,
  type JoinRequestStatus,
  type RosterRole,
  type UpdateCommunityDto,
} from "./communities.api";
import {
  detailDtoToCommunity,
  detailDtoToDetail,
  detailDtoToLiving,
  dtoToEditable,
  applyCommunityOverride,
  applyDetailOverride,
  applyLivingOverride,
  type EditableCommunityFields,
} from "./communities.adapters";
import { useAllCommunities, useCreatedDetail } from "../useAllCommunities";
import type { CommunityDetail } from "../communityDetails";
import { getCommunityDetail } from "../communityDetail.lookup";
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
  /** The current owner/mod-editable fields, seeded from the live DTO or (in
   *  demo) the mock view-models merged with any session edit override. */
  editable: EditableCommunityFields | null;
  /** True when the community doesn't exist or is private + hidden (→ 404 path). */
  notFound: boolean;
  isLoading: boolean;
  /** True when the (live) fetch failed for a non-404 reason — the page shows a
   *  retryable error state instead of an eternal skeleton (P1-14). Never true in
   *  demo mode. */
  isError: boolean;
  /** Re-run the live query — wired to the error state's "Try again" action. */
  refetch: () => void;
}

const NOOP = () => {};

const EMPTY: CommunityResult = {
  community: null,
  detail: null,
  living: undefined,
  myRole: null,
  myJoinRequestStatus: null,
  editable: null,
  notFound: false,
  isLoading: false,
  isError: false,
  refetch: NOOP,
};

/**
 * Assemble the demo `EditableCommunityFields` from the mock view-models
 * (the same graceful-default approach the adapters use for live data), then
 * layer the session edit override (if any) on top field-by-field.
 */
function demoEditableFields(
  community: Community,
  detail: CommunityDetail,
  living: LivingCommunity | undefined,
  override: UpdateCommunityDto | undefined,
): EditableCommunityFields {
  const base: EditableCommunityFields = {
    name: community.name,
    tagline: community.description,
    type: community.type,
    whoFor: typeof detail.whoFor[0] === "string" ? detail.whoFor[0] : "",
    purpose: typeof detail.about[0] === "string" ? detail.about[0] : "",
    accessTier:
      living?.accessTier ?? (community.privateBadge ? "private" : "public"),
    rosterVisible: true,
    features: ["discussion"],
    rules: living?.rules ?? [],
  };
  if (!override) return base;
  return {
    name: override.name ?? base.name,
    tagline: override.tagline ?? base.tagline,
    type: override.type ?? base.type,
    whoFor: override.whoFor ?? base.whoFor,
    purpose: override.purpose ?? base.purpose,
    accessTier: override.accessTier ?? base.accessTier,
    rosterVisible: override.rosterVisible ?? base.rosterVisible,
    features: override.features ?? base.features,
    rules: override.rules ?? base.rules,
  };
}

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
  const { overrideFor } = useCommunityEdits();

  const demoResult = useMemo<CommunityResult>(() => {
    const community = all.find((c) => c.slug === slug) ?? null;
    const detail =
      (slug ? getCommunityDetail(slug) : undefined) ?? createdDetail ?? null;
    if (!community || !detail) return { ...EMPTY, notFound: true };
    const baseLiving = getLiving(slug);
    const override = slug ? overrideFor(slug) : undefined;
    const editable = demoEditableFields(community, detail, baseLiving, override);
    return {
      community: override ? applyCommunityOverride(community, override) : community,
      detail: override ? applyDetailOverride(detail, override) : detail,
      living: override ? applyLivingOverride(baseLiving, override) : baseLiving,
      myRole: slug ? roleIn(slug) : null,
      myJoinRequestStatus: slug && hasRequested(slug) ? "pending" : null,
      editable,
      notFound: false,
      isLoading: false,
      isError: false,
      refetch: NOOP,
    };
  }, [all, createdDetail, slug, roleIn, hasRequested, overrideFor]);

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
          editable: dtoToEditable(dto),
          notFound: false,
          isLoading: false,
          isError: false,
          refetch: NOOP,
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
  const base = query.data ?? { ...EMPTY, isLoading: query.isLoading };
  // Inject the live error signal + retry at the boundary (the cached `data`
  // literal carries the no-op defaults; a non-404 failure surfaces here).
  return {
    ...base,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

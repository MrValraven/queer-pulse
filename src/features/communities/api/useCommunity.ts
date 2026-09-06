import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiError } from "../../../shared/api/client";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
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
  /**
   * When this viewer's standing invitation was sent (PRD-140), or null. Only
   * ever non-null for a NON-member who holds a pending invitation: a member is
   * already in, so their invitation is spent whatever the table still holds.
   * It is what lets the hero offer "Accept invitation" instead of a join
   * request, and it is the only reason a `private` community's detail reaches
   * a non-member at all. Always null in demo mode, which has no invitation
   * record.
   */
  invitedAt: string | null;
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
  invitedAt: null,
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
      living?.accessTier ??
      community.accessTier ??
      (community.privateBadge ? "private" : "public"),
    rosterVisible: true,
    features: ["discussion"],
    rules: living?.rules ?? [],
    // The demo mock view-models carry no cover image; the edit form starts empty
    // and an override can set one (demo covers are held in the session store).
    coverImageUrl: "",
    // The mock view-model's own curated tags (see `communities.ts`'s `tags`
    // entries), overridden below once a session edit picks new ones.
    tags: community.tags ?? [],
    // The demo registry carries neither a community avatar nor a welcome
    // greeting, so both start empty here and an override can set either (demo
    // edits live in the session store, exactly like the cover above).
    avatarImageUrl: "",
    welcomeMessage: "",
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
    coverImageUrl: override.coverImageUrl ?? base.coverImageUrl,
    tags: override.tags ?? base.tags,
    avatarImageUrl: override.avatarImageUrl ?? base.avatarImageUrl,
    welcomeMessage: override.welcomeMessage ?? base.welcomeMessage,
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
  // `language` is in the live query key because the DTO→view-model adapters
  // resolve catalog keys (member counts, "Founded 2025", the organiser role,
  // the TBA gathering card) — a language switch has to re-map the cached DTO,
  // not just re-render strings that were composed in the old language.
  const { t, language } = useTranslation();
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
    const editable = demoEditableFields(
      community,
      detail,
      baseLiving,
      override,
    );
    return {
      community: override
        ? applyCommunityOverride(community, override, t)
        : community,
      detail: override ? applyDetailOverride(detail, override) : detail,
      living: override ? applyLivingOverride(baseLiving, override) : baseLiving,
      myRole: slug ? roleIn(slug) : null,
      myJoinRequestStatus: slug && hasRequested(slug) ? "pending" : null,
      // The demo membership store holds memberships and pending requests and
      // nothing else, so the prototype has no invitation to report.
      invitedAt: null,
      editable,
      notFound: false,
      isLoading: false,
      isError: false,
      refetch: NOOP,
    };
  }, [all, createdDetail, slug, roleIn, hasRequested, overrideFor, t]);

  const query = useQuery<CommunityResult>({
    queryKey: ["community", slug, language],
    enabled: !demoMode && Boolean(slug),
    queryFn: async () => {
      try {
        const dto = await getCommunity(slug!);
        return {
          community: detailDtoToCommunity(dto, t),
          detail: detailDtoToDetail(dto, t),
          living: detailDtoToLiving(dto),
          myRole: dto.myRole,
          myJoinRequestStatus: dto.myJoinRequestStatus,
          invitedAt: dto.invitedAt ?? null,
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

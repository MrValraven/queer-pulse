import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { demoGetBadgeAdmin, demoGetBadges } from "../communityBadgesDemoStore";
import { useDemoBadgeViewerResolver } from "../useDemoBadgeViewer";
import {
  getCommunityBadgeAdmin,
  getCommunityBadges,
  type CommunityBadgeAdminResponse,
  type CommunityBadgesResponse,
} from "./communityBadges.api";
import { communityBadgeKeys, demoViewerKeyPart } from "./communityBadgeKeys";

/**
 * A community's badges. Demo answers from the demo badge store, so a refusal
 * the store throws (a space, a visitor reading a gated board) is the query's
 * error, the same as a live 4xx. Demo data never goes stale on its own: the
 * badge writes invalidate the key, and the key carries what the store reads off
 * the viewer (member or not, and the seat), so a demo join, leave or role
 * change reads under a fresh key.
 */

interface BadgeQueryOptions {
  enabled?: boolean;
}

/** `GET /communities/:slug/badges`: the enabled badges and the viewer's progress. */
export function useCommunityBadges(
  slug: string | undefined,
  options: BadgeQueryOptions = {},
): UseQueryResult<CommunityBadgesResponse> {
  const { enabled = true } = options;
  const { demoMode } = useDemoMode();
  const { language } = useTranslation();
  const resolveViewer = useDemoBadgeViewerResolver();
  const viewer = demoMode ? resolveViewer(slug ?? "") : null;
  return useQuery<CommunityBadgesResponse>({
    queryKey: communityBadgeKeys.list(
      slug ?? "",
      demoMode,
      language,
      viewer ? demoViewerKeyPart(viewer) : [],
    ),
    enabled: enabled && Boolean(slug),
    staleTime: demoMode ? Infinity : undefined,
    queryFn: () =>
      viewer ? demoGetBadges(slug!, viewer) : getCommunityBadges(slug!),
  });
}

/** `GET /communities/:slug/badges/manage`: every badge, for the staff pane. */
export function useCommunityBadgeAdmin(
  slug: string | undefined,
  options: BadgeQueryOptions = {},
): UseQueryResult<CommunityBadgeAdminResponse> {
  const { enabled = true } = options;
  const { demoMode } = useDemoMode();
  const { language } = useTranslation();
  const resolveViewer = useDemoBadgeViewerResolver();
  const viewer = demoMode ? resolveViewer(slug ?? "") : null;
  return useQuery<CommunityBadgeAdminResponse>({
    queryKey: communityBadgeKeys.manage(
      slug ?? "",
      demoMode,
      language,
      viewer ? demoViewerKeyPart(viewer) : [],
    ),
    enabled: enabled && Boolean(slug),
    staleTime: demoMode ? Infinity : undefined,
    queryFn: () =>
      viewer ? demoGetBadgeAdmin(slug!, viewer) : getCommunityBadgeAdmin(slug!),
  });
}

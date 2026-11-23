import {
  useMutation,
  useQueryClient,
  type QueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import {
  demoCreateBadge,
  demoDeleteBadge,
  demoSetFlair,
  demoUpdateBadge,
} from "../communityBadgesDemoStore";
import { useDemoBadgeViewerResolver } from "../useDemoBadgeViewer";
import {
  createCommunityBadge,
  deleteCommunityBadge,
  putCommunityFlair,
  updateCommunityBadge,
  type CommunityBadgeAdminDTO,
  type CommunityFlairResponse,
  type CreateCommunityBadgeBody,
  type DeleteCommunityBadgeResult,
  type UpdateCommunityBadgeBody,
} from "./communityBadges.api";
import { communityBadgeKeys, refreshLiveNameLines } from "./communityBadgeKeys";

/**
 * Badge writes. Demo writes the demo badge store (which re-renders the name
 * lines itself); live calls the api. Each caller toasts its own failure with
 * the badge error copy, so the global duplicate is silenced. Every success
 * re-reads the community's badge lists; a live write that can change a name
 * line also re-reads the roster and posts.
 */

function refreshBadges(queryClient: QueryClient, slug: string): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: communityBadgeKeys.all(slug),
  });
}

function refreshNameLinesWhenLive(
  queryClient: QueryClient,
  slug: string,
  isDemoMode: boolean,
): void {
  if (isDemoMode) return;
  refreshLiveNameLines(queryClient, slug);
}

/** `POST /communities/:slug/badges`. A new badge is on nobody's name line yet. */
export function useCreateCommunityBadge(
  slug: string,
): UseMutationResult<CommunityBadgeAdminDTO, Error, CreateCommunityBadgeBody> {
  const { demoMode } = useDemoMode();
  const resolveViewer = useDemoBadgeViewerResolver();
  const queryClient = useQueryClient();
  return useMutation<CommunityBadgeAdminDTO, Error, CreateCommunityBadgeBody>({
    meta: { silentError: true },
    mutationFn: async (body) =>
      demoMode
        ? demoCreateBadge(slug, resolveViewer(slug), body)
        : createCommunityBadge(slug, body),
    onSuccess: () => refreshBadges(queryClient, slug),
  });
}

/** `PATCH /communities/:slug/badges/:badgeId`: rename, restyle, switch on or off. */
export function useUpdateCommunityBadge(
  slug: string,
): UseMutationResult<
  CommunityBadgeAdminDTO,
  Error,
  { badgeId: string; body: UpdateCommunityBadgeBody }
> {
  const { demoMode } = useDemoMode();
  const resolveViewer = useDemoBadgeViewerResolver();
  const queryClient = useQueryClient();
  return useMutation<
    CommunityBadgeAdminDTO,
    Error,
    { badgeId: string; body: UpdateCommunityBadgeBody }
  >({
    meta: { silentError: true },
    mutationFn: async ({ badgeId, body }) =>
      demoMode
        ? demoUpdateBadge(slug, resolveViewer(slug), badgeId, body)
        : updateCommunityBadge(slug, badgeId, body),
    onSuccess: () => {
      refreshNameLinesWhenLive(queryClient, slug, demoMode);
      return refreshBadges(queryClient, slug);
    },
  });
}

/** `DELETE /communities/:slug/badges/:badgeId`: the awards go with it. */
export function useDeleteCommunityBadge(
  slug: string,
): UseMutationResult<DeleteCommunityBadgeResult, Error, { badgeId: string }> {
  const { demoMode } = useDemoMode();
  const resolveViewer = useDemoBadgeViewerResolver();
  const queryClient = useQueryClient();
  return useMutation<DeleteCommunityBadgeResult, Error, { badgeId: string }>({
    meta: { silentError: true },
    mutationFn: async ({ badgeId }) =>
      demoMode
        ? demoDeleteBadge(slug, resolveViewer(slug), badgeId)
        : deleteCommunityBadge(slug, badgeId),
    onSuccess: () => {
      refreshNameLinesWhenLive(queryClient, slug, demoMode);
      return refreshBadges(queryClient, slug);
    },
  });
}

/**
 * `PUT /communities/:slug/flair`: wear a badge, or stop wearing with a null
 * id. The slug rides in the variables because one sheet can wear in whichever
 * community it is open on.
 */
export function useWearCommunityBadge(): UseMutationResult<
  CommunityFlairResponse,
  Error,
  { slug: string; badgeId: string | null }
> {
  const { demoMode } = useDemoMode();
  const resolveViewer = useDemoBadgeViewerResolver();
  const queryClient = useQueryClient();
  return useMutation<
    CommunityFlairResponse,
    Error,
    { slug: string; badgeId: string | null }
  >({
    meta: { silentError: true },
    mutationFn: async ({ slug, badgeId }) =>
      demoMode
        ? demoSetFlair(slug, resolveViewer(slug), badgeId)
        : putCommunityFlair(slug, badgeId),
    onSuccess: (_response, { slug }) => {
      refreshNameLinesWhenLive(queryClient, slug, demoMode);
      return refreshBadges(queryClient, slug);
    },
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getLiving } from "../livingCommunities.data";
import type { CommunityResource } from "../community.model";
import {
  createCommunityResource,
  deleteCommunityResource,
  getCommunityResources,
  reorderCommunityResources,
  updateCommunityResource,
  type CommunityResourceDTO,
  type CommunityResourceShelfDTO,
  type CreateCommunityResourceDto,
  type UpdateCommunityResourceDto,
} from "./communityResources.api";

/**
 * A community's resource shelf. Demo returns the flagship's mock shelf
 * synchronously (the fixtures the About tab has always rendered) with no id
 * and no cap, so the editor stays out of demo mode entirely; live calls
 * GET /communities/:slug/resources and carries the server's `maxResources`
 * through so the add control can disable itself at the ceiling.
 */

/** One shelf row as the About tab renders it: the demo fixture shape
 *  (`CommunityResource`) plus the live row's id, so the editor has something
 *  to address. `id` is absent for a demo fixture, which is exactly why the
 *  editor is live-only. */
export interface ShelfResource extends CommunityResource {
  id?: string;
}

export interface CommunityResourcesResult {
  resources: ShelfResource[];
  /** How many rows this community's shelf may hold (live only; `null` in demo,
   *  where nothing can be added anyway). */
  maxResources: number | null;
  isLoading: boolean;
  isError: boolean;
}

const dtoToShelfResource = (dto: CommunityResourceDTO): ShelfResource => ({
  id: dto.id,
  title: dto.title,
  href: dto.url,
  kind: dto.kind,
  ...(dto.note ? { note: dto.note } : {}),
});

export const communityResourcesKey = (
  slug: string | undefined,
  demoMode: boolean,
) => ["community-resources", slug, demoMode] as const;

export function useCommunityResources(
  slug: string | undefined,
  options: { enabled?: boolean } = {},
): CommunityResourcesResult {
  const { enabled = true } = options;
  const { demoMode } = useDemoMode();
  const query = useQuery<CommunityResourceShelfDTO>({
    queryKey: communityResourcesKey(slug, demoMode),
    enabled: enabled && !demoMode && Boolean(slug),
    queryFn: () => getCommunityResources(slug!),
  });

  if (demoMode) {
    return {
      resources: getLiving(slug)?.resources ?? [],
      maxResources: null,
      isLoading: false,
      isError: false,
    };
  }
  return {
    resources: (query.data?.resources ?? []).map(dtoToShelfResource),
    maxResources: query.data?.maxResources ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

/** Every shelf write invalidates the one shelf key. Extracted so the four
 *  mutations below can't drift on which key they refresh. */
function useShelfInvalidation(slug: string | undefined, demoMode: boolean) {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({
      queryKey: communityResourcesKey(slug, demoMode),
    });
  };
}

/** POST /communities/:slug/resources — appended to the end of the shelf. */
export function useCreateCommunityResource(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  const invalidateShelf = useShelfInvalidation(slug, demoMode);
  return useMutation<void, Error, CreateCommunityResourceDto>({
    // The editor toasts its own failure, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async (dto) => {
      if (demoMode || !slug) return;
      await createCommunityResource(slug, dto);
    },
    onSuccess: invalidateShelf,
  });
}

/** PATCH /communities/:slug/resources/:id — edit one row in place. */
export function useUpdateCommunityResource(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  const invalidateShelf = useShelfInvalidation(slug, demoMode);
  return useMutation<
    void,
    Error,
    { id: string; dto: UpdateCommunityResourceDto }
  >({
    meta: { silentError: true },
    mutationFn: async ({ id, dto }) => {
      if (demoMode || !slug) return;
      await updateCommunityResource(slug, id, dto);
    },
    onSuccess: invalidateShelf,
  });
}

/** DELETE /communities/:slug/resources/:id — take one row off the shelf. */
export function useDeleteCommunityResource(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  const invalidateShelf = useShelfInvalidation(slug, demoMode);
  return useMutation<void, Error, string>({
    meta: { silentError: true },
    mutationFn: async (id) => {
      if (demoMode || !slug) return;
      await deleteCommunityResource(slug, id);
    },
    onSuccess: invalidateShelf,
  });
}

/**
 * PATCH /communities/:slug/resources/order — the whole shelf's order in one
 * call. The server refuses anything that is not every current id exactly once,
 * so callers send the full ordered list they are looking at rather than the
 * pair of rows that moved.
 */
export function useReorderCommunityResources(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  const invalidateShelf = useShelfInvalidation(slug, demoMode);
  return useMutation<void, Error, string[]>({
    meta: { silentError: true },
    mutationFn: async (resourceIds) => {
      if (demoMode || !slug) return;
      await reorderCommunityResources(slug, resourceIds);
    },
    onSuccess: invalidateShelf,
  });
}

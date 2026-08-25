import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { logInfo } from "../../../shared/observability/logger";
import {
  resolveCommunityTagRequest,
  type AdminCommunityTagRequestListDTO,
  type CommunityTagRequestStatus,
} from "./communityTagRequests.api";
import type { AdminCommunityTagRequestFilter } from "./useAdminCommunityTagRequests";
import { DEMO_LATENCY_MS } from "./demoAwareMutation";

/** Shared prefix for every `useAdminCommunityTagRequests` infinite query — the
 *  full key also carries `demoMode` + the active filter at position 2. */
const TAG_REQUESTS_QUERY_KEY = ["admin-community-tag-requests"] as const;

type RequestsData = InfiniteData<AdminCommunityTagRequestListDTO>;
type CachedEntry = [QueryKey, RequestsData | undefined];
interface ResolveContext {
  previous: CachedEntry[];
}

/**
 * Resolve a pending community tag request from the admin review queue.
 * Unlike `useAdminResourceSuggestionMutations` (whose queue is filtered by
 * category, never by the field a decision changes), this queue's tabs ARE a
 * status filter — so a plain in-place status patch would leave a
 * just-resolved row sitting in the "Pending" tab with its Resolve button
 * merely disabled. Instead this walks every cached query the same way
 * `patchListingInCache` (`useAdminListings.ts`) does: read each cached
 * query's own status filter off its key, and drop the row from any page
 * whose filter the patched status no longer matches — so resolving moves the
 * row out of "Pending" immediately, while the "Resolved"/"All" tabs (if
 * already fetched) pick it up with its new status. Rolls back to the
 * snapshot on error; live mode also invalidates on settle to reconcile with
 * the server (demo mode's patch IS the source of truth, nothing to
 * reconcile).
 */
export function useResolveCommunityTagRequest() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  const patchStatus = (id: string, status: CommunityTagRequestStatus) => {
    const matchedQueries = queryClient.getQueriesData<RequestsData>({
      queryKey: TAG_REQUESTS_QUERY_KEY,
    });
    for (const [queryKey, currentData] of matchedQueries) {
      if (!currentData) continue;
      const queryFilter = queryKey[2] as AdminCommunityTagRequestFilter;
      let itemWasFound = false;

      const patchedPages = currentData.pages.map((page) => {
        const existingItem = page.items.find((item) => item.id === id);
        if (!existingItem) return page;
        itemWasFound = true;

        const patchedItem = {
          ...existingItem,
          status,
          resolvedAt: existingItem.resolvedAt ?? new Date().toISOString(),
        };
        const stillMatchesThisPage =
          queryFilter === "all" || patchedItem.status === queryFilter;

        return {
          ...page,
          items: stillMatchesThisPage
            ? page.items.map((item) =>
                item === existingItem ? patchedItem : item,
              )
            : page.items.filter((item) => item !== existingItem),
        };
      });

      if (itemWasFound) {
        queryClient.setQueryData(queryKey, {
          ...currentData,
          pages: patchedPages,
        });
      }
    }
  };

  const mutation = useMutation<void, Error, { id: string }, ResolveContext>({
    mutationFn: async ({ id }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, DEMO_LATENCY_MS));
        logInfo("admin.communityTagRequest.resolve (demo — no network)", {
          id,
        });
        return;
      }
      await resolveCommunityTagRequest(id);
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: TAG_REQUESTS_QUERY_KEY });
      const previous = queryClient.getQueriesData<RequestsData>({
        queryKey: TAG_REQUESTS_QUERY_KEY,
      });
      patchStatus(id, "resolved");
      return { previous };
    },
    onError: (_error, _vars, context) => {
      context?.previous.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      if (!demoMode) {
        void queryClient.invalidateQueries({
          queryKey: TAG_REQUESTS_QUERY_KEY,
        });
      }
    },
    meta: { silentError: true },
  });

  return { resolve: mutation.mutate, pending: mutation.isPending };
}

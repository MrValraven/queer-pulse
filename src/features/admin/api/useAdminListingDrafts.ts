import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import type { ItemsPage } from "../../../shared/api/pagination";
import { ADMIN_LISTING_DRAFTS } from "../adminListingDrafts.data";
import { ADMIN_LISTING_DRAFT_PAYLOADS } from "../adminListingDraftPayloads.data";
import {
  getAdminListingDraft,
  getAdminListingDrafts,
  type AdminListingDraftDTO,
  type AdminListingDraftDetailDTO,
} from "./adminListingDrafts.api";

export const ADMIN_LISTING_DRAFTS_KEY = "admin-listing-drafts";

/**
 * Members' unfinished list-a-business drafts, paginated, so staff can offer a
 * hand to someone who stalled partway. `total` is the size of the whole set,
 * not of the pages fetched so far.
 *
 * Demo reads the colocated fixture as a single synthetic page and never hits
 * the network: the endpoint is Admin-only and the fixture is fabricated data
 * that must never surface as platform truth. Mirrors `useListingClaims`.
 */
export function useAdminListingDrafts() {
  const { demoMode } = useDemoMode();
  const query = useInfiniteQuery<ItemsPage<AdminListingDraftDTO>>({
    queryKey: [ADMIN_LISTING_DRAFTS_KEY, demoMode],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      demoMode
        ? Promise.resolve({
            items: ADMIN_LISTING_DRAFTS,
            total: ADMIN_LISTING_DRAFTS.length,
            page: 1,
            pageSize: ADMIN_LISTING_DRAFTS.length || 1,
          })
        : getAdminListingDrafts(pageParam as number),
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });
  const rows = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  return { ...query, rows, total };
}

/** Demo answer for one draft: its fixture summary plus its business half, or
 *  a rejection shaped like the live 404 when the id is not in the fixture. */
function demoListingDraft(id: string): Promise<AdminListingDraftDetailDTO> {
  const summary = ADMIN_LISTING_DRAFTS.find((draft) => draft.id === id);
  if (!summary) {
    return Promise.reject(new ApiError(404, "Listing draft not found"));
  }
  return Promise.resolve({
    ...summary,
    payload: ADMIN_LISTING_DRAFT_PAYLOADS[id] ?? {},
  });
}

/**
 * One member's draft, opened to be finished as a team listing. Idle until an
 * id is given. Not retried: a 404 means the member submitted or discarded the
 * draft in the meantime, which no retry will undo.
 */
export function useAdminListingDraft(id: string | null) {
  const { demoMode } = useDemoMode();
  return useQuery<AdminListingDraftDetailDTO>({
    queryKey: [ADMIN_LISTING_DRAFTS_KEY, "detail", id, demoMode],
    enabled: id !== null,
    retry: false,
    queryFn: () =>
      demoMode ? demoListingDraft(id ?? "") : getAdminListingDraft(id ?? ""),
  });
}

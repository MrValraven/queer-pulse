import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import type { ItemsPage } from "../../../shared/api/pagination";
import {
  getAdminCreatorDraft,
  getAdminCreatorDrafts,
  type AdminCreatorDraftDetail,
  type AdminCreatorDraftRow,
  type CreatorDraftKind,
} from "./adminCreatorDrafts.api";

export const ADMIN_CREATOR_DRAFTS_KEY = "admin-creator-drafts";
export const ADMIN_CREATOR_DRAFT_KEY = "admin-creator-draft";

/** The server order: newest save first, then kind ascending, then id
 *  descending. */
function compareDemoRows(
  left: AdminCreatorDraftRow,
  right: AdminCreatorDraftRow,
): number {
  return (
    Date.parse(right.lastSavedAt) - Date.parse(left.lastSavedAt) ||
    left.kind.localeCompare(right.kind) ||
    right.id.localeCompare(left.id)
  );
}

/** One synthetic page of the demo fixtures. The module loads on demand so the
 *  fabricated rows stay out of the live chunk. */
async function demoCreatorDraftsPage(
  kind: CreatorDraftKind | null,
): Promise<ItemsPage<AdminCreatorDraftRow>> {
  const { ADMIN_CREATOR_DRAFTS } = await import("../adminCreatorDrafts.data");
  const items = ADMIN_CREATOR_DRAFTS.filter(
    (row) => kind === null || row.kind === kind,
  ).sort(compareDemoRows);
  return { items, total: items.length, page: 1, pageSize: items.length || 1 };
}

/**
 * Every unfinished creator draft, paginated, optionally narrowed to one kind.
 * `total` counts the whole filtered set, whatever pages have loaded so far.
 * Demo answers from the colocated fixtures and never touches the network:
 * the endpoint is Admin only and the fixtures are fabricated.
 */
export function useAdminCreatorDrafts(kind: CreatorDraftKind | null) {
  const { demoMode } = useDemoMode();
  const query = useInfiniteQuery<ItemsPage<AdminCreatorDraftRow>>({
    queryKey: [ADMIN_CREATOR_DRAFTS_KEY, demoMode, kind ?? "all"],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      demoMode
        ? demoCreatorDraftsPage(kind)
        : getAdminCreatorDrafts({ kind, page: pageParam as number }),
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
  });
  const rows = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  return { ...query, rows, total };
}

async function demoCreatorDraft(
  kind: CreatorDraftKind,
  id: string,
): Promise<AdminCreatorDraftDetail> {
  const { demoAdminCreatorDraftDetail } =
    await import("../adminCreatorDraftPreviews.data");
  const detail = demoAdminCreatorDraftDetail(kind, id);
  if (!detail) {
    throw new ApiError(404, "Creator draft not found", {
      code: "creator_draft_not_found",
    });
  }
  return detail;
}

/**
 * One draft opened for a read-only preview. Every live read writes an audit
 * row, so the query keeps nothing (`staleTime` and `gcTime` 0) and never
 * refetches on focus or reconnect: each open is one read. Not retried: a 404
 * means the creator published or discarded the draft in the meantime. Demo
 * writes no audit row.
 */
export function useAdminCreatorDraft(kind: CreatorDraftKind, id: string) {
  const { demoMode } = useDemoMode();
  return useQuery<AdminCreatorDraftDetail>({
    queryKey: [ADMIN_CREATOR_DRAFT_KEY, demoMode, kind, id],
    staleTime: 0,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: () =>
      demoMode ? demoCreatorDraft(kind, id) : getAdminCreatorDraft(kind, id),
  });
}

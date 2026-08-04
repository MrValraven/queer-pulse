import { QueryClient, type InfiniteData } from "@tanstack/react-query";
import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import {
  LISTING_BULK_ACTION_CAP,
  type AdminListingsPageVM,
  type ListingQueueCounts,
  type ListingQueueRow,
} from "./adminListings.api";
import { ADMIN_LISTINGS_KEY, patchListingInCache } from "./useAdminListings";
import { useSetListingStatus } from "./useSetListingStatus";

/**
 * Admin listings moderation — optimistic cache patch (audit item #15).
 *
 * The queue is `useInfiniteQuery`-backed and every moderation mutation patches
 * the shared cache in `onMutate` (no local override map). These tests pin that
 * single-source-of-truth behaviour: a status move updates the row in place for
 * an unscoped ("all") page and DROPS it from a status-scoped page it no longer
 * matches, and a removal drops it entirely.
 *
 * Demo mode is forced on (empty VITE_API_URL), so the real `useSetListingStatus`
 * mutation runs its optimistic patch without touching the network.
 */
const COUNTS: ListingQueueCounts = { all: 4, review: 2, question: 1, live: 1 };

function makeRow(ref: string, status: ListingQueueRow["status"]): ListingQueueRow {
  return {
    ref,
    slug: `slug-${ref}`,
    name: `Listing ${ref}`,
    hood: "Arroios",
    status,
    submitterName: "Rita V",
    submitterSlug: "rita",
    createdAt: "2026-07-23T10:00:00Z",
    // The moderation preview payload — never read by the cache patch itself.
    detail: {} as ListingQueueRow["detail"],
  };
}

function makePage(rows: ListingQueueRow[]): InfiniteData<AdminListingsPageVM> {
  return {
    pages: [{ rows, total: rows.length, page: 1, pageSize: 20, counts: COUNTS }],
    pageParams: [1],
  };
}

/** Build the full infinite-query key for one status filter (mirrors the private
 *  `adminListingsQueryKey`: `[KEY, demoMode, status|"all", q, sort]`). */
function keyFor(status: "all" | ListingQueueRow["status"]) {
  return [ADMIN_LISTINGS_KEY, true, status, "", "newest"] as const;
}

describe("patchListingInCache", () => {
  it("moves a row in place for the unscoped queue but drops it from a tab it no longer matches", () => {
    const client = new QueryClient();
    client.setQueryData(keyFor("all"), makePage([makeRow("L1", "review")]));
    client.setQueryData(keyFor("review"), makePage([makeRow("L1", "review")]));

    // Approve L1: review → live.
    patchListingInCache(client, true, "L1", (row) => ({ ...row, status: "live" }));

    const allPage = client.getQueryData<InfiniteData<AdminListingsPageVM>>(
      keyFor("all"),
    );
    const reviewPage = client.getQueryData<InfiniteData<AdminListingsPageVM>>(
      keyFor("review"),
    );

    // "all" keeps the row, now Live.
    expect(allPage?.pages[0]?.rows).toHaveLength(1);
    expect(allPage?.pages[0]?.rows[0]?.status).toBe("live");
    // The "In review" tab no longer contains a Live listing.
    expect(reviewPage?.pages[0]?.rows).toHaveLength(0);
  });

  it("drops the row from every cached page when the updater removes it", () => {
    const client = new QueryClient();
    client.setQueryData(keyFor("all"), makePage([makeRow("L1", "review"), makeRow("L2", "review")]));

    patchListingInCache(client, true, "L1", () => null);

    const allPage = client.getQueryData<InfiniteData<AdminListingsPageVM>>(
      keyFor("all"),
    );
    expect(allPage?.pages[0]?.rows.map((row) => row.ref)).toEqual(["L2"]);
  });
});

describe("useSetListingStatus (approve action)", () => {
  it("optimistically patches the cached queue row to its new status", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const row = makeRow("L1", "review");
    client.setQueryData(keyFor("all"), makePage([row]));

    const { result } = renderHook(() => useSetListingStatus(), {
      wrapper: ({ children }) => (
        <TestProviders queryClient={client}>{children}</TestProviders>
      ),
    });

    await act(async () => {
      await result.current.mutateAsync({ row, status: "live" });
    });

    await waitFor(() => {
      const patched = client.getQueryData<InfiniteData<AdminListingsPageVM>>(
        keyFor("all"),
      );
      expect(patched?.pages[0]?.rows[0]?.status).toBe("live");
    });
  });
});

describe("bulk multi-select cap", () => {
  // The bulk-action cap mirrors the backend's `@ArrayMaxSize(200)`.
  it("caps a bulk action at 200 refs", () => {
    expect(LISTING_BULK_ACTION_CAP).toBe(200);
  });

  // NOTE: the *selection* enforcement of this cap (unselected checkboxes
  // disabling once 200 are picked) lives inside `AdminListingsPage`'s
  // `toggleSelected` / `toggleSelectAll` set reducers, which are component-local
  // and not exported. Exercising that at runtime needs a full page render seeded
  // with >200 queue rows; it is asserted here only at the constant level.
});

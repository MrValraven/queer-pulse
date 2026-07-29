import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../../app/providers/authContext";
import { DIRECTORY_KEY } from "../../api/useDirectory";
import type { ListingDraft, PendingListing } from "../listBusiness.data";
import {
  createListing,
  deleteListing,
  getListing,
  getMyListings,
  updateListing,
  type CreateListingDto,
  type ListingDTO,
} from "./listings.api";
import { listingDtoToPending } from "./listings.adapters";

export interface MyListingsResult {
  items: PendingListing[];
  total: number;
}

/**
 * The caller's own submitted listings. Demo mode never hits the network — the
 * DirectoryListingsProvider keeps its own local demo array as the source, so
 * the query is simply disabled and returns a placeholder. Live mode calls
 * GET /listings/mine and adapts each DTO to the PendingListing view-model.
 */
export function useMyListings(page = 1) {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  return useQuery<MyListingsResult>({
    queryKey: ["listings", "mine", demoMode, page],
    enabled: !demoMode && loggedIn,
    queryFn: async () => {
      const res = await getMyListings(page);
      return {
        items: res.items.map(listingDtoToPending),
        total: res.total,
      };
    },
  });
}

/**
 * Every one of the caller's own listings, across all pages. The backend page
 * size is a fixed `PAGE_SIZE = 20` with no size param, so consumers that need
 * to see listing #21+ (ownership checks, the account listings grid) must
 * accumulate pages themselves rather than reading page 1 alone via
 * `useMyListings`. Demo/logged-out disabled the same way.
 */
export function useAllMyListings() {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  return useQuery<MyListingsResult>({
    queryKey: ["listings", "mine", "all", demoMode],
    enabled: !demoMode && loggedIn,
    queryFn: async () => {
      const first = await getMyListings(1);
      const items = [...first.items];
      let page = 2;
      const MAX_PAGES = 50; // safety ceiling (1000 listings at PAGE_SIZE=20) — far beyond any real owner
      // Loop remaining pages; stop when we've collected `total`, a page comes
      // back empty, or we hit the ceiling (defends against a hypothetical
      // backend regression that returns non-empty pages indefinitely).
      while (items.length < first.total && page <= MAX_PAGES) {
        const next = await getMyListings(page);
        if (next.items.length === 0) break;
        items.push(...next.items);
        page += 1;
      }
      return { items: items.map(listingDtoToPending), total: first.total };
    },
  });
}

/**
 * Create / withdraw mutations for directory listings. Each branches on
 * `demoMode`: demo is a no-op (the provider keeps its optimistic local state),
 * and live calls the API then invalidates the ["listings"] tree so the
 * useMyListings query refetches. Demo mode never touches the network.
 */
export function useListingMutations() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  const createListingMutation = useMutation<
    PendingListing | null,
    Error,
    CreateListingDto
  >({
    // ListingWizard awaits addListing (→ this mutateAsync) and toasts its own
    // error in a catch, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async (dto) => {
      if (demoMode) return null;
      const res = await createListing(dto);
      return listingDtoToPending(res);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });

  const withdrawListingMutation = useMutation<void, Error, string>({
    mutationFn: async (ref) => {
      if (demoMode) return;
      await deleteListing(ref);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });

  return {
    createListing: createListingMutation,
    withdrawListing: withdrawListingMutation,
  };
}

/** Owner-gated single listing for the edit flow. Disabled in demo / when no ref. */
export function useOwnedListing(ref: string | undefined) {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const query = useQuery<ListingDTO>({
    queryKey: ["listings", "detail", ref],
    enabled: !demoMode && loggedIn && Boolean(ref),
    queryFn: () => getListing(ref as string),
  });
  return { listing: query.data, isLoading: query.isLoading, error: query.error };
}

/** PATCH an owned listing. Sends the full clean draft; backend leaves status untouched. */
export function useUpdateListing() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<ListingDTO | null, Error, { ref: string; draft: ListingDraft }>({
    // useEditListingSave re-throws so ListingWizard toasts via showSaveError, so
    // silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ ref, draft }) => {
      if (demoMode) return null;
      return updateListing(ref, draft);
    },
    onSuccess: (data, variables) => {
      if (demoMode) return;
      // Optimistically patch the cached "my listings" rows with the server's
      // fresh record so the account grid shows the edit instantly — the
      // invalidation below refetches to reconcile, but react-query keeps
      // serving the stale cached list until that lands, which would otherwise
      // flash the pre-edit version. Fuzzy key match covers both the paged
      // `useMyListings` and the all-pages `useAllMyListings` caches.
      if (data) {
        const patched = listingDtoToPending(data);
        queryClient.setQueriesData<MyListingsResult>(
          { queryKey: ["listings", "mine"] },
          (prev) =>
            prev
              ? {
                  ...prev,
                  items: prev.items.map((item) =>
                    item.ref === patched.ref ? patched : item,
                  ),
                }
              : prev,
        );
      }
      void queryClient.invalidateQueries({ queryKey: ["listings"] });
      void queryClient.invalidateQueries({ queryKey: ["listings", "detail", variables.ref] });
      // Refresh the public directory + map so a moved/cleared pin updates.
      void queryClient.invalidateQueries({ queryKey: [DIRECTORY_KEY] });
    },
  });
}

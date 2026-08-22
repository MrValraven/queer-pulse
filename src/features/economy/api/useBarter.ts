import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { BARTERS, type Barter, type Mode } from "../barter.data";
import type {
  BarterProposalRow,
  MyBarterListingRow,
} from "../barterProposals.data";
import {
  barterListingToView,
  barterProposalToRow,
  myBarterListingToRow,
  type BarterView,
} from "./barter.adapters";
import {
  createBarterListing,
  decideBarterProposal,
  getBarterListing,
  getBarterListings,
  getBarterProposals,
  getMyBarterListings,
  proposeBarterSwap,
  type BarterCategoryKey,
  type BarterProposalAckDTO,
  type BarterProposalDecision,
  type CreateBarterListingBody,
} from "./barter.api";
import { economyKeys } from "./economyKeys";

export interface BarterBoardFilters {
  /** `"all"` is the chip, not a value the API knows — it is sent as no filter. */
  category: string;
  mode: "all" | Mode;
  query: string;
}

/** The board's own predicate, kept for demo mode so the seeded fixtures filter
 *  exactly the way the live query does (offering/seeking include `both`). */
function matchesDemoFilters(barter: Barter, filters: BarterBoardFilters) {
  if (filters.mode === "offering" && barter.mode === "seeking") return false;
  if (filters.mode === "seeking" && barter.mode === "offering") return false;
  if (filters.category !== "all" && barter.category !== filters.category) {
    return false;
  }
  const term = filters.query.trim().toLowerCase();
  if (!term) return true;
  const haystack = [
    barter.offer,
    barter.want,
    barter.offerDetail,
    barter.wantDetail,
    barter.tags.join(" "),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(term);
}

interface BarterBoardPageVM {
  items: BarterView[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * The skill-exchange board, paginated. Demo filters the seeded fixtures in
 * memory and returns them as one synthetic page; live asks `GET /barter` with
 * the same three controls, one page at a time, so the server does the filtering
 * (and the block/mute severance) rather than the client.
 *
 * Paginated because the board previously read page 1 and dropped `total`: past
 * the first server page, listings simply were not on the board and nothing on
 * screen said so. `hasNextPage`/`fetchNextPage` back the "Show more" control,
 * matching the housing and flatmate boards.
 */
export function useBarterListings(filters: BarterBoardFilters) {
  const { demoMode } = useDemoMode();
  const params = {
    category: filters.category === "all" ? undefined : filters.category,
    mode: filters.mode === "all" ? undefined : filters.mode,
    q: filters.query.trim() || undefined,
  };

  const query = useInfiniteQuery<BarterBoardPageVM>({
    queryKey: economyKeys.barter(demoMode, params),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        // One synthetic page holding the whole filtered fixture: `page *
        // pageSize` equals `total`, so `getNextPageParam` yields undefined and
        // demo mode never issues a page-2 fetch.
        const items = BARTERS.filter((barter) =>
          matchesDemoFilters(barter, filters),
        );
        return { items, total: items.length, page: 1, pageSize: items.length };
      }
      const listingPage = await getBarterListings({
        category: params.category as BarterCategoryKey | undefined,
        mode: params.mode,
        q: params.q,
        page: pageParam as number,
      });
      return {
        items: listingPage.items.map((listing) => barterListingToView(listing)),
        total: listingPage.total,
        page: listingPage.page,
        pageSize: listingPage.pageSize,
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
    // Keep the previous filter's results on screen while the new ones load, so
    // changing a chip doesn't blank the board.
    placeholderData: keepPreviousData,
  });

  const listings = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? listings.length;
  return { ...query, listings, total };
}

/**
 * One swap listing. Demo reads the fixture by id; live fetches it so the
 * detail page can show a real post instead of the coming-soon panel it used to
 * stand in with.
 */
export function useBarterListing(id: string | undefined) {
  const { demoMode } = useDemoMode();
  return useQuery<BarterView | null>({
    queryKey: economyKeys.barterListing(id, demoMode),
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) return null;
      if (demoMode) return BARTERS.find((barter) => barter.id === id) ?? null;
      return barterListingToView(await getBarterListing(id));
    },
  });
}

/**
 * Send a swap proposal. Demo fakes the round trip; live delivers it to the
 * poster's inbox and returns the conversation.
 *
 * `silentError` because the propose card surfaces the API's real refusals
 * itself (your own listing, blocked, the listing is gone) — without it the
 * global mutation handler would toast a generic message alongside.
 */
export function useProposeBarterSwap(listingId: string | undefined) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  return useMutation<BarterProposalAckDTO | null, Error, string>({
    meta: { silentError: true },
    mutationFn: async (message) => {
      if (demoMode || !listingId) {
        await new Promise((resolve) => setTimeout(resolve, 550));
        return null;
      }
      return proposeBarterSwap(listingId, message);
    },
    onSuccess: () => {
      if (demoMode || !listingId) return;
      // Refetch so `hasProposed` comes back from the server rather than being
      // guessed here.
      void queryClient.invalidateQueries({
        queryKey: economyKeys.barterListingById(listingId),
      });
    },
  });
}

/** Post a swap to the exchange. Demo returns null and lets the strip prepend
 *  its own local card; live creates the listing and refreshes the board. */
export function useCreateBarterListing() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();

  return useMutation<BarterView | null, Error, CreateBarterListingBody>({
    meta: { silentError: true },
    mutationFn: async (body) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 550));
        return null;
      }
      return barterListingToView(await createBarterListing(body));
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: economyKeys.barterRoot });
    },
  });
}

/**
 * The swaps you posted, with the number of proposals still waiting on you
 * (`GET /barter/mine`). Demo loads the colocated fixture on demand so it never
 * ships in the live bundle; live fetches and maps the real rows.
 */
export function useMyBarterListings() {
  const { demoMode } = useDemoMode();
  return useQuery<MyBarterListingRow[]>({
    queryKey: economyKeys.myBarter(demoMode),
    queryFn: async ({ signal }) => {
      if (demoMode) {
        const { DEMO_MY_BARTER_LISTINGS } = await import(
          "../barterProposals.data"
        );
        return DEMO_MY_BARTER_LISTINGS;
      }
      const dtos = await getMyBarterListings(signal);
      return dtos.map((dto) => myBarterListingToRow(dto));
    },
  });
}

/**
 * The proposals on one listing you posted (`GET /barter/:id/proposals`).
 *
 * A 403 (not the poster) and a 404 (no such listing) both surface as the
 * query's error state, which the inbox reads to say which one happened rather
 * than showing one generic failure.
 */
export function useBarterProposals(listingId: string | undefined) {
  const { demoMode } = useDemoMode();
  return useQuery<BarterProposalRow[]>({
    queryKey: economyKeys.barterProposals(listingId, demoMode),
    enabled: Boolean(listingId),
    queryFn: async ({ signal }) => {
      if (!listingId) return [];
      if (demoMode) {
        const { DEMO_BARTER_PROPOSALS } = await import(
          "../barterProposals.data"
        );
        return DEMO_BARTER_PROPOSALS[listingId] ?? [];
      }
      const dtos = await getBarterProposals(listingId, signal);
      return dtos.map(barterProposalToRow);
    },
  });
}

export interface DecideBarterProposalInput {
  proposalId: string;
  status: BarterProposalDecision;
}

/**
 * PATCH /barter/:id/proposals/:proposalId — the owner's answer.
 *
 * A decision is one-way and the backend enforces it: 409 when the proposal was
 * already decided, 403 when the caller is not the poster, 404 when the listing
 * or proposal is gone. All reach the caller as an `ApiError` so the inbox can
 * name what happened.
 *
 * Nothing changes on screen before the server answers. The cached row is
 * replaced in `onSuccess` with the proposal the server returned, so the
 * displayed status is always the stored one, and the owner's listing set is
 * invalidated so its pending count comes back counted rather than guessed.
 *
 * `silentError` because the inbox writes the refusal onto the row it belongs
 * to; without it the global mutation handler would toast a generic message
 * alongside.
 */
export function useDecideBarterProposal(listingId: string | undefined) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const key = economyKeys.barterProposals(listingId, demoMode);

  return useMutation<BarterProposalRow | null, Error, DecideBarterProposalInput>(
    {
      meta: { silentError: true },
      mutationFn: async ({ proposalId, status }) => {
        if (demoMode) {
          await new Promise((resolve) => setTimeout(resolve, 450));
          const current = queryClient
            .getQueryData<BarterProposalRow[]>(key)
            ?.find((row) => row.id === proposalId);
          return current
            ? { ...current, status, decidedAt: new Date().toISOString() }
            : null;
        }
        // Live with no listing selected has nothing to write against. Failing
        // is the honest answer; faking a resolved decision would move the row
        // on screen while the server never heard about it.
        if (!listingId) throw new Error("No swap listing selected");
        return barterProposalToRow(
          await decideBarterProposal(listingId, proposalId, status),
        );
      },
      onSuccess: (decided) => {
        if (!decided) return;
        queryClient.setQueryData<BarterProposalRow[]>(key, (previous) =>
          (previous ?? []).map((row) =>
            row.id === decided.id ? decided : row,
          ),
        );
        if (demoMode) return;
        void queryClient.invalidateQueries({
          queryKey: economyKeys.myBarterRoot,
        });
      },
    },
  );
}

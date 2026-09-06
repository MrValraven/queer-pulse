import { useMemo } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { apiGet } from "../../../shared/api/client";
import { toItemsPage } from "../../../shared/api/pagination";
import type { Paginated } from "../../../shared/api/refs";
import { getRoster, type RosterEntryDTO } from "./communities.api";
import { rosterEntryToRosterMember } from "./communities.adapters";
import { getLiving } from "../livingCommunities.data";
import type { RosterMember } from "../community.model";
import type { PulsePaging } from "./useCommunityPosts";

export interface RosterResult extends PulsePaging {
  roster: RosterMember[];
}

interface RosterPageVM {
  items: RosterMember[];
  total: number;
  page: number;
}

/**
 * A community's roster, paginated. Demo returns the flagship's mock roster
 * synchronously with `hasNextPage: false`, so the Members tab renders exactly
 * as it does today and never touches the network. Live mode calls GET
 * /communities/:slug/roster?page= and appends each page, stopping at the
 * server `total` — mirrors `useCommunityPosts`'s pagination shape exactly.
 * Private-community 404s surface as an empty roster — the not-found gate
 * lives in `useCommunity`.
 */
export function useRoster(slug: string | undefined): RosterResult {
  const { demoMode } = useDemoMode();
  // `language` is in the key because a nulled-out member ref maps to the
  // translated "A member" placeholder inside the adapter.
  const { t, language } = useTranslation();
  const query = useInfiniteQuery<RosterPageVM>({
    queryKey: ["roster", slug, demoMode, language],
    enabled: !demoMode && Boolean(slug),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const res = await getRoster(slug!, pageParam as number);
      return {
        items: res.items.map((entry) => rosterEntryToRosterMember(entry, t)),
        total: res.total,
        page: res.page,
      };
    },
    getNextPageParam: (last, all) => {
      const loaded = all.reduce((n, p) => n + p.items.length, 0);
      return loaded < last.total ? last.page + 1 : undefined;
    },
  });

  const roster = useMemo(
    () => (query.data?.pages ?? []).flatMap((p) => p.items),
    [query.data],
  );

  if (demoMode) {
    return {
      roster: getLiving(slug)?.roster ?? [],
      hasNextPage: false,
      fetchNextPage: () => {},
      isFetchingNextPage: false,
      isError: false,
      refetch: () => {},
    };
  }
  return {
    roster,
    hasNextPage: query.hasNextPage,
    fetchNextPage: () => void query.fetchNextPage(),
    isFetchingNextPage: query.isFetchingNextPage,
    // A failed roster read used to collapse to `[]`, which the detail page
    // then backfilled with the organiser alone — a community that looks like
    // it has one member (DES-22).
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

/**
 * Longest search term the server will accept. `RosterQuery.q` is
 * `@MaxLength(200)`, so anything longer comes back a 400 rather than a result
 * set: the term is clipped here so a paste into the search box still searches.
 */
const ROSTER_SEARCH_MAX_LENGTH = 200;

export interface RosterSearchResult {
  /** The matching roster rows, or an empty list before the first answer. */
  members: RosterMember[];
  /** A search is in flight and has nothing to show yet. */
  isSearching: boolean;
  /** The search request failed. Never render this as "nobody matches". */
  isError: boolean;
  retry: () => void;
}

/**
 * One page of a community's roster filtered SERVER-SIDE by `q`.
 *
 * `getRoster` covers the plain paginated read the Members pane walks; this
 * variant carries the search term and an `AbortSignal`, so react-query can drop
 * a superseded request on the wire instead of letting a slow answer for "an"
 * land after the answer for "anna".
 */
async function fetchRosterSearch(
  slug: string,
  term: string,
  signal?: AbortSignal,
) {
  const searchParams = new URLSearchParams({ q: term });
  const response = await apiGet<RosterEntryDTO[] | Paginated<RosterEntryDTO>>(
    `/communities/${slug}/roster?${searchParams.toString()}`,
    undefined,
    undefined,
    signal,
  );
  return toItemsPage(response);
}

/**
 * Search a community's whole roster from the server (PRD-149).
 *
 * `useRoster` above answers "who is on page N", which is the wrong question for
 * a picker: filtering the pages a client happens to hold can never find the
 * member on page nine, so in a 200-member community a search box over the
 * loaded pages returns nothing for most of the roster. This asks the server
 * instead, which matches first name, last name, full name and handle
 * case-insensitively across every member.
 *
 * The term is part of the query key, so each term caches on its own and going
 * back to a term already typed is instant. Demo mode never fans out: the caller
 * holds the flagship's mock roster already and filters it locally, the same way
 * every other live/demo pair in this feature splits.
 *
 * Pass an already-debounced term. This hook does no debouncing of its own, so
 * the caller decides when a keystroke becomes a request.
 */
export function useRosterSearch(
  slug: string | undefined,
  term: string,
): RosterSearchResult {
  const { demoMode } = useDemoMode();
  // `language` is in the key for the same reason `useRoster`'s is: a nulled-out
  // member ref maps to a translated placeholder inside the adapter.
  const { t, language } = useTranslation();
  const searchTerm = term.trim().slice(0, ROSTER_SEARCH_MAX_LENGTH);
  // An empty `q` is a 400 (`@MinLength(1)`), and an empty search box is not a
  // question anyway.
  const isEnabled = !demoMode && Boolean(slug) && searchTerm.length > 0;

  const query = useQuery<RosterMember[]>({
    queryKey: ["rosterSearch", slug, searchTerm, demoMode, language],
    enabled: isEnabled,
    queryFn: async ({ signal }) => {
      const page = await fetchRosterSearch(slug!, searchTerm, signal);
      return page.items.map((entry) => rosterEntryToRosterMember(entry, t));
    },
  });

  return {
    members: isEnabled ? (query.data ?? []) : [],
    isSearching: isEnabled && query.isPending,
    isError: isEnabled && query.isError,
    retry: () => void query.refetch(),
  };
}

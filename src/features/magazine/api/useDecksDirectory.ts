import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { SlideDeck } from "../data/decks";
import { deckListItemToDeck } from "./magazine.adapters";
import { getDecks } from "./magazine.api";

/** One loaded page of the decks index, already adapted to the reader shape. */
interface DecksDirectoryPage {
  decks: SlideDeck[];
  total: number;
  page: number;
}

export interface DecksDirectoryResult {
  /** Every deck loaded so far, flattened across the pages fetched. */
  decks: SlideDeck[];
  /** Server-reported total across all pages (demo: the registry length). */
  total: number;
  /** True while another page is available (always false in demo). */
  hasNextPage: boolean;
  /** Fetch and append the next page. */
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  isError: boolean;
  /** The thrown error, so the page can tell a 401 (every magazine read sits
   *  behind `ActiveMemberGuard`) from a genuine failure and show the
   *  members-only wall instead of a retry panel. Same split as CON-07. */
  error: Error | null;
  refetch: () => void;
}

/**
 * PRD-105 — the decks index (`DecksPage`), the browse surface decks never had.
 *
 * Until this hook existed, `GET /magazine/decks` was only ever read for the
 * single newest deck on the magazine front (`useMagazineHome` keeps
 * `decks[0]`) and for the same-tag rail on a deck already open
 * (`useDeck`). Magazine search and the section browse both query ARTICLES, and
 * the issue run order carries no deck slots, so the moment a second deck
 * published the first one left the magazine for anyone without the link.
 * The endpoint has always paginated (`ListDecksQuery.page`); nothing walked it.
 *
 * Demo mode reads the code-split mock registry (dynamically imported so it
 * never ships in the live bundle, exactly as `useDeck` does) and returns it as
 * one synthetic page, so demo never shows a "Load more". `language` sits in
 * the key because `deckListItemToDeck` locale-formats each deck's `date`.
 */
export function useDecksDirectory(): DecksDirectoryResult {
  const { demoMode } = useDemoMode();
  const fmt = useFormat();
  const { language } = useTranslation();

  const decksQuery = useInfiniteQuery<DecksDirectoryPage>({
    queryKey: ["magazine-decks-directory", demoMode, language],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const { decks } = await import("../data/decks.mock");
        const all = Object.values(decks);
        return { decks: all, total: all.length, page: 1 };
      }
      const page = await getDecks({ page: pageParam as number });
      return {
        decks: page.items.map((item) => deckListItemToDeck(item, fmt)),
        total: page.total,
        page: page.page,
      };
    },
    getNextPageParam: (lastPage, loadedPages) => {
      const loaded = loadedPages.reduce(
        (count, page) => count + page.decks.length,
        0,
      );
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
  });

  const pages = decksQuery.data?.pages ?? [];
  return {
    decks: pages.flatMap((page) => page.decks),
    total: pages[0]?.total ?? 0,
    hasNextPage: decksQuery.hasNextPage,
    fetchNextPage: () => void decksQuery.fetchNextPage(),
    isFetchingNextPage: decksQuery.isFetchingNextPage,
    isLoading: decksQuery.isLoading,
    isError: decksQuery.isError,
    error: decksQuery.error,
    refetch: () => void decksQuery.refetch(),
  };
}

import { useMemo } from "react";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { firstPlainText, type Article } from "../data/articles";
import { nodeToText } from "../nodeText";
import { articleListItemToArticle } from "./magazine.adapters";
import { getArticles } from "./magazine.api";
import { useReaderLanguage } from "./useReaderLanguage";

/**
 * Demo-only. The curated `articles.mock` registry carries a byline STRING and
 * no author slug, so an `?author=` browse matches it the way a slug is derived
 * from a name. Live mode never reaches this: the backend filters on the real
 * `author` column.
 */
function bylineSlug(byline: string): string {
  return byline
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface MagazineSearchCriteria {
  /** Free-text term. Empty means "not searching by text". */
  q: string;
  /** Exact tag to browse. Empty means "not filtering by tag". */
  tag: string;
  /**
   * PRD-112: an author slug, so a writer's "All 25 articles" opens their real
   * back catalogue instead of the magazine front. Empty means "not filtering
   * by author". Combines with `q` and `tag` the same way they combine with
   * each other.
   */
  author: string;
}

/** One loaded page of hits. `page` is the server's own echo, so the next page
 *  number is read off the response rather than counted client-side. */
interface MagazineSearchPage {
  articles: Article[];
  total: number;
  page: number;
}

export interface MagazineSearchResult {
  articles: Article[];
  /** Total matches across all pages, so the page can say how many there are. */
  total: number;
  isLoading: boolean;
  isError: boolean;
  /** The failure itself, so the page can tell a 401 (members-only, sign in)
   *  apart from a request that genuinely broke. */
  error: unknown;
  /** Re-runs the search. Wired to the error state's retry, so a dropped
   *  request costs one tap rather than a page reload. */
  refetch: () => void;
  /**
   * False when the reader has typed nothing and picked no tag. The page shows
   * its "start typing" state then, and no request is made — distinct from a
   * search that ran and found nothing.
   */
  hasCriteria: boolean;
  /** PRD-103: more hits exist on the server than are on screen. */
  hasMore: boolean;
  /** Appends the next page of hits to the ones already shown. */
  loadMore: () => void;
  isLoadingMore: boolean;
}

/**
 * CON-12 — the magazine's own search, over the whole published archive.
 *
 * Live mode calls `GET /magazine/articles?q=&tag=`, which matches against the
 * `search_vector` generated column (title, dek, standfirst, tags, and both
 * body representations) and returns hits ranked by relevance rather than in
 * publish order. `q` and `tag` combine: a tag can be narrowed with a term.
 *
 * Demo mode has no index to search, so it filters the curated `articles.mock`
 * registry client-side on title, byline, tags and the first body paragraph.
 * That is a shallower match than the live one by design: the mock bodies are
 * JSX, not text, and faking a deeper search there would only make demo results
 * disagree with live ones in a way nobody could explain.
 *
 * `placeholderData: keepPreviousData` keeps the previous hits on screen while
 * a new term's request is in flight, so typing never flashes the list to
 * empty. The query is disabled outright when there is nothing to search for.
 *
 * PRD-103: the backend caps a page at 20 rows, and this used to read page 1
 * and stop while the page printed the full `total`, so "43 pieces found"
 * showed 20 with no way to reach the other 23. It now pages through
 * `useInfiniteQuery` the way the article comment list and the community post
 * thread do: pages appended in load order, a "load more" driven by `hasMore`.
 */
export function useMagazineSearch({
  q,
  tag,
  author,
}: MagazineSearchCriteria): MagazineSearchResult {
  const { demoMode } = useDemoMode();
  const fmt = useFormat();
  // `language` joins the key because the adapter locale-formats AND translates
  // each card's kicker/meta, so a chrome-language switch must re-derive it.
  const { t, language } = useTranslation();
  // PRD-110: the CONTENT language, which the reader can pin with `?lang=`
  // independently of the chrome. It changes WHICH rows come back, so it joins
  // the key in its own right.
  const readerLanguage = useReaderLanguage();
  const term = q.trim();
  const hasCriteria = term.length > 0 || tag.length > 0 || author.length > 0;

  const query = useInfiniteQuery({
    queryKey: [
      "magazine-search",
      demoMode,
      language,
      readerLanguage,
      term,
      tag,
      author,
    ],
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<MagazineSearchPage> => {
      if (demoMode) {
        const { articles } = await import("../data/articles.mock");
        const needle = term.toLowerCase();
        const matches = Object.values(articles).filter((article) => {
          if (tag && !article.tags.includes(tag)) return false;
          if (author && bylineSlug(article.byline) !== author) return false;
          if (!needle) return true;
          const haystack = [
            nodeToText(article.title),
            article.byline,
            firstPlainText(article.body) ?? "",
            ...article.tags,
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(needle);
        });
        // The mock registry is small enough to answer in one page, so this is
        // always the terminal page in demo mode.
        return { articles: matches, total: matches.length, page: 1 };
      }
      const page = await getArticles({
        q: term || undefined,
        tag: tag || undefined,
        author: author || undefined,
        lang: readerLanguage,
        page: pageParam,
      });
      return {
        articles: page.items.map((item) =>
          articleListItemToArticle(item, fmt, t),
        ),
        total: page.total,
        page: page.page,
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      const loadedArticles = allPages.reduce(
        (count, loadedPage) => count + loadedPage.articles.length,
        0,
      );
      return loadedArticles < lastPage.total ? lastPage.page + 1 : undefined;
    },
    enabled: hasCriteria,
    placeholderData: keepPreviousData,
  });

  const articles = useMemo(
    () =>
      (query.data?.pages ?? []).flatMap((loadedPage) => loadedPage.articles),
    [query.data],
  );

  return {
    articles,
    total: query.data?.pages[0]?.total ?? 0,
    isLoading: hasCriteria && query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: () => void query.refetch(),
    hasCriteria,
    hasMore: Boolean(query.hasNextPage),
    loadMore: () => {
      void query.fetchNextPage();
    },
    isLoadingMore: query.isFetchingNextPage,
  };
}

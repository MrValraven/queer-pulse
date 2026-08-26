import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { firstPlainText, type Article } from "../data/articles";
import { nodeToText } from "../nodeText";
import { articleListItemToArticle } from "./magazine.adapters";
import { getArticles } from "./magazine.api";

export interface MagazineSearchCriteria {
  /** Free-text term. Empty means "not searching by text". */
  q: string;
  /** Exact tag to browse. Empty means "not filtering by tag". */
  tag: string;
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
 */
export function useMagazineSearch({
  q,
  tag,
}: MagazineSearchCriteria): MagazineSearchResult {
  const { demoMode } = useDemoMode();
  const fmt = useFormat();
  // `language` joins the key because the adapter locale-formats AND translates
  // each card's kicker/meta — a language switch must re-derive it.
  const { t, language } = useTranslation();
  const term = q.trim();
  const hasCriteria = term.length > 0 || tag.length > 0;

  const query = useQuery<{ articles: Article[]; total: number }>({
    queryKey: ["magazine-search", demoMode, language, term, tag],
    queryFn: async () => {
      if (demoMode) {
        const { articles } = await import("../data/articles.mock");
        const needle = term.toLowerCase();
        const matches = Object.values(articles).filter((article) => {
          if (tag && !article.tags.includes(tag)) return false;
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
        return { articles: matches, total: matches.length };
      }
      const page = await getArticles({
        q: term || undefined,
        tag: tag || undefined,
      });
      return {
        articles: page.items.map((item) =>
          articleListItemToArticle(item, fmt, t),
        ),
        total: page.total,
      };
    },
    enabled: hasCriteria,
    placeholderData: keepPreviousData,
  });

  return {
    articles: query.data?.articles ?? [],
    total: query.data?.total ?? 0,
    isLoading: hasCriteria && query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: () => void query.refetch(),
    hasCriteria,
  };
}

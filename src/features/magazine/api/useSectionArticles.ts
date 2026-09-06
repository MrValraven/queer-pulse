import { useMemo } from "react";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Article } from "../data/articles";
import { articleListItemToArticle } from "./magazine.adapters";
import { getArticles } from "./magazine.api";
import { useReaderLanguage } from "./useReaderLanguage";

/** One loaded page of a section. `page` is the server's own echo, so the next
 *  page number comes off the response rather than a client-side counter. */
interface SectionArticlesPage {
  articles: Article[];
  total: number;
  page: number;
}

/**
 * CNT-20 — the section/topic browse drill-down
 * (`MagazineSectionArticlesPage`): every published piece whose `section`
 * exactly matches the tile the reader picked on `MagazineSectionsPage`.
 * Mirrors `useArchive`'s shape — `section` joins the query key so each
 * section gets its own cache entry, and `placeholderData: keepPreviousData`
 * avoids a flash to empty while a fresh section's request is in flight.
 *
 * Demo mode filters the curated `articles.mock` registry client-side by
 * exact `section` match (the same free-text equality the live `?section=`
 * filter uses). Live mode calls `GET /magazine/articles?section=` and adapts
 * each row through `articleListItemToArticle` — the same adapter every
 * other live article list (`useArticle`'s related rail, etc.) already uses,
 * so the card renders identically to any other article list in the app.
 *
 * PRD-103: a section used to read page 1 and stop, so a section with more than
 * the backend's 20-row page held pieces no reader could reach. It now pages
 * through `useInfiniteQuery`, the same pattern as the magazine search and the
 * article comment list.
 *
 * PRD-110: `language` was already in the query key but was never sent to the
 * server, so a Portuguese reader browsed English headlines and only got
 * Portuguese after the click. The reader's content language now travels with
 * the request as `lang`.
 */
export function useSectionArticles(section: string) {
  const { demoMode } = useDemoMode();
  const fmt = useFormat();
  // `language` joins the key because the adapter locale-formats AND
  // translates each card's kicker/meta, so a chrome-language switch must
  // re-derive it.
  const { t, language } = useTranslation();
  // The CONTENT language, which the reader can pin with `?lang=`.
  const readerLanguage = useReaderLanguage();
  const query = useInfiniteQuery({
    queryKey: [
      "magazine-section-articles",
      demoMode,
      language,
      readerLanguage,
      section,
    ],
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<SectionArticlesPage> => {
      if (demoMode) {
        const { articles } = await import("../data/articles.mock");
        const matches = Object.values(articles).filter(
          (article) => article.section === section,
        );
        // The mock registry answers in one page, so this is always terminal.
        return { articles: matches, total: matches.length, page: 1 };
      }
      const page = await getArticles({
        section,
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
    enabled: section.length > 0,
    placeholderData: keepPreviousData,
  });

  const articles = useMemo(
    () =>
      (query.data?.pages ?? []).flatMap((loadedPage) => loadedPage.articles),
    [query.data],
  );

  return {
    articles,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
    /** PRD-103: more pieces exist in this section than are on screen. */
    hasMore: Boolean(query.hasNextPage),
    loadMore: () => {
      void query.fetchNextPage();
    },
    isLoadingMore: query.isFetchingNextPage,
  };
}

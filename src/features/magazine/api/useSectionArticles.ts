import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Article } from "../data/articles";
import { articleListItemToArticle } from "./magazine.adapters";
import { getArticles } from "./magazine.api";

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
 */
export function useSectionArticles(section: string) {
  const { demoMode } = useDemoMode();
  const fmt = useFormat();
  // `language` joins the key because the adapter now locale-formats AND
  // translates each card's kicker/meta — a language switch must re-derive it.
  const { t, language } = useTranslation();
  const query = useQuery<Article[]>({
    queryKey: ["magazine-section-articles", demoMode, language, section],
    queryFn: async () => {
      if (demoMode) {
        const { articles } = await import("../data/articles.mock");
        return Object.values(articles).filter(
          (article) => article.section === section,
        );
      }
      const page = await getArticles({ section });
      return page.items.map((item) => articleListItemToArticle(item, fmt, t));
    },
    enabled: section.length > 0,
    placeholderData: keepPreviousData,
  });
  return {
    articles: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

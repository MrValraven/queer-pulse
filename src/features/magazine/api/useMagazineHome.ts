import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getArticles, getDecks, type ArticleListItemDTO, type DeckListItemDTO } from "./magazine.api";

export interface MagazineHomeData {
  articles: ArticleListItemDTO[];
  decks: DeckListItemDTO[];
}

/**
 * CNT-3 fix: real content for the magazine front (`MagazineSections`) in
 * live mode — the most recently published articles and decks, straight off
 * the same public `GET /magazine/articles` / `GET /magazine/decks` endpoints
 * `ArticlePage`/`DeckPage` already use to read a single item by slug. Before
 * this hook, `MagazineSections` rendered `MagazineComingSoon` for the ENTIRE
 * front whenever `!demoMode`, regardless of whether anything had actually
 * been published — this is the fix for that: real data in, honest empty
 * state only when there truly is nothing published yet.
 *
 * Demo mode never calls this (`MagazineSections` renders its curated mock
 * sections instead, same as `useIssues`/`useArticle`'s own demo branches),
 * so the query stays disabled there rather than duplicating that branch.
 */
export function useMagazineHome() {
  const { demoMode } = useDemoMode();
  const query = useQuery<MagazineHomeData>({
    queryKey: ["magazine-home"],
    enabled: !demoMode,
    queryFn: async () => {
      const [articlesPage, decksPage] = await Promise.all([
        getArticles({ page: 1 }),
        getDecks({ page: 1 }),
      ]);
      return { articles: articlesPage.items, decks: decksPage.items };
    },
  });

  return { data: query.data, isLoading: query.isLoading, isError: query.isError };
}

import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getArticles,
  getDecks,
  type ArticleListItemDTO,
  type DeckListItemDTO,
} from "./magazine.api";
import { useReaderLanguage } from "./useReaderLanguage";

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
 *
 * PRD-110: the front used to ask for articles with no `lang`, so a Portuguese
 * reader browsed English headlines and only got Portuguese after clicking
 * through. The reader's content language now travels with the request, the
 * same one `useArticle` sends, and joins the query key because it changes
 * WHICH rows come back. Decks have no translation model, so `getDecks` is
 * unchanged.
 */
export function useMagazineHome() {
  const { demoMode } = useDemoMode();
  const readerLanguage = useReaderLanguage();
  const query = useQuery<MagazineHomeData>({
    queryKey: ["magazine-home", readerLanguage],
    enabled: !demoMode,
    queryFn: async () => {
      const [articlesPage, decksPage] = await Promise.all([
        getArticles({ page: 1, lang: readerLanguage }),
        getDecks({ page: 1 }),
      ]);
      return { articles: articlesPage.items, decks: decksPage.items };
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    /** The thrown error, so callers can tell a 401 (no session: every read
     *  endpoint sits behind `ActiveMemberGuard`) from a genuine failure and
     *  render a sign-in wall instead of a retry panel. CON-07. */
    error: query.error,
    refetch: query.refetch,
  };
}

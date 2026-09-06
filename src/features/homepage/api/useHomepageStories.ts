import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { useReaderLanguage } from "../../magazine/api/useReaderLanguage";
import {
  getArticles,
  type ArticleListItemDTO,
} from "../../magazine/api/magazine.api";

/** One feature story plus the two cards the `.row` grid holds. */
const HOMEPAGE_STORY_LIMIT = 3;

export interface HomepageStoriesResult {
  stories: ArticleListItemDTO[];
  isLoading: boolean;
  /** True when the request failed. The row renders nothing either way, so this
   *  exists to keep "nothing published yet" and "the request fell over" from
   *  being the same fact to a caller (DES-22). */
  isError: boolean;
  /** Re-runs the failed request, for a caller that chooses to offer a retry. */
  refetch: () => void;
}

/**
 * The most recently published magazine pieces, for the homepage's live
 * "told in our own words" row.
 *
 * Same shape of constraint as `useHomepageGatherings`: `GET /magazine/articles`
 * sits behind `ActiveMemberGuard` and the public `GET /landing/features` feed
 * has no stories slice, so this is gated on a signed-in session rather than
 * firing a guaranteed 403 from the public marketing page. A published-story
 * slice on `/landing/features` is what would open it to signed-out visitors.
 *
 * Demo mode renders the static `Stories` section instead, so the query stays
 * disabled there and no mock can reach the live path.
 */
export function useHomepageStories(): HomepageStoriesResult {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking } = useAuth();
  const isEnabled = !demoMode && loggedIn && !checking;

  // PRD-110 — the same language the magazine's own lists send. Without it a
  // Portuguese reader gets English headlines on the one screen everybody
  // lands on, then Portuguese text after the click. It joins the query key
  // because it changes WHICH rows come back, not just how they are formatted.
  const readerLanguage = useReaderLanguage();

  const query = useQuery<ArticleListItemDTO[]>({
    queryKey: ["homepage-stories", readerLanguage],
    enabled: isEnabled,
    queryFn: async () => {
      const page = await getArticles({ page: 1, lang: readerLanguage });
      return page.items;
    },
  });

  // Web-only/unpublished pieces carry a null `publishedAt` — the public
  // homepage only ever shows something that has actually been published.
  const stories = (query.data ?? [])
    .filter((article) => Boolean(article.publishedAt))
    .slice(0, HOMEPAGE_STORY_LIMIT);

  return {
    stories,
    isLoading: isEnabled && query.isPending,
    isError: isEnabled && query.isError,
    refetch: () => void query.refetch(),
  };
}

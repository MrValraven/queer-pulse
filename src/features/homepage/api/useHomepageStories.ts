import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useReaderLanguage } from "../../magazine/api/useReaderLanguage";
import {
  getArticles,
  type ArticleListItemDTO,
} from "../../magazine/api/magazine.api";
import {
  articleToStoryCard,
  landingStoryToStoryCard,
  type HomepageStoryCard,
} from "../sections/liveStories.adapters";
import { useLandingFeaturesPublic } from "./useLandingFeatures";

/** One feature story plus the two cards the `.row` grid holds. */
export const HOMEPAGE_STORY_LIMIT = 3;

export interface HomepageStoriesResult {
  stories: HomepageStoryCard[];
  isLoading: boolean;
  /** True when the request failed. The row renders nothing either way, so this
   *  exists to keep "nothing published yet" and "the request fell over" from
   *  being the same fact to a caller (DES-22). */
  isError: boolean;
  /** Re-runs the failed request, for a caller that chooses to offer a retry. */
  refetch: () => void;
}

/**
 * The magazine pieces for the homepage's live "told in our own words" row,
 * from one of two sources depending on who is looking:
 *
 * - **Signed-in member**: the most recently published pieces
 *   (`GET /magazine/articles`), which sits behind `ActiveMemberGuard`.
 * - **Signed-out visitor**: the admin-curated story slice of the public
 *   `GET /landing/features`, in the order the admin set. The backend drops a
 *   curated story once it is unpublished or deleted, and the CDN-cached
 *   response catches up within a few minutes. Nothing curated: the row
 *   renders nothing.
 *
 * While the session check is still running neither source is chosen and the
 * row stays empty. Demo mode renders the static `Stories` section instead, so
 * the magazine query stays disabled there and no mock can reach the live path.
 */
export function useHomepageStories(): HomepageStoriesResult {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking } = useAuth();
  const { t } = useTranslation();
  const isMemberSource = !demoMode && loggedIn && !checking;
  const isCuratedSource = !demoMode && !loggedIn && !checking;

  // PRD-110 — the same language the magazine's own lists send. Without it a
  // Portuguese reader gets English headlines on the one screen everybody
  // lands on, then Portuguese text after the click. It joins the query key
  // because it changes WHICH rows come back, not just how they are formatted.
  const readerLanguage = useReaderLanguage();

  const magazineQuery = useQuery<ArticleListItemDTO[]>({
    queryKey: ["homepage-stories", readerLanguage],
    enabled: isMemberSource,
    queryFn: async () => {
      const page = await getArticles({ page: 1, lang: readerLanguage });
      return page.items;
    },
  });
  // Shares its query key with every other `Live*` section on the page, so
  // this adds no request of its own.
  const curated = useLandingFeaturesPublic();

  if (isCuratedSource) {
    return {
      stories: curated.stories
        .slice(0, HOMEPAGE_STORY_LIMIT)
        .map((feature) => landingStoryToStoryCard(feature, t)),
      isLoading: curated.isLoading,
      isError: curated.isError,
      refetch: curated.refetch,
    };
  }

  // Web-only/unpublished pieces carry a null `publishedAt` — the public
  // homepage only ever shows something that has actually been published.
  const stories = (magazineQuery.data ?? [])
    .filter((article) => Boolean(article.publishedAt))
    .slice(0, HOMEPAGE_STORY_LIMIT)
    .map((article) => articleToStoryCard(article, t));

  return {
    stories,
    isLoading: isMemberSource && magazineQuery.isPending,
    isError: isMemberSource && magazineQuery.isError,
    refetch: () => void magazineQuery.refetch(),
  };
}

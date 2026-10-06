import type { TFunction } from "../../../shared/i18n/types";
import { routes } from "../../../app/routeMap";
import type { LandingStoryFeatureDTO } from "../../admin/api/landingFeatures.api";
import type { ArticleListItemDTO } from "../../magazine/api/magazine.api";

/**
 * One card of the homepage's live "told in our own words" row, whichever
 * source fed it: the real magazine list (a signed-in member) or the
 * admin-curated story slice of `GET /landing/features` (a signed-out
 * visitor). `LiveStories` renders this shape alone.
 */
export interface HomepageStoryCard {
  key: string;
  to: string;
  /** The small line above the title. */
  kicker: string;
  title: string;
  dek: string;
  /** The byline exactly as the article prints it. */
  authorName: string;
  readMinutes: number;
  /** Resolved lead art, or null for the tinted placeholder. */
  coverImageUrl: string | null;
}

function articlePath(slug: string): string {
  return `${routes.article}?id=${slug}`;
}

/** A piece off the magazine's own list read. */
export function articleToStoryCard(
  article: ArticleListItemDTO,
  translate: TFunction,
): HomepageStoryCard {
  return {
    key: article.slug,
    to: articlePath(article.slug),
    kicker: article.issueNumber
      ? translate("homepage:liveStories.issueKicker", {
          number: article.issueNumber,
        })
      : translate("homepage:liveStories.magazineKicker"),
    title: article.title,
    dek: article.dek,
    authorName: article.author.displayName,
    readMinutes: article.readMinutes,
    coverImageUrl: article.heroImageUrl,
  };
}

/** An admin-curated published story. The admin's kicker line leads when they
 *  wrote one. */
export function landingStoryToStoryCard(
  feature: LandingStoryFeatureDTO,
  translate: TFunction,
): HomepageStoryCard {
  return {
    key: feature.id,
    to: articlePath(feature.slug),
    kicker: feature.blurb ?? translate("homepage:liveStories.magazineKicker"),
    title: feature.title,
    dek: feature.dek,
    authorName: feature.authorName,
    readMinutes: feature.readMinutes,
    coverImageUrl: feature.coverImageUrl,
  };
}

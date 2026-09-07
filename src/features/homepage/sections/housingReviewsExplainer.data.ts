import { FiKey, FiMessageCircle, FiShield } from "react-icons/fi";
import type { IconType } from "react-icons";

/** One "how landlord reviews work" row in the housing explainer modal. */
export interface HousingReviewRule {
  id: string;
  Icon: IconType;
  titleKey: string;
  bodyKey: string;
}

/**
 * The three rules behind a landlord's page, in display order.
 *
 * EVERY LINE HERE HAS TO MATCH WHAT THE BACKEND ACTUALLY ENFORCES, because
 * this modal is the promise the housing showcase makes to somebody who has not
 * joined yet. The sources, in order:
 *
 *  - `LandlordsService.recommend` / `attestationFrom`: the author attests they
 *    rented from this landlord and gives the tenancy months, one row per
 *    author per landlord (upserted, so editing replaces their own), behind the
 *    affirming-pledge gate and phone verification. Nobody checks the tenancy,
 *    which is why the third row and the closing note say so in as many words.
 *  - `LandlordsService.publishLandlordReply`: the landlord has no account and
 *    no edit or delete. Their right of reply runs through the public
 *    "Is this you?" intake, and staff publish their own words, labelled.
 *  - `LandlordsService.takeDownRecommendation` plus the takedown predicate on
 *    every read: a moderator can withhold a recommendation, and a withheld one
 *    drops out of the landlord's rating rather than sitting there silently.
 */
export const HOUSING_REVIEW_RULES: HousingReviewRule[] = [
  {
    id: "livedThere",
    Icon: FiKey,
    titleKey: "homepage:housing.reviewsExplainer.rules.livedThere.title",
    bodyKey: "homepage:housing.reviewsExplainer.rules.livedThere.body",
  },
  {
    id: "rightOfReply",
    Icon: FiMessageCircle,
    titleKey: "homepage:housing.reviewsExplainer.rules.rightOfReply.title",
    bodyKey: "homepage:housing.reviewsExplainer.rules.rightOfReply.body",
  },
  {
    id: "reportable",
    Icon: FiShield,
    titleKey: "homepage:housing.reviewsExplainer.rules.reportable.title",
    bodyKey: "homepage:housing.reviewsExplainer.rules.reportable.body",
  },
];

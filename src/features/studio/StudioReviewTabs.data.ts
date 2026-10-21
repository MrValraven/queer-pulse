import { routes } from "../../app/routeMap";
import type { StudioReviewTab } from "./api/studioFlagReview.adapters";

/** The flag review's tabs, in strip order. The first is the default. */
export const STUDIO_REVIEW_TABS: readonly StudioReviewTab[] = [
  "reports",
  "claims",
  "disputes",
  "withdrawn",
];

export const STUDIO_REVIEW_TAB_LABEL_KEY: Record<StudioReviewTab, string> = {
  reports: "studio:flagReviewLive.tabs.reports",
  claims: "studio:flagReviewLive.tabs.claims",
  disputes: "studio:flagReviewLive.tabs.disputes",
  withdrawn: "studio:flagReviewLive.tabs.withdrawn",
};

/** The search param that holds the open tab, so a refresh, Back and a
 *  badge link all land on the same queue. */
export const STUDIO_REVIEW_TAB_PARAM = "tab";

export function isStudioReviewTab(
  value: string | null,
): value is StudioReviewTab {
  return STUDIO_REVIEW_TABS.some((tab) => tab === value);
}

/** The open tab named in the URL, or Reports for a missing or unknown one. */
export function studioReviewTabOf(value: string | null): StudioReviewTab {
  return isStudioReviewTab(value) ? value : "reports";
}

/** A link to one queue of the flag review: the staff menu badge points at
 *  the queue it counts (`studioFlagReviewTabPath("claims")`). */
export function studioFlagReviewTabPath(tab: StudioReviewTab): string {
  return `${routes.studioFlagReview}?${STUDIO_REVIEW_TAB_PARAM}=${tab}`;
}

import { apiGet } from "../../../shared/api/client";

/** `GET /admin/resources/guide-ratings` (CNT-18, `@Roles(Admin)`) response
 *  row — mirrors `AdminResourceGuideRatingsService`'s `AdminGuideRatingAggregate`. */
export interface AdminGuideRatingDTO {
  contentKey: string;
  helpfulCount: number;
  notHelpfulCount: number;
  /** helpfulCount / (helpfulCount + notHelpfulCount), 0..1. */
  ratio: number;
}

export function getAdminGuideFeedback() {
  return apiGet<AdminGuideRatingDTO[]>("/admin/resources/guide-ratings");
}

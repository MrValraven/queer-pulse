import type { AdminGuideRatingDTO } from "./api/adminGuideFeedback.api";

/** Demo-mode fixture for the `Guide Feedback` admin page — pre-sorted
 *  worst-ratio-first, mirroring `AdminResourceGuideRatingsService.list()`'s
 *  in-memory sort. */
export const ADMIN_GUIDE_FEEDBACK: AdminGuideRatingDTO[] = [
  {
    contentKey: "legal.housing.eviction",
    helpfulCount: 2,
    notHelpfulCount: 9,
    ratio: 2 / 11,
  },
  {
    contentKey: "sexualHealth.guides.talkingToPartners",
    helpfulCount: 4,
    notHelpfulCount: 6,
    ratio: 0.4,
  },
  {
    contentKey: "mentalHealth.experience.admin",
    helpfulCount: 11,
    notHelpfulCount: 3,
    ratio: 11 / 14,
  },
  {
    contentKey: "legal.workplace.dismissal",
    helpfulCount: 18,
    notHelpfulCount: 1,
    ratio: 18 / 19,
  },
];

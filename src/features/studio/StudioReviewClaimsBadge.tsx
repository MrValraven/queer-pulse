import { useStudioReviewCounts } from "./api/useStudioReviewCounts";
import { useStudioReviewTrackReports } from "./api/useStudioTrackReports";
import { useStudioReviewReports } from "./api/useStudioFlagReview";
import { StudioReviewTabBadge } from "./StudioReviewTabBadge";

/** The Claims tab's count while claims wait for our team (submitted plus
 *  countered). */
export function StudioReviewClaimsBadge() {
  const { claimsWaiting } = useStudioReviewCounts();
  return (
    <StudioReviewTabBadge
      count={claimsWaiting}
      labelKey="studio:flagReviewLive.claims.badge"
    />
  );
}

/** The Disputes tab's count: artists' takedown disputes still open. */
export function StudioReviewDisputesBadge() {
  const { disputesWaiting } = useStudioReviewCounts();
  return (
    <StudioReviewTabBadge
      count={disputesWaiting}
      labelKey="studio:flagReviewLive.disputes.badge"
    />
  );
}

/** The Reports tab's count: open release and track reports. The queues have
 *  no counts route, so it counts the pages read so far (the same reads the
 *  panel shows, shared through the cache) and marks a longer queue "20+". */
export function StudioReviewReportsBadge() {
  const releaseReports = useStudioReviewReports();
  const trackReports = useStudioReviewTrackReports();
  return (
    <StudioReviewTabBadge
      count={releaseReports.items.length + trackReports.items.length}
      hasMore={releaseReports.hasNextPage || trackReports.hasNextPage}
      labelKey="studio:flagReviewLive.reports.badge"
      moreLabelKey="studio:flagReviewLive.reports.badgeMore"
    />
  );
}

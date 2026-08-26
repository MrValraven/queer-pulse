import { useModReports } from "../../../features/admin/api/useModReports";
import { useJoinRequests } from "../../../features/admin/api/useJoinRequests";
import { usePartnerApplications } from "../../../features/marketing/api/usePartnerApplications";
import { useVerificationRequests } from "../../../features/admin/api/useAdminVerifications";
import { useAdminJoinRequests } from "../../../features/admin/api/useAdminHousingCoops";
import type { AdminNavBadgeCounts } from "./AdminNavGroup";

/**
 * Live pending counts behind the admin rail's pills. Each query key matches the
 * one its own page uses, so react-query serves these from cache — no extra
 * network just to render the sidebar.
 */
export function useAdminNavBadges(): AdminNavBadgeCounts {
  const modReports = useModReports();
  const joinRequests = useJoinRequests("pending");
  const partnerApplications = usePartnerApplications();
  // OPS-06: the cross-co-op join-request queue on /admin/housing. Same query
  // key the page itself uses, so this is served from cache rather than a
  // second request.
  const housingCoopJoinRequests = useAdminJoinRequests();

  // Phase 2's review queue is live, so the badge counts the actual review-queue
  // backlog: every request still waiting on a moderator, at any stage of that
  // wait (freshly submitted, actively being reviewed, or back for a second look
  // after an appeal). The filter here matches AdminVerificationsPage's
  // review-queue default exactly so the query key hashes the same and
  // react-query serves this from the page's own cache instead of firing a
  // second request.
  const verificationRequestsQuery = useVerificationRequests({
    status: "all",
    query: "",
    sort: "recent",
  });
  const pendingRequestCount =
    (verificationRequestsQuery.counts.pending ?? 0) +
    (verificationRequestsQuery.counts.in_review ?? 0) +
    (verificationRequestsQuery.counts.appealing ?? 0);

  return {
    moderation: modReports.data?.counts.open ?? 0,
    members: joinRequests.data?.length ?? 0,
    partnerships:
      partnerApplications.data?.filter((a) => a.status === "pending").length ??
      0,
    verifications: pendingRequestCount,
    housingCoops:
      housingCoopJoinRequests.data?.filter(
        (request) => request.status === "pending",
      ).length ?? 0,
  };
}

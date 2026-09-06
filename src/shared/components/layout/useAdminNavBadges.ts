import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAdminOverview } from "../../../features/admin/api/useAdminOverview";
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
  // ENG-180: for an admin the moderation badge reads the count
  // `GET /admin/overview` already returns, through the same hook and the same
  // query key the admin dashboard uses. It used to mount `useModReports()` for
  // everyone, which on EVERY admin page fetched a hydrated first page of the
  // open queue plus the whole resolved tab (reporter, reported, credibility
  // and community lookups, and the moderation translate chunk) to render one
  // number. On the dashboard this now costs nothing at all: the page mounts
  // the identical query, so react-query serves both from one fetch. Elsewhere
  // in the console it is one small aggregate response that then stays warm
  // across admin routes.
  //
  // The two numbers are the same number: `ModerationService.computeCounts()`
  // counts reports in status `open` or `escalated`, and `AdminOverviewService`
  // builds `triage.openReports` from exactly that filter.
  //
  // THE ROLE SPLIT IS LOAD-BEARING. `/admin/overview` is `@Roles(Admin)`
  // alone, while this rail also renders for a moderator (`AdminSidebar`'s
  // `isFullConsole`) and for a grant holder. Pointing every viewer at the
  // overview would 403 for a moderator on every admin page and quietly show
  // them a zero on the queue they work daily. So a moderator keeps the
  // `/mod/reports` source, which their role can read, and exactly one of the
  // two queries is ever enabled.
  const { role } = useAuth();
  const { demoMode } = useDemoMode();
  // Demo mode reads fixtures from both hooks and touches no network, so it
  // takes the overview arm, matching `AdminSidebar`'s own `isAdmin`.
  const hasAdminOverviewAccess = demoMode || role === "admin";
  const overview = useAdminOverview({ isEnabled: hasAdminOverviewAccess });
  const modReports = useModReports(
    undefined,
    "all",
    undefined,
    !hasAdminOverviewAccess,
  );
  const joinRequests = useJoinRequests("pending");
  const partnerApplications = usePartnerApplications();
  // OPS-06: the cross-co-op join-request queue on /admin/housing. Same query
  // key the page itself uses, so this is served from cache rather than a
  // second request. The hook asks the server for pending requests only and
  // hands back the queue `total`, so the badge is the real number waiting
  // (ENG-41): it used to count the pending rows inside whatever the newest 200
  // requests in every status happened to be, which under-counted a busy queue
  // and could read zero while people waited.
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
    moderation: hasAdminOverviewAccess
      ? (overview.data?.triageCounts.openReports ?? 0)
      : (modReports.data?.counts.open ?? 0),
    members: joinRequests.data?.length ?? 0,
    partnerships:
      partnerApplications.data?.filter((a) => a.status === "pending").length ??
      0,
    verifications: pendingRequestCount,
    housingCoops: housingCoopJoinRequests.total,
  };
}

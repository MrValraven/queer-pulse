import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAdminOverview } from "../../../features/admin/api/useAdminOverview";
import { useModReports } from "../../../features/admin/api/useModReports";
import { useJoinRequests } from "../../../features/admin/api/useJoinRequests";
import { usePartnerApplications } from "../../../features/marketing/api/usePartnerApplications";
import { useVerificationRequests } from "../../../features/admin/api/useAdminVerifications";
import { useAdminJoinRequests } from "../../../features/admin/api/useAdminHousingCoops";
import { useListingClaims } from "../../../features/admin/api/useListingClaims";
import {
  musicEventListQueryOptions,
  useMusicEventAttention,
} from "../../../features/admin/musicEvents/api/useMusicEvents";
import { useLeadDueCount } from "../../../features/admin/leads/api/useLeadDueCount";
import { useMyStaffRoles } from "../../../features/auth/api/useMyStaffRoles";
import type { AdminNavBadgeUnavailable } from "./AdminAlertsPopover";
import type { AdminNavBadgeCounts } from "./adminNavMatching";

/**
 * Whether a paged queue's count read failed. The count comes from the first
 * page, so a failed "load more" on the queue's own page leaves it intact and
 * the badge keeps its number.
 */
function isCountReadError(query: {
  isError: boolean;
  isFetchNextPageError: boolean;
}): boolean {
  return query.isError && !query.isFetchNextPageError;
}

/** The badge counts plus the queues whose read failed. */
export interface AdminNavBadgeStatus {
  counts: AdminNavBadgeCounts;
  /** A queue listed here failed its last read, so its count is unknown: the
   *  alerts popover says "Count unavailable" for it and never shows a 0. */
  unavailable: AdminNavBadgeUnavailable;
}

/**
 * Live pending counts behind the admin rail's pills. Each query key matches the
 * one its own page uses, so react-query serves these from cache, and the
 * sidebar renders with no extra network.
 */
export function useAdminNavBadges(): AdminNavBadgeCounts {
  return useAdminNavBadgeStatus().counts;
}

/**
 * The same counts as `useAdminNavBadges`, plus which queues' reads failed. A
 * disabled query (no access) never counts as failed: its badge reads 0 by
 * design.
 */
export function useAdminNavBadgeStatus(): AdminNavBadgeStatus {
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
  // `/mod/reports` source, which their role can read. A grant holder can read
  // neither, so for them both stay off.
  //
  // ENG-491: every other badge query is gated the same way, on the guard of
  // the endpoint behind it, so a moderator or a grant holder no longer fires a
  // guaranteed 403 on each admin page load:
  //   `/join-requests`, `/admin/verifications/requests`, `/mod/reports`:
  //     `@Roles(Moderator, Admin)`.
  //   `/admin/partners/applications`: `@Roles(Admin)` or the `partnerships`
  //     staff grant (`RolesOrStaffGuard`).
  //   `/admin/housing/join-requests`, `/admin/overview`: `@Roles(Admin)` alone.
  //   `/admin/listings/claims`: `@Roles(Moderator, Admin)` or the
  //     `directory_moderator` staff grant (`RolesOrStaffGuard`).
  // A disabled query's badge reads 0 whatever its cache entry holds.
  const { role } = useAuth();
  const { demoMode } = useDemoMode();
  // Grants come from the same source `AdminSidebar` filters the rail with. It
  // already treats demo mode and an admin as holding every grant.
  const staffRoles = useMyStaffRoles();
  // Demo mode reads fixtures from every hook and touches no network, so it
  // keeps every badge on and takes the overview arm, matching `AdminSidebar`'s
  // own `isAdmin` and `isFullConsole`.
  const hasAdminOverviewAccess = demoMode || role === "admin";
  const hasModeratorQueueAccess =
    hasAdminOverviewAccess || role === "moderator";
  const hasPartnerApplicationsAccess = staffRoles.includes("partnerships");
  const hasListingClaimsAccess =
    hasModeratorQueueAccess || staffRoles.includes("directory_moderator");
  // `AdminMusicEventsController` admits an admin or the
  // `music_manager_producer` grant; `useMyStaffRoles` already lists every grant
  // for an admin and in demo mode.
  const hasMusicEventsAccess = staffRoles.includes("music_manager_producer");
  // `AdminLeadsController` admits the same two: an admin or the
  // `music_manager_producer` grant.
  const hasLeadsAccess = staffRoles.includes("music_manager_producer");
  const overview = useAdminOverview({ isEnabled: hasAdminOverviewAccess });
  const modReports = useModReports(
    undefined,
    "all",
    undefined,
    hasModeratorQueueAccess && !hasAdminOverviewAccess,
  );
  const joinRequests = useJoinRequests("pending", {
    isEnabled: hasModeratorQueueAccess,
  });
  const partnerApplications = usePartnerApplications({
    isEnabled: hasPartnerApplicationsAccess,
  });
  // OPS-06: the cross-co-op join-request queue on /admin/housing. Same query
  // key the page itself uses, so this is served from cache with no second
  // request. The hook asks the server for pending requests only and
  // hands back the queue `total`, so the badge is the real number waiting
  // (ENG-41): it used to count the pending rows inside whatever the newest 200
  // requests in every status happened to be, which under-counted a busy queue
  // and could read zero while people waited.
  const housingCoopJoinRequests = useAdminJoinRequests({
    isEnabled: hasAdminOverviewAccess,
  });

  // Pending "claim this listing" requests on /admin/listings. Same query key
  // the page's Ownership claims view uses, so the two share one cache entry
  // and an approve or decline there (which invalidates that key) drops this
  // pill too. `total` is the server's count of the whole pending queue, so a
  // queue longer than one page still reads its real size (ENG-41). The class
  // guard on `AdminListingsController` admits a moderator, an admin and a
  // `directory_moderator` grant holder, and nobody else, so the query only
  // runs for those three (and in demo mode, which reads the fixture).
  const listingClaims = useListingClaims({
    isEnabled: hasListingClaimsAccess,
  });

  // The music events pill counts pending invite requests because they are the
  // queue a holder answers; lineup replies show per event on the page (Spec
  // correction 8). The page reads the same first "upcoming" page, so this is
  // served from its cache.
  const musicEventAttention = useMusicEventAttention({
    isEnabled: hasMusicEventsAccess,
  });
  // `useMusicEventAttention` hands back the attention block alone, so a second
  // observer on the same query key reads its error state. React-query shares
  // one cache entry and one request between the two.
  const musicEventsRead = useInfiniteQuery({
    ...musicEventListQueryOptions("upcoming", demoMode),
    enabled: hasMusicEventsAccess,
  });

  // The leads pill counts open leads whose follow-up is due today or earlier
  // and that are the viewer's or nobody's. Off without leads access, so a
  // moderator sends no request here.
  const leadDueCount = useLeadDueCount({ isEnabled: hasLeadsAccess });

  // Phase 2's review queue is live, so the badge counts the actual review-queue
  // backlog: every request still waiting on a moderator, at any stage of that
  // wait (freshly submitted, actively being reviewed, or back for a second look
  // after an appeal). The filter here matches AdminVerificationsPage's
  // review-queue default exactly so the query key hashes the same and
  // react-query serves this from the page's own cache with no second
  // request.
  const verificationRequestsQuery = useVerificationRequests(
    { status: "all", query: "", sort: "recent" },
    { isEnabled: hasModeratorQueueAccess },
  );
  const pendingRequestCount =
    (verificationRequestsQuery.counts.pending ?? 0) +
    (verificationRequestsQuery.counts.in_review ?? 0) +
    (verificationRequestsQuery.counts.appealing ?? 0);

  const moderationCount = hasAdminOverviewAccess
    ? (overview.data?.triageCounts.openReports ?? 0)
    : (modReports.data?.counts.open ?? 0);
  const pendingApplicationCount =
    partnerApplications.data?.filter(
      (application) => application.status === "pending",
    ).length ?? 0;

  const counts: AdminNavBadgeCounts = {
    moderation: hasModeratorQueueAccess ? moderationCount : 0,
    members: hasModeratorQueueAccess ? (joinRequests.data?.length ?? 0) : 0,
    partnerships: hasPartnerApplicationsAccess ? pendingApplicationCount : 0,
    verifications: hasModeratorQueueAccess ? pendingRequestCount : 0,
    housingCoops: hasAdminOverviewAccess ? housingCoopJoinRequests.total : 0,
    listingClaims: hasListingClaimsAccess ? listingClaims.total : 0,
    musicEvents: hasMusicEventsAccess
      ? musicEventAttention.pendingInviteRequestCount
      : 0,
    leads: hasLeadsAccess ? (leadDueCount.data ?? 0) : 0,
  };

  // A failed read keeps whatever `data` it last had (or none), so the count
  // above can read 0 while the queue is really unknown. Each flag follows the
  // same access gate as its count.
  const moderationRead = hasAdminOverviewAccess ? overview : modReports;
  const unavailable: AdminNavBadgeUnavailable = {
    moderation: hasModeratorQueueAccess && moderationRead.isError,
    members: hasModeratorQueueAccess && joinRequests.isError,
    partnerships: hasPartnerApplicationsAccess && partnerApplications.isError,
    verifications:
      hasModeratorQueueAccess && isCountReadError(verificationRequestsQuery),
    housingCoops:
      hasAdminOverviewAccess && isCountReadError(housingCoopJoinRequests),
    listingClaims: hasListingClaimsAccess && isCountReadError(listingClaims),
    musicEvents: hasMusicEventsAccess && isCountReadError(musicEventsRead),
    leads: hasLeadsAccess && leadDueCount.isError,
  };

  return { counts, unavailable };
}

import type { Catalog } from "../../types";

/**
 * Admin/moderator panel (`/admin/*`, `/mod/:slug`). Chrome only — table
 * headers, filters, buttons, status/enum labels, empty states, confirmation
 * toasts, aria-labels. The queue *content* it moderates (report titles,
 * previews, threads, appeal arguments, audit-entry narratives, member/mod
 * names, community descriptions) is mock data standing in for API-fetched
 * text in live mode and is deliberately left in English in the colocated
 * `*.data.ts` files — see docs/i18n/extraction-brief.md §1.
 */
export const admin: Catalog = {
  // ── Queue assignment + waiting-time clock (OPS-04) ────────────────────────
  // Shared by every staff queue: invite requests, verification requests,
  // intakes and partner applications. The moderation queue keeps its own
  // `moderation.*` wording, which predates these and is already translated.
  "queueClock.overdue": "Overdue",
  "queueClock.overdueBy": "Due {age}",
  "queueAssignment.unassigned": "Nobody has this yet",
  "queueAssignment.assignedToYou": "You have this",
  "queueAssignment.assignedTo": "{name} has this",
  "queueAssignment.someone": "Another reviewer",
  "queueAssignment.claimCta": "Claim",
  "queueAssignment.releaseCta": "Release",
  "queueAssignment.claimAria": "Claim {row}",
  "queueAssignment.releaseAria": "Release {row}",
  "queueAssignment.errorToast": "That could not be saved. Try again.",
  "queueAssignment.demoYou": "You",
  "queueAssignment.filterLabel": "Show",
  "queueAssignment.filter.all": "Everything",
  "queueAssignment.filter.mine": "Assigned to me",
  "queueAssignment.filter.unassigned": "Unclaimed",

  // ── Identity verification console ─────────────────────────────────────────
  "verifications.eyebrow": "Trust & safety",
  "verifications.title": "Identity <em>verification</em>",
  "verifications.sub":
    "Review and adjust members' verification levels after a manual check.",
  "verifications.honesty":
    "We never store identity documents or biometrics: an external provider runs the ID check and only returns a pass or fail. These records hold a level and its provenance, nothing more.",
  "verifications.via": "via {method} · {provider}",
  "verifications.meta.unknown": "not on file",
  "verifications.setLevelLabel": "Set verification level",
  "verifications.applyCta": "Apply",
  "verifications.unknownMember": "Unknown member",
  "verifications.level.none": "None",
  "verifications.level.email": "Email",
  "verifications.level.phone": "Phone",
  "verifications.level.id_verified": "ID-verified",
  "verifications.toast.updated": "Verification level updated.",
  "verifications.toast.error": "Couldn't update that verification",
  "verifications.empty": "No verification records yet.",
  "verifications.tabs.all": "All",
  "verifications.reviewCta": "Review",
  "verifications.loadMore": "Load more",
  "verifications.loadingMore": "Loading more…",
  "verifications.search.placeholder": "Search by name",
  "verifications.search.ariaLabel": "Search members by name",
  "verifications.sort.label": "Sort",
  "verifications.sort.recent": "Recently updated",
  "verifications.sort.oldest": "Oldest updated",
  "verifications.sort.level": "Highest level",

  // ── Verification detail drawer (Task 9) ────────────────────────────────
  "verifications.drawer.label": "Verification detail for {name}",
  "verifications.drawer.provenanceLoading": "Checking history…",
  "verifications.drawer.provenanceLabel": "Provenance",
  "verifications.drawer.provenanceNone": "Not yet verified",
  "verifications.drawer.provenanceEarned": "Member-earned",
  "verifications.drawer.provenanceGranted": "Granted by {actor}",
  "verifications.drawer.historyHeading": "Audit history",
  "verifications.drawer.historyEmpty": "No history yet.",
  "verifications.drawer.historySystemActor": "System",
  "verifications.drawer.historyAction.submitted": "Submitted",
  "verifications.drawer.historyAction.approved": "Approved",
  "verifications.drawer.historyAction.rejected": "Rejected",
  "verifications.drawer.historyAction.overridden": "Overridden",
  "verifications.drawer.historyAction.downgraded": "Downgraded",
  "verifications.drawer.historyAction.appealed": "Appealed",
  "verifications.drawer.historyAction.withdrawn": "Withdrawn",
  "verifications.drawer.signalsHeading": "Signals",
  "verifications.drawer.signalsNote": "Signals arrive in a later update.",
  "verifications.drawer.reasonLabel": "Reason",
  "verifications.drawer.reasonPlaceholder": "Why is this level changing?",
  "verifications.drawer.reasonRequiredHint":
    "A reason is required when lowering the level.",
  "verifications.drawer.liveOnlyTitle":
    "Applying an override needs the live API. Try this outside demo mode.",
  "verifications.drawer.applying": "Applying…",

  // ── Review-queue segment + request drawer (Task 9) ─────────────────────
  "verifications.segment.ariaLabel": "Verification workflow view",
  "verifications.segment.reviewQueue": "Review queue",
  "verifications.segment.directOverride": "Direct override",

  "verifications.requests.tabs.pending": "Pending",
  "verifications.requests.tabs.in_review": "In review",
  "verifications.requests.tabs.approved": "Approved",
  "verifications.requests.tabs.rejected": "Rejected",
  "verifications.requests.tabs.appealing": "Appeals",
  "verifications.requests.tabs.all": "All",

  "verifications.requests.status.pending": "Pending",
  "verifications.requests.status.in_review": "In review",
  "verifications.requests.status.approved": "Approved",
  "verifications.requests.status.rejected": "Rejected",
  "verifications.requests.status.appealing": "Appealing",
  "verifications.requests.status.withdrawn": "Withdrawn",

  "verifications.requests.appealChip": "Appeal",
  "verifications.requests.duplicateChip": "Duplicate",
  "verifications.requests.duplicateChipTitle":
    "This request shares a verification fingerprint with another account.",
  "verifications.requests.submittedAt": "Submitted {when}",
  "verifications.requests.empty": "No requests match this view yet.",
  "verifications.requests.search.placeholder": "Search by name",
  "verifications.requests.search.ariaLabel": "Search requests by member name",
  "verifications.requests.sort.recent": "Newest submitted",
  "verifications.requests.sort.oldest": "Oldest submitted",

  "verifications.requests.drawer.label": "Request review for {name}",
  "verifications.requests.drawer.contextHeading": "Their request",
  "verifications.requests.drawer.contextEmpty":
    "They didn't share any context with this request.",
  "verifications.requests.drawer.evidenceLabel": "Reference",
  "verifications.requests.drawer.decisionHeading": "Previous decision",
  "verifications.requests.drawer.reviewedBy": "reviewed by {actor}",
  "verifications.requests.drawer.appealBanner":
    "This member appealed a rejected request. Take a fresh look before deciding again.",
  "verifications.requests.drawer.duplicateBanner":
    "This person shares a verification fingerprint with {count} other account(s).",
  "verifications.requests.drawer.signalsHeading": "Signals",
  "verifications.requests.drawer.signalsEmpty": "No signals yet.",
  "verifications.requests.drawer.signals.accountAge": "{days} days old",
  "verifications.requests.drawer.signals.priorRejections":
    "{count} prior rejection(s)",
  "verifications.requests.drawer.signals.noPriorRejections":
    "No prior rejections",
  "verifications.requests.drawer.signals.duplicate":
    "Shared fingerprint with {count} other account(s)",
  "verifications.requests.drawer.signals.duplicateTitle":
    "The member's identity-provider session reference is shared with at least one other account.",
  "verifications.requests.drawer.reasonLabel": "Reason",
  "verifications.requests.drawer.reasonPlaceholder":
    "Share why, especially if you're declining.",
  "verifications.requests.drawer.reasonRequiredHint":
    "A reason is required to reject. Approving or marking in-review doesn't need one.",
  "verifications.requests.drawer.notDecidableHint":
    "This request isn't open for a new decision right now.",
  "verifications.requests.drawer.markInReviewCta": "Mark in-review",
  "verifications.requests.drawer.approveCta": "Approve",
  "verifications.requests.drawer.rejectCta": "Reject",
  "verifications.requests.drawer.deciding": "Saving…",

  "verifications.requests.toast.approve":
    "Request approved. The member has been notified.",
  "verifications.requests.toast.reject":
    "Request rejected. The member has been notified.",
  "verifications.requests.toast.in_review": "Request marked in review.",

  // ── Row selection + bulk actions + keyboard flow (Task 4) ───────────────
  "verifications.requests.selectAll.ariaLabel": "Select all visible requests",
  "verifications.requests.selectAll.label": "Select all visible",
  "verifications.requests.selectRow.ariaLabel": "Select {name}",

  "verifications.requests.bulk.ariaLabel": "Bulk actions",
  "verifications.requests.bulk.selectedCount_one": "{count} selected",
  "verifications.requests.bulk.selectedCount_other": "{count} selected",
  "verifications.requests.bulk.approveCta": "Approve",
  "verifications.requests.bulk.inReviewCta": "Mark in-review",
  "verifications.requests.bulk.rejectCta": "Reject",
  "verifications.requests.bulk.clearCta": "Clear",
  "verifications.requests.bulk.capNote": "Selection capped at {cap} requests",
  "verifications.requests.bulk.toast.success_one": "{count} request updated.",
  "verifications.requests.bulk.toast.success_other":
    "{count} requests updated.",
  "verifications.requests.bulk.toast.partial":
    "{succeeded} updated, {failed} skipped.",
  "verifications.requests.bulk.action.approve":
    "Couldn't approve the selected requests",
  "verifications.requests.bulk.action.inReview":
    "Couldn't mark the selected requests in-review",
  "verifications.requests.bulk.action.reject":
    "Couldn't reject the selected requests",

  "verifications.requests.bulk.confirmReject.title_one":
    "Reject {count} request?",
  "verifications.requests.bulk.confirmReject.title_other":
    "Reject {count} requests?",
  "verifications.requests.bulk.confirmReject.body_one":
    "This rejects the selected request and notifies the member. This can't be undone from here.",
  "verifications.requests.bulk.confirmReject.body_other":
    "This rejects all {count} selected requests and notifies each member. This can't be undone from here.",
  "verifications.requests.bulk.confirmReject.reasonLabel": "Reason",
  "verifications.requests.bulk.confirmReject.reasonPlaceholder":
    "Share why, especially since every member selected will see it.",
  "verifications.requests.bulk.confirmReject.confirmCta": "Reject requests",

  "verifications.requests.keyboard.hint":
    "Keyboard: J and K move focus between requests, A approves the focused one, R rejects it, and / jumps to search.",

  // ── Shared verbs, reused across many modals/drawers ───────────────────────
  "common.cancel": "Cancel",
  "common.close": "Close",
  "common.undo": "Undo",
  "common.edit": "Edit",
  "common.delete": "Delete",
  "common.featured": "Featured",
  "common.saveChanges": "Save changes",
  // Shared 403 copy for the admin editor panels (org tiers, housing co-ops).
  "common.panelForbidden": "This panel is for admins only.",
  // Toggle aria-labels shared by the org-tier and housing-coop row lists.
  "common.featuredToggleLabel": "Featured: {name}",
  "common.publishedToggleLabel": "Published: {name}",
  // Breadcrumb root for the top-level admin panel (used by pages nested one
  // level below /admin, e.g. the partner-applications queue).
  "common.adminBreadcrumb": "Admin",

  // ── Dashboard ──────────────────────────────────────────────────────────────
  "dashboard.title": "Overview · <em>good morning, {name}</em>",
  // The same greeting while the signed-in profile is still resolving, so the
  // page never opens by naming the wrong person or leaving a hole.
  "dashboard.titleNameless": "Overview · <em>good morning</em>",
  // Headline count + subtitle are derived from the real triage backlog
  // (`GET /admin/overview` → triage counts); `{count}` drives pluralization.
  "dashboard.header.title_one": "{count} decision waiting on <em>you</em>.",
  "dashboard.header.title_other": "{count} decisions waiting on <em>you</em>.",
  "dashboard.header.titleClear": "You're all <em>caught up</em>.",
  "dashboard.header.subEmergencies_one":
    "One of them is a safety emergency, so start there. The rest can wait its turn.",
  "dashboard.header.subEmergencies_other":
    "{count} of them are safety emergencies, so start there. The rest can wait its turn.",
  "dashboard.header.subCalm":
    "No emergencies in the queue. Take it one decision at a time. Every careful call keeps this network safe.",
  "dashboard.header.subClear":
    "Every report has had a human look at it. Step away for a while. The network's in good hands.",
  "dashboard.header.titleError": "We couldn't <em>check the queue</em>.",
  "dashboard.header.subError":
    "The queue may still hold reports that need you. Check your connection or your staff access, then try again.",
  "dashboard.header.moderationCta": "Open moderation",

  // Renamed from "Active members": the backing metric is account standing
  // (not suspended), not engagement — there is no login/activity tracking
  // behind this tile.
  "dashboard.metrics.activeMembers.label": "Members in good standing",
  "dashboard.metrics.openReports.label": "Open reports",
  "dashboard.metrics.medianResponse.label": "Median response",
  "dashboard.metrics.communityHealth.label": "Community health",
  "dashboard.metrics.trendPercent": "{value}%",
  "dashboard.metrics.trendOldest": "oldest {hours}",
  "dashboard.metrics.trendWellUnder": "well under",
  // Median response is live but over the 6h SLA target — a warning, not the
  // "well under" badge.
  "dashboard.metrics.trendOverSla": "over target",
  // No comparison data yet for this metric (e.g. no communities yet, or no
  // prior period to compare against) — a neutral placeholder instead of a
  // fabricated delta.
  "dashboard.metrics.trendNoData": "not enough data yet",
  // Average community health score is at or above the "healthy" band.
  "dashboard.metrics.trendHealthy": "healthy",
  // Average community health score has dropped into the "needs a hand" band.
  "dashboard.metrics.trendNeedsHand": "needs a hand",
  "dashboard.metrics.footGrowth":
    "+{count} this month · based on account status",
  "dashboard.metrics.footEmergencies_one": "{count} is an emergency",
  "dashboard.metrics.footEmergencies_other": "{count} are emergencies",
  "dashboard.metrics.footSlaTarget": "{hours} SLA target",
  "dashboard.metrics.footNeedsHand_one": "{count} community needs a hand",
  "dashboard.metrics.footNeedsHand_other": "{count} communities need a hand",

  "dashboard.triage.title": "Needs <em>a human</em>",
  "dashboard.triage.safetyEmergencies.title": "Safety emergencies",
  "dashboard.triage.safetyEmergencies.sub": "Outing & doxxing",
  "dashboard.triage.safetyEmergencies.subEm": "handle these first",
  "dashboard.triage.openReports.title": "Open reports",
  "dashboard.triage.openReports.sub": "Harassment, spam, vouch-abuse",
  "dashboard.triage.identityVerifications.title": "Identity verifications",
  "dashboard.triage.identityVerifications.sub":
    "Members waiting to be welcomed in",
  "dashboard.triage.appeals.title": "Appeals awaiting decision",
  "dashboard.triage.appeals.sub": "Members asking you to look again",

  "dashboard.charts.reportsByType.title": "Reports by type",
  "dashboard.charts.reportsByType.sub": "Last 8 weeks · weekly volume",
  "dashboard.charts.reportsByType.ariaLabel": "Stacked weekly reports by type",
  "dashboard.charts.series.outing": "Outing/doxxing",
  "dashboard.charts.series.harassment": "Harassment",
  "dashboard.charts.series.spam": "Spam",
  "dashboard.charts.series.other": "Other",
  "dashboard.charts.memberGrowth.title": "Member growth",
  "dashboard.charts.memberGrowth.sub": "Total members · last 10 weeks",
  "dashboard.charts.memberGrowth.ariaLabel": "Member growth line chart",
  "dashboard.charts.memberGrowth.totalMembers": "Total members",
  "dashboard.charts.memberGrowth.joinedThatWeek": "Joined that week",
  "dashboard.charts.memberGrowth.subRange":
    "Total members · last {count} weeks",
  "dashboard.charts.memberGrowth.rangeLabel": "Range",
  "dashboard.charts.memberGrowth.loadError": "Couldn't load member growth",
  "dashboard.charts.memberGrowth.retry": "Retry",
  "dashboard.charts.legend.churned": "Churned",
  "dashboard.charts.responseTime.title": "Response time",
  "dashboard.charts.responseTime.sub": "Distribution · this month",
  "dashboard.charts.responseTime.ariaLabel": "Moderation response distribution",
  "dashboard.charts.responseTime.slaLabel": "{hours} SLA",
  "dashboard.charts.legend.withinSla": "Within SLA",
  "dashboard.charts.legend.overSla": "Over {hours}",
  "dashboard.charts.week.last": "last",
  "dashboard.charts.week.this": "this",
  "dashboard.charts.week.shortAgo": "-{count}w",
  "dashboard.charts.week.longThis": "This week",
  "dashboard.charts.week.longLast": "Last week",
  "dashboard.charts.week.longAgo": "{count} weeks ago",
  "dashboard.charts.reportsByType.legendLabel": "Report types shown",
  "dashboard.charts.reportsByType.keepOne": "At least one type stays visible",
  "dashboard.charts.reportsByType.total": "Total",
  "dashboard.charts.reportsByType.columnAria":
    "{week}: {breakdown}. Total {total}",
  "dashboard.charts.responseTime.summary":
    "{within} of {total} responses within the {hours} SLA",
  "dashboard.charts.responseTime.noResponses":
    "No responses recorded this month",
  "dashboard.charts.responseTime.tipCount":
    "{count} responses · {percent}% of all",

  // Shared across any stat tile / chart whose backing metric has no data
  // recorded yet (MRR, median response, response-time distribution, churn).
  "dashboard.notMeasuredYet": "Not measured yet",

  "dashboard.feed.title": "Live activity",
  "dashboard.feed.live": "Live",
  "dashboard.feed.transparency":
    "Every action here is <strong>logged and shown</strong> to the member it affects. No silent removals, ever.",
  "dashboard.feed.auditLinkCta": "See the audit log",
  "dashboard.feed.seeAllCta": "See all activity",
  "platformLog.navLabel": "Platform log",
  "platformLog.title": "Platform <em>log</em>",
  "platformLog.eyebrow": "Oversight",
  "platformLog.header.title": "Platform <em>log</em>",
  "platformLog.filters.label": "Filter the log",
  "platformLog.filters.categories": "Categories",
  "platformLog.filters.range": "Time range",
  "platformLog.filters.memberPrefix": "Involving",
  "platformLog.filters.memberUnknown": "the selected member",
  "platformLog.filters.clearMember": "Clear the member filter",
  "platformLog.category.moderation": "Moderation",
  "platformLog.category.staff": "Staff & access",
  "platformLog.category.governance": "Governance & settings",
  "platformLog.category.reviews": "Reviews",
  "platformLog.category.members": "Members",
  "platformLog.range.today": "Today",
  "platformLog.range.week": "This week",
  "platformLog.range.month": "This month",
  "platformLog.range.quarter": "This quarter",
  "platformLog.range.all": "All time",
  "platformLog.day.today": "Today",
  "platformLog.day.yesterday": "Yesterday",
  "platformLog.party.anonymous": "Anonymous member",
  "platformLog.party.erased": "Erased account",
  "platformLog.party.system": "System",
  "platformLog.party.filterHint": "Show everything involving {name}",
  "platformLog.subject.view": "View",
  "platformLog.note.show": "Show note",
  "platformLog.note.hide": "Hide note",
  "platformLog.empty.title": "Nothing logged in this window",
  "platformLog.empty.body": "Try a wider time range or clear a filter.",
  "platformLog.empty.clearFilters": "Clear filters",
  "platformLog.error.title": "The log didn't load",
  "platformLog.error.body": "Check your connection and try again.",
  "platformLog.loadMore": "Load more",
  "platformLog.loadingMore": "Loading more entries",
  "platformLog.loadMoreError": "More entries didn't load. Try again.",
  "platformLog.governanceSection.health": "Health",
  "platformLog.governanceSection.moderationSteps": "Moderation steps",
  "platformLog.governanceSection.council": "Council",
  "platformLog.governanceSection.principles": "Principles",
  "platformLog.governanceSection.decisions": "Decisions",
  "platformLog.kind.generic.moderation": "took a moderation action",
  "platformLog.kind.generic.staff": "took a staff action",
  "platformLog.kind.generic.governance": "changed a platform setting",
  "platformLog.kind.generic.reviews": "made a review decision",
  "platformLog.kind.generic.members": "made an update",
  "platformLog.kind.generic.moderation.target":
    "took a moderation action involving",
  "platformLog.kind.generic.staff.target": "took a staff action involving",
  "platformLog.kind.generic.governance.target":
    "changed a platform setting involving",
  "platformLog.kind.generic.reviews.target": "made a review decision about",
  "platformLog.kind.generic.members.target": "made an update involving",
  "platformLog.kind.mod.dismiss": "dismissed a report",
  "platformLog.kind.mod.dismiss.target": "dismissed a report about",
  "platformLog.kind.mod.warn": "issued a warning",
  "platformLog.kind.mod.warn.target": "warned",
  "platformLog.kind.mod.hide_content": "hid reported content",
  "platformLog.kind.mod.hide_content.target": "hid content posted by",
  "platformLog.kind.mod.remove_content": "removed reported content",
  "platformLog.kind.mod.remove_content.target": "removed content posted by",
  "platformLog.kind.mod.restrict": "restricted an account",
  "platformLog.kind.mod.restrict.target": "restricted",
  "platformLog.kind.mod.suspend": "suspended an account",
  "platformLog.kind.mod.suspend.target": "suspended",
  "platformLog.kind.mod.ban": "banned an account",
  "platformLog.kind.mod.ban.target": "banned",
  "platformLog.kind.mod.escalate": "escalated a report",
  "platformLog.kind.mod.escalate.target": "escalated a report about",
  "platformLog.kind.mod.ban_pending_ratification": "proposed a ban",
  "platformLog.kind.mod.ban_pending_ratification.target": "proposed banning",
  "platformLog.kind.mod.ban_declined": "declined a proposed ban",
  "platformLog.kind.mod.ban_declined.target": "declined the proposed ban on",
  "platformLog.kind.mod.ban_hold_expired": "let a ban hold expire",
  "platformLog.kind.mod.ban_hold_expired.target": "let the ban hold expire for",
  "platformLog.kind.mod.appeal_upheld": "upheld an appeal",
  "platformLog.kind.mod.appeal_upheld.target": "upheld the appeal from",
  "platformLog.kind.mod.appeal_overturned": "overturned a decision on appeal",
  "platformLog.kind.mod.appeal_overturned.target":
    "overturned the decision on appeal for",
  "platformLog.kind.mod.content_restored": "restored content",
  "platformLog.kind.mod.content_restored.target": "restored content posted by",
  "platformLog.kind.mod.restriction_lifted": "lifted a restriction",
  "platformLog.kind.mod.restriction_lifted.target": "lifted the restriction on",
  "platformLog.kind.mod.suspension_lifted": "lifted a suspension",
  "platformLog.kind.mod.suspension_lifted.target": "lifted the suspension on",
  "platformLog.kind.mod.member_verified": "verified a member",
  "platformLog.kind.mod.member_verified.target": "verified",
  "platformLog.kind.mod.evidence_cited": "cited evidence",
  "platformLog.kind.mod.evidence_cited.target": "cited evidence about",
  "platformLog.kind.mod.conversation_context_viewed":
    "viewed a reported conversation",
  "platformLog.kind.mod.conversation_context_viewed.target":
    "viewed a reported conversation involving",
  "platformLog.kind.mod.report_message_attachment_viewed":
    "opened a reported attachment",
  "platformLog.kind.mod.report_message_attachment_viewed.target":
    "opened an attachment reported about",
  "platformLog.kind.mod.creator_draft_viewed": "viewed a creator draft",
  "platformLog.kind.mod.creator_draft_viewed.target":
    "viewed a creator draft of",
  "platformLog.kind.mod.thread_locked": "locked a forum thread",
  "platformLog.kind.mod.thread_locked.target": "locked a thread by",
  "platformLog.kind.mod.thread_unlocked": "unlocked a forum thread",
  "platformLog.kind.mod.thread_unlocked.target": "unlocked a thread by",
  "platformLog.kind.mod.thread_pinned": "pinned a forum thread",
  "platformLog.kind.mod.thread_pinned.target": "pinned a thread by",
  "platformLog.kind.mod.thread_unpinned": "unpinned a forum thread",
  "platformLog.kind.mod.thread_unpinned.target": "unpinned a thread by",
  "platformLog.kind.mod.thread_official_set": "marked a thread as official",
  "platformLog.kind.mod.thread_official_set.target":
    "marked as official a thread by",
  "platformLog.kind.mod.thread_official_cleared":
    "removed a thread's official mark",
  "platformLog.kind.mod.thread_official_cleared.target":
    "removed the official mark from a thread by",
  "platformLog.kind.mod.thread_deleted": "deleted a forum thread",
  "platformLog.kind.mod.thread_deleted.target": "deleted a thread by",
  "platformLog.kind.mod.thread_review_approved": "approved a held thread",
  "platformLog.kind.mod.thread_review_approved.target":
    "approved a held thread by",
  "platformLog.kind.mod.thread_review_rejected": "rejected a held thread",
  "platformLog.kind.mod.thread_review_rejected.target":
    "rejected a held thread by",
  "platformLog.kind.mod.topic_hard_delete": "permanently deleted a topic",
  "platformLog.kind.mod.topic_hard_delete.target":
    "permanently deleted a topic by",
  "platformLog.kind.mod.media_force_delete": "force-deleted an upload",
  "platformLog.kind.mod.media_force_delete.target":
    "force-deleted an upload by",
  "platformLog.kind.mod.housing_coop_delete": "deleted a housing co-op",
  "platformLog.kind.mod.housing_coop_delete.target":
    "deleted a housing co-op run by",
  "platformLog.kind.mod.housing_coop_join_request_triage":
    "triaged a co-op join request",
  "platformLog.kind.mod.housing_coop_join_request_triage.target":
    "triaged a co-op join request from",
  "platformLog.kind.mod.housing_group_delete": "deleted a housing group",
  "platformLog.kind.mod.housing_group_delete.target":
    "deleted a housing group run by",
  "platformLog.kind.mod.housing_group_join_request_triage":
    "triaged a housing group join request",
  "platformLog.kind.mod.housing_group_join_request_triage.target":
    "triaged a housing group join request from",
  "platformLog.kind.mod.housing_group_listing_hide":
    "hid a housing group listing",
  "platformLog.kind.mod.housing_group_listing_hide.target":
    "hid a housing group listing by",
  "platformLog.kind.mod.housing_group_listing_unhide":
    "restored a housing group listing",
  "platformLog.kind.mod.housing_group_listing_unhide.target":
    "restored a housing group listing by",
  "platformLog.kind.mod.housing_listing_approved": "approved a housing listing",
  "platformLog.kind.mod.housing_listing_approved.target":
    "approved a housing listing by",
  "platformLog.kind.mod.housing_listing_changes_requested":
    "asked for changes to a housing listing",
  "platformLog.kind.mod.housing_listing_changes_requested.target":
    "asked for changes to a housing listing by",
  "platformLog.kind.mod.housing_listing_rejected": "rejected a housing listing",
  "platformLog.kind.mod.housing_listing_rejected.target":
    "rejected a housing listing by",
  "platformLog.kind.mod.housing_listing_taken_down":
    "took down a housing listing",
  "platformLog.kind.mod.housing_listing_taken_down.target":
    "took down a housing listing by",
  "platformLog.kind.mod.music_event_created":
    "created a QueerPulse music event",
  "platformLog.kind.mod.music_event_created.target": "created the music event",
  "platformLog.kind.mod.music_event_updated": "edited a QueerPulse music event",
  "platformLog.kind.mod.music_event_updated.target": "edited the music event",
  "platformLog.kind.mod.music_event_cancelled":
    "cancelled a QueerPulse music event",
  "platformLog.kind.mod.music_event_cancelled.target":
    "cancelled the music event",
  "platformLog.kind.mod.music_event_lineup_changed":
    "changed a music event lineup",
  "platformLog.kind.mod.music_event_lineup_changed.target":
    "changed a music event booking for",
  "platformLog.kind.mod.music_event_announcement_posted":
    "posted a music event announcement",
  "platformLog.kind.mod.music_event_announcement_posted.target":
    "posted an announcement on",
  "platformLog.kind.mod.music_event_guest_removed":
    "removed a music event guest",
  "platformLog.kind.mod.music_event_guest_removed.target":
    "removed from a music event",
  "platformLog.kind.mod.music_event_guest_barred":
    "banned a guest from a music event",
  "platformLog.kind.mod.music_event_guest_barred.target":
    "banned from a music event",
  "platformLog.kind.mod.music_event_guest_bar_lifted":
    "lifted a music event ban",
  "platformLog.kind.mod.music_event_guest_bar_lifted.target":
    "lifted a music event ban on",
  "platformLog.kind.mod.music_event_waitlist_promoted":
    "moved a guest off a music event waitlist",
  "platformLog.kind.mod.music_event_waitlist_promoted.target":
    "moved off a music event waitlist",
  "platformLog.kind.mod.music_event_invites_sent": "sent music event invites",
  "platformLog.kind.mod.music_event_invites_sent.target":
    "sent music event invites for",
  "platformLog.kind.mod.music_event_invite_decided":
    "answered a music event invite request",
  "platformLog.kind.mod.music_event_invite_decided.target":
    "answered a music event invite request from",
  "platformLog.kind.mod.music_event_cohost_added": "added a music event cohost",
  "platformLog.kind.mod.music_event_cohost_added.target":
    "added as a music event cohost",
  "platformLog.kind.mod.music_event_cohost_removed":
    "removed a music event cohost",
  "platformLog.kind.mod.music_event_cohost_removed.target":
    "removed as a music event cohost",
  "platformLog.kind.mod.music_event_go_together_changed":
    "changed Go Together on a music event",
  "platformLog.kind.mod.music_event_go_together_changed.target":
    "changed Go Together on",
  "platformLog.kind.mod.music_event_guests_exported":
    "exported a music event guest list",
  "platformLog.kind.mod.music_event_guests_exported.target":
    "exported the guest list of",
  "platformLog.kind.mod.role_changed": "changed a member's role",
  "platformLog.kind.mod.role_changed.target": "changed the role of",
  "platformLog.kind.mod.staff_role_granted": "granted a staff role",
  "platformLog.kind.mod.staff_role_granted.target": "granted a staff role to",
  "platformLog.kind.mod.staff_role_revoked": "revoked a staff role",
  "platformLog.kind.mod.staff_role_revoked.target": "revoked a staff role from",
  "platformLog.kind.mod.invite_quota_changed": "changed an invite quota",
  "platformLog.kind.mod.invite_quota_changed.target":
    "changed the invite quota of",
  "platformLog.kind.mod.invite_access_changed":
    "changed someone's invite access",
  "platformLog.kind.mod.invite_access_changed.target":
    "changed the invite access of",
  "platformLog.kind.mod.invite_revoked": "revoked an invite",
  "platformLog.kind.mod.invite_revoked.target": "revoked an invite from",
  "platformLog.kind.mod.invite_refreshed": "refreshed an invite",
  "platformLog.kind.mod.invite_refreshed.target": "refreshed an invite from",
  "platformLog.kind.mod.sign_in_identity_relinked":
    "relinked a sign-in identity",
  "platformLog.kind.mod.sign_in_identity_relinked.target":
    "relinked the sign-in identity of",
  "platformLog.kind.mod.sign_in_identity_candidate_dismissed":
    "dismissed a sign-in identity match",
  "platformLog.kind.mod.sign_in_identity_candidate_dismissed.target":
    "dismissed a sign-in identity match for",
  "platformLog.kind.mod.account_reactivated_by_admin": "reactivated an account",
  "platformLog.kind.mod.account_reactivated_by_admin.target":
    "reactivated the account of",
  "platformLog.kind.mod.email_suppression_lifted":
    "lifted an email suppression",
  "platformLog.kind.mod.email_suppression_lifted.target":
    "lifted the email suppression for",
  "platformLog.kind.mod.member_sign_in_email_viewed":
    "viewed a member's sign-in email",
  "platformLog.kind.mod.member_sign_in_email_viewed.target":
    "viewed the sign-in email of",
  "platformLog.kind.mod.message_deleted_by_staff": "deleted a message",
  "platformLog.kind.mod.message_deleted_by_staff.target":
    "deleted a message from",
  "platformLog.kind.mod.official_message_sent": "sent an official message",
  "platformLog.kind.mod.official_message_sent.target":
    "sent an official message to",
  "platformLog.kind.mod.official_broadcast_sent": "sent an official broadcast",
  "platformLog.kind.mod.official_broadcast_sent.target":
    "sent an official broadcast to",
  "platformLog.kind.mod.community_ban_applied": "applied a community ban",
  "platformLog.kind.mod.community_ban_applied.target":
    "applied a community ban to",
  "platformLog.kind.mod.community_ban_lifted": "lifted a community ban",
  "platformLog.kind.mod.community_ban_lifted.target":
    "lifted the community ban on",
  "platformLog.kind.mod.community_member_removed": "removed a community member",
  "platformLog.kind.mod.community_member_removed.target":
    "removed a community member:",
  "platformLog.kind.governance.section_changed":
    "updated the {section} section of governance",
  "platformLog.kind.governance.finance_changed":
    "updated the finances ({field})",
  "platformLog.kind.settings.changed": "changed a platform setting",
  "platformLog.kind.roadmap.changed": "updated the roadmap: {action}",
  "platformLog.kind.verification.submitted": "asked to be verified",
  "platformLog.kind.verification.approved": "approved a verification",
  "platformLog.kind.verification.approved.target":
    "approved the verification of",
  "platformLog.kind.verification.rejected": "rejected a verification",
  "platformLog.kind.verification.rejected.target":
    "rejected the verification of",
  "platformLog.kind.verification.overridden": "overrode a verification level",
  "platformLog.kind.verification.overridden.target":
    "overrode the verification level of",
  "platformLog.kind.verification.downgraded": "downgraded a verification",
  "platformLog.kind.verification.downgraded.target":
    "downgraded the verification of",
  "platformLog.kind.verification.appealed": "appealed a verification decision",
  "platformLog.kind.verification.withdrawn": "withdrew a verification request",
  "platformLog.kind.safe_space.nomination_acknowledged":
    "acknowledged a safe space nomination",
  "platformLog.kind.safe_space.nomination_assigned":
    "assigned a safe space nomination",
  "platformLog.kind.safe_space.nomination_awarded":
    "awarded a safe space badge",
  "platformLog.kind.safe_space.nomination_declined":
    "declined a safe space nomination",
  "platformLog.kind.safe_space.nomination_reopened":
    "reopened a safe space nomination",
  "platformLog.kind.safe_space.flag_raised": "raised a safe space concern",
  "platformLog.kind.safe_space.flag_withdrawn": "withdrew a safe space concern",
  "platformLog.kind.safe_space.flag_resolved": "resolved a safe space concern",
  "platformLog.kind.safe_space.badge_suspended": "suspended a safe space badge",
  "platformLog.kind.safe_space.badge_restored": "restored a safe space badge",
  "platformLog.kind.listing.status_changed": "changed a listing's status",
  "platformLog.kind.listing.removed": "removed a listing",
  "platformLog.kind.listing.question_asked": "asked a listing owner a question",
  "platformLog.kind.listing.answered":
    "answered a staff question on their listing",
  "platformLog.kind.listing.bulk_status": "changed listing statuses in bulk",
  "platformLog.kind.listing.ownership_transferred":
    "transferred a listing's ownership",
  "platformLog.kind.listing.owner_edited": "edited their listing",
  "platformLog.kind.listing.co_manager_added": "joined a listing's team",
  "platformLog.kind.listing.co_manager_removed": "ended a listing team seat",
  "platformLog.kind.listing.staff_created": "created a listing",
  "platformLog.kind.listing.suggestion_applied":
    "applied a suggested listing edit",
  "platformLog.kind.listing.directory_paused":
    "paused their listing in the directory",
  "platformLog.kind.listing.directory_resumed":
    "put their listing back in the directory",
  "platformLog.kind.listing.staff_edited": "edited a listing",
  "platformLog.kind.member.joined": "joined the platform",
  "platformLog.kind.member.vouch_given": "vouched for",
  "platformLog.kind.member.vouch_given.target": "vouched for",
  "platformLog.kind.member.community_joined": "joined a community",
  "platformLog.kind.member.report_filed": "filed a report",
  "platformLog.kind.member.report_filed_emergency": "filed an emergency report",
  "platformLog.kind.member.join_requested": "asked to join the platform",
  "platformLog.kind.member.thread_started": "started a forum thread",

  // Live-feed sentence fragments, composed per `feed[].type` from the DTO's
  // actor/target/community/count around these; see adminOverview.adapters.ts.
  // `type` is one of the 6 strings `admin-overview.service.ts` emits:
  // report_filed / report_resolved / member_joined / vouch_received /
  // community_joined / join_request_submitted.
  "dashboard.feed.type.reportFiled.body": "filed a report",
  "dashboard.feed.type.reportFiled.anonymousLead": "A report",
  "dashboard.feed.type.reportFiled.anonymousBody": "was filed anonymously",
  "dashboard.feed.type.reportResolved.body": "resolved a report",
  "dashboard.feed.type.reportResolved.anonymousLead": "A moderator",
  "dashboard.feed.type.memberJoined.body": "joined the platform",
  "dashboard.feed.type.memberJoined.leadCount_one": "{count} new member",
  "dashboard.feed.type.memberJoined.leadCount_other": "{count} new members",
  "dashboard.feed.type.memberJoined.genericLead": "New members",
  "dashboard.feed.type.vouchReceived.body": "received a vouch from",
  "dashboard.feed.type.vouchReceived.bodyNoActor": "received a new vouch",
  "dashboard.feed.type.vouchReceived.genericLead": "A member",
  "dashboard.feed.type.communityJoined.body": "joined",
  "dashboard.feed.type.communityJoined.genericLead": "A member",
  "dashboard.feed.type.joinRequestSubmitted.body": "requested to join",
  "dashboard.feed.type.joinRequestSubmitted.genericLead": "Someone",
  // Fallback for any feed `type` the backend adds later that this file
  // doesn't yet map — an honest generic line rather than blank/unmapped copy.
  "dashboard.feed.type.generic.body": "made an update",

  // ── Members ────────────────────────────────────────────────────────────────
  "members.title": "Members · <em>the people</em>",
  "members.header.eyebrow": "Member directory",
  "members.header.titleLine1": "{total} people,",
  "members.header.titleLine2": "each one <em>vouched for</em>.",
  "members.header.sub":
    "These aren't rows in a table. They're members someone trusted enough to bring in. Pronouns and chosen names are the only names shown here. {count} people are waiting to be welcomed in.",
  "members.header.titleLine1NoCount": "The people here,",
  "members.header.subNoCount":
    "Each row is a member someone trusted enough to bring in. Pronouns and chosen names are the only names shown here.",
  "members.header.exportCta": "Export",
  "members.header.trustNetworkCta": "Open trust network",
  "members.header.trustNetworkBadgeAria_one": "{count} trust case to review",
  "members.header.trustNetworkBadgeAria_other": "{count} trust cases to review",
  "members.filterAriaLabel": "Filter members",
  "members.searchPlaceholder": "Search by name…",
  "members.searchAriaLabel": "Search members by name or pronoun",
  "members.tabs.all": "All members",
  "members.tabs.pending": "Verification pending",
  "members.tabs.flagged": "Flagged",
  "members.tabs.sample": "Quality sample",
  "members.filters.all": "All statuses",
  "members.filters.verified": "Verified",
  "members.filters.new": "New this week",
  "members.empty": "No members match those filters.",
  "members.loadMore": "Load more members",
  "members.verify.partialLoadError.title":
    "We couldn't load <em>part of the queue</em>",
  "members.verify.partialLoadError.body":
    "Some requests may be missing below. Check your connection or your staff access, then try again.",
  "members.flagged.loadError.title":
    "We couldn't load <em>flagged members</em>",
  "members.flagged.loadError.body":
    "Flags may still be open. Check your connection or your staff access, then try again.",
  "members.flagged.empty": "No one is flagged right now.",
  "tabs.countUnavailable": "count unavailable",
  "housingGroups.listings.hideDialog.bodyUnpublished":
    "This listing isn't on the group's board, so its poster gets no notification. Your reason is kept on the listing, and you can un-hide it from this list.",
  "members.loadError.title": "We couldn't load <em>the member list</em>",
  "members.loadError.body":
    "The list didn't arrive. Check your connection or your staff access, then try again.",
  "members.verify.loadError.title": "We couldn't load <em>the queue</em>",
  "members.verify.loadError.body":
    "People may still be waiting. Check your connection or your staff access, then try again.",
  "members.row.ariaLabel": "Open {name}: {status}, {role}, {reports}",
  "members.row.notVerified": "Not verified",
  "members.loadMoreError.title": "We couldn't load <em>more members</em>",
  "members.loadMoreError.body":
    "The members above are still here. Check your connection or your staff access, then try again.",
  "members.vouchedLabel": "vouched",

  "members.verify.intro":
    "These people asked to join QueerPulse. Read what they wrote, then welcome them in or set the request aside.",
  "members.verify.introEm": "Take your time; there's no rush on a kindness.",
  "members.verify.empty":
    "The queue is clear. Everyone waiting has been welcomed in.",
  "members.verify.declineCta": "Not this time",
  "members.verify.approveCta": "Welcome in",
  "members.verify.approvedToast": "{name} was welcomed in",
  "members.verify.declinedToast": "{name}'s request wasn't approved this time",
  "members.verify.errorToast": "Could not save that decision. Please try again",
  "members.verify.appliedToday": "Applied today",
  "members.verify.appliedRecently": "Applied recently",
  "members.verify.appliedDaysAgo_one": "Applied {count} day ago",
  "members.verify.appliedDaysAgo_other": "Applied {count} days ago",
  "members.verify.unnamedApplicant": "New applicant",
  "members.verify.emailLabel": "Email",
  "members.verify.cityLabel": "City",
  "members.verify.noCity": "Not given",
  // Which page the applicant came through on their way to the request form.
  "members.verify.sourceLabel": "Came from",
  "members.verify.studioArtistChip": "Studio artist",
  "members.verify.heardFromLabel": "Heard about us",
  "members.verify.socialProfileLabel": "Social profile",
  "members.verify.opensInNewTab": "(opens in a new tab)",
  "members.verify.socialProfileGoesTo": "Goes to {host}",
  "members.verify.source.homepage_hero": "Homepage hero",
  "members.verify.source.homepage_outro": "Homepage closing invite",
  "members.verify.source.homepage_built":
    "Homepage \u201cwhat we built\u201d explainer",
  "members.verify.source.members_explainer": "Members explainer",
  "members.verify.source.personas_explainer": "Personas explainer",
  "members.verify.source.housing_explainer": "Housing explainer",
  "members.verify.source.sign_in": "Sign-in page",
  "members.verify.source.barter": "Barter board",
  "members.verify.source.employer_reviews": "Employer reviews",
  "members.verify.source.skills": "Skills directory",
  "members.verify.source.solidarity_directory": "Solidarity directory",
  "members.verify.source.solidarity": "Solidarity page",
  "members.verify.source.public_profile": "A member's public profile",
  "members.verify.source.about": "About page",
  "members.verify.source.directory": "Directory",
  "members.verify.source.partners": "Partners page",
  "members.verify.source.arriving": "Arriving guide",
  "members.verify.source.communities_about": "Communities explainer",
  "members.verify.source.accessibility": "Accessibility page",
  "members.verify.source.wellbeing": "Wellbeing resources",
  "members.verify.source.trans_hub": "Trans hub",
  "members.verify.source.legal": "Legal guide",
  "members.verify.source.micro_grants": "Micro-grants",
  "members.verify.source.queer_101": "Queer 101",
  "members.verify.source.magazine": "Magazine",
  "members.verify.source.status": "Status page",
  "members.verify.source.gathering_vouch": "Event vouch callout",
  "members.verify.source.family": "Family page",
  "members.verify.source.reading_groups": "Reading groups",
  "members.verify.source.direct": "Opened the invite page directly",
  "members.verify.source.other": "Another page",
  "members.verify.source.volunteer_explainer": "Volunteer explainer",
  "members.verify.source.gathering_explainer": "Event explainer",
  "members.verify.source.roadmap_explainer": "Roadmap explainer",
  "members.verify.source.rating_explainer": "Guide rating explainer",
  "members.verify.source.for_businesses": "Page for businesses",
  "members.verify.source.for_communities": "Page for communities",
  "members.verify.source.for_performers": "Page for performers",
  "members.verify.source.for_practitioners": "Page for practitioners",
  "members.verify.source.studio_landing": "Studio page",
  "members.verify.source.studio_artist": "Studio page, as an artist",
  "members.verify.ageAttested": "18+ confirmed {date} · Terms v{version}",
  "members.verify.ageAttestedUnknown": "18+ confirmed · Terms v{version}",
  // Approved: QueerPulse emails nothing about applications (its only email is
  // a sign-in code a person asks for on screen), so approval reaches the applicant
  // only when the reviewer carries the link over themselves. Say that
  // plainly here; promising an inbox delivery would strand people.
  "members.verify.approvedLabel": "Welcomed in",
  "members.verify.sendYourself":
    "Invites go out by hand. Copy the link below and send it to {email} yourself.",
  "members.verify.linkFieldLabel": "Invite link",
  "members.verify.copyLink": "Copy link",
  "members.verify.copiedLink": "Copied",
  "members.verify.copiedToast": "Invite link copied. Now send it to them",
  "members.verify.copyFailed": "Could not copy the link. Select it and copy",
  "members.verify.noInviteCode":
    "No invite code came back. Refresh the queue, or ask an admin to reissue it.",
  "members.verify.flags.disposableEmail": "Disposable email address",
  "members.verify.flags.duplicateMessage":
    "Same message as another pending request",
  "members.verify.flags.sourceBurst":
    "Part of an unusual burst from this source",
  "members.verify.priorDeclineCount_one": "Declined once before",
  "members.verify.priorDeclineCount_other": "Declined {count} times before",
  "members.verify.referenceLabel": "Reference",
  "members.verify.referenceResolved": "Corroborated by {name}",
  "members.verify.referenceUnresolved":
    "Named {email}; no matching member on record",
  "members.verify.waitingDays_one": "Waiting {count} day",
  "members.verify.waitingDays_other": "Waiting {count} days",
  "members.verify.declineReason.spam_pattern": "Looks like spam",
  "members.verify.declineReason.underage": "Under 18",
  "members.verify.declineReason.implausible": "Details don't add up",
  "members.verify.declineReason.safety_concern": "Safety concern",
  "members.verify.declineReason.other": "Other",
  "members.verify.declineReasonDetail.spam_pattern":
    "Signup looks automated or clearly fake.",
  "members.verify.declineReasonDetail.underage":
    "The applicant appears to be under 18.",
  "members.verify.declineReasonDetail.implausible":
    "The answers don't add up or seem made up.",
  "members.verify.declineReasonDetail.safety_concern":
    "Something about this request raises a safety flag.",
  "members.verify.declineReasonDetail.other":
    "A decline for a reason the other options don't capture.",
  "members.verify.declineModal.eyebrow": "Membership request",
  "members.verify.declineModal.title": "Decline {name}'s request?",
  "members.verify.declineModal.body":
    "Pick the closest reason. Nothing is sent to the applicant. If they check their request status themselves, they see a short, generic note instead of this.",
  "members.verify.declineModal.reasonLabel": "Reason",
  "members.verify.declineModal.confirmCta": "Decline request",
  "members.verify.approvalReason.member_vouched": "A member vouched",
  "members.verify.approvalReason.clear_request": "Clear, genuine request",
  "members.verify.approvalReason.known_to_team": "Known to the team",
  "members.verify.approvalReason.partner_or_event":
    "Came through a partner or event",
  "members.verify.approvalReason.social_profile_checked":
    "Checked their social profile",
  "members.verify.approvalReason.other": "Other",
  "members.verify.approvalReasonDetail.member_vouched":
    "A member they named backs them up.",
  "members.verify.approvalReasonDetail.clear_request":
    "What they wrote reads as a real person who wants to be here.",
  "members.verify.approvalReasonDetail.known_to_team":
    "Someone on the team knows them or has met them.",
  "members.verify.approvalReasonDetail.partner_or_event":
    "They found us through a partner group or an event.",
  "members.verify.approvalReasonDetail.social_profile_checked":
    "Their profile showed a real person and nothing hostile.",
  "members.verify.approvalReasonDetail.other":
    "An approval for a reason the other options don't capture.",
  "members.verify.approveModal.eyebrow": "Membership request",
  "members.verify.approveModal.title": "Welcome {name} in?",
  "members.verify.approveModal.body":
    "Pick the closest reason. Only staff see it. Approving mints an invite link that you copy and send to them yourself.",
  "members.verify.approveModal.reasonLabel": "Reason",
  "members.verify.approveModal.confirmCta": "Welcome in",
  "members.verify.approveModal.noteLabel": "Say what the reason was",
  "members.verify.approveModal.noteHelper":
    "A line or two so the rest of the team can follow your call.",
  "members.verify.waitlistCta": "Waitlist",
  "members.verify.waitlistedToast": "{name} moved to the waitlist",
  "members.verify.waitlistedSectionTitle": "Waitlisted",
  "members.verify.identityReminder":
    "A name, photo, or pronouns aren't grounds to decline on their own.",
  "members.verify.unvouched.withSocial":
    "Nobody here vouches for {name}. Look at their social profile and message before deciding.",
  "members.verify.unvouched.withoutSocial":
    "Nobody here vouches for {name} and they didn't share a social profile. Read their message, and if you're unsure, email them for more details.",
  "members.verify.unvouched.withSocialNoName":
    "Nobody here vouches for this applicant. Look at their social profile and message before deciding.",
  "members.verify.unvouched.withoutSocialNoName":
    "Nobody here vouches for this applicant and they didn't share a social profile. Read their message, and if you're unsure, email them for more details.",
  "members.verify.guide.summary": "How to review someone nobody here knows",
  "members.verify.guide.step1Title":
    "Look at their social profile, if they shared one.",
  "members.verify.guide.step1Body":
    "Check that a real person is behind it and that it shows no hostility toward queer or trans people. A private account is fine.",
  "members.verify.guide.step2Title":
    "Read their message and how they heard about us.",
  "members.verify.guide.step2Body":
    "Specific, personal answers are a good sign. Generic wording, copy-pasted text or a story that doesn't hold together deserves a closer look.",
  "members.verify.guide.step3Title": "Check the flags on the card.",
  "members.verify.guide.step3Body":
    "Disposable email, duplicate message, burst, prior decline and ban evasion each tell you where to look, and none of them is a verdict.",
  "members.verify.guide.step4Title": "Still unsure? Ask them.",
  "members.verify.guide.step4Body":
    'Use "for more details" on the card to send a friendly note asking for a profile or a few lines about themselves, and waitlist them while you wait.',
  "members.verify.guide.step5Title": "Decline for a concrete reason.",
  "members.verify.guide.step5Body":
    "Hostile or hateful content, a fake or impersonated profile, a spam or commercial account, being under 18, or a ban-evasion match.",
  "members.verify.guide.neverTitle": "Never a reason to decline",
  "members.verify.guide.neverBody":
    'No social link, a private account, or not "looking" or "posting" queer enough. Many people here aren\'t out, and a quiet profile can be how they stay safe.',
  "members.verify.guide.rubricVersion": "Full rubric: version 1.1",
  "members.verify.followUp.action": "Email {name} for more details",
  "members.verify.followUp.actionNoName": "Email them for more details",
  "members.verify.followUp.eyebrow": "Ask for more",
  "members.verify.followUp.title": "Email {name}",
  "members.verify.followUp.titleNoName": "Email this applicant",
  "members.verify.followUp.languageLabel": "Email language",
  "members.verify.followUp.languageEn": "English",
  "members.verify.followUp.languagePt": "Português",
  "members.verify.followUp.toLabel": "To",
  "members.verify.followUp.subjectLabel": "Subject",
  "members.verify.followUp.bodyLabel": "Message",
  "members.verify.followUp.open": "Open in email app",
  "members.verify.followUp.copy": "Copy email",
  "members.verify.followUp.copied": "Email copied",
  "members.verify.followUp.copyFailed":
    "Couldn't copy. Select the text and copy it yourself.",
  "members.verify.followUp.waitlistHint": "Waiting on a reply?",
  "members.verify.followUp.waitlistAction": "Waitlist {name}",
  "members.verify.followUp.waitlistActionNoName": "Waitlist this request",
  "members.verify.followUp.subject": "Your QueerPulse invite request",
  "members.verify.followUp.greeting": "Hi {name},",
  "members.verify.followUp.greetingNoName": "Hi there,",
  "members.verify.followUp.body":
    "Thanks for asking to join QueerPulse. Our team reads every request, and we'd like to get to know you a little before we send an invite.\n\nQueerPulse is a space for LGBTQIA+ people and allies, and keeping it safe matters a lot to everyone here. Since you're new to our community, we'd love to hear a little more about you. It helps us make sure everyone who joins is who they say they are and is here in good faith. We ask this of everyone who doesn't have a friend here yet.\n\nCould you reply with any one of these?\n\n- A link to a social profile (Instagram, TikTok, Bluesky or similar). If it's private, a screenshot of your profile page works too.\n- The name or email of someone already on QueerPulse who knows you.\n- A few lines about yourself and how you'd like to use QueerPulse.\n\nOnly the review team sees what you send, and we use it for this request alone. If you're not out, or you'd rather keep your socials to yourself, that's completely fine. Tell us a bit more in your own words and we'll take it from there.\n\nYour request stays open while we wait to hear from you.\n\nWarmly,\nThe QueerPulse team",
  "members.verify.selectAria": "Select {name}'s request",
  "members.verify.bulk.ariaLabel": "Bulk actions",
  "members.verify.bulk.selectedCount_one": "{count} selected",
  "members.verify.bulk.selectedCount_other": "{count} selected",
  "members.verify.bulk.capNote": "Up to {cap} at a time",
  "members.verify.bulk.approveCta": "Approve",
  "members.verify.bulk.waitlistCta": "Waitlist",
  "members.verify.bulk.declineCta": "Decline",
  "members.verify.bulk.clearCta": "Clear",
  // Frames for `describeError`, so they read as a failure with the server's
  // reason appended, so they read as a failure rather than an instruction.
  "members.verify.bulk.action.approve": "Could not approve those requests",
  "members.verify.bulk.action.waitlist": "Could not waitlist those requests",
  "members.verify.bulk.action.decline": "Could not decline those requests",

  // Select-all names the exact set it takes: the requests waiting on this page,
  // never the whole queue and never the waitlisted section below it.
  "members.verify.bulk.selectAll.label_one":
    "Select the {count} request waiting here",
  "members.verify.bulk.selectAll.label_other":
    "Select all {count} requests waiting here",
  "members.verify.bulk.capReached":
    "That is {cap} at a time, the most one action can take. Clear some to pick others.",

  // Confirmation. Nothing reaches the server until one of these is confirmed.
  "members.verify.bulk.confirmApprove.title": "Approve {count} requests?",
  "members.verify.bulk.confirmApprove.body":
    "Each approval mints an invite link. Nothing is sent to anyone: you copy each link from the Decided tab and pass it on yourself.",
  "members.verify.bulk.confirmApprove.confirmCta": "Approve all",
  "members.verify.bulk.confirmApprove.reasonBody":
    "Pick the closest reason. It applies to all {count} selected requests, and only staff see it.",
  "members.verify.bulk.confirmApprove.reasonLine_one":
    "This records “{reason}” against the {count} request selected.",
  "members.verify.bulk.confirmApprove.reasonLine_other":
    "This records “{reason}” against all {count} selected requests.",
  "members.verify.bulk.confirmWaitlist.title": "Waitlist {count} requests?",
  "members.verify.bulk.confirmWaitlist.body":
    "They stay open and move to the waitlist, so you can come back to them.",
  "members.verify.bulk.confirmWaitlist.confirmCta": "Waitlist all",
  "members.verify.bulk.confirmDecline.title": "Decline {count} requests?",
  "members.verify.bulk.confirmDecline.body":
    "Pick the closest reason. It applies to all {count} selected requests.",
  "members.verify.bulk.confirmDecline.reasonLine_one":
    "This records “{reason}” against the {count} request selected.",
  "members.verify.bulk.confirmDecline.reasonLine_other":
    "This records “{reason}” against all {count} selected requests.",
  "members.verify.bulk.confirmDecline.confirmCta": "Decline all",

  // Announced only when the whole batch went through. A batch that half-applied
  // is reported by the result panel below, never as a success.
  "members.verify.bulk.approvedToast_one":
    "{count} request approved. Its invite link is in Decided, for you to send on.",
  "members.verify.bulk.approvedToast_other":
    "{count} requests approved. Their invite links are in Decided, for you to send on.",
  "members.verify.bulk.waitlistedToast_one":
    "{count} request moved to the waitlist.",
  "members.verify.bulk.waitlistedToast_other":
    "{count} requests moved to the waitlist.",
  "members.verify.bulk.declinedToast_one": "{count} request declined.",
  "members.verify.bulk.declinedToast_other": "{count} requests declined.",

  // The per-item result. A bulk review is applied one request at a time on the
  // server, so a batch commonly half-lands: someone else may have settled a
  // request while this one was open.
  "members.verify.bulk.result.title": "What went through",
  "members.verify.bulk.result.succeeded_one": "{count} request went through.",
  "members.verify.bulk.result.succeeded_other":
    "{count} requests went through.",
  "members.verify.bulk.result.noneSucceeded": "None of them went through.",
  "members.verify.bulk.result.failedTitle_one": "{count} was left as it was",
  "members.verify.bulk.result.failedTitle_other":
    "{count} were left as they were",
  "members.verify.bulk.result.unknownApplicant": "Request {id}",
  "members.verify.bulk.result.retryNote":
    "These are still selected. Try again, or open them one at a time.",
  "members.verify.bulk.result.dismissCta": "Dismiss",
  "members.verify.status.approved": "Approved",
  "members.verify.status.declined": "Declined",

  // The queue has two halves: what is still waiting on a reviewer, and what has
  // already been settled.
  "members.verify.tabs.waiting": "Waiting",
  "members.verify.tabs.decided": "Decided",

  // Decided tab. It reads from the server, so a decision and the invite link it
  // minted are still here after a refresh, a navigation away, or a bulk
  // approval. Nothing is ever emailed, so that link is the reviewer's to carry
  // over by hand, and an approval invite lapses after seven days.
  "members.verify.decided.intro":
    "Requests that have already been settled. An approval keeps its invite link here, so you can still hand it over.",
  "members.verify.decided.searchLabel": "Search decided requests",
  "members.verify.decided.searchPlaceholder": "Search by name or email",
  "members.verify.decided.searchScopeNote_one":
    "This searches the {count} decided request loaded here.",
  "members.verify.decided.searchScopeNote_other":
    "This searches the {count} decided requests loaded here.",
  "members.verify.decided.empty":
    "Nothing has been decided yet. Approvals and declines collect here.",
  "members.verify.decided.noMatches":
    "No decided request loaded here matches “{query}”.",
  "members.verify.decided.appliedOn": "Applied {date}",
  "members.verify.decided.decidedOn": "Decided {date}",
  "members.verify.decided.decidedUnknown": "Decision date not recorded",
  "members.verify.decided.note.label": "Staff note",
  "members.verify.decided.note.hint":
    "Only staff can see this. The applicant never does.",
  "members.verify.decided.note.editedBy": "Edited by {name} · {date}",
  "members.verify.decided.note.editedByUndated": "Edited by {name}",
  "members.verify.decided.note.editorYou": "you",
  "members.verify.decided.note.editorUnknown": "a staff member",
  "members.verify.decided.note.add": "Add a note",
  "members.verify.decided.note.edit": "Edit note",
  "members.verify.decided.note.save": "Save",
  "members.verify.decided.note.saving": "Saving",
  "members.verify.decided.note.cancel": "Cancel",
  "members.verify.decided.note.savedToast": "Note saved",
  "members.verify.decided.note.removedToast": "Note removed",
  "members.verify.decided.note.error.tooLong":
    "That note is over 2000 characters. Shorten it and save again.",
  "members.verify.decided.note.error.forbidden":
    "Notes on requests are for moderators and admins. Ask someone on that team.",
  "members.verify.decided.note.error.notFound":
    "This request isn't here any more. Refresh the tab and look again.",
  "members.verify.decided.note.error.notDeclined":
    "Only declined requests take a note, and this one has changed. Refresh the tab to see where it stands.",
  "members.verify.decided.note.error.generic":
    "The note didn't save. Your text is still here, so try again.",
  "members.verify.decided.declineReasonLine": "Reason: {reason}",
  "members.verify.decided.decidedOnBy": "Decided {date} by {name}",
  "members.verify.decided.decidedUnknownBy":
    "Decided by {name}, date not recorded",
  "members.verify.decided.reviewerYou": "you",
  "members.verify.decided.approvalReasonLine": "Reason: {reason}",
  "members.verify.decided.approvalNoteLine": "Why: {note}",
  "members.verify.decided.approvalReasonMissing":
    "No reason on record. This was approved before reasons were asked for.",
  "members.verify.decided.showDetails": "Show details for {name}",
  "members.verify.decided.hideDetails": "Hide details for {name}",
  "members.verify.decided.applicationHeading": "What they sent",
  "members.verify.decided.copyEmail": "Copy {name}'s email",
  "members.verify.decided.emailCopied": "Email copied",
  "members.verify.decided.emailCopyFailed": "Couldn't copy the email",
  "members.verify.decided.filter.groupLabel": "Filter decided requests",
  "members.verify.decided.filter.all": "All",
  "members.verify.decided.filter.unclaimed": "Not claimed",
  "members.verify.decided.filter.claimed": "Claimed",
  "members.verify.decided.filter.declined": "Declined",
  "members.verify.decided.filter.optionSr_one": "{label}, {count} request",
  "members.verify.decided.filter.optionSr_other": "{label}, {count} requests",
  "members.verify.decided.filterEmpty":
    "No decided request loaded here fits “{filter}”.",

  // The state of the invite an approval minted. It expires seven days after it
  // is minted, and only an expired one can be reissued.
  "members.verify.invite.chip.valid": "Link active",
  "members.verify.invite.chip.used": "Link used",
  "members.verify.invite.chip.expired": "Link expired",
  "members.verify.invite.chip.revoked": "Link revoked",
  "members.verify.invite.validDaysLeft_one":
    "This link works for {count} more day. Send it to them.",
  "members.verify.invite.validDaysLeft_other":
    "This link works for {count} more days. Send it to them.",
  "members.verify.invite.validToday":
    "This link stops working today. Send it to them now.",
  "members.verify.invite.validNoExpiry": "This link has no expiry on it.",
  "members.verify.invite.expired":
    "This link expired before anyone used it. Reissue it and the same link works again.",
  "members.verify.invite.used":
    "They used this link, so they are already here.",
  "members.verify.invite.revoked":
    "This link was revoked, so it no longer opens.",
  "members.verify.invite.noneMinted":
    "No invite code is on record for this approval. Ask an admin to look into it.",
  "members.verify.invite.reissueCta": "Reissue link",
  "members.verify.invite.reissuing": "Reissuing",
  "members.verify.invite.reissuedToast":
    "That link works again. Send it to {email}.",
  "members.verify.invite.reissueError.forbidden":
    "Reissuing an invite is for moderators and admins. Ask one of them to do it.",
  "members.verify.invite.reissueError.notFound":
    "There is no invite on this request to reissue. Refresh the tab and look again.",
  "members.verify.invite.reissueError.notReissuable":
    "This link was used or revoked, or it still works. There is nothing to reissue.",
  "members.verify.invite.reissueError.generic":
    "Could not reissue that link. Please try again.",
  "members.verify.invite.revoke.cta": "Revoke link",
  "members.verify.invite.revoke.confirmTitle":
    "Revoke the invite link for {name}?",
  "members.verify.invite.revoke.confirmBody":
    "The invite link for {email} stops working straight away. A revoked link cannot be reissued.",
  "members.verify.invite.revoke.confirmCta": "Revoke link",
  "members.verify.invite.revoke.doneToast":
    "The link for {email} no longer works.",
  "members.verify.invite.revoke.movedOnToast":
    "This link already changed state, so there is nothing to revoke. Refresh to see where it stands.",
  "members.verify.invite.revoke.failedToast":
    "Could not revoke that link. Please try again.",

  // Quality-sampling tab: a periodic read-only look at past decisions for a
  // second admin to compare notes on. Not a signoff workflow — say so.
  "members.sample.intro":
    "A random handful of decisions this queue has already made, so the people working it can read each other's calls and keep one shared bar.",
  "members.sample.explainer":
    "Read a few beside the review guidelines and talk them through together. The subject is the bar this queue holds, and everyone here is holding it.",
  "members.sample.readOnlyNote":
    "Read-only. Nothing here can be changed from this view, and no second signoff is recorded.",
  "members.sample.resampleCta": "Show a different sample",
  "members.sample.sizeLabel": "How many to draw",
  "members.sample.sizeOption_one": "{count} decision",
  "members.sample.sizeOption_other": "{count} decisions",
  "members.sample.decidedOnLabel": "Decided",
  "members.sample.appliedLabel": "Applied",
  "members.sample.reasonLabel": "Reason",
  "members.sample.noReason": "No reason recorded",
  "members.sample.reviewerLabel": "Decided by",
  "members.sample.reviewerYou": "You",
  // Fallback only. The queue now resolves a display name for whoever decided,
  // so this short, stable reference is what a row shows when the server sent an
  // id with no name behind it: enough to group one reviewer's calls together,
  // never presented as an identity.
  "members.sample.reviewerOther": "Reviewer {reference}",
  // No reviewer on the row at all. Also where a reviewer who has since erased
  // their account lands: erasure takes the id with it, so there is nothing left
  // to name and nothing here may invent one.
  "members.sample.reviewerUnknown": "Not recorded",
  // The reviewer filter. Reads decisions, never people: no counts, no ranking,
  // no throughput. The whole question it answers is "let me read this person's
  // calls in a row and see whether they match mine".
  "members.sample.reviewerFilterLabel": "Show decisions by",
  "members.sample.reviewerFilterAll": "Everyone",
  "members.sample.reviewerFilterHint":
    "Reading one person's calls together makes a different reading of the guidelines easier to spot.",
  "members.sample.reviewerFilterEmpty":
    "Nothing by that reviewer in this draw. Draw another sample, or go back to everyone.",
  "members.sample.empty": "No reviewed requests yet to sample.",
  "members.sample.loadError":
    "Could not draw a sample just now. Try again in a moment.",

  "members.drawer.verifiedChip": "Verified member",
  "members.drawer.verifyCta": "Verify",
  "members.drawer.verifiedToast": "{name} is verified.",
  "members.drawer.messageCta": "Message",
  "members.drawer.restrictCta": "Restrict…",
  // There is no account-removal endpoint. The most severe real action is a
  // permanent, appealable ban, so that is what this button says and does.
  "members.drawer.banCta": "Ban permanently…",
  "members.drawer.glanceTitle": "At a glance",
  "members.drawer.graphTitle": "Vouch graph: trust both ways",
  "members.drawer.graphAriaLabel": "Open the full trust network",
  "members.drawer.exploreCta": "Explore network",
  "members.drawer.communitiesTitle": "Communities",
  "members.drawer.contributionsTitle": "Contribution history",
  "members.drawer.messageSentToast": "Message sent",
  "members.drawer.missingReasonToast":
    "A reason is required. {name} will see it",
  "members.drawer.restrictedToast":
    "Restricted · {duration} · {scope} · {name} notified",
  "members.drawer.restrictionUndoneToast": "Restriction reversed.",
  // Shown in live mode where verify / message / restrict have no backend
  // endpoint yet — the drawer stays honest instead of faking success (demo
  // keeps the simulated flow). Role changes are the one wired action.
  "members.drawer.comingSoonToast":
    "This moderation action isn't available yet.",

  // ── Members: role management (grant/revoke moderator & admin) ─────────────
  "members.suspension.sectionTitle": "Suspension",
  "members.suspension.description":
    "This member is currently suspended. Lifting it reinstates their account and restores their access right away.",
  "members.suspension.liftCta": "Lift suspension",
  "members.suspension.liftedToast": "{name} has been reinstated.",
  "members.suspension.confirm.title": "Reinstate {name}?",
  "members.suspension.confirm.body":
    "This lifts {name}'s suspension and restores full access immediately. It's logged in the audit trail under your name. You can suspend again if needed.",
  "members.suspension.confirm.confirmCta": "Lift suspension",
  "members.role.currentLabel": "Current role",
  "members.role.description":
    "Moderators can act on reports and moderate content across the platform. Admins can do everything, including managing who holds these roles.",
  "members.role.value.member": "Member",
  "members.role.value.moderator": "Moderator",
  "members.role.value.admin": "Admin",
  "members.role.setAs.member": "Set as member",
  "members.role.setAs.moderator": "Make moderator",
  "members.role.setAs.admin": "Make admin",
  "members.role.selfNote":
    "You can't change your own role. Ask another admin to do it.",
  "members.role.systemNote":
    "This is the QueerPulse house account. Its role is fixed and can't be changed here.",
  "members.role.updatedToast": "{name} is now {role}.",
  "members.role.demoteConfirm.title": "Remove admin from {name}?",
  "members.role.demoteConfirm.body":
    "{name} will lose access to every admin tool right away. You can restore it later. This is recorded in the audit log under your name.",
  "members.role.demoteConfirm.confirmCta": "Remove admin",
  "members.role.grantConfirm.title": "Make {name} an admin?",
  "members.role.grantConfirm.body":
    "{name} will get full admin access to the platform right away: staff and role management, moderation actions on every report, and every other admin tool. This is the highest level of access QueerPulse has. It's recorded in the audit log under your name.",
  "members.role.grantConfirm.confirmCta": "Grant admin access",

  // ── Staff roster (/admin/staff): every admin, moderator and grant holder ─
  "staff.title": "Staff & <em>roles</em>",
  "staff.header.eyebrow": "Who runs QueerPulse",
  "staff.header.sub":
    "Every admin, moderator and grant holder, and who holds each grant today. Manage opens a person's record here to change their tier or grants.",
  "staff.grantsLabel": "Grants",
  "staff.empty": "Nobody holds a staff role right now.",
  "staff.loadError": "Couldn't load the staff roster.",
  "staff.summary.heading": "At a glance",
  "staff.summary.admins": "Admins",
  "staff.summary.adminsHint": "Full platform access",
  "staff.summary.moderators": "Moderators",
  "staff.summary.moderatorsHint": "Reports and safety",
  "staff.summary.grantHolders": "Grant holders",
  "staff.summary.grantHoldersHint": "One domain each",
  "staff.summary.uncovered": "Uncovered grants",
  "staff.summary.uncoveredHint": "See which ones need a holder",
  "staff.summary.uncoveredHintNone": "Every grant has a holder",
  "staff.coverage.heading": "Grant coverage",
  "staff.coverage.sub":
    "Who holds each staff grant today. Pick a grant to see its holders below.",
  "staff.coverage.holders_one": "{count} holder",
  "staff.coverage.holders_other": "{count} holders",
  "staff.coverage.nobody": "Nobody holds this",
  "staff.coverage.inactive_one": "{count} suspended or deactivated holder",
  "staff.coverage.inactive_other": "{count} suspended or deactivated holders",
  "staff.coverage.more": "+{count}",
  "staff.roster.heading": "Everyone on staff",
  "staff.toolbar.searchLabel": "Search staff",
  "staff.toolbar.searchPlaceholder": "Name or @handle",
  "staff.toolbar.searchClear": "Clear search",
  "staff.toolbar.tierLabel": "Show",
  "staff.toolbar.tier.all": "All",
  "staff.toolbar.tier.admin": "Admins",
  "staff.toolbar.tier.moderator": "Moderators",
  "staff.toolbar.tier.member": "Grant holders",
  "staff.toolbar.grantChipRemove": "Remove the {grant} filter",
  "staff.toolbar.clear": "Clear filters",
  "staff.toolbar.showing": "Showing {shown} of {total}",
  "staff.group.admin": "Admins",
  "staff.group.moderator": "Moderators",
  "staff.group.member": "Grant holders",
  "staff.row.status.suspended": "Suspended",
  "staff.row.status.deactivated": "Deactivated",
  "staff.row.joined": "Joined {date}",
  "staff.row.grantedOn": "Granted {date}",
  // Read after the grant's name inside its chip, for anyone the title
  // tooltip never reaches.
  "staff.row.grantedOnSpoken": ", granted {date}",
  "staff.row.allAccess": "Every staff capability",
  "staff.row.tierOnly": "Tier access only",
  "staff.row.manage": "Manage",
  "staff.row.manageAria": "Manage {name}",
  "staff.row.viewProfile": "View {name}'s profile",
  "staff.filteredEmpty.title": "Nobody matches these filters",
  "staff.filteredEmpty.body":
    "Try another name or @handle, or widen the tier and grant filters.",
  "staff.filteredEmpty.unheldTitle": "Nobody holds {grant} yet",
  "staff.filteredEmpty.unheldBody":
    "Open someone's record with Manage to grant it.",

  // ── Members: staff roles (additive functional grants, e.g. magazine desk) ─
  "staffRoles.title": "Roles & access",
  "staffRoles.subtitle":
    "Grant functional roles on top of this member's account level.",
  "staffRoles.accountLevelLabel": "Account level",
  "staffRoles.grantsLabel": "Staff roles",
  // The grant list is collapsed by default, so the disclosure header has to
  // say what is behind it. Rendered with a { count }, so the plural form is
  // resolved by CLDR; English does not inflect this one, so _one and _other
  // carry identical copy (the PT catalog inflects them). The zero case gets
  // its own key because "0 of 8 granted" reads like a broken counter.
  "staffRoles.grantsSummary_one": "{count} of {total} granted",
  "staffRoles.grantsSummary_other": "{count} of {total} granted",
  "staffRoles.grantsSummaryNone": "None granted",
  "staffRoles.magazineEditor.label": "Magazine Editor",
  "staffRoles.magazineEditor.desc":
    "Runs the editorial desk: publish pieces, manage decks, review pitches.",
  "staffRoles.magazineWriter.label": "Magazine Writer",
  "staffRoles.magazineWriter.desc":
    "Drafts and submits pieces for editorial review.",
  "staffRoles.housingModerator.label": "Housing Moderator",
  "staffRoles.housingModerator.desc":
    "Can moderate Housing listings and groups.",
  "staffRoles.directoryModerator.label": "Directory Moderator",
  "staffRoles.directoryModerator.desc":
    "Reviews the local directory queue and safe-space nominations, and manages safe-space badges. Flag reports stay with moderators.",
  "staffRoles.resourceCurator.label": "Resource Curator",
  "staffRoles.resourceCurator.desc":
    "Writes and reviews the resource guides, service listings, suggestions and glossary. Publishing a guide stays with admins.",
  "staffRoles.editorial.label": "Editorial",
  "staffRoles.editorial.desc":
    "Triages story submissions and writer applications, and keeps the film club, press kit and landing page current.",
  "staffRoles.communities.label": "Communities",
  "staffRoles.communities.desc":
    "Works the community tag requests, topics and reading-group proposals, and sets community safety options. Freezing or reassigning a community stays with admins.",
  "staffRoles.partnerships.label": "Partnerships",
  "staffRoles.partnerships.desc":
    "Reviews partner applications and keeps the partner directory, organisation tiers and changemakers current.",
  "staffRoles.productManager.label": "Product Manager",
  "staffRoles.productManager.desc":
    "Runs the roadmap board, including member-submitted ideas, and reads feature usage. Platform reports and moderation stay with admins and moderators.",
  "staffRoles.culturalProducer.label": "Cultural Producer",
  "staffRoles.culturalProducer.desc":
    "Keeps the landing page, press kit and marketing videos current. Story submissions and writer applications stay with Editorial.",
  "staffRoles.musicManagerProducer.label": "Music manager & producer",
  "staffRoles.musicManagerProducer.desc":
    "Creates and runs the music events QueerPulse hosts, from the lineup to the door, and curates Studio home: the featured release, shelves, scenes, Artist of the month and New stars.",
  "staffRoles.adminSuperset": "Admins already have every staff capability.",
  "staffRoles.systemLocked": "System accounts can't hold staff roles.",

  // PRD-288: a staff-role toggle files nothing on its own. It opens a confirm
  // dialog that names what the grant opens or closes and takes a reason other
  // admins will read in the audit feed.
  "staffRoles.confirm.grantTitle": "Grant {role}?",
  "staffRoles.confirm.revokeTitle": "Remove {role}?",
  "staffRoles.confirm.grantBody":
    "The queues this role opens are theirs from the moment you confirm. Your name and your reason go into the audit log.",
  "staffRoles.confirm.revokeBody":
    "They lose those queues from the moment you confirm. Everything they already decided stays on the record. Your name and your reason go into the audit log.",
  "staffRoles.confirm.grantCta": "Grant role",
  "staffRoles.confirm.revokeCta": "Remove role",
  "staffRoles.confirm.reasonLabel": "Why (other admins read this)",
  "staffRoles.confirm.reasonPlaceholder":
    "At least {min} characters. Say what changed.",
  "staffRoles.confirm.grantedToast": "{role} granted.",
  "staffRoles.confirm.revokedToast": "{role} removed.",

  // ── Music events: the QueerPulse-hosted music events a music manager and
  // producer creates and runs (`features/admin/musicEvents`) ─────────────────
  "musicEvents.eyebrow": "Programming",
  "musicEvents.title": "Music events",
  "musicEvents.sub":
    "The music events QueerPulse hosts. Create one, book its lineup and run the door.",
  "musicEvents.createCta": "Create music event",
  "musicEvents.tabs.upcoming": "Upcoming",
  "musicEvents.tabs.past": "Past",
  "musicEvents.tabs.cancelled": "Cancelled",
  "musicEvents.attention.requests_one": "{count} invite request to review",
  "musicEvents.attention.requests_other": "{count} invite requests to review",
  "musicEvents.attention.lineup_one":
    "{count} lineup invite waiting for a reply",
  "musicEvents.attention.lineup_other":
    "{count} lineup invites waiting for a reply",
  "musicEvents.row.manageCta": "Manage event",
  "musicEvents.row.manageAria": "Manage {title}",
  "musicEvents.row.lineupLabel": "Lineup",
  "musicEvents.row.lineupConfirmed_one": "{count} confirmed",
  "musicEvents.row.lineupConfirmed_other": "{count} confirmed",
  "musicEvents.row.lineupInvited_one": "{count} invited",
  "musicEvents.row.lineupInvited_other": "{count} invited",
  "musicEvents.row.lineupDeclined_one": "{count} declined",
  "musicEvents.row.lineupDeclined_other": "{count} declined",
  "musicEvents.row.requests_one": "{count} request",
  "musicEvents.row.requests_other": "{count} requests",
  "musicEvents.row.cancelled": "Cancelled",
  "musicEvents.empty.upcoming.title": "No upcoming music events",
  "musicEvents.empty.upcoming.body": "Create one and it shows here.",
  "musicEvents.empty.past.title": "No past music events",
  "musicEvents.empty.past.body": "Events move here once they end.",
  "musicEvents.empty.cancelled.title": "No cancelled music events",
  "musicEvents.empty.cancelled.body":
    "A cancelled event moves here and keeps its guest list.",
  "musicEvents.loadError": "Couldn't load the music events",
  "musicEvents.loadMore": "Show more events",
  "musicEvents.new.title": "Create a music event",
  "musicEvents.new.lead":
    "QueerPulse hosts it and you run it: lineup, guests and the door.",
  "musicEvents.backCta": "Back to music events",
  "musicEvents.notFound.title": "This event isn't hosted by QueerPulse",
  "musicEvents.notFound.body":
    "Only music events QueerPulse hosts open here. Check the link or pick one from the list.",
  "musicEvents.manageLoadError": "Couldn't load this music event",
  "musicEvents.lineupPicker.title": "Book a Studio artist",
  "musicEvents.lineupPicker.sub":
    "Only Studio artists can be booked. Search by name or artist handle.",
  "musicEvents.lineupPicker.searchPlaceholder": "Search Studio artists",
  "musicEvents.lineupPicker.empty": "No Studio artist matches {query}",
  "musicEvents.lineupPicker.emptyAll":
    "There are no Studio artists to book yet",
  "musicEvents.lineupPicker.allListed": "Every match is already on the lineup",
  "musicEvents.lineupPicker.loadError": "Couldn't load Studio artists",
  "musicEvents.lineupPicker.personas": "As {names}",
  "musicEvents.cohostAdd.confirmTitle": "Add {name} as a cohost?",
  "musicEvents.cohostAdd.confirmBody":
    "They can edit this event and manage its guests straight away. No invite is sent.",
  "musicEvents.cohostAdd.confirmCta": "Add cohost",
  "musicEvents.cohostAdd.pickOther": "Pick someone else",
  "musicEvents.cohostAdd.addedToast": "{name} is now a cohost",
  "musicEvents.cohostAdd.errorFrame": "Couldn't add {name} as a cohost",
  "musicEvents.cohostAdd.pickTitle": "Choose a member",
  "musicEvents.cohostAdd.pickSub":
    "Pick a member to run this event with QueerPulse. They join the cohost list straight away.",
  "musicEvents.house.successLead":
    "The music event is live. Run the lineup, the guest list and the door from its page.",
  "musicEvents.house.cohostsNote":
    "QueerPulse is the lead host. Cohosts help run the event, and cancelling stays with the music team.",
  "musicEvents.house.formatSearchPlaceholder":
    "Club night, karaoke, jam session",
  "musicEvents.house.capacityHint": "How many guests can come",
  "musicEvents.house.titleExample": "Friday club night in Marvila",

  "members.timeline.title": "Moderation history: for & against",
  "members.timeline.auditLinkCta": "Every entry in the audit log",

  // ── Ban-evasion check on one member (admin member drawer) — PRD-27 ────────
  // The per-member twin of the invite queue's `invites.banEvasion.*` panel,
  // for the case where somebody already got in. Run only when a staff member
  // asks for it. A failed check says so plainly: it must never read as clean.
  "members.banEvasion.title": "Returning account check",
  "members.banEvasion.hint":
    "Asks whether this account correlates with an account that was removed. It runs only when you ask for it, and it changes nothing on its own.",
  "members.banEvasion.checkCta": "Check for ban-evasion signals",
  "members.banEvasion.recheckCta": "Check again",
  "members.banEvasion.retryCta": "Try the check again",
  "members.banEvasion.checking": "Checking…",
  "members.banEvasion.clear":
    "Checked. Nothing about this account matches an account that was removed.",
  "members.banEvasion.errorBody":
    "The check didn't run, so nothing was checked. This is not a clear result. Try again before you draw any conclusion from it.",
  "members.banEvasion.note":
    "This is a signal to check. Read the removed account first, then judge this member on what they have actually done here.",

  // ── Sign-in address on one member (admin member drawer) ──────────────────
  // The masked form rides along on the member detail, because the common
  // question is recognition. The whole address is revealed only when asked
  // for, and the backend records who asked. A failed reveal must never read as
  // "no address on file".
  "members.signInEmail.title": "Sign-in address",
  "members.signInEmail.hint":
    "The address this member signs in with, shown part-hidden. Revealing it in full is recorded in the audit log under your name.",
  "members.signInEmail.noneHeld":
    "QueerPulse holds no sign-in address for this member.",
  "members.signInEmail.revealCta": "Reveal",
  "members.signInEmail.revealing": "Revealing…",
  "members.signInEmail.retryCta": "Try again",
  "members.signInEmail.recordedNote":
    "Recorded in the audit log under your name.",
  "members.signInEmail.copyCta": "Copy",
  "members.signInEmail.copied": "Address copied.",
  "members.signInEmail.copyFailed": "Couldn't copy the address.",
  "members.signInEmail.errorBody":
    "The address didn't load, so nothing was revealed. This does not mean there is no address on file. Try again.",

  "members.sealed.sectionTitle": "Identity & privacy",
  "members.sealed.title": "No prior name is stored",
  "members.sealed.body":
    "QueerPulse keeps no record of anyone's earlier name. That's why nothing shows here. It never appears in a report, in this view, or to any admin. The member alone decides how they're known.",

  "members.message.eyebrow": "Reaching out",
  "members.message.title": "Message <em>{name}</em>",
  "members.message.sendAsLabel": "Send as",
  "members.message.sendAsSelf": "{name} (you)",
  "members.message.sendAsSelfNameless": "You",
  "members.message.sendAsTeam": "Trust & Safety team",
  "members.message.bodyLabel": "Message",
  "members.message.placeholder":
    "Write to {name}… a check-in, a heads-up, an offer of support.",
  "members.message.transparency":
    "Admin messages are clearly labelled as official and never disguised as a peer. {name} can always reply.",
  "members.message.sendCta": "Send message",

  "members.restrict.eyebrow": "Limiting access, carefully",
  "members.restrict.title": "Restrict <em>{name}</em>",
  "members.restrict.durationLabel": "Duration",
  "members.restrict.scopeLabel": "Scope",
  "members.restrict.reasonLabel": "Reason",
  "members.restrict.applyCta": "Apply restriction",
  "members.restrict.notePlaceholder": "A note for {name} (they will see it)…",
  "members.restrict.transparency":
    "{name} keeps full access to support and appeals. A restriction limits posting. It never cuts someone off from help.",
  "members.restrict.duration.24h": "24h",
  "members.restrict.duration.7d": "7 days",
  "members.restrict.duration.30d": "30 days",
  "members.restrict.duration.permanent": "Permanent",
  "members.restrict.permanentNote":
    "Permanent means a ban with no end date: {name} loses access to their account until an admin lifts it. They are told why and can appeal.",
  "members.restrict.scope.community": "This community",
  "members.restrict.scope.platform": "Platform-wide",
  "members.restrict.reason.harassment": "Repeated harassment after a warning",
  "members.restrict.reason.misgendering": "Misgendering / deadnaming",
  "members.restrict.reason.hostile": "Hostile or abusive conduct",
  "members.restrict.reason.other": "Other: explain below",

  "members.status.verified": "Verified",
  "members.status.openReports_one": "{count} open report",
  "members.status.openReports_other": "{count} open reports",
  "members.flagged.status.underReview": "Under review",
  "members.flagged.status.frozen": "Frozen",
  "members.flagged.status.limited": "Limited",
  "members.flagged.reportsCount_one": "{count} report",
  "members.flagged.reportsCount_other": "{count} reports",
  "members.flagged.category.doxxing": "Doxxing report",
  "members.flagged.category.spam": "Spam",
  "members.glance.vouches": "Vouches",
  "members.glance.memberFor": "Member for",
  "members.glance.reportsAgainst": "Reports against",

  // ── Members: DTO → view-model adapter composed strings (D2) ───────────────
  // `adminMembers.adapters.ts` composes these at adapt time (locale-sensitive
  // dates via `Formatters`, plurals via `{count}`) rather than baking English
  // into the view model, mirroring `adminCommunities.adapters.ts`.
  "members.meta.joined": "Joined {date}",
  "members.glance.memberFor.new": "New",
  "members.glance.memberFor.years_one": "{count}yr",
  "members.glance.memberFor.years_other": "{count}yr",
  "members.glance.memberFor.months_one": "{count}mo",
  "members.glance.memberFor.months_other": "{count}mo",
  "members.detail.graphNote_one":
    "{count} member vouches for {name}. A mutual graph is a sign of trust. Honour it, and let the numbers be.",
  "members.detail.graphNote_other":
    "{count} members vouch for {name}. A mutual graph is a sign of trust. Honour it, and let the numbers be.",
  "members.detail.graphNoteMutual_one":
    "{count} member vouches for {name}, who vouches for {given} in return. A mutual graph is a sign of trust. Honour it, and let the numbers be.",
  "members.detail.graphNoteMutual_other":
    "{count} members vouch for {name}, who vouches for {given} in return. A mutual graph is a sign of trust. Honour it, and let the numbers be.",
  "members.detail.removeBody":
    "This ends {name}'s membership, hides their content, and notifies them with your reason and the right to appeal. Their vouches for others stay valid. This is logged in the audit trail under your name.",
  "members.communities.role.owner": "owner",
  "members.communities.role.mod": "moderator",
  "members.contributions.kind.vouch": "Vouched for a member",
  "members.contributions.kind.other": "Contributed to the community",
  "members.timeline.action.dismiss": "Report dismissed",
  "members.timeline.action.warn": "Member warned",
  "members.timeline.action.hideContent": "Content hidden",
  "members.timeline.action.removeContent": "Content removed",
  "members.timeline.action.restrict": "Access restricted",
  "members.timeline.action.suspend": "Account suspended",
  "members.timeline.action.ban": "Account banned",
  "members.timeline.action.shield": "Shielded from contact",
  "members.timeline.action.escalate": "Escalated to the safety team",
  "members.timeline.action.appealUpheld": "Appeal upheld",
  "members.timeline.action.suspensionLifted": "Suspension lifted",
  "members.timeline.action.verified": "Verified identity",
  "members.timeline.action.noReports": "No reports against this member",
  "members.timeline.action.evidenceCited": "Evidence cited",
  "members.timeline.action.roleChanged": "Role changed",
  "members.timeline.action.staffRoleGranted": "Staff role granted",
  "members.timeline.action.staffRoleRevoked": "Staff role revoked",
  "members.timeline.action.inviteAccessChanged": "Invite access changed",
  "members.timeline.note.invitesPaused": "Invites paused",
  "members.timeline.note.invitesResumed": "Invites turned back on",
  "members.timeline.action.other": "Moderation action taken",
  "members.timeline.noReportsMeta": "A clean record so far",
  "members.timeline.verifiedMeta": "{date} · vouches confirmed",
  "members.timeline.actedByMeta": "{date} · acted on by {name}",
  "members.timeline.viewCta": "view",

  // ── Safe spaces (/admin/safe-spaces) ───────────────────────────────────────
  "adminSafeSpaces.title": "Safe spaces · <em>the verified list</em>",
  "adminSafeSpaces.header.eyebrow": "Trust & safety",
  "adminSafeSpaces.header.title": "Verify <em>safe spaces</em>",
  "adminSafeSpaces.header.sub":
    "Mark a listing as a verified safe space, edit its public profile, or remove one that's no longer earning that trust.",
  "adminSafeSpaces.empty": "No listings to review yet.",
  "adminSafeSpaces.loadError.title": "The listings didn't load",
  "adminSafeSpaces.loadError.body":
    "This is an outage on our side, so nothing is listed because nothing arrived. Try again.",
  "adminSafeSpaces.status.none": "Not reviewed",
  "adminSafeSpaces.status.verified": "Verified",
  "adminSafeSpaces.status.removed": "Removed",
  "adminSafeSpaces.markCta": "Mark as safe space",
  "adminSafeSpaces.unmarkCta": "Unmark",
  "adminSafeSpaces.viewCta": "View page",
  "adminSafeSpaces.editCta": "Edit safe space",
  "adminSafeSpaces.toast.marked": "{name} was marked as a safe space",
  "adminSafeSpaces.toast.unmarked": "{name} was unmarked as a safe space",

  "adminSafeSpaces.modal.loadingProfile":
    "Loading this listing's current safe-space profile…",
  "adminSafeSpaces.modal.loadFailed":
    "Couldn't load this listing's current safe-space profile. Close and reopen to try again.",
  "adminSafeSpaces.modal.eyebrow": "Safe space profile",
  "adminSafeSpaces.modal.title": "Edit {name}",
  "adminSafeSpaces.modal.statusLabel": "Status",
  "adminSafeSpaces.modal.tierLabel": "Tier",
  "adminSafeSpaces.modal.verifierLabel": "Verified by",
  "adminSafeSpaces.modal.reVerifiedAtLabel": "Re-verified on",
  "adminSafeSpaces.modal.subLabel": "Subheading",
  "adminSafeSpaces.modal.promisesLabel": "Promises",
  "adminSafeSpaces.modal.promiseTitlePlaceholder": "Promise title",
  "adminSafeSpaces.modal.promiseDescPlaceholder": "Promise description",
  "adminSafeSpaces.modal.addPromiseCta": "Add promise",
  "adminSafeSpaces.modal.vouchesLabel": "Vouches",
  "adminSafeSpaces.modal.vouchNamePlaceholder": "Name",
  "adminSafeSpaces.modal.vouchBylinePlaceholder": "Byline",
  "adminSafeSpaces.modal.vouchTextPlaceholder": "Vouch text",
  "adminSafeSpaces.modal.vouchWhenPlaceholder": "When (e.g. 2 weeks ago)",
  "adminSafeSpaces.modal.addVouchCta": "Add vouch",
  "adminSafeSpaces.modal.removeRowAriaLabel": "Remove",
  "adminSafeSpaces.modal.reasonLabel": "Reason for removal",
  "adminSafeSpaces.modal.reasonHint":
    "Shown to members visiting the removed listing's page.",
  "adminSafeSpaces.modal.cancelCta": "Cancel",
  "adminSafeSpaces.modal.saveCta": "Save",
  "adminSafeSpaces.modal.savingCta": "Saving…",
  "adminSafeSpaces.modal.savedToast": "{name}'s safe space profile was saved",

  // PRD-247 follow-up. The independent-visit bar on the DIRECT badge path
  // (`PATCH /admin/listings/:ref/safe-space`). The reviewed nomination queue
  // states the same rule in the `safety:governance.action.belowBar*` strings,
  // and the direct editor renders those rather than a second wording, so one
  // rule reads the same whichever door the moderator came through.
  //
  // `underBar.summaryNote` must keep both halves. A badge under the bar predates
  // enforcement AND a low count can mean the visits were never written up, so
  // the panel must never read as an accusation about the venue.
  "adminSafeSpaces.underBar.title": "Below the visit bar",
  "adminSafeSpaces.underBar.verifierIgnored":
    "The “Verified by” line above is ignored while the count is short. The badge will state the real visit count in public.",
  "adminSafeSpaces.underBar.queueHint":
    "This place has a nomination open in the review queue. Deciding it there tells the person who nominated it.",
  "adminSafeSpaces.underBar.reasonCount": "{count} of {min} characters",
  "adminSafeSpaces.underBar.reasonShort":
    "Write at least {min} characters to grant the badge below the bar.",
  "adminSafeSpaces.underBar.refusedTitle": "The badge was refused",
  "adminSafeSpaces.underBar.refusedBody":
    "{count} of {required} independent visits are on file. Write the reason above and save again.",
  "adminSafeSpaces.underBar.chip": "{count}/{required} visits",
  "adminSafeSpaces.underBar.chipTitle":
    "Independent member visits on file, against a bar of {required}.",
  "adminSafeSpaces.underBar.summary_one":
    "1 verified listing is under the visit bar.",
  "adminSafeSpaces.underBar.summary_other":
    "{count} verified listings are under the visit bar.",
  "adminSafeSpaces.underBar.summaryNote":
    "These badges were granted before the bar was enforced, and a low count can also mean the visits were never written up. Read it as paperwork to check.",
  "adminSafeSpaces.underBar.forbiddenTitle": "This one is not yours to waive",
  "adminSafeSpaces.underBar.forbiddenBody":
    "Granting a badge below the visit bar is limited to platform moderators and admins. You can still grant it once {required} independent visits are on file, or ask a platform moderator to take this one.",
  "adminSafeSpaces.markWithReasonCta": "Mark with a reason",
  "adminSafeSpaces.toast.visitBarRefused":
    "{name} is under the visit bar. Write the reason in the editor.",
  "adminSafeSpaces.modal.saveFailed":
    "That didn't save. Check your connection and try again.",

  // ── Directory listings queue ──────────────────────────────────────────────
  // ── Admin invite oversight (/admin/invites) ──────────────────────────
  "adminInvites.title": "Invite <em>oversight</em>",
  "adminInvites.header.eyebrow": "Trust & safety",
  "adminInvites.header.title": "Every <em>invite</em>",
  "adminInvites.header.sub":
    "The whole vouched-invite graph: who sent what, who accepted, and what's still open. Filter by status to audit the network's edges.",
  "adminInvites.empty": "No invites match this filter yet.",
  "adminInvites.loadError.title": "The invites didn't load",
  "adminInvites.loadError.body":
    "This is an outage on our side, so the list is blank because nothing arrived. Try again.",
  "adminInvites.emptyForInviter": "No invites from this member yet.",
  "adminInvites.filterByInviter": "Sent by",
  "adminInvites.allInviters": "Anyone",
  "adminInvites.filter.all": "All",
  "adminInvites.filter.valid": "Pending",
  "adminInvites.filter.used": "Accepted",
  "adminInvites.filter.expired": "Expired",
  "adminInvites.filter.revoked": "Revoked",
  "adminInvites.status.valid": "Pending",
  "adminInvites.status.used": "Accepted",
  "adminInvites.status.expired": "Expired",
  "adminInvites.status.revoked": "Revoked",
  "adminInvites.row.from": "From {name}",
  "adminInvites.row.toMember": "accepted by {name}",
  "adminInvites.row.toEmail": "sent to {email}",
  "adminInvites.row.toAnyone": "open link, no recipient yet",
  "adminInvites.row.sent": "Sent {date}",
  "adminInvites.row.expires": "expires {date}",
  "adminInvites.row.open": "View invite {code}",
  "adminInvites.loadMore": "Load more",
  "adminInvites.loadingMore": "Loading…",
  "adminInvites.drawer.label": "Invite {code}",
  "adminInvites.drawer.copyCode": "Copy code",
  "adminInvites.drawer.copied": "Invite code copied",
  "adminInvites.drawer.copyFailed": "Couldn't copy the code",
  "adminInvites.drawer.fromLabel": "Invited by",
  "adminInvites.drawer.recipientLabel": "Recipient",
  "adminInvites.drawer.acceptedByLabel": "Accepted by",
  "adminInvites.drawer.recipientAnyone": "Open link, anyone can accept",
  "adminInvites.drawer.createdLabel": "Created",
  "adminInvites.drawer.expiresLabel": "Expires",
  "adminInvites.drawer.dateTime": "{date} at {time}",
  "adminInvites.drawer.inviteMessageLabel": "Invite message",
  "adminInvites.drawer.vouchMessageLabel": "Vouch message",
  "adminInvites.drawer.privateNoteLabel": "Inviter's private note",
  "adminInvites.drawer.privateNoteCaption":
    "Only the inviter and admins see this.",
  "adminInvites.quota.manageCta": "Manage invite quotas",
  "adminInvites.quota.modalEyebrow": "Resource limits",
  "adminInvites.quota.modalTitle": "Invite quotas",
  "adminInvites.quota.searchPlaceholder": "Search by name or @handle",
  "adminInvites.quota.searchAria": "Search members by name or @handle",
  "adminInvites.quota.summary_one":
    "Everyone gets {count} invite a month, plus any perk or ambassador bonus. A custom limit replaces all of that.",
  "adminInvites.quota.summary_other":
    "Everyone gets {count} invites a month, plus any perk or ambassador bonus. A custom limit replaces all of that.",
  "adminInvites.quota.resultsStatus_one": "{count} member found",
  "adminInvites.quota.resultsStatus_other": "{count} members found",
  "adminInvites.quota.listLabel": "Members and their invite limits",
  "adminInvites.quota.column.member": "Member",
  "adminInvites.quota.column.thisMonth": "This month",
  "adminInvites.quota.column.monthlyLimit": "Monthly limit",
  "adminInvites.quota.sentTotal_one": "{count} sent in total",
  "adminInvites.quota.sentTotal_other": "{count} sent in total",
  "adminInvites.quota.usage": "{sent} of {limit}",
  "adminInvites.quota.limitReached": "Limit reached",
  "adminInvites.quota.invitesPaused": "Invites paused",
  "adminInvites.quota.limitDefault": "Default · {limit}",
  "adminInvites.quota.customChip": "Custom",
  "adminInvites.quota.setLimitCta": "Set limit",
  "adminInvites.quota.setLimitAria": "Set limit for {name}",
  "adminInvites.quota.editLimitCta": "Edit limit",
  "adminInvites.quota.editLimitAria": "Edit limit for {name}",
  "adminInvites.quota.editor.label": "Monthly invite limit for {name}",
  "adminInvites.quota.editor.unit": "invites a month",
  "adminInvites.quota.editor.saveCta": "Save limit",
  "adminInvites.quota.editor.saving": "Saving…",
  "adminInvites.quota.editor.cancelCta": "Cancel",
  "adminInvites.quota.editor.useDefaultCta": "Use default",
  "adminInvites.quota.editor.useDefaultAria": "Use default limit for {name}",
  "adminInvites.quota.editor.problem.empty":
    "Enter how many invites {name} can send a month.",
  "adminInvites.quota.editor.problem.notWhole": "Use a whole number, like 5.",
  "adminInvites.quota.editor.problem.negative":
    "The limit can't go below 0. Use 0 to stop {name} sending invites.",
  "adminInvites.quota.toast.saved_one":
    "{name} can now send {count} invite a month.",
  "adminInvites.quota.toast.saved_other":
    "{name} can now send {count} invites a month.",
  "adminInvites.quota.toast.savedZero": "{name} can't send invites now.",
  "adminInvites.quota.toast.usingDefault":
    "{name} is back on the default limit.",
  "adminInvites.quota.countAll_one": "{count} member",
  "adminInvites.quota.countAll_other": "{count} members",
  "adminInvites.quota.countPartial_one": "Showing {shown} of {count} member",
  "adminInvites.quota.countPartial_other": "Showing {shown} of {count} members",
  "adminInvites.quota.loadMoreCta": "Load more members",
  "adminInvites.quota.loadingMore": "Loading more members…",
  "adminInvites.quota.empty.searchTitle": "No members match “{query}”",
  "adminInvites.quota.empty.searchBody":
    "Check the spelling, or try their @handle.",
  "adminInvites.quota.empty.idleTitle": "No invites sent yet",
  "adminInvites.quota.empty.idleBody":
    "Members show up here once they send an invite or get a custom limit. Search by name to set a limit for anyone.",
  "adminInvites.quota.error.loadTitle": "Couldn't load invite limits",
  "adminInvites.quota.error.loadConnection":
    "The request didn't reach the server. Check your connection and try again.",
  "adminInvites.quota.error.loadServer":
    "The server hit an error while loading this list. Try again in a moment.",
  "adminInvites.quota.error.loadMissing":
    "This server doesn't have the invite limits list yet. It needs a backend update.",
  "adminInvites.quota.error.loadMore": "Couldn't load more members. {reason}",
  "adminInvites.quota.error.adminOnly":
    "Only admins can manage invite limits. Your account doesn't have admin access.",
  "adminInvites.quota.error.memberGone":
    "{name}'s account no longer exists, so there's no limit to change.",
  "adminInvites.quota.error.saveConnection":
    "{name}'s limit wasn't saved: the request didn't reach the server. Check your connection and try again.",
  "adminInvites.quota.error.saveServer":
    "{name}'s limit wasn't saved: the server hit an error. Try again in a moment.",
  "adminInvites.quota.error.saveWithReason":
    "{name}'s limit wasn't saved: {reason}.",
  "adminInvites.revoke.cta": "Revoke this invite",
  "adminInvites.revoke.confirmTitle": "Revoke invite {code}?",
  "adminInvites.revoke.confirmBody":
    "The link stops working straight away, and {name} keeps the slot it used from this month's allowance. Whoever holds the link will see it as revoked. This can't be undone, though {name} can send a fresh invite.",
  "adminInvites.revoke.confirmCta": "Revoke invite",
  "adminInvites.revoke.doneToast": "Invite {code} is revoked.",
  "adminInvites.revoke.movedOnToast":
    "That invite has already been accepted, revoked or expired. Reopen the list for its current state.",
  "adminInvites.revoke.failedToast": "Couldn't revoke that invite. Try again.",
  "adminInvites.refresh.cta": "Refresh invite",
  "adminInvites.refresh.confirmTitle": "Refresh {code}?",
  "adminInvites.refresh.confirmBody":
    "The same link from {name} works again for 7 days. Anyone who already has it can use it to join.",
  "adminInvites.refresh.confirmCta": "Refresh invite",
  "adminInvites.refresh.doneToast": "{code} works again for 7 days",
  "adminInvites.refresh.movedOnToast":
    "This invite changed while you had it open. Reload to see where it stands.",
  "adminInvites.refresh.failedToast":
    "Couldn't refresh this invite. Try again.",
  "adminInvites.select.startCta": "Select",
  "adminInvites.select.doneCta": "Done",
  "adminInvites.select.rowAriaLabel": "Select invite {code}",
  "adminInvites.select.selectAllCta": "Select all",
  "adminInvites.select.clearCta": "Clear",
  "adminInvites.select.capToast":
    "Selected the first {cap} invites. One action takes up to {cap} at a time.",
  "adminInvites.bulk.ariaLabel": "Actions for the selected invites",
  "adminInvites.bulk.selectedCount_one": "{count} selected",
  "adminInvites.bulk.selectedCount_other": "{count} selected",
  "adminInvites.bulk.capNote": "Up to {cap} invites at a time",
  "adminInvites.bulk.refreshCta_one": "Refresh {count} expired",
  "adminInvites.bulk.refreshCta_other": "Refresh {count} expired",
  "adminInvites.bulk.revokeCta_one": "Revoke {count} pending",
  "adminInvites.bulk.revokeCta_other": "Revoke {count} pending",
  "adminInvites.bulk.refreshCtaNone": "Refresh expired",
  "adminInvites.bulk.revokeCtaNone": "Revoke pending",
  "adminInvites.bulk.refreshConfirmTitle_one":
    "Refresh {count} expired invite?",
  "adminInvites.bulk.refreshConfirmTitle_other":
    "Refresh {count} expired invites?",
  "adminInvites.bulk.refreshConfirmBody_one":
    "Its link works again for 7 days with the same code. Anyone who already has it can use it to join.",
  "adminInvites.bulk.refreshConfirmBody_other":
    "Each link works again for 7 days with its same code. Anyone who already has one can use it to join.",
  "adminInvites.bulk.refreshConfirmCta_one": "Refresh invite",
  "adminInvites.bulk.refreshConfirmCta_other": "Refresh {count} invites",
  "adminInvites.bulk.refreshLeftAsTheyAre_one":
    "{count} selected invite hasn't expired, so it stays as it is.",
  "adminInvites.bulk.refreshLeftAsTheyAre_other":
    "{count} selected invites haven't expired, so they stay as they are.",
  "adminInvites.bulk.revokeConfirmTitle_one": "Revoke {count} pending invite?",
  "adminInvites.bulk.revokeConfirmTitle_other":
    "Revoke {count} pending invites?",
  "adminInvites.bulk.revokeConfirmBody_one":
    "The link stops working straight away. This can't be undone, though the sender can send a fresh invite.",
  "adminInvites.bulk.revokeConfirmBody_other":
    "Each link stops working straight away. This can't be undone, though each sender can send a fresh invite.",
  "adminInvites.bulk.revokeConfirmCta_one": "Revoke invite",
  "adminInvites.bulk.revokeConfirmCta_other": "Revoke {count} invites",
  "adminInvites.bulk.revokeLeftAsTheyAre_one":
    "{count} selected invite isn't pending, so it stays as it is.",
  "adminInvites.bulk.revokeLeftAsTheyAre_other":
    "{count} selected invites aren't pending, so they stay as they are.",
  "adminInvites.bulk.refreshDoneToast_one": "Refreshed {count} invite",
  "adminInvites.bulk.refreshDoneToast_other": "Refreshed {count} invites",
  "adminInvites.bulk.revokeDoneToast_one": "Revoked {count} invite",
  "adminInvites.bulk.revokeDoneToast_other": "Revoked {count} invites",
  "adminInvites.bulk.refreshFailedAction":
    "Couldn't refresh the selected invites",
  "adminInvites.bulk.revokeFailedAction":
    "Couldn't revoke the selected invites",
  "adminInvites.bulk.skippedToast": "Left as they were: {reasons}.",
  "adminInvites.bulk.skipReason.not_found_one": "{count} no longer exists",
  "adminInvites.bulk.skipReason.not_found_other": "{count} no longer exist",
  "adminInvites.bulk.skipReason.accepted_one": "{count} was already accepted",
  "adminInvites.bulk.skipReason.accepted_other":
    "{count} were already accepted",
  "adminInvites.bulk.skipReason.revoked_one": "{count} was already revoked",
  "adminInvites.bulk.skipReason.revoked_other": "{count} were already revoked",
  "adminInvites.bulk.skipReason.expired_one": "{count} had already expired",
  "adminInvites.bulk.skipReason.expired_other": "{count} had already expired",
  "adminInvites.bulk.skipReason.still_valid_one": "{count} was still active",
  "adminInvites.bulk.skipReason.still_valid_other": "{count} were still active",
  "adminInvites.refreshAll.cta_one": "Refresh {count} expired",
  "adminInvites.refreshAll.cta_other": "Refresh all {count} expired",
  "adminInvites.refreshAll.confirmTitle_one": "Refresh {count} expired invite?",
  "adminInvites.refreshAll.confirmTitle_other":
    "Refresh {count} expired invites?",
  "adminInvites.refreshAll.confirmBody_one":
    "Its link works again for 7 days with the same code. Anyone who already has it can use it to join.",
  "adminInvites.refreshAll.confirmBody_other":
    "Each link works again for 7 days with its same code. Anyone who already has one can use it to join.",
  "adminInvites.refreshAll.confirmBodyForInviter_one":
    "The expired invite from {name} works again for 7 days with the same code. Anyone who already has the link can use it to join.",
  "adminInvites.refreshAll.confirmBodyForInviter_other":
    "Every expired invite from {name} works again for 7 days, each with its same code. Anyone who already has one of the links can use it to join.",
  "adminInvites.refreshAll.confirmCta_one": "Refresh invite",
  "adminInvites.refreshAll.confirmCta_other": "Refresh {count} invites",
  "adminInvites.refreshAll.doneToast_one": "Refreshed {count} invite",
  "adminInvites.refreshAll.doneToast_other": "Refreshed {count} invites",
  "adminInvites.refreshAll.noneLeftToast":
    "No expired invites were left to refresh.",
  "adminInvites.refreshAll.failedAction":
    "Couldn't refresh the expired invites",

  "adminCommissionInterests.title": "Commission <em>interest</em>",
  "adminCommissionInterests.header.eyebrow": "Culture",
  "adminCommissionInterests.header.title": "Commission board <em>interest</em>",
  "adminCommissionInterests.header.sub":
    "Every member who reached out about a Commission Board project: which brief, who they want to work with, and their note. Filter by category.",
  "adminCommissionInterests.empty":
    "No commission interest matches this filter yet.",
  "adminCommissionInterests.error":
    "We couldn't load commission interest. Please try again.",
  "adminCommissionInterests.unknownMember": "A former member",
  "adminCommissionInterests.filter.all": "All",
  "adminCommissionInterests.row.from": "From {name}",
  "adminCommissionInterests.row.to": "reaching out to {name}",
  "adminCommissionInterests.row.sent": "Sent {date}",
  "adminCommissionInterests.loadMore": "Load more",
  "adminCommissionInterests.loadingMore": "Loading…",

  "adminChangemakerNominations.title": "Changemaker <em>nominations</em>",
  "adminChangemakerNominations.header.eyebrow": "Community",
  "adminChangemakerNominations.header.title":
    "Who members <em>put forward</em>",
  "adminChangemakerNominations.header.sub":
    "Every name members have nominated for the Change Makers directory, newest first. A shortlist to review.",
  "adminChangemakerNominations.empty": "No nominations yet.",
  "adminChangemakerNominations.error":
    "We couldn't load nominations. Please try again.",
  "adminChangemakerNominations.unknownMember": "A former member",
  "adminChangemakerNominations.withheldMember": "Not shown here",
  "adminChangemakerNominations.row.by": "Nominated by {name}",
  "adminChangemakerNominations.row.memberLabel": "Their profile",
  "adminChangemakerNominations.row.contactLabel": "Find them at",
  "adminChangemakerNominations.row.sent": "Sent {date}",
  "adminChangemakerNominations.row.reviewedBy": "Reviewed by {name}",
  "adminChangemakerNominations.status.pending": "Pending",
  "adminChangemakerNominations.status.approved": "Approved",
  "adminChangemakerNominations.status.dismissed": "Dismissed",
  "adminChangemakerNominations.row.approveCta": "Approve",
  "adminChangemakerNominations.row.dismissCta": "Dismiss",
  "adminChangemakerNominations.row.reviewNotePlaceholder":
    "Optional note to the nominator",
  "adminChangemakerNominations.loadMore": "Load more",
  "adminChangemakerNominations.loadingMore": "Loading…",

  "adminReadingGroupProposals.title": "Reading group <em>proposals</em>",
  "adminReadingGroupProposals.header.eyebrow": "Community",
  "adminReadingGroupProposals.header.title":
    "Groups members <em>want to start</em>",
  "adminReadingGroupProposals.header.sub":
    "Every “Start your own group” a member has submitted: the book, why, format, and size. Filter by format.",
  "adminReadingGroupProposals.empty":
    "No reading group proposals match this filter yet.",
  "adminReadingGroupProposals.error":
    "We couldn't load reading group proposals. Please try again.",
  "adminReadingGroupProposals.unknownMember": "A former member",
  "adminReadingGroupProposals.filter.all": "All",
  "adminReadingGroupProposals.format.In-person": "In person",
  "adminReadingGroupProposals.format.Online": "Online",
  "adminReadingGroupProposals.format.Either": "Either",
  "adminReadingGroupProposals.row.by": "Proposed by {name}",
  "adminReadingGroupProposals.row.firstBook": "First book: {book}",
  "adminReadingGroupProposals.row.maxPeople": "up to {count} people",
  "adminReadingGroupProposals.row.sent": "Sent {date}",
  "adminReadingGroupProposals.status.pending": "Pending",
  "adminReadingGroupProposals.status.approved": "Approved",
  "adminReadingGroupProposals.status.declined": "Declined",
  "adminReadingGroupProposals.status.archived": "Archived",
  "adminReadingGroupProposals.action.approve": "Approve",
  "adminReadingGroupProposals.action.decline": "Decline",
  "adminReadingGroupProposals.action.archive": "Archive",
  "adminReadingGroupProposals.toast.approved": "Proposal approved.",
  "adminReadingGroupProposals.toast.declined": "Proposal declined.",
  "adminReadingGroupProposals.toast.archived": "Proposal archived.",
  "adminReadingGroupProposals.toast.error":
    "That didn't go through. Please try again.",
  "adminReadingGroupProposals.loadMore": "Load more",
  "adminReadingGroupProposals.loadingMore": "Loading…",

  "adminGuideFeedback.title": "Guide <em>feedback</em>",
  "adminGuideFeedback.header.eyebrow": "Resources",
  "adminGuideFeedback.header.title": "What's actually <em>helping</em>",
  "adminGuideFeedback.header.sub":
    "Every resource guide members have rated helpful or not, worst first.",
  "adminGuideFeedback.empty": "No guide ratings yet.",
  "adminGuideFeedback.error": "Couldn't load guide feedback. Please try again.",
  "adminGuideFeedback.loadError.title": "Guide feedback didn't load",
  "adminGuideFeedback.loadError.body":
    "This is an outage on our side. Ratings may exist that this page could not read. Try again.",
  "adminGuideFeedback.row.counts":
    "{helpful} helpful · {notHelpful} not helpful",

  "adminConcerns.title": "Concerns <em>raised</em>",
  "adminConcerns.header.eyebrow": "Trust & safety",
  "adminConcerns.header.title": "What members <em>are flagging</em>",
  "adminConcerns.header.sub":
    "Every concern submitted through the governance form: reports, appeals, and issues. Filter by triage status, then mark each one reviewing, resolved, or dismissed.",
  "adminConcerns.empty": "No concerns match this filter yet.",
  "adminConcerns.error": "We couldn't load concerns. Please try again.",
  "adminConcerns.filter.all": "All",
  "adminConcerns.category.member": "Member or behaviour",
  "adminConcerns.category.gathering": "Event",
  "adminConcerns.category.content": "Content or platform",
  "adminConcerns.category.appeal": "Moderation appeal",
  "adminConcerns.category.other": "Something else",
  "adminConcerns.status.new": "New",
  "adminConcerns.status.reviewing": "Reviewing",
  "adminConcerns.status.resolved": "Resolved",
  "adminConcerns.status.dismissed": "Dismissed",
  "adminConcerns.row.contact": "Contact: {contact}",
  "adminConcerns.row.sent": "Sent {date}",
  "adminConcerns.contact.anon": "No contact left",
  "adminConcerns.action.reviewing": "Mark reviewing",
  "adminConcerns.action.resolved": "Resolve",
  "adminConcerns.action.dismissed": "Dismiss",
  "adminConcerns.toast.reviewing": "Marked as reviewing.",
  "adminConcerns.toast.resolved": "Concern resolved.",
  "adminConcerns.toast.dismissed": "Concern dismissed.",
  "adminConcerns.toast.error": "That didn't go through. Please try again.",
  "adminConcerns.loadMore": "Load more",
  "adminConcerns.loadingMore": "Loading…",

  // ── ACQ-03: the intake console at /admin/intakes ────────────────────
  // One reader for the two inboxes that had none: the eleven generic intake
  // kinds (the twelfth, governance concerns, keeps its own page above) and the
  // public contact/partnership messages. Nothing here sends anything: this
  // platform emails nothing about intakes (its only email is a sign-in code a
  // person asks for on screen), so "handled" only ever means a person read it.
  "adminIntakes.title": "Everything <em>people sent</em>",
  "adminIntakes.header.eyebrow": "Front desk",
  "adminIntakes.header.title": "What people <em>sent us</em>",
  "adminIntakes.header.sub":
    "Every form on the platform files into one of two inboxes: the intake forms (grants, edit suggestions, sober hosting, panel signups, incubator and culture submissions) and the messages sent through the contact page. This is where a person reads them.",
  "adminIntakes.header.noEmailNote":
    "QueerPulse sends no email from here. Marking something handled records that a person on our team read it. Any answer goes out from your own inbox, to the address on the message.",

  "adminIntakes.tab.waiting": "Waiting",
  "adminIntakes.tab.intakes": "Intake forms",
  "adminIntakes.tab.inquiries": "Inquiries",

  "adminIntakes.waiting.allClear":
    "Nothing is waiting. Every message and every submission has been picked up.",
  "adminIntakes.waiting.inquiriesHeading_one": "{count} message waiting",
  "adminIntakes.waiting.inquiriesHeading_other": "{count} messages waiting",
  "adminIntakes.waiting.inquiriesNote":
    "Sent through the contact page. Some are from people who could not sign in or could not get an invite, so they had nowhere else to go.",
  "adminIntakes.waiting.inquiriesEmpty": "No messages are waiting.",
  "adminIntakes.waiting.intakesHeading_one": "{count} submission waiting",
  "adminIntakes.waiting.intakesHeading_other": "{count} submissions waiting",
  "adminIntakes.waiting.intakesNote":
    "Grant applications, edit suggestions, signups, and everything the incubator and culture forms collect.",
  "adminIntakes.waiting.intakesEmpty": "No submissions are waiting.",
  "adminIntakes.waiting.today": "Arrived today",
  "adminIntakes.waiting.days_one": "Waiting {count} day",
  "adminIntakes.waiting.days_other": "Waiting {count} days",

  "adminIntakes.filter.allKinds": "All kinds",
  "adminIntakes.filter.allStatuses": "All statuses",
  "adminIntakes.filter.kindLabel": "Filter by kind",
  "adminIntakes.filter.statusLabel": "Filter by status",
  "adminIntakes.inquiryWaitingNote_one": "{count} message still waiting.",
  "adminIntakes.inquiryWaitingNote_other": "{count} messages still waiting.",

  "adminIntakes.empty": "No submissions match these filters.",
  "adminIntakes.error": "We couldn't load submissions. Please try again.",
  "adminIntakes.inquiryEmpty": "No messages match these filters.",
  "adminIntakes.inquiryError": "We couldn't load messages. Please try again.",
  "adminIntakes.loadMore": "Load more",
  "adminIntakes.loadingMore": "Loading…",

  "adminIntakes.kind.grant": "Micro-grant application",
  "adminIntakes.kind.suggest_edit": "Edit suggestion",
  "adminIntakes.kind.sober_host": "Sober event offer",
  "adminIntakes.kind.panel_signup": "Grant panel signup",
  "adminIntakes.kind.incubator_cohort": "Incubator application",
  "adminIntakes.kind.incubator_mentor": "Mentor offer",
  // PRD-249. A named landlord asking to answer a recommendation written about
  // them. The submitter has no account and never will, so this queue is the only
  // place their words can be established as theirs before anything is published.
  "adminIntakes.kind.landlord_reply_request": "Landlord right of reply",
  "adminIntakes.kind.incubator_session": "Mentoring session request",
  "adminIntakes.kind.culture_suggest_pick": "Book club suggestion",
  "adminIntakes.kind.culture_post_project": "Commission board project",
  "adminIntakes.kind.culture_submit_work": "Showcase submission",
  "adminIntakes.kind.culture_submit_playlist": "Playlist submission",
  "adminIntakes.kind.governance_concern": "Governance concern",

  "adminIntakes.status.new": "Waiting",
  "adminIntakes.status.reviewed": "Read",
  "adminIntakes.status.reviewing": "Being looked at",
  "adminIntakes.status.resolved": "Resolved",
  "adminIntakes.status.dismissed": "Dismissed",

  "adminIntakes.inquiryKind.contact": "Contact",
  "adminIntakes.inquiryKind.partner": "Partnership",
  "adminIntakes.inquiryKind.listing_correction": "Listing correction",
  "adminIntakes.inquiryStatus.new": "Waiting",
  "adminIntakes.inquiryStatus.handled": "Handled",

  "adminIntakes.row.fromMember": "From",
  "adminIntakes.row.contactEmail": "Reach them at {email}",
  "adminIntakes.row.contactName": "Left their name: {name}",
  "adminIntakes.row.noContact": "No way to reach them was left.",
  "adminIntakes.row.org": "Organisation: {org}",
  "adminIntakes.row.arrived": "Arrived {date}",
  "adminIntakes.row.reviewedBy": "Read {date} by {name}",
  "adminIntakes.row.reviewedNoOne": "Read {date}. No reviewer was recorded.",
  "adminIntakes.row.handledBy": "Handled {date} by {name}",
  "adminIntakes.row.handledNoOne": "Handled {date}. No handler was recorded.",
  "adminIntakes.row.priority": "Safety: read first",
  "adminIntakes.row.listingLabel": "Listing:",
  "adminIntakes.row.listingLink": "{name} ({ref})",
  "adminIntakes.row.listingGone":
    "Listing {ref}, which is no longer in the directory",

  "adminIntakes.confidential.body":
    "A governance concern arrived. What it says stays on the concerns page, where it can be triaged in full.",
  "adminIntakes.confidential.openCta": "Open in Concerns",

  "adminIntakes.action.reviewed": "Mark read",
  "adminIntakes.action.markHandled": "Mark handled",
  "adminIntakes.action.reopen": "Reopen",

  "adminIntakes.toast.reviewed": "Marked as read.",
  "adminIntakes.toast.handled": "Marked as handled.",
  "adminIntakes.toast.reopened": "Moved back to waiting.",
  "adminIntakes.toast.error": "That didn't go through. Please try again.",

  "adminIntakes.payload.empty":
    "This submission arrived with no fields filled in.",
  "adminIntakes.field.about": "About the work",
  // PRD-249, the landlord right-of-reply payload.
  "adminIntakes.field.contact": "How to reach them",
  "adminIntakes.field.landlordSlug": "Landlord entry",
  "adminIntakes.field.recommendationId": "Recommendation",
  "adminIntakes.field.reply": "What they want published",
  "adminIntakes.field.applicantName": "Applicant",
  "adminIntakes.field.author": "Author",
  "adminIntakes.field.budgetItems": "Budget lines",
  "adminIntakes.field.budgetTotal": "Budget total",
  "adminIntakes.field.change": "Suggested change",
  "adminIntakes.field.context": "Page",
  "adminIntakes.field.description": "Description",
  "adminIntakes.field.detail": "Details",
  "adminIntakes.field.email": "Email",
  "adminIntakes.field.expertise": "Expertise",
  "adminIntakes.field.format": "Format",
  "adminIntakes.field.link": "Link",
  "adminIntakes.field.lookingFor": "Looking for",
  "adminIntakes.field.medium": "Medium",
  "adminIntakes.field.mentorName": "Mentor",
  "adminIntakes.field.mentorRole": "Mentor's field",
  "adminIntakes.field.message": "Message",
  "adminIntakes.field.mode": "Offering",
  "adminIntakes.field.name": "Name",
  "adminIntakes.field.note": "Note",
  "adminIntakes.field.pitch": "Pitch",
  "adminIntakes.field.projectName": "Project",
  "adminIntakes.field.projectSummary": "What it is",
  "adminIntakes.field.term": "Entry",
  "adminIntakes.field.title": "Title",
  "adminIntakes.field.vibes": "Vibes",
  "adminIntakes.field.when": "Availability",
  "adminIntakes.field.why": "Why",

  "adminMagazineSubmissions.title": "Story <em>submissions</em>",
  "adminMagazineSubmissions.header.eyebrow": "Magazine",
  "adminMagazineSubmissions.header.title": "Reader <em>pitches</em>",
  "adminMagazineSubmissions.header.sub":
    "Every story pitch readers have sent the magazine: the working title, format, pitch, and where it sits. Filter by status.",
  "adminMagazineSubmissions.empty": "No submissions match this filter yet.",
  "adminMagazineSubmissions.error":
    "We couldn't load submissions. Please try again.",
  "adminMagazineSubmissions.unknownMember": "A former member",
  "adminMagazineSubmissions.filter.all": "All",
  "adminMagazineSubmissions.filter.submitted": "Submitted",
  "adminMagazineSubmissions.filter.in_review": "In review",
  "adminMagazineSubmissions.filter.accepted": "Accepted",
  "adminMagazineSubmissions.filter.rejected": "Declined",
  "adminMagazineSubmissions.filter.published": "Published",
  "adminMagazineSubmissions.filter.draft": "Draft",
  "adminMagazineSubmissions.status.submitted": "Submitted",
  "adminMagazineSubmissions.status.in_review": "In review",
  "adminMagazineSubmissions.status.accepted": "Accepted",
  "adminMagazineSubmissions.status.rejected": "Declined",
  "adminMagazineSubmissions.status.published": "Published",
  "adminMagazineSubmissions.status.draft": "Draft",
  // A commission is a yes that ALSO put the piece in the desk's pitch inbox,
  // so it shows as a second chip next to the "Accepted" status.
  "adminMagazineSubmissions.status.commissioned": "Commissioned",
  "adminMagazineSubmissions.row.by": "From {name}",
  "adminMagazineSubmissions.row.sent": "Sent {date}",
  "adminMagazineSubmissions.row.decided": "Decided {date}",
  "adminMagazineSubmissions.row.readPiece": "Read the full piece",
  "adminMagazineSubmissions.row.coverAlt": "Cover submitted with {title}",
  // The note is the decider's own words (content); only the label around it
  // is translated.
  "adminMagazineSubmissions.row.reply": "Reply sent: {note}",
  "adminMagazineSubmissions.row.replyLabel": "Reply to the writer",
  "adminMagazineSubmissions.row.replyPlaceholder":
    "Optional reply to the writer",
  // PRD-124: accepting a reader story now creates the desk piece and files the
  // member's text as its article draft, so an accepted row links straight to
  // the record an editor works in. The pair below shows only on a row decided
  // `accepted` whose `acceptedPieceId` is still null (decided before this
  // build): re-sending the same decision finishes the job without touching the
  // reply note, the decider, the decision date, or ringing the member again.
  "adminMagazineSubmissions.row.openDeskPiece": "Open the desk piece",
  "adminMagazineSubmissions.row.acceptNotOnDesk":
    "This story was accepted before an acceptance created a desk piece, so there is nothing for an editor to open yet.",
  "adminMagazineSubmissions.row.createDeskPieceCta": "Create the desk piece",
  "adminMagazineSubmissions.row.declineCta": "Decline",
  "adminMagazineSubmissions.row.acceptCta": "Accept",
  "adminMagazineSubmissions.row.commissionCta": "Commission",
  // The one route back from a decline. Offered only on a declined row, last
  // and quietly, because it is a correction rather than part of the daily
  // pass over the queue.
  "adminMagazineSubmissions.reopen.cta": "Reopen",
  "adminMagazineSubmissions.reopen.confirmTitle": "Reopen “{title}”?",
  "adminMagazineSubmissions.reopen.confirmBody":
    "The decline and the reply {name} received are erased, and the story goes back into the queue. {name} is told it was reopened.",
  "adminMagazineSubmissions.reopen.confirmCta": "Reopen submission",
  "adminMagazineSubmissions.reopen.doneToast":
    "“{title}” is back in the queue.",
  "adminMagazineSubmissions.reopen.failedToast":
    "That submission could not be reopened. Reload the queue and try again.",
  // Kept on the row afterwards: a reopen clears the decision it undoes, so
  // without this line the story would sit in the queue looking as if nobody
  // had ever decided it.
  "adminMagazineSubmissions.row.reopened": "Reopened {date}",
  "adminMagazineSubmissions.row.reopenedBy": "Reopened {date} by {name}",
  "adminMagazineSubmissions.row.reopenedTimes_one": "(1 time in total)",
  "adminMagazineSubmissions.row.reopenedTimes_other":
    "({count} times in total)",
  "adminMagazineSubmissions.loadMore": "Load more",
  "adminMagazineSubmissions.loadingMore": "Loading…",

  "adminWriterApplications.title": "Writer <em>applications</em>",
  "adminWriterApplications.header.eyebrow": "Magazine",
  "adminWriterApplications.header.title": "Writer <em>applications</em>",
  "adminWriterApplications.header.sub":
    "Members applying to write for the magazine, with their pitch and writing sample.",
  "adminWriterApplications.filter.all": "All",
  "adminWriterApplications.filter.pending": "Pending",
  "adminWriterApplications.filter.approved": "Approved",
  "adminWriterApplications.filter.declined": "Declined",
  "adminWriterApplications.status.pending": "Pending",
  "adminWriterApplications.status.approved": "Approved",
  "adminWriterApplications.status.declined": "Declined",
  "adminWriterApplications.row.sampleLink": "Linked sample",
  "adminWriterApplications.row.approveCta": "Approve",
  "adminWriterApplications.row.declineCta": "Decline",
  // Gives the review-note input a real accessible name, mirroring how
  // `adminMagazineSubmissions.row.replyLabel` sits beside its placeholder.
  "adminWriterApplications.row.reviewNoteLabel": "Note to the applicant",
  "adminWriterApplications.row.reviewNotePlaceholder":
    "Optional note to the applicant",
  "adminWriterApplications.unknownMember": "A member",
  "adminWriterApplications.error": "Couldn't load applications.",
  "adminWriterApplications.empty": "No applications yet.",
  "adminWriterApplications.loadMore": "Load more",
  "adminWriterApplications.loadingMore": "Loading…",

  "adminListings.title": "Directory <em>listings</em>",
  "adminListings.header.eyebrow": "Moderation",
  "adminListings.header.title": "Review <em>submissions</em>",
  "adminListings.header.sub":
    "Every place a member has added to the directory. Move a listing forward when it's ready, or send it back with a quick question.",
  "adminListings.emptyQueue.title": "You're all <em>caught up</em>",
  "adminListings.emptyQueue.body":
    "Every submission has found its place. Nothing's waiting on you right now. New listings will land here the moment someone adds one.",
  "adminListings.unknownSubmitter": "Unknown member",
  // Secondary, subtle meta-line text — a moderator triaging the queue can
  // see how long a listing has been waiting without opening it.
  "adminListings.row.submittedAgo": "Submitted {time}",
  "adminListings.row.addedAgo": "Added {time}",
  "adminListings.suggestedBy": "Suggested by {name}",
  // Who holds a queue row: its owner, or a line saying nobody owns it yet
  // beside whoever suggested or added it (see `listingProvenance.ts`).
  "adminListings.provenance.ownedBy": "Owned by {name}",
  "adminListings.provenance.addedByStaff": "Added by {name} (staff)",
  "adminListings.provenance.noOwnerYet": "No owner yet",
  "adminListings.filter.all": "All",
  "adminListings.filter.review": "In review",
  "adminListings.filter.question": "Quick question",
  "adminListings.filter.live": "Live",
  "adminListings.filter.ariaLabel": "Filter by status",
  "adminListings.search.placeholder": "Search by name, submitter, or ref…",
  "adminListings.search.ariaLabel": "Search listings",
  "adminListings.sort.label": "Sort",
  "adminListings.sort.newest": "Newest",
  "adminListings.sort.oldest": "Oldest",
  "adminListings.sort.name": "Name",
  "adminListings.view.ariaLabel": "Switch view",
  "adminListings.status.review": "In review",
  "adminListings.status.question": "Quick question",
  "adminListings.status.live": "Live",
  "adminListings.advance.question": "Ask a question",
  "adminListings.advance.live": "Publish live",
  "adminListings.sendBackCta": "Back to review",
  "adminListings.toast.moved": "{name} moved to {status}.",
  "adminListings.viewCta": "View & preview",
  "adminListings.viewLiveCta": "View live",
  "adminListings.preview.sub":
    "Exactly how this listing will look once it's live in the directory.",
  "adminListings.preview.editCta": "Edit listing",
  "adminListings.ask.eyebrow": "Ask a question",
  "adminListings.ask.title": "Ask about {name}",
  "adminListings.ask.sub": "We'll send this to {name} as a message.",
  "adminListings.ask.label": "Your question",
  "adminListings.ask.helper":
    "Keep it warm and specific. They'll get it as a direct message and can reply right there.",
  "adminListings.ask.subSuggestion":
    "We'll send this to {name} as a notification.",
  "adminListings.ask.helperSuggestion":
    "Keep it warm and specific. They'll get it as a notification and can answer through the contact form.",
  "adminListings.ask.placeholder":
    "Hi! Before we publish this, could you confirm…",
  "adminListings.ask.send": "Send question",
  "adminListings.ask.cancel": "Cancel",
  "adminListings.ask.sent": "Your question is on its way to {name}.",
  "adminListings.ask.action": "send your question",
  "adminListings.ask.noSubmitter":
    "This listing has no member to contact. There's no one to send a question to.",
  "adminListings.view.queue": "Submissions",
  "adminListings.view.editSuggestions": "Edit suggestions",
  "adminListings.view.claims": "Ownership claims",
  "adminListings.view.drafts": "Unfinished drafts",
  "adminListings.remove.cta": "Delete",
  "adminListings.actions.moreAriaLabel": "More actions for {name}",
  "adminListings.remove.toast.removed": "{name} was deleted.",
  "adminListings.loadMoreCta": "Load more",
  "adminListings.selectAll.ariaLabel": "Select all visible listings",
  "adminListings.selectAll.label": "Select all visible",
  "adminListings.columns.listing": "Listing",
  "adminListings.columns.submitter": "Submitted by",
  "adminListings.columns.status": "Status",
  "adminListings.columns.actions": "Actions",
  "adminListings.row.openAriaLabel": "Open {name}",
  "adminListings.row.editCta": "Edit",
  "adminListings.row.editAriaLabel": "Edit {name}",
  "adminListings.noMatch.title": "No listings match “{query}”",
  "adminListings.noMatch.body":
    "Try a place name, a submitter, or a reference like QPL-2026-0008.",
  "adminListings.emptyTab.title": "Nothing in “{status}” right now",
  "adminListings.emptyTab.body":
    "Listings land here as you move them through review.",
  "adminListings.selectRow.ariaLabel": "Select {name}",
  "adminListings.bulk.ariaLabel": "Bulk actions",
  "adminListings.bulk.selectedCount_one": "{count} selected",
  "adminListings.bulk.selectedCount_other": "{count} selected",
  "adminListings.bulk.publishCta": "Publish live",
  "adminListings.bulk.sendBackCta": "Back to review",
  "adminListings.bulk.removeCta": "Delete",
  "adminListings.bulk.clearCta": "Clear",
  "adminListings.bulk.capNote": "Selection capped at {cap} listings",
  "adminListings.bulk.toast.success_one": "{count} listing updated.",
  "adminListings.bulk.toast.success_other": "{count} listings updated.",
  "adminListings.bulk.toast.partial": "{updated} updated, {failed} skipped.",
  "adminListings.bulk.action.publish": "Couldn't publish the selected listings",
  "adminListings.bulk.action.sendBack":
    "Couldn't send the selected listings back to review",
  "adminListings.bulk.action.remove": "Couldn't remove the selected listings",
  "adminListings.bulk.confirmRemove.title_one": "Remove {count} listing?",
  "adminListings.bulk.confirmRemove.title_other": "Remove {count} listings?",
  "adminListings.bulk.confirmRemove.body_one":
    "This permanently deletes the selected listing and can't be undone. Submitters won't be notified.",
  "adminListings.bulk.confirmRemove.body_other":
    "This permanently deletes all {count} selected listings and can't be undone. Submitters won't be notified.",
  "adminListings.bulk.confirmRemove.reasonLabel": "Reason (optional)",
  "adminListings.bulk.confirmRemove.reasonPlaceholder":
    "Add a note for the record…",
  "adminListings.bulk.confirmRemove.confirmCta": "Remove listings",
  "adminListings.bulk.confirmPublish.title_one":
    "Publish {count} listing live?",
  "adminListings.bulk.confirmPublish.title_other":
    "Publish {count} listings live?",
  "adminListings.bulk.confirmPublish.body_one":
    "The selected listing appears in the directory straight away, where members can find it. You can send it back to review later.",
  "adminListings.bulk.confirmPublish.body_other":
    "All {count} selected listings appear in the directory straight away, where members can find them. You can send them back to review later.",
  "adminListings.bulk.confirmPublish.confirmCta": "Publish live",
  "adminListings.sendBack.confirm.title": "Send {name} back to review?",
  "adminListings.sendBack.confirm.body":
    "{name} moves back into the review queue. Add a quick note if it helps the next pass.",
  "adminListings.sendBack.confirm.reasonLabel": "Reason (optional)",
  "adminListings.sendBack.confirm.reasonPlaceholder":
    "What needs another look…",
  "adminListings.sendBack.confirm.confirmCta": "Send back to review",
  "adminListings.publish.confirm.title": "Publish {name} live?",
  "adminListings.publish.confirm.body":
    "{name} appears in the directory straight away, where members can find it. You can send it back to review later from its menu.",
  "adminListings.publish.confirm.confirmCta": "Publish live",
  // ── Drawer history + Q&A thread ───────────────────────────────────────────
  "adminListings.history.eventsHeading": "Moderation history",
  "adminListings.history.questionsHeading": "Questions",
  "adminListings.history.error": "Couldn't load this listing's history.",
  "adminListings.history.emptyEvents": "No moderator actions yet.",
  "adminListings.history.emptyQuestions": "No questions asked yet.",
  "adminListings.history.unknownActor": "A moderator",
  "adminListings.history.event.statusChanged":
    "{actor} moved this from {from} to {to}.",
  "adminListings.history.event.bulkStatus":
    "{actor} moved this from {from} to {to} (bulk action).",
  "adminListings.history.event.removed": "{actor} removed this listing.",
  "adminListings.history.event.questionAsked": "{actor} asked a question.",
  "adminListings.history.event.answered": "{actor} replied to a question.",
  "adminListings.history.event.ownershipTransferred":
    "{actor} approved an ownership transfer.",
  "adminListings.history.event.ownerEdited": "{actor} edited the live listing.",
  "adminListings.history.event.staffEdited":
    "{actor} edited the listing for QueerPulse.",
  "adminListings.history.event.coManagerAdded":
    "{actor} joined as a co-manager.",
  "adminListings.history.event.coManagerRemoved":
    "{actor} ended a co-manager seat.",
  "adminListings.history.event.staffCreated":
    "{actor} created this listing for the business.",
  "adminListings.history.event.suggestionApplied":
    "{actor} applied a suggested correction.",
  "adminListings.history.event.directoryPaused":
    "{actor} paused the listing in the directory.",
  "adminListings.history.event.directoryResumed":
    "{actor} showed the listing in the directory again.",
  "adminListings.history.askedBy": "Asked by {actor}",
  "adminListings.history.awaitingReply": "Awaiting reply",

  // ── Uploaded files (admin media console) ─────────────────────────────────
  "media.title": "Uploaded <em>files</em>",
  "media.header.eyebrow": "Security tooling",
  "media.header.title": "Uploaded <em>files</em>",
  "media.header.sub":
    "Every object stored in the platform's upload bucket, with per-file owner and storage details for security review.",
  "media.kindFilterLabel": "Upload kind",
  "media.kinds.all": "All",
  "media.kinds.avatars": "Avatars",
  "media.kinds.work": "Work images",
  "media.kinds.story-covers": "Story covers",
  "media.kinds.persona-covers": "Persona banners",
  "media.kinds.gathering-photos": "Event photos",
  "media.kinds.group-avatars": "Group avatars",
  "media.kinds.listing-photos": "Listing photos",
  "media.kinds.listing-covers": "Listing covers",
  "media.kinds.listing-menus": "Listing menus",
  "media.kinds.community-covers": "Community banners",
  "media.kinds.community-avatars": "Community logos",
  "media.kinds.event-covers": "Event covers",
  "media.kinds.forum-photos": "Forum photos",
  "media.kinds.persona": "Persona images",
  "media.kinds.stickers": "Stickers",
  // Second filter over the same grid: "is anything still pointing at this?".
  // It narrows the pages already loaded (every object arrives with its
  // references resolved), which is why the copy says how much of the bucket
  // has actually been checked instead of implying a whole-bucket answer.
  "media.usage.filterAriaLabel": "Filter by whether the file is still used",
  "media.usage.all": "All",
  "media.usage.inUse": "In use",
  "media.usage.unused": "Not in use",
  "media.usage.scanning_one":
    "No match in the first file. Loading more of the bucket…",
  "media.usage.scanning_other":
    "No match in the first {count} files. Loading more of the bucket…",
  "media.usage.scannedNote_one":
    "Checked one file so far. Load more to keep looking.",
  "media.usage.scannedNote_other":
    "Checked {count} files so far. Load more to keep looking.",
  "media.usage.noMatchYet": "No match yet",
  "media.usage.empty.unused.title": "Nothing unused here",
  "media.usage.empty.unused.body":
    "Every file in this view is still referenced somewhere.",
  "media.usage.empty.in-use.title": "Nothing in use here",
  "media.usage.empty.in-use.body":
    "Nothing in this view is referenced anywhere.",
  "media.unowned": "Unowned",
  // The object key is the only thing that identifies one tile from another:
  // the thumbnail is decorative and the card carries no filename.
  "media.openAriaLabel": "Inspect {key}",
  // Leads with the visible name so speech input can still activate it by what
  // it reads, then says what pressing it does.
  "media.uploaderFilterAriaLabel": "{name}. Show only their uploads.",
  "media.unknown": "Unknown",
  "media.loadMore": "Load more",
  "media.openFile": "Open file URL",
  "media.copyPresigned": "Copy presigned URL",
  "media.copyKey": "Copy key",
  "media.copiedPresigned": "Presigned URL copied",
  "media.copiedKey": "Key copied",
  "media.inspectRealType": "Inspect real content type",
  "media.spoofWarning": "does not match extension",
  "media.deleteFile": "Delete file",
  "media.delete.eyebrow": "Delete file",
  "media.delete.confirmTitle": "Permanently delete this file?",
  "media.delete.confirmBody":
    "This removes the stored file from the bucket for good. If a profile, listing, or post still points at it, it will stop loading there. This can't be undone.",
  "media.delete.confirmBodyInUse_one":
    "This file is still referenced in {count} place, listed below. If you delete it now, it stops loading there. This can't be undone.",
  "media.delete.confirmBodyInUse_other":
    "This file is still referenced in {count} places, listed below. If you delete it now, it stops loading in every one of them. This can't be undone.",
  "media.delete.confirm": "Delete file",
  "media.delete.pending": "Deleting…",
  "media.delete.success": "File deleted",
  "media.field.key": "Storage key",
  "media.field.uploader": "Uploader",
  "media.field.declaredType": "Declared type (from extension)",
  "media.field.realType": "Real stored type",
  "media.drawer.ariaLabel": "Object details",
  "media.empty.title": "No objects",
  "media.empty.body": "Nothing is stored under this kind yet.",
  "media.demo.title": "Available in live mode only",
  "media.demo.body":
    "Uploaded files come from the live storage bucket, so there is nothing to show in demo mode.",
  "media.filterByUploader.searchPlaceholder": "Filter by who uploaded it…",
  "media.filterByUploader.searchAriaLabel": "Search members to filter uploads",
  "media.filterByUploader.noResults": "No members match “{search}”.",
  "media.filterByUploader.activePill": "Filtering by <strong>{name}</strong>",
  "media.filterByUploader.clearAria": "Clear uploader filter",
  "media.filterByUploader.showAll": "All from this member",
  "media.filterByUploader.emptyForUser":
    "{name} hasn't uploaded anything to the bucket.",
  "media.references.inUseBadge": "In use ({count})",
  "media.references.orphanBadge": "No references",
  "media.references.heading": "Referenced in",
  "media.references.empty": "No references found. Safe to delete.",
  "media.references.unverified":
    "Unverified. Some reference checks couldn’t run, so this may still be in use. Reload before deleting.",
  "media.references.degradedBanner":
    "Some reference checks couldn’t run, so an empty “No references” is unverified for this page. Reload before treating any file as an orphan.",

  // ── Edit suggestions ─────────────────────────────────────────────────────────
  "editSuggestions.empty": "No corrections in this filter right now.",
  "editSuggestions.pendingCount_one": "{count} suggestion waiting",
  "editSuggestions.pendingCount_other": "{count} suggestions waiting",
  "editSuggestions.pendingCountAtLeast": "At least {count} suggestions waiting",
  "editSuggestions.loadError.title": "The corrections didn't load",
  "editSuggestions.loadError.body":
    "This is an outage on our side, so nothing is listed because nothing arrived. Members may still be waiting on a correction. Try again.",
  "editSuggestions.field.hours": "Hours",
  "editSuggestions.field.address": "Address",
  "editSuggestions.field.phone": "Phone number",
  "editSuggestions.field.website": "Website",
  "editSuggestions.field.description": "Description",
  "editSuggestions.field.attributes": "Details and amenities",
  "editSuggestions.field.other": "Something else",
  "editSuggestions.filter.pending": "Pending",
  "editSuggestions.filter.accepted": "Accepted",
  "editSuggestions.filter.dismissed": "Dismissed",
  "editSuggestions.filter.all": "All",
  "editSuggestions.status.pending": "Pending",
  "editSuggestions.status.accepted": "Accepted",
  "editSuggestions.status.dismissed": "Dismissed",
  "editSuggestions.acceptCta": "Accept",
  "editSuggestions.dismissCta": "Dismiss",
  "editSuggestions.submittedBy": "Suggested by {name}",
  "editSuggestions.unknownSubmitter": "an unknown member",
  "editSuggestions.toast.accepted": "Accepted the correction for {name}.",
  "editSuggestions.toast.dismissed": "Dismissed the correction for {name}.",

  // ── Moderation ─────────────────────────────────────────────────────────────
  "moderation.title": "Moderation · <em>triage</em>",
  "moderation.header.eyebrow": "Moderation queue",
  // Headline is derived from the real open-queue count (`q.counts.open`),
  // mirroring the dashboard header's `_one`/`_other` pattern — never a baked number.
  "moderation.header.title_one": "One needs you <em>first</em>.",
  "moderation.header.title_other": "{count} need you <em>first</em>.",
  "moderation.header.titleClear": "Nobody's <em>waiting</em>.",
  "moderation.header.sub":
    "Reports are ordered by who's most at risk, so the greatest danger comes first regardless of when it arrived. Outing and doxxing always rise to the top, with a tighter 1-hour clock. Every action records a reason the member will read.",
  "moderation.tabs.open": "Open",
  "moderation.tabs.appeals": "Appeals",
  "moderation.tabs.resolved": "Resolved",
  "moderation.filters.all": "All severities",
  "moderation.filters.emergencies": "Emergencies",
  "moderation.filters.mine": "Assigned to me",
  "moderation.filterAriaLabel": "Filter reports",
  "moderation.subjectFilter.label": "Filtered to @{subjectId}",
  "moderation.subjectFilter.clearAriaLabel": "Clear filter",

  "moderation.selectReportAriaLabel": "Select report: {title}",
  "moderation.reportedByLabel": "Reported by",
  "moderation.aboutLabel": "About",
  "moderation.bulk.ariaLabel": "Bulk actions",
  "moderation.bulk.selectedCount_one": "{count} selected",
  "moderation.bulk.selectedCount_other": "{count} selected",
  "moderation.bulk.dismissCta": "Dismiss",
  "moderation.bulk.spamCta": "Remove as spam",
  "moderation.bulk.escalateCta": "Escalate",
  "moderation.bulk.warnCta": "Warn",
  "moderation.bulk.suspendCta": "Suspend…",
  "moderation.bulk.banCta": "Ban",
  "moderation.bulk.cancelCta": "Cancel",
  // Bulk confirm modal: a reason code and the member-facing note are required
  // for every sanctioning bulk action, exactly as in the single-report drawer.
  "moderation.bulk.confirm.title.removeContent_one":
    "Remove the content in {count} report",
  "moderation.bulk.confirm.title.removeContent_other":
    "Remove the content in {count} reports",
  "moderation.bulk.confirm.title.warn_one": "Warn {count} member",
  "moderation.bulk.confirm.title.warn_other": "Warn {count} members",
  "moderation.bulk.confirm.title.suspend_one": "Suspend {count} member",
  "moderation.bulk.confirm.title.suspend_other": "Suspend {count} members",
  "moderation.bulk.confirm.title.ban_one": "Ban {count} member",
  "moderation.bulk.confirm.title.ban_other": "Ban {count} members",
  "moderation.bulk.confirm.body_one":
    "This applies to the 1 report you selected. Give a reason and write the note the member will read.",
  "moderation.bulk.confirm.body_other":
    "This applies to all {count} reports you selected. Give a reason and write the note every one of those members will read.",
  "moderation.bulk.confirm.durationLabel": "How long",
  "moderation.bulk.confirm.notePlaceholder":
    "What happened, and what happens next. Everyone in this batch reads this.",
  "moderation.bulk.confirm.applyCta_one": "Apply to 1 report",
  "moderation.bulk.confirm.applyCta_other": "Apply to {count} reports",
  "moderation.bulk.confirm.transparency_one":
    "The member is notified with this reason and note, and can appeal.",
  "moderation.bulk.confirm.transparency_other":
    "All {count} members are notified with this reason and note, and can appeal.",
  // Why Apply is unavailable, beside the field it is asking for. A greyed
  // button that says nothing is how a moderator ends up believing the batch
  // is broken.
  "moderation.bulk.confirm.pickReasonNotice":
    "Pick a reason above before you can apply this.",
  "moderation.bulk.confirm.noteRequiredNotice":
    "Everyone in this batch reads the note, so it cannot be empty. {current}/{min} characters.",

  "moderation.emergency.ariaLabel": "Safety emergencies",
  "moderation.emergency.count_one": "{count} safety emergency",
  "moderation.emergency.count_other": "{count} safety emergencies",
  "moderation.emergency.sub":
    "· outing & doxxing are treated as urgent harm, on a 1-hour clock. Handle these before anything else.",

  "moderation.everythingElse": "Everything else",
  "moderation.filterEmpty":
    "No open reports match this filter. Try “All severities”.",
  "moderation.loadMore": "Show more reports",
  "moderation.loadingMore": "Loading more reports…",

  "moderation.caughtUp.titleLine1": "You're <em>caught up</em>.",
  "moderation.caughtUp.titleLine2": "Nothing needs you right now.",
  "moderation.caughtUp.sub":
    "Every open report has a human decision attached to it, and every affected member has been told what happened and why. Go rest. The network is safe in your hands.",
  "moderation.caughtUp.backCta": "Back to overview",
  "moderation.caughtUp.replayCta": "Replay the queue",
  "moderation.backToast": "Heading back to the overview.",

  "moderation.appealsIntro":
    "An appeal is a member asking you to look again. Read the original decision, hear them out, then <em>uphold or overturn</em>, with a reason of your own. Overturning a colleague's call is normal and healthy.",
  "moderation.appeal.by": "Appeal by",
  "moderation.appeal.decidedBy": "Decided by",
  "moderation.appeal.supportersFlag_one": "{count} backing them",
  "moderation.appeal.supportersFlag_other": "{count} backing them",
  "moderation.appeal.fallbackName": "member",
  "moderation.resolvedSection": "Recently resolved",
  "moderation.resolvedEmpty": "Nothing resolved yet. Closed reports land here.",

  "moderation.reportDrawer.label": "Report: {title}",
  "moderation.reportDrawer.title": "A private trans status was outed",
  "moderation.reportDrawer.cancelCta": "Cancel",
  "moderation.reportDrawer.escalateCta": "Escalate to safety team",
  "moderation.reportDrawer.confirmCta": "Confirm & notify member",
  "moderation.reportDrawer.contentTitle": "Reported content",
  "moderation.reportDrawer.threadTitle": "Surrounding thread",
  "moderation.reportDrawer.flaggedTag": "Flagged",
  "moderation.reportDrawer.peopleTitle": "People involved",
  "moderation.reportDrawer.disputeReasonTitle": "Dispute reason",
  "moderation.reportDrawer.listingEvidenceTitle": "Ownership evidence",
  "moderation.reportDrawer.contactEmailTitle": "Disputer contact",
  // Business mailboxes, design section 9 (I2): the identity a message was
  // sent as, beside the human sender. `kind` resolves through
  // `messages:mailbox.kind.*`; `name` falls back to `sentAsIdentity.deletedName`
  // when the identity row is gone.
  "moderation.reportDrawer.sentAsIdentity.labelWithKind":
    "Sent as {name} ({kind})",
  "moderation.reportDrawer.sentAsIdentity.label": "Sent as {name}",
  "moderation.reportDrawer.sentAsIdentity.deletedName": "Deleted identity",
  "moderation.reportDrawer.contextLoading": "Loading the report's context",
  "moderation.reportDrawer.limitedContext":
    "This report came in without the full thread attached. You can still act on the summary below.",
  "moderation.reportDrawer.reporterRole": "Reporter",
  "moderation.reportDrawer.reportedRole": "Reported",
  "moderation.reportDrawer.auditTitle": "Action history",
  "moderation.reportDrawer.auditEmpty":
    "No actions recorded yet. Every decision you make is logged here.",
  "moderation.reportDrawer.decisionTitle": "Take a decision: protective first",
  "moderation.reportDrawer.reasonTitle":
    "Reason: required, shown to the member",
  "moderation.reportDrawer.reasonAriaLabel": "Reason",
  "moderation.reportDrawer.notePlaceholder":
    "Add a human note. The member will read this. Write it the way you’d want to be spoken to.",
  "moderation.reportDrawer.noteAriaLabel": "Note to the member",
  "moderation.reportDrawer.transparency":
    "{name} will be told exactly what was actioned and why, with a link to appeal. Nothing happens silently.",
  // Read on a non-member report, directly under the action tiles, at the
  // moment a moderator is choosing one. Since TS-03 restrict and ban DO apply
  // here: the backend resolves the content to its author. What a moderator
  // needs to know is who the sanction lands on, and that it can refuse when
  // there is nobody behind the content.
  // Sits beside the author name in the drawer, on the one subject type whose
  // report can name two people. It fires BEFORE the moderator acts, so the
  // matching refusal (`moderation.refusal.ambiguousAuthors`) confirms what
  // they already read instead of contradicting it.
  "moderation.reportDrawer.ambiguousAuthorsNote":
    "This covers what was posted and the answer under it, and two different people can have written them. The report doesn't record which half somebody meant, so restrict and ban can be refused here.",
  "moderation.reportDrawer.accountActionsTarget":
    "Restrict and ban act on whoever posted this. Hide and remove act on the content itself. With no account behind it, an unclaimed listing or an erased one, restrict and ban will not go through.",
  "moderation.reportDrawer.accountActionsTargetNoContent":
    "There is no content of its own to hide or remove here. Restrict and ban act on whoever is behind it, and will not go through when no account is.",
  "moderation.reportDrawer.restrictDurationLabel": "Restriction length",
  "moderation.reportDrawer.restrictDuration.24h": "24 hours",
  "moderation.reportDrawer.restrictDuration.7d": "7 days",
  "moderation.reportDrawer.restrictDuration.30d": "30 days",
  "moderation.reportDrawer.unassigned": "Unassigned",
  "moderation.reportDrawer.assignedToYou": "Assigned to you",
  "moderation.reportDrawer.assignedTo": "Assigned to {name}",
  "moderation.reportDrawer.anotherModerator": "another moderator",
  "moderation.reportDrawer.assignToMeCta": "Assign to me",
  "moderation.reportDrawer.unassignCta": "Unassign",
  // Why Confirm is unavailable, read under the note field rather than only on
  // the disabled button, which is unreachable to a keyboard while disabled.
  "moderation.reportDrawer.pickActionNotice":
    "Pick an action above before you can confirm.",
  "moderation.reportDrawer.noteRequiredNotice":
    "The member reads this note, so it has to say something. At least {min} characters, {current} so far.",
  "moderation.reportDrawer.noteRequiredToast":
    "Write the member a note of at least {min} characters first.",
  "moderation.reportDrawer.pickActionToast":
    "Pick an action before confirming.",
  "moderation.reportDrawer.escalatedToast":
    "Escalated to the safety team. They will take it from here.",
  "moderation.reportDrawer.confirmedToast":
    "{name} {verb}. The member has been notified.",

  "moderation.appealDrawer.label": "Appeal: {name}",
  "moderation.appealDrawer.chooseToast": "Choose uphold or overturn",
  "moderation.appealDrawer.reasonRequiredToast":
    "A reason is required. The member will read it",
  "moderation.appealDrawer.cancelCta": "Cancel",
  "moderation.appealDrawer.recordCta": "Record decision",
  "moderation.appealDrawer.originalTitle": "The original decision",
  "moderation.appealDrawer.decidedByLine": "Decided by {name} · {when}",
  "moderation.appealDrawer.originalContentTitle":
    "What was originally reported",
  "moderation.appealDrawer.originalContentUnavailable":
    "The original report's content isn't available. It may have been erased, or this appeal has no linked report.",
  "moderation.appealDrawer.argumentTitle": "Their argument",
  "moderation.appealDrawer.supportersTitle": "Who's backing them",
  "moderation.appealDrawer.noSupport":
    "No other members have weighed in. That's neither for nor against. Many appeals stand alone.",
  "moderation.appealDrawer.decisionTitle": "Your decision",
  "moderation.appealDrawer.decisionAriaLabel": "Decision",
  "moderation.appealDrawer.uphold": "Uphold",
  "moderation.appealDrawer.upholdSub": "The original decision stands",
  "moderation.appealDrawer.overturn": "Overturn",
  "moderation.appealDrawer.overturnSub": "Lift it & restore the member",
  "moderation.appealDrawer.reasonAriaLabel": "Reason for your decision",
  "moderation.appealDrawer.reasonPlaceholder":
    "Explain your decision in your own words. The member will read this.",
  "moderation.appealDrawer.transparency":
    "Appeals are logged like any decision. If you overturn, {name} is told privately and kindly, and no one is blamed.",

  "moderation.severity.emergency": "Emergency",
  "moderation.severity.high": "High",
  "moderation.severity.medium": "Medium",
  "moderation.severity.low": "Low",

  "moderation.actions.dismiss.label": "Dismiss",
  "moderation.actions.dismiss.desc": "No action needed, close the report",
  "moderation.actions.dismiss.done": "dismissed",
  "moderation.actions.hide.label": "Hide content",
  "moderation.actions.hide.desc": "Remove from view, keep for records",
  "moderation.actions.hide.done": "hidden",
  "moderation.actions.warn.label": "Warn",
  "moderation.actions.warn.desc": "Send a formal warning",
  "moderation.actions.warn.done": "warned",
  "moderation.actions.restrict.label": "Restrict",
  "moderation.actions.restrict.desc": "Limit posting for a period",
  "moderation.actions.restrict.done": "restricted",
  "moderation.actions.remove.label": "Remove",
  "moderation.actions.remove.desc": "Delete the content permanently",
  "moderation.actions.remove.done": "removed",
  "moderation.actions.ban.label": "Ban",
  "moderation.actions.ban.desc": "Remove the member from the network",
  "moderation.actions.ban.done": "banned",
  "moderation.actions.actionedFallback": "actioned",

  "moderation.reasons.outing":
    "Outing / sharing private identity without consent",
  "moderation.reasons.doxxing": "Sharing personal or location data (doxxing)",
  "moderation.reasons.harassment": "Targeted harassment of a member",
  "moderation.reasons.other": "Other: explain below",

  "moderation.priorReports.count_one": "{count} prior report",
  "moderation.priorReports.count_other": "{count} prior reports",
  "moderation.priorReports.newAccount": "New account · {vouches} vouches",
  // Read on its own by a screen reader, out of the row it sits in, so it names
  // whose history opens. `{flag}` is the visible pill text and leads the label
  // so speech input can activate the control by what it says.
  "moderation.priorReports.viewAriaLabel":
    "{flag}, about {name}. View their earlier reports.",
  "moderation.reporterCredibility.new": "New reporter",
  "moderation.reporterCredibility.history":
    "{filed} filed · {dismissed} dismissed",
  "moderation.assignedToFlag": "Assigned to {name}",
  "moderation.slaOverdue": "Overdue",
  "moderation.risk.atRisk": "At risk",
  "moderation.risk.high": "High",
  "moderation.risk.medium": "Medium",
  "moderation.risk.low": "Low",
  "moderation.status.awaiting": "Awaiting",
  "moderation.status.logged": "Logged",

  "moderation.chip.outingDoxxing": "Outing / doxxing",
  "moderation.chip.harassment": "Harassment",
  "moderation.chip.vouchAbuse": "Vouch-abuse",
  "moderation.chip.spam": "Spam",
  "moderation.chip.offTopic": "Off-topic",
  "moderation.chip.listingDispute": "Listing dispute",
  "moderation.chip.appeal": "Appeal",
  "moderation.chip.identityShielded": "Identity shielded",
  "moderation.chip.appealRestriction": "Appeal · restriction",
  "moderation.chip.appealRemoval": "Appeal · removal",
  "moderation.chip.appealWarning": "Appeal · warning",
  "moderation.chip.resolved": "Resolved",

  "moderation.category.emergency": "Emergency",
  "moderation.category.harassment": "Harassment",
  "moderation.category.hateSpeech": "Hate speech",
  "moderation.category.impersonation": "Impersonation",
  "moderation.category.discrimination": "Discrimination",
  "moderation.category.spam": "Spam",
  "moderation.category.offTopic": "Off-topic",
  "moderation.category.venue": "Venue",
  "moderation.category.other": "Other",
  "moderation.category.report": "Report",

  "moderation.queue.actionToast": "{verb} · member notified",
  "moderation.queue.verb.resolved": "Resolved",
  "moderation.queue.verb.escalated": "Escalated",
  "moderation.queue.verb.actioned": "Actioned",
  "moderation.queue.restoredToast": "Restored the report.",
  "moderation.queue.serviceErrorToast":
    "Couldn't reach the safety service. Restored.",

  // The four deterministic enforcement refusals (see
  // `admin/api/enforcementTargetError.ts`). Each is read mid-decision by a
  // volunteer, moments after an optimistic toast said the action landed, so
  // each opens by correcting that, then says what to do instead. In every one
  // of them the platform is the thing that cannot answer: none of them imply
  // the moderator picked wrong, and all of them leave hide, remove, dismiss
  // and escalate available on the same report.
  "moderation.refusal.noAccount":
    "That didn't go through: there's no account behind what was reported, so there's nobody to restrict or ban. Take the content down, dismiss the report, or escalate it.",
  // Carries the reconciliation the drawer can't: the drawer names whoever
  // asked, because it has to name somebody and they opened the exchange, so a
  // refusal saying two people wrote it would otherwise contradict what the
  // moderator just read.
  "moderation.refusal.ambiguousAuthors":
    "That didn't go through: this report covers what was posted and the answer under it, and two different people wrote them. The drawer names whoever posted first, so open the page it was posted on, see who wrote the half you mean and act from their drawer, or act on the content.",
  "moderation.refusal.houseAccount":
    "That didn't go through: what was reported traces back to the house account, which is never a moderation target. Act on the content, or dismiss the report.",
  "moderation.refusal.staffAccount":
    "That didn't go through: what was reported traces back to a staff account, which this queue can't action. Raise it with an admin.",
  "moderation.queue.bulkPartialToast":
    "{succeededCount} succeeded, {failedCount} failed: {reasons}",
  "moderation.queue.bulkToast_one": "{count} report {verb}",
  "moderation.queue.bulkToast_other": "{count} reports {verb}",
  "moderation.queue.bulkVerb.dismissed": "dismissed",
  "moderation.queue.bulkVerb.removedAsSpam": "removed as spam",
  "moderation.queue.bulkVerb.escalated": "escalated",
  "moderation.queue.bulkVerb.warned": "warned",
  "moderation.queue.bulkVerb.suspended": "suspended",
  "moderation.queue.bulkVerb.banned": "banned",
  "moderation.queue.bulkRestoredToast": "Restored the reports.",
  "moderation.queue.appealToast": "{verb} · {name} notified",
  "moderation.queue.appealVerb.upheld": "Upheld",
  "moderation.queue.appealVerb.overturned": "Overturned",
  "moderation.queue.appealRestoredToast": "Restored the appeal.",

  // ── Communities ────────────────────────────────────────────────────────────
  "communities.title": "Communities · <em>all spaces</em>",
  "communities.grid.eyebrow": "Communities",
  "communities.grid.titleLine1_one": "{spelled} space,",
  "communities.grid.titleLine1_other": "{spelled} spaces,",
  "communities.grid.titleLine1Unknown": "Spaces,",
  "communities.grid.titleLine2": "each <em>tended to</em>.",
  "communities.grid.sub":
    "Every community has a moderator who knows it by name. Health is how steady each one feels: reports answered, members held, no one slipping through.",
  "communities.grid.loadError": "Couldn’t load the communities.",
  // Names the community, because the card's own action and this one are two
  // separate controls and a bare "Health 72" says nothing about whose.
  "communities.grid.healthAriaLabel":
    "Health {score} for {name}, see breakdown",
  "communities.grid.openAriaLabel": "Open {name}",
  "communities.grid.needsHand": "· needs a hand",
  "communities.grid.stat.members": "Members",
  "communities.grid.stat.activity": "Activity",
  "communities.grid.stat.openReports": "Open reports",
  "communities.grid.sparklineAriaLabel": "Weekly activity, latest {value}",
  "communities.grid.emptyTitle": "No spaces <em>yet</em>.",
  "communities.grid.emptyText":
    "Spaces here are built by members. When the first one takes shape, its health, its moderators, and its queue will show up right here.",
  // Activity classification the health math computes server-side (chrome,
  // not fetched free text) — see adminCommunities.adapters.ts.
  "communities.activityLabel.quiet": "Quiet",
  "communities.activityLabel.growing": "Growing",
  "communities.activityLabel.steady": "Steady",
  "communities.activityLabel.active": "Active",
  "communities.activityLabel.high": "High",
  "communities.activityLabel.busy": "Busy",

  "communities.detail.backCta": "All communities",
  "communities.detail.stewardedBy_one":
    "Stewarded by {count} moderator · founded {founded}.",
  "communities.detail.stewardedBy_other":
    "Stewarded by {count} moderators · founded {founded}.",
  // CLDR has no "zero" plural category for en/pt, so `stewardedBy_zero` would
  // never be selected automatically (see translate.ts's resolveEntry) — this
  // key is chosen with an explicit branch in AdminCommunityDetail.tsx instead,
  // dropping the "stewarded by 0" clause rather than rendering it right above
  // the `supportBanner.textNone` banner that already says the same thing.
  "communities.detail.foundedOnly": "Founded {founded}.",
  "communities.detail.healthChip": "Health {score} · {label}",
  "communities.detail.settingsCta": "Settings",
  "communities.detail.supportBanner.title":
    "This community could use <em>a hand</em>.",
  "communities.detail.supportBanner.textAlone":
    "A health score this low is a call for support for the moderators. {name} is stewarding {members} members almost alone.",
  "communities.detail.supportBanner.textThin":
    "A health score this low is a call for support for the moderators. {name} is stewarding {members} members with a thin team.",
  "communities.detail.supportBanner.textNone":
    "A health score this low is a call for support for the moderators. This community currently has no moderator at all, and {members} members are relying on it.",
  "communities.detail.supportBanner.offerCta": "Offer support",
  "communities.detail.stat.members": "Members",
  "communities.detail.stat.activeThisWeek": "Active this week",
  "communities.detail.stat.openReports": "Open reports",
  "communities.detail.stat.handled": "Handled",
  "communities.detail.tabs.queue": "Scoped queue",
  "communities.detail.tabs.members": "Members",
  "communities.detail.tabs.settings": "Settings",
  "communities.detail.spaces.title": "Spaces",
  "communities.detail.spaces.empty": "No spaces",
  "communities.detail.parent": "Space inside {name}",
  "communities.detail.health.thriving": "thriving",
  "communities.detail.health.steady": "steady",
  "communities.detail.health.needsHand": "needs a hand",

  "communities.queue.emptyTitle": "Nothing open, <em>nothing owed</em>.",
  "communities.queue.emptyText":
    "This community takes care of itself: a {pct}% handled rate. Its moderators rarely need you.",
  "communities.queue.moreHandled":
    "+ {count} more being handled by the community's own moderators",
  "communities.queue.reviewCta": "Review",
  "communities.members.moderatorChip": "Moderator",
  "communities.members.seeAllCta": "See all {total} members",
  // A moderator's subline, composed from the API's owner/mod role + join
  // date (chrome, not fetched free text) — see adminCommunities.adapters.ts.
  "communities.moderators.roleLine.owner": "Founded the community",
  "communities.moderators.roleLine.mod": "Moderator since {date}",

  "communities.settings.whoCanJoin": "Who can join",
  "communities.settings.moderators": "Moderators",
  "communities.settings.removeModAriaLabel": "Remove {name}",
  "communities.settings.addModCta": "+ Add",
  "communities.settings.modRemovedToast": "Removed {name} as moderator",
  // Live moderator management (add/remove). Demo keeps its simulated
  // local-state behaviour; live wires both controls to the real
  // `/admin/communities/:slug/moderators` endpoints.
  "communities.settings.mod.addPickerTitle": "Add a moderator",
  "communities.settings.mod.pickerLoading": "Loading members…",
  "communities.settings.mod.pickerEmpty":
    "Every member here is already a moderator.",
  "communities.settings.mod.addedToast": "{name} is now a moderator",
  "communities.settings.mod.addFailedToast":
    "Couldn't add {name} as a moderator",
  "communities.settings.mod.removeFailedToast":
    "Couldn't remove {name} as a moderator",
  "communities.settings.mod.searchLabel": "Search members",
  "communities.settings.mod.searchPlaceholder": "Name or handle",
  "communities.settings.mod.pickerNoMatches": "No members match “{query}”",
  "communities.settings.mod.pickerCapped":
    "Showing the first {count}. Search by name or handle to find someone else.",
  "communities.settings.mod.pickerLoadFailed": "We couldn't load the members.",
  "communities.settings.mod.cancelCta": "Cancel",
  "communities.settings.secondVouch.title": "Require a second vouch to join",
  "communities.settings.secondVouch.sub":
    "Slows growth, raises trust. Recommended for support spaces.",
  "communities.settings.secondVouch.onToast":
    "Second vouch now required to join",
  "communities.settings.secondVouch.offToast":
    "Second vouch no longer required",
  "communities.settings.autoFreeze.title":
    "Auto-freeze new accounts on a doxxing report",
  "communities.settings.autoFreeze.sub":
    "Buys time for a human to review before harm spreads.",
  "communities.settings.autoFreeze.onToast":
    "Auto-freeze on doxxing reports enabled",
  "communities.settings.autoFreeze.offToast": "Auto-freeze disabled",
  "communities.settings.featured.title": "Featured on Discover",
  "communities.settings.featured.sub":
    "Shown as the hero card at the top of the Communities Discover page. Only one community can be featured at a time. Turning this on for a community replaces whichever one is currently featured.",
  "communities.settings.featured.onToast":
    "This community is now featured on Discover",
  "communities.settings.featured.offToast":
    "This community is no longer featured",
  "communities.settings.spaces.title": "Allow spaces",
  "communities.settings.spaces.sub":
    "Let this community's owner and moderators open smaller spaces inside it.",
  "communities.settings.spaces.onToast": "Spaces turned on",
  "communities.settings.spaces.offToast": "Spaces turned off",
  "communities.settings.spaces.isSpace":
    "This is a space inside {name}, so it can't have spaces of its own.",
  "communities.settings.featured.isSpace":
    "This is a space inside {name}, so it can't be featured on Discover.",
  "communities.settings.saveErrorToast": "That didn't save. Try again.",
  "communities.settings.codeOfCare": "Code of care",
  "communities.settings.viewCta": "View",
  "communities.settings.codeToast": "The code of care would open here",
  "communities.settings.visibility": "Visibility",
  "communities.settings.visibility.private": "Private",
  "communities.settings.visibility.public": "Public",
  "communities.settings.visibility.network": "Network-only",
  "communities.settings.status": "Status",
  "communities.settings.frozenChip": "Frozen · under review",

  // ── Admin overrides (freeze/unfreeze, archive/unarchive, reassign owner) ──
  "communities.settings.overrides.title": "Moderation overrides",
  "communities.settings.overrides.sub":
    "Bypass this community's own owner/mod controls, for when its leadership can't be reached or trusted.",
  "communities.settings.overrides.freezeCta": "Freeze",
  "communities.settings.overrides.unfreezeCta": "Unfreeze",
  "communities.settings.overrides.freezeToast": "{name} is now frozen",
  "communities.settings.overrides.freezeFailedToast":
    "Couldn't freeze that community. Try again.",
  "communities.settings.overrides.unfreezeToast": "{name} is no longer frozen",
  "communities.settings.overrides.unfreezeFailedToast":
    "Couldn't unfreeze that community. Try again.",
  "communities.settings.overrides.reassignCta": "Reassign owner",
  "communities.settings.overrides.archiveCta": "Archive",
  "communities.settings.overrides.unarchiveCta": "Unarchive",
  "communities.settings.overrides.unarchiveToast":
    "{name} is no longer archived",
  "communities.settings.overrides.unarchiveFailedToast":
    "Couldn't unarchive that community. Try again.",
  "communities.settings.overrides.archiveToast": "{name} has been archived",
  "communities.settings.overrides.archiveFailedToast":
    "Couldn't archive {name}. Try again.",
  "communities.settings.overrides.archiveConfirmTitle": "Archive {name}?",
  "communities.settings.overrides.archiveConfirmBody":
    "The community is taken down for members immediately. An admin can reverse this from the same panel.",
  "communities.settings.overrides.archiveConfirmCta": "Archive community",
  "communities.settings.overrides.reassignToast": "{name} is now the owner",
  "communities.settings.overrides.reassignFailedToast":
    "Couldn't reassign ownership. Try again.",
  "communities.settings.overrides.reassignTitle":
    "Reassign ownership of {name}",
  "communities.settings.overrides.reassignBody":
    "The member you pick becomes owner immediately. If the community already has an owner, they're demoted to moderator.",
  "communities.settings.overrides.reassignEmptyTitle": "No one to reassign to",
  "communities.settings.overrides.reassignEmptyDesc":
    "This community has no other roster members yet.",
  "communities.settings.overrides.reassignConfirmCta": "Reassign ownership",
  "communities.settings.overrides.reassignPickLabel": "Pick the new owner",

  // ── Governance log (the community's own audit trail) ──────────────────────
  "communities.detail.tabs.governanceLog": "Governance log",
  "communities.governanceLog.intro":
    "Every governance action recorded against this community, newest first. Entries are written by the server and can never be edited.",
  "communities.governanceLog.filterLabel": "Filter by action",
  "communities.governanceLog.allActions": "All actions",
  "communities.governanceLog.loadError": "The governance log didn't load.",
  "communities.governanceLog.retryCta": "Try again",
  "communities.governanceLog.emptyTitle": "Nothing recorded <em>yet</em>.",
  "communities.governanceLog.emptyText":
    "Role changes, removals, ownership handovers, freezes and settings edits all land here the moment they happen.",
  "communities.governanceLog.emptyFilteredTitle":
    "Nothing of <em>this kind</em>.",
  "communities.governanceLog.emptyFilteredText":
    "This community has governance history, and none of it matches the action you picked. Clear the filter to read the whole trail.",
  "communities.governanceLog.clearFilterCta": "Clear the filter",
  "communities.governanceLog.pagerMeta": "{start} to {end} of {total}",
  "communities.governanceLog.pagerPage": "Page {page} of {pageCount}",
  "communities.governanceLog.prevPage": "Previous page",
  "communities.governanceLog.nextPage": "Next page",

  "communities.governanceLog.action.role_changed": "Role changed",
  "communities.governanceLog.action.member_removed": "Member removed",
  "communities.governanceLog.action.ownership_transferred":
    "Ownership transferred",
  "communities.governanceLog.action.owner_auto_promoted": "Owner auto-promoted",
  "communities.governanceLog.action.frozen": "Frozen",
  "communities.governanceLog.action.unfrozen": "Unfrozen",
  "communities.governanceLog.action.archived": "Archived",
  "communities.governanceLog.action.unarchived": "Unarchived",
  "communities.governanceLog.action.settings_changed": "Settings changed",
  "communities.governanceLog.action.support_offered": "Support offered",
  "communities.governanceLog.action.support_offer_answered": "Support answered",

  "communities.governanceLog.summary.role_changed": "{name}'s role changed",
  "communities.governanceLog.summary.member_removed":
    "{name} was removed from the roster",
  "communities.governanceLog.summary.ownership_transferred":
    "{name} became the owner",
  "communities.governanceLog.summary.owner_auto_promoted":
    "{name} was promoted to owner automatically",
  "communities.governanceLog.summary.frozen": "The community was frozen",
  "communities.governanceLog.summary.unfrozen": "The freeze was lifted",
  "communities.governanceLog.summary.archived": "The community was archived",
  "communities.governanceLog.summary.unarchived":
    "The community was restored from the archive",
  "communities.governanceLog.summary.settings_changed":
    "Community settings changed",
  "communities.governanceLog.summary.support_offered":
    "Platform staff offered this community support",
  "communities.governanceLog.summary.support_offer_answered":
    "The moderators answered an offer of support",

  "communities.governanceLog.unknownMember": "A former member",
  "communities.governanceLog.byLine": "by {name}",
  "communities.governanceLog.unattributed": "No named actor",
  "communities.governanceLog.unattributedHint":
    "Either the platform acted automatically, or the person who acted has since erased their account.",
  "communities.governanceLog.override.label": "Platform override",
  "communities.governanceLog.override.hint":
    "Platform staff took this action over the community's own owner and moderators.",

  "communities.governanceLog.meta.roleLabel": "Role",
  "communities.governanceLog.meta.role.owner": "Owner",
  "communities.governanceLog.meta.role.mod": "Moderator",
  "communities.governanceLog.meta.role.member": "Member",
  "communities.governanceLog.meta.reasonLabel": "Reason",
  "communities.governanceLog.meta.fromTo": "{from} to {to}",
  "communities.governanceLog.meta.on": "On",
  "communities.governanceLog.meta.off": "Off",
  "communities.governanceLog.meta.empty": "Empty",
  "communities.governanceLog.meta.notSet": "Not set",
  "communities.governanceLog.meta.added": "Added: {values}",
  "communities.governanceLog.meta.removed": "Removed: {values}",
  "communities.governanceLog.meta.reordered": "Same values, new order",
  "communities.governanceLog.meta.field.requiresSecondVouch":
    "Second vouch required to join",
  "communities.governanceLog.meta.field.autoFreezeOnReports":
    "Auto-freeze on reports",
  "communities.governanceLog.meta.field.isFeatured": "Featured on Discover",
  "communities.governanceLog.meta.field.name": "Name",
  "communities.governanceLog.meta.field.purpose": "Purpose",
  "communities.governanceLog.meta.field.type": "Type",
  "communities.governanceLog.meta.field.whoFor": "Who it is for",
  "communities.governanceLog.meta.field.tagline": "Tagline",
  "communities.governanceLog.meta.field.nowReading": "Now reading",
  "communities.governanceLog.meta.field.accessTier": "Who can join",
  "communities.governanceLog.meta.field.rosterVisible": "Roster visible",
  "communities.governanceLog.meta.field.features": "Features",
  "communities.governanceLog.meta.field.rules": "Rules",
  "communities.governanceLog.meta.field.tags": "Tags",
  "communities.governanceLog.meta.field.coverImageUrl": "Cover image",
  "communities.governanceLog.meta.field.avatarImageUrl": "Community mark",
  "communities.governanceLog.meta.field.welcomeMessage": "Welcome note",
  "communities.governanceLog.meta.field.publiclyListed": "Listed publicly",
  "communities.governanceLog.meta.field.languages": "Languages",
  "communities.governanceLog.meta.field.city": "City",
  "communities.governanceLog.meta.field.area": "Area",
  "communities.governanceLog.meta.field.isOnline": "Meets online",
  "communities.governanceLog.meta.field.rulesVersion": "Shared-values version",

  "communities.health.modalTitle": "Why <em>{score}</em>?",
  "communities.health.howCalculatedCta": "How it's calculated",
  "communities.health.offerSupportCta": "Offer support",
  "communities.health.closeCta": "Close",
  "communities.health.notMeasured": "Not measured yet",
  "communities.health.intro":
    "Health is a blend of four signals, weighted by community size. It's a thermometer, a reading of how the space feels.",
  "communities.health.breakdown.memberActivity.name": "Member activity",
  "communities.health.breakdown.memberActivity.desc":
    "How alive the space feels: posts, replies, attendance",
  "communities.health.breakdown.reportResolution.name": "Report handling",
  "communities.health.breakdown.reportResolution.desc":
    "Share of reports no longer sitting open: resolved or escalated",
  "communities.health.breakdown.memberSentiment.name": "Member sentiment",
  "communities.health.breakdown.memberSentiment.desc":
    "Quiet pulse-check surveys and reaction signals",
  "communities.health.breakdown.safetyLoad.name": "Safety load",
  "communities.health.breakdown.safetyLoad.desc":
    "Inverse of harm reports relative to size",
  "communities.health.narrative.strong":
    "A strong, balanced score. Nothing here needs your attention. Keep doing what works.",
  "communities.health.narrative.healthy":
    "Healthy overall, with one or two areas worth a gentle eye.",
  "communities.health.narrative.dragging":
    "Sentiment and safety load are dragging the score down. This is exactly where a little staff support goes a long way.",

  "communities.health.method.title": "How health is calculated",
  "communities.health.method.formula":
    "Health blends four signals into one score, then adjusts for how big your community is. It refreshes every night.",
  "communities.health.method.signalsHeading": "What goes in",
  "communities.health.method.weightNotCounted": "Not counted yet",
  "communities.health.method.exampleTitle": "How this score adds up",
  "communities.health.method.exampleSubtotal": "Signals blended",
  "communities.health.method.exampleSizeAdjust": "Adjusted for community size",
  "communities.health.method.examplePublished": "Published health",
  "communities.health.method.exampleNote":
    "Weights shown are illustrative. The exact blend and the size adjustment are worked out nightly on our servers, so read this as the shape of the maths, a rough picture of how it works.",
  "communities.health.method.sizeNote":
    "Community size matters. A small space is judged gently, so a quiet week or a single open report does not sink the score the way it would in a community many times its size.",
  "communities.health.method.bandsHeading": "Where the score sits",
  "communities.health.method.band.strong": "Strong, 90 and up",
  "communities.health.method.band.healthy": "Healthy, 78 to 89",
  "communities.health.method.band.needsHand": "Needs a hand, below 78",
  "communities.health.method.bandCurrent": "You're here",
  "communities.health.method.backCta": "Back",
  "communities.health.method.doneCta": "Got it",

  "communities.support.modalTitle": "Lend <em>{name}</em> a hand",
  "communities.support.intro":
    "Pick how to help. You can do more than one. The moderators will see exactly what you offered.",
  "communities.support.noteLabel": "A note for the moderators (optional)",
  "communities.support.notePlaceholder":
    "We saw the score dip. What would actually help right now?",
  "communities.support.cancelCta": "Cancel",
  "communities.support.sendCta": "Send support",
  "communities.support.sentToast": "Support sent to {name}'s moderators",
  "communities.support.option.message.title": "Message the moderators",
  "communities.support.option.message.sub":
    "A warm check-in to {names}. How can we help?",
  "communities.support.option.message.subNoMods":
    "A warm check-in to its moderators. How can we help?",
  "communities.support.option.buddy.title": "Assign a staff buddy for 2 weeks",
  "communities.support.option.buddy.sub":
    "A Trust & Safety teammate co-moderates to take the load off.",
  "communities.support.option.toolkit.title": "Share the de-escalation toolkit",
  "communities.support.option.toolkit.sub":
    "Templates and guides for handling heated public threads.",
  "communities.support.option.recruit.title": "Recruit another moderator",
  "communities.support.option.recruit.sub":
    "Open a call for a trusted member to join the mod team.",

  // ── Governance ─────────────────────────────────────────────────────────────
  "governance.title": "Governance · <em>accountability</em>",
  "governance.header.eyebrow": "Governance & transparency",
  "governance.header.title": "Nothing here is <em>hidden</em>.",
  "governance.header.sub":
    "Where the money comes from, where it goes, every rule change, and every action a moderator has ever taken, all open to the members who fund us.",
  "governance.header.publishCta": "Publish report",
  "governance.header.publishToast":
    "Transparency report queued. Members will be notified when it publishes.",
  // Live mode (P3-7): publishing stamps the snapshot server-side.
  "governance.header.publishedToast": "Transparency report published.",
  "governance.header.publishError":
    "Couldn't publish the report. Please try again.",
  // Retained for compatibility; live no longer disables the publish button.
  "governance.tabs.finances": "Finances",
  "governance.tabs.policy": "Policy & versions",
  "governance.tabs.proposals": "Proposals",
  "governance.tabs.motions": "Motions",
  "governance.tabs.audit": "Audit log",

  // NOTE: the rest of `governance.overview.*` (the Policy tab's
  // health/moderation/council/principles/decisions editors) is a pre-existing
  // gap in this catalog — those keys were already missing before this
  // change, in both EN and PT. Out of scope for COM-1/COM-4; only the one key
  // this change's `AdminGovernanceHealthEditor` edit needs is added below, so
  // it renders correctly whenever that broader gap gets backfilled.
  "governance.overview.health.field.valueComputedHint":
    "Computed live from active member accounts. Read-only here.",

  // ── Proposals tab (COM-1) ──────────────────────────────────────────────────
  // Admin-only create form + list for the real member-vote proposals backing
  // the "two-thirds community vote" / "the community will vote on it"
  // promises on the public Governance page. List rendering reuses the public
  // `governance:sections.proposals.*` vocabulary conceptually, but as a
  // separate admin-namespaced copy since the admin list has no vote buttons.
  "governance.proposals.header.eyebrow": "Proposals",
  "governance.proposals.header.title": "Open it to a <em>vote</em>",
  "governance.proposals.header.sub":
    "Council-seat removals and funding-policy changes are decided by member vote. Open a proposal here; members vote on the public Governance page.",
  "governance.proposals.createCta": "New proposal",
  "governance.proposals.empty": "No proposal has been opened yet.",
  "governance.proposals.loadError.title": "The proposals didn't load",
  "governance.proposals.loadError.body":
    "This is an outage on our side. Proposals may be open that this list could not read. Try again.",
  "governance.proposals.list.status.passed": "Passed",
  "governance.proposals.list.status.failed": "Did not pass",
  "governance.proposals.list.type.council_removal": "Council seat removal",
  "governance.proposals.list.type.funding_change": "Funding change",
  "governance.proposals.list.tally":
    "{forCount} for · {againstCount} against · {forPercent}% in favour",
  "governance.proposals.list.closes": "Voting closes {date}",
  "governance.proposals.list.closedOn": "Voting closed {date}",
  "governance.proposals.form.eyebrow": "New proposal",
  "governance.proposals.form.title": "Open a <em>proposal</em>",
  "governance.proposals.form.sub":
    "This goes live on the public Governance page immediately and members can start voting once it opens.",
  "governance.proposals.form.field.type": "Type",
  "governance.proposals.form.field.type.council_removal":
    "Council seat removal",
  "governance.proposals.form.field.type.funding_change": "Funding change",
  "governance.proposals.form.field.title": "Title",
  "governance.proposals.form.field.description": "Description",
  "governance.proposals.form.field.targetMemberId":
    "Member id (seat under review)",
  "governance.proposals.form.field.targetMemberIdHint":
    "The account id of the council member this proposal concerns. Required for a council-seat proposal.",
  "governance.proposals.form.field.opensAt": "Voting opens",
  "governance.proposals.form.field.closesAt": "Voting closes",
  "governance.proposals.form.save": "Open proposal",
  "governance.proposals.form.cancel": "Cancel",
  "governance.proposals.form.saved": "Proposal opened.",
  "governance.proposals.form.error":
    "Could not open the proposal. Please try again.",
  "governance.proposals.form.validation":
    "Fill in every field before opening the proposal.",

  // ── Motions tab (GOV-01) ──────────────────────────────────────────────────
  // The screening queue. These are member-raised motions that already
  // cleared their co-signature threshold and are waiting on a reviewer.
  // Approving one schedules its ballot; rejecting one publishes the
  // reviewer's written reason on the public Governance page, so the copy
  // says so before the decision is taken rather than after.
  "governance.motions.header.eyebrow": "Member motions",
  "governance.motions.header.title": "Motions <em>awaiting review</em>",
  "governance.motions.header.sub":
    "Motions members raised that reached their co-signature threshold. Approve one to schedule its vote, or reject it with a reason every member will read.",
  "governance.motions.loading": "Loading motions…",
  "governance.motions.empty": "No motion is waiting for review.",
  "governance.motions.error": "Could not load the motion queue.",
  "governance.motions.retry": "Try again",
  "governance.motions.approveCta": "Approve",
  "governance.motions.rejectCta": "Reject",
  "governance.motions.list.cosignatures": "Co-signatures: {count}",
  "governance.motions.list.raisedBy": "Raised by {name}",
  "governance.motions.list.filedOn": "Filed {date}",
  "governance.motions.approve.eyebrow": "Motion review",
  "governance.motions.approve.title": "Open this motion for voting",
  "governance.motions.approve.sub":
    "Set when the ballot opens and when it closes. Members can vote at any point inside that window.",
  "governance.motions.approve.opensAt": "Voting opens",
  "governance.motions.approve.closesAt": "Voting closes",
  "governance.motions.approve.cancel": "Cancel",
  "governance.motions.approve.save": "Open for voting",
  "governance.motions.approve.saving": "Opening…",
  "governance.motions.approve.saved": "Motion approved. Voting is scheduled.",
  "governance.motions.approve.error":
    "Could not approve the motion. Please try again.",
  "governance.motions.approve.validation":
    "Set both an opening and a closing date.",
  "governance.motions.approve.orderError":
    "Voting has to close after it opens.",
  "governance.motions.reject.title": "Reject this motion?",
  "governance.motions.reject.body":
    "The motion will not go to a vote. Your reason is published on the public Governance page, where every member can read it.",
  "governance.motions.reject.confirmCta": "Reject motion",
  "governance.motions.reject.reasonLabel": "Reason",
  "governance.motions.reject.reasonPlaceholder":
    "Explain why this motion is not going to a vote.",
  "governance.motions.reject.saved":
    "Motion rejected. The reason is published.",
  "governance.motions.reject.error":
    "Could not reject the motion. Please try again.",

  "governance.finances.stat.sustainerMrr": "Sustainer MRR",
  "governance.finances.stat.totalIncome": "Total monthly income",
  "governance.finances.stat.surplus": "Monthly surplus",
  "governance.finances.stat.solidarity": "On solidarity access",
  "governance.finances.foot.sustainersCount": "{count} members chip in monthly",
  "governance.finances.foot.sources": "Sustainers, grants & one-offs",
  "governance.finances.foot.reserve": "Held in the community reserve",
  "governance.finances.foot.solidarityRate": "Members on free or reduced rate",
  "governance.finances.empty":
    "No finance report yet. Open a quarter to start entering real figures.",

  "governance.finances.provenance.seeded": "Unverified",
  "governance.finances.provenance.manual": "Edited",
  "governance.finances.provenance.computed": "Computed",
  "governance.finances.provenance.seeded.hint":
    "Seeded placeholder. Not yet checked against real figures.",
  "governance.finances.provenance.manual.hintPlain": "Entered by an admin.",
  "governance.finances.provenance.computed.hint":
    "Calculated from other figures. Not edited directly.",
  "governance.finances.provenance.notVerifiedCta": "Not verified · Edit",
  "governance.finances.edit.cta": "Edit figures",
  "governance.finances.edit.lastEdited": "Last corrected by {name} on {date}",
  "governance.finances.edit.neverEdited":
    "No figure has been corrected yet. Every value is seeded.",
  "governance.finances.edit.eyebrow": "Finances",
  "governance.finances.edit.title": "Correct the <em>figures</em>",
  "governance.finances.edit.sub":
    "These figures are reported by QueerPulse each quarter and reviewed by the finance team, and entered by hand. Total spending and the surplus are calculated for you. Fix any number that's wrong; every change is recorded and marked as admin-entered.",
  "governance.finances.edit.section.headline": "Headline figures",
  "governance.finances.edit.section.income": "Income lines",
  "governance.finances.edit.section.spend": "Spending lines",
  "governance.finances.edit.section.note": "Reason (optional)",
  "governance.finances.edit.field.mrr": "Sustainer MRR (€)",
  "governance.finances.edit.field.sustainerCount": "Sustainer count",
  "governance.finances.edit.field.solidarityRate": "Solidarity access (%)",
  "governance.finances.edit.field.incomeTotal": "Total monthly income (€)",
  "governance.finances.edit.field.expenseTotal": "Total monthly spending (€)",
  "governance.finances.edit.field.expenseTotalHint":
    "Calculated automatically: the sum of the shown spending lines.",
  "governance.finances.edit.field.surplus": "Monthly surplus (€)",
  "governance.finances.edit.field.surplusHint":
    "Calculated automatically: income minus spending.",
  "governance.finances.edit.field.lineAmount": "Amount",
  "governance.finances.edit.field.lineNote": "Note",
  "governance.finances.edit.field.lineEnabled": "Show {label} on the dashboard",
  "governance.finances.edit.field.lineDisabledHint":
    "Hidden from the dashboard until turned back on.",
  "governance.finances.edit.notePlaceholder":
    "Why are you changing these? Saved to the audit trail.",
  "governance.finances.edit.save": "Save corrections",
  "governance.finances.edit.cancel": "Cancel",
  "governance.finances.edit.saved": "Figures updated.",
  "governance.finances.edit.error": "Could not save. Please try again.",
  "governance.finances.edit.noChanges": "Nothing changed.",
  "governance.finances.edit.noChangesYet": "No changes yet.",
  "governance.finances.edit.changes_one": "{count} change to save",
  "governance.finances.edit.changes_other": "{count} changes to save",
  "governance.finances.edit.col.figure": "Figure",
  "governance.finances.edit.col.source": "Source",
  "governance.finances.edit.col.current": "Current",
  "governance.finances.edit.col.newValue": "New value",
  "governance.finances.edit.col.shown": "Shown",
  "governance.finances.edit.col.line": "Line",
  "governance.finances.edit.col.newAmount": "New amount",
  "governance.finances.edit.col.note": "Note",
  "governance.finances.edit.foot.shownCount": "{shown} of {total} shown",
  "governance.finances.edit.foot.sumShown": "Sum of shown lines",
  "governance.finances.edit.aria.newValue": "{label}: new value",
  "governance.finances.edit.aria.newAmount": "{label}: new amount",
  "governance.finances.edit.aria.note": "{label}: note",
  "governance.finances.edit.aria.lineName": "Line {position}: name",

  "governance.ledger.moderatorHonoraria": "Moderator honoraria",
  "governance.ledger.platformTools": "Platform & tools",
  "governance.ledger.mutualAid": "Mutual aid & micro-grants",
  "governance.ledger.mentalHealth": "Mental health fund",
  "governance.ledger.magazine": "Magazine production",
  "governance.ledger.memberSustainers": "Member sustainers",
  "governance.ledger.partnerGrants": "Partner grants",
  "governance.ledger.gatheringTickets": "Event tickets",

  "governance.income.title": "Where it <em>comes from</em>",
  "governance.income.sub": "{amount} / month, in from three honest places.",
  "governance.income.note":
    "No advertising. No data sales. No venture money. <strong>Two-thirds comes straight from members.</strong>",
  "governance.spend.title": "Where it <em>goes</em>",
  "governance.spend.sub":
    "{amount} / month: every euro accounted for, line by line.",
  "governance.ledgerCard.empty.income": "No income lines yet",
  "governance.ledgerCard.empty.expense": "No spending lines yet",
  "governance.ledgerCard.empty.addIncome": "Add income lines",
  "governance.ledgerCard.empty.addExpense": "Add spending lines",
  "governance.ledgerCard.remainder.label": "Not broken down yet",
  "governance.ledgerCard.remainder.cta": "Add lines",

  "governance.chart.title": "Income vs spending <em>by quarter</em>",
  "governance.chart.sub":
    "The gap is surplus. It goes straight to the reserve.",
  "governance.chart.ariaLabel":
    "Grouped bar chart of income versus spending per quarter, in thousands of euros",
  "governance.chart.legend.income": "Income",
  "governance.chart.legend.spending": "Spending",
  "governance.chart.legend.surplus": "Surplus to reserve",
  "governance.chart.range.4q": "4Q",
  "governance.chart.range.6q": "6Q",
  "governance.chart.range.all": "All",

  // Not "live" (COM-4): this figure is admin-reported each period and
  // reviewed by the finance team, not computed automatically — the copy and
  // the panel's dot (no longer pulsing, see AdminGovernancePage.module.css)
  // were changed together so neither implies real-time computation.
  "governance.mrrPanel.live": "Sustainer MRR · reported",
  "governance.mrrPanel.lead":
    "Every euro comes from members alone. <em>We will never sell member data</em>. That's written into our constitution, so it holds us to it.",
  "governance.mrrPanel.readCta": "Read the constitution",

  "governance.audit.title": "Every action, <em>on the record</em>",
  "governance.audit.metaZero": "No entries match these filters.",
  "governance.audit.metaMatch": "{count} entries",
  "governance.audit.exportToast": "Exported {total} entries as CSV",
  // Live mode (P3-8): export streams a real CSV honouring the current filters.
  "governance.audit.exportError":
    "Couldn't export the audit log. Please try again.",
  // Retained for compatibility; live no longer disables the export button.
  "governance.audit.exportCta": "Export CSV",
  "governance.audit.columns.moderator": "Moderator",
  "governance.audit.columns.action": "Action",
  "governance.audit.columns.subject": "Subject",
  "governance.audit.columns.reason": "Reason",
  "governance.audit.columns.when": "When",
  "governance.audit.searchPlaceholder": "Search reason or subject…",
  "governance.audit.searchAriaLabel": "Search the audit log",
  "governance.audit.filterModerator": "Filter by moderator",
  "governance.audit.filterAction": "Filter by action",
  "governance.audit.filterRange": "Filter by time range",
  "governance.audit.allModerators": "All moderators",
  "governance.audit.allActions": "All actions",
  "governance.audit.allTime": "All time",
  "governance.audit.actionType.dismiss": "Dismissed",
  "governance.audit.actionType.warn": "Warned",
  "governance.audit.actionType.hide_content": "Content hidden",
  "governance.audit.actionType.remove_content": "Content removed",
  "governance.audit.actionType.media_force_delete": "Upload force-deleted",
  "governance.audit.actionType.topic_hard_delete": "Topic permanently deleted",
  "governance.audit.actionType.housing_group_delete": "Housing group deleted",
  "governance.audit.actionType.housing_group_listing_hide":
    "Group listing hidden",
  "governance.audit.actionType.housing_group_listing_unhide":
    "Group listing restored",
  "governance.audit.actionType.housing_group_join_request_triage":
    "Group join request decided",
  "governance.audit.actionType.housing_coop_delete": "Housing co-op deleted",
  "governance.audit.actionType.housing_coop_join_request_triage":
    "Co-op join request decided",
  "governance.audit.actionType.restrict": "Restricted",
  "governance.audit.actionType.suspend": "Suspended",
  "governance.audit.actionType.ban": "Banned",
  "governance.audit.actionType.shield": "Shielded",
  "governance.audit.actionType.escalate": "Escalated",
  "governance.audit.actionType.appeal_upheld": "Appeal upheld",
  "governance.audit.actionType.appeal_overturned": "Appeal overturned",
  "governance.audit.actionType.suspension_lifted": "Suspension lifted",
  "governance.audit.actionType.role_changed": "Role changed",
  "governance.audit.actionType.staff_role_granted": "Staff role granted",
  "governance.audit.actionType.staff_role_revoked": "Staff role revoked",
  "governance.audit.actionType.evidence_cited": "Evidence cited",
  // A recorded read rather than an enforcement action. The label says what
  // happened and names no address: the row deliberately carries none.
  "governance.audit.actionType.member_sign_in_email_viewed":
    "Sign-in address revealed",

  // ── Audit actions written outside the report queue ────────────────────────
  // Every string below is a real `mod_audit_logs.action` some service writes,
  // and the feed resolves its label as
  // `admin:governance.audit.actionType.<action>`. A missing key here renders
  // the RAW KEY on screen, so this block has to cover every writer, not just
  // the ones in `AuditType`. That union is a different and deliberately
  // narrower thing: the curated set offered in the action FILTER dropdown.
  // Tone falls back to plum for anything outside it, which is decorative.
  //
  // Sign-in identity levers (`AdminIdentityService`).
  "governance.audit.actionType.sign_in_identity_relinked":
    "Sign-in identity re-linked",
  "governance.audit.actionType.sign_in_identity_candidate_dismissed":
    "Sign-in identity refused",
  "governance.audit.actionType.account_reactivated_by_admin":
    "Account reactivated",
  "governance.audit.actionType.email_suppression_lifted":
    "Email suppression lifted",
  // Member and invite administration (`AdminMembersService`,
  // `AdminInvitesService`, `AdminMemberModerationService`).
  "governance.audit.actionType.member_verified": "Member verified",
  "governance.audit.actionType.invite_quota_changed": "Invite quota changed",
  "governance.audit.actionType.invite_access_changed": "Invite access changed",
  "governance.audit.actionType.invite_revoked": "Invite revoked",
  "governance.audit.actionType.invite_refreshed": "Invite refreshed",
  // Reversals and the ban-ratification window (`ModerationService`,
  // `AccountEnforcementService`, `BanRatificationService`).
  "governance.audit.actionType.content_restored": "Content restored",
  "governance.audit.actionType.restriction_lifted": "Restriction lifted",
  "governance.audit.actionType.ban_pending_ratification":
    "Ban held for ratification",
  "governance.audit.actionType.ban_declined": "Ban declined",
  "governance.audit.actionType.ban_hold_expired": "Ban hold expired",
  // Housing listing decisions (`HousingListingModerationService`).
  "governance.audit.actionType.housing_listing_approved":
    "Housing listing approved",
  "governance.audit.actionType.housing_listing_changes_requested":
    "Housing listing changes requested",
  "governance.audit.actionType.housing_listing_rejected":
    "Housing listing rejected",
  "governance.audit.actionType.housing_listing_taken_down":
    "Housing listing taken down",
  // QueerPulse-hosted music events (`features/admin/musicEvents`).
  "governance.audit.actionType.music_event_created": "Music event created",
  "governance.audit.actionType.music_event_updated": "Music event edited",
  "governance.audit.actionType.music_event_cancelled": "Music event cancelled",
  "governance.audit.actionType.music_event_lineup_changed":
    "Music event lineup changed",
  "governance.audit.actionType.music_event_announcement_posted":
    "Music event announcement posted",
  "governance.audit.actionType.music_event_guest_removed":
    "Music event guest removed",
  "governance.audit.actionType.music_event_guest_barred":
    "Music event guest banned",
  "governance.audit.actionType.music_event_guest_bar_lifted":
    "Music event ban lifted",
  "governance.audit.actionType.music_event_waitlist_promoted":
    "Music event waitlist promotion",
  "governance.audit.actionType.music_event_invites_sent":
    "Music event invites sent",
  "governance.audit.actionType.music_event_invite_decided":
    "Music event invite request answered",
  "governance.audit.actionType.music_event_cohost_added":
    "Music event cohost added",
  "governance.audit.actionType.music_event_cohost_removed":
    "Music event cohost removed",
  "governance.audit.actionType.music_event_go_together_changed":
    "Music event Go Together changed",
  "governance.audit.actionType.music_event_guests_exported":
    "Music event guests exported",
  // Community sanctions (`CommunityGovernanceLogService` callers).
  "governance.audit.actionType.community_ban_applied": "Community ban applied",
  "governance.audit.actionType.community_ban_lifted": "Community ban lifted",
  "governance.audit.actionType.community_member_removed":
    "Community member removed",
  // Staff actions on a forum thread (`ForumThreadsService`).
  "governance.audit.actionType.thread_locked": "Thread closed to replies",
  "governance.audit.actionType.thread_unlocked": "Thread reopened",
  "governance.audit.actionType.thread_pinned": "Thread pinned",
  "governance.audit.actionType.thread_unpinned": "Thread unpinned",
  "governance.audit.actionType.thread_official_set": "Thread marked official",
  "governance.audit.actionType.thread_official_cleared":
    "Thread no longer official",
  "governance.audit.actionType.thread_deleted": "Thread deleted",
  // Staff actions in messaging (`ReportConversationContextService`,
  // `staff-message-deletion.ts`) and official messages
  // (`official-messages.constants.ts`). Toned ghost in `ACTION_TONE`.
  "governance.audit.actionType.conversation_context_viewed":
    "Conversation context viewed",
  "governance.audit.actionType.creator_draft_viewed": "Creator draft viewed",
  "governance.audit.actionType.message_deleted_by_staff":
    "Message deleted for everyone",
  "governance.audit.actionType.official_message_sent": "Official message sent",
  "governance.audit.actionType.official_broadcast_sent":
    "Official broadcast sent",
  // Studio staff decisions (`STUDIO_AUDIT_ACTIONS` in the backend).
  "governance.audit.actionType.studio_access_granted": "Studio access granted",
  "governance.audit.actionType.studio_access_revoked": "Studio access revoked",
  "governance.audit.actionType.studio_release_taken_down":
    "Studio release taken down",
  "governance.audit.actionType.studio_release_restored":
    "Studio release restored",
  "governance.audit.actionType.studio_release_dispute_upheld":
    "Studio dispute upheld",
  "governance.audit.actionType.studio_release_dispute_rejected":
    "Studio dispute rejected",
  "governance.audit.actionType.studio_track_marked_explicit":
    "Studio track marked explicit",
  "governance.audit.actionType.studio_track_warning_added":
    "Studio content warning added",
  "governance.audit.actionType.studio_copyright_claim_accepted":
    "Copyright claim accepted",
  "governance.audit.actionType.studio_copyright_claim_declined":
    "Copyright claim declined",
  "governance.audit.actionType.studio_copyright_claim_upheld":
    "Copyright claim upheld",
  "governance.audit.actionType.studio_copyright_claim_rejected":
    "Copyright claim rejected",
  // Early access grants (`early_access_*` in the backend early-access module).
  "governance.audit.actionType.early_access_granted": "Early access turned on",
  "governance.audit.actionType.early_access_revoked": "Early access revoked",
  "governance.audit.range.today": "Today",
  "governance.audit.range.week": "This week",
  "governance.audit.range.quarter": "This quarter",
  "governance.audit.emptyTitle": "No entries match",
  "governance.audit.emptyText":
    "No moderation actions match these filters yet. Try widening them.",
  "governance.audit.pagerMeta": "Showing {start}–{end} of {total} entries",
  "governance.audit.prevPage": "Previous page",
  "governance.audit.nextPage": "Next page",
  "governance.audit.entryModal.eyebrow": "Audit entry",
  "governance.audit.entryModal.actedWhen": "acted {when}",
  "governance.audit.entryModal.subject": "Subject",
  "governance.audit.entryModal.reasonGiven": "Reason given to the member",
  "governance.audit.entryModal.note":
    "The affected member was shown this reason and given the right to appeal. This entry can never be edited or deleted.",

  // ── Partner applications ──────────────────────────────────────────────────
  // PRD-266: the old For Organisations form's partner rows are not orphaned,
  // they live in the intake console under Inquiries. This cross-links them so
  // staff stop working two queues for one pipeline.
  "partners.legacyInquiries":
    "Partner messages sent through the old For Organisations form live in the <a>intake console</a>, under Inquiries, filtered by the partner kind.",
  // PRD-263: the staff edit modal widened from the testimonial trio to the
  // whole profile. Tier, since and the card kicker stay staff-only because
  // they are claims about the relationship rather than facts about the org.
  "partnerProfile.name": "Organisation name",
  "partnerProfile.tier": "Partnership tier",
  "partnerProfile.since": "Partner since",
  "partnerProfile.eyebrow": "Card kicker",
  "partnerProfile.tagline": "Tagline",
  "partnerProfile.desc": "Short description",
  "partnerProfile.city": "City",
  "partnerProfile.regionLabel": "Region label",
  "partnerProfile.phone": "Phone",
  "partnerProfile.phoneNote": "When to call",
  "partnerProfile.email": "Contact email",
  "partnerProfile.website": "Website",
  "partnerProfile.address": "Address",
  "partners.title": "Partner applications · <em>review</em>",
  "partners.header.eyebrow": "Partnerships",
  "partners.header.title": "Who wants to <em>partner</em>.",
  "partners.header.sub":
    "Organisations that applied to partner with QueerPulse. Read what they do, then approve them onto the public partners page or set the application aside, with a note they'll read.",
  "partners.forbidden": "This queue is for admins only.",
  "partners.loadError": "The queue couldn't load right now. Please try again.",
  "partners.errorToast": "Could not save that decision. Please try again",
  "partners.approvedToast": "{name} is now a partner",
  "partners.rejectedToast": "{name}'s application was set aside",
  "partners.emptyText":
    "Nothing waiting. Every application has had a decision.",
  "partners.intro":
    "These organisations asked to partner with us. Approving one lists it on the public partners page.",
  "partners.card.noteLabel": "A note for {name} (optional)",
  "partners.card.notePlaceholder":
    "What would help them re-apply, or why this isn't a fit right now.",
  "partners.card.backCta": "Back",
  "partners.card.setAsideCta": "Set aside",
  "partners.card.approveCta": "Approve as partner",

  // ── Mod panel (/mod/:slug) ─────────────────────────────────────────────────
  "modPanel.pageTitle": "Mod tools",
  "modPanel.adminPageTitle": "Mod panel",
  "modPanel.tabs.requests": "Requests",
  "modPanel.tabs.reports": "Reports",
  "modPanel.tabs.members": "Members",
  "modPanel.tabs.settings": "Settings",
  "modPanel.notFound.title": "Community not found",
  "modPanel.notFound.description":
    "We couldn't find that community. It may have been archived.",

  "modPanel.requests.searchPlaceholder": "Search by name…",
  "modPanel.requests.approveAllCta": "Approve all ({count})",
  "modPanel.requests.sectionLabel": "Requests",
  // ENG-41: reaching a request past the first page of the queue.
  "modPanel.requests.loadMore": "Load more requests",
  "modPanel.requests.loadingMore": "Loading…",
  "modPanel.requests.emptyTitle": "No requests waiting",
  "modPanel.requests.emptyDesc":
    "You're all caught up. New requests will appear here.",
  "modPanel.requests.requestedAgo": "Requested {time} ago",
  "modPanel.requests.approveCta": "Approve",
  "modPanel.requests.declineCta": "Decline",
  "modPanel.requests.approveAriaLabel": "Approve {name}",
  "modPanel.requests.declineAriaLabel": "Decline {name}",
  "modPanel.requests.approvedToast": "{name} approved. Welcome them in.",
  "modPanel.requests.declinedToast":
    "{name}'s request wasn't approved this time.",
  "modPanel.requests.approvedAllToast":
    "All {count} requests approved. The community grows.",

  "modPanel.reports.sectionLabel": "Reported posts",
  "modPanel.reports.emptyTitle": "All clear",
  "modPanel.reports.emptyDesc":
    "Nothing has been flagged. The community looks after each other.",
  "modPanel.reports.metaLine":
    "From {author} · flagged by {reporter} · {time} ago",
  // Live reports carry no author/reporter identity (leaner backend shape) —
  // this is the fallback when those fields are missing.
  "modPanel.reports.metaLiveLine": "Flagged · {time} ago",
  "modPanel.reports.removeCta": "Remove post",
  "modPanel.reports.dismissCta": "Dismiss",
  // What a community owner/mod can actually do from here, and where the rest of
  // it is decided. Warn / suspend / escalate need a platform moderator role.
  "modPanel.reports.escalationNote":
    "You can take a post down or dismiss a report here. Warnings, suspensions and escalations are decided by the QueerPulse moderation team, and every open report is already in their queue.",
  "modPanel.reports.replyNote":
    "This report is about a reply. You can dismiss it here, and removing the reply itself happens in the thread.",
  "modPanel.reports.openInQueueCta": "Open in the moderation queue",
  "modPanel.reports.removedToast": "Post removed and the report closed.",
  "modPanel.reports.removeErrorToast": "Couldn't remove that post",
  "modPanel.reports.dismissedToast": "Report dismissed. The post stays up.",

  "modPanel.members.searchPlaceholder": "Search members…",
  "modPanel.members.roleFilter.all": "All",
  "modPanel.members.roleFilter.mod": "Mods",
  "modPanel.members.roleFilter.member": "Members",
  "modPanel.members.sectionLabel": "Members",
  "modPanel.members.makeModCta": "Make mod",
  "modPanel.members.removeModCta": "Remove mod",
  "modPanel.members.removeCta": "Remove",
  "modPanel.members.makeModAriaLabel": "Make mod: {name}",
  "modPanel.members.removeModAriaLabel": "Remove mod: {name}",
  "modPanel.members.removeAriaLabel": "Remove {name}",
  "modPanel.members.ownerTag": "Owner",
  "modPanel.members.promotedToast": "{name} is now a mod.",
  "modPanel.members.demotedToast": "{name} is no longer a mod.",
  "modPanel.members.removedToast":
    "{name} has been removed from the community.",

  "modPanel.settings.nameLabel": "Community name",
  "modPanel.settings.descLabel": "Description",
  "modPanel.settings.descPlaceholder":
    "Briefly describe what this community is about…",
  "modPanel.settings.modeLabel": "Membership mode",
  "modPanel.settings.mode.open": "Open",
  "modPanel.settings.mode.request": "Request to join",
  "modPanel.settings.mode.invite": "Invite only",
  "modPanel.settings.rulesLabel": "Community rules",
  "modPanel.settings.rulesPlaceholder": "Enter rules, one per line…",
  "modPanel.settings.saveCta": "Save settings",
  "modPanel.settings.savedToast": "Community settings saved.",
  "modPanel.settings.errorToast":
    "That didn't go through. Please try again in a moment.",
  "modPanel.settings.cancel": "Cancel",
  "modPanel.settings.dangerZone": "Danger zone",
  "modPanel.settings.irreversible": "Irreversible actions",
  "modPanel.settings.archive.title": "Archive community",
  "modPanel.settings.archive.desc":
    "Take the community down. Members keep their history, but it leaves discovery and no one can post.",
  "modPanel.settings.archive.cta": "Archive",
  "modPanel.settings.archive.toast": "Community archived.",
  "modPanel.settings.archive.confirm.title": "Archive this community?",
  "modPanel.settings.archive.confirm.body":
    "This takes the community down for everyone. Members keep their history, but it disappears from discovery and no new posts can be made. Only you, as the owner, can do this.",
  "modPanel.settings.archive.confirm.cta": "Yes, archive it",
  "modPanel.settings.transfer.title": "Transfer ownership",
  "modPanel.settings.transfer.desc":
    "Hand the community to another member. You'll step down to moderator.",
  "modPanel.settings.transfer.cta": "Transfer",
  "modPanel.settings.transfer.toast":
    "Ownership transferred. You're now a moderator here.",
  "modPanel.settings.transfer.modal.title": "Transfer ownership",
  "modPanel.settings.transfer.modal.body":
    "Choose the member to become the new owner. You'll stay on as a moderator.",
  "modPanel.settings.transfer.modal.pickLabel": "Choose the new owner",
  "modPanel.settings.transfer.modal.emptyTitle": "No one to hand it to yet",
  "modPanel.settings.transfer.modal.emptyDesc":
    "You need at least one other member before you can transfer ownership.",
  "modPanel.settings.transfer.modal.cta": "Transfer ownership",

  // ── Vouch graph (trust-network visualisation) ─────────────────────────────
  "vouchGraph.modes.network": "Network",
  "vouchGraph.loadError.title": "The trust network didn't load",
  "vouchGraph.loadError.body":
    "This is an outage on our side, so the graph is empty because nothing arrived. Try again.",
  "vouchGraph.modes.scenes": "Scenes",
  "vouchGraph.modes.safety": "Safety",
  "vouchGraph.pathbar.stepPath_one": "{count}-step trust path:",
  "vouchGraph.pathbar.stepPath_other": "{count}-step trust path:",
  "vouchGraph.pathbar.noPath":
    "No active trust path between {a} and {b} at this point in the timeline",
  "vouchGraph.pathbar.fromHint":
    "Path from {name}. Shift-click a second person",
  "vouchGraph.pathbar.clearCta": "Clear path",

  "vouchGraph.legend.safety.ring": "Suspected ring",
  "vouchGraph.legend.safety.isolated": "Trust-isolated",
  "vouchGraph.legend.safety.reported": "Has reports",
  "vouchGraph.legend.safety.withdrawn": "Withdrawn vouch",
  "vouchGraph.legend.plain.trusted": "Trusted",
  "vouchGraph.legend.plain.verified": "Verified",
  "vouchGraph.legend.plain.mutual": "Mutual vouch",
  "vouchGraph.legend.plain.invited": "Invited",
  "vouchGraph.legend.plain.vouched": "Vouched after",
  "vouchGraph.legend.plain.withdrawn": "Withdrawn vouch",
  "vouchGraph.legend.plain.anonymous": "Anonymous",
  "vouchGraph.legend.plain.private": "Private network",

  "vouchGraph.relationship.collaborated": "Collaborated",
  "vouchGraph.relationship.friends": "Friends",
  "vouchGraph.relationship.group": "Same group",
  "vouchGraph.relationship.met_through": "Met through QueerPulse",
  "vouchGraph.relationship.neighbours": "Neighbours",

  "vouchGraph.edgeKind.invite": "Invited",
  "vouchGraph.edgeKind.vouch": "Vouched after",

  "vouchGraph.modal.ariaLabel": "Trust network",
  "vouchGraph.modal.eyebrow": "Trust network",
  "vouchGraph.modal.legendToggle": "Legend",
  "vouchGraph.modal.replayCta": "Replay",
  "vouchGraph.modal.replayStart": "Before anyone connected",
  "vouchGraph.modal.timeCutAriaLabel": "Connection timeline",
  "vouchGraph.modal.verifyToast": "{name} is verified.",
  "vouchGraph.modal.verifyFailedToast":
    "That didn't save. Check your connection and try again.",
  "vouchGraph.modal.privateToast": "This member keeps their network private",
  "vouchGraph.modal.loadingTitle": "Loading trust network…",
  "vouchGraph.modal.emptyTitle": "No trust network yet",
  "vouchGraph.modal.emptyBody":
    "This member doesn't have any vouches on record.",
  "vouchGraph.modal.truncatedNotice":
    "Showing the 500 members closest to {name}. Search to reach anyone else.",

  "vouchGraph.inspector.emptyTitle": "Pick anyone",
  "vouchGraph.inspector.emptyBody":
    "Click a node to read who trusts them and what that trust is built on. Double-click to walk the network from there.",
  "vouchGraph.inspector.sealed": "Legacy identity sealed, chosen name only",
  "vouchGraph.inspector.ringBanner.title": "Part of a suspected vouch ring",
  "vouchGraph.inspector.isolationBanner.title": "Trust isolation",
  "vouchGraph.inspector.isolationBanner.body":
    "Every vouch this member holds comes from accounts that are new to our community or flagged. Verify with extra care.",
  "vouchGraph.inspector.reportsBanner.title_one": "{count} report on record",
  "vouchGraph.inspector.reportsBanner.title_other": "{count} reports on record",
  "vouchGraph.inspector.reportsBanner.body":
    "Open the member's moderation history before acting.",
  "vouchGraph.inspector.privateBanner.title": "Network kept private",
  "vouchGraph.inspector.privateBanner.body":
    "This member has chosen to hide their vouch graph. Respect it. Don't work around it.",
  "vouchGraph.inspector.none": "None yet.",
  "vouchGraph.inspector.mutualTag": "mutual",
  "vouchGraph.inspector.affectedTitle": "If you removed {name}",
  "vouchGraph.inspector.affectedCount_one":
    "{count} member would lose a vouch from them.",
  "vouchGraph.inspector.affectedCount_other":
    "{count} members would lose a vouch from them.",
  "vouchGraph.inspector.useAsVerificationCta": "Use as verification basis",
  "vouchGraph.inspector.verifiedCta": "Verified",
  "vouchGraph.inspector.citeCta": "Cite",
  "vouchGraph.inspector.expandCta": "Expand network",
  "vouchGraph.inspector.collapseCta": "Collapse network",

  "vouchGraph.citeDialog.title": "Cite evidence: {name}",
  "vouchGraph.citeDialog.description":
    "Attach a note to this member's audit trail. Moderators and admins reviewing their record will see it.",
  "vouchGraph.citeDialog.noteLabel": "Evidence note",
  "vouchGraph.citeDialog.confirmCta": "Cite",
  "vouchGraph.citeDialog.defaultNoteWithEdge":
    "Vouch edge between {focusName} and {personName}, {relation}, confirmed {when}.",
  "vouchGraph.citeDialog.defaultNoteNoEdge":
    "Reviewed {personName}'s trust network in the graph inspector, confirmed {when}.",
  "vouchGraph.citeDialog.relationMutual": "mutual",
  "vouchGraph.citeDialog.relationVouched": "one-way vouch",
  "vouchGraph.citeDialog.successToast": "Cited {name} in the audit trail.",
  "vouchGraph.citeDialog.failedToast":
    "That didn't save. Check your connection and try again.",

  "vouchGraph.tooltip.vouchesIn_one": "{count} vouch in",
  "vouchGraph.tooltip.vouchesIn_other": "{count} vouches in",
  "vouchGraph.tooltip.vouchesOut_one": "{count} out",
  "vouchGraph.tooltip.vouchesOut_other": "{count} out",
  "vouchGraph.tooltip.joinedPrefix": "joined {when}",
  "vouchGraph.tooltip.hint": "click to inspect · double-click to re-centre",
  "vouchGraph.tooltip.withdrawn": "withdrawn {date}",

  "vouchGraph.canvas.hint.plain":
    "Drag to move · scroll to zoom · double-click to walk · shift-click two for a path",
  "vouchGraph.canvas.hint.clusters":
    "Scenes view: nodes coloured by the community each member belongs to.",
  "vouchGraph.canvas.hint.safety":
    "Safety view: rings, isolation and reports are surfaced. Red clusters are closed vouch loops.",
  "vouchGraph.canvas.zoomIn": "Zoom in",
  "vouchGraph.canvas.zoomOut": "Zoom out",
  "vouchGraph.canvas.fitToView": "Fit to view",
  "vouchGraph.canvas.resetLayout": "Reset layout",

  "vouchGraph.preview.ariaLabel_one":
    "Trust network for {name}: {count} direct vouch connection",
  "vouchGraph.preview.ariaLabel_other":
    "Trust network for {name}: {count} direct vouch connections",
  "vouchGraph.preview.legend.inbound": "Trusts them",
  "vouchGraph.preview.legend.outbound": "They vouch for",
  "vouchGraph.preview.legend.mutual": "Mutual",
  "vouchGraph.modes.invites": "Invites",
  "vouchGraph.modes.safetyBadgeAria_one": "{count} case to review",
  "vouchGraph.modes.safetyBadgeAria_other": "{count} cases to review",
  "vouchGraph.modes.ariaLabel": "Network view",
  "vouchGraph.search.placeholder": "Find a member…",
  "vouchGraph.search.ariaLabel":
    "Find a member in this graph or across QueerPulse",
  "vouchGraph.search.groupInGraph": "In this graph",
  "vouchGraph.search.groupAllMembers": "All members",
  "vouchGraph.search.noMatches": "No members match that name.",
  "vouchGraph.search.searching": "Searching all members…",
  "vouchGraph.search.typeMore": "Type two letters to search all members.",
  "vouchGraph.search.matchCount_one": "{count} match in this graph",
  "vouchGraph.search.matchCount_other": "{count} matches in this graph",
  "vouchGraph.search.clearCta": "Clear search",
  "vouchGraph.filters.openCta": "Filter network",
  "vouchGraph.filters.activeCount_one": "{count} filter on",
  "vouchGraph.filters.activeCount_other": "{count} filters on",
  "vouchGraph.filters.title": "Filter the network",
  "vouchGraph.filters.standing": "Standing",
  "vouchGraph.filters.standing.trusted": "Trusted",
  "vouchGraph.filters.standing.warned": "Warned",
  "vouchGraph.filters.standing.new": "New",
  "vouchGraph.filters.standing.flagged": "Flagged",
  "vouchGraph.filters.scene": "Scene",
  "vouchGraph.filters.sceneAll": "All scenes",
  "vouchGraph.filters.verifiedOnly": "Verified members only",
  "vouchGraph.filters.dateRange": "Connected",
  "vouchGraph.filters.dateFrom": "From",
  "vouchGraph.filters.dateTo": "To",
  "vouchGraph.filters.dateAnyTime": "Any time",
  "vouchGraph.filters.dateLast3Months": "Last 3 months",
  "vouchGraph.filters.dateLast12Months": "Last 12 months",
  "vouchGraph.filters.dateCustom": "Custom",
  "vouchGraph.filters.edgeKinds": "Connection type",
  "vouchGraph.filters.edgeKind.invite": "Invites",
  "vouchGraph.filters.edgeKind.vouch": "Vouches",
  "vouchGraph.filters.edgeKind.mutual": "Mutual vouches",
  "vouchGraph.filters.hideWithdrawn": "Hide withdrawn vouches",
  "vouchGraph.filters.clearCta": "Clear filters",
  "vouchGraph.filters.closeCta": "Close filters",
  "vouchGraph.filters.emptyResult":
    "No one matches these filters. Clear a filter to see more of the network.",
  "vouchGraph.actions.listViewCta": "View as list",
  "vouchGraph.actions.graphViewCta": "View as graph",
  "vouchGraph.actions.copyLinkCta": "Copy view link",
  "vouchGraph.actions.copyLinkToast":
    "Link copied. Anyone on the admin team can open this view.",
  "vouchGraph.actions.copyLinkFailedToast":
    "Couldn't copy the link. Copy it from the address bar.",
  "vouchGraph.actions.downloadPngCta": "Download PNG",
  "vouchGraph.actions.downloadSvgCta": "Download SVG",
  "vouchGraph.actions.exportFailedToast":
    "The image didn't download. Try again.",
  "vouchGraph.actions.menuAriaLabel": "View options",
  "vouchGraph.actions.shareMenuCta": "Share or download this view",
  "vouchGraph.modal.replayFull_one": "Full network · {count} connection",
  "vouchGraph.modal.replayFull_other": "Full network · {count} connections",
  "vouchGraph.canvas.hint.keyboard":
    "Keys: Enter selects · Shift+Enter picks a path end · W walks the network from there",
  "vouchGraph.canvas.hint.plainNoPath":
    "Drag to move · scroll to zoom · double-click to walk",
  "vouchGraph.canvas.hint.touch":
    "Drag to move · tap to select · double tap to walk the network from there · zoom with the buttons",
  "vouchGraph.canvas.hint.toggle": "Show graph tips",
  "vouchGraph.canvas.bubbleLabel_one": "{count} invited",
  "vouchGraph.canvas.bubbleLabel_other": "{count} invited",
  "vouchGraph.canvas.bubbleAria_one": "Show {count} member invited by {name}",
  "vouchGraph.canvas.bubbleAria_other":
    "Show {count} members invited by {name}",
  "vouchGraph.canvas.bubbleCollapseLabel": "Hide invited",
  "vouchGraph.canvas.bubbleCollapseAria_one":
    "Hide the {count} member invited by {name}",
  "vouchGraph.canvas.bubbleCollapseAria_other":
    "Hide the {count} members invited by {name}",
  "vouchGraph.canvas.svgLabel": "Trust network graph for {name}",
  "vouchGraph.tooltip.hintKeyboard": "Enter to inspect · W to walk from here",
  "vouchGraph.summary.people_one": "{name}'s network shows {count} person.",
  "vouchGraph.summary.people_other": "{name}'s network shows {count} people.",
  "vouchGraph.summary.relations":
    "Mutual: {mutual}. Vouched for {name}: {vouchedBy}. Vouched for by {name}: {vouchedFor}. Invited by {name}: {invited}.",
  "vouchGraph.summary.cases_one": "{count} safety flag in view.",
  "vouchGraph.summary.cases_other": "{count} safety flags in view.",
  "vouchGraph.summary.path": "Trust path: {sentence}",
  "vouchGraph.path.first.vouch": "{from} vouched for {to}",
  "vouchGraph.path.first.invite": "{from} invited {to}",
  "vouchGraph.path.first.vouchBackward": "{from} was vouched for by {to}",
  "vouchGraph.path.first.inviteBackward": "{from} was invited by {to}",
  "vouchGraph.path.next.vouch": "who vouched for {to}",
  "vouchGraph.path.next.invite": "who invited {to}",
  "vouchGraph.path.next.vouchBackward": "who was vouched for by {to}",
  "vouchGraph.path.next.inviteBackward": "who was invited by {to}",
  "vouchGraph.path.undirected": "Undirected path: {sentence}",
  "vouchGraph.window.underHour": "an hour",
  "vouchGraph.window.hours_one": "{count} hour",
  "vouchGraph.window.hours_other": "{count} hours",
  "vouchGraph.window.days_one": "{count} day",
  "vouchGraph.window.days_other": "{count} days",
  "vouchGraph.inspector.accountKind.founder": "Founding member",
  "vouchGraph.inspector.accountKind.staff": "Staff",
  "vouchGraph.inspector.accountKind.system": "Platform account",
  "vouchGraph.inspector.ringBanner.bodyWindow_one":
    "{count} account created within {window}, vouching only inside the loop: a closed loop with no outside trust.",
  "vouchGraph.inspector.ringBanner.bodyWindow_other":
    "{count} accounts created within {window}, vouching only for each other: a closed loop with no outside trust.",
  "vouchGraph.inspector.ringBanner.sharedVouchers":
    "Also vouched for by {names}.",
  "vouchGraph.inspector.ringBanner.noSharedVouchers":
    "No one outside the loop vouches for them.",
  "vouchGraph.inspector.ringBanner.showLoopCta": "Show the loop",
  "vouchGraph.inspector.isolationBanner.causesTitle": "Their vouches come from",
  "vouchGraph.inspector.isolationBanner.reason.new_one":
    "joined in the last day",
  "vouchGraph.inspector.isolationBanner.reason.new_other":
    "joined in the last {count} days",
  "vouchGraph.inspector.isolationBanner.reason.flagged": "flagged",
  "vouchGraph.inspector.isolationBanner.reason.ring": "in a suspected ring",
  "vouchGraph.inspector.isolationBanner.causeLine": "{name} ({reason})",
  "vouchGraph.inspector.trackRecord.title": "Track record",
  "vouchGraph.inspector.trackRecord.given_one": "Vouched for {count} member",
  "vouchGraph.inspector.trackRecord.given_other": "Vouched for {count} members",
  "vouchGraph.inspector.trackRecord.flagged_one":
    "{count} later flagged or suspended",
  "vouchGraph.inspector.trackRecord.flagged_other":
    "{count} later flagged or suspended",
  "vouchGraph.inspector.trackRecord.clean": "None later flagged or suspended",
  "vouchGraph.inspector.trackRecord.compact":
    "{flagged} of {given} later flagged or suspended",
  "vouchGraph.inspector.affected.soleTitle_one":
    "{count} would lose their only vouch:",
  "vouchGraph.inspector.affected.soleTitle_other":
    "{count} would lose their only vouch:",
  "vouchGraph.inspector.affected.more_one": "and {count} more",
  "vouchGraph.inspector.affected.more_other": "and {count} more",
  "vouchGraph.inspector.affected.pendingNote_one":
    "{count} of them is a pending member who relies on this vouch.",
  "vouchGraph.inspector.affected.pendingNote_other":
    "{count} of them are pending members who rely on this vouch.",
  "vouchGraph.inspector.affected.receivedStay_one":
    "The {count} vouch they received stays on record.",
  "vouchGraph.inspector.affected.receivedStay_other":
    "The {count} vouches they received stay on record.",
  "vouchGraph.inspector.affected.weighCost":
    "Weigh the human cost before acting.",
  "vouchGraph.inspector.story.title": "How they're connected",
  "vouchGraph.inspector.story.vouchedByList": "Vouched for by {names}",
  "vouchGraph.inspector.story.voucher.plain": "{name} ({when})",
  "vouchGraph.inspector.story.voucher.verified": "{name} (verified, {when})",
  "vouchGraph.inspector.story.lead.invitedBy": "Invited by {name} in {when}",
  "vouchGraph.inspector.story.more.invitedBy": "invited by {name}",
  "vouchGraph.inspector.joinPath.title": "How {name} joined",
  "vouchGraph.inspector.joinPath.founder":
    "Founding member, here since the start",
  "vouchGraph.inspector.joinPath.invite": "Invited by {name}",
  "vouchGraph.inspector.joinPath.application": "Application approved by {name}",
  "vouchGraph.inspector.joinPath.applicationNoReviewer": "Application approved",
  "vouchGraph.inspector.joinPath.unknown":
    "We don't have a record of how they joined",
  "vouchGraph.inspector.joinPath.joinedOn": "Joined {when}",
  "vouchGraph.inspector.joinPath.noVouches":
    "No vouches yet, given or received.",
  "vouchGraph.inspector.joinPath.showInviterCta": "Show {name} in the network",
  "vouchGraph.inspector.sheet.expandAria": "Show more about this member",
  "vouchGraph.inspector.sheet.collapseAria": "Show less",
  "vouchGraph.inspector.tabs.ariaLabel": "Connections",
  "vouchGraph.inspector.tabs.vouchedByLabel": "Vouched by",
  "vouchGraph.inspector.tabs.vouchedForLabel": "Vouched for",
  "vouchGraph.inspector.tabs.invitedLabel": "Invited",
  "vouchGraph.inspector.chip.mutual": "Mutual",
  "vouchGraph.inspector.chip.invitedThem": "Invited them",
  "vouchGraph.inspector.list.searchPlaceholder": "Filter by name…",
  "vouchGraph.inspector.list.searchAriaLabel":
    "Filter these connections by name",
  "vouchGraph.inspector.list.sortLabel": "Sort",
  "vouchGraph.inspector.list.sort.name": "Name A to Z",
  "vouchGraph.inspector.list.sort.newest": "Newest first",
  "vouchGraph.inspector.list.sort.oldest": "Oldest first",
  "vouchGraph.inspector.list.noMatches": "No one by that name here.",
  "vouchGraph.inspector.list.withdrawnTag": "Withdrawn",
  "vouchGraph.inspector.list.outsideView_one": "{count} more outside this view",
  "vouchGraph.inspector.list.outsideView_other":
    "{count} more outside this view",
  "vouchGraph.triage.title": "Cases to review",
  "vouchGraph.triage.count_one": "{count} open case",
  "vouchGraph.triage.count_other": "{count} open cases",
  "vouchGraph.triage.empty":
    "Nothing to review right now. Rings, isolated members and flagged accounts show up here.",
  "vouchGraph.triage.listAriaLabel": "Cases ranked by urgency",
  "vouchGraph.triage.kind.ring": "Suspected ring",
  "vouchGraph.triage.kind.isolated": "Trust isolation",
  "vouchGraph.triage.kind.flagged": "Flagged account",
  "vouchGraph.triage.reason.ring_one":
    "{count} account created within {window}",
  "vouchGraph.triage.reason.ring_other":
    "{count} accounts created within {window}",
  "vouchGraph.triage.reason.ringNoWindow_one": "{count} account created",
  "vouchGraph.triage.reason.ringNoWindow_other": "{count} accounts created",
  "vouchGraph.triage.reason.isolated_one":
    "Their only vouch comes from a new or flagged account",
  "vouchGraph.triage.reason.isolated_other":
    "All {count} vouches come from new or flagged accounts",
  "vouchGraph.triage.reason.flagged_one": "{count} open report",
  "vouchGraph.triage.reason.flagged_other": "{count} open reports",
  "vouchGraph.triage.rowAria": "Focus the network on {name}: {reason}",
  "vouchGraph.triage.outsideView": "Outside this view",
  "vouchGraph.compare.title": "Comparing {a} and {b}",
  "vouchGraph.compare.pathTitle": "Trust path",
  "vouchGraph.compare.sharedVouchers": "Shared vouchers",
  "vouchGraph.compare.noSharedVouchers": "No one vouches for both.",
  "vouchGraph.compare.joinGap_one": "Joined {count} day apart",
  "vouchGraph.compare.joinGap_other": "Joined {count} days apart",
  "vouchGraph.compare.joinGapSameDay": "Joined on the same day",
  "vouchGraph.compare.sharedScenes": "Shared scenes",
  "vouchGraph.compare.noSharedScenes": "No scenes in common.",
  "vouchGraph.compare.clearCta": "Clear comparison",
  "vouchGraph.inviteTree.title": "Who invited whom",
  "vouchGraph.inviteTree.groupFounders": "Founding members",
  "vouchGraph.inviteTree.groupOutside": "Invited by someone outside this view",
  "vouchGraph.inviteTree.groupApplications": "Joined by application",
  "vouchGraph.inviteTree.groupUnknown": "No join record",
  "vouchGraph.inviteTree.invitedCount_one": "invited {count}",
  "vouchGraph.inviteTree.invitedCount_other": "invited {count}",
  "vouchGraph.inviteTree.expandAria_one":
    "Show {count} member invited by {name}",
  "vouchGraph.inviteTree.expandAria_other":
    "Show {count} members invited by {name}",
  "vouchGraph.inviteTree.collapseAria": "Hide the members invited by {name}",
  "vouchGraph.inviteTree.showInNetworkCta": "Show in network",
  "vouchGraph.inviteTree.empty": "No invites in this view yet.",
  "vouchGraph.listView.caption": "Everyone in {name}'s network view",
  "vouchGraph.listView.col.name": "Member",
  "vouchGraph.listView.col.relation": "Connection",
  "vouchGraph.listView.col.standing": "Standing",
  "vouchGraph.listView.col.joined": "Joined",
  "vouchGraph.listView.col.flags": "Flags",
  "vouchGraph.listView.relation.focus": "In focus",
  "vouchGraph.listView.relation.mutual": "Mutual vouch",
  "vouchGraph.listView.relation.vouchedBy": "Vouches for {name}",
  "vouchGraph.listView.relation.vouchedFor": "Vouched for by {name}",
  "vouchGraph.listView.relation.invited": "Invited by {name}",
  "vouchGraph.listView.relation.withdrawnOnly": "Withdrawn vouch",
  "vouchGraph.listView.relation.secondHop": "Second-degree connection",
  "vouchGraph.listView.selectAria": "Select {name}",
  "vouchGraph.listView.sortByNameCta": "Sort by name",
  "vouchGraph.citeDialog.viewLinkLine": "Trust network view: {url}",

  // ── Platform settings (/admin/settings) ───────────────────────────────────
  "settings.breadcrumb": "Settings",
  "settings.eyebrow": "Platform",
  "settings.title": "Platform settings",
  "settings.sub":
    "Emergency controls for registration and access. Changes take effect within about 10 seconds.",
  "settings.tab.access": "Access",
  "settings.tab.history": "History",

  "settings.registration.title": "New account registration",
  "settings.registration.sub":
    "When off, nobody can create a new account. People who already have one sign in as normal.",
  "settings.joinRequests.title": "Invite requests",
  "settings.joinRequests.sub":
    "When off, the public “request an invite” form stops accepting submissions.",
  "settings.closedMessage.label": "Message shown when signups are closed",
  "settings.closedMessage.placeholder":
    "Explain briefly why signups are paused.",

  "settings.lockdown.title": "Platform lockdown",
  "settings.lockdown.sub":
    "Blocks the platform for everyone except you and other admins. Members stay signed in and see a maintenance screen.",
  "settings.lockdown.allowMods": "Also allow moderators through",
  "settings.lockdown.allowModsSub":
    "Useful during an incident. Moderators are usually the people cleaning it up.",
  "settings.lockdown.message.label": "Maintenance message",
  "settings.lockdown.message.placeholder":
    "What members will see while the platform is locked.",
  "settings.lockdown.youKeepAccess":
    "You are an admin, so you will keep full access.",

  "settings.presets.label": "Start from a preset",
  "settings.presets.hint": "Presets fill the box. Edit freely before saving.",

  // Lockdown message presets. Selecting one FILLS the textarea; the saved value
  // is always free text, so the backend never needs to know presets exist.
  "settings.presets.lockdown.scheduled.label": "Scheduled maintenance",
  "settings.presets.lockdown.scheduled.body":
    "QueerPulse is down for planned maintenance. We’ll be back shortly. Thanks for your patience.",
  "settings.presets.lockdown.emergency.label": "Emergency maintenance",
  "settings.presets.lockdown.emergency.body":
    "We’ve taken QueerPulse offline briefly to fix an unexpected problem. We’re on it.",
  "settings.presets.lockdown.security.label": "Security incident",
  "settings.presets.lockdown.security.body":
    "QueerPulse is temporarily locked while we investigate a security issue. Your account is safe; we’ll share more as soon as we can.",
  "settings.presets.lockdown.spam.label": "Spam / abuse wave",
  "settings.presets.lockdown.spam.body":
    "We’ve paused the platform while we clear out a wave of spam accounts. Back very soon.",
  "settings.presets.lockdown.deploy.label": "Deploying an update",
  "settings.presets.lockdown.deploy.body":
    "We’re rolling out an update. QueerPulse will be back in a few minutes.",
  "settings.presets.lockdown.safety.label": "Community safety pause",
  "settings.presets.lockdown.safety.body":
    "QueerPulse is paused while the team addresses a community safety matter. We’ll update everyone directly.",

  "settings.presets.closed.spam.label": "Spam response",
  "settings.presets.closed.spam.body":
    "New signups are paused while we deal with a wave of spam accounts. Please check back soon.",
  "settings.presets.closed.capacity.label": "At capacity",
  "settings.presets.closed.capacity.body":
    "We’ve temporarily paused new signups while we catch up with our current community. Thanks for your patience.",
  "settings.presets.closed.review.label": "Process review",
  "settings.presets.closed.review.body":
    "New signups are paused while we review how we welcome new members. We’ll reopen soon.",

  // Confirmation modal — enabling lockdown takes the whole platform down.
  "settings.confirm.enable.eyebrow": "Confirm",
  "settings.confirm.enable.title": "Lock the platform?",
  "settings.confirm.enable.body":
    "Every member will be blocked immediately and shown your maintenance message. They stay signed in, so lifting the lockdown restores everyone without anyone re-authenticating.",
  "settings.confirm.enable.messagePreview": "They will see:",
  "settings.confirm.enable.cta": "Lock the platform",
  "settings.confirm.disable.eyebrow": "Confirm",
  "settings.confirm.disable.title": "Lift the lockdown?",
  "settings.confirm.disable.body":
    "The platform reopens for everyone within about 10 seconds.",
  "settings.confirm.disable.cta": "Lift lockdown",

  "settings.banner.title": "The platform is locked down.",
  "settings.banner.sub": "Only admins can reach it right now.",
  "settings.banner.cta": "End lockdown",

  "settings.note.label": "Note (optional)",
  "settings.note.placeholder": "Why are you making this change?",
  "settings.note.hint": "Applies to the next change you make below.",
  "settings.saveError": "Couldn’t save that. Nothing was changed.",

  "settings.history.title": "Recent changes",
  "settings.history.empty": "No changes yet.",
  "settings.history.error": "Couldn’t load recent changes.",
  "settings.history.by": "by {actor}",
  "settings.history.unknownActor": "a deleted admin",
  "settings.history.on": "on",
  "settings.history.off": "off",
  "settings.history.cleared": "cleared",
  "settings.history.changed": "{setting}: from {from} to {to}",
  "settings.history.truncatedNotice":
    "Showing {shown} of {total} changes, newest first. Older entries are not on this page.",

  "settings.key.registrationEnabled": "Registration",
  "settings.key.joinRequestsEnabled": "Invite requests",
  "settings.key.lockdownEnabled": "Lockdown",
  "settings.key.lockdownAllowsModerators": "Moderators during lockdown",
  "settings.key.lockdownMessage": "Maintenance message",
  "settings.key.registrationClosedMessage": "Signups-closed message",
  "settings.key.announcementEnabled": "Announcement banner",
  "settings.key.announcementMessage": "Announcement message",
  "settings.key.announcementExpiresAt": "Announcement expiry",

  // ── Sitewide announcement banner (ADM-25) ─────────────────────────────────
  "settings.announcement.title": "Announcement banner",
  "settings.announcement.sub":
    "Shown to every visitor at the top of the site, signed in or not.",
  "settings.announcement.message.label": "Banner message",
  "settings.announcement.message.placeholder":
    "e.g. Scheduled maintenance tonight from 10pm to midnight UTC.",
  "settings.announcement.message.hint":
    "Editing this shows the banner again to everyone who already dismissed it.",
  "settings.announcement.expiresAt.label": "Auto-hide after (optional)",
  "settings.announcement.expiresAt.hint":
    "Once this time passes, the banner stops showing even if the switch above is still on.",

  // ── System accounts (bots) ────────────────────────────────────────────────
  "bots.eyebrow": "Platform",
  "bots.title": "System accounts",
  "bots.subtitle": "The voices that aren't a person. Keep them current.",
  "bots.empty": "No system accounts yet.",
  "bots.edit": "Edit",
  "bots.editTitle": "Edit {name}",
  "bots.field.firstName": "Display name",
  "bots.field.lastName": "Second name (optional)",
  "bots.field.username": "Handle",
  "bots.field.pronouns": "Pronouns",
  "bots.field.tagline": "Tagline",
  "bots.field.location": "Location",
  "bots.field.bio": "Bio",
  "bots.field.avatar": "Avatar",
  "bots.field.socials": "Links",
  "bots.socials.platform": "Platform",
  "bots.socials.handle": "URL or handle",
  "bots.socials.add": "Add a link",
  "bots.socials.remove": "Remove link",
  "bots.avatar.change": "Change photo",
  "bots.avatar.uploading": "Uploading…",
  "bots.save": "Save changes",
  "bots.cancel": "Cancel",
  "bots.saved": "Saved. {name} is up to date.",
  "bots.saveFailed": "That didn't save. Check your connection and try again.",
  "bots.usernameTaken": "That handle is already taken.",

  // ── Partnership tiers (/admin/org-tiers) — page, form, fields, rows ────────
  // Tier/partner NAMES stay English — DTO content served by the API. Eyebrow
  // "Partnerships" reuses partners.header.eyebrow.
  "orgTier.title": "Partnership <em>tiers</em>",
  "orgTier.header.sub":
    "Every tier on the For Organisations page, published or still in draft: create one, keep the pricing and copy current, and control what's live.",
  "orgTier.newCta": "New tier",
  "orgTier.form.editEyebrow": "Edit tier",
  "orgTier.form.editTitle": "Edit tier",
  "orgTier.form.createTitle": "Create a partnership tier",
  "orgTier.form.createCta": "Create tier",
  "orgTier.loadError":
    "The tier list couldn't load right now. Please try again.",
  "orgTier.empty": "No tiers yet. Create the first one below.",
  "orgTier.delete.title": "Remove {name}?",
  "orgTier.delete.confirmCta": "Remove tier",
  "orgTier.delete.body":
    "This removes it from the public partnership tiers list and the admin panel. This cannot be undone.",
  "orgTier.toast.updated": "{name} was updated",
  "orgTier.toast.created": "{name} was created",
  "orgTier.toast.removed": "{name} was removed",
  "orgTier.field.name": "Name",
  "orgTier.field.price": "Price",
  "orgTier.field.pricePeriod": "Price period",
  // "Dek" is the descriptive standfirst line under the tier name — rendered as
  // "Subtítulo" in pt-PT (there is no common pt term for "dek").
  "orgTier.field.dek": "Dek",
  "orgTier.field.bullets": "Bullets",
  "orgTier.field.bulletsHint": "One bullet per line.",
  "orgTier.field.footnote": "Footnote",
  "orgTier.field.cta": "Call to action",
  "orgTier.field.ctaLabel": "CTA label",
  "orgTier.field.ctaTarget": "CTA target",
  "orgTier.field.sortOrder": "Sort order",
  // CTA-behaviour option labels; the stored value is a canonical id
  // (toast/link/propose), never this label.
  "orgTier.ctaOption.link": "Link: navigates to a target",
  "orgTier.ctaOption.propose": "Propose: opens the enquiry flow",
  "orgTier.toggle.featured.sub": "Highlighted as the recommended tier.",
  "orgTier.toggle.published.sub": "Visible on the For Organisations page.",

  // ── AdminOrgTierFormFields.tsx — For-Organisations tier editor ─────────────
  "orgTier.field.priceDisplay.placeholder": "e.g. €2.4k or Custom",
  "orgTier.field.pricePeriod.placeholder": "e.g. per year",
  "orgTier.field.ctaTarget.placeholder":
    "Only used when the call to action is a link",
  "orgTier.toggle.featured.title": "Featured",
  "orgTier.toggle.published.title": "Published",

  // ── Approved partners (featured-flag + testimonial editor) ─────────────────
  // Partner names, testimonial quotes/authors stay English — DTO content.
  "approvedPartners.title": "Featured partners & testimonials",
  "approvedPartners.loadError":
    "The partner list couldn't load right now. Please try again.",
  "approvedPartners.empty": "No approved partners yet.",
  "approvedPartners.noTestimonial": "No testimonial yet",
  "approvedPartners.unattributed": "Unattributed",
  "approvedPartners.editCta": "Edit testimonial",

  // ── AdminPartnerTestimonialModal.tsx ──────────────────────────────────────
  "partnerTestimonial.eyebrow": "Testimonial",
  "partnerTestimonial.quote": "Quote",
  "partnerTestimonial.author": "Author",
  "partnerTestimonial.role": "Role",
  "partnerTestimonial.authorRequiredHint":
    "Add an author before saving a quote.",
  "partnerTestimonial.quoteNeedsAuthor":
    "A quote needs an author. Add one before saving",
  "partnerTestimonial.updatedToast": "{name}'s testimonial was updated",

  // ── Housing co-ops (/admin/housing) — page, form, fields, rows ─────────────
  // Co-op NAMES / cities stay English — DTO content served by the API.
  "housingCoop.title": "Housing <em>co-ops</em>",
  "housingCoop.header.eyebrow": "Local economy",
  "housingCoop.header.sub":
    "Every co-op on the platform, published or still forming: create one, keep the details current, and clear the join-request queue below.",
  "housingCoop.newCta": "New co-op",
  "housingCoop.form.editEyebrow": "Edit co-op",
  "housingCoop.form.editTitle": "Edit co-op",
  "housingCoop.form.createTitle": "Create a housing co-op",
  "housingCoop.form.createCta": "Create co-op",
  "housingCoop.loadError":
    "The co-op list couldn't load right now. Please try again.",
  "housingCoop.empty": "No co-ops yet. Create the first one below.",
  "housingCoop.delete.title": "Remove {name}?",
  "housingCoop.delete.confirmCta": "Remove co-op",
  "housingCoop.delete.body":
    "This removes it from the public directory and the admin list. Join requests already submitted for it stay on record.",
  "housingCoop.toast.updated": "{name} was updated",
  "housingCoop.toast.created": "{name} was created",
  "housingCoop.toast.removed": "{name} was removed",
  "housingCoop.field.slug": "Slug",
  "housingCoop.field.name": "Name",
  "housingCoop.field.nameEm": "Name: emphasised word",
  "housingCoop.field.nameEmHint":
    "The one word styled in italic coral on the public card. Leave blank for none.",
  "housingCoop.field.city": "City",
  "housingCoop.field.area": "Area",
  "housingCoop.field.households": "Households",
  "housingCoop.field.phase": "Phase",
  "housingCoop.field.description": "Description",
  "housingCoop.field.progress": "Progress (%)",
  "housingCoop.field.formingSince": "Forming since",
  "housingCoop.field.formingSincePlaceholder": "e.g. 2025-03-01",
  "housingCoop.field.operationalSince": "Operational since",
  "housingCoop.field.operationalSincePlaceholder": "e.g. 2026-01-01",
  "housingCoop.field.shareAmount": "Share amount (EUR)",
  "housingCoop.field.monthly": "Monthly (EUR)",
  "housingCoop.field.cta": "Call to action",
  // Phase select option labels (long form). Stored value is a canonical id.
  "housingCoop.phaseOption.forming": "Forming: finding the people",
  "housingCoop.phaseOption.legal": "Legal incorporation",
  "housingCoop.phaseOption.finance": "Finance & structure",
  "housingCoop.phaseOption.property": "Finding the property",
  "housingCoop.phaseOption.daily": "Daily life: operational",
  // Phase badge labels (short form, on the admin row). Same canonical ids.
  "housingCoop.phaseBadge.forming": "Forming",
  "housingCoop.phaseBadge.legal": "Legal",
  "housingCoop.phaseBadge.finance": "Finance",
  "housingCoop.phaseBadge.property": "Property",
  "housingCoop.phaseBadge.daily": "Daily life",
  // CTA-kind option labels. Stored value is a canonical id.
  "housingCoop.ctaOption.join": "Join the co-op",
  "housingCoop.ctaOption.updates": "Get updates",
  "housingCoop.ctaOption.mentor": "Talk to a mentor",
  "housingCoop.toggle.operational.sub":
    "The co-op has moved in and is running day to day.",
  "housingCoop.toggle.sharesAreTarget.sub":
    "Show the share amount as a goal to aim for, instead of a fixed price.",
  "housingCoop.toggle.published.sub":
    "Visible in the public housing directory.",
  "housingCoop.row.households_one": "{count} household",
  "housingCoop.row.households_other": "{count} households",

  // ── AdminHousingCoopFormFields.tsx — housing co-op editor ──────────────────
  "housingCoop.toggle.operational.title": "Operational",
  "housingCoop.toggle.sharesAreTarget.title": "Share amount is a target",
  "housingCoop.toggle.published.title": "Published",

  // ── AdminHousingJoinRequests.tsx — cross-coop join-request triage ──────────
  // Applicant names, co-op names, notes stay English — DTO content.
  "housingRequests.title": "Join requests",
  "housingRequests.loadError":
    "The join-request queue couldn't load right now. Please try again.",
  "housingRequests.empty":
    "Nothing waiting on you. Every request has been triaged.",
  "housingRequests.unknownCoop": "Unknown co-op",
  "housingRequests.householdSize": "{size} in the household",
  "housingRequests.declineCta": "Decline",
  "housingRequests.acceptCta": "Accept",
  // ENG-41: the queue is paginated, so the number of people waiting and the
  // number of rows on screen are two different things.
  "housingRequests.pendingCount_one": "{count} person waiting",
  "housingRequests.pendingCount_other": "{count} people waiting",
  "housingRequests.loadMore": "Load more requests",
  "housingRequests.loadingMore": "Loading…",

  // ── Housing groups (/admin/housing-groups) — join triage + norm enforcement ─
  "housingGroups.title": "Housing <em>groups</em>",
  "housingGroups.header.eyebrow": "Vetted housing",
  "housingGroups.header.sub":
    "Review who's asking to join the access-gated groups, and keep listings honest by hiding any that break the norms.",
  "housingGroups.requests.title": "Join requests",
  "housingGroups.requests.loadError":
    "The join-request queue couldn't load right now. Please try again.",
  "housingGroups.requests.empty":
    "Nothing waiting on you. Every request has been reviewed.",
  "housingGroups.requests.unknownGroup": "Unknown group",
  "housingGroups.requests.mutuals_one": "{count} mutual connection",
  "housingGroups.requests.mutuals_other": "{count} mutual connections",
  "housingGroups.requests.declineCta": "Decline",
  "housingGroups.requests.approveCta": "Approve",
  "housingGroups.requests.error": "Couldn't save that decision",
  // ENG-41: the queue is paginated, so the number of people waiting and the
  // number of rows on screen are different things and the count says which.
  "housingGroups.requests.pendingCount_one": "{count} person waiting",
  "housingGroups.requests.pendingCount_other": "{count} people waiting",
  "housingGroups.requests.loadMore": "Load more requests",
  "housingGroups.requests.loadingMore": "Loading…",
  "housingGroups.listings.title": "Listings",
  "housingGroups.listings.loadError":
    "The listings couldn't load right now. Please try again.",
  "housingGroups.listings.empty":
    "No listings to review. Nothing's been posted to a group yet.",
  "housingGroups.listings.perMonth": "€{price} / mo",
  "housingGroups.listings.noGroup": "No group",
  "housingGroups.listings.hiddenChip": "Hidden",
  "housingGroups.listings.hideCta": "Hide",
  "housingGroups.listings.unhideCta": "Un-hide",
  "housingGroups.listings.hideDialog.title": "Hide “{title}”?",
  "housingGroups.listings.hideDialog.body":
    "The listing leaves the group straight away. Its poster gets a notification with your reason. You can un-hide it from this list.",
  "housingGroups.listings.hideDialog.reasonLabel": "Reason for the poster",
  "housingGroups.listings.hideDialog.reasonPlaceholder":
    "Say which norm it breaks, for example a hidden price.",
  "housingGroups.listings.hideDialog.confirm": "Hide listing",
  "housingGroups.listings.error": "Couldn't update that listing",

  // ── Roadmap (/admin/roadmap) — board, idea queue, hero stats ───────────────
  "roadmap.title": "Roadmap · <em>what's next</em>",
  "roadmap.loading": "Loading the roadmap…",
  "roadmap.tabs.board": "Board",

  // AdminRoadmapBoard.tsx, AdminRoadmapItemRow.tsx, AdminRoadmapItemModal.tsx,
  // AdminRoadmapItemModalFields.tsx — the shipped/building/planned kanban.
  "roadmap.board.column.shipped": "Shipped",
  "roadmap.board.column.building": "Building now",
  "roadmap.board.column.planned": "Planned",
  "roadmap.board.field.category": "Category",

  // AdminRoadmapIdeasQueue.tsx, AdminRoadmapIdeaRows.tsx — member-submitted
  // idea triage + the published Top-ideas list the public page reads.
  "roadmap.ideas.promoteCta": "Promote",
  // Shared confirm dialog (IdeaQueueConfirmModal) — `kind` is "dismiss" or
  // "delete", interpolated into the key (`roadmap.ideas.${kind}.*`).

  // ═══════════════════════════════════════════════════════════════════════
  // Roadmap redesign (9-view board, deep drawer, saved views, modals).
  // Additive: the flat roadmap.board.*/roadmap.ideas.*
  // keys above stay in place for the current 3-tab UI until it's migrated;
  // everything below is scoped to the new views under fresh sub-paths so
  // neither set collides with or silently reads from the other.
  // ═══════════════════════════════════════════════════════════════════════

  // ── Category taxonomy — shared across board/toolbar/drawer/capacity/etc ───
  "roadmap.categories.resources": "Resources",
  "roadmap.categories.gatherings": "Events",
  "roadmap.categories.members": "Members",
  "roadmap.categories.safety": "Safety",
  "roadmap.categories.content": "Content",
  "roadmap.categories.messaging": "Messaging",
  "roadmap.categories.community": "Community",
  "roadmap.categories.economy": "Economy",
  "roadmap.categories.platform": "Platform",

  // ── Page shell — eyebrow/title/sub + header actions ────────────────────
  "roadmap.page.eyebrow": "Roadmap",
  "roadmap.page.title": "Shape the <em>roadmap</em>",
  "roadmap.page.sub":
    "Drag items between columns, triage what members asked for, and control exactly what the public page shows. A moved date always asks you for a reason. That is the point.",
  "roadmap.page.newItemCta": "New item",
  "roadmap.page.draftDigestCta": "Draft digest",
  "roadmap.page.previewPublicCta": "Preview public page",
  "roadmap.page.auditLogCta": "Audit log",

  // ── Tabs — 8 views. tabs.board above already carries the right copy and
  // is reused as-is; the rest are new.
  "roadmap.tabs.timeline": "Timeline",
  "roadmap.tabs.guides": "Guides",
  "roadmap.tabs.capacity": "Capacity",
  "roadmap.tabs.memberIdeas": "Member ideas",
  "roadmap.tabs.notBuilding": "Not building",
  "roadmap.tabs.publicPreview": "Public preview",
  "roadmap.tabs.archive": "Archive",

  // ── Saved views chip row ────────────────────────────────────────────────
  "roadmap.savedViews.label": "Saved views",
  "roadmap.savedViews.late": "What is late",
  "roadmap.savedViews.unassigned": "Unassigned P0/P1",
  "roadmap.savedViews.blocked": "Blocked",
  "roadmap.savedViews.stale": "Stale",
  "roadmap.savedViews.guidesOnly": "Guides only",
  "roadmap.savedViews.needsSafety": "Needs safety review",
  "roadmap.savedViews.needsFunding": "Needs funding",

  // ── Toolbar — search, filters, sort, density, drag hint ────────────────
  "roadmap.toolbar.searchPlaceholder": "Filter items…",
  "roadmap.toolbar.searchAriaLabel": "Filter roadmap items",
  "roadmap.toolbar.categoryAll": "All categories",
  "roadmap.toolbar.ownerAll": "Any owner",
  "roadmap.toolbar.ownerUnassigned": "Unassigned",
  "roadmap.toolbar.sortManual": "Manual order",
  "roadmap.toolbar.sortVotes": "Most voted",
  "roadmap.toolbar.sortPriority": "Priority",
  "roadmap.toolbar.sortStale": "Least recently touched",
  "roadmap.toolbar.denseToggle": "Compact",
  "roadmap.toolbar.dragHint": "Drag to move or reorder · ? for shortcuts",

  // ── Board — columns (backlog is new; shipped/building/planned reuse the
  // existing roadmap.board.column.* keys above, same copy), subtitles,
  // empty/WIP states, flag tooltips, alert strips, kebab menu.
  "roadmap.board.column.backlog": "Backlog",
  "roadmap.board.column.subtitle.backlog": "Parked with intent",
  "roadmap.board.column.subtitle.planned": "Committed, queued",
  "roadmap.board.column.subtitle.building": "Hands on it",
  "roadmap.board.column.subtitle.shipped": "Live for members",
  "roadmap.board.addToColumnAriaLabel": "Add to {column}",
  "roadmap.board.emptyColumn": "Nothing here",
  "roadmap.board.wipOverMessage":
    "Over the WIP limit of {limit}. Something here is not really being built.",
  "roadmap.board.gripAriaLabel": "Drag to move or reorder",
  "roadmap.board.openCardAriaLabel": "Open {name}",
  "roadmap.board.selectCardAriaLabel": "Select {name}",
  "roadmap.board.flag.requested": "Members asked for this",
  "roadmap.board.flag.committed": "Committed: this is a promise",
  "roadmap.board.flag.hidden": "Hidden from the public roadmap",
  "roadmap.board.flag.safetyGated":
    "Safety review required before this can go public",
  "roadmap.board.flag.spike": "Unusual vote spike: possible brigading",
  "roadmap.board.flag.slips": "Target moved {count}×",
  "roadmap.board.alert.blocked": "Blocked · {reason}",
  "roadmap.board.alert.waitingOn": "Waiting on {name}",
  "roadmap.board.alert.waitingOnMore": "Waiting on {name} +{count}",
  "roadmap.board.alert.staleUntouched": "Untouched {days} days",
  "roadmap.board.reorder.movedAnnouncement":
    "Moved {name} to position {position} of {total}",
  "roadmap.board.menu.moveUp": "Move up",
  "roadmap.board.menu.moveDown": "Move down",
  "roadmap.board.menu.moveUpAriaLabel": "Move up: {name}",
  "roadmap.board.menu.moveDownAriaLabel": "Move down: {name}",
  "roadmap.board.menu.moveTo": "Move to {column}",
  "roadmap.board.menu.editDetails": "Edit details",
  "roadmap.board.menu.showPublic": "Show on public",
  "roadmap.board.menu.hidePublic": "Hide from public",
  "roadmap.board.menu.duplicate": "Duplicate",
  "roadmap.board.menu.notifyVoters_one": "Notify {count} voter…",
  "roadmap.board.menu.notifyVoters_other": "Notify {count} voters…",
  "roadmap.board.menu.archive": "Archive",

  // ── Bulk selection bar ──────────────────────────────────────────────────
  "roadmap.bulkBar.selectedLabel_one": "{count} selected",
  "roadmap.bulkBar.selectedLabel_other": "{count} selected",
  "roadmap.bulkBar.moveToPlaceholder": "Move to…",
  "roadmap.bulkBar.showPublicly": "Show publicly",
  "roadmap.bulkBar.hide": "Hide",
  "roadmap.bulkBar.archive": "Archive",
  "roadmap.bulkBar.clear": "Clear",
  "roadmap.bulkBar.delete": "Delete",
  "roadmap.bulkBar.confirmDelete.title_one": "Delete {count} item?",
  "roadmap.bulkBar.confirmDelete.title_other": "Delete {count} items?",
  "roadmap.bulkBar.confirmDelete.body_one":
    "This permanently removes the selected item from the roadmap and can't be undone.",
  "roadmap.bulkBar.confirmDelete.body_other":
    "This permanently removes all {count} selected items from the roadmap and can't be undone.",
  "roadmap.bulkBar.confirmDelete.confirmCta": "Delete items",

  // ── Item drawer — top bar + field labels shared by the grid ─────────────
  "roadmap.drawer.eyebrow": "Roadmap item",
  "roadmap.drawer.touchedLabel": "Touched {days}d ago",
  "roadmap.drawer.field.title": "Title",
  "roadmap.drawer.field.status": "Status",
  "roadmap.drawer.field.target": "Target",
  "roadmap.drawer.field.owner": "Owner",
  "roadmap.drawer.field.priority": "Priority",
  "roadmap.drawer.saveCta": "Save & publish",
  "roadmap.drawer.saveEditCta": "Save",
  "roadmap.drawer.archiveCta": "Archive",
  "roadmap.drawer.auditNote":
    "Every edit is logged. Members can see when a date moved and why. A roadmap that quietly slips is just a wishlist.",
  "roadmap.drawer.openAuditCta": "Open the audit log",
  "roadmap.drawer.deleteConfirm.title": 'Delete "{name}"?',
  "roadmap.drawer.deleteConfirm.body":
    "This permanently removes it from the roadmap and can't be undone.",

  // Drawer · Commitment section
  "roadmap.drawer.commitment.title": "Commitment",
  "roadmap.drawer.commitment.note": "why members should believe the date",
  "roadmap.drawer.commitment.confidence.likely.label": "Likely",
  "roadmap.drawer.commitment.confidence.likely.desc":
    "We can see the whole path",
  "roadmap.drawer.commitment.confidence.maybe.label": "Maybe",
  "roadmap.drawer.commitment.confidence.maybe.desc":
    "Depends on capacity or money",
  "roadmap.drawer.commitment.confidence.hoping.label": "Hoping",
  "roadmap.drawer.commitment.confidence.hoping.desc":
    "We want this, no path yet",
  "roadmap.drawer.commitment.promiseToggle.title": "This is a firm promise",
  "roadmap.drawer.commitment.promiseToggle.sub":
    'Committed items are labelled as promises publicly. Everything else reads as "we want to".',
  "roadmap.drawer.commitment.slipHistoryTitle": "Date history: moved {count}×",
  "roadmap.drawer.commitment.slipHistoryEmpty":
    "Never moved. Changing the target asks you for a public reason.",

  // Drawer · Guide checklist section (health/legal resource guides)
  "roadmap.drawer.guide.title": "Guide checklist",
  "roadmap.drawer.guide.note": "health & legal content needs review",
  "roadmap.drawer.guide.step.research": "Research",
  "roadmap.drawer.guide.step.draft": "Draft",
  "roadmap.drawer.guide.step.lived": "Lived-experience review",
  "roadmap.drawer.guide.step.expert": "Expert / legal review",
  "roadmap.drawer.guide.step.translate": "Translate (PT)",
  "roadmap.drawer.guide.step.publish": "Publish",
  "roadmap.drawer.guide.reviewerLabel": "Reviewer",
  "roadmap.drawer.guide.reviewerPlaceholder": "Who checked this",
  "roadmap.drawer.guide.credentialLabel": "Their credential",
  "roadmap.drawer.guide.credentialPlaceholder": "Why they are qualified",
  "roadmap.drawer.guide.reVerifyByLabel": "Re-verify by",
  "roadmap.drawer.guide.languagesLabel": "Languages",
  "roadmap.drawer.guide.reVerifyWarning":
    "Re-verify due in {days} days. Health and legal facts rot. Stale guidance is worse than none.",
  "roadmap.drawer.guide.reVerifyOverdue_one":
    "Re-verify is overdue by {count} day.",
  "roadmap.drawer.guide.reVerifyOverdue_other":
    "Re-verify is overdue by {count} days.",
  "roadmap.drawer.guide.notAGuideCta": "This is not a guide",
  // Non-guide items show a plain progress slider instead of the checklist.
  "roadmap.drawer.progress.title": "Progress",
  "roadmap.drawer.progress.percentDoneLabel": "Percent done",
  "roadmap.drawer.progress.trackAsGuideCta":
    "Track this as a resource guide instead",

  // Drawer · Blocked section
  "roadmap.drawer.blocked.title": "Blocked",
  "roadmap.drawer.blocked.note":
    "shown publicly. Blockers are not embarrassing",
  "roadmap.drawer.blocked.byLabel": "Blocked by",
  "roadmap.drawer.blocked.byPlaceholder": "Person or team",
  "roadmap.drawer.blocked.unblockCta": "Unblock",
  "roadmap.drawer.blocked.whyPlaceholder": "What exactly is it waiting on?",
  "roadmap.drawer.blocked.none": "Not blocked.",
  "roadmap.drawer.blocked.markCta": "Mark as blocked",

  // Drawer · Dependencies section
  "roadmap.drawer.deps.title": "Dependencies",
  "roadmap.drawer.deps.none": "Nothing blocking this.",
  "roadmap.drawer.deps.addPlaceholder": "Add a dependency…",
  "roadmap.drawer.deps.cannotShip": "Cannot ship before {items}.",

  // Drawer · Capacity & money section
  "roadmap.drawer.capacity.title": "Capacity & money",
  "roadmap.drawer.capacity.note":
    "volunteer items slip first, which is just arithmetic",
  "roadmap.drawer.capacity.whoLabel": "Who is doing it",
  "roadmap.drawer.capacity.paidOption": "Paid work",
  "roadmap.drawer.capacity.volunteerOption": "Volunteer",
  "roadmap.drawer.capacity.hoursLabel": "Hours / week",
  "roadmap.drawer.capacity.costLabel": "Cost",
  "roadmap.drawer.capacity.cost.none": "No cost",
  "roadmap.drawer.capacity.cost.small": "Small (<€500)",
  "roadmap.drawer.capacity.cost.funded": "Funded",
  "roadmap.drawer.capacity.cost.needs": "Needs funding",
  "roadmap.drawer.capacity.ownerLoadLabel": "Owner load",
  "roadmap.drawer.capacity.noOwner": "Nobody owns this",
  "roadmap.drawer.capacity.ownerLoadValue": "{hours}h of {cap}h",

  // Drawer · Visibility & safety section
  "roadmap.drawer.visibility.title": "Visibility & safety",
  "roadmap.drawer.visibility.publicToggle.title":
    "Visible on the public roadmap",
  "roadmap.drawer.visibility.publicToggle.sub":
    "Members see it, vote and comment.",
  "roadmap.drawer.visibility.requestedToggle.title": "Member requested",
  "roadmap.drawer.visibility.requestedToggle.sub":
    "Came from an idea or a repeated ask.",
  "roadmap.drawer.visibility.safetyLabel": "Safety review",
  "roadmap.drawer.visibility.safety.none": "No review needed",
  "roadmap.drawer.visibility.safety.required": "Safety review required",
  "roadmap.drawer.visibility.safety.cleared": "Safety cleared",
  "roadmap.drawer.visibility.gatedWarning":
    "Gated. This cannot be published until Trust & Safety clears it.",

  // Drawer · Member votes section
  "roadmap.drawer.votes.title": "Member votes",
  "roadmap.drawer.votes.otherCommunitiesLabel": "Everyone else",
  "roadmap.drawer.votes.totalLabel": "Total votes",
  "roadmap.drawer.votes.notifiedLabel": "Notified",
  "roadmap.drawer.votes.notifiedYes": "Yes",
  "roadmap.drawer.votes.notifiedNo": "Not yet",
  "roadmap.drawer.votes.spikeLabel": "Spike",
  "roadmap.drawer.votes.spikeFlagged": "Flagged",
  "roadmap.drawer.votes.spikeNormal": "Normal",
  "roadmap.drawer.votes.notifyCta_one": "Notify the {count} person who asked…",
  "roadmap.drawer.votes.notifyCta_other":
    "Notify the {count} people who asked…",

  // Drawer · Comments section
  "roadmap.drawer.comments.title": "Comments",
  "roadmap.drawer.comments.empty": "No comments yet.",
  "roadmap.drawer.comments.hiddenStatus": "Hidden",

  // Drawer · Internal notes / Public one-liner
  "roadmap.drawer.internalNotes.title": "Internal notes",
  "roadmap.drawer.internalNotes.note": "never public",
  "roadmap.drawer.internalNotes.placeholder":
    "Scope, dependencies, what would make us drop it.",
  "roadmap.drawer.publicOneLiner.title": "Public one-liner",
  "roadmap.drawer.publicOneLiner.note": "shown on /roadmap",
  "roadmap.drawer.publicOneLiner.placeholder": "Plain, warm, no roadmap-speak.",

  // ── Modals ──────────────────────────────────────────────────────────────
  // Slip reason
  "roadmap.modals.slipReason.eyebrow": "Date change",
  "roadmap.modals.slipReason.title": "Why is this <em>moving</em>?",
  "roadmap.modals.slipReason.targetLabel": "Target",
  "roadmap.modals.slipReason.body":
    "This reason is published on the public roadmap next to the item. Members forgive slipping dates; they do not forgive silent ones.",
  "roadmap.modals.slipReason.placeholder":
    "e.g. Clinical reviewer availability. We would rather be late than wrong.",
  "roadmap.modals.slipReason.confirmCta": "Move the date",
  "roadmap.modals.slipReason.cancelCta": "Keep it as it is",
  "roadmap.modals.slipReason.missingReasonToast":
    "A moved date needs a reason. That is the whole point",

  // Safety gate
  "roadmap.modals.safetyGate.eyebrow": "Safety gate",
  "roadmap.modals.safetyGate.title":
    "This needs a <em>safety review</em> first",
  "roadmap.modals.safetyGate.body":
    "Flagged as sensitive. Housing, asylum and employer content can expose members. Publishing it early is a genuine risk, so treat it as one.",
  "roadmap.modals.safetyGate.note":
    "Clearing is logged against your name. Only Trust & Safety should do this.",
  "roadmap.modals.safetyGate.confirmCta": "Clear review & publish",
  "roadmap.modals.safetyGate.cancelCta": "Leave it gated",

  // Merge idea
  "roadmap.modals.mergeIdea.eyebrow": "Merge idea",
  "roadmap.modals.mergeIdea.title": "Fold this into an <em>existing item</em>",
  "roadmap.modals.mergeIdea.body":
    "Merging moves the votes across and tells the member where their idea went.",
  "roadmap.modals.mergeIdea.ideaLabel": "Member idea",
  "roadmap.modals.mergeIdea.mergeIntoLabel": "Merge into",
  "roadmap.modals.mergeIdea.suggestedTag": "suggested",
  "roadmap.modals.mergeIdea.confirmCta": "Merge & notify",
  "roadmap.modals.mergeIdea.missingPickToast":
    "Pick a board item to merge into",
  "roadmap.modals.mergeIdea.emptyTargets":
    "There's nothing on the board yet to merge this into.",

  // Decline
  "roadmap.modals.decline.eyebrow": "Decline",
  "roadmap.modals.decline.title": "Say no, with a <em>reason</em>",
  "roadmap.modals.decline.ideaLabel": "Member idea",
  "roadmap.modals.decline.reasonLabel": "Reason",
  "roadmap.modals.decline.publishedWordingLabel": "Published wording",
  "roadmap.modals.decline.publishedWordingHint":
    'appears under "Not building this, and why"',
  "roadmap.modals.decline.confirmCta": "Decline publicly",
  "roadmap.modals.decline.missingReasonToast":
    "Write the reason. Declining without one is silence",
  "roadmap.modals.decline.reason.scope.label": "Outside what we are",
  "roadmap.modals.decline.reason.scope.wording":
    "This is not what QueerPulse is for. It would pull us toward being a platform.",
  "roadmap.modals.decline.reason.unsafe.label": "Cannot build it safely",
  "roadmap.modals.decline.reason.unsafe.wording":
    "We could not ship this without putting members at risk. If that changes, we will revisit.",
  "roadmap.modals.decline.reason.capacity.label": "No capacity, honestly",
  "roadmap.modals.decline.reason.capacity.wording":
    "We are five people. This is a real idea we cannot staff right now.",
  "roadmap.modals.decline.reason.exists.label": "Already exists elsewhere",
  "roadmap.modals.decline.reason.exists.wording":
    "Someone in the community already does this well and we would rather point at them.",
  "roadmap.modals.decline.reason.harm.label": "Risk of harm outweighs value",
  "roadmap.modals.decline.reason.harm.wording":
    "The version of this that works for some members would expose others.",

  // Notify voters
  "roadmap.modals.notifyVoters.eyebrow": "Tell the people who asked",
  "roadmap.modals.notifyVoters.title_one": "Notify <em>{count}</em> member",
  "roadmap.modals.notifyVoters.title_other": "Notify <em>{count}</em> members",
  "roadmap.modals.notifyVoters.itemLabel": "Item",
  "roadmap.modals.notifyVoters.messageLabel": "Message",
  "roadmap.modals.notifyVoters.onceOnlyTitle": "One email, no follow-ups",
  "roadmap.modals.notifyVoters.onceOnlySub":
    "We never re-engage people who voted. This sends once and stops.",
  "roadmap.modals.notifyVoters.confirmCta": "Send once",
  "roadmap.modals.notifyVoters.cancelCta": "Not now",
  "roadmap.modals.notifyVoters.shippedMessage":
    '"{name}" is live. You asked for this. Thank you for saying so.',
  "roadmap.modals.notifyVoters.movedMessage":
    '"{name}" just moved to {column}.',

  // Digest
  "roadmap.modals.digest.eyebrow": "Monthly digest",
  "roadmap.modals.digest.title": '"You asked, we <em>built</em>"',
  "roadmap.modals.digest.body":
    "Drafted from the board: what shipped, which dates moved and why, and what we declined. Edit freely.",
  "roadmap.modals.digest.confirmCta": "Copy for the email",
  "roadmap.modals.digest.heading": "What happened in {month}",
  "roadmap.modals.digest.shippedHeading": "Shipped",
  "roadmap.modals.digest.movedHeading": "Dates that moved, and why",
  "roadmap.modals.digest.movedEmpty": "Nothing moved this month.",
  "roadmap.modals.digest.declinedHeading": "What we said no to",
  "roadmap.modals.digest.footer":
    "{count} things are in progress. The full board is at /roadmap.",

  // Audit log
  "roadmap.modals.auditLog.eyebrow": "Audit trail",
  "roadmap.modals.auditLog.title": "Every change, <em>on the record</em>",
  "roadmap.modals.auditLog.exportCta": "Export CSV for governance",
  "roadmap.modals.auditLog.resetBoardCta": "Reset board",
  "roadmap.modals.auditLog.resetBoardHint":
    "Resets this browser's demo board back to the seeded roadmap. Every edit made in demo mode is undone. This can't be undone.",

  // Shortcuts
  "roadmap.modals.shortcuts.eyebrow": "Keyboard",
  "roadmap.modals.shortcuts.title": "Move without the <em>mouse</em>",
  "roadmap.modals.shortcuts.filter": "Filter",
  "roadmap.modals.shortcuts.newItem": "New item",
  "roadmap.modals.shortcuts.moveThroughCards": "Move through cards",
  "roadmap.modals.shortcuts.editFocused": "Edit focused card",
  "roadmap.modals.shortcuts.saveClose": "Save & close",
  "roadmap.modals.shortcuts.close": "Close",
  "roadmap.modals.shortcuts.thisList": "This list",
  "roadmap.modals.shortcuts.dragMove": "Move or reorder",
  "roadmap.modals.shortcuts.gotItCta": "Got it",

  // ── Timeline view ───────────────────────────────────────────────────────
  "roadmap.timelineView.unscheduledLabel": "Unscheduled",
  "roadmap.timelineView.laneCount": "{items} items · {shipped} shipped",

  // ── Capacity view ───────────────────────────────────────────────────────
  "roadmap.capacityView.title": "Who is <em>carrying</em> what",
  "roadmap.capacityView.subtitle": "Building-now load vs. stated hours",
  "roadmap.capacityView.loadSummary": "{building} building, {planned} planned",
  "roadmap.capacityView.paidTag": "Paid",
  "roadmap.capacityView.volunteerTag": "Volunteer",
  "roadmap.capacityView.unassignedActiveLabel": "Unassigned, active",
  "roadmap.capacityView.unassignedActiveWarn": "{count} are P0/P1",
  "roadmap.capacityView.unassignedActiveOk": "None urgent",
  "roadmap.capacityView.paidVsVolunteerLabel": "Paid vs. volunteer work",
  "roadmap.capacityView.paidVsVolunteerFoot":
    "Volunteer items slip first. That is simply how the arithmetic works.",
  "roadmap.capacityView.needsFundingLabel": "Needs funding",
  "roadmap.capacityView.needsFundingEmpty": "Nothing is waiting on money.",
  "roadmap.capacityView.sustainerNote":
    "Tie this to the sustainer tier. Members paying more should be able to see exactly which item their money unblocks.",
  "roadmap.capacityView.emptyRosterTitle": "No team members yet",
  "roadmap.capacityView.emptyRosterBody":
    "Add someone to the roster to see their building-now load here.",

  // ── Guides view ─────────────────────────────────────────────────────────
  "roadmap.guidesView.subtitle":
    "Resource guides that carry health, legal or safety information: track both review status and publish status here.",
  "roadmap.guidesView.reVerifyWarning_one":
    "{count} guide needs re-verifying. Health and legal information rots. {names}.",
  "roadmap.guidesView.reVerifyWarning_other":
    "{count} guides need re-verifying. Health and legal information rots. {names}.",
  "roadmap.guidesView.progressLabel": "Progress",
  "roadmap.guidesView.reviewerLabel": "Reviewer",
  "roadmap.guidesView.notAssigned": "Not assigned",
  "roadmap.guidesView.credentialNeeded": "credential needed",
  "roadmap.guidesView.reVerifyByLabel": "Re-verify by",
  "roadmap.guidesView.overdueLabel": "{days} days overdue",
  "roadmap.guidesView.dueInLabel": "in {days} days",
  "roadmap.guidesView.emptyTitle": "No guides yet",
  "roadmap.guidesView.emptyBody":
    "Tag a roadmap item as a resource guide to give it a review checklist.",

  // ── Member ideas view ───────────────────────────────────────────────────
  "roadmap.ideasView.ageSuffix": "{age} ago",
  "roadmap.ideasView.submittedByMember": "From a member",
  "roadmap.ideasView.submittedByTeam": "From the team",
  "roadmap.ideasView.duplicateHint": "Looks like a duplicate of {name}",
  "roadmap.ideasView.mergeInsteadCta": "Merge instead",
  "roadmap.ideasView.votesLabel": "votes",
  "roadmap.ideasView.mergeCta": "Merge",
  "roadmap.ideasView.declineCta": "Decline",
  "roadmap.ideasView.emptyTitle": "Inbox zero",
  "roadmap.ideasView.emptyBody":
    'Every member idea has been triaged. Declined ideas live under "Not building" with a reason attached.',

  // ── Not building view ───────────────────────────────────────────────────
  "roadmap.notBuildingView.publicBanner":
    "This page is public. Saying what you will not build, and why, is the most trust-building thing on the roadmap. Most platforms hide it.",
  "roadmap.notBuildingView.hadAskedLabel": "had asked",
  "roadmap.notBuildingView.reopenCta": "Reopen",
  "roadmap.notBuildingView.emptyTitle": "Nothing declined yet",
  "roadmap.notBuildingView.emptyBody":
    "When you decline a member idea it lands here with its reason.",

  // ── Archive view ────────────────────────────────────────────────────────
  "roadmap.archiveView.wasColumnLabel": "was {column}",
  "roadmap.archiveView.votesLabel": "votes",
  "roadmap.archiveView.restoreCta": "Restore",
  "roadmap.archiveView.deleteForGoodCta": "Delete for good",
  "roadmap.archiveView.deleteConfirmTitle": 'Delete "{name}" for good?',
  "roadmap.archiveView.deleteConfirmBody":
    "Deleting is forever. Archiving keeps the history. This can't be undone.",
  "roadmap.archiveView.emptyTitle": "Archive is empty",
  "roadmap.archiveView.emptyBody":
    "Archiving keeps the history without cluttering the board. Deleting is forever. Prefer archive.",

  // ── Public preview view ─────────────────────────────────────────────────
  "roadmap.publicPreview.banner_one":
    "This is what members see at /roadmap. {hidden} item hidden · {promises} committed as promises · hover any item to edit it inline.",
  "roadmap.publicPreview.banner_other":
    "This is what members see at /roadmap. {hidden} items hidden · {promises} committed as promises · hover any item to edit it inline.",
  "roadmap.publicPreview.editCta": "Edit",
  "roadmap.publicPreview.buildingHeading": "Building now",
  "roadmap.publicPreview.buildingSub": "What we are actually doing right now.",
  "roadmap.publicPreview.nextUpHeading": "Next up",
  "roadmap.publicPreview.nextUpSub":
    "Committed. Dates are targets, and we tell you when they move.",
  "roadmap.publicPreview.somedayHeading": "Someday, honestly",
  "roadmap.publicPreview.somedaySub": "We want these. No date would be a lie.",
  "roadmap.publicPreview.shippedHeading": "Shipped",
  "roadmap.publicPreview.shippedSub":
    "The changelog. Every one of these was asked for by someone in the community.",
  "roadmap.publicPreview.notBuildingHeading": "Not building this, and why",
  "roadmap.publicPreview.notBuildingSub":
    "The list most platforms hide. If we say no, you get a reason.",
  "roadmap.publicPreview.requestedTag": "You asked for this",
  "roadmap.publicPreview.committedTag": "Committed",
  "roadmap.publicPreview.noPublicNoteFallback":
    "No public note yet. Members won't see anything here until you add one.",
  "roadmap.publicPreview.movedOnce": "Moved once: from {from} to {to}.",
  "roadmap.publicPreview.movedMultiple":
    "Moved {count} times: from {from} to {to}.",
  "roadmap.publicPreview.noDateHonest": "No date, honestly",
  "roadmap.publicPreview.liveLabel": "Live",
  "roadmap.publicPreview.editItemTooltip": "Edit this item",

  // ── Toasts — feedback for every mutating action ────────────────────────
  "roadmap.toasts.moved": '"{name}" moved to {column}',
  "roadmap.toasts.bulkMoved_one": "{count} item moved to {column}",
  "roadmap.toasts.bulkMoved_other": "{count} items moved to {column}",
  "roadmap.toasts.published": "Now visible on the public roadmap",
  "roadmap.toasts.hidden": "Hidden from the public roadmap",
  "roadmap.toasts.duplicated": "Duplicated.",
  "roadmap.toasts.bulkPublished_one":
    "{count} item shown on the public roadmap",
  "roadmap.toasts.bulkPublished_other":
    "{count} items shown on the public roadmap",
  "roadmap.toasts.bulkHidden_one":
    "{count} item hidden from the public roadmap",
  "roadmap.toasts.bulkHidden_other":
    "{count} items hidden from the public roadmap",
  "roadmap.toasts.archived": '"{name}" archived',
  "roadmap.toasts.bulkArchived_one": "{count} item archived",
  "roadmap.toasts.bulkArchived_other": "{count} items archived",
  "roadmap.toasts.restored": '"{name}" restored',
  "roadmap.toasts.deleted": '"{name}" deleted',
  "roadmap.toasts.bulkDeleted_one": "{count} item deleted",
  "roadmap.toasts.bulkDeleted_other": "{count} items deleted",
  "roadmap.toasts.saved": "Saved. Public roadmap updated",
  "roadmap.toasts.dateMoved": "Date moved. Members will see the reason",
  "roadmap.toasts.safetyCleared": "Safety cleared and published",
  "roadmap.toasts.merged_one":
    "Merged. {votes} vote moved, and {name} was told where it went",
  "roadmap.toasts.merged_other":
    "Merged. {votes} votes moved, and {name} was told where it went",
  "roadmap.toasts.promoted_one": '"{name}" promoted. {votes} voter notified',
  "roadmap.toasts.promoted_other": '"{name}" promoted. {votes} voters notified',
  "roadmap.toasts.promoteError": "Couldn't promote that idea",
  "roadmap.toasts.declined": "Declined publicly with a reason. {name} was told",
  "roadmap.toasts.reopened": '"{name}" is back in the ideas queue',
  "roadmap.toasts.reopenError": "Couldn't reopen that idea",
  "roadmap.toasts.notified_one":
    "{count} voter notified. One email, no follow-ups",
  "roadmap.toasts.notified_other":
    "{count} voters notified. One email, no follow-ups",
  "roadmap.toasts.digestCopyFailed":
    "Couldn't copy. Select and copy the text instead.",
  "roadmap.toasts.digestCopied":
    "Digest copied. Paste it into the monthly email",
  "roadmap.toasts.auditExported": "Audit log exported for governance",
  "roadmap.toasts.boardReset": "Board reset to the seeded roadmap",

  // ── Landing page (/admin/landing) ───────────────────────────────────────
  "landing.header.eyebrow": "Live site",
  "landing.header.sub":
    "Curate the sections signed-out visitors see on the homepage.",
  "landing.quickLinks.heading": "Quick links",
  "landing.quickLinks.helper":
    "Each one opens in a new tab, the way a signed-out visitor sees it.",
  "landing.quickLinks.homepage": "Open homepage as a visitor",
  "landing.quickLinks.studio": "Open Studio landing as a visitor",
  "landing.quickLinks.opensInNewTab": "(opens in a new tab)",

  "landing.tabs.member": "Members",
  "landing.tabs.community": "Communities",
  "landing.tabs.changemaker": "Changemakers",

  "landing.helper.member":
    "Only public members who've opted in to be featured show up here. Nobody appears without saying yes first.",
  "landing.helper.community":
    "Any published community can be featured. Pick the ones you'd want a first-time visitor to see.",
  "landing.helper.changemaker":
    "Published changemaker profiles are ready to feature here.",

  "landing.picker.searchPlaceholder": "Search by name…",
  "landing.picker.searchAriaLabel": "Search who's eligible to feature",
  // Gathering and story picker search copy (PRD-323).
  "landing.picker.searchPlaceholder.gathering": "Search events by title…",
  "landing.picker.searchPlaceholder.story": "Search stories by title…",
  "landing.picker.searchAriaLabel.gathering":
    "Search the events you can feature",
  "landing.picker.searchAriaLabel.story": "Search the stories you can feature",
  "landing.picker.addCta": "Add",
  "landing.picker.submitCta": "Add to homepage",
  "landing.picker.addedToast": "Added to the homepage",
  "landing.picker.addError": "Couldn't add. Try again",
  "landing.picker.noResults": 'No matches for "{search}".',
  "landing.picker.empty.member":
    "Nobody eligible right now. Members need to opt in before they can appear here.",
  "landing.picker.empty.community":
    "No published communities are eligible yet.",
  "landing.picker.empty.changemaker":
    "No published changemaker profiles are eligible yet.",

  "landing.editor.quoteLabel": "Quote",
  "landing.editor.quoteHelper":
    "A short line in their own words: what QueerPulse means to them.",
  "landing.editor.quotePlaceholder":
    '"This is the first place I felt fully myself."',
  "landing.editor.blurbLabel": "Blurb",
  "landing.editor.blurbHelperOptional":
    "Optional: a line about what makes this community worth joining.",
  "landing.editor.blurbPlaceholder": "A line or two, in your own words.",
  "landing.editor.causeLabel": "Cause",
  "landing.editor.causePlaceholder": "e.g. Housing justice",
  "landing.editor.tagsLabel": "Tags",
  "landing.editor.tagsHelper":
    "Comma-separated: shown as small labels under their name.",
  "landing.editor.tagsPlaceholder": "housing, mutual aid, organizing",
  "landing.editor.editCta": "Edit copy",
  "landing.editor.collapseCta": "Close",
  "landing.editor.save": "Save",
  "landing.editor.savedToast": "Copy saved",
  "landing.editor.saveError": "Couldn't save. Try again",

  "landing.list.activeToggleAria": "Show {name} on the live homepage",
  "landing.list.activeToggleLabel": "Live",
  "landing.list.inactivePill": "Hidden by you",
  "landing.list.moveUpAria": "Move {name} up",
  "landing.list.moveDownAria": "Move {name} down",
  "landing.list.reorderError": "Couldn't reorder. Try again",
  "landing.list.activeToggleError": "Couldn't update. Try again",
  "landing.list.previewEmpty":
    "No copy yet. Add some so this reads well on the homepage.",
  "landing.list.unknownTarget": "This item no longer exists",
  "landing.list.empty.member.title": "No members featured yet",
  "landing.list.loadError.title": "The featured list didn't load",
  "landing.list.loadError.body":
    "This is an outage on our side. Features may be live on the landing page that this list could not read. Try again.",
  "landing.list.empty.member.body":
    "Search for a public member on the left and add them. Their quote will appear here, ready to edit.",
  "landing.list.empty.community.title": "No communities featured yet",
  "landing.list.empty.community.body":
    "Search for a published community on the left and add it to the homepage.",
  "landing.list.empty.changemaker.title": "No changemakers featured yet",
  "landing.list.empty.changemaker.body":
    "Search for a published changemaker profile on the left and add it to the homepage.",

  "landing.remove.cta": "Remove",
  "landing.remove.title": "Remove from the homepage?",
  "landing.remove.body":
    "This takes it off the live homepage. You can feature it again anytime.",
  "landing.remove.confirm": "Remove",
  "landing.remove.toast": "Removed from the homepage",
  "landing.remove.error": "Couldn't remove. Try again",

  // Backend-classified `hiddenReason` on an already-featured slot — see
  // `landingFeatures.adapters.ts`'s `HIDDEN_REASON_KEY`.
  "landing.hidden.consent_revoked": "Hidden: consent withdrawn",
  "landing.hidden.went_private": "Hidden: profile went private",
  "landing.hidden.unpublished": "Hidden: unpublished",
  "landing.hidden.not_public": "Hidden: no longer public",
  "landing.hidden.deleted": "Hidden: deleted",
  // Gathering and story sections (PRD-323): tabs, helpers, empty states, hidden reasons, kicker field.
  "landing.tabs.gathering": "Events",
  "landing.tabs.story": "Stories",
  "landing.helper.gathering":
    "Only published events that are open to everyone and still ahead show up here. An event leaves the homepage on its own once it ends or is cancelled.",
  "landing.helper.story":
    "Published original magazine stories are ready to feature here. A story leaves the homepage on its own if it is unpublished.",
  "landing.picker.empty.gathering":
    "No upcoming public events are eligible yet.",
  "landing.picker.empty.story": "No published stories are eligible yet.",
  "landing.list.empty.gathering.title": "No events featured yet",
  "landing.list.empty.gathering.body":
    "Search for an upcoming public event and add it to the homepage.",
  "landing.list.empty.story.title": "No stories featured yet",
  "landing.list.empty.story.body":
    "Search for a published story and add it to the homepage.",
  "landing.hidden.cancelled": "Hidden: cancelled",
  "landing.hidden.ended": "Hidden: already ended",
  "landing.editor.kickerLabel": "Kicker line",
  "landing.editor.kickerHelper":
    "Optional: a short line shown above the title, up to {max} characters.",
  // Live character count under the kicker field.
  "landing.editor.kickerCount": "{count}/{max}",
  "landing.editor.kickerPlaceholder.gathering": "e.g. Pick of the month",
  "landing.editor.kickerPlaceholder.story": "e.g. Editor's pick",

  // ── Live homepage preview (AdminLandingPreview) ─────────────────────────
  "landing.preview.eyebrow": "Homepage preview",
  "landing.preview.note":
    "How this section looks on the signed-out homepage. It updates as you edit.",
  "landing.preview.loading": "Building the preview…",
  "landing.preview.empty":
    "Nothing featured here yet. Pick something with the search to see the homepage preview.",
  "landing.preview.pendingTitle": "Added, details still loading",
  "landing.preview.pendingNote":
    "These show as full cards once their live data loads.",
  // Per-section pending notes for the gathering and story preview stages.
  "landing.preview.pendingNote.gathering":
    "These show as full rows once their live data loads.",
  "landing.preview.pendingNote.story":
    "These show as full cards once their live data loads.",

  // ── Press kit (/admin/press-kit) ──────────────────────────────────────────
  "pressKit.header.eyebrow": "Public site",
  "pressKit.header.sub":
    "Curate the press coverage and contacts shown on the public press kit.",

  "pressKit.tabs.coverage": "Coverage",
  "pressKit.tabs.team": "Team",

  "pressKit.fields.source": "Outlet",
  "pressKit.fields.sourcePlaceholder": "e.g. Público",
  "pressKit.fields.publishedOn": "Published",
  "pressKit.fields.publishedOnPlaceholder": "e.g. 4 Mar 2026",
  "pressKit.fields.title": "Headline",
  "pressKit.fields.titlePlaceholder": "The piece's headline, as published.",
  "pressKit.fields.meta": "Detail",
  "pressKit.fields.metaHelper":
    "Byline, length or format: shown under the headline.",
  "pressKit.fields.metaPlaceholder": "e.g. Long-form feature · by Ana Sá Lopes",
  "pressKit.fields.url": "Link",
  "pressKit.fields.urlHelper":
    "Optional: leave blank if there's no online version.",
  "pressKit.fields.urlPlaceholder": "https://…",
  "pressKit.fields.name": "Name",
  "pressKit.fields.namePlaceholder": "e.g. Marta Reis",
  "pressKit.fields.role": "Role",
  "pressKit.fields.rolePlaceholder": "e.g. Founder & director",
  "pressKit.fields.description": "What they speak to",
  "pressKit.fields.descriptionPlaceholder":
    "e.g. Speaks to strategy, funding and the platform's story.",
  "pressKit.fields.email": "Email",
  "pressKit.fields.emailPlaceholder": "name@queerpulse.app",
  "pressKit.fields.languages": "Languages",
  "pressKit.fields.languagesPlaceholder": "e.g. EN / PT",
  "pressKit.fields.avatarUrl": "Photo",
  "pressKit.fields.avatarUrlHelper": "Optional: a link to their headshot.",
  "pressKit.fields.avatarUrlPlaceholder": "https://…",

  "pressKit.add.coverage.cta": "Add coverage",
  "pressKit.add.coverage.submit": "Add to press kit",
  "pressKit.add.coverage.toast": "Coverage added",
  "pressKit.add.coverage.error": "Couldn't add. Try again",
  "pressKit.add.team.cta": "Add contact",
  "pressKit.add.team.submit": "Add to press kit",
  "pressKit.add.team.toast": "Contact added",
  "pressKit.add.team.error": "Couldn't add. Try again",

  "pressKit.list.inactivePill": "Hidden by you",
  "pressKit.list.loadError.title": "The press kit didn't load",
  "pressKit.list.loadError.body":
    "This is an outage on our side, so nothing is listed because nothing arrived. Try again.",
  "pressKit.list.previewEmpty": "No detail yet.",
  "pressKit.list.moveUpAria": "Move {name} up",
  "pressKit.list.moveDownAria": "Move {name} down",
  "pressKit.list.activeToggleAria": "Show {name} on the public press kit",
  "pressKit.list.activeToggleLabel": "Live",
  "pressKit.list.activeToggleError": "Couldn't update. Try again",
  "pressKit.list.reorderError": "Couldn't reorder. Try again",
  "pressKit.list.empty.coverage.title": "No coverage featured yet",
  "pressKit.list.empty.coverage.body":
    "Add a press piece above to show it on the public press kit.",
  "pressKit.list.empty.team.title": "No contacts listed yet",
  "pressKit.list.empty.team.body":
    "Add a press-desk contact above so journalists know who to reach.",

  "pressKit.editor.edit": "Edit",
  "pressKit.editor.close": "Close",
  "pressKit.editor.save": "Save",
  "pressKit.editor.savedToast": "Saved",
  "pressKit.editor.saveError": "Couldn't save. Try again",

  "pressKit.remove.cta": "Remove",
  "pressKit.remove.confirm": "Remove",
  "pressKit.remove.toast": "Removed from the press kit",
  "pressKit.remove.error": "Couldn't remove. Try again",
  "pressKit.remove.coverage.title": "Remove this coverage?",
  "pressKit.remove.coverage.body":
    "It will no longer appear on the public press kit. You can add it back later.",
  "pressKit.remove.team.title": "Remove this contact?",
  "pressKit.remove.team.body":
    "They will no longer appear on the public press kit. You can add them back later.",

  "pressKit.facts.title": "Facts (auto)",
  "pressKit.facts.sub":
    "Derived from platform data. Shown on the public press kit, and read-only here.",
  "pressKit.facts.empty": "No facts available yet.",

  // ── Housing listing integrity (Wave B1) — risk-sorted moderation queue ──
  // Admin-facing labels for a housing listing's pre-publish risk score, the
  // machine reasons behind it, and the report evidence snapshot. Server sends
  // stable codes; these turn them into human column/labels for a reviewer.

  // ── Consolidated platform reports (ADM-17/ADM-19) — /admin/reports ──
  "reports.title": "Platform <em>reports</em>",
  "reports.header.eyebrow": "Reporting",
  "reports.header.title": "Platform <em>reports</em>",
  "reports.header.sub":
    "Growth, reports by type, governance finance, and community health, in one place.",
  "reports.trends.title": "Growth & reports by type",
  "reports.trends.sub": "Adjust the range to see a longer or shorter window.",
  "reports.trends.rangeWeeks": "{count}w",
  "reports.trends.rangeYear": "1y",
  "reports.trends.growthSub": "Total members · last {count} weeks",
  "reports.trends.exportGrowth": "Export growth CSV",
  "reports.trends.exportReportsByType": "Export reports CSV",
  "reports.trends.exportToast": "Export started",
  "reports.trends.exportError": "Couldn't export. Try again",
  "reports.finance.title": "Governance finance",
  "reports.finance.sub": "Quarterly income, spending, and surplus.",
  "reports.finance.latestQuarter": "Latest quarter: {quarter}",
  "reports.finance.income": "Income: {amount}",
  "reports.finance.expense": "Spending: {amount}",
  "reports.finance.surplus": "Surplus: {amount}",
  "reports.finance.notEntered": "not entered yet",
  "reports.communityHealth.title": "Community health",
  "reports.communityHealth.sub":
    "A snapshot of every community's health score.",
  "reports.communityHealth.asOfNow": "As of {time}. A snapshot in time.",
  "reports.communityHealth.notMeasured": "Not measured yet",
  "reports.communityHealth.averageScore": "Average score: {score}",
  "reports.communityHealth.needingSupport": "{count} needing support",
  "reports.communityHealth.needsSupportChip": "Needs support",
  "reports.communityHealth.columns.name": "Community",
  "reports.communityHealth.columns.score": "Score",
  "reports.communityHealth.columns.activity": "Activity",
  "reports.communityHealth.columns.members": "Members",
  "reports.communityHealth.columns.openReports": "Open reports",

  "dashboard.viewFullReport": "View full report",
  "dashboard.landingVisits.title": "Landing page visits",
  "dashboard.landingVisits.sub": "Anonymous daily counts, no personal data",
  "dashboard.landingVisits.range30": "Last 30 days",
  "dashboard.landingVisits.range90": "Last 90 days",
  "dashboard.landingVisits.total_one": "{count} visit",
  "dashboard.landingVisits.total_other": "{count} visits",
  "dashboard.landingVisits.topSources": "Top sources",
  "dashboard.landingVisits.sourceDirect": "Direct or unknown",
  "dashboard.landingVisits.ariaLabel": "Daily landing page visits",
  "dashboard.landingVisits.empty":
    "No visits counted yet. Share the page and check back.",
  "dashboard.landingVisits.loadError": "Couldn't load landing page visits",
  "dashboard.landingVisits.retry": "Retry",
  "dashboard.landingVisits.tip_one": "{day}: {countLabel} visit",
  "dashboard.landingVisits.tip_other": "{day}: {countLabel} visits",
  "dashboard.landingVisits.tipCount_one": "{countLabel} visit",
  "dashboard.landingVisits.tipCount_other": "{countLabel} visits",
  "dashboard.landingVisits.rangeLabel": "Range",
  "dashboard.landingVisits.pageLabel": "Page",
  "dashboard.landingVisits.pageHome": "Homepage",
  "dashboard.landingVisits.pageStudio": "Studio page",
  "dashboard.landingVisits.subStudio":
    "Anonymous visits to the Studio page by signed-out visitors, per day",

  // ── CNT-14: admin resource-listings CRUD ────────────────────────────────
  "adminResourceListings.title": "Resource <em>listings</em>",
  "adminResourceListings.header.eyebrow": "Directory",
  "adminResourceListings.header.sub":
    "The real, vetted Legal Aid and Sexual Health Testing organisations members can contact. Publishing here is always a deliberate step: approving a suggestion records the decision and leaves the listing to you.",
  "adminResourceListings.newCta": "New listing",
  "adminResourceListings.empty":
    "No listings yet. Create the first one, or check the suggestions queue for ideas.",
  "adminResourceListings.loadError": "Couldn't load resource listings.",
  "adminResourceListings.category.legal_aid": "Legal Aid",
  "adminResourceListings.category.sexual_health_testing":
    "Sexual Health Testing",
  "adminResourceListings.status.active": "Active",
  "adminResourceListings.status.archived": "Archived",
  "adminResourceListings.row.noRegion": "No region set",
  "adminResourceListings.field.category": "Category",
  "adminResourceListings.field.title": "Title",
  "adminResourceListings.field.description": "Description",
  "adminResourceListings.field.region": "Region / address",
  "adminResourceListings.field.phone": "Phone",
  "adminResourceListings.field.email": "Email",
  "adminResourceListings.field.website": "Website",
  "adminResourceListings.field.status": "Status",
  "adminResourceListings.form.editEyebrow": "Edit listing",
  "adminResourceListings.form.editTitle": "Edit listing",
  "adminResourceListings.form.createTitle": "New listing",
  "adminResourceListings.form.createCta": "Create listing",
  "adminResourceListings.toast.created": '"{title}" was published.',
  "adminResourceListings.toast.updated": '"{title}" was updated.',
  "adminResourceListings.toast.removed": '"{title}" was removed.',
  "adminResourceListings.delete.title": 'Remove "{title}"?',
  "adminResourceListings.delete.body":
    "This listing will no longer be shown to members. This can't be undone from here.",
  "adminResourceListings.delete.confirmCta": "Remove listing",

  // ── CNT-14: admin resource-suggestions review queue ─────────────────────
  "adminResourceSuggestions.title": "Resource <em>suggestions</em>",
  "adminResourceSuggestions.header.eyebrow": "Review queue",
  "adminResourceSuggestions.header.title": "Resource <em>suggestions</em>",
  "adminResourceSuggestions.header.sub":
    "Every Legal Aid / Sexual Health Testing resource a member has suggested. Approving here only records the decision. Publish the real, verified listing by hand on Resource listings.",
  "adminResourceSuggestions.filter.all": "All categories",
  "adminResourceSuggestions.category.legal_aid": "Legal Aid",
  "adminResourceSuggestions.category.sexual_health_testing":
    "Sexual Health Testing",
  "adminResourceSuggestions.status.pending": "Pending",
  "adminResourceSuggestions.status.approved": "Approved",
  "adminResourceSuggestions.status.declined": "Declined",
  "adminResourceSuggestions.status.archived": "Archived",
  "adminResourceSuggestions.action.approve": "Approve",
  "adminResourceSuggestions.action.decline": "Decline",
  "adminResourceSuggestions.action.archive": "Archive",
  "adminResourceSuggestions.row.by": "Suggested by {name}",
  "adminResourceSuggestions.row.sent": "Sent {date}",
  "adminResourceSuggestions.unknownMember": "A member",
  // PRD-269: approving now creates the public listing in the same transaction,
  // so the admin confirms the fields the member typed from memory first.
  "adminResourceSuggestions.approve.eyebrow": "Approve and publish",
  "adminResourceSuggestions.approve.title":
    "Review the listing before it goes live",
  "adminResourceSuggestions.approve.body":
    "Approving publishes {name} to the public directory straight away. Check every field first: a member typed these details from memory and nobody has confirmed them.",
  "adminResourceSuggestions.approve.confirmCta": "Approve and publish",
  "adminResourceSuggestions.approve.noteLabel": "Note for the member",
  "adminResourceSuggestions.approve.notePlaceholder":
    "Optional. The person who suggested this reads it.",
  "adminResourceSuggestions.approve.contactRequired":
    "Add a phone number, an email or a website. A listing nobody can reach is not worth publishing.",
  "adminResourceSuggestions.publishedChip": "In the directory",
  "adminResourceSuggestions.empty": "No suggestions yet.",
  "adminResourceSuggestions.error": "Couldn't load resource suggestions.",
  "adminResourceSuggestions.loadMore": "Load more",
  "adminResourceSuggestions.loadingMore": "Loading…",
  "adminResourceSuggestions.toast.approved": "Suggestion approved.",
  "adminResourceSuggestions.toast.declined": "Suggestion declined.",
  "adminResourceSuggestions.toast.archived": "Suggestion archived.",
  "adminResourceSuggestions.toast.error": "Couldn't update that suggestion.",

  // ── Community tag requests (AdminCommunityTagRequestsPage) ────────────────
  "adminCommunityTagRequests.title": "Community tag <em>requests</em>",
  "adminCommunityTagRequests.header.eyebrow": "Review queue",
  "adminCommunityTagRequests.header.title": "Community tag <em>requests</em>",
  "adminCommunityTagRequests.header.sub":
    "Curated-tag suggestions from community owners and mods, for tags that don't exist yet.",
  "adminCommunityTagRequests.filter.pending": "Pending",
  "adminCommunityTagRequests.filter.resolved": "Resolved",
  "adminCommunityTagRequests.filter.all": "All",
  "adminCommunityTagRequests.status.pending": "Pending",
  "adminCommunityTagRequests.status.resolved": "Resolved",
  "adminCommunityTagRequests.row.by": "Requested by {name}",
  "adminCommunityTagRequests.row.sent": "Sent {date}",
  "adminCommunityTagRequests.unknownRequester": "A member",
  "adminCommunityTagRequests.withheldRequester": "Not shown here",
  "adminCommunityTagRequests.action.resolve": "Resolve",
  "adminCommunityTagRequests.empty": "No tag requests yet.",
  "adminCommunityTagRequests.error": "Couldn't load tag requests.",
  "adminCommunityTagRequests.loadMore": "Load more",
  "adminCommunityTagRequests.loadingMore": "Loading…",
  "adminCommunityTagRequests.toast.resolved": "Tag request resolved.",
  "adminCommunityTagRequests.toast.error": "Couldn't resolve that request.",

  // ── Community space requests (AdminCommunitySpaceRequestsPage) ────────────
  "adminCommunitySpaceRequests.title": "Space <em>requests</em>",
  "adminCommunitySpaceRequests.header.eyebrow": "Communities",
  "adminCommunitySpaceRequests.header.title": "Space <em>requests</em>",
  "adminCommunitySpaceRequests.header.sub":
    "Owners and co-owners asking to open spaces inside their community. Approving switches spaces on straight away.",
  "adminCommunitySpaceRequests.filter.open": "Open",
  "adminCommunitySpaceRequests.filter.approved": "Approved",
  "adminCommunitySpaceRequests.filter.declined": "Declined",
  "adminCommunitySpaceRequests.filter.all": "All",
  "adminCommunitySpaceRequests.status.open": "Open",
  "adminCommunitySpaceRequests.status.approved": "Approved",
  "adminCommunitySpaceRequests.status.declined": "Declined",
  "adminCommunitySpaceRequests.status.withdrawn": "Withdrawn",
  "adminCommunitySpaceRequests.row.by": "Requested by {name}",
  "adminCommunitySpaceRequests.row.sent": "Asked {age}",
  "adminCommunitySpaceRequests.row.declineReason": "Declined: {reason}",
  "adminCommunitySpaceRequests.unknownRequester": "A former member",
  "adminCommunitySpaceRequests.withheldRequester": "An owner or co-owner",
  "adminCommunitySpaceRequests.action.approve": "Approve",
  "adminCommunitySpaceRequests.action.decline": "Decline",
  "adminCommunitySpaceRequests.decline.eyebrow": "Space request",
  "adminCommunitySpaceRequests.decline.title": "Decline this request?",
  "adminCommunitySpaceRequests.decline.label": "Reason (optional)",
  "adminCommunitySpaceRequests.decline.placeholder":
    "What would help them ask again later?",
  "adminCommunitySpaceRequests.decline.hint":
    "The community's owner and moderators see this in their mod tools.",
  "adminCommunitySpaceRequests.decline.confirm": "Decline request",
  "adminCommunitySpaceRequests.empty": "No requests here.",
  "adminCommunitySpaceRequests.error": "Couldn't load space requests.",
  "adminCommunitySpaceRequests.loadMore": "Load more",
  "adminCommunitySpaceRequests.loadingMore": "Loading…",
  "adminCommunitySpaceRequests.toast.approved": "Spaces turned on for {name}",
  "adminCommunitySpaceRequests.toast.declined": "Request declined",
  "adminCommunitySpaceRequests.toast.notOpen":
    "This request was already decided or withdrawn.",
  "adminCommunitySpaceRequests.toast.error": "Couldn't save that. Try again.",

  // ── 2026-08-21 code-review 4.6 fixes ──
  "members.flagged.openMemberAriaLabel": "Open the member details for {handle}",
  "members.flagged.loadingDrawerLabel": "Loading member details",
  "members.flagged.loadErrorToast":
    "Couldn't load this member's details. Please try again",
  "adminListings.queerOwned.verifyCta": "Confirm queer-owned",
  "adminListings.queerOwned.unverifyCta": "Withdraw queer-owned",
  "adminListings.queerOwned.toast.verified":
    "{name} is now marked verified queer-owned.",
  "adminListings.queerOwned.toast.unverified":
    "The verified queer-owned badge was withdrawn from {name}.",
  "listingClaims.loadError.title": "The claims queue didn't load",
  "listingClaims.loadError.body":
    "This is an outage on our side, so the queue is blank because nothing arrived. Claims may still be pending. Try again.",
  "communities.grid.truncatedNotice":
    "The report scan hit its limit. Some recent reports may be missing from these health numbers.",
  "communities.queue.truncatedNotice":
    "The report scan hit its limit. Some of this community's reports may be missing from the list below.",
  "communities.settings.mod.removeFromCommunityAriaLabel":
    "Remove {name} from the community",
  "communities.settings.mod.removeFromCommunityConfirmTitle":
    "Remove {name} from this community?",
  "communities.settings.mod.removeFromCommunityConfirmBody":
    "{name} loses their moderator role and their place on the roster, and is notified that they were removed. Their posts stay. They can ask to join again, subject to the community's join rules.",
  "communities.settings.mod.removeFromCommunityCta": "Remove from community",
  "communities.settings.mod.removeFromCommunityConfirmBodyBarred":
    "{name} loses their moderator role and their place on the roster, and is notified that they were removed. Their posts stay. They can't ask to join this community again until its moderators lift the bar.",
  "communities.settings.mod.removeFromCommunityAndBarCta": "Remove and bar",
  "communities.settings.mod.removeFromCommunityBarLabel":
    "Also stop them rejoining this community",
  "communities.settings.mod.removeFromCommunityBarHint":
    "They are told they can't rejoin. The community's moderators can lift the bar later.",
  "communities.settings.mod.removedFromCommunityToast":
    "{name} was removed from the community",
  "communities.settings.mod.removeFromCommunityFailedToast":
    "Couldn't remove {name} from the community",
  "communities.settings.mod.removeFromCommunityOwnerError":
    "The founder can't be removed from their own community.",
  "governance.overview.badge.neverEdited": "Never edited",
  "governance.overview.badge.editedBy": "Edited by {name} on {date}",
  "governance.overview.edit.dragToReorder": "Drag to reorder",
  "governance.overview.edit.removeRow": "Remove this row",
  // The row action cluster names the item it acts on, so a screen reader
  // walking a section hears which row each button belongs to (ID-11).
  "governance.overview.edit.removeRowNamed": "Remove {label}",
  "governance.overview.edit.moveRowUp": "Move {label} up",
  "governance.overview.edit.moveRowDown": "Move {label} down",
  // Polite live region after a move button: the drag path is visible, the
  // button path needs its result spoken.
  "governance.overview.edit.rowMoved":
    "{label} moved to position {position} of {total}",
  // One save now covers all five sections, and saving is only half of getting
  // a change in front of members, so the toast says what is still owed.
  "governance.overview.edit.saved":
    "Saved to the draft. Publish when you are ready.",
  "governance.overview.edit.error": "Couldn't save. Please try again.",
  // ── Policy tab: the page-level draft ────────────────────────────────────
  // The five sections named plainly, with no markup. The rail, the review
  // sheet's group headings and the preview's "you are editing" line all read
  // from here, so all three call a section the same thing.
  "governance.policy.section.health": "Community health",
  "governance.policy.section.moderationSteps": "How moderation works",
  "governance.policy.section.council": "Advisory council",
  "governance.policy.section.principles": "Platform principles",
  "governance.policy.section.decisions": "Decision log",
  "governance.policy.section.unsaved": "Unsaved changes",

  "governance.policy.rail.label": "Governance page sections",
  "governance.policy.rail.head": "Sections",
  // Folding the rail leaves five icons; the names carry on in their tooltips.
  "governance.policy.rail.collapse": "Collapse sections",
  "governance.policy.rail.expand": "Expand sections",
  // Read beside the accent dot that replaces a clean section's row count.
  "governance.policy.rail.changed": "Has unsaved changes",
  "governance.policy.rail.rowCount_one": "{count} row",
  "governance.policy.rail.rowCount_other": "{count} rows",
  "governance.policy.rail.lastEdit": "Last edited",
  "governance.policy.rail.lastEditValue": "{date} by {name}",

  "governance.policy.bar.changes_one": "{count} change",
  "governance.policy.bar.changes_other": "{count} changes",
  "governance.policy.bar.changesDetail_one":
    "in {count} section. Nothing is public until you save and publish.",
  "governance.policy.bar.changesDetail_other":
    "across {count} sections. Nothing is public until you save and publish.",
  "governance.policy.bar.clean": "No unsaved changes",
  "governance.policy.bar.cleanDetail": "The public page matches this draft.",
  "governance.policy.bar.review": "Review changes",
  "governance.policy.bar.discard": "Discard",
  "governance.policy.bar.discarded": "Draft reset to the published version.",
  "governance.policy.bar.save": "Save all changes",

  "governance.policy.review.eyebrow": "Governance page",
  "governance.policy.review.title": "Before you save",
  "governance.policy.review.sub":
    "These are the differences between your draft and what members can read right now.",
  "governance.policy.review.keepEditing": "Keep editing",
  "governance.policy.review.note": "Why (optional, shown in the audit log)",
  "governance.policy.review.notePlaceholder":
    "e.g. Q2 figures signed off by the council",

  "governance.policy.diff.empty": "empty",
  "governance.policy.diff.row": "Row {index}",
  "governance.policy.diff.added": "New row: {value}",
  "governance.policy.diff.removed": "Row removed: {value}",

  "governance.policy.field.stat": "Stat",
  "governance.policy.field.trendArrow": "Trend arrow",
  "governance.policy.field.step": "Step",
  "governance.policy.field.stepText": "What members read",
  "governance.policy.field.promise": "Promise",
  "governance.policy.field.entry": "Entry",

  "governance.policy.add.stat": "Add a stat",
  "governance.policy.add.step": "Add a step",

  "governance.policy.hint.wordingInBundle":
    "The wording lives in the translation bundle. This list controls the order and what appears.",

  // Every control in a row is named by the row it belongs to. Six identical
  // "Figure" boxes down a reorderable list is exactly what the BUDGET=0 a11y
  // gate exists to catch, and the column head alone cannot fix it.
  "governance.policy.aria.figure": "Figure for {label}",
  "governance.policy.aria.trend": "Trend line for {label}",
  "governance.policy.aria.trendCount": "Trend number for {label}",
  "governance.policy.aria.up": "Show {label} as an increase",
  "governance.policy.aria.seatMember": "Who holds the seat: {label}",
  "governance.policy.aria.tint": "Avatar colour for {label}",
  "governance.policy.aria.icon": "Icon for {label}",

  "governance.policy.preview.label": "Public page, live",
  "governance.policy.preview.open": "Public preview",
  "governance.policy.preview.collapse": "Hide the live preview",
  "governance.policy.preview.expand": "Show the live preview",
  "governance.policy.preview.url": "queerpulse.com/governance",
  "governance.policy.preview.languageHint":
    "The preview shows the language this console is in.",
  "governance.policy.preview.zoomLabel": "Preview zoom",
  "governance.policy.preview.zoomFit": "Fit",
  "governance.policy.preview.zoomFull": "100%",
  "governance.policy.preview.editing":
    "Editing {section}, highlighted in the preview. Nothing here is public until you save and publish.",
  "governance.policy.preview.emptySection":
    "Nothing listed. Members would meet an empty section here.",
  // PRD-265: authored (non-seeded) overview entries. `{label}` is the field
  // name, so a screen reader hears "Decision, English" rather than five
  // identical "English" boxes down a reorderable list.
  "governance.overview.edit.textEn": "{label}, English",
  "governance.overview.edit.textPt": "{label}, Portuguese",
  "governance.overview.edit.restoreSeeded": "Restore a bundle entry",
  "governance.overview.edit.needsBothLanguages":
    "Fill in English and Portuguese for every entry you wrote. Nothing here gets translated later.",
  "governance.overview.decisions.addDecision": "Add a decision",
  "governance.overview.decisions.newEntry": "New decision",
  "governance.overview.decisions.field.lead": "Decision",
  "governance.overview.decisions.field.body": "What happened",
  "governance.overview.principles.addPrinciple": "Add a principle",
  "governance.overview.principles.newEntry": "New principle",
  "governance.overview.principles.field.titleText": "Principle",
  "governance.overview.principles.field.bodyText": "What it means",
  "governance.overview.council.newSeat": "New seat",
  "governance.overview.health.title": "Community <em>health</em>",
  "governance.overview.health.sub":
    "The stats on the public Governance page, in the order members see them. Active members is counted live and can't be typed here.",
  "governance.overview.health.field.value": "Figure",
  "governance.overview.health.field.trend": "Trend line",
  "governance.overview.health.field.trendCount": "Trend number",
  "governance.overview.health.field.up": "Show as an increase",
  // The switch's state read aloud beside it, so an editor sees which way the
  // public card will lean without decoding a bare toggle.
  "governance.overview.health.field.upOn": "Arrow and green tint",
  "governance.overview.health.field.upOff": "Plain, no arrow",
  // Sits in the trend-number column for the three trend lines whose public
  // wording has no {count} slot, so the column never reads as an empty box.
  "governance.overview.health.field.trendCountUnused":
    "Not used by this trend line.",
  "governance.overview.moderation.title": "How moderation <em>works</em>",
  "governance.overview.moderation.sub":
    "The steps members read on the public Governance page, in the order they happen.",
  "governance.overview.council.title": "Advisory <em>council</em>",
  "governance.overview.council.sub":
    "Who sits on the council, and in what order they appear on the public Governance page. Seats are held by platform staff.",
  "governance.overview.council.field.member": "Seat held by",
  "governance.overview.council.pickMember": "Pick a staff member…",
  "governance.overview.council.needsMember":
    "Every seat needs a staff member in it before this can be saved.",
  "governance.overview.council.offRoster": "{name} · no longer staff",
  "governance.overview.council.unresolvedMember":
    "This member no longer exists",
  "governance.overview.council.field.role": "Role",
  "governance.overview.council.field.tint": "Avatar colour",
  "governance.overview.council.addSeat": "Add a seat",
  "governance.overview.principles.title": "Platform <em>principles</em>",
  "governance.overview.principles.sub":
    "The promises listed on the public Governance page, in the order members read them.",
  "governance.overview.principles.field.icon": "Icon",
  "governance.overview.decisions.title": "Recent <em>decisions</em>",
  "governance.overview.decisions.sub":
    "Which decisions appear in the public log, newest first.",
  "members.verify.mutualLabel": "Mutual member",
  "errors.updatePartner": "Couldn't update that partner",
  "errors.saveChanges": "Couldn't save those changes",
  "errors.createCoop": "Couldn't create that co-op",
  "errors.createTier": "Couldn't create that tier",
  "errors.saveDecision": "Couldn't save that decision",
  "errors.removeListing": "Couldn't remove that listing",
  "errors.updateCoop": "Couldn't update that co-op",
  "errors.removeCoop": "Couldn't remove that co-op",
  "errors.saveTestimonial": "Couldn't save that testimonial",
  "errors.updateTier": "Couldn't update that tier",
  "errors.removeTier": "Couldn't remove that tier",
  "errors.createListing": "Couldn't create that listing",
  "errors.saveChange": "Couldn't save that change",
  "errors.updateTargetDate": "Couldn't update the target date",
  "errors.updateVisibility": "Couldn't update visibility",
  "errors.createItem": "Couldn't create that item",
  "errors.archiveItem": "Couldn't archive that item",
  "errors.deleteItem": "Couldn't delete that item",
  "errors.restoreItem": "Couldn't restore that item",
  "errors.saveStat": "Couldn't save that stat",
  "governance.finances.edit.field.amountInvalid":
    "Write this as a number. 1840, 1840.50 and 1 840,50 all work.",
  "governance.finances.edit.field.amountRequired":
    "This line needs an amount. Switch the line off if it no longer applies.",
  "governance.finances.edit.field.newLine": "New line {position}",
  "governance.finances.edit.blockedByAmounts":
    "Saving is on hold until every highlighted amount reads as a number.",
  "governance.finances.edit.addLine": "Add a line",
  "governance.finances.edit.breakdown.toggle": "Split into items",
  "governance.finances.edit.breakdown.toggleCount_one": "{count} item",
  "governance.finances.edit.breakdown.toggleCount_other": "{count} items",
  "governance.finances.edit.breakdown.readsAs": "Reads as {amount}",
  "governance.finances.edit.breakdown.amountRequired":
    "Add an amount, or remove this item.",
  "governance.finances.edit.breakdown.amountNegative":
    "Use an amount of zero or more.",
  "governance.finances.edit.breakdown.amountTooPrecise":
    "Use at most two decimals and up to 12 digits.",
  "governance.finances.edit.breakdown.sumCaption_one": "Sum of {count} item",
  "governance.finances.edit.breakdown.sumCaption_other": "Sum of {count} items",
  "governance.finances.edit.breakdown.empty":
    "Add items and this line's amount becomes their total.",
  "governance.finances.edit.breakdown.col.name": "Name",
  "governance.finances.edit.breakdown.col.period": "Detail",
  "governance.finances.edit.breakdown.col.amount": "Amount",
  "governance.finances.edit.breakdown.newItem": "Item {position}",
  "governance.finances.edit.breakdown.aria.name": "Item {position}: name",
  "governance.finances.edit.breakdown.aria.period": "{label}: detail",
  "governance.finances.edit.breakdown.aria.amount": "{label}: amount",
  "governance.finances.edit.breakdown.namePlaceholder": "e.g. Hosting",
  "governance.finances.edit.breakdown.periodPlaceholder": "e.g. €15/mo",
  "governance.finances.edit.breakdown.remove": "Remove {label}",
  "governance.finances.edit.breakdown.add": "Add an item",
  "governance.finances.edit.breakdown.full": "A line holds up to {max} items.",
  "governance.finances.edit.breakdown.blocked":
    "Fix the highlighted breakdown items before saving.",
  "governance.finances.edit.blockedByLabels":
    "Every ledger line needs a name before you can save.",
  "governance.finances.status.public":
    "{quarter} is shown on the public Governance page.",
  "governance.finances.status.hidden":
    "{quarter} stays off the public Governance page until every headline figure is entered.",
  "governance.finances.report.cta": "Edit public report",
  "governance.finances.report.title": "Edit the <em>public report</em>",
  "governance.finances.report.sub":
    "The tiles, notes, partners and reserve the Governance page shows beside this quarter's figures. Each list is saved whole.",
  "governance.finances.report.section.stats": "Stat tiles",
  "governance.finances.report.section.notes": "How event finances work",
  "governance.finances.report.section.partners": "Disclosed partners",
  "governance.finances.report.section.reserve": "Operational reserve",
  "governance.finances.report.col.figure": "Figure",
  "governance.finances.report.col.label": "Label",
  "governance.finances.report.col.trend": "Trend",
  "governance.finances.report.col.rising": "Rising",
  "governance.finances.report.col.lead": "Lead",
  "governance.finances.report.col.text": "Text",
  "governance.finances.report.col.name": "Name",
  "governance.finances.report.col.amount": "Amount",
  "governance.finances.report.col.scope": "Restricted to",
  "governance.finances.report.col.held": "Held now",
  "governance.finances.report.col.target": "Target",
  "governance.finances.report.col.remove": "Remove",
  "governance.finances.report.add.stat": "Add a tile",
  "governance.finances.report.add.note": "Add a note",
  "governance.finances.report.add.partner": "Add a partner",
  "governance.finances.report.remove": "Remove row {position}",
  "governance.finances.report.empty": "Nothing here yet.",
  "governance.finances.report.aria.field": "{column}, row {position}",
  "governance.finances.report.reserveHint":
    "Leave both empty to hide the reserve.",
  "governance.finances.report.saved": "Public report updated.",
  "governance.finances.report.blockedByText":
    "Every tile needs a figure and a label, every note a lead, and every partner a name and a restriction.",
  "governance.finances.quarter.cta": "Open next quarter",
  "governance.finances.quarter.title": "Open a <em>quarter</em>",
  "governance.finances.quarter.sub":
    "Starts an empty report for the governance team to fill in. It stays off the public page until every headline figure is entered.",
  "governance.finances.quarter.field.quarter": "Quarter",
  "governance.finances.quarter.field.year": "Year",
  "governance.finances.quarter.option": "Q{quarter}",
  "governance.finances.quarter.label": "Q{quarter} {year}",
  "governance.finances.quarter.save": "Open quarter",
  "governance.finances.quarter.saved": "Quarter opened.",
  "governance.finances.quarter.error":
    "Could not open that quarter. Check that the newest quarter has every headline figure entered, and that this one comes after it and has no report yet.",
  "moderation.action.created": "Report received",
  "moderation.action.appealOverturned": "Appeal overturned",
  "moderation.action.conversationContextViewed":
    "Opened the conversation around the reported message",
  "moderation.action.messageDeletedByStaff": "Deleted a message for everyone",
  "moderation.action.reportMessageAttachmentViewed":
    "Opened the file attached to the reported message",
  "moderation.action.creatorDraftViewed": "Viewed a creator draft",
  "moderation.oldestNote_one":
    "Showing {count} open report · the oldest landed {oldest}",
  "moderation.oldestNote_other":
    "Showing {count} open reports · the oldest landed {oldest}",
  "members.drawer.label": "{name}, member detail",
  "members.flagged.openReportsCta": "Open reports",
  "members.flagged.openReportsAriaLabel": "Open the reports about {handle}",
  "modPanel.members.unavailableToast":
    "We couldn't act on {name}'s row. Reload the members list and try again.",
  "modPanel.members.roleErrorToast":
    "{name}'s role didn't change. Nothing was saved, so try again in a moment.",
  "modPanel.members.removeErrorToast":
    "{name} is still in the community. The removal didn't go through.",
  "modPanel.members.removeConfirm.title": "Remove {name}?",
  "modPanel.members.removeConfirm.body":
    "{name} loses access to this community's posts and events straight away. They can ask to join again later, and you'd review that like any other request.",
  "modPanel.members.removeConfirm.cta": "Yes, remove them",
  "modPanel.requests.errorToast":
    "{name}'s request is still waiting. That decision didn't go through.",
  "modPanel.requests.approveAllConfirm.title_one": "Approve this request?",
  "modPanel.requests.approveAllConfirm.title_other":
    "Approve all {count} requests?",
  "modPanel.requests.approveAllConfirm.body_one":
    "They join the community right away. You can still remove someone later from the Members tab.",
  "modPanel.requests.approveAllConfirm.body_other":
    "All {count} of them join the community right away. You can still remove someone later from the Members tab.",
  "modPanel.requests.approveAllConfirm.cta": "Yes, approve them",
  "modPanel.requests.approvedSomeToast":
    "{approved} approved. {failed} didn't go through and are still waiting for you.",
  "modPanel.requests.approveAllFailedToast_one":
    "That request didn't go through. It's still waiting for you.",
  "modPanel.requests.approveAllFailedToast_other":
    "None of the {count} requests went through. They're all still waiting for you.",
  "common.notSet": "Not set",
  "vouchGraph.pathSeparator": "to",
  "roadmap.modals.auditLog.empty": "No changes recorded yet.",
  "media.delete.confirmAnyway": "Delete anyway",
  "media.delete.refusedTitle": "This file is still in use",
  "media.delete.refusedInUse_one":
    "The server checked again and this file is still used in {count} place, listed below. Deleting it now breaks that image for good, and the override is logged.",
  "media.delete.refusedInUse_other":
    "The server checked again and this file is still used in {count} places, listed below. Deleting it now breaks those images for good, and the override is logged.",
  "media.delete.refusedUnverified":
    "The server couldn't check where this file is used, so it refused to delete it. Try again in a moment, or delete anyway if this is a takedown that can't wait. The override is logged.",
  "media.delete.liveCoverScene": "Scene: {label}",
  "media.delete.liveCoverRelease": "Release: {label}",
  "media.delete.liveCoverLandingPhoto.hero": "Studio page: hero photo",
  "media.delete.liveCoverLandingPhoto.manifesto":
    "Studio page: manifesto photo",
  "errors.deleteMediaObject": "Couldn't delete that file",
  "errors.mediaLiveCover":
    "This image is in use as the cover of a live scene or release, or as a Studio page photo. Deleting it leaves that image broken until someone replaces it.",
  "roadmap.modals.digest.movedLine": "moved from {from} to {to}",

  // ── 2026-08-21 code-review 4.6: dynamic-key siblings ──
  "listingClaims.filter.pending": "Pending",
  "listingClaims.filter.approved": "Approved",
  "listingClaims.filter.declined": "Declined",
  "listingClaims.filter.all": "All",
  "listingClaims.status.pending": "Pending",
  "listingClaims.status.approved": "Approved",
  "listingClaims.status.declined": "Declined",
  "listingClaims.toast.approved": "{name} now belongs to its claimant.",
  "listingClaims.toast.declined": "The claim on {name} was declined.",
  // ENG-41: the pending queue is paginated, so its real depth and the rows
  // loaded so far are different numbers.
  "listingClaims.pendingCount_one": "{count} claim waiting",
  "listingClaims.pendingCount_other": "{count} claims waiting",
  "listingClaims.loadMore": "Load more claims",
  "listingClaims.loadingMore": "Loading…",
  "listingClaims.intro":
    "Members who say they run a place listed here. Approving makes them its owner.",
  "listingClaims.emptyState.pending.title": "No claims waiting",
  "listingClaims.emptyState.pending.body":
    "When a member says they run a place in the directory, their claim lands here for review.",
  "listingClaims.emptyState.approved.title": "No approved claims yet",
  "listingClaims.emptyState.approved.body":
    "Claims you approve show up here while this page stays open.",
  "listingClaims.emptyState.declined.title": "No declined claims yet",
  "listingClaims.emptyState.declined.body":
    "Claims you decline show up here while this page stays open.",
  "listingClaims.emptyState.all.title": "Nothing to review",
  "listingClaims.emptyState.all.body":
    "Pending claims show up here, along with the ones you decide while this page stays open.",
  "listingClaims.row.filed": "Filed {date}",
  "listingClaims.row.waiting_one": "Waiting {count} day",
  "listingClaims.row.waiting_other": "Waiting {count} days",
  "listingClaims.row.waited_one": "Waited {count} day",
  "listingClaims.row.waited_other": "Waited {count} days",
  "listingClaims.row.claimantLabel": "Claimed by",
  "listingClaims.row.formerMember": "a member who has since left",
  "listingClaims.row.noteLabel": "Their note",
  "listingClaims.row.openListingAria": "Open {name} in the listing editor",
  "listingClaims.row.approveCta": "Approve claim",
  "listingClaims.row.approveAria": "Approve claim on {name}",
  "listingClaims.row.declineCta": "Decline claim",
  "listingClaims.row.declineAria": "Decline claim on {name}",
  "listingClaims.approveConfirm.title": "Approve the claim on {listing}?",
  "listingClaims.approveConfirm.body":
    "This makes {claimant} the owner of {listing}, and they can edit its page from then on.",
  "governance.overview.health.stat.activeMembers": "Active members",
  "governance.overview.health.stat.retention": "Member retention rate",
  "governance.overview.health.stat.reportsFiled": "Reports filed this quarter",
  "governance.overview.health.stat.membersRemoved": "Members removed",
  "governance.overview.health.stat.gatheringsHosted": "Events hosted",
  "governance.overview.health.stat.appealUpheld": "Moderation appeal upheld",
  "governance.overview.health.trend.upThisQuarter": "Up this quarter",
  "governance.overview.health.trend.steady": "Steady",
  "governance.overview.health.trend.allResolved": "All resolved",
  "governance.overview.health.trend.cocViolations": "Code of care violations",
  "governance.overview.health.trend.upVsQ1": "Up vs Q1",
  "governance.overview.health.trend.ofFiled": "of those filed",
  "governance.overview.moderation.step.reportFiled": "Report filed",
  "governance.overview.moderation.step.review": "Review within 48 hours",
  "governance.overview.moderation.step.decision": "Decision and communication",
  "governance.overview.moderation.step.appeal": "Right to appeal",
  "governance.overview.council.role.psychologistChair": "Psychologist · Chair",
  "governance.overview.council.role.lawyerLegalAdvisor":
    "Lawyer · Legal advisor",
  "governance.overview.council.role.housingActivist": "Housing activist",
  "governance.overview.council.role.healthcareAdvocate": "Healthcare advocate",
  "governance.overview.council.tint.jade": "Jade",
  "governance.overview.council.tint.violet": "Violet",
  "governance.overview.council.tint.plum": "Plum",
  "governance.overview.principles.key.noSellingData":
    "We will never sell member data",
  "governance.overview.principles.key.visibilityChoice":
    "Visibility is always your choice",
  "governance.overview.principles.key.noAlgorithms":
    "No algorithms deciding who you see",
  "governance.overview.principles.key.communityVoice":
    "Community has a voice in decisions",
  "governance.overview.principles.key.transparency":
    "Transparency is non-negotiable",
  "governance.overview.principles.key.accessNotConditional":
    "Access is not conditional on ability to pay",
  "governance.overview.principles.icon.lock": "Padlock",
  "governance.overview.principles.icon.eye": "Eye",
  "governance.overview.principles.icon.slash": "Crossed circle",
  "governance.overview.principles.icon.message": "Message bubble",
  "governance.overview.principles.icon.book": "Book",
  "governance.overview.principles.icon.accessible": "Accessibility",
  "governance.overview.decisions.key.slidingScale":
    "May 2026: Sliding scale introduced for events",
  "governance.overview.decisions.key.forumLaunched":
    "April 2026: Forum launched",
  "governance.overview.decisions.key.visibilityDefaults":
    "March 2026: Visibility defaults made more conservative",
  "governance.overview.decisions.key.languageToggle":
    "February 2026: Language toggle added",

  // ── 2026-08-21 code-review 4.6 fixes ──
  "moderation.resolved.closedAt": "Closed {age}",
  "moderation.resolved.resolvedBy": "Resolved by {name}: {note}",
  "moderation.notified.member": "Member notified",
  "moderation.notified.reporter": "Reporter notified",
  "moderation.notified.affected": "Affected member supported",
  "moderation.reporter.anonymous": "anonymous",
  "communities.queue.status.open": "Open",
  "communities.queue.status.resolved": "Resolved",
  "communities.queue.status.escalated": "Escalated",

  // ── ID-04 · Data-subject request (DSAR) review queue (/admin/dsar) ──
  // A DSAR starts a 30-day statutory clock the moment a member files it, so
  // every string here is written around that clock. Nothing in this block may
  // promise email: the only channel this platform has is a QueerPulse
  // notification.
  "adminDsar.navLabel": "Data requests",
  "adminDsar.title": "Data <em>requests</em>",
  "adminDsar.header.eyebrow": "Review queue",
  "adminDsar.header.title": "Data-subject <em>requests</em>",
  "adminDsar.header.sub":
    "Every data request members have filed, closest statutory deadline first. Each one has 30 days.",
  "adminDsar.header.subOverdue":
    "Closest statutory deadline first. Past their 30-day deadline right now: {count}.",
  "adminDsar.filter.received": "Received",
  "adminDsar.filter.in_review": "In review",
  "adminDsar.filter.resolved": "Resolved",
  "adminDsar.filter.rejected": "Rejected",
  "adminDsar.filter.all": "All",
  "adminDsar.status.received": "Received",
  "adminDsar.status.in_review": "In review",
  "adminDsar.status.resolved": "Resolved",
  "adminDsar.status.rejected": "Rejected",
  "adminDsar.article.access": "Access (Art. 15)",
  "adminDsar.article.rectification": "Rectification (Art. 16)",
  "adminDsar.article.erasure": "Erasure (Art. 17)",
  "adminDsar.article.objection": "Objection (Art. 21)",
  "adminDsar.clock.overdue": "{days} days overdue",
  "adminDsar.clock.dueToday": "Due today",
  "adminDsar.clock.urgent": "{days} days left",
  "adminDsar.clock.remaining": "{days} days left",
  "adminDsar.clock.closed": "Clock stopped",
  "adminDsar.row.openAriaLabel": "Open data request {reference}",
  "adminDsar.row.filedBy": "Filed by {name}",
  "adminDsar.row.dueBy": "Answer due by {date}",
  "adminDsar.unknownMember": "A member",
  "adminDsar.erasedMember": "Erased member",
  "adminDsar.detailsErased": "Removed when the member erased their account.",
  "adminDsar.outcome.notifyHintErased":
    "This member has erased their account, so nobody will be notified.",
  "adminDsar.outcome.closedHintErased":
    "This request is closed. The member has since erased their account.",
  "adminDsar.drawer.label": "Data request {reference}",
  "adminDsar.drawer.member": "Filed by",
  "adminDsar.drawer.asked": "What they asked for",
  "adminDsar.drawer.scopes": "Data they named",
  "adminDsar.drawer.filed": "Filed",
  "adminDsar.drawer.due": "Statutory deadline",
  "adminDsar.drawer.answered": "Answered",
  "adminDsar.drawer.context": "Filed from",
  "adminDsar.drawer.outcome": "Outcome",
  "adminDsar.outcome.label": "Outcome note",
  "adminDsar.outcome.placeholder": "What did we do about this request?",
  "adminDsar.outcome.notifyHint":
    "Closing a request sends the member a QueerPulse notification. No email is sent.",
  "adminDsar.outcome.requiredHint":
    "Write an outcome note before you close a request.",
  "adminDsar.outcome.closedHint":
    "This request is closed. The member was notified in QueerPulse.",
  "adminDsar.action.startReview": "Start review",
  "adminDsar.action.resolve": "Resolve",
  "adminDsar.action.reject": "Reject",
  "adminDsar.toast.in_review": "Moved to in review.",
  "adminDsar.toast.resolved": "Request resolved. The member has been notified.",
  "adminDsar.toast.rejected": "Request rejected. The member has been notified.",
  "adminDsar.toast.movedOn":
    "This request already moved on. Reload the queue to see where it went.",
  "adminDsar.toast.error": "Couldn't update that request.",
  "adminDsar.empty": "No data requests in this filter.",
  "adminDsar.error": "Couldn't load data requests.",
  "adminDsar.loadMore": "Load more",
  "adminDsar.loadingMore": "Loading…",

  // ── Topic directory console (/admin/topics, SOC-01) ───────────────────────
  "topics.eyebrow": "Discovery",
  "topics.title": "Topic <em>directory</em>",
  "topics.sub":
    "The interest graph behind /topics, every topic page, and the topic results in search. Archiving retires a topic and keeps its posts and its followers.",
  "topics.newCta": "New topic",
  "topics.empty":
    "No topics yet. Create the first one and it is in the directory straight away.",
  "topics.loadError": "Couldn't load the topic directory.",
  "topics.postsCount_one": "{count} post",
  "topics.postsCount_other": "{count} posts",
  "topics.followersCount_one": "{count} follower",
  "topics.followersCount_other": "{count} followers",
  "topics.crisisBadge": "Crisis support card",
  "topics.archivedBadge": "Archived",
  "topics.archiveCta": "Archive",
  "topics.restoreCta": "Restore",
  "topics.archiveError": "Couldn't change that topic's archive state.",
  "topics.deleteError": "Couldn't delete that topic.",
  "topics.toast.created": "#{tag} is live in the directory.",
  "topics.toast.updated": "#{tag} updated.",
  "topics.toast.archived": "#{tag} archived. Its posts and followers are kept.",
  "topics.toast.restored": "#{tag} is back in the directory.",
  "topics.toast.deleted": "#{tag} deleted.",
  "topics.form.createTitle": "New topic",
  "topics.form.createCta": "Create topic",
  "topics.form.saveError": "Couldn't save that topic.",
  "topics.form.tagField": "Tag",
  "topics.form.tagHint":
    "Lowercase letters, numbers and hyphens. This becomes the page address and the hashtag members write.",
  "topics.form.tagLockedHint":
    "A tag can't change: it is the page address, the hashtag already inside posts, and the key every follow is stored under. Archive this topic and create the new tag.",
  "topics.form.labelField": "Label",
  "topics.form.labelHint":
    'The plain name shown in the directory and in search, for example "Mental health".',
  "topics.form.descriptionField": "Description",
  "topics.form.descriptionHint":
    "One or two sentences on what belongs here. Shown on the directory card and at the top of the topic page.",
  "topics.form.crisisField": "Show the crisis support card",
  "topics.form.crisisHint":
    "Adds the crisis support panel to this topic's sidebar, for topics where someone may arrive in a hard moment.",
  "topics.delete.title": "Delete #{tag}?",
  "topics.delete.body":
    "This destroys the topic along with {posts} posts and {followers} follows. Archiving takes it out of the directory just the same and keeps all of it.",
  "topics.delete.confirmCta": "Delete topic",

  // ── Resource guide console (CON-08 / CON-09) ────────────────────────────
  // The editorial surface for the ~31 resource guides: edit the prose,
  // stamp a review, see what is stale.
  // ── PRD-264: the admin glossary console ─────────────────────────────────
  // Nested under /admin/resource-guides so it inherits that path's
  // `resource_curator` entry in authGate's CAPABILITY_ELEVATED_PATTERNS.
  "adminGlossary.title": "The <em>glossary</em>",
  "adminGlossary.guidesBreadcrumb": "Resource guides",
  "adminGlossary.header.eyebrow": "Editorial",
  "adminGlossary.header.sub":
    "Every term readers see, stalest first. Add a word, fix a definition, and finish the Portuguese: a term with no Portuguese still shows the English one, so the gap is invisible from the outside.",
  "adminGlossary.searchLabel": "Search terms",
  "adminGlossary.searchPlaceholder": "Term, slug or category",
  "adminGlossary.newTermCta": "Add a term",
  "adminGlossary.untranslatedBanner_one":
    "{count} term has no Portuguese definition yet.",
  "adminGlossary.untranslatedBanner_other":
    "{count} terms have no Portuguese definition yet.",
  "adminGlossary.empty":
    "No terms yet. Add the first one, or run the backfill migration.",
  "adminGlossary.noMatches": "No term matches that search.",
  "adminGlossary.viewPublicGlossaryCta": "Open the public glossary",
  "adminGlossary.loadError.title": "We couldn't load the <em>glossary.</em>",
  "adminGlossary.loadError.body":
    "The term list didn't come back. Try again in a moment.",
  "adminGlossary.row.noPortuguese": "No Portuguese",

  // Glossary term preview modal
  "adminGlossary.preview.rowCta": "Preview",
  "adminGlossary.preview.title": "How readers see this term",
  "adminGlossary.preview.intro":
    "This is the term as the public glossary shows it right now. Terms are public as soon as they are saved, whether or not anyone has reviewed them.",
  "adminGlossary.preview.englishLabel": "English",
  "adminGlossary.preview.portugueseLabel": "Portuguese",
  "adminGlossary.preview.fallbackNotice":
    "This term has no Portuguese definition yet, so readers browsing in Portuguese see the English definition below.",
  "adminGlossary.preview.openInGlossaryCta": "Open in glossary",
  "adminGlossary.preview.openInGlossaryAriaLabel":
    "Open in glossary (opens in a new tab)",
  "adminGlossary.editor.createTitle": "Add a glossary term",
  "adminGlossary.editor.editTitle": "Edit this term",
  "adminGlossary.editor.createCta": "Add term",
  "adminGlossary.editor.saveCta": "Save changes",
  "adminGlossary.field.term": "Term",
  "adminGlossary.field.slug": "Slug",
  "adminGlossary.field.slugHint":
    "Lowercase words joined by single hyphens. It is filled in from the term and cannot be changed later, so links into this term keep working.",
  "adminGlossary.field.category": "Category",
  "adminGlossary.field.categoryHint":
    "The chip on the public page. Reuse an existing category where you can: a new one shows in English in both languages until it is added to the catalog.",
  "adminGlossary.field.definition": "Definition (English)",
  "adminGlossary.field.definitionPt": "Definition (Portuguese)",
  "adminGlossary.field.definitionPtHint":
    "Leave it empty and the page shows the English definition to a Portuguese reader without saying so.",
  "adminGlossary.review.title": "Mark this term reviewed",
  "adminGlossary.review.body":
    "Confirm you have read this definition and it still holds: the wording people actually use, what it does and does not cover, and whether the community has moved on from it.",
  "adminGlossary.delete.title": "Delete this term?",
  "adminGlossary.delete.body":
    '"{term}" disappears from the glossary and from every page that links to it. There is no undo.',
  "adminGlossary.delete.confirmCta": "Delete term",
  "adminGlossary.toast.created": "Added {term}.",
  "adminGlossary.toast.saved": "Saved {term}.",
  "adminGlossary.toast.reviewed": "{term} marked reviewed.",
  "adminGlossary.toast.deleted": "Deleted {term}.",
  "adminGlossary.error.save": "Couldn't save the term.",
  "adminGlossary.error.review": "Couldn't record the review.",
  "adminGlossary.error.delete": "Couldn't delete the term.",

  "adminResourceGuides.title": "Resource <em>guides</em>",
  "adminResourceGuides.header.eyebrow": "Editorial",
  "adminResourceGuides.header.sub":
    "Every guide on the platform, stalest first. Edit the prose here instead of shipping a deploy, and stamp a review when you have read one end to end.",
  "adminResourceGuides.sortLabel": "Sort guides",
  "adminResourceGuides.sort.reviewDue": "Review due",
  "adminResourceGuides.sort.title": "Title",
  "adminResourceGuides.sort.updated": "Recently updated",
  "adminResourceGuides.staleBanner_one":
    "{count} guide has never been reviewed by anyone.",
  "adminResourceGuides.staleBanner_other":
    "{count} guides have never been reviewed by anyone.",
  // PRD-270: a guide already reviewed once but now past `review_due_on`
  // was invisible here, because staleCount only counted never-reviewed
  // guides. Pluralised on `count`, like the sibling above.
  "adminResourceGuides.overdueBanner_one":
    "{count} guide is past its review date.",
  "adminResourceGuides.overdueBanner_other":
    "{count} guides are past their review date.",
  "adminResourceGuides.empty":
    "No guides yet. Once the backfill migration has run, every guide appears here.",
  "adminResourceGuides.viewPublicIndexCta": "Open the public guide index",
  "adminResourceGuides.loadError": "Couldn't load the guides.",

  "adminResourceGuides.row.unpublished": "Unpublished",
  "adminResourceGuides.row.notManaged": "Page still hardcoded",
  "adminResourceGuides.row.reviewed": "Reviewed {date}",
  "adminResourceGuides.row.reviewedBy": "Reviewed {date} by {reviewer}",
  "adminResourceGuides.row.neverReviewed": "Never reviewed",
  "adminResourceGuides.row.overdue": "Overdue since {date}",
  "adminResourceGuides.row.reviewCta": "Mark reviewed",
  "adminResourceGuides.row.editCta": "Edit",

  "adminResourceGuides.editor.takeoverNotice":
    "Adding a section takes this page over: readers will see what you write here instead of the built-in page.",
  "adminResourceGuides.field.title": "Title",
  "adminResourceGuides.field.titlePt": "Title (Portuguese)",
  "adminResourceGuides.field.description": "Description",
  "adminResourceGuides.field.descriptionPt": "Description (Portuguese)",
  "adminResourceGuides.field.category": "Category",
  "adminResourceGuides.field.routePath": "Page path",
  "adminResourceGuides.field.meta": "Card chip",

  "adminResourceGuides.blockKind.paragraph": "Paragraph",
  "adminResourceGuides.blockKind.subheading": "Subheading",
  "adminResourceGuides.blockKind.listItem": "List item",
  "adminResourceGuides.blockKind.note": "Callout",

  "adminResourceGuides.review.title": "Mark this guide reviewed",
  "adminResourceGuides.review.body":
    "Confirm you have read this guide end to end and everything in it is still accurate: phone numbers, eligibility rules, clinic hours, statute references.",
  "adminResourceGuides.review.reviewedByLabel": "Reviewed by",
  "adminResourceGuides.review.reviewedByHint": "A person or a team",
  "adminResourceGuides.review.reviewedOnLabel": "Reviewed on",
  "adminResourceGuides.review.dueLabel": "Next review due",
  "adminResourceGuides.review.confirmCta": "Mark reviewed",

  // Guide preview (/admin/resource-guides/preview/:id)
  "guidePreview.row.previewCta": "Preview",
  "guidePreview.shellTitle": "Guide preview",
  "guidePreview.bar.label": "Guide preview controls",
  "guidePreview.bar.eyebrow": "Preview",
  "guidePreview.bar.public": "Live. Readers can see this guide.",
  "guidePreview.bar.unpublished": "Unpublished. Readers can't see this guide.",
  "guidePreview.bar.neverReviewed":
    "Readers can't see this guide until someone marks it reviewed.",
  "guidePreview.bar.unpublishedNeverReviewed":
    "Unpublished and never reviewed. Readers can't see this guide.",
  "guidePreview.bar.portugueseMissing":
    "No Portuguese version yet. Portuguese readers see the English text.",
  "guidePreview.noPage.title": "{title} has no page yet",
  "guidePreview.noPage.body":
    "It has no sections in the editor and no built-in page, so readers would find nothing here. Add a section in the editor to give it one.",

  // ── Guide workspace (/admin/resource-guides/new, /edit/:id) ──
  "guideWorkspace.breadcrumb": "Resource guides",
  "guideWorkspace.untitled": "Untitled guide",
  "guideWorkspace.newGuideCta": "New guide",
  "guideWorkspace.leaveConfirm":
    "You have unsaved changes to this guide. Leave anyway?",
  "guideWorkspace.notFound.title": "Guide not found",
  "guideWorkspace.notFound.body":
    "This guide may have been deleted, or the link is wrong.",
  "guideWorkspace.backToGuidesCta": "Back to guides",
  "guideWorkspace.loadError": "Couldn't load this guide.",
  "guideWorkspace.retryCta": "Try again",
  "guideWorkspace.undo": "Undo",
  "guideWorkspace.header.languageLabel": "Language",
  "guideWorkspace.header.language.en": "English",
  "guideWorkspace.header.language.pt": "Portuguese",
  "guideWorkspace.header.viewLabel": "View",
  "guideWorkspace.header.view.edit": "Edit",
  "guideWorkspace.header.view.split": "Split",
  "guideWorkspace.header.view.preview": "Preview",
  "guideWorkspace.header.status.dirty": "Unsaved changes",
  "guideWorkspace.header.status.saving": "Saving...",
  "guideWorkspace.header.status.saved": "Saved {time}",
  "guideWorkspace.header.issues": "Issues to fix: {count}",
  "guideWorkspace.header.saveCta": "Save",
  "guideWorkspace.links.label": "Where it appears",
  "guideWorkspace.links.live": "Live page",
  "guideWorkspace.links.library": "Library",
  "guideWorkspace.links.index": "Guide index",
  "guideWorkspace.links.notPublic":
    "Readers currently see the under-review page.",
  "guideWorkspace.recovery.body": "You have unsaved changes from {time}.",
  "guideWorkspace.recovery.olderBase":
    "This guide has been saved since, so restoring replaces those newer changes when you save.",
  "guideWorkspace.recovery.restoreCta": "Restore",
  "guideWorkspace.recovery.discardCta": "Discard",
  "guideWorkspace.conflict.body": "Someone saved this guide at {time}.",
  "guideWorkspace.conflict.loadTheirsCta": "Load their version",
  "guideWorkspace.conflict.saveMineCta": "Save mine anyway",
  "guideWorkspace.toast.demoNotSaved": "Demo mode, nothing was saved.",
  "guideWorkspace.toast.published": "{title} is published.",
  "guideWorkspace.toast.unpublished": "{title} is unpublished.",
  "guideWorkspace.error.publish": "Couldn't change the publish state",
  "guideWorkspace.status.title": "Status",
  "guideWorkspace.status.published": "Published",
  "guideWorkspace.status.unpublished": "Unpublished",
  "guideWorkspace.status.hiddenUntilReviewed":
    "Published, hidden from readers until reviewed.",
  "guideWorkspace.status.reviewDue": "Next review {date}",
  "guideWorkspace.status.reviewOverdue": "Review overdue since {date}",
  "guideWorkspace.status.saveBeforeReview":
    "Save first, so the review covers what readers see.",
  "guideWorkspace.status.publishCta": "Publish",
  "guideWorkspace.status.unpublishCta": "Unpublish",
  "guideWorkspace.status.newGuide":
    "New guides start unpublished and unreviewed.",
  "guideWorkspace.details.title": "Details",
  "guideWorkspace.details.categoryPlaceholder": "Choose a category",
  "guideWorkspace.details.currentCategory": "{category} (current)",
  "guideWorkspace.details.slug": "Slug",
  "guideWorkspace.details.slugHint":
    "Lowercase words and hyphens. Fixed after the first save.",
  "guideWorkspace.details.routePathHint":
    "Optional, for example /resources/sober",
  "guideWorkspace.chip.format.guide": "Guide",
  "guideWorkspace.chip.format.checklist": "Checklist",
  "guideWorkspace.chip.format.template": "Template",
  "guideWorkspace.chip.format.directory": "Directory",
  "guideWorkspace.chip.format.toolkit": "Toolkit",
  "guideWorkspace.chip.keep": "Keep current chip: {chip}",
  "guideWorkspace.chip.none": "none",
  "guideWorkspace.chip.result": "Readers see: {chip}",
  "guideWorkspace.chip.hint": "Read time and languages update from the prose.",
  "guideWorkspace.cards.title": "Card previews",
  "guideWorkspace.cards.library": "Resource library",
  "guideWorkspace.cards.index": "Guide index",
  "guideWorkspace.cards.englishOnly":
    "Cards show the English title and description.",
  "guideWorkspace.outline.title": "Outline",
  "guideWorkspace.outline.untitledSection": "Untitled section",
  "guideWorkspace.outline.words_one": "{count} word",
  "guideWorkspace.outline.words_other": "{count} words",
  "guideWorkspace.outline.jump": "Go to {section}",
  "guideWorkspace.outline.moveUp": "Move {section} up",
  "guideWorkspace.outline.moveDown": "Move {section} down",
  "guideWorkspace.outline.moved":
    "Moved {section} to position {position} of {total}.",
  "guideWorkspace.outline.flag.empty": "Not translated",
  "guideWorkspace.outline.flag.noEnglishMatch": "No English match",
  "guideWorkspace.outline.missing": "Only in English: {sections}",
  "guideWorkspace.outline.empty": "No sections yet.",
  "guideWorkspace.document.label": "Guide prose",
  "guideWorkspace.document.headingPlaceholder": "Section heading",
  "guideWorkspace.document.headingLabel": "Section {position} heading",
  "guideWorkspace.document.addBarLabel": "Add to the end",
  "guideWorkspace.document.addSectionCta": "New section",
  "guideWorkspace.document.addBlockCta": "Add paragraph",
  "guideWorkspace.document.hint":
    "Type / in an empty block for more. Enter starts a new block.",
  "guideWorkspace.document.copyEnglishCta": "Copy English structure",
  "guideWorkspace.document.copyEnglishHint":
    "English sections without a Portuguese version: {count}",
  "guideWorkspace.document.empty": "This guide has no sections yet.",
  "guideWorkspace.block.placeholder.paragraph": "Write, or type / for blocks",
  "guideWorkspace.block.placeholder.subheading": "Subheading",
  "guideWorkspace.block.placeholder.listItem": "List item",
  "guideWorkspace.block.placeholder.note": "Callout text",
  "guideWorkspace.block.ariaLabel": "{kind}, block {position}",
  "guideWorkspace.block.moveUp": "Move block up",
  "guideWorkspace.block.moveDown": "Move block down",
  "guideWorkspace.block.remove": "Remove block",
  "guideWorkspace.block.removedToast": "Block removed.",
  "guideWorkspace.section.menuLabel": "Section options",
  "guideWorkspace.section.anchorLabel": "Anchor",
  "guideWorkspace.section.anchorHint": "Links to this section use #{anchor}.",
  "guideWorkspace.section.moveUp": "Move section up",
  "guideWorkspace.section.moveDown": "Move section down",
  "guideWorkspace.section.remove": "Remove section",
  "guideWorkspace.section.removedToast": "Section removed.",
  "guideWorkspace.section.unreadAnchor":
    "The page only reads sections anchored {anchors}, so readers won't see this one ({anchor}).",
  "guideWorkspace.section.changeAnchor": "Change anchor",
  "guideWorkspace.translation.referenceLabel":
    "English version of this section",
  "guideWorkspace.translation.englishEyebrow": "English",
  "guideWorkspace.translation.noEnglishMatch":
    "No English section uses this anchor.",
  "guideWorkspace.preview.label": "Live preview",
  "guideWorkspace.preview.englishFallback":
    "Readers in Portuguese see the English version until a Portuguese section exists.",
  "guideWorkspace.preview.empty": "Nothing to preview yet.",
  "guideWorkspace.preview.editSection": "Edit this section",
  "guideWorkspace.preview.composedPageNotice":
    "This pane shows the sections alone; Preview in the guide list shows them in the page.",
  "guideWorkspace.issue.titleRequired": "Add a title.",
  "guideWorkspace.issue.titleTooLong": "Keep the title under 300 characters.",
  "guideWorkspace.issue.descriptionRequired": "Add a description.",
  "guideWorkspace.issue.descriptionTooLong":
    "Keep the description under 2000 characters.",
  "guideWorkspace.issue.categoryRequired": "Choose a category.",
  "guideWorkspace.issue.slugRequired": "Add a slug.",
  "guideWorkspace.issue.slugInvalid":
    "Use lowercase words separated by single hyphens.",
  "guideWorkspace.issue.slugTaken": "Another guide already uses this slug.",
  "guideWorkspace.issue.routePathInvalid":
    "Start with / and use only letters, numbers, hyphens and slashes.",
  "guideWorkspace.issue.chipTooLong": "The card chip is over 120 characters.",
  "guideWorkspace.issue.tooManySections": "A guide can have up to 40 sections.",
  "guideWorkspace.issue.headingTooLong":
    "Keep section headings under 300 characters.",
  "guideWorkspace.issue.anchorInvalid":
    "The anchor needs lowercase words separated by hyphens.",
  "guideWorkspace.issue.anchorDuplicate":
    "Another section already uses this anchor.",
  "guideWorkspace.issue.tooManyBlocks": "A section can have up to 60 blocks.",
  "guideWorkspace.issue.blockTooLong":
    "This block is over the 4000 character limit.",
  "guideWorkspace.composedPage.title":
    "This guide keeps its own tabbed page. Each section replaces the tab its anchor names: {anchors}. Tabs without a section keep their built-in copy.",
  "guideWorkspace.composedPage.guidesDetail":
    'A "guides" section replaces the guide cards and their rating widgets.',

  // ── AdminHousingListingsPage — the housing review console (LOC-01) ──────
  // Every member listing lands in `review` and public browse serves `live`
  // only, so nothing reached the board until this console existed.
  "housingListings.title": "Housing <em>review.</em>",
  "housingListings.eyebrow": "Housing board",
  "housingListings.header.title": "Homes waiting on a <em>decision.</em>",
  "housingListings.header.sub":
    "Every listing a member posts waits here until somebody reads it. Riskiest first, with the signals that put it there.",
  "housingListings.keyHint":
    "J and K move between listings. A approves, C sends it back for changes, R refuses it, D pulls a live one.",
  "housingListings.count_one": "{count} listing",
  "housingListings.count_other": "{count} listings",
  "housingListings.loadMore": "Show more",
  "housingListings.loadingMore": "Loading…",
  "housingListings.tab.review": "Waiting",
  "housingListings.tab.question": "Sent back",
  "housingListings.tab.live": "Live",
  "housingListings.tab.rejected": "Refused",
  "housingListings.tab.taken_down": "Pulled",
  "housingListings.tab.all": "Everything",
  "housingListings.sort.label": "Sort",
  "housingListings.sort.risk": "Riskiest",
  "housingListings.sort.oldest": "Longest waiting",
  "housingListings.sort.newest": "Newest",
  "housingListings.empty.title": "Nothing waiting here",
  "housingListings.empty.body":
    "No listing is in this state right now. Try another tab when you want to look back over what was decided.",
  "housingListings.error.title": "Couldn't load the queue",
  "housingListings.error.body":
    "Something went wrong on our end. Check your connection and try again.",
  "housingListings.error.retry": "Try again",
  "housingListings.status.review": "Waiting",
  "housingListings.status.question": "Sent back",
  "housingListings.status.live": "Live",
  "housingListings.status.rejected": "Refused",
  "housingListings.status.takenDown": "Pulled",
  "housingListings.row.submitted": "Posted {date}",
  "housingListings.row.rent": "{amount} a month",
  "housingListings.row.bedrooms_one": "{count} bedroom",
  "housingListings.row.bedrooms_other": "{count} bedrooms",
  "housingListings.row.billsIncluded": "Bills included",
  "housingListings.row.billsExcluded": "Bills on top",
  "housingListings.row.photoAlt": "Photo {position} of {title}",
  "housingListings.row.noPhotos": "No photos on this listing",
  "housingListings.risk.band.high": "High risk",
  "housingListings.risk.band.medium": "Some flags",
  "housingListings.risk.band.low": "Low risk",
  "housingListings.risk.scoreTitle":
    "Risk score out of 100, computed from the signals listed below",
  "housingListings.risk.heading_one": "{count} signal, scoring {score}",
  "housingListings.risk.heading_other": "{count} signals, scoring {score}",
  "housingListings.risk.weight": "+{weight}",
  "housingListings.risk.noneRaised": "No risk signals were raised",
  "housingListings.risk.rentFarBelowMarket":
    "Rent is far below anything plausible for this kind of home, the classic advance-fee hook",
  "housingListings.risk.rentBelowMarket":
    "Rent sits below the bottom of a plausible range for this kind of home",
  "housingListings.risk.contactInfoInText":
    "The listing carries a phone number, email, IBAN or messenger handle, moving the conversation off the platform",
  "housingListings.risk.offPlatformPayment":
    "The listing asks for money before a viewing, or by a method nobody can trace",
  "housingListings.risk.discriminatoryLanguage":
    "The wording gates the home on identity or beliefs rather than describing the space",
  "housingListings.risk.listerUnverified":
    "The lister has only confirmed an email address",
  "housingListings.risk.listerPhoneOnly":
    "The lister has confirmed a phone number and no identity document",
  "housingListings.risk.incompleteListing":
    "The description is too short to tell anyone what the home is like",
  "housingListings.risk.noPhotos": "The listing has no photos",
  "housingListings.risk.missingAccessibilityInfo":
    "The listing says nothing about getting in and around",
  "housingListings.lister.erased":
    "This lister erased their account. There is nobody left to notify about a decision.",
  "housingListings.lister.verification.none": "Nothing confirmed",
  "housingListings.lister.verification.email": "Email confirmed",
  "housingListings.lister.verification.phone": "Phone confirmed",
  "housingListings.lister.verification.id": "Identity verified",
  "housingListings.lister.memberSince": "Here since {date}",
  "housingListings.lister.agent": "Agent",
  "housingListings.lister.history.total_one": "{count} listing in all",
  "housingListings.lister.history.total_other": "{count} listings in all",
  "housingListings.lister.history.live_one": "{count} live",
  "housingListings.lister.history.live_other": "{count} live",
  "housingListings.lister.history.changes_one": "{count} sent back",
  "housingListings.lister.history.changes_other": "{count} sent back",
  "housingListings.lister.history.rejected_one": "{count} refused",
  "housingListings.lister.history.rejected_other": "{count} refused",
  "housingListings.lister.history.takenDown_one": "{count} pulled",
  "housingListings.lister.history.takenDown_other": "{count} pulled",
  "housingListings.details.open": "The listing as written",
  "housingListings.details.noDescription": "No description was written.",
  "housingListings.details.access": "Getting in and around",
  "housingListings.details.noAccess": "Nothing said",
  "housingListings.details.available": "Available from",
  "housingListings.details.availableNow": "Now",
  "housingListings.details.minStay": "Shortest stay",
  "housingListings.details.minStayMonths_one": "{count} month",
  "housingListings.details.minStayMonths_other": "{count} months",
  "housingListings.details.minStayNone": "No minimum",
  "housingListings.details.address": "Address",
  "housingListings.details.noAddress": "No address on file",
  "housingListings.details.tourLink": "Open the virtual tour",
  "housingListings.details.priorDecision": "Last decided {date}",
  "housingListings.details.priorDecisionNoReason":
    "Approved with no note attached.",
  "housingListings.details.decidedBy": "Decided by {name}",
  "housingListings.decide.approve": "Publish",
  "housingListings.decide.requestChanges": "Ask for changes",
  "housingListings.decide.reject": "Refuse",
  "housingListings.decide.takeDown": "Pull from the board",
  "housingListings.decide.cancel": "Cancel",
  "housingListings.decide.reasonEyebrow": "Housing review",
  "housingListings.decide.reasonTitle.request_changes": "What needs changing?",
  "housingListings.decide.reasonTitle.reject": "Why are you refusing this?",
  "housingListings.decide.reasonTitle.take_down": "Why are you pulling this?",
  "housingListings.decide.reasonLabel": "Your reason",
  "housingListings.decide.reasonHint":
    "The lister reads this word for word, in their notifications and on their own listings page. Write it to them.",
  "housingListings.decide.reasonPlaceholder.request_changes":
    "e.g. Could you add a photo of the kitchen and say whether the rent includes water? Once that is in, this is good to go.",
  "housingListings.decide.reasonPlaceholder.reject":
    "e.g. This listing asks for a deposit before a viewing, which we don't allow here. You're welcome to post again without it.",
  "housingListings.decide.reasonPlaceholder.take_down":
    "e.g. Two members told us this home was already let. We've pulled it for now, tell us if that's wrong.",
  "housingListings.toast.approve": "{title} is on the board.",
  "housingListings.toast.request_changes": "Sent {title} back to its lister.",
  "housingListings.toast.reject": "{title} was refused.",
  "housingListings.toast.take_down": "{title} was pulled from the board.",
  "housingListings.toast.error":
    "Couldn't record that decision. Check your connection and try again.",

  "adminResourceGuides.toast.saved": "Saved {title}.",
  "adminResourceGuides.toast.reviewed": "{title} marked reviewed.",
  "adminResourceGuides.error.save": "Couldn't save the guide.",
  "adminResourceGuides.error.review": "Couldn't record the review.",

  // ── Trust, safety and moderation (section 1 build) ──────────────────────
  // Community attribution on the report queue (TS-14).
  "moderation.community.all": "All communities",
  "moderation.community.filterLabel": "Filter by community",
  "moderation.community.rowFlag": "From {community}",

  // Clustered rows: one pile-on reads as one thing (TS-06).
  "moderation.cluster.clearAllCta_one": "Clear {count}",
  "moderation.cluster.clearAllCta_other": "Clear all {count}",
  "moderation.cluster.heading_one": "{count} open report about {subject}",
  "moderation.cluster.heading_other": "{count} open reports about {subject}",
  "moderation.cluster.notOnPage_one":
    "{count} more report in this pile has not loaded yet.",
  "moderation.cluster.notOnPage_other":
    "{count} more reports in this pile have not loaded yet.",
  "moderation.cluster.overdue_one": "{count} past its window",
  "moderation.cluster.overdue_other": "{count} past their window",
  "moderation.cluster.reporters_one": "from 1 member",
  "moderation.cluster.reporters_other": "from {count} different members",
  "moderation.cluster.selectAllCta_one": "Select {count}",
  "moderation.cluster.selectAllCta_other": "Select all {count}",
  "moderation.cluster.surge": "Surge",
  "moderation.cluster.surgeHint":
    "Several people reported this at once. Read it as one event before acting on any single report: a pile-on and a real emergency look identical row by row.",

  // The overdue and surge filters that ride the queue (TS-06).
  "moderation.filters.overdue": "Overdue",
  "moderation.filters.surge": "Surges",

  // The reason-keyed library a decision note is prefilled from (TS-16).
  "moderation.templates.activeToggleLabel": "Active: {label}",
  "moderation.templates.anyAction": "Any action",
  "moderation.templates.anyReason": "Any reason",
  "moderation.templates.delete.body":
    "The response disappears from the picker. Notes already sent to members are unaffected: what a moderator approved is stored on the decision itself. Deactivate it instead if you may want it back.",
  "moderation.templates.delete.confirmCta": "Delete response",
  "moderation.templates.delete.title": 'Delete "{label}"?',
  "moderation.templates.empty":
    "There are no saved responses yet. Add one and it appears in the report drawer straight away.",
  "moderation.templates.eyebrow": "Moderation",
  "moderation.templates.form.actionField": "Action it suits",
  "moderation.templates.form.bodyField": "What the member reads",
  "moderation.templates.form.bodyHint":
    "You can use {tokens}. They are filled in before the moderator sends the note, and the moderator can still edit the result.",
  "moderation.templates.form.createCta": "Add response",
  "moderation.templates.form.createTitle": "New saved response",
  "moderation.templates.form.editTitle": "Edit saved response",
  "moderation.templates.form.labelField": "Name",
  "moderation.templates.form.labelHint":
    "Only moderators see this. Members never do.",
  "moderation.templates.form.reasonField": "Reason it is for",
  "moderation.templates.form.saveError": "Couldn't save that response",
  "moderation.templates.loadError": "The saved responses could not be loaded.",
  "moderation.templates.moveDownAriaLabel": "Move {label} down",
  "moderation.templates.moveUpAriaLabel": "Move {label} up",
  "moderation.templates.navLabel": "Saved responses",
  "moderation.templates.newCta": "New response",
  "moderation.templates.picker.anyCommunity": "the platform",
  "moderation.templates.picker.empty":
    "No saved response fits this reason and action yet.",
  "moderation.templates.picker.hint":
    "Fills the note below. Read it and edit it before you confirm.",
  "moderation.templates.picker.loadError":
    "The saved responses could not be loaded.",
  "moderation.templates.picker.replaceBody":
    'You have already written a note. Using "{label}" replaces it.',
  "moderation.templates.picker.replaceCancelCta": "Keep mine",
  "moderation.templates.picker.replaceConfirmCta": "Replace",
  "moderation.templates.picker.replaceTitle": "Replace what you have written?",
  "moderation.templates.picker.title": "Saved responses",
  "moderation.templates.picker.undoAriaLabel": "Undo the prefilled note",
  "moderation.templates.picker.undoCta": "Undo",
  "moderation.templates.picker.useAriaLabel": "Use the saved response {label}",
  "moderation.templates.removeError": "Couldn't remove that response",
  "moderation.templates.reorderError": "Couldn't change the order",
  "moderation.templates.sub":
    "The wording moderators can prefill into a decision. Every note is still edited and approved before it is sent.",
  "moderation.templates.title": "Saved <em>responses</em>",
  "moderation.templates.toast.created": '"{label}" added',
  "moderation.templates.toast.removed": '"{label}" removed',
  "moderation.templates.toast.updated": '"{label}" saved',

  // Lifting a scoped restriction from the member drawer (TS-09).
  "members.restriction.confirm.body":
    "{name} gets posting, commenting and messaging back straight away. They are told the restriction is over and read exactly what you write below.",
  "members.restriction.confirm.confirmCta": "Lift restriction",
  "members.restriction.confirm.noteLabel": "What {name} will read",
  "members.restriction.confirm.notePlaceholder":
    "Say what changed, in the words the member will see.",
  "members.restriction.confirm.title": "Lift the restriction on {name}?",
  "members.restriction.description":
    "This member is restricted: they can still read, but they cannot post, comment or send messages. Lifting it takes effect at once and tells them why.",
  "members.restriction.descriptionUntil":
    "This member is restricted until {date}: they can still read, but they cannot post, comment or send messages. Lifting it takes effect at once and tells them why.",
  "members.restriction.liftCta": "Lift restriction",
  "members.restriction.liftedToast": "{name} can post again.",
  "members.restriction.missingNoteToast":
    "Write what the member will read before lifting.",
  "members.restriction.sectionTitle": "Restriction",

  // The returning-account signal on invite review (TS-05).
  "invites.banEvasion.accountErased": "That account has since been erased.",
  "invites.banEvasion.context.community": "Removed from {community} on {date}.",
  "invites.banEvasion.context.communityUnnamed":
    "Removed from a community on {date}.",
  "invites.banEvasion.context.platform": "Removed from QueerPulse on {date}.",
  "invites.banEvasion.note":
    "This is a signal to check. Read the removed account first, then judge this application on its own merits.",
  "invites.banEvasion.reasons.intakeContact":
    "Applied with the address a removed account applied with",
  "invites.banEvasion.reasons.inviterOfRemoved":
    "Invited by the member who invited a removed account",
  "invites.banEvasion.reasons.inviterRemoved":
    "Invited by a member who was themselves removed",
  "invites.banEvasion.reasons.referenceOfRemoved":
    "Names a reference who vouched for a removed account",
  "invites.banEvasion.reasons.referenceRemoved":
    "Names a reference who was themselves removed",
  "invites.banEvasion.reasons.signInIdentifier":
    "Signs in with the identifier a removed account used",
  "invites.banEvasion.reasons.statedDetails":
    "States the same name a removed account stated",
  "invites.banEvasion.tier.high": "High confidence",
  "invites.banEvasion.tier.low": "Low confidence",
  "invites.banEvasion.tier.medium": "Medium confidence",
  "invites.banEvasion.title": "Possible returning account",
  "invites.banEvasion.viewAccount": "View the removed account",

  // ── Group-listing review queue (/admin/housing-group-listings) — LOC-19 ────
  // The PRE-publication decision on a room posted into a vetted housing group.
  // Distinct from housingGroups.listings.*, which is the post-publication hide.
  "groupListingQueue.title": "Rooms <em>waiting</em>",
  "groupListingQueue.eyebrow": "Vetted housing",
  "groupListingQueue.header.title": "Rooms waiting on <em>you</em>",
  "groupListingQueue.header.sub":
    "Every room posted into a housing group lands here before anyone can see it. Publish it, ask the poster something, or say plainly that it will not go up.",
  "groupListingQueue.keyHint":
    "J and K move between rooms. P publishes, Q sends a question, D declines, R puts a declined room back in the queue.",

  "groupListingQueue.tab.review": "Waiting",
  "groupListingQueue.tab.question": "Asked",
  "groupListingQueue.tab.live": "Published",
  "groupListingQueue.tab.declined": "Declined",
  "groupListingQueue.tab.all": "Everything",
  "groupListingQueue.groupFilter.label": "Group",
  "groupListingQueue.groupFilter.placeholder": "Filter by group slug",

  "groupListingQueue.count_one": "{count} room",
  "groupListingQueue.count_other": "{count} rooms",
  "groupListingQueue.loadMore": "Load more",
  "groupListingQueue.loadingMore": "Loading…",

  "groupListingQueue.empty.title": "Nothing waiting",
  "groupListingQueue.empty.body":
    "Every room in this view has an answer. Check another tab to see what has been decided.",
  "groupListingQueue.error.title": "The queue didn't load",
  "groupListingQueue.error.body":
    "Something went wrong on the way here. Try again in a moment.",
  "groupListingQueue.error.retry": "Try again",
  "groupListingQueue.forbidden.title": "This queue is for housing moderators",
  "groupListingQueue.forbidden.body":
    "You need the moderator or admin role, or the housing moderator grant, to review rooms.",

  "groupListingQueue.status.review": "Waiting",
  "groupListingQueue.status.question": "Question sent",
  "groupListingQueue.status.live": "Published",
  "groupListingQueue.status.declined": "Declined",

  "groupListingQueue.row.hidden": "Hidden",
  "groupListingQueue.row.noGroup": "No group",
  "groupListingQueue.row.noPoster":
    "The account that posted this room is gone, so nobody will be told what you decide.",
  "groupListingQueue.row.perMonth": "{amount} a month",
  "groupListingQueue.row.submitted": "Posted {age}",
  "groupListingQueue.row.waitingDays_one": "Waiting {count} day",
  "groupListingQueue.row.waitingDays_other": "Waiting {count} days",

  "groupListingQueue.prior.heading": "Already decided",
  "groupListingQueue.prior.meta": "{date} by {moderator}",
  "groupListingQueue.prior.unknownStaff": "a moderator",

  "groupListingQueue.risk.band.high": "High",
  "groupListingQueue.risk.band.medium": "Medium",
  "groupListingQueue.risk.band.low": "Low",
  "groupListingQueue.risk.scoreTitle":
    "Red-flag score. It sorts this queue and decides nothing.",
  "groupListingQueue.risk.listLabel": "Signals behind the score",
  "groupListingQueue.risk.noneRaised": "Nothing flagged.",
  "groupListingQueue.risk.reason.rent_far_below_market":
    "Rent far below market",
  "groupListingQueue.risk.reason.rent_below_market": "Rent below market",
  "groupListingQueue.risk.reason.contact_info_in_text":
    "Contact details in the text",
  "groupListingQueue.risk.reason.off_platform_payment_language":
    "Asks for payment off the platform",
  "groupListingQueue.risk.reason.discriminatory_language":
    "Possible discriminatory language",
  "groupListingQueue.risk.reason.lister_unverified": "Poster is unverified",
  "groupListingQueue.risk.reason.lister_phone_only":
    "Poster verified by phone only",
  "groupListingQueue.risk.reason.incomplete_listing": "Thin on detail",
  "groupListingQueue.risk.reason.no_photos": "No photos",
  "groupListingQueue.risk.reason.missing_accessibility_info":
    "No accessibility information",

  "groupListingQueue.decide.publish": "Publish",
  "groupListingQueue.decide.question": "Ask the poster",
  "groupListingQueue.decide.decline": "Decline",
  "groupListingQueue.decide.reopen": "Back to the queue",
  "groupListingQueue.decide.groupLabel": "Decisions for {title}",
  "groupListingQueue.decide.liveNote":
    "This room is published. To take it down for breaking the group norms, use Hide on the housing groups page.",
  "groupListingQueue.decide.reasonEyebrow": "The poster reads this",
  "groupListingQueue.decide.reasonTitle.live": "Anything to send with this?",
  "groupListingQueue.decide.reasonTitle.question": "What do you need to ask?",
  "groupListingQueue.decide.reasonTitle.declined":
    "Why is this room not going up?",
  "groupListingQueue.decide.reasonTitle.review":
    "Why is this going back to the queue?",
  "groupListingQueue.decide.reasonLabel": "Your message",
  "groupListingQueue.decide.reasonPlaceholder.live":
    "Anything you want the poster to know.",
  "groupListingQueue.decide.reasonPlaceholder.question":
    "Could you say whether bills are included?",
  "groupListingQueue.decide.reasonPlaceholder.declined":
    "Say what stopped this going up, and what would change it.",
  "groupListingQueue.decide.reasonPlaceholder.review":
    "Say why this is going back to the queue.",
  "groupListingQueue.decide.reasonHint":
    "This reaches the poster word for word, in the app and on their phone. Write it to them.",

  "groupListingQueue.toast.live": "{title} is live in the group.",
  "groupListingQueue.toast.question":
    "Your question is on its way to the poster.",
  "groupListingQueue.toast.declined":
    "The poster has been told, with your reason.",
  "groupListingQueue.toast.review": "Back in the queue.",
  "groupListingQueue.toast.error": "That decision didn't save. Try again.",

  // ── Landlord directory console (/admin/landlords) — LOC-19 ─────────────────
  // Two member-facing promises on one page: a suggested landlord waiting to be
  // published, and a member waiting to be introduced to one.
  "landlords.title": "Landlord <em>directory</em>",
  "landlords.eyebrow": "Housing",
  "landlords.header.title": "Landlords worth <em>knowing</em>",
  "landlords.header.sub":
    "Members suggest landlords they have rented from, and ask to be introduced. Both are waiting on an answer from you.",

  "landlords.pane.directory": "Directory",
  "landlords.pane.introductions": "Introductions",
  "landlords.filter.review": "Waiting",
  "landlords.filter.live": "Published",
  "landlords.filter.all": "Everything",
  "landlords.introFilter.pending": "Waiting",
  "landlords.introFilter.accepted": "Accepted",
  "landlords.introFilter.declined": "Declined",
  "landlords.introFilter.all": "Everything",
  "landlords.search.label": "Search",
  "landlords.search.placeholder": "Search by name",

  "landlords.count_one": "{count} entry",
  "landlords.count_other": "{count} entries",
  "landlords.loadMore": "Load more",
  "landlords.loadingMore": "Loading…",

  "landlords.empty.title": "Nothing waiting",
  "landlords.empty.body":
    "No entries in this view. Try another tab to see what has been decided.",
  "landlords.error.title": "The directory didn't load",
  "landlords.error.body":
    "Something went wrong on the way here. Try again in a moment.",
  "landlords.error.retry": "Try again",
  "landlords.forbidden.title": "This console is for moderators",
  "landlords.forbidden.body":
    "You need the moderator or admin role to work these queues.",

  "landlords.status.review": "Waiting",
  "landlords.status.live": "Published",

  "landlords.row.noHood": "Neighbourhood not given",
  "landlords.row.recommendations_one": "{count} recommendation",
  "landlords.row.recommendations_other": "{count} recommendations",
  "landlords.row.suggestedBy": "Suggested by {name}",
  "landlords.row.staffAdded": "Added by staff",
  "landlords.row.added": "Added {age}",
  "landlords.row.waitingDays_one": "Waiting {count} day",
  "landlords.row.waitingDays_other": "Waiting {count} days",

  "landlords.action.publish": "Publish",
  "landlords.action.holdBack": "Hold back",
  "landlords.action.remove": "Remove",

  "landlords.prior.heading": "Already decided",
  "landlords.prior.meta": "{date} by {moderator}",
  "landlords.prior.unknownStaff": "a moderator",

  "landlords.toast.published": "{name} is in the directory.",
  "landlords.toast.heldBack":
    "{name} is back in review, and the member who suggested it has been told.",
  "landlords.toast.removed": "{name} has been removed, with your reason.",
  "landlords.toast.error": "That decision didn't save. Try again.",

  "landlords.reason.label": "Your message",
  "landlords.reason.labelOptional": "Your message (optional)",
  "landlords.reason.hint":
    "This reaches the member word for word, in the app and on their phone. Write it to them.",
  "landlords.reason.eyebrow.holdBack": "The member reads this",
  "landlords.reason.eyebrow.remove": "The member reads this",
  "landlords.reason.eyebrow.introAccept": "The member reads this",
  "landlords.reason.eyebrow.introDecline": "The member reads this",
  "landlords.reason.title.holdBack": "Why is this going back to review?",
  "landlords.reason.title.remove": "Why is this entry coming out?",
  "landlords.reason.title.introAccept": "What happens next?",
  "landlords.reason.title.introDecline":
    "Why can this introduction not happen?",
  "landlords.reason.confirm.holdBack": "Hold back",
  "landlords.reason.confirm.remove": "Remove",
  "landlords.reason.confirm.introAccept": "Accept",
  "landlords.reason.confirm.introDecline": "Decline",
  "landlords.reason.placeholder.holdBack":
    "Say what needs checking before this goes in the directory.",
  "landlords.reason.placeholder.remove": "Say why this is coming out.",
  "landlords.reason.placeholder.introAccept":
    "We have passed your note on. Expect to hear back this week.",
  "landlords.reason.placeholder.introDecline":
    "Say what got in the way, and what they could try instead.",

  "landlords.intro.status.pending": "Waiting",
  "landlords.intro.status.accepted": "Accepted",
  "landlords.intro.status.declined": "Declined",
  "landlords.intro.askedBy": "{name} asked",
  "landlords.intro.askedByName": "Asked by {name}",
  "landlords.intro.asked": "Asked {age}",
  "landlords.intro.waitingDays_one": "Waiting {count} day",
  "landlords.intro.waitingDays_other": "Waiting {count} days",
  "landlords.intro.acceptCta": "Accept",
  "landlords.intro.declineCta": "Decline",
  "landlords.intro.answered": "Answered",
  "landlords.intro.count_one": "{count} request",
  "landlords.intro.count_other": "{count} requests",
  "landlords.intro.empty.title": "Nobody waiting",
  "landlords.intro.empty.body":
    "Every introduction in this view has an answer.",
  "landlords.intro.error.title": "The requests didn't load",
  "landlords.intro.error.body":
    "Something went wrong on the way here. Try again in a moment.",
  "landlords.intro.reasonSubject": "{member} asked to be introduced to {name}",
  "landlords.intro.toast.accepted":
    "The member has been told you'll make the introduction to {name}.",
  "landlords.intro.toast.declined":
    "The member has been told, with your reason.",
  "landlords.intro.toast.error": "That answer didn't save. Try again.",

  // ── ADDITIONS to the existing housingGroups.listings.* group ───────────────
  "housingGroups.listings.reviewQueueNote":
    "Hiding takes a published listing down. Whether a room goes up at all is decided in the review queue.",
  "housingGroups.listings.reviewQueueCta": "Open the review queue",

  // ── ADDITIONS to the existing adminReadingGroupProposals.* group ───────────
  "adminReadingGroupProposals.statusTab.pending": "Waiting",
  "adminReadingGroupProposals.statusTab.approved": "Approved",
  "adminReadingGroupProposals.statusTab.declined": "Declined",
  "adminReadingGroupProposals.statusTab.archived": "Archived",
  "adminReadingGroupProposals.statusTab.all": "Everything",
  "adminReadingGroupProposals.filter.formatLabel": "Format",
  "adminReadingGroupProposals.row.decided": "decided {date}",
  "adminReadingGroupProposals.row.decisionNote": "What they were told: {note}",
  "adminReadingGroupProposals.row.openCommunity":
    "Open the community this created",
  "adminReadingGroupProposals.decline.eyebrow": "The proposer reads this",
  "adminReadingGroupProposals.decline.title":
    "Why is this group not going ahead?",
  "adminReadingGroupProposals.decline.label": "Your message",
  "adminReadingGroupProposals.decline.placeholder":
    "Say what got in the way, and whether a different book or format would work.",
  "adminReadingGroupProposals.decline.hint":
    "This reaches the member word for word, in the app and on their phone. Write it to them.",

  // ── Appeals and ban ratification (section 1 build) ──────────────────────
  // Appeal deadlines and the awaiting/decided split (TS-11).
  "moderation.appeals.awaitingTab": "Waiting ({count})",
  "moderation.appeals.decidedTab": "Decided ({count})",
  "moderation.appeals.drawerDue": "A decision is due by {date}.",
  "moderation.appeals.drawerOverdue":
    "This appeal was due on {date}. The member has been waiting longer than the Code of Conduct promises.",
  "moderation.appeals.dueFlag": "Due {date}",
  "moderation.appeals.noDecided": "No appeals have been decided yet.",
  "moderation.appeals.noOverdue":
    "Every appeal is inside its window. That is the whole job done on time.",
  "moderation.appeals.overdueFilter": "Past their window ({count})",
  "moderation.appeals.overdueFlag": "Past its window",
  "moderation.appeals.tabsAriaLabel": "Filter appeals",
  "moderation.appeals.windowNote":
    "The Code of Conduct promises every appeal is decided within 7 days, by someone other than the moderator who made the original call.",

  // The second signature a permanent ban waits on (TS-12).
  "moderation.ratification.askedBy": "{name} asked for this on {date}",
  "moderation.ratification.badge": "Permanent ban",
  "moderation.ratification.confirmCta": "Confirm the ban",
  "moderation.ratification.confirmModal.askedByLabel": "What {name} wrote",
  "moderation.ratification.confirmModal.body":
    "This ends {name}'s account. Every session is signed out and they cannot come back. The way back is an appeal, which a different moderator decides.",
  "moderation.ratification.confirmModal.cta": "Confirm the ban",
  "moderation.ratification.confirmModal.lapseNote":
    "If nobody confirms it, this lapses on {date} and their account comes back.",
  "moderation.ratification.confirmModal.noteLabel": "Your own note (optional)",
  "moderation.ratification.confirmModal.notePlaceholder":
    "Anything you want on the record about why you agreed.",
  "moderation.ratification.confirmModal.title": "Remove {name}'s account?",
  "moderation.ratification.confirmedToast": "{name} has been removed.",
  "moderation.ratification.declineCta": "Refuse it",
  "moderation.ratification.declineModal.body":
    "{name} comes straight back. The moderator who asked can make the case again with more to go on.",
  "moderation.ratification.declineModal.cta": "Refuse it",
  "moderation.ratification.declineModal.notePlaceholder":
    "Say why, so the moderator who asked knows what would change your mind.",
  "moderation.ratification.declineModal.title": "Refuse the ban on {name}?",
  "moderation.ratification.declinedToast":
    "{name} is back. The ban was refused.",
  "moderation.ratification.empty": "Nothing is waiting on a second moderator.",
  "moderation.ratification.errorToast": "That did not go through. Try again.",
  "moderation.ratification.interim":
    "They are suspended in the meantime. If nobody confirms, the suspension ends by itself and their account comes back.",
  "moderation.ratification.intro":
    "A permanent ban takes <em>two</em> moderators. One asks, a second confirms. Nothing here has removed anyone yet, and anything nobody confirms simply lapses.",
  "moderation.ratification.lapsed": "Lapsed",
  "moderation.ratification.lapsesAt": "Lapses {date}",
  "moderation.ratification.noReason":
    "No reason was written. Ask before you confirm.",
  "moderation.ratification.ownRequest":
    "You asked for this one, so it needs someone else's eyes.",
  "moderation.ratification.title": "Remove {name} from QueerPulse",

  // Remaining section 1 moderation keys.
  "moderation.tabs.ratification": "Waiting on a second look",
  "moderation.tabs.health": "Queue health",

  // ── TS-04. Moderator workload and SLA health. ─────────────────────────────
  // The tone rule for every string below: it describes the STATE OF THE WORK
  // and never the performance of a person. Nothing here counts what anyone got
  // through, ranks anyone, or implies that a backlog is somebody's fault. This
  // surface exists to catch a rota being overloaded before it burns out, and
  // copy that reads as pressure would cause the thing it is here to prevent.
  "moderationHealth.intro":
    "What is waiting across every queue, and how each one reads against the windows we publish. This is about the size of the work, so it can be shared out before it gets heavy.",
  "moderationHealth.summaryAriaLabel": "Overall queue health",
  "moderationHealth.overallExplainer":
    "The worst queue sets this, so nothing gets averaged away.",
  "moderationHealth.activeModerators_one":
    "{count} person can work these queues",
  "moderationHealth.activeModerators_other":
    "{count} people can work these queues",
  "moderationHealth.measuredAt": "Measured at {time}",
  "moderationHealth.loadError":
    "Could not read the queues just now. Try again in a moment.",

  // Three levels and no more. `ok` means nothing to say, `warning` means plan
  // to work it, `critical` means a published window has already passed.
  "moderationHealth.severity.ok": "Clear",
  "moderationHealth.severity.warning": "Getting busy",
  "moderationHealth.severity.critical": "Needs someone now",

  // The client owns these names: the wire carries only the stable queue key.
  "moderationHealth.queue.invite_requests": "Invite requests",
  "moderationHealth.queue.reports": "Reports",
  "moderationHealth.queue.appeals": "Appeals",
  "moderationHealth.queue.verification": "Verification requests",
  "moderationHealth.queue.ban_ratifications": "Bans needing a second signature",
  "moderationHealth.queue.unknown": "Another queue",
  // The other twenty-two queues the admin-queue-notifications registry can
  // name (see ADMIN_QUEUE_KEYS in features/notifications/api/adminQueueRoutes).
  "moderationHealth.queue.dsar": "Data requests",
  "moderationHealth.queue.housing_listings": "Housing listings",
  "moderationHealth.queue.housing_group_listings": "Group housing listings",
  "moderationHealth.queue.landlord_intro_requests": "Landlord introductions",
  "moderationHealth.queue.landlord_suggestions": "Landlord suggestions",
  "moderationHealth.queue.concerns": "Governance concerns",
  "moderationHealth.queue.intakes": "Intake forms",
  "moderationHealth.queue.legal_requests": "Legal and government demands",
  "moderationHealth.queue.housing_group_join_requests":
    "Housing group join requests",
  "moderationHealth.queue.housing_coop_join_requests": "Co-op join requests",
  "moderationHealth.queue.community_tag_requests": "Community tag requests",
  "moderationHealth.queue.community_space_requests": "Space requests",
  "moderationHealth.queue.reading_group_proposals": "Reading group proposals",
  "moderationHealth.queue.safe_space_nominations": "Safe space nominations",
  "moderationHealth.queue.safe_space_flags": "Safe space flags",
  "moderationHealth.queue.listing_submissions": "Directory listings",
  "moderationHealth.queue.listing_claims": "Listing claims",
  "moderationHealth.queue.listing_edit_suggestions": "Listing edit suggestions",
  "moderationHealth.queue.resource_suggestions": "Resource suggestions",
  "moderationHealth.queue.magazine_submissions": "Story submissions",
  "moderationHealth.queue.writer_applications": "Writer applications",
  "moderationHealth.queue.commission_interests": "Commission interest",
  "moderationHealth.queue.partner_applications": "Partner applications",
  "moderationHealth.queue.changemaker_nominations": "Changemaker nominations",
  "moderationHealth.queue.roadmap_ideas": "Member ideas",
  "moderationHealth.queue.guide_reviews": "Guide reviews",
  "moderationHealth.queue.ban_evasion_escalations": "Ban-evasion escalations",
  "moderationHealth.queue.community_owner_review_requests":
    "Owner review requests",
  "moderationHealth.queue.forum_thread_reviews":
    "Forum threads awaiting review",
  "moderationHealth.queue.safety_inquiries": "Safety messages",
  "adminForumReview.title": "Forum <em>review</em>",
  "adminForumReview.header.eyebrow": "Forum",
  "adminForumReview.header.title": "Threads waiting on <em>a read</em>",
  "adminForumReview.header.sub":
    "Members held these back for a moderator. Nobody else sees them until you approve.",
  "adminForumReview.empty":
    "Nothing waiting. Every thread sent for review has a decision.",
  "adminForumReview.error": "The queue didn't load.",
  "adminForumReview.loadMore": "Load more",
  "adminForumReview.loadingMore": "Loading…",
  "adminForumReview.row.submitted": "Sent {time}",
  "adminForumReview.row.inCommunity": "In {community}",
  "adminForumReview.row.anonymous": "Will post anonymously",
  "adminForumReview.row.scheduled": "Goes live {time} once approved",
  "adminForumReview.row.warnings": "Warnings: {warnings}",
  "adminForumReview.funding.chip": "Fundraiser",
  "adminForumReview.funding.aria": "Fundraiser checks",
  "adminForumReview.funding.goal": "Goal",
  "adminForumReview.funding.link": "Donations go to",
  "adminForumReview.funding.verification": "Poster's verification",
  "adminForumReview.funding.accountAge": "Account age",
  "adminForumReview.funding.accountAgeDays_one": "{count} day",
  "adminForumReview.funding.accountAgeDays_other": "{count} days",
  "adminForumReview.action.approve": "Approve",
  "adminForumReview.action.reject": "Decline",
  "adminForumReview.rejectModal.title": 'Decline "{title}"?',
  "adminForumReview.rejectModal.body":
    "The author is told it was declined. A note helps them fix it.",
  "adminForumReview.rejectModal.noteLabel": "Note for the author (optional)",
  "adminForumReview.rejectModal.submit": "Decline thread",
  "adminForumReview.rejectModal.cancel": "Keep it waiting",
  "adminForumReview.toast.approved":
    "Approved. The thread is live and the author knows.",
  "adminForumReview.toast.rejected": "Declined. We told the author.",
  "adminForumReview.toast.conflict": "Someone already decided on this thread.",
  "adminForumReview.toast.error": "That didn't go through. Try again?",

  // Which of the three axes tripped, said as what it means rather than as the
  // field name.
  "moderationHealth.breachesLabel": "What tipped it:",
  "moderationHealth.breach.depth": "a lot is waiting",
  "moderationHealth.breach.oldest": "something has waited a long time",
  "moderationHealth.breach.overdue": "windows we published have passed",

  "moderationHealth.stat.depth": "Waiting",
  "moderationHealth.stat.oldest": "Longest wait",
  // Null oldest means the queue is EMPTY, which is the best news here.
  "moderationHealth.stat.oldestEmpty": "Nothing waiting",
  "moderationHealth.stat.overdue": "Past its window",
  "moderationHealth.stat.unassigned": "Unclaimed",
  // Null unassigned means this queue has no claiming at all. A zero would read
  // as "everything is claimed", which is the opposite of what the null says.
  "moderationHealth.stat.unassignedNotApplicable": "Not applicable",
  "moderationHealth.stat.unassignedNoClaiming":
    "This queue has no claiming step",
  "moderationHealth.stat.perModerator": "Each, if shared out",
  // Null per-moderator means there are zero active moderators.
  "moderationHealth.stat.noModerators": "Nobody on rota",
  "moderationHealth.stat.noModeratorsNote":
    "No active moderator or admin accounts",
  "moderationHealth.stat.median": "Usual turnaround",

  // Read off the response, never restated here: the bands move in one backend
  // edit and this line moves with them.
  "moderationHealth.threshold.warnsAt": "Flags at {value}",
  "moderationHealth.threshold.criticalAt": "Needs someone at {value}",
  "moderationHealth.threshold.pastCritical": "Already past {value}",

  // The compact reading, shown only at warning or critical.
  "moderationHealth.indicator.warning_one": "{count} queue is getting busy.",
  "moderationHealth.indicator.warning_other":
    "{count} queues are getting busy.",
  "moderationHealth.indicator.critical_one": "{count} queue needs someone now.",
  "moderationHealth.indicator.critical_other":
    "{count} queues need someone now.",
  "moderationHealth.indicator.cta": "See queue health",

  // The staff notification. `ok` is the recovery notice, so it closes the
  // alert rather than opening one. No copy here asks anyone to hurry.
  "moderationHealth.notification.warning.text_one":
    "{queue} has {count} item waiting, {overdue}. Longest wait: {oldest}.",
  "moderationHealth.notification.warning.text_other":
    "{queue} has {count} items waiting, {overdue}. Longest wait: {oldest}.",
  "moderationHealth.notification.warning.meta":
    "Worth a look when someone has time.",
  "moderationHealth.notification.critical.text_one":
    "{queue} has {count} item waiting, {overdue}. Longest wait: {oldest}.",
  "moderationHealth.notification.critical.text_other":
    "{queue} has {count} items waiting, {overdue}. Longest wait: {oldest}.",
  "moderationHealth.notification.critical.meta":
    "Past a window we published. If nobody is free, say so in the staff room.",
  "moderationHealth.notification.ok.text_one":
    "{queue} is back to normal, with {count} item waiting.",
  "moderationHealth.notification.ok.text_other":
    "{queue} is back to normal, with {count} items waiting.",
  "moderationHealth.notification.ok.meta":
    "Nothing to do. Thanks for clearing it.",
  "moderationHealth.notification.overdueToken_one": "{value} past its window",
  "moderationHealth.notification.overdueToken_other":
    "{value} past their window",
  "moderationHealth.notification.oldestToken_one": "{value} hour",
  "moderationHealth.notification.oldestToken_other": "{value} hours",
  "moderationHealth.notification.oldestNone": "nothing waiting",

  // The staff arrival notice. One string for all twenty-seven queues: the queue
  // interpolates as {queue} and the count is CLDR-pluralised. It bundles on
  // the queue, so {count} can be greater than one. No copy here asks anyone
  // to hurry, and none of it says anything was sent.
  "queueArrival.text_one": "{queue}: {count} item is waiting for a look.",
  "queueArrival.text_other": "{queue}: {count} items are waiting for a look.",
  "queueArrival.meta": "Something landed in a queue you work.",

  // ââ Volunteer hours report (SUS-05) âââââââââââââââââââââââââââââââââââââââ
  // Admin oversight of volunteering: confirmed sessions and hours over a
  // period. Aggregates only. There is no per-member ranking here and there is
  // no string for one.
  "volunteerHours.title": "Volunteer <em>hours</em>",
  "volunteerHours.header.eyebrow": "Reporting",
  "volunteerHours.header.title": "Volunteer <em>hours</em>",
  "volunteerHours.header.sub":
    "Confirmed volunteer sessions and the hours they added up to, so the team can answer a partner with a figure.",
  "volunteerHours.periodLabel": "Period",
  "volunteerHours.period.days30": "Last 30 days",
  "volunteerHours.period.days90": "Last 90 days",
  "volunteerHours.period.months12": "Last 12 months",
  "volunteerHours.period.all": "All time",
  "volunteerHours.headline.hours": "Hours contributed",
  "volunteerHours.headline.sessions": "Confirmed sessions",
  "volunteerHours.headline.volunteers": "People who volunteered",
  "volunteerHours.method":
    "Only sessions a poster confirmed as attended are counted. A recorded no-show stays out of every figure here. These are platform totals: this page holds no record of who volunteered most, and it never will.",
  "volunteerHours.empty":
    "Nothing has been confirmed in this period yet. Hours appear here once a poster confirms somebody turned up.",
  "volunteerHours.error":
    "These figures could not be loaded. Try again in a moment.",
  "volunteerHours.sessionsHeader": "Sessions",
  "volunteerHours.hoursHeader": "Hours",
  "volunteerHours.capped":
    "This list shows the top {limit} rows. The totals above cover everything in the period.",
  "volunteerHours.byOpportunity.caption": "By opportunity",
  "volunteerHours.byOpportunity.roleHeader": "Role",
  "volunteerHours.byOpportunity.empty":
    "No opportunity has confirmed hours in this period.",
  "volunteerHours.byCommunity.caption": "By community",
  "volunteerHours.byCommunity.communityHeader": "Community",
  "volunteerHours.byCommunity.empty":
    "No community has confirmed hours in this period. Opportunities posted without a community still count in the totals above.",
  "volunteerHours.byCommunity.unresolved": "Community no longer on file",

  // Partner-application queue, once OPS-04's filter can empty it (Task B).
  "partners.emptyFiltered":
    "Nothing matches this filter. Switch back to Everything to see the whole queue.",

  // ── Account recovery: the three levers that stop an accident stranding
  // somebody permanently (PRD-06/11/13). Shown in the member drawer only when
  // there is something to recover, plus the suppression-list tool in the page
  // header, which belongs to no member because the account it protected was
  // erased.
  //
  // `blockedReason` sentences are NOT here. The server writes them, because it
  // is the only place that knows which refusal applies, and a translated copy
  // would be a second set of guardrails free to drift from the enforced ones.
  "recovery.sectionTitle": "Account recovery",
  "recovery.sectionHint":
    "Repairs for members who cannot get back in on their own. Every action here is recorded against your name.",
  "recovery.loadError":
    "Could not load this member's recovery status. Reload before assuming there is nothing here.",
  "recovery.reasonLabel": "Why are you doing this?",
  "recovery.reasonHint":
    "Kept in the permanent audit trail. Write what a colleague would need a year from now.",
  "recovery.missingReasonToast": "Add a reason before you confirm.",

  "recovery.reactivate.label": "Stranded deactivation",
  "recovery.reactivate.body":
    "This account is deactivated with no record of anyone asking for it, so signing in will not bring it back on its own.",
  "recovery.reactivate.cta": "Reactivate account",
  "recovery.reactivate.blockedFallback":
    "Reactivation is not available for this member.",
  "recovery.reactivate.confirmTitle": "Reactivate {name}?",
  "recovery.reactivate.confirmBody":
    "{name} becomes active again and reappears across the platform. It restores nothing else: no sanction is lifted and no deletion is cancelled.",
  "recovery.reactivate.confirmCta": "Reactivate",
  "recovery.reactivate.reasonPlaceholder":
    "e.g. support ticket 412: deactivated with no ledger row after the June migration",
  "recovery.reactivate.doneToast": "{name} is active again.",

  "recovery.relink.label": "Sign-in identity",
  "recovery.relink.body":
    "A Google account holding this member's verified address has been turned away at sign-in. That happens when their Google account is re-created, which issues a new identity for the same address.",
  "recovery.relink.blockedFallback":
    "Re-linking is not available for this member.",
  "recovery.relink.candidateLabel": "Google identity ending {tail}",
  "recovery.relink.candidateMeta":
    "{attempts} attempts, first {first}, most recent {last}",
  "recovery.relink.status.pending": "Waiting",
  "recovery.relink.status.applied": "Linked",
  "recovery.relink.status.dismissed": "Refused",
  "recovery.relink.status.superseded": "Retired",
  "recovery.relink.applyCta": "Re-link",
  "recovery.relink.dismissCta": "Refuse",
  "recovery.relink.relinkConfirmTitle":
    "Hand {name}'s account to this identity?",
  "recovery.relink.relinkConfirmBody":
    "From now on, whoever holds the Google account ending {tail} signs in as {name}. Every session {name} currently has ends immediately. Only do this when you are sure that account is theirs.",
  "recovery.relink.relinkConfirmCta": "Re-link sign-in",
  "recovery.relink.relinkReasonPlaceholder":
    "e.g. support ticket 987: confirmed by video call that their work Google account was re-created",
  "recovery.relink.relinkDoneToast":
    "{name} can sign in with their new Google account. Their old sessions were ended.",
  "recovery.relink.dismissConfirmTitle": "Refuse this sign-in identity?",
  "recovery.relink.dismissConfirmBody":
    "The Google account ending {tail} stops being offered as a way back into {name}'s account. It is kept on the record, and knocking again will not put it back in the queue.",
  "recovery.relink.dismissConfirmCta": "Refuse identity",
  "recovery.relink.dismissReasonPlaceholder":
    "e.g. member confirmed this is not their account",
  "recovery.relink.dismissDoneToast":
    "That identity will not be offered again.",

  "recovery.suppression.openCta": "Suppression list",
  "recovery.suppression.title": "Erasure suppression list",
  "recovery.suppression.body":
    "When someone erases their account, their address goes on a permanent list so signing in again cannot quietly re-create it. Look an address up here, and lift it when someone has changed their mind or the erasure was a mistake.",
  "recovery.suppression.emailLabel": "Email address",
  "recovery.suppression.emailPlaceholder": "the address they are trying to use",
  "recovery.suppression.lookupCta": "Check address",
  "recovery.suppression.missingEmailToast": "Enter an address to check.",
  "recovery.suppression.notSuppressed":
    "{email} is not on the suppression list. Whatever is blocking them is something else.",
  "recovery.suppression.found":
    "{email} was suppressed on {date}. Entry {hash}.",
  "recovery.suppression.liftWarning":
    "Lifting restores nothing. The erased account and everything in it are gone for good. It only stops the platform refusing a brand-new account on this address.",
  "recovery.suppression.reasonPlaceholder":
    "e.g. support ticket 233: asked to come back and start over",
  "recovery.suppression.liftCta": "Lift suppression",
  "recovery.suppression.liftedToast": "Suppression lifted.",
  "recovery.suppression.liftedBody":
    "Lifted. That address can create a new account now. Nothing from the old one comes back.",

  // ── PRD-32: the legal and government request register ─────────────────────
  // Admin-only. Every enum value below is a stable identifier the backend
  // serves with no label text at all, so this catalogue owns every word a
  // staff member reads about a state demand.
  "legalRequests.navLabel": "Legal requests",
  "legalRequests.title": "Legal and government <em>demands</em>",
  "legalRequests.eyebrow": "Transparency register",
  "legalRequests.headerSub":
    "Every demand for member data from a court, a police force, a ministry or any other arm of a state. The public transparency report counts these rows and publishes no field of them.",
  "legalRequests.recordCta": "Record a demand",
  "legalRequests.demoNotice":
    "Demo mode shows sample rows. Nothing here has been recorded, and nothing is sent.",
  "legalRequests.countLine": "Records matching these filters: {count}.",
  "legalRequests.empty":
    "No record matches these filters. Widen them to see the rest of the register.",
  "legalRequests.loadError":
    "The register could not be read. Try again before you treat this as an empty register.",
  "legalRequests.forbidden":
    "Your account cannot read this register. It is open to admins only.",
  "legalRequests.loadMore": "Load more",
  "legalRequests.loadingMore": "Loading…",
  "legalRequests.voidedChip": "Voided",
  "legalRequests.gagOrderChip": "Gag order",
  "legalRequests.row.openAriaLabel":
    "Open the demand from {body}, received {date}",
  "legalRequests.row.meta": "{jurisdiction}, received {date}",
  "legalRequests.row.accounts": "{affected} accounts named, {notified} told",
  "legalRequests.type.subpoena": "Subpoena",
  "legalRequests.type.court_order": "Court order",
  "legalRequests.type.police_request": "Police request",
  "legalRequests.type.emergency_disclosure_request":
    "Emergency disclosure demand",
  "legalRequests.type.preservation_request": "Preservation request",
  "legalRequests.type.takedown_demand": "Takedown demand",
  "legalRequests.type.other": "Other",
  "legalRequests.outcome.complied_in_full": "Complied in full",
  "legalRequests.outcome.complied_in_part": "Complied in part",
  "legalRequests.outcome.narrowed": "Narrowed, then complied",
  "legalRequests.outcome.refused": "Refused",
  "legalRequests.outcome.withdrawn": "Withdrawn",
  "legalRequests.outcome.pending": "Pending",
  "legalRequests.dataCategory.account_identifiers": "Account identifiers",
  "legalRequests.dataCategory.contact_details": "Contact details",
  "legalRequests.dataCategory.account_metadata": "Account metadata",
  "legalRequests.dataCategory.connection_logs": "Connection logs",
  "legalRequests.dataCategory.profile_content": "Profile content",
  "legalRequests.dataCategory.posts_and_comments": "Posts and comments",
  "legalRequests.dataCategory.private_messages": "Private messages",
  "legalRequests.dataCategory.uploaded_media": "Uploaded media",
  "legalRequests.dataCategory.membership_records": "Membership records",
  "legalRequests.dataCategory.other": "Other",
  "legalRequests.filter.stateLabel": "Records",
  "legalRequests.filter.state.all": "All records",
  "legalRequests.filter.state.active": "Standing",
  "legalRequests.filter.state.voided": "Voided",
  "legalRequests.filter.typeLabel": "Kind of demand",
  "legalRequests.filter.anyType": "Any kind",
  "legalRequests.filter.outcomeLabel": "Outcome",
  "legalRequests.filter.anyOutcome": "Any outcome",
  "legalRequests.field.requestingBody": "Who demanded it",
  "legalRequests.field.requestingBodyHint":
    "The body that made the demand, named as it names itself on the instrument.",
  "legalRequests.field.jurisdiction": "Jurisdiction",
  "legalRequests.field.requestType": "Kind of demand",
  "legalRequests.field.receivedOn": "Received on",
  "legalRequests.field.accountsAffected": "Accounts named",
  "legalRequests.field.accountsAffectedHint":
    "How many member accounts the demand covered, whatever was handed over in the end.",
  "legalRequests.field.outcome": "Outcome",
  "legalRequests.field.outcomeHint":
    "Leave this pending if the demand arrived today. Come back and complete it once the team has answered.",
  "legalRequests.field.dataDisclosed": "What was handed over",
  "legalRequests.field.dataDisclosedHint":
    "Tick nothing when nothing left the platform. These categories are staff-only, at every level of aggregation.",
  "legalRequests.field.memberNotifiedOn": "Members told on",
  "legalRequests.field.memberNotifiedOnHint":
    "The day the named members were told. This records what the team did: QueerPulse sends nothing from this screen.",
  "legalRequests.field.accountsNotified": "Accounts told",
  "legalRequests.field.accountsNotifiedHint":
    "How many of the named accounts were told. It can never be more than the number named.",
  "legalRequests.field.withheldReason": "Why they were not told",
  "legalRequests.field.withheldReasonHint":
    "Optional while nobody needed telling.",
  "legalRequests.field.withheldReasonRequired":
    "Why they were not told (required)",
  "legalRequests.field.withheldReasonRequiredHint":
    "Data left the platform and nobody was told, so the reason has to be on file. A blank here is refused.",
  "legalRequests.field.gagOrder": "Under a gag order",
  "legalRequests.field.gagOrderHint":
    "On when the instrument forbids telling the members it names.",
  "legalRequests.field.internalNote": "Internal note",
  "legalRequests.field.internalNoteHint":
    "Staff-only, at every level of aggregation. It reaches no member and no published figure.",
  "legalRequests.form.drawerLabel": "Legal demand editor",
  "legalRequests.form.createEyebrow": "New record",
  "legalRequests.form.createTitle": "Record a demand",
  "legalRequests.form.editEyebrow": "Amend",
  "legalRequests.form.editTitle": "Amend this record",
  "legalRequests.action.cancel": "Cancel",
  "legalRequests.action.record": "Record it",
  "legalRequests.action.save": "Save changes",
  "legalRequests.action.amend": "Amend",
  "legalRequests.action.void": "Void this record",
  "legalRequests.problem.requestingBodyRequired":
    "Name the body that made the demand.",
  "legalRequests.problem.jurisdictionRequired": "Name the jurisdiction.",
  "legalRequests.problem.receivedOnRequired":
    "Give the day the demand arrived.",
  "legalRequests.problem.accountsAffectedInvalid":
    "Accounts named has to be a whole number, 100000 or fewer.",
  "legalRequests.problem.accountsNotifiedInvalid":
    "Accounts told has to be a whole number, 100000 or fewer.",
  "legalRequests.problem.notifiedExceedsAffected":
    "More accounts were told than the demand named. Only a named account can be told.",
  "legalRequests.problem.notifiedCountNeedsDate":
    "Give the day the members were told, or set the count back to zero.",
  "legalRequests.problem.notifiedDateNeedsCount":
    "Give how many accounts were told on that day, or clear the date.",
  "legalRequests.problem.withheldReasonRequired":
    "Data was handed over and nobody was told. Say why.",
  "legalRequests.detail.drawerLabel": "Recorded demand",
  "legalRequests.detail.eyebrow": "Register record",
  "legalRequests.detail.untitled": "Loading this record",
  "legalRequests.detail.loadError":
    "This record could not be read. Read it again before you act on it.",
  "legalRequests.detail.voidedOn":
    "Struck from the published figures on {date}.",
  "legalRequests.detail.noVoidReason": "No reason was stored.",
  "legalRequests.detail.nothingDisclosed": "Nothing was handed over.",
  "legalRequests.detail.nobodyNotified": "Nobody has been told.",
  "legalRequests.detail.noWithheldReason": "Nothing on file.",
  "legalRequests.detail.gagOrderYes":
    "Yes. The instrument forbids telling the members it names.",
  "legalRequests.detail.gagOrderNo": "No.",
  "legalRequests.detail.noInternalNote": "No note.",
  "legalRequests.detail.recordedBy": "Recorded by",
  "legalRequests.detail.recorderErased": "That account has since been erased.",
  "legalRequests.detail.lastUpdated": "Last updated",
  "legalRequests.history.title": "Amendment history",
  "legalRequests.history.loadError":
    "The amendment history could not be read. Open the record again before you rely on it.",
  "legalRequests.history.empty": "No amendments since this record was created.",
  "legalRequests.history.actorErased": "An account since erased",
  "legalRequests.history.emptyValue": "Nothing on file",
  "legalRequests.history.yes": "Yes",
  "legalRequests.history.no": "No",
  "legalRequests.history.nothingDisclosed": "Nothing handed over",
  "legalRequests.history.changeSpoken": "Changed from {from} to {to}.",
  "legalRequests.void.eyebrow": "Strike a record",
  "legalRequests.void.title": "Void this record",
  "legalRequests.void.warning":
    "This cannot be undone. The row stays in the register and stays readable, every published figure drops it, and the count of voided records is itself published.",
  "legalRequests.void.body":
    "The demand from {body} leaves the published figures the moment you do this.",
  "legalRequests.void.reasonLabel": "Why it is being struck",
  "legalRequests.void.reasonPlaceholder":
    "e.g. entered twice, and the surviving record is the one dated 11 May",
  "legalRequests.void.reasonHint":
    "Required. A register that cannot say why a record left the figures is worth less than one that never let it leave.",
  "legalRequests.toast.created": "Recorded in the register.",
  "legalRequests.toast.updated": "Record amended.",
  "legalRequests.toast.voided":
    "Record struck. It stays in the register, out of the published figures.",
  "legalRequests.error.save": "That record could not be saved.",
  "legalRequests.error.voidedConflict":
    "This record has been voided, and a voided record is frozen.",
  "legalRequests.error.void": "That record could not be struck.",
  "legalRequests.error.alreadyVoided":
    "Somebody has already struck this record.",

  // ── PRD-31: the staff ban-evasion escalations queue ───────────────────────
  // Moderator and admin. A community moderator is told one bit; escalating is
  // how they ask staff for the cross-community picture, and nothing staff find
  // here goes back to them.
  "banEvasionEscalations.navLabel": "Ban-evasion escalations",
  "banEvasionEscalations.title": "Ban-evasion <em>escalations</em>",
  "banEvasionEscalations.eyebrow": "Staff queue",
  "banEvasionEscalations.headerSub":
    "A community moderator is told one thing about an applicant: whether they match somebody that community itself barred. Escalating is how they ask for the rest of the picture, and this is where it gets read.",
  "banEvasionEscalations.demoNotice":
    "Demo mode shows sample escalations. Nothing here is a real applicant, and resolving one sends nothing.",
  "banEvasionEscalations.status.open": "Open",
  "banEvasionEscalations.status.resolved": "Resolved",
  "banEvasionEscalations.emptyOpen":
    "No escalation is waiting. Every question a community moderator has raised is closed.",
  "banEvasionEscalations.emptyResolved": "No escalation has been closed yet.",
  "banEvasionEscalations.loadError":
    "The queue could not be read. Somebody may still be waiting, so read it again before you treat this as clear.",
  "banEvasionEscalations.forbidden":
    "Your account cannot read this queue. It is open to moderators and admins.",
  "banEvasionEscalations.subjectErased":
    "This applicant has erased their account",
  "banEvasionEscalations.moderatorErased":
    "a moderator who has since erased their account",
  "banEvasionEscalations.resolverErased":
    "a colleague who has since erased their account",
  "banEvasionEscalations.raisedBy": "Raised by {name} on {date}",
  "banEvasionEscalations.moderatorNote": "What the moderator wrote",
  "banEvasionEscalations.assessmentNote":
    "This is a signal to read, and the judgement is yours. Nothing on the platform acts on it, and none of it goes back to the community that asked.",
  "banEvasionEscalations.assessmentClear":
    "Checked across every community and the platform ban list. Nothing correlated with a removed account.",
  "banEvasionEscalations.assessmentUnavailable":
    "This applicant's account has been erased, so there is nothing left to correlate. No assessment can be made.",
  "banEvasionEscalations.outcomeTerm": "What staff found",
  "banEvasionEscalations.resolvedBy": "Closed by {name} on {date}",
  "banEvasionEscalations.resolvedUnknownDate": "Closed by {name}",
  "banEvasionEscalations.noResolutionNote": "Nobody wrote a note.",
  "banEvasionEscalations.action.resolve": "Resolve",
  "banEvasionEscalations.action.cancel": "Cancel",
  "banEvasionEscalations.resolve.eyebrow": "Close the question",
  "banEvasionEscalations.resolve.title": "Resolve this escalation",
  "banEvasionEscalations.resolve.body":
    "This records that you looked, and it lets {community} ask again if the applicant comes back. It bans nobody: whatever you decide to do happens on the surfaces that already exist for it.",
  "banEvasionEscalations.resolve.noteLabel": "Note (optional)",
  "banEvasionEscalations.resolve.notePlaceholder":
    "What you checked, and what you found",
  "banEvasionEscalations.resolve.noteHint":
    "Staff-only. The moderator who escalated learns that somebody closed the question, and nothing about what you found.",
  "banEvasionEscalations.toast.resolved": "Escalation resolved.",
  "banEvasionEscalations.error.resolve":
    "That escalation could not be resolved.",
  "banEvasionEscalations.error.alreadyResolved":
    "Somebody has already resolved this escalation.",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // PHOTO-EVIDENCE — PHOTO-EVIDENCE. The reported gathering photo inside the moderation report drawer (AdminReportPhotoEvidence.tsx). Rendered only for an event_photo report. imageAlt is the image's accessible name and deliberately says what the image IS rather than what is in it: a moderator's screen reader is often audible to whoever is nearby, and describing the person in a photo that may be outing them is the exact harm being judged. unavailable is the honest state for a photo the uploader deleted after filing; the report stays actionable, so the wording never implies the case is over.
  // PRD-47d — PRD-47d - OVERWRITES two existing keys; adds none. `ambiguous_authors` now answers two subject types: `listing_public_question` (a question and the answer under it) and `review` (a review and the reviewed party's public reply under it, on a directory listing, an employer or a home). Today's copy names a question and a listing, so a moderator refused on an employer-review or housing-review report reads a sentence about a surface they are not looking at. Two further corrections on top of the generalisation. (1) The drawer note said restrict and ban "won't go through here"; the backend only sets `is_author_ambiguous` when a second half actually EXISTS, and nothing on the wire tells the drawer whether it does, so the old sentence was already false on an unanswered question and would be false on most reviews. It now says they CAN be refused. The refusal string keeps its absolute phrasing, because it only ever renders when the flag really fired. (2) It names "whoever posted first" rather than "whoever asked", which is true of a reviewer as well as an asker, and points at "the page it was posted on" rather than "the listing", which is true of a home and an employer as well. This block supersedes the identical pair in PRD-47c.json (see the note in PRD-47D-LANDLORD-TAKEDOWN.md): that manifest is missing `overwrite`, so the merge would have skipped it, and its Portuguese is unaccented where the live catalogue is accented.
  "moderation.reportDrawer.photoEvidence.title": "Reported photo",
  "moderation.reportDrawer.photoEvidence.imageAlt":
    "The photo this report is about, as it was when the report was filed.",
  "moderation.reportDrawer.photoEvidence.unavailable":
    "This photo is no longer available. It was taken down after the report was filed, so you are deciding on the details below rather than the image. That the photo is gone does not close the report.",
  "moderation.reportDrawer.photoEvidence.captionLabel":
    "Caption written by the uploader",
  "moderation.reportDrawer.photoEvidence.uploadedAt":
    "Posted to the album on {date}",
  "moderation.reportDrawer.photoEvidence.fullSizeCta": "Open at full size",

  // Scan section 9: the reported message snapshot (AdminReportEvidence) and
  // the conversation around it (AdminReportConversationContext).
  "moderation.reportDrawer.messageEvidence.title":
    "Reported message, as it was when reported",
  "moderation.reportDrawer.messageEvidence.noBody":
    "No text came with this message.",
  "moderation.reportDrawer.messageEvidence.sentLabel": "Sent",
  "moderation.reportDrawer.messageEvidence.capturedLabel": "Captured",
  "moderation.reportDrawer.messageEvidence.kindLabel": "Type",
  "moderation.reportDrawer.messageEvidence.kindText": "Text",
  "moderation.reportDrawer.messageEvidence.editedNote":
    "Its sender edited it before it was reported.",
  "moderation.reportDrawer.messageEvidence.deletedWhenReported":
    "Its sender had already deleted it for everyone when this report was filed. QueerPulse kept it so you can review it.",
  "moderation.reportDrawer.messageEvidence.imageAlt":
    "The photo attached to the reported message",
  "moderation.reportDrawer.messageEvidence.attachmentUnavailable":
    "This file is no longer available. The details here still stand, and the report is still yours to decide.",
  "moderation.reportDrawer.messageEvidence.openFileCta":
    "Show the attached file",
  "moderation.reportDrawer.messageEvidence.fileAuditNotice":
    "Opening it is recorded in this report's action history. Nobody in the conversation is told.",
  "moderation.reportDrawer.conversationContext.openCta":
    "Show the conversation around this message",
  "moderation.reportDrawer.conversationContext.auditNotice":
    "Opening it is recorded in this report's action history. The people in the conversation are not told.",
  "moderation.reportDrawer.conversationContext.loading":
    "Opening the conversation",
  "moderation.reportDrawer.conversationContext.error":
    "We couldn't open this conversation. The message may no longer exist, or the connection dropped.",
  "moderation.reportDrawer.conversationContext.retryCta": "Try again",
  "moderation.reportDrawer.conversationContext.windowNote":
    "Up to 20 messages before and after the reported one, oldest first.",
  "moderation.reportDrawer.conversationContext.listLabel":
    "Messages around the reported message",
  "moderation.reportDrawer.conversationContext.earlierNotShown":
    "There are earlier messages this view does not show.",
  "moderation.reportDrawer.conversationContext.laterNotShown":
    "There are later messages this view does not show.",
  "moderation.reportDrawer.conversationContext.formerMember": "Former member",
  "moderation.reportDrawer.conversationContext.reportedTag": "Reported",
  "moderation.reportDrawer.conversationContext.deletedTag": "Deleted",
  "moderation.reportDrawer.conversationContext.editedTag": "Edited",
  "moderation.reportDrawer.conversationContext.deletedBody":
    "This message was deleted.",
  "moderation.reportDrawer.conversationContext.photoLabel": "Photo",
  "moderation.reportDrawer.conversationContext.gifLabel": "GIF",
  "moderation.reportDrawer.conversationContext.documentLabel": "Document",

  // PRD-356: the reported GROUP snapshot (AdminReportGroupEvidence.tsx),
  // rendered only for a `conversation` (group) report.
  "moderation.reportDrawer.groupEvidence.title": "Reported group",
  "moderation.reportDrawer.groupEvidence.memberCountLabel": "Members",
  "moderation.reportDrawer.groupEvidence.capturedLabel": "Captured",
  "moderation.reportDrawer.homeEvidence.title":
    "Reported home, as it was when reported",
  "moderation.reportDrawer.homeEvidence.locationLabel": "Location",
  "moderation.reportDrawer.homeEvidence.listerLabel": "Lister's account",
  "moderation.reportDrawer.groupRoomEvidence.title":
    "Reported room, as it was when reported",
  "moderation.reportDrawer.groupRoomEvidence.groupLabel": "Housing group",
  "moderation.reportDrawer.groupRoomEvidence.neighbourhoodLabel":
    "Neighbourhood",
  "moderation.reportDrawer.groupRoomEvidence.accessibilityLabel":
    "Accessibility",
  "moderation.reportDrawer.groupRoomEvidence.posterLabel": "Poster's account",
  "moderation.reportDrawer.housingEvidence.rentLabel": "Rent per month",
  "moderation.reportDrawer.housingEvidence.listedLabel": "Listed",
  "moderation.reportDrawer.housingEvidence.capturedLabel": "Captured",
  "moderation.reportDrawer.housingEvidence.noAccount": "No account on record",
  "moderation.reportDrawer.housingEvidence.copyAccountId": "Copy account id",
  "moderation.reportDrawer.housingEvidence.accountIdCopied":
    "Account id copied",
  "moderation.reportDrawer.housingEvidence.copyFailed":
    "Couldn't copy the account id. Select it and copy it by hand.",

  // ── PRD-282, the staff triage console (`AdminQueuesPage`) ──────────────
  // The three "null" cells below are three different sentences on purpose and
  // must stay that way. `cell.noDeadline` is a queue that never promised
  // anything, so calling it "on time" would invent a promise; `cell.onTime` is
  // a queue with a real clock and nothing late; `cell.notTracked` is a queue
  // that keeps no record of what has been worked, and must never drift towards
  // "nothing waiting". The queue NAMES are not here: they reuse the existing
  // `moderationHealth.queue.*` block, because two hand-curated lists mirroring
  // one taxonomy drift apart silently.
  "adminQueues.title": "What is <em>waiting</em>",
  "adminQueues.header.eyebrow": "Triage",
  "adminQueues.header.title": "What is <em>waiting</em>",
  "adminQueues.header.sub":
    "Every queue you can work, on one screen, with the oldest thing waiting in each.",
  "adminQueues.asOf": "Counted at {time}",
  "adminQueues.refresh": "Refresh",
  "adminQueues.refreshing": "Refreshing",
  "adminQueues.verdict.overdueTitle": "Something is past its deadline",
  "adminQueues.verdict.overdueBody":
    "Start with the rows marked overdue below. Each one is a promise the platform already made.",
  "adminQueues.verdict.clearTitle": "Nothing is overdue",
  "adminQueues.verdict.clearBody":
    "Every queue that runs on a deadline is inside it. What is below is still waiting for you.",
  "adminQueues.verdict.heroLabel_one": "thing past its deadline",
  "adminQueues.verdict.heroLabel_other": "things past their deadline",
  "adminQueues.stat.waiting": "Waiting on staff",
  "adminQueues.stat.queuesWithWork": "Queues with work",
  "adminQueues.stat.queuesWithWorkNote": "of {total} you can work",
  "adminQueues.stat.untracked": "Cannot be counted",
  "adminQueues.stat.untrackedNote":
    "These queues keep no record of what has been worked.",
  "adminQueues.table.caption": "Queues with something waiting",
  "adminQueues.table.queue": "Queue",
  "adminQueues.table.waiting": "Waiting",
  "adminQueues.table.oldest": "Oldest wait",
  "adminQueues.table.deadline": "Deadline",
  "adminQueues.cell.notTracked": "Not tracked",
  "adminQueues.cell.noDeadline": "No deadline",
  "adminQueues.cell.onTime": "On time",
  "adminQueues.cell.overdue_one": "{count} overdue",
  "adminQueues.cell.overdue_other": "{count} overdue",
  "adminQueues.age.days_one": "{count} day",
  "adminQueues.age.days_other": "{count} days",
  "adminQueues.clear.summary_one": "{count} queue is clear",
  "adminQueues.clear.summary_other": "{count} queues are clear",
  "adminQueues.deskClear.title": "Your desk is clear",
  "adminQueues.deskClear.body_one": "Nothing is waiting in the queue you work.",
  "adminQueues.deskClear.body_other":
    "Nothing is waiting in any of the {count} queues you work.",
  "adminQueues.noQueues.title": "No queues are yours yet",
  "adminQueues.noQueues.body":
    "Your account reaches no staff queue right now. Ask an admin for the grant that covers the work you do.",
  "adminQueues.error.title": "We could not read the queue counts",
  "adminQueues.error.body":
    "Try again. If it keeps failing, open the queues themselves: the counts are the only thing missing here.",

  // Feature usage panel. Feature display names cover every key in the
  // backend's launchedFeatures, so no row can render a raw key.
  "featureUsage.eyebrow": "Where effort goes",
  "featureUsage.title": "Feature <em>usage</em>",
  "featureUsage.header.title": "Feature <em>usage</em>",
  "featureUsage.sub":
    "How much each part of the platform gets browsed against how much gets used to create something. These are aggregate counts. Nothing here tracks an individual member's behaviour.",
  "featureUsage.rangeLabel": "Range",
  "featureUsage.range.d7": "Last 7 days",
  "featureUsage.range.d30": "Last 30 days",
  "featureUsage.range.d90": "Last 90 days",
  "featureUsage.reachOnlyNote":
    "Some features have nothing for a member to create. Their Created and Total columns explain why instead of showing a count, so an empty cell is never mistaken for a zero.",
  "featureUsage.table.caption":
    "Reach and creation per feature, ordered by what needs a decision first.",
  "featureUsage.column.feature": "Feature",
  "featureUsage.column.state": "State",
  "featureUsage.column.reach": "Reach",
  "featureUsage.column.reachInfoLabel": "About reach",
  "featureUsage.column.reachInfo":
    "Reach counts requests to the feature, so it measures traffic. Nothing here counts people. Each row compares this period with the one just before it, which the faint bars show, and the note under it places the feature against the median launched feature.",
  "featureUsage.column.created": "Created",
  "featureUsage.column.total": "Total",
  "featureUsage.column.details": "Details",
  "featureUsage.state.busy.label": "Busy",
  "featureUsage.state.busy.explainer":
    "Healthy reach and healthy creation. Leave it alone.",
  "featureUsage.state.browsedButEmpty.label": "Browsed but empty",
  "featureUsage.state.browsedButEmpty.explainer":
    "People arrive and nothing gets created. The path is stopping them.",
  "featureUsage.state.quiet.label": "Quiet",
  "featureUsage.state.quiet.explainer":
    "Low reach and low creation. Either nobody finds it or nobody wants it.",
  "featureUsage.state.notLaunched.label": "Not launched",
  "featureUsage.state.notLaunched.explainer":
    "Flagged off on purpose, so it is excluded from the ranking above.",
  "featureUsage.stat.busy.trend": "Steady",
  "featureUsage.stat.browsedButEmpty.trend": "Top priority",
  "featureUsage.stat.quiet.trend": "Low signal",
  "featureUsage.stat.notLaunched.trend": "Off by design",
  "featureUsage.dateRange": "{start} to {end}",
  "featureUsage.error.forbidden":
    "Feature usage needs the admin role or the product manager grant.",
  "featureUsage.error.rangeConflictingParams":
    "The request mixed a preset range with custom dates. Pick one range and try again.",
  "featureUsage.error.rangeIncomplete":
    "A custom range needs a start date and an end date.",
  "featureUsage.error.rangeInvalidDate":
    "One of the dates is not a real calendar day.",
  "featureUsage.error.rangeInvalidDays":
    "The range length has to be a whole number of days.",
  "featureUsage.error.rangeReversed":
    "The start date comes after the end date.",
  "featureUsage.error.rangeTooLong":
    "A custom range can cover at most 365 days.",
  "featureUsage.error.rangeBeforeRetention":
    "Reach is kept for 24 months, so the start date has to fall inside that window.",
  "featureUsage.error.rangeIncludesToday":
    "Today is still being counted, so the range has to end yesterday or earlier.",
  "featureUsage.error.unknownFeature":
    "This feature is missing from the usage list.",
  "featureUsage.error.featureNotTracked":
    "This feature is never measured, by design.",
  "featureUsage.error.network":
    "The server could not be reached or took too long. Check your connection and try again.",
  "featureUsage.error.server":
    "The server hit an error while counting usage. Try again in a moment.",
  "featureUsage.reachCompare.withPercent":
    "{difference} ({percent}) vs {previous}",
  "featureUsage.reachCompare.absolute": "{difference} vs {previous}",
  "featureUsage.reachCompare.same": "Same as before, {previous}",
  "featureUsage.reachCompare.new": "New this period",
  "featureUsage.reachCompare.none": "No reach in either period",
  "featureUsage.reachCompare.partial":
    "Only part of the previous period is still kept",
  "featureUsage.column.reachVs": "vs {dates}",
  "featureUsage.range.previousPartial":
    "Part of the previous period is older than the 24 months reach is kept for, so its comparison runs low.",
  "featureUsage.detail.emptyBoth":
    "No requests in this period or the one before it.",
  "featureUsage.median.above": "{multiple} times the median feature",
  "featureUsage.median.about": "About the median feature",
  "featureUsage.median.below": "{percent} of the median feature",
  "featureUsage.detail.regionLabel": "Details for {feature}",
  "featureUsage.detail.summary.peak": "Busiest day",
  "featureUsage.detail.summary.peakValue": "{countLabel} on {day}",
  "featureUsage.detail.summary.peakNone": "No requests in this period",
  "featureUsage.detail.summary.average": "Average per day",
  "featureUsage.detail.summary.zeroDays": "Days with no activity",
  "featureUsage.detail.summary.zeroDaysValue": "{zeroDays} of {totalDays}",
  "featureUsage.detail.reach.title": "Reach per day",
  "featureUsage.detail.reach.subtitle": "{current}, with {previous} dashed",
  "featureUsage.detail.reach.ariaLabel": "Reach per day for {feature}",
  "featureUsage.detail.legend.current": "This period",
  "featureUsage.detail.legend.previous": "Previous period",
  "featureUsage.detail.tip.requests_one": "{countLabel} request",
  "featureUsage.detail.tip.requests_other": "{countLabel} requests",
  "featureUsage.detail.tip.previous": "Previous, {day}: {countLabel}",
  "featureUsage.detail.bar.ariaLabel":
    "{day}: {currentLabel} this period, {previousLabel} in the period before",
  "featureUsage.detail.created.title": "Created per day",
  "featureUsage.detail.created.subtitle": "What members created, {current}",
  "featureUsage.detail.created.ariaLabel": "Created per day for {feature}",
  "featureUsage.detail.created.tip_one": "{countLabel} created",
  "featureUsage.detail.created.tip_other": "{countLabel} created",
  "featureUsage.detail.created.pointAriaLabel": "{day}: {createdLabel}",
  "featureUsage.detail.created.loadError":
    "Could not load created per day: {reason}",
  "featureUsage.detail.previousPartial":
    "Part of the previous period is older than the 24 months reach is kept for, so those days read as zero.",
  "featureUsage.detail.drillDownTitle": "Breakdown",
  "featureUsage.range.custom": "Custom",
  "featureUsage.range.customLabel": "Custom range",
  "featureUsage.range.customHint":
    "Up to 365 days, ending yesterday at the latest.",
  "featureUsage.range.summary": "{current}, compared with {previous}",
  "featureUsage.drillDown.expandLabel": "Show details for {feature}",
  "featureUsage.drillDown.collapseLabel": "Hide details for {feature}",
  "featureUsage.drillDown.housingListings.listings": "Listings created",
  "featureUsage.drillDown.housingListings.savedSearches": "Saved searches",
  "featureUsage.drillDown.housingListings.viewings": "Viewings",
  "featureUsage.drillDown.forum.threads": "Threads",
  "featureUsage.drillDown.forum.replies": "Replies",
  "featureUsage.drillDown.communities.created": "Communities created",
  "featureUsage.drillDown.communities.stillPostingThisWeek":
    "Still posting this week",
  "featureUsage.drillDown.communities.stillPostingNote":
    "A rolling 7-day count, independent of the range selected above.",
  "featureUsage.feature.housingListings": "Housing listings",
  "featureUsage.feature.landlords": "Landlords",
  "featureUsage.feature.magazine": "Magazine",
  "featureUsage.feature.content": "Topics",
  "featureUsage.feature.feed": "Feed",
  "featureUsage.feature.communities": "Communities",
  "featureUsage.feature.forum": "Forum",
  "featureUsage.feature.events": "Events",
  "featureUsage.feature.cinema": "Cinema",
  "featureUsage.feature.companies": "Companies",
  "featureUsage.feature.jobs": "Jobs",
  "featureUsage.feature.barter": "Barter",
  "featureUsage.feature.community": "Community programmes",
  "featureUsage.feature.partners": "Partners",
  "featureUsage.feature.volunteering": "Volunteering",
  "featureUsage.feature.connections": "Connections",
  "featureUsage.feature.messaging": "Messages",
  "featureUsage.feature.listings": "Business listings",
  "featureUsage.feature.housing": "Housing co-ops",
  "featureUsage.feature.flatmateProfiles": "Flatmate profiles",
  "featureUsage.feature.resources": "Resources",
  "featureUsage.feature.culture": "Culture",
  "featureUsage.feature.governance": "Governance",
  "featureUsage.feature.roadmap": "Roadmap",
  "featureUsage.noReachSignal.notice":
    "No reach was recorded for the selected range. Every feature therefore reads as Quiet until reach is recorded, so the states below are not yet meaningful.",
  "featureUsage.notApplicable": "Not applicable:",
  "featureUsage.reachOnlyReason.feed":
    "The feed is a read surface and creates nothing.",
  "featureUsage.reachOnlyReason.content":
    "Topics are a curated taxonomy with no member create route, and topic posts are derived from forum threads that are already counted as forum depth.",
  "featureUsage.reachOnlyReason.cinema":
    "Titles are published by editorial staff only; no member route creates a title, and watch history is excluded on the same privacy grounds as messaging.",
  "featureUsage.reachOnlyReason.generic":
    "This feature has nothing for a member to create.",
  "featureUsage.loadError":
    "We could not load feature usage. Try again in a moment.",
  "featureUsage.empty": "No features to show for this range yet.",

  // Scan section 9: official messages console (AdminOfficialMessagesPage).
  // `status.*` resolves dynamically from the broadcast row's status.
  "officialMessages.eyebrow": "Platform",
  "officialMessages.title": "Official messages",
  "officialMessages.subtitle":
    "Speak as QueerPulse, in each member's official thread. Admins only.",
  // Shown only when this staff member's mailboxes include the QueerPulse
  // Team one, where members' replies to official messages land.
  "officialMessages.openInbox": "Open the team inbox",
  "officialMessages.member.title": "Message one member",
  "officialMessages.member.subtitle":
    "It lands in their official QueerPulse thread, pinned at the top of their inbox. No phone notification is sent.",
  "officialMessages.member.searchLabel": "Find a member",
  "officialMessages.member.searchPlaceholder": "Search by name or handle",
  "officialMessages.member.noResults": "No members match that search.",
  "officialMessages.member.change": "Change",
  "officialMessages.member.notActive": "Account not active",
  "officialMessages.member.bodyLabel": "Message",
  "officialMessages.member.bodyPlaceholder":
    "Write what you want them to know.",
  "officialMessages.member.send": "Send message",
  "officialMessages.member.sending": "Sending",
  "officialMessages.member.sent": "Sent to {name}.",
  "officialMessages.member.recipientGone":
    "That member's account no longer exists. Pick someone else.",
  "officialMessages.member.sendFailed":
    "The message didn't send. Try again in a moment.",
  "officialMessages.body.count": "{used}/{max}",
  "officialMessages.broadcast.title": "Broadcast to everyone",
  "officialMessages.broadcast.subtitle":
    "One message to every active member, each in their own official thread. Keep it for things everyone needs to know.",
  "officialMessages.broadcast.bodyLabel": "Broadcast message",
  "officialMessages.broadcast.bodyPlaceholder":
    "Maintenance windows, safety notices, changes that affect the whole community.",
  "officialMessages.broadcast.review": "Review and send",
  "officialMessages.broadcast.confirmTitle":
    "Send this to every active member?",
  "officialMessages.broadcast.confirmScope":
    "Every active member receives it in their official QueerPulse thread. Suspended and paused accounts are left out. Once sent, it can't be taken back.",
  "officialMessages.broadcast.confirm": "Send to everyone",
  "officialMessages.broadcast.cancel": "Keep editing",
  "officialMessages.broadcast.accepted":
    "Broadcast on its way. Its progress shows below.",
  "officialMessages.broadcast.keyReused":
    "This draft changed after it was sent. Send it again and it goes out as a new broadcast.",
  "officialMessages.broadcast.failed":
    "The broadcast didn't go through. Try again: it will never reach anyone twice.",
  "officialMessages.history.title": "Broadcast history",
  "officialMessages.history.empty": "No broadcasts yet.",
  "officialMessages.history.loadFailed":
    "Broadcast history didn't load. Refresh to try again.",
  "officialMessages.history.progress": "{delivered} of {total} delivered",
  "officialMessages.history.sentBy": "Sent by {name}",
  "officialMessages.history.sentByErased": "Sent by a former admin",
  "officialMessages.status.pending": "Queued",
  "officialMessages.status.sending": "Sending",
  "officialMessages.status.completed": "Delivered",
  "officialMessages.status.failed": "Stopped",

  // Sticker pack builder (AdminStickerPacksPage, src/features/admin/stickerBuilder/)
  "stickerPacks.title": "Sticker <em>packs</em>",
  "stickerPacks.sub":
    "Make stickers from a template, then publish the pack when it's ready.",

  "stickerPacks.rail.heading": "Packs",
  "stickerPacks.rail.newCta": "New pack",
  "stickerPacks.rail.newSlug": "Slug",

  "stickerPacks.status.draft": "Draft",
  "stickerPacks.status.published": "Published",
  "stickerPacks.status.archived": "Archived",

  "stickerPacks.controls.flagsLegend": "Flags",
  "stickerPacks.controls.selectAll": "Select all",
  "stickerPacks.controls.clear": "Clear",
  "stickerPacks.controls.frameColor": "Frame colour",
  "stickerPacks.controls.cornerArrows": "Corner arrows",

  "stickerPacks.publish.stickerLabel": "{flag} reverse",

  "stickerPacks.detail.publishBlocked": "Add at least one sticker first",

  "stickerPacks.toast.packCreated": "Pack created",

  "stickerPacks.errors.create": "Couldn't create the pack",
  "stickerPacks.errors.updateStatus": "Couldn't update the pack",
  "stickerPacks.errors.setCover": "Couldn't set the cover",
  "stickerPacks.errors.deleteSticker": "Couldn't remove the sticker",
  "stickerPacks.errors.lastStickerInPublishedPack":
    "A published pack needs at least one sticker. Unpublish or archive the pack first, or add another sticker.",
  "stickerPacks.publish.retrying": "Retrying…",
  "stickerPacks.contents.hintTouch":
    "Use a sticker's menu to move it. Members see stickers in this order.",
  "stickerPacks.page.error.retry": "Try again",
  "stickerPacks.page.error.retrying": "Trying again…",
  "stickerPacks.publish.mode.legendShort": "{count} already in pack",
  "stickerPacks.publish.failures.show": "Show what failed",
  "stickerPacks.publish.failures.hide": "Hide what failed",
  "stickerPacks.publish.running.addToPack":
    "Adding {current} of {total} to {pack}",
  "stickerPacks.publish.running.updateInPack":
    "Updating {current} of {total} in {pack}",
  "stickerPacks.publish.goToPack": "Go to {pack}",
  "stickerPacks.controls.templateDefaults": "Template defaults",
  "stickerPacks.header.menu.runLocked":
    "Wait for the stickers to finish saving before you archive or delete this pack.",
  "stickerPacks.flags.keyboardHint":
    "Use the arrow keys to move between flags. Press Space to add a flag or leave it out, and Enter to preview it without changing what you publish.",
  "stickerPacks.rail.stickerCount_one": "{count} sticker",
  "stickerPacks.rail.stickerCount_other": "{count} stickers",
  "stickerPacks.rail.emptyDescription": "No packs yet.",
  "stickerPacks.newPack.title": "New pack",
  "stickerPacks.newPack.sub":
    "It starts as a draft. Members see it only once you publish it.",
  "stickerPacks.newPack.namePlaceholder": "e.g. Pride flags",
  "stickerPacks.newPack.nameRequired": "Give the pack a name",
  "stickerPacks.newPack.slugAuto": "From the English name",
  "stickerPacks.newPack.slugHint":
    "Lowercase words joined by hyphens. Used in links.",
  "stickerPacks.newPack.slugInvalid":
    "Use lowercase letters and numbers joined by single hyphens, 2 to 64 characters",
  "stickerPacks.newPack.slugTaken": "That slug is already used by another pack",
  "stickerPacks.newPack.slugRequired": "Type a slug for this pack",
  "stickerPacks.newPack.submit": "Create pack",
  "stickerPacks.newPack.creating": "Creating…",
  "stickerPacks.newPack.namePt": "Portuguese name",
  "stickerPacks.newPack.namePtHelper":
    "Optional. If you leave it empty, people reading in Portuguese see the English name.",
  "stickerPacks.newPack.nameEn": "English name",
  "stickerPacks.header.stickerCount_one": "{count} sticker",
  "stickerPacks.header.stickerCount_other": "{count} stickers",
  "stickerPacks.header.explainer.draft":
    "Members can't see this pack yet. Publish it when it's ready.",
  "stickerPacks.header.explainer.published":
    "Live. Every member can send these stickers.",
  "stickerPacks.header.explainer.archived":
    "Withdrawn. Members can no longer pick it; sent stickers stay in chats.",
  "stickerPacks.header.renameLabel": "Rename {name}",
  "stickerPacks.header.nameInputLabel": "Pack name",
  "stickerPacks.header.renameHint": "Enter to save, Esc to cancel",
  "stickerPacks.header.namePtValue": "In Portuguese: {namePt}",
  "stickerPacks.header.namePtEmpty": "Add a Portuguese name",
  "stickerPacks.header.namePtLabel": "Portuguese pack name",
  "stickerPacks.header.namePtHint":
    "Enter to save, Esc to cancel. Leave it empty to use the English name.",
  "stickerPacks.header.action.publish": "Publish pack",
  "stickerPacks.header.action.unpublish": "Unpublish",
  "stickerPacks.header.action.restore": "Restore as draft",
  "stickerPacks.header.publishConfirm.title": "Publish {name}?",
  "stickerPacks.header.publishConfirm.body_one":
    "Its sticker shows up in every member's sticker picker straight away.",
  "stickerPacks.header.publishConfirm.body_other":
    "All {count} stickers show up in every member's sticker picker straight away.",
  "stickerPacks.header.unpublishConfirm.title": "Unpublish {name}?",
  "stickerPacks.header.unpublishConfirm.body":
    "It leaves every member's sticker picker and goes back to draft. Stickers already sent stay in chats, and you can publish it again at any time.",
  "stickerPacks.header.restoreConfirm.title": "Restore {name} as a draft?",
  "stickerPacks.header.restoreConfirm.body":
    "It stays hidden from members until you publish it again. In the meantime you can add, edit and reorder its stickers.",
  "stickerPacks.header.menu.triggerLabel": "More actions for {name}",
  "stickerPacks.header.menu.archive": "Archive pack",
  "stickerPacks.header.menu.delete": "Delete pack",
  "stickerPacks.header.archiveConfirm.title": "Archive {name}?",
  "stickerPacks.header.archiveConfirm.body":
    "Members won't be able to pick it. Stickers already sent stay in chats, and you can restore it as a draft later.",
  "stickerPacks.header.deleteConfirm.title": "Delete {name}?",
  "stickerPacks.header.deleteConfirm.body_one":
    "The pack and its {count} sticker are deleted for good. This can't be undone.",
  "stickerPacks.header.deleteConfirm.body_other":
    "The pack and its {count} stickers are deleted for good. This can't be undone.",
  "stickerPacks.header.deleteConfirm.bodyEmpty":
    "The pack is deleted for good. This can't be undone.",
  "stickerPacks.header.namePtEditSuffix": "Edit",
  "stickerPacks.contents.hint":
    "Drag to reorder. Members see stickers in this order.",
  "stickerPacks.contents.savingOrder": "Saving the new order…",
  "stickerPacks.contents.addCta": "Add stickers",
  "stickerPacks.contents.noCover":
    "This pack has no cover yet. Pick one from a sticker's menu.",
  "stickerPacks.contents.listLabel": "Stickers in {name}",
  "stickerPacks.contents.coverBadge": "Cover",
  "stickerPacks.contents.moved":
    "Moved {label} to position {position} of {total}",
  "stickerPacks.contents.emptyTitle": "No stickers in this pack yet",
  "stickerPacks.contents.emptyBody":
    "Generate them from the template in the Add stickers tab.",
  "stickerPacks.contents.menu.trigger": "Actions for {label}",
  "stickerPacks.contents.menu.setCover": "Set as cover",
  "stickerPacks.contents.menu.edit": "Edit name and keywords",
  "stickerPacks.contents.menu.moveEarlier": "Move earlier",
  "stickerPacks.contents.menu.moveLater": "Move later",
  "stickerPacks.contents.menu.remove": "Remove",
  "stickerPacks.contents.remove.title": "Remove {label}?",
  "stickerPacks.contents.remove.body":
    "Members who already sent it keep it in their chats.",
  "stickerPacks.contents.remove.coverNote":
    "It is this pack's cover, so the pack has no cover until you pick another one.",
  "stickerPacks.contents.remove.confirm": "Remove",
  "stickerPacks.editSticker.title": "Edit sticker",
  "stickerPacks.editSticker.label": "Name",
  "stickerPacks.editSticker.labelEn": "English name",
  "stickerPacks.editSticker.labelPt": "Portuguese name",
  "stickerPacks.editSticker.labelPtHelper":
    "Optional. If you leave it empty, people reading in Portuguese see the English name.",
  "stickerPacks.editSticker.keywords.en": "English keywords",
  "stickerPacks.editSticker.keywords.pt": "Portuguese keywords",
  "stickerPacks.editSticker.keywordsHelper":
    "Separate them with commas. Search matches these words. Up to 24, each up to 40 characters.",
  "stickerPacks.editSticker.errors.labelRequired": "Give the sticker a name",
  "stickerPacks.editSticker.errors.labelTooLong":
    "Keep the name to 80 characters or fewer",
  "stickerPacks.editSticker.errors.keywordTooLong":
    "Shorten these to 40 characters or fewer: {keywords}",
  "stickerPacks.editSticker.errors.tooManyKeywords":
    "Keep it to 24 keywords. This list has {total}.",
  "stickerPacks.editSticker.save": "Save changes",
  "stickerPacks.editSticker.saving": "Saving…",
  "stickerPacks.controls.heading": "Style",
  "stickerPacks.controls.templateName": "Uno reverse",
  "stickerPacks.controls.templateDescription":
    "Reverse-card sticker in each flag's colours",
  "stickerPacks.controls.usePackStyle": "Use this pack's style",
  "stickerPacks.controls.packStyleApplied": "Matches this pack's style",
  "stickerPacks.controls.sectionCard": "Card",
  "stickerPacks.controls.sectionOval": "Oval",
  "stickerPacks.controls.sectionArrows": "Arrows",
  "stickerPacks.controls.borderWidth": "Border width",
  "stickerPacks.controls.ovalAngle": "Oval angle",
  "stickerPacks.controls.ovalLine": "Oval line",
  "stickerPacks.controls.arrowSize": "Arrow size",
  "stickerPacks.controls.resetField": "Reset {field}",
  "stickerPacks.controls.exactValue": "{field}, exact value",
  "stickerPacks.color.hexLabel": "{field}, hex code",
  "stickerPacks.color.hexInvalid": "Use a hex code like #f6f2e8 or #fff.",
  "stickerPacks.color.presetsLabel": "Preset colours",
  "stickerPacks.color.preset.cream": "Cream",
  "stickerPacks.color.preset.white": "White",
  "stickerPacks.color.preset.ink": "Ink",
  "stickerPacks.color.preset.coral": "Coral",
  "stickerPacks.color.fadesLight_one":
    "This colour fades into the light stripes of {flags}. The oval may be hard to see.",
  "stickerPacks.color.fadesLight_other":
    "This colour fades into the light stripes of {flags}. The oval may be hard to see.",
  "stickerPacks.color.fadesDark_one":
    "This colour fades into the dark stripes of {flags}. The oval may be hard to see.",
  "stickerPacks.color.fadesDark_other":
    "This colour fades into the dark stripes of {flags}. The oval may be hard to see.",
  "stickerPacks.color.fadesMid_one":
    "This colour is too close to some stripes of {flags}. The oval may be hard to see.",
  "stickerPacks.color.fadesMid_other":
    "This colour is too close to some stripes of {flags}. The oval may be hard to see.",
  "stickerPacks.color.moreFlags_one": "{count} more",
  "stickerPacks.color.moreFlags_other": "{count} more",
  "stickerPacks.flags.heading": "Flags",
  "stickerPacks.flags.selectedCount_one": "{count} of {total} selected",
  "stickerPacks.flags.selectedCount_other": "{count} of {total} selected",
  "stickerPacks.flags.selectMissing": "Select missing only",
  "stickerPacks.flags.hint":
    "Every flag starts in this run. Select one to leave it out or add it back, and the preview shows the last one you selected.",
  "stickerPacks.flags.badge.new": "New",
  "stickerPacks.flags.badge.inPack": "In pack",
  "stickerPacks.flags.badge.willReplace": "Will replace",
  "stickerPacks.flags.run.queued": "{flag}: waiting",
  "stickerPacks.flags.run.running": "{flag}: adding",
  "stickerPacks.flags.run.done": "{flag}: added",
  "stickerPacks.flags.run.failed": "{flag}: failed",
  "stickerPacks.flags.run.cancelled": "{flag}: cancelled",
  "stickerPacks.preview.heading": "Preview",
  "stickerPacks.preview.noFlagTitle": "No flag picked",
  "stickerPacks.preview.pickFlag": "Pick a flag to preview it",
  "stickerPacks.preview.backdropLabel": "Preview background",
  "stickerPacks.preview.backdrop.light": "Light",
  "stickerPacks.preview.backdrop.dark": "Dark",
  "stickerPacks.preview.backdrop.checker": "Transparent",
  "stickerPacks.preview.inChat": "In a chat",
  "stickerPacks.preview.chatBubble": "You're the most dramatic person I know",
  "stickerPacks.preview.download": "Download PNG",
  "stickerPacks.preview.downloadError": "Couldn't make the PNG. Try again",
  "stickerPacks.publish.regionLabel": "Add to pack",
  "stickerPacks.publish.cta.idle": "Add stickers",
  "stickerPacks.publish.cta.add_one": "Add {count} sticker to {pack}",
  "stickerPacks.publish.cta.add_other": "Add {count} stickers to {pack}",
  "stickerPacks.publish.cta.update_one": "Update {count} sticker in {pack}",
  "stickerPacks.publish.cta.update_other": "Update {count} stickers in {pack}",
  "stickerPacks.publish.cta.addAndUpdate":
    "Add {added} and update {replaced} in {pack}",
  "stickerPacks.publish.statusHelper.draft":
    "Members see these after you publish the pack.",
  "stickerPacks.publish.statusHelper.published":
    "These go live for members straight away.",
  "stickerPacks.publish.statusHelper.archived":
    "This pack is archived. Members won't see these.",
  "stickerPacks.publish.blocked.noPack":
    "Pick a pack or create one to add stickers to.",
  "stickerPacks.publish.blocked.noFlags": "Pick at least one flag to add.",
  "stickerPacks.publish.blocked.allSkipped":
    "Every selected flag is already in this pack. Choose Replace existing to update their art.",
  "stickerPacks.publish.mode.legend_one":
    "{count} selected flag is already in this pack",
  "stickerPacks.publish.mode.legend_other":
    "{count} selected flags are already in this pack",
  "stickerPacks.publish.mode.addMissing": "Add missing only",
  "stickerPacks.publish.mode.replace": "Replace existing",
  "stickerPacks.publish.running.add": "Adding {current} of {total}",
  "stickerPacks.publish.running.update": "Updating {current} of {total}",
  "stickerPacks.publish.progressLabel": "Progress",
  "stickerPacks.publish.cancel": "Cancel",
  "stickerPacks.publish.stopping": "Stopping after this one",
  "stickerPacks.publish.stopped": "Stopped after {done} of {total}.",
  "stickerPacks.publish.result.added_one": "{count} sticker added to {pack}",
  "stickerPacks.publish.result.added_other": "{count} stickers added to {pack}",
  "stickerPacks.publish.result.updated_one":
    "{count} sticker updated in {pack}",
  "stickerPacks.publish.result.updated_other":
    "{count} stickers updated in {pack}",
  "stickerPacks.publish.result.addedAndUpdated":
    "Added {added} and updated {replaced} in {pack}",
  "stickerPacks.publish.result.none": "Nothing changed in {pack}",
  "stickerPacks.publish.failures.title_one": "{count} sticker didn't make it",
  "stickerPacks.publish.failures.title_other":
    "{count} stickers didn't make it",
  "stickerPacks.publish.failureReason.conflict": "Already in this pack",
  "stickerPacks.publish.failureReason.rate-limit":
    "Too many uploads at once. Wait a minute, then retry",
  "stickerPacks.publish.failureReason.upload": "The image didn't upload",
  "stickerPacks.publish.failureReason.unknown": "Something went wrong",
  "stickerPacks.publish.viewPack": "View pack",
  "stickerPacks.publish.publishPackNow": "Publish pack now",
  "stickerPacks.publish.retryFailed": "Retry {count} failed",
  "stickerPacks.publish.dismiss": "Dismiss",
  "stickerPacks.review.title": "Review before adding",
  "stickerPacks.review.adding_one": "Adding {count} new",
  "stickerPacks.review.adding_other": "Adding {count} new",
  "stickerPacks.review.replacing_one": "Replacing {count}",
  "stickerPacks.review.replacing_other": "Replacing {count}",
  "stickerPacks.review.replacingNote_one": "(its order, name and cover stay)",
  "stickerPacks.review.replacingNote_other":
    "(their order, names and cover stay)",
  "stickerPacks.review.skipping_one": "Skipping {count} already in the pack",
  "stickerPacks.review.skipping_other": "Skipping {count} already in the pack",
  "stickerPacks.review.target": "Into {pack} ({status})",
  "stickerPacks.review.replacingTag": "(replacing)",
  "stickerPacks.page.title": "Sticker packs",
  "stickerPacks.page.empty.title": "Start your first pack",
  "stickerPacks.page.empty.body":
    "A pack holds stickers members can send in chat. It starts as a draft, so members see it only once you publish it.",
  "stickerPacks.page.demo.title": "The builder works in live mode",
  "stickerPacks.page.demo.body":
    "Packs and stickers are saved through the live API, so switch to live mode to build them.",
  "stickerPacks.page.error.title": "The packs didn't load",
  "stickerPacks.page.error.body": "Check your connection, then try again.",
  "stickerPacks.tabs.label": "Work on {name}",
  "stickerPacks.tabs.add": "Add stickers",
  "stickerPacks.tabs.contents": "In this pack",
  "stickerPacks.toast.renamed": "Renamed to {name}",
  "stickerPacks.toast.renamedPt": "Portuguese name saved",
  "stickerPacks.toast.status.published": "{name} is live",
  "stickerPacks.toast.status.draft": "{name} is a draft again",
  "stickerPacks.toast.status.archived": "{name} is archived",
  "stickerPacks.toast.packDeleted": "{name} deleted",
  "stickerPacks.toast.stickerRemoved": "{label} removed",
  "stickerPacks.toast.stickerUpdated": "{label} saved",
  "stickerPacks.errors.rename": "Couldn't rename the pack",
  "stickerPacks.errors.deletePack": "Couldn't delete the pack",
  "stickerPacks.errors.reorder": "Couldn't save the new order",
  "stickerPacks.errors.updateSticker": "Couldn't save the sticker",
  "stickerPacks.grid.itemsLegend": "Stickers",
  "stickerPacks.grid.hint":
    "Every sticker starts in this run. Click a sticker to preview it, and use the tick in its corner to leave it out or add it back.",
  "stickerPacks.grid.keyboardHint":
    "Use the arrow keys to move between stickers. Press Space to add a sticker or leave it out, and Enter to preview it without changing what you publish.",
  "stickerPacks.preview.noItemTitle": "No item picked",
  "stickerPacks.preview.pickItem": "Pick an item to preview it",
  "stickerPacks.controls.itemsLegend": "Stickers",
  "stickerPacks.publish.blocked.noItems": "Pick at least one sticker to add.",
  "stickerPacks.publish.blocked.allSkippedItems":
    "Every selected sticker is already in this pack. Choose Replace to update their art.",
  "stickerPacks.publish.mode.itemsLegend_one":
    "{count} selected sticker is already in this pack",
  "stickerPacks.publish.mode.itemsLegend_other":
    "{count} selected stickers are already in this pack",
  "stickerPacks.templates.label": "Template",
  "stickerPacks.templates.lockedNote":
    "Template: {template}. A pack keeps one template.",
  "stickerPacks.templates.unoReverse.name": "Uno reverse",
  "stickerPacks.templates.unoReverse.description":
    "Reverse-card sticker in each flag's colours",
  "stickerPacks.templates.blip.name": "Blip",
  "stickerPacks.templates.blip.description":
    "Our little mascot in {count} moods",
  "stickerPacks.templates.tea.name": "Tea, shade and sparkle",
  "stickerPacks.templates.tea.description":
    "Queer slang stickers: spill the tea, mother, ate",
  "stickerPacks.blip.sectionBody": "Body",
  "stickerPacks.blip.fillLegend": "Fill",
  "stickerPacks.blip.fillColor": "Colour",
  "stickerPacks.blip.fillFlag": "Flag",
  "stickerPacks.blip.bodyColor": "Colour",
  "stickerPacks.blip.bodyFlag": "Flag",
  "stickerPacks.blip.faceContrastWarning":
    "Blip's face is hard to read on this colour. Pick a lighter body.",
  "stickerPacks.tea.sectionAccent": "Accent",
  "stickerPacks.tea.accentColor": "Accent colour",
  "stickerPacks.dieCut.section": "Finish",
  "stickerPacks.dieCut.label": "White die-cut border",
  "stickerPacks.publish.mode.addMissingShort": "Add missing",
  "stickerPacks.publish.mode.replaceShort": "Replace",
  "stickerPacks.publish.blocked.showReason": "Why can't I add stickers?",

  // ── Admin-authored directory listings (`/admin/listings/new`) ─────────────
  // Staff writing up a place that has not joined QueerPulse yet. The listing
  // belongs to nobody until a member accepts it, so every string here keeps
  // the owner's side of the page empty until that person has agreed.
  "listingNew.title": "Add a listing",
  "listingNew.eyebrow": "Directory",
  "listingNew.sub":
    "Write up a place that has not joined yet. You can hand it over to its owner whenever you like.",
  // A plain breadcrumb label of its own, because `adminListings.title`
  // carries `<em>` markup for the queue's own heading.
  "listingNew.queueBreadcrumb": "Listings",
  "listingNew.fields.aria": "Admin settings for this listing",
  "listingNew.publishState.label": "How should this go out?",
  "listingNew.publishState.hint":
    "You can change this later from the listings queue.",
  "listingNew.publishState.review.title": "Send to review",
  "listingNew.publishState.review.desc":
    "It joins the moderation queue and waits for a second pair of eyes.",
  "listingNew.publishState.live.title": "Publish now",
  "listingNew.publishState.live.desc":
    "It shows in the directory as soon as you send.",
  "listingNew.owner.label": "Offer it to someone",
  "listingNew.owner.hint":
    "Optional. They hold the listing in their own name once they accept, and everything about the owner is theirs to fill in.",
  "listingNew.owner.memberLabel": "Member",
  "listingNew.owner.memberSearchAria":
    "Search members to offer this listing to",
  "listingNew.owner.slugHelper":
    "Leave this empty to keep the listing with the team for now.",
  "listingNew.owner.noteLabel": "Message to them",
  "listingNew.owner.noteHelper":
    "They read this with the offer. An unsolicited offer lands better with some context.",
  // SuccessPanel title; the listing name is passed as its coral `em`, so the
  // heading reads "Added <name>".
  "listingNew.success.title": "Added",
  "listingNew.success.body":
    "Reference {ref}. Nothing about the owner has been filled in, because that belongs to whoever takes it on.",
  "listingNew.success.step.review": "It is waiting in the moderation queue.",
  "listingNew.success.step.live": "It is showing in the directory now.",
  "listingNew.success.closeCta": "Back to the listings queue",
  "listingNew.success.viewLiveCta": "See the live listing",
  "listingNew.success.addAnotherCta": "Add another listing",
  "listingNew.fromDraft.noteAria": "About this draft",
  "listingNew.fromDraft.title": "Finishing {name}'s draft",
  "listingNew.fromDraft.titleNoOwner":
    "Finishing a draft from a member who has since left",
  "listingNew.fromDraft.body":
    "Their business details are filled in. Their own answers are not copied: who they are, their consents, the pledge and any queer-owned claim. This goes out as a team listing offered back to them, and they add those when they accept. Their draft stays as they left it, so if they finish it too, both show up in the queue.",
  "listingNew.fromDraft.offerNote":
    "Hi {firstName}! We picked up where you left off with {name} and finished the listing. Have a look, and if it's right, accept it to add your own details. It stays with the team until you do.",
  "listingNew.fromDraft.offerNoteUntitled":
    "Hi {firstName}! We picked up the listing you started and finished it. Have a look, and if it's right, accept it to add your own details. It stays with the team until you do.",
  "listingNew.fromDraft.gone.title": "This draft is no longer here",
  "listingNew.fromDraft.gone.body":
    "The member may have sent it or thrown it away since the list loaded.",
  "listingNew.fromDraft.gone.backCta": "Back to the listings queue",
  "listingNew.fromDraft.loadError.title": "This draft didn't load",
  "listingNew.fromDraft.loadError.body": "Check your connection and try again.",

  // ── Admin edit of a platform-held listing (`/admin/listings/:ref/edit`) ───
  // A listing nobody owns yet, edited by staff on QueerPulse's behalf. If the
  // listing has since gained an owner, the page shows the hasOwner state
  // instead of the wizard.
  "listingEdit.title": "Edit listing",
  "listingEdit.eyebrow": "Directory",
  "listingEdit.sub":
    "QueerPulse holds this listing until someone takes it over. On a live listing, your changes show in the directory as soon as you save.",
  "listingEdit.queueBreadcrumb": "Listings",
  "listingEdit.submitCta": "Save changes",
  "listingEdit.publishCta": "Save and publish",
  "listingEdit.editingRef": "Editing {ref}",
  "listingEdit.previewFoot.live":
    "Your changes go live in the directory as soon as you save.",
  "listingEdit.previewFoot.unpublished":
    "This listing isn't published yet. Saving keeps it in the review queue.",
  "listingEdit.hasOwner.title": "This listing has an owner now",
  "listingEdit.hasOwner.body":
    "Someone has taken this listing over, so they edit it from now on. To change something, suggest an edit from its page in the directory.",
  "listingEdit.hasOwner.backCta": "Back to listings",
  "listingEdit.hasOwner.viewCta": "View in the directory",
  "listingEdit.loadError.title": "This listing didn't load",
  "listingEdit.loadError.body": "Check your connection and try again.",
  "listingEdit.notFound.title": "We couldn't find this listing",
  "listingEdit.notFound.body":
    "It may have been removed. Head back to the queue to pick another.",
  "listingEdit.success.title": "Saved",
  "listingEdit.success.body": "Your changes to {ref} are saved.",
  "listingEdit.success.publishedTitle": "Saved and published",
  "listingEdit.success.publishedBody":
    "Your changes to {ref} are live in the directory.",
  "listingEdit.success.closeCta": "Back to the listings queue",

  // ── Admin member picker (AdminMemberPickerField) ─────────────────────────
  // The member search an admin form uses to pick one person by name; a pick
  // collapses into a clearable chip.
  "memberPicker.placeholder": "Search members by name",
  "memberPicker.emptyHint": "Type at least two letters of their name.",
  "memberPicker.searchError":
    "Member search isn't answering right now. Try again in a moment.",
  "memberPicker.clearAria": "Remove {name} and pick someone else",

  // ── Delegation panel on a listing ─────────────────────────────────────────
  // Who runs a listing the house authored: its owner, any ownership offer
  // waiting on an answer, and the co-managers seated to help. A listing
  // carries one open offer at a time and five co-manager seats.
  "listingDelegation.heading": "Delegation",
  "listingDelegation.intro":
    "Who runs this page: the owner, any open ownership offer, and the people seated to help.",
  "listingDelegation.unknownMember": "A member who has since left",
  "listingDelegation.unknownMemberError":
    "That member isn't active anymore, so this can't go to them. Pick someone else.",
  "listingDelegation.loadError.title": "The delegation panel could not load",
  "listingDelegation.loadError.body":
    "The open offer and the co-manager roster are both missing from this view. Try again.",

  "listingDelegation.owner.heading": "Owner",
  "listingDelegation.owner.ownedBy": "Owned by @{slug}",
  "listingDelegation.owner.heldByPlatform": "Held by QueerPulse.",
  "listingDelegation.owner.heldByPlatformDetail":
    "Nobody owns this listing yet. You can edit it, offer it to a member or approve a claim.",
  "listingDelegation.owner.suggestedBy": "Suggested by @{slug}",

  "listingDelegation.offer.heading": "Ownership offer",
  "listingDelegation.offer.ownedNotice":
    "This listing already has an owner, so there is nothing to offer. An ownership offer goes to a listing the house still holds.",
  "listingDelegation.offer.none": "No ownership offer is open on this listing.",
  "listingDelegation.offer.offeredTo": "Offered to {name}",
  "listingDelegation.offer.sentOn": "Sent {date}",
  "listingDelegation.offer.awaitingReply": "waiting on their answer",
  "listingDelegation.offer.oneAtATime":
    "A listing carries one open offer at a time. To offer it to somebody else, withdraw this one first.",
  "listingDelegation.offer.memberLabel": "Offer it to",
  "listingDelegation.offer.memberSearchAria":
    "Search members to offer this listing to",
  "listingDelegation.offer.noteLabel": "A note for them (optional)",
  "listingDelegation.offer.notePlaceholder":
    "Say why you are offering them this listing.",
  "listingDelegation.offer.sendCta": "Offer ownership",
  "listingDelegation.offer.sendingCta": "Sending…",
  "listingDelegation.offer.revokeCta": "Withdraw offer",
  "listingDelegation.offer.revokeConfirmTitle": "Withdraw the offer to {name}?",
  "listingDelegation.offer.revokeConfirmBody":
    "They lose the offer straight away. Once it is withdrawn you can offer this listing to somebody else.",
  "listingDelegation.offer.revokeConfirmCta": "Withdraw",
  "listingDelegation.offer.sentToast": "Ownership offered to {name}.",
  "listingDelegation.offer.revokedToast": "The ownership offer is withdrawn.",
  "listingDelegation.offer.conflictError":
    "This listing already has an owner, or it already carries an open offer. Reopen the drawer to see where it stands.",
  "listingDelegation.offer.failedError":
    "The offer did not go through. Try again in a moment.",
  "listingDelegation.offer.revokeFailedError":
    "The offer is still open. Try withdrawing it again in a moment.",
  "listingDelegation.offer.revokeGoneError":
    "That offer is no longer open. Somebody answered it, or another admin withdrew it. The panel has refreshed.",

  "listingDelegation.roster.heading": "Co-managers",
  "listingDelegation.roster.seats": "{used} of {cap} seats taken",
  "listingDelegation.roster.empty": "Nobody holds a seat on this listing yet.",
  "listingDelegation.roster.status.invited": "Invited",
  "listingDelegation.roster.status.active": "Managing",
  "listingDelegation.roster.status.declined": "Declined",
  "listingDelegation.roster.status.revoked": "Seat taken back",
  "listingDelegation.roster.status.left": "Stepped down",
  "listingDelegation.roster.invitedOn": "Invited {date}, still deciding",
  "listingDelegation.roster.acceptedOn": "Editing since {date}",
  "listingDelegation.roster.endedOn": "Seat ended {date}",
  "listingDelegation.roster.staffSeatNotice":
    "While this listing has no owner, a seat you open now stays through the handover to a new owner.",
  "listingDelegation.roster.ownerSeatNotice":
    "A seat opened on a listing that already has an owner leaves when that owner does.",
  "listingDelegation.roster.seatsFullNotice":
    "Every seat on this listing is taken. Free one up before inviting anybody else.",
  "listingDelegation.roster.inviteMemberLabel": "Invite a co-manager",
  "listingDelegation.roster.inviteSearchAria":
    "Search members to invite as a co-manager",
  "listingDelegation.roster.inviteCta": "Send invitation",
  "listingDelegation.roster.invitingCta": "Sending…",
  "listingDelegation.roster.invitedToast": "Invitation sent to {name}.",
  "listingDelegation.roster.removeCta": "Remove seat",
  "listingDelegation.roster.cancelInviteCta": "Cancel invitation",
  "listingDelegation.roster.removeConfirmTitle":
    "Take {name} off this listing?",
  "listingDelegation.roster.removeConfirmBody":
    "They lose the editor straight away. You can invite them again whenever you like.",
  "listingDelegation.roster.cancelInviteConfirmBody":
    "The invitation disappears from their inbox. You can send another one whenever you like.",
  "listingDelegation.roster.removeConfirmCta": "Remove",
  "listingDelegation.roster.removedToast": "The seat is free again.",
  "listingDelegation.roster.removeFailedError":
    "The seat is still there. Try again in a moment.",
  "listingDelegation.roster.conflictError":
    "That member already holds or has been offered a seat, or this listing is at its cap of five.",
  "listingDelegation.roster.failedError":
    "The invitation did not go through. Try again in a moment.",
  "emailTemplates.navLabel": "Email templates",
  "emailTemplates.eyebrow": "Email library",
  "emailTemplates.title": "Email <em>templates</em>",
  "emailTemplates.sub":
    "The emails staff send by hand, written once and kept in one place. Copy one, paste it into your own mailbox, and send it yourself.",
  "emailTemplates.newCta": "New template",
  "emailTemplates.loadError":
    "Email templates did not load. Try again in a moment.",
  "emailTemplates.empty": "No email templates yet. Write the first one.",
  "emailTemplates.purpose.invite_approved": "Invite approved",
  "emailTemplates.purpose.general": "General",
  "emailTemplates.list.editCta": "Edit",
  "emailTemplates.list.previewCta": "Preview",
  "emailTemplates.list.deleteLabel": "Delete {label}",
  "emailTemplates.list.activeToggleLabel": "Active: {label}",
  "emailTemplates.list.inactive": "Inactive",
  "emailTemplates.delete.title": "Delete {label}?",
  "emailTemplates.delete.body":
    "This removes the template for everyone. Emails already sent stay as they are, in the mailboxes they were sent from.",
  "emailTemplates.delete.confirmCta": "Delete template",
  "emailTemplates.toast.removed": "Removed {label}.",
  "emailTemplates.toast.saved": "Template saved.",
  "emailTemplates.removeError": "The template was not deleted.",
  "emailTemplates.saveError": "The template was not saved.",
  "emailTemplates.editor.newTitle": "New email <em>template</em>",
  "emailTemplates.editor.editTitle": "Edit <em>{label}</em>",
  "emailTemplates.editor.backToList": "All email templates",
  "emailTemplates.editor.allTemplates": "all email templates",
  "emailTemplates.editor.backCta": "Back",
  "emailTemplates.editor.labelField": "Name (staff only)",
  "emailTemplates.editor.purposeField": "Used for",
  "emailTemplates.editor.purposeHint":
    "Sets which placeholders the template can use.",
  "emailTemplates.editor.activeField": "Active",
  "emailTemplates.editor.subjectField": "Subject",
  "emailTemplates.editor.languageLabel": "Language",
  "emailTemplates.editor.localeTab.en": "English",
  "emailTemplates.editor.localeTab.pt": "Portuguese",
  "emailTemplates.editor.localeUnsaved": "{language} (unsaved)",
  "emailTemplates.editor.ptMissing":
    "This template has no Portuguese version yet.",
  "emailTemplates.editor.ptStart": "Start from the English version",
  "emailTemplates.editor.ptRemove": "Remove the Portuguese version",
  "emailTemplates.editor.saveCta": "Save template",
  "emailTemplates.editor.saving": "Saving…",
  "emailTemplates.editor.saveAsNewCta": "Save as new template",
  "emailTemplates.editor.deletedWhileEditing":
    "This template was deleted while you were editing it.",
  "emailTemplates.editor.labelTaken": "Another template already has this name.",
  "emailTemplates.editor.validationTitle": "Fix these before saving:",
  "emailTemplates.editor.leaveConfirm":
    "Leave without saving? Your changes to this template will be lost.",
  "emailTemplates.editor.notFound": "This template does not exist anymore.",
  "emailTemplates.editor.unknownPlaceholder":
    "{token} is not a placeholder this template can use.",
  "emailTemplates.placeholders.label": "Insert a placeholder",
  "emailTemplates.placeholders.shortLabel": "Insert",
  "emailTemplates.placeholders.none": "This purpose has no placeholders.",
  "emailTemplates.placeholders.name": "First name",
  "emailTemplates.placeholders.inviteLink": "Invite link",
  "emailTemplates.placeholders.expiresOn": "Link expiry date",
  "emailTemplates.mode.viewHtml": "View HTML",
  "emailTemplates.mode.viewHtmlTitle": "Generated HTML",
  "emailTemplates.mode.copyHtml": "Copy HTML",
  "emailTemplates.mode.editAsHtml": "Edit as HTML",
  "emailTemplates.mode.editAsHtmlTitle": "Switch this language to HTML?",
  "emailTemplates.mode.editAsHtmlBody":
    "The code editor takes over for this language. Your blocks are kept, and Back to blocks returns to them, discarding the HTML.",
  "emailTemplates.mode.backToBlocks": "Back to blocks",
  "emailTemplates.mode.backToBlocksTitle": "Discard the custom HTML?",
  "emailTemplates.mode.backToBlocksBody":
    "This language goes back to its blocks as they were before you switched. The HTML you wrote is lost.",
  "emailTemplates.mode.backToBlocksConfirm": "Discard HTML",
  "emailTemplates.mode.htmlField": "Email HTML",
  "emailTemplates.mode.copySample": "Copy with sample values",
  "emailTemplates.mode.copySampleShort": "Copy",
  "emailTemplates.blocks.addLabel": "Add a block",
  "emailTemplates.blocks.empty":
    "No blocks yet. Add a heading or a paragraph to start.",
  "emailTemplates.blocks.type.heading": "Heading",
  "emailTemplates.blocks.type.paragraph": "Paragraph",
  "emailTemplates.blocks.type.button": "Button",
  "emailTemplates.blocks.type.image": "Image",
  "emailTemplates.blocks.type.divider": "Divider",
  "emailTemplates.blocks.type.spacer": "Spacer",
  "emailTemplates.blocks.type.html": "HTML",
  "emailTemplates.blocks.moveUp": "Move {type} up",
  "emailTemplates.blocks.moveDown": "Move {type} down",
  "emailTemplates.blocks.remove": "Remove {type}",
  "emailTemplates.blocks.field.text": "Text",
  "emailTemplates.blocks.field.level": "Size",
  "emailTemplates.blocks.field.levelLarge": "Large",
  "emailTemplates.blocks.field.levelSmall": "Small",
  "emailTemplates.blocks.field.paragraphHint":
    "**bold**, *italic* and [link](https://…) work here.",
  "emailTemplates.blocks.field.buttonLabel": "Button text",
  "emailTemplates.blocks.field.buttonHref": "Button link",
  "emailTemplates.blocks.field.buttonHrefHint":
    "An https:// address, or a placeholder from the chips above.",
  "emailTemplates.blocks.field.imageSrc": "Image address (https://)",
  "emailTemplates.blocks.field.imageAlt": "Description for screen readers",
  "emailTemplates.blocks.field.imageWidth": "Width in pixels, up to 600",
  "emailTemplates.blocks.field.spacerSize": "Space",
  "emailTemplates.blocks.field.sizeSm": "Small",
  "emailTemplates.blocks.field.sizeMd": "Medium",
  "emailTemplates.blocks.field.sizeLg": "Large",
  "emailTemplates.blocks.field.html": "HTML",
  "emailTemplates.preview.label": "Preview",
  "emailTemplates.preview.frameTitle": "Email preview with sample values",
  "emailTemplates.preview.desktop": "Desktop",
  "emailTemplates.preview.mobile": "Mobile",
  "emailTemplates.preview.sampleNote": "Placeholders show sample values.",
  "emailTemplates.preview.inbox": "Inbox",
  "emailTemplates.preview.toRecipient": "to {name}",
  "emailTemplates.preview.noSubject": "(no subject)",
  "emailTemplates.editor.preheaderField": "Preview text (optional)",
  "emailTemplates.editor.preheaderHint":
    "The grey line inboxes show after the subject.",
  "emailTemplates.designSwitch.label": "Email design (temporary)",
  "emailTemplates.designSwitch.shortLabel": "Design",
  "emailTemplates.designSwitch.current": "Current",
  "emailTemplates.designSwitch.stage": "Stage",
  "emailTemplates.designSwitch.letter": "Letter",
  "emailTemplates.blocks.type.hero": "Opening",
  "emailTemplates.blocks.type.ticket": "Ticket",
  "emailTemplates.blocks.type.featureList": "Feature list",
  "emailTemplates.blocks.type.signature": "Signature",
  "emailTemplates.blocks.featureRow": "Row {number}",
  "emailTemplates.blocks.featureMoveUp": "Move row {number} up",
  "emailTemplates.blocks.featureMoveDown": "Move row {number} down",
  "emailTemplates.blocks.featureRemove": "Remove row {number}",
  "emailTemplates.blocks.featureAdd": "Add a row",
  "emailTemplates.blocks.featureIcon.communities": "Communities",
  "emailTemplates.blocks.featureIcon.gatherings": "Events",
  "emailTemplates.blocks.featureIcon.directory": "Directory",
  "emailTemplates.blocks.featureIcon.messages": "Messages",
  "emailTemplates.blocks.featureIcon.magazine": "Magazine",
  "emailTemplates.blocks.featureIcon.safety": "Safety",
  "emailTemplates.blocks.field.heroEyebrow":
    "Small line above the headline (optional)",
  "emailTemplates.blocks.field.heroHeadline": "Headline",
  "emailTemplates.blocks.field.headlineHint":
    "Wrap a word in *asterisks* to set it in italics.",
  "emailTemplates.blocks.field.heroText": "Text under the headline (optional)",
  "emailTemplates.blocks.field.ticketLabel": "Small label",
  "emailTemplates.blocks.field.ticketTitle": "Title",
  "emailTemplates.blocks.field.ticketText": "Text (optional)",
  "emailTemplates.blocks.field.featureIcon": "Icon",
  "emailTemplates.blocks.field.featureTitle": "Title",
  "emailTemplates.blocks.field.featureText": "Text",
  "emailTemplates.blocks.field.signatureName": "Name",
  "emailTemplates.blocks.field.signatureRole": "Role (optional)",
  "emailTemplates.blocks.field.signatureNote": "Note (optional)",
  "emailTemplates.blocks.field.signaturePhoto": "Photo address (optional)",
  "emailTemplates.blocks.field.signaturePhotoHint":
    "An https:// address of a square photo. Leave empty to show the QueerPulse mark.",
  "emailTemplates.blocks.field.heroHint":
    "Put it first to open the email with it.",
  "emailTemplates.blocks.field.signatureLetterHint":
    "In the Letter design, a signature with a photo also shows at the top as the sender.",
  "emailTemplates.copy.welcomeCta": "Copy welcome email",
  "emailTemplates.copy.subjectCta": "Copy subject",
  "emailTemplates.copy.previewCta": "Preview email",
  "emailTemplates.copy.previewTitle": "Welcome email for {name}",
  "emailTemplates.copy.previewNote":
    "This is the email you will paste, with {name}'s details filled in.",
  "emailTemplates.copy.copyEmailCta": "Copy email",
  "emailTemplates.copy.languageLabel": "Email language",
  "emailTemplates.copy.templateLabel": "Template",
  "emailTemplates.copy.copiedToast":
    "Welcome email copied. Paste it into an email to {email}.",
  "emailTemplates.copy.copiedPlainToast":
    "Copied as plain text, because this browser could not keep the formatting. Paste it into an email to {email}.",
  "emailTemplates.copy.subjectCopiedToast": "Subject copied.",
  "emailTemplates.copy.htmlCopiedToast": "HTML copied.",
  "emailTemplates.copy.sampleCopiedToast": "Copied with sample values.",
  "emailTemplates.copy.failedToast":
    "Copying did not work in this browser. Try again.",
  // QueerPulse Ambassadors admin page (/admin/ambassadors) and member-drawer line.
  "ambassadors.title": "Ambassadors",
  "ambassadors.header.eyebrow": "Partnerships",
  "ambassadors.header.title": "QueerPulse <em>Ambassadors</em>",
  "ambassadors.header.sub":
    "Members who publicly back QueerPulse. Grant the status, set each person's focus area, and keep the record of who granted or revoked it and why.",
  "ambassadors.tabs.active": "Active",
  "ambassadors.tabs.past": "Past",
  "ambassadors.loadError":
    "We couldn't load the ambassadors. Try again in a moment.",
  "ambassadors.empty.active.title": "No ambassadors yet",
  "ambassadors.empty.active.description":
    "Grant the status to a member with the form on this page.",
  "ambassadors.empty.past.title": "No past ambassadors",
  "ambassadors.empty.past.description":
    "Revoked grants stay here, with who revoked them and why.",
  "ambassadors.row.tagHidden": "Tag hidden",
  "ambassadors.row.since": "Since",
  "ambassadors.row.grantedBy": "Granted by",
  "ambassadors.row.unknownStaff": "Not recorded",
  "ambassadors.row.grantReason": "Why",
  "ambassadors.row.revokedOn": "Revoked",
  "ambassadors.row.revokedBy": "Revoked by",
  "ambassadors.row.revokeReason": "Why it was revoked",
  "ambassadors.row.quotaOverride":
    "Invite quota overridden to {quota} a month, so the ambassador bonus doesn't apply.",
  "ambassadors.row.changeFocus": "Change focus",
  "ambassadors.row.changeFocusAria": "Change focus for {name}",
  "ambassadors.row.focusSaved": "Focus area updated.",
  "ambassadors.row.revoke": "Revoke",
  "ambassadors.row.revokeAria": "Revoke ambassador status for {name}",
  "ambassadors.grant.title": "Grant the status",
  "ambassadors.grant.hint":
    "Ambassadors join the private circle straight away and get 10 extra invites a month.",
  "ambassadors.grant.memberLabel": "Member",
  "ambassadors.grant.memberPlaceholder": "Search by name",
  "ambassadors.grant.memberSearchAria": "Search members to grant the status",
  "ambassadors.grant.clearMemberAria": "Remove {name} and pick someone else",
  "ambassadors.grant.focusLabel": "Focus area",
  "ambassadors.grant.focusPlaceholder": "Choose a focus area",
  "ambassadors.grant.reasonLabel": "Why this member",
  "ambassadors.grant.reasonHint":
    "At least {min} characters. Logged with the grant; only staff see it.",
  "ambassadors.grant.submit": "Grant the status",
  "ambassadors.grant.pending": "Granting…",
  "ambassadors.grant.success": "{name} is now a QueerPulse Ambassador.",
  "ambassadors.revoke.eyebrow": "Revoke ambassador status",
  "ambassadors.revoke.title": "Revoke {name}'s status?",
  "ambassadors.revoke.body":
    "They lose the tag, the extra invites and their seat in the circle, and get a notification. You can grant it again later.",
  "ambassadors.revoke.reasonLabel": "Reason for revoking",
  "ambassadors.revoke.reasonHint":
    "Required, at least {min} characters. Logged with the revoke; only staff see it.",
  "ambassadors.revoke.confirm": "Revoke the status",
  "ambassadors.revoke.pending": "Revoking…",
  "ambassadors.revoke.success": "{name} is no longer an ambassador.",
  "ambassadors.circle.title": "The ambassadors circle",
  "ambassadors.circle.hint":
    "A private community for previews and polls. Ambassadors join when granted and leave when revoked.",
  "ambassadors.circle.memberCount_one": "{count} member",
  "ambassadors.circle.memberCount_other": "{count} members",
  "ambassadors.circle.open": "Open the circle",
  "ambassadors.circle.takeSeat": "Take a staff seat",
  "ambassadors.circle.seatTaken": "You have a staff seat in the circle.",
  "ambassadors.circle.error": "We couldn't load the circle.",
  "ambassadors.errors.generic": "Something went wrong. Try again.",
  "ambassadors.errors.ambassador_already_active":
    "This member is already an ambassador.",
  "ambassadors.errors.ambassador_not_found":
    "This person has no active ambassador status. Refresh the list.",
  "ambassadors.errors.ambassador_member_not_found":
    "We couldn't find that member.",
  "ambassadors.errors.ambassador_self_grant":
    "You can't grant the status to yourself.",
  "ambassadors.errors.ambassador_ineligible_member":
    "This account can't hold the status. It's a system account or it isn't active.",
  "ambassadors.drawer.label": "Ambassador",
  "ambassadors.drawer.since": "Since {since} · {focus}",
  "ambassadors.drawer.none": "No visible tag",
  "ambassadors.drawer.hiddenNote":
    "Hidden tags don't show here. The Ambassadors page has the full record.",
  "ambassadors.drawer.manage": "Manage ambassadors",
  // ── Studio v1 (2026-10-08) ─────────────────────────────────────────────────
  "studioAccess.label": "Studio",
  "studioAccess.grantedBy": "Granted by {staff} on {date}",
  "studioAccess.grantedOn": "Granted on {date}",
  "studioAccess.none": "Not granted",
  "studioAccess.loadFailed": "We couldn't load Studio access",
  "studioAccess.retry": "Check access again",
  "studioAccess.grantCta": "Grant Studio access",
  "studioAccess.revokeCta": "Revoke Studio access",
  "studioAccess.hint":
    "Lets the member listen in Studio, and upload if they run a published musician or DJ persona set to Open to everyone",
  "studioAccess.revokeTitle": "Revoke Studio access?",
  "studioAccess.revokeBody":
    "Their player stops and Studio shows them the coming-soon page again",
  "studioAccess.revokeConfirm": "Revoke Studio access",
  // ── Invite access (2026-10-26) ─────────────────────────────────────────────
  "inviteAccess.label": "Invites",
  "inviteAccess.on": "Can invite new people",
  "inviteAccess.off": "Invites paused",
  "inviteAccess.hint":
    "While paused, this member can't create or resend invites. The rest of their account keeps working",
  "inviteAccess.toggleLabel": "Invites for {name}",
  "inviteAccess.pauseTitle": "Pause invites for {name}?",
  "inviteAccess.pauseBody_one":
    "{name} won't be able to create or resend invites until you turn them back on. Their {count} pending invite stays valid unless you revoke it on the Invites page",
  "inviteAccess.pauseBody_other":
    "{name} won't be able to create or resend invites until you turn them back on. Their {count} pending invites stay valid unless you revoke them on the Invites page",
  "inviteAccess.pauseBodyNoPending":
    "{name} won't be able to create or resend invites until you turn them back on. They have no pending invites right now",
  "inviteAccess.pauseBodyCountUnknown":
    "{name} won't be able to create or resend invites until you turn them back on. Any pending invites stay valid unless you revoke them on the Invites page",
  "inviteAccess.pauseConfirm": "Pause invites",
  "moderation.studioRelease.heading": "Studio release",
  "moderation.studioRelease.subject": "{title} by {artist}",
  "moderation.studioRelease.takeDownCta": "Take down release",
  "moderation.studioRelease.restoreCta": "Restore release",
  "moderation.studioRelease.takeDownTitle": "Take down {title}?",
  "moderation.studioRelease.takeDownBody":
    "It leaves Studio for everyone. The artist sees your reason on their artist page",
  "moderation.studioRelease.takeDownConfirm": "Take down release",
  "moderation.studioRelease.reasonLabel": "Reason the artist will see",
  "moderation.studioRelease.takenDownNote": "Release taken down",
  "moderation.studioRelease.restoredNote": "Release restored and live again",
  "moderation.studioRelease.restoredDraftNote":
    "Release restored as a draft: it was not live when taken down",
  "moderation.studioRelease.statusLabel": "Status",
  "moderation.studioRelease.takedownReasonLabel": "Takedown reason",
  "moderation.studioRelease.retry": "Load the release again",
  "moderation.studioRelease.loadFailed": "We couldn't load this release",
  "moderation.studioRelease.thumbAlt": "Cover of {title}",
  // ── Studio v3 artist tools (2026-10-13) ──────────────────────────────────────
  "moderation.personaPost.heading": "Reported update",
  "moderation.personaPost.subject": "An update posted by {persona}",
  "moderation.personaPost.removeCta": "Remove update",
  "moderation.personaPost.removeTitle": "Remove this update?",
  "moderation.personaPost.removeBody":
    "The update leaves the persona page for good and its photo is deleted. An audit entry records the removal",
  "moderation.personaPost.reasonLabel": "Reason for the record",
  "moderation.personaPost.removedNote":
    "Update removed. The persona's followers no longer see it",
  "moderation.personaPost.goneNote":
    "This update is gone, nothing left to remove",
  "moderation.personaPost.loadFailed": "We couldn't load the reported update",
  "moderation.personaPost.retry": "Load the update again",
  "moderation.personaPost.photoAlt": "Photo in the update by {persona}",
  "moderation.personaPost.linkLabel": "Link",
  "moderation.category.copyright": "Copyright",
  "moderation.action.studioAccessGranted": "Granted Studio access",
  "moderation.action.studioAccessRevoked": "Revoked Studio access",
  "moderation.action.studioReleaseTakenDown": "Took down a Studio release",
  "moderation.action.studioReleaseRestored": "Restored a Studio release",
  "moderation.action.studioTrackMarkedExplicit":
    "Marked a Studio track explicit",
  "moderation.action.studioTrackWarningAdded":
    "Added a content warning to a Studio track",
  "moderation.action.studioCopyrightClaimAccepted":
    "Accepted a copyright claim",
  "moderation.action.studioCopyrightClaimDeclined":
    "Declined a copyright claim",
  "moderation.action.studioCopyrightClaimUpheld": "Upheld a copyright claim",
  "moderation.action.studioCopyrightClaimRejected":
    "Rejected a copyright claim",
  "moderation.action.personaPostRemoved": "Removed a persona post",
  "moderation.action.earlyAccessGranted": "Turned on early access",
  "moderation.action.earlyAccessRevoked": "Revoked early access",
  "moderation.action.inviteAccessChanged": "Changed invite access",
  "ambassadors.loadMore": "Load more",
  "ambassadors.loadingMore": "Loading…",
  "ambassadors.loadMoreError": "We couldn't load more ambassadors. Try again.",
  "ambassadors.row.history": "History",
  "ambassadors.row.historyAria": "Grant history for {name}",
  "ambassadors.history.label": "Grant history for {name}",
  "ambassadors.history.title": "Grant history",
  "ambassadors.history.active": "Active",
  "ambassadors.history.grantedOn": "Granted",
  "ambassadors.history.revoked": "Revoked",
  "ambassadors.history.error":
    "We couldn't load this history. Try again in a moment.",
  "ambassadors.history.empty": "No grants on record for this member.",
  "ambassadors.circle.notFounded":
    "The circle opens when the first ambassador is granted.",
  "marketingVideos.header.eyebrow": "Films, flyers and merch",
  "marketingVideos.header.sub":
    "Our launch films, event flyers, stories, event banners and team merch, kept as code. Watch a film and turn it into a video file, or download print, story and banner files, whenever you need them.",
  "marketingVideos.sections.films": "Films",
  "marketingVideos.sections.flyers": "Flyers",
  "marketingVideos.sections.eventBanners": "Event banners",
  "marketingVideos.sections.merch": "Merch",
  "marketingVideos.merch.team-tee.title": "Team tee",
  "marketingVideos.merch.team-tee.summary":
    "For black tees and pullovers: the wordmark 9\u00a0cm wide at chest level and the tagline 28\u00a0cm wide between the shoulder blades.",
  "marketingVideos.merchCard.meta": "Black tee or pullover · 2 inks",
  "marketingVideos.merchCard.previewAlt": "The {title} mockup, front and back",
  "marketingVideos.merchCard.view": "View mockup",
  "marketingVideos.merchCard.download.frontPng": "Download front PNG",
  "marketingVideos.merchCard.download.frontPdf": "Download front PDF",
  "marketingVideos.merchCard.download.frontSvg": "Download front SVG",
  "marketingVideos.merchCard.download.backPng": "Download back PNG",
  "marketingVideos.merchCard.download.backPdf": "Download back PDF",
  "marketingVideos.merchCard.download.backSvg": "Download back SVG",
  "marketingVideos.flyers.studio-open-call.title": "Studio open call",
  "marketingVideos.flyers.studio-open-call.summary":
    "An Instagram story inviting queer musicians and DJs in Lisbon to add their music to QueerPulse Studio, in English and Portuguese.",
  "marketingVideos.flyers.first-event.title": "First event",
  "marketingVideos.flyers.first-event.summary":
    "Made for our first event: a queer network rooted in Lisbon, and a QR code that opens queerpulse.com.",
  "marketingVideos.flyers.queer-history-quiz-night.title":
    "Queer history quiz night",
  "marketingVideos.flyers.queer-history-quiz-night.summary":
    "Cover for a Pulse Live quiz on queer history: moments from Stonewall to 2018, and a live question on Lisbon's first Pride march.",
  "marketingVideos.flyerCard.meta.a5": "A5 portrait · PDF and PNG",
  "marketingVideos.flyerCard.meta.story": "Instagram story · 1080 × 1920",
  "marketingVideos.flyerCard.meta.banner": "Event cover · 2400 × 1200",
  "marketingVideos.flyerCard.previewAlt.a5": "The {title} flyer",
  "marketingVideos.flyerCard.previewAlt.story": "The {title} story",
  "marketingVideos.flyerCard.previewAlt.banner": "The {title} banner",
  "marketingVideos.flyerCard.view.a5": "View flyer",
  "marketingVideos.flyerCard.view.story": "View story",
  "marketingVideos.flyerCard.view.banner": "View banner",
  "marketingVideos.flyerCard.download.pdfA5": "Download PDF (A5)",
  "marketingVideos.flyerCard.download.pdfA5Print":
    "Download PDF with bleed (A5)",
  "marketingVideos.flyerCard.download.pdfA4": "Download PDF (A4)",
  "marketingVideos.flyerCard.download.png": "Download PNG",
  "marketingVideos.flyerCard.download.png.story": "Download PNG (English)",
  "marketingVideos.flyerCard.download.png.banner": "Download PNG (English)",
  "marketingVideos.flyerCard.download.pngPt": "Download PNG (Portuguese)",
  "marketingVideos.films.cinematic.title": "Cinematic",
  "marketingVideos.films.cinematic.summary":
    "Slow and warm, at 100 BPM. The product as six moments, then the city and the invitation.",
  "marketingVideos.films.upbeat.title": "Upbeat",
  "marketingVideos.films.upbeat.summary":
    "Bold type, a colour for every feature and two confetti drops on the name. Made for social.",
  "marketingVideos.films.pro.title": "Pro",
  "marketingVideos.films.pro.summary":
    "Filmed like a product launch: a dark stage, one camera across all six cards and a dot map of Lisbon.",
  "marketingVideos.films.vouch.title": "Vouched",
  "marketingVideos.films.vouch.summary":
    "A friend's invite, start to finish: the vouch, the walk in and arriving already knowing people.",
  "marketingVideos.format.landscape.ratio": "16:9",
  "marketingVideos.format.landscape.resolution": "1080p",
  "marketingVideos.format.landscape.output": "video (16:9)",
  "marketingVideos.format.portrait.ratio": "4:5",
  "marketingVideos.format.portrait.resolution": "1080×1350",
  "marketingVideos.format.portrait.output": "Instagram post (4:5)",
  "marketingVideos.card.meta": "{duration} · {resolution} · 30 fps",
  "marketingVideos.card.motionBlur": "Motion blur, so it renders more slowly",
  "marketingVideos.card.preview": "Preview",
  "marketingVideos.card.render": "Render video",
  "marketingVideos.card.renderFormat.landscape": "Render video (16:9)",
  "marketingVideos.card.renderFormat.portrait": "Render Instagram post (4:5)",
  "marketingVideos.card.frameTitle": "{title}, still frame",
  "marketingVideos.preview.format": "Format",
  "marketingVideos.preview.eyebrow": "Preview",
  "marketingVideos.preview.frameTitle": "{title}, playing",
  "marketingVideos.preview.play": "Play",
  "marketingVideos.preview.pause": "Pause",
  "marketingVideos.preview.restart": "Back to the start",
  "marketingVideos.preview.scrub": "Position in the film",
  "marketingVideos.preview.fullScreen": "Full screen",
  "marketingVideos.preview.exitFullScreen": "Exit full screen",
  "marketingVideos.preview.soundLoading": "Getting the sound ready…",
  "marketingVideos.preview.soundOn": "Sound on",
  "marketingVideos.preview.soundFailed":
    "Plays without sound: the score didn't load.",
  "marketingVideos.preview.note":
    "The preview plays live in your browser. Rendering makes the frame-perfect file.",
  "marketingVideos.studio.eyebrow": "Render",
  "marketingVideos.studio.title": "{title} to video",
  "marketingVideos.studio.titleFormat": "{title} to {format}",
  "marketingVideos.studio.frameTitle": "{title}, rendering",
  "marketingVideos.studio.intro":
    "Your browser plays the film frame by frame and records a {resolution} video with sound. When it asks, share this tab. Keep the tab open and in front until it's done, about {minutes} minutes.",
  "marketingVideos.studio.soft":
    "Your window shows the film smaller than {resolution}, so the file would be a little soft. Go full screen or enlarge the window for a sharp one.",
  "marketingVideos.studio.fullScreen": "Full screen",
  "marketingVideos.studio.start": "Start rendering",
  "marketingVideos.studio.stop": "Stop",
  "marketingVideos.studio.close": "Close",
  "marketingVideos.studio.again": "Render again",
  "marketingVideos.studio.step.sharing": "Choose this tab to share…",
  "marketingVideos.studio.step.score": "Composing the score…",
  "marketingVideos.studio.step.frames": "Recording frame {done} of {total}",
  "marketingVideos.studio.step.finishing": "Finishing the file…",
  "marketingVideos.studio.timeLeft": "About {time} left",
  "marketingVideos.studio.progress": "Rendering progress",
  "marketingVideos.studio.done.title": "Your video is <em>ready.</em>",
  "marketingVideos.studio.done.download": "Download {fileName}",
  "marketingVideos.studio.done.meta": "{size} · recorded at {width}×{height}",
  "marketingVideos.studio.done.notMp4":
    "This browser can't make MP4, so it's a WebM file. Chrome or Edge on Windows or Mac make MP4.",
  "marketingVideos.studio.error.denied":
    "Sharing was cancelled, so nothing was recorded. Start again and choose this tab.",
  "marketingVideos.studio.error.wrongTab":
    "That wasn't this tab. Start again and share this tab, not a window or your screen.",
  "marketingVideos.studio.error.stopped":
    "Sharing stopped before the film finished. Start again to record it from the beginning.",
  "marketingVideos.studio.error.stalled":
    "The recording stalled, usually because this tab went to the background. Keep it in front and start again.",
  "marketingVideos.studio.error.encoder":
    "This browser can't encode video. Try Chrome or Edge on a computer.",
  "marketingVideos.studio.error.format":
    "This film has no {format} version yet, so nothing can be recorded.",
  "marketingVideos.studio.error.failed":
    "Something went wrong while rendering. Start again, and if it keeps happening, tell the tech team.",
  "marketingVideos.studio.unsupported":
    "Rendering needs Chrome or Edge on a computer. You can still preview every film here.",
  // ── Logo concepts (/admin/logo-concepts) ─────────────────────────────────
  "logoConcepts.header.eyebrow": "Brand",
  "logoConcepts.header.sub":
    "Candidate marks for our social avatars, built from the sign-in Q: compare them in each colourway and size, then download the files.",
  "logoConcepts.current.title": "Current mark",
  "logoConcepts.current.body":
    "The pulse dots we use today, at 96px and as a 40px avatar, to judge each concept against.",
  "logoConcepts.current.alt": "The current QueerPulse mark",
  "logoConcepts.colorways.plum": "Plum",
  "logoConcepts.colorways.cream": "Cream",
  "logoConcepts.colorways.mono": "One colour",
  "logoConcepts.card.heroAlt": "{title} logo, {colorway}",
  "logoConcepts.card.colorwayLabel": "Colourway for {title}",
  "logoConcepts.card.sizesLabel": "Avatar sizes",
  "logoConcepts.card.sizePx": "{size}px",
  "logoConcepts.card.downloadSvg": "Download SVG",
  "logoConcepts.card.downloadPng": "Download PNG",
  "logoConcepts.card.pngError": "The PNG export failed. Try again.",
  "logoConcepts.card.svgError": "The SVG download failed. Try again.",
  "logoConcepts.concepts.constellation.title": "Constellation",
  "logoConcepts.concepts.constellation.summary":
    "People traced along the Q, threaded like the sign-in art. Shines large: covers, press, the website.",
  "logoConcepts.concepts.thread.title": "Thread",
  "logoConcepts.concepts.thread.summary":
    "One bold Q line with people strung on it as beads. Stays crisp from favicon to billboard.",
  "logoConcepts.concepts.hearth.title": "Hearth",
  "logoConcepts.concepts.hearth.summary":
    "A ring of big dots round a coral hearth, the tail stepping out. The boldest for small avatars.",
  "logoConcepts.ripple.title": "Ripple",
  "logoConcepts.ripple.sub":
    "The P lands like a pulse and the ripples it sends out become the Q. Four takes on one sketch. At 32px and below each one switches to a simpler small cut.",
  "logoConcepts.concepts.rippleDrop.title": "Drop",
  "logoConcepts.concepts.rippleDrop.summary":
    "The sketch as drawn: broken ripples round the P, its stem breaking through the Q as the tail and a coral drop at the tip.",
  "logoConcepts.concepts.rippleRings.title": "Rings",
  "logoConcepts.concepts.rippleRings.summary":
    "Two whole ripples round the P, lighter toward the middle. The closest to the pulse dots we use today.",
  "logoConcepts.concepts.rippleSplash.title": "Splash",
  "logoConcepts.concepts.rippleSplash.summary":
    "The P lands off centre, so the ripples crowd on its side and open out on the other, like a wave moving out.",
  "logoConcepts.concepts.rippleSerif.title": "Serif",
  "logoConcepts.concepts.rippleSerif.summary":
    "Every ripple is the tilted Fraunces bowl, thick and thin like Swell, so the mark joins the Thread family.",
  "logoConcepts.rippleLetter.title": "A new P",
  "logoConcepts.rippleLetter.sub":
    "Drop and Serif keep their Q and the P becomes a real letter from Fraunces or DM Sans, with a fuller bowl and an open counter. At 32px and below each one switches to a simpler small cut.",
  "logoConcepts.concepts.rippleLetterDropFraunces.title": "Drop, Fraunces",
  "logoConcepts.concepts.rippleLetterDropFraunces.summary":
    "Drop's ripples with a Fraunces Black P, its stem running out through the Q as the tail with the coral drop at the tip.",
  "logoConcepts.concepts.rippleLetterDropFrauncesTail.title":
    "Drop, Fraunces tail",
  "logoConcepts.concepts.rippleLetterDropFrauncesTail.summary":
    "The same Drop with no bead, the P's stem and the Q's ink stroke running out together as one long Q tail.",
  "logoConcepts.concepts.rippleLetterDropSans.title": "Drop, DM Sans",
  "logoConcepts.concepts.rippleLetterDropSans.summary":
    "The same Drop with a heavy DM Sans P, the letter of our interface, as even as the ripples round it.",
  "logoConcepts.concepts.rippleLetterDropUpright.title": "Drop, upright",
  "logoConcepts.concepts.rippleLetterDropUpright.summary":
    "A soft Fraunces P stands upright in the ripples and the Q draws its own tail, like a monogram.",
  "logoConcepts.concepts.rippleLetterSerifFraunces.title": "Serif, Fraunces",
  "logoConcepts.concepts.rippleLetterSerifFraunces.summary":
    "The Fraunces Q with a Fraunces P of matching weight, its stem leaving the bowl where the Q's own tail would.",
  "logoConcepts.concepts.rippleLetterSerifSoft.title": "Serif, soft",
  "logoConcepts.concepts.rippleLetterSerifSoft.summary":
    "A soft Fraunces P stands upright in the bowl and the Q keeps its own Fraunces tail, a warmer twin of Italic.",
  "logoConcepts.concepts.rippleLetterSerifItalic.title": "Serif, italic",
  "logoConcepts.concepts.rippleLetterSerifItalic.summary":
    "A Fraunces italic P sits in the bowl and the Q keeps its own Fraunces tail, so both letters share one typeface.",
  "logoConcepts.rippleOutside.title": "P on the outside",
  "logoConcepts.rippleOutside.sub":
    "The P grows big and the Q sits inside its bowl, like the pulse at its heart. At 32px and below the Q becomes a coral dot with a tail.",
  "logoConcepts.concepts.rippleOutsideNest.title": "Nest",
  "logoConcepts.concepts.rippleOutsideNest.summary":
    "An upright P with a whole coral Q resting in its bowl. You read the P first, then the Q inside it.",
  "logoConcepts.concepts.rippleOutsideRings.title": "Echo",
  "logoConcepts.concepts.rippleOutsideRings.summary":
    "The P's bowl is the outer ripple, with two more rings closing in on the coral Q at the centre.",
  "logoConcepts.concepts.rippleOutsideTail.title": "Break",
  "logoConcepts.concepts.rippleOutsideTail.summary":
    "The Q's tail runs out through the P's bowl and ends in a coral drop: the first Ripple idea turned inside out.",
  "logoConcepts.rippleFused.title": "Fused",
  "logoConcepts.rippleFused.sub":
    "The P's bowl is the Q's first ripple, so the two letters share one centre and the P's stem is the Q's tail.",
  "logoConcepts.concepts.rippleFusedRing.title": "Ring",
  "logoConcepts.concepts.rippleFusedRing.summary":
    "Only the P's bowl and the Q ring, round one centre. The cleanest of the family at avatar sizes.",
  "logoConcepts.concepts.rippleFusedSpiral.title": "Spiral",
  "logoConcepts.concepts.rippleFusedSpiral.summary":
    "One line draws the P, keeps turning out into the Q and leaves as the tail. The colour changes where the P becomes the Q.",
  "logoConcepts.concepts.rippleFusedStack.title": "Stack",
  "logoConcepts.concepts.rippleFusedStack.summary":
    "The P's bowl, one thin ripple and the Q ring round one centre. The fullest of the fused three.",
  "logoConcepts.variants.title": "Thread variants",
  "logoConcepts.variants.sub":
    "Five ways to give Thread depth. At 32px and below each one switches to a simpler small cut.",
  "logoConcepts.concepts.threadSignature.title": "Signature",
  "logoConcepts.concepts.threadSignature.summary":
    "The swelling line, the tail laid over the bowl and three different people, together in one mark.",
  "logoConcepts.concepts.threadWoven.title": "Woven",
  "logoConcepts.concepts.threadWoven.summary":
    "The thread passes over and under itself, so the Q reads as something knotted by hand.",
  "logoConcepts.concepts.threadSwell.title": "Swell",
  "logoConcepts.concepts.threadSwell.summary":
    "The line swells and thins like the Fraunces Q, with one person tied on at the thin top like a knot.",
  "logoConcepts.concepts.threadTrio.title": "Trio",
  "logoConcepts.concepts.threadTrio.summary":
    "Three people, each one different, walking the line together. The clearest at avatar sizes.",
  "logoConcepts.concepts.threadRibbon.title": "Ribbon",
  "logoConcepts.concepts.threadRibbon.summary":
    "The line becomes a flat ribbon that shows its back where it folds behind, like folded paper.",
  // ── Unfinished listing drafts (Admin only, a tab of /admin/listings) ─────
  "listingDrafts.intro":
    "Listings members started but haven't sent yet. You see the name and how far they got. Offer a hand if someone looks stuck, or finish the business details as a team listing they can accept.",
  "listingDrafts.count_one": "{count} draft in progress",
  "listingDrafts.count_other": "{count} drafts in progress",
  "listingDrafts.creatorDraftsLink": "Open creator drafts",
  "listingDrafts.empty": "No unfinished drafts right now.",
  "listingDrafts.loadError.title": "The drafts list didn't load",
  "listingDrafts.loadError.body":
    "We couldn't reach the server. Nothing has changed. Try again in a moment.",
  "listingDrafts.loadMore": "Load more drafts",
  "listingDrafts.loadingMore": "Loading…",
  "listingDrafts.untitled": "Untitled place",
  "listingDrafts.path.claim": "Their own place",
  "listingDrafts.path.suggest": "Suggesting a place",
  "listingDrafts.active": "Recently edited",
  "listingDrafts.stalled_one": "Quiet for {count} day",
  "listingDrafts.stalled_other": "Quiet for {count} days",
  "listingDrafts.progress": "Step {step} of {total}: {label}",
  "listingDrafts.dates": "Started {started} · last edited {edited}",
  "listingDrafts.startedBy": "Started by {name}",
  "listingDrafts.unknownOwner": "a member who has since left",
  "listingDrafts.profileCta": "View profile",
  "listingDrafts.messageCta": "Message {name}",
  "listingDrafts.finishCta": "Finish as a team listing",
  "listingDrafts.message.eyebrow": "Offer a hand",
  "listingDrafts.message.title": "Message {name}",
  "listingDrafts.message.sub":
    "This lands in their official QueerPulse thread, pinned in their inbox. It doesn't buzz their phone.",
  "listingDrafts.message.label": "Your message",
  "listingDrafts.message.helper":
    "We've started it for you. Make it yours, and keep it an offer, not a nudge.",
  "listingDrafts.message.template":
    "Hi {firstName}! We noticed you started listing {name} on QueerPulse. If something got in the way, or you'd like a hand finishing it, just reply here and we'll help. No rush at all.",
  "listingDrafts.message.templateUntitled":
    "Hi {firstName}! We noticed you started a listing on QueerPulse. If something got in the way, or you'd like a hand finishing it, just reply here and we'll help. No rush at all.",
  "listingDrafts.message.send": "Send message",
  "listingDrafts.message.sending": "Sending…",
  "listingDrafts.message.cancel": "Cancel",
  "listingDrafts.message.sent": "Sent to {name}.",
  "listingDrafts.message.action": "send your message",
  // ── Creator drafts (Admin only, /admin/creator-drafts) ─────────────────────
  // Unfinished events, communities, personas, Studio work and listing edits.
  // `missing.<kind>.<code>` labels the server's still-missing codes; a code
  // with no key here folds into `missing.other`.
  "creatorDrafts.title": "Creator <em>drafts</em>",
  "creatorDrafts.header.eyebrow": "Help in progress",
  "creatorDrafts.header.title": "Drafts people <em>are building</em>",
  "creatorDrafts.header.sub":
    "Unfinished pages from communities, personas and businesses. Open one to see it as the public would. If someone seems stuck, reach out",
  "creatorDrafts.filter.all": "All",
  "creatorDrafts.kind.persona": "Persona",
  "creatorDrafts.kind.studio_release": "Studio release",
  "creatorDrafts.kind.studio_episode": "Podcast episode",
  "creatorDrafts.kind.listing": "New listing",
  "creatorDrafts.kind.event": "Event",
  "creatorDrafts.kind.listing_edit": "Listing edit",
  "creatorDrafts.kind.community": "Community",
  "creatorDrafts.count_one": "{count} draft in progress",
  "creatorDrafts.count_other": "{count} drafts in progress",
  "creatorDrafts.untitled": "Untitled",
  "creatorDrafts.madeFor.community": "For {name}",
  "creatorDrafts.madeFor.listing": "For {name}",
  "creatorDrafts.madeFor.persona": "As {name}",
  "creatorDrafts.startedBy": "Started by {name}",
  "creatorDrafts.unknownOwner": "someone whose account is gone",
  "creatorDrafts.lastSaved": "Last saved {date}",
  "creatorDrafts.progress": "{done} of {total} steps",
  "creatorDrafts.moreMissing": "+{count} more",
  "creatorDrafts.empty": "Nobody has a draft open right now",
  "creatorDrafts.loadError.title": "We couldn't load the drafts",
  "creatorDrafts.loadError.body": "Check your connection and try again",
  "creatorDrafts.loadMore": "Show more drafts",
  "creatorDrafts.loadingMore": "Loading",
  "creatorDrafts.emptyKind": "Nobody has a draft open under {kind} right now",
  "creatorDrafts.detail.eyebrow": "Creator draft",
  "creatorDrafts.detail.sub":
    "A read-only preview of what the public would see if this went live today",
  "creatorDrafts.detail.logged":
    "Opening a draft is recorded in the Platform log",
  "creatorDrafts.detail.loadError.title": "This draft didn't load",
  "creatorDrafts.detail.loadError.body": "Check your connection and try again",
  "creatorDrafts.strip.label": "Unfinished draft details",
  "creatorDrafts.strip.unfinished": "Unfinished",
  "creatorDrafts.strip.kind": "Kind",
  "creatorDrafts.strip.owner": "Owner",
  "creatorDrafts.strip.noOwner": "Someone whose account is gone",
  "creatorDrafts.strip.lastSaved": "Last saved",
  "creatorDrafts.strip.progress": "Progress",
  "creatorDrafts.strip.missing": "Still missing",
  "creatorDrafts.strip.nothingMissing": "Everything needed is filled in",
  "creatorDrafts.messageCta": "Message {name}",
  "creatorDrafts.profileCta": "View profile",
  "creatorDrafts.openLiveListing": "Open the live listing",
  "creatorDrafts.backToList": "Back to creator drafts",
  "creatorDrafts.notFound.title": "This draft is no longer here",
  "creatorDrafts.notFound.body":
    "It may have been published, discarded or left long enough to expire",
  "creatorDrafts.message.template":
    "Hi {firstName}! We noticed you started {name} on QueerPulse. If something got in the way, or you'd like a hand finishing it, just reply here and we'll help. No rush at all.",
  "creatorDrafts.message.templateUntitled":
    "Hi {firstName}! We noticed you started something on QueerPulse. If something got in the way, or you'd like a hand finishing it, just reply here and we'll help. No rush at all.",
  "creatorDrafts.message.editTemplate":
    "Hi {firstName}! We noticed you have unsaved changes to {name} on QueerPulse. If something got in the way, or you'd like a hand finishing them, just reply here and we'll help. No rush at all.",
  "creatorDrafts.message.editTemplateUntitled":
    "Hi {firstName}! We noticed you have unsaved changes to your listing on QueerPulse. If something got in the way, or you'd like a hand finishing them, just reply here and we'll help. No rush at all.",
  "creatorDrafts.preview.label":
    "Preview of this draft as the public would see it",
  "creatorDrafts.preview.inertToast":
    "This is a preview. Buttons and links do nothing here",
  "creatorDrafts.preview.episodeMissing": "This episode has no preview yet",
  "creatorDrafts.missing.other": "Something else",
  "creatorDrafts.missing.event.what": "What it is",
  "creatorDrafts.missing.event.whenWhere": "When and where",
  "creatorDrafts.missing.event.who": "Who it's for",
  "creatorDrafts.missing.event.access": "Access",
  "creatorDrafts.missing.event.care": "Care",
  "creatorDrafts.missing.community.open": "Getting started",
  "creatorDrafts.missing.community.why": "Why it exists",
  "creatorDrafts.missing.community.who": "Who it's for",
  "creatorDrafts.missing.community.safety": "Safety",
  "creatorDrafts.missing.community.running": "How it runs",
  "creatorDrafts.missing.community.tone": "Tone",
  "creatorDrafts.missing.community.feeling": "Look and feel",
  "creatorDrafts.missing.community.people": "First people",
  "creatorDrafts.missing.community.confirm": "Final check",
  "creatorDrafts.missing.persona.handle_invalid": "Address needs fixing",
  "creatorDrafts.missing.persona.handle_taken": "Address is taken",
  "creatorDrafts.missing.persona.handle_reserved": "Address is reserved",
  "creatorDrafts.missing.persona.handle_names_owner": "Address names the owner",
  "creatorDrafts.missing.persona.handle_is_kind":
    "Address clashes with a persona type",
  "creatorDrafts.missing.persona.avatar_missing": "Profile picture",
  "creatorDrafts.missing.persona.bio_too_short": "Longer bio",
  "creatorDrafts.missing.persona.not_enough_items": "More items",
  "creatorDrafts.missing.persona.blocked_terms": "Words we can't publish",
  "creatorDrafts.missing.studio_release.studio_publish_missing_title": "Title",
  "creatorDrafts.missing.studio_release.studio_publish_missing_cover":
    "Cover art",
  "creatorDrafts.missing.studio_release.studio_publish_missing_rights":
    "Rights confirmation",
  "creatorDrafts.missing.studio_release.studio_publish_missing_tracks":
    "Tracks",
  "creatorDrafts.missing.studio_release.studio_publish_tracks_pending":
    "Tracks still processing",
  "creatorDrafts.missing.studio_release.studio_publish_missing_sources":
    "Audio files",
  // Listing edit codes are the editor's ANCHOR keys
  // (`listingEditMissingCodes.ts`), labelled with the listing form's own words.
  "creatorDrafts.missing.listing_edit.name": "Business name",
  "creatorDrafts.missing.listing_edit.cats": "Categories",
  "creatorDrafts.missing.listing_edit.hood": "Neighbourhood",
  "creatorDrafts.missing.listing_edit.price": "Price band",
  "creatorDrafts.missing.listing_edit.blurb": "Short description",
  "creatorDrafts.missing.listing_edit.tagline": "Tagline",
  "creatorDrafts.missing.listing_edit.whatItIs": "Description",
  "creatorDrafts.missing.listing_edit.langs": "Languages spoken",
  "creatorDrafts.missing.listing_edit.attributes": "Details and amenities",
  "creatorDrafts.missing.listing_edit.highlights": "Card highlights",
  "creatorDrafts.missing.listing_edit.inclusionPractices":
    "Inclusion practices",
  "creatorDrafts.missing.listing_edit.saferSpacePolicyUrl":
    "Safer-space policy link",
  "creatorDrafts.missing.listing_edit.langsOther": "Other languages",
  "creatorDrafts.missing.listing_edit.entryMode": "How people get in",
  "creatorDrafts.missing.listing_edit.coverPolicy": "Entry",
  "creatorDrafts.missing.listing_edit.coverFreeBefore": "Free entry until",
  "creatorDrafts.missing.listing_edit.waysToPay": "Ways to pay in person",
  "creatorDrafts.missing.listing_edit.nifInvoices": "NIF invoices",
  "creatorDrafts.missing.listing_edit.address": "Address",
  "creatorDrafts.missing.listing_edit.online": "Where people find it",
  "creatorDrafts.missing.listing_edit.city": "Based in",
  "creatorDrafts.missing.listing_edit.hasOnlineShop": "Also sells online",
  "creatorDrafts.missing.listing_edit.mainLink": "Main link",
  "creatorDrafts.missing.listing_edit.moreLinks": "More links",
  "creatorDrafts.missing.listing_edit.fulfilment": "How people get it",
  "creatorDrafts.missing.listing_edit.pickupNote": "Pick-up note",
  "creatorDrafts.missing.listing_edit.shipsFrom": "Ships from",
  "creatorDrafts.missing.listing_edit.payments": "Ways to pay",
  "creatorDrafts.missing.listing_edit.sessionFormats": "Session formats",
  "creatorDrafts.missing.listing_edit.registration":
    "Professional registration",
  "creatorDrafts.missing.listing_edit.replyNote": "Replies and dispatch",
  "creatorDrafts.missing.listing_edit.whereYouWork": "Where it works",
  "creatorDrafts.missing.listing_edit.meetingPoint": "Meeting point",
  "creatorDrafts.missing.listing_edit.byAppointment": "By appointment only",
  "creatorDrafts.missing.listing_edit.hours": "Opening hours",
  "creatorDrafts.missing.listing_edit.hoursNote": "Hours note",
  "creatorDrafts.missing.listing_edit.hoursExceptions":
    "Holiday and special-date hours",
  "creatorDrafts.missing.listing_edit.social": "Contact links",
  "creatorDrafts.missing.listing_edit.cover": "Cover photo",
  "creatorDrafts.missing.listing_edit.photos": "Photos",
  "creatorDrafts.missing.listing_edit.pricingMode": "What the page shows",
  "creatorDrafts.missing.listing_edit.services": "Services and prices",
  "creatorDrafts.missing.listing_edit.accessibility": "Accessibility answers",
  // ── Studio discovery console (/admin/studio) ──────────────────────────────
  "studioAdmin.eyebrow": "Studio",
  "studioAdmin.title": "Studio <em>discovery</em>",
  "studioAdmin.sub":
    "Set the featured release, keep the two shelves in order, run the scenes, pick the Artist of the month and New stars on Studio home, curate the Studio page, choose the founding artists and open Studio to the people waiting for it",
  "studioAdmin.subCurator":
    "Set the featured release, keep the shelves in order, run the scenes and pick the Artist of the month and New stars on Studio home",
  "studioAdmin.tabs.shelves": "Shelves",
  "studioAdmin.tabs.scenes": "Scenes",
  "studioAdmin.tabs.spotlight": "Artists",
  "studioAdmin.loadError": "Studio discovery couldn't load. Try again",
  "studioAdmin.searchError": "That search didn't load",
  "studioAdmin.retryCta": "Try again",
  "studioAdmin.saveError": "That change didn't save. Try again",
  // A 403 on a console read. Moderators and admins both open the console, so
  // the line names no role.
  "studioAdmin.forbidden": "Your account can't open Studio discovery",
  "studioAdmin.shelf.featured": "Featured",
  "studioAdmin.shelf.staff_picks": "Staff picks",
  "studioAdmin.shelf.new_this_week": "New this week",
  "studioAdmin.shelf.count": "{count} of {max}",
  "studioAdmin.shelf.empty": "Nothing on this shelf yet",
  "studioAdmin.shelf.full": "This shelf is full",
  "studioAdmin.shelf.addCta.featured": "Set featured release",
  "studioAdmin.shelf.addCta.staff_picks": "Add to Staff picks",
  "studioAdmin.shelf.addCta.new_this_week": "Add to New this week",
  "studioAdmin.featured.replaceCta": "Replace release",
  "studioAdmin.featured.emptyBody":
    "Until you choose one, Studio home shows the newest release",
  "studioAdmin.shelf.emptyBody":
    "Studio home hides this row until you add a release",
  "studioAdmin.pick.added": "Added {age}",
  "studioAdmin.pick.notListenable":
    "Hidden from listeners: this release can't be played right now",
  "studioAdmin.pick.editNoteCta": "Edit note",
  "studioAdmin.pick.editNoteAria": "Edit note for {title}",
  "studioAdmin.pick.addNoteCta": "Add a note",
  "studioAdmin.pick.addNoteAria": "Add a note to {title}",
  "studioAdmin.pick.removeCta": "Remove pick",
  "studioAdmin.pick.removeAria": "Remove pick {title} from {shelf}",
  "studioAdmin.moveUpCta": "Move up",
  "studioAdmin.moveDownCta": "Move down",
  "studioAdmin.moveUpAria": "Move up: {name}",
  "studioAdmin.moveDownAria": "Move down: {name}",
  "studioAdmin.dragAria": "Drag {name} to reorder",
  "studioAdmin.moved": "{name} is now number {position}",
  "studioAdmin.moveEarlierCta": "Move earlier",
  "studioAdmin.moveLaterCta": "Move later",
  "studioAdmin.moveEarlierAria": "Move earlier: {name}",
  "studioAdmin.moveLaterAria": "Move later: {name}",
  "studioAdmin.pickDialog.title": "Add a release to {shelf}",
  "studioAdmin.pickDialog.titleFeatured": "Set the featured release",
  "studioAdmin.pickDialog.searchLabel": "Search published releases",
  "studioAdmin.pickDialog.searchHint": "Search by release title or artist name",
  "studioAdmin.pickDialog.searching": "Searching",
  "studioAdmin.pickDialog.noResults": "No published release matches",
  "studioAdmin.pickDialog.resultsLabel": "Matching releases",
  "studioAdmin.pickDialog.chosen": "Chosen: {title}",
  "studioAdmin.pickDialog.noteLabel": "Note (optional)",
  "studioAdmin.pickDialog.noteHint":
    "One line, up to 140 characters, shown under the release",
  "studioAdmin.pickDialog.submitCta": "Add release",
  "studioAdmin.pickDialog.submitFeaturedCta": "Set as featured",
  "studioAdmin.pickDialog.chooseFirst": "Choose a release first",
  "studioAdmin.pickDialog.recentHeading": "Just released",
  "studioAdmin.pickDialog.noRecent": "No published releases yet",
  "studioAdmin.pickDialog.clearSearchCta": "Clear the search",
  "studioAdmin.pickDialog.chosenHeading": "Your choice",
  "studioAdmin.pickDialog.changeCta": "Choose another release",
  "studioAdmin.pickDialog.replacesFeatured":
    "This replaces {title} as the featured release",
  "studioAdmin.pickDialog.takenOnShelf": "On this shelf",
  "studioAdmin.pickDialog.takenFeatured": "Featured now",
  "studioAdmin.pickDialog.searchPlaceholder": "Title or artist",
  "studioAdmin.pickDialog.noteCount": "{count} of {max}",
  "studioAdmin.noteDialog.saveCta": "Save note",
  "studioAdmin.toast.pickAdded": "{title} is on {shelf}",
  "studioAdmin.toast.pickRemoved": "{title} left {shelf}",
  "studioAdmin.toast.noteSaved": "Note saved",
  "studioAdmin.scenes.newCta": "New scene",
  "studioAdmin.scenes.empty": "No scenes yet",
  "studioAdmin.scenes.activeHeading": "Active",
  "studioAdmin.scenes.archivedHeading": "Archived",
  "studioAdmin.scenes.releaseCount_one": "{count} release",
  "studioAdmin.scenes.releaseCount_other": "{count} releases",
  "studioAdmin.scenes.pinnedCount_one": "{count} pinned event",
  "studioAdmin.scenes.pinnedCount_other": "{count} pinned events",
  "studioAdmin.scenes.editCta": "Edit scene",
  "studioAdmin.scenes.editAria": "Edit scene {name}",
  "studioAdmin.scenes.archiveCta": "Archive scene",
  "studioAdmin.scenes.archiveAria": "Archive scene {name}",
  "studioAdmin.scenes.restoreCta": "Restore scene",
  "studioAdmin.scenes.restoreAria": "Restore scene {name}",
  "studioAdmin.scenes.manageCta": "Events and releases",
  "studioAdmin.scenes.manageAria": "Events and releases: {name}",
  "studioAdmin.sceneDialog.createTitle": "New scene",
  "studioAdmin.sceneDialog.editTitle": "Edit {name}",
  "studioAdmin.sceneDialog.nameLabel": "Name",
  "studioAdmin.sceneDialog.cityLabel": "City",
  "studioAdmin.sceneDialog.slugLabel": "Address",
  "studioAdmin.sceneDialog.slugHint":
    "Lowercase letters, digits and single hyphens. Leave it empty to build it from the name",
  "studioAdmin.sceneDialog.blurbLabel": "Blurb",
  "studioAdmin.sceneDialog.blurbCount": "{count} of {max}",
  "studioAdmin.sceneDialog.coverLabel": "Cover",
  "studioAdmin.sceneDialog.coverPlaceholder": "Scene cover",
  "studioAdmin.sceneDialog.createCta": "Create scene",
  "studioAdmin.sceneDialog.saveCta": "Save scene",
  "studioAdmin.sceneDialog.nameRequired": "Give the scene a name",
  "studioAdmin.sceneDialog.cityRequired": "Add the city",
  "studioAdmin.sceneDialog.slugInvalid":
    "Use 2 to 60 lowercase letters, digits and single hyphens",
  "studioAdmin.toast.sceneCreated": "Scene {name} created",
  "studioAdmin.toast.sceneSaved": "Scene saved",
  "studioAdmin.toast.sceneArchived": "Scene {name} archived",
  "studioAdmin.toast.sceneRestored": "Scene {name} restored",
  "studioAdmin.sceneSheet.title": "{name}: events and releases",
  "studioAdmin.sceneSheet.events.heading": "Pinned events",
  "studioAdmin.sceneSheet.events.hint":
    "Pinned events show beside the events the scene's artists list on their personas",
  "studioAdmin.sceneSheet.events.searchLabel": "Search upcoming events",
  "studioAdmin.sceneSheet.events.resultsLabel": "Matching events",
  "studioAdmin.sceneSheet.events.noResults": "No upcoming event matches",
  "studioAdmin.sceneSheet.events.empty": "No pinned events",
  "studioAdmin.sceneSheet.events.past": "Past",
  "studioAdmin.sceneSheet.events.pinCta": "Pin event",
  "studioAdmin.sceneSheet.events.pinAria": "Pin event {title}",
  "studioAdmin.sceneSheet.events.unpinCta": "Unpin event",
  "studioAdmin.sceneSheet.events.unpinAria": "Unpin event {title}",
  "studioAdmin.sceneSheet.releases.heading": "Releases in this scene",
  "studioAdmin.sceneSheet.releases.empty": "No releases in this scene",
  "studioAdmin.sceneSheet.releases.removeCta": "Remove from scene",
  "studioAdmin.sceneSheet.releases.removeAria": "Remove from scene: {title}",
  "studioAdmin.sceneSheet.releases.showMore": "Show more releases",
  "studioAdmin.sceneSheet.releases.loadingMore": "Loading more releases",
  "studioAdmin.sceneSheet.releases.loadMoreError":
    "More releases couldn't load",
  "studioAdmin.toast.eventPinned": "Event pinned",
  "studioAdmin.toast.eventUnpinned": "Event unpinned",
  "studioAdmin.toast.releaseRemoved": "{title} left the scene",
  // Studio landing v2 (2026-10-28)
  "studioAdmin.tabs.landing": "Studio page",
  "studioAdmin.tabs.founding": "Founding artists",
  "studioAdmin.tabs.waiting": "Waiting for Studio",
  "studioAdmin.landing.loadError": "We couldn't load the Studio page content",
  "studioAdmin.landing.saveFailed": "We couldn't save that change",
  "studioAdmin.landing.previews.heading": "Hear it first",
  "studioAdmin.landing.previews.sub":
    "Tracks our team asks to play on the Studio page. Everyone who runs the artist gets the request, and the first answer decides. Up to 5 play, in this order",
  "studioAdmin.landing.previews.addCta": "Ask to play a track",
  "studioAdmin.landing.previews.empty": "No tracks asked for yet",
  "studioAdmin.landing.previews.full":
    "10 open requests. Remove one to ask for another",
  "studioAdmin.landing.previews.status.pending": "Waiting for the artist",
  "studioAdmin.landing.previews.status.approved": "Approved",
  "studioAdmin.landing.previews.status.declined": "Declined",
  "studioAdmin.landing.previews.status.withdrawn": "Withdrawn",
  "studioAdmin.landing.previews.onLanding": "On the page now",
  "studioAdmin.landing.previews.askedBy": "Asked by {name} on {date}",
  "studioAdmin.landing.previews.answeredBy": "Answered by {name} on {date}",
  "studioAdmin.landing.previews.showHistory": "Show answered requests",
  "studioAdmin.landing.previews.hideHistory": "Hide answered requests",
  "studioAdmin.landing.previews.removeCta": "Remove preview",
  "studioAdmin.landing.previews.removeLabel": "Remove the preview of {track}",
  "studioAdmin.landing.previews.removeConfirm.title":
    "Remove {track} from the Studio page?",
  "studioAdmin.landing.previews.removeConfirm.body":
    "It stops playing within a minute. The artist gets no message.",
  "studioAdmin.landing.previews.removed": "{track} is off the Studio page",
  "studioAdmin.landing.previews.requested":
    "{track} was sent to the artist for approval",
  "studioAdmin.landing.previews.ineligible.not_playable":
    "Can't play right now",
  "studioAdmin.landing.previews.ineligible.persona_not_eligible":
    "The artist can't appear",
  "studioAdmin.landing.previews.ineligible.podcast": "Podcast episode",
  "studioAdmin.landing.previews.ineligible.content_warnings":
    "Has content warnings",
  "studioAdmin.landing.previews.ineligible.explicit": "Marked explicit",
  "studioAdmin.landing.previews.ineligible.open_claim": "Under a rights claim",
  "studioAdmin.landing.previews.ineligible.unknown": "Can't play on the page",
  "studioAdmin.landing.previews.notEligibleBecause":
    "This track can't play on the Studio page: {reason}",
  "studioAdmin.landing.trackDialog.title": "Ask to play a track",
  "studioAdmin.landing.trackDialog.searchLabel": "Find a track",
  "studioAdmin.landing.trackDialog.placeholder": "Track, release or artist",
  "studioAdmin.landing.trackDialog.hasOpen": "Already asked",
  "studioAdmin.landing.trackDialog.noResults": "No tracks match",
  "studioAdmin.landing.trackDialog.askCta": "Ask the artist",
  "studioAdmin.landing.trackDialog.askLabel": "Ask to play {track}",
  "studioAdmin.landing.cards.heading": "Artist cards",
  "studioAdmin.landing.cards.sub":
    "Up to 6 on the Studio page, founding artists first. Add a card only once the artist has agreed, with the exact quote they agreed to",
  "studioAdmin.landing.cards.addCta": "Add an artist card",
  "studioAdmin.landing.cards.empty":
    "No artist cards yet. The section stays hidden until there are 2",
  "studioAdmin.landing.cards.editCta": "Edit card",
  "studioAdmin.landing.cards.editLabel": "Edit the card of {name}",
  "studioAdmin.landing.cards.removeCta": "Remove card",
  "studioAdmin.landing.cards.removeLabel": "Remove the card of {name}",
  "studioAdmin.landing.cards.removeConfirm.title": "Remove the card of {name}?",
  "studioAdmin.landing.cards.removeConfirm.body":
    "It leaves the Studio page within a minute.",
  "studioAdmin.landing.cards.notShown":
    "Not shown: this artist can't appear right now",
  "studioAdmin.landing.cards.consentedOn": "Agreed on {date}",
  "studioAdmin.landing.cards.saved": "The card of {name} is saved",
  "studioAdmin.landing.cards.removed": "The card of {name} is removed",
  "studioAdmin.landing.cards.full":
    "The Studio page holds up to 6 artist cards",
  "studioAdmin.landing.cardDialog.addTitle": "Add an artist card",
  "studioAdmin.landing.cardDialog.editTitle": "Edit the card of {name}",
  "studioAdmin.landing.cardDialog.artistLabel": "Artist",
  "studioAdmin.landing.cardDialog.quoteLabel": "Quote (optional)",
  "studioAdmin.landing.cardDialog.quoteHelp":
    "In the artist's own words, up to 240 characters",
  "studioAdmin.landing.cardDialog.consent":
    "The artist agreed to appear on the Studio page, with this quote",
  "studioAdmin.landing.cardDialog.saveCta": "Save card",
  "studioAdmin.landing.personaSearch.label": "Find an artist",
  "studioAdmin.landing.personaSearch.placeholder": "Name or handle",
  "studioAdmin.landing.personaSearch.hasCard": "Has a card",
  "studioAdmin.landing.personaSearch.isFounding": "Founding artist",
  "studioAdmin.landing.personaSearch.notEligible": "Can't appear",
  "studioAdmin.landing.personaSearch.noResults": "No artists match",
  "studioAdmin.landing.personaSearch.pickLabel": "Pick {name}",
  "studioAdmin.landing.photos.heading": "Photos",
  "studioAdmin.landing.photos.sub":
    "A real photo from a QueerPulse event in the hero and beside the manifesto. Without one, the page shows its usual picture",
  "studioAdmin.landing.photos.slot.hero": "Hero photo",
  "studioAdmin.landing.photos.slot.manifesto": "Manifesto photo",
  "studioAdmin.landing.photos.empty": "No photo",
  "studioAdmin.landing.photos.addCta": "Add photo",
  "studioAdmin.landing.photos.replaceCta": "Replace photo",
  "studioAdmin.landing.photos.removeCta": "Remove photo",
  "studioAdmin.landing.photos.removeConfirm.title": "Remove this photo?",
  "studioAdmin.landing.photos.removeConfirm.body":
    "The page goes back to its usual picture within a minute.",
  "studioAdmin.landing.photos.saved": "Photo saved",
  "studioAdmin.landing.photos.removed": "Photo removed",
  "studioAdmin.landing.photoDialog.imageLabel": "Photo",
  "studioAdmin.landing.photoDialog.altEnLabel": "Description in English",
  "studioAdmin.landing.photoDialog.altPtLabel": "Description in Portuguese",
  "studioAdmin.landing.photoDialog.altHelp":
    "What the photo shows, for people who can't see it, up to 200 characters",
  "studioAdmin.landing.photoDialog.creditLabel": "Credit (optional)",
  "studioAdmin.landing.photoDialog.consent":
    "Everyone recognisable in this photo agreed to appear on the Studio page",
  "studioAdmin.landing.photoDialog.saveCta": "Save photo",
  "studioAdmin.founding.heading": "Founding artists",
  "studioAdmin.founding.sub":
    "They keep a Founding artist badge on their page until they leave this list, and fill the launch shelf on Studio home while it is on",
  "studioAdmin.founding.shelfLabel":
    "Show the Founding artists shelf on Studio home",
  "studioAdmin.founding.shelfHelp":
    "The badge stays on artist pages either way",
  "studioAdmin.founding.shelfOn": "The Founding artists shelf is on",
  "studioAdmin.founding.shelfOff": "The Founding artists shelf is off",
  "studioAdmin.founding.addCta": "Add a founding artist",
  "studioAdmin.founding.addTitle": "Add a founding artist",
  "studioAdmin.founding.empty": "No founding artists yet",
  "studioAdmin.founding.notListed":
    "Not shown: this artist can't appear right now",
  "studioAdmin.founding.removeCta": "Remove founding artist",
  "studioAdmin.founding.removeLabel": "Remove {name} from the founding artists",
  "studioAdmin.founding.removeConfirm.title":
    "Remove {name} from the founding artists?",
  "studioAdmin.founding.removeConfirm.body":
    "The badge leaves their page and they leave the launch shelf.",
  "studioAdmin.founding.added": "{name} is a founding artist",
  "studioAdmin.founding.removed": "{name} is no longer a founding artist",
  "studioAdmin.founding.addedOn": "Added on {date}",
  "studioAdmin.founding.loadError": "Founding artists didn't load",
  "studioAdmin.spotlight.monthTitle": "Artist of the month",
  "studioAdmin.spotlight.monthEmpty": "No artist of the month yet",
  "studioAdmin.spotlight.pickedOn": "Picked {date}",
  "studioAdmin.spotlight.stale": "Picked in {month}. Pick this month's artist",
  "studioAdmin.spotlight.newStarsTitle": "New stars",
  "studioAdmin.spotlight.newStarsEmpty": "No new stars yet",
  "studioAdmin.spotlight.count": "{count} of 12",
  "studioAdmin.spotlight.addArtist": "Add artist",
  "studioAdmin.spotlight.pickArtist": "Pick artist",
  "studioAdmin.spotlight.changeArtist": "Change artist",
  "studioAdmin.spotlight.removeArtist": "Remove artist",
  "studioAdmin.spotlight.editNote": "Edit note",
  "studioAdmin.spotlight.notListenable":
    "Hidden from listeners: this artist has no release members can hear",
  "studioAdmin.spotlight.searchLabel": "Search artists by name or handle",
  "studioAdmin.spotlight.searchEmpty": 'No Studio artist matches "{q}"',
  "studioAdmin.spotlight.alreadyThere": "Already in New stars",
  "studioAdmin.spotlight.pickerTitleMonth": "Pick the Artist of the month",
  "studioAdmin.spotlight.pickerTitleNewStars": "Add an artist to New stars",
  "studioAdmin.spotlight.noteLabel": "Note (optional)",
  "studioAdmin.spotlight.noteHint":
    "One line, up to 140 characters, shown with the artist",
  "studioAdmin.spotlight.noteDialogTitle": "Edit the note for {name}",
  "studioAdmin.spotlight.saveNoteCta": "Save note",
  "studioAdmin.spotlight.noNote": "No note",
  "studioAdmin.spotlight.chosen": "Chosen: {name}",
  "studioAdmin.spotlight.chooseFirst": "Choose an artist first",
  "studioAdmin.spotlight.pickAria": "Pick {name}",
  "studioAdmin.spotlight.editNoteAria": "Edit note for {name}",
  "studioAdmin.spotlight.removeAria": "Remove artist: {name}",
  "studioAdmin.spotlight.monthSet": "{name} is Artist of the month",
  "studioAdmin.spotlight.addedToNewStars": "{name} is in New stars",
  "studioAdmin.spotlight.removed": "{name} left the spotlight",
  "studioAdmin.waiting.heading": "Waiting for Studio",
  "studioAdmin.waiting.sub":
    "Members who asked for Studio access. Artists come first, then whoever has waited longest",
  "studioAdmin.waiting.counts_one": "{count} waiting, artists: {artistCount}",
  "studioAdmin.waiting.counts_other": "{count} waiting, artists: {artistCount}",
  "studioAdmin.waiting.artistChip": "Artist",
  "studioAdmin.waiting.fromInviteChip": "Joined from the Studio page",
  "studioAdmin.waiting.askedOn": "Asked on {date}",
  "studioAdmin.waiting.grantCta": "Grant Studio access",
  "studioAdmin.waiting.grantLabel": "Grant Studio access to {name}",
  "studioAdmin.waiting.dismissCta": "Dismiss request",
  "studioAdmin.waiting.dismissLabel": "Dismiss the request from {name}",
  "studioAdmin.waiting.dismissConfirm.title":
    "Dismiss the request from {name}?",
  "studioAdmin.waiting.dismissConfirm.body":
    "It leaves this list quietly. {name} gets no message and can ask again.",
  "studioAdmin.waiting.granted":
    "{name} can use Studio now and gets a notification",
  "studioAdmin.waiting.dismissed": "The request from {name} is dismissed",
  "studioAdmin.waiting.grantFailed": "We couldn't grant Studio access",
  "studioAdmin.waiting.dismissFailed": "We couldn't dismiss the request",
  "studioAdmin.waiting.empty": "Nobody is waiting for Studio",
  "studioAdmin.waiting.showMore": "Show more requests",
  "studioAdmin.waiting.loadError": "We couldn't load who is waiting for Studio",
  // ── Early access (2026-10-20) ──────────────────────────────────────────────
  // Per-member access to an unlaunched feature. The admin member drawer
  // section (`earlyAccess.drawer.*`, `earlyAccess.row.*`) and the
  // /admin/early-access roster (`earlyAccess.page.*`, `earlyAccess.roster.*`).
  // `earlyAccess.feature.<key>.*` names each key in EARLY_ACCESS_FEATURE_KEYS.
  "earlyAccess.drawer.title": "Early access",
  "earlyAccess.drawer.hint":
    "Turn on a feature for this member before it launches. They see it the next time they open the app.",
  "earlyAccess.row.on": "Turned on by {staff} on {date}",
  "earlyAccess.row.onNoStaff": "Since {date}",
  "earlyAccess.row.off": "Off",
  "earlyAccess.row.toggleLabel": "{feature} early access",
  "earlyAccess.row.loadFailed": "Couldn't load early access.",
  "earlyAccess.row.retry": "Check again",
  "earlyAccess.row.saveFailed": "Couldn't save early access. Try again.",
  "earlyAccess.feature.quizshow.name": "Pulse Live",
  "earlyAccess.feature.quizshow.description":
    "Hosting live quiz games at events and anywhere else. Playing needs only a code",
  "earlyAccess.page.title": "Early <em>access</em>",
  "earlyAccess.page.subtitle":
    "Members testing features before launch. Admins turn access on from a member's drawer in Members.",
  "earlyAccess.page.empty": "No feature is in early access right now.",
  "earlyAccess.roster.count_one": "{count} member",
  "earlyAccess.roster.count_other": "{count} members",
  "earlyAccess.roster.empty": "No one has early access to {feature} yet.",
  "earlyAccess.roster.emptyCta": "Open Members to turn access on",
  "earlyAccess.roster.grantedBy": "Turned on by {staff} on {date}",
  "earlyAccess.roster.grantedOn": "Since {date}",
  "earlyAccess.roster.capped": "Showing the {limit} most recent of {total}.",
  "earlyAccess.roster.revokeCta": "Revoke access",
  "earlyAccess.roster.revokeTitle": "Revoke early access?",
  "earlyAccess.roster.revokeBody":
    "{name} loses {feature} the next time they open the app.",
  "earlyAccess.roster.revokeConfirm": "Revoke access",
  "earlyAccess.roster.loadFailed": "Couldn't load the list.",
  "earlyAccess.roster.retry": "Check again",
  // ── Pulse Live: reported game (staff tools) ──
  "moderation.quizshowGame.heading": "Reported game",
  "moderation.quizshowGame.body":
    "Ending the game sends every player out. Deleting it removes the game and its questions for good",
  "moderation.quizshowGame.end": "End this game",
  "moderation.quizshowGame.endTitle": "End this game?",
  "moderation.quizshowGame.endBody":
    "Everyone playing is sent out of the game. The game itself stays",
  "moderation.quizshowGame.ended": "Game ended",
  "moderation.quizshowGame.delete": "Delete this game",
  "moderation.quizshowGame.deleteTitle": "Delete this game?",
  "moderation.quizshowGame.deleteBody":
    "Any open lobby ends first, then the game and its questions go for good",
  "moderation.quizshowGame.deleted": "Game deleted",
  "moderation.quizshowGame.gone": "This game is already gone",
  "moderation.quizshowGame.error": "That didn't work. Try again",
  "moderation.action.quizshowGameEnded": "Ended a Pulse Live game",
  "moderation.action.quizshowGameDeleted": "Deleted a Pulse Live game",
  "moderation.action.quizshowTemplatePublished": "Published a quiz template",
  "moderation.action.quizshowTemplateUnpublished":
    "Unpublished a quiz template",
  "moderation.action.quizshowTemplateDeleted": "Deleted a quiz template",
  "governance.audit.actionType.quizshow_game_ended": "Pulse Live game ended",
  "governance.audit.actionType.quizshow_game_deleted":
    "Pulse Live game deleted",
  "governance.audit.actionType.quizshow_template_published":
    "Quiz template published",
  "governance.audit.actionType.quizshow_template_unpublished":
    "Quiz template unpublished",
  "governance.audit.actionType.quizshow_template_deleted":
    "Quiz template deleted",
  "moderation.quizshowGame.reasonLabel": "Reason",
  "moderation.quizshowGame.reasonHint":
    "Saved in the moderation log with this report",
  "moderation.quizshowGame.reasonRequired": "Add a reason first",

  // Staff utilities hub and PDF toolkit (/admin/utilities)
  "utilities.breadcrumb": "Utilities",
  "utilities.hub.title": "<em>Utilities</em>",
  "utilities.hub.eyebrow": "Utilities",
  "utilities.hub.header.title": "Small file jobs, <em>done here</em>",
  "utilities.hub.sub":
    "Tools for everyday file chores. They run in your browser, so your files stay on your device",
  "utilities.hub.listLabel": "Staff tools",
  "utilities.tools.pdf.name": "PDF pages",
  "utilities.tools.pdf.description":
    "Remove, rotate, reorder, merge and split the pages of a PDF",
  "utilities.pdf.title": "PDF <em>pages</em>",
  "utilities.pdf.header.title": "Edit the pages of a <em>PDF</em>",
  "utilities.pdf.sub":
    "Open one PDF or several, then remove, rotate, reorder or split pages and download the result",
  "utilities.pdf.drop.title": "Drop PDFs here or choose files",
  "utilities.pdf.drop.titleTouch": "Choose PDFs to edit",
  "utilities.pdf.drop.choose": "Choose PDFs",
  "utilities.pdf.drop.add": "Add PDFs",
  "utilities.pdf.drop.active": "Drop to open",
  "utilities.pdf.drop.privacy":
    "Files stay on this device and are never uploaded",
  "utilities.pdf.drop.inputLabel": "PDF files",
  "utilities.pdf.drop.opening_one": "Opening {count} file…",
  "utilities.pdf.drop.opening_other": "Opening {count} files…",
  "utilities.pdf.files.heading": "Open files",
  "utilities.pdf.files.pageCount_one": "{count} page",
  "utilities.pdf.files.pageCount_other": "{count} pages",
  "utilities.pdf.files.signedWarning":
    "This PDF is digitally signed. Once you edit it, the signature is no longer valid",
  "utilities.pdf.files.largeWarning":
    "This file is large, so pages can take a moment to appear and saving can be slow",
  "utilities.pdf.errors.notPdf": "{fileName} isn't a PDF file",
  "utilities.pdf.errors.passwordRequired":
    "{fileName} needs a password to open, so it can't be opened here",
  "utilities.pdf.errors.damaged": "{fileName} is damaged and couldn't be read",
  "utilities.pdf.errors.tooLarge":
    "{fileName} is over {limit} MB, too large for your browser to handle",
  "utilities.pdf.errors.unreadable":
    "{fileName} couldn't be read from your device. Check the file is still there and try again",
  "utilities.pdf.errors.decrypterUnavailable":
    "{fileName} has print or copy restrictions, and the part of this tool that opens those couldn't load. Check your connection and try again",
  "utilities.pdf.errors.rendererUnavailable":
    "The page preview part of this tool couldn't load, so {fileName} wasn't opened. Check your connection and try again",
  "utilities.pdf.errors.buildPdf":
    "Building the PDF failed, so nothing was downloaded. Try again",
  "utilities.pdf.errors.buildZip":
    "Building the zip file failed, so nothing was downloaded. Try again",
  "utilities.pdf.errors.dismiss": "Dismiss message",
  "utilities.pdf.grid.label": "Pages",
  "utilities.pdf.grid.keyboardHint":
    "Arrow keys move between pages and Space selects one",
  "utilities.pdf.page.label": "Page {number}",
  "utilities.pdf.page.labelWithFile": "Page {number}, from {fileName}",
  "utilities.pdf.page.thumbnailFailed":
    "Preview unavailable. This page still saves normally",
  "utilities.pdf.page.partLabel": "Part {number}",
  "utilities.pdf.cut.add": "Split after page {number}",
  "utilities.pdf.cut.remove": "Remove the split after page {number}",
  "utilities.pdf.selection.count_one": "{count} page selected",
  "utilities.pdf.selection.count_other": "{count} pages selected",
  "utilities.pdf.selection.hint": "Select pages to rotate, move or remove them",
  "utilities.pdf.selection.selectAll": "Select all pages",
  "utilities.pdf.selection.clear": "Clear selection",
  "utilities.pdf.actions.remove": "Remove pages",
  "utilities.pdf.actions.removeBlocked":
    "Keep at least one page. Unselect a page to remove the rest",
  "utilities.pdf.actions.rotateLeft": "Rotate left",
  "utilities.pdf.actions.rotateRight": "Rotate right",
  "utilities.pdf.actions.moveEarlier": "Move pages earlier",
  "utilities.pdf.actions.moveLater": "Move pages later",
  "utilities.pdf.actions.undo": "Undo edit",
  "utilities.pdf.actions.redo": "Redo edit",
  "utilities.pdf.output.download": "Download PDF",
  "utilities.pdf.output.split": "Split into files",
  "utilities.pdf.output.splitCount_one": "Split into {count} file",
  "utilities.pdf.output.splitCount_other": "Split into {count} files",
  "utilities.pdf.output.splitHint":
    "Add a split between two pages to turn this on",
  "utilities.pdf.output.everyPage": "Download each page as a file",
  "utilities.pdf.output.building": "Building your file…",
  "utilities.pdf.output.startOver": "Start over",
  "utilities.pdf.startOver.title": "Start over?",
  "utilities.pdf.startOver.body":
    "This closes every file and clears your edits. Anything you haven't downloaded is lost",
  "utilities.pdf.startOver.confirm": "Close files and start over",
  "utilities.pdf.startOver.cancel": "Keep editing",
  "utilities.pdf.drag.instructions":
    "Drag a page with a mouse or finger to move it. With a keyboard, select pages and use Move pages earlier or Move pages later",
  "utilities.pdf.drag.start": "Picked up page {number}",
  "utilities.pdf.drag.over": "Page {number} is over position {position}",
  "utilities.pdf.drag.cancel": "Page {number} went back to position {position}",
  "utilities.pdf.announce.removed_one": "{count} page removed",
  "utilities.pdf.announce.removed_other": "{count} pages removed",
  "utilities.pdf.announce.rotated_one": "{count} page rotated",
  "utilities.pdf.announce.rotated_other": "{count} pages rotated",
  "utilities.pdf.announce.moved_one": "{count} page moved",
  "utilities.pdf.announce.moved_other": "{count} pages moved",
  "utilities.pdf.announce.added_one": "{count} page added",
  "utilities.pdf.announce.added_other": "{count} pages added",
  "utilities.pdf.announce.cutAdded": "Split added",
  "utilities.pdf.announce.cutRemoved": "Split removed",
  "utilities.pdf.announce.undone": "Edit undone",
  "utilities.pdf.announce.redone": "Edit redone",
};

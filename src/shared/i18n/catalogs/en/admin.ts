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
  "verifications.loadError": "Couldn't load verifications",
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
  "verifications.requests.drawer.contextEmpty": "They didn't share any context with this request.",
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

  "verifications.requests.toast.approve": "Request approved. The member has been notified.",
  "verifications.requests.toast.reject": "Request rejected. The member has been notified.",
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
  "verifications.requests.bulk.toast.success_other": "{count} requests updated.",
  "verifications.requests.bulk.toast.partial":
    "{succeeded} updated, {failed} skipped.",
  "verifications.requests.bulk.action.approve":
    "Couldn't approve the selected requests",
  "verifications.requests.bulk.action.inReview":
    "Couldn't mark the selected requests in-review",
  "verifications.requests.bulk.action.reject":
    "Couldn't reject the selected requests",

  "verifications.requests.bulk.confirmReject.title_one": "Reject {count} request?",
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
  "common.back": "Back",
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
  // Headline count + subtitle are derived from the real triage backlog
  // (`GET /admin/overview` → triage counts); `{count}` drives pluralization.
  "dashboard.header.titleLine1_one": "{count} thing",
  "dashboard.header.titleLine1_other": "{count} things",
  "dashboard.header.titleLine2_one": "needs <em>a human</em>.",
  "dashboard.header.titleLine2_other": "need <em>a human</em>.",
  "dashboard.header.titleClearLine1": "You're",
  "dashboard.header.titleClearLine2": "all <em>caught up</em>.",
  "dashboard.header.subEmergencies_one":
    "One is flagged as a safety emergency. Start there. Everything else is steady, and you're holding the whole network together.",
  "dashboard.header.subEmergencies_other":
    "{count} are flagged as safety emergencies. Start there. Everything else is steady, and you're holding the whole network together.",
  "dashboard.header.subCalm":
    "Nothing's flagged urgent. Work down the queue at your own pace. You're holding the whole network steady.",
  "dashboard.header.subClear":
    "Every open item has a human decision attached. Go rest. The network's safe in your hands.",
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
  "dashboard.metrics.footGrowth": "+{count} this month · based on account status",
  "dashboard.metrics.footEmergencies_one": "{count} is an emergency",
  "dashboard.metrics.footEmergencies_other": "{count} are emergencies",
  "dashboard.metrics.footSlaTarget": "{hours} SLA target",
  "dashboard.metrics.footNeedsHand_one": "{count} community needs a hand",
  "dashboard.metrics.footNeedsHand_other": "{count} communities need a hand",

  "dashboard.triage.title": "Needs <em>a human</em>",
  "dashboard.triage.sortedToast": "Sorted by urgency",
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
  "dashboard.charts.memberGrowth.sub": "Joined vs churned · with Pride spike",
  "dashboard.charts.memberGrowth.ariaLabel": "Member growth line chart",
  "dashboard.charts.memberGrowth.spike": "Pride",
  "dashboard.charts.legend.joined": "Joined",
  "dashboard.charts.legend.churned": "Churned",
  "dashboard.charts.responseTime.title": "Response time",
  "dashboard.charts.responseTime.sub": "Distribution · this month",
  "dashboard.charts.responseTime.ariaLabel": "Moderation response distribution",
  "dashboard.charts.responseTime.slaLabel": "{hours} SLA",
  "dashboard.charts.legend.withinSla": "Within SLA",
  "dashboard.charts.legend.overSla": "Over {hours}",
  "dashboard.charts.week.last": "last",
  "dashboard.charts.week.this": "this",

  // Shared across any stat tile / chart whose backing metric has no data
  // recorded yet (MRR, median response, response-time distribution, churn).
  "dashboard.notMeasuredYet": "Not measured yet",

  "dashboard.feed.title": "Live activity",
  "dashboard.feed.live": "Live",
  "dashboard.feed.transparency":
    "Every action here is <strong>logged and shown</strong> to the member it affects. No silent removals, ever.",
  "dashboard.feed.auditLinkCta": "See the audit log",

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
  "members.header.exportCta": "Export",
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
  "members.openAriaLabel": "Open {name}",
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
  "members.verify.errorToast":
    "Could not save that decision. Please try again",
  "members.verify.mutualLine": "Named {name} as a mutual",
  "members.verify.noMutual": "No mutual named yet",
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
  "members.verify.source.homepage_hero": "Homepage hero",
  "members.verify.source.homepage_outro": "Homepage closing invite",
  "members.verify.source.members_explainer": "Members explainer",
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
  "members.verify.source.gathering_vouch": "Gathering vouch callout",
  "members.verify.source.family": "Family page",
  "members.verify.source.reading_groups": "Reading groups",
  "members.verify.source.direct": "Opened the invite page directly",
  "members.verify.source.other": "Another page",
  "members.verify.ageAttested": "18+ confirmed {date} · Terms v{version}",
  "members.verify.ageAttestedUnknown": "18+ confirmed · Terms v{version}",
  // Approved: QueerPulse sends no email, so approval reaches the applicant
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
  "members.verify.referenceUnresolved": "Named {email}; no matching member on record",
  "members.verify.waitingDays_one": "Waiting {count} day",
  "members.verify.waitingDays_other": "Waiting {count} days",
  "members.verify.declineReason.spam_pattern": "Looks like spam",
  "members.verify.declineReason.underage": "Under 18",
  "members.verify.declineReason.implausible": "Details don't add up",
  "members.verify.declineReason.safety_concern": "Safety concern",
  "members.verify.declineReason.other": "Other",
  "members.verify.declineModal.title": "Decline {name}'s request?",
  "members.verify.declineModal.body":
    "Pick the closest reason. This isn't shown to the applicant. They'll get a short, generic note instead.",
  "members.verify.declineModal.reasonLabel": "Reason",
  "members.verify.declineModal.reasonPlaceholder": "Choose a reason",
  "members.verify.declineModal.confirmCta": "Decline request",
  "members.verify.waitlistCta": "Waitlist",
  "members.verify.waitlistedToast": "{name} moved to the waitlist",
  "members.verify.waitlistedSectionTitle": "Waitlisted",
  "members.verify.identityReminder":
    "A name, photo, or pronouns aren't grounds to decline on their own.",
  "members.verify.selectAria": "Select {name}'s request",
  "members.verify.bulk.ariaLabel": "Bulk actions",
  "members.verify.bulk.selectedCount_one": "{count} selected",
  "members.verify.bulk.selectedCount_other": "{count} selected",
  "members.verify.bulk.capNote": "Up to {cap} at a time",
  "members.verify.bulk.approveCta": "Approve",
  "members.verify.bulk.waitlistCta": "Waitlist",
  "members.verify.bulk.declineCta": "Decline",
  "members.verify.bulk.clearCta": "Clear",
  "members.verify.bulk.partialFailure_one":
    "{count} request could not be updated",
  "members.verify.bulk.partialFailure_other":
    "{count} requests could not be updated",
  "members.verify.bulk.action.approve": "Approve requests",
  "members.verify.bulk.action.waitlist": "Waitlist requests",
  "members.verify.bulk.action.decline": "Decline requests",
  "members.verify.bulk.confirmDecline.title": "Decline {count} requests?",
  "members.verify.bulk.confirmDecline.body":
    "Pick the closest reason. It applies to all {count} selected requests.",
  "members.verify.bulk.confirmDecline.confirmCta": "Decline all",
  "members.verify.status.approved": "Approved",
  "members.verify.status.declined": "Declined",

  // Quality-sampling tab: a periodic read-only look at past decisions for a
  // second admin to compare notes on. Not a signoff workflow — say so.
  "members.sample.intro":
    "A periodic check on past decisions, so two admins can compare notes.",
  "members.sample.explainer":
    "This shows past decisions for discussion. It doesn't record a second signoff.",
  "members.sample.resampleCta": "Show a different sample",
  "members.sample.decisionLabel": "Decision",
  "members.sample.empty": "No reviewed requests yet to sample.",

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
  "members.role.sectionTitle": "Role & permissions",
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

  // ── Staff roster (/admin/staff) — read-only list of every moderator/admin ─
  "staff.title": "Staff & <em>roles</em>",
  "staff.header.eyebrow": "Who runs QueerPulse",
  "staff.header.sub":
    "Every moderator and admin on the platform. To change someone's role, open their profile in Members.",
  "staff.empty": "Nobody holds a staff role right now.",
  "staff.loadError": "Couldn't load the staff roster.",

  // ── Members: staff roles (additive functional grants, e.g. magazine desk) ─
  "staffRoles.title": "Roles & access",
  "staffRoles.subtitle":
    "Grant functional roles on top of this member's account level.",
  "staffRoles.accountLevelLabel": "Account level",
  "staffRoles.grantsLabel": "Staff roles",
  "staffRoles.magazineEditor.label": "Magazine Editor",
  "staffRoles.magazineEditor.desc":
    "Runs the editorial desk: publish pieces, manage decks, review pitches.",
  "staffRoles.magazineWriter.label": "Magazine Writer",
  "staffRoles.magazineWriter.desc":
    "Drafts and submits pieces for editorial review.",
  "staffRoles.housingModerator.label": "Housing Moderator",
  "staffRoles.housingModerator.desc":
    "Can moderate Housing listings and groups.",
  "staffRoles.adminSuperset": "Admins already have every staff capability.",
  "staffRoles.systemLocked": "System accounts can't hold staff roles.",

  "members.timeline.title": "Moderation history: for & against",
  "members.timeline.auditLinkCta": "Every entry in the audit log",

  "members.sealed.sectionTitle": "Identity & privacy",
  "members.sealed.title": "No prior name is stored",
  "members.sealed.body":
    "QueerPulse keeps no record of anyone's earlier name. That's why nothing shows here. It never appears in a report, in this view, or to any admin. The member alone decides how they're known.",

  "members.message.eyebrow": "Reaching out",
  "members.message.title": "Message <em>{name}</em>",
  "members.message.sendAsLabel": "Send as",
  "members.message.sendAsSelf": "{name} (you)",
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

  // ── Directory listings queue ──────────────────────────────────────────────
  // ── Admin invite oversight (/admin/invites) ──────────────────────────
  "adminInvites.title": "Invite <em>oversight</em>",
  "adminInvites.header.eyebrow": "Trust & safety",
  "adminInvites.header.title": "Every <em>invite</em>",
  "adminInvites.header.sub":
    "The whole vouched-invite graph: who sent what, who accepted, and what's still open. Filter by status to audit the network's edges.",
  "adminInvites.empty": "No invites match this filter yet.",
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
  "adminInvites.quota.manageCta": "Manage invite quotas",
  "adminInvites.quota.modalEyebrow": "Resource limits",
  "adminInvites.quota.modalTitle": "Invite quotas",
  "adminInvites.quota.modalHint":
    "Set how many invites a member can send per month. Leave a field empty and clear it to use the platform default.",
  "adminInvites.quota.sentCount": "{count} sent",
  "adminInvites.quota.fieldLabel": "Monthly quota",
  "adminInvites.quota.defaultPlaceholder": "Default",
  "adminInvites.quota.inputAriaLabel": "Monthly invite quota for {name}",
  "adminInvites.quota.saveCta": "Save",
  "adminInvites.quota.saveAriaLabel": "Save invite quota for {name}",
  "adminInvites.quota.clearCta": "Clear override",
  "adminInvites.quota.clearAriaLabel": "Clear invite quota override for {name}",
  "adminInvites.quota.invalid": "Enter a whole number of 0 or more, or clear the field.",
  "adminInvites.quota.saved": "Saved {name}'s invite quota.",
  "adminInvites.quota.cleared": "{name} is back on the default invite quota.",
  "adminInvites.revoke.cta": "Revoke this invite",
  "adminInvites.revoke.confirmTitle": "Revoke invite {code}?",
  "adminInvites.revoke.confirmBody":
    "The link stops working straight away, and {name} keeps the slot it used from this month's allowance. Whoever holds the link will see it as revoked. This can't be undone, though {name} can send a fresh invite.",
  "adminInvites.revoke.confirmCta": "Revoke invite",
  "adminInvites.revoke.doneToast": "Invite {code} is revoked.",
  "adminInvites.revoke.movedOnToast":
    "That invite has already been accepted, revoked or expired. Reopen the list for its current state.",
  "adminInvites.revoke.failedToast": "Couldn't revoke that invite. Try again.",

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
  "adminChangemakerNominations.header.title": "Who members <em>put forward</em>",
  "adminChangemakerNominations.header.sub":
    "Every name members have nominated for the Change Makers directory, newest first. A shortlist to review.",
  "adminChangemakerNominations.empty": "No nominations yet.",
  "adminChangemakerNominations.error":
    "We couldn't load nominations. Please try again.",
  "adminChangemakerNominations.unknownMember": "A former member",
  "adminChangemakerNominations.row.by": "Nominated by {name}",
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
  "adminReadingGroupProposals.header.title": "Groups members <em>want to start</em>",
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
  "adminReadingGroupProposals.toast.error": "That didn't go through. Please try again.",
  "adminReadingGroupProposals.loadMore": "Load more",
  "adminReadingGroupProposals.loadingMore": "Loading…",

  "adminGuideFeedback.title": "Guide <em>feedback</em>",
  "adminGuideFeedback.header.eyebrow": "Resources",
  "adminGuideFeedback.header.title": "What's actually <em>helping</em>",
  "adminGuideFeedback.header.sub":
    "Every resource guide members have rated helpful or not, worst first.",
  "adminGuideFeedback.empty": "No guide ratings yet.",
  "adminGuideFeedback.error":
    "Couldn't load guide feedback. Please try again.",
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
  "adminConcerns.category.gathering": "Gathering or event",
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

  "adminMagazineSubmissions.title": "Story <em>submissions</em>",
  "adminMagazineSubmissions.header.eyebrow": "Magazine",
  "adminMagazineSubmissions.header.title": "Reader <em>pitches</em>",
  "adminMagazineSubmissions.header.sub":
    "Every story pitch readers have sent the magazine: the working title, format, pitch, and where it sits. Filter by status.",
  "adminMagazineSubmissions.empty":
    "No submissions match this filter yet.",
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
  "adminMagazineSubmissions.row.by": "From {name}",
  "adminMagazineSubmissions.row.sent": "Sent {date}",
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
  "adminWriterApplications.row.by": "From {name}",
  "adminWriterApplications.row.sample": "Sample",
  "adminWriterApplications.row.sampleLink": "Linked sample",
  "adminWriterApplications.row.approveCta": "Approve",
  "adminWriterApplications.row.declineCta": "Decline",
  "adminWriterApplications.row.reviewNotePlaceholder": "Optional note to the applicant",
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
  "adminListings.filter.all": "All",
  "adminListings.filter.review": "In review",
  "adminListings.filter.question": "Quick question",
  "adminListings.filter.live": "Live",
  "adminListings.filter.ariaLabel": "Filter by status",
  "adminListings.filter.countedLabel": "{label} ({count})",
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
  "adminListings.preview.sub":
    "Exactly how this listing will look once it's live in the directory.",
  "adminListings.ask.eyebrow": "Ask a question",
  "adminListings.ask.title": "Ask about {name}",
  "adminListings.ask.sub": "We'll send this to {name} as a message.",
  "adminListings.ask.label": "Your question",
  "adminListings.ask.helper":
    "Keep it warm and specific. They'll get it as a direct message and can reply right there.",
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
  "adminListings.remove.cta": "Remove",
  "adminListings.actions.moreAriaLabel": "More actions for {name}",
  "adminListings.remove.confirm.title": "Remove {name}?",
  "adminListings.remove.confirm.body":
    "This permanently deletes the listing and can't be undone. The submitter won't be notified.",
  "adminListings.remove.confirm.liveWarning":
    "This listing is live. Removing it also takes it off the public directory immediately.",
  "adminListings.remove.confirm.confirmCta": "Remove listing",
  "adminListings.remove.toast.removed": "{name} was removed.",
  "adminListings.loadMoreCta": "Load more",
  "adminListings.selectAll.ariaLabel": "Select all visible listings",
  "adminListings.selectAll.label": "Select all visible",
  "adminListings.selectRow.ariaLabel": "Select {name}",
  "adminListings.bulk.ariaLabel": "Bulk actions",
  "adminListings.bulk.selectedCount_one": "{count} selected",
  "adminListings.bulk.selectedCount_other": "{count} selected",
  "adminListings.bulk.publishCta": "Publish live",
  "adminListings.bulk.sendBackCta": "Send back to review",
  "adminListings.bulk.removeCta": "Remove",
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
  "adminListings.remove.confirm.reasonLabel": "Reason (optional)",
  "adminListings.remove.confirm.reasonPlaceholder":
    "Add a note for the record…",
  "adminListings.sendBack.confirm.title": "Send {name} back to review?",
  "adminListings.sendBack.confirm.body":
    "{name} moves back into the review queue. Add a quick note if it helps the next pass.",
  "adminListings.sendBack.confirm.reasonLabel": "Reason (optional)",
  "adminListings.sendBack.confirm.reasonPlaceholder":
    "What needs another look…",
  "adminListings.sendBack.confirm.confirmCta": "Send back to review",
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
  "adminListings.history.askedBy": "Asked by {actor}",
  "adminListings.history.awaitingReply": "Awaiting reply",

  // ── Uploaded images (admin media console) ────────────────────────────────
  "media.title": "Uploaded <em>images</em>",
  "media.header.eyebrow": "Security tooling",
  "media.header.title": "Uploaded <em>images</em>",
  "media.header.sub":
    "Every object stored in the platform's upload bucket, with per-file owner and storage details for security review.",
  "media.filterAriaLabel": "Filter by upload kind",
  "media.kinds.all": "All",
  "media.kinds.avatars": "Avatars",
  "media.kinds.work": "Work images",
  "media.kinds.story-covers": "Story covers",
  "media.kinds.persona-covers": "Persona banners",
  "media.kinds.gathering-photos": "Gathering photos",
  "media.kinds.group-avatars": "Group avatars",
  "media.kinds.listing-photos": "Listing photos",
  "media.unowned": "Unowned",
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
    "This removes the stored file from the bucket for good. If a profile, listing, or post still points at it, that image will stop loading. This can't be undone.",
  "media.delete.confirmBodyInUse_one":
    "This file is still referenced in {count} place, listed below. Deleting it now will break that image. It'll stop loading. This can't be undone.",
  "media.delete.confirmBodyInUse_other":
    "This file is still referenced in {count} places, listed below. Deleting it now will break those images. They'll stop loading. This can't be undone.",
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
    "Uploaded images come from the live storage bucket, so there is nothing to show in demo mode.",
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
  "editSuggestions.field.hours": "Hours",
  "editSuggestions.field.address": "Address",
  "editSuggestions.field.phone": "Phone number",
  "editSuggestions.field.website": "Website",
  "editSuggestions.field.description": "Description",
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
  "moderation.reportDrawer.accountActionsHidden":
    "Restrict and ban aren't shown here because this report is about content, not a member account. Use hide, remove, warn or dismiss instead.",
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
  "moderation.appealDrawer.viewOriginalCta":
    "View the original report & thread",
  "moderation.appealDrawer.originalContentTitle": "What was originally reported",
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
  "moderation.actions.shield.label": "Shield member",
  "moderation.actions.shield.desc": "Protect the person reported about",
  "moderation.actions.shield.done": "shielded",
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
  "moderation.reporterCredibility.new": "New reporter",
  "moderation.reporterCredibility.history": "{filed} filed · {dismissed} dismissed",
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
  "communities.grid.healthAriaLabel": "Health {score}, see breakdown",
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
  "communities.settings.addModToast": "Search members to add as moderator",
  "communities.settings.modRemovedToast": "Removed {name} as moderator",
  // Live moderator management (add/remove). Demo keeps its simulated
  // local-state behaviour; live wires both controls to the real
  // `/admin/communities/:slug/moderators` endpoints.
  "communities.settings.mod.addPickerTitle": "Add a moderator",
  "communities.settings.mod.pickerLoading": "Loading members…",
  "communities.settings.mod.pickerError": "Couldn't load members. Try again.",
  "communities.settings.mod.pickerEmpty":
    "Every member here is already a moderator.",
  "communities.settings.mod.addedToast": "{name} is now a moderator",
  "communities.settings.mod.addFailedToast":
    "Couldn't add {name} as a moderator",
  "communities.settings.mod.removeFailedToast":
    "Couldn't remove {name} as a moderator",
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
  "communities.settings.overrides.unarchiveToast": "{name} is no longer archived",
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
  "communities.settings.overrides.reassignTitle": "Reassign ownership of {name}",
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
  "communities.governanceLog.action.owner_auto_promoted":
    "Owner auto-promoted",
  "communities.governanceLog.action.frozen": "Frozen",
  "communities.governanceLog.action.unfrozen": "Unfrozen",
  "communities.governanceLog.action.archived": "Archived",
  "communities.governanceLog.action.unarchived": "Unarchived",
  "communities.governanceLog.action.settings_changed": "Settings changed",

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
  "communities.governanceLog.meta.field.accessTier": "Who can join",
  "communities.governanceLog.meta.field.rosterVisible": "Roster visible",
  "communities.governanceLog.meta.field.features": "Features",
  "communities.governanceLog.meta.field.rules": "Rules",
  "communities.governanceLog.meta.field.tags": "Tags",
  "communities.governanceLog.meta.field.coverImageUrl": "Cover image",

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
  "communities.support.withdrawnToast": "Support request withdrawn",
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
  "governance.header.publishComingSoonToast":
    "Publishing transparency reports isn't available yet.",
  "governance.tabs.finances": "Finances",
  "governance.tabs.policy": "Policy & versions",
  "governance.tabs.proposals": "Proposals",
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
    "Council-seat removals and funding-policy changes are decided by member vote, not admin fiat. Open a proposal here; members vote on the public Governance page.",
  "governance.proposals.createCta": "New proposal",
  "governance.proposals.empty": "No proposal has been opened yet.",
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

  "governance.finances.stat.sustainerMrr": "Sustainer MRR",
  "governance.finances.stat.totalIncome": "Total monthly income",
  "governance.finances.stat.surplus": "Monthly surplus",
  "governance.finances.stat.solidarity": "On solidarity access",
  "governance.finances.foot.sustainersCount": "{count} members chip in monthly",
  "governance.finances.foot.sources": "Sustainers, grants & one-offs",
  "governance.finances.foot.reserve": "Held in the community reserve",
  "governance.finances.foot.solidarityRate": "Members on free or reduced rate",
  "governance.finances.empty":
    "No published finance report yet. Figures will appear here once one is published.",

  "governance.finances.provenance.seeded": "Unverified",
  "governance.finances.provenance.manual": "Edited",
  "governance.finances.provenance.computed": "Computed",
  "governance.finances.provenance.seeded.hint":
    "Seeded placeholder. Not yet checked against real figures.",
  "governance.finances.provenance.manual.hint":
    "Entered by an admin. {editor} on {date}.",
  "governance.finances.provenance.manual.hintPlain": "Entered by an admin.",
  "governance.finances.provenance.computed.hint":
    "Calculated from income minus spending. Not edited directly.",
  "governance.finances.provenance.notVerifiedCta": "Not verified · Edit",
  "governance.finances.edit.cta": "Edit figures",
  "governance.finances.edit.lastEdited": "Last corrected by {name} on {date}",
  "governance.finances.edit.neverEdited":
    "No figure has been corrected yet. Every value is seeded.",
  "governance.finances.edit.eyebrow": "Finances",
  "governance.finances.edit.title": "Correct the <em>figures</em>",
  "governance.finances.edit.sub":
    "These figures are reported by QueerPulse each quarter and reviewed by the finance team, and entered by hand. Fix any number that's wrong; every change is recorded and marked as admin-entered.",
  "governance.finances.edit.section.headline": "Headline figures",
  "governance.finances.edit.section.income": "Income lines",
  "governance.finances.edit.section.spend": "Spending lines",
  "governance.finances.edit.section.note": "Reason (optional)",
  "governance.finances.edit.field.mrr": "Sustainer MRR (€)",
  "governance.finances.edit.field.sustainerCount": "Sustainer count",
  "governance.finances.edit.field.solidarityRate": "Solidarity access (%)",
  "governance.finances.edit.field.incomeTotal": "Total monthly income (€)",
  "governance.finances.edit.field.expenseTotal": "Total monthly spending (€)",
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

  "governance.ledger.moderatorHonoraria": "Moderator honoraria",
  "governance.ledger.platformTools": "Platform & tools",
  "governance.ledger.mutualAid": "Mutual aid & micro-grants",
  "governance.ledger.mentalHealth": "Mental health fund",
  "governance.ledger.magazine": "Magazine production",
  "governance.ledger.memberSustainers": "Member sustainers",
  "governance.ledger.partnerGrants": "Partner grants",
  "governance.ledger.gatheringTickets": "Gathering tickets",

  "governance.income.title": "Where it <em>comes from</em>",
  "governance.income.sub": "{amount} / month, in from three honest places.",
  "governance.income.note":
    "No advertising. No data sales. No venture money. <strong>Two-thirds comes straight from members.</strong>",
  "governance.spend.title": "Where it <em>goes</em>",
  "governance.spend.sub":
    "{amount} / month: every euro accounted for, line by line.",

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
  "governance.mrrPanel.breakdown.care": "Care",
  "governance.mrrPanel.breakdown.platform": "Platform",
  "governance.mrrPanel.breakdown.mutualAid": "Mutual aid",
  "governance.mrrPanel.breakdown.health": "Health",
  "governance.mrrPanel.breakdown.magazine": "Magazine",
  "governance.mrrPanel.readCta": "Read the constitution",

  "governance.policy.versionsTitle": "Policy <em>decision log</em>",
  "governance.policy.versionsSub":
    "Every change to how we keep each other safe, dated and open.",
  "governance.policy.seeDiffCta": "See what changed",
  "governance.policy.principlesTitle": "Our <em>principles</em>",
  "governance.policy.transparencyNote":
    "Policy changes are proposed in the open and ratified at the community assembly. Anyone can read the full edit history. Nothing here is decided behind closed doors.",
  "governance.policy.principle.noSell": "We will never sell member data.",
  "governance.policy.principle.visibility":
    "Visibility is always the member's choice.",
  "governance.policy.principle.noSilent":
    "No silent removals. Every action carries a reason.",
  "governance.policy.principle.accessNeverConditional":
    "Access is never conditional on ability to pay.",

  "governance.diff.eyebrow": "Policy change",
  "governance.diff.title": "v4.1 → <em>v4.2</em>",
  "governance.diff.closeCta": "Close",
  "governance.diff.readFullCta": "Read full v4.2",
  "governance.diff.introTitle": "Section 3: Harm we treat as urgent.",
  "governance.diff.introDate": "Ratified 12 Jun 2026, 89% in favour.",
  "governance.diff.note":
    "Proposed by the Trans & Friends moderators · voted on by the whole community at the Annual Assembly.",

  "governance.audit.title": "Every action, <em>on the record</em>",
  "governance.audit.metaZero": "No entries match these filters.",
  "governance.audit.metaMatch": "{count} entries",
  "governance.audit.exportToast": "Exported {total} entries as CSV",
  // Live mode (P3-8): export streams a real CSV honouring the current filters.
  "governance.audit.exportError":
    "Couldn't export the audit log. Please try again.",
  // Retained for compatibility; live no longer disables the export button.
  "governance.audit.exportComingSoonToast":
    "Exporting the audit log isn't available yet.",
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
  "governance.audit.range.today": "Today",
  "governance.audit.range.week": "This week",
  "governance.audit.range.quarter": "This quarter",
  "governance.audit.emptyTitle": "No entries match",
  "governance.audit.emptyText":
    "No moderation actions match these filters yet. Try widening them.",
  "governance.audit.pagerMeta": "Showing {start}–{end} of {total} entries",
  "governance.audit.pagerMatch": " ({count} match)",
  "governance.audit.prevPage": "Previous page",
  "governance.audit.nextPage": "Next page",
  "governance.audit.entryModal.eyebrow": "Audit entry",
  "governance.audit.entryModal.actedWhen": "acted {when}",
  "governance.audit.entryModal.openLinkCta": "Open {label}",
  "governance.audit.entryModal.subject": "Subject",
  "governance.audit.entryModal.reasonGiven": "Reason given to the member",
  "governance.audit.entryModal.note":
    "The affected member was shown this reason and given the right to appeal. This entry can never be edited or deleted.",

  // ── Partner applications ──────────────────────────────────────────────────
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
  "modPanel.requests.emptyTitle": "No requests waiting",
  "modPanel.requests.emptyDesc":
    "You're all caught up. New requests will appear here.",
  "modPanel.requests.requestedAgo": "Requested {time} ago",
  "modPanel.requests.approveCta": "Approve",
  "modPanel.requests.declineCta": "Decline",
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
  "vouchGraph.modes.scenes": "Scenes",
  "vouchGraph.modes.safety": "Safety",
  "vouchGraph.pathbar.stepPath_one": "{count}-step trust path:",
  "vouchGraph.pathbar.stepPath_other": "{count}-step trust path:",
  "vouchGraph.pathbar.noPath": "No trust path between {a} and {b}",
  "vouchGraph.pathbar.fromHint":
    "Path from {name}. Shift-click a second person",
  "vouchGraph.pathbar.clear": "clear",

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
  "vouchGraph.modal.searchPlaceholder": "Find a member…",
  "vouchGraph.modal.searchAriaLabel": "Find a member",
  "vouchGraph.modal.replayCta": "Replay",
  "vouchGraph.modal.replayStart": "Before anyone connected",
  "vouchGraph.modal.timeCutAriaLabel": "Connection timeline",
  "vouchGraph.modal.verifyToast": "{name} is verified.",
  "vouchGraph.modal.verifyFailedToast":
    "That didn't save. Check your connection and try again.",
  "vouchGraph.modal.privateToast": "This member keeps their network private",
  "vouchGraph.modal.loadingTitle": "Loading trust network…",
  "vouchGraph.modal.emptyTitle": "No trust network yet",
  "vouchGraph.modal.emptyBody": "This member doesn't have any vouches on record.",
  "vouchGraph.modal.truncatedNotice":
    "Showing the 500 most recent members. Search above to find someone older.",
  "vouchGraph.memberFinder.placeholder": "Search all members…",
  "vouchGraph.memberFinder.ariaLabel": "Search all members",
  "vouchGraph.memberFinder.empty": "No members found.",

  "vouchGraph.inspector.emptyTitle": "Pick anyone",
  "vouchGraph.inspector.emptyBody":
    "Click a node to read who trusts them and what that trust is built on. Double-click to walk the network from there.",
  "vouchGraph.inspector.sealed": "Legacy identity sealed, chosen name only",
  "vouchGraph.inspector.ringBanner.title": "Part of a suspected vouch ring",
  "vouchGraph.inspector.ringBanner.body":
    "Five accounts created within an hour, vouching only for each other: a closed loop with no outside trust.",
  "vouchGraph.inspector.isolationBanner.title": "Trust isolation",
  "vouchGraph.inspector.isolationBanner.body":
    "Every vouch this member holds comes from new or flagged accounts. Verify with extra care.",
  "vouchGraph.inspector.reportsBanner.title_one": "{count} report on record",
  "vouchGraph.inspector.reportsBanner.title_other": "{count} reports on record",
  "vouchGraph.inspector.reportsBanner.body":
    "Open the member's moderation history before acting.",
  "vouchGraph.inspector.reportsBanner.viewCta": "View in moderation queue",
  "vouchGraph.inspector.privateBanner.title": "Network kept private",
  "vouchGraph.inspector.privateBanner.body":
    "This member has chosen to hide their vouch graph. Respect it. Don't work around it.",
  "vouchGraph.inspector.anonBanner.title": "Identity shielded",
  "vouchGraph.inspector.anonBanner.body":
    "An anonymous voucher. Their identity is protected and cannot be revealed.",
  "vouchGraph.inspector.vouchesIn": "vouches in",
  "vouchGraph.inspector.vouchesOut": "vouches out",
  "vouchGraph.inspector.joined": "joined",
  "vouchGraph.inspector.vouchedForBy": "Vouched for by",
  "vouchGraph.inspector.hasVouchedFor": "Has vouched for",
  "vouchGraph.inspector.withdrawn": "Withdrawn",
  "vouchGraph.inspector.none": "None yet.",
  "vouchGraph.inspector.mutualTag": "mutual",
  "vouchGraph.inspector.affectedTitle": "If you removed {name}",
  "vouchGraph.inspector.affectedCount_one":
    "{count} member would lose a vouch from them.",
  "vouchGraph.inspector.affectedCount_other":
    "{count} members would lose a vouch from them.",
  "vouchGraph.inspector.affectedPendingNote":
    " Including pending members who rely on it.",
  "vouchGraph.inspector.ownVouchesStay_one":
    "Their own {count} vouch stays valid. Weigh the human cost before acting.",
  "vouchGraph.inspector.ownVouchesStay_other":
    "Their own {count} vouches stay valid. Weigh the human cost before acting.",
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

  "vouchGraph.graph.ariaLabel":
    "Vouch network: {count} people connected to {initials}",
  "vouchGraph.preview.ariaLabel_one":
    "Trust network for {name}: {count} direct vouch connection",
  "vouchGraph.preview.ariaLabel_other":
    "Trust network for {name}: {count} direct vouch connections",
  "vouchGraph.preview.legend.inbound": "Trusts them",
  "vouchGraph.preview.legend.outbound": "They vouch for",
  "vouchGraph.preview.legend.mutual": "Mutual",

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
  "settings.saved": "Settings saved.",
  "settings.saveError": "Couldn’t save that. Nothing was changed.",

  "settings.history.title": "Recent changes",
  "settings.history.empty": "No changes yet.",
  "settings.history.error": "Couldn’t load recent changes.",
  "settings.history.by": "by {actor}",
  "settings.history.unknownActor": "a deleted admin",
  "settings.history.on": "on",
  "settings.history.off": "off",
  "settings.history.cleared": "cleared",
  "settings.history.changed": "{setting}: {from} → {to}",

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
  "orgTier.ctaOption.toast": "Toast: informational only",
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
  "housingGroups.listings.error": "Couldn't update that listing",

  // ── Roadmap (/admin/roadmap) — board, idea queue, hero stats ───────────────
  "roadmap.title": "Roadmap · <em>what's next</em>",
  "roadmap.header.eyebrow": "Roadmap",
  "roadmap.header.title": "Shape the <em>roadmap</em>",
  "roadmap.header.sub":
    "Manage the shipped/building/planned board, triage member ideas, and edit the public page's hero stats.",
  "roadmap.loading": "Loading the roadmap…",
  "roadmap.tabs.board": "Board",
  "roadmap.tabs.ideas": "Ideas",
  "roadmap.tabs.heroStats": "Hero stats",

  // AdminRoadmapBoard.tsx, AdminRoadmapItemRow.tsx, AdminRoadmapItemModal.tsx,
  // AdminRoadmapItemModalFields.tsx — the shipped/building/planned kanban.
  "roadmap.board.column.shipped": "Shipped",
  "roadmap.board.column.building": "Building now",
  "roadmap.board.column.planned": "Planned",
  "roadmap.board.empty": "Nothing in this column yet.",
  "roadmap.board.addItemCta": "Add item",
  "roadmap.board.toast.removed": "{name} removed from the roadmap.",
  "roadmap.board.toast.updated": "{name} saved.",
  "roadmap.board.toast.created": "{name} added to the roadmap.",
  "roadmap.board.delete.title": "Remove {name}?",
  "roadmap.board.delete.body":
    "This takes it off the roadmap for good. Members won't see it in any column anymore.",
  "roadmap.board.delete.confirmCta": "Remove item",
  "roadmap.board.modal.createEyebrow": "New item",
  "roadmap.board.modal.editEyebrow": "Edit item",
  "roadmap.board.modal.createTitle": "Add a roadmap item",
  "roadmap.board.modal.createCta": "Add item",
  "roadmap.board.field.column": "Column",
  "roadmap.board.field.category": "Category",
  "roadmap.board.field.name": "Name",
  "roadmap.board.field.description": "Description",
  "roadmap.board.field.date": "Date",
  "roadmap.board.field.date.placeholder": "e.g. July 2026",
  "roadmap.board.field.requested.title": "Member requested",
  "roadmap.board.field.requested.sub":
    'Shows a "Member requested" tag on the public card.',
  "roadmap.board.field.stage": "Stage",
  "roadmap.board.field.stage.placeholder": "e.g. In design",
  "roadmap.board.field.eta": "ETA",
  "roadmap.board.field.eta.placeholder": "e.g. Q4 2026",
  "roadmap.board.field.progress": "Progress (%)",
  "roadmap.board.field.votes": "Starting votes",
  "roadmap.board.field.hot.title": "Most wanted",
  "roadmap.board.field.hot.sub":
    "Highlights this item as most wanted on the public page.",
  "roadmap.board.item.etaLabel": "ETA {eta}",
  "roadmap.board.item.progressLabel": "{progress}% done",
  "roadmap.board.item.votesLabel": "{votes} votes",
  "roadmap.board.item.liveVotesLabel": "{count} live",
  "roadmap.board.item.moveUpAriaLabel": "Move {name} up",
  "roadmap.board.item.moveDownAriaLabel": "Move {name} down",
  "roadmap.board.item.requestedTag": "Member requested",
  "roadmap.board.item.hotTag": "Most wanted",

  // AdminRoadmapIdeasQueue.tsx, AdminRoadmapIdeaRows.tsx — member-submitted
  // idea triage + the published Top-ideas list the public page reads.
  "roadmap.ideas.pending.title": "Pending review",
  "roadmap.ideas.pending.empty": "Nothing waiting. Every idea's been triaged.",
  "roadmap.ideas.published.title": "Published",
  "roadmap.ideas.published.empty": "Nothing published yet.",
  "roadmap.ideas.fromMemberTag": "From a member",
  "roadmap.ideas.submittedLabel": "Submitted {date}",
  "roadmap.ideas.promoteCta": "Promote",
  "roadmap.ideas.dismissCta": "Dismiss",
  "roadmap.ideas.addPlaceholder": "Add an idea to the published list…",
  "roadmap.ideas.addAriaLabel": "New idea text",
  "roadmap.ideas.addCta": "Add idea",
  "roadmap.ideas.moveUpAriaLabel": 'Move "{text}" up',
  "roadmap.ideas.moveDownAriaLabel": 'Move "{text}" down',
  "roadmap.ideas.editAriaLabel": 'Edit "{text}"',
  "roadmap.ideas.tallyLabel_one": "{count} vote",
  "roadmap.ideas.tallyLabel_other": "{count} votes",
  "roadmap.ideas.toast.promoted": "Idea promoted to the published list.",
  "roadmap.ideas.toast.dismissed": "Idea dismissed.",
  "roadmap.ideas.toast.removed": "Idea removed.",
  "roadmap.ideas.toast.updated": "Idea saved.",
  "roadmap.ideas.toast.added": "Idea added.",
  // Shared confirm dialog (IdeaQueueConfirmModal) — `kind` is "dismiss" or
  // "delete", interpolated into the key (`roadmap.ideas.${kind}.*`).
  "roadmap.ideas.dismiss.title": "Dismiss this idea?",
  "roadmap.ideas.dismiss.body":
    "It moves out of the pending queue without being published. The member who submitted it won't be notified.",
  "roadmap.ideas.dismiss.confirmCta": "Dismiss idea",
  "roadmap.ideas.delete.title": "Remove this idea?",
  "roadmap.ideas.delete.body":
    "This takes it off the public roadmap page for good.",
  "roadmap.ideas.delete.confirmCta": "Remove idea",

  // AdminRoadmapHeroStats.tsx — editable chip row for the public page's hero.
  "roadmap.heroStats.empty":
    "No stat chips yet. Add one below or auto-fill from item counts.",
  "roadmap.heroStats.autofillCta": "Auto-fill from item counts",
  "roadmap.heroStats.addCta": "Add stat",
  "roadmap.heroStats.removeRowCta": "Remove",
  "roadmap.heroStats.labelPlaceholder": "e.g. 12 shipped this year",
  "roadmap.heroStats.labelAriaLabel": "Stat label",
  "roadmap.heroStats.moveUpAriaLabel": "Move stat up",
  "roadmap.heroStats.moveDownAriaLabel": "Move stat down",
  "roadmap.heroStats.jadeToggle.title": "Highlight in jade",
  "roadmap.heroStats.toast.saved": "Hero stats saved.",
  // Auto-fill labels — the labels are rendered with a { count } so i18next
  // resolves the plural form; English doesn't inflect these, so the _one and
  // _other forms carry identical copy (the PT catalog inflects them). "building"
  // stays a single bare key since "in progress" reads the same at any count.
  "roadmap.heroStats.autofill.shipped_one": "{count} shipped",
  "roadmap.heroStats.autofill.shipped_other": "{count} shipped",
  "roadmap.heroStats.autofill.building": "{count} in progress",
  "roadmap.heroStats.autofill.planned_one": "{count} planned",
  "roadmap.heroStats.autofill.planned_other": "{count} planned",

  // ═══════════════════════════════════════════════════════════════════════
  // Roadmap redesign (9-view board, deep drawer, saved views, modals).
  // Additive: the flat roadmap.board.*/roadmap.ideas.*/roadmap.heroStats.*
  // keys above stay in place for the current 3-tab UI until it's migrated;
  // everything below is scoped to the new views under fresh sub-paths so
  // neither set collides with or silently reads from the other.
  // ═══════════════════════════════════════════════════════════════════════

  // ── Category taxonomy — shared across board/toolbar/drawer/capacity/etc ───
  "roadmap.categories.resources": "Resources",
  "roadmap.categories.gatherings": "Gatherings",
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

  // ── Tabs — 9 views. tabs.board/tabs.heroStats above already carry the
  // right copy and are reused as-is; the rest are new.
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
  "roadmap.board.column.subtitle.planned": "Committed, not started",
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
  "roadmap.drawer.field.scope": "Scope",
  "roadmap.drawer.field.scopeAll": "All communities",
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
  "roadmap.drawer.commitment.promiseToggle.title":
    "This is a firm promise",
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
  "roadmap.drawer.blocked.note": "shown publicly. Blockers are not embarrassing",
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
  "roadmap.drawer.votes.notifyCta_other": "Notify the {count} people who asked…",

  // Drawer · Comments section
  "roadmap.drawer.comments.title": "Comments",
  "roadmap.drawer.comments.empty": "No comments yet.",
  "roadmap.drawer.comments.hideCta": "Hide",
  "roadmap.drawer.comments.unhideCta": "Unhide",
  "roadmap.drawer.comments.hiddenStatus": "Hidden",

  // Drawer · Internal notes / Public one-liner
  "roadmap.drawer.internalNotes.title": "Internal notes",
  "roadmap.drawer.internalNotes.note": "never public",
  "roadmap.drawer.internalNotes.placeholder":
    "Scope, dependencies, what would make us drop it.",
  "roadmap.drawer.publicOneLiner.title": "Public one-liner",
  "roadmap.drawer.publicOneLiner.note": "shown on /roadmap",
  "roadmap.drawer.publicOneLiner.placeholder":
    "Plain, warm, no roadmap-speak.",

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
  "roadmap.modals.safetyGate.title": "This needs a <em>safety review</em> first",
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
  "roadmap.capacityView.atOnceTag": "{count} at once",
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
  "roadmap.ideasView.voteSpike": "Vote spike: {votes} votes in {hours}h",
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

  // ── Hero stats view (redesign's editor — see note above roadmap.heroStats.*
  // for why this is a separate group from the current 3-tab editor) ───────
  "roadmap.heroStatsView.title": "Public <em>hero stats</em>",
  "roadmap.heroStatsView.previewLinkCta": "Preview public page",
  "roadmap.heroStatsView.subtitle":
    "These four numbers sit at the top of the member-facing roadmap. Keep them honest. If a number needs a caveat, write it in the note and it shows as a tooltip.",
  "roadmap.heroStatsView.captionPlaceholder": "Caveat / how it is counted",
  "roadmap.heroStatsView.noGrowthTheatre":
    "No growth theatre. We publish counts and leave out follower numbers and vanity graphs. Any stat that cannot be explained in one line does not belong here.",

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
    "The changelog. Every one of these was asked for by someone in the room.",
  "roadmap.publicPreview.notBuildingHeading": "Not building this, and why",
  "roadmap.publicPreview.notBuildingSub":
    "The list most platforms hide. If we say no, you get a reason.",
  "roadmap.publicPreview.requestedTag": "You asked for this",
  "roadmap.publicPreview.committedTag": "Committed",
  "roadmap.publicPreview.noPublicNoteFallback":
    "No public note yet. Members won't see anything here until you add one.",
  "roadmap.publicPreview.movedOnce": "Moved once: {from} → {to}.",
  "roadmap.publicPreview.movedMultiple": "Moved {count}×: {from} → {to}.",
  "roadmap.publicPreview.blockedNote": "Blocked on {by}.",
  "roadmap.publicPreview.noDateHonest": "No date, honestly",
  "roadmap.publicPreview.liveLabel": "Live",
  "roadmap.publicPreview.editItemTooltip": "Edit this item",
  "roadmap.publicPreview.copyPermalinkTooltip": "Copy permalink",
  "roadmap.publicPreview.subscribeHeading": "Get told when this changes",
  "roadmap.publicPreview.subscribeBody":
    "One email a month with what shipped, what moved and what we said no to. No product marketing, ever.",
  "roadmap.publicPreview.subscribeEmailPlaceholder": "you@email.com",
  "roadmap.publicPreview.subscribeCta": "Subscribe",
  "roadmap.publicPreview.rssCta": "RSS",

  // ── Toasts — feedback for every mutating action ────────────────────────
  "roadmap.toasts.moved": '"{name}" moved to {column}',
  "roadmap.toasts.bulkMoved_one": "{count} item moved to {column}",
  "roadmap.toasts.bulkMoved_other": "{count} items moved to {column}",
  "roadmap.toasts.published": "Now visible on the public roadmap",
  "roadmap.toasts.hidden": "Hidden from the public roadmap",
  "roadmap.toasts.duplicated": "Duplicated.",
  "roadmap.toasts.bulkPublished_one": "{count} item shown on the public roadmap",
  "roadmap.toasts.bulkPublished_other":
    "{count} items shown on the public roadmap",
  "roadmap.toasts.bulkHidden_one": "{count} item hidden from the public roadmap",
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
    'Merged. {votes} vote moved, and {name} was told where it went',
  "roadmap.toasts.merged_other":
    'Merged. {votes} votes moved, and {name} was told where it went',
  "roadmap.toasts.promoted_one": '"{name}" promoted. {votes} voter notified',
  "roadmap.toasts.promoted_other":
    '"{name}" promoted. {votes} voters notified',
  "roadmap.toasts.promoteError": "Couldn't promote that idea",
  "roadmap.toasts.declined": "Declined publicly with a reason. {name} was told",
  "roadmap.toasts.reopened": '"{name}" is back in the ideas queue',
  "roadmap.toasts.reopenError": "Couldn't reopen that idea",
  "roadmap.toasts.notified_one":
    "{count} voter notified. One email, no follow-ups",
  "roadmap.toasts.notified_other":
    "{count} voters notified. One email, no follow-ups",
  "roadmap.toasts.digestCopied":
    "Digest copied. Paste it into the monthly email",
  "roadmap.toasts.permalinkCopied": "Copied {url}",
  "roadmap.toasts.rssInfo": "RSS: {url}",
  "roadmap.toasts.auditExported": "Audit log exported for governance",
  "roadmap.toasts.boardReset": "Board reset to the seeded roadmap",
  "roadmap.toasts.safetyReviewNeededInfo_one":
    "{count} item needs a safety review first",
  "roadmap.toasts.safetyReviewNeededInfo_other":
    "{count} items need a safety review first",

  // ── Landing page (/admin/landing) ───────────────────────────────────────
  "landing.header.eyebrow": "Live site",
  "landing.header.sub": "Curate the sections signed-out visitors see on the homepage.",

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
  "landing.list.unknownTarget": "This profile no longer exists",
  "landing.list.empty.member.title": "No members featured yet",
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
    "This takes them off the live homepage. You can feature them again anytime.",
  "landing.remove.confirm": "Remove",
  "landing.remove.toast": "Removed from the homepage",
  "landing.remove.error": "Couldn't remove. Try again",

  // Backend-classified `hiddenReason` on an already-featured slot — see
  // `landingFeatures.adapters.ts`'s `HIDDEN_REASON_KEY`.
  "landing.hidden.consent_revoked": "Hidden: consent withdrawn",
  "landing.hidden.went_private": "Hidden: profile went private",
  "landing.hidden.unpublished": "Hidden: unpublished",
  "landing.hidden.not_public": "Hidden: no longer public",
  "landing.hidden.deleted": "Hidden: profile deleted",

  // ── Live homepage preview (AdminLandingPreview) ─────────────────────────
  "landing.preview.eyebrow": "Homepage preview",
  "landing.preview.note":
    "How this section looks on the signed-out homepage. It updates as you edit.",
  "landing.preview.loading": "Building the preview…",
  "landing.preview.empty":
    "Nothing featured here yet. Add someone on the left to see the homepage preview.",
  "landing.preview.pendingTitle": "Added, details still loading",
  "landing.preview.pendingNote":
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
  "pressKit.fields.metaHelper": "Byline, length or format: shown under the headline.",
  "pressKit.fields.metaPlaceholder": "e.g. Long-form feature · by Ana Sá Lopes",
  "pressKit.fields.url": "Link",
  "pressKit.fields.urlHelper": "Optional: leave blank if there's no online version.",
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
  "housing.risk.title": "Risk score",
  "housing.risk.reasonsLabel": "Why it's flagged",
  "housing.risk.evidenceLabel": "Reported listing snapshot",
  "housing.risk.reason.rent_far_below_market": "Rent far below the local range",
  "housing.risk.reason.rent_below_market": "Rent below the local range",
  "housing.risk.reason.contact_info_in_text": "Contact details in the text",
  "housing.risk.reason.off_platform_payment_language":
    "Off-platform or advance-payment language",
  "housing.risk.reason.discriminatory_language": "Possible discriminatory wording",
  "housing.risk.reason.lister_unverified": "Lister not phone- or ID-verified",
  "housing.risk.reason.lister_phone_only": "Lister phone-verified only",
  "housing.risk.reason.incomplete_listing": "Sparse description",
  "housing.risk.reason.no_photos": "No photos",
  "housing.risk.reason.missing_accessibility_info": "No accessibility info",

  // ── Consolidated platform reports (ADM-17/ADM-19) — /admin/reports ──
  "reports.title": "Platform <em>reports</em>",
  "reports.header.eyebrow": "Reporting",
  "reports.header.title": "Platform <em>reports</em>",
  "reports.header.sub":
    "Growth, reports by type, governance finance, and community health, in one place.",
  "reports.trends.title": "Growth & reports by type",
  "reports.trends.sub": "Adjust the range to see a longer or shorter window.",
  "reports.trends.rangeWeeks": "{count}w",
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
  "reports.communityHealth.title": "Community health",
  "reports.communityHealth.sub": "A snapshot of every community's health score.",
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

  // ── CNT-14: admin resource-listings CRUD ────────────────────────────────
  "adminResourceListings.title": "Resource <em>listings</em>",
  "adminResourceListings.header.eyebrow": "Directory",
  "adminResourceListings.header.sub":
    "The real, vetted Legal Aid and Sexual Health Testing organisations members can contact. Publishing here is always a deliberate step: approving a suggestion records the decision and leaves the listing to you.",
  "adminResourceListings.newCta": "New listing",
  "adminResourceListings.empty": "No listings yet. Create the first one, or check the suggestions queue for ideas.",
  "adminResourceListings.loadError": "Couldn't load resource listings.",
  "adminResourceListings.category.legal_aid": "Legal Aid",
  "adminResourceListings.category.sexual_health_testing": "Sexual Health Testing",
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
  "adminResourceListings.toast.created": "\"{title}\" was published.",
  "adminResourceListings.toast.updated": "\"{title}\" was updated.",
  "adminResourceListings.toast.removed": "\"{title}\" was removed.",
  "adminResourceListings.delete.title": "Remove \"{title}\"?",
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
  "adminResourceSuggestions.category.sexual_health_testing": "Sexual Health Testing",
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
  "adminCommunityTagRequests.action.resolve": "Resolve",
  "adminCommunityTagRequests.empty": "No tag requests yet.",
  "adminCommunityTagRequests.error": "Couldn't load tag requests.",
  "adminCommunityTagRequests.loadMore": "Load more",
  "adminCommunityTagRequests.loadingMore": "Loading…",
  "adminCommunityTagRequests.toast.resolved": "Tag request resolved.",
  "adminCommunityTagRequests.toast.error": "Couldn't resolve that request.",

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
  "listingClaims.empty": "No claims in this filter right now.",
  "listingClaims.claimedBy": "Claimed by {name}",
  "listingClaims.unknownClaimant": "an unknown member",
  "listingClaims.approveCta": "Approve",
  "listingClaims.declineCta": "Decline",
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
  "governance.overview.edit.addRow": "Add a row",
  "governance.overview.edit.section.note": "Reason (optional)",
  "governance.overview.edit.save": "Save section",
  "governance.overview.edit.saved": "Section updated.",
  "governance.overview.edit.noChanges": "Nothing changed.",
  "governance.overview.edit.error": "Couldn't save. Please try again.",
  "governance.overview.health.title": "Community <em>health</em>",
  "governance.overview.health.sub":
    "The stats on the public Governance page, in the order members see them. Active members is counted live and can't be typed here.",
  "governance.overview.health.field.value": "Figure",
  "governance.overview.health.field.trend": "Trend line",
  "governance.overview.health.field.trendCount": "Trend number",
  "governance.overview.health.field.up": "Show as an increase",
  "governance.overview.moderation.title": "How moderation <em>works</em>",
  "governance.overview.moderation.sub":
    "The steps members read on the public Governance page, in the order they happen.",
  "governance.overview.council.title": "Advisory <em>council</em>",
  "governance.overview.council.sub":
    "Who sits on the council, and in what order they appear on the public Governance page.",
  "governance.overview.council.field.name": "Name",
  "governance.overview.council.field.initials": "Initials",
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
  "governance.finances.edit.blockedByAmounts":
    "Saving is on hold until every highlighted amount reads as a number.",
  "moderation.action.created": "Report received",
  "moderation.action.appealOverturned": "Appeal overturned",
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
  "errors.deleteMediaObject": "Couldn't delete that file",
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
  "governance.overview.health.stat.activeMembers": "Active members",
  "governance.overview.health.stat.retention": "Member retention rate",
  "governance.overview.health.stat.reportsFiled": "Reports filed this quarter",
  "governance.overview.health.stat.membersRemoved": "Members removed",
  "governance.overview.health.stat.gatheringsHosted": "Gatherings hosted",
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
    "May 2026: Sliding scale introduced for gatherings",
  "governance.overview.decisions.key.forumLaunched":
    "April 2026: Forum launched",
  "governance.overview.decisions.key.visibilityDefaults":
    "March 2026: Visibility defaults made more conservative",
  "governance.overview.decisions.key.languageToggle":
    "February 2026: Language toggle added",

  // ── 2026-08-21 code-review 4.6 fixes ──
  "moderation.resolved.closedAt":
    "Closed {age}",
  "moderation.resolved.resolvedBy":
    "Resolved by {name}: {note}",
  "moderation.notified.member":
    "Member notified",
  "moderation.notified.reporter":
    "Reporter notified",
  "moderation.notified.affected":
    "Affected member supported",
  "moderation.reporter.anonymous":
    "anonymous",
  "communities.queue.status.open":
    "Open",
  "communities.queue.status.resolved":
    "Resolved",
  "communities.queue.status.escalated":
    "Escalated",
};

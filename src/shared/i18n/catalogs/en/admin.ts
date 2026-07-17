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
  // ── Shared verbs, reused across many modals/drawers ───────────────────────
  "common.cancel": "Cancel",
  "common.close": "Close",
  "common.back": "Back",
  "common.undo": "Undo",

  // ── Dashboard ──────────────────────────────────────────────────────────────
  "dashboard.title": "Overview · <em>good morning, {name}</em>",
  "dashboard.header.titleLine1": "Seven reports",
  "dashboard.header.titleLine2": "need <em>a human</em>.",
  "dashboard.header.sub":
    "Two are flagged as safety emergencies — outing and doxxing. Everything else is calm. You're holding the whole network steady; here's where to start.",
  "dashboard.header.digestCta": "Weekly digest",
  "dashboard.header.digestToast": "The weekly digest would open in a new tab",
  "dashboard.header.moderationCta": "Open moderation",

  "dashboard.metrics.activeMembers.label": "Active members",
  "dashboard.metrics.openReports.label": "Open reports",
  "dashboard.metrics.medianResponse.label": "Median response",
  "dashboard.metrics.sustainerMrr.label": "Sustainer MRR",
  "dashboard.metrics.trendPercent": "{value}%",
  "dashboard.metrics.trendOldest": "oldest {hours}",
  "dashboard.metrics.trendWellUnder": "well under",
  "dashboard.metrics.footGrowth": "+{count} this month",
  "dashboard.metrics.footEmergencies_one": "{count} is an emergency",
  "dashboard.metrics.footEmergencies_other": "{count} are emergencies",
  "dashboard.metrics.footSlaTarget": "{hours} SLA target",
  "dashboard.metrics.footSustainers_one": "{count} sustainer",
  "dashboard.metrics.footSustainers_other": "{count} sustainers",

  "dashboard.triage.title": "Needs <em>a human</em>",
  "dashboard.triage.sortedToast": "Sorted by urgency",
  "dashboard.triage.safetyEmergencies.title": "Safety emergencies",
  "dashboard.triage.safetyEmergencies.sub": "Outing & doxxing —",
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
  "dashboard.charts.series.vouchAbuse": "Vouch-abuse",
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

  "dashboard.feed.title": "Live activity",
  "dashboard.feed.live": "Live",
  "dashboard.feed.transparency":
    "Every action here is <strong>logged and shown</strong> to the member it affects. No silent removals, ever.",
  "dashboard.feed.auditLinkCta": "See the audit log",

  // ── Members ────────────────────────────────────────────────────────────────
  "members.title": "Members · <em>the people</em>",
  "members.header.eyebrow": "Member directory",
  "members.header.titleLine1": "{total} people,",
  "members.header.titleLine2": "each one <em>vouched for</em>.",
  "members.header.sub":
    "Not rows in a table — members someone trusted enough to bring in. Pronouns and chosen names are the only names shown here. {count} people are waiting to be welcomed in.",
  "members.header.exportCta": "Export",
  "members.filterAriaLabel": "Filter members",
  "members.tabs.all": "All members",
  "members.tabs.pending": "Verification pending",
  "members.tabs.flagged": "Flagged",
  "members.filters.all": "All statuses",
  "members.filters.verified": "Verified",
  "members.filters.new": "New this week",
  "members.empty": "No members match those filters.",
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
    "Could not save that decision — please try again",
  "members.verify.mutualLine": "Named {name} as a mutual",
  "members.verify.noMutual": "No mutual named yet",
  "members.verify.appliedToday": "Applied today",
  "members.verify.appliedRecently": "Applied recently",
  "members.verify.appliedDaysAgo_one": "Applied {count} day ago",
  "members.verify.appliedDaysAgo_other": "Applied {count} days ago",

  "members.drawer.verifiedChip": "Verified member",
  "members.drawer.verifyCta": "Verify",
  "members.drawer.verifiedToast": "{name} is verified.",
  "members.drawer.messageCta": "Message",
  "members.drawer.restrictCta": "Restrict…",
  "members.drawer.removeCta": "Remove member…",
  "members.drawer.reasonRequiredToast": "A reason is required before removal",
  "members.drawer.glanceTitle": "At a glance",
  "members.drawer.graphTitle": "Vouch graph — who trusts them",
  "members.drawer.graphAriaLabel": "Open the full trust network",
  "members.drawer.exploreCta": "Explore network",
  "members.drawer.communitiesTitle": "Communities",
  "members.drawer.contributionsTitle": "Contribution history",
  "members.drawer.removePanel.title": "Removing a member is permanent.",
  "members.drawer.removePanel.keepCta": "Keep member",
  "members.drawer.removePanel.continueCta": "I understand — continue",
  "members.drawer.messageSentToast": "Message sent",
  "members.drawer.missingReasonToast":
    "A reason is required — {name} will see it",
  "members.drawer.restrictedToast":
    "Restricted · {duration} · {scope} — {name} notified",
  "members.drawer.restrictionUndoneToast": "Restriction reversed.",

  "members.timeline.title": "Moderation history — for & against",
  "members.timeline.auditLinkCta": "Every entry in the audit log",

  "members.sealed.sectionTitle": "Identity & privacy",
  "members.sealed.title": "Legacy identity is sealed",
  "members.sealed.body":
    "Any prior name is encrypted and shown to no one — not in reports, not here, not to admins. Only the member controls their chosen name.",

  "members.message.eyebrow": "Reaching out",
  "members.message.title": "Message <em>{name}</em>",
  "members.message.sendAsLabel": "Send as",
  "members.message.sendAsSelf": "{name} (you)",
  "members.message.sendAsTeam": "Trust & Safety team",
  "members.message.bodyLabel": "Message",
  "members.message.placeholder":
    "Write to {name}… a check-in, a heads-up, an offer of support.",
  "members.message.transparency":
    "Admin messages are clearly labelled as official — never disguised as a peer. {name} can always reply.",
  "members.message.sendCta": "Send message",

  "members.restrict.eyebrow": "Limiting access, carefully",
  "members.restrict.title": "Restrict <em>{name}</em>",
  "members.restrict.durationLabel": "Duration",
  "members.restrict.scopeLabel": "Scope",
  "members.restrict.reasonLabel": "Reason",
  "members.restrict.applyCta": "Apply restriction",
  "members.restrict.notePlaceholder": "A note for {name} (they will see it)…",
  "members.restrict.transparency":
    "{name} keeps full access to support and appeals. A restriction limits posting — it never cuts someone off from help.",
  "members.restrict.duration.24h": "24h",
  "members.restrict.duration.7d": "7 days",
  "members.restrict.duration.30d": "30 days",
  "members.restrict.duration.permanent": "Permanent",
  "members.restrict.scope.community": "This community",
  "members.restrict.scope.platform": "Platform-wide",
  "members.restrict.reason.harassment": "Repeated harassment after a warning",
  "members.restrict.reason.misgendering": "Misgendering / deadnaming",
  "members.restrict.reason.hostile": "Hostile or abusive conduct",
  "members.restrict.reason.other": "Other — explain below",

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

  // ── Moderation ─────────────────────────────────────────────────────────────
  "moderation.title": "Moderation · <em>triage</em>",
  "moderation.header.eyebrow": "Moderation queue",
  "moderation.header.title": "Two need you <em>first</em>.",
  "moderation.header.sub":
    "Reports are ordered by who's most at risk — not by what arrived first. Outing and doxxing always rise to the top, with a tighter 1-hour clock. Every action records a reason the member will read.",
  "moderation.tabs.open": "Open",
  "moderation.tabs.appeals": "Appeals",
  "moderation.tabs.resolved": "Resolved",
  "moderation.filters.all": "All severities",
  "moderation.filters.emergencies": "Emergencies",
  "moderation.filters.mine": "Assigned to me",
  "moderation.filterAriaLabel": "Filter reports",

  "moderation.selectReportAriaLabel": "Select report: {title}",
  "moderation.reportedByLabel": "Reported by",
  "moderation.aboutLabel": "About",
  "moderation.bulk.ariaLabel": "Bulk actions",
  "moderation.bulk.selectedCount_one": "{count} selected",
  "moderation.bulk.selectedCount_other": "{count} selected",
  "moderation.bulk.dismissCta": "Dismiss",
  "moderation.bulk.spamCta": "Remove as spam",
  "moderation.bulk.reassignCta": "Reassign…",
  "moderation.bulk.cancelCta": "Cancel",

  "moderation.emergency.ariaLabel": "Safety emergencies",
  "moderation.emergency.count_one": "{count} safety emergency",
  "moderation.emergency.count_other": "{count} safety emergencies",
  "moderation.emergency.sub":
    "· outing & doxxing are treated as urgent harm, on a 1-hour clock. Handle these before anything else.",

  "moderation.everythingElse": "Everything else",
  "moderation.countNote_one": "Showing {count} open report · oldest {oldest}",
  "moderation.countNote_other":
    "Showing {count} open reports · oldest {oldest}",
  "moderation.filterEmpty":
    "No open reports match this filter. Try “All severities”.",

  "moderation.caughtUp.titleLine1": "You're <em>caught up</em>.",
  "moderation.caughtUp.titleLine2": "Nothing needs you right now.",
  "moderation.caughtUp.sub":
    "Every open report has a human decision attached to it, and every affected member has been told what happened and why. Go rest — the network is safe in your hands.",
  "moderation.caughtUp.backCta": "Back to overview",
  "moderation.caughtUp.replayCta": "Replay the queue",
  "moderation.backToast": "Heading back to the overview.",

  "moderation.appealsIntro":
    "An appeal is a member asking you to look again. Read the original decision, hear them out, then <em>uphold or overturn</em> — with a reason of your own. Overturning a colleague's call is normal and healthy.",
  "moderation.appeal.by": "Appeal by",
  "moderation.appeal.decidedBy": "Decided by",
  "moderation.appeal.supportersFlag_one": "{count} backing them",
  "moderation.appeal.supportersFlag_other": "{count} backing them",
  "moderation.resolvedSection": "Recently resolved",

  "moderation.reportDrawer.label": "Report — {title}",
  "moderation.reportDrawer.title": "A private trans status was outed",
  "moderation.reportDrawer.cancelCta": "Cancel",
  "moderation.reportDrawer.escalateCta": "Escalate to safety team",
  "moderation.reportDrawer.confirmCta": "Confirm & notify member",
  "moderation.reportDrawer.contentTitle": "Reported content",
  "moderation.reportDrawer.threadTitle": "Surrounding thread",
  "moderation.reportDrawer.flaggedTag": "Flagged",
  "moderation.reportDrawer.peopleTitle": "People involved",
  "moderation.reportDrawer.auditTitle": "Action history",
  "moderation.reportDrawer.auditEmpty":
    "No actions recorded yet. Every decision you make is logged here.",
  "moderation.reportDrawer.decisionTitle": "Take a decision — protective first",
  "moderation.reportDrawer.reasonTitle":
    "Reason — required, shown to the member",
  "moderation.reportDrawer.reasonAriaLabel": "Reason",
  "moderation.reportDrawer.notePlaceholder":
    "Add a human note. The member will read this — write it the way you’d want to be spoken to.",
  "moderation.reportDrawer.noteAriaLabel": "Note to the member",
  "moderation.reportDrawer.transparency":
    "{name} will be told exactly what was actioned and why, with a link to appeal. Nothing happens silently.",
  "moderation.reportDrawer.pickActionToast":
    "Pick an action before confirming.",
  "moderation.reportDrawer.confirmedToast":
    "{name} {verb}. The member has been notified.",

  "moderation.appealDrawer.label": "Appeal — {name}",
  "moderation.appealDrawer.chooseToast": "Choose uphold or overturn",
  "moderation.appealDrawer.reasonRequiredToast":
    "A reason is required — the member will read it",
  "moderation.appealDrawer.cancelCta": "Cancel",
  "moderation.appealDrawer.recordCta": "Record decision",
  "moderation.appealDrawer.originalTitle": "The original decision",
  "moderation.appealDrawer.decidedByLine": "Decided by {name} · {when}",
  "moderation.appealDrawer.viewOriginalCta":
    "View the original report & thread",
  "moderation.appealDrawer.argumentTitle": "Their argument",
  "moderation.appealDrawer.supportersTitle": "Who's backing them",
  "moderation.appealDrawer.noSupport":
    "No other members have weighed in. That's neither for nor against — many appeals stand alone.",
  "moderation.appealDrawer.decisionTitle": "Your decision",
  "moderation.appealDrawer.decisionAriaLabel": "Decision",
  "moderation.appealDrawer.uphold": "Uphold",
  "moderation.appealDrawer.upholdSub": "The original decision stands",
  "moderation.appealDrawer.overturn": "Overturn",
  "moderation.appealDrawer.overturnSub": "Lift it & restore the member",
  "moderation.appealDrawer.reasonAriaLabel": "Reason for your decision",
  "moderation.appealDrawer.reasonPlaceholder":
    "Explain your decision in your own words — the member will read this.",
  "moderation.appealDrawer.transparency":
    "Appeals are logged like any decision. If you overturn, {name} is told privately and kindly — not blamed.",

  "moderation.severity.emergency": "Emergency",
  "moderation.severity.high": "High",
  "moderation.severity.medium": "Medium",
  "moderation.severity.low": "Low",

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
  "moderation.reasons.other": "Other — explain below",

  "moderation.priorReports.count_one": "{count} prior report",
  "moderation.priorReports.count_other": "{count} prior reports",
  "moderation.priorReports.newAccount": "New account · {vouches} vouches",
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
    "Couldn't reach the safety service — restored.",
  "moderation.queue.bulkToast_one": "{count} report {verb}",
  "moderation.queue.bulkToast_other": "{count} reports {verb}",
  "moderation.queue.bulkVerb.dismissed": "dismissed",
  "moderation.queue.bulkVerb.removedAsSpam": "removed as spam",
  "moderation.queue.bulkVerb.reassigned": "reassigned",
  "moderation.queue.bulkRestoredToast": "Restored the reports.",
  "moderation.queue.appealToast": "{verb} · {name} notified",
  "moderation.queue.appealVerb.upheld": "Upheld",
  "moderation.queue.appealVerb.overturned": "Overturned",
  "moderation.queue.appealRestoredToast": "Restored the appeal.",

  // ── Communities ────────────────────────────────────────────────────────────
  "communities.title": "Communities · <em>all spaces</em>",
  "communities.grid.eyebrow": "Communities",
  "communities.grid.titleLine1": "Eight spaces,",
  "communities.grid.titleLine2": "each <em>tended to</em>.",
  "communities.grid.sub":
    "Every community has a moderator who knows it by name. Health is how steady each one feels — reports answered, members held, no one slipping through.",
  "communities.grid.newCta": "+ New community",
  "communities.grid.newToast":
    "Creating a new community would open a guided setup",
  "communities.grid.healthAriaLabel": "Health {score}, see breakdown",
  "communities.grid.needsHand": "· needs a hand",
  "communities.grid.stat.members": "Members",
  "communities.grid.stat.activity": "Activity",
  "communities.grid.stat.openReports": "Open reports",
  "communities.grid.sparklineAriaLabel": "Health trend, latest {value}",

  "communities.detail.backCta": "All communities",
  "communities.detail.stewardedBy_one":
    "Stewarded by {count} moderator · founded {founded}.",
  "communities.detail.stewardedBy_other":
    "Stewarded by {count} moderators · founded {founded}.",
  "communities.detail.healthChip": "Health {score} · {label}",
  "communities.detail.settingsCta": "Settings",
  "communities.detail.settingsToast": "Community settings would open here",
  "communities.detail.supportBanner.title":
    "This community could use <em>a hand</em>.",
  "communities.detail.supportBanner.textAlone":
    "A health score this low is a call for support, not a mark against the mods. {name} is stewarding {members} members almost alone.",
  "communities.detail.supportBanner.textThin":
    "A health score this low is a call for support, not a mark against the mods. {name} is stewarding {members} members with a thin team.",
  "communities.detail.supportBanner.offerCta": "Offer support",
  "communities.detail.stat.members": "Members",
  "communities.detail.stat.activeThisWeek": "Active this week",
  "communities.detail.stat.openReports": "Open reports",
  "communities.detail.stat.resolvedOnTime": "Resolved on time",
  "communities.detail.tabs.queue": "Scoped queue",
  "communities.detail.tabs.members": "Members",
  "communities.detail.tabs.settings": "Settings",
  "communities.detail.health.thriving": "thriving",
  "communities.detail.health.steady": "steady",
  "communities.detail.health.needsHand": "needs a hand",

  "communities.queue.emptyTitle": "Nothing open, <em>nothing owed</em>.",
  "communities.queue.emptyText":
    "This community resolves everything itself — a {pct}% on-time record. Its moderators rarely need you.",
  "communities.queue.moreHandled":
    "+ {count} more being handled by the community's own moderators",
  "communities.queue.reviewCta": "Review",
  "communities.members.moderatorChip": "Moderator",
  "communities.members.seeAllCta": "See all {count} members",

  "communities.settings.whoCanJoin": "Who can join",
  "communities.settings.moderators": "Moderators",
  "communities.settings.removeModAriaLabel": "Remove {name}",
  "communities.settings.addModCta": "+ Add",
  "communities.settings.addModToast": "Search members to add as moderator",
  "communities.settings.modRemovedToast": "Removed {name} as moderator",
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
  "communities.settings.codeOfCare": "Code of care",
  "communities.settings.viewCta": "View",
  "communities.settings.codeToast": "The code of care would open here",
  "communities.settings.visibility": "Visibility",
  "communities.settings.visibility.private": "Private",
  "communities.settings.visibility.public": "Public",
  "communities.settings.visibility.network": "Network-only",

  "communities.health.modalTitle": "Why <em>{score}</em>?",
  "communities.health.howCalculatedCta": "How it's calculated",
  "communities.health.howCalculatedToast":
    "Health is a weighted blend of four signals, recalculated nightly",
  "communities.health.offerSupportCta": "Offer support",
  "communities.health.closeCta": "Close",
  "communities.health.intro":
    "Health is a blend of four signals, weighted by community size. It's a thermometer, not a grade —",
  "communities.health.breakdown.memberActivity.name": "Member activity",
  "communities.health.breakdown.memberActivity.desc":
    "How alive the space feels — posts, replies, attendance",
  "communities.health.breakdown.reportResolution.name": "Report resolution",
  "communities.health.breakdown.reportResolution.desc":
    "Share of reports resolved within the SLA",
  "communities.health.breakdown.memberSentiment.name": "Member sentiment",
  "communities.health.breakdown.memberSentiment.desc":
    "Quiet pulse-check surveys and reaction signals",
  "communities.health.breakdown.safetyLoad.name": "Safety load",
  "communities.health.breakdown.safetyLoad.desc":
    "Inverse of harm reports relative to size",
  "communities.health.narrative.strong":
    "A strong, balanced score. Nothing here needs your attention — keep doing what works.",
  "communities.health.narrative.healthy":
    "Healthy overall, with one or two areas worth a gentle eye.",
  "communities.health.narrative.dragging":
    "Sentiment and safety load are dragging the score down. This is exactly where a little staff support goes a long way.",

  "communities.support.modalTitle": "Lend <em>{name}</em> a hand",
  "communities.support.intro":
    "Pick how to help. You can do more than one — the moderators will see exactly what you offered.",
  "communities.support.noteLabel": "A note for the moderators (optional)",
  "communities.support.notePlaceholder":
    "We saw the score dip — what would actually help right now?",
  "communities.support.cancelCta": "Cancel",
  "communities.support.sendCta": "Send support",
  "communities.support.sentToast": "Support sent to {name}'s moderators",
  "communities.support.withdrawnToast": "Support request withdrawn",
  "communities.support.option.message.title": "Message the moderators",
  "communities.support.option.message.sub":
    "A warm check-in to {names} — how can we help?",
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
    "Where the money comes from, where it goes, every rule change, and every action a moderator has ever taken — all open to the members who fund us.",
  "governance.header.publishCta": "Publish report",
  "governance.header.publishToast":
    "Transparency report queued — members will be notified when it publishes.",
  "governance.tabs.finances": "Finances",
  "governance.tabs.policy": "Policy & versions",
  "governance.tabs.audit": "Audit log",

  "governance.finances.stat.sustainerMrr": "Sustainer MRR",
  "governance.finances.stat.totalIncome": "Total monthly income",
  "governance.finances.stat.surplus": "Monthly surplus",
  "governance.finances.stat.solidarity": "On solidarity access",
  "governance.finances.foot.sustainersCount": "{count} members chip in monthly",
  "governance.finances.foot.sources": "Sustainers, grants & one-offs",
  "governance.finances.foot.reserve": "Held in the community reserve",
  "governance.finances.foot.solidarityRate": "Members on free or reduced rate",

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
    "{amount} / month — every euro accounted for, line by line.",

  "governance.chart.title": "Income vs spending <em>by quarter</em>",
  "governance.chart.sub":
    "The gap is surplus — it goes straight to the reserve.",
  "governance.chart.ariaLabel":
    "Grouped bar chart of income versus spending per quarter, in thousands of euros",
  "governance.chart.legend.income": "Income",
  "governance.chart.legend.spending": "Spending",
  "governance.chart.legend.surplus": "Surplus to reserve",
  "governance.chart.range.4q": "4Q",
  "governance.chart.range.6q": "6Q",
  "governance.chart.range.all": "All",

  "governance.mrrPanel.live": "Sustainer MRR · live",
  "governance.mrrPanel.lead":
    "Every euro comes from members, not advertisers or data sales. <em>We will never sell member data</em> — it's written into our constitution, not just our promises.",
  "governance.mrrPanel.breakdown.care": "Care",
  "governance.mrrPanel.breakdown.platform": "Platform",
  "governance.mrrPanel.breakdown.mutualAid": "Mutual aid",
  "governance.mrrPanel.breakdown.health": "Health",
  "governance.mrrPanel.breakdown.magazine": "Magazine",
  "governance.mrrPanel.readCta": "Read the constitution",

  "governance.policy.versionsTitle": "Code of Care <em>versions</em>",
  "governance.policy.versionsSub":
    "Every change to how we keep each other safe, dated and open.",
  "governance.policy.seeDiffCta": "See what changed",
  "governance.policy.principlesTitle": "Our <em>principles</em>",
  "governance.policy.transparencyNote":
    "Policy changes are proposed in the open and ratified at the community assembly. Anyone can read the full edit history — nothing here is decided behind closed doors.",
  "governance.policy.principle.noSell": "We will never sell member data.",
  "governance.policy.principle.visibility":
    "Visibility is always the member's choice.",
  "governance.policy.principle.noSilent":
    "No silent removals — every action carries a reason.",
  "governance.policy.principle.accessNeverConditional":
    "Access is never conditional on ability to pay.",

  "governance.diff.eyebrow": "Policy change",
  "governance.diff.title": "v4.1 → <em>v4.2</em>",
  "governance.diff.closeCta": "Close",
  "governance.diff.readFullCta": "Read full v4.2",
  "governance.diff.introTitle": "Section 3 — Harm we treat as urgent.",
  "governance.diff.introDate": "Ratified 12 Jun 2026, 89% in favour.",
  "governance.diff.note":
    "Proposed by the Trans & Friends moderators · voted on by the whole community at the Annual Assembly.",

  "governance.audit.title": "Every action, <em>on the record</em>",
  "governance.audit.metaZero": "0 of {total} entries",
  "governance.audit.metaMatch": "{count} match · {total} total",
  "governance.audit.exportToast": "Exported {total} entries as CSV",
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
  "governance.audit.actionType.removed": "Removed",
  "governance.audit.actionType.restricted": "Restricted",
  "governance.audit.actionType.warned": "Warned",
  "governance.audit.actionType.dismissed": "Dismissed",
  "governance.audit.actionType.verified": "Verified",
  "governance.audit.actionType.appeal": "Appeal",
  "governance.audit.actionType.policy": "Policy",
  "governance.audit.actionType.froze": "Froze",
  "governance.audit.range.today": "Today",
  "governance.audit.range.thisWeek": "This week",
  "governance.audit.range.thisQuarter": "This quarter",
  "governance.audit.emptyTitle": "No entries match",
  "governance.audit.emptyText":
    "Try widening your filters — the full log holds {total} actions going back to 2023.",
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
    "Organisations that applied to partner with QueerPulse. Read what they do, then approve them onto the public partners page or set the application aside — with a note they'll read.",
  "partners.forbidden": "This queue is for admins only.",
  "partners.loadError": "The queue couldn't load right now — please try again.",
  "partners.errorToast": "Could not save that decision — please try again",
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
    "You're all caught up — new requests will appear here.",
  "modPanel.requests.requestedAgo": "Requested {time} ago",
  "modPanel.requests.approveCta": "Approve",
  "modPanel.requests.declineCta": "Decline",
  "modPanel.requests.approvedToast": "{name} approved — welcome them in.",
  "modPanel.requests.declinedToast":
    "{name}'s request wasn't approved this time.",
  "modPanel.requests.approvedAllToast":
    "All {count} requests approved — the community grows.",

  "modPanel.reports.sectionLabel": "Reported posts",
  "modPanel.reports.emptyTitle": "All clear",
  "modPanel.reports.emptyDesc":
    "Nothing has been flagged — the community looks after each other.",
  "modPanel.reports.metaLine":
    "From {author} · flagged by {reporter} · {time} ago",
  "modPanel.reports.removeCta": "Remove post",
  "modPanel.reports.warnCta": "Warn author",
  "modPanel.reports.dismissCta": "Dismiss",
  "modPanel.reports.escalateCta": "Escalate to staff",
  "modPanel.reports.removedToast":
    "Post removed. The author has been notified.",
  "modPanel.reports.warnedToast": "A warning has been sent to {name}.",
  "modPanel.reports.dismissedToast": "Report dismissed.",
  "modPanel.reports.escalatedToast":
    "Escalated to the QueerPulse team — it's now in the platform queue.",

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
  "modPanel.settings.dangerZone": "Danger zone",
  "modPanel.settings.irreversible": "Irreversible actions",
  "modPanel.settings.archive.title": "Archive community",
  "modPanel.settings.archive.desc":
    "Members keep their history but new posts are disabled.",
  "modPanel.settings.archive.cta": "Archive",
  "modPanel.settings.archive.toast":
    "Community archived. Members have been notified.",
  "modPanel.settings.transfer.title": "Transfer ownership",
  "modPanel.settings.transfer.desc":
    "Hand the community to another member. You'll lose owner permissions.",
  "modPanel.settings.transfer.cta": "Transfer",
  "modPanel.settings.transfer.toast":
    "Ownership transfer initiated — the new owner will receive an invite.",

  // ── Vouch graph (trust-network visualisation) ─────────────────────────────
  "vouchGraph.modes.network": "Network",
  "vouchGraph.modes.scenes": "Scenes",
  "vouchGraph.modes.safety": "Safety",
  "vouchGraph.pathbar.stepPath_one": "{count}-step trust path:",
  "vouchGraph.pathbar.stepPath_other": "{count}-step trust path:",
  "vouchGraph.pathbar.noPath": "No trust path between {a} and {b}",
  "vouchGraph.pathbar.fromHint":
    "Path from {name} — shift-click a second person",
  "vouchGraph.pathbar.clear": "clear",

  "vouchGraph.legend.safety.ring": "Suspected ring",
  "vouchGraph.legend.safety.isolated": "Trust-isolated",
  "vouchGraph.legend.safety.reported": "Has reports",
  "vouchGraph.legend.safety.withdrawn": "Withdrawn vouch",
  "vouchGraph.legend.plain.trusted": "Trusted",
  "vouchGraph.legend.plain.verified": "Verified",
  "vouchGraph.legend.plain.mutual": "Mutual vouch",
  "vouchGraph.legend.plain.anonymous": "Anonymous",
  "vouchGraph.legend.plain.private": "Private network",

  "vouchGraph.modal.ariaLabel": "Trust network",
  "vouchGraph.modal.eyebrow": "Trust network",
  "vouchGraph.modal.searchPlaceholder": "Find a member…",
  "vouchGraph.modal.searchAriaLabel": "Find a member",
  "vouchGraph.modal.replayCta": "Replay",
  "vouchGraph.modal.timeCutAriaLabel": "Time cut-off",
  "vouchGraph.modal.verifyToast": "Trust basis attached — opening verification",
  "vouchGraph.modal.citeToast": "Trust path cited in the audit log",
  "vouchGraph.modal.privateToast": "This member keeps their network private",

  "vouchGraph.inspector.emptyTitle": "Pick anyone",
  "vouchGraph.inspector.emptyBody":
    "Click a node to read who trusts them and what that trust is built on. Double-click to walk the network from there.",
  "vouchGraph.inspector.sealed": "Legacy identity sealed — chosen name only",
  "vouchGraph.inspector.ringBanner.title": "Part of a suspected vouch ring",
  "vouchGraph.inspector.ringBanner.body":
    "Five accounts created within an hour, vouching only for each other — a closed loop with no outside trust.",
  "vouchGraph.inspector.isolationBanner.title": "Trust isolation",
  "vouchGraph.inspector.isolationBanner.body":
    "Every vouch this member holds comes from new or flagged accounts. Verify with extra care.",
  "vouchGraph.inspector.reportsBanner.title_one": "{count} report on record",
  "vouchGraph.inspector.reportsBanner.title_other": "{count} reports on record",
  "vouchGraph.inspector.reportsBanner.body":
    "Open the member's moderation history before acting.",
  "vouchGraph.inspector.privateBanner.title": "Network kept private",
  "vouchGraph.inspector.privateBanner.body":
    "This member has chosen to hide their vouch graph. Respect it — don't work around it.",
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
  "vouchGraph.inspector.expandCta": "Expand network",
  "vouchGraph.inspector.collapseCta": "Collapse network",
  "vouchGraph.inspector.citeCta": "Cite in audit log",

  "vouchGraph.tooltip.vouchesIn_one": "{count} vouch in",
  "vouchGraph.tooltip.vouchesIn_other": "{count} vouches in",
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
};

import type { Catalog } from "../../types";

/**
 * Safety — reporting, blocking, crisis chat, emergency resources, hate-crime
 * reporting guide, and safe-spaces verification. The highest-stakes copy on
 * the platform: keep it precise and unambiguous over stylish.
 *
 * Scope-rule notes:
 * - `reportReasons.ts` REASON_LABEL_KEYS: the reason *code* sent to the server
 *   is a stable id — never the translated label. Only the label is localized.
 * - `safeSpaces.ts` (VERIFIED_SPACES / REMOVED_SPACES) is left as mock
 *   content — venue descriptions, member vouch quotes, incident write-ups —
 *   the live-mode equivalent of a fetched venue/report record. Only the
 *   surrounding page chrome (safeSpacesPage.data.ts, SafeSpacesPage,
 *   SafeSpacesSections, SafeSpaceCard, SafeSpaceDetailPage, VouchModal) is
 *   translated.
 * - Fictional demo names (Sofia Rodrigues, Rui) stay in English, matching the
 *   member-bio convention elsewhere.
 */
export const safety: Catalog = {
  // ── Shared across ReportPage.tsx / HateCrimePage.tsx (HubBackLink label) ─
  "nav.safetyGuideLabel": "Safety Guide",

  // ── Quick exit (fixed escape hatch on high-stakes safety pages) ──────────
  "quickExit.label": "Quick exit",
  "quickExit.aria": "Quick exit: leave this page now for a neutral site",

  // ── ReportPage.tsx ─────────────────────────────────────────────────────
  "report.meta.title": "Report a concern to the QueerPulse safety team",
  "report.meta.description":
    "File a report about harassment, abuse, or an unsafe situation on QueerPulse. You can file anonymously, and you can file without an account.",
  "report.eyebrow": "Safety & Reporting",
  "report.hero.title": "Safety is <em>structural.</em>",
  "report.hero.lead":
    "Not decorative. Not a page in the footer. Our approach to handling reports, what happens when you make one, and the principles that guide every decision we make.",

  // ── Cross-links between the form (ReportPage) and the guide
  //    (ReportingGuidePage) ─────────────────────────────────────────────────
  "report.howReportingWorksLink": "How reporting works",
  "report.guide.meta.title": "How reporting works on QueerPulse",
  "report.guide.meta.description":
    "What happens after you submit a report on QueerPulse: our review process, the principles behind every decision, and a public log of past moderation outcomes.",
  "report.guide.makeReportCta": "Make a report",

  "report.how.title": "How <em>reporting works</em>",
  "report.how.lead":
    "You submit a report. A moderator reviews it within 24 hours. Here's exactly what happens in between: no black box, no vague reassurances.",
  "report.flow.step1.title": "You submit a report",
  "report.flow.step1.desc":
    "Via the button on any profile, message, or forum post, or directly through this page. You can report anonymously if needed.",
  "report.flow.step2.title": "Immediate acknowledgement",
  "report.flow.step2.desc":
    "A confirmation reaches your QueerPulse notifications within 1 hour, and a real person is assigned to your report. A report filed without an account skips this step: there is no inbox here to reach.",
  "report.flow.step3.title": "Review within 24 hours",
  "report.flow.step3.desc":
    "We review the evidence, context, and history. For serious cases, the reported member's access is temporarily suspended during review.",
  "report.flow.step4.title": "Decision & action",
  "report.flow.step4.desc":
    "Possible outcomes: warning, temporary suspension, permanent removal. The outcome and the reasoning behind it reach your QueerPulse notifications.",

  "report.form.title": "Make a <em>report.</em>",
  "report.form.lead":
    "Use this form for safety concerns, harassment, abuse, or any situation that made you feel unsafe. All reports are treated with full seriousness. There is no minimum threshold for what warrants a report.",
  "report.form.categoryLabel": "What are you reporting?",
  "report.form.categoryPlaceholder": "Select a category",
  // The two emergency-severity categories. Worded so somebody scanning the
  // list in a bad moment recognises what happened to them without having to
  // know the words "outing" or "doxxing".
  "report.category.outing": "Someone shared that I'm LGBTQ+ without my consent",
  "report.category.doxxing": "Someone shared my personal details or location",
  "report.category.harassment": "Harassment or threats",
  // Backend label wording (`reason-catalogue.ts` REASON_LABELS.hate_speech),
  // localized. Reporting a person for a slur had no code of its own here.
  "report.category.hateSpeech": "Hate speech or a slur",
  "report.category.unwantedContact": "Unwanted contact or messages",
  "report.category.impersonation": "Misrepresentation or impersonation",
  "report.category.discrimination": "Discrimination",
  "report.category.venueSafety": "Unsafe behaviour at a gathering",
  "report.category.other": "Something else",
  "report.form.involvedLabel": "Who or what was involved (optional)",
  "report.form.involvedPlaceholder":
    "A name, a place, a link, whatever you have",
  "report.form.involvedHelper":
    "Written in your own words. This form can't attach a report to a profile or a post yet, so a moderator will read what you write here and find the record themselves.",
  // Prefixes the "who or what" line inside the report body sent to moderators.
  "report.detail.involvedLine": "Who or what was involved: {involved}",
  "report.form.detailLabel": "What happened?",
  "report.form.detailPlaceholder":
    "Tell us what happened, with as much detail as you're comfortable sharing. There are no wrong answers.",
  "report.form.emailLabel":
    "An address where someone could reach you (optional)",
  "report.form.emailHelper":
    "QueerPulse sends no email. This only gives a person on the safety team a way to reach you if they need to ask you something. Leave it blank and the report is filed anonymously.",
  "report.form.emailPlaceholder": "you@email.com",
  // An EXPLICIT choice, because this form used to infer it: leaving the
  // optional email blank filed the report anonymously, and a signed-in member
  // who expected the team to know who they were was invisible to the
  // moderator instead. The helper spells out the cost, since anonymity here is
  // a real trade rather than a privacy freebie.
  "report.form.identityLegend": "How this reaches the moderator",
  "report.form.identity.named": "With my name on it",
  "report.form.identity.namedHelper":
    "The moderator sees who filed this, and the record of the reports you have filed before. That record is part of how they weigh what you are telling them.",
  "report.form.identity.anonymous": "Anonymously",
  "report.form.identity.anonymousHelper":
    "The moderator sees the report without your name, and without that prior-report record. QueerPulse still stores the link between you and this report internally, so it can be traced if it has to be.",
  "report.form.identity.signedOutNote":
    "You are not signed in, so the moderator sees this report without a name and without any prior-report record to weigh it against. Members read what came of a report in their QueerPulse notifications; without an account there is no place here for an answer to land. Sign in first if you want it filed as you.",
  "report.form.submitting": "Submitting…",
  "report.form.submitCta": "Submit report",
  "report.form.fineprint":
    "Every report is read by the moderation team. Severity and the review deadline are worked out from the category you pick, so choose the closest match to what happened.",

  "report.principles.eyebrow": "Our principles",
  "report.principles.believeReporter.strong": "We believe the reporter first.",
  "report.principles.believeReporter.rest":
    "Our default is to take reports seriously and investigate; the responsibility to look into it sits with us.",
  "report.principles.noVagueWarnings.strong": "No vague warnings.",
  "report.principles.noVagueWarnings.rest":
    "If someone has caused harm, we tell them specifically what they did and what changes are required.",
  "report.principles.transparency.strong": "Transparency over comfort.",
  "report.principles.transparency.rest":
    "We publish aggregate moderation data every quarter so the community can see how we work.",
  "report.principles.noPermanentDecisions.strong":
    "No permanent private decisions.",
  "report.principles.noPermanentDecisions.rest":
    "Members can appeal decisions. Appeals are reviewed by a different moderator.",
  "report.principles.communityOwns.strong": "The community owns this space.",
  "report.principles.communityOwns.rest":
    "Ultimately we answer to the members themselves.",

  "report.transparency.title": "Moderation <em>transparency</em>",
  "report.transparency.lead":
    "We publish a quarterly moderation report so the community can see how decisions are being made. This is what accountability looks like.",
  "report.modLog.title": "Q1 2026 <em>moderation report</em>",
  "report.modLog.meta":
    "Published April 2026 · Covers January – March 2026 · All data is aggregate and anonymised.",
  "report.modLog.stat.received": "reports received",
  "report.modLog.stat.resolved": "resolved within 24h",
  "report.modLog.stat.removed": "members removed",
  "report.modLog.stat.appeals": "appeals received",
  "report.modLog.stat.reversed": "decision reversed on appeal",
  "report.modLog.viewReportCta": "View full report",

  "report.toast.chooseCategory": "Choose what you're reporting first.",
  "report.toast.received":
    "Report received. What comes of it lands in your QueerPulse notifications.",
  "report.authRefused":
    "The server would not accept this report as it was sent. Sign in and file it again. If you are already signed in, a moderation restriction on your account can be what is blocking it.",
  "report.toast.receivedSignedOut":
    "Report received. A moderator reads every one. Without an account there is no place here for an answer to land, so nothing will arrive back.",
  "report.toast.submitError":
    "Couldn't send your report. It didn't reach us. Check your connection and try again.",
  // Shown when POST /reports is refused by the 60-second burst throttle, whose
  // own message is framework wording no member should ever read. The rolling
  // flood caps carry their own member-facing copy from the server instead, so
  // this string covers the burst case only. See api/reportSubmissionError.ts.
  "report.tooFast":
    "You're sending reports faster than we can take them in. Wait a moment, then send this one again.",

  // ── CommunityReportControl / CommunityReportModal ───────────────────────
  // Reporting a WHOLE community, from the community detail hero. The backend
  // has carried a `community` report subject end to end for a long time (its
  // reason set, the takedown read path, the admin freeze); nothing on the
  // frontend filed one, so a community organised around harm could only be
  // reported one post at a time and never reached a moderator as itself.
  "report.community.trigger": "Report this community",
  "report.community.triggerAria": "Report the community {name}",
  "report.community.title": "Report {name}",
  "report.community.lead":
    "This reports the community itself. Use it when the problem is the space: what it is organised around, what it lets stand, or what its organisers do.",
  "report.community.reasonLabel": "What is wrong here?",
  "report.community.detailLabel": "What should the moderator know? (optional)",
  "report.community.detailPlaceholder":
    "Links, dates, whose posts, whatever you have. A moderator reads this before they open the community.",
  "report.community.cancelCta": "Cancel",
  "report.community.submitCta": "Send report",
  "report.community.submitting": "Sending…",
  "report.community.error":
    "We couldn't send that report. Nothing has been submitted yet. Check your connection and try again.",
  "report.community.success.title": "The report is with the moderation team",
  "report.community.success.body":
    "A moderator will review {name} as a whole. Severity and the review deadline are set from the reason you picked, so this is already in the right queue.",
  "report.community.success.doneCta": "Done",

  // ── ConversationReportModal / MessageReportModal / ConnectionReportModal ─
  // Reporting a PERSON, or one message they sent, from a DM or a connection.
  // These three modals used to reuse `flag.*`, which is safe-space BADGE copy:
  // it promised badge suspension at three independent flags and told the
  // reporter "we may contact you, but never the venue". There is no badge and
  // no venue on this surface, and QueerPulse sends no email at all, so nothing
  // here promises a follow-up message. What IS true and what this copy says:
  // every report is read by the moderation team (report.form.fineprint), the
  // backend derives severity and the review deadline from the reason code
  // (api/useCreateReport.ts), and Block is available on both surfaces
  // (ConversationSafetyMenu, ConnectionMoreMenu) independently of the review.
  "reportPerson.success.title": "Your report is <em>with a moderator.</em>",
  "reportPerson.success.body":
    "Someone on the moderation team reads every report. The severity and the review deadline are set from the reason you picked, so this is already in the right queue. If you want distance in the meantime, blocking takes effect straight away and is independent of the review.",
  "reportPerson.success.doneCta": "Done",
  "reportPerson.error":
    "We couldn't send that report. Nothing has been submitted yet. Check your connection and try again.",
  "reportPerson.form.lead":
    "A moderator reads what you write here. Specifics help: what happened, when, and where on the platform. Pick the reason closest to what happened, because it sets how quickly this gets reviewed.",
  "reportPerson.form.reasonLabel": "What is this about?",
  "reportPerson.form.detailLabel": "What should the moderator know?",
  "reportPerson.form.detailPlaceholder":
    "What happened, when, and anything that helps a moderator find it. Be as specific as you're comfortable with.",
  "reportPerson.form.charsRemaining_one": "{count} more character to send",
  "reportPerson.form.charsRemaining_other": "{count} more characters to send",
  "reportPerson.form.charsCount_one": "{count} character",
  "reportPerson.form.charsCount_other": "{count} characters",
  "reportPerson.form.cancelCta": "Cancel",
  "reportPerson.form.submitting": "Sending…",
  "reportPerson.form.submitCta": "Send report",

  // ── reportReasons.ts — SAFETY-CRITICAL: stable server ids, only the label
  // is translated. Never let a translated label leak into the stored value.
  "reason.outing": "Outing / sharing private identity without consent",
  "reason.doxxing": "Sharing personal or location data (doxxing)",
  "reason.harassment": "Targeted harassment or threats",
  "reason.hateSpeech": "Hate speech or a slur",
  "reason.unwantedContact": "Unwanted contact after being asked to stop",
  "reason.impersonation": "Misrepresentation or impersonation",
  "reason.discrimination": "Discrimination or misgendering",
  "reason.spam": "Spam or self-promotion",
  "reason.offTopic": "Off-topic or disruptive",
  "reason.venueSafety": "A harassment or safety incident at the space",
  "reason.venueStaff": "Staff didn't intervene when needed",
  "reason.venueAccessibility": "An accessibility problem",
  "reason.housingUnsafe": "Unsafe, discriminatory, or misrepresented housing",
  "reason.housingScam": "Scam or fake listing",
  "reason.notAffirming": "Not LGBTQ+ affirming: broke the community pledge",
  "reason.offPlatform": "Asked to pay or move off-platform",
  // System-filed by the listings pipeline, never offered to a member. Read
  // only by a moderator, on the queue row and in the report drawer.
  "reason.listingDispute": "Dispute or claim of a business listing",
  "reason.listingOwnerNotify": "Owner outreach: friendly or suggested listing",
  "reason.other": "Something else, explained in detail",

  // ── Safe-space BADGE flag copy ─────────────────────────────────────────
  // Venue-only wording: it names the three-flag threshold, the badge
  // suspension, and "never the venue". The live safe-space flag flow
  // (SafeSpaceFlagModal / SafeSpaceFlagControl) reads `flag.modal.*`,
  // `flag.reason.*`, `flag.done.*` and `flag.errorToast` further down, and
  // `flag.error` is still read by myevents/useMyEventsSafety.ts. The
  // `flag.success.*` / `flag.form.*` keys below are currently unreferenced:
  // the three report-a-person modals used to borrow them and now use
  // `reportPerson.*`. Kept for the badge flow; never point a person report at
  // them again.
  "flag.success.title": "Flag <em>received.</em>",
  "flag.success.body":
    "Thank you. A moderator will read your report. <b>Three independent flags trigger an immediate review and temporary suspension of the badge</b>. Your report counts toward that. We may contact you for detail, but never the venue.",
  "flag.success.doneCta": "Done",
  "flag.error":
    "Couldn't send that flag. It didn't reach us. Check your connection and try again.",
  "flag.form.title": "What happened at <em>{spaceName}?</em>",
  "flag.form.lead":
    "Flags are how we know when a space slips. Tell us what you saw: specifics help the review panel. Your name is never shared with the venue.",
  "flag.form.concernLabel": "What's the concern?",
  "flag.form.detailLabel": "Tell us what happened",
  "flag.form.detailPlaceholder":
    "When did it happen, what did you see or experience, and who was involved? Be as specific as you're comfortable with.",
  "flag.form.charsRemaining_one": "{count} more character to submit",
  "flag.form.charsRemaining_other": "{count} more characters to submit",
  "flag.form.charsCount_one": "{count} character",
  "flag.form.charsCount_other": "{count} characters",
  "flag.form.cancelCta": "Cancel",
  "flag.form.submitting": "Submitting…",
  "flag.form.submitCta": "Submit flag",

  // ── BlockMutePage.tsx / BlockMuteScreens.tsx / blockMute.data.ts ──────
  "blockMute.meta.title": "Blocking and muting someone on QueerPulse",
  "blockMute.meta.description":
    "How to mute or block another member on QueerPulse: what each option hides, whether they're notified, and how to undo it later.",
  "common.no": "No",
  "blockMute.choose.title": "Privacy <em>controls</em>",
  "blockMute.choose.sub":
    "These actions are private. {name} will not be notified.",
  "blockMute.choose.muteTitle": "Mute {name}",
  "blockMute.choose.muteDesc":
    "You won't see their posts or activity. They won't know they've been muted. You can unmute at any time.",
  "blockMute.choose.muteScopeLabel": "What a mute covers",
  "blockMute.choose.muteScopeNote":
    "Muting covers everything at once: their posts, comments and replies stop appearing for you. There is no way to mute only part of what someone shares.",
  "blockMute.choose.durationLabel": "Duration",
  "blockMute.duration.untilUnmute": "Until I unmute",
  "blockMute.duration.sevenDays": "7 days",
  "blockMute.duration.thirtyDays": "30 days",
  "blockMute.choose.blockTitle": "Block {name}",
  "blockMute.choose.blockDesc":
    "They can't view your profile, message you, or see you in search. Neither of you can connect with the other.",
  "blockMute.choose.blockNote":
    "<strong>Note:</strong> If you share communities, {name} will still appear in member lists, but won't be able to interact with you directly.",
  "blockMute.choose.continueCta": "Continue",
  "blockMute.choose.cancelCta": "Cancel",
  "blockMute.choose.liveDurationNote":
    "A mute lasts until you unmute. Timed mutes are a demo-only preview.",

  "blockMute.explainer.sub":
    "Muting and blocking always start from someone's profile. Open the profile of the person you want to mute or block, then use the safety menu there.",
  "blockMute.explainer.muteTitle": "Muting",
  "blockMute.explainer.blockTitle": "Blocking",
  "blockMute.explainer.membersCta": "Browse members",

  "blockMute.muted.title": "You've <em>muted</em> {name}",
  "blockMute.muted.sub":
    "Their posts and replies are now hidden from your feed. They don't know.",
  "blockMute.muted.summaryLabel": "What's muted",
  "blockMute.muted.everythingTheyPost": "Everything they post",
  "blockMute.muted.durationLabel": "Duration",
  "blockMute.muted.notifiedLabel": "{name} notified?",
  "blockMute.muted.manageLink": "Manage muted members",
  "blockMute.muted.undoCta": "Undo: unmute {name}",

  "blockMute.blocked.title": "You've <em>blocked</em> {name}",
  "blockMute.blocked.sub":
    "{name} can no longer view your profile, message you, or find you in search.",
  "blockMute.blocked.visibleLabel": "Profile visible to them",
  "blockMute.blocked.messageLabel": "Can they message you",
  "blockMute.blocked.notifiedLabel": "{name} notified?",
  "blockMute.blocked.manageLink": "Manage blocked members",
  "blockMute.blocked.undoCta": "Undo: unblock {name}",
  "blockMute.blocked.reportNote":
    "Need to report harmful behaviour? <link>File a report</link>",

  // ── ProfileSafetyMenu.tsx / BlockMemberModal.tsx (block/mute from a profile) ──
  "profileMenu.ariaLabel": "Safety actions for {name}",
  "profileMenu.mute": "Mute {name}",
  "profileMenu.unmute": "Unmute {name}",
  "profileMenu.block": "Block {name}",
  "profileMenu.unblock": "Unblock {name}",
  "profileMenu.report": "Report {name}",
  "profileMenu.mutedToast":
    "You muted {name}. Their posts are hidden from you.",
  "profileMenu.unmutedToast": "You unmuted {name}.",
  "profileMenu.unblockedToast": "You unblocked {name}.",
  "profileMenu.blockedToast": "You blocked {name}.",
  "profileMenu.blockedReportedToast":
    "You blocked {name} and sent a report to the moderation team.",
  "profileMenu.withdrawVouchConfirmTitle": "Withdraw your vouch for {name}?",
  "profileMenu.withdrawVouchConfirmBody":
    "{name} will no longer be able to count your vouch toward their standing on QueerPulse. You can vouch for them again later.",
  "profileMenu.withdrawVouchConfirmCta": "Withdraw vouch",
  "profileMenu.withdrawVouchToast": "You withdrew your vouch for {name}.",
  "blockModal.title": "Block {name}?",
  "blockModal.body":
    "Blocking severs any connection between you. {name} won't be able to view your profile, message you, or find you in search, and neither of you can connect with the other. You can unblock later.",
  "blockModal.reportCheckbox": "Also report {name} to the moderation team",
  "blockModal.reasonCodeLabel": "What happened?",
  "blockModal.reasonCodeHelper":
    "This is what the moderation team sees first, and it sets how fast the report is picked up.",
  "blockModal.reasonLabel": "Reason (optional)",
  "blockModal.reasonPlaceholder": "Add any context for the moderation team…",
  "blockModal.cancelCta": "Cancel",
  "blockModal.confirmCta": "Block {name}",

  // ── AppealOutcomePage.tsx ──────────────────────────────────────────────
  "appeal.state.pending": "Pending",
  "appeal.state.overturned": "Overturned",
  "appeal.state.upheld": "Upheld",
  "appeal.timeline.filed": "Report filed",
  "appeal.timeline.submitted": "Appeal submitted",
  "appeal.timeline.decision": "Decision",

  "appeal.pending.title": "We're <em>reviewing</em> your appeal",
  "appeal.pending.sub":
    "A moderator who was not involved in the original decision reads your case. The date below is the deadline we hold ourselves to.",
  "appeal.ref.label": "Appeal reference",
  "appeal.pending.submittedLabel": "Submitted",
  "appeal.pending.expectedLabel": "Expected response",
  "appeal.pending.info":
    "<strong>While your appeal is under review:</strong> the original decision remains in place, but no further action will be taken. The outcome shows up right here. Check back on this page, or sign in and open your appeals to see where it stands.",
  "appeal.pending.govLink": "How moderation works",

  "appeal.overturned.title": "Your appeal was <em>successful</em>",
  "appeal.overturned.sub":
    "After reviewing your case, we've reversed the original decision. We're sorry for the inconvenience.",
  "appeal.decisionLabel": "Decision",
  "appeal.overturned.decisionValue": "Overturned",
  "appeal.decidedOnLabel": "Decided on",
  "appeal.overturned.info":
    "<strong>What's been restored:</strong> the warning on your account has been removed, and your content is visible again. Your account standing is unchanged.",
  "appeal.overturned.profileCta": "Return to your profile",
  "appeal.overturned.guidelinesCta": "View community guidelines",

  "appeal.upheld.title": "We've <em>reviewed</em> your appeal",
  "appeal.upheld.sub":
    "After careful consideration, we've determined that the original decision was appropriate.",
  "appeal.upheld.outcomeLabel": "Outcome",
  "appeal.upheld.outcomeValue": "Original decision stands",
  "appeal.upheld.info":
    "<strong>Going forward:</strong> the account warning remains on your record for 90 days and will not affect your ability to participate in most community activities. Repeated violations may result in further review.",
  "appeal.upheld.contactNote":
    "If you believe this is in error, you can contact our Trust team directly.",
  "appeal.upheld.contactCta": "Message the Trust team",

  // Live-mode-only: the real appeal fetched from `GET /appeals/me`.
  "appeal.live.error.title": "We couldn't load your appeal",
  "appeal.live.error.desc":
    "Something went wrong fetching your appeal status. Try refreshing the page.",
  "appeal.live.empty.title": "No appeals on file",
  "appeal.live.empty.desc":
    "You haven't filed an appeal against a moderation decision. If one's been made against your account, you can contest it here.",
  "appeal.live.empty.cta": "File an appeal",
  "appeal.live.decisionNoteLabel": "Moderator's note",

  // ── AppealSubmitPage.tsx ───────────────────────────────────────────────
  "appealSubmit.kicker": "Appeal a decision",
  "appealSubmit.heading": "Tell us what we <em>got wrong</em>",
  "appealSubmit.lead":
    "A different moderator than the one who made the decision will read this. Be specific: what happened, and why the decision doesn't sit right with you.",
  "appealSubmit.form.reasonLabel": "Your appeal",
  "appealSubmit.form.reasonHelper":
    "The more context you give, the more there is to reconsider. At least a sentence or two.",
  "appealSubmit.form.reasonPlaceholder":
    "Walk us through what happened from your side…",
  "appealSubmit.form.charCount": "{count} / {max}",
  "appealSubmit.form.submitCta": "Submit appeal",
  "appealSubmit.form.submitting": "Sending…",
  "appealSubmit.form.ladderCta": "Read the community ladder",
  "appealSubmit.notice":
    "<b>While your appeal is reviewed,</b> the original decision stays in place. A different moderator decides it within {days} days, and the outcome lands on this page with the date it is due. Check back, or reopen your appeal any time to see where it stands.",
  "appealSubmit.windowClosed.contactCta": "Write to the moderation team",
  "appealSubmit.windowClosed.bodyNoDate":
    "Appeals are open for {days} days after a decision, and the window for this one has closed. If something has changed since, or you could not reach this form in time, write to the moderation team and ask them to look again.",
  "appealSubmit.windowClosed.body":
    "Appeals are open for {days} days after a decision. This one closed on {date}. If something has changed since, or you could not reach this form in time, write to the moderation team and ask them to look again.",
  "appealSubmit.windowClosed.title":
    "The appeal window for this decision has closed",
  "appealSubmit.filingWindow":
    "Appeals are open for {days} days after a decision. The clock starts when the decision was taken, rather than when you read about it. Where there is no record of when that was, no deadline applies to you.",
  "appealSubmit.foot":
    "Every appeal, and how it was decided, is logged in our <a>transparency record</a>.",
  "appealSubmit.errorFrame": "Couldn't file your appeal",
  "appealSubmit.success.title": "Your appeal is <em>in</em>",
  "appealSubmit.success.sub":
    "A moderator who wasn't involved in the original decision will review it. The outcome shows up here. Track your appeal on this page to see it the moment it's decided.",
  "appealSubmit.success.filedLabel": "Filed",
  "appealSubmit.success.trackCta": "Track this appeal",
  "appealSubmit.success.howCta": "How moderation works",

  // ── HateCrimePage.tsx ──────────────────────────────────────────────────
  "hateCrime.meta.title":
    "Reporting a hate crime in Portugal: a step-by-step guide",
  "hateCrime.meta.description":
    "What counts as a hate crime in Portugal, how to document it safely, who to report it to, and where to find legal and community support afterwards.",
  "hateCrime.eyebrow": "Reporting guide · Portugal",
  "hateCrime.title.line1": "How to report",
  "hateCrime.title.line2": "<em>a hate crime.</em>",
  "hateCrime.sub":
    "Step-by-step: from the moment it happens to formal reporting, community support, and legal follow-up. Most people don't report because they don't know how. This guide removes that barrier.",
  "hateCrime.important":
    "<strong>Your safety comes first.</strong> If you are in immediate danger, call <strong>112</strong> now. This guide is for after you are safe.",
  "hateCrime.outro.title": "You have <em>rights.</em>",
  "hateCrime.outro.sub":
    "The QueerPulse community includes lawyers, legal professionals, and people who have been through this process. You do not have to navigate it alone.",
  "hateCrime.outro.legalCta": "Legal resources",

  // ── HateCrimeTabs.tsx — tab bar + sidebar ──────────────────────────────
  "hateCrime.tab.immediate": "Right now",
  "hateCrime.tab.document": "Document it",
  "hateCrime.tab.report": "Report formally",
  "hateCrime.tab.support": "Get support",
  "hateCrime.tab.law": "Portuguese law",

  "hateCrime.sidebar.emergencyTitle": "Emergency & immediate",
  "hateCrime.sidebar.emergencyServices": "Emergency services",
  "hateCrime.sidebar.apav.org": "APAV Victim Support",
  "hateCrime.sidebar.apav.role": "24h confidential",
  "hateCrime.sidebar.sosRacismo": "SOS Racismo (also covers identity)",
  "hateCrime.sidebar.legalTitle": "Legal & advocacy",
  "hateCrime.sidebar.ilga.org": "ILGA Portugal",
  "hateCrime.sidebar.ilga.role":
    "Free legal accompaniment, hate crime monitoring",
  "hateCrime.sidebar.ilga.anon": "Anonymous reporting",
  "hateCrime.sidebar.provedor.org": "Provedor de Justiça",
  "hateCrime.sidebar.provedor.role": "Ombudsman, if authorities fail to act",
  "hateCrime.sidebar.ilgaEurope.org": "ILGA Europe",
  "hateCrime.sidebar.ilgaEurope.role": "EU-level legal support",
  "hateCrime.sidebar.onTitle": "On QueerPulse",
  "hateCrime.sidebar.legalResourcesCta": "Legal Resources",
  "hateCrime.sidebar.mentalHealthCta": "Mental Health",
  "hateCrime.sidebar.solidarityCta": "Solidarity Pricing",
  "hateCrime.sidebar.reportCta": "Report to QueerPulse",

  // ── hateCrime.data.tsx — tag chips ─────────────────────────────────────
  "hateCrime.tag.immediate": "Immediate",
  "hateCrime.tag.ifHurt": "If physically hurt",
  "hateCrime.tag.recommended": "Recommended",
  "hateCrime.tag.ifApplicable": "If applicable",
  "hateCrime.tag.important": "Important",
  "hateCrime.tag.stronglyRecommended": "Strongly recommended",
  "hateCrime.tag.anonOptionAvailable": "Anonymous option available",
  "hateCrime.tag.afterDomesticProcess": "After domestic process",

  // ── hateCrime.data.tsx — "Right now" tab ───────────────────────────────
  "hateCrime.immediate.preamble":
    "The moments after an incident are disorienting. These steps help you protect yourself and preserve your options, without committing to anything yet.",
  "hateCrime.immediate.step1.title": "Get to safety",
  "hateCrime.immediate.step1.desc":
    "Leave the location if you can. Find a public space, a shop, a café, or somewhere you know. Do not feel obligated to confront the perpetrator or wait for anyone.",
  "hateCrime.immediate.step2.title": "Contact someone you trust",
  "hateCrime.immediate.step2.desc":
    "Call or message a friend, partner, or community member. You should not be alone right now. If no one is available, APAV's victim support line (116 006) is staffed 24 hours.",
  "hateCrime.immediate.step3.title": "Get medical attention if needed",
  "hateCrime.immediate.step3.desc":
    "If you were physically assaulted, go to the nearest hospital emergency room. Ask them to document your injuries. This documentation is evidence, even if you do not report to police.",
  "hateCrime.immediate.step4.title": "Write down what happened, now",
  "hateCrime.immediate.step4.desc":
    "While it is fresh: time, location, what was said or done, description of the perpetrator(s), any witnesses. Do this before you sleep. Memory degrades quickly after trauma. Use your phone notes if that is easiest.",
  "hateCrime.immediate.step5.title": "Preserve any evidence",
  "hateCrime.immediate.step5.desc":
    "Screenshots of messages. Photographs of damage or injuries. Do not wash clothes worn during the incident. Back up your phone if messages were involved.",

  // ── hateCrime.data.tsx — "Document it" tab ─────────────────────────────
  "hateCrime.document.preamble":
    "Good documentation gives you options. You can decide later whether to report formally, but the evidence will only exist if you collect it now.",
  "hateCrime.document.collectHeading": "What to <em>collect</em>",
  "hateCrime.document.step1.title": "Written account",
  "hateCrime.document.step1.desc":
    "Date, time, exact location. What was said or done, in as much detail as you remember. The perpetrator's appearance and any distinguishing features. Whether there were witnesses and who they were.",
  "hateCrime.document.step2.title": "Photographs",
  "hateCrime.document.step2.desc":
    "Injuries (dated photographs from multiple angles). Damage to property. The location itself. Any graffiti or materials left behind. Turn on location tagging in your phone camera before you take them.",
  "hateCrime.document.step3.title": "Digital evidence",
  "hateCrime.document.step3.desc":
    "Screenshots of messages, social media posts, or emails, including the URL, username, and timestamp visible. Screenshot the profile as well as the message. Save locally and to cloud storage.",
  "hateCrime.document.step4.title": "CCTV",
  "hateCrime.document.step4.desc":
    "If the incident happened in a commercial area, there may be CCTV footage. Act quickly. Most systems overwrite after 72 hours. You can request the footage yourself or ask police to do so when you report.",
  "hateCrime.document.step5.title": "Witness information",
  "hateCrime.document.step5.desc":
    "If there were witnesses, ask for their contact details. Even a name and phone number helps. You do not need to pressure anyone, just ask.",
  "hateCrime.document.keepHeading": "Where to <em>keep it</em>",
  "hateCrime.document.note":
    "Store everything in at least two places: your phone and a cloud service (email to yourself works). If you contact ILGA Portugal or APAV, they can help you organise your evidence file.",

  // ── hateCrime.data.tsx — "Report formally" tab ─────────────────────────
  "hateCrime.report.preamble":
    "You have options. Formal police reporting is one path among several. You can also report anonymously through civil society organisations, or choose not to report at all. Your choice is valid regardless.",
  "hateCrime.report.policeHeading": "Option 1: <em>PSP / GNR (Police)</em>",
  "hateCrime.report.police.step1.title": "Go to your nearest police station",
  "hateCrime.report.police.step1.desc":
    "For hate crimes in Lisbon, the PSP (Polícia de Segurança Pública) has jurisdiction. You can report in person or online at queixaselectronicas.mai.gov.pt for less serious offences.",
  "hateCrime.report.police.step2.title": "Ask for hate crime classification",
  "hateCrime.report.police.step2.desc":
    "Explicitly state that the crime was motivated by your sexual orientation or gender identity. Ask for it to be recorded as a hate crime (crime de ódio) under Article 132 of the Penal Code. Police may not do this automatically.",
  "hateCrime.report.police.step3.title": "Take accompaniment",
  "hateCrime.report.police.step3.desc":
    "You are allowed to bring a support person. ILGA Portugal offers free legal accompaniment for hate crime reports. Contact them before you go. Even 30 minutes of preparation helps.",
  "hateCrime.report.ilgaHeading": "Option 2: <em>ILGA Portugal</em>",
  "hateCrime.report.ilga.step1.title": "Report directly to ILGA",
  "hateCrime.report.ilga.step1.desc":
    "ILGA maintains its own hate crime monitoring system (independently of police). Reporting here is confidential and does not trigger automatic police contact. Your report contributes to advocacy and data.",
  "hateCrime.report.ilga.step2.title": "Legal support and accompaniment",
  "hateCrime.report.ilga.step2.desc":
    "If you want to report to police, ILGA can provide a volunteer or staff member to accompany you. They also offer legal guidance on what to expect from the process and how to assert your rights.",
  "hateCrime.report.euHeading": "Option 3: <em>EU mechanisms</em>",
  "hateCrime.report.eu.step1.title": "Provedor de Justiça (Ombudsman)",
  "hateCrime.report.eu.step1.desc":
    "If you believe authorities have failed to act on your report, you can complain to Portugal's Ombudsman (Provedor de Justiça) at provedor-jus.pt. Free, independent, and available to residents.",
  "hateCrime.report.eu.step2.title": "European Court of Human Rights",
  "hateCrime.report.eu.step2.desc":
    "For serious cases where all domestic remedies are exhausted, the ECHR at Strasbourg can be petitioned. This is a long process. ILGA Europe provides guidance and in some cases legal support.",

  // ── hateCrime.data.tsx — "Get support" tab ─────────────────────────────
  "hateCrime.support.preamble":
    "Reporting is not the only thing you need. Being the target of hate is traumatic, and that trauma is real regardless of whether a crime can be proven.",
  "hateCrime.support.immediateHeading": "Immediate <em>support</em>",
  "hateCrime.support.step1.title": "APAV: Victim Support",
  "hateCrime.support.step1.desc":
    "Free, confidential support for crime victims. Emotional support, practical help navigating the system, and legal information. 116 006, available nationally. Online support at apav.pt.",
  "hateCrime.support.step2.title": "ILGA Portugal: Community support",
  "hateCrime.support.step2.desc":
    "Beyond legal help, ILGA connects you with peer support and counselling. They understand the specific dimensions of LGBTQ+ hate crime. 213 887 615 · ilga-portugal.pt.",
  "hateCrime.support.step3.title": "QueerPulse Mental Health directory",
  "hateCrime.support.step3.desc":
    "Sliding-scale therapists with experience in trauma and identity-based violence. You do not have to wait to feel better. Early support makes a real difference.",
  "hateCrime.support.directoryCta": "See the directory",
  "hateCrime.support.longerTermHeading": "Longer <em>term</em>",
  "hateCrime.support.step4.title": "Peer support groups",
  "hateCrime.support.step4.desc":
    "ILGA Portugal runs monthly peer groups for people who have experienced hate crime. Sharing with others who have been through similar experiences is often the most useful thing. Ask ILGA for the current schedule.",
  "hateCrime.support.step5.title": "You do not have to process it alone",
  "hateCrime.support.step5.desc":
    "The QueerPulse forum has a private, moderated space for people who have experienced discrimination or violence. You can share as much or as little as you want.",
  "hateCrime.support.forumCta": "Go to the forum",

  // ── hateCrime.data.tsx — "Portuguese law" tab ──────────────────────────
  "hateCrime.law.preamble":
    "Understanding what the law actually says helps you assert your rights, and know when they are being violated.",
  "hateCrime.law.def1.h4": "What is a hate crime under Portuguese law?",
  "hateCrime.law.def1.para1":
    "Under Article 132 of the Penal Code (Código Penal), a crime committed with hate motivation, including sexual orientation and gender identity, is an aggravating circumstance. This means the same act (assault, damage, harassment) carries a higher sentence when proven to be motivated by hatred of the victim's identity.",
  "hateCrime.law.def1.para2":
    "Additionally, the Lei contra a discriminação (Law 93/2017) prohibits discrimination based on sexual orientation and gender identity in access to goods, services, housing, and employment.",
  "hateCrime.law.def2.h4": "What counts as a hate crime?",
  "hateCrime.law.def2.para1":
    "Physical assault, threats, harassment, intimidation, property damage, incitement to hatred, and online abuse can all be hate crimes when motivated by the victim's sexual orientation or gender identity. The motivation must be established, which is why documentation and the way you frame your report matter.",
  "hateCrime.law.def3.h4": "Online hate crimes",
  "hateCrime.law.def3.para1":
    "Threats and harassment online are crimes in Portugal. Report to the platform AND to police. Preserve screenshots immediately. Platforms delete reported content and perpetrators can delete their accounts. You can also report to the Autoridade Nacional de Comunicações (ANACOM) for persistent platform inaction.",
  "hateCrime.law.def4.h4": "If the police don't take it seriously",
  "hateCrime.law.def4.para1":
    "You have the right to ask for a different officer. You can escalate within the PSP to a supervisor. You can contact the Inspeção-Geral da Administração Interna (IGAI) to complain about police conduct. ILGA Portugal accompaniment helps prevent this situation. Your report cannot be refused. You are entitled to a receipt (NUIPC number) when you make a formal complaint.",

  // ── safeSpacesPage.data.ts — CRITERIA / HOW ──────────────────
  "spaces.criteria.genderNeutral.lead": "Gender-neutral bathrooms",
  "spaces.criteria.genderNeutral.rest": " available or clearly accessible",
  "spaces.criteria.staffIntervene.lead": "Staff intervene",
  "spaces.criteria.staffIntervene.rest":
    " if a customer is being harassed or discriminated against",
  "spaces.criteria.noIncidents.lead": "No discriminatory incidents",
  "spaces.criteria.noIncidents.rest": " reported in the past 12 months",
  "spaces.criteria.transWelcome.lead": "Trans and non-binary people",
  "spaces.criteria.transWelcome.rest": " feel genuinely welcome and at home",
  "spaces.criteria.accessible.lead": "Accessible",
  "spaces.criteria.accessible.rest":
    ", or access limitations clearly communicated",
  "spaces.criteria.reviews.lead": "Minimum 3 independent visits",
  "spaces.criteria.reviews.rest": " from members with no stake in the place",
  "spaces.criteria.annualReview.lead": "Annual re-review",
  "spaces.criteria.annualReview.rest": ": status doesn't last forever",

  "spaces.how.step1.title": "Any member nominates",
  "spaces.how.step1.desc":
    "Submit a space with a brief note on why you think it should be verified. We acknowledge it in the app within 48 hours, and you can follow where it got to.",
  "spaces.how.step2.title": "Three independent visits",
  "spaces.how.step2.desc":
    "Three members with no stake in the place go there and write up what they found. The person who nominated it does not count towards the three, and neither do the owner or anyone who helps run it.",
  "spaces.how.step3.title": "The review team decides",
  // Step 3 is where the three-visit bar is actually enforced, so it is the one
  // step that has to name the exception. Fewer than three independent visits
  // refuses the award outright unless a reviewer writes down why.
  "spaces.how.step3.desc":
    "The review team reads the visits and decides whether the criteria are met. Under three independent visits the badge is refused, unless the team writes down why it is making an exception. Either way a written reason goes on the record with who decided and when, and the space is told after.",
  "spaces.how.step4.title": "Badge awarded",
  "spaces.how.step4.desc":
    "If it is approved, the space gets a trust tier and the badge on its directory listing, dated from the day it was granted. It is earned by meeting the standard.",
  "spaces.how.step5.title": "Annual re-review",
  "spaces.how.step5.desc":
    "A badge is dated, and a year later the space comes back into the review queue. No status here is permanent, and a flag brings a space back early.",
  "spaces.how.step6.title": "Any member can flag",
  "spaces.how.step6.desc":
    "If something changes (an incident, a shift in atmosphere), any member can flag the listing with a reason. Three separate flags suspend the badge straight away and open a review. The venue is never told who raised it.",

  // ── SafeSpacesPage.tsx ─────────────────────────────────────────────────
  "spaces.meta.title": "Verified LGBTQ+ safe spaces in Lisbon",
  "spaces.meta.description":
    "A community-reviewed directory of venues in Lisbon verified as genuinely LGBTQ+ safe, with member reviews, a verification badge, and a way to flag or nominate a space.",
  "spaces.hero.category": "Community verified",
  "spaces.hero.title": "Spaces that are actually <em>safe.</em>",
  // This used to read "Every venue on this list has been visited and reviewed
  // by multiple community members", which nothing enforced: the service
  // computed the independent-visit tally, wrote it into `safe_space_audits`,
  // and then awarded regardless of it. The tally now BLOCKS an award below
  // `SAFE_SPACE_REQUIRED_INDEPENDENT_VISITS`, and the one way past it is a
  // written reason that lands on the audit row and forces the public
  // provenance line to state the real visit count.
  //
  // So the guarantee is real and it has a door. This copy describes both, and
  // deliberately still never says "every": an override is rare, but it exists,
  // and an absolute claim would be false again the first time one is used.
  "spaces.hero.lead":
    "A badge here is earned. Three members with no stake in the place go, and each writes up what they found, before a review team decides against fixed criteria. Where the team grants a badge on fewer visits, it records why and the badge shows the real count. That rule binds awards made from today onward. Every badge is dated, comes back for review a year on, and can be taken back.",
  "spaces.hero.stat.verified": "verified spaces in Lisbon",
  "spaces.hero.stat.reviews": "member reviews submitted",
  // Labels `stats.removed`, which `DirectoryService.listSafeSpaces` computes
  // as the spaces standing in the REMOVED state right now. There is no date
  // filter anywhere in that query, so "this year" was simply wrong.
  "spaces.hero.stat.removed": "spaces that lost the badge",
  "spaces.dir.title": "Verified <em>spaces.</em>",
  // Shown only when no badge on the page carries a date, and while the fetch
  // is still in flight. It claims no freshness, because in that state the page
  // has none to claim. The dated version is `spaces.dir.lastCheck`.
  "spaces.dir.updated": "Member-maintained",
  // `{date}` is the newest badge date on the page (`stats.lastReVerifiedAt`),
  // localized by `fmt.date`. It replaced a hardcoded "Last updated June 2025"
  // that nothing produced and nothing could keep true.
  "spaces.dir.lastCheck": "Last badge check {date} · Member-maintained",
  "spaces.dir.nominateCta": "+ Nominate a space",
  "spaces.dir.browseLead":
    "Every verified space now lives in the local directory, filtered to just the ones that earned the badge.",
  "spaces.dir.browseCta": "Browse verified spaces",
  "spaces.outro.title": "Safety is <em>collective.</em>",
  "spaces.outro.sub":
    "Every review, every flag, every nomination makes this list more useful for everyone. It only works because the community maintains it.",
  "spaces.outro.safetyCta": "Safety & reporting",
  "spaces.outro.soberCta": "Sober & social",

  // ── SafeSpacesSections.tsx ─────────────────────────────────────────────
  "spaces.badge.visualNameLine1": "Community",
  "spaces.badge.visualNameLine2": "Verified",
  "spaces.badge.caption":
    "The badge venues can display, earned by meeting the standard",
  "spaces.badge.title": 'What <em>"verified"</em> actually means.',
  "spaces.badge.body":
    "Any venue can put a rainbow flag in the window during Pride. Verification means something different: it means community members have been there, assessed it against a clear set of criteria, and agreed it meets the standard. And it can be revoked.",
  "spaces.how.title": "How <em>verification</em> works.",
  "spaces.removed.title": "When a space <em>loses</em> its badge.",
  // Same number as `spaces.hero.stat.removed`, same correction: it counts the
  // spaces standing in the removed state right now, not removals within a
  // year. Pluralized because it is rendered with a live count.
  "spaces.removed.lead_one":
    "Verification can be revoked, and it is. A listing isn't a reward a venue keeps forever; it's a standard they keep meeting. When they stop, we say so, and we say why. Right now, {count} space on this list has lost its badge.",
  "spaces.removed.lead_other":
    "Verification can be revoked, and it is. A listing isn't a reward a venue keeps forever; it's a standard they keep meeting. When they stop, we say so, and we say why. Right now, {count} spaces on this list have lost theirs.",
  "spaces.removed.step1":
    "<span>3 flags</span> suspend the badge instantly, pending review.",
  "spaces.removed.step2":
    "<span>Panel review</span> reads every report against the criteria.",
  "spaces.removed.step3":
    "<span>Removed</span> if criteria fail or owners won't engage.",
  "spaces.removed.step4":
    "<span>Public reason</span>: every removal is recorded openly, in public view.",
  "spaces.removed.card.badge": "Removed",
  "spaces.removed.card.whyLink": "Why it was removed",
  "spaces.nominate.title": "Nominate a <em>space.</em>",
  "spaces.nominate.lead":
    "You've found somewhere that genuinely feels safe. Tell us about it. We do the rest.",
  "spaces.nominate.flagNote":
    "Noticed a verified space that's changed for the worse? Report it from its listing in the local directory, or contact us directly. Either way, it gets reviewed.",
  "spaces.nominate.namePlaceholder": "Space name",
  "spaces.nominate.addressPlaceholder": "Address or neighbourhood",
  "spaces.nominate.typeSelect.placeholder": "Type of space",
  "spaces.nominate.typeSelect.bar": "Bar",
  "spaces.nominate.typeSelect.club": "Club",
  "spaces.nominate.typeSelect.cafe": "Café",
  "spaces.nominate.typeSelect.healthcare": "Healthcare",
  "spaces.nominate.typeSelect.services": "Services",
  "spaces.nominate.typeSelect.arts": "Arts venue",
  "spaces.nominate.typeSelect.gym": "Gym / fitness",
  "spaces.nominate.typeSelect.other": "Other",
  "spaces.nominate.reasonPlaceholder":
    "Why do you think this space should be verified? Specific experiences help.",
  "spaces.nominate.submitCta": "Submit nomination",
  "spaces.nominate.submitting": "Submitting…",
  "spaces.nominate.error": "That didn't go through. Please try again.",
  "spaces.nominate.thanks.title": "Thank you. We're <em>on it.</em>",
  "spaces.nominate.thanks.textNamed":
    "Your nomination for <strong>{name}</strong> is in. The community is the reason this list means anything. Adding to it is genuinely a gift.",
  "spaces.nominate.thanks.textPlain":
    "Your nomination is in. The community is the reason this list means anything. Adding to it is genuinely a gift.",
  // The 48-hour window IS backed: `SAFE_SPACE_ACKNOWLEDGEMENT_HOURS`, a
  // moderator acknowledge endpoint, and a daily sweep that tells moderators
  // when a nomination has gone past it. What was vague is the delivery, so the
  // tail now names the one channel that exists. QueerPulse sends no email, and
  // "we'll keep you posted" was the kind of line a reader reads as one.
  "spaces.nominate.thanks.subInfo":
    "Here's what happens next: we acknowledge every nomination within <strong>48 hours</strong>. Then three verified members visit independently and review it against the criteria before a volunteer panel decides. Your notifications here in the app are where you'll hear each step.",
  "spaces.nominate.anotherCta": "Nominate another space",

  // ── SafeSpaceDetailPage.tsx ────────────────────────────────────────────
  "spaces.detail.backLink": "Safe spaces",
  "spaces.detail.trust.title": "Verified safe space · Tier {tier}",
  "spaces.detail.trust.titleNoTier": "Verified safe space",
  "spaces.detail.trust.body":
    "<strong>This space meets the Safe Spaces criteria</strong> and was visited by QueerPulse moderators in the last 12 months. Last re-verified <strong>{date}</strong> · {verifier}.",
  "spaces.detail.relyTitle": "What you can rely on, <em>here</em>",
  // "We check in twice a year" named a cadence nothing implements and that
  // contradicted the one that IS implemented: the re-review interval is 365
  // days (`SAFE_SPACE_RE_REVIEW_INTERVAL_DAYS`), with a daily sweep raising
  // every badge that passes it.
  "spaces.detail.relySub":
    "Every verified space commits to these. A badge comes back for review a year after it is granted.",
  "spaces.detail.vouchedTitle_one": "Vouched by <em>{count} member</em>",
  "spaces.detail.vouchedTitle_other": "Vouched by <em>{count} members</em>",
  "spaces.detail.vouchedSub":
    "Independent safety reviews from verified members.",
  "spaces.detail.addVouchCta": "Add yours",
  "spaces.detail.whereTitle": "Where",
  "spaces.detail.backAllCta": "Back to all spaces",
  "spaces.detail.glanceTitle": "At a glance",
  "spaces.detail.shareTitle": "If a friend needs a place",
  "spaces.detail.shareBody":
    "Send them this exact page. Everything here (the promises, the vouches, the exits) is what they can rely on.",
  "spaces.detail.copyLinkCta": "Copy link to share",
  "spaces.detail.linkCopiedToast": "Link copied",

  "spaces.detail.removedEyebrow": "Removed from safe spaces · {type} · {hood}",
  "spaces.detail.removedMeta.removed": "Removed",
  "spaces.detail.removedMeta.listedSince": "Listed since",
  "spaces.detail.removedMeta.flags": "Member flags",
  "spaces.detail.whyRemovedTitle": "Why it was <em>removed</em>",
  "spaces.detail.howHappenedTitle": "How it <em>happened</em>",
  "spaces.detail.howHappenedSub":
    "Every removal follows the same steps, in the open.",
  "spaces.detail.whatNowTitle": "What this means now",
  "spaces.detail.hadExperienceTitle": "Had an experience here?",
  "spaces.detail.hadExperienceBody":
    "The record stays open. If something happened to you here, telling us still helps. It informs any future re-review.",
  "spaces.detail.fileReportCta": "File a report",
  "spaces.detail.lookingForTitle": "Looking for somewhere safe?",
  // `{count}` is the live `stats.verified` from `GET /directory/safe-spaces`,
  // replacing a hardcoded `VERIFIED_COUNT = 47` in `SafeSpaceDetailPage`. The
  // trailing "+" went with it: the number is now exact, so padding it would
  // undo the fix. `lookingForBodyPlain` covers the in-flight fetch, where the
  // count is 0 and there is no honest number to print.
  "spaces.detail.lookingForBody_one":
    "This space is delisted. {count} other space across Lisbon still holds the badge. Go there instead.",
  "spaces.detail.lookingForBody_other":
    "This space is delisted. {count} others across Lisbon still hold the badge. Find one near you.",
  "spaces.detail.lookingForBodyPlain":
    "This space is delisted. Other spaces across Lisbon still hold the badge. Find one near you.",
  "spaces.detail.seeVerifiedCta": "See verified spaces",

  // ── VouchModal.tsx ─────────────────────────────────────────────────────
  "vouchModal.ariaLabel": "Vouch for this space",
  "vouchModal.closeAriaLabel": "Close",
  "vouchModal.success.title": "Your vouch is <em>in.</em>",
  "vouchModal.success.body":
    "Thank you for standing behind <strong>{spaceName}</strong>. Member vouches are how others know a space is safe before they ever walk in. Yours will appear once a moderator confirms it.",
  "vouchModal.success.doneCta": "Done",
  "vouchModal.form.eyebrow": "Add your vouch",
  "vouchModal.form.title": "Stand behind <em>{spaceName}</em>",
  "vouchModal.form.lead":
    "A vouch is a short, honest note about why this space feels safe to you. Specifics help other members trust it.",
  "vouchModal.form.relationshipLabel": "How do you know this space?",
  "vouchModal.relationship.regular": "I go here regularly",
  "vouchModal.relationship.onceOrTwice": "I've been once or twice",
  "vouchModal.relationship.workOrVolunteer": "I work or volunteer here",
  "vouchModal.relationship.withFriend": "I came with a friend who needed it",
  "vouchModal.form.noteLabel": "Your note",
  "vouchModal.form.notePlaceholder":
    "What makes this space feel safe to you? Staff, atmosphere, accessibility, a moment that mattered…",
  "vouchModal.form.charsRemaining_one": "{count} more character to submit",
  "vouchModal.form.charsRemaining_other": "{count} more characters to submit",
  "vouchModal.form.charsCount_one": "{count} character",
  "vouchModal.form.charsCount_other": "{count} characters",
  "vouchModal.form.cancelCta": "Cancel",
  "vouchModal.form.submitting": "Submitting…",
  "vouchModal.form.submitCta": "Add my vouch",
  "vouchModal.form.error": "That didn't go through. Please try again.",

  // ── SafeSpaceBadgeStatus.tsx — the honest badge states ────────────────
  "badge.state.none.title": "No safe-space badge",
  "badge.state.none.lead":
    "Nobody has nominated this place for a safe-space review yet.",
  "badge.state.under_review.title": "Under review",
  "badge.state.under_review.lead":
    "This place has been nominated and members are visiting it now. It carries no badge yet.",
  "badge.state.verified.title": "Verified safe space",
  "badge.state.verified.titleTier": "Verified safe space · Trust tier {tier}",
  "badge.state.verified.lead":
    "Members with no stake in this place went there and it met the standard. The badge can be suspended if things change.",
  "badge.state.due.title": "Verified, and due for its yearly re-review",
  "badge.state.due.lead":
    "The badge still stands. A year has passed since it was granted, so this space is in the queue for a fresh set of visits.",
  "badge.state.suspended.title": "Badge suspended while this is reviewed",
  "badge.state.suspended.lead":
    "The badge is on hold, so treat this space as unverified for now. We will say here when the review closes.",
  "badge.state.removed.title": "Badge removed",
  "badge.state.removed.lead":
    "This space no longer meets the standard. The record of why stays public.",
  "badge.fact.visits": "Independent visits",
  "badge.fact.visitsValue": "{count} of {required}",
  "badge.fact.awarded": "Badge granted",
  "badge.fact.reReview": "Next re-review",
  "badge.fact.verifier": "Reviewed by",

  // ── SafeSpaceFlagControl.tsx / SafeSpaceFlagModal.tsx ──────────────────
  "flag.prompt": "Noticed something different here?",
  "flag.openCta": "Raise it with us",
  "flag.alreadyNote":
    "You have raised something about this space. The review team has it.",
  "flag.withdrawCta": "Withdraw",
  "flag.withdrawnToast": "Withdrawn",
  "flag.errorToast": "That didn't go through. Please try again.",
  "flag.modal.title": "Raise something about {name}",
  "flag.modal.sub": "The review team reads every one of these.",
  "flag.modal.privacy":
    "Your name never reaches the venue. Only the review team sees this, the same way the author of a report stays private.",
  "flag.modal.reasonLabel": "What is this about?",
  "flag.modal.detailLabel": "Anything you want to add",
  "flag.modal.detailHelper":
    "Optional, and only moderators read it. Leave out anything you would rather not have written down.",
  "flag.modal.detailPlaceholder": "What happened, and when",
  "flag.modal.cancelCta": "Cancel",
  "flag.modal.sendCta": "Send to the review team",
  "flag.modal.sendingCta": "Sending…",
  "flag.reason.not_safe.label": "It did not feel safe",
  "flag.reason.not_safe.desc":
    "Something happened, or the atmosphere has changed.",
  "flag.reason.discrimination.label": "Discrimination",
  "flag.reason.discrimination.desc":
    "Someone was treated badly for who they are.",
  "flag.reason.staff_conduct.label": "Staff conduct",
  "flag.reason.staff_conduct.desc": "How the people working there behaved.",
  "flag.reason.accessibility.label": "Access has got worse",
  "flag.reason.accessibility.desc":
    "Getting in is harder than the listing says.",
  "flag.reason.closed_or_changed.label": "Closed or under new ownership",
  "flag.reason.closed_or_changed.desc":
    "The place has changed hands, moved, or shut.",
  "flag.reason.other.label": "Something else",
  "flag.reason.other.desc": "Tell us in your own words.",
  "flag.done.title": "Thank you",
  "flag.done.panelTitle": "The review team",
  "flag.done.panelEm": "has this.",
  "flag.done.alreadyTitle": "You already raised",
  "flag.done.alreadyEm": "this one.",
  "flag.done.body":
    "Nothing about this is public. The venue is told a review is open, and never who opened it.",
  "flag.done.step.read": "A moderator reads it and decides what happens next.",
  "flag.done.step.anonymous": "{name} is never told who raised this.",
  "flag.done.step.threshold":
    "{count} separate flags put the badge on hold straight away while the review runs.",
  "flag.done.closeCta": "Close",

  // ── AdminSafeSpaceNominationsPage.tsx — the review queue ───────────────
  "governance.nominations.title": "Nomination <em>queue.</em>",
  "governance.nominations.sub":
    "Oldest first, because the published promise is a nomination acknowledged within 48 hours. Anything past the window is marked.",
  "governance.scope.open": "Open",
  "governance.scope.decided": "Decided",
  "governance.scope.all": "All",
  "governance.sort.oldest": "Oldest first",
  "governance.sort.newest": "Newest first",
  "governance.filter.breachedOnly": "Past the window only",
  "governance.filter.searchPlaceholder": "Search by place name",
  "governance.summary.inQueue_one": "{count} nomination in this view.",
  "governance.summary.inQueue_other": "{count} nominations in this view.",
  "governance.summary.breaching_one":
    "{count} is past the {hours}-hour acknowledgement window.",
  "governance.summary.breaching_other":
    "{count} are past the {hours}-hour acknowledgement window.",
  "governance.summary.flags_one":
    "{count} flag in this view. {threshold} open flags on one space suspend its badge automatically.",
  "governance.summary.flags_other":
    "{count} flags in this view. {threshold} open flags on one space suspend its badge automatically.",
  "governance.summary.reReview_one": "{count} badge is past its yearly check.",
  "governance.summary.reReview_other":
    "{count} badges are past their yearly check.",
  "governance.empty": "Nothing in this view right now.",
  "governance.loadError.nominations.title": "The nomination queue didn't load",
  "governance.loadError.nominations.body":
    "This is an outage on our side, so the queue below is blank because nothing arrived. Places may still be waiting. Try again.",
  "governance.loadError.flags.title": "The flag queue didn't load",
  "governance.loadError.flags.body":
    "This is an outage on our side, so the queue below is blank because nothing arrived. Flags may still be open. Try again.",
  "governance.loadError.reReview.title": "The re-review list didn't load",
  "governance.loadError.reReview.body":
    "This is an outage on our side. Badges may still be past their yearly check. Try again.",
  "governance.status.pending": "Waiting",
  "governance.status.acknowledged": "Acknowledged",
  "governance.status.in_review": "In review",
  "governance.status.approved": "Badge granted",
  "governance.status.rejected": "Declined",
  "governance.chip.breached": "Past {hours}h",
  "governance.chip.acknowledgedLate": "Acknowledged late",
  "governance.chip.visits": "{count}/{required} visits",
  "governance.chip.unassigned": "No listing yet",
  "governance.row.age_one": "Waiting {hours} hour",
  "governance.row.age_other": "Waiting {hours} hours",
  "governance.detail.nominatorWords": "In the nominator's words",
  "governance.detail.clock": "The 48-hour clock",
  "governance.detail.received": "Received",
  "governance.detail.dueBy": "Acknowledgement due",
  "governance.detail.acknowledged": "Acknowledged",
  "governance.detail.notYet": "Not yet",
  "governance.detail.placeType": "Type of place",
  "governance.detail.address": "Address",
  "governance.detail.assignmentNote": "What the visitors were asked to check",
  "governance.detail.decision": "Decision and reason",
  "governance.detail.trail": "Audit trail",
  "governance.detail.trailEmpty": "Nothing recorded on this one yet.",
  "governance.detail.decide": "Move this nomination",
  "governance.detail.openListingCta": "Open the listing",
  "governance.visits.title": "Three independent visits",
  "governance.visits.unassigned":
    "No listing is tied to this nomination yet, so there is nothing to count visits against. Assign it below to open it for visits.",
  "governance.visits.met":
    "{count} of {required} independent visits. The bar is met.",
  "governance.visits.short":
    "{count} of {required} independent visits. The bar is not met yet.",
  "governance.visits.notIndependent_one":
    "{count} more vouch is on file from someone with a stake in the place (the owner, someone who helps run it, or the nominator). It does not count.",
  "governance.visits.notIndependent_other":
    "{count} more vouches are on file from people with a stake in the place (the owner, someone who helps run it, or the nominator). They do not count.",
  "governance.visits.whoNote":
    "The visit write-ups sit on the space's own page. You decide, and the count is reported here so the record shows what you decided against.",
  "governance.audit.nomination_acknowledged": "Acknowledged",
  "governance.audit.nomination_assigned": "Assigned to a listing",
  "governance.audit.nomination_awarded": "Badge granted",
  "governance.audit.nomination_declined": "Declined",
  "governance.audit.nomination_reopened": "Re-opened",
  "governance.audit.flag_raised": "Flag raised",
  "governance.audit.flag_withdrawn": "Flag withdrawn",
  "governance.audit.flag_resolved": "Flag resolved",
  "governance.audit.badge_suspended": "Badge suspended",
  "governance.audit.badge_restored": "Badge restored",
  "governance.action.acknowledgeLabel": "Acknowledge this nomination",
  "governance.action.acknowledgeHelper":
    "Stops the 48-hour clock and tells the nominator a reviewer has it. Any note stays internal.",
  "governance.action.notePlaceholder": "Internal note (optional)",
  "governance.action.acknowledgeCta": "Acknowledge",
  "governance.action.assignLabel": "Listing under review",
  "governance.action.assignHelper":
    "The listing ref or slug. Assigning opens the nomination for member visits, and acknowledges it if nobody has yet.",
  "governance.action.assignPlaceholder": "listing-ref or slug",
  "governance.action.assignCta": "Assign for visits",
  "governance.action.reasonLabel": "Reason for the decision",
  "governance.action.reasonHelper":
    "Required either way. The nominator reads this, so write it to them.",
  "governance.action.tierLabel": "Trust tier to award",
  "governance.action.tierOption": "Tier {tier}",
  "governance.action.awardCta": "Grant the badge",
  "governance.action.declineCta": "Decline",
  // Shown only when the tally is under the bar. `{min}` is the backend's
  // `@MinLength(20)` on `belowVisitBarReason`, quoted here so the reviewer
  // reads the requirement before the button explains it by staying disabled.
  "governance.action.belowBarLabel": "Reason for granting below the visit bar",
  "governance.action.belowBarHelper":
    "This space has {count} of {required} independent visits, so the badge is refused without a written exception. At least {min} characters. It goes on the audit record, and the public badge will state the real count.",
  "governance.action.reopenLabel": "Reason for re-opening",
  "governance.action.reopenHelper":
    "Puts the nomination back in the queue. The reason goes on the record.",
  "governance.action.reopenCta": "Re-open",
  "governance.toast.acknowledged": "Acknowledged",
  "governance.toast.assigned": "Assigned for visits",
  "governance.toast.awarded": "Badge granted",
  "governance.toast.declined": "Declined",
  "governance.toast.reopened": "Re-opened",
  "governance.toast.failed": "That didn't go through. Please try again.",
  "governance.toast.flagUpheld": "Flag upheld",
  "governance.toast.flagDismissed": "Flag dismissed",
  "governance.toast.suspended": "{name}'s badge is suspended",
  "governance.toast.restored": "{name}'s badge is back",

  // ── AdminSafeSpaceFlagsPage.tsx — flags, suspensions, re-review ────────
  "governance.tab.nominations": "Nominations",
  "governance.tab.flags": "Flags",
  "governance.tab.listings": "Listings",
  "governance.tab.reReview": "Badges due",
  "governance.flags.title": "Flags and <em>suspensions.</em>",
  "governance.flags.sub":
    "What members raised about badged spaces, and which badges are on hold or past their yearly check.",
  "governance.flagState.open": "Open",
  "governance.flagState.resolved": "Resolved",
  "governance.flagState.all": "All",
  "governance.flags.empty": "No flags in this view.",
  "governance.flags.privacyNote":
    "Moderators only. Never tell a venue who flagged it, and never let a count or a timing make it guessable.",
  "governance.flags.unknownSpace": "Unknown space",
  "governance.flags.reviewCta": "Review",
  "governance.flags.dismissCta": "Dismiss",
  "governance.flags.upholdCta": "Uphold",
  "governance.flags.noteLabel": "Note for the record",
  "governance.flags.notePlaceholder": "What you found, and what happens next",
  "governance.flags.resolution.upheld": "Upheld",
  "governance.flags.resolution.dismissed": "Dismissed",
  "governance.reReview.empty": "Every badge is inside its year.",
  "governance.reReview.suspendedChip": "Suspended",
  "governance.reReview.dueChip_one": "{days} day overdue",
  "governance.reReview.dueChip_other": "{days} days overdue",
  "governance.reReview.openFlags_one": "{count} open flag",
  "governance.reReview.openFlags_other": "{count} open flags",
  "governance.reReview.awarded": "Granted {date}",
  "governance.reReview.noAwardDate": "No grant date on record",
  "governance.reReview.openCta": "Open the listing",
  "governance.badge.suspendTitle": "Suspend this badge",
  "governance.badge.restoreTitle": "Lift this suspension",
  "governance.badge.suspendCta": "Suspend",
  "governance.badge.restoreCta": "Restore",
  "governance.badge.cancelCta": "Cancel",
  "governance.badge.suspendNote":
    "The badge stops rendering as verified everywhere at once. The grant itself is untouched and comes back when you restore it.",
  "governance.badge.restoreNote":
    "The badge speaks for the space again from the moment you restore it.",
  "governance.badge.reasonLabel": "Reason",
  "moderationStance.head": "How we read these",
  "moderationStance.rule.politicalSpeech":
    "Criticism of a state, its government, its military, or its policies is political speech, and Palestine advocacy is welcome here. Advocacy aimed at a class of member is not political speech, whatever vocabulary it borrows.",
  "moderationStance.rule.noBothSides":
    "Whether a member deserves rights is not a debate we host. Do not dismiss a report on the grounds that the other side deserves a hearing.",
  "moderationStance.rule.neverProveGender":
    "Never ask a member to prove their gender, and close any report that amounts to that request. Self-identification is the standard.",
  "moderationStance.applicantHead": "You are reviewing a person",
  "moderationStance.applicantRule.neverProveIdentity":
    "Never ask an applicant to prove their gender, their queerness, or their identity, and never decline someone because you doubt it. Self-identification is the standard here as everywhere else.",
  "moderationStance.applicantRule.politicsNotAScreen":
    "Politics is not a screening test. Support for Palestinian liberation is not a flag. Organising against a class of member is, and that is the only political read we make.",
  "moderationStance.applicantRule.judgeTheApplication":
    "Judge what the person wrote. A name, a photo, a way of writing, or an accent in their answers is not evidence of anything, and acting on it is the failure this queue is most prone to.",
  "moderationStance.link.guidelines": "Guidelines: the hard lines",
  "moderationStance.link.stand": "Where we stand",
  "moderationStance.digest.guidelines.eyebrow": "Community Guidelines",
  "moderationStance.digest.guidelines.label": "The hard lines",
  "moderationStance.digest.guidelines.title": "Know the <em>hard lines</em>",
  "moderationStance.digest.guidelines.lead":
    "The conduct that is always a Code of Conduct matter, and the clause that separates political speech from it.",
  "moderationStance.digest.guidelines.p1":
    "The guidelines describe the culture. The hard lines are the enforceable part of them: harassment or targeted personal attacks, doxxing, outing someone without their consent, threats or intimidation, sharing private conversations or photos without consent, and discrimination on any protected basis.",
  "moderationStance.digest.guidelines.p2":
    "The political-speech clause sits beside them. Criticising a state, its government, its military, or its ideology is political speech and is moderated as political speech, advocacy for Palestinian liberation included. It becomes a Code of Conduct matter when it lands on a person: holding a member answerable for a state's actions because of their ethnicity, religion, or nationality, or campaigning for the exclusion of a class of member, whatever vocabulary it borrows.",
  "moderationStance.digest.guidelines.point.oneTest.title":
    "One test decides it.",
  "moderationStance.digest.guidelines.point.oneTest.body":
    "Is this about a state and its conduct, or about a person and who they are. That is the whole question.",
  "moderationStance.digest.guidelines.point.bothDirections.title":
    "Both directions are enforced the same way.",
  "moderationStance.digest.guidelines.point.bothDirections.body":
    "Antisemitism and anti-Palestinian racism are both breaches, and the platform's own position on Palestine does not change how a case is handled.",
  "moderationStance.digest.guidelines.point.outcomes.title":
    "A confirmed breach carries a consequence.",
  "moderationStance.digest.guidelines.point.outcomes.body":
    "A warning, a suspension, or removal, and cooperation with the authorities where someone's safety is at risk.",
  "moderationStance.digest.guidelines.cta": "Read the full guidelines",
  "moderationStance.digest.stand.eyebrow": "Where we stand",
  "moderationStance.digest.stand.label": "Where we stand",
  "moderationStance.digest.stand.title":
    "Queer liberation is <em>indivisible.</em>",
  "moderationStance.digest.stand.lead":
    "The published positions a decision here is measured against, in short.",
  "moderationStance.digest.stand.p1":
    "Trans women are women, trans men are men, nonbinary people are nonbinary, and intersex people exist. None of it is held tentatively and none of it is open for debate on this platform. Self-identification is the standard, so no member and no applicant is ever asked to prove their gender.",
  "moderationStance.digest.stand.p2":
    "Israel is committing a genocide against Palestinians in Gaza, and QueerPulse stands with Palestinians. Advocacy for Palestinian liberation is welcome here and is moderated as political speech. Sex work is work, migration is a queer issue, and U = U: serophobia falls under the same hard line as any other discrimination.",
  "moderationStance.digest.stand.point.notADebate.title":
    "Membership is not a debate topic.",
  "moderationStance.digest.stand.point.notADebate.body":
    "There is no both-sides discussion about whether a member deserves rights, and no report is dismissed for the sake of balance.",
  "moderationStance.digest.stand.point.speechVsExclusion.title":
    "Criticising a state is speech; campaigning against a class of member is a Code of Conduct matter.",
  "moderationStance.digest.stand.point.speechVsExclusion.body":
    "Calling it gender-critical leaves it exactly what it was.",
  "moderationStance.digest.stand.point.whenWeSpeak.title":
    "We speak where our community is implicated.",
  "moderationStance.digest.stand.point.whenWeSpeak.body":
    "That test is why these positions are published at all, and it is the standard to hold your own decision to.",
  "moderationStance.digest.stand.cta": "Read the full position",

  // ── Muted-members list (PRD-07) / BlockedUsersPane.tsx ───────────────────
  // Person mutes were stored server-side (`GET /mutes`) and hydrated app-wide
  // long before anything showed them back to the member who placed them. This
  // group is that list, living beside the blocked list in the same settings
  // pane. It is `safety:` rather than `settings:` because mute is a safety
  // primitive and this copy is owned with the rest of the block/mute flow.
  "blockedMembers.row.unblockLabel": "Unblock {name}",
  "mutedMembers.section.muted": "Muted",
  "mutedMembers.note":
    "Muting is one-way and silent. Nobody here was told, nobody here was removed from anything, and you can bring any of them back with one tap.",
  "mutedMembers.row.mutedOn": "Muted {date}",
  "mutedMembers.row.deletedMember": "Deleted member",
  "mutedMembers.row.unmuteCta": "Unmute",
  "mutedMembers.row.unmuteLabel": "Unmute {name}",
  "mutedMembers.empty.none.title": "You haven't muted anyone",
  "mutedMembers.empty.none.desc":
    "Mute someone and their posts and comments go quiet for you, while they are never told. Everyone you mute is listed here so you can undo it.",
  "mutedMembers.empty.error.title": "We couldn't load your muted members",
  "mutedMembers.empty.error.desc":
    "Rather than show you a list we can't trust, we showed you nothing. Try again in a moment.",
  "mutedMembers.toast.unmuted": "{name} is unmuted.",
  "mutedMembers.toast.unmutedError":
    "We couldn't unmute that member. Try again.",
};

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
    "File a report about harassment, abuse, or an unsafe situation on QueerPulse. Report anonymously, or leave an email so the safety team can follow up.",
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
    "You submit a report. We respond within 24 hours. Here's exactly what happens in between: no black box, no vague reassurances.",
  "report.flow.step1.title": "You submit a report",
  "report.flow.step1.desc":
    "Via the button on any profile, message, or forum post, or directly through this page. You can report anonymously if needed.",
  "report.flow.step2.title": "Immediate acknowledgement",
  "report.flow.step2.desc":
    "You receive a confirmation within 1 hour. A real person is assigned to your report, not an automated queue.",
  "report.flow.step3.title": "Review within 24 hours",
  "report.flow.step3.desc":
    "We review the evidence, context, and history. For serious cases, the reported member's access is temporarily suspended during review.",
  "report.flow.step4.title": "Decision & action",
  "report.flow.step4.desc":
    "Possible outcomes: warning, temporary suspension, permanent removal. We communicate the outcome to you, with reasoning.",

  "report.form.title": "Make a <em>report.</em>",
  "report.form.lead":
    "Use this form for safety concerns, harassment, abuse, or any situation that made you feel unsafe. All reports are treated with full seriousness. There is no minimum threshold for what warrants a report.",
  "report.form.categoryLabel": "What are you reporting?",
  "report.form.categoryPlaceholder": "Select a category",
  "report.category.harassment": "Harassment or threats",
  "report.category.unwantedContact": "Unwanted contact or messages",
  "report.category.impersonation": "Misrepresentation or impersonation",
  "report.category.discrimination": "Discrimination",
  "report.category.venueSafety": "Unsafe behaviour at a gathering",
  "report.category.other": "Something else",
  "report.form.involvedLabel": "Who or what was involved (optional)",
  "report.form.involvedPlaceholder": "A name, a place, a link, whatever you have",
  "report.form.involvedHelper":
    "Written in your own words. This form can't attach a report to a profile or a post yet, so a moderator will read what you write here and find the record themselves.",
  // Prefixes the "who or what" line inside the report body sent to moderators.
  "report.detail.involvedLine": "Who or what was involved: {involved}",
  "report.form.detailLabel": "What happened?",
  "report.form.detailPlaceholder":
    "Tell us what happened, with as much detail as you're comfortable sharing. There are no wrong answers.",
  "report.form.emailLabel": "Your contact email (optional, for follow-up)",
  "report.form.emailPlaceholder": "you@email.com",
  "report.form.submitting": "Submitting…",
  "report.form.submitCta": "Submit report",
  "report.form.fineprint":
    "Anonymous reports are accepted. If you leave an email, we'll follow up with you directly.",

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
  "report.toast.received": "Report received. We'll follow up within 24 hours.",
  "report.toast.submitError":
    "Couldn't send your report. It didn't reach us. Check your connection and try again.",

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
  "reason.other": "Something else, explained in detail",

  // ── FlagModal.tsx ──────────────────────────────────────────────────────
  "flag.modal.ariaLabel": "Flag this badge",
  "flag.modal.closeAriaLabel": "Close",
  "flag.success.title": "Flag <em>received.</em>",
  "flag.success.body":
    "Thank you. A moderator will read your report. <b>Three independent flags trigger an immediate review and temporary suspension of the badge</b>. Your report counts toward that. We may contact you for detail, but never the venue.",
  "flag.success.doneCta": "Done",
  "flag.error":
    "Couldn't send that flag. It didn't reach us. Check your connection and try again.",
  "flag.form.eyebrow": "Flag a safe space",
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
  "flag.form.confidentialNote":
    "Reports are confidential. Moderators see your name; the venue never does. In an emergency, call <strong>112</strong> first.",
  "flag.form.cancelCta": "Cancel",
  "flag.form.submitting": "Submitting…",
  "flag.form.submitCta": "Submit flag",
  "flag.reasonFallback": "concern",

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
  "profileMenu.mutedToast": "You muted {name}. Their posts are hidden from you.",
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
    "Our moderation team will look at your case carefully and respond within 5 business days.",
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
    "<b>While your appeal is reviewed,</b> the original decision stays in place. The outcome lands on this page, usually within a few days. Check back, or reopen your appeal any time to see where it stands.",
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
  "spaces.criteria.transWelcome.rest":
    " feel genuinely welcome and at home",
  "spaces.criteria.accessible.lead": "Accessible",
  "spaces.criteria.accessible.rest":
    ", or access limitations clearly communicated",
  "spaces.criteria.reviews.lead": "Minimum 3 independent reviews",
  "spaces.criteria.reviews.rest": " from verified QueerPulse members",
  "spaces.criteria.annualReview.lead": "Annual re-review",
  "spaces.criteria.annualReview.rest": ": status doesn't last forever",

  "spaces.how.step1.title": "Any member nominates",
  "spaces.how.step1.desc":
    "Submit a space with a brief note on why you think it should be verified. We acknowledge within 48 hours.",
  "spaces.how.step2.title": "Three independent visits",
  "spaces.how.step2.desc":
    "Three verified members visit the space independently and submit structured reviews against the criteria. They don't know each other's assessments.",
  "spaces.how.step3.title": "Review panel decides",
  "spaces.how.step3.desc":
    "A small volunteer panel reads the reviews and decides whether the criteria are met. The space isn't told the result until after the decision.",
  "spaces.how.step4.title": "Badge awarded",
  "spaces.how.step4.desc":
    "If approved, the venue receives a physical badge and a digital listing. They can display the badge in their window. It's earned by meeting the standard.",
  "spaces.how.step5.title": "Annual re-review",
  "spaces.how.step5.desc":
    "Every listing is re-reviewed each year. No status is permanent. New ownership, staff changes, or reported incidents trigger an early review.",
  "spaces.how.step6.title": "Any member can flag",
  "spaces.how.step6.desc":
    "If something changes (an incident, a shift in atmosphere), any member can flag the listing. Three flags trigger an immediate review and temporary suspension of the badge.",


  // ── SafeSpacesPage.tsx ─────────────────────────────────────────────────
  "spaces.meta.title": "Verified LGBTQ+ safe spaces in Lisbon",
  "spaces.meta.description":
    "A community-reviewed directory of venues in Lisbon verified as genuinely LGBTQ+ safe, not self-declared, with member reviews, a verification badge, and a way to flag or nominate a space.",
  "spaces.hero.category": "Community verified",
  "spaces.hero.title": "Spaces that are actually <em>safe.</em>",
  "spaces.hero.lead":
    "Not self-declared. Not a rainbow sticker in the window. Every venue on this list has been visited and reviewed by multiple community members, and can lose its status if things change.",
  "spaces.hero.stat.verified": "verified spaces in Lisbon",
  "spaces.hero.stat.reviews": "member reviews submitted",
  "spaces.hero.stat.removed": "spaces flagged & removed this year",
  "spaces.dir.title": "Verified <em>spaces.</em>",
  "spaces.dir.updated": "Last updated June 2025 · Member-maintained",
  "spaces.dir.nominateCta": "+ Nominate a space",
  "spaces.dir.filterAria": "Filter spaces by category",
  "spaces.dir.browseLead":
    "Every verified space now lives in the local directory, filtered to just the ones that earned the badge.",
  "spaces.dir.browseCta": "Browse verified spaces",
  "spaces.empty.title": "No verified spaces in this category yet",
  "spaces.empty.description":
    "The list grows as members visit and review places. Try another category, or nominate somewhere you already trust, and we'll get it reviewed.",
  "spaces.empty.clearCta": "Clear filters",
  "spaces.empty.nominateCta": "Nominate a space",
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
  "spaces.removed.lead":
    "Verification can be revoked, and it is. A listing isn't a reward a venue keeps forever; it's a standard they keep meeting. When they stop, we say so, and we say why. We removed {count} spaces this year.",
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
  "spaces.nominate.thanks.subInfo":
    "Here's what happens next: we acknowledge every nomination within <strong>48 hours</strong>. Then three verified members visit independently and review it against the criteria before a volunteer panel decides. We'll keep you posted.",
  "spaces.nominate.anotherCta": "Nominate another space",
  "spaces.nominate.comingSoon.badge": "Coming soon",
  "spaces.nominate.comingSoon.title": "Nominations are <em>coming soon.</em>",
  "spaces.nominate.comingSoon.body":
    "We're still building the review pipeline behind space nominations. Switch on the demo platform to preview the full flow, or check back soon.",

  // ── SafeSpaceDetailPage.tsx ────────────────────────────────────────────
  "spaces.detail.backLink": "Safe spaces",
  "spaces.detail.trust.title": "Verified safe space · Tier {tier}",
  "spaces.detail.trust.titleNoTier": "Verified safe space",
  "spaces.detail.trust.body":
    "<strong>This space meets the Safe Spaces criteria</strong> and was visited by QueerPulse moderators in the last 12 months. Last re-verified <strong>{date}</strong> · {verifier}.",
  "spaces.detail.relyTitle": "What you can rely on, <em>here</em>",
  "spaces.detail.relySub":
    "Every verified space commits to these. We check in twice a year.",
  "spaces.detail.vouchedTitle_one": "Vouched by <em>{count} member</em>",
  "spaces.detail.vouchedTitle_other": "Vouched by <em>{count} members</em>",
  "spaces.detail.vouchedSub":
    "Independent safety reviews from verified members.",
  "spaces.detail.addVouchCta": "Add yours",
  "spaces.detail.incidentTitle": "If something happens <em>here</em>",
  "spaces.detail.dangerTitle": "You're in immediate danger",
  "spaces.detail.dangerBody":
    "Tell any staff member you need help leaving. Verified spaces will escort you out, no questions asked. If you can, also call <strong>112</strong>.",
  "spaces.detail.emergencyGuideCta": "Emergency guide",
  "spaces.detail.offTitle": "Something felt off (not urgent)",
  "spaces.detail.offBody":
    "Even small things matter. They're how we know when a space slips. File a quiet report; moderators read every one and the venue is told without your name attached.",
  "spaces.detail.quietReportCta": "File a quiet report",
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
  "spaces.detail.lookingForBody":
    "This space is delisted, but {count}+ verified spaces across Lisbon are not. Find one near you.",
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
  "vouchModal.comingSoon.badge": "Coming soon",
  "vouchModal.comingSoon.title": "Vouches are <em>coming soon.</em>",
  "vouchModal.comingSoon.body":
    "We're still building the trust pipeline behind member vouches. Switch on the demo platform to preview the full flow, or check back soon.",
  "vouchModal.comingSoon.doneCta": "Close",
};

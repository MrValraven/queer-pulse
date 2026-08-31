import type { Catalog } from "../../types";

/**
 * Governance & Transparency page copy. Procedural/constitutional prose — kept
 * precise and literal in translation. `FIN_STATS`/`INCOME`/`EXPENSE`/`EVENTS`
 * (the quarterly figures in `governance.data.ts`) are deliberately NOT in this
 * catalog: `GET /governance/finances` serves that exact shape in live mode, so
 * those strings are fetched content, not platform chrome — see
 * `api/governance.api.ts`'s header comment. `HEALTH`, `STEPS`, `COUNCIL`,
 * `PRINCIPLES`, `DECISIONS` and the finances section's surplus/partner prose
 * have no backend of their own (hardcoded identically in both modes), so they
 * ARE chrome and are translated below.
 */
export const governance: Catalog = {
  // ── Meta (search/AI) ────────────────────────────────────────────────────
  "page.meta.title": "How QueerPulse is governed: council, finances, appeals",
  "page.meta.description":
    "How QueerPulse is run: community health reports, moderation and appeals, the advisory council, platform principles, quarterly finances, and how to raise a concern.",

  // ── Side nav ────────────────────────────────────────────────────────────
  "nav.health": "Community health",
  "nav.moderation": "Moderation",
  "nav.council": "Advisory council",
  "nav.principles": "Principles",
  "nav.finances": "Finances",
  "nav.proposals": "Proposals & votes",
  "nav.decisions": "Decision log",
  "nav.raise": "Raise a concern",

  // ── Hero ────────────────────────────────────────────────────────────────
  "page.hero.eyebrow": "Governance & Transparency",
  "page.hero.title": "How we run this, and who <em>decides.</em>",
  "page.hero.lead":
    "QueerPulse is a community platform. That means being transparent about how it's governed, how decisions are made, and what happens when things go wrong. This page is that record.",

  // ── Governing documents (footer index) ─────────────────────────────────
  "governingDocs.constitution.label": "Constitution",
  "governingDocs.constitution.blurb":
    "The formal organising document, twelve plain-language articles.",
  "governingDocs.codeOfConduct.label": "Code of Conduct",
  "governingDocs.codeOfConduct.blurb":
    "What we expect of each other, and what happens when it's breached.",
  "governingDocs.transparency.label": "Transparency Report",
  "governingDocs.transparency.blurb":
    "What moderation received, what it did, and what it got wrong. Counted every quarter.",
  "subpageIndex.eyebrow": "Governing documents",
  "subpageIndex.title": "Read the fine print.",

  // ── Community health ────────────────────────────────────────────────────
  "sections.health.eyebrow": "Q2 2026 Community Health Report",
  "sections.health.title": "The <em>numbers,</em> honestly.",
  "sections.health.prose1":
    "Twelve reports were filed this quarter. All were reviewed within 48 hours. Three resulted in member removal (repeated Code of Care violations after warning). Eight were resolved with direct communication and no formal action.",
  "sections.health.prose2":
    "Two moderation appeals were filed. One was upheld. We had made the wrong call and reversed it. We publish this because transparency is how trust gets built.",

  "health.stat.activeMembers.label": "Active members",
  "health.stat.retention.label": "Member retention rate",
  "health.stat.reportsFiled.label": "Reports filed this quarter",
  "health.stat.membersRemoved.label": "Members removed",
  "health.stat.gatheringsHosted.label": "Gatherings hosted",
  "health.stat.appealUpheld.label": "Moderation appeal upheld",

  "health.trend.upThisQuarter": "{count} this quarter",
  "health.trend.steady": "Steady",
  "health.trend.allResolved": "All resolved",
  "health.trend.cocViolations": "Code of care violations",
  "health.trend.upVsQ1": "{count} vs Q1",
  "health.trend.ofFiled": "of {count} filed",
  /** Screen-reader prefix for a rising trend; the arrow icon beside it is
   *  `aria-hidden`, so this carries the direction. */
  "health.trend.upDirection": "Up:",

  // ── Moderation ──────────────────────────────────────────────────────────
  "sections.moderation.eyebrow": "How moderation works",
  "sections.moderation.title":
    "What happens when something <em>goes wrong.</em>",
  "sections.moderation.intro":
    "QueerPulse is moderated by a small team of members who agreed to take on this role. They are accountable to the advisory council, and their decisions can be appealed.",
  "sections.moderation.wontTolerate.label": "What we won't tolerate:",
  "sections.moderation.wontTolerate.text":
    "Any behaviour that makes a member feel unsafe or unwelcome on the basis of their identity, body, or background. Harassment of any form. Commercial solicitation without permission. Violation of another member's privacy.",
  "sections.moderation.transparencyLink":
    "The figures behind this process are published every quarter in the <a>Transparency Report</a>.",

  "steps.reportFiled.title": "Report filed",
  "steps.reportFiled.text":
    "Any member can report another member, a gathering, a board post, or any content. Reports are confidential. The reported person is not told who filed the report.",
  "steps.review.title": "Review within 48 hours",
  "steps.review.text":
    "The moderation team reviews the report within 48 hours. For urgent safety issues, same-day. The person who filed is updated at each stage.",
  "steps.decision.title": "Decision and communication",
  "steps.decision.text":
    "Possible outcomes: no action (with explanation), direct communication, warning, temporary suspension, permanent removal. The reported person is informed of the outcome but not the reporter.",
  "steps.appeal.title": "Right to appeal",
  "steps.appeal.text":
    "Any member can appeal a moderation decision within 14 days. Appeals are reviewed by the advisory council, independently of the team that made the original decision. The outcome is final.",

  // ── Advisory council ────────────────────────────────────────────────────
  "sections.council.eyebrow": "Advisory council",
  "sections.council.title": "Who <em>oversees</em> this.",
  "sections.council.intro":
    "The advisory council reviews moderation appeals, proposes platform changes, and serves as an accountability layer. Members serve one-year terms and can be removed by a two-thirds community vote. See Proposals & votes below.",

  "council.psychologistChair": "Psychologist · Chair",
  "council.lawyerLegalAdvisor": "Lawyer · Legal advisor",
  "council.housingActivist": "Housing activist",
  "council.healthcareAdvocate": "Healthcare advocate",

  // ── Principles ──────────────────────────────────────────────────────────
  "sections.principles.eyebrow": "Platform principles",
  "sections.principles.title": "What this platform <em>will and won't do.</em>",

  "principles.noSellingData.title": "We will never sell member data",
  "principles.noSellingData.text":
    "Member data is used only to run the platform. We never share, sell, or use it for advertising.",
  "principles.visibilityChoice.title": "Visibility is always your choice",
  "principles.visibilityChoice.text":
    "You control who can see your profile, posts, and activity. Defaults are conservative.",
  "principles.noAlgorithms.title": "No algorithms deciding who you see",
  "principles.noAlgorithms.text":
    "No engagement algorithm. Members are not ranked. You see what you choose to see.",
  "principles.communityVoice.title": "Community has a voice in decisions",
  "principles.communityVoice.text":
    "Significant changes are discussed in the Forum before implementation; proposals go to the council.",
  "principles.transparency.title": "Transparency is non-negotiable",
  "principles.transparency.text":
    "Quarterly health reports. Published moderation stats. Council meetings summarised publicly.",
  "principles.accessNotConditional.title":
    "Access is not conditional on ability to pay",
  "principles.accessNotConditional.text":
    "A sliding scale for all paid gatherings. No one is excluded for financial circumstances.",

  // ── Finances ────────────────────────────────────────────────────────────
  "sections.finances.eyebrow": "Q2 2026 · Financial transparency",
  "sections.finances.title":
    "What it costs, what comes in, <em>where it goes.</em>",
  "sections.finances.intro":
    "We publish our finances every quarter. QueerPulse is funded by the people who use it, and those people deserve to know exactly how money is raised and spent. No investor interests. No growth targets. No exit plan.",
  "sections.finances.incomeHeading": "Where money comes from",
  "sections.finances.expenseHeading": "Where money goes",
  "sections.finances.clickHint": "Click any row to see the full breakdown.",
  "sections.finances.totalIncome": "Total income · {amount}",
  "sections.finances.totalExpense": "Total expenditure · {amount}",
  "sections.finances.eventsHeading": "How event finances work",
  "sections.finances.surplusHeading": "What we do with the surplus.",
  "sections.finances.surplusBody":
    "Quarterly surpluses go into an operational reserve. Our target is three months of running costs, ~{target}.",
  "sections.finances.reserveProgress":
    "Operational reserve: {current} of {target} target",
  "sections.finances.reserveBarAria": "Operational reserve progress",
  "sections.finances.surplusRedirect":
    "Once we reach the target, additional surplus is redirected in full to the community micro-grants fund. We do not accumulate capital. We redistribute it.",
  "sections.finances.partnerRestriction":
    "{amount} · Restricted to {scope}. No editorial, governance, or platform influence.",
  "sections.finances.partnerScope.mentalHealthFund": "the Mental Health Fund",
  "sections.finances.partnerScope.communityEvents": "community events",
  "sections.finances.noCorporateFunding":
    "We do not accept funding from corporations, brands, or government bodies whose interests could conflict with community autonomy. If that ever changes, we'll say so here first, and put it to a community vote. See Proposals & votes below.",

  // ── Proposals & votes ────────────────────────────────────────────────────
  "sections.proposals.eyebrow": "Proposals & votes",
  "sections.proposals.title": "Put it to a <em>vote.</em>",
  "sections.proposals.intro":
    "Two things on this page are decided by member vote: removing an advisory-council seat needs a two-thirds vote, and accepting funding outside our usual sources needs a majority. Every open proposal is listed here, and every past one stays visible with its result.",
  "sections.proposals.type.council_removal": "Council seat",
  "sections.proposals.type.funding_change": "Funding change",
  "sections.proposals.type.member_motion": "Member motion",
  "sections.proposals.status.passed": "Passed",
  "sections.proposals.status.failed": "Did not pass",
  "sections.proposals.status.gathering": "Gathering support",
  "sections.proposals.status.screening": "In review",
  "sections.proposals.status.rejected": "Not opened for voting",
  "sections.proposals.status.lapsed": "Short of co-signatures",
  "sections.proposals.targetSeat": "Seat under review: {name}",
  "sections.proposals.tallyCaption":
    "{forCount} for · {againstCount} against · {forPercent}% in favour (two-thirds line marked)",
  "sections.proposals.closes": "Voting closes {date}",
  "sections.proposals.closedOn": "Voting closed {date}",
  "sections.proposals.voteFor": "Vote for",
  "sections.proposals.voteAgainst": "Vote against",
  "sections.proposals.votedFor": "You voted for this proposal.",
  "sections.proposals.votedAgainst": "You voted against this proposal.",
  "sections.proposals.resolvedHeading": "Past proposals",
  "sections.proposals.empty": "No proposal has been opened yet.",

  // ── Member motions (GOV-01) ─────────────────────────────────────────────
  // Anyone can put something to a vote, so a motion travels through three
  // stages before a ballot exists: it gathers co-signatures, staff screen
  // it, then voting opens. Every string below names the stage it is
  // actually at, because a motion still collecting names must never read
  // as a vote that went badly.
  "sections.proposals.raisedBy": "Raised by {name}",
  "sections.proposals.tallyLabel": "Votes cast",
  "sections.proposals.gatheringHeading": "Gathering co-signatures",
  "sections.proposals.votingHeading": "Open for voting",

  // Filing a motion. The hint and the sub-line both say what happens next,
  // because a form that quietly parks your motion in a queue is how people
  // conclude the democracy here is decorative.
  "sections.proposals.compose.cta": "Put something to a vote",
  "sections.proposals.compose.hint":
    "Any member can file a motion. Ten members have to stand behind it before staff screen it, and yours counts as the first.",
  "sections.proposals.compose.eyebrow": "Member motion",
  "sections.proposals.compose.title": "Put something to a vote",
  "sections.proposals.compose.sub":
    "This does not go straight to a ballot. Your motion gathers co-signatures from other members first, then staff screen it, and only then does voting open.",
  "sections.proposals.compose.titleField": "What are you proposing?",
  "sections.proposals.compose.titlePlaceholder": "One line, in plain words.",
  "sections.proposals.compose.descriptionField": "The case for it",
  "sections.proposals.compose.descriptionHelper":
    "Say what should change and why. Members read this before deciding whether to co-sign.",
  "sections.proposals.compose.descriptionPlaceholder":
    "What you want changed, who it affects, and what happens if nothing changes.",
  "sections.proposals.compose.cancel": "Cancel",
  "sections.proposals.compose.submit": "File motion",
  "sections.proposals.compose.submitting": "Filing…",
  "sections.proposals.compose.successToast":
    "Motion filed. It is now gathering co-signatures.",
  "sections.proposals.compose.errorToast":
    "Could not file that motion. Please try again.",

  // The co-signature drive. `progress` gets both the signed count and the
  // threshold; `progressComplete` only the count, and stands in either when
  // the threshold is met or when the motion carries no threshold at all.
  "sections.proposals.cosign.progress":
    "Co-signatures: {count} of the {threshold} needed",
  "sections.proposals.cosign.progressComplete": "Co-signatures: {count}",
  "sections.proposals.cosign.cta": "Co-sign this motion",
  "sections.proposals.cosign.withdrawCta": "Withdraw my signature",
  "sections.proposals.cosign.signed": "You have co-signed this motion.",
  "sections.proposals.cosign.proposerNote":
    "You raised this motion, so your signature is already the first one on it.",
  "sections.proposals.cosign.signedInOnly":
    "Sign in to put your name to this motion.",
  "sections.proposals.cosign.awaitingReview":
    "Enough members have signed. Staff are reading this motion before voting opens.",
  "sections.proposals.cosign.closes": "Co-signatures close {date}",
  "sections.proposals.cosign.closed": "Co-signatures closed {date}",
  "sections.proposals.cosign.errorToast":
    "Could not save your signature. Please try again.",

  // Quorum is turnout, and it is a separate reading from the two-thirds
  // majority above it: a proposal can clear two-thirds of the votes cast
  // and still fail because too few members voted. `missed` says exactly
  // that, so a proposal short on turnout is never read as one that lost
  // the argument.
  "sections.proposals.quorum.label": "Quorum",
  "sections.proposals.quorum.pending":
    "{totalVotes} of the {quorumRequired} ballots needed for the result to count",
  "sections.proposals.quorum.met":
    "{totalVotes} ballots cast, past the {quorumRequired} needed for the result to count",
  "sections.proposals.quorum.missed":
    "Only {totalVotes} of the {quorumRequired} ballots needed were cast, so this proposal failed on turnout.",

  // A resolved motion that never reached a ballot. The rejection note is
  // published to everyone, so its label stays neutral and factual.
  "sections.proposals.outcome.lapsed":
    "This motion gathered {count} of the {threshold} co-signatures it needed, so it never reached a vote.",
  "sections.proposals.outcome.reviewedOn": "Reviewed {date}",
  "sections.proposals.outcome.rejectedLabel": "Why this did not go to a vote",

  // ── Decision log ────────────────────────────────────────────────────────
  "sections.decisions.eyebrow": "Recent decisions",
  "sections.decisions.title": "What changed and <em>why.</em>",

  "decisions.slidingScale.lead":
    "May 2026: Sliding scale introduced for gatherings.",
  "decisions.slidingScale.body":
    "Following a forum discussion by Catarina Vaz, the council agreed to implement a sliding scale for all paid gatherings. 23 members participated.",
  "decisions.forumLaunched.lead": "April 2026: Forum launched.",
  "decisions.forumLaunched.body":
    "Following member requests for a place to discuss longer-form topics. Categories and guidelines co-designed with 12 members over three weeks.",
  "decisions.visibilityDefaults.lead":
    "March 2026: Visibility defaults made more conservative.",
  "decisions.visibilityDefaults.body":
    'New members now default to "network only" instead of "open", and can open up when comfortable.',
  "decisions.languageToggle.lead": "February 2026: Language toggle added.",
  "decisions.languageToggle.body":
    "PT/EN toggle added to all pages following requests from Portuguese-speaking members.",

  // ── Raise a concern ─────────────────────────────────────────────────────
  "sections.raise.eyebrow": "Raise a concern",
  "sections.raise.title": "Something isn't <em>right?</em> Tell us.",
  "sections.raise.intro":
    "Use this form to report a member, a piece of content, a platform decision, or a concern about how QueerPulse is run. All submissions are confidential and reviewed within 48 hours.",
  "sections.raise.cardTitle": "Submit a concern",
  "sections.raise.cardText":
    "Your identity is kept confidential. You'll receive a confirmation within 48 hours and an update when the matter is resolved.",
  "sections.raise.selectPlaceholder": "What kind of concern?",
  "sections.raise.option.member": "Report a member or behaviour",
  "sections.raise.option.gathering": "Report a gathering or event",
  "sections.raise.option.content": "Content or platform issue",
  "sections.raise.option.appeal": "Moderation decision I want to appeal",
  "sections.raise.option.other": "Something else",
  "sections.raise.textareaPlaceholder":
    "Describe what happened, or what's wrong, in as much detail as you're comfortable with…",
  "sections.raise.emailPlaceholder": "Your email (so we can update you)",
  "sections.raise.submitCta": "Submit",
  "sections.raise.submittingCta": "Sending…",
  "sections.raise.submittedToast":
    "Submitted. We'll be in touch within 48 hours.",
  "sections.raise.errorToast":
    "Please choose a category and add a few details first.",
  "sections.raise.failedToast":
    "We couldn't send that just now. Please try again.",
  // Shown in place of a section's figures when its live fetch fails, so an API
  // error surfaces as a retry prompt rather than a silently-empty grid.
  "error.body": "We couldn't load this section just now.",
  "error.retry": "Try again",

  // ── Transparency Report (/about/governance/transparency) ────────────────
  // The document Article VI clause 3 of the Constitution names. Every figure is
  // fetched from `GET /transparency/report`; the copy below is chrome, and the
  // `category.*` / `action.*` / `outcome.*` keys are the labels for the stable
  // identifiers that endpoint sends.
  "transparency.meta.title":
    "Transparency Report: QueerPulse moderation figures",
  "transparency.meta.description":
    "Counted every quarter: reports members filed and what they were about, how long an answer took, what moderators did, appeals filed, how many decisions were overturned, and every demand a court, a police force or a government body made for member information.",

  "transparency.hero.eyebrow": "Transparency Report",
  "transparency.hero.title": "What moderation <em>actually did.</em>",
  "transparency.hero.dek1":
    "Every figure on this page is counted from the live moderation record at the moment you load it. Nothing is typed in by hand and nothing is estimated. Where a number would be small enough to describe one person, it is withheld, and the page says where.",
  "transparency.hero.dek2":
    "Article VI of the <a>Constitution</a> promises this report. This is it.",

  "transparency.period.label": "Reporting period",
  "transparency.period.option.current": "This quarter",
  "transparency.period.option.previous": "Last quarter",
  "transparency.period.rangeComplete":
    "<b>{id}</b> ran from {start} to {end}. The quarter is closed, so these figures are final.",
  "transparency.period.rangePartial":
    "<b>{id}</b> is still running. These figures cover {start} to {until} and will keep moving until the quarter closes.",
  "transparency.period.generated": "Counted on {generated}.",

  "transparency.reports.title": "Reports members <em>filed</em>",
  "transparency.reports.lead":
    "A report is one member telling us something is wrong. Received counts the reports filed during the period; closed counts the ones finished during it. They are different sets, so they do not have to match.",
  "transparency.reports.received": "Reports received",
  "transparency.reports.resolved": "Reports closed",
  "transparency.reports.tableCaption": "Reports received, by what was reported",
  "transparency.reports.categoryColumn": "What was reported",
  "transparency.reports.countColumn": "Reports",

  "transparency.category.privacy":
    "Outing, or sharing someone's private information",
  "transparency.category.harassment":
    "Harassment, hate speech, or unwanted contact",
  "transparency.category.impersonation": "Impersonation",
  "transparency.category.spam": "Spam and disruption",
  "transparency.category.space_safety":
    "Safety of a venue, a home, or a listing",
  "transparency.category.other": "Everything else",

  "transparency.timing.title": "How long an <em>answer</em> took",
  "transparency.timing.lead":
    "Measured from the moment a report was filed to the moment a moderator closed it, over the reports closed during this period.",
  "transparency.timing.median": "Half of reports were answered within",
  "transparency.timing.p90": "Nine in ten were answered within",
  "transparency.timing.hours": "{value} hours",
  "transparency.timing.withheld":
    "Too few reports closed to publish this without describing single cases",

  "transparency.actions.title": "What moderators <em>did</em>",
  "transparency.actions.lead":
    "Every moderator decision is written to an audit log the moment it is taken. These are those rows, counted. A finding that no rule was broken is a real outcome and is counted like any other.",
  "transparency.actions.accountsRemoved": "Accounts removed permanently",
  "transparency.actions.tableCaption":
    "Moderator decisions taken during the period",
  "transparency.actions.actionColumn": "Decision",
  "transparency.actions.countColumn": "Times taken",

  "transparency.action.dismiss": "No rule was broken",
  "transparency.action.warn": "Warning given",
  "transparency.action.hide_content": "Content hidden",
  "transparency.action.remove_content": "Content removed",
  "transparency.action.restrict": "Account restricted for a set time",
  "transparency.action.suspend": "Account suspended for a set time",
  "transparency.action.ban": "Account removed permanently",
  "transparency.action.escalate": "Sent for further review",

  "transparency.communities.frozen": "Communities frozen",

  "transparency.appeals.title": "<em>Appeals</em>",
  "transparency.appeals.lead":
    "Anyone can appeal a decision made about them. Outcomes are counted against the period the appeal was filed in, so the rows below always add up to the appeals filed. Some of them are still being reviewed.",
  "transparency.appeals.filed": "Appeals filed",
  "transparency.appeals.overturnRate": "Decisions overturned on appeal",
  "transparency.appeals.ratePercent": "{value}%",
  "transparency.appeals.rateWithheld":
    "Too few appeals decided this period for a rate to mean anything",
  "transparency.appeals.tableCaption":
    "Appeals filed during the period, by outcome",
  "transparency.appeals.outcomeColumn": "Outcome",
  "transparency.appeals.countColumn": "Appeals",

  "transparency.outcome.upheld": "Original decision upheld",
  "transparency.outcome.overturned": "Original decision overturned",
  "transparency.outcome.awaiting": "Still being reviewed",

  "transparency.suppressed.value": "Fewer than {floor}",
  "transparency.suppressed.unavailable": "Not available",

  // ── Legal, government and law-enforcement demands (PRD-32) ─────────────
  // The register the report used to omit entirely. The section is always
  // rendered, an empty register publishes a real zero, and `neverAsked` is the
  // only sentence on the page that speaks for all time rather than for the
  // selected quarter. The `legal.type.*` / `legal.outcome.*` keys label the
  // stable identifiers `LEGAL_REQUEST_TYPES` / `LEGAL_REQUEST_OUTCOMES` send.
  "transparency.legal.title": "Demands from <em>courts and police</em>",
  "transparency.legal.lead":
    "A legal request is a demand from a court, a police force, a government body or another arm of a state: hand over information about a member, preserve it, or take something down. Every demand that reaches us is written into a register the moment it arrives, and this section is that register counted.",
  "transparency.legal.neverAsked":
    "No court, police force or government body has ever asked QueerPulse to hand over information about a member. That sentence covers the whole life of the register, every quarter it has been kept, and the page reads it from the register every time it loads.",
  "transparency.legal.hasBeenAsked":
    "QueerPulse has received demands for information about members. The figures below count the demands that arrived inside this reporting period, so a period of zeroes means none arrived in it.",

  // Neither of the two sentences above can be printed off a report that
  // arrived without its register, so this third one is printed instead. It
  // says the page failed, refuses the zero reading out loud, and leaves the
  // rest of the report standing. See `readLegalRequestsSection`.
  "transparency.legal.unavailable.body":
    "We could not load these figures. That is a problem loading this page and it does not mean we have never been asked. Nothing here should be read as a zero.",

  "transparency.legal.received": "Demands received",
  "transparency.legal.accountsAffected": "Member accounts named",
  "transparency.legal.accountsNotified": "Named accounts told",
  "transparency.legal.recordsVoided": "Records struck from the register",

  "transparency.legal.typeTableCaption":
    "Demands received during the period, by what arrived",
  "transparency.legal.typeColumn": "Kind of demand",
  "transparency.legal.typeCountColumn": "Demands",

  "transparency.legal.type.subpoena": "Subpoena",
  "transparency.legal.type.court_order": "Court order",
  "transparency.legal.type.police_request":
    "Police request made without a court order",
  "transparency.legal.type.emergency_disclosure_request":
    "Emergency disclosure demand",
  "transparency.legal.type.preservation_request": "Demand to preserve data",
  "transparency.legal.type.takedown_demand": "Demand to take something down",
  "transparency.legal.type.other": "Everything else",

  "transparency.legal.outcomeTitle": "What we did about them",
  "transparency.legal.outcomeTableCaption":
    "Demands received during the period, by what QueerPulse did",
  "transparency.legal.outcomeColumn": "What we did",
  "transparency.legal.outcomeCountColumn": "Demands",

  "transparency.legal.outcome.complied_in_full": "Complied in full",
  "transparency.legal.outcome.complied_in_part": "Complied in part",
  "transparency.legal.outcome.narrowed":
    "Pushed back on and narrowed before anything was handed over",
  "transparency.legal.outcome.refused": "Refused",
  "transparency.legal.outcome.withdrawn": "Withdrawn by whoever sent it",
  "transparency.legal.outcome.pending": "Still being answered",

  "transparency.legal.registerTitle": "The register itself",

  "transparency.legal.notes.voided":
    "A record can be struck from the register, for a duplicate entry or a mistake in the recording. A struck record leaves every figure above and is counted here instead, so demands received plus records struck is every row the register holds for this period. Emptying the register would show up as a number on this page.",
  "transparency.legal.notes.notified":
    "Telling a member their account was named is something the team does by hand, and the figure above is the count the team recorded doing. A demand can arrive with an order barring us from telling anyone, and while that order stands nobody can be told.",
  "transparency.legal.notes.gagOrders":
    "Some demands arrive with an order forbidding us from describing them. Those are counted in every figure above exactly like any other demand, and nothing on this page marks which ones they are. Counting a demand does not describe it.",
  "transparency.legal.notes.contents":
    "This section publishes counts. It publishes no requesting body, no country, no case, no dates, no accounts, and no description of anything that was handed over. Those stay in the register.",
  "transparency.legal.notes.suppression":
    "A demand naming one or two accounts is, to anyone who knows the people involved, a specific person. So any figure here below <b>{floor}</b> is withheld and shown as fewer than {floor}. Zero is published as a real zero, because a zero identifies nobody. A withheld figure means we were asked and are holding the number back, and it never means nothing happened.",

  "transparency.method.title": "How these numbers are <em>made</em>",
  "transparency.method.counted":
    "Each figure is a count or a summary taken straight from the moderation record at the moment you loaded this page. There is no separate reporting database, no manual entry step, and no rounding beyond one decimal place on the hour figures. The same rows feed the moderators' own queue, so this report and the team's internal view cannot disagree.",
  "transparency.method.suppression":
    "A count of one or two is not anonymous. On a community this size it can be a specific person and a specific incident, so any figure below <b>{floor}</b> is withheld and shown as fewer than {floor}. Zero is published as zero, because a zero identifies nobody. Where withholding one figure would still let you work it out by subtracting the rest from the total, a second figure is withheld with it.",
  "transparency.method.pairs":
    "Reports received and reports closed count different sets. A report filed in the last week of one quarter is usually answered in the next, so the two figures move independently.",

  "transparency.notCounted.title": "What this report does not count",
  "transparency.notCounted.communityModeration":
    "Moderation that communities do for themselves. When a community's own owners remove or bar someone, it goes into that community's governance log rather than the platform's. Counting a room's housekeeping as platform enforcement would inflate these figures.",
  "transparency.notCounted.appealTiming":
    "How long an appeal took. An appeal records when it was filed and what was decided, and nothing records when the decision was made, so the figure is left out rather than estimated.",
  "transparency.notCounted.outsidePlatform":
    "Harm that happened elsewhere and was never reported here. Nothing can count what nobody told us about, and a quiet quarter is not proof of a safe one.",
  "transparency.notCounted.selfReported":
    "Whether a decision was right. These are counts of what happened. The appeal figures are the closest this report comes to marking its own work.",

  "transparency.links.constitution": "Read the Constitution",
  "transparency.links.codeOfConduct": "Read the Code of Conduct",
  "transparency.links.governance": "Back to Governance",
};

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

  "health.trend.upThisQuarter": "↑ {count} this quarter",
  "health.trend.steady": "Steady",
  "health.trend.allResolved": "All resolved",
  "health.trend.cocViolations": "Code of care violations",
  "health.trend.upVsQ1": "↑ {count} vs Q1",
  "health.trend.ofFiled": "of {count} filed",

  // ── Moderation ──────────────────────────────────────────────────────────
  "sections.moderation.eyebrow": "How moderation works",
  "sections.moderation.title":
    "What happens when something <em>goes wrong.</em>",
  "sections.moderation.intro":
    "QueerPulse is moderated by a small team of members who agreed to take on this role. They are accountable to the advisory council, and their decisions can be appealed.",
  "sections.moderation.wontTolerate.label": "What we won't tolerate:",
  "sections.moderation.wontTolerate.text":
    "Any behaviour that makes a member feel unsafe or unwelcome on the basis of their identity, body, or background. Harassment of any form. Commercial solicitation without permission. Violation of another member's privacy.",

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
    "Any member can appeal a moderation decision within 14 days. Appeals are reviewed by the advisory council, not the original team. The outcome is final.",

  // ── Advisory council ────────────────────────────────────────────────────
  "sections.council.eyebrow": "Advisory council",
  "sections.council.title": "Who <em>oversees</em> this.",
  "sections.council.intro":
    "The advisory council reviews moderation appeals, proposes platform changes, and serves as an accountability layer. Members serve one-year terms and can be removed by a two-thirds community vote.",

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
  "sections.finances.surplusRedirect":
    "Once we reach the target, additional surplus is redirected in full to the community micro-grants fund. We do not accumulate capital. We redistribute it.",
  "sections.finances.partnerRestriction":
    "{amount} · Restricted to {scope}. No editorial, governance, or platform influence.",
  "sections.finances.partnerScope.mentalHealthFund": "the Mental Health Fund",
  "sections.finances.partnerScope.communityEvents": "community events",
  "sections.finances.noCorporateFunding":
    "We do not accept funding from corporations, brands, or government bodies whose interests could conflict with community autonomy. If that ever changes, we'll say so here first, and the community will vote on it.",

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
};

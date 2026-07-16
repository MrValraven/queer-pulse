import type { Catalog } from "../../types";

/**
 * Economy — jobs, mentorship, housing, barter, grants, workshops, solidarity
 * pricing, and the freelance/tax document generators. Namespace `economy`.
 *
 * Scope note: mock job/listing/review/salary *content* (job descriptions,
 * company blurbs, listing bodies, fictional posters' names, salary-board
 * entries) is deliberately left in English throughout — in live mode it comes
 * over the wire from the API. Only platform-authored chrome (headings, CTAs,
 * labels, empty/error states, form fields, generated-document *labels*) is
 * translated. See docs/i18n/extraction-brief.md §1.
 */
export const economy: Catalog = {
  // ── EconomyPage (hub) ──────────────────────────────────────────────────
  "hub.eyebrow": "Queer economy",
  "hub.title": "Build something that <em>lasts.</em>",
  "hub.lead":
    "Tools, mentorship, and solidarity for queer founders, freelancers, and professionals — because economic independence is part of queer liberation.",
  "hub.tab.incubator": "Business incubator",
  "hub.tab.freelance": "Freelance tools",
  "hub.tab.salary": "Salary board",
  "hub.outro.title": "Build it <em>with us.</em>",
  "hub.outro.sub":
    "A stronger queer economy benefits all of us. Start with the tools, stay for the community.",
  "hub.outro.browseCta": "Browse jobs",
  "hub.outro.hostCta": "Find a mentor",

  // ── IncubatorTab ────────────────────────────────────────────────────────
  "incubator.hero.title": "A space to build <em>your</em> thing.",
  "incubator.hero.body":
    "The QueerPulse incubator supports queer founders in Lisbon with six months of structured mentorship, peer accountability, and connections to investors and collaborators who get it.",
  "incubator.hero.applyCta": "Apply for cohort 3",
  "incubator.hero.mentorCta": "Become a mentor",
  "incubator.stats.founders": "founders in 2 cohorts",
  "incubator.stats.mentors": "mentors from the community",
  "incubator.stats.raised": "raised by cohort alumni",
  "incubator.programme.title": "How the programme <em>works.</em>",
  "incubator.mentors.title": "Current <em>mentors.</em>",
  "incubator.mentors.requestCta": "Request session",
  "incubator.step.apply.title": "Apply",
  "incubator.step.apply.desc":
    "A short application — your idea, where you are, what you need. No pitch deck required. Decisions in 3 weeks.",
  "incubator.step.apply.meta": "Applications open · Deadline 30 Jul",
  "incubator.step.match.title": "Match with a mentor",
  "incubator.step.match.desc":
    "Matched to a community mentor based on your sector, stage, and what you told us you need. You meet fortnightly for six months.",
  "incubator.step.match.meta": "Sep–Feb · Fortnightly sessions",
  "incubator.step.cohort.title": "Cohort sessions",
  "incubator.step.cohort.desc":
    "Monthly workshops with the full cohort — legal, finance, fundraising, design — plus time for peer support and honest conversation.",
  "incubator.step.cohort.meta": "First Saturday of every month",
  "incubator.step.demo.title": "Demo night",
  "incubator.step.demo.desc":
    "Share what you've built with the community, investors, and the press. Low-stakes, high-support. You decide how much to reveal.",
  "incubator.step.demo.meta": "March · Invite-only",

  // ── FreelanceTab (tool grid) ────────────────────────────────────────────
  "freelance.title": "Freelance <em>tools.</em>",
  "freelance.sub":
    "Real, working tools — built by and for queer freelancers in Portugal. Free, no sign-up, and nothing you enter leaves your device.",
  "freelance.section.documents": "Documents that <em>get you paid.</em>",
  "freelance.section.numbers": "Know your <em>numbers.</em>",
  "freelance.section.together": "Stronger <em>together.</em>",

  "tool.invoice.title": "Invoice maker",
  "tool.invoice.desc":
    "Build a clean, Portuguese-correct fatura-recibo — NIF, IVA options, the art. 53.º exemption and art. 101.º-B dispensa notes — and save it as a real PDF. Your details are remembered for next time.",
  "tool.invoice.cta": "Open invoice maker",
  "tool.contract.title": "Contract builder",
  "tool.contract.desc":
    "Assemble a freelance services contract clause by clause — scope, payment, IP, cancellation, confidentiality. Download a PDF or copy the text to edit.",
  "tool.contract.cta": "Open contract builder",
  "tool.scope.title": "Scope & quote builder",
  "tool.scope.desc":
    "Spell out exactly what you're delivering, what you're not, revisions, and timeline — add a price to turn it into a quote. Export a PDF that prevents most disputes.",
  "tool.scope.cta": "Open scope builder",
  "tool.reciboGuide.title": "Recibos verdes guide",
  "tool.reciboGuide.desc":
    "A plain-language guide to the Portuguese freelance tax system — registering, retention, IVA, Segurança Social, and your first year. Always current.",
  "tool.reciboGuide.cta": "Read the guide",

  "tool.takeHome.title": "Take-home calculator",
  "tool.takeHome.desc":
    "Turn your gross freelance income into what you actually keep — after IRS and Segurança Social, with the regime-simplificado coefficients and your first years built in.",
  "tool.takeHome.cta": "Open calculator",
  "tool.dayRate.title": "Day-rate calculator",
  "tool.dayRate.desc":
    "Work back from the income you need to a day (and hourly) rate that actually sustains you — overhead, unpaid days, and IVA included.",
  "tool.dayRate.cta": "Open calculator",
  "tool.ivaTracker.title": "IVA threshold tracker",
  "tool.ivaTracker.desc":
    "Track your invoiced income against the €15,000 art. 53.º exemption limit, so crossing it never takes you by surprise. Saved on your device.",
  "tool.ivaTracker.cta": "Open tracker",
  "tool.setAside.title": "Tax set-aside planner",
  "tool.setAside.desc":
    "Work out what slice of every invoice to park now, and keep a running pot, so the IRS and Segurança Social bills never sting later.",
  "tool.setAside.cta": "Open planner",
  "tool.comparator.title": "Freelance vs salaried",
  "tool.comparator.desc":
    "Compare what you'd actually take home as a freelancer versus an equivalent salary — net for net, with the costs a payslip hides.",
  "tool.comparator.cta": "Compare",

  "tool.rateBoard.title": "Rate transparency board",
  "tool.rateBoard.desc":
    "Anonymous day rates shared by the community, by role and experience — so nobody has to guess what to charge. Add yours, see where you stand.",
  "tool.rateBoard.cta": "Open the board",
  "tool.slidingScale.title": "Sliding-scale price card",
  "tool.slidingScale.desc":
    "Publish a sliding scale so people pay what fits their means and you still get paid fairly. Build a card and export it to share.",
  "tool.slidingScale.cta": "Build a card",

  // ── SalaryTab ───────────────────────────────────────────────────────────
  "salary.title": "Salary <em>transparency.</em>",
  "salary.sub":
    "Anonymous submissions from the community. Filter by sector, role, or type. Knowledge is power.",
  "salary.submitCta": "+ Submit yours",
  "salary.filter.all": "All sectors",
  "salary.filter.tech": "Tech",
  "salary.filter.design": "Design",
  "salary.filter.creative": "Creative",
  "salary.filter.ngo": "NGO / non-profit",
  "salary.filter.law": "Law",
  "salary.table.role": "Role",
  "salary.table.annual": "Annual (gross)",
  "salary.table.experience": "Experience",
  "salary.table.type": "Type",
  "salary.empty.title": "No entries in this sector yet",
  "salary.empty.description":
    "Nothing's been shared for this sector so far. Clear the filter to see every submission — or add yours to help the next person negotiate.",
  "salary.empty.clear": "Clear filters",
  "salary.disclaimer":
    "All entries are anonymous. No name, email, or employer is stored. Entries are reviewed by a moderator before appearing.",
  "salary.helpBody":
    "Help the community by sharing what you earn. The more entries, the more useful this becomes for everyone — especially people just starting to negotiate.",
  "salary.submitLong": "Submit your salary",
  "salary.submitToast": "Submitted anonymously — thank you",

  // ── WorkHubPage ─────────────────────────────────────────────────────────
  "workHub.eyebrow": "Your workspace",
  "workHub.title": "Your work, <em>{name}.</em>",
  "workHub.status.live": "Everything to do with your work, in one place.",
  "workHub.section.needsYou": "What needs you",
  "workHub.section.whereThingsStand": "Where everything stands",
  "workHub.section.profile": "Your work profile",
  "workHub.emptyLive.title": "Your workspace is ready when you are",
  "workHub.emptyLive.description":
    "Apply to a job, find a mentor, or save a role and it'll all come together here — applications, grants, skills, and reviews in one view.",
  "workHub.emptyLive.cta": "Browse jobs",

  // ── work.data.tsx (status line + next actions + status cards) ──────────
  "workHub.statusLine.apps_one": "{count} active application",
  "workHub.statusLine.apps_other": "{count} active applications",
  "workHub.statusLine.offers": "{count} offer to respond to",
  "workHub.statusLine.noOffers": "no offers yet",
  "workHub.statusLine.mentorThreads": "2 mentor threads",

  "workHub.next.offer.label": "Respond to your offer from {company}",
  "workHub.next.offer.context": "They're waiting on your decision.",
  "workHub.next.offer.urgency": "Closes in {days} days",
  "workHub.next.offer.cta": "Review offer",
  "workHub.next.mentor.label": "{name} replied about your mentor match",
  "workHub.next.mentor.context": "A first intro call is on the table.",
  "workHub.next.mentor.cta": "Read reply",
  "workHub.next.grant.label": "Micro-grant deadline this Friday",
  "workHub.next.grant.context": "{fund} · up to {amount}.",
  "workHub.next.grant.urgency": "Due Fri",
  "workHub.next.grant.cta": "See grant",
  "workHub.next.profile.label": "Your work profile is {percent}% complete",
  "workHub.next.profile.context":
    "Add your out-at-work preference to be matched safely.",
  "workHub.next.profile.cta": "Finish profile",

  "workHub.card.apps.label": "Applications",
  "workHub.card.apps.primary": "{active} active / {sent} sent",
  "workHub.card.apps.noOffers": "No offers yet",
  "workHub.card.mentor.label": "Mentorship",
  "workHub.card.mentor.primary": "1 active mentorship",
  "workHub.card.mentor.next": "{count} mentors with open spots",
  "workHub.card.skills.label": "Skills exchange",
  "workHub.card.skills.primary": "Teaching 2 · Learning 1",
  "workHub.card.skills.next": "A new request matches you",
  "workHub.card.saved.label": "Saved roles",
  "workHub.card.saved.primary": "5 saved jobs",
  "workHub.card.saved.next": "2 closing this week",
  "workHub.card.grants.label": "Grants & funding",
  "workHub.card.grants.primary": "2 deadlines this month",
  "workHub.card.grants.next": "{fund} opens soon",
  "workHub.card.reviews.label": "Employer reviews",
  "workHub.card.reviews.primary": "You've reviewed 2",
  "workHub.card.reviews.next": "1 draft to finish",

  // ── WorkProfilePage / WorkProfileCard / WorkProfileSections ────────────
  "workProfile.success.title": "Your work profile is <em>set.</em>",
  "workProfile.success.sub":
    "You appear to employers exactly as you choose to — and never otherwise.",
  "workProfile.success.backCta": "Back to your workspace",
  "workProfile.success.editCta": "Keep editing",
  "workProfile.eyebrow": "Work profile",
  "workProfile.title": "How you show up <em>at work.</em>",
  "workProfile.sub":
    "This controls what employers see — and what stays yours. Nothing here is shared without your say-so.",
  "workProfile.saveCta": "Save work profile",
  "workProfile.savedToast": "Work profile saved",

  "workProfile.card.meterLabel": "Profile {percent}% complete",
  "workProfile.card.note":
    "This controls how you appear to employers — and what stays yours.",
  "workProfile.card.editCta": "Edit work profile",

  "workProfile.identity.title": "Professional <em>identity</em>",
  "workProfile.identity.sub": "How you're named and described to employers.",
  "workProfile.identity.nameInUse": "Name in use",
  "workProfile.identity.legalName": "Legal name",
  "workProfile.identity.legalNameOptional": "kept private",
  "workProfile.identity.legalNamePlaceholder": "Only where legally required",
  "workProfile.identity.legalNameHint":
    "Stored privately and used only where the law requires it.",
  "workProfile.identity.pronouns": "Pronouns",
  "workProfile.identity.headline": "Headline",
  "workProfile.identity.location": "Location",
  "workProfile.identity.bio": "Short bio",
  "workProfile.identity.bioPlaceholder":
    "A few lines on what you do and what you're looking for…",

  "workProfile.showUp.title": "How you show up <em>at work</em>",
  "workProfile.showUp.sub":
    "You decide what employers see. Nothing here is shared without your say-so.",
  "workProfile.showUp.outAtWork": "Out at work",
  "workProfile.showUp.outAtWorkAriaLabel": "Out at work",
  "workProfile.showUp.transSupport": "Trans & non-binary support",
  "workProfile.showUp.transSupportOptional": "optional",
  "workProfile.showUp.matrixLabel": "What employers see vs the community",
  "workProfile.showUp.matrixField": "Field",
  "workProfile.showUp.matrixEmployers": "Employers see",
  "workProfile.showUp.matrixCommunity": "Community sees",
  "workProfile.showUp.safeOnly.label":
    "Only surface me to community-verified-safe employers",
  "workProfile.showUp.safeOnly.desc":
    "Skip everything that hasn't been vetted by the network.",

  "workProfile.outAtWork.out.label": "Fully out",
  "workProfile.outAtWork.out.desc":
    "Your queerness is visible to anyone who views your work profile.",
  "workProfile.outAtWork.verified.label": "Out to verified employers only",
  "workProfile.outAtWork.verified.desc":
    "Only community-verified-safe employers see it. Everyone else sees a neutral profile.",
  "workProfile.outAtWork.private.label": "Private",
  "workProfile.outAtWork.private.desc":
    "Your queerness is never surfaced to employers. You decide who you tell, and when.",

  "workProfile.transSupport.chosenName.label": "Chosen-name-only applications",
  "workProfile.transSupport.chosenName.desc":
    "Applications use your name in use — never a legal name.",
  "workProfile.transSupport.hideLegal.label":
    "Don't show my legal name to employers",
  "workProfile.transSupport.hideLegal.desc":
    "Kept private and used only where legally required.",
  "workProfile.transSupport.transitionFriendly.label":
    "Prefer transition-friendly employers",
  "workProfile.transSupport.transitionFriendly.desc":
    "Prioritise employers verified for trans-inclusive policies.",

  "workProfile.visMatrix.nameInUse": "Name in use",
  "workProfile.visMatrix.legalName": "Legal name",
  "workProfile.visMatrix.pronouns": "Pronouns",
  "workProfile.visMatrix.queerIdentity": "Queer identity",
  "workProfile.visMatrix.skillsFocus": "Skills & focus",
  "workProfile.visMatrix.visible": "Visible",
  "workProfile.visMatrix.hidden": "Hidden",
  "workProfile.visMatrix.yourChoice": "Your choice",
  "workProfile.visMatrix.perSettingAbove": "Per setting above",

  "workProfile.skillsFocus.title": "Skills <em>& focus</em>",
  "workProfile.skillsFocus.sub":
    "Used to match you in the skills exchange and with mentors.",
  "workProfile.skillsFocus.skills": "Skills",
  "workProfile.skillsFocus.focusAreas": "Focus areas",

  "workProfile.skill.branding": "Branding",
  "workProfile.skill.backend": "Backend engineering",
  "workProfile.skill.fundraising": "Fundraising",
  "workProfile.skill.photography": "Photography",
  "workProfile.skill.copywriting": "Copywriting",
  "workProfile.skill.product": "Product",

  "workProfile.focus.careerDirection": "Career direction",
  "workProfile.focus.comingOut": "Coming out professionally",
  "workProfile.focus.creativePractice": "Creative practice",
  "workProfile.focus.startingBusiness": "Starting a business",
  "workProfile.focus.difficultWorkplace": "Navigating a difficult workplace",
  "workProfile.focus.mentalHealth": "Mental health at work",

  // ── JobsPage (board) ───────────────────────────────────────────────────
  "jobs.eyebrow": "Job Board",
  "jobs.title": "Work that <em>doesn't ask you to hide.</em>",
  "jobs.lead":
    "Queer-run businesses and verified queer-inclusive employers — jobs where you can show up as yourself. No rainbow capitalism. Every listing is vetted by the community.",
  "jobs.badge.queerRun": "Queer-run",
  "jobs.badge.verified": "Community verified",
  "jobs.badge.location": "Lisbon + remote",
  "jobs.postCta": "+ Post a job",

  "jobs.filter.all": "All roles",
  "jobs.filter.design": "Design",
  "jobs.filter.tech": "Tech",
  "jobs.filter.arts": "Arts & Culture",
  "jobs.filter.care": "Care",
  "jobs.filter.food": "Food",
  "jobs.filter.community": "Community",

  "jobs.card.applyBy": "Apply by {date}",
  "jobs.card.deadlineOpen": "Open",
  "jobs.card.save": "Save",
  "jobs.card.saved": "Saved",
  "jobs.card.saveAriaLabel": "Save {title}",
  "jobs.card.unsaveAriaLabel": "Remove {title} from saved",
  "jobs.card.savedToast": "Saved {title}",
  "jobs.card.unsavedToast": "Removed {title} from saved",
  "jobs.card.applyCta": "Apply →",
  "jobs.card.applyAriaLabel": "Apply for {title}",

  "jobs.safetyBanner.text":
    "Matched to your work profile — showing <strong>verified-safe employers</strong>.",
  "jobs.safetyBanner.link": "Change in your work profile",
  "jobs.safetyBanner.showVerified": "Show verified only",
  "jobs.safetyBanner.showAll": "Show all",
  "jobs.safetyBanner.showAllCount": "Show all ({count} more)",

  "jobs.empty.title": "No roles match right now",
  "jobs.empty.verifiedDescription":
    "Nothing in this category is verified-safe yet. Show all roles, or pick a different category.",
  "jobs.empty.description":
    "No openings in this category at the moment. Browse every role, or check back soon — listings are added weekly.",
  "jobs.empty.showAll": "Show all roles",
  "jobs.empty.clearCategory": "Clear category",

  "jobs.employers.title": "Queer-run employers <em>we trust</em>",
  "jobs.employers.subtitle":
    "These organisations are run by or for the queer community. Working here means your money stays in the network.",

  // ── Safety badges (shared employer-safety vocabulary) ──────────────────
  "safetyBadge.verified.label": "Verified safe",
  "safetyBadge.verified.blurb":
    "Earned, not claimed. We confirm inclusive policies on paper, then cross-check with at least three anonymous reviews from current or former LGBTQ+ staff. Re-checked every year.",
  "safetyBadge.trans.label": "Trans-friendly",
  "safetyBadge.trans.blurb":
    "Documented trans-inclusive practice: gender-affirming healthcare in the plan, a name/pronoun-change process, and gender-neutral facilities — confirmed by staff reviews.",
  "safetyBadge.out.label": "Safe to be out",
  "safetyBadge.out.blurb":
    'Members rate this employer 8+/10 on "safe to be out at work" — being open about who you are is a non-event here, not a risk.',
  "safetyBadge.affiliation.run.label": "Queer-run",
  "safetyBadge.affiliation.run.blurb":
    "Led or owned by queer people — decisions, culture, and money stay inside the community. Verified during vetting, not self-reported.",
  "safetyBadge.affiliation.friendly.label": "Queer-friendly",
  "safetyBadge.affiliation.friendly.blurb":
    "An affirming employer with inclusive policies and a real LGBTQ+ presence — but not queer-led. Welcoming, just not community-owned.",

  // ── jobs.adapters.ts (live-mode composed chrome) ───────────────────────
  // The live adapter must emit keys, never composed English, so demo and live
  // render the same translated phrasing.
  "jobs.pay.barterOrDiscuss": "Barter / to discuss",
  "jobs.pay.competitive": "Competitive",
  "jobs.pay.openToBarter": "Open to barter",
  "jobs.pay.toDiscuss": "To discuss",
  "jobs.posted.on": "Posted {date}",
  "jobs.posted.recently": "Posted recently",
  "jobs.qrLabel.inclusive": "Inclusive",

  // ── JobDetailPage (+ header / body / sidebar) ──────────────────────────
  "jobDetail.breadcrumb.jobs": "Jobs",
  "jobDetail.saveTitle": "Save listing",
  "jobDetail.savedToast": "Listing saved to your profile.",
  "jobDetail.unsavedToast": "Listing removed from saved.",
  "jobDetail.chip.applyBy": "Apply by {date}",

  "jobDetail.section.about": "About the role",
  "jobDetail.section.dayToDay": "Day to day",
  "jobDetail.section.lookingFor": "What we're looking for",
  "jobDetail.section.offer": "What we offer",
  "jobDetail.section.aboutCompany": "About {company}",
  "jobDetail.section.viewCompany": "View company profile →",
  "jobDetail.section.safety": "Safety",
  "jobDetail.section.safetyBody":
    "How {company} is rated by the community on the things that matter to queer professionals.",
  "jobDetail.section.safetyReviews": "See safety reviews →",

  "jobDetail.sidebar.salary": "Salary",
  "jobDetail.sidebar.type": "Type",
  "jobDetail.sidebar.location": "Location",
  "jobDetail.sidebar.category": "Category",
  "jobDetail.sidebar.deadline": "Deadline",
  "jobDetail.sidebar.applyCta": "Apply now →",
};

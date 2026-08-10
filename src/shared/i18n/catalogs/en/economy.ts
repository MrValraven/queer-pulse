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
  "incubator.mentors.empty.title": "Mentor matching is coming soon",
  "incubator.mentors.empty.description":
    "Once the community mentor pool is live, you'll be matched to someone in your sector right here.",
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
  "salary.emptyLive.title": "The salary board is coming soon",
  "salary.emptyLive.description":
    "Be the first to add an anonymous salary and help the next person walk into their negotiation prepared.",
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
  "workHub.card.apps.trackAll": "Track every role you've applied to",
  "workHub.card.apps.viewAll": "View all applications",
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
  "workProfile.savingLabel": "Saving…",
  "workProfile.savedToast": "Work profile saved",
  "workProfile.saveFailedToast":
    "We couldn't save that — your settings are still exactly as they were. Try again in a moment.",

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
  "jobs.card.applyCta": "Apply",
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

  "jobs.loadingMore": "Loading…",
  "jobs.loadMoreCta": "Load more roles",

  "jobs.employers.title": "Queer-run employers <em>we trust</em>",
  "jobs.employers.subtitle":
    "These organisations are run by or for the queer community. Working here means your money stays in the network.",
  "jobs.employers.loadingMore": "Loading…",
  "jobs.employers.loadMoreCta": "Load more employers",

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
  "jobs.pay.perHour": "/hr",
  "jobs.pay.perDay": "/day",
  "jobs.pay.perProject": "/project",
  "jobs.pay.perMonth": "/mo",
  "jobs.pay.perYear": "/yr",
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
  "jobDetail.section.viewCompany": "View company profile",
  "jobDetail.section.safety": "Safety",
  "jobDetail.section.safetyBody":
    "How {company} is rated by the community on the things that matter to queer professionals.",
  "jobDetail.section.safetyReviews": "See safety reviews",

  "jobDetail.sidebar.salary": "Salary",
  "jobDetail.sidebar.type": "Type",
  "jobDetail.sidebar.location": "Location",
  "jobDetail.sidebar.category": "Category",
  "jobDetail.sidebar.deadline": "Deadline",
  "jobDetail.sidebar.applyCta": "Apply now",
  "jobDetail.report.cta": "Report this job",
  "jobDetail.report.ariaLabel": "Report {name}",

  // ── HousingPage / HousingBoard / HousingSections ───────────────────────
  "housing.meta.title": "LGBTQ+ housing and flatmates board in Lisbon",
  "housing.meta.description":
    "Find a room, sublet, or flatmate in Lisbon on QueerPulse's housing board — browse listings, filter by type, or list your own space.",
  "housing.tabs.housing": "Housing",
  "housing.tabs.flatmates": "Flatmates",
  "housing.hero.eyebrow": "Housing Board · Lisbon",
  "housing.hero.title":
    "Find a home — and the people to <em>share it with.</em>",
  "housing.hero.lead":
    "A queer-specific housing board for Lisbon. Browse spaces to rent, or find a flatmate you can actually be yourself around — all within the community network.",
  "housing.hero.note":
    "Every listing and profile is posted by a verified QueerPulse member",

  "housing.filter.all": "All listings",
  "housing.filter.sublet": "Sublet",
  "housing.filter.room": "Room share",
  "housing.filter.short": "Short-term",
  "housing.filter.studio": "Studio / whole flat",
  "housing.listSpaceCta": "+ List your space",

  "housing.empty.filteredTitle": "No listings of this kind right now",
  "housing.empty.title": "The housing board is quiet right now",
  "housing.empty.filteredDescription":
    "Nothing's posted in this category at the moment. Clear the filter to see every space the community has open — new listings go up often.",
  "housing.empty.description":
    "No spaces are posted yet. When members share sublets, room shares, and short-term stays, they'll show up here — check back soon, or list a space of your own.",
  "housing.empty.clearFilters": "Clear filters",
  "housing.empty.listSpace": "List a space",
  "housing.listing.photoAlt": "Photo · {hood}",
  "housing.listing.from": "From {date}",
  "housing.card.saveAriaLabel": "Save {title}",
  "housing.card.unsaveAriaLabel": "Remove {title} from saved",
  "housing.card.savedToast": "Saved {title}",
  "housing.card.unsavedToast": "Removed {title} from saved",

  "housing.landlords.heading": "Community-endorsed <em>landlords</em>",
  "housing.landlords.subtitle":
    "Members have vouched for these landlords as queer-friendly, reliable, and fair. Not a guarantee — always do your own due diligence.",
  "housing.landlords.endorsedBadge": "Community-endorsed",
  "housing.landlords.suggestCta": "Suggest a landlord",
  "housing.landlords.emptyTitle": "No landlords endorsed yet",
  "housing.landlords.emptyBody":
    "Be the first to tell us about one you'd vouch for — queer-friendly, reliable, fair.",

  "housing.tipsHeading": "Housing in Lisbon — <em>what to know</em>",
  "housing.tip.budget.title": "Budget for a competitive market",
  "housing.tip.budget.text":
    "Rooms in central neighbourhoods go for €700–1000/month. Studios €900–1400. Things move quickly. Have documents ready: NIF, proof of income or a guarantor, and a cover message.",
  "housing.tip.board.title": "Use the community board",
  "housing.tip.board.text":
    'The QueerPulse board consistently surfaces housing before it hits any portal. Post "looking for a room in [neighbourhood]" and the network will reply. It works.',
  "housing.tip.rights.title": "Know your rights as a tenant",
  "housing.tip.rights.text":
    "Portuguese tenancy law is reasonably protective. You need a written contract. Landlords can't evict without proper notice. ILGA Portugal can advise if you face discrimination.",
  "housing.tip.shortTerm.title": "Short-term first is fine",
  "housing.tip.shortTerm.text":
    "It's completely valid to arrive with a short-term sublet for 2–3 months and find long-term housing once you know the city better.",
  "housing.tip.gut.title": "Trust your gut on viewings",
  "housing.tip.gut.text":
    "Meet the landlord before signing. Ask about other tenants. A bad feeling is worth more than a good price.",
  "housing.tip.emergency.title": "In an emergency, ask the community",
  "housing.tip.emergency.text":
    "If you're suddenly homeless or in a dangerous living situation, post to the board. The community responds quickly to genuine need.",

  "housing.subpages.eyebrow": "Housing",
  "housing.subpages.title": "More on housing",
  "housing.subpages.coop.label": "Housing Co-op",
  "housing.subpages.coop.blurb":
    "Members buying and running homes together — how co-ops form, and how to join one.",

  // ── HousingModals (message the lister / recommend a landlord) ─────────
  "housingModal.close": "Close",
  "housingModal.charsToSend_one": "{count} more character to send",
  "housingModal.charsToSend_other": "{count} more characters to send",
  "housingModal.charsToSubmit_one": "{count} more character to submit",
  "housingModal.charsToSubmit_other": "{count} more characters to submit",
  "housingModal.charsCount_one": "{count} character",
  "housingModal.charsCount_other": "{count} characters",
  "housingModal.cancel": "Cancel",
  "housingModal.done": "Done",

  "housingModal.message.ariaLabel": "Message the lister",
  "housingModal.message.successTitle": "Message <em>sent.</em>",
  "housingModal.message.successBody":
    "Your message is on its way to <strong>{toName}</strong>, who usually replies <strong>{responseTime}</strong>. You'll get a notification here when they do. Contact details are shared once you both agree to take it further.",
  "housingModal.message.eyebrow": "Message the lister",
  "housingModal.message.title": "Message <em>{toName}</em>",
  "housingModal.message.body":
    "About <strong>{listingTitle}</strong>. Keep it human — a sentence about who you are and why it suits you goes a long way. Your profile is shared with the message.",
  "housingModal.message.note":
    "For your safety, keep the conversation on QueerPulse until you've met. Never send a deposit before viewing the place in person.",
  "housingModal.message.send": "Send message",
  "housingModal.message.error":
    "Couldn't send your message — it didn't go through. Check your connection and try again.",
  "housingModal.message.draftNamed":
    'Hi {name}, I\'m interested in "{listingTitle}". Is it still available? A bit about me: ',
  "housingModal.message.draftGeneric":
    'Hi there, I\'m interested in "{listingTitle}". Is it still available? A bit about me: ',

  "housingModal.recommend.ariaLabel": "Recommend a landlord",
  "housingModal.recommend.successTitle": "Thank you. <em>Recorded.</em>",
  "housingModal.recommend.successBody":
    "Your recommendation for <strong>{landlordName}</strong> will appear once a moderator has confirmed you've rented from them — it's how the board stays trustworthy. This is the kind of thing that makes someone's move so much safer.",
  "housingModal.recommend.eyebrow": "Recommend a landlord",
  "housingModal.recommend.title": "Recommend <em>{landlordName}</em>",
  "housingModal.recommend.body":
    "You've rented from them and it went well. Tell other members what to expect — the specific, useful things you wish you'd known.",
  "housingModal.recommend.ratingLabel": "Your rating",
  "housingModal.recommend.starAriaLabel_one": "{count} star",
  "housingModal.recommend.starAriaLabel_other": "{count} stars",
  "housingModal.recommend.whatShouldKnow": "What should members know?",
  "housingModal.recommend.placeholder":
    "How were repairs, contracts, deposits? Did they respect your privacy and your relationships? Specifics help.",
  "housingModal.recommend.note":
    "Recommendations are checked before they appear. Only recommend landlords you've actually rented from.",
  "housingModal.recommend.submit": "Submit recommendation",
  "housingModal.recommend.error":
    "Couldn't submit your recommendation — check your connection and try again.",

  // ── ListSpaceModal ──────────────────────────────────────────────────────
  "listSpace.type.sublet": "Sublet",
  "listSpace.type.room": "Room share",
  "listSpace.type.short": "Short-term",
  "listSpace.type.studio": "Studio / whole flat",
  "listSpace.success.title": "Listing",
  "listSpace.success.em": "submitted.",
  "listSpace.success.body":
    "Thanks for sharing <strong>{title}</strong>. A moderator checks every listing before it goes live — usually within a day — so the board stays trustworthy for everyone looking for a safe place to land.",
  "listSpace.eyebrow": "Housing board",
  "listSpace.title": "List your <em>space.</em>",
  "listSpace.sub":
    "Open your place to a verified member of the community. A few details now — you can add photos once it's approved.",
  "listSpace.titleLabel": "Listing title *",
  "listSpace.titlePlaceholder": "e.g. Sunny room in a queer flatshare",
  "listSpace.areaLabel": "Neighbourhood / area *",
  "listSpace.areaPlaceholder": "e.g. Arroios, Lisbon",
  "listSpace.rentLabel": "Monthly rent (€) *",
  "listSpace.rentPlaceholder": "e.g. 650",
  "listSpace.typeLabel": "Type of space *",
  "listSpace.chooseOne": "Choose one…",
  "listSpace.note":
    "Listings are reviewed before they appear. Never ask for a deposit before someone has viewed the place in person.",
  "listSpace.submitting": "Submitting…",
  "listSpace.submitCta": "Submit listing",
  "listSpace.error":
    "Couldn't submit your listing — it didn't go through. Check your connection and try again.",

  // ── SuggestLandlordModal ────────────────────────────────────────────────
  "suggestLandlord.ariaLabel": "Suggest a landlord",
  "suggestLandlord.eyebrow": "Housing board",
  "suggestLandlord.title": "Suggest a <em>landlord.</em>",
  "suggestLandlord.sub":
    "Know someone renting out queer-friendly, actually decent places? Tell us about them — a moderator checks in before they join the board.",
  "suggestLandlord.nameLabel": "Landlord's name *",
  "suggestLandlord.namePlaceholder": "e.g. Mariana Sousa",
  "suggestLandlord.hoodLabel": "Neighbourhood",
  "suggestLandlord.hoodPlaceholder": "e.g. Arroios, Lisbon",
  "suggestLandlord.taglineLabel": "One-line tagline",
  "suggestLandlord.taglinePlaceholder": "e.g. Fair rents, fast repairs",
  "suggestLandlord.noteLabel": "Short note for the board card",
  "suggestLandlord.notePlaceholder":
    "What should members know at a glance?",
  "suggestLandlord.aboutLabel": "More about them",
  "suggestLandlord.aboutPlaceholder":
    "What's it like renting from them? Specifics help other members.",
  "suggestLandlord.areasLabel": "Where they rent",
  "suggestLandlord.areasPlaceholder":
    "One area per line, e.g.\nArroios\nAnjos\nGraça",
  "suggestLandlord.note":
    "Suggestions are reviewed before they're added to the board. Only suggest landlords you or someone you trust has actually rented from.",
  "suggestLandlord.submitting": "Sending…",
  "suggestLandlord.submitCta": "Suggest landlord",
  "suggestLandlord.success.title": "Thank you.",
  "suggestLandlord.success.em": "Sent to review.",
  "suggestLandlord.success.body":
    "A moderator will look over <strong>{name}</strong> before adding them to the board. We'll let you know if we need anything else.",
  "suggestLandlord.error": "Couldn't send that — mind trying again?",

  // ── HousingListingPage (+ sections) ────────────────────────────────────
  "housingListing.back": "Housing board",
  "housingListing.section.about": "About this place",
  "housingListing.section.features": "Features",
  "housingListing.section.facts": "The facts",
  "housingListing.section.idealFor": "Ideal for",
  "housingListing.messageCtaArrow": "Message {name}",
  "housingListing.messageCta": "Message {name}",
  "housingListing.listedBy": "Listed by",
  "housingListing.verifiedMember": "Verified member",
  "housingListing.availableFrom":
    "Available from {date} · posted by a verified member",
  "housingListing.repliesUsually": "Usually replies <b>{time}</b>",
  "housingListing.staySafe.title": "Stay safe",
  "housingListing.staySafe.body":
    "<b>Never pay a deposit before viewing in person.</b> Keep the conversation on QueerPulse until you've met. If something feels off, the Queer Housing Justice Network can advise.",
  "housingListing.moreOnBoard": "More on the board",
  "housingListing.save": "Save",
  "housingListing.saved": "Saved",
  "housingListing.saveAriaLabel": "Save {title}",
  "housingListing.unsaveAriaLabel": "Remove {title} from saved",
  "housingListing.savedToast": "Saved {title}",
  "housingListing.unsavedToast": "Removed {title} from saved",
  // Fetch-error state (non-404): show a retry rather than silently redirecting.
  "housingListing.error.title": "We couldn't load this place",
  "housingListing.error.body":
    "Something went wrong on our end, not yours. Give it another try in a moment.",
  "housingListing.error.retry": "Try again",

  // ── ReportListingModal ─────────────────────────────────────────────────
  "housingListing.report": "Report",
  "housingListing.reportAriaLabel": "Report {title}",
  "housingListing.reportModal.ariaLabel": "Report",
  "housingListing.reportModal.eyebrow": "Report to our team",
  "housingListing.reportModal.title": "What's wrong with <em>{title}?</em>",
  "housingListing.reportModal.lead":
    "Reports help us keep QueerPulse trustworthy. Tell us what's going on — specifics help the review team. Your name is never shared with whoever you're reporting.",
  "housingListing.reportModal.concernLabel": "What's the concern?",
  "housingListing.reportModal.detailLabel": "Tell us more",
  "housingListing.reportModal.detailPlaceholder":
    "What made this feel unsafe, discriminatory, or untrustworthy? Be as specific as you're comfortable with.",
  "housingListing.reportModal.charsRemaining_one":
    "{count} more character to submit",
  "housingListing.reportModal.charsRemaining_other":
    "{count} more characters to submit",
  "housingListing.reportModal.charsCount_one": "{count} character",
  "housingListing.reportModal.charsCount_other": "{count} characters",
  "housingListing.reportModal.confidentialNote":
    "Reports are confidential. Moderators see your name; the person or party you report never does. In an emergency, call <strong>112</strong> first.",
  "housingListing.reportModal.cancelCta": "Cancel",
  "housingListing.reportModal.submitting": "Submitting…",
  "housingListing.reportModal.submitCta": "Submit report",
  "housingListing.reportModal.success.title": "Report",
  "housingListing.reportModal.success.em": "received.",
  "housingListing.reportModal.success.body":
    "Thank you. A moderator will review {title}. We may contact you for more detail, but we'll never share your report with whoever you reported.",
  "housingListing.reportModal.doneCta": "Done",
  "housingListing.reportModal.error":
    "Couldn't send your report — it didn't reach us. Check your connection and try again.",

  // ── ContactRequestModal (shared "reach out" flow) ──────────────────────
  "contactRequest.defaultTitle": "Send a",
  "contactRequest.defaultEm": "request.",
  "contactRequest.defaultSuccessTitle": "Request",
  "contactRequest.defaultSuccessEm": "sent.",
  "contactRequest.defaultSendLabel": "Send request",
  "contactRequest.defaultSendingLabel": "Sending…",
  "contactRequest.defaultSuccessBody":
    "Your message is on its way to <strong>{firstName}</strong>. They'll reply straight to your inbox here — contact details are shared once you both agree to take it further.",
  "contactRequest.messageLabel": "Your message *",
  "contactRequest.messagePlaceholder":
    "A sentence about who you are and what you're hoping for goes a long way.",
  "contactRequest.charsNeeded_one":
    "{count} more character so they have context.",
  "contactRequest.charsNeeded_other":
    "{count} more characters so they have context.",
  "contactRequest.looksGood":
    "Looks good — keep the conversation here until you both decide to take it further.",
  "contactRequest.cancel": "Cancel",
  "contactRequest.done": "Done",
  "contactRequest.sendError":
    "Couldn't send that — mind giving it another try?",

  // ── LandlordPage ─────────────────────────────────────────────────────────
  "landlordPage.eyebrow": "Community-endorsed landlord",
  "landlordPage.recommendCta": "Recommend {name}",
  "landlordPage.recommendCount_one": "{count} member recommendation",
  "landlordPage.recommendCount_other": "{count} member recommendations",
  "landlordPage.section.about": "About {name}",
  "landlordPage.section.whereTheyRent": "Where they rent",
  "landlordPage.section.recommendations": "Member recommendations",
  "landlordPage.sidebar.atAGlance": "At a glance",
  "landlordPage.sidebar.rentedFrom": "Rented from {name}?",
  "landlordPage.sidebar.rentedFromBody":
    "Your recommendation is what makes this list trustworthy — and what makes someone else's move so much safer. It takes two minutes.",
  "landlordPage.sidebar.recommendCta": "Recommend this landlord",
  "landlordPage.sidebar.howToRent": "How to rent from them",
  "landlordPage.sidebar.requestIntro": "Request an introduction",
  "landlordPage.toast.recommended_one":
    "Recommendation submitted — {count} star",
  "landlordPage.toast.recommended_other":
    "Recommendation submitted — {count} stars",
  "landlordPage.intro.eyebrow": "Housing · Introduction",
  "landlordPage.intro.title": "Ask for an",
  "landlordPage.intro.em": "introduction.",
  "landlordPage.intro.sub":
    "We'll pass a warm note to {name} on your behalf. Say a little about what you're looking for and when you'd like to move.",
  "landlordPage.intro.preset":
    "Hi {firstName}, I found you through the QueerPulse housing board. I'm looking for a place in ",
  "landlordPage.intro.successTitle": "Introduction",
  "landlordPage.intro.successEm": "requested.",
  "landlordPage.intro.successBody":
    "We've passed your note to <strong>{firstName}</strong>. If they have something that fits, they'll reach out here — no pressure either way.",
  "landlordPage.intro.sendLabel": "Request introduction",
  "landlordPage.intro.fallbackName": "A member",
  "landlordPage.save": "Save",
  "landlordPage.saved": "Saved",
  "landlordPage.saveAriaLabel": "Save {name}",
  "landlordPage.unsaveAriaLabel": "Remove {name} from saved",
  "landlordPage.savedToast": "Saved {name}",
  "landlordPage.unsavedToast": "Removed {name} from saved",
  "landlordPage.report": "Report",
  "landlordPage.reportAriaLabel": "Report {name}",

  // ── ModalKit (shared modal shell + success panel used across Economy) ──
  "modalKit.closeAriaLabel": "Close",
  "modalKit.close": "Close",

  // ── FlatmatesBoard / FlatmatesFilterBar / FlatmateCard ─────────────────
  // Scope note: neighbourhood names, lifestyle tags, and per-profile fields
  // (note, budget, move-in text) are mock member content in this fictional
  // board — left in English (see docs/i18n/extraction-brief.md §1). Only the
  // surrounding chrome (labels, CTAs, empty states) is translated below.
  "flatmates.filter.show": "Show",
  "flatmates.filter.all": "All profiles",
  "flatmates.filter.seeking": "Seeking a room",
  "flatmates.filter.offering": "Offering a room",
  "flatmates.filter.anyNeighbourhood": "Any neighbourhood",
  "flatmates.filter.anyBudget": "Any budget",
  "flatmates.filter.budget.upTo700": "Up to €700",
  "flatmates.filter.budget.700to900": "€700–900",
  "flatmates.filter.budget.900to1100": "€900–1,100",
  "flatmates.filter.budget.1100plus": "€1,100+",
  "flatmates.filter.anyMoveIn": "Any move-in",
  "flatmates.filter.moveIn.now": "Available now",
  "flatmates.filter.moveIn.jul": "July",
  "flatmates.filter.moveIn.aug": "August",
  "flatmates.filter.moveIn.flex": "Flexible",
  "flatmates.filter.lifestyle": "Lifestyle",

  "flatmates.count_one": "{count} profile active this week",
  "flatmates.count_other": "{count} profiles active this week",
  "flatmates.postProfileCta": "Post your profile",

  "flatmates.empty.title": "The flatmate board is quiet right now",
  "flatmates.empty.description":
    "No profiles are posted yet. When members share what they're looking for — a room, a flatmate, a neighbourhood, a budget — they'll show up here. Check back soon, or post a profile of your own.",
  "flatmates.empty.filteredTitle": "No profiles match those filters",
  "flatmates.empty.filteredDescription":
    "No one fits that exact combination right now. Try widening your filters — or post your own profile and let the right flatmate find you.",
  "flatmates.empty.clearFilters": "Clear filters",

  "flatmates.outro.title": "A home where <em>you belong.</em>",
  "flatmates.outro.sub":
    "The right flatmate can make a city feel like home. Take your time, trust your gut, and use the community.",
  "flatmates.outro.askForum": "Ask the forum",

  "flatmates.card.memberSince": "Member since {date}",
  "flatmates.card.sayHello": "Say hello",
  "flatmates.card.helloSent": "Hello sent",
  "flatmates.card.sayHelloError": "Couldn't send your hello — try again in a moment.",
  "flatmates.card.matchScore": "{score}% match",
  "flatmates.card.save": "Save",
  "flatmates.card.saved": "Saved",
  "flatmates.card.saveAriaLabel": "Save {name}'s profile",
  "flatmates.card.unsaveAriaLabel": "Remove {name}'s profile from saved",
  "flatmates.card.savedToast": "Saved {name}'s profile",
  "flatmates.card.unsavedToast": "Removed {name}'s profile from saved",
  "flatmates.card.reportCta": "Report",
  "flatmates.card.reportAriaLabel": "Report {name}'s profile",

  // ── PostProfileModal / PostProfileForm ─────────────────────────────────
  "postProfileModal.ariaLabel": "Post your flatmate profile",
  "postProfileModal.error":
    "Couldn't save your profile — mind giving it another try?",
  "postProfileModal.success.title": "You're on the <em>board.</em>",
  "postProfileModal.success.body":
    "Your profile is live. Members will reach out directly — keep an eye on your QueerPulse messages.",
  "postProfileModal.success.backCta": "Back to profiles",

  "postProfileForm.title": "Post your profile",
  "postProfileForm.sub":
    "Takes about two minutes. Your profile goes live straight away — members reach out directly, no matching algorithm.",
  "postProfileForm.lookingForLabel": "What are you looking for?",
  "postProfileForm.seekingDesc": "You're looking for a room in a flat or house",
  "postProfileForm.offeringDesc": "You have a room or flat share to offer",
  "postProfileForm.pronounsLabel": "Pronouns (optional)",
  "postProfileForm.pronounsPlaceholder": "e.g. she/her, they/them",
  "postProfileForm.neighbourhoodLabel": "Neighbourhood",
  "postProfileForm.neighbourhoodPlaceholder": "Preference / location",
  "postProfileForm.anywhereCentral": "Anywhere central",
  "postProfileForm.budgetLabel": "Budget / month (€)",
  "postProfileForm.budgetPlaceholder": "e.g. 750",
  "postProfileForm.moveInLabel": "Available / move-in from",
  "postProfileForm.moveInPlaceholder": "When?",
  "postProfileForm.moveIn.jul2026": "July 2026",
  "postProfileForm.moveIn.aug2026": "August 2026",
  "postProfileForm.moveIn.sep2026": "September 2026",
  "postProfileForm.aboutLabel": "About you & what you're looking for in a home",
  "postProfileForm.aboutPlaceholder":
    "Tell people a bit about yourself — your rhythm, your work, what kind of home makes you feel good. No need to sell yourself; just be honest.",
  "postProfileForm.lifestyleTagsLabel": "Lifestyle tags",
  "postProfileForm.submitCta": "Post profile",

  // ── CompanyPage (+ Cover / Sidebar / Tabs) ──────────────────────────────
  "company.notFound.title": "Company not found",
  "company.notFound.description":
    "This company profile doesn't exist or has been taken down. Browse the job board to find queer-run and verified-inclusive employers.",
  "company.notFound.backCta": "Back to the job board",

  "company.cover.backCta": "All companies",
  "company.cover.seeOpenRoles_one": "See {count} open role",
  "company.cover.seeOpenRoles_other": "See {count} open roles",
  "company.cover.follow": "Follow company",
  "company.cover.following": "Following",
  "company.cover.message": "Message",
  "company.cover.openRoleStat_one": "Open role",
  "company.cover.openRoleStat_other": "Open roles",
  "company.cover.toast.followed":
    "Following {name} — you'll hear about new roles",
  "company.cover.toast.unfollowed": "Unfollowed {name}",

  "company.sidebar.detailsTitle": "Studio details",
  "company.sidebar.peopleTitle": "People here on QueerPulse",
  "company.sidebar.hiringContactTitle": "Hiring contact",
  "company.sidebar.messagePerson": "Message {name}",
  "company.sidebar.sendMessage": "Send a message",
  "company.report.cta": "Report this company",
  "company.report.ariaLabel": "Report {name}",

  "company.tabs.about": "About",
  "company.tabs.jobs": "Jobs",
  "company.tabs.reviews": "Reviews",
  "company.tabs.work": "Work",

  "company.jobs.empty.title": "No open roles right now",
  "company.jobs.empty.description":
    "This company isn't hiring on QueerPulse at the moment. Follow them from the top of the page to hear when a role opens.",
  "company.jobs.postRole": "Post a role",

  "company.reviews.outOf5_one": "/ 5 · {count} review",
  "company.reviews.outOf5_other": "/ 5 · {count} reviews",
  "company.reviews.writeReview": "Write a review",
  "company.reviews.empty.title": "No reviews yet",
  "company.reviews.empty.description":
    "Been here, or worked with them? Be the first to tell the next queer person what it's actually like.",
  "company.reviews.starsAriaLabel": "{count} out of 5",
  "company.reviews.loadingMore": "Loading…",
  "company.reviews.loadMoreCta": "Load more reviews",

  "company.work.intro": "A small selection of recent projects from the studio.",

  // ── CompanyReviewModal ──────────────────────────────────────────────────
  // Scope note: the composed review body prefixes ("The good: …", "The hard
  // parts: …") and byline ("{role} · Rated {stars}/5 · just now") are baked
  // into the stored review record shown to every future viewer regardless of
  // their language — left in English deliberately, same as job-application
  // answer labels. Only the compose-modal's own chrome is translated below.
  "companyReview.overallRatingAriaLabel": "Overall rating",
  "companyReview.starAriaLabel_one": "{count} star",
  "companyReview.starAriaLabel_other": "{count} stars",
  "companyReview.success.title": "Review",
  "companyReview.success.em": "posted.",
  "companyReview.success.body":
    "Thank you — your review of {companyName} is live. {companyName} can't edit or remove what you wrote.",
  "companyReview.title": "What was it <em>actually like?</em>",
  "companyReview.sub":
    "Your honest account helps the next queer person decide whether to take the interview. Verified by membership.",
  "companyReview.headlineLabel": "Headline",
  "companyReview.headlinePlaceholder": "Sum it up in a line",
  "companyReview.roleLabel": "Your role / tenure",
  "companyReview.rolePlaceholder": "e.g. Designer, 2 years in role",
  "companyReview.prosLabel": "What worked — the good",
  "companyReview.prosPlaceholder":
    "Pronouns respected, real inclusion, leadership that gets it…",
  "companyReview.consLabel": "What was hard — the rest",
  "companyReview.consPlaceholder": "Where the follow-through fell short…",
  "companyReview.cancel": "Cancel",
  "companyReview.posting": "Posting…",
  "companyReview.submitCta": "Post review",
  "companyReview.toast.alreadyReviewed":
    "You've already reviewed this company.",
  "companyReview.toast.error":
    "We couldn't post your review. Please try again.",

  // ── EmployerReviewsPage (+ Card) ─────────────────────────────────────────
  // Scope note: company names, scores, quotes, and per-review text/meta in
  // employerReviews.data.ts are mock content — in live mode these would be
  // fetched company records and member-written reviews. Left in English.
  "employerReviews.hero.eyebrow": "Employer Reviews",
  "employerReviews.hero.title": "Is your workplace <em>actually safe?</em>",
  "employerReviews.hero.lead":
    "Anonymous reviews of Lisbon companies by LGBTQ+ employees. Beyond the Pride logo — what it's actually like to be out there, behind closed office doors.",

  "employerReviews.how.title": "How it <em>works</em>",
  "employerReviews.how.sub":
    "Anonymous, verified by membership, not editable by employers.",
  "employerReviews.how.write.title": "Write anonymously",
  "employerReviews.how.write.desc":
    "Your identity is never attached to your review. We verify you're a member — nothing else is logged.",
  "employerReviews.how.rate.title": "Rate what matters",
  "employerReviews.how.rate.desc":
    "Safety to be out, management awareness, trans inclusion, HR responsiveness, and culture vs. stated values.",
  "employerReviews.how.help.title": "Help the next person",
  "employerReviews.how.help.desc":
    "Your review helps other queer people make better choices about where they take their talent and their whole selves.",

  "employerReviews.recent.title": "Recent <em>reviews</em>",
  "employerReviews.recent.sub":
    "Member-written · anonymous · updated continuously",
  "employerReviews.recent.browseCta": "Browse queer-inclusive jobs",
  "employerReviews.recent.writeCta": "Write a review",
  "employerReviews.emptyLive.title": "No employers reviewed yet",
  "employerReviews.emptyLive.description":
    "No reviews have been published yet. Be the first to share what it's really like to work somewhere.",

  "employerReviews.verify.title": "How <em>verification</em> works",
  "employerReviews.verify.verifiedSafe.label": "Verified safe",
  "employerReviews.verify.verifiedSafe.desc":
    "Inclusive policies confirmed on paper, then cross-checked against 3+ anonymous staff reviews. Re-verified yearly.",
  "employerReviews.verify.queerRun.label": "Queer-run vs. queer-friendly",
  "employerReviews.verify.queerRun.desc":
    "Queer-run means led or owned by queer people. Queer-friendly is affirming but not community-led — we never conflate the two.",
  "employerReviews.verify.confidence.label": "Confidence in the score",
  "employerReviews.verify.confidence.desc":
    "Every score shows how many reviews it rests on. More reviews, more confidence — a 9 from 3 people is not a 9 from 30.",

  "employerReviews.write.title": "Write a <em>review.</em>",
  "employerReviews.write.body":
    "You've been there. You know what it was actually like. Your review helps the next queer person decide whether to take that interview. It takes 5 minutes and is completely anonymous.",
  "employerReviews.write.note":
    "Members only · anonymous · your identity is never stored with your review",
  "employerReviews.write.rulesTitle": "Our review principles",
  "employerReviews.write.rule.anonymous":
    "Reviews are anonymous — your name is never attached",
  "employerReviews.write.rule.verifyMembership":
    "We verify you're a QueerPulse member, nothing more",
  "employerReviews.write.rule.noEdit":
    "Employers cannot edit, remove, or respond to reviews",
  "employerReviews.write.rule.moderation":
    "We moderate for factual accuracy, not for comfort",
  "employerReviews.write.rule.retract":
    "You can update or retract your review at any time",
  "employerReviews.write.rule.noBuying":
    "No company can buy a higher rating or featured placement",

  "employerReviews.outro.title": "Your work <em>matters.</em>",
  "employerReviews.outro.sub":
    "You deserve to know what you're walking into. So does everyone else.",
  "employerReviews.outro.cta": "Request an invite",

  "employerReviewCard.basedOn_one": "based on {count} review",
  "employerReviewCard.basedOn_other": "based on {count} reviews",
  "employerReviewCard.readAll_one": "Read all {count} review",
  "employerReviewCard.readAll_other": "Read all {count} reviews",
  "employerReviewCard.showLess": "Show less",

  // ── WriteReviewModal (EmployerReviewsPage's anonymous review flow) ─────
  // Scope note: same as CompanyReviewModal — the composed review text/meta is
  // stored content shown to future viewers, left in English deliberately.
  "writeReviewModal.eyebrow": "Write a review · anonymous",
  "writeReviewModal.sub":
    "Your honest account helps the next queer person decide whether to take the interview. Verified by membership, never attached to your name.",
  "writeReviewModal.companyLabel": "Company",
  "writeReviewModal.roleLabel": "Your role / team",
  "writeReviewModal.rolePlaceholder": "e.g. Engineering, Design, Operations",
  "writeReviewModal.prosPlaceholder":
    "Pronouns respected, real trans healthcare, leadership that gets it…",
  "writeReviewModal.consPlaceholder":
    "Pride logo with no follow-through, HR that didn't know how to help…",
  "writeReviewModal.success.body":
    "Thank you — your anonymous review of {company} is live. Your name is never stored with it, and {company} can't edit or remove what you wrote.",

  // ── GrantsPage (+ Sections / Sidebar) ───────────────────────────────────
  // Scope note: grant/fellowship listings in grants.data.tsx (names, orgs,
  // amounts, descriptions) are a curated directory of real external funding
  // programmes — informational content, not platform chrome. In live mode
  // this would be a fetched/maintained directory. Left in English.
  "grants.hero.eyebrow": "Grants & Funding",
  "grants.hero.title": "Money for <em>queer work.</em>",
  "grants.hero.lead":
    "Community-curated guide to grants, fellowships, and funding for LGBTQ+ individuals and organisations — in Portugal and across Europe. Maintained by members who've successfully applied.",
  "grants.hero.stat.tracked": "opportunities tracked",
  "grants.hero.stat.open": "currently open",
  "grants.hero.stat.communityLabel": "Community",
  "grants.hero.stat.maintained": "maintained",

  "grants.filter.all": "All",
  "grants.filter.individual": "For individuals",
  "grants.filter.org": "For organisations",
  "grants.filter.arts": "Arts & culture",
  "grants.filter.community": "Community projects",
  "grants.filter.eu": "EU / International",

  "grants.section.qp": "From <em>QueerPulse</em>",
  "grants.section.pt": "<em>Portugal</em> — national programmes",
  "grants.section.eu": "<em>EU & International</em>",

  "grants.status.open": "Open now",
  "grants.status.rolling": "Rolling",
  "grants.status.closed": "Closed",

  "grants.card.learnMore": "Learn more",

  "grants.empty.title": "Nothing matches your filter",
  "grants.empty.description":
    "No opportunities fit that category right now. Clear the filter to browse every grant and fellowship members are tracking.",
  "grants.empty.clearFilters": "Clear filters",
  "grants.emptyLive.title": "Grant tracking is coming soon",
  "grants.emptyLive.description":
    "We're building a live, community-maintained feed of grants and fellowships for queer work. Check back soon — or apply for one of our Micro Grants in the meantime.",

  "grants.guide.title": "Writing a <em>strong application</em>",
  "grants.guide.sub":
    "Advice from community members who've successfully secured grants — from micro to major.",
  "grants.guide.step.criteria.title": "Read the criteria twice",
  "grants.guide.step.criteria.body":
    "Most rejections are from applications that technically fit but don't mirror the funder's language. Map your project onto their specific wording.",
  "grants.guide.step.story.title": "Tell a specific story",
  "grants.guide.step.story.body":
    "Funders read hundreds of applications. A single specific, human story of impact will land better than broad claims.",
  "grants.guide.step.community.title": "Show your community",
  "grants.guide.step.community.body":
    "Queer-focused funders want to see the community embedded — not as beneficiaries but as participants and decision-makers.",
  "grants.guide.step.review.title": "Ask for a review",
  "grants.guide.step.review.body":
    "Before submitting, ask someone not involved to read your application. Fresh eyes catch the assumptions you've stopped seeing.",

  "grants.outro.title": "Your project <em>deserves support.</em>",
  "grants.outro.sub":
    "Found something that fits? Apply with confidence — and if you land it, pay it forward by adding the opportunity for the next member.",
  "grants.outro.cta": "See open grants",

  "grants.subpages.title": "Also in grants",
  "grants.subpages.microGrants.label": "Micro Grants",
  "grants.subpages.microGrants.blurb":
    "Small, fast community grants — apply in minutes.",

  "grants.sidebar.microGrants.title": "Our <em>Micro Grants</em>",
  "grants.sidebar.microGrants.body":
    "QueerPulse runs its own micro grant programme (€200–€2,000) for community projects in Lisbon. Faster and simpler than most external grants.",
  "grants.sidebar.microGrants.cta": "Apply now",
  "grants.sidebar.skillsExchange.title": "Skills Exchange",
  "grants.sidebar.skillsExchange.body":
    "If you need support but grants feel too formal, the barter board connects members who can swap skills — no money involved.",
  "grants.sidebar.skillsExchange.cta": "Explore the exchange",
  "grants.sidebar.appHelp.title": "Get <em>application help</em>",
  "grants.sidebar.appHelp.body":
    "Members with grant-writing experience offer workshops and one-to-one support via the skills exchange.",
  "grants.sidebar.appHelp.cta": "Find a mentor",

  // ── JobApplyPage (+ header / form / sidebar) ───────────────────────────
  "jobApply.backToJob": "Back to job",
  "jobApply.backToJobs": "Back to jobs",
  "jobApply.header.eyebrow": "Apply · {title}",
  "jobApply.header.title": "Tell <em>{org}</em> about you.",
  "jobApply.header.closes": "Closes {date}",
  "jobApply.header.progressLabel": "Application complete",

  "jobApply.aboutYouTitle": "About you",
  "jobApply.aboutYouSub":
    "We pre-filled what we could from your profile. Edit anything that's changed.",
  "jobApply.fullName": "Full name",
  "jobApply.pronouns": "Pronouns",
  "jobApply.pronounsHelper": "Shown to the hiring team.",
  "jobApply.email": "Email",
  "jobApply.location": "Where are you based?",

  "jobApply.yourWorkTitle": "Your work",
  "jobApply.yourWorkSub":
    "A CV is great. A portfolio is better. Drop both if you can.",
  "jobApply.cv": "CV or résumé",
  "jobApply.cvDrop": "Drop PDF here, or click to choose",
  "jobApply.cvHint": "Max 5 MB · PDF / DOCX",
  "jobApply.browse": "Browse",
  "jobApply.portfolio": "Portfolio links",
  "jobApply.portfolioHelper":
    "Your QueerPulse profile is auto-attached. Untick in Privacy if you'd rather not.",
  "jobApply.sitePlaceholder": "Your site or Are.na",
  "jobApply.instagramPlaceholder": "@yourhandle",

  "jobApply.whyTitle": "Why this role?",
  "jobApply.whySub":
    "Two short paragraphs is more than enough. Be specific — what about {org}, and what you'd bring.",
  "jobApply.coverNote": "Cover note",
  "jobApply.charCount": "{used} / {max}",
  "jobApply.coverPlaceholder":
    "What drew you to this role? What are you good at? What are you hoping to grow into?",
  "jobApply.availableFrom": "Available from",
  "jobApply.salaryExpectation": "Salary expectation",
  "jobApply.salaryHelper":
    "Posted range is {salary}. You can name a number outside this — they'll consider.",
  "jobApply.salaryPlaceholder": "e.g. €1,400/mo, or open",

  "jobApply.extraTitle": "One thing extra",
  "jobApply.extraOptional": "— optional",
  "jobApply.extraSub":
    "Anything else you'd like {org} to know? Working hours, access needs, references — whatever's relevant.",
  "jobApply.extraLabel": "Notes for the hiring team",
  "jobApply.extraPlaceholder":
    "I'd prefer Tuesdays and Thursdays in-office to coordinate with my kid's school pickup…",

  "jobApply.draftSavedJustNow": "Draft saved · just now",
  "jobApply.saveDraft": "Save draft",
  "jobApply.sending": "Sending…",
  "jobApply.sendCta": "Send application",

  "jobApply.sidebar.closes": "Closes <b>{date}</b>",
  "jobApply.sidebar.tipsTitle": "Before you send",

  "jobApply.success.title": "Your application's on its way to",
  "jobApply.success.closeLabel": "Track your application",
  "jobApply.success.step1":
    "{org} will see your QueerPulse profile and everything you attached.",
  "jobApply.success.step2":
    "You'll get a notification the moment they respond.",
  "jobApply.success.step3": "Most teams here reply within 10 days.",
  "jobApply.success.footerCta": "Back to all jobs",
  "jobApply.success.body":
    "Sent to {org} for the {title} role. Nothing else to do right now — the ball's in their court.",

  "jobApply.toast.draftSaved":
    "Draft saved — picks back up whenever you're ready.",
  "jobApply.error.missingFields": "Add your name and email before sending.",
  "jobApply.error.alreadyApplied":
    "You've already applied to this role — check your applications.",
  "jobApply.error.generic":
    "We couldn't send your application. Please try again.",

  "jobApply.availability.now.title": "Immediately",
  "jobApply.availability.now.desc": "Ready now",
  "jobApply.availability.soon.title": "In 2–4 weeks",
  "jobApply.availability.soon.desc": "Notice period",
  "jobApply.availability.later.title": "In 1–3 months",
  "jobApply.availability.later.desc": "Wrapping up",

  "jobApply.tip.autocorrect":
    "Triple-check your cover note — autocorrect loves rewriting “queer”.",
  "jobApply.tip.profileLink":
    "Linking just your QueerPulse profile is fine. They'll see your work.",
  "jobApply.tip.replyTime":
    "Most teams here reply to every application within 10 days.",
  "jobApply.tip.fixedComp":
    "Compensation is fixed as posted, but title and start date are often open.",

  // ── BarterPage (+ Card / PostStrip) ─────────────────────────────────────
  // Scope note: barter listing content (offer/want summaries, detail text,
  // tags, posters' names) in barter.data.ts is mock member content — in live
  // mode a fetched listing. Only the surrounding chrome is translated below.
  "barter.hero.eyebrow": "Queer skill exchange",
  "barter.hero.title": "Trade what you <em>know.</em>",
  "barter.hero.lead":
    "A structured barter board — skills for skills, expertise for expertise. No money, no platform fees. Post what you can offer and what you're hoping for in return.",
  "barter.principle.noMoney.title": "No money",
  "barter.principle.noMoney.body":
    "Every exchange is peer-to-peer. Value is set by the people involved, not the platform.",
  "barter.principle.reputation.title": "Reputation-backed",
  "barter.principle.reputation.body":
    "Offers come from verified members. Your community vouch is your credit history.",
  "barter.principle.wants.title": "What you want matters",
  "barter.principle.wants.body":
    "Post what you're looking for, not just what you can give. Needs are as welcome as offers.",

  "barter.search.placeholder": "Search the exchange…",
  "barter.mode.all": "All",
  "barter.mode.offering": "Offering",
  "barter.mode.seeking": "Seeking",
  "barter.count_one": "<b>{count}</b> post",
  "barter.count_other": "<b>{count}</b> posts",

  "barter.cat.all": "All categories",
  "barter.cat.creative": "Creative",
  "barter.cat.tech": "Tech",
  "barter.cat.legal": "Legal & admin",
  "barter.cat.care": "Care & health",
  "barter.cat.food": "Food & hosting",
  "barter.cat.body": "Body & movement",
  "barter.cat.fallback": "Skill swap",

  "barter.badge.offering": "Offering",
  "barter.badge.seeking": "Seeking",
  "barter.badge.both": "Offering & seeking",

  "barter.card.offeringLabel": "Offering",
  "barter.card.wantLabel": "Looking for",
  "barter.card.proposeCta": "Propose a swap",
  "barter.toast.messageSent": "Message sent to {name}",
  "barter.postedToday": "Today",
  "barter.postedDaysAgo_one": "{count} day ago",
  "barter.postedDaysAgo_other": "{count} days ago",

  "barter.empty.title": "Nothing matches your filters",
  "barter.empty.description":
    "No swaps fit that combination just yet. Try broadening your search — or post what you're offering and let the right trade find you.",
  "barter.empty.clearFilters": "Clear filters",
  "barter.emptyLive.title": "No swaps posted yet",
  "barter.emptyLive.description":
    "Be the first to offer a skill or item — put something on the table below and let the right trade find you.",

  "barter.postStrip.success.title": "It's <em>on the table.</em>",
  "barter.postStrip.success.body":
    "Your swap is live at the top of the board. We'll let you know when someone proposes an exchange.",
  "barter.postStrip.success.postAnother": "Post another",
  "barter.postStrip.title": "Put something <em>on the table.</em>",
  "barter.postStrip.body":
    "Every exchange starts with a post. Tell the community what you can offer and what you're hoping for in return.",
  "barter.postStrip.offerPlaceholder":
    "I can offer — e.g. Portuguese lessons, logo design…",
  "barter.postStrip.wantPlaceholder":
    "I'm looking for — e.g. tax advice, moving help…",
  "barter.postStrip.submitCta": "Post to the exchange",
  "barter.postStrip.namePlaceholder": "You",
  "barter.postStrip.hoodPlaceholder": "Your post",
  "barter.postStrip.detailPlaceholder":
    "Posted just now — message to start the exchange.",
  "barter.postStrip.tagNew": "new",
  "barter.postStrip.tagYourPost": "your post",

  "barter.outro.title": "Skills are <em>the currency.</em>",
  "barter.outro.sub":
    "QueerPulse Barter is open to all members. The more you offer, the more you can ask for.",
  "barter.outro.cta": "Join the network",

  // ── BarterDetailPage (+ ProposeCard / QuestionModal) ────────────────────
  "barterDetail.back": "Skill exchange",
  "barterDetail.emptyLive.title": "This swap isn't live yet",
  "barterDetail.emptyLive.description":
    "The skill exchange starts empty at launch and fills with swaps members actually post. There's nothing to show at this link yet.",
  "barterDetail.emptyLive.cta": "Back to skill exchange",
  "barterDetail.sub.offering":
    "On offer to the community — swap it for something they need.",
  "barterDetail.sub.seeking":
    "Looking for this — and offering something in return.",
  "barterDetail.sub.both":
    "Offering one thing, looking for another. Propose a swap that works for you both.",
  "barterDetail.locationWithHood": "{hood} · Lisbon",
  "barterDetail.locationLisbon": "Lisbon",
  "barterDetail.repliesFast": "Usually replies fast",
  "barterDetail.messageCta": "Message {firstName}",
  "barterDetail.section.offering": "What they're <em>offering</em>",
  "barterDetail.section.lookingFor": "What they're <em>looking for</em>",
  "barterDetail.section.howItWorks": "How a <em>swap works</em>",

  "barterDetail.steps.propose.title": "Propose",
  "barterDetail.steps.propose.text":
    "Send a message saying what you'd trade and why the swap works for you.",
  "barterDetail.steps.agree.title": "Agree",
  "barterDetail.steps.agree.text":
    "You shape the swap together — scope, timing, format. No money changes hands.",
  "barterDetail.steps.exchange.title": "Exchange",
  "barterDetail.steps.exchange.text":
    "You each deliver. Meet up in Lisbon or go remote, whatever suits.",
  "barterDetail.steps.vouch.title": "Vouch",
  "barterDetail.steps.vouch.text":
    "Afterwards, leave a vouch so the next person knows it went well.",

  "barterDetail.sidebar.quickFacts": "Quick facts",
  "barterDetail.sidebar.type": "Type",
  "barterDetail.sidebar.category": "Category",
  "barterDetail.sidebar.posted": "Posted",
  "barterDetail.sidebar.area": "Area",
  "barterDetail.sidebar.tagged": "What it's tagged",

  "barterDetail.propose.title": "Propose a swap",
  "barterDetail.propose.lead": "No money — <em>just a trade.</em>",
  "barterDetail.propose.placeholder":
    "Tell {firstName} what you'd offer in return, and why this swap works for you.",
  "barterDetail.propose.sendCta": "Send proposal",
  "barterDetail.propose.askFirst": "Ask a question first",
  "barterDetail.propose.footNote":
    "Nothing is agreed until you both say yes. Swaps are between members — QueerPulse never takes a cut.",
  "barterDetail.propose.errorEmpty": "Add a line about what you'd trade.",
  "barterDetail.propose.toastSent": "Swap proposed to {name}.",

  "barterQuestion.eyebrow": "Before you propose",
  "barterQuestion.title": "Ask <em>{firstName}</em> a question.",
  "barterQuestion.sub":
    "Not ready to propose a swap yet? Ask what you need to know first — timing, what they're after, how it'd work. Friendly and low-pressure.",
  "barterQuestion.fieldLabel": "Your question *",
  "barterQuestion.placeholder":
    "Hi {firstName} — quick question before I propose a swap…",
  "barterQuestion.charsRemaining_one": "{count} more character to send.",
  "barterQuestion.charsRemaining_other": "{count} more characters to send.",
  "barterQuestion.keepOnPlatform":
    "Keep it on QueerPulse until you both agree to take it further.",
  "barterQuestion.cancel": "Cancel",
  "barterQuestion.sendCta": "Send question",
  "barterQuestion.sendingLabel": "Sending…",
  "barterQuestion.success.title": "Question",
  "barterQuestion.success.em": "sent.",
  "barterQuestion.success.closeLabel": "Done",
  "barterQuestion.success.body":
    "Your question is on its way to <strong>{name}</strong>. No swap is agreed until you both say yes — this is just a chat to see if it could work. You'll get a notification here when they reply.",

  // ── PostJobPage (gate + composer + steps + sidebar + preview + confirmation) ──
  // Scope note: option values chosen for category/commitment/seniority/format/
  // timezone/rate-per are kept as a stable canonical English `value` (used to
  // build the posted job's content fields and matched by needsCity/showsTimezone
  // regexes) — only the picker's displayed label is translated. Benefits,
  // inclusivity signals, contact methods, and skill suggestions become tags/
  // content on the posted listing itself (like a real job's tags) and are left
  // in English throughout, matching how job listing content stays English
  // elsewhere in this namespace.
  "postJob.gate.title": "Posting a role is for <em>verified employers</em>",
  "postJob.gate.sub":
    "To keep the job board trustworthy, only members affiliated with a company can post roles. Affiliate yours to continue — it takes a moment.",
  "postJob.gate.affiliateCta": "Affiliate your company",
  "postJob.gate.backCta": "Back to the board",
  "postJob.gate.point1":
    "We confirm employers are genuinely queer-inclusive, not rainbow-washing.",
  "postJob.gate.point2":
    "Roles post as your verified company, with its logo and badge.",
  "postJob.gate.point3":
    "No placement fees — this is a community board, not a marketplace.",

  "postJob.stepLabels.type": "Type & role",
  "postJob.stepLabels.details": "Details",
  "postJob.stepLabels.pay": "Pay & perks",
  "postJob.stepLabels.screening": "Screening",
  "postJob.stepLabels.review": "Review",
  "postJob.stepLabels.ariaLabel": "Job posting progress",

  "postJob.topbar.back": "Jobs & skills",
  "postJob.topbar.savedJustNow": "Saved just now",
  "postJob.topbar.autosaves": "Draft autosaves as you type",
  "postJob.nav.back": "Back",
  "postJob.nav.continue": "Continue",
  "postJob.nav.saveDraft": "Save draft",
  "postJob.nav.publish": "Publish listing",
  "postJob.nav.publishing": "Publishing…",
  "postJob.toast.saveDraft": "Draft saved to your company.",
  "postJob.toast.fillHighlighted": "Please fill the highlighted fields.",
  "postJob.toast.agreeRequired":
    "Add a title, description, and agree to the Code of Care.",
  "postJob.toast.notAuthorised":
    "You're not authorised to post for {company}. Switch to a company you're on the team of.",
  "postJob.toast.publishError":
    "We couldn't publish your listing. Please try again.",

  "postJob.field.optional": "optional",
  "postJob.field.category": "Category",
  "postJob.field.commitment": "Commitment",
  "postJob.field.experienceLevel": "Experience level",
  "postJob.field.format": "Format",
  "postJob.field.timezone": "Timezone",
  "postJob.field.location": "Location",
  "postJob.field.level": "Level",
  "postJob.field.where": "Where",
  "postJob.field.pay": "Pay",
  "postJob.field.starts": "Starts",
  "postJob.field.arrangement": "Arrangement",
  "postJob.field.title": "Title",
  "postJob.field.description": "Description",
  "postJob.field.perks": "Perks",
  "postJob.field.thisSpaceIs": "This space is",
  "postJob.field.skills": "Skills",
  "postJob.field.screening": "Screening",
  "postJob.field.postingAs": "Posting as",
  "postJob.field.respondVia": "Respond via",

  "postJob.option.category.legalAdmin": "Legal & admin",
  "postJob.option.category.designCreative": "Design & creative",
  "postJob.option.category.techEngineering": "Tech & engineering",
  "postJob.option.category.writingEditing": "Writing & editing",
  "postJob.option.category.translation": "Translation",
  "postJob.option.category.teachingTutoring": "Teaching & tutoring",
  "postJob.option.category.healthWellbeing": "Health & wellbeing",
  "postJob.option.category.practicalHelp": "Practical help",
  "postJob.option.category.other": "Other",

  "postJob.option.commitment.fullTime": "Full-time",
  "postJob.option.commitment.partTime": "Part-time",
  "postJob.option.commitment.contract": "Contract",
  "postJob.option.commitment.freelanceGig": "Freelance / gig",
  "postJob.option.commitment.volunteer": "Volunteer",
  "postJob.option.commitment.internship": "Internship",

  "postJob.option.seniority.anyLevel": "Any level",
  "postJob.option.seniority.entry": "Entry",
  "postJob.option.seniority.mid": "Mid",
  "postJob.option.seniority.senior": "Senior",
  "postJob.option.seniority.leadPrincipal": "Lead / Principal",

  "postJob.option.format.remote": "Remote",
  "postJob.option.format.inPersonLisbon": "In-person (Lisbon)",
  "postJob.option.format.hybrid": "Hybrid",
  "postJob.option.format.either": "Either",

  "postJob.option.timezone.noPreference": "No preference",
  "postJob.option.timezone.wetLisbon": "WET / Lisbon (UTC+0)",
  "postJob.option.timezone.cet": "CET (UTC+1)",
  "postJob.option.timezone.threeHoursOfLisbon": "±3h of Lisbon",
  "postJob.option.timezone.anyOverlap": "Any overlap",

  "postJob.option.ratePer.hour": "Hour",
  "postJob.option.ratePer.day": "Day",
  "postJob.option.ratePer.project": "Project",
  "postJob.option.ratePer.month": "Month",
  "postJob.option.ratePer.year": "Year",
  "postJob.option.ratePer.toDiscuss": "To discuss",

  "postJob.step1.eyebrow": "Step 1 of 5",
  "postJob.step1.title": "The <em>role</em>",
  "postJob.step1.sub":
    "How the work is structured. These become the main filters members search the board by.",
  "postJob.step1.arrangementTitle": "Arrangement",
  "postJob.step1.arrangementSub":
    "The shape of the role — pick the closest fit.",
  "postJob.step1.locationPlaceholder":
    "e.g. Arroios, Lisbon — or a neighbourhood / district",
  "postJob.step1.locationError": "Add where this is based.",

  "postJob.step2.eyebrow": "Step 2 of 5",
  "postJob.step2.title": "The <em>details</em>",
  "postJob.step2.sub":
    "A clear title and an honest description get far more useful responses.",
  "postJob.step2.titlePlaceholder":
    'e.g. "Junior graphic designer, editorial focus"',
  "postJob.step2.titleError": "Give your listing a title.",
  "postJob.step2.titleCounter": "{used}/{max}",
  "postJob.step2.lookingForLabel": "What you're looking for",
  "postJob.step2.descriptionPlaceholder":
    "Describe the work, who it's for, and what success looks like — write as you'd explain it to a member at an event.",
  "postJob.step2.descriptionError": "Add a description.",
  "postJob.step2.charsCount_one": "{count} char",
  "postJob.step2.charsCount_other": "{count} chars",
  "postJob.step2.timelineTitle": "Timeline",
  "postJob.step2.applyBy": "Apply by",
  "postJob.step2.startDate": "Start date",
  "postJob.step2.startDatePlaceholder": "e.g. ASAP, June, flexible",

  "postJob.step3.eyebrow": "Step 3 of 5",
  "postJob.step3.title": "Pay <em>& perks</em>",
  "postJob.step3.sub": "Transparency is a community value here — and it works.",
  "postJob.step3.rateTitle": "Rate",
  "postJob.step3.currency": "Currency",
  "postJob.step3.min": "Min",
  "postJob.step3.max": "Max",
  "postJob.step3.optAbbrev": "opt.",
  "postJob.step3.per": "Per",
  "postJob.step3.hidePay.name": "Hide exact figures",
  "postJob.step3.hidePay.desc":
    'Show "Competitive" instead of a number. Still worth sharing a range in the description.',
  "postJob.step3.barter.name": "Open to skills exchange or barter",
  "postJob.step3.barter.desc":
    "Trade skills instead of (or alongside) money — a first-class option on QueerPulse.",
  "postJob.step3.nudge":
    "<strong>Listings with a rate get ~2× more responses.</strong> Members appreciate not having to ask.",
  "postJob.step3.benefitsTitle": "Benefits & perks",
  "postJob.step3.benefitsSub":
    "Pick anything that applies. These show as tags on your listing.",

  "postJob.step4.eyebrow": "Step 4 of 5",
  "postJob.step4.title": "Skills, <em>screening</em> & who's posting",
  "postJob.step4.sub":
    "This is where QueerPulse listings do more than a generic job board.",
  "postJob.step4.screeningTitle": "Screening questions",
  "postJob.step4.screeningSub":
    "Ask up to 3 questions respondents must answer. Great for filtering quickly.",
  "postJob.step4.questionPlaceholder": "e.g. Are you based in Portugal?",
  "postJob.step4.removeQuestionAria": "Remove question",
  "postJob.step4.addQuestion": "Add a question",
  "postJob.step4.spaceIsTitle": "This space is…",
  "postJob.step4.spaceIsSub":
    "Optional signals that tell members what to expect. Only tick what's genuinely true.",
  "postJob.step4.whosPostingTitle": "Who's posting",
  "postJob.step4.whosPostingSub":
    "Roles are posted as your verified company — this is what keeps the board trustworthy.",
  "postJob.step4.verifiedEmployerAria": "Verified employer",
  "postJob.step4.notYou": "Not you?",

  "postJob.skills.title": "Skills",
  "postJob.skills.sub":
    "Add from the shared list so members can match & filter — free text works too.",
  "postJob.skills.placeholder": "Start typing a skill…",
  "postJob.skills.addCta": "Add",
  "postJob.skills.removeAria": "Remove {skill}",
  "postJob.skills.popular": "Popular in this community",

  "postJob.step5.eyebrow": "Step 5 of 5",
  "postJob.step5.title": "Respond & <em>review</em>",
  "postJob.step5.sub":
    "Choose how people reach you, then give it one last look.",
  "postJob.step5.respondTitle": "How to respond",
  "postJob.step5.respondSub":
    "Pick one or more. Selected methods reveal their own field.",
  "postJob.step5.emailLabel": "Email address",
  "postJob.step5.emailPlaceholder": "you@example.com",
  "postJob.step5.linkLabel": "External link",
  "postJob.step5.linkPlaceholder": "https://…",
  "postJob.step5.summaryTitle": "Summary",
  "postJob.step5.dash": "—",
  "postJob.step5.notSpecified": "Not specified",
  "postJob.step5.questionCount_one": "{count} question",
  "postJob.step5.questionCount_other": "{count} questions",
  "postJob.step5.editCta": "Edit",
  "postJob.step5.agreement":
    "I confirm this listing follows the <link>Code of Care</link> — no discrimination on identity, and pay that's fair. <strong>QueerPulse is a solidarity space, not an exploitation channel.</strong>",

  "postJob.sidebar.livePreview": "Live preview",
  "postJob.sidebar.fullView": "Full view",
  "postJob.sidebar.hiring": "Hiring",
  "postJob.sidebar.titlePlaceholder": "Your title will appear here",
  "postJob.sidebar.descPlaceholder": "Add a description…",
  "postJob.sidebar.viewFullCta": "See full listing",
  "postJob.sidebar.howThisWorks": "How this works",
  "postJob.sidebar.point1":
    "Listings are <strong>visible to members</strong>, never public.",
  "postJob.sidebar.point2":
    "Listings <strong>expire after 60 days</strong> — reminder at 45.",
  "postJob.sidebar.point3":
    "<strong>No placement fees.</strong> A community board, not a marketplace.",
  "postJob.sidebar.point4":
    "<strong>Edit or close</strong> any time from your company profile.",

  "postJob.preview.ariaLabel": "Listing preview",
  "postJob.preview.untitled": "Untitled listing",
  "postJob.preview.verifiedEmployer": "verified employer",
  "postJob.preview.aboutRole": "About this role",
  "postJob.preview.noDescription": "No description yet.",
  "postJob.preview.inclusivityTitle": "This space is",
  "postJob.preview.youllBeAsked": "You'll be asked",
  "postJob.preview.respondViaLabel": "Respond via",
  "postJob.preview.respondCta": "Respond",

  "postJob.confirm.title": "“{title}” is <em>live</em>",
  "postJob.confirm.sub":
    "Members can see it now. We'll notify you the moment someone responds, and nudge you before it expires in 60 days.",
  "postJob.confirm.viewListing": "View listing",
  "postJob.confirm.postAnother": "Post another",
  "postJob.confirm.performance.title": "Performance",
  "postJob.confirm.performance.body":
    "Track views, saves, and responses over the life of your listing.",
  "postJob.confirm.performance.views": "Views",
  "postJob.confirm.performance.saves": "Saves",
  "postJob.confirm.performance.replies": "Replies",
  "postJob.confirm.responses.title": "Responses",
  "postJob.confirm.responses.body":
    "Replies land in one place — review, message, or mark as filled from your listing manager.",
  "postJob.confirm.responses.openManager": "Open listing manager",
  "postJob.confirm.share.title": "Share it",
  "postJob.confirm.share.body": "Boost reach inside the community.",
  "postJob.confirm.share.postToFeed": "Post to Feed",
  "postJob.confirm.share.copyLink": "Copy link",
  "postJob.confirm.share.toastFeed": "Shared to your feed",
  "postJob.confirm.share.toastLink": "Link copied",
  "postJob.confirm.whatsNext.title": "What's next",
  "postJob.confirm.whatsNext.body":
    "Your role now shows on the board and on your company profile. New listings carry a “not yet reviewed” note until the community vets them.",

  // ── MentorshipPage (+ match modal/steps) ────────────────────────────────
  // Scope note: individual mentor profiles in mentorship.data.ts (bio, quote,
  // process steps, side rows) and the whole standalone mentorProfile.data.tsx
  // spotlight (a single content-rich profile) are mock member content — left
  // in English throughout, like other member profiles in this namespace. Only
  // page chrome (headings, CTAs, the match-request wizard, validation, toasts)
  // is translated below.
  "mentorship.hero.eyebrow": "Mentorship",
  "mentorship.hero.title":
    "Someone ahead of you on the path <em>wants to help.</em>",
  "mentorship.hero.lead":
    "Formal one-to-one mentorship matching between queer professionals in Lisbon. If you're finding it hard, someone in the network has been there. If you've made it through, you can give that back.",
  "mentorship.stat.activeMentors": "Active mentors in the network",
  "mentorship.stat.matchesMade": "Matches made so far",
  "mentorship.stat.areasOfFocus": "Areas of focus",

  "mentorship.choose.title": "What brings you <em>here?</em>",
  "mentorship.choose.mentee.title": "I'm looking for a mentor",
  "mentorship.choose.mentee.desc":
    "You're navigating something — a career transition, a creative block, coming out professionally, a difficult workplace, a new city. You'd benefit from talking to someone who's been through it.",
  "mentorship.choose.mentee.for":
    "For: anyone at any stage who could use some guidance",
  "mentorship.choose.mentor.title": "I can be a mentor",
  "mentorship.choose.mentor.desc":
    "You've been through enough to have something to offer. You don't need to be an expert — you just need to have navigated something that someone else is currently navigating.",
  "mentorship.choose.mentor.for":
    "For: members with experience they're willing to share",

  "mentorship.emptyLive.title": "Mentor directory coming soon",
  "mentorship.emptyLive.description":
    "We're still building out the mentor network. Check back soon to browse and connect with community mentors.",
  "mentorship.strip.title": "Current mentors in <em>the network</em>",
  "mentorship.strip.sub":
    "These members have opened themselves up to mentoring. You can request a match through the form above.",

  "mentorship.outro.title": "Have something <em>to give?</em>",
  "mentorship.outro.sub":
    "Mentorship is one way. Browse volunteer opportunities to find other ways to contribute to the community around you.",
  "mentorship.outro.cta": "See volunteer roles",

  "mentorship.matchArea.careerDirection": "Career direction",
  "mentorship.matchArea.comingOutProfessionally": "Coming out professionally",
  "mentorship.matchArea.creativePractice": "Creative practice",
  "mentorship.matchArea.startingBusiness": "Starting a business",
  "mentorship.matchArea.difficultWorkplace": "Navigating a difficult workplace",
  "mentorship.matchArea.newToLisbon": "New to Lisbon",
  "mentorship.matchArea.settlingInLisbon": "Settling in Lisbon",
  "mentorship.matchArea.mentalHealthAtWork": "Mental health at work",
  "mentorship.matchArea.legalRightsIssues": "Legal or rights issues",
  "mentorship.matchArea.legalRightsNavigation": "Legal or rights navigation",

  "mentorship.match.findMentorAria": "Find a mentor",
  "mentorship.match.becomeMentorAria": "Become a mentor",
  "mentorship.match.closeAria": "Close",
  "mentorship.match.done": "Done!",
  "mentorship.match.stepOf": "Step {step} of {total}",

  "mentorship.match.success.mentee.title": "Request received.",
  "mentorship.match.success.mentor.title": "Thank you.",
  "mentorship.match.success.mentee.body":
    "We'll review your request and send you a match suggestion within 2 weeks. The introduction will come by email.",
  "mentorship.match.success.mentor.body":
    "We'll add you to the mentor pool and reach out when we have a good match for you. It means a lot.",
  "mentorship.match.success.done": "Done",

  "mentorship.mentee.step1.eyebrow": "Finding you a mentor",
  "mentorship.mentee.step1.title": "What do you need help with?",
  "mentorship.mentee.step1.sub":
    "Pick the areas where you'd most benefit from guidance. We'll match you with someone who has direct experience there.",
  "mentorship.mentee.step2.eyebrow": "About you",
  "mentorship.mentee.step2.title": "What should your mentor know?",
  "mentorship.mentee.step2.namePlaceholder": "Your name",
  "mentorship.mentee.step2.rolePlaceholder": "Your role or practice",
  "mentorship.mentee.step2.frequencyPlaceholder":
    "How often would you like to meet?",
  "mentorship.mentee.step2.frequency.monthly": "Once a month",
  "mentorship.mentee.step2.frequency.twiceMonthly": "Twice a month",
  "mentorship.mentee.step2.frequency.asNeeded": "As needed",
  "mentorship.mentee.step2.notePlaceholder":
    "A sentence about what's going on and what kind of support would help…",
  "mentorship.mentee.step3.eyebrow": "Almost done",
  "mentorship.mentee.step3.title": "How do we reach you?",
  "mentorship.mentee.step3.emailPlaceholder": "Your email address",
  "mentorship.mentee.step3.sub":
    "We'll review your request and suggest a match within 2 weeks. You'll get an email introduction and can take it from there.",
  "mentorship.mentee.toastSubmitted": "Match request received",

  "mentorship.mentor.step1.eyebrow": "Becoming a mentor",
  "mentorship.mentor.step1.title": "What can you offer?",
  "mentorship.mentor.step1.sub":
    "You don't need to be an expert. You need to have navigated something that someone else is currently navigating.",
  "mentorship.mentor.step2.eyebrow": "Your capacity",
  "mentorship.mentor.step2.title": "How much time can you give?",
  "mentorship.mentor.step2.namePlaceholder": "Your name and role",
  "mentorship.mentor.step2.menteesPlaceholder": "How many mentees per quarter?",
  "mentorship.mentor.step2.mentees.one": "1 mentee",
  "mentorship.mentor.step2.mentees.two": "2 mentees",
  "mentorship.mentor.step2.mentees.three": "3 mentees",
  "mentorship.mentor.step2.formatPlaceholder": "Preferred meeting format",
  "mentorship.mentor.step2.format.inPersonLisbon": "In-person in Lisbon",
  "mentorship.mentor.step2.format.video": "Video call",
  "mentorship.mentor.step2.format.either": "Either works",
  "mentorship.mentor.step2.emailPlaceholder": "Your email address",
  "mentorship.mentor.toastSubmitted": "Added to the mentor pool",

  "mentorship.nav.continue": "Continue",
  "mentorship.nav.back": "Back",
  "mentorship.nav.submit": "Submit",
  "mentorship.cta.requestMatch": "Request a match",
  "mentorship.cta.joinWaitlist": "Join waitlist",

  // ── MentorDetailPage (+ header / sections / sidebar / cycle nav) ───────
  "mentorDetail.backToAll": "All mentors",
  "mentorDetail.emptyLive.title": "This mentor profile is coming soon",
  "mentorDetail.emptyLive.description":
    "The mentor directory isn't live yet. Head back to explore mentorship when it opens.",
  "mentorDetail.emptyLive.cta": "Back to mentorship",
  "mentorDetail.messageCta": "Message {firstName}",
  "mentorDetail.cyclePrevious": "Previous",
  "mentorDetail.cycleNext": "Next",
  "mentorDetail.cyclePosition": "{position} of {total}",
  "mentorDetail.section.howTheyMentor": "How {firstName} <em>mentors</em>",
  "mentorDetail.section.fitFor": "Who you'd <em>be a fit for</em>",
  "mentorDetail.fit.benefitIf": "You'd benefit if…",
  "mentorDetail.fit.andIdeally": "And ideally…",
  "mentorDetail.fit.andMaybe": "And maybe…",
  "mentorDetail.fit.notRightCall": "Not the right call if…",
  "mentorDetail.section.process": "The <em>process</em>, step by step",
  "mentorDetail.sidebar.workWith": "Work with {firstName}",
  "mentorDetail.sidebar.noUpfrontCost":
    "No upfront cost. Mentorship here is member-to-member — you can always ask a question before committing.",
  "mentorDetail.sidebar.notSureYet": "Not sure yet?",
  "mentorDetail.sidebar.askQuestion": "Message {firstName} a question",
  "mentorDetail.sidebar.browseAll": "Browse all mentors",

  // ── ApplicationStatusPage (+ header/list/card, listing-manager modals) ──
  // Scope note: application content in applicationStatus.data.tsx /
  // .patches.tsx (job titles, company names, stage hints, status blurbs,
  // thread messages, offers, notes) is this member's own tracked-application
  // history — in live mode fetched from the API — left in English. Only
  // reusable page/modal chrome is translated below. Negotiation "angle" draft
  // text is left English too (flagged in the sweep report — persuasive
  // composed copy too nuanced to sweep safely); the lever/principle labels and
  // angle names/blurbs around it, which are generic and reusable, are
  // translated.
  "applicationStatus.header.eyebrow": "Your jobs",
  "applicationStatus.header.title": "Where everything <em>stands.</em>",
  "applicationStatus.header.sub":
    "Track every application, see how long companies have sat on yours, and know when to follow up.",
  "applicationStatus.header.counterSent": "/ {count} sent",
  "applicationStatus.header.activeLabel": "Active applications",

  "applicationStatus.tab.all": "All",
  "applicationStatus.tab.active": "Active",
  "applicationStatus.tab.offer": "Offers",
  "applicationStatus.tab.closed": "Closed",
  "applicationStatus.tab.draft": "Drafts",

  "applicationStatus.legend.key": "Tracker key",
  "applicationStatus.legend.done": "Done — this step is complete",
  "applicationStatus.legend.active": "You are here — current step",
  "applicationStatus.legend.upcoming": "Upcoming — not started yet",
  "applicationStatus.legend.closed": "Closed — ended or withdrawn",

  "applicationStatus.group.offers.title": "Offers — your decision",
  "applicationStatus.group.inProgress.title": "In progress",
  "applicationStatus.group.drafts.title": "Drafts",
  "applicationStatus.group.drafts.hint":
    "Unfinished — wrap these up before they close.",
  "applicationStatus.group.closedWithdrawn.title": "Closed & withdrawn",
  "applicationStatus.group.closedWithdrawn.hint":
    "No action needed — kept for your records.",
  "applicationStatus.compareOffersCta": "Compare offers",

  "applicationStatus.empty.title": "No applications yet",
  "applicationStatus.empty.description":
    "When you apply to a job, grant, or opportunity, you'll be able to track every one — and compare offers side by side — right here.",
  "applicationStatus.empty.browseCta": "Browse jobs",

  "applicationStatus.error.title": "We couldn't load your applications",
  "applicationStatus.error.description":
    "Something went wrong fetching your applications. Give it a moment and try again — nothing you've sent is lost.",

  // Live-mode tracker chrome — the applied-on subtitle, the status-derived
  // stages, status lines, and badges the API-backed cards render (the rich
  // recruiter/interview/offer fiction is demo-only).
  "applicationStatus.live.appliedOn": "Applied {date}",
  "applicationStatus.live.action.viewSubmission": "View submission",
  "applicationStatus.live.stage.submitted": "Submitted",
  "applicationStatus.live.stage.review": "In review",
  "applicationStatus.live.stage.decision": "Decision",
  "applicationStatus.live.stage.offer": "Offer",
  "applicationStatus.live.stage.declined": "Not this time",
  "applicationStatus.live.status.submitted":
    "Sent to the company — you'll see updates here as they respond.",
  "applicationStatus.live.status.reviewing":
    "The company is reading your application now.",
  "applicationStatus.live.status.accepted":
    "Great news — your application was accepted.",
  "applicationStatus.live.status.declined":
    "This one didn't work out. Kept here for your records.",
  "applicationStatus.live.badge.submitted": "Just sent",
  "applicationStatus.live.badge.reviewing": "In review",
  "applicationStatus.live.badge.accepted": "Accepted",
  "applicationStatus.live.badge.declined": "Closed",

  "applicationStatus.card.stepOf": "Step {step} of {total}",
  "applicationStatus.card.whatThisMeans": "What this means",

  "applicationStatus.close": "Close",
  "applicationStatus.submission.eyebrow": "Your submission",
  "applicationStatus.submission.attachments": "Attachments",
  "applicationStatus.company.eyebrow": "The company",
  "applicationStatus.company.statPeople": "People",
  "applicationStatus.company.statVerified": "Verified by members",
  "applicationStatus.company.statWeekPilot": "Week pilot",
  "applicationStatus.company.sector": "Sector",
  "applicationStatus.company.based": "Based",
  "applicationStatus.company.viewDirectory": "View in directory",
  "applicationStatus.note.from": "A note from {company}",

  "msg.message.title": "Message the",
  "msg.message.em": "recruiter.",
  "msg.message.sub":
    "Goes straight to their inbox — no read receipts, no algorithm in between.",
  "msg.followup.title": "Send a",
  "msg.followup.em": "follow-up.",
  "msg.followup.sub":
    "A gentle nudge. We've drafted something warm — edit it however you like.",
  "msg.followup.preset":
    "Hi — just a friendly note to check in on my application. I'm still very keen on the role and happy to share anything else that would help. No rush at all, and thank you for your time.",
  "msg.conversation.title": "Open the",
  "msg.conversation.em": "conversation.",
  "msg.conversation.sub": "Pick up the thread with them directly.",
  "msg.recipientHiringTeam": "Hiring team",
  "msg.historyWith":
    "The full history with {firstName} — every message and milestone, in order.",
  "msg.you": "You",
  "msg.yourReply": "Your reply",
  "msg.replyPlaceholder": "Write a reply…",
  "msg.sendingLabel": "Sending…",
  "msg.sendCta": "Send",
  "msg.yourMessageLabel": "Your message",
  "msg.messagePlaceholder": "Write naturally.",
  "msg.cancel": "Cancel",
  "msg.success.title": "Message",
  "msg.success.em": "sent.",
  "msg.success.body":
    "Your message to {firstName} is on its way. They'll reply straight to your inbox.",

  "calendar.eyebrow": "Interview",
  "calendar.close": "Close",
  "calendar.icsLabel": ".ics file",
  "calendar.googleLabel": "Google Calendar",
  "calendar.addingLabel": "Adding…",
  "calendar.success.title": "Saved to your",
  "calendar.success.em": "calendar.",
  "calendar.success.google":
    "We've opened Google Calendar — just hit save. We'll also remind you the morning of.",
  "calendar.success.ics":
    "The invite (.ics) has downloaded — open it to add the event. We'll also remind you the morning of.",
  "calendar.when": "When",
  "calendar.where": "Where",
  "calendar.with": "With",

  "withdraw.eyebrow": "Withdraw",
  "withdraw.title": "Step back from <em>{company}?</em>",
  "withdraw.sub":
    "This removes you from consideration for <b>{title}</b>. We'll send a brief, polite note on your behalf — you don't have to write anything.",
  "withdraw.reasonLabel": "Reason (only you see this)",
  "withdraw.reasonPlaceholder": "Pick a reason, or leave it open",
  "withdraw.cantUndo": "This can't be undone — you'd need to re-apply.",
  "withdraw.keepIt": "Keep it",
  "withdraw.sendingLabel": "Withdrawing…",
  "withdraw.submitCta": "Withdraw application",
  "withdraw.success.title": "Application",
  "withdraw.success.em": "withdrawn.",
  "withdraw.success.body":
    "We've let {company} know politely. This role has moved to your Closed tab.",
  "withdrawReason.acceptedAnother": "Accepted another role",
  "withdrawReason.noLongerFit": "No longer a fit",
  "withdrawReason.payDidntWork": "Pay or terms didn't work",
  "withdrawReason.tookTooLong": "Process took too long",
  "withdrawReason.preferNotToSay": "Prefer not to say",

  "negotiate.eyebrow": "Offer negotiation",
  "negotiate.title": "Ask for what it's <em>worth.</em>",
  "negotiate.sub":
    "Negotiating is expected — most offers have room. Here's your leverage, your levers, and five ways to make the ask.",
  "negotiate.onTheTable": "On the table",
  "negotiate.holiday": "Holiday",
  "negotiate.whatMattersMost": "What matters most to you",
  "negotiate.pickAngle": "Pick your angle",
  "negotiate.draftLabel": "Your draft reply — edit it to sound like you",
  "negotiate.copyDraft": "Copy draft",
  "negotiate.copiedToast": "Draft copied to clipboard",
  "negotiate.sendingLabel": "Sending…",
  "negotiate.sendCta": "Send reply",
  "negotiate.success.title": "Counter",
  "negotiate.success.em": "sent.",
  "negotiate.success.body":
    "Your reply is on its way to {company}. Asking is normal and expected — you've done this exactly right.",
  "lever.baseSalary": "Base salary",
  "lever.holidayDays": "Holiday days",
  "lever.remoteDays": "Remote days",
  "lever.learningBudget": "Learning budget",
  "lever.startDate": "Start date",
  "lever.titleScope": "Title & scope",
  "principle.anchor": "Anchor on the value you bring, never on what you need.",
  "principle.nameNumber":
    "Name one clear number, then go quiet — let them respond.",
  "principle.trade":
    "If base won't move, trade: days, budget, title, flexibility.",
  "principle.stayWarm": "Stay warm. This is a relationship, not a transaction.",
  "negotiate.angle.collaborative.name": "The collaborative ask",
  "negotiate.angle.collaborative.blurb":
    "Warm, partnership-first. Best when you already click with them.",
  "negotiate.angle.market.name": "The market case",
  "negotiate.angle.market.blurb":
    "Data-led and confident. Best with the benchmarks on your side.",
  "negotiate.angle.bundle.name": "The bundle",
  "negotiate.angle.bundle.blurb":
    "Trade across levers. Best when the salary ceiling is firm.",
  "negotiate.angle.enthusiastic.name": "Lead with a yes",
  "negotiate.angle.enthusiastic.blurb":
    "Excitement first, number second. Disarming and effective.",
  "negotiate.angle.time.name": "Ask for time",
  "negotiate.angle.time.blurb":
    "Buy space to decide — calmly, without pressure.",

  "offer.respondByEyebrow": "Your offer · respond by {date}",
  "offer.saidYes": "{company} <em>said yes.</em>",
  "offer.sub": "Here's everything on the table. Take your time — then choose.",
  "offer.salary": "Salary",
  "offer.holiday": "Holiday",
  "offer.start": "Start",
  "offer.declinePolitely": "Decline politely",
  "offer.decliningLabel": "Declining…",
  "offer.acceptCta": "Accept offer",
  "offer.acceptingLabel": "Accepting…",
  "offer.success.title": "Offer",
  "offer.success.emAccepted": "accepted.",
  "offer.success.emDeclined": "declined.",
  "offer.undo.changedMind": "Changed your mind? You can undo for {seconds}s.",
  "offer.undo.button": "Undo",
  "offer.undo.confirmed": "This is now confirmed.",
  "offer.success.acceptedBody":
    "Congratulations — {company} will send your contract within two working days.",
  "offer.success.declinedBody":
    "We've thanked {company} warmly on your behalf. The door stays open for the future.",

  "resume.eyebrowPrefix": "Resume draft · {deadline}",
  "resume.title": "Finish your <em>application.</em>",
  "resume.progress_one": "{percent}% done · {count} thing left",
  "resume.progress_other": "{percent}% done · {count} things left",
  "resume.coverLetterLabel": "Cover letter",
  "resume.coverLetterPlaceholder": "A few honest lines on why this role.",
  "resume.availabilityLabel": "Availability",
  "resume.availabilityPlaceholder": "e.g. Two weeks' notice",
  "resume.saveClose": "Save & close",
  "resume.submittingLabel": "Submitting…",
  "resume.submitCta": "Submit application",
  "resume.success.title": "Application",
  "resume.success.em": "sent.",
  "resume.success.body":
    "Nicely done — your application to {company} is in. It's now in your Active tab.",

  "compare.eyebrow": "Your offers",
  "compare.title": "Two offers, <em>side by side.</em>",
  "compare.sub":
    "A calm view of what's on the table. Compare the numbers, then respond when you're ready.",
  "compare.whatsIncluded": "What's included",
  "compare.respondCta": "Respond",
  "compare.close": "Close",
  "compareRow.salary": "Salary",
  "compareRow.holiday": "Holiday",
  "compareRow.startDate": "Start date",
  "compareRow.respondBy": "Respond by",
  "compareRow.howItPays": "How it pays",

  // ── WorkshopsSection / WorkshopPage (+ sidebar / reserve / add modals) ──
  // Scope note: individual workshop content in workshops.data.ts /
  // addWorkshop.build.ts (title, blurb, sessions, needs, tutor, location,
  // tier labels, mode/category values) is member-authored course content —
  // in live mode fetched — left in English throughout. Only page/modal chrome
  // is translated. The Category/Format pickers in AddWorkshopModal feed
  // directly into that same stored content (like the pre-seeded workshops'
  // own English mode/category values), so their option lists are left
  // untranslated too, for consistency with the content they produce.
  // "New" is now derived from `createdAt` (the backend stores no `added` flag),
  // so it marks anyone's recent listing — not only the viewer's own.
  "workshopsSection.newBadge": "New",
  "workshopsSection.loadMoreCta": "Load more workshops",
  "workshopsSection.loadingMore": "Loading…",
  "workshopsSection.withTutor": "with <b>{name}</b>",
  "workshopsSection.seatsLeft_one": "<b>{count}</b> seat left",
  "workshopsSection.seatsLeft_other": "<b>{count}</b> seats left",
  "workshopsSection.cohortFull": "Cohort full",
  "workshopsSection.viewCta": "View workshop",
  "workshopsSection.heading": "Advanced <em>workshops</em>",
  "workshopsSection.blurb":
    "Structured, multi-week courses led by members who go deep on one craft. Small cohorts, sliding-scale pricing, and you make something real by the end. Running a course yourself? List it here.",
  "workshopsSection.listCta": "List a workshop",

  "workshopPage.notFound.title": "Workshop not found",
  "workshopPage.notFound.description":
    "This workshop may have wrapped up or been taken down. Browse what's running now over on Skills & learning.",
  "workshopPage.notFound.backCta": "Back to Skills",
  "workshopPage.backToSkills": "Skills & learning",
  "workshopPage.footerBackCta": "All workshops & skills",
  "workshopPage.newBadge": "New",

  "workshopSections.about.title": "What you'll <em>actually do</em>",
  "workshopSections.sessions.title_one": "The <em>{count} session</em>",
  "workshopSections.sessions.title_other": "The <em>{count} sessions</em>",
  "workshopSections.needs.title": "What's <em>included</em>, what to bring",
  "workshopSections.pastWork.title": "What previous folks <em>made</em>",
  "workshopSections.pastWork.intro": "A few pieces from the last cohort:",

  "workshopSidebar.reserveTitle": "Reserve a seat",
  "workshopSidebar.spotsFilled": "Spots filled",
  "workshopSidebar.startDate": "Start date",
  "workshopSidebar.cancellation": "Cancellation",
  "workshopSidebar.cohortFull": "Cohort is full",
  "workshopSidebar.reserveCta": "Reserve a spot",
  "workshopSidebar.askQuestion": "Ask a question",
  "workshopSidebar.askQuestionToast":
    "We'll pass your question to {firstName}.",
  "workshopSidebar.footNote":
    "Solidarity rate · just say so on the form, no proof of anything. No one sees which rate you picked.",
  "workshopSidebar.taughtBy": "Taught by",
  "workshopSidebar.where": "Where",

  // ── WorkshopRsvpControl (reserving a spot, for real) ───────────────────────
  // Nothing here promises a message, an email, or a payment link — none of
  // those exist. Reserving holds a spot and that is all it claims to do.
  "workshopRsvp.reserveCta": "Reserve a spot",
  "workshopRsvp.joinWaitlistCta": "Join the waitlist",
  "workshopRsvp.savingLabel": "One moment…",
  "workshopRsvp.holdingTitle": "Your spot is held.",
  "workshopRsvp.holdingNote":
    "Nothing else to do for now — just turn up. You can give the spot back any time if plans change.",
  "workshopRsvp.releaseCta": "Give up your spot",
  "workshopRsvp.waitlistTitle": "You're on the waitlist.",
  "workshopRsvp.waitlistNote":
    "If someone gives a spot back, the queue moves and yours could be next. Check back here — there's no message we can send you yet.",
  "workshopRsvp.leaveWaitlistCta": "Leave the waitlist",
  "workshopRsvp.failedNote":
    "That didn't go through — nothing changed. Try again in a moment.",
  // Host view: the count, in place of a control they can't use. Zero gets its
  // own line — English has no CLDR "zero" category, so "0 people have spots"
  // is what the plural rules would otherwise produce.
  "workshopRsvp.hostCountNone": "No one has booked a spot yet.",
  "workshopRsvp.hostCount_one": "One person has a spot.",
  "workshopRsvp.hostCount_other": "{count} people have spots.",
  "workshopRsvp.hostNote":
    "Only you can see this. Anyone who books after the cohort fills goes on the waitlist, and moves up on their own if a spot frees.",

  "workshopReserve.ariaLabel": "Reserve a spot in {title}",
  "workshopReserve.success.title": "Seat",
  "workshopReserve.success.em": "held.",
  "workshopReserve.success.closeLabel": "Done",
  "workshopReserve.success.body":
    "Your spot in <strong>{title}</strong> is held for 48 hours. We've emailed {firstName} a payment link at the <strong>{amount}</strong> rate — pay whenever you're ready, no rush. See you {date}.",
  "workshopReserve.title": "Reserve a spot in <em>{title}</em>",
  "workshopReserve.sub":
    "{seatsLeft} of {seatsTotal} seats left. Reserving holds your place — no payment yet.",
  "workshopReserve.nameLabel": "Your name *",
  "workshopReserve.namePlaceholder": "What should we call you?",
  "workshopReserve.emailLabel": "Email *",
  "workshopReserve.emailPlaceholder": "Where we send the payment link",
  "workshopReserve.tierLabel": "What you'll pay *",
  "workshopReserve.noteLabel": "Anything the tutor should know",
  "workshopReserve.notePlaceholder":
    "Access needs, experience level, a question…",
  "workshopReserve.slidingNote":
    "Pick whichever rate is right for you. No proof, no questions — the sliding scale is how this stays open to everyone.",
  "workshopReserve.cancel": "Cancel",
  "workshopReserve.holdingLabel": "Holding…",
  "workshopReserve.submitCta": "Hold my spot",

  "addWorkshop.ariaLabel": "List a workshop",
  "addWorkshop.eyebrow": "Skills & learning",
  "addWorkshop.title": "List an <em>advanced workshop.</em>",
  "addWorkshop.sub":
    "Share a multi-week course you're running. Keep it honest about the level and the pace — people are trusting you with real time.",
  "addWorkshop.titleLabel": "Workshop title *",
  "addWorkshop.titlePlaceholder":
    "e.g. Letterpress, from setting type to a printed page",
  "addWorkshop.blurbLabel": "One-line summary *",
  "addWorkshop.blurbPlaceholder":
    "Who it's for and what they'll walk away with",
  "addWorkshop.aboutLabel": "What you'll actually do *",
  "addWorkshop.aboutPlaceholder":
    "The shape of the sessions, the level assumed, what people make. One idea per line.",
  "addWorkshop.categoryLabel": "Category *",
  "addWorkshop.formatLabel": "Format *",
  "addWorkshop.weeksLabel": "Length (weeks) *",
  "addWorkshop.sizeLabel": "Cohort size *",
  "addWorkshop.priceLabel": "Standard price (€) *",
  "addWorkshop.venueLabel": "Where (venue · neighbourhood)",
  "addWorkshop.venuePlaceholder": "e.g. Estúdio Graça · Graça",
  "addWorkshop.note":
    "We'll set up a reduced and a solidarity rate automatically from your standard price — you can tune them later. Sessions start empty; add the week-by-week plan from your workshop page.",
  "addWorkshop.failedNote":
    "We couldn't publish that just now — nothing was listed. Your details are still here, so try again in a moment.",
  "addWorkshop.cancel": "Cancel",
  "addWorkshop.publishingLabel": "Publishing…",
  "addWorkshop.publishCta": "Publish workshop",
  "addWorkshop.listed.title": "Workshop",
  "addWorkshop.listed.em": "listed.",
  "addWorkshop.listed.closeLabel": "Done",
  "addWorkshop.listed.viewCta": "View your workshop",
  "addWorkshop.listed.body":
    "<strong>{title}</strong> is live on Skills & learning. Members can browse it, read the plan, and reserve a seat. Edit the details or add sessions any time from your workshop page.",

  // ── Editing a workshop you host (same form, different framing) ──────────
  "editWorkshop.ariaLabel": "Edit your workshop",
  "editWorkshop.eyebrow": "Your workshop",
  "editWorkshop.title": "Edit your <em>workshop.</em>",
  "editWorkshop.sub":
    "Change anything that's moved on. People who've already reserved keep their spot — only the details on this page change.",
  "editWorkshop.note":
    "Your reduced and solidarity rates follow the standard price. The week-by-week plan and the spots already taken stay as they are.",
  "editWorkshop.failedNote":
    "We couldn't save that just now — nothing changed. Your edits are still here, so try again in a moment.",
  "editWorkshop.savingLabel": "Saving…",
  "editWorkshop.saveCta": "Save changes",
  "editWorkshop.saved.title": "Changes",
  "editWorkshop.saved.em": "saved.",
  "editWorkshop.saved.body":
    "<strong>{title}</strong> is updated on Skills & learning. Anyone opening it from here on sees the new details.",

  // ── Deleting a workshop you host ────────────────────────────────────────
  // A workshop people may be planning their weeks around is not a neutral
  // thing to remove, so this copy is plain about what deleting does and —
  // just as importantly — about what it does not do. There is no email
  // service and no reservations model behind this, so nothing here may
  // suggest that anyone gets told. Saying so is what lets the host go and
  // tell people themselves.
  "workshopHost.label": "You host this",
  "workshopHost.note":
    "Only you can see these. Edits show up straight away for anyone looking at this page.",
  "workshopHost.editCta": "Edit workshop",
  "workshopHost.deleteCta": "Delete",
  "deleteWorkshop.title": "Delete this workshop?",
  "deleteWorkshop.body":
    "Deleting is permanent. It comes off Skills & learning right away, and anyone holding the link will find nothing there.",
  // Booked people lose their spot when the workshop goes — the cascade is real
  // now, so the copy names them. It still can't claim anyone is told: there's
  // no email service and no notification behind this. The number is the weight.
  "deleteWorkshop.attendeesNote_one":
    "One person has a spot in this. Deleting takes it away, and no message goes out — if you want them to hear it from you, tell them first.",
  "deleteWorkshop.attendeesNote_other":
    "{count} people have spots in this. Deleting takes them away, and no message goes out — if you want them to hear it from you, tell them first.",
  "deleteWorkshop.noAttendeesNote":
    "Nobody has booked a spot yet, so no one loses anything today.",
  "deleteWorkshop.keepCta": "Keep it",
  "deleteWorkshop.confirmCta": "Delete workshop",
  "deleteWorkshop.deletingLabel": "Deleting…",
  "deleteWorkshop.failedNote":
    "We couldn't delete that just now — your workshop is still up. Try again in a moment.",
  "deleteWorkshop.toast": "Workshop deleted",

  "addWorkshop.cat.creative": "Creative",
  "addWorkshop.cat.craft": "Craft",
  "addWorkshop.cat.design": "Design",
  "addWorkshop.cat.tech": "Tech",
  "addWorkshop.cat.business": "Business",
  "addWorkshop.cat.care": "Care",
  "addWorkshop.mode.inPerson": "In-person",
  "addWorkshop.mode.online": "Online",
  "addWorkshop.mode.hybrid": "Hybrid",
  "addWorkshop.build.tutorRole":
    "QueerPulse member · running this for the first time",

  // ── addWorkshop.build.ts (chrome defaults for a member-listed workshop) ──
  // Workshops have no live backend yet (see WorkshopsProvider) — this builder
  // always runs client-side, so its boilerplate defaults are chrome, not
  // fetched content. `draft.title`/`blurb`/`about`/`venue` are the poster's own
  // words and stay untranslated, same treatment as a job's free-text salary.
  "addWorkshop.build.freeTier": "Free · pay what you can",
  "addWorkshop.build.free": "Free",
  "addWorkshop.build.standardRate": "Standard rate",
  "addWorkshop.build.reduced": "Reduced",
  "addWorkshop.build.solidaritySlot": "Solidarity · 1 slot",
  "addWorkshop.build.weeks_one": "{count} week",
  "addWorkshop.build.weeks_other": "{count} weeks",
  "addWorkshop.build.format": "Workshop · {weeks} · group of {size}",
  "addWorkshop.build.priceSub": "{weeks} · sliding scale available",
  "addWorkshop.build.heroPlaceholder": "{title} · workshop",
  "addWorkshop.build.startDateTba": "To be announced",
  "addWorkshop.build.cancellation": "Full refund · before it starts",
  "addWorkshop.build.sessionTitle": "Week {n} · to be planned",
  "addWorkshop.build.sessionDesc":
    "Add what this session covers from your workshop page.",
  "addWorkshop.build.sessionDateTba": "TBA",
  "addWorkshop.build.sessionLength": "3 hr",
  "addWorkshop.build.needsMaterialsLabel": "Materials",
  "addWorkshop.build.needsMaterialsDetail":
    "The tutor will confirm what's provided before the first session.",
  "addWorkshop.build.needsIncludedTag": "included",
  "addWorkshop.build.needsYourselfLabel": "Yourself",
  "addWorkshop.build.needsYourselfDetail":
    "Come curious. The rest gets sorted with your cohort.",
  "addWorkshop.build.venueTba": "Venue to be confirmed",
  "addWorkshop.build.venueSharedOnReserve": "Shared once you reserve",
  "addWorkshop.build.accessNote":
    "The tutor will share access details — step-free routes, bathrooms, transit — before you commit.",

  // ── SkillsPage (+ section / card) ───────────────────────────────────────
  // Scope note: skills.data.ts skill offers/asks are member-authored posts —
  // in live mode fetched — left in English. Only page chrome is translated.
  "skills.hero.eyebrow": "Skills & learning",
  "skills.hero.title": "Learn from your <em>community.</em>",
  "skills.hero.lead":
    "No course fees, no algorithms, no performative expertise. Just members who are good at things and willing to share what they know — and members who want to get better.",
  "skills.filter.browseBy": "Browse by:",
  "skills.filter.all": "All skills",
  "skills.filter.design": "Design",
  "skills.filter.tech": "Tech",
  "skills.filter.business": "Business",
  "skills.filter.craft": "Craft",
  "skills.filter.care": "Care",
  "skills.filter.creative": "Creative",
  "skills.intro":
    "Everything here is offered and requested by members. If you want to learn something, post an Ask on the board. If you want to teach something, post an Offer.",
  "skills.empty.title": "No one's shared a skill here yet",
  "skills.empty.description":
    "When members offer to teach what they're good at — or ask to learn something new — it'll show up here. Be the first: list a workshop, or post what you can teach on the board.",
  "skills.empty.listWorkshopCta": "List a workshop",
  "skills.empty.postBoardCta": "Post on the board",
  "skills.section.offeringTitle": "Members <em>offering</em> to teach",
  "skills.section.offeringEmpty":
    "No one's offered to teach in this category yet. Clear the filter to see everything members are sharing.",
  "skills.section.lookingTitle": "Members <em>wanting</em> to learn",
  "skills.section.lookingEmpty":
    "No one's asked to learn in this category yet. Clear the filter to see what the rest of the community is hoping to pick up.",
  "skills.section.nothingMatches": "Nothing matches your filter",
  "skills.section.clearFilters": "Clear filters",
  "skills.offerStrip.title": "Have something <em>to teach?</em>",
  "skills.offerStrip.body":
    "Post a skill offer on the board — what you can teach, how, and who it's for. The community will find you.",
  "skills.offerStrip.cta": "Post on the board",
  "skills.outro.title":
    "The best way to get better is to <em>know someone further along.</em>",
  "skills.outro.sub":
    "Join the network and find the people who can help you grow — and the people you can help in return.",
  "skills.outro.cta": "Request an invite",
  "skills.card.teaching": "Teaching",
  "skills.card.learning": "Learning",
  "skills.card.reachOut": "Reach out",

  // ── SolidarityPage (+ directory) ────────────────────────────────────────
  // Scope note: solidarity.data.ts practitioner listings (bio, pricing notes,
  // tags) are directory content — in live mode fetched — left in English.
  "solidarity.hero.eyebrow": "Community care",
  "solidarity.hero.titleLine1": "Pay what",
  "solidarity.hero.titleEm": "you can.",
  "solidarity.hero.sub":
    "Professionals from the QueerPulse community who offer sliding-scale fees — because access to good care shouldn't depend on what you earn.",
  "solidarity.hero.note":
    "All practitioners have been verified by at least two community members.",
  "solidarity.how.step1.title": "Find your practitioner",
  "solidarity.how.step1.body":
    "Filter by profession, neighbourhood, or language. Every listing includes how their sliding scale works — no surprises.",
  "solidarity.how.step2.title": "Contact them directly",
  "solidarity.how.step2.body":
    "Reach out via the platform or email. You set the conversation — you do not have to explain your financial situation to anyone else first.",
  "solidarity.how.step3.title": "Pay what you can",
  "solidarity.how.step3.body":
    "Each practitioner sets their own range and approach. Some use income-based scales, others name-your-price. The listing tells you how.",
  "solidarity.outro.title": "Care is a <em>collective act.</em>",
  "solidarity.outro.sub":
    "QueerPulse connects the community to professionals who believe in access as much as you do.",
  "solidarity.outro.cta": "Join the network",

  "solidarity.filter.all": "All",
  "solidarity.filter.therapy": "Therapy",
  "solidarity.filter.legal": "Legal",
  "solidarity.filter.medical": "Medical",
  "solidarity.filter.dental": "Dental",
  "solidarity.filter.vet": "Vet",
  "solidarity.filter.finance": "Accountancy",
  "solidarity.filter.body": "Bodywork",

  "solidarityDirectory.professionLabel": "Profession",
  "solidarityDirectory.searchPlaceholder": "Search by name, area…",
  "solidarityDirectory.count_one": "<b>{count}</b> practitioner",
  "solidarityDirectory.count_other": "<b>{count}</b> practitioners",
  "solidarityDirectory.badgeMember": "Member",
  "solidarityDirectory.badgeVerified": "Verified",
  "solidarityDirectory.slidingScaleLabel": "Sliding scale",
  "solidarityDirectory.contactCta": "Contact",
  "solidarityDirectory.empty.title": "No practitioners match",
  "solidarityDirectory.empty.description":
    "No one fits that search just yet. Try a different profession or clear your search to see everyone offering sliding-scale care.",
  "solidarityDirectory.empty.clearFilters": "Clear filters",
  "solidarityDirectory.emptyLive.title": "Directory coming soon",
  "solidarityDirectory.emptyLive.description":
    "We're verifying practitioners who offer solidarity pricing. Soon you'll be able to find and contact them here.",
  "solidarityDirectory.register.titleLine1": "Do you offer",
  "solidarityDirectory.register.titleEm": "solidarity pricing?",
  "solidarityDirectory.register.body":
    "If you are a professional in the community and already offer sliding-scale fees, add yourself to this list. It takes ten minutes and helps people find you.",
  "solidarityDirectory.register.cta": "Register your practice",
  "solidarityDirectory.register.questionsLink": "Questions first? Get in touch",

  // ── tools/ToolPage (shared document-generator shell, all freelance tools) ──
  "toolPage.backToEconomy": "Back to Economy",
  "toolPage.eyebrowFreelance": "Freelance tools",
  "toolPage.eyebrowCommunity": "Community",
  "toolPage.downloadPdf": "Download PDF",
  "toolPage.copyText": "Copy text",
  "toolPage.copiedToast": "Copied to clipboard",
  "toolPage.reset": "Reset",

  // ── tax.constants.ts — IVA rate dropdown labels (InvoiceFormFields, DayRateCalculatorPage) ──
  "tax.ivaRate.0": "0% (exempt)",
  "tax.ivaRate.6": "6% (reduced)",
  "tax.ivaRate.13": "13% (intermediate)",
  "tax.ivaRate.23": "23% (standard)",

  // ── IvaTrackerForm / IvaTrackerPage / IvaTrackerStatus ─────────────────
  "ivaTracker.title": "Stay under the <em>threshold.</em>",
  "ivaTracker.sub":
    "Track your invoiced income toward the €15,000 IVA-exemption limit (art. 53.º). Saved on this device only.",
  "ivaTracker.form.whatForLabel": "What was it for",
  "ivaTracker.form.whatForPlaceholder": "e.g. Logo design — Café Aurora",
  "ivaTracker.form.amountLabel": "Amount (€)",
  "ivaTracker.form.dateLabel": "Date",
  "ivaTracker.form.addCta": "Add invoice",
  "ivaTracker.form.loggedHead": "Logged invoices",
  "ivaTracker.form.empty": "Nothing logged yet. Add your first invoice above.",
  "ivaTracker.form.removeAriaLabel": "Remove {label}",
  "ivaTracker.status.eyebrow": "Toward the €15,000 limit",
  "ivaTracker.status.barAriaLabel":
    "Invoiced income toward the IVA exemption threshold",
  "ivaTracker.status.invoiced": "Invoiced",
  "ivaTracker.status.headroomLeft": "Headroom left",
  "ivaTracker.status.overBy": "Over by",
  "ivaTracker.status.thresholdUsed": "Threshold used",
  "ivaTracker.status.safeNote":
    "Comfortably under the limit. Keep logging invoices and you'll see your headroom shrink in real time.",
  "ivaTracker.status.nearNote":
    "Getting close — only {remaining} of headroom left. Plan the rest of your year carefully before you cross {threshold}.",
  "ivaTracker.status.overNote":
    "You've passed the {threshold} exemption limit. You can finish the year exempt, but next year you'll charge IVA — and crossing {overrun} (25% over) forces you out immediately.",
  "ivaTracker.status.overrunTitle": "You must leave the <em>exemption.</em>",
  "ivaTracker.status.overrunBody":
    "You're past {overrun} — more than 25% over the threshold — so the art. 53.º exemption ends in-year. You'll need to start charging IVA and drop the exemption note from your invoices.",
  "ivaTracker.status.overrunNote": "Until now your faturas carried: {note}",

  // ── InvoiceForm / InvoiceFormFields / InvoiceLineItems / InvoicePreview / InvoiceGeneratorPage ──
  "invoiceTool.title": "Make an <em>invoice.</em>",
  "invoiceTool.sub":
    "Fill in the details and watch your fatura-recibo build itself. When it looks right, save it straight to PDF — no account, no upload, nothing leaves your browser.",
  "invoiceTool.issuer.legend": "Your details",
  "invoiceTool.issuer.nameLabel": "Name / business",
  "invoiceTool.issuer.namePlaceholder": "Your name or studio",
  "invoiceTool.issuer.nifLabel": "NIF",
  "invoiceTool.issuer.emailLabel": "Email",
  "invoiceTool.issuer.emailPlaceholder": "you@example.com",
  "invoiceTool.issuer.addressLabel": "Address",
  "invoiceTool.issuer.addressPlaceholder": "Street, postcode, city",
  "invoiceTool.issuer.ibanLabel": "IBAN",
  "invoiceTool.client.legend": "Client",
  "invoiceTool.client.nameLabel": "Client name",
  "invoiceTool.client.namePlaceholder": "Who you're billing",
  "invoiceTool.client.nifLabel": "Client NIF",
  "invoiceTool.client.addressLabel": "Client address",
  "invoiceTool.optional": "Optional",
  "invoiceTool.meta.legend": "Invoice",
  "invoiceTool.meta.numberLabel": "Invoice number",
  "invoiceTool.meta.issueDateLabel": "Issue date",
  "invoiceTool.meta.dueDateLabel": "Due date",
  "invoiceTool.meta.ivaRateLabel": "IVA rate",
  "invoiceTool.lines.legend": "Line items",
  "invoiceTool.lines.description": "Description",
  "invoiceTool.lines.qty": "Qty",
  "invoiceTool.lines.unit": "Unit (€)",
  "invoiceTool.lines.total": "Total",
  "invoiceTool.lines.descAriaLabel": "Description for line {index}",
  "invoiceTool.lines.qtyAriaLabel": "Quantity for line {index}",
  "invoiceTool.lines.unitAriaLabel": "Unit price for line {index}",
  "invoiceTool.lines.descPlaceholder": "What you delivered",
  "invoiceTool.lines.removeAriaLabel": "Remove line {index}",
  "invoiceTool.lines.addCta": "Add line",
  "invoiceTool.notes.legend": "Notes",
  "invoiceTool.notes.placeholder":
    "Payment terms, thanks, anything the client should know.",
  "invoiceTool.preview.yourNameFallback": "Your name",
  "invoiceTool.preview.docLabel": "Fatura-Recibo",
  "invoiceTool.preview.issued": "Issued {date}",
  "invoiceTool.preview.due": "Due {date}",
  "invoiceTool.preview.billedTo": "Billed to",
  "invoiceTool.preview.subtotal": "Subtotal",
  "invoiceTool.preview.ivaLabel": "IVA ({rate}%)",
  "invoiceTool.preview.total": "Total",
  "invoiceTool.preview.notesTitle": "Notes",

  // ── ScopeForm / ScopePreview / ScopeGeneratorPage ──────────────────────
  "scopeTool.title": "Define the <em>scope.</em>",
  "scopeTool.sub":
    "A clear scope (and what's out of it) prevents most disputes. Build one, send a PDF.",
  "scopeTool.projectLabel": "Project",
  "scopeTool.projectPlaceholder": "e.g. Brand & website refresh",
  "scopeTool.clientLabel": "Client name",
  "scopeTool.clientPlaceholder": "Who this is for",
  "scopeTool.includedLegend": "What's included",
  "scopeTool.includedHint": "The deliverables you commit to.",
  "scopeTool.includedPlaceholder": "A deliverable",
  "scopeTool.includedAdd": "Add deliverable",
  "scopeTool.excludedLegend": "Not included",
  "scopeTool.excludedHint":
    "Naming exclusions up front prevents most disputes.",
  "scopeTool.excludedPlaceholder": "Something out of scope",
  "scopeTool.excludedAdd": "Add exclusion",
  "scopeTool.itemAriaLabel": "{legend} item {index}",
  "scopeTool.removeItemAriaLabel": "Remove {legend} item {index}",
  "scopeTool.revisionsLabel": "Revisions",
  "scopeTool.revisionsPlaceholder": "e.g. 2 rounds per deliverable",
  "scopeTool.milestonesLabel": "Milestones & terms",
  "scopeTool.milestonesPlaceholder": "Payment schedule, timeline, conditions…",
  "scopeTool.priceLabel": "Price (optional)",
  "scopeTool.pricePlaceholder": "Leave empty for scope only",
  "scopeTool.validUntilLabel": "Valid until",
  "scopeTool.preview.yourNameFallback": "Your name",
  "scopeTool.preview.quote": "Quote",
  "scopeTool.preview.scopeOfWork": "Scope of Work",
  "scopeTool.preview.untitledProject": "Untitled project",
  "scopeTool.preview.forClient": "For {client}",
  "scopeTool.preview.forYourClient": "For your client",
  "scopeTool.preview.included": "What's included",
  "scopeTool.preview.addDeliverable": "Add at least one deliverable.",
  "scopeTool.preview.notIncluded": "Not included",
  "scopeTool.preview.revisions": "Revisions",
  "scopeTool.preview.milestones": "Milestones & terms",
  "scopeTool.preview.total": "Total",
  "scopeTool.preview.validUntil": "Valid until {date}",
  "scopeTool.disclaimer":
    "This document is a working scope, not a binding contract. Anything not listed under “What's included” is out of scope and quoted separately.",
  "scopeTool.plainText.quote": "QUOTE",
  "scopeTool.plainText.scopeOfWork": "SCOPE OF WORK",
  "scopeTool.plainText.from": "From: {name}",
  "scopeTool.plainText.for": "For: {name}",
  "scopeTool.plainText.project": "Project: {name}",
  "scopeTool.plainText.included": "What's included",
  "scopeTool.plainText.notIncluded": "Not included",
  "scopeTool.plainText.revisions": "Revisions: {value}",
  "scopeTool.plainText.terms": "Terms: {value}",
  "scopeTool.plainText.total": "Total: {value}",
  "scopeTool.plainText.validUntil": "Valid until: {date}",

  // ── ContractForm / ContractClauses / ContractPreview / ContractGeneratorPage ──
  // Scope note: CLAUSES/DOC_STRINGS in contract.data.ts are the CONTRACT
  // DOCUMENT's own output-language toggle (English/Português, chosen by the
  // member for the generated legal document) — orthogonal to the app's UI
  // language and already bilingual by design. Left untouched. Only the
  // surrounding app chrome (this section) follows the app locale.
  "contractTool.title": "Build a <em>contract.</em>",
  "contractTool.sub":
    "A clear service agreement, ready in minutes. Fill in the work, pick the clauses that protect you, and export a real PDF — all in your browser.",
  "contractTool.docLanguageLegend": "Document language",
  "contractTool.docLanguageAriaLabel": "Document language",
  "contractTool.providerLegend": "You (the Provider)",
  "contractTool.clientLegend": "Your client",
  "contractTool.nameLabel": "Name",
  "contractTool.nifLabel": "NIF / VAT",
  "contractTool.providerNamePlaceholder": "Your name or studio",
  "contractTool.providerNifPlaceholder": "123 456 789",
  "contractTool.clientNamePlaceholder": "Client or company name",
  "contractTool.clientNifPlaceholder": "987 654 321",
  "contractTool.projectTitleLabel": "Project title",
  "contractTool.projectTitlePlaceholder": "e.g. Brand identity for Casa Aurora",
  "contractTool.scopeLabel": "Scope of work",
  "contractTool.scopePlaceholder":
    "What you'll deliver, and what's out of scope.",
  "contractTool.feeLabel": "Fee",
  "contractTool.feePlaceholder": "e.g. €2,400 + IVA",
  "contractTool.timelineLabel": "Timeline",
  "contractTool.timelinePlaceholder": "e.g. 6 weeks from signing",
  "contractTool.paymentTermsLabel": "Payment terms",
  "contractTool.paymentTermsPlaceholder":
    "e.g. 50% on signing, 50% on delivery",
  "contractTool.governingLawLabel": "Governing law",
  "contractTool.governingLawPlaceholder": "Portugal",

  // ── ComparatorForm / ComparatorResult / ComparatorPage ─────────────────
  "comparator.title": "Freelance or <em>salaried?</em>",
  "comparator.sub":
    "Compare what you'd actually take home either way at the same gross income — and weigh the costs that don't show up on a payslip.",
  "comparator.form.grossLabel": "Annual gross income (€)",
  "comparator.form.grossPlaceholder": "e.g. 30000",
  "comparator.form.activityLabel": "Freelance activity type",
  "comparator.form.yearLabel": "Tax year",
  "comparator.form.startupLabel": "Start of activity",
  "comparator.activityOption.services": "Liberal profession (0.75)",
  "comparator.activityOption.otherServices": "Other services (0.35)",
  "comparator.activityOption.goods": "Sale of goods / hospitality (0.15)",
  "comparator.activityOption.ipCapital": "IP / capital (0.95)",
  "comparator.startupOption.none": "Not in first 2 years",
  "comparator.startupOption.year1": "First year (×0.5 coefficient)",
  "comparator.startupOption.year2": "Second year (×0.75 coefficient)",
  "comparator.result.freelanceLabel": "Freelance",
  "comparator.result.salariedLabel": "Salaried",
  "comparator.result.perMonth": "/ month",
  "comparator.result.segurancaSocial": "− Segurança Social",
  "comparator.result.irs": "− IRS",
  "comparator.result.effectiveRate": "Effective rate",
  "comparator.result.bottomLine": "The bottom line",
  "comparator.result.summaryMore":
    "As a freelancer you'd keep <em>{amount}</em> more per year",
  "comparator.result.summaryLess":
    "As a freelancer you'd keep <em>{amount}</em> less per year",
  "comparator.result.subMore":
    "at {gross} gross — that's about {monthly} a month extra in your pocket, before the costs below.",
  "comparator.result.subLess":
    "at {gross} gross — that's about {monthly} a month you'd give up, before the costs below.",
  "comparator.result.costsTitle": "What the <em>payslip</em> doesn't show",
  "comparator.hiddenCost.noHoliday":
    "No paid holiday — you fund your own time off.",
  "comparator.hiddenCost.noSubsidio":
    "No subsídio de férias or de Natal (the two extra months salaried workers get).",
  "comparator.hiddenCost.noSickLeave":
    "No paid sick leave or guaranteed unemployment cover.",
  "comparator.hiddenCost.ownSS":
    "You pay your own Segurança Social, quarterly.",
  "comparator.hiddenCost.lumpyIncome":
    "Income is lumpy — feast or famine month to month.",
  "comparator.hiddenCost.upside":
    "But: deductible expenses, autonomy, and you can charge more.",

  // ── RateBoardForm / RateBoardStats / RateBoardPage ─────────────────────
  "rateBoard.title": "What we actually <em>charge.</em>",
  "rateBoard.sub":
    "Anonymous day rates shared by the community, so nobody has to guess. Add yours, see where you stand. Saved on this device.",
  "rateBoard.form.title": "Add your rate",
  "rateBoard.form.hint":
    "No name, no email — just the numbers. It stays on this device until you export it.",
  "rateBoard.form.roleLabel": "Role",
  "rateBoard.form.experienceLabel": "Experience",
  "rateBoard.form.dayRateLabel": "Day rate (€)",
  "rateBoard.form.dayRatePlaceholder": "e.g. 350",
  "rateBoard.form.typeLabel": "Type",
  "rateBoard.form.addCta": "Add to the board",
  "rateBoard.form.compareLabel": "See where you stand",
  "rateBoard.form.comparePlaceholder": "Your day rate (€)",
  "rateBoard.form.compareHint":
    "We'll show your percentile against everyone here — nothing's added to the board.",
  "rateBoard.form.addedToast": "Added anonymously",
  "rateBoard.experienceOption.junior": "Junior (0–2 yrs)",
  "rateBoard.experienceOption.mid": "Mid (3–5 yrs)",
  "rateBoard.experienceOption.senior": "Senior (6–9 yrs)",
  "rateBoard.experienceOption.lead": "Lead (10+ yrs)",
  "rateBoard.typeOption.freelance": "Freelance",
  "rateBoard.typeOption.employed": "Employed (day equivalent)",
  "rateBoard.roleOption.designer": "Designer",
  "rateBoard.roleOption.softwareEngineer": "Software Engineer",
  "rateBoard.roleOption.writer": "Writer",
  "rateBoard.roleOption.photographer": "Photographer",
  "rateBoard.roleOption.consultant": "Consultant",
  "rateBoard.roleOption.other": "Other",
  "rateBoard.stats.emptyTitle": "Nothing here <em>yet.</em>",
  "rateBoard.stats.emptyBody":
    "Be the first to add a rate, or import a JSON file someone shared with you. The distribution shows up here as soon as there's data.",
  "rateBoard.stats.communityMedian": "Community median day rate",
  "rateBoard.stats.across": "across",
  "rateBoard.stats.rateCount_one": "{count} rate",
  "rateBoard.stats.rateCount_other": "{count} rates",
  "rateBoard.stats.roleCount_one": "{count} role",
  "rateBoard.stats.roleCount_other": "{count} roles",
  "rateBoard.stats.yourRateSits": "Your rate of {rate} sits at the",
  "rateBoard.stats.percentileValue": "{percentile}th percentile",
  "rateBoard.stats.aboveMost": "Above {percent}% of rates shared here.",
  "rateBoard.stats.belowMost":
    "Below most rates here — you may be leaving money on the table.",
  "rateBoard.disclaimer":
    "Shared anonymously by community members and not verified — figures are self-reported and individual situations differ. Treat this as a starting point for the conversation, not a guarantee. Saved on this device only.",
  "rateBoard.export": "Export JSON",
  "rateBoard.import": "Import JSON",
  "rateBoard.importAriaLabel": "Import a rate-board JSON file",
  "rateBoard.exportedToast": "Exported",
  "rateBoard.invalidFileToast":
    "That file isn't a rate board — expected a JSON array.",
  "rateBoard.noValidEntriesToast": "No valid entries found in that file.",
  "rateBoard.importedToast_one": "Imported {count} entry",
  "rateBoard.importedToast_other": "Imported {count} entries",
  "rateBoard.readErrorToast": "Couldn't read that file — is it valid JSON?",
  "rateBoard.readErrorGenericToast": "Couldn't read that file.",

  // ── SetAsideForm / SetAsideResult / SetAsidePlannerPage ────────────────
  "setAside.title": "Set aside the <em>tax bill.</em>",
  "setAside.sub":
    "Work out how much of every invoice to park now, so the IRS and Segurança Social bills don't sting later.",
  "setAside.yourYearLegend": "Your year",
  "setAside.grossLabel": "Expected annual gross",
  "setAside.grossPlaceholder": "30000",
  "setAside.grossHint":
    "Everything you expect to invoice this year, before tax.",
  "setAside.activityLabel": "Activity",
  "setAside.yearLabel": "Tax year",
  "setAside.activityOption.services":
    "Services (liberal professions, art. 151.º)",
  "setAside.activityOption.otherServices":
    "Other services (not in the 0.75 set)",
  "setAside.activityOption.goods": "Sale of goods / hospitality",
  "setAside.logInvoiceLegend": "Log an invoice",
  "setAside.logInvoiceHint":
    "Add each payment as it lands. We total what you should have parked.",
  "setAside.amountLabel": "Amount received",
  "setAside.amountPlaceholder": "1200",
  "setAside.dateLabel": "Date",
  "setAside.addCta": "Add to pot",
  "setAside.removeAriaLabel": "Remove {amount} invoice",
  "setAside.result.parkKicker": "For every invoice, park",
  "setAside.result.title":
    "Set aside <em>{percent}%</em> of every euro you invoice.",
  "setAside.result.body":
    "On your expected {gross}, that's about {monthly} a month you keep aside for the IRS and Segurança Social — and don't spend.",
  "setAside.result.parkPerMonth": "Park per month",
  "setAside.result.parkThisYear": "Park this year",
  "setAside.result.potLabel": "Your set-aside pot",
  "setAside.result.potCount_one": "{count} invoice logged",
  "setAside.result.potCount_other": "{count} invoices logged",
  "setAside.result.potEmpty": "Log your first invoice to start the pot.",
  "setAside.result.potSub":
    "{percent}% of the {logged} you've logged so far. Keep this much untouched.",

  // ── TakeHomeForm / TakeHomeResult / TakeHomeCalculatorPage ─────────────
  "takeHome.title": "What you actually <em>take home.</em>",
  "takeHome.sub":
    "Punch in your yearly gross and we'll estimate what's left after IRS and Segurança Social on the regime simplificado — recalculated live as you go.",
  "takeHome.grossLabel": "Annual gross income (€)",
  "takeHome.grossPlaceholder": "e.g. 30000",
  "takeHome.activityLabel": "Activity type",
  "takeHome.statusLabel": "Worker status",
  "takeHome.yearLabel": "Tax year",
  "takeHome.startupLabel": "Start of activity",
  "takeHome.activityOption.services": "Liberal profession (0.75)",
  "takeHome.activityOption.otherServices": "Other services (0.35)",
  "takeHome.activityOption.goods": "Sale of goods / hospitality (0.15)",
  "takeHome.activityOption.ipCapital": "IP / capital (0.95)",
  "takeHome.startupOption.none": "Not in first 2 years",
  "takeHome.startupOption.year1": "Year 1 (×0.5 coefficient)",
  "takeHome.startupOption.year2": "Year 2 (×0.75 coefficient)",
  "takeHome.statusOption.freelancer": "Freelancer (21.4% SS)",
  "takeHome.statusOption.eni": "ENI — empresário em nome individual (25.2% SS)",
  "takeHome.result.netLabel": "You take home, after IRS & Segurança Social",
  "takeHome.result.perMonth": "a month",
  "takeHome.result.keepCaption":
    "You keep <em>{percent}%</em> of every euro you bill. Effective IRS + SS rate: {rate}%.",
  "takeHome.result.barAriaLabel": "You keep {percent}% of your gross income",
  "takeHome.result.annualGross": "Annual gross",
  "takeHome.result.segurancaSocial": "− Segurança Social",
  "takeHome.result.taxableIncome": "Taxable income",
  "takeHome.result.irs": "− IRS",
  "takeHome.result.netTakeHome": "Net take-home",

  // ── DayRateCalculatorPage / DayRateResult ──────────────────────────────
  "dayRate.title": "Price your <em>day.</em>",
  "dayRate.sub":
    "Work back from the income you need to a day rate that actually sustains you — overhead, unpaid days, and IVA included.",
  "dayRate.annualLabel": "Target annual income (€)",
  "dayRate.daysLabel": "Billable days per year",
  "dayRate.overheadLabel": "Overhead & expenses (% of income)",
  "dayRate.hoursLabel": "Hours per billable day",
  "dayRate.ivaLabel": "IVA rate",
  "dayRate.result.heading": "Your day rate",
  "dayRate.result.minLabel": "Minimum day rate (excl. IVA)",
  "dayRate.result.withIvaLabel": "Including IVA",
  "dayRate.result.hourlyLabel": "Hourly (excl. IVA)",
  "dayRate.result.note":
    "A starting point — adjust for your sector and market.",

  // ── SlidingScaleForm / SlidingScalePreview / SlidingScalePage ──────────
  "slidingScale.title": "Price with <em>solidarity.</em>",
  "slidingScale.sub":
    "Publish a sliding scale so people pay what fits their means — and you still get paid fairly. Export a card to share.",
  "slidingScale.yourNameLabel": "Your name",
  "slidingScale.yourNamePlaceholder": "The name people will see",
  "slidingScale.serviceLabel": "Service / offering",
  "slidingScale.servicePlaceholder": "e.g. 1:1 coaching session",
  "slidingScale.introLabel": "Intro line",
  "slidingScale.introPlaceholder": "A warm line that frames the scale.",
  "slidingScale.tierLegend": "Tier {index}",
  "slidingScale.tierNameLabel": "Tier name",
  "slidingScale.tierNamePlaceholder": "e.g. Supported",
  "slidingScale.tierPriceLabel": "Price",
  "slidingScale.tierPricePlaceholder": "e.g. €60",
  "slidingScale.tierForWhomLabel": "Who it's for",
  "slidingScale.tierForWhomPlaceholder":
    "The honest guidance that helps people self-select.",
  "slidingScale.preview.kind": "Sliding scale",
  "slidingScale.preview.yourNameFallback": "Your name",
  "slidingScale.preview.offeringFallback": "Your offering",
  "slidingScale.preview.tierFallback": "Tier",
  "slidingScale.preview.priceFallback": "—",
  "slidingScale.preview.outro":
    "Pay the tier that's honest for you. Choosing higher keeps this work open to everyone.",
  "slidingScale.disclaimer":
    "These tiers are this maker's own pricing — a sliding scale offered in good faith, not a fixed market rate or a means test.",

  // ── ReciboVerdeGuidePage (page chrome only — see report re: GUIDE_SECTIONS) ──
  // Scope note: the guide's own section titles/bodies (reciboVerdeGuide.data.tsx
  // GUIDE_SECTIONS) are dense, article-citing pt-PT tax/legal explanations —
  // flagged and deliberately left English rather than risk a subtly wrong tax
  // instruction. Only this page's surrounding chrome is translated.
  "reciboGuide.heroTitle": "The recibos verdes <em>guide.</em>",
  "reciboGuide.heroLead":
    "Going freelance in Portugal shouldn't mean drowning in jargon. Here's the whole recibos verdes system in plain, warm language — how to register, what you'll owe, and the handful of dates that actually matter. Take it one section at a time.",
  "reciboGuide.ctaTitle": "Ready to <em>send one?</em>",
  "reciboGuide.ctaText":
    "The invoice tool turns everything above into a finished fatura-recibo — right coefficients, right notes, right maths.",
  "reciboGuide.makeInvoiceCta": "Make an invoice",
  "reciboGuide.backToEconomy": "Back to Economy",
  "reciboGuide.disclaimerTitle": "Not <em>tax advice.</em>",

  // ── HousingCoopPage (+ Sections) ────────────────────────────────────────
  // Scope note: housingCoop.data.ts's FORMING_COOPS (specific co-ops, member
  // counts, financials) is a directory of real-world entries — in live mode
  // this would be fetched. Left in English, same as the grants directory.
  // COOP_STATS/COOP_PHASES/COOP_TEMPLATES/COOP_RESOURCES are platform-authored
  // programme content (same shape as `incubator.step.*`, which IS translated)
  // and are now swept below.
  "housingCoop.backLabel": "Housing",
  "housingCoop.hero.eyebrow":
    "Housing co-op formation · Portugal-first, expandable",
  "housingCoop.hero.title": "Build a co-op <em>together</em>.",
  "housingCoop.hero.sub":
    "A toolkit for forming a queer housing co-operative in Portugal — from finding the people, through the legal incorporation, the financing, the property, the daily governance. <em>Five phases, real templates, members already in each one.</em>",
  "housingCoop.hero.statsHead": "Co-ops forming now",
  "housingCoop.phases.title": "Five <em>phases</em> from idea to keys",
  "housingCoop.phases.sub":
    "Realistic timeline: 14–28 months. Each phase has templates, real examples from existing co-ops, and a mentor you can reach when stuck.",
  "housingCoop.grid.title": "Co-ops <em>forming now</em>",
  "housingCoop.grid.seeAll": "All 8",
  "housingCoop.templates.title": "Templates & <em>tools</em>",
  "housingCoop.templates.sub":
    "Every document we wish someone had given us. Drafted with QueerPulse legal, translated PT & EN, stress-tested by Casa Sambizanga's first two years.",
  "housingCoop.templates.download": "Download",
  "housingCoop.templates.read": "Read",
  "housingCoop.startCta.eyebrow": "Start a co-op",
  "housingCoop.startCta.title": "Don't have <em>your people yet</em>?",
  "housingCoop.startCta.body":
    "Post that you're starting and we'll match you with other members in your city looking for the same thing. Most co-ops start with 2–3 people and grow to 6+ over the first 6 months. <em>Casa Sambizanga started with three.</em>",
  "housingCoop.startCta.postCta": "Post that you're starting",
  "housingCoop.startCta.storyCta": "Read Casa Sambizanga's story",
  "housingCoop.startCta.resourcesHead": "Resources & mentors",

  // ── "Forming now" empty state (CoopEmptyState) ──────────────────────────
  "housingCoop.empty.title": "No co-ops",
  "housingCoop.empty.titleEm": "forming yet",
  "housingCoop.empty.body":
    "This is where you'll find groups organizing housing together. Post that you're starting, and we'll help you find your people.",
  "housingCoop.empty.cta": "Post that you're starting",

  // ── CoopTemplatePage (formation template documents) ─────────────────────
  "coopTemplate.back": "Back to housing co-ops",
  "coopTemplate.disclaimer":
    "This is a starting template — adapt it with your group and, where it matters legally, a lawyer or notary.",

  // ── Hero stat labels (housingCoop.data → COOP_STATS) ────────────────────
  "housingCoop.stats.activeGroups": "Active groups",
  "housingCoop.stats.householdsHoused": "Households housed",
  "housingCoop.stats.inPhase": "In phase 4–5",
  "housingCoop.stats.cities": "Cities",
  "housingCoop.stats.citiesLisbon": "Lisbon · ",

  // ── Five-phase timeline (housingCoop.data → COOP_PHASES) ────────────────
  "housingCoop.phase.findPeople.name": "Find",
  "housingCoop.phase.findPeople.nameEm": "the people",
  "housingCoop.phase.findPeople.time": "2–4 months",
  "housingCoop.phase.findPeople.desc":
    "4–12 households who share values, calendar, money habits. Vibes test, financial honesty, exit clause.",
  "housingCoop.phase.legalIncorporation.name": "Legal",
  "housingCoop.phase.legalIncorporation.nameEm": "incorporation",
  "housingCoop.phase.legalIncorporation.time": "1–3 months",
  "housingCoop.phase.legalIncorporation.desc":
    "CRL co-op structure, statutes, member shares. Templates for Portuguese law specifically.",
  "housingCoop.phase.financeStructure.name": "Finance &",
  "housingCoop.phase.financeStructure.nameEm": "structure",
  "housingCoop.phase.financeStructure.time": "3–8 months",
  "housingCoop.phase.financeStructure.desc":
    "Member share capital, ethical bank financing, government supports, group fund mechanics.",
  "housingCoop.phase.findProperty.name": "Find",
  "housingCoop.phase.findProperty.nameEm": "the property",
  "housingCoop.phase.findProperty.time": "6–12 months",
  "housingCoop.phase.findProperty.desc":
    "Survey, negotiate, sign. Most groups buy. Some lease-to-own. Some take long lease from public stock.",
  "housingCoop.phase.dailyGovernance.name": "Daily",
  "housingCoop.phase.dailyGovernance.nameEm": "governance",
  "housingCoop.phase.dailyGovernance.time": "Forever",
  "housingCoop.phase.dailyGovernance.desc":
    "Decision-making, conflict, repairs, new members, succession. Tools that survive boredom & bad days.",

  // ── Downloadable templates (housingCoop.data → COOP_TEMPLATES) ──────────
  "housingCoop.template.foundingValues.tag": "Phase 1 · template",
  "housingCoop.template.foundingValues.name": "Founding values &",
  "housingCoop.template.foundingValues.nameEm": "vibes test",
  "housingCoop.template.foundingValues.meta": "PDF · PT + EN · 14 pages",
  "housingCoop.template.financialHonesty.tag": "Phase 1 · template",
  "housingCoop.template.financialHonesty.name": "Financial honesty",
  "housingCoop.template.financialHonesty.nameEm": "worksheet",
  "housingCoop.template.financialHonesty.meta":
    "Spreadsheet · 1 sheet per member",
  "housingCoop.template.crlStatutes.tag": "Phase 2 · legal",
  "housingCoop.template.crlStatutes.name": "CRL co-op",
  "housingCoop.template.crlStatutes.nameEm": "statutes",
  "housingCoop.template.crlStatutes.meta": "DOCX · Portuguese law · vetted",
  "housingCoop.template.shareAgreement.tag": "Phase 2 · legal",
  "housingCoop.template.shareAgreement.name": "Member share",
  "housingCoop.template.shareAgreement.nameEm": "agreement",
  "housingCoop.template.shareAgreement.meta": "PDF · clauses for chosen family",
  "housingCoop.template.financeModel.tag": "Phase 3 · finance",
  "housingCoop.template.financeModel.name": "Group finance",
  "housingCoop.template.financeModel.nameEm": "model",
  "housingCoop.template.financeModel.meta":
    "Spreadsheet · with Lisbon & Porto data",
  "housingCoop.template.conflictResolution.tag": "Phase 5 · governance",
  "housingCoop.template.conflictResolution.name": "Conflict resolution",
  "housingCoop.template.conflictResolution.nameEm": "process",
  "housingCoop.template.conflictResolution.meta":
    "PDF · adapted from Casa Sambizanga",

  // ── Mentors/partners list (housingCoop.data → COOP_RESOURCES). `em` fields
  //    (proper nouns: "Casa Sambizanga", "CCAM") stay in the data file, not
  //    the catalog.
  "housingCoop.resource.sambizangaMentorsPost": " mentors",
  "housingCoop.resource.sambizangaMentorsMeta": "4 active",
  "housingCoop.resource.qpLegalTeamPre": "QP legal team",
  "housingCoop.resource.qpLegalTeamMeta": "3 lawyers",
  "housingCoop.resource.housingFundLiaisonPre": "Lisbon housing fund liaison",
  "housingCoop.resource.housingFundLiaisonMeta": "1 contact",
  "housingCoop.resource.caixaPre": "Caixa ",
  "housingCoop.resource.caixaPost": " co-op desk",
  "housingCoop.resource.caixaMeta": "Partner",
  "housingCoop.resource.monthlyAssemblyPre": "Monthly co-op assembly",
  "housingCoop.resource.monthlyAssemblyMeta": "First Sat",

  "housingCoop.toast.updates": "You'll get {name}'s updates in your feed.",
  "housingCoop.toast.mentoring": "Mentoring request sent to Casa Sambizanga.",
  "housingCoop.toast.seeAll": "The full co-op directory is coming soon.",
  "housingCoop.toast.preparingDownload": "Preparing “{name}” for download…",
  "housingCoop.toast.postHelp":
    "We'll help you find your people — check your inbox.",
  "housingCoop.toast.story": "Casa Sambizanga's story is coming soon.",
  "housingCoop.toast.liveComingSoon":
    "That's still being built — this action isn't wired up yet.",

  // ── JoinCoopModal ────────────────────────────────────────────────────────
  "joinCoop.askToJoinAriaLabel": "Ask to join {name}",
  "joinCoop.success.title": "Request",
  "joinCoop.success.em": "sent.",
  "joinCoop.success.closeLabel": "Done",
  "joinCoop.success.body":
    "The organisers of <strong>{name}</strong> will see your interest and reach out to arrange a first conversation. No commitment yet — the early chats are about whether the fit is right, both ways.",
  "joinCoop.title": "Ask to join <em>{name}.</em>",
  "joinCoop.sub":
    "{location}. Tell them a little about who's joining — they'll follow up to set up a first conversation.",
  "joinCoop.nameLabel": "Your name *",
  "joinCoop.namePlaceholder": "What should we call you?",
  "joinCoop.householdLabel": "Who's joining *",
  "joinCoop.chooseOne": "Choose one…",
  "joinCoop.noteLabel": "Anything you'd like them to know",
  "joinCoop.notePlaceholder":
    "What draws you to this co-op? Your situation, timeline, hopes…",
  "joinCoop.disclaimer":
    "Your request is shared only with this co-op's organisers. Joining a co-op is a long conversation, not a click — take your time.",
  "joinCoop.cancel": "Cancel",
  "joinCoop.sending": "Sending…",
  "joinCoop.sendCta": "Send request",
  "joinCoop.error": "Couldn't send your request — please try again.",
  "joinCoop.household.justMe": "Just me",
  "joinCoop.household.mePlusPartners": "Me + partner(s)",
  "joinCoop.household.small": "A household of 3–4",
  "joinCoop.household.large": "A household of 5+",

  // ── OfferPage (Asks & Offers board detail) ─────────────────────────────
  // Scope note: MAIN/OTHERS in OfferPage.tsx (the zine-collab ask, the free
  // portraits/mentoring/sublet offers, poster names/roles/bios) are
  // member-authored marketplace posts — in live mode fetched from the board.
  // Left in English. Only the surrounding chrome below is translated.
  "offerBoard.backLink": "Asks & Offers",
  "offerBoard.pill.looking": "Looking for",
  "offerBoard.pill.offering": "Offering",
  "offerBoard.respondCta": "Respond to {name}",
  "offerBoard.seeProfileCta": "See their profile",
  "offerBoard.postedBy": "Posted by",
  "offerBoard.sidebarNote":
    "{name} is a member in good standing. Every member is vouched for by someone already in the room.",
  "offerBoard.sidebarNoteVerified":
    "{name} is a member in good standing and has been verified by the team. Every member is vouched for by someone already in the room.",
  "offerBoard.sayHelloCta": "Say hello to {name}",
  "offerBoard.moreFromBoard": "More from <em>the board</em>",
  "offerBoard.comingSoon.title": "Asks & Offers is on its way",
  "offerBoard.comingSoon.body":
    "The community board — where members post what they're looking for and what they can offer — is coming soon. Check back shortly.",

  // ── SalarySubmitModal ────────────────────────────────────────────────────
  "salarySubmitModal.subtitle":
    "Completely anonymous. Nothing that could identify you is stored.",
  "salarySubmitModal.jobTitlePlaceholder": "Job title / role",
  "salarySubmitModal.sectorPlaceholder": "Sector (e.g. Tech, NGO, Design)",
  "salarySubmitModal.annualSalaryPlaceholder": "Annual salary (€)",
  "salarySubmitModal.yearsExpPlaceholder": "Years of experience",
  "salarySubmitModal.employmentTypeLabel": "Employment type",
  "salarySubmitModal.type.fullTime": "Full-time",
  "salarySubmitModal.type.partTime": "Part-time",
  "salarySubmitModal.type.freelance": "Freelance",
  "salarySubmitModal.type.contract": "Contract",
  "salarySubmitModal.submitCta": "Submit anonymously",

  // ── AffiliateCompanyModal ────────────────────────────────────────────────
  "affiliateRole.founder": "Founder / owner",
  "affiliateRole.hiringLead": "Hiring lead",
  "affiliateRole.teamMember": "Team member",
  "affiliateRole.recruiter": "Recruiter",
  "affiliateRole.volunteerCoordinator": "Volunteer coordinator",
  "affiliateCompanyModal.ariaLabel": "Affiliate your company",
  "affiliateCompanyModal.eyebrow": "Employer access",
  "affiliateCompanyModal.title": "Which company are you <em>posting for?</em>",
  "affiliateCompanyModal.sub":
    "Pick the organisation you're authorised to hire for. We confirm employer affiliations to keep the board trustworthy.",
  "affiliateCompanyModal.notListed.name": "My company isn't listed",
  "affiliateCompanyModal.notListed.meta": "Add it to the directory",
  "affiliateCompanyModal.addCompany.nameLabel": "Company name",
  "affiliateCompanyModal.addCompany.namePlaceholder": "e.g. Atelier Pulso",
  "affiliateCompanyModal.addCompany.taglineLabel": "One-line tagline",
  "affiliateCompanyModal.addCompany.taglinePlaceholder":
    "What the company does, in a sentence.",
  "affiliateCompanyModal.addCompany.aboutLabel": "About",
  "affiliateCompanyModal.addCompany.aboutPlaceholder":
    "A short description of the company and how it works.",
  "affiliateCompanyModal.addCompany.pickExisting": "Pick an existing company",
  "affiliateCompanyModal.roleLabel": "Your role there",
  "affiliateCompanyModal.cancel": "Cancel",
  "affiliateCompanyModal.creating": "Creating…",
  "affiliateCompanyModal.verifying": "Verifying…",
  "affiliateCompanyModal.createCta": "Create & continue",
  "affiliateCompanyModal.confirmCta": "Confirm & continue",
  "affiliateCompanyModal.createErrorToast":
    "We couldn't create that company. Please try again.",

  // ── Coming soon (live mode: honest stand-in for flows with no backend yet) ─
  "comingSoon.title": "Not live",
  "comingSoon.em": "just yet.",
  "comingSoon.body":
    "This form is part of the preview — it'll connect for real once QueerPulse launches. Nothing you enter here is sent anywhere.",
  "comingSoon.close": "Got it",

  // ── IncubatorModals: CohortApplyModal ────────────────────────────────────
  "incubatorApply.success.title": "Application",
  "incubatorApply.success.em": "received.",
  "incubatorApply.success.body":
    "Thanks, <strong>{name}</strong>. Cohort 3 applications are read by the programme team after the 30 July deadline — you'll hear back within three weeks, whatever we decide.",
  "incubatorApply.eyebrow": "Incubator · Cohort 3",
  "incubatorApply.title": "Apply to <em>build your thing.</em>",
  "incubatorApply.sub":
    "Six months of mentorship, peer accountability, and warm intros. No pitch deck required — just tell us what you're making and where you're at.",
  "incubatorApply.nameLabel": "Your name *",
  "incubatorApply.namePlaceholder": "First and last",
  "incubatorApply.emailLabel": "Email *",
  "incubatorApply.emailPlaceholder": "you@email.com",
  "incubatorApply.pitchLabel": "What are you building? *",
  "incubatorApply.pitchPlaceholder":
    "A couple of sentences on your idea, where you are, and what you most need help with.",
  "incubatorApply.charsNeeded_one":
    "{count} more character in your pitch to submit.",
  "incubatorApply.charsNeeded_other":
    "{count} more characters in your pitch to submit.",
  "incubatorApply.looksGood":
    "Looks good. Decisions go out within three weeks of the deadline.",
  "incubatorApply.submitCta": "Submit application",

  // ── IncubatorModals: MentorSignupModal ───────────────────────────────────
  "mentorSignup.success.title": "You're on the",
  "mentorSignup.success.em": "list.",
  "mentorSignup.success.body":
    "Thank you, <strong>{name}</strong>. The mentorship team will reach out to match you with a founder whose sector and stage fit what you offer. Mentors meet their match fortnightly across the cohort.",
  "mentorSignup.eyebrow": "Incubator · Mentorship",
  "mentorSignup.title": "Become a <em>mentor.</em>",
  "mentorSignup.sub":
    "Give a few hours a month to a queer founder finding their feet. We match on sector, stage, and the things you actually know.",
  "mentorSignup.nameLabel": "Your name *",
  "mentorSignup.namePlaceholder": "First and last",
  "mentorSignup.emailLabel": "Email *",
  "mentorSignup.emailPlaceholder": "you@email.com",
  "mentorSignup.expertiseLabel": "Where can you help? *",
  "mentorSignup.expertisePlaceholder":
    "e.g. Product, fundraising, legal, hiring",
  "mentorSignup.whyLabel": "Why mentor? *",
  "mentorSignup.whyPlaceholder":
    "A sentence or two on what you'd bring and who you'd most like to support.",
  "mentorSignup.charsNeeded_one": "{count} more character to submit.",
  "mentorSignup.charsNeeded_other": "{count} more characters to submit.",
  "mentorSignup.looksGood":
    "We review every mentor before matching — expect to hear from us soon.",
  "mentorSignup.submitCta": "Sign up to mentor",

  // ── IncubatorModals: RequestSessionModal ─────────────────────────────────
  "requestSession.success.title": "Session",
  "requestSession.success.em": "requested.",
  "requestSession.success.body":
    "Your request reached <strong>{name}</strong>. Mentors reply within a few days to confirm a time — keep an eye on your email, and the intro will come from there.",
  "requestSession.eyebrow": "Incubator · {role}",
  "requestSession.title": "Request a session with <em>{name}.</em>",
  "requestSession.sub":
    "A short note goes a long way. Say what you're working on and when you'd like to meet — {firstName} will reply to set it up.",
  "requestSession.whenLabel": "Preferred time *",
  "requestSession.whenPlaceholder":
    "e.g. Weekday evenings, or Tue/Thu afternoons",
  "requestSession.messageLabel": "What would you like to talk through? *",
  "requestSession.messagePlaceholder":
    "A couple of sentences on where you are and what you'd most like help with.",
  "requestSession.looksGood":
    "Looks good. Mentors usually reply within a few days.",
  "requestSession.sendCta": "Send request",

  // ── companies.data.tsx — structural headings inside each company's About ───
  "company.about.howWeWorkHeading": "How we work",
  "company.about.whatWeLookForHeading": "What we look for",
};

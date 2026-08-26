import type { Catalog } from "../../types";

/**
 * Economy — jobs, mentorship, housing, barter, grants, solidarity
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
    "Tools, mentorship, and solidarity for queer founders, freelancers, and professionals, because economic independence is part of queer liberation.",
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
    "A short application, your idea, where you are, what you need. No pitch deck required. Decisions in 3 weeks.",
  "incubator.step.apply.meta": "Applications open · Deadline 30 Jul",
  "incubator.step.match.title": "Match with a mentor",
  "incubator.step.match.desc":
    "Matched to a community mentor based on your sector, stage, and what you told us you need. You meet fortnightly for six months.",
  "incubator.step.match.meta": "Sep–Feb · Fortnightly sessions",
  "incubator.step.cohort.title": "Cohort sessions",
  "incubator.step.cohort.desc":
    "Monthly workshops with the full cohort, legal, finance, fundraising, design, plus time for peer support and honest conversation.",
  "incubator.step.cohort.meta": "First Saturday of every month",
  "incubator.step.demo.title": "Demo night",
  "incubator.step.demo.desc":
    "Share what you've built with the community, investors, and the press. Low-stakes, high-support. You decide how much to reveal.",
  "incubator.step.demo.meta": "March · Invite-only",

  // ── FreelanceTab (tool grid) ────────────────────────────────────────────
  "freelance.title": "Freelance <em>tools.</em>",
  "freelance.sub":
    "Real, working tools, built by and for queer freelancers in Portugal. Free, no sign-up, and nothing you enter leaves your device.",
  "freelance.section.documents": "Documents that <em>get you paid.</em>",
  "freelance.section.numbers": "Know your <em>numbers.</em>",
  "freelance.section.together": "Stronger <em>together.</em>",

  "tool.invoice.title": "Invoice maker",
  "tool.invoice.desc":
    "Build a clean, Portuguese-correct fatura-recibo, NIF, IVA options, the art. 53.º exemption and art. 101.º-B dispensa notes, and save it as a real PDF. Your details are remembered for next time.",
  "tool.invoice.cta": "Open invoice maker",
  "tool.contract.title": "Contract builder",
  "tool.contract.desc":
    "Assemble a freelance services contract clause by clause, scope, payment, IP, cancellation, confidentiality. Download a PDF or copy the text to edit.",
  "tool.contract.cta": "Open contract builder",
  "tool.scope.title": "Scope & quote builder",
  "tool.scope.desc":
    "Spell out exactly what you're delivering, what you're not, revisions, and timeline. Add a price to turn it into a quote. Export a PDF that prevents most disputes.",
  "tool.scope.cta": "Open scope builder",
  "tool.reciboGuide.title": "Recibos verdes guide",
  "tool.reciboGuide.desc":
    "A plain-language guide to the Portuguese freelance tax system, registering, retention, IVA, Segurança Social, and your first year. Always current.",
  "tool.reciboGuide.cta": "Read the guide",

  "tool.takeHome.title": "Take-home calculator",
  "tool.takeHome.desc":
    "Turn your gross freelance income into what you actually keep, after IRS and Segurança Social, with the regime-simplificado coefficients and your first years built in.",
  "tool.takeHome.cta": "Open calculator",
  "tool.dayRate.title": "Day-rate calculator",
  "tool.dayRate.desc":
    "Work back from the income you need to a day (and hourly) rate that actually sustains you, overhead, unpaid days, and IVA included.",
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
    "Compare what you'd actually take home as a freelancer versus an equivalent salary, net for net, with the costs a payslip hides.",
  "tool.comparator.cta": "Compare",

  "tool.rateBoard.title": "Rate transparency board",
  "tool.rateBoard.desc":
    "Anonymous day rates shared by the community, by role and experience, so nobody has to guess what to charge. Add yours, see where you stand.",
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
    "Nothing's been shared for this sector so far. Clear the filter to see every submission, or add yours to help the next person negotiate.",
  "salary.empty.clear": "Clear filters",
  "salary.emptyLive.title": "The salary board is coming soon",
  "salary.emptyLive.description":
    "Be the first to add an anonymous salary and help the next person walk into their negotiation prepared.",
  "salary.disclaimer":
    "All entries are anonymous. No name, email, or employer is stored. Entries are reviewed by a moderator before appearing.",
  "salary.helpBody":
    "Help the community by sharing what you earn. The more entries, the more useful this becomes for everyone, especially people just starting to negotiate.",
  "salary.submitLong": "Submit your salary",
  "salary.submitToast": "Submitted anonymously. Thank you",

  // ── WorkHubPage ─────────────────────────────────────────────────────────
  "workHub.eyebrow": "Your workspace",
  "workHub.title": "Your work, <em>{name}.</em>",
  "workHub.status.live": "Everything to do with your work, in one place.",
  "workHub.section.needsYou": "What needs you",
  "workHub.section.whereThingsStand": "Where everything stands",
  "workHub.section.profile": "Your work profile",
  "workHub.emptyLive.title": "Your workspace is ready when you are",
  "workHub.emptyLive.description":
    "Apply to a job, find a mentor, or save a role and it'll all come together here. Applications, grants, skills, and reviews in one view.",
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
    "You appear to employers exactly as you choose to, and never otherwise.",
  "workProfile.success.backCta": "Back to your workspace",
  "workProfile.success.editCta": "Keep editing",
  "workProfile.eyebrow": "Work profile",
  "workProfile.title": "How you show up <em>at work.</em>",
  "workProfile.sub":
    "This controls what employers see, and what stays yours. Nothing here is shared without your say-so.",
  "workProfile.saveCta": "Save work profile",
  "workProfile.savingLabel": "Saving…",
  "workProfile.savedToast": "Work profile saved",
  "workProfile.saveFailedToast":
    "We couldn't save that, your settings are still exactly as they were. Try again in a moment.",

  "workProfile.card.meterLabel": "Profile {percent}% complete",
  "workProfile.card.note":
    "This controls how you appear to employers, and what stays yours.",
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
  "workProfile.identity.pronounsWriteOwn": "Write your own",
  "workProfile.identity.pronounsPlaceholder": "e.g. xe/xem",
  "workProfile.identity.pronounsAdd": "Add",
  "workProfile.identity.pronounsRemoveAria": "Remove {pronoun}",
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
    "Applications use your name in use, never a legal name.",
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
    "Queer-run businesses and verified queer-inclusive employers, jobs where you can show up as yourself. No rainbow capitalism. Every listing is vetted by the community.",
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
    "Matched to your work profile, showing <strong>verified-safe employers</strong>.",
  "jobs.safetyBanner.link": "Change in your work profile",
  "jobs.safetyBanner.showVerified": "Show verified only",
  "jobs.safetyBanner.showAll": "Show all",
  "jobs.safetyBanner.showAllCount": "Show all ({count} more)",

  "jobs.empty.title": "No roles match right now",
  "jobs.empty.verifiedDescription":
    "Nothing in this category is verified-safe yet. Show all roles, or pick a different category.",
  "jobs.empty.description":
    "No openings in this category at the moment. Browse every role, or check back soon. Listings are added weekly.",
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
    "Documented trans-inclusive practice: gender-affirming healthcare in the plan, a name/pronoun-change process, and gender-neutral facilities, confirmed by staff reviews.",
  "safetyBadge.out.label": "Safe to be out",
  "safetyBadge.out.blurb":
    'Members rate this employer 8+/10 on "safe to be out at work". Being open about who you are is a non-event here.',
  "safetyBadge.affiliation.run.label": "Queer-run",
  "safetyBadge.affiliation.run.blurb":
    "Led or owned by queer people. Decisions, culture, and money stay inside the community. Verified during vetting, not self-reported.",
  "safetyBadge.affiliation.friendly.label": "Queer-friendly",
  "safetyBadge.affiliation.friendly.blurb":
    "An affirming employer with inclusive policies and a real LGBTQ+ presence, but not queer-led. Welcoming, just not community-owned.",

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
  "jobDetail.sidebar.shareToCommunityCta": "Share to a community",

  // ── ShareToCommunityModal ───────────────────────────────────────────────
  "shareToCommunity.eyebrow": "Pass it on",
  "shareToCommunity.title": "Share to <em>a community.</em>",
  "shareToCommunity.sub":
    "Post this to one of your rooms. It shows up on the room's wall and in the feed, under that community's own rules.",
  "shareToCommunity.communityLabel": "Which community",
  "shareToCommunity.communityPlaceholder": "Choose a community",
  "shareToCommunity.noteLabel": "Say something about it",
  "shareToCommunity.notePlaceholder":
    "Why this might be right for someone here…",
  "shareToCommunity.defaultNote":
    "Sharing this in case it's right for someone here: {title} at {organization}.",
  "shareToCommunity.moderationNote":
    "Posted as you, in that community. Its moderators can edit or remove it like any other post there.",
  "shareToCommunity.noCommunities":
    "You're not in any communities yet. Join one and you'll be able to share things to it.",
  "shareToCommunity.cancel": "Cancel",
  "shareToCommunity.shareCta": "Post it",
  "shareToCommunity.sending": "Posting…",
  "shareToCommunity.errorNotAllowed":
    "You can't post to that community right now. It may be frozen, archived, or you may have left it.",
  "shareToCommunity.errorGone":
    "That community is no longer there. Pick another one.",
  "shareToCommunity.errorFailed":
    "Your post didn't go through. Give it another try in a moment.",
  "shareToCommunity.success.title": "It's",
  "shareToCommunity.success.em": "posted.",
  "shareToCommunity.success.body":
    "Your post is up in <strong>{community}</strong> and in the feed.",
  "shareToCommunity.success.closeLabel": "Done",
  "jobDetail.report.cta": "Report this job",
  "jobDetail.report.ariaLabel": "Report {name}",

  // ── HousingPage / HousingBoard / HousingSections ───────────────────────
  "housing.meta.title": "LGBTQ+ housing and flatmates board in Lisbon",
  "housing.meta.description":
    "Find a room, sublet, or flatmate in Lisbon on QueerPulse's housing board. Browse listings, filter by type, or list your own space.",
  "housing.tabs.housing": "Housing",
  "housing.tabs.flatmates": "Flatmates",
  "housing.hero.eyebrow": "Housing Board · Lisbon",
  "housing.hero.title":
    "Find a home, and the people to <em>share it with.</em>",
  "housing.hero.lead":
    "A queer-specific housing board for Lisbon. Browse spaces to rent, or find a flatmate you can actually be yourself around, all within the community network.",
  "housing.hero.note":
    "Every listing and profile is posted by a verified QueerPulse member",

  "housing.filter.all": "All listings",
  "housing.filter.sublet": "Sublet",
  "housing.filter.room": "Room share",
  "housing.filter.short": "Short-term",
  "housing.filter.studio": "Studio / whole flat",
  "housing.listSpaceCta": "+ List your space",
  "housing.loadMore": "Show more homes",
  "housing.loadingMore": "Loading more homes…",
  "housing.filterBar.area": "Neighbourhood",
  "housing.filterBar.areaAny": "Any neighbourhood",
  "housing.filterBar.areaSelected": "{count} selected",
  "housing.filterBar.areaClear": "Clear neighbourhoods",
  "housing.filterBar.price": "Price (€ / month)",
  "housing.filterBar.min": "Min",
  "housing.filterBar.max": "Max",
  "housing.filterBar.priceMin": "Minimum price",
  "housing.filterBar.priceMax": "Maximum price",
  "housing.filterBar.beds": "Bedrooms",
  "housing.filterBar.bedsAny": "Any",
  "housing.filterBar.bedsStudio": "Studio",
  "housing.filterBar.beds1": "1+",
  "housing.filterBar.beds2": "2+",
  "housing.filterBar.beds3": "3+",
  "housing.filterBar.availableBy": "Available by",
  "housing.filterBar.bills": "Bills included",
  "housing.filterBar.accessibility": "Has access info",
  "housing.filterBar.verified": "Verified only",
  "housing.filterBar.clear": "Clear filters",
  "housing.map.ariaLabel": "Map of listings by neighbourhood",
  "housing.map.error": "The map could not load. Try the list view.",
  "housing.map.count": "{count} homes",
  "housing.map.empty": "No homes match these filters yet.",
  "housing.map.jumpToList": "Jump to {count} homes",
  "housing.map.viewList": "List",
  "housing.map.viewMap": "Map",
  "housing.saveSearch.cta": "Save this search",
  "housing.saveSearch.namePlaceholder": "Name this search",
  "housing.saveSearch.nameLabel": "Name for this saved search",
  "housing.saveSearch.save": "Save",
  "housing.saveSearch.cancel": "Cancel",
  "housing.saveSearch.saved":
    "Search saved. We'll let you know when a home like this comes up.",
  "housing.saveSearch.error":
    "Couldn't save that search. Try again in a moment.",
  "housing.savedSearches.title": "Your saved searches",
  "housing.savedSearches.alertsOn": "Alerts on",
  "housing.savedSearches.remove": "Remove saved search {name}",
  "housing.savedSearches.removed": "Saved search removed",

  "housing.empty.filteredTitle": "No listings of this kind right now",
  "housing.empty.title": "The housing board is quiet right now",
  "housing.empty.filteredDescription":
    "Nothing's posted in this category at the moment. Clear the filter to see every space the community has open. New listings go up often.",
  "housing.empty.description":
    "No spaces are posted yet. When members share sublets, room shares, and short-term stays, they'll show up here. Check back soon, or list a space of your own.",
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
    "Members have vouched for these landlords as queer-friendly, reliable, and fair. Not a guarantee. Always do your own due diligence.",
  "housing.landlords.endorsedBadge": "Community-endorsed",
  "housing.landlords.suggestCta": "Suggest a landlord",
  "housing.landlords.emptyTitle": "No landlords endorsed yet",
  "housing.landlords.emptyBody":
    "Be the first to tell us about one you'd vouch for, queer-friendly, reliable, fair.",

  "housing.tipsHeading": "Housing in Lisbon, <em>what to know</em>",
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
    "Members buying and running homes together, how co-ops form, and how to join one.",

  "housing.outro.title": "Finding home <em>together.</em>",
  "housing.outro.sub":
    "Every listing here comes from someone in the community. List your space, or post what you're looking for. The network moves fast for its own.",
  "housing.outro.listCta": "List your space",
  "housing.outro.askForum": "Ask the forum",

  // ── HousingModals (message the lister / recommend a landlord) ─────────
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
  // Used when we have no measured reply time for this lister: same promise,
  // minus the reply-speed claim we cannot back.
  "housingModal.message.successBodyNoReplyTime":
    "Your message is on its way to <strong>{toName}</strong>. You'll get a notification here when they reply. Contact details are shared once you both agree to take it further.",
  "housingModal.message.eyebrow": "Message the lister",
  "housingModal.message.title": "Message <em>{toName}</em>",
  "housingModal.message.body":
    "About <strong>{listingTitle}</strong>. Keep it human, a sentence about who you are and why it suits you goes a long way. Your profile is shared with the message.",
  "housingModal.message.note":
    "For your safety, keep the conversation on QueerPulse until you've met. Never send a deposit before viewing the place in person.",
  "housingModal.message.send": "Send message",
  "housingModal.message.error":
    "Couldn't send your message. It didn't go through. Check your connection and try again.",
  "housingModal.message.draftNamed":
    'Hi {name}, I\'m interested in "{listingTitle}". Is it still available? A bit about me: ',
  "housingModal.message.draftGeneric":
    'Hi there, I\'m interested in "{listingTitle}". Is it still available? A bit about me: ',

  "housingModal.recommend.ariaLabel": "Recommend a landlord",
  "housingModal.recommend.successTitle": "Thank you. <em>Recorded.</em>",
  "housingModal.recommend.successBody":
    "Your recommendation for <strong>{landlordName}</strong> will appear once a moderator has confirmed you've rented from them. It's how the board stays trustworthy. This is the kind of thing that makes someone's move so much safer.",
  "housingModal.recommend.eyebrow": "Recommend a landlord",
  "housingModal.recommend.title": "Recommend <em>{landlordName}</em>",
  "housingModal.recommend.body":
    "You've rented from them and it went well. Tell other members what to expect, the specific, useful things you wish you'd known.",
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
    "Couldn't submit your recommendation. Check your connection and try again.",

  // ── ListSpaceModal ──────────────────────────────────────────────────────
  "listSpace.type.sublet": "Sublet",
  "listSpace.type.room": "Room share",
  "listSpace.type.short": "Short-term",
  "listSpace.type.studio": "Studio / whole flat",
  "listSpace.success.title": "Listing",
  "listSpace.success.em": "submitted.",
  "listSpace.success.body":
    "Thanks for sharing <strong>{title}</strong>. A moderator checks every listing before it goes live, usually within a day, so the board stays trustworthy for everyone looking for a safe place to land.",
  "listSpace.eyebrow": "Housing board",
  "listSpace.title": "List your <em>space.</em>",
  "listSpace.sub":
    "Open your place to a verified member of the community. Tell people what it's like to live there, add a few photos, and a moderator reads every listing before it reaches the board.",
  "listSpace.titleLabel": "Listing title *",
  "listSpace.titlePlaceholder": "e.g. Sunny room in a queer flatshare",
  "listSpace.areaLabel": "Neighbourhood / area *",
  "listSpace.areaPlaceholder": "e.g. Arroios, Lisbon",
  "listSpace.rentLabel": "Monthly rent (€) *",
  "listSpace.rentPlaceholder": "e.g. 650",
  "listSpace.bedroomsLabel": "Bedrooms",
  "listSpace.bedroomsPlaceholder": "e.g. 1, use 0 for a studio",
  "listSpace.typeLabel": "Type of space *",
  "listSpace.chooseOne": "Choose one…",
  "listSpace.accessLabel": "Getting in and around *",
  "listSpace.accessPlaceholder":
    "e.g. Second floor, no lift, one flight of stairs. Step-free once inside.",
  "listSpace.photoGuide.title": "A few photos go a long way",
  "listSpace.photoGuide.lit":
    "Shoot in daylight, well-lit rooms feel honest and welcoming.",
  "listSpace.photoGuide.rooms":
    "Show more than one room, plus the kitchen and bathroom.",
  "listSpace.photoGuide.consent":
    "Leave housemates' faces out unless they've said it's okay.",
  // ── ListSpaceDetailFields + ListSpacePhotoField (LOC-09) ───────────────
  "listSpace.areaHint":
    "Just the neighbourhood. Every home on this board is in {city}.",
  "listSpace.blurbLabel": "One-line summary",
  "listSpace.blurbPlaceholder":
    "e.g. A double room in a four-person queer flatshare",
  "listSpace.blurbHint":
    "The line people read on the board. Leave it blank and we'll use the opening of your description.",
  "listSpace.descriptionLabel": "About this home",
  "listSpace.descriptionPlaceholder":
    "What the place is like, who else lives there, what the street is like, anything you'd want to know before moving in.",
  "listSpace.descriptionHint":
    "A few honest sentences help more than a long list. This is what people read before they write to you.",
  "listSpace.availableLabel": "Available from",
  "listSpace.availableHint": "Leave it empty if the place is free now.",
  "listSpace.minStayLabel": "Shortest stay (months)",
  "listSpace.minStayPlaceholder": "e.g. 6",
  "listSpace.minStayHint": "Leave it empty if you're open to any length.",
  "listSpace.featuresLabel": "What the place has",
  "listSpace.idealForLabel": "Who it suits",
  "listSpace.idealForHint":
    "Describe the home and the practicalities. Every home here is open to the whole community.",
  "listSpace.photos.label": "Photos",
  "listSpace.photos.hint":
    "Up to {max}. The first one is the photo people see on the board. Location data is removed from every photo before it leaves your device.",
  "listSpace.photos.add": "Add a photo",
  "listSpace.photos.uploading": "Adding…",
  "listSpace.photos.full": "That's all the photos this listing can hold",
  "listSpace.photos.cover": "Cover",
  "listSpace.photos.remove": "Remove photo {position}",
  "listSpace.photos.previewAlt": "Photo {position} of your listing",
  "listSpace.photos.error":
    "Couldn't add that photo. Check your connection and try again.",
  "listSpace.feature.furnished": "Furnished",
  "listSpace.feature.light": "Natural light",
  "listSpace.feature.balcony": "Balcony",
  "listSpace.feature.outdoor": "Outdoor space",
  "listSpace.feature.lift": "Lift",
  "listSpace.feature.washing": "Washing machine",
  "listSpace.feature.dishwasher": "Dishwasher",
  "listSpace.feature.heating": "Heating",
  "listSpace.feature.cooling": "Air conditioning",
  "listSpace.feature.desk": "Desk space",
  "listSpace.feature.bathroom": "Private bathroom",
  "listSpace.feature.kitchen": "Shared kitchen",
  "listSpace.feature.bike": "Bike storage",
  "listSpace.feature.pets": "Pets welcome",
  "listSpace.feature.quiet": "Quiet street",
  "listSpace.ideal.new": "Someone new to Lisbon",
  "listSpace.ideal.longStay": "Long stays",
  "listSpace.ideal.shortStay": "Short stays",
  "listSpace.ideal.wfh": "Working from home",
  "listSpace.ideal.students": "Students",
  "listSpace.ideal.couples": "Couples",
  "listSpace.ideal.pet": "Someone with a pet",
  "listSpace.ideal.quiet": "A quiet household",
  "listSpace.ideal.social": "A sociable household",
  "listSpace.ideal.cyclists": "Cyclists",
  "listSpace.tourLabel": "Virtual tour link",
  "listSpace.tourPlaceholder": "Matterport, a YouTube walkthrough…",
  "listSpace.tourHint":
    "Optional, an https link people can open to look around before they visit.",
  "listSpace.tourError": "That link needs to start with https://",
  "listSpace.billsLabel": "Bills are included in the rent",
  "listSpace.billsHint":
    "Water, power, internet, so people know what they're paying.",
  "listSpace.agentLabel": "I'm listing as an agent or agency",
  "listSpace.agentHint":
    "Agents are welcome here. We just show a small badge so it's clear who's offering the place.",
  "listSpace.note":
    "Listings are reviewed before they appear. Never ask for a deposit before someone has viewed the place in person.",
  "listSpace.submitting": "Submitting…",
  "listSpace.submitCta": "Submit listing",
  "listSpace.error":
    "Couldn't submit your listing. It didn't go through. Check your connection and try again.",

  // ── MyHousingListingsPage (HSG-1/HSG-3) ─────────────────────────────────
  "myHousingListings.entryLink": "My listings",
  "myHousingListings.eyebrow": "Housing board",
  "myHousingListings.title": "My <em>listings.</em>",
  "myHousingListings.sub":
    "Everything you've posted to the housing board, manage it here.",
  "myHousingListings.empty.title": "You haven't listed anything yet",
  "myHousingListings.empty.description":
    "When you list a room, sublet, or share, it'll show up here so you can manage it.",
  "myHousingListings.empty.cta": "List your space",
  "myHousingListings.error.title": "Couldn't load your listings",
  "myHousingListings.error.body":
    "Something went wrong on our end. Check your connection and try again.",
  "myHousingListings.error.retry": "Try again",
  "myHousingListings.status.review": "In review",
  "myHousingListings.status.question": "Needs a reply",
  "myHousingListings.status.live": "Live",
  "myHousingListings.status.filled": "Filled",
  "myHousingListings.status.expired": "Expired",
  "myHousingListings.status.rejected": "Not published",
  "myHousingListings.status.takenDown": "Removed",
  "myHousingListings.decision.question": "A moderator asked for a change",
  "myHousingListings.decision.rejected": "Why this wasn't published",
  "myHousingListings.decision.takenDown": "Why this was removed",
  "myHousingListings.decision.questionHint":
    "Edit the listing with this sorted and it goes back into the queue.",
  "myHousingListings.postedOn": "Posted {date}",
  "myHousingListings.expiresOn": "Expires {date}",
  "myHousingListings.expiredHint": "Expired, extend it to relist",
  "myHousingListings.filledHint": "Marked as filled, hidden from the board",
  "myHousingListings.actions.edit": "Edit",
  "myHousingListings.actions.view": "View listing",
  "myHousingListings.actions.markFilled": "Mark as filled",
  "myHousingListings.actions.markAvailable": "Mark as available",
  "myHousingListings.actions.extend": "Extend",
  "myHousingListings.actions.delete": "Delete",
  "myHousingListings.delete.confirmTitle": "Delete this listing?",
  "myHousingListings.delete.confirmBody":
    "This removes it from the board for good, anyone with the link will get a not-found page. This can't be undone.",
  "myHousingListings.delete.confirmCta": "Delete listing",
  "myHousingListings.toast.filled": "Marked as filled",
  "myHousingListings.toast.available": "Marked as available again",
  "myHousingListings.toast.extended": "Listing extended",
  "myHousingListings.toast.deleted": "Listing deleted",
  "myHousingListings.toast.updated": "Listing updated",
  "myHousingListings.toast.error": "That didn't go through, try again.",
  "myHousingListings.edit.eyebrow": "Housing board",
  "myHousingListings.edit.title": "Edit your <em>listing.</em>",
  "myHousingListings.edit.sub":
    "Your changes save right away and update the board listing.",
  "myHousingListings.edit.submitting": "Saving…",
  "myHousingListings.edit.submitCta": "Save changes",

  // ── SuggestLandlordModal ────────────────────────────────────────────────
  "suggestLandlord.ariaLabel": "Suggest a landlord",
  "suggestLandlord.eyebrow": "Housing board",
  "suggestLandlord.title": "Suggest a <em>landlord.</em>",
  "suggestLandlord.sub":
    "Know someone renting out queer-friendly, actually decent places? Tell us about them, a moderator checks in before they join the board.",
  "suggestLandlord.nameLabel": "Landlord's name *",
  "suggestLandlord.namePlaceholder": "e.g. Mariana Sousa",
  "suggestLandlord.hoodLabel": "Neighbourhood",
  "suggestLandlord.hoodPlaceholder": "e.g. Arroios, Lisbon",
  "suggestLandlord.taglineLabel": "One-line tagline",
  "suggestLandlord.taglinePlaceholder": "e.g. Fair rents, fast repairs",
  "suggestLandlord.noteLabel": "Short note for the board card",
  "suggestLandlord.notePlaceholder": "What should members know at a glance?",
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
  "suggestLandlord.error": "Couldn't send that. Mind trying again?",

  // ── HousingListingPage (+ sections) ────────────────────────────────────
  "housingListing.back": "Housing board",
  "housingListing.section.about": "About this place",
  "housingListing.section.features": "Features",
  "housingListing.section.facts": "The facts",
  "housingListing.section.idealFor": "Ideal for",
  "housingListing.section.accessibility": "Getting in and around",
  "housingListing.section.virtualTour": "Virtual tour",
  "housingListing.virtualTour.frameTitle": "Virtual tour of this home",
  "housingListing.virtualTour.linkNote":
    "Take a look around before you visit. This tour opens in a new tab.",
  "housingListing.virtualTour.openCta": "Open virtual tour",
  "housingGallery.photoAlt": "{title}, photo {index} of {total}",
  "housingGallery.openAt": "Open photos of {title}, photo {index} of {total}",
  "housingGallery.counter": "{index} / {total}",
  "housingGallery.close": "Close photos",
  "housingGallery.prev": "Previous photo",
  "housingGallery.next": "Next photo",
  "housingListing.billsIncluded": "Bills included",
  "housingListing.billsExcluded": "Bills not included",
  "housingListing.agentBadge.label": "Agent listing",
  "housingListing.agentBadge.tooltip":
    "Listed by an agent or agency, not the resident. Agents are welcome. This badge just makes it clear.",
  "housingListing.messageCtaArrow": "Message {name}",
  "housingListing.messageCta": "Message {name}",
  "housingListing.listedBy": "Listed by",

  // ── Identity verification — honest badges + step-up ────────────────────
  "verification.badge.id.label": "ID-verified",
  "verification.badge.id.tooltip":
    "This person completed an external identity check. It confirms who they are. It isn't a safety guarantee or an endorsement.",
  "verification.badge.phone.label": "Phone-verified",
  "verification.badge.phone.tooltip":
    "This person confirmed a phone number. It's a light check. It isn't proof of identity.",
  // ── Affirming pledge (mandatory LGBTQ+ baseline) ───────────────────────
  "affirmingPledge.ariaLabel": "The LGBTQ+ affirming housing pledge",
  "affirmingPledge.title": "Homes where you're <em>affirmed</em>",
  "affirmingPledge.sub":
    "Every home and housemate on QueerPulse is LGBTQ+ affirming, that's the standard here, not an extra. Before you post or reach out, take the pledge.",
  "affirmingPledge.point.affirm":
    "I'll keep homes and housemates affirming, trans, nonbinary, and queer folks are welcome and respected here.",
  "affirmingPledge.point.noHarm":
    "I won't discriminate, out anyone, or misgender.",
  "affirmingPledge.point.report":
    "If a home or person here breaks this, I can report it.",
  "affirmingPledge.cancel": "Not now",
  "affirmingPledge.acceptCta": "Take the pledge",
  "affirmingPledge.accepting": "Saving…",
  "affirmingPledge.error": "Couldn't save the pledge just now. Try again.",
  "affirmingBaseline.badge": "LGBTQ+ affirming",
  "affirmingBaseline.badgeTooltip":
    "Every home and housemate here is LGBTQ+ affirming. That is the baseline for the whole board.",
  "affirmingBaseline.note":
    "Every home and housemate here is LGBTQ+ affirming, that's the <em>standard.</em>",
  "affirmingBaseline.detailNote": "This is the baseline for every home here.",
  // ── Verification requests — submit, track, appeal (Phase 2) ────────────
  "verification.request.ariaLabel": "Request verification",
  "verification.request.title": "Request verification",
  "verification.request.subForm":
    "A moderator reads every request by hand, so tell us a little in your own words. There's no document to upload, ever.",
  "verification.request.levelLabel": "Which level do you need?",
  "verification.request.level.phone.hint":
    "A light check that we can reach you. Enough for most listings.",
  "verification.request.level.id.hint":
    "A fuller check, for the listings and roles that ask for it.",
  "verification.request.contextLabel": "Tell us a bit (optional)",
  "verification.request.contextPlaceholder":
    "A link to your profile elsewhere, or a mutual connection who knows you. Whatever helps a moderator recognise you.",
  "verification.request.contextHint":
    "Your own words are enough. A moderator reads this by hand.",
  "verification.request.submitCta": "Send request",
  "verification.request.submitting": "Sending",
  "verification.request.submitError":
    "Couldn't send your request. Mind trying again?",
  "verification.request.cancel": "Not now",
  "verification.request.sub.pending":
    "A moderator reads requests by hand, so this can take a couple of days. We'll let you know the moment it's decided.",
  "verification.request.sub.in_review":
    "A moderator is looking at this now. We'll let you know the moment it's decided.",
  "verification.request.sub.appealing":
    "Your appeal is with a moderator now. We'll let you know the moment it's decided.",
  "verification.request.sub.rejected":
    "This one needs another step before we can raise your level.",
  "verification.request.statusPill.pending": "Submitted",
  "verification.request.statusPill.in_review": "In review",
  "verification.request.statusPill.appealing": "Appeal in review",
  "verification.request.statusPill.rejected": "Needs another step",
  "verification.request.appealChip": "Appeal",
  "verification.request.yourNote": "Your note",
  "verification.request.moderatorNote": "What the moderator said",
  "verification.request.withdrawCta": "Withdraw request",
  "verification.request.withdrawing": "Withdrawing",
  "verification.request.withdrawnToast": "Request withdrawn.",
  "verification.request.withdrawError":
    "Couldn't withdraw the request. Mind trying again?",
  "verification.request.appealCta": "Appeal this decision",
  "verification.request.appealSending": "Sending appeal",
  "verification.request.appealError":
    "Couldn't send your appeal. Mind trying again?",
  "verification.request.newRequestCta": "Start a new request",
  "verification.request.later": "I'll check back later",
  "verification.request.approved.title": "Your request is",
  "verification.request.approved.em": "approved",
  "verification.request.approved.body":
    "A moderator raised your level. You're all set to try again.",
  "verification.request.approved.continueCta": "Continue",
  "housingListing.availableFrom":
    "Available from {date} · posted by a verified member",
  "housingListing.repliesUsually": "Usually replies <b>{time}</b>",
  "housingListing.staySafe.title": "Stay safe",
  "housingListing.staySafe.body":
    "<b>Never pay a deposit before viewing in person.</b> Keep the conversation on QueerPulse until you've met. If something feels off, the Queer Housing Justice Network can advise.",
  "housingListing.moreOnBoard": "More on the board",
  "housingListing.save": "Save",
  "housingListing.saved": "Saved",
  "housingListing.savedToast": "Saved {title}",
  "housingListing.unsavedToast": "Removed {title} from saved",
  // Fetch-error state (non-404): show a retry rather than silently redirecting.
  "housingListing.error.title": "We couldn't load this place",
  "housingListing.error.body":
    "Something went wrong on our end, not yours. Give it another try in a moment.",
  "housingListing.error.retry": "Try again",

  // ── Verified listing chip (P2.3) ───────────────────────────────────────
  "verifiedListing.label": "Verified listing",
  "verifiedListing.tooltip":
    "The person listing is ID-verified, this listing passed our review, and it raised no red flags. It's a real check, not a safety guarantee, and not an endorsement.",

  // ── Request a viewing (P2.3) ───────────────────────────────────────────
  "housingViewing.request.cta": "Request a viewing",
  "housingViewing.request.myViewingsLink": "Your viewings",
  "housingViewing.request.ariaLabel": "Request a viewing",
  "housingViewing.request.eyebrow": "Request a viewing",
  "housingViewing.request.title": "See it <em>live</em> first",
  "housingViewing.request.body":
    "Arrange a viewing of <strong>{listingTitle}</strong>, over video or in person, before any money is discussed. Seeing the home live is the surest way to know it's real.",
  "housingViewing.request.modeLabel": "How would you like to view it?",
  "housingViewing.request.video": "Video call",
  "housingViewing.request.inPerson": "In person",
  "housingViewing.request.slotOne": "A time that works",
  "housingViewing.request.slotTwo": "Another option (optional)",
  "housingViewing.request.slotPastError":
    "Pick a time that's still ahead of you.",
  "housingViewing.request.slotOrderError":
    "Your second option needs to come after the first.",
  "housingViewing.request.noteLabel": "A note for the lister",
  "housingViewing.request.notePlaceholder":
    "Say hello and mention anything you'd like to see or ask about.",
  "housingViewing.request.safety":
    "A video walk-through or an in-person visit before you pay is the single best way to avoid a housing scam.",
  "housingViewing.request.send": "Send viewing request",
  "housingViewing.request.error":
    "Couldn't send the request. Give it another try in a moment.",
  "housingViewing.request.successTitle": "Viewing <em>requested.</em>",
  "housingViewing.request.successBody":
    "The lister will pick a time or suggest another. You'll find it under Your viewings.",

  // ── Your viewings surface (P2.3) ───────────────────────────────────────
  "housingViewing.list.back": "Housing board",
  "housingViewing.list.title": "Your <em>viewings</em>",
  "housingViewing.list.sub":
    "Everywhere you've asked to view a home, and every request to see yours. Accept a time, suggest another, or leave a review once you've met.",
  "housingViewing.list.empty":
    "No viewings yet. When you request one from a listing, it'll show up here.",
  "housingViewing.list.group.needsResponse": "Waiting on you",
  "housingViewing.list.group.upcoming": "Upcoming",
  "housingViewing.list.group.past": "Past",
  "housingViewing.list.withLister": "With {name}",
  "housingViewing.list.fromEnquirer": "From {name}",
  "housingViewing.list.video": "Video",
  "housingViewing.list.inPerson": "In person",
  "housingViewing.list.someone": "someone",
  "housingViewing.list.acceptAt": "Accept {time}",
  "housingViewing.list.propose": "Propose other times",
  "housingViewing.list.decline": "Decline",
  "housingViewing.list.waiting": "Waiting for {name} to reply",
  "housingViewing.list.cancel": "Cancel",
  "housingViewing.list.markCompleted": "Mark as done",
  "housingViewing.list.leaveReview": "Leave a review",
  "housingViewing.status.requested": "Requested",
  "housingViewing.status.accepted": "Accepted",
  "housingViewing.status.declined": "Declined",
  "housingViewing.status.cancelled": "Cancelled",
  "housingViewing.status.completed": "Completed",

  // ── Propose alternative times ──────────────────────────────────────────
  "housingViewing.propose.ariaLabel": "Propose other times",
  "housingViewing.propose.title": "Propose other times",
  "housingViewing.propose.body":
    "Suggest one or two times that suit you better. They'll be able to accept one.",
  "housingViewing.propose.send": "Send new times",

  // ── Blind review after a completed viewing (P2.4) ──────────────────────
  "housingViewing.review.ariaLabel": "Leave a review",
  "housingViewing.review.eyebrow": "After the viewing",
  "housingViewing.review.title": "How was it with <em>{name}?</em>",
  "housingViewing.review.body":
    "Reviews are two-sided and blind: neither of you sees the other's words until you've both written, so no one's review is swayed by the other's.",
  "housingViewing.review.ratingLabel": "Your rating",
  "housingViewing.review.whatWasItLike": "What was it like?",
  "housingViewing.review.placeholder":
    "Was the home as described? Were they easy to deal with? Honest, kind detail helps the next person.",
  "housingViewing.review.blindNote":
    "Your review stays hidden from them until they've left theirs too, or after two weeks, whichever comes first.",
  "housingViewing.review.submit": "Submit review",
  "housingViewing.review.error":
    "Couldn't submit your review. Give it another try in a moment.",
  "housingViewing.review.successTitle": "Review <em>saved.</em>",
  "housingViewing.review.successBody":
    "Thank you. It stays private until <strong>{name}</strong> leaves theirs, or two weeks pass.",

  // ── Reviews block on the listing (P2.4) ────────────────────────────────
  "housingViewing.reviews.heading": "Reviews",
  "housingViewing.reviews.empty":
    "No reviews yet. They appear here once members have viewed this home and shared how it went.",
  "housingViewing.reviews.outOf": "out of 5",
  "housingViewing.reviews.count_one": "{count} review",
  "housingViewing.reviews.count_other": "{count} reviews",
  "housingViewing.reviews.anonymous": "A member",
  "housingViewing.reviews.ratingAria_one": "{count} star",
  "housingViewing.reviews.ratingAria_other": "{count} stars",

  // ── ReportListingModal ─────────────────────────────────────────────────
  "housingListing.report": "Report",
  "housingListing.reportAriaLabel": "Report {title}",
  "housingListing.reportModal.ariaLabel": "Report",
  "housingListing.reportModal.eyebrow": "Report to our team",
  "housingListing.reportModal.title": "What's wrong with <em>{title}?</em>",
  "housingListing.reportModal.lead":
    "Reports help us keep QueerPulse trustworthy. Tell us what's going on, specifics help the review team. Your name is never shared with whoever you're reporting.",
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
  "housingListing.reportModal.success.equalityPointer":
    "Housing discrimination is also something you can raise with a national equality body. You don't have to choose. Reporting it here helps us act on the platform.",
  "housingListing.reportModal.doneCta": "Done",
  "housingListing.reportModal.error":
    "Couldn't send your report. It didn't reach us. Check your connection and try again.",

  // ── ContactRequestModal (shared "reach out" flow) ──────────────────────
  "contactRequest.defaultTitle": "Send a",
  "contactRequest.defaultEm": "request.",
  "contactRequest.defaultSuccessTitle": "Request",
  "contactRequest.defaultSuccessEm": "sent.",
  "contactRequest.defaultSendLabel": "Send request",
  "contactRequest.defaultSendingLabel": "Sending…",
  "contactRequest.defaultSuccessBody":
    "Your message is on its way to <strong>{firstName}</strong>. They'll reply straight to your inbox here. Contact details are shared once you both agree to take it further.",
  "contactRequest.messageLabel": "Your message *",
  "contactRequest.messagePlaceholder":
    "A sentence about who you are and what you're hoping for goes a long way.",
  "contactRequest.charsNeeded_one":
    "{count} more character so they have context.",
  "contactRequest.charsNeeded_other":
    "{count} more characters so they have context.",
  "contactRequest.looksGood":
    "Looks good. Keep the conversation here until you both decide to take it further.",
  "contactRequest.cancel": "Cancel",
  "contactRequest.done": "Done",
  "contactRequest.sendError": "Couldn't send that. Mind giving it another try?",

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
    "Your recommendation is what makes this list trustworthy, and what makes someone else's move so much safer. It takes two minutes.",
  "landlordPage.sidebar.recommendCta": "Recommend this landlord",
  "landlordPage.sidebar.howToRent": "How to rent from them",
  "landlordPage.sidebar.requestIntro": "Request an introduction",
  "landlordPage.toast.recommended_one":
    "Recommendation submitted, {count} star",
  "landlordPage.toast.recommended_other":
    "Recommendation submitted, {count} stars",
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
    "We've passed your note to <strong>{firstName}</strong>. If they have something that fits, they'll reach out here, no pressure either way.",
  "landlordPage.intro.sendLabel": "Request introduction",
  "landlordPage.intro.fallbackName": "A member",
  "landlordPage.save": "Save",
  "landlordPage.saved": "Saved",
  "landlordPage.savedToast": "Saved {name}",
  "landlordPage.unsavedToast": "Removed {name} from saved",
  "landlordPage.report": "Report",
  "landlordPage.reportAriaLabel": "Report {name}",

  // ── ModalKit (shared modal shell + success panel used across Economy) ──
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
  "flatmates.loadMore": "Show more people",
  "flatmates.loadingMore": "Loading more people…",
  "flatmates.postProfileCta": "Post your profile",

  "flatmates.empty.title": "The flatmate board is quiet right now",
  "flatmates.empty.description":
    "No profiles are posted yet. When members share what they're looking for, a room, a flatmate, a neighbourhood, a budget, they'll show up here. Check back soon, or post a profile of your own.",
  "flatmates.empty.filteredTitle": "No profiles match those filters",
  "flatmates.empty.filteredDescription":
    "No one fits that exact combination right now. Try widening your filters, or post your own profile and let the right flatmate find you.",
  "flatmates.empty.clearFilters": "Clear filters",

  "flatmates.outro.title": "A home where <em>you belong.</em>",
  "flatmates.outro.sub":
    "The right flatmate can make a city feel like home. Take your time, trust your gut, and use the community.",
  "flatmates.outro.askForum": "Ask the forum",

  "flatmates.card.memberSince": "Member since {date}",
  "flatmates.card.sayHello": "Say hello",
  "flatmates.card.helloSent": "Hello sent",
  "flatmates.card.sayHelloError":
    "Couldn't send your hello. Try again in a moment.",
  "flatmates.card.matchScore": "{score}% match",
  "flatmates.card.save": "Save",
  "flatmates.card.saved": "Saved",
  "flatmates.card.savedToast": "Saved {name}'s profile",
  "flatmates.card.unsavedToast": "Removed {name}'s profile from saved",
  "flatmates.card.reportAriaLabel": "Report {name}'s profile",
  "flatmates.card.safeSpaceLabel": "Safe-space needs",
  "flatmates.card.householdLabel": "Household",
  "flatmates.card.whyMatched": "Why you matched",

  // Explainable match factors — the UI maps each reason's stable `factor` key
  // here. Kept generic and warm; the backend redacts safe-space specifics for
  // viewers who aren't permitted to see them.
  "flatmates.reason.budget": "Budget fits",
  "flatmates.reason.neighbourhood": "Same neighbourhood",
  "flatmates.reason.lifestyle": "Shared lifestyle",
  "flatmates.reason.timing": "Timing lines up",
  "flatmates.reason.safeSpace": "Shared safe-space values",
  "flatmates.reason.household": "Household basics agree",

  // ── PostProfileModal / PostProfileForm ─────────────────────────────────
  "postProfileModal.ariaLabel": "Post your flatmate profile",
  "postProfileModal.error":
    "Couldn't save your profile. Mind giving it another try?",
  "postProfileModal.success.title": "You're on the <em>board.</em>",
  "postProfileModal.success.body":
    "Your profile is live. Members will reach out directly. Keep an eye on your QueerPulse messages.",
  "postProfileModal.success.backCta": "Back to profiles",

  "postProfileForm.title": "Post your profile",
  "postProfileForm.sub":
    "Takes about two minutes. Your profile goes live straight away, members reach out directly, no matching algorithm.",
  "postProfileForm.lookingForLabel": "What are you looking for?",
  "postProfileForm.seekingDesc": "You're looking for a room in a flat or house",
  "postProfileForm.offeringDesc": "You have a room or flat share to offer",
  "postProfileForm.pronounsLabel": "Pronouns (optional)",
  "postProfileForm.pronounsPlaceholder": "e.g. she/her, they/them",
  "postProfileForm.pronounsWriteOwn": "Write your own",
  "postProfileForm.pronounsAdd": "Add",
  "postProfileForm.pronounsRemoveAria": "Remove {pronoun}",
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
    "Tell people a bit about yourself, your rhythm, your work, what kind of home makes you feel good. No need to sell yourself; just be honest.",
  "postProfileForm.lifestyleTagsLabel": "Lifestyle tags",
  "postProfileForm.submitCta": "Post profile",

  // ── Household norms (optional, ordinary preferences) ────────────────────
  "postProfileForm.householdLabel": "Household (optional)",
  "postProfileForm.householdHint":
    "A few shared-living basics, if you'd like people to know them up front.",
  "postProfileForm.householdNoPreference": "No preference",
  "postProfileForm.household.smoking": "Smoking",
  "postProfileForm.household.pets": "Pets",
  "postProfileForm.household.guests": "Guests",
  "postProfileForm.household.cleanliness": "Cleanliness",
  "postProfileForm.household.sleepSchedule": "Sleep schedule",
  "postProfileForm.household.noise": "Noise",
  "postProfileForm.household.sharing": "Shared vs private space",

  // ── Identity & safe space (GDPR Art.9, opt-in) ──────────────────────────
  "postProfileForm.identityLabel": "Identity & safe space",
  "postProfileForm.identityHint":
    "All optional. Share only what helps you feel at home. You choose who sees it, and you can take it back whenever you like.",
  "postProfileForm.consentLabel":
    "Yes, store my pronouns, gender, and safe-space needs, and show them to the flatmates I choose below so we can find each other. You're in control: clear them <em>anytime.</em>",
  "postProfileForm.genderLabel": "Gender (optional)",
  "postProfileForm.genderPlaceholder": "e.g. non-binary, trans woman",
  "postProfileForm.safeSpaceLabel": "What makes a home feel safe",
  "postProfileForm.safeSpaceHint":
    "Pick what matters to you. These name what you're looking for in a home, never who's welcome.",
  // Trans-affirming household prompts (Art.9, inside the consent gate).
  "postProfileForm.identityHousehold.label": "Living as yourself at home",
  "postProfileForm.identityHousehold.hint":
    "All optional, and only ever seen by the people you choose. Share what would help a home feel like yours.",
  "postProfileForm.identityHousehold.outAtHome": "Being out at home",
  "postProfileForm.identityHousehold.bathroom": "Sharing a bathroom",
  "postProfileForm.identityHousehold.mailName": "Name on post & deliveries",
  "postProfileForm.identityHousehold.medication": "Privacy around medication",

  "postProfileForm.visibilityLabel": "Who can see these",
  "postProfileForm.visibility.public": "Anyone on the board",
  "postProfileForm.visibility.members": "Any member",
  "postProfileForm.visibility.matches": "Only people I could share a home with",
  "postProfileForm.visibility.hidden": "Only me",

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
    "Following {name}. You'll hear about new roles",
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
    "Thank you, your review of {companyName} is live. {companyName} can't edit or remove what you wrote.",
  "companyReview.title": "What was it <em>actually like?</em>",
  "companyReview.sub":
    "Your honest account helps the next queer person decide whether to take the interview. Verified by membership.",
  "companyReview.headlineLabel": "Headline",
  "companyReview.headlinePlaceholder": "Sum it up in a line",
  "companyReview.roleLabel": "Your role / tenure",
  "companyReview.rolePlaceholder": "e.g. Designer, 2 years in role",
  "companyReview.prosLabel": "What worked, the good",
  "companyReview.prosPlaceholder":
    "Pronouns respected, real inclusion, leadership that gets it…",
  "companyReview.consLabel": "What was hard, the rest",
  "companyReview.consPlaceholder": "Where the follow-through fell short…",
  "companyReview.missingHint": "Fill in {fields} to unlock the button.",
  "companyReview.missing.company": "a company",
  "companyReview.missing.headline": "a headline",
  "companyReview.missing.rating": "a star rating",
  "companyReview.missing.role": "your role",
  "companyReview.missing.prosOrCons": "what worked or what was hard",
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
    "Anonymous reviews of Lisbon companies by LGBTQ+ employees. Beyond the Pride logo, what it's actually like to be out there, behind closed office doors.",

  "employerReviews.how.title": "How it <em>works</em>",
  "employerReviews.how.sub":
    "Anonymous, verified by membership, not editable by employers.",
  "employerReviews.how.write.title": "Write anonymously",
  "employerReviews.how.write.desc":
    "Your identity is never attached to your review. We verify you're a member. Nothing else is logged.",
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
    "Queer-run means led or owned by queer people. Queer-friendly is affirming but not community-led. We never conflate the two.",
  "employerReviews.verify.confidence.label": "Confidence in the score",
  "employerReviews.verify.confidence.desc":
    "Every score shows how many reviews it rests on. More reviews, more confidence, a 9 from 3 people is not a 9 from 30.",

  "employerReviews.write.title": "Write a <em>review.</em>",
  "employerReviews.write.body":
    "You've been there. You know what it was actually like. Your review helps the next queer person decide whether to take that interview. It takes 5 minutes and is completely anonymous.",
  "employerReviews.write.note":
    "Members only · anonymous · your identity is never stored with your review",
  "employerReviews.write.rulesTitle": "Our review principles",
  "employerReviews.write.rule.anonymous":
    "Reviews are anonymous, your name is never attached",
  "employerReviews.write.rule.verifyMembership":
    "We verify you're a QueerPulse member, nothing more",
  "employerReviews.write.rule.noEdit":
    "Employers cannot edit, remove, or respond to reviews",
  "employerReviews.write.rule.moderation": "We moderate for factual accuracy",
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
    "Thank you, your anonymous review of {company} is live. Your name is never stored with it, and {company} can't edit or remove what you wrote.",

  // ── GrantsPage (+ Sections / Sidebar) ───────────────────────────────────
  // Scope note: grant/fellowship listings in grants.data.tsx (names, orgs,
  // amounts, descriptions) are a curated directory of real external funding
  // programmes — informational content, not platform chrome. In live mode
  // this would be a fetched/maintained directory. Left in English.
  "grants.hero.eyebrow": "Grants & Funding",
  "grants.hero.title": "Money for <em>queer work.</em>",
  "grants.hero.lead":
    "Community-curated guide to grants, fellowships, and funding for LGBTQ+ individuals and organisations, in Portugal and across Europe. Maintained by members who've successfully applied.",
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
  "grants.section.pt": "<em>Portugal</em>, national programmes",
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
    "We're building a live, community-maintained feed of grants and fellowships for queer work. Check back soon, or apply for one of our Micro Grants in the meantime.",

  "grants.guide.title": "Writing a <em>strong application</em>",
  "grants.guide.sub":
    "Advice from community members who've successfully secured grants, from micro to major.",
  "grants.guide.step.criteria.title": "Read the criteria twice",
  "grants.guide.step.criteria.body":
    "Most rejections are from applications that technically fit but don't mirror the funder's language. Map your project onto their specific wording.",
  "grants.guide.step.story.title": "Tell a specific story",
  "grants.guide.step.story.body":
    "Funders read hundreds of applications. A single specific, human story of impact will land better than broad claims.",
  "grants.guide.step.community.title": "Show your community",
  "grants.guide.step.community.body":
    "Queer-focused funders want to see the community embedded as participants and decision-makers.",
  "grants.guide.step.review.title": "Ask for a review",
  "grants.guide.step.review.body":
    "Before submitting, ask someone not involved to read your application. Fresh eyes catch the assumptions you've stopped seeing.",

  "grants.outro.title": "Your project <em>deserves support.</em>",
  "grants.outro.sub":
    "Found something that fits? Apply with confidence, and if you land it, pay it forward by adding the opportunity for the next member.",
  "grants.outro.cta": "See open grants",

  "grants.subpages.title": "Also in grants",
  "grants.subpages.microGrants.label": "Micro Grants",
  "grants.subpages.microGrants.blurb":
    "Small, fast community grants, apply in minutes.",

  "grants.sidebar.microGrants.title": "Our <em>Micro Grants</em>",
  "grants.sidebar.microGrants.body":
    "QueerPulse runs its own micro grant programme (€200–€2,000) for community projects in Lisbon. Faster and simpler than most external grants.",
  "grants.sidebar.microGrants.cta": "Apply now",
  "grants.sidebar.skillsExchange.title": "Skills Exchange",
  "grants.sidebar.skillsExchange.body":
    "If you need support but grants feel too formal, the barter board connects members who can swap skills, no money involved.",
  "grants.sidebar.skillsExchange.cta": "Explore the exchange",
  "grants.sidebar.appHelp.title": "Get <em>application help</em>",
  "grants.sidebar.appHelp.body":
    "Members with grant-writing experience offer one-to-one support through mentorship.",
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
  // Icon-style identity-field initials (Website / Instagram / QueerPulse
  // profile) — brand/proper-noun abbreviations, identical in both languages.
  "jobApply.identityIg": "IG",
  "jobApply.instagramPlaceholder": "@yourhandle",
  "jobApply.identityQp": "QP",

  "jobApply.whyTitle": "Why this role?",
  "jobApply.whySub":
    "Two short paragraphs is more than enough. Be specific, what about {org}, and what you'd bring.",
  "jobApply.coverNote": "Cover note",
  "jobApply.charCount": "{used} / {max}",
  "jobApply.coverPlaceholder":
    "What drew you to this role? What are you good at? What are you hoping to grow into?",
  "jobApply.availableFrom": "Available from",
  "jobApply.salaryExpectation": "Salary expectation",
  "jobApply.salaryHelper":
    "Posted range is {salary}. You can name a number outside this, they'll consider.",
  "jobApply.salaryPlaceholder": "e.g. €1,400/mo, or open",

  "jobApply.extraTitle": "One thing extra",
  "jobApply.extraOptional": " (optional)",
  "jobApply.extraSub":
    "Anything else you'd like {org} to know? Working hours, access needs, references, whatever's relevant.",
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
    "Sent to {org} for the {title} role. Nothing else to do right now, the ball's in their court.",

  "jobApply.toast.draftSaved":
    "Draft saved, picks back up whenever you're ready.",
  "jobApply.error.missingFields": "Add your name and email before sending.",
  "jobApply.error.alreadyApplied":
    "You've already applied to this role. Check your applications.",
  "jobApply.error.generic":
    "We couldn't send your application. Please try again.",

  "jobApply.availability.now.title": "Immediately",
  "jobApply.availability.now.desc": "Ready now",
  "jobApply.availability.soon.title": "In 2–4 weeks",
  "jobApply.availability.soon.desc": "Notice period",
  "jobApply.availability.later.title": "In 1–3 months",
  "jobApply.availability.later.desc": "Wrapping up",

  "jobApply.tip.autocorrect":
    "Triple-check your cover note, autocorrect loves rewriting “queer”.",
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
    "A structured barter board, skills for skills, expertise for expertise. No money, no platform fees. Post what you can offer and what you're hoping for in return.",
  "barter.principle.noMoney.title": "No money",
  "barter.principle.noMoney.body":
    "Every exchange is peer-to-peer. The people involved set the value between them.",
  "barter.principle.reputation.title": "Reputation-backed",
  "barter.principle.reputation.body":
    "Offers come from verified members. Your community vouch is your credit history.",
  "barter.principle.wants.title": "What you want matters",
  "barter.principle.wants.body":
    "Post what you're looking for, as much as what you can give. Needs are as welcome as offers.",

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
  "barter.card.yoursCta": "Your swap",
  "barter.toast.messageSent": "Message sent to {name}",
  "barter.postedToday": "Today",
  "barter.postedDaysAgo_one": "{count} day ago",
  "barter.postedDaysAgo_other": "{count} days ago",

  "barter.empty.title": "Nothing matches your filters",
  "barter.empty.description":
    "No swaps fit that combination just yet. Try broadening your search, or post what you're offering and let the right trade find you.",
  "barter.empty.clearFilters": "Clear filters",
  "barter.emptyLive.title": "No swaps posted yet",
  "barter.emptyLive.description":
    "Be the first to offer a skill or item, put something on the table below and let the right trade find you.",
  "barter.errorLive.title": "The exchange didn't load",
  "barter.errorLive.description":
    "Something went wrong on our side while fetching the board. Give it another try in a moment.",
  "barter.errorLive.retry": "Try again",

  "barter.postStrip.success.title": "It's <em>on the table.</em>",
  "barter.postStrip.success.body":
    "Your swap is live at the top of the board. We'll let you know when someone proposes an exchange.",
  "barter.postStrip.success.postAnother": "Post another",
  "barter.postStrip.title": "Put something <em>on the table.</em>",
  "barter.postStrip.body":
    "Every exchange starts with a post. Tell the community what you can offer and what you're hoping for in return.",
  "barter.postStrip.offerPlaceholder":
    "I can offer, e.g. Portuguese lessons, logo design…",
  "barter.postStrip.wantPlaceholder":
    "I'm looking for, e.g. tax advice, moving help…",
  "barter.postStrip.categoryLabel": "Category",
  "barter.postStrip.categoryPlaceholder": "Pick a category",
  "barter.postStrip.submitCta": "Post to the exchange",
  "barter.postStrip.submitting": "Posting…",
  "barter.postStrip.errorInvalid":
    "Check both lines and the category, then try again.",
  "barter.postStrip.errorFailed":
    "Your swap didn't post. Give it another try in a moment.",
  "barter.postStrip.namePlaceholder": "You",
  "barter.postStrip.hoodPlaceholder": "Your post",
  "barter.postStrip.detailPlaceholder":
    "Posted just now, message to start the exchange.",
  "barter.postStrip.tagNew": "new",
  "barter.postStrip.tagYourPost": "your post",

  "barter.outro.title": "Skills are <em>the currency.</em>",
  "barter.outro.sub":
    "QueerPulse Barter is open to all members. The more you offer, the more you can ask for.",
  "barter.outro.cta": "Join the network",

  // ── BarterDetailPage (+ ProposeCard / QuestionModal) ────────────────────
  "barterDetail.back": "Skill exchange",
  "barterDetail.goneLive.title": "This swap is gone",
  "barterDetail.goneLive.description":
    "The post was taken off the board, or it's no longer available to you. Have a look at what else is on the exchange.",
  "barterDetail.emptyLive.cta": "Back to skill exchange",
  "barterDetail.sub.offering":
    "On offer to the community, swap it for something they need.",
  "barterDetail.sub.seeking":
    "Looking for this, and offering something in return.",
  "barterDetail.sub.both":
    "Offering one thing, looking for another. Propose a swap that works for you both.",
  "barterDetail.locationWithHood": "{hood} · Lisbon",
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
    "You shape the swap together, scope, timing, format. No money changes hands.",
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
  "barterDetail.propose.lead": "No money, <em>just a trade.</em>",
  "barterDetail.propose.placeholder":
    "Tell {firstName} what you'd offer in return, and why this swap works for you.",
  "barterDetail.propose.sendCta": "Send proposal",
  "barterDetail.propose.askFirst": "Ask a question first",
  "barterDetail.propose.footNote":
    "Nothing is agreed until you both say yes. Swaps are between members, QueerPulse never takes a cut.",
  "barterDetail.propose.footNoteLive":
    "Your proposal goes straight to their inbox, so you can carry on the conversation there. Nothing is agreed until you both say yes.",
  "barterDetail.propose.errorEmpty": "Add a line about what you'd trade.",
  "barterDetail.propose.toastSent": "Swap proposed to {name}.",
  "barterDetail.propose.sending": "Sending…",
  "barterDetail.propose.alreadySent":
    "You already have a proposal with {firstName}. Anything you send now lands as a follow-up.",
  "barterDetail.propose.errorAlreadySent":
    "You already have a proposal on this swap. Carry on in your messages.",
  "barterDetail.propose.errorNotAllowed":
    "You can't propose a swap here. It may be your own post, or you and this member can't reach each other.",
  "barterDetail.propose.errorGone":
    "This swap is gone. Have a look at what else is on the exchange.",
  "barterDetail.propose.errorFailed":
    "Your proposal didn't send. Give it another try in a moment.",
  "barterDetail.propose.yoursTitle": "This is your swap",
  "barterDetail.propose.yoursLead":
    "Proposals from other members land in your inbox. Reply there to set up the trade.",

  "barterQuestion.eyebrow": "Before you propose",
  "barterQuestion.title": "Ask <em>{firstName}</em> a question.",
  "barterQuestion.sub":
    "Not ready to propose a swap yet? Ask what you need to know first, timing, what they're after, how it'd work. Friendly and low-pressure.",
  "barterQuestion.fieldLabel": "Your question *",
  "barterQuestion.placeholder":
    "Hi {firstName}, quick question before I propose a swap…",
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
    "Your question is on its way to <strong>{name}</strong>. No swap is agreed until you both say yes. This is just a chat to see if it could work. You'll get a notification here when they reply.",

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
    "To keep the job board trustworthy, only members affiliated with a company can post roles. Affiliate yours to continue. It takes a moment.",
  "postJob.gate.affiliateCta": "Affiliate your company",
  "postJob.gate.backCta": "Back to the board",
  "postJob.gate.point1":
    "We confirm employers are genuinely queer-inclusive, in practice as well as on paper.",
  "postJob.gate.point2":
    "Roles post as your verified company, with its logo and badge.",
  "postJob.gate.point3": "No placement fees. This is a community board.",

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
    "The shape of the role. Pick the closest fit.",
  "postJob.step1.locationPlaceholder":
    "e.g. Arroios, Lisbon, or a neighbourhood / district",
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
    "Describe the work, who it's for, and what success looks like. Write as you'd explain it to a member at an event.",
  "postJob.step2.descriptionError": "Add a description.",
  "postJob.step2.charsCount_one": "{count} char",
  "postJob.step2.charsCount_other": "{count} chars",
  "postJob.step2.timelineTitle": "Timeline",
  "postJob.step2.applyBy": "Apply by",
  "postJob.step2.startDate": "Start date",
  "postJob.step2.startDatePlaceholder": "e.g. ASAP, June, flexible",

  "postJob.step3.eyebrow": "Step 3 of 5",
  "postJob.step3.title": "Pay <em>& perks</em>",
  "postJob.step3.sub": "Transparency is a community value here, and it works.",
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
    "Trade skills instead of (or alongside) money, a first-class option on QueerPulse.",
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
    "Roles are posted as your verified company. This is what keeps the board trustworthy.",
  "postJob.step4.verifiedEmployerAria": "Verified employer",
  "postJob.step4.notYou": "Not you?",

  "postJob.skills.title": "Skills",
  "postJob.skills.sub":
    "Add from the shared list so members can match & filter, free text works too.",
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
  "postJob.step5.dash": "Not set",
  "postJob.step5.notSpecified": "Not specified",
  "postJob.step5.questionCount_one": "{count} question",
  "postJob.step5.questionCount_other": "{count} questions",
  "postJob.step5.editCta": "Edit",
  "postJob.step5.agreement":
    "I confirm this listing follows the <link>Code of Care</link>, no discrimination on identity, and pay that's fair. <strong>QueerPulse is a solidarity space, not an exploitation channel.</strong>",

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
    "Listings <strong>expire after 60 days</strong>, reminder at 45.",
  "postJob.sidebar.point3":
    "<strong>No placement fees.</strong> A community board, run by members.",
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
    "Replies land in one place, review, message, or mark as filled from your listing manager.",
  "postJob.confirm.responses.openManager": "Open listing manager",
  "postJob.confirm.share.title": "Share it",
  "postJob.confirm.share.body":
    "Copy the link and put it where your people already are.",
  "postJob.confirm.share.copyLink": "Copy link",
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
    "You're navigating something, a career transition, a creative block, coming out professionally, a difficult workplace, a new city. You'd benefit from talking to someone who's been through it.",
  "mentorship.choose.mentee.for":
    "For: anyone at any stage who could use some guidance",
  "mentorship.choose.mentor.title": "I can be a mentor",
  "mentorship.choose.mentor.desc":
    "You've been through enough to have something to offer. You don't need to be an expert. You just need to have navigated something that someone else is currently navigating.",
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
    "No upfront cost. Mentorship here is member-to-member. You can always ask a question before committing.",
  "mentorDetail.sidebar.notSureYet": "Not sure yet?",
  "mentorDetail.sidebar.askQuestion": "Message {firstName} a question",
  "mentorDetail.sidebar.browseAll": "Browse all mentors",

  // ── ApplicationStatusPage (+ header/list/card, listing-manager modals) ──
  // Scope note: application content in applicationStatus.data.tsx (job
  // titles, company names, stage hints, status blurbs, thread messages,
  // offers, notes) is this member's own tracked-application history — in
  // live mode fetched from the API — left in English. Only reusable
  // page/modal chrome is translated below. Negotiation "angle" draft text in
  // .patches.tsx is left English too (flagged in the sweep report —
  // persuasive composed copy too nuanced to sweep safely); the
  // lever/principle labels and angle names/blurbs around it are generic and
  // reusable, so they're translated. The `*Patch()` functions' own status
  // lines (below, `applicationStatus.patch.*`) are generated client-side the
  // instant a member takes an action (withdraw/follow up/submit/accept/
  // decline) — never fetched — so unlike the APPS fixture's per-application
  // blurbs, they ARE chrome and are translated.
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
  "applicationStatus.legend.done": "Done. This step is complete",
  "applicationStatus.legend.active": "You are here, current step",
  "applicationStatus.legend.upcoming": "Upcoming, not started yet",
  "applicationStatus.legend.closed": "Closed, ended or withdrawn",

  "applicationStatus.group.offers.title": "Offers, your decision",
  "applicationStatus.group.inProgress.title": "In progress",
  "applicationStatus.group.drafts.title": "Drafts",
  "applicationStatus.group.drafts.hint":
    "Unfinished, wrap these up before they close.",
  "applicationStatus.group.closedWithdrawn.title": "Closed & withdrawn",
  "applicationStatus.group.closedWithdrawn.hint":
    "No action needed, kept for your records.",
  "applicationStatus.compareOffersCta": "Compare offers",

  "applicationStatus.empty.title": "No applications yet",
  "applicationStatus.empty.description":
    "When you apply to a job, grant, or opportunity, you'll be able to track every one, and compare offers side by side, right here.",
  "applicationStatus.empty.browseCta": "Browse jobs",

  "applicationStatus.error.title": "We couldn't load your applications",
  "applicationStatus.error.description":
    "Something went wrong fetching your applications. Give it a moment and try again. Nothing you've sent is lost.",

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
    "Sent to the company. You'll see updates here as they respond.",
  "applicationStatus.live.status.reviewing":
    "The company is reading your application now.",
  "applicationStatus.live.status.accepted":
    "Great news, your application was accepted.",
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

  // State-transition status lines rendered by applicationStatus.patches.tsx
  // right after the member takes an action — see the scope note above.
  "applicationStatus.patch.withdrawn":
    "You withdrew this application just now. The company has been notified politely.",
  "applicationStatus.patch.followedUp":
    "<b>Follow-up sent just now.</b> They've been nudged gently. You'll usually hear back within a couple of days.",
  "applicationStatus.patch.submitted":
    "Submitted just now. Their stated turnaround is 7 days. We'll watch the clock for you.",
  "applicationStatus.patch.accepted":
    "<b>Offer accepted.</b> They'll send the contract to your email within two working days.",
  "applicationStatus.patch.declined":
    "You declined this offer. They've been thanked warmly on your behalf.",

  "msg.message.title": "Message the",
  "msg.message.em": "recruiter.",
  "msg.message.sub":
    "Goes straight to their inbox, no read receipts, no algorithm in between.",
  "msg.followup.title": "Send a",
  "msg.followup.em": "follow-up.",
  "msg.followup.sub":
    "A gentle nudge. We've drafted something warm. Edit it however you like.",
  "msg.followup.preset":
    "Hi. Just a friendly note to check in on my application. I'm still very keen on the role and happy to share anything else that would help. No rush at all, and thank you for your time.",
  "msg.conversation.title": "Open the",
  "msg.conversation.em": "conversation.",
  "msg.conversation.sub": "Pick up the thread with them directly.",
  "msg.recipientHiringTeam": "Hiring team",
  "msg.historyWith":
    "The full history with {firstName}, every message and milestone, in order.",
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
    "We've opened Google Calendar. Just hit save. We'll also remind you the morning of.",
  "calendar.success.ics":
    "The invite (.ics) has downloaded. Open it to add the event. We'll also remind you the morning of.",
  "calendar.when": "When",
  "calendar.where": "Where",
  "calendar.with": "With",

  "withdraw.eyebrow": "Withdraw",
  "withdraw.title": "Step back from <em>{company}?</em>",
  "withdraw.sub":
    "This removes you from consideration for <b>{title}</b>. We'll send a brief, polite note on your behalf. You don't have to write anything.",
  "withdraw.reasonLabel": "Reason (only you see this)",
  "withdraw.reasonPlaceholder": "Pick a reason, or leave it open",
  "withdraw.cantUndo": "This can't be undone. You'd need to re-apply.",
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
    "Negotiating is expected, most offers have room. Here's your leverage, your levers, and five ways to make the ask.",
  "negotiate.onTheTable": "On the table",
  "negotiate.holiday": "Holiday",
  "negotiate.whatMattersMost": "What matters most to you",
  "negotiate.pickAngle": "Pick your angle",
  "negotiate.draftLabel": "Your draft reply. Edit it to sound like you",
  "negotiate.copyDraft": "Copy draft",
  "negotiate.copiedToast": "Draft copied to clipboard",
  "negotiate.sendingLabel": "Sending…",
  "negotiate.sendCta": "Send reply",
  "negotiate.success.title": "Counter",
  "negotiate.success.em": "sent.",
  "negotiate.success.body":
    "Your reply is on its way to {company}. Asking is normal and expected. You've done this exactly right.",
  "lever.baseSalary": "Base salary",
  "lever.holidayDays": "Holiday days",
  "lever.remoteDays": "Remote days",
  "lever.learningBudget": "Learning budget",
  "lever.startDate": "Start date",
  "lever.titleScope": "Title & scope",
  "principle.anchor": "Anchor on the value you bring, never on what you need.",
  "principle.nameNumber":
    "Name one clear number, then go quiet, let them respond.",
  "principle.trade":
    "If base won't move, trade: days, budget, title, flexibility.",
  "principle.stayWarm": "Stay warm. This is a relationship.",
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
    "Buy space to decide, calmly, without pressure.",

  "offer.respondByEyebrow": "Your offer · respond by {date}",
  "offer.saidYes": "{company} <em>said yes.</em>",
  "offer.sub": "Here's everything on the table. Take your time, then choose.",
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
    "Congratulations, {company} will send your contract within two working days.",
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
    "Nicely done, your application to {company} is in. It's now in your Active tab.",

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

  // ── SolidarityPage (+ directory) ────────────────────────────────────────
  // Scope note: solidarity.data.ts practitioner listings (bio, pricing notes,
  // tags) are directory content — in live mode fetched — left in English.
  "solidarity.hero.eyebrow": "Community care",
  "solidarity.hero.titleLine1": "Pay what",
  "solidarity.hero.titleEm": "you can.",
  "solidarity.hero.sub":
    "Professionals from the QueerPulse community who offer sliding-scale fees, because access to good care shouldn't depend on what you earn.",
  "solidarity.hero.note":
    "All practitioners have been verified by at least two community members.",
  "solidarity.how.step1.title": "Find your practitioner",
  "solidarity.how.step1.body":
    "Filter by profession, neighbourhood, or language. Every listing includes how their sliding scale works, no surprises.",
  "solidarity.how.step2.title": "Contact them directly",
  "solidarity.how.step2.body":
    "Reach out via the platform or email. You set the conversation. You do not have to explain your financial situation to anyone else first.",
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
  "ivaTracker.form.whatForPlaceholder": "e.g. Logo design, Café Aurora",
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
    "Getting close, only {remaining} of headroom left. Plan the rest of your year carefully before you cross {threshold}.",
  "ivaTracker.status.overNote":
    "You've passed the {threshold} exemption limit. You can finish the year exempt, but next year you'll charge IVA, and crossing {overrun} (25% over) forces you out immediately.",
  "ivaTracker.status.overrunTitle": "You must leave the <em>exemption.</em>",
  "ivaTracker.status.overrunBody":
    "You're past {overrun}, more than 25% over the threshold, so the art. 53.º exemption ends in-year. You'll need to start charging IVA and drop the exemption note from your invoices.",
  "ivaTracker.status.overrunNote": "Until now your faturas carried: {note}",

  // ── InvoiceForm / InvoiceFormFields / InvoiceLineItems / InvoicePreview / InvoiceGeneratorPage ──
  "invoiceTool.title": "Make an <em>invoice.</em>",
  "invoiceTool.sub":
    "Fill in the details and watch your fatura-recibo build itself. When it looks right, save it straight to PDF, no account, no upload, nothing leaves your browser.",
  "invoiceTool.issuer.legend": "Your details",
  "invoiceTool.issuer.nameLabel": "Name / business",
  "invoiceTool.issuer.namePlaceholder": "Your name or studio",
  "invoiceTool.issuer.nifLabel": "NIF",
  "invoiceTool.issuer.emailLabel": "Email",
  "invoiceTool.issuer.emailPlaceholder": "you@example.com",
  "invoiceTool.issuer.addressLabel": "Address",
  "invoiceTool.issuer.addressPlaceholder": "Street, postcode, city",
  "invoiceTool.issuer.ibanLabel": "IBAN",
  // Format-example placeholders, not prose — the sample IBAN/invoice-number
  // shape is identical regardless of language, so EN and PT share the value.
  "invoiceTool.issuer.ibanPlaceholder": "PT50 0000 0000 0000 0000 0000 0",
  "invoiceTool.client.legend": "Client",
  "invoiceTool.client.nameLabel": "Client name",
  "invoiceTool.client.namePlaceholder": "Who you're billing",
  "invoiceTool.client.nifLabel": "Client NIF",
  "invoiceTool.client.addressLabel": "Client address",
  "invoiceTool.optional": "Optional",
  "invoiceTool.meta.legend": "Invoice",
  "invoiceTool.meta.numberLabel": "Invoice number",
  "invoiceTool.meta.numberPlaceholder": "FR 2026/001",
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
  "invoiceTool.preview.nifLine": "NIF {nif}",
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
    "A clear service agreement, ready in minutes. Fill in the work, pick the clauses that protect you, and export a real PDF, all in your browser.",
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
    "Compare what you'd actually take home either way at the same gross income, and weigh the costs that don't show up on a payslip.",
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
    "at {gross} gross, that's about {monthly} a month extra in your pocket, before the costs below.",
  "comparator.result.subLess":
    "at {gross} gross, that's about {monthly} a month you'd give up, before the costs below.",
  "comparator.result.costsTitle": "What the <em>payslip</em> doesn't show",
  "comparator.hiddenCost.noHoliday":
    "No paid holiday. You fund your own time off.",
  "comparator.hiddenCost.noSubsidio":
    "No subsídio de férias or de Natal (the two extra months salaried workers get).",
  "comparator.hiddenCost.noSickLeave":
    "No paid sick leave or guaranteed unemployment cover.",
  "comparator.hiddenCost.ownSS":
    "You pay your own Segurança Social, quarterly.",
  "comparator.hiddenCost.lumpyIncome":
    "Income is lumpy, feast or famine month to month.",
  "comparator.hiddenCost.upside":
    "But: deductible expenses, autonomy, and you can charge more.",

  // ── RateBoardForm / RateBoardStats / RateBoardPage ─────────────────────
  "rateBoard.title": "What you actually <em>charge.</em>",
  "rateBoard.sub":
    "A private rate board that lives on this device. Add your rates, watch the spread build up, and export the file when you want to compare with people you trust.",
  "rateBoard.form.title": "Add your rate",
  "rateBoard.form.hint":
    "No name, no email. Just the numbers. It stays on this device until you export it.",
  "rateBoard.form.roleLabel": "Role",
  "rateBoard.form.experienceLabel": "Experience",
  "rateBoard.form.dayRateLabel": "Day rate (€)",
  "rateBoard.form.dayRatePlaceholder": "e.g. 350",
  "rateBoard.form.typeLabel": "Type",
  "rateBoard.form.addCta": "Add to the board",
  "rateBoard.form.compareLabel": "See where you stand",
  "rateBoard.form.comparePlaceholder": "Your day rate (€)",
  "rateBoard.form.compareHint":
    "We'll show your percentile against the rates on this board. Nothing's added to it.",
  "rateBoard.form.addedToast": "Added to your board",
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
    "Add your first rate, or import a JSON file someone shared with you. The spread shows up here as soon as this device has data.",
  "rateBoard.stats.communityMedian": "Median day rate on this board",
  "rateBoard.stats.across": "across",
  "rateBoard.stats.rateCount_one": "{count} rate",
  "rateBoard.stats.rateCount_other": "{count} rates",
  "rateBoard.stats.roleCount_one": "{count} role",
  "rateBoard.stats.roleCount_other": "{count} roles",
  "rateBoard.stats.yourRateSits": "Your rate of {rate} sits at the",
  "rateBoard.stats.percentileValue": "{percentile}th percentile",
  "rateBoard.stats.aboveMost": "Above {percent}% of the rates on this board.",
  "rateBoard.stats.belowMost":
    "Below most of the rates on this board. You may be leaving money on the table.",
  "rateBoard.disclaimer":
    "Everything here is what you and the people who sent you a file typed in, self-reported and unverified. Every situation differs, so treat these figures as a starting point for the conversation. Saved on this device only, and never uploaded.",
  "rateBoard.export": "Export JSON",
  "rateBoard.import": "Import JSON",
  "rateBoard.importAriaLabel": "Import a rate-board JSON file",
  "rateBoard.exportedToast": "Exported",
  "rateBoard.invalidFileToast":
    "That file isn't a rate board. Expected a JSON array.",
  "rateBoard.noValidEntriesToast": "No valid entries found in that file.",
  "rateBoard.importedToast_one": "Imported {count} entry",
  "rateBoard.importedToast_other": "Imported {count} entries",
  "rateBoard.readErrorToast": "Couldn't read that file, is it valid JSON?",
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
    "On your expected {gross}, that's about {monthly} a month you keep aside for the IRS and Segurança Social, and don't spend.",
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
    "Punch in your yearly gross and we'll estimate what's left after IRS and Segurança Social on the regime simplificado, recalculated live as you go.",
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
  "takeHome.statusOption.eni": "ENI, empresário em nome individual (25.2% SS)",
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
    "Work back from the income you need to a day rate that actually sustains you, overhead, unpaid days, and IVA included.",
  "dayRate.annualLabel": "Target annual income (€)",
  "dayRate.daysLabel": "Billable days per year",
  "dayRate.overheadLabel": "Overhead & expenses (% of income)",
  "dayRate.hoursLabel": "Hours per billable day",
  "dayRate.ivaLabel": "IVA rate",
  "dayRate.result.heading": "Your day rate",
  "dayRate.result.minLabel": "Minimum day rate (excl. IVA)",
  "dayRate.result.withIvaLabel": "Including IVA",
  "dayRate.result.hourlyLabel": "Hourly (excl. IVA)",
  "dayRate.result.note": "A starting point, adjust for your sector and market.",

  // ── SlidingScaleForm / SlidingScalePreview / SlidingScalePage ──────────
  "slidingScale.title": "Price with <em>solidarity.</em>",
  "slidingScale.sub":
    "Publish a sliding scale so people pay what fits their means, and you still get paid fairly. Export a card to share.",
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
  "slidingScale.preview.priceFallback": "Not set",
  "slidingScale.preview.outro":
    "Pay the tier that's honest for you. Choosing higher keeps this work open to everyone.",
  "slidingScale.disclaimer":
    "These tiers are this maker's own pricing, a sliding scale offered in good faith, not a fixed market rate or a means test.",

  // ── ReciboVerdeGuidePage (page chrome only — see report re: GUIDE_SECTIONS) ──
  // Scope note: the guide's own section titles/bodies (reciboVerdeGuide.data.tsx
  // GUIDE_SECTIONS) are dense, article-citing pt-PT tax/legal explanations —
  // flagged and deliberately left English rather than risk a subtly wrong tax
  // instruction. Only this page's surrounding chrome is translated.
  "reciboGuide.heroTitle": "The recibos verdes <em>guide.</em>",
  "reciboGuide.heroLead":
    "Going freelance in Portugal shouldn't mean drowning in jargon. Here's the whole recibos verdes system in plain, warm language, how to register, what you'll owe, and the handful of dates that actually matter. Take it one section at a time.",
  "reciboGuide.ctaTitle": "Ready to <em>send one?</em>",
  "reciboGuide.ctaText":
    "The invoice tool turns everything above into a finished fatura-recibo, right coefficients, right notes, right maths.",
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
    "A toolkit for forming a queer housing co-operative in Portugal, from finding the people, through the legal incorporation, the financing, the property, the daily governance. <em>Five phases, real templates, members already in each one.</em>",
  "housingCoop.hero.statsHead": "Co-ops forming now",
  "housingCoop.phases.title": "Five <em>phases</em> from idea to keys",
  "housingCoop.phases.sub":
    "Realistic timeline: 14–28 months. Each phase has templates, real examples from existing co-ops, and a mentor you can reach when stuck.",
  "housingCoop.grid.title": "Co-ops <em>forming now</em>",
  "housingCoop.grid.seeAll": "All 8",
  "housingCoop.templates.title": "Templates & <em>tools</em>",
  "housingCoop.templates.sub":
    "Every document we wish someone had given us. Drafted with QueerPulse legal, translated PT & EN, stress-tested by Casa Sambizanga's first two years.",
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
    "This is a starting template. Adapt it with your group and, where it matters legally, a lawyer or notary.",

  // ── CoopTemplatePage: formation-template document prose ─────────────────
  // Keys mirror the document shape declared in
  // src/features/economy/coopTemplateContent.data.tsx: .tag/.title/.titleEm/.intro,
  // then per section .s<i>.h, .s<i>.b<j> (paragraph), .s<i>.b<j>.<k> (list item).
  // Kept at EN/pt parity by the catalog parity test.
  // founding-values
  "coopTemplate.doc.founding-values.tag": "Phase 1 · template",
  "coopTemplate.doc.founding-values.title": "Founding Values",
  "coopTemplate.doc.founding-values.titleEm": "Charter",
  "coopTemplate.doc.founding-values.intro":
    "Your founding values charter is the first thing your group writes together, before a mortgage application, before a lease, before anyone signs anything with a bank or a notary. It puts into words what you're building and for whom, so that six months from now, when money is tight or a decision is hard, you have something to return to together. Treat everything below as a first draft: read it out loud as a group, cross out what doesn't fit, and rewrite it in your own words until it sounds like you.",
  "coopTemplate.doc.founding-values.s0.h": "Why we're forming this co-op",
  "coopTemplate.doc.founding-values.s0.b0":
    "Start with one or two sentences that say, plainly, what this co-op is for. Not a mission statement for outsiders, a private answer for the people signing the shares. What are you protecting each other from, and what are you building toward?",
  "coopTemplate.doc.founding-values.s0.b1.0":
    "We are forming this co-op so that none of us has to choose between staying closeted and staying housed.",
  "coopTemplate.doc.founding-values.s0.b1.1":
    "We want a home where ageing, disability, and care needs are planned for in good time.",
  "coopTemplate.doc.founding-values.s0.b1.2":
    "We're pooling what we have so that people who'd be priced out alone can stay in the city they call home.",
  "coopTemplate.doc.founding-values.s1.h":
    "Who we are, and who this home is for",
  "coopTemplate.doc.founding-values.s1.b0":
    "Name explicitly who belongs here and on what terms. Silence on this point tends to default to whoever already holds power in the room, so write it down.",
  "coopTemplate.doc.founding-values.s1.b1.0":
    "This is a queer- and trans-affirming home. We use the names and pronouns people ask us to use, without debate, from day one.",
  "coopTemplate.doc.founding-values.s1.b1.1":
    "We commit to actively working against racism, transphobia, ableism, and classism in who we admit, how we speak to each other, and whose needs get prioritised in repairs and budgeting.",
  "coopTemplate.doc.founding-values.s1.b1.2":
    "We will make our physical spaces and our decision-making processes as accessible as we're able to, and we'll keep improving them as our members' needs change.",
  "coopTemplate.doc.founding-values.s1.b1.3":
    "New members join through [describe your process here, a trial period, a vouching system, a vote of the full group].",
  "coopTemplate.doc.founding-values.s2.h": "How we make decisions together",
  "coopTemplate.doc.founding-values.s2.b0":
    "Pick a method before you need one under pressure. Many co-ops start with consensus and add a fallback for when consensus stalls.",
  "coopTemplate.doc.founding-values.s2.b1.0":
    "Day-to-day decisions (small repairs, guest policy, the shared calendar) are made by whoever's affected, informing the group afterwards.",
  "coopTemplate.doc.founding-values.s2.b1.1":
    "Household-level decisions (budget changes, new members, house rules) go to the full assembly, with a stated quorum.",
  "coopTemplate.doc.founding-values.s2.b1.2":
    "When consensus can't be reached after genuine effort, we fall back to [a supermajority vote, a cooling-off period and re-vote, an outside facilitator]. Decide this now, while it's still hypothetical.",
  "coopTemplate.doc.founding-values.s3.h": "How we take care of each other",
  "coopTemplate.doc.founding-values.s3.b0":
    "Safety and care commitments belong here, not only in a separate policy nobody reads.",
  "coopTemplate.doc.founding-values.s3.b1.0":
    "We check in with each other, especially members going through a hard time, without making it any one person's job alone.",
  "coopTemplate.doc.founding-values.s3.b1.1":
    "We have a plan for what happens if a member is unsafe at home, from a partner, a family member, or anyone else, and it doesn't depend on that member asking perfectly for help.",
  "coopTemplate.doc.founding-values.s3.b1.2":
    "We don't out each other, to family, landlords, employers, or each other's contacts, ever, for any reason.",
  "coopTemplate.doc.founding-values.s4.h": "Money & fairness",
  "coopTemplate.doc.founding-values.s4.b0":
    "Say plainly what fairness means to your group before the finance model (see the Finance Model Explainer) turns it into numbers.",
  "coopTemplate.doc.founding-values.s4.b1.0":
    "Contributions are scaled to what people can actually pay.",
  "coopTemplate.doc.founding-values.s4.b1.1":
    "No one loses their home over money without the group first trying every alternative together (see the Financial Honesty Agreement and the Conflict Resolution Process).",
  "coopTemplate.doc.founding-values.s4.b1.2":
    "Financial information about the co-op is available to every member, always. There are no closed books here.",
  "coopTemplate.doc.founding-values.s5.h": "Revisiting these values",
  "coopTemplate.doc.founding-values.s5.b0":
    "Values drift if nobody re-reads them. Set a date in the calendar.",
  "coopTemplate.doc.founding-values.s5.b1.0":
    "We re-read this charter together at least once a year, and after any major event that tested it.",
  "coopTemplate.doc.founding-values.s5.b1.1":
    "Changes need [a supermajority / full consensus. Decide which] and take effect only after every member has seen the proposed wording.",
  "coopTemplate.doc.founding-values.s5.b2":
    "This charter is a starting template, not a finished document, the version that matters is the one your group argues its way into, and revisits every year after.",
  // financial-honesty
  "coopTemplate.doc.financial-honesty.tag": "Phase 1 · template",
  "coopTemplate.doc.financial-honesty.title": "Financial Honesty",
  "coopTemplate.doc.financial-honesty.titleEm": "Agreement",
  "coopTemplate.doc.financial-honesty.intro":
    "Housing co-ops fail more often over unspoken money trouble than over any legal problem. This agreement exists so that a member who's struggling says so in week two, not month eight, and so nobody has to guess what anyone else earns, owes, or is worried about. Adapt the specifics to your group; keep the principle that everyone sees the same numbers.",
  "coopTemplate.doc.financial-honesty.s0.h":
    "What full transparency means here",
  "coopTemplate.doc.financial-honesty.s0.b0":
    "Financial transparency doesn't mean everyone reveals their entire personal finances. It means everyone sees the same numbers about the co-op, and the group agrees in advance what individual information is shared, and why.",
  "coopTemplate.doc.financial-honesty.s0.b1.0":
    "Every member can see the co-op's shared ledger at any time, not only at the annual meeting.",
  "coopTemplate.doc.financial-honesty.s0.b1.1":
    "Individual contribution amounts (if scaled to income) are visible to the group, though the underlying payslips or tax returns are not, unless a member chooses to share them.",
  "coopTemplate.doc.financial-honesty.s0.b1.2":
    "No side agreements about money exist outside this document and the shared ledger.",
  "coopTemplate.doc.financial-honesty.s1.h":
    "What each member discloses, and when",
  "coopTemplate.doc.financial-honesty.s1.b0":
    "Be specific about what's asked for at joining versus what's ongoing.",
  "coopTemplate.doc.financial-honesty.s1.b1.0":
    "At joining: whether you can meet the full share amount, on what schedule, and any support you're bringing to or need from the group's solidarity fund.",
  "coopTemplate.doc.financial-honesty.s1.b1.1":
    "Ongoing: any change that affects your ability to pay, job loss, illness, a change in hours, disclosed to [a finance steward / the full group] as soon as you know, not after you've missed a payment.",
  "coopTemplate.doc.financial-honesty.s1.b1.2":
    "Annually: a joint review of whether contributions still reflect people's actual circumstances.",
  "coopTemplate.doc.financial-honesty.s2.h": "The shared ledger",
  "coopTemplate.doc.financial-honesty.s2.b0":
    "Name the tool and the access rule, not only the intention.",
  "coopTemplate.doc.financial-honesty.s2.b1.0":
    "The ledger lives in [a shared spreadsheet, accounting software] that every member can open, read, and export at any time.",
  "coopTemplate.doc.financial-honesty.s2.b1.1":
    "One or two members act as finance stewards, rotating every [year], responsible for entries, not for gatekeeping who gets to see them.",
  "coopTemplate.doc.financial-honesty.s2.b1.2":
    "Every payment in and out is logged within [one week], with a plain-language note. No line item nobody can explain.",
  "coopTemplate.doc.financial-honesty.s3.h": "Handling arrears with dignity",
  "coopTemplate.doc.financial-honesty.s3.b0":
    "Write this process before anyone's actually behind. It's much harder to agree on once it's personal.",
  "coopTemplate.doc.financial-honesty.s3.b1.0":
    "A missed payment triggers a private, non-punitive conversation within two weeks, not a group announcement.",
  "coopTemplate.doc.financial-honesty.s3.b1.1":
    "The member and a finance steward agree a repayment plan together; the group is told a plan exists, not the personal details behind it, unless the member wants to share them.",
  "coopTemplate.doc.financial-honesty.s3.b1.2":
    "The solidarity fund (below) is offered before any conversation about a member leaving.",
  "coopTemplate.doc.financial-honesty.s4.h": "Solidarity & hardship fund",
  "coopTemplate.doc.financial-honesty.s4.b0":
    "A concrete fund is what makes 'we take care of each other' survive a real emergency.",
  "coopTemplate.doc.financial-honesty.s4.b1.0":
    "Every member contributes an illustrative example of €10–€20 a month into a shared hardship fund, separate from operating costs.",
  "coopTemplate.doc.financial-honesty.s4.b1.1":
    "The fund can cover a member's shortfall for an illustrative example of up to three months while a longer-term plan is worked out.",
  "coopTemplate.doc.financial-honesty.s4.b1.2":
    "Requests are approved by [the finance stewards / a simple majority] within one week, with no requirement to justify the hardship in detail.",
  "coopTemplate.doc.financial-honesty.s5.h": "Annual review",
  "coopTemplate.doc.financial-honesty.s5.b0":
    "Set a fixed date so this is revisited on schedule, not only during a crisis.",
  "coopTemplate.doc.financial-honesty.s5.b1.0":
    "Once a year, the group reviews: whether contributions still match circumstances, whether the hardship fund is adequately funded, and whether anyone has unspoken money worries.",
  "coopTemplate.doc.financial-honesty.s5.b2":
    "This agreement is a starting point. Adapt the amounts, timelines, and roles to your group's real numbers, and revisit it every year.",
  // crl-statutes
  "coopTemplate.doc.crl-statutes.tag": "Phase 2 · legal",
  "coopTemplate.doc.crl-statutes.title": "Model CRL",
  "coopTemplate.doc.crl-statutes.titleEm": "Statutes",
  "coopTemplate.doc.crl-statutes.intro":
    "A Cooperativa de Responsabilidade Limitada (CRL) is the legal form most QueerPulse housing co-ops register under in Portugal. What follows is a plain-English model of the sections your statutes need. It is not the legal text itself, and it is not legal advice. Bring this outline, and your founding values charter, to a lawyer or notary experienced in cooperative law before you draft or register anything.",
  "coopTemplate.doc.crl-statutes.s0.h": "Name & registered seat (sede)",
  "coopTemplate.doc.crl-statutes.s0.b0":
    "Your statutes open by naming the cooperative and its registered address (sede social), usually the property itself or a member's address until the property closes.",
  "coopTemplate.doc.crl-statutes.s0.b1.0":
    'Legal name, including the required "Cooperativa de Responsabilidade Limitada" or "CRL" designation.',
  "coopTemplate.doc.crl-statutes.s0.b1.1":
    "Registered seat: município and full address.",
  "coopTemplate.doc.crl-statutes.s0.b1.2":
    "Duration: most co-ops register for an indefinite period.",
  "coopTemplate.doc.crl-statutes.s1.h": "Object & scope (objeto)",
  "coopTemplate.doc.crl-statutes.s1.b0":
    "This clause defines what the cooperative actually does. Keep it specific to housing, but broad enough to cover related activity.",
  "coopTemplate.doc.crl-statutes.s1.b1.0":
    "Primary object: acquiring, developing, and managing housing for its members on a non-speculative, cost-covering basis.",
  "coopTemplate.doc.crl-statutes.s1.b1.1":
    "Secondary activities you may want covered: shared common spaces, tool libraries, small-scale community programming.",
  "coopTemplate.doc.crl-statutes.s1.b1.2":
    "A clause ruling out the resale of units for profit, keeping the co-op's housing outside the speculative market.",
  "coopTemplate.doc.crl-statutes.s2.h": "Membership: admission & exit",
  "coopTemplate.doc.crl-statutes.s2.b0":
    "Cooperative law requires open, non-discriminatory membership in principle, while still letting you set fair, values-aligned admission criteria.",
  "coopTemplate.doc.crl-statutes.s2.b1.0":
    "Admission criteria and process, for example, a trial period, an interview, a vote by the assembly.",
  "coopTemplate.doc.crl-statutes.s2.b1.1":
    "Conditions for voluntary exit, and the notice period required (commonly three to six months).",
  "coopTemplate.doc.crl-statutes.s2.b1.2":
    "Grounds and process for involuntary exit, cross-reference your Conflict Resolution Process so this isn't decided ad hoc.",
  "coopTemplate.doc.crl-statutes.s3.h": "Member rights & duties",
  "coopTemplate.doc.crl-statutes.s3.b0.0":
    "Right to participate and vote in the general assembly, one member, one vote, regardless of share size. This is a core cooperative principle, not optional.",
  "coopTemplate.doc.crl-statutes.s3.b0.1":
    "Right to full financial information about the cooperative (cross-reference your Financial Honesty Agreement).",
  "coopTemplate.doc.crl-statutes.s3.b0.2":
    "Duty to pay share capital and ongoing contributions as agreed.",
  "coopTemplate.doc.crl-statutes.s3.b0.3":
    "Duty to participate in governance to an agreed minimum, attending assemblies, serving on rotation.",
  "coopTemplate.doc.crl-statutes.s4.h": "Capital & shares (capital social)",
  "coopTemplate.doc.crl-statutes.s4.b0":
    "Portuguese cooperative law sets minimum share values and rules for admitting and repaying members, a lawyer confirms current figures. The statutes need to state:",
  "coopTemplate.doc.crl-statutes.s4.b1.0":
    "The nominal value of one share, and how many a member must hold.",
  "coopTemplate.doc.crl-statutes.s4.b1.1":
    "How shares are paid: in full at admission, or by instalment (see your Member Share Agreement).",
  "coopTemplate.doc.crl-statutes.s4.b1.2":
    "How shares are valued and repaid on exit, and over what period, so the cooperative isn't required to repay in a lump sum that endangers its finances.",
  "coopTemplate.doc.crl-statutes.s5.h": "Governance bodies",
  "coopTemplate.doc.crl-statutes.s5.b0":
    "Portuguese CRLs are typically structured around three bodies. Your statutes assign specific powers to each:",
  "coopTemplate.doc.crl-statutes.s5.b1.0":
    "Assembleia geral (general assembly): the full membership, and the highest authority. Approves the budget, admits and expels members, amends the statutes.",
  "coopTemplate.doc.crl-statutes.s5.b1.1":
    "Direção (board): a small elected group handling day-to-day administration between assemblies.",
  "coopTemplate.doc.crl-statutes.s5.b1.2":
    "Conselho fiscal (supervisory board): an independent body reviewing accounts and reporting to the assembly, kept separate from the direção, so one small group doesn't control both spending and oversight.",
  "coopTemplate.doc.crl-statutes.s6.h": "Surplus, reserves & dissolution",
  "coopTemplate.doc.crl-statutes.s6.b0.0":
    "Any operating surplus is allocated to reserves or reinvested in the property, not distributed as profit. This is what keeps the co-op non-speculative.",
  "coopTemplate.doc.crl-statutes.s6.b0.1":
    "A minimum legal reserve fund, built up over time, for unexpected repairs or shortfalls.",
  "coopTemplate.doc.crl-statutes.s6.b0.2":
    "On dissolution, remaining assets after debts are settled are transferred to another cooperative or social-purpose entity, never distributed to members as a windfall. This is both a legal requirement and a values commitment.",
  "coopTemplate.doc.crl-statutes.s6.b1":
    "This is a plain-language outline, not registrable statutes. Take it, together with your founding values charter, to a lawyer or notary who works with cooperative law before drafting the document you'll actually file.",
  // share-agreement
  "coopTemplate.doc.share-agreement.tag": "Phase 2 · legal",
  "coopTemplate.doc.share-agreement.title": "Member Share",
  "coopTemplate.doc.share-agreement.titleEm": "Agreement",
  "coopTemplate.doc.share-agreement.intro":
    "A member share agreement is the individual contract between the cooperative and one member. It turns the group-level statutes into a document a specific person signs, with specific numbers next to their name. Read it as a template to fill in together and check with a lawyer, not as a form to sign as-is.",
  "coopTemplate.doc.share-agreement.s0.h": "What the share buys",
  "coopTemplate.doc.share-agreement.s0.b0":
    "State plainly what membership entitles someone to, and what it doesn't.",
  "coopTemplate.doc.share-agreement.s0.b1.0":
    "One membership share equal to an illustrative example of €5,000, entitling the member to occupy [a described unit] and to one vote in the general assembly.",
  "coopTemplate.doc.share-agreement.s0.b1.1":
    "A share is not ownership of a specific unit or square metre. It's membership in the cooperative, which holds the property collectively.",
  "coopTemplate.doc.share-agreement.s0.b1.2":
    "The share does not appreciate with the property's market value; on exit it is repaid at its adjusted nominal value (see below), not at a market price.",
  "coopTemplate.doc.share-agreement.s1.h": "Payment schedule",
  "coopTemplate.doc.share-agreement.s1.b0":
    "Set out how the share gets paid, since few members can pay the full amount up front.",
  "coopTemplate.doc.share-agreement.s1.b1.0":
    "Full payment at admission, or an instalment plan, for example, 24 monthly payments, agreed individually and logged in the shared ledger.",
  "coopTemplate.doc.share-agreement.s1.b1.1":
    "What happens if an instalment is missed: cross-reference your Financial Honesty Agreement's arrears process rather than repeating it here.",
  "coopTemplate.doc.share-agreement.s2.h": "Leaving: buy-back terms",
  "coopTemplate.doc.share-agreement.s2.b0":
    "This is the clause members read most carefully, and the one that most needs to be fair rather than punitive.",
  "coopTemplate.doc.share-agreement.s2.b1.0":
    "On voluntary exit with the agreed notice period, the cooperative repays the share's nominal value, adjusted for [inflation / an agreed index], within an illustrative example of 12 months of departure.",
  "coopTemplate.doc.share-agreement.s2.b1.1":
    "The cooperative is not required to repay in a lump sum if that would endanger its finances, state the maximum repayment period up front so it isn't negotiated under stress.",
  "coopTemplate.doc.share-agreement.s2.b1.2":
    "No exit penalty applies to members leaving in good standing; hardship-driven exits go through the solidarity fund first.",
  "coopTemplate.doc.share-agreement.s3.h": "Who can hold a share",
  "coopTemplate.doc.share-agreement.s3.b0.0":
    "Shares are held by individual adult members, not transferred by inheritance, sale, or gift without the assembly's approval. This keeps membership tied to actual participation, not investment.",
  "coopTemplate.doc.share-agreement.s3.b0.1":
    "A member's household, partners, kids, chosen family living with them, doesn't each need a separate share, but state clearly who counts as living under one membership.",
  "coopTemplate.doc.share-agreement.s4.h": "Deposit protection",
  "coopTemplate.doc.share-agreement.s4.b0":
    "Because a share isn't a rental deposit, it usually isn't covered by Portugal's tenant deposit-protection scheme. Say so explicitly, and say what protects it instead.",
  "coopTemplate.doc.share-agreement.s4.b1.0":
    "The share amount is held in the cooperative's account, logged individually in the ledger, and confirmed to the member in writing every year.",
  "coopTemplate.doc.share-agreement.s4.b1.1":
    "An independent conselho fiscal (supervisory board, see your CRL statutes) reviews that share accounts match what's owed to each member.",
  "coopTemplate.doc.share-agreement.s5.h": "Signatures",
  "coopTemplate.doc.share-agreement.s5.b0":
    "A simple signature block, dated, with both the member and a representative of the cooperative's board, plus a line making the template nature explicit:",
  "coopTemplate.doc.share-agreement.s5.b1.0": "Member name, date, signature.",
  "coopTemplate.doc.share-agreement.s5.b1.1":
    "Cooperative representative name, role, date, signature.",
  "coopTemplate.doc.share-agreement.s5.b1.2":
    "Note: this agreement was adapted from a QueerPulse template on [date] and reviewed by [lawyer/notary name] before signing.",
  "coopTemplate.doc.share-agreement.s5.b2":
    "Fill in every bracket above with your group's real numbers, and have a lawyer check the final version before anyone signs.",
  // finance-model
  "coopTemplate.doc.finance-model.tag": "Phase 3 · finance",
  "coopTemplate.doc.finance-model.title": "Finance Model",
  "coopTemplate.doc.finance-model.titleEm": "Explainer",
  "coopTemplate.doc.finance-model.intro":
    "This explainer walks through how the money in a housing co-op actually adds up, what you're paying for, where a mortgage and municipal support might fit, and how to set a monthly contribution that's sustainable rather than optimistic. The worked example at the end uses illustrative numbers only; your real figures depend entirely on your property, your city, and your group.",
  "coopTemplate.doc.finance-model.s0.h": "The cost stack",
  "coopTemplate.doc.finance-model.s0.b0":
    "A co-op's costs come in three layers, and it helps to keep them visually separate rather than lumped into one scary number.",
  "coopTemplate.doc.finance-model.s0.b1.0":
    "Acquisition: the purchase price of the property, plus notary, registration, and transfer taxes (IMT).",
  "coopTemplate.doc.finance-model.s0.b1.1":
    "Works: renovation, code compliance, accessibility retrofits, often underestimated on older Lisbon and Porto buildings.",
  "coopTemplate.doc.finance-model.s0.b1.2":
    "Running costs: mortgage or loan repayment, insurance, maintenance reserve, utilities for shared spaces, and the co-op's own admin (accounting, notary check-ins).",
  "coopTemplate.doc.finance-model.s1.h":
    "Member shares, mortgage, and municipal support",
  "coopTemplate.doc.finance-model.s1.b0":
    "Most QueerPulse co-ops blend three funding sources rather than relying on one.",
  "coopTemplate.doc.finance-model.s1.b1.0":
    "Member shares (see your Member Share Agreement) cover a portion of acquisition, typically enough to make the loan-to-value ratio workable for a lender.",
  "coopTemplate.doc.finance-model.s1.b1.1":
    "A cooperative mortgage or loan, often through Caixa Crédito Agrícola Mútuo (CCAM) or another lender used to cooperative borrowers, covers the remainder of acquisition and sometimes works.",
  "coopTemplate.doc.finance-model.s1.b1.2":
    "Municipal support, a long lease on city-owned property, a renovation grant, or a housing fund co-investment, can reduce or replace the acquisition cost entirely in some cases. Ask QueerPulse's housing fund liaison what's currently available in your city.",
  "coopTemplate.doc.finance-model.s2.h": "Setting monthly contributions",
  "coopTemplate.doc.finance-model.s2.b0":
    "Work backwards from what people can actually pay, then check the number covers real costs. Start from the people.",
  "coopTemplate.doc.finance-model.s2.b1.0":
    "Add up total monthly running costs: loan repayment plus reserve plus insurance plus admin.",
  "coopTemplate.doc.finance-model.s2.b1.1":
    "Decide how contributions are split: equally, or scaled to income and household size (cross-reference your founding values and financial honesty agreement).",
  "coopTemplate.doc.finance-model.s2.b1.2":
    "Build in a margin, most co-ops budget 5–10% above known costs for the surprises that always show up in year one.",
  "coopTemplate.doc.finance-model.s3.h": "Building reserves",
  "coopTemplate.doc.finance-model.s3.b0.0":
    "A maintenance reserve, funded from month one, even before anything's broken, retrofitting this later, after a roof leak, is much harder.",
  "coopTemplate.doc.finance-model.s3.b0.1":
    "A target reserve size, commonly discussed as several months of running costs, agreed by the group rather than assumed.",
  "coopTemplate.doc.finance-model.s3.b0.2":
    "The reserve is separate from the hardship/solidarity fund, one protects the building, the other protects members.",
  "coopTemplate.doc.finance-model.s4.h": "Where QueerPulse partners fit",
  "coopTemplate.doc.finance-model.s4.b0.0":
    "CCAM and similar cooperative-friendly lenders: financing structured for collective borrowers rather than individual mortgages.",
  "coopTemplate.doc.finance-model.s4.b0.1":
    "The city housing fund: co-investment, long leases on municipal buildings, or grants tied to affordable-housing targets. Terms vary by city and change over time, so check current terms with QueerPulse's housing fund liaison rather than relying on this document.",
  "coopTemplate.doc.finance-model.s4.b0.2":
    "QueerPulse's legal team: a first read of financing terms before you sign, not a substitute for independent legal and financial advice.",
  "coopTemplate.doc.finance-model.s5.h":
    "A worked example (illustrative numbers only)",
  "coopTemplate.doc.finance-model.s5.b0":
    "None of the figures below are a real quote. They exist to show how the pieces fit together for a hypothetical 6-household co-op.",
  "coopTemplate.doc.finance-model.s5.b1.0":
    "Property + works: €900,000 (illustrative)",
  "coopTemplate.doc.finance-model.s5.b1.1":
    "Member shares, 6 households × €8,000: €48,000 (illustrative)",
  "coopTemplate.doc.finance-model.s5.b1.2":
    "Municipal co-investment: €150,000 (illustrative)",
  "coopTemplate.doc.finance-model.s5.b1.3":
    "Remaining amount financed through a cooperative mortgage: €702,000 (illustrative)",
  "coopTemplate.doc.finance-model.s5.b1.4":
    "Estimated monthly running cost per household, including reserve: €420–€480 (illustrative)",
  "coopTemplate.doc.finance-model.s5.b2":
    "Treat this model as a starting structure, not a forecast. Build your real numbers with your lender, your municipality, and, for anything binding, an accountant or lawyer.",
  // conflict-resolution
  "coopTemplate.doc.conflict-resolution.tag": "Phase 5 · governance",
  "coopTemplate.doc.conflict-resolution.title": "Conflict Resolution",
  "coopTemplate.doc.conflict-resolution.titleEm": "Process",
  "coopTemplate.doc.conflict-resolution.intro":
    "Every co-op has conflict, the difference between the ones that last and the ones that don't is usually whether they built a process before they needed it. This one is adapted from what Casa Sambizanga uses day to day; treat it as a starting structure to walk through and adjust with your own group, especially the steps that involve someone possibly leaving.",
  "coopTemplate.doc.conflict-resolution.s0.h":
    "Principles: repair over punishment",
  "coopTemplate.doc.conflict-resolution.s0.b0":
    "Set the tone before the steps. A process that only exists to punish tends to make people hide problems instead of raising them.",
  "coopTemplate.doc.conflict-resolution.s0.b1.0":
    "The goal of any step below is to repair the relationship or the situation enough that the co-op keeps working, not to establish who was right.",
  "coopTemplate.doc.conflict-resolution.s0.b1.1":
    "Anyone can raise a concern without it being treated as an accusation against them for raising it.",
  "coopTemplate.doc.conflict-resolution.s0.b1.2":
    "Safety concerns (see below) are the one category where repair takes a back seat to immediate protection.",
  "coopTemplate.doc.conflict-resolution.s1.h": "Everyday disagreements",
  "coopTemplate.doc.conflict-resolution.s1.b0":
    "Most friction never needs a formal process. Name that explicitly so people don't escalate small things out of anxiety.",
  "coopTemplate.doc.conflict-resolution.s1.b1.0":
    "Noise, chores, guests, shared-space use: raised directly, one to one, as close to when it happens as possible.",
  "coopTemplate.doc.conflict-resolution.s1.b1.1":
    "If a direct conversation feels too hard to start alone, ask a third member to sit in, not to take sides, just so it isn't two people alone in a hard moment.",
  "coopTemplate.doc.conflict-resolution.s2.h": "The stepped process",
  "coopTemplate.doc.conflict-resolution.s2.b0":
    "When a direct conversation doesn't resolve something, or feels unsafe to attempt alone, the process escalates in stages, each one lower-stakes than the next, so most things resolve before reaching the assembly.",
  "coopTemplate.doc.conflict-resolution.s2.b1.0":
    "Step 1, direct: the people involved talk it through, one to one, ideally within a week of the issue coming up.",
  "coopTemplate.doc.conflict-resolution.s2.b1.1":
    "Step 2, facilitated: if step 1 doesn't land, a third member, chosen by agreement rather than assigned, facilitates a conversation between those involved.",
  "coopTemplate.doc.conflict-resolution.s2.b1.2":
    "Step 3, assembly: if it's still unresolved, or affects the whole household, it's brought to the full group with a clear, agreed agenda item, not an ambush.",
  "coopTemplate.doc.conflict-resolution.s2.b1.3":
    "Step 4, external mediation: for anything the group can't resolve internally, an outside mediator is brought in, at the co-op's cost, before any decision about someone leaving is considered.",
  "coopTemplate.doc.conflict-resolution.s3.h": "Harm & safety issues",
  "coopTemplate.doc.conflict-resolution.s3.b0":
    "Some situations skip straight to protective action, and shouldn't wait for step 1.",
  "coopTemplate.doc.conflict-resolution.s3.b1.0":
    "Anything involving violence, harassment, or a member's immediate safety goes directly to whichever members hold a safety-response role, bypassing the stepped process entirely.",
  "coopTemplate.doc.conflict-resolution.s3.b1.1":
    "The person who experienced harm decides, as much as possible, what happens next, whether that's space, a facilitated conversation, or someone leaving the home temporarily.",
  "coopTemplate.doc.conflict-resolution.s3.b1.2":
    "The co-op does not investigate or adjudicate criminal matters itself; it supports the person affected in accessing outside help if they want it, and makes decisions about shared housing safety in parallel.",
  "coopTemplate.doc.conflict-resolution.s4.h": "Boundaries & accountability",
  "coopTemplate.doc.conflict-resolution.s4.b0.0":
    "Accountability here means someone actually changing the behaviour that caused harm, with support, and with follow-up.",
  "coopTemplate.doc.conflict-resolution.s4.b0.1":
    "Agreements made at any step, a changed behaviour, a boundary, a repair action, are written down and given a review date, so they're checked rather than assumed to have worked.",
  "coopTemplate.doc.conflict-resolution.s5.h": "When someone must leave",
  "coopTemplate.doc.conflict-resolution.s5.b0":
    "This is the hardest step, and the one most worth deciding calmly, in advance, rather than in the middle of a crisis.",
  "coopTemplate.doc.conflict-resolution.s5.b1.0":
    "Involuntary exit is only considered after step 4, except in safety situations where immediate, temporary separation is needed.",
  "coopTemplate.doc.conflict-resolution.s5.b1.1":
    "The decision requires [an agreed threshold, for example, a supermajority of the assembly, excluding those directly involved] and follows the exit terms in your CRL statutes and Member Share Agreement.",
  "coopTemplate.doc.conflict-resolution.s5.b1.2":
    "Wherever possible, the co-op supports the departing member in finding alternative housing. This is a housing safety net.",
  "coopTemplate.doc.conflict-resolution.s6.h": "Reviewing the process",
  "coopTemplate.doc.conflict-resolution.s6.b0":
    "Revisit this after it's actually been used, as well as on a set date.",
  "coopTemplate.doc.conflict-resolution.s6.b1.0":
    "After any use of step 3 or beyond, the group reviews whether the process itself worked, separate from the outcome of that specific conflict.",
  "coopTemplate.doc.conflict-resolution.s6.b1.1":
    "Annually, alongside the founding values charter review, check whether the stepped process, the facilitator role, and the safety-response role still fit the group as it's grown or changed.",
  "coopTemplate.doc.conflict-resolution.s6.b2":
    "This process is a starting template adapted from another QueerPulse co-op's practice, walk through every step as a group before you need it, and adjust the roles and thresholds to fit yours.",

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
  "housingCoop.toast.postHelp":
    "We'll help you find your people. Check your inbox.",
  "housingCoop.toast.story": "Casa Sambizanga's story is coming soon.",

  // ── JoinCoopModal ────────────────────────────────────────────────────────
  "joinCoop.askToJoinAriaLabel": "Ask to join {name}",
  "joinCoop.success.title": "Request",
  "joinCoop.success.em": "sent.",
  "joinCoop.success.closeLabel": "Done",
  "joinCoop.success.body":
    "The organisers of <strong>{name}</strong> will see your interest and reach out to arrange a first conversation. No commitment yet, the early chats are about whether the fit is right, both ways.",
  "joinCoop.title": "Ask to join <em>{name}.</em>",
  "joinCoop.sub":
    "{location}. Tell them a little about who's joining, they'll follow up to set up a first conversation.",
  "joinCoop.nameLabel": "Your name *",
  "joinCoop.namePlaceholder": "What should we call you?",
  "joinCoop.householdLabel": "Who's joining *",
  "joinCoop.chooseOne": "Choose one…",
  "joinCoop.noteLabel": "Anything you'd like them to know",
  "joinCoop.notePlaceholder":
    "What draws you to this co-op? Your situation, timeline, hopes…",
  "joinCoop.disclaimer":
    "Your request is shared only with this co-op's organisers. Joining a co-op is a long conversation. Take your time.",
  "joinCoop.cancel": "Cancel",
  "joinCoop.sending": "Sending…",
  "joinCoop.sendCta": "Send request",
  "joinCoop.error": "Couldn't send your request, please try again.",
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
    "The community board, where members post what they're looking for and what they can offer, is coming soon. Check back shortly.",

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
    "This form is part of the preview, it'll connect for real once QueerPulse launches. Nothing you enter here is sent anywhere.",
  "comingSoon.close": "Got it",

  // ── IncubatorModals: CohortApplyModal ────────────────────────────────────
  "incubatorApply.success.title": "Application",
  "incubatorApply.success.em": "received.",
  "incubatorApply.success.body":
    "Thanks, <strong>{name}</strong>. Cohort 3 applications are read by the programme team after the 30 July deadline. You'll hear back within three weeks, whatever we decide.",
  "incubatorApply.eyebrow": "Incubator · Cohort 3",
  "incubatorApply.title": "Apply to <em>build your thing.</em>",
  "incubatorApply.sub":
    "Six months of mentorship, peer accountability, and warm intros. No pitch deck required. Just tell us what you're making and where you're at.",
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
    "We review every mentor before matching, expect to hear from us soon.",
  "mentorSignup.submitCta": "Sign up to mentor",

  // ── IncubatorModals: RequestSessionModal ─────────────────────────────────
  "requestSession.success.title": "Session",
  "requestSession.success.em": "requested.",
  "requestSession.success.body":
    "Your request reached <strong>{name}</strong>. Mentors reply within a few days to confirm a time. Keep an eye on your email, and the intro will come from there.",
  "requestSession.eyebrow": "Incubator · {role}",
  "requestSession.title": "Request a session with <em>{name}.</em>",
  "requestSession.sub":
    "A short note goes a long way. Say what you're working on and when you'd like to meet, {firstName} will reply to set it up.",
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

  // ── Housing safety — anti-scam banner, tenant rights, price sanity (Wave A) ─
  "housingSafety.banner.ariaLabel": "Housing safety",
  "housingSafety.banner.eyebrow": "Before you go further",
  "housingSafety.banner.title": "A few things that keep you <em>safe</em>",
  "housingSafety.banner.dismiss": "Dismiss",
  "housingSafety.banner.moreCta": "Know your rights, spot a scam",
  "housingSafety.tips.neverPayFirst":
    "Never pay anything before you've signed a contract.",
  "housingSafety.tips.videoCall":
    "Ask to video-call. See the person and the place live.",
  "housingSafety.tips.lowPrice":
    "A price well below the going rate is usually a warning sign.",
  "housingSafety.tips.noTransfers":
    "No transfers or deposits until you've verified who you're dealing with.",
  "housingSafety.tips.stayOnPlatform":
    "Keep the conversation here. It's easier to get help if something goes wrong.",
  "housingSafety.tips.neverSightUnseen":
    "Never rent a place you, or someone you trust, haven't seen in person.",
  "housingSafety.price.title": "What Lisbon rents actually cost",
  "housingSafety.price.lead":
    "A rough gut check. If a place sits far below these, be curious about why before you commit.",
  "housingSafety.price.room.label": "Private room in a shared flat",
  "housingSafety.price.double.label": "Shared room, per person",
  "housingSafety.price.studio.label": "Studio of your own",
  "housingSafety.price.perMonth": "/ mo",
  "housingSafety.price.note":
    "Rough Lisbon ranges, meant as a sanity check, not a valuation.",
  "housingSafety.page.eyebrow": "Housing safety",
  "housingSafety.page.title": "Renting, <em>safely</em>",
  "housingSafety.page.lead":
    "A short, plain guide to spotting a scam and knowing your rights as a tenant in Portugal, so you can find a home without second-guessing yourself.",
  "housingSafety.page.antiScamTitle": "Spotting a <em>scam</em>",
  "housingSafety.page.rightsTitle": "Your rights as a tenant in Portugal",
  "housingSafety.rights.lease.title": "A written, registered lease",
  "housingSafety.rights.lease.point.1":
    "Your tenancy should be a written contract, a verbal deal leaves you with far less to stand on.",
  "housingSafety.rights.deposit.title": "Deposit and rent up front",
  "housingSafety.rights.deposit.point.1":
    "A security deposit is capped at two months' rent.",
  "housingSafety.rights.rentIncrease.title": "Rent increases",
  "housingSafety.rights.rentIncrease.point.1":
    "Rent can go up at most once every 12 months, and only with 30 days' written notice.",
  "housingSafety.rights.eviction.title": "Eviction and your home",
  "housingSafety.rights.eviction.point.1":
    "You can only be evicted through a court or the Balcão Nacional do Arrendamento, never on the spot.",
  "housingSafety.rights.discrimination.title": "If you're treated unfairly",
  "housingSafety.rights.discrimination.point.1":
    "The rental law doesn't list specific LGBTQ+ protections, but discrimination can still be reported to an equality body.",
  "housingSafety.disclaimer.title": "Guidance, not <em>legal advice</em>",
  "housingSafety.disclaimer.body":
    "We've kept this accurate and plain, but every situation is its own. For anything that really matters, talk to a tenants' association or a lawyer.",
  "housingSafety.backToHousing": "Back to housing",

  // ── Housing listing location — approximate area vs exact address (Wave A) ──
  "housingListing.section.location": "Where it is",
  "housingListing.location.approxNote":
    "You're seeing the rough area for now. The exact address appears once you and the person are connected.",
  "housingListing.location.exactNote":
    "You're connected, so this is the exact location.",
  "housingListing.location.addressLabel": "Address",
  "housingListing.location.mapAreaAria":
    "Map showing the approximate area of {title}",
  "housingListing.location.mapExactAria":
    "Map showing the exact location of {title}",

  // ── Say hello — flatmate first message, with optional pronoun sharing (Wave A) ─
  "sayHello.ariaLabel": "Say hello to {name}",
  "sayHello.title": "Say <em>hello</em>",
  "sayHello.lede":
    "A short, warm first message goes a long way. Share what you're looking for and what you'd bring to a home.",
  "sayHello.messageLabel": "Your message",
  "sayHello.messagePlaceholder":
    "Hi! I'm looking for a calm, queer-friendly place from September…",
  "sayHello.sharePronouns": "Let {name} see my pronouns, {pronouns}",
  "sayHello.sharePronounsHint":
    "Only shared with this person, only when you say so.",
  "sayHello.noPronounsHint": "Add pronouns to your profile to share them here.",
  "sayHello.cancel": "Cancel",
  "sayHello.send": "Send hello",
  "sayHello.sending": "Sending…",
  "sayHello.success.title": "Your hello is on its <em>way</em>",
  "sayHello.success.em": "way",
  "sayHello.success.body":
    "{name} will see your message in their inbox. You'll hear back there if they'd like to talk.",
  "sayHello.success.bodyWithPronouns":
    "{name} will see your message and your pronouns in their inbox. You'll hear back there if they'd like to talk.",
  "sayHello.success.close": "Done",

  // ── Flatmates — list/discovery view toggle + swipe discovery mode (Wave A) ──
  "flatmates.view.label": "Choose how to browse",
  "flatmates.view.list": "List",
  "flatmates.view.discovery": "Discovery",
  "flatmates.discovery.progress": "{current} of {total}",
  "flatmates.discovery.pass": "Pass",
  "flatmates.discovery.like": "Like",
  "flatmates.discovery.sayHello": "Say hello",
  "flatmates.discovery.keepBrowsing": "Keep browsing",
  "flatmates.discovery.error": "Couldn't save that. Try again in a moment.",
  "flatmates.discovery.matchTitle": "You <em>both</em> said hello",
  "flatmates.discovery.matchBody":
    "You and {name} liked each other. Start the conversation whenever you're ready.",
  "flatmates.discovery.doneTitle": "That's everyone for now",
  "flatmates.discovery.doneBody":
    "You've seen all the profiles that fit your filters. Check back soon. New folks join often.",

  // ── Vetted housing groups directory + join flow (Wave A) ──
  "housingGroups.backLabel": "Housing",
  "housingGroups.hero.eyebrow": "Vetted housing",
  "housingGroups.hero.title": "Groups queer renters actually <em>trust</em>",
  "housingGroups.hero.sub":
    "Small, screened housing groups where every listing states the rent, describes access honestly, and no broker gets a look in.",
  "housingGroups.grid.title": "Find your <em>people</em>",
  "housingGroups.grid.sub":
    "Ask to join a group and a steward will say hello. Each one keeps its own house rules.",
  "housingGroups.gated": "Ask to join",
  "housingGroups.members": "{count} members",
  "housingGroups.view": "View",
  "housingGroups.empty.title": "No groups open just",
  "housingGroups.empty.titleEm": "yet",
  "housingGroups.empty.body":
    "Vetted housing groups are forming city by city. Check back soon, or start one with people you already trust.",
  "housingGroups.detail.backLabel": "All groups",
  "housingGroups.detail.askToJoin": "Ask to join",
  "housingGroups.detail.join": "Join this group",
  "housingGroups.norms.title": "How we",
  "housingGroups.norms.titleEm": "look after each other",
  "housingGroups.norms.sub":
    "House rules everyone here agrees to. Break them and you're out, that's the point.",
  "housingGroups.listings.title": "Rooms and flats inside",
  "housingGroups.listings.perMonth": "€{price} / mo",
  "housingGroups.listings.accessLabel": "Access:",
  "housingGroups.listings.empty":
    "No rooms listed here right now. Join to be first to see the next one.",

  // ── Join a housing group — screened request (Wave A) ──
  "joinGroup.ariaLabel": "Ask to join {name}",
  "joinGroup.eyebrow": "Ask to join",
  "joinGroup.title": "Ask to join <em>{name}</em>",
  "joinGroup.sub":
    "A steward reads every request. Tell them a little about you. There are no wrong answers.",
  "joinGroup.nameLabel": "Your name",
  "joinGroup.namePlaceholder": "The name you go by",
  "joinGroup.relationshipLabel": "How you're part of the community",
  "joinGroup.relationshipPlaceholder":
    "A friend vouched for me, I've been to a few gatherings…",
  "joinGroup.optional": "(optional)",
  "joinGroup.disclaimer":
    "Your answers are seen only by the group's stewards, never posted publicly.",
  "joinGroup.cancel": "Cancel",
  "joinGroup.sending": "Sending…",
  "joinGroup.sendCta": "Send request",
  "joinGroup.error": "Couldn't send that. Try again in a moment.",
  "joinGroup.success.title": "Your request is <em>in</em>",
  "joinGroup.success.em": "in",
  "joinGroup.success.closeLabel": "Done",
  "joinGroup.success.body":
    "A steward from <strong>{name}</strong> will review it and get back to you. You'll hear from them in your inbox.",

  // ── Housing co-op — verified operator marker (Wave A) ──
  "housingCoop.operatorVerified": "Verified operator",

  // ── 2026-08-21 code-review 4.6 fixes ──
  "placeholder.notSet": "Not set",
  "member.fallbackName": "A member",
  "housing.fact.rent": "Rent",
  "housing.fact.rentPerMonth": "{amount} / month",
  "housing.fact.area": "Area",
  "housing.fact.available": "Available",
  "housing.fact.availableNow": "Now",
  "housing.fact.minimumStay": "Minimum stay",
  "housing.fact.minimumStayMonths_one": "{count} month",
  "housing.fact.minimumStayMonths_other": "{count} months",
  "housing.fact.bills": "Bills",
  "housing.fact.billsIncluded": "Included",
  "housing.fact.billsNotIncluded": "Not included",
  "housing.beds.count_one": "{count} bed",
  "housing.beds.count_other": "{count} beds",
  "housing.period.month": "month",
  // The lister block on a listing detail page. `{year}` is the year the member
  // joined, from their own profile.
  "housing.lister.memberSince": "Member since {year}",
  "company.badge.queerRun": "Queer-run",
  "company.badge.queerRunVerified": "Queer-run · verified",
  "company.badge.queerLed": "Queer-led",
  "company.badge.queerLedVerified": "Queer-led · verified",
  "company.badge.verified": "Verified",
  "company.badge.employer": "Employer",
  "company.reviews.starsBar_one": "{count} star",
  "company.reviews.starsBar_other": "{count} stars",
  "company.stats.founded": "Founded",
  "company.stats.people_one": "Person",
  "company.stats.people_other": "People",
  "company.stats.avgReview_one": "Avg review · {count} review",
  "company.stats.avgReview_other": "Avg review · {count} reviews",
  "company.stats.noScore": "No score",
  "company.membersLabel_one": "View all {count} member",
  "company.membersLabel_other": "View all {count} members",
  "company.hiringContact.fallbackName": "The team",
  "company.hiringContact.fallbackRole":
    "Applications are read by the team here.",
  "landlord.recommendation.when": "Recommended {date}",
  "housingCoop.card.phaseLabel": "Phase {number} · {phase}",
  "housingCoop.card.phaseWord.forming": "forming",
  "housingCoop.card.phaseWord.legal": "legal",
  "housingCoop.card.phaseWord.finance": "finance",
  "housingCoop.card.phaseWord.property": "property",
  "housingCoop.card.phaseWord.daily": "daily",
  "housingCoop.card.cta.join": "Ask to join",
  "housingCoop.card.cta.updates": "Read updates",
  "housingCoop.card.cta.mentor": "Request mentoring",
  "housingCoop.card.location_one": "{area}, {city} · {count} household",
  "housingCoop.card.location_other": "{area}, {city} · {count} households",
  "housingCoop.card.meta.targetShares": "Target shares",
  "housingCoop.card.meta.memberShares": "Member shares",
  "housingCoop.card.meta.monthly": "Monthly",
  "housingCoop.card.meta.operating": "Operating",
  "housingCoop.card.meta.formingSince": "Forming since",
  "housingCoop.card.operationalSince": "Operational since",
  "housingCoop.card.progressThrough": "<em>{percent}</em> through",
  "housingCoop.card.duration.years_one": "{count} year",
  "housingCoop.card.duration.years_other": "{count} years",
  "housingCoop.card.duration.months_one": "{count} month",
  "housingCoop.card.duration.months_other": "{count} months",
  "housingCoop.card.duration.justOpened": "just opened",
  "tax.disclaimer":
    "General information only. Rules change and every situation differs, so " +
    "confirm with a contabilista certificado before you rely on these figures.",
  "tax.retentionRate.23": "23% (default since 2025)",
  "tax.retentionRate.25": "25% (optional)",
  "tax.retentionRate.16_5": "16.5% (intellectual/industrial property)",
  "tax.retentionRate.11_5": "11.5% (activities not in the art. 151.º table)",
  "tax.retentionRate.0": "No retention (dispensa / art. 101.º-B)",
  "postJob.step3.maxPlaceholder": "Optional",
  "postJob.confirm.share.linkCopied": "Copied",
  "postJob.confirm.share.toastLinkFailed":
    "We couldn't reach your clipboard. Open the listing and copy the link from your browser's address bar.",
  "rateBoard.eyebrow": "On this device",
  "housingCoop.empty.bodyComingSoon":
    "This is where you'll find groups organizing housing together. Nobody has started one here yet, and posting that you're starting opens soon.",
  "housingCoop.startCta.comingSoonNote":
    "Posting that you're starting opens soon. Until then, you can ask to join any co-op already forming above.",
  "myHousingListings.edit.backToReviewWarning":
    "This listing is live right now. Saving a change sends it back for review, so it leaves the public board until a moderator clears it again. Usually that is quick.",
  "myHousingListings.toast.backToReview":
    "Saved. Your listing is back in review, so it is off the board until a moderator clears it.",
  // ── Housing-group listings: the poster's own edit + withdraw (BE-HSG-20) ──
  "groupListing.manage.editCta": "Edit",
  "groupListing.manage.editAriaLabel": "Edit the listing {title}",
  "groupListing.manage.withdrawCta": "Withdraw",
  "groupListing.manage.withdrawAriaLabel": "Withdraw the listing {title}",

  "groupListing.edit.ariaLabel": "Edit the listing {title}",
  "groupListing.edit.eyebrow": "Your room",
  "groupListing.edit.title": "Correct <em>your listing</em>",
  "groupListing.edit.sub":
    "Fix a price, rewrite the description, or update what you said about access.",
  "groupListing.edit.backToReviewWarning":
    "Everything on this form shows on the group page, so saving a change sends the room back for review. It leaves the group page until a moderator clears it again. Usually that is quick.",
  "groupListing.edit.submitCta": "Save and send for review",
  "groupListing.edit.submitting": "Saving…",

  "groupListing.field.titleLabel": "Room or flat",
  "groupListing.field.titlePlaceholder": "Sunny room in a shared flat",
  "groupListing.field.neighbourhoodLabel": "Neighbourhood",
  "groupListing.field.neighbourhoodPlaceholder": "Arroios",
  "groupListing.field.priceLabel": "Rent per month",
  "groupListing.field.pricePlaceholder": "480",
  "groupListing.field.priceHint":
    "A real number in euros. Stating the rent up front is a house rule here.",
  "groupListing.field.priceError": "Give a whole amount in euros, at least 1.",
  "groupListing.field.descriptionLabel": "What the place is like",
  "groupListing.field.descriptionPlaceholder":
    "Who lives there, what the flat is like, what you are hoping for in a flatmate.",
  "groupListing.field.accessLabel": "Access",
  "groupListing.field.accessPlaceholder":
    "Third floor, no lift. Bathroom door is 70cm. Step-free from the street to the building door.",
  "groupListing.field.accessHint":
    "Describe stairs, lifts, step-free routes and doorways honestly. Every listing here has to.",

  "groupListing.withdraw.confirmTitle": "Take this room down?",
  "groupListing.withdraw.confirmBody":
    "{title} comes off the group page for everyone. This cannot be undone, so post it again if the room comes free later.",
  "groupListing.withdraw.confirmCta": "Withdraw the listing",

  "groupListing.toast.backToReview":
    "Saved. Your room is back in review, so it is off the group page until a moderator clears it.",
  "groupListing.toast.editFailed": "Couldn't save that change",
  "groupListing.toast.withdrawn":
    "That room is down. Thanks for keeping the group tidy.",
  "groupListing.toast.withdrawFailed": "Couldn't withdraw that listing",

  // ── Housing-group listings: post a room, and see where yours stand ──
  "groupListing.post.ariaLabel": "Post a room in {group}",
  "groupListing.post.eyebrow": "Share a room",
  "groupListing.post.title": "Post a room in <em>the group</em>",
  "groupListing.post.sub":
    "Tell the people in {group} what is free, what it costs, and what getting into the place is like.",
  "groupListing.post.reviewNotice":
    "A moderator reads every room before it goes on the group page. Yours will sit in review until then, and you will hear back here.",
  "groupListing.post.submitCta": "Send for review",
  "groupListing.post.submitting": "Sending…",
  "groupListing.post.failed": "Couldn't send that room",
  "groupListing.post.success.title": "Your room is",
  "groupListing.post.success.titleEm": "with a moderator",
  "groupListing.post.success.body":
    "A moderator in <strong>{group}</strong> reads it next and it goes on the group page once they clear it. You will find it under your rooms here either way.",

  "groupListing.mine.title": "Your rooms",
  "groupListing.mine.titleEm": "in this group",
  "groupListing.mine.sub":
    "Everything you have shared here, and where each one stands. Nothing reaches the group page before a moderator reads it.",
  "groupListing.mine.postCta": "Post a room",
  "groupListing.mine.empty":
    "You have not shared a room here yet. When you do, it will show up in this spot with its review state.",
  "groupListing.mine.postedOn": "Posted {date}",

  "groupListing.mine.status.review": "Waiting for review",
  "groupListing.mine.status.question": "A question for you",
  "groupListing.mine.status.live": "On the group page",
  "groupListing.mine.status.declined": "Not published",
  "groupListing.mine.status.takenDown": "Taken down",

  "groupListing.mine.decision.question": "A moderator asked you something",
  "groupListing.mine.decision.declined": "Why this is not going up",
  "groupListing.mine.decision.takenDown": "Why this came down",
  "groupListing.mine.decision.questionHint":
    "Answer it by editing the room. Saving puts it back in front of a moderator.",
  "groupListing.mine.decision.editHint":
    "Edit the room to fix what is named here. Saving puts it back in front of a moderator.",

  // ── Landlord recommendations: withdraw your own (BE-HSG-18) ──
  "landlordPage.recommendation.yoursBadge": "Yours",
  "landlordPage.recommendation.withdrawCta": "Withdraw",
  "landlordPage.withdraw.confirmTitle": "Withdraw your recommendation?",
  "landlordPage.withdraw.confirmBody":
    "It comes off {name}'s page and stops counting towards their rating. You can write a new one any time.",
  "landlordPage.withdraw.confirmCta": "Withdraw it",
  "landlordPage.toast.recommendationWithdrawn": "Your recommendation is down.",
  "landlordPage.toast.withdrawFailed": "Couldn't withdraw that recommendation",

  // ── Employer-side job applications console (BE-HSG-16) ──
  "jobDetail.sidebar.reviewApplicationsCta": "Review applications",
  "jobApplications.eyebrow": "Applications",
  "jobApplications.fallbackJobTitle": "Your listing",
  "jobApplications.countTotal_one": "{count} person has applied.",
  "jobApplications.countTotal_other": "{count} people have applied.",
  "jobApplications.countWaiting_one": "{count} is waiting on a decision.",
  "jobApplications.countWaiting_other": "{count} are waiting on a decision.",
  "jobApplications.countWaitingNone": "Nothing is waiting on you right now.",
  "jobApplications.notifyNote":
    "Whoever you accept or decline hears from you by direct message, so keep an eye on your inbox for their reply.",
  "jobApplications.viewListing": "View the listing",
  "jobApplications.appliedOn": "Applied {date}",
  "jobApplications.applicantRemoved": "A member who has since left",
  "jobApplications.status.submitted": "New",
  "jobApplications.status.reviewing": "Reviewing",
  "jobApplications.status.accepted": "Accepted",
  "jobApplications.status.declined": "Declined",
  "jobApplications.action.startReview": "Start reviewing",
  "jobApplications.action.decline": "Decline",
  "jobApplications.action.accept": "Accept",
  "jobApplications.decisionFinal":
    "This decision is final and the applicant has been told.",
  "jobApplications.decideFailed": "Couldn't update that application",
  "jobApplications.confirmAccept.title": "Accept this application?",
  "jobApplications.confirmAccept.body":
    "They get a direct message from you saying so. Accepting is final, so take a moment first.",
  "jobApplications.confirmAccept.cta": "Accept",
  "jobApplications.confirmDecline.title": "Decline this application?",
  "jobApplications.confirmDecline.body":
    "They get a direct message from you saying so. Declining is final, and a kind word in your reply goes a long way.",
  "jobApplications.confirmDecline.cta": "Decline",
  "jobApplications.empty.title": "No applications yet",
  "jobApplications.empty.description":
    "When someone applies they will show up here, with whatever they wrote to you.",
  "jobApplications.forbidden.title": "This listing belongs to someone else",
  "jobApplications.forbidden.description":
    "Only the person who posted a role can read its applications. If this is your listing, sign in with the account you posted it from.",
  "jobApplications.forbidden.cta": "Back to the board",
  "jobApplications.missing.title": "That listing is gone",
  "jobApplications.missing.description":
    "It may have been taken down. Have a look at what else is open.",
  "jobApplications.error.title": "We couldn't load the applications",
  "jobApplications.error.description":
    "Something went wrong on our side. Give it another go in a moment.",
  "jobApplications.error.retry": "Try again",

  // ── Skill-exchange board paging + owner-side proposal inbox ──
  "barter.loadMore": "Show more swaps",
  "barter.loadingMore": "Loading more swaps…",

  "barterProposals.entryLink": "Your swaps and proposals",
  "barterProposals.eyebrow": "Skill exchange",
  "barterProposals.title": "Proposals on your swaps",
  "barterProposals.countListings_one": "{count} swap posted.",
  "barterProposals.countListings_other": "{count} swaps posted.",
  "barterProposals.countWaiting_one": "{count} proposal is waiting on you.",
  "barterProposals.countWaiting_other": "{count} proposals are waiting on you.",
  "barterProposals.countWaitingNone": "Nothing is waiting on you right now.",
  "barterProposals.backToBoard": "Back to the skill exchange",
  "barterProposals.pickerLegend": "Choose which of your swaps to read",
  "barterProposals.pendingBadgeLabel_one": "{count} proposal waiting",
  "barterProposals.pendingBadgeLabel_other": "{count} proposals waiting",
  "barterProposals.proposedOn": "Proposed {date}",
  "barterProposals.proposerRemoved": "A member who has since left",
  "barterProposals.status.pending": "Waiting on you",
  "barterProposals.status.accepted": "Accepted",
  "barterProposals.status.declined": "Declined",
  "barterProposals.action.accept": "Accept",
  "barterProposals.action.decline": "Decline",
  "barterProposals.decisionFinal":
    "This answer is final and they have been told.",
  "barterProposals.confirmAccept.title": "Accept this swap?",
  "barterProposals.confirmAccept.body":
    "They hear from you in your messages, where you can shape the swap together. Accepting is final, so take a moment first.",
  "barterProposals.confirmAccept.cta": "Accept",
  "barterProposals.confirmDecline.title": "Decline this swap?",
  "barterProposals.confirmDecline.body":
    "They hear from you in your messages. Declining is final, and a kind word in your reply goes a long way.",
  "barterProposals.confirmDecline.cta": "Decline",
  "barterProposals.decide.errorFailed":
    "Your answer didn't save. Give it another try in a moment.",
  "barterProposals.decide.errorNotOwner":
    "This swap belongs to someone else, so only they can answer its proposals.",
  "barterProposals.decide.errorGone":
    "This swap or proposal is gone. Refresh to see what's still here.",
  "barterProposals.decide.errorAlreadyDecided":
    "This proposal already has an answer. Refresh to see where it stands.",
  "barterProposals.empty.title": "No proposals on this swap yet",
  "barterProposals.empty.description":
    "When someone proposes an exchange it shows up here, with whatever they wrote to you.",
  "barterProposals.noListings.title": "You haven't posted a swap yet",
  "barterProposals.noListings.description":
    "Put something on the table and proposals from other members land right here.",
  "barterProposals.noListings.cta": "Go to the skill exchange",
  "barterProposals.forbidden.title": "This swap belongs to someone else",
  "barterProposals.forbidden.description":
    "Only the person who posted a swap can read its proposals. If this one is yours, sign in with the account you posted it from.",
  "barterProposals.missing.title": "That swap is gone",
  "barterProposals.missing.description":
    "It may have been taken off the board. Have a look at what else is on the exchange.",
  "barterProposals.error.title": "We couldn't load the proposals",
  "barterProposals.error.description":
    "Something went wrong on our side. Give it another go in a moment.",
  "barterProposals.error.retry": "Try again",
};

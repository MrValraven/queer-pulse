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

  // ── HousingPage / HousingBoard / HousingSections ───────────────────────
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

  "housing.landlords.heading": "Community-endorsed <em>landlords</em>",
  "housing.landlords.subtitle":
    "Members have vouched for these landlords as queer-friendly, reliable, and fair. Not a guarantee — always do your own due diligence.",
  "housing.landlords.endorsedBadge": "Community-endorsed",

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

  // ── HousingListingPage (+ sections) ────────────────────────────────────
  "housingListing.back": "← Housing board",
  "housingListing.section.about": "About this place",
  "housingListing.section.features": "Features",
  "housingListing.section.facts": "The facts",
  "housingListing.section.idealFor": "Ideal for",
  "housingListing.messageCtaArrow": "Message {name} →",
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
  "landlordPage.sidebar.requestIntro": "Request an introduction →",
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
  "flatmates.outro.askForum": "Ask the forum →",

  "flatmates.card.memberSince": "Member since {date}",
  "flatmates.card.sayHello": "Say hello →",
  "flatmates.card.helloSent": "Hello sent",

  // ── PostProfileModal / PostProfileForm ─────────────────────────────────
  "postProfileModal.ariaLabel": "Post your flatmate profile",
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
  "postProfileForm.nameLabel": "Your name",
  "postProfileForm.namePlaceholder": "First name or nickname",
  "postProfileForm.pronounsLabel": "Pronouns (optional)",
  "postProfileForm.pronounsPlaceholder": "e.g. she/her, they/them",
  "postProfileForm.neighbourhoodLabel": "Neighbourhood",
  "postProfileForm.neighbourhoodPlaceholder": "Preference / location",
  "postProfileForm.anywhereCentral": "Anywhere central",
  "postProfileForm.budgetLabel": "Budget / month",
  "postProfileForm.budgetPlaceholder": "e.g. €700–900",
  "postProfileForm.moveInLabel": "Available / move-in from",
  "postProfileForm.moveInPlaceholder": "When?",
  "postProfileForm.moveIn.jul2026": "July 2026",
  "postProfileForm.moveIn.aug2026": "August 2026",
  "postProfileForm.moveIn.sep2026": "September 2026",
  "postProfileForm.aboutLabel": "About you & what you're looking for in a home",
  "postProfileForm.aboutPlaceholder":
    "Tell people a bit about yourself — your rhythm, your work, what kind of home makes you feel good. No need to sell yourself; just be honest.",
  "postProfileForm.lifestyleTagsLabel": "Lifestyle tags",
  "postProfileForm.emailLabel": "Your email (not shown publicly)",
  "postProfileForm.emailPlaceholder": "So members can reach you via QueerPulse",
  "postProfileForm.submitCta": "Post profile →",

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
  "companyReview.cancel": "← Cancel",
  "companyReview.posting": "Posting…",
  "companyReview.submitCta": "Post review →",
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
  "employerReviews.recent.browseCta": "Browse queer-inclusive jobs →",
  "employerReviews.recent.writeCta": "Write a review →",

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
  "grants.sidebar.microGrants.cta": "Apply now →",
  "grants.sidebar.skillsExchange.title": "Skills Exchange",
  "grants.sidebar.skillsExchange.body":
    "If you need support but grants feel too formal, the barter board connects members who can swap skills — no money involved.",
  "grants.sidebar.skillsExchange.cta": "Explore the exchange →",
  "grants.sidebar.appHelp.title": "Get <em>application help</em>",
  "grants.sidebar.appHelp.body":
    "Members with grant-writing experience offer workshops and one-to-one support via the skills exchange.",
  "grants.sidebar.appHelp.cta": "Find a mentor →",

  // ── JobApplyPage (+ header / form / sidebar) ───────────────────────────
  "jobApply.backToJob": "← Back to job",
  "jobApply.backToJobs": "← Back to jobs",
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
  "jobApply.browse": "Browse →",
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
  "jobApply.sendCta": "Send application →",

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
};

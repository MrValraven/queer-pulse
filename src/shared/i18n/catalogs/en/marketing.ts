import type { Catalog } from "../../types";

/**
 * Marketing — English source catalog. Covers the informational/legal/press
 * pages under `src/features/marketing/`: About, Accessibility, Activism,
 * Code of Conduct, Cookies, DSAR, Guidelines, Help, the shared LegalDoc
 * chrome, the List-Your-Business wizard pills, Manifesto, Partners, Press
 * Kit, Privacy, and Terms. `pt/marketing.ts` mirrors this key-for-key.
 */
export const marketing: Catalog = {
  // ── About ──────────────────────────────────────────────────────────────
  "about.meta.title": "About QueerPulse: a small, member-run network",
  "about.meta.description":
    "QueerPulse is a small, invite-based queer community platform in Lisbon — no ads, no algorithm, no growth for its own sake. What we believe, and who runs it.",
  "about.hero.eyebrow": "About",
  "about.hero.title": "A platform built <em>on purpose.</em>",
  "about.hero.sub":
    "Not another feed chasing your attention. A small, deliberate space built to hold this community, not extract from it.",
  "about.why.eyebrow": "Why we exist",
  "about.why.title": "We built the thing <em>we needed.</em>",
  "about.why.p1":
    "QueerPulse started as a frustration, not a business plan. Every platform we tried to build community on was designed to hold our attention, not to serve us — optimised for time-on-app, not for whether we actually found each other.",
  "about.why.p2":
    "So a small group of us — professionals, organisers, artists — decided to build the alternative ourselves: a network sized for trust, not scale, where the point is connection, not engagement.",
  "about.why.p3": "It's slower to grow this way. That's the design, not a bug.",
  "about.why.pullQuote":
    "We didn't want a bigger audience. We wanted a room we could trust.",
  "about.difference.eyebrow": "The difference",
  "about.difference.title": "What we're <em>not building.</em>",
  "about.contrast.them.label": "Everywhere else",
  "about.contrast.us.label": "QueerPulse",
  "about.contrast.them.attention": "Optimised to hold your attention",
  "about.contrast.them.algorithm": "An algorithm decides what you see",
  "about.contrast.them.growth": "Growth at any cost",
  "about.contrast.them.value": "Your data is the product",
  "about.contrast.us.noAds": "No ads, ever",
  "about.contrast.us.findWhatYouNeed": "You find what you need, then log off",
  "about.contrast.us.smallByDesign": "Small by design, not by accident",
  "about.contrast.us.valueStays":
    "The value you create stays with the community",
  "about.beliefs.eyebrow": "What we believe",
  "about.beliefs.title": "The values behind <em>every decision.</em>",
  "about.values.smallByDesign.title": "Small by design",
  "about.values.smallByDesign.body":
    "We'd rather stay a room that works than become a platform that doesn't. Growth is never the goal on its own.",
  "about.values.infrastructure.title": "Infrastructure, not content",
  "about.values.infrastructure.body":
    "We're building the plumbing queer community needs — introductions, safe spaces, mutual aid — not another feed to scroll.",
  "about.values.communityEconomy.title": "A community economy",
  "about.values.communityEconomy.body":
    "Money that moves through QueerPulse — memberships, tips, grants — stays inside the community it came from.",
  "about.values.communityOwns.title": "The community owns its space",
  "about.values.communityOwns.body":
    "Decisions about this platform are made in the open, with the people who use it — not behind closed doors.",
  "about.values.noDataEconomy.title": "No data economy",
  "about.values.noDataEconomy.body":
    "We don't sell attention or personal data to advertisers. There's no third party we're building this for.",
  "about.values.accessNotEarned.title": "Access isn't earned by performing",
  "about.values.accessNotEarned.body":
    "You get in through trust — a vouch, an invitation — not by posting the right things often enough.",
  "about.who.eyebrow": "Who's behind this",
  "about.who.title": "Built by <em>community, for community.</em>",
  "about.who.p1":
    "QueerPulse is run by the people who use it — a small founding team, and a growing circle of members who help shape what comes next.",
  "about.who.p2":
    "We're not backed by venture capital chasing a return. We're backed by memberships, donations, and grants that keep the platform independent.",
  "about.who.pullQuote":
    "Nobody on this team is trying to get rich off this. We're trying to get it right.",
  "about.contactStrip.title": "Questions? <em>We're reachable.</em>",
  "about.contactStrip.body":
    "No support tickets vanishing into a queue. A real person reads what you send.",
  "about.contactStrip.contactCta": "Contact us",
  "about.contactStrip.governanceCta": "Read our governance",
  "about.outro.title": "Come see for <em>yourself.</em>",
  "about.outro.sub":
    "The best way to understand QueerPulse is to be inside it.",
  "about.outro.cta": "Request an invite",

  // ── Accessibility ──────────────────────────────────────────────────────
  "accessibility.meta.title": "Accessible queer spaces in Lisbon, reviewed",
  "accessibility.meta.description":
    "Real accessibility information for queer venues in Lisbon, reviewed by disabled community members rather than guessed at — plus how to request an accommodation directly.",
  "accessibility.backLabel": "Help",
  "accessibility.category": "Accessibility",
  "accessibility.hero.title": "Access <em>shouldn't be a maybe.</em>",
  "accessibility.hero.sub":
    "Real accessibility information for queer spaces in Lisbon — reviewed by disabled members, not guessed at. Plus how to request an accommodation from us directly.",
  "accessibility.hero.accomCta": "Request an accommodation",
  "accessibility.hero.spacesCta": "See accessible spaces",
  "accessibility.hero.note":
    "Every venue below was reviewed by a disabled community member before it was listed.",
  "accessibility.spaces.title": "Accessible <em>spaces</em>",
  "accessibility.spaces.body":
    "Filter by the access feature that matters to you. Every listing reflects what a disabled member actually found there, not a venue's own claims.",
  "accessibility.spaces.filterLabel": "Filter by:",
  "accessibility.spaces.emptyTitle": "No spaces match that filter yet",
  "accessibility.spaces.emptyBody":
    "Try a different feature, or flag a venue you'd like reviewed.",
  "accessibility.filters.all": "All spaces",
  "accessibility.filters.stepFree": "Step-free",
  "accessibility.filters.accessibleBathroom": "Accessible bathroom",
  "accessibility.filters.seating": "Seating",
  "accessibility.filters.hearingLoop": "Hearing loop",
  "accessibility.filters.sensoryFriendly": "Sensory-friendly",
  "accessibility.filters.carerWelcome": "Carer welcome",
  "accessibility.commitments.title": "Our <em>commitments</em>",
  "accessibility.commitments.body":
    "What we already do, and what we're still working on — no rounding up.",
  "accessibility.commitments.captions.title": "Live captions",
  "accessibility.commitments.captions.body":
    "Community events with a spoken program get live captions on request.",
  "accessibility.commitments.captions.status": "Available on request",
  "accessibility.commitments.lgp.title": "LGP interpretation",
  "accessibility.commitments.lgp.body":
    "Portuguese Sign Language interpretation for flagship events, booked in advance.",
  "accessibility.commitments.lgp.status": "Flagship events only",
  "accessibility.commitments.seating.title": "Seating, always",
  "accessibility.commitments.seating.body":
    "Every QueerPulse-run event guarantees seated space for anyone who needs it — no exceptions.",
  "accessibility.commitments.seating.status": "Guaranteed",
  "accessibility.commitments.sensory.title": "Sensory-friendly slots",
  "accessibility.commitments.sensory.body":
    "Lower-volume, lower-crowd windows at select gatherings for members who need them.",
  "accessibility.commitments.sensory.status": "Selected events",
  "accessibility.commitments.carers.title": "Carer welcome",
  "accessibility.commitments.carers.body":
    "Support people and carers attend free at any QueerPulse event.",
  "accessibility.commitments.carers.status": "Always free",
  "accessibility.commitments.platform.title": "An accessible platform",
  "accessibility.commitments.platform.body":
    "Screen-reader support, keyboard navigation and reduced-motion are built into the product itself, not bolted on.",
  "accessibility.commitments.platform.status": "In progress",
  "accessibility.commitments.accomTitle": "Need something we haven't listed?",
  "accessibility.commitments.accomBody":
    "Tell us what you need for a specific event and we'll do what we can, however last-minute.",
  "accessibility.commitments.accomCta": "Request an accommodation",
  "accessibility.resources.title": "Related <em>resources</em>",
  "accessibility.resources.body":
    "Support that goes beyond what QueerPulse itself can offer.",
  "accessibility.resources.openingToast": "Opening resource…",
  "accessibility.resources.benefits.eyebrow": "Financial",
  "accessibility.resources.benefits.title": "Disability benefits, explained",
  "accessibility.resources.benefits.body":
    "A plain-language guide to Portuguese disability benefits and how to apply.",
  "accessibility.resources.benefits.link": "Read the guide",
  "accessibility.resources.healthcare.eyebrow": "Healthcare",
  "accessibility.resources.healthcare.title":
    "Finding accessible, affirming care",
  "accessibility.resources.healthcare.body":
    "Vetted clinicians and clinics who take both accessibility and gender-affirming care seriously.",
  "accessibility.resources.healthcare.link": "See the list",
  "accessibility.resources.legal.eyebrow": "Legal",
  "accessibility.resources.legal.title": "Know your rights",
  "accessibility.resources.legal.body":
    "What Portuguese law actually guarantees disabled people, and who to call when it isn't honoured.",
  "accessibility.resources.legal.link": "Read more",
  "accessibility.resources.mentalHealth.eyebrow": "Mental health",
  "accessibility.resources.mentalHealth.title":
    "Support for chronic illness and disability",
  "accessibility.resources.mentalHealth.body":
    "Peer groups and therapists who understand the overlap between queerness and disability.",
  "accessibility.resources.mentalHealth.link": "Find support",
  "accessibility.peer.title": "Peer <em>mentorship</em>",
  "accessibility.peer.body":
    "Disabled members supporting each other — pairing newer members with someone who's navigated the same systems.",
  "accessibility.peer.joinCta": "Join as a mentee",
  "accessibility.peer.joiningToast":
    "You're on the list — we'll match you soon.",
  "accessibility.peer.mentorCta": "Become a mentor",
  "accessibility.outro.title": "Access is a <em>practice,</em> not a policy.",
  "accessibility.outro.sub":
    "Tell us where we're falling short. We'd rather know.",
  "accessibility.outro.cta": "Request an invite",
  "accessibility.venue.reviewedBy_one": "Reviewed by {count} disabled member",
  "accessibility.venue.reviewedBy_other":
    "Reviewed by {count} disabled members",
  "accessibility.venue.operatedBadge": "QueerPulse-operated space",
  "accessibility.venue.flagCta": "Flag an issue",
  "accessibility.flagIssues.stepFree": "Step-free access",
  "accessibility.flagIssues.bathroom": "Accessible bathroom",
  "accessibility.flagIssues.seating": "Seating",
  "accessibility.flagIssues.hearingLoop": "Hearing loop",
  "accessibility.flagIssues.sensory": "Sensory environment",
  "accessibility.flagIssues.staff": "Staff attitude",
  "accessibility.flagIssues.other": "Something else",
  "accessibility.flagModal.ariaLabel": "Flag an accessibility issue",
  "accessibility.flagModal.title": "Flag an accessibility issue",
  "accessibility.flagModal.sub":
    "Tell us what happened — this goes straight to the space and to our accessibility team.",
  "accessibility.flagModal.venueLabel": "Venue",
  "accessibility.flagModal.issueTypeLabel": "What kind of issue?",
  "accessibility.flagModal.issueTypePlaceholder": "Choose an issue type",
  "accessibility.flagModal.whatHappenedLabel": "What happened?",
  "accessibility.flagModal.whatHappenedPlaceholder":
    "Describe what you ran into",
  "accessibility.flagModal.whenLabel": "When?",
  "accessibility.flagModal.whenPlaceholder": "e.g. last weekend, 14 May",
  "accessibility.flagModal.submitCta": "Submit",
  "accessibility.flagModal.cancelCta": "Cancel",
  "accessibility.flagModal.doneTitle": "Thanks — <em>we've got it.</em>",
  "accessibility.flagModal.doneBody":
    "We'll follow up with the venue and update this listing if anything changes.",
  "accessibility.flagModal.closeCta": "Close",
  "accessibility.accomModal.ariaLabel": "Request an accommodation",
  "accessibility.accomModal.title": "Request an accommodation",
  "accessibility.accomModal.sub":
    "Tell us what you need for a specific event — the more notice, the more we can do.",
  "accessibility.accomModal.nameLabel": "Your name",
  "accessibility.accomModal.namePlaceholder": "Your name",
  "accessibility.accomModal.eventLabel": "Which event?",
  "accessibility.accomModal.eventPlaceholder": "Event name or date",
  "accessibility.accomModal.needLabel": "What do you need?",
  "accessibility.accomModal.needPlaceholder":
    "e.g. captions, a quiet room, step-free access",
  "accessibility.accomModal.contactLabel": "Best way to reach you",
  "accessibility.accomModal.contactPlaceholder": "Email or phone",
  "accessibility.accomModal.submitCta": "Send request",
  "accessibility.accomModal.cancelCta": "Cancel",
  "accessibility.accomModal.doneTitle": "Got it — <em>we're on it.</em>",
  "accessibility.accomModal.doneBody":
    "Someone from the team will follow up before the event.",
  "accessibility.accomModal.closeCta": "Close",

  // ── Activism ───────────────────────────────────────────────────────────
  "activism.backToVolunteer": "Back to Volunteering",
  "activism.hero.eyebrow": "Activism",
  "activism.hero.title": "Community care is <em>political.</em>",
  "activism.hero.sub":
    "Ways to get involved, locally and further out — from a Tuesday afternoon to a standing commitment.",
  "activism.nav.onThisPage": "On this page",
  "activism.nav.start": "Where to start",
  "activism.nav.local": "Locally",
  "activism.nav.skills": "Bring a skill",
  "activism.nav.mobilise": "Mobilise",
  "activism.nav.feel": "How it feels",
  "activism.nav.orgs": "Partner orgs",
  "activism.nav.volunteer": "Volunteer",
  "activism.conviction.local.word": "Local.",
  "activism.conviction.local.rest":
    "Change starts in the room you're already in.",
  "activism.conviction.real.word": "Real.",
  "activism.conviction.real.rest":
    "Not a repost. Something that costs you something.",
  "activism.conviction.yours.word": "Yours.",
  "activism.conviction.yours.rest":
    "Pick the form that fits your life right now.",
  "activism.start.title": "Where to <em>start</em>",
  "activism.start.p1":
    "You don't need to quit your job or join a party. Activism scales down to an afternoon.",
  "activism.start.p2":
    "Here's a ladder — pick the rung that matches what you have to give this month.",
  "activism.start.step1.title": "Show up once",
  "activism.start.step1.body":
    "Come to a gathering, a vigil, a community meeting. Presence is the first act.",
  "activism.start.step2.title": "Give a few hours",
  "activism.start.step2.body":
    "Pick one recurring slot — a helpline shift, an outreach afternoon, a stall at an event.",
  "activism.start.step3.title": "Bring a skill",
  "activism.start.step3.body":
    "Design, code, cooking, care work — orgs need all of it, not just picket signs.",
  "activism.start.step4.title": "Commit",
  "activism.start.step4.body":
    "Join a board, run a campaign, mentor someone newer to organising.",
  "activism.local.title": "Locally, <em>in Lisbon</em>",
  "activism.local.p1":
    "The fights closest to home rarely make headlines — housing, healthcare access, a venue under threat.",
  "activism.local.p2":
    "Right now, <b>Mouraria and Intendente</b> are the neighbourhoods where queer tenants need the most support.",
  "activism.local.banner.title": "Housing pressure in Mouraria",
  "activism.local.banner.body":
    "Several queer households are facing non-renewal notices this quarter. The Housing Advocate role below is a direct response.",
  "activism.skills.title": "Bring a <em>skill</em>",
  "activism.skills.p1":
    "Every organisation below needs more than volunteers with picket signs — they need your actual craft.",
  "activism.skills.design.title": "Design",
  "activism.skills.design.body":
    "Campaign materials, zines, signage — visual work that makes an argument land.",
  "activism.skills.tech.title": "Tech",
  "activism.skills.tech.body":
    "Websites, databases, digital security for organisers who need to stay safe online.",
  "activism.skills.food.title": "Food",
  "activism.skills.food.body":
    "Cooking for events, fundraisers, and mutual-aid meal programs.",
  "activism.skills.care.title": "Care work",
  "activism.skills.care.body":
    "Peer support, childcare during meetings, checking in on people who are struggling.",
  "activism.mobilise.title": "How to <em>mobilise</em>",
  "activism.mobilise.p1":
    "<b>Turn out, don't just show up.</b> Bring someone with you — numbers change what's politically possible.",
  "activism.mobilise.p2":
    "<b>Document, don't just witness.</b> Photos and notes from an action matter later, for accountability and for history.",
  "activism.mobilise.p3":
    "<b>Follow up, don't just attend.</b> The work after the march is where most of the actual change happens.",
  "activism.feel.title": "How it <em>feels</em>",
  "activism.feel.p1":
    "Burnout is real. Activism that only takes and never restores isn't sustainable — for you or for the movement.",
  "activism.feel.p2":
    "It's fine to step back. It's fine to do less than you think you should. Rest is part of the work, not a betrayal of it.",
  "activism.feel.banner.title": "If you're close to burnout",
  "activism.feel.banner.body":
    "Talk to peer support before you disappear entirely. Stepping back with a plan beats vanishing without one.",
  "activism.orgs.title": "Partner <em>organisations</em>",
  "activism.orgs.p1":
    "Four Portuguese organisations we work with directly — all of them welcome volunteers.",
  "activism.volunteer.title": "Open <em>roles</em>",
  "activism.volunteer.p1":
    "Current volunteer opportunities from our partner organisations, updated regularly.",
  "activism.volunteer.expressInterestCta": "Express interest",
  "activism.volunteer.seeAllCta": "See all volunteer roles",
  "activism.outro.title": "Pick a rung. <em>Start today.</em>",
  "activism.outro.sub":
    "The Board is where every listed role lives, refreshed as organisations post new ones.",
  "activism.outro.seeBoardCta": "See the volunteer board",

  // ── Code of Conduct ────────────────────────────────────────────────────
  "coc.meta.title": "QueerPulse's Code of Conduct: what's enforceable",
  "coc.meta.description":
    "The binding Code of Conduct QueerPulse enforces — six commitments members make, what counts as harm, how reports are handled, and how to appeal a decision.",
  "coc.hero.backLabel": "Governance",
  "coc.hero.eyebrow": "Code of Conduct · in effect since {date}",
  "coc.hero.title": "How we treat <em>each other here.</em>",
  "coc.hero.dek":
    "This is the binding document — <b>enforceable</b>, not aspirational. If a report is upheld, this is what we measure it against.",
  "coc.distinction.thisPage.title": "This page",
  "coc.distinction.thisPage.body":
    "The <b>Code of Conduct</b> — what's enforceable, what happens when it's broken, how to appeal.",
  "coc.distinction.sister.title": "Its sister document",
  "coc.distinction.sister.body":
    "The <b>Community Guidelines</b> describe the culture we're building. This page is what we act on.",
  "coc.toc.scope": "Scope",
  "coc.toc.pact": "The pact",
  "coc.toc.harm": "What we act on",
  "coc.toc.enforce": "Enforcement",
  "coc.toc.appeal": "Appeals",
  "coc.toc.offplatform": "Off-platform conduct",
  "coc.toc.changes": "Changes",
  "coc.scope.title": "§01 <em>Scope</em>",
  "coc.scope.p1":
    "This Code applies everywhere on QueerPulse — <strong>posts, messages, gatherings, comments, profiles</strong> — and to conduct off-platform when it directly affects another member's safety here.",
  "coc.scope.p2":
    "It applies to every member, <em>without exception</em> — founders, staff, moderators included.",
  "coc.scope.p3":
    "It does not apply to disagreement itself. Being wrong, or unpopular, is not a violation. <em>Causing harm is.</em>",
  "coc.pact.title": "§02 The <em>pact</em>",
  "coc.pact.lead": "Six commitments every member makes by joining.",
  "coc.pact.item01.title": "We show up as ourselves",
  "coc.pact.item01.body":
    "Bring your full identity. Nobody here is required to perform a more palatable version of themselves.",
  "coc.pact.item02.title": "We ask before we assume",
  "coc.pact.item02.body":
    "Pronouns, boundaries, comfort levels — check, don't guess.",
  "coc.pact.item03.title": "We keep this room private",
  "coc.pact.item03.body":
    "What happens here stays here, unless the person involved says otherwise.",
  "coc.pact.item04.title": "We take up appropriate space",
  "coc.pact.item04.body":
    "Notice when you're dominating a conversation. Make room for quieter voices.",
  "coc.pact.item05.title": "We repair, not just apologise",
  "coc.pact.item05.body":
    "A real apology changes the behaviour. Words alone aren't enough.",
  "coc.pact.item06.title": "We report harm, not just gossip about it",
  "coc.pact.item06.body":
    "If something's wrong, tell someone who can act on it — not just your group chat.",
  "coc.pact.closing":
    "None of us gets this perfectly right every time. The pact is the standard we hold each other to when we fall short.",
  "coc.harm.title": "§03 What we <em>act on</em>",
  "coc.harm.actOnHeading": "We act on",
  "coc.harm.actOn.personalAttacks.lead": "Personal attacks.",
  "coc.harm.actOn.personalAttacks.rest":
    "Insults, name-calling, or targeting someone rather than their argument.",
  "coc.harm.actOn.sustainedHarassment.lead": "Sustained harassment.",
  "coc.harm.actOn.sustainedHarassment.rest":
    "Repeated unwanted contact after being asked to stop.",
  "coc.harm.actOn.doxxing.lead": "Doxxing.",
  "coc.harm.actOn.doxxing.rest":
    "Sharing someone's real name, location, employer, or other identifying information without consent.",
  "coc.harm.actOn.intimidation.lead": "Intimidation.",
  "coc.harm.actOn.intimidation.rest":
    "Threats, implied or explicit, meant to silence or scare someone.",
  "coc.harm.actOn.badFaithFraming.lead": "Bad-faith framing.",
  "coc.harm.actOn.badFaithFraming.rest":
    "Deliberately misrepresenting what someone said to turn the community against them.",
  "coc.harm.frictionHeading": "We don't act on",
  "coc.harm.friction.disagreement.lead": "Disagreement.",
  "coc.harm.friction.disagreement.rest":
    "Including <em>strong</em> disagreement, expressed respectfully.",
  "coc.harm.friction.hurtFeelings.lead": "Hurt feelings alone.",
  "coc.harm.friction.hurtFeelings.rest":
    "Discomfort isn't the same as harm — we look at what was actually said or done.",
  "coc.harm.friction.criticism.lead": "Criticism of the platform.",
  "coc.harm.friction.criticism.rest":
    "Including criticism of us, the people who run it.",
  "coc.harm.friction.politicalViews.lead": "Political views you don't share.",
  "coc.harm.friction.politicalViews.rest":
    "As long as they don't target another member's identity or safety.",
  "coc.harm.closing":
    "The line is <em>impact</em>, not intent. “I didn't mean it that way” doesn't undo harm that landed.",
  "coc.enforce.title": "§04 <em>Enforcement</em>",
  "coc.enforce.lead":
    "A graduated ladder — most reports resolve at the first or second step.",
  "coc.ladder.step1.title": "A private word",
  "coc.ladder.step1.body":
    "A moderator reaches out directly, informally, before anything is on the record.",
  "coc.ladder.step2.title": "A formal warning",
  "coc.ladder.step2.body":
    "Documented, attached to the account. <em>One warning stays private</em> — it's not broadcast.",
  "coc.ladder.step3.title": "Temporary suspension",
  "coc.ladder.step3.body":
    "A cooling-off period, from days to weeks, depending on severity.",
  "coc.ladder.step4.title": "Removal from a space",
  "coc.ladder.step4.body":
    "Loss of access to a specific gathering, community, or channel — not the whole platform.",
  "coc.ladder.step5.title": "Removal from QueerPulse",
  "coc.ladder.step5.body":
    "Reserved for serious or repeated violations. <em>Always reviewable on appeal.</em>",
  "coc.report.title": "How to <em>report</em>",
  "coc.report.body":
    "Every report is read by a person, never auto-actioned. We aim to respond within 48 hours.",
  "coc.report.fileCta": "File a report",
  "coc.appeal.title": "§05 <em>Appeals</em>",
  "coc.appeal.p1":
    "Every enforcement decision can be appealed once, within <strong>14 days</strong>, to a different moderator than the one who made the original call.",
  "coc.appeal.p2":
    "Appeals are decided within <strong>7 days</strong>. The outcome is final, but the reasoning is always shared with you.",
  "coc.offplatform.title": "§06 <em>Off-platform</em> conduct",
  "coc.offplatform.lead":
    "This Code can extend to behaviour outside QueerPulse in two situations.",
  "coc.offplatform.case1.lead": "Direct harm to a member.",
  "coc.offplatform.case1.rest":
    "Harassment that started here and continues on another platform, aimed at a QueerPulse member.",
  "coc.offplatform.case2.lead": "Public conduct that endangers members.",
  "coc.offplatform.case2.rest":
    "Public statements or actions that would make a reasonable person <em>unsafe attending an event with you</em>.",
  "coc.offplatform.closing":
    "This is used <em>rarely and carefully</em> — it is never a general license to police members' lives outside the platform.",
  "coc.changes.title": "§07 <em>Changes</em>",
  "coc.changes.p1": "This Code was last published on {date}.",
  "coc.changelog.v21.lead": "v2.1 · {date}",
  "coc.changelog.v21.rest":
    "Clarified the off-platform conduct section and added the appeals timeline.",
  "coc.changelog.v20.lead": "v2.0 · {date}",
  "coc.changelog.v20.rest":
    "Rewrote the enforcement ladder from scratch, added the private-first-warning step.",
  "coc.changelog.v14.lead": "v1.4 · {date}",
  "coc.changelog.v14.rest":
    "Added doxxing and bad-faith framing as explicit violations.",
  "coc.changelog.v10.lead": "v1.0 · {date}",
  "coc.changelog.v10.rest":
    "First published version, ratified by the founding circle.",
  "coc.changes.seeChangelog":
    "See the full <changelogLink>changelog</changelogLink>.",
  "coc.version.label": "Version 2.1",
  "coc.version.ratifiedMeta": "Ratified {date}",
  "coc.version.downloadCta": "download as text",
  "coc.version.readManifesto": "read the Manifesto",
  "coc.download.headerTitle": "QueerPulse Code of Conduct",
  "coc.download.headerMeta": "In effect since {date}",
  "coc.download.intro":
    "This is the plain-text version of the binding Code of Conduct. See the web page for the full formatted version.",
  "coc.download.section01": "Scope",
  "coc.download.section02": "The pact",
  "coc.download.section03": "What we act on",
  "coc.download.section04": "Enforcement",
  "coc.download.section05": "Appeals",
  "coc.download.section06": "Off-platform conduct",
  "coc.download.section07": "Changes",
  "coc.download.mockNote":
    "(This is a prototype download — the production file will match the web page exactly.)",

  // ── Cookies ────────────────────────────────────────────────────────────
  "cookies.meta.title": "QueerPulse Cookie Policy and preferences",
  "cookies.meta.description":
    "Which cookies QueerPulse uses — essential, functional, and analytics — what each one does, and where to adjust your preferences. No advertising cookies.",
  "cookies.eyebrow": "Cookies",
  "cookies.h1": "What we <em>track,</em> and why.",
  "cookies.sub":
    "A short list, not a wall of legalese. Toggle what you're comfortable with below.",
  "cookies.essential.title": "Essential",
  "cookies.essential.body":
    "Needed to keep you signed in and your account secure. Can't be switched off.",
  "cookies.functional.title": "Functional",
  "cookies.functional.body":
    "Remember your preferences — theme, language, notification settings.",
  "cookies.analytics.title": "Analytics",
  "cookies.analytics.body":
    "Aggregate, privacy-respecting usage stats via Plausible. No cross-site tracking, no ad networks.",
  "cookies.expires.session": "Session",
  "cookies.expires.days30": "30 days",
  "cookies.expires.year1": "1 year",
  "cookies.expires.months6": "6 months",
  "cookies.alwaysOn": "Always on",
  "cookies.columns.name": "Name",
  "cookies.columns.expires": "Expires",
  "cookies.columns.provider": "Provider",
  "cookies.noAds.title": "We don't run ads",
  "cookies.noAds.body":
    "So there's no ad-tech cookie category here — nothing to sell your attention to.",
  "cookies.summary.title": "Your <em>summary</em>",
  "cookies.summary.essential": "Essential",
  "cookies.summary.functional": "Functional",
  "cookies.summary.analytics": "Analytics",
  "cookies.summary.on": "On",
  "cookies.summary.off": "Off",
  "cookies.actions.save": "Save preferences",
  "cookies.actions.acceptAll": "Accept all",
  "cookies.actions.essentialOnly": "Essential only",
  "cookies.info":
    "Change these any time in <settingsLink>Settings</settingsLink>. Full detail in the <privacyLink>Privacy Policy</privacyLink>.",
  "cookies.outro.title": "Questions about <em>your data?</em>",
  "cookies.outro.sub": "The Privacy Policy covers everything cookies don't.",
  "cookies.outro.cta": "Read the Privacy Policy",
  "cookies.toast.saved": "Cookie preferences saved",

  // ── Data Subject Access Requests (DSAR) ───────────────────────────────
  "dsar.backToPrivacyLabel": "Privacy Policy",
  "dsar.eyebrow": "Data rights",
  "dsar.h1": "Exercise your <em>data rights.</em>",
  "dsar.lead":
    "Under <b>GDPR</b>, you can ask for a copy of your data, a correction, or its deletion — <em>at no cost</em>.",
  "dsar.gdprStrip":
    "This request is handled under Articles 15–21 of the <b>GDPR</b>.",
  "dsar.rightLabel": "Which right do you want to exercise?",
  "dsar.rights.access.label": "Right of <em>access</em>",
  "dsar.rights.access.desc":
    "Get a copy of everything QueerPulse holds about you.",
  "dsar.rights.access.formTitle": "Request a copy of your data",
  "dsar.rights.access.formSub":
    "We'll compile everything tied to your account and send it to you.",
  "dsar.rights.rectification.label": "Right to rectification",
  "dsar.rights.rectification.desc":
    "Correct information about you that's inaccurate or incomplete.",
  "dsar.rights.rectification.formTitle": "Request a correction",
  "dsar.rights.rectification.formSub":
    "Tell us what's wrong and what it should say instead.",
  "dsar.rights.erasure.label": "Right to <em>erasure</em>",
  "dsar.rights.erasure.desc":
    "Ask us to delete your personal data, subject to legal retention limits.",
  "dsar.rights.erasure.formTitle": "Request deletion of your data",
  "dsar.rights.erasure.formSub":
    "This is separate from deleting your account — tell us exactly what you want removed.",
  "dsar.rights.objection.label": "Right to <em>object</em>",
  "dsar.rights.objection.desc":
    "Object to a specific way we're using your data, such as analytics.",
  "dsar.rights.objection.formTitle": "Object to a use of your data",
  "dsar.rights.objection.formSub":
    "Tell us which processing you're objecting to.",
  "dsar.artPrefix": "Article {number}",
  "dsar.toast.showingForm": "Showing the form for Article {article}",
  "dsar.requestLabel": "Request:",
  "dsar.form.accountLabel": "Your account",
  "dsar.form.whatChanged.label": "What needs to change?",
  "dsar.form.whatChanged.helper":
    "Be as specific as you can — this speeds up the review.",
  "dsar.form.whatChanged.placeholder":
    "Describe what should be corrected, deleted, or objected to",
  "dsar.form.scopeLabel": "Which data does this cover?",
  "dsar.scopes.profile.b": "Profile",
  "dsar.scopes.profile.s": "Name, bio, photos, pronouns",
  "dsar.scopes.connections.b": "Connections",
  "dsar.scopes.connections.s": "Vouches, invites, your network",
  "dsar.scopes.activity.b": "Activity",
  "dsar.scopes.activity.s": "Posts, comments, RSVPs, messages",
  "dsar.scopes.billing.b": "Billing",
  "dsar.scopes.billing.s": "Membership tier, payment history",
  "dsar.scopes.moderation.b": "Moderation",
  "dsar.scopes.moderation.s": "Reports you filed or were named in",
  "dsar.form.docs.label": "Supporting documents",
  "dsar.form.docs.optional": "(optional)",
  "dsar.form.docs.helper":
    "Attach anything that helps us verify or process the request — <em>never required</em> to submit.",
  "dsar.form.contextLabel": "Anything else we should know?",
  "dsar.form.contextPlaceholder": "Extra context for our team",
  "dsar.legalStrip":
    "We'll respond within <b>30 days</b>, as required by law. See <link>data retention</link> for how long we keep things by default.",
  "dsar.actions.info":
    "Requests are reviewed by a person on our privacy team — <b>never fully automated</b>.",
  "dsar.actions.submit": "Submit request",
  "dsar.actions.submitting": "Sending…",
  "dsar.past.heading": "Your past requests",
  "dsar.past.submitted": "Submitted {date}",
  "dsar.past.responded": "Responded {date}",
  "dsar.past.respondedWithDuration": "Responded {date} · {duration}",
  "dsar.past.resolved": "Resolved",
  "dsar.past.status.received": "Received",
  "dsar.past.status.inReview": "In review",
  "dsar.past.status.rejected": "Rejected",
  "dsar.past.loading": "Loading your past requests…",
  "dsar.past.error": "We couldn't load your past requests. Please try again shortly.",
  "dsar.past.empty": "You haven't filed any requests yet.",
  "dsar.past.objectAnalytics": "Objection · Analytics",
  "dsar.toast.submitted": "Request submitted — reference {ref}",
  "dsar.toast.submitError":
    "We couldn't record that request — nothing was sent. Mind trying again?",

  // ── Community Guidelines ──────────────────────────────────────────────
  "guidelines.meta.title": "QueerPulse Community Guidelines",
  "guidelines.meta.description":
    "The culture we're building together on QueerPulse — how to show up, disagree well, and keep the space safe, distinct from the enforceable Code of Conduct.",
  "guidelines.hero.eyebrow": "Community Guidelines",
  "guidelines.hero.title": "The culture we're <em>building together.</em>",
  "guidelines.hero.sub":
    "Not enforceable rules — that's the Code of Conduct. This is what good looks like here.",
  "guidelines.updatedMeta": "Last revised {date}",
  "guidelines.clause01.titlePre": "Show up as ",
  "guidelines.clause01.titleEm": "yourself",
  "guidelines.clause01.p1":
    "There's no dress code for identity here. However you show up today is enough.",
  "guidelines.clause01.p2":
    "That includes being unsure, questioning, or somewhere between labels. Nobody needs a finished answer to belong.",
  "guidelines.clause02.titlePre": "Assume ",
  "guidelines.clause02.titleEm": "good faith",
  "guidelines.clause02.p1":
    "Most friction here comes from misunderstanding, not malice. Ask before you assume the worst.",
  "guidelines.clause02.li1": "Read a message twice before reacting to it.",
  "guidelines.clause02.li2":
    "Ask a clarifying question instead of assuming intent.",
  "guidelines.clause02.li3": "Give people room to phrase something clumsily.",
  "guidelines.clause02.li4": "Assume you might be missing context.",
  "guidelines.clause02.li5": "Disagree with the point, not the person.",
  "guidelines.clause02.p2":
    "Good faith isn't infinite — repeated bad behaviour stops getting the benefit of the doubt.",
  "guidelines.clause03.titlePre": "Take up ",
  "guidelines.clause03.titleEm": "appropriate space",
  "guidelines.clause03.p1":
    "Notice the size of the room you're in and the size of the space you're taking up in it.",
  "guidelines.clause03.p2":
    "Newer members especially: it's okay to lurk before you post. There's no quota to meet.",
  "guidelines.clause03.p3Lead": "The unwritten rule:",
  "guidelines.clause03.p3Rest":
    "if you've spoken five times before someone else has spoken once, make room.",
  "guidelines.clause04.titlePre": "Keep the room ",
  "guidelines.clause04.titleEm": "private",
  "guidelines.clause04.p1":
    "What's shared in a gathering, a support space, or a private community stays there unless the person says otherwise.",
  "guidelines.clause04.p2":
    "This includes screenshots. Ask before you share anything that came from inside QueerPulse.",
  "guidelines.clause05.titlePre": "Repair, don't just ",
  "guidelines.clause05.titleEm": "apologise",
  "guidelines.clause05.p1":
    "A good apology names what happened, acknowledges the impact, and changes the behaviour going forward.",
  "guidelines.clause05.p2":
    "“Sorry you feel that way” isn't a repair. It's a deflection.",
  "guidelines.clause06.titlePre": "Rest is ",
  "guidelines.clause06.titleEm": "part of it",
  "guidelines.clause06.p1":
    "Nobody owes this community constant availability. Step back when you need to.",
  "guidelines.clause06.p2":
    "A healthy community has room for people to come and go without explanation.",
  "guidelines.clause07.titlePre": "Know the ",
  "guidelines.clause07.titleEm": "hard lines",
  "guidelines.clause07.p1":
    "Guidelines describe culture. Some things cross into the Code of Conduct, enforceable territory:",
  "guidelines.clause07.hardLinesHead": "Always a Code of Conduct matter",
  "guidelines.clause07.li1": "Harassment or targeted personal attacks",
  "guidelines.clause07.li2":
    "Doxxing or sharing someone's identifying information",
  "guidelines.clause07.li3": "Outing someone without their consent",
  "guidelines.clause07.li4": "Threats or intimidation",
  "guidelines.clause07.li5":
    "Sharing private conversations or photos without consent",
  "guidelines.clause07.li6": "Discrimination on any protected basis",
  "guidelines.final.titlePre": "One more ",
  "guidelines.final.titleEm": "thing",
  "guidelines.final.p1":
    "None of us gets this perfectly right every time. What matters is <b>how you repair</b> when you fall short, not whether you ever do.",
  "guidelines.final.p2": "Thanks for building this with us.",
  "guidelines.outro.title": "Now you know <em>the culture.</em>",
  "guidelines.outro.sub":
    "The Code of Conduct covers what happens if it's broken.",
  "guidelines.outro.backCta": "Back to home",

  // ── Help ───────────────────────────────────────────────────────────────
  "help.meta.title": "QueerPulse help centre: invites, safety, gatherings",
  "help.meta.description":
    "Answers to common QueerPulse questions — how invites work, managing your account, RSVPs and hosting gatherings, reporting and appeals, and membership tiers.",
  "help.hero.eyebrow": "Help",
  "help.hero.title": "Questions, <em>answered.</em>",
  "help.hero.sub": "Search below, or browse by topic.",
  "help.category.gettingStarted.label": "Getting started",
  "help.category.gettingStarted.head": "Getting <em>started</em>",
  "help.category.account.label": "Account",
  "help.category.account.head": "Your <em>account</em>",
  "help.category.gatherings.label": "Gatherings",
  "help.category.gatherings.head": "<em>Gatherings</em>",
  "help.category.safety.label": "Safety",
  "help.category.safety.head": "<em>Safety</em>",
  "help.category.membership.label": "Membership",
  "help.category.membership.head": "<em>Membership</em>",
  "help.category.technical.label": "Technical",
  "help.category.technical.head": "<em>Technical</em>",
  "help.qa.invite.q": "How do I get invited?",
  "help.qa.invite.a":
    "Someone already on QueerPulse <strong>vouches</strong> for you and sends an invite, or you can <strong>request an invite</strong> and we'll match you with someone in the community.",
  "help.qa.afterAccept.q": "What happens after I accept an invite?",
  "help.qa.afterAccept.a":
    "You'll set up your profile, and your account is active immediately — no waiting period.",
  "help.qa.lisbonOnly.q": "Is QueerPulse only for people in Lisbon?",
  "help.qa.lisbonOnly.a":
    "Gatherings are Lisbon-based, but membership itself isn't location-locked — plenty of members join remotely for the network and the magazine.",
  "help.qa.free.q": "Is QueerPulse free?",
  "help.qa.free.a":
    "Yes — QueerPulse is free to join and use.",
  "help.qa.changeName.q": "How do I change my name or pronouns?",
  "help.qa.changeName.a":
    "Head to <settingsLink>Settings</settingsLink> → Profile. Changes apply everywhere immediately.",
  "help.qa.privateProfile.q": "Can I make my profile private?",
  "help.qa.privateProfile.a":
    "Yes, in <settingsLink>Settings</settingsLink> → Privacy. A private profile is still visible to people you're connected with — it just <strong>won't appear in search or the public directory</strong>.",
  "help.qa.deleteAccount.q": "How do I delete my account?",
  "help.qa.deleteAccount.a":
    "In <settingsLink>Settings</settingsLink> → Account, at the bottom. This is permanent — see the Privacy Policy for what's retained and for how long.",
  "help.qa.levels.q": "What do the different member levels mean?",
  "help.qa.levels.a":
    "Levels reflect how long you've been vouched into the community and your activity — they're not a paywall, just a trust signal.",
  "help.qa.rsvp.q": "How do RSVPs work?",
  "help.qa.rsvp.a":
    "Confirm on the event page via the <calendarLink>calendar</calendarLink> or events board. <strong>Spots are limited</strong> at most gatherings, so RSVP early.",
  "help.qa.hostGathering.q": "Can I host my own gathering?",
  "help.qa.hostGathering.a":
    "Yes — see the <hostLink>hosting guide</hostLink> for a step-by-step walkthrough.",
  "help.qa.cantMakeIt.q": "I RSVP'd but can't make it — what do I do?",
  "help.qa.cantMakeIt.a":
    "Cancel your RSVP from the event page as soon as you know, so someone on the waitlist can take your spot.",
  "help.qa.waitlist.q": "How does the waitlist work?",
  "help.qa.waitlist.a":
    "You're notified automatically the moment a spot opens, with a short window to claim it before it moves to the next person.",
  "help.qa.reportMember.q": "How do I report another member?",
  "help.qa.reportMember.a":
    "From their profile, a post, or a message, use the report option — every report goes to a human moderator.",
  "help.qa.afterReport.q": "What happens after I file a report?",
  "help.qa.afterReport.a":
    "We aim to respond within 48 hours. <strong>You'll hear back either way</strong>, even if we decide no action is needed.",
  "help.qa.appeal.q": "Can I appeal a moderation decision?",
  "help.qa.appeal.a":
    "Yes — every decision can be appealed once, reviewed by a different moderator. See <governanceLink>Governance</governanceLink> for the full process.",
  "help.qa.blockMute.q": "What's the difference between blocking and muting?",
  "help.qa.blockMute.a":
    "<strong>Blocking</strong> removes all contact both ways. <strong>Muting</strong> just hides someone from your feed — they can't tell either has happened.",
  "help.qa.invitesWork.q": "How many invites do I get?",
  "help.qa.invitesWork.a":
    "Every member starts with a small pool of invites that refills over time, based on how the community is growing.",
  "help.qa.vouching.q": "What does vouching actually mean?",
  "help.qa.vouching.a":
    "When you vouch for someone, you're telling the community you trust them to be here — it's a real signal, not a formality.",
  "help.qa.perks.q": "What do I get as a Sustainer?",
  "help.qa.perks.a":
    "Early access to events, a supporter badge, and the knowledge that your membership keeps the platform ad-free.",
  "help.qa.emailNotifications.q": "How do I control email notifications?",
  "help.qa.emailNotifications.a":
    "In <settingsLink>Settings</settingsLink> → Notifications, toggle each category independently.",
  "help.qa.browserSupport.q": "Which browsers does QueerPulse support?",
  "help.qa.browserSupport.a":
    "Current versions of Chrome, Firefox, Safari, and Edge. Older browsers may have display issues.",
  "help.qa.somethingBroken.q": "Something's broken — what do I do?",
  "help.qa.somethingBroken.a":
    "Try refreshing first. If it persists, <contactLink>let us know</contactLink> with as much detail as you can.",
  "help.stillStuck.title": "Still stuck?",
  "help.stillStuck.body":
    "A real person reads every message that comes through here.",
  "help.stillStuck.cta": "Contact us",
  "help.subpageIndex.title": "Related",
  "help.subpageIndex.accessibility.label": "Accessibility",
  "help.subpageIndex.accessibility.blurb":
    "Accessible spaces, accommodations, and our access commitments.",

  // ── Shared legal-doc chrome (Terms / Privacy) ─────────────────────────
  "legal.eyebrow": "Legal",
  "legal.plainSummaryTitle": "In plain language",
  "legal.toc.title": "Contents",
  "legal.contact.emailCta": "Email us",

  // ── List Your Business (wizard step pills) ────────────────────────────
  "listBusiness.wizard.pill.path": "Path",
  "listBusiness.wizard.pill.basics": "Basics",
  "listBusiness.wizard.pill.story": "Story",
  "listBusiness.wizard.pill.practical": "Practical",
  "listBusiness.wizard.pill.photos": "Photos",
  "listBusiness.wizard.pill.review": "Review",

  // ── Partners ───────────────────────────────────────────────────────────
  "partners.meta.title": "QueerPulse's partner organisations in Portugal",
  "partners.meta.description":
    "The organisations QueerPulse partners with in Portugal and beyond — each vetted for alignment with our values before being listed, never a paid placement.",
  "partners.hero.eyebrow": "Partners",
  "partners.hero.title": "Organisations we <em>stand with.</em>",
  "partners.hero.sub":
    "Vetted partners across Portugal and beyond, working alongside QueerPulse on the ground.",
  "partners.interstitial.quote":
    "We don't partner with everyone who asks. <em>We partner with people already doing the work.</em>",
  "partners.interstitial.body":
    "Every organisation below has been reviewed for alignment with our values before appearing here.",
  "partners.section.title": "Our <em>partners</em>",
  "partners.section.sub":
    "Filter isn't available yet — here's the full roster.",
  "partners.card.viewCta": "View profile",
  "partners.loadingMore": "Loading more partners…",
  "partners.loadMoreCta": "Load more partners",
  "partners.why.title": "Why we <em>partner</em>",
  "partners.why.p1":
    "QueerPulse can't do everything — legal aid, healthcare, youth work all need dedicated expertise we don't have in-house.",
  "partners.why.p2":
    "Partnering means we can point members toward organisations we've actually vetted, instead of a generic search result.",
  "partners.why.p3":
    "It also means real resources move: <strong>referrals, volunteer hours, and in some cases funding.</strong>",
  "partners.why.p4": "None of these organisations pay to be listed here.",
  "partners.become.title": "Want to <em>partner with us?</em>",
  "partners.become.body":
    "If your organisation does aligned work in or around Lisbon, we'd like to hear from you.",
  "partners.become.applyCta": "Apply to partner",
  "partners.outro.title": "Know an org that <em>should be here?</em>",
  "partners.outro.sub": "Tell us — we're always looking for aligned partners.",

  // ── Press Kit ──────────────────────────────────────────────────────────
  "pressKit.meta.title": "QueerPulse press kit: logos, facts, photography",
  "pressKit.meta.description":
    "Everything a journalist needs to write about QueerPulse — pre-cleared boilerplate, marks, photography, key facts, and a direct press contact.",
  "pressKit.hero.eyebrow": "Press",
  "pressKit.hero.title": "Everything you need to <em>write about us.</em>",
  "pressKit.hero.dek":
    "Boilerplate, marks, photography, and facts — <b>pre-cleared</b> for direct use, no sign-off required.",
  "pressKit.hero.downloadKitCta": "Download the full kit",
  "pressKit.hero.askPersonCta": "Ask a real person",
  "pressKit.contact.deskLabel": "<b>Press desk:</b>",
  "pressKit.contact.phoneLabel": "<b>By phone</b>, on request",
  "pressKit.contact.responseLabel": "We respond within <b>48 hours</b>",
  "pressKit.contact.languagesLabel": "<b>EN / PT</b>",
  "pressKit.footerNote.licence":
    "All assets here are released under a <a>CC BY 4.0</a> licence for editorial use.",
  "pressKit.footerNote.commercial":
    "For commercial use, <a>get in touch</a> first.",
  "pressKit.outro.title": "Still need <em>something specific?</em>",
  "pressKit.outro.sub":
    "Ask the press desk directly — most requests get a same-day reply.",
  "pressKit.outro.contactCta": "Email the press desk",
  "pressKit.downloadModal.eyebrow": "Full kit · ZIP",
  "pressKit.downloadModal.title": "Download the <em>complete kit.</em>",
  "pressKit.downloadModal.lead":
    "Everything on this page in one file — <b>38 MB</b>, ready for your CMS.",
  "pressKit.downloadModal.buttonLabel": "Download · ZIP",
  "pressKit.subpageIndex.title": "Related",
  "pressKit.subpageIndex.archive.label": "Press archive",
  "pressKit.subpageIndex.archive.blurb":
    "Every past mention and feature, in one place.",
  "pressKit.modal.dialogAriaLabel": "Download asset",
  "pressKit.modal.closeAriaLabel": "Close",
  "pressKit.modal.success.title": "Downloaded — <em>you're set.</em>",
  "pressKit.modal.success.body":
    "<b>{filename}</b> should be in your downloads folder now.",
  "pressKit.modal.closeCta": "Close",
  "pressKit.modal.cancelCta": "Cancel",
  "pressKit.readme.heading": "QUEERPULSE PRESS KIT",
  "pressKit.readme.updated":
    "Updated regularly — see queerpulse.app/press for the latest.",
  "pressKit.readme.licenceHeading": "LICENCE",
  "pressKit.readme.licenceBody":
    "All assets are released under CC BY 4.0 for editorial use. Contact press@queerpulse.pt for commercial licensing.",
  "pressKit.readme.contentsHeading": "CONTENTS",
  "pressKit.readme.contents.boilerplate": "Boilerplate (3 lengths)",
  "pressKit.readme.contents.marks": "Marks (SVG)",
  "pressKit.readme.contents.colour": "Colour system",
  "pressKit.readme.contents.photography": "Photography (6 images)",
  "pressKit.readme.contents.spokespeople": "Spokespeople",
  "pressKit.readme.contents.factSheet": "Fact sheet",
  "pressKit.readme.contents.transparencyReport": "2025 transparency report",
  "pressKit.readme.pressDeskHeading": "PRESS DESK",
  "pressKit.readme.hours": "9am–6pm WET",
  "pressKit.readme.responseTime": "We respond within 48 hours.",
  "pressKit.readme.prototypeNote":
    "This is a prototype download — the production file will match the web page exactly.",
  "pressKit.readme.boilerHeading": "QUEERPULSE — APPROVED BOILERPLATE",
  "pressKit.readme.boilerCleared":
    "Both lengths are cleared for direct quotation without further sign-off.",
  "pressKit.preview.readme.title": "README + licence",
  "pressKit.preview.readme.desc": "Usage terms and file index",
  "pressKit.preview.marks.title": "Marks · SVG",
  "pressKit.preview.marks.desc": "3 variations, vector",
  "pressKit.preview.marksPng.title": "Marks · PNG @ 2x",
  "pressKit.preview.marksPng.desc": "For docs and slides",
  "pressKit.preview.photography.title": "Photography",
  "pressKit.preview.photography.desc": "6 model-released images",
  "pressKit.preview.boilerplate.title": "Boilerplate",
  "pressKit.preview.boilerplate.desc": "Short and medium lengths",
  "pressKit.preview.factSheet.title": "Fact sheet",
  "pressKit.preview.factSheet.desc": "One-page printable PDF",
  "pressKit.boiler.short.wc": "25 words · 154 char",
  "pressKit.boiler.short.text":
    "QueerPulse is a queer professional network rooted in Lisbon — connecting LGBTQ+ professionals, creatives, activists and community members for work, community, culture and mutual support.",
  "pressKit.boiler.med.wc": "60 words · 408 char",
  "pressKit.boiler.med.text":
    "QueerPulse is a queer professional network rooted in Lisbon, founded in 2024. We connect LGBTQ+ professionals, creatives, activists and community members for work, community, culture and mutual support. Membership is by invitation, operationally protected, and free at the solidarity tier. The platform runs a magazine, a podcast, a safe-spaces network, and a micro-grants fund disbursed by the community itself.",
  "pressKit.downloads.boilerplate.title": "Boilerplate",
  "pressKit.placeholderFile.line1":
    "This is a placeholder file generated for the prototype.",
  "pressKit.placeholderFile.line2":
    "The production kit will include the real production-ready asset.",

  // ── Privacy Policy ─────────────────────────────────────────────────────
  "privacy.meta.title": "QueerPulse Privacy Policy: what we collect and why",
  "privacy.meta.description":
    "What data QueerPulse collects, how it's used, who can see it, how long it's kept, and how to exercise your data rights — including a plain-language summary.",
  "privacy.title": "Privacy <em>Policy</em>",
  "privacy.meta.effective": "Effective {date}",
  "privacy.meta.lastUpdated": "Last updated {date}",
  "privacy.meta.version": "Version {version}",
  "privacy.plain.text":
    "We collect what we need to run the platform, never sell your data, and give you real control over what's shared and with whom. The details are below.",
  "privacy.contactCta":
    "Questions about this policy? <strong>Reach out any time</strong> — we'll answer in plain language, not legalese.",
  "privacy.related.title": "Related",
  "privacy.related.dataRequestLabel": "Request your data",
  "privacy.related.dataRequestBlurb":
    "Access, correct, or delete your personal data under GDPR.",
  "privacy.whoWeAre.title": "Who we are",
  "privacy.whoWeAre.p1":
    "QueerPulse is operated by Associação QueerPulse, a not-for-profit registered in Portugal. This policy explains how we handle your personal data across the platform.",
  "privacy.whoWeAre.p2":
    "If anything here is unclear, contact us directly — we'd rather explain it than have you guess.",
  "privacy.whatWeCollect.title": "What we collect",
  "privacy.whatWeCollect.accountHeading": "Account information",
  "privacy.whatWeCollect.account.item1":
    "<strong>Profile details</strong> you provide — name, pronouns, bio, photos.",
  "privacy.whatWeCollect.account.item2":
    "<strong>Contact information</strong> — your email address, used for sign-in and notifications.",
  "privacy.whatWeCollect.account.item3":
    "<strong>Membership data</strong> — your tier, join date, and who vouched for you.",
  "privacy.whatWeCollect.account.item4":
    "<strong>Billing information</strong>, for Sustainer members — handled by our payment processor, never stored on our servers.",
  "privacy.whatWeCollect.activityHeading": "Activity data",
  "privacy.whatWeCollect.activity.item1":
    "<strong>Posts, comments, and messages</strong> you send on the platform.",
  "privacy.whatWeCollect.activity.item2":
    "<strong>Event RSVPs and attendance</strong>, so gatherings can plan around headcount.",
  "privacy.whatWeCollect.activity.item3":
    "<strong>Basic usage data</strong> — pages visited, features used — aggregated and anonymised for analytics.",
  "privacy.whatWeCollect.notCollectedHeading": "What we don't collect",
  "privacy.whatWeCollect.notCollectedBody":
    "We don't track you across other websites, sell data to advertisers, or build an advertising profile of you. There's no ad network on this platform to feed.",
  "privacy.howWeUse.title": "How we use it",
  "privacy.howWeUse.intro": "Your data is used only to:",
  "privacy.howWeUse.item1": "Run your account and keep you signed in securely",
  "privacy.howWeUse.item2": "Show you gatherings and content relevant to you",
  "privacy.howWeUse.item3": "Process membership and Sustainer payments",
  "privacy.howWeUse.item4":
    "Keep the platform safe — investigating reports, enforcing the Code of Conduct",
  "privacy.howWeUse.item5": "Send you notifications you've opted into",
  "privacy.howWeUse.item6":
    "Understand aggregate usage, to improve the product",
  "privacy.howWeUse.p1":
    "We never use your data to train third-party AI models or sell it to advertisers.",
  "privacy.whoSees.title": "Who sees your data",
  "privacy.whoSees.p1":
    "<strong>Other members</strong> see what your privacy settings allow — your public profile, posts, and anything you choose to share.",
  "privacy.whoSees.p2":
    "<strong>Our small team</strong> can access account data to provide support, investigate reports, and keep the platform running.",
  "privacy.whoSees.p3":
    "<strong>Service providers</strong> — our hosting, email, and payment processors — see only what's needed to do their specific job, under contract.",
  "privacy.whoSees.p4":
    "<strong>Nobody else.</strong> We don't sell or rent your data to any third party, ever.",
  "privacy.retention.title": "How long we keep it",
  "privacy.retention.p1":
    "Account data is kept for as long as your account is active.",
  "privacy.retention.p2":
    "If you delete your account, most personal data is removed within 30 days, except where we're legally required to retain it (e.g. billing records).",
  "privacy.retention.p3":
    "Gathering attendance data is deleted 30 days after the event, per our gatherings data policy.",
  "privacy.yourRights.title": "Your rights",
  "privacy.yourRights.intro": "Under GDPR, you have the right to:",
  "privacy.yourRights.item1":
    "<strong>Access</strong> — get a copy of everything we hold about you",
  "privacy.yourRights.item2":
    "<strong>Rectification</strong> — correct anything that's wrong",
  "privacy.yourRights.item3":
    "<strong>Erasure</strong> — ask us to delete your data",
  "privacy.yourRights.item4":
    "<strong>Objection</strong> — object to a specific use of your data",
  "privacy.yourRights.item5":
    "<strong>Portability</strong> — receive your data in a portable format",
  "privacy.yourRights.item6":
    "<strong>Restriction</strong> — limit how we process your data while a dispute is resolved",
  "privacy.yourRights.p1":
    "To exercise any of these, use our data request form — it's free and we respond within 30 days.",
  "privacy.yourRights.p2":
    "You can also lodge a complaint with the Comissão Nacional de Proteção de Dados (CNPD), Portugal's data protection authority.",
  "privacy.cookiesSection.title": "Cookies",
  "privacy.cookiesSection.p1":
    "We use a small number of cookies to keep you signed in, remember your preferences, and understand aggregate usage.",
  "privacy.cookiesSection.p2":
    "We don't use advertising or cross-site tracking cookies — there's no ad network here to feed.",
  "privacy.cookiesSection.p3":
    "See the full <strong>Cookie Policy</strong> for the complete list, and <em>manage your preferences</em> any time.",
  "privacy.thirdParties.title": "Third parties",
  "privacy.thirdParties.intro":
    "We work with a small number of service providers, each bound by contract to use your data only for the service they provide:",
  "privacy.thirdParties.item1":
    "<strong>Hosting</strong> — where the platform runs",
  "privacy.thirdParties.item2":
    "<strong>Email delivery</strong> — for notifications and account emails",
  "privacy.thirdParties.item3":
    "<strong>Payment processing</strong> — for Sustainer memberships, never touching your card details directly",
  "privacy.thirdParties.optInIntro":
    "With your <strong>explicit opt-in</strong>, we also use:",
  "privacy.thirdParties.optItem1":
    "<strong>Plausible Analytics</strong> — privacy-respecting, cookie-light usage stats",
  "privacy.thirdParties.optItem2":
    "<strong>Calendar integrations</strong> — if you choose to sync events to Google or Apple Calendar",
  "privacy.thirdParties.outro":
    "We never share your data with data brokers or advertising networks.",
  "privacy.changes.title": "Changes to this policy",
  "privacy.changes.p1":
    "We'll post material changes as an in-app notice before they take effect.",
  "privacy.changes.p2":
    "Minor clarifications may be published without notice — the version number and date at the top of this page always reflect the current text.",
  "privacy.contactSection.title": "Contact",
  "privacy.contactSection.body":
    "Questions about this policy or your data? Email <a>privacy@queerpulse.pt</a> and a real person will respond.",

  // ── Terms of Service ───────────────────────────────────────────────────
  "terms.meta.title": "QueerPulse Terms of Service",
  "terms.meta.description":
    "The rules for using QueerPulse — eligibility, account conduct, content ownership, event participation, and what happens if the terms are broken.",
  "terms.title": "Terms of <em>Service</em>",
  "terms.meta.effective": "Effective {date}",
  "terms.meta.lastUpdated": "Last updated {date}",
  "terms.meta.version": "Version {version}",
  "terms.plain.text":
    "Be who you are, treat each other well, and don't use QueerPulse to harm anyone. The full terms are below.",
  "terms.contactCta":
    "Questions about these terms? <strong>Reach out any time.</strong>",
  "terms.eligibility.title": "Eligibility",
  "terms.eligibility.p1":
    "QueerPulse is open to anyone 18 or older who is invited or vouched into the community.",
  "terms.eligibility.p2":
    "By joining, you confirm that <strong>the information on your profile is accurate</strong> to the best of your knowledge.",
  "terms.eligibility.p3":
    "We reserve the right to decline or remove membership from anyone who doesn't meet these terms.",
  "terms.account.title": "Your account",
  "terms.account.p1":
    "You're responsible for keeping your login credentials secure and for all activity under your account.",
  "terms.account.p2":
    "Let us know immediately if you suspect unauthorised access to your account.",
  "terms.account.p3":
    "You may delete your account at any time from Settings; see our Privacy Policy for what's retained afterward.",
  "terms.conduct.title": "Conduct",
  "terms.conduct.intro": "By using QueerPulse, you agree not to:",
  "terms.conduct.item1": "Harass, threaten, or intimidate other members",
  "terms.conduct.item2":
    "Share someone's private information without their consent",
  "terms.conduct.item3": "Impersonate another person or organisation",
  "terms.conduct.item4":
    "Use the platform for unsolicited commercial promotion",
  "terms.conduct.item5":
    "Attempt to circumvent our security or access controls",
  "terms.conduct.item6": "Violate the Code of Conduct in any other way",
  "terms.conduct.highlight":
    "Violations may result in a warning, suspension, or removal, per the enforcement ladder in our Code of Conduct.",
  "terms.content.title": "Content",
  "terms.content.p1":
    "You retain ownership of everything you post. By posting, you grant QueerPulse a <strong>limited licence</strong> to display it on the platform.",
  "terms.content.p2":
    "You're responsible for the content you share and confirm you have the right to share it.",
  "terms.content.p3":
    "We may remove content that violates the Code of Conduct or these terms.",
  "terms.content.magazineHeading": "Magazine and creative submissions",
  "terms.content.magazineBody":
    "Additional terms apply to magazine pitches and creative submissions — see the submission guidelines when you pitch.",
  "terms.events.title": "Gatherings and events",
  "terms.events.p1":
    "Gatherings are organised by members and QueerPulse; each carries its own attendance and cancellation terms shown on the event page.",
  "terms.events.p2":
    "Ticket prices for sliding-scale events are set by hosts within the platform's required tiers — QueerPulse takes no percentage of ticket revenue.",
  "terms.events.p3":
    "You're expected to follow the Code of Conduct and any venue-specific rules at every gathering.",
  "terms.events.p4":
    "Hosts may remove attendees who violate the Code of Conduct at their event, at their discretion.",
  "terms.termination.title": "Termination",
  "terms.termination.intro": "We may suspend or terminate your account if you:",
  "terms.termination.item1": "Violate the Code of Conduct or these terms",
  "terms.termination.item2":
    "Provide false information during signup or verification",
  "terms.termination.item3": "Engage in behaviour that endangers other members",
  "terms.termination.p1":
    "Where possible, we'll notify you of the reason and give you a chance to appeal, per our Code of Conduct's appeals process.",
  "terms.termination.p2":
    "You may also close your account voluntarily at any time.",
  "terms.liability.title": "Liability",
  "terms.liability.p1":
    "QueerPulse is provided “as is”. We work hard to keep it running smoothly but can't guarantee it will always be available or error-free.",
  "terms.liability.p2":
    "We aren't responsible for the conduct of members at gatherings, though we take reports seriously and act on them.",
  "terms.liability.p3":
    "To the extent permitted by law, our liability is limited to the amount you've paid us in the past 12 months, if any.",
  "terms.liability.highlight":
    "Nothing in these terms limits liability for anything that can't legally be limited, including gross negligence or wilful misconduct.",
  "terms.changesTerms.title": "Changes to these terms",
  "terms.changesTerms.p1":
    "We'll post material changes as an in-app notice before they take effect.",
  "terms.changesTerms.p2":
    "Continuing to use QueerPulse after changes take effect means you accept the updated terms.",
  "terms.law.title": "Governing law",
  "terms.law.p1": "These terms are governed by Portuguese law.",
  "terms.law.p2":
    "Any disputes will be resolved in the courts of Lisbon, Portugal, unless local consumer-protection law requires otherwise.",
  "terms.contactSection.title": "Contact",
  "terms.contactSection.body":
    "Questions about these terms? Email <a>hello@queerpulse.pt</a> and a real person will respond.",

  // ── Imprint / Legal Notice ────────────────────────────────────────────
  // TODO (maintainer): the operator's registration number, address, legal
  // representative, and hosting provider are placeholders in ImprintPage.data.ts
  // and interpolated below. Confirm the real details before public launch.
  "imprint.meta.title": "Legal notice · QueerPulse",
  "imprint.meta.description":
    "Who runs QueerPulse: the legal entity behind the platform, how to reach a real person, and the law we answer to.",
  "imprint.meta.lastReviewed": "Last reviewed 1 June 2026",
  "imprint.title": "Legal <em>notice</em>",
  "imprint.plain.text":
    "The plain version: this page names the organisation that operates QueerPulse, how to reach us, and where we're registered. It's the legally required imprint — nothing more.",
  "imprint.operator.title": "Who operates QueerPulse",
  "imprint.operator.p1":
    "QueerPulse is operated by {legalName}, a not-for-profit registered in Portugal.",
  "imprint.operator.registry": "Registration number: {registryNumber}",
  "imprint.operator.address": "Registered address: {registeredAddress}",
  "imprint.operator.todo":
    "These registration details are placeholders pending the operator's final legal filing — we'll publish the confirmed numbers here.",
  "imprint.contact.title": "How to reach us",
  "imprint.contact.p1":
    "For anything on this page — or anything at all — email <a>{email}</a> and a real person will answer.",
  "imprint.contact.p2":
    "We reply in English or Portuguese, usually within two working days.",
  "imprint.representation.title": "Responsible for content",
  "imprint.representation.p1":
    "Editorial and legal responsibility for this site rests with {representative}, on behalf of {legalName}.",
  "imprint.hosting.title": "Hosting",
  "imprint.hosting.p1":
    "The platform is hosted by {hostingProvider}. Your session and data are handled as described in our Privacy Policy.",
  "imprint.jurisdiction.title": "Governing law",
  "imprint.jurisdiction.p1":
    "QueerPulse operates under Portuguese and European Union law.",
  "imprint.jurisdiction.p2":
    "Any dispute we can't settle directly will be heard in the courts of Lisbon, Portugal, unless consumer-protection law gives you another right.",
  "imprint.disputes.title": "Online dispute resolution",
  "imprint.disputes.p1":
    "The European Commission runs an online dispute-resolution platform at ec.europa.eu/consumers/odr. We'd rather sort things out by email first — see “How to reach us” above.",
  "imprint.contactCta":
    "Something here out of date? <strong>Tell us and we'll fix it.</strong>",

  // ── Press Kit — page sections ─────────────────────────────────────────
  // Coverage headlines/sources are real press pieces (someone else's words)
  // and stay English; the surrounding section chrome is translated.
  "pressKit.boiler.section.title": "Boilerplate · <em>cleared for reuse</em>",
  "pressKit.boiler.section.lead":
    "Three lengths, all approved for direct quotation without further sign-off. Click <b>copy</b> to put a clean version on your clipboard.",
  "pressKit.boiler.copyCta": "Copy",
  "pressKit.boiler.copiedCta": "Copied",
  "pressKit.boiler.short.label": "25 words · for headers, intros",
  "pressKit.boiler.med.label": "60 words · for press releases, capsule bios",
  "pressKit.boiler.long.label":
    "130 words · for longer features, “about” sections",
  "pressKit.boiler.long.wc": "130 words",
  "pressKit.boiler.long.text":
    "QueerPulse is a Lisbon-based queer professional network, founded in 2024 by eight community members in the back room of Café Beirão. It is operated by Associação QueerPulse, a not-for-profit registered in Portugal (NIPC 517 426 884), and supported by Sustainer memberships, one-off donations, and three programme grants. Membership is by vouched invitation. The platform supports a magazine, a podcast (The Back Room), a verified safe-spaces network across Lisbon, a micro-grants fund disbursed within 14 days by a rotating community circle, and an operational partnership with a national LGBTQ+ rights organisation for legal aid and helpline handoffs. Annual transparency reports are independently audited and published publicly.",
  "pressKit.mark.section.title": "The <em>mark</em> and how to use it",
  "pressKit.mark.section.lead":
    "Three approved variations. The wordmark always carries the coral pulse dot — except in the inverse “coral” variant, where the dot becomes plum. Don't recolour the dot to anything else.",
  "pressKit.mark.logo.light.meta":
    "<b>Primary · light</b> · for cream/white backgrounds",
  "pressKit.mark.logo.plum.meta":
    "<b>Inverse · plum</b> · for dark backgrounds",
  "pressKit.mark.logo.coral.meta":
    "<b>Coral · solidarity</b> · use sparingly · pride contexts",
  "pressKit.mark.downloadLinkLabel": "SVG · PNG",
  "pressKit.mark.modal.eyebrow": "Brand mark · SVG",
  "pressKit.mark.modal.title": "The <em>mark</em>, ready to use.",
  "pressKit.mark.modal.lead":
    "Preview the {variant} variant below. Download generates a real, clean <b>.svg</b> file — vector, recolour-safe, with the pulse dot intact.",
  "pressKit.mark.modal.buttonLabel": "Download · SVG",
  "pressKit.mark.usageNote":
    "<b>Spacing:</b> always leave one full <em>P</em>-height of clear space around the mark. <b>Minimum size:</b> 88px wide on screen, 18 mm in print. <b>Don't:</b> stretch, recolour, set on busy photos, or pair with rainbow gradients we didn't make.",
  "pressKit.colour.section.title": "Colour, <em>full system</em>",
  "pressKit.colour.section.lead":
    "The whole brand runs on four hues. We do not introduce additional accent colours — including campaign-specific ones.",
  "pressKit.colour.plum.meta": "Brand anchor · headings, dark surfaces",
  "pressKit.colour.coral.meta": "Accent · CTAs, italic emphasis, the pulse dot",
  "pressKit.colour.cream.meta": "Page background · never pure white",
  "pressKit.colour.jade.meta": "Verified · live · success",
  "pressKit.photography.section.title": "Cleared <em>photography</em>",
  "pressKit.photography.section.lead":
    "Six images, model-released and pre-cleared for editorial use. Credit: <em>photographs by André Bento for QueerPulse</em>. Resolution: 3000 × 2000 px JPG.",
  "pressKit.photography.image1": "01 · Founding members at Café Beirão",
  "pressKit.photography.image2": "02 · Open clinic night, in progress",
  "pressKit.photography.image3": "03 · The print magazine, fanned",
  "pressKit.photography.image4": "04 · Trans Hub office · Mouraria",
  "pressKit.photography.image5": "05 · A gathering · Atelier Pulso",
  "pressKit.photography.image6": "06 · Map detail · safe spaces",
  "pressKit.team.section.title": "Named <em>spokespeople</em>",
  "pressKit.team.section.lead":
    "Three founding members are available for press comment. Quote them on their stated topics; don't paraphrase. <em>Other members are not available without explicit consent</em> — please don't approach members directly through the platform.",
  "pressKit.team.marta.role": "Co-founder · Editor in chief",
  "pressKit.team.marta.desc":
    "For: editorial decisions, the magazine, governance, the manifesto. <em>Not for: individual member stories, moderation decisions.</em>",
  "pressKit.team.marta.langs": "<b>EN · PT · ES</b> · available on 48h notice",
  "pressKit.team.catarina.role": "Co-founder · Co-treasurer · Trans Hub",
  "pressKit.team.catarina.desc":
    "For: trans-affirming healthcare, finances, transparency, mutual aid, legal-aid partnership.",
  "pressKit.team.catarina.langs": "<b>EN · PT</b> · available on 24h notice",
  "pressKit.team.andre.role": "Co-founder · Co-treasurer · Design",
  "pressKit.team.andre.desc":
    "For: platform design, technical decisions, partnerships, infrastructure. Photographer for in-house imagery.",
  "pressKit.team.andre.langs": "<b>EN · PT</b> · available on 72h notice",
  "pressKit.facts.section.title": "Quick <em>facts</em> · as of {date}",
  "pressKit.facts.section.lead":
    "Sourced from the 2025 transparency report. <em>Please link to the transparency page when citing.</em>",
  "pressKit.facts.founded": "Founded · Lisbon",
  "pressKit.facts.activeMembers": "Active members at year-end 2025",
  "pressKit.facts.communities": "Communities on the platform",
  "pressKit.facts.gatherings": "Gatherings held in 2025",
  "pressKit.facts.safeSpaces": "Verified safe spaces in Lisbon",
  "pressKit.facts.magazineIssues": "Magazine issues to date",
  "pressKit.coverage.section.title": "Recent <em>coverage</em>",
  "pressKit.coverage.section.lead":
    "Selected English- and Portuguese-language pieces from 2024–2026. <em>Hit-counts welcome but not necessary</em> — link to Press instead.",
  "pressKit.coverage.openingToast": "Opening coverage in {source}…",
  "pressKit.coverage.emptyLive.title": "Coverage will appear here",
  "pressKit.coverage.emptyLive.description":
    "Once QueerPulse is written about, we'll link the pieces here. For interviews or press enquiries, email press@queerpulse.pt.",
  "pressKit.downloads.section.title": "<em>Downloads</em>",
  "pressKit.downloads.section.lead":
    "Direct file links. The full kit is a 38 MB ZIP with everything below; individual files are smaller.",
  "pressKit.downloads.completeKit.title": "Complete press kit",
  "pressKit.downloads.completeKit.desc":
    "Marks, photography, boilerplate, fact sheet · 38 MB",
  "pressKit.downloads.marksSvg.title": "Marks · SVG bundle",
  "pressKit.downloads.marksSvg.desc":
    "3 variations · cleared for editorial use · 18 KB",
  "pressKit.downloads.marksPng.title": "Marks · PNG @ 2x",
  "pressKit.downloads.marksPng.desc": "For Word docs, slides, web · 8 MB",
  "pressKit.downloads.photography.title": "Photography · 6 images",
  "pressKit.downloads.photography.desc":
    "3000 × 2000 px · model-released · 24 MB",
  "pressKit.downloads.factSheet.title": "Fact sheet",
  "pressKit.downloads.factSheet.desc":
    "One-page printable · EN & PT versions · 380 KB",
  "pressKit.downloads.transparency.title": "2025 transparency report",
  "pressKit.downloads.transparency.desc": "84 pages · audited · 4.2 MB",
  "pressKit.downloads.boilerplate.desc": "Short and medium lengths",
  "pressKit.downloads.modal.eyebrow": "Download · {format}",
  "pressKit.downloads.modal.lead":
    "{desc}. Download now generates a real <b>{filename}</b> in your browser — a working stand-in for the production asset.",
  "pressKit.downloads.modal.buttonLabel": "Download · {format}",

  // ── List Your Business — wizard ───────────────────────────────────────
  // Option-list labels resolve through `t()` at render only; the stored
  // draft keeps its canonical English id, so switching language never
  // rewrites already-entered data.
  "listBusiness.hero.backCta": "Back to the directory",
  "listBusiness.hero.eyebrow": "The directory · add a place",
  "listBusiness.hero.title":
    "Add your place to <em>the people's directory.</em>",
  "listBusiness.hero.lead":
    "Queer-owned or queer-friendly, big or tiny — if your place is good to our people, it belongs here. Tell us about it and the community team will take it from there. <b>Every listing is read by a human before it goes live.</b>",
  "listBusiness.wizard.stepAria": "Step {number}: {label}",
  "listBusiness.wizard.stepAriaDone": "Step {number}: {label} (done)",
  "listBusiness.wizard.stepAriaCurrent": "Step {number}: {label} (current)",
  "listBusiness.wizard.stepJumpAria": "Go back to step {number}: {label}",
  "listBusiness.wizard.stepOf": "Step {number} of {total} — {label}",
  "listBusiness.wizard.draftSaved": "Draft saved",
  "listBusiness.draftBanner.text":
    "<b>You have a saved draft.</b> Pick up where you left off?",
  "listBusiness.draftBanner.startFresh": "Start fresh",
  "listBusiness.draftBanner.resume": "Resume draft",
  "listBusiness.paneActions.back": "Back",
  "listBusiness.paneActions.cancel": "Cancel",
  "listBusiness.paneActions.neededLabel": "A few things left",
  "listBusiness.paneActions.jumpToAria": "Jump to {label}",
  "listBusiness.paneActions.blockedTitle":
    "Fill the required fields to continue",
  "listBusiness.next.basics": "Next: the basics",
  "listBusiness.next.story": "Next: the story",
  "listBusiness.next.practical": "Next: practical",
  "listBusiness.next.photos": "Next: photos & you",
  "listBusiness.next.review": "Review your listing",
  "listBusiness.next.send": "Send it to the team",
  "listBusiness.next.continue": "Continue",
  "listBusiness.sending": "Sending your place to the team…",
  "listBusiness.toast.submitted": "Your listing is with the community team",
  "listBusiness.toast.submitError":
    "We couldn't send your listing just now. Your details are saved — try again.",
  "listBusiness.toast.withdrawn": "Listing withdrawn",
  // Server-side validation (item #4)
  "listBusiness.serverError.title": "The community team's system flagged this",
  "listBusiness.serverError.dismiss": "Dismiss this message",
  // Save & finish later + cross-device drafts (item #11)
  "listBusiness.saveLater.cta": "Save & finish later",
  "listBusiness.saveLater.saving": "Saving…",
  "listBusiness.saveLater.toast":
    "Saved. Pick this back up any time — it's waiting in your drafts.",
  "listBusiness.saveLater.error":
    "We couldn't save your draft just now. Check your connection and try again.",
  "listBusiness.drafts.title": "Pick up where you left off",
  "listBusiness.drafts.count": "{count} in progress",
  "listBusiness.drafts.untitled": "Untitled place",
  "listBusiness.drafts.updated": "Last edited {when}",
  "listBusiness.drafts.resume": "Resume",
  "listBusiness.drafts.resuming": "Opening…",
  "listBusiness.drafts.delete": "Delete draft",
  "listBusiness.drafts.loadError":
    "We couldn't load your saved drafts just now.",
  "listBusiness.resume.invalidTitle": "This draft link is no longer valid",
  "listBusiness.resume.invalidBody":
    "The link may have expired, or the draft was already submitted or deleted. You can still start a fresh listing.",
  "listBusiness.resume.startFresh": "Start a fresh listing",
  // Step 0 — path
  "listBusiness.step0.title": "How do you",
  "listBusiness.step0.em": "know this place?",
  "listBusiness.step0.sub":
    "Both paths are welcome, and both go through the same community review. It just changes a couple of questions later.",
  "listBusiness.step0.pathAria": "Your relationship to the place",
  "listBusiness.step0.claim.title": "I run this place",
  "listBusiness.step0.claim.desc":
    "You own it, lead it, or work here. We'll ask you to verify ownership so the directory stays trustworthy.",
  "listBusiness.step0.suggest.title": "I'm suggesting a place I love",
  "listBusiness.step0.suggest.desc":
    "A spot that's been good to you. The team will reach out to the owner before it goes live.",
  "listBusiness.step0.verifyLabel": "How should we verify you run this place?",
  "listBusiness.step0.verifyHelp":
    "It's what keeps the directory trustworthy. Pick whatever's easiest for you.",
  "listBusiness.step0.signedInAs":
    "You're signed in as <b>{name}</b> — we'll attach this submission to your member profile so the team knows who to thank (and ask, if needed).",
  // Verify options
  "listBusiness.verify.email.label": "Business email",
  "listBusiness.verify.email.desc":
    "We send a code to an address on your domain.",
  "listBusiness.verify.email.badge": "Fastest",
  "listBusiness.verify.instagram.label": "Instagram",
  "listBusiness.verify.instagram.desc":
    "Confirm with a DM from the listed account.",
  "listBusiness.verify.instagram.badge": "Easy",
  "listBusiness.verify.post.label": "Postcard to the address",
  "listBusiness.verify.post.desc": "Old-school. A code arrives in 3–5 days.",
  "listBusiness.verify.post.badge": "3–5 days",
  "listBusiness.verify.later.label": "Verify after review",
  "listBusiness.verify.later.desc":
    "The team verifies with you directly, human to human.",
  "listBusiness.verify.later.badge": "Human",
  // Step 1 — basics
  "listBusiness.step1.title": "Start with",
  "listBusiness.step1.em": "the basics.",
  "listBusiness.step1.sub":
    "Just enough to put your place on the map. You can make it sing in the next step.",
  "listBusiness.step1.nameLabel": "What's it called?",
  "listBusiness.step1.nameHelper": "The name as people would search for it.",
  "listBusiness.step1.namePlaceholder": "e.g. Café Beirão",
  "listBusiness.step1.dupHead":
    "A place by this name may already be in the directory:",
  "listBusiness.step1.catsLabel": "What kind of place is it? — pick up to 2",
  "listBusiness.step1.catsAria": "Category",
  "listBusiness.step1.hoodLabel": "Which neighbourhood?",
  "listBusiness.step1.hoodPlaceholder": "Pick a Lisbon neighbourhood…",
  "listBusiness.step1.badgeLabel": "Who runs it?",
  "listBusiness.step1.badgeHelper":
    "Queer-owned, or a place that genuinely welcomes us? Both belong here — this is a welcome, not a gate.",
  "listBusiness.step1.badgeAria": "Ownership",
  "listBusiness.step1.owned.tag": "Queer-owned",
  "listBusiness.step1.owned.title": "Owned or led by our community",
  "listBusiness.step1.owned.desc":
    "You, your co-owners, or leadership are LGBTQ+.",
  "listBusiness.step1.friendly.tag": "LGBTQ+ friendly",
  "listBusiness.step1.friendly.title": "A place that welcomes us",
  "listBusiness.step1.friendly.desc":
    "Not queer-owned, but actively safe and affirming.",
  "listBusiness.step1.evidenceLabel": "A light touch — how is it queer-owned?",
  "listBusiness.step1.evidenceHelp":
    "No documents. Just a sentence the reviewer can sanity-check. This is what keeps the badge meaningful.",
  "listBusiness.step1.evidencePlaceholder":
    "e.g. Co-owned by me (Sandra, she/her) and Rui (he/him) since 2019",
  "listBusiness.step1.priceLabel": "Roughly the price?",
  "listBusiness.step1.priceAria": "Price band",
  "listBusiness.step1.blurbLabel": "The one-liner",
  "listBusiness.step1.blurbHelper":
    "This is the blurb on your directory card. One sentence, plain and warm.",
  "listBusiness.step1.blurbPlaceholder":
    "A queer-run pastelaria by day, community room by night.",
  // Categories
  "listBusiness.cat.foodDrink": "Food & drink",
  "listBusiness.cat.designCraft": "Design & craft",
  "listBusiness.cat.healthCare": "Health & care",
  "listBusiness.cat.spaces": "Spaces",
  "listBusiness.cat.culture": "Culture",
  "listBusiness.cat.tech": "Tech",
  "listBusiness.cat.barbershopSalon": "Barbershop & Salon",
  "listBusiness.cat.gymFitness": "Gym & Fitness",
  // Price bands
  "listBusiness.price.free": "Free",
  "listBusiness.price.affordable": "Affordable",
  "listBusiness.price.midRange": "Mid-range",
  "listBusiness.price.higherEnd": "Higher-end",
  // Step 2 — story
  "listBusiness.step2.title": "Now,",
  "listBusiness.step2.em": "the story.",
  "listBusiness.step2.sub":
    "This is what fills out your detail page. Write like you'd describe the place to a friend who's new in town.",
  "listBusiness.step2.taglineLabel": "Tagline",
  "listBusiness.step2.taglineHelper":
    "A single line shown big and italic at the top of your page. <em>Make it the heart of the place.</em>",
  "listBusiness.step2.taglinePlaceholder":
    "Nobody gets misgendered. The back room is always yours.",
  "listBusiness.step2.witLabel": "What it actually is",
  "listBusiness.step2.witHelper":
    "Two to four short lines. The things you'd want a stranger to know walking in.",
  "listBusiness.step2.witFirstPlaceholder":
    "e.g. Galão, pastéis, two daily specials",
  "listBusiness.step2.witMorePlaceholder": "One more thing worth knowing",
  "listBusiness.step2.witRemoveAria": "Remove line",
  "listBusiness.step2.witAdd": "Add another line",
  "listBusiness.step2.tagsLabel": "Tags — a few words people might filter by",
  "listBusiness.step2.tagsPlaceholder": "e.g. Wheelchair-accessible",
  "listBusiness.step2.tagsAddCta": "Add",
  "listBusiness.step2.tagRemoveAria": "Remove {tag}",
  "listBusiness.step2.goodForLabel": "Good for… — tick what's true",
  "listBusiness.step2.goodForHelper":
    "The little things that tell our people they're safe and welcome.",
  "listBusiness.step2.goodForAria": "Good for",
  "listBusiness.step2.langsLabel": "Languages spoken — optional",
  "listBusiness.step2.langsAria": "Languages",
  // Good-for options
  "listBusiness.goodFor.wheelchairAccessible": "Wheelchair accessible",
  "listBusiness.goodFor.genderNeutralToilets": "Gender-neutral toilets",
  "listBusiness.goodFor.stepFreeEntrance": "Step-free entrance",
  "listBusiness.goodFor.walkInsWelcome": "Walk-ins welcome",
  "listBusiness.goodFor.quietLowSensory": "Quiet, low-sensory hours",
  "listBusiness.goodFor.soloFriendly": "Solo-friendly",
  "listBusiness.goodFor.dogFriendly": "Dog-friendly",
  "listBusiness.goodFor.hostsCommunityEvents": "Hosts community events",
  "listBusiness.goodFor.budgetFriendly": "Budget-friendly",
  "listBusiness.goodFor.accessibleBathroom": "Accessible bathroom",
  // Languages (endonyms stay as-is; only "Other" and the LGP gloss translate)
  "listBusiness.lang.portugues": "Português",
  "listBusiness.lang.english": "English",
  "listBusiness.lang.espanol": "Español",
  "listBusiness.lang.francais": "Français",
  "listBusiness.lang.lgp": "LGP (sign)",
  "listBusiness.lang.other": "Other",
  // Step 3 — practical
  "listBusiness.step3.title": "The",
  "listBusiness.step3.em": "practical",
  "listBusiness.step3.sub":
    "How people find you, when you're open, and where to reach you. Share only what you want public.",
  "listBusiness.step3.addressLabel": "Address",
  "listBusiness.step3.addressHelper":
    "Street and number is enough — we'll place the pin from there.",
  "listBusiness.step3.addressPlaceholder":
    "R. Antero de Quental 26, 1170-024 Lisboa",
  "listBusiness.step3.locateAddress": "Locate this address",
  "listBusiness.step3.locateError":
    "We couldn't find that address. Try adding the city or postcode — or drop a pin on your neighbourhood below.",
  "listBusiness.step3.locateDemoHint":
    "Demo mode can't look up an address online — we've dropped a pin near your neighbourhood. Drag it to the exact spot.",
  "listBusiness.step3.dropNeighbourhoodPin": "Drop a pin on {hood}",
  "listBusiness.step3.mapLinkLabel": "Google Maps link",
  "listBusiness.step3.mapLinkHelper":
    "Open your place in Google Maps, tap Share, and paste the link — we'll drop the pin for you.",
  "listBusiness.step3.mapLinkPlaceholder": "https://maps.app.goo.gl/…",
  "listBusiness.step3.findOnMap": "Find on map",
  "listBusiness.step3.resolving": "Finding…",
  "listBusiness.step3.resolveError":
    "We couldn't read that link. Paste a Google Maps place link and try again.",
  "listBusiness.step3.unsupportedLinkDemo":
    "In demo mode, paste the full google.com/maps/… link — short links need the live site.",
  "listBusiness.step3.pinPlaced": "Pin placed near {place}",
  "listBusiness.step3.usePlaceName": "Use “{place}” as the address",
  "listBusiness.step3.mapAria": "Map — drag the pin to set the exact spot.",
  "listBusiness.step3.hoursHeading": "Opening hours *",
  "listBusiness.step3.hasOpenHours": "Has open hours",
  "listBusiness.step3.allClosed": "All closed",
  "listBusiness.step3.copyMonday": "Copy Monday to all days",
  "listBusiness.step3.markAllClosed": "Mark all closed",
  "listBusiness.step3.open": "Open",
  "listBusiness.step3.closed": "Closed",
  "listBusiness.step3.opensAria": "{day} opens",
  "listBusiness.step3.closesAria": "{day} closes",
  "listBusiness.step3.addHours": "+ Split (lunch break)",
  "listBusiness.step3.removeHoursAria": "Remove second window on {day}",
  "listBusiness.step3.nextDay": "next day",
  "listBusiness.step3.hoursWarning":
    "Check these times — a window is blank, zero-length, or overlaps.",
  "listBusiness.step3.hoursNoteLabel": "A short hours note — optional",
  "listBusiness.step3.hoursNotePlaceholder":
    "Closed Mondays. The back room books separately.",
  "listBusiness.step3.onlineHeading": "Find you online",
  "listBusiness.step3.onlineHint":
    "You choose what's public. Leave anything blank you'd rather keep off the listing.",
  "listBusiness.social.instagram.placeholder": "Instagram · @handle",
  "listBusiness.social.website.placeholder": "Website · yourplace.pt",
  "listBusiness.social.website.err": "That doesn't look like a web address.",
  "listBusiness.social.email.placeholder": "Email · hello@yourplace.pt",
  "listBusiness.social.email.err": "That doesn't look like an email.",
  "listBusiness.social.phone.placeholder": "Phone · +351 …",
  "listBusiness.social.phone.err": "That doesn't look like a phone number.",
  // Days
  "listBusiness.day.mon": "Monday",
  "listBusiness.day.tue": "Tuesday",
  "listBusiness.day.wed": "Wednesday",
  "listBusiness.day.thu": "Thursday",
  "listBusiness.day.fri": "Friday",
  "listBusiness.day.sat": "Saturday",
  "listBusiness.day.sun": "Sunday",
  // Step 4 — photos & you
  "listBusiness.step4.title": "Photos, and",
  "listBusiness.step4.em": "a little about you.",
  "listBusiness.step4.sub":
    "Pictures help people feel the room before they arrive. And we like to know who's behind the door.",
  "listBusiness.step4.photosLabel": "A few photos — optional",
  "listBusiness.step4.photosHelper":
    "Landscape works best · aim for ≥1200px wide · under 5MB each · no text-heavy graphics.",
  "listBusiness.step4.gallery.wide": "Wide shot of the space",
  "listBusiness.step4.gallery.detail": "A detail",
  "listBusiness.step4.gallery.vibe": "People / vibe",
  "listBusiness.step4.alt.wide": "Wide shot · alt text",
  "listBusiness.step4.alt.d1": "Detail 1 · alt text",
  "listBusiness.step4.alt.d2": "Detail 2 · alt text",
  "listBusiness.step4.alt.vibe": "Vibe · alt text",
  "listBusiness.step4.altPlaceholder":
    "Describe it for blind & low-vision members",
  "listBusiness.step4.altPlaceholderRequired":
    "Required — describe it for blind & low-vision members",
  "listBusiness.step4.photo.upload": "Upload",
  "listBusiness.step4.photo.change": "Change",
  "listBusiness.step4.photo.uploading": "Uploading…",
  "listBusiness.step4.photo.remove": "Remove photo",
  "listBusiness.step4.photo.urlPlaceholder": "or paste an image URL",
  "listBusiness.step4.photo.urlInvalid": "That doesn't look like an image URL",
  "listBusiness.step4.photo.uploadError":
    "Couldn't upload that image — try again",
  "listBusiness.step4.aboutYouHeading": "A little about you",
  "listBusiness.step4.relLabel": "Your connection to the place",
  "listBusiness.step4.relAria": "Your connection",
  "listBusiness.step4.ownerNameLabel": "Your name",
  "listBusiness.step4.ownerNamePlaceholder": "e.g. Sandra Lopes",
  "listBusiness.step4.ownerRoleLabel": "Your role",
  "listBusiness.step4.ownerRolePlaceholder": "e.g. Owner & baker",
  "listBusiness.step4.ownerBioLabel": "A line or two about you — optional",
  "listBusiness.step4.ownerBioPlaceholder":
    "We took over a 60-year-old pastelaria in 2019 and rebuilt it around one rule: everyone's welcome, exactly as they are.",
  "listBusiness.step4.visLabel": "Who can see your name?",
  "listBusiness.step4.visAria": "Name visibility",
  "listBusiness.step4.linkProfileLabel":
    "Link to your member profile? — optional",
  "listBusiness.step4.linkProfileTitle": "Show I'm a QueerPulse member",
  "listBusiness.step4.linkProfileDesc":
    "Puts a familiar, verified face on the listing. You're signed in as {name}.",
  "listBusiness.step4.linkProfileToggleLabel": "Link to member profile",
  "listBusiness.step4.loopHeading": "Staying in the loop",
  "listBusiness.step4.contactEmailLabel": "Your contact email",
  "listBusiness.step4.contactEmailHelper":
    "For you, the submitter — kept private, never shown on the listing.",
  "listBusiness.step4.contactEmailPlaceholder":
    "So we can reach you about this listing",
  "listBusiness.step4.notifyLabel": "Email me when… — optional",
  "listBusiness.step4.consent":
    "You're in control of what's public. <b>Contact details you leave blank stay off the listing.</b> Want your name kept private? Pick “role only” or “anonymous” above — that's completely fine.",
  // Relationship options
  "listBusiness.rel.own.label": "I own or co-own it",
  "listBusiness.rel.own.desc": "You're the proprietor.",
  "listBusiness.rel.run.label": "I manage or help run it",
  "listBusiness.rel.run.desc": "Day-to-day, it's partly yours.",
  "listBusiness.rel.work.label": "I work here",
  "listBusiness.rel.work.desc": "Staff, with the owner's blessing to list.",
  "listBusiness.rel.regular.label": "I'm a regular who loves it",
  "listBusiness.rel.regular.desc":
    "Suggesting a place that's been good to you.",
  // Visibility options
  "listBusiness.vis.public.label": "My name and role",
  "listBusiness.vis.public.desc": "Both shown on the listing.",
  "listBusiness.vis.role.label": "My role only",
  "listBusiness.vis.role.desc": "“Owner”, but no name.",
  "listBusiness.vis.anon.label": "Keep me anonymous",
  "listBusiness.vis.anon.desc": "Visible only to the community team.",
  // Notify options
  "listBusiness.notify.live.label": "It goes live",
  "listBusiness.notify.question.label": "The team has a question",
  "listBusiness.notify.news.label": "Occasional directory news",
  // Step 5 — review
  "listBusiness.step5.title": "One last look",
  "listBusiness.step5.em": "before it goes to the team.",
  "listBusiness.step5.sub":
    "Here's everything you've told us. Edit any part by jumping back — nothing's locked until you send.",
  "listBusiness.step5.slugLabel": "Your listing will live at",
  "listBusiness.step5.editCta": "Edit",
  "listBusiness.step5.notAdded": "Not added",
  "listBusiness.step5.group.pathPlace": "You & the place",
  "listBusiness.step5.group.basics": "Basics",
  "listBusiness.step5.group.story": "Story",
  "listBusiness.step5.group.practical": "Practical",
  "listBusiness.step5.group.photosYou": "Photos & you",
  "listBusiness.step5.row.listingAs": "Listing as",
  "listBusiness.step5.row.verification": "Verification",
  "listBusiness.step5.row.name": "Name",
  "listBusiness.step5.row.category": "Category",
  "listBusiness.step5.row.neighbourhood": "Neighbourhood",
  "listBusiness.step5.row.ownership": "Ownership",
  "listBusiness.step5.row.price": "Price",
  "listBusiness.step5.row.oneLiner": "One-liner",
  "listBusiness.step5.row.tagline": "Tagline",
  "listBusiness.step5.row.whatItIs": "What it is",
  "listBusiness.step5.row.tags": "Tags",
  "listBusiness.step5.row.goodFor": "Good for",
  "listBusiness.step5.row.languages": "Languages",
  "listBusiness.step5.row.address": "Address",
  "listBusiness.step5.row.hours": "Hours",
  "listBusiness.step5.row.online": "Online",
  "listBusiness.step5.row.you": "You",
  "listBusiness.step5.row.nameShown": "Name shown",
  "listBusiness.step5.listingAs.claim": "I run this place",
  "listBusiness.step5.listingAs.suggest": "Suggesting a place I love",
  "listBusiness.step5.nameShown.public": "My name and role",
  "listBusiness.step5.nameShown.role": "My role only",
  "listBusiness.step5.nameShown.anon": "Anonymous",
  "listBusiness.step5.online.instagram": "Instagram",
  "listBusiness.step5.online.website": "Website",
  "listBusiness.step5.online.email": "Email",
  "listBusiness.step5.online.phone": "Phone",
  "listBusiness.step5.vouchLine":
    "<b>Vouched by you, {name}.</b> Your name rides along so the team knows a trusted member stands behind this. Members can add their vouch once it's live.",
  "listBusiness.step5.beforeSendHeading": "Before you send",
  "listBusiness.step5.consentOuting.title":
    "I understand this listing will be public and searchable.",
  "listBusiness.step5.consentOuting.sub":
    "Listing a place as queer-owned, with a name attached, is a public disclosure. I've chosen what's visible above and I'm okay with it being out in the world.",
  "listBusiness.step5.consentGuide.title":
    "Everything here is accurate to the best of my knowledge.",
  "listBusiness.step5.consentGuide.sub":
    "I've read the community guidelines and how my data is used.",
  "listBusiness.step5.submitNote":
    "<b>A human reviews every listing.</b> This keeps the directory community-verified — nothing auto-publishes. We'll read it within a few days and email you when it's live (or if we have a question). You can edit or withdraw it any time before then.",
  // Success panel
  "listBusiness.success.stage.review": "In review",
  "listBusiness.success.stage.question": "Quick question",
  "listBusiness.success.stage.live": "Live in the directory",
  "listBusiness.success.title.review.text": "It's with",
  "listBusiness.success.title.review.em": "the community now.",
  "listBusiness.success.title.question.text": "Just",
  "listBusiness.success.title.question.em": "one quick thing.",
  "listBusiness.success.title.live.text": "You're",
  "listBusiness.success.title.live.em": "on the map.",
  "listBusiness.success.note.review":
    "Thank you for adding to the directory. <b>A real person on the community team reads every listing</b> before it goes live — that's the promise behind our community-verified badge. We'll review within <b>a few days</b> and email you the moment it's live.",
  "listBusiness.success.note.question":
    "<b>The team has a small question</b> before it goes live — check your email. Nothing's wrong; a quick reply is all it takes and you're back on track.",
  "listBusiness.success.note.live":
    "<b>It's live in the directory.</b> Your place is now searchable by the community. Thank you for making the map a little fuller.",
  "listBusiness.success.fallbackName": "Your place",
  "listBusiness.success.withdrawConfirm":
    "Withdraw <b>{name}</b>? This takes it out of review — you can always list it again later.",
  "listBusiness.success.withdrawFallbackName": "this listing",
  "listBusiness.success.keepIt": "Keep it",
  "listBusiness.success.yesWithdraw": "Yes, withdraw",
  "listBusiness.success.backToDirectory": "Back to the directory",
  "listBusiness.success.viewOnProfile": "View on your profile",
  "listBusiness.success.editSubmission": "Edit submission",
  "listBusiness.success.listAnother": "List another place",
  "listBusiness.success.withdraw": "Withdraw",
  "listBusiness.success.reference":
    "Reference · <b>{ref}</b>  ·  keep it somewhere",
  // "What's still needed" chip labels
  "listBusiness.missing.path": "how you know the place",
  "listBusiness.missing.verify": "a way to verify",
  "listBusiness.missing.name": "a name",
  "listBusiness.missing.cats": "a category",
  "listBusiness.missing.hood": "a neighbourhood",
  "listBusiness.missing.badge": "who runs it",
  "listBusiness.missing.price": "a price band",
  "listBusiness.missing.blurb": "the one-liner",
  "listBusiness.missing.tagline": "a tagline",
  "listBusiness.missing.whatItIs": "what it is",
  "listBusiness.missing.address": "an address",
  "listBusiness.missing.pin": "a map pin",
  "listBusiness.missing.hours": "opening hours",
  "listBusiness.missing.hoursInvalid": "a fix to the opening hours",
  "listBusiness.missing.social": "valid contact links",
  "listBusiness.missing.socialFormat": "the contact-link format fixed",
  "listBusiness.missing.rel": "your connection",
  "listBusiness.missing.ownerName": "your name",
  "listBusiness.missing.ownerRole": "your role",
  "listBusiness.missing.contactEmail": "a contact email",
  "listBusiness.missing.alt": "alt text for your photos",
  "listBusiness.missing.consent": "both confirmations",
  // Live preview column
  "listBusiness.preview.head": "Live preview · updates as you type",
  "listBusiness.preview.placeholderName": "Your place",
  "listBusiness.preview.placeholderMeta": "Category · neighbourhood",
  "listBusiness.preview.placeholderBlurb":
    "Your place will appear here as you fill in the form — exactly as it'll look in the directory grid.",
  "listBusiness.preview.placeholderTagline":
    "Your tagline becomes the pull-quote at the top of your page.",
  "listBusiness.preview.whatItIs": "What it is",
  "listBusiness.preview.goodFor": "Good for",
  "listBusiness.preview.languages": "Languages",
  "listBusiness.preview.hours": "Hours",
  "listBusiness.preview.roleShown": "Role shown · name private",
  "listBusiness.preview.yourRole": "Your role",
  "listBusiness.preview.fullCta": "Preview the full page",
  "listBusiness.preview.fullDisabledTitle":
    "Add a name first to preview the full page",
  "listBusiness.preview.foot":
    "This is a preview. Your listing goes live only after the community team reviews it.",
  // Full-page preview modal
  "listBusiness.fullPreview.eyebrow": "Full-page preview",
  "listBusiness.fullPreview.sub":
    "This is how your listing will look in the directory once the team approves it.",
  "listBusiness.fullPreview.whatItIs": "What it is",
  "listBusiness.fullPreview.goodFor": "Good for",
  "listBusiness.fullPreview.goodToKnow": "Good to know",
  "listBusiness.fullPreview.hours": "Opening hours",
  "listBusiness.fullPreview.findIt": "Find it",
  "listBusiness.fullPreview.whoRunsIt": "Who runs it",
  "listBusiness.fullPreview.instagramPrefix": "Instagram · {handle}",

  "listBusiness.edit.title": "Edit your listing",
  "listBusiness.edit.saveCta": "Save changes",
  "listBusiness.edit.saving": "Saving your changes…",
  "listBusiness.edit.saved": "Your listing is updated.",
  "listBusiness.edit.saveError": "We couldn't save your changes. Try again.",
  "listBusiness.edit.discardConfirm":
    "Discard your unsaved changes to this listing?",
  "listBusiness.edit.notAllowed": "You can only edit a listing you submitted.",

  // ── Shared hub back-link label (Governance section) ────────────────────
  "hub.governanceLabel": "Governance",

  // ── Transparency Report — page chrome. The euro figures, allocation
  //    breakdown, moderation rows, government requests, named mistakes and
  //    governance stats are the year's actual audited figures — left
  //    English; see the sweep report.
  "transparency.meta.title": "QueerPulse's 2025 transparency report",
  "transparency.meta.description":
    "QueerPulse's audited 2025 transparency report — where €278,400 came from and went, moderation actions, government data requests, and the mistakes we're naming.",
  "transparency.tabs.money": "Money",
  "transparency.tabs.people": "People",
  "transparency.tabs.moderation": "Moderation",
  "transparency.tabs.requests": "Gov requests",
  "transparency.tabs.mistakes": "Mistakes",
  "transparency.tabs.governance": "How decisions get made",
  "transparency.hero.eyebrow": "Annual transparency report · 2025",
  "transparency.hero.title":
    "Every <em>euro,</em> every <em>moderation,</em> every <em>mistake.</em>",
  "transparency.hero.dek":
    "The numbers behind QueerPulse in 2025 — finances, moderation actions, government requests, and the things we got wrong. <em>Published by Associação QueerPulse</em> on 14 May 2026, after independent review by Dra. Helena Faria (auditor).",
  "transparency.hero.meta.raised": "Total raised",
  "transparency.hero.meta.toPrograms": "To programs",
  "transparency.hero.meta.activeMembers": "Active members",
  "transparency.hero.meta.mistakesNamed": "Public mistakes named",
  "transparency.yearSwitch.inProgress": "in progress",
  "transparency.live.title": "Our first transparency report is coming soon",
  "transparency.live.description":
    "We'll publish audited figures here — where the money came from and went, moderation actions, government requests, and the mistakes we name — once our first reporting period closes.",
  "transparency.money.title":
    "Where the money <em>came from,</em> and where it <em>went.</em>",
  "transparency.money.sub":
    "All figures in euros, calendar year 2025. Books audited by an independent auditor (no relationship to the organisation), available on request as itemised CSV.",
  "transparency.money.sourcesHeading": "Where the €278,400 came from",
  "transparency.money.spentLabel":
    "Spent in 2025 · 96.1% of receipts · €10,980 surplus carried to reserves",
  "transparency.people.title": "The <em>people</em> behind the numbers.",
  "transparency.people.sub":
    "Members at year-end, growth, who actually shows up. We don't celebrate big numbers — only the right ones.",
  "transparency.moderation.title": "Moderation, <em>by the numbers.</em>",
  "transparency.moderation.sub":
    "What was reported, what we acted on, and how long it took. Every action logged; full anonymised log available to any member on request.",
  "transparency.moderation.colReason": "Reason for moderation action",
  "transparency.moderation.colCount": "Count",
  "transparency.moderation.colYoy": "YoY",
  "transparency.moderation.colPct": "% of all",
  "transparency.moderation.breakdown":
    "Action breakdown: <b>96 posts/comments removed</b>, <b>52 warnings issued</b>, <b>23 temporary suspensions</b> (median 7 days), <b>9 permanent bans</b>, <b>4 cases referred to ILGA</b> for legal handling.",
  "transparency.requests.title":
    "Government & legal <em>requests</em> for member data.",
  "transparency.requests.sub":
    "Every request we received from any government or legal entity in 2025. We comply with valid Portuguese court orders. <em>We do not comply with informal asks.</em>",
  "transparency.mistakes.title": "Things we got <em>wrong</em> in 2025.",
  "transparency.mistakes.sub":
    "Published because we want this section to be the easiest part of the report to write next year. <em>Naming our own mistakes is the price of being trusted.</em>",
  "transparency.governance.title": "How <em>decisions</em> got made.",
  "transparency.governance.sub":
    "Boring meeting minutes are the foundation of trust. Here's how QueerPulse's governance actually worked in 2025.",
  "transparency.governance.seeMore":
    "For full meeting minutes, the constitution, the Sustainer agreement, and the formal organisational chart, see Governance.",
  "transparency.signoff.title":
    "Signed in <em>good faith,</em> and ready for questions.",
  "transparency.signoff.body":
    "This report was prepared by Catarina Vaz and André Bento, reviewed by the full Assembly, and audited independently by Dra. Helena Faria of Faria Auditoria. <em>Errors are ours.</em> Questions, corrections, or concerns: <a>transparency@queerpulse.pt</a> — a real person reads them within 48 hours.",
  "transparency.signoff.role.catarina":
    "Co-treasurer · drafted finance + mistakes",
  "transparency.signoff.role.andre":
    "Co-treasurer · drafted moderation + governance",
  "transparency.signoff.role.auditor": "Independent auditor",
  "transparency.signoff.downloadPdf": "Download PDF (84 pages)",
  "transparency.signoff.downloadCsv": "Download raw CSV",

  // ── Changelog — page chrome. The 19 dated release entries (title/body/tag)
  //    are historical release notes — left English due to volume; flagged in
  //    the sweep report rather than rushed.
  "changelog.hero.backLabel": "Roadmap",
  "changelog.hero.eyebrow": "Platform changelog",
  "changelog.hero.title": "What's <em>changed,</em>",
  "changelog.hero.titleLine2": "and when.",
  "changelog.hero.sub":
    "Every update to QueerPulse, in reverse order. We publish changes here so you always know what's different and why. Nothing happens without a record.",
  "changelog.filterAria": "Filter updates by type",
  "changelog.filter.all": "All",
  "changelog.filter.feature": "Features",
  "changelog.filter.improvement": "Improvements",
  "changelog.filter.infrastructure": "Infrastructure",
  "changelog.filter.fix": "Fixes",
  "changelog.badge.feature": "Feature",
  "changelog.badge.improvement": "Improvement",
  "changelog.badge.infrastructure": "Infrastructure",
  "changelog.badge.fix": "Fix",
  "changelog.tag.work": "Open your Work hub",
  "changelog.tag.settings": "Notification settings",
  "changelog.tag.messages": "Open messages",
  "changelog.tag.communities": "Browse communities",
  "changelog.tag.subprofiles": "See subprofiles",
  "changelog.tag.personas": "See personas",
  "changelog.tag.housing": "See housing",
  "changelog.tag.directory": "Open the directory",
  "changelog.tag.cinema": "Visit Cinema",
  "changelog.tag.forum": "Visit the forum",
  "changelog.tag.profile": "Open your profile",
  "changelog.tag.gatherings": "See gatherings",
  "changelog.tag.members": "Meet the members",
  "changelog.tag.events": "Open the Events Hub",
  "changelog.tag.roadmap": "Open the roadmap",
  "changelog.tag.magazine": "Open the magazine",
  "changelog.tag.magazineWriter": "Open your workspace",
  "changelog.tag.safety": "See our safety approach",
  "changelog.tag.editProfile": "Edit your profile",
  "changelog.tag.employerReviews": "Read employer reviews",
  "changelog.tag.studio": "Visit the Studio",
  "changelog.tag.search": "Try global search",
  "changelog.tag.donate": "See where money goes",
  "changelog.tag.volunteer": "Find a way in",
  "changelog.tag.notifications": "Open your notifications",
  "changelog.tag.connections": "Open your connections",
  "changelog.tag.trustNetwork": "Open the trust network",
  "changelog.tag.invite": "Invite someone",
  "changelog.tag.imprint": "Read the legal notice",
  "changelog.tag.feed": "Open your feed",
  "changelog.tag.myEvents": "Open My Events",
  "changelog.tag.safeSpaces": "Find a safe space",
  "changelog.tag.pressKit": "Open the press kit",
  "changelog.tag.magazineDesk": "Open the desk",

  "changelog.entries.persona-preview-banner-bleed.title":
    "Persona banners now run edge-to-edge on your profile",
  "changelog.entries.persona-preview-banner-bleed.body":
    "The cover on the “Also working as” card now fills the card edge-to-edge, the same full-bleed look your personas already have on their own pages — so your profile and each persona page feel like one piece.",

  "changelog.entries.magazine-archive-truthful-hero.title":
    "The magazine archive shows only real editions now",
  "changelog.entries.magazine-archive-truthful-hero.body":
    "The all-editions page opened with a fixed headline and tally — “nine issues since 2024” and counts of articles, contributors and languages — that were placeholder figures, not your archive. Those now stay in the preview only; the live page leads straight into the real back issues.",

  "changelog.entries.persona-families-expansion.title":
    "Personas now fit many more crafts",
  "changelog.entries.persona-families-expansion.body":
    "Personas reach well beyond the stage now. There are six new page styles — a salon chair, a runway, a gallery, an oral-history record, a movement poster, and a classroom — plus dozens of new professions, each with a look built for the work you actually do.",

  "changelog.entries.astrologer-persona.title":
    "New astrologer personas, with their own celestial page",
  "changelog.entries.astrologer-persona.body":
    "You can now make an astrologer persona. It gets its own “chart” page — an indigo, star-flecked ephemeris with your readings numbered like houses, the sky today, what you need from a querent before a reading, and a plain statement of what a reading is not.",

  "changelog.entries.crisp-profile-photos.title":
    "Profile photos are sharper on member pages",
  "changelog.entries.crisp-profile-photos.body":
    "Some member portraits looked soft on the profile page while others were crisp. The large photo now requests a resolution that matches the space it fills, so every profile shows a clear, sharp portrait.",

  "changelog.entries.developer-persona-banner.title":
    "Developer personas can show a banner again",
  "changelog.entries.developer-persona-banner.body":
    "Developer, maker and other builder personas quietly hid the banner image you uploaded. If you've added a cover, it now shows across the top of the persona — and if you haven't, the page stays clean with no empty band.",

  "changelog.entries.persona-preview-edit-hidden.title":
    "Previewing your profile as a visitor now hides your Edit controls",
  "changelog.entries.persona-preview-edit-hidden.body":
    "When you previewed your own profile as a visitor, the Edit button still showed on your personas — so the preview didn't quite match what others see. It's now hidden, and the preview reflects the real visitor experience.",

  "changelog.entries.persona-solo-card-wide.title":
    "A single persona with a cover now fills the space",
  "changelog.entries.persona-solo-card-wide.body":
    "If your profile has just one persona and it has a cover photo, its card now lays out wide — cover beside the details — instead of sitting in a narrow column with an empty gap next to it. Sparser personas keep the compact card.",

  "changelog.entries.persona-performance-row-mobile.title":
    "Persona performance lists now read cleanly on phones",
  "changelog.entries.persona-performance-row-mobile.body":
    "On a narrow screen the year, title and venue of a performance used to fight for one line, squeezing the title until it broke one letter per line. Each part now takes its own line, so a dancer's — or any persona's — performances stay legible on mobile.",

  "changelog.entries.endorse-persona-by-owner-name.title":
    "Endorsing an unnamed persona now uses your name",
  "changelog.entries.endorse-persona-by-owner-name.body":
    "When someone leaves a persona named only after its craft — “Dancer”, “Developer” — the endorse dialog now addresses the person by their first name (“Endorse Philippine”) instead of the bare profession, so the words read like they're about a human, not a job title.",

  "changelog.entries.landing-featured-member-card.title":
    "A richer featured-member card on the homepage",
  "changelog.entries.landing-featured-member-card.body":
    "The members our team features on the homepage now appear in the same full spotlight card as our demo — a large portrait, their own words, and a link straight to their profile — rotating through everyone we've highlighted. It replaces the plainer little card that showed just a name and a line.",

  "changelog.entries.session-expiry-csrf-fix.title":
    "Fewer surprise “session expired” sign-outs",
  "changelog.entries.session-expiry-csrf-fix.body":
    "We fixed a bug that could log you out with a “session expired” message even though your session was still fine — the giveaway was that reloading the page signed you straight back in. It happened most often with the app open in more than one tab. Your session now quietly recovers on its own instead of dropping you to the sign-in screen.",

  "changelog.entries.persona-image-remove-confirm.title":
    "A quick check before you remove a persona photo",
  "changelog.entries.persona-image-remove-confirm.body":
    "Tapping the trash icon on an avatar, cover or item image no longer clears it instantly. You'll get a short confirmation first, so an accidental tap won't wipe a photo you meant to keep.",

  "changelog.entries.persona-craft-pass.title":
    "Personas look and feel better everywhere",
  "changelog.entries.persona-craft-pass.body":
    "A craft pass across the whole feature. Dark mode is fixed throughout — skin details, menus and state icons that used to wash out now stay crisp. The persona directory no longer stops at 40 people, loads with a proper skeleton instead of a spinner, and reads faster because persona styles no longer weigh down every other page. On a phone, the endorsers, report and delete dialogs are now bottom sheets you can swipe away, tap targets are bigger, address and link fields bring up the right keyboard, and you can preview your persona while editing. Sharing is tidier too: link previews no longer crop your photo, and the editor shows real art when something goes wrong.",

  "changelog.entries.persona-audit-hardening.title":
    "Personas: a polish and safety pass",
  "changelog.entries.persona-audit-hardening.body":
    "A broad sweep across personas. The editor now protects your work — it warns before the back button loses unsaved edits, keeps typing safe while a save is in flight, and asks you to save before publishing so what you see is what goes live. Public persona pages load their banner faster, read cleanly for screen readers, and never flash a stray placeholder. Followers stay private, links are scheme-checked for safety, and the persona directory loads quicker. Co-owners can edit freely, but only the creator can rename, unpublish, delete, or remove a co-owner — and everyone's notified if a shared persona is deleted.",

  "changelog.entries.persona-followers-owner-view.title":
    "See who follows your persona",
  "changelog.entries.persona-followers-owner-view.body":
    "The owner of a persona can now open its followers and see exactly who's there — the people quietly keeping up with your work. For everyone else, following stays private: no one else can see who follows a persona, and your own following never shows up to anyone.",

  "changelog.entries.persona-image-reuse-uploads.title":
    "Reuse a photo you've already uploaded",
  "changelog.entries.persona-image-reuse-uploads.body":
    "Every image slot in your persona editor — the avatar or logo, the cover banner, and each item's picture — can now pull from photos you've uploaded before, not just a fresh file from your device. Choosing an image opens a picker with your past uploads, so you can reuse the same shot across personas in a couple of taps, or delete ones you no longer need.",

  "changelog.entries.persona-banner-quality.title":
    "Crisper persona banners",
  "changelog.entries.persona-banner-quality.body":
    "Persona banner images now keep more of their detail, so a full-width cover stays sharp instead of looking soft on larger screens. We've also added a little breathing room between a bled banner and your name and photo. Re-upload an existing banner to pick up the higher quality.",

  "changelog.entries.modal-close-scroll-jump.title":
    "No more page jump when closing a dialog",
  "changelog.entries.modal-close-scroll-jump.body":
    "Closing a pop-up such as a persona's info card no longer snaps the page to the top and scrolls back down. Your scroll position is restored instantly, exactly where you left it.",

  "changelog.entries.persona-gallery-multi-add.title":
    "Add several photos to your gallery at once",
  "changelog.entries.persona-gallery-multi-add.body":
    "Building your persona's photo gallery is quicker now. Pick a batch from your device or your past uploads and they all go in together, up to the six-photo limit.",

  "changelog.entries.persona-gallery-lightbox.title":
    "Tap a persona photo to see it full-screen",
  "changelog.entries.persona-gallery-lightbox.body":
    "Photos in a persona's gallery now open full-screen when you tap them — the whole shot, uncropped, with arrow keys and on-screen arrows to move between them.",

  "changelog.entries.persona-gig-images.title":
    "Add a photo to your gigs",
  "changelog.entries.persona-gig-images.body":
    "Gig and show items in your persona editor now take an image, so your featured set list shines with a real photo instead of an empty slot.",

  "changelog.entries.persona-save-all-changes.title":
    "Save your persona in one go",
  "changelog.entries.persona-save-all-changes.body":
    "Your persona editor now saves everything at once, with a running list that shows exactly what you changed before you hit Save.",

  "changelog.entries.persona-page-motion.title":
    "Persona pages that move with you",
  "changelog.entries.persona-page-motion.body":
    "Persona pages now come alive as you arrive and scroll — the header settles in, and each section eases into view as you reach it. Every persona look keeps its own rhythm: some snap, some drift, and the quiet ones stay calm. It all respects your device's reduced-motion setting, so if you prefer things still, they stay still.",

  "changelog.entries.endorse-with-note.title":
    "Endorse a persona with a note",
  "changelog.entries.endorse-with-note.body":
    "Endorsing someone's persona now opens a proper window where you can add a short note about what makes their work worth backing. Already endorsed? Tap \"Endorsed\" to edit your note or withdraw your endorsement anytime.",

  "changelog.entries.persona-banner-bleed.title":
    "Let your persona banner bleed into the page",
  "changelog.entries.persona-banner-bleed.body":
    "Personas can now soften the seam where the cover photo meets the page. In your persona settings, under Presence, the new “Banner edge” option lets you keep the banner contained (as before) or have it bleed — the cover image fades gently into the page below it. It works on every persona look, dissolving into whatever colour sits beneath the banner.",

  "changelog.entries.persona-hero-actions-tidy.title":
    "A tidier action row on persona pages",
  "changelog.entries.persona-hero-actions-tidy.body":
    "The buttons at the top of a persona now read as a clear menu. Message and Follow lead, and the less-used actions — Share and Report — tuck into a “⋯” menu so the row isn't crowded. Your follower and endorsement counts moved into a single quiet line beneath, instead of being repeated on the buttons themselves.",

  "changelog.entries.fix-member-filter-collapse.title":
    "Tidier filters on the member directory",
  "changelog.entries.fix-member-filter-collapse.body":
    "When a filter group in the member directory was collapsed, a sliver of its contents (a checkbox or a chip) could still peek out beneath the heading. Collapsed groups now show only their heading, so the filter panel reads as a clean menu — and everything slides in as before when you open a group.",

  "changelog.entries.fix-persona-hero-theme-colors.title":
    "Persona status and social links now match your theme",
  "changelog.entries.fix-persona-hero-theme-colors.body":
    "On personas with a dark theme (like the stage look), the availability status and the social-link icons were washed out — dim text and a stark white icon chip. They now follow your persona's colours, so the status label stays readable and each social icon becomes a subtle, accent-tinted button that fits the theme.",

  "changelog.entries.persona-photo-gallery.title":
    "Add a photo gallery to your persona",
  "changelog.entries.persona-photo-gallery.body":
    "Personas can now show a photo gallery of up to 6 photos.",

  "changelog.entries.persona-project-links.title":
    "Add links to individual projects",
  "changelog.entries.persona-project-links.body":
    "Add links (like GitHub) to individual projects.",

  "changelog.entries.fix-persona-avatar-overlap.title":
    "Persona photos no longer overlap the title",
  "changelog.entries.fix-persona-avatar-overlap.body":
    "On some persona looks (like the developer and therapist styles), the profile photo could spill out of its frame and overlap the name, tagline, or buttons beside it. The photo now sits neatly inside its frame at the right size for each look, so the top of every persona reads cleanly.",

  "changelog.entries.network-modal-search.title":
    "Search your network lists",
  "changelog.entries.network-modal-search.body":
    "The \"Connected\" and \"Vouched for\" lists on your profile now have a search box, so you can filter a long list down to a name instantly.",

  "changelog.entries.profile-your-network.title":
    "See your network on your own profile",
  "changelog.entries.profile-your-network.body":
    "Your profile hero now shows a private row of \"Your network\" chips, just for you: how many people you're connected with, who you've vouched for, and who's vouched for you. Tap a chip to see the full list, newest first, with when each happened. Only you can see it, and it stays hidden when you preview your profile as a visitor.",

  "changelog.entries.fix-page-top-nav-overlap.title":
    "Page content no longer hides under the top menu",
  "changelog.entries.fix-page-top-nav-overlap.body":
    "The floating top menu used to overlap the very top of some pages, clipping a heading or button beneath it. Every page now reserves that space in one shared place, so nothing sits under the menu — and each page keeps its own breathing room.",

  "changelog.entries.nav-rail-redesign.title": "A clearer main menu",
  "changelog.entries.nav-rail-redesign.body":
    "The desktop menu now keeps every section in view — pick one from the rail and its links, plus a little preview, appear beside it. Same destinations, less hunting.",

  "changelog.entries.persona-photo-enlarge.title":
    "Tap a persona's photo to see it full-size",
  "changelog.entries.persona-photo-enlarge.body":
    "Just like on a regular profile, you can now tap a persona's avatar to open the photo full-screen — a proper look at who's behind the persona. Tap outside, hit the close button, or press Esc to dismiss it.",

  "changelog.entries.persona-mobile-hero.title":
    "Personas look at home on your phone",
  "changelog.entries.persona-mobile-hero.body":
    "A persona's header now settles into the same clean, centred column your own profile uses on a phone — the avatar, name, tagline and links stacked in the middle, with the action buttons stretched full-width and easy to reach with one thumb. No more cramped top-left pile on a narrow screen.",

  "changelog.entries.fix-persona-save-conflict.title":
    "Saving a second persona no longer throws an error",
  "changelog.entries.fix-persona-save-conflict.body":
    "Editing and saving a persona could fail with an “address already in use” error once you had more than one — even when you'd never set a public handle on either. A blank handle is now treated as “none” rather than an empty value that quietly collided with your other personas, so your changes save cleanly. If two personas ever do share the same address, we now tell you exactly which field to change.",

  "changelog.entries.magazine-desk-two-tracks.title":
    "Two tracks on the magazine desk: Highlights and Issue",
  "changelog.entries.magazine-desk-two-tracks.body":
    "Editors can now keep standalone platform highlights separate from the pieces being assembled into a full issue. Switch between the two tracks with a tap, and move any piece from one to the other — send a highlight into the current issue, or lift an issue piece back out to stand on its own. Search, filters and saved views all work within whichever track you're in, and new commissions land in the track you choose.",

  "changelog.entries.photo-metadata-strip-hardening.title":
    "Stronger removal of hidden location data from your photos",
  "changelog.entries.photo-metadata-strip-hardening.body":
    "Every photo you upload has its hidden metadata — including the GPS location many phones bake into a picture — removed in your browser before it ever leaves your device. We closed the gaps: if that removal can't complete for any reason, the upload is now blocked rather than sent as-is, and animated GIFs are cleaned in place without losing their animation. Your location stays yours.",

  "changelog.entries.fix-persona-cover-overlay-leak.title":
    "Persona banners show cleanly once you upload one",
  "changelog.entries.fix-persona-cover-overlay-leak.body":
    "On musician & DJ personas, the textured overlay meant for the empty, no-banner state was still painting over your banner after you'd uploaded one — dimming and speckling the photo. It now clears the moment a banner image is set, so your cover shows exactly as chosen.",

  "changelog.entries.members-filter-panel-polish.title":
    "A calmer member-directory filter panel",
  "changelog.entries.members-filter-panel-polish.body":
    "The filters on the member directory used to sit as seven near-identical floating boxes that read as visual clutter when collapsed. They're now one tidy panel with clean dividers between each group, and every filter header responds to hover and keyboard focus so it's clear you can open it.",

  "changelog.entries.fix-persona-stage-dark-legibility.title":
    "Persona pages stay readable in dark mode",
  "changelog.entries.fix-persona-stage-dark-legibility.body":
    "Two persona styles broke in dark mode — most visible in the editor's live preview. On the stage layout (musicians and DJs) the name, section headings and type pill turned dark-on-dark and all but vanished; the writer layout went almost entirely unreadable, its warm-ink text stranded on a near-black page. Both now stay light and legible in either theme, and the small ⓘ help icon beside a persona's name no longer reads as an empty ring on dark surfaces.",

  "changelog.entries.fix-persona-preview-avatar.title":
    "Persona photos now appear in the live preview — and the avatar is round again",
  "changelog.entries.fix-persona-preview-avatar.body":
    "In the persona editor, a freshly picked avatar or cover showed only a placeholder in the live preview until you saved. It now renders the moment you choose it. We also fixed a stray square that framed the circular avatar on the preview and the public persona page.",

  "changelog.entries.fix-vouch-success-self-face.title":
    "Your vouch confirmation now shows your face, not a placeholder",
  "changelog.entries.fix-vouch-success-self-face.body":
    "When you vouched for someone, the confirmation panel could pair the member's photo with a demo profile instead of yours. It now always shows your real avatar and initials beside theirs, so the \"backed\" moment reflects the actual person doing the vouching.",

  "changelog.entries.persona-readiness-estimate.title":
    "The persona readiness estimate now reflects what's really left",
  "changelog.entries.persona-readiness-estimate.body":
    "The \"Quick estimate\" on a persona's Get it live page now counts everything that's still worth adding — a cover image, your availability, a social link and enough content — instead of jumping to 100 the moment you could technically publish. The number only fills up once there's genuinely nothing left to polish.",

  "changelog.entries.fix-persona-item-drawer-scroll.title":
    "Scroll to every field when editing a showcase item",
  "changelog.entries.fix-persona-item-drawer-scroll.body":
    "The edit panel for a showcase item (like a gig or a project) no longer ran off the bottom of the screen on phones — you can now scroll through every field and reach Save.",

  "changelog.entries.my-uploads.title": "See and manage everything you've uploaded",
  "changelog.entries.my-uploads.body":
    "A new My uploads screen in Settings shows every picture you've uploaded, so you can spot and delete accidental double-uploads. It flags any picture that's still in use before you remove it.",

  "changelog.entries.profile-photo-picker.title":
    "Reuse a photo you've already uploaded",
  "changelog.entries.profile-photo-picker.body":
    "The new photo picker lets you set your profile photo from your past uploads, your device, or your Google photo — and tidy up old uploads you no longer need.",

  "changelog.entries.fix-persona-image-persistence.title":
    "Uploaded photos stay put after editing",
  "changelog.entries.fix-persona-image-persistence.body":
    "Fixed a bug where an uploaded photo could vanish after you edited something and reloaded — it showed at first, then reverted to the placeholder. This affected persona covers and avatars, your profile photo and work images, and business-listing photos. Saving no longer overwrites an untouched image, so your photos stick.",

  "changelog.entries.dark-ghost-button-contrast.title":
    "Outlined buttons are legible in dark mode",
  "changelog.entries.dark-ghost-button-contrast.body":
    "Secondary outlined buttons — like Share on a persona — were nearly invisible against dark backgrounds. Their outline and label now meet contrast guidelines, so they're clearly readable while staying subordinate to the primary action.",

  "changelog.entries.admin-media-delete-and-preview-fix.title":
    "Admins can delete stored files, and large previews no longer hide the controls",
  "changelog.entries.admin-media-delete-and-preview-fix.body":
    "In the admin media console, tall image previews used to push the file actions off the bottom of the screen — previews are now capped so every control stays reachable. Admins can also permanently delete a stored file straight from its details panel, with a confirmation step that warns when something still references it.",

  "changelog.entries.persona-editor-live-preview.title":
    "The persona editor preview updates as you type",
  "changelog.entries.persona-editor-live-preview.body":
    "The live preview beside the persona editor now reflects your changes to name, tagline, bio, avatar, cover, accent and call-to-action instantly — before you save — so you can see exactly how your persona will look while you edit.",

  "changelog.entries.fix-uploaded-avatar-not-showing.title":
    "Uploaded profile photos now show after saving",
  "changelog.entries.fix-uploaded-avatar-not-showing.body":
    "Fixed a bug where a profile photo you'd uploaded and saved appeared as a broken image once the page reloaded. Your saved portrait now displays reliably everywhere.",

  "changelog.entries.fix-image-preview-csp.title":
    "Image previews show again when uploading",
  "changelog.entries.fix-image-preview-csp.body":
    "Fixed a bug where the preview of a photo you'd just picked wouldn't appear while uploading — a security policy was blocking the local preview image. Your selected photo now shows immediately as it uploads.",

  "changelog.entries.use-google-profile-photo.title":
    "Use your Google photo on your profile",
  "changelog.entries.use-google-profile-photo.body":
    "If you signed in with Google and haven't set a profile photo yet, the profile editor now offers a one-tap “Use Google photo” button — so you can fill in your portrait from your Google account without hunting for a file to upload.",

  "changelog.entries.skip-link-keyboard-only.title":
    "“Skip to main content” now stays out of the way",
  "changelog.entries.skip-link-keyboard-only.body":
    "The “Skip to main content” shortcut — there to help keyboard users jump past the navigation — was occasionally flashing into view during ordinary browsing. It now appears only when you actually tab to it with the keyboard, and stays hidden the rest of the time.",

  "changelog.entries.enlarge-profile-photo.title":
    "Tap a profile photo to see it up close",
  "changelog.entries.enlarge-profile-photo.body":
    "On any member's profile, tap their photo to open a large, full version — so you can see exactly who they are before you reach out. Tap anywhere or press Escape to close.",

  "changelog.entries.tap-notification-to-profile.title":
    "Tap a notification to open the profile",
  "changelog.entries.tap-notification-to-profile.body":
    "When someone accepts your invite or your connection, the whole notification is now tappable and takes you straight to their profile — not just the small name link. Notifications that point somewhere more specific, like a thread or an event, still open that instead.",

  "changelog.entries.more-push-notifications.title":
    "More of what matters now reaches you as a push",
  "changelog.entries.more-push-notifications.body":
    "Push used to be just direct messages and event reminders. Now more of the moments that count can reach your lock screen — connection requests and accepts, mentions, replies on threads you're in, and vouches you receive, plus a heads-up whenever an event you're going to changes or is called off. There's a brand-new one for hosts too: a nudge when someone vouches for a safe space you look after. New on/off switches in settings let you keep Mentions and Vouches as loud or as quiet as you like, and a “Send yourself a test” button confirms it all lands on your device.",

  "changelog.entries.localized-push-notifications.title":
    "Push notifications in your language",
  "changelog.entries.localized-push-notifications.body":
    "System push notifications — like an event reminder — now render in Portuguese for members who've set the app to Portuguese, instead of always showing up in English. Direct-message previews were already in your own words; this brings the app's own copy in line with them.",

  "changelog.entries.magazine-desk-workspace-nav.title":
    "A dedicated workspace for the magazine desk",
  "changelog.entries.magazine-desk-workspace-nav.body":
    "The magazine editor now has its own left-hand navigation — Desk, Pitches and Issue, with jump-to (⌘K) and the “Since Friday” activity panel — in place of the general site menu, on every editor screen.",
  "changelog.entries.richer-push-notifications.title":
    "Push notifications that show who and what",
  "changelog.entries.richer-push-notifications.body":
    "Push notifications got richer — a direct message now shows who it's from, with their photo, and an event reminder shows the event's cover. Both come with a quick tap to jump straight in, and messages group neatly by conversation so your lock screen stays calm.",

  "changelog.entries.admin-uploaded-images.tag": "Open admin",
  "changelog.entries.admin-uploaded-images.title":
    "Admins can browse every uploaded image",
  "changelog.entries.admin-uploaded-images.body":
    "Admins can now browse every uploaded image stored on the platform, with per-file details — owner, storage metadata, and an on-demand real content-type check — for security review.",

  "changelog.entries.events-and-my-events-merged.title":
    "Events and Your events are now one page",
  "changelog.entries.events-and-my-events-merged.body":
    "Your events dashboard and finding new events now live together at /events, with a My events / Discover switch up top. It opens on your dashboard when you have events on, and on Discover when you don't.",

  "changelog.entries.trust-network-legend-withdrawn.title":
    "The trust-network legend now explains dashed lines",
  "changelog.entries.trust-network-legend-withdrawn.body":
    "On the Trust Network map, a vouch that was later retracted is drawn as a dashed red line. The legend now names it — “Withdrawn vouch” — so the dashed lines are no longer a mystery.",

  "changelog.entries.trust-network-replay-timeline.title":
    "Trust Network replay now tells the story person by person",
  "changelog.entries.trust-network-replay-timeline.body":
    "The Trust Network replay used to scrub month by month, lumping everyone who joined in the same month into one blur. Now it walks the network one connection at a time, in the real order people joined — each step names who connected and when, and the matching row in the side list lights up as it plays.",

  "changelog.entries.pronouns-on-member-cards.title":
    "Richer new-member cards in the feed",
  "changelog.entries.pronouns-on-member-cards.body":
    "New-member cards in your feed now show a member's pronouns right next to their name, plus where they're based and what they're into — so you get a sense of someone before you even open their profile. Location stays hidden for members whose profile isn't public.",

  "changelog.entries.onboarding-join-and-leave.title":
    "Join — and leave — communities during sign-up",
  "changelog.entries.onboarding-join-and-leave.body":
    "In the onboarding step that suggests communities, you can now tap a joined community again to leave it if you change your mind. The suggestions are also limited to fully open communities you can join in one tap — private and invite-only ones no longer appear here, since they can't be joined on the spot.",

  "changelog.entries.saved-and-searched-lists-load.title":
    "Saved events and searched lists load again instead of erroring",
  "changelog.entries.saved-and-searched-lists-load.body":
    "A handful of lists could fail to load and show an error instead of results: your Saved events tab (and the Going, Waitlisted and Past tabs), searching your messages, filtering the magazine by a single author, and searching the moderation queue. Each of these combined a lookup with paging in a way that tripped up the database query and returned nothing. They now load their results reliably.",

  "changelog.entries.admin-overview-stat-grid-responsive.title":
    "The admin dashboard stat cards fit the screen on mobile",
  "changelog.entries.admin-overview-stat-grid-responsive.body":
    "The four headline stat cards at the top of the admin dashboard used to stay in a fixed four-across row on narrow screens, squeezing each card until its label broke apart and the row ran off the side. They now cap at four across on wide screens and gracefully wrap down to two, then one, as the screen narrows — so every card stays readable on a phone.",

  "changelog.entries.trust-network-mobile-graph-first.title":
    "The Trust Network opens on the graph on mobile",
  "changelog.entries.trust-network-mobile-graph-first.body":
    "Opening a member's Trust Network on a phone now shows the connection graph straight away, instead of springing open a details sheet over it. Tap any person in the graph to slide up their vouch details and actions — and swipe or tap away to get back to the full picture.",

  "changelog.entries.magazine-article-versions.title":
    "Article drafts now keep a full version history",
  "changelog.entries.magazine-article-versions.body":
    "Every filed draft and manual save now keeps a version — editors can compare against the current draft and restore any earlier one without losing work.",

  "changelog.entries.magazine-article-comments.title":
    "Threaded notes on article drafts",
  "changelog.entries.magazine-article-comments.body":
    "Editors can leave threaded notes on an article, reply to each other, and resolve a note once it's handled.",

  "changelog.entries.magazine-desk-live-notifications.title":
    "The magazine desk's activity panel now shows real editorial events",
  "changelog.entries.magazine-desk-live-notifications.body":
    "The magazine desk's activity panel now shows real editorial events — who did what, when — linking straight to the piece, instead of the same fixed demo list every time.",

  "changelog.entries.magazine-desk-wave-b-fixes.title":
    "Archive search, contents blurbs, and kill-fee terms — now real",
  "changelog.entries.magazine-desk-wave-b-fixes.body":
    "Archive search now finds published pieces live, instead of a static demo list. Issue contents blurbs and reader-letter “run in letters” selections now actually save — the letters toggle used to accidentally create a duplicate letter instead of updating the one you clicked. Contributors also see the real kill-fee terms on each commission, not boilerplate.",

  "changelog.entries.magazine-commission-editor-fix.title":
    "Commissioning a piece works on a brand-new magazine",
  "changelog.entries.magazine-commission-editor-fix.body":
    "Commissioning a piece from the editor desk could fail with an “editorId must be a UUID” error — it happened on a fresh magazine that had no pieces assigned to anyone yet. Commissions are now stamped with your own signed-in editor identity, so they go through straight away.",

  "changelog.entries.magazine-issue-production.title":
    "Issue production",
  "changelog.entries.magazine-issue-production.body":
    "Added issue production — arrange the running order, set the cover and coverlines, curate the members' digest and social cards, and ship the whole issue at once with a pre-ship checklist.",

  "changelog.entries.events-page-utility-redesign.title":
    "A cleaner, faster events page",
  "changelog.entries.events-page-utility-redesign.body":
    "Events is now a utility-first page: a compact header with the My events / Discover switch and one place to host, no oversized hero, a small “Next up” highlight when something's on, and search in Browse.",

  "changelog.entries.magazine-writer-workspace.title":
    "The writer workspace",
  "changelog.entries.magazine-writer-workspace.body":
    "Opened the contributor workspace — writers now see their own assignments, pitches and payments, choose their byline, and file drafts, all in one place.",

  "changelog.entries.persona-discovery-nudges.title":
    "Personas, easier to discover",
  "changelog.entries.persona-discovery-nudges.body":
    "A persona of your own is now easier to notice, whenever it's relevant: a quiet suggestion on your profile if you haven't made one yet, a closing nudge at the bottom of the persona directory, a step during onboarding, a prompt after a gathering you performed at, and a highlighted credit when someone credits your work on theirs. Every one of these is dismissible.",

  "changelog.entries.magazine-deck-editor-redesign.title":
    "The slide-deck editor, redesigned",
  "changelog.entries.magazine-deck-editor-redesign.body":
    "Redesigned the slide-deck editor to match the magazine desk — a live slide preview that mirrors exactly what readers see, per-slide character budgets, and a pre-publish checklist.",

  "changelog.entries.magazine-desk-redesign.title":
    "The magazine editor desk, redesigned",
  "changelog.entries.magazine-desk-redesign.body":
    "Redesigned the magazine editor desk — a live editorial dashboard with pipeline, board and issue-plan views, a pitch inbox, saved views, command palette (⌘K) and keyboard shortcuts.",

  "changelog.entries.persona-directory-redesign.title":
    "The persona directory, redesigned",
  "changelog.entries.persona-directory-redesign.body":
    "Browsing personas is now organised by six craft families — Stage, Studio, Page, Workshop, Practice and Table — so you can narrow in on the kind of work you're after before you even search. Cards now show tags and a follower count at a glance, and a lighter \"Also working as\" block on member profiles gives each linked persona the same clearer, richer look.",

  "changelog.entries.persona-editor-redesign.title":
    "A redesigned editor for your personas",
  "changelog.entries.persona-editor-redesign.body":
    "Editing a persona now has its own dedicated space: a section rail on the left, a live preview docked next to your edits, richer fields for gigs, visual work and projects, and a clear heads-up before an already-published address changes.",

  "changelog.entries.magazine-article-editor.title":
    "The block-based article editor, live",
  "changelog.entries.magazine-article-editor.body":
    "Added the block-based article editor — write in paragraphs, headings, pull quotes, images, Q&As and stat rows, with inline emphasis, a slash menu, a live word and read-time count, and a pre-publish checklist.",

  "changelog.entries.magazine-piece-record.title":
    "The full piece record, opened",
  "changelog.entries.magazine-piece-record.body":
    "Opened the full piece record — brief, care & consent, money, history and reader letters — with a publish gate that holds a piece until consent and the sensitivity read are settled.",

  "changelog.entries.persona-dashboard-redesign.title":
    "Your personas, in one redesigned dashboard",
  "changelog.entries.persona-dashboard-redesign.body":
    "Your personas dashboard got a redesign: each card now shows a draft-readiness ring or a live status pill, its tie and availability at a glance, and how many co-owners it has. Starting a new persona is now a guided two-step flow — pick what it's for, then give it a name and choose whether it's linked to your profile or stands on its own.",

  "changelog.entries.persona-pages-redesigned.title":
    "Persona pages, redesigned for every craft",
  "changelog.entries.persona-pages-redesigned.body":
    "Every persona now gets a page built for how that craft actually shows up: performers get a stage marquee with booking details, visual artists get a studio wall with a full-screen work lightbox, writers get a page-like layout with pull-quotes, coders and makers get a workshop sheet, therapists get a calm practice layout with session logistics, and chefs and mixologists get a printed menu card. Reporting a persona and seeing who's endorsed or following them also moved into their own focused screens.",

  "changelog.entries.persona-page-unavailable-reasons.title":
    "Persona pages now tell you why, not just \"not found\"",
  "changelog.entries.persona-page-unavailable-reasons.body":
    "If a persona is private, members-only, or has been removed, its page now says which one instead of a plain \"not found.\" And if you're the owner (or co-owner) of a persona you haven't published yet, its address now shows you a preview of your own draft with a publish-readiness banner, rather than nothing at all.",

  "changelog.entries.meet-the-table.title": "See who's at the table",
  "changelog.entries.meet-the-table.body":
    "Supper club pages now show a warm, top-down view of the table — who's hosting, who's already coming, and which seats are still open. Tap someone to read a little about them before you arrive. We also retired an old placeholder ticket-checkout screen that was never a real payment.",

  "changelog.entries.settings-mobile-nav-strips.title":
    "Easier settings and profile editing on your phone",
  "changelog.entries.settings-mobile-nav-strips.body":
    "On a phone, Settings and Edit profile now carry a compact strip of tabs that stays pinned to the top as you scroll, so you can jump straight to a section instead of scrolling past everything. On Edit profile the current section highlights itself as you move down the page.",

  "changelog.entries.places-card-mobile-foot.title":
    "Tidier “Places you run” cards on mobile",
  "changelog.entries.places-card-mobile-foot.body":
    "On a phone, the reference number and the Edit / Delete / View listing actions on your directory-listing cards no longer squeeze onto one cramped line — the reference now sits on its own row above a clean row of actions.",

  "changelog.entries.vouch-for-a-safe-space.title": "Vouch for a safe space",
  "changelog.entries.vouch-for-a-safe-space.body":
    "If a venue has been good to you, you can now add your own vouch to its safe-space page — with an optional note and how you know the place, or anonymously. Your vouch joins the ones other members and moderators have left, so newcomers can see who stands behind a space.",

  "changelog.entries.my-events-change-list-live.title":
    "See what's changed in My Events",
  "changelog.entries.my-events-change-list-live.body":
    "The bell on your My Events page now works outside the demo. Open it for a running list of updates to events you've RSVP'd to or been invited to — a changed time, a new place, a cancellation — each one marked unread until you've seen it.",

  "changelog.entries.applications-inside-work-hub.title":
    "Applications moved into your Work hub",
  "changelog.entries.applications-inside-work-hub.body":
    "Applications no longer has its own line in the profile menu — it now lives at the top of your Work hub, alongside mentorship, skills and everything else career-related. Open Work from the profile menu and you'll find your applications waiting there in both demo and live mode.",

  "changelog.entries.invite-only-community-tier.title":
    "Invite-only communities are gated again",
  "changelog.entries.invite-only-community-tier.body":
    "Communities set to invite-only or request-to-join were showing an “Open to all” label and a one-tap Join button — the same as a fully open community. They now display their real join policy everywhere (the directory cards, the community page and the join sheet), so an invite-only space asks for an invite instead of letting anyone straight in.",

  "changelog.entries.navbar-wordmark-no-wrap.title":
    "The QueerPulse logo no longer stacks up",
  "changelog.entries.navbar-wordmark-no-wrap.body":
    "On some screen sizes the QueerPulse wordmark in the top bar could break apart, dropping each letter onto its own line and puffing the bar into an oversized bubble. The logo now stays on a single line at every width.",

  "changelog.entries.mobile-edit-profile-refresh.title":
    "Editing your profile matches the new look",
  "changelog.entries.mobile-edit-profile-refresh.body":
    "On a phone, editing your profile now uses the same centered layout as your profile itself — a round photo up top and tidier fields — and the Status & Visibility options no longer spill onto a second line.",

  "changelog.entries.mobile-profile-header-refresh.title":
    "A cleaner profile on your phone",
  "changelog.entries.mobile-profile-header-refresh.body":
    "Member profiles now lead with a centered photo and name, a roomier stats row, and a tidier set of buttons — so saying hello and vouching feel calmer and clearer on mobile.",

  "changelog.entries.profile-edit-save-bar-mobile.title":
    "Saving your profile on a phone just works",
  "changelog.entries.profile-edit-save-bar-mobile.body":
    "While editing your profile on mobile, the Save and Discard buttons no longer hide behind the bottom navigation bar. The editing bar now sits cleanly above it, and on narrow screens the two buttons share the full width so they're easy to tap.",

  "changelog.entries.follow-topics-you-care-about.title":
    "Follow the topics you care about",
  "changelog.entries.follow-topics-you-care-about.body":
    "Tap Follow on any topic to keep it close. Your follows are saved to your account, so the subjects that matter to you travel with you across devices.",

  "changelog.entries.event-change-alerts.title":
    "Know when an event changes",
  "changelog.entries.event-change-alerts.body":
    "If an event you've RSVP'd to or been invited to moves its time or place, you'll get a notification — so a last-minute change never catches you out.",

  "changelog.entries.forms-that-really-submit.title":
    "Forms across the app now really submit",
  "changelog.entries.forms-that-really-submit.body":
    "Newsletter signup, the contact and partner enquiry forms, grant / panel / sober-host applications, and safe-space nominations now genuinely send instead of showing a preview. Your event defaults (visibility and email) also save for real.",

  "changelog.entries.save-events-for-later.title":
    "Save events for later",
  "changelog.entries.save-events-for-later.body":
    "Found a gathering you're not ready to RSVP to yet? Tap Save to bookmark it. Everything you save shows up under the Saved tab in My Events, so nothing you were curious about slips away.",

  "changelog.entries.collections-are-here.title":
    "Group your saves into collections",
  "changelog.entries.collections-are-here.body":
    "You can now gather the people, places, and posts you've saved into your own named collections — a reading list, a trip, a shortlist of spaces. Create as many as you like and add or remove things whenever you want.",

  "changelog.entries.your-mentions-in-one-place.title":
    "Every mention, in one place",
  "changelog.entries.your-mentions-in-one-place.body":
    "When someone @-mentions you in a forum thread or a community post, it now lands in your Mentions inbox so you can catch up on everything that named you without hunting through notifications.",

  "changelog.entries.new-moderation-tools.title":
    "More tools for the moderation team",
  "changelog.entries.new-moderation-tools.body":
    "Behind the scenes, the team gained real controls: verify or restrict a member, add and remove community moderators, act on reading-group proposals, and publish or export governance records — all wired to the platform instead of standing in as previews.",

  "changelog.entries.reports-reach-the-team.title":
    "Reports now reach the moderation team",
  "changelog.entries.reports-reach-the-team.body":
    "When you report a forum post, it now reaches the moderators reliably — and if sending ever fails, you'll see a clear error and a way to try again, instead of a false \"done\". You can also report an individual reply, not just the opening post.",

  "changelog.entries.chat-recovers-after-reconnect.title":
    "Chat catches up when you're back online",
  "changelog.entries.chat-recovers-after-reconnect.body":
    "If a message can't send because you lost connection, it now sends itself as soon as you're reconnected — no need to reload or resend by hand. A small banner tells you when you're offline or reconnecting so you always know where a message stands.",

  "changelog.entries.honest-live-states.title":
    "What you see is real",
  "changelog.entries.honest-live-states.body":
    "We swept the app so that pages only ever show real people and content. Placeholder press clippings, sample voices, and example inventory no longer appear as if they were real, and controls that aren't wired up yet are clearly marked instead of pretending to save.",

  "changelog.entries.community-activity-in-your-feed.title":
    "Your feed now shows what's happening in your communities",
  "changelog.entries.community-activity-in-your-feed.body":
    "Your home feed pulls in real activity from the communities you're part of — posts, announcements, new gatherings, forum threads, and the people who just joined. When you create a gathering or start a forum thread, you can share it straight to one of your communities.",

  "changelog.entries.assignable-staff-roles.title":
    "Admins can now assign magazine staff roles",
  "changelog.entries.assignable-staff-roles.body":
    "From the member directory, admins can grant two functional roles on top of a member's account level: Magazine Editor and Magazine Writer. Access to the magazine editorial desk now follows the Magazine Editor role rather than any moderator — admins keep access, as before.",
  "changelog.entries.assignable-staff-roles.tag": "Open the member directory",

  "changelog.entries.feed-scroll-no-longer-sticks.title":
    "Your feed scrolls smoothly again",
  "changelog.entries.feed-scroll-no-longer-sticks.body":
    "On the home feed, notifications, members and gatherings, scrolling with a mouse or trackpad over the content could get stuck, moving nothing while the page stayed put. It now scrolls the page the way it should, everywhere.",

  "changelog.entries.fresh-feed-card-layout.title":
    "A fresh look for your feed",
  "changelog.entries.fresh-feed-card-layout.body":
    "Every card in your home feed — new members, gatherings, communities and community posts — now shares one cleaner layout, and packs two-to-a-row on wider screens so you can browse more at a glance.",

  "changelog.entries.feature-communities-cta-jump.title":
    "“Choose communities” now takes you straight to the picker",
  "changelog.entries.feature-communities-cta-jump.body":
    "On your profile, the Communities block's “Choose communities” button now opens Edit profile scrolled right to the communities picker, instead of dropping you at the top of the page to find it yourself.",
  "changelog.entries.feature-communities-cta-jump.tag": "Choose communities",

  "changelog.entries.live-homepage-curated-sections.title":
    "The homepage now shows real, admin-curated people and communities",
  "changelog.entries.live-homepage-curated-sections.body":
    "The public homepage's member, community, and changemaker sections now pull from the admin-curated list — real people and communities the team has chosen to introduce, not placeholder content. A section stays hidden until something's been curated for it.",

  "changelog.entries.featured-homepage-consent-toggle.title":
    "Opt in to being featured on the homepage",
  "changelog.entries.featured-homepage-consent-toggle.body":
    "Privacy settings now has a toggle letting admins feature you on the admin-curated homepage — a member quote or highlight, chosen only from public, opted-in profiles. It's off by default, only available once your profile is set to “Open to connect,” and you can turn it off again any time.",
  "changelog.entries.featured-homepage-consent-toggle.tag":
    "Open your privacy settings",

  "changelog.entries.mobile-profile-top-breathing-room.title":
    "A calmer top on mobile profiles",
  "changelog.entries.mobile-profile-top-breathing-room.body":
    "Profile pages on phones now have more breathing room at the top, so the avatar and details no longer sit crammed under the header. We also dropped the “Queer Pulse” wordmark from the top strip on inner pages — the back arrow and the home button in the bottom bar already get you where you need to go, so it was just clutter.",

  "changelog.entries.accessible-names-screen-readers.title":
    "Screen readers now name every control",
  "changelog.entries.accessible-names-screen-readers.body":
    "Buttons and switches that showed only an icon — the send button in a livestream chat, the payment buttons at checkout, the toggles in your studio settings, moderation and notification cards — now announce a clear name to screen readers, so nothing reads as an unlabelled “button”. We also added an automatic check that holds the whole app at zero missing labels from here on. Nothing about how anything looks or works has changed; it's purely an accessibility pass.",

  "changelog.entries.icons-not-text-symbols.title":
    "Crisper icons in place of text symbols",
  "changelog.entries.icons-not-text-symbols.body":
    "Across the platform, the little directional and status marks — the “next” and “back” arrows on buttons and links, dropdown carets, the drag handles, the clock and play marks — are now drawn with proper icons instead of typed-in text characters. They render sharply and identically on every device and font, line up neatly with their labels, and read correctly to screen readers. Purely a polish and accessibility pass; nothing about what the buttons do has changed.",

  "changelog.entries.message-alerts-out-of-notifications.title":
    "New-message alerts moved out of the notifications centre",
  "changelog.entries.message-alerts-out-of-notifications.body":
    "Your Notifications tab no longer fills up with “You have a new message” rows. New direct messages now show only where you'd expect them — the unread count on the message icon and, if you've opted in, a push notification. Nothing changed about the messages themselves; the notifications centre is just quieter and focused on the things you can't already see in your inbox.",

  "changelog.entries.shared-ui-consistency.title":
    "Smoother, more consistent dialogs and forms",
  "changelog.entries.shared-ui-consistency.body":
    "We rebuilt dozens of pop-ups, confirmations, pickers and forms on one shared set of building blocks. In practice that means every dialog now traps keyboard focus, closes on Escape in the right order when several are open, and returns you exactly where you were — so the whole app feels tidier and works better with a keyboard or screen reader. No feature moved; things just behave the same way everywhere now.",

  "changelog.entries.balanced-feed-grid.title":
    "A more balanced home feed",
  "changelog.entries.balanced-feed-grid.body":
    "Your home feed now lays its cards out as a tidy grid instead of one tall stack. Light cards — new members, saved reads, gathering recaps — sit two or more to a row on a wide screen, so you see more people at a glance and the People tab reads like a proper directory. Richer cards like posts, community pulse and gatherings still take the full width where the extra room helps. On a phone it all folds back to a single column.",

  "changelog.entries.moderation-outcome-notifications.title":
    "You'll now hear the outcome of a moderation decision",
  "changelog.entries.moderation-outcome-notifications.body":
    "When the moderation team warns, suspends, or closes an account, the member now receives a notification explaining what happened and why — in their own language, with the reason the moderator wrote and a link to appeal the decision. A suspended or banned member is also taken straight to a page that shows the same reason and, for a suspension, when it lifts — instead of a blank screen that won't load. Until now only the person who filed a report was told the outcome; the member it affected was left in the dark. Moderation notifications are always delivered and can't be muted.",

  "changelog.entries.community-page-polish.title":
    "A friendlier community page",
  "changelog.entries.community-page-polish.body":
    "The single community page got a pass of polish: you can now share a community with a friend, leaving one asks you to confirm first so it never happens by accident, the Events tab lists every upcoming gathering instead of just the next, and switching tabs updates the link so you can share or bookmark a specific view. Non-members can read along without stray reply boxes, and your own posts now show your real name and photo the moment you share them.",

  "changelog.entries.job-application-status.title":
    "See where your job applications stand",
  "changelog.entries.job-application-status.body":
    "The application tracker now shows your real applications — what you applied to, when, and where each one is in the process — instead of a placeholder. Open any card to revisit the answers you sent.",

  "changelog.entries.data-request-history.title":
    "Your data-request history, in one place",
  "changelog.entries.data-request-history.body":
    "The privacy page now lists your real past data requests — access, correction, objection and the rest — with their reference and current status, so you can follow one up without guessing.",

  "changelog.entries.community-settings-controls.title":
    "Save, archive, or hand over your community",
  "changelog.entries.community-settings-controls.body":
    "If you run a community, the moderation panel's settings now do what they say: editing the name, description and house rules saves for real, you can archive a community, and you can transfer ownership to another member. No more changes that quietly went nowhere.",

  "changelog.entries.feed-keeps-loading.title":
    "The feed keeps loading as you scroll",
  "changelog.entries.feed-keeps-loading.body":
    "The community feed used to stop after the first page. It now loads more on its own as you reach the end — and there's a keyboard-friendly “Load more” for when you'd rather tap.",

  "changelog.entries.faster-first-load.title":
    "A faster first load",
  "changelog.entries.faster-first-load.body":
    "We now load each part of the interface's wording only when a screen needs it, instead of shipping all of it up front. The app opens noticeably quicker, especially on a phone or a slower connection.",

  "changelog.entries.readable-text-contrast.title":
    "Easier-to-read text across the app",
  "changelog.entries.readable-text-contrast.body":
    "A set of faint captions, hints and labels — in collections, the GIF picker, profile cards and a few other spots — were too light against the background. They now meet accessible contrast, in both light and dark mode.",

  "changelog.entries.ios-splash-screens.title":
    "A polished launch screen on iPhone",
  "changelog.entries.ios-splash-screens.body":
    "When you open QueerPulse from your iPhone home screen, it now shows a proper branded launch screen while it starts up, instead of a blank white flash. Android notifications also get a cleaner badge.",

  "changelog.entries.removed-content-stays-hidden.title":
    "Removed content stays hidden everywhere",
  "changelog.entries.removed-content-stays-hidden.body":
    "When a moderator takes something down, it now consistently disappears everywhere it could show — including direct messages, business and housing listings, and personas — and taken-down messages no longer count toward your unread badges.",

  "changelog.entries.help-demo-example-live-hidden.title":
    "Help panels no longer show demo examples in live mode",
  "changelog.entries.help-demo-example-live-hidden.body":
    "The “About this screen” help used to end with an “In the demo” example even in live mode, where that sample data doesn't exist. That aside now only appears when you're exploring the demo.",

  "changelog.entries.smaller-help-icon.title":
    "A smaller “About this screen” help icon",
  "changelog.entries.smaller-help-icon.body":
    "The little ⓘ help icon next to a page title used to grow with the heading and could look oversized next to the big display titles. It's now a discreet, consistent size on every screen.",

  "changelog.entries.community-rules-and-tags-polish.title":
    "Clearer house rules and tags in community details",
  "changelog.entries.community-rules-and-tags-polish.body":
    "A community's house rules now show their proper wording instead of an internal code, and the tags at the bottom of the About page stay legible in dark mode.",

  "changelog.entries.co-owned-subprofiles.title":
    "Co-own a persona with someone else",
  "changelog.entries.co-owned-subprofiles.body":
    "Some work is a duet, not a solo — a DJ act, a band, a joint studio. You can now invite another member to co-own a subprofile: once they accept, you both fully manage it, it shows up on both your profiles, and either of you can invite someone new, leave, or edit what's shared. Deleting a co-owned persona now tells you upfront how many people it affects.",

  "changelog.entries.smoother-mobile-navigation.title":
    "A smoother way to move around on your phone",
  "changelog.entries.smoother-mobile-navigation.body":
    "Getting around QueerPulse on a phone should feel like moving, not loading. The bottom tab bar now stays with you in the browser too, not only once you've installed the app, and pages settle into place with a smooth transition instead of snapping. Each tab remembers exactly where you left it, and tapping the one you're already on carries you straight back to the top. Swipe in from the left edge of the screen to go back, and pull down on your feed, events, members, messages or notifications to refresh with a quick tug instead of a reload.",

  "changelog.entries.no-sideways-scroll-on-mobile.title":
    "Pages scroll top-to-bottom on your phone again",
  "changelog.entries.no-sideways-scroll-on-mobile.body":
    "On some phones a page could drift sideways and feel stuck — everything looked too wide and cramped, and the whole screen slid left and right instead of scrolling up and down. That's fixed across the app. Long links, handles and words now wrap onto the next line instead of stretching a card past the edge of the screen, and the page is held to your phone's width so it only ever scrolls the way it should: down.",

  "changelog.entries.no-placeholder-people-in-live.title":
    "Live mode now shows only real people",
  "changelog.entries.no-placeholder-people-in-live.body":
    "A few corners of QueerPulse were quietly showing example people from the demo to real members — a wellbeing directory of made-up therapists, a job application that arrived pre-filled with someone else's name and email, and magazine stories written by placeholder authors. That's fixed. You'll now see real content where it exists, your own details where a form asks for them, and an honest “still being built” note where something isn't ready yet — never a stand-in pretending to be a person.",

  "changelog.entries.honest-roadmap-promises.title":
    "The roadmap now keeps its promises — and says no, honestly",
  "changelog.entries.honest-roadmap-promises.body":
    "When something on the roadmap carries a Committed badge, that's a real promise, not a guess — and if its date ever moves, you'll see the actual reason why, published right there instead of quietly disappearing. There's also a new “Not building this, and why” list, so a request that isn't happening gets an honest answer instead of silence. Behind it, the team's roadmap tools got a full rebuild — a proper board for moving work from idea to shipped, a timeline, and a real queue for reading and responding to what members ask for — so what you see here stays current, not stale.",

  "changelog.entries.invite-resend-and-qr.title":
    "Resend an invite that ran out — and share it with a QR code",
  "changelog.entries.invite-resend-and-qr.body":
    "An invite that expired before your friend got to it no longer means starting over. Open your sent invites, tap “Send again” on the expired one, and the same link comes back to life for another week. Every invite you generate now also comes with a QR code, so someone can join by scanning it straight from your phone — across a table or at an event, no link to copy. And if an invite was addressed to a different email, or the person who invited you is no longer on QueerPulse, you'll now get a clear, kind explanation instead of a puzzling error.",
  "changelog.entries.invite-resend-and-qr.tag": "Invite someone",

  "changelog.entries.smoother-onboarding-first-minutes.title":
    "A gentler welcome for your first few minutes",
  "changelog.entries.smoother-onboarding-first-minutes.body":
    "Setting up your space just got kinder. If you step away partway through, we now remember where you were and pick up right there instead of starting you over. The “here for” tags you choose show on your profile from the start, and coming back to onboarding will never quietly overwrite them. Moving through the steps with a keyboard or screen reader now lands you in the right place each time, and you can step back a page whenever you want a second look.",

  "changelog.entries.events-open-at-top.title":
    "Events opens at the top",
  "changelog.entries.events-open-at-top.body":
    "Opening Events (or any tab) now always starts you at the top of the page. It used to drop you back at wherever you'd last scrolled to, which on the tall Events cover left you stranded mid-page. Pressing your browser's Back button still returns you to exactly where you were.",
  "changelog.entries.events-open-at-top.tag": "Browse events",

  "changelog.entries.chat-header-tap-to-profile.title":
    "A calmer chat header",
  "changelog.entries.chat-header-tap-to-profile.body":
    "The top of a conversation now works the way you'd expect: tap the person's name or photo to open their profile — no separate button needed. The layout is tidier too, with the info and starred-messages controls gathered into one neat pair in the corner instead of floating out of place.",
  "changelog.entries.chat-header-tap-to-profile.tag": "Open messages",

  "changelog.entries.sheet-close-scroll-jump-fix.title":
    "No more jumping back to the top",
  "changelog.entries.sheet-close-scroll-jump-fix.body":
    "If you opened your account sheet partway down a page and closed it again, the page would sometimes snap back up to the top — losing your place. It now stays exactly where you left it.",

  "changelog.entries.mobile-account-you-tab.title":
    "Your account, one tap away on mobile",
  "changelog.entries.mobile-account-you-tab.body":
    "On a phone, tapping your photo in the bottom bar now opens a space that's just yours — your profile, connections, saved places, applications and settings, gathered into one tidy sheet instead of scattered down a long menu. Messages moved up top beside notifications, so the people you're talking to stay within reach, and the “More” menu is now just for exploring the rest of QueerPulse.",

  "changelog.entries.instagram-style-mobile-profile.title":
    "Your profile, redesigned for your phone",
  "changelog.entries.instagram-style-mobile-profile.body":
    "On a phone, your profile now opens the way the apps you already know do: a compact avatar wrapped in a soft pride-gradient ring, a stat row you can take in at a glance — vouches, communities, personas — a highlights strip of your personas right up top, and the rest of your profile organised into swipeable, tabbed sections instead of one long scroll.",

  "changelog.entries.forum-upvotes-tags-search.title":
    "The forum grew up — upvotes, tags, search and lockable threads",
  "changelog.entries.forum-upvotes-tags-search.body":
    "The commons got a proper set of tools. You can now upvote a thread or a reply for real, so the answers people found most useful rise to where you'll see them. Sort the board by Active or Unanswered — not just Top and New — to find the conversations that need a voice or the ones still waiting for a first reply. When you start a post you can add a few tags like #housing or #health, and tapping any tag filters the whole board down to that topic. There's a search box now, so you can look for a thread instead of scrolling for it. And moderators can close a thread to new replies when a conversation has run its course — it stays readable, just paused.",
  "changelog.entries.forum-upvotes-tags-search.tag": "Open the forum",
  "changelog.entries.list-business-wizard-overhaul.title":
    "Adding your space to the directory just got a lot easier",
  "changelog.entries.list-business-wizard-overhaul.body":
    "We rebuilt the whole “list a business” flow. If you're just recommending a place you love, we now only ask for what you can actually know — a name, where it is and a line about why — instead of demanding owner details and opening hours you don't have. Can't paste a Google Maps link? Type the address and tap “Locate this address”, or drop a pin on the neighbourhood and nudge it into place — you're never stuck. Opening hours now handle lunch-break splits and late nights that run past midnight, and as you type a name we check the real directory so you don't accidentally add a place that's already there. Your progress saves as you go and now follows you across devices, so you can start on your phone and finish on a laptop. Every business also gets a clear way to claim its own listing or dispute one added without its say-so, and anyone can still flag a listing that shouldn't be there.",
  "changelog.entries.list-business-wizard-overhaul.tag": "List your space",
  "changelog.entries.mobile-experience-pass.title":
    "The whole app, tuned for your thumb",
  "changelog.entries.mobile-experience-pass.body":
    "We went screen by screen to make QueerPulse feel right in one hand. Buttons, chips and switches are bigger and easier to hit, and menus, filters and dialogs now rise up from the bottom of the screen as sheets you can flick away — right where your thumb already is. There's a clear back arrow at the top of every page you can reach without installing the app, and when you open a chat it fills the screen so nothing gets in the way, with the message box always sitting just above the keyboard. Slide-deck stories, the events calendar, the directory filters and the admin tools all read comfortably on a phone now, in portrait, without pinching or scrolling sideways.",

  "changelog.entries.magazine-deck-authoring.title":
    "Editors can now build their own interactive decks",
  "changelog.entries.magazine-deck-authoring.body":
    "The interactive slide-deck format from the magazine's front page used to be something we assembled by hand — now editors get a full authoring tool right in the dashboard. Add slides in five layouts (text, full-bleed image, a big animated stat, a before-and-after slider, or a tap-to-reveal moment), fill in the byline and metadata, and preview it exactly as readers will see it. Save a draft while you're still shaping it, then publish when it's ready — it'll show up with the “Interactive” tag on the magazine's front page.",

  "changelog.entries.listings-moderation-console.title":
    "The listings queue is now a real moderation console",
  "changelog.entries.listings-moderation-console.body":
    "Reviewing directory submissions is faster now: the queue has real pagination, search by name, submitter or reference, and sort by newest, oldest, or name, with a live count for each status. Moderators can select several submissions at once to publish, send back, or remove them together, and every row now shows how long a listing has been waiting so nothing sits forgotten. Sending a listing back or removing it can carry a short reason for the record, and opening a listing's preview now shows its full moderation history alongside any question-and-answer thread with the person who submitted it. An empty queue finally looks like good news, with its own illustration instead of a blank space.",

  "changelog.entries.magazine-slide-decks.title":
    "Interactive slide-deck stories, now in the magazine",
  "changelog.entries.magazine-slide-decks.body":
    "Some magazine stories can now be read as a slide deck: full-screen slides you tap through like a presentation, mixing text, full-bleed photos, big animated numbers, before-and-after image sliders and moments you tap to reveal. Open “Present” for a distraction-free, full-screen read. Look for the “Interactive” tag on the magazine's front page — the first one, “Ten years in Mouraria,” is live now.",

  "changelog.entries.real-notification-settings.title":
    "Notification settings that actually do something",
  "changelog.entries.real-notification-settings.body":
    "The toggles in Settings → Notifications used to be for show — flipping them changed nothing. Now they're real: turn gathering invites, RSVP reminders, new-message alerts, connection requests and thread replies on or off per type, and your choice is saved and respected everywhere, including phone push. Safety and account messages (moderation, appeals, account changes) always come through and aren't hidden behind a toggle. A few rows with no feature behind them yet are still honestly marked “coming soon” rather than pretending to work.",
  "changelog.entries.platform-wide-search.title":
    "Search now covers the whole platform",
  "changelog.entries.platform-wide-search.body":
    "Global search reached only members, communities, events, forum threads and businesses. It now spans magazine articles, jobs, housing listings, resources, workshops and subprofiles too — so one search finds the thing you're looking for wherever it lives, in both English and Portuguese.",
  "changelog.entries.save-events-communities.title":
    "Save events and communities — and saves that really stick",
  "changelog.entries.save-events-communities.body":
    "You can now save a gathering or a community to your collection with the same bookmark you already use elsewhere. We also fixed two Save buttons — on a job's detail page and on short films — that looked like they worked but forgot everything the moment you left. Every save now persists to your collection.",
  "changelog.entries.invite-revoke-oversight.title":
    "Take back an invite you've sent",
  "changelog.entries.invite-revoke-oversight.body":
    "Changed your mind about an invitation? You can now revoke a pending invite from your sent list and the link stops working immediately. Admins also get a new platform-wide Invites view to see every invitation and its status, filterable at a glance.",
  "changelog.entries.moderation-completeness.title":
    "A more complete moderation toolkit",
  "changelog.entries.moderation-completeness.body":
    "Moderators can now take down a member's profile and individual business reviews, not just posts and listings — a removed profile or review stops showing to everyone else (and a removed review stops counting toward a place's rating). Moderators can also lift a suspension and reinstate a member directly, instead of only through the appeal flow.",
  "changelog.entries.account-media-safety.title":
    "Safer handles, cleaner storage",
  "changelog.entries.account-media-safety.body":
    "A few quiet safety improvements. When you change your username, the old one is now held for you for 30 days before anyone else can take it, so a freed handle can't be instantly grabbed and old @mentions can't be quietly redirected to a stranger. Photos you replace — avatars, listing pictures, post images — are now deleted from storage instead of lingering, a suspended member's images stop being served to others, and finishing onboarding records your agreement to the community guidelines.",
  "changelog.entries.legal-notice-imprint.title":
    "A legal notice (imprint) page",
  "changelog.entries.legal-notice-imprint.body":
    "Added a Legal Notice page under Policies, linked from the footer, setting out who operates QueerPulse and how to reach us — the kind of imprint that's expected of a service operating in Europe.",
  "changelog.entries.messages-list-virtualization.title":
    "Long chats now scroll smoothly, however big they get",
  "changelog.entries.messages-list-virtualization.body":
    "A very long or very active conversation used to keep every message it had ever loaded sitting in the page at once, which could make scrolling feel heavy the longer a chat went on. Messages now render only the ones actually near your screen, so a thread with thousands of messages feels just as light as a brand-new one — loading older history, jumping to a reply, and scrolling to the latest message all still land exactly where you'd expect.",
  "changelog.entries.live-mode-honesty-sweep.title":
    "No more placeholder people, fake confirmations or dead-end buttons",
  "changelog.entries.live-mode-honesty-sweep.body":
    "A platform-wide honesty pass so nothing you see is invented and nothing you tap pretends to work. Prototype pages that hadn't been wired up yet — parts of the homepage, the magazine, the therapist and clinic directories, skill-swaps, the incubator and gatherings tools — now show a clear “coming soon” instead of made-up members, events, “verified” providers or statistics. Forms that had no home yet (contact, newsletter, cookie preferences, micro-grant and panel applications, safe-space vouches, perk claims, and admin actions like publish/export) no longer flash a false “done”: they either save for real or tell you honestly they're not open yet, and cookie choices now actually stick. Health and legal directories in particular will never show an unverified provider as if we'd vetted them.",
  "changelog.entries.frontend-reliability-hardening.title":
    "Fewer lost drafts, honest error states and safer shared devices",
  "changelog.entries.frontend-reliability-hardening.body":
    "A correctness pass across the app so nothing quietly loses your work or misleads you. Leaving a half-finished gathering, community or profile edit now warns you before your changes disappear, and Settings no longer discards edits when you navigate away. When something goes wrong, you see an honest message with a retry instead of an eternal loading state or a false “done”, and a passing wobble in your connection no longer nags you with an error toast for data you're already looking at. On a shared device your saved items, drafts and vouches are now kept separate per account and cleared when you sign out, so the next person never sees your things; and the “Follow a writer” button only appears where following actually works. Under the hood the app also recovers gracefully from a bad response or an out-of-date tab instead of showing a crash screen.",
  "changelog.entries.screen-help-signs.title":
    "“About this screen” help on every feature",
  "changelog.entries.screen-help-signs.body":
    "New to a part of QueerPulse? Look for the small ⓘ info button next to a screen's title. Tap it and a short, friendly card explains what the screen is for, how to use it, and gives one concrete example — so you always have a sense of how each feature fits into the platform. It's there across the main screens (Members, Communities, Forum, Events, Messages, the local directory, housing, work, culture, settings and more), in both English and Portuguese, and it never gets in the way — open it when you want it, ignore it when you don't.",
  "changelog.entries.performance-cost-hardening.title":
    "Faster search, lighter uploads and steadier busy pages",
  "changelog.entries.performance-cost-hardening.body":
    "A behind-the-scenes pass to keep QueerPulse quick and affordable as it fills up. Global search now uses proper text indexes, so finding people, communities, events, listings and threads stays fast no matter how many members join instead of slowing down as the platform grows. Photos you upload are gently resized before they leave your device, so posting is quicker on mobile data and pages load lighter for everyone. Busy community threads, member rosters and event guest lists now load in tidy pages with a \"load more\" button rather than pulling in everything at once, and popular pages the whole community shares can now be served from the cache instead of rebuilt every time. Event reminders and push notifications go out in a single efficient batch, images at the top of a page load first for a snappier first paint, and switching pages mid-load no longer wastes a request. Long lists — the local directory and busy forum threads — now reveal more as you scroll instead of rendering everything at once, so they stay smooth on a phone. Nothing you see changes — it just holds up better under a crowd.",
  "changelog.entries.accessibility-i18n-pwa-hardening.title":
    "Accessibility, translation and offline polish",
  "changelog.entries.accessibility-i18n-pwa-hardening.body":
    "A sweep to make QueerPulse work for more people, in more places. Every form field now announces its label to screen readers, so signing up, posting a job, checking out or editing your profile all read cleanly with assistive tech. Sharing a link finally shows a preview image instead of a broken thumbnail. Lose your connection and you get a real offline page — not the browser's error — and the app installs lighter and updates with a pill that waits for you instead of a toast that vanishes. Toasts can now be dismissed and pause while you read them; removing someone from a group asks first; buttons are a little bigger to tap; and message timestamps plus a few stray labels now follow the language you chose, in both English and Portuguese.",
  "changelog.entries.launch-hardening-p1.title":
    "Safety, honesty and reliability hardening",
  "changelog.entries.launch-hardening-p1.body":
    "A broad pre-launch pass. Blocking someone now truly stops them everywhere — no more DMs, presence, typing or push slipping through, and your profile is hidden from anyone you've blocked. Live mode tells the truth: pages that used to show placeholder people or fake a submission now either use real data or say plainly when something isn't ready yet, and requesting your data (GDPR) is a real request. Editing, cancelling or RSVPing to a gathering, and leaving a community, now refresh the screen straight away; an outage shows a retry instead of an empty page. And where we can't yet email you, we no longer pretend we will.",
  "changelog.entries.remove-listings-from-moderation.title":
    "Moderators can remove directory listings",
  "changelog.entries.remove-listings-from-moderation.body":
    "The listings review queue now has a Remove action, so a moderator can permanently delete a spam, duplicate or inappropriate submission instead of only sending it back to review. Removing a live listing also takes it off the public directory. Every removal asks for confirmation first.",

  "changelog.entries.sent-invites-status-filter.title":
    "Filter the invites you've sent by status",
  "changelog.entries.sent-invites-status-filter.body":
    "The list of invites you've already sent now has tabs — All, Pending, Accepted, Expired — each showing a count, so you can jump straight to the ones still waiting for a reply or the ones that landed. Each invite also shows the exact day and time it was sent and when it expires, instead of just the date.",

  "changelog.entries.onboarding-one-time-guard.title":
    "Finishing onboarding now sticks",
  "changelog.entries.onboarding-one-time-guard.body":
    "The welcome flow you go through right after joining is meant to happen once. If your browser later autofilled the saved onboarding address, though, it would drop you straight back into the wizard as if you'd never done it — and clicking through could quietly reset choices like your “Here for” intents. We now record when you finish onboarding and send you on to your feed if you land back on it, so it can't replay or overwrite what you already set.",

  "changelog.entries.trust-network-replay-by-joins.title":
    "Trust-network replay now follows the people, not the calendar",
  "changelog.entries.trust-network-replay-by-joins.body":
    "In the admin trust network, the “Replay” of how vouches formed over time used to advance one calendar month at a time — so it crawled through quiet months where nothing happened and flashed past the busy ones. It now steps through the moments people were actually vouched for, giving each real event equal time. The result tracks how the community grew instead of the passage of the calendar. Dragging the timeline slider by hand works exactly as before.",
  "changelog.entries.trust-network-invite-vs-vouch.title":
    "See who was invited vs vouched for",
  "changelog.entries.trust-network-invite-vs-vouch.body":
    "The admin trust network now shows invite connections — people you brought onto QueerPulse yourself — in a distinct colour from vouches added later, with a legend and hover labels so the two are easy to tell apart at a glance.",
  "changelog.entries.chef-mixologist-therapist-personas.title":
    "Three new persona types: chef, mixologist and therapist",
  "changelog.entries.chef-mixologist-therapist-personas.body":
    "You can now build a subprofile as a chef (menus + residencies), a mixologist (cocktails + residencies) or a therapist (specialisms + credentials) — each with its own sections, starter template and directory filter, alongside the crafts already there.",
  "changelog.entries.connections-card-polish.title":
    "Tidier connection cards",
  "changelog.entries.connections-card-polish.body":
    "On your connections page, the “mutuals” line now renders properly instead of showing raw formatting, and the “Connected” date shows the day and time you connected — not just the month and year.",
  "changelog.entries.lightbox-focus-a11y.title":
    "Cleaner focus handling in the photo viewer",
  "changelog.entries.lightbox-focus-a11y.body":
    "Opening a photo full-screen — in the directory galleries and on gathering pages — no longer leaves keyboard focus stranded on the invisible tap-to-close layer behind the image. Focus now stays where you can see it, which keeps screen readers and keyboard navigation working smoothly while you flip through photos.",
  "changelog.entries.directory-detail-polish.title":
    "A redesigned, more accurate place page",
  "changelog.entries.directory-detail-polish.body":
    "Directory listings were rebuilt around a clearer layout: the place introduces itself first — name, category, and its key details in one row — then a compact photo gallery (a main shot with the rest in a clickable column) instead of one oversized banner, with the main actions sitting right beside the name. New venues now read as “New” rather than a hollow zero-star rating. Alongside the redesign: “Open now” is worked out on the venue's own clock (not your device's timezone), the location line and search data no longer assume every place is in Lisbon, website links always open correctly and show a tidy domain, and star ratings read properly to screen readers. Signed-out visitors can now save a place, people who run a venue can claim its listing, and a mistyped or removed listing shows a real “not found” page instead of quietly bouncing you back to the directory.",
  "changelog.entries.review-author-avatars.title":
    "See who left a review",
  "changelog.entries.review-author-avatars.body":
    "Reviews on a space's directory page now show the reviewer's photo, and their name links straight to their profile — so a warm note from someone in the community is one tap away from finding out more about them. Reviews from non-members still read exactly as before, just without the link.",
  "changelog.entries.verification-in-context.title":
    "How verification works now lives where you're browsing",
  "changelog.entries.verification-in-context.body":
    "“How verification works” is no longer a link buried in the top navigation. Instead there's a short explainer right on the local directory — nominated, reviewed, re-checked every year — and a quiet line inside each verified listing that points to the full story. The safe-spaces hub is still there for the complete criteria and delisting record; it's just reached in context now, when the badge is actually in front of you.",
  "changelog.entries.directory-collapsible-filters.title":
    "Tidier filters on the spaces directory",
  "changelog.entries.directory-collapsible-filters.body":
    "Search and the category chips stay front and centre, while the safe-spaces and vibe refinements now tuck behind a single “Refine” toggle so the bar no longer crowds the page. A count on the toggle still tells you when hidden filters are active, your choices stay applied, and the drawer glides open and closed instead of snapping — with your open/closed preference remembered next time.",
  "changelog.entries.safe-spaces-in-directory.title":
    "Verified safe spaces now live in the directory",
  "changelog.entries.safe-spaces-in-directory.body":
    "The verified badge now shows right on the card in the local directory, a “Verified safe spaces” filter narrows the list to just the ones that earned it, and verified listings rank first. Open any listing to see the full trust block — what verification means for that space and when it was last reviewed. And /local/safe-spaces is now the verification hub: what the badge means, how the review process actually works, and an honest, public record of every space that's lost it.",

  "changelog.entries.magazine-desk-polish-sweep.title":
    "Polish across the magazine desk",
  "changelog.entries.magazine-desk-polish-sweep.body":
    "Consistent heading colours in dark mode, linked-deck editing from the desk, per-assignment byline control for writers, and assorted cleanups.",

  "changelog.entries.magazine-piece-messaging.title":
    "Editors and writers can now message each other on the piece",
  "changelog.entries.magazine-piece-messaging.body":
    "Editors and writers now message each other on the piece itself — chases and questions live beside the work, not in email, and both sides always see the whole thread.",

  "changelog.entries.live-press-kit-real-data.title":
    "The press kit now shows real coverage, contacts and figures",
  "changelog.entries.live-press-kit-real-data.body":
    "The press kit's coverage and press-desk contacts now come from what the team actually publishes and keeps up to date, and the headline figures are drawn from the platform itself — no invented numbers. Each section simply stays hidden until there's something real to show.",
  "changelog.entries.communities-and-home-merged.title":
    "Communities, all in one place",
  "changelog.entries.communities-and-home-merged.body":
    "Your community hub and the discovery directory now live on a single /communities page, with a My communities / Discover switch up top. It opens on your hub when you belong to a community, and on Discover when you don't.",

  "changelog.entries.silent-session-recovery.title":
    "No more “session expired” flash when you come back",
  "changelog.entries.silent-session-recovery.body":
    "Returning after a while away, you might have seen a “session expired” error pop up for a moment — and then get signed right back in anyway. That message was misfiring on a session the app was already quietly renewing. Now, when we can restore your session on our own, we do it silently: no error, nothing to read, you just pick up where you left off. You'll only ever be told your session ended when it actually has and you need to sign in again.",

  "changelog.entries.session-refresh-csrf-race.title":
    "Smoother session refresh after a token expires",
  "changelog.entries.session-refresh-csrf-race.body":
    "When your session had quietly expired, refreshing the page could briefly flash a “session expired” state before signing you right back in. We fixed a race in how the app renews your session, so it renews cleanly on the first try — no flicker, no wasted request.",

  "changelog.entries.directory-category-unify.title":
    "Directory categories that match everywhere",
  "changelog.entries.directory-category-unify.body":
    "A place you add now shows the right coloured pin on the map and the right category on its card and filter — the “list a business” wizard and the directory finally speak the same category language. Nightlife is now a category you can pick when listing, too.",

  "changelog.entries.messages-badge-count.title":
    "A faster, accurate unread-messages badge",
  "changelog.entries.messages-badge-count.body":
    "The unread count on your messages icon now stays right on every page without quietly loading your whole inbox in the background each time you navigate. It updates live as messages arrive and as you read them.",

  "changelog.entries.notifications-coverage.title":
    "Notifications for the things that were quietly slipping by",
  "changelog.entries.notifications-coverage.body":
    "Your bell now tells you when someone RSVPs to your gathering, replies to your post or thread, asks to join your community (and when a request is decided), applies to your job, reviews your business, when a business listing is approved, when someone you invited joins, when a report or appeal you filed is resolved, and when an idea you shared on the roadmap changes status. Each one links straight to what it's about.",

  "changelog.entries.members-collapsible-filters.title":
    "Collapsible filters on the members directory",
  "changelog.entries.members-collapsible-filters.body":
    "The members directory filters are now tidy collapsible sections with a show/hide toggle, so you can clear space for results — your selections stay applied while filters are hidden, and your view is remembered next time. Opening a section and hiding the whole sidebar now glide smoothly instead of snapping.",
  "changelog.entries.activism-volunteer-merge.title":
    "Activism and Volunteering are now one place",
  "changelog.entries.activism-volunteer-merge.body":
    "We merged the Activism and Volunteer pages into a single home. Volunteering is now the front door — browse real opportunities in Lisbon, filter by cause or commitment, and start with a couple of free hours. If you want to go deeper, our guide to organising better is one tap away from there. The nav, footer, and sidebar now carry a single “Activism & Volunteering” link instead of two, and the old /activism address still works.",
  "changelog.entries.spaces-map-pins.title":
    "Map pins now show what kind of space each place is",
  "changelog.entries.spaces-map-pins.body":
    "On the Local directory map, every pin is now a coloured teardrop with an icon for its category — a martini glass for nightlife, a fork and knife for food, a heart for health, and so on — so you can read the map at a glance instead of tapping each dot. The category filter chips carry the same colour and icon, so the filter bar doubles as a legend.",
  "changelog.entries.creatives-subprofile.title":
    "The Creatives showcase is now a creative subprofile",
  "changelog.entries.creatives-subprofile.body":
    "The standalone Creatives directory has been retired. Showing your art, music, or other creative work now lives with subprofiles — the same place you build any linked persona — so a creative profile is part of who you are on QueerPulse rather than a separate list. The old /magazine/creatives link now takes you straight to your subprofiles, where you can add a creative one.",
  "changelog.entries.moderation-takedowns.title":
    "Moderator hide and remove now actually take content down",
  "changelog.entries.moderation-takedowns.body":
    "When a moderator hides or removes reported content, it now really disappears from public view. Hidden content is withheld from members while staff can still see it; removed content shows a clear \"removed by a moderator\" tombstone where a deleted post already would. Applied across forum posts and replies, community posts and replies, communities, events, and business listings — recorded in the same step as the moderator's decision so it can never be logged without taking effect.",
  "changelog.entries.gathering-create-fix.title":
    "Creating a gathering works again — and lands on your event",
  "changelog.entries.gathering-create-fix.body":
    "Publishing a new gathering was quietly failing on the server, yet the wizard still showed the celebration screen as if it had worked — and its \"See your event\" button opened a stray sample page. Both are fixed: a gathering now actually publishes, the success screen only appears once it has, and \"See your event\" takes you straight to your real gathering. If a publish ever fails, you'll see a clear message and stay on the review step to try again. The wizard now also asks for a date and start time in the future before you can move on, so a gathering can't be created without one.",
  "changelog.entries.directory-photos-crisp.body":
    "Cover photos on business listings — and the preview while you're adding one — were loading at a low resolution and looking blurry when shown large. They now load crisp at full size. We also nudged the listing header down so the breadcrumb and the owner's Edit button no longer tuck under the floating navigation.",
  "changelog.entries.admin-role-management.title":
    "Admins can promote moderators and admins from the dashboard",
  "changelog.entries.admin-role-management.body":
    "Making someone a moderator or admin used to mean editing the database by hand. Now an admin can grant or revoke those roles right from a member's detail in the admin dashboard — with the guardrails that matter built in: you can't change your own role, the house account is off-limits, and the platform will never let you remove its last admin. Every change is written to the audit log.",
  "changelog.entries.appeal-submission.title":
    "You can now appeal a moderation decision",
  "changelog.entries.appeal-submission.body":
    "A suspended or banned account was able to read about appeals but had no way to file one. Now a member under any moderation decision — a warning, a removal, a suspension, a ban — can submit an appeal directly from their account screen, and it goes straight to a moderator who wasn't involved in the original call. One open appeal at a time; the original decision stands while it's reviewed.",
  "changelog.entries.honest-report-failures.title":
    "Safety reports tell you the truth when they don't send",
  "changelog.entries.honest-report-failures.body":
    "When a report, flag, or safe-space concern can't reach us — a dropped connection, a server hiccup — you now see an honest error and your words stay in the form to try again, instead of a false \"received\". If we say a report landed, it landed. This also covers messaging a housing lister and listing a space.",
  "changelog.entries.directory-filters-and-accurate-recognition.title":
    "Member filters that actually filter, and honest badges & perks",
  "changelog.entries.directory-filters-and-accurate-recognition.body":
    "Picking a filter in the member directory now returns the people who match instead of emptying the page. Your Badges and Perks pages also show a proper loading, empty, or try-again state while your recognition loads — no more placeholder counts standing in for the real thing.",
  "changelog.entries.navigation-resilience.title":
    "Back keeps your place, and the app rides out updates",
  "changelog.entries.navigation-resilience.body":
    "Hitting back after opening something from a list now drops you exactly where you were scrolled to, instead of jumping to the top. If your session quietly expires we tell you so you can sign back in, and when a new version ships mid-visit the app quietly refreshes itself instead of showing an error.",
  "changelog.entries.search-page-launcher.title":
    "Jump anywhere from search",
  "changelog.entries.search-page-launcher.body":
    "Search (⌘K and the search page) now doubles as a launcher: start typing — or just open it — to jump straight to Members, Communities, Events, Messages, your profile, Settings, the Magazine and more, each with its own icon. A new Pages tab lists every destination in one place.",
  "changelog.entries.donate-honest-live.title":
    "Donations are honest about being pre-launch",
  "changelog.entries.donate-honest-live.body":
    "The donate flow no longer collects card details for a payment that couldn't actually be taken. Until secure payments are wired up, it says so plainly and points to exactly where community money goes.",
  "changelog.entries.gathering-manage-coming-soon.title":
    "Host dashboard is an honest preview",
  "changelog.entries.gathering-manage-coming-soon.body":
    "The gathering host dashboard was a demo prototype, so in live mode it now shows a clear “coming soon” instead of acting on placeholder data. Browsing and RSVPs are fully live; explore the host tools in demo mode.",
  "changelog.entries.search-member-avatars.title":
    "See who you're searching for",
  "changelog.entries.search-member-avatars.body":
    "Member results in search (⌘K and the search page) now show each person's profile photo instead of a generic icon — so you can recognise the face you're looking for at a glance.",
  "changelog.entries.search-real-topics.title":
    "Search now shows real results",
  "changelog.entries.search-real-topics.body":
    "Search (⌘K and the search page) no longer falls back to sample topics with made-up post counts. It now pulls the real trending topics and live post counts, alongside real people, communities, events, forum threads, and businesses.",
  "changelog.entries.global-search.title": "Search across QueerPulse",
  "changelog.entries.global-search.body":
    "Search across people, communities, events, the forum, and local businesses — from anywhere with ⌘K or the search page.",
  "changelog.entries.studio-coming-soon.title":
    "Studio is now an honest preview",
  "changelog.entries.studio-coming-soon.body":
    "The co-op music Studio is still in the workshop, so it no longer shows placeholder payouts and figures as if they were real. Explore it fully in demo mode; live visitors now get a clear “coming soon” instead.",
  "changelog.entries.cinema-honest-live.title":
    "Cinema is honest about what's live",
  "changelog.entries.cinema-honest-live.body":
    "The film catalogue and playback are real, so the parts still in production — collections, filmmaker profiles, open calls — now say “coming soon” in live instead of showing placeholder content. Explore it all in demo mode.",
  "changelog.entries.cinema-live-streaming.title":
    "Cinema now streams real films",
  "changelog.entries.cinema-live-streaming.body":
    "Cinema is live: browse the real programme and press play to stream the film, and it resumes right where you left off next time you come back.",
  "changelog.entries.employer-reviews-live.title":
    "Employer reviews, for real",
  "changelog.entries.employer-reviews-live.body":
    "The employer reviews page now shows real queer-inclusive employers — open any company for its full profile and reviews, and write your own anonymous review of a place you've worked.",
  "changelog.entries.block-mute-from-profile.title":
    "Block or mute straight from a profile",
  "changelog.entries.block-mute-from-profile.body":
    "A new safety menu in the profile header lets you mute someone (quietly hiding their posts) instantly, or block them after a quick confirm — with the option to also report them at the same time.",
  "changelog.entries.event-push-reminders.title":
    "Set when your event reminders arrive",
  "changelog.entries.event-push-reminders.body":
    "Event preferences now let you choose how far ahead you're reminded — an hour, a day, or a week before — and turn on a phone push so the reminder reaches you wherever you are.",
  "changelog.entries.report-more-surfaces.title":
    "Report anything that doesn't feel right",
  "changelog.entries.report-more-surfaces.body":
    "You can now report an event, a business, a company, a job posting, or a member's public persona — a discreet “Report” link opens the same confidential flow used everywhere else, and events are now actually filed to the safety team instead of just acknowledged.",
  "changelog.entries.profile-photo-pronouns.title":
    "Your face, your words",
  "changelog.entries.profile-photo-pronouns.body":
    "Edit Profile now lets you upload a custom photo — with an instant preview — instead of only using your Google picture, and you can write in your own pronouns alongside the presets. We also cleared out the “coming soon” placeholders that couldn't do anything yet.",
  "changelog.entries.mobile-form-keyboard.title":
    "Forms stay above the keyboard on phones",
  "changelog.entries.mobile-form-keyboard.body":
    "On iOS, opening the keyboard inside an enquiry or sign-up dialog no longer hides the submit button behind it — the sheet lifts to stay in view. We also added long-press app shortcuts to the installed icon and tidied up tooltips for touch.",

  "changelog.entries.magazine-real-content.title":
    "The magazine shows real issues, always",
  "changelog.entries.magazine-real-content.body":
    "The magazine archive and writer pages now load real editions with a proper loading and error state — so you'll never see placeholder prototype content if something is slow or goes wrong.",

  "changelog.entries.community-roadmap.title":
    "The roadmap is now yours to shape",
  "changelog.entries.community-roadmap.body":
    "See what's shipped, what's building, and what's planned — then vote for what matters most to you, or submit an idea of your own. We read every suggestion; the team curates what moves onto the roadmap.",

  "changelog.entries.listing-photos.title": "Photos on your business listing",
  "changelog.entries.listing-photos.body":
    "The list-a-business form now takes photos — upload a file or paste an image URL, and see a live preview of how your listing will look before you publish.",

  "changelog.entries.business-page-live.title": "Business pages come to life",
  "changelog.entries.business-page-live.body":
    "Every business page now shows the venue's real photos in a gallery you can open full-screen, plus its real opening hours with a live “Open now / Closed” status — so you know what a place looks like and whether it's open before you go.",

  "changelog.entries.business-actions.title":
    "Save, share, and get directions",
  "changelog.entries.business-actions.body":
    "Every business page now has an action bar — get directions, call, share, or save a place to your list in one tap. Saved spots show how many members have saved them too, a quiet trust signal, not a leaderboard.",

  "changelog.entries.business-reviews-trust.title": "Reviews that go both ways",
  "changelog.entries.business-reviews-trust.body":
    "Business owners can now reply to reviews, and every page shows a star-rating breakdown so you can see the full picture, not just the average. If something's off, you can report a listing or suggest an edit — both go straight to our moderators.",

  "changelog.entries.business-discovery.title":
    "Find your way around the directory",
  "changelog.entries.business-discovery.body":
    "Business pages now show related places nearby, a clear path back to the directory, and the languages spoken on-site. Upcoming events link straight to their event page, where you can add them to your calendar.",

  "changelog.entries.directory-filters-upgrade.title":
    "The business directory got a lot easier to filter",
  "changelog.entries.directory-filters-upgrade.body":
    "Finding a place is smoother now. Search looks inside descriptions and tags, not just names; each category shows a live count; you can sort A–Z or by neighbourhood; and your filters live in the link, so a filtered directory is shareable and survives a refresh. Picking a vibe no longer makes every business disappear, active filters show as removable chips with a Clear-all, empty results explain themselves, and the map is easier to use on a phone.",
  "changelog.entries.public-profile-badge.title":
    "\"Go public\" now lives on your profile",
  "changelog.entries.public-profile-badge.body":
    "Your public-profile control moved into a quiet badge next to your name — tap it to see how public profiles unlock, or to switch yours on once you're eligible. It only ever shows on your own profile.",

  "changelog.entries.here-for-hero.title": "\"Here for\" now leads your profile",
  "changelog.entries.here-for-hero.body":
    "Your \"Here for\" intent — what you're looking for on QueerPulse — now sits right at the top of your profile, next to your name and bio, instead of further down the page. Easier to spot at a glance, and just as easy to keep private if that's how you like it.",

  "changelog.entries.directory-view-switcher.title": "A clearer List / Map switch",
  "changelog.entries.directory-view-switcher.body":
    "Switching between the list and the map on the business directory is easier to spot now. The two buttons became a single labelled toggle with icons, sitting beside the results count — so it clearly reads as \"pick a view\" rather than another filter, and it stays compact and tappable on a phone.",

  "changelog.entries.profile-links-fix.title": "Profile links that behave",
  "changelog.entries.profile-links-fix.body":
    "Adding social links to your profile is smoother now. A plain username like your Instagram handle is accepted as-is — no more \"that doesn't look like a valid link\" warning when it clearly is — and the rows no longer break apart when a hint appears; the field stays put and the hint sits neatly below it.",

  "changelog.entries.subprofiles-showcase.title": "A richer \"Also working as\"",
  "changelog.entries.subprofiles-showcase.body":
    "Your other professional sides now show off more of who you are — featured work, links, availability, and follower and endorsement counts, right on the card. On mobile it's a one-tap view built for a smaller screen, and if you own the personas you get visibility badges and a quick way to edit right from the showcase.",

  "changelog.entries.real-directory-map.title": "A real map on every directory listing",
  "changelog.entries.real-directory-map.body":
    "Open a business or space in the directory and its location now shows on a real, interactive map — the same warm Lisbon map you already know from the map view and from listing a business — pinned to the exact spot the owner placed. The old decorative placeholder is gone.",

  "changelog.entries.reply-threads.title": "Reply to any comment in the forum",
  "changelog.entries.reply-threads.body":
    "Replies can now have their own replies. Answer directly under any comment and yours nests right there, so long conversations branch out instead of piling into one flat list. Deep threads collapse into a single line — tap to expand when you want the rest.",

  "changelog.entries.copy-subprofile.title": "Copy an existing persona",
  "changelog.entries.copy-subprofile.body":
    "Starting a new subprofile? Copy one you already have — bring over everything, or just the content — and tweak from there.",

  "changelog.entries.smoother-chat.title": "Smoother, more responsive chat",
  "changelog.entries.smoother-chat.body":
    "Messages now feel faster and calmer on every device. Typing no longer stutters the conversation, swipe-to-reply glides under your finger, and new messages settle into place instead of the whole thread animating at once. On phones, holding a message opens the actions cleanly (no more fighting the text-selection popup), the chat fills the screen as one surface without the page bouncing behind it, and taps give instant feedback with a gentle buzz on long-press.",

  "changelog.entries.invite-state-page.title": "A clearer invite link page",
  "changelog.entries.invite-state-page.body":
    "When an invite link can't be used, the page now shows the real invite — who vouched for you and when it lapsed — instead of a generic message. It also tells apart an invite that timed out, one that was already used, and one that was withdrawn, and points you to the right next step for each.",

  "changelog.entries.chat-shortcuts.title": "Mention shortcuts in chat",
  "changelog.entries.chat-shortcuts.body":
    "A new “?” button in the message composer shows every mention shortcut at a glance — @ for a member, c/ for a community, # for a topic, b/ for a business, e/ for an event, t/ for a thread. Tap one and it drops the sigil straight into your message so the suggestions open as you type. And to keep things tidy, only one composer popover is ever open at a time.",

  "changelog.entries.events-hub.title": "One home for events",
  "changelog.entries.events-hub.body":
    "Events, Gatherings, and Calendar are now a single Events Hub — Highlights, Browse, and a full calendar together, with real photos for what's coming up. Same events, easier to find.",

  "changelog.entries.gifs-in-chat.title": "Send GIFs in chat",
  "changelog.entries.gifs-in-chat.body":
    "Say it with a GIF. There's a new GIF button in the message composer — search or browse what's trending, tap one, and it sends straight into your chat (in DMs and group chats alike). Powered by KLIPY, with safe-content filtering on by default.",

  "changelog.entries.privacy-and-speed.title":
    "Stronger privacy and a snappier app",
  "changelog.entries.privacy-and-speed.body":
    "A round of privacy, speed and messaging polish. Personas and subprofiles you've set to private now stay fully private, and people you've blocked no longer turn up in the flatmate directory. Editing or deleting a message updates right away, with no reload flicker. And the app itself is lighter, so pages — and the images that greet you at the top — load a little quicker.",

  "changelog.entries.leaner-prerendering.title":
    "Leaner, faster site builds",
  "changelog.entries.leaner-prerendering.body":
    "Behind the scenes: we now pre-build only the essential public page for search engines instead of the whole site, and we no longer bake a separate copy of every profile. Builds use less data and stay quick, and search engines still find every public page through the sitemap. Nothing to do on your end.",

  "changelog.entries.admin-governance-real-data.title":
    "Governance dashboards now run on real data",
  "changelog.entries.admin-governance-real-data.body":
    "The admin governance area — its finance figures and quarter-by-quarter chart, the policy decision log, and the moderation audit trail — now reads live from the platform instead of placeholder numbers, so the team sees the community's real finances and moderation history.",

  "changelog.entries.sign-in-fix.title": "Signing in works again",
  "changelog.entries.sign-in-fix.body":
    "A mismatch between the app and the server was stopping sign-in from completing. That's fixed — logging in, signing out, and staying signed in all work smoothly again.",
  "changelog.entries.accessibility-mobile-polish.title":
    "Easier to tap, easier to navigate",
  "changelog.entries.accessibility-mobile-polish.body":
    "Small buttons now have bigger touch areas on phones, actions that used to appear only on hover can be reached with the keyboard, and checkout and application forms support autofill for your name and email.",
  "changelog.entries.platform-hardening.title": "Under-the-hood hardening",
  "changelog.entries.platform-hardening.body":
    "Behind the scenes: the API is now versioned with published documentation, long lists are safely bounded so pages stay fast, and reporting has spam protection. Nothing to do on your end — things just stay quick and stable.",
  "changelog.entries.composer-reaction-polish.title":
    "A roomier message box and tidier reactions",
  "changelog.entries.composer-reaction-polish.body":
    "The message box now stretches to fill the width of the composer, and on phones it sits flush without a stray scrollbar when your message is short — growing only as you type. Reactions also behave properly now: tapping an emoji you've already reacted with removes it instead of stacking the same one over and over.",
  "changelog.entries.chat-mentions.title": "Mention people and places in chat",
  "changelog.entries.chat-mentions.body":
    "Type @ for a member, or c/ b/ e/ t/ # for a community, business, gathering, thread or topic — pick from the suggestions and it turns into a tappable link, in a direct message or a group. Works while you're writing and while you're editing a message. Your chats stay private: mentions only link, they never notify anyone.",
  "changelog.entries.group-chats.title": "Group chats",
  "changelog.entries.group-chats.body":
    "Start a group with the people you want in it, name it, and share who's who. Admins can add or remove members and tidy up the group info, you can see who's read a message, and a typing bubble shows when someone's writing.",
  "changelog.entries.message-search.title": "Search your messages",
  "changelog.entries.message-search.body":
    "Looking for that address, that date, that thing someone said? Search across all your conversations and jump straight to it.",
  "changelog.entries.link-previews.title": "Links open up",
  "changelog.entries.link-previews.body":
    "Share a link and it unfurls into a preview card — title, image and all — so people can see where it goes before they tap.",
  "changelog.entries.forward-pin-star.title": "Forward, pin and star",
  "changelog.entries.forward-pin-star.body":
    "Pass a message along to another chat, pin the ones a group keeps coming back to, and star the ones you want to find again — starred messages stay just for you.",
  "changelog.entries.safe-space-view-page.title":
    "Preview safe spaces before verifying",
  "changelog.entries.safe-space-view-page.body":
    "The Safe spaces review tool now has a “View page” button on each listing, opening its public page in a new tab so moderators can see a space in full before marking it verified.",
  "changelog.entries.swipe-members-highlight.title":
    "Swipe through featured members",
  "changelog.entries.swipe-members-highlight.body":
    "On the homepage, the featured member card now follows your finger — swipe left or right on your phone to move between members, and it snaps to the next one.",
  "changelog.entries.mention-names.title": "Mentions show real names",
  "changelog.entries.mention-names.body":
    "Mention a person, community or place in a chat, forum thread or community discussion and it now reads as their name — Tiago Costa, not @tiago-costa. Tap it and you still land in the right place; hover to see the handle.",
  "changelog.entries.forward-to-groups.title": "Forward messages to your groups",
  "changelog.entries.forward-to-groups.body":
    "Forwarding now reaches your group chats, not just one-to-one messages. Long-press any message, pick Forward, and choose any group you're part of.",
  "changelog.entries.read-receipts.title": "Delivered and read receipts",
  "changelog.entries.read-receipts.body":
    "Ticks now tell the whole story: sent, delivered to their phone, and read — so you know where your message got to.",
  "changelog.entries.message-gestures.title": "Swipe to reply, tap to react",
  "changelog.entries.message-gestures.body":
    "Swipe a message sideways to reply to it, and double-tap to react — the quick gestures your thumbs already know.",
  "changelog.entries.message-drafts.title": "Your drafts wait for you",
  "changelog.entries.message-drafts.body":
    "Half a message you didn't send yet? We keep it saved for that conversation, so it's still there when you come back.",
  "changelog.entries.offline-outbox.title": "Sends that don't get lost",
  "changelog.entries.offline-outbox.body":
    "Tapped send with no signal? Your message waits in line and goes out the moment you're back online — nothing vanishes on the way.",
  "changelog.entries.typing-indicator.title": "Typing bubble and screen-reader polish",
  "changelog.entries.typing-indicator.body":
    "A gentle bubble shows when the other person is writing, and a round of screen-reader work makes the whole chat easier to follow without looking.",
  "changelog.entries.moderation-actions.title":
    "Every report gets a real decision",
  "changelog.entries.moderation-actions.body":
    "Opening a report in the moderation queue now always shows the full set of actions — hide, warn, restrict, remove and more, each with a reason the member reads — instead of quietly closing it. The queue's headline also reflects the real number of reports waiting.",
  "changelog.entries.listing-preview-and-ask.title":
    "Preview a listing, ask a question",
  "changelog.entries.listing-preview-and-ask.body":
    "Moderators can now preview a submitted business exactly as it'll appear live, and ask the submitter a question that reaches them as a direct message.",
  "changelog.entries.business-map-pin.title": "Put your business on the map",
  "changelog.entries.business-map-pin.body":
    "Listing a business? Paste a Google Maps link to drop a pin, and live listings now show up on the local map. New submissions pass through a moderation queue before they appear.",
  "changelog.entries.profile-editing.title": "Edit your profile in place",
  "changelog.entries.profile-editing.body":
    "Your board, skills and groups are now editable right on your profile, with unsaved-change protection so you never lose an edit by accident.",
  "changelog.entries.profile-communities-save.title":
    "Featured communities that stay put",
  "changelog.entries.profile-communities-save.body":
    "The communities you pin to your profile now save for keeps — across sessions and devices — and show for everyone who visits, with your role on each.",
  "changelog.entries.mention-types.title": "More ways to mention",
  "changelog.entries.mention-types.body":
    "Mentions now reach beyond people and communities to topics, businesses, events and threads — owners and stewards get notified when they're tagged.",
  "changelog.entries.clear-errors.title": "Clearer error messages",
  "changelog.entries.clear-errors.body":
    "When something can't be saved, we now tell you exactly what went wrong instead of a generic “something went wrong.”",
  "changelog.entries.messaging-reactions.title": "Smoother message reactions",
  "changelog.entries.messaging-reactions.body":
    "Reactions update instantly for everyone in the chat, and your sent messages no longer shift position when you react to them.",
  "changelog.entries.event-photos.title": "Event photo galleries",
  "changelog.entries.event-photos.body":
    "Organizers and attendees can share photos on a gathering, visible only to the people who were actually there.",
  "changelog.entries.mentions.title": "Mention people and communities",
  "changelog.entries.mentions.body":
    "Type @ to tag a member or c/ to link a community in forum and community replies — anyone you mention gets a notification.",
  "changelog.entries.push-notifications.title": "Push notifications for messages",
  "changelog.entries.push-notifications.body":
    "Opt in to get a phone notification when a new direct message arrives while you're away — private, direct-messages-only, and off by default.",
  "changelog.entries.delete-conversation.title": "Delete a conversation",
  "changelog.entries.delete-conversation.body":
    "Clear a chat from your own inbox without affecting the other person's copy, WhatsApp-style.",
  "changelog.entries.profile-communities.title": "Showcase your communities",
  "changelog.entries.profile-communities.body":
    "Pin the communities you run or belong to on your profile, each with a role badge.",
  "changelog.entries.subprofiles-upgrade.title": "Richer subprofiles",
  "changelog.entries.subprofiles-upgrade.body":
    "Subprofiles gained presence and media, shareable link previews, and QR-code and vCard export.",
  "changelog.entries.messaging-upgrades.title": "Messaging improvements",
  "changelog.entries.messaging-upgrades.body":
    "Long-press message actions, editing and replying, and a cleaner conversation thread.",
  "changelog.entries.housing.title": "Housing & flatmate directories",
  "changelog.entries.housing.body":
    "Member-only listings for housing, flatmates and friendly landlords, each with a compatibility match score.",
  "changelog.entries.routing-cleanup.title": "Routing & path cleanup",
  "changelog.entries.routing-cleanup.body":
    "Resolved conflicting public paths and route edge cases across the app.",
  "changelog.entries.maps.title": "Interactive maps",
  "changelog.entries.maps.body":
    "The local directory and venues can now be explored on an interactive map.",
  "changelog.entries.genesis.title": "Founder bootstrap flow",
  "changelog.entries.genesis.body":
    "A one-time Genesis flow to set up the very first administrator when the platform is stood up.",
  "changelog.entries.pwa-mobile.title": "Install as an app",
  "changelog.entries.pwa-mobile.body":
    "QueerPulse became a progressive web app with a native-feeling mobile interface, plus improved icons and search-engine metadata.",
  "changelog.entries.deploy-stability.title": "Deploy & build stabilization",
  "changelog.entries.deploy-stability.body":
    "A run of deployment, build, and prerendering fixes to get the app shipping reliably in production.",
  "changelog.entries.performance-staff.title": "Performance & staff badges",
  "changelog.entries.performance-staff.body":
    "Faster page loads, expanded admin routes, and a QueerPulse staff badge on official accounts.",
  "changelog.entries.accessibility.title": "Accessibility & UI polish",
  "changelog.entries.accessibility.body":
    "Accessibility fixes and a round of interface refinements across the app.",
  "changelog.entries.i18n-complete.title": "Full Portuguese translation",
  "changelog.entries.i18n-complete.body":
    "The entire interface became available in both English and Portuguese, switchable from the nav.",
  "changelog.entries.subprofiles.title": "Subprofiles",
  "changelog.entries.subprofiles.body":
    "Create multiple public presences under one account — for your art, your business, or a project.",
  "changelog.entries.live-backend.title": "Live backend",
  "changelog.entries.live-backend.body":
    "The app connected to its real backend, keeping the standalone demo mode alongside live data, with editable profiles.",
  "changelog.entries.landing.title": "New landing page",
  "changelog.entries.landing.body":
    "A redesigned landing page and a round of marketing-site refactors.",
  "changelog.entries.studio-cinema.title": "Cinema & Studio",
  "changelog.entries.studio-cinema.body":
    "New Cinema rights pages and Studio production pages joined the platform.",
  "changelog.entries.tickets.title": "Ticketed events",
  "changelog.entries.tickets.body":
    "Pay for event tickets directly on the platform, backed by real event data.",
  "changelog.entries.business-directory.title": "Local business directory",
  "changelog.entries.business-directory.body":
    "A directory of local queer-friendly businesses, with a flow for owners to add their own.",
  "changelog.entries.invite-flow.title": "Invite flow",
  "changelog.entries.invite-flow.body":
    "An invitation-based sign-up flow and a reworked onboarding experience.",
  "changelog.entries.moderation-trust.title": "Moderation & trust network",
  "changelog.entries.moderation-trust.body":
    "Moderation tools, event management, admin tooling, and a trust-network graph connecting members.",
  "changelog.entries.communities-forum.title": "Communities & forum",
  "changelog.entries.communities-forum.body":
    "Member-run communities and a long-form discussion forum launched together.",
  "changelog.entries.onboarding.title": "Member onboarding",
  "changelog.entries.onboarding.body":
    "A guided onboarding flow for new members, with a smoother sign-in experience.",
  "changelog.entries.launch.title": "QueerPulse launches",
  "changelog.entries.launch.body":
    "The first release — the community mega-navigation and the core set of pages went live.",
  "changelog.empty.title": "Nothing logged under that filter yet",
  "changelog.empty.description":
    "No changes of this kind have shipped so far. Clear the filter to see the full history.",
  "changelog.empty.clearCta": "Clear filters",

  // ── Roadmap — page chrome. Shipped/building/planned items, top ideas and
  //    vote counts are the live backlog — left English; see the sweep
  //    report.
  "roadmap.meta.title": "The QueerPulse roadmap: shipped, building, planned",
  "roadmap.meta.description":
    "See what QueerPulse has shipped, what a small Lisbon team is building right now, and what's planned next — plus how to submit and vote on ideas.",
  "roadmap.hero.eyebrow": "What we're building",
  "roadmap.hero.title": "The <em>roadmap</em>",
  "roadmap.hero.sub":
    "QueerPulse is built by a small team in Lisbon. Here's what we're working on, what's shipped, and what you can vote on next.",
  "roadmap.col.done": "Done",
  "roadmap.col.buildingNow": "Building now",
  "roadmap.col.planned": "Planned",
  "roadmap.card.memberRequested": "Member requested",
  "roadmap.card.progressAria": "{name} progress",
  "roadmap.card.mostWanted": "Most wanted",
  "roadmap.card.votesSuffix": "votes",
  "roadmap.card.committed": "Committed",
  "roadmap.card.slipNote": "Moved {from} → {to} — {reason}",
  "roadmap.shape.title": "Have an <em>idea?</em>",
  "roadmap.shape.sub":
    "We read every suggestion. The most-voted ideas move up the roadmap.",
  "roadmap.submitIdea.title": "Submit an idea",
  "roadmap.submitIdea.ariaLabel": "Your idea",
  "roadmap.submitIdea.placeholder":
    "What would make QueerPulse better for you?",
  "roadmap.submitIdea.cta": "Submit idea",
  "roadmap.submitIdea.toast.empty": "Write a few words first",
  "roadmap.submitIdea.toast.submitted": "Thanks — sent to the team for review",
  "roadmap.submitIdea.toast.error": "Couldn't submit your idea — try again",
  "roadmap.topIdeas.title": "Most requested ideas",
  "roadmap.topIdeas.voted": "Voted",
  "roadmap.topIdeas.vote": "Vote",
  "roadmap.topIdeas.toast.voted": "Vote recorded",
  "roadmap.howWeDecide.title": "How we <em>decide</em>",
  "roadmap.howWeDecide.memberVotes.title": "Member votes",
  "roadmap.howWeDecide.memberVotes.desc":
    "The features you vote for rise to the top. We look at this weekly.",
  "roadmap.howWeDecide.safetyFirst.title": "Safety first",
  "roadmap.howWeDecide.safetyFirst.desc":
    "Every feature is reviewed for how it could be misused in a community like this.",
  "roadmap.howWeDecide.smallTeam.title": "Small team, careful pace",
  "roadmap.howWeDecide.smallTeam.desc":
    "We're two engineers and a designer. We'd rather build slowly and get it right.",
  "roadmap.someday.title": "Someday, <em>honestly</em>",
  "roadmap.someday.sub":
    "No date here, because a date would be a promise we can't keep yet. Still on our radar — vote to help one rise.",
  "roadmap.notBuilding.title": "Not building this, and <em>why</em>",
  "roadmap.notBuilding.sub":
    "The list most platforms hide. If we say no, you get a reason.",
  "roadmap.notBuilding.votesAsked_one": "{count} member had asked",
  "roadmap.notBuilding.votesAsked_other": "{count} members had asked",
  "roadmap.notBuilding.reason.scope.label": "Outside what we're building",
  "roadmap.notBuilding.reason.unsafe.label": "We can't build it safely",
  "roadmap.notBuilding.reason.capacity.label": "No capacity, honestly",
  "roadmap.notBuilding.reason.exists.label": "Already exists elsewhere",
  "roadmap.notBuilding.reason.harm.label": "The risk outweighs the value",
  "roadmap.subpageIndex.title": "Already shipped",
  "roadmap.subpageIndex.changelog.label": "Changelog",
  "roadmap.subpageIndex.changelog.blurb":
    "Every release, dated — what we've shipped so far.",

  // ── Press Archive — page chrome. Coverage headlines/sources/authors are
  //    real third-party press pieces (someone else's words) and stay
  //    English, same precedent as the Press Kit coverage section.
  "pressArchive.hero.backLabel": "Press Kit",
  "pressArchive.hero.eyebrow": "Coverage archive · since 2024",
  "pressArchive.hero.title": "Everything written <em>about us.</em>",
  "pressArchive.hero.sub":
    "Pieces about QueerPulse in third-party publications, indexed by year. <em>Includes critiques we disagreed with.</em>",
  "pressArchive.stats.allTime": "Pieces all-time",
  "pressArchive.stats.languages": "Languages",
  "pressArchive.stats.thisYear": "This year",
  "pressArchive.search.placeholder": "Search title, source, author",
  "pressArchive.chip.all": "All · {count}",
  "pressArchive.chip.features": "Features · {count}",
  "pressArchive.chip.interviews": "Interviews · {count}",
  "pressArchive.chip.news": "News · {count}",
  "pressArchive.chip.critiques": "Critiques · {count}",
  "pressArchive.pinBadge": "Featured",
  "pressArchive.toast.opening": "Opening on {source}…",
  "pressArchive.loadingMore": "Loading older pieces…",
  "pressArchive.loadMoreCta": "Load older coverage",
  "pressArchive.endOfArchive": "That's the whole archive — 2022 to today.",
  "pressArchive.noResults": "No coverage matches those filters yet.",
  "pressArchive.live.title": "The press archive is being assembled",
  "pressArchive.live.body":
    "We're gathering the coverage properly before we publish it here. Working on a story? Reach the team through the press kit.",

  // ── Volunteering — page chrome. Org names/roles/descriptions/skills come
  //    from the live opportunities API (or its demo mock) — left English;
  //    the adapter composes a few chrome fragments (commitment label,
  //    stat/spot-row labels, confirmation sentence) which are also keyed
  //    here so live mode translates identically to demo.
  "volunteer.meta.title": "Volunteer with QueerPulse: pick a cause, pick hours",
  "volunteer.meta.description":
    "Browse QueerPulse volunteer opportunities by cause — rights, health, youth, housing, arts — and by time commitment, or post one for your own organisation.",
  "volunteer.filter.all": "All opportunities",
  "volunteer.filter.low": "Low commitment",
  "volunteer.filter.medium": "Medium commitment",
  "volunteer.filter.rights": "LGBTQ+ Rights",
  "volunteer.filter.health": "Health & Wellbeing",
  "volunteer.filter.youth": "Youth",
  "volunteer.filter.housing": "Housing",
  "volunteer.filter.arts": "Arts & Culture",
  "volunteer.hero.eyebrow": "Volunteer",
  "volunteer.hero.title":
    "Give your time to the <em>community</em> around you.",
  "volunteer.hero.sub":
    "You don't need to be an activist. You need two free hours and a willingness to show up. Below are organisations in Lisbon genuinely looking for people like you.",
  "volunteer.hero.note":
    "Every organisation below has been vetted by the QueerPulse community",
  "volunteer.hero.postCta": "Post an opportunity",
  "volunteer.guide.eyebrow": "New to organising?",
  "volunteer.guide.title": "Want to do <em>more</em> than a shift?",
  "volunteer.guide.body":
    "Our guide to organising better walks you from showing up once to bringing a skill — no experience needed.",
  "volunteer.guide.cta": "Read the activism guide",
  "volunteer.empty.noneTitle": "No opportunities posted yet",
  "volunteer.empty.noneDescription":
    "No organisations have posted roles here yet. If yours is looking for hands, be the first to put out the call.",
  "volunteer.empty.noneCta": "Post an opportunity",
  "volunteer.empty.filteredTitle": "No opportunities match those filters yet",
  "volunteer.empty.filteredDescription":
    "Try widening your search — there are plenty of ways to give your time, and new roles are added often.",
  "volunteer.empty.clearCta": "Clear filters",
  "volunteer.card.commitLow": "Low commitment",
  "volunteer.card.commitMedium": "Medium commitment",
  "volunteer.card.expressInterest": "Express interest",
  "volunteer.loadingMore": "Loading more opportunities…",
  "volunteer.loadMoreCta": "Load more opportunities",
  "volunteer.outro.title": "Want to connect <em>more deeply?</em>",
  "volunteer.outro.sub":
    "Find the change makers already working on the causes you care about.",
  "volunteer.outro.cta": "Meet the change makers",
  "volunteer.signups.title": "Who's signed up",
  "volunteer.signups.loading": "Loading signups…",
  "volunteer.signups.empty":
    "No-one's signed up yet — the first person will show up here.",
  "volunteer.signups.signedUp": "Signed up {when}",
  "volunteer.signups.closedTag": "This opportunity is closed",
  "volunteer.signups.closing": "Closing…",
  "volunteer.signups.closeCta": "Close opportunity",
  "volunteer.adapter.eyebrow": "Volunteer · {cause} · {org}",
  "volunteer.adapter.recruitingNow": "Recruiting now",
  "volunteer.adapter.closedNotRecruiting": "Closed · not recruiting",
  "volunteer.adapter.perWeek": "Per week",
  "volunteer.adapter.commitment": "Commitment",
  "volunteer.adapter.spotsStillOpen": "Spots still open",
  "volunteer.adapter.roleLabel": "Role",
  "volunteer.adapter.locationLabel": "Location",
  "volunteer.adapter.applyConfirm":
    "Application submitted for {role}. The team will be in touch with next steps.",
  "volunteer.adapter.inPartnershipWith": "In partnership with {name}.",
  "volunteer.adapter.anonMember": "A member",

  // ── Post a Volunteer Opportunity — form chrome (all platform UI).
  "postOpportunity.hero.eyebrow": "Volunteer · Post a role",
  "postOpportunity.hero.title": "Post an <em>opportunity.</em>",
  "postOpportunity.hero.sub":
    "Looking for people to give their time? Describe the role honestly — the hours, the commitment, who it's good for — and it goes live on the volunteer board straight away.",
  "postOpportunity.toast.error":
    "Couldn't post your opportunity — please try again.",
  "postOpportunity.success.title": "Your opportunity is",
  "postOpportunity.success.em": "posted.",
  "postOpportunity.success.closeLabel": "View the volunteer board",
  "postOpportunity.success.step1": "It's live on the volunteer board now",
  "postOpportunity.success.step2": "Members can sign up from the listing",
  "postOpportunity.success.step3":
    "You'll see everyone who signs up on the role's page",
  "postOpportunity.success.body":
    "Thank you for making room for someone to help. Interested volunteers can now find your role and express interest.",
  "postOpportunity.actions.posting": "Posting…",
  "postOpportunity.actions.submit": "Post opportunity",
  "postOpportunity.actions.cancel": "Cancel",
  "postOpportunity.tip1.title": "Be honest about the ask",
  "postOpportunity.tip1.body":
    "Volunteers stay when the commitment matches what you promised. Spell out the hours, the term, and any training up front.",
  "postOpportunity.tip2.title": "Say who it's good for",
  "postOpportunity.tip2.body":
    "The best roles name the person they need — their temperament, not just their CV. It helps the right people self-select in.",
  "postOpportunity.tip3.title": "What happens after you post",
  "postOpportunity.tip3.body":
    "Your role appears on the volunteer board immediately. Interested members sign up from the detail page, and you'll see the roster there.",
  "postOpportunity.cause.rights": "LGBTQ+ Rights",
  "postOpportunity.cause.health": "Health & Wellbeing",
  "postOpportunity.cause.youth": "Youth",
  "postOpportunity.cause.housing": "Housing",
  "postOpportunity.cause.arts": "Arts & Culture",
  "postOpportunity.commit.low.label": "Low commitment",
  "postOpportunity.commit.low.hint":
    "A couple of flexible hours a week, no fixed term.",
  "postOpportunity.commit.medium.label": "Medium commitment",
  "postOpportunity.commit.medium.hint":
    "A regular shift and a minimum term — consistency matters.",
  "postOpportunity.core.basicsHeading": "The basics",
  "postOpportunity.core.orgLabel": "Organisation",
  "postOpportunity.core.orgPlaceholder": "e.g. your organisation",
  "postOpportunity.core.roleLabel": "Role title",
  "postOpportunity.core.rolePlaceholder": "e.g. Community Outreach Volunteer",
  "postOpportunity.core.causeLabel": "Cause",
  "postOpportunity.core.commitLabel": "Commitment level",
  "postOpportunity.core.timePlaceHeading": "Time & place",
  "postOpportunity.core.timeLabel": "Time commitment",
  "postOpportunity.core.timePlaceholder": "e.g. 2–4 hrs/week",
  "postOpportunity.core.locationLabel": "Location",
  "postOpportunity.core.locationPlaceholder": "e.g. In-person · Lisbon",
  "postOpportunity.core.spotsLabel": "Spots available",
  "postOpportunity.core.spotsHelper":
    "How many volunteers can you take on for this role?",
  "postOpportunity.core.spotsPlaceholder": "e.g. 24",
  "postOpportunity.core.pitchHeading": "The pitch",
  "postOpportunity.core.descLabel": "Short description",
  "postOpportunity.core.descHelper":
    "One or two sentences shown on the listing card.",
  "postOpportunity.core.descPlaceholder":
    "What the volunteer will help with, in plain language.",
  "postOpportunity.core.skillsLabel": "Skills",
  "postOpportunity.core.skillsHelper":
    "Comma-separated — shown as hashtags on the card.",
  "postOpportunity.core.skillsPlaceholder":
    "Communication, Languages, Event support",
  "postOpportunity.rich.summary": "Add more detail (optional)",
  "postOpportunity.rich.whyHeading": "Why it matters",
  "postOpportunity.rich.whyLabel": "Why this role matters",
  "postOpportunity.rich.whyHelper": "One paragraph per line.",
  "postOpportunity.rich.whyPlaceholder":
    "What changes because someone shows up for this.",
  "postOpportunity.rich.goodForLabel": "Who's good for this",
  "postOpportunity.rich.goodForHelper": "One paragraph per line.",
  "postOpportunity.rich.goodForPlaceholder":
    "The temperament and skills that fit — not just the CV.",
  "postOpportunity.rich.tasksHeading": "What they'll actually do",
  "postOpportunity.rich.taskTitleAria": "Task {index} title",
  "postOpportunity.rich.taskTitlePlaceholder": "Task title",
  "postOpportunity.rich.taskDetailAria": "Task {index} detail",
  "postOpportunity.rich.taskDetailPlaceholder": "One line on what it involves",
  "postOpportunity.rich.taskRemoveAria": "Remove task {index}",
  "postOpportunity.rich.addTask": "Add a task",
  "postOpportunity.rich.commitmentsHeading": "The commitment, honestly",
  "postOpportunity.rich.commitLabelAria": "Commitment {index} label",
  "postOpportunity.rich.commitLabelPlaceholder": "e.g. 6-hour training",
  "postOpportunity.rich.commitDetailAria": "Commitment {index} detail",
  "postOpportunity.rich.commitDetailPlaceholder":
    "e.g. Two evenings before you start · required",
  "postOpportunity.rich.commitRemoveAria": "Remove commitment {index}",
  "postOpportunity.rich.addCommitment": "Add a commitment",
  "postOpportunity.rich.teamHeading": "Team & contact",
  "postOpportunity.rich.teamIntroLabel": "Intro to the team",
  "postOpportunity.rich.teamIntroPlaceholder":
    "e.g. 18 outreach volunteers active this quarter.",
  "postOpportunity.rich.teamLabel": "Team members",
  "postOpportunity.rich.teamHelper":
    "Comma-separated member handles / slugs already on the team.",
  "postOpportunity.rich.teamPlaceholder": "catarina-v, jonas-f",
  "postOpportunity.rich.applyRoleLabel": "Apply-as role label",
  "postOpportunity.rich.applyRoleHelper": "Defaults to “Role · Organisation”.",
  "postOpportunity.rich.applyRolePlaceholder":
    "Community Outreach · a local LGBTQ+ association",
  "postOpportunity.rich.partnerSlugLabel": "Partner slug",
  "postOpportunity.rich.partnerSlugHelper": "Links to a partner's page.",
  "postOpportunity.rich.partnerSlugPlaceholder": "your-organisation",
  "postOpportunity.rich.handleLabel": "Contact handle",
  "postOpportunity.rich.handleHelper":
    "Where interested volunteers can reach you.",
  "postOpportunity.rich.handlePlaceholder": "@yourhandle or an email",

  // ── Volunteer Opportunity detail — page chrome. `opp.eyebrow` / `.urgent` /
  //    `.titleLead` / `.titleEm` / `.sub` / `.stats[].label` /
  //    `.spots[].label` / `.applyConfirm` / `.partner.text` / `.applyRole`
  //    come from the shared view-model the live adapter and the demo mock
  //    data both populate (`volunteering.adapters.tsx`,
  //    `volunteerOpportunities.dataA/B.tsx`) — NOT swept in this pass; fixing
  //    them means changing that shared type across the adapter + both demo
  //    data files, flagged in the sweep report as future work. Everything
  //    else on this page (headings, buttons, static labels) is chrome and is
  //    translated below.
  "volunteerDetail.backCta": "All volunteer opportunities",
  "volunteerDetail.error.alreadySignedUp":
    "You've already signed up for this role.",
  "volunteerDetail.error.full":
    "This opportunity just filled up — every spot is taken.",
  "volunteerDetail.error.alreadyOrFull":
    "You've already signed up, or this opportunity is now full.",
  "volunteerDetail.error.generic":
    "Something went wrong sending your interest — please try again.",
  "volunteerDetail.main.whyTitle": "Why this role <em>matters</em>",
  "volunteerDetail.main.tasksTitle": "What you'll <em>actually do</em>",
  "volunteerDetail.main.commitmentTitle": "The <em>commitment</em>, honestly",
  "volunteerDetail.main.goodForTitle": "Who's <em>good for this</em>",
  "volunteerDetail.main.teamTitle": "Who's <em>already in</em>",
  "volunteerDetail.sidebar.appliedTitle": "You're <em>on the list.</em>",
  "volunteerDetail.sidebar.messageTeam": "Message the team",
  "volunteerDetail.sidebar.withdrawing": "Withdrawing…",
  "volunteerDetail.sidebar.withdraw": "Withdraw my interest",
  "volunteerDetail.sidebar.applyHeading": "Apply",
  "volunteerDetail.sidebar.spotsFilled": "Spots filled",
  "volunteerDetail.sidebar.roleFull": "This role is full",
  "volunteerDetail.sidebar.sending": "Sending your application…",
  "volunteerDetail.sidebar.applyCta": "Apply",
  "volunteerDetail.sidebar.askTeam": "Ask the team",
  "volunteerDetail.sidebar.footNote":
    "Returning volunteers: <a>use last year's profile</a> · skips the screen.",
  "volunteerDetail.sidebar.partnershipLabel": "In partnership with",
  "volunteerDetail.sidebar.partnershipLink": "About the partnership",
  "volunteerDetail.sidebar.notRightFit": "Not the right fit?",
  "volunteerDetail.sidebar.otherWays": "Other ways to help right now:",
  "volunteerDetail.sidebar.fundInstead": "Fund this work instead",

  // ── Partner Detail — page chrome. About/joint-work/timeline/how-we-work
  //    copy, stats, and contact details are each partner org's own content
  //    (partnerDetails.dataA/B.tsx) — left English, same precedent as the
  //    Partners listing page.
  "partnerDetail.loadError":
    "We couldn't load this partner just now. Please try again.",
  "partnerDetail.backCta": "All partners",
  "partnerDetail.tab.about": "About",
  "partnerDetail.tab.work": "Joint work",
  "partnerDetail.tab.timeline": "Timeline",
  "partnerDetail.tab.how": "How we work together",
  "partnerDetail.sidebar.atGlance": "At a glance",
  "partnerDetail.sidebar.contactDirectly": "Contact {name} directly",
  "partnerDetail.sidebar.becomeTitle": "Become a partner",
  "partnerDetail.sidebar.becomeBody":
    "Are you an org that ought to be operationally connected to QueerPulse? We're small and slow about this — write to us.",
  "partnerDetail.sidebar.becomeCta": "Get in touch",

  // ── Donate — page chrome. All platform-authored (amounts/allocation/trust
  //    copy are QueerPulse's own fixed figures, not fetched user content).
  "donate.meta.title": "Donate to QueerPulse: where every euro goes",
  "donate.meta.description":
    "Support QueerPulse with a monthly or one-off gift — funding mutual aid, gatherings, platform safety and paid creative work, with allocation reported every quarter.",
  "donate.hero.eyebrow": "Support QueerPulse",
  "donate.hero.title": "Members keep this <em>alive.</em>",
  "donate.hero.lead":
    "No ads, no investors, no data sold. QueerPulse runs on the people who use it — and every euro goes back into mutual aid, gatherings, and paying queer creatives fairly.",
  "donate.toggle.monthly": "Monthly",
  "donate.toggle.oneOff": "One-off",
  "donate.amounts.coffee": "a coffee",
  "donate.amounts.mostChosen": "most chosen",
  "donate.amounts.sustainsMember": "sustains a member",
  "donate.amounts.fundsGathering": "funds a gathering",
  "donate.giveCta.monthly": "Give {amount} / month",
  "donate.giveCta.oneOff": "Give {amount}",
  "donate.allocation.title": "Where it <em>actually goes.</em>",
  "donate.allocation.lead":
    "Not overheads and salaries for people you'll never meet. Here's the real split.",
  "donate.allocation.mutualAid.label": "Direct mutual aid",
  "donate.allocation.mutualAid.body":
    "Emergency housing, crisis support, and micro-grants paid straight to members in need.",
  "donate.allocation.gatherings.label": "Gatherings & spaces",
  "donate.allocation.gatherings.body":
    "Venue hire, sliding-scale tickets, and the newcomer events that keep the door open.",
  "donate.allocation.platform.label": "Platform & safety",
  "donate.allocation.platform.body":
    "Moderation, the crisis chat line, and keeping the lights on — no ads, no data sold.",
  "donate.allocation.magazine.label": "The magazine & studio",
  "donate.allocation.magazine.body":
    "Paying queer writers, artists, and musicians fairly for the work they make here.",
  "donate.trust.title": "You can <em>trust the numbers.</em>",
  "donate.trust.lead":
    "Transparency isn't a nice-to-have here — it's the deal.",
  "donate.trust.reported.title": "Every euro is reported",
  "donate.trust.reported.body":
    "Quarterly figures published in the open — see exactly where it went.",
  "donate.trust.noAds.title": "No ads, no data sold",
  "donate.trust.noAds.body":
    "We are funded by members, not advertisers. Your support is the whole model.",
  "donate.trust.membersDecide.title": "Members decide",
  "donate.trust.membersDecide.body":
    "The community council votes on how the solidarity fund is spent each quarter.",
  "donate.outro.title": "Or give your <em>time instead.</em>",
  "donate.outro.sub":
    "Money is one way in. Volunteering, hosting, and showing up are just as much the point.",
  "donate.outro.volunteerCta": "Volunteer with us",
  "donate.outro.readFiguresCta": "Read the figures",

  // ── Donate modal — payment form chrome (prototype, no real charge).
  "donateModal.title": "Confirm your <em>gift.</em>",
  "donateModal.sub": "No ads, no investors — just members keeping this alive.",
  "donateModal.row.monthlyGift": "Monthly gift",
  "donateModal.row.oneOffGift": "One-off gift",
  "donateModal.row.feeCovered": "Processing fee covered",
  "donateModal.row.chargedToday": "Charged today",
  "donateModal.amount.monthly": "{amount} / month",
  "donateModal.checkLabel": "Cover the {pct}% processing fee",
  "donateModal.checkHint": "So 100% of your {amount} reaches the community.",
  "donateModal.field.nameOnCard": "Name on card",
  "donateModal.field.namePlaceholder": "Alex Rivera",
  "donateModal.field.emailReceipt": "Email for receipt",
  "donateModal.field.emailPlaceholder": "you@example.com",
  "donateModal.field.cardNumber": "Card number",
  "donateModal.field.cardNumberPlaceholder": "1234 5678 9012 3456",
  "donateModal.field.expiry": "Expiry",
  "donateModal.field.expiryPlaceholder": "MM / YY",
  "donateModal.field.cvc": "CVC",
  "donateModal.processing": "Processing…",
  "donateModal.submitCta.monthly": "Donate {amount} / month",
  "donateModal.submitCta.oneOff": "Donate {amount}",
  "donateModal.secure":
    "Encrypted & secure. This is a prototype — no real charge is made.",
  "donateModal.success.title": "You're in.",
  "donateModal.success.emMonthly": "See you next month.",
  "donateModal.success.emOneOff": "Thank you.",
  "donateModal.success.closeLabel": "Done",
  "donateModal.success.bodyMonthly":
    "Your {amount} / month goes straight to mutual aid, gatherings, and paying queer creatives fairly. Cancel anytime from your account — no questions asked.",
  "donateModal.success.bodyOneOff":
    "Your {amount} goes straight to mutual aid, gatherings, and paying queer creatives fairly. We'll email your receipt shortly.",
  "donateModal.comingSoon.title": "Giving isn't <em>live yet</em>",
  "donateModal.comingSoon.body":
    "We're still setting up secure payments, so we can't take donations here just yet — nothing was charged. In the meantime, you can see exactly where every pound of community money goes.",
  "donateModal.comingSoon.figuresCta": "See where the money goes",

  // ── Contact — page chrome. All platform-authored form/routing copy.
  "contact.meta.title": "Contact QueerPulse: general, safety, press, partners",
  "contact.meta.description":
    "Get in touch with QueerPulse — a small team that reads and answers every message itself. Routes for general questions, safety concerns, press, and partnerships.",
  "contact.eyebrow": "We read everything",
  "contact.hero.title": "Get in <em>touch.</em>",
  "contact.hero.body":
    "We're a small team and we respond to messages ourselves. Not an automated system, not a support ticket queue. Pick the route that makes the most sense for what you need to say.",
  "contact.routes.general.title": "General hello",
  "contact.routes.general.desc":
    "Anything that doesn't fit elsewhere — questions, feedback, introductions, ideas you think we should hear about.",
  "contact.routes.safety.title": "Safety concern",
  "contact.routes.safety.desc":
    "If something in the network has made you feel unsafe or uncomfortable. Handled with full discretion. We respond within 24 hours.",
  "contact.routes.press.title": "Press & media",
  "contact.routes.press.desc":
    "Journalists, researchers, documentary makers. We're happy to talk about what we're building and why. We ask that you share your draft before publication.",
  "contact.routes.partnerships.title": "Partnerships",
  "contact.routes.partnerships.desc":
    "Organisations, spaces, and communities who want to work with QueerPulse. We're selective but we're genuinely interested in the right collaborations.",
  "contact.sent.title": "Message <em>received.</em>",
  "contact.sent.body":
    "We'll read it and write back, usually within a day or two. If it's a safety concern, we'll be in touch within 24 hours.",
  "contact.sent.backCta": "Back to QueerPulse",
  "contact.comingSoon.title": "This form isn't <em>wired up yet.</em>",
  "contact.comingSoon.body":
    "We haven't connected this form to our inbox yet, so it can't send your message — nothing was submitted. Email us directly instead; every address on the left is real and read by a person.",
  "contact.comingSoon.emailCta": "Email hello@queerpulse.pt",
  "contact.form.title": "Write to <em>us.</em>",
  "contact.form.sub":
    "If you prefer a form to an email, use this. We read it the same way.",
  "contact.form.nameLabel": "Your name",
  "contact.form.namePlaceholder": "How you'd like to be addressed",
  "contact.form.emailLabel": "Email",
  "contact.form.emailPlaceholder": "So we can write back",
  "contact.form.topicLabel": "What's this about?",
  "contact.form.topicPick": "Pick a topic",
  "contact.form.topic.general": "General question or feedback",
  "contact.form.topic.safety": "Safety concern",
  "contact.form.topic.press": "Press or research inquiry",
  "contact.form.topic.partnership": "Partnership proposal",
  "contact.form.topic.other": "Something else",
  "contact.form.messageLabel": "Your message",
  "contact.form.messagePlaceholder":
    "Write naturally. There's no template and no word count.",
  "contact.form.sendCta": "Send",
  "contact.form.sendingCta": "Sending…",
  "contact.form.error":
    "Something went wrong sending that. Please try again, or email us directly.",
  "contact.outro.title": "Built in Lisbon, <em>with care.</em>",
  "contact.outro.sub":
    "QueerPulse is a small, member-supported network. Your feedback helps keep it good.",
  "contact.outro.backCta": "Back to the room",

  // ── For Organisations — partnerships landing page chrome. The four
  //    PARTNERS records (name/tenure/description) and the Filipa Mendes
  //    testimonial are each org's own content — left English, same
  //    precedent as the Partners listing page.
  "forOrgs.meta.title": "Partner with QueerPulse: operational, not promotional",
  "forOrgs.meta.description":
    "How organisations can partner with QueerPulse — operational collaborations, not sponsored content or Pride-month campaigns, and how the process starts.",
  "forOrgs.hero.eyebrow": "For organisations · partnerships",
  "forOrgs.hero.title": "Work <em>with us,</em> not <em>at us.</em>",
  "forOrgs.hero.dek":
    "QueerPulse partnerships are <b>operational, not promotional</b>. We don't sell access, run sponsored content, or do co-branding for its own sake. <em>We build seams between organisations that already do the work.</em> Below: what those seams look like, who we already work with, and how to start a conversation.",
  "forOrgs.hero.notDoTitle": "What we don't do",
  "forOrgs.notDo.prideCampaigns":
    "<b>Pride-month campaigns.</b> Not in June, not ever. Members would (rightly) leave.",
  "forOrgs.notDo.sellList":
    "<b>Sell our member list.</b> No targeting, no segmentation, no warm intros for a fee.",
  "forOrgs.notDo.sponsoredPosts":
    '<b>"Sponsored posts" or branded content</b> in the magazine, feed, or podcast.',
  "forOrgs.notDo.rainbowLogos":
    "<b>Rainbow logos.</b> We don't add yours and we don't loan ours.",
  "forOrgs.notDo.recruit":
    "<b>Recruit on your behalf.</b> Companies post jobs through Jobs like everyone else.",
  "forOrgs.process.title": "How partnerships <em>actually start</em>",
  "forOrgs.process.sub":
    "Slow. Conversational. Often via a phone call before a written proposal. The whole process usually takes 6–10 weeks.",
  "forOrgs.process.step1.title": "Email or a call",
  "forOrgs.process.step1.body":
    "Tell us what you do, what you'd like, what's not negotiable on your side. <em>30 min, no commitment.</em>",
  "forOrgs.process.step2.title": "An in-person meeting",
  "forOrgs.process.step2.body":
    "Coffee in Lisbon if you're here, or video. We talk through how the seam would work — operationally, not theoretically.",
  "forOrgs.process.step3.title": "Two-page proposal",
  "forOrgs.process.step3.body":
    "One of us drafts it; both sides edit. Includes <b>exit conditions</b>, public-disagreement clauses, and money flow.",
  "forOrgs.process.step4.title": "Assembly sign-off",
  "forOrgs.process.step4.body":
    "Operational partnerships go to the monthly Assembly. The Sustainer membership weighs in. <em>~10% of partnerships are vetoed.</em>",
  "forOrgs.proof.title": "Already working <em>with us</em>",
  "forOrgs.proof.sub":
    "Four representative partners, each at a different tier. Full list lives on Partners.",
  "forOrgs.proof.viewCta": "View partner",
  "forOrgs.tiers.title": "What we <em>do offer</em>",
  "forOrgs.tiers.sub":
    "Three tiers, each a different kind of relationship. All include the basics: pre-listing review, transparent funding disclosure, and the ability for either side to disagree publicly.",
  "forOrgs.tiers.employer.name": "Verified employer",
  "forOrgs.tiers.employer.pricePeriod": "/ year · post unlimited jobs",
  "forOrgs.tiers.employer.dek":
    'For employers who want to post on our Jobs board with the "verified queer-friendly" badge. Requires a 12-month engagement and one member-conducted review.',
  "forOrgs.tiers.employer.list1":
    "Unlimited job listings · <b>posted within 24h</b>",
  "forOrgs.tiers.employer.list2":
    "Verified-employer badge on the company profile",
  "forOrgs.tiers.employer.list3":
    "One annual member-conducted culture review (anonymous)",
  "forOrgs.tiers.employer.list4": "Listing in Employer Reviews",
  "forOrgs.tiers.employer.list5":
    "Quarterly hiring office-hours with two team members",
  "forOrgs.tiers.employer.footnote":
    "For: 20+ person organisations actively hiring queer talent. Sliding scale for under-50-person teams.",
  "forOrgs.tiers.employer.reviewCta": "Start the review",
  "forOrgs.tiers.employer.reviewToast": "Opening the review form…",
  "forOrgs.tiers.employer.exampleCta": "See an example company profile",
  "forOrgs.tiers.partner.name": "Operational <em>partner</em>",
  "forOrgs.tiers.partner.price": "By <em>arrangement</em>",
  "forOrgs.tiers.partner.pricePeriod": "reciprocal · usually unpaid",
  "forOrgs.tiers.partner.dek":
    "For organisations that should be operationally connected to QueerPulse — legal-aid organisations, health services, civic-service agencies, allied associations. We build infrastructure together, not co-marketing.",
  "forOrgs.tiers.partner.list1":
    "<b>Operational seam:</b> case bridge, helpline handoff, joint protocol",
  "forOrgs.tiers.partner.list2": "Shared moderation channel where appropriate",
  "forOrgs.tiers.partner.list3":
    "Co-signed advocacy work · each side can dissent publicly",
  "forOrgs.tiers.partner.list4":
    "Listed on Partners with a dedicated case page",
  "forOrgs.tiers.partner.list5":
    "<b>Per-case payment</b> for partner-provided services (e.g. €45/legal-consult)",
  "forOrgs.tiers.partner.footnote":
    "For: civic, advocacy, healthcare, and mission-aligned orgs. Selection is slow and rare. <b>Two new operational partners per year, max.</b>",
  "forOrgs.tiers.partner.proposeCta": "Propose a partnership",
  "forOrgs.tiers.funder.name": "Programme funder",
  "forOrgs.tiers.funder.pricePeriod": "/ year · specific programme",
  "forOrgs.tiers.funder.dek":
    "For foundations, public agencies, and grant-making organisations funding a specific programme — micro-grants, the magazine, safe spaces, trans-health access.",
  "forOrgs.tiers.funder.list1": "Programme-specific reporting · quarterly",
  "forOrgs.tiers.funder.list2": "Credit on the programme page in plain text",
  "forOrgs.tiers.funder.list3": "No platform-wide placement, no co-branding",
  "forOrgs.tiers.funder.list4": "Annual independent audit included",
  "forOrgs.tiers.funder.list5": "Public itemisation in the transparency report",
  "forOrgs.tiers.funder.footnote":
    "For: Fundação Calouste Gulbenkian-tier orgs and EU programmes. We've turned down €60k+ when the strings didn't fit.",
  "forOrgs.tiers.funder.discussCta": "Discuss a grant",
  "forOrgs.tiers.funder.discussToast": "Opening grant discussion…",
  "forOrgs.cta.title": "Start a <em>conversation.</em>",
  "forOrgs.cta.body":
    'Tell us about your organisation in a paragraph. We read every message within 5 working days and reply personally — even if the answer is "this isn\'t right for us right now."',
  "forOrgs.cta.list1": "For partnerships, we usually call before we write",
  "forOrgs.cta.list2": "Grant applications: include a one-pager",
  "forOrgs.cta.pressInquiry": "Press inquiries → <a>Press Kit</a>",
  "forOrgs.cta.partnerQuestion":
    "Already a partner with a question → <a>Contact</a>",
  "forOrgs.form.nameLabel": "Your name",
  "forOrgs.form.namePlaceholder": "Filipa Mendes",
  "forOrgs.form.orgLabel": "Organisation",
  "forOrgs.form.orgPlaceholder": "Your organisation",
  "forOrgs.form.emailLabel": "Email",
  "forOrgs.form.emailPlaceholder": "you@org.example",
  "forOrgs.form.interestLabel": "Interested in",
  "forOrgs.form.interest.operational": "Operational partnership",
  "forOrgs.form.interest.employer": "Verified employer",
  "forOrgs.form.interest.funding": "Programme funding",
  "forOrgs.form.interest.other": "Something else (tell us in the note)",
  "forOrgs.form.messageLabel": "What you'd like to build, in a paragraph",
  "forOrgs.form.messagePlaceholder": "We run an LGBTQ+ helpline and…",
  "forOrgs.form.submitCta": "Send to partnerships team",
  "forOrgs.form.sendingCta": "Sending…",
  "forOrgs.form.sent.title": "Sent to our <em>partnerships team.</em>",
  "forOrgs.form.sent.body":
    "Thanks — we've got your message. Our partnerships team reads every one and replies personally within 5 working days.",
  "forOrgs.form.error":
    "Something went wrong sending that. Please try again, or email the partnerships team directly.",
  "forOrgs.form.small":
    "Goes directly to our partnerships team. No sales funnel, no follow-up sequence. Just a reply within 5 working days.",
  "forOrgs.form.toast":
    "Sent to our partnerships team — they'll reply within 5 working days",
  "forOrgs.form.comingSoon.title": "This form isn't <em>wired up yet.</em>",
  "forOrgs.form.comingSoon.body":
    "We haven't connected the partnerships form yet, so it can't send your details — nothing was submitted. Email the partnerships team directly and we'll take it from there.",
  "forOrgs.form.comingSoon.emailCta": "Email partners@queerpulse.pt",

  // ── Directory — business directory + detail page chrome. Place records
  //    (`directoryPlaces.ts`: names, taglines, reviews, owner bios) are each
  //    business's own content — left English, same precedent as mock member
  //    bios/reviews elsewhere.
  "directory.hero.eyebrow": "Queer business directory",
  "directory.hero.title": "Find your <em>people's places.</em>",
  "directory.hero.sub":
    "Queer-owned businesses and queer-friendly professionals in Lisbon. Vetted by the community, maintained by the community. Whether you just arrived or you've been here for years.",
  "directory.hero.note": "Community-verified · updated monthly",
  "directory.search.placeholder": "Search by name, neighbourhood, or type…",
  "directory.filterAria": "Filter places by category",
  "directory.cat.all": "All",
  "directory.cat.food": "Food & drink",
  "directory.cat.design": "Design & craft",
  "directory.cat.health": "Health & care",
  "directory.cat.space": "Spaces",
  "directory.cat.culture": "Culture",
  "directory.cat.tech": "Tech",
  "directory.cat.grooming": "Barbershop & Salon",
  "directory.cat.fitness": "Gym & Fitness",
  "directory.loading": "Loading places…",
  "directory.count": "Showing <b>{shown}</b> of {total} places",
  "directory.empty.title": "No places match those filters",
  "directory.empty.body":
    "Try a broader category, fewer vibes, or a different search — or clear the filters to see everything.",
  "directory.noListings.title": "No places listed yet",
  "directory.noListings.body":
    "This directory grows from the community. If you run or know a queer-owned or queer-friendly place in Lisbon, be the first to add it.",
  "directory.clearFilters": "Clear filters",
  "directory.clearAll": "Clear all",
  "directory.activeFilters": "Filtered by",
  "directory.removeFilter": "Remove filter",
  "directory.onMap": "{count} on map",
  "directory.sort.label": "Sort",
  "directory.sort.default": "Featured",
  "directory.sort.name": "A–Z",
  "directory.sort.hood": "By neighbourhood",
  "directory.badge.queerOwned": "Queer-owned",
  "directory.badge.friendly": "LGBTQ+ friendly",
  "directory.card.memberRun": "Member-run",
  "directory.card.viewDetails": "View details",
  "directory.card.verifiedBadge": "Verified safe space",
  "directory.submitStrip.title": "Know a place worth <em>adding?</em>",
  "directory.submitStrip.body":
    "If you run or know a queer-owned or queer-friendly business in Lisbon that belongs in this directory, tell us. We review every suggestion before it goes live.",
  "directory.submitStrip.cta": "List your business",
  "directory.verify.eyebrow": "Community verified",
  "directory.verify.title": "How verification <em>works.</em>",
  "directory.verify.lead":
    "The verified badge isn't self-declared. A member puts a space forward, others visit and review it against a fixed set of criteria, and every listing is re-checked each year — so a space can lose it, too.",
  "directory.verify.cta": "See the full trust story",
  "directory.verify.pillar.nominate.title": "Member-nominated",
  "directory.verify.pillar.nominate.body":
    "Any member can put a space forward for review.",
  "directory.verify.pillar.review.title": "Independently reviewed",
  "directory.verify.pillar.review.body":
    "Verified members visit and assess it against the same criteria — bathrooms, staff, accessibility, and real reviews.",
  "directory.verify.pillar.recheck.title": "Re-checked every year",
  "directory.verify.pillar.recheck.body":
    "No badge is permanent. Any member can flag a space, and it can be pulled.",
  "directory.outro.title":
    "New to Lisbon? <em>You're not starting from zero.</em>",
  "directory.outro.sub":
    "Join the network and get access to the full directory, member recommendations, and a community that knows the city.",
  "directory.outro.cta": "Request an invite",
  "directory.detail.backCta": "Directory",
  "directory.detail.breadcrumbAria": "Breadcrumb",
  "directory.detail.breadcrumbHome": "Directory",
  "directory.detail.relatedTitle": "More {category} nearby",
  "directory.detail.badge.verifiedOwned": "Verified queer-owned",
  "directory.detail.badge.friendly": "LGBTQ+ friendly",
  "directory.detail.reviewsCount": "· {count} reviews",
  "directory.detail.newBadge": "New",
  "directory.detail.whatItIsTitle": "What it <em>actually is.</em>",
  "directory.detail.goodForTitle": "What members say it's <em>good for</em>",
  "directory.detail.offersTitle": "What this place <em>offers</em>",
  "directory.detail.goodForSub": "Aggregated from {count} reviews.",
  "directory.detail.hoursTitle": "Hours",
  "directory.detail.today": "Today",
  "directory.detail.hoursClosed": "Closed",
  "directory.detail.openNow": "Open now",
  "directory.detail.closedNow": "Closed",
  "directory.detail.reviewsTitle": "Member reviews · <em>{count}</em>",
  "directory.detail.reviewsSub": "Sorted by most helpful.",
  "directory.detail.reviews.emptySub":
    "No reviews yet — be the first to leave one.",
  "directory.detail.ratingBreakdown": "Rating breakdown",
  "directory.detail.starsCount": "{stars} stars, {count} reviews",
  "directory.detail.review.formTitle": "Been here? Leave a review",
  "directory.detail.review.starsAria": "Your rating",
  "directory.detail.review.starAria": "{count} out of 5 stars",
  "directory.detail.review.placeholder":
    "Share what your visit was like — what worked, and who it's for.",
  "directory.detail.review.submit": "Post review",
  "directory.detail.review.submitting": "Posting…",
  "directory.detail.review.successToast": "Thanks — your review is up.",
  "directory.detail.review.errorToast":
    "Couldn't post your review. Please try again.",
  "directory.detail.review.signInPrompt":
    "Sign in to leave a review of this space.",
  "directory.detail.review.signInCta": "Sign in",
  "directory.detail.reply.ownerResponseTitle": "Response from the owner",
  "directory.detail.reply.replyCta": "Reply",
  "directory.detail.reply.editReplyCta": "Edit reply",
  "directory.detail.reply.placeholder": "Write a public reply to this review…",
  "directory.detail.reply.save": "Save reply",
  "directory.detail.reply.cancel": "Cancel",
  "directory.detail.reply.savingLabel": "Saving…",
  "directory.detail.reply.successToast": "Your reply is up.",
  "directory.detail.reply.errorToast":
    "Couldn't post your reply. Please try again.",
  "directory.detail.helpful": "<b>{count}</b> members found this helpful",
  "directory.detail.reviews.sortLabel": "Sort",
  "directory.detail.reviews.sortHelpful": "Most helpful",
  "directory.detail.reviews.sortHighest": "Highest rated",
  "directory.detail.reviews.sortLowest": "Lowest rated",
  "directory.detail.reviews.sortedByHelpful": "Sorted by most helpful.",
  "directory.detail.reviews.sortedByHighest": "Sorted by highest rated.",
  "directory.detail.reviews.sortedByLowest": "Sorted by lowest rated.",
  "directory.detail.reviews.filterAria": "Filter reviews by star rating",
  "directory.detail.reviews.filterAll": "All ratings",
  "directory.detail.reviews.filterStars_one": "{count} star",
  "directory.detail.reviews.filterStars_other": "{count} stars",
  "directory.detail.reviews.noStarReviews": "No {count}-star reviews yet.",
  "directory.detail.reviews.ratingAria": "Rated {count} out of 5 stars",
  "directory.detail.visitWebsite": "Visit website",
  "directory.detail.getInTouch": "Get in touch",
  "directory.detail.backToDirectory": "Back to directory",
  "directory.detail.claimCta": "Do you run this place? Claim it",
  "directory.detail.notFound.title": "We couldn't find this place",
  "directory.detail.notFound.body":
    "This listing may have been taken down, or the link might be out of date. Everywhere else that's open to us is still in the directory.",
  "directory.detail.notFound.cta": "Browse the directory",
  "directory.detail.reportCta": "Report this listing",
  "directory.detail.reportAriaLabel": "Report {name}",
  "directory.detail.suggestEdit.cta": "Suggest an edit",
  "directory.detail.suggestEdit.ariaLabel": "Suggest an edit for {name}",
  "directory.detail.suggestEdit.title": "Suggest an edit",
  "directory.detail.suggestEdit.sub":
    "Spot something off? Let the owner know what to fix — they'll see it, not the whole directory.",
  "directory.detail.suggestEdit.fieldLabel": "What needs a second look?",
  "directory.detail.suggestEdit.field.hours": "Hours",
  "directory.detail.suggestEdit.field.address": "Address",
  "directory.detail.suggestEdit.field.phone": "Phone number",
  "directory.detail.suggestEdit.field.website": "Website",
  "directory.detail.suggestEdit.field.description": "Description",
  "directory.detail.suggestEdit.field.other": "Something else",
  "directory.detail.suggestEdit.messageLabel": "What should change?",
  "directory.detail.suggestEdit.messagePlaceholder":
    "Tell them what's outdated or wrong, and what it should say instead.",
  "directory.detail.suggestEdit.submit": "Send suggestion",
  "directory.detail.suggestEdit.submitting": "Sending…",
  "directory.detail.suggestEdit.cancel": "Cancel",
  "directory.detail.suggestEdit.successToast":
    "Thanks — we'll pass it along to the owner.",
  "directory.detail.suggestEdit.errorToast":
    "Couldn't send your suggestion. Please try again.",
  "directory.detail.contest.cta": "Suggest an edit or claim this listing",
  "directory.detail.contest.ariaLabel": "Suggest an edit or claim {name}",
  "directory.detail.contest.title": "Suggest an edit or claim this listing",
  "directory.detail.contest.sub":
    "How would you like to help keep {name}'s entry accurate?",
  "directory.detail.contest.suggest.title": "Suggest an edit",
  "directory.detail.contest.suggest.desc":
    "Something's outdated or wrong — send a correction to the owner.",
  "directory.detail.contest.dispute.title": "Dispute this listing",
  "directory.detail.contest.dispute.desc":
    "This place was listed without its say-so, or shouldn't be here at all.",
  "directory.detail.contest.claim.title": "Claim this listing",
  "directory.detail.contest.claim.desc":
    "You run this place and want to manage its entry.",
  "directory.detail.dispute.ariaLabel": "Report or dispute {name}",
  "directory.detail.dispute.eyebrow": "Report / dispute",
  "directory.detail.dispute.title": "Contest <em>{name}</em>",
  "directory.detail.dispute.sub":
    "A place can be tagged as ours without its knowledge. Tell us what's wrong — a moderator reviews every dispute, and nothing you write is shared publicly.",
  "directory.detail.dispute.reasonLabel": "What's the problem?",
  "directory.detail.dispute.reasonPlaceholder":
    "e.g. We run this venue and were never asked to be listed, or this information is wrong.",
  "directory.detail.dispute.emailLabel": "Contact email",
  "directory.detail.dispute.emailHelper":
    "Optional — add one if a moderator should reach you outside QueerPulse.",
  "directory.detail.dispute.emailPlaceholder": "you@example.com",
  "directory.detail.dispute.emailError": "Enter a valid email address.",
  "directory.detail.dispute.note":
    "Filing a dispute doesn't remove the listing on its own — a moderator looks into it first.",
  "directory.detail.dispute.cancel": "Cancel",
  "directory.detail.dispute.submit": "Send to moderators",
  "directory.detail.dispute.submitting": "Sending…",
  "directory.detail.dispute.errorToast":
    "Couldn't file your dispute. Please try again.",
  "directory.detail.dispute.successAriaLabel": "Dispute received",
  "directory.detail.dispute.successTitle": "Thanks — we're",
  "directory.detail.dispute.successEm": "on it.",
  "directory.detail.dispute.successBody":
    "A moderator will review your report about {name}. If you left an email, we'll use it only if we need to follow up.",
  "directory.detail.dispute.doneCta": "Done",
  "directory.detail.mapAria": "Map showing where {name} is",
  "directory.detail.languagesLabel": "Languages",
  "directory.detail.accessLabel": "Access",
  "directory.detail.trust.lastVerifiedLabel": "Last verified",
  "directory.detail.trust.howLine":
    "This space meets the same criteria as every verified space.",
  "directory.detail.trust.howLink": "How verification works",
  "directory.detail.whoRunsIt": "Who runs it",
  "directory.detail.onQueerPulse": "On QueerPulse",
  "directory.detail.communityVouched": "Community-vouched",
  "directory.detail.viewProfile": "View {name}'s profile",
  "directory.detail.savedByMembers_one": "Saved by {count} member",
  "directory.detail.savedByMembers_other": "Saved by {count} members",
  "directory.detail.membersHereLately": "Members here lately",
  "directory.detail.upcomingHere": "Upcoming here",
  "directory.detail.upcoming.addToCalendar": "Add to calendar:",
  "directory.detail.upcoming.googleCalendar": "Google Calendar",
  "directory.detail.upcoming.downloadIcs": ".ics",
  "directory.detail.galleryAria": "Photos of {name}",
  "directory.detail.viewPhoto": "View photo",
  "directory.detail.lightboxClose": "Close",
  "directory.detail.prevPhoto": "Previous photo",
  "directory.detail.nextPhoto": "Next photo",
  "directory.detail.action.directions": "Directions",
  "directory.detail.action.call": "Call",
  "directory.detail.action.share": "Share",
  "directory.detail.action.save": "Save",
  "directory.detail.action.saved": "Saved",
  "directory.detail.action.linkCopied": "Link copied",
  "directory.detail.action.shareError": "Couldn't share — try copying the link",
  "directory.detail.action.saveSignIn": "Sign in to save this space",
  "directory.relative.yesterday": "Yesterday",
  "directory.relative.twoDaysAgo": "2 days ago",
  "directory.relative.threeDaysAgo": "3 days ago",
  "directory.relative.lastWeek": "last week",
  "directory.days.monday": "Monday",
  "directory.days.tuesday": "Tuesday",
  "directory.days.wednesday": "Wednesday",
  "directory.days.thursday": "Thursday",
  "directory.days.friday": "Friday",
  "directory.days.saturday": "Saturday",
  "directory.days.sunday": "Sunday",

  "directory.editThisListing": "Edit this listing",

  // ── Arriving (new-to-Lisbon guide) — page/section chrome only. Neighbourhood
  //    blurbs, org descriptions, community-group blurbs (`arrivingPage.data.ts`,
  //    `arrivingPageCards.data.ts`) are Lisbon city-guide content — left
  //    English, same precedent as the Cities page's per-city blurbs.
  "arriving.meta.title": "New to Lisbon? A queer newcomer's guide",
  "arriving.meta.description":
    "A practical starting guide for LGBTQ+ people new to Lisbon — welcoming neighbourhoods, health resources, housing basics, key organisations, and first steps.",
  "arriving.hero.eyebrow": "New to Lisbon",
  "arriving.hero.title": "Queer and new to Lisbon? <em>Welcome.</em>",
  "arriving.hero.body":
    "This city has a lot for us — a real, rooted queer community, welcoming neighbourhoods, organisations doing serious work, and people who will genuinely help you settle in. Here's what to know first.",
  "arriving.neighbourhoods.eyebrow": "Lisbon's neighbourhoods",
  "arriving.neighbourhoods.title": "Where queer life <em>happens.</em>",
  "arriving.neighbourhoods.intro":
    "Lisbon doesn't have one queer neighbourhood — it has several pockets, each with its own character. Here's an honest guide to where the community is.",
  "arriving.health.eyebrow": "Health",
  "arriving.health.title":
    "Healthcare in Lisbon — <em>what you need to know.</em>",
  "arriving.health.intro":
    "Portugal has a national health service (SNS) that you can register with. Trans-affirming care has improved significantly — but it takes knowing where to go.",
  "arriving.housing.eyebrow": "Housing",
  "arriving.housing.title": "Finding a place to live — <em>honestly.</em>",
  "arriving.housing.intro":
    "Lisbon's housing market is expensive and competitive. Here's an honest picture of what to expect, and where to get help.",
  "arriving.orgs.eyebrow": "Organisations",
  "arriving.orgs.title": "Know these <em>three first.</em>",
  "arriving.orgs.intro":
    "These are the organisations most likely to be useful within your first weeks in Lisbon — for legal support, mental health, or simply connecting to the community.",
  "arriving.firstStep.eyebrow": "Your first step",
  "arriving.firstStep.title": "Come to something <em>in person.</em>",
  "arriving.firstStep.intro":
    "Everything on this page is useful. But the best thing you can do is show up to a gathering. Next one coming up:",
  "arriving.firstStep.rsvpCta": "I'll be there",
  "arriving.commQuick.eyebrow": "Where to start",
  "arriving.commQuick.title": "Three communities for <em>new arrivals.</em>",
  "arriving.commQuick.intro":
    "Not sure where to begin? These three communities are particularly welcoming to people who are new to Lisbon.",
  "arriving.commQuick.browseCta": "Browse all communities",
  "arriving.outro.title": "Ready to meet <em>the community?</em>",
  "arriving.outro.sub":
    "Request an invite to QueerPulse and get access to the full network — members, gatherings, board, and everything else on this page.",
  "arriving.outro.cta": "Request an invite",

  // ── Visas & Residency — page/section chrome + the visa/legal guidance
  //    itself (platform-authored, ships in the bundle, no `api/` fetch —
  //    same status as the Constitution). Handled with extra care per the
  //    i18n brief §6: official Portuguese terms (NIF, NISS, AIMA, SNS,
  //    Certificado de Registo, União de Facto, Autorização de Residência,
  //    IFICI, recibos verdes, Conservatória) are already Portuguese and are
  //    kept byte-identical in both catalogs. The "Community note" quotes
  //    attributed to named/anonymous members, and the reviewed-lawyers'
  //    names/quotes, are testimonial content — left English, same precedent
  //    as `directoryPlaces.ts` reviews.
  "visas.meta.title": "Visas and residency in Portugal for LGBTQ+ people",
  "visas.meta.description":
    "Community guidance on EU and non-EU visa routes, residency permits, and same-sex partner immigration in Portugal, plus reviewed immigration lawyers — not legal advice.",
  "visas.hero.eyebrow": "Visas & Residency · Portugal",
  "visas.hero.title": "Portugal, legally. <em>Your path to residency.</em>",
  "visas.hero.sub":
    "Practical information about visas, residency, and citizenship in Portugal — and what queer couples and families need to know that the official guidance doesn't always say clearly.",
  "visas.hero.note":
    "Community information, not legal advice. Immigration law changes — always verify with a specialist.",
  "visas.routePicker.label": "Where are you <em>starting from?</em>",
  "visas.routePicker.euCitizen.name": "EU / EEA citizen",
  "visas.routePicker.euCitizen.desc":
    "Free movement applies. Registration is simple but required.",
  "visas.routePicker.euCitizen.cta": "EU Citizens",
  "visas.routePicker.remoteWorker.name": "Remote worker / passive income",
  "visas.routePicker.remoteWorker.desc":
    "Living on savings, rental income, freelance, or remote employment.",
  "visas.routePicker.remoteWorker.cta": "D7 Visa",
  "visas.routePicker.digitalNomad.name": "Digital nomad",
  "visas.routePicker.digitalNomad.desc":
    "Working remotely for a non-Portuguese employer, higher income.",
  "visas.routePicker.digitalNomad.cta": "Digital Nomad (D8)",
  "visas.routePicker.jobOffer.name": "Job offer in Portugal",
  "visas.routePicker.jobOffer.desc":
    "You have or are seeking employment with a Portuguese entity.",
  "visas.routePicker.jobOffer.cta": "Work Visas",
  "visas.routePicker.partner.name": "Joining a partner here",
  "visas.routePicker.partner.desc":
    "Your partner is in Portugal already or moving with you.",
  "visas.routePicker.partner.cta": "Bringing a Partner",

  "visas.tabs.eu.label": "EU Citizens",
  "visas.tabs.eu.headTitle": "EU & EEA <em>citizens</em>",
  "visas.tabs.eu.headText":
    "EU and EEA citizens have the right to live and work in Portugal without a visa. You still need to register — and for queer couples, there are specific things to know about bringing a non-EU partner.",
  "visas.tabs.eu.card1.eyebrow": "Registration",
  "visas.tabs.eu.card1.title": "Certificado de Registo",
  "visas.tabs.eu.card1.body":
    "EU citizens staying more than 3 months must register at their local Câmara Municipal. You'll need your passport, proof of address, and proof of income or employment. The certificate is usually issued the same day. Cost: €15.",
  "visas.tabs.eu.card1.tag": "Simple, low cost",
  "visas.tabs.eu.card2.eyebrow": "Your rights",
  "visas.tabs.eu.card2.title": "What EU residency gives you",
  "visas.tabs.eu.card2.body":
    "Full access to the SNS health system (with NISS), the right to work without restriction, the right to vote in local and European elections, and the right to bring family members. After 5 years of continuous legal residence, you can apply for permanent residency or citizenship.",
  "visas.tabs.eu.card3.eyebrow": "Non-EU partner",
  "visas.tabs.eu.card3.title": "Family reunification for same-sex partners",
  "visas.tabs.eu.card3.body":
    "If you're an EU citizen and your partner is not, they can join you in Portugal under EU free movement rules — including same-sex spouses and registered partners. The EU Court of Justice (Coman ruling, 2018) established that EU member states must recognise same-sex spouses for free movement purposes even if they don't have same-sex marriage domestically.",
  "visas.tabs.eu.card3.tag": "Full partner rights",
  "visas.tabs.eu.card3.link": "Partner visa details",

  "visas.tabs.d7.label": "D7 — Passive Income",
  "visas.tabs.d7.headTitle": "D7 — <em>Passive Income Visa</em>",
  "visas.tabs.d7.headText":
    'The D7 is Portugal\'s "passive income" or "retirement" visa. Despite the name, it\'s used by anyone with a stable income from remote work, freelancing, pensions, rental income, or investments. One of the most popular routes for queer people relocating to Portugal.',
  "visas.tabs.d7.card1.eyebrow": "Who it's for",
  "visas.tabs.d7.card1.title": "Eligibility",
  "visas.tabs.d7.card1.body":
    "Non-EU citizens who can demonstrate a stable passive or remote income. The minimum income threshold is roughly €820/month (the Portuguese minimum wage), but some consulates want to see significantly more. Applications are made at the Portuguese consulate in your home country before arriving.",
  "visas.tabs.d7.card1.tag": "Apply before arriving",
  "visas.tabs.d7.card2.eyebrow": "What you get",
  "visas.tabs.d7.card2.title": "Visa conditions",
  "visas.tabs.d7.card2.body":
    "Initial visa valid for 4 months; exchange for a 2-year residency permit (Autorização de Residência) on arrival in Portugal. Renewable for 3 years, then permanent residency. You must spend at least 6 months per year in Portugal to maintain it. Partners and dependent children can be included.",
  "visas.tabs.d7.card3.eyebrow": "Tax",
  "visas.tabs.d7.card3.title": "IFICI tax regime",
  "visas.tabs.d7.card3.body":
    "Portugal replaced the NHR scheme at the end of 2023 with the IFICI regime (informally called NHR 2.0). It's now targeted at qualifying professions (tech, research, arts). General D7 holders no longer qualify automatically. Your income will be taxed as a standard resident. Get tax advice before moving.",
  "visas.tabs.d7.card3.link": "Tax advice contacts",
  "visas.tabs.d7.step1.title":
    "Apply at the Portuguese consulate in your country",
  "visas.tabs.d7.step1.text":
    "Submit proof of income, clean criminal record, health insurance, and proof of accommodation in Portugal.",
  "visas.tabs.d7.step1.note": "2–8 weeks processing",
  "visas.tabs.d7.step2.title": "Arrive in Portugal with your visa",
  "visas.tabs.d7.step2.text":
    "You have 4 months to book your AIMA appointment and exchange your visa for a residency permit.",
  "visas.tabs.d7.step3.title": "AIMA appointment",
  "visas.tabs.d7.step3.text":
    "AIMA (replaced SEF in 2023) handles residency permits. Book early — waits can be long. Bring all original documents.",
  "visas.tabs.d7.step3.note": "Book online at aima.gov.pt",
  "visas.tabs.d7.step4.title": "Receive your AR card",
  "visas.tabs.d7.step4.text":
    "Your Autorização de Residência card is your proof of legal residency. Keep it safe — it's used for everything.",

  "visas.tabs.d8.label": "Digital Nomad (D8)",
  "visas.tabs.d8.headTitle": "Digital Nomad <em>Visa (D8)</em>",
  "visas.tabs.d8.headText":
    "Portugal's D8 visa, introduced in 2022, is designed for remote workers employed by or providing services to companies outside Portugal. Higher income threshold than D7 but increasingly popular.",
  "visas.tabs.d8.card1.eyebrow": "Requirements",
  "visas.tabs.d8.card1.title": "What you need to qualify",
  "visas.tabs.d8.card1.body":
    "Proof of remote employment or contracts with non-Portuguese clients. Income requirement is typically 4× the Portuguese minimum wage (roughly €3,280/month). Health insurance with Portugal coverage. Clean criminal record. Portuguese NIF (can be obtained before the visa in some cases).",
  "visas.tabs.d8.card1.tag": "Higher income bar than D7",
  "visas.tabs.d8.card2.eyebrow": "Process",
  "visas.tabs.d8.card2.title": "How to apply",
  "visas.tabs.d8.card2.body":
    "Like the D7, applications are made at the Portuguese consulate before arrival. On arrival, you exchange for a 2-year residency permit. Family members (including same-sex partners) can be included on the application or apply for family reunification after you receive your permit.",
  "visas.tabs.d8.card3.eyebrow": "IFICI / Tax",
  "visas.tabs.d8.card3.title": "Tax treatment",
  "visas.tabs.d8.card3.body":
    "D8 holders working in qualifying tech or research roles may qualify for the IFICI regime (20% flat income tax for up to 10 years). This is not automatic — you must apply and your profession must qualify. Check with a tax specialist before assuming you'll benefit.",
  "visas.tabs.d8.card3.link": "Tax advice",

  "visas.tabs.work.label": "Work Visas",
  "visas.tabs.work.headTitle": "Work <em>visas</em>",
  "visas.tabs.work.headText":
    "If you have a job offer from a Portuguese employer, or are seeking one, there are specific visa routes. These are generally more straightforward than passive income visas but require employer involvement.",
  "visas.tabs.work.card1.eyebrow": "D1 visa",
  "visas.tabs.work.card1.title": "Employment visa",
  "visas.tabs.work.card1.body":
    "The standard route for non-EU workers with a job offer from a Portuguese employer. Your employer usually needs to show they couldn't fill the role with an EU citizen first, though this requirement is often waived in practice for skilled roles. Apply at the consulate with your employment contract.",
  "visas.tabs.work.card2.eyebrow": "Job seeker",
  "visas.tabs.work.card2.title": "Job Seeker Visa",
  "visas.tabs.work.card2.body":
    "180-day visa allowing you to come to Portugal to find work. Requires proof of sufficient funds and qualifications. Once you find a job, you can convert to a D1 work visa without leaving the country. Useful if you want to arrive before securing employment.",
  "visas.tabs.work.card2.tag": "180 days to find work",
  "visas.tabs.work.card3.eyebrow": "Self-employed",
  "visas.tabs.work.card3.title": "Independent worker (D2)",
  "visas.tabs.work.card3.body":
    "For freelancers and independent professionals who have identified clients or opportunities in Portugal. You'll need a business plan and evidence of prospective income. Registering as a trabalhador independente (recibos verdes) is the tax structure most self-employed residents use.",

  "visas.tabs.partner.label": "Bringing a Partner",
  "visas.tabs.partner.headTitle": "Bringing a <em>partner</em>",
  "visas.tabs.partner.headText":
    "Portugal recognises same-sex marriage, civil partnership, and long-term cohabitation. What this means for residency depends on your nationalities and which visa route you're using — but the community news is broadly good.",
  "visas.tabs.partner.card1.eyebrow": "Same-sex marriage",
  "visas.tabs.partner.card1.title": "Portugal fully recognises your marriage",
  "visas.tabs.partner.card1.body":
    "Portugal has recognised same-sex marriage since 2010. A legal marriage anywhere in the world is recognised for residency purposes in Portugal. Your spouse is entitled to join you under family reunification — regardless of their nationality or the country where you married.",
  "visas.tabs.partner.card1.tag": "Full legal recognition",
  "visas.tabs.partner.card2.eyebrow": "Not married",
  "visas.tabs.partner.card2.title": "Partners without formal status",
  "visas.tabs.partner.card2.body":
    "If you're not married, long-term cohabitation (união de facto, typically 2+ years) is recognised for family reunification purposes. You'll need to document your relationship — shared bills, joint accounts, correspondence. Getting married or entering a civil partnership first is often simpler administratively.",
  "visas.tabs.partner.card3.eyebrow": "EU citizen + non-EU partner",
  "visas.tabs.partner.card3.title": "The Coman ruling",
  "visas.tabs.partner.card3.body":
    "The 2018 EU Court of Justice ruling (Coman v. Romania) established that EU member states must recognise same-sex spouses of EU citizens for the purposes of free movement — even countries that don't have same-sex marriage. This means an EU citizen can bring their same-sex spouse to Portugal regardless of their home country's stance.",
  "visas.tabs.partner.card3.tag": "EU court protection",
  "visas.tabs.partner.card3.link": "Talk to an immigration lawyer",
  "visas.tabs.partner.card4.eyebrow": "Family reunification",
  "visas.tabs.partner.card4.title": "The process for partners",
  "visas.tabs.partner.card4.body":
    "Once you have your own residency permit, your partner applies for family reunification at AIMA. They'll need your AR card, proof of the relationship, proof of accommodation, and income evidence. Processing takes 60–90 days. During this time they can usually remain in Portugal on a short-stay visa.",

  "visas.tabs.citizenship.label": "Citizenship",
  "visas.tabs.citizenship.headTitle":
    "Citizenship & <em>permanent residency</em>",
  "visas.tabs.citizenship.headText":
    "Portugal offers one of the clearer paths to citizenship in Europe. After 5 years of legal residency, you can apply for either permanent residency or naturalisation as a Portuguese citizen.",
  "visas.tabs.citizenship.card1.eyebrow": "Timeline",
  "visas.tabs.citizenship.card1.title": "5 years to citizenship",
  "visas.tabs.citizenship.card1.body":
    "After 5 years of continuous legal residency, you're eligible to apply for Portuguese citizenship. Requirements: basic Portuguese language (A2 level), clean criminal record, proof of ties to Portugal, and no absence of more than 6 consecutive months or 8 months total during the 5 years.",
  "visas.tabs.citizenship.card1.tag": "EU passport included",
  "visas.tabs.citizenship.card2.eyebrow": "Permanent residency",
  "visas.tabs.citizenship.card2.title": "Alternative to citizenship",
  "visas.tabs.citizenship.card2.body":
    "You can also apply for permanent residency (Autorização de Residência Permanente) after 5 years. This gives you indefinite right to remain without the language and citizenship requirements. Some people prefer this route while maintaining their original nationality.",
  "visas.tabs.citizenship.card3.eyebrow": "Portuguese language",
  "visas.tabs.citizenship.card3.title": "A2 requirement",
  "visas.tabs.citizenship.card3.body":
    "The Portuguese language requirement for citizenship is A2 (basic) — conversational rather than fluent. You can demonstrate this via an approved CAPLE or CIPLE test, or by showing Portuguese-medium education. The community forum has recommendations for Portuguese teachers who are queer-friendly.",
  "visas.tabs.citizenship.card3.link": "Language learning resources",

  "visas.ground.title": "On the <em>ground</em>",
  "visas.ground.sub": "Practical first steps regardless of your visa route.",
  "visas.ground.nif.label": "First",
  "visas.ground.nif.title": "NIF — Tax number",
  "visas.ground.nif.body":
    "You need a Número de Identificação Fiscal for almost everything: opening a bank account, signing a lease, buying a phone plan. Get it at the Finanças office with your passport. EU citizens: bring passport. Non-EU: bring passport + address proof. Can also use a fiscal representative service if you're not yet in Portugal.",
  "visas.ground.niss.label": "Second",
  "visas.ground.niss.title": "NISS — Social security",
  "visas.ground.niss.body":
    "Your Número de Identificação de Segurança Social gives you access to SNS healthcare and records contributions. Register at your local Centro de Emprego e Formação Profissional or Segurança Social office. Required before you can access SNS appointments.",
  // Note: the source component (`visas.data.ts`) said "NHS appointments"
  // here — the UK's health service, not Portugal's. Corrected to SNS per the
  // i18n brief's "flag/fix an English-source bug, don't faithfully translate
  // it" rule; flagged in the sweep report.
  "visas.ground.aima.label": "Key office",
  "visas.ground.aima.title": "AIMA",
  "visas.ground.aima.body":
    "AIMA (Agência para a Integração, Migrações e Asilo) replaced SEF in October 2023. It handles all residency permits, renewals, and family reunification. Book appointments online at aima.gov.pt — waits are long, book immediately on arrival.",
  "visas.ground.sns.label": "Healthcare",
  "visas.ground.sns.title": "SNS access",
  "visas.ground.sns.body":
    "Register with a GP (Centro de Saúde) in your area using your AR card or EU registration certificate plus NISS. Wait times are long — many community members use private health insurance alongside SNS access. See the Wellbeing page for queer-friendly healthcare providers.",

  "visas.lawyers.title": "Community-reviewed <em>immigration lawyers</em>",
  "visas.lawyers.emptyBody":
    "We're building a community-reviewed directory of LGBTQ+-friendly immigration lawyers. It isn't ready yet — until it is, the best recommendations come from members who've been through the process. Ask in the visa forum thread.",
  "visas.lawyers.forumCta": "Ask the visa forum thread",

  "visas.outro.title": "You're building a life <em>here.</em>",
  "visas.outro.sub": "The paperwork is temporary. The community is permanent.",
  "visas.outro.settlingCta": "Settling in guide",
  "visas.outro.askCta": "Ask the community",

  // ── Map (queer Lisbon city guide) — page/filter/sidebar chrome. Venue
  //    names/addresses/hours/notes (`map.data.ts`) are business-directory
  //    content — left English, same precedent as `directoryPlaces.ts`.
  //    Bairro (neighbourhood) names are Lisbon proper nouns — kept identical.
  //    Filter `type`/`vibe` ids stay canonical English strings (stored/filter
  //    values); only their display labels below are translated.
  "map.filter.type.all": "All",
  "map.filter.type.bar": "Bar",
  "map.filter.type.club": "Club",
  "map.filter.type.cafe": "Café",
  "map.filter.type.clinic": "Clinic",
  "map.filter.type.bookshop": "Bookshop",
  "map.filter.type.sauna": "Sauna",
  "map.filter.type.communitySpace": "Community",
  "map.filter.type.barbershop": "Barbershop / Salon",
  "map.filter.type.gym": "Gym / Fitness",
  "map.filter.vibe.mixed": "mixed",
  "map.filter.vibe.mascLeaning": "masc-leaning",
  "map.filter.vibe.femmeLeaning": "femme-leaning",
  "map.filter.vibe.transCentred": "trans-centred",
  "map.filter.vibe.soberFriendly": "sober-friendly",
  "map.sidebar.allVenues": "All places",
  "map.sidebar.venueCount_one": "<b>{count}</b> place",
  "map.sidebar.venueCount_other": "<b>{count}</b> places",
  "map.sidebar.clear": "Clear",
  "map.sidebar.empty": "No places match these filters.",
  "map.jumpToList": "View the list · {count}",
  "map.venueCard.beenCount_one": "<b>{count}</b> person been here",
  "map.venueCard.beenCount_other": "<b>{count}</b> people been here",
  "map.venueCard.beenThere": "Been there",
  "map.venueCard.markBeen": "I've been here",
  // Bairro is a Lisbon proper noun — identical in both catalogs, only the
  // surrounding phrase is translated.
  "map.svg.filterByAria": "Filter the map by {bairro}",
  "map.mapError": "The map could not load. The venue list below still works.",
  "map.mapLoading": "Bringing the map to <em>life</em>…",
  "map.pinAria": "{name} — {type}",
  "map.clusterAria_one": "{count} place here — zoom in",
  "map.clusterAria_other": "{count} places here — zoom in",

  // ── Local — combined list/map venue explorer.
  "local.cat.nightlife": "Nightlife",
  "local.view.list": "List",
  "local.view.map": "Map",
  "local.view.toggleAria": "Choose list or map view",
  "local.card.seeFullDetails": "See full details",
  "local.filter.searchPlaceholder": "Search places and venues…",
  "local.filter.categoryAria": "Filter by category",
  "local.filter.refine": "Refine",
  "local.filter.vibeLabel": "Vibe",
  "local.filter.vibeVenueNote": "Vibe filters apply to venues",
  "local.filter.verifiedSafeSpaces": "Verified safe spaces",
  "local.filter.filters": "Filters",
  "local.filter.showResults_one": "Show {count} place",
  "local.filter.showResults_other": "Show {count} places",
  "local.venue.back": "Back to the map",
  "local.venue.address": "Address",
  "local.venue.hours": "Hours",
  "local.venue.accessible": "Wheelchair accessible",
  "local.venue.onMap": "See it on the map",
  "local.venue.been_one": "{count} person has been here",
  "local.venue.been_other": "{count} people have been here",

  // ── Constitution — governance/constitutional copy (`ConstitutionPage.tsx`,
  //    `constitution.data.tsx`). Platform-authored, ships in the bundle, no
  //    `api/` fetch. Precise and literal per the i18n brief §6 — numbers,
  //    percentages, and clause references are kept exact; nothing
  //    editorialised. "Associação QueerPulse", "NIPC", and "ILGA Portugal"
  //    are proper nouns, kept identical in both catalogs.
  //    `hero.dek3` / `hero.meta` are a deliberate content *adaptation*, not a
  //    literal translation: the English page frames itself as "the English
  //    translation" of a Portuguese-original document, which is a joke/frame
  //    that only makes sense when the reader is looking at the English
  //    version. In the pt-PT rendering that framing is nonsensical (the
  //    reader is already reading Portuguese), so the pt-PT copy drops the
  //    "this is the English translation" meta-reference rather than
  //    faithfully mistranslating it — flagged in the sweep report.
  "constitution.meta.title": "QueerPulse's constitution: twelve plain articles",
  "constitution.meta.description":
    "The constitution of Associação QueerPulse — twelve plain-language articles on purpose, membership and governance, ratified 14 November 2025.",
  "constitution.artNumLabel": "Article",
  "constitution.hero.eyebrow": "Constitution · v1.4 · ratified 14 Nov 2025",
  "constitution.hero.title":
    "The <em>rulebook,</em> in plain Portuguese-flavoured English.",
  "constitution.hero.dek1":
    "The formal organising document of <b>Associação QueerPulse</b>, the not-for-profit that operates the platform. Written by the founding eight. Ratified at the first assembly. <em>Amended four times since.</em>",
  "constitution.hero.dek2":
    "It is intentionally short. Twelve articles, plain language, no nested sub-clauses. Anything more elaborate lives in the Code of Conduct, the bylaws, or the resolutions of the Annual Assembly.",
  "constitution.hero.meta":
    "<b>Registered:</b> Associação QueerPulse · NIPC 517 426 884 · Lisbon · <b>Original:</b> Portuguese (legally binding) · this is the English translation.",

  "constitution.art1.toc": "I · Purpose",
  "constitution.art1.title": "Purpose",
  "constitution.art1.clause1":
    "QueerPulse exists to provide <strong>professional, social, cultural and material support</strong> to LGBTQ+ people in the city of Lisbon, and (per Article X) in other cities once specific conditions are met.",
  "constitution.art1.clause2":
    "The organisation is a <strong>não-lucrativa associação</strong> — a not-for-profit association. It owns no equity, distributes no profits, and may only be dissolved per Article XI.",
  "constitution.art1.clause3":
    "Where this Constitution conflicts with the Manifesto, this document prevails. The Manifesto sets values; this sets operations.",

  "constitution.art2.toc": "II · Members",
  "constitution.art2.title": "Members",
  "constitution.art2.clause1":
    "A <strong>member</strong> is any individual who has been vouched for by an existing member, completed a brief check-in with the moderation team, and accepted the Code of Conduct.",
  "constitution.art2.clause2":
    "Members may be on any of three tiers: <em>Solidarity</em> (free), <em>Member</em> (€36/year), or <em>Sustainer</em> (€96/year). All tiers carry equal voting rights.",
  "constitution.art2.clause3":
    "No member's status — including age, nationality, language, identity, occupation, or visibility — affects their voting rights or treatment in moderation.",

  "constitution.art3.toc": "III · Vouching",
  "constitution.art3.title": "Vouching",
  "constitution.art3.clause1":
    "Each existing member may vouch for up to <strong>two</strong> new members per calendar year. Vouches attach the voucher's name to the new member's record, permanently.",
  "constitution.art3.clause2":
    "The invite cap may be temporarily raised by Assembly vote to a maximum of four per member, for one calendar year, in cases of identified network gaps.",
  "constitution.art3.clause3":
    "A member whose three most recent vouches have all been removed under Article VIII forfeits the right to vouch for twelve months.",

  "constitution.art4.toc": "IV · Assembly",
  "constitution.art4.title": "The Annual <em>Assembly</em>",
  "constitution.art4.clause1":
    "The Assembly convenes once per year, in November, for at least one full day. It is the highest decision-making body of the association.",
  "constitution.art4.clause2":
    "Every member is entitled to one vote per resolution, cast in person, online, or asynchronously up to the close of voting.",
  "constitution.art4.clause3":
    "Quorum is <strong>10% of active members</strong>, or 100 members, whichever is greater. Resolutions pass by simple majority unless this document or the Code of Conduct specifies otherwise.",
  "constitution.art4.clause4":
    "The agenda is published 30 days in advance and is open to written amendment by any 10 members until 7 days before convening.",
  "constitution.art4.quote":
    '"This Assembly is the floor on which everything else stands. <em>Lose it, and you have only an app.</em>"',

  "constitution.art5.toc": "V · Circles",
  "constitution.art5.title": "Rotating <em>circles</em>",
  "constitution.art5.clause1":
    "Operational decisions are made by <strong>rotating circles</strong>: small standing committees of 3–7 members each, with 12-month maximum terms.",
  "constitution.art5.clause2":
    "Active circles as of v1.4: <em>moderation, grants, finance, hosting, editorial, technical.</em> The Assembly may add or dissolve circles by simple majority.",
  "constitution.art5.clause3":
    "No member may serve on more than two circles simultaneously, and no circle may have more than half its members from any single calendar-year cohort.",

  "constitution.art6.toc": "VI · Money",
  "constitution.art6.title": "Money",
  "constitution.art6.clause1":
    "<strong>At least 90% of every euro received</strong> must be spent on community programmes, staff, and infrastructure — not on overheads. The target is 96% and has been met every year since 2024.",
  "constitution.art6.clause2":
    "The annual budget is approved by the Assembly. The finance circle may rebalance within categories during the year without re-approval, up to 10% per category.",
  "constitution.art6.clause3":
    "Annual accounts are <strong>audited by an independent third party</strong> with no financial relationship to the association, and published in full as part of the Transparency Report.",
  "constitution.art6.clause4":
    "The association may not enter into debt arrangements above €10,000 without explicit Assembly approval.",

  "constitution.art7.toc": "VII · Speech",
  "constitution.art7.title": "Speech & <em>moderation</em>",
  "constitution.art7.clause1":
    "The community is moderated according to the Code of Conduct, ratified separately and amendable by Assembly supermajority (60%).",
  "constitution.art7.clause2":
    "<strong>The association does not moderate criticism of itself.</strong> Posts critical of the association, its decisions, or its officers may not be removed under any clause of the Code of Conduct.",
  "constitution.art7.clause3":
    "Moderation decisions are appealable to a standing appeals panel composed of three members not from the deciding circle. Appeals overturn decisions in approximately 11% of cases (2025 figure).",

  "constitution.art8.toc": "VIII · Removal",
  "constitution.art8.title": "Removal",
  "constitution.art8.clause1":
    "Members may be removed only through the moderation ladder specified in §04 of the Code of Conduct, and only by decision of the moderation circle, ratified by one additional independent moderator.",
  "constitution.art8.clause2":
    "Removal is appealable <strong>once</strong>, to the appeals panel, within 14 days of effective date.",
  "constitution.art8.clause3":
    "A removed member's data is deleted or anonymised per the Privacy Policy within 30 days. Case records are kept for 36 months in case of legal need.",

  "constitution.art9.toc": "IX · Partners",
  "constitution.art9.title": "Partners",
  "constitution.art9.clause1":
    "The association may enter into <strong>operational partnerships</strong> with other organisations under terms approved by the Assembly. New operational partnerships are capped at two per year.",
  "constitution.art9.clause2":
    "No partnership may grant a partner organisation access to member data beyond what is operationally necessary, and only with the affected member's explicit consent.",
  "constitution.art9.clause3":
    "Either side of any partnership may publicly dissent from the other's positions. <em>Coalition is not consensus.</em>",

  "constitution.art10.toc": "X · Expansion",
  "constitution.art10.title": "Expansion",
  "constitution.art10.clause1":
    "The association may open in cities other than Lisbon only when all of these are true: (a) at least one moderator is in-country; (b) an operational local partner is signed; (c) a local legal review is complete; (d) eight to twelve founding members have committed to the soft-launch.",
  "constitution.art10.clause2":
    "Each new city ratifies its own local circle and operates under this Constitution, with city-specific bylaws as needed.",

  "constitution.art11.toc": "XI · Dissolution",
  "constitution.art11.title": "Dissolution",
  "constitution.art11.clause1":
    "The association may be dissolved only by Assembly resolution requiring a <strong>75% supermajority</strong> of all active members, not merely of those voting.",
  "constitution.art11.clause2":
    "On dissolution, all remaining assets must be transferred to a registered LGBTQ+ rights organisation chosen by the dissolving Assembly. No assets may be distributed to individuals.",

  "constitution.art12.toc": "XII · Amendments",
  "constitution.art12.title": "Amendments",
  "constitution.art12.clause1":
    "This Constitution may be amended only by Assembly resolution requiring a 60% supermajority of votes cast.",
  "constitution.art12.clause2":
    "Amendments must be circulated for written comment to all members at least 30 days before the vote.",
  "constitution.art12.clause3":
    "Versioning is sequential (v1.0, v1.1…). The current version's full text is published at all times.",

  "constitution.footer.version":
    "<b>Constitution v1.4</b> · ratified 14 Nov 2025 · in force since 1 Jan 2026 ·",
  "constitution.footer.downloadPdf": "Download PDF",
  "constitution.footer.seeAssembly": "See the Assembly",
  "constitution.footer.readCodeOfConduct": "Read the Code of Conduct",

  // ── Resource Library — page/filter/card chrome. `RESOURCES` entries
  //    (name/desc/tags — curated external orgs and QueerPulse tools) are
  //    directory-style content, same precedent as `directoryPlaces.ts` /
  //    the Platforms page below — left English. `LIBRARY_SUBPAGES`
  //    label/blurb are short platform-authored teaser chrome — translated.
  "resourceLibrary.meta.title":
    "Queer resources in Lisbon: health, legal, housing and money support",
  "resourceLibrary.meta.description":
    "Things that actually help — a curated library of free and sliding-scale health, legal, housing, money, identity and safety resources for queer Lisbon.",
  "resourceLibrary.hero.eyebrow": "Resource Library",
  "resourceLibrary.hero.title": "Things that <em>actually help.</em>",
  "resourceLibrary.hero.sub":
    "Community-maintained guides, organisations, contacts, and QueerPulse tools — in one searchable place.",
  "resourceLibrary.stats.resources": "resources",
  "resourceLibrary.stats.categories": "categories",
  "resourceLibrary.stats.communityLabel": "Community",
  "resourceLibrary.stats.maintained": "maintained",
  "resourceLibrary.search.placeholder": "Search resources…",
  "resourceLibrary.category.all": "All",
  "resourceLibrary.category.health": "Health",
  "resourceLibrary.category.legal": "Legal",
  "resourceLibrary.category.housing": "Housing",
  "resourceLibrary.category.money": "Money",
  "resourceLibrary.category.identity": "Identity",
  "resourceLibrary.category.safety": "Safety",
  "resourceLibrary.category.community": "Community",
  "resourceLibrary.results_one": "{count} result",
  "resourceLibrary.results_other": "{count} results",
  "resourceLibrary.empty": "No resources match — try a broader filter.",
  "resourceLibrary.cost.free": "Free",
  "resourceLibrary.cost.sliding": "Sliding scale",
  "resourceLibrary.card.openGuide": "Open guide",
  "resourceLibrary.card.visitSite": "Visit site ↗",
  "resourceLibrary.outro.title": "Know something <em>missing?</em>",
  "resourceLibrary.outro.sub":
    "Every resource here was added by a community member. If something helped you and isn't listed, tell us.",
  "resourceLibrary.outro.cta": "Suggest a resource",
  "resourceLibrary.subpages.eyebrow": "Learn & belong",
  "resourceLibrary.subpages.title": "Start with the basics",
  "resourceLibrary.subpages.queer101.label": "Queer 101",
  "resourceLibrary.subpages.queer101.blurb":
    "New here? Start with the basics — identities, language, and community.",
  "resourceLibrary.subpages.glossary.label": "Glossary",
  "resourceLibrary.subpages.glossary.blurb":
    "Plain-language definitions for the words the community uses.",
  "resourceLibrary.subpages.intersectionality.label": "Intersectionality",
  "resourceLibrary.subpages.intersectionality.blurb":
    "How overlapping identities shape our experiences — and our organising.",

  // ── Platforms (the wider queer web) — page/filter chrome. `PLATFORMS`
  //    entries (name/desc — named third-party apps/orgs) are directory-style
  //    content, same precedent as Resource Library above — left English.
  "platforms.meta.title": "Queer platforms and organisations worth knowing",
  "platforms.meta.description":
    "A directory of dating apps, media, professional networks and advocacy organisations useful to queer people — including Portugal-specific groups like ILGA Portugal.",
  "platforms.hero.eyebrow": "Queer platforms",
  "platforms.hero.title": "The wider <em>queer web.</em>",
  "platforms.hero.sub":
    "Apps, media, professional networks, and advocacy organisations that are genuinely useful for queer people — beyond QueerPulse itself.",
  "platforms.filter.all": "All",
  "platforms.filter.dating": "Dating & Social",
  "platforms.filter.media": "News & Media",
  "platforms.filter.professional": "Professional Networks",
  "platforms.filter.advocacy": "Advocacy & Rights",
  "platforms.filter.health": "Health & Wellbeing",
  "platforms.filter.portugal": "Portugal & Lisbon",
  "platforms.note.body":
    "<b>A note on this list:</b> We include platforms we think are genuinely useful for queer people. This is not an endorsement of any company's practices. Always make your own informed choices about data, safety, and privacy — especially on dating and social apps.",
  "platforms.outro.title": "Something missing? <em>Tell us.</em>",
  "platforms.outro.sub":
    "Know a platform, resource, or community that should be here? Suggest it and we'll add it to the directory.",
  "platforms.outro.cta": "Suggest a platform",

  // ── Submit Partner Application — "Apply to partner" form chrome
  //    (`SubmitPartnerApplicationPage.tsx`, `SubmitPartnerFields.tsx`,
  //    `submitPartnerApplication.data.ts`, `useSubmitPartnerForm.ts`). All
  //    platform-authored form/validation copy. `REGION_OPTIONS`/
  //    `DEFAULT_REGION_LABEL` keep the canonical `Region` id ("pt"/"eu"/
  //    "int") as the stored value; only the displayed label is translated
  //    (i18n brief §5.1).
  "submitPartner.hero.eyebrow": "Partners · Apply",
  "submitPartner.hero.title": "Apply to <em>partner.</em>",
  "submitPartner.hero.sub":
    "QueerPulse partnerships are operational, not promotional. Tell us who you are and what you do — honestly — and we'll read every word.",
  "submitPartner.success.title": "Application",
  "submitPartner.success.em": "received.",
  "submitPartner.success.closeLabel": "Back to partners",
  "submitPartner.success.step1":
    "It's pending review with the partnerships team",
  "submitPartner.success.step2":
    "We read every application, not just the tidy ones",
  "submitPartner.success.step3":
    "We'll be in touch — a yes, a not-yet, or a question",
  "submitPartner.success.body":
    "Thank you for reaching out. Your application is in — nothing goes live until we've talked it through with you.",
  "submitPartner.actions.sending": "Sending…",
  "submitPartner.actions.submit": "Submit application",
  "submitPartner.actions.cancel": "Cancel",
  "submitPartner.error.toast":
    "Couldn't send your application — please try again.",

  "submitPartner.fields.sectionOrg": "Your organisation",
  "submitPartner.fields.name.label": "Organisation name",
  "submitPartner.fields.name.placeholder": "e.g. Casa T",
  "submitPartner.fields.orgType.label": "Organisation type",
  "submitPartner.fields.orgType.helper":
    "Just the kind of organisation you are — we add the “Partner ·” label.",
  "submitPartner.fields.orgType.placeholder": "e.g. Community health clinic",
  "submitPartner.fields.city.label": "City / base",
  "submitPartner.fields.city.placeholder": "e.g. Lisbon",
  "submitPartner.fields.region.label": "Region",
  "submitPartner.fields.logo.label": "Logo mark",
  "submitPartner.fields.logo.derivedHelper":
    "Auto-filled from your name — edit it if you'd rather set the badge yourself.",
  "submitPartner.fields.logo.placeholder": "e.g. CT",
  "submitPartner.fields.sectionPitch": "The pitch",
  "submitPartner.fields.tagline.label": "One-line tagline",
  "submitPartner.fields.tagline.helper":
    "The single sentence that captures what you do.",
  "submitPartner.fields.tagline.placeholder":
    "A Lisbon drop-in where nobody waits for care alone.",
  "submitPartner.fields.desc.label": "Short description",
  "submitPartner.fields.desc.helper":
    "One or two sentences shown on the listing card.",
  "submitPartner.fields.desc.placeholder":
    "What your organisation does, in plain language, and who it serves in Lisbon.",
  "submitPartner.fields.tags.label": "Tags",
  "submitPartner.fields.tags.pickerHelper": "Pick up to 3 that fit your work.",
  "submitPartner.fields.tags.count": "{count}/{max}",
  "submitPartner.fields.sectionContact": "How to reach you",
  "submitPartner.fields.website.label": "Website",
  "submitPartner.fields.website.placeholder": "e.g. casat.pt",
  "submitPartner.fields.email.label": "Contact email",
  "submitPartner.fields.email.placeholder": "e.g. ola@casat.pt",
  "submitPartner.fields.requiredError": "This field is required.",
  "submitPartner.form.sinceDefault": "Applying · {year}",

  "submitPartner.region.pt": "Portugal",
  "submitPartner.region.eu": "Europe",
  "submitPartner.region.int": "International",

  "submitPartner.tips.readEvery.title": "We read every application",
  "submitPartner.tips.readEvery.body":
    "Partnerships here are operational, not promotional. Tell us what your organisation actually does and who it serves — not a mission statement.",
  "submitPartner.tips.sharedValues.title": "Shared values, not brand alignment",
  "submitPartner.tips.sharedValues.body":
    "We prioritise organisations that centre the identities marginalised within queer spaces as well as outside them. Say where your work sits.",
  "submitPartner.tips.whatNext.title": "What happens next",
  "submitPartner.tips.whatNext.body":
    "Your application arrives as pending. A member of the team reviews it, and we'll be in touch — whether it's a yes, a not-yet, or a question.",

};

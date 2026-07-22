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
  "accessibility.backLabel": "← Help",
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
  "activism.local.letter.title": "Sign the open letter",
  "activism.local.letter.body":
    "<b>{signatures}</b> of {target} signatures — hand-delivered to the Câmara Municipal once we reach the target.",
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
  "activism.volunteer.expressInterestCta": "Express interest →",
  "activism.volunteer.seeAllCta": "See all volunteer roles",
  "activism.outro.title": "Pick a rung. <em>Start today.</em>",
  "activism.outro.sub":
    "The Board is where every listed role lives, refreshed as organisations post new ones.",
  "activism.outro.seeBoardCta": "See the volunteer board",

  // ── Code of Conduct ────────────────────────────────────────────────────
  "coc.meta.title": "QueerPulse's Code of Conduct: what's enforceable",
  "coc.meta.description":
    "The binding Code of Conduct QueerPulse enforces — six commitments members make, what counts as harm, how reports are handled, and how to appeal a decision.",
  "coc.hero.backLabel": "← Governance",
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
  "coc.report.emergencyCta": "This is an emergency",
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
  "dsar.backToPrivacyLabel": "← Privacy Policy",
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
  "dsar.past.heading": "Your past requests",
  "dsar.past.submitted": "Submitted {date}",
  "dsar.past.responded": "Responded {date}",
  "dsar.past.respondedWithDuration": "Responded {date} · {duration}",
  "dsar.past.resolved": "Resolved",
  "dsar.past.objectAnalytics": "Objection · Analytics",
  "dsar.toast.submitted": "Request submitted — reference {ref}",

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
    "Yes — membership is free at the solidarity tier. Paid <link>Sustainer tiers</link> exist for anyone who wants to support the platform financially.",
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
  "help.qa.becomeSupporter.q": "How do I become a Sustainer?",
  "help.qa.becomeSupporter.a":
    "Visit the <membershipLink>Sustainer page</membershipLink> to pick a tier — it's entirely optional support, not a requirement to use the platform.",
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

  // ── Manifesto ──────────────────────────────────────────────────────────
  "manifesto.meta.title": "The QueerPulse manifesto: what we believe",
  "manifesto.meta.description":
    "The founding document behind QueerPulse — written by the founding circle and ratified by the community. Read what we believe, then add your name.",
  "manifesto.hero.eyebrow": "The Manifesto",
  "manifesto.hero.title": "We build for <em>each other.</em>",
  "manifesto.hero.attrib":
    "Written by the founding circle, <b>ratified by the community.</b>",
  "manifesto.toast.signed": "Thanks for adding your name.",

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
  "partners.card.viewCta": "View profile →",
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
    "All assets are released under CC BY 4.0 for editorial use. Contact press@queerpulse.app for commercial licensing.",
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
    "We'll notify members of material changes by email and an in-app notice before they take effect.",
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
    "We'll notify members of material changes by email and an in-app notice before they take effect.",
  "terms.changesTerms.p2":
    "Continuing to use QueerPulse after changes take effect means you accept the updated terms.",
  "terms.law.title": "Governing law",
  "terms.law.p1": "These terms are governed by Portuguese law.",
  "terms.law.p2":
    "Any disputes will be resolved in the courts of Lisbon, Portugal, unless local consumer-protection law requires otherwise.",
  "terms.contactSection.title": "Contact",
  "terms.contactSection.body":
    "Questions about these terms? Email <a>hello@queerpulse.pt</a> and a real person will respond.",

  // ── Manifesto body (the founding document — platform-authored, ships in
  //    the bundle in both modes, so it's chrome under the scope rule).
  //    Signer names stay English: fictional people's own names.
  "manifesto.stanza01.title": "Slower is <em>kinder.</em>",
  "manifesto.stanza01.p1":
    "We are not racing to scale. We do not want more members; we want <em>the right ones</em>. We will grow at the pace at which the community can absorb new arrivals — vouched-for, welcomed, integrated. If that means we are smaller than we could be, we will be smaller than we could be.",
  "manifesto.stanza01.p2":
    "The other platforms are engineered to keep you scrolling; your attention is the product they measure and sell. We sell nothing. There are no follower counts, no algorithm choosing what you see, no “for you” feed competing for your evening. <strong>Time spent here is meant to add up to time off the platform</strong> — at gatherings, in studios, at clinics, with friends.",
  "manifesto.stanza02.title": "Vouched, not <em>verified.</em>",
  "manifesto.stanza02.p1":
    "Membership is by invitation, and every invitation is signed by a name. If you are here, someone you have actually met said you should be. If you stay, you'll eventually do the same for someone else. This is not exclusivity. It is <em>accountability</em>.",
  "manifesto.stanza02.p2":
    "“Verified” is a corporate word. It assumes a centre that can decide who you are. We don't. The community decides — together, slowly, and with the receipts of in-person time.",
  "manifesto.pull1":
    "We do not put rainbow logos on anything. <em>The work speaks.</em>",
  "manifesto.stanza03.title": "Safety is <em>infrastructure.</em>",
  "manifesto.stanza03.p1":
    "A queer professional network without a hate-crime bridge to ILGA is a logo, not a network. So is one without therapists vetted by the community, a safe-spaces map that is actually maintained, and an open clinic night that meets every month at Café Beirão. <strong>If we cannot operationally protect each other, we are not a network.</strong>",
  "manifesto.stanza03.p2":
    "Quick-exit lives in the nav. Crisis chat is one tap. Mercearia Rosa's back door opens to Penha de França. None of these are features. They are the floor.",
  "manifesto.stanza04.title": "Money moves <em>sideways.</em>",
  "manifesto.stanza04.p1":
    "Sustainer members pay €96 a year. That pays for staff, infrastructure, and the things that have to keep running. Above that, every euro is allocated <em>sideways</em> — into a fund that disperses in €50–200 grants, decided by a rotating circle, distributed in 14 days. <strong>96% of every euro goes to programs.</strong> Full breakdown, every year, in the governance report.",
  "manifesto.stanza04.p2":
    "Work moves sideways too. The professional network that was supposed to connect us only ever sold us back to recruiters. Here, members hire, mentor, commission, and rent from each other — and the value <em>stays with us</em> instead of being skimmed off the top.",
  "manifesto.stanza04.p3":
    "There is a solidarity rate. It is genuinely free. We do not ask why.",
  "manifesto.pull2":
    "If you cannot pay, that is information about <em>the world</em>, not about you.",
  "manifesto.stanza05.title": "Lisbon, on <em>purpose.</em>",
  "manifesto.stanza05.p1":
    "We are based in a place. Specifically: Anjos, Mouraria, Graça, Alfama, Bairro Alto, Marvila, and the bus routes that connect them. A queer network rooted in nowhere is a feed. A queer network rooted somewhere — in a city you can walk across in an hour, with venues and chapters and a Câmara Municipal — is a network.",
  "manifesto.stanza05.p2":
    "We will expand to other cities only when there is a community there asking us to. Not before. <strong>Porto is next.</strong> Then Madrid. Then we stop and re-think.",
  "manifesto.stanza06.title": "Disagreement is <em>included.</em>",
  "manifesto.stanza06.p1":
    "We have, twice, publicly disagreed with our oldest partner ILGA Portugal. We will do it again. Coalition is not consensus. We do not speak for every queer person, and no one speaks for us. The forum hosts arguments that we expect to remain unresolved. The Assembly votes on what cannot be left unresolved.",
  "manifesto.stanza06.p2":
    "Moderation is not neutrality. We will remove cruelty. We will not remove inconvenience.",
  "manifesto.stanza07.title": "Hold all of <em>this loosely.</em>",
  "manifesto.stanza07.p1":
    "This document is wrong about something. We don't know what. The 2025 revision changed eleven sentences. The 2026 revision will change more. Manifestos that don't update are gravestones. <em>This one updates.</em>",
  "manifesto.stanza07.p2":
    "If you are reading this and something feels off, write to <a>manifesto@queerpulse.app</a>. A real person reads every one. We discuss them at the assembly.",
  "manifesto.signers.title_one":
    "Signed by <em>{formatted} member</em> · so far",
  "manifesto.signers.title_other":
    "Signed by <em>{formatted} members</em> · so far",
  "manifesto.signers.sub":
    "Members sign by clicking once. There's no obligation — many haven't, and that's also fine. These are some of the people who have.",
  "manifesto.signers.addCta": "Add my name",
  "manifesto.signers.more":
    "Plus <b>{formatted} more</b> · last signed by <b>{name}</b>, {time}.",
  "manifesto.signers.minutesAgo_one": "{count} minute ago",
  "manifesto.signers.minutesAgo_other": "{count} minutes ago",
  "manifesto.actions.addName": "Add your name",
  "manifesto.actions.print": "Print / save PDF",
  "manifesto.actions.governance": "Read the governance report →",

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
    "QueerPulse is a Lisbon-based queer professional network, founded in 2024 by eight community members in the back room of Café Beirão. It is operated by Associação QueerPulse, a not-for-profit registered in Portugal (NIPC 517 426 884), and supported by Sustainer memberships, one-off donations, and three programme grants. Membership is by vouched invitation. The platform supports a magazine, a podcast (The Back Room), a verified safe-spaces network across Lisbon, a micro-grants fund disbursed within 14 days by a rotating community circle, and an operational partnership with ILGA Portugal for legal aid and helpline handoffs. Annual transparency reports are independently audited and published publicly.",
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
    "For: trans-affirming healthcare, finances, transparency, mutual aid, ILGA partnership.",
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
  "pressKit.facts.toPrograms": "Of every euro goes to programs",
  "pressKit.facts.totalRaised": "Total raised in 2025",
  "pressKit.facts.gatherings": "Gatherings held in 2025",
  "pressKit.facts.microGrants": "Micro-grants disbursed in 2025",
  "pressKit.facts.safeSpaces": "Verified safe spaces in Lisbon",
  "pressKit.facts.magazineIssues": "Magazine issues to date",
  "pressKit.facts.transNonBinary": "Trans / non-binary members",
  "pressKit.coverage.section.title": "Recent <em>coverage</em>",
  "pressKit.coverage.section.lead":
    "Selected English- and Portuguese-language pieces from 2024–2026. <em>Hit-counts welcome but not necessary</em> — link to Press instead.",
  "pressKit.coverage.openingToast": "Opening coverage in {source}…",
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
  "listBusiness.wizard.draftSaved": "Draft saved",
  "listBusiness.draftBanner.text":
    "<b>You have a saved draft.</b> Pick up where you left off?",
  "listBusiness.draftBanner.startFresh": "Start fresh",
  "listBusiness.draftBanner.resume": "Resume draft",
  "listBusiness.paneActions.back": "← Back",
  "listBusiness.paneActions.cancel": "Cancel",
  "listBusiness.paneActions.neededLabel": "A few things left",
  "listBusiness.paneActions.jumpToAria": "Jump to {label}",
  "listBusiness.paneActions.blockedTitle":
    "Fill the required fields to continue",
  "listBusiness.next.basics": "Next: the basics →",
  "listBusiness.next.story": "Next: the story →",
  "listBusiness.next.practical": "Next: practical →",
  "listBusiness.next.photos": "Next: photos & you →",
  "listBusiness.next.review": "Review your listing →",
  "listBusiness.next.send": "Send it to the team →",
  "listBusiness.next.continue": "Continue →",
  "listBusiness.sending": "Sending your place to the team…",
  "listBusiness.toast.submitted": "Your listing is with the community team",
  "listBusiness.toast.withdrawn": "Listing withdrawn",
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
  "listBusiness.step3.findOnMap": "Find on map",
  "listBusiness.step3.pinPlaced": "Pin placed near {place}",
  "listBusiness.step3.hoursHeading": "Opening hours *",
  "listBusiness.step3.hasOpenHours": "Has open hours",
  "listBusiness.step3.allClosed": "All closed",
  "listBusiness.step3.copyMonday": "Copy Monday to all days",
  "listBusiness.step3.markAllClosed": "Mark all closed",
  "listBusiness.step3.open": "Open",
  "listBusiness.step3.closed": "Closed",
  "listBusiness.step3.opensAria": "{day} opens",
  "listBusiness.step3.closesAria": "{day} closes",
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
  "listBusiness.success.viewOnProfile": "View on your profile →",
  "listBusiness.success.editSubmission": "Edit submission",
  "listBusiness.success.listAnother": "List another place",
  "listBusiness.success.withdraw": "Withdraw",
  "listBusiness.success.reference":
    "Reference · <b>{ref}</b>  ·  keep it somewhere",
  "listBusiness.success.demoFlip": "Prototype · preview review states:",
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
  "listBusiness.missing.hours": "opening hours",
  "listBusiness.missing.social": "valid contact links",
  "listBusiness.missing.rel": "your connection",
  "listBusiness.missing.ownerName": "your name",
  "listBusiness.missing.ownerRole": "your role",
  "listBusiness.missing.contactEmail": "a contact email",
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
  "listBusiness.preview.fullCta": "Preview the full page →",
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

  // ── Shared hub back-link label (Governance section) ────────────────────
  "hub.governanceLabel": "Governance",

  // ── Annual Assembly — page chrome. The agenda/resolutions/tallies/history
  //    are per-year governance records (specific proposals, vote counts,
  //    dates) — left English; see the sweep report for why.
  "annualAssembly.meta.title": "QueerPulse Annual Assembly: eleven resolutions",
  "annualAssembly.meta.description":
    "QueerPulse's binding annual members' meeting — vote on eleven resolutions, join in person or online in Lisbon on 14–15 November, or read the minutes after.",
  "annualAssembly.hero.eyebrow": "Annual Assembly · 14 November 2026 · Lisbon",
  "annualAssembly.hero.title": "Two days, eleven <em>resolutions.</em>",
  "annualAssembly.hero.dek":
    "QueerPulse's binding annual gathering. Where the manifesto gets revised, the budget gets approved, and any decision that can't be made by a circle goes to a member vote. <em>You can attend in person, online, or just read the minutes after</em> — but your vote counts the same.",
  "annualAssembly.hero.meta.datesLabel": "Two days · Sat & Sun",
  "annualAssembly.hero.meta.videoLink": "+ video link",
  "annualAssembly.hero.meta.eligibleLabel": "Members eligible to vote",
  "annualAssembly.hero.meta.quorumLabel": "Quorum · met",
  "annualAssembly.hero.voteCta": "Vote now · {count} resolutions",
  "annualAssembly.hero.rsvpGoing": "You're going · tap to cancel",
  "annualAssembly.hero.rsvpCta":
    "RSVP in-person · {spotsLeft} of {totalSpots} spots left",
  "annualAssembly.hero.joinOnlineCta": "Join online · Zoom link",
  "annualAssembly.toast.rsvpCancelled":
    "RSVP cancelled · your seat is back in the pool",
  "annualAssembly.toast.rsvpConfirmed": "You're on the list · see you 14 Nov",
  "annualAssembly.toast.openingZoom": "Opening Zoom link…",
  "annualAssembly.footer.eligibility": "Questions about your eligibility?",
  "annualAssembly.footer.helpCta": "Help →",
  "annualAssembly.footer.proposal":
    "Want to submit a member proposal for next year?",
  "annualAssembly.footer.writeCta": "Write to us",
  "annualAssembly.agenda.title": "The <em>agenda</em>",
  "annualAssembly.agenda.sub":
    "Roughly the order. Times are guidelines. We've never finished on time and we don't expect to.",
  "annualAssembly.vote.title": "Vote · <em>open until 14 Nov · 14:00</em>",
  "annualAssembly.vote.sub":
    "Everyone votes — whether you're attending or not. Cast your vote any time; you can change it until the close. <em>One vote per member, per resolution.</em>",
  "annualAssembly.vote.quorumStrip":
    "<b>Quorum:</b> 184 votes required to validate a resolution. <em>Currently at 312 votes cast</em> — quorum met. <b>Yes/no thresholds:</b> simple majority for budget items; 60% supermajority for Code of Conduct & manifesto changes.",
  "annualAssembly.vote.noCta": "No · reject",
  "annualAssembly.vote.abstainCta": "Abstain",
  "annualAssembly.vote.showMore": "Show {count} more resolutions →",
  "annualAssembly.vote.recorded": "Vote recorded · you can change it any time",
  "annualAssembly.vote.tallyYes": "Yes",
  "annualAssembly.vote.tallyNo": "No",
  "annualAssembly.vote.tallyAbstain": "Abstain",
  "annualAssembly.attend.title": "Can't make it in person?",
  "annualAssembly.attend.body":
    "Vote online any time until 14 Nov · 14:00. Watch the live stream of the in-person sessions with chat. Read the minutes the following Friday.",
  "annualAssembly.attend.voteCta": "Cast your vote",
  "annualAssembly.attend.streamCta": "Live stream link",
  "annualAssembly.past.title": "Past <em>assemblies</em>",
  "annualAssembly.past.sub":
    "Every Annual Assembly's resolutions and minutes are public.",
  "annualAssembly.past.minutesCta": "Minutes →",

  // ── Live-stream modal (Annual Assembly) ────────────────────────────────
  "liveStream.closeAria": "Close",
  "liveStream.eyebrow": "Live stream · Atelier Pulso",
  "liveStream.title": "Annual Assembly · <em>live.</em>",
  "liveStream.lead":
    "The in-person sessions are streamed here with open chat. The stream goes live when the room opens — <b>14 Nov · 10:00 WET.</b>",
  "liveStream.playAria": "Play stream",
  "liveStream.statusLive": "Live",
  "liveStream.statusSoon": "Starts soon",
  "liveStream.noteStreaming":
    "Streaming the main room · audio + slides · chat below",
  "liveStream.noteSoon": "Stream starts at 10:00 WET on 14 November",
  "liveStream.backCta": "← Close",
  "liveStream.voteInsteadCta": "Cast your vote instead →",

  // ── Assembly Minutes — page chrome. Each year's minutes (summary, agenda,
  //    resolutions, actions) are the official governance record — left
  //    English; see the sweep report.
  "assemblyMinutes.hero.eyebrow": "Annual Assembly · Minutes · {year}",
  "assemblyMinutes.hero.title": "The <em>minutes.</em>",
  "assemblyMinutes.hero.dek":
    "The public record of the {year} Annual Assembly — who chaired, what was on the table, and how every resolution landed.",
  "assemblyMinutes.hero.fallbackNote":
    "We don't have minutes for {requestedYear} on file, so here's the {year} record instead.",
  "assemblyMinutes.hero.backCta": "← Back to the Assembly",
  "assemblyMinutes.otherYears": "Other years:",
  "assemblyMinutes.meta.date": "Date",
  "assemblyMinutes.meta.location": "Location",
  "assemblyMinutes.meta.chair": "Chair",
  "assemblyMinutes.meta.secretary": "Secretary",
  "assemblyMinutes.meta.quorum": "Quorum",
  "assemblyMinutes.meta.attendance": "Attendance",
  "assemblyMinutes.meta.attendanceValue":
    "{inPerson} in person · {online} online · {votes} votes",
  "assemblyMinutes.summary.title": "Summary of <em>proceedings</em>",
  "assemblyMinutes.agenda.title": "<em>Agenda</em> as taken",
  "assemblyMinutes.resolutions.title": "Resolutions & <em>outcomes</em>",
  "assemblyMinutes.actions.title": "Actions & <em>next steps</em>",
  "assemblyMinutes.signoff":
    "Minutes recorded by {secretary} · ratified at the close of the {year} Annual Assembly. This is the public record.",
  "assemblyMinutes.outcome.passed": "Passed",
  "assemblyMinutes.outcome.rejected": "Rejected",
  "assemblyMinutes.outcome.tabled": "Tabled",

  // ── Open Letter — the letter body is a single bounded advocacy document,
  //    platform-authored (not per-user content); translated in full like the
  //    Manifesto. Signatory names + individual signature notes stay English
  //    (people's own words/names).
  "openLetter.hero.eyebrowPrefix": "Open letter · {partners}",
  "openLetter.hero.live_one": "Live · {days} day left",
  "openLetter.hero.live_other": "Live · {days} days left",
  "openLetter.hero.addressed": "Addressed to <b>{to}</b> · {date}",
  "openLetter.hero.countGoalSuffix": "/ {goal} signatures",
  "openLetter.hero.countLabel":
    "Members of QP & partner orgs · last signed <b>{at}</b> by {by}",
  "openLetter.hero.pctLabel": "<b>{pct}%</b> · {note}",
  "openLetter.toast.signatureAdded": "Signature added · {total} total",
  "openLetter.body.addressee":
    "To the Ministry of Health, and to the Direção-Geral da Saúde:",
  "openLetter.body.lead":
    "Law No. 38/2018 codified a fundamental principle in Portuguese law: that a person's gender identity is theirs to determine, and that the state and its health system are obliged to recognise that determination. <em>The law is good.</em> It is not yet being applied.",
  "openLetter.body.p2":
    "Specifically, the prescription protocols for hormone-replacement therapy in Portugal are <strong>not portable across the SNS</strong>. A trans patient who establishes care with a GP in Lisbon, builds an evidence file over 12–24 months, and then moves — for work, for housing, for safety — must, in practice, start over with a new GP in their new city. The clinical evidence does not move with them. The prescription history does not move with them. <em>The trust they built with a clinician does not move with them.</em>",
  "openLetter.body.p3":
    "This is not what the law says should happen. This is what the operational reality is.",
  "openLetter.body.asksTitle": "What we're <em>asking for</em>",
  "openLetter.body.asksLead":
    "Three specific, implementable changes. None require new legislation.",
  "openLetter.body.ask1.lead": "A national HRT prescription registry",
  "openLetter.body.ask1.body":
    ", opt-in and clinician-only, accessible to any SNS-affiliated GP a patient consents to. Same model as the diabetes care registry adopted in 2019.",
  "openLetter.body.ask2.lead": "A 14-day “continuity script” rule",
  "openLetter.body.ask2.body":
    " — when a patient moves regions, their new GP may issue a 90-day script bridging to a full review, without requiring a fresh diagnostic process.",
  "openLetter.body.ask3.lead":
    "Inclusion of trans-affirming care in the standard GP onboarding module",
  "openLetter.body.ask3.body":
    " — mandatory, four hours, drafted in collaboration with WPATH-certified Portuguese clinicians.",
  "openLetter.body.whyNowTitle": "Why <em>now</em>",
  "openLetter.body.whyNowP1":
    "Because the policy window is open. Because the Ministry has committed, in the 2026 health budget, to “evaluate continuity-of-care pathways for chronic medications.” Because the clinicians who would have to implement this — including <em>Dr. Inês Pereira</em> at Clínica do Largo, <em>Dr. Hugo Marques</em> at USF Sé, and <em>Dra. Mariza Câmara</em> at the Câmara — have publicly stated they are ready to participate.",
  "openLetter.body.whyNowP2":
    "And because every month we wait, <strong>roughly 40 trans patients in Portugal lose continuity of HRT</strong> due solely to administrative friction. The clinical cost of these interruptions is documented. The personal cost is incalculable.",
  "openLetter.body.whatWeDoTitle": "What we'll do <em>with this letter</em>",
  "openLetter.body.whatWeDoP1":
    "At 5,000 signatures, this letter will be hand-delivered to the Ministry by a delegation of three: <em>Catarina Vaz</em> (QueerPulse, Trans Hub), <em>Filipa Mendes</em> (ILGA Portugal), and one trans person whose continuity of care has been interrupted in the last 24 months. We will request a meeting. We will publish their response, whatever it is.",
  "openLetter.body.whatWeDoP2":
    "If they decline to meet, this letter goes to the next quarterly Assembleia da República's health committee hearing — already scheduled to discuss Law No. 38/2018 implementation — and to the press.",
  "openLetter.body.kicker":
    "We are not asking for a new right. <strong>We are asking that an existing right be made operationally real.</strong>",
  "openLetter.sig.transHub":
    "Trans Hub coordinator · co-treasurer · QueerPulse",
  "openLetter.sig.ilgaDirector": "Executive Director · ILGA Portugal",
  "openLetter.sidebar.recentSignatures": "Recent signatures",
  "openLetter.sidebar.aboutRunning":
    "<b>Why we run open letters this way:</b> every signature has a verified member name behind it. <em>That makes them harder to dismiss.</em> We won't do anonymous-mass petitions — the model is fewer, real, named signatures.",
  "openLetter.sign.title": "Sign the open letter",
  "openLetter.sign.asLabel": "As {name} · {pronouns}",
  "openLetter.sign.nameLabel": "Display name on the list",
  "openLetter.sign.visibilityLabel": "Show as · visibility",
  "openLetter.sign.noteLabel": "Add a sentence (optional)",
  "openLetter.sign.noteCounter": "{length}/280",
  "openLetter.sign.notePlaceholder": "Why this matters to you · 280 chars",
  "openLetter.sign.submitCta": "Sign the letter",
  "openLetter.sign.signedCta": "You signed the letter",
  "openLetter.sign.footer":
    "Members only. We never share your data with the recipient organisation. You can withdraw your signature any time.",
  "openLetter.sign.anonName": "A member",
  "openLetter.visibility.full": "Full name · public",
  "openLetter.visibility.initials": "Initials only",
  "openLetter.visibility.anon": "Anonymous · “A member”",
  "openLetter.sidebar.noNote": "—",

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
    "This report was prepared by Catarina Vaz and André Bento, reviewed by the full Assembly, and audited independently by Dra. Helena Faria of Faria Auditoria. <em>Errors are ours.</em> Questions, corrections, or concerns: <a>transparency@queerpulse.app</a> — a real person reads them within 48 hours.",
  "transparency.signoff.role.catarina":
    "Co-treasurer · drafted finance + mistakes",
  "transparency.signoff.role.andre":
    "Co-treasurer · drafted moderation + governance",
  "transparency.signoff.role.auditor": "Independent auditor",
  "transparency.signoff.downloadPdf": "Download PDF (84 pages)",
  "transparency.signoff.downloadCsv": "Download raw CSV",

  // ── Changelog — page chrome. The 18 dated release entries (title/body/tag)
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
  "changelog.filter.community": "Community",
  "changelog.filter.fix": "Fixes",
  "changelog.filter.policy": "Policy",
  "changelog.filter.magazine": "Magazine",
  "changelog.badge.feature": "Feature",
  "changelog.badge.community": "Community",
  "changelog.badge.fix": "Fix",
  "changelog.badge.policy": "Policy",
  "changelog.badge.magazine": "Magazine",
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
  "roadmap.shape.title": "Have an <em>idea?</em>",
  "roadmap.shape.sub":
    "We read every suggestion. The most-voted ideas move up the roadmap.",
  "roadmap.submitIdea.title": "Submit an idea",
  "roadmap.submitIdea.ariaLabel": "Your idea",
  "roadmap.submitIdea.placeholder":
    "What would make QueerPulse better for you?",
  "roadmap.submitIdea.cta": "Submit idea",
  "roadmap.submitIdea.toast.empty": "Write a few words first",
  "roadmap.submitIdea.toast.submitted": "Idea submitted — thank you",
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
  "volunteer.card.expressInterest": "Express interest →",
  "volunteer.loadingMore": "Loading more opportunities…",
  "volunteer.loadMoreCta": "Load more opportunities",
  "volunteer.outro.title": "Want to connect <em>more deeply?</em>",
  "volunteer.outro.sub":
    "Find the change makers already working on the causes you care about.",
  "volunteer.outro.cta": "Meet the change makers →",
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
  "postOpportunity.success.closeLabel": "View the volunteer board →",
  "postOpportunity.success.step1": "It's live on the volunteer board now",
  "postOpportunity.success.step2": "Members can sign up from the listing",
  "postOpportunity.success.step3":
    "You'll see everyone who signs up on the role's page",
  "postOpportunity.success.body":
    "Thank you for making room for someone to help. Interested volunteers can now find your role and express interest.",
  "postOpportunity.actions.posting": "Posting…",
  "postOpportunity.actions.submit": "Post opportunity →",
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
  "postOpportunity.core.orgPlaceholder": "e.g. ILGA Portugal",
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
    "Community Outreach · ILGA Lisboa",
  "postOpportunity.rich.partnerSlugLabel": "Partner slug",
  "postOpportunity.rich.partnerSlugHelper": "Links to a partner's page.",
  "postOpportunity.rich.partnerSlugPlaceholder": "ilga-portugal",
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
  "volunteerDetail.backCta": "← All volunteer opportunities",
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
  "volunteerDetail.sidebar.applyCta": "Apply →",
  "volunteerDetail.sidebar.askTeam": "Ask the team",
  "volunteerDetail.sidebar.footNote":
    "Returning volunteers: <a>use last year's profile →</a> · skips the screen.",
  "volunteerDetail.sidebar.partnershipLabel": "In partnership with",
  "volunteerDetail.sidebar.partnershipLink": "About the partnership →",
  "volunteerDetail.sidebar.notRightFit": "Not the right fit?",
  "volunteerDetail.sidebar.otherWays": "Other ways to help right now:",
  "volunteerDetail.sidebar.fundInstead": "→ Fund this work instead",

  // ── Partner Detail — page chrome. About/joint-work/timeline/how-we-work
  //    copy, stats, and contact details are each partner org's own content
  //    (partnerDetails.dataA/B.tsx) — left English, same precedent as the
  //    Partners listing page.
  "partnerDetail.loadError":
    "We couldn't load this partner just now. Please try again.",
  "partnerDetail.backCta": "← All partners",
  "partnerDetail.tab.about": "About",
  "partnerDetail.tab.work": "Joint work",
  "partnerDetail.tab.timeline": "Timeline",
  "partnerDetail.tab.how": "How we work together",
  "partnerDetail.sidebar.atGlance": "At a glance",
  "partnerDetail.sidebar.contactDirectly": "Contact {name} directly",
  "partnerDetail.sidebar.becomeTitle": "Become a partner",
  "partnerDetail.sidebar.becomeBody":
    "Are you an org that ought to be operationally connected to QueerPulse? We're small and slow about this — write to us.",
  "partnerDetail.sidebar.becomeCta": "Get in touch →",

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
  "donate.giveCta.monthly": "Give {amount} / month →",
  "donate.giveCta.oneOff": "Give {amount} →",
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
  "donateModal.field.cardNumber": "Card number",
  "donateModal.field.expiry": "Expiry",
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
  "contact.form.sendCta": "Send →",
  "contact.outro.title": "Built in Lisbon, <em>with care.</em>",
  "contact.outro.sub":
    "QueerPulse is a small, member-supported network. Your feedback helps keep it good.",
  "contact.outro.backCta": "Back to the room",

  // ── Get the App — landing page chrome. All platform-authored.
  "getTheApp.meta.title": "Get the QueerPulse app: crisis chat, RSVPs",
  "getTheApp.meta.description":
    "Download the QueerPulse app for iOS and Android — quick exit, one-tap crisis chat, gathering RSVPs with QR tickets, and an offline safe-spaces map.",
  "getTheApp.hero.eyebrow": "Mobile · iOS & Android",
  "getTheApp.hero.title": "Take it with you <em>anyway.</em>",
  "getTheApp.hero.lead":
    "The app does the things you actually need on a phone: <b>quick exit, crisis chat, RSVPs, your safe-spaces map, and the QR ticket at the door.</b> Everything else stays better on the web.",
  "getTheApp.store.ios.line1": "Download on the",
  "getTheApp.store.ios.line2": "App Store",
  "getTheApp.store.android.line1": "Get it on",
  "getTheApp.store.android.line2": "Google Play",
  "getTheApp.sendPhone.title": "Don't want the <em>app stores?</em>",
  "getTheApp.sendPhone.body":
    "Pop your number in and we'll text you a one-time install link. Doesn't add you to anything.",
  "getTheApp.sendPhone.placeholder": "+351 91·••··••··",
  "getTheApp.sendPhone.cta": "Text me the link",
  "getTheApp.sendPhone.toast": "Link sent — check your messages",
  "getTheApp.qr.label": "Scan with <em>your phone</em>",
  "getTheApp.qr.sub": "Camera app should detect it · routes to the right store",
  "getTheApp.what.title": "What the app is <em>for</em>",
  "getTheApp.what.sub":
    "A short list. We won't put everything on a small screen.",
  "getTheApp.features.quickExit.title": "Quick exit",
  "getTheApp.features.quickExit.desc":
    "Lives in the nav. One tap closes the app and switches to a neutral home screen. Always available.",
  "getTheApp.features.crisisChat.title": "Crisis support",
  "getTheApp.features.crisisChat.desc":
    "One tap from anywhere to the emergency helplines page — real numbers to call, no app required, works on patchy signal.",
  "getTheApp.features.gatherings.title": "Gatherings & RSVPs",
  "getTheApp.features.gatherings.desc":
    "RSVP in two taps. Tickets show as QR codes at the door. Calendar export to whatever you use.",
  "getTheApp.features.safeMap.title": "Safe-spaces map · offline",
  "getTheApp.features.safeMap.desc":
    "Map of vetted venues across Lisbon, cached so it works without signal. Verified within 90 days, every pin.",
  "getTheApp.features.quietNotifs.title": "Quiet notifications",
  "getTheApp.features.quietNotifs.desc":
    "Replies, RSVPs, messages. No engagement bait, no streaks. Granular quiet hours by category.",
  "getTheApp.features.onTheGo.title": "Member-on-the-go",
  "getTheApp.features.onTheGo.desc":
    "Your DMs, your saves, your profile. Light theme + a true black for night use.",
  "getTheApp.what.notIn":
    "<b>Not in the app, on purpose:</b> the full Magazine, the article archive, the Forum, the long-form profiles, governance documents, hosting tools. <em>These are better at a desk.</em> Web stays the canonical home for everything that takes time.",
  "getTheApp.share.eyebrow": "Pass it along",
  "getTheApp.share.title": "Got a friend who'd <em>use this?</em>",
  "getTheApp.share.body":
    "Show them this QR — it's the same install page, just yours. If they install, you'll both see each other in the \"we've met in person\" recap when you're next at a gathering together.",
  "getTheApp.share.copyLinkCta": "Copy link",
  "getTheApp.share.shareAppsCta": "Share to apps",
  "getTheApp.share.copyToast": "Link copied",
  "getTheApp.share.notMemberCta": "Not a member yet? Request an invite →",

  // ── Get the App — notify-me modal (App Store / Google Play not live yet).
  "appNotify.ariaLabel": "Get notified at launch",
  "appNotify.close": "Close",
  "appNotify.success.title": "We'll let you <em>know.</em>",
  "appNotify.success.body":
    "You're on the list for the {platform} launch. We'll email <b>{email}</b> the day it lands — and nothing else.",
  "appNotify.eyebrow": "{store} · coming soon",
  "appNotify.title": "QueerPulse is coming to <em>{platform}.</em>",
  "appNotify.lead":
    "The app isn't in the store yet. Drop your email and we'll let you know the moment the {platform} build is live. No marketing, no lists you didn't ask for.",
  "appNotify.emailLabel": "Your email",
  "appNotify.emailHint": "We'll only use this for the launch heads-up.",
  "appNotify.maybeLaterCta": "← Maybe later",
  "appNotify.notifyCta": "Notify me →",

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
  "forOrgs.proof.viewCta": "View partner →",
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
  "forOrgs.tiers.employer.exampleCta": "See an example company profile →",
  "forOrgs.tiers.partner.name": "Operational <em>partner</em>",
  "forOrgs.tiers.partner.price": "By <em>arrangement</em>",
  "forOrgs.tiers.partner.pricePeriod": "reciprocal · usually unpaid",
  "forOrgs.tiers.partner.dek":
    "For organisations that should be operationally connected to QueerPulse — ILGA, Trans Hub, civic-service agencies, allied associations. We build infrastructure together, not co-marketing.",
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
  "forOrgs.form.orgPlaceholder": "ILGA Portugal",
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
  "forOrgs.form.small":
    "Goes directly to Marta and André. No sales funnel, no follow-up sequence. Just a reply within 5 working days.",
  "forOrgs.form.toast":
    "Sent to Marta and André — they'll reply within 5 working days",

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
  "directory.empty": "No places match — try a broader filter.",
  "directory.noListings":
    "No places listed yet — be the first to add one below.",
  "directory.badge.queerOwned": "Queer-owned",
  "directory.badge.friendly": "LGBTQ+ friendly",
  "directory.card.memberRun": "Member-run",
  "directory.card.viewDetails": "View details →",
  "directory.submitStrip.title": "Know a place worth <em>adding?</em>",
  "directory.submitStrip.body":
    "If you run or know a queer-owned or queer-friendly business in Lisbon that belongs in this directory, tell us. We review every suggestion before it goes live.",
  "directory.submitStrip.cta": "List your business",
  "directory.outro.title":
    "New to Lisbon? <em>You're not starting from zero.</em>",
  "directory.outro.sub":
    "Join the network and get access to the full directory, member recommendations, and a community that knows the city.",
  "directory.outro.cta": "Request an invite",
  "directory.detail.backCta": "← Directory",
  "directory.detail.badge.verifiedOwned": "Verified queer-owned",
  "directory.detail.badge.friendly": "LGBTQ+ friendly",
  "directory.detail.reviewsCount": "· {count} reviews",
  "directory.detail.whatItIsTitle": "What it <em>actually is.</em>",
  "directory.detail.goodForTitle": "What members say it's <em>good for</em>",
  "directory.detail.goodForSub": "Aggregated from {count} reviews.",
  "directory.detail.hoursTitle": "Hours",
  "directory.detail.today": "Today",
  "directory.detail.hoursClosed": "Closed",
  "directory.detail.reviewsTitle": "Member reviews · <em>{count}</em>",
  "directory.detail.reviewsSub": "Sorted by most helpful.",
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
  "directory.detail.helpful": "<b>{count}</b> members found this helpful",
  "directory.detail.visitWebsite": "Visit website →",
  "directory.detail.getInTouch": "Get in touch →",
  "directory.detail.backToDirectory": "Back to directory",
  "directory.detail.whoRunsIt": "Who runs it",
  "directory.detail.onQueerPulse": "On QueerPulse",
  "directory.detail.communityVouched": "Community-vouched",
  "directory.detail.viewProfile": "View {name}'s profile →",
  "directory.detail.membersHereLately": "Members here lately",
  "directory.detail.upcomingHere": "Upcoming here",
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
  "arriving.firstStep.rsvpCta": "I'll be there →",
  "arriving.commQuick.eyebrow": "Where to start",
  "arriving.commQuick.title": "Three communities for <em>new arrivals.</em>",
  "arriving.commQuick.intro":
    "Not sure where to begin? These three communities are particularly welcoming to people who are new to Lisbon.",
  "arriving.commQuick.browseCta": "Browse all communities →",
  "arriving.outro.title": "Ready to meet <em>the community?</em>",
  "arriving.outro.sub":
    "Request an invite to QueerPulse and get access to the full network — members, gatherings, board, and everything else on this page.",
  "arriving.outro.cta": "Request an invite →",

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
  "visas.routePicker.euCitizen.cta": "EU Citizens →",
  "visas.routePicker.remoteWorker.name": "Remote worker / passive income",
  "visas.routePicker.remoteWorker.desc":
    "Living on savings, rental income, freelance, or remote employment.",
  "visas.routePicker.remoteWorker.cta": "D7 Visa →",
  "visas.routePicker.digitalNomad.name": "Digital nomad",
  "visas.routePicker.digitalNomad.desc":
    "Working remotely for a non-Portuguese employer, higher income.",
  "visas.routePicker.digitalNomad.cta": "Digital Nomad (D8) →",
  "visas.routePicker.jobOffer.name": "Job offer in Portugal",
  "visas.routePicker.jobOffer.desc":
    "You have or are seeking employment with a Portuguese entity.",
  "visas.routePicker.jobOffer.cta": "Work Visas →",
  "visas.routePicker.partner.name": "Joining a partner here",
  "visas.routePicker.partner.desc":
    "Your partner is in Portugal already or moving with you.",
  "visas.routePicker.partner.cta": "Bringing a Partner →",

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
  "visas.tabs.eu.card3.link": "Partner visa details →",

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
  "visas.tabs.d7.card3.link": "Tax advice contacts →",
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
  "visas.tabs.d8.card3.link": "Tax advice →",

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
  "visas.tabs.partner.card3.link": "Talk to an immigration lawyer →",
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
  "visas.tabs.citizenship.card3.link": "Language learning resources →",

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
  "visas.lawyers.forumCta": "Ask the visa forum thread →",

  "visas.outro.title": "You're building a life <em>here.</em>",
  "visas.outro.sub": "The paperwork is temporary. The community is permanent.",
  "visas.outro.settlingCta": "Settling in guide →",
  "visas.outro.askCta": "Ask the community",

  // ── Map (queer Lisbon city guide) — page/filter/sidebar chrome. Venue
  //    names/addresses/hours/notes (`map.data.ts`) are business-directory
  //    content — left English, same precedent as `directoryPlaces.ts`.
  //    Bairro (neighbourhood) names are Lisbon proper nouns — kept identical.
  //    Filter `type`/`vibe` ids stay canonical English strings (stored/filter
  //    values); only their display labels below are translated.
  "map.hero.eyebrow": "Lisbon · Community guide",
  "map.hero.title": "The queer <em>city guide</em>",
  "map.hero.sub":
    "Bars, clubs, cafés, clinics, bookshops, saunas and community spaces — mapped by people who've actually been there.",
  "map.stats.venuesListed": "venues listed",
  "map.stats.neighbourhoods": "neighbourhoods",
  "map.stats.communityLabel": "Community",
  "map.stats.maintained": "maintained",
  "map.filterBar.typeLabel": "Type",
  "map.filterBar.vibeLabel": "Vibe",
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
  "map.sidebar.allVenues": "All venues",
  "map.sidebar.venueCount_one": "<b>{count}</b> venue",
  "map.sidebar.venueCount_other": "<b>{count}</b> venues",
  "map.sidebar.clear": "Clear",
  "map.sidebar.empty": "No venues match these filters.",
  "map.venueCard.beenCount_one": "<b>{count}</b> person been here",
  "map.venueCard.beenCount_other": "<b>{count}</b> people been here",
  "map.venueCard.beenThere": "Been there",
  "map.venueCard.markBeen": "I've been here",
  // Bairro is a Lisbon proper noun — identical in both catalogs, only the
  // surrounding phrase is translated.
  "map.svg.filterByAria": "Filter the map by {bairro}",
  "map.mapError": "The map could not load. The venue list below still works.",
  "map.pinAria": "{name} — {type}",
  "map.clusterAria_one": "{count} venue here — zoom in",
  "map.clusterAria_other": "{count} venues here — zoom in",

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
    "On dissolution, all remaining assets must be transferred to ILGA Portugal, or to a successor LGBTQ+ organisation chosen by the dissolving Assembly. No assets may be distributed to individuals.",

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
  "resourceLibrary.card.openGuide": "Open guide →",
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
  "platforms.outro.cta": "Suggest a platform →",

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
  "submitPartner.success.closeLabel": "Back to partners →",
  "submitPartner.success.step1":
    "It's pending review with the partnerships team",
  "submitPartner.success.step2":
    "We read every application, not just the tidy ones",
  "submitPartner.success.step3":
    "We'll be in touch — a yes, a not-yet, or a question",
  "submitPartner.success.body":
    "Thank you for reaching out. Your application is in — nothing goes live until we've talked it through with you.",
  "submitPartner.actions.sending": "Sending…",
  "submitPartner.actions.submit": "Submit application →",
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

  // ── Cities (CitiesPage + Sections + LiveCards) — chrome only. Per-city
  //    descriptions, coordinator credits, and vote counts (`cities.data.tsx`,
  //    the Lisbon/Porto card bodies) are content — a previous agent's
  //    deliberate call, not re-litigated here. Country-flag emoji in this
  //    feature are the lint rule's one exemption — left as-is.
  "cities.meta.title": "Where QueerPulse operates: Lisbon, and what's next",
  "cities.meta.description":
    "QueerPulse is live in Lisbon, building toward Porto, and taking member votes on where to go next — each new city needs a local moderator and partner first.",
  "cities.hero.eyebrow": "Cities · network footprint · selector",
  "cities.hero.title": "One city at a <em>time.</em>",
  "cities.hero.dek":
    "QueerPulse is rooted in Lisbon. We will only open in a new city when there is <b>at least one moderator in-country</b>, a partner organisation aligned, and a clear local need. <em>That makes expansion slow on purpose.</em> Below: where we are now, where we're building, and how you can pull us toward your city.",
  "cities.hero.browsingAs": "You're browsing as",
  "cities.hero.changeCta": "Change",
  "cities.hero.changeToast":
    "Detected from IP. You can switch from any city card below.",

  "cities.live.heading": "Live · <em>fully operational</em>",
  "cities.live.meta": "Active community, moderators, partner orgs",

  "cities.groundwork.heading": "In <em>groundwork</em>",
  "cities.groundwork.meta":
    "Local moderator identified · partner negotiations underway",

  "cities.waitlist.heading": "Cities <em>members are asking for</em>",
  "cities.waitlist.meta":
    "Public waitlist · members can vote · 1 vote per member",
  "cities.waitlist.intro":
    "Votes are <em>signals to us about where the community is</em>, not promises to build. We open one city at a time. Adding your vote takes 1 click.",
  "cities.waitlist.membersAsking": "Members asking",
  "cities.waitlist.pctToThreshold": "{pct}% to threshold",
  "cities.waitlist.votedCta": "You voted",
  "cities.waitlist.voteCta": "+ Add my vote",
  "cities.waitlist.voteToast": "Vote recorded · we read these signals monthly",
  "cities.waitlist.footNote":
    "Don't see your city? <a>Write to us</a> with what you'd build there.",

  "cities.how.kicker": "The rule book",
  "cities.how.title": "How we <em>actually open</em> a new city.",
  "cities.how.intro": "Four conditions, all required. No shortcuts.",
};

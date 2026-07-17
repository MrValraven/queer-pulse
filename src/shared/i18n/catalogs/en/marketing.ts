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
  "about.meta.title": "About — QueerPulse",
  "about.meta.description":
    "QueerPulse is a queer professional network built in Lisbon — no ads, no algorithm, no growth for its own sake. Here's what we believe, and why we built it this way.",
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
  "coc.report.crisisCta": "Talk to someone now",
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
  "coc.crisisChatToast": "Opening crisis chat…",
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
  "manifesto.meta.title": "The Manifesto — QueerPulse",
  "manifesto.meta.description":
    "What QueerPulse believes, in its own words — the founding document behind everything else on this platform.",
  "manifesto.hero.eyebrow": "The Manifesto",
  "manifesto.hero.title": "We build for <em>each other.</em>",
  "manifesto.hero.attrib":
    "Written by the founding circle, <b>ratified by the community.</b>",
  "manifesto.toast.signed": "Thanks for adding your name.",

  // ── Partners ───────────────────────────────────────────────────────────
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
    "Reference · <b>{ref}</b> &nbsp;·&nbsp; keep it somewhere",
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
  "annualAssembly.hero.eyebrow": "Annual Assembly · 14 November 2026 · Lisbon",
  "annualAssembly.hero.title": "Two days, eleven <em>resolutions.</em>",
  "annualAssembly.hero.dek":
    "QueerPulse's binding annual gathering. Where the manifesto gets revised, the budget gets approved, and any decision that can't be made by a circle goes to a member vote. <em>You can attend in person, online, or just read the minutes after</em> — but your vote counts the same.",
  "annualAssembly.hero.meta.datesLabel": "Two days · Sat &amp; Sun",
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
    "<b>Quorum:</b> 184 votes required to validate a resolution. <em>Currently at 312 votes cast</em> — quorum met. <b>Yes/no thresholds:</b> simple majority for budget items; 60% supermajority for Code of Conduct &amp; manifesto changes.",
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
  "assemblyMinutes.resolutions.title": "Resolutions &amp; <em>outcomes</em>",
  "assemblyMinutes.actions.title": "Actions &amp; <em>next steps</em>",
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
    "Members of QP &amp; partner orgs · last signed <b>{at}</b> by {by}",
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
    "Government &amp; legal <em>requests</em> for member data.",
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

  // ── Community Archive — page chrome. Oral-history quotes, bios, and
  //    excerpts are real people's own testimonials — left English (the
  //    scope rule's canonical "mock bio" case).
  "archive.hero.category": "Community Archive",
  "archive.hero.title": "Stories that shouldn't <em>be forgotten.</em>",
  "archive.hero.sub":
    "An ongoing archive of oral histories, testimonials, and personal accounts from queer people in Lisbon — past and present. Stories that document who we are, what we've built, and what it cost.",
  "archive.featured.label": "This month's featured story",
  "archive.featured.readCta": "Read her story →",
  "archive.grid.title": "From the <em>archive</em>",
  "archive.grid.sub":
    "Personal accounts from community members, past and present.",
  "archive.oral.title": "In their own <em>words.</em>",
  "archive.oral.sub":
    "Short excerpts from longer oral histories in the archive.",
  "archive.submit.title": "Your story <em>belongs here too.</em>",
  "archive.submit.body":
    "The archive grows through community contribution. If you have a story you want to tell — about Lisbon, about your community, about what brought you here or what kept you going — we want to hear it. All formats welcome: written, audio, video, photos.",
  "archive.submit.cta": "Submit your story →",

  // ── Changelog — page chrome. The 18 dated release entries (title/body/tag)
  //    are historical release notes — left English due to volume; flagged in
  //    the sweep report rather than rushed.
  "changelog.hero.backLabel": "Roadmap",
  "changelog.hero.eyebrow": "Platform changelog",
  "changelog.hero.title": "What's <em>changed,</em>",
  "changelog.hero.titleLine2": "and when.",
  "changelog.hero.sub":
    "Every update to QueerPulse, in reverse order. We publish changes here so you always know what's different and why. Nothing happens without a record.",
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
  "volunteer.filter.all": "All opportunities",
  "volunteer.filter.low": "Low commitment",
  "volunteer.filter.medium": "Medium commitment",
  "volunteer.filter.rights": "LGBTQ+ Rights",
  "volunteer.filter.health": "Health &amp; Wellbeing",
  "volunteer.filter.youth": "Youth",
  "volunteer.filter.housing": "Housing",
  "volunteer.filter.arts": "Arts &amp; Culture",
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
  "postOpportunity.cause.health": "Health &amp; Wellbeing",
  "postOpportunity.cause.youth": "Youth",
  "postOpportunity.cause.housing": "Housing",
  "postOpportunity.cause.arts": "Arts &amp; Culture",
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
  "postOpportunity.core.timePlaceHeading": "Time &amp; place",
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
  "postOpportunity.rich.teamHeading": "Team &amp; contact",
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
};

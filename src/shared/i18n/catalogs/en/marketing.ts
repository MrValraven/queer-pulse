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
    "QueerPulse is a small, invite-based queer community platform in Lisbon: no ads, no algorithm, no growth for its own sake. What we believe, and who runs it.",
  "about.hero.eyebrow": "About",
  "about.hero.title": "A platform built <em>on purpose.</em>",
  "about.hero.sub":
    "A calm space that respects your attention. A small, deliberate home built to hold this community and give back to it.",
  "about.why.eyebrow": "Why we exist",
  "about.why.title": "We built the thing <em>we needed.</em>",
  "about.why.p1":
    "QueerPulse started as a frustration we had to fix. Every platform we tried to build community on was designed to hold our attention and optimised for time-on-app, indifferent to whether we actually found each other.",
  "about.why.p2":
    "So a small group of us (professionals, organisers, artists) decided to build the alternative ourselves: a network sized for trust, where the point is connection.",
  "about.why.p3":
    "It's slower to grow this way. That's the design, exactly as intended.",
  "about.difference.eyebrow": "The difference",
  "about.difference.title": "What we're <em>not building.</em>",
  "about.contrast.them.label": "Everywhere else",
  "about.contrast.us.label": "QueerPulse",
  "about.contrast.them.attention": "Optimised to hold your attention",
  "about.contrast.them.algorithm": "An algorithm decides what you see",
  "about.contrast.them.signup": "Anyone can sign up with an email",
  "about.contrast.them.growth": "Growth at any cost",
  "about.contrast.them.value": "Your data is the product",
  "about.contrast.us.noTracking":
    "We don't track what you click or how long you stay",
  "about.contrast.us.feedIsYours":
    "Your feed is exactly the communities you joined",
  "about.contrast.us.vouched":
    "Every member is vouched in by someone already here",
  "about.contrast.us.growthPace":
    "Growth keeps pace with how fast people can vouch",
  "about.contrast.us.valueStays":
    "Membership funds a mutual-aid pot the community controls",
  "about.beliefs.eyebrow": "What we believe",
  "about.beliefs.title": "The values behind <em>every decision.</em>",
  "about.values.smallByDesign.title": "Small by design",
  "about.values.smallByDesign.body":
    "We'd rather stay a room that works than become a platform that doesn't. Growth is never the goal on its own.",
  "about.values.infrastructure.title": "We build infrastructure",
  "about.values.infrastructure.body":
    "We're building the plumbing queer community needs: introductions, safe spaces, mutual aid.",
  "about.values.communityEconomy.title": "A community economy",
  "about.values.communityEconomy.body":
    "Money that moves through QueerPulse (memberships, tips, grants) stays inside the community it came from.",
  "about.values.communityOwns.title": "The community owns its space",
  "about.values.communityOwns.body":
    "Decisions about this platform are made in the open, with the people who use it.",
  "about.values.noDataEconomy.title": "No data economy",
  "about.values.noDataEconomy.body":
    "We don't sell attention or personal data to advertisers. There's no third party we're building this for.",
  "about.values.accessNotEarned.title": "Access isn't earned by performing",
  "about.values.accessNotEarned.body":
    "You get in through trust: a vouch, or an invitation from someone already here.",
  "about.stand.eyebrow": "Where we stand",
  "about.stand.title": "Queer liberation is <em>indivisible.</em>",
  "about.stand.p1":
    "Intersectionality is the whole of queer politics. Race, class, disability, migration status, and gender all shape who gets safety and who gets asked to wait for it. A platform that serves only white, cis, able-bodied, documented, comfortable queer people has misunderstood the word community.",
  "about.stand.p2":
    "That belief has to cost us something to be real. It shapes who we invite, who moderates, whose complaints get taken seriously, and which struggles we are willing to name out loud when naming them is expensive.",
  "about.stand.intersectionalityLink":
    "Read how members describe living at those intersections",
  "about.stand.trans.title": "On trans lives",
  "about.stand.trans.p1":
    "Trans women are women. Trans men are men. Nonbinary people are nonbinary, and intersex people exist. We hold none of that tentatively, and none of it is open for debate on this platform.",
  "about.stand.trans.p2":
    "There is a project that claims to speak for LGB people while lobbying against the T. It arrives dressed as a defence of women, or of children, or of same-sex attraction, and it works by asking everyone else to treat trans membership of this community as an open question. We treat it as settled. A group organising to split the T away from the rest of us is organising against our members, and we will name it as that.",
  "about.stand.trans.p3":
    "The move is a familiar one. Pinkwashing borrows our rights to make a state look civilised; this borrows women's safety to make exclusion look like protection. Both spend somebody else's dignity to buy respectability.",
  "about.stand.trans.commitment.notADebate.title":
    "Trans membership is not a debate topic.",
  "about.stand.trans.commitment.notADebate.body":
    "We host no \u201cboth sides\u201d discussion about whether members deserve rights, and we will not run one for the sake of balance.",
  "about.stand.trans.commitment.exclusion.title":
    "Trans-exclusionary advocacy is a Code of Conduct matter.",
  "about.stand.trans.commitment.exclusion.body":
    "Criticising a state is political speech. Campaigning to remove a class of member is something else, and calling it gender-critical leaves it exactly what it was.",
  "about.stand.trans.commitment.exclusion.link": "Read the guidelines",
  "about.stand.trans.commitment.selfId.title":
    "Self-identification is the standard here.",
  "about.stand.trans.commitment.selfId.body":
    "No member is asked to prove their gender, to a moderator or to anyone else, at any point.",
  "about.stand.trans.commitment.selfId.link": "Read the trans healthcare guide",
  "about.stand.position.sexWork.title": "Sex work is work.",
  "about.stand.position.sexWork.body":
    "Sex workers are members here on the same terms as everyone else. Decriminalisation is the position that keeps people alive, and the politics that wants sex workers out of queer spaces runs on the same engine as the politics that wants trans people out of them.",
  "about.stand.position.migration.title": "Migration is a queer issue.",
  "about.stand.position.migration.body":
    "Queer people move to survive. Portugal's asylum and residency system is slow in ways that ruin lives, and racism toward Brazilian, PALOP, and South Asian members shows up in queer spaces here as readily as anywhere else. A far right that has grown fast in this country wants all of it worse.",
  "about.stand.position.migration.link": "Read the intersectionality guide",
  "about.stand.position.hiv.title": "U = U, and serophobia is discrimination.",
  "about.stand.position.hiv.body":
    "Undetectable means untransmittable. A member's HIV status belongs to them, disclosure is never owed to anyone, and treating serostatus as grounds to exclude someone falls under the same hard line as any other discrimination.",
  "about.stand.position.hiv.link": "Sexual health resources",
  "about.stand.principle.title": "When we speak, and when we don't",
  "about.stand.principle.body":
    "We speak where our community is directly implicated, and where queer identity is being used as cover for harm. That is the whole test. It is why these positions are on this page and most of the news is not, and it is the standard to hold us to when you think we have gone quiet about something we should not have.",
  "about.stand.palestine.title": "On Palestine",
  "about.stand.palestine.p1":
    "Israel is committing a genocide against Palestinians in Gaza. We say it plainly, because the pressure to soften it is the point. QueerPulse stands with Palestinians, and with everyone working toward an end to the occupation and the siege.",
  "about.stand.palestine.p2":
    "We also refuse the use of our lives as cover for it. Pinkwashing holds LGBTQ+ rights up as proof that a state is civilised while that same state bombs, starves, and displaces. Our safety has never been an argument for anyone else's destruction, and we will not lend it out as one.",
  "about.stand.commitment.speech.title": "Palestine advocacy is welcome here.",
  "about.stand.commitment.speech.body":
    "Criticising a state, its military, or its ideology is political speech, and we moderate it as such. Antisemitism and anti-Palestinian racism are both Code of Conduct breaches, enforced the same way.",
  "about.stand.commitment.speech.link": "Read the guidelines",
  "about.stand.commitment.money.title": "We take no complicit money.",
  "about.stand.commitment.money.body":
    "No sponsorship, funding, or partnership from companies or institutions materially complicit in the occupation.",
  "about.stand.commitment.mutualAid.title":
    "The mutual-aid pot can fund solidarity work.",
  "about.stand.commitment.mutualAid.body":
    "Palestinian solidarity and relief work is eligible, decided in the open like every other allocation.",
  "about.stand.commitment.mutualAid.link": "See how allocations are made",
  "about.who.eyebrow": "Who's behind this",
  "about.who.title": "Built by <em>community, for community.</em>",
  "about.who.p1":
    "QueerPulse is run by the people who use it, a small founding team, and a growing circle of members who help shape what comes next.",
  "about.who.p2":
    "We're not backed by venture capital chasing a return. We're backed by memberships, donations, and grants that keep the platform independent.",
  "about.contactStrip.title": "Questions? <em>We're reachable.</em>",
  "about.contactStrip.body":
    "No support tickets vanishing into a queue. A real person reads what you send.",
  "about.contactStrip.contactCta": "Contact us",
  "about.contactStrip.governanceCta": "Read our governance",
  "about.outro.title": "Come see for <em>yourself.</em>",
  "about.outro.sub":
    "The best way to understand QueerPulse is to be inside it.",
  "about.outro.cta": "Request an invite",

  // ── Activism ───────────────────────────────────────────────────────────
  "activism.backToVolunteer": "Back to Volunteering",
  "activism.meta.title":
    "Activism with QueerPulse: ways to get involved in Lisbon",
  "activism.meta.description":
    "A practical guide to queer activism in Lisbon: where to start, what a skill can do, how to mobilise, and the partner organisations already doing the work.",
  "activism.hero.eyebrow": "Activism",
  "activism.hero.title": "Community care is <em>political.</em>",
  "activism.hero.sub":
    "Ways to get involved, locally and further out: from a Tuesday afternoon to a standing commitment.",
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
    "Here's a ladder. Pick the rung that matches what you have to give this month.",
  "activism.start.step1.title": "Show up once",
  "activism.start.step1.body":
    "Come to a gathering, a vigil, a community meeting. Presence is the first act.",
  "activism.start.step2.title": "Give a few hours",
  "activism.start.step2.body":
    "Pick one recurring slot, a helpline shift, an outreach afternoon, a stall at an event.",
  "activism.start.step3.title": "Bring a skill",
  "activism.start.step3.body":
    "Design, code, cooking, care work: orgs need all of it, every skill counts.",
  "activism.start.step4.title": "Commit",
  "activism.start.step4.body":
    "Join a board, run a campaign, mentor someone newer to organising.",
  "activism.local.title": "Locally, <em>in Lisbon</em>",
  "activism.local.p1":
    "The fights closest to home rarely make headlines, housing, healthcare access, a venue under threat.",
  "activism.local.p2":
    "Right now, <b>Mouraria and Intendente</b> are the neighbourhoods where queer tenants need the most support.",
  "activism.local.banner.title": "Housing pressure in Mouraria",
  "activism.local.banner.body":
    "Several queer households are facing non-renewal notices this quarter. The Housing Advocate role below is a direct response.",
  "activism.skills.title": "Bring a <em>skill</em>",
  "activism.skills.p1":
    "Every organisation below needs more than volunteers with picket signs. They need your actual craft.",
  "activism.skills.design.title": "Design",
  "activism.skills.design.body":
    "Campaign materials, zines, signage, visual work that makes an argument land.",
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
    "<b>Turn out in numbers.</b> Bring someone with you. Numbers change what's politically possible.",
  "activism.mobilise.p2":
    "<b>Document what you see.</b> Photos and notes from an action matter later, for accountability and for history.",
  "activism.mobilise.p3":
    "<b>Follow up, don't just attend.</b> The work after the march is where most of the actual change happens.",
  "activism.feel.title": "How it <em>feels</em>",
  "activism.feel.p1":
    "Burnout is real. Activism that only takes and never restores isn't sustainable, for you or for the movement.",
  "activism.feel.p2":
    "It's fine to step back. It's fine to do less than you think you should. Rest is part of the work.",
  "activism.feel.banner.title": "If you're close to burnout",
  "activism.feel.banner.body":
    "Talk to peer support before you disappear entirely. Stepping back with a plan beats vanishing without one.",
  "activism.orgs.title": "Partner <em>organisations</em>",
  "activism.orgs.p1":
    "Four Portuguese organisations we work with directly: all of them welcome volunteers.",
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
    "The binding Code of Conduct QueerPulse enforces: six commitments members make, what counts as harm, how reports are handled, and how to appeal a decision.",
  "coc.hero.backLabel": "Governance",
  "coc.hero.eyebrow": "Code of Conduct · in effect since {date}",
  "coc.hero.title": "How we treat <em>each other here.</em>",
  "coc.hero.dek":
    "This is the binding document, <b>enforceable</b> and held to. If a report is upheld, this is what we measure it against.",
  "coc.distinction.thisPage.title": "This page",
  "coc.distinction.thisPage.body":
    "The <b>Code of Conduct</b>, what's enforceable, what happens when it's broken, how to appeal.",
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
    "This Code applies everywhere on QueerPulse (<strong>posts, messages, gatherings, comments, profiles</strong>) and to conduct off-platform when it directly affects another member's safety here.",
  "coc.scope.p2":
    "It applies to every member, <em>without exception</em>, founders, staff, moderators included.",
  "coc.scope.p3":
    "It does not apply to disagreement itself. Being wrong, or unpopular, is not a violation. <em>Causing harm is.</em>",
  "coc.pact.title": "§02 The <em>pact</em>",
  "coc.pact.lead": "Six commitments every member makes by joining.",
  "coc.pact.item01.title": "We show up as ourselves",
  "coc.pact.item01.body":
    "Bring your full identity. Nobody here is required to perform a more palatable version of themselves.",
  "coc.pact.item02.title": "We ask before we assume",
  "coc.pact.item02.body":
    "Pronouns, boundaries, comfort levels: check, don't guess.",
  "coc.pact.item03.title": "We keep this room private",
  "coc.pact.item03.body":
    "What happens here stays here, unless the person involved says otherwise.",
  "coc.pact.item04.title": "We take up appropriate space",
  "coc.pact.item04.body":
    "Notice when you're dominating a conversation. Make room for quieter voices.",
  "coc.pact.item05.title": "We repair the harm",
  "coc.pact.item05.body":
    "A real apology changes the behaviour. Words alone aren't enough.",
  "coc.pact.item06.title": "We report harm to someone who can act",
  "coc.pact.item06.body":
    "If something's wrong, tell someone who can act on it.",
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
    "Discomfort isn't the same as harm. We look at what was actually said or done.",
  "coc.harm.friction.criticism.lead": "Criticism of the platform.",
  "coc.harm.friction.criticism.rest":
    "Including criticism of us, the people who run it.",
  "coc.harm.friction.politicalViews.lead": "Political views you don't share.",
  "coc.harm.friction.politicalViews.rest":
    "As long as they don't target another member's identity or safety.",
  "coc.harm.closing":
    "What counts is <em>impact</em>. “I didn't mean it that way” doesn't undo harm that landed.",
  "coc.enforce.title": "§04 <em>Enforcement</em>",
  "coc.enforce.lead":
    "A graduated ladder: most reports resolve at the first or second step.",
  "coc.ladder.step1.title": "A private word",
  "coc.ladder.step1.body":
    "A moderator reaches out directly, informally, before anything is on the record.",
  "coc.ladder.step2.title": "A formal warning",
  "coc.ladder.step2.body":
    "Documented, attached to the account. <em>One warning stays private</em>. It's not broadcast.",
  "coc.ladder.step3.title": "Temporary suspension",
  "coc.ladder.step3.body":
    "A cooling-off period, from days to weeks, depending on severity.",
  "coc.ladder.step4.title": "Removal from a space",
  "coc.ladder.step4.body":
    "Loss of access to a specific gathering, community, or channel, while the rest of the platform stays open.",
  "coc.ladder.step5.title": "Removal from QueerPulse",
  "coc.ladder.step5.body":
    "Reserved for serious or repeated violations. <em>Always reviewable on appeal.</em>",
  "coc.report.title": "How to <em>report</em>",
  "coc.report.body":
    "Every report is read and actioned by a person. We aim to respond within 48 hours.",
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
    "This is used <em>rarely and carefully</em>. It is never a general license to police members' lives outside the platform.",
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
    "(This is a prototype download. The production file will match the web page exactly.)",

  // ── Cookies ────────────────────────────────────────────────────────────
  "cookies.meta.title": "QueerPulse Cookie Policy and preferences",
  "cookies.meta.description":
    "Which cookies QueerPulse uses, all strictly necessary or functional, what each one does, and how to manage your privacy choices. No advertising or analytics cookies.",
  "cookies.eyebrow": "Cookies",
  "cookies.h1": "The cookies we <em>use,</em> and why.",
  "cookies.sub":
    "A short, plain-language list. Every cookie here is essential or functional. There's nothing to switch off.",
  "cookies.essential.title": "Essential",
  "cookies.essential.body":
    "Needed to keep you signed in and your account secure. Can't be switched off.",
  "cookies.functional.title": "Functional",
  "cookies.functional.body":
    "Remember your preferences: theme, language, notification settings.",
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
    "So there's no ad-tech cookie category here. Nothing to sell your attention to.",
  "cookies.summary.title": "Your <em>summary</em>",
  "cookies.summary.essential": "Essential",
  "cookies.summary.functional": "Functional",
  "cookies.actions.managePreferences": "Manage preferences",
  "cookies.info":
    "Manage your privacy choices any time in <settingsLink>Settings</settingsLink>. Full detail in the <privacyLink>Privacy Policy</privacyLink>.",
  "cookies.outro.title": "Questions about <em>your data?</em>",
  "cookies.outro.sub": "The Privacy Policy covers everything cookies don't.",
  "cookies.outro.cta": "Read the Privacy Policy",

  // ── Data Subject Access Requests (DSAR) ───────────────────────────────
  "dsar.backToPrivacyLabel": "Privacy Policy",
  "dsar.eyebrow": "Data rights",
  "dsar.h1": "Exercise your <em>data rights.</em>",
  "dsar.lead":
    "Under <b>GDPR</b>, you can ask for a copy of your data, a correction, or its deletion, <em>at no cost</em>.",
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
    "This is separate from deleting your account. Tell us exactly what you want removed.",
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
    "Be as specific as you can. This speeds up the review.",
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
    "Attach anything that helps us verify or process the request, <em>never required</em> to submit.",
  "dsar.form.contextLabel": "Anything else we should know?",
  "dsar.form.contextPlaceholder": "Extra context for our team",
  "dsar.legalStrip":
    "We'll respond within <b>30 days</b>, as required by law. See <link>data retention</link> for how long we keep things by default.",
  "dsar.actions.info":
    "Requests are reviewed by a person on our privacy team, <b>never fully automated</b>.",
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
  "dsar.past.error":
    "We couldn't load your past requests. Please try again shortly.",
  "dsar.past.empty": "You haven't filed any requests yet.",
  "dsar.past.objectAnalytics": "Objection · Analytics",
  "dsar.toast.submitted": "Request submitted: reference {ref}",
  "dsar.toast.submitError":
    "We couldn't record that request. Nothing was sent. Mind trying again?",

  // ── Community Guidelines ──────────────────────────────────────────────
  "guidelines.meta.title": "QueerPulse Community Guidelines",
  "guidelines.meta.description":
    "The culture we're building together on QueerPulse, how to show up, disagree well, and keep the space safe, distinct from the enforceable Code of Conduct.",
  "guidelines.hero.eyebrow": "Community Guidelines",
  "guidelines.hero.title": "The culture we're <em>building together.</em>",
  "guidelines.hero.sub":
    "Not enforceable rules. That's the Code of Conduct. This is what good looks like here.",
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
    "Most friction here comes from misunderstanding. Ask before you assume the worst.",
  "guidelines.clause02.li1": "Read a message twice before reacting to it.",
  "guidelines.clause02.li2":
    "Ask a clarifying question instead of assuming intent.",
  "guidelines.clause02.li3": "Give people room to phrase something clumsily.",
  "guidelines.clause02.li4": "Assume you might be missing context.",
  "guidelines.clause02.li5":
    "Disagree with the point while respecting the person.",
  "guidelines.clause02.p2":
    "Good faith isn't infinite. Repeated bad behaviour stops getting the benefit of the doubt.",
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
  "guidelines.clause07.reportLead": "Report it. You'll be supported.",
  "guidelines.clause07.reportBody":
    "If someone crosses one of these lines, report them or the post from its menu. Moderators read every report, and you're never left to handle it alone. Confirmed breaches lead to a warning, suspension, or removal, and we cooperate with the authorities where someone's safety is at risk. You are never overreacting by reporting.",
  "guidelines.clause08.titlePre": "Political speech ",
  "guidelines.clause08.titleEm": "stays political",
  "guidelines.clause08.p1":
    "Criticising a state, its government, its military, or its ideology is political speech, and we moderate it as political speech. That includes advocacy for Palestinian liberation, which is welcome here and will not be removed for making people uncomfortable.",
  "guidelines.clause08.p2":
    "It becomes a Code of Conduct matter when it lands on a person. Holding a member answerable for a state's actions because of their ethnicity, religion, or nationality is discrimination under the hard lines above. The same goes for advocacy aimed at a class of member rather than at a state: criticism of a government is political speech, and campaigning to remove trans members is not, however it is labelled.",
  "guidelines.clause08.li4":
    "Campaigning for the exclusion of trans members from this community, whatever vocabulary it borrows",
  "guidelines.clause08.hardLinesHead": "Still a Code of Conduct matter",
  "guidelines.clause08.li1":
    "Antisemitism, including conspiracy framing and holding Jewish members answerable for a state's actions",
  "guidelines.clause08.li2":
    "Anti-Palestinian racism, including treating Palestinian or Arab members as suspect by default",
  "guidelines.clause08.li3":
    "Harassment of any member over their nationality, ethnicity, or religion",
  "guidelines.clause08.p3Lead": "Both directions are enforced the same way.",
  "guidelines.clause08.p3Rest":
    "Moderators apply one test: is this about a state and its conduct, or about a person and who they are. QueerPulse's own position on Palestine is set out on the About page, and it does not change how a report is handled.",
  "guidelines.final.p2": "Thanks for building this with us.",
  "guidelines.modalDone": "I've read it, done",
  "guidelines.modalScrollHint": "Scroll to the end to continue.",
  "guidelines.outro.title": "Now you know <em>the culture.</em>",
  "guidelines.outro.sub":
    "The Code of Conduct covers what happens if it's broken.",
  "guidelines.outro.backCta": "Back to home",

  // ── Help ───────────────────────────────────────────────────────────────
  "help.meta.title": "QueerPulse help centre: invites, safety, gatherings",
  "help.meta.description":
    "Answers to common QueerPulse questions, how invites work, managing your account, RSVPs and hosting gatherings, reporting and appeals, and membership tiers.",
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
    "You'll set up your profile, and your account is active immediately: no waiting period.",
  "help.qa.lisbonOnly.q": "Is QueerPulse only for people in Lisbon?",
  "help.qa.lisbonOnly.a":
    "Gatherings are Lisbon-based, but membership itself isn't location-locked. Plenty of members join remotely for the network and the magazine.",
  "help.qa.free.q": "Is QueerPulse free?",
  "help.qa.free.a": "Yes, QueerPulse is free to join and use.",
  "help.qa.changeName.q": "How do I change my name or pronouns?",
  "help.qa.changeName.a":
    "Head to <settingsLink>Settings</settingsLink> → Profile. Changes apply everywhere immediately.",
  "help.qa.privateProfile.q": "Can I make my profile private?",
  "help.qa.privateProfile.a":
    "Yes, in <settingsLink>Settings</settingsLink> → Privacy. A private profile is still visible to people you're connected with. It just <strong>won't appear in search or the public directory</strong>.",
  "help.qa.unknownSession.q":
    "I don't recognise a device in my active sessions. What now?",
  "help.qa.unknownSession.a":
    "Sign that session out from <sessionsLink>your active sessions</sessionsLink>. Signing in runs through Google, so review your Google account's security too, since anyone with access to it can get in here. Then <contactLink>tell us what happened</contactLink> and we'll help you lock things down.",
  "help.qa.deleteAccount.q": "How do I delete my account?",
  "help.qa.deleteAccount.a":
    "In <settingsLink>Settings</settingsLink> → Account, at the bottom. This is permanent. See the Privacy Policy for what's retained and for how long.",
  "help.qa.levels.q": "What do the different member levels mean?",
  "help.qa.levels.a":
    "Levels reflect how long you've been vouched into the community and your activity. They are a trust signal, and everything stays free.",
  "help.qa.rsvp.q": "How do RSVPs work?",
  "help.qa.rsvp.a":
    "Confirm on the event page via the <calendarLink>calendar</calendarLink> or events board. <strong>Spots are limited</strong> at most gatherings, so RSVP early.",
  "help.qa.hostGathering.q": "Can I host my own gathering?",
  "help.qa.hostGathering.a":
    "Yes, see the <hostLink>hosting guide</hostLink> for a step-by-step walkthrough.",
  "help.qa.cantMakeIt.q": "I RSVP'd but can't make it. What do I do?",
  "help.qa.cantMakeIt.a":
    "Cancel your RSVP from the event page as soon as you know, so someone on the waitlist can take your spot.",
  "help.qa.waitlist.q": "How does the waitlist work?",
  "help.qa.waitlist.a":
    "You're notified automatically the moment a spot opens, with a short window to claim it before it moves to the next person.",
  "help.qa.reportMember.q": "How do I report another member?",
  "help.qa.reportMember.a":
    "From their profile, a post, or a message, use the report option. Every report goes to a human moderator.",
  "help.qa.afterReport.q": "What happens after I file a report?",
  "help.qa.afterReport.a":
    "We aim to respond within 48 hours. <strong>You'll hear back either way</strong>, even if we decide no action is needed.",
  "help.qa.appeal.q": "Can I appeal a moderation decision?",
  "help.qa.appeal.a":
    "Yes, every decision can be appealed once, reviewed by a different moderator. See <governanceLink>Governance</governanceLink> for the full process.",
  "help.qa.blockMute.q": "What's the difference between blocking and muting?",
  "help.qa.blockMute.a":
    "<strong>Blocking</strong> removes all contact both ways. <strong>Muting</strong> just hides someone from your feed. They can't tell either has happened.",
  "help.qa.invitesWork.q": "How many invites do I get?",
  "help.qa.invitesWork.a":
    "Every member starts with a small pool of invites that refills over time, based on how the community is growing.",
  "help.qa.vouching.q": "What does vouching actually mean?",
  "help.qa.vouching.a":
    "When you vouch for someone, you're telling the community you trust them to be here. It's a real signal that carries weight.",
  "help.qa.perks.q": "What do I get as a Sustainer?",
  "help.qa.perks.a":
    "Early access to events, a supporter badge, and the knowledge that your membership keeps the platform ad-free.",
  "help.qa.emailNotifications.q": "How do I control notifications?",
  "help.qa.emailNotifications.a":
    "In <settingsLink>Settings</settingsLink> → Notifications, toggle each category independently. QueerPulse notifies you in the app and, if you allow it, by push. It sends no email.",
  "help.qa.browserSupport.q": "Which browsers does QueerPulse support?",
  "help.qa.browserSupport.a":
    "Current versions of Chrome, Firefox, Safari, and Edge. Older browsers may have display issues.",
  "help.qa.somethingBroken.q": "Something's broken. What do I do?",
  "help.qa.somethingBroken.a":
    "Try refreshing first. If it persists, <contactLink>let us know</contactLink> with as much detail as you can.",
  "help.stillStuck.title": "Still stuck?",
  "help.stillStuck.body":
    "A real person reads every message that comes through here.",
  "help.stillStuck.cta": "Contact us",

  // ── Shared legal-doc chrome (Terms / Privacy) ─────────────────────────
  "legal.eyebrow": "Legal",
  "legal.plainSummaryTitle": "In plain language",
  "legal.toc.title": "Contents",
  "legal.contact.emailCta": "Email us",
  "legal.viewFullPage": "View the full policy page",

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
    "The organisations QueerPulse partners with in Portugal and beyond, each vetted for alignment with our values before being listed. No one pays to appear here.",
  "partners.hero.eyebrow": "Partners",
  "partners.hero.title": "Organisations we <em>stand with.</em>",
  "partners.hero.sub":
    "Vetted partners across Portugal and beyond, working alongside QueerPulse on the ground.",
  "partners.interstitial.quote":
    "We don't partner with everyone who asks. <em>We partner with people already doing the work.</em>",
  "partners.interstitial.body":
    "Every organisation below has been reviewed for alignment with our values before appearing here.",
  "partners.section.title": "Our <em>partners</em>",
  "partners.section.sub": "Filter isn't available yet. Here's the full roster.",
  "partners.card.viewCta": "View profile",
  "partners.loadingMore": "Loading more partners…",
  "partners.loadMoreCta": "Load more partners",
  "partners.why.title": "Why we <em>partner</em>",
  "partners.why.p1":
    "QueerPulse can't do everything: legal aid, healthcare, youth work all need dedicated expertise we don't have in-house.",
  "partners.why.p2":
    "Partnering means we can point members toward organisations we've actually vetted, instead of a generic search result.",
  "partners.why.p3":
    "It also means real resources move: <strong>referrals, volunteer hours, and in some cases funding.</strong>",
  "partners.why.p4": "None of these organisations pay to be listed here.",
  "partners.become.title": "Want to <em>partner with us?</em>",
  "partners.become.body":
    "If your organisation does aligned work in or around Lisbon, we'd like to hear from you.",
  "partners.become.applyCta": "Apply to partner",
  "partners.become.emailCta": "hello@queerpulse.com",
  "partners.outro.title": "Know an org that <em>should be here?</em>",
  "partners.outro.sub": "Tell us. We're always looking for aligned partners.",

  // ── Press Kit ──────────────────────────────────────────────────────────
  "pressKit.meta.title": "QueerPulse press kit: logos, facts, boilerplate",
  "pressKit.meta.description":
    "Everything a journalist needs to write about QueerPulse, pre-cleared boilerplate, marks, key facts, and a direct press contact.",
  "pressKit.hero.eyebrow": "Press",
  "pressKit.hero.title": "Everything you need to <em>write about us.</em>",
  "pressKit.hero.dek":
    "Boilerplate, marks, colour, and facts, <b>pre-cleared</b> for direct use, no sign-off required.",
  "pressKit.hero.downloadKitCta": "Download the full kit",
  "pressKit.hero.askPersonCta": "Ask a real person",
  "pressKit.contact.deskLabel": "<b>Press desk:</b>",
  "pressKit.contact.phoneLabel": "<b>By phone</b>, on request",
  "pressKit.contact.responseLabel": "We respond within <b>48 hours</b>",
  "pressKit.contact.languagesLabel": "<b>EN / PT</b>",
  "pressKit.contact.email": "hello@queerpulse.com",
  "pressKit.footerNote.licence":
    "All assets here are released under a <a>CC BY 4.0</a> licence for editorial use.",
  "pressKit.footerNote.commercial":
    "For commercial use, <a>get in touch</a> first.",
  "pressKit.outro.title": "Still need <em>something specific?</em>",
  "pressKit.outro.sub":
    "Ask the press desk directly: most requests get a same-day reply.",
  "pressKit.outro.contactCta": "Email the press desk",
  "pressKit.downloadModal.eyebrow": "Full kit · ZIP",
  "pressKit.downloadModal.title": "Download the <em>complete kit.</em>",
  "pressKit.downloadModal.lead":
    "Every brand asset on this page in one archive, <b>with a README and the licence</b>, ready for your CMS.",
  "pressKit.downloadModal.buttonLabel": "Download · ZIP",
  "pressKit.subpageIndex.title": "Related",
  "pressKit.subpageIndex.archive.label": "Press archive",
  "pressKit.subpageIndex.archive.blurb":
    "Every past mention and feature, in one place.",
  "pressKit.modal.dialogAriaLabel": "Download asset",
  "pressKit.modal.closeAriaLabel": "Close",
  "pressKit.modal.success.title": "Downloaded. <em>You're set.</em>",
  "pressKit.modal.success.body":
    "<b>{filename}</b> should be in your downloads folder now.",
  "pressKit.modal.closeCta": "Close",
  "pressKit.modal.cancelCta": "Cancel",
  "pressKit.preview.readme.title": "README + licence",
  "pressKit.preview.readme.desc": "Usage terms and file index",
  "pressKit.preview.marks.title": "Mark · SVG",
  "pressKit.preview.marks.desc": "Full colour and monochrome, vector",
  "pressKit.preview.marksPng.title": "Wordmark · PNG",
  "pressKit.preview.marksPng.desc": "Three colourways, 2048 px wide",
  "pressKit.preview.appIcon.title": "App icon · PNG",
  "pressKit.preview.appIcon.desc": "512 px, as it ships on devices",
  "pressKit.preview.brandReference.title": "Colour and type reference",
  "pressKit.preview.brandReference.desc":
    "Printable PDF, straight from the design tokens",
  "pressKit.preview.colour.title": "Brand colours",
  "pressKit.preview.colour.desc": "Every hex and RGB value as plain text",
  "pressKit.boiler.short.wc": "25 words · 196 char",
  "pressKit.boiler.short.text":
    "QueerPulse is a small, invite-based queer community platform rooted in Lisbon, connecting professionals, creatives, activists and community members for work, community, culture and mutual support.",
  "pressKit.boiler.med.wc": "60 words · 424 char",
  "pressKit.boiler.med.text":
    "QueerPulse is a small, invite-based queer community platform rooted in Lisbon, founded in 2024 by professionals, organisers and artists building an alternative to attention-driven networks: no ads, no algorithm deciding what members see. Members are vouched in by someone already there. Not backed by venture capital, the platform runs on memberships, donations and grants, and publishes a member magazine for its community.",

  // ── Communities Explainer ──────────────────────────────────────────────
  "communitiesAbout.meta.title": "How communities work on QueerPulse",
  "communitiesAbout.meta.description":
    "Real rooms, kept by real people, no ads and no algorithm. See how QueerPulse communities work, and how to find the one that feels like yours.",
  "communitiesAbout.hero.eyebrow": "Communities",
  "communitiesAbout.hero.title":
    "How communities work, and why they <em>matter</em>",
  "communitiesAbout.hero.sub":
    "Real rooms, kept by real people. No feeds, no algorithm. Here's what that means, and how to find the one that feels like yours.",
  "communitiesAbout.hero.browseCta": "Browse communities",
  "communitiesAbout.outro.title": "Ready to find your people?",
  "communitiesAbout.outro.sub":
    "Request an invite and we'll help you find the rooms that feel like home.",
  "communitiesAbout.what.title": "What a community is here",
  "communitiesAbout.what.rooms.title": "Rooms with a purpose",
  "communitiesAbout.what.rooms.body":
    "A community is a room with a purpose and someone who keeps it. You always know whose space you're in.",
  "communitiesAbout.what.kept.title": "Kept by real people",
  "communitiesAbout.what.kept.body":
    "Every community has a keeper who sets the tone, welcomes new faces, and looks out for the room.",
  "communitiesAbout.what.safe.title": "A space you can trust",
  "communitiesAbout.what.safe.body":
    "Communities are invite-only and moderated, so the room stays somewhere you can actually be yourself.",
  "communitiesAbout.how.title": "How it works",
  "communitiesAbout.how.find.title": "Find your room",
  "communitiesAbout.how.find.body":
    "Browse communities by interest, scene, or neighbourhood until one feels like yours.",
  "communitiesAbout.how.welcome.title": "A keeper welcomes you",
  "communitiesAbout.how.welcome.body":
    "The keeper and members say hello, so you're never starting from nothing.",
  "communitiesAbout.how.belong.title": "You show up and belong",
  "communitiesAbout.how.belong.body":
    "Join the conversation, come to gatherings, and become one of the faces others are glad to see.",
  "communitiesAbout.why.title": "Why communities matter",
  "communitiesAbout.why.body":
    "Belonging isn't a feature. It's the <em>whole point</em>: where you find your people, feel safe, and stay close to what's happening near you.",

  // ── Privacy Policy ─────────────────────────────────────────────────────
  "privacy.meta.title": "QueerPulse Privacy Policy: what we collect and why",
  "privacy.meta.description":
    "What data QueerPulse collects, how it's used, who can see it, how long it's kept, and how to exercise your data rights, including a plain-language summary.",
  "privacy.title": "Privacy <em>Policy</em>",
  "privacy.meta.effective": "Effective {date}",
  "privacy.meta.lastUpdated": "Last updated {date}",
  "privacy.meta.version": "Version {version}",
  "privacy.plain.text":
    "We collect what we need to run the platform, never sell your data, and give you real control over what's shared and with whom. The details are below.",
  "privacy.contactCta":
    "Questions about this policy? <strong>Reach out any time</strong>. We'll answer in plain language.",
  "privacy.related.title": "Related",
  "privacy.related.dataRequestLabel": "Request your data",
  "privacy.related.dataRequestBlurb":
    "Access, correct, or delete your personal data under GDPR.",
  "privacy.whoWeAre.title": "Who we are",
  "privacy.whoWeAre.p1":
    "QueerPulse is run by a group of volunteers who build and look after queerpulse.com. There's no company or registered organisation behind it yet. This policy explains how we handle your personal data across the platform.",
  "privacy.whoWeAre.p2":
    "If anything here is unclear, contact us directly. We'd rather explain it than have you guess.",
  "privacy.whatWeCollect.title": "What we collect",
  "privacy.whatWeCollect.accountHeading": "Account information",
  "privacy.whatWeCollect.account.item1":
    "<strong>Profile details</strong> you add: name, pronouns, tagline, bio, photos.",
  "privacy.whatWeCollect.account.item2":
    "<strong>Contact information</strong>: your email address, used to sign you in and send the notifications you've turned on.",
  "privacy.whatWeCollect.account.item3":
    "<strong>Membership data</strong>: your tier, join date, who invited you, and who vouched for you.",
  "privacy.whatWeCollect.signInHeading": "How you sign in",
  "privacy.whatWeCollect.signInBody":
    "You sign in with <strong>Google</strong>. There's no separate QueerPulse password to manage. When you do, Google shares your name, email, and profile photo with us. We never see or store your Google password.",
  "privacy.whatWeCollect.deviceHeading": "Device & technical data",
  "privacy.whatWeCollect.device.item1":
    "<strong>The browser and device</strong> you sign in from, kept with your active sessions so you can see them and sign out remotely.",
  "privacy.whatWeCollect.device.item2":
    "<strong>Push notification details</strong>: if you turn notifications on, the address your browser gives us and its keys, so we can deliver them. Turn it off any time.",
  "privacy.whatWeCollect.device.item3":
    "<strong>Your IP address</strong>, used only in the moment to keep the platform secure and prevent abuse. It isn't stored against your account.",
  "privacy.whatWeCollect.activityHeading": "Activity data",
  "privacy.whatWeCollect.activity.item1":
    "<strong>Posts, comments, and messages</strong> you send on the platform.",
  "privacy.whatWeCollect.activity.item2":
    "<strong>What keeps chat working</strong>: who's in a conversation, delivery and read receipts, reactions, and anyone you've blocked. Typing and who's online aren't stored. They're live-only.",
  "privacy.whatWeCollect.activity.item3":
    "<strong>Event RSVPs and attendance</strong>, so gatherings can plan around headcount.",
  "privacy.whatWeCollect.activity.item4":
    "<strong>A general location</strong> you choose to add, a city or area, and the map area you browse in the directory. We never read your device's precise location.",
  "privacy.whatWeCollect.notCollectedHeading": "What we don't collect",
  "privacy.whatWeCollect.notCollectedBody":
    "We don't run product analytics or behavioural tracking, we don't follow you across other websites, we don't sell data to advertisers, and we don't build an advertising profile of you. There's no ad network on this platform to feed.",
  "privacy.sensitive.title": "Your identity, on your terms",
  "privacy.sensitive.p1":
    "Some of what you share here is sensitive by nature. Your pronouns, gender identity, sexual orientation, whether you're out at work, the support you're looking for. We treat it with the care it deserves.",
  "privacy.sensitive.p2":
    "<strong>You decide what's visible.</strong> Most of this stays private to you by default. You choose what appears on your public profile and what stays for your eyes only. Where the law calls this special-category data, we hold it only because you chose to share it with your community.",
  "privacy.sensitive.p3":
    "Creative profiles can hold more: an astrologer's birth details, a peer-support or therapy listing's contact info. The same rule applies: it's there because you added it, visible exactly as you set it, and yours to change or remove any time.",
  "privacy.sensitive.p4":
    "<strong>Photos are cleaned before they're uploaded.</strong> Location and camera metadata are stripped from images on your device, so a picture can't quietly reveal where you were.",
  "privacy.howWeUse.title": "How we use it",
  "privacy.howWeUse.intro": "Your data is used only to:",
  "privacy.howWeUse.item1": "Run your account and keep you signed in securely",
  "privacy.howWeUse.item2":
    "Show you gatherings, communities, and content relevant to you",
  "privacy.howWeUse.item3":
    "Deliver your messages, notifications, and the connections you make",
  "privacy.howWeUse.item4":
    "Keep the platform safe: investigating reports, enforcing the Code of Conduct",
  "privacy.howWeUse.item5": "Send you notifications you've opted into",
  "privacy.howWeUse.item6":
    "Fix problems and keep the platform reliable, with your consent, through privacy-respecting error monitoring",
  "privacy.howWeUse.p1":
    "We never sell your data, use it to train AI models, or feed it to advertisers.",
  "privacy.whoSees.title": "Who sees your data",
  "privacy.whoSees.p1":
    "<strong>Other members</strong> see what your privacy settings allow: your public profile, posts, and anything you choose to share.",
  "privacy.whoSees.p2":
    "<strong>Our small team</strong> can access account data to provide support, investigate reports, and keep the platform running.",
  "privacy.whoSees.p3":
    "<strong>Service providers</strong>, the companies that host the platform, store your uploads, deliver our email, and (with your consent) monitor for errors, see only what's needed for their specific job, under contract.",
  "privacy.whoSees.p4":
    "<strong>Nobody else.</strong> We don't sell or rent your data to any third party, ever.",
  "privacy.retention.title": "How long we keep it",
  "privacy.retention.p1":
    "Account data is kept for as long as your account is active.",
  "privacy.retention.p2":
    "If you delete your account, most personal data is removed within 30 days, except where we're legally required to retain it (e.g. billing records).",
  "privacy.retention.p3":
    "Some things clear on their own, gathering attendance 30 days after the event, read notifications after 90 days, and unused push-notification registrations after 90 days.",
  "privacy.retention.p4":
    "When an account is deleted we keep a <strong>one-way fingerprint</strong> of the email that can never be turned back into the address itself, only to stop a removed account being quietly recreated.",
  "privacy.yourRights.title": "Your rights",
  "privacy.yourRights.intro": "Under GDPR, you have the right to:",
  "privacy.yourRights.item1":
    "<strong>Access</strong>: get a copy of everything we hold about you",
  "privacy.yourRights.item2":
    "<strong>Rectification</strong>: correct anything that's wrong",
  "privacy.yourRights.item3":
    "<strong>Erasure</strong>: ask us to delete your data",
  "privacy.yourRights.item4":
    "<strong>Objection</strong>: object to a specific use of your data",
  "privacy.yourRights.item5":
    "<strong>Portability</strong>: receive your data in a portable format",
  "privacy.yourRights.item6":
    "<strong>Restriction</strong>: limit how we process your data while a dispute is resolved",
  "privacy.yourRights.p1":
    "To exercise any of these, use our data request form. It's free and we respond within 30 days.",
  "privacy.yourRights.p2":
    "You can also lodge a complaint with the Comissão Nacional de Proteção de Dados (CNPD), Portugal's data protection authority.",
  "privacy.cookiesSection.title": "Cookies",
  "privacy.cookiesSection.p1":
    "We use a small number of cookies to keep you signed in and remember your preferences: your theme, language, and notification choices.",
  "privacy.cookiesSection.p2":
    "We don't use advertising or cross-site tracking cookies, and we don't run product analytics. There's no ad network here to feed.",
  "privacy.cookiesSection.p3":
    "See the full <strong>Cookie Policy</strong> for the complete list, and <em>manage your preferences</em> any time.",
  "privacy.thirdParties.title": "Third parties",
  "privacy.thirdParties.intro":
    "We work with a small number of service providers, each bound by contract to use your data only for the service they provide:",
  "privacy.thirdParties.item1":
    "<strong>Google</strong>: powers Sign in with Google, our only login. Google confirms who you are and shares your name, email, and profile photo.",
  "privacy.thirdParties.item2":
    "<strong>Cloud hosting & storage</strong>: where the platform runs and where your uploads are kept, in a private store.",
  "privacy.thirdParties.item3":
    "<strong>Email delivery</strong>: for account emails and the notifications you've turned on.",
  "privacy.thirdParties.item4":
    "<strong>Maps</strong>: map tiles from OpenFreeMap and address lookups via OpenStreetMap, to place venues on a map. They see the map area being viewed. Who you are stays private.",
  "privacy.thirdParties.item5":
    "<strong>Klipy</strong>: powers GIF search in messages. When you search for a GIF your search term reaches Klipy; your messages never do.",
  "privacy.thirdParties.optInIntro":
    "With your <strong>explicit opt-in</strong>, we also use:",
  "privacy.thirdParties.optItem1":
    "<strong>Error monitoring</strong>: a privacy-respecting service that alerts us to crashes, with no advertising and no profile of you.",
  "privacy.thirdParties.outro":
    "We never share your data with data brokers or advertising networks.",
  "privacy.changes.title": "Changes to this policy",
  "privacy.changes.p1":
    "We'll post material changes as an in-app notice before they take effect.",
  "privacy.changes.p2":
    "Minor clarifications may be published without notice. The version number and date at the top of this page always reflect the current text.",
  "privacy.contactSection.title": "Contact",
  "privacy.contactSection.body":
    "Questions about this policy or your data? Email <a>hello@queerpulse.com</a> and a real person will respond.",

  // ── Terms of Service ───────────────────────────────────────────────────
  "terms.meta.title": "QueerPulse Terms of Service",
  "terms.meta.description":
    "The rules for using QueerPulse, eligibility, account conduct, content ownership, event participation, and what happens if the terms are broken.",
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
  "terms.eligibility.why":
    "We keep it adults-only for a reason: so much of what happens here (frank talk about sex and sexual health, dating and nightlife, and the kind of unguarded conversation that only feels safe among adults) isn't a fit for minors, and mixing the two would put everyone's safety at risk. Under-18s deserve queer community too; this just isn't the room for it yet.",
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
    "Additional terms apply to magazine pitches and creative submissions. See the submission guidelines when you pitch.",
  "terms.events.title": "Gatherings and events",
  "terms.events.p1":
    "Gatherings are organised by members and QueerPulse; each carries its own attendance and cancellation terms shown on the event page.",
  "terms.events.p2":
    "Ticket prices for sliding-scale events are set by hosts within the platform's required tiers. QueerPulse takes no percentage of ticket revenue.",
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
    "Questions about these terms? Email <a>hello@queerpulse.com</a> and a real person will respond.",

  // ── Imprint / Legal Notice ────────────────────────────────────────────
  // QueerPulse is run by volunteers with no registered legal entity yet.
  // If that changes, add the confirmed registration details here.
  "imprint.meta.title": "Legal notice · QueerPulse",
  "imprint.meta.description":
    "Who runs QueerPulse: the volunteers behind the platform, how to reach a real person, and the law we answer to.",
  "imprint.meta.lastReviewed": "Last reviewed 1 June 2026",
  "imprint.title": "Legal <em>notice</em>",
  "imprint.plain.text":
    "The plain version: QueerPulse is built and run by a group of volunteers, not a registered company. This page tells you who's behind it, how to reach us, and the law we answer to.",
  "imprint.operator.title": "Who runs QueerPulse",
  "imprint.operator.p1":
    "QueerPulse is built and run by a group of volunteers. There's no company or registered organisation behind it yet. If that changes, we'll publish the registration details here.",
  "imprint.contact.title": "How to reach us",
  "imprint.contact.p1":
    "For anything on this page, or anything at all, email <a>{email}</a> and a real person will answer.",
  "imprint.contact.p2":
    "We reply in English or Portuguese, usually within two working days.",
  "imprint.representation.title": "Responsible for content",
  "imprint.representation.p1":
    "The volunteers who run QueerPulse are collectively responsible for what's published here. For anything about the site's content, email us and a real person will answer.",
  "imprint.hosting.title": "Hosting",
  "imprint.hosting.p1":
    "The platform runs on cloud hosting and storage. Your session and data are handled as described in our Privacy Policy.",
  "imprint.jurisdiction.title": "Governing law",
  "imprint.jurisdiction.p1":
    "QueerPulse operates under Portuguese and European Union law.",
  "imprint.jurisdiction.p2":
    "Any dispute we can't settle directly will be heard in the courts of Lisbon, Portugal, unless consumer-protection law gives you another right.",
  "imprint.disputes.title": "Online dispute resolution",
  "imprint.disputes.p1":
    "The European Commission runs an online dispute-resolution platform at ec.europa.eu/consumers/odr. We'd rather sort things out by email first. See “How to reach us” above.",
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
    "QueerPulse is a small, invite-based queer community platform rooted in Lisbon, founded in 2024 by a group of professionals, organisers and artists who wanted an alternative to attention-optimised networks: no ads, no algorithm, no growth for its own sake. It is run by the people who use it: a small founding team and a growing circle of members who help shape what comes next. Every member is vouched in by someone already there, and growth stays paced to how fast people can vouch. QueerPulse isn't backed by venture capital chasing a return; it's sustained instead by memberships, donations and grants that keep the platform independent. Money that moves through QueerPulse stays inside the community it came from, and the platform already publishes a member magazine, with more shared infrastructure planned as the community grows.",
  "pressKit.mark.section.title": "The <em>mark</em> and how to use it",
  "pressKit.mark.section.lead":
    "Three approved variations. The wordmark always carries the coral pulse dot, except in the inverse “coral” variant, where the dot becomes plum. Don't recolour the dot to anything else.",
  "pressKit.mark.logo.light.meta":
    "<b>Primary · light</b> · for cream/white backgrounds",
  "pressKit.mark.logo.plum.meta":
    "<b>Inverse · plum</b> · for dark backgrounds",
  "pressKit.mark.logo.coral.meta":
    "<b>Coral · solidarity</b> · use sparingly · pride contexts",
  "pressKit.mark.downloadLinkLabel": "PNG",
  "pressKit.mark.modal.eyebrow": "Wordmark · PNG",
  "pressKit.mark.modal.title": "The <em>mark</em>, ready to use.",
  "pressKit.mark.modal.lead":
    "What you see below is the file itself: <b>{filename}</b>, 2048 px wide with a transparent background, set in the wordmark's real typeface.",
  "pressKit.mark.modal.buttonLabel": "Download · PNG",
  "pressKit.mark.usageNote":
    "<b>Spacing:</b> always leave one full <em>P</em>-height of clear space around the mark. <b>Minimum size:</b> 88px wide on screen, 18 mm in print. <b>Don't:</b> stretch, recolour, set on busy photos, or pair with rainbow gradients we didn't make.",
  "pressKit.colour.section.title": "Colour, <em>full system</em>",
  "pressKit.colour.section.lead":
    "The whole brand runs on four hues. We do not introduce additional accent colours, including campaign-specific ones.",
  "pressKit.colour.plum.meta": "Brand anchor · headings, dark surfaces",
  "pressKit.colour.coral.meta": "Accent · CTAs, italic emphasis, the pulse dot",
  "pressKit.colour.cream.meta": "Page background · never pure white",
  "pressKit.colour.jade.meta": "Verified · live · success",
  "pressKit.team.section.title": "Named <em>spokespeople</em>",
  "pressKit.team.section.lead":
    "Three founding members are available for press comment. Quote them on their stated topics; don't paraphrase. <em>Other members are not available without explicit consent</em>. Please don't approach members directly through the platform.",
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
    "Selected English- and Portuguese-language pieces from 2024–2026. <em>Hit-counts welcome but not necessary</em>. Link to Press instead.",
  "pressKit.coverage.openingToast": "Opening coverage in {source}…",
  "pressKit.coverage.emptyLive.title": "Coverage will appear here",
  "pressKit.coverage.emptyLive.description":
    "Once QueerPulse is written about, we'll link the pieces here. For interviews or press enquiries, email hello@queerpulse.com.",
  "pressKit.downloads.section.title": "<em>Downloads</em>",
  "pressKit.downloads.section.lead":
    "Direct file links, served straight from the site. The complete kit bundles every file below with a README and the licence.",
  "pressKit.downloads.completeKit.title": "Complete press kit",
  "pressKit.downloads.completeKit.desc":
    "Mark, wordmark, app icon, colour and type reference, README",
  "pressKit.downloads.markSvg.title": "Mark · SVG",
  "pressKit.downloads.markSvg.desc": "Vector, full colour, recolour-safe",
  "pressKit.downloads.markMonochrome.title": "Monochrome mark · SVG",
  "pressKit.downloads.markMonochrome.desc":
    "Vector silhouette, for one-colour printing",
  "pressKit.downloads.wordmarkPng.title": "Wordmark · PNG",
  "pressKit.downloads.wordmarkPng.desc":
    "2048 px wide, transparent, for docs and slides",
  "pressKit.downloads.appIcon.title": "App icon · PNG",
  "pressKit.downloads.appIcon.desc": "512 px, as it ships on devices",
  "pressKit.downloads.brandReference.title": "Colour and type reference",
  "pressKit.downloads.brandReference.desc":
    "Printable PDF, every value read from the design tokens",
  "pressKit.downloads.modal.eyebrow": "Download · {format}",
  "pressKit.downloads.modal.lead":
    "{desc}. The download is the real <b>{filename}</b>, served straight from the site.",
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
    "Queer-owned or queer-friendly, big or tiny, if your place is good to our people, it belongs here. Tell us about it and the community team will take it from there. <b>Every listing is read by a human before it goes live.</b>",
  "listBusiness.wizard.stepAria": "Step {number}: {label}",
  "listBusiness.wizard.stepAriaDone": "Step {number}: {label} (done)",
  "listBusiness.wizard.stepAriaCurrent": "Step {number}: {label} (current)",
  "listBusiness.wizard.stepJumpAria": "Go back to step {number}: {label}",
  "listBusiness.wizard.stepOf": "Step {number} of {total}: {label}",
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
    "We couldn't send your listing just now. Your details are saved. Try again.",
  "listBusiness.toast.withdrawn": "Listing withdrawn",
  // Server-side validation (item #4)
  "listBusiness.serverError.title": "The community team's system flagged this",
  "listBusiness.serverError.dismiss": "Dismiss this message",
  // Save & finish later + cross-device drafts (item #11)
  "listBusiness.saveLater.cta": "Save & finish later",
  "listBusiness.saveLater.saving": "Saving…",
  "listBusiness.saveLater.toast":
    "Saved. Pick this back up any time. It's waiting in your drafts.",
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
  "listBusiness.step0.signedInAs":
    "You're signed in as <b>{name}</b>. We'll attach this submission to your member profile so the team knows who to thank (and ask, if needed).",
  // Step 1 — basics
  "listBusiness.step1.title": "Start with",
  "listBusiness.step1.em": "the basics.",
  "listBusiness.step1.sub":
    "Just enough to put your place on the map. You can make it sing in the next step.",
  "listBusiness.step1.nameLabel": "What's it called?",
  "listBusiness.step1.nameHelper": "The name as people would search for it.",
  "listBusiness.step1.namePlaceholder": "e.g. the name your regulars use",
  "listBusiness.step1.dupHead":
    "A place by this name may already be in the directory:",
  "listBusiness.step1.catsLabel": "What kind of place is it? Pick up to 2",
  "listBusiness.step1.catsAria": "Category",
  "listBusiness.step1.hoodLabel": "Which neighbourhood?",
  "listBusiness.step1.hoodPlaceholder": "Pick a Lisbon neighbourhood…",
  "listBusiness.step1.hoodOnlineHelper":
    "Optional for online-only spaces. Pick one if you have roots in a neighbourhood.",
  "listBusiness.step1.badgeLabel": "Who runs it?",
  "listBusiness.step1.badgeHelper":
    "Queer-owned, or a place that genuinely welcomes us? Both belong here. This is a welcome, open to everyone.",
  "listBusiness.step1.badgeAria": "Ownership",
  "listBusiness.step1.owned.tag": "Queer-owned",
  "listBusiness.step1.owned.title": "Owned or led by our community",
  "listBusiness.step1.owned.desc":
    "You, your co-owners, or leadership are LGBTQ+.",
  "listBusiness.step1.friendly.tag": "LGBTQ+ friendly",
  "listBusiness.step1.friendly.title": "A place that welcomes us",
  "listBusiness.step1.friendly.desc":
    "Not queer-owned, but actively safe and affirming.",
  "listBusiness.step1.evidenceLabel": "A light touch: how is it queer-owned?",
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
  "listBusiness.step2.tagsLabel": "Tags: a few words people might filter by",
  "listBusiness.step2.tagsPlaceholder": "e.g. Wheelchair-accessible",
  "listBusiness.step2.tagsAddCta": "Add",
  "listBusiness.step2.tagRemoveAria": "Remove {tag}",
  "listBusiness.step2.goodForLabel": "Good for… (tick what's true)",
  "listBusiness.step2.goodForHelper":
    "The little things that tell our people they're safe and welcome.",
  "listBusiness.step2.goodForAria": "Good for",
  "listBusiness.step2.langsLabel": "Languages spoken (optional)",
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
  "listBusiness.step3.onlineOnly.title": "This business is online only",
  "listBusiness.step3.onlineOnly.sub":
    "Share where people find you online instead of a street address.",
  "listBusiness.step3.onlineOnly.note":
    "No street address needed. Add your website or socials below so people know how to reach you.",
  "listBusiness.step3.addressLabel": "Address",
  "listBusiness.step3.addressHelper":
    "Street and number is enough. We'll place the pin from there.",
  "listBusiness.step3.addressPlaceholder":
    "R. Antero de Quental 26, 1170-024 Lisboa",
  "listBusiness.step3.locateAddress": "Locate this address",
  "listBusiness.step3.locateError":
    "We couldn't find that address. Try adding the city or postcode, or drop a pin on your neighbourhood below.",
  "listBusiness.step3.locateDemoHint":
    "Demo mode can't look up an address online. We've dropped a pin near your neighbourhood. Drag it to the exact spot.",
  "listBusiness.step3.dropNeighbourhoodPin": "Drop a pin on {hood}",
  "listBusiness.step3.mapLinkLabel": "Google Maps link",
  "listBusiness.step3.mapLinkHelper":
    "Open your place in Google Maps, tap Share, and paste the link. We'll drop the pin for you.",
  "listBusiness.step3.mapLinkPlaceholder": "https://maps.app.goo.gl/…",
  "listBusiness.step3.findOnMap": "Find on map",
  "listBusiness.step3.resolving": "Finding…",
  "listBusiness.step3.resolveError":
    "We couldn't read that link. Paste a Google Maps place link and try again.",
  "listBusiness.step3.unsupportedLinkDemo":
    "In demo mode, paste the full google.com/maps/… link. Short links need the live site.",
  "listBusiness.step3.pinPlaced": "Pin placed near {place}",
  "listBusiness.step3.usePlaceName": "Use “{place}” as the address",
  "listBusiness.step3.mapAria": "Map: drag the pin to set the exact spot.",
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
    "Check these times: a window is blank, zero-length, or overlaps.",
  "listBusiness.step3.hoursNoteLabel": "A short hours note (optional)",
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
  "listBusiness.step4.photosLabel": "A few photos (optional)",
  "listBusiness.step4.photosHelper":
    "The wide shot is your cover: it's the photo people see on your card in the directory. Landscape works best · aim for ≥1200px wide · under 5MB each · no text-heavy graphics.",
  "listBusiness.step4.gallery.wide": "Wide shot of the space",
  "listBusiness.step4.gallery.wideNote":
    "Cover photo · shown on your card in the directory",
  "listBusiness.step4.gallery.detail": "A detail",
  "listBusiness.step4.gallery.vibe": "People / vibe",
  "listBusiness.step4.alt.wide": "Wide shot · alt text",
  "listBusiness.step4.alt.d1": "Detail 1 · alt text",
  "listBusiness.step4.alt.d2": "Detail 2 · alt text",
  "listBusiness.step4.alt.vibe": "Vibe · alt text",
  "listBusiness.step4.altPlaceholder":
    "Describe it for blind & low-vision members",
  "listBusiness.step4.altPlaceholderRequired":
    "Required: describe it for blind & low-vision members",
  "listBusiness.step4.photo.upload": "Upload",
  "listBusiness.step4.photo.change": "Change",
  "listBusiness.step4.photo.uploading": "Uploading…",
  "listBusiness.step4.photo.remove": "Remove photo",
  "listBusiness.step4.photo.urlPlaceholder": "or paste an image URL",
  "listBusiness.step4.photo.urlInvalid": "That doesn't look like an image URL",
  "listBusiness.step4.photo.uploadError":
    "Couldn't upload that image. Try again",
  "listBusiness.step4.aboutYouHeading": "A little about you",
  "listBusiness.step4.relLabel": "Your connection to the place",
  "listBusiness.step4.relAria": "Your connection",
  "listBusiness.step4.ownerNameLabel": "Your name",
  "listBusiness.step4.ownerNamePlaceholder": "e.g. Sandra Lopes",
  "listBusiness.step4.ownerRoleLabel": "Your role",
  "listBusiness.step4.ownerRolePlaceholder": "e.g. Owner & baker",
  "listBusiness.step4.ownerBioLabel": "A line or two about you (optional)",
  "listBusiness.step4.ownerBioPlaceholder":
    "We took over a 60-year-old pastelaria in 2019 and rebuilt it around one rule: everyone's welcome, exactly as they are.",
  "listBusiness.step4.visLabel": "Who can see your name?",
  "listBusiness.step4.visAria": "Name visibility",
  "listBusiness.step4.linkProfileLabel":
    "Link to your member profile? (optional)",
  "listBusiness.step4.linkProfileTitle": "Show I'm a QueerPulse member",
  "listBusiness.step4.linkProfileDesc":
    "Puts a familiar, verified face on the listing. You're signed in as {name}.",
  "listBusiness.step4.linkProfileToggleLabel": "Link to member profile",
  "listBusiness.step4.loopHeading": "Staying in the loop",
  "listBusiness.step4.contactEmailLabel": "Your contact email",
  "listBusiness.step4.contactEmailHelper":
    "For you, the submitter, kept private, never shown on the listing.",
  "listBusiness.step4.contactEmailPlaceholder":
    "So we can reach you about this listing",
  "listBusiness.step4.notifyNote":
    "A QueerPulse notification tells you when your listing goes live, and the team's questions arrive as a QueerPulse message.",
  "listBusiness.step4.consent":
    "You're in control of what's public. <b>Contact details you leave blank stay off the listing.</b> Want your name kept private? Pick “role only” or “anonymous” above. That's completely fine.",
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
  // Step 5 — review
  "listBusiness.step5.title": "One last look",
  "listBusiness.step5.em": "before it goes to the team.",
  "listBusiness.step5.sub":
    "Here's everything you've told us. Edit any part by jumping back. Nothing's locked until you send.",
  "listBusiness.step5.slugLabel": "Your listing will live at",
  "listBusiness.step5.slugDomain": "queerpulse.app/directory/",
  "listBusiness.step5.editCta": "Edit",
  "listBusiness.step5.notAdded": "Not added",
  "listBusiness.step5.onlineBusiness": "Online only",
  "listBusiness.step5.group.pathPlace": "You & the place",
  "listBusiness.step5.group.basics": "Basics",
  "listBusiness.step5.group.story": "Story",
  "listBusiness.step5.group.practical": "Practical",
  "listBusiness.step5.group.photosYou": "Photos & you",
  "listBusiness.step5.row.listingAs": "Listing as",
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
    "<b>A human reviews every listing.</b> This keeps the directory community-verified. Nothing auto-publishes. We'll read it within a few days, and QueerPulse tells you when it's live (or the team messages you if we have a question). You can edit or withdraw it any time before then.",
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
    "Thank you for adding to the directory. <b>A real person on the community team reads every listing</b> before it goes live. That's the promise behind our community-verified badge. We'll review within <b>a few days</b>, and a QueerPulse notification reaches you the moment it's live.",
  "listBusiness.success.note.question":
    "<b>The team has a small question</b> before it goes live. It's waiting in your QueerPulse messages. Nothing's wrong; a quick reply is all it takes and you're back on track.",
  "listBusiness.success.note.live":
    "<b>It's live in the directory.</b> Your place is now searchable by the community. Thank you for making the map a little fuller.",
  "listBusiness.success.fallbackName": "Your place",
  "listBusiness.success.withdrawConfirm":
    "Withdraw <b>{name}</b>? This takes it out of review. You can always list it again later.",
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
  "listBusiness.missing.hoursExceptionsInvalid":
    "a fix to the dated exceptions",
  "listBusiness.missing.social": "valid contact links",
  "listBusiness.missing.socialFormat": "the contact-link format fixed",
  "listBusiness.missing.rel": "your connection",
  "listBusiness.missing.ownerName": "your name",
  "listBusiness.missing.ownerRole": "your role",
  "listBusiness.missing.contactEmail": "a contact email",
  "listBusiness.missing.alt": "alt text for your photos",
  "listBusiness.missing.consent": "both confirmations",
  "listBusiness.missing.services": "a name and a price on every service",
  "listBusiness.missing.affirmingBaseline": "the affirming baseline",
  // Live preview column
  "listBusiness.preview.head": "Live preview · updates as you type",
  "listBusiness.preview.addPhoto": "Add cover photo",
  "listBusiness.preview.placeholderName": "Your place",
  "listBusiness.preview.placeholderMeta": "Category · neighbourhood",
  "listBusiness.preview.placeholderBlurb":
    "Your place will appear here as you fill in the form, exactly as it'll look in the directory grid.",
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
  "listBusiness.edit.savedInReview":
    "Your changes are saved. Your listing is still in review.",
  "listBusiness.edit.status.liveBody":
    "This listing is live. Saving your changes updates the public page right away.",
  "listBusiness.edit.status.reviewBody":
    "This listing is not public yet. A moderator is reading it, and saving updates what they see.",
  "listBusiness.edit.status.questionBody":
    "A moderator has a question about this listing before it can go live. Saving updates what they see.",
  "listBusiness.edit.verifiedBadge.title": "Verified queer-owned badge",
  "listBusiness.edit.verifiedBadge.body":
    "A moderator confirmed this badge for the business as it stands today. Changing the business name, the Queer-owned or LGBTQ+ friendly badge, or whether this listing links to your profile clears it until a moderator confirms the business again. Everything else you edit here leaves it alone.",
  "listBusiness.edit.saveError": "We couldn't save your changes. Try again.",
  "listBusiness.edit.discardConfirm":
    "Discard your unsaved changes to this listing?",
  "listBusiness.edit.notAllowed": "You can only edit a listing you submitted.",

  // ── Single-screen owner editor (edit mode). The create flow stays a guided
  //    wizard; editing puts every field on one page with a jump nav.
  "listBusiness.editor.section.aboutYou": "About you",
  "listBusiness.editor.section.permissions": "Permissions",
  "listBusiness.editor.nav.label": "Jump to",
  "listBusiness.editor.nav.aria": "Jump to a section of your listing",
  "listBusiness.editor.nav.missingCount": "{count} still needed",
  "listBusiness.editor.unsavedChanges": "You have unsaved changes.",
  "listBusiness.editor.noChanges": "Everything here is saved.",
  "listBusiness.editor.previewCta": "Preview page",
  "listBusiness.editor.preview.eyebrow":
    "Preview, including your unsaved edits",
  "listBusiness.editor.preview.sub":
    "Your listing page as visitors will see it. Nothing here is saved until you press save.",
  "listBusiness.editor.preview.subCoManager":
    "The listing page as visitors will see it. Nothing here is saved until you press save. The block about the person behind the business is blank in this preview and filled in on the real page.",

  "listBusiness.editor.section.services": "What it costs",
  "listBusiness.editor.section.accessibility": "Getting in",
  "listBusiness.editor.section.tradingAndVisibility": "Trading and visibility",
  "listBusiness.editor.section.whoCanEdit": "Who can edit",
  "listBusiness.editor.section.roleOnListing": "Role shown on the listing",

  // ── Co-managers. Who else can edit a listing, and the invitation that puts
  //    them there. Member-facing only: none of this reaches the public page.
  "listBusiness.coManagers.introOwner":
    "Running a place is rarely a job for one person. Invite someone you trust to help keep this listing up to date. They can change everything about the business. Your own details, and who can edit, stay with you.",
  "listBusiness.coManagers.introCoManager":
    "Everyone looking after this listing. Only its owner can invite people or take a place back.",
  "listBusiness.coManagers.status.active": "Can edit",
  "listBusiness.coManagers.status.invited": "Waiting for a reply",
  "listBusiness.coManagers.formerMember": "A member who has since left",
  "listBusiness.coManagers.invitedOn": "Invitation sent {date}",
  "listBusiness.coManagers.editingSince": "Helping out since {date}",
  "listBusiness.coManagers.removeCta": "Remove",
  "listBusiness.coManagers.cancelInviteCta": "Cancel invitation",
  "listBusiness.coManagers.removeConfirm":
    "Take <b>{name}</b> off this listing? Everything they added stays, and you can ask them again whenever you like.",
  "listBusiness.coManagers.cancelInviteConfirm":
    "Cancel the invitation to <b>{name}</b>? You can send it again whenever you like.",
  "listBusiness.coManagers.keepCta": "Go back",
  "listBusiness.coManagers.removeYes": "Remove",
  "listBusiness.coManagers.cancelInviteYes": "Cancel invitation",
  "listBusiness.coManagers.empty.title": "Just you for now",
  "listBusiness.coManagers.empty.descriptionOwner":
    "Nobody else can edit this listing yet. Invite someone below when you would like a hand.",
  "listBusiness.coManagers.empty.descriptionCoManager":
    "Nobody else is looking after this listing right now.",
  "listBusiness.coManagers.removedToast": "They no longer edit this listing.",
  "listBusiness.coManagers.removeError":
    "We couldn't make that change just now. Try again.",
  "listBusiness.coManagers.inviteHeading": "Invite someone to help",
  "listBusiness.coManagers.inviteIntro":
    "Find the member you have in mind and send the invitation. Nothing changes for them until they accept.",
  "listBusiness.coManagers.seats":
    "{used} of {cap} places taken. An invitation holds a place while it waits for an answer.",
  "listBusiness.coManagers.seatsFullNotice":
    "All the places are taken. Remove someone, or cancel an invitation, to free one up.",
  "listBusiness.coManagers.searchPlaceholder": "Search members by name",
  "listBusiness.coManagers.searchHint":
    "Type a name to find the person you have in mind.",
  "listBusiness.coManagers.sendCta": "Send invitation",
  "listBusiness.coManagers.sendingCta": "Sending...",
  "listBusiness.coManagers.invitedToast": "Invitation sent.",
  "listBusiness.coManagers.error.self":
    "This listing is already yours to edit.",
  "listBusiness.coManagers.error.seatsFull":
    "All the places are taken. Remove someone, or cancel an invitation, to free one up.",
  "listBusiness.coManagers.error.alreadyThere":
    "That member already has a place here, or an invitation waiting.",
  "listBusiness.coManagers.error.generic":
    "We couldn't send that invitation. Try again.",
  "listBusiness.coManagers.stepDownHeading": "Step down from this listing",
  "listBusiness.coManagers.stepDownIntro":
    "You can hand this back whenever you like. Everything you added stays with the listing.",
  "listBusiness.coManagers.stepDownCta": "Step down",
  "listBusiness.coManagers.stepDownConfirm":
    "Stop helping with {name}? Your access ends straight away, and only the owner can bring you back.",
  "listBusiness.coManagers.stepDownCancel": "Go back",
  "listBusiness.coManagers.stepDownYes": "Yes, step down",
  "listBusiness.coManagers.leftToast": "You no longer help with {name}.",
  "listBusiness.coManagers.leaveError":
    "We couldn't do that just now. Try again.",
  "listBusiness.coManagers.banner.title": "You help run this listing",
  "listBusiness.coManagers.banner.titleNamed": "You help {name} run {listing}",
  "listBusiness.coManagers.banner.body":
    "You can change everything about the business: what it says, its hours, photos, services, access answers, and the replies to reviews and questions. The owner's own contact details and profile choices stay private to them, and deleting the listing or changing who can edit it stays with them too.",
  "listBusiness.coManagers.roleFieldLabel": "Role shown on the listing",
  "listBusiness.coManagers.roleFieldHelper":
    "The job title printed beside the business on its public page.",
  "listBusiness.coManagers.ownerPrivateNotice":
    "The owner's name, short bio, contact email and profile choices are private to them. They are not shown here, and nothing you save changes them.",

  // ── Accessibility vocabulary. The six questions are fixed and shared with
  //    the API, which stores their slugs verbatim.
  "listBusiness.accessibility.question.stepFree.label": "Step-free entrance",
  "listBusiness.accessibility.question.stepFree.help":
    "Someone can get from the street to the door without steps.",
  "listBusiness.accessibility.question.interior.label":
    "Wheelchair-accessible inside",
  "listBusiness.accessibility.question.interior.help":
    "There is room to move around and reach the main area in a wheelchair.",
  "listBusiness.accessibility.question.accessibleToilet.label":
    "Accessible toilet",
  "listBusiness.accessibility.question.accessibleToilet.help":
    "A toilet with the space and the fittings a wheelchair user needs.",
  "listBusiness.accessibility.question.genderNeutralToilet.label":
    "Gender-neutral toilet",
  "listBusiness.accessibility.question.genderNeutralToilet.help":
    "At least one toilet nobody has to pick a gendered door for.",
  "listBusiness.accessibility.question.quietHours.label":
    "Quiet, low-sensory hours",
  "listBusiness.accessibility.question.quietHours.help":
    "Regular times with the music down and the lights low.",
  "listBusiness.accessibility.question.assistanceAnimals.label":
    "Assistance animals welcome",
  "listBusiness.accessibility.question.assistanceAnimals.help":
    "Guide dogs and other assistance animals can come in. A pets policy is a separate question.",

  // Reader wording on the public page; owner wording in the editor.
  "listBusiness.accessibility.answer.yes.reader": "Yes",
  "listBusiness.accessibility.answer.yes.owner": "Yes",
  "listBusiness.accessibility.answer.no.reader": "No",
  "listBusiness.accessibility.answer.no.owner": "No",
  "listBusiness.accessibility.answer.unknown.reader": "Nobody has told us",
  "listBusiness.accessibility.answer.unknown.owner": "Not sure yet",

  "listBusiness.accessibility.intro":
    "Six questions someone might need answered before they decide whether they can come. Answer what you know.",
  "listBusiness.accessibility.reassurance":
    "An honest no is useful. Someone who uses a wheelchair would far rather read that there are two steps at your door than turn up and find out. Nothing here counts against your listing.",
  "listBusiness.accessibility.noteLabel": "Anything else worth knowing",
  "listBusiness.accessibility.noteHint":
    "The details a checklist cannot hold. Say what someone would actually meet at the door.",
  "listBusiness.accessibility.notePlaceholder":
    "Two steps at the front door and staff will help with the ramp. Ring the bell on the left.",

  // ── Priced services, owner side.
  "listBusiness.services.intro":
    "What you sell and what it costs. Your price band stays the quick signal; this is where you say what it buys. Leave it empty if prices do not work that way for you.",
  "listBusiness.services.empty":
    "Nothing listed yet. Add a row for each thing you want people to see a price for.",
  "listBusiness.services.addCta": "Add a service",
  "listBusiness.services.addHint":
    "Optional. Most listings do well with a handful.",
  "listBusiness.services.ceilingHint":
    "That is the limit of {count}. A longer price list belongs on your own site.",
  "listBusiness.services.nameLabel": "What it is",
  "listBusiness.services.namePlaceholder": "Consultation, first session",
  "listBusiness.services.nameError":
    "Give this row a name, or clear the price to remove it.",
  "listBusiness.services.priceLabel": "What it costs",
  "listBusiness.services.pricePlaceholder": "From 25 EUR, sliding scale",
  "listBusiness.services.priceError":
    "Say what it costs. Anything true works: a number, a range, or a sliding scale.",
  "listBusiness.services.noteLabel": "One line of detail",
  "listBusiness.services.noteHint": "Optional.",
  "listBusiness.services.notePlaceholder":
    "45 minutes, includes a follow-up message",
  "listBusiness.services.unnamedRow": "row {position}",
  "listBusiness.services.moveUp": "Move {name} up",
  "listBusiness.services.moveDown": "Move {name} down",
  "listBusiness.services.remove": "Remove {name}",

  // ── The owner's pause. A different question from the trading state above
  //    it: this is about whether the LISTING is shown, and it says nothing
  //    about whether the business is open.
  "listBusiness.visibility.heading": "Showing in the directory",
  "listBusiness.visibility.intro":
    "Take your listing out of the directory for a while and put it back whenever you want. Everything stays where it is while it is away.",
  "listBusiness.visibility.distinction":
    "This is a different thing from the trading status above. Temporarily closed keeps you in the directory and tells people you are shut for now. Pausing takes the listing out of browse, search and the map, and says nothing about whether you are open.",
  "listBusiness.visibility.state.showing.title": "Your listing is showing",
  "listBusiness.visibility.state.showing.sub":
    "People can find it in browse, search and the map.",
  "listBusiness.visibility.state.hidden.title": "Your listing is paused",
  "listBusiness.visibility.state.hidden.sub":
    "It is out of browse, search and the map right now. Nobody can find it in the directory until you put it back.",
  "listBusiness.visibility.hiddenSince": "Paused {when}",
  "listBusiness.visibility.kept.reviews":
    "Your reviews, ratings and replies stay exactly as they are.",
  "listBusiness.visibility.kept.content":
    "Photos, hours, contacts and any badges you have are all kept.",
  "listBusiness.visibility.kept.reversible":
    "You can put it back at any time, and it returns whole.",
  "listBusiness.visibility.hideCta": "Pause this listing",
  "listBusiness.visibility.showCta": "Show it again",
  "listBusiness.visibility.applying": "Updating…",
  "listBusiness.visibility.saved.hidden":
    "Your listing is paused. It is out of the directory until you put it back.",
  "listBusiness.visibility.saved.shown":
    "Your listing is back in the directory.",
  "listBusiness.visibility.saveError":
    "Couldn't update this. Please try again.",
  "listBusiness.visibility.banner.title": "This listing is paused",
  "listBusiness.visibility.banner.body":
    "It is out of browse, search and the map right now. Your edits will save as normal, and nobody will see them until you show the listing again.",

  // ── The affirming baseline, agreed to once at submission. Absent from the
  //    update payload on purpose: there is no edit that un-agrees to it.
  "listBusiness.baseline.title":
    "The one thing <em>every listing agrees to.</em>",
  "listBusiness.baseline.body":
    "Businesses in this directory commit to welcoming and serving LGBTQ+ people, and to dealing with it when someone in their space falls short. That commitment is what makes this list worth reading.",
  "listBusiness.baseline.scope":
    "It is about how you treat the people you serve. It gives nobody permission to turn a person away over who they are.",
  "listBusiness.baseline.agreeTitle": "We agree to this",
  "listBusiness.baseline.agreeSub":
    "Required. Every listing in the directory has agreed to the same thing.",
  "listBusiness.baseline.noticeTitle":
    "You agreed to the affirming baseline when this listing was created.",
  "listBusiness.baseline.noticeBody":
    "It stands for as long as the listing does, so there is nothing to change here. Every business in the directory has agreed to the same thing.",

  // ── Local autosave for the owner editor. It OFFERS a copy saved on this
  //    device; the form stays exactly what the server returned until the owner
  //    presses restore, so nothing published is ever quietly replaced.
  "listBusiness.editor.restore.title": "You have unsaved changes from {when}",
  "listBusiness.editor.restore.sub":
    "They were saved on this device and never sent. Your live listing has not changed.",
  "listBusiness.editor.restore.serverChanged":
    "Careful: this listing has been updated since those changes were saved, so bringing them back would replace the newer wording.",
  "listBusiness.editor.restore.restoreCta": "Bring them back",
  "listBusiness.editor.restore.discardCta": "Discard them",
  "listBusiness.editor.restore.justNow": "a moment ago",
  "listBusiness.editor.restore.unknownWhen": "an earlier session",

  // ── Operating state: the business's own report about itself. Setting it
  //    never moves the moderation status and never triggers a re-review.
  "listBusiness.trading.groupAria": "Is this business still trading?",
  "listBusiness.trading.currently": "Right now",
  "listBusiness.trading.since": "set {when}",
  "listBusiness.trading.justNow": "a moment ago",
  "listBusiness.trading.unknownWhen": "some time ago",
  "listBusiness.trading.state.open.label": "Open as usual",
  "listBusiness.trading.state.open.desc":
    "Trading normally. Nothing extra appears on your page.",
  "listBusiness.trading.state.temporarilyClosed.label": "Temporarily closed",
  "listBusiness.trading.state.temporarilyClosed.desc":
    "Still listed everywhere, with a closed notice on your page.",
  "listBusiness.trading.state.moved.label": "Moved",
  "listBusiness.trading.state.moved.desc":
    "Still listed everywhere, with your new address on your page.",
  "listBusiness.trading.state.permanentlyClosed.label": "Closed for good",
  "listBusiness.trading.state.permanentlyClosed.desc":
    "Taken out of browse, search and the map.",
  "listBusiness.trading.noteLabel": "What should people know?",
  "listBusiness.trading.noteHint":
    "Shown on your listing, so keep it short and plain.",
  "listBusiness.trading.notePlaceholder":
    "Closed for refurbishment, back in September.",
  "listBusiness.trading.movedToLabel": "Where can people find you now?",
  "listBusiness.trading.movedToHint":
    "A move with no destination tells a reader nothing they had not already worked out at the door.",
  "listBusiness.trading.movedToPlaceholder": "Rua da Prata 42, Baixa",
  "listBusiness.trading.applyCta": "Update trading status",
  "listBusiness.trading.applying": "Updating…",
  "listBusiness.trading.applyHint":
    "This applies on its own, separately from the save button below.",
  "listBusiness.trading.saveError":
    "Couldn't update your trading status. Please try again.",
  "listBusiness.trading.saved.open": "Your listing is open as usual again.",
  "listBusiness.trading.saved.temporarily_closed":
    "Your listing now shows as temporarily closed.",
  "listBusiness.trading.saved.permanently_closed":
    "Your listing is marked closed for good.",
  "listBusiness.trading.saved.moved":
    "Your listing now shows your new address.",
  "listBusiness.trading.closeConfirm.title": "Mark {name} closed for good?",
  "listBusiness.trading.closeConfirm.lead":
    "This is the one status that takes your business out of the directory's results. Here is exactly what happens.",
  "listBusiness.trading.closeConfirm.removed":
    "It stops appearing in browse, search, the map and safe-space results.",
  "listBusiness.trading.closeConfirm.kept":
    "Your page stays reachable, so saved links, reviews and your closing notice all survive.",
  "listBusiness.trading.closeConfirm.reversible":
    "You can set it back to open whenever you like. Nothing is deleted.",
  "listBusiness.trading.closeConfirm.cancel": "Keep it listed",
  "listBusiness.trading.closeConfirm.confirm": "Yes, close it for good",

  // ── "Still accurate?": one cheap press that stamps the listing as vouched
  //    for by the person who runs it. Asked louder as the stamp ages.
  "listBusiness.confirmDetails.title.fresh": "These details are confirmed",
  "listBusiness.confirmDetails.title.ageing": "Are these details still right?",
  "listBusiness.confirmDetails.title.stale":
    "Nobody has checked these details in a while",
  "listBusiness.confirmDetails.lastConfirmed": "Last confirmed {when}.",
  "listBusiness.confirmDetails.never":
    "You have never confirmed them, so visitors only have the day you wrote them.",
  "listBusiness.confirmDetails.justNow": "a moment ago",
  "listBusiness.confirmDetails.unknownWhen": "some time ago",
  "listBusiness.confirmDetails.cta": "Still accurate",
  "listBusiness.confirmDetails.saving": "Saving…",
  "listBusiness.confirmDetails.toast":
    "Thanks. Your listing is stamped as checked today.",
  "listBusiness.confirmDetails.error":
    "Couldn't record that just now. Please try again.",

  // ── Dated overrides of the weekly hours grid (owner editor only).
  "listBusiness.hoursExceptions.heading": "Dates that are different",
  "listBusiness.hoursExceptions.hint":
    "Holidays, a summer break, one late night. Each date here overrides your weekly grid on that day.",
  "listBusiness.hoursExceptions.empty":
    "No dated exceptions yet, so your weekly hours apply every week.",
  "listBusiness.hoursExceptions.addCta": "Add a date",
  "listBusiness.hoursExceptions.clearPastCta_one": "Remove 1 past date",
  "listBusiness.hoursExceptions.clearPastCta_other":
    "Remove {count} past dates",
  "listBusiness.hoursExceptions.count": "{used} of {max} dates",
  "listBusiness.hoursExceptions.capReached":
    "That is the limit of {max} dates. Remove one to add another.",
  "listBusiness.hoursExceptions.dateLabel": "Date",
  "listBusiness.hoursExceptions.untitledDate": "this date",
  "listBusiness.hoursExceptions.pastTag": "Past",
  "listBusiness.hoursExceptions.removeAria": "Remove the exception for {date}",
  "listBusiness.hoursExceptions.noteAria": "Label for {date}",
  "listBusiness.hoursExceptions.notePlaceholder":
    "Christmas Eve, closing early",
  "listBusiness.hoursExceptions.problem.date":
    "Give a real calendar date, like 2026-12-24.",
  "listBusiness.hoursExceptions.problem.duplicate":
    "There is already an entry for this date. Edit that one instead.",
  "listBusiness.hoursExceptions.problem.intervals":
    "An open date needs at least one window, and its times cannot match or overlap.",

  // ── Shared hub back-link label (Governance section) ────────────────────
  "hub.governanceLabel": "Governance",

  // ── Changelog — page chrome. The 19 dated release entries (title/body/tag)
  //    are historical release notes — left English due to volume; flagged in
  //    the sweep report rather than rushed.
  "changelog.hero.backLabel": "Roadmap",
  "changelog.meta.title": "QueerPulse changelog: what changed, and when",
  "changelog.meta.description":
    "Every update to QueerPulse in reverse order, from new features to small fixes, so you always know what is different and why.",
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
  "changelog.tag.about": "Read where we stand",
  "changelog.tag.aboutCommunities": "See how communities work",
  "changelog.tag.work": "Open your Work hub",
  "changelog.tag.settings": "Notification settings",
  "changelog.tag.messages": "Open messages",
  "changelog.tag.communities": "Browse communities",
  "changelog.tag.subprofiles": "See subprofiles",
  "changelog.tag.personas": "See personas",
  "changelog.tag.gettingStarted": "Getting started",
  "changelog.tag.housing": "See housing",
  "changelog.tag.housingViewings": "See your viewings",
  "changelog.tag.directory": "Open the directory",
  "changelog.tag.cinema": "Visit Cinema",
  "changelog.tag.forum": "Visit the forum",
  "changelog.tag.profile": "Open your profile",
  "changelog.tag.sessions": "See your active sessions",
  "changelog.tag.gatherings": "See gatherings",
  "changelog.tag.members": "Meet the members",
  "changelog.tag.events": "Open the Events Hub",
  "changelog.tag.roadmap": "Open the roadmap",
  "changelog.tag.magazine": "Open the magazine",
  "changelog.tag.magazineSections": "Browse by section",
  "changelog.tag.magazineWriter": "Open your workspace",
  "changelog.tag.badges": "See badges & levels",
  "changelog.tag.safety": "See our safety approach",
  "changelog.tag.editProfile": "Edit your profile",
  "changelog.tag.employerReviews": "Read employer reviews",
  "changelog.tag.studio": "Visit the Studio",
  "changelog.tag.search": "Try global search",
  "changelog.tag.topics": "Browse topics",
  "changelog.tag.perks": "See your perks",
  "changelog.tag.volunteer": "Find a way in",
  "changelog.tag.postVolunteer": "Post an opportunity",
  "changelog.tag.comingOut": "Read the coming-out guide",
  "changelog.tag.notifications": "Open your notifications",
  "changelog.tag.connections": "Open your connections",
  "changelog.tag.trustNetwork": "Open the trust network",
  "changelog.tag.invite": "Invite someone",
  "changelog.tag.imprint": "Read the legal notice",
  "changelog.tag.terms": "Read the terms",
  "changelog.tag.library": "Open the library",
  "changelog.tag.feed": "Open your feed",
  "changelog.tag.myEvents": "Open My Events",
  "changelog.tag.safeSpaces": "Find a safe space",
  "changelog.tag.pressKit": "Open the press kit",
  "changelog.tag.pushDevices": "Manage your devices",
  "changelog.tag.magazineDesk": "Open the desk",
  "changelog.tag.guidelines": "Read the community guidelines",
  "changelog.tag.requestInvite": "Ask to come in",
  "changelog.tag.privacy": "Read the privacy policy",
  "changelog.tag.flatmates": "See the flatmate board",
  "changelog.tag.tenantRights": "Know your rights",
  "changelog.tag.workProfile": "Open your work profile",
  "changelog.tag.governance": "See how QueerPulse is run",
  "changelog.tag.appealOutcome": "Check your appeal status",
  "changelog.tag.hateCrime": "Read hate crime resources",
  "changelog.tag.changemakers": "See our Changemakers",
  "changelog.tag.vouch": "Vouch for someone",
  "changelog.tag.culture": "Visit Culture",
  "changelog.tag.myCards": "See your cards",

  "changelog.entries.menu-resizes-smoothly.title":
    "The main menu changes size smoothly between sections",
  "changelog.entries.menu-resizes-smoothly.body":
    "Moving across the top menu, from Work to About say, made the open panel snap to its new height in a single step, which read as a flicker. The panel now eases between sizes as you move from one section to the next, in step with the fade of the links inside it. With reduced motion turned on it still resizes instantly.",
  "changelog.entries.nearby-places-full-cards.title":
    "Places within a short walk now show their full card",
  "changelog.entries.nearby-places-full-cards.body":
    "The \u201cWithin a short walk\u201d suggestions at the foot of a listing were a line of text: a name, a category and a distance. They now appear as the same cards you see in the local directory, with the photo, the safer-space badge, the rating, the description and whether the door is open right now. The walking distance sits on the photo, so you can still plan the evening by how far apart things are.",
  "changelog.entries.map-pin-opens-place.title":
    "Tapping a place on the map now opens it",
  "changelog.entries.map-pin-opens-place.body":
    "If you had picked a neighbourhood on the local map and then tapped a place somewhere else, the panel beside the map kept showing that neighbourhood and often said nothing matched your filters. Tapping a pin now drops the area filter and gives the whole panel over to that one place, with the map easing in on it. \u201cAll places\u201d takes you back to the full list.",
  "changelog.entries.review-line-breaks.title":
    "Reviews keep your paragraphs, and fold up when they run long",
  "changelog.entries.review-line-breaks.body":
    "A review typed as several paragraphs landed on the page as one unbroken block: every line break and blank line you wrote was quietly dropped when it was displayed. Your breaks are now kept exactly as you typed them. Long reviews also fold down to their first few lines with a Read more link, so one very long review no longer buries every review beneath it.",
  "changelog.entries.directory-filters-in-one-row.title":
    "The directory filter bar is now one tidy row",
  "changelog.entries.directory-filters-in-one-row.body":
    "Scrolling the directory used to slide the search field up behind the floating navigation, so the filter bar and the top bar sat on top of each other. The filter bar now parks just below the navigation and stays readable the whole way down the page, in every layout: the floating pill, the sidebar rail, and the slim bar on phones. The place types have moved inside the Refine button, alongside verified safe spaces and vibe, so the bar is one line of search plus a single control. Refine carries a count of everything you have applied, and each active filter still shows as a removable chip above the results.",
  "changelog.entries.volunteer-applicants-community-organisers.title":
    "Communities can review their own volunteer applicants",
  "changelog.entries.volunteer-applicants-community-organisers.body":
    'Reviewing who signed up for a volunteering opportunity used to rest entirely on the one person who posted it. If they went quiet, applicants waited. Now owners, co-owners, and moderators of the community an opportunity is posted under can open it, read the applications, and accept or decline, so a community is never one person away from answering people who offered their time. Editing and closing an opportunity stay with whoever posted it. The "Manage applicants" button on the volunteering page also stops appearing for members who have nothing to review.',
  "changelog.entries.invites-go-out-by-hand.title":
    "Approving a join request now says plainly what happens next",
  "changelog.entries.invites-go-out-by-hand.body":
    "When a reviewer welcomed someone in, the confirmation said an invite email was on its way to them. QueerPulse has no mail service, so nothing was ever sent and the invite could sit unclaimed while both people waited. The card now says that invites go out by hand and puts the link to copy right there, and its three decision buttons no longer spill past the edge of the card.",
  "changelog.entries.sessions-page-links-reach-a-person.title":
    "Your active sessions can now reach a person",
  "changelog.entries.sessions-page-links-reach-a-person.body":
    "\u201cSomething looks wrong? Tell us what happened\u201d on your active sessions opened a page announcing that your account was locked, which was alarming and untrue. Both links on that page now land where they say they will: \u201cwhat to do next\u201d opens the Account section of Help, which walks through an unfamiliar device, and \u201ctell us what happened\u201d opens the contact form with its topic already set to account access, so your message reaches the team. The Back link at the top of the page returns to Settings \u2192 Account, where you opened it from.",
  "changelog.entries.skills-and-learning-workshops-retired.title":
    "Skills & learning has closed",
  "changelog.entries.skills-and-learning-workshops-retired.body":
    "Skills & learning listed member-run workshops with seats, waitlists and a page for each host, and it never got far enough to be worth your time: a handful of sample courses, no way to actually pay, and no one on the other end when you reserved a spot. Rather than leave it sitting in the Work menu looking open for business, we have taken the whole board down. The two places where teaching and learning already work are still there. The Skills Exchange swaps time and talent with no money involved, and hosting a gathering covers a workshop or a talk with everything a real event needs, including a guest list and a date.",
  "changelog.entries.mod-tools-sections-fade-in-as-you-switch.title":
    "Mod tools sections arrive instead of snapping into place",
  "changelog.entries.mod-tools-sections-fade-in-as-you-switch.body":
    "Moving between Overview, Requests, Reports, Members, Invites and the rest of the moderation console swapped the whole panel in one frame, which made every switch feel like the page had jumped rather than turned. Each section now fades and rises into place over a fraction of a second, so the eye can follow the highlight on the left across to the surface it just opened. If you have asked your device to reduce motion, the panel still changes instantly with no animation at all.",
  "changelog.entries.member-rows-in-mod-tools-hold-their-actions-in-one-menu.title":
    "Managing a community's members reads as a list of people again",
  "changelog.entries.member-rows-in-mod-tools-hold-their-actions-in-one-menu.body":
    "The Members section of mod tools put every role control on the row itself, so each person arrived behind three buttons competing for attention and the name you were actually looking for got squeezed into whatever space was left. Making someone a mod, handing over co-ownership and removing them from the community now live behind a single ⋯ button at the end of the row, opening as a short menu when you want it. The row shows the person, their avatar and their role, and the actions you are allowed to take are still exactly the ones offered: nothing appears in the menu that your own role would not let you do.",
  "changelog.entries.studio-and-cinema-speak-portuguese-in-more-places.title":
    "Studio and Cinema speak Portuguese in more places",
  "changelog.entries.studio-and-cinema-speak-portuguese-in-more-places.body":
    "Switching the site to Portuguese left parts of Studio and Cinema still reading in English. The buttons, headings, tab labels, empty states and image descriptions across the music and film sections now follow the language you picked, along with the founder setup screen, the glossary, the invoice and contract tools, and several magazine and partner pages. What has deliberately stayed in English is the work itself: track and album titles, lyrics, artist biographies, film synopses, credits and curator notes. Those are written by the people who made them, and translating someone\u2019s own words without asking would be the wrong call, so they read exactly as their author wrote them in either language.",
  "changelog.tag.magazineSearch": "Search the magazine",
  "changelog.tag.resources": "Browse the guides",
  "changelog.tag.readingGroups": "Find a reading group",

  "changelog.tag.arriving": "Just arrived in Lisbon?",
  "changelog.tag.housingGroups": "See housing groups",
  "changelog.entries.post-a-room-in-a-housing-group.title":
    "Share a room inside a housing group",
  "changelog.entries.post-a-room-in-a-housing-group.body":
    "You can post a room straight into a vetted housing group, with the rent and the access details the group asks for. A moderator reads it before it goes on the group page, and your own rooms now sit in one place showing exactly where each one stands, including anything a moderator wrote back to you.",
  "changelog.entries.the-housing-board-is-open.title":
    "The housing board is open",
  "changelog.entries.the-housing-board-is-open.body":
    "Rooms and homes listed by members now actually reach the board. Every listing goes to a moderator first, and you see the decision and the reason on your own listing rather than waiting in the dark. Listings carry photos, a description, an available-from date and what the place is like, and saved-search alerts fire again.",
  "changelog.entries.gatherings-say-where-and-what-they-cost.title":
    "Gatherings say where they are and what they cost",
  "changelog.entries.gatherings-say-where-and-what-they-cost.body":
    "The address, arrival directions, neighbourhood and access details a host fills in are kept and shown, instead of being thrown away at the last step. The exact address is shared with the people who are going. A gathering can say it is free, or name a sliding scale, and you can filter what is on by date, neighbourhood, kind and cost.",
  "changelog.entries.hosts-run-their-own-door.title":
    "Hosts run their own door",
  "changelog.entries.hosts-run-their-own-door.body":
    "You can message everyone coming, check people in at the door, see the access needs your guests chose to share, and bar someone from one gathering without cancelling it. Someone you have blocked can no longer turn up. And if you are going somewhere new, you can tell one person you trust where you will be.",
  "changelog.entries.the-safe-space-badge-has-a-mechanism.title":
    "The safe-space badge means what the page says",
  "changelog.entries.the-safe-space-badge-has-a-mechanism.body":
    "Nominations are acknowledged on a clock, three members with no stake in a place have to visit it, and a decision carries a written reason. Any member can raise a concern about a badged space: three separate flags pause the badge straight away and open a review. Your name never reaches the venue.",
  "changelog.entries.the-directory-answers-is-it-open-and-can-i-get-in.title":
    "Is it open, and can I get in?",
  "changelog.entries.the-directory-answers-is-it-open-and-can-i-get-in.body":
    "The directory now shows whether a place is open right now, and you can filter to only what is open. You can also filter by the access you need, step-free entry, an accessible toilet, a gender-neutral toilet and more, without opening every listing one at a time. And if you turn it on, the list can sort by what is nearest with a walking time; your location stays on your device.",
  "changelog.entries.a-venue-is-asked-before-it-hosts-you.title":
    "A venue is asked before it hosts you",
  "changelog.entries.a-venue-is-asked-before-it-hosts-you.body":
    "Anyone could name a business as the venue for their gathering and the owner was never told. Now the owner is asked, can confirm or remove it, and an unconfirmed gathering stays off the venue's public page.",
  "changelog.entries.arriving-points-at-real-things.title":
    "Arriving in Lisbon points at real things",
  "changelog.entries.arriving-points-at-real-things.body":
    "The page for people who just moved here used to advertise one invented gathering on a date that had already passed. It now shows real gatherings coming up, links to real places and communities, and gives you a first-fortnight checklist you can tick off. It reads in Portuguese too.",
  "changelog.entries.what-you-send-in-now-gets-an-answer.title":
    "What you send in now gets an answer",
  "changelog.entries.what-you-send-in-now-gets-an-answer.body":
    "Several things you could submit reached us and then stopped. A proposed reading group now becomes a real community with you as its owner. Rooms posted into a housing group, landlord suggestions and introduction requests all get a decision, with the reason, and you are told either way.",
  "changelog.entries.the-magazine-has-pictures.title":
    "The magazine has pictures",
  "changelog.entries.the-magazine-has-pictures.body":
    "It is a magazine, and photography and illustration are half of it, but there was no way for an editor to get a commissioned image onto a page. Every card and every article header fell back to a coloured placeholder. Editors can now upload lead art for a piece and place real photographs inside the body of a story, and that art runs on the article, on the front page and on every card pointing at it.",
  "changelog.entries.an-older-piece-tells-you-where-it-stands.title":
    "An older piece tells you where it stands",
  "changelog.entries.an-older-piece-tells-you-where-it-stands.body":
    "We publish about legal rights, healthcare access and organisations, and all of that changes. Until now the only options were leaving a piece looking current or taking it down, which also removed it from the archive. A piece can now be marked as under review, archived, or replaced by a newer one, and it stays readable with a dated note at the top saying how old it is, when we last looked at it and what we would say about it today. Articles can also be published in Portuguese as their own piece, with the translator credited and a language switcher on the page.",
  "changelog.entries.corrections-and-content-notes-reach-the-reader.title":
    "Corrections and content notes now reach you",
  "changelog.entries.corrections-and-content-notes-reach-the-reader.body":
    "The magazine promises that a correction is published as a dated note at the foot of the piece and that we never edit silently. Until now editors filed those corrections and no reader ever saw one. They appear on the article from today, dated, in the order they were made. Content notes have the same story: a piece cannot be published without one, and they were being collected and then withheld from the people they are for. They now sit above the body where you can read them first and dismiss them if you would rather not.",
  "changelog.entries.the-magazine-front-page-is-editors-work.title":
    "The magazine front page is the editors' work again",
  "changelog.entries.the-magazine-front-page-is-editors-work.body":
    "The front page used to be the nine newest pieces in the order they happened to publish. It now opens on the story the editors led with and follows the current issue's own running order, grouped into its sections, with everything else below. The masthead names the issue you are reading and the date it came out.",
  "changelog.entries.search-the-whole-magazine-archive.title":
    "Search everything the magazine has published",
  "changelog.entries.search-the-whole-magazine-archive.body":
    "There was no way to search inside the magazine, so anything below the front page's first screen was effectively gone. You can now search the full archive by headline, standfirst, body and tag, ranked by how well each piece matches. Every article's tags are links too, so you can follow one to see what else we have run on the subject.",
  "changelog.entries.a-byline-is-a-person-now.title":
    "A magazine byline is a real person",
  "changelog.entries.a-byline-is-a-person-now.body":
    "A byline used to be a name and nothing else: no photo, no biography, no way to edit it without a database, and no link back to the member who wrote the piece. Writers now have an author profile they can edit, bylines link to member profiles where the writer is one of us, and published pieces are credited on the writer's own profile.",
  "changelog.entries.your-story-submission-gets-an-answer.title":
    "Your story submission gets a real answer",
  "changelog.entries.your-story-submission-gets-an-answer.body":
    "Writing for the magazine meant filling in a full piece, uploading a cover, and then watching the tracker say “submitted” forever, because nothing on the other side could accept or decline it. Editors can now accept, decline or commission a submission and write you a note back. The outcome reaches you on your tracker and in your notifications, and a commissioned piece goes straight onto the desk. Your deck, your body text and your cover image are all kept now instead of being flattened into one field.",
  "changelog.entries.every-guide-says-when-it-was-last-checked.title":
    "Every guide says when it was last checked",
  "changelog.entries.every-guide-says-when-it-was-last-checked.body":
    "Our guides cover healthcare pathways, harm reduction, sexual health, crisis lines and legal aid, and none of them told you whether anyone had looked at them this year. Every guide now carries a review date, and the team can see which ones are due. Editors can also update guide text and the glossary directly instead of waiting for a release. There is a new index at the guides page listing all of them, including around seventeen that previously had no link anywhere and could only be reached by typing the address.",
  "changelog.entries.the-reading-group-directory-is-real.title":
    "The reading group directory is real",
  "changelog.entries.the-reading-group-directory-is-real.body":
    "Reading groups lived only in the browser: the directory emptied on refresh, and asking to join was switched off. An approved proposal now becomes a real group you can find, open and ask to join, with the person who proposed it as its host.",
  "changelog.entries.in-this-issue-replaces-the-members-digest.title":
    "“In this issue” replaces the members' digest",
  "changelog.entries.in-this-issue-replaces-the-members-digest.body":
    "The desk had been curating a digest that was set up to be emailed. QueerPulse sends no email and never will, so that whole path is gone. The curation stays and now has somewhere to land: every issue page carries an “In this issue” panel in the order the editors chose, and one notification tells you when an issue ships.",
  "changelog.entries.the-press-kit-carries-real-brand-assets.title":
    "The press kit carries real brand assets",
  "changelog.entries.the-press-kit-carries-real-brand-assets.body":
    "Every download in the press kit was a placeholder built in your browser, so a journalist asking for the logo got a file that said so. The kit now serves real files: the mark in vector and high resolution, a monochrome version, the app icon, and a printable colour and typography reference generated from the platform's own design tokens.",
  "changelog.entries.cinema-and-culture-say-what-they-are.title":
    "Cinema and Culture stopped advertising what does not exist",
  "changelog.entries.cinema-and-culture-say-what-they-are.body":
    "Cinema was publicly offering monthly memberships and quoting a ledger of money paid to filmmakers, with no way to pay and no catalogue behind it. Culture sat in the menu as four empty sections with the contribute buttons switched off. Both now say plainly that they are not open yet. The magazine also stopped telling logged-out visitors it was coming soon when it has been publishing for a while: it asks you to sign in and takes you back to the piece you wanted.",
  "changelog.entries.an-issue-stays-under-wraps-until-it-ships.title":
    "An issue stays under wraps until it ships",
  "changelog.entries.an-issue-stays-under-wraps-until-it-ships.body":
    "The number, title, theme and cover of an issue that had not been published yet were readable by anyone with an account, and the issue showed up in the archive. Unpublished issues are now held back everywhere a reader can look, and the desk keeps its full view.",

  "changelog.entries.the-directory-stopped-going-blank.title":
    "The local directory stopped going blank",
  "changelog.entries.the-directory-stopped-going-blank.body":
    "Depending on which page you arrived from, the directory and the list-your-business form could load to an empty screen instead of the places. Two files each needed the other before either had finished loading, so whichever went first found the opening hours half-built and stopped. The category names now live on their own, so nothing waits on anything.",
  "changelog.entries.notification-previews-stay-hidden-on-iphone.title":
    "Hidden notification previews now work on iPhone",
  "changelog.entries.notification-previews-stay-hidden-on-iphone.body":
    "The setting was honoured only by browsers that run our code in the background, which iPhone never does, so a lock screen kept naming who wrote to you while the toggle read “on”. Your choice now travels with your account, and the notification leaves our side already stripped: it says something arrived without saying who from or what it said. It is on by default, on every device you are signed in on.",
  "changelog.entries.leaving-no-longer-deletes-other-peoples-gatherings.title":
    "Leaving no longer deletes other people’s gatherings",
  "changelog.entries.leaving-no-longer-deletes-other-peoples-gatherings.body":
    "Erasing an account used to take every gathering that person had ever hosted with it, including future ones, along with everyone’s RSVPs. Now a future gathering passes to a co-host, or is cancelled with a notification to everyone who said they were coming. Listings, jobs and volunteering close rather than vanish, and reviews stay readable without the author’s name.",
  "changelog.entries.a-new-device-signing-in-tells-you.title":
    "You hear about it when a new device signs in",
  "changelog.entries.a-new-device-signing-in-tells-you.body":
    "If your account is opened on a device it has not seen before, you now get a notification saying which kind of device and when. Your active sessions list names each one, like “Chrome on macOS”, and marks the one you are reading on, so you can tell your own laptop from someone else’s.",
  "changelog.entries.nothing-promises-you-an-email-any-more.title":
    "Nothing promises you an email any more",
  "changelog.entries.nothing-promises-you-an-email-any-more.body":
    "QueerPulse sends no email, so every screen that said it would was asking you to wait for something that was never coming. The gathering waitlist, directory listings, Culture submissions, grant applications and the sober-host checklist now name where the answer actually arrives, in your QueerPulse notifications and messages.",
  "changelog.entries.the-status-page-works-without-an-account.title":
    "The status page works without an account",
  "changelog.entries.the-status-page-works-without-an-account.body":
    "If you cannot sign in, the hardest question is whether the problem is ours or yours. The status page now shows real service health and any incidents we have written up, and it works with no account at all, so you can tell an outage apart from something wrong with your own sign-in.",
  "changelog.entries.data-requests-get-a-real-answer.title":
    "Data requests get a real answer",
  "changelog.entries.data-requests-get-a-real-answer.body":
    "A request about your data used to be recorded and then sit where nobody could see the clock running on it. It now lands in a review queue sorted by its legal deadline, and when we reach a decision you get a notification naming your request and its reference number.",
  "changelog.entries.we-ask-again-when-the-rules-change.title":
    "We ask again when the Terms or Guidelines change",
  "changelog.entries.we-ask-again-when-the-rules-change.body":
    "Agreeing once at sign-up was treated as agreeing forever, so a rule could change without anyone ever seeing it. When either document moves materially, you are now asked to read what changed and agree again, and we keep a dated record of it. This matters most if you are ever moderated under a rule added after you joined.",
  "changelog.entries.iphone-notifications-explain-the-install-step.title":
    "iPhone notifications explain the install step",
  "changelog.entries.iphone-notifications-explain-the-install-step.body":
    "Safari only delivers notifications to QueerPulse once it is added to your Home Screen, and nothing said so: turning them on simply failed with a note that your browser could not do this yet. The setting now explains the install step and links straight to it.",
  "changelog.entries.a-heads-up-before-your-account-is-deleted.title":
    "A heads-up before your account is deleted",
  "changelog.entries.a-heads-up-before-your-account-is-deleted.body":
    "Asking to delete your account starts a grace period that was easy to forget about entirely, with nothing heard until it was gone. You now get one notification three days before it becomes permanent, while cancelling is still a single step.",
  "changelog.entries.moderators-see-the-positions-at-the-queue.title":
    "Moderators see the positions at the queue",
  "changelog.entries.moderators-see-the-positions-at-the-queue.body":
    "Both report queues, the community mod console and the platform staff one, now open with the three rules a moderator has to get right: criticism of a state is political speech and Palestine advocacy is welcome, advocacy against a class of member is not, whether a member deserves rights is not a debate we host, and nobody is ever asked to prove their gender. Until now no moderation surface linked the Guidelines at all.",
  "changelog.entries.where-we-stand-intersectionality-and-palestine.title":
    "Where we stand: trans lives, Palestine, and the rest of it",
  "changelog.entries.where-we-stand-intersectionality-and-palestine.body":
    "The About page now carries a position rather than only a set of product values. A new \u201cWhere we stand\u201d section says why intersectionality is inseparable from queer liberation, names the genocide in Gaza plainly, refuses pinkwashing, and sets out three commitments we can be held to: Palestine advocacy is political speech and moderated as such, we take no money from entities complicit in the occupation, and the mutual-aid pot can fund solidarity work. It leads on trans lives (self-identification as the standard, no \u201cboth sides\u201d debate about whether members deserve rights, and trans-exclusionary campaigning treated as a Code of Conduct matter), then Palestine, then shorter positions on sex work, migration and racism in Portugal, and serophobia. It closes on the test that decides when we speak at all. The homepage manifesto links to it, and the Community Guidelines gained a matching clause spelling out where political speech ends and a Code of Conduct matter begins.",
  "changelog.entries.directory-cards-show-who-runs-the-place.title":
    "The person who runs a place now shows their face on its card",
  "changelog.entries.directory-cards-show-who-runs-the-place.body":
    "Every card in the local directory ends with a line naming the member who runs the place, and beside that name sat a small circle holding the business’s initials. A card for Maison Du Tiago, run by Tiago, showed MD next to Tiago, which read as a second logo where a person should be. That circle now carries the member’s own profile photo, the same picture their profile shows, and falls back to their initial when they have not set one. The photo follows exactly the same rules as the name beside it: a listing whose owner chose to stay anonymous, or to appear only by their role, still shows neither, and a member who has turned their photo off across the site keeps it off here too.",
  "changelog.entries.members-can-put-something-to-a-vote.title":
    "You can put something to a vote",
  "changelog.entries.members-can-put-something-to-a-vote.body":
    "Governance votes were something you could take part in but never start. The proposals on the governance page were opened by admins, so if you thought the community should decide something, there was no button anywhere that let you say so. You can now file a motion: a title, a description, and the question you want put to the community. A motion has to earn its way onto a ballot. Ten members need to put their names to it, and you count as the first, so nine other people have to agree it deserves a vote. Once it reaches ten it goes to the team for a look, and if they approve it they set the voting window and it opens as an ordinary vote like any other. If they turn it down, the reason is written on the motion where everyone can read it. A motion that never reaches ten members closes on its own after thirty days. You can also add your name to someone else's motion, and take it back off again while the drive is still running.",
  "changelog.entries.a-governance-vote-now-needs-enough-people-to-count.title":
    "A governance vote now needs enough people to count",
  "changelog.entries.a-governance-vote-now-needs-enough-people-to-count.body":
    "A proposal used to pass on two thirds of whoever happened to vote, with no floor under how many that was. One person voting in favour and nobody voting against was two thirds of the votes cast, so it passed. That is not a community decision, and the governance page was describing it as one. Every vote now also has to clear a quorum: a minimum number of ballots before the result counts at all, set at a tenth of the active membership or ten people, whichever is larger. The number a proposal was measured against is recorded on it when it closes, so an old result always shows the bar it actually cleared rather than a bar that moved afterwards. Proposals now show turnout against quorum while voting is open, and a proposal that failed because too few people voted says exactly that, so it is never mistaken for one that lost the argument.",
  "changelog.entries.anyone-in-a-community-can-flag-an-owner-who-has-gone-quiet.title":
    "Anyone in a community can flag an owner who has gone quiet",
  "changelog.entries.anyone-in-a-community-can-flag-an-owner-who-has-gone-quiet.body":
    "When a community's owner disappears, the community freezes: nobody can change the settings, hand ownership on, or appoint a moderator to unstick it. Reporting an absent owner was limited to moderators and co-owners, which missed the case it was most needed for, because a small community whose owner vanished before appointing anyone had nobody who could file. Any member of a community can now raise it, once a day, and one open review at a time per community. Two related things also changed. If an owner erases their account, ownership now passes to a co-owner first if there is one, since that is the person the owner had already trusted with owner-level powers, and only then to the longest-standing moderator. And a community whose owner has not been seen in a long time is now flagged for the team automatically, so an abandoned community surfaces even when nobody inside thinks to report it.",
  "changelog.entries.the-constitution-links-through-to-the-code-of-conduct.title":
    "The Constitution links through to the Code of Conduct",
  "changelog.entries.the-constitution-links-through-to-the-code-of-conduct.body":
    "The foot of the Constitution offered three things to click and none of them did anything. Read the Code of Conduct now goes to the Code of Conduct. The other two, Download PDF and See the Assembly, pointed at a file and a page that do not exist, so they have been taken off rather than left sitting there looking like something you could open.",
  "changelog.entries.your-devices-list-stops-collecting-old-sign-ins.title":
    "Your devices list stops collecting old sign-ins",
  "changelog.entries.your-devices-list-stops-collecting-old-sign-ins.body":
    "Where you're signed in could fill up with entries for a device you only ever used once. Every sign-in started a session, and signing in again on the same browser started another one beside it instead of taking over from the first, so a cleared cookie, a private window or a session that had simply lapsed each left an entry behind. Those entries then sat there for a month, all reading the same thing, which made the one question the page exists to answer, is anything here not me, almost impossible to answer. Signing in now replaces whatever this browser was already holding, and sessions that have run out drop off the list instead of lingering until they're deleted. If your list is already crowded, Sign out all other sessions clears it in one go and keeps you signed in here.",
  "changelog.entries.devices-say-when-you-signed-in-and-when-you-were-last-there.title":
    "Each device says when you signed in and roughly when you were last there",
  "changelog.entries.devices-say-when-you-signed-in-and-when-you-were-last-there.body":
    "Signed in on each device was measuring the wrong thing. Your session quietly renews itself in the background every few minutes, and the page was reporting the most recent renewal, so the laptop you've been signed in on since June announced itself as having arrived seven minutes ago. It now shows when you actually signed in on that device, and adds a rough last activity line when the device has been back since. A device you signed in on and never returned to shows only the sign-in, because that's all we know about it.",
  "changelog.entries.profile-sections-share-one-left-edge.title":
    "Every section of your profile lines up down one edge",
  "changelog.entries.profile-sections-share-one-left-edge.body":
    "On a wide screen the sections down your profile sat slightly out of line with each other: Communities, your work, your skills and the rest were all indented by a hair that \u201cPlaces you run\u201d did not have, so the column read as crooked. The page was quietly applying its side gutter twice to those sections, once for the page and once for the section itself. They now share the same left edge as \u201cPlaces you run\u201d, from the top of the page to the bottom. On a phone, \u201cPlaces you run\u201d picks up the same side margin every other section already had, so its cards clear the edge of the screen.",
  "changelog.entries.my-communities-waits-instead-of-saying-you-have-none.title":
    "My communities waits for your list instead of saying you have none",
  "changelog.entries.my-communities-waits-instead-of-saying-you-have-none.body":
    "Opening Communities used to greet you with \u201cYou haven\u2019t joined any communities yet\u201d for the moment it took to fetch your memberships, even when you belonged to six of them. The tab now holds a skeleton in the shape of your cards until your list arrives, and the line under the heading stays quiet until it can quote the real number, so it never reads \u201cacross your 0 communities\u201d on the way. The empty state still appears the moment we know it is true, with the same invitation to go and find a community.",
  "changelog.entries.say-what-you-do-on-your-profile.title":
    "You can say what you do on your profile, and be found for it",
  "changelog.entries.say-what-you-do-on-your-profile.body":
    "The member directory has always let people filter by field of work and profession, but the only place to set yours was buried in Settings, so most profiles had nothing to match against. You can now pick your field, and the roles within it, straight from the edit view on your profile, and the wizard asks new members the same question while they are setting up. What you pick shows on your profile under \u201cWorks in\u201d, and it is what puts you in the results when someone filters the directory for a photographer, a nurse, or a lawyer. Choosing a role selects its field for you, and the roles stay hidden until you pick a field, so you never face seventy chips at once.",
  "changelog.entries.admin-account-menu-is-real.title":
    "The admin sidebar's account button actually does something now",
  "changelog.entries.admin-account-menu-is-real.body":
    "The button at the foot of the admin rail showed a name that was never yours and a job title nobody holds, and clicking it did nothing at all. It now shows the account you are really signed in as, with the address alongside your name, and opens a menu with the things admin had no route to: your profile, your account settings, your active sessions, and a sign out. Signing out mattered most. Back to platform leaves the console but keeps the session open, so genuinely signing off used to mean three more navigations out on the main site, which is a long walk on a shared machine. The menu also spells out the access this account holds, including the staff grants that decide which sidebar sections work at all.",
  "changelog.entries.admin-sidebar-grouped-sections.title":
    "The admin sidebar is grouped into sections you can collapse",
  "changelog.entries.admin-sidebar-grouped-sections.body":
    "The admin rail had grown to thirty-two links in one flat list, long enough that finding anything meant scrolling past most of it. Those links now sit in eight labelled sections: Trust & safety, People & access, Communities, Directory, Editorial, Partners & recognition, Site content, and Platform. Every heading opens and closes with a short slide, and the rail remembers which ones you left open. A closed heading still shows the total number of items waiting inside it, so a collapsed section can never hide a queue that needs attention, and landing on a page inside a closed section opens that section for you.",
  "changelog.entries.since-friday-panel-removed.title":
    "The magazine desk's Since Friday panel is gone",
  "changelog.entries.since-friday-panel-removed.body":
    "The editor's left rail carried a Since Friday button that opened a panel listing what had happened on the desk while you were away. It duplicated what the desk already shows you: the activity feed in the sidebar reads the same record, and every piece keeps its own History tab. The button and the panel have been removed, and the rail is shorter for it.",
  "changelog.entries.writer-desk-header-says-whats-due.title":
    "The writer's desk header now says what's due",
  "changelog.entries.writer-desk-header-says-whats-due.body":
    "The top of your writing workspace showed your own avatar, your name and the word Contributor, all of which the navigation bar already carries a few pixels above it. That word was also fixed in place: it read Contributor for everyone, always, and stayed in English on the Portuguese site. The bar now names the page and tells you where your work stands, with how many assignments are open and when the nearest one is due, or a quiet line saying nothing is open when your desk is clear.",
  "changelog.entries.editors-can-write-their-own-pieces.title":
    "Magazine editors can write a piece themselves, not only commission one",
  "changelog.entries.editors-can-write-their-own-pieces.body":
    "The editor desk had one way to start a piece: commission it. That meant an editor who simply wanted to write something had to send themselves a brief, complete with a fee and a deadline, before they could type a word. Write is now the desk's main action, and Commission sits beside it for the times a piece really is going out to somebody else. Write skips the form entirely: the piece is created with you as its own writer, it starts in drafting rather than waiting on a brief that will never arrive, and you land straight in the article editor with the cursor ready. Its title, section, byline and issue are all set in the editor's own side rail, where they were always going to be edited anyway. A piece started this way files onto whichever issue you are working on, or stays unfiled if you started from the Unassigned tab, and the desk's history reads \"started writing\" instead of a commission that never happened. Pressing w on the desk does the same thing, as does the Write button in the left rail and in the command palette.",
  "changelog.entries.editor-pages-start-at-the-top.title":
    "The magazine editor's pages no longer start with a band of empty cream",
  "changelog.entries.editor-pages-start-at-the-top.body":
    "Every screen in the magazine editor reserved a strip of space at the top for the site's floating navigation bar, which those screens never show: they run on their own left rail instead. The result was a tall empty band above the desk, the pitch tracker and the issue plan, and it pushed the sticky title bars on a piece, an issue and a deck down off the edge of the window. That space is no longer held back, so each editor page starts where its content starts and the sticky bars sit flush at the top. Editors who use the app's left sidebar navigation also had the desk pushed sideways by the width of a rail that isn't drawn on those pages; that offset is gone too.",
  "changelog.entries.issue-publish-date-optional.title":
    "A magazine issue no longer needs a date to exist",
  "changelog.entries.issue-publish-date-optional.body":
    "Creating an issue on the editor desk demanded a publish date before anything else could happen, which meant an editor had to invent one to open a number. The date is now optional: fill in the number, the title and the theme, and the issue exists. Its own production page carries a Publish date card in the right rail where the date can be set later, moved, or cleared again if the plan changes. An issue with no date reads as unscheduled everywhere it appears instead of showing a made-up day, and shipping still stamps the day it went out if nobody ever set one.",
  "changelog.entries.cohost-invite-form-reads-properly.title":
    "Inviting a co-host reads properly now",
  "changelog.entries.cohost-invite-form-reads-properly.body":
    "The second step of the co-host invite, where a host sets the terms, was showing raw internal labels instead of real words: every field name, both dropdowns and both buttons printed a code. It now reads in full, in English and Portuguese. The person being invited stays visible at the top of the form with their photo and pronouns, and a single button goes back to the picker if it is the wrong person. Choosing a role or a time commitment shows the same description the invited person will read on their invite, so nobody picks blind. The note field counts down to its 500-character limit, the reply-by date can no longer be set in the past and says it is optional, and the send and cancel buttons stay inside the panel at any window width. The same fix reached the co-host invite page, which was missing its line about which powers a co-host gets on accepting and which stay with the lead host, and Settings, where the public part of your profile (your field, your role and the languages you speak) had lost its headings.",
  "changelog.entries.desk-activity-reads-in-plain-language.title":
    "Magazine desk activity now reads in plain language",
  "changelog.entries.desk-activity-reads-in-plain-language.body":
    "Two places in the magazine desk printed their lines straight out of the database: the Activity panel in the right rail, and the History trail on a piece's own record. Both showed a long identifier where a name belongs, an internal code like \u201carticle_edited\u201d where the action belongs, and a machine timestamp. Nobody could tell who had touched what. Both now read as sentences: the editor or writer by name, what they did in plain words, and when. The desk feed names each piece by its title and says how long ago it happened; a piece's own History says \u201cthis piece\u201d and gives the date and time, since that trail is the permanent record. Notes left on a draft, restored drafts and slideshows converted to articles get proper wording too. Lines from an automatic step read as System, and a piece that has since been deleted reads neutrally instead of showing an id.",
  "changelog.entries.mod-tools-became-a-console.title":
    "Mod tools is now a console with a section rail",
  "changelog.entries.mod-tools-became-a-console.body":
    "A community's Mod tools tab stacked eight surfaces in one long scroll, so the two things that are actually time-sensitive, people asking to join and reported posts, sat buried under a statistics panel and above the full member roster. Mod tools now opens on an overview that answers one question first: is anything waiting on you. Beside it runs a rail with Overview, Requests, Reports, Members, Invites, Member card and Danger zone, and each opens on its own, one at a time. Requests and Reports carry a count when something is waiting. Bans moved in under Members, where a member\u2019s standing is already being read. Each section has its own web address now, so a moderator can link a co-moderator straight to the reports queue and the back button walks out of it. On a phone the rail becomes a row of chips above the section.",
  "changelog.entries.share-card-shows-your-own-gathering.title":
    "A gathering's share card now shows that gathering",
  "changelog.entries.share-card-shows-your-own-gathering.body":
    "On the manage dashboard for a gathering you are hosting, the share card in the sidebar always showed the same sample event: one fixed title, one fixed date and neighbourhood, and a link that led to the gatherings index rather than to your listing. It now shows the gathering you are managing, with its own title, date and venue, and its cover photo when you have uploaded one. Copy puts the gathering's real public link on your clipboard, and \u201cView public listing\u201d opens that gathering's own page.",
  "changelog.entries.place-page-reads-in-one-piece.title":
    "A place's page now reads as one thing",
  "changelog.entries.place-page-reads-in-one-piece.body":
    "On a business page in the directory, the opening hours sat in a narrow table with a wide empty strip beside it, the line saying who last confirmed the details drifted underneath it, and the map was a small square with the address stranded below. Hours now sit in one card: the week in two columns, any upcoming changes to it, and the confirmation line along the bottom. The live status reads beside the heading, as in \u201cHours \u00b7 Open now\u201d. \u201cWhere it is\u201d became a single card too, with the map running down one side and the address, every way to reach the place and the main action beside it. Getting back to the directory is now a quiet link under that card, and a hairline separates each section of the page from the next.",
  "changelog.entries.place-pages-open-all-at-once.title":
    "A place's page now opens with its photos already there",
  "changelog.entries.place-pages-open-all-at-once.body":
    "Opening a business in the queer business directory used to paint the name, the details and four empty photo frames, which then filled in one at a time as each picture arrived. The page now waits behind a short loading screen that tells you which step it is on, and lands with the photos in place. If a photo is slow or missing the page comes through anyway rather than leaving you waiting.",
  "changelog.entries.browse-every-tag-by-category.title":
    "Browse every tag by category instead of guessing the word",
  "changelog.entries.browse-every-tag-by-category.body":
    "The tags field on your profile only ever showed six popular chips and a search box, so you had to already know a tag existed to find it. There is now a \u201cBrowse all\u201d button that opens the full list grouped by category: design and visual craft, words and communication, tech, community and care, practical and professional, music and performance. Tap a tag to add it, tap it again to take it off, and search across every category from the top of the panel. Your picks land on the profile as you make them.",
  "changelog.entries.backspace-keeps-your-tags.title":
    "Backspace no longer eats the tags you already picked",
  "changelog.entries.backspace-keeps-your-tags.body":
    "In every field where you build up a row of tags, the skills on your profile, what you are open to, and the tags on a forum post, holding backspace to clear what you had typed carried on into the tags sitting to the left of the cursor and removed them one by one, with no way to undo it. Backspace now only clears the text you are typing. Tags come off when you press the \u00d7 on the tag itself.",
  "changelog.entries.map-loader-stays-in-its-panel.title":
    "The directory map now loads inside its own panel",
  "changelog.entries.map-loader-stays-in-its-panel.body":
    "The first time you switched the queer business directory from List to Map, the loading screen covered the whole window instead of sitting in the map panel, so the page appeared to disappear for a moment. The loader now fills the same rounded panel the map lands in, and the page around it stays put.",
  "changelog.entries.plum-headers-reach-the-top.title":
    "Plum page headers now run all the way to the top",
  "changelog.entries.plum-headers-reach-the-top.body":
    "On pages with a deep plum header, such as Safe spaces, Culture, Jobs and Housing, a thin strip of cream page stayed behind the floating navigation bar, so the colour appeared to start a little way down the screen. The plum now fills that strip on every one of these pages, and it stays correct in the sidebar and mobile layouts too.",
  "changelog.entries.footer-closes-the-page.title":
    "Short pages now end at the bottom of the window",
  "changelog.entries.footer-closes-the-page.body":
    "A page with little on it, such as your membership cards before a community has issued you one, used to stop short: the footer landed partway down the screen with a band of empty page showing underneath it, as though the layout had come loose. Every page now reaches the bottom edge of the window, so the footer always closes it. Longer pages are untouched.",
  "changelog.entries.tab-title-follows-the-page.title":
    "The browser tab names the page you are on",
  "changelog.entries.tab-title-follows-the-page.body":
    "Opening a public page such as the magazine and then heading back to your feed or the local directory left the old name sitting in the browser tab, so a window kept open for later could read \u201cThe Magazine\u201d while showing your feed. Pages that carry a name of their own still set it, and every other page now shows the plain QueerPulse name the moment you arrive.",
  "changelog.entries.magazine-issues-run-the-desk.title":
    "Magazine issues now run the desk",
  "changelog.entries.magazine-issues-run-the-desk.body":
    "The editor desk could only ever work on one issue: whichever had the highest number. There was no way to make a new one, and no way back to an older one. Now there is a \u201cNew issue\u201d button, and a switcher in the header that says which issue you are working on. Pieces start with no issue at all, sitting in an Unassigned track until someone files them. You can file one from its row, select several and assign them together, or sit inside an issue and pull work in from its own page. A piece can move straight from one issue to another. And shipping an issue now files its articles under it, so the issue's public contents page actually lists what ran.",
  "changelog.entries.local-map-reads-clearly.title":
    "The local map reads clearly again",
  "changelog.entries.local-map-reads-clearly.body":
    "The map on the local directory had gone hazy. Its streets were drawn in white and pale grey, colours meant for a different background, so against our cream they all but disappeared. Every place name carried a soft white glow that left the text looking out of focus, and some parish names were printed twice a few pixels apart. Streets now sit on a warm scale with an edge of their own, so you can follow a road across the city. Names are cut cleanly out of the background, and each parish is named once. Maps also lost their sharpness whenever the browser was zoomed or the window moved to a second screen, and stayed soft until you reloaded the page. Every map is now drawn at a finer resolution than the screen asks for and stays sharp at any zoom level, on any display.",
  "changelog.entries.reviews-sort-on-quiet-listings.title":
    "Sorting and filtering reviews now works on quieter listings",
  "changelog.entries.reviews-sort-on-quiet-listings.body":
    "The review list carried a line reading \u201cNewest first\u201d with nothing you could use to change it. The controls were built, they were simply held back until a place had gathered four reviews, so most listings never showed them at all. Reviews now sort and filter from the second review onwards. Order them by newest, oldest, most helpful, or highest and lowest rating; narrow the list to one star rating; and keep only the reviews that came with a photo or that the owner has answered. If a combination leaves nothing on screen, one tap clears it.",
  "changelog.entries.map-narrows-to-the-area-you-pick.title":
    "Picking an area on the map clears the rest",
  "changelog.entries.map-narrows-to-the-area-you-pick.body":
    "Clicking a parish on the local map highlighted it and filtered the list beside it, yet every other pin stayed put, so the area you had just chosen was still buried under the whole city. Choosing an area now leaves only that area\u2019s pins on the map. Every other parish keeps its name and a number for how much sits inside it, so you can still tell where the rest of the city is. Click the highlighted area again to bring everything back.",
  "changelog.entries.pages-open-at-the-top.title":
    "Changing pages lands you at the top straight away",
  "changelog.entries.pages-open-at-the-top.body":
    "Leaving a page you had scrolled a long way down, say the bottom of the listings directory, and opening another one such as your profile, made the browser glide all the way back up before the new page settled. On a long list that glide took a while, and anything you tapped during it fought the animation. Page changes now land at the top instantly. Browser back still returns you to the exact spot you left, and tapping the tab you are already on still glides up as before.",
  "changelog.entries.queer-owned-says-queer-owned.title":
    "Queer-owned places say so on their card",
  "changelog.entries.queer-owned-says-queer-owned.body":
    "A business whose owner told us it is queer-owned was still labelled \u201cLGBTQ+ friendly\u201d in the directory. Two things were wrong: the card was reading a completely different setting (whether the owner shows the listing on their profile), and a verified safe space took over the badge corner entirely, so those places could not say what they were at all. Cards now carry the ownership badge in three honest steps: verified queer-owned, queer-owned, or LGBTQ+ friendly. The safe-space mark has moved beside it as a jade shield, and hovering or focusing it names it.",
  "changelog.entries.review-appears-immediately.title":
    "Your review shows up the moment you post it",
  "changelog.entries.review-appears-immediately.body":
    "Posting a review on a place told you it had worked, then left the page looking exactly as it did before: your words only turned up if you reloaded. The page had been quietly handed a copy of the listing saved just before you wrote. Your review now appears in the list the instant it is posted, with the star rating already counting it. The same stale copy could reach any public page, so persona pages, community teasers, housing groups, co-ops, the roadmap and the changemaker directory all now show your changes straight away too.",
  "changelog.entries.star-pickers-follow-your-cursor.title":
    "Star pickers now follow your cursor properly",
  "changelog.entries.star-pickers-follow-your-cursor.body":
    "Rating a place or a company meant aiming at each star exactly: the gaps between them counted as nowhere, so the preview kept dropping back to empty as you moved along the row, and the colour arrived in a hard snap. The stars now sit shoulder to shoulder, so anywhere in the row lights up the rating you are pointing at, and the coral pours in instead of jumping.",
  "changelog.entries.review-stars-hint.title":
    "Reviews now tell you why the post button is greyed out",
  "changelog.entries.review-stars-hint.body":
    "You could write a whole review of a place, reach for the button, and find it dead, with nothing to say the star picker further up was still untouched. Now, the moment you start writing, a line appears beside the button asking for a star rating, so the one missing piece is named where you are actually looking.",
  "changelog.entries.filters-keep-your-place.title":
    "Filtering a page no longer throws you back to the top",
  "changelog.entries.filters-keep-your-place.body":
    "Flipping the local directory between map and list used to fling the page back to the very top, and so did ticking a filter or typing another letter into a search box. Anything that lives in the address bar counted as a whole new page. Now the app can tell a filter from a real navigation: switch views or narrow a list and you stay exactly where you were reading.",
  "changelog.entries.directory-card-cover-photo.title":
    "Your listing's photo now shows up in the directory",
  "changelog.entries.directory-card-cover-photo.body":
    "Every card in the local directory read \u201cPhoto coming\u201d, even for businesses whose owners had uploaded a wide shot months ago. The photo was there the whole time; the grid simply never asked for it. Cards now show the wide shot from your listing, framed the way you cropped it, and the photos step says plainly which one becomes your cover.",
  "changelog.entries.persona-banner-reposition.title":
    "Put your persona banner exactly where you want it",
  "changelog.entries.persona-banner-reposition.body":
    "Your banner no longer has to sit wherever the crop landed. Hover it on your own persona page, take “Reposition”, and drag the image up or down until the part you care about is in frame. Arrow keys work too. Save, and that's how everyone sees it.",

  "changelog.entries.listing-owner-photo.title":
    "The face behind a listing actually shows up",
  "changelog.entries.listing-owner-photo.body":
    "The \u201cWho runs it\u201d card on a business page fell back to initials even when the owner had a profile photo, and the same thing happened to the photos beside reviews and questions. Their pictures were being pointed at the wrong place and never loaded. They now load properly, and anyone who has turned their photo off in their privacy settings still shows initials, as they chose.",
  "changelog.entries.persona-savebar-compact.title":
    "More room to type when editing a persona on a phone",
  "changelog.entries.persona-savebar-compact.body":
    "The unsaved-changes bar in the persona editor used to list every edit in full, which on a small screen left barely any space above the keyboard. On phones it now shows a single line telling you how many changes are waiting, and you can tap it open whenever you want the full list. Save and Discard stay exactly where they were.",
  "changelog.entries.sharper-photos.title":
    "Photos that stay sharp on every screen",
  "changelog.entries.sharper-photos.body":
    "Photos you upload now keep more of their detail. Large pictures are shrunk in careful stages rather than one rough pass, which is what used to leave a banner or a profile photo looking slightly soft, and they are saved in a newer format that holds more detail for the same size. Screenshots and drawings stay pixel-perfect. Pictures are also requested at the size your screen can actually show, so a sharp phone gets a sharp picture and nobody pays for detail they cannot see.",
  "changelog.entries.listing-pages-rebuild.title":
    "Business pages, rebuilt around what you came to find out",
  "changelog.entries.listing-pages-rebuild.body":
    "Every business page now opens with what you actually came for: whether it is open right now, where it is, what it is, and how easy it is to get into. Accessibility questions are answered yes, no, or nobody has told us, so a question no one has answered stops looking like a no. You can ask a business something in public and read what other people asked, see when a review was written, mark one helpful, and add a photo to your own. Places that have closed, moved, or paused now say so instead of quietly looking open.",
  "changelog.entries.listing-owner-control.title":
    "More control if you run a place",
  "changelog.entries.listing-owner-control.body":
    "Editing your listing no longer takes it off the directory while it waits to be checked again. Once you are approved, your corrections go live as you save them. The editor is one screen instead of six steps, it keeps a draft if you get interrupted, and it shows you the real page before you publish. You can set holiday hours, mark yourself temporarily closed or moved, pause a listing without deleting it, list your services and prices, and see what people have suggested or asked.",
  "changelog.entries.persona-banner-framing.title":
    "Persona banners, framed the way you framed them",
  "changelog.entries.persona-banner-framing.body":
    "Persona banners now reframe at 3:1 — the shape they actually paint at — instead of the 2:1 used for magazine covers, and the page keeps whatever you centred in the frame rather than slicing an arbitrary strip out of the middle. Banners upload at a higher resolution too, so they stay sharp edge to edge on a big screen, and they now run all the way up to the top of the page.",
  "changelog.entries.card-check-page-rebuild.title":
    "The card check page now shows the member\u2019s photo",
  "changelog.entries.card-check-page-rebuild.body":
    "Scanning a membership card used to give a plain line of text and a note telling you to look at the photo on the card. The check now comes back as the card itself: the holder\u2019s name on its own line with their pronouns beneath it, the community, role and card number, and the photo the card carries, served from the community\u2019s own records so you are comparing the person in front of you against a copy nobody at the door could have edited. A card that does not check out now says what can cause that, what to try next, and that it is not a judgement about the person. And a scan that fails because your phone lost its connection now says so instead of reading as a refusal.",
  "changelog.entries.persona-rights-footer-once.title":
    "One copyright notice per persona page",
  "changelog.entries.persona-rights-footer-once.body":
    "The \u201cAll rights reserved\u201d notice used to repeat beside every single item on a persona page. It now appears once, at the end of the page, covering all of that persona\u2019s work. Opening a poem or an artwork on its own still shows its own notice.",
  "changelog.entries.community-card-live-preview.title":
    "See your community's card while you edit it",
  "changelog.entries.community-card-live-preview.body":
    "Editing a community meant guessing: the name, tagline, cover photo, kind of space, tags and who can find it all change the card people meet you through, and the only way to see the result was to save and go look. The edit dialog now shows that card beside the form, drawn from what you are typing, so you can see a cover crop or a shorter tagline land before you commit to it.",

  "changelog.entries.card-co-owner-role.title":
    "Membership cards name co-owners correctly",
  "changelog.entries.card-co-owner-role.body":
    "Communities can hand a member owner-level powers as a co-owner. Membership cards did not know that role yet, so a co-owner's card called them a member on the card itself, in the holders panel and on the page a scanned card opens. Cards now print the role the roster actually holds, and promoting someone updates their card straight away instead of waiting for the page to reload.",

  "changelog.entries.profile-community-cards.title":
    "Your communities look the same on your profile as on the communities page",
  "changelog.entries.profile-community-cards.body":
    "The communities you feature on your profile were a plain compact card. They are now the same card the communities page shows: the category letterhead with its cover photo, the faces already in the room, the full description, the tags and this week's activity. The badge tells visitors how you stand in each one, whether you run it, moderate it or are simply a member.",

  "changelog.entries.profile-places-directory-cards.title":
    "Your places look the same on your profile as in the directory",
  "changelog.entries.profile-places-directory-cards.body":
    "The “Places you run” cards on your profile were a plain text summary. They are now the same card the local directory shows: cover photo, queer-owned or safe-space badge, category, tags and today's opening hours. Your listing's status and the edit, quick edit and delete actions sit underneath, so you can still see at a glance whether something is live or still being read.",

  "changelog.entries.community-co-owners.title":
    "Owners can share a community with a co-owner",
  "changelog.entries.community-co-owners.body":
    "From Mod tools, a community owner can make any member a co-owner. Co-owners run the place alongside you: join requests, moderation, settings and the roster. Transferring ownership, archiving the community and changing a co-owner's role stay with the owner alone, and co-ownership can be taken back at any time.",

  "changelog.entries.card-art-counted-as-in-use.title":
    "Members card artwork now counts as an image in use",
  "changelog.entries.card-art-counted-as-in-use.body":
    "The crest and the background a community picks for its members card were showing as having no references in your uploads, which made live card artwork look safe to delete. Both now count as in use and link back to the community that prints them. Community avatars, magazine article and deck pictures, and photos sent in a conversation are counted too.",

  "changelog.entries.community-house-rules.title":
    "House rules now come with the invitation",
  "changelog.entries.community-house-rules.body":
    "Joining a community with house rules means reading them and agreeing first. If an owner later changes the rules, everyone already inside is asked once to read the new version, and what you agreed to is recorded.",
  "changelog.entries.community-removal-bars-return.title":
    "Being removed from a community now means it",
  "changelog.entries.community-removal-bars-return.body":
    "When a moderator removes someone, that person can no longer walk straight back in. Moderators can still remove someone and leave the door open when it is a simple tidy-up, and every bar can be lifted later from Mod tools.",
  "changelog.entries.community-announcements.title":
    "Owners can say something that carries",
  "changelog.entries.community-announcements.body":
    "Owners, co-owners and moderators can post an announcement: it pins to the top and reaches the community's members. Ordinary posts stay ordinary.",
  "changelog.entries.community-notification-levels.title":
    "Choose how much each community reaches you",
  "changelog.entries.community-notification-levels.body":
    "Every community now has its own setting: everything, announcements only, mentions only, or muted. Set it per community from the tab row. New members start on announcements only.",
  "changelog.entries.community-invites-any-time.title":
    "Invite people to your community any time",
  "changelog.entries.community-invites-any-time.body":
    "Inviting members used to be possible only on the day you founded a community. Owners, co-owners and moderators can now invite from Mod tools. An invitation is a message, and joining stays the other person's decision.",
  "changelog.entries.community-join-review-context.title":
    "Reviewing a join request shows you the person",
  "changelog.entries.community-join-review-context.body":
    "A request now arrives with pronouns, how long they have been on QueerPulse, connections you share, and communities you share, with their name linked to their profile. Declining asks whether it is 'not right now' or 'not a fit', so the person knows whether to try again.",
  "changelog.entries.community-resources-shelf.title":
    "A real shelf for a community's links",
  "changelog.entries.community-resources-shelf.body":
    "Owners, co-owners and moderators can build a community's resource shelf: crisis lines, legal guides, a reading list, whatever the community keeps coming back to. Reorderable, and it shows on the About tab.",
  "changelog.entries.community-co-ownership.title":
    "Co-owners, and a way to flag an absent owner",
  "changelog.entries.community-co-ownership.body":
    "A community can now have a co-owner who shares the day-to-day powers, while transferring ownership and archiving stay with the owner. If an owner becomes unreachable, moderators can ask platform staff to look, and the owner can withdraw that request by simply showing up.",
  "changelog.entries.community-governance-history.title":
    "Every community can see its own history",
  "changelog.entries.community-governance-history.body":
    "Owners, co-owners and moderators can read the record of what happened in their community: role changes, removals, bans lifted, pauses and transfers. It used to be visible only to platform staff.",
  "changelog.entries.community-public-teaser.title":
    "Share a community with someone outside",
  "changelog.entries.community-public-teaser.body":
    "Owners can let a community show a short public page to people who are not signed in: what it is, who it is for, and how to ask for an invite. Off by default, available only to open and request-to-join communities, and it never shows the member list or a single post.",
  "changelog.entries.community-place-and-language.title":
    "Find communities near you, in your language",
  "changelog.entries.community-place-and-language.body":
    "Communities can say where they meet and which languages they run in, and Discover can filter on both. Sorting by most active is also now done properly on the server, so the results are right past the first page.",
  "changelog.entries.community-welcome-and-search.title":
    "A welcome on arrival, and search inside a community",
  "changelog.entries.community-welcome-and-search.body":
    "Owners can write a greeting that a new member sees once when they arrive. Every community's posts are now searchable, across the whole history rather than the part you have scrolled.",
  "changelog.entries.community-insight-trends.title":
    "Community stats now show direction",
  "changelog.entries.community-insight-trends.body":
    "The owner's stats panel adds twelve weeks of members and posts, so you can see whether a community is growing or going quiet. Whole-community totals only: nobody's individual activity is shown.",
  "changelog.entries.community-pause-reason.title":
    "A paused community explains itself honestly",
  "changelog.entries.community-pause-reason.body":
    "The pause banner used to say moderators were reviewing reports even when an owner had simply paused things themselves. It now says which of the three it is, when it started, and carries the moderator's note when there is one.",
  "changelog.entries.community-card-covers.title":
    "Communities show their photo",
  "changelog.entries.community-card-covers.body":
    "A community card led with a flat band of colour, so a community that had picked a cover photo never showed it anywhere except its own page. The card now uses that photo as its header, with the category and the access label set on a soft dark wash so they stay readable over any image. A community without a photo keeps the coloured band. Every card in the grid is also the same height now, whatever the length of its tagline, so the member counts and the buttons line up along one row instead of drifting.",
  "changelog.entries.community-founded-month.title":
    "Founded, down to the month",
  "changelog.entries.community-founded-month.body":
    "A community page said only the year it was founded, so anything started this year read as \u201cFounded 2026\u201d and told you very little. It now names the month too, written the way your language writes it: \u201cFounded August 2026\u201d.",
  "changelog.entries.card-text-legibility.title":
    "Cards you can read across a room",
  "changelog.entries.card-text-legibility.body":
    "A membership card set on a flag or a photo has always darkened whatever sits under its print, but one treatment cannot suit every image: the gradient that works over a striped flag gets lost in a busy illustration. Owners now choose between three. A panel puts a small dark plate behind your community\u2019s name and behind the member\u2019s name and leaves the rest of the artwork uncovered. A shade darkens the top and bottom of the card. A veil dims the whole card evenly. The preview in the designer follows the choice as you make it, and a printed card carries the same treatment as the one on the phone. Every card also prints larger: the type is now sized against the card itself, so a card shown big on screen has big type on it rather than phone-sized print on a blown-up object.",
  "changelog.entries.my-communities-cards.title":
    "Your communities, as communities",
  "changelog.entries.my-communities-cards.body":
    "My communities used to name the communities you belong to in a small list down the side of the page, while everyone else\u2019s got a proper card. Now yours lead the page: the same cards, the same search, categories and sort you already use to find a community, pointed at the ones you are already in. Each card is marked as one of yours and shows how many people were around this week, and the tabs carry a count so you can see at a glance how many you are in. What was there before \u2014 anything waiting on you as a moderator, and the week across your communities \u2014 now sits underneath.",
  "changelog.entries.cards-load-whole.title": "Your card arrives in one piece",
  "changelog.entries.cards-load-whole.body":
    "A membership card used to assemble itself in front of you: the community\u2019s flag, its crest and your photo each appeared whenever they happened to finish loading. Now the card waits until all three are ready and arrives complete, with a placeholder holding its exact shape while it comes. Showing the same card again is instant. On a slow connection the card still appears rather than leaving you waiting at a door.",
  "changelog.entries.pronouns-on-membership-cards.title":
    "Pronouns on a membership card",
  "changelog.entries.pronouns-on-membership-cards.body":
    "A community can now print each member's pronouns beside their name on their card, so the person reading it knows how to address the member holding it. The pronouns come from the member's own profile, so a card only ever shows what they have already set there, and updating them updates every card at once. It is off until a community turns it on, and any member can switch their own off from their cards page. Where a card carries them, they also appear on the page someone lands on after scanning the code.",
  "changelog.entries.printed-membership-cards.title":
    "Membership cards you can print",
  "changelog.entries.printed-membership-cards.body":
    "Communities can now print physical membership cards for their members, on a sheet you cut and fold. A printed card shows the same code as the one on a member's phone, so anyone can check it at a door. If a card is lost, moderators can replace it: every printed copy stops working straight away, and the member's card on their phone keeps going.",
  "changelog.entries.profile-back-to-origin.title":
    "The way out of a profile goes back where you were",
  "changelog.entries.profile-back-to-origin.body":
    'Profiles are opened from everywhere: a community\'s member list, a forum thread, a gathering, a search, the header of a chat. The link above every profile always said "Back to the room" and always dropped you in the members directory, which for most people was a page they had never been on, and it cost them the scroll position they left behind. It now returns to the page you actually came from, says where that is, and lands you at the exact spot in the list you tapped from. Arriving straight from a shared link, a refresh or a notification still offers the directory, because in that case there is nowhere else to go back to.',

  "changelog.entries.card-holder-open-card.title":
    "Open a member's card from the holder list",
  "changelog.entries.card-holder-open-card.body":
    "A community's card holder list showed a name, a card number and two buttons, so the one thing an owner or moderator actually wanted to check, the card itself, was the one thing they could not look at. Any row now opens, showing that member's real card at full size: the community's design, the dates it carries, the role it prints and the photo it does or does not show. The code on the back is the exception, and it says so: it is minted for the person holding the card, so only they can produce a working one. Pausing, revoking and reinstating are right there on the open card too, so checking a card and acting on it are no longer separate trips.",

  "changelog.entries.card-photo-legibility.title":
    "Photos that stay readable on any card",
  "changelog.entries.card-photo-legibility.body":
    "A member's photo and a community's crest used to sit straight on top of whatever the card was wearing, so a pale photo on a pale flag lost its edges and a busy illustration behind it competed with the face. Both now carry a two-tone edge and a soft shadow that darkens the few pixels of card they sit on, which holds up on a flag, on an uploaded picture and on a flat colour alike. Communities that print photos can also choose to print them in black and white, and the designer says plainly that this is a choice being made about other people's pictures.",

  "changelog.entries.card-member-photos.title":
    "Photo membership cards, with the last word left to the member",
  "changelog.entries.card-member-photos.body":
    "A community can now put each member's photo on their card, so someone on a door can match the card to the person without scanning anything. The photo comes from the member's own profile and sits on the front, beside the community's name, where a physical card would carry it. It is off until a community turns it on, and any member can switch their own off from their cards page without leaving the community: a face on a credential naming a queer community is not a small thing to ask of someone who is not out.",

  "changelog.entries.card-two-sides.title":
    "Your membership card now has a back, and a front worth looking at",
  "changelog.entries.card-two-sides.body":
    "A membership card used to be one flat side with everything crowded onto it. It now works the way a real card does. The front is the object: your community's flag, photo or colour, its crest, and your name, under a laminate that catches the light as you move across it. Turn it over with the button in the corner and the back carries the credential: a much larger code, the card number, when you joined, when it stops being valid, and your role in the community. The code is only prepared once you actually turn the card over, so a card sitting face-up on a table has nothing to prove and mints nothing.",

  "changelog.entries.cohost-invite-copy.title":
    "Co-host invites read like words again, and Portuguese weeks start on Monday",
  "changelog.entries.cohost-invite-copy.body":
    "Inviting someone to co-host a gathering showed internal placeholders where the roles and time commitments should have been, and the invite page said the same thing when a link had expired or was already answered. All of it now reads as written, in English and Portuguese, including the notification that lands when someone asks you to co-host. Date pickers in Portuguese also start the week on Monday, as they should, instead of borrowing a Sunday-first calendar.",

  "changelog.entries.card-backgrounds.title":
    "Put a flag, or your own photo, on your community's card",
  "changelog.entries.card-backgrounds.body":
    "A membership card no longer has to be a flat colour. Choose one of thirteen pride flags, from the rainbow and Progress Pride to trans, bi, lesbian, pan, ace, aro, non-binary, genderfluid, genderqueer, agender and intersex, or upload a photo of your own. Whatever you choose, the card keeps itself readable: a fixed scrim sits between the background and the text, so nobody has to squint at a door. The code stays scannable on every one of them.",

  "changelog.entries.card-designer.title":
    "A real design tool for your community's membership card",
  "changelog.entries.card-designer.body":
    "Designing a card now happens on a full-width canvas: a large live preview of the card as a member holds it, card styles shown as miniature cards rather than colour dots, your own crest on the card, a light and dark check, and the exact date a card issued today would stop working. Closing with unsaved changes asks first. Saving a design no longer issues cards to everyone behind your back: issuing is its own button, it says what it will do before it does it, and cards you paused or revoked now stay that way.",

  "changelog.entries.membership-cards.title":
    "Communities can now give you a membership card",
  "changelog.entries.membership-cards.body":
    "Any community you belong to can issue you a membership card, kept under your account alongside your other cards. It stays covered until you choose to show it, hides itself again the moment you leave the screen, and anyone can verify it by scanning the code.",

  "changelog.entries.push-preview-privacy.title":
    "Hide what your notifications say on a locked screen",
  "changelog.entries.push-preview-privacy.body":
    "Notification previews show the sender and the message text on your lock screen, where anyone holding your phone can read them. There is now a switch in Settings, under phone notifications, that shows only that something arrived. The app still shows everything once it is open.",

  "changelog.entries.honest-success-states.title":
    "Buttons stopped saying things worked when they had not",
  "changelog.entries.honest-success-states.body":
    "Across communities, the forum, messages, connections, settings and the moderator tools, a lot of actions confirmed success the moment you tapped, before the server had answered. If the request then failed you got a success message and an error message together, and the change you thought you had made was not there. Those now wait for the real answer, and put the content back if it fails.",

  "changelog.entries.reports-really-filed.title":
    "Reports that fail now say so",
  "changelog.entries.reports-really-filed.body":
    "Reporting a post, an event or a member could show the confirmation panel even when the report never reached us. Every report path now confirms only once it has been filed, and keeps what you wrote on screen so you can try again.",

  "changelog.entries.message-previews-and-drafts.title":
    "Messages you send before a chat exists no longer disappear",
  "changelog.entries.message-previews-and-drafts.body":
    "Starting a new conversation and typing straight away could lose that first message, and keep retrying it invisibly on every reconnect. Unsent messages are also kept per account now, so on a shared device one person's draft can no longer be sent from someone else's session. Opening a thread marks it read as new messages arrive, so the other person's seen mark keeps up.",

  "changelog.entries.moderation-holds.title":
    "Moderator decisions can no longer be undone by the author",
  "changelog.entries.moderation-holds.body":
    "A post or reply that a moderator had taken down could be restored by the person who wrote it. Deletions now record who made them, and only a moderator can undo a moderator's. Overturning an appeal also puts the content back, which it previously did not.",

  "changelog.entries.housing-listings-stay-reviewed.title":
    "Edits to a live listing go back through review",
  "changelog.entries.housing-listings-stay-reviewed.body":
    "A listing that had been approved could be edited afterwards without anyone looking again, so the text people read was not always the text that was checked. Editing the parts that moderation covers now returns the listing to review, and the form says so before you submit. Asking for a viewing also requires the affirming pledge, like every other way of making contact.",

  "changelog.entries.article-titles-render-plain.title":
    "Magazine headlines with an ampersand read properly again",
  "changelog.entries.article-titles-render-plain.body":
    "A headline containing characters like & could show its raw markup on the published article, the cards linking to it and the share preview. Headlines are stored as plain text now, and existing ones are cleaned up.",

  "changelog.entries.communities-hub-hero-restore.title":
    "Communities got its welcome back",
  "changelog.entries.communities-hub-hero-restore.body":
    "The top of Communities had drifted too far from the nav, with a big empty gap above a bare title. It's back to sitting right under the nav, with the full welcome restored: a proper title, a line about what the space is for, and the My communities/Discover switch grouped together above the actions.",

  "changelog.entries.community-tags-discovery.title":
    "Find communities through tags and connections",
  "changelog.entries.community-tags-discovery.body":
    "A community's page now shows similar communities based on shared tags, and Discover surfaces communities people you're connected to have already joined. Owners and mods can also suggest a tag that isn't on the list yet, an admin reviews it from there.",

  "changelog.entries.community-tags.title": "Communities can now add tags",
  "changelog.entries.community-tags.body":
    "Owners and mods can pick up to 8 tags for their community from a curated list, things like Trans & Nonbinary, Peer Support, Book Club, Housing & Roommates. They show as pills on every community card, and Discover now has a tags filter so you can find communities by what they're actually about.",

  "changelog.entries.account-menu-install-app.title":
    "Install the app from your account menu",
  "changelog.entries.account-menu-install-app.body":
    "On a phone, your account menu now has an \"Install the app\" row right under Getting started. It opens a quick modal with steps for your device. On Android, tap once and the browser's real install prompt shows up; on iPhone, it walks you through adding QueerPulse to your home screen from Safari. Already installed? The row just doesn't show up.",

  "changelog.entries.member-directory-filter-crossfade.title":
    "Smoother filtering in the member directory",
  "changelog.entries.member-directory-filter-crossfade.body":
    "Changing a filter in the member directory used to make the results pop in and out abruptly. Now the grid gently cross-fades: the old results fade out for a beat while the new matches settle in, then the cards ease back in together. It respects reduced-motion settings and swaps instantly for anyone who prefers less movement.",

  "changelog.entries.excerpt-line-editor-reorder.title":
    "A cleaner way to write and reorder page lines",
  "changelog.entries.excerpt-line-editor-reorder.body":
    "The list editor for things like excerpt lines on your page now matches the poem editor: each line sits on its own tidy row that fills the width, so no more cramped fields. Drag the handle to reorder, or use the up and down arrows, and remove a line with a single tap. The reorder handle works with touch, keyboard, and assistive tech.",

  "changelog.entries.collaborator-member-picker.title":
    "Credit collaborators by searching for members",
  "changelog.entries.collaborator-member-picker.body":
    "When you add collaborators to something on your persona, you no longer have to remember and type an exact handle. Just start typing a name or handle and pick the member from a searchable list, with their photo, so you credit the right person every time. Your picks show as neat tags, and you can remove any of them just as easily.",

  "changelog.entries.unified-searchable-select.title":
    "Dropdown menus you can type to search",
  "changelog.entries.unified-searchable-select.body":
    "Across the platform, the little dropdown menus for choosing things, a category, a language, a neighbourhood, a role, now share one friendlier design. When a list is long you can just start typing to filter it down, then pick with the keyboard or a tap. Menus that let you choose several options show your picks as neat little tags. It looks and behaves the same everywhere, and reads clearly for screen readers.",

  "changelog.entries.persona-date-month-picker.title":
    "Pick a month and year for your work, no more typing it out",
  "changelog.entries.persona-date-month-picker.body":
    'When you add or edit an item on a persona page, poems, exhibitions, releases and the rest, the date field is now a proper month-and-year picker instead of a free-text box. Choose the month, and it shows up neatly as "July 2025" in your language. Dates you\'d already written by hand keep showing exactly as you left them.',

  "changelog.entries.unified-date-picker.title":
    "A new date picker across the app, friendlier and fully keyboard-accessible",
  "changelog.entries.unified-date-picker.body":
    "A new date picker across the app: a friendlier, fully keyboard-accessible calendar for every date and time field. Pick a day with a click or the keyboard, type it straight in, or jump between months and years fast, and it reads clearly for screen readers.",

  "changelog.entries.protect-your-work.title": "Protect your work",
  "changelog.entries.protect-your-work.body":
    "Every published piece now shows a copyright and first-published line, you can download a dated authorship record to keep as proof, and your saved edits are kept as version history you can view and restore.",

  "changelog.entries.verification-signals-bulk-keyboard.title":
    "Reviewers can spot duplicates, act in bulk, and fly through the queue",
  "changelog.entries.verification-signals-bulk-keyboard.body":
    "Verification requests now carry real signals: how old the account is, any past rejections, and a flag when a provider reference or phone number turns up on more than one account, so a reviewer has context before deciding. Reviewers can select several requests at once to approve, reject, or mark them in review together, and move through the queue by keyboard: J and K to navigate, A to approve, R to reject, and / to search, with the next request opening on its own after a decision.",

  "changelog.entries.verification-request-review.title":
    "Request verification, and see where it stands",
  "changelog.entries.verification-request-review.body":
    "Send a request for email, phone, or ID verification whenever you need one, with a short note if it helps someone recognise you. From there you can watch it move: submitted, in review, approved, or needs another step, and appeal a decision if something doesn't feel right. On the review side, moderators work through a real queue with your note and history alongside each request, so every decision has a reason behind it.",

  "changelog.entries.verification-audit-trail.title":
    "You'll know when your verification status changes",
  "changelog.entries.verification-audit-trail.body":
    "Every time an admin updates your verification level, whether it's raised, lowered, or overridden, you now get notified with the reason why. Behind the scenes, the admin console keeps a full history of every decision: who made it, when, and why, plus whether a level was earned automatically or granted by an admin, so nothing changes without a paper trail.",

  "changelog.entries.community-safety-enforcement.title":
    "Community safety settings that actually do something",
  "changelog.entries.community-safety-enforcement.body":
    "The two community safety settings now actually take effect. When a community requires a second vouch to join, someone is only let in once a current member has vouched for them. And when auto-freeze is on, the community pauses itself the moment a serious report (like doxxing) lands or reports pile up, blocking new posts and joins and showing a clear banner, until a moderator lifts the pause once they've handled it.",

  "changelog.entries.community-settings-persist.title":
    "Community settings that actually save",
  "changelog.entries.community-settings-persist.body":
    "In the admin community view, the Settings button now opens the full settings panel where you can edit a community's name, description, membership mode and rules. And on the community's own Settings tab, the two safety toggles, requiring a second vouch to join and auto-freezing on a report, now save for real and stay put after a reload, instead of only flashing a message.",

  "changelog.entries.community-health-explainer.title":
    "See exactly how a community's health score is worked out",
  "changelog.entries.community-health-explainer.body":
    "The health-score explainer now has a \"How it's calculated\" view. It lays out the four signals and how much each one counts, walks through how that community's own numbers add up to its published score, explains why smaller communities are judged more gently, and shows the score bands so you can see where a community sits. Sentiment is shown as not counted yet, because nothing on the platform measures it so far.",

  "changelog.entries.modals-cover-full-screen.title":
    "Pop-up dialogs now dim the whole screen",
  "changelog.entries.modals-cover-full-screen.body":
    "When a dialog opens (a health-score explainer, an invite, a resource, a print order and more) its dimmed backdrop now covers the entire screen and sits centred, instead of being boxed inside part of the page on certain layouts. The dialogs always worked, they just were not always framed against the full window.",

  "changelog.entries.inbox-menu-dropdown-visibility.title":
    "The chat actions menu now shows up properly",
  "changelog.entries.inbox-menu-dropdown-visibility.body":
    "Opening the “⋯” menu on a conversation in your inbox now shows its Pin, Favourite and Delete options on top, instead of them hiding behind the chat below. The menu was always working, it just was not always visible.",

  "changelog.entries.member-directory-filters-fix.title":
    "Member directory filters now actually filter",
  "changelog.entries.member-directory-filters-fix.body":
    "Most of the filters in Find members (Open to, Where they're based, What they do, Profession, Member age, Languages) were only changing what was checked on screen, not what showed up. They now search the real directory, and you can set your own field, profession and languages in Settings so others can find you by them.",

  "changelog.entries.directory-ownership-claims.title":
    "Real ownership for the local directory",
  "changelog.entries.directory-ownership-claims.body":
    "The “verified queer-owned” badge on local directory listings now reflects a moderator's actual confirmation. If a business you run is already listed by someone else, you can request to claim it, with a moderator reviewing before anything changes.",

  "changelog.entries.session-expired-toast-fix.title":
    "Fixed a false “session expired” message",
  "changelog.entries.session-expired-toast-fix.body":
    "Some pages were telling people their session expired even when they'd never signed in. That message only appears now if you actually had a session that ran out.",

  "changelog.entries.join-request-form-fix.title":
    "Cleaned up the community join request form",
  "changelog.entries.join-request-form-fix.body":
    "Requesting to join a community used to ask for your email again, even though you're already signed in, and never actually sent it anywhere. That field is gone, and the “how involved would you like to be” question now shares a step with the note you leave for the mods, instead of asking twice.",

  "changelog.entries.community-pulse-and-insights.title":
    "Communities now show their real events, discussions, and volunteer opportunities",
  "changelog.entries.community-pulse-and-insights.body":
    "A community's Events tab now shows its real upcoming gatherings instead of always being empty, and the sidebar surfaces recent discussion threads and open volunteer opportunities filed to that community. Owners and mods also get a new insights panel on membership growth and post activity.",

  "changelog.entries.onboarding-identity-and-notifications.title":
    "Onboarding now asks for pronouns and notification preferences",
  "changelog.entries.onboarding-identity-and-notifications.body":
    "The setup wizard now has a spot for your pronouns and a short bio, and a moment to turn on notifications if you want them. Both are optional. The final step also points you to Getting Started, so the rest of your setup is easy to find.",

  "changelog.entries.getting-started-vouch-fix.title":
    "Fixed the “vouch for someone” checklist step",
  "changelog.entries.getting-started-vouch-fix.body":
    "It was marking itself done the moment you joined through a personal invite, since being vouched for and vouching for someone else were being counted as the same thing. It now only completes once you've actually vouched for someone.",

  "changelog.entries.admin-invite-quota-controls.title":
    "Admins can set invite quotas per member",
  "changelog.entries.admin-invite-quota-controls.body":
    "The invite oversight page now lets admins raise or lower how many invites a specific member can send each month, instead of that only being possible with direct database access.",

  "changelog.entries.invite-approval-email.title":
    "Invite approvals now send themselves",
  "changelog.entries.invite-approval-email.body":
    "Approving a join request emails the applicant their invite link right away. Reviewers can still copy the link by hand as a backup, but sending it is no longer something they have to remember to do.",

  "changelog.entries.join-request-mutual-member-field.title":
    "Naming a member who can vouch for you is now a real match",
  "changelog.entries.join-request-mutual-member-field.body":
    "The request-invite form's “member who can vouch for you” field used to get folded into your message as plain text. It's now sent as its own field, so a reviewer can match it directly instead of reading the whole message to find it.",

  "changelog.entries.post-opportunity-team-picker.title":
    "Posting an opportunity now fills in your own details",
  "changelog.entries.post-opportunity-team-picker.body":
    "The Team & contact step now fills in your own contact handle, and your partner slug too if you steward a community. Team members come from a picker of your connections and communities.",

  "changelog.entries.side-quests-getting-started.title":
    "Side quests once you're all set",
  "changelog.entries.side-quests-getting-started.body":
    "Finishing the getting-started checklist used to be a dead end. Now it opens onto side quests: the badges you haven't earned yet, each with a button straight to where you'd go to work on it, plus any perk you've unlocked but haven't claimed. Four new badges came with it, for exploring the Local directory, saving articles, joining a second community, and filling out your Work Profile.",

  "changelog.entries.join-request-invite-email.title":
    "Approved applicants now get an invite email",
  "changelog.entries.join-request-invite-email.body":
    "Approving a join request used to only mint an invite link inside the admin queue, so an applicant only got in if the reviewer copied that link and emailed it by hand. Approval now sends the invite link straight to the applicant automatically. Copying the link is still there as a manual backup.",
  "changelog.entries.article-editor-header-and-send-on.title":
    "Article editor header fixed, and Send on now works",
  "changelog.entries.article-editor-header-and-send-on.body":
    'The article editor\'s toolbar was sticking 76px below the top of the screen instead of right at it, so scrolled text showed through above and below it. It now sits flush against the top. "Send on" also used to just show a toast, and now actually moves the piece to its next editorial stage.',
  "changelog.entries.gathering-rsvp-fix.title":
    "RSVP buttons now confirm your spot",
  "changelog.entries.gathering-rsvp-fix.body":
    "Tapping \"I'm going\" on a gathering's page wasn't visibly doing anything. It now confirms right away, with a toast and a Cancel RSVP option in the same spot.",
  "changelog.entries.add-to-calendar-modal.title":
    "Add gatherings to your calendar",
  "changelog.entries.add-to-calendar-modal.body":
    '"Add to calendar" on a gathering you\'re going to or hosting now opens a picker for Google Calendar or a downloadable .ics file that works with Apple Calendar, Outlook, and most other calendar apps.',
  "changelog.entries.recognition-xp.title": "Earn XP, levels, and badges",
  "changelog.entries.recognition-xp.body":
    "Your activity now earns experience toward levels and badges. Finishing your getting started checklist, joining communities, attending gatherings, and connecting with members all move you up. Track your progress on the Badges page.",

  "changelog.entries.governance-editable-finances.title":
    "Editable finance figures, with a note on where each number comes from",
  "changelog.entries.governance-editable-finances.body":
    "Admins can now correct the figures on the governance Finances tab instead of them being fixed. Every number carries a small tag showing where it comes from: an unverified placeholder, a value an admin entered, or one that is calculated (like the surplus). Corrections are recorded, so it is always clear who changed what and when.",

  "changelog.entries.push-devices-list.title":
    "See and remove every device getting your push notifications",
  "changelog.entries.push-devices-list.body":
    "Settings now has a Devices list under Notifications: every device registered for QueerPulse push, when it was registered, and when it was last notified. Lost a phone, or don't recognise one? Remove it right from there.",

  "changelog.entries.admin-sitewide-announcement.title":
    "Admins can post a sitewide announcement banner",
  "changelog.entries.admin-sitewide-announcement.body":
    "The only platform-wide messaging tool was the lockdown banner, admin-facing only. Admins can now write a real announcement banner that shows to every visitor, signed in or not, with an optional auto-expiry so a scheduled-maintenance notice doesn't have to be remembered and manually turned off. Each member can dismiss it individually; editing the message brings it back for anyone who already dismissed the old one.",

  "changelog.entries.admin-reports-page.title":
    "New consolidated admin Reports page",
  "changelog.entries.admin-reports-page.body":
    "Growth, moderation-report volume, community health, and governance finance figures used to live scattered across different admin pages, with no way to adjust the time window or export the numbers. A new Reports page pulls them into one place, with a real adjustable date range (4/8/12/26 weeks) and CSV export for growth and report volume.",

  "changelog.entries.magazine-sections-browse.title":
    "Browse the magazine by section",
  "changelog.entries.magazine-sections-browse.body":
    "Every article and issue already carried a real editorial section (Features, Interview, Essays, and the rest). Now there's a Sections page that groups everything by it, instead of leaving you to stumble onto a topic through search.",

  "changelog.entries.magazine-digest-real-send.title":
    "Issue digests can send a real test and go out with the issue",
  "changelog.entries.magazine-digest-real-send.body":
    'The magazine desk\'s digest tools used to just show a confirmation toast. "Send test" now really emails the current draft to the editor who clicked it, and "Schedule with issue" now really queues the digest to go out to newsletter subscribers the moment the issue ships.',

  "changelog.entries.magazine-deck-convert-to-article.title":
    "Decks can convert into articles",
  "changelog.entries.magazine-deck-convert-to-article.body":
    "The desk's deck editor can now turn a finished deck into a real article, carrying over its text, images, and stat slides. Interactive slides have no article equivalent, so those are called out honestly rather than silently dropped.",

  "changelog.entries.magazine-writer-read-brief.title":
    "Writers can read their actual assignment brief",
  "changelog.entries.magazine-writer-read-brief.body":
    '"Read the brief" used to be a placeholder toast. It now opens the real brief for the piece, including the angle, what to include, what to avoid, the rate, and who commissioned it.',

  "changelog.entries.admin-trust-network-cite-evidence.title":
    "Admins can cite evidence from the trust network graph",
  "changelog.entries.admin-trust-network-cite-evidence.body":
    "The graph inspector's \"Cite\" button used to fire a success toast and do nothing else. It now writes a real note to the member's audit trail describing the vouch relationship being cited, visible the next time an admin reviews that member.",

  "changelog.entries.admin-trust-network-ring-detection.title":
    "Trust network ring detection is now a real graph analysis",
  "changelog.entries.admin-trust-network-ring-detection.body":
    'Flagging a "vouch ring" used to just mean an account was suspended, frozen, or carrying two or more open reports, a much broader signal than an actual closed loop. The graph now detects real clusters of new accounts vouching only for each other, with no outside vouch to back them up.',

  "changelog.entries.admin-reporter-credibility.title":
    "Moderation queue now shows reporter history alongside reported-party history",
  "changelog.entries.admin-reporter-credibility.body":
    "The report queue always showed how many prior reports the reported member has. It now shows the same signal for the reporter: how many reports they've filed and how many were dismissed, so a moderator can weigh both sides.",

  "changelog.entries.admin-housing-moderator-role.title":
    "New Housing-only moderator staff role",
  "changelog.entries.admin-housing-moderator-role.body":
    "Staff roles used to only cover the magazine desk. A member can now be granted a Housing moderator role that lets them moderate Housing listings and groups without handing them the full platform Moderator tier.",

  "changelog.entries.gatherings-manage-attendees-remove-promote.title":
    "Hosts can now remove a guest or promote from the waitlist",
  "changelog.entries.gatherings-manage-attendees-remove-promote.body":
    "The Attendees tab's Remove and Promote buttons now actually do something: removing a guest frees their spot for the waitlist, and promoting pulls a specific waitlisted guest onto the list, out of turn if you want.",

  "changelog.entries.myevents-calendar-feed-subscribe.title":
    "Subscribe to your events in Google or Apple Calendar",
  "changelog.entries.myevents-calendar-feed-subscribe.body":
    '"Subscribe to your feed" in My Events now copies a real, private feed link. Add it to Google or Apple Calendar and it keeps itself up to date with everything you\'re going to.',

  "changelog.entries.gatherings-recap-more-from-host.title":
    "Recaps now point you to more from the same host",
  "changelog.entries.gatherings-recap-more-from-host.body":
    "A gathering's recap page now shows a few other upcoming gatherings from the same host, so a good night doesn't end without a way to book the next one.",

  "changelog.entries.myevents-rsvp-actions-real.title":
    "My Events actions now actually update your RSVP",
  "changelog.entries.myevents-rsvp-actions-real.body":
    "Marking yourself maybe or going, accepting or declining an invite, saying you can't make it, and leaving a waitlist all now write to your real RSVP instead of just changing what the card shows you.",

  "changelog.entries.myevents-block-host-real.title":
    '"Block the host" from My Events now really blocks them',
  "changelog.entries.myevents-block-host-real.body":
    "The block option in an event card's overflow menu now uses the same block as everywhere else on QueerPulse, instead of just showing a confirmation toast.",

  "changelog.entries.myevents-reminder-indicator-honest.title":
    "The reminder bell on event cards is now a status, not a toggle",
  "changelog.entries.myevents-reminder-indicator-honest.body":
    "Reminders are sent to everyone going or maybe-going, based on your reminder-lead setting in Preferences, not per event. The bell on a card now shows that plainly instead of looking like a per-event switch it never was.",

  "changelog.entries.gatherings-edit-date-time-fix.title":
    "Editing a gathering's date and time now actually reschedules it",
  "changelog.entries.gatherings-edit-date-time-fix.body":
    'The manage dashboard\'s "Edit details" date field used to save a label, not a real date. It now reschedules the gathering for real, and everyone with an RSVP gets notified of the change.',

  "changelog.entries.gatherings-cancelled-page-real-content.title":
    "A cancelled gathering's page now shows the real gathering",
  "changelog.entries.gatherings-cancelled-page-real-content.body":
    "Opening a cancellation notice used to always show the same fictional example gathering. It now shows the actual gathering that was cancelled: its real title, date, host, and venue.",

  "changelog.entries.gatherings-cohost-roster-visible.title":
    "Hosts can now see who's already co-hosting",
  "changelog.entries.gatherings-cohost-roster-visible.body":
    "The manage dashboard's cohost panel used to always start empty, even for gatherings with cohosts already on board. It now shows the real roster.",

  "changelog.entries.gatherings-remove-pricing-step.title":
    "Removed the pricing step from creating a gathering",
  "changelog.entries.gatherings-remove-pricing-step.body":
    "QueerPulse doesn't handle payments, so the wizard's ticket-pricing step never did anything with what you typed into it. It's gone now rather than sitting there looking functional.",

  "changelog.entries.messages-message-requests.title":
    "Message someone new, right from your inbox",
  "changelog.entries.messages-message-requests.body":
    "Not connected with someone yet? Search for them from New Message and send a first message. It becomes a request they can accept or decline, and any requests waiting for you now show up under a new Requests tab.",

  "changelog.entries.messages-mute-conversation.title":
    "Mute a chat's notifications",
  "changelog.entries.messages-mute-conversation.body":
    "Every chat's options menu now has Mute, alongside Pin and Favorite. A muted chat stops sending you push notifications while staying exactly where it is in your inbox.",

  "changelog.entries.messages-search-in-chat.title":
    "Search inside a single conversation",
  "changelog.entries.messages-search-in-chat.body":
    "Open a chat and tap the search icon to look through just that conversation, instead of your whole inbox.",

  "changelog.entries.governance-proposals-voting.title":
    "Governance decisions now go to a real community vote",
  "changelog.entries.governance-proposals-voting.body":
    "Removing an advisory-council seat needs a two-thirds vote, and accepting funding outside our usual sources needs a majority. Open proposals show a live tally on the Governance page, and every past one stays visible with its result.",

  "changelog.entries.governance-figures-honesty.title":
    "Governance's active-member count is now live",
  "changelog.entries.governance-figures-honesty.body":
    "The active-member figure on the Governance page is now calculated straight from real accounts instead of typed in by hand. The finance figures stay reported by the team each quarter, and the page now says so plainly instead of implying they're computed automatically.",

  "changelog.entries.communities-sister-demo-only.title":
    "Sister-community suggestions stay in demo mode",
  "changelog.entries.communities-sister-demo-only.body":
    '"Sister communities" and "also in" suggestions were rendering from sample data on real community pages too. They now only show up when you\'re looking at the demo.',

  "changelog.entries.communities-category-filter.title":
    "Community category filters work past the first page",
  "changelog.entries.communities-category-filter.body":
    'Filtering communities by category now asks the server for a real match instead of only filtering whatever had already loaded, so it stops wrongly saying "no communities match" once you scroll past page one.',

  "changelog.entries.communities-archive-reversible.title":
    "Archived communities can be brought back",
  "changelog.entries.communities-archive-reversible.body":
    "Admins can now unarchive a community, the same way freezing a community already had an unfreeze. Archiving one by mistake no longer has to be permanent.",

  "changelog.entries.changemakers-nomination-reason.title":
    "Changemaker nominations now ask for the sentence they promise",
  "changelog.entries.changemakers-nomination-reason.body":
    'The nomination form always said "a name and a sentence is enough," but only asked for a name. It now has a real field for your sentence, and reviewers can read what you wrote.',

  "changelog.entries.changemakers-nomination-review.title":
    "Changemaker nominations get a real answer",
  "changelog.entries.changemakers-nomination-review.body":
    "Admins can now approve or dismiss a nomination, and you'll be notified of the decision instead of hearing nothing back after submitting one.",

  "changelog.entries.changemakers-connect-honest.title":
    'A Changemaker profile\'s "Connect" button is honest about what it does',
  "changelog.entries.changemakers-connect-honest.body":
    'Changemaker profiles are editorial features, not linked member accounts, so "Connect" could never actually message that person. It now routes you to our general contact channel and says so.',

  "changelog.entries.moderation-assign-to-me.title":
    "Moderators can claim reports in the queue",
  "changelog.entries.moderation-assign-to-me.body":
    'The "Assigned to me" filter in the moderation queue used to always come back empty. Moderators can now claim or release a report from the report drawer, and the filter reflects real claims.',

  "changelog.entries.moderation-report-history-link.title":
    "See a member's full report history from the queue",
  "changelog.entries.moderation-report-history-link.body":
    'The "prior reports" count on a report used to be just a number. It\'s now a link straight to every other report about that same person.',

  "changelog.entries.moderation-resolution-detail.title":
    "Resolved reports show what actually happened",
  "changelog.entries.moderation-resolution-detail.body":
    'Resolved reports now show who resolved them, what they decided, and when, instead of a generic placeholder. "Closed X ago" reflects the real resolution time now, not when the report was filed.',

  "changelog.entries.moderation-sla-overdue.title":
    "Overdue reports are flagged in the queue",
  "changelog.entries.moderation-sla-overdue.body":
    "Reports already had a computed response deadline behind the scenes. It's now visible, with an overdue badge once a report passes it.",

  "changelog.entries.moderation-bulk-actions-expanded.title":
    "Bulk moderation now covers warn, suspend, and ban",
  "changelog.entries.moderation-bulk-actions-expanded.body":
    "The bulk action bar used to only handle dismiss, spam, and reassign. It now also handles warn, suspend (with a duration picker), and ban, so a wave of coordinated reports doesn't have to be handled one at a time.",

  "changelog.entries.moderation-appeal-integrity.title":
    "Appeal reviews show the real evidence, and can't be self-reviewed",
  "changelog.entries.moderation-appeal-integrity.body":
    "Reviewing an appeal now shows the original reported content, not just the moderator's own summary of why they acted. A moderator can no longer review the appeal of their own original decision.",

  "changelog.entries.forum-write-rate-limit.title":
    "Forum posting gets its own rate limit",
  "changelog.entries.forum-write-rate-limit.body":
    "Creating threads, replies, and votes now has its own dedicated abuse guard, matching the protection communities already had, instead of relying on the site-wide default.",

  "changelog.entries.forum-first-post-accuracy.title":
    'The "first post" prompt checks your real history',
  "changelog.entries.forum-first-post-accuracy.body":
    "The forum's invitation to make your first post used to only track the current browsing session, so it wrongly greeted repeat posters as brand new. It now checks whether you've actually ever posted.",

  "changelog.entries.forum-lock-reason.title": "Locked threads can say why",
  "changelog.entries.forum-lock-reason.body":
    "When a moderator locks a thread, they can now add a short reason, and it shows in the locked banner instead of every locked thread reading identically.",

  "changelog.entries.forum-shareable-filters.title":
    "Forum category and sort survive a refresh",
  "changelog.entries.forum-shareable-filters.body":
    'Picking a category or sort tab on the forum now updates the page\'s link, so refreshing or sharing it keeps your view instead of silently resetting to "All."',

  "changelog.entries.forum-search-hint.title":
    "Forum search now says what it searches",
  "changelog.entries.forum-search-hint.body":
    "A small hint under the forum search box now clarifies it matches thread titles, not the text of posts and replies.",

  "changelog.entries.forum-most-helpful-real.title":
    '"Most helpful" sort reflects real votes',
  "changelog.entries.forum-most-helpful-real.body":
    'Sorting replies by "most helpful" now uses real upvotes, and the top-voted reply gets the star badge, instead of only working in the demo.',

  "changelog.entries.recognition-locked-badges-honest.title":
    "The badge case only shows badges you can actually earn",
  "changelog.entries.recognition-locked-badges-honest.body":
    "A few badges were listed as \"locked\" with earning instructions that led nowhere. They're no longer shown until there's a real way to earn them.",

  "changelog.entries.recognition-vouch-perk-copy.title":
    '"Vouch access" perk description matches reality',
  "changelog.entries.recognition-vouch-perk-copy.body":
    "The perk case said vouch access unlocked at Level 3. Vouching has never actually had a level requirement, so the description now says what's true: it's available to every active member from the start.",

  "changelog.entries.recognition-visible-on-profiles.title":
    "See other members' level and badges",
  "changelog.entries.recognition-visible-on-profiles.body":
    "Level and badges used to only ever show on your own profile. They now show on other members' profiles too, so recognition works as a visible signal between members.",

  "changelog.entries.vouch-daily-cap.title":
    "A daily cap on vouches, to keep the signal meaningful",
  "changelog.entries.vouch-daily-cap.body":
    "Vouching for people already had a short cooldown between vouches. There's now also a generous daily cap, so the signal stays meaningful even over time.",

  "changelog.entries.magazine-article-publish-schedule.title":
    "Publish and schedule articles for real",
  "changelog.entries.magazine-article-publish-schedule.body":
    "The article editor's Publish and Schedule controls used to be decorative. They now actually publish your article, right away or at a future date and time you choose, and articles that aren't tied to an issue can finally go live without waiting on issue production.",

  "changelog.entries.magazine-writer-draft-paste-fix.title":
    'Pasting a draft into "File a draft" no longer loses it',
  "changelog.entries.magazine-writer-draft-paste-fix.body":
    "Pasting your draft text when filing a piece used to vanish the moment you confirmed. It now flows straight into the article editor as real paragraphs, ready to keep shaping.",

  "changelog.entries.magazine-live-discovery.title":
    "The magazine now has somewhere to browse",
  "changelog.entries.magazine-live-discovery.body":
    "Readers could only reach an article through a direct link before. The magazine front, issue archive, and author pages are now backed by real data, and issue links open the actual issue instead of always the current one. There's also a new authors directory to browse everyone writing for the magazine.",

  "changelog.entries.culture-submissions-real.title":
    "Club, Showcase, and Radio submissions are now real",
  "changelog.entries.culture-submissions-real.body":
    "Suggesting a pick, posting a commission project, submitting showcase work, or sending in a playlist used to show a success message and go nowhere. Every one of these now saves for real.",

  "changelog.entries.culture-radio-honest.title":
    "Radio's controls tell the truth",
  "changelog.entries.culture-radio-honest.body":
    "The Radio panel's play and skip controls used to pretend to work. They're now honest about what's actually live, and \"Become a curator\" opens the real playlist-submission form.",

  "changelog.entries.newsletter-unsubscribe.title":
    "Unsubscribe from the newsletter yourself",
  "changelog.entries.newsletter-unsubscribe.body":
    "There was no way to stop newsletter emails once you'd confirmed. There's now a real unsubscribe link and page, matching the same confirmation flow you get when you sign up.",

  "changelog.entries.resources-crisis-hotline-coverage.title":
    "Crisis hotlines now show on every crisis-adjacent resource page",
  "changelog.entries.resources-crisis-hotline-coverage.body":
    "Legal, Trans Healthcare, Harm Reduction, Sexual Health, Safety and Mental Health all now surface the same crisis line strip Wellbeing already had, so help is one tap away wherever you land.",

  "changelog.entries.resources-library-consolidated.title":
    "Resources home is now backed by real guide data",
  "changelog.entries.resources-library-consolidated.body":
    "The Resources home page now shows the same backend-driven guides as the rest of the app, with freshness tracked per guide.",

  "changelog.entries.resources-guide-freshness.title":
    "Guides now show when they were last checked",
  "changelog.entries.resources-guide-freshness.body":
    'Every guide card shows the date an editor last verified it, or an honest "not yet verified" when it hasn\'t been reviewed yet.',

  "changelog.entries.resources-suggest-edit-expanded.title":
    "Suggest an edit, beyond the Glossary",
  "changelog.entries.resources-suggest-edit-expanded.body":
    'The "suggest an edit" form used to work only on the Glossary. It now opens from Legal, Trans Healthcare, Harm Reduction, Mental Health and the guide library too.',

  "changelog.entries.directory-review-reporting.title":
    "Report a single review in the local directory",
  "changelog.entries.directory-review-reporting.body":
    "Every review on a business's page now has a Report action, so you can flag an abusive or fake review on its own instead of only being able to dispute the whole listing. A moderator reviews every report the same way as elsewhere on the platform.",

  "changelog.entries.directory-search-pagination.title":
    "Faster, more complete search in the local directory",
  "changelog.entries.directory-search-pagination.body":
    "Searching the local directory now filters on our servers instead of quietly capping out after the first couple hundred places. Scroll to the end of the list and more load automatically, so a broad search or the full directory no longer stops short of the real count.",

  "changelog.entries.directory-edit-suggestions-applied.title":
    "Accepted listing corrections now actually update the listing",
  "changelog.entries.directory-edit-suggestions-applied.body":
    "When you suggest an edit to a business listing (wrong hours, address, phone, website, or description) and a moderator accepts it, the listing itself now updates and its owner is notified. Accepting used to do nothing you could see.",

  "changelog.entries.housing-my-listings.title":
    "Manage the room or place you posted, from your own My Listings page",
  "changelog.entries.housing-my-listings.body":
    "Housing listings now have a home of their own. Edit any listing you posted, mark it as filled once you've found someone, extend it before it expires, or take it down entirely. A listing also expires automatically after a couple of months if you never come back to update it, so the directory doesn't fill up with stale ones.",

  "changelog.entries.appeal-outcome-tracking.title":
    "Appeal outcomes now show your real status",
  "changelog.entries.appeal-outcome-tracking.body":
    "The appeal outcome page used to show a demo toggle regardless of what actually happened to your appeal. It now shows your real appeal: upheld, overturned, or still awaiting review, pulled straight from the moderator's decision.",

  "changelog.entries.quickexit-more-pages.title":
    "Quick exit is available on more safety pages",
  "changelog.entries.quickexit-more-pages.body":
    "The quick-exit button for leaving the page fast now also appears on Block & Mute, both appeal pages, and Safe Space listings, not just the hate-crime and reporting pages.",

  "changelog.entries.legal-links-reconciled.title":
    "Every legal document is now listed in both the footer and the menu",
  "changelog.entries.legal-links-reconciled.body":
    "Terms of Service was missing from the footer, and a few policies, including the data request page, were missing from the About menu's legal section. Both now list the same complete set: privacy, terms, cookies, imprint, guidelines, and data requests.",

  "changelog.entries.hate-crime-resources-linked.title":
    "Hate Crime Resources is now linked from the footer",
  "changelog.entries.hate-crime-resources-linked.body":
    "This page used to be reachable only through Resources or a direct link. It's now in the footer's Support column too, alongside Legal Aid and Report & Safety.",

  "changelog.entries.listing-quick-edit.title":
    "Quick edit for your directory listing",
  "changelog.entries.listing-quick-edit.body":
    "Fixing a typo in your blurb or updating your phone number used to mean re-entering the whole multi-step listing wizard. Your account's Places section now offers a Quick Edit for the basics (blurb, hours note, phone, website), with the full editor still one click away for anything bigger.",

  "changelog.entries.topics-follow-notifications-and-directory.title":
    "Following a topic now actually notifies you, plus a new Topics directory",
  "changelog.entries.topics-follow-notifications-and-directory.body":
    "Following a topic (the Follow button on any #tag page) used to have no effect. Now, when a forum thread is posted with that topic's tag, everyone following it gets notified. There's also a new Topics page listing every topic with a follow toggle, linked from the Community menu next to Forum. A topic's \"Write a post\" button now opens the forum composer with that topic's tag already attached.",

  "changelog.entries.search-topics-real-results.title":
    "Topics now show up in global search",
  "changelog.entries.search-topics-real-results.body":
    'Searching for a hashtag topic now returns real matches from global search, alongside members, communities, and everything else. Categories with more results than fit on screen now offer a "See all" link.',

  "changelog.entries.feed-connections-tab.title":
    'A new "Connections" tab in your feed',
  "changelog.entries.feed-connections-tab.body":
    "The feed's tab bar now includes Connections: posts, forum threads, and gatherings from people you're connected with, gathered in one place. Haven't connected with anyone yet? The tab points you to the members directory to get started.",

  "changelog.entries.connections-report-now-files.title":
    "Fixed: Reporting a connection now files a real report",
  "changelog.entries.connections-report-now-files.body":
    '"Report" in a connection\'s more-menu used to show a "Report sent" confirmation without actually sending anything. It now opens the same reason-and-detail form used elsewhere in the app and files a real report with the moderation team.',

  "changelog.entries.getting-started-xp-not-awarded-fix.title":
    "Fixed: Getting Started XP not showing up",
  "changelog.entries.getting-started-xp-not-awarded-fix.body":
    "Completing Getting Started steps could leave your XP total stuck at 0 for a while, and finished steps didn't show how much XP they'd earned. Both are fixed: your level now updates promptly as you complete steps, and each finished step shows its XP.",

  "changelog.entries.badges-levels-v2-redesign.title":
    "Badges & levels redesigned",
  "changelog.entries.badges-levels-v2-redesign.body":
    "The Badges & Levels page has a new look: a level dial, closest-to-earning suggestions, a filterable badge case with a detail view for each one, a seasonal badges band, and a receipts view showing where your XP came from.",

  "changelog.entries.listing-preview-matches-card.title":
    "The listing preview now matches your real directory card",
  "changelog.entries.listing-preview-matches-card.body":
    'The live preview when you add or edit a directory listing now renders the exact same card people see in the directory, cover photo included. If you haven\'t added one yet, the preview shows an "Add cover photo" button that jumps straight to the photos step.',

  "changelog.entries.profile-shapings-editor.title":
    'Edit your "What shaped me" section',
  "changelog.entries.profile-shapings-editor.body":
    "The film, book, song, and moment that shaped you can now be added and edited from your profile, alongside your other lists. It was previously view-only.",

  "changelog.entries.xp-breakdown.title": "See what earned your XP",
  "changelog.entries.xp-breakdown.body":
    "Getting Started now shows the top sources behind your current XP, and the Badges page breaks down every source (profile, communities, vouches, gatherings, and more) with how much each has earned you and what's still open.",

  "changelog.entries.profile-hero-rail-redesign.title":
    "Profile hero and rail redesigned",
  "changelog.entries.profile-hero-rail-redesign.body":
    "Your profile page has a cleaner hero and a new side rail: trust signals (verified, staff, vouch count) now come with a plain-language explainer, and a section nav lets visitors jump straight to what they're looking for, no scrolling required.",
  "changelog.entries.profile-rail-stats-redesign.title":
    "Your profile stats, at a glance",
  "changelog.entries.profile-rail-stats-redesign.body":
    "Your connections, vouches given and vouches received now show as clearly labeled numbers instead of icon-only pills, so they're readable without a hover. Your privacy controls (who sees what, hide me, your data) moved into a settings menu at the top of your profile, right next to Edit.",
  "changelog.entries.profile-who-sees-what-controls.title":
    "Choose exactly who sees what on your profile",
  "changelog.entries.profile-who-sees-what-controls.body":
    "A new \"Who sees what\" panel gathers your visibility controls in one place: quick presets, instant switches for your photo, neighbourhood, vouchers and what you're looking for, per-identity discoverability, hiding your profile from specific people, and a record of the reports you've filed.",
  "changelog.entries.profile-your-data-panel.title":
    'A "Your data" panel for your account',
  "changelog.entries.profile-your-data-panel.body":
    "Download a copy of everything QueerPulse holds on you, step away or request erasure with a 30-day grace period, or file a data request, all from one panel on your profile. Any owned community or live listing standing in the way of erasure now shows up there with its own fix.",
  "changelog.entries.profile-board-work-name-qr-updates.title":
    "Board posts can be marked found, work entries get a second link, and more",
  "changelog.entries.profile-board-work-name-qr-updates.body":
    "Your board posts can now be marked as found when you close them. Selected-work entries support a second link alongside the first. You can add how your name is pronounced and a Portuguese version of your bio, and a scannable QR code for your profile is one tap away.",

  "changelog.entries.gathering-venue-directory-link.title":
    "Link a gathering's venue to its local directory listing",
  "changelog.entries.gathering-venue-directory-link.body":
    "When you set a venue while creating a gathering, or edit one from its manage page, you can now search the local directory and pick a real business instead of only typing a name. Pick one and the venue name becomes a link straight to its listing, so guests can see photos, hours, and reviews before they show up. Typing a name freehand still works too.",
  "changelog.entries.add-to-calendar-picker-redesign.title":
    "Add to calendar now offers Google, Apple, Outlook, and Yahoo",
  "changelog.entries.add-to-calendar-picker-redesign.body":
    "The add-to-calendar modal is now a proper picker: Google, Apple, Outlook, and Yahoo each get their own row with a brand icon and a one-click add (Apple downloads a file, since it has no web link), ordered by your platform, plus a fallback download link for any other app. We also fixed a bug where an event's listed timezone wasn't actually used when building the calendar entry, which could add the wrong time to your calendar.",
  "changelog.entries.local-directory-card-redesign.title":
    "Directory and venue cards now show a photo, rating, and open status",
  "changelog.entries.local-directory-card-redesign.body":
    "Local directory and venue cards were redesigned around a photo, star rating, price and tag pills, and a save button, plus an open-till status and the host on business cards. Venues now carry demo photos and ratings to match.",

  "changelog.entries.forum-thread-pinning.title":
    "Moderators can pin forum threads to the top",
  "changelog.entries.forum-thread-pinning.body":
    "Moderators and admins can now pin a thread from its ⋯ menu, holding it above the regular list (up to 3 at a time) no matter which sort tab you're on. Unpin the same way to send it back into the normal order.",

  "changelog.entries.magazine-desk-notifications-cleanup.title":
    "Fewer duplicate desk notifications, and a working Mark all as read",
  "changelog.entries.magazine-desk-notifications-cleanup.body":
    "The magazine desk's Since Friday panel used to log a new notification for nearly every autosave, so one edit to a still-untitled draft could show up five or six times. Repeated edits to the same piece by the same person now collapse into a single line until something else happens on it. Mark all as read also used to just close the panel without changing anything, leaving the bell badge stuck. It now clears for real.",

  "changelog.entries.volunteer-opportunity-edit-parity.title":
    "Editing an opportunity now uses the same form as posting one",
  "changelog.entries.volunteer-opportunity-edit-parity.body":
    "Posters editing a volunteer opportunity get the exact same screen used to create it, including the why/tasks/commitments fields the old edit screen didn't offer at all.",

  "changelog.entries.local-directory-sort-fix.title":
    "Fixed the Local Business directory's sort menu",
  "changelog.entries.local-directory-sort-fix.body":
    "The Sort dropdown on the Local Business directory (renamed from “Local directory”) could squeeze so narrow that its options wrapped mid-word. It now always has enough room to show “Featured”, “A–Z” and “By neighbourhood” on one line.",

  "changelog.entries.governance-chart-upgrade.title":
    "A clearer income-vs-spending chart in the governance area",
  "changelog.entries.governance-chart-upgrade.body":
    "The quarter-by-quarter finance chart now sizes to its space and reads more clearly. Hover or keyboard-focus any bar to see that quarter's income, spending and the surplus saved to the reserve, and a dashed band over each spending bar marks the surplus at a glance.",

  "changelog.entries.landing-live-preview.title":
    "A live homepage preview while curating the landing page",
  "changelog.entries.landing-live-preview.body":
    "The team curating the signed-out homepage now sees a live preview of each section right beside the editor. Add, reorder, hide or reword a featured member, community or changemaker and the preview updates instantly, showing the real homepage card before anyone visits.",

  "changelog.entries.personas-in-directory.title":
    "Profile personas show up in the directory",
  "changelog.entries.personas-in-directory.body":
    "Personas linked to your member profile now appear in the persona directory alongside standalone ones, so a therapist or practitioner whose profile lives on their main page is just as discoverable. Standalone personas stay pseudonymous.",

  "changelog.entries.therapist-personas-directory.title":
    "Therapist directories, powered by real profiles",
  "changelog.entries.therapist-personas-directory.body":
    "The queer-affirming therapist directories now show real, community-verified therapist profiles, each with how they work, fees, availability, where they practise, and vouches from the community. Therapists build and manage their own profile.",

  "changelog.entries.concern-intake-live.title":
    "Raise a concern, and we'll actually see it",
  "changelog.entries.concern-intake-live.body":
    "The “Submit a concern” form on the governance page now reaches the team. Reports, appeals, and issues land in a staff dashboard where they're triaged and tracked to resolution. Signed-in members are identified by their account; if you're logged out, leave an email and we'll follow up.",

  "changelog.entries.housing-neighbourhoods-map.title":
    "Pick several neighbourhoods, and browse homes on a map",
  "changelog.entries.housing-neighbourhoods-map.body":
    "Housing search now lets you filter by more than one Lisbon neighbourhood at once, and a new map view shows homes grouped by neighbourhood. Tap a neighbourhood on the map to add it to your filters.",

  "changelog.entries.housing-outro-band.title":
    "A closing invitation on the housing board",
  "changelog.entries.housing-outro-band.body":
    "The main housing board now ends with the same warm closing band as the rest of the site, with quick ways to list your space or ask the forum. The flatmates tab already had one; now both do.",

  "changelog.entries.gathering-audience-scope.title":
    "Choose who can see your gathering",
  "changelog.entries.gathering-audience-scope.body":
    "When you host a gathering, you can now set exactly how far it reaches: open to everyone on QueerPulse, just the people your connections know, just your own connections, members of the community you're posting to, or an invite-only list. Public stays the default, and you can change it anytime from the manage page.",

  "changelog.entries.unified-pronoun-picker.title":
    "One consistent pronoun picker across your profiles",
  "changelog.entries.unified-pronoun-picker.body":
    "Your pronoun options are now the same everywhere you set them (your profile, your work profile, and housing) drawn from one shared list, so a set you can pick in one place is available in all of them. You can also select more than one set and add your own.",
  "changelog.entries.work-profile-skills-focus.title":
    "Pick your skills and focus areas on your work profile",
  "changelog.entries.work-profile-skills-focus.body":
    "The “Skills & focus” section on your work profile used to be a fixed display you couldn't change. Now the chips are yours to choose: tap the skills you can offer and the focus areas you'd want support with, and they save with the rest of your work profile. It's what we'll use to match you in the skills exchange and with mentors. Pick as many or as few as fit.",
  "changelog.entries.profile-personal-fields.title":
    "Your name, pronouns and location now sit together",
  "changelog.entries.profile-personal-fields.body":
    "We tidied the top of both your profile editors so the essentials read as one block. In your profile settings, pronouns moved up to sit right alongside your name and location instead of a separate section, and your Work profile now leads with the same three (name, pronouns, location) before anything else. Nothing was removed; it's just easier to see and fill in who you are at a glance.",
  "changelog.entries.feed-avatar-to-profile.title":
    "Tap anyone's photo in the feed to open their profile",
  "changelog.entries.feed-avatar-to-profile.body":
    "Someone catch your eye in the feed? Their photo is now a doorway. Tap or click the avatar on any post, new-member note, forum thread, or gathering card and you land straight on that person's profile, no hunting for a separate link.",
  "changelog.entries.affirming-housing-baseline.title":
    "Every home and housemate here is LGBTQ+ affirming. Now it's the standard",
  "changelog.entries.affirming-housing-baseline.body":
    'Being LGBTQ+ affirming is no longer a box a listing might tick. It\'s the baseline for every home, room, and person on the housing board. Before you post a place, publish a flatmate profile, or reach out about a home, you take a short affirming pledge once, and it applies everywhere. Every listing now carries an "LGBTQ+ affirming" badge as the standard for everyone, and if a home or person breaks that pledge you can report it. This is a community commitment. Nobody is ever sorted by identity.',
  // ── Wave B2: verified listings, viewing scheduling, two-sided blind reviews ─
  "changelog.entries.housing-listing-discovery.title":
    "Find the right home, real photos, a filter that fits, and a heads-up when one comes up",
  "changelog.entries.housing-listing-discovery.body":
    "Every listing now opens into a proper photo viewer. Swipe or arrow through the rooms full-screen, with captions and a virtual-tour walkthrough when the lister added one. The board has real filters too: price range, neighbourhood, bedrooms, bills included, step-free access, move-in date, and verified-only. Found a search you like? Save it, and we'll quietly let you know when a new home that fits goes live: no refreshing, no scrolling. Listing your own place is clearer as well, with a few gentle pointers on photos that help people picture living there.",

  "changelog.entries.housing-viewings-reviews.title":
    "See a place before you pay, and reviews that can't be gamed",
  "changelog.entries.housing-viewings-reviews.body":
    "You can now request a viewing right from a listing, over video or in person, and propose a couple of times; the person offering the home accepts one, suggests another, or declines, all tracked under Your viewings. Once a viewing is accepted, the exact address opens up to you. It's the research-backed way to avoid a housing scam: see the home live before any money is discussed. Some listings now carry a Verified listing chip, earned only when the lister is ID-verified, the listing has passed our review, and it raised no red flags. It's never something anyone can switch on themselves. And after a viewing, both sides can leave a blind review: neither of you sees the other's words until you've both written (or two weeks pass), so no review is written in fear of the reply. The rating you see on a home is worked out from those revealed reviews.",

  // ── Wave B1: housing listing integrity — risk scoring, evidence, transparency ─
  "changelog.entries.housing-listing-integrity.title":
    "Housing listings you can trust a little more",
  "changelog.entries.housing-listing-integrity.body":
    "Every new listing now carries an honest access line, step-free or two flights up, lift or none, and says plainly whether it's a member or an agent offering the place. Agents are welcome here; we just show a small badge so you know. Behind the scenes, a listing is quietly checked before it reaches the board, an implausibly low rent, contact details or pay-before-you-view language, or wording that would gate a home on who you are all raise a flag for a moderator to look at first. And if you report a listing, the report now sorts your concern into a clear reason (scam, discrimination, off-platform, and more), keeps a snapshot of what you saw, and, for discrimination, gently points out you can also raise it with an equality body.",

  // ── Wave A: housing safety, map privacy, messaging safety, flatmates, groups ─
  "changelog.entries.housing-scam-safety-tenant-rights.title":
    "Rent without getting scammed, and know your rights",
  "changelog.entries.housing-scam-safety-tenant-rights.body":
    "Looking for a home shouldn't mean second-guessing everyone. When you reach out about a place or list one, a short safety note now reminds you of the few things that keep you safe: never pay before you've signed, video-call first, keep the conversation here, never rent a place you haven't seen. There's a new Housing safety page too, with a plain-language guide to your rights as a tenant in Portugal (written and registered leases, the deposit cap, how much rent can rise, and what a landlord can never do) plus a rough sense of what Lisbon rents actually cost. It's general guidance, not legal advice, but it's the context that helps you walk away from a bad deal.",

  "changelog.entries.housing-map-area-privacy.title":
    "See the area first, the exact address once you're connected",
  "changelog.entries.housing-map-area-privacy.body":
    "Housing listings now show where a place is on a map, but only the rough neighbourhood until you and the person are actually connected. The exact address stays private until then, so posting a listing doesn't put your front door on the internet. Once you're connected, the map upgrades to the precise spot and the full address.",

  "changelog.entries.messaging-safety-block-report-pii.title":
    "Block, report, and a gentle nudge before you overshare",
  "changelog.entries.messaging-safety-block-report-pii.body":
    "You can now block or report someone straight from a conversation, and blocking takes effect right away. Blocked people drop out of your inbox and can't reach you. If a draft contains a phone number, an email, or bank details, a quiet note reminds you to keep things here and never send money before you trust someone. It never stops you sending. It's just a gentle hint.",

  "changelog.entries.flatmate-pronoun-pre-share.title":
    "Share your pronouns with a hello, only when you choose",
  "changelog.entries.flatmate-pronoun-pre-share.body":
    "When you say hello to a potential flatmate, you can now choose to share your pronouns along with your message, off by default, and only ever with that one person. It's a small thing that makes a first message land warmer, on your terms.",

  "changelog.entries.flatmate-discovery-mode.title":
    "A calmer way to browse flatmates",
  "changelog.entries.flatmate-discovery-mode.body":
    "The flatmate board now has a Discovery view alongside the list, one profile at a time, with a clear reason it matched you. Pass or like at your own pace; when you both like each other, you can say hello and start the conversation. Prefer the old grid? The List view is one tap away.",

  "changelog.entries.vetted-housing-groups.title":
    "Vetted housing groups queer renters actually trust",
  "changelog.entries.vetted-housing-groups.body":
    "Some of the safest housing happens in small, screened groups rather than open listing sites. There's now a home for them: vetted housing groups where every listing states the rent up front, describes accessibility honestly, and keeps brokers out. Ask to join and a steward reads your request, the group's house rules are right there so you know what you're agreeing to.",

  "changelog.entries.vouch-multiple-relationships.title":
    "Say all the ways you know someone",
  "changelog.entries.vouch-multiple-relationships.body":
    "When you vouch for someone, you can now pick more than one way you know them, friends and collaborators, neighbours you also met through QueerPulse. A vouch rarely comes from a single thread, so it no longer asks you to choose just one.",

  "changelog.entries.getting-started-checklist.title":
    "A gentle checklist for your first steps",
  "changelog.entries.getting-started-checklist.body":
    "A new Getting started page walks you through the first moves, fill in your profile, join a community, create a persona, vouch for and connect with someone, share a post. Each step ticks itself off as you go, so it always reflects what you've actually done. Find it under your account menu.",

  "changelog.entries.onboarding-set-up-personas-after.title":
    "A calmer welcome, set up personas once you're in",
  "changelog.entries.onboarding-set-up-personas-after.body":
    "Onboarding no longer asks you to build a persona while you're still finding your feet. Getting settled comes first; when you're ready, you can create a persona for your craft anytime from your personas page.",

  "changelog.entries.pin-favorite-chats-inbox-tabs.title":
    "Pin, favorite, and filter your inbox",
  "changelog.entries.pin-favorite-chats-inbox-tabs.body":
    "Pin the chats you keep coming back to (up to 3) and they'll stay at the top of your inbox. Favorite the ones that matter, then filter by All, Unread, Favorites, or Groups to find them fast.",

  "changelog.entries.identity-verification-honest-badges.title":
    "Real identity verification with honest badges",
  "changelog.entries.identity-verification-honest-badges.body":
    "Housing is where trust matters most, so a badge now means something real. Confirm a phone number in a quick step to post a listing or flatmate profile, or reach out about a home, and an optional external ID check earns an ID-verified badge. A badge only ever appears for a verification that actually happened, and its tooltip says exactly what it does and doesn't prove. We never see or store your ID document or biometrics. An external partner runs the check and only tells us it passed.",

  "changelog.entries.flatmate-explainable-matching.title":
    "Smarter, explainable flatmate matching",
  "changelog.entries.flatmate-explainable-matching.body":
    "Flatmate matches now show you why they matched, budget, neighbourhood, shared lifestyle, timing, safe-space values, and household basics, each a factor you can see. Add a short co-living questionnaire (noise, shared vs private space) and your household basics feed the score, so a match reads as more than a number. Safe-space specifics stay private: a reason only names what someone shares when they've let you see it. All optional, and never used to filter anyone out.",

  "changelog.entries.flatmate-safe-space-identity.title":
    "Say who you are on the flatmate board, on your terms",
  "changelog.entries.flatmate-safe-space-identity.body":
    "Your flatmate profile can now hold your pronouns, gender, and the things that make a home feel safe, trans-inclusive, no outing, affirming flatmates. It's all opt-in: nothing is stored or shown until you say yes, you choose who sees it, and you can clear it anytime. These details help you find an affirming home; they're never used to filter anyone out.",

  "changelog.entries.privacy-policy-refresh.title":
    "The Privacy Policy now matches what the platform actually does",
  "changelog.entries.privacy-policy-refresh.body":
    "We refreshed the Privacy Policy end to end. It now explains Sign in with Google, push notifications and device data, how your identity details stay under your control, the location and messaging data we hold, and the exact services we rely on, and we removed things we don't offer. The Cookie Policy and your privacy settings now match, with the unused analytics option removed. No analytics, no ads, no data sales, still true.",

  "changelog.entries.gatherings-manage-rsvp-recap-live.title":
    "Hosting a gathering now works for real",
  "changelog.entries.gatherings-manage-rsvp-recap-live.body":
    "Managing your gathering, RSVPing, and sharing the recap afterwards are now fully live. RSVP is now a button right on the gathering, say you're going, or join the waitlist when it's full, and your spot is still there when you come back. Organisers can edit details, cancel, see who's coming, and add co-hosts against the real event, and the after-photos album attaches to it too. (Inviting a co-host to accept is still on the way.)",

  "changelog.entries.coop-template-portuguese.title":
    "The co-op formation templates now speak Portuguese",
  "changelog.entries.coop-template-portuguese.body":
    "Our co-operative starter documents (the values charter, model statutes, member share agreement and the rest) now read in European Portuguese as well as English. It's a first draft meant to get you moving; have a lawyer review the specifics before you file anything.",

  "changelog.entries.members-explainer-modal.title":
    "The landing “Explore members” button now explains itself",
  "changelog.entries.members-explainer-modal.body":
    "Signed-out visitors used to hit the sign-in wall when they clicked “Explore members” on the homepage. Now they get a short, friendly explainer on how membership works, with a clear way to request an invite or sign in.",

  "changelog.entries.invite-request-mutual-email.title":
    "Asking to join now asks for a member's email",
  "changelog.entries.invite-request-mutual-email.body":
    "When you request an invite and know someone here, the form now asks for their email rather than a name. It's how we actually match them and vouch you in faster. The field stays optional, but if you fill it in we check it's a real email.",

  "changelog.entries.report-form-guide-split.title":
    "The report form and the reporting guide are now separate pages",
  "changelog.entries.report-form-guide-split.body":
    "Making a report is its own focused page, no essay to scroll past. How reporting works, the principles behind each decision, and the public moderation log now live on a dedicated “How reporting works” page, linked from both directions.",

  "changelog.entries.safety-page-report-form.title":
    "Reporting a concern goes straight to the form",
  "changelog.entries.safety-page-report-form.body":
    "The safety page now points you to the in-app report form instead of an email address, and its explanation of vouching reads truer to how joining actually works.",

  "changelog.entries.public-profile-eligibility-live.title":
    "Public profiles you can actually earn.",
  "changelog.entries.public-profile-eligibility-live.body":
    "Your progress toward a public profile now reflects your real activity, the writing you've published, events you've hosted, vouches and endorsements, and time spent showing up. Open your profile to see exactly where you are.",

  "changelog.entries.public-profile-eligibility-tracker.title":
    "A clearer path to a public profile.",
  "changelog.entries.public-profile-eligibility-tracker.body":
    "Public profiles now show exactly where you are, the essentials you need, how your contributions, community trust, and participation add up, and the next thing that moves you forward.",

  "changelog.entries.how-communities-work-page.title":
    "A clearer welcome to communities",
  "changelog.entries.how-communities-work-page.body":
    "The homepage used to offer a “Join” button before you even had an account. Now the community cards lead to a new page that explains how communities work and why they matter, so you know what you're joining before you ask for an invite.",

  "changelog.entries.guidelines-read-gate.title":
    "Read the guidelines through before you agree",
  "changelog.entries.guidelines-read-gate.body":
    "The Community Guidelines now open with the hard lines, spell out how to report harm and what happens to people who cross them, from a warning to removal, and ask you to read to the end before the agree box unlocks.",

  "changelog.entries.guidelines-in-sheet.title":
    "Read the community guidelines without losing your place",
  "changelog.entries.guidelines-in-sheet.body":
    "On the invite request and onboarding, tapping “community guidelines” used to take you off to a separate page, and back over everything you'd typed. The guidelines now slide up in a sheet you can read and close right where you are, so nothing you've written gets lost.",

  "changelog.entries.meganav-highlight-illustrations.title":
    "Illustrated menus in the top navigation",
  "changelog.entries.meganav-highlight-illustrations.body":
    "Each menu in the top navigation now opens with a hand-drawn illustration of its highlight (people gathering, the city, support, culture, work) instead of a plain placeholder.",

  "changelog.entries.coming-out-guide-public.title":
    "The coming-out guide is open to everyone again",
  "changelog.entries.coming-out-guide-public.body":
    "The coming-out guide was accidentally locked behind sign-in. It's a support page, like our resources and safety pages, it should reach anyone who's questioning, whether or not they have an account. It's public again.",

  "changelog.entries.poem-editor-v2.title":
    "Writing a poem now feels like writing a poem",
  "changelog.entries.poem-editor-v2.body":
    "The poem editor got a full pass: a live preview sits right beside what you're typing, you can drag stanzas into place or drop in a quick section break, and pasted lines stay exactly where you put them. Every poem also gets its own shareable link, and the reading view is wider and calmer now, with a one-tap copy for anyone who wants to keep your words.",

  "changelog.entries.under18-open-invite.title":
    "The under-18 message now opens a door instead of closing one",
  "changelog.entries.under18-open-invite.body":
    "If you tell us you're not 18 yet, the note used to dwell on the account you can't have. It now leads with what's open to everyone, the library, the magazine and our resources are all yours to read, no login needed.",

  "changelog.entries.communities-explained.title":
    "A clearer look at how communities work",
  "changelog.entries.communities-explained.body":
    "The page that explains communities has been redesigned around what a community is, how you join, and why it matters, with a way straight into the ones already here. You'll now find it from the Communities page and the homepage, rather than tucked away in the top menu.",

  "changelog.entries.smoother-drag-reorder.title": "Smoother drag-to-reorder",
  "changelog.entries.smoother-drag-reorder.body":
    "Reordering the pieces in a persona section now uses fluid drag-and-drop. Grab a row by its handle and the others glide out of the way as you move it. The up and down arrows are still there for keyboard and screen-reader users.",

  "changelog.entries.poem-translations.title": "Add translations of a poem",
  "changelog.entries.poem-translations.body":
    "A poem can now hold more than one version, the original alongside its translations. Add each one, give it a name like Português or English, and readers can switch between them with a tap. The first version is the default everyone sees first.",

  "changelog.entries.reframe-your-photos.title": "Reframe your photos",
  "changelog.entries.reframe-your-photos.body":
    "When you upload a photo, you can now pan and zoom it to choose exactly how it's framed before you save it, so profile photos, personas, and other images look just right.",

  "changelog.entries.guidelines-agree-self-tick.title":
    "The guidelines box now ticks itself once you've read to the end",
  "changelog.entries.guidelines-agree-self-tick.body":
    "On the join and onboarding forms, the “I've read the community guidelines” box can no longer be ticked with a stray click. The guidelines open in a sheet, the confirm button unlocks only when you've scrolled to the end, and finishing there is what ticks the box for you. The button also sits at the bottom of the sheet now instead of floating over the text.",

  "changelog.entries.adults-only-explainer-modal.title":
    "“Here's why we're 18+” opens right where you are",
  "changelog.entries.adults-only-explainer-modal.body":
    "The “here's why” link on the age check used to navigate away to the Terms, so you lost your place in the form. It now opens the explainer in a quiet sheet over the page. Read why QueerPulse is adults-only, close it, and keep going without losing a word you'd typed.",

  "changelog.entries.adults-only-explainer.title":
    "“Here's why we're 18+” now actually says why",
  "changelog.entries.adults-only-explainer.body":
    "The “here's why” link on the age check used to land on the Terms without explaining anything. The Eligibility section now says plainly why QueerPulse is adults-only, and why under-18s still belong in queer community.",

  "changelog.entries.persona-excerpt-crash-fix.title":
    "Adding a page excerpt no longer breaks the profile",
  "changelog.entries.persona-excerpt-crash-fix.body":
    "Starting an excerpt or menu detail on a persona page, filling in one field before the rest, no longer causes the page to go blank. It now shows what you've added and fills in the rest as you go.",

  "changelog.entries.poem-line-break-fix.title": "Poem line breaks now stick",
  "changelog.entries.poem-line-break-fix.body":
    "Pasting a poem into the editor no longer runs its lines together when you read it back. Each verse line keeps its own line, just as you typed or pasted it.",

  "changelog.entries.poet-rich-poems.title": "Write and read poems in full",
  "changelog.entries.poet-rich-poems.body":
    "Poet profiles now have a proper poem editor (stanzas, section breaks, and notes, with italics and bold) and readers can tap any poem to open it in a spacious reading view.",

  "changelog.entries.persona-editor-drag-reorder.title":
    "Drag to reorder items on a persona",
  "changelog.entries.persona-editor-drag-reorder.body":
    "The grip handle on each item in a persona section (projects, roles, links…) now actually drags. Grab it and drop the item where you want it (on a phone with your finger, or with a mouse) and the list reshuffles live. The up and down arrows are still there for keyboard use, so nothing changed for that.",

  "changelog.entries.persona-item-link-picker-size.title":
    "Fixed oversized inline fields in a few editors",
  "changelog.entries.persona-item-link-picker-size.body":
    "A handful of compact side-by-side fields had quietly ballooned to full size, the link-type picker when adding a link to a persona project (which was crowding out the address field next to it), the content-note rows in the film submission form, and the photo-link boxes when listing a business. They now sit at their intended size, so each row lines up the way it was designed.",

  "changelog.entries.persona-editor-wide-sheet.title":
    "Editing a persona section now opens a roomy sheet from the bottom",
  "changelog.entries.persona-editor-wide-sheet.body":
    "When you edit an item in one of your persona's sections (a project, a role, a photo) the editor now rises from the bottom of the screen as a wide sheet instead of a narrow panel pinned to the side. The fields sit two side by side, so titles, descriptions and links have room to breathe instead of feeling crammed. On phones it stays the familiar full-width sheet.",

  "changelog.entries.community-featured-cards.title":
    "Featured communities get the full spotlight card, plus cover photos",
  "changelog.entries.community-featured-cards.body":
    "Communities featured on the homepage now show the same rich card the showcase uses (a cover image, category, who keeps the space, how you join, the year it started, what you get inside, and real member faces) instead of a bare name and headcount. Community owners can now add a cover photo when starting a community or from its edit panel, and it greets people on the card.",

  "changelog.entries.media-in-use-references.title":
    "See where each uploaded image is used, and what's safe to delete",
  "changelog.entries.media-in-use-references.body":
    "Your uploads, and the admin images console, now show every place a picture is still in use, with a link straight to each one. Anything with no references left is flagged as safe to remove, so you can clear out old duplicates without worrying you'll break a live page.",

  "changelog.entries.homepage-featured-photo-fix.title":
    "Featured members' photos show on the homepage again",
  "changelog.entries.homepage-featured-photo-fix.body":
    "The curated “Real people, not a directory” spotlight was serving each featured member's uploaded portrait as an unresolved link, so it rendered as a broken image. The homepage now resolves those photos the same way every other avatar is, and the portraits load correctly.",

  "changelog.entries.admin-media-filter-by-uploader.title":
    "Admins can filter uploaded images by who sent them",
  "changelog.entries.admin-media-filter-by-uploader.body":
    "The uploaded-images console now lets an admin narrow the whole grid to a single member (search by name or handle, or tap an uploader's name on any file) to review everything one person has put into storage in one place.",

  "changelog.entries.persona-preview-banner-bleed.title":
    "Persona banners now run edge-to-edge on your profile",
  "changelog.entries.persona-preview-banner-bleed.body":
    "The cover on the “Also working as” card now fills the card edge-to-edge, the same full-bleed look your personas already have on their own pages, so your profile and each persona page feel like one piece.",

  "changelog.entries.magazine-archive-truthful-hero.title":
    "The magazine archive shows only real editions now",
  "changelog.entries.magazine-archive-truthful-hero.body":
    "The all-editions page opened with a fixed headline and tally (“nine issues since 2024” and counts of articles, contributors and languages) that were placeholder figures standing in for your real archive. Those now stay in the preview only; the live page leads straight into the real back issues.",

  "changelog.entries.persona-families-expansion.title":
    "Personas now fit many more crafts",
  "changelog.entries.persona-families-expansion.body":
    "Personas reach well beyond the stage now. There are six new page styles (a salon chair, a runway, a gallery, an oral-history record, a movement poster, and a classroom) plus dozens of new professions, each with a look built for the work you actually do.",

  "changelog.entries.pole-dancer-persona.title": "Pole dancer personas",
  "changelog.entries.pole-dancer-persona.body":
    "Pole dancers can now build a persona that shows both sides of the craft, the shows they perform and the classes they teach.",

  "changelog.entries.astrologer-persona.title":
    "New astrologer personas, with their own celestial page",
  "changelog.entries.astrologer-persona.body":
    "You can now make an astrologer persona. It gets its own “chart” page, an indigo, star-flecked ephemeris with your readings numbered like houses, the sky today, what you need from a querent before a reading, and a plain statement of what a reading is not.",

  "changelog.entries.crisp-profile-photos.title":
    "Profile photos are sharper on member pages",
  "changelog.entries.crisp-profile-photos.body":
    "Some member portraits looked soft on the profile page while others were crisp. The large photo now requests a resolution that matches the space it fills, so every profile shows a clear, sharp portrait.",

  "changelog.entries.developer-persona-banner.title":
    "Developer personas can show a banner again",
  "changelog.entries.developer-persona-banner.body":
    "Developer, maker and other builder personas quietly hid the banner image you uploaded. If you've added a cover, it now shows across the top of the persona, and if you haven't, the page stays clean with no empty band.",

  "changelog.entries.persona-preview-edit-hidden.title":
    "Previewing your profile as a visitor now hides your Edit controls",
  "changelog.entries.persona-preview-edit-hidden.body":
    "When you previewed your own profile as a visitor, the Edit button still showed on your personas, so the preview didn't quite match what others see. It's now hidden, and the preview reflects the real visitor experience.",

  "changelog.entries.persona-solo-card-wide.title":
    "A single persona with a cover now fills the space",
  "changelog.entries.persona-solo-card-wide.body":
    "If your profile has just one persona and it has a cover photo, its card now lays out wide, cover beside the details, instead of sitting in a narrow column with an empty gap next to it. Sparser personas keep the compact card.",

  "changelog.entries.persona-performance-row-mobile.title":
    "Persona performance lists now read cleanly on phones",
  "changelog.entries.persona-performance-row-mobile.body":
    "On a narrow screen the year, title and venue of a performance used to fight for one line, squeezing the title until it broke one letter per line. Each part now takes its own line, so a dancer's, or any persona's, performances stay legible on mobile.",

  "changelog.entries.endorse-persona-by-owner-name.title":
    "Endorsing an unnamed persona now uses your name",
  "changelog.entries.endorse-persona-by-owner-name.body":
    "When someone leaves a persona named only after its craft (“Dancer”, “Developer”) the endorse dialog now addresses the person by their first name (“Endorse Philippine”) instead of the bare profession, so the words read like they're about a human.",

  "changelog.entries.landing-featured-member-card.title":
    "A richer featured-member card on the homepage",
  "changelog.entries.landing-featured-member-card.body":
    "The members our team features on the homepage now appear in the same full spotlight card as our demo (a large portrait, their own words, and a link straight to their profile) rotating through everyone we've highlighted. It replaces the plainer little card that showed just a name and a line.",

  "changelog.entries.session-expiry-csrf-fix.title":
    "Fewer surprise “session expired” sign-outs",
  "changelog.entries.session-expiry-csrf-fix.body":
    "We fixed a bug that could log you out with a “session expired” message even though your session was still fine, the giveaway was that reloading the page signed you straight back in. It happened most often with the app open in more than one tab. Your session now quietly recovers on its own instead of dropping you to the sign-in screen.",

  "changelog.entries.persona-image-remove-confirm.title":
    "A quick check before you remove a persona photo",
  "changelog.entries.persona-image-remove-confirm.body":
    "Tapping the trash icon on an avatar, cover or item image no longer clears it instantly. You'll get a short confirmation first, so an accidental tap won't wipe a photo you meant to keep.",

  "changelog.entries.persona-craft-pass.title":
    "Personas look and feel better everywhere",
  "changelog.entries.persona-craft-pass.body":
    "A craft pass across the whole feature. Dark mode is fixed throughout, skin details, menus and state icons that used to wash out now stay crisp. The persona directory no longer stops at 40 people, loads with a proper skeleton instead of a spinner, and reads faster because persona styles no longer weigh down every other page. On a phone, the endorsers, report and delete dialogs are now bottom sheets you can swipe away, tap targets are bigger, address and link fields bring up the right keyboard, and you can preview your persona while editing. Sharing is tidier too: link previews no longer crop your photo, and the editor shows real art when something goes wrong.",

  "changelog.entries.persona-audit-hardening.title":
    "Personas: a polish and safety pass",
  "changelog.entries.persona-audit-hardening.body":
    "A broad sweep across personas. The editor now protects your work. It warns before the back button loses unsaved edits, keeps typing safe while a save is in flight, and asks you to save before publishing so what you see is what goes live. Public persona pages load their banner faster, read cleanly for screen readers, and never flash a stray placeholder. Followers stay private, links are scheme-checked for safety, and the persona directory loads quicker. Co-owners can edit freely, but only the creator can rename, unpublish, delete, or remove a co-owner, and everyone's notified if a shared persona is deleted.",

  "changelog.entries.persona-followers-owner-view.title":
    "See who follows your persona",
  "changelog.entries.persona-followers-owner-view.body":
    "The owner of a persona can now open its followers and see exactly who's there, the people quietly keeping up with your work. For everyone else, following stays private: no one else can see who follows a persona, and your own following never shows up to anyone.",

  "changelog.entries.persona-image-reuse-uploads.title":
    "Reuse a photo you've already uploaded",
  "changelog.entries.persona-image-reuse-uploads.body":
    "Every image slot in your persona editor (the avatar or logo, the cover banner, and each item's picture) can now pull from photos you've uploaded before, alongside a fresh file from your device. Choosing an image opens a picker with your past uploads, so you can reuse the same shot across personas in a couple of taps, or delete ones you no longer need.",

  "changelog.entries.persona-banner-quality.title": "Crisper persona banners",
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
    "Photos in a persona's gallery now open full-screen when you tap them, the whole shot, uncropped, with arrow keys and on-screen arrows to move between them.",

  "changelog.entries.persona-gig-images.title": "Add a photo to your gigs",
  "changelog.entries.persona-gig-images.body":
    "Gig and show items in your persona editor now take an image, so your featured set list shines with a real photo instead of an empty slot.",

  "changelog.entries.persona-save-all-changes.title":
    "Save your persona in one go",
  "changelog.entries.persona-save-all-changes.body":
    "Your persona editor now saves everything at once, with a running list that shows exactly what you changed before you hit Save.",

  "changelog.entries.persona-page-motion.title":
    "Persona pages that move with you",
  "changelog.entries.persona-page-motion.body":
    "Persona pages now come alive as you arrive and scroll, the header settles in, and each section eases into view as you reach it. Every persona look keeps its own rhythm: some snap, some drift, and the quiet ones stay calm. It all respects your device's reduced-motion setting, so if you prefer things still, they stay still.",

  "changelog.entries.endorse-with-note.title": "Endorse a persona with a note",
  "changelog.entries.endorse-with-note.body":
    'Endorsing someone\'s persona now opens a proper window where you can add a short note about what makes their work worth backing. Already endorsed? Tap "Endorsed" to edit your note or withdraw your endorsement anytime.',

  "changelog.entries.persona-banner-bleed.title":
    "Let your persona banner bleed into the page",
  "changelog.entries.persona-banner-bleed.body":
    "Personas can now soften the seam where the cover photo meets the page. In your persona settings, under Presence, the new “Banner edge” option lets you keep the banner contained (as before) or have it bleed, the cover image fades gently into the page below it. It works on every persona look, dissolving into whatever colour sits beneath the banner.",

  "changelog.entries.persona-hero-actions-tidy.title":
    "A tidier action row on persona pages",
  "changelog.entries.persona-hero-actions-tidy.body":
    "The buttons at the top of a persona now read as a clear menu. Message and Follow lead, and the less-used actions, Share and Report, tuck into a “⋯” menu so the row isn't crowded. Your follower and endorsement counts moved into a single quiet line beneath, instead of being repeated on the buttons themselves.",

  "changelog.entries.fix-member-filter-collapse.title":
    "Tidier filters on the member directory",
  "changelog.entries.fix-member-filter-collapse.body":
    "When a filter group in the member directory was collapsed, a sliver of its contents (a checkbox or a chip) could still peek out beneath the heading. Collapsed groups now show only their heading, so the filter panel reads as a clean menu, and everything slides in as before when you open a group.",

  "changelog.entries.fix-persona-hero-theme-colors.title":
    "Persona status and social links now match your theme",
  "changelog.entries.fix-persona-hero-theme-colors.body":
    "On personas with a dark theme (like the stage look), the availability status and the social-link icons were washed out, dim text and a stark white icon chip. They now follow your persona's colours, so the status label stays readable and each social icon becomes a subtle, accent-tinted button that fits the theme.",

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

  "changelog.entries.network-modal-search.title": "Search your network lists",
  "changelog.entries.network-modal-search.body":
    'The "Connected" and "Vouched for" lists on your profile now have a search box, so you can filter a long list down to a name instantly.',

  "changelog.entries.profile-your-network.title":
    "See your network on your own profile",
  "changelog.entries.profile-your-network.body":
    "Your profile hero now shows a private row of \"Your network\" chips, just for you: how many people you're connected with, who you've vouched for, and who's vouched for you. Tap a chip to see the full list, newest first, with when each happened. Only you can see it, and it stays hidden when you preview your profile as a visitor.",

  "changelog.entries.fix-page-top-nav-overlap.title":
    "Page content no longer hides under the top menu",
  "changelog.entries.fix-page-top-nav-overlap.body":
    "The floating top menu used to overlap the very top of some pages, clipping a heading or button beneath it. Every page now reserves that space in one shared place, so nothing sits under the menu, and each page keeps its own breathing room.",

  "changelog.entries.nav-rail-redesign.title": "A clearer main menu",
  "changelog.entries.nav-rail-redesign.body":
    "The desktop menu now keeps every section in view. Pick one from the rail and its links, plus a little preview, appear beside it. Same destinations, less hunting.",

  "changelog.entries.persona-photo-enlarge.title":
    "Tap a persona's photo to see it full-size",
  "changelog.entries.persona-photo-enlarge.body":
    "Just like on a regular profile, you can now tap a persona's avatar to open the photo full-screen, a proper look at who's behind the persona. Tap outside, hit the close button, or press Esc to dismiss it.",

  "changelog.entries.persona-mobile-hero.title":
    "Personas look at home on your phone",
  "changelog.entries.persona-mobile-hero.body":
    "A persona's header now settles into the same clean, centred column your own profile uses on a phone, the avatar, name, tagline and links stacked in the middle, with the action buttons stretched full-width and easy to reach with one thumb. No more cramped top-left pile on a narrow screen.",

  "changelog.entries.fix-persona-save-conflict.title":
    "Saving a second persona no longer throws an error",
  "changelog.entries.fix-persona-save-conflict.body":
    "Editing and saving a persona could fail with an “address already in use” error once you had more than one, even when you'd never set a public handle on either. A blank handle is now treated as “none” rather than an empty value that quietly collided with your other personas, so your changes save cleanly. If two personas ever do share the same address, we now tell you exactly which field to change.",

  "changelog.entries.magazine-desk-two-tracks.title":
    "Two tracks on the magazine desk: Highlights and Issue",
  "changelog.entries.magazine-desk-two-tracks.body":
    "Editors can now keep standalone platform highlights separate from the pieces being assembled into a full issue. Switch between the two tracks with a tap, and move any piece from one to the other, send a highlight into the current issue, or lift an issue piece back out to stand on its own. Search, filters and saved views all work within whichever track you're in, and new commissions land in the track you choose.",

  "changelog.entries.photo-metadata-strip-hardening.title":
    "Stronger removal of hidden location data from your photos",
  "changelog.entries.photo-metadata-strip-hardening.body":
    "Every photo you upload has its hidden metadata, including the GPS location many phones bake into a picture, removed in your browser before it ever leaves your device. We closed the gaps: if that removal can't complete for any reason, the upload is now blocked rather than sent as-is, and animated GIFs are cleaned in place without losing their animation. Your location stays yours.",

  "changelog.entries.fix-persona-cover-overlay-leak.title":
    "Persona banners show cleanly once you upload one",
  "changelog.entries.fix-persona-cover-overlay-leak.body":
    "On musician & DJ personas, the textured overlay meant for the empty, no-banner state was still painting over your banner after you'd uploaded one, dimming and speckling the photo. It now clears the moment a banner image is set, so your cover shows exactly as chosen.",

  "changelog.entries.members-filter-panel-polish.title":
    "A calmer member-directory filter panel",
  "changelog.entries.members-filter-panel-polish.body":
    "The filters on the member directory used to sit as seven near-identical floating boxes that read as visual clutter when collapsed. They're now one tidy panel with clean dividers between each group, and every filter header responds to hover and keyboard focus so it's clear you can open it.",

  "changelog.entries.fix-persona-stage-dark-legibility.title":
    "Persona pages stay readable in dark mode",
  "changelog.entries.fix-persona-stage-dark-legibility.body":
    "Two persona styles broke in dark mode, most visible in the editor's live preview. On the stage layout (musicians and DJs) the name, section headings and type pill turned dark-on-dark and all but vanished; the writer layout went almost entirely unreadable, its warm-ink text stranded on a near-black page. Both now stay light and legible in either theme, and the small ⓘ help icon beside a persona's name no longer reads as an empty ring on dark surfaces.",

  "changelog.entries.fix-persona-preview-avatar.title":
    "Persona photos now appear in the live preview, and the avatar is round again",
  "changelog.entries.fix-persona-preview-avatar.body":
    "In the persona editor, a freshly picked avatar or cover showed only a placeholder in the live preview until you saved. It now renders the moment you choose it. We also fixed a stray square that framed the circular avatar on the preview and the public persona page.",

  "changelog.entries.fix-vouch-success-self-face.title":
    "Your vouch confirmation now shows your real face",
  "changelog.entries.fix-vouch-success-self-face.body":
    'When you vouched for someone, the confirmation panel could pair the member\'s photo with a demo profile instead of yours. It now always shows your real avatar and initials beside theirs, so the "backed" moment reflects the actual person doing the vouching.',

  "changelog.entries.persona-readiness-estimate.title":
    "The persona readiness estimate now reflects what's really left",
  "changelog.entries.persona-readiness-estimate.body":
    "The \"Quick estimate\" on a persona's Get it live page now counts everything that's still worth adding (a cover image, your availability, a social link and enough content) instead of jumping to 100 the moment you could technically publish. The number only fills up once there's genuinely nothing left to polish.",

  "changelog.entries.fix-persona-item-drawer-scroll.title":
    "Scroll to every field when editing a showcase item",
  "changelog.entries.fix-persona-item-drawer-scroll.body":
    "The edit panel for a showcase item (like a gig or a project) no longer ran off the bottom of the screen on phones. You can now scroll through every field and reach Save.",

  "changelog.entries.my-uploads.title":
    "See and manage everything you've uploaded",
  "changelog.entries.my-uploads.body":
    "A new My uploads screen in Settings shows every picture you've uploaded, so you can spot and delete accidental double-uploads. It flags any picture that's still in use before you remove it.",

  "changelog.entries.profile-photo-picker.title":
    "Reuse a photo you've already uploaded",
  "changelog.entries.profile-photo-picker.body":
    "The new photo picker lets you set your profile photo from your past uploads, your device, or your Google photo, and tidy up old uploads you no longer need.",

  "changelog.entries.fix-persona-image-persistence.title":
    "Uploaded photos stay put after editing",
  "changelog.entries.fix-persona-image-persistence.body":
    "Fixed a bug where an uploaded photo could vanish after you edited something and reloaded. It showed at first, then reverted to the placeholder. This affected persona covers and avatars, your profile photo and work images, and business-listing photos. Saving no longer overwrites an untouched image, so your photos stick.",

  "changelog.entries.dark-ghost-button-contrast.title":
    "Outlined buttons are legible in dark mode",
  "changelog.entries.dark-ghost-button-contrast.body":
    "Secondary outlined buttons, like Share on a persona, were nearly invisible against dark backgrounds. Their outline and label now meet contrast guidelines, so they're clearly readable while staying subordinate to the primary action.",

  "changelog.entries.admin-media-delete-and-preview-fix.title":
    "Admins can delete stored files, and large previews no longer hide the controls",
  "changelog.entries.admin-media-delete-and-preview-fix.body":
    "In the admin media console, tall image previews used to push the file actions off the bottom of the screen, previews are now capped so every control stays reachable. Admins can also permanently delete a stored file straight from its details panel, with a confirmation step that warns when something still references it.",

  "changelog.entries.persona-editor-live-preview.title":
    "The persona editor preview updates as you type",
  "changelog.entries.persona-editor-live-preview.body":
    "The live preview beside the persona editor now reflects your changes to name, tagline, bio, avatar, cover, accent and call-to-action instantly, before you save, so you can see exactly how your persona will look while you edit.",

  "changelog.entries.fix-uploaded-avatar-not-showing.title":
    "Uploaded profile photos now show after saving",
  "changelog.entries.fix-uploaded-avatar-not-showing.body":
    "Fixed a bug where a profile photo you'd uploaded and saved appeared as a broken image once the page reloaded. Your saved portrait now displays reliably everywhere.",

  "changelog.entries.fix-image-preview-csp.title":
    "Image previews show again when uploading",
  "changelog.entries.fix-image-preview-csp.body":
    "Fixed a bug where the preview of a photo you'd just picked wouldn't appear while uploading, a security policy was blocking the local preview image. Your selected photo now shows immediately as it uploads.",

  "changelog.entries.use-google-profile-photo.title":
    "Use your Google photo on your profile",
  "changelog.entries.use-google-profile-photo.body":
    "If you signed in with Google and haven't set a profile photo yet, the profile editor now offers a one-tap “Use Google photo” button, so you can fill in your portrait from your Google account without hunting for a file to upload.",

  "changelog.entries.skip-link-keyboard-only.title":
    "“Skip to main content” now stays out of the way",
  "changelog.entries.skip-link-keyboard-only.body":
    "The “Skip to main content” shortcut, there to help keyboard users jump past the navigation, was occasionally flashing into view during ordinary browsing. It now appears only when you actually tab to it with the keyboard, and stays hidden the rest of the time.",

  "changelog.entries.enlarge-profile-photo.title":
    "Tap a profile photo to see it up close",
  "changelog.entries.enlarge-profile-photo.body":
    "On any member's profile, tap their photo to open a large, full version, so you can see exactly who they are before you reach out. Tap anywhere or press Escape to close.",

  "changelog.entries.tap-notification-to-profile.title":
    "Tap a notification to open the profile",
  "changelog.entries.tap-notification-to-profile.body":
    "When someone accepts your invite or your connection, the whole notification is now tappable and takes you straight to their profile. Notifications that point somewhere more specific, like a thread or an event, still open that instead.",

  "changelog.entries.more-push-notifications.title":
    "More of what matters now reaches you as a push",
  "changelog.entries.more-push-notifications.body":
    "Push used to be just direct messages and event reminders. Now more of the moments that count can reach your lock screen, connection requests and accepts, mentions, replies on threads you're in, and vouches you receive, plus a heads-up whenever an event you're going to changes or is called off. There's a brand-new one for hosts too: a nudge when someone vouches for a safe space you look after. New on/off switches in settings let you keep Mentions and Vouches as loud or as quiet as you like, and a “Send yourself a test” button confirms it all lands on your device.",

  "changelog.entries.localized-push-notifications.title":
    "Push notifications in your language",
  "changelog.entries.localized-push-notifications.body":
    "System push notifications, like an event reminder, now render in Portuguese for members who've set the app to Portuguese, instead of always showing up in English. Direct-message previews were already in your own words; this brings the app's own copy in line with them.",

  "changelog.entries.magazine-desk-workspace-nav.title":
    "A dedicated workspace for the magazine desk",
  "changelog.entries.magazine-desk-workspace-nav.body":
    "The magazine editor now has its own left-hand navigation, Desk, Pitches and Issue, with jump-to (⌘K) and the “Since Friday” activity panel, in place of the general site menu, on every editor screen.",
  "changelog.entries.richer-push-notifications.title":
    "Push notifications that show who and what",
  "changelog.entries.richer-push-notifications.body":
    "Push notifications got richer, a direct message now shows who it's from, with their photo, and an event reminder shows the event's cover. Both come with a quick tap to jump straight in, and messages group neatly by conversation so your lock screen stays calm.",

  "changelog.entries.admin-uploaded-images.tag": "Open admin",
  "changelog.entries.admin-uploaded-images.title":
    "Admins can browse every uploaded image",
  "changelog.entries.admin-uploaded-images.body":
    "Admins can now browse every uploaded image stored on the platform, with per-file details (owner, storage metadata, and an on-demand real content-type check) for security review.",

  "changelog.entries.events-and-my-events-merged.title":
    "Events and Your events are now one page",
  "changelog.entries.events-and-my-events-merged.body":
    "Your events dashboard and finding new events now live together at /events, with a My events / Discover switch up top. It opens on your dashboard when you have events on, and on Discover when you don't.",

  "changelog.entries.trust-network-legend-withdrawn.title":
    "The trust-network legend now explains dashed lines",
  "changelog.entries.trust-network-legend-withdrawn.body":
    "On the Trust Network map, a vouch that was later retracted is drawn as a dashed red line. The legend now names it, “Withdrawn vouch”, so the dashed lines are no longer a mystery.",

  "changelog.entries.trust-network-replay-timeline.title":
    "Trust Network replay now tells the story person by person",
  "changelog.entries.trust-network-replay-timeline.body":
    "The Trust Network replay used to scrub month by month, lumping everyone who joined in the same month into one blur. Now it walks the network one connection at a time, in the real order people joined. Each step names who connected and when, and the matching row in the side list lights up as it plays.",

  "changelog.entries.pronouns-on-member-cards.title":
    "Richer new-member cards in the feed",
  "changelog.entries.pronouns-on-member-cards.body":
    "New-member cards in your feed now show a member's pronouns right next to their name, plus where they're based and what they're into, so you get a sense of someone before you even open their profile. Location stays hidden for members whose profile isn't public.",

  "changelog.entries.onboarding-join-and-leave.title":
    "Join (and leave) communities during sign-up",
  "changelog.entries.onboarding-join-and-leave.body":
    "In the onboarding step that suggests communities, you can now tap a joined community again to leave it if you change your mind. The suggestions are also limited to fully open communities you can join in one tap, private and invite-only ones no longer appear here, since they can't be joined on the spot.",

  "changelog.entries.saved-and-searched-lists-load.title":
    "Saved events and searched lists load again instead of erroring",
  "changelog.entries.saved-and-searched-lists-load.body":
    "A handful of lists could fail to load and show an error instead of results: your Saved events tab (and the Going, Waitlisted and Past tabs), searching your messages, filtering the magazine by a single author, and searching the moderation queue. Each of these combined a lookup with paging in a way that tripped up the database query and returned nothing. They now load their results reliably.",

  "changelog.entries.admin-overview-stat-grid-responsive.title":
    "The admin dashboard stat cards fit the screen on mobile",
  "changelog.entries.admin-overview-stat-grid-responsive.body":
    "The four headline stat cards at the top of the admin dashboard used to stay in a fixed four-across row on narrow screens, squeezing each card until its label broke apart and the row ran off the side. They now cap at four across on wide screens and gracefully wrap down to two, then one, as the screen narrows, so every card stays readable on a phone.",

  "changelog.entries.trust-network-mobile-graph-first.title":
    "The Trust Network opens on the graph on mobile",
  "changelog.entries.trust-network-mobile-graph-first.body":
    "Opening a member's Trust Network on a phone now shows the connection graph straight away, instead of springing open a details sheet over it. Tap any person in the graph to slide up their vouch details and actions, and swipe or tap away to get back to the full picture.",

  "changelog.entries.magazine-article-versions.title":
    "Article drafts now keep a full version history",
  "changelog.entries.magazine-article-versions.body":
    "Every filed draft and manual save now keeps a version, editors can compare against the current draft and restore any earlier one without losing work.",

  "changelog.entries.magazine-article-comments.title":
    "Threaded notes on article drafts",
  "changelog.entries.magazine-article-comments.body":
    "Editors can leave threaded notes on an article, reply to each other, and resolve a note once it's handled.",

  "changelog.entries.magazine-desk-live-notifications.title":
    "The magazine desk's activity panel now shows real editorial events",
  "changelog.entries.magazine-desk-live-notifications.body":
    "The magazine desk's activity panel now shows real editorial events (who did what, when) linking straight to the piece, instead of the same fixed demo list every time.",

  "changelog.entries.magazine-desk-wave-b-fixes.title":
    "Archive search, contents blurbs, and kill-fee terms, now real",
  "changelog.entries.magazine-desk-wave-b-fixes.body":
    "Archive search now finds published pieces live, instead of a static demo list. Issue contents blurbs and reader-letter “run in letters” selections now actually save, the letters toggle used to accidentally create a duplicate letter instead of updating the one you clicked. Contributors also see the real kill-fee terms on each commission.",

  "changelog.entries.magazine-commission-editor-fix.title":
    "Commissioning a piece works on a brand-new magazine",
  "changelog.entries.magazine-commission-editor-fix.body":
    "Commissioning a piece from the editor desk could fail with an “editorId must be a UUID” error. It happened on a fresh magazine that had no pieces assigned to anyone yet. Commissions are now stamped with your own signed-in editor identity, so they go through straight away.",

  "changelog.entries.magazine-issue-production.title": "Issue production",
  "changelog.entries.magazine-issue-production.body":
    "Added issue production, arrange the running order, set the cover and coverlines, curate the members' digest and social cards, and ship the whole issue at once with a pre-ship checklist.",

  "changelog.entries.events-page-utility-redesign.title":
    "A cleaner, faster events page",
  "changelog.entries.events-page-utility-redesign.body":
    "Events is now a utility-first page: a compact header with the My events / Discover switch and one place to host, no oversized hero, a small “Next up” highlight when something's on, and search in Browse.",

  "changelog.entries.magazine-writer-workspace.title": "The writer workspace",
  "changelog.entries.magazine-writer-workspace.body":
    "Opened the contributor workspace, writers now see their own assignments, pitches and payments, choose their byline, and file drafts, all in one place.",

  "changelog.entries.persona-discovery-nudges.title":
    "Personas, easier to discover",
  "changelog.entries.persona-discovery-nudges.body":
    "A persona of your own is now easier to notice, whenever it's relevant: a quiet suggestion on your profile if you haven't made one yet, a closing nudge at the bottom of the persona directory, a step during onboarding, a prompt after a gathering you performed at, and a highlighted credit when someone credits your work on theirs. Every one of these is dismissible.",

  "changelog.entries.magazine-deck-editor-redesign.title":
    "The slide-deck editor, redesigned",
  "changelog.entries.magazine-deck-editor-redesign.body":
    "Redesigned the slide-deck editor to match the magazine desk, a live slide preview that mirrors exactly what readers see, per-slide character budgets, and a pre-publish checklist.",

  "changelog.entries.magazine-desk-redesign.title":
    "The magazine editor desk, redesigned",
  "changelog.entries.magazine-desk-redesign.body":
    "Redesigned the magazine editor desk, a live editorial dashboard with pipeline, board and issue-plan views, a pitch inbox, saved views, command palette (⌘K) and keyboard shortcuts.",

  "changelog.entries.persona-directory-redesign.title":
    "The persona directory, redesigned",
  "changelog.entries.persona-directory-redesign.body":
    'Browsing personas is now organised by six craft families (Stage, Studio, Page, Workshop, Practice and Table) so you can narrow in on the kind of work you\'re after before you even search. Cards now show tags and a follower count at a glance, and a lighter "Also working as" block on member profiles gives each linked persona the same clearer, richer look.',

  "changelog.entries.persona-editor-redesign.title":
    "A redesigned editor for your personas",
  "changelog.entries.persona-editor-redesign.body":
    "Editing a persona now has its own dedicated space: a section rail on the left, a live preview docked next to your edits, richer fields for gigs, visual work and projects, and a clear heads-up before an already-published address changes.",

  "changelog.entries.magazine-article-editor.title":
    "The block-based article editor, live",
  "changelog.entries.magazine-article-editor.body":
    "Added the block-based article editor, write in paragraphs, headings, pull quotes, images, Q&As and stat rows, with inline emphasis, a slash menu, a live word and read-time count, and a pre-publish checklist.",

  "changelog.entries.magazine-piece-record.title":
    "The full piece record, opened",
  "changelog.entries.magazine-piece-record.body":
    "Opened the full piece record (brief, care & consent, money, history and reader letters) with a publish gate that holds a piece until consent and the sensitivity read are settled.",

  "changelog.entries.persona-dashboard-redesign.title":
    "Your personas, in one redesigned dashboard",
  "changelog.entries.persona-dashboard-redesign.body":
    "Your personas dashboard got a redesign: each card now shows a draft-readiness ring or a live status pill, its tie and availability at a glance, and how many co-owners it has. Starting a new persona is now a guided two-step flow. Pick what it's for, then give it a name and choose whether it's linked to your profile or stands on its own.",

  "changelog.entries.persona-pages-redesigned.title":
    "Persona pages, redesigned for every craft",
  "changelog.entries.persona-pages-redesigned.body":
    "Every persona now gets a page built for how that craft actually shows up: performers get a stage marquee with booking details, visual artists get a studio wall with a full-screen work lightbox, writers get a page-like layout with pull-quotes, coders and makers get a workshop sheet, therapists get a calm practice layout with session logistics, and chefs and mixologists get a printed menu card. Reporting a persona and seeing who's endorsed or following them also moved into their own focused screens.",

  "changelog.entries.persona-page-unavailable-reasons.title":
    "Persona pages now tell you why they're unavailable",
  "changelog.entries.persona-page-unavailable-reasons.body":
    "If a persona is private, members-only, or has been removed, its page now says which one instead of a plain \"not found.\" And if you're the owner (or co-owner) of a persona you haven't published yet, its address now shows you a preview of your own draft with a publish-readiness banner, rather than nothing at all.",

  "changelog.entries.meet-the-table.title": "See who's at the table",
  "changelog.entries.meet-the-table.body":
    "Supper club pages now show a warm, top-down view of the table, who's hosting, who's already coming, and which seats are still open. Tap someone to read a little about them before you arrive. We also retired an old placeholder ticket-checkout screen that was never a real payment.",

  "changelog.entries.settings-mobile-nav-strips.title":
    "Easier settings and profile editing on your phone",
  "changelog.entries.settings-mobile-nav-strips.body":
    "On a phone, Settings and Edit profile now carry a compact strip of tabs that stays pinned to the top as you scroll, so you can jump straight to a section instead of scrolling past everything. On Edit profile the current section highlights itself as you move down the page.",

  "changelog.entries.places-card-mobile-foot.title":
    "Tidier “Places you run” cards on mobile",
  "changelog.entries.places-card-mobile-foot.body":
    "On a phone, the reference number and the Edit / Delete / View listing actions on your directory-listing cards no longer squeeze onto one cramped line, the reference now sits on its own row above a clean row of actions.",

  "changelog.entries.vouch-for-a-safe-space.title": "Vouch for a safe space",
  "changelog.entries.vouch-for-a-safe-space.body":
    "If a venue has been good to you, you can now add your own vouch to its safe-space page, with an optional note and how you know the place, or anonymously. Your vouch joins the ones other members and moderators have left, so newcomers can see who stands behind a space.",

  "changelog.entries.my-events-change-list-live.title":
    "See what's changed in My Events",
  "changelog.entries.my-events-change-list-live.body":
    "The bell on your My Events page now works outside the demo. Open it for a running list of updates to events you've RSVP'd to or been invited to (a changed time, a new place, a cancellation) each one marked unread until you've seen it.",

  "changelog.entries.applications-inside-work-hub.title":
    "Applications moved into your Work hub",
  "changelog.entries.applications-inside-work-hub.body":
    "Applications no longer has its own line in the profile menu. It now lives at the top of your Work hub, alongside mentorship, skills and everything else career-related. Open Work from the profile menu and you'll find your applications waiting there in both demo and live mode.",

  "changelog.entries.invite-only-community-tier.title":
    "Invite-only communities are gated again",
  "changelog.entries.invite-only-community-tier.body":
    "Communities set to invite-only or request-to-join were showing an “Open to all” label and a one-tap Join button, the same as a fully open community. They now display their real join policy everywhere (the directory cards, the community page and the join sheet), so an invite-only space asks for an invite instead of letting anyone straight in.",

  "changelog.entries.navbar-wordmark-no-wrap.title":
    "The QueerPulse logo no longer stacks up",
  "changelog.entries.navbar-wordmark-no-wrap.body":
    "On some screen sizes the QueerPulse wordmark in the top bar could break apart, dropping each letter onto its own line and puffing the bar into an oversized bubble. The logo now stays on a single line at every width.",

  "changelog.entries.mobile-edit-profile-refresh.title":
    "Editing your profile matches the new look",
  "changelog.entries.mobile-edit-profile-refresh.body":
    "On a phone, editing your profile now uses the same centered layout as your profile itself, a round photo up top and tidier fields, and the Status & Visibility options no longer spill onto a second line.",

  "changelog.entries.mobile-profile-header-refresh.title":
    "A cleaner profile on your phone",
  "changelog.entries.mobile-profile-header-refresh.body":
    "Member profiles now lead with a centered photo and name, a roomier stats row, and a tidier set of buttons, so saying hello and vouching feel calmer and clearer on mobile.",

  "changelog.entries.profile-edit-save-bar-mobile.title":
    "Saving your profile on a phone just works",
  "changelog.entries.profile-edit-save-bar-mobile.body":
    "While editing your profile on mobile, the Save and Discard buttons no longer hide behind the bottom navigation bar. The editing bar now sits cleanly above it, and on narrow screens the two buttons share the full width so they're easy to tap.",

  "changelog.entries.follow-topics-you-care-about.title":
    "Follow the topics you care about",
  "changelog.entries.follow-topics-you-care-about.body":
    "Tap Follow on any topic to keep it close. Your follows are saved to your account, so the subjects that matter to you travel with you across devices.",

  "changelog.entries.event-change-alerts.title": "Know when an event changes",
  "changelog.entries.event-change-alerts.body":
    "If an event you've RSVP'd to or been invited to moves its time or place, you'll get a notification, so a last-minute change never catches you out.",

  "changelog.entries.forms-that-really-submit.title":
    "Forms across the app now really submit",
  "changelog.entries.forms-that-really-submit.body":
    "Newsletter signup, the contact and partner enquiry forms, grant / panel / sober-host applications, and safe-space nominations now genuinely send instead of showing a preview. Your event defaults (visibility and email) also save for real.",

  "changelog.entries.save-events-for-later.title": "Save events for later",
  "changelog.entries.save-events-for-later.body":
    "Found a gathering you're not ready to RSVP to yet? Tap Save to bookmark it. Everything you save shows up under the Saved tab in My Events, so nothing you were curious about slips away.",

  "changelog.entries.collections-are-here.title":
    "Group your saves into collections",
  "changelog.entries.collections-are-here.body":
    "You can now gather the people, places, and posts you've saved into your own named collections, a reading list, a trip, a shortlist of spaces. Create as many as you like and add or remove things whenever you want.",

  "changelog.entries.your-mentions-in-one-place.title":
    "Every mention, in one place",
  "changelog.entries.your-mentions-in-one-place.body":
    "When someone @-mentions you in a forum thread or a community post, it now lands in your Mentions inbox so you can catch up on everything that named you without hunting through notifications.",

  "changelog.entries.new-moderation-tools.title":
    "More tools for the moderation team",
  "changelog.entries.new-moderation-tools.body":
    "Behind the scenes, the team gained real controls: verify or restrict a member, add and remove community moderators, act on reading-group proposals, and publish or export governance records, all wired to the platform instead of standing in as previews.",

  "changelog.entries.reports-reach-the-team.title":
    "Reports now reach the moderation team",
  "changelog.entries.reports-reach-the-team.body":
    'When you report a forum post, it now reaches the moderators reliably, and if sending ever fails, you\'ll see a clear error and a way to try again, instead of a false "done". You can also report any individual reply, as well as the opening post.',

  "changelog.entries.chat-recovers-after-reconnect.title":
    "Chat catches up when you're back online",
  "changelog.entries.chat-recovers-after-reconnect.body":
    "If a message can't send because you lost connection, it now sends itself as soon as you're reconnected, no need to reload or resend by hand. A small banner tells you when you're offline or reconnecting so you always know where a message stands.",

  "changelog.entries.honest-live-states.title": "What you see is real",
  "changelog.entries.honest-live-states.body":
    "We swept the app so that pages only ever show real people and content. Placeholder press clippings, sample voices, and example inventory no longer appear as if they were real, and controls that aren't wired up yet are clearly marked instead of pretending to save.",

  "changelog.entries.community-activity-in-your-feed.title":
    "Your feed now shows what's happening in your communities",
  "changelog.entries.community-activity-in-your-feed.body":
    "Your home feed pulls in real activity from the communities you're part of, posts, announcements, new gatherings, forum threads, and the people who just joined. When you create a gathering or start a forum thread, you can share it straight to one of your communities.",

  "changelog.entries.assignable-staff-roles.title":
    "Admins can now assign magazine staff roles",
  "changelog.entries.assignable-staff-roles.body":
    "From the member directory, admins can grant two functional roles on top of a member's account level: Magazine Editor and Magazine Writer. Access to the magazine editorial desk now follows the Magazine Editor role rather than any moderator, admins keep access, as before.",
  "changelog.entries.assignable-staff-roles.tag": "Open the member directory",

  "changelog.entries.feed-scroll-no-longer-sticks.title":
    "Your feed scrolls smoothly again",
  "changelog.entries.feed-scroll-no-longer-sticks.body":
    "On the home feed, notifications, members and gatherings, scrolling with a mouse or trackpad over the content could get stuck, moving nothing while the page stayed put. It now scrolls the page the way it should, everywhere.",

  "changelog.entries.fresh-feed-card-layout.title":
    "A fresh look for your feed",
  "changelog.entries.fresh-feed-card-layout.body":
    "Every card in your home feed (new members, gatherings, communities and community posts) now shares one cleaner layout, and packs two-to-a-row on wider screens so you can browse more at a glance.",

  "changelog.entries.feature-communities-cta-jump.title":
    "“Choose communities” now takes you straight to the picker",
  "changelog.entries.feature-communities-cta-jump.body":
    "On your profile, the Communities block's “Choose communities” button now opens Edit profile scrolled right to the communities picker, instead of dropping you at the top of the page to find it yourself.",
  "changelog.entries.feature-communities-cta-jump.tag": "Choose communities",

  "changelog.entries.live-homepage-curated-sections.title":
    "The homepage now shows real, admin-curated people and communities",
  "changelog.entries.live-homepage-curated-sections.body":
    "The public homepage's member, community, and changemaker sections now pull from the admin-curated list, real people and communities the team has chosen to introduce. A section stays hidden until something's been curated for it.",

  "changelog.entries.featured-homepage-consent-toggle.title":
    "Opt in to being featured on the homepage",
  "changelog.entries.featured-homepage-consent-toggle.body":
    "Privacy settings now has a toggle letting admins feature you on the admin-curated homepage, a member quote or highlight, chosen only from public, opted-in profiles. It's off by default, only available once your profile is set to “Open to connect,” and you can turn it off again any time.",
  "changelog.entries.featured-homepage-consent-toggle.tag":
    "Open your privacy settings",

  "changelog.entries.mobile-profile-top-breathing-room.title":
    "A calmer top on mobile profiles",
  "changelog.entries.mobile-profile-top-breathing-room.body":
    "Profile pages on phones now have more breathing room at the top, so the avatar and details no longer sit crammed under the header. We also dropped the “Queer Pulse” wordmark from the top strip on inner pages, the back arrow and the home button in the bottom bar already get you where you need to go, so it was just clutter.",

  "changelog.entries.accessible-names-screen-readers.title":
    "Screen readers now name every control",
  "changelog.entries.accessible-names-screen-readers.body":
    "Buttons and switches that showed only an icon (the send button in a livestream chat, the payment buttons at checkout, the toggles in your studio settings, moderation and notification cards) now announce a clear name to screen readers, so nothing reads as an unlabelled “button”. We also added an automatic check that holds the whole app at zero missing labels from here on. Nothing about how anything looks or works has changed; it's purely an accessibility pass.",

  "changelog.entries.icons-not-text-symbols.title":
    "Crisper icons in place of text symbols",
  "changelog.entries.icons-not-text-symbols.body":
    "Across the platform, the little directional and status marks (the “next” and “back” arrows on buttons and links, dropdown carets, the drag handles, the clock and play marks) are now drawn with proper icons instead of typed-in text characters. They render sharply and identically on every device and font, line up neatly with their labels, and read correctly to screen readers. Purely a polish and accessibility pass; nothing about what the buttons do has changed.",

  "changelog.entries.message-alerts-out-of-notifications.title":
    "New-message alerts moved out of the notifications centre",
  "changelog.entries.message-alerts-out-of-notifications.body":
    "Your Notifications tab no longer fills up with “You have a new message” rows. New direct messages now show only where you'd expect them, the unread count on the message icon and, if you've opted in, a push notification. Nothing changed about the messages themselves; the notifications centre is just quieter and focused on the things you can't already see in your inbox.",

  "changelog.entries.shared-ui-consistency.title":
    "Smoother, more consistent dialogs and forms",
  "changelog.entries.shared-ui-consistency.body":
    "We rebuilt dozens of pop-ups, confirmations, pickers and forms on one shared set of building blocks. In practice that means every dialog now traps keyboard focus, closes on Escape in the right order when several are open, and returns you exactly where you were, so the whole app feels tidier and works better with a keyboard or screen reader. No feature moved; things just behave the same way everywhere now.",

  "changelog.entries.balanced-feed-grid.title": "A more balanced home feed",
  "changelog.entries.balanced-feed-grid.body":
    "Your home feed now lays its cards out as a tidy grid instead of one tall stack. Light cards (new members, saved reads, gathering recaps) sit two or more to a row on a wide screen, so you see more people at a glance and the People tab reads like a proper directory. Richer cards like posts, community pulse and gatherings still take the full width where the extra room helps. On a phone it all folds back to a single column.",

  "changelog.entries.moderation-outcome-notifications.title":
    "You'll now hear the outcome of a moderation decision",
  "changelog.entries.moderation-outcome-notifications.body":
    "When the moderation team warns, suspends, or closes an account, the member now receives a notification explaining what happened and why, in their own language, with the reason the moderator wrote and a link to appeal the decision. A suspended or banned member is also taken straight to a page that shows the same reason and, for a suspension, when it lifts, instead of a blank screen that won't load. Until now only the person who filed a report was told the outcome; the member it affected was left in the dark. Moderation notifications are always delivered and can't be muted.",

  "changelog.entries.community-page-polish.title":
    "A friendlier community page",
  "changelog.entries.community-page-polish.body":
    "The single community page got a pass of polish: you can now share a community with a friend, leaving one asks you to confirm first so it never happens by accident, the Events tab lists every upcoming gathering instead of just the next, and switching tabs updates the link so you can share or bookmark a specific view. Non-members can read along without stray reply boxes, and your own posts now show your real name and photo the moment you share them.",

  "changelog.entries.job-application-status.title":
    "See where your job applications stand",
  "changelog.entries.job-application-status.body":
    "The application tracker now shows your real applications (what you applied to, when, and where each one is in the process) instead of a placeholder. Open any card to revisit the answers you sent.",

  "changelog.entries.data-request-history.title":
    "Your data-request history, in one place",
  "changelog.entries.data-request-history.body":
    "The privacy page now lists your real past data requests (access, correction, objection and the rest) with their reference and current status, so you can follow one up without guessing.",

  "changelog.entries.community-settings-controls.title":
    "Save, archive, or hand over your community",
  "changelog.entries.community-settings-controls.body":
    "If you run a community, the moderation panel's settings now do what they say: editing the name, description and house rules saves for real, you can archive a community, and you can transfer ownership to another member. No more changes that quietly went nowhere.",

  "changelog.entries.feed-keeps-loading.title":
    "The feed keeps loading as you scroll",
  "changelog.entries.feed-keeps-loading.body":
    "The community feed used to stop after the first page. It now loads more on its own as you reach the end, and there's a keyboard-friendly “Load more” for when you'd rather tap.",

  "changelog.entries.faster-first-load.title": "A faster first load",
  "changelog.entries.faster-first-load.body":
    "We now load each part of the interface's wording only when a screen needs it, instead of shipping all of it up front. The app opens noticeably quicker, especially on a phone or a slower connection.",

  "changelog.entries.readable-text-contrast.title":
    "Easier-to-read text across the app",
  "changelog.entries.readable-text-contrast.body":
    "A set of faint captions, hints and labels (in collections, the GIF picker, profile cards and a few other spots) were too light against the background. They now meet accessible contrast, in both light and dark mode.",

  "changelog.entries.ios-splash-screens.title":
    "A polished launch screen on iPhone",
  "changelog.entries.ios-splash-screens.body":
    "When you open QueerPulse from your iPhone home screen, it now shows a proper branded launch screen while it starts up, instead of a blank white flash. Android notifications also get a cleaner badge.",

  "changelog.entries.removed-content-stays-hidden.title":
    "Removed content stays hidden everywhere",
  "changelog.entries.removed-content-stays-hidden.body":
    "When a moderator takes something down, it now consistently disappears everywhere it could show (including direct messages, business and housing listings, and personas) and taken-down messages no longer count toward your unread badges.",

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
    "Some work is a duet: a DJ act, a band, a joint studio. You can now invite another member to co-own a subprofile: once they accept, you both fully manage it, it shows up on both your profiles, and either of you can invite someone new, leave, or edit what's shared. Deleting a co-owned persona now tells you upfront how many people it affects.",

  "changelog.entries.smoother-mobile-navigation.title":
    "A smoother way to move around on your phone",
  "changelog.entries.smoother-mobile-navigation.body":
    "Getting around QueerPulse on a phone should feel like moving. The bottom tab bar now stays with you in the browser too, even before you've installed the app, and pages settle into place with a smooth transition instead of snapping. Each tab remembers exactly where you left it, and tapping the one you're already on carries you straight back to the top. Swipe in from the left edge of the screen to go back, and pull down on your feed, events, members, messages or notifications to refresh with a quick tug instead of a reload.",

  "changelog.entries.no-sideways-scroll-on-mobile.title":
    "Pages scroll top-to-bottom on your phone again",
  "changelog.entries.no-sideways-scroll-on-mobile.body":
    "On some phones a page could drift sideways and feel stuck, everything looked too wide and cramped, and the whole screen slid left and right instead of scrolling up and down. That's fixed across the app. Long links, handles and words now wrap onto the next line instead of stretching a card past the edge of the screen, and the page is held to your phone's width so it only ever scrolls the way it should: down.",

  "changelog.entries.no-placeholder-people-in-live.title":
    "Live mode now shows only real people",
  "changelog.entries.no-placeholder-people-in-live.body":
    "A few corners of QueerPulse were quietly showing example people from the demo to real members, a wellbeing directory of made-up therapists, a job application that arrived pre-filled with someone else's name and email, and magazine stories written by placeholder authors. That's fixed. You'll now see real content where it exists, your own details where a form asks for them, and an honest “still being built” note where something isn't ready yet. Never a stand-in pretending to be a person.",

  "changelog.entries.honest-roadmap-promises.title":
    "The roadmap now keeps its promises, and says no, honestly",
  "changelog.entries.honest-roadmap-promises.body":
    "When something on the roadmap carries a Committed badge, that's a real promise you can count on, and if its date ever moves, you'll see the actual reason why, published right there instead of quietly disappearing. There's also a new “Not building this, and why” list, so a request that isn't happening gets an honest answer instead of silence. Behind it, the team's roadmap tools got a full rebuild, a proper board for moving work from idea to shipped, a timeline, and a real queue for reading and responding to what members ask for, so what you see here stays current.",

  "changelog.entries.invite-resend-and-qr.title":
    "Resend an invite that ran out, and share it with a QR code",
  "changelog.entries.invite-resend-and-qr.body":
    "An invite that expired before your friend got to it no longer means starting over. Open your sent invites, tap “Send again” on the expired one, and the same link comes back to life for another week. Every invite you generate now also comes with a QR code, so someone can join by scanning it straight from your phone, across a table or at an event, no link to copy. And if an invite was addressed to a different email, or the person who invited you is no longer on QueerPulse, you'll now get a clear, kind explanation instead of a puzzling error.",
  "changelog.entries.invite-resend-and-qr.tag": "Invite someone",

  "changelog.entries.smoother-onboarding-first-minutes.title":
    "A gentler welcome for your first few minutes",
  "changelog.entries.smoother-onboarding-first-minutes.body":
    "Setting up your space just got kinder. If you step away partway through, we now remember where you were and pick up right there instead of starting you over. The “here for” tags you choose show on your profile from the start, and coming back to onboarding will never quietly overwrite them. Moving through the steps with a keyboard or screen reader now lands you in the right place each time, and you can step back a page whenever you want a second look.",

  "changelog.entries.events-open-at-top.title": "Events opens at the top",
  "changelog.entries.events-open-at-top.body":
    "Opening Events (or any tab) now always starts you at the top of the page. It used to drop you back at wherever you'd last scrolled to, which on the tall Events cover left you stranded mid-page. Pressing your browser's Back button still returns you to exactly where you were.",
  "changelog.entries.events-open-at-top.tag": "Browse events",

  "changelog.entries.chat-header-tap-to-profile.title": "A calmer chat header",
  "changelog.entries.chat-header-tap-to-profile.body":
    "The top of a conversation now works the way you'd expect: tap the person's name or photo to open their profile, no separate button needed. The layout is tidier too, with the info and starred-messages controls gathered into one neat pair in the corner instead of floating out of place.",
  "changelog.entries.chat-header-tap-to-profile.tag": "Open messages",

  "changelog.entries.sheet-close-scroll-jump-fix.title":
    "No more jumping back to the top",
  "changelog.entries.sheet-close-scroll-jump-fix.body":
    "If you opened your account sheet partway down a page and closed it again, the page would sometimes snap back up to the top, losing your place. It now stays exactly where you left it.",

  "changelog.entries.mobile-account-you-tab.title":
    "Your account, one tap away on mobile",
  "changelog.entries.mobile-account-you-tab.body":
    "On a phone, tapping your photo in the bottom bar now opens a space that's just yours: your profile, connections, saved places, applications and settings, gathered into one tidy sheet instead of scattered down a long menu. Messages moved up top beside notifications, so the people you're talking to stay within reach, and the “More” menu is now just for exploring the rest of QueerPulse.",

  "changelog.entries.instagram-style-mobile-profile.title":
    "Your profile, redesigned for your phone",
  "changelog.entries.instagram-style-mobile-profile.body":
    "On a phone, your profile now opens the way the apps you already know do: a compact avatar wrapped in a soft pride-gradient ring, a stat row you can take in at a glance (vouches, communities, personas) a highlights strip of your personas right up top, and the rest of your profile organised into swipeable, tabbed sections instead of one long scroll.",

  "changelog.entries.forum-upvotes-tags-search.title":
    "The forum grew up, upvotes, tags, search and lockable threads",
  "changelog.entries.forum-upvotes-tags-search.body":
    "The commons got a proper set of tools. You can now upvote a thread or a reply for real, so the answers people found most useful rise to where you'll see them. Sort the board by Active or Unanswered, as well as Top and New, to find the conversations that need a voice or the ones still waiting for a first reply. When you start a post you can add a few tags like #housing or #health, and tapping any tag filters the whole board down to that topic. There's a search box now, so you can look for a thread instead of scrolling for it. And moderators can close a thread to new replies when a conversation has run its course. It stays readable, just paused.",
  "changelog.entries.forum-upvotes-tags-search.tag": "Open the forum",
  "changelog.entries.list-business-wizard-overhaul.title":
    "Adding your space to the directory just got a lot easier",
  "changelog.entries.list-business-wizard-overhaul.body":
    "We rebuilt the whole “list a business” flow. If you're just recommending a place you love, we now only ask for what you can actually know, a name, where it is and a line about why, instead of demanding owner details and opening hours you don't have. Can't paste a Google Maps link? Type the address and tap “Locate this address”, or drop a pin on the neighbourhood and nudge it into place. You're never stuck. Opening hours now handle lunch-break splits and late nights that run past midnight, and as you type a name we check the real directory so you don't accidentally add a place that's already there. Your progress saves as you go and now follows you across devices, so you can start on your phone and finish on a laptop. Every business also gets a clear way to claim its own listing or dispute one added without its say-so, and anyone can still flag a listing that shouldn't be there.",
  "changelog.entries.list-business-wizard-overhaul.tag": "List your space",
  "changelog.entries.mobile-experience-pass.title":
    "The whole app, tuned for your thumb",
  "changelog.entries.mobile-experience-pass.body":
    "We went screen by screen to make QueerPulse feel right in one hand. Buttons, chips and switches are bigger and easier to hit, and menus, filters and dialogs now rise up from the bottom of the screen as sheets you can flick away, right where your thumb already is. There's a clear back arrow at the top of every page you can reach without installing the app, and when you open a chat it fills the screen so nothing gets in the way, with the message box always sitting just above the keyboard. Slide-deck stories, the events calendar, the directory filters and the admin tools all read comfortably on a phone now, in portrait, without pinching or scrolling sideways.",

  "changelog.entries.magazine-deck-authoring.title":
    "Editors can now build their own interactive decks",
  "changelog.entries.magazine-deck-authoring.body":
    "The interactive slide-deck format from the magazine's front page used to be something we assembled by hand. Now editors get a full authoring tool right in the dashboard. Add slides in five layouts (text, full-bleed image, a big animated stat, a before-and-after slider, or a tap-to-reveal moment), fill in the byline and metadata, and preview it exactly as readers will see it. Save a draft while you're still shaping it, then publish when it's ready, it'll show up with the “Interactive” tag on the magazine's front page.",

  "changelog.entries.listings-moderation-console.title":
    "The listings queue is now a real moderation console",
  "changelog.entries.listings-moderation-console.body":
    "Reviewing directory submissions is faster now: the queue has real pagination, search by name, submitter or reference, and sort by newest, oldest, or name, with a live count for each status. Moderators can select several submissions at once to publish, send back, or remove them together, and every row now shows how long a listing has been waiting so nothing sits forgotten. Sending a listing back or removing it can carry a short reason for the record, and opening a listing's preview now shows its full moderation history alongside any question-and-answer thread with the person who submitted it. An empty queue finally looks like good news, with its own illustration instead of a blank space.",

  "changelog.entries.magazine-slide-decks.title":
    "Interactive slide-deck stories, now in the magazine",
  "changelog.entries.magazine-slide-decks.body":
    "Some magazine stories can now be read as a slide deck: full-screen slides you tap through like a presentation, mixing text, full-bleed photos, big animated numbers, before-and-after image sliders and moments you tap to reveal. Open “Present” for a distraction-free, full-screen read. Look for the “Interactive” tag on the magazine's front page, the first one, “Ten years in Mouraria,” is live now.",

  "changelog.entries.real-notification-settings.title":
    "Notification settings that actually do something",
  "changelog.entries.real-notification-settings.body":
    "The toggles in Settings → Notifications used to be for show, flipping them changed nothing. Now they're real: turn gathering invites, RSVP reminders, new-message alerts, connection requests and thread replies on or off per type, and your choice is saved and respected everywhere, including phone push. Safety and account messages (moderation, appeals, account changes) always come through and aren't hidden behind a toggle. A few rows with no feature behind them yet are still honestly marked “coming soon” rather than pretending to work.",
  "changelog.entries.platform-wide-search.title":
    "Search now covers the whole platform",
  "changelog.entries.platform-wide-search.body":
    "Global search reached only members, communities, events, forum threads and businesses. It now spans magazine articles, jobs, housing listings, resources, workshops and subprofiles too, so one search finds the thing you're looking for wherever it lives, in both English and Portuguese.",
  "changelog.entries.save-events-communities.title":
    "Save events and communities, and saves that really stick",
  "changelog.entries.save-events-communities.body":
    "You can now save a gathering or a community to your collection with the same bookmark you already use elsewhere. We also fixed two Save buttons, on a job's detail page and on short films, that looked like they worked but forgot everything the moment you left. Every save now persists to your collection.",
  "changelog.entries.invite-revoke-oversight.title":
    "Take back an invite you've sent",
  "changelog.entries.invite-revoke-oversight.body":
    "Changed your mind about an invitation? You can now revoke a pending invite from your sent list and the link stops working immediately. Admins also get a new platform-wide Invites view to see every invitation and its status, filterable at a glance.",
  "changelog.entries.moderation-completeness.title":
    "A more complete moderation toolkit",
  "changelog.entries.moderation-completeness.body":
    "Moderators can now take down a member's profile and individual business reviews, as well as posts and listings. A removed profile or review stops showing to everyone else (and a removed review stops counting toward a place's rating). Moderators can also lift a suspension and reinstate a member directly, instead of only through the appeal flow.",
  "changelog.entries.account-media-safety.title":
    "Safer handles, cleaner storage",
  "changelog.entries.account-media-safety.body":
    "A few quiet safety improvements. When you change your username, the old one is now held for you for 30 days before anyone else can take it, so a freed handle can't be instantly grabbed and old @mentions can't be quietly redirected to a stranger. Photos you replace (avatars, listing pictures, post images) are now deleted from storage instead of lingering, a suspended member's images stop being served to others, and finishing onboarding records your agreement to the community guidelines.",
  "changelog.entries.legal-notice-imprint.title":
    "A legal notice (imprint) page",
  "changelog.entries.legal-notice-imprint.body":
    "Added a Legal Notice page under Policies, linked from the footer, setting out who operates QueerPulse and how to reach us, the kind of imprint that's expected of a service operating in Europe.",
  "changelog.entries.messages-list-virtualization.title":
    "Long chats now scroll smoothly, however big they get",
  "changelog.entries.messages-list-virtualization.body":
    "A very long or very active conversation used to keep every message it had ever loaded sitting in the page at once, which could make scrolling feel heavy the longer a chat went on. Messages now render only the ones actually near your screen, so a thread with thousands of messages feels just as light as a brand-new one, loading older history, jumping to a reply, and scrolling to the latest message all still land exactly where you'd expect.",
  "changelog.entries.live-mode-honesty-sweep.title":
    "No more placeholder people, fake confirmations or dead-end buttons",
  "changelog.entries.live-mode-honesty-sweep.body":
    "A platform-wide honesty pass so nothing you see is invented and nothing you tap pretends to work. Prototype pages that hadn't been wired up yet (parts of the homepage, the magazine, the therapist and clinic directories, skill-swaps, the incubator and gatherings tools) now show a clear “coming soon” instead of made-up members, events, “verified” providers or statistics. Forms that had no home yet (contact, newsletter, cookie preferences, micro-grant and panel applications, safe-space vouches, perk claims, and admin actions like publish/export) no longer flash a false “done”: they either save for real or tell you honestly they're not open yet, and cookie choices now actually stick. Health and legal directories in particular will never show an unverified provider as if we'd vetted them.",
  "changelog.entries.frontend-reliability-hardening.title":
    "Fewer lost drafts, honest error states and safer shared devices",
  "changelog.entries.frontend-reliability-hardening.body":
    "A correctness pass across the app so nothing quietly loses your work or misleads you. Leaving a half-finished gathering, community or profile edit now warns you before your changes disappear, and Settings no longer discards edits when you navigate away. When something goes wrong, you see an honest message with a retry instead of an eternal loading state or a false “done”, and a passing wobble in your connection no longer nags you with an error toast for data you're already looking at. On a shared device your saved items, drafts and vouches are now kept separate per account and cleared when you sign out, so the next person never sees your things; and the “Follow a writer” button only appears where following actually works. Under the hood the app also recovers gracefully from a bad response or an out-of-date tab instead of showing a crash screen.",
  "changelog.entries.screen-help-signs.title":
    "“About this screen” help on every feature",
  "changelog.entries.screen-help-signs.body":
    "New to a part of QueerPulse? Look for the small ⓘ info button next to a screen's title. Tap it and a short, friendly card explains what the screen is for, how to use it, and gives one concrete example, so you always have a sense of how each feature fits into the platform. It's there across the main screens (Members, Communities, Forum, Events, Messages, the local directory, housing, work, culture, settings and more), in both English and Portuguese, and it never gets in the way. Open it when you want it, ignore it when you don't.",
  "changelog.entries.performance-cost-hardening.title":
    "Faster search, lighter uploads and steadier busy pages",
  "changelog.entries.performance-cost-hardening.body":
    'A behind-the-scenes pass to keep QueerPulse quick and affordable as it fills up. Global search now uses proper text indexes, so finding people, communities, events, listings and threads stays fast no matter how many members join instead of slowing down as the platform grows. Photos you upload are gently resized before they leave your device, so posting is quicker on mobile data and pages load lighter for everyone. Busy community threads, member rosters and event guest lists now load in tidy pages with a "load more" button rather than pulling in everything at once, and popular pages the whole community shares can now be served from the cache instead of rebuilt every time. Event reminders and push notifications go out in a single efficient batch, images at the top of a page load first for a snappier first paint, and switching pages mid-load no longer wastes a request. Long lists, the local directory and busy forum threads, now reveal more as you scroll instead of rendering everything at once, so they stay smooth on a phone. Nothing you see changes. It just holds up better under a crowd.',
  "changelog.entries.accessibility-i18n-pwa-hardening.title":
    "Accessibility, translation and offline polish",
  "changelog.entries.accessibility-i18n-pwa-hardening.body":
    "A sweep to make QueerPulse work for more people, in more places. Every form field now announces its label to screen readers, so signing up, posting a job, checking out or editing your profile all read cleanly with assistive tech. Sharing a link finally shows a preview image instead of a broken thumbnail. Lose your connection and you get a real offline page in place of the browser's error, and the app installs lighter and updates with a pill that waits for you instead of a toast that vanishes. Toasts can now be dismissed and pause while you read them; removing someone from a group asks first; buttons are a little bigger to tap; and message timestamps plus a few stray labels now follow the language you chose, in both English and Portuguese.",
  "changelog.entries.launch-hardening-p1.title":
    "Safety, honesty and reliability hardening",
  "changelog.entries.launch-hardening-p1.body":
    "A broad pre-launch pass. Blocking someone now truly stops them everywhere, no more DMs, presence, typing or push slipping through, and your profile is hidden from anyone you've blocked. Live mode tells the truth: pages that used to show placeholder people or fake a submission now either use real data or say plainly when something isn't ready yet, and requesting your data (GDPR) is a real request. Editing, cancelling or RSVPing to a gathering, and leaving a community, now refresh the screen straight away; an outage shows a retry instead of an empty page. And where we can't yet email you, we no longer pretend we will.",
  "changelog.entries.remove-listings-from-moderation.title":
    "Moderators can remove directory listings",
  "changelog.entries.remove-listings-from-moderation.body":
    "The listings review queue now has a Remove action, so a moderator can permanently delete a spam, duplicate or inappropriate submission instead of only sending it back to review. Removing a live listing also takes it off the public directory. Every removal asks for confirmation first.",

  "changelog.entries.sent-invites-status-filter.title":
    "Filter the invites you've sent by status",
  "changelog.entries.sent-invites-status-filter.body":
    "The list of invites you've already sent now has tabs (All, Pending, Accepted, Expired) each showing a count, so you can jump straight to the ones still waiting for a reply or the ones that landed. Each invite also shows the exact day and time it was sent and when it expires, instead of just the date.",

  "changelog.entries.onboarding-one-time-guard.title":
    "Finishing onboarding now sticks",
  "changelog.entries.onboarding-one-time-guard.body":
    "The welcome flow you go through right after joining is meant to happen once. If your browser later autofilled the saved onboarding address, though, it would drop you straight back into the wizard as if you'd never done it, and clicking through could quietly reset choices like your “Here for” intents. We now record when you finish onboarding and send you on to your feed if you land back on it, so it can't replay or overwrite what you already set.",

  "changelog.entries.trust-network-replay-by-joins.title":
    "Trust-network replay now follows the people, connection by connection",
  "changelog.entries.trust-network-replay-by-joins.body":
    "In the admin trust network, the “Replay” of how vouches formed over time used to advance one calendar month at a time, so it crawled through quiet months where nothing happened and flashed past the busy ones. It now steps through the moments people were actually vouched for, giving each real event equal time. The result tracks how the community grew instead of the passage of the calendar. Dragging the timeline slider by hand works exactly as before.",
  "changelog.entries.trust-network-invite-vs-vouch.title":
    "See who was invited vs vouched for",
  "changelog.entries.trust-network-invite-vs-vouch.body":
    "The admin trust network now shows invite connections, people you brought onto QueerPulse yourself, in a distinct colour from vouches added later, with a legend and hover labels so the two are easy to tell apart at a glance.",
  "changelog.entries.chef-mixologist-therapist-personas.title":
    "Three new persona types: chef, mixologist and therapist",
  "changelog.entries.chef-mixologist-therapist-personas.body":
    "You can now build a subprofile as a chef (menus + residencies), a mixologist (cocktails + residencies) or a therapist (specialisms + credentials), each with its own sections, starter template and directory filter, alongside the crafts already there.",
  "changelog.entries.connections-card-polish.title": "Tidier connection cards",
  "changelog.entries.connections-card-polish.body":
    "On your connections page, the “mutuals” line now renders properly instead of showing raw formatting, and the “Connected” date shows the day and time you connected, down to the minute.",
  "changelog.entries.lightbox-focus-a11y.title":
    "Cleaner focus handling in the photo viewer",
  "changelog.entries.lightbox-focus-a11y.body":
    "Opening a photo full-screen, in the directory galleries and on gathering pages, no longer leaves keyboard focus stranded on the invisible tap-to-close layer behind the image. Focus now stays where you can see it, which keeps screen readers and keyboard navigation working smoothly while you flip through photos.",
  "changelog.entries.directory-detail-polish.title":
    "A redesigned, more accurate place page",
  "changelog.entries.directory-detail-polish.body":
    "Directory listings were rebuilt around a clearer layout: the place introduces itself first (name, category, and its key details in one row) then a compact photo gallery (a main shot with the rest in a clickable column) instead of one oversized banner, with the main actions sitting right beside the name. New venues now read as “New” rather than a hollow zero-star rating. Alongside the redesign: “Open now” is worked out on the venue's own clock (not your device's timezone), the location line and search data no longer assume every place is in Lisbon, website links always open correctly and show a tidy domain, and star ratings read properly to screen readers. Signed-out visitors can now save a place, people who run a venue can claim its listing, and a mistyped or removed listing shows a real “not found” page instead of quietly bouncing you back to the directory.",
  "changelog.entries.review-author-avatars.title": "See who left a review",
  "changelog.entries.review-author-avatars.body":
    "Reviews on a space's directory page now show the reviewer's photo, and their name links straight to their profile, so a warm note from someone in the community is one tap away from finding out more about them. Reviews from non-members still read exactly as before, just without the link.",
  "changelog.entries.verification-in-context.title":
    "How verification works now lives where you're browsing",
  "changelog.entries.verification-in-context.body":
    "“How verification works” is no longer a link buried in the top navigation. Instead there's a short explainer right on the local directory (nominated, reviewed, re-checked every year) and a quiet line inside each verified listing that points to the full story. The safe-spaces hub is still there for the complete criteria and delisting record; it's just reached in context now, when the badge is actually in front of you.",
  "changelog.entries.directory-collapsible-filters.title":
    "Tidier filters on the spaces directory",
  "changelog.entries.directory-collapsible-filters.body":
    "Search and the category chips stay front and centre, while the safe-spaces and vibe refinements now tuck behind a single “Refine” toggle so the bar no longer crowds the page. A count on the toggle still tells you when hidden filters are active, your choices stay applied, and the drawer glides open and closed instead of snapping, with your open/closed preference remembered next time.",
  "changelog.entries.safe-spaces-in-directory.title":
    "Verified safe spaces now live in the directory",
  "changelog.entries.safe-spaces-in-directory.body":
    "The verified badge now shows right on the card in the local directory, a “Verified safe spaces” filter narrows the list to just the ones that earned it, and verified listings rank first. Open any listing to see the full trust block, what verification means for that space and when it was last reviewed. And /local/safe-spaces is now the verification hub: what the badge means, how the review process actually works, and an honest, public record of every space that's lost it.",

  "changelog.entries.magazine-desk-polish-sweep.title":
    "Polish across the magazine desk",
  "changelog.entries.magazine-desk-polish-sweep.body":
    "Consistent heading colours in dark mode, linked-deck editing from the desk, per-assignment byline control for writers, and assorted cleanups.",

  "changelog.entries.magazine-piece-messaging.title":
    "Editors and writers can now message each other on the piece",
  "changelog.entries.magazine-piece-messaging.body":
    "Editors and writers now message each other on the piece itself, chases and questions live beside the work itself, and both sides always see the whole thread.",

  "changelog.entries.live-press-kit-real-data.title":
    "The press kit now shows real coverage, contacts and figures",
  "changelog.entries.live-press-kit-real-data.body":
    "The press kit's coverage and press-desk contacts now come from what the team actually publishes and keeps up to date, and the headline figures are drawn from the platform itself, no invented numbers. Each section simply stays hidden until there's something real to show.",
  "changelog.entries.communities-and-home-merged.title":
    "Communities, all in one place",
  "changelog.entries.communities-and-home-merged.body":
    "Your community hub and the discovery directory now live on a single /communities page, with a My communities / Discover switch up top. It opens on your hub when you belong to a community, and on Discover when you don't.",

  "changelog.entries.silent-session-recovery.title":
    "No more “session expired” flash when you come back",
  "changelog.entries.silent-session-recovery.body":
    "Returning after a while away, you might have seen a “session expired” error pop up for a moment, and then get signed right back in anyway. That message was misfiring on a session the app was already quietly renewing. Now, when we can restore your session on our own, we do it silently: no error, nothing to read, you just pick up where you left off. You'll only ever be told your session ended when it actually has and you need to sign in again.",

  "changelog.entries.session-refresh-csrf-race.title":
    "Smoother session refresh after a token expires",
  "changelog.entries.session-refresh-csrf-race.body":
    "When your session had quietly expired, refreshing the page could briefly flash a “session expired” state before signing you right back in. We fixed a race in how the app renews your session, so it renews cleanly on the first try, no flicker, no wasted request.",

  "changelog.entries.directory-category-unify.title":
    "Directory categories that match everywhere",
  "changelog.entries.directory-category-unify.body":
    "A place you add now shows the right coloured pin on the map and the right category on its card and filter, the “list a business” wizard and the directory finally speak the same category language. Nightlife is now a category you can pick when listing, too.",

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
    "The members directory filters are now tidy collapsible sections with a show/hide toggle, so you can clear space for results. Your selections stay applied while filters are hidden, and your view is remembered next time. Opening a section and hiding the whole sidebar now glide smoothly instead of snapping.",
  "changelog.entries.activism-volunteer-merge.title":
    "Activism and Volunteering are now one place",
  "changelog.entries.activism-volunteer-merge.body":
    "We merged the Activism and Volunteer pages into a single home. Volunteering is now the front door, browse real opportunities in Lisbon, filter by cause or commitment, and start with a couple of free hours. If you want to go deeper, our guide to organising better is one tap away from there. The nav, footer, and sidebar now carry a single “Activism & Volunteering” link instead of two, and the old /activism address still works.",
  "changelog.entries.spaces-map-pins.title":
    "Map pins now show what kind of space each place is",
  "changelog.entries.spaces-map-pins.body":
    "On the Local directory map, every pin is now a coloured teardrop with an icon for its category (a martini glass for nightlife, a fork and knife for food, a heart for health, and so on) so you can read the map at a glance instead of tapping each dot. The category filter chips carry the same colour and icon, so the filter bar doubles as a legend.",
  "changelog.entries.creatives-subprofile.title":
    "The Creatives showcase is now a creative subprofile",
  "changelog.entries.creatives-subprofile.body":
    "The standalone Creatives directory has been retired. Showing your art, music, or other creative work now lives with subprofiles, the same place you build any linked persona, so a creative profile is part of who you are on QueerPulse rather than a separate list. The old /magazine/creatives link now takes you straight to your subprofiles, where you can add a creative one.",
  "changelog.entries.moderation-takedowns.title":
    "Moderator hide and remove now actually take content down",
  "changelog.entries.moderation-takedowns.body":
    'When a moderator hides or removes reported content, it now really disappears from public view. Hidden content is withheld from members while staff can still see it; removed content shows a clear "removed by a moderator" tombstone where a deleted post already would. Applied across forum posts and replies, community posts and replies, communities, events, and business listings, recorded in the same step as the moderator\'s decision so it can never be logged without taking effect.',
  "changelog.entries.gathering-create-fix.title":
    "Creating a gathering works again, and lands on your event",
  "changelog.entries.gathering-create-fix.body":
    'Publishing a new gathering was quietly failing on the server, yet the wizard still showed the celebration screen as if it had worked, and its "See your event" button opened a stray sample page. Both are fixed: a gathering now actually publishes, the success screen only appears once it has, and "See your event" takes you straight to your real gathering. If a publish ever fails, you\'ll see a clear message and stay on the review step to try again. The wizard now also asks for a date and start time in the future before you can move on, so a gathering can\'t be created without one.',
  "changelog.entries.directory-photos-crisp.title":
    "Listing cover photos load crisp again",
  "changelog.entries.directory-photos-crisp.body":
    "Cover photos on business listings, and the preview while you're adding one, were loading at a low resolution and looking blurry when shown large. They now load crisp at full size. We also nudged the listing header down so the breadcrumb and the owner's Edit button no longer tuck under the floating navigation.",
  "changelog.entries.admin-role-management.title":
    "Admins can promote moderators and admins from the dashboard",
  "changelog.entries.admin-role-management.body":
    "Making someone a moderator or admin used to mean editing the database by hand. Now an admin can grant or revoke those roles right from a member's detail in the admin dashboard, with the guardrails that matter built in: you can't change your own role, the house account is off-limits, and the platform will never let you remove its last admin. Every change is written to the audit log.",
  "changelog.entries.appeal-submission.title":
    "You can now appeal a moderation decision",
  "changelog.entries.appeal-submission.body":
    "A suspended or banned account was able to read about appeals but had no way to file one. Now a member under any moderation decision (a warning, a removal, a suspension, a ban) can submit an appeal directly from their account screen, and it goes straight to a moderator who wasn't involved in the original call. One open appeal at a time; the original decision stands while it's reviewed.",
  "changelog.entries.honest-report-failures.title":
    "Safety reports tell you the truth when they don't send",
  "changelog.entries.honest-report-failures.body":
    'When a report, flag, or safe-space concern can\'t reach us (a dropped connection, a server hiccup) you now see an honest error and your words stay in the form to try again, instead of a false "received". If we say a report landed, it landed. This also covers messaging a housing lister and listing a space.',
  "changelog.entries.directory-filters-and-accurate-recognition.title":
    "Member filters that actually filter, and honest badges & perks",
  "changelog.entries.directory-filters-and-accurate-recognition.body":
    "Picking a filter in the member directory now returns the people who match instead of emptying the page. Your Badges and Perks pages also show a proper loading, empty, or try-again state while your recognition loads, no more placeholder counts standing in for the real thing.",
  "changelog.entries.navigation-resilience.title":
    "Back keeps your place, and the app rides out updates",
  "changelog.entries.navigation-resilience.body":
    "Hitting back after opening something from a list now drops you exactly where you were scrolled to, instead of jumping to the top. If your session quietly expires we tell you so you can sign back in, and when a new version ships mid-visit the app quietly refreshes itself instead of showing an error.",
  "changelog.entries.search-page-launcher.title": "Jump anywhere from search",
  "changelog.entries.search-page-launcher.body":
    "Search (⌘K and the search page) now doubles as a launcher: start typing, or just open it, to jump straight to Members, Communities, Events, Messages, your profile, Settings, the Magazine and more, each with its own icon. A new Pages tab lists every destination in one place.",
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
    "Member results in search (⌘K and the search page) now show each person's profile photo instead of a generic icon, so you can recognise the face you're looking for at a glance.",
  "changelog.entries.search-real-topics.title": "Search now shows real results",
  "changelog.entries.search-real-topics.body":
    "Search (⌘K and the search page) no longer falls back to sample topics with made-up post counts. It now pulls the real trending topics and live post counts, alongside real people, communities, events, forum threads, and businesses.",
  "changelog.entries.global-search.title": "Search across QueerPulse",
  "changelog.entries.global-search.body":
    "Search across people, communities, events, the forum, and local businesses, from anywhere with ⌘K or the search page.",
  "changelog.entries.studio-coming-soon.title":
    "Studio is now an honest preview",
  "changelog.entries.studio-coming-soon.body":
    "The co-op music Studio is still in the workshop, so it no longer shows placeholder payouts and figures as if they were real. Explore it fully in demo mode; live visitors now get a clear “coming soon” instead.",
  "changelog.entries.cinema-honest-live.title":
    "Cinema is honest about what's live",
  "changelog.entries.cinema-honest-live.body":
    "The film catalogue and playback are real, so the parts still in production (collections, filmmaker profiles, open calls) now say “coming soon” in live instead of showing placeholder content. Explore it all in demo mode.",
  "changelog.entries.cinema-live-streaming.title":
    "Cinema now streams real films",
  "changelog.entries.cinema-live-streaming.body":
    "Cinema is live: browse the real programme and press play to stream the film, and it resumes right where you left off next time you come back.",
  "changelog.entries.employer-reviews-live.title": "Employer reviews, for real",
  "changelog.entries.employer-reviews-live.body":
    "The employer reviews page now shows real queer-inclusive employers. Open any company for its full profile and reviews, and write your own anonymous review of a place you've worked.",
  "changelog.entries.block-mute-from-profile.title":
    "Block or mute straight from a profile",
  "changelog.entries.block-mute-from-profile.body":
    "A new safety menu in the profile header lets you mute someone (quietly hiding their posts) instantly, or block them after a quick confirm, with the option to also report them at the same time.",
  "changelog.entries.event-push-reminders.title":
    "Set when your event reminders arrive",
  "changelog.entries.event-push-reminders.body":
    "Event preferences now let you choose how far ahead you're reminded (an hour, a day, or a week before) and turn on a phone push so the reminder reaches you wherever you are.",
  "changelog.entries.report-more-surfaces.title":
    "Report anything that doesn't feel right",
  "changelog.entries.report-more-surfaces.body":
    "You can now report an event, a business, a company, a job posting, or a member's public persona, a discreet “Report” link opens the same confidential flow used everywhere else, and events are now actually filed to the safety team instead of just acknowledged.",
  "changelog.entries.profile-photo-pronouns.title": "Your face, your words",
  "changelog.entries.profile-photo-pronouns.body":
    "Edit Profile now lets you upload a custom photo, with an instant preview, instead of only using your Google picture, and you can write in your own pronouns alongside the presets. We also cleared out the “coming soon” placeholders that couldn't do anything yet.",
  "changelog.entries.mobile-form-keyboard.title":
    "Forms stay above the keyboard on phones",
  "changelog.entries.mobile-form-keyboard.body":
    "On iOS, opening the keyboard inside an enquiry or sign-up dialog no longer hides the submit button behind it, the sheet lifts to stay in view. We also added long-press app shortcuts to the installed icon and tidied up tooltips for touch.",

  "changelog.entries.magazine-real-content.title":
    "The magazine shows real issues, always",
  "changelog.entries.magazine-real-content.body":
    "The magazine archive and writer pages now load real editions with a proper loading and error state, so you'll never see placeholder prototype content if something is slow or goes wrong.",

  "changelog.entries.community-roadmap.title":
    "The roadmap is now yours to shape",
  "changelog.entries.community-roadmap.body":
    "See what's shipped, what's building, and what's planned, then vote for what matters most to you, or submit an idea of your own. We read every suggestion; the team curates what moves onto the roadmap.",

  "changelog.entries.listing-photos.title": "Photos on your business listing",
  "changelog.entries.listing-photos.body":
    "The list-a-business form now takes photos, upload a file or paste an image URL, and see a live preview of how your listing will look before you publish.",

  "changelog.entries.business-page-live.title": "Business pages come to life",
  "changelog.entries.business-page-live.body":
    "Every business page now shows the venue's real photos in a gallery you can open full-screen, plus its real opening hours with a live “Open now / Closed” status, so you know what a place looks like and whether it's open before you go.",

  "changelog.entries.business-actions.title": "Save, share, and get directions",
  "changelog.entries.business-actions.body":
    "Every business page now has an action bar. Get directions, call, share, or save a place to your list in one tap. Saved spots show how many members have saved them too, a quiet trust signal.",

  "changelog.entries.business-reviews-trust.title": "Reviews that go both ways",
  "changelog.entries.business-reviews-trust.body":
    "Business owners can now reply to reviews, and every page shows a star-rating breakdown so you can see the full picture behind the average. If something's off, you can report a listing or suggest an edit. Both go straight to our moderators.",

  "changelog.entries.business-discovery.title":
    "Find your way around the directory",
  "changelog.entries.business-discovery.body":
    "Business pages now show related places nearby, a clear path back to the directory, and the languages spoken on-site. Upcoming events link straight to their event page, where you can add them to your calendar.",

  "changelog.entries.directory-filters-upgrade.title":
    "The business directory got a lot easier to filter",
  "changelog.entries.directory-filters-upgrade.body":
    "Finding a place is smoother now. Search looks inside descriptions and tags as well as names; each category shows a live count; you can sort A–Z or by neighbourhood; and your filters live in the link, so a filtered directory is shareable and survives a refresh. Picking a vibe no longer makes every business disappear, active filters show as removable chips with a Clear-all, empty results explain themselves, and the map is easier to use on a phone.",
  "changelog.entries.public-profile-badge.title":
    '"Go public" now lives on your profile',
  "changelog.entries.public-profile-badge.body":
    "Your public-profile control moved into a quiet badge next to your name. Tap it to see how public profiles unlock, or to switch yours on once you're eligible. It only ever shows on your own profile.",

  "changelog.entries.here-for-hero.title": '"Here for" now leads your profile',
  "changelog.entries.here-for-hero.body":
    "Your \"Here for\" intent, what you're looking for on QueerPulse, now sits right at the top of your profile, next to your name and bio, instead of further down the page. Easier to spot at a glance, and just as easy to keep private if that's how you like it.",

  "changelog.entries.directory-view-switcher.title":
    "A clearer List / Map switch",
  "changelog.entries.directory-view-switcher.body":
    'Switching between the list and the map on the business directory is easier to spot now. The two buttons became a single labelled toggle with icons, sitting beside the results count, so it clearly reads as "pick a view" rather than another filter, and it stays compact and tappable on a phone.',

  "changelog.entries.profile-links-fix.title": "Profile links that behave",
  "changelog.entries.profile-links-fix.body":
    'Adding social links to your profile is smoother now. A plain username like your Instagram handle is accepted as-is, no more "that doesn\'t look like a valid link" warning when it clearly is, and the rows no longer break apart when a hint appears; the field stays put and the hint sits neatly below it.',

  "changelog.entries.subprofiles-showcase.title": 'A richer "Also working as"',
  "changelog.entries.subprofiles-showcase.body":
    "Your other professional sides now show off more of who you are, featured work, links, availability, and follower and endorsement counts, right on the card. On mobile it's a one-tap view built for a smaller screen, and if you own the personas you get visibility badges and a quick way to edit right from the showcase.",

  "changelog.entries.real-directory-map.title":
    "A real map on every directory listing",
  "changelog.entries.real-directory-map.body":
    "Open a business or space in the directory and its location now shows on a real, interactive map, the same warm Lisbon map you already know from the map view and from listing a business, pinned to the exact spot the owner placed. The old decorative placeholder is gone.",

  "changelog.entries.reply-threads.title": "Reply to any comment in the forum",
  "changelog.entries.reply-threads.body":
    "Replies can now have their own replies. Answer directly under any comment and yours nests right there, so long conversations branch out instead of piling into one flat list. Deep threads collapse into a single line. Tap to expand when you want the rest.",

  "changelog.entries.copy-subprofile.title": "Copy an existing persona",
  "changelog.entries.copy-subprofile.body":
    "Starting a new subprofile? Copy one you already have (bring over everything, or just the content) and tweak from there.",

  "changelog.entries.smoother-chat.title": "Smoother, more responsive chat",
  "changelog.entries.smoother-chat.body":
    "Messages now feel faster and calmer on every device. Typing no longer stutters the conversation, swipe-to-reply glides under your finger, and new messages settle into place instead of the whole thread animating at once. On phones, holding a message opens the actions cleanly (no more fighting the text-selection popup), the chat fills the screen as one surface without the page bouncing behind it, and taps give instant feedback with a gentle buzz on long-press.",

  "changelog.entries.invite-state-page.title": "A clearer invite link page",
  "changelog.entries.invite-state-page.body":
    "When an invite link can't be used, the page now shows the real invite, who vouched for you and when it lapsed, instead of a generic message. It also tells apart an invite that timed out, one that was already used, and one that was withdrawn, and points you to the right next step for each.",

  "changelog.entries.chat-shortcuts.title": "Mention shortcuts in chat",
  "changelog.entries.chat-shortcuts.body":
    "A new “?” button in the message composer shows every mention shortcut at a glance, @ for a member, c/ for a community, # for a topic, b/ for a business, e/ for an event, t/ for a thread. Tap one and it drops the sigil straight into your message so the suggestions open as you type. And to keep things tidy, only one composer popover is ever open at a time.",

  "changelog.entries.events-hub.title": "One home for events",
  "changelog.entries.events-hub.body":
    "Events, Gatherings, and Calendar are now a single Events Hub, Highlights, Browse, and a full calendar together, with real photos for what's coming up. Same events, easier to find.",

  "changelog.entries.gifs-in-chat.title": "Send GIFs in chat",
  "changelog.entries.gifs-in-chat.body":
    "Say it with a GIF. There's a new GIF button in the message composer, search or browse what's trending, tap one, and it sends straight into your chat (in DMs and group chats alike). Powered by KLIPY, with safe-content filtering on by default.",

  "changelog.entries.privacy-and-speed.title":
    "Stronger privacy and a snappier app",
  "changelog.entries.privacy-and-speed.body":
    "A round of privacy, speed and messaging polish. Personas and subprofiles you've set to private now stay fully private, and people you've blocked no longer turn up in the flatmate directory. Editing or deleting a message updates right away, with no reload flicker. And the app itself is lighter, so pages, and the images that greet you at the top, load a little quicker.",

  "changelog.entries.leaner-prerendering.title": "Leaner, faster site builds",
  "changelog.entries.leaner-prerendering.body":
    "Behind the scenes: we now pre-build only the essential public page for search engines instead of the whole site, and we no longer bake a separate copy of every profile. Builds use less data and stay quick, and search engines still find every public page through the sitemap. Nothing to do on your end.",

  "changelog.entries.admin-governance-real-data.title":
    "Governance dashboards now run on real data",
  "changelog.entries.admin-governance-real-data.body":
    "The admin governance area (its finance figures and quarter-by-quarter chart, the policy decision log, and the moderation audit trail) now reads live from the platform instead of placeholder numbers, so the team sees the community's real finances and moderation history.",

  "changelog.entries.sign-in-fix.title": "Signing in works again",
  "changelog.entries.sign-in-fix.body":
    "A mismatch between the app and the server was stopping sign-in from completing. That's fixed, logging in, signing out, and staying signed in all work smoothly again.",
  "changelog.entries.accessibility-mobile-polish.title":
    "Easier to tap, easier to navigate",
  "changelog.entries.accessibility-mobile-polish.body":
    "Small buttons now have bigger touch areas on phones, actions that used to appear only on hover can be reached with the keyboard, and checkout and application forms support autofill for your name and email.",
  "changelog.entries.platform-hardening.title": "Under-the-hood hardening",
  "changelog.entries.platform-hardening.body":
    "Behind the scenes: the API is now versioned with published documentation, long lists are safely bounded so pages stay fast, and reporting has spam protection. Nothing to do on your end. Things just stay quick and stable.",
  "changelog.entries.composer-reaction-polish.title":
    "A roomier message box and tidier reactions",
  "changelog.entries.composer-reaction-polish.body":
    "The message box now stretches to fill the width of the composer, and on phones it sits flush without a stray scrollbar when your message is short, growing only as you type. Reactions also behave properly now: tapping an emoji you've already reacted with removes it instead of stacking the same one over and over.",
  "changelog.entries.chat-mentions.title": "Mention people and places in chat",
  "changelog.entries.chat-mentions.body":
    "Type @ for a member, or c/ b/ e/ t/ # for a community, business, gathering, thread or topic. Pick from the suggestions and it turns into a tappable link, in a direct message or a group. Works while you're writing and while you're editing a message. Your chats stay private: mentions only link, they never notify anyone.",
  "changelog.entries.group-chats.title": "Group chats",
  "changelog.entries.group-chats.body":
    "Start a group with the people you want in it, name it, and share who's who. Admins can add or remove members and tidy up the group info, you can see who's read a message, and a typing bubble shows when someone's writing.",
  "changelog.entries.message-search.title": "Search your messages",
  "changelog.entries.message-search.body":
    "Looking for that address, that date, that thing someone said? Search across all your conversations and jump straight to it.",
  "changelog.entries.link-previews.title": "Links open up",
  "changelog.entries.link-previews.body":
    "Share a link and it unfurls into a preview card (title, image and all) so people can see where it goes before they tap.",
  "changelog.entries.forward-pin-star.title": "Forward, pin and star",
  "changelog.entries.forward-pin-star.body":
    "Pass a message along to another chat, pin the ones a group keeps coming back to, and star the ones you want to find again, starred messages stay just for you.",
  "changelog.entries.safe-space-view-page.title":
    "Preview safe spaces before verifying",
  "changelog.entries.safe-space-view-page.body":
    "The Safe spaces review tool now has a “View page” button on each listing, opening its public page in a new tab so moderators can see a space in full before marking it verified.",
  "changelog.entries.swipe-members-highlight.title":
    "Swipe through featured members",
  "changelog.entries.swipe-members-highlight.body":
    "On the homepage, the featured member card now follows your finger. Swipe left or right on your phone to move between members, and it snaps to the next one.",
  "changelog.entries.mention-names.title": "Mentions show real names",
  "changelog.entries.mention-names.body":
    "Mention a person, community or place in a chat, forum thread or community discussion and it now reads as their name, Tiago Costa, in place of the raw @tiago-costa handle. Tap it and you still land in the right place; hover to see the handle.",
  "changelog.entries.forward-to-groups.title":
    "Forward messages to your groups",
  "changelog.entries.forward-to-groups.body":
    "Forwarding now reaches your group chats as well as one-to-one messages. Long-press any message, pick Forward, and choose any group you're part of.",
  "changelog.entries.read-receipts.title": "Delivered and read receipts",
  "changelog.entries.read-receipts.body":
    "Ticks now tell the whole story: sent, delivered to their phone, and read, so you know where your message got to.",
  "changelog.entries.message-gestures.title": "Swipe to reply, tap to react",
  "changelog.entries.message-gestures.body":
    "Swipe a message sideways to reply to it, and double-tap to react, the quick gestures your thumbs already know.",
  "changelog.entries.message-drafts.title": "Your drafts wait for you",
  "changelog.entries.message-drafts.body":
    "Half a message you didn't send yet? We keep it saved for that conversation, so it's still there when you come back.",
  "changelog.entries.offline-outbox.title": "Sends that don't get lost",
  "changelog.entries.offline-outbox.body":
    "Tapped send with no signal? Your message waits in line and goes out the moment you're back online. Nothing vanishes on the way.",
  "changelog.entries.typing-indicator.title":
    "Typing bubble and screen-reader polish",
  "changelog.entries.typing-indicator.body":
    "A gentle bubble shows when the other person is writing, and a round of screen-reader work makes the whole chat easier to follow without looking.",
  "changelog.entries.moderation-actions.title":
    "Every report gets a real decision",
  "changelog.entries.moderation-actions.body":
    "Opening a report in the moderation queue now always shows the full set of actions (hide, warn, restrict, remove and more, each with a reason the member reads) instead of quietly closing it. The queue's headline also reflects the real number of reports waiting.",
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
    "The communities you pin to your profile now save for keeps, across sessions and devices, and show for everyone who visits, with your role on each.",
  "changelog.entries.mention-types.title": "More ways to mention",
  "changelog.entries.mention-types.body":
    "Mentions now reach beyond people and communities to topics, businesses, events and threads, owners and stewards get notified when they're tagged.",
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
    "Type @ to tag a member or c/ to link a community in forum and community replies, anyone you mention gets a notification.",
  "changelog.entries.push-notifications.title":
    "Push notifications for messages",
  "changelog.entries.push-notifications.body":
    "Opt in to get a phone notification when a new direct message arrives while you're away, private, direct-messages-only, and off by default.",
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
    "Create multiple public presences under one account, for your art, your business, or a project.",
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
    "The first release, the community mega-navigation and the core set of pages went live.",
  "changelog.empty.title": "Nothing logged under that filter yet",
  "changelog.empty.description":
    "No changes of this kind have shipped so far. Clear the filter to see the full history.",
  "changelog.empty.clearCta": "Clear filters",

  // ── Roadmap — page chrome. Shipped/building/planned items, top ideas and
  //    vote counts are the live backlog — left English; see the sweep
  //    report.
  "roadmap.meta.title": "The QueerPulse roadmap: shipped, building, planned",
  "roadmap.meta.description":
    "See what QueerPulse has shipped, what a small Lisbon team is building right now, and what's planned next, plus how to submit and vote on ideas.",
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
  "roadmap.card.slipNote": "Moved {from} → {to}, {reason}",
  "roadmap.card.plannedFeatures": "Planned features",
  "roadmap.shape.title": "Have an <em>idea?</em>",
  "roadmap.shape.sub":
    "We read every suggestion. The most-voted ideas move up the roadmap.",
  "roadmap.submitIdea.title": "Submit an idea",
  "roadmap.submitIdea.ariaLabel": "Your idea",
  "roadmap.submitIdea.placeholder":
    "What would make QueerPulse better for you?",
  "roadmap.submitIdea.cta": "Submit idea",
  "roadmap.submitIdea.toast.empty": "Write a few words first",
  "roadmap.submitIdea.toast.submitted": "Thanks, sent to the team for review",
  "roadmap.submitIdea.toast.error": "Couldn't submit your idea. Try again",
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
    "No date here, because a date would be a promise we can't keep yet. Still on our radar, vote to help one rise.",
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
    "Every release, dated, what we've shipped so far.",

  // ── Press Archive — page chrome. Coverage headlines/sources/authors are
  //    real third-party press pieces (someone else's words) and stay
  //    English, same precedent as the Press Kit coverage section.
  "pressArchive.hero.backLabel": "Press Kit",
  "pressArchive.meta.title":
    "QueerPulse press archive: everything written about us",
  "pressArchive.meta.description":
    "Coverage of QueerPulse in third-party publications, indexed by year, including the critiques we disagreed with.",
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
  "pressArchive.endOfArchive": "That's the whole archive, 2022 to today.",
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
    "Browse QueerPulse volunteer opportunities by cause (rights, health, youth, housing, arts) and by time commitment, or post one for your own organisation.",
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
    "Our guide to organising better walks you from showing up once to bringing a skill, no experience needed.",
  "volunteer.guide.cta": "Read the activism guide",
  "volunteer.empty.noneTitle": "No opportunities posted yet",
  "volunteer.empty.noneDescription":
    "No organisations have posted roles here yet. If yours is looking for hands, be the first to put out the call.",
  "volunteer.empty.noneCta": "Post an opportunity",
  "volunteer.empty.filteredTitle": "No opportunities match those filters yet",
  "volunteer.empty.filteredDescription":
    "Try widening your search. There are plenty of ways to give your time, and new roles are added often.",
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
    "No-one's signed up yet. The first person will show up here.",
  "volunteer.signups.signedUp": "Signed up {when}",
  "volunteer.signups.closedTag": "This opportunity is closed",
  "volunteer.signups.closing": "Closing…",
  "volunteer.signups.closeCta": "Close opportunity",
  "volunteer.signups.reviewCta": "{count} to review",

  // ── The volunteer's own confirmed contribution (SUS-05). Sessions and hours
  // a poster confirmed, never self-declared.
  "volunteer.contribution.title": "What you've contributed",
  "volunteer.contribution.loading": "Loading your volunteering…",
  "volunteer.contribution.sessions": "confirmed sessions",
  "volunteer.contribution.hours": "hours contributed",
  "volunteer.contribution.lastOne": "Most recent confirmed session: {when}",
  "volunteer.contribution.awaiting_one":
    "1 accepted signup is waiting for the poster to confirm the session.",
  "volunteer.contribution.awaiting_other":
    "{count} accepted signups are waiting for the poster to confirm the session.",
  "volunteer.contribution.empty":
    "Nothing confirmed yet. Once a poster records a session you turned up for, the hours land here.",
  "volunteer.contribution.note":
    "Hours are confirmed by whoever posted the opportunity, so this is a record someone else stands behind.",
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
  "volunteer.hero.manageCta": "Manage applicants",
  "volunteerManage.title": "Manage applicants",
  "volunteerManage.sub":
    "Review and decide on people who signed up for opportunities you posted, or that a community you organise posted.",
  "volunteerManage.loading": "Loading your opportunities…",
  "volunteerManage.empty":
    "You haven't posted any volunteer opportunities yet, and neither have the communities you organise.",
  "volunteerManage.loadingApplicants": "Loading applicants…",
  "volunteerManage.noApplicants": "No one has applied yet.",
  "volunteerManage.pendingCount": "{count} pending",
  "volunteerManage.status.pending": "Pending",
  "volunteerManage.status.accepted": "Accepted",
  "volunteerManage.status.declined": "Declined",
  "volunteerManage.accept": "Accept",
  "volunteerManage.decline": "Decline",

  // ── Volunteer session completion (SUS-05). The poster records what actually
  // happened, so hours are attested by someone other than the volunteer. No
  // copy here promises the volunteer a message: nothing sends one.
  "volunteerManage.completion.title": "Record the session",
  "volunteerManage.completion.attendedLabel": "Did they turn up?",
  "volunteerManage.completion.attendedYes": "They turned up",
  "volunteerManage.completion.attendedNo": "They did not turn up",
  "volunteerManage.completion.hoursLabel": "Hours contributed",
  "volunteerManage.completion.hoursHelper":
    "Up to 24 for one session. Quarter hours are fine.",
  "volunteerManage.completion.confirm": "Confirm session",
  "volunteerManage.completion.confirming": "Confirming…",
  "volunteerManage.completion.why":
    "Confirmed hours count towards the volunteer hours QueerPulse can report, and towards this member's recognition.",
  "volunteerManage.completion.error":
    "That didn't save. Check your connection and try again.",
  "volunteerManage.completion.alreadyDone":
    "This session was already confirmed.",
  "volunteerManage.completion.confirmedHours": "Confirmed: {hours} h on {when}",
  "volunteerManage.completion.confirmedNoShow":
    "Recorded as a no-show on {when}",

  // ── Post a Volunteer Opportunity — form chrome (all platform UI).
  "postOpportunity.hero.eyebrow": "Volunteer · Post a role",
  "postOpportunity.hero.title": "Post an <em>opportunity.</em>",
  "postOpportunity.hero.sub":
    "Looking for people to give their time? Describe the role honestly (the hours, the commitment, who it's good for) and it goes live on the volunteer board straight away.",
  "postOpportunity.toast.error":
    "Couldn't post your opportunity. Please try again.",
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
    "The best roles name the person they need: their temperament as much as their CV. It helps the right people self-select in.",
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
    "A regular shift and a minimum term, consistency matters.",
  "postOpportunity.core.basicsHeading": "The basics",
  "postOpportunity.core.orgLabel": "Organisation",
  "postOpportunity.core.orgHelper":
    "Pick a community you own or moderate, or an approved partner org.",
  "postOpportunity.core.orgEmptyState":
    "You'll need to own or moderate a community, or be an approved partner, before you can post an opportunity on their behalf.",
  "postOpportunity.core.orgPlaceholder": "e.g. your organisation",
  "postOpportunity.core.orgLinkLabel": "Link to an organisation",
  "postOpportunity.core.orgLinkHelper":
    "Optional: attach this post to a community you own or moderate, or an approved partner.",
  "postOpportunity.core.orgLinkNone": "None",
  "postOpportunity.core.orgLinkGroupPartner": "Partners",
  "postOpportunity.core.orgLinkGroupCommunity": "My communities",
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
    "Comma-separated, shown as hashtags on the card. Up to {maxCount}, {maxLength} characters each.",
  "postOpportunity.core.skillsPlaceholder":
    "Communication, Languages, Event support",
  "postOpportunity.edit.eyebrow": "Volunteer · Edit",
  "postOpportunity.edit.title": "Edit this <em>opportunity.</em>",
  "postOpportunity.edit.sub":
    "Update the details volunteers see on the listing.",
  "postOpportunity.edit.saveCta": "Save changes",
  "postOpportunity.edit.saving": "Saving…",
  "postOpportunity.edit.cancelCta": "Cancel",
  "postOpportunity.edit.successToast": "Your changes are saved.",
  "postOpportunity.edit.errorToast":
    "Couldn't save your changes. Please try again.",
  "postOpportunity.edit.notAllowed":
    "You can only edit an opportunity you posted.",
  "postOpportunity.rich.summary": "Add more detail (optional)",
  "postOpportunity.rich.whyHeading": "Why it matters",
  "postOpportunity.rich.whyLabel": "Why this role matters",
  "postOpportunity.rich.whyHelper":
    "One paragraph per line. Up to {maxCount} paragraphs, {maxLength} characters each.",
  "postOpportunity.rich.whyPlaceholder":
    "What changes because someone shows up for this.",
  "postOpportunity.rich.goodForLabel": "Who's good for this",
  "postOpportunity.rich.goodForHelper":
    "One paragraph per line. Up to {maxCount} paragraphs, {maxLength} characters each.",
  "postOpportunity.rich.goodForPlaceholder":
    "The temperament and skills that fit, as much as the CV.",
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
    "Pick from your connections or the communities you belong to.",
  "postOpportunity.rich.teamPlaceholder": "Select connections or communities",
  "postOpportunity.rich.teamGroupConnections": "Connections",
  "postOpportunity.rich.teamGroupCommunities": "Communities",
  "postOpportunity.rich.teamEmpty":
    "Connect with people or join a community to add them here.",
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
  "volunteerDetail.meta.title":
    "{role} with {org}: volunteer through QueerPulse",
  "volunteerDetail.meta.loadingTitle": "Loading a volunteer role · QueerPulse",
  "volunteerDetail.error.alreadySignedUp":
    "You've already signed up for this role.",
  "volunteerDetail.error.full":
    "This opportunity just filled up, every spot is taken.",
  "volunteerDetail.error.alreadyOrFull":
    "You've already signed up, or this opportunity is now full.",
  "volunteerDetail.error.generic":
    "Something went wrong sending your interest. Please try again.",
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
  "volunteerDetail.sidebar.communityLabel": "Organised with",
  "volunteerDetail.sidebar.communityLink": "About this community",
  "volunteerDetail.sidebar.editCta": "Edit this opportunity",
  "volunteerDetail.sidebar.notRightFit": "Not the right fit?",
  "volunteerDetail.sidebar.otherWays": "Other ways to help right now:",
  "volunteerDetail.sidebar.fundInstead": "Fund this work instead",
  "volunteerDetail.signupModal.ariaLabel": "Apply to volunteer for {role}",
  "volunteerDetail.signupModal.eyebrow": "Your application",
  "volunteerDetail.signupModal.title": "Tell us why you'd be a good fit",
  "volunteerDetail.signupModal.sub":
    "A few sentences is plenty. The team reads every application.",
  "volunteerDetail.signupModal.noteLabel":
    "Why do you want to volunteer for this role?",
  "volunteerDetail.signupModal.notePlaceholder":
    "Share what draws you to this, or any relevant experience…",
  "volunteerDetail.signupModal.cancel": "Cancel",
  "volunteerDetail.signupModal.submit": "Send application",
  "volunteerDetail.signupModal.sending": "Sending…",

  // ── Partner Detail — page chrome. About/joint-work/timeline/how-we-work
  //    copy, stats, and contact details are each partner org's own content
  //    (partnerDetails.dataA/B.tsx) — left English, same precedent as the
  //    Partners listing page.
  "partnerDetail.loadError":
    "We couldn't load this partner just now. Please try again.",
  "partnerDetail.backCta": "All partners",
  "partnerDetail.meta.title": "{name}: a QueerPulse partner organisation",
  "partnerDetail.meta.loadingTitle": "Loading a partner · QueerPulse",
  "partnerDetail.meta.errorTitle": "Partner unavailable · QueerPulse",
  "partnerDetail.tab.about": "About",
  "partnerDetail.tab.work": "Joint work",
  "partnerDetail.tab.timeline": "Timeline",
  "partnerDetail.tab.how": "How we work together",
  "partnerDetail.sidebar.atGlance": "At a glance",
  "partnerDetail.sidebar.contactDirectly": "Contact {name} directly",
  "partnerDetail.sidebar.becomeTitle": "Become a partner",
  "partnerDetail.sidebar.becomeBody":
    "Are you an org that ought to be operationally connected to QueerPulse? We're small and slow about this, write to us.",
  "partnerDetail.sidebar.becomeCta": "Get in touch",

  // ── Contact — page chrome. All platform-authored form/routing copy.
  "contact.meta.title": "Contact QueerPulse: general, safety, press, partners",
  "contact.meta.description":
    "Get in touch with QueerPulse, a small team that reads and answers every message itself. Routes for general questions, safety concerns, press, and partnerships.",
  "contact.eyebrow": "We read everything",
  "contact.hero.title": "Get in <em>touch.</em>",
  "contact.hero.body":
    "We're a small team and we respond to messages ourselves, person to person. Pick the route that makes the most sense for what you need to say.",
  "contact.routes.cta": "Write to us",
  "contact.routes.general.title": "General hello",
  "contact.routes.general.desc":
    "Anything that doesn't fit elsewhere, questions, feedback, introductions, ideas you think we should hear about.",
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
    "We haven't connected this form to our inbox yet, so it can't send your message. Nothing was submitted. Email us directly instead; every address on the left is real and read by a person.",
  "contact.comingSoon.emailCta": "Email hello@queerpulse.com",
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
  "contact.form.topic.account": "Account access or security",
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
  "forOrgs.meta.title": "Partner with QueerPulse: operational partnerships",
  "forOrgs.meta.description":
    "How organisations can partner with QueerPulse through operational collaborations built on shared work, and how the process starts.",
  "forOrgs.hero.eyebrow": "For organisations · partnerships",
  "forOrgs.hero.title": "Work <em>with us,</em> not <em>at us.</em>",
  "forOrgs.hero.dek":
    "QueerPulse partnerships are <b>operational and hands-on</b>. We don't sell access, run sponsored content, or do co-branding for its own sake. <em>We build seams between organisations that already do the work.</em> Below: what those seams look like, who we already work with, and how to start a conversation.",
  "forOrgs.hero.notDoTitle": "What we don't do",
  "forOrgs.notDo.prideCampaigns":
    "<b>Pride-month campaigns.</b> We never run them, in June or any month. Members would (rightly) leave.",
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
    "Coffee in Lisbon if you're here, or video. We talk through how the seam would work in practice.",
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
    "For organisations that should be operationally connected to QueerPulse, legal-aid organisations, health services, civic-service agencies, allied associations. We build infrastructure together.",
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
    "For foundations, public agencies, and grant-making organisations funding a specific programme, micro-grants, the magazine, safe spaces, trans-health access.",
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
    'Tell us about your organisation in a paragraph. We read every message within 5 working days and reply personally, even if the answer is "this isn\'t right for us right now."',
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
    "Thanks. We've got your message. Our partnerships team reads every one and replies personally within 5 working days.",
  "forOrgs.form.error":
    "Something went wrong sending that. Please try again, or email the partnerships team directly.",
  "forOrgs.form.small":
    "Goes directly to our partnerships team. No sales funnel, no follow-up sequence. Just a reply within 5 working days.",
  "forOrgs.form.toast":
    "Sent to our partnerships team. They'll reply within 5 working days",
  "forOrgs.form.comingSoon.title": "This form isn't <em>wired up yet.</em>",
  "forOrgs.form.comingSoon.body":
    "We haven't connected the partnerships form yet, so it can't send your details. Nothing was submitted. Email the partnerships team directly and we'll take it from there.",
  "forOrgs.form.comingSoon.emailCta": "Email hello@queerpulse.com",

  // ── Directory — business directory + detail page chrome. Place records
  //    (`directoryPlaces.ts`: names, taglines, reviews, owner bios) are each
  //    business's own content — left English, same precedent as mock member
  //    bios/reviews elsewhere.
  "directory.meta.title": "Local Business directory | QueerPulse",
  "directory.meta.description":
    "Queer-owned businesses and queer-friendly professionals in Lisbon, vetted and maintained by the community.",
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
  "directory.loadingMore": "Loading more places…",
  "directory.count": "Showing <b>{shown}</b> of {total} places",
  "directory.empty.title": "No places match those filters",
  "directory.empty.body":
    "Try a broader category, fewer vibes, or a different search, or clear the filters to see everything.",
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
  "directory.badge.queerOwnedVerified": "Verified queer-owned",
  "directory.badge.queerOwned": "Queer-owned",
  "directory.badge.friendly": "LGBTQ+ friendly",
  "directory.card.memberRun": "Member-run",
  "directory.card.online": "Online",
  "directory.card.visit": "Visit",
  "directory.card.verifiedBadge": "Verified safe space",
  // The safe-space mark on a card, in the two states that are not a plain
  // "verified". Both are statements about the BADGE. A card in a public grid
  // is the last place to imply something about a real business on a real
  // street that nobody has concluded yet.
  "directory.card.safeSpaceDueBadge":
    "Verified safe space, due for its yearly check",
  "directory.card.safeSpacePausedBadge":
    "Safe-space badge paused while we take another look",
  "directory.card.photoComing": "Photo coming",
  "directory.card.openTill": "Open till {time}",
  "directory.card.closedNow": "Closed",
  "directory.card.openNow": "Open now",
  "directory.card.closingSoon": "Closes at {time}",
  "directory.card.state.temporarily_closed": "Temporarily closed",
  "directory.card.state.permanently_closed": "Permanently closed",
  "directory.card.state.moved": "Moved",
  "directory.card.saveAriaLabel": "Save {name}",
  "directory.card.unsaveAriaLabel": "Remove {name} from saved",
  // The needs a listing has answered YES to, shown on its grid card. Never a
  // complete account: a "no" and a "nobody has told us" are different answers
  // that both need the room the listing page gives them.
  "directory.card.access": "Accessibility this place has confirmed",
  "directory.card.accessMore_one": "{count} more",
  "directory.card.accessMore_other": "{count} more",
  "directory.card.savedToast": "Saved {name}",
  "directory.card.unsavedToast": "Removed {name} from saved",
  "directory.submitStrip.title": "Know a place worth <em>adding?</em>",
  "directory.submitStrip.body":
    "If you run or know a queer-owned or queer-friendly business in Lisbon that belongs in this directory, tell us. We review every suggestion before it goes live.",
  "directory.submitStrip.cta": "List your business",
  "directory.verify.eyebrow": "Community verified",
  "directory.verify.title": "How verification <em>works.</em>",
  "directory.verify.lead":
    "The verified badge isn't self-declared. A member puts a space forward, others visit and review it against a fixed set of criteria, and every listing is re-checked each year, so a space can lose it, too.",
  "directory.verify.cta": "See the full trust story",
  "directory.verify.pillar.nominate.title": "Member-nominated",
  "directory.verify.pillar.nominate.body":
    "Any member can put a space forward for review.",
  "directory.verify.pillar.review.title": "Independently reviewed",
  "directory.verify.pillar.review.body":
    "Verified members visit and assess it against the same criteria, bathrooms, staff, accessibility, and real reviews.",
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
  "directory.detail.badge.owned": "Queer-owned",
  "directory.detail.badge.friendly": "LGBTQ+ friendly",
  "directory.detail.reviewsCount": "· {count} reviews",
  "directory.detail.newBadge": "New",
  "directory.detail.onlineBusiness": "Online only",
  "directory.detail.whatItIsTitle": "What it <em>actually is.</em>",
  "directory.detail.offersTitle": "What this place <em>offers</em>",
  "directory.detail.goodForSub": "As {name} describes it.",
  "directory.detail.hoursTitle": "Hours",
  "directory.detail.today": "Today",
  "directory.detail.hoursClosed": "Closed",
  "directory.detail.openNow": "Open now",
  "directory.detail.closedNow": "Closed",
  "directory.detail.closingSoon": "Closing at {time}",
  "directory.detail.formerAddress": "Former address",
  "directory.detail.operating.temporarily_closed.title": "Temporarily closed",
  "directory.detail.operating.temporarily_closed.lead":
    "This place is not open at the moment. The hours below are its usual ones, for when it comes back.",
  "directory.detail.operating.temporarily_closed.since": "Closed since {date}",
  "directory.detail.operating.temporarily_closed.chip": "Temporarily closed",
  "directory.detail.operating.temporarily_closed.hoursNote":
    "These are the usual hours. They are on hold while the place is closed.",
  "directory.detail.operating.permanently_closed.title": "Permanently closed",
  "directory.detail.operating.permanently_closed.lead":
    "This business has closed for good. Its page stays here so the reviews, photos and history members built around it are kept.",
  "directory.detail.operating.permanently_closed.since": "Closed on {date}",
  "directory.detail.operating.moved.title": "This business has moved",
  "directory.detail.operating.moved.lead":
    "It no longer trades at the address on this page.",
  "directory.detail.operating.moved.since": "Moved on {date}",
  "directory.detail.operating.moved.newAddress": "New address: {address}",
  "directory.detail.operating.moved.seeSuccessor": "See the listing for {name}",
  "directory.detail.exceptions.title": "Upcoming changes",
  "directory.detail.freshness.confirmedBy":
    "Details confirmed by {name} on {date}",
  "directory.detail.freshness.confirmed": "Details confirmed on {date}",
  "directory.detail.freshness.staleBy":
    "{name} last confirmed these details on {date}. They may have changed since.",
  "directory.detail.freshness.stale":
    "These details were last confirmed on {date}. They may have changed since.",
  "directory.detail.freshness.unconfirmed":
    "Nobody has confirmed these details yet. Worth a quick check before you travel.",
  "directory.detail.reviewsTitle": "Member reviews · <em>{count}</em>",
  "directory.detail.reviews.emptySub":
    "No reviews yet. Be the first to leave one.",
  "directory.detail.ratingBreakdown": "Rating breakdown",
  "directory.detail.starsCount": "{stars} stars, {count} reviews",
  "directory.detail.review.formTitle": "Been here? Leave a review",
  "directory.detail.review.starsAria": "Your rating",
  "directory.detail.review.starAria": "{count} out of 5 stars",
  "directory.detail.review.placeholder":
    "Share what your visit was like, what worked, and who it's for.",
  "directory.detail.review.starsRequiredHint":
    "Pick a star rating to unlock the button.",
  "directory.detail.review.submit": "Post review",
  "directory.detail.review.submitting": "Posting…",
  "directory.detail.review.successToast": "Thanks. Your review is up.",
  "directory.detail.review.errorToast":
    "Couldn't post your review. Please try again.",
  "directory.detail.review.signInPrompt":
    "Sign in to leave a review of this space.",
  "directory.detail.review.signInCta": "Sign in",
  "directory.detail.review.cancel": "Cancel",
  "directory.detail.review.editCta": "Edit",
  "directory.detail.review.editTitle": "Edit your review",
  "directory.detail.review.saveEdit": "Save changes",
  "directory.detail.review.savingEdit": "Saving…",
  "directory.detail.review.editSuccessToast": "Your review is updated.",
  "directory.detail.review.editErrorToast":
    "Couldn't save your changes. Please try again.",
  "directory.detail.review.photo.add": "Add a photo",
  "directory.detail.review.photo.change": "Change photo",
  "directory.detail.review.photo.remove": "Remove",
  "directory.detail.review.photo.uploading": "Uploading…",
  "directory.detail.review.photo.error":
    "Couldn't upload that photo. Please try again.",
  "directory.detail.review.photo.previewAlt":
    "The photo you are attaching to this review",
  "directory.detail.reply.ownerResponseTitle": "Response from the owner",
  "directory.detail.reply.replyCta": "Reply",
  "directory.detail.reply.editReplyCta": "Edit reply",
  "directory.detail.reply.editedAfterReply":
    "This review was edited after this reply was posted.",
  "directory.detail.reply.placeholder": "Write a public reply to this review…",
  "directory.detail.reply.save": "Save reply",
  "directory.detail.reply.cancel": "Cancel",
  "directory.detail.reply.savingLabel": "Saving…",
  "directory.detail.reply.successToast": "Your reply is up.",
  "directory.detail.reply.errorToast":
    "Couldn't post your reply. Please try again.",
  "directory.detail.reviews.sortLabel": "Sort",
  "directory.detail.reviews.sortNewest": "Newest first",
  "directory.detail.reviews.sortHighest": "Highest rated",
  "directory.detail.reviews.sortLowest": "Lowest rated",
  "directory.detail.reviews.sortedByNewest": "Newest first.",
  "directory.detail.reviews.sortedByHighest": "Sorted by highest rated.",
  "directory.detail.reviews.sortedByLowest": "Sorted by lowest rated.",
  "directory.detail.reviews.filterAria": "Filter reviews by star rating",
  "directory.detail.reviews.filterAll": "All ratings",
  "directory.detail.reviews.filterStars_one": "{count} star",
  "directory.detail.reviews.filterStars_other": "{count} stars",
  "directory.detail.reviews.edited": "edited",
  "directory.detail.reviews.helpfulCta": "Helpful",
  "directory.detail.reviews.helpfulAria_one":
    "Helpful. {count} member has marked this review helpful.",
  "directory.detail.reviews.helpfulAria_other":
    "Helpful. {count} members have marked this review helpful.",
  "directory.detail.reviews.helpfulSignIn":
    "Sign in to mark this review helpful",
  "directory.detail.reviews.helpfulError":
    "Couldn't record that. Please try again.",
  "directory.detail.reviews.photoAlt": "Photo from {name}'s review",
  "directory.detail.reviews.photoOpen": "Open the photo from {name}'s review",
  "directory.detail.reviews.sortHelpful": "Most helpful",
  "directory.detail.reviews.sortedByHelpful": "Sorted by most helpful.",
  "directory.detail.reviews.sortOldest": "Oldest first",
  "directory.detail.reviews.sortedByOldest": "Oldest first.",
  "directory.detail.reviews.filterContentAria":
    "Filter reviews by what they include",
  "directory.detail.reviews.filterPhotos": "With photos",
  "directory.detail.reviews.filterReply": "Owner replied",
  "directory.detail.reviews.noMatchingReviews":
    "No reviews match these filters yet.",
  "directory.detail.reviews.clearFilters": "Clear filters",
  "directory.detail.reviews.noStarReviews": "No {count}-star reviews yet.",
  "directory.detail.reviews.ratingAria": "Rated {count} out of 5 stars",
  "directory.detail.reviews.readMore": "Read more",
  "directory.detail.reviews.showLess": "Show less",
  "directory.detail.visitTitle": "Where it is",
  "directory.detail.accessTitle": "Getting in, and being understood",
  "directory.detail.accessSub":
    "As {name} declared it. Ask if you need to be sure.",

  // ── Structured accessibility answers. Three states, and all three are
  //    information: `unknown` is never rendered as a "no" and never dropped.
  "directory.detail.accessibility.noteLabel": "In the owner's words",
  "directory.detail.accessibility.noteLabelNamed": "In {name}'s words",
  "directory.detail.accessibility.unansweredLine_one":
    "One question has still to be answered. Nobody has told us either way, so ask before you go if it matters to you.",
  "directory.detail.accessibility.unansweredLine_other":
    "{count} questions have still to be answered. Nobody has told us either way, so ask before you go if any of them matter to you.",

  // ── Priced services. The header's price band stays the at-a-glance signal;
  //    this says what that band buys.
  "directory.detail.services.title": "What it <em>costs.</em>",
  "directory.detail.services.sub":
    "Prices as the business wrote them. Ask if you need a quote for something specific.",
  "directory.detail.services.subNamed":
    "Prices as {name} wrote them. Ask if you need a quote for something specific.",

  // ── Evidence behind the verified queer-owned badge, phrased as the sibling
  //    of the safe-space block's own verifier + re-checked date line.
  "directory.detail.queerOwned.byOnDate":
    "Queer-owned, confirmed by <strong>{verifier}</strong> on <strong>{date}</strong>.",
  "directory.detail.queerOwned.by":
    "Queer-owned, confirmed by <strong>{verifier}</strong>.",
  "directory.detail.queerOwned.onDate":
    "Queer-owned, last confirmed on <strong>{date}</strong>.",
  "directory.detail.queerOwned.nextCheck": "Due for another check by {date}.",

  // ── The affirming baseline, STATED. Every listing here agreed to it, so
  //    this is a fact about the directory. Never a per-listing badge and never
  //    a browse filter: either would make a baseline look like an option.
  "directory.detail.baseline.lead":
    "Every business here has agreed to welcome and <em>serve LGBTQ+ people.</em>",
  "directory.detail.baseline.condition":
    "Agreeing to it is the condition of being listed here at all. Every business in the directory has made the same commitment, so you will not find it flagged on some pages and missing from others.",
  "directory.detail.baseline.scope":
    "The commitment is about how a business treats the people it serves, and about stepping in when someone in the space falls short. It gives nobody permission to turn a person away over who they are.",
  "directory.detail.nearby.title": "Within a short walk",
  "directory.detail.nearby.sub":
    "Other places you could add to the same evening, measured from {name}.",
  "directory.detail.nearby.metres": "{distance} m",
  "directory.detail.nearby.kilometres": "{distance} km",
  "directory.detail.visitWebsite": "Visit website",
  "directory.detail.getInTouch": "Get in touch",
  "directory.detail.backToDirectory": "Back to directory",
  "directory.detail.claimCta": "Do you run this place? Claim it",
  "directory.detail.loader.ariaLabel": "Opening this place",
  "directory.detail.loader.title": "Opening this place",
  "directory.detail.loader.caption": "Worth seeing it all at once.",
  "directory.detail.loader.steps.fetchingListing": "Finding the listing",
  "directory.detail.loader.steps.preparingDetails": "Laying out the details",
  "directory.detail.loader.steps.loadingPhotos": "Bringing in the photos",
  "directory.detail.notFound.title": "We couldn't find this place",
  "directory.detail.notFound.body":
    "This listing may have been taken down, or the link might be out of date. Everywhere else that's open to us is still in the directory.",
  "directory.detail.notFound.cta": "Browse the directory",
  "directory.detail.reportCta": "Report this listing",
  "directory.detail.reportAriaLabel": "Report {name}",
  "directory.detail.reportReview.cta": "Report",
  "directory.detail.reportReview.title": "Report this review",
  "directory.detail.reportReview.sub":
    "Tell us what's wrong with {name}'s review. A moderator reviews every report, and they won't be told who filed it.",
  "directory.detail.reportReview.reasonGroupAria": "Reason for reporting",
  "directory.detail.reportReview.cancel": "Cancel",
  "directory.detail.reportReview.sendCta": "Send report",
  "directory.detail.reportReview.sending": "Sending…",
  "directory.detail.reportReview.confirmTitle": "Thanks. We're <em>on it.</em>",
  "directory.detail.reportReview.confirmBody":
    "A moderator will look into this review.",
  "directory.detail.reportReview.done": "Done",
  "directory.detail.reportReview.errorTitle": "Couldn't send that report",
  "directory.detail.reportReview.errorBody":
    "Something went wrong on our end. Please try again.",
  "directory.detail.reportReview.retryCta": "Try again",
  "directory.detail.reportQuestion.title": "Report this question",
  "directory.detail.reportQuestion.sub":
    "Tell us what's wrong with {name}'s question. A moderator reviews every report, and they won't be told who filed it.",
  "directory.detail.questions.title": "Ask the owner, <em>in public</em>",
  "directory.detail.questions.sub_one": "{count} question, newest first.",
  "directory.detail.questions.sub_other": "{count} questions, newest first.",
  "directory.detail.questions.emptySub": "Nobody has asked anything here yet.",
  "directory.detail.questions.emptyBody":
    "Ask the first question. Anything you would want to know before you go: how to get in, what the room is like, whether the kitchen is still open at ten.",
  "directory.detail.questions.askLabel": "Ask something in public",
  "directory.detail.questions.askPlaceholder":
    "What would you want to know before you go?",
  "directory.detail.questions.askHint":
    "Everyone reading this listing can see your question and the answer.",
  "directory.detail.questions.askCta": "Ask",
  "directory.detail.questions.asking": "Sending…",
  "directory.detail.questions.successToast": "Your question is up.",
  "directory.detail.questions.errorGeneric":
    "Couldn't send your question. Please try again.",
  "directory.detail.questions.signInPrompt":
    "Sign in to ask this space a question.",
  "directory.detail.questions.signInCta": "Sign in",
  "directory.detail.questions.ownerNote":
    "This is your listing. Answer any question below and your reply shows up here for everyone.",
  "directory.detail.questions.awaitingAnswer": "No answer yet.",
  "directory.detail.questions.answeredByOwner": "{name} answered",
  "directory.detail.questions.answeredByModerator": "QueerPulse moderator",
  "directory.detail.questions.moderatorNote":
    "A QueerPulse moderator wrote this answer. The business has stayed quiet here so far.",
  "directory.detail.questions.answerCta": "Answer",
  "directory.detail.questions.editAnswerCta": "Edit answer",
  "directory.detail.questions.answerPlaceholder":
    "Answer this question in public…",
  "directory.detail.questions.answerSave": "Post answer",
  "directory.detail.questions.answerSaving": "Posting…",
  "directory.detail.questions.answerCancel": "Cancel",
  "directory.detail.questions.answerSuccessToast": "Your answer is up.",
  "directory.detail.questions.answerErrorToast":
    "Couldn't post your answer. Please try again.",
  "directory.detail.questions.cardAria": "Question from {name}",
  "directory.detail.questions.seeAll": "See all questions",
  "directory.detail.questions.loadMore": "Load more questions",
  "directory.detail.questions.loadingMore": "Loading…",
  "directory.detail.questions.loadError":
    "Couldn't load the rest of the questions. Please try again.",
  "directory.detail.suggestEdit.cta": "Suggest an edit",
  "directory.detail.suggestEdit.ariaLabel": "Suggest an edit for {name}",
  "directory.detail.suggestEdit.title": "Suggest an edit",
  "directory.detail.suggestEdit.sub":
    "Spot something off? Let the owner know what to fix. Only the owner sees it.",
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
    "Thanks. We'll pass it along to the owner.",
  "directory.detail.suggestEdit.errorToast":
    "Couldn't send your suggestion. Please try again.",
  // The optional typed replacement value. `other` maps to no listing column,
  // so it takes prose only and the input is never offered for it.
  "directory.detail.suggestEdit.value.optional": "(optional)",
  "directory.detail.suggestEdit.value.hint":
    "Leave it blank if you only know something is off. The note on its own is still useful.",
  "directory.detail.suggestEdit.value.rejected":
    "That value wasn't accepted: {reason}",
  "directory.detail.suggestEdit.value.proseOnly":
    "For anything else, describe the correction in the note above. This one takes no replacement value.",
  "directory.detail.suggestEdit.value.hours.label":
    "What should the hours say instead?",
  "directory.detail.suggestEdit.value.hours.placeholder":
    "Tue to Sun, 12:00 to 23:00. Closed Mondays.",
  "directory.detail.suggestEdit.value.address.label":
    "What is the right address?",
  "directory.detail.suggestEdit.value.address.placeholder":
    "Rua da Prata 42, 1100-052 Lisboa",
  "directory.detail.suggestEdit.value.phone.label":
    "What is the right phone number?",
  "directory.detail.suggestEdit.value.phone.placeholder": "+351 21 000 0000",
  "directory.detail.suggestEdit.value.website.label":
    "What is the right website?",
  "directory.detail.suggestEdit.value.website.placeholder":
    "https://example.pt",
  "directory.detail.suggestEdit.value.description.label":
    "What should the description say instead?",
  "directory.detail.suggestEdit.value.description.placeholder":
    "One line on what the place is.",
  "directory.detail.contest.cta": "Suggest an edit or claim this listing",
  "directory.detail.contest.ariaLabel": "Suggest an edit or claim {name}",
  "directory.detail.contest.title": "Suggest an edit or claim this listing",
  "directory.detail.contest.sub":
    "How would you like to help keep {name}'s entry accurate?",
  "directory.detail.contest.suggest.title": "Suggest an edit",
  "directory.detail.contest.suggest.desc":
    "Something's outdated or wrong, send a correction to the owner.",
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
    "A place can be tagged as ours without its knowledge. Tell us what's wrong. A moderator reviews every dispute, and nothing you write is shared publicly.",
  "directory.detail.dispute.reasonLabel": "What's the problem?",
  "directory.detail.dispute.reasonPlaceholder":
    "e.g. We run this venue and were never asked to be listed, or this information is wrong.",
  "directory.detail.dispute.emailLabel": "Contact email",
  "directory.detail.dispute.emailHelper":
    "Optional. Add one if a moderator should reach you outside QueerPulse.",
  "directory.detail.dispute.emailPlaceholder": "you@example.com",
  "directory.detail.dispute.emailError": "Enter a valid email address.",
  "directory.detail.dispute.note":
    "Filing a dispute doesn't remove the listing on its own. A moderator looks into it first.",
  "directory.detail.dispute.cancel": "Cancel",
  "directory.detail.dispute.submit": "Send to moderators",
  "directory.detail.dispute.submitting": "Sending…",
  "directory.detail.dispute.errorToast":
    "Couldn't file your dispute. Please try again.",
  "directory.detail.dispute.successAriaLabel": "Dispute received",
  "directory.detail.dispute.successTitle": "Thanks. We're",
  "directory.detail.dispute.successEm": "on it.",
  "directory.detail.dispute.successBody":
    "A moderator will review your report about {name}. If you left an email, we'll use it only if we need to follow up.",
  "directory.detail.dispute.doneCta": "Done",
  "directory.detail.claim.ariaLabel": "Claim {name}",
  "directory.detail.claim.eyebrow": "Claim this listing",
  "directory.detail.claim.title": "You run <em>{name}</em>?",
  "directory.detail.claim.sub":
    "Tell us a bit about yourself and a moderator will review your request. If it checks out, you'll take over the listing: its reviews, its details, everything.",
  "directory.detail.claim.noteLabel": "Anything that helps us verify you",
  "directory.detail.claim.notePlaceholder":
    "e.g. I'm the owner, here's how you can reach me to confirm.",
  "directory.detail.claim.note":
    "Claiming doesn't hand over the listing on its own. A moderator reviews every request first.",
  "directory.detail.claim.cancel": "Cancel",
  "directory.detail.claim.submit": "Send to moderators",
  "directory.detail.claim.submitting": "Sending…",
  "directory.detail.claim.errorToast":
    "Couldn't send your claim. Please try again.",
  "directory.detail.claim.successAriaLabel": "Claim received",
  "directory.detail.claim.successTitle": "Got it. We're",
  "directory.detail.claim.successEm": "on it.",
  "directory.detail.claim.successBody":
    "A moderator will review your claim on {name} and let you know what happens next.",
  "directory.detail.claim.doneCta": "Done",
  "directory.detail.mapAria": "Map showing where {name} is",
  "directory.detail.languagesLabel": "Languages",
  "directory.detail.accessLabel": "Access",
  "directory.detail.trust.lastVerifiedLabel": "Last verified",
  "directory.detail.trust.howLine":
    "This space meets the same criteria as every verified space.",
  "directory.detail.trust.howLink": "How verification works",
  "directory.detail.whoRunsIt": "Who runs it",
  "directory.detail.onQueerPulse": "On QueerPulse",
  "directory.detail.addedByMember": "Added by a member",
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
  "directory.detail.noPhotos": "No photos yet",
  "directory.detail.lightboxClose": "Close",
  "directory.detail.prevPhoto": "Previous photo",
  "directory.detail.nextPhoto": "Next photo",
  "directory.detail.action.directions": "Directions",
  "directory.detail.action.call": "Call",
  "directory.detail.action.share": "Share",
  "directory.detail.action.save": "Save",
  "directory.detail.action.saved": "Saved",
  "directory.detail.action.linkCopied": "Link copied",
  "directory.detail.action.shareError": "Couldn't share. Try copying the link",
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

  // ── Arriving (new-to-Lisbon guide) — fully translated (LOC-13). The
  //    neighbourhood, health, housing, organisation and checklist copy used to
  //    be hardcoded English inside `arrivingPage.data.ts` /
  //    `arrivingPageCards.data.ts` and could not be translated at all. It now
  //    lives here in both catalogs. What stays in the data files is the
  //    non-translatable spine: Lisbon place names and organisation names
  //    (proper nouns, identical in both languages), destinations, and icons.
  "arriving.meta.title": "New to Lisbon? A queer newcomer's guide",
  "arriving.meta.description":
    "A practical starting guide for LGBTQ+ people new to Lisbon, welcoming neighbourhoods, health resources, housing basics, key organisations, and first steps.",
  "arriving.hero.eyebrow": "New to Lisbon",
  "arriving.hero.title": "Queer and new to Lisbon? <em>Welcome.</em>",
  "arriving.hero.body":
    "This city has a lot for us, a real, rooted queer community, welcoming neighbourhoods, organisations doing serious work, and people who will genuinely help you settle in. Here's what to know first.",

  // Shown beside a link whose destination needs a QueerPulse account, so a
  // logged-out reader knows before they click.
  "arriving.memberOnly": "Members only",

  // ── Arrival checklist. Ticks are stored in the reader's own browser; there
  //    is no account behind it and nothing is sent anywhere.
  "arriving.checklist.eyebrow": "Your first fortnight",
  "arriving.checklist.title": "The things worth doing <em>early.</em>",
  "arriving.checklist.intro":
    "Paperwork, a doctor, a room, and one room full of people. Tick these off as you go. The list stays in this browser, so you can close the tab and come back to it.",
  "arriving.checklist.progress": "{done} of {total} done",
  "arriving.checklist.reset": "Start over",
  "arriving.checklist.storedHere":
    "Saved in this browser, on this device. Nothing is sent anywhere and nobody else can see it.",
  "arriving.checklist.steps.nif.title": "Get a NIF",
  "arriving.checklist.steps.nif.note":
    "The Portuguese tax number. Almost nothing else works without it: a lease, a phone contract, a bank account. Make it the first errand.",
  "arriving.checklist.steps.nif.linkLabel": "Visas and residency",
  "arriving.checklist.steps.sns.title": "Register with the SNS",
  "arriving.checklist.steps.sns.note":
    "Once you have a NIF, register at your local Centro de Saúde. That is what gets you a médico de família on the national health service.",
  "arriving.checklist.steps.sns.linkLabel": "sns.gov.pt",
  "arriving.checklist.steps.doctor.title": "Ask for an affirming GP",
  "arriving.checklist.steps.doctor.note":
    "The health service covers trans healthcare, and which doctor you land with still matters a lot. Sort this while nothing is urgent.",
  "arriving.checklist.steps.doctor.linkLabel": "The trans healthcare guide",
  "arriving.checklist.steps.room.title": "Start the room search early",
  "arriving.checklist.steps.room.note":
    "Central rooms go within days. Begin looking before you arrive if you can, and keep looking after you take the first one.",
  "arriving.checklist.steps.room.linkLabel": "The housing board",
  "arriving.checklist.steps.rights.title":
    "Read the tenant basics before you sign",
  "arriving.checklist.steps.rights.note":
    "What a landlord can ask for, what a deposit can be, and what has to be in writing. Ten minutes now saves a bad year.",
  "arriving.checklist.steps.rights.linkLabel": "Tenant rights",
  "arriving.checklist.steps.crisis.title": "Save one number for a bad day",
  "arriving.checklist.steps.crisis.note":
    "ILGA Portugal runs a support line for discrimination, violence and crisis, and can point you towards legal aid. Put it in your phone while everything is calm.",
  "arriving.checklist.steps.crisis.linkLabel": "ilga-portugal.pt",
  "arriving.checklist.steps.gathering.title":
    "Go to one gathering in your first two weeks",
  "arriving.checklist.steps.gathering.note":
    "Reading about a city is a different thing from standing in a room in it. One evening changes how the whole month feels.",
  "arriving.checklist.steps.gathering.linkLabel": "What's coming up",
  "arriving.checklist.steps.community.title":
    "Join one community that meets in person",
  "arriving.checklist.steps.community.note":
    "Pick the one that meets near you. Turning up twice is what turns strangers into people you know.",
  "arriving.checklist.steps.community.linkLabel": "Browse communities",

  // ── Neighbourhoods. The notes used to name-drop members who exist only in
  //    the demo registry and could never be linked to a real profile; they now
  //    say something true about the place instead.
  "arriving.neighbourhoods.eyebrow": "Lisbon's neighbourhoods",
  "arriving.neighbourhoods.title": "Where queer life <em>happens.</em>",
  "arriving.neighbourhoods.intro":
    "Lisbon doesn't have one queer neighbourhood. It has several pockets, each with its own character. Here's an honest guide to where the community is.",
  "arriving.hoods.principeReal.tag": "Social · Creative",
  "arriving.hoods.principeReal.body":
    "The heart of queer social life in Lisbon. A garden square, wine bars, independent bookshops, and a lot of queer creatives. The most visible of the pockets and the easiest to walk into.",
  "arriving.hoods.principeReal.note":
    "A good first walk if you want to feel the city without planning anything.",
  "arriving.hoods.mouraria.tag": "Activism · Community",
  "arriving.hoods.mouraria.body":
    "A neighbourhood that has always made room for the outsider. Fado roots, a large immigrant community, and much of the city's queer organising.",
  "arriving.hoods.mouraria.note":
    "Where a lot of the organising and mutual aid actually happens.",
  "arriving.hoods.bairroAlto.tag": "Nightlife · Arts",
  "arriving.hoods.bairroAlto.body":
    "Small bars, independent music venues, late nights, and a long queer history. Where queer Lisbon goes to dance.",
  "arriving.hoods.bairroAlto.note":
    "Loud after 10pm and very quiet in the morning.",
  "arriving.hoods.caisDoSodre.tag": "Creative · Riverside",
  "arriving.hoods.caisDoSodre.body":
    "Creative energy by the river. Independent studios, cultural spaces, and Pink Street. Where new Lisbon meets old Lisbon.",
  "arriving.hoods.caisDoSodre.note":
    "Home to Pink Street, the city's best-known queer bar strip.",
  "arriving.hoods.arroios.tag": "Growing · Affordable",
  "arriving.hoods.arroios.body":
    "More affordable, more diverse, and growing fast as a home for queer newcomers and creatives priced out of Príncipe Real. Excellent food, tight community.",
  "arriving.hoods.arroios.note":
    "One of the most diverse neighbourhoods in the city, and a sensible place to look for a room.",
  "arriving.hoods.marvila.tag": "Industrial · New Lisbon",
  "arriving.hoods.marvila.body":
    "Warehouses, studios, and a quieter kind of creative life. Further out, and increasingly home to people who want space to make things.",
  "arriving.hoods.marvila.note":
    "Good for studios and larger rooms at lower rent.",

  // ── Health. Every card links to a real destination: an official Portuguese
  //    service, a public QueerPulse guide, or an organisation's own site.
  "arriving.health.eyebrow": "Health",
  "arriving.health.title":
    "Healthcare in Lisbon, <em>what you need to know.</em>",
  "arriving.health.intro":
    "Portugal has a national health service (SNS) that you can register with. Trans-affirming care has improved significantly, but it takes knowing where to go.",
  "arriving.health.cards.sns.title": "Registering with the SNS",
  "arriving.health.cards.sns.body":
    "Register with the Serviço Nacional de Saúde once you have a NIF. You are entitled to a médico de família. Ask at your local Centro de Saúde: Arroios, Mouraria and Príncipe Real all have active ones.",
  "arriving.health.cards.sns.linkLabel": "sns.gov.pt",
  "arriving.health.cards.trans.title": "Trans-affirming care",
  "arriving.health.cards.trans.body":
    "Portugal's Gender Identity Law is among the most progressive in Europe, and the SNS provides trans healthcare including hormones. Finding a GP who is comfortable with it is the part worth preparing for.",
  "arriving.health.cards.trans.linkLabel": "The trans healthcare guide",
  "arriving.health.cards.mental.title": "Mental health support",
  "arriving.health.cards.mental.body":
    "Moving is heavy even when it is the right move: a new language, a new kind of visibility, and nobody who has known you for years. Peer support and lower-cost options exist here.",
  "arriving.health.cards.mental.linkLabel": "Mental health resources",
  "arriving.health.cards.crisis.title": "Crisis and discrimination",
  "arriving.health.cards.crisis.body":
    "ILGA Portugal runs a support line for LGBTQ+ people facing crisis, discrimination or violence, and can connect you with legal aid. The line is mostly Portuguese-language, so bring someone who speaks it if that helps.",
  "arriving.health.cards.crisis.linkLabel": "ilga-portugal.pt",

  // ── Housing. The market card carries no link on purpose: it describes a
  //    situation rather than pointing at a destination.
  "arriving.housing.eyebrow": "Housing",
  "arriving.housing.title": "Finding a place to live, <em>honestly.</em>",
  "arriving.housing.intro":
    "Lisbon's housing market is expensive and competitive. Here's an honest picture of what to expect, and where to get help.",
  "arriving.housing.cards.market.title": "What the market is actually like",
  "arriving.housing.cards.market.body":
    "Rents have risen steeply over the past five years. Budget roughly 800 to 1100 euros for a room in a central neighbourhood. Arroios and Mouraria still offer better value. Good listings go within days, so move quickly when you see one.",
  "arriving.housing.cards.board.title": "Rooms shared inside the community",
  "arriving.housing.cards.board.body":
    "Members post rooms, sublets and shares on the QueerPulse housing board. The best leads usually arrive through people rather than portals.",
  "arriving.housing.cards.board.linkLabel": "The housing board",
  "arriving.housing.cards.rights.title": "Know what you are signing",
  "arriving.housing.cards.rights.body":
    "Portuguese tenancy law gives you more than a rushed landlord will mention: what a deposit can be, how much notice you are owed, and what has to be in writing.",
  "arriving.housing.cards.rights.linkLabel": "Tenant rights",
  "arriving.housing.cards.visas.title": "Residency and housing at once",
  "arriving.housing.cards.visas.body":
    "If you are sorting a residency permit at the same time as a lease, the order of the paperwork matters. The NIF comes first, and almost everything else follows it.",
  "arriving.housing.cards.visas.linkLabel": "Visas and residency",
  "arriving.housing.cards.ask.title": "Ask out loud",
  "arriving.housing.cards.ask.body":
    "Saying you're looking for a room or a short sublet and arriving next month is a completely normal thing to post here. People answer it. Someone usually knows someone.",
  "arriving.housing.cards.ask.linkLabel": "Go to the forum",

  // ── Organisations. Each row links to the organisation's own site, which is
  //    reachable without a QueerPulse account.
  "arriving.orgs.eyebrow": "Organisations",
  "arriving.orgs.title": "Know these <em>three first.</em>",
  "arriving.orgs.intro":
    "These three are the most likely to be useful in your first weeks, for legal support, mental health, or simply finding the community. Each one opens the organisation's own site.",
  "arriving.orgs.items.ilga.body":
    "Portugal's leading LGBTQ+ rights organisation. Legal support, anti-discrimination advice, housing referrals, a support line, and community programming. The first call for anything serious.",
  "arriving.orgs.items.opusDiversus.body":
    "Mental health and peer support for LGBTQ+ people, plus training for allied health professionals. A good place to start if the move or the new visibility is weighing on you.",
  "arriving.orgs.items.redeExAequo.body":
    "A youth-focused LGBTQ+ association with active groups in Lisbon. Peer support, advocacy, and a gentle room for people who are younger or still working things out.",

  // ── First step. Real upcoming gatherings, live in both modes. This section
  //    used to advertise one hardcoded card dated 14 June 2026.
  "arriving.firstStep.eyebrow": "Your first step",
  "arriving.firstStep.title": "Come to something <em>in person.</em>",
  "arriving.firstStep.intro":
    "Everything above helps. The thing that changes a first month is walking into a room. Here's what's coming up.",
  "arriving.firstStep.eventMeta": "{hood} · {time}",
  "arriving.firstStep.loading": "Loading what's coming up",
  "arriving.firstStep.error":
    "The gathering list didn't load just now. Try again in a moment.",
  "arriving.firstStep.retry": "Try again",
  "arriving.firstStep.empty":
    "Nothing is on the calendar right now. New gatherings go up most weeks, so it's worth looking again soon.",
  "arriving.firstStep.emptyCta": "See the gatherings page",
  "arriving.firstStep.allCta": "See every gathering",
  "arriving.firstStep.locked":
    "The gathering calendar lives inside QueerPulse. Members can see what's on this week and say they're coming.",
  "arriving.firstStep.lockedCta": "Request an invite",

  // ── Communities. Real communities from the same source the discover grid
  //    reads, each linking to its own page.
  "arriving.commQuick.eyebrow": "Where to start",
  "arriving.commQuick.title": "Communities for <em>new arrivals.</em>",
  "arriving.commQuick.intro":
    "Beginner-friendly rooms that meet in person, here in the city. Pick one and turn up twice.",
  "arriving.commQuick.browseCta": "Browse all communities",
  "arriving.commQuick.loading": "Loading communities",
  "arriving.commQuick.empty":
    "Nothing is open for new arrivals right now. The full list is still worth a browse.",
  "arriving.commQuick.locked":
    "Communities live inside QueerPulse, so members can talk to each other without an audience.",
  "arriving.commQuick.lockedCta": "Request an invite",

  "arriving.outro.title": "Ready to meet <em>the community?</em>",
  "arriving.outro.sub":
    "Request an invite to QueerPulse and get access to the full network, members, gatherings, board, and everything else on this page.",
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
    "Community guidance on EU and non-EU visa routes, residency permits, and same-sex partner immigration in Portugal, plus reviewed immigration lawyers. This is not legal advice.",
  "visas.hero.eyebrow": "Visas & Residency · Portugal",
  "visas.hero.title": "Portugal, legally. <em>Your path to residency.</em>",
  "visas.hero.sub":
    "Practical information about visas, residency, and citizenship in Portugal, and what queer couples and families need to know that the official guidance doesn't always say clearly.",
  "visas.hero.note":
    "Community information. This is not legal advice: immigration law changes, so always verify with a specialist.",
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
    "EU and EEA citizens have the right to live and work in Portugal without a visa. You still need to register, and for queer couples, there are specific things to know about bringing a non-EU partner.",
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
    "If you're an EU citizen and your partner is not, they can join you in Portugal under EU free movement rules, including same-sex spouses and registered partners. The EU Court of Justice (Coman ruling, 2018) established that EU member states must recognise same-sex spouses for free movement purposes even if they don't have same-sex marriage domestically.",
  "visas.tabs.eu.card3.tag": "Full partner rights",
  "visas.tabs.eu.card3.link": "Partner visa details",

  "visas.tabs.d7.label": "D7, Passive Income",
  "visas.tabs.d7.headTitle": "D7, <em>Passive Income Visa</em>",
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
    "AIMA (replaced SEF in 2023) handles residency permits. Book early. Waits can be long. Bring all original documents.",
  "visas.tabs.d7.step3.note": "Book online at aima.gov.pt",
  "visas.tabs.d7.step4.title": "Receive your AR card",
  "visas.tabs.d7.step4.text":
    "Your Autorização de Residência card is your proof of legal residency. Keep it safe. It's used for everything.",

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
    "D8 holders working in qualifying tech or research roles may qualify for the IFICI regime (20% flat income tax for up to 10 years). This is not automatic. You must apply and your profession must qualify. Check with a tax specialist before assuming you'll benefit.",
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
    "Portugal recognises same-sex marriage, civil partnership, and long-term cohabitation. What this means for residency depends on your nationalities and which visa route you're using, but the community news is broadly good.",
  "visas.tabs.partner.card1.eyebrow": "Same-sex marriage",
  "visas.tabs.partner.card1.title": "Portugal fully recognises your marriage",
  "visas.tabs.partner.card1.body":
    "Portugal has recognised same-sex marriage since 2010. A legal marriage anywhere in the world is recognised for residency purposes in Portugal. Your spouse is entitled to join you under family reunification, regardless of their nationality or the country where you married.",
  "visas.tabs.partner.card1.tag": "Full legal recognition",
  "visas.tabs.partner.card2.eyebrow": "Not married",
  "visas.tabs.partner.card2.title": "Partners without formal status",
  "visas.tabs.partner.card2.body":
    "If you're not married, long-term cohabitation (união de facto, typically 2+ years) is recognised for family reunification purposes. You'll need to document your relationship, shared bills, joint accounts, correspondence. Getting married or entering a civil partnership first is often simpler administratively.",
  "visas.tabs.partner.card3.eyebrow": "EU citizen + non-EU partner",
  "visas.tabs.partner.card3.title": "The Coman ruling",
  "visas.tabs.partner.card3.body":
    "The 2018 EU Court of Justice ruling (Coman v. Romania) established that EU member states must recognise same-sex spouses of EU citizens for the purposes of free movement, even countries that don't have same-sex marriage. This means an EU citizen can bring their same-sex spouse to Portugal regardless of their home country's stance.",
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
    "The Portuguese language requirement for citizenship is A2 (basic), conversational rather than fluent. You can demonstrate this via an approved CAPLE or CIPLE test, or by showing Portuguese-medium education. The community forum has recommendations for Portuguese teachers who are queer-friendly.",
  "visas.tabs.citizenship.card3.link": "Language learning resources",

  "visas.ground.title": "On the <em>ground</em>",
  "visas.ground.sub": "Practical first steps regardless of your visa route.",
  "visas.ground.nif.label": "First",
  "visas.ground.nif.title": "NIF, Tax number",
  "visas.ground.nif.body":
    "You need a Número de Identificação Fiscal for almost everything: opening a bank account, signing a lease, buying a phone plan. Get it at the Finanças office with your passport. EU citizens: bring passport. Non-EU: bring passport + address proof. Can also use a fiscal representative service if you're not yet in Portugal.",
  "visas.ground.niss.label": "Second",
  "visas.ground.niss.title": "NISS, Social security",
  "visas.ground.niss.body":
    "Your Número de Identificação de Segurança Social gives you access to SNS healthcare and records contributions. Register at your local Centro de Emprego e Formação Profissional or Segurança Social office. Required before you can access SNS appointments.",
  // Note: the source component (`visas.data.ts`) said "NHS appointments"
  // here — the UK's health service, not Portugal's. Corrected to SNS per the
  // i18n brief's "flag/fix an English-source bug, don't faithfully translate
  // it" rule; flagged in the sweep report.
  "visas.ground.aima.label": "Key office",
  "visas.ground.aima.title": "AIMA",
  "visas.ground.aima.body":
    "AIMA (Agência para a Integração, Migrações e Asilo) replaced SEF in October 2023. It handles all residency permits, renewals, and family reunification. Book appointments online at aima.gov.pt. Waits are long, book immediately on arrival.",
  "visas.ground.sns.label": "Healthcare",
  "visas.ground.sns.title": "SNS access",
  "visas.ground.sns.body":
    "Register with a GP (Centro de Saúde) in your area using your AR card or EU registration certificate plus NISS. Wait times are long. Many community members use private health insurance alongside SNS access. See the Wellbeing page for queer-friendly healthcare providers.",

  "visas.lawyers.title": "Community-reviewed <em>immigration lawyers</em>",
  "visas.lawyers.emptyBody":
    "We're building a community-reviewed directory of LGBTQ+-friendly immigration lawyers. It isn't ready yet. Until it is, the best recommendations come from members who've been through the process. Ask in the visa forum thread.",
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
  "map.sidebar.backToAll": "All places",
  "map.sidebar.empty": "No places match these filters.",
  "map.jumpToList": "View the list · {count}",
  "map.venueCard.beenCount_one": "<b>{count}</b> person been here",
  "map.venueCard.beenCount_other": "<b>{count}</b> people been here",
  "map.venueCard.beenThere": "Been there",
  "map.venueCard.markBeen": "I've been here",
  "map.venueCard.accessible": "Wheelchair accessible",
  // Bairro is a Lisbon proper noun — identical in both catalogs, only the
  // surrounding phrase is translated.
  "map.svg.filterByAria": "Filter the map by {bairro}",
  "map.mapError": "The map could not load. The venue list below still works.",
  "map.mapLoading": "Bringing the map to <em>life</em>…",
  "map.pinAria": "{name}, {type}",
  "map.clusterAria_one": "{count} place here, zoom in",
  "map.clusterAria_other": "{count} places here, zoom in",

  // ── Local — combined list/map venue explorer.
  "local.cat.nightlife": "Nightlife",
  "local.view.list": "List",
  "local.view.map": "Map",
  "local.view.toggleAria": "Choose list or map view",
  "local.card.seeFullDetails": "See full details",
  "local.filter.searchPlaceholder": "Search places and venues…",
  "local.filter.categoryLabel": "Place type",
  "local.filter.refine": "Refine",
  "local.filter.vibeLabel": "Vibe",
  "local.filter.vibeVenueNote": "Vibe filters apply to venues",
  "local.filter.verifiedSafeSpaces": "Verified safe spaces",
  "local.filter.filters": "Filters",
  "local.filter.quickFiltersLabel": "Quick filters",
  "local.filter.openNow": "Open now",
  "local.filter.accessLabel": "Access needs",
  "local.filter.accessNote":
    "Shows places that have answered yes to everything you pick. A place nobody has asked about stays out of the results.",
  // ── Use my location. Opt-in, reversible, and never leaves the device.
  "local.nearMe.on": "Use my location",
  "local.nearMe.off": "Turn off my location",
  "local.nearMe.asking": "Finding you…",
  "local.nearMe.privacy": "Your location stays on this device.",
  "local.nearMe.onNote":
    "Sorted by how close it is. Your location stays on this device.",
  "local.nearMe.denied":
    "Location is off for this site. You can turn it back on in your browser settings.",
  "local.nearMe.timeout": "That took too long. Try again whenever you like.",
  "local.nearMe.unavailable":
    "Your device could not work out where you are right now.",
  "local.nearMe.walkChip": "{minutes} min walk",
  "local.nearMe.walkAria": "About {minutes} minutes on foot from you",
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
    "QueerPulse's constitution: twelve plain-language articles on purpose, membership and governance, written by the volunteers who run the platform.",
  "constitution.artNumLabel": "Article",
  "constitution.hero.eyebrow": "Constitution · v1.4 · adopted 14 Nov 2025",
  "constitution.hero.title":
    "The <em>rulebook,</em> in plain Portuguese-flavoured English.",
  "constitution.hero.dek1":
    "The working charter of the <b>volunteer collective</b> that runs QueerPulse. Written by the founding eight and adopted at the first assembly. It isn't a legal document, and there's no registered company or association behind QueerPulse yet. <em>Revised several times since.</em>",
  "constitution.hero.dek2":
    "It is intentionally short. Twelve articles, plain language, no nested sub-clauses. Anything more elaborate lives in the Code of Conduct or the resolutions of the Annual Assembly.",
  "constitution.hero.meta":
    "<b>Written in:</b> Lisbon · <b>Original:</b> Portuguese · this is the English translation.",

  "constitution.art1.toc": "I · Purpose",
  "constitution.art1.title": "Purpose",
  "constitution.art1.clause1":
    "QueerPulse exists to provide <strong>professional, social, cultural and material support</strong> to LGBTQ+ people in the city of Lisbon, and (per Article X) in other cities once specific conditions are met.",
  "constitution.art1.clause2":
    "QueerPulse runs <strong>without profit,</strong> as a volunteer collective. It isn't a registered company or association, holds no equity, and distributes no profits. If that ever changes, this document changes with it.",
  "constitution.art1.clause3":
    "Where this Constitution conflicts with the Manifesto, this document prevails. The Manifesto sets values; this sets operations.",

  "constitution.art2.toc": "II · Members",
  "constitution.art2.title": "Members",
  "constitution.art2.clause1":
    "A <strong>member</strong> is any individual who has been vouched for by an existing member, completed a brief check-in with the moderation team, and accepted the Code of Conduct.",
  "constitution.art2.clause2":
    "Members may be on any of three tiers: <em>Solidarity</em> (free), <em>Member</em> (€36/year), or <em>Sustainer</em> (€96/year). All tiers carry equal voting rights.",
  "constitution.art2.clause3":
    "No member's status (including age, nationality, language, identity, occupation, or visibility) affects their voting rights or treatment in moderation.",

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
    "The Assembly convenes once per year, in November, for at least one full day. It is the highest decision-making body of the collective.",
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
    "<strong>At least 90% of every euro received</strong> must be spent on community programmes, staff, and infrastructure, not on overheads. The target is 96% and has been met every year since 2024.",
  "constitution.art6.clause2":
    "The annual budget is approved by the Assembly. The finance circle may rebalance within categories during the year without re-approval, up to 10% per category.",
  "constitution.art6.clause3":
    "Annual accounts are <strong>published in full,</strong> in plain language, as part of the <a>Transparency Report</a>. Figures are self-reported by the volunteer team.",
  "constitution.art6.clause4":
    "The collective may not enter into debt arrangements above €10,000 without explicit Assembly approval.",

  "constitution.art7.toc": "VII · Speech",
  "constitution.art7.title": "Speech & <em>moderation</em>",
  "constitution.art7.clause1":
    "The community is moderated according to the Code of Conduct, ratified separately and amendable by Assembly supermajority (60%).",
  "constitution.art7.clause2":
    "<strong>QueerPulse does not moderate criticism of itself.</strong> Posts critical of QueerPulse, its decisions, or its organisers may not be removed under any clause of the Code of Conduct.",
  "constitution.art7.clause3":
    "Moderation decisions are appealable to a standing appeals panel composed of three members from outside the deciding circle. The share of decisions overturned on appeal is counted from the moderation record and published every quarter in the <a>Transparency Report</a>.",

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
    "The collective may enter into <strong>operational partnerships</strong> with other organisations under terms approved by the Assembly. New operational partnerships are capped at two per year.",
  "constitution.art9.clause2":
    "No partnership may grant a partner organisation access to member data beyond what is operationally necessary, and only with the affected member's explicit consent.",
  "constitution.art9.clause3":
    "Either side of any partnership may publicly dissent from the other's positions. <em>Coalition is not consensus.</em>",

  "constitution.art10.toc": "X · Expansion",
  "constitution.art10.title": "Expansion",
  "constitution.art10.clause1":
    "The collective may open in cities other than Lisbon only when all of these are true: (a) at least one moderator is in-country; (b) an operational local partner is signed; (c) a local legal review is complete; (d) eight to twelve founding members have committed to the soft-launch.",
  "constitution.art10.clause2":
    "Each new city ratifies its own local circle and operates under this Constitution, with city-specific bylaws as needed.",

  "constitution.art11.toc": "XI · Dissolution",
  "constitution.art11.title": "Dissolution",
  "constitution.art11.clause1":
    "The collective may be wound down only by Assembly resolution requiring a <strong>75% supermajority</strong> of all active members, not merely of those voting.",
  "constitution.art11.clause2":
    "On winding down, any remaining funds must be transferred to a registered LGBTQ+ rights organisation chosen by the dissolving Assembly. No funds may be distributed to individuals.",

  "constitution.art12.toc": "XII · Amendments",
  "constitution.art12.title": "Amendments",
  "constitution.art12.clause1":
    "This Constitution may be amended only by Assembly resolution requiring a 60% supermajority of votes cast.",
  "constitution.art12.clause2":
    "Amendments must be circulated for written comment to all members at least 30 days before the vote.",
  "constitution.art12.clause3":
    "Versioning is sequential (v1.0, v1.1…). The current version's full text is published at all times.",

  "constitution.footer.version":
    "<b>Constitution v1.4</b> · adopted 14 Nov 2025 · in force since 1 Jan 2026",
  "constitution.footer.readCodeOfConduct": "Read the Code of Conduct",

  // ── Resource Library — page/filter/card chrome. `RESOURCES` entries
  //    (name/desc/tags — a short, hand-curated list of real external
  //    organisations, kept distinct from the editorial guide grid below) is
  //    directory-style content, same precedent as `directoryPlaces.ts` /
  //    the Platforms page below — left English. `LIBRARY_SUBPAGES`
  //    label/blurb are short platform-authored teaser chrome — translated.
  //    CNT-11: the guide grid itself is real, backend-driven data — its
  //    search/filter/card chrome lives under the shared `resources:library.*`
  //    keys (see resources.ts) so it isn't duplicated per-catalog.
  "resourceLibrary.meta.title":
    "Queer resources in Lisbon: health, legal, housing and money support",
  "resourceLibrary.meta.description":
    "Things that actually help: community-written guides plus a short list of trusted organisations, for health, legal, housing, finance and trans life in queer Lisbon.",
  "resourceLibrary.hero.eyebrow": "Resource Library",
  "resourceLibrary.hero.title": "Things that <em>actually help.</em>",
  "resourceLibrary.hero.sub":
    "Community-maintained guides, organisations, contacts, and QueerPulse tools, in one searchable place.",
  "resourceLibrary.stats.resources": "resources",
  "resourceLibrary.stats.categories": "categories",
  "resourceLibrary.stats.communityLabel": "Community",
  "resourceLibrary.stats.maintained": "maintained",
  "resourceLibrary.search.placeholder": "Search resources…",
  "resourceLibrary.results_one": "{count} result",
  "resourceLibrary.results_other": "{count} results",
  "resourceLibrary.empty": "No resources match. Try a broader filter.",
  "resourceLibrary.card.visitSite": "Visit site",
  "resourceLibrary.orgs.title": "Organisations doing this <em>every day.</em>",
  "resourceLibrary.orgs.lead":
    "A short list of Lisbon and Portugal-wide organisations we trust, for support QueerPulse doesn't provide directly.",
  "resourceLibrary.outro.title": "Know something <em>missing?</em>",
  "resourceLibrary.outro.sub":
    "Every resource here was added by a community member. If something helped you and isn't listed, tell us.",
  "resourceLibrary.outro.cta": "Suggest a resource",
  "resourceLibrary.subpages.eyebrow": "Learn & belong",
  "resourceLibrary.subpages.title": "Start with the basics",
  "resourceLibrary.subpages.queer101.label": "Queer 101",
  "resourceLibrary.subpages.queer101.blurb":
    "New here? Start with the basics, identities, language, and community.",
  "resourceLibrary.subpages.glossary.label": "Glossary",
  "resourceLibrary.subpages.glossary.blurb":
    "Plain-language definitions for the words the community uses.",
  "resourceLibrary.subpages.intersectionality.label": "Intersectionality",
  "resourceLibrary.subpages.intersectionality.blurb":
    "How overlapping identities shape our experiences, and our organising.",

  // ── Platforms (the wider queer web) — page/filter chrome. `PLATFORMS`
  //    entries (name/desc — named third-party apps/orgs) are directory-style
  //    content, same precedent as Resource Library above — left English.
  "platforms.meta.title": "Queer platforms and organisations worth knowing",
  "platforms.meta.description":
    "A directory of dating apps, media, professional networks and advocacy organisations useful to queer people, including Portugal-specific groups like ILGA Portugal.",
  "platforms.hero.eyebrow": "Queer platforms",
  "platforms.hero.title": "The wider <em>queer web.</em>",
  "platforms.hero.sub":
    "Apps, media, professional networks, and advocacy organisations that are genuinely useful for queer people, beyond QueerPulse itself.",
  "platforms.filter.all": "All",
  "platforms.filter.dating": "Dating & Social",
  "platforms.filter.media": "News & Media",
  "platforms.filter.professional": "Professional Networks",
  "platforms.filter.advocacy": "Advocacy & Rights",
  "platforms.filter.health": "Health & Wellbeing",
  "platforms.filter.portugal": "Portugal & Lisbon",
  "platforms.note.body":
    "<b>A note on this list:</b> We include platforms we think are genuinely useful for queer people. This is not an endorsement of any company's practices. Always make your own informed choices about data, safety, and privacy, especially on dating and social apps.",
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
    "QueerPulse partnerships are operational and hands-on. Tell us who you are and what you do, honestly, and we'll read every word.",
  "submitPartner.success.title": "Application",
  "submitPartner.success.em": "received.",
  "submitPartner.success.closeLabel": "Back to partners",
  "submitPartner.success.step1":
    "It's pending review with the partnerships team",
  "submitPartner.success.step2": "We read every application, however rough",
  "submitPartner.success.step3":
    "We'll be in touch, a yes, a not-yet, or a question",
  "submitPartner.success.body":
    "Thank you for reaching out. Your application is in. Nothing goes live until we've talked it through with you.",
  "submitPartner.actions.sending": "Sending…",
  "submitPartner.actions.submit": "Submit application",
  "submitPartner.actions.cancel": "Cancel",
  "submitPartner.error.toast":
    "Couldn't send your application. Please try again.",

  "submitPartner.fields.sectionOrg": "Your organisation",
  "submitPartner.fields.name.label": "Organisation name",
  "submitPartner.fields.name.placeholder": "e.g. Casa T",
  "submitPartner.fields.orgType.label": "Organisation type",
  "submitPartner.fields.orgType.helper":
    "Just the kind of organisation you are. We add the “Partner ·” label.",
  "submitPartner.fields.orgType.placeholder": "e.g. Community health clinic",
  "submitPartner.fields.city.label": "City / base",
  "submitPartner.fields.city.placeholder": "e.g. Lisbon",
  "submitPartner.fields.region.label": "Region",
  "submitPartner.fields.logo.label": "Logo mark",
  "submitPartner.fields.logo.derivedHelper":
    "Auto-filled from your name, edit it if you'd rather set the badge yourself.",
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
    "Partnerships here are operational and hands-on. Tell us what your organisation actually does and who it serves, in concrete terms.",
  "submitPartner.tips.sharedValues.title": "Built on shared values",
  "submitPartner.tips.sharedValues.body":
    "We prioritise organisations that centre the identities marginalised within queer spaces as well as outside them. Say where your work sits.",
  "submitPartner.tips.whatNext.title": "What happens next",
  "submitPartner.tips.whatNext.body":
    "Your application arrives as pending. A member of the team reviews it, and we'll be in touch, whether it's a yes, a not-yet, or a question.",

  "changelog.entries.resource-listings-and-suggestions.title":
    "Real resource listings for Legal Aid & Sexual Health Testing",
  "changelog.entries.resource-listings-and-suggestions.body":
    'Legal Aid and Sexual Health Testing now show a real, admin-vetted directory when one exists — and a "Suggest a resource" form feeding an admin review queue when it doesn\'t. No fabricated listings, ever.',
  "changelog.tag.legal": "See Legal Aid →",

  "changelog.tag.guideRating": "See the Legal guides",
  "changelog.entries.resources-guide-rating.title":
    "Rate whether a resource guide helped",
  "changelog.entries.resources-guide-rating.body":
    "Legal, Sexual Health, and Mental Health guides now end with a quick \"Was this helpful?\": thumbs up or down, no visible counts, just a thanks once you've answered. Editors can see which guides are and aren't landing from the new Guide Feedback admin page.",

  "changelog.entries.homepage-housing-personas-showcase.title":
    "A closer look at housing and personas on the homepage",
  "changelog.entries.homepage-housing-personas-showcase.body":
    'The homepage\'s Housing and Personas sections now show what the features actually feel like: two real listing cards with a room and a landlord tab (reviews, verdicts, an honest "no reviews yet" when a landlord is new), and an interactive persona deck you can switch between to see how a public page changes per persona.',

  // Trust, safety and moderation (section 1 build).
  "changelog.tag.transparency": "Read the transparency report",
  "changelog.tag.constitution": "Read the constitution",
  "changelog.tag.codeOfConduct": "Read the code of conduct",
  // ACQ-01..04, ACQ-08, ACQ-11, ID-11, ID-12, ID-15: the applicant funnel,
  // account security and export depth.
  "changelog.tag.accountSecurity": "Open account security",
  "changelog.tag.dataExport": "Download your data",
  "changelog.tag.contact": "Get in touch",
  "changelog.entries.perks-that-grant-something-real.title":
    "Perks that grant something real",
  "changelog.entries.perks-that-grant-something-real.body":
    "The recognition ladder used to hand out a number and change nothing. Perks you can reach are now claimable, and a claimed invite perk really does raise your monthly invite allowance. Perks the platform could not honour are gone from the page.",
  "changelog.entries.renew-your-card-before-it-runs-out.title":
    "Renew your card before it runs out",
  "changelog.entries.renew-your-card-before-it-runs-out.body":
    "When your community allows it, you can renew a membership card yourself from your account instead of waiting for an organiser to re-issue the whole roster. You also get a notice in the app thirty days before a card's term ends.",
  "changelog.entries.volunteering-that-counts.title":
    "Volunteering that counts",
  "changelog.entries.volunteering-that-counts.body":
    "Whoever posted the opportunity can now confirm you turned up and record the hours. Confirmed sessions earn recognition points, and your own total sits on the volunteering page. Hosting a gathering and publishing in the magazine count too.",
  "changelog.entries.support-offers-a-community-receives.title":
    "Support offers a community receives",
  "changelog.entries.support-offers-a-community-receives.body":
    "When the team offers a struggling community a hand, it now arrives. The moderators get a notification and see what was offered in their Mod tools, where they can answer yes please or not right now.",
  "changelog.entries.see-how-often-your-cards-are-checked.title":
    "See how often your cards are checked",
  "changelog.entries.see-how-often-your-cards-are-checked.body":
    "If your community issues membership cards, Mod tools now shows how many times they have been checked, and each card carries its own count. Nothing records who checked a card or where, and the log is kept for ninety days.",
  "changelog.entries.check-what-happened-to-your-invite-request.title":
    "You can check what happened to your invite request",
  "changelog.entries.check-what-happened-to-your-invite-request.body":
    "Asking to join used to end in silence. Now, when you send a request, you get a reference code to keep. Enter it any time and the status page tells you plainly where things stand: still being read, approved, or turned down. If it is a yes, your invite link is waiting there for you, so an approval can no longer go astray on its way to you.",
  "changelog.entries.an-invite-you-can-address-to-a-person.title":
    "An invite you can address to one person",
  "changelog.entries.an-invite-you-can-address-to-a-person.body":
    "When you make an invite you can now add the email address of the person it is for. It is optional. Fill it in and only someone signing in with that address can use the link, so a forwarded or screenshotted invite lets nobody else in. That matters because whoever redeems your invite arrives with you on record as their voucher. Leave it blank and the link keeps working for anyone holding it. Either way, nothing is sent to that address: you still pass the link on yourself.",
  "changelog.entries.your-invites-are-where-you-can-find-them.title":
    "Your invites are where you would look for them",
  "changelog.entries.your-invites-are-where-you-can-find-them.body":
    'Inviting someone was hidden behind a single button on your connections page, so unspent invites quietly expired. There is now an "Invite someone" row in your account menu with a count of what you have left this month, and a small card on your own profile telling you when the allowance resets. Your sent invites also show who each one was for, with a copy button on every link that still works.',
  "changelog.entries.account-security-has-a-real-home.title":
    "Account security has a real home",
  "changelog.entries.account-security-has-a-real-home.body":
    'Clicking "security" in your settings used to open our vulnerability policy for security researchers, which is not what anyone was looking for. That policy has moved to the policies section, where it belongs. In its place is a page about your account: how you sign in, how many sessions are open, which devices get push, and where to download or delete your data. Where something does not exist yet, the page says so instead of pretending.',
  "changelog.entries.your-photos-come-with-your-export.title":
    "Your photos come with your data export",
  "changelog.entries.your-photos-come-with-your-export.body":
    "The export described your pictures without including them, so the links stopped working the moment an account was gone. Every file you have uploaded now travels inside the archive, with an index saying what each one is. Your magazine writing and drafts, the communities you own and the posts you wrote in them, your volunteering, your governance votes and your reviews are all in there too. Choose the CSV or Both format to get the files themselves.",
  "changelog.entries.every-page-announces-itself.title":
    "Every page announces itself to a screen reader",
  "changelog.entries.every-page-announces-itself.body":
    "Moving between pages used to be silent for anyone using a screen reader, which made the whole app hard to follow. Each page now says its name on arrival and puts you at the start of the content. The admin and sign-in layouts gained a skip link and a proper main landmark, and the governance editors can be reordered with buttons, so arranging a list no longer needs a mouse drag.",
  "changelog.entries.the-contact-form-reaches-a-person.title":
    "The contact form reaches a person",
  "changelog.entries.the-contact-form-reaches-a-person.body":
    "Messages sent through the contact and partnership forms were being stored where nobody could read them, and the same was true of eleven of the twelve application and suggestion forms across the site. Grant applications, edit suggestions, sober host offers, panel signups and the Culture submissions all now land in one console the team works through, with a record of who picked each one up and when.",
  "changelog.entries.an-approved-invite-can-be-found-again.title":
    "An approved invite can be found again",
  "changelog.entries.an-approved-invite-can-be-found-again.body":
    "When a reviewer welcomed someone in, the invite link appeared once and vanished on the next refresh, which could strand the person waiting for it. Decided requests now have their own tab with the link kept alongside them, its expiry shown, and a way to reissue one that ran out. Any moderator can do it, where before only the person who made the original decision could.",
  "changelog.entries.no-stock-photo-on-a-real-application.title":
    "No stock photo on a real application",
  "changelog.entries.no-stock-photo-on-a-real-application.body":
    "Admin screens were matching people by name against a set of sample photos used in our demo, which meant a real applicant could be shown to a reviewer wearing a stranger's face. Anywhere real people are listed now uses their own picture, or their initials when they have none.",

  "changelog.entries.the-transparency-report-is-published.title":
    "The transparency report is published",
  "changelog.entries.the-transparency-report-is-published.body":
    "Our constitution has always named a transparency report. Now there is one. Every quarter it publishes what was reported and why, how long decisions took, what actions were taken, and how many appeals were upheld. Numbers only, counted from the moderation record. Small counts are withheld so that no figure can be traced back to a person.",
  "changelog.entries.a-permanent-ban-needs-two-moderators.title":
    "A permanent ban now needs a second moderator",
  "changelog.entries.a-permanent-ban-needs-two-moderators.body":
    "Article VIII said a removal has to be ratified by another moderator. Now the software holds it to that. When a moderator bans someone permanently, harmful content comes down straight away and the account decision waits for a second, different moderator to confirm it. If nobody confirms within 72 hours, the hold lapses on its own.",
  "changelog.entries.appeals-have-a-deadline.title":
    "Appeals have a deadline that is measured",
  "changelog.entries.appeals-have-a-deadline.body":
    "The code of conduct gives you 14 days to appeal and promises a decision within 7. Both windows are now recorded on every appeal, and the review queue is sorted by what is due first, so an appeal cannot quietly sit there. You can also appeal a community ban and a restriction, which were unreachable before.",
  "changelog.entries.a-community-ban-can-end.title":
    "A community ban can have an end date",
  "changelog.entries.a-community-ban-can-end.body":
    "Being asked to leave a community used to be permanent and silent. Moderators can now set an end date, and you are told what happened: the reason, the house rule it rests on, and the day it lifts. A bad week no longer has to mean losing a room for good.",
  "changelog.entries.a-warning-now-reaches-you.title":
    "A warning now actually reaches you",
  "changelog.entries.a-warning-now-reaches-you.body":
    "If a post, a reply, a message or a comment of yours was warned about, nobody told you. The report closed, the record said you had been warned, and you never heard a word. Warnings now reach the person who wrote the thing, with the reason attached.",
  "changelog.entries.community-mods-can-read-what-was-reported.title":
    "Community moderators can read what was reported",
  "changelog.entries.community-mods-can-read-what-was-reported.body":
    "A moderator opening a report used to see a reason and a timestamp, then had to decide whether to remove something they could not read. Reports now carry the post itself, who wrote it, how urgent it is and when it is due. Urgent reports about outing or personal details go to trained staff instead.",

  // ── SecurityPolicyPage.tsx — vulnerability disclosure ──────────────────────────
  // The acknowledgement credits (securityPolicy.data.ts SECURITY_HALL_OF_FAME) are
  // attribution records: researcher names plus the vuln type/date they
  // reported. They stay in English like the other stored/record values noted at
  // the top of this file, and the grid is hidden entirely while the list is
  // empty, so no credit is ever invented.
  "securityPolicy.meta.title": "Security & vulnerability disclosure",
  "securityPolicy.meta.description":
    "How to report a security vulnerability in QueerPulse, what is in scope, and what happens after you report it.",
  "securityPolicy.hero.eyebrow": "Vulnerability disclosure",
  "securityPolicy.hero.titleTop": "Found something?",
  "securityPolicy.hero.titleEm": "Tell us.",
  "securityPolicy.hero.sub":
    "We take security seriously. If you've found a vulnerability in QueerPulse, we want to know about it. This page explains how to report it, what to expect, and how we handle disclosures.",

  "securityPolicy.commitment.eyebrow": "Our commitment",
  "securityPolicy.commitment.title": "We won't <em>punish</em> good faith.",
  "securityPolicy.commitment.body1":
    "Security researchers who report vulnerabilities in good faith will not face legal action from us. We will not contact your employer, ISP, or law enforcement unless you use your access to harm members. We believe security research makes everyone safer, and we're grateful when people take the time to report what they find.",
  "securityPolicy.commitment.body2":
    "We ask that you give us reasonable time to fix an issue before disclosing it publicly. In return, we commit to acknowledging your report within 48 hours, keeping you updated on progress, and crediting you in our security acknowledgements if you'd like.",

  "securityPolicy.scope.eyebrow": "Scope",
  "securityPolicy.scope.title": "What's <em>in scope.</em>",
  "securityPolicy.scope.inLabel": "In scope",
  "securityPolicy.scope.outLabel": "Out of scope",
  "securityPolicy.scope.in.1": "queerpulse.com and *.queerpulse.com",
  "securityPolicy.scope.in.2": "Authentication & session management",
  "securityPolicy.scope.in.3": "Data access & privilege escalation",
  "securityPolicy.scope.in.4": "Stored and reflected XSS",
  "securityPolicy.scope.in.5": "CSRF on authenticated endpoints",
  "securityPolicy.scope.in.6": "SQL injection",
  "securityPolicy.scope.in.7": "Insecure direct object references",
  "securityPolicy.scope.in.8": "Sensitive data exposure",
  "securityPolicy.scope.out.1": "Denial of service attacks",
  "securityPolicy.scope.out.2": "Social engineering of our team",
  "securityPolicy.scope.out.3": "Physical attacks against infrastructure",
  "securityPolicy.scope.out.4": "Spam or rate-limiting bypass",
  "securityPolicy.scope.out.5":
    "Third-party infrastructure (Hetzner, Postmark, Backblaze)",
  "securityPolicy.scope.out.6": "Clickjacking on non-sensitive pages",
  "securityPolicy.scope.out.7": "Missing security headers (report only)",

  "securityPolicy.process.eyebrow": "Process",
  "securityPolicy.process.aria": "What happens after you report",
  "securityPolicy.process.title": "What happens <em>after you report.</em>",
  "securityPolicy.process.step1.title": "Acknowledgement",
  "securityPolicy.process.step1.text":
    "We'll confirm receipt within 48 hours and let you know we're looking at it. We'll assign a reference number so we can track it together.",
  "securityPolicy.process.step1.note": "Target: 48 hours",
  "securityPolicy.process.step2.title": "Assessment",
  "securityPolicy.process.step2.text":
    "We'll investigate and assess the severity. We'll keep you updated and may ask follow-up questions. If we can't reproduce it, we'll tell you why.",
  "securityPolicy.process.step2.note": "Target: 5 working days",
  "securityPolicy.process.step3.title": "Fix",
  "securityPolicy.process.step3.text":
    "For confirmed vulnerabilities, we'll fix and deploy a patch. The timeline depends on severity. Critical issues are treated as emergencies.",
  "securityPolicy.process.step3.note":
    "Critical: <72h · High: <7 days · Medium/Low: next release",
  "securityPolicy.process.step4.title": "Disclosure",
  "securityPolicy.process.step4.text":
    "We'll coordinate a disclosure timeline with you. We'll credit you in our security acknowledgements unless you prefer anonymity.",
  "securityPolicy.process.step4.note": "Default: 90-day coordinated disclosure",

  "securityPolicy.ack.eyebrow": "Acknowledgements",
  "securityPolicy.ack.title": "Security <em>researchers</em> who've helped.",
  "securityPolicy.ack.body":
    "We're grateful to the following researchers who disclosed vulnerabilities responsibly. (Listed with permission.)",
  "securityPolicy.ack.empty":
    "Nobody is credited here yet. Report something and, if you'd like the credit, your name goes up.",

  "securityPolicy.report.titleTop": "Report a",
  "securityPolicy.report.titleEm": "vulnerability",
  "securityPolicy.report.body":
    "Encrypt your report using our PGP key and email us. Please include steps to reproduce, the potential impact, and any proof of concept.",
  "securityPolicy.report.cta": "Email security team",
  "securityPolicy.pgp.label": "PGP public key",
  "securityPolicy.pgp.copyCta": "Copy key",
  "securityPolicy.pgp.copied": "PGP key copied.",
  "securityPolicy.pgp.copyFailed": "Copy failed. Select and copy manually.",
  "securityPolicy.pgp.unavailable":
    "We haven't published a key yet. Email us in plain text and we'll agree on an encrypted channel before you send any detail.",

  "securityPolicy.outro.titleTop": "Security is",
  "securityPolicy.outro.titleEm": "community work.",
  "securityPolicy.outro.sub":
    "Thank you to everyone who helps keep QueerPulse safe.",
  "securityPolicy.outro.cta": "Contact the security team",
};

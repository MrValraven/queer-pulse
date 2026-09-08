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
  // ── About link dialogs ──────────────────────────────────────────────────
  // Each block is the digest shown when one of the page's reference links opens
  // <AboutLinkModal> instead of navigating. Written for the claim that raised
  // it, so the two guidelines entries differ even though both land on the same
  // clause. Registry: aboutLinks.data.ts.
  "about.linkModal.intersections.eyebrow": "Intersectionality",
  "about.linkModal.intersections.label": "Living at the intersections",
  "about.linkModal.intersections.title":
    "More than one thing <em>at once.</em>",
  "about.linkModal.intersections.lead":
    "The guide this position rests on: how race, faith, class and disability meet queerness in Lisbon, in members' own words.",
  "about.linkModal.intersections.p1":
    "Being queer and a person of colour, queer and religious, queer and working class, queer and disabled: these identities do not stack neatly. The guide exists for the members living that, and as a visible commitment that queerness covers many kinds of person.",
  "about.linkModal.intersections.p2":
    "It is built around member voices, with organisations and resources attached to each section, and it grows as members add to it.",
  "about.linkModal.intersections.point.race.title": "Race and ethnicity.",
  "about.linkModal.intersections.point.race.body":
    "Portugal's colonial history shapes this city in ways that are obvious if you are living them. The section covers navigating queer spaces as a person of colour, and the QTIPOC groups that exist here.",
  "about.linkModal.intersections.point.faith.title": "Faith and religion.",
  "about.linkModal.intersections.point.faith.body":
    "A changing Catholic context, other traditions, and the members who hold faith and queerness together. Being secular sits there too.",
  "about.linkModal.intersections.point.class.title": "Class and economics.",
  "about.linkModal.intersections.point.class.body":
    "Queer social life carries an unspoken class character. The section names Lisbon's cost shift and what we do about access: sliding-scale gatherings, a free forum, and membership that stays free for anyone who cannot contribute.",
  "about.linkModal.intersections.cta": "Read the full intersectionality guide",

  "about.linkModal.guidelinesExclusion.eyebrow": "Community guidelines",
  "about.linkModal.guidelinesExclusion.label": "Where political speech ends",
  "about.linkModal.guidelinesExclusion.title":
    "Political speech <em>stays political.</em>",
  "about.linkModal.guidelinesExclusion.lead":
    "The guidelines clause this commitment rests on, and the hard lines it sits next to.",
  "about.linkModal.guidelinesExclusion.p1":
    "Criticising a state, its government, its military, or its ideology is political speech, and moderators handle it as political speech. It becomes a Code of Conduct matter when it lands on a person.",
  "about.linkModal.guidelinesExclusion.p2":
    "Advocacy aimed at a class of member sits on the far side of that line. Campaigning for the exclusion of trans members from this community is a Code of Conduct breach, whatever vocabulary it borrows.",
  "about.linkModal.guidelinesExclusion.point.hardLines.title":
    "Always a Code of Conduct matter.",
  "about.linkModal.guidelinesExclusion.point.hardLines.body":
    "Harassment, doxxing, outing someone without their consent, threats, sharing private conversations or photos, and discrimination on any protected basis.",
  "about.linkModal.guidelinesExclusion.point.bothDirections.title":
    "One test, applied by moderators.",
  "about.linkModal.guidelinesExclusion.point.bothDirections.body":
    "Is this about a state and its conduct, or about a person and who they are. That question decides every report of this kind.",
  "about.linkModal.guidelinesExclusion.point.reporting.title":
    "Reporting is supported.",
  "about.linkModal.guidelinesExclusion.point.reporting.body":
    "Moderators read every report. Confirmed breaches lead to a warning, suspension, or removal, and the person who filed is updated at each stage.",
  "about.linkModal.guidelinesExclusion.cta": "Read the full guidelines",

  "about.linkModal.transHealthcare.eyebrow": "Trans healthcare · Portugal",
  "about.linkModal.transHealthcare.label": "Trans healthcare in Portugal",
  "about.linkModal.transHealthcare.title":
    "Your journey, <em>step by step.</em>",
  "about.linkModal.transHealthcare.lead":
    "A practical guide to gender-affirming healthcare in Portugal, built from community knowledge and kept current by members.",
  "about.linkModal.transHealthcare.p1":
    "It walks the real pathways: HRT through the SNS, HRT privately, legal name change, gender marker, and surgery access. Each one breaks into the steps you actually take, with what to bring, who to call, and what to expect at every appointment.",
  "about.linkModal.transHealthcare.p2":
    "It reflects the system as of June 2026 and it is community knowledge, so verify current waiting times with ILGA Portugal or your GP. ILGA Portugal also offers free legal accompaniment through the SNS process, and the guide says so on every path.",
  "about.linkModal.transHealthcare.point.hrt.title":
    "HRT, through the SNS or privately.",
  "about.linkModal.transHealthcare.point.hrt.body":
    "Registering with a centro de saúde, the GP referral, the gender clinic assessment, the prescription, and the blood tests that follow.",
  "about.linkModal.transHealthcare.point.legal.title":
    "Legal name and gender marker.",
  "about.linkModal.transHealthcare.point.legal.body":
    "The Lei n.º 38/2018 process at the Conservatória do Registo Civil, the waiting period, and updating your documents afterwards.",
  "about.linkModal.transHealthcare.point.clinicians.title":
    "Affirming clinicians.",
  "about.linkModal.transHealthcare.point.clinicians.body":
    "Key contacts, plus the Solidarity Pricing Registry for trans-affirming GPs and psychiatrists.",
  "about.linkModal.transHealthcare.cta": "Read the full trans healthcare guide",

  "about.linkModal.guidelinesSpeech.eyebrow": "Community guidelines",
  "about.linkModal.guidelinesSpeech.label":
    "How Palestine advocacy is moderated",
  "about.linkModal.guidelinesSpeech.title":
    "One test, <em>both directions.</em>",
  "about.linkModal.guidelinesSpeech.lead":
    "The guidelines clause that governs political speech, and the hard lines it sits next to.",
  "about.linkModal.guidelinesSpeech.p1":
    "Advocacy for Palestinian liberation is welcome here and will not be removed for making people uncomfortable. Criticising a state, its government, its military, or its ideology is political speech, and moderators handle it as political speech.",
  "about.linkModal.guidelinesSpeech.p2":
    "It becomes a Code of Conduct matter when it lands on a person. Holding a member answerable for a state's actions because of their ethnicity, religion, or nationality is discrimination under the hard lines.",
  "about.linkModal.guidelinesSpeech.point.antisemitism.title":
    "Antisemitism is a breach.",
  "about.linkModal.guidelinesSpeech.point.antisemitism.body":
    "Including conspiracy framing, and holding Jewish members answerable for a state's actions.",
  "about.linkModal.guidelinesSpeech.point.antiPalestinian.title":
    "Anti-Palestinian racism is a breach.",
  "about.linkModal.guidelinesSpeech.point.antiPalestinian.body":
    "Including treating Palestinian or Arab members as suspect by default, and harassment of any member over their nationality, ethnicity, or religion.",
  "about.linkModal.guidelinesSpeech.point.test.title":
    "One question decides it.",
  "about.linkModal.guidelinesSpeech.point.test.body":
    "Moderators ask whether a post is about a state and its conduct, or about a person and who they are. QueerPulse's own position on Palestine leaves that question untouched.",
  "about.linkModal.guidelinesSpeech.cta": "Read the full guidelines",

  "about.linkModal.governanceAllocations.eyebrow": "Governance & transparency",
  "about.linkModal.governanceAllocations.label": "How allocations are decided",
  "about.linkModal.governanceAllocations.title":
    "What comes in, <em>where it goes.</em>",
  "about.linkModal.governanceAllocations.lead":
    "Finances are published every quarter, and the decisions that move money are made in the open.",
  "about.linkModal.governanceAllocations.p1":
    "QueerPulse is funded by the people who use it. Income and expenditure are published each quarter, line by line, with no investor interests and no growth targets sitting behind them.",
  "about.linkModal.governanceAllocations.p2":
    "Quarterly surpluses go into an operational reserve targeted at three months of running costs. Once that target is met, additional surplus goes in full to the community micro-grants fund. Capital gets redistributed.",
  "about.linkModal.governanceAllocations.point.partners.title":
    "Partner money is restricted.",
  "about.linkModal.governanceAllocations.point.partners.body":
    "It is tied to a named scope, such as the Mental Health Fund or community events, and carries no editorial, governance, or platform influence.",
  "about.linkModal.governanceAllocations.point.votes.title":
    "Funding changes go to a vote.",
  "about.linkModal.governanceAllocations.point.votes.body":
    "Accepting funding outside our usual sources needs a majority member vote. Every open proposal is listed with its tally, and past ones stay visible with their result.",
  "about.linkModal.governanceAllocations.point.record.title":
    "The record stays up.",
  "about.linkModal.governanceAllocations.point.record.body":
    "Community health figures, moderation outcomes, and appeals are published alongside the money, every quarter.",
  "about.linkModal.governanceAllocations.cta": "See the full governance page",

  "about.linkModal.migration.eyebrow": "Intersectionality",
  "about.linkModal.migration.label": "Race, migration and queer Lisbon",
  "about.linkModal.migration.title":
    "Race, migration, and <em>queer Lisbon.</em>",
  "about.linkModal.migration.lead":
    "The part of the intersectionality guide this position draws on.",
  "about.linkModal.migration.p1":
    "Being a queer person of colour in Lisbon means navigating two things at once that mainstream spaces rarely design for at the same time. Portugal's colonial history shapes this city in ways that are visible if you are living them and invisible if you are not.",
  "about.linkModal.migration.p2":
    "The guide covers what to know arriving here, what happens when queer spaces treat race as an afterthought, and the community groups that exist for QTIPOC members.",
  "about.linkModal.migration.point.queerSpaces.title":
    "When queer isn't enough.",
  "about.linkModal.migration.point.queerSpaces.body":
    "What members describe about racism inside queer spaces here, and the guidelines that make it reportable.",
  "about.linkModal.migration.point.arriving.title": "Arriving in Portugal.",
  "about.linkModal.migration.point.arriving.body":
    "Colonial history, how it lands on Brazilian, PALOP and South Asian members, and where to find people who have done this before you.",
  "about.linkModal.migration.point.cost.title": "Cost as a barrier.",
  "about.linkModal.migration.point.cost.body":
    "Lisbon's cost shift, the class character of queer social life, and the access measures we hold ourselves to.",
  "about.linkModal.migration.cta": "Read the full intersectionality guide",

  "about.linkModal.sexualHealth.eyebrow": "Sexual health",
  "about.linkModal.sexualHealth.label": "Sexual health resources",
  "about.linkModal.sexualHealth.title":
    "Undetectable = <em>Untransmittable.</em>",
  "about.linkModal.sexualHealth.lead":
    "Testing, PrEP and HIV resources in Lisbon, with a community-reviewed clinic directory.",
  "about.linkModal.sexualHealth.p1":
    "People living with HIV who are on effective treatment and have an undetectable viral load cannot sexually transmit HIV to their partners. It is scientifically established and endorsed by the CDC, the WHO, and more than 400 health organisations worldwide.",
  "about.linkModal.sexualHealth.p2":
    "HIV treatment is free for every resident through the SNS, and 97% of people on treatment in Portugal reach an undetectable viral load within six months.",
  "about.linkModal.sexualHealth.point.testing.title": "Where to get tested.",
  "about.linkModal.sexualHealth.point.testing.body":
    "Community-reviewed clinics across Lisbon, filterable by free/SNS, NGO, pharmacy and private, with what each one tests for and what to bring.",
  "about.linkModal.sexualHealth.point.prep.title": "PrEP through the SNS.",
  "about.linkModal.sexualHealth.point.prep.body":
    "Free for eligible people and over 99% effective when taken correctly. The guide walks the eligibility check, the blood tests, and the prescription.",
  "about.linkModal.sexualHealth.point.living.title": "Living with HIV.",
  "about.linkModal.sexualHealth.point.living.body":
    "Current information, support services, and answers to the questions people are most afraid to ask.",
  "about.linkModal.sexualHealth.cta": "Read the full sexual health guide",

  "about.linkModal.governanceOverview.eyebrow": "Governance & transparency",
  "about.linkModal.governanceOverview.label": "How QueerPulse is governed",
  "about.linkModal.governanceOverview.title":
    "How we run this, and who <em>decides.</em>",
  "about.linkModal.governanceOverview.lead":
    "The record of how QueerPulse is governed, how decisions get made, and what happens when things go wrong.",
  "about.linkModal.governanceOverview.p1":
    "Moderation is done by a small team of members who agreed to take on the role. They answer to the advisory council, and any decision can be appealed within 14 days. The advisory council hears the appeal, and its outcome is final.",
  "about.linkModal.governanceOverview.p2":
    "Reports are reviewed within 48 hours, same-day where someone's safety is at risk, and the figures behind that process are published every quarter.",
  "about.linkModal.governanceOverview.point.council.title":
    "The advisory council.",
  "about.linkModal.governanceOverview.point.council.body":
    "It reviews appeals, proposes platform changes, and serves as the accountability layer. Members serve one-year terms and can be removed by a two-thirds community vote.",
  "about.linkModal.governanceOverview.point.finances.title":
    "Finances in the open.",
  "about.linkModal.governanceOverview.point.finances.body":
    "Income and expenditure published quarterly, an operational reserve targeted at three months of running costs, and surplus beyond it redirected to micro-grants.",
  "about.linkModal.governanceOverview.point.proposals.title":
    "Proposals and votes.",
  "about.linkModal.governanceOverview.point.proposals.body":
    "Council removals and funding changes go to a member vote. Every proposal stays visible with its result.",
  "about.linkModal.governanceOverview.cta": "See the full governance page",

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
    "The best way to understand QueerPulse is to be part of it.",
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
    "<b>Keep going after the march.</b> The work that follows a demonstration is where most of the actual change happens.",
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
  "activism.volunteer.seeRoleCta": "See the role",
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
    "Every cookie QueerPulse sets and everything it keeps on your device, named in full, with what each one does and how long it lasts. No advertising or analytics cookies.",
  "cookies.eyebrow": "Cookies",
  "cookies.h1": "Everything we <em>store,</em> and why.",
  "cookies.sub":
    "The complete list, in plain language: every cookie we set and everything we keep on your device. Four cookies sign you in and keep the site safe. One thing is optional, and it's off until you say otherwise.",
  "cookies.essential.title": "Strictly necessary",
  "cookies.essential.body":
    "Needed to sign you in and keep your account secure. Without these the site can't tell your requests from anyone else's, so they can't be switched off.",
  "cookies.functional.title": "Your settings, on your device",
  "cookies.functional.body":
    "Not cookies: these stay in your browser and are never sent to us. They hold the choices you made and the work you haven't finished, so clearing them loses your settings and any unsent drafts.",
  "cookies.monitoring.title": "Error & crash reporting",
  "cookies.monitoring.body":
    "The one thing you can switch off, and it starts off. Nothing is loaded or stored until you turn it on in your privacy choices.",
  "cookies.alwaysOn": "Always on",
  "cookies.optIn": "Off unless you turn it on",
  "cookies.columns.name": "Name",
  "cookies.columns.storedWhere": "Stored where",
  "cookies.columns.expires": "Expires",
  "cookies.noAds.title": "We don't run ads",
  "cookies.noAds.body":
    "So there's no ad-tech category here, and no analytics one either. Nothing on this page profiles you or follows you to another site.",
  "cookies.summary.title": "Your <em>summary</em>",
  "cookies.summary.essential": "Cookies we set",
  "cookies.summary.functional": "Stored on your device",
  "cookies.summary.monitoring": "Error reporting",
  "cookies.summary.count_one": "{count} entry",
  "cookies.summary.count_other": "{count} entries",
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
    "We'll compile everything tied to your account and make it available to download here.",
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
    "Object to a specific way we're using your data, such as error monitoring.",
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
  "dsar.scopes.membership.b": "Membership",
  "dsar.scopes.membership.s": "Your tier, join date, and who invited you",
  "dsar.scopes.moderation.b": "Moderation",
  "dsar.scopes.moderation.s": "Reports you filed or were named in",
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
  "dsar.past.resolved": "Resolved",
  "dsar.past.status.received": "Received",
  "dsar.past.status.inReview": "In review",
  "dsar.past.status.rejected": "Rejected",
  "dsar.past.loading": "Loading your past requests…",
  "dsar.past.error":
    "We couldn't load your past requests. Please try again shortly.",
  "dsar.past.empty": "You haven't filed any requests yet.",
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
  "guidelines.clause05.titlePre": "Repair beyond the ",
  "guidelines.clause05.titleEm": "apology",
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
  // PRD-271: the hero has promised "Search below" since the copy was written,
  // on a page that had no input of any kind. These back the real search.
  // `_one`/`_other` are the resolver's CLDR plural suffixes; interpolation is
  // single-brace.
  "help.search.label": "Search the help centre",
  "help.search.placeholder": "Search every answer",
  "help.search.summary_one":
    "1 answer matches \u201c{query}\u201d, across every topic.",
  "help.search.summary_other":
    "{count} answers match \u201c{query}\u201d, across every topic.",
  "help.search.clear": "Clear search",
  "help.search.inCategory": "In category:",
  "help.search.resultsHead": "Matching <em>answers</em>",
  "help.search.emptyTitle": "Nothing here matches \u201c{query}\u201d",
  "help.search.emptyBody":
    "Try a shorter word or a different spelling. Or ask us directly: a real person reads every message.",
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
    "Head to <settingsLink>Settings</settingsLink>, then Profile. Changes apply everywhere immediately.",
  "help.qa.privateProfile.q": "Can I make my profile private?",
  "help.qa.privateProfile.a":
    "Yes, in <settingsLink>Settings</settingsLink>, then Privacy. A private profile is still visible to people you're connected with. It just <strong>won't appear in search or the public directory</strong>.",
  "help.qa.unknownSession.q":
    "I don't recognise a device in my active sessions. What now?",
  "help.qa.unknownSession.a":
    "Sign that session out from <sessionsLink>your active sessions</sessionsLink>. Signing in runs through Google, so review your Google account's security too, since anyone with access to it can get in here. Then <contactLink>tell us what happened</contactLink> and we'll help you lock things down.",
  "help.qa.deleteAccount.q": "How do I delete my account?",
  "help.qa.deleteAccount.a":
    "In <settingsLink>Settings</settingsLink>, then Account, at the bottom. This is permanent. See the Privacy Policy for what's retained and for how long.",
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
    "In <settingsLink>Settings</settingsLink>, then Notifications, toggle each category independently. QueerPulse notifies you in the app and, if you allow it, by push. It sends no email.",
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
  "partners.section.title": "Our <em>partners</em>",
  "partners.section.sub": "Filter isn't available yet. Here's the full roster.",
  "partners.card.viewCta": "View profile",
  "partners.empty.title": "No partners listed yet",
  "partners.empty.body":
    "We're still building the roster. If your organisation works alongside us on the ground, apply and we'll vet it for alignment before listing it here.",
  "partners.loadingMore": "Loading more partners…",
  "partners.loadMoreCta": "Load more partners",
  "partners.why.title": "Why we <em>partner</em>",
  "partners.why.p1": "Some things are bigger than QueerPulse.",
  "partners.why.p2":
    "Legal support, healthcare, youth work, and other specialist services are best handled by organisations with the experience to do them properly. We'd rather connect you with people we know and trust than send you off to search for yourself.",
  "partners.why.p3":
    "When we partner with an organisation, we want the relationship to go both ways. Referrals, volunteers, shared resources, and sometimes funding can help turn a listing into something more useful.",
  "partners.become.title": "Want to <em>partner with us?</em>",
  "partners.become.body":
    "If your organisation does aligned work in or around Lisbon, we'd like to hear from you.",
  "partners.become.applyCta": "Apply to partner",
  "partners.become.contactCta": "Ask us first",
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
  "pressKit.outro.askCta": "Ask the press desk",
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
  "communitiesAbout.hero.eyebrow": "Communities",
  "communitiesAbout.hero.title":
    "How communities work, and why they <em>matter</em>",
  "communitiesAbout.hero.sub":
    "Community is the backbone of queer life. We look after each other, and that only works when we show up together. Here's how to find yours, in three steps.",
  "communitiesAbout.how.find.title": "Find your people",
  "communitiesAbout.how.find.body":
    "Browse communities by interest, scene, or neighbourhood until one feels like yours.",
  "communitiesAbout.how.welcome.title": "Get a real welcome",
  "communitiesAbout.how.welcome.body":
    "The people who run it say hello and show you around, so you never start from nothing.",
  "communitiesAbout.how.belong.title": "Show up and belong",
  "communitiesAbout.how.belong.body":
    "Join the conversation, come to gatherings, and become a face people are glad to see.",
  "communitiesAbout.trust.invite": "Invite-only",
  "communitiesAbout.trust.keeper": "Run by real people",
  "communitiesAbout.trust.noAlgorithm": "No feeds, no algorithm",
  "communitiesAbout.outro.title": "Your people are already here.",
  "communitiesAbout.outro.sub":
    "Request an invite and we'll point you to the communities that feel like home.",

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
    "<strong>Contact information</strong>: your email address, which comes from your Google account and is used to sign you in. QueerPulse does not send email.",
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
  "privacy.howWeUse.item5":
    "Send you the in-app and push notifications you've turned on",
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
    "<strong>Service providers</strong>, the companies that host the platform, store your uploads, place addresses on a map and (with your consent) monitor for errors, see only what's needed for their specific job.",
  "privacy.whoSees.p4":
    "<strong>Nobody else.</strong> We don't sell or rent your data to any third party, ever.",
  "privacy.retention.title": "How long we keep it",
  "privacy.retention.p1":
    "Your profile, your messages, your posts, your connections and your uploads are kept for as long as your account is open. Your RSVPs are kept too, so a gathering you went to stays in your own history and its host keeps their headcount. What clears on its own is the attendance detail listed below.",
  "privacy.retention.clearsHeading": "Things that clear on their own",
  "privacy.retention.p3":
    "These run on a schedule, whether or not you do anything:",
  "privacy.retention.clears.gathering":
    "<strong>What you told a host about access or dietary needs, and the record that you checked in</strong>: 30 days after the gathering. Your RSVP row itself stays, so past gatherings keep their attendance count.",
  "privacy.retention.clears.notifications":
    "<strong>Read notifications</strong>: 90 days. Unread ones are kept until you have seen them.",
  "privacy.retention.clears.push":
    "<strong>Unused push-notification registrations</strong>: 90 days.",
  "privacy.retention.clears.cardVerification":
    "<strong>Card verification records</strong>: 90 days.",
  "privacy.retention.clears.export":
    "<strong>A data export you asked for</strong>: the download link works for 7 days, and the copy is deleted after 30.",
  "privacy.retention.clears.sessions":
    "<strong>Sessions</strong>: 30 days after you sign out or they expire.",
  "privacy.retention.clears.invites":
    "<strong>Invites you send</strong>: 7 days, then they expire.",
  "privacy.retention.clears.housing":
    "<strong>Housing listings</strong>: hidden from browsing after 60 days. They are never deleted, and you can extend or repost one.",
  "privacy.retention.deleteHeading": "If you delete your account",
  "privacy.retention.p2":
    "Deleting your account opens a 30-day grace period, and you can cancel any time inside it by signing back in. We warn you 3 days before the deadline. After that your account and the data attached to it are permanently erased, including the files you uploaded.",
  "privacy.retention.deleted.keptIntro": "Three things are deliberately kept:",
  "privacy.retention.deleted.keptModeration":
    "<strong>Moderation records</strong> stay, with your name removed from them, so that deleting an account cannot erase the record of reports you filed about other people.",
  "privacy.retention.deleted.keptContent":
    "<strong>Content other members depend on</strong> stays, such as a gathering you were hosting or a listing you posted, with your name removed from it.",
  "privacy.retention.beyondHeading": "What we keep beyond your account",
  "privacy.retention.beyond.body":
    "Moderation records, consent records and records of the data requests you made are kept as evidence, with your name removed from them where it can be.",
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
  "privacy.yourRights.item7":
    "<strong>Withdraw consent</strong>: switch off anything you opted into",
  "privacy.yourRights.howHeading": "How to exercise each one",
  "privacy.yourRights.how.access":
    "<strong>Access</strong>: download your data from Settings, or file a request through the form.",
  "privacy.yourRights.how.rectification":
    "<strong>Rectification</strong>: edit your own profile, or file a request for anything you cannot edit yourself.",
  "privacy.yourRights.how.erasure":
    "<strong>Erasure</strong>: delete your account from Settings, or file a request to remove specific data.",
  "privacy.yourRights.how.objection":
    "<strong>Objection</strong>: file a request through the form. To object to error monitoring, switch it off in your privacy settings.",
  "privacy.yourRights.how.portability":
    "<strong>Portability</strong>: download your data from Settings. It comes as JSON, or as a zip of CSV files with your uploads.",
  "privacy.yourRights.how.restriction":
    "<strong>Restriction</strong>: file a request through the form and describe what you want restricted.",
  "privacy.yourRights.how.withdrawConsent":
    "<strong>Withdraw consent</strong>: switch it off wherever you switched it on. Your privacy settings for error monitoring, your flatmate profile for identity fields, your browser for push.",
  "privacy.yourRights.p1":
    "To exercise any of these, use our data request form. It's free and we respond within 30 days.",
  "privacy.yourRights.slaExtension":
    "If a request is unusually complex we may need longer, and we will tell you why inside the first month.",
  "privacy.yourRights.responseChannel":
    "A resolved request arrives as an in-app notification with a note on the outcome. Nothing is emailed.",
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
    "We work with a small number of service providers. Each sees only what it needs for the job it does:",
  "privacy.thirdParties.google":
    "<strong>Google</strong>: powers Sign in with Google, our only login. Google confirms who you are and shares your name, email address and profile photo.",
  "privacy.thirdParties.railway":
    "<strong>Railway</strong>: hosts the platform and the database where everything you post is stored.",
  "privacy.thirdParties.tigris":
    "<strong>Tigris</strong>: stores the files you upload, in a private store, reached through Railway's bucket service.",
  "privacy.thirdParties.vercel":
    "<strong>Vercel</strong>: serves the QueerPulse website to your browser.",
  "privacy.thirdParties.openFreeMap":
    "<strong>OpenFreeMap</strong>: supplies the map tiles you see. Your browser fetches them, so OpenFreeMap sees the map area being viewed.",
  "privacy.thirdParties.openStreetMap":
    "<strong>OpenStreetMap</strong>: turns a typed address into a point on a map. We send the address from our own server, so OpenStreetMap never sees who asked.",
  "privacy.thirdParties.googleMaps":
    "<strong>Google Maps</strong>: when you paste a Google Maps link into a listing, we follow it from our server to read the location out of it.",
  "privacy.thirdParties.klipy":
    "<strong>Klipy</strong>: powers GIF search in messages. When you search for a GIF your search term reaches Klipy; your messages never do.",
  "privacy.thirdParties.pushService":
    "<strong>Your browser's push service</strong>: Google, Mozilla, Apple or Microsoft, depending on the browser. It delivers the push notifications you have turned on, and receives only the encrypted notification.",
  "privacy.thirdParties.embeds":
    "Some housing listings include a virtual tour hosted on YouTube or Matterport. Opening one loads it from that company's servers, which means they see your IP address. Nothing else about you is shared with them.",
  "privacy.thirdParties.optInIntro":
    "With your <strong>explicit opt-in</strong>, we also use:",
  "privacy.thirdParties.optItem1":
    "<strong>Sentry</strong>: error monitoring. Nothing is sent unless you turn it on. It receives no advertising data and builds no profile of you.",
  "privacy.thirdParties.transfersLabel": "To be confirmed",
  "privacy.thirdParties.transfers":
    "Where each of these providers processes data, and the safeguard that covers anything processed outside the European Economic Area, has to be filled in here by a person who has checked it with each provider. We would rather leave this open than publish a location we have not verified.",
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
    "The plain version: QueerPulse is built and run by a group of volunteers, acting in a personal capacity. This page tells you who's behind it, how to reach us, and the law we answer to.",
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
    "The volunteers who run QueerPulse are responsible for the pages QueerPulse publishes itself: this site's own writing, the magazine and the guides. Members are responsible for what they post. If something a member posted needs attention, report it in the app or email us, and a real person will look at it.",
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
  "changelog.tag.report": "Open the report form",
  // Section 11, core member journeys (PRD-01..PRD-18).
  // Section 4 (Communities), 6 Sep 2026.
  "changelog.entries.photos-match-your-screen-instead-of-a-guess.title":
    "Photos match your screen instead of a guess",
  "changelog.entries.photos-match-your-screen-instead-of-a-guess.body":
    "Images now request the resolution your screen can show, so they load lighter and look sharper. Picking and cropping a photo was rebuilt too.",
  "changelog.entries.you-can-step-back-from-a-connection-without-blocking.title":
    "You can step back from a connection without blocking",
  "changelog.entries.you-can-step-back-from-a-connection-without-blocking.body":
    "The connection menu now has a Remove connection action. It asks you to confirm, the other person is not told, and your messages stay in your inbox.",
  // ── Section 10 (Resources, about and civic), 6 Sep 2026 ─────────────────
  "changelog.entries.help-centre-search.title": "Search the help centre",
  "changelog.entries.help-centre-search.body":
    "A search box now looks through every answer at once, so your question finds its answer even under a tab you would not have opened. It matches Portuguese too, accents optional.",
  "changelog.entries.how-communities-work-fits-on-one-screen.title":
    "How communities work now fits on one screen",
  "changelog.entries.how-communities-work-fits-on-one-screen.body":
    "The communities explainer is now one wider screen: the three steps to joining sit side by side, with the invite button at the end.",
  "changelog.entries.pick-your-neighbourhood-from-a-list.title":
    "Pick your neighbourhood from a list",
  "changelog.entries.pick-your-neighbourhood-from-a-list.body":
    "Your profile neighbourhood is now a select: the 24 Lisbon freguesias plus bairros like Príncipe Real. The same list drives the directory filter.",
  "changelog.entries.one-place-to-switch-between-light-and-dark.title":
    "One place to switch between light and dark",
  "changelog.entries.one-place-to-switch-between-light-and-dark.body":
    "The footer carried a second theme switch right beside the language buttons. It is gone. Light and dark still live in the account menu and the top bar, alongside the rest of your own settings.",
  "changelog.entries.a-library-of-shared-values-to-choose-from.title":
    "A library of shared values to choose from",
  "changelog.entries.a-library-of-shared-values-to-choose-from.body":
    "Founding a community no longer starts at an empty field. Browse eighty shared values grouped under ten themes, from consent and privacy to access, money, conflict and repair, search them by wording, and tick the ones that fit. Writing your own is still there and still first. The same picker is in the edit panel, so an existing community can pick up a value it never got around to writing down.",
  "changelog.entries.find-any-admin-page-by-name.title":
    "Find any admin page by name",
  "changelog.entries.find-any-admin-page-by-name.body":
    "The admin menu opens with a search field. Type part of a page name and the menu narrows to what matches, section headings and all, so nothing stays hidden inside a closed group. Enter opens the first result.",
  "changelog.entries.see-what-a-save-will-change-before-you-save-it.title":
    "See what a save will change before you save it",
  "changelog.entries.see-what-a-save-will-change-before-you-save-it.body":
    "The community settings form now lists what pressing Save is about to write, right above the button. Shared values name the ones going in and the ones coming out, and the form says plainly that changing them asks every member to agree again. The governance trail reads the same way: a values edit shows what was added and what was removed instead of printing the whole list twice.",
  "changelog.entries.the-tag-list-folds-away-once-you-have-picked.title":
    "The tag list folds away once you have picked",
  "changelog.entries.the-tag-list-folds-away-once-you-have-picked.body":
    "Editing a community used to mean scrolling past all 53 tags to reach anything below them. The list now shows only the tags you chose, with a button to open the rest when you want to change them.",
  "changelog.entries.switch-language-from-your-account-menu.title":
    "Switch language from your account menu",
  "changelog.entries.switch-language-from-your-account-menu.body":
    "English and Portugu\u00eas now sit in your account menu, beside the light and dark switch, and in your account sheet on a phone. One tap, no trip to Settings.",
  "changelog.entries.the-theme-switch-moves-into-your-account-menu.title":
    "The theme switch moves into your account menu",
  "changelog.entries.the-theme-switch-moves-into-your-account-menu.body":
    "The light and dark switch now lives in your account menu, beside Saved and Settings, or your account sheet on a phone. Signed out, it stays in the top bar.",
  "changelog.entries.the-account-menu-drops-the-maintenance-controls.title":
    "The account menu drops the maintenance controls",
  "changelog.entries.the-account-menu-drops-the-maintenance-controls.body":
    "Populate platform, Flow simulations and the Navigation switch now appear only for platform admins. Your menu ends at your own settings and sign out.",
  "changelog.entries.the-homepage-personas-take-turns.title":
    "The homepage personas take turns",
  "changelog.entries.the-homepage-personas-take-turns.body":
    "The persona showcase now advances every twenty seconds and stops for good once you pick one. It pauses under your pointer and never starts with reduced motion on.",
  "changelog.entries.persona-cards-now-show-the-banner.title":
    "Persona cards now show the banner",
  "changelog.entries.persona-cards-now-show-the-banner.body":
    "Cards in the persona directory now carry your banner across the top, framed the way you positioned it. A persona without one keeps the soft colour wash.",
  "changelog.entries.save-profile-stays-off-until-you-change-something.title":
    "Save profile stays off until you change something",
  "changelog.entries.save-profile-stays-off-until-you-change-something.body":
    "Save profile is dimmed until you actually change something, and while the draft is untouched the other button reads Go back.",
  "changelog.entries.hear-your-name-before-you-save-it.title":
    "Hear your name before you save it",
  "changelog.entries.hear-your-name-before-you-save-it.body":
    "The editor now has a hear it button under the name pronunciation field, using the same voice visitors get, so you can try a spelling and adjust until it sounds like you.",
  "changelog.entries.every-cookie-we-set-now-has-its-real-name.title":
    "Every cookie we set now has its real name",
  "changelog.entries.every-cookie-we-set-now-has-its-real-name.body":
    "The cookie page now lists the four cookies we really set, what each does and how long it lasts. The same list opens inside your privacy choices.",
  "changelog.entries.a-safe-space-badge-has-to-be-earned.title":
    "A safe space badge has to be earned",
  "changelog.entries.a-safe-space-badge-has-to-be-earned.body":
    "The three-visit bar is now checked before a badge is granted. The team can still grant one on fewer visits with a recorded reason, and the badge shows the real count.",
  "changelog.entries.rooms-in-a-vetted-group-are-for-its-members.title":
    "Rooms in a vetted group are for its members",
  "changelog.entries.rooms-in-a-vetted-group-are-for-its-members.body":
    "Rooms posted inside a screened housing group are now visible only to its members. The group, its city and its house rules stay open.",
  "changelog.entries.a-viewing-that-tells-you-what-happened.title":
    "A viewing that tells you what happened",
  "changelog.entries.a-viewing-that-tells-you-what-happened.body":
    "Viewing requests, acceptances, alternative times, refusals and cancellations all reach you in the app now. Before, it happened in silence and you had to open the viewings page to find out.",
  "changelog.entries.the-exact-address-once-you-connect.title":
    "The exact address, once you connect",
  "changelog.entries.the-exact-address-once-you-connect.body":
    "Listers can now add a street address. It stays private, shown only to people they connect with or accept a viewing from, and everyone else sees the neighbourhood.",
  "changelog.entries.an-answer-on-your-housing-application.title":
    "An answer on your housing application",
  "changelog.entries.an-answer-on-your-housing-application.body":
    "You now get a notification when a co-op or a vetted group decides on your request to join, and both pages show where your application stands.",
  "changelog.entries.filter-for-pets-furnishing-and-deposit.title":
    "Filter for pets, furnishing and deposit",
  "changelog.entries.filter-for-pets-furnishing-and-deposit.body":
    "Furnished and Pets welcome are filters now. Listers can also state the deposit and you can cap it, and a home with no stated deposit is left out of a capped search.",
  "changelog.entries.a-warning-before-your-listing-expires.title":
    "A warning before your listing expires",
  "changelog.entries.a-warning-before-your-listing-expires.body":
    "Listings run for sixty days. Yours now warns you a week before it drops off the board, and the card shows how many days are left.",
  "changelog.entries.landlord-recommendations-say-what-they-are.title":
    "Landlord recommendations say what they are",
  "changelog.entries.landlord-recommendations-say-what-they-are.body":
    "Writing a landlord recommendation now means saying you rented from them and roughly when. Each one is labelled self-attested and unverified, and the person named can reply.",
  "changelog.entries.counts-and-dates-you-can-trust.title":
    "Counts and dates you can trust",
  "changelog.entries.counts-and-dates-you-can-trust.body":
    "Every count on the directory and the safe spaces list is now live, and every date is real. The visa and arriving guides carry a review date.",
  "changelog.entries.reporting-without-an-account.title":
    "Report something without an account",
  "changelog.entries.reporting-without-an-account.body":
    "Sending a report without an account used to fail. It works now, whether you are signed in or out, from the safety pages, a listing, a gathering or someone's profile.",
  "changelog.entries.report-from-where-you-are.title":
    "Report from where you meet it",
  "changelog.entries.report-from-where-you-are.body":
    "A gathering can now be reported from its own page, without joining the guest list first. Volunteering opportunities and profiles have their own Report action too.",
  "changelog.entries.a-receipt-when-you-report.title":
    "A receipt the moment you report",
  "changelog.entries.a-receipt-when-you-report.body":
    "Filing a report now puts a confirmation in your notifications straight away, with the case reference, so you keep it even if you close the success message.",
  "changelog.entries.every-decision-carries-a-reason.title":
    "Every decision comes with its reason",
  "changelog.entries.every-decision-carries-a-reason.body":
    "A moderator now has to write the reason you receive before recording a warning, restriction, suspension, ban or takedown. Blocking and reporting at once carries it too.",
  "changelog.entries.appeal-dates-you-can-hold-us-to.title":
    "Appeal dates you can hold us to",
  "changelog.entries.appeal-dates-you-can-hold-us-to.body":
    "The appeal page now shows how long you have to file, and your appeal shows the date we owe you an answer by.",
  "changelog.entries.guides-and-partners-without-signing-in.title":
    "Public pages that actually load when you are signed out",
  "changelog.entries.guides-and-partners-without-signing-in.body":
    "The glossary, the partner pages, the volunteering list, the governance record and the legal aid and testing listings now load for signed-out visitors.",
  "changelog.entries.a-code-to-follow-your-concern.title":
    "A code to follow up a concern you raised",
  "changelog.entries.a-code-to-follow-your-concern.body":
    "Raising a concern without an account now gives you a reference code. Keep it and you can check whether your concern is waiting, being looked at, or closed.",
  "changelog.entries.the-decision-log-can-grow.title":
    "The decision log can record the next decision",
  "changelog.entries.the-decision-log-can-grow.body":
    "The governance team can now write a new entry in the public record in English and Portuguese, edit it and reorder it, without waiting for a release.",
  "changelog.entries.partners-keep-their-own-page.title":
    "Partners can keep their own page accurate",
  "changelog.entries.partners-keep-their-own-page.body":
    "An approved partner organisation now has a partner profile editor in its account, for the phone number, address and description. The partnership tier and join date stay with the partnerships team.",
  "changelog.entries.one-way-to-apply-as-a-partner.title":
    "One way to apply as a partner",
  "changelog.entries.one-way-to-apply-as-a-partner.body":
    "The For Organisations page and the application form were two separate asks. Both now lead to the real partnership application, and the answer arrives in the app.",
  "changelog.entries.the-glossary-reads-in-portuguese.title":
    "The glossary opens in your language",
  "changelog.entries.the-glossary-reads-in-portuguese.body":
    "The glossary now opens in your language, category chips included, until you flip it yourself, and search reads the Portuguese definitions.",
  "changelog.entries.suggest-a-glossary-term.title": "Suggest a missing term",
  "changelog.entries.suggest-a-glossary-term.body":
    "Suggesting a word now reaches the editors as a proper suggestion, and they have a console to add the term and finish its Portuguese definition.",
  "changelog.entries.reach-the-team-behind-an-opportunity.title":
    "Reach the team behind a volunteering opportunity",
  "changelog.entries.reach-the-team-behind-an-opportunity.body":
    "Message the team now opens a conversation with the person who posted the opportunity. Organisers allowed to review applicants see the applicant list on their own posting.",
  "changelog.entries.approved-resources-appear-straight-away.title":
    "An approved resource appears in the directory",
  "changelog.entries.approved-resources-appear-straight-away.body":
    "Approving a member's resource suggestion now publishes the listing in the same step, with the details checked first, so the phone number shown is the one they sent.",
  "changelog.entries.guides-get-reviewed-on-time.title":
    "Guides get reviewed on time",
  "changelog.entries.guides-get-reviewed-on-time.body":
    "A guide stays hidden until an editor confirms it is still accurate. Overdue guides now raise a flag in the admin queue and ring the curators.",
  "changelog.entries.the-trans-healthcare-guide-in-portuguese.title":
    "The trans healthcare guide, in Portuguese",
  "changelog.entries.the-trans-healthcare-guide-in-portuguese.body":
    "The clinical pathways on the guide and the QTIPOC organisation directory are now fully translated, wait times, costs and legal references included.",
  "changelog.entries.forms-instead-of-email-links.title":
    "Forms instead of email links",
  "changelog.entries.forms-instead-of-email-links.body":
    "Pages that asked you to email a shared mailbox now open in-app forms instead, so a suggestion or a press question gets a queue and an answer.",
  "changelog.entries.send-a-document-in-a-message.title":
    "You can send a document in a message",
  "changelog.entries.send-a-document-in-a-message.body":
    "You can now attach a PDF, text file, CSV or spreadsheet up to 20 MB. It arrives as a card with the name, format and size.",
  "changelog.entries.delete-a-message-just-for-you.title":
    "You can delete a message just for you",
  "changelog.entries.delete-a-message-just-for-you.body":
    "Delete for me now sits beside delete for everyone. The message leaves your view on every device you use, and the other person's view stays as it was.",
  "changelog.entries.mark-a-conversation-unread.title":
    "You can mark a conversation unread",
  "changelog.entries.mark-a-conversation-unread.body":
    "Mark as unread is now in the conversation menu, beside pin, favourite, mute and archive. It holds on every device, survives a reload, and clears when you open the thread again.",
  "changelog.entries.new-messages-reach-you-wherever-you-are.title":
    "New messages reach you wherever you are",
  "changelog.entries.new-messages-reach-you-wherever-you-are.body":
    "Your inbox and unread badge now update the moment a message lands in any of your conversations, including ones you have closed, and the sender's second tick appears when it reaches you.",
  "changelog.entries.an-enquiry-reply-no-longer-fails-in-silence.title":
    "An enquiry reply no longer fails in silence",
  "changelog.entries.an-enquiry-reply-no-longer-fails-in-silence.body":
    "Replying to a housing enquiry needs a connection. The thread now says so plainly and offers you the connection request right there, so the conversation can carry on.",
  "changelog.entries.notifications-you-can-clear-that-open-the-right-thing.title":
    "Notifications you can clear, that open the thing they name",
  "changelog.entries.notifications-you-can-clear-that-open-the-right-thing.body":
    "Notification rows now clear for good on every device, they open the post or message they name, and the count at the top matches the bell.",
  "changelog.entries.hiding-your-photo-now-holds-everywhere.title":
    "Turning off your photo now holds everywhere",
  "changelog.entries.hiding-your-photo-now-holds-everywhere.body":
    "Show your photo now goes through one check everywhere: direct messages, gatherings, your connections, membership cards and your public page. Turning it off holds in all of them.",
  "changelog.entries.someone-you-blocked-can-no-longer-vouch-for-you.title":
    "Someone you blocked can no longer vouch for you",
  "changelog.entries.someone-you-blocked-can-no-longer-vouch-for-you.body":
    "Blocking someone now refuses their vouch, and a vouch from someone you block later stops counting and stops showing on your profile, for you and for everyone else. Unblocking restores it.",
  "changelog.entries.a-hidden-vouch-list-no-longer-reads-as-none.title":
    "A hidden vouch list no longer reads as no vouches at all",
  "changelog.entries.a-hidden-vouch-list-no-longer-reads-as-none.body":
    "If you keep your voucher list private, your profile header now states the real number and says the names are private.",
  "changelog.entries.a-private-profile-now-says-so-instead-of-looking-abandoned.title":
    "A private profile now says so instead of looking abandoned",
  "changelog.entries.a-private-profile-now-says-so-instead-of-looking-abandoned.body":
    "A profile kept private, or shared only with connections, now carries a short note saying it was the member's choice and what would change.",
  "changelog.entries.hiding-yourself-now-holds-on-the-people-like-you-row.title":
    "Hiding yourself now holds on the People like you row",
  "changelog.entries.hiding-yourself-now-holds-on-the-people-like-you-row.body":
    "The People like you row now applies the same checks as every other listing: blocks, hiding yourself from one person, Hide me for 24 hours, and moderator removals.",
  "changelog.entries.renaming-your-username-no-longer-breaks-every-link-to-you.title":
    "Renaming your username no longer breaks every link to you",
  "changelog.entries.renaming-your-username-no-longer-breaks-every-link-to-you.body":
    "Old links to your username now forward to your new address and tell you they did, on your member profile and your public page.",
  "changelog.entries.you-can-search-the-member-directory-by-name.title":
    "You can search the member directory by name",
  "changelog.entries.you-can-search-the-member-directory-by-name.body":
    "A search box in the member directory matches part of a name, and it works alongside the filters you already had.",
  "changelog.entries.the-persona-directory-now-searches-all-of-it-at-once.title":
    "The persona directory now searches all of it at once",
  "changelog.entries.the-persona-directory-now-searches-all-of-it-at-once.body":
    "Persona search now runs on the server across every persona, so it sees past the two thousandth one and the page loads in a single request.",
  "changelog.entries.a-co-owned-persona-link-opens-the-right-persona.title":
    "A co-owned persona opens the right persona",
  "changelog.entries.a-co-owned-persona-link-opens-the-right-persona.body":
    "Each persona now has one address, used by the card on the phone and on a computer, so a link from a co-owner's profile opens the persona you meant.",
  "changelog.entries.no-more-persona-share-links-and-qr-codes-that-lead-nowhere.title":
    "No more persona share links and QR codes that lead nowhere",
  "changelog.entries.no-more-persona-share-links-and-qr-codes-that-lead-nowhere.body":
    "Share, QR code, contact card and View now use a persona's real address. When there is not one yet, they show as unavailable with a line saying what to do.",
  "changelog.entries.co-owners-are-offered-leave-instead-of-a-delete-that-fails.title":
    "Co-owners are offered Leave instead of a Delete that fails",
  "changelog.entries.co-owners-are-offered-leave-instead-of-a-delete-that-fails.body":
    "Delete only ever worked for the person who created a persona, so co-owners are now offered Leave in that spot. The creator's warning also counts the people affected correctly.",
  "changelog.entries.the-personas-you-follow-now-have-a-home.title":
    "The personas you follow now have a home",
  "changelog.entries.the-personas-you-follow-now-have-a-home.body":
    "A You follow tab in the persona directory lists everyone you follow, with unfollow on each row, and tells you when they publish new work.",
  "changelog.entries.badges-levels-and-perks-now-read-in-your-language.title":
    "Badges and levels now read in your language",
  "changelog.entries.badges-levels-and-perks-now-read-in-your-language.body":
    "Badge names, what each one takes, the category filters and the seven level names now read in the language you chose, including the level on your profile header.",
  "changelog.entries.a-membership-card-check-shows-a-real-role-name.title":
    "A membership card check shows a real role name",
  "changelog.entries.a-membership-card-check-shows-a-real-role-name.body":
    "Scanning a co-owner's card at a door now shows the role name instead of an internal code, and an unfamiliar role falls back to something readable.",
  "changelog.entries.invite-only-communities-can-finally-let-people-in.title":
    "Invite-only communities can finally let people in",
  "changelog.entries.invite-only-communities-can-finally-let-people-in.body":
    "An invitation to a private or invite-only community now opens the door: the person you invited can see it, walk straight in, and you can withdraw the invitation.",
  "changelog.entries.your-invitations-now-wait-for-you-in-one-place.title":
    "Your invitations wait for you in one place",
  "changelog.entries.your-invitations-now-wait-for-you-in-one-place.body":
    "A page now holds every community that has asked you in, who invited you, and the choice to open it or decline. Declining is quiet: nobody is told.",
  "changelog.entries.an-archived-community-stays-readable-to-its-members.title":
    "An archived community stays readable to the people who built it",
  "changelog.entries.an-archived-community-stays-readable-to-its-members.body":
    "The archive now works as promised. Everyone who was a member keeps reading every post and resource, and nobody can post, reply, react or join.",
  "changelog.entries.leaving-a-community-you-run-now-points-you-somewhere.title":
    "Leaving a community you run now points you somewhere",
  "changelog.entries.leaving-a-community-you-run-now-points-you-somewhere.body":
    "A community cannot be left without a successor, so instead of a bare error you now get that said plainly and a route to the handover.",
  "changelog.entries.the-communities-home-tab-shows-your-real-week.title":
    "The communities home tab shows your real week",
  "changelog.entries.the-communities-home-tab-shows-your-real-week.body":
    "The overview now reads from your actual communities: what has been posted, what is coming up, and what is waiting for you.",
  "changelog.entries.you-can-see-a-communitys-gatherings-before-you-join.title":
    "You can see a community's gatherings before you join",
  "changelog.entries.you-can-see-a-communitys-gatherings-before-you-join.body":
    "You can now see a community's open gatherings from the outside. Anything it keeps to its members stays private, and the page says so.",
  "changelog.entries.communities-can-set-a-mark-and-a-welcome-note.title":
    "Communities can set a mark and a welcome note",
  "changelog.entries.communities-can-set-a-mark-and-a-welcome-note.body":
    "You can now set a small square mark shown beside your community's name and a welcome note the next person reads on arrival. Both are optional, in setup and in settings.",
  "changelog.entries.a-post-taken-down-now-comes-with-a-reason.title":
    "A post taken down now comes with a reason",
  "changelog.entries.a-post-taken-down-now-comes-with-a-reason.body":
    "Moderators can now give a reason and cite the house rule when they remove something you wrote, and it reaches you. The takedown goes into the community's record too.",
  "changelog.entries.you-can-take-back-a-request-to-join.title":
    "You can take back a request to join",
  "changelog.entries.you-can-take-back-a-request-to-join.body":
    "The Requested button now takes your request back. It costs you nothing and you can ask again straight away, where waiting for a no can set a wait of months.",
  "changelog.entries.finding-the-busiest-communities-is-instant.title":
    "Finding the busiest communities is instant",
  "changelog.entries.finding-the-busiest-communities-is-instant.body":
    "Sorting Discover by most active now happens on our side, so the first results arrive in one go instead of behind a long loading state.",
  "changelog.entries.an-outage-no-longer-looks-like-an-empty-page.title":
    "An outage no longer looks like an empty page",
  "changelog.entries.an-outage-no-longer-looks-like-an-empty-page.body":
    'Screens across the app now tell you plainly when something failed to load and give you a Try again button. "Nothing here yet" appears only when it is true.',
  "changelog.entries.onboarding-never-guesses-your-visibility.title":
    "Onboarding never guesses your visibility",
  "changelog.entries.onboarding-never-guesses-your-visibility.body":
    "The intentions step now tells you when it could not load your saved choices and offers a retry. It will never write a visibility setting it did not successfully read.",
  "changelog.entries.reporting-a-person-says-what-actually-happens.title":
    "Reporting a person says what actually happens",
  "changelog.entries.reporting-a-person-says-what-actually-happens.body":
    "Reporting a person now has its own confirmation describing what a moderator will do, in place of text written for flagging a venue's safe-space badge.",
  "changelog.entries.mod-tools-bans-read-in-words-again.title":
    "Mod tools bans read in words again",
  "changelog.entries.mod-tools-bans-read-in-words-again.body":
    "Under Mod tools, Bans now reads in words: ban length, the rule citation and the edit-ban editor, in English and Portuguese.",
  "changelog.entries.offline-no-longer-clears-what-youre-typing.title":
    "Losing signal no longer clears what you were typing",
  "changelog.entries.offline-no-longer-clears-what-youre-typing.body":
    "Losing signal now keeps the page exactly where it was, with a small bar telling you the connection dropped. The full offline screen stays for opening the app with no connection.",
  "changelog.entries.back-button-leaves-an-editor-cleanly.title":
    "Back leaves an editor in one press",
  "changelog.entries.back-button-leaves-an-editor-cleanly.body":
    "Pages that warn about unsaved edits left a hidden extra step in your history, so Back returned to the editor once more. That step is now cleaned up however you leave.",
  "changelog.entries.signed-out-tab-bar-is-whole-again.title":
    "The signed-out tab bar is whole again",
  "changelog.entries.signed-out-tab-bar-is-whole-again.body":
    "Without an account, the phone tab bar now offers the resource library, the safe-spaces guide and About, all of which open without signing in.",
  "changelog.entries.installing-the-app-takes-one-tap-again.title":
    "Installing the app takes one tap again",
  "changelog.entries.installing-the-app-takes-one-tap-again.body":
    "The install page, the install dialog and the app now share the browser's single install offer, so a one-tap install shows up instead of manual instructions.",
  "changelog.entries.notification-taps-land-on-the-right-screen.title":
    "Tapping a notification lands on the right screen",
  "changelog.entries.notification-taps-land-on-the-right-screen.body":
    "In the installed app, tapping a message notification now finishes opening the conversation before anything can interrupt it.",
  "changelog.entries.the-installed-app-keeps-itself-current.title":
    "The installed app keeps itself current",
  "changelog.entries.the-installed-app-keeps-itself-current.body":
    "An installed app left open now checks for a new version about once an hour and offers you the usual update pill, instead of running old code for days.",
  "changelog.entries.pausing-your-account-now-pauses-it.title":
    "Pausing your account now actually pauses it",
  "changelog.entries.pausing-your-account-now-pauses-it.body":
    "The pause button in Settings now runs the real thing: your profile comes down, you stop being messageable, and your session ends. The confirmation appears only once that is done.",
  "changelog.entries.pause-and-delete-live-in-one-place.title":
    "Pausing and deleting live in one place",
  "changelog.entries.pause-and-delete-live-in-one-place.body":
    "One page now explains what pausing and deleting each do, and every other screen takes you there.",
  "changelog.entries.content-settings-actually-filter-your-feed.title":
    "The content settings on Interests work now",
  "changelog.entries.content-settings-actually-filter-your-feed.body":
    "Turning off dating, mental health, or sexuality and identity now hides that kind of community from your feed. Your access to those spaces stays the same.",
  "changelog.entries.you-can-stop-being-suggested-to-strangers.title":
    "You can stop being suggested to people you have not met",
  "changelog.entries.you-can-stop-being-suggested-to-strangers.body":
    "Under Visibility, you can leave other people's suggestion strip. You still see suggestions yourself and you stay in the member directory.",
  "changelog.entries.the-activity-switch-is-one-switch.title":
    "The activity switch is the same switch in both places",
  "changelog.entries.the-activity-switch-is-one-switch.body":
    "The recently-active setting is now one control: change it in Settings or on your profile and it holds in both, and each says how you currently read.",
  "changelog.entries.answer-a-connection-request-where-you-read-it.title":
    "You can answer a connection request where you read it",
  "changelog.entries.answer-a-connection-request-where-you-read-it.body":
    "A profile with a pending connection request now offers to accept, the notification carries accept and decline, and anything you typed comes with you into the conversation.",
  "changelog.entries.a-gathering-tells-you-when-it-is-nearly-full.title":
    "A gathering can tell you when it is down to the last few spots",
  "changelog.entries.a-gathering-tells-you-when-it-is-nearly-full.body":
    "For gatherings you saved or said maybe to, you can be told when spots run low. Off unless you want it, one notification per gathering, quiet again if seats free up.",
  "changelog.entries.blocked-and-muted-in-one-place.title":
    "Blocked and muted people are in one list",
  "changelog.entries.blocked-and-muted-in-one-place.body":
    "The pane now lists everyone you blocked and everyone you muted, with the date and a one-tap undo.",
  "changelog.entries.your-join-request-shows-its-deadline.title":
    "Your join request shows its deadline, and a lapsed invite is not the end",
  "changelog.entries.your-join-request-shows-its-deadline.body":
    "An invite's seven days now start when you are told. The status page shows the deadline, a lapsed invite can be revived there, and signing in with Google finds your request again.",
  "changelog.entries.losing-your-google-account-is-no-longer-final.title":
    "Losing your Google account no longer means losing your membership",
  "changelog.entries.losing-your-google-account-is-no-longer-final.body":
    "An admin can now reconnect your membership to a new Google account, only to one that has already proved it controls your address.",
  "changelog.entries.vouching-has-a-front-door.title":
    "Vouching for someone has a way in",
  "changelog.entries.vouching-has-a-front-door.body":
    "The vouching page now sits in your account menu and beside your connections, and the getting-started step takes you straight there.",
  "changelog.entries.recognition-counts-people-not-volume.title":
    "Recognition counts people rather than volume",
  "changelog.entries.recognition-counts-people-not-volume.body":
    "Recognition points now come only from things another person was part of. Badges you can earn alone are still yours to earn and still shown.",
  "changelog.tag.vouch": "Vouch for someone",

  "changelog.entries.declining-a-connection-request-now-holds.title":
    "Declining a connection request now holds",
  "changelog.entries.declining-a-connection-request-now-holds.body":
    "A decline now holds on its own. A repeat request has to wait, the wait grows each time you decline the same person, and enough refusals end it.",

  "changelog.entries.you-can-report-a-whole-community.title":
    "You can report a whole community",
  "changelog.entries.you-can-report-a-whole-community.body":
    "You can now report a community from its own page, with reasons that include outing, sharing someone's personal details, harassment, hate speech and discrimination.",

  "changelog.entries.housing-reports-can-reach-the-urgent-queue.title":
    "Housing reports can reach the urgent queue",
  "changelog.entries.housing-reports-can-reach-the-urgent-queue.body":
    "Housing reports now offer outing and doxxing as reasons, and an urgent report is never turned away by the weekly limit on repeat reports.",

  "changelog.entries.hiding-a-housing-profile-now-hides-it.title":
    "Hiding a housing profile now hides it",
  "changelog.entries.hiding-a-housing-profile-now-hides-it.body":
    "When a moderator hides or removes a flatmate profile or a landlord, it now disappears from browse, from search and from a direct link.",

  "changelog.entries.you-choose-whether-a-report-is-anonymous.title":
    "You choose whether a report is anonymous",
  "changelog.entries.you-choose-whether-a-report-is-anonymous.body":
    "Whether a report is anonymous is now a choice you make, with what each option costs you spelled out. The email field is only an email field.",

  "changelog.entries.barring-someone-forever-needs-two-people.title":
    "Barring someone forever needs two people",
  "changelog.entries.barring-someone-forever-needs-two-people.body":
    "Removing a member still happens immediately and bars them for thirty days. Making that bar permanent now waits for a second owner or moderator to agree.",

  "changelog.entries.a-community-can-read-its-own-history.title":
    "A community can read its own history",
  "changelog.entries.a-community-can-read-its-own-history.body":
    "Community owners and moderators can now read their own community's record from Mod tools: removals, role changes, freezes and public-private switches.",

  "changelog.entries.we-now-publish-government-data-requests.title":
    "We now publish government and legal data requests",
  "changelog.entries.we-now-publish-government-data-requests.body":
    "The transparency report now has a section for government and legal demands: how many we received, what they asked for, and what we did.",

  "changelog.entries.dark-mode-gives-feedback-again.title":
    "Dark mode gives feedback again",
  "changelog.entries.dark-mode-gives-feedback-again.body":
    "In dark mode the hover and keyboard highlight painted almost the page colour on sixty-nine surfaces. That is fixed, along with menu selection and loading shimmer.",

  "changelog.entries.persona-pages-had-text-you-could-barely-read.title":
    "Persona pages had text you could barely read",
  "changelog.entries.persona-pages-had-text-you-could-barely-read.body":
    "Thirteen persona skins rendered quiet text, dates and helper lines too faint to read. Each skin was remeasured and raised until it clears the 4.5 to 1 floor.",

  "changelog.entries.things-that-were-meant-to-move-now-move.title":
    "Things that were meant to move now move",
  "changelog.entries.things-that-were-meant-to-move-now-move.body":
    "Eleven animations had been silently doing nothing, so dropdowns and date pickers snapped open and switching personas cut instead of crossfading. They run again.",

  "changelog.entries.your-identity-details-now-reach-only-real-matches.title":
    "Your identity details now reach only real matches",
  "changelog.entries.your-identity-details-now-reach-only-real-matches.body":
    "Your gender identity and safe-space needs on a flatmate profile now reach someone only once you have both liked each other. The option says so.",

  "changelog.entries.review-queues-no-longer-hide-people-who-are-waiting.title":
    "Review queues no longer hide people who are waiting",
  "changelog.entries.review-queues-no-longer-hide-people-who-are-waiting.body":
    "Community, listing-claim and housing review queues stopped at the first 200 requests without saying so. They now page through everything and show the total waiting.",

  "changelog.entries.press-kit-photos-can-be-uploaded-again.title":
    "Press kit photos can be uploaded",
  "changelog.entries.press-kit-photos-can-be-uploaded-again.body":
    "A press contact photo could only be a link to another site. You can upload one now, and links are limited to hosts we already serve images from.",

  "changelog.entries.a-mistyped-address-says-not-found.title":
    "A mistyped address says not found",
  "changelog.entries.a-mistyped-address-says-not-found.body":
    "A damaged identifier in a link used to answer with a server error. Around twenty addresses now recognise it and say the thing was not found.",
  "changelog.tag.about": "Read where we stand",
  "changelog.tag.partners": "See our partners",
  "changelog.tag.aboutCommunities": "See how communities work",
  "changelog.tag.work": "Open your Work hub",
  "changelog.tag.settings": "Notification settings",
  "changelog.tag.messages": "Open messages",
  "changelog.tag.startCommunity": "Start a community",
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
  "changelog.tag.cookies": "See the full list",
  "changelog.tag.pressKit": "Open the press kit",
  "changelog.tag.pushDevices": "Manage your devices",
  "changelog.tag.magazineDesk": "Open the desk",
  "changelog.tag.guidelines": "Read the community guidelines",
  "changelog.tag.guideIndex": "Browse every guide",
  "changelog.tag.requestInvite": "Ask to come in",
  "changelog.tag.privacy": "Read the privacy policy",
  "changelog.tag.flatmates": "See the flatmate board",
  "changelog.tag.tenantRights": "Know your rights",
  "changelog.tag.workProfile": "Open your work profile",
  "changelog.tag.help": "Open the help centre",
  "changelog.tag.glossary": "Open the glossary",
  "changelog.tag.governance": "See how QueerPulse is run",
  "changelog.tag.appealOutcome": "Check your appeal status",
  "changelog.tag.hateCrime": "Read hate crime resources",
  "changelog.tag.changemakers": "See our Changemakers",
  "changelog.tag.culture": "Visit Culture",
  "changelog.tag.myCards": "See your cards",

  "changelog.entries.menu-resizes-smoothly.title":
    "The main menu changes size smoothly between sections",
  "changelog.entries.menu-resizes-smoothly.body":
    "The open panel now eases between heights as you move from one top-menu section to the next, in step with the links fading inside it. With reduced motion it still resizes instantly.",
  "changelog.entries.nearby-places-full-cards.title":
    "Places within a short walk now show their full card",
  "changelog.entries.nearby-places-full-cards.body":
    'The "Within a short walk" suggestions were one line of text. They now use the full local directory card, with the photo, safer-space badge, rating and walking distance.',
  "changelog.entries.map-pin-opens-place.title":
    "Tapping a place on the map now opens it",
  "changelog.entries.map-pin-opens-place.body":
    "Tapping a pin now drops the area filter and gives the whole side panel to that place, with the map easing in on it.",
  "changelog.entries.review-line-breaks.title":
    "Reviews keep your paragraphs, and fold up when they run long",
  "changelog.entries.review-line-breaks.body":
    "The paragraph breaks you type in a review are now kept exactly as you wrote them, and long reviews fold down to their first few lines behind a Read more link.",
  "changelog.entries.directory-filters-in-one-row.title":
    "The directory filter bar is now one tidy row",
  "changelog.entries.directory-filters-in-one-row.body":
    "The filter bar now parks below the navigation and stays readable down the page. Place types moved inside Refine, which carries a count of the filters you applied.",
  "changelog.entries.volunteer-applicants-community-organisers.title":
    "Communities can review their own volunteer applicants",
  "changelog.entries.volunteer-applicants-community-organisers.body":
    "Owners, co-owners and moderators of the community an opportunity sits under can now read the applications and accept or decline, so an answer never rests on the one person who posted it.",
  "changelog.entries.invites-go-out-by-hand.title":
    "Approving a join request now says plainly what happens next",
  "changelog.entries.invites-go-out-by-hand.body":
    "The confirmation used to promise an invite email, and QueerPulse sends none. It now says invites go out by hand and puts the link to copy right there.",
  "changelog.entries.sessions-page-links-reach-a-person.title":
    "Your active sessions can now reach a person",
  "changelog.entries.sessions-page-links-reach-a-person.body":
    "The two links under your active sessions now open the Account section of Help and the contact form with its topic set to account access.",
  "changelog.entries.mod-tools-sections-fade-in-as-you-switch.title":
    "Mod tools sections arrive instead of snapping into place",
  "changelog.entries.mod-tools-sections-fade-in-as-you-switch.body":
    "Switching between Overview, Requests, Reports and the rest of the moderation console now fades and rises into place over a fraction of a second. With reduced motion the panel still changes instantly.",
  "changelog.entries.member-rows-in-mod-tools-hold-their-actions-in-one-menu.title":
    "Managing a community's members reads as a list of people again",
  "changelog.entries.member-rows-in-mod-tools-hold-their-actions-in-one-menu.body":
    "Making someone a mod, handing over co-ownership and removing a person now sit behind one menu button at the end of the row.",
  "changelog.entries.studio-and-cinema-speak-portuguese-in-more-places.title":
    "Studio and Cinema speak Portuguese in more places",
  "changelog.entries.studio-and-cinema-speak-portuguese-in-more-places.body":
    "Buttons, headings, tabs and empty states across Studio and Cinema now follow the language you picked. The work itself stays as its author wrote it: track titles, lyrics, biographies, synopses and credits.",
  "changelog.tag.magazineSearch": "Search the magazine",
  "changelog.tag.resources": "Browse the guides",
  "changelog.tag.readingGroups": "Find a reading group",

  "changelog.tag.arriving": "Just arrived in Lisbon?",
  "changelog.tag.housingGroups": "See housing groups",
  "changelog.entries.post-a-room-in-a-housing-group.title":
    "Share a room inside a housing group",
  "changelog.entries.post-a-room-in-a-housing-group.body":
    "You can post a room straight into a vetted housing group, with the rent and access details it asks for. A moderator reads it first.",
  "changelog.entries.the-housing-board-is-open.title":
    "The housing board is open",
  "changelog.entries.the-housing-board-is-open.body":
    "Rooms and homes listed by members now reach the board. Each one goes to a moderator first and shows you the decision and the reason on your listing.",
  "changelog.entries.gatherings-say-where-and-what-they-cost.title":
    "Gatherings say where they are and what they cost",
  "changelog.entries.gatherings-say-where-and-what-they-cost.body":
    "The address, arrival directions, neighbourhood and access details a host fills in are now kept and shown, with the exact address going to the people who are coming.",
  "changelog.entries.hosts-run-their-own-door.title":
    "Hosts run their own door",
  "changelog.entries.hosts-run-their-own-door.body":
    "You can message everyone coming, check people in at the door, see the access needs your guests shared, and bar someone from one gathering without cancelling it.",
  "changelog.entries.the-safe-space-badge-has-a-mechanism.title":
    "The safe-space badge means what the page says",
  "changelog.entries.the-safe-space-badge-has-a-mechanism.body":
    "Three members with no stake in a place must visit before it gets the badge, and every decision carries a written reason. Your name never reaches the venue.",
  "changelog.entries.the-directory-answers-is-it-open-and-can-i-get-in.title":
    "Is it open, and can I get in?",
  "changelog.entries.the-directory-answers-is-it-open-and-can-i-get-in.body":
    "The directory shows whether a place is open now, filters by the access you need such as step-free entry, and sorts by nearest with a walking time.",
  "changelog.entries.a-venue-is-asked-before-it-hosts-you.title":
    "A venue is asked before it hosts you",
  "changelog.entries.a-venue-is-asked-before-it-hosts-you.body":
    "Naming a business as your venue now asks the owner, who can confirm it or remove it. An unconfirmed gathering stays off the venue's public page.",
  "changelog.entries.arriving-points-at-real-things.title":
    "Arriving in Lisbon points at real things",
  "changelog.entries.arriving-points-at-real-things.body":
    "The page for people who just moved here now shows real gatherings coming up, links to real places and communities, and a first-fortnight checklist you can tick off.",
  "changelog.entries.what-you-send-in-now-gets-an-answer.title":
    "What you send in now gets an answer",
  "changelog.entries.what-you-send-in-now-gets-an-answer.body":
    "A proposed reading group now becomes a real community with you as its owner, and housing rooms, landlord suggestions and introduction requests each get a decision with the reason.",
  "changelog.entries.the-magazine-has-pictures.title":
    "The magazine has pictures",
  "changelog.entries.the-magazine-has-pictures.body":
    "Editors can now upload lead art and place photographs inside a story. That art runs on the article, the front page and every card pointing at it.",
  "changelog.entries.an-older-piece-tells-you-where-it-stands.title":
    "An older piece tells you where it stands",
  "changelog.entries.an-older-piece-tells-you-where-it-stands.body":
    "A piece can be marked under review, archived, or replaced by a newer one, and stays readable with a dated note. Articles can also run in Portuguese.",
  "changelog.entries.corrections-and-content-notes-reach-the-reader.title":
    "Corrections and content notes now reach you",
  "changelog.entries.corrections-and-content-notes-reach-the-reader.body":
    "Corrections now appear on the article, dated, in the order they were made, and content notes sit above the body, where you can dismiss them.",
  "changelog.entries.the-magazine-front-page-is-editors-work.title":
    "The magazine front page is the editors' work again",
  "changelog.entries.the-magazine-front-page-is-editors-work.body":
    "The front page now opens on the story editors led with and follows the current issue's running order, grouped into sections. The masthead names the issue and its date.",
  "changelog.entries.search-the-whole-magazine-archive.title":
    "Search everything the magazine has published",
  "changelog.entries.search-the-whole-magazine-archive.body":
    "You can now search the full magazine archive by headline, standfirst, body and tag, ranked by relevance. Article tags are links too, so you can follow one by subject.",
  "changelog.entries.a-byline-is-a-person-now.title":
    "A magazine byline is a real person",
  "changelog.entries.a-byline-is-a-person-now.body":
    "Writers now have an author profile they can edit, bylines link to member profiles where the writer is one of us, and published pieces are credited on the writer's own profile.",
  "changelog.entries.your-story-submission-gets-an-answer.title":
    "Your story submission gets a real answer",
  "changelog.entries.your-story-submission-gets-an-answer.body":
    "Editors can now accept, decline or commission a submission and write you a note back. The outcome reaches your tracker and your notifications.",
  "changelog.entries.every-guide-says-when-it-was-last-checked.title":
    "Every guide says when it was last checked",
  "changelog.entries.every-guide-says-when-it-was-last-checked.body":
    "Every guide now carries a review date and the team can see which ones are due. A new index lists them all, including seventeen that had no link anywhere.",
  "changelog.entries.the-reading-group-directory-is-real.title":
    "The reading group directory is real",
  "changelog.entries.the-reading-group-directory-is-real.body":
    "An approved reading group proposal now becomes a real group you can find, open and ask to join, hosted by whoever proposed it.",
  "changelog.entries.in-this-issue-replaces-the-members-digest.title":
    "“In this issue” replaces the members' digest",
  "changelog.entries.in-this-issue-replaces-the-members-digest.body":
    'QueerPulse sends no email, so the members\' digest stays as an "In this issue" panel on every issue page, plus one notification when an issue ships.',
  "changelog.entries.the-press-kit-carries-real-brand-assets.title":
    "The press kit carries real brand assets",
  "changelog.entries.the-press-kit-carries-real-brand-assets.body":
    "The press kit now serves real files: the mark in vector and high resolution, a monochrome version, the app icon, and a printable colour and typography reference.",
  "changelog.entries.cinema-and-culture-say-what-they-are.title":
    "Cinema and Culture stopped advertising what does not exist",
  "changelog.entries.cinema-and-culture-say-what-they-are.body":
    "Cinema and Culture now say plainly that they are not open yet, and the magazine asks logged-out visitors to sign in.",
  "changelog.entries.an-issue-stays-under-wraps-until-it-ships.title":
    "An issue stays under wraps until it ships",
  "changelog.entries.an-issue-stays-under-wraps-until-it-ships.body":
    "An unpublished issue's number, title, theme and cover are now held back everywhere a reader can look, and the desk keeps its full view.",

  "changelog.entries.the-directory-stopped-going-blank.title":
    "The local directory stopped going blank",
  "changelog.entries.the-directory-stopped-going-blank.body":
    "The directory and the list-your-business form could load to an empty screen. The category names now stand on their own, so both pages open.",
  "changelog.entries.notification-previews-stay-hidden-on-iphone.title":
    "Hidden notification previews now work on iPhone",
  "changelog.entries.notification-previews-stay-hidden-on-iphone.body":
    "Hiding notification previews now travels with your account, so it works on iPhone too, and the notification leaves our side already stripped. It is on by default.",
  "changelog.entries.leaving-no-longer-deletes-other-peoples-gatherings.title":
    "Leaving no longer deletes other people’s gatherings",
  "changelog.entries.leaving-no-longer-deletes-other-peoples-gatherings.body":
    "Erasing an account used to delete every gathering that person hosted. A future gathering now passes to a co-host, or is cancelled with a notification to everyone coming.",
  "changelog.entries.a-new-device-signing-in-tells-you.title":
    "You hear about it when a new device signs in",
  "changelog.entries.a-new-device-signing-in-tells-you.body":
    "A sign-in from a device your account has not seen before now sends you a notification naming the device and the time. Your sessions list names each one.",
  "changelog.entries.nothing-promises-you-an-email-any-more.title":
    "Nothing promises you an email any more",
  "changelog.entries.nothing-promises-you-an-email-any-more.body":
    "QueerPulse sends no email. The gathering waitlist, directory listings, Culture submissions and grant applications now say the answer arrives in your QueerPulse notifications and messages.",
  "changelog.entries.the-status-page-works-without-an-account.title":
    "The status page works without an account",
  "changelog.entries.the-status-page-works-without-an-account.body":
    "The status page now shows real service health and any incidents we have written up, and it works with no account at all.",
  "changelog.entries.data-requests-get-a-real-answer.title":
    "Data requests get a real answer",
  "changelog.entries.data-requests-get-a-real-answer.body":
    "A request about your data now lands in a review queue sorted by its legal deadline, and when we decide you get a notification naming your request and its reference number.",
  "changelog.entries.we-ask-again-when-the-rules-change.title":
    "We ask again when the Terms or Guidelines change",
  "changelog.entries.we-ask-again-when-the-rules-change.body":
    "When the Terms or Guidelines change materially, you are now asked to read what changed and agree again, and we keep a dated record of it.",
  "changelog.entries.iphone-notifications-explain-the-install-step.title":
    "iPhone notifications explain the install step",
  "changelog.entries.iphone-notifications-explain-the-install-step.body":
    "Safari only delivers QueerPulse notifications once the app is added to your Home Screen. The setting now explains that step and links straight to it.",
  "changelog.entries.a-heads-up-before-your-account-is-deleted.title":
    "A heads-up before your account is deleted",
  "changelog.entries.a-heads-up-before-your-account-is-deleted.body":
    "You now get one notification three days before your account deletion becomes permanent, and cancelling is still a single step.",
  "changelog.entries.moderators-see-the-positions-at-the-queue.title":
    "Moderators see the positions at the queue",
  "changelog.entries.moderators-see-the-positions-at-the-queue.body":
    "Both report queues now open with the three rules that matter most: criticism of a state is political speech, and nobody is ever asked to prove their gender.",
  "changelog.entries.where-we-stand-intersectionality-and-palestine.title":
    "Where we stand: trans lives, Palestine, and the rest of it",
  "changelog.entries.where-we-stand-intersectionality-and-palestine.body":
    "The About page now carries a position: intersectionality, trans self-identification, the genocide in Gaza named plainly, and three commitments you can hold us to.",
  "changelog.entries.directory-cards-show-who-runs-the-place.title":
    "The person who runs a place now shows their face on its card",
  "changelog.entries.directory-cards-show-who-runs-the-place.body":
    "The circle beside the owner's name on a directory card now holds their profile photo, with their initial as a fallback. An anonymous listing still shows neither.",
  "changelog.entries.members-can-put-something-to-a-vote.title":
    "You can put something to a vote",
  "changelog.entries.members-can-put-something-to-a-vote.body":
    "You can now put something to your community: file a motion, gather ten signatures including your own, and the team sets the voting window.",
  "changelog.entries.a-governance-vote-now-needs-enough-people-to-count.title":
    "A governance vote now needs enough people to count",
  "changelog.entries.a-governance-vote-now-needs-enough-people-to-count.body":
    "Every vote now has to clear a quorum before the result counts: a tenth of active members or ten people, whichever is larger. Proposals show turnout while voting is open.",
  "changelog.entries.anyone-in-a-community-can-flag-an-owner-who-has-gone-quiet.title":
    "Anyone in a community can flag an owner who has gone quiet",
  "changelog.entries.anyone-in-a-community-can-flag-an-owner-who-has-gone-quiet.body":
    "Any member can now report an absent community owner, once a day. If an owner erases their account, ownership passes to a co-owner, then to the longest-standing moderator.",
  "changelog.entries.the-constitution-links-through-to-the-code-of-conduct.title":
    "The Constitution links through to the Code of Conduct",
  "changelog.entries.the-constitution-links-through-to-the-code-of-conduct.body":
    "Read the Code of Conduct, at the foot of the Constitution, now opens the Code of Conduct. Download PDF and See the Assembly pointed nowhere, so they have been taken off.",
  "changelog.entries.your-devices-list-stops-collecting-old-sign-ins.title":
    "Your devices list stops collecting old sign-ins",
  "changelog.entries.your-devices-list-stops-collecting-old-sign-ins.body":
    "Signing in now replaces the session this browser already held, and expired sessions drop off the list. Sign out all other sessions clears the rest in one go.",
  "changelog.entries.devices-say-when-you-signed-in-and-when-you-were-last-there.title":
    "Each device says when you signed in and roughly when you were last there",
  "changelog.entries.devices-say-when-you-signed-in-and-when-you-were-last-there.body":
    "Signed in now shows when you actually signed in on that device, plus a rough last activity line when the device has been back.",
  "changelog.entries.profile-sections-share-one-left-edge.title":
    "Every section of your profile lines up down one edge",
  "changelog.entries.profile-sections-share-one-left-edge.body":
    'The sections down your profile now share one left edge with "Places you run", so the column reads straight, on a phone too.',
  "changelog.entries.my-communities-waits-instead-of-saying-you-have-none.title":
    "My communities waits for your list instead of saying you have none",
  "changelog.entries.my-communities-waits-instead-of-saying-you-have-none.body":
    "Communities now holds a skeleton until your memberships load, and the line under the heading waits for the real number.",
  "changelog.entries.say-what-you-do-on-your-profile.title":
    "You can say what you do on your profile, and be found for it",
  "changelog.entries.say-what-you-do-on-your-profile.body":
    'Pick your field of work and the roles within it in your profile editor. It shows under "Works in" and puts you in the member directory filters.',
  "changelog.entries.admin-account-menu-is-real.title":
    "The admin sidebar's account button actually does something now",
  "changelog.entries.admin-account-menu-is-real.body":
    "The admin rail's account button now names the account you are signed in as and opens a menu with your profile, settings, sessions, access and sign out.",
  "changelog.entries.admin-sidebar-grouped-sections.title":
    "The admin sidebar is grouped into sections you can collapse",
  "changelog.entries.admin-sidebar-grouped-sections.body":
    "Thirty-two admin links now sit in eight labelled sections, from Trust and safety to Platform. The rail remembers what you left open, and closed headings show their counts.",
  "changelog.entries.since-friday-panel-removed.title":
    "The magazine desk's Since Friday panel is gone",
  "changelog.entries.since-friday-panel-removed.body":
    "The Since Friday button and panel are gone. The activity feed reads the same record and every piece keeps its History tab, so the left rail is shorter.",
  "changelog.entries.writer-desk-header-says-whats-due.title":
    "The writer's desk header now says what's due",
  "changelog.entries.writer-desk-header-says-whats-due.body":
    "The writer desk header now names the page and tells you how many assignments are open and when the nearest one is due, or that your desk is clear.",
  "changelog.entries.editors-can-write-their-own-pieces.title":
    "Magazine editors can write a piece themselves, not only commission one",
  "changelog.entries.editors-can-write-their-own-pieces.body":
    "Write is now the desk's main action, beside Commission. It skips the brief form, creates the piece with you as its writer, and drops you straight into the editor.",
  "changelog.entries.editor-pages-start-at-the-top.title":
    "The magazine editor's pages no longer start with a band of empty cream",
  "changelog.entries.editor-pages-start-at-the-top.body":
    "Every magazine editor screen was reserving a strip of space for a navigation bar it never shows. That space is released, so each page starts at its content.",
  "changelog.entries.issue-publish-date-optional.title":
    "A magazine issue no longer needs a date to exist",
  "changelog.entries.issue-publish-date-optional.body":
    "Fill in the number, the title and the theme and the issue exists. The date moves to a Publish date card, where you can set or clear it later.",
  "changelog.entries.cohost-invite-form-reads-properly.title":
    "Inviting a co-host reads properly now",
  "changelog.entries.cohost-invite-form-reads-properly.body":
    "The terms step of the co-host invite now reads in full in both languages, shows the invited person with their photo and pronouns, and describes each role.",
  "changelog.entries.desk-activity-reads-in-plain-language.title":
    "Magazine desk activity now reads in plain language",
  "changelog.entries.desk-activity-reads-in-plain-language.body":
    "The Activity panel and a piece's History now read as sentences: who did it, what they did in plain words, and when. Automatic steps read as System.",
  "changelog.entries.mod-tools-became-a-console.title":
    "Mod tools is now a console with a section rail",
  "changelog.entries.mod-tools-became-a-console.body":
    "Mod tools opens on an overview of anything waiting on you, with a rail for Requests, Reports, Members, Invites, Member card and Danger zone.",
  "changelog.entries.share-card-shows-your-own-gathering.title":
    "A gathering's share card now shows that gathering",
  "changelog.entries.share-card-shows-your-own-gathering.body":
    "The share card on your manage dashboard now shows the gathering you are managing, with its title, date, venue and cover photo. Copy gives you its public link.",
  "changelog.entries.place-page-reads-in-one-piece.title":
    "A place's page now reads as one thing",
  "changelog.entries.place-page-reads-in-one-piece.body":
    'Opening hours now sit in one card, with the week in two columns and the live status beside the heading. "Where it is" became a single card too.',
  "changelog.entries.place-pages-open-all-at-once.title":
    "A place's page now opens with its photos already there",
  "changelog.entries.place-pages-open-all-at-once.body":
    "A business page now waits behind a short loading screen that names the step it is on, and arrives with the photos already in place.",
  "changelog.entries.browse-every-tag-by-category.title":
    "Browse every tag by category instead of guessing the word",
  "changelog.entries.browse-every-tag-by-category.body":
    'A "Browse all" button on the tags field opens the full list grouped by category. Tap a tag to add or remove it, or search across every category.',
  "changelog.entries.backspace-keeps-your-tags.title":
    "Backspace no longer eats the tags you already picked",
  "changelog.entries.backspace-keeps-your-tags.body":
    "Holding backspace in a tag field now clears only the text you are typing. Tags come off with the x on the tag itself.",
  "changelog.entries.map-loader-stays-in-its-panel.title":
    "The directory map now loads inside its own panel",
  "changelog.entries.map-loader-stays-in-its-panel.body":
    "Switching the directory from List to Map covered the whole window with a loading screen. It now fills the rounded panel the map lands in, and the page around it stays put.",
  "changelog.entries.plum-headers-reach-the-top.title":
    "Plum page headers now run all the way to the top",
  "changelog.entries.plum-headers-reach-the-top.body":
    "On Safe spaces, Culture, Jobs and Housing a thin strip of cream stayed behind the floating navigation bar. The plum now fills it, in the sidebar and mobile layouts too.",
  "changelog.entries.footer-closes-the-page.title":
    "Short pages now end at the bottom of the window",
  "changelog.entries.footer-closes-the-page.body":
    "Every page now reaches the bottom edge of the window, so the footer sits at the bottom even on a short page like your membership cards.",
  "changelog.entries.tab-title-follows-the-page.title":
    "The browser tab names the page you are on",
  "changelog.entries.tab-title-follows-the-page.body":
    "Pages with a name of their own set the browser tab title, and every other page now shows the plain QueerPulse name as you arrive.",
  "changelog.entries.magazine-issues-run-the-desk.title":
    "Magazine issues now run the desk",
  "changelog.entries.magazine-issues-run-the-desk.body":
    'The desk now has a "New issue" button and a switcher for the issue you are on. Pieces wait in an Unassigned track until you file them, and shipping an issue files its articles.',
  "changelog.entries.local-map-reads-clearly.title":
    "The local map reads clearly again",
  "changelog.entries.local-map-reads-clearly.body":
    "Streets now sit on a warm scale with an edge of their own, names are cut cleanly out of the background, and each parish is named once.",
  "changelog.entries.reviews-sort-on-quiet-listings.title":
    "Sorting and filtering reviews now works on quieter listings",
  "changelog.entries.reviews-sort-on-quiet-listings.body":
    "Sort and filter controls now appear from a listing's second review: order by newest, oldest, most helpful or rating, or keep only reviews with a photo or answer.",
  "changelog.entries.map-narrows-to-the-area-you-pick.title":
    "Picking an area on the map clears the rest",
  "changelog.entries.map-narrows-to-the-area-you-pick.body":
    "Choosing a parish on the local map now leaves only that area's pins. Click the highlighted area again to bring everything back.",
  "changelog.entries.pages-open-at-the-top.title":
    "Changing pages lands you at the top straight away",
  "changelog.entries.pages-open-at-the-top.body":
    "Changing pages now lands at the top straight away. Browser back still returns you to where you left off, and tapping your current tab still glides up.",
  "changelog.entries.queer-owned-says-queer-owned.title":
    "Queer-owned places say so on their card",
  "changelog.entries.queer-owned-says-queer-owned.body":
    "The badge on a card now has three honest steps: verified queer-owned, queer-owned, or LGBTQ+ friendly, with the safe-space jade shield beside it.",
  "changelog.entries.review-appears-immediately.title":
    "Your review shows up the moment you post it",
  "changelog.entries.review-appears-immediately.body":
    "Your review now appears the instant you post it, with the star rating already counting it. Persona pages, housing groups and the roadmap update straight away too.",
  "changelog.entries.star-pickers-follow-your-cursor.title":
    "Star pickers now follow your cursor properly",
  "changelog.entries.star-pickers-follow-your-cursor.body":
    "Stars in a rating picker now sit shoulder to shoulder, so anywhere in the row lights up the rating you point at and the coral pours in.",
  "changelog.entries.review-stars-hint.title":
    "Reviews now tell you why the post button is greyed out",
  "changelog.entries.review-stars-hint.body":
    "You could write a whole review and find the button dead, with nothing to explain it. As soon as you start writing, a line beside the button asks for a star rating.",
  "changelog.entries.filters-keep-your-place.title":
    "Filtering a page no longer throws you back to the top",
  "changelog.entries.filters-keep-your-place.body":
    "Ticking a filter, typing in a search box or switching the local directory between map and list now keeps you where you were reading.",
  "changelog.entries.directory-card-cover-photo.title":
    "Your listing's photo now shows up in the directory",
  "changelog.entries.directory-card-cover-photo.body":
    "Directory cards now show the listing's wide photo, framed the way you cropped it, and the photos step says which one becomes your cover.",
  "changelog.entries.persona-banner-reposition.title":
    "Put your persona banner exactly where you want it",
  "changelog.entries.persona-banner-reposition.body":
    'Hover your banner on your own persona page, take "Reposition", and drag the image up or down until the right part is in frame. Arrow keys work too.',

  "changelog.entries.listing-owner-photo.title":
    "The face behind a listing actually shows up",
  "changelog.entries.listing-owner-photo.body":
    'The "Who runs it" card and the photos beside reviews and questions now load properly. Anyone who turned their photo off still shows initials.',
  "changelog.entries.persona-savebar-compact.title":
    "More room to type when editing a persona on a phone",
  "changelog.entries.persona-savebar-compact.body":
    "On phones the unsaved-changes bar in the persona editor now shows one line with how many changes are waiting. Tap it open for the full list.",
  "changelog.entries.sharper-photos.title":
    "Photos that stay sharp on every screen",
  "changelog.entries.sharper-photos.body":
    "Large uploads are shrunk in careful stages and saved in a newer format, so a banner or profile photo keeps its sharpness at the size your screen shows.",
  "changelog.entries.listing-pages-rebuild.title":
    "Business pages, rebuilt around what you came to find out",
  "changelog.entries.listing-pages-rebuild.body":
    "A business page now opens with whether it is open, where it is, and how easy it is to get into. You can ask a question in public or mark a review helpful.",
  "changelog.entries.listing-owner-control.title":
    "More control if you run a place",
  "changelog.entries.listing-owner-control.body":
    "Once you are approved, your corrections go live as you save them. The editor is one screen with a preview, with holiday hours, closed or moved notices, and a pause switch.",
  "changelog.entries.persona-banner-framing.title":
    "Persona banners, framed the way you framed them",
  "changelog.entries.persona-banner-framing.body":
    "Banners now reframe at 3:1, the shape they actually paint at, so the page keeps what you centred. They also upload at a higher resolution.",
  "changelog.entries.card-check-page-rebuild.title":
    "The card check page now shows the member\u2019s photo",
  "changelog.entries.card-check-page-rebuild.body":
    "A card check now comes back as the card itself: name and pronouns, community, role, number and the photo from the community's records. A failed card says why.",
  "changelog.entries.persona-rights-footer-once.title":
    "One copyright notice per persona page",
  "changelog.entries.persona-rights-footer-once.body":
    "The rights notice now appears once at the end of a persona page, covering all of that persona's work. Opening a single poem or artwork still shows its own.",
  "changelog.entries.community-card-live-preview.title":
    "See your community's card while you edit it",
  "changelog.entries.community-card-live-preview.body":
    "The community edit dialog now shows your card beside the form, drawn from what you are typing, so you see a cover crop or shorter tagline before saving.",

  "changelog.entries.card-co-owner-role.title":
    "Membership cards name co-owners correctly",
  "changelog.entries.card-co-owner-role.body":
    "Membership cards now print co-owner where a member holds that role, on the card, in the holders panel and on the page a scan opens. Promoting someone updates their card straight away.",

  "changelog.entries.profile-community-cards.title":
    "Your communities look the same on your profile as on the communities page",
  "changelog.entries.profile-community-cards.body":
    "The communities you feature on your profile now use the same card as the communities page: cover photo, faces, description, tags and this week's activity, with a badge showing your role.",

  "changelog.entries.profile-places-directory-cards.title":
    "Your places look the same on your profile as in the directory",
  "changelog.entries.profile-places-directory-cards.body":
    "Your places on your profile now use the same card as the local directory: cover photo, badges, category, tags and today's hours.",

  "changelog.entries.community-co-owners.title":
    "Owners can share a community with a co-owner",
  "changelog.entries.community-co-owners.body":
    "From Mod tools, an owner can make any member a co-owner, sharing join requests, moderation, settings and the roster. You can take it back any time.",

  "changelog.entries.card-art-counted-as-in-use.title":
    "Members card artwork now counts as an image in use",
  "changelog.entries.card-art-counted-as-in-use.body":
    "The crest and background a community picks for its members card now count as images in use and link back to that community.",

  "changelog.entries.community-house-rules.title":
    "House rules now come with the invitation",
  "changelog.entries.community-house-rules.body":
    "Joining a community with house rules means reading and agreeing to them first. If the rules change, everyone already inside is asked once to read the new version.",
  "changelog.entries.community-removal-bars-return.title":
    "Being removed from a community now means it",
  "changelog.entries.community-removal-bars-return.body":
    "Someone removed by a moderator is now barred from coming straight back in. Moderators can still remove and leave the door open, and any bar can be lifted from Mod tools.",
  "changelog.entries.community-announcements.title":
    "Owners can say something that carries",
  "changelog.entries.community-announcements.body":
    "Owners, co-owners and moderators can post an announcement: it pins to the top and reaches the community's members. Ordinary posts stay ordinary.",
  "changelog.entries.community-notification-levels.title":
    "Choose how much each community reaches you",
  "changelog.entries.community-notification-levels.body":
    "Each community now has its own setting: everything, announcements only, mentions only, or muted. Set it from the tab row. New members start on announcements only.",
  "changelog.entries.community-invites-any-time.title":
    "Invite people to your community any time",
  "changelog.entries.community-invites-any-time.body":
    "Owners, co-owners and moderators can now invite from Mod tools at any time. An invitation is a message, and joining stays the other person's decision.",
  "changelog.entries.community-join-review-context.title":
    "Reviewing a join request shows you the person",
  "changelog.entries.community-join-review-context.body":
    "A join request now arrives with pronouns, time on QueerPulse, and connections and communities you share, with the name linked to the profile.",
  "changelog.entries.community-resources-shelf.title":
    "A real shelf for a community's links",
  "changelog.entries.community-resources-shelf.body":
    "Owners, co-owners and moderators can build a community's resource shelf: crisis lines, legal guides, a reading list. It is reorderable and shows on the About tab.",
  "changelog.entries.community-co-ownership.title":
    "Co-owners, and a way to flag an absent owner",
  "changelog.entries.community-co-ownership.body":
    "A community can have a co-owner who shares the day-to-day powers, while transfers and archiving stay with the owner. If an owner goes unreachable, moderators can ask platform staff to look.",
  "changelog.entries.community-governance-history.title":
    "Every community can see its own history",
  "changelog.entries.community-governance-history.body":
    "Owners, co-owners and moderators can now read their community's record: role changes, removals, bans lifted, pauses and transfers. It used to be visible only to platform staff.",
  "changelog.entries.community-public-teaser.title":
    "Share a community with someone outside",
  "changelog.entries.community-public-teaser.body":
    "Owners can turn on a short public page for signed-out visitors: what the community is, who it is for, and how to ask for an invite. It never shows members or posts.",
  "changelog.entries.community-place-and-language.title":
    "Find communities near you, in your language",
  "changelog.entries.community-place-and-language.body":
    "Communities can say where they meet and which languages they run in, and Discover filters on both. Sorting by most active now happens on the server, so later pages stay right.",
  "changelog.entries.community-welcome-and-search.title":
    "A welcome on arrival, and search inside a community",
  "changelog.entries.community-welcome-and-search.body":
    "Owners can write a greeting a new member sees once on arrival, and every community's posts are now searchable across the whole history.",
  "changelog.entries.community-insight-trends.title":
    "Community stats now show direction",
  "changelog.entries.community-insight-trends.body":
    "The owner's stats panel adds twelve weeks of members and posts, so you can see whether a community is growing or going quiet. Whole-community totals only.",
  "changelog.entries.community-pause-reason.title":
    "A paused community explains itself honestly",
  "changelog.entries.community-pause-reason.body":
    "The pause banner now says which of the three reasons applies, when the pause started, and carries the moderator's note when there is one.",
  "changelog.entries.community-card-covers.title":
    "Communities show their photo",
  "changelog.entries.community-card-covers.body":
    "A community card now uses its cover photo as the header, with the category and access label on a soft dark wash. All cards are the same height.",
  "changelog.entries.community-founded-month.title":
    "Founded, down to the month",
  "changelog.entries.community-founded-month.body":
    "A community page now names the month it was founded as well as the year, written the way your language writes it: “Founded August 2026”.",
  "changelog.entries.card-text-legibility.title":
    "Cards you can read across a room",
  "changelog.entries.card-text-legibility.body":
    "Owners now choose how a card darkens its background: a panel behind the names, a shade top and bottom, or a veil over the whole card. Big cards get big print.",
  "changelog.entries.my-communities-cards.title":
    "Your communities, as communities",
  "changelog.entries.my-communities-cards.body":
    "My communities now leads with your own communities as full cards, with the same search, categories and sort. Each card shows how many people were around this week.",
  "changelog.entries.cards-load-whole.title": "Your card arrives in one piece",
  "changelog.entries.cards-load-whole.body":
    "A membership card now waits for the flag, the crest and your photo, then arrives complete, with a placeholder holding its shape while it comes. Showing the same card again is instant.",
  "changelog.entries.pronouns-on-membership-cards.title":
    "Pronouns on a membership card",
  "changelog.entries.pronouns-on-membership-cards.body":
    "A community can print each member's pronouns beside their name, taken from their profile, so updating them updates every card. Any member can switch their own off.",
  "changelog.entries.printed-membership-cards.title":
    "Membership cards you can print",
  "changelog.entries.printed-membership-cards.body":
    "Communities can print physical membership cards on a sheet you cut and fold, with the same code as the phone card. Replacing a lost card stops every printed copy working.",
  "changelog.entries.profile-back-to-origin.title":
    "The way out of a profile goes back where you were",
  "changelog.entries.profile-back-to-origin.body":
    "The link above a profile now returns to the page you came from, says where that is, and lands you at the spot in the list you tapped.",

  "changelog.entries.card-holder-open-card.title":
    "Open a member's card from the holder list",
  "changelog.entries.card-holder-open-card.body":
    "Any row in a community's card holder list now opens that member's real card at full size, with pausing, revoking and reinstating on the open card.",

  "changelog.entries.card-photo-legibility.title":
    "Photos that stay readable on any card",
  "changelog.entries.card-photo-legibility.body":
    "A member's photo and a community's crest now carry a two-tone edge and a soft shadow, so they hold their shape on a flag, a photo or a flat colour.",

  "changelog.entries.card-member-photos.title":
    "Photo membership cards, with the last word left to the member",
  "changelog.entries.card-member-photos.body":
    "A community can put each member's photo on their card, taken from their profile, so someone at a door can match card to person. Any member can switch their own off.",

  "changelog.entries.card-two-sides.title":
    "Your membership card now has a back, and a front worth looking at",
  "changelog.entries.card-two-sides.body":
    "Your membership card now has two sides. The front carries your community's flag or colour, its crest and your name; the back carries a large code, card number, dates and your role.",

  "changelog.entries.cohost-invite-copy.title":
    "Co-host invites read like words again, and Portuguese weeks start on Monday",
  "changelog.entries.cohost-invite-copy.body":
    "Co-host invites now read properly in English and Portuguese, including the roles, time commitments, expired links and the notification. Portuguese date pickers start the week on Monday.",

  "changelog.entries.card-backgrounds.title":
    "Put a flag, or your own photo, on your community's card",
  "changelog.entries.card-backgrounds.body":
    "A community's card can carry one of thirteen pride flags or a photo you upload, with a fixed scrim between the background and the text so the code stays scannable.",

  "changelog.entries.card-designer.title":
    "A real design tool for your community's membership card",
  "changelog.entries.card-designer.body":
    "Designing a card now happens on a full-width canvas: a large live preview, styles as miniature cards, a light and dark check, and the expiry date. Issuing cards is its own button.",

  "changelog.entries.membership-cards.title":
    "Communities can now give you a membership card",
  "changelog.entries.membership-cards.body":
    "Any community you belong to can issue you a membership card, kept with your other cards. It stays covered until you show it, and anyone can verify it by scanning the code.",

  "changelog.entries.push-preview-privacy.title":
    "Hide what your notifications say on a locked screen",
  "changelog.entries.push-preview-privacy.body":
    "A switch under phone notifications keeps the sender and message text off your lock screen, showing only that something arrived.",

  "changelog.entries.honest-success-states.title":
    "Buttons stopped saying things worked when they had not",
  "changelog.entries.honest-success-states.body":
    "Across communities, the forum, messages, connections, settings and the moderator tools, actions now wait for the server's real answer before confirming, and put your content back if it fails.",

  "changelog.entries.reports-really-filed.title":
    "Reports that fail now say so",
  "changelog.entries.reports-really-filed.body":
    "Every report path now confirms only once the report has actually been filed, and keeps what you wrote on screen so you can try again.",

  "changelog.entries.message-previews-and-drafts.title":
    "Messages you send before a chat exists no longer disappear",
  "changelog.entries.message-previews-and-drafts.body":
    "The first message in a new conversation now arrives. Unsent drafts are kept per account, so on a shared device nobody else can send yours.",

  "changelog.entries.moderation-holds.title":
    "Moderator decisions can no longer be undone by the author",
  "changelog.entries.moderation-holds.body":
    "Deletions now record who made them, so only a moderator can undo a moderator's takedown. Overturning an appeal also puts the content back.",

  "changelog.entries.housing-listings-stay-reviewed.title":
    "Edits to a live listing go back through review",
  "changelog.entries.housing-listings-stay-reviewed.body":
    "Editing the parts of a live listing that moderation covers now returns it to review, and the form says so before you submit. Asking for a viewing requires the affirming pledge too.",

  "changelog.entries.article-titles-render-plain.title":
    "Magazine headlines with an ampersand read properly again",
  "changelog.entries.article-titles-render-plain.body":
    "Headlines are stored as plain text now, so characters like & read properly on the article, the cards linking to it and the share preview. Existing headlines are cleaned up.",

  "changelog.entries.communities-hub-hero-restore.title":
    "Communities got its welcome back",
  "changelog.entries.communities-hub-hero-restore.body":
    "The top of Communities sits right under the nav again, with the full welcome: a title, a line about the space, and the My communities and Discover switch.",

  "changelog.entries.community-tags-discovery.title":
    "Find communities through tags and connections",
  "changelog.entries.community-tags-discovery.body":
    "A community's page now shows similar communities by shared tags, and Discover surfaces communities your connections have joined. The people who run a community can suggest new tags.",

  "changelog.entries.community-tags.title": "Communities can now add tags",
  "changelog.entries.community-tags.body":
    "The people who run a community can pick up to 8 tags from a curated list. They show on every community card, and Discover has a tags filter.",

  "changelog.entries.account-menu-install-app.title":
    "Install the app from your account menu",
  "changelog.entries.account-menu-install-app.body":
    'On a phone, your account menu has an "Install the app" row with steps for your device, and it hides once the app is installed.',

  "changelog.entries.member-directory-filter-crossfade.title":
    "Smoother filtering in the member directory",
  "changelog.entries.member-directory-filter-crossfade.body":
    "Change a filter in the member directory and the grid now cross-fades gently between results. If you prefer less movement, results swap instantly.",

  "changelog.entries.excerpt-line-editor-reorder.title":
    "A cleaner way to write and reorder page lines",
  "changelog.entries.excerpt-line-editor-reorder.body":
    "List editors like your page's excerpt lines give each line a full-width row. Drag the handle or use the arrows to reorder, and remove one with a tap.",

  "changelog.entries.collaborator-member-picker.title":
    "Credit collaborators by searching for members",
  "changelog.entries.collaborator-member-picker.body":
    "Adding collaborators on your persona now works by search: type a name or handle, pick the member from the list, and they show as a tag you can remove.",

  "changelog.entries.unified-searchable-select.title":
    "Dropdown menus you can type to search",
  "changelog.entries.unified-searchable-select.body":
    "Dropdowns for things like a category, a language or a neighbourhood now share one design. Start typing to filter a long list, and multi-choice menus show your picks as tags.",

  "changelog.entries.persona-date-month-picker.title":
    "Pick a month and year for your work, no more typing it out",
  "changelog.entries.persona-date-month-picker.body":
    "Dates on persona items are now a month-and-year picker, showing up as “July 2025” in your language. Dates you typed by hand stay exactly as you left them.",

  "changelog.entries.unified-date-picker.title":
    "A new date picker across the app, friendlier and fully keyboard-accessible",
  "changelog.entries.unified-date-picker.body":
    "Every date and time field now uses one calendar you can drive with the keyboard, type into directly, or jump through by month and year.",

  "changelog.entries.protect-your-work.title": "Protect your work",
  "changelog.entries.protect-your-work.body":
    "Published pieces now carry a copyright and first-published line, you can download a dated authorship record, and saved edits become version history you can restore.",

  "changelog.entries.verification-signals-bulk-keyboard.title":
    "Reviewers can spot duplicates, act in bulk, and fly through the queue",
  "changelog.entries.verification-signals-bulk-keyboard.body":
    "Verification requests now show account age, past rejections, and a flag when a phone number or reference appears on two accounts. Reviewers can act on several at once.",

  "changelog.entries.verification-request-review.title":
    "Request verification, and see where it stands",
  "changelog.entries.verification-request-review.body":
    "You can request email, phone or ID verification with a short note, then watch it move from submitted to in review to a decision, and appeal if it feels wrong.",

  "changelog.entries.verification-audit-trail.title":
    "You'll know when your verification status changes",
  "changelog.entries.verification-audit-trail.body":
    "When an admin changes your verification level you now get a notification with the reason, and the admin console keeps a full record of who decided what and when.",

  "changelog.entries.community-safety-enforcement.title":
    "Community safety settings that actually do something",
  "changelog.entries.community-safety-enforcement.body":
    "Both community safety settings now take effect: a second vouch is required before someone joins, and auto-freeze pauses posts and joins when a serious report lands.",

  "changelog.entries.community-settings-persist.title":
    "Community settings that actually save",
  "changelog.entries.community-settings-persist.body":
    "The admin Settings button now opens the full panel for a community's name, description, membership mode and rules, and the two safety toggles save and stay saved after a reload.",

  "changelog.entries.community-health-explainer.title":
    "See exactly how a community's health score is worked out",
  "changelog.entries.community-health-explainer.body":
    "The health-score explainer has a new \"How it's calculated\" view: the four signals and their weights, that community's own numbers, and the score bands.",

  "changelog.entries.modals-cover-full-screen.title":
    "Pop-up dialogs now dim the whole screen",
  "changelog.entries.modals-cover-full-screen.body":
    "A dialog's dimmed backdrop now covers the whole window and sits centred, on every layout.",

  "changelog.entries.inbox-menu-dropdown-visibility.title":
    "The chat actions menu now shows up properly",
  "changelog.entries.inbox-menu-dropdown-visibility.body":
    "The actions menu on an inbox conversation now opens above the chat below it, so Pin, Favourite and Delete are visible.",

  "changelog.entries.member-directory-filters-fix.title":
    "Member directory filters now actually filter",
  "changelog.entries.member-directory-filters-fix.body":
    "Open to, Where they're based, What they do, Profession, Member age and Languages now search the real directory. Set your own field, profession and languages in Settings so people can find you.",

  "changelog.entries.directory-ownership-claims.title":
    "Real ownership for the local directory",
  "changelog.entries.directory-ownership-claims.body":
    "The “verified queer-owned” badge on a local listing now means a moderator confirmed it, and you can request to claim a listing for a business you run.",

  "changelog.entries.session-expired-toast-fix.title":
    "Fixed a false “session expired” message",
  "changelog.entries.session-expired-toast-fix.body":
    "That message now appears only when you actually had a session that ran out.",

  "changelog.entries.join-request-form-fix.title":
    "Cleaned up the community join request form",
  "changelog.entries.join-request-form-fix.body":
    "The email field is gone from the join request form, and “how involved would you like to be” now shares a step with the note you leave for the moderators.",

  "changelog.entries.community-pulse-and-insights.title":
    "Communities now show their real events, discussions, and volunteer opportunities",
  "changelog.entries.community-pulse-and-insights.body":
    "A community's Events tab now lists its real upcoming gatherings, and the sidebar shows recent discussions and open volunteer opportunities. Owners and mods get a new insights panel on growth and posts.",

  "changelog.entries.onboarding-identity-and-notifications.title":
    "Onboarding now asks for pronouns and notification preferences",
  "changelog.entries.onboarding-identity-and-notifications.body":
    "Setup now has optional steps for your pronouns and a short bio, and for turning on notifications. The last step points you to Getting Started.",

  "changelog.entries.getting-started-vouch-fix.title":
    "Fixed the “vouch for someone” checklist step",
  "changelog.entries.getting-started-vouch-fix.body":
    "The step now completes only once you have vouched for someone. Being vouched for through a personal invite was ticking it off by mistake.",

  "changelog.entries.admin-invite-quota-controls.title":
    "Admins can set invite quotas per member",
  "changelog.entries.admin-invite-quota-controls.body":
    "The invite oversight page lets admins raise or lower how many invites a specific member can send each month.",

  "changelog.entries.invite-approval-email.title":
    "Invite approvals now send themselves",
  "changelog.entries.invite-approval-email.body":
    "Approving a join request emails the applicant their invite link right away. Reviewers can still copy the link by hand as a backup.",

  "changelog.entries.join-request-mutual-member-field.title":
    "Naming a member who can vouch for you is now a real match",
  "changelog.entries.join-request-mutual-member-field.body":
    "The “member who can vouch for you” field is now sent as its own field, so a reviewer can match it directly.",

  "changelog.entries.post-opportunity-team-picker.title":
    "Posting an opportunity now fills in your own details",
  "changelog.entries.post-opportunity-team-picker.body":
    "The Team and contact step fills in your contact handle, plus your partner slug if you help run a community, and team members come from a picker of your connections and communities.",

  "changelog.entries.side-quests-getting-started.title":
    "Side quests once you're all set",
  "changelog.entries.side-quests-getting-started.body":
    "Finishing the getting-started checklist now opens side quests: the badges you have left, each with a button to where you earn it, plus any unclaimed perk. Four new badges came with it.",

  // Corrected on 26 Aug 2026. This entry described a send that no code path
  // ever performed. It was wrong on the day it was published.
  "changelog.entries.join-request-invite-email.title":
    "Correction: approved applicants were never emailed an invite",
  "changelog.entries.join-request-invite-email.body":
    "QueerPulse sends no email, so approval never mailed anyone. What happens: approving a join request mints the invite link in the review queue, and a reviewer passes it on.",
  "changelog.entries.article-editor-header-and-send-on.title":
    "Article editor header fixed, and Send on now works",
  "changelog.entries.article-editor-header-and-send-on.body":
    "The article editor's toolbar now sits flush against the top of the screen, and “Send on” moves the piece to its next editorial stage.",
  "changelog.entries.gathering-rsvp-fix.title":
    "RSVP buttons now confirm your spot",
  "changelog.entries.gathering-rsvp-fix.body":
    "“I'm going” on a gathering now confirms right away, with a toast and a Cancel RSVP option in the same spot.",
  "changelog.entries.add-to-calendar-modal.title":
    "Add gatherings to your calendar",
  "changelog.entries.add-to-calendar-modal.body":
    "“Add to calendar” now opens a picker for Google Calendar or a .ics file that works with Apple Calendar, Outlook and most other apps.",
  "changelog.entries.recognition-xp.title": "Earn XP, levels, and badges",
  "changelog.entries.recognition-xp.body":
    "Your activity now earns experience toward levels and badges: finishing your checklist, joining communities, attending gatherings, connecting with members. Track it on the Badges page.",

  "changelog.entries.governance-editable-finances.title":
    "Editable finance figures, with a note on where each number comes from",
  "changelog.entries.governance-editable-finances.body":
    "Admins can correct the figures on the governance Finances tab, and each number is tagged by origin: a placeholder, an admin entry, or a calculated value.",

  "changelog.entries.push-devices-list.title":
    "See and remove every device getting your push notifications",
  "changelog.entries.push-devices-list.body":
    "Settings has a new Devices list under Notifications: every device registered for push, when it registered, and when it was last notified. Remove any you do not recognise.",

  "changelog.entries.admin-sitewide-announcement.title":
    "Admins can post a sitewide announcement banner",
  "changelog.entries.admin-sitewide-announcement.body":
    "Admins can post an announcement banner that every visitor sees, signed in or signed out, with optional auto-expiry. Each member can dismiss it, and editing the message brings it back.",

  "changelog.entries.admin-reports-page.title":
    "New consolidated admin Reports page",
  "changelog.entries.admin-reports-page.body":
    "A new Reports page gathers growth, report volume, community health and governance finances in one place, with an adjustable date range (4, 8, 12 or 26 weeks) and CSV export.",

  "changelog.entries.magazine-sections-browse.title":
    "Browse the magazine by section",
  "changelog.entries.magazine-sections-browse.body":
    "A new Sections page groups every article and issue by its editorial section: Features, Interview, Essays and the rest.",

  // Corrected on 26 Aug 2026. This entry announced a real send that never
  // reached anybody; the correction stays in place of a deletion so the record
  // shows what readers were told.
  "changelog.entries.magazine-digest-real-send.title":
    "Correction: issue digests never really sent",
  "changelog.entries.magazine-digest-real-send.body":
    "QueerPulse sends no email, so no test or issue digest ever reached an inbox. The desk still assembles an issue's digest.",

  "changelog.entries.magazine-deck-convert-to-article.title":
    "Decks can convert into articles",
  "changelog.entries.magazine-deck-convert-to-article.body":
    "The deck editor can turn a finished deck into an article, carrying over text, images and stat slides. Interactive slides have no article equivalent, so they are flagged for you.",

  "changelog.entries.magazine-writer-read-brief.title":
    "Writers can read their actual assignment brief",
  "changelog.entries.magazine-writer-read-brief.body":
    "“Read the brief” now opens the real brief for your piece: the angle, what to include, what to avoid, the rate, and who commissioned it.",

  "changelog.entries.admin-trust-network-cite-evidence.title":
    "Admins can cite evidence from the trust network graph",
  "changelog.entries.admin-trust-network-cite-evidence.body":
    "The graph inspector's “Cite” button now writes a real note to the member's audit trail describing the vouch relationship, ready for the next admin review.",

  "changelog.entries.admin-trust-network-ring-detection.title":
    "Trust network ring detection is now a real graph analysis",
  "changelog.entries.admin-trust-network-ring-detection.body":
    "A “vouch ring” flag now comes from real graph analysis: clusters of new accounts vouching only for each other, with no vouch from outside.",

  "changelog.entries.admin-reporter-credibility.title":
    "Moderation queue now shows reporter history alongside reported-party history",
  "changelog.entries.admin-reporter-credibility.body":
    "The report queue now shows the reporter's history too: how many reports they have filed and how many were dismissed, alongside the reported member's.",

  "changelog.entries.admin-housing-moderator-role.title":
    "New Housing-only moderator staff role",
  "changelog.entries.admin-housing-moderator-role.body":
    "A member can now be given a Housing moderator role, covering Housing listings and groups without the full platform Moderator tier.",

  "changelog.entries.gatherings-manage-attendees-remove-promote.title":
    "Hosts can now remove a guest or promote from the waitlist",
  "changelog.entries.gatherings-manage-attendees-remove-promote.body":
    "On the Attendees tab, removing a guest frees their spot for the waitlist, and Promote pulls a specific waitlisted guest onto the list, out of turn if you want.",

  "changelog.entries.myevents-calendar-feed-subscribe.title":
    "Subscribe to your events in Google or Apple Calendar",
  "changelog.entries.myevents-calendar-feed-subscribe.body":
    "“Subscribe to your feed” in My Events copies a private feed link. Add it to Google or Apple Calendar and it keeps itself up to date.",

  "changelog.entries.gatherings-recap-more-from-host.title":
    "Recaps now point you to more from the same host",
  "changelog.entries.gatherings-recap-more-from-host.body":
    "A recap page now shows a few other upcoming gatherings from the same host, so you can book the next one from there.",

  "changelog.entries.myevents-rsvp-actions-real.title":
    "My Events actions now actually update your RSVP",
  "changelog.entries.myevents-rsvp-actions-real.body":
    "Marking yourself maybe or going, accepting or declining an invite, and leaving a waitlist now write to your real RSVP.",

  "changelog.entries.myevents-block-host-real.title":
    '"Block the host" from My Events now really blocks them',
  "changelog.entries.myevents-block-host-real.body":
    "The block option in an event card's menu now uses the same block as everywhere else on QueerPulse.",

  "changelog.entries.myevents-reminder-indicator-honest.title":
    "The reminder bell on event cards is now a status, not a toggle",
  "changelog.entries.myevents-reminder-indicator-honest.body":
    "The bell now reads as a status. Reminders go to everyone going or maybe going, timed by your reminder-lead setting in Preferences.",

  "changelog.entries.gatherings-edit-date-time-fix.title":
    "Editing a gathering's date and time now actually reschedules it",
  "changelog.entries.gatherings-edit-date-time-fix.body":
    "The date field in Edit details now saves a real date and reschedules the gathering. Everyone with an RSVP gets notified of the change.",

  "changelog.entries.gatherings-cancelled-page-real-content.title":
    "A cancelled gathering's page now shows the real gathering",
  "changelog.entries.gatherings-cancelled-page-real-content.body":
    "A cancellation notice now carries the real title, date, host and venue of the gathering that was called off.",

  "changelog.entries.gatherings-cohost-roster-visible.title":
    "Hosts can now see who's already co-hosting",
  "changelog.entries.gatherings-cohost-roster-visible.body":
    "The cohost panel in the manage dashboard now lists the people already cohosting your gathering.",

  "changelog.entries.gatherings-remove-pricing-step.title":
    "Removed the pricing step from creating a gathering",
  "changelog.entries.gatherings-remove-pricing-step.body":
    "QueerPulse handles no payments, so the ticket-pricing step is gone from the create wizard.",

  "changelog.entries.messages-message-requests.title":
    "Message someone new, right from your inbox",
  "changelog.entries.messages-message-requests.body":
    "Search for anyone from New Message and send a first message. It arrives as a request they can accept or decline, and requests waiting for you sit in a new Requests tab.",

  "changelog.entries.messages-mute-conversation.title":
    "Mute a chat's notifications",
  "changelog.entries.messages-mute-conversation.body":
    "Every chat's options menu now has Mute, alongside Pin and Favorite. A muted chat stays where it is in your inbox and stops sending push notifications.",

  "changelog.entries.messages-search-in-chat.title":
    "Search inside a single conversation",
  "changelog.entries.messages-search-in-chat.body":
    "Open a chat and tap the search icon to search that conversation on its own.",

  "changelog.entries.governance-proposals-voting.title":
    "Governance decisions now go to a real community vote",
  "changelog.entries.governance-proposals-voting.body":
    "Removing an advisory-council seat needs a two-thirds vote, outside funding a majority. Open proposals show a live tally on the Governance page, and past ones keep their result.",

  "changelog.entries.governance-figures-honesty.title":
    "Governance's active-member count is now live",
  "changelog.entries.governance-figures-honesty.body":
    "The active-member figure on the Governance page is now counted from real accounts. The page also states plainly that the team reports the finance figures each quarter.",

  "changelog.entries.communities-sister-demo-only.title":
    "Sister-community suggestions stay in demo mode",
  "changelog.entries.communities-sister-demo-only.body":
    'Sister-community and "also in" suggestions run on sample data, so they now appear only in the demo.',

  "changelog.entries.communities-category-filter.title":
    "Community category filters work past the first page",
  "changelog.entries.communities-category-filter.body":
    "Category filtering now asks the server for matches, so it keeps working once you scroll past the first page.",

  "changelog.entries.communities-archive-reversible.title":
    "Archived communities can be brought back",
  "changelog.entries.communities-archive-reversible.body":
    "Admins can now unarchive a community, so archiving one by mistake is reversible.",

  "changelog.entries.changemakers-nomination-reason.title":
    "Changemaker nominations now ask for the sentence they promise",
  "changelog.entries.changemakers-nomination-reason.body":
    "The nomination form now has a real field for your sentence about the person, and reviewers can read what you wrote.",

  "changelog.entries.changemakers-nomination-review.title":
    "Changemaker nominations get a real answer",
  "changelog.entries.changemakers-nomination-review.body":
    "Admins can approve or dismiss a nomination, and you get notified of the decision.",

  "changelog.entries.changemakers-connect-honest.title":
    'A Changemaker profile\'s "Connect" button is honest about what it does',
  "changelog.entries.changemakers-connect-honest.body":
    "Changemaker profiles are editorial features with no member account behind them, so Connect now routes you to our general contact channel and says so.",

  "changelog.entries.moderation-assign-to-me.title":
    "Moderators can claim reports in the queue",
  "changelog.entries.moderation-assign-to-me.body":
    'Moderators can claim or release a report from the report drawer, and the "Assigned to me" filter now reflects real claims.',

  "changelog.entries.moderation-report-history-link.title":
    "See a member's full report history from the queue",
  "changelog.entries.moderation-report-history-link.body":
    'The "prior reports" count on a report is now a link to every other report about that person.',

  "changelog.entries.moderation-resolution-detail.title":
    "Resolved reports show what actually happened",
  "changelog.entries.moderation-resolution-detail.body":
    'Resolved reports now show who resolved them, what they decided, and when. "Closed X ago" counts from the resolution time.',

  "changelog.entries.moderation-sla-overdue.title":
    "Overdue reports are flagged in the queue",
  "changelog.entries.moderation-sla-overdue.body":
    "Each report's response deadline is now visible in the queue, with an overdue badge once it passes.",

  "changelog.entries.moderation-bulk-actions-expanded.title":
    "Bulk moderation now covers warn, suspend, and ban",
  "changelog.entries.moderation-bulk-actions-expanded.body":
    "The bulk action bar now also handles warn, suspend with a duration picker, and ban, so a wave of coordinated reports can be cleared in one pass.",

  "changelog.entries.moderation-appeal-integrity.title":
    "Appeal reviews show the real evidence, and can't be self-reviewed",
  "changelog.entries.moderation-appeal-integrity.body":
    "An appeal review now shows the original reported content alongside the moderator's summary, and the moderator who decided a case is blocked from reviewing its appeal.",

  "changelog.entries.forum-write-rate-limit.title":
    "Forum posting gets its own rate limit",
  "changelog.entries.forum-write-rate-limit.body":
    "Threads, replies and votes now have their own abuse guard, matching the protection communities already had.",

  "changelog.entries.forum-first-post-accuracy.title":
    'The "first post" prompt checks your real history',
  "changelog.entries.forum-first-post-accuracy.body":
    "The invitation to make your first forum post now checks whether you have ever posted, so it stops greeting regulars as newcomers.",

  "changelog.entries.forum-lock-reason.title": "Locked threads can say why",
  "changelog.entries.forum-lock-reason.body":
    "A moderator can add a short reason when locking a thread, and it shows in the locked banner.",

  "changelog.entries.forum-shareable-filters.title":
    "Forum category and sort survive a refresh",
  "changelog.entries.forum-shareable-filters.body":
    "Picking a category or sort tab now updates the page link, so a refresh or a shared link keeps your view.",

  "changelog.entries.forum-search-hint.title":
    "Forum search now says what it searches",
  "changelog.entries.forum-search-hint.body":
    "A short hint under the forum search box now explains that it matches thread titles.",

  "changelog.entries.forum-most-helpful-real.title":
    '"Most helpful" sort reflects real votes',
  "changelog.entries.forum-most-helpful-real.body":
    'Sorting replies by "most helpful" now uses real upvotes everywhere, and the top-voted reply carries the star badge.',

  "changelog.entries.recognition-locked-badges-honest.title":
    "The badge case only shows badges you can actually earn",
  "changelog.entries.recognition-locked-badges-honest.body":
    "The badge case now lists only badges with a real way to earn them. A few locked ones led nowhere, and they stay hidden until that changes.",

  "changelog.entries.recognition-vouch-perk-copy.title":
    '"Vouch access" perk description matches reality',
  "changelog.entries.recognition-vouch-perk-copy.body":
    "Vouching has never had a level requirement, so the perk case now says what is true: every active member can vouch from the start.",

  "changelog.entries.recognition-visible-on-profiles.title":
    "See other members' level and badges",
  "changelog.entries.recognition-visible-on-profiles.body":
    "Level and badges now show on other members' profiles too, so recognition reads as a visible signal between members.",

  "changelog.entries.vouch-daily-cap.title":
    "A daily cap on vouches, to keep the signal meaningful",
  "changelog.entries.vouch-daily-cap.body":
    "Alongside the cooldown between vouches, there is now a generous daily cap, so the signal keeps its weight over time.",

  "changelog.entries.magazine-article-publish-schedule.title":
    "Publish and schedule articles for real",
  "changelog.entries.magazine-article-publish-schedule.body":
    "Publish and Schedule in the article editor now work: your piece goes live at once or at a time you pick, with or without an issue attached.",

  "changelog.entries.magazine-writer-draft-paste-fix.title":
    'Pasting a draft into "File a draft" no longer loses it',
  "changelog.entries.magazine-writer-draft-paste-fix.body":
    "Draft text you paste when filing a piece now flows into the article editor as real paragraphs, ready to keep shaping.",

  "changelog.entries.magazine-live-discovery.title":
    "The magazine now has somewhere to browse",
  "changelog.entries.magazine-live-discovery.body":
    "The magazine front, issue archive and author pages now run on real data, and a new authors directory lists everyone writing for the magazine.",

  "changelog.entries.culture-submissions-real.title":
    "Club, Showcase, and Radio submissions are now real",
  "changelog.entries.culture-submissions-real.body":
    "Suggesting a pick, posting a commission project, submitting showcase work and sending in a playlist now save for real.",

  "changelog.entries.culture-radio-honest.title":
    "Radio's controls tell the truth",
  "changelog.entries.culture-radio-honest.body":
    'The Radio panel\'s play and skip controls now reflect what is actually live, and "Become a curator" opens the real playlist-submission form.',

  "changelog.entries.newsletter-unsubscribe.title":
    "Unsubscribe from the newsletter yourself",
  // Body corrected on 26 Aug 2026: the original implied a confirmation email.
  "changelog.entries.newsletter-unsubscribe.body":
    "There is now a real unsubscribe link and page: open it with your unsubscribe token and your address comes off the list.",

  "changelog.entries.resources-crisis-hotline-coverage.title":
    "Crisis hotlines now show on every crisis-adjacent resource page",
  "changelog.entries.resources-crisis-hotline-coverage.body":
    "Legal, Trans Healthcare, Harm Reduction, Sexual Health, Safety and Mental Health now carry the same crisis line strip as Wellbeing, so help is one tap away.",

  "changelog.entries.resources-library-consolidated.title":
    "Resources home is now backed by real guide data",
  "changelog.entries.resources-library-consolidated.body":
    "The Resources home page now shows the same real guides as the rest of the app, with freshness tracked per guide.",

  "changelog.entries.resources-guide-freshness.title":
    "Guides now show when they were last checked",
  "changelog.entries.resources-guide-freshness.body":
    'Every guide card shows the date an editor last verified it, or an honest "not yet verified".',

  "changelog.entries.resources-suggest-edit-expanded.title":
    "Suggest an edit, beyond the Glossary",
  "changelog.entries.resources-suggest-edit-expanded.body":
    '"Suggest an edit" now opens from Legal, Trans Healthcare, Harm Reduction, Mental Health and the guide library, alongside the Glossary.',

  "changelog.entries.directory-review-reporting.title":
    "Report a single review in the local directory",
  "changelog.entries.directory-review-reporting.body":
    "Every review on a business page now has a Report action, so you can flag one abusive or fake review on its own. A moderator handles it like any other report.",

  "changelog.entries.directory-search-pagination.title":
    "Faster, more complete search in the local directory",
  "changelog.entries.directory-search-pagination.body":
    "Directory search now filters on our servers and loads more places as you reach the end of the list, so a broad search reaches the real count.",

  "changelog.entries.directory-edit-suggestions-applied.title":
    "Accepted listing corrections now actually update the listing",
  "changelog.entries.directory-edit-suggestions-applied.body":
    "When a moderator accepts your correction to a business listing (hours, address, phone, website or description), the listing updates and its owner is notified.",

  "changelog.entries.housing-my-listings.title":
    "Manage the room or place you posted, from your own My Listings page",
  "changelog.entries.housing-my-listings.body":
    "My Listings gathers the housing you posted: edit it, mark it filled, extend it, or take it down. A listing expires on its own after a couple of months without an update.",

  "changelog.entries.appeal-outcome-tracking.title":
    "Appeal outcomes now show your real status",
  "changelog.entries.appeal-outcome-tracking.body":
    "The appeal outcome page now shows your real status, straight from the moderator's decision: upheld, overturned, or awaiting review.",

  "changelog.entries.quickexit-more-pages.title":
    "Quick exit is available on more safety pages",
  "changelog.entries.quickexit-more-pages.body":
    "The quick-exit button now also appears on Block & Mute, both appeal pages and Safe Space listings.",

  "changelog.entries.legal-links-reconciled.title":
    "Every legal document is now listed in both the footer and the menu",
  "changelog.entries.legal-links-reconciled.body":
    "The footer and the About menu now list the same complete set: privacy, terms, cookies, imprint, guidelines and data requests.",

  "changelog.entries.hate-crime-resources-linked.title":
    "Hate Crime Resources is now linked from the footer",
  "changelog.entries.hate-crime-resources-linked.body":
    "Hate Crime Resources now sits in the footer's Support column, next to Legal Aid and Report & Safety.",

  "changelog.entries.listing-quick-edit.title":
    "Quick edit for your directory listing",
  "changelog.entries.listing-quick-edit.body":
    "Your account's Places section now has a Quick Edit for the basics: blurb, hours note, phone, website. The full editor stays one click away.",

  "changelog.entries.topics-follow-notifications-and-directory.title":
    "Following a topic now actually notifies you, plus a new Topics directory",
  "changelog.entries.topics-follow-notifications-and-directory.body":
    "Follow a topic and you now get told when a forum thread is posted with its tag. A new Topics page in the Community menu lists every topic with a follow toggle.",

  "changelog.entries.search-topics-real-results.title":
    "Topics now show up in global search",
  "changelog.entries.search-topics-real-results.body":
    'Global search now returns hashtag topics alongside members and communities, and any category with more results than fit offers a "See all" link.',

  "changelog.entries.feed-connections-tab.title":
    'A new "Connections" tab in your feed',
  "changelog.entries.feed-connections-tab.body":
    "The feed's tab bar now has Connections: posts, forum threads and gatherings from your connections, gathered in one place.",

  "changelog.entries.connections-report-now-files.title":
    "Fixed: Reporting a connection now files a real report",
  "changelog.entries.connections-report-now-files.body":
    "Report in a connection's options menu now opens the usual reason and detail form and files a real report with the moderation team.",

  "changelog.entries.getting-started-xp-not-awarded-fix.title":
    "Fixed: Getting Started XP not showing up",
  "changelog.entries.getting-started-xp-not-awarded-fix.body":
    "Your level now updates promptly as you complete Getting Started steps, and each finished step shows the XP it earned.",

  "changelog.entries.badges-levels-v2-redesign.title":
    "Badges & levels redesigned",
  "changelog.entries.badges-levels-v2-redesign.body":
    "Badges & Levels has a new look: a level dial, the badges you are closest to earning, a filterable badge case, seasonal badges, and a view of where your XP came from.",

  "changelog.entries.listing-preview-matches-card.title":
    "The listing preview now matches your real directory card",
  "changelog.entries.listing-preview-matches-card.body":
    'The preview while you edit a directory listing now renders the exact card people see in the directory, cover photo included, with an "Add cover photo" shortcut when you have none.',

  "changelog.entries.profile-shapings-editor.title":
    'Edit your "What shaped me" section',
  "changelog.entries.profile-shapings-editor.body":
    "The film, book, song and moment that shaped you can now be added and edited from your profile, alongside your other lists.",

  "changelog.entries.xp-breakdown.title": "See what earned your XP",
  "changelog.entries.xp-breakdown.body":
    "Getting Started now shows the top sources behind your XP, and the Badges page breaks down every source with how much it earned you and what is still open.",

  "changelog.entries.profile-hero-rail-redesign.title":
    "Profile hero and rail redesigned",
  "changelog.entries.profile-hero-rail-redesign.body":
    "Your profile has a cleaner hero and a new side rail: trust signals like verified, staff and vouch count come with a plain-language explainer, plus a section nav.",
  "changelog.entries.profile-rail-stats-redesign.title":
    "Your profile stats, at a glance",
  "changelog.entries.profile-rail-stats-redesign.body":
    "Connections, vouches given and vouches received now show as clearly labeled numbers you can read without hovering. Your privacy controls moved into a settings menu next to Edit.",
  "changelog.entries.profile-who-sees-what-controls.title":
    "Choose exactly who sees what on your profile",
  "changelog.entries.profile-who-sees-what-controls.body":
    'A new "Who sees what" panel gathers your visibility controls: presets, switches for your photo, neighbourhood and vouchers, per-identity discoverability, and hiding from specific people.',
  "changelog.entries.profile-your-data-panel.title":
    'A "Your data" panel for your account',
  "changelog.entries.profile-your-data-panel.body":
    'A new "Your data" panel on your profile lets you download everything QueerPulse holds on you, step away, request erasure with a 30-day grace period, or file a data request.',
  "changelog.entries.profile-board-work-name-qr-updates.title":
    "Board posts can be marked found, work entries get a second link, and more",
  "changelog.entries.profile-board-work-name-qr-updates.body":
    "You can now mark a board post as found, record how your name is pronounced, write a Portuguese bio, and open a QR code for your profile.",

  "changelog.entries.gathering-venue-directory-link.title":
    "Link a gathering's venue to its local directory listing",
  "changelog.entries.gathering-venue-directory-link.body":
    "Setting a gathering's venue now lets you search the local directory and pick a real business, so the venue name links to its listing.",
  "changelog.entries.add-to-calendar-picker-redesign.title":
    "Add to calendar now offers Google, Apple, Outlook, and Yahoo",
  "changelog.entries.add-to-calendar-picker-redesign.body":
    "Add to calendar is now a picker with a row each for Google, Apple, Outlook and Yahoo, and it uses the event's listed timezone, so times land right.",
  "changelog.entries.local-directory-card-redesign.title":
    "Directory and venue cards now show a photo, rating, and open status",
  "changelog.entries.local-directory-card-redesign.body":
    "Directory and venue cards were redesigned around a photo, star rating, price and tag pills, a save button, and an open-till status.",

  "changelog.entries.forum-thread-pinning.title":
    "Moderators can pin forum threads to the top",
  "changelog.entries.forum-thread-pinning.body":
    "Moderators and admins can pin a thread from its options menu, holding up to 3 above the list on any sort tab. Unpin the same way.",

  "changelog.entries.magazine-desk-notifications-cleanup.title":
    "Fewer duplicate desk notifications, and a working Mark all as read",
  "changelog.entries.magazine-desk-notifications-cleanup.body":
    "Repeated edits to the same piece by the same person now collapse into one desk notification, and Mark all as read really clears the bell badge.",

  "changelog.entries.volunteer-opportunity-edit-parity.title":
    "Editing an opportunity now uses the same form as posting one",
  "changelog.entries.volunteer-opportunity-edit-parity.body":
    "Editing a volunteer opportunity now uses the same screen as posting one, including the why, tasks and commitment fields.",

  "changelog.entries.local-directory-sort-fix.title":
    "Fixed the Local Business directory's sort menu",
  "changelog.entries.local-directory-sort-fix.body":
    'The Sort menu on the Local Business directory now always has room to show "Featured", "A to Z" and "By neighbourhood" on one line.',

  "changelog.entries.governance-chart-upgrade.title":
    "A clearer income-vs-spending chart in the governance area",
  "changelog.entries.governance-chart-upgrade.body":
    "The quarterly finance chart now fits its space and reads more clearly. Hover or focus a bar for that quarter's income, spending and the surplus saved to the reserve.",

  "changelog.entries.landing-live-preview.title":
    "A live homepage preview while curating the landing page",
  "changelog.entries.landing-live-preview.body":
    "The team curating the signed-out homepage now sees a live preview beside the editor: add, reorder, hide or reword a featured card and it updates instantly.",

  "changelog.entries.personas-in-directory.title":
    "Profile personas show up in the directory",
  "changelog.entries.personas-in-directory.body":
    "Personas linked to your member profile now appear in the persona directory alongside standalone ones. Standalone personas stay pseudonymous.",

  "changelog.entries.therapist-personas-directory.title":
    "Therapist directories, powered by real profiles",
  "changelog.entries.therapist-personas-directory.body":
    "The queer-affirming therapist directories now show real, community-verified profiles: how each therapist works, fees, availability, where they practise, and vouches. Therapists manage their own profile.",

  "changelog.entries.concern-intake-live.title":
    "Raise a concern, and we'll actually see it",
  "changelog.entries.concern-intake-live.body":
    'The "Submit a concern" form on the governance page now reaches the team, landing in a staff dashboard where it is triaged and tracked.',

  "changelog.entries.housing-neighbourhoods-map.title":
    "Pick several neighbourhoods, and browse homes on a map",
  "changelog.entries.housing-neighbourhoods-map.body":
    "Housing search now filters by several Lisbon neighbourhoods at once, and a new map view groups homes by neighbourhood. Tap one on the map to add it to your filters.",

  "changelog.entries.housing-outro-band.title":
    "A closing invitation on the housing board",
  "changelog.entries.housing-outro-band.body":
    "The main housing board now ends with the same warm closing band as the rest of the site, with quick ways to list your space or ask the forum.",

  "changelog.entries.gathering-audience-scope.title":
    "Choose who can see your gathering",
  "changelog.entries.gathering-audience-scope.body":
    "Hosting a gathering now lets you set how far it reaches: everyone on QueerPulse, the people your connections know, your own connections, one community, or invite-only.",

  "changelog.entries.unified-pronoun-picker.title":
    "One consistent pronoun picker across your profiles",
  "changelog.entries.unified-pronoun-picker.body":
    "Your pronoun options now come from one shared list everywhere you set them: your profile, your work profile and housing. You can pick more than one set and add your own.",
  "changelog.entries.work-profile-skills-focus.title":
    "Pick your skills and focus areas on your work profile",
  "changelog.entries.work-profile-skills-focus.body":
    'You now pick the "Skills and focus" chips on your work profile: what you can offer and where you want support, used to match you in the skills exchange.',
  "changelog.entries.profile-personal-fields.title":
    "Your name, pronouns and location now sit together",
  "changelog.entries.profile-personal-fields.body":
    "Your name, pronouns and location now sit together at the top of both profile editors, so the essentials read as one block.",
  "changelog.entries.feed-avatar-to-profile.title":
    "Tap anyone's photo in the feed to open their profile",
  "changelog.entries.feed-avatar-to-profile.body":
    "Tap the avatar on any post, new-member note, forum thread or gathering card in the feed and you land straight on that person's profile.",
  "changelog.entries.affirming-housing-baseline.title":
    "Every home and housemate here is LGBTQ+ affirming. Now it's the standard",
  "changelog.entries.affirming-housing-baseline.body":
    "LGBTQ+ affirming is now the baseline on the housing board. You take a short pledge before posting or reaching out, and every listing carries the badge.",
  // ── Wave B2: verified listings, viewing scheduling, two-sided blind reviews ─
  "changelog.entries.housing-listing-discovery.title":
    "Find the right home, real photos, a filter that fits, and a heads-up when one comes up",
  "changelog.entries.housing-listing-discovery.body":
    "Listings now open into a full-screen photo viewer with captions. The board has real filters for price, neighbourhood, bedrooms, access and move-in date, and you can save a search.",

  "changelog.entries.housing-viewings-reviews.title":
    "See a place before you pay, and reviews that can't be gamed",
  "changelog.entries.housing-viewings-reviews.body":
    "You can now request a viewing, by video or in person, and see the exact address once it is accepted. Both sides can then leave a blind review.",

  // ── Wave B1: housing listing integrity — risk scoring, evidence, transparency ─
  "changelog.entries.housing-listing-integrity.title":
    "Housing listings you can trust a little more",
  "changelog.entries.housing-listing-integrity.body":
    "Every new listing now states its access honestly and says whether a member or an agent is offering it. Listings are screened before they reach the board.",

  // ── Wave A: housing safety, map privacy, messaging safety, flatmates, groups ─
  "changelog.entries.housing-scam-safety-tenant-rights.title":
    "Rent without getting scammed, and know your rights",
  "changelog.entries.housing-scam-safety-tenant-rights.body":
    "A short safety note now appears when you reach out about a place: never pay before signing, video-call first, keep the conversation here. A new Housing safety page covers your tenant rights.",

  "changelog.entries.housing-map-area-privacy.title":
    "See the area first, the exact address once you're connected",
  "changelog.entries.housing-map-area-privacy.body":
    "Listings now show a place on a map at neighbourhood level, and the map sharpens to the precise spot and the full address once you and the person are connected.",

  "changelog.entries.messaging-safety-block-report-pii.title":
    "Block, report, and a gentle nudge before you overshare",
  "changelog.entries.messaging-safety-block-report-pii.body":
    "You can block or report someone from a conversation, and blocking takes effect at once. A quiet note appears if a draft holds a phone number, email or bank details.",

  "changelog.entries.flatmate-pronoun-pre-share.title":
    "Share your pronouns with a hello, only when you choose",
  "changelog.entries.flatmate-pronoun-pre-share.body":
    "Saying hello to a potential flatmate now lets you share your pronouns with your message, off by default and only with that person.",

  "changelog.entries.flatmate-discovery-mode.title":
    "A calmer way to browse flatmates",
  "changelog.entries.flatmate-discovery-mode.body":
    "The flatmate board now has a Discovery view: one profile at a time, with a clear reason it matched you. When you both say yes, you can say hello.",

  "changelog.entries.vetted-housing-groups.title":
    "Vetted housing groups queer renters actually trust",
  "changelog.entries.vetted-housing-groups.body":
    "Vetted housing groups now have a home here: every listing states the rent up front and describes accessibility honestly. Ask to join and someone from the group reads your request.",

  "changelog.entries.vouch-multiple-relationships.title":
    "Say all the ways you know someone",
  "changelog.entries.vouch-multiple-relationships.body":
    "When you vouch for someone, you can now pick every way you know them: friends, collaborators, neighbours you also met here.",

  "changelog.entries.getting-started-checklist.title":
    "A gentle checklist for your first steps",
  "changelog.entries.getting-started-checklist.body":
    "A new Getting started page in your account menu walks you through the first moves: fill in your profile, join a community, vouch for someone, share a post. Steps tick themselves off.",

  "changelog.entries.onboarding-set-up-personas-after.title":
    "A calmer welcome, set up personas once you're in",
  "changelog.entries.onboarding-set-up-personas-after.body":
    "Onboarding now leaves personas for later. Get settled first, then create a persona for your craft whenever you like from your personas page.",

  "changelog.entries.pin-favorite-chats-inbox-tabs.title":
    "Pin, favorite, and filter your inbox",
  "changelog.entries.pin-favorite-chats-inbox-tabs.body":
    "Pin up to 3 chats to the top of your inbox, mark the ones that matter as favorites, and filter by All, Unread, Favorites or Groups.",

  "changelog.entries.identity-verification-honest-badges.title":
    "Real identity verification with honest badges",
  "changelog.entries.identity-verification-honest-badges.body":
    "Confirm a phone number to post a listing or reach out about a home. An optional ID check earns an ID-verified badge; a partner runs it, so we never see your document.",

  "changelog.entries.flatmate-explainable-matching.title":
    "Smarter, explainable flatmate matching",
  "changelog.entries.flatmate-explainable-matching.body":
    "Every flatmate match now shows why it matched: budget, neighbourhood, timing, lifestyle and household basics. Fill in a short co-living questionnaire to sharpen it.",

  "changelog.entries.flatmate-safe-space-identity.title":
    "Say who you are on the flatmate board, on your terms",
  "changelog.entries.flatmate-safe-space-identity.body":
    "Your flatmate profile can hold your pronouns, gender, and what makes a home feel safe. It is all opt-in: you choose who sees it, and you can clear it anytime.",

  "changelog.entries.privacy-policy-refresh.title":
    "The Privacy Policy now matches what the platform actually does",
  "changelog.entries.privacy-policy-refresh.body":
    "The policy now covers Sign in with Google, push notifications, location and messaging data, and the exact services we rely on. Your privacy settings and the Cookie Policy match it.",

  "changelog.entries.gatherings-manage-rsvp-recap-live.title":
    "Hosting a gathering now works for real",
  "changelog.entries.gatherings-manage-rsvp-recap-live.body":
    "RSVP is now a button on the gathering itself, with a waitlist when it is full. Organisers can edit details, cancel, see who is coming, add co-hosts, and post the after-photos album.",

  "changelog.entries.coop-template-portuguese.title":
    "The co-op formation templates now speak Portuguese",
  "changelog.entries.coop-template-portuguese.body":
    "The values charter, model statutes, member share agreement and the rest now read in European Portuguese as well as English. Have a lawyer check the specifics before you file anything.",

  "changelog.entries.members-explainer-modal.title":
    "The landing “Explore members” button now explains itself",
  "changelog.entries.members-explainer-modal.body":
    "Signed-out visitors who tap “Explore members” now get a short explainer on how membership works, with a clear way to request an invite or sign in.",

  "changelog.entries.invite-request-mutual-email.title":
    "Asking to join now asks for a member's email",
  "changelog.entries.invite-request-mutual-email.body":
    "The form now asks for the email of someone you know here, so we can match them and vouch you in faster. The field stays optional.",

  "changelog.entries.report-form-guide-split.title":
    "The report form and the reporting guide are now separate pages",
  "changelog.entries.report-form-guide-split.body":
    "Making a report is now its own focused page. How reporting works, the principles behind each decision, and the public moderation log moved to a dedicated page, linked both ways.",

  "changelog.entries.safety-page-report-form.title":
    "Reporting a concern goes straight to the form",
  "changelog.entries.safety-page-report-form.body":
    "The safety page now sends you to the in-app report form, and its explanation of vouching matches how joining really works.",

  "changelog.entries.public-profile-eligibility-live.title":
    "Public profiles you can actually earn.",
  "changelog.entries.public-profile-eligibility-live.body":
    "Your progress now tracks real activity: writing you published, gatherings you hosted, vouches and endorsements, and time spent showing up. Open your profile to see where you stand.",

  "changelog.entries.public-profile-eligibility-tracker.title":
    "A clearer path to a public profile.",
  "changelog.entries.public-profile-eligibility-tracker.body":
    "You now see the essentials you need, how contributions, community trust and participation add up, and the next step that moves you forward.",

  "changelog.entries.how-communities-work-page.title":
    "A clearer welcome to communities",
  "changelog.entries.how-communities-work-page.body":
    "Community cards on the homepage now lead to a page explaining how communities work and why they matter, so you know what you are joining before you ask for an invite.",

  "changelog.entries.guidelines-read-gate.title":
    "Read the guidelines through before you agree",
  "changelog.entries.guidelines-read-gate.body":
    "The guidelines now open with the hard lines and spell out how to report harm and what happens when someone crosses them, from a warning to removal.",

  "changelog.entries.guidelines-in-sheet.title":
    "Read the community guidelines without losing your place",
  "changelog.entries.guidelines-in-sheet.body":
    "On the invite request and onboarding, the guidelines now slide up in a sheet you can read and close right where you are, so everything you typed stays.",

  "changelog.entries.meganav-highlight-illustrations.title":
    "Illustrated menus in the top navigation",
  "changelog.entries.meganav-highlight-illustrations.body":
    "Each top navigation menu now opens with a hand-drawn illustration of its highlight: people gathering, the city, support, culture, work.",

  "changelog.entries.coming-out-guide-public.title":
    "The coming-out guide is open to everyone again",
  "changelog.entries.coming-out-guide-public.body":
    "It was locked behind sign-in by accident. It is a support page, so it is public once more and reaches anyone who is questioning, with an account or without one.",

  "changelog.entries.poem-editor-v2.title":
    "Writing a poem now feels like writing a poem",
  "changelog.entries.poem-editor-v2.body":
    "A live preview sits beside what you type, and you can drag stanzas into place or drop in a section break. Every poem gets a shareable link and a calmer reading view.",

  "changelog.entries.under18-open-invite.title":
    "The under-18 message now opens a door instead of closing one",
  "changelog.entries.under18-open-invite.body":
    "If you are under 18, the note now leads with what is open to everyone: the library, the magazine and our resources, free to read without an account.",

  "changelog.entries.communities-explained.title":
    "A clearer look at how communities work",
  "changelog.entries.communities-explained.body":
    "The explainer page was redesigned around what a community is, how you join and why it matters, with a way into the ones already here.",

  "changelog.entries.smoother-drag-reorder.title": "Smoother drag-to-reorder",
  "changelog.entries.smoother-drag-reorder.body":
    "Grab a row in a persona section by its handle and the others glide out of the way. The arrows stay for keyboard and screen reader use.",

  "changelog.entries.poem-translations.title": "Add translations of a poem",
  "changelog.entries.poem-translations.body":
    "A poem can hold several versions, the original beside its translations. Name each one, like Português or English, and readers switch with a tap.",

  "changelog.entries.reframe-your-photos.title": "Reframe your photos",
  "changelog.entries.reframe-your-photos.body":
    "Upload a photo and you can pan and zoom to choose exactly how it is framed before you save, for profile photos, personas and anything else.",

  "changelog.entries.guidelines-agree-self-tick.title":
    "The guidelines box now ticks itself once you've read to the end",
  "changelog.entries.guidelines-agree-self-tick.body":
    "The guidelines open in a sheet, the confirm button unlocks when you reach the end, and finishing there ticks the box for you. A stray click leaves it alone.",

  "changelog.entries.adults-only-explainer-modal.title":
    "“Here's why we're 18+” opens right where you are",
  "changelog.entries.adults-only-explainer-modal.body":
    "The “here's why” link on the age check now opens a quiet sheet over the page. Read it, close it, and carry on with everything you typed still there.",

  "changelog.entries.adults-only-explainer.title":
    "“Here's why we're 18+” now actually says why",
  "changelog.entries.adults-only-explainer.body":
    "The Eligibility section now says plainly why QueerPulse is adults-only, and why under-18s still belong in queer community. The “here's why” link takes you there.",

  "changelog.entries.persona-excerpt-crash-fix.title":
    "Adding a page excerpt no longer breaks the profile",
  "changelog.entries.persona-excerpt-crash-fix.body":
    "Filling in one field of a persona excerpt or menu detail before the rest no longer leaves the page blank. It shows what you added so far.",

  "changelog.entries.poem-line-break-fix.title": "Poem line breaks now stick",
  "changelog.entries.poem-line-break-fix.body":
    "Pasting a poem into the editor no longer runs the lines together. Each verse keeps its own line, exactly as you typed or pasted it.",

  "changelog.entries.poet-rich-poems.title": "Write and read poems in full",
  "changelog.entries.poet-rich-poems.body":
    "Poet profiles now have a proper poem editor, with stanzas, section breaks, notes, italics and bold. Readers tap any poem to open it in a spacious reading view.",

  "changelog.entries.persona-editor-drag-reorder.title":
    "Drag to reorder items on a persona",
  "changelog.entries.persona-editor-drag-reorder.body":
    "The grip handle on each item in a persona section now drags for real, with a finger or a mouse, and the list reshuffles live. The arrows stay for keyboard use.",

  "changelog.entries.persona-item-link-picker-size.title":
    "Fixed oversized inline fields in a few editors",
  "changelog.entries.persona-item-link-picker-size.body":
    "The link-type picker on a persona project, the content-note rows in the film submission form, and the photo-link boxes when listing a business are back at their compact size.",

  "changelog.entries.persona-editor-wide-sheet.title":
    "Editing a persona section now opens a roomy sheet from the bottom",
  "changelog.entries.persona-editor-wide-sheet.body":
    "Editing a project, role or photo on your persona now opens a wide sheet from the bottom, with fields side by side. Phones keep the full-width sheet.",

  "changelog.entries.community-featured-cards.title":
    "Featured communities get the full spotlight card, plus cover photos",
  "changelog.entries.community-featured-cards.body":
    "Featured communities on the homepage now use the full card: cover image, category, who runs it, and real member faces. Owners can add a cover photo.",

  "changelog.entries.media-in-use-references.title":
    "See where each uploaded image is used, and what's safe to delete",
  "changelog.entries.media-in-use-references.body":
    "Your uploads and the admin images console now list where each picture is still used, with a link to each. Unreferenced pictures are flagged as safe to remove.",

  "changelog.entries.homepage-featured-photo-fix.title":
    "Featured members' photos show on the homepage again",
  "changelog.entries.homepage-featured-photo-fix.body":
    "The homepage spotlight was serving each featured member's portrait as a broken image. It now resolves those photos the way every other avatar does, so they load.",

  "changelog.entries.admin-media-filter-by-uploader.title":
    "Admins can filter uploaded images by who sent them",
  "changelog.entries.admin-media-filter-by-uploader.body":
    "An admin can now narrow the uploaded-images grid to one member, by searching a name or handle or tapping an uploader's name on any file.",

  "changelog.entries.persona-preview-banner-bleed.title":
    "Persona banners now run edge-to-edge on your profile",
  "changelog.entries.persona-preview-banner-bleed.body":
    "The cover on the “Also working as” card now fills it edge to edge, matching the look your personas already have on their own pages.",

  "changelog.entries.magazine-archive-truthful-hero.title":
    "The magazine archive shows only real editions now",
  "changelog.entries.magazine-archive-truthful-hero.body":
    "The all-editions page used to open with placeholder figures like “nine issues since 2024”. Those stay in the preview only, and the live page leads straight into the real back issues.",

  "changelog.entries.persona-families-expansion.title":
    "Personas now fit many more crafts",
  "changelog.entries.persona-families-expansion.body":
    "Six new page styles: a salon chair, a runway, a movement poster, plus dozens of new professions, each with a look built for the work you do.",

  "changelog.entries.pole-dancer-persona.title": "Pole dancer personas",
  "changelog.entries.pole-dancer-persona.body":
    "You can build a persona that holds both sides of the craft: the shows you perform and the classes you teach.",

  "changelog.entries.astrologer-persona.title":
    "New astrologer personas, with their own celestial page",
  "changelog.entries.astrologer-persona.body":
    "An astrologer persona gets its own chart page: an indigo, star-flecked ephemeris with your readings numbered like houses, the sky today, and what you need before a reading.",

  "changelog.entries.crisp-profile-photos.title":
    "Profile photos are sharper on member pages",
  "changelog.entries.crisp-profile-photos.body":
    "The large portrait on a member page now requests a resolution that matches the space it fills, so it comes through sharp.",

  "changelog.entries.developer-persona-banner.title":
    "Developer personas can show a banner again",
  "changelog.entries.developer-persona-banner.body":
    "Developer, maker and other builder personas were quietly hiding the banner you uploaded. Your cover now shows across the top, and with no cover the page stays clean.",

  "changelog.entries.persona-preview-edit-hidden.title":
    "Previewing your profile as a visitor now hides your Edit controls",
  "changelog.entries.persona-preview-edit-hidden.body":
    "The Edit button on your personas is now hidden while you preview your profile as a visitor, so the preview matches what other people see.",

  "changelog.entries.persona-solo-card-wide.title":
    "A single persona with a cover now fills the space",
  "changelog.entries.persona-solo-card-wide.body":
    "If your profile has one persona and it has a cover photo, its card now lays out wide, cover beside the details. Sparser personas keep the compact card.",

  "changelog.entries.persona-performance-row-mobile.title":
    "Persona performance lists now read cleanly on phones",
  "changelog.entries.persona-performance-row-mobile.body":
    "On a narrow screen the year, title and venue of a performance each take their own line, so titles stop breaking one letter per line.",

  "changelog.entries.endorse-persona-by-owner-name.title":
    "Endorsing an unnamed persona now uses your name",
  "changelog.entries.endorse-persona-by-owner-name.body":
    "When a persona is named only after its craft, the endorse dialog now uses the person's first name, so the words read like they are about a human.",

  "changelog.entries.landing-featured-member-card.title":
    "A richer featured-member card on the homepage",
  "changelog.entries.landing-featured-member-card.body":
    "Featured members on the homepage now appear in the full spotlight card: a large portrait, their own words, and a link to their profile, rotating through everyone we have highlighted.",

  "changelog.entries.session-expiry-csrf-fix.title":
    "Fewer surprise “session expired” sign-outs",
  "changelog.entries.session-expiry-csrf-fix.body":
    "A bug could sign you out with “session expired” while your session was fine, most often with the app open in several tabs. Your session now recovers quietly on its own.",

  "changelog.entries.persona-image-remove-confirm.title":
    "A quick check before you remove a persona photo",
  "changelog.entries.persona-image-remove-confirm.body":
    "Removing an avatar, cover or item image now asks you to confirm first, so an accidental tap on the trash icon will not wipe a photo you meant to keep.",

  "changelog.entries.persona-craft-pass.title":
    "Personas look and feel better everywhere",
  "changelog.entries.persona-craft-pass.body":
    "Dark mode stays crisp across skins and menus, the persona directory goes past 40 people and opens faster, and you can preview a persona while editing.",

  "changelog.entries.persona-audit-hardening.title":
    "Personas: a polish and safety pass",
  "changelog.entries.persona-audit-hardening.body":
    "The persona editor warns you before the back button loses unsaved edits, and only the creator can rename, unpublish or delete a shared persona.",

  "changelog.entries.persona-followers-owner-view.title":
    "See who follows your persona",
  "changelog.entries.persona-followers-owner-view.body":
    "If a persona is yours, you can now open its followers and see who is quietly keeping up with your work. For everyone else, following stays private.",

  "changelog.entries.persona-image-reuse-uploads.title":
    "Reuse a photo you've already uploaded",
  "changelog.entries.persona-image-reuse-uploads.body":
    "Every image slot in the persona editor now offers photos you uploaded before alongside a new file, so you can reuse the same shot across personas in a couple of taps.",

  "changelog.entries.persona-banner-quality.title": "Crisper persona banners",
  "changelog.entries.persona-banner-quality.body":
    "Persona banners keep more of their detail now, so a full-width cover stays sharp on larger screens. Re-upload an existing banner to pick up the higher quality.",

  "changelog.entries.modal-close-scroll-jump.title":
    "No more page jump when closing a dialog",
  "changelog.entries.modal-close-scroll-jump.body":
    "Closing a dialog now leaves you exactly where you were on the page, with your scroll position restored instantly.",

  "changelog.entries.persona-gallery-multi-add.title":
    "Add several photos to your gallery at once",
  "changelog.entries.persona-gallery-multi-add.body":
    "Pick a batch of photos from your device or your past uploads and they all go into your persona gallery together, up to the six-photo limit.",

  "changelog.entries.persona-gallery-lightbox.title":
    "Tap a persona photo to see it full-screen",
  "changelog.entries.persona-gallery-lightbox.body":
    "Tap a photo in a persona gallery to open it full-screen and uncropped, with on-screen arrows and arrow keys to move between shots.",

  "changelog.entries.persona-gig-images.title": "Add a photo to your gigs",
  "changelog.entries.persona-gig-images.body":
    "Gig and show items in the persona editor now take an image, so your featured set list has a real photo.",

  "changelog.entries.persona-save-all-changes.title":
    "Save your persona in one go",
  "changelog.entries.persona-save-all-changes.body":
    "The persona editor now saves everything in one go, with a running list of what you changed before you press Save.",

  "changelog.entries.persona-page-motion.title":
    "Persona pages that move with you",
  "changelog.entries.persona-page-motion.body":
    "Persona pages now settle in as you arrive, and each section eases into view as you scroll, with a rhythm that suits each look. Your device's reduced-motion setting is respected.",

  "changelog.entries.endorse-with-note.title": "Endorse a persona with a note",
  "changelog.entries.endorse-with-note.body":
    "Endorsing a persona now opens a window where you can add a short note about what makes the work worth backing. Tap Endorsed later to edit your note or withdraw it.",

  "changelog.entries.persona-banner-bleed.title":
    "Let your persona banner bleed into the page",
  "changelog.entries.persona-banner-bleed.body":
    "Under Presence in your persona settings, the new Banner edge option lets your cover stay contained or bleed, fading gently into the page below. It works with every persona look.",

  "changelog.entries.persona-hero-actions-tidy.title":
    "A tidier action row on persona pages",
  "changelog.entries.persona-hero-actions-tidy.body":
    "Message and Follow now lead the action row on a persona, with Share and Report tucked into an overflow menu. Your follower and endorsement counts sit on one quiet line beneath.",

  "changelog.entries.fix-member-filter-collapse.title":
    "Tidier filters on the member directory",
  "changelog.entries.fix-member-filter-collapse.body":
    "A collapsed filter group on the member directory now shows only its heading, so the filter panel reads as a clean menu.",

  "changelog.entries.fix-persona-hero-theme-colors.title":
    "Persona status and social links now match your theme",
  "changelog.entries.fix-persona-hero-theme-colors.body":
    "On dark persona looks like the stage style, the availability status and social-link icons now follow your persona's colours, so they stay readable and fit the theme.",

  "changelog.entries.persona-photo-gallery.title":
    "Add a photo gallery to your persona",
  "changelog.entries.persona-photo-gallery.body":
    "Your persona can now show a gallery of up to six photos.",

  "changelog.entries.persona-project-links.title":
    "Add links to individual projects",
  "changelog.entries.persona-project-links.body":
    "You can now add a link, such as a GitHub repo, to each individual project on your persona.",

  "changelog.entries.fix-persona-avatar-overlap.title":
    "Persona photos no longer overlap the title",
  "changelog.entries.fix-persona-avatar-overlap.body":
    "On some looks the persona photo could spill out and overlap the name or the buttons beside it. It now sits inside its frame at the right size.",

  "changelog.entries.network-modal-search.title": "Search your network lists",
  "changelog.entries.network-modal-search.body":
    "The Connected and Vouched for lists on your profile now have a search box, so a long list filters down to a name instantly.",

  "changelog.entries.profile-your-network.title":
    "See your network on your own profile",
  "changelog.entries.profile-your-network.body":
    "Your profile hero now shows a private Your network row: your connections, who you vouched for, and who vouched for you. Tap a chip for the full list.",

  "changelog.entries.fix-page-top-nav-overlap.title":
    "Page content no longer hides under the top menu",
  "changelog.entries.fix-page-top-nav-overlap.body":
    "Every page now reserves space for the floating top menu in one shared place, so a heading or button stays clear of it.",

  "changelog.entries.nav-rail-redesign.title": "A clearer main menu",
  "changelog.entries.nav-rail-redesign.body":
    "The desktop menu keeps every section in view: pick one from the rail and its links appear beside it, with a small preview. Same destinations, less hunting.",

  "changelog.entries.persona-photo-enlarge.title":
    "Tap a persona's photo to see it full-size",
  "changelog.entries.persona-photo-enlarge.body":
    "Tap a persona's avatar to open the photo full-screen, just as you can on a regular profile. Tap outside, use the close button, or press Esc to dismiss it.",

  "changelog.entries.persona-mobile-hero.title":
    "Personas look at home on your phone",
  "changelog.entries.persona-mobile-hero.body":
    "On a phone, a persona header now uses the same centred column as your own profile: avatar, name, tagline and links stacked in the middle, with full-width action buttons within thumb reach.",

  "changelog.entries.fix-persona-save-conflict.title":
    "Saving a second persona no longer throws an error",
  "changelog.entries.fix-persona-save-conflict.body":
    "Saving a persona could fail with an address already in use error once you had more than one. A blank handle now counts as none, so your changes save cleanly.",

  "changelog.entries.magazine-desk-two-tracks.title":
    "Two tracks on the magazine desk: Highlights and Issue",
  "changelog.entries.magazine-desk-two-tracks.body":
    "The desk now keeps standalone highlights separate from pieces being assembled into an issue. Switch tracks with a tap and move any piece between them.",

  "changelog.entries.photo-metadata-strip-hardening.title":
    "Stronger removal of hidden location data from your photos",
  "changelog.entries.photo-metadata-strip-hardening.body":
    "Hidden metadata, including GPS location, is stripped from a photo in your browser before it leaves your device. If that cleaning cannot finish, the upload is blocked.",

  "changelog.entries.fix-persona-cover-overlay-leak.title":
    "Persona banners show cleanly once you upload one",
  "changelog.entries.fix-persona-cover-overlay-leak.body":
    "On musician and DJ personas, the textured empty-state overlay kept dimming and speckling your banner after you uploaded one. It now clears the moment a banner image is set.",

  "changelog.entries.members-filter-panel-polish.title":
    "A calmer member-directory filter panel",
  "changelog.entries.members-filter-panel-polish.body":
    "The member-directory filters are now one tidy panel with clean dividers between groups, and every filter header responds to hover and keyboard focus so it is clear you can open it.",

  "changelog.entries.fix-persona-stage-dark-legibility.title":
    "Persona pages stay readable in dark mode",
  "changelog.entries.fix-persona-stage-dark-legibility.body":
    "The stage and writer persona styles turned dark on dark in dark mode. Both stay legible in either theme now.",

  "changelog.entries.fix-persona-preview-avatar.title":
    "Persona photos now appear in the live preview, and the avatar is round again",
  "changelog.entries.fix-persona-preview-avatar.body":
    "A freshly picked avatar or cover now appears in the persona editor preview right away, and the round avatar sits on its own without a stray square around it.",

  "changelog.entries.fix-vouch-success-self-face.title":
    "Your vouch confirmation now shows your real face",
  "changelog.entries.fix-vouch-success-self-face.body":
    "The vouch confirmation could show a demo profile in place of yours. It now always shows your real avatar and initials beside the person you backed.",

  "changelog.entries.persona-readiness-estimate.title":
    "The persona readiness estimate now reflects what's really left",
  "changelog.entries.persona-readiness-estimate.body":
    "A persona's Quick estimate now counts everything still worth adding, such as a cover image or a social link, so it fills only when nothing is left.",

  "changelog.entries.fix-persona-item-drawer-scroll.title":
    "Scroll to every field when editing a showcase item",
  "changelog.entries.fix-persona-item-drawer-scroll.body":
    "The edit panel for a showcase item, like a gig or a project, stays within the screen on phones now, so you can scroll through every field and reach Save.",

  "changelog.entries.my-uploads.title":
    "See and manage everything you've uploaded",
  "changelog.entries.my-uploads.body":
    "A new My uploads screen in Settings lists every picture you have uploaded, so you can delete accidental duplicates. It flags a picture that is still in use.",

  "changelog.entries.profile-photo-picker.title":
    "Reuse a photo you've already uploaded",
  "changelog.entries.profile-photo-picker.body":
    "The new photo picker sets your profile photo from your past uploads, your device, or your Google photo, and lets you tidy up old uploads you no longer need.",

  "changelog.entries.fix-persona-image-persistence.title":
    "Uploaded photos stay put after editing",
  "changelog.entries.fix-persona-image-persistence.body":
    "Saving no longer overwrites an image you did not touch, so persona, profile, work and listing photos stay put instead of reverting to the placeholder.",

  "changelog.entries.dark-ghost-button-contrast.title":
    "Outlined buttons are legible in dark mode",
  "changelog.entries.dark-ghost-button-contrast.body":
    "Outlined secondary buttons, like Share on a persona, were nearly invisible on dark backgrounds. Their outline and label now meet contrast guidelines while staying quieter than the main action.",

  "changelog.entries.admin-media-delete-and-preview-fix.title":
    "Admins can delete stored files, and large previews no longer hide the controls",
  "changelog.entries.admin-media-delete-and-preview-fix.body":
    "Tall image previews in the admin media console are capped, so the file actions stay reachable. Admins can also permanently delete a stored file from its details panel.",

  "changelog.entries.persona-editor-live-preview.title":
    "The persona editor preview updates as you type",
  "changelog.entries.persona-editor-live-preview.body":
    "The preview beside the persona editor updates as you type, covering name, tagline, bio, avatar, cover, accent and call to action, so you see how your persona looks before you save.",

  "changelog.entries.fix-uploaded-avatar-not-showing.title":
    "Uploaded profile photos now show after saving",
  "changelog.entries.fix-uploaded-avatar-not-showing.body":
    "A profile photo you uploaded and saved could come back as a broken image after a reload. Your saved portrait now shows reliably everywhere.",

  "changelog.entries.fix-image-preview-csp.title":
    "Image previews show again when uploading",
  "changelog.entries.fix-image-preview-csp.body":
    "A security policy was blocking the local preview of a photo you had just picked. Your selected photo now shows straight away while it uploads.",

  "changelog.entries.use-google-profile-photo.title":
    "Use your Google photo on your profile",
  "changelog.entries.use-google-profile-photo.body":
    "If you signed in with Google and have no profile photo yet, the profile editor now offers a one-tap Use Google photo button.",

  "changelog.entries.skip-link-keyboard-only.title":
    "“Skip to main content” now stays out of the way",
  "changelog.entries.skip-link-keyboard-only.body":
    "The Skip to main content shortcut sometimes flashed into view during ordinary browsing. It now appears only when you tab to it with the keyboard.",

  "changelog.entries.enlarge-profile-photo.title":
    "Tap a profile photo to see it up close",
  "changelog.entries.enlarge-profile-photo.body":
    "Tap a member's photo on their profile to open the full version in large, so you can see who they are before you reach out. Tap anywhere or press Escape to close.",

  "changelog.entries.tap-notification-to-profile.title":
    "Tap a notification to open the profile",
  "changelog.entries.tap-notification-to-profile.body":
    "When someone accepts your invite or your connection, the whole notification is tappable and opens their profile. More specific notifications still open where they point.",

  "changelog.entries.more-push-notifications.title":
    "More of what matters now reaches you as a push",
  "changelog.entries.more-push-notifications.body":
    "Push now covers connection requests, mentions, replies on your threads, vouches, and changes to an event you are going to, with new switches in settings.",

  "changelog.entries.localized-push-notifications.title":
    "Push notifications in your language",
  "changelog.entries.localized-push-notifications.body":
    "If you have set the app to Portuguese, system push notifications like an event reminder now arrive in Portuguese instead of English.",

  "changelog.entries.magazine-desk-workspace-nav.title":
    "A dedicated workspace for the magazine desk",
  "changelog.entries.magazine-desk-workspace-nav.body":
    "Every editor screen now has its own left-hand navigation with Desk, Pitches and Issue, plus jump-to (Cmd+K) and a Since Friday activity panel.",
  "changelog.entries.richer-push-notifications.title":
    "Push notifications that show who and what",
  "changelog.entries.richer-push-notifications.body":
    "A direct message now shows who it is from, with their photo, and an event reminder shows the event cover. Tap to jump straight in, and messages group by conversation.",

  "changelog.entries.admin-uploaded-images.tag": "Open admin",
  "changelog.entries.admin-uploaded-images.title":
    "Admins can browse every uploaded image",
  "changelog.entries.admin-uploaded-images.body":
    "Admins can now browse every uploaded image on the platform, with per-file details like owner, storage metadata and a real content-type check, for security review.",

  "changelog.entries.events-and-my-events-merged.title":
    "Events and Your events are now one page",
  "changelog.entries.events-and-my-events-merged.body":
    "Your events dashboard and finding new events now live together at /events, with a My events / Discover switch up top. It opens on your dashboard when you have events on.",

  "changelog.entries.trust-network-legend-withdrawn.title":
    "The trust-network legend now explains dashed lines",
  "changelog.entries.trust-network-legend-withdrawn.body":
    "On the Trust Network map, the legend now names the dashed red line as Withdrawn vouch, so you can spot a retracted vouch at a glance.",

  "changelog.entries.trust-network-replay-timeline.title":
    "Trust Network replay now tells the story person by person",
  "changelog.entries.trust-network-replay-timeline.body":
    "Replay now walks the network one connection at a time, in the real order people joined. Each step names who connected and when, and the matching side-list row lights up.",

  "changelog.entries.pronouns-on-member-cards.title":
    "Richer new-member cards in the feed",
  "changelog.entries.pronouns-on-member-cards.body":
    "New-member cards in your feed now show pronouns beside the name, plus where someone is based and what they are into. Location stays hidden for private profiles.",

  "changelog.entries.onboarding-join-and-leave.title":
    "Join (and leave) communities during sign-up",
  "changelog.entries.onboarding-join-and-leave.body":
    "In the sign-up step that suggests communities, tap a joined one again to leave it. Suggestions now cover only fully open communities you can join in one tap.",

  "changelog.entries.saved-and-searched-lists-load.title":
    "Saved events and searched lists load again instead of erroring",
  "changelog.entries.saved-and-searched-lists-load.body":
    "Your Saved events tab, message search, filtering the magazine by one author and searching the moderation queue all load their results again instead of erroring.",

  "changelog.entries.admin-overview-stat-grid-responsive.title":
    "The admin dashboard stat cards fit the screen on mobile",
  "changelog.entries.admin-overview-stat-grid-responsive.body":
    "The four headline stat cards on the admin dashboard now wrap down to two, then one, as the screen narrows, so each card stays readable on a phone.",

  "changelog.entries.trust-network-mobile-graph-first.title":
    "The Trust Network opens on the graph on mobile",
  "changelog.entries.trust-network-mobile-graph-first.body":
    "On a phone, a member's Trust Network opens straight on the connection graph. Tap anyone to slide up their vouch details, then swipe away for the full picture.",

  "changelog.entries.magazine-article-versions.title":
    "Article drafts now keep a full version history",
  "changelog.entries.magazine-article-versions.body":
    "Every filed draft and manual save now keeps a version. Editors can compare it against the current draft and restore any earlier one.",

  "changelog.entries.magazine-article-comments.title":
    "Threaded notes on article drafts",
  "changelog.entries.magazine-article-comments.body":
    "Editors can leave threaded notes on an article, reply to each other, and resolve a note once it is handled.",

  "changelog.entries.magazine-desk-live-notifications.title":
    "The magazine desk's activity panel now shows real editorial events",
  "changelog.entries.magazine-desk-live-notifications.body":
    "The desk's activity panel now shows real editorial events, who did what and when, each linking straight to the piece.",

  "changelog.entries.magazine-desk-wave-b-fixes.title":
    "Archive search, contents blurbs, and kill-fee terms, now real",
  "changelog.entries.magazine-desk-wave-b-fixes.body":
    "Archive search now finds published pieces live. Issue contents blurbs and the run-in-letters choice save properly, and contributors see the real kill-fee terms on each commission.",

  "changelog.entries.magazine-commission-editor-fix.title":
    "Commissioning a piece works on a brand-new magazine",
  "changelog.entries.magazine-commission-editor-fix.body":
    "Commissioning a piece on a fresh magazine could fail with an editorId error. Commissions now carry your own signed-in editor identity, so they go through straight away.",

  "changelog.entries.magazine-issue-production.title": "Issue production",
  "changelog.entries.magazine-issue-production.body":
    "Arrange the running order, set the cover and coverlines, curate the members' digest and social cards, then ship the whole issue at once with a pre-ship checklist.",

  "changelog.entries.events-page-utility-redesign.title":
    "A cleaner, faster events page",
  "changelog.entries.events-page-utility-redesign.body":
    "Events now leads with a compact header carrying the My events / Discover switch and one place to host, a small Next up highlight, and search in Browse.",

  "changelog.entries.magazine-writer-workspace.title": "The writer workspace",
  "changelog.entries.magazine-writer-workspace.body":
    "Writers now have one place for their own assignments, pitches and payments, where they choose their byline and file drafts.",

  "changelog.entries.persona-discovery-nudges.title":
    "Personas, easier to discover",
  "changelog.entries.persona-discovery-nudges.body":
    "Quiet, dismissible suggestions to make a persona of your own now appear on your profile, at the foot of the persona directory, and during sign-up.",

  "changelog.entries.magazine-deck-editor-redesign.title":
    "The slide-deck editor, redesigned",
  "changelog.entries.magazine-deck-editor-redesign.body":
    "The slide-deck editor now matches the magazine desk, with a live preview of exactly what readers see, per-slide character budgets and a pre-publish checklist.",

  "changelog.entries.magazine-desk-redesign.title":
    "The magazine editor desk, redesigned",
  "changelog.entries.magazine-desk-redesign.body":
    "The desk is now a live editorial dashboard with pipeline, board and issue-plan views, a pitch inbox, saved views, a command palette (Cmd+K) and keyboard shortcuts.",

  "changelog.entries.persona-directory-redesign.title":
    "The persona directory, redesigned",
  "changelog.entries.persona-directory-redesign.body":
    "Personas are now grouped into six craft families: Stage, Studio, Page, Workshop, Practice and Table. Cards show tags and a follower count at a glance.",

  "changelog.entries.persona-editor-redesign.title":
    "A redesigned editor for your personas",
  "changelog.entries.persona-editor-redesign.body":
    "Editing a persona now has its own space: a section rail on the left, a live preview beside your edits, and richer fields for gigs and projects.",

  "changelog.entries.magazine-article-editor.title":
    "The block-based article editor, live",
  "changelog.entries.magazine-article-editor.body":
    "Write in paragraphs, headings, pull quotes, images, Q&As and stat rows, with a slash menu, inline emphasis, live word and read-time counts, and a pre-publish checklist.",

  "changelog.entries.magazine-piece-record.title":
    "The full piece record, opened",
  "changelog.entries.magazine-piece-record.body":
    "Each piece now has a full record covering brief, care and consent, money, history and reader letters, with a publish gate that holds it until consent and the sensitivity read are settled.",

  "changelog.entries.persona-dashboard-redesign.title":
    "Your personas, in one redesigned dashboard",
  "changelog.entries.persona-dashboard-redesign.body":
    "Each persona card now shows a readiness ring or a live status pill, its availability and its co-owners. Starting a new one is a guided two-step flow.",

  "changelog.entries.persona-pages-redesigned.title":
    "Persona pages, redesigned for every craft",
  "changelog.entries.persona-pages-redesigned.body":
    "Every persona page is now built for its craft: a stage marquee with booking details, a studio wall with a lightbox, a workshop sheet or a menu card.",

  "changelog.entries.persona-page-unavailable-reasons.title":
    "Persona pages now tell you why they're unavailable",
  "changelog.entries.persona-page-unavailable-reasons.body":
    "A persona page now tells you when it is private, members-only or removed. Your own unpublished page shows you a preview with a publish-readiness banner.",

  "changelog.entries.meet-the-table.title": "See who's at the table",
  "changelog.entries.meet-the-table.body":
    "Supper club pages now show a top-down view of the table: who is hosting, who is coming and which seats are open. Tap someone to read a little about them.",

  "changelog.entries.settings-mobile-nav-strips.title":
    "Easier settings and profile editing on your phone",
  "changelog.entries.settings-mobile-nav-strips.body":
    "On a phone, Settings and Edit profile now carry a compact tab strip pinned to the top as you scroll, so you can jump straight to a section.",

  "changelog.entries.places-card-mobile-foot.title":
    "Tidier “Places you run” cards on mobile",
  "changelog.entries.places-card-mobile-foot.body":
    "On a phone, your directory-listing cards now put the reference number on its own row above a clean row of Edit, Delete and View listing.",

  "changelog.entries.vouch-for-a-safe-space.title": "Vouch for a safe space",
  "changelog.entries.vouch-for-a-safe-space.body":
    "If a venue has been good to you, add your own vouch to its safe-space page, with an optional note and how you know the place, or anonymously.",

  "changelog.entries.my-events-change-list-live.title":
    "See what's changed in My Events",
  "changelog.entries.my-events-change-list-live.body":
    "The bell on My Events now opens a running list of updates to events you have RSVP'd to or been invited to, each marked unread.",

  "changelog.entries.applications-inside-work-hub.title":
    "Applications moved into your Work hub",
  "changelog.entries.applications-inside-work-hub.body":
    "Applications now sit at the top of your Work hub, alongside mentorship and skills. Open Work from the profile menu to find them.",

  "changelog.entries.invite-only-community-tier.title":
    "Invite-only communities are gated again",
  "changelog.entries.invite-only-community-tier.body":
    "Communities set to invite-only or request-to-join now show their real join policy on directory cards, the community page and the join sheet, so they ask for an invite.",

  "changelog.entries.navbar-wordmark-no-wrap.title":
    "The QueerPulse logo no longer stacks up",
  "changelog.entries.navbar-wordmark-no-wrap.body":
    "The QueerPulse wordmark in the top bar now stays on a single line at every screen width.",

  "changelog.entries.mobile-edit-profile-refresh.title":
    "Editing your profile matches the new look",
  "changelog.entries.mobile-edit-profile-refresh.body":
    "On a phone, editing your profile now uses the same centered layout as your profile, with a round photo up top, tidier fields, and Status and Visibility on one line.",

  "changelog.entries.mobile-profile-header-refresh.title":
    "A cleaner profile on your phone",
  "changelog.entries.mobile-profile-header-refresh.body":
    "Member profiles now lead with a centered photo and name, a roomier stats row and tidier buttons, so saying hello and vouching feel clearer on mobile.",

  "changelog.entries.profile-edit-save-bar-mobile.title":
    "Saving your profile on a phone just works",
  "changelog.entries.profile-edit-save-bar-mobile.body":
    "The Save and Discard buttons now sit cleanly above the bottom navigation while you edit your profile on a phone, and share the full width on narrow screens.",

  "changelog.entries.follow-topics-you-care-about.title":
    "Follow the topics you care about",
  "changelog.entries.follow-topics-you-care-about.body":
    "Tap Follow on any topic to keep it close. Your follows are saved to your account, so they travel with you across devices.",

  "changelog.entries.event-change-alerts.title": "Know when an event changes",
  "changelog.entries.event-change-alerts.body":
    "If an event you have RSVP'd to or been invited to moves its time or place, you now get a notification.",

  "changelog.entries.forms-that-really-submit.title":
    "Forms across the app now really submit",
  // Body corrected on 26 Aug 2026: "send" read as email. They store; the team
  // picks the submissions up in the app.
  "changelog.entries.forms-that-really-submit.body":
    "Newsletter signup, contact enquiries, grant and panel applications, and safe-space nominations now store what you write, for the team to pick up in the app. QueerPulse sends no email.",

  "changelog.entries.save-events-for-later.title": "Save events for later",
  "changelog.entries.save-events-for-later.body":
    "Tap Save on any gathering to bookmark it for later. Everything you save shows up under the Saved tab in My Events.",

  "changelog.entries.collections-are-here.title":
    "Group your saves into collections",
  "changelog.entries.collections-are-here.body":
    "Gather the people, places and posts you have saved into your own named collections, like a reading list or a shortlist of spaces. Make as many as you like.",

  "changelog.entries.your-mentions-in-one-place.title":
    "Every mention, in one place",
  "changelog.entries.your-mentions-in-one-place.body":
    "When someone @-mentions you in a forum thread or a community post, it now lands in your Mentions inbox so you can catch up in one place.",

  "changelog.entries.new-moderation-tools.title":
    "More tools for the moderation team",
  "changelog.entries.new-moderation-tools.body":
    "The team gained real controls to verify or restrict a member, add and remove community moderators, act on reading-group proposals, and publish or export governance records.",

  "changelog.entries.reports-reach-the-team.title":
    "Reports now reach the moderation team",
  "changelog.entries.reports-reach-the-team.body":
    "Reporting a forum post now reaches the moderators reliably, and a failed send shows a clear error with a way to try again. You can also report any individual reply.",

  "changelog.entries.chat-recovers-after-reconnect.title":
    "Chat catches up when you're back online",
  "changelog.entries.chat-recovers-after-reconnect.body":
    "A message that fails while you are offline sends itself as soon as you reconnect. A small banner tells you when you are offline or reconnecting.",

  "changelog.entries.honest-live-states.title": "What you see is real",
  "changelog.entries.honest-live-states.body":
    "Pages now show only real people and content. Sample press clippings, voices and inventory are gone, and controls that are still being wired up are clearly marked.",

  "changelog.entries.community-activity-in-your-feed.title":
    "Your feed now shows what's happening in your communities",
  "changelog.entries.community-activity-in-your-feed.body":
    "Your home feed now pulls in real activity from your communities: posts, announcements, new gatherings, forum threads and new members. You can also share a gathering or thread straight to a community.",

  "changelog.entries.assignable-staff-roles.title":
    "Admins can now assign magazine staff roles",
  "changelog.entries.assignable-staff-roles.body":
    "From the member directory, admins can grant two roles beyond a member's account level: Magazine Editor and Magazine Writer. The editorial desk now follows the Editor role.",
  "changelog.entries.assignable-staff-roles.tag": "Open the member directory",

  "changelog.entries.feed-scroll-no-longer-sticks.title":
    "Your feed scrolls smoothly again",
  "changelog.entries.feed-scroll-no-longer-sticks.body":
    "Scrolling with a mouse or trackpad over the home feed, notifications, members and gatherings could stick in place. It now scrolls the page the way it should, everywhere.",

  "changelog.entries.fresh-feed-card-layout.title":
    "A fresh look for your feed",
  "changelog.entries.fresh-feed-card-layout.body":
    "Every card in your home feed shares one cleaner layout, and cards sit two to a row on wider screens so you can browse more at a glance.",

  "changelog.entries.feature-communities-cta-jump.title":
    "“Choose communities” now takes you straight to the picker",
  "changelog.entries.feature-communities-cta-jump.body":
    "The Communities block's “Choose communities” button now opens Edit profile scrolled straight to the communities picker.",
  "changelog.entries.feature-communities-cta-jump.tag": "Choose communities",

  "changelog.entries.live-homepage-curated-sections.title":
    "The homepage now shows real, admin-curated people and communities",
  "changelog.entries.live-homepage-curated-sections.body":
    "The member, community and changemaker sections on the public homepage now show real people and communities the team has curated. A section stays hidden until something is chosen for it.",

  "changelog.entries.featured-homepage-consent-toggle.title":
    "Opt in to being featured on the homepage",
  "changelog.entries.featured-homepage-consent-toggle.body":
    'Privacy settings has a new toggle letting admins feature you on the curated homepage. It is off by default and needs your profile set to "Open to connect".',
  "changelog.entries.featured-homepage-consent-toggle.tag":
    "Open your privacy settings",

  "changelog.entries.mobile-profile-top-breathing-room.title":
    "A calmer top on mobile profiles",
  "changelog.entries.mobile-profile-top-breathing-room.body":
    "Profile pages on phones have more room at the top, so your avatar and details sit clear of the header. The “Queer Pulse” wordmark has left the top strip on inner pages.",

  "changelog.entries.accessible-names-screen-readers.title":
    "Screen readers now name every control",
  "changelog.entries.accessible-names-screen-readers.body":
    "Icon-only buttons and switches across the app now announce a clear name to screen readers, so nothing reads as an unlabelled “button”. An automatic check keeps it that way.",

  "changelog.entries.icons-not-text-symbols.title":
    "Crisper icons in place of text symbols",
  "changelog.entries.icons-not-text-symbols.body":
    "Arrows, dropdown carets, drag handles and clock marks are now drawn as proper icons. They stay sharp on every device and font, and read correctly to screen readers.",

  "changelog.entries.message-alerts-out-of-notifications.title":
    "New-message alerts moved out of the notifications centre",
  "changelog.entries.message-alerts-out-of-notifications.body":
    'Your Notifications tab no longer fills with "You have a new message" rows. New direct messages show in the unread count on the message icon.',

  "changelog.entries.shared-ui-consistency.title":
    "Smoother, more consistent dialogs and forms",
  "changelog.entries.shared-ui-consistency.body":
    "Dozens of pop-ups, confirmations, pickers and forms now share one set of building blocks. Every dialog traps keyboard focus, closes on Escape in the right order, and returns you where you were.",

  "changelog.entries.balanced-feed-grid.title": "A more balanced home feed",
  "changelog.entries.balanced-feed-grid.body":
    "Your home feed now lays cards out as a grid: light cards like new members sit two or more to a row, while posts keep the full width.",

  "changelog.entries.moderation-outcome-notifications.title":
    "You'll now hear the outcome of a moderation decision",
  "changelog.entries.moderation-outcome-notifications.body":
    "When the moderation team warns, suspends or closes an account, the member now gets a notification with the reason and a link to appeal.",

  "changelog.entries.community-page-polish.title":
    "A friendlier community page",
  "changelog.entries.community-page-polish.body":
    "On a community page you can now share it, leaving asks you to confirm, the Events tab lists every upcoming gathering, and switching tabs updates the link.",

  "changelog.entries.job-application-status.title":
    "See where your job applications stand",
  "changelog.entries.job-application-status.body":
    "The tracker now shows your real applications: what you applied to, when, and where each one stands. Open a card to revisit the answers you sent.",

  "changelog.entries.data-request-history.title":
    "Your data-request history, in one place",
  "changelog.entries.data-request-history.body":
    "The privacy page now lists your past data requests with their reference and current status, so you can follow one up.",

  "changelog.entries.community-settings-controls.title":
    "Save, archive, or hand over your community",
  "changelog.entries.community-settings-controls.body":
    "If you run a community, the moderation panel's settings now save for real: name, description and house rules. You can also archive a community or transfer ownership to another member.",

  "changelog.entries.feed-keeps-loading.title":
    "The feed keeps loading as you scroll",
  "changelog.entries.feed-keeps-loading.body":
    "The community feed used to stop after the first page. It now loads more as you reach the end, and there is a keyboard-friendly “Load more” button too.",

  "changelog.entries.faster-first-load.title": "A faster first load",
  "changelog.entries.faster-first-load.body":
    "Interface wording now loads per screen as each one needs it, so the app opens noticeably quicker on a phone or a slower connection.",

  "changelog.entries.readable-text-contrast.title":
    "Easier-to-read text across the app",
  "changelog.entries.readable-text-contrast.body":
    "Faint captions, hints and labels in collections, the GIF picker and profile cards now meet accessible contrast, in both light and dark mode.",

  "changelog.entries.ios-splash-screens.title":
    "A polished launch screen on iPhone",
  "changelog.entries.ios-splash-screens.body":
    "Opening QueerPulse from your iPhone home screen now shows a branded launch screen while it starts up. Android notifications get a cleaner badge.",

  "changelog.entries.removed-content-stays-hidden.title":
    "Removed content stays hidden everywhere",
  "changelog.entries.removed-content-stays-hidden.body":
    "Content a moderator takes down now disappears everywhere it could show, including direct messages, business and housing listings, and personas. Removed messages stop counting toward your unread badges.",

  "changelog.entries.help-demo-example-live-hidden.title":
    "Help panels no longer show demo examples in live mode",
  "changelog.entries.help-demo-example-live-hidden.body":
    "The “In the demo” example at the end of “About this screen” help now appears only while you are exploring the demo.",

  "changelog.entries.smaller-help-icon.title":
    "A smaller “About this screen” help icon",
  "changelog.entries.smaller-help-icon.body":
    "The help icon beside a page title used to grow with the heading. It is now a discreet, consistent size on every screen.",

  "changelog.entries.community-rules-and-tags-polish.title":
    "Clearer house rules and tags in community details",
  "changelog.entries.community-rules-and-tags-polish.body":
    "A community's house rules now show their proper wording in place of an internal code, and the tags on the About page stay legible in dark mode.",

  "changelog.entries.co-owned-subprofiles.title":
    "Co-own a persona with someone else",
  "changelog.entries.co-owned-subprofiles.body":
    "You can invite another member to co-own a subprofile. Once they accept, you both manage it fully and it shows on both profiles.",

  "changelog.entries.smoother-mobile-navigation.title":
    "A smoother way to move around on your phone",
  "changelog.entries.smoother-mobile-navigation.body":
    "The bottom tab bar stays with you in the browser, each tab remembers where you left it, and tapping the current tab carries you to the top.",

  "changelog.entries.no-sideways-scroll-on-mobile.title":
    "Pages scroll top-to-bottom on your phone again",
  "changelog.entries.no-sideways-scroll-on-mobile.body":
    "Pages no longer drift sideways on a phone. Long links, handles and words wrap onto the next line, and the page is held to your screen's width.",

  "changelog.entries.no-placeholder-people-in-live.title":
    "Live mode now shows only real people",
  "changelog.entries.no-placeholder-people-in-live.body":
    'Demo people are gone from live mode: the wellbeing directory, prefilled job applications and magazine bylines. You now see real content, or a "still being built" note.',

  "changelog.entries.honest-roadmap-promises.title":
    "The roadmap now keeps its promises, and says no, honestly",
  "changelog.entries.honest-roadmap-promises.body":
    'A Committed badge on the roadmap is a real promise: if its date moves, you see the published reason. A new "Not building this, and why" list covers turned-down requests.',

  "changelog.entries.invite-resend-and-qr.title":
    "Resend an invite that ran out, and share it with a QR code",
  "changelog.entries.invite-resend-and-qr.body":
    'Open your sent invites and tap "Send again" on an expired one to revive the same link for another week. Every invite now comes with a QR code.',
  "changelog.entries.invite-resend-and-qr.tag": "Invite someone",

  "changelog.entries.smoother-onboarding-first-minutes.title":
    "A gentler welcome for your first few minutes",
  "changelog.entries.smoother-onboarding-first-minutes.body":
    'If you step away partway through setting up, you pick up where you left off. The "here for" tags you choose show on your profile from the start.',

  "changelog.entries.events-open-at-top.title": "Events opens at the top",
  "changelog.entries.events-open-at-top.body":
    "Opening Events, or any tab, now starts you at the top of the page. Your browser's Back button still returns you to exactly where you were.",
  "changelog.entries.events-open-at-top.tag": "Browse events",

  "changelog.entries.chat-header-tap-to-profile.title": "A calmer chat header",
  "changelog.entries.chat-header-tap-to-profile.body":
    "Tap the person's name or photo at the top of a conversation to open their profile. The info and starred-messages controls now sit together in the corner.",
  "changelog.entries.chat-header-tap-to-profile.tag": "Open messages",

  "changelog.entries.sheet-close-scroll-jump-fix.title":
    "No more jumping back to the top",
  "changelog.entries.sheet-close-scroll-jump-fix.body":
    "Closing your account sheet partway down a page used to snap you back to the top. The page now stays exactly where you left it.",

  "changelog.entries.mobile-account-you-tab.title":
    "Your account, one tap away on mobile",
  "changelog.entries.mobile-account-you-tab.body":
    "Tapping your photo in the bottom bar opens one sheet with your profile, connections, saved places, applications and settings. Messages moved up beside notifications.",

  "changelog.entries.instagram-style-mobile-profile.title":
    "Your profile, redesigned for your phone",
  "changelog.entries.instagram-style-mobile-profile.body":
    "On a phone your profile now opens with a compact avatar, a stat row of vouches, communities and personas, a highlights strip, and swipeable tabbed sections.",

  "changelog.entries.forum-upvotes-tags-search.title":
    "The forum grew up, upvotes, tags, search and lockable threads",
  "changelog.entries.forum-upvotes-tags-search.body":
    "The forum now has working upvotes on threads and replies, Active and Unanswered sorting, tappable tags like #housing, a search box, and moderators can close a thread.",
  "changelog.entries.forum-upvotes-tags-search.tag": "Open the forum",
  "changelog.entries.list-business-wizard-overhaul.title":
    "Adding your space to the directory just got a lot easier",
  "changelog.entries.list-business-wizard-overhaul.body":
    "Recommending a place now asks only for a name, where it is and a line about why. Type the address or drop a pin on the map.",
  "changelog.entries.list-business-wizard-overhaul.tag": "List your space",
  "changelog.entries.mobile-experience-pass.title":
    "The whole app, tuned for your thumb",
  "changelog.entries.mobile-experience-pass.body":
    "Buttons, chips and switches are bigger and easier to hit, and menus, filters and dialogs now rise from the bottom as sheets you can flick away.",

  "changelog.entries.magazine-deck-authoring.title":
    "Editors can now build their own interactive decks",
  "changelog.entries.magazine-deck-authoring.body":
    "Editors can now build interactive slide decks in the dashboard: five slide layouts, byline and metadata, a reader preview, saved drafts, and publishing with the “Interactive” tag on the magazine's front page.",

  "changelog.entries.listings-moderation-console.title":
    "The listings queue is now a real moderation console",
  "changelog.entries.listings-moderation-console.body":
    "The listings queue now has pagination, search by name, submitter or reference, and sorting, with a live count per status. Moderators can act on several submissions at once.",

  "changelog.entries.magazine-slide-decks.title":
    "Interactive slide-deck stories, now in the magazine",
  "changelog.entries.magazine-slide-decks.body":
    'Some magazine stories can now be read as full-screen slides you tap through, mixing text, photos, animated numbers and before-and-after sliders. Look for the "Interactive" tag.',

  "changelog.entries.real-notification-settings.title":
    "Notification settings that actually do something",
  "changelog.entries.real-notification-settings.body":
    "The toggles in Settings, Notifications now work: turn each type of alert on or off, phone push included. Safety and account messages always come through.",
  "changelog.entries.platform-wide-search.title":
    "Search now covers the whole platform",
  "changelog.entries.platform-wide-search.body":
    "Global search now spans magazine articles, jobs, housing listings, resources, workshops and subprofiles, alongside members, communities, events, forum threads and businesses, in both English and Portuguese.",
  "changelog.entries.save-events-communities.title":
    "Save events and communities, and saves that really stick",
  "changelog.entries.save-events-communities.body":
    "You can now save a gathering or a community to your collection, with the same bookmark you use elsewhere. Save on job details and short films now sticks.",
  "changelog.entries.invite-revoke-oversight.title":
    "Take back an invite you've sent",
  "changelog.entries.invite-revoke-oversight.body":
    "You can now revoke a pending invite from your sent list, and the link stops working right away. Admins get a platform-wide Invites view with filters by status.",
  "changelog.entries.moderation-completeness.title":
    "A more complete moderation toolkit",
  "changelog.entries.moderation-completeness.body":
    "Moderators can now take down a member's profile or a single business review, and a removed review stops counting toward the place's rating. They can also lift a suspension directly.",
  "changelog.entries.account-media-safety.title":
    "Safer handles, cleaner storage",
  "changelog.entries.account-media-safety.body":
    "Change your username and the old handle is held for 30 days. Photos you replace are deleted from storage, and a suspended member's images stop being served.",
  "changelog.entries.legal-notice-imprint.title":
    "A legal notice (imprint) page",
  "changelog.entries.legal-notice-imprint.body":
    "A Legal Notice page now sits under Policies, linked from the footer, setting out who operates QueerPulse and how to reach us.",
  "changelog.entries.messages-list-virtualization.title":
    "Long chats now scroll smoothly, however big they get",
  "changelog.entries.messages-list-virtualization.body":
    "Long conversations now render only the messages near your screen, so a thread with thousands of messages scrolls as lightly as a brand-new one.",
  "changelog.entries.live-mode-honesty-sweep.title":
    "No more placeholder people, fake confirmations or dead-end buttons",
  "changelog.entries.live-mode-honesty-sweep.body":
    "Prototype pages now show a clear coming soon in place of invented members, events or providers, and forms with no home yet say so. Cookie choices stick.",
  "changelog.entries.frontend-reliability-hardening.title":
    "Fewer lost drafts, honest error states and safer shared devices",
  "changelog.entries.frontend-reliability-hardening.body":
    "Leaving a half-finished gathering, community or profile edit now warns you first, errors come with a retry, and your saved items and drafts clear when you sign out.",
  "changelog.entries.screen-help-signs.title":
    "“About this screen” help on every feature",
  "changelog.entries.screen-help-signs.body":
    "Look for the small info button beside a screen's title. It opens a short card explaining what the screen is for and how to use it.",
  "changelog.entries.performance-cost-hardening.title":
    "Faster search, lighter uploads and steadier busy pages",
  "changelog.entries.performance-cost-hardening.body":
    "Global search now uses proper text indexes, photos are resized before they leave your device, and busy lists load in pages with a load more button.",
  "changelog.entries.accessibility-i18n-pwa-hardening.title":
    "Accessibility, translation and offline polish",
  "changelog.entries.accessibility-i18n-pwa-hardening.body":
    "Every form field now announces its label to screen readers, shared links show a preview image, and losing your connection gives you a real offline page.",
  "changelog.entries.launch-hardening-p1.title":
    "Safety, honesty and reliability hardening",
  "changelog.entries.launch-hardening-p1.body":
    "Blocking someone now stops messages, presence, typing and push everywhere, and hides your profile from them. Editing, cancelling or RSVPing to a gathering refreshes the screen right away.",
  "changelog.entries.remove-listings-from-moderation.title":
    "Moderators can remove directory listings",
  "changelog.entries.remove-listings-from-moderation.body":
    "The listings review queue now has a Remove action: a moderator can permanently delete a spam or duplicate submission and take a live listing off the public directory.",

  "changelog.entries.sent-invites-status-filter.title":
    "Filter the invites you've sent by status",
  "changelog.entries.sent-invites-status-filter.body":
    "Your sent invites now have All, Pending, Accepted and Expired tabs with a count each, and every invite shows the exact day and time it was sent and when it expires.",

  "changelog.entries.onboarding-one-time-guard.title":
    "Finishing onboarding now sticks",
  "changelog.entries.onboarding-one-time-guard.body":
    "We now record when you finish the welcome flow and send you straight to your feed if you land back on it, so it can't overwrite your choices.",

  "changelog.entries.trust-network-replay-by-joins.title":
    "Trust-network replay now follows the people, connection by connection",
  "changelog.entries.trust-network-replay-by-joins.body":
    "In the admin trust network, Replay now steps through the moments people were vouched for, giving each equal time, so it tracks how the community grew.",
  "changelog.entries.trust-network-invite-vs-vouch.title":
    "See who was invited vs vouched for",
  "changelog.entries.trust-network-invite-vs-vouch.body":
    "The admin trust network now draws invite connections in their own colour, separate from vouches added later, with a legend and hover labels.",
  "changelog.entries.chef-mixologist-therapist-personas.title":
    "Three new persona types: chef, mixologist and therapist",
  "changelog.entries.chef-mixologist-therapist-personas.body":
    "You can now build a subprofile as a chef (menus and residencies), a mixologist (cocktails and residencies) or a therapist (specialisms and credentials), each with its own starter template and directory filter.",
  "changelog.entries.connections-card-polish.title": "Tidier connection cards",
  "changelog.entries.connections-card-polish.body":
    "On your connections page the mutuals line now renders properly, and the Connected date shows the day and time down to the minute.",
  "changelog.entries.lightbox-focus-a11y.title":
    "Cleaner focus handling in the photo viewer",
  "changelog.entries.lightbox-focus-a11y.body":
    "Opening a photo full screen no longer leaves keyboard focus stranded on the invisible close layer behind the image, so screen readers and keyboard navigation keep working while you flip through.",
  "changelog.entries.directory-detail-polish.title":
    "A redesigned, more accurate place page",
  "changelog.entries.directory-detail-polish.body":
    "Place pages have a clearer layout: key details in one row, a compact gallery, and the main actions beside the name. Open now uses the venue's own clock.",
  "changelog.entries.review-author-avatars.title": "See who left a review",
  "changelog.entries.review-author-avatars.body":
    "Reviews on a place's page now show the reviewer's photo, and their name links straight to their profile. Reviews from non-members read the same, without the link.",
  "changelog.entries.verification-in-context.title":
    "How verification works now lives where you're browsing",
  "changelog.entries.verification-in-context.body":
    "How verification works now sits on the local directory itself: a short explainer (nominated, reviewed, re-checked every year) plus a quiet line in each verified listing pointing to the full criteria.",
  "changelog.entries.directory-collapsible-filters.title":
    "Tidier filters on the spaces directory",
  "changelog.entries.directory-collapsible-filters.body":
    "The safe-spaces and vibe refinements now tuck behind a single Refine toggle with a count of active filters, and the drawer remembers whether you left it open.",
  "changelog.entries.safe-spaces-in-directory.title":
    "Verified safe spaces now live in the directory",
  "changelog.entries.safe-spaces-in-directory.body":
    "The verified badge now shows on directory cards, a Verified safe spaces filter narrows the list, and verified places rank first. /local/safe-spaces explains what the badge means.",

  "changelog.entries.magazine-desk-polish-sweep.title":
    "Polish across the magazine desk",
  "changelog.entries.magazine-desk-polish-sweep.body":
    "Heading colours are consistent in dark mode, you can edit a linked deck from the desk, and writers get byline control per assignment.",

  "changelog.entries.magazine-piece-messaging.title":
    "Editors and writers can now message each other on the piece",
  "changelog.entries.magazine-piece-messaging.body":
    "Editors and writers can message each other on the piece itself, so questions and chases sit beside the work and both sides see the whole thread.",

  "changelog.entries.live-press-kit-real-data.title":
    "The press kit now shows real coverage, contacts and figures",
  "changelog.entries.live-press-kit-real-data.body":
    "Coverage and press-desk contacts now come from what the team actually publishes, and the headline figures are drawn from the platform. Each section stays hidden until there is something real to show.",
  "changelog.entries.communities-and-home-merged.title":
    "Communities, all in one place",
  "changelog.entries.communities-and-home-merged.body":
    "Your hub and the discovery directory now share one /communities page with a My communities / Discover switch. It opens on your hub when you belong somewhere, and on Discover otherwise.",

  "changelog.entries.silent-session-recovery.title":
    "No more “session expired” flash when you come back",
  "changelog.entries.silent-session-recovery.body":
    "When your session can be restored, we now do it silently and you pick up where you left off. You are told only when you must sign in.",

  "changelog.entries.session-refresh-csrf-race.title":
    "Smoother session refresh after a token expires",
  "changelog.entries.session-refresh-csrf-race.body":
    "We fixed a race in how the app renews your session, so it renews cleanly on the first try, with no session expired flicker and no wasted request.",

  "changelog.entries.directory-category-unify.title":
    "Directory categories that match everywhere",
  "changelog.entries.directory-category-unify.body":
    "A place you add now shows the right coloured pin on the map and the same category on its card and filter. Nightlife is a category you can pick when listing, too.",

  "changelog.entries.messages-badge-count.title":
    "A faster, accurate unread-messages badge",
  "changelog.entries.messages-badge-count.body":
    "The unread count on your messages icon stays right on every page without loading your whole inbox in the background, and it updates live as messages arrive and as you read them.",

  "changelog.entries.notifications-coverage.title":
    "Notifications for the things that were quietly slipping by",
  "changelog.entries.notifications-coverage.body":
    "Your bell now covers RSVPs, replies to your posts, requests to join your community, job applications, business reviews, invites accepted, and reports resolved.",

  "changelog.entries.members-collapsible-filters.title":
    "Collapsible filters on the members directory",
  "changelog.entries.members-collapsible-filters.body":
    "Member directory filters are now collapsible sections with a show and hide toggle. Your selections stay applied while they are hidden, and your view is remembered next time.",
  "changelog.entries.activism-volunteer-merge.title":
    "Activism and Volunteering are now one place",
  "changelog.entries.activism-volunteer-merge.body":
    "Activism and Volunteering are now one page, with volunteering as the front door: browse real opportunities in Lisbon and filter by cause or commitment. The old /activism address still works.",
  "changelog.entries.spaces-map-pins.title":
    "Map pins now show what kind of space each place is",
  "changelog.entries.spaces-map-pins.body":
    "Each pin on the Local map is a coloured teardrop with its category icon, and the filter chips share the same colour and icon, doubling as a legend.",
  "changelog.entries.creatives-subprofile.title":
    "The Creatives showcase is now a creative subprofile",
  "changelog.entries.creatives-subprofile.body":
    "Showing your art, music or other creative work now lives with subprofiles, alongside any other persona you build. The old /magazine/creatives link takes you there.",
  "changelog.entries.moderation-takedowns.title":
    "Moderator hide and remove now actually take content down",
  "changelog.entries.moderation-takedowns.body":
    "Hidden content is now withheld from members while staff can still see it, and removed content shows a removed by a moderator tombstone.",
  "changelog.entries.gathering-create-fix.title":
    "Creating a gathering works again, and lands on your event",
  "changelog.entries.gathering-create-fix.body":
    "Publishing a gathering works again: the success screen appears only after it publishes, See your event opens the real gathering, and the wizard requires a future start time.",
  "changelog.entries.directory-photos-crisp.title":
    "Listing cover photos load crisp again",
  "changelog.entries.directory-photos-crisp.body":
    "Cover photos on business listings, and the preview while you add one, now load at full resolution. The listing header sits lower, clear of the floating navigation.",
  "changelog.entries.admin-role-management.title":
    "Admins can promote moderators and admins from the dashboard",
  "changelog.entries.admin-role-management.body":
    "An admin can now grant or revoke moderator and admin roles from a member's detail. The last admin can't be removed, and every change is audited.",
  "changelog.entries.appeal-submission.title":
    "You can now appeal a moderation decision",
  "changelog.entries.appeal-submission.body":
    "A member under a warning, suspension or ban can now appeal from their account screen, and it goes to a moderator who did not make the original call.",
  "changelog.entries.honest-report-failures.title":
    "Safety reports tell you the truth when they don't send",
  "changelog.entries.honest-report-failures.body":
    "If a report, flag or safe-space concern can't reach us, you now see an honest error and your words stay in the form to try again.",
  "changelog.entries.directory-filters-and-accurate-recognition.title":
    "Member filters that actually filter, and honest badges & perks",
  "changelog.entries.directory-filters-and-accurate-recognition.body":
    "Picking a filter in the member directory now returns the people who match. Your Badges and Perks pages show a real loading, empty or try-again state.",
  "changelog.entries.navigation-resilience.title":
    "Back keeps your place, and the app rides out updates",
  "changelog.entries.navigation-resilience.body":
    "Going back after opening something from a list now returns you to the same scroll position, and when a new version ships mid-visit the app quietly refreshes itself.",
  "changelog.entries.search-page-launcher.title": "Jump anywhere from search",
  "changelog.entries.search-page-launcher.body":
    "Search (Cmd+K and the search page) now doubles as a launcher: start typing to jump straight to Members, Communities, Events, Settings and more. A new Pages tab lists every destination.",
  "changelog.entries.donate-honest-live.title":
    "Donations are honest about being pre-launch",
  "changelog.entries.donate-honest-live.body":
    "The donate flow no longer asks for card details while secure payments are still being wired up. It says so plainly and shows exactly where community money goes.",
  "changelog.entries.gathering-manage-coming-soon.title":
    "Host dashboard is an honest preview",
  "changelog.entries.gathering-manage-coming-soon.body":
    "The gathering host dashboard now shows a clear coming soon in live mode. Browsing and RSVPs are fully live, and the host tools are open in demo mode.",
  "changelog.entries.search-member-avatars.title":
    "See who you're searching for",
  "changelog.entries.search-member-avatars.body":
    "Member results in search now show each person's profile photo in place of a generic icon, so you can spot the face you're looking for at a glance.",
  "changelog.entries.search-real-topics.title": "Search now shows real results",
  "changelog.entries.search-real-topics.body":
    "Trending topics and post counts in search now come from the platform itself, alongside real people, communities, events, forum threads and businesses.",
  "changelog.entries.global-search.title": "Search across QueerPulse",
  "changelog.entries.global-search.body":
    "Find people, communities, events, forum threads and local businesses from anywhere, with Cmd+K or the search page.",
  "changelog.entries.studio-coming-soon.title":
    "Studio is now an honest preview",
  "changelog.entries.studio-coming-soon.body":
    "The co-op music Studio is still being built, so in live you now see a clear coming soon. Explore the whole thing in demo mode.",
  "changelog.entries.cinema-honest-live.title":
    "Cinema is honest about what's live",
  "changelog.entries.cinema-honest-live.body":
    "The film catalogue and playback are real. Collections, filmmaker profiles and open calls are still in production and say coming soon in live, and you can explore them in demo mode.",
  "changelog.entries.cinema-live-streaming.title":
    "Cinema now streams real films",
  "changelog.entries.cinema-live-streaming.body":
    "Browse the real programme and press play to stream a film. It resumes where you left off next time you come back.",
  "changelog.entries.employer-reviews-live.title": "Employer reviews, for real",
  "changelog.entries.employer-reviews-live.body":
    "The page now lists real queer-inclusive employers. Open a company for its full profile and reviews, or write your own anonymous review.",
  "changelog.entries.block-mute-from-profile.title":
    "Block or mute straight from a profile",
  "changelog.entries.block-mute-from-profile.body":
    "A safety menu in the profile header lets you mute someone instantly, quietly hiding their posts, or block them after a quick confirm, with the option to report at the same time.",
  "changelog.entries.event-push-reminders.title":
    "Set when your event reminders arrive",
  "changelog.entries.event-push-reminders.body":
    "Event preferences let you choose how far ahead you get a reminder, an hour, a day or a week, and turn on a phone push so it reaches you anywhere.",
  "changelog.entries.report-more-surfaces.title":
    "Report anything that doesn't feel right",
  "changelog.entries.report-more-surfaces.body":
    "A discreet Report link now sits on events, businesses, companies, job postings and public personas, opening the same confidential flow, and event reports reach the safety team.",
  "changelog.entries.profile-photo-pronouns.title": "Your face, your words",
  "changelog.entries.profile-photo-pronouns.body":
    "Edit Profile now takes a photo upload with an instant preview, and you can write your own pronouns alongside the presets.",
  "changelog.entries.mobile-form-keyboard.title":
    "Forms stay above the keyboard on phones",
  "changelog.entries.mobile-form-keyboard.body":
    "On iOS, enquiry and sign-up sheets lift above the keyboard so the submit button stays in view. The installed app icon also has long-press shortcuts.",

  "changelog.entries.magazine-real-content.title":
    "The magazine shows real issues, always",
  "changelog.entries.magazine-real-content.body":
    "The magazine archive and writer pages load real editions, with their own loading and error states while they arrive.",

  "changelog.entries.community-roadmap.title":
    "The roadmap is now yours to shape",
  "changelog.entries.community-roadmap.body":
    "See what is shipped, building and planned, vote for what matters most to you, or submit an idea of your own. We read every suggestion.",

  "changelog.entries.listing-photos.title": "Photos on your business listing",
  "changelog.entries.listing-photos.body":
    "The list-a-business form takes photos now. Upload a file or paste an image link, and preview your listing before you publish.",

  "changelog.entries.business-page-live.title": "Business pages come to life",
  "changelog.entries.business-page-live.body":
    "Each business page shows the venue's real photos in a gallery you can open full-screen, plus its opening hours with a live Open now or Closed status.",

  "changelog.entries.business-actions.title": "Save, share, and get directions",
  "changelog.entries.business-actions.body":
    "Every business page has an action bar: directions, call, share, or save a place to your list in one tap. Saved spots show how many members saved them too.",

  "changelog.entries.business-reviews-trust.title": "Reviews that go both ways",
  "changelog.entries.business-reviews-trust.body":
    "Owners can reply to reviews, and every page shows the star breakdown behind the average. You can also report a listing or suggest an edit, and moderators see both.",

  "changelog.entries.business-discovery.title":
    "Find your way around the directory",
  "changelog.entries.business-discovery.body":
    "Business pages now show related places nearby, the languages spoken on-site, and a clear path back to the directory. Upcoming events link to their event page.",

  "changelog.entries.directory-filters-upgrade.title":
    "The business directory got a lot easier to filter",
  "changelog.entries.directory-filters-upgrade.body":
    "Search now looks inside descriptions and tags, and you can sort A to Z or by neighbourhood. Filters live in the link, so a filtered directory is shareable.",
  "changelog.entries.public-profile-badge.title":
    '"Go public" now lives on your profile',
  "changelog.entries.public-profile-badge.body":
    "Your public-profile control now sits in a quiet badge next to your name. Tap it to see how public profiles unlock, or to switch yours on. Only you ever see it.",

  "changelog.entries.here-for-hero.title": '"Here for" now leads your profile',
  "changelog.entries.here-for-hero.body":
    "What you are looking for on QueerPulse now sits at the top of your profile, beside your name and bio. It stays just as easy to keep private.",

  "changelog.entries.directory-view-switcher.title":
    "A clearer List / Map switch",
  "changelog.entries.directory-view-switcher.body":
    "The list and map buttons on the business directory became one labelled toggle with icons, beside the results count, and it stays compact and tappable on a phone.",

  "changelog.entries.profile-links-fix.title": "Profile links that behave",
  "changelog.entries.profile-links-fix.body":
    "A plain username like your Instagram handle is now accepted as a profile link, and the field stays put when a hint appears neatly below it.",

  "changelog.entries.subprofiles-showcase.title": 'A richer "Also working as"',
  "changelog.entries.subprofiles-showcase.body":
    "Your other professional sides now show featured work, links, availability and follower and endorsement counts on the card, and you can edit your own personas from the showcase.",

  "changelog.entries.real-directory-map.title":
    "A real map on every directory listing",
  "changelog.entries.real-directory-map.body":
    "Open a business or space in the directory and its location shows on the real interactive Lisbon map, pinned to the exact spot the owner placed.",

  "changelog.entries.reply-threads.title": "Reply to any comment in the forum",
  "changelog.entries.reply-threads.body":
    "Answer directly under any comment and your reply nests right there, so long conversations branch out. Deep threads collapse into a single line you can tap to expand.",

  "changelog.entries.copy-subprofile.title": "Copy an existing persona",
  "changelog.entries.copy-subprofile.body":
    "Starting a new subprofile? Copy one you already have, everything or just the content, and tweak from there.",

  "changelog.entries.smoother-chat.title": "Smoother, more responsive chat",
  "changelog.entries.smoother-chat.body":
    "Chat feels faster and calmer: typing keeps the conversation steady, swipe-to-reply glides under your finger, and new messages settle into place on their own.",

  "changelog.entries.invite-state-page.title": "A clearer invite link page",
  "changelog.entries.invite-state-page.body":
    "An invite link that cannot be used now shows the real invite, who vouched for you, and whether it timed out, was already used or was withdrawn, with the right next step.",

  "changelog.entries.chat-shortcuts.title": "Mention shortcuts in chat",
  "changelog.entries.chat-shortcuts.body":
    "A new help button in the message composer lists every mention shortcut, from @ for a member to t/ for a forum thread. Tap one and it drops straight into your message.",

  "changelog.entries.events-hub.title": "One home for events",
  "changelog.entries.events-hub.body":
    "Events, Gatherings and Calendar are one Events Hub now, with Highlights, Browse and a full calendar together, and real photos for what is coming up.",

  "changelog.entries.gifs-in-chat.title": "Send GIFs in chat",
  "changelog.entries.gifs-in-chat.body":
    "There is a GIF button in the message composer. Search or browse what is trending, tap one, and it sends into your chat or group. Powered by KLIPY, with safe-content filtering on.",

  "changelog.entries.privacy-and-speed.title":
    "Stronger privacy and a snappier app",
  "changelog.entries.privacy-and-speed.body":
    "Personas and subprofiles you set to private stay private, people you blocked stay out of the flatmate directory, and message edits and deletes apply right away.",

  "changelog.entries.leaner-prerendering.title": "Leaner, faster site builds",
  "changelog.entries.leaner-prerendering.body":
    "We now pre-build only the essential public page for search engines, so builds stay quick, and every public page is still found through the sitemap.",

  "changelog.entries.admin-governance-real-data.title":
    "Governance dashboards now run on real data",
  "changelog.entries.admin-governance-real-data.body":
    "The admin governance area now reads live from the platform: finance figures and the quarterly chart, the policy decision log, and the moderation audit trail.",

  "changelog.entries.sign-in-fix.title": "Signing in works again",
  "changelog.entries.sign-in-fix.body":
    "A mismatch between the app and the server was stopping sign-in from completing. Logging in, signing out and staying signed in all work smoothly again.",
  "changelog.entries.accessibility-mobile-polish.title":
    "Easier to tap, easier to navigate",
  "changelog.entries.accessibility-mobile-polish.body":
    "Small buttons have bigger touch areas on phones, actions that only appeared on hover can be reached with the keyboard, and forms autofill your name and email.",
  "changelog.entries.platform-hardening.title": "Under-the-hood hardening",
  "changelog.entries.platform-hardening.body":
    "Behind the scenes: the API is versioned with published documentation, long lists are safely bounded so pages stay fast, and reporting has spam protection.",
  "changelog.entries.composer-reaction-polish.title":
    "A roomier message box and tidier reactions",
  "changelog.entries.composer-reaction-polish.body":
    "The message box fills the width of the composer and grows only as you type. Tapping an emoji you already reacted with now removes your reaction.",
  "changelog.entries.chat-mentions.title": "Mention people and places in chat",
  "changelog.entries.chat-mentions.body":
    "Type @ for a member, or c/ b/ e/ t/ # for a community, business, gathering, thread or topic, then pick a suggestion to get a tappable link.",
  "changelog.entries.group-chats.title": "Group chats",
  "changelog.entries.group-chats.body":
    "Start a group, name it, and see who is who. Admins add or remove members, receipts show who has read, and a bubble shows who is typing.",
  "changelog.entries.message-search.title": "Search your messages",
  "changelog.entries.message-search.body":
    "Search across all your conversations for that address, that date, that thing someone said, and jump straight to it.",
  "changelog.entries.link-previews.title": "Links open up",
  "changelog.entries.link-previews.body":
    "Share a link and it unfurls into a preview card with the title and image, so people can see where it goes before they tap.",
  "changelog.entries.forward-pin-star.title": "Forward, pin and star",
  "changelog.entries.forward-pin-star.body":
    "Pass a message along to another chat, pin the ones a group keeps coming back to, and star the ones you want to find again. Starred messages stay just for you.",
  "changelog.entries.safe-space-view-page.title":
    "Preview safe spaces before verifying",
  "changelog.entries.safe-space-view-page.body":
    "The Safe spaces review tool has a View page button on each listing, opening its public page in a new tab so moderators can see a space in full before verifying it.",
  "changelog.entries.swipe-members-highlight.title":
    "Swipe through featured members",
  "changelog.entries.swipe-members-highlight.body":
    "On the homepage, the featured member card follows your finger. Swipe left or right on your phone and it snaps to the next member.",
  "changelog.entries.mention-names.title": "Mentions show real names",
  "changelog.entries.mention-names.body":
    "A mention now reads as the full name, Tiago Costa in place of @tiago-costa, in chat, the forum and communities. Hovering shows the handle.",
  "changelog.entries.forward-to-groups.title":
    "Forward messages to your groups",
  "changelog.entries.forward-to-groups.body":
    "Forwarding reaches your group chats too. Long-press any message, pick Forward, and choose any group you are part of.",
  "changelog.entries.read-receipts.title": "Delivered and read receipts",
  "changelog.entries.read-receipts.body":
    "Ticks now tell the whole story: sent, delivered to their phone, and read, so you know where your message got to.",
  "changelog.entries.message-gestures.title": "Swipe to reply, tap to react",
  "changelog.entries.message-gestures.body":
    "Swipe a message sideways to reply to it, and double-tap it to react.",
  "changelog.entries.message-drafts.title": "Your drafts wait for you",
  "changelog.entries.message-drafts.body":
    "An unsent message stays saved in that conversation, waiting for you when you come back.",
  "changelog.entries.offline-outbox.title": "Sends that don't get lost",
  "changelog.entries.offline-outbox.body":
    "Send with no signal and your message waits in line, going out the moment you are back online.",
  "changelog.entries.typing-indicator.title":
    "Typing bubble and screen-reader polish",
  "changelog.entries.typing-indicator.body":
    "A gentle bubble shows when the other person is writing, and a round of screen-reader work makes the chat easier to follow without looking.",
  "changelog.entries.moderation-actions.title":
    "Every report gets a real decision",
  "changelog.entries.moderation-actions.body":
    "Opening a report shows the full set of actions: hide, warn, restrict, remove and more, each with a reason the member reads. The queue headline counts the reports actually waiting.",
  "changelog.entries.listing-preview-and-ask.title":
    "Preview a listing, ask a question",
  "changelog.entries.listing-preview-and-ask.body":
    "Moderators can preview a submitted business exactly as it will appear live, and send the person who submitted it a question as a direct message.",
  "changelog.entries.business-map-pin.title": "Put your business on the map",
  "changelog.entries.business-map-pin.body":
    "Paste a Google Maps link when you list a business to drop a pin. Live listings appear on the local map once moderation has looked at them.",
  "changelog.entries.profile-editing.title": "Edit your profile in place",
  "changelog.entries.profile-editing.body":
    "Edit your board, skills and groups straight on your profile, with a warning before you walk away from unsaved changes.",
  "changelog.entries.profile-communities-save.title":
    "Featured communities that stay put",
  "changelog.entries.profile-communities-save.body":
    "The communities you pin to your profile now stay saved across sessions and devices, and everyone who visits sees them with your role on each.",
  "changelog.entries.mention-types.title": "More ways to mention",
  "changelog.entries.mention-types.body":
    "Mentions now reach topics, businesses, events and threads as well as people and communities. Owners and the people who run them are notified when tagged.",
  "changelog.entries.clear-errors.title": "Clearer error messages",
  "changelog.entries.clear-errors.body":
    "When something cannot be saved, we now tell you exactly what went wrong and what to fix.",
  "changelog.entries.messaging-reactions.title": "Smoother message reactions",
  "changelog.entries.messaging-reactions.body":
    "Reactions appear instantly for everyone in the chat, and your own messages hold their position when you react to them.",
  "changelog.entries.event-photos.title": "Event photo galleries",
  "changelog.entries.event-photos.body":
    "Organisers and people who attended can share photos on a gathering, visible only to those who were there.",
  "changelog.entries.mentions.title": "Mention people and communities",
  "changelog.entries.mentions.body":
    "Type @ to tag a member or c/ to link a community in forum and community replies. Anyone you mention gets a notification.",
  "changelog.entries.push-notifications.title":
    "Push notifications for messages",
  "changelog.entries.push-notifications.body":
    "Opt in to a phone notification when a direct message arrives while you are away. Direct messages only, and off by default.",
  "changelog.entries.delete-conversation.title": "Delete a conversation",
  "changelog.entries.delete-conversation.body":
    "Clear a chat from your own inbox while the other person keeps their copy.",
  "changelog.entries.profile-communities.title": "Showcase your communities",
  "changelog.entries.profile-communities.body":
    "Pin the communities you run or belong to on your profile, each with a role badge.",
  "changelog.entries.subprofiles-upgrade.title": "Richer subprofiles",
  "changelog.entries.subprofiles-upgrade.body":
    "Subprofiles gained presence and media, link previews when you share them, and QR code and vCard export.",
  "changelog.entries.messaging-upgrades.title": "Messaging improvements",
  "changelog.entries.messaging-upgrades.body":
    "Long-press a message for actions, edit or reply to it, and read a cleaner conversation thread.",
  "changelog.entries.housing.title": "Housing & flatmate directories",
  "changelog.entries.housing.body":
    "Member-only listings for housing, flatmates and friendly landlords, each with a compatibility score.",
  "changelog.entries.routing-cleanup.title": "Routing & path cleanup",
  "changelog.entries.routing-cleanup.body":
    "Conflicting public paths and route edge cases across the app are now sorted out.",
  "changelog.entries.maps.title": "Interactive maps",
  "changelog.entries.maps.body":
    "Explore the local directory and venues on an interactive map.",
  "changelog.entries.genesis.title": "Founder bootstrap flow",
  "changelog.entries.genesis.body":
    "A one-time Genesis flow sets up the very first administrator when the platform is stood up.",
  "changelog.entries.pwa-mobile.title": "Install as an app",
  "changelog.entries.pwa-mobile.body":
    "QueerPulse is installable as a progressive web app, with a native-feeling mobile interface, better icons and search-engine metadata.",
  "changelog.entries.deploy-stability.title": "Deploy & build stabilization",
  "changelog.entries.deploy-stability.body":
    "A run of deployment, build and prerendering fixes so the app ships reliably in production.",
  "changelog.entries.performance-staff.title": "Performance & staff badges",
  "changelog.entries.performance-staff.body":
    "Faster page loads, more admin routes, and a QueerPulse staff badge on official accounts.",
  "changelog.entries.accessibility.title": "Accessibility & UI polish",
  "changelog.entries.accessibility.body":
    "Accessibility fixes and a round of interface refinements across the app.",
  "changelog.entries.i18n-complete.title": "Full Portuguese translation",
  "changelog.entries.i18n-complete.body":
    "The whole interface is available in English and Portuguese, switchable from the nav.",
  "changelog.entries.subprofiles.title": "Subprofiles",
  "changelog.entries.subprofiles.body":
    "Create several public presences under one account, for your art, your business or a project.",
  "changelog.entries.live-backend.title": "Live backend",
  "changelog.entries.live-backend.body":
    "The app now runs on its real backend with editable profiles, and the standalone demo mode stays available alongside it.",
  "changelog.entries.landing.title": "New landing page",
  "changelog.entries.landing.body":
    "A redesigned landing page, along with a round of marketing-site refactors.",
  "changelog.entries.studio-cinema.title": "Cinema & Studio",
  "changelog.entries.studio-cinema.body":
    "Cinema rights pages and Studio production pages joined the platform.",
  "changelog.entries.tickets.title": "Ticketed events",
  "changelog.entries.tickets.body":
    "Pay for event tickets directly on the platform, backed by real event data.",
  "changelog.entries.business-directory.title": "Local business directory",
  "changelog.entries.business-directory.body":
    "A directory of local queer-friendly businesses, with a flow for owners to add their own.",
  "changelog.entries.invite-flow.title": "Invite flow",
  "changelog.entries.invite-flow.body":
    "Sign-up now runs on invitations, with a reworked onboarding to go with it.",
  "changelog.entries.moderation-trust.title": "Moderation & trust network",
  "changelog.entries.moderation-trust.body":
    "Moderation tools, event management, admin tooling, and a trust-network graph connecting members.",
  "changelog.entries.communities-forum.title": "Communities & forum",
  "changelog.entries.communities-forum.body":
    "Member-run communities and a long-form discussion forum launched together.",
  "changelog.entries.onboarding.title": "Member onboarding",
  "changelog.entries.onboarding.body":
    "A guided onboarding flow for new members, with a smoother sign-in.",
  "changelog.entries.launch.title": "QueerPulse launches",
  "changelog.entries.launch.body":
    "The first release: the community mega-navigation and the core set of pages went live.",
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
  "roadmap.card.slipNote": "Moved from {from} to {to}: {reason}",
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
  "volunteer.filter.commitmentGroup": "Filter by commitment",
  "volunteer.filter.causeGroup": "Filter by cause",
  // The volunteering cause taxonomy, one key set shared by the board's filter
  // chips, the post/edit form's picker and the label on a card. It replaced two
  // parallel sets ("volunteer.filter.*" and "postOpportunity.cause.*") that held
  // the same five strings twice. Order and tints live in `causes.data.ts`.
  "cause.rights": "LGBTQ+ Rights",
  "cause.health": "Health & Wellbeing",
  "cause.youth": "Youth",
  "cause.housing": "Housing",
  "cause.arts": "Arts & Culture",
  "cause.transCare": "Trans & gender care",
  "cause.elders": "Elders",
  "cause.mentalHealth": "Mental health & peer support",
  "cause.migration": "Migration & asylum",
  "cause.education": "Education & training",
  "cause.sport": "Sport & movement",
  "cause.communityEvents": "Community events",
  "cause.fundraising": "Fundraising & admin",
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
  "volunteer.card.seeRole": "See the role",
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
  "postOpportunity.core.causeHelper":
    "Pick up to {{max}}. The first one you pick is the one your card leads with.",
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
  "postOpportunity.missing.taskTitle": "Task {index} title",
  "postOpportunity.missing.commitmentLabel": "Commitment {index} label",
  "postOpportunity.missing.heading_one":
    "{count} field still to fill in before you can continue:",
  "postOpportunity.missing.heading_other":
    "{count} fields still to fill in before you can continue:",
  "postOpportunity.edit.saving": "Saving…",
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
  // PRD-262: shown when the reader is not yet connected to the poster, so the
  // button does not promise a message it will answer with a connection
  // request. PRD-260: the signed-out apply prompt on the now-public page.
  "volunteerDetail.sidebar.connectToMessage": "Connect with the team",
  "volunteerDetail.sidebar.signInToApply": "Sign in to apply",
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
  "volunteerDetail.report.cta": "Report this opportunity",
  "volunteerDetail.report.ariaLabel": "Report the opportunity {role} at {org}",

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
  "contact.form.topic.accessibility": "Accessibility barrier",
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
  "forOrgs.tiers.employer.list1":
    "Unlimited job listings · <b>posted within 24h</b>",
  "forOrgs.tiers.employer.list2":
    "Verified-employer badge on the company profile",
  "forOrgs.tiers.employer.list3":
    "One annual member-conducted culture review (anonymous)",
  "forOrgs.tiers.employer.list4": "Listing in Employer Reviews",
  "forOrgs.tiers.employer.list5":
    "Quarterly hiring office-hours with two team members",
  "forOrgs.tiers.partner.list1":
    "<b>Operational seam:</b> case bridge, helpline handoff, joint protocol",
  "forOrgs.tiers.partner.list2": "Shared moderation channel where appropriate",
  "forOrgs.tiers.partner.list3":
    "Co-signed advocacy work · each side can dissent publicly",
  "forOrgs.tiers.partner.list4":
    "Listed on Partners with a dedicated case page",
  "forOrgs.tiers.partner.list5":
    "<b>Per-case payment</b> for partner-provided services (e.g. €45/legal-consult)",
  "forOrgs.tiers.funder.list1": "Programme-specific reporting · quarterly",
  "forOrgs.tiers.funder.list2": "Credit on the programme page in plain text",
  "forOrgs.tiers.funder.list3": "No platform-wide placement, no co-branding",
  "forOrgs.tiers.funder.list4": "Annual independent audit included",
  "forOrgs.tiers.funder.list5": "Public itemisation in the transparency report",
  // PRD-266: the For Organisations partner ask now hands over to the real
  // /about/partners/apply flow instead of writing a parallel inquiry row.
  "forOrgs.apply.lead":
    "Tell us who you are and we will take you to the partner application. It is one form, it goes to the partnerships queue, and you can see where it stands from your account at any time.",
  "forOrgs.apply.note":
    "We read every application, however rough. The answer arrives in the app, on your submissions page and in your notifications. We send no email, ever.",
  "forOrgs.cta.title": "Start a <em>conversation.</em>",
  "forOrgs.cta.list1": "For partnerships, we usually call before we write",
  "forOrgs.cta.list2": "Grant applications: include a one-pager",
  "forOrgs.cta.pressInquiry": "Press inquiries: <a>Press Kit</a>",
  "forOrgs.cta.partnerQuestion":
    "Already a partner with a question? <a>Contact us</a>",
  "forOrgs.form.orgLabel": "Organisation",
  "forOrgs.form.orgPlaceholder": "Your organisation",

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
  // "updated monthly" was a cadence nothing scheduled, measured or could have
  // shown: `DirectoryCardDTO` carries no update date, so the page had no way
  // to stand behind it. Replaced with who maintains the directory, which the
  // claim, confirm and dispute flows do back.
  "directory.hero.note":
    "Community-verified · kept up by members and the businesses themselves",
  "directory.search.placeholder": "Search by name, neighbourhood, or type…",
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
  // Pluralised on `count`, which the call site sets to the size of the pool
  // being counted against. The flat key is kept as the fallback `resolveEntry`
  // lands on when no count is supplied.
  "directory.count": "Showing <b>{shown}</b> of {total} places",
  "directory.count_one": "Showing <b>{shown}</b> of {total} place",
  "directory.count_other": "Showing <b>{shown}</b> of {total} places",
  // PRD-246. The count used to quote the SERVER total against a CLIENT-filtered
  // shown count, so filtering to "Open now" on page one of a 120-place registry
  // read "Showing 3 of 120 places", a sentence whose two numbers describe
  // different populations. Category, open-now, sort and distance all filter
  // client-side over the pages loaded so far, and that is deliberate: the grid
  // is CDN-cached and a server-baked open state would go stale in the dangerous
  // direction, saying open when shut.
  //
  // So when a client-only filter is narrowing an incompletely loaded set, the
  // count says what it is really counting and the registry total moves into a
  // note beside it. `directory.count` above is untouched and still serves the
  // common case, which is most of the time.
  //
  // Flat rather than CLDR-pluralised, matching `directory.count`: the plural
  // noun attaches to `{loaded}` and `{total}`, never to `{shown}`, and this
  // branch is only reachable when a further server page exists, so both are at
  // least a full page.
  "directory.countLoaded":
    "Showing <b>{shown}</b> of the {loaded} places loaded so far",
  "directory.countLoaded_one":
    "Showing <b>{shown}</b> of the {loaded} place loaded so far",
  "directory.countLoaded_other":
    "Showing <b>{shown}</b> of the {loaded} places loaded so far",
  "directory.countLoadedTotal": "{total} in the whole directory",
  "directory.empty.title": "No places match those filters",
  "directory.empty.body":
    "Try a broader category, fewer vibes, or a different search, or clear the filters to see everything.",
  // PRD-246. The same empty state, for the case where more pages are still
  // coming. `directory.empty.*` above reads as a definitive "nothing in the
  // whole registry matches", which is a claim the page cannot make while pages
  // 2..N are unfetched. This one says what it actually knows.
  "directory.emptyPartial.title": "Nothing matches yet",
  "directory.emptyPartial.body":
    "None of the {loaded} places loaded so far match those filters, and there are more still loading. Give it a moment, or clear the filters to see everything.",
  "directory.noListings.title": "No places listed yet",
  "directory.noListings.body":
    "This directory grows from the community. If you run or know a queer-owned or queer-friendly place in Lisbon, be the first to add it.",
  // Shown when the directory read itself failed. Kept firmly separate from
  // `noListings` above: an outage rendered as an empty state would tell a
  // member Lisbon has no queer-owned places (DES-25).
  "directory.loadError.title": "We couldn't load the <em>directory</em>",
  "directory.loadError.body":
    "The places didn't come back this time. Your filters are still set, so try again in a moment.",
  "directory.clearFilters": "Clear filters",
  "directory.clearAll": "Clear all",
  "directory.activeFilters": "Filtered by",
  "directory.removeFilter": "Remove filter",
  "directory.onMap": "{count} on map",
  "directory.sort.label": "Sort",
  "directory.sort.default": "Featured",
  // The same option, renamed while "use my location" is on: with a position
  // known the curated order IS the distance order, so the control says so.
  "directory.sort.nearest": "Nearest first",
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
    "The verified badge isn't self-declared. A member puts a space forward, others visit and review it against a fixed set of criteria, and every badge comes back for review a year after it is granted, so a space can lose it, too.",
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
  "directory.detail.claimsFiledLink": "See the claims you've filed",
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
  // A public question and the answer under it are one reportable thing, and
  // they are often written by two different people. Naming the asker told
  // somebody reporting the ANSWER that they were reporting the asker's
  // question, which is both wrong and unsettling to read while deciding to
  // report something. This names neither of them and covers both halves.
  "directory.detail.reportQuestion.sub":
    "Tell us what's wrong with this question or the answer under it. A moderator reviews every report, and they won't be told who filed it.",
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
    "A moderator will review your claim on {name}. You can see where it stands whenever you like.",
  "directory.detail.claim.doneCta": "Done",
  // The published claim policy, served by GET /listings/claim-policy. The day
  // count is the server's; only the sentence around it ships in the bundle.
  "directory.detail.claim.policyTitle": "What helps, and how long it takes",
  "directory.detail.claim.policyTurnaround_one":
    "A moderator decides within {count} day of you sending this.",
  "directory.detail.claim.policyTurnaround_other":
    "A moderator decides within {count} days of you sending this.",
  "directory.detail.claim.policyHintsLabel":
    "Anything like this in your note makes the review quicker:",
  "directory.detail.claim.trackCta": "See the claims you've filed",
  // BF-05: /local/directory/claims, where a claimant follows their own claims.
  "directory.myClaims.backLabel": "Local directory",
  "directory.myClaims.title": "Claims you've filed",
  "directory.myClaims.sub":
    "Every request you've sent to take over a listing somebody else added, and where each one stands.",
  "directory.myClaims.turnaround_one":
    "A moderator decides each claim within {count} day of it being filed.",
  "directory.myClaims.turnaround_other":
    "A moderator decides each claim within {count} days of it being filed.",
  "directory.myClaims.checkBack":
    "Come back here whenever you want to see where a claim has got to.",
  "directory.myClaims.loading": "Loading your claims…",
  // Read out by the page's persistent status region once the list settles.
  // Never rendered on screen: the visible page already says both of these in
  // its own words.
  "directory.myClaims.announceEmpty": "No claims yet.",
  "directory.myClaims.announceCount_one": "1 claim.",
  "directory.myClaims.announceCount_other": "{count} claims.",
  "directory.myClaims.empty.title": "You haven't claimed a listing yet",
  "directory.myClaims.empty.description":
    "If you run a place that is already in the local directory, open its page and choose to claim it. A moderator reads every request, and if it checks out the listing becomes yours: its reviews, its details, everything.",
  "directory.myClaims.empty.action": "Browse the local directory",
  "directory.myClaims.status.pending": "Waiting for review",
  "directory.myClaims.status.approved": "Approved",
  "directory.myClaims.status.declined": "Declined",
  "directory.myClaims.reference": "Reference {reference}",
  "directory.myClaims.filedOn": "Filed on {date}",
  "directory.myClaims.waiting_one": "Waiting {count} day so far.",
  "directory.myClaims.waiting_other": "Waiting {count} days so far.",
  "directory.myClaims.decisionDue": "A decision is due by {date}.",
  "directory.myClaims.decisionOverdue":
    "This one was due by {date}. It is still in the queue, and a moderator will get to it.",
  "directory.myClaims.reviewedOn": "Reviewed on {date}.",
  "directory.myClaims.outcome.approved":
    "The listing is yours. You can edit it now, and it sits with your places on your profile.",
  "directory.myClaims.outcome.declined":
    "This one was not approved. You can claim it again if something has changed since.",
  "directory.myClaims.noteLabel": "What you told the moderators",
  "directory.myClaims.viewListing": "See {name} in the directory",
  "directory.myClaims.editListing": "Edit {name}",
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

  // ── Review stamp (`PageReviewStamp`), shared by the two Lisbon guidance
  //    pages, /local/visas and /local/arriving. One date and a named owner,
  //    deliberately with NO cadence attached: nothing schedules a re-read of
  //    these pages, so "reviewed quarterly" would be the same kind of
  //    unbacked claim the stamp exists to replace. `{date}` is localized by
  //    `fmt.date`. Each page supplies its own "check it yourself" line below.
  "reviewStamp.reviewed": "Last reviewed by the QueerPulse team on {date}.",

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
  "arriving.review.verify":
    "Rents, fees and opening hours move faster than this page does. Treat everything here as a starting point and confirm the current detail with the service itself.",

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
    "Rents have risen steeply over the past five years, and a room in a central neighbourhood is most people's largest monthly cost by a distance. Set your budget from what is actually being asked this month, on the housing board and the listing sites, rather than from a figure printed on a guide. Arroios and Mouraria still offer better value. Good listings go within days, so move quickly when you see one.",
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
  "visas.review.verify":
    "Verify before you apply. This page names the rules and the office that publishes each figure, and it prints no income thresholds or fees of its own: those are reset every year, and a stale number is the one thing here that could cost you an application.",
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
    "EU citizens staying more than 3 months must register at their local Câmara Municipal. You'll need your passport, proof of address, and proof of income or employment. The certificate is usually issued the same day. There is a small fee, set by each Câmara: ask yours what it is today.",
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
    "Non-EU citizens who can demonstrate a stable passive or remote income. The minimum income threshold is pegged to the Portuguese minimum wage, which is reset every year, and some consulates want to see significantly more. Get the current figure from AIMA and from the consulate you will apply at before you build a case around it. Applications are made at the Portuguese consulate in your home country before arriving.",
  "visas.tabs.d7.card1.tag": "Apply before arriving",
  "visas.tabs.d7.card1.link": "The current threshold at aima.gov.pt",
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
    "Proof of remote employment or contracts with non-Portuguese clients. The income requirement is typically four times the Portuguese minimum wage, and that wage is reset every year, so take the current figure from AIMA rather than from any page quoting an amount. Health insurance with Portugal coverage. Clean criminal record. Portuguese NIF (can be obtained before the visa in some cases).",
  "visas.tabs.d8.card1.tag": "Higher income bar than D7",
  "visas.tabs.d8.card1.link": "The current threshold at aima.gov.pt",
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
  // Shown under the sort control while "use my location" is on, saying what the
  // position is doing for the sort the member picked. The two work together;
  // neither replaces the other.
  "local.filter.sortNoteHood":
    "Neighbourhoods are ordered by how close they are, and so are the places in each one.",
  "local.filter.sortNoteName":
    "Kept alphabetical. Your location still puts a walking time on every card.",
  // ── Use my location. Opt-in, reversible, and never leaves the device.
  "local.nearMe.on": "Use my location",
  "local.nearMe.off": "Turn off my location",
  "local.nearMe.asking": "Finding you…",
  "local.nearMe.privacy": "Your location stays on this device.",
  "local.nearMe.onNote":
    "Walking times are on. Your location stays on this device.",
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
    "<strong>At least 90% of every euro received</strong> must be spent on community programmes, staff, and infrastructure, leaving overheads a ceiling of 10%. The target is 96% and has been met every year since 2024.",
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
    "The collective may be wound down only by Assembly resolution carrying a <strong>75% supermajority</strong> measured against the full active membership.",
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
  "resourceLibrary.emptyUnreviewed":
    "No guides have been through editorial review yet. A guide appears here once an editor has read it end to end and confirmed it is accurate.",
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
  // PRD-266: the application endpoint is member-guarded and stamps a NOT NULL
  // submitter, so a signed-out visitor gets a real prompt rather than a 401.
  "submitPartner.signedOut.title": "Sign in to apply",
  "submitPartner.signedOut.body":
    "A partner application is tied to an account, because that account is where the answer lands. Sign in and we bring you straight back here with what you already typed.",
  "submitPartner.signedOut.signInCta": "Sign in and continue",
  "submitPartner.signedOut.contactCta": "Just ask a question instead",

  // PRD-263: an approved partner can now maintain its own public profile at
  // /account/partner-profile. Tier, since and the card kicker stay staff-set.
  "partnerProfileEdit.meta.title": "Your partner profile",
  "partnerProfileEdit.meta.description":
    "Keep your organisation's public page on QueerPulse accurate: contact details, description, tags and funding.",
  "partnerProfileEdit.hero.eyebrow": "Partners · Your profile",
  "partnerProfileEdit.hero.title": "Keep your page <em>true.</em>",
  "partnerProfileEdit.hero.sub":
    "This is the page people find when they are looking for you. Change what changed, save, and it is live.",
  "partnerProfileEdit.empty.title": "You do not maintain a partner profile",
  "partnerProfileEdit.empty.body":
    "This page is for organisations already approved as partners. If yours has been approved and you cannot see it here, ask us to move the profile to your account.",
  "partnerProfileEdit.empty.applyCta": "Apply to partner",
  "partnerProfileEdit.picker.label": "Which organisation?",
  "partnerProfileEdit.staffFields.title": "Set by the partnerships team",
  "partnerProfileEdit.staffFields.tier": "Partnership tier",
  "partnerProfileEdit.staffFields.since": "Partner since",
  "partnerProfileEdit.staffFields.eyebrow": "Card kicker",
  "partnerProfileEdit.staffFields.note":
    "These four say something about the relationship between us, so we set them together rather than either side setting them alone. Ask us and we will change them.",
  "partnerProfileEdit.fields.regionLabel.label": "Region, as it should read",
  "partnerProfileEdit.fields.regionLabel.helper":
    'The words printed on your card, for example "Portugal" or "Lisbon and Setúbal".',
  "partnerProfileEdit.fields.about.label": "About your organisation",
  "partnerProfileEdit.fields.about.helper":
    "A few paragraphs, separated by a blank line. This is the long text on your page.",
  "partnerProfileEdit.fields.funding.label": "How you are funded",
  "partnerProfileEdit.fields.funding.helper":
    "People read this. Say where the money comes from, plainly.",
  "partnerProfileEdit.fields.phone.label": "Phone",
  "partnerProfileEdit.fields.phoneNote.label": "When to call",
  "partnerProfileEdit.fields.phoneNote.helper":
    'For example "Weekdays, 14:00 to 20:00". Leave it empty if the line is always open.',
  "partnerProfileEdit.actions.save": "Save changes",
  "partnerProfileEdit.actions.saving": "Saving\u2026",
  "partnerProfileEdit.actions.viewPublic": "See your public page",
  "partnerProfileEdit.savedToast": "Saved. Your public page is up to date.",
  "partnerProfileEdit.errorToast": "Could not save your profile.",
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
    "Legal Aid and Sexual Health Testing now show a real, admin-vetted directory where one exists. Where it is still empty, a Suggest a resource form feeds an admin review queue.",
  "changelog.tag.legal": "See Legal Aid",

  "changelog.tag.guideRating": "See the Legal guides",
  "changelog.entries.resources-guide-rating.title":
    "Rate whether a resource guide helped",
  "changelog.entries.resources-guide-rating.body":
    "Legal, Sexual Health and Mental Health guides end with a quick Was this helpful, thumbs up or down. Editors see the results on the new Guide Feedback page.",

  "changelog.entries.homepage-housing-personas-showcase.title":
    "A closer look at housing and personas on the homepage",
  "changelog.entries.homepage-housing-personas-showcase.body":
    "The homepage Housing and Personas sections now show the real thing: two listing cards with a room tab and a landlord tab, and a switchable persona deck.",

  // Trust, safety and moderation (section 1 build).
  "changelog.tag.transparency": "Read the transparency report",
  "changelog.tag.constitution": "Read the constitution",
  "changelog.tag.codeOfConduct": "Read the code of conduct",
  // ACQ-01..04, ACQ-08, ACQ-11, ID-11, ID-12, ID-15: the applicant funnel,
  // account security and export depth.
  "changelog.tag.accountSecurity": "Open account security",
  "changelog.tag.dataExport": "Download your data",
  "changelog.tag.contact": "Get in touch",
  // 26 Aug 2026 batch: the claim tracker and the accessibility statement.
  "changelog.tag.listingClaims": "Track your claim",
  "changelog.tag.accessibility": "Read the accessibility statement",
  // Second 26 Aug 2026 batch. `changelog.tag.safety` already points at
  // `routes.report` on an older entry with the label "See our safety
  // approach", which reads as an explainer rather than the form itself.
  "changelog.tag.reportForm": "Open the report form",

  // ── 28 Aug 2026 ───────────────────────────────────────────────────────────
  "changelog.entries.the-nomination-form-becomes-a-form.title":
    "The nomination form becomes a form",
  "changelog.entries.the-nomination-form-becomes-a-form.body":
    "Nominating a Change Maker now labels both fields and counts to 500 characters on the why box. A moderator reads it, and the nominee is never told.",

  "changelog.entries.signing-a-device-out-now-signs-it-out.title":
    "Signing a device out now signs it out",
  "changelog.entries.signing-a-device-out-now-signs-it-out.body":
    "Your device list now labels the device in your hand, and signing out the others leaves you signed in. Signing a device out takes effect immediately.",

  "changelog.entries.names-that-speak-for-queerpulse-are-reserved.title":
    "Names that speak for QueerPulse are reserved",
  "changelog.entries.names-that-speak-for-queerpulse-are-reserved.body":
    "Around thirty names that could pass for the platform, like support, moderator and security, are now reserved for QueerPulse. If yours matches, you get a number after it.",

  "changelog.entries.badges-for-the-people-who-run-each-part.title":
    "Badges for the people who run each part",
  "changelog.entries.badges-for-the-people-who-run-each-part.body":
    "The people trusted with housing, the directory, the library, the magazine and communities now carry a badge wherever their name appears, labelled with their area.",

  "changelog.entries.staying-signed-in-on-shared-wifi.title":
    "Staying signed in on shared wifi",
  "changelog.entries.staying-signed-in-on-shared-wifi.body":
    "Session renewals are counted per session now, so everyone sharing one internet connection at a venue, a cafe or a home line stays signed in.",

  "changelog.entries.clearer-keyboard-focus-across-the-platform.title":
    "Clearer keyboard focus across the platform",
  "changelog.entries.clearer-keyboard-focus-across-the-platform.body":
    "The keyboard focus ring is two-toned now, a dark line with a pale halo, so it reads on any background. Around 170 controls that overrode it share it.",

  "changelog.entries.screen-readers-follow-along-in-more-places.title":
    "Screen readers follow along in more places",
  "changelog.entries.screen-readers-follow-along-in-more-places.body":
    "Five side panels now move your keyboard focus inside, close on Escape and hand you back to the button you came from. Reordering magazine pieces announces the new position.",

  "changelog.entries.see-your-persona-the-way-a-visitor-does.title":
    "See your persona the way a visitor does",
  "changelog.entries.see-your-persona-the-way-a-visitor-does.body":
    "A View as visitor button beside Edit persona shows your page as a stranger sees it, and a bar at the foot brings you back.",

  "changelog.entries.filters-you-add-ease-in-and-out.title":
    "Filters you add ease in and out",
  "changelog.entries.filters-you-add-ease-in-and-out.body":
    "In Find members, each filter pill grows in as it appears and shrinks away as it leaves. Reduce motion keeps them still.",

  "changelog.entries.every-neighbourhood-says-how-many-people-are-there.title":
    "Every neighbourhood says how many people are there",
  "changelog.entries.every-neighbourhood-says-how-many-people-are-there.body":
    "Where they're based is now a tick box per neighbourhood, each with a count of your current results. Empty neighbourhoods grey out, and All of Lisbon carries the full number.",

  "changelog.entries.a-persona-leads-with-its-name.title":
    "A persona leads with its name",
  "changelog.entries.a-persona-leads-with-its-name.body":
    "The photo now sits beside the name it belongs to, with the description right under it. The craft opens that description line in darker type, and the uppercase badge is gone.",

  "changelog.entries.pages-open-the-moment-you-click-them.title":
    "Pages open the moment you click them",
  "changelog.entries.pages-open-the-moment-you-click-them.body":
    "The app fetches a page as soon as you hover over or touch the link, and the frame appears straight away with placeholders while the content arrives.",

  "changelog.entries.people-you-might-know-swipes-sideways-on-a-phone.title":
    "People you might know swipes sideways on a phone",
  "changelog.entries.people-you-might-know-swipes-sideways-on-a-phone.body":
    "On a phone, the suggestions above your feed now scroll sideways in one strip, so your feed starts higher up. Each card keeps the same face and choices.",

  "changelog.entries.member-filters-show-how-many-people-are-behind-each-one.title":
    "Member filters show how many people are behind each one",
  "changelog.entries.member-filters-show-how-many-people-are-behind-each-one.body":
    "Every option in the member directory sidebar now carries the number of members behind it, counted against what you have already picked. Options nobody matches grey out.",

  "changelog.entries.an-empty-browse-stops-blaming-your-filters.title":
    "An empty Browse stops blaming your filters",
  "changelog.entries.an-empty-browse-stops-blaming-your-filters.body":
    "Browse under Events now tells the two empty states apart: with filters on, it names the dates, the neighbourhood and the kind of gathering you could widen.",

  "changelog.entries.one-row-of-tabs-on-events.title":
    "One row of tabs on Events",
  "changelog.entries.one-row-of-tabs-on-events.body":
    "Highlights, Browse and Calendar move up into the header row, so the second sticky bar is gone. Links into a specific view still work.",

  "changelog.entries.the-recap-card-leaves-ways-to-gather.title":
    "The recaps card leaves ways to gather",
  "changelog.entries.the-recap-card-leaves-ways-to-gather.body":
    "Relive the last one pointed at a recap page that does not exist yet, so it has left the ways to gather strip. Three equal doors remain.",

  "changelog.entries.a-nomination-can-say-where-to-find-them.title":
    "A nomination can say where to find them",
  "changelog.entries.a-nomination-can-say-where-to-find-them.body":
    "A change maker nomination now takes two optional extras: the person's profile here, or a public link like an Instagram. A name and a sentence are still enough.",

  "changelog.entries.the-communities-toolbar-becomes-one-line.title":
    "The communities toolbar becomes one line",
  "changelog.entries.the-communities-toolbar-becomes-one-line.body":
    "Four stacked bands above the community cards become one row: the My communities and Discover switch, search with Refine beside it, and Start a community.",

  "changelog.entries.three-icons-leave-the-events-header.title":
    "Three icons leave the events header",
  "changelog.entries.three-icons-leave-the-events-header.body":
    "The gear, bell and magnifier are gone from the events header. It is now the page name, the My events and Discover switch, and Host a gathering.",

  "changelog.entries.browse-events-gets-the-same-refine.title":
    "Browse events gets the same Refine",
  "changelog.entries.browse-events-gets-the-same-refine.body":
    "Discover's browse board now opens like your own events: a search field and a Refine control holding when, neighbourhood, kind of gathering and cost, with removable chips.",

  "changelog.entries.your-events-filters-fold-away.title":
    "Your events filters fold away",
  "changelog.entries.your-events-filters-fold-away.body":
    "The bucket pills, filter chips and sort above your events now live behind one Refine control, which shows a count while something is on.",

  "changelog.entries.the-communities-filters-fold-away.title":
    "The communities filters fold away",
  "changelog.entries.the-communities-filters-fold-away.body":
    "Category chips, the tags tray, both toggles and sort now sit behind one Refine, the same panel the Lisbon directory uses. Your search shows as a removable chip.",

  "changelog.entries.your-sort-and-your-location-both-count.title":
    "Your sort and your location both count",
  "changelog.entries.your-sort-and-your-location-both-count.body":
    "Your location no longer discards your sort. By neighbourhood orders by closeness, A to Z stays alphabetical with a walking time on each card.",

  "changelog.entries.one-line-of-controls-on-the-directory.title":
    "One line of controls on the directory",
  "changelog.entries.one-line-of-controls-on-the-directory.body":
    "The business directory's controls share one line now. Sort moved inside Refine, and everything narrowing the list shows as removable chips under the search row.",

  "changelog.entries.an-empty-partner-roster-says-so.title":
    "An empty partner roster says so",
  "changelog.entries.an-empty-partner-roster-says-so.body":
    "With no approved partners yet, the Partners page now says so plainly and offers a button straight to the partner application. The promise of a roster appears once there is one.",

  "changelog.entries.the-tag-filter-opens-in-line.title":
    "The tag filter opens in line",
  "changelog.entries.the-tag-filter-opens-in-line.body":
    "Tags on the communities page now open in line under the button, showing all 53 at once. On phones the tray keeps its own scroll.",

  "changelog.entries.pages-that-get-to-the-point.title":
    "Pages that get to the point",
  "changelog.entries.pages-that-get-to-the-point.body":
    "Eleven pages lost the oversized second title and the empty band above it, so the first event, place, face or headline is on screen when the page arrives.",

  "changelog.entries.your-communities-start-at-the-cards.title":
    "Your communities start at the cards",
  "changelog.entries.your-communities-start-at-the-cards.body":
    "The communities page has one header now, carrying the greeting and the My communities and Discover switch. Search, filters and cards follow straight after.",

  // ── 27 Aug 2026 ───────────────────────────────────────────────────────────
  "changelog.entries.unused-uploads-filter.title":
    "Finding uploads nothing points at",
  "changelog.entries.unused-uploads-filter.body":
    "The uploads console can now filter to files nothing on the platform points at, or to files still in use. Reload before deleting: an empty reference set is unverified.",

  // ── 26 Aug 2026 ───────────────────────────────────────────────────────────
  "changelog.entries.guides-appear-once-an-editor-has-checked-them.title":
    "Guides appear once an editor has checked them",
  "changelog.entries.guides-appear-once-an-editor-has-checked-them.body":
    "A guide reaches the index, the library and search only after an editor has read it end to end. An unreviewed page shows the crisis lines instead.",
  "changelog.entries.the-rules-open-without-leaving-the-queue.title":
    "The moderation rules open without leaving the queue",
  "changelog.entries.the-rules-open-without-leaving-the-queue.body":
    "The hard lines and where the platform stands now open in a dialog over the moderation queue: a short digest, with a button through to the full page.",
  "changelog.entries.reporting-that-someone-outed-you.title":
    "Reporting that someone outed you",
  "changelog.entries.reporting-that-someone-outed-you.body":
    "Outing and doxxing are now report reasons, on the main form and on a listing's public questions, and both go straight to the emergency queue.",
  "changelog.entries.a-quieter-option-before-you-go.title":
    "A quieter option before you delete your account",
  "changelog.entries.a-quieter-option-before-you-go.body":
    "The strip beside deactivating and deleting now takes you to your notification settings, where you can pick which kinds reach you and set quiet hours.",
  "changelog.entries.a-refused-moderation-action-says-why.title":
    "Moderators are told why an action was refused",
  "changelog.entries.a-refused-moderation-action-says-why.body":
    "When a sanction has no single person to land on, an unclaimed listing or an erased account, moderators now see which case it is and what to do next.",
  "changelog.entries.the-decision-sample-says-who-decided.title":
    "The decision sample says who made each call",
  "changelog.entries.the-decision-sample-says-who-decided.body":
    "The sample of recent invite decisions now names the reviewer behind each call, your own read as You, and you can narrow it to one person.",
  "changelog.entries.communities-your-connections-already-joined.title":
    "Communities your people are already in",
  "changelog.entries.communities-your-connections-already-joined.body":
    "The communities page now shows a short list of groups your connections have joined without you, ordered by how many of them are in each.",
  "changelog.entries.follow-your-listing-claim.title":
    "Follow your listing claim from start to finish",
  "changelog.entries.follow-your-listing-claim.body":
    "There is now a page for your business listing claims: where each one stands, how long it has waited, and the date we said we would decide by.",
  "changelog.entries.the-accessibility-statement-is-published.title":
    "The accessibility statement is published",
  "changelog.entries.the-accessibility-statement-is-published.body":
    "The accessibility statement is published, linked from the footer and main navigation. It covers screen readers, keyboards and reduced motion, and says what has not been audited.",
  "changelog.entries.the-privacy-policy-says-what-it-keeps.title":
    "The privacy policy says what it keeps, and for how long",
  "changelog.entries.the-privacy-policy-says-what-it-keeps.body":
    "Retention is now a full schedule: each kind of data and when it stops being kept. Ten service providers are named, and every right links to where you exercise it.",
  "changelog.entries.what-we-said-we-would-delete-gets-deleted.title":
    "What we said we'd delete now gets deleted",
  "changelog.entries.what-we-said-we-would-delete-gets-deleted.body":
    "Access needs, dietary notes and check-ins are cleared 30 days after a gathering. Your RSVP stays, so the headcount survives. Export links expire after seven days.",
  "changelog.entries.reporting-says-why-it-is-slowing-you-down.title":
    "Reporting says why it's slowing you down",
  "changelog.entries.reporting-says-why-it-is-slowing-you-down.body":
    "Filing several reports quickly now says plainly that it is pausing you for a moment, and why. A raw technical error message is fixed too.",
  "changelog.entries.bulk-invite-decisions-ask-before-they-fire.title":
    "Bulk decisions on invite requests ask before they fire",
  "changelog.entries.bulk-invite-decisions-ask-before-they-fire.body":
    "Approving or waitlisting a batch of invite requests now asks first. When part of a batch fails, you see which applicant and why, and those stay selected for a retry.",
  "changelog.entries.decision-sampling-sits-with-the-queue.title":
    "Decision sampling sits with the queue it samples",
  "changelog.entries.decision-sampling-sits-with-the-queue.body":
    "The sample of recent invite decisions has moved from an admin-only page onto the invite request queue itself, where the people doing the reviewing can read it.",
  "changelog.entries.every-moderation-queue-reports-its-health.title":
    "Every moderation queue reports its own health",
  "changelog.entries.every-moderation-queue-reports-its-health.body":
    "A new panel shows how deep each moderation queue is, the longest wait, and what is past a published window. Staff get an in-app notice when a queue crosses a threshold.",
  "changelog.entries.housekeeping-the-mailer-and-two-dead-ends.title":
    "Housekeeping: the mailer, and two dead ends",
  "changelog.entries.housekeeping-the-mailer-and-two-dead-ends.body":
    "The transactional mailer that briefly existed in the backend is gone, in line with QueerPulse sending no email. The retired event prototype page went with it.",

  "changelog.entries.the-about-page-shows-its-work-in-place.title":
    "The About page shows its work in place",
  "changelog.entries.the-about-page-shows-its-work-in-place.body":
    "Reference links on the About page now open a dialog over it: a digest of the clause, guide or record they point at, with a button to the full page.",
  "changelog.entries.perks-that-grant-something-real.title":
    "Perks that grant something real",
  "changelog.entries.perks-that-grant-something-real.body":
    "Perks you can reach are now claimable, and a claimed invite perk really does raise your monthly invite allowance. Perks the platform could not honour have left the page.",
  "changelog.entries.renew-your-card-before-it-runs-out.title":
    "Renew your card before it runs out",
  "changelog.entries.renew-your-card-before-it-runs-out.body":
    "When your community allows it, you can renew a membership card yourself from your account. You also get an in-app notice thirty days before a card's term ends.",
  "changelog.entries.volunteering-that-counts.title":
    "Volunteering that counts",
  "changelog.entries.volunteering-that-counts.body":
    "Whoever posted the opportunity can now confirm you turned up and record the hours. Confirmed sessions earn recognition points, and your total sits on the volunteering page.",
  "changelog.entries.support-offers-a-community-receives.title":
    "Support offers a community receives",
  "changelog.entries.support-offers-a-community-receives.body":
    "An offer of help from the team now reaches the community. The people who run it get a notification and can accept or decline in Mod tools.",
  "changelog.entries.see-how-often-your-cards-are-checked.title":
    "See how often your cards are checked",
  "changelog.entries.see-how-often-your-cards-are-checked.body":
    "If your community issues membership cards, Mod tools now shows how many times each has been checked. Who checked and where is never recorded.",
  "changelog.entries.check-what-happened-to-your-invite-request.title":
    "You can check what happened to your invite request",
  "changelog.entries.check-what-happened-to-your-invite-request.body":
    "Sending an invite request now gives you a reference code. Enter it any time to see where things stand, with your invite link waiting there if it is a yes.",
  "changelog.entries.an-invite-you-can-address-to-a-person.title":
    "An invite you can address to one person",
  "changelog.entries.an-invite-you-can-address-to-a-person.body":
    "An invite can now carry the email address of the person it is for, so only someone signing in with that address can use it. Left blank, it works for anyone.",
  "changelog.entries.your-invites-are-where-you-can-find-them.title":
    "Your invites are where you would look for them",
  "changelog.entries.your-invites-are-where-you-can-find-them.body":
    "Your account menu now has an Invite someone row with what you have left this month, and your profile says when the allowance resets. Sent invites show who each was for.",
  "changelog.entries.account-security-has-a-real-home.title":
    "Account security has a real home",
  "changelog.entries.account-security-has-a-real-home.body":
    "Security in your settings now opens a page about your account: how you sign in, which sessions and devices are active, and where to download or delete your data.",
  "changelog.entries.your-photos-come-with-your-export.title":
    "Your photos come with your data export",
  "changelog.entries.your-photos-come-with-your-export.body":
    "Every file you have uploaded now travels inside the archive, with an index saying what each one is. Choose the CSV or Both format to get the files themselves.",
  "changelog.entries.every-page-announces-itself.title":
    "Every page announces itself to a screen reader",
  "changelog.entries.every-page-announces-itself.body":
    "Each page now says its name on arrival and puts you at the start of the content. The admin and sign-in layouts gained a skip link.",
  "changelog.entries.the-contact-form-reaches-a-person.title":
    "The contact form reaches a person",
  "changelog.entries.the-contact-form-reaches-a-person.body":
    "Contact, partnership, grant, suggestion and Culture submissions now land in one console the team works through, with a record of who picked each one up and when.",
  "changelog.entries.an-approved-invite-can-be-found-again.title":
    "An approved invite can be found again",
  "changelog.entries.an-approved-invite-can-be-found-again.body":
    "Decided requests now have their own tab, with the invite link kept alongside, its expiry shown, and a way to reissue one that ran out.",
  "changelog.entries.no-stock-photo-on-a-real-application.title":
    "No stock photo on a real application",
  "changelog.entries.no-stock-photo-on-a-real-application.body":
    "Admin screens were matching people by name against sample photos from our demo. Anywhere real people are listed now uses their own picture, or their initials when they have none.",

  "changelog.entries.the-transparency-report-is-published.title":
    "The transparency report is published",
  "changelog.entries.the-transparency-report-is-published.body":
    "Every quarter the transparency report publishes what was reported and why, how long decisions took, and what actions followed. Small counts are withheld so no figure leads back to a person.",
  "changelog.entries.a-permanent-ban-needs-two-moderators.title":
    "A permanent ban now needs a second moderator",
  "changelog.entries.a-permanent-ban-needs-two-moderators.body":
    "Harmful content comes down straight away, and the account decision waits for a second, different moderator to confirm it. If nobody confirms within 72 hours, the hold lapses on its own.",
  "changelog.entries.appeals-have-a-deadline.title":
    "Appeals have a deadline that is measured",
  "changelog.entries.appeals-have-a-deadline.body":
    "You have 14 days to appeal and a decision is due within 7. The queue is sorted by what is due first.",
  "changelog.entries.a-community-ban-can-end.title":
    "A community ban can have an end date",
  "changelog.entries.a-community-ban-can-end.body":
    "Moderators can now set an end date, and you are told the reason, the house rule it rests on, and the day it lifts.",
  "changelog.entries.a-warning-now-reaches-you.title":
    "A warning now actually reaches you",
  "changelog.entries.a-warning-now-reaches-you.body":
    "Warnings used to close silently in the record. If a post, reply, message or comment of yours is warned about, you now hear about it, with the reason attached.",
  "changelog.entries.community-mods-can-read-what-was-reported.title":
    "Community moderators can read what was reported",
  "changelog.entries.community-mods-can-read-what-was-reported.body":
    "Reports now carry the post itself, who wrote it, how urgent it is and when it is due. Urgent reports about outing or personal details go to trained staff instead.",

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

  // ── Accessibility statement (/policies/accessibility) ──────────────────
  // LG-01. A published accessibility statement. QueerPulse publishes it by
  // choice: our reading of Decreto-Lei n.º 82/2022 (the Portuguese
  // transposition of the European Accessibility Act) is that its Article 2(3)
  // service list and its Article 2(5)(b) microenterprise exemption both put
  // this platform outside its scope today. See the `legal.*` keys below and
  // queerpulse-backend/docs/ops/accessibility-legal-basis.md. Every
  // claim below is drawn from something checkable in this repository
  // (eslint.a11y.config.js, scripts/report-a11y.mjs, src/test/a11y.test.tsx,
  // e2e/contrast.spec.ts, docs/production-readiness/contrast-audit.md). Do not
  // add a claim here that nothing in the codebase backs.
  "accessibilityStatement.meta.title": "QueerPulse accessibility statement",
  "accessibilityStatement.meta.description":
    "How accessible QueerPulse is today, measured against WCAG 2.2 Level AA: what we check, what we know falls short, how to report a barrier, and what to do if our answer is not good enough.",
  "accessibilityStatement.title": "Accessibility <em>statement</em>",
  "accessibilityStatement.meta.prepared": "Prepared {date}",
  "accessibilityStatement.meta.reviewed": "Last reviewed {date}",
  "accessibilityStatement.meta.standard": "Measured against {standard}",
  "accessibilityStatement.standard": "WCAG 2.2 Level AA",
  "accessibilityStatement.plain.text":
    "We aim for WCAG 2.2 Level AA and we are partly there. Automated checks run on every build and are held at zero failures. Nobody has yet tested this platform with a screen reader in a session we can point to, and some of our brand colour falls short of the contrast we ask of ourselves. Both are written out below, with a way to tell us what we missed.",

  "accessibilityStatement.commitment.title": "Our commitment",
  "accessibilityStatement.commitment.p1":
    "We publish this because members rely on it. A platform whose whole point is that you can be yourself somewhere has to be usable by all of you, and writing down where we actually are is the only way to be held to that.",
  "accessibilityStatement.commitment.p2":
    "We work to the Web Content Accessibility Guidelines (WCAG) 2.2 at Level AA. EN 301 549, the European accessibility standard, requires Level AA of WCAG 2.1. WCAG 2.2 contains everything in 2.1 and adds to it, so we aim at the newer version.",
  "accessibilityStatement.commitment.p3":
    "We publish this by choice. Our reading of the Portuguese law, set out in the next section, is that nothing currently obliges us to. We would rather be measurable than be exempt.",
  "accessibilityStatement.commitment.p4":
    "Most of what follows is enforced by the build rather than left to good intentions. Where it is not, we say so.",

  "accessibilityStatement.scope.title": "What this statement covers",
  "accessibilityStatement.scope.p1":
    "This statement applies to the QueerPulse web application, including the phone experience and the installable app, which are the same application.",
  "accessibilityStatement.scope.p2":
    "Cinema, Studio and Culture are excluded. None of them has launched, each resolves to a plain not-launched page, and there is no content behind them to make accessible yet. This statement will be extended to cover each one on the day it opens.",
  "accessibilityStatement.scope.p3":
    "What members write and upload belongs to them. We provide the fields and the prompts that let someone describe an image or spell out how to get into a venue. We cannot promise that every member fills them in.",

  "accessibilityStatement.legal.title": "Where the law stands",
  "accessibilityStatement.legal.p1":
    "Portugal transposed the European Accessibility Act, Directive (EU) 2019/882, as <lei>Decreto-Lei n.º 82/2022</lei>. It came into force on 7 December 2022 and applies to services provided from 28 June 2025. Two things in it mean it very likely does not reach QueerPulse today.",
  "accessibilityStatement.legal.services":
    "<strong>The list of services it covers.</strong> Article 2(3) names electronic communications; access to audiovisual media services; specified parts of air, bus, rail and waterborne passenger transport; interactive transport terminals; consumer banking and financial services; e-books and their dedicated software; e-commerce services; and the handling of 112 emergency calls. A non-commercial community platform is on none of those lists. The only heading it could fall under is e-commerce, and QueerPulse has no payment processor of any kind and takes no money from anyone.",
  "accessibilityStatement.legal.microenterprise":
    "<strong>The microenterprise exemption.</strong> Article 2(5)(b) says the decree-law does not apply to microenterprises providing the services in Article 2(3). A microenterprise, in the definition the decree-law takes from the Directive, employs fewer than 10 people and has an annual turnover or annual balance sheet total of no more than 2 million euros.",
  "accessibilityStatement.legal.p2":
    "Paid ticketing on gatherings is an open product question here. If QueerPulse ever sells anything, it plausibly becomes an e-commerce service under Article 2(3)(g). Article 13(2)(b) would then ask us to explain publicly, in writing and orally, how the service meets the applicable accessibility requirements, unless the microenterprise exemption still covered us. We write that down as a trigger to go and check, and we make no prediction about what the answer would be.",
  "accessibilityStatement.legal.p3":
    "The accessibility statement most people have in mind comes from a different law. The Web Accessibility Directive, (EU) 2016/2102, transposed here as Decreto-Lei n.º 83/2018, binds public sector bodies. QueerPulse is not one.",
  "accessibilityStatement.legal.disclaimerLabel": "Not legal advice",
  "accessibilityStatement.legal.disclaimer":
    "This section is a summary of how the people who run QueerPulse read the law as it applies to us. No lawyer has reviewed it, it is not legal advice, and you should not rely on it for your own situation. If you think we have read it wrong, tell us and we will go and check.",

  "accessibilityStatement.status.title": "Conformance status",
  "accessibilityStatement.status.p1":
    "QueerPulse is <strong>partially conformant</strong> with WCAG 2.2 Level AA. Partially conformant means most of the standard is met and some parts are not. The parts we know fall short are listed further down, by name.",
  "accessibilityStatement.status.p2":
    "We hold no accessibility certification and we claim none. No external auditor has assessed this platform.",

  "accessibilityStatement.works.title": "What works today",
  "accessibilityStatement.works.intro":
    "Each of these is in the product now and has a check behind it that would fail the build if it were removed.",
  "accessibilityStatement.works.keyboard":
    "<strong>Keyboard.</strong> Every page opens with a skip-to-content link that jumps past the navigation, and anything you can reach with Tab draws a visible focus outline. That outline is drawn in two tones so it stays visible on our light pages and on our dark panels alike: 5.38:1 on the cream background, 12.6:1 on plum.",
  "accessibilityStatement.works.dialogs":
    "<strong>Dialogs.</strong> Opening a dialog moves focus into it, Tab stays inside it, Escape closes the topmost one, and closing returns focus to the control that opened it.",
  "accessibilityStatement.works.forms":
    "<strong>Forms.</strong> Every visible label is tied to its control, error text is announced and linked to the field it belongs to, helper text is announced with the field, and required fields are marked for screen readers as well as for the eye.",
  "accessibilityStatement.works.landmarks":
    "<strong>Structure and navigation.</strong> Each page carries exactly one main landmark. A test asserts that directly on the homepage, and the axe pass enforces the same rule across the other ten pages it covers. Pages outside those eleven are unchecked. Moving between pages announces the new page and lands focus in its content, which a single-page application does not do on its own.",
  "accessibilityStatement.works.motion":
    "<strong>Motion.</strong> When your device asks for reduced motion, animation and smooth scrolling switch off across the whole interface. Settings also carries a Reduce motion switch for anyone whose device says otherwise.",
  "accessibilityStatement.works.status":
    "<strong>Status messages.</strong> Confirmations are announced politely and failures interrupt, so an error is hard to miss.",
  "accessibilityStatement.works.language":
    "<strong>Language.</strong> The page declares its language and updates it when you switch between English and Portuguese, so a screen reader reads it in the right voice.",

  "accessibilityStatement.shortfalls.title": "What is not fully accessible",
  "accessibilityStatement.shortfalls.intro":
    "These are the shortfalls we know about. Each names the reason and whatever alternative exists today. If you hit something that is not on this list, please tell us, because it means we did not know.",
  "accessibilityStatement.shortfalls.colour":
    "<strong>Our coral, used for emphasis.</strong> Measured against our cream page background it reaches 2.63:1, and against white 2.91:1, below the 4.5:1 that Level AA asks for body text. Emphasised words are always italic too, so the colour is never the only signal. Wherever the colour carries meaning you have to read, such as a form error, a required-field mark or a success line, we use darker coral and jade variants that pass. The sweep across the rest of the interface has not been done.",
  "accessibilityStatement.shortfalls.preferences":
    "<strong>Accessibility settings that do nothing yet.</strong> The Accessibility section of Settings lists high contrast, larger text, a dyslexia-friendly typeface, wider letter spacing, stronger focus rings, larger touch targets and a colour theme. Every one of those is labelled Coming soon and is switched off in the interface, so it cannot report a change we do not make. Two controls there are real: Reduce motion and the skip-to-content link.",
  "accessibilityStatement.shortfalls.textSize":
    "<strong>Text sizing.</strong> Type is set in pixels throughout, so changing your browser's default font size does not resize it. Browser and system zoom work normally and the layout reflows down to phone widths. The text-size control in Settings is one of the Coming soon ones.",
  "accessibilityStatement.shortfalls.focusAfterError":
    "<strong>Focus after a failed submit.</strong> A helper that moves focus to the first field with an error exists and is wired into one form so far. Everywhere else the error is still announced and still linked to its field, and focus stays where you left it.",
  "accessibilityStatement.shortfalls.sample":
    "<strong>Automated checks cover a sample of pages.</strong> The test suite runs axe-core over eleven representative pages and the colour-contrast pass runs in a real browser over six. The application has around 140 page components, so most pages have never been machine-checked one by one. The sample was chosen to cover the shared building blocks, which is where most defects live.",
  "accessibilityStatement.shortfalls.assistiveTech":
    "<strong>No assistive-technology testing on record.</strong> No screen reader, switch device or voice-control session has been run through this platform and written down. Automated tools find a minority of accessibility problems, so this is the largest gap in what we know, and closing it is the next thing on this list.",
  "accessibilityStatement.shortfalls.pdf":
    "<strong>One downloadable PDF.</strong> The press kit offers a printable brand reference as a PDF, and it has not been checked for tagging or reading order. The same colour values ship beside it as a plain text file, which any assistive technology reads correctly.",
  "accessibilityStatement.shortfalls.language":
    "<strong>Two interface languages.</strong> The interface is available in English and Portuguese. Anything a member or an editor writes stays in the language they wrote it in, and we do not translate it.",

  "accessibilityStatement.prepared.title": "How this statement was prepared",
  "accessibilityStatement.prepared.p1":
    "This is a self-assessment, prepared by the people who build QueerPulse from the accessibility tooling in the codebase and the written audits kept beside it. No external body was involved and no user testing informed it.",
  "accessibilityStatement.prepared.lint":
    "<strong>Lint rules that block the build.</strong> Every accessibility rule from eslint-plugin-jsx-a11y runs over the whole codebase. Nine are hard errors, covering text alternatives for images, valid ARIA attributes and roles, and labels tied to their controls. The rest are held to a budget of zero warnings by a check that runs first in the build, so a single new warning anywhere fails it.",
  "accessibilityStatement.prepared.axe":
    "<strong>axe-core in the test suite.</strong> Eleven representative pages are rendered through the real router and scanned with axe-core, with nothing quarantined and no rule suppressed except the one a headless renderer cannot compute.",
  "accessibilityStatement.prepared.contrast":
    "<strong>Colour-contrast measurement.</strong> Every colour pair the interface actually renders was computed against the WCAG formula rather than judged by eye, written up, and either fixed or given a variant that passes. A browser-based contrast pass over six pages guards against regressions.",
  "accessibilityStatement.prepared.p2":
    "Automated tools catch a minority of accessibility problems, commonly put at somewhere between a third and a half. Everything a machine cannot see, and the whole question of whether this platform is genuinely usable with a screen reader, remains unverified. That is why the next section matters more than the two above it.",

  "accessibilityStatement.feedback.title": "Tell us about a barrier",
  "accessibilityStatement.feedback.p1":
    "If something here blocks you, tell us. You do not need an account and you do not need to know why it is broken. Describe what you were trying to do and what happened instead, and name the page if you can.",
  "accessibilityStatement.feedback.p2":
    "Use the contact form and pick <strong>Accessibility</strong> as the topic. The message is stored for the people who run the platform, who read every one.",
  "accessibilityStatement.feedback.p3":
    "QueerPulse sends no automatic email, so any reply is written by a person to the address you give us. We aim to answer within {days} working days. If your report is about something that is keeping you out of your own account, say so and it moves to the front.",
  "accessibilityStatement.feedback.cta": "Report an access barrier",

  "accessibilityStatement.enforcement.title": "If our answer is not enough",
  "accessibilityStatement.enforcement.p1":
    "If we do not reply, or the reply leaves the barrier standing, here is where to go next, in the order that is most likely to help you.",
  "accessibilityStatement.enforcement.tellUs":
    "<strong>Tell us first.</strong> The contact form on the Accessibility topic stores your report for the people who run the platform, and it is the fastest route to getting the barrier looked at. Everything below assumes that route has already failed you.",
  "accessibilityStatement.enforcement.idipd":
    "<strong>IDiPD.</strong> The Instituto para os Direitos das Pessoas com Deficiência, I. P. is the Portuguese body that follows the implementation of Decreto-Lei 82/2022 and promotes the rights of disabled people. Article 36 also makes it the body that forwards complaints sent to it directly on to whichever regulator is responsible. It was called the Instituto Nacional para a Reabilitação, I. P. until Decreto-Lei n.º 60/2026 renamed it. Its contact details live on <idipd>its own site</idipd>, where they stay current.",
  "accessibilityStatement.enforcement.regulator":
    "<strong>The sectoral regulator, if we ever fall under Article 28.</strong> Decreto-Lei 82/2022 gives enforcement to a different regulator for each category of service rather than to one accessibility body. E-commerce services fall to ANACOM. As set out above, we do not believe QueerPulse is a service the decree-law currently covers, so this route may well not be open to you today. We would rather say that plainly than send you to a regulator who has to turn you away.",
  "accessibilityStatement.enforcement.p2":
    "None of this replaces the courts or any other right you hold. If you want to complain and you are not sure where to start, IDiPD is the right first door.",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // PRD-36 — PRD-36 - 'Message this business' on a directory listing: the contact-row affordance, its unavailable reasons, and the private enquiry composer. Sits under the existing marketing:directory.detail.* copy alongside claim/questions. PT follows the catalog's own terminology: a listing is a 'ficha', the business is 'negocio', the venue is 'espaco'.
  // PRD-36b — PRD-36b. Told to the member BEFORE the composer opens, from GET /directory/:slug/contact. A cap is not the business being unreachable, so the copy says the member has already written rather than that the place has gone, and it never states or implies that anything is emailed. {when} is Intl.RelativeTimeFormat output ('in 20 hours' / 'dentro de 20 horas'), rounded up so the sentence never promises a moment earlier than the truth. The clearsIn line is appended only when there is a real future instant to give.
  // PRD-37 — PRD-37. The partner-application success screen and the form's 'what happens next' tip both promised 'we'll be in touch', which QueerPulse cannot keep: the platform sends no email and never will. All three keys ALREADY EXIST in en/marketing.ts and pt/marketing.ts. These are REPLACEMENT VALUES for those existing keys, not new keys, and no key is added or removed. Approving or rejecting a partner application now emits a decision notification, and the applicant can read the outcome on their submissions page, so the copy points at those two places instead of at an inbox.
  "directory.detail.enquiry.cta": "Message this business",
  "directory.detail.enquiry.deliveryNote":
    "It arrives as a direct message from your account, and only the people who run this listing can read it.",
  "directory.detail.enquiry.replyNote":
    "Your first message gets through. A reply from either side needs an accepted connection.",
  "directory.detail.enquiry.existingThreadCta":
    "Open the conversation you already have",
  "directory.detail.enquiry.signInPrompt":
    "Signed-in members can write to a business here, without handing over a phone number or an email address.",
  "directory.detail.enquiry.signInCta": "Sign in",
  "directory.detail.enquiry.loadErrorTitle":
    "We could not check whether this business can be messaged",
  "directory.detail.enquiry.loadErrorBody":
    "The rest of the listing is fine. Only this one check did not come back.",
  "directory.detail.enquiry.unavailable.unclaimed":
    "Nobody has claimed this listing yet, so there is no business inbox behind it. If you run {name}, claim the listing and members will be able to reach you here.",
  "directory.detail.enquiry.unavailable.noAccount":
    "This listing is not attached to an account that can receive messages, so the contact details above are the way to reach it.",
  "directory.detail.enquiry.unavailable.ownListing":
    "This listing is yours, so there is nobody here for you to write to.",
  "directory.detail.enquiry.unavailable.blocked":
    "This business cannot be reached from your account.",
  "directory.detail.enquiry.ariaLabel": "Write to {name}",
  "directory.detail.enquiry.eyebrow": "Private message",
  "directory.detail.enquiry.title": "Write to <em>{name}</em>",
  "directory.detail.enquiry.sub":
    "This goes to the people who run this listing as a direct message from your account. It is not published anywhere on the listing.",
  "directory.detail.enquiry.replyNotice":
    "You are not connected yet, so this first message gets through and the thread then stays closed to both of you until one of you accepts a connection.",
  "directory.detail.enquiry.bodyLabel": "Your message",
  "directory.detail.enquiry.bodyPlaceholder":
    "What would you like to ask them?",
  "directory.detail.enquiry.bodyHint": "At least {min} characters.",
  "directory.detail.enquiry.charactersLeft": "Characters left: {remaining}",
  "directory.detail.enquiry.cancel": "Cancel",
  "directory.detail.enquiry.submit": "Send message",
  "directory.detail.enquiry.submitting": "Sending",
  "directory.detail.enquiry.error.rateLimited":
    "You have already written to this business today. Give them a chance to reply first.",
  "directory.detail.enquiry.error.notAllowed":
    "This business cannot be reached from your account.",
  "directory.detail.enquiry.error.unavailable":
    "This listing can no longer be messaged through QueerPulse. Try the contact details on the page.",
  "directory.detail.enquiry.error.gone":
    "This listing is no longer available, so your message was not sent.",
  "directory.detail.enquiry.error.generic":
    "Your message did not send. Try again in a moment.",
  "directory.detail.enquiry.successAriaLabel":
    "Your message to {name} was sent",
  "directory.detail.enquiry.successTitle": "Message",
  "directory.detail.enquiry.successEm": "sent",
  "directory.detail.enquiry.successBody":
    "It is in the inbox of whoever runs {name}, as a direct message from you.",
  "directory.detail.enquiry.successReplyStep":
    "You are not connected yet, so the thread stays closed to both of you until one of you accepts a connection.",
  "directory.detail.enquiry.openThreadCta": "Open the conversation",
  "directory.detail.enquiry.doneCta": "Done",
  "directory.detail.enquiry.limit.thisBusiness":
    "You have already written to {name} today. Give them a chance to reply before writing again.",
  "directory.detail.enquiry.limit.directory":
    "You have written to a lot of businesses today, so this is paused for now.",
  "directory.detail.enquiry.limit.clearsIn": "You can write again {when}.",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // PRD-36 — PRD-36 - 'Message this business' on a directory listing: the contact-row affordance, its unavailable reasons, and the private enquiry composer. Sits under the existing marketing:directory.detail.* copy alongside claim/questions. PT follows the catalog's own terminology: a listing is a 'ficha', the business is 'negocio', the venue is 'espaco'.
  // PRD-36b — PRD-36b. Told to the member BEFORE the composer opens, from GET /directory/:slug/contact. A cap is not the business being unreachable, so the copy says the member has already written rather than that the place has gone, and it never states or implies that anything is emailed. {when} is Intl.RelativeTimeFormat output ('in 20 hours' / 'dentro de 20 horas'), rounded up so the sentence never promises a moment earlier than the truth. The clearsIn line is appended only when there is a real future instant to give.
  // PRD-37 — PRD-37. The partner-application success screen and the form's 'what happens next' tip both promised 'we'll be in touch', which QueerPulse cannot keep: the platform sends no email and never will. All three keys ALREADY EXIST in en/marketing.ts and pt/marketing.ts. These are REPLACEMENT VALUES for those existing keys, not new keys, and no key is added or removed. Approving or rejecting a partner application now emits a decision notification, and the applicant can read the outcome on their submissions page, so the copy points at those two places instead of at an inbox.

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // COORD-CHANGELOG — COORD - deep-scan section 13 (the vertical surfaces), the member-facing half.
  // PRD-36 — PRD-36 - 'Message this business' on a directory listing: the contact-row affordance, its unavailable reasons, and the private enquiry composer. Sits under the existing marketing:directory.detail.* copy alongside claim/questions. PT follows the catalog's own terminology: a listing is a 'ficha', the business is 'negocio', the venue is 'espaco'.
  // PRD-36b — PRD-36b. Told to the member BEFORE the composer opens, from GET /directory/:slug/contact. A cap is not the business being unreachable, so the copy says the member has already written rather than that the place has gone, and it never states or implies that anything is emailed. {when} is Intl.RelativeTimeFormat output ('in 20 hours' / 'dentro de 20 horas'), rounded up so the sentence never promises a moment earlier than the truth. The clearsIn line is appended only when there is a real future instant to give.
  // PRD-37 — PRD-37. The partner-application success screen and the form's 'what happens next' tip both promised 'we'll be in touch', which QueerPulse cannot keep: the platform sends no email and never will. All three keys ALREADY EXIST in en/marketing.ts and pt/marketing.ts. These are REPLACEMENT VALUES for those existing keys, not new keys, and no key is added or removed. Approving or rejecting a partner application now emits a decision notification, and the applicant can read the outcome on their submissions page, so the copy points at those two places instead of at an inbox.
  "changelog.entries.take-down-your-flatmate-profile.title":
    "You can take down your flatmate profile",
  "changelog.entries.take-down-your-flatmate-profile.body":
    "The profile editor now has a take-down button. Your profile, the likes and any match disappear, and the conversations you already started stay in Messages.",
  "changelog.entries.message-a-business-without-leaving.title":
    "You can write to a business from its page",
  "changelog.entries.message-a-business-without-leaving.body":
    "You can now write to a business from its own page. Before you type, it tells you whether the owner is reachable and whether you already wrote today.",
  "changelog.entries.remove-a-photo-from-a-gathering-album.title":
    "You can remove a photo from a gathering album",
  "changelog.entries.remove-a-photo-from-a-gathering-album.body":
    "The person who posted a photo and the organiser can now remove it from the album, by keyboard or by touch. Removing it deletes the file from storage as well.",
  "changelog.entries.your-own-jobs-and-a-way-to-correct-them.title":
    "The jobs you posted, and a way to correct them",
  "changelog.entries.your-own-jobs-and-a-way-to-correct-them.body":
    "There is now a page listing the jobs you posted, with the applications, the close button and an edit form on each one. Housing and volunteering already worked this way.",
  "changelog.entries.your-own-swap-board.title":
    "Your own swap board, and word back on what you proposed",
  "changelog.entries.your-own-swap-board.body":
    "One page now holds the swaps you posted, with edit and close, and the proposals you sent with what was decided.",
  "changelog.entries.one-place-for-everything-you-have-sent.title":
    "One place for everything you have sent us",
  "changelog.entries.one-place-for-everything-you-have-sent.body":
    "A single page under your account lists every partnership application, swap proposal and resource suggestion you sent, and what happened to it. Decisions reach your notifications.",
  "changelog.entries.employers-and-listers-can-answer-a-review.title":
    "Employers and housing listers can answer a review",
  "changelog.entries.employers-and-listers-can-answer-a-review.body":
    "Employers and housing listers can now reply once, publicly, labelled as the subject of the review. The page says when a review was edited after its reply.",
  "changelog.entries.register-interest-in-a-commission.title":
    "You can register interest in a commission",
  "changelog.entries.register-interest-in-a-commission.body":
    "You can now register what you would like commissioned and who you would like to work with. It lands in a queue a person reads.",
  "changelog.entries.the-nav-says-what-is-still-being-built.title":
    "The menu says what is still being built",
  "changelog.entries.the-nav-says-what-is-still-being-built.body":
    "Cinema and Studio stay in the Culture menu with a quiet marker saying they are still being built. The highlight moved to what works today.",
  "changelog.entries.search-stops-offering-what-it-cannot-find.title":
    "Search stops offering what it cannot find",
  "changelog.entries.search-stops-offering-what-it-cannot-find.body":
    "Search now shows only the tabs for areas that are actually open, so the Jobs tab waits until the work area does.",
  "changelog.entries.a-hidden-review-stays-hidden.title":
    "A hidden review stays hidden from the person it is about",
  "changelog.entries.a-hidden-review-stays-hidden.body":
    "A review hidden by a moderator is now withheld from the person it was about too, in their own visit history, and a lister cannot reply to it.",
  "changelog.entries.erasing-your-account-keeps-what-others-rely-on.title":
    "Erasing your account keeps what other people rely on",
  "changelog.entries.erasing-your-account-keeps-what-others-rely-on.body":
    "Erasing your account now takes your name off your contributions and keeps the images they belong to, so other people's pages stay whole. Unused images are still deleted.",
  "changelog.entries.an-anonymous-owner-stays-anonymous.title":
    "An anonymous business owner stays anonymous",
  "changelog.entries.an-anonymous-owner-stays-anonymous.body":
    "When an owner answers a public question, the notification names them only if the page already does. Past notifications had the name and photo stripped.",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // COORD-CHANGELOG-2 — COORD - the six decisions taken after the section 13 build, the member-facing half.
  // COORD-CHANGELOG — COORD - deep-scan section 13 (the vertical surfaces), the member-facing half.
  // COORD-FORORGS — COORD - the /about/for-organisations inquiry form. The promise of a personal reply in 5 working days is TRUE: a person answers from hello@queerpulse.com, out of band. What the copy did not say was by WHAT CHANNEL, on a platform that sends no automated email, so somebody could sit waiting on a notification that will never come. It now names the channel, the sending address and the address it goes to. The error state named no address to fall back to, which was a dead end; it names one now.
  // PRD-36 — PRD-36 - 'Message this business' on a directory listing: the contact-row affordance, its unavailable reasons, and the private enquiry composer. Sits under the existing marketing:directory.detail.* copy alongside claim/questions. PT follows the catalog's own terminology: a listing is a 'ficha', the business is 'negocio', the venue is 'espaco'.
  // PRD-36b — PRD-36b. Told to the member BEFORE the composer opens, from GET /directory/:slug/contact. A cap is not the business being unreachable, so the copy says the member has already written rather than that the place has gone, and it never states or implies that anything is emailed. {when} is Intl.RelativeTimeFormat output ('in 20 hours' / 'dentro de 20 horas'), rounded up so the sentence never promises a moment earlier than the truth. The clearsIn line is appended only when there is a real future instant to give.
  // PRD-37 — PRD-37. The partner-application success screen and the form's 'what happens next' tip both promised 'we'll be in touch', which QueerPulse cannot keep: the platform sends no email and never will. All three keys ALREADY EXIST in en/marketing.ts and pt/marketing.ts. These are REPLACEMENT VALUES for those existing keys, not new keys, and no key is added or removed. Approving or rejecting a partner application now emits a decision notification, and the applicant can read the outcome on their submissions page, so the copy points at those two places instead of at an inbox.
  "changelog.entries.the-app-icon-is-now-the-pulse-dot.title":
    "The app icon is now the pulse dot",
  "changelog.entries.the-app-icon-is-now-the-pulse-dot.body":
    "The app icon, favicon, launch screens and press kit now carry the coral pulse dot. If the old bolt lingers, remove the installed app and add it again.",
  "changelog.entries.the-install-tip-now-opens-the-steps-in-place.title":
    "The install tip now opens the steps in place",
  "changelog.entries.the-install-tip-now-opens-the-steps-in-place.body":
    "On a phone the install card is one tap target: tapping it opens your device's steps in a panel over the page. Android can also show an Install button.",
  "changelog.entries.a-community-page-now-fits-a-phone-screen.title":
    "A community page now fits a phone screen",
  "changelog.entries.a-community-page-now-fits-a-phone-screen.body":
    "On a phone the Share box gives the text field full width, with attach and Share on their own line, and the six tabs swipe sideways on one strip.",
  "changelog.entries.the-installed-app-opens-in-one-motion.title":
    "The installed app opens in one motion",
  "changelog.entries.the-installed-app-opens-in-one-motion.body":
    "The launch screen now opens on exactly the picture your phone just showed, and the icon shrinks into the pulse while the wordmark and greeting arrive around it.",
  "changelog.entries.opening-the-installed-app-no-longer-flashes-the-homepage.title":
    "Opening the installed app no longer flashes the homepage",
  "changelog.entries.opening-the-installed-app-no-longer-flashes-the-homepage.body":
    "The ground stays plum from the moment the icon opens until you land in the app, so the split-second flash of the public landing page is gone.",
  "changelog.entries.the-installed-app-now-opens-on-your-feed.title":
    "The installed app now opens on your feed",
  "changelog.entries.the-installed-app-now-opens-on-your-feed.body":
    "Opening the installed app while signed in takes you straight to your feed. You can still reach the homepage from inside the app, and signed-out visitors land there.",
  "changelog.entries.text-that-vanished-in-dark-mode-is-back.title":
    "Text that vanished in dark mode is back",
  "changelog.entries.text-that-vanished-in-dark-mode-is-back.body":
    "Small labels that sat near-black on a near-black page now follow the theme: persona card tags, edited and removed markers, card expiry notices.",
  "changelog.entries.the-installed-app-now-opens-on-a-heartbeat.title":
    "The installed app now opens on a heartbeat",
  "changelog.entries.the-installed-app-now-opens-on-a-heartbeat.body":
    "Opening from your home screen now shows the coral mark beating on deep plum, with a hairline tracking the wait, and returning members are greeted by name.",
  "changelog.entries.opening-the-installed-app-no-longer-flashes-a-bare-icon.title":
    "Opening the installed app no longer flashes a bare icon",
  "changelog.entries.opening-the-installed-app-no-longer-flashes-a-bare-icon.body":
    "The screen your phone draws before QueerPulse starts now opens on the app's deep plum instead of cream, and the newest iPhones and iPads have launch images.",
  "changelog.entries.what-you-submit-now-reaches-a-person.title":
    "What you submit now reaches a person",
  "changelog.entries.what-you-submit-now-reaches-a-person.body":
    "A join request, verification request, listing suggestion or pitch now tells a real person the moment it arrives, inside the app, since QueerPulse sends no email.",
  "changelog.entries.every-filter-now-tells-you-how-many-it-would-leave.title":
    "Every filter now tells you how many it would leave",
  "changelog.entries.every-filter-now-tells-you-how-many-it-would-leave.body":
    "The pill filters in the directories now carry a count against your other filters, and go quiet at zero. A pill you already picked stays clickable.",
  "changelog.entries.browse-the-professional-directory-by-profession.title":
    "Browse the professional directory by profession",
  "changelog.entries.browse-the-professional-directory-by-profession.body":
    "You can now filter the professional directory by profession, several at once, each with a count of personas behind it. The controls sit in a Refine drawer beside search.",
  "changelog.entries.personas-named-after-a-craft-now-show-whose-they-are.title":
    "Personas named after a craft now show whose they are",
  "changelog.entries.personas-named-after-a-craft-now-show-whose-they-are.body":
    "A persona still using its craft as a name is now titled owner first, as Tiago Costa | Poet, wherever other people see it. Unlinked personas stay anonymous.",
  "changelog.entries.empty-profile-tabs-say-so.title":
    "Empty profile tabs say so instead of showing a blank page",
  "changelog.entries.empty-profile-tabs-say-so.body":
    "On a phone the About and Community tabs on a profile now say when there is nothing there yet, and on your own profile they offer Edit profile.",
  "changelog.entries.the-professional-directory-is-in-the-main-menu.title":
    "The professional directory is in the main menu",
  "changelog.entries.the-professional-directory-is-in-the-main-menu.body":
    "The professional directory, where members show the work they do, now has a row in the Community menu under People, beside the members directory.",
  "changelog.entries.tag-filters-show-how-many-communities-are-behind-them.title":
    "Tag filters show how many communities are behind them",
  "changelog.entries.tag-filters-show-how-many-communities-are-behind-them.body":
    "Each of the 53 tags now carries a count read against your other filters, and a tag with nothing behind it is dimmed and ignores the click.",
  "changelog.entries.housing-filters-fold-away-until-you-need-them.title":
    "Housing filters fold away until you need them",
  "changelog.entries.housing-filters-fold-away-until-you-need-them.body":
    "The housing filters now sit behind a Refine button, like gatherings and communities. What you applied reads as chips underneath, and each chip removes its own filter.",
  "changelog.entries.empty-category-filters-can-no-longer-be-picked.title":
    "Category filters with nothing behind them are now inactive",
  "changelog.entries.empty-category-filters-can-no-longer-be-picked.body":
    "A category chip reading 0 is now dimmed and ignores the click, its count still readable, and All communities always stays available.",
  "changelog.entries.the-app-follows-your-browsers-text-size.title":
    "The app follows your browser's text size",
  "changelog.entries.the-app-follows-your-browsers-text-size.body":
    "Every size in the app is now measured against your browser's text setting: raise it and the whole interface grows, avatars, count badges and card titles included.",
  "changelog.entries.faint-outlines-are-visible-again-in-dark-mode.title":
    "Faint outlines are visible again in dark mode",
  "changelog.entries.faint-outlines-are-visible-again-in-dark-mode.body":
    "Sixty borders that stayed dark in both themes made card edges and panel outlines all but disappear on a dark page. They now turn cream in dark mode.",
  "changelog.entries.deep-links-no-longer-flash-the-homepage.title":
    "Opening a link no longer flashes the homepage first",
  "changelog.entries.deep-links-no-longer-flash-the-homepage.body":
    "Every page now loads with an empty frame and fills in its own title and description, so link previews describe the page you shared.",
  "changelog.entries.report-one-photo-not-the-whole-gathering.title":
    "You can report one photo, not the whole gathering",
  "changelog.entries.report-one-photo-not-the-whole-gathering.body":
    "Each photo in a gathering album now has its own report control, with outing and doxxing at the top because those reach the one-hour queue.",
  "changelog.entries.report-one-landlord-warning.title":
    "You can report one landlord warning, and a takedown can be undone",
  "changelog.entries.report-one-landlord-warning.body":
    "Each recommendation on a landlord entry now has its own report control, so acting on one complaint leaves the other tenants' warnings up.",
  "changelog.entries.your-landlord-warning-outlives-your-account.title":
    "A warning you wrote about a landlord outlives your account",
  "changelog.entries.your-landlord-warning-outlives-your-account.body":
    "Deleting your account now keeps the landlord recommendations you wrote, with your name off them and the landlord's rating unchanged.",
  "changelog.entries.correct-a-review-until-it-goes-public.title":
    "You can correct a viewing review until it goes public",
  "changelog.entries.correct-a-review-until-it-goes-public.body":
    "Viewing reviews are written blind, and you can now edit yours right up until it goes public. The form shows you the deadline while you write.",

  // ── Deep-scan section 2 (Magazine: the reader), built 2026-09-06 ─────────
  "changelog.entries.a-piece-can-no-longer-go-live-with-consent-unresolved.title":
    "A piece can no longer go live with consent unresolved",
  "changelog.entries.a-piece-can-no-longer-go-live-with-consent-unresolved.body":
    "Publishing now stops if a named subject's consent or the sensitivity read is still open, and it lists what is missing. Taking a piece back down always works.",
  "changelog.entries.the-desk-can-see-what-is-published-and-take-it-down.title":
    "The desk can see what is published, and take it down",
  "changelog.entries.the-desk-can-see-what-is-published-and-take-it-down.body":
    "There is a Published stage now. Publishing moves the piece into it, the piece record links to the live page, and taking something down is one click.",
  "changelog.entries.writers-hear-when-they-are-commissioned-and-when-they-are-published.title":
    "Writers hear when they are commissioned, and when they are published",
  "changelog.entries.writers-hear-when-they-are-commissioned-and-when-they-are-published.body":
    "You now get a notification when a piece is commissioned to you, at each move through the desk, and when it goes live, with a link to it.",
  "changelog.entries.an-issue-dated-for-later-now-ships-on-that-morning.title":
    "An issue dated for later now ships on that morning",
  "changelog.entries.an-issue-dated-for-later-now-ships-on-that-morning.body":
    "Shipping an issue dated ahead now schedules its pieces for 09:00 on that date, and the button tells you which of the two it is about to do.",
  "changelog.entries.shipping-an-issue-holds-back-what-is-not-ready-and-says-why.title":
    "Shipping an issue holds back what is not ready, and says why",
  "changelog.entries.shipping-an-issue-holds-back-what-is-not-ready-and-says-why.body":
    "Shipping now takes only pieces that are ready and pass the same checks the Publish button runs, then lists what it held back and what each one is waiting on.",
  "changelog.entries.an-accepted-story-now-arrives-on-the-desk-as-a-real-piece.title":
    "An accepted story now arrives on the desk as a real piece",
  "changelog.entries.an-accepted-story-now-arrives-on-the-desk-as-a-real-piece.body":
    "Accepting a submitted story now builds the desk record too: your text becomes the draft, you get the writing credit, and the admin row links straight to it.",
  "changelog.entries.your-submitted-stories-page-is-open-to-everyone-who-submitted-one.title":
    "Your submitted stories page is open to everyone who submitted one",
  "changelog.entries.your-submitted-stories-page-is-open-to-everyone-who-submitted-one.body":
    "The page now opens for anyone who has sent a story in, where before it turned almost everyone away at the door. The counts at the top come from your own submissions.",
  "changelog.entries.you-can-withdraw-a-story-you-submitted.title":
    "You can withdraw a story you submitted",
  "changelog.entries.you-can-withdraw-a-story-you-submitted.body":
    "You can pull a story back yourself while the desk is still deciding, and it leaves their queue at once.",
  "changelog.entries.two-editors-can-no-longer-overwrite-each-other-silently.title":
    "Two editors can no longer overwrite each other silently",
  "changelog.entries.two-editors-can-no-longer-overwrite-each-other-silently.body":
    "Every save now records which version it started from. If the draft moved on underneath you, the editor stops, keeps your text on screen, and offers to reload.",
  "changelog.entries.writers-can-read-the-edited-draft-and-refiling-no-longer-doubles-it.title":
    "Writers can read the edited draft, and refiling no longer doubles it",
  "changelog.entries.writers-can-read-the-edited-draft-and-refiling-no-longer-doubles-it.body":
    "You can read the draft as it stands on the desk, start from it, and file again either adding to it or replacing it. Filing the same text twice does nothing.",
  "changelog.entries.a-published-deck-can-no-longer-vanish-from-under-readers.title":
    "A published deck can no longer vanish from under readers",
  "changelog.entries.a-published-deck-can-no-longer-vanish-from-under-readers.body":
    "A live deck has to be taken down before it can be deleted, and one a piece still uses cannot be deleted at all.",
  "changelog.entries.issue-cover-art-can-be-uploaded-from-the-desk.title":
    "Issue cover art can be uploaded from the desk",
  "changelog.entries.issue-cover-art-can-be-uploaded-from-the-desk.body":
    "The issue cover takes an upload now, with the same cropping and preview as every other image in the desk. No more hosting the picture elsewhere and pasting a link.",
  "changelog.entries.the-writer-workspace-reads-in-plain-language.title":
    "The writer workspace reads in plain language",
  "changelog.entries.the-writer-workspace-reads-in-plain-language.body":
    "Dates, payment states and issue numbers now read in words, the way they do everywhere else in the magazine, and a filed draft shows its word count against what was asked for.",
  "changelog.entries.every-story-on-the-magazine-front-now-opens.title":
    "Every story on the magazine front now opens",
  "changelog.entries.every-story-on-the-magazine-front-now-opens.body":
    "Story cards on the magazine front now go straight to the piece, and the old addresses carry the story with them, so a link somebody sent you last year still works.",
  "changelog.entries.articles-show-the-kicker-and-standfirst-the-desk-wrote.title":
    "Articles show what the desk actually wrote above the headline",
  "changelog.entries.articles-show-the-kicker-and-standfirst-the-desk-wrote.body":
    "The kicker, section, dek and standfirst an editor wrote all reach you now, on the article and on every card that links to it.",
  "changelog.entries.issue-pages-show-the-cover-the-desk-chose.title":
    "Issue pages show the cover the desk chose",
  "changelog.entries.issue-pages-show-the-cover-the-desk-chose.body":
    "Each issue now shows its own cover art rather than the same stock photograph, only the newsstand issue is badged as current, and All issues goes to the archive.",
  "changelog.entries.interactive-decks-have-their-own-index.title":
    "Interactive decks have their own index",
  "changelog.entries.interactive-decks-have-their-own-index.body":
    "There is now an index listing every interactive deck, newest first, reachable from the front page and the masthead. Decks can be shared, and a shared link previews with the deck's title.",
  "changelog.entries.magazine-lists-no-longer-stop-at-twenty.title":
    "Magazine lists no longer stop at twenty",
  "changelog.entries.magazine-lists-no-longer-stop-at-twenty.body":
    "Search, tag browse and section browse now page through the whole archive. A writer's All 25 articles opens their real back catalogue.",
  "changelog.entries.the-magazine-now-browses-in-your-language.title":
    "The magazine now browses in your language",
  "changelog.entries.the-magazine-now-browses-in-your-language.body":
    "The front page, search, tag and section browse and your feed now ask for your language, so a piece that exists in Portuguese reaches you in Portuguese.",
  "changelog.entries.long-reads-have-contents-progress-and-a-resume-point.title":
    "Long reads have contents, progress and a place to pick up",
  "changelog.entries.long-reads-have-contents-progress-and-a-resume-point.body":
    "Long articles now carry a contents list built from their own headings, a progress bar, and an offer to pick up where you left off. Sharing opens your phone's own share sheet.",
  "changelog.entries.published-pieces-now-reach-your-feed.title":
    "Published pieces now reach your feed",
  "changelog.entries.published-pieces-now-reach-your-feed.body":
    "Published articles now sit in your feed alongside posts, threads and gatherings, in your language. A piece by somebody you have blocked stays out.",
  "changelog.entries.blocks-and-mutes-now-apply-under-magazine-articles.title":
    "Blocks and mutes now apply under magazine articles",
  "changelog.entries.blocks-and-mutes-now-apply-under-magazine-articles.body":
    "Article comments and replies are now filtered the same way the forum and the feed filter them, blocks, mutes and moderator takedowns included.",
  "changelog.entries.article-comments-page-and-keep-your-paragraphs.title":
    "Article comments page, and keep your paragraphs",
  "changelog.entries.article-comments-page-and-keep-your-paragraphs.body":
    "There is a load-more control on article comments now, the heading counts what it actually counts, and a comment you wrote in paragraphs stays in paragraphs.",
  "changelog.entries.the-submit-form-names-the-issue-that-is-actually-open.title":
    "The submit-story form names the issue that is actually open",
  "changelog.entries.the-submit-form-names-the-issue-that-is-actually-open.body":
    "The form now names the issue the desk is really taking pitches for, shows a deadline only when an editor has set one, and says plainly when nothing is open.",
  "changelog.entries.unshipped-headlines-no-longer-appear-on-issue-pages.title":
    "Unshipped headlines no longer appear on issue pages",
  "changelog.entries.unshipped-headlines-no-longer-appear-on-issue-pages.body":
    "An issue's contents list now shows only pieces that have actually published, so a headline the desk has not run yet stays out of sight.",
  "changelog.entries.the-authors-directory-only-lists-writers-who-have-published.title":
    "The authors directory only lists writers who have published",
  "changelog.entries.the-authors-directory-only-lists-writers-who-have-published.body":
    "The directory now lists the people whose work you can actually read, where before it counted every byline created the moment somebody opened a draft.",

  // ── Deep-scan section 6 (Gatherings), built 2026-09-06 ────────────────────
  "changelog.entries.your-reminder-and-cancellation-links-now-open-the-gathering.title":
    "Reminder and cancellation links now open the gathering",
  "changelog.entries.your-reminder-and-cancellation-links-now-open-the-gathering.body":
    "Event reminders, cancellation notices and entries in a subscribed calendar feed all open the gathering now, from your phone and from Google or Apple Calendar.",

  "changelog.entries.online-gatherings-now-have-a-join-link.title":
    "Online gatherings now have a join link",
  "changelog.entries.online-gatherings-now-have-a-join-link.body":
    "The wizard asks for the video link and it reaches the people who are going, shared on the same terms as a street address, so it never appears on the public page.",

  "changelog.entries.a-cancelled-gathering-now-says-so.title":
    "A cancelled gathering now says so",
  "changelog.entries.a-cancelled-gathering-now-says-so.body":
    "A gathering the host called off now says it was cancelled wherever you meet it, and its RSVP button is gone. People holding an invitation are told as well.",

  "changelog.entries.maybe-add-to-calendar-and-your-details-on-the-gathering-itself.title":
    "Maybe, add to calendar, and your details, on the gathering itself",
  "changelog.entries.maybe-add-to-calendar-and-your-details-on-the-gathering-itself.body":
    "On the gathering page you can mark yourself a maybe, add the date to your calendar when you confirm, and tell the host about a plus-one or an access need.",

  "changelog.entries.choose-when-your-gathering-reminder-arrives.title":
    "Choose when your gathering reminder arrives",
  "changelog.entries.choose-when-your-gathering-reminder-arrives.body":
    "Pick an hour before, a day before, or a week before. Notification settings used to have only an on-off switch.",

  "changelog.entries.hosts-can-run-a-gathering-again-and-take-the-door-list-offline.title":
    "Hosts can run a gathering again, and take the door list offline",
  "changelog.entries.hosts-can-run-a-gathering-again-and-take-the-door-list-offline.body":
    "Run this again opens the wizard filled in from a gathering you already ran, and Export on your attendee list downloads a real file.",

  // Section 5 of the 2026-09-05 deep scan: forum, feed and saved items.
  "changelog.tag.saved": "Open your collections",
  "changelog.entries.you-can-take-down-a-whole-forum-post.title":
    "You can take down a whole forum post",
  "changelog.entries.you-can-take-down-a-whole-forum-post.body":
    "Deleting a post now removes the title, the opening message and the link, and the category counts update at once. Replies stay written, reachable only outside the forum.",
  "changelog.entries.a-thread-always-shows-its-real-opening-post.title":
    "A thread always shows its real opening post",
  "changelog.entries.a-thread-always-shows-its-real-opening-post.body":
    "The opening post is now identified properly, so a muted or hidden author leaves the first reply in place. When the opening is unavailable to you, the card says so.",
  "changelog.entries.sorting-replies-reorders-the-whole-conversation.title":
    "Sorting replies reorders the whole conversation",
  "changelog.entries.sorting-replies-reorders-the-whole-conversation.body":
    "Newest and Most helpful now sort across every reply in the thread, and each reply stays nested under the one it answers.",
  "changelog.entries.the-forum-opens-on-active-and-top-means-this-month.title":
    "The forum opens on Active, and Top means this month",
  "changelog.entries.the-forum-opens-on-active-and-top-means-this-month.body":
    "The forum opens on Active now, and Top ranks by upvotes from the last month before falling back to recent activity, so a new question stays visible.",
  "changelog.entries.forum-search-looks-inside-replies.title":
    "Forum search looks inside replies",
  "changelog.entries.forum-search-looks-inside-replies.body":
    "Forum search now looks inside replies as well as titles, so a question answered three replies down comes back. The hint under the box says so.",
  "changelog.entries.you-can-move-a-post-to-the-right-category.title":
    "You can move a post to the right category",
  "changelog.entries.you-can-move-a-post-to-the-right-category.body":
    "You can move your own post to another category during its first 24 hours, from the category chip or the post menu. Moderators can refile one at any time.",
  "changelog.entries.see-how-many-replies-arrived-since-you-last-looked.title":
    "See how many replies arrived since you last looked",
  "changelog.entries.see-how-many-replies-arrived-since-you-last-looked.body":
    "Forum rows now show how many replies arrived since you last opened that post. Opening it marks it read, and notifications stay a separate choice.",
  "changelog.entries.the-composer-keeps-your-whole-draft.title":
    "The composer keeps your whole draft",
  "changelog.entries.the-composer-keeps-your-whole-draft.body":
    "An unfinished post now keeps its title, category, community, tags and photo along with the body, and shows on the forum with a way straight back into it.",
  "changelog.entries.links-in-threads-and-the-feed-open-up.title":
    "Links in threads and the feed open up",
  "changelog.entries.links-in-threads-and-the-feed-open-up.body":
    "A link pasted into a post now opens into a card with the page's title, description and image, the way it already did in messages.",
  "changelog.entries.votes-on-the-forum-are-honest.title":
    "Votes on the forum are honest",
  "changelog.entries.votes-on-the-forum-are-honest.body":
    "Voting on your own post, on somebody who has blocked you, or inside a private community you are not part of is now refused. Self-votes already cast were cleared.",
  "changelog.entries.threads-show-a-preview-of-what-was-asked.title":
    "Posts show a preview of what was asked",
  "changelog.entries.threads-show-a-preview-of-what-was-asked.body":
    "Forum rows and forum cards in the feed now show the opening lines of the post, and the reply count leaves out replies that were deleted.",
  "changelog.entries.hidden-members-stay-hidden-in-the-feed.title":
    "Hidden members stay hidden in the feed",
  "changelog.entries.hidden-members-stay-hidden-in-the-feed.body":
    "If you hide your profile, for 24 hours or from one particular person, the feed now respects that too and stops announcing you as a new member.",
  "changelog.entries.new-this-week-now-means-this-week.title":
    "New this week now means this week",
  "changelog.entries.new-this-week-now-means-this-week.body":
    "The sidebar list now shows only people who joined in the last seven days, and says plainly when nobody did.",
  "changelog.entries.saved-items-tell-you-when-something-is-gone.title":
    "Saved items tell you when something is gone",
  "changelog.entries.saved-items-tell-you-when-something-is-gone.body":
    "Your saved list, a list you shared and your collections now mark an item whose page has come down as no longer available, keeping the title.",

  // Section 5 follow-up: cross-device drafts, link previews, saved lists.
  "changelog.entries.a-post-you-start-on-one-device-reopens-on-another.title":
    "A post you start on one device reopens on another",
  "changelog.entries.a-post-you-start-on-one-device-reopens-on-another.body":
    "The whole draft now travels with you, community, tags and photo included, and a post saved before you write the body is kept too.",
  "changelog.entries.link-previews-no-longer-run-out-on-shared-wifi.title":
    "Link previews no longer run out on shared wifi",
  "changelog.entries.link-previews-no-longer-run-out-on-shared-wifi.body":
    "Your preview card allowance is now yours alone, large enough for a full page of links, where a whole cafe or office used to share one.",
  "changelog.entries.saved-lists-flag-a-dead-item-before-you-file-it.title":
    "Saved lists flag a dead item before you file it",
  "changelog.entries.saved-lists-flag-a-dead-item-before-you-file-it.body":
    "The recent-saves row on your saved lists now marks items whose page has come down, the same way the rest of your saved items do.",
};

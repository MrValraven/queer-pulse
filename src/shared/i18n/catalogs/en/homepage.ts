import type { Catalog } from "../../types";

/**
 * QueerPulse marketing homepage. Platform-authored chrome throughout — every
 * section here ships identically in demo and live mode. Mock member/community
 * content (names, bios, quotes, board-post titles, gathering titles) is
 * deliberately left untranslated in the data files per the i18n scope rule;
 * only chrome (headings, ctas, labels, empty states, aria-labels) is keyed here.
 */
export const homepage: Catalog = {
  // ── Page meta ──────────────────────────────────────────────────────────────
  "meta.title":
    "QueerPulse — Lisbon's queer community, online and in real life",
  "meta.description":
    "An invite-only network for LGBTQ+ people in Lisbon — gatherings, communities, skill swaps, and support, built by and for the people who use it.",

  // ── Hero ───────────────────────────────────────────────────────────────────
  "hero.eyebrow": "Live in Lisboa",
  "hero.title": "Your people, <em>right here in Lisboa.</em>",
  "hero.sub":
    "QueerPulse is an invite-only network for the Lisbon LGBTQ+ community — real gatherings, real support, real people. No swiping, no cold DMs.",
  "hero.requestInviteCta": "Request an invite",
  "hero.exploreMembersCta": "Explore members",
  "hero.note": "New members join every week, always vouched in.",

  // ── Manifesto ("about") ──────────────────────────────────────────────────
  "manifesto.label": "Our manifesto",
  "manifesto.lead":
    "A community platform, built <em>like it should have been from the start.</em>",
  "manifesto.body1":
    "QueerPulse exists because we were tired of platforms that treat queer people as a market segment instead of a community. Every feature here was built because someone needed it.",
  "manifesto.body2":
    "Membership is invite-only and vouched — not because we don't trust you, but because trust is the whole point. Everyone in the room chose to be here, for each other.",
  "manifesto.safetyCta": "How we keep this safe",
  "manifesto.assurance.vouched.title": "Invited or vouched",
  "manifesto.assurance.vouched.description":
    "Every member arrives through a vouch or a reviewed invite request — never an open sign-up.",
  "manifesto.assurance.encrypted.title": "End-to-end encrypted",
  "manifesto.assurance.encrypted.description":
    "Direct messages are encrypted — private conversations stay private.",
  "manifesto.assurance.privacy.title": "You control what's visible",
  "manifesto.assurance.privacy.description":
    "Set your profile, photos, and activity to public, members-only, or just for you.",
  "manifesto.assurance.moderation.title": "Moderated around the clock",
  "manifesto.assurance.moderation.description":
    "Reports get a real response, usually within hours — not days.",
  "manifesto.assurance.quickExit.title": "Quick exit, one tap",
  "manifesto.assurance.quickExit.description":
    "Leave any page instantly if someone looks over your shoulder.",

  // ── TrustStrip ─────────────────────────────────────────────────────────────
  "trustStrip.vouched": "Invite-only & vouched",
  "trustStrip.encrypted": "End-to-end encrypted",
  "trustStrip.moderation": "Actively moderated",
  "trustStrip.blockMuteReport": "Block, mute, report",
  "trustStrip.privacyControls": "Granular privacy controls",
  "trustStrip.reportCta": "Read our safety policy",

  // ── PainPoints ("why we built this") ───────────────────────────────────────
  "painPoints.eyebrow": "Why we built this",
  "painPoints.title": "We built this because <em>we needed it too.</em>",
  "painPoints.sub":
    "Every feature here started as something we wished already existed.",

  "painPoints.hero1.eyebrow": "The gap we felt first",
  "painPoints.hero1.question": '"Where do I even meet people who get it?"',
  "painPoints.hero1.heading": "So we built <em>the network.</em>",
  "painPoints.hero1.body":
    "Every member here is vouched for by someone already inside — no swiping, no cold DMs, no proving yourself to strangers.",
  "painPoints.hero1.builtLabel": "We built the vouch network",
  "painPoints.hero1.cta": "Meet the community",

  "painPoints.marker1": "Once you're in the room, more doors open.",

  "painPoints.exchange1.question":
    '"I need a favour, but I don\'t know who to ask."',
  "painPoints.exchange1.heading": "So we built <em>the board.</em>",
  "painPoints.exchange1.body":
    "Post what you need or what you can offer — from a spare room to a same-day translation — and let the community answer.",
  "painPoints.exchange1.cta": "Browse the board",

  "painPoints.exchange2.question":
    '"I want to spend my money with people like me."',
  "painPoints.exchange2.heading": "So we built <em>the directory.</em>",
  "painPoints.exchange2.body":
    "Queer-owned shops, studios, and services across Lisbon — easy to find, easy to support.",
  "painPoints.exchange2.cta": "Browse the directory",

  "painPoints.exchange3.question":
    '"I want to host something, I just don\'t know how."',
  "painPoints.exchange3.heading": "So we built <em>a way to host.</em>",
  "painPoints.exchange3.body":
    "A step-by-step guide to running your first supper club, workshop, or screening — with community support behind you.",
  "painPoints.exchange3.cta": "Start hosting",

  "painPoints.exchange4.question":
    '"I have a skill to teach — and one I want to learn."',
  "painPoints.exchange4.heading": "So we built <em>skill swaps.</em>",
  "painPoints.exchange4.body":
    "Trade what you know for what you need. No invoices, no algorithm — just people teaching each other.",
  "painPoints.exchange4.cta": "Explore skill swaps",

  "painPoints.hero2.eyebrow": "The gap we felt hardest",
  "painPoints.hero2.question": '"What happens if something goes wrong?"',
  "painPoints.hero2.heading": "So we built <em>a safety net.</em>",
  "painPoints.hero2.body":
    "Therapists who get it, peer support that doesn't judge, and crisis lines that pick up — all vetted by the community that needs them.",
  "painPoints.hero2.builtLabel": "We built the wellbeing hub",
  "painPoints.hero2.cta": "See wellbeing resources",

  "painPoints.marker2": "And beyond the room, the harder questions.",

  "painPoints.exchange5.question":
    '"I want to do something, not just post about it."',
  "painPoints.exchange5.heading": "So we built <em>a way to act.</em>",
  "painPoints.exchange5.body":
    "Local campaigns, mutual aid, and organising — real ways to move something, together.",
  "painPoints.exchange5.cta": "See what's moving",

  "painPoints.exchange6.question": '"Do I actually know my rights here?"',
  "painPoints.exchange6.heading": "So we built <em>plain-language guides.</em>",
  "painPoints.exchange6.body":
    "Legal information for LGBTQ+ life in Portugal, written in plain language — no law degree required.",
  "painPoints.exchange6.cta": "Read the guides",

  "painPoints.exchange7.question": '"Will I actually be safe at this job?"',
  "painPoints.exchange7.heading": "So we built <em>employer reviews.</em>",
  "painPoints.exchange7.body":
    "Honest ratings from queer employees, so you know before you accept the offer.",
  "painPoints.exchange7.cta": "Read employer reviews",

  // ── Discovery (member highlight) ─────────────────────────────────────────
  "discovery.eyebrow": "{count}+ members and counting",
  "discovery.title": "Real people, <em>not a directory.</em>",
  "discovery.sub":
    "Every profile here belongs to a real, vouched member of the Lisbon queer community — not a stock photo, not a bot.",
  "discovery.exploreMembersCta": "Explore members",
  "discovery.footNote": "New faces join every week.",
  "discovery.verifiedBadge": "Verified",
  "discovery.featuredMember": "Featured member",
  "discovery.vouchedBy": "Vouched by {name}",
  "discovery.viewProfile": "View profile",
  "discovery.sayHello": "Say hello",
  "discovery.featuredMembersAria": "Featured members",
  "discovery.featureMemberAria": "Show {name}",

  // ── Gatherings (homepage teaser) ──────────────────────────────────────────
  "gatherings.title": "Meet in <em>real rooms.</em>",
  "gatherings.subtitle":
    "Dinners, workshops, screenings, and walks — real gatherings happening across Lisbon this month.",
  "gatherings.spots.seatsLeft": "seats left",
  "gatherings.spots.spotsLeft": "spots left",
  "gatherings.spots.going": "going",
  "gatherings.spots.casual": "Casual",
  "gatherings.cta.reserveSeat": "Reserve a seat",
  "gatherings.cta.illBeThere": "I'll be there",
  "gatherings.cta.requestSpot": "Request a spot",
  "gatherings.cta.rsvp": "RSVP",

  // ── Stories ────────────────────────────────────────────────────────────────
  "stories.title": "Told in <em>our own words.</em>",
  "stories.subtitle":
    "Essays, profiles, and reporting from inside the community — no outside gaze, no explaining ourselves.",
  "stories.imagePlaceholder": "story image",

  // ── Media (Cinema + Studio) ────────────────────────────────────────────────
  "media.title": "<em>Watch it. Hear it.</em> Made by us.",
  "media.subtitle":
    "QueerPulse Cinema and Studio — a home for queer film and music, made by and for the community.",
  "media.cinema.eyebrow": "Cinema",
  "media.cinema.title": "Queer film, <em>uncut.</em>",
  "media.cinema.desc":
    "Stream member-made shorts and features, catch community screenings, and submit your own work.",
  "media.cinema.chip.stream": "Stream",
  "media.cinema.chip.screenings": "Screenings",
  "media.cinema.chip.submit": "Submit",
  "media.cinema.cta": "Enter Cinema",
  "media.studio.eyebrow": "Studio",
  "media.studio.title": "Queer sound, <em>out loud.</em>",
  "media.studio.desc":
    "Release your music, tune into live sessions, and discover artists from the community.",
  "media.studio.chip.listen": "Listen",
  "media.studio.chip.release": "Release",
  "media.studio.chip.liveSessions": "Live sessions",
  "media.studio.cta": "Enter Studio",

  // ── ChangeMakers ───────────────────────────────────────────────────────────
  "changeMakers.eyebrow": "Changemakers",
  "changeMakers.title": "Building the <em>Lisbon we want.</em>",
  "changeMakers.sub":
    "Organisers, advocates, and everyday people pushing this city forward.",
  "changeMakers.cta": "Meet the changemakers",
  "changeMakers.portraitPlaceholder": "portrait of {name}",

  // ── Wellbeing ──────────────────────────────────────────────────────────────
  "wellbeing.title": "Support that <em>actually gets it.</em>",
  "wellbeing.subtitle":
    "Mental health, peer support, and crisis resources — all vetted by the community that needs them.",
  "wellbeing.allResourcesCta": "See all wellbeing resources",
  "wellbeing.therapists.title": "Find a therapist",
  "wellbeing.therapists.description":
    "Queer-affirming, community-vetted mental health professionals across Lisbon.",
  "wellbeing.therapists.cta": "Find a therapist",
  "wellbeing.peerSupport.title": "Peer support circles",
  "wellbeing.peerSupport.description":
    "Facilitated groups where you don't have to explain the basics first.",
  "wellbeing.peerSupport.cta": "Join a circle",
  "wellbeing.crisis.title": "Crisis lines",
  "wellbeing.crisis.description":
    "Someone to call, day or night, if things get heavy.",
  "wellbeing.crisis.cta": "Get help now",
  "wellbeing.legal.title": "Know your rights",
  "wellbeing.legal.description":
    "Plain-language legal guides for LGBTQ+ life in Portugal.",
  "wellbeing.legal.cta": "Read the guides",
  "wellbeing.employerReviews.title": "Employer reviews",
  "wellbeing.employerReviews.description":
    "Real ratings from queer employees — know before you apply.",
  "wellbeing.employerReviews.cta": "Browse reviews",
  "wellbeing.harmReduction.title": "Harm reduction",
  "wellbeing.harmReduction.description":
    "Honest, judgment-free guidance — no lectures, no shame.",
  "wellbeing.harmReduction.cta": "See the guide",

  // ── Communities (design variant G — spotlight + index) ─────────────────────
  "communities.eyebrow": "Communities · Lisboa",
  "communities.title":
    "Community is stronger <em>when communities connect.</em>",
  "communities.sub":
    "Search or filter the list, then open any community to see the whole room — what it is, what it does, who's inside, and what you unlock by joining.",
  "communities.browseAllCta": "Browse all communities",
  "communities.resultCount.all": "<b>{count}</b> communities",
  "communities.resultCount.shown": "<b>{count}</b> of {total} communities",

  "communities.toolbar.searchPlaceholder": "Search communities…",
  "communities.toolbar.searchAriaLabel": "Search communities",
  "communities.toolbar.langAriaLabel": "Filter by language",
  "communities.toolbar.langAllOption": "All languages",
  "communities.toolbar.hoodAriaLabel": "Filter by neighbourhood",
  "communities.toolbar.hoodAllOption": "All areas",
  "communities.toolbar.sortLabel": "Sort",
  "communities.toolbar.sortAriaLabel": "Sort communities",
  "communities.toolbar.sort.active": "Most active",
  "communities.toolbar.sort.size": "Largest",
  "communities.toolbar.sort.new": "Newest",
  "communities.toolbar.sort.near": "Nearest",

  "communities.category.all": "All",
  "communities.category.social": "Social",
  "communities.category.arts": "Arts",
  "communities.category.support": "Support",
  "communities.category.activism": "Activism",

  "communities.access.open": "Open to join",
  "communities.access.request": "Request to join",
  "communities.access.private": "Private",

  "communities.rail.showingCount": "Showing · {count}",
  "communities.rail.noMatches": "No matches",
  "communities.rail.emptyTitle": "No communities match.",
  "communities.rail.emptyBody": "Try a broader filter or clear your search.",
  "communities.rail.privateNoHeadcount": "Private — no headcount shown",
  "communities.clearFiltersCta": "Clear filters",

  "communities.spotlight.emptyTitle": "Nothing here — yet.",
  "communities.spotlight.emptyBody":
    "No community matches those filters. Widen your search, or start the one that's missing.",
  "communities.spotlight.startCommunityCta": "Start a community",
  "communities.spotlight.quiet.membersOnlyPrivate": "Members only · private",
  "communities.spotlight.quiet.discreetSafe": "Discreet & safe · no headcount",
  "communities.spotlight.quiet.enterCta": "Enter",
  "communities.spotlight.whatHappensHere": "What happens here",
  "communities.spotlight.whatYouGet": "What you get when you join",
  "communities.spotlight.keptBy": "Kept by <b>{name}</b> & {extra}",
  "communities.spotlight.sinceLabel": "Since {year}",
  "communities.spotlight.peekInsideCta": "Peek inside",
  "communities.spotlight.joinCta": "Join",

  "communities.room.pulse": "the live feed",
  "communities.room.discussions": "threads",
  "communities.room.events": "gatherings & RSVPs",
  "communities.room.resources": "guides & library",

  // ── MicroGrants ────────────────────────────────────────────────────────────
  "microGrants.title": "Small funds, <em>real difference.</em>",
  "microGrants.subtitle":
    "Member-funded micro-grants covering the costs that keep people and projects going.",
  "microGrants.seeFundCta": "See the fund",
  "microGrants.applyCta": "Apply for a grant",
  "microGrants.contributeCta": "Contribute to the fund",
  "microGrants.stat.contributed": "Contributed by members",
  "microGrants.stat.grantsAwarded": "Grants awarded",
  "microGrants.stat.averageAmount": "Average grant",

  // ── Board (favour board) ───────────────────────────────────────────────────
  "board.title": "Ask, offer, <em>help each other out.</em>",
  "board.subtitle":
    "A community favour board — post what you need or what you can give.",
  "board.postSomethingCta": "Post something",
  "board.kind.lookingFor": "Looking for",
  "board.kind.offering": "Offering",
  "board.filter.all": "All",
  "board.filter.asking": "Asking",
  "board.filter.offering": "Offering",
  "board.filter.design": "Design",
  "board.filter.tech": "Tech",
  "board.filter.space": "Space",
  "board.filter.care": "Care",
  "board.empty.title": "Nothing here yet",
  "board.empty.description":
    "No posts match this filter right now. Try another category, or be the first to post.",
  "board.empty.clearFilters": "Clear filters",

  // ── Barter ─────────────────────────────────────────────────────────────────
  "barter.title": "Trade skills, <em>not invoices.</em>",
  "barter.subtitle":
    "Members swapping what they're good at for what they need — no money changes hands.",
  "barter.browseAllCta": "Browse all swaps",
  "barter.offeringLabel": "Offering",
  "barter.inExchangeFor": "in exchange for",
  "barter.wantingLabel": "Wanting",

  // ── SkillsTeaser ───────────────────────────────────────────────────────────
  "skillsTeaser.title": "Teach one thing, <em>learn another.</em>",
  "skillsTeaser.subtitle":
    "A running exchange of skills members are teaching and learning from each other.",
  "skillsTeaser.browseAllCta": "Browse all skills",
  "skillsTeaser.teachingLabel": "Teaching",
  "skillsTeaser.learningLabel": "Learning",

  // ── Library ────────────────────────────────────────────────────────────────
  "library.title": "The knowledge <em>doesn't disappear.</em>",
  "library.subtitle":
    "Recordings, guides, and notes from every gathering — searchable and preserved. Workshop wisdom that outlives the room.",
  "library.browseCta": "Browse the library →",
  "library.type.recording": "Recording",
  "library.type.guide": "Guide",
  "library.type.notes": "Meeting Notes",
  "library.moreLabel": "in the archive →",

  // ── Partners ───────────────────────────────────────────────────────────────
  "partners.title": "Community is stronger <em>when communities connect.</em>",
  "partners.subtitle":
    "We work with organisations that share our values — across Portugal and beyond.",
  "partners.seeAllLabel": "See all partners",
  "partners.moreCount": "{count} communities",

  // ── SpacesMap ──────────────────────────────────────────────────────────────
  "spacesMap.title": "Find your <em>spaces in the city.</em>",
  "spacesMap.subtitle":
    "Community-curated queer-safe venues, member studios, and gathering spaces across Lisbon. Not a business directory — this is ours.",
  "spacesMap.openFullMapCta": "Open full map →",
  "spacesMap.type.all": "All spaces",
  "spacesMap.type.venue": "Safe venues",
  "spacesMap.type.studio": "Member studios",
  "spacesMap.type.community": "Community spaces",
  "spacesMap.type.org": "Organisations",
  "spacesMap.countLabel": "{count} spaces · member-curated",

  // ── Platforms ──────────────────────────────────────────────────────────────
  "platforms.title": "The wider <em>queer ecosystem</em>",
  "platforms.subtitle":
    "Other LGBTQ+ platforms, media, and communities worth knowing about — beyond QueerPulse.",
  "platforms.seeAllCta": "See all platforms →",
  "platforms.moreCount": "{count} more",
  "platforms.browseAllCta": "Browse all →",

  // ── Newsletter ─────────────────────────────────────────────────────────────
  "newsletter.title": "Stay connected. <em>Weekly, not daily.</em>",
  "newsletter.subtitle":
    "The QueerPulse digest lands every Thursday — new members to meet, upcoming gatherings, open skill swaps, and one piece of writing worth your time. No noise.",
  "newsletter.emailRequiredToast": "Please enter your email",
  "newsletter.subscribedToast": "You're on the list — see you Thursday",
  "newsletter.success.title": "You're on the list, <em>almost.</em>",
  "newsletter.success.body":
    "We'll start sending the <strong>Weekly digest</strong> to <strong>{email}</strong> every Thursday.",
  "newsletter.success.checkInboxNote":
    "Check your inbox to confirm your subscription — the link expires in 48 hours.",
  "newsletter.success.useDifferentEmailCta": "Use a different email",
  "newsletter.emailPlaceholder": "your@email.com",
  "newsletter.subscribeCta": "Subscribe",
  "newsletter.note": "Members only · no spam · unsubscribe anytime",

  // ── Pillars ("a world, not a feature list") ─────────────────────────────────
  "pillars.eyebrow": "One membership · six worlds",
  "pillars.title": "A world, not a <em>feature list.</em>",
  "pillars.sub":
    "Six pillars of queer professional life in Lisbon — each one built by and for the community, not bolted on afterwards.",

  "pillars.community.name": "Community",
  "pillars.community.desc":
    "Gatherings, groups, forum, and connections — the social fabric of queer Lisbon, online and in person.",
  "pillars.community.featured":
    "The social fabric of queer Lisbon — a room with the door held open, online and in person.",
  "pillars.community.alt":
    "People celebrating around a rainbow-painted taxi at a Pride parade",
  "pillars.culture.name": "Culture",
  "pillars.culture.desc":
    "The magazine, stories, reading groups, and library — a living record of queer Lisbon, written from the inside.",
  "pillars.culture.alt":
    "Drag performers walking a Pride parade route in daylight",
  "pillars.livelihood.name": "Livelihood",
  "pillars.livelihood.desc":
    "Jobs, skills exchange, micro-grants, and barter — a queer economy built on trust, not platform fees.",
  "pillars.livelihood.alt":
    "Two people planning work together over laptops and notebooks",
  "pillars.wellbeing.name": "Wellbeing",
  "pillars.wellbeing.desc":
    "Mental health, sexual health, trans healthcare — queer-affirming professionals, community-vetted.",
  "pillars.wellbeing.alt": "Two men sharing a tender kiss",
  "pillars.safety.name": "Safety",
  "pillars.safety.desc":
    "Legal guides, hate crime reporting, harm reduction, and emergency contacts — know your rights.",
  "pillars.safety.alt":
    "Demonstrators holding signs reading trans rights are human rights",
  "pillars.activism.name": "Activism",
  "pillars.activism.desc":
    "Changemakers, volunteers, and transparent governance — building a better city from the inside out.",
  "pillars.activism.alt":
    "Marchers carrying a large trans-flag banner through a city street",

  "pillars.tag.gatherings": "Gatherings",
  "pillars.tag.forum": "Forum",
  "pillars.tag.communities": "Communities",
  "pillars.tag.magazine": "Magazine",
  "pillars.tag.stories": "Stories",
  "pillars.tag.library": "Library",
  "pillars.tag.jobs": "Jobs",
  "pillars.tag.skills": "Skills",
  "pillars.tag.microGrants": "Micro-grants",
  "pillars.tag.mentalHealth": "Mental health",
  "pillars.tag.transHub": "Trans hub",
  "pillars.tag.sexualHealth": "Sexual health",
  "pillars.tag.legal": "Legal",
  "pillars.tag.rights": "Rights",
  "pillars.tag.emergency": "Emergency",
  "pillars.tag.changemakers": "Changemakers",
  "pillars.tag.volunteer": "Volunteer",
  "pillars.tag.governance": "Governance",

  // ── Outro (final CTA) ──────────────────────────────────────────────────────
  "outro.title": "Walk into a room where you <em>already belong.</em>",
  "outro.sub":
    "Membership is by invitation and kept small on purpose. If someone you trust is already here, ask them to vouch for you.",
  "outro.cta": "Request an invite",
};

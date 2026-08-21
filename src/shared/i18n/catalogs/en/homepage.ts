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
  "meta.title": "QueerPulse: A Queer Network, Rooted in Lisbon",
  "meta.description":
    "A place to discover what's happening across Lisbon's queer community and find the people, communities, events, and opportunities shaping queer life in the city.",

  // ── Hero ───────────────────────────────────────────────────────────────────
  "hero.eyebrow": "Live in Lisboa",
  "hero.title": "A queer network, <em>rooted in Lisbon.</em>",
  "hero.sub":
    "A place to discover what's happening across Lisbon's queer community and find the people, communities, events, and opportunities shaping queer life in the city.",
  "hero.requestInviteCta": "Request an invite",
  "hero.exploreMembersCta": "Explore members",
  "hero.note": "New members join every week, always vouched in.",

  // ── Manifesto ("about") ──────────────────────────────────────────────────
  "manifesto.label": "Our manifesto",
  "manifesto.lead":
    "A community platform built around <em>what queer people actually need.</em>",
  "manifesto.body1":
    "QueerPulse exists because we were tired of platforms that treat queer people as a market segment instead of a community. Every feature here starts with a real need, a frustration, or something we wished already existed.",
  "manifesto.body2":
    "We believe community works differently when there is trust behind it. When you know who you are connecting with, when you have control over what you share, and when there are people looking out for the spaces you use.",
  "manifesto.body3":
    "That is why QueerPulse is invite-only, why members are vouched for, and why safety and privacy are built into the foundation of the platform.",
  "manifesto.highlight":
    "We are building a place where being queer is the starting point for real connection.",
  "manifesto.safetyCta": "How we keep this safe",
  "manifesto.assurance.vouched.title": "Invited or vouched",
  "manifesto.assurance.vouched.description":
    "Every member arrives through a trusted connection or a reviewed invite request, helping us build a community where people have a reason to be here.",
  "manifesto.assurance.safeSpaces.title": "Safe spaces we've been to",
  "manifesto.assurance.safeSpaces.description":
    "Our team visits venues in person and keeps their information up to date, so you can discover places the community has actually checked out.",
  "manifesto.assurance.encrypted.title": "End-to-end encrypted",
  "manifesto.assurance.encrypted.description":
    "Your direct conversations are encrypted, keeping private messages between the people they were meant for.",
  "manifesto.assurance.privacy.title": "You control what's visible",
  "manifesto.assurance.privacy.description":
    "Choose what you share and who gets to see it. Your profile, photos, and activity can be public, members-only, or private.",
  "manifesto.assurance.moderation.title": "Moderated around the clock",
  "manifesto.assurance.moderation.description":
    "When something goes wrong, you should not have to shout into the void. Reports are reviewed by real people and responded to as quickly as possible.",

  // ── TrustStrip ─────────────────────────────────────────────────────────────
  "trustStrip.vouched": "Invite-only & vouched",
  "trustStrip.encrypted": "End-to-end encrypted",
  "trustStrip.moderation": "Actively moderated",
  "trustStrip.blockMuteReport": "Block, mute, report",
  "trustStrip.privacyControls": "Granular privacy controls",
  "trustStrip.reportCta": "Read our safety policy",

  // ── PainPoints ("why we built this") ───────────────────────────────────────
  "painPoints.eyebrow": "Why we built this",
  "painPoints.title": "We built <em>the community we wanted to find.</em>",
  "painPoints.sub":
    "Queer life in Lisbon is full of people doing incredible things, but finding your way into that community can still feel harder than it should. The right people, spaces, opportunities, resources, and support are often scattered across different places.",
  "painPoints.sub2":
    "QueerPulse brings them closer together, making it easier to discover what exists, find where you belong, and turn a connection into something real.",

  "painPoints.hero1.eyebrow": "The gap we felt first",
  "painPoints.hero1.question": '"Where do I even meet people who get it?"',
  "painPoints.hero1.heading": "So we built <em>a network.</em>",
  "painPoints.hero1.body":
    "Every member is vouched for by someone already inside, creating a community where you can meet people through trust and shared connections.",
  "painPoints.hero1.builtLabel": "We built the vouch network",
  "painPoints.hero1.cta": "Meet the community",

  "painPoints.marker1": "Once you're in the room, more doors open.",

  "painPoints.exchange1.question":
    '"I need a favour, but I don\'t know who to ask."',
  "painPoints.exchange1.heading": "So we built <em>a community board.</em>",
  "painPoints.exchange1.body":
    "Ask for what you need or offer what you can, and give people a way to help each other in everyday life.",
  "painPoints.exchange1.cta": "Browse the board",

  "painPoints.exchange2.question":
    '"I want to spend my money with people like me."',
  "painPoints.exchange2.heading":
    "So we built <em>a queer business directory.</em>",
  "painPoints.exchange2.body":
    "Discover queer-owned businesses and welcoming services across Lisbon, all in one place.",
  "painPoints.exchange2.cta": "Browse the directory",

  "painPoints.exchange3.question":
    '"I want to host something, but I don\'t know where to start."',
  "painPoints.exchange3.heading": "So we built <em>a way to host.</em>",
  "painPoints.exchange3.body":
    "Everything you need to turn an idea into a real gathering, with practical guidance and a community behind you.",
  "painPoints.exchange3.cta": "Start hosting",

  "painPoints.exchange4.question":
    '"I have something I can teach, and something I want to learn."',
  "painPoints.exchange4.heading": "So we're building <em>skill swaps.</em>",
  "painPoints.exchange4.body":
    "Share what you know, learn from someone else, and make useful connections along the way.",
  "painPoints.exchange4.cta": "See it on the roadmap",

  "painPoints.hero2.eyebrow": "The gap we felt hardest",
  "painPoints.hero2.question": '"What if I\'m not okay?"',
  "painPoints.hero2.heading": "So we built <em>a safety net.</em>",
  "painPoints.hero2.body":
    "Find queer-friendly therapists, peer support, and trusted resources when you need somewhere to turn.",
  "painPoints.hero2.builtLabel": "We built the wellbeing hub",
  "painPoints.hero2.cta": "See wellbeing resources",

  "painPoints.marker2": "And beyond the room, the harder questions.",

  "painPoints.exchange5.question":
    '"I want to do something, not just post about it."',
  "painPoints.exchange5.heading": "So we built <em>a way to act.</em>",
  "painPoints.exchange5.body":
    "Find local campaigns, mutual aid initiatives, volunteer opportunities, and ways to turn care into action.",
  "painPoints.exchange5.cta": "Get involved",

  "painPoints.exchange6.question": '"Do I actually know my rights here?"',
  "painPoints.exchange6.heading": "So we built <em>plain-language guides.</em>",
  "painPoints.exchange6.body":
    "Clear, accessible information about LGBTQ+ rights in Portugal, written for real life rather than legal textbooks.",
  "painPoints.exchange6.cta": "Read the guides",

  "painPoints.exchange7.question": '"Will I actually be safe at this job?"',
  "painPoints.exchange7.heading": "So we're building <em>employer reviews.</em>",
  "painPoints.exchange7.body":
    "Honest experiences from queer employees, helping you make more informed decisions about where you work.",
  "painPoints.exchange7.cta": "See it on the roadmap",

  // ── Discovery (member highlight) ─────────────────────────────────────────
  "discovery.eyebrow": "{count}+ members and counting",
  "discovery.title": "The <em>faces</em> of queer Lisbon",
  "discovery.sub":
    "Explore a diverse network of LGBTQ+ professionals, creators, founders, and community builders collaborating to turn ideas into meaningful impact.",
  "discovery.exploreMembersCta": "Explore members",
  "discovery.footNote": "New faces join every week.",
  "discovery.verifiedBadge": "Verified",
  "discovery.featuredMember": "Featured member",
  "discovery.vouchedBy": "Vouched by {name}",
  "discovery.viewProfile": "View profile",
  "discovery.sayHello": "Say hello",
  "membersExplainer.eyebrow": "Members-only",
  "membersExplainer.title": "Members <em>power</em> QueerPulse",
  "membersExplainer.titlePlain": "Members power QueerPulse",
  "membersExplainer.lede":
    "The member directory opens up once you're in. Here's why we keep it that way, and how to join.",
  "membersExplainer.pillars.vouched.title": "Real people, vouched in",
  "membersExplainer.pillars.vouched.body":
    "Every member is invited and vouched for by someone already here. No bots, no strangers scraping the list.",
  "membersExplainer.pillars.inside.title": "The good stuff opens from inside",
  "membersExplainer.pillars.inside.body":
    "Full profiles, communities and gatherings unlock the moment you become a member.",
  "membersExplainer.pillars.safe.title": "Invite-only keeps it a safe space",
  "membersExplainer.pillars.safe.body":
    "Keeping the directory members-only is how people here get to be fully themselves.",
  "membersExplainer.requestInviteCta": "Request an invite",
  "membersExplainer.signInCta": "I'm already a member",
  "discovery.featuredMembersAria": "Featured members",
  "discovery.featureMemberAria": "Show {name}",

  // ── Live sections (admin-curated, real data — see Live* section components) ─
  "liveDiscovery.eyebrow": "Chosen by our team",
  "liveCommunities.sub":
    "QueerPulse brings together the communities shaping Lisbon's LGBTQ+ ecosystem, making it easier to discover, connect, and collaborate.",
  "liveCommunities.memberCount": "{count} members",

  // ── Gatherings (homepage teaser) ──────────────────────────────────────────
  "gatherings.title": "Meet in <em>real rooms.</em>",
  "gatherings.subtitle":
    "Dinners, workshops, screenings, and walks: real gatherings happening across Lisbon this month.",
  "gatherings.spots.seatsLeft": "seats left",
  "gatherings.spots.spotsLeft": "spots left",
  "gatherings.spots.going": "going",
  "gatherings.spots.casual": "Casual",
  "gatherings.cta.seeDetails": "See event details",

  // ── Stories ────────────────────────────────────────────────────────────────
  "stories.title": "Told in <em>our own words.</em>",
  "stories.subtitle":
    "Essays, profiles, and reporting from inside the community: no outside gaze, no explaining ourselves.",
  "stories.imagePlaceholder": "story image",

  // ── ChangeMakers ───────────────────────────────────────────────────────────
  "changeMakers.eyebrow": "Changemakers",
  "changeMakers.title": "Building the <em>Lisbon we want.</em>",
  "changeMakers.sub":
    "Organisers, advocates, and everyday people pushing this city forward.",
  "changeMakers.cta": "Meet the changemakers",
  "changeMakers.portraitPlaceholder": "portrait of {name}",

  // ── Communities (design variant G — spotlight + index) ─────────────────────
  "communities.eyebrow": "Communities · Lisboa",
  "communities.title":
    "Community is stronger <em>when communities connect.</em>",
  "communities.sub":
    "Search or filter the list, then open any community to see the whole room: what it is, what it does, who's inside, and what you unlock by joining.",
  "communities.howCommunitiesWorkCta": "How communities work",
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
  "communities.category.sports": "Sports",
  "communities.category.professional": "Professional",

  "communities.access.open": "Open to join",
  "communities.access.request": "Request to join",
  "communities.access.invite": "Invite only",
  "communities.access.private": "Private",

  "communities.rail.showingCount": "Showing · {count}",
  "communities.rail.noMatches": "No matches",
  "communities.rail.emptyTitle": "No communities match.",
  "communities.rail.emptyBody": "Try a broader filter or clear your search.",
  "communities.rail.privateNoHeadcount": "Private: no headcount shown",
  "communities.clearFiltersCta": "Clear filters",

  "communities.spotlight.emptyTitle": "Nothing here, yet.",
  "communities.spotlight.emptyBody":
    "No community matches those filters. Widen your search, or start the one that's missing.",
  "communities.spotlight.startCommunityCta": "Start a community",
  "communities.spotlight.quiet.membersOnlyPrivate": "Members only · private",
  "communities.spotlight.quiet.discreetSafe": "Discreet & safe · no headcount",
  "communities.spotlight.quiet.enterCta": "Enter",
  "communities.spotlight.whatHappensHere": "What happens here",
  "communities.spotlight.whatYouGet": "What you get when you join",
  "communities.spotlight.keptBy": "Kept by <b>{name}</b> & {extra}",
  "communities.spotlight.keptByName": "Kept by <b>{name}</b>",
  "communities.spotlight.sinceLabel": "Since {year}",

  "communities.room.pulse": "the live feed",
  "communities.room.discussions": "threads",
  "communities.room.events": "gatherings & RSVPs",
  "communities.room.resources": "guides & library",

  // ── Housing ────────────────────────────────────────────────────────────────
  "housing.title": "Find a place where you can feel at <em>home.</em>",
  "housing.subtitle":
    "Rooms, sublets, and flatmates from people in the community, with recommendations from those who have actually lived there.",
  "housing.cta": "Browse housing",
  "housing.eyebrow": "Rooms & flatmates",
  "housing.secondaryCta": "Post that you're looking",
  "housing.ctaNote": "Everyone here is part of the same trusted network.",
  "housing.tabRoom": "The room",
  "housing.tabLandlord": "The landlord",
  "housing.postedByMember": "Posted by a member",
  "housing.bringToFrontAria": 'Bring "{label}" to the front',
  "housing.reviewsFootNote":
    "Written by members who lived there. Landlords can't reply or remove.",
  "housing.reviewsFootCta": "How reviews work",

  // Showcase listing content below (two example listing cards) is an
  // intentional exception to the file-level i18n scope rule above: this is
  // static illustrative chrome, identical in demo and live mode and never
  // sourced from the API (unlike changemakers.ts), so it's fully translated
  // rather than left English-only.
  "housing.listings.a.peekLabel": "Room in Arroios · €480",
  "housing.listings.a.photoPlaceholder": "The room. Arroios flat.",
  "housing.listings.a.chips.0": "€480 + bills",
  "housing.listings.a.chips.1": "Arroios · from 1 Oct",
  "housing.listings.a.title": "A bright room in a three-person flat",
  "housing.listings.a.meta":
    "Private room, shared kitchen, rooftop and two cats already living rent free.",
  "housing.listings.a.price.lead": "€40 under",
  "housing.listings.a.price.rest":
    "the median room in Arroios (€520). We show you that before you ask.",
  "housing.listings.a.household.name": "Vera, Tó and one more",
  "housing.listings.a.household.sub": "Vouched by 3 members. Here since 2024.",
  "housing.listings.a.signals.0.lead": "Trans-affirming household.",
  "housing.listings.a.signals.0.rest": "Shared by the people who live there.",
  "housing.listings.a.signals.1.lead": "Landlord reviewed by 3 past tenants.",
  "housing.listings.a.signals.1.rest":
    "See what previous tenants had to say before you get in touch.",
  "housing.listings.a.signals.2.lead": "Deposit terms in writing.",
  "housing.listings.a.signals.2.rest":
    "Know what you're agreeing to before you move in.",
  "housing.listings.a.landlord.sub":
    "Three flats in Arroios. Known here since 2024.",
  "housing.listings.a.landlord.verdict":
    "All three past tenants would rent from him again",
  "housing.listings.a.landlord.quotes.0.quote":
    "Never once asked who my partner was. Fixed the boiler in two days.",
  "housing.listings.a.landlord.quotes.0.who": "Rui, lived there 2022–2024",
  "housing.listings.a.landlord.quotes.1.quote":
    "Put my name on the lease the way I asked, first time, no conversation about it.",
  "housing.listings.a.landlord.quotes.1.who": "Nadia, lived there 2021–2022",
  "housing.listings.a.landlord.quotes.2.quote":
    "Deposit back in full, both times. He sends a photo of the transfer.",
  "housing.listings.a.landlord.quotes.2.who": "Joana, lived there 2019–2021",
  "housing.listings.a.landlord.flag.lead": "One flag:",
  "housing.listings.a.landlord.flag.rest":
    "raised the rent mid-lease in 2023, then reversed it after a written objection.",

  "housing.listings.b.peekLabel": "Sublet in Graça · €390 · Jan–Mar",
  "housing.listings.b.photoPlaceholder": "The studio. Graça sublet.",
  "housing.listings.b.chips.0": "€390 + bills",
  "housing.listings.b.chips.1": "Graça · Jan–Mar",
  "housing.listings.b.title": "A whole studio in Graça, January to March",
  "housing.listings.b.meta":
    "Sublet while I'm away. Roof access, good afternoon light, a dog you'd be feeding.",
  "housing.listings.b.price.lead": "Near the median",
  "housing.listings.b.price.rest":
    "for a studio in Graça (€420). Furnished, bills split with the flat below.",
  "housing.listings.b.household.sub": "Vouched by 5 members. Here since 2023.",
  "housing.listings.b.signals.0.lead":
    "Sublet with written consent from the landlord.",
  "housing.listings.b.signals.0.rest": "The paperwork is on the listing.",
  "housing.listings.b.signals.1.lead": "Step-free entrance.",
  "housing.listings.b.signals.1.rest":
    "Lift to the fourth floor, wide bathroom door.",
  "housing.listings.b.signals.2.lead": "No deposit.",
  "housing.listings.b.signals.2.rest":
    "Beatriz is asking for the first month only.",
  "housing.listings.b.landlord.sub": "One flat in Graça. New to the board.",
  "housing.listings.b.landlord.emptyState.title": "No reviews yet.",
  "housing.listings.b.landlord.emptyState.body":
    "Nobody here has rented from her yet. If you take it, you'd be the first to write it up, and the next person gets to know what you know.",
  "housing.listings.b.landlord.facts.0.text":
    "A moderator verified her identity in person.",
  "housing.listings.b.landlord.facts.1.text":
    "Lease and consent letter shown to the housing team before the post went live.",
  "housing.listings.b.landlord.facts.2.text":
    "No landlord track record yet. Take a friend along to the viewing.",
  "housing.listings.factsHeading": "What we do know",

  // ── Subprofiles ────────────────────────────────────────────────────────────
  "subprofiles.title": "Different sides of you. <em>All in one place.</em>",
  "subprofiles.subtitle":
    "Maybe you're a designer by day and a DJ at night. Maybe you make art, run a project, or have a whole side of yourself you'd rather keep separate. Create personas for whatever you want to share, and decide exactly how visible each one is.",
  "subprofiles.subtitleIdentity":
    "Each persona can have its own identity, with the information, interests, and content that make sense for that context. Show a more professional side in one persona and something completely different in another, without losing the connection between them.",
  "subprofiles.subtitleControl":
    "You decide what each person sees and how much you want to share. Some personas can be fully linked to your name, while others can exist more discreetly. Not every part of us needs to show up in the same place.",
  "subprofiles.cta": "Explore personas",
  "subprofiles.ctaNote": "Three personas are included with every account.",
  "subprofiles.proofHeading":
    "More than one side of you. One profile can't show all of it.",
  "subprofiles.proofEverywhereNote":
    "One profile tends to become the version of you that's easiest to explain. The rest gets left out.",
  "subprofiles.everywhereElse": "Everywhere else",
  "subprofiles.onQueerPulse": "On QueerPulse",
  "subprofiles.proofVs": "vs",
  "subprofiles.proofCrampRoles": "drag performer · ceramicist · music critic",
  "subprofiles.mainNodeSub": "Main profile · product designer",
  "subprofiles.postingAs": "Posting as",

  // Persona showcase content below (four example personas) is an
  // intentional exception to the file-level i18n scope rule above: same
  // reasoning as the housing listings block. Proper names stay in
  // personasShowcase.data.ts, unrouted, since names aren't localized.
  "subprofiles.personas.main.role": "Product designer",
  "subprofiles.personas.main.sub": "Fintech, six years · Arroios",
  "subprofiles.personas.main.cta": "See the work",
  "subprofiles.personas.main.bio":
    "Product designer in fintech, with case studies and open consulting hours.",
  "subprofiles.personas.main.meta.0": "Open to consulting",
  "subprofiles.personas.main.meta.1": "4 case studies",
  "subprofiles.personas.main.meta.2": "Speaks EN / PT",
  "subprofiles.personas.main.tiles.0.label": "Case study",
  "subprofiles.personas.main.tiles.1.label": "Case study",
  "subprofiles.personas.main.tiles.2.label": "Conference talk",
  "subprofiles.personas.main.foot":
    "Your main profile. The one people already know you by.",
  "subprofiles.personas.main.note":
    "Speaking as yourself: the product design career, the one every network already knows about.",
  "subprofiles.personas.main.switcherSub": "Main profile · product design",
  "subprofiles.personas.main.laneLabel": "product design",

  "subprofiles.personas.mara.role": "Drag performer",
  "subprofiles.personas.mara.sub": "Anjos · performing since 2018",
  "subprofiles.personas.mara.cta": "Book a show",
  "subprofiles.personas.mara.bio":
    "Performing at Anjos since 2018, with a public rate card and travels for festivals.",
  "subprofiles.personas.mara.meta.0": "Two shows a month",
  "subprofiles.personas.mara.meta.1": "Rate card public",
  "subprofiles.personas.mara.meta.2": "Travels for festivals",
  "subprofiles.personas.mara.tiles.0.label": "Show photo",
  "subprofiles.personas.mara.tiles.1.label": "Show photo",
  "subprofiles.personas.mara.tiles.2.label": "Tour poster",
  "subprofiles.personas.mara.foot":
    "Everything they need to know about Sofia's work as a performer, without the rest of her profile getting in the way.",
  "subprofiles.personas.mara.note":
    "Speaking as Mara: bookers get the shows, the photos and the fee. The product design CV stays off this page.",
  "subprofiles.personas.mara.switcherSub": "Drag · bookers and venues",
  "subprofiles.personas.mara.laneLabel": "drag",
  "subprofiles.personas.mara.deck.skinLabel": "Poster skin",
  "subprofiles.personas.mara.deck.tag":
    "Drag, eight years of it. Two shows a month at Anjos, a rate card that doesn't apologise.",
  "subprofiles.personas.mara.deck.visLabel": "Bookers & venues",
  "subprofiles.personas.mara.deck.showsLine": "Gigs · photos · rate card",

  "subprofiles.personas.atelier.role": "Ceramics studio, two people",
  "subprofiles.personas.atelier.sub": "Graça · commissions and wholesale",
  "subprofiles.personas.atelier.cta": "Commission a piece",
  "subprofiles.personas.atelier.bio":
    "Two-person ceramics studio in Graça, taking commissions and wholesale orders.",
  "subprofiles.personas.atelier.meta.0": "Commissions open",
  "subprofiles.personas.atelier.meta.1": "Wholesale list",
  "subprofiles.personas.atelier.meta.2": "Saturday workshops",
  "subprofiles.personas.atelier.tiles.0.label": "Finished piece",
  "subprofiles.personas.atelier.tiles.1.label": "Finished piece",
  "subprofiles.personas.atelier.tiles.2.label": "The studio",
  "subprofiles.personas.atelier.foot":
    "Credited to the atelier: a shared front page two people can run.",
  "subprofiles.personas.atelier.note":
    "Speaking as the studio: buyers and galleries see the work and the pricing, credited to the atelier instead of to you.",
  "subprofiles.personas.atelier.switcherSub": "Ceramics · buyers and galleries",
  "subprofiles.personas.atelier.laneLabel": "ceramics",
  "subprofiles.personas.atelier.deck.skinLabel": "Studio skin",
  "subprofiles.personas.atelier.deck.tag":
    "A two-person ceramics studio in Graça. Commissions, wholesale, and Saturday workshops.",
  "subprofiles.personas.atelier.deck.visLabel": "Buyers & galleries",
  "subprofiles.personas.atelier.deck.showsLine": "Work · pricing · studio days",

  "subprofiles.personas.byline.role": "Music criticism",
  "subprofiles.personas.byline.sub":
    "Bylines in three magazines since 2021",
  "subprofiles.personas.byline.cta": "Read the clips",
  "subprofiles.personas.byline.bio":
    "Music critic with bylines in three magazines, covering clubbing and diaspora.",
  "subprofiles.personas.byline.meta.0": "Beat: club & diaspora",
  "subprofiles.personas.byline.meta.1": "Pitch note on file",
  "subprofiles.personas.byline.meta.2": "Commissions from €180",
  "subprofiles.personas.byline.tiles.0.label": "Feature",
  "subprofiles.personas.byline.tiles.1.label": "Album review",
  "subprofiles.personas.byline.tiles.2.label": "Interview",
  "subprofiles.personas.byline.foot":
    "A pen name with a portfolio. The clips speak for themselves, no day job attached.",
  "subprofiles.personas.byline.note":
    "Speaking as the byline: editors see the clips and the beat you cover, with your day job kept out of the way.",
  "subprofiles.personas.byline.switcherSub": "Music writing · editors",
  "subprofiles.personas.byline.laneLabel": "music writing",
  "subprofiles.personas.byline.deck.skinLabel": "Byline skin",
  "subprofiles.personas.byline.deck.tag":
    "The name she writes music criticism under. Bylines in three magazines since 2021.",
  "subprofiles.personas.byline.deck.visLabel": "Editors who commission",
  "subprofiles.personas.byline.deck.showsLine": "Clips · beats · pitch note",

  // ── Outro (final CTA) ──────────────────────────────────────────────────────
  "outro.title": "Walk into a room where you <em>already belong.</em>",
  "outro.sub":
    "QueerPulse is an invite-only community built on trust, curiosity, and the belief that meaningful connections can change lives and cities.",
  "outro.cta": "Request an invite",
};

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
  "manifesto.body4":
    "Queer liberation is indivisible from every other struggle for safety and self-determination, Palestinian liberation among them. <a>Where we stand</a>.",
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

  // ── PainPoints ("why we built this") ───────────────────────────────────────
  "painPoints.eyebrow": "Why we built this",
  "painPoints.title": "We built the community <em>we wanted to find.</em>",
  "painPoints.lede":
    "Queer life in Lisbon is full of people doing remarkable things, scattered across group chats, posters and word of mouth.",
  "painPoints.support":
    "QueerPulse gathers them in one place, so you can see what exists, meet the people running it, and turn a name into a plan.",

  "painPoints.modal.soonNote":
    "This one is still being built. Members get it first, and get asked what it should do.",
  "painPoints.modal.requestInviteCta": "Request an invite",
  "painPoints.modal.signInCta": "I'm already a member",
  "painPoints.soon": "Soon",
  "painPoints.us": "QueerPulse",
  "painPoints.later": "A few weeks later",
  "painPoints.voicesNote":
    "Based on the conversations we kept having while working out what to build next.",
  "painPoints.network.label": "The vouch network",
  "painPoints.network.question":
    "Every queer event I go to, I leave after one drink because I do not know a single person there.",
  "painPoints.network.question2":
    "I moved here last year and everyone I know is still someone from work.",
  "painPoints.network.heading": "So we built <em>a network.</em>",
  "painPoints.network.body":
    "Every member is vouched for by someone already inside, so when you meet someone here you already have a person in common.",
  "painPoints.network.payoff":
    "Two dinners in and I finally have people to text on a Tuesday.",
  "painPoints.network.payoff2":
    "Turns out I already knew three people here, through one person.",
  "painPoints.network.cta": "Meet the community",
  "painPoints.network.modal.title":
    "Everyone here <em>arrived through someone.</em>",
  "painPoints.network.modal.lede":
    "The vouch network is the spine of QueerPulse. Every member was let in by a member who already belongs, and that chain stays visible on every profile.",
  "painPoints.network.modal.a.title": "How a vouch works",
  "painPoints.network.modal.a.body":
    "A member sends you an invite and puts their name on it. That name stays on your profile, so nobody here is a stranger to everyone.",
  "painPoints.network.modal.b.title": "What it gives you",
  "painPoints.network.modal.b.body":
    "Before you message anyone you can see how you are connected: who vouched for them, and who you both already know.",
  "painPoints.network.modal.c.title": "How it powers QueerPulse",
  "painPoints.network.modal.c.body":
    "Housing, gatherings and the directory all lean on it. Handing someone your address is a different decision when a member you trust put their name on them.",

  "painPoints.directory.label": "The business directory",
  "painPoints.directory.question":
    "I want my money going to queer-owned places, and I only hear about them when a friend happens to mention one.",
  "painPoints.directory.question2":
    "And I want a barber who calls me by my name and cuts exactly what I ask for.",
  "painPoints.directory.heading":
    "So we built <em>a queer business directory.</em>",
  "painPoints.directory.body":
    "Queer-owned businesses and queer-friendly services across Lisbon, with the address, the hours and who runs the place.",
  "painPoints.directory.payoff":
    "My whole Saturday list is queer-owned now. Barber included.",
  "painPoints.directory.payoff2":
    "Found my barber on there. Third month, same chair, same cut.",
  "painPoints.directory.cta": "Browse the directory",
  "painPoints.directory.modal.title":
    "Where your money <em>actually goes.</em>",
  "painPoints.directory.modal.lede":
    "Queer-owned businesses and queer-friendly services across Lisbon, listed by the people who run them.",
  "painPoints.directory.modal.a.title": "How it works",
  "painPoints.directory.modal.a.body":
    "Search by what you need or browse the map. Every listing carries the address, the hours and who runs the place.",
  "painPoints.directory.modal.b.title": "What it gives you",
  "painPoints.directory.modal.b.body":
    "Verified safe spaces sit in the same list, and a place earns that badge only after three separate members have been there and said so.",
  "painPoints.directory.modal.c.title": "How it powers QueerPulse",
  "painPoints.directory.modal.c.body":
    "Owners claim their own listing and answer for it. Money spent inside the community is what keeps the community's own places open.",

  "painPoints.whatsOn.label": "Somewhere to go",
  "painPoints.whatsOn.question":
    "Everything I hear about starts at midnight in a bar, and I stopped drinking two years ago.",
  "painPoints.whatsOn.question2":
    "I want a Sunday picnic or a collage afternoon, and those never reach me in time.",
  "painPoints.whatsOn.heading":
    "So we built <em>one calendar for the city.</em>",
  "painPoints.whatsOn.body":
    "Every gathering in one place: morning walks, supper clubs, workshops, studio visits, screenings and discussions. Filter by day, neighbourhood, kind and cost, and each one says up front whether it is a sober space, step-free, or has a quiet corner.",
  "painPoints.whatsOn.payoff":
    "A picnic in Monsanto on Sunday, marked sober space before I had to ask.",
  "painPoints.whatsOn.payoff2":
    "Three things in my calendar this month, all of them before 8pm.",
  "painPoints.whatsOn.cta": "See what's on",
  "painPoints.whatsOn.modal.title": "The city, <em>on one calendar.</em>",
  "painPoints.whatsOn.modal.lede":
    "Everything members are putting on, in one place: morning walks, supper clubs, workshops, studio visits, screenings and discussions.",
  "painPoints.whatsOn.modal.a.title": "How it works",
  "painPoints.whatsOn.modal.a.body":
    "Filter by day, neighbourhood, kind and cost, then RSVP. Your ticket carries the address, the host and a code for the door.",
  "painPoints.whatsOn.modal.b.title": "What it gives you",
  "painPoints.whatsOn.modal.b.body":
    "Every listing says up front whether it is a sober space, step-free, or has a quiet corner, so you know what you are walking into.",
  "painPoints.whatsOn.modal.c.title": "How it powers QueerPulse",
  "painPoints.whatsOn.modal.c.body":
    "This is where the network stops being a list of names. Hosts get check-in and waitlists, and the people who turn up leave knowing each other.",

  "painPoints.host.label": "A way to host",
  "painPoints.host.question":
    "I want to run a monthly supper club and I have no idea how to find the first twelve people.",
  "painPoints.host.question2":
    "I have had the same idea for a year. Venue, budget and who brings the chairs is where I stop.",
  "painPoints.host.heading": "So we built <em>a way to host.</em>",
  "painPoints.host.body":
    "Everything for turning an idea into a real gathering: a page people can find, RSVPs you can count, and guidance from people who have hosted before.",
  "painPoints.host.payoff":
    "Twelve people, one long table, and a checklist that did the worrying for me.",
  "painPoints.host.payoff2": "I stole your checklist. Mine is in March.",
  "painPoints.host.cta": "Start hosting",
  "painPoints.host.modal.title":
    "You bring the idea. <em>We carry the rest.</em>",
  "painPoints.host.modal.lede":
    "Everything for putting something on, from a twelve-person dinner to a workshop for thirty.",
  "painPoints.host.modal.a.title": "How it works",
  "painPoints.host.modal.a.body":
    "Publish a page with the date, the price and the number of spots. RSVPs, the waitlist and check-in on the day are handled for you.",
  "painPoints.host.modal.b.title": "What it gives you",
  "painPoints.host.modal.b.body":
    "A checklist built from what other hosts learned the hard way, including the access details worth stating before anyone has to ask.",
  "painPoints.host.modal.c.title": "How it powers QueerPulse",
  "painPoints.host.modal.c.body":
    "There is no application to host and no committee to pass. Members run what they want to run, and the calendar fills from the inside.",

  "painPoints.skillSwaps.label": "Skill swaps",
  "painPoints.skillSwaps.question":
    "I can teach anyone basic first aid, and I need someone to explain how to invoice as a freelancer.",
  "painPoints.skillSwaps.question2":
    "I would trade illustration lessons for someone who understands taxes.",
  "painPoints.skillSwaps.heading": "So we're building <em>skill swaps.</em>",
  "painPoints.skillSwaps.body":
    "Post what you can teach and what you want to learn, then trade directly with the person who matches. It is still being built.",
  "painPoints.skillSwaps.payoff":
    "When it opens, that trade is one post and one reply.",
  "painPoints.skillSwaps.payoff2": "Mine is already written in my notes app.",
  "painPoints.skillSwaps.cta": "See it on the roadmap",
  "painPoints.skillSwaps.modal.title":
    "Trade what you know, <em>learn what you need.</em>",
  "painPoints.skillSwaps.modal.lede":
    "A skills exchange where members trade time directly: illustration lessons for tax help, Portuguese for a haircut.",
  "painPoints.skillSwaps.modal.a.title": "How it will work",
  "painPoints.skillSwaps.modal.a.body":
    "Post what you can teach and what you want to learn. The match is one post and one reply.",
  "painPoints.skillSwaps.modal.b.title": "What it will give you",
  "painPoints.skillSwaps.modal.b.body":
    "Everything the community already knows how to do, opened up to people who do not have the money to buy it.",
  "painPoints.skillSwaps.modal.c.title": "How it powers QueerPulse",
  "painPoints.skillSwaps.modal.c.body":
    "It sits in the Work hub beside the job board, mentors, grants and the freelance calculators, so one trade can turn into paid work.",

  "painPoints.forum.label": "The forum",
  "painPoints.forum.question":
    "I want to ask how long the name change really takes at the conservatória, because the website says one thing and everyone I know says another.",
  "painPoints.forum.question2":
    "I want to ask how people tell their mother about a girlfriend at 34, because I have been calling Joana my flatmate for two years.",
  "painPoints.forum.heading": "So we built <em>a forum.</em>",
  "painPoints.forum.body":
    "One place everyone here belongs to: questions, recommendations, proposals and guides, sorted by category, answered by verified members, moderated by people you can appeal to.",
  "painPoints.forum.payoff":
    "Asked at 11pm. Three answers by morning, and the real number of weeks from someone who had done it.",
  "painPoints.forum.payoff2":
    "Eleven people told me how theirs went, the hard ones too. Joana came to lunch in March.",
  "painPoints.forum.cta": "Open the forum",
  "painPoints.forum.modal.title":
    "One place where <em>the whole city answers.</em>",
  "painPoints.forum.modal.lede":
    "The forum is the single community everyone here belongs to: questions, recommendations, proposals, and the slow work of organising.",
  "painPoints.forum.modal.a.title": "How it works",
  "painPoints.forum.modal.a.body":
    "Post in a category and verified members answer. Threads stay searchable, so your answer is still there for the next person who asks it.",
  "painPoints.forum.modal.b.title": "What it gives you",
  "painPoints.forum.modal.b.body":
    "The question you have been carrying since March gets a real answer from someone who has done it, usually the same night.",
  "painPoints.forum.modal.c.title": "How it powers QueerPulse",
  "painPoints.forum.modal.c.body":
    "Guides, gatherings and whole communities start as forum threads. Moderation publishes what it did each quarter, and you can appeal a decision.",

  "painPoints.magazine.label": "The magazine",
  "painPoints.magazine.question":
    "Every article I find about queer people is so generic it could be about any city.",
  "painPoints.magazine.question2":
    "And the rest feel far-fetched. I want to read about real people in Lisbon.",
  "painPoints.magazine.heading": "So we built <em>a magazine.</em>",
  "painPoints.magazine.body":
    "Essays, profiles and reporting written and edited by queer people in Lisbon. People with names, specific lives, in their own words.",
  "painPoints.magazine.payoff":
    "I pitched on a Tuesday and it ran in the next issue.",
  "painPoints.magazine.payoff2":
    "Last issue had a profile of the woman who runs the bakery on my street.",
  "painPoints.magazine.cta": "Read the magazine",
  "painPoints.magazine.modal.title":
    "Written by the people <em>living it.</em>",
  "painPoints.magazine.modal.lede":
    "Essays, profiles and reporting from queer Lisbon, commissioned, written and edited by members.",
  "painPoints.magazine.modal.a.title": "How it works",
  "painPoints.magazine.modal.a.body":
    "Pitch an idea and an editor answers. Pieces run in issues, with a named writer and a named editor on every one.",
  "painPoints.magazine.modal.b.title": "What it gives you",
  "painPoints.magazine.modal.b.body":
    "Stories about people you could meet this week, with names, streets and specifics.",
  "painPoints.magazine.modal.c.title": "How it powers QueerPulse",
  "painPoints.magazine.modal.c.body":
    "The magazine is how the community keeps its own record, so nobody outside decides which three stories get told about it.",

  "painPoints.cinema.label": "Cinema",
  "painPoints.cinema.question":
    "My documentary screened once at a festival and then it disappeared.",
  "painPoints.cinema.question2":
    "And half the films I want to see never get a Lisbon date.",
  "painPoints.cinema.heading": "So we're building <em>a film co-op.</em>",
  "painPoints.cinema.body":
    "A community-owned home for queer film: a weekly programme, work made here, and the people who made it there to talk about it. It is still being built.",
  "painPoints.cinema.payoff":
    "When it opens, the documentary finally has somewhere to live.",
  "painPoints.cinema.payoff2": "Put me down for the first screening.",
  "painPoints.cinema.cta": "Look inside Cinema",
  "painPoints.cinema.modal.title":
    "Queer film, <em>with somewhere to live.</em>",
  "painPoints.cinema.modal.lede":
    "A community-owned home for queer film: a weekly programme, work made here, and the people who made it there to talk about it.",
  "painPoints.cinema.modal.a.title": "How it will work",
  "painPoints.cinema.modal.a.body":
    "Members programme the season, and work made here gets a run of its own with the filmmaker present.",
  "painPoints.cinema.modal.b.title": "What it will give you",
  "painPoints.cinema.modal.b.body":
    "A weekly screening you can plan your month around, and films that would otherwise never get a Lisbon date.",
  "painPoints.cinema.modal.c.title": "How it powers QueerPulse",
  "painPoints.cinema.modal.c.body":
    "The members who fund it own it, so what gets shown answers to the people watching.",

  "painPoints.studio.label": "Studio",
  "painPoints.studio.question":
    "I put an EP out last year and the platform kept most of what it earned.",
  "painPoints.studio.question2":
    "And I pay for streaming every month with no idea how little of it reaches the artist.",
  "painPoints.studio.heading": "So we're building <em>a music co-op.</em>",
  "painPoints.studio.body":
    "Artist-owned music: releases, live sets and sheet music, with the payouts and the rules set by the people making the work. It is still being built.",
  "painPoints.studio.payoff": "The next release goes up there first.",
  "painPoints.studio.payoff2":
    "When it opens, I will finally know where my ten euros a month goes.",
  "painPoints.studio.cta": "Look inside Studio",
  "painPoints.studio.modal.title":
    "Artist-owned music, <em>paid properly.</em>",
  "painPoints.studio.modal.lede":
    "Releases, live sets and sheet music from queer artists, with the payouts and the rules set by the people making the work.",
  "painPoints.studio.modal.a.title": "How it will work",
  "painPoints.studio.modal.a.body":
    "Artists upload and price their own work, and the split is published where anyone can read it.",
  "painPoints.studio.modal.b.title": "What it will give you",
  "painPoints.studio.modal.b.body":
    "You can see how much of what you spend reaches the person who made the record.",
  "painPoints.studio.modal.c.title": "How it powers QueerPulse",
  "painPoints.studio.modal.c.body":
    "Same co-op logic as Cinema: members own it, artists set the terms, and the money stays inside the community.",

  "painPoints.wellbeing.label": "The safety net",
  "painPoints.wellbeing.question":
    "I want a therapist who already understands queer relationships, so the first session is about me.",
  "painPoints.wellbeing.question2":
    "I looked for a therapist for months and gave up twice.",
  "painPoints.wellbeing.heading": "So we built <em>a safety net.</em>",
  "painPoints.wellbeing.body":
    "Queer-friendly therapists, peer support and trusted resources in one place, with how to reach each one.",
  "painPoints.wellbeing.payoff":
    "I had a name and a number the same evening, from someone who had been to them.",
  "painPoints.wellbeing.payoff2":
    "The third name was the one that stuck. Six months in now.",
  "painPoints.wellbeing.cta": "See wellbeing resources",
  "painPoints.wellbeing.modal.title":
    "Somewhere to turn <em>before it is urgent.</em>",
  "painPoints.wellbeing.modal.lede":
    "Queer-friendly therapists, peer support and trusted resources, gathered by the members who used them.",
  "painPoints.wellbeing.modal.a.title": "How it works",
  "painPoints.wellbeing.modal.a.body":
    "Browse by what you need, with how to reach each one. The crisis resources stay public and reachable without an account.",
  "painPoints.wellbeing.modal.b.title": "What it gives you",
  "painPoints.wellbeing.modal.b.body":
    "Names that come from people who actually went, so the first session can be about you.",
  "painPoints.wellbeing.modal.c.title": "How it powers QueerPulse",
  "painPoints.wellbeing.modal.c.body":
    "Care is the part most platforms leave out. Keeping it beside the social side is what makes the rest worth being part of.",

  "painPoints.activism.label": "A way to act",
  "painPoints.activism.question":
    "I have two free hours on Saturdays and no idea which association actually needs them.",
  "painPoints.activism.question2":
    "There is a collective four streets from me. I found it from a poster in a café.",
  "painPoints.activism.heading": "So we built <em>a way to act.</em>",
  "painPoints.activism.body":
    "See the associations and collectives doing the work near you, what each role asks of you, and how many hours it takes.",
  "painPoints.activism.payoff":
    "Two hours on a Saturday, at a food bank ten minutes from my house.",
  "painPoints.activism.payoff2":
    "I knew what the role involved before I said yes. That is why I kept going back.",
  "painPoints.activism.cta": "Find a role",
  "painPoints.activism.modal.title": "Two free hours, <em>put to work.</em>",
  "painPoints.activism.modal.lede":
    "The associations and collectives doing the work near you, with what each role actually asks of you.",
  "painPoints.activism.modal.a.title": "How it works",
  "painPoints.activism.modal.a.body":
    "Browse roles by cause and neighbourhood. Each one states the hours, the commitment and who to talk to, and you apply through the platform.",
  "painPoints.activism.modal.b.title": "What it gives you",
  "painPoints.activism.modal.b.body":
    "You know what you are saying yes to before you say it, which is why people keep going back.",
  "painPoints.activism.modal.c.title": "How it powers QueerPulse",
  "painPoints.activism.modal.c.body":
    "Organisations post their own roles and review their own applicants, so the platform stays useful to groups that were doing this long before it existed.",

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
  "gatherings.title": "Meet <em>in person.</em>",
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
  // LiveStories.tsx — the same section sourced from published magazine pieces.
  "liveStories.byline": "{author} · {minutes} min read",
  "liveStories.issueKicker": "Issue {number}",
  "liveStories.magazineKicker": "From the magazine",

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
    "Search or filter the list, then open any community to see it in full: what it is, what it does, who's inside, and what you unlock by joining.",
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
  "housing.explainerCta": "How housing works here",
  "housing.ctaNote": "Everyone here is part of the same trusted network.",

  // Signed-out explainer behind the single housing CTA (HousingExplainerModal).
  // Every row is something the section above does NOT already say, and every
  // row is grounded in code — see the header comment in housingExplainer.data.ts
  // for which surface backs which line.
  "housingExplainer.eyebrow": "Housing here",
  "housingExplainer.title": "A board of rooms, and <em>the rest of it.</em>",
  "housingExplainer.titlePlain": "A board of rooms, and the rest of it",
  "housingExplainer.lede":
    "The listings are one part of it. Here is what else sits behind the door, and why there is a door at all.",
  "housingExplainer.pillars.groups.title": "Groups that screen themselves",
  "housingExplainer.pillars.groups.body":
    "Small housing groups where the members decide who gets in and each group keeps its own house rules. Rooms shared inside a group stay inside it, and no broker gets a look in.",
  "housingExplainer.pillars.viewings.title":
    "The street address waits for a yes",
  "housingExplainer.pillars.viewings.body":
    "A listing shows you its area until the person letting it accepts your viewing, and only then does the exact address open up. Afterwards you both write a review, and neither of you reads the other's until both are in.",
  "housingExplainer.pillars.door.title": "Why the board has a door",
  "housingExplainer.pillars.door.body":
    "An open board gets copied onto listing sites and mined by people running deposit scams, so the rooms and the flatmate profiles ask you to be a member first. Our plain guide to spotting a scam and knowing your rights as a tenant in Portugal sits behind the same door.",
  "housingExplainer.note":
    "Housing co-ops are the one part you can read right now: <coop>see who is organising a home together</coop>.",
  "housingExplainer.requestInviteCta": "Request an invite",
  "housingExplainer.signInCta": "I'm already a member",
  "housing.tabRoom": "The room",
  "housing.tabLandlord": "The landlord",
  "housing.postedByMember": "Posted by a member",
  "housing.bringToFrontAria": 'Bring "{label}" to the front',
  // Says "edit or remove" rather than "reply or remove": a landlord genuinely
  // cannot touch a review, and equally genuinely HAS a right of reply that
  // staff publish for them (LandlordsService.publishLandlordReply). The
  // explainer modal below is where that gets the room to be explained.
  "housing.reviewsFootNote":
    "Written by members who lived there. Landlords can't edit or remove them.",
  "housing.reviewsFootCta": "How reviews work",

  // "How reviews work" explainer modal (HousingReviewsExplainerModal). Every
  // claim here is enforced by LandlordsService on the backend; see the comment
  // in housingReviewsExplainer.data.ts for which method backs which line.
  "housing.reviewsExplainer.eyebrow": "Landlord reviews",
  "housing.reviewsExplainer.title":
    "Written by people who <em>lived</em> there",
  "housing.reviewsExplainer.titlePlain": "Written by people who lived there",
  "housing.reviewsExplainer.lede":
    "Everything you read about a landlord comes from a member who rented from them. Here is who gets to write one, what the landlord can do about it, and what we never claim.",
  "housing.reviewsExplainer.rules.livedThere.title":
    "Only past tenants can write one",
  "housing.reviewsExplainer.rules.livedThere.body":
    "To review a landlord you have to say you rented from them and give the months you were there. One review per member per landlord, so nobody can pile on, and you can go back and rewrite your own.",
  "housing.reviewsExplainer.rules.rightOfReply.title":
    "Landlords get a right of reply",
  "housing.reviewsExplainer.rules.rightOfReply.body":
    'Landlords hold no account here, so they cannot edit a review, hide one, or make it disappear. Under every review sits an "Are you this landlord?" link to a public form, and our team publishes their answer beneath it in their own words.',
  "housing.reviewsExplainer.rules.reportable.title":
    "Anything false can be reported",
  "housing.reviewsExplainer.rules.reportable.body":
    "Every review carries a report link. Moderators can withhold one while they look into it, and a withheld review stops counting towards the landlord's rating.",
  "housing.reviewsExplainer.note":
    "We do not verify tenancies. A review is one member's own account, made in their own name under a verified phone number, and it is labelled self-reported everywhere it appears so you can weigh it yourself.",
  "housing.reviewsExplainer.browseCta": "Browse housing",
  "housing.reviewsExplainer.closeCta": "Got it",

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
  "subprofiles.cta": "Explore personas",
  "subprofiles.ctaNote": "Three personas are included with every account.",
  "personasExplainer.eyebrow": "Members-only",
  "personasExplainer.title": "Personas live <em>behind the door</em>",
  "personasExplainer.titlePlain": "Personas live behind the door",
  "personasExplainer.lede":
    "The directory you just tried to open is a member surface. Here is what sits on the other side of it.",
  "personasExplainer.pillars.directory.title":
    "Personas get a directory of their own",
  "personasExplainer.pillars.directory.body":
    "Members browse by persona, so the side of you taking bookings is the side that turns up in a search. That page only exists once you're in.",
  "personasExplainer.pillars.coOwned.title":
    "A persona can be run by two people",
  "personasExplainer.pillars.coOwned.body":
    "Invite a co-owner and you both work on it. If one of you hands it back and leaves, the persona stays standing.",
  "personasExplainer.pillars.behindTheDoor.title":
    "Discretion needs a closed door",
  "personasExplainer.pillars.behindTheDoor.body":
    "Set a persona to members-only and anyone signed out meets a wall where the page would be. That only holds up while the whole directory is invite-only.",
  "personasExplainer.note":
    "Recommendations and followers land on a single persona, so what one side of you builds up stays with that side.",
  "personasExplainer.requestInviteCta": "Request an invite",
  "personasExplainer.signInCta": "I'm already a member",
  "subprofiles.proofEverywhereNote":
    "One profile tends to become the version of you that's easiest to explain. The rest gets left out.",
  "subprofiles.everywhereElse": "Everywhere else",
  "subprofiles.onQueerPulse": "On QueerPulse",
  "subprofiles.proofCrampRoles": "drag performer · ceramicist · music critic",
  "subprofiles.pickerLabel": "Choose a side to preview",
  "subprofiles.oneAccount": "One account",
  "subprofiles.stage.lede":
    "Designer by day, DJ at night, or a side of yourself you'd rather keep separate. Give each one a persona with its own page, its own audience and its own visibility.",
  "subprofiles.stage.audienceHeading": "Who sees this",
  "subprofiles.visibility.open": "Open to everyone",
  "subprofiles.visibility.openHelp": "Anyone in the community can find it.",
  "subprofiles.visibility.network": "Your network",
  "subprofiles.visibility.networkHelp":
    "Only people you're connected with can see it.",
  "subprofiles.link.main": "Main profile",
  "subprofiles.link.mainHelp": "The profile people already know you by.",
  "subprofiles.link.linked": "Linked to your name",
  "subprofiles.link.linkedHelp":
    "Shown on your main profile, so people can tell it's you.",
  "subprofiles.link.standalone": "Standalone",
  "subprofiles.link.standaloneHelp":
    "It stands on its own, apart from your main profile.",

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
  "subprofiles.personas.mara.laneLabel": "drag",

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
  "subprofiles.personas.atelier.laneLabel": "ceramics",

  "subprofiles.personas.byline.role": "Music criticism",
  "subprofiles.personas.byline.sub": "Bylines in three magazines since 2021",
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
  "subprofiles.personas.byline.laneLabel": "music writing",

  // ── Outro (final CTA) ──────────────────────────────────────────────────────
  "outro.title": "Walk in where you <em>already belong.</em>",
  "outro.sub":
    "QueerPulse is an invite-only community built on trust, curiosity, and the belief that meaningful connections can change lives and cities.",
  "outro.cta": "Request an invite",
};

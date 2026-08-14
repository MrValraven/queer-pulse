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
    "QueerPulse: Lisbon's queer community, online and in real life",
  "meta.description":
    "An invite-only queer community for Lisbon, in person as much as online: gatherings, skill swaps, and mutual support, among people who show up for each other.",

  // ── Hero ───────────────────────────────────────────────────────────────────
  "hero.eyebrow": "Live in Lisboa",
  "hero.title": "Your people, <em>right here in Lisboa.</em>",
  "hero.sub":
    "Where queer Lisbon actually finds each other, in person as much as online. Everyone here was vouched in by someone already inside, so the whole room chose to be. A community that belongs to the people in it.",
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
    "Membership is invite-only and vouched, because trust is the whole point. Everyone in the room chose to be here, for each other.",
  "manifesto.safetyCta": "How we keep this safe",
  "manifesto.assurance.vouched.title": "Invited or vouched",
  "manifesto.assurance.vouched.description":
    "Every member arrives through a vouch or a reviewed invite request.",
  "manifesto.assurance.safeSpaces.title": "Safe spaces we've been to",
  "manifesto.assurance.safeSpaces.description":
    "Venues our mod team visits in person, re-verified on a date you can see.",
  "manifesto.assurance.encrypted.title": "End-to-end encrypted",
  "manifesto.assurance.encrypted.description":
    "Direct messages are encrypted: private conversations stay private.",
  "manifesto.assurance.privacy.title": "You control what's visible",
  "manifesto.assurance.privacy.description":
    "Set your profile, photos, and activity to public, members-only, or just for you.",
  "manifesto.assurance.moderation.title": "Moderated around the clock",
  "manifesto.assurance.moderation.description":
    "Reports get a real response, usually within hours.",

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
    "Every member here is vouched for by someone already inside: no swiping, no cold DMs, no proving yourself to strangers.",
  "painPoints.hero1.builtLabel": "We built the vouch network",
  "painPoints.hero1.cta": "Meet the community",

  "painPoints.marker1": "Once you're in the room, more doors open.",

  "painPoints.exchange1.question":
    '"I need a favour, but I don\'t know who to ask."',
  "painPoints.exchange1.heading": "So we built <em>the board.</em>",
  "painPoints.exchange1.body":
    "Post what you need or what you can offer, from a spare room to a same-day translation, and let the community answer.",
  "painPoints.exchange1.cta": "Browse the board",

  "painPoints.exchange2.question":
    '"I want to spend my money with people like me."',
  "painPoints.exchange2.heading": "So we built <em>the directory.</em>",
  "painPoints.exchange2.body":
    "Queer-owned shops, studios, and services across Lisbon: easy to find, easy to support.",
  "painPoints.exchange2.cta": "Browse the directory",

  "painPoints.exchange3.question":
    '"I want to host something, I just don\'t know how."',
  "painPoints.exchange3.heading": "So we built <em>a way to host.</em>",
  "painPoints.exchange3.body":
    "A step-by-step guide to running your first supper club, workshop, or screening, with community support behind you.",
  "painPoints.exchange3.cta": "Start hosting",

  "painPoints.exchange4.question":
    '"I have a skill to teach, and one I want to learn."',
  "painPoints.exchange4.heading": "So we're building <em>skill swaps.</em>",
  "painPoints.exchange4.body":
    "Trade what you know for what you need. No invoices, no algorithm: just people teaching each other. Coming soon.",
  "painPoints.exchange4.cta": "See it on the roadmap",

  "painPoints.hero2.eyebrow": "The gap we felt hardest",
  "painPoints.hero2.question": '"What if I\'m not okay?"',
  "painPoints.hero2.heading": "So we built <em>a safety net.</em>",
  "painPoints.hero2.body":
    "Therapists who get it, peer support that doesn't judge, and crisis lines that pick up: all vetted by the community that needs them.",
  "painPoints.hero2.builtLabel": "We built the wellbeing hub",
  "painPoints.hero2.cta": "See wellbeing resources",

  "painPoints.marker2": "And beyond the room, the harder questions.",

  "painPoints.exchange5.question":
    '"I want to do something, not just post about it."',
  "painPoints.exchange5.heading": "So we built <em>a way to act.</em>",
  "painPoints.exchange5.body":
    "Local campaigns, mutual aid, and organising: real ways to make something happen, together.",
  "painPoints.exchange5.cta": "Get involved",

  "painPoints.exchange6.question": '"Do I actually know my rights here?"',
  "painPoints.exchange6.heading": "So we built <em>plain-language guides.</em>",
  "painPoints.exchange6.body":
    "Clear legal information for LGBTQ+ life in Portugal: no law degree required.",
  "painPoints.exchange6.cta": "Read the guides",

  "painPoints.exchange7.question": '"Will I actually be safe at this job?"',
  "painPoints.exchange7.heading": "So we're building <em>employer reviews.</em>",
  "painPoints.exchange7.body":
    "Honest ratings from queer employees, so you know before you accept the offer. Coming soon.",
  "painPoints.exchange7.cta": "See it on the roadmap",

  // ── Discovery (member highlight) ─────────────────────────────────────────
  "discovery.eyebrow": "{count}+ members and counting",
  "discovery.title": "Everyone here is <em>real.</em>",
  "discovery.sub":
    "Every face here is a genuine, vouched member of queer Lisbon: a real portrait of someone you could actually say hello to.",
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
    "A few communities our team wanted you to see: real rooms, kept by real people.",
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

  // ── Newsletter ─────────────────────────────────────────────────────────────
  "newsletter.title": "Stay connected. <em>Once a week.</em>",
  "newsletter.subtitle":
    "The QueerPulse digest lands every Thursday: new members to meet, upcoming gatherings, open skill swaps, and one piece of writing worth your time. No noise.",
  "newsletter.emailRequiredToast": "Please enter your email",
  "newsletter.subscribedToast": "You're on the list, see you Thursday",
  "newsletter.success.title": "You're on the list, <em>almost.</em>",
  "newsletter.success.body":
    "We'll start sending the <strong>Weekly digest</strong> to <strong>{email}</strong> every Thursday.",
  "newsletter.success.checkInboxNote":
    "You're all set: no confirmation email needed. You can change or stop this anytime from your settings.",
  "newsletter.success.useDifferentEmailCta": "Use a different email",
  "newsletter.emailPlaceholder": "your@email.com",
  "newsletter.subscribeCta": "Subscribe",
  "newsletter.note": "Members only · no spam · unsubscribe anytime",
  "newsletter.comingSoon":
    "The weekly digest isn't sending yet. We're still building it. Once it's live, you'll be able to subscribe right here.",
  // Live double-opt-in: honest "confirm from your inbox" messaging, distinct from
  // the demo flow above (which fakes an instant subscribe with no email).
  "newsletter.live.success.title": "Almost there, <em>check your inbox.</em>",
  "newsletter.live.success.body":
    "We just sent a confirmation link to <strong>{email}</strong>. Open it and you'll start getting the Weekly digest every Thursday.",
  "newsletter.live.success.checkInboxNote":
    "Didn't get it? Give it a minute, then check your spam folder. Nothing is sent until you confirm.",
  "newsletter.live.errorToast":
    "Something went wrong on our end. Please try again in a moment.",
  "newsletter.live.submittingCta": "Sending…",

  // ── Outro (final CTA) ──────────────────────────────────────────────────────
  "outro.title": "Walk into a room where you <em>already belong.</em>",
  "outro.sub":
    "Membership is by invitation and kept small on purpose. If someone you trust is already here, ask them to vouch for you.",
  "outro.cta": "Request an invite",
};

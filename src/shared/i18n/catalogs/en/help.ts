import type { Catalog } from "../../types";

/**
 * "About this screen" help copy, surfaced by the <FeatureHelp> info button.
 *
 * Shared chrome keys come first; per-screen entries follow, keyed
 * `<featureGroup>.<screen>` and sorted by id. Each screen has exactly four
 * keys — `.title`, `.intro`, `.use` (steps joined with "\n"), `.demo` — so
 * EN/PT parity stays trivial. Keep this file and `pt/help.ts` in lockstep;
 * the parity test enforces it.
 */
export const help: Catalog = {
  // Shared chrome
  "trigger.label": "About this screen: {screen}",
  eyebrow: "How to use this",
  useHeading: "How to use it",
  demoLabel: "In the demo",
  got: "Got it",

  // Per-screen entries (id-sorted; keep en/help.ts and pt/help.ts in lockstep)
  "admin.hub.title": "Admin dashboard",
  "admin.hub.intro":
    "Your daily flight deck for keeping the platform safe and healthy. It surfaces what needs a human right now, plus the trends that tell you how the community is doing.",
  "admin.hub.use":
    "Start with the triage banner at the top: it counts everything waiting for a moderator.\nClick a queue item to jump straight into moderation.\nScan the charts below for reports by type, member growth, and response times.",
  "admin.hub.demo":
    'the banner might read "12 things need a human", with safety emergencies flagged first.',
  "admin.listings.title": "Listings",
  "admin.listings.intro":
    "The review desk for member-submitted directory listings: the queer-friendly venues, cafés, and shops people add to the map. You decide what goes live.",
  "admin.listings.use":
    "Filter by status: In review, Question, or Live.\nOpen a listing to preview its photos, details, and who submitted it.\nMove it to Live, send the owner a quick question, or remove it.",
  "admin.listings.demo":
    'a submission like "Maison Du Tiago" in Príncipe Real waits in review until you approve it.',
  "admin.members.title": "Members",
  "admin.members.intro":
    "The directory of everyone on the platform, and the place to keep it trustworthy. Verify newcomers, review flagged accounts, and manage roles.",
  "admin.members.use":
    "Use the tabs to move between all members, pending verifications, and flagged accounts.\nSearch by name or pronoun, or filter to verified and new members.\nClick anyone to open their profile, adjust their role, or take action.",
  "admin.members.demo":
    "profiles like Sofia Almeida (she/they), a moderator, sit alongside newly joined members awaiting verification.",
  "admin.moderation.title": "Moderation queue",
  "admin.moderation.intro":
    "Where reports from the community land so a moderator can review and act. Everything here is waiting on a human decision, with the most urgent surfaced first.",
  "admin.moderation.use":
    "Switch between the Open, Appeals, and Resolved tabs to see each stage.\nFilter to emergencies, or just the reports assigned to you.\nClick a report to open the full context and record your decision.",
  "admin.moderation.demo":
    'an emergency report like "Home address shared in a DM screenshot" sits at the top of the queue, flagged for immediate review.',
  "auth.onboarding.title": "Onboarding",
  "auth.onboarding.intro":
    "This short, guided wizard sets up your profile the moment you join. Over a few steps you add a photo, agree to the community norms, tell us what brings you here, and pick a few communities to follow, so the network feels like yours from day one.",
  "auth.onboarding.use":
    'Follow the "Step X of N" steps in order; you can go back at any point.\nAdd a photo and choose the intentions that fit you.\nPick a few communities to join, then finish on the "you\'re all set" screen.',
  "auth.onboarding.demo":
    "on the intentions step you might tap chips like Gatherings & events, Community or Housing to shape what you see.",
  "cinema.hub.title": "Cinema",
  "cinema.hub.intro":
    "A curated queer cinema: features, documentaries and shorts programmed each week, with most of what you pay going straight to the filmmakers. Come to watch, but also to support the people making the work.",
  "cinema.hub.use":
    "Browse the week's programme and open a film to read who made it and how to watch.\nWatch free titles, or rent or join to unlock members' films.\nUse the sections to explore collections, live Q&As and open calls for filmmakers.",
  "cinema.hub.demo":
    'the cover film is "The light between rooms" by Maria Vasconcelos, alongside features like "A summer in Cascais."',
  "communities.hub.title": "Communities",
  "communities.hub.intro":
    "This is where you find your people. Communities are member-run groups built around a shared interest, identity or cause. Browse them, then join the ones that feel like home.",
  "communities.hub.use":
    "Skim the cards to see what each community is about.\nTap a category chip to filter by vibe: social, arts, activism, support and more.\nOpen one to read its full page, or hit Join to become a member.",
  "communities.hub.demo":
    "groups like Queer Runners Lisboa for weekend runs or Rainbow Arts Collective for makers.",
  "community.detail.title": "Community",
  "community.detail.intro":
    "The home page of a single community: who's in it, what it's about, and everything happening inside. From here you can join, save it for later, or dive into its tabs.",
  "community.detail.use":
    "Read the intro and meta to get a feel for the group.\nJoin to unlock posting and RSVPs, or save it to revisit later.\nUse the tabs to explore the pulse, discussion, members and events.",
  "community.detail.demo":
    "a group like Queer Runners Lisboa, with its members, cadence and next meet-up all in one place.",
  "community.events.title": "Events",
  "community.events.intro":
    "Everything the community is gathering for: the next meet-up up top, with past ones and their recaps below. This is how a group turns online into offline.",
  "community.events.use":
    "Check the upcoming event and RSVP to save your spot.\nBrowse past events to see what the group has done.\nOpen any event for the full details and location.",
  "community.events.demo":
    'an outing like "June Pride 10 km" with Queer Runners Lisboa, ready for you to RSVP.',
  "community.forum.title": "Discussion",
  "community.forum.intro":
    "The community's conversation board. Members start threads to ask questions, share news and plan things together. Search what's there, or add your own.",
  "community.forum.use":
    "Search or filter to find a thread that interests you.\nOpen a thread to read the replies and add yours.\nStart a new post from the box at the bottom (members only).",
  "community.forum.demo":
    'a thread like "June meetup: where should we go?" where members weigh in with ideas.',
  "connect.connections.title": "Connections",
  "connect.connections.intro":
    "This is your relationship hub: everyone you're connected to, plus the requests, vouches and blocks around them. It's how you keep track of your circle here.",
  "connect.connections.use":
    "Switch tabs to see connections, incoming and sent requests, vouches or blocks.\nAccept or decline requests waiting for you.\nMessage a connection or invite someone new.",
  "connect.connections.demo":
    "connections like Catarina, who vouched for you, sit alongside incoming requests such as one from Daniel.",
  "culture.hub.title": "Culture",
  "culture.hub.intro":
    "The home for queer arts and nightlife: book, film and music clubs, open commissions for artists, a showcase of work made in the community, and a live radio room. It's where creative life on the platform gathers.",
  "culture.hub.use":
    'Switch tabs to move between the Club, Commissions, Showcase and Radio.\nOpen a club pick or showcase project to see who made it and how to take part.\nTap "Submit your work" to put your own project in front of the community.',
  "culture.hub.demo":
    'the Book Club is reading Giovanni\'s Room, while the Showcase features "Portraits of Queer Elders in Mouraria" by Inês Tavares.',
  "economy.grants.title": "Grants",
  "economy.grants.intro":
    "A curated map of funding for queer projects and people: from community micro grants to Portuguese foundations and EU programmes. It saves you the hunt and shows what each fund is really for.",
  "economy.grants.use":
    "Filter by who it's for: individuals, organisations, arts, or EU-wide.\nOpen a grant to see the amount, deadline status, and how to frame an application.\nRead the short guide on writing a strong, honest application.",
  "economy.grants.demo":
    "the QueerPulse Micro Grant offers €200–€2,000 for queer projects in Lisbon, with decisions made by a rotating community panel rather than a board.",
  "economy.hub.title": "Economy",
  "economy.hub.intro":
    "The Economy hub is where the community's working life lives: a home base for finding jobs, growing a freelance practice, and learning what fair pay looks like. It gathers the incubator, the freelancer toolkit, and salary transparency in one place.",
  "economy.hub.use":
    "Switch between the Incubator, Freelance, and Salary tabs to explore each side.\nBrowse queer-run jobs or open the freelancer tools you need.\nCheck the salary tables to sanity-check what a role should pay.",
  "economy.hub.demo":
    "the Salary tab shows a UX Designer in Lisbon around €38,000, so you can see what real roles pay before you negotiate.",
  "economy.jobs.title": "Jobs",
  "economy.jobs.intro":
    "A jobs board for roles at queer-run, queer-led, and genuinely inclusive workplaces. Every listing carries safety signals so you know what you're walking into. It's where the community hires the community.",
  "economy.jobs.use":
    "Filter by category like design, tech, or care to narrow the board.\nOpen a listing to read the full role, the offer, and who reviews applications.\nBookmark the ones you like, , or post your own with “Post a job”.",
  "economy.jobs.demo":
    "a listing like Junior Graphic Designer at Atelier Pulso, a queer-run studio in Príncipe Real, where applications are read by the founder herself.",
  "economy.skills.title": "Skills",
  "economy.skills.intro":
    "A skill-share board where members offer what they know and ask for what they want to learn: from branding to backend engineering to wheel-throwing. It's peer teaching, kept free and shared within the community.",
  "economy.skills.use":
    "Browse by category, or look under “Offering” and “Looking to learn”.\nReach out to a member whose offer fits what you need.\nShare your own skill, or list a workshop for others to join.",
  "economy.skills.demo":
    "an offer like Inês teaching visual identity and branding one-to-one in her studio, or someone looking to learn fundraising for a community project.",
  "economy.tools.title": "Invoice generator",
  "economy.tools.intro":
    "A free invoice generator that turns your details into a print-ready fatura-recibo, right in the browser. No account, no data leaves your device. Built for freelancers navigating Portuguese self-employment.",
  "economy.tools.use":
    "Fill in your details and your client's, then add line items for the work.\nSet the IVA rate, or mark yourself exempt if that applies.\nDownload the PDF to print or send.",
  "economy.tools.demo":
    "a sample invoice starts with a line like “Brand identity: logo + guidelines” at €1,200, so you can see the layout before editing your own.",
  "events.detail.title": "Event",
  "events.detail.intro":
    "The full page for a single gathering: what it is, when and where it happens, who's hosting, and how many spots are left. Everything you need to decide whether to come along.",
  "events.detail.use":
    "Read the description and check the date, neighbourhood, and host.\nGlance at the spots line to see how much room is left.\nTap the main button to reserve a seat, RSVP, or message the host.\nBrowse more gatherings from the rail at the bottom.",
  "events.detail.demo":
    "a page like Inside Beatriz's Ceramics Studio in Graça, hosted by Beatriz: a slow Sunday with the kiln, tea, and clay to touch, limited to a handful of people.",
  "events.hub.title": "Events",
  "events.hub.intro":
    "This is where you find out what's on across the queer community: gatherings we host and ones run by people in the network, all in one place. It's the fastest way to see what's happening tonight, this week, or later this month.",
  "events.hub.use":
    "Start on Highlights for a hand-picked few worth showing up for.\nSwitch to Browse to scroll everything upcoming and load more as you go.\nOpen Calendar to see events laid out by date.\nTap any event to read the details and RSVP.",
  "events.hub.demo":
    "the lead spot might feature something like Queer Supper Club №12 in Mouraria: twelve seats, wine brought by guests, address shared the morning of.",
  "feed.hub.title": "Feed",
  "feed.hub.intro":
    "Your feed is the home timeline: a running pulse of what your communities, gatherings and people are posting, so you always know what's happening without hunting for it.",
  "feed.hub.use":
    "Switch tabs to filter by communities, gatherings, new people or posts.\nScroll to catch up on the latest activity.\nLike, reply or connect straight from a card.\nOpen the sidebar to see suggested members and upcoming gatherings.",
  "feed.hub.demo":
    "a post like Anika Kovač in the Trans & Non-Binary Network asking for a queer-friendly GP in Lisbon, with members replying with recommendations.",
  "forum.hub.title": "Forum",
  "forum.hub.intro":
    "The forum is where the community thinks out loud together: longer conversations about housing, health, activism, arts and everyday life, organised so you can find and follow what matters to you.",
  "forum.hub.use":
    "Browse the latest threads, or pick a category in the sidebar to narrow the topic.\nSort by newest or most active to see what's moving right now.\nTap a thread to read the full discussion and add your reply.\nUse New post to start your own conversation.",
  "forum.hub.demo":
    'threads like "Honest guide to finding a flat in Lisbon as a newcomer" or "Proposal: Monthly queer film night at Cinema São Jorge", sorted into categories like Housing and Arts.',
  "forum.thread.title": "Thread",
  "forum.thread.intro":
    "This is a single discussion in full: the original post at the top, followed by everyone's replies. It's the place to read the whole conversation and add your own voice.",
  "forum.thread.use":
    "Read the original post and the replies beneath it.\nLike or bookmark posts you want to remember, and sort replies oldest or newest.\nWrite in the reply box to answer the thread, or reply under a specific comment to keep a sub-thread together.\nUse the report option if something breaks the community guidelines.",
  "forum.thread.demo":
    'a thread like "Trans-affirming healthcare in Lisbon: the full guide", where members share affirming clinics and answer each other\'s questions.',
  "governance.hub.title": "Governance",
  "governance.hub.intro":
    "The open window into how QueerPulse is run: who decides, how money is spent, and how the community stays safe. Transparency is the whole point.",
  "governance.hub.use":
    "Use the side nav to jump between health, moderation, the council, principles, finances, and decisions.\nRead the quarterly health snapshot to see how the platform is doing.\nOpen a governing document, like the constitution or transparency report, for the full detail.",
  "governance.hub.demo":
    "the finances section shows where member contributions go, alongside the council members steering the platform.",
  "home.landing.title": "Welcome",
  "home.landing.intro":
    "This is the front door to QueerPulse: a small, member-run network for queer people in Lisboa, where every member is vouched in rather than chasing followers. The homepage is your quick tour of what you'll find inside: people, communities, gatherings and support.",
  "home.landing.use":
    "Read the hero and scroll down to see who's here and what the network is for.\nRequest an invite to start your own membership.\nExplore members and communities to get a feel before you join.",
  "home.landing.demo":
    'the landing sets the tone with lines like "A queer network, rooted in Lisbon": a vouched-in network of people you actually know.',
  "housing.flatmates.title": "Flatmates",
  "housing.flatmates.intro":
    "Profiles of people looking to share a home: both those offering a room and those seeking one. It's a gentler way to find housemates who actually fit, before there's even a lease.",
  "housing.flatmates.use":
    "Filter by area, budget, move-in date and lifestyle tags.\nRead a profile to see what someone's like to live with.\nSay hello to start a conversation.\nPost your own profile so others can find you.",
  "housing.flatmates.demo":
    "profiles like a plant-loving, work-from-home person seeking a room around €700–900.",
  "housing.hub.title": "Housing",
  "housing.hub.intro":
    "Homes and rooms shared by and for the community, so you can find a place to live among people who get you. Switch to the Flatmates tab to find the people behind the rooms.",
  "housing.hub.use":
    "Browse the Housing tab for rooms, flats and sublets.\nUse the filters to match your budget, area and dates.\nOpen a listing to see photos and message the host.\nSwitch to Flatmates to find someone to share with.",
  "housing.hub.demo":
    "listings like a sunny one-bed in Príncipe Real, or a room in a shared flat in Arroios.",
  "housing.listing.title": "Housing listing",
  "housing.listing.intro":
    "The full details of one home or room: photos, price, what's included and who's offering it. This is where you get in touch and take the next step.",
  "housing.listing.use":
    "Look through the photos and read what's on offer.\nCheck the price, neighbourhood and move-in date.\nSave the listing or message the host directly.\nReport it if something doesn't seem right.",
  "housing.listing.demo":
    "a listing like a sunny one-bed in Príncipe Real, posted by a community member.",
  "local.directory.title": "Local Business directory",
  "local.directory.intro":
    "A living map of queer-run and queer-loving places across the city: cafés, bookshops, studios, bars and services worth your time. It's how you find the spots where you can just be yourself.",
  "local.directory.use":
    "Search or pick a category to narrow the list.\nOpen the Refine drawer to filter by vibe or safe-space verification.\nSwitch between List and Map to browse the way you prefer.\nTap a place to see its full details.",
  "local.directory.demo":
    "browse spots like Livraria Bertha, a queer bookshop, or the Queer Supper Club.",
  "local.directoryDetail.title": "Place details",
  "local.directoryDetail.intro":
    "Everything about one place in the directory: photos, opening hours, what makes it welcoming, and how to get there. This is where you decide if it's your kind of spot.",
  "local.directoryDetail.use":
    "Read the description, hours and safe-space status.\nSave the place or open it on the map.\nUse the report or suggest-edit links if something's off.\nOpen a related place to keep exploring nearby.",
  "local.directoryDetail.demo":
    "a page like Atelier Pulso, a creative studio, with its hours, photos and neighbourhood.",
  "magazine.hub.title": "Magazine",
  "magazine.hub.intro":
    "The community's magazine: reporting, essays and first-person stories about queer life, written by and for the people living it. It's where the platform slows down to tell the longer stories.",
  "magazine.hub.use":
    "Read the cover story, then browse features, essays and the back issues.\nFollow an author to keep up with their writing.\nPitch your own piece or story when you have something to tell.",
  "magazine.hub.demo":
    'the front page runs features like "Mouraria\'s chosen family, ten years later" and "The last queer bar in Bairro Alto that isn\'t trying."',
  "marketing.about.title": "About",
  "marketing.about.intro":
    "This page explains why QueerPulse exists and how it's run: a platform built on purpose, small by design, and owned by its community rather than by advertisers. It's the best place to understand our values before you commit.",
  "marketing.about.use":
    'Read "Why we exist" to see the gap this network was built to fill.\nCompare how we work against typical platforms in the side-by-side.\nOpen Governance or Contact from the bottom to see who runs it and reach us.',
  "marketing.about.demo":
    "the values spell it out plainly: small by design, no ad or data economy, and the value stays with the community.",
  "members.hub.title": "Members",
  "members.hub.intro":
    "This is the community directory: the whole membership in one place, so you can find the people you'd actually want to know. It's where connection starts.",
  "members.hub.use":
    "Search or scroll the grid of members.\nOpen Filters to narrow by identity, neighbourhood, discipline or language.\nTap a card to read someone's profile and reach out.",
  "members.hub.demo":
    "profiles like Inês, a graphic designer in Lisbon, sit beside dozens of other members you can filter down to.",
  "members.profile.title": "Public profile",
  "members.profile.intro":
    "This is a member's public profile: the version of someone that the open web can read, even without an account. It's how you introduce yourself beyond the community walls.",
  "members.profile.use":
    "Read the bio, pronouns and links up top.\nBrowse their public work and contributions below.\nRequest an invite if you're not a member yet.",
  "members.profile.demo":
    "a page like Inês Tavares' shows her tagline, bio and public work to anyone who visits the link.",
  "messages.conversation.title": "Conversation",
  "messages.conversation.intro":
    "An open chat thread. Read the history, reply in real time, and react, reply-quote, or forward any message.",
  "messages.conversation.use":
    "Type in the box at the bottom and press send.\nLong-press a message to react, reply, edit, or forward it.\nTap the star icon to see messages you've saved.\nOpen the name at the top to view their profile or group info.",
  "messages.conversation.demo":
    "a chat with someone like Jordan Park, where a starred message stays one tap away.",
  "messages.inbox.title": "Messages",
  "messages.inbox.intro":
    "Your private inbox. Every direct chat and group thread you're part of lives here, newest replies first.",
  "messages.inbox.use":
    "Pick a conversation from the list to open it.\nTap the pencil icon to start a new direct message.\nTap the group icon to spin up a group chat.\nSearch by name or by words inside past messages.",
  "messages.inbox.demo":
    "threads like a direct chat with Anika Kovač, or a group like the Pride Brunch Crew.",
  "myevents.hub.title": "Your events",
  "myevents.hub.intro":
    "Your personal home for everything you're going to, waitlisted for, hosting, saved, or invited to. One tidy place to keep track of your plans and never miss the door time.",
  "myevents.hub.use":
    "Use the pills to filter by going, hosting, saved, or invited.\nOpen an event to see its details or manage your RSVP.\nAccept or decline invitations right from the list.\nSwitch to the calendar to see your week at a glance.",
  "myevents.hub.demo":
    "you might see the Trans Joy Picnic at Jardim da Estrela among your plans: blankets, snacks to share, and a quiet corner if you need one.",
  "notifications.hub.title": "Notifications",
  "notifications.hub.intro":
    "Everything that happened while you were away: replies, mentions, new members, event updates and more, gathered in one place.",
  "notifications.hub.use":
    "Scroll to catch up on recent and earlier activity.\nUse the tabs to filter by type, or open Mentions to see where you were tagged.\nTap a notification to jump straight to it.\nHit Mark all read to clear the badge.",
  "notifications.hub.demo":
    "updates like Inês replying to you, or Diogo joining the Queer Classics community.",
  "resources.hub.title": "Wellbeing",
  "resources.hub.intro":
    "A directory of care and support for the queer community: affirming therapists, peer support, crisis lines and harm-reduction guidance, gathered in one place. Turn here when you or someone you love needs help.",
  "resources.hub.use":
    "Jump to the section you need: therapists, peer support, crisis or harm reduction.\nOpen a therapist's profile to see their approach and how to reach them.\nSave the crisis lines so they're there when you need them fast.",
  "resources.hub.demo":
    "you can find affirming therapists like Dra. Marta Seabra, alongside helplines such as SOS Voz Amiga and ILGA Portugal.",
  "safety.hub.title": "Safe spaces",
  "safety.hub.intro":
    "A community-vetted directory of venues that have earned a safe-space badge, plus an honest record of places that lost it. It helps you find somewhere you can relax as your whole self.",
  "safety.hub.use":
    "Browse verified safe spaces from the directory.\nOpen a place to read its promises, reviews, and vouches.\nNominate a venue you trust, or flag one that let the community down.",
  "safety.hub.demo":
    "the record stays transparent, so a venue that lost its badge, like Purex, keeps a note explaining why.",
  "settings.hub.title": "Settings",
  "settings.hub.intro":
    "This is where you shape how QueerPulse works for you. The sidebar groups every preference together, from notifications and privacy to your profile, theme, and account.",
  "settings.hub.use":
    "Pick a category from the sidebar to open its panel.\nAdjust the switches and options inside it.\nSave when the bar appears at the bottom, or discard to undo.",
  "settings.hub.demo":
    "the account panel shows your email and links to two-factor login and security, alongside categories like Notifications, Visibility, and Profile theme.",
  "settings.privacy.title": "Notification preferences",
  "settings.privacy.intro":
    "Decide exactly which nudges reach you and how. Turn on the ones that matter and mute the rest, so QueerPulse only pings you when it counts.",
  "settings.privacy.use":
    "Toggle each notification on or off by category.\nChoose how often email arrives, from instant to a daily digest.\nSet quiet hours so nothing buzzes overnight.",
  "settings.privacy.demo":
    "you can silence everything between 22:00 and 08:00 with quiet hours, while keeping new-message alerts on.",
  "studio.hub.title": "Studio",
  "studio.hub.intro":
    "A music platform built for queer artists, where the people who make the sets and tracks keep the lion's share of what you pay and tip. Listen to live sets, follow artists, and support them directly.",
  "studio.hub.use":
    "Play the set or track that's on the air right now.\nFollow artists and save the work you want to come back to.\nTip or subscribe so your money reaches the people making the music.",
  "studio.hub.demo":
    'the set "Vespertina, vol. iv" is on air, curated by Sara Marques, with tracks like "Carta para a santa" by Mariana Sol.',
  "subprofiles.detail.title": "Persona",
  "subprofiles.detail.intro":
    "This is one persona's own page: a self-contained showcase for a single craft, with its own tagline, work and contact. If it's linked to a member, you'll see who's behind it.",
  "subprofiles.detail.use":
    "Read the tagline and bio in the hero.\nScroll the sections for their work, releases or portfolio.\nEndorse, follow, or message them if you'd like to connect.",
  "subprofiles.detail.demo":
    "a page like NIGHTFORM's presents a musician's releases, links and availability on its own dedicated surface.",
  "subprofiles.hub.title": "Personas",
  "subprofiles.hub.intro":
    "A persona is a focused public page for one side of your life (your music, your art, your craft) kept apart from your main profile. This directory lets you browse everyone's.",
  "subprofiles.hub.use":
    'Filter by craft, like musician, writer or visual artist.\nSearch by name or add tags to narrow the results.\nToggle "open to collabs" to find people ready to team up.',
  "subprofiles.hub.demo":
    "personas like NIGHTFORM, a musician making after-hours electronics, live here alongside writers, designers and DJs.",
  "topics.hub.title": "Topic",
  "topics.hub.intro":
    "A topic gathers every post tagged with the same theme in one place: a hashtag feed where you can follow a subject you care about across the whole platform.",
  "topics.hub.use":
    "Read the posts collected under this topic.\nFollow the topic to keep it close and get more of it in your feed.\nUse Write a post to add your own contribution.\nExplore related topics and resources from the sidebar.",
  "topics.hub.demo":
    "a topic like #healthcare, pulling together threads and posts about trans-affirming clinics, the SNS and finding an affirming GP.",
};

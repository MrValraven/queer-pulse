import type { Catalog } from "../../types";

/**
 * Communities — the discover directory, a member's communities hub, a single
 * community's living hub (Pulse/Discussion/Members/Events/About/Mod tools),
 * the join flow, and the Start-a-Community wizard.
 *
 * Scope: platform chrome only. Mock community names, taglines/descriptions,
 * member-written posts/replies, bios, house rules and resources in
 * `communityDetails.data.tsx` / `livingCommunities.data.ts` stay in English —
 * in live mode those arrive over the wire as somebody's own authored words.
 * See `docs/i18n/extraction-brief.md` §1.
 */
export const communities: Catalog = {
  // ── Merged page shell (CommunitiesHubPage + header + top tabs) ────────────
  "hubShell.title": "Communities",
  "topTabs.mine": "My communities",
  "topTabs.discover": "Discover",
  "topTabs.ariaLabel": "Communities views",

  // ── Shared community category labels ──────────────────────────────────────
  // Used by the discover-grid filter chips and the live adapter's badge map.
  "category.all": "All communities",
  "category.social": "Social",
  "category.arts": "Arts",
  "category.activism": "Activism",
  "category.support": "Support",
  "category.sports": "Sports",
  "category.professional": "Professional",
  "category.community": "Community",

  // ── Discover directory (CommunitiesPage) ──────────────────────────────────
  "discover.hero.eyebrow": "Communities & Collectives",
  "discover.hero.title": "Find your <em>people.</em>",
  "discover.hero.lead":
    "A living directory of queer communities and collectives across Lisbon. Social clubs, arts collectives, activist groups, sports teams, support circles, and professional networks: something for where you are right now.",
  "discover.hero.cta": "Go to your hub",
  "discover.empty.none.title": "No communities yet",
  "discover.empty.none.description":
    "The directory is still finding its feet. Be one of the first to gather your people. Start a community and others will follow.",
  "discover.empty.none.cta": "Start a community",
  "discover.empty.filtered.title": "Nothing matches your filters",
  "discover.empty.filtered.description":
    "No communities in this category yet. Switch back to all communities to see everything across Lisbon.",
  "discover.empty.filtered.cta": "Clear filters",
  "discover.loadingMore": "Loading…",
  "discover.loadMoreCta": "Load more communities",
  "discover.outro.title": "Not finding the right <em>space?</em>",
  "discover.outro.sub":
    "Suggest a community to add to the directory, or post on the board to find people who share your interest, and maybe start something together.",
  "discover.outro.cta": "See the board",

  // ── Community card / join CTA labels ───────────────────────────────────────
  // Shared by the discover grid and the community-detail hero.
  "card.join.public": "Join",
  "card.join.invite": "Join with invite",
  "card.join.request": "Request",
  "card.joined": "Joined",
  "card.view": "View",
  "card.stats.active_one": "{count} active this week",
  "card.stats.active_other": "{count} active this week",
  "card.stats.posts_one": "{count} post",
  "card.stats.posts_other": "{count} posts",

  // ── Communities hub (CommunitiesHomePage + digest + feed + sidebar) ───────
  "hub.eyebrow": "Your communities & collectives",
  "hub.welcome": "Welcome back, <em>{name}</em>",
  "hub.sub_one": "Here's what's been happening across your {count} community.",
  "hub.sub_other":
    "Here's what's been happening across your {count} communities.",
  "hub.discoverCta": "Discover communities",
  "hub.startCta": "Start a community",
  "hub.howItWorksCta": "How communities work",
  "hub.empty.title": "You haven't joined any communities yet",
  "hub.empty.description":
    "Browse by interest and find where you belong. There's no rush.",
  "hub.digest.label": "This week, quietly",
  "hub.digest.note": "No pings: just your communities' week in one glance.",
  "hub.digest.posts": "new posts",
  "hub.digest.active": "active members",
  "hub.digest.events": "upcoming events",
  "hub.digest.joined": "people joined",
  "hub.todos.label": "Needs your attention",
  "hub.todos.requests_one": "{count} request",
  "hub.todos.requests_other": "{count} requests",
  "hub.todos.reports_one": "{count} report",
  "hub.todos.reports_other": "{count} reports",
  "hub.pulse.label": "Your pulse",
  "hub.pulse.empty.title": "Quiet for now",
  "hub.pulse.empty.description":
    "When your communities post, it shows up here.",
  "hub.sidebar.yourCommunities": "Your communities & collectives",
  "hub.sidebar.discoverMore": "Discover more",
  "hub.sidebar.upcoming": "Upcoming in your communities",
  "hub.sidebar.suggestions": "Communities you might like",
  "hub.pulseCard.announcement": "Announcement",
  "hub.pulseCard.open": "Open",

  // ── Small shared bits (relative time, generic "just now") ────────────────
  "common.timeAgo": "{time} ago",
  "common.justNow": "just now",
  "common.error": "Something went wrong. Try again in a moment.",
  "common.loading": "Loading…",

  // ── Community detail page (hero + sidebar) ────────────────────────────────
  "detail.breadcrumb": "Communities & Collectives",
  "detail.join.invite": "Join with invite",
  "detail.join.public": "Join community",
  "detail.join.request": "Request to join",
  "detail.joined": "Joined",
  "detail.requested": "Requested",
  "detail.frozen.title": "This community is paused",
  "detail.frozen.body":
    "Moderators are reviewing recent reports. New posts and joins are on hold until they lift the pause.",
  "detail.frozen.unfreezeCta": "Lift the pause",
  "detail.frozen.errorToast": "That didn't work. Try again.",
  "detail.save.cta": "Save",
  "detail.save.saved": "Saved",
  "detail.save.savedToast": "Community saved to your profile.",
  "detail.save.removedToast": "Community removed from saved.",
  "detail.save.saveAriaLabel": "Save {name}",
  "detail.save.unsaveAriaLabel": "Remove {name} from saved",
  "detail.share.cta": "Share",
  "detail.share.ariaLabel": "Share {name}",
  "detail.share.copiedToast": "Link copied to your clipboard.",
  "detail.leave.confirm.title": "Leave {name}?",
  "detail.leave.confirm.body":
    "You'll stop seeing this community's pulse and gatherings. You can always come back. You'll just need to join again.",
  "detail.leave.confirm.cancel": "Stay",
  "detail.leave.confirm.confirmCta": "Leave community",
  "detail.hero.andMore": "and {count} more",
  "detail.sidebar.organiser": "Organiser",
  "detail.sidebar.messageCta": "Send a message",
  "detail.sidebar.nextGathering": "Next gathering",
  "detail.sidebar.rsvpCta": "RSVP",
  "detail.sidebar.relatedCommunities": "Related communities",

  // ── Hub tabs (shared labels, FallbackHubTabs + LivingHubTabs) ─────────────
  "detail.tabs.about": "About",
  "detail.tabs.members": "Members",
  "detail.tabs.forum": "Forum",
  "detail.tabs.pulse": "Pulse",
  "detail.tabs.discussion": "Discussion",
  "detail.tabs.events": "Events",
  "detail.tabs.modtools": "Mod tools",

  // ── About / About+Resources shared section labels ─────────────────────────
  "detail.about.whoFor": "Who this is for",
  "detail.about.upcomingGathering": "Upcoming gathering",

  // ── Members tab (fallback hub) ────────────────────────────────────────────
  "detail.members.showingOf_one": "Showing {shown} of {count} member",
  "detail.members.showingOf_other": "Showing {shown} of {count} members",
  "detail.members.showingCore": "Showing the core members",

  // ── Forum tab (fallback hub) + community thread ──────────────────────────
  "detail.forum.newPostPlaceholder":
    "Start a new discussion in this community…",
  "detail.forum.postCta": "Post",
  "detail.forum.postedToast": "Post added to the community forum.",
  "detail.thread.replies_one": "{count} reply",
  "detail.thread.replies_other": "{count} replies",
  "detail.thread.replyPlaceholder": "Reply to this thread…",
  "detail.thread.replyCta": "Reply",
  "detail.thread.replyToast": "Reply posted.",
  "detail.thread.editedMark": "(edited)",
  "detail.thread.tombstone": "This message was deleted.",
  "detail.thread.editSave": "Save",
  "detail.thread.editCancel": "Cancel",
  "detail.thread.editSaving": "Saving…",
  "detail.thread.editAria": "Edit your message",
  "detail.thread.upvoteAria": "Upvote this thread",
  "detail.thread.editSavedToast": "Your edit is live.",
  "detail.thread.deletedToast": "Message deleted.",
  "detail.thread.restoredToast": "Message restored.",
  "detail.thread.loadMoreRepliesCta": "Load more replies",
  "detail.thread.loadingMoreReplies": "Loading…",

  // ── Discussion tab (living hub) ───────────────────────────────────────────
  "detail.discussion.searchAria": "Search discussions",
  "detail.discussion.filterAria": "Filter discussions",
  "detail.discussion.searchPlaceholder": "Search this community's discussions…",
  "detail.discussion.chip.all": "All",
  "detail.discussion.chip.pinned": "Pinned",
  "detail.discussion.chip.newest": "Newest",
  "detail.discussion.empty.title": "Nothing matches yet",
  "detail.discussion.empty.description":
    "Try a different search, or start the discussion below.",
  "detail.discussion.empty.searchMore":
    "None of the loaded discussions match. Load more to search the rest.",
  "detail.discussion.searchScopeNote":
    "Searching only the discussions loaded so far. Load more to widen it.",
  "detail.discussion.startedToast": "Discussion started.",
  "detail.discussion.loadMore": "Load more",

  // ── Events tab (living hub) ────────────────────────────────────────────────
  "detail.events.upcoming": "Upcoming gatherings",
  "detail.events.noUpcoming":
    "No gatherings on the calendar yet. Check back soon.",
  "detail.events.past": "Past gatherings",
  "detail.events.recapCta": "Read recap",
  "detail.events.rsvpCta": "RSVP",

  // ── Roster / members tab (living hub) ─────────────────────────────────────
  "detail.roster.searchAria": "Search members",
  "detail.roster.searchPlaceholder":
    "Search members by name, role or neighbourhood…",
  "detail.roster.verified": "Verified",
  "detail.roster.alsoIn": "Also a member of {names}",
  "detail.roster.messageCta": "Message",
  "detail.roster.showingOf_one": "Showing {shown} of {count} member",
  "detail.roster.showingOf_other": "Showing {shown} of {count} members",
  "detail.roster.searchScopeNote":
    "Searching only the members loaded so far. Load more to widen it.",
  "detail.roster.loadMoreCta": "Load more members",
  "detail.roster.loadingMore": "Loading…",

  // ── Mod tools tab (living hub) ─────────────────────────────────────────────
  "detail.modtools.joinRequests.label": "People asking to join",
  "detail.modtools.joinRequests.empty.title": "No requests waiting",
  "detail.modtools.joinRequests.empty.description":
    "You're all caught up. New requests will appear here.",
  "detail.modtools.joinRequests.requestedAgo": "Requested {time} ago",
  "detail.modtools.joinRequests.approveCta": "Approve",
  "detail.modtools.joinRequests.declineCta": "Decline",
  "detail.modtools.reports.label": "Reported posts",
  "detail.modtools.reports.empty.title": "All clear",
  "detail.modtools.reports.empty.description":
    "Nothing has been flagged. The community looks after each other.",
  "detail.modtools.reports.meta":
    "From {author} · flagged by {reporter} · {time} ago",
  "detail.modtools.reports.removeCta": "Remove post",
  "detail.modtools.reports.dismissCta": "Dismiss",
  "detail.modtools.members.label": "Members",
  "detail.modtools.members.makeModCta": "Make mod",
  "detail.modtools.members.removeCta": "Remove from community",
  "detail.modtools.members.ownerTag": "Owner",
  "detail.modtools.toast.approved": "{name} approved. Welcome them in.",
  "detail.modtools.toast.declined":
    "{name}'s request wasn't approved this time.",
  "detail.modtools.toast.postRemoved":
    "Post removed. The author has been reached.",
  "detail.modtools.toast.reportDismissed": "Report dismissed.",
  "detail.modtools.toast.promoted": "{name} is now a mod.",
  "detail.modtools.toast.removed": "{name} has been removed.",

  // ── Pulse tab (living hub) ─────────────────────────────────────────────────
  "detail.pulse.joinHint": "You're welcome to read. Join {name} to take part.",
  "detail.pulse.composerPlaceholder": "Share something with {name}…",
  "detail.pulse.shareCta": "Share",
  "detail.pulse.pinnedAnnouncement": "Pinned announcement",
  "detail.pulse.replyLabel_one": "Show {count} reply",
  "detail.pulse.replyLabel_other": "Show {count} replies",
  "detail.pulse.replyAction": "Reply",
  "detail.pulse.replyPlaceholder": "Write a reply…",
  "detail.pulse.imageAlt": "Image shared by {name}",
  "detail.pulse.sharedToast": "Shared with the community.",
  "detail.pulse.loadingMore": "Loading…",
  "detail.pulse.loadMoreCta": "Load more posts",

  // ── About + Resources tab (living hub) ────────────────────────────────────
  "detail.aboutResources.houseRules": "House rules",
  "detail.aboutResources.resources": "Resources",
  "detail.aboutResources.sisterCommunities": "Sister communities",
  "detail.aboutResources.sharedPeople_one": "{count} person in both",
  "detail.aboutResources.sharedPeople_other": "{count} people in both",

  // ── Badges: role pills, access-tier pills, reaction bar ───────────────────
  "badges.role.owner": "Owner",
  "badges.role.mod": "Mod",
  "badges.tier.public": "Open to all",
  "badges.tier.request": "Request to join",
  "badges.tier.invite": "Invite-only",
  "badges.tier.private": "Private",
  "badges.reaction.heart": "Love",
  "badges.reaction.celebrate": "Celebrate",
  "badges.reaction.support": "Support",
  "badges.reaction.fire": "Fire",
  "badges.reaction.ariaLabel": "{label}: {count}",

  // ── Join modal ─────────────────────────────────────────────────────────────
  "join.close": "Close",
  "join.progress": "Step {step} of {total}",
  "join.ariaLabel": "Join {name}",
  "join.intro.eyebrow.request": "Asking to join",
  "join.intro.eyebrow.invite": "Joining with an invitation",
  "join.intro.eyebrow.public": "Joining",
  "join.intro.invitePlaceholder": "Enter your invite code",
  "join.intro.verifyCta": "Verify & continue",
  "join.intro.continueCta": "Continue",
  "join.about.eyebrow": "A bit about you",
  "join.about.title": "How should the community know you?",
  "join.about.hint":
    "Optional: a little context helps people know who you are.",
  "join.about.namePlaceholder": "Your name",
  "join.about.pronounsPlaceholder": "Pronouns, if you'd like to share",
  "join.about.aboutPlaceholder":
    "A sentence about yourself: what brings you here?",
  "join.involvement.eyebrow": "Almost done",
  "join.involvement.title": "How would you like to be involved?",
  "join.involvement.emailPlaceholder": "Your email address",
  "join.involvement.levelLabel": "Level of involvement",
  "join.involvement.sendRequestCta": "Send request",
  "join.involvement.joinCta": "Join the community",
  "join.involvement.updates.label": "Keep me updated",
  "join.involvement.updates.desc": "News and events only: no commitment",
  "join.involvement.active.label": "Active member",
  "join.involvement.active.desc": "Come to events and join the group",
  "join.involvement.organise.label": "Help organise",
  "join.involvement.organise.desc": "Volunteer to help run things",
  "join.done.requestTitle": "Your request is with the mods",
  "join.done.welcomeTitle": "Welcome to {name}",
  "join.done.requestBody":
    "Thanks. The mods of <strong>{name}</strong> will read your request and welcome you in. We'll let you know either way.",
  "join.done.joinedBody":
    "You're part of <strong>{name}</strong> now. Someone will be in touch to help you find your footing.",
  "join.done.doneCta": "Done",

  // ── Start-a-Community wizard: page chrome / progress rail ─────────────────
  "start.hero.back": "Back to your communities",
  "start.hero.eyebrow": "Communities & Collectives · found a space",
  "start.hero.title": "Start a <em>community.</em>",
  "start.hero.lead":
    "A place for your people to gather: social, support, creative, or something only you can name. <strong>Nothing goes live until you're ready.</strong>",
  "start.next.begin": "Let's begin",
  "start.next.people": "Next: the people",
  "start.next.door": "Next: the door",
  "start.next.who": "Next: who runs it",
  "start.next.tone": "Next: the tone",
  "start.next.feeling": "Next: the feeling",
  "start.next.first": "Next: the first few",
  "start.next.review": "Review & open",
  "start.next.open": "Open the doors",
  "start.next.fallback": "Continue",
  "start.opening.status": "Opening the doors…",
  "start.leaveConfirm":
    "You have an unfinished community here. Leave without saving it?",
  "start.cancel": "Cancel",
  "start.back": "Back",
  "start.actions.stillNeeded": "Still needed:",
  "start.actions.blockedTitle": "A few things left to fill in",

  // ── "Still needed" validation chips (useCommunityForm.ts → PanelActions) ──
  "start.missing.name": "a name",
  "start.missing.purpose": "what it's for",
  "start.missing.category": "a category",
  "start.missing.whoFor": "who it's for",
  "start.missing.access": "who can find it",
  "start.missing.rules": "at least one shared value",
  "start.missing.tagline": "a tagline",
  "start.missing.handle": "a handle",
  "start.missing.consent": "your confirmation",
  "start.thread.backTo": "Back to {thread}",
  "start.thread.stepOf": "Step {step} of {total} · <b>{thread}</b>",

  // ── Founding-thread panel copy (PANELS) ────────────────────────────────────
  "start.panel.open.thread": "Open",
  "start.panel.open.eyebrow": "Founding a space",
  "start.panel.open.title":
    "Every community started with ⟪one person⟫ opening a door.",
  "start.panel.open.lead":
    "This is yours to open. Take it a step at a time. Nothing goes live until the very end, and you can leave and come back whenever you like.",
  "start.panel.why.thread": "Why",
  "start.panel.why.eyebrow": "Chapter one · the heart",
  "start.panel.why.title": "Let's start with ⟪why.⟫",
  "start.panel.why.lead":
    "Before anything practical: what is this space for, and who is it for? Say it plainly. This is what people read first.",
  "start.panel.who.thread": "Who",
  "start.panel.who.eyebrow": "Chapter two · the people",
  "start.panel.who.title": "Who are you ⟪gathering?⟫",
  "start.panel.who.lead":
    "The people this space is meant to hold. Be specific and be welcoming. This helps the right people know it's for them.",
  "start.panel.safety.thread": "Safety",
  "start.panel.safety.eyebrow": "Chapter three · the door",
  "start.panel.safety.title": "Who can ⟪find⟫ this space?",
  "start.panel.safety.lead":
    "The most important choice you'll make. It decides who can see the community, and how someone gets in. You can change it later.",
  "start.panel.running.thread": "Running",
  "start.panel.running.eyebrow": "Chapter four · the hands",
  "start.panel.running.title": "Who ⟪holds the keys?⟫",
  "start.panel.running.lead":
    "Most spaces run better with more than one pair of hands. Add co-stewards, and choose what the community can do.",
  "start.panel.tone.thread": "Tone",
  "start.panel.tone.eyebrow": "Chapter five · the culture",
  "start.panel.tone.title": "Set ⟪the tone.⟫",
  "start.panel.tone.lead":
    "Every space has a culture. Here's a short covenant to start from. Keep what fits, add your own words.",
  "start.panel.feeling.thread": "Feeling",
  "start.panel.feeling.eyebrow": "Chapter six · the feel",
  "start.panel.feeling.title": "Give it ⟪a feeling.⟫",
  "start.panel.feeling.lead":
    "A colour and a line that capture the heart of the place. Small touches, but they're what make it feel like somewhere.",
  "start.panel.people.thread": "People",
  "start.panel.people.eyebrow": "Chapter seven · the first few",
  "start.panel.people.title": "Don't open to ⟪an empty room.⟫",
  "start.panel.people.lead":
    "A space feels alive when someone's already there. Invite a few people you'd love to see in the doorway on day one.",
  "start.panel.confirm.thread": "Confirm",
  "start.panel.confirm.eyebrow": "The last step",
  "start.panel.confirm.title": "Ready to ⟪open the doors?⟫",
  "start.panel.confirm.lead":
    "Here's the whole space, in one glance. Nothing here is fixed. You can change all of it once you're inside.",

  // ── Chapter 0 — Opening ────────────────────────────────────────────────────
  "start.opening.reassure":
    "<strong>Nothing you do here is public until the last step.</strong> Take your time, skip what you're unsure about, and change your mind as often as you like. Founding a community is a big, generous thing. There's no wrong way to start.",
  "start.opening.signed":
    "You'll be its first steward, <strong>{name}</strong>.",

  // ── Chapter 1 — Why ────────────────────────────────────────────────────────
  "start.why.nameLabel": "Name your community",
  "start.why.namePlaceholder": "e.g. Sunday Sapphic Swimmers",
  "start.why.collisionHead": "A few spaces already sound a little like this:",
  "start.why.purposeLabel": "What is it for?",
  "start.why.purposePlaceholder":
    "Say it plainly: what happens here, and why it matters.",
  "start.why.purposeHint":
    "This is the first thing people read. One or two warm sentences is plenty.",
  "start.why.kindLabel": "What kind of space is it?",

  // ── Chapter 2 — Who ────────────────────────────────────────────────────────
  "start.who.label": "Who is this space for?",
  "start.who.placeholder":
    "e.g. Trans and non-binary folks who want to swim together, all abilities, no pressure to be fast.",
  "start.who.hint":
    "Be specific and be welcoming. Naming who it's <em>for</em> helps the right people know they belong here.",

  // ── Chapter 3 — Safety ─────────────────────────────────────────────────────
  "start.safety.lead":
    "This is the one to sit with. It shapes who feels safe here. <strong>You can change it later</strong>, but it's worth getting close now.",
  "start.safety.safestFlag": "Safest",
  "start.safety.findLabel": "Find",
  "start.safety.joinLabel": "Join",
  "start.safety.privateReassure":
    "Private communities never appear in Discover, search, or member suggestions. Only people who are already inside can see who else is here.",
  "start.safety.rosterHeading": "Member roster",
  "start.safety.rosterToggleTitle":
    "<strong>Show the member list to members</strong>",
  "start.safety.rosterToggleBody":
    "When off, people can be here without their name appearing to others.",

  // ── Access-tier options (wizard) ───────────────────────────────────────────
  "start.access.public.name": "Open to all",
  "start.access.public.find": "Anyone on QueerPulse can find it in Discover.",
  "start.access.public.join": "They join instantly and are in.",
  "start.access.public.note":
    "Best for social clubs, sports, and anything that grows by word of mouth.",
  "start.access.request.name": "Request to join",
  "start.access.request.find": "Listed in Discover, so people can find it.",
  "start.access.request.join":
    "They send a request; you or a co-steward let them in.",
  "start.access.request.note":
    "A gentle gate. Good when you want to say hello before someone's inside.",
  "start.access.invite.name": "Invite only",
  "start.access.invite.find":
    "Listed, but the door needs a code or an invite link.",
  "start.access.invite.join": "Only people you've invited can get in.",
  "start.access.invite.note":
    "For tighter circles that still want to be visible.",
  "start.access.private.name": "Private & unlisted",
  "start.access.private.find":
    "Hidden from Discover entirely. Members share it person to person.",
  "start.access.private.join":
    "Invite only, and no one outside can see it exists.",
  "start.access.private.note":
    "For spaces where being found is itself a risk: coming-out groups, survivors, people not yet out.",

  // ── Chapter 4 — Running ────────────────────────────────────────────────────
  "start.running.stewardsHeading": "Stewards",
  "start.running.stewardsSub":
    "Co-stewards can welcome new members, keep threads warm, and step in when you can't. You can add or change them any time.",
  "start.running.ownerTag": "You · owner",
  "start.running.coStewardTag": "Co-steward",
  "start.running.removeAria": "Remove {name}",
  "start.running.addCta": "Add a co-steward",
  "start.running.addStewardModal.eyebrow": "Add a co-steward",
  "start.running.addStewardModal.title": "Choose someone you're connected to",
  "start.running.addStewardModal.sub":
    "Co-stewards can only be members you're already connected with. Search your connections below.",
  "start.running.addStewardModal.searchLabel": "Search your connections",
  "start.running.addStewardModal.searchPlaceholder":
    "Search by name or @slug…",
  "start.running.addStewardModal.closeAria": "Close",
  "start.running.addStewardModal.empty":
    "You can add co-stewards once you're connected with other members. Head to Connections to grow your circle first.",
  "start.running.insideHeading": "What's inside",
  "start.running.insideSub":
    "Turn on what fits. You can always add more once you're up and running.",
  "start.running.alwaysOn": "Always on",
  "start.running.on": "On",
  "start.running.off": "Off",

  // ── Feature options (Running chapter, shared with preview) ────────────────
  "start.feature.discussion.label": "Discussion",
  "start.feature.discussion.desc": "A shared board for threads.",
  "start.feature.events.label": "Events",
  "start.feature.events.desc": "Gatherings and a calendar.",
  "start.feature.rooms.label": "Rooms",
  "start.feature.rooms.desc": "Sub-channels for topics.",
  "start.feature.roster.label": "Member roster",
  "start.feature.roster.desc": "A visible list of who's here.",
  "start.feature.library.label": "Resources",
  "start.feature.library.desc": "Shared files and links.",

  // ── Chapter 5 — Tone ───────────────────────────────────────────────────────
  "start.tone.covenantIntro":
    '"We look after each other here. Warmth first, always, and no room for anyone who\'d make this space unsafe."',
  "start.tone.addPlaceholder": "Add a value in your own words",
  "start.tone.addCta": "Add",
  "start.tone.wrongHeading": "When something goes wrong",
  "start.tone.wrongSub":
    "You won't have to improvise. Every community starts with the same gentle ladder. You can adjust it inside.",

  // ── Covenant rule presets ──────────────────────────────────────────────────
  "start.rulePreset.warmth":
    "Treat everyone with warmth and respect: no bigotry, ever.",
  "start.rulePreset.confidentiality":
    "What's shared here stays here. No screenshots, no outing.",
  "start.rulePreset.consent":
    "Consent first. Ask before photos, tags, or intros.",
  "start.rulePreset.welcome": "Newcomers get a warm welcome.",

  // ── Enforcement ladder ─────────────────────────────────────────────────────
  "start.ladder.quietWord.title": "A quiet word",
  "start.ladder.quietWord.desc": "A steward reaches out privately first.",
  "start.ladder.reminder.title": "A visible reminder",
  "start.ladder.reminder.desc": "The covenant is restated to the group.",
  "start.ladder.pause.title": "A pause or a goodbye",
  "start.ladder.pause.desc": "Repeat harm means time out, or out.",

  // ── Chapter 6 — Feeling ────────────────────────────────────────────────────
  "start.feeling.colourLabel": "Pick a colour",
  "start.tint.coral": "Warm coral",
  "start.tint.jade": "Calm jade",
  "start.tint.plum": "Deep plum",
  "start.feeling.coverLabel": "A cover image",
  "start.feeling.coverHint":
    "Optional: a wide photo that greets people on your community's card. At least 1200 × 600px.",
  "start.feeling.taglineLabel": "A tagline",
  "start.feeling.taglinePlaceholder":
    "One line that captures the feeling of the place",
  "start.feeling.taglineHint":
    "Short and warm. This sits under your community's name.",

  // ── Chapter 7 — People ─────────────────────────────────────────────────────
  "start.people.label": "People you'd love to see here",
  "start.people.hint":
    "They'll get a warm invite when you open: no pressure, no spam.",
  "start.people.empty":
    "You're not connected to anyone yet. Once you connect with people, you'll be able to invite them here.",
  "start.people.seedNote":
    "You can also share your community's link once it's open. That's often how the first ten people really arrive.",

  // ── Chapter 8 — Confirm ────────────────────────────────────────────────────
  "start.confirm.lead":
    "Here's the whole space, in one glance. Nothing here is fixed. You can change all of it once you're inside.",
  "start.confirm.handleLabel": "Your community's address",
  "start.confirm.editCta": "Edit",
  "start.confirm.notSetYet": "Not set yet",
  "start.confirm.notChosenYet": "Not chosen yet",
  "start.confirm.recap.why": "Why",
  "start.confirm.recap.name": "Name",
  "start.confirm.recap.for": "For",
  "start.confirm.recap.kind": "Kind",
  "start.confirm.recap.who": "Who",
  "start.confirm.recap.gathering": "Gathering",
  "start.confirm.recap.safety": "Safety",
  "start.confirm.recap.access": "Access",
  "start.confirm.recap.roster": "Roster",
  "start.confirm.rosterVisible": "Visible to members",
  "start.confirm.rosterHidden": "Hidden",
  "start.confirm.recap.running": "Running",
  "start.confirm.recap.stewards": "Stewards",
  "start.confirm.stewardsValue": "{count} (you + {co} co)",
  "start.confirm.recap.inside": "Inside",
  "start.confirm.recap.toneFeeling": "Tone & feeling",
  "start.confirm.recap.sharedValues": "Shared values",
  "start.confirm.sharedValuesCount": "{count} agreed",
  "start.confirm.recap.tagline": "Tagline",
  "start.confirm.recap.firstPeople": "First people",
  "start.confirm.recap.inviting": "Inviting",
  "start.confirm.invitingCount": "{count} on day one",
  "start.confirm.costNote":
    "<strong>Founding a community is free, and always will be.</strong> QueerPulse never charges to gather your people.",
  "start.confirm.consentText":
    "<strong>I'll steward this space with care.</strong> I understand I'm responsible for keeping it safe and welcoming, and that QueerPulse's community guidelines apply here too.",

  // ── Live preview column ────────────────────────────────────────────────────
  "start.preview.liveLabel": "Live preview",
  "start.preview.emptyBody": "Your community takes shape here as you go.",
  "start.preview.purposePlaceholder": "What is this space for?",
  "start.preview.insideLabel": "What's inside",
  "start.preview.foundingMembers": "Founding members",
  "start.preview.footNote":
    "Nothing is public yet. This is only visible to you.",
  "start.preview.handleFallback": "your-community",

  // ── Category options (wizard "What kind of space?" chips + badges) ───────
  "start.category.social.label": "Social",
  "start.category.social.badge": "Social club",
  "start.category.arts.label": "Arts & culture",
  "start.category.arts.badge": "Arts collective",
  "start.category.activism.label": "Activism",
  "start.category.activism.badge": "Activist group",
  "start.category.support.label": "Support",
  "start.category.support.badge": "Support circle",
  "start.category.sports.label": "Sports & movement",
  "start.category.sports.badge": "Sports team",
  "start.category.professional.label": "Professional",
  "start.category.professional.badge": "Professional network",
  "start.category.fallbackBadge": "Community",

  // ── Success panel (StartCommunitySuccess) ─────────────────────────────────
  "start.success.title": "Your doors are",
  "start.success.em": "open.",
  "start.success.closeLabel": "Step inside",
  "start.success.liveYours":
    "<strong>{name}</strong> is live and yours to steward.",
  "start.success.invitesOnWay_one": "{count} warm invite is on the way.",
  "start.success.invitesOnWay_other": "{count} warm invites are on the way.",
  "start.success.inviteWheneverReady":
    "Invite people whenever you're ready. There's no rush.",
  "start.success.postFirstHello":
    "Post a first hello so no one walks into an empty room.",
  "start.success.backToHub": "Back to your hub",
  "start.success.startAnother": "Start another",
  "start.success.body":
    "You opened something real today. {name} now has a home on QueerPulse, a door for your people to walk through. Go say the first hello.",

  // ── Toasts (StartCommunityPage) ───────────────────────────────────────────
  "start.toast.createError": "Couldn't open your community. Try again.",
  "start.toast.created": "{name} is live. Welcome, steward",

  // ── Adapter-composed chrome (api/communities.adapters.ts, useAllCommunities.ts) ──
  // Fused mock-string trap: the phrase is chrome even though the mock/live data
  // supplies only the number/date — restructure, don't bake, per the extraction
  // brief's "spots" example.
  "common.count.members_one": "{count} member",
  "common.count.members_other": "{count} members",
  "common.count.membersOnly": "Members only",
  "detail.founded": "Founded {year}",
  "detail.foundedRecently": "Founded recently",
  "detail.foundedJustNow": "Founded just now",
  "detail.cadenceDefault": "Finding its rhythm",
  "detail.nextEvent.tbaTitle": "Next gathering to be announced",
  "detail.nextEvent.checkEventsTab": "Check the events tab",
  "detail.nextEvent.openToMembers": "Open to members",
  "detail.nextEvent.firstTitle": "First gathering, to be announced",
  "detail.nextEvent.onceFewPeople": "Once a few people are in",
  "detail.nextEvent.openToAllMembers": "Open to all members",
  "detail.topicThread.welcomeTitle": "Welcome to {name}",
  "detail.topicThread.recently": "recently",
  "detail.topicThread.justNow": "just now",
  "detail.topicThread.welcomeSayHello": "Welcome to {name}. Say hello",
  "detail.topicThread.beginningPost":
    "This is the very beginning of {name}. Introduce yourself and tell us what brought you here.",
  "detail.organiser.founder": "Founder",

  // ── Edit community (EditCommunityModal) ───────────────────────────────────
  "edit.cta": "Edit community",
  "edit.eyebrow": "Community settings",
  "edit.title": "Edit your community",
  "edit.save": "Save changes",
  "edit.saving": "Saving…",
  "edit.cancel": "Cancel",
  "edit.field.name": "Name",
  "edit.field.tagline": "Tagline",
  "edit.field.cover": "Cover image",
  "edit.field.coverHint": "A wide photo shown on your community's card. At least 1200 × 600px.",
  "edit.field.type": "Kind of space",
  "edit.field.whoFor": "Who it's for",
  "edit.field.purpose": "What it's for",
  "edit.field.access": "Who can find it",
  "edit.field.rosterVisible": "Show the member list to members",
  "edit.field.features": "What's inside",
  "edit.field.rules": "Shared values",
  "edit.rules.add": "Add",
  "edit.rules.addPlaceholder": "Add a shared value…",
  "edit.rules.remove": "Remove rule",
  "edit.toast.saved": "Changes saved",
  "edit.toast.error": "Couldn't save your changes. Please try again.",
};

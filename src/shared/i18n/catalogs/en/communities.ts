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
  // ── Per-route metadata (PageMeta: browser tab + social unfurl) ────────────
  "seo.hub.title": "Communities · QueerPulse",
  "seo.hub.description":
    "Find the collectives, crews and support circles gathering across Lisbon's queer community, and the one that will feel like yours.",
  "seo.start.title": "Start a community · QueerPulse",
  "seo.start.description":
    "Found a community on QueerPulse: name what it is for, decide who it is for, set its shared values, and open the door.",
  "seo.detail.title": "{name} · QueerPulse",
  "seo.detail.imageAlt": "Cover image for the {name} community",
  "seo.post.title": "A post in {name} · QueerPulse",

  // ── Merged page shell (CommunitiesHubPage + header + top tabs) ────────────
  "hubShell.title": "Communities &",
  "hubShell.titleEm": "collectives",
  "hubShell.subtitle":
    "Meet the communities already bringing people together across Lisbon. Find one you'd like to be part of, or start something of your own.",
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

  // ── Discover directory (CommunitiesPage) ──────────────────────────────────
  "discover.search.placeholder": "Search communities by name or focus",
  "discover.search.ariaLabel": "Search communities",
  "discover.sort.label": "Sort by",
  "discover.sort.newest": "Newest",
  "discover.sort.name": "Name",
  "discover.empty.none.title": "No communities yet",
  "discover.empty.none.description":
    "The directory is still finding its feet. Be one of the first to gather your people. Start a community and others will follow.",
  "discover.empty.none.cta": "Start a community",
  "discover.empty.search.title": "Nothing matches your search",
  "discover.empty.search.description":
    "Try a different word, or clear your search to browse the whole directory.",
  "discover.empty.search.cta": "Clear search",
  "discover.empty.filtered.title": "Nothing matches your filters",
  "discover.empty.filtered.description":
    "No communities in this category yet. Switch back to all communities to see everything across Lisbon.",
  "discover.empty.filtered.cta": "Clear filters",
  "discover.loadingMore": "Loading…",
  "discover.loadMoreCta": "Load more communities",
  // Band headings inside the "Refine" drawer, over the chips and toggles they
  // name.
  "discover.filter.categoryLabel": "Category",
  "discover.toggle.groupLabel": "Quick filters",
  "discover.toggle.openOnly": "Open to all",
  "discover.toggle.busyOnly": "Busy this week",
  // The pills carry a live availability count. The badge is
  // aria-hidden, so this is the whole accessible name.
  "discover.toggle.withCount_one": "{label}, {count} community",
  "discover.toggle.withCount_other": "{label}, {count} communities",
  "discover.sort.active": "Most active",
  // Sort as a removable chip on the active-filters row: the toolbar keeps the
  // sort control inside the Refine drawer, so this is where a shut drawer
  // still shows how the list is ordered.
  "discover.sort.chip": "Sorted by {label}",
  "discover.resline.count_one": "{count} community",
  "discover.resline.count_other": "{count} communities",
  "discover.outro.title": "Not finding the right <em>space</em>?",
  "discover.outro.body":
    "The communities here exist because someone decided to start one. If you can't find what you're looking for, maybe it's time to make it yourself.",
  "discover.outro.body2":
    "You don't need a big idea or a crowd behind you. Start with a few people and see where it goes.",
  "discover.outro.cta": "Start a community",
  "discover.featured.gatheringFlag": "Gathering this week",
  "discover.featured.next": "Next:",
  "discover.featured.youreIn": "You're in",
  "discover.featured.openCta": "Open community",

  // ── "Suggested for you" band (SuggestedCommunitiesSection) ────────────────
  // The card DTO carries no per-community overlap count, so the copy stays
  // general and never claims a number.
  "discover.suggested.heading": "Suggested for you",
  "discover.suggested.subtitle":
    "Communities where people you are connected to have already landed.",

  // ── Community card / join CTA labels ───────────────────────────────────────
  // Shared by the discover grid and the community-detail hero.
  "card.join.public": "Join",
  "card.join.invite": "Join with invite",
  "card.join.request": "Request",
  "card.joined": "Joined",
  // Shoulder badge on a card for a community you already belong to, where a
  // stranger's card shows its access tier instead.
  "card.youreIn": "You're in",
  "card.enterQuietly": "Enter quietly",
  "card.stats.active_one": "{count} active this week",
  "card.stats.active_other": "{count} active this week",

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
  "hub.sidebar.upcoming": "Upcoming in your communities",
  "hub.sidebar.suggestions": "Communities you might like",
  "hub.pulseCard.announcement": "Announcement",
  "hub.pulseCard.open": "Open",

  // ── Small shared bits (relative time, generic "just now") ────────────────
  "common.timeAgo": "{time} ago",
  "common.justNow": "just now",
  // Shown when a timestamp can't be parsed, rather than guessing at an age.
  "common.unknownTime": "some time ago",
  // Stands in for a member the backend nulled out (a deleted account).
  "common.someMember": "A member",
  "common.error": "Something went wrong. Try again in a moment.",
  "common.loading": "Loading…",
  "common.attachImageAria": "Attach an image",
  "common.removeImageAria": "Remove this image",
  "common.imageUploadError": "That image wouldn't upload. Try another one.",
  "common.pinnedToast": "Pinned to the top.",
  "common.unpinnedToast": "Unpinned.",

  // ── Community detail page (hero + sidebar) ────────────────────────────────
  "detail.breadcrumb": "Communities & Collectives",
  "detail.join.invite": "Join with invite",
  "detail.join.public": "Join community",
  "detail.join.request": "Request to join",
  "detail.joined": "Joined",
  "detail.requested": "Requested",
  "detail.frozen.title": "This community is paused",
  // One line per reason. A manual pause has no report behind it, so it must
  // never be narrated as a report review.
  "detail.frozen.body.manual":
    "A moderator paused this community. New posts and joins are on hold until the pause is lifted.",
  "detail.frozen.body.emergencyReport":
    "A serious report came in and moderators paused the community while they look at it. New posts and joins are on hold until they lift the pause.",
  "detail.frozen.body.reportPileup":
    "Several reports arrived close together, so the community paused automatically. Moderators are reading them now. New posts and joins are on hold until they lift the pause.",
  "detail.frozen.body.unknown":
    "This community is paused. New posts and joins are on hold until moderators lift it.",
  "detail.frozen.since": "Paused since {date} at {time}.",
  "detail.frozen.noteSource": "From the moderators",
  "detail.frozen.composerNotice":
    "This community is paused, so new posts are on hold. The banner at the top of the page has the details.",
  "detail.frozen.unfreezeCta": "Lift the pause",
  "detail.frozen.errorToast": "That didn't work. Try again.",

  // ── The one-time welcome a newly approved member gets on Pulse ────────────
  "detail.welcome.greeting": "Welcome to {name}",
  "detail.welcome.dismissAria": "Hide this welcome",

  // ── Per-community notification level (member's own, in the tab row) ───────
  "detail.notifications.title": "Notifications",
  "detail.notifications.subtitle":
    "How much you hear from {name}. This only changes what reaches you, and nobody else can see it.",
  "detail.notifications.groupLabel": "Notify me about",
  "detail.notifications.groupHint":
    "Your platform notification settings still apply on top of this.",
  "detail.notifications.doneCta": "Done",
  "detail.notifications.triggerAria": "Notifications from {name}: {level}",
  "detail.notifications.errorToast":
    "We couldn't save that. Try again in a moment.",
  "detail.notifications.level.all.title": "Everything",
  "detail.notifications.level.all.description":
    "Every post, reply and announcement in this community.",
  "detail.notifications.level.announcements.title": "Announcements only",
  "detail.notifications.level.announcements.description":
    "Only what an owner or moderator marks as an announcement. Ordinary posts stay quiet.",
  "detail.notifications.level.mentions.title": "Mentions only",
  "detail.notifications.level.mentions.description":
    "Only when somebody names you in a post or a reply here.",
  "detail.notifications.level.muted.title": "Muted",
  "detail.notifications.level.muted.description":
    "Nothing from this community. You stay a member and the feed is still here whenever you open it.",
  "detail.notifications.savedToast.all":
    "You'll hear about everything in {name}.",
  "detail.notifications.savedToast.announcements":
    "You'll hear about announcements in {name}.",
  "detail.notifications.savedToast.mentions":
    "You'll hear from {name} when somebody names you.",
  "detail.notifications.savedToast.muted": "{name} is muted.",
  "detail.save.cta": "Save",
  "detail.save.saved": "Saved",
  // "The house rules changed" prompt for a member whose agreed version trails
  // the community's. In-page and dismissible: it never blocks reading.
  "detail.rulesUpdate.title": "The house rules changed",
  "detail.rulesUpdate.body":
    "{name} has updated its house rules since you agreed to them. Take a moment to read them.",
  "detail.rulesUpdate.readCta": "Read the rules",
  "detail.rulesUpdate.hideCta": "Hide the rules",
  "detail.rulesUpdate.acceptCta": "I have read them",
  "detail.rulesUpdate.laterCta": "Later",
  "detail.rulesUpdate.confirmedToast": "Thanks for reading the updated rules.",
  "detail.rulesUpdate.errorToast": "That did not save. Try again in a moment.",
  "detail.save.savedToast": "Community saved to your profile.",
  "detail.save.removedToast": "Community removed from saved.",
  "detail.save.saveAriaLabel": "Save {name}",
  "detail.save.unsaveAriaLabel": "Remove {name} from saved",
  "detail.share.cta": "Share",
  "detail.share.ariaLabel": "Share {name}",
  "detail.share.copiedToast": "Link copied to your clipboard.",
  "detail.leave.confirm.title": "Leave {name}?",
  "detail.leave.confirm.body":
    "You'll stop seeing this community's pulse and gatherings. Your posts and replies stay in the community exactly where they are, under your name. You can always come back. You'll just need to join again.",
  "detail.leave.confirm.cancel": "Stay",
  "detail.leave.confirm.confirmCta": "Leave community",
  "detail.hero.andMore": "and {count} more",
  "detail.sidebar.organiser": "Organiser",
  "detail.sidebar.messageCta": "Send a message",
  "detail.sidebar.nextGathering": "Next gathering",
  "detail.sidebar.rsvpCta": "RSVP",
  "detail.sidebar.relatedCommunities": "Related communities",
  "detail.sidebar.communityThreads": "Recent discussions",
  "detail.sidebar.communityOpportunities": "Open opportunities",
  "detail.sidebar.pulseError": "Couldn't load this right now.",

  // ── Similar communities (SimilarCommunitiesSection) ───────────────────────
  "detail.similar.heading": "Similar communities",

  // ── Hub tabs (shared labels, FallbackHubTabs + LivingHubTabs) ─────────────
  "detail.tabs.about": "About",
  "detail.tabs.members": "Members",
  "detail.tabs.forum": "Forum",
  "detail.tabs.pulse": "Pulse",
  "detail.tabs.discussion": "Discussion",
  "detail.tabs.events": "Events",
  "detail.tabs.modtools": "Mod tools",
  // Shown to an owner/mod on a tab they've hidden from members (the
  // "events"/"roster" feature toggles, or "show roster to members").
  "detail.hiddenFromMembers":
    "Hidden from members. Only owners and mods can see this tab.",

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
  "detail.thread.replyAria": "Write a reply to this thread",
  "detail.thread.replyCta": "Reply",
  "detail.thread.replyToast": "Reply posted.",
  "detail.thread.editedMark": "(edited)",
  "detail.thread.tombstone": "This message was deleted.",
  "detail.thread.editSave": "Save",
  "detail.thread.editCancel": "Cancel",
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
  "detail.events.host.lead":
    "Anyone here can put something on the calendar. Pick a date, a place and a size, and this community will see it.",
  "detail.events.host.cta": "Host a gathering here",

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
  // The console's section rail. Bans has no entry: it lives under Members,
  // because a ban is a member's state.
  "detail.modtools.nav.label": "Mod tools sections",
  "detail.modtools.nav.overview": "Overview",
  "detail.modtools.nav.requests": "Requests",
  "detail.modtools.nav.reports": "Reports",
  "detail.modtools.nav.members": "Members",
  "detail.modtools.nav.ratifications": "Second signature",
  "detail.modtools.nav.invites": "Invites",
  "detail.modtools.nav.support": "Support",
  "detail.modtools.nav.history": "History",
  "detail.modtools.nav.card": "Member card",
  "detail.modtools.nav.danger": "Danger zone",
  "detail.modtools.overview.attention.label": "Needs attention",
  "detail.modtools.overview.attention.requests_one":
    "One person is waiting to join",
  "detail.modtools.overview.attention.requests_other":
    "{count} people are waiting to join",
  "detail.modtools.overview.attention.reports_one":
    "One post has been reported",
  "detail.modtools.overview.attention.reports_other":
    "{count} posts have been reported",
  "detail.modtools.overview.attention.support_one":
    "Someone from QueerPulse has offered you a hand",
  "detail.modtools.overview.attention.support_other":
    "{count} offers of support are waiting on you",
  "detail.modtools.overview.attention.clear.title": "Nothing waiting on you",
  "detail.modtools.overview.attention.clear.description":
    "No join requests and no reports. Anything new will show up here.",
  "detail.modtools.insights.label": "Community insights",
  "detail.modtools.insights.error.title": "Couldn't load insights",
  "detail.modtools.insights.error.description":
    "Something went wrong loading the numbers. Try again.",
  "detail.modtools.insights.error.retryCta": "Try again",
  "detail.modtools.insights.memberCount": "Members",
  "detail.modtools.insights.newThisWeek": "New this week",
  "detail.modtools.insights.newThisMonth": "New this month",
  "detail.modtools.insights.postCount": "Posts",
  "detail.modtools.insights.postsThisWeek": "Posts this week",
  "detail.modtools.insights.activeMembers": "Active this week",
  "detail.modtools.joinRequests.label": "People asking to join",
  "detail.modtools.joinRequests.empty.title": "No requests waiting",
  "detail.modtools.joinRequests.empty.description":
    "You're all caught up. New requests will appear here.",
  "detail.modtools.joinRequests.requestedAgo": "Requested {time} ago",
  "detail.modtools.joinRequests.approveCta": "Approve",
  "detail.modtools.joinRequests.declineCta": "Decline",
  // ENG-41: the queue is paginated, so a moderator can reach an applicant
  // past the first page instead of the queue quietly ending there.
  "detail.modtools.joinRequests.loadMoreCta": "Load more requests",
  // The applicant card. Context for a human decision: no totals, no ranking,
  // no recommendation.
  "detail.modtools.joinRequests.applicant.since": "On QueerPulse since {date}",
  "detail.modtools.joinRequests.applicant.sharedConnections_one":
    "{count} connection in common",
  "detail.modtools.joinRequests.applicant.sharedConnections_other":
    "{count} connections in common",
  "detail.modtools.joinRequests.applicant.sharedCommunities_one":
    "{count} community in common",
  "detail.modtools.joinRequests.applicant.sharedCommunities_other":
    "{count} communities in common",
  "detail.modtools.joinRequests.applicant.involvementLabel":
    "Wants to take part by",
  "detail.modtools.joinRequests.applicant.noteLabel": "In their words",
  // Declining. The two waits come from the backend's own constants (see
  // `joinRequestReview.data.ts`), interpolated rather than written into copy.
  "detail.modtools.joinRequests.decline.title": "Declining {name}",
  "detail.modtools.joinRequests.decline.kindLabel": "Which kind of no is this?",
  "detail.modtools.joinRequests.decline.notNow.label": "Not right now",
  "detail.modtools.joinRequests.decline.notAFit.label": "Not a fit",
  "detail.modtools.joinRequests.decline.reapplyAfterDays":
    "They can ask again in {days} days.",
  "detail.modtools.joinRequests.decline.reasonLabel":
    "A note for the applicant (optional)",
  "detail.modtools.joinRequests.decline.reasonHint":
    "The applicant reads this word for word. Keep anything meant only for your fellow moderators out of it.",
  "detail.modtools.joinRequests.decline.reasonPlaceholder":
    "What you would like them to know.",
  "detail.modtools.joinRequests.decline.confirmCta": "Send the decline",
  "detail.modtools.joinRequests.decline.cancelCta": "Cancel",
  // PRD-31: the ban-evasion flag on a join-queue row, and the escalation
  // behind it. THE COPY MUST NOT SAY MORE THAN THE ONE BIT DOES. It says this
  // applicant matches somebody THIS community barred, and it says so as a
  // prompt to look. There is no score, no tier, no confidence, no prior
  // account and no date behind it, a ban anywhere else on QueerPulse answers
  // no, and nothing here may read as a verdict or as certainty. The three
  // outcomes are matched, no match, and could-not-check: a check that failed
  // is never written as reassurance.
  "detail.modtools.joinRequests.banEvasion.checking":
    "Checking this community's ban list.",
  "detail.modtools.joinRequests.banEvasion.matched.title":
    "This applicant matches someone barred from this community",
  "detail.modtools.joinRequests.banEvasion.matched.body":
    "Treat it as a prompt to look, and decide for yourself. A match like this can be wrong, and you are the person who would recognise someone you barred. Nothing has happened to their request.",
  "detail.modtools.joinRequests.banEvasion.matched.scope":
    "This only ever covers bans your own community has placed. A ban anywhere else on QueerPulse answers no here, and platform staff are the people who can see those.",
  "detail.modtools.joinRequests.banEvasion.unavailable.title":
    "We couldn't run this check",
  "detail.modtools.joinRequests.banEvasion.unavailable.body":
    "The check gave no answer for this applicant, so the question is still open. This is not an all-clear. Try again, and tell us if it keeps happening.",
  "detail.modtools.joinRequests.banEvasion.unavailable.retryCta": "Try again",
  "detail.modtools.joinRequests.banEvasion.unavailable.retryAria":
    "Try again for {name}",
  // Escalating. The community moderator recognises, platform staff
  // investigates: the button is how a moderator asks for the wider picture
  // instead of being handed it.
  "detail.modtools.joinRequests.banEvasion.escalateHint":
    "Platform staff can see every community and the platform ban list, which is the picture you are missing here. Asking holds up nothing and costs the applicant nothing.",
  "detail.modtools.joinRequests.banEvasion.escalateCta":
    "Ask platform staff to look",
  "detail.modtools.joinRequests.banEvasion.escalateAria":
    "Ask platform staff to look at {name}",
  "detail.modtools.joinRequests.banEvasion.reEscalateCta":
    "Ask staff to look again",
  "detail.modtools.joinRequests.banEvasion.reEscalateAria":
    "Ask staff to look again at {name}",
  "detail.modtools.joinRequests.banEvasion.note.label":
    "Anything staff should know (optional)",
  "detail.modtools.joinRequests.banEvasion.note.hint":
    "Platform staff read this. The applicant never does. Sending with no note at all is a complete request.",
  "detail.modtools.joinRequests.banEvasion.note.placeholder":
    "What made you look.",
  "detail.modtools.joinRequests.banEvasion.note.sendCta":
    "Send to platform staff",
  "detail.modtools.joinRequests.banEvasion.note.cancelCta": "Cancel",
  "detail.modtools.joinRequests.banEvasion.escalated.title":
    "With platform staff",
  "detail.modtools.joinRequests.banEvasion.escalated.open":
    "Escalated to platform staff on {date}",
  // Nothing notifies a moderator when staff close a case, so the copy tells
  // them where to look instead of promising to reach them.
  "detail.modtools.joinRequests.banEvasion.escalated.openNote":
    "It sits with them now. Nothing will notify you, so come back to this queue to see whether it has been closed.",
  "detail.modtools.joinRequests.banEvasion.escalated.resolved":
    "Staff closed the escalation you raised on {date}",
  // What staff found is the cross-community judgement the one-bit flag exists
  // to withhold, so "resolved" means somebody looked, and that is all.
  "detail.modtools.joinRequests.banEvasion.escalated.resolvedNote":
    "Somebody looked. What they found stays with them, and the decision on this request is still yours. Ask again if something new comes up.",
  "detail.modtools.joinRequests.banEvasion.escalated.storedNoteLabel":
    "The note staff have",
  "detail.modtools.joinRequests.banEvasion.escalation.checking":
    "Checking whether this was escalated already.",
  "detail.modtools.joinRequests.banEvasion.escalation.unavailable":
    "We couldn't tell whether this was escalated already. Sending again is safe: staff hold one open case per applicant.",
  // Escalating twice while a case is open returns the FIRST note, so the
  // moderator is told their words stayed where they typed them.
  "detail.modtools.joinRequests.banEvasion.noteReplaced":
    "This applicant was already escalated, so the first note is the one staff have. Yours was not added.",
  "detail.modtools.joinRequests.banEvasion.sendFailed":
    "We couldn't send that to platform staff. Try again.",
  "detail.modtools.reports.label": "Reported posts",
  "detail.modtools.reports.empty.title": "All clear",
  // Shown when a mod queue could not be loaded at all (a 403 on the reports
  // endpoint, a dropped request) — never confuse that with an empty queue.
  "detail.modtools.queueError.title": "We couldn't load this queue",
  "detail.modtools.queueError.description":
    "The queue didn't load, so treat it as unknown rather than clear. Try again, and tell us if it keeps happening.",
  "detail.modtools.queueError.retry": "Try again",
  "detail.modtools.reports.empty.description":
    "Nothing has been flagged. The community looks after each other.",
  "detail.modtools.reports.meta":
    "From {author} · flagged by {reporter} · {time} ago",
  "detail.modtools.reports.metaAuthor": "From {author} · flagged {time} ago",
  "detail.modtools.reports.metaErasedAuthor":
    "From an account that has since been removed · flagged {time} ago",
  // Severity is derived from the reason code, never chosen by the reporter.
  // Each badge spells its level out beside the icon, so the tint is a second
  // channel and never the only one.
  "detail.modtools.reports.severity.emergency": "Emergency",
  "detail.modtools.reports.severity.high": "High priority",
  "detail.modtools.reports.severity.medium": "Medium priority",
  "detail.modtools.reports.severity.low": "Low priority",
  "detail.modtools.reports.overdue": "Past its response window",
  "detail.modtools.reports.state.hidden": "Hidden from members right now",
  "detail.modtools.reports.state.removed": "Already removed",
  "detail.modtools.reports.state.deleted": "Already deleted",
  "detail.modtools.reports.excerptTruncated":
    "This is the start of it. Open the thread to read the rest before you decide.",
  "detail.modtools.reports.contentMissing":
    "The post or reply this report is about is no longer there. Dismissing closes the report.",
  "detail.modtools.reports.openThread": "Open the thread",
  "detail.modtools.reports.openThreadLabel":
    "Open the thread this report is about",
  "detail.modtools.reports.removeCta": "Take it down",
  "detail.modtools.reports.dismissCta": "Dismiss",
  "detail.modtools.reports.escalateCta": "Send to platform staff",
  "detail.modtools.reports.staffOnlyNote":
    "This report is about outing or doxxing. Trained platform staff decide these, so sending it up is the action available here.",
  // Unused since TS-08: removing a reply now goes through the report itself,
  // the same way removing a post does. Kept so nothing that still resolves it
  // renders a raw key.
  "detail.modtools.members.label": "Members",
  "detail.modtools.members.makeModCta": "Make mod",
  "detail.modtools.members.demoteCta": "Remove mod",
  "detail.modtools.members.makeCoOwnerCta": "Make co-owner",
  "detail.modtools.members.removeCoOwnerCta": "Remove co-owner",
  "detail.modtools.members.coOwnerNote":
    "Co-owners share your powers here: reviewing join requests, moderating posts, editing the community and managing the roster. Transferring ownership, archiving the community and changing a co-owner's role stay with you alone.",
  "detail.modtools.members.removeCta": "Remove from community",
  "detail.modtools.members.ownerTag": "Owner",
  "detail.modtools.members.actionsAria": "Actions for {name}",
  "detail.modtools.toast.approved": "{name} approved. Welcome them in.",
  "detail.modtools.toast.declined":
    "{name}'s request wasn't approved this time.",
  "detail.modtools.toast.postRemoved":
    "Post removed. The author has been reached.",
  "detail.modtools.toast.reportDismissed": "Report dismissed.",
  "detail.modtools.toast.reportEscalated":
    "Sent to platform staff. They take it from here.",
  "detail.modtools.toast.promoted": "{name} is now a mod.",
  "detail.modtools.toast.demoted": "{name} is a member again.",
  "detail.modtools.toast.coOwnerGranted": "{name} is now a co-owner.",
  "detail.modtools.toast.coOwnerRevoked":
    "{name} is no longer a co-owner and stays on as a member.",
  "detail.modtools.toast.removed": "{name} has been removed.",
  "detail.modtools.confirm.removeMember.title":
    "Remove {name} from the community?",
  // A removal bars the return, and a removal with no term set is a request
  // for a PERMANENT bar, which now takes two signatures (PRD-25). The old
  // "they can ask to join again later" was false in every case.
  "detail.modtools.confirm.removeMember.body":
    "They lose access to the posts, events and members here, and they are barred from coming back for a set term. Removing someone does not bar them for good on its own: that takes a second owner, co-owner or moderator, and you will be told what this removal ended up as.",
  "detail.modtools.confirm.removeMember.confirmCta": "Remove member",
  "detail.modtools.confirm.grantCoOwner.title": "Make {name} a co-owner?",
  "detail.modtools.confirm.grantCoOwner.body":
    "They get everything you can do in this community, apart from transferring ownership, archiving it and changing another co-owner's role. You can take it back at any time.",
  "detail.modtools.confirm.grantCoOwner.confirmCta": "Make co-owner",
  "detail.modtools.confirm.revokeCoOwner.title": "Remove {name} as co-owner?",
  "detail.modtools.confirm.revokeCoOwner.body":
    "They keep their place here as a member and lose the co-owner powers. You can make them a co-owner again later.",
  "detail.modtools.confirm.revokeCoOwner.confirmCta": "Remove co-owner",
  "detail.modtools.confirm.removePost.title": "Take this post down?",
  "detail.modtools.confirm.removePost.body":
    "It comes down for everyone and the report leaves your queue. Your reason is recorded on the report, so the decision can be read back later. This can't be undone from here.",
  "detail.modtools.confirm.removePost.confirmCta": "Take it down",
  "detail.modtools.confirm.removePost.reasonLabel": "What this breaks",
  "detail.modtools.confirm.removePost.noteLabel": "Why it came down",
  "detail.modtools.confirm.removePost.notePlaceholder":
    "Say what happened, in your own words.",

  // ── Danger zone (Mod tools tab, living hub) ────────────────────────────────
  "detail.dangerZone.heading": "Danger zone",
  "detail.dangerZone.errorToast": "Something went wrong. Try again.",
  "detail.dangerZone.freeze.label": "Freeze the community",
  "detail.dangerZone.freeze.text":
    "Pause new posts and joins while things settle. Members can still read.",
  "detail.dangerZone.freeze.cta": "Freeze",
  "detail.dangerZone.freeze.successToast": "{name} has been frozen.",
  "detail.dangerZone.freeze.confirm.title": "Freeze {name}?",
  "detail.dangerZone.freeze.confirm.body":
    "Members won't be able to post or join while the community is frozen. You can unfreeze it any time.",
  "detail.dangerZone.freeze.confirm.cancel": "Cancel",
  "detail.dangerZone.freeze.confirm.confirmCta": "Freeze community",
  "detail.dangerZone.archive.label": "Archive the community",
  "detail.dangerZone.archive.text":
    "Close the community for good. It stays visible as read-only; nobody can post, join, or manage it.",
  "detail.dangerZone.archive.cta": "Archive",
  "detail.dangerZone.archive.successToast": "{name} has been archived.",
  "detail.dangerZone.archive.confirm.title": "Archive {name}?",
  "detail.dangerZone.archive.confirm.body":
    "This closes the community for good. It becomes read-only and can't be reopened. This can't be undone.",
  "detail.dangerZone.archive.confirm.cancel": "Cancel",
  "detail.dangerZone.archive.confirm.confirmCta": "Archive community",
  "detail.dangerZone.transfer.label": "Transfer ownership",
  "detail.dangerZone.transfer.text":
    "Hand the community over to another member. You'll keep your current role.",
  "detail.dangerZone.transfer.cta": "Transfer",
  "detail.dangerZone.transfer.successToast":
    "Ownership was transferred to {owner}.",
  "detail.dangerZone.transfer.confirm.title": "Transfer ownership of {name}?",
  "detail.dangerZone.transfer.confirm.body":
    "Pick who takes over as owner. They'll get full control of {name}.",
  "detail.dangerZone.transfer.confirm.cancel": "Cancel",
  "detail.dangerZone.transfer.confirm.confirmCta": "Transfer ownership",
  "detail.dangerZone.transfer.confirm.empty":
    "There's nobody else on the roster to hand this to yet.",
  "detail.dangerZone.transfer.confirm.searchPlaceholder": "Search members…",

  // ── Mod tools · insight trends (12-week sparklines) ───────────────────────
  "detail.modtools.insights.trend.membersLabel": "New members a week",
  "detail.modtools.insights.trend.postsLabel": "Posts a week",
  "detail.modtools.insights.trend.rising":
    "Rising. {recent} in the last {weeks} weeks, against {previous} in the {weeks} before.",
  "detail.modtools.insights.trend.steady":
    "Holding steady. {recent} in the last {weeks} weeks, against {previous} in the {weeks} before.",
  "detail.modtools.insights.trend.falling":
    "Falling. {recent} in the last {weeks} weeks, against {previous} in the {weeks} before.",
  "detail.modtools.insights.trend.quiet":
    "Quiet. Nothing recorded in the last {total} weeks.",
  "detail.modtools.insights.trend.note":
    "Weekly totals for the whole community. Each member's own activity stays private.",

  // ── Mod tools · ban list ──────────────────────────────────────────────────
  // OPS-05: what platform staff have offered this community, and the two
  // answers its moderators can give. Written to the people being offered the
  // help, which is why these labels differ from the admin console's
  // `admin:communities.support.option.*` copy.
  "detail.modtools.support.label": "Support from QueerPulse",
  "detail.modtools.support.intro":
    "When the platform team think this community could use a hand, they say so here. Take up what helps and pass on what doesn't.",
  "detail.modtools.support.option.message":
    "Someone from the platform team writes to you directly",
  "detail.modtools.support.option.buddy":
    "A staff buddy stays alongside you for two weeks",
  "detail.modtools.support.option.toolkit":
    "The de-escalation toolkit, shared with your moderators",
  "detail.modtools.support.option.recruit":
    "Help finding another moderator to share the load",
  "detail.modtools.support.status.new": "Waiting on you",
  "detail.modtools.support.status.acknowledged": "Taken up",
  "detail.modtools.support.status.declined": "Passed on",
  "detail.modtools.support.byOn": "Offered by {name} on {date}",
  "detail.modtools.support.note": "Their note: {note}",
  "detail.modtools.support.answeredOn": "You answered on {date}.",
  "detail.modtools.support.formerStaff": "Someone from QueerPulse",
  "detail.modtools.support.acceptCta": "Yes, please",
  "detail.modtools.support.declineCta": "Not right now",
  "detail.modtools.support.acceptedToast":
    "Taken up. The platform team can see your answer.",
  "detail.modtools.support.declinedToast":
    "Passed on. The platform team can see your answer.",
  "detail.modtools.support.errorToast":
    "That answer didn't save. Please try again.",
  "detail.modtools.support.empty.title": "No offers yet",
  "detail.modtools.support.empty.description":
    "Nobody from the platform team has offered this community support. If they do, it lands here.",
  "detail.modtools.bans.label": "Barred from this community",
  "detail.modtools.bans.intro":
    "Everyone currently barred, newest first. Lifting a ban reopens the door to this community.",
  "detail.modtools.bans.empty.title": "Nobody is barred",
  "detail.modtools.bans.empty.description":
    "Bans applied when you remove someone from the community show up here.",
  "detail.modtools.bans.formerMember": "A former member",
  "detail.modtools.bans.byOn": "Barred by {name} on {date}.",
  "detail.modtools.bans.byGoneOn":
    "Barred on {date}. The moderator who applied it has since left.",
  "detail.modtools.bans.reason": "Reason recorded: {reason}",
  "detail.modtools.bans.noReason": "No reason was recorded.",
  "detail.modtools.bans.liftCta": "Lift ban",
  "detail.modtools.bans.erasedNote":
    "This account has been erased, so there is nobody left to let back in.",
  "detail.modtools.bans.confirm.title": "Lift the ban on {name}?",
  "detail.modtools.bans.confirm.body":
    "This reopens the door: {name} can ask to join again. It leaves the roster alone, so they rejoin the same way anyone else does.",
  "detail.modtools.bans.confirm.confirmCta": "Lift ban",
  "detail.modtools.bans.liftedToast": "The ban on {name} has been lifted.",
  "detail.modtools.bans.errorToast": "We could not lift that ban. Try again.",
  // PRD-25. A bar showing an end date with a permanent proposal open on it is
  // a different decision from a settled one, and the term badge alone cannot
  // tell the two apart.
  "detail.modtools.bans.pendingRatificationNote":
    "Somebody has asked for this bar to be permanent, and it is waiting on a second owner, co-owner or moderator. Until one signs, the term above is the bar in force.",
  "detail.modtools.bans.openRatificationCta": "See the proposal",

  // ── Mod tools · the term of a ban, and revising one ───────────────────────
  "detail.modtools.ban.term.permanent": "Permanent",
  "detail.modtools.ban.term.until": "Until {date}",
  "detail.modtools.ban.term.served": "Served · ended {date}",
  "detail.modtools.ban.term.pendingRatification": "Permanent bar proposed",
  "detail.modtools.ban.editCta": "Edit ban",
  "detail.modtools.ban.edit.title": "The ban on {name}",
  "detail.modtools.ban.edit.sub":
    "Set how long it lasts, cite the house rule it rests on, and rewrite the reason on the record.",
  "detail.modtools.ban.edit.durationLegend": "How long it lasts",
  "detail.modtools.ban.edit.days_one": "{count} day",
  "detail.modtools.ban.edit.days_other": "{count} days",
  "detail.modtools.ban.edit.permanent": "Permanent",
  "detail.modtools.ban.edit.durationHint":
    "A ban with an end date lifts itself when the time is up, so nobody has to remember to lift it.",
  "detail.modtools.ban.edit.reasonLegend": "Reason recorded",
  "detail.modtools.ban.edit.reasonPlaceholder":
    "What happened, in your own words.",
  "detail.modtools.ban.edit.reasonHint":
    "Up to 500 characters. It stays with the decision, so anyone reviewing it later can see what it rested on.",
  "detail.modtools.ban.edit.cancel": "Cancel",
  "detail.modtools.ban.edit.saveCta": "Save changes",
  "detail.modtools.ban.edit.savedToast": "The ban on {name} has been updated.",
  "detail.modtools.ban.edit.errorToast":
    "We could not save that change. Try again.",
  // PRD-25. Picking Permanent no longer makes anything permanent: it asks a
  // second owner, co-owner or moderator to sign, and the end date stays where
  // it is until one of them does. The option reads as the request it is.
  "detail.modtools.ban.edit.permanentPropose":
    "Permanent (asks for a second signature)",
  "detail.modtools.ban.edit.permanentHint":
    "A permanent bar takes two people. Saving this asks another owner, co-owner or moderator to sign it, and the end date stays exactly where it is until one of them does.",
  "detail.modtools.ban.edit.proposedToast":
    "Asked for the bar on {name} to be permanent. It waits on a second signature, and the end date stays as it was.",
  "detail.modtools.ban.edit.noSecondSignatoryToast":
    "A permanent bar needs a second signature, and this community has nobody else who could give one. The bar keeps its end date. Set a longer one instead.",

  // ── Mod tools · permanent bars waiting on a second signature (PRD-25) ─────
  // A community permanent bar used to be one person's decision, while the
  // platform equivalent had needed a second moderator since TS-12. It takes
  // two people here as well now. The member is removed and barred for the
  // fallback term straight away either way, and only the PERMANENCE waits, so
  // every line here has to keep saying so: a reader who thinks inaction lets
  // the member back in would decline by walking away.
  //
  // The window and the fallback term come from the API ({hours}, {days}) and
  // are never written into the copy, so the numbers cannot drift from the
  // server's.
  "detail.modtools.ratifications.label":
    "Permanent bars waiting on a second signature",
  "detail.modtools.ratifications.intro":
    "A permanent bar takes two people. Whoever asked for one cannot sign it, so it waits here for another owner, co-owner or moderator. The member is already off the roster and already barred, and that stands whatever is decided here.",
  "detail.modtools.ratifications.windowNote":
    "A proposal has {hours} hours. If nobody signs in that time it lapses, and the bar stays at {days} days and ends by itself. Nothing on this pane lets anybody back in early.",
  "detail.modtools.ratifications.error.title":
    "We couldn't load what is waiting",
  "detail.modtools.ratifications.error.description":
    "This is a load failure, so read it as unknown rather than as an empty queue: a permanent bar may be waiting on you right now. Try again.",
  "detail.modtools.ratifications.error.retry": "Try again",
  "detail.modtools.ratifications.empty.title": "Nothing waiting on a signature",
  "detail.modtools.ratifications.empty.description":
    "When somebody here asks for a permanent bar, it waits in this pane for a second owner, co-owner or moderator to sign it.",
  "detail.modtools.ratifications.title": "Permanent bar on {name}",
  "detail.modtools.ratifications.lapsed": "Lapsed",
  "detail.modtools.ratifications.lapsesAt": "Lapses {date}",
  "detail.modtools.ratifications.askedBy": "{name} asked for this on {date}.",
  "detail.modtools.ratifications.askedByGone":
    "Asked for on {date}. The person who asked has since left.",
  "detail.modtools.ratifications.noNote": "No reason was written.",
  "detail.modtools.ratifications.serving":
    "Serving now: removed from the community and barred from coming back until {date}.",
  "detail.modtools.ratifications.servingPermanent":
    "Serving now: removed from the community and barred with no end date.",
  "detail.modtools.ratifications.ifNobodySigns":
    "If nobody signs, this lapses and the bar stays at {days} days, ending on its own. Leaving it alone does not let them back in early.",
  "detail.modtools.ratifications.lapsedNote":
    "Nobody signed in time, so this proposal has lapsed. The bar stays at {days} days and ends on its own.",
  "detail.modtools.ratifications.ownProposal":
    "You asked for this bar, so you cannot be the one who signs it. It needs another owner, co-owner or moderator.",
  "detail.modtools.ratifications.ratifyCta": "Confirm the permanent bar",
  "detail.modtools.ratifications.declineCta": "Decline",
  "detail.modtools.ratifications.ratifiedToast":
    "The bar on {name} is now permanent.",
  "detail.modtools.ratifications.declinedToast":
    "You declined the permanent bar on {name}. The bar stays at {days} days.",
  "detail.modtools.ratifications.errorToast":
    "We could not record that decision. Try again.",
  "detail.modtools.ratifications.refusal.ownProposal":
    "You asked for this bar, so you cannot be the one who signs it.",
  "detail.modtools.ratifications.refusal.alreadyDecided":
    "This one has already been decided, it has lapsed, or the bar was lifted underneath it.",
  "detail.modtools.ratifications.refusal.gone":
    "This proposal is not here any more.",
  "detail.modtools.ratifications.confirm.ratifyTitle":
    "Make the bar on {name} permanent?",
  "detail.modtools.ratifications.confirm.declineTitle":
    "Decline the permanent bar on {name}?",
  "detail.modtools.ratifications.confirm.ratifyBody":
    "Yours is the second of the two signatures this needs. The bar loses its end date, and {name} cannot come back to this community. Lifting it later is a separate decision, and any owner, co-owner or moderator can make it.",
  "detail.modtools.ratifications.confirm.declineBody":
    "{name} stays removed and stays barred. The bar keeps the end date it already has, {days} days from when it was applied, and it ends by itself then. Say why, so the moderator who asked can read it.",
  "detail.modtools.ratifications.confirm.noteLabel": "Your note",
  "detail.modtools.ratifications.confirm.ratifyNotePlaceholder":
    "Optional. Anything you want kept with the decision.",
  "detail.modtools.ratifications.confirm.declineNotePlaceholder":
    "Why you would not sign this.",
  "detail.modtools.ratifications.confirm.noteHint":
    "Up to 2000 characters. It goes on the record with your decision, and the moderator who asked can read it.",
  "detail.modtools.ratifications.confirm.cancel": "Cancel",

  // ── Mod tools · what a removal actually did (PRD-25) ──────────────────────
  // The route answers with its own sentence and the dialog shows it unedited,
  // because the server is the authority on which of the three outcomes a
  // removal got. These lines add what that sentence cannot: that a proposer
  // may never sign their own bar, and where the proposal now lives.
  "detail.modtools.removalOutcome.pending.title":
    "Waiting on a second signature",
  "detail.modtools.removalOutcome.pending.body":
    "The removal is done and the bar is already in force. The permanent part of it is still open: another owner, co-owner or moderator has to sign, and you cannot sign your own proposal. If nobody signs, the bar keeps its end date and ends by itself.",
  "detail.modtools.removalOutcome.pending.lapsesAt":
    "The proposal lapses on {date} if nobody has signed it by then.",
  "detail.modtools.removalOutcome.noSecond.title":
    "This bar cannot be made permanent here",
  "detail.modtools.removalOutcome.noSecond.body":
    "A permanent bar takes two signatures, and this community has nobody else who could give the second one. The removal stands and so does the bar, until the date below. To bar somebody permanently, this community needs another owner, co-owner or moderator.",
  "detail.modtools.removalOutcome.servingUntil":
    "Barred from coming back until {date}.",
  "detail.modtools.removalOutcome.closeCta": "Close",
  "detail.modtools.removalOutcome.openQueueCta": "Open the queue",

  // ── Mod tools · the house rule a moderation action cites ──────────────────
  "detail.modtools.rule.legend": "House rule cited",
  "detail.modtools.rule.noneWritten":
    "This community has not written any house rules yet, so there is nothing to cite.",
  "detail.modtools.rule.noneOption": "No rule cited",
  "detail.modtools.rule.option": "Rule {number}: {text}",
  "detail.modtools.rule.hint":
    "Citing a rule is optional. Pick the one this decision rests on when there is a fit.",
  "detail.modtools.rule.citation": "House rule {number}",
  "detail.modtools.rule.stale":
    "The rules have changed since. This is rule {number} as it read in version {version}.",

  // ── Mod tools · invite members ────────────────────────────────────────────
  "detail.modtools.invites.label": "Invite members",
  "detail.modtools.invites.intro":
    "Pick people you are connected to and send them an invitation to this community, up to {max} at a time. An invitation is a message they can accept or leave. Joining stays their decision.",
  "detail.modtools.invites.searchPlaceholder": "Search your connections…",
  "detail.modtools.invites.selectedCount": "{selected} of {max} selected",
  "detail.modtools.invites.sendCta": "Send invitations",
  "detail.modtools.invites.errorToast":
    "We could not send those invitations. Try again.",
  "detail.modtools.invites.empty.title": "Nobody left to invite",
  "detail.modtools.invites.empty.description":
    "Everyone you are connected to is already on this roster.",
  "detail.modtools.invites.result.invited": "Invitations sent ({total})",
  "detail.modtools.invites.result.skipped": "Skipped ({total})",
  "detail.modtools.invites.result.skipRow": "{name}: {reason}",
  "detail.modtools.invites.result.note":
    "Everyone under Skipped was passed over and received nothing. Everyone invited decides for themselves whether to join.",
  "detail.modtools.invites.skip.unknownMember":
    "We could not find this member.",
  "detail.modtools.invites.skip.self": "This is your own account.",
  "detail.modtools.invites.skip.systemAccount": "This is a platform account.",
  "detail.modtools.invites.skip.alreadyMember": "Already a member here.",
  "detail.modtools.invites.skip.pendingRequest":
    "Already asked to join. Answer them in the requests queue above.",
  "detail.modtools.invites.skip.banned": "Barred from this community.",

  // ── Mod tools · governance history (PRD-26) ───────────────────────────────
  // This community's own read of `community_governance_log`. The trail had one
  // reader for a long time, the platform admin console, so a community's own
  // owner could not answer "who removed her" without asking QueerPulse staff.
  // A platform action is labelled as one: the server withholds the staff
  // member's name and this copy says plainly where the change came from.
  "detail.modtools.history.label": "Governance history",
  "detail.modtools.history.intro":
    "Every governance action recorded against this community, newest first. The server writes these entries, and nobody can edit or delete them, here or anywhere else.",
  "detail.modtools.history.filterLabel": "Filter by action",
  "detail.modtools.history.allActions": "All actions",
  "detail.modtools.history.staffOnly.title":
    "Only this community's staff read this",
  "detail.modtools.history.staffOnly.description":
    "The governance trail is for this community's owner, co-owners and moderators.",
  "detail.modtools.history.error.title": "We couldn't load the history",
  "detail.modtools.history.error.description":
    "Something went wrong loading the trail. What this community has recorded stays unknown until it loads. Try again, and tell us if it keeps happening.",
  "detail.modtools.history.error.retry": "Try again",
  "detail.modtools.history.empty.title": "Nothing recorded yet",
  "detail.modtools.history.empty.description":
    "Role changes, removals, bans, ownership handovers, freezes and settings edits all land here the moment they happen.",
  "detail.modtools.history.emptyFiltered.title": "Nothing of this kind",
  "detail.modtools.history.emptyFiltered.description":
    "This community has governance history, and none of it matches the action you picked. Clear the filter to read the whole trail.",
  "detail.modtools.history.clearFilterCta": "Clear the filter",
  "detail.modtools.history.pagerMeta": "{start} to {end} of {total}",
  "detail.modtools.history.pagerPage": "Page {page} of {pageCount}",
  "detail.modtools.history.prevPage": "Previous page",
  "detail.modtools.history.nextPage": "Next page",

  // One label per value of the backend's `GovernanceLogAction` enum. A value
  // added after this shipped falls back to a humanized version of the raw key.
  "detail.modtools.history.action.role_changed": "Role changed",
  "detail.modtools.history.action.member_removed": "Member removed",
  "detail.modtools.history.action.member_banned": "Member barred",
  "detail.modtools.history.action.member_ban_proposed":
    "Permanent bar proposed",
  "detail.modtools.history.action.member_ban_ratified": "Permanent bar signed",
  "detail.modtools.history.action.member_ban_declined": "Permanent bar refused",
  "detail.modtools.history.action.member_ban_hold_expired":
    "Permanent bar lapsed unsigned",
  "detail.modtools.history.action.ban_lifted": "Ban lifted",
  "detail.modtools.history.action.ownership_transferred":
    "Ownership transferred",
  "detail.modtools.history.action.owner_auto_promoted": "Owner auto-promoted",
  "detail.modtools.history.action.frozen": "Frozen",
  "detail.modtools.history.action.unfrozen": "Unfrozen",
  "detail.modtools.history.action.archived": "Archived",
  "detail.modtools.history.action.unarchived": "Unarchived",
  "detail.modtools.history.action.settings_changed": "Settings changed",
  "detail.modtools.history.action.card_program_enabled": "Card programme on",
  "detail.modtools.history.action.card_program_disabled": "Card programme off",
  "detail.modtools.history.action.card_suspended": "Card suspended",
  "detail.modtools.history.action.card_revoked": "Card revoked",
  "detail.modtools.history.action.card_reinstated": "Card reinstated",
  "detail.modtools.history.action.card_replaced": "Card reissued",
  "detail.modtools.history.action.support_offered": "Support offered",
  "detail.modtools.history.action.support_offer_answered": "Support answered",

  "detail.modtools.history.summary.role_changed": "{name}'s role changed",
  "detail.modtools.history.summary.member_removed":
    "{name} was removed from the roster",
  // A removal the member made themselves. Told apart from a moderator's
  // removal because the trail exists to answer which of the two happened.
  "detail.modtools.history.summary.member_left": "{name} left the roster",
  "detail.modtools.history.summary.member_banned":
    "{name} was barred from this community",
  "detail.modtools.history.summary.ban_lifted": "The bar on {name} was lifted",
  "detail.modtools.history.summary.ownership_transferred":
    "{name} became the owner",
  "detail.modtools.history.summary.owner_auto_promoted":
    "{name} was promoted to owner automatically",
  "detail.modtools.history.summary.frozen": "The community was frozen",
  "detail.modtools.history.summary.unfrozen": "The freeze was lifted",
  "detail.modtools.history.summary.archived": "The community was archived",
  "detail.modtools.history.summary.unarchived":
    "The community was restored from the archive",
  "detail.modtools.history.summary.settings_changed":
    "Community settings changed",
  "detail.modtools.history.summary.card_program_enabled":
    "The membership card programme was turned on",
  "detail.modtools.history.summary.card_program_disabled":
    "The membership card programme was turned off",
  "detail.modtools.history.summary.card_suspended":
    "{name}'s membership card was suspended",
  "detail.modtools.history.summary.card_revoked":
    "{name}'s membership card was revoked",
  "detail.modtools.history.summary.card_reinstated":
    "{name}'s membership card was reinstated",
  "detail.modtools.history.summary.card_replaced":
    "{name}'s membership card was reissued",
  "detail.modtools.history.summary.support_offered":
    "QueerPulse staff offered this community support",
  "detail.modtools.history.summary.support_offer_answered":
    "The moderators answered an offer of support",
  // The fallback sentence for an action this client has no copy for yet.
  "detail.modtools.history.summary.unknown": "{action}",
  "detail.modtools.history.summary.unknownWithTarget": "{action}: {name}",

  "detail.modtools.history.formerMember": "A former member",
  "detail.modtools.history.byLine": "by {name}",
  "detail.modtools.history.byPlatform": "by QueerPulse platform staff",
  "detail.modtools.history.unattributed": "No named actor",
  "detail.modtools.history.onDate": "on {date} at {time}",
  "detail.modtools.history.platform.label": "Platform action",
  "detail.modtools.history.platform.note":
    "QueerPulse staff took this action from the platform side, over this community's own owner and moderators.",

  "detail.modtools.history.detail.role": "Role",
  "detail.modtools.history.detail.note": "Note",
  "detail.modtools.history.detail.reason": "Reason",
  "detail.modtools.history.detail.bannedAt": "Ban placed",
  "detail.modtools.history.detail.cardSerial": "Card",
  "detail.modtools.history.role.owner": "Owner",
  "detail.modtools.history.role.coOwner": "Co-owner",
  "detail.modtools.history.role.mod": "Moderator",
  "detail.modtools.history.role.member": "Member",
  "detail.modtools.history.value.fromTo": "{from} to {to}",
  "detail.modtools.history.value.on": "On",
  "detail.modtools.history.value.off": "Off",
  "detail.modtools.history.value.empty": "Empty",
  "detail.modtools.history.value.notSet": "Not set",
  "detail.modtools.history.field.name": "Name",
  "detail.modtools.history.field.purpose": "Purpose",
  "detail.modtools.history.field.type": "Type",
  "detail.modtools.history.field.whoFor": "Who it is for",
  "detail.modtools.history.field.tagline": "Tagline",
  "detail.modtools.history.field.accessTier": "Who can join",
  "detail.modtools.history.field.rosterVisible": "Roster visible",
  "detail.modtools.history.field.features": "Features",
  "detail.modtools.history.field.rules": "Rules",
  "detail.modtools.history.field.tags": "Tags",
  "detail.modtools.history.field.coverImageUrl": "Cover image",

  // ── Danger zone · your standing + owner-absence escalation ────────────────
  "detail.dangerZone.yourRole.owner": "You own this community.",
  "detail.dangerZone.yourRole.coOwner":
    "You are a co-owner here. Transferring ownership and archiving stay with the owner.",
  "detail.dangerZone.yourRole.mod":
    "You are a moderator here. Transferring ownership and archiving stay with the owner.",
  "detail.dangerZone.ownerReview.label": "Report an unreachable owner",
  "detail.dangerZone.ownerReview.text":
    "If the owner has stopped answering and this community is waiting on decisions only they can make, ask platform staff to look into it.",
  "detail.dangerZone.ownerReview.cta": "Ask staff to look",
  "detail.dangerZone.ownerReview.confirm.title":
    "Ask platform staff to check on this community's ownership?",
  "detail.dangerZone.ownerReview.confirm.body":
    "Platform staff will read this and try to reach the owner themselves. Describe when you tried to contact them and what the community is waiting on.",
  "detail.dangerZone.ownerReview.confirm.reasonLabel": "What happened",
  "detail.dangerZone.ownerReview.confirm.reasonPlaceholder":
    "We messaged the owner on 3 and 17 March about the join queue and have had no reply. Fourteen requests are waiting.",
  "detail.dangerZone.ownerReview.confirm.minHint":
    "Write at least {min} characters, so staff have something to act on.",
  "detail.dangerZone.ownerReview.confirm.tooShort":
    "Add a little more detail. At least {min} characters.",
  "detail.dangerZone.ownerReview.confirm.confirmCta": "Send to platform staff",
  "detail.dangerZone.ownerReview.filedToast":
    "Sent. Platform staff will take it from here.",
  "detail.dangerZone.ownerReview.errorToast":
    "Something went wrong. Try again.",
  "detail.dangerZone.ownerReview.open.staffHeading":
    "An ownership review is open",
  "detail.dangerZone.ownerReview.open.ownerHeading":
    "Moderators have asked platform staff to check on this community's ownership",
  "detail.dangerZone.ownerReview.open.ownerBody":
    "They reported that they were unable to reach you. You are reading this, so you can withdraw the request yourself.",
  "detail.dangerZone.ownerReview.open.filedBy": "Filed by {name} on {date}.",
  "detail.dangerZone.ownerReview.open.filedOn": "Filed on {date}.",
  "detail.dangerZone.ownerReview.open.reason": "What they wrote: {reason}",
  "detail.dangerZone.ownerReview.open.noReason": "No detail was recorded.",
  "detail.dangerZone.ownerReview.withdrawCta": "Withdraw the request",
  "detail.dangerZone.ownerReview.withdraw.title":
    "Withdraw this ownership review?",
  "detail.dangerZone.ownerReview.withdraw.body":
    "Platform staff will stop looking into it. Anyone who can file a review can file another one later.",
  "detail.dangerZone.ownerReview.withdraw.confirmCta": "Withdraw",
  "detail.dangerZone.ownerReview.withdrawnToast":
    "The ownership review has been withdrawn.",
  "detail.dangerZone.ownerReview.flagged.heading":
    "Flagged for an ownership check",
  "detail.dangerZone.ownerReview.flagged.body":
    "Platform staff have this community marked for an ownership check. There is no moderator request behind it.",

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

  // ── Copy a post's permalink (SOC-02) ──────────────────────────────────────
  "detail.pulse.copyLink.ariaLabel": "Copy a link to this post",
  "detail.pulse.copyLink.copiedToast": "Link copied. Paste it anywhere.",
  "detail.pulse.copyLink.failedToast":
    "We couldn't reach the clipboard. Copy the address bar instead.",

  // ── Announcements (owner / co-owner / moderator) ──────────────────────────
  "detail.pulse.announcement.toggleLabel": "Post as an announcement",
  "detail.pulse.announcement.toggleHint":
    "Pins it to the top of Pulse and notifies everyone in the community.",
  "detail.pulse.announcement.toggleAria": "Post this as an announcement",
  "detail.pulse.announcement.shareCta": "Announce",
  "detail.pulse.announcement.sharedToast":
    "Announced. It's pinned to the top and the community has been notified.",
  "detail.pulse.announcement.flag": "Announcement",

  // ── Feed search (server-side, across the whole history) ───────────────────
  "detail.pulse.search.placeholder": "Search posts in {name}…",
  "detail.pulse.search.ariaLabel": "Search posts in {name}",
  "detail.pulse.search.resultCount_one": "{count} matching post",
  "detail.pulse.search.resultCount_other": "{count} matching posts",
  "detail.pulse.search.loadMoreCta": "Load more results",
  "detail.pulse.search.emptyTitle": "No posts match that",
  "detail.pulse.search.emptyDescription":
    "Nothing in this community mentions “{term}”. Try a shorter word or a different spelling.",
  "detail.pulse.search.errorTitle": "We couldn't run that search",
  "detail.pulse.search.errorDescription":
    "Something went wrong reaching this community's posts. Try again in a moment.",
  "detail.events.error.title": "We couldn't load the gatherings",
  "detail.events.error.description":
    "Something went wrong reaching this community's calendar. Try again in a moment.",
  "detail.events.error.retryCta": "Try again",
  "detail.pulse.empty.title": "Nothing here yet",
  "detail.pulse.empty.description":
    "Post the first hello. A line about your week is plenty to get a room talking.",
  "detail.pulse.empty.visitorDescription":
    "This community has not posted yet. Join to be part of what comes next.",

  // ── Single post permalink page (/community/:slug/post/:postId) ────────────
  "post.heading": "A post in {name}",
  "post.backTo": "Back to {name}",
  "post.loadMoreReplies": "Load more replies",
  "post.notFound.title": "This post isn't here",
  "post.notFound.description":
    "It may have been taken down, or it lives in a community you are not part of.",
  "post.notFound.cta": "Go to the community",

  // ── About + Resources tab (living hub) ────────────────────────────────────
  "detail.aboutResources.houseRules": "House rules",
  "detail.aboutResources.resources": "Resources",

  // ── The resource shelf: read for members, editable by staff ───────────────
  "detail.resources.manageCta": "Manage",
  "detail.resources.doneCta": "Done",
  "detail.resources.emptyStaffHint":
    "Nothing on the shelf yet. Pin the things people keep asking for: the house rules doc, the group chat, the meeting notes.",
  "detail.resources.kind.link": "Link",
  "detail.resources.kind.doc": "Document",
  "detail.resources.kind.guide": "Guide",
  "detail.resources.editor.addCta": "Add a resource",
  "detail.resources.editor.capReached":
    "This shelf holds {max} resources, and it's full. Remove one to add another.",
  "detail.resources.editor.dragToReorder": "Drag to reorder",
  "detail.resources.editor.moveUpAria": "Move {title} up",
  "detail.resources.editor.moveDownAria": "Move {title} down",
  "detail.resources.editor.editAria": "Edit {title}",
  "detail.resources.editor.removeAria": "Remove {title}",
  "detail.resources.editor.errorToast":
    "That didn't save. Try again in a moment.",
  "detail.resources.editor.addedToast": "Added to the shelf.",
  "detail.resources.editor.savedToast": "Resource updated.",
  "detail.resources.editor.removedToast": "Taken off the shelf.",
  "detail.resources.editor.removeConfirmTitle": "Remove {title}?",
  "detail.resources.editor.removeConfirmBody":
    "It comes off the shelf for everyone in this community. The page it points at is untouched, and you can pin it again later.",
  "detail.resources.editor.removeConfirmCta": "Remove",
  "detail.resources.form.addTitle": "Add a resource",
  "detail.resources.form.editTitle": "Edit resource",
  "detail.resources.form.subtitle":
    "Everyone in this community sees the shelf, so keep it to things they'll actually reach for.",
  "detail.resources.form.titleLabel": "Title",
  "detail.resources.form.titlePlaceholder": "House rules",
  "detail.resources.form.titleRequired": "Give it a title.",
  "detail.resources.form.urlLabel": "Link",
  "detail.resources.form.urlPlaceholder": "https://",
  "detail.resources.form.urlHelper":
    "A full web address, starting with http:// or https://",
  "detail.resources.form.urlRequired": "Add the link it should point at.",
  "detail.resources.form.urlInvalid":
    "That isn't a web address we can link to. It needs to start with http:// or https://",
  "detail.resources.form.kindLabel": "Kind",
  "detail.resources.form.noteLabel": "Note",
  "detail.resources.form.notePlaceholder": "What people will find there",
  "detail.resources.form.noteHelper":
    "Optional. One line under the title, so nobody has to open it to know what it is.",
  "detail.resources.form.cancelCta": "Cancel",
  "detail.resources.form.saveCta": "Save",
  "detail.resources.form.savingCta": "Saving…",

  // ── Badges: role pills, access-tier pills, reaction bar ───────────────────
  "badges.role.owner": "Owner",
  "badges.role.coOwner": "Co-owner",
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
  "join.progress": "Step {step} of {total}",
  "join.ariaLabel": "Join {name}",
  "join.intro.eyebrow.request": "Asking to join",
  "join.intro.eyebrow.invite": "Joining with an invitation",
  "join.intro.eyebrow.public": "Joining",
  "join.intro.inviteHint":
    "This community is invite-only, so your request goes to the mods for review, the same as anyone else asking to join.",
  "join.intro.continueCta": "Continue",
  "join.about.eyebrow": "A bit about you",
  "join.about.title": "How should the community know you?",
  "join.about.hint":
    "Optional: a little context helps people know who you are.",
  "join.about.aboutPlaceholder":
    "A sentence about yourself: what brings you here?",
  "join.about.submitting": "Sending…",
  "join.about.errorFallback": "That didn't go through. Try again in a moment.",
  "join.involvement.title": "How would you like to be involved?",
  "join.involvement.levelLabel": "Level of involvement",
  "join.involvement.sendRequestCta": "Send request",
  "join.involvement.joinCta": "Join the community",
  "join.involvement.updates.label": "Keep me updated",
  "join.involvement.updates.desc": "News and events only: no commitment",
  "join.involvement.active.label": "Active member",
  "join.involvement.active.desc": "Come to events and join the group",
  "join.involvement.organise.label": "Help organise",
  "join.involvement.organise.desc": "Volunteer to help run things",
  // House rules, shown on the way in and agreed to per version
  "join.rules.eyebrow": "House rules",
  "join.rules.title": "The house rules of {name}",
  "join.rules.hint":
    "Read these before you join. Everyone in this space agrees to them.",
  "join.rules.updatedNotice":
    "These rules were updated while you had this open. Please read them again.",
  "join.rules.acknowledge.title":
    "I have read these house rules and I agree to follow them",
  "join.rules.acknowledge.sub":
    "You can read them again any time on the community's About tab.",
  "join.rules.continueCta": "Continue",
  "join.rules.acknowledgeRequired":
    "Please confirm you have read the house rules to carry on.",
  // The two refusals a join can come back with. Neither names a moderator and
  // neither gives a reason, because the backend deliberately sends none.
  "join.refusal.banned.title": "This community is closed to you",
  "join.refusal.banned.body":
    "You are not able to join this community. We cannot say more than that here. If you think there has been a mistake, the QueerPulse team can look into it with you.",
  "join.refusal.reapply.title": "You can ask again later",
  "join.refusal.reapply.body":
    "This community asked you to wait before applying again. You can send a new request from {date}.",
  "join.refusal.reapply.bodyNoDate":
    "This community asked you to wait before applying again. You can send a new request once that wait is over.",
  "join.refusal.closeCta": "Close",
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
  "start.thread.stepOfAriaLabel": "Step {step} of {total} · {thread}",

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
  "start.why.tagsLabel": "Tags",
  "start.why.tagsHint":
    "Choose up to {count}, shown on your community's card and searchable on Discover. We've pre-picked a couple based on your category; add or remove as you like.",

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
  // Stewards are INVITED, never assigned: the backend sends each an invitation
  // and they only join the roster once they accept. Say so plainly here, or a
  // founder opens their community expecting a team that isn't there yet.
  "start.running.stewardsSub":
    "Co-stewards can welcome new members, keep threads warm, and step in when you can't. Everyone you pick gets an invitation to steward with you, and joins once they accept. You can add or change them any time.",
  "start.running.ownerTag": "You · owner",
  "start.running.coStewardTag": "Co-steward",
  "start.running.removeAria": "Remove {name}",
  "start.running.addCta": "Add a co-steward",
  "start.running.addStewardModal.eyebrow": "Add a co-steward",
  "start.running.addStewardModal.title": "Choose someone you're connected to",
  "start.running.addStewardModal.sub":
    "Co-stewards can only be members you're already connected with. Search your connections below.",
  "start.running.addStewardModal.searchLabel": "Search your connections",
  "start.running.addStewardModal.loadMore": "Show more connections",
  "start.running.addStewardModal.searchPlaceholder": "Search by name or @slug…",
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
  "start.feature.roster.label": "Member roster",
  "start.feature.roster.desc": "A visible list of who's here.",

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
  "start.people.loadMore": "Show more connections",
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
  "start.confirm.stewardsValue": "{count} invited (you + {co} co)",
  "start.confirm.handleTaken":
    "That address is already taken. Try another one.",
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
  "detail.founded": "Founded {date}",
  "detail.foundedRecently": "Founded recently",
  "detail.foundedJustNow": "Founded just now",
  "detail.cadenceDefault": "Finding its rhythm",
  "detail.nextEvent.soonChip": "soon",
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
  "detail.organiser.justOpened": "Just opened {name}. {blurb}",
  "detail.about.whoForLine": "Who it's for: {whoFor}",

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
  "edit.field.coverHint":
    "A wide photo shown on your community's card. At least 1200 × 600px.",
  "edit.field.type": "Kind of space",
  "edit.field.whoFor": "Who it's for",
  "edit.field.purpose": "What it's for",
  "edit.field.access": "Who can find it",
  "edit.field.rosterVisible": "Show the member list to members",
  "edit.ownerOnlyHint": "Only the owner can change this.",
  "edit.field.features": "What's inside",
  "edit.field.rules": "Shared values",
  "edit.field.tags": "Tags",
  "edit.field.tagsHint":
    "Choose up to {count}, shown on your community's card and searchable on Discover.",
  "tagPicker.overlapHint":
    "These often go together, pick the one that fits best.",
  "edit.suggestTag.trigger": "Don't see the tag you need? Suggest one",
  "edit.suggestTag.title": "Suggest a tag",
  "edit.suggestTag.sub": "We'll review it and may add it to the curated list.",
  "edit.suggestTag.labelField": "Tag name",
  "edit.suggestTag.labelPlaceholder": "e.g. Chosen Family",
  "edit.suggestTag.noteField": "Note (optional)",
  "edit.suggestTag.notePlaceholder": "Why would this tag help your community?",
  "edit.suggestTag.cancel": "Cancel",
  "edit.suggestTag.submit": "Send suggestion",
  "edit.suggestTag.submitting": "Sending…",
  "edit.suggestTag.successToast": "Thanks, we'll take a look at that tag.",
  "edit.suggestTag.errorToast": "Couldn't send your suggestion. Try again.",
  "edit.rules.add": "Add",
  "edit.rules.addPlaceholder": "Add a shared value…",
  "edit.rules.remove": "Remove rule",
  "edit.toast.saved": "Changes saved",
  "edit.toast.error": "Couldn't save your changes. Please try again.",
  "edit.preview.title": "Your card",
  "edit.preview.hint":
    "This is how your community appears on Discover and on members' profiles. It updates as you type.",
  "edit.preview.namePlaceholder": "Your community",
  "edit.preview.taglinePlaceholder": "Your tagline shows up here.",

  // ── Discover: tags filter ─────────────────────────────────────────────────
  "discover.filter.tagsTitle": "Tags",
  "discover.filter.tagsAriaLabel": "Filter communities by tag",
  "discover.filter.tagsSearchPlaceholder": "Search tags",
  "discover.filter.tagsNoMatch": "No tags match “{query}”.",
  "discover.filter.tagWithCount_one": "{label}, {count} community",
  "discover.filter.tagWithCount_other": "{label}, {count} communities",

  // ── Curated tag vocabulary (COMMUNITY_TAGS, communityTags.data.ts) ───────
  // Shown as pills on every community card and as the edit modal's / Discover
  // filter's picker options. Slugs are a fixed, backend-shared vocabulary —
  // see the doc comment on communityTags.data.ts before touching this list.
  "tag.trans-nonbinary": "Trans & Nonbinary",
  "tag.sapphic-wlw": "Sapphic / WLW",
  "tag.gay-men": "Gay Men",
  "tag.bisexual-pan": "Bisexual & Pan",
  "tag.asexual-aromantic": "Asexual & Aromantic",
  "tag.two-spirit": "Two-Spirit",
  "tag.intersex": "Intersex",
  "tag.bipoc-led": "BIPOC-Led",
  "tag.disability-chronic-illness": "Disability & Chronic Illness",
  "tag.neurodivergent": "Neurodivergent",
  "tag.deaf-hard-of-hearing": "Deaf & Hard of Hearing",
  "tag.elders-50-plus": "Elders (50+)",
  "tag.youth-18-24": "Youth (18-24)",
  "tag.parents-family": "Parents & Family",
  "tag.polyamory-enm": "Polyamory & ENM",
  "tag.leather-kink": "Leather & Kink",
  "tag.bear-cub": "Bear & Cub",
  "tag.drag-performance": "Drag & Performance",
  "tag.beginner-friendly": "Beginner Friendly",
  "tag.in-person-meetups": "In-Person Meetups",
  "tag.virtual-online": "Virtual/Online",
  "tag.local-city-based": "Local/City-Based",
  "tag.peer-support": "Peer Support",
  "tag.discussion-group": "Discussion Group",
  "tag.book-club": "Book Club",
  "tag.study-group": "Study Group",
  "tag.game-night": "Game Night",
  "tag.sober-substance-free": "Sober & Substance-Free",
  "tag.twelve-step-recovery": "12-Step & Recovery",
  "tag.creative-collective": "Creative Collective",
  "tag.mentorship": "Mentorship",
  "tag.mental-health": "Mental Health",
  "tag.coming-out-support": "Coming Out Support",
  "tag.health-wellness": "Health & Wellness",
  "tag.career-networking": "Career & Networking",
  "tag.housing-roommates": "Housing & Roommates",
  "tag.legal-immigration": "Legal & Immigration",
  "tag.faith-spirituality": "Faith & Spirituality",
  "tag.sports-fitness": "Sports & Fitness",
  "tag.outdoors-hiking": "Outdoors & Hiking",
  "tag.music": "Music",
  "tag.film-tv": "Film & TV",
  "tag.tech-gaming": "Tech & Gaming",
  "tag.fashion-style": "Fashion & Style",
  "tag.food-cooking": "Food & Cooking",
  "tag.arts-crafts": "Arts & Crafts",
  "tag.activism-mutual-aid": "Activism & Mutual Aid",
  "tag.politics-advocacy": "Politics & Advocacy",
  "tag.nightlife-events": "Nightlife & Events",
  "tag.hiv-wellness": "HIV+ & Wellness",
  "tag.trans-health-medical": "Trans Health & Medical",
  "tag.sex-worker-allies": "Sex Worker Allies",
  "tag.accessibility-first": "Accessibility-First",

  // Deep-scan section 13 (the vertical surfaces), built 2026-08-31.
  // PHOTO-ESCALATE — PHOTO-ESCALATE (TS-14) — the mod tools report row. Sits beside the existing detail.modtools.reports.staffOnlyNote, which stays as-is for the emergency band. This one is shown when the report is about something the platform will not show a community moderator (a gathering photo today), so Take it down and Dismiss are absent and escalation is the offered action.
  "detail.modtools.reports.unviewableSubjectNote":
    "This report is about a photo we cannot show you here. Platform staff can see it, so the decision is theirs. Send it up, and add anything you know about the gathering or the people in it.",
};

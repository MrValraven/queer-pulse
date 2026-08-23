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
  "category.community": "Community",

  // ── Discover directory (CommunitiesPage) ──────────────────────────────────
  "discover.hero.eyebrow": "Communities & Collectives",
  "discover.hero.title": "Find your <em>people.</em>",
  "discover.hero.lead":
    "A living directory of queer communities and collectives across Lisbon. Social clubs, arts collectives, activist groups, sports teams, support circles, and professional networks: something for where you are right now.",
  "discover.hero.cta": "Go to your hub",
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
  "discover.toggle.openOnly": "Open to all",
  "discover.toggle.busyOnly": "Busy this week",
  "discover.sort.active": "Most active",
  "discover.resline.count_one": "{count} community",
  "discover.resline.count_other": "{count} communities",
  "discover.resline.reset": "Clear filters",
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

  // ── Community card / join CTA labels ───────────────────────────────────────
  // Shared by the discover grid and the community-detail hero.
  "card.join.public": "Join",
  "card.join.invite": "Join with invite",
  "card.join.request": "Request",
  "card.joined": "Joined",
  // Shoulder badge on a card for a community you already belong to, where a
  // stranger's card shows its access tier instead.
  "card.youreIn": "You're in",
  "card.view": "View",
  "card.enterQuietly": "Enter quietly",
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
  "detail.rulesUpdate.errorToast":
    "That did not save. Try again in a moment.",
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
  "detail.modtools.reports.metaLive": "Flagged {time} ago",
  "detail.modtools.reports.removeCta": "Remove post",
  "detail.modtools.reports.dismissCta": "Dismiss",
  "detail.modtools.reports.replyNote":
    "This report is on a reply. It can be dismissed here; removing it means opening the post it sits under.",
  "detail.modtools.members.label": "Members",
  "detail.modtools.members.makeModCta": "Make mod",
  "detail.modtools.members.demoteCta": "Remove mod",
  "detail.modtools.members.removeCta": "Remove from community",
  "detail.modtools.members.ownerTag": "Owner",
  "detail.modtools.toast.approved": "{name} approved. Welcome them in.",
  "detail.modtools.toast.declined":
    "{name}'s request wasn't approved this time.",
  "detail.modtools.toast.postRemoved":
    "Post removed. The author has been reached.",
  "detail.modtools.toast.reportDismissed": "Report dismissed.",
  "detail.modtools.toast.promoted": "{name} is now a mod.",
  "detail.modtools.toast.demoted": "{name} is a member again.",
  "detail.modtools.toast.removed": "{name} has been removed.",
  "detail.modtools.confirm.removeMember.title":
    "Remove {name} from the community?",
  "detail.modtools.confirm.removeMember.body":
    "They lose access to the posts, events and members here. They can ask to join again later.",
  "detail.modtools.confirm.removeMember.confirmCta": "Remove member",
  "detail.modtools.confirm.removePost.title": "Take this post down?",
  "detail.modtools.confirm.removePost.body":
    "The post comes down for everyone and the report leaves your queue. This can't be undone from here.",
  "detail.modtools.confirm.removePost.confirmCta": "Remove post",

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
  "detail.dangerZone.ownerReview.errorToast": "Something went wrong. Try again.",
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
  "join.close": "Close",
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

  // ── Discover: tags filter ─────────────────────────────────────────────────
  "discover.filter.tagsTitle": "Tags",
  "discover.filter.tagsAriaLabel": "Filter communities by tag",
  "discover.filter.tagsSearchPlaceholder": "Search tags",
  "discover.filter.tagsNoMatch": "No tags match “{query}”.",

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
};

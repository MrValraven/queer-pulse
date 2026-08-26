import type { Catalog } from "../../types";

/**
 * The Feed page chrome. Post bodies/authors/timestamps, gathering/article/
 * member specifics (`FEED_POST`, `NEW_THIS_WEEK`, the sidebar's upcoming
 * gatherings, `SavedArticleCard`/`RecapCard` titles) are deliberately NOT in
 * this catalog — `GET /feed` serves that content in live mode (see
 * `api/feed.adapters.ts`), so it's member-authored content, never translated.
 * `FEED_TABS` values stay the canonical English ids the rest of the app
 * filters/persists on — only the `tab.*` display labels below are translated
 * (label-key indirection; see `FEED_TAB_COPY`'s doc comment in feed.data.ts).
 */
export const feed: Catalog = {
  // ── Tab labels (canonical id stays English; this is the display label) ──
  "tab.all": "All",
  "tab.communities": "Communities",
  "tab.connections": "Connections",
  "tab.gatherings": "Gatherings",
  "tab.people": "People",
  "tab.posts": "Posts",
  // Accessible name for the tablist itself (shared <Tabs label>).
  "tab.listAria": "Filter your feed",

  // ── Per-tab empty/error copy (FEED_TAB_COPY) — kept distinct per tab ────
  "tab.all.empty.title": "Your feed is quiet",
  "tab.all.empty.description":
    "When the people and communities you follow post, gather, or welcome someone new, it lands here.",
  "tab.all.empty.action": "Find people to follow",
  "tab.all.error.title": "Couldn't load your feed",
  "tab.all.error.description":
    "Something got in the way reaching the community. Give it another try.",

  "tab.communities.empty.title": "No community pulse yet",
  "tab.communities.empty.description":
    "Join a community and its plans, pinned notes, and conversations will gather here.",
  "tab.communities.empty.action": "Browse communities",
  "tab.communities.error.title": "Couldn't reach your communities",
  "tab.communities.error.description":
    "The pulse from your communities didn't come through. Try again in a moment.",

  "tab.connections.empty.title": "Nothing from your connections yet",
  "tab.connections.empty.description":
    "Once you connect with people here, what they post and host will show up in this tab.",
  "tab.connections.empty.action": "Find people to connect with",
  "tab.connections.error.title": "Couldn't load your connections' feed",
  "tab.connections.error.description":
    "We couldn't reach your connections' activity. Give it another try.",

  "tab.gatherings.empty.title": "Nothing on the calendar yet",
  "tab.gatherings.empty.description":
    "When a gathering you're part of is announced or recapped, you'll find it here.",
  "tab.gatherings.empty.action": "See what's on",
  "tab.gatherings.error.title": "Couldn't load gatherings",
  "tab.gatherings.error.description":
    "We couldn't reach what's coming up. Give it another try.",

  "tab.people.empty.title": "No new faces yet",
  "tab.people.empty.description":
    "As people you're connected to arrive or share something, they'll show up here.",
  "tab.people.empty.action": "Meet the community",
  "tab.people.error.title": "Couldn't load new faces",
  "tab.people.error.description":
    "We couldn't reach the latest arrivals. Try again in a moment.",

  "tab.posts.empty.title": "Quiet in here for now",
  "tab.posts.empty.description":
    "Follow more people, or start the conversation yourself, and posts will fill this space.",
  "tab.posts.empty.action": "Go to the forum",
  "tab.posts.error.title": "Couldn't load posts",
  "tab.posts.error.description":
    "The conversation didn't come through this time. Give it another try.",

  "common.viewEverything": "View everything",
  "common.tryAgain": "Try again",

  // ── Infinite-scroll pager (FeedLoadMore) ────────────────────────────────
  "loadMore.cta": "Load more",
  "loadMore.loading": "Loading more…",

  // ── Greeting ────────────────────────────────────────────────────────────
  "greeting.morning": "Good morning",
  "greeting.afternoon": "Good afternoon",
  "greeting.evening": "Good evening",
  "greeting.dateLine": "{weekday} · {city} · {date}",
  "greeting.city": "Lisbon",

  // ── FeedCards: GatheringCard ────────────────────────────────────────────

  // ── FeedCards: NewMemberCard ────────────────────────────────────────────
  "card.newMember.today": "today",

  // ── FeedCards: SavedArticleCard / RecapCard ─────────────────────────────
  "card.savedArticle.eyebrow": "From your saves",
  "card.recap.eyebrow": "Gathering recap",

  // ── Shared action labels ────────────────────────────────────────────────
  "action.connect": "Connect",
  "action.cancel": "Cancel",
  "action.reply": "Reply",
  "action.done": "Done",
  "action.continueReading": "Continue reading",
  "action.readRecap": "Read the recap",

  // ── Reply composer ──────────────────────────────────────────────────────
  "composer.srLabel": "Write a reply",
  "composer.placeholder": "Write a reply…",

  // ── PostCard / PostActions ──────────────────────────────────────────────
  "post.unlikeAria": "Unlike post",
  "post.likeAria": "Like post",
  "post.replyCount": "Reply · {count}",
  "post.replyAria": "Reply to post",

  // ── FeedModeration: MoreMenu / BlockConfirmModal / ReportModal ──────────
  "moderation.reportPost": "Report post",
  "moderation.mute": "Mute {name}",
  "moderation.unmute": "Unmute {name}",
  "moderation.block": "Block {name}",
  "moderation.unblock": "Unblock {name}",
  "moderation.mutedToast": "Muted {name}",
  "moderation.unmutedToast": "Unmuted {name}",
  "moderation.unblockedToast": "Unblocked {name}",
  "moderation.postOptionsAria": "Post options",

  "moderation.blockConfirm.title": "You blocked <em>{name}</em>",
  "moderation.blockConfirm.body":
    "They can no longer message you, see your profile, or find you here{reportNote}. You can undo this anytime from your connections.",
  "moderation.blockConfirm.alsoReported":
    ", and our safety team has your report",
  "moderation.blockDialog.title": "Block {name}?",
  "moderation.blockDialog.sub":
    "They won't be able to message you, see your profile, or find you, and any connection between you will be removed. This works both ways.",
  "moderation.blockDialog.alsoReportLabel":
    "Also report {name} to our safety team",
  "moderation.blockDialog.submitCta": "Block {name}",

  "moderation.reportConfirm.title": "Thank you, <em>we're on it</em>",
  "moderation.reportConfirm.body":
    "Our moderation team will review this post about {name}. For anything urgent, reach us directly at {email}.",
  "moderation.reportDialog.title": "Report this post",
  "moderation.reportDialog.sub":
    "Tell us what's wrong. Reports are confidential and reviewed by our safety team.",
  "moderation.reportDialog.detailPlaceholder": "Add any details (optional)",
  "moderation.reportDialog.submitCta": "Submit report",
  "moderation.reportDialog.retryCta": "Try again",
  "moderation.reportDialog.failed":
    "We couldn't send that report. Nothing has been submitted yet. Check your connection and try again.",
  "moderation.sending": "Sending…",

  // ── FeedSidebar ─────────────────────────────────────────────────────────
  "sidebar.upcomingHeading": "Upcoming",
  "sidebar.upcomingEmpty": "No gatherings on your calendar yet.",
  "sidebar.seeCalendar": "See full calendar",
  "sidebar.newThisWeekHeading": "New this week",
  "sidebar.newMembersEmpty": "No new members to show yet.",
  "sidebar.browseMembers": "Browse all members",
  "sidebar.connectionsHeading": "Your connections",
  "sidebar.connectionsEmpty": "You haven't connected with anyone yet.",
  "sidebar.connectionsCount_one": "{count} connection",
  "sidebar.connectionsCount_other": "{count} connections",
  "sidebar.manage": "Manage",

  // ── Redesigned card chrome (eyebrows, actions, proof/stat templates) ──
  "card.eyebrow.newMember": "New member",
  "card.eyebrow.gathering": "Gathering",
  "card.eyebrow.community": "Community",
  "card.eyebrow.communityPost": "From a community you're in",
  "card.eyebrow.forumThread": "Forum thread",
  "card.forumThread.anonymousAuthor": "A member",
  "action.viewProfileAria": "View {name}'s profile",
  "action.sayHi": "Say hi",
  "action.follow": "Follow",
  "action.following": "Following",
  "action.profile": "Profile",
  "action.join": "Join",
  "action.peekInside": "Peek inside",
  "action.about": "About",
  "action.saveSpot": "Save my spot",
  "action.maybe": "Maybe",
  "action.details": "Details",
  "action.countMeIn": "Count me in · {count}",
  "action.openThread": "Open thread",
  "proof.communitiesInCommon": "{count} communities in common",
  "gathering.spots": "{going} going · {spots} spots left",
  "gathering.full": "{going} going · full",
  "gathering.hostedBy": "Hosted by {host}",
  "card.gathering.anonymousHost": "QueerPulse",
  "community.meta": "{count} members · {visibility} · {city}",
  "community.newThisWeek": "{count} new this week",
  "community.posts7d": "{count} posts in 7 days",
  "post.inCommunity": "in {community} · {count} replies",
  "banner.joined": "{count} people joined near you this week",
  "banner.sharing": "{count} share your communities",

  // ── Why an item is in the feed (SOC-04) ─────────────────────────────────
  // Ranking that cannot explain itself is a black box. Every reason names a
  // fact the member created on purpose and can undo.
  "reason.membership": "You're in {subject}",
  "reason.connection": "From {subject}, in your connections",
  "reason.topic": "You follow {subject}",
  "reason.recent": "New across QueerPulse",

  // ── Inline card actions (SOC-04) ────────────────────────────────────────
  "action.react": "Count me in",
  "action.reactionFailed": "That reaction didn't save. Try again?",
  "action.replySent": "Reply posted.",
  "action.replyFailed": "That reply didn't send. Try again?",

  // ── Feed source mutes (SOC-18) ──────────────────────────────────────────
  // Muting turns a source down in your own feed. It never removes you from
  // anything, and the community is never told.
  "mute.showLess": "Show less of {name}",
  "mute.showAgain": "Show {name} again",
  "mute.mutedToast": "You'll see less of {name}. You're still a member.",
  "mute.unmutedToast": "{name} is back in your feed.",
  "mute.failedToast": "That didn't save. Try again?",
  "mute.sidebarHeading": "Quieter feed",
  "mute.sidebarBlurb": "Turn a community or a thread down without leaving it.",
  "mute.manageLink": "Sources you've turned down",
  "mute.pageTitle": "Sources you've turned down",
  "mute.pageBlurb":
    "These are quieter in your feed. You are still a member of every community here, you still have full access, and nobody was told.",
  "mute.backToFeed": "Back to your feed",
  "mute.emptyTitle": "Nothing turned down",
  "mute.emptyDescription":
    "When a community or a thread is more than you want in your feed, choose \u2018Show less\u2019 on one of its cards. It will appear here so you can bring it back.",
  "mute.kind.community": "Community",
  "mute.kind.forum_thread": "Thread",
  "mute.mutedOn": "Turned down {date}",
  "mute.unmute": "Show again",
};

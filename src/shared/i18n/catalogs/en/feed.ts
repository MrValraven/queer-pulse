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
  "tab.gatherings": "Gatherings",
  "tab.people": "People",
  "tab.posts": "Posts",

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
  "greeting.newMessages_one": "{count} new message",
  "greeting.newMessages_other": "{count} new messages",
  "greeting.messagesLink": "Messages",

  // ── FeedCards: GatheringCard ────────────────────────────────────────────
  "card.gathering.upcomingIn_one": "Upcoming · {count} day",
  "card.gathering.upcomingIn_other": "Upcoming · {count} days",
  "card.gathering.goingCount": "+{count} going",
  "card.gathering.youAreGoing": "You're going",

  // ── FeedCards: NewMemberCard ────────────────────────────────────────────
  "card.newMember.tag": "New member",
  "card.newMember.joined": "Joined {when}",
  "card.newMember.today": "today",

  // ── FeedCards: SavedArticleCard / RecapCard ─────────────────────────────
  "card.savedArticle.eyebrow": "From your saves",
  "card.recap.eyebrow": "Gathering recap",

  // ── Shared action labels ────────────────────────────────────────────────
  "action.connect": "Connect",
  "action.viewProfile": "View profile",
  "action.cancel": "Cancel",
  "action.reply": "Reply",
  "action.save": "Save",
  "action.saved": "Saved",
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
  "post.unsaveAria": "Remove from saved",
  "post.saveAria": "Save post",
  "post.emptyReplies.title": "No replies yet",
  "post.emptyReplies.description": "Be the first to say something kind.",

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
  "moderation.notNowToast": "We'll remind you later",

  "moderation.blockConfirm.title": "You blocked <em>{name}</em>",
  "moderation.blockConfirm.body":
    "They can no longer message you, see your profile, or find you here{reportNote}. You can undo this anytime from your connections.",
  "moderation.blockConfirm.alsoReported":
    ", and our safety team has your report",
  "moderation.blockDialog.title": "Block {name}?",
  "moderation.blockDialog.sub":
    "They won't be able to message you, see your profile, or find you — and any connection between you will be removed. This works both ways.",
  "moderation.blockDialog.alsoReportLabel":
    "Also report {name} to our safety team",
  "moderation.blockDialog.submitCta": "Block {name}",

  "moderation.reportConfirm.title": "Thank you — <em>we're on it</em>",
  "moderation.reportConfirm.body":
    "Our moderation team will review this post about {name}. For anything urgent, reach us directly at {email}.",
  "moderation.reportDialog.title": "Report this post",
  "moderation.reportDialog.sub":
    "Tell us what's wrong. Reports are confidential and reviewed by our safety team.",
  "moderation.reportDialog.detailPlaceholder": "Add any details (optional)",
  "moderation.reportDialog.submitCta": "Submit report",
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
};

import type { Catalog } from "../../types";

/**
 * The Forum ("the town square") page chrome. `THREADS` (titles, excerpts, bodies,
 * replies, tags, "posted" timestamps) is deliberately NOT in this catalog —
 * `GET /forum/threads` + `GET /forum/threads/:slug/posts` serve that exact
 * content in live mode (see `api/forum.adapters.ts`), so it's member-authored
 * content, never translated. Category `id`s stay the canonical English values
 * the rest of the app filters/routes on — only their display `nameKey` is
 * translated (label-key indirection).
 */
export const forum: Catalog = {
  // ── Relative "posted" timestamp (live adapter; see api/forum.adapters.ts) ─
  "time.justNow": "just now",

  // ── Categories (id stays canonical; this is only the display label) ────
  "cat.all": "All posts",
  "cat.general": "General",
  "cat.housing": "Housing",
  "cat.health": "Health & Wellbeing",
  "cat.arts": "Arts & Culture",
  "cat.activism": "Activism & Proposals",
  "cat.guides": "Guides & Resources",
  "cat.jobs": "Jobs & Skills",
  "cat.trans": "Trans & Non-Binary",

  // ── The three moderators who post under the official QueerPulse account ─
  "modRole.mariana": "lead moderator",
  "modRole.rui": "moderator",
  "modRole.ana": "moderator (part-time)",

  // ── Reply sort (canonical id stays English; this is the display label) ──
  "replySort.oldest": "Oldest",
  "replySort.newest": "Newest",
  "replySort.mostHelpful": "Most helpful",

  // ── ForumPage hero ──────────────────────────────────────────────────────
  "hero.title": "The town <em>square</em>",
  "hero.lead":
    "The one community everyone here belongs to: questions, proposals, guides, and the slow work of building a movement. Take care of each other. Looking for a smaller room?",
  "hero.findCommunitiesCta": "Find your communities",
  newPostCta: "+ New post",

  // ── ForumSidebar ────────────────────────────────────────────────────────
  "sidebar.categoriesLabel": "Categories",
  "sidebar.emergencyResources": "Emergency resources",
  "sidebar.housingBoard": "Housing board",
  "sidebar.jobBoard": "Job board",
  "sidebar.governance": "Governance & transparency",

  // ── FirstPostPrompt ─────────────────────────────────────────────────────
  "firstPost.eyebrow": "You haven't posted yet",
  "firstPost.title": "Everyone was <em>new</em> once.",
  "firstPost.body":
    "The forum is only as good as what people bring to it. You don't need something big: a question, a recommendation, something you noticed. It all counts. Here are a few things people often find useful to share:",
  "firstPost.writeCta": "Write your first post",
  "firstPost.maybeLater": "Maybe later",
  "firstPost.dismissAria": "Dismiss",
  "firstPost.starter.gp": "I'm looking for a GP who…",
  "firstPost.starter.recommendation": "Anyone know a good…",
  "firstPost.starter.justMoved": "I just moved to Lisbon and…",
  "firstPost.starter.anyoneTried": "Has anyone tried…",
  "firstPost.starter.flatmates": "Looking for flatmates in…",

  // ── ComposeThreadModal ──────────────────────────────────────────────────
  "compose.confirmTitle": "Posted to <em>the town square</em>",
  "compose.confirmBody":
    "Your thread is live at the top of the forum. Members can reply, upvote, and help.",
  "compose.done": "Done",
  "compose.title": "New post",
  "compose.sub":
    "Ask a question, share a guide, or float a proposal. Be kind, be useful.",
  "compose.titleFieldLabel": "Title",
  "compose.titlePlaceholder": "A clear, specific title",
  "compose.categoryFieldLabel": "Category",
  "compose.communityFieldLabel": "Post to a community (optional)",
  "compose.communityNone": "None (global thread)",
  "compose.postFieldLabel": "Post",
  "compose.postPlaceholder": "Write your post…",
  "compose.cancel": "Cancel",
  "compose.publishCta": "Publish post",
  "compose.officialFieldLabel": "Post as QueerPulse Official",
  "compose.officialFieldHint":
    "Publishes under the QueerPulse account instead of your name.",

  // ── ComposeThreadModal · tags field ─────────────────────────────────────
  "compose.tagsFieldLabel": "Tags",
  "compose.tagsPlaceholder": "Add a tag and press Enter",
  "compose.tagsHint": "Up to {max} tags. Keep them simple, like #housing or #health.",
  "compose.removeTagAria": "Remove tag {tag}",

  // ── Forum search ────────────────────────────────────────────────────────
  "search.placeholder": "Search the forum…",
  "search.ariaLabel": "Search the forum",
  "search.clearAria": "Clear search",

  // ── ForumThreadList ─────────────────────────────────────────────────────
  "threadList.top": "Top",
  "threadList.new": "New",
  "threadList.active": "Active",
  "threadList.unanswered": "Unanswered",
  "threadList.sortAria": "Sort posts",
  "threadList.filteringByTag": "Filtering by",
  "threadList.clearTag": "Clear",
  "threadList.clearTagAria": "Clear the {tag} filter",
  "threadList.filterByTagAria": "Filter posts by {tag}",
  "threadList.count_one": "{formatted} thread",
  "threadList.count_other": "{formatted} threads",
  "threadList.emptyFiltered.title": "Nothing in this category yet",
  "threadList.emptyFiltered.description":
    "No posts here right now. Try another category, or start the conversation yourself.",
  "threadList.emptyFiltered.action": "Show all posts",
  "threadList.emptyAll.title": "Quiet in here, for now",
  "threadList.emptyAll.description":
    "The town square is open to every member. Be the one to start the conversation.",
  "threadList.emptyAll.action": "Write a post",
  "threadList.pinnedBadge": "Pinned",
  "threadList.upvoteAria": "Upvote",
  "threadList.removeUpvoteAria": "Remove upvote",
  "threadList.loadingMore": "Loading…",
  "threadList.loadMoreCta": "Load more posts",

  // ── Shared reply-count phrasing (thread card meta + reply sort bar) ─────
  repliesCount_one: "{formatted} reply",
  repliesCount_other: "{formatted} replies",

  // ── ReportReplyModal ────────────────────────────────────────────────────
  "reportReply.confirmTitle": "Thank you. <em>We're on it.</em>",
  "reportReply.confirmBody":
    "A moderator will take a look. Reports stay private, and {name} won't know it came from you.",
  "reportReply.done": "Done",
  "reportReply.title": "Report this reply",
  "reportReply.sub":
    "Let a moderator know what's wrong with {name}'s reply. This is private. No one is notified that you reported it.",
  "reportReply.reasonGroupAria": "Reason for reporting",
  "reportReply.cancel": "Cancel",
  "reportReply.sending": "Sending…",
  "reportReply.sendCta": "Send report",
  "reportReply.errorTitle": "That didn't send",
  "reportReply.errorBody":
    "We couldn't send your report just now. Nothing was submitted. Check your connection and try again.",
  "reportReply.retryCta": "Try again",

  // ── ThreadComposer ──────────────────────────────────────────────────────
  "threadComposer.replyingTo": "Replying to <strong>{name}</strong>",
  "threadComposer.placeholder": "Write a reply…",
  "threadComposer.postReplyCta": "Post reply",

  // ── ThreadOpCard ────────────────────────────────────────────────────────
  "threadOp.postedPrefix": "Posted {time}",
  "threadOp.viewsCount_one": "{formatted} view",
  "threadOp.viewsCount_other": "{formatted} views",
  "threadOp.saved": "Saved",
  "threadOp.bookmark": "Bookmark",
  "threadOp.report": "Report",
  "threadOp.voteAria": "Upvote this post",
  "threadOp.unvoteAria": "Remove your upvote",

  // ── Locked thread (moderator has closed replies) ────────────────────────
  "locked.title": "This thread is closed to new replies",
  "locked.body":
    "A moderator has closed this thread, so replies are paused. You can still read everything here.",
  "locked.replyBlockedToast": "This thread is closed to new replies.",

  // ── ThreadTopbar · moderator lock control ───────────────────────────────
  "topbar.lockThread": "Close thread",
  "topbar.unlockThread": "Reopen thread",

  // ── ThreadTopbar · admin official-byline control ────────────────────────
  "topbar.markOfficial": "Mark as QueerPulse Official",
  "topbar.unmarkOfficial": "Remove QueerPulse Official",

  // ── ThreadPage ──────────────────────────────────────────────────────────
  "threadPage.breadcrumbForum": "Forum",
  "threadPage.replyPostedToast": "Reply posted",
  "threadPage.replyFailedToast":
    "Couldn't post your reply. Try again in a moment.",
  "threadPage.notFound.title": "This thread isn't here",
  "threadPage.notFound.description":
    "It may have been removed, or the link might be broken. Head back to the forum to find current conversations.",
  "threadPage.notFound.backCta": "Back to the forum",
  "threadPage.error.title": "Couldn't load this thread",
  "threadPage.error.description":
    "Something went wrong on our end. This isn't your fault. Try again in a moment.",
  "threadPage.error.retryCta": "Try again",

  // ── ThreadReplies / ModeratorByline ─────────────────────────────────────
  "byline.withRole":
    "Written by <name>{name}</name>, {role} · on behalf of the team",
  "byline.noRole": "Written by <name>{name}</name> · on behalf of the team",
  "replies.emptyTitle": "No replies yet",
  "replies.emptyDescription":
    "This thread is waiting for its first voice. Be the first to reply. A thoughtful answer goes a long way.",
  "replies.emptyAction": "Write a reply",
  "replies.mostHelpfulBadge": "Most helpful",
  "replies.opBadge": "OP",
  "replies.unlikeAria": "Unlike this reply",
  "replies.likeAria": "Like this reply",
  "replies.loadingMore": "Loading…",
  "replies.loadMoreCta": "Load more replies",

  // ── Nested replies (reply action + collapse/expand + continue thread) ──
  "replies.reply": "Reply",
  "replies.collapseAria": "Collapse thread",
  "replies.expandAria": "Expand thread",
  "replies.continueThread": "Continue this thread ({count})",
  "replies.hiddenCount_one": "{count} hidden reply",
  "replies.hiddenCount_other": "{count} hidden replies",

  // ── ForumAuthor ─────────────────────────────────────────────────────────
  "author.officialTitle": "Official QueerPulse account",
  "author.officialBadge": "Official",
  "author.aboutTeamAria": "About the QueerPulse team & governance",
  "author.viewProfileAria": "View {name}'s profile",

  // ── PostActionsMenu (⋯ overflow menu) ────────────────────────────────────
  "postMenu.edit": "Edit",
  "postMenu.delete": "Delete",
  "postMenu.restore": "Restore",
  "postMenu.history": "View edit history",
  "postMenu.pin": "Pin",
  "postMenu.unpin": "Unpin",
  "postMenu.report": "Report",
  "postMenu.ariaLabel": "Post actions",

  // ── Edited mark / deleted-post tombstone ─────────────────────────────────
  "edited.mark": "(edited)",
  "tombstone.body": "This post was deleted.",
  "tombstone.author": "[deleted]",
  "tombstone.removedByModerator": "This post was removed by a moderator.",

  // ── Inline reply edit ────────────────────────────────────────────────────
  "replyEdit.save": "Save",
  "replyEdit.cancel": "Cancel",
  "replyEdit.saving": "Saving…",
  "replyEdit.textareaAria": "Edit your reply",

  // ── OP (original post) edit ──────────────────────────────────────────────
  "opEdit.title": "Edit post",
  "opEdit.titleLabel": "Title",
  "opEdit.bodyLabel": "Post",
  "opEdit.save": "Save changes",
  "opEdit.cancel": "Cancel",
  "opEdit.saving": "Saving…",

  // ── Delete confirmation ───────────────────────────────────────────────────
  "deleteConfirm.title": "Delete this post?",
  "deleteConfirm.body":
    "It’ll be hidden from the thread. You can restore it later. Nothing is lost.",
  "deleteConfirm.confirm": "Delete",
  "deleteConfirm.cancel": "Keep it",
  "deleteConfirm.deleting": "Deleting…",

  // ── Edit history modal ────────────────────────────────────────────────────
  "history.title": "Edit history",
  "history.empty": "No earlier versions to show.",
  "history.titleChange": "Title was: {title}",
  "history.close": "Close",

  // ── Toasts (edit / delete / restore / lock / pin) ─────────────────────────
  "toast.editSaved": "Your edit is live.",
  "toast.deleted": "Post deleted.",
  "toast.restored": "Post restored.",
  "toast.threadLocked": "Thread closed to new replies.",
  "toast.threadUnlocked": "Thread reopened.",
  "toast.threadPinned": "Thread pinned to the top of the forum.",
  "toast.threadUnpinned": "Thread unpinned.",
  "toast.threadMarkedOfficial": "Posted as QueerPulse Official.",
  "toast.threadUnmarkedOfficial": "Reverted to the original author.",
  "toast.pinCapReached": "Only 3 threads can be pinned at once. Unpin one first.",
  "toast.error": "Something went wrong. Try again in a moment.",
};

import type { Catalog } from "../../types";

/**
 * The Forum ("the commons") page chrome. `THREADS` (titles, excerpts, bodies,
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
  "hero.eyebrow": "The Public Square · open to every member",
  "hero.title": "The <em>commons</em>",
  "hero.lead":
    "The one community everyone here belongs to — questions, proposals, guides, and the slow work of building a movement. Take care of each other. Looking for a smaller room?",
  "hero.findCommunitiesCta": "Find your communities →",
  "newPostCta": "+ New post",

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
    "The forum is only as good as what people bring to it. You don't need something big — a question, a recommendation, something you noticed. It all counts. Here are a few things people often find useful to share:",
  "firstPost.writeCta": "Write your first post",
  "firstPost.maybeLater": "Maybe later",
  "firstPost.dismissAria": "Dismiss",
  "firstPost.starter.gp": "I'm looking for a GP who…",
  "firstPost.starter.recommendation": "Anyone know a good…",
  "firstPost.starter.justMoved": "I just moved to Lisbon and…",
  "firstPost.starter.anyoneTried": "Has anyone tried…",
  "firstPost.starter.flatmates": "Looking for flatmates in…",

  // ── ComposeThreadModal ──────────────────────────────────────────────────
  "compose.confirmTitle": "Posted to <em>the commons</em>",
  "compose.confirmBody":
    "Your thread is live at the top of the forum. Members can reply, upvote, and help.",
  "compose.done": "Done",
  "compose.title": "New post",
  "compose.sub":
    "Ask a question, share a guide, or float a proposal. Be kind, be useful.",
  "compose.titleFieldLabel": "Title",
  "compose.titlePlaceholder": "A clear, specific title",
  "compose.categoryFieldLabel": "Category",
  "compose.postFieldLabel": "Post",
  "compose.postPlaceholder": "Write your post…",
  "compose.cancel": "Cancel",
  "compose.publishCta": "Publish post",

  // ── ForumThreadList ─────────────────────────────────────────────────────
  "threadList.top": "Top",
  "threadList.new": "New",
  "threadList.count_one": "{formatted} thread",
  "threadList.count_other": "{formatted} threads",
  "threadList.emptyFiltered.title": "Nothing in this category yet",
  "threadList.emptyFiltered.description":
    "No posts here right now. Try another category, or start the conversation yourself.",
  "threadList.emptyFiltered.action": "Show all posts",
  "threadList.emptyAll.title": "Quiet in here — for now",
  "threadList.emptyAll.description":
    "The commons is open to every member. Be the one to start the conversation.",
  "threadList.emptyAll.action": "Write a post",
  "threadList.pinnedBadge": "Pinned",
  "threadList.upvoteAria": "Upvote",
  "threadList.removeUpvoteAria": "Remove upvote",

  // ── Shared reply-count phrasing (thread card meta + reply sort bar) ─────
  "repliesCount_one": "{formatted} reply",
  "repliesCount_other": "{formatted} replies",

  // ── ReportReplyModal ────────────────────────────────────────────────────
  "reportReply.confirmTitle": "Thank you — <em>we're on it.</em>",
  "reportReply.confirmBody":
    "A moderator will take a look. Reports stay private, and {name} won't know it came from you.",
  "reportReply.done": "Done",
  "reportReply.title": "Report this reply",
  "reportReply.sub":
    "Let a moderator know what's wrong with {name}'s reply. This is private — no one is notified that you reported it.",
  "reportReply.reasonGroupAria": "Reason for reporting",
  "reportReply.cancel": "Cancel",
  "reportReply.sending": "Sending…",
  "reportReply.sendCta": "Send report",

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

  // ── ThreadPage ──────────────────────────────────────────────────────────
  "threadPage.breadcrumbForum": "Forum",
  "threadPage.replyPostedToast": "Reply posted",

  // ── ThreadReplies / ModeratorByline ─────────────────────────────────────
  "byline.withRole":
    "Written by <name>{name}</name>, {role} · on behalf of the team",
  "byline.noRole": "Written by <name>{name}</name> · on behalf of the team",
  "replies.emptyTitle": "No replies yet",
  "replies.emptyDescription":
    "This thread is waiting for its first voice. Be the first to reply — a thoughtful answer goes a long way.",
  "replies.emptyAction": "Write a reply",
  "replies.mostHelpfulBadge": "Most helpful",
  "replies.opBadge": "OP",
  "replies.unlikeAria": "Unlike this reply",
  "replies.likeAria": "Like this reply",

  // ── ForumAuthor ─────────────────────────────────────────────────────────
  "author.officialTitle": "Official QueerPulse account",
  "author.officialBadge": "Official",
  "author.aboutTeamAria": "About the QueerPulse team & governance",
  "author.viewProfileAria": "View {name}'s profile",
};

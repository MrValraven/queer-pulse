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
  // Names the three buttons as ONE control for a screen reader (DES-121).
  "replySort.groupAria": "Order the replies",

  // ── ForumPage hero ──────────────────────────────────────────────────────
  "hero.title": "The town <em>square</em>",
  "hero.lead":
    "The one community everyone here belongs to: questions, proposals, guides, and the slow work of building a movement. Take care of each other. Looking for something smaller?",
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
  "compose.publishing": "Publishing…",
  "compose.publishRetryCta": "Try publishing again",
  "compose.publishFailed":
    "We couldn't publish that. Your draft is still here, so you can try again.",
  "compose.officialFieldLabel": "Post as QueerPulse Official",
  "compose.officialFieldHint":
    "Publishes under the QueerPulse account instead of your name.",

  // ── ComposeThreadModal · tags field ─────────────────────────────────────
  "compose.tagsFieldLabel": "Tags",
  "compose.tagsPlaceholder": "Search tags",
  "compose.tagsSearchLabel": "Search tags",
  "compose.tagsHint":
    "Up to {max} tags, chosen from the list so people can find this later.",
  "compose.removeTagAria": "Remove tag {tag}",
  "compose.addTagAria": "Add tag {tag}",
  "compose.tagsNoMatch": "No tag matches “{query}”.",
  "compose.popularTagsLabel": "Popular",
  "compose.browseTags": "Browse all tags",
  "compose.hideTagList": "Hide the tag list",

  // ── Tag vocabulary categories (forumTags.data.ts) ───────────────────────
  "tagCategory.life": "Life & money",
  "tagCategory.health": "Health & care",
  "tagCategory.community": "Community",
  "tagCategory.culture": "Culture",
  "tagCategory.activism": "Activism & funding",
  "tagCategory.platform": "QueerPulse",

  // ── Forum search ────────────────────────────────────────────────────────
  "search.placeholder": "Search the forum…",
  "search.ariaLabel": "Search the forum",
  "search.clearAria": "Clear search",
  // PRD-164: the box now matches thread titles AND the text of any reply
  // inside them. The old hint sent members elsewhere for something it does
  // itself. It stays honest about the edges: this is the forum, not the
  // whole platform.
  "search.hint":
    "Searches thread titles and the replies inside them, so an answer buried in a comment still turns up. Forum only.",

  // ── ForumThreadList ─────────────────────────────────────────────────────
  // `top` ranks votes from the last 30 days now, so the label says so rather
  // than implying an all-time leaderboard.
  "threadList.top": "Top this month",
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
  "threadList.withdrawnBadge": "Withdrawn",
  "threadList.upvoteAria": "Upvote",
  "threadList.removeUpvoteAria": "Remove upvote",
  "threadList.loadingMore": "Loading…",
  "threadList.loadMoreCta": "Load more posts",
  // Unread replies since the member last opened the thread (PRD-170). The chip
  // is terse; the aria version says what the number means.
  "threadList.unreadBadge_one": "{formatted} new",
  "threadList.unreadBadge_other": "{formatted} new",
  "threadList.unreadAria_one": "{formatted} reply you haven't read yet",
  "threadList.unreadAria_other": "{formatted} replies you haven't read yet",
  // The server caps the count at 99, so 99 means "99 or more".
  "threadList.unreadCap": "99+",

  // ── Poll badge on a thread row (PRD-172) ─────────────────────────────────
  // The row says a poll is here and how many answers it offers. It never
  // carries a tally: the thread page may still be withholding that.
  "threadList.pollBadge_one": "Poll · {formatted} answer",
  "threadList.pollBadge_other": "Poll · {formatted} answers",

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
  "threadComposer.textareaAria": "Write a reply to this thread",
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
  // ENG-130. The reason is not ours to guess at, so we don't invent one.
  "threadOp.unavailable":
    "The opening post isn't available to you. The replies below are still here to read.",

  // ── Content warnings on a published post ─────────────────────────────────
  // The pill itself and its hide-again control are the composer preview's own
  // keys (`composePage.preview.*`), so the card a member arranged while
  // writing is the card the forum publishes. Only the reveal line is new.
  "contentWarning.reveal": "Show it anyway: {warnings}",

  // ── Poll on the opening post ─────────────────────────────────────────────
  "poll.voteCta": "Vote",
  "poll.changeVoteCta": "Change your answer",
  "poll.optionVotes_one": "{formatted} vote",
  "poll.optionVotes_other": "{formatted} votes",
  "poll.totalVotes_one": "{formatted} answer",
  "poll.totalVotes_other": "{formatted} answers",
  // Stands where a total would go while the server is withholding it. It must
  // never be swapped for a number: the count arrives as `null`, which is the
  // server declining to say, and "0 answers" would be a claim nobody made.
  "poll.resultsAfterVoting": "The answers show once you have voted.",
  "poll.closed": "Voting has closed",
  "poll.closesAt": "Voting closes {date}",
  "poll.voteFailed": "That answer did not go through. Try again in a moment.",
  "poll.voteFailedClosed": "Voting has closed here, so the answers are final.",

  // ── Quiet metadata on the opening post ───────────────────────────────────
  "opMeta.neighbourhood": "About {name}",
  "opMeta.language": "Written in {language}",
  // The three values below are interpolated into `opMeta.language`.
  "opMeta.languagePt": "Portuguese",
  "opMeta.languageEn": "English",
  "opMeta.languageBoth": "Portuguese and English",

  // ── Locked thread (moderator has closed replies) ────────────────────────
  "locked.title": "This thread is closed to new replies",
  "locked.body":
    "A moderator has closed this thread, so replies are paused. You can still read everything here.",
  "locked.reasonBody":
    "A moderator has closed this thread: {reason}. You can still read everything here.",
  "locked.replyBlockedToast": "This thread is closed to new replies.",

  // ── A thread its author closed to replies ────────────────────────────────
  // A moderator's lock and an author's own closing date are different facts,
  // so this banner carries no reprimand: nobody did anything wrong.
  "closed.title": "This thread has closed",
  "closed.body":
    "The author set a date for replies to stop. Everything above stays here to read.",
  "closed.bodyOn":
    "Replies stopped on {date}. Everything above stays here to read.",

  // ── A thread the forum cannot see yet (the author's own view) ────────────
  // An author can reach their own scheduled or under-review thread by link
  // while every member-facing read path hides it, so this says which of the
  // three states it is and when, and the silence reads as the plan.
  "unpublished.scheduledTitle": "Scheduled",
  "unpublished.scheduledBody":
    "This goes live {date}. Until then you are the only one who can open it.",
  "unpublished.scheduledBodyNoDate":
    "This is waiting for its publishing time. Until then you are the only one who can open it.",
  "unpublished.reviewTitle": "With the editors",
  "unpublished.reviewBody":
    "You sent this for review. It joins the forum once somebody approves it.",
  "unpublished.rejectedTitle": "Sent back to you",
  "unpublished.rejectedBody":
    "The editors sent this back. You can edit it and submit it again whenever you are ready.",

  // ── ThreadTopbar · moderator lock control ───────────────────────────────
  "topbar.lockThread": "Close thread",
  "topbar.unlockThread": "Reopen thread",

  // ── LockThreadModal (optional reason note when closing a thread) ────────
  "lockReason.title": "Close this thread",
  "lockReason.sub":
    "Members will still be able to read everything here. This only pauses new replies. Let them know why, if it's useful.",
  "lockReason.label": "Reason (optional)",
  "lockReason.placeholder": "e.g. resolved, off-topic, moved to a community",
  "lockReason.cancel": "Cancel",
  "lockReason.confirm": "Close thread",
  "lockReason.locking": "Closing…",

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
  "threadPage.replyForbiddenToast":
    "You can't reply here. The thread may have been closed, or it belongs to a community you haven't joined.",
  "threadPage.private.title": "This thread is inside a private community",
  "threadPage.private.description":
    "Only members of that community can read it. If it's somewhere you'd like to be, you can ask to join.",
  "threadPage.private.browseCta": "Browse communities",

  // ── ThreadReplies / ModeratorByline ─────────────────────────────────────
  "byline.withRole":
    "Written by <name>{name}</name>, {role} · on behalf of the team",
  "byline.noRole": "Written by <name>{name}</name> · on behalf of the team",
  // Only a moderator ever sees this: it sits beside the real author of a
  // thread the forum is reading without a name.
  "byline.postedAnonymously": "Posted anonymously",
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
  // The viewer's own byline on a post they just made, before the server's copy
  // arrives. Ownership is carried by an `isMine` flag, never by this string.
  "author.you": "You",

  // ── PostActionsMenu (⋯ overflow menu) ────────────────────────────────────
  "postMenu.edit": "Edit",
  "postMenu.moveCategory": "Move to another category",
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

  // ── Withdrawing a whole thread (PRD-160) ─────────────────────────────────
  "deleteThread.title": "Take this post down?",
  "deleteThread.body":
    "The whole thread goes: the title, your opening post and the link people follow to get here. Replies stay written where they are, and nobody reaches them from the forum any more. You can’t undo this yourself.",
  "deleteThread.confirm": "Take it down",
  "deleteThread.cancel": "Keep it up",
  "deleteThread.deleting": "Taking it down…",

  // ── Moving a thread to another category (PRD-163) ────────────────────────
  "moveCategory.title": "Move this post",
  "moveCategory.body":
    "People find the forum by category, so a post filed in the right place is a post that gets answered. Pick where it belongs.",
  "moveCategory.fieldLabel": "Category",
  "moveCategory.save": "Move it",
  "moveCategory.saving": "Moving…",
  "moveCategory.cancel": "Leave it here",
  "moveCategory.badgeAria": "Move this post out of {category}",

  // ── Edit history modal ────────────────────────────────────────────────────
  "history.title": "Edit history",
  "history.empty": "No earlier versions to show.",
  "history.titleChange": "Title was: {title}",
  "history.close": "Close",

  // ── Toasts (edit / delete / restore / lock / pin) ─────────────────────────
  "toast.editSaved": "Your edit is live.",
  "toast.deleted": "Post deleted.",
  "toast.threadDeleted": "That post is off the forum now.",
  "toast.categoryMoved": "Moved to {category}.",
  "toast.restored": "Post restored.",
  "toast.threadLocked": "Thread closed to new replies.",
  "toast.threadUnlocked": "Thread reopened.",
  "toast.threadPinned": "Thread pinned to the top of the forum.",
  "toast.threadUnpinned": "Thread unpinned.",
  "toast.threadMarkedOfficial": "Posted as QueerPulse Official.",
  "toast.threadUnmarkedOfficial": "Reverted to the original author.",
  "toast.pinCapReached":
    "Only 3 threads can be pinned at once. Unpin one first.",
  "toast.error": "Something went wrong. Try again in a moment.",

  // ── Following a thread (SOC-13) ───────────────────────────────────────────
  "follow.followCta": "Follow",
  "follow.unfollowCta": "Following",
  "follow.followedToast": "You'll hear about new replies here.",
  "follow.unfollowedToast": "You've stopped following this thread.",

  // ── Accepted answer (SOC-13) ──────────────────────────────────────────────
  "replies.acceptedBadge": "Accepted answer",
  "replies.markAnswer": "Mark as answer",
  "replies.unmarkAnswer": "Unmark answer",
  "replies.quote": "Quote",
  "answer.acceptedToast": "Marked as the answer.",
  "answer.clearedToast": "Answer mark removed.",

  // ── Tag editing (SOC-13) ──────────────────────────────────────────────────
  "tagsEdit.title": "Edit tags",
  "tagsEdit.body":
    "Tags are how people find this thread later. Pick up to five from the list.",
  "tagsEdit.editCta": "Edit tags",
  "tagsEdit.addCta": "Add tags",
  "tagsEdit.save": "Save tags",
  "tagsEdit.saving": "Saving…",
  "tagsEdit.cancel": "Cancel",
  "tagsEdit.savedToast": "Tags updated.",

  // ── Composer photo + autosave (SOC-13) ────────────────────────────────────
  "compose.imageAttachCta": "Add a photo",
  "compose.imageUploading": "Uploading…",
  "compose.imageRemoveAria": "Remove the attached photo",
  "compose.imageAttachThreadAria": "Add a photo to this post",
  "compose.imageAttachReplyAria": "Add a photo to this reply",
  "post.imageAlt": "Photo attached to this post",
  "draft.saving": "Saving…",
  "draft.saved": "Draft saved",
  "draft.restored": "Draft restored",
  "draft.threadKind": "POST",
  "draft.replyKind": "REPLY",
  // Row title for an autosaved inline nested reply, so the drafts list says
  // who the half-written answer was for (PRD-166).
  "draft.inlineReplyTitle": "Reply to {name}",
  // Row title for a saved post the member has not titled yet: they picked a
  // community or some tags before writing anything.
  "draft.untitledThreadTitle": "Unfinished post",

  // ── The forum's own sight of an unsent draft (PRD-165) ────────────────────
  "draftNotice.title": "Your unfinished post is still here",
  "draftNotice.resumeCta": "Resume",

  // ── Link unfurl card under a post (PRD-171) ───────────────────────────────
  "linkPreview.aria": "Link preview: {title}",
  "linkPreview.ariaGeneric": "Link preview from {site}",

  // ── Compose page (/forum/new) ─────────────────────────────────────────────
  // The full-page composer that replaces the compose modal. Copy only: every
  // canonical value (kind ids, category ids, warning ids, neighbourhood names)
  // stays English in both catalogs, because it is what the state, the draft
  // and the publish call carry. The groups below run top to bottom down the
  // page, then down the rail, then through the overlays.

  // ── The page header band ─────────────────────────────────────────────────
  // `head.title` carries an <em> on purpose: the display type asks for the
  // second word in italic coral, so the emphasis sits inside the translated
  // string and renders through <Translation> with a components map.
  "composePage.head.crumbForum": "Forum",
  "composePage.head.crumbCurrent": "New post",
  "composePage.head.title": "New <em>post</em>",
  "composePage.head.lead":
    "Take your time. Everything saves as you write, and nothing goes out until you say so.",

  // ── Kind of post ─────────────────────────────────────────────────────────
  // The chips at the top of the page. The scaffold is the outline dropped
  // into an empty body, so it carries real newlines and the same **bold**
  // headings the body renders.
  "composePage.kind.groupLabel": "What kind of post",
  "composePage.kind.question.name": "Question",
  "composePage.kind.question.titlePlaceholder":
    "What do you want to know? A question mark helps.",
  "composePage.kind.question.bodyPlaceholder":
    "Give the context: what you have tried, what you have been told, and what would actually help.",
  "composePage.kind.question.tip":
    "Questions with context get answered 3× faster.",
  "composePage.kind.question.scaffold":
    "**What I am trying to do**\n\n\n**What I have tried so far**\n\n\n**What would help**\n",
  "composePage.kind.guide.name": "Guide",
  "composePage.kind.guide.titlePlaceholder":
    "Name what it helps with, e.g. “Finding a GP in Lisbon: the honest guide”",
  "composePage.kind.guide.bodyPlaceholder":
    "Start with who this is for, then the steps. You can come back and update it as things change.",
  "composePage.kind.guide.tip":
    "Guides can be pinned and updated. Say the date things were true.",
  "composePage.kind.guide.scaffold":
    "**Who this is for**\n\n\n**Step by step**\n1. \n2. \n3. \n\n**What to watch out for**\n",
  "composePage.kind.proposal.name": "Proposal",
  "composePage.kind.proposal.titlePlaceholder":
    "Say the idea in one line, e.g. “Monthly queer film night at São Jorge”",
  "composePage.kind.proposal.bodyPlaceholder":
    "What is it, why now, and what you need from people to make it happen.",
  "composePage.kind.proposal.tip":
    "End with a clear ask. Upvotes tell you if people would come; replies tell you who will help.",
  "composePage.kind.proposal.scaffold":
    "**The idea**\n\n\n**Why now**\n\n\n**What I need**\n- \n\n**How to help**\n",
  "composePage.kind.share.name": "Share",
  "composePage.kind.share.titlePlaceholder": "What are you sharing?",
  "composePage.kind.share.bodyPlaceholder":
    "Tell people what it is and why it is worth their time.",
  "composePage.kind.share.tip":
    "A link, a photo, a thing you noticed. It all counts.",
  "composePage.kind.none.titlePlaceholder": "A clear, specific title",
  "composePage.kind.none.bodyPlaceholder":
    "Write your post. Say what happened, what you need, or what you know.",
  "composePage.kind.none.tip": "Pick one and the page adapts to it.",

  // ── Starter prompts (an empty composer) ──────────────────────────────────
  "composePage.prompts.asking": "People are asking about…",
  "composePage.prompts.noReplies": "no replies yet",
  "composePage.prompts.startFrom": "Or start from…",
  "composePage.prompts.starterGp": "I'm looking for a GP who…",
  "composePage.prompts.starterRecommendation": "Anyone know a good…",
  "composePage.prompts.starterNewInLisbon": "I just moved to Lisbon and…",
  "composePage.prompts.starterTried": "Has anyone tried…",
  "composePage.prompts.starterFlatmates": "Looking for flatmates in…",

  // ── Title field ──────────────────────────────────────────────────────────
  // `titleTip.*` is the live advice under the field.
  "composePage.title.ariaLabel": "Title",
  "composePage.titleTip.keepGoing": "Keep going. Specific titles get answered.",
  "composePage.titleTip.shouting":
    "All caps reads as shouting. Sentence case is fine.",
  "composePage.titleTip.questionMark":
    "End a question with a question mark, so people know you are asking.",
  "composePage.titleTip.sayTheSubject":
    "Say what it is about. People skim the list by title.",
  "composePage.titleTip.clear": "Clear and specific.",

  // ── Body toolbar and Write / Preview ─────────────────────────────────────
  // ⌘ is allowlisted typography (docs/STYLE-RULES.md), so the two shortcut
  // hints stay inside the label.
  "composePage.toolbar.label": "Formatting",
  "composePage.toolbar.bold": "Bold (⌘B)",
  "composePage.toolbar.italic": "Italic (⌘I)",
  "composePage.toolbar.heading": "Heading",
  "composePage.toolbar.bulletList": "Bulleted list",
  "composePage.toolbar.numberedList": "Numbered list",
  "composePage.toolbar.quote": "Quote",
  "composePage.toolbar.link": "Link",
  "composePage.mode.groupLabel": "Write or preview",
  "composePage.mode.write": "Write",
  "composePage.mode.preview": "Preview",

  // ── Body field ───────────────────────────────────────────────────────────
  // The three `placeholder*` values are the words a toolbar command drops in
  // when nothing is selected, so they are lowercase mid-sentence fragments
  // apart from the heading, which starts a line.
  "composePage.body.ariaLabel": "Post",
  "composePage.body.previewEmpty": "Nothing to preview yet.",
  "composePage.body.scaffold": "Start from an outline",
  "composePage.body.markdownHint":
    "Markdown-lite: **bold**, *italic*, - lists, > quotes. Links unfurl.",
  "composePage.body.wordCount_one": "{count} word",
  "composePage.body.wordCount_other": "{count} words",
  "composePage.body.placeholderText": "text",
  "composePage.body.placeholderHeading": "Heading",
  "composePage.body.placeholderLinkText": "link text",

  // ── Photos ───────────────────────────────────────────────────────────────
  // `{position}` is 1-based and `{total}` is how many photos are staged.
  "composePage.photo.limitReached": "Up to four photos per post.",
  "composePage.photo.gridLabel": "Photos on this post",
  "composePage.photo.altNeeded": "Needs alt",
  "composePage.photo.altDone": "Alt added",
  "composePage.photo.altLabel": "Description for photo {position} of {total}",
  "composePage.photo.altPlaceholder":
    "Describe this photo for people who cannot see it",
  "composePage.photo.moveEarlier": "Move photo {position} earlier",
  "composePage.photo.moveLater": "Move photo {position} later",
  "composePage.photo.remove": "Remove photo {position}",
  "composePage.photo.attach": "Add a photo",
  "composePage.photo.inputLabel": "Choose photos",
  "composePage.photo.uploading": "Adding your photo…",

  // ── Advisory rows under the body ─────────────────────────────────────────
  "composePage.nudge.contact.title": "That looks like a phone number or email.",
  "composePage.nudge.contact.body":
    "Every member can read this thread. Consider asking people to message you directly instead.",
  "composePage.nudge.crisis.title": "If you need help right now,",
  "composePage.nudge.crisis.body": "the forum is slow. These answer today.",
  "composePage.nudge.crisis.sosVozAmiga": "SOS Voz Amiga",
  "composePage.nudge.crisis.ilgaPortugal": "ILGA Portugal",
  "composePage.nudge.crisis.emergencies": "Emergencies",
  "composePage.nudge.privateCommunity.title": "Posting inside {community}.",
  "composePage.nudge.privateCommunity.body":
    "Only its members can read or find this thread. It stays out of the town square.",
  "composePage.nudge.privateCommunity.bodyCrossPosted":
    "Its members read it here, and a copy shows in the town square for everyone.",
  "composePage.nudge.missingAlt.title": "A photo has no description.",
  "composePage.nudge.missingAlt.body":
    "Screen-reader users and people on a slow connection get only the text. One line each is enough.",
  "composePage.nudge.longGuide.title": "Long guide, no headings.",
  "composePage.nudge.longGuide.body":
    "At {count} words, a few **Headings** make it skimmable. The H button adds one.",
  "composePage.nudge.doxxing.title": "Naming where someone lives?",
  "composePage.nudge.doxxing.body":
    "An address plus a name is doxxing, even when the person deserves the warning. Describe the situation and let moderators hold the details.",
  "composePage.nudge.doxxing.acknowledge":
    "I have checked this is my own address, or a public venue",
  "composePage.nudge.listLabel": "Before you publish",
  "composePage.nudge.dismiss": "Hide this note",
  "composePage.nudge.crisis.callAria": "Call {service} on {number}",

  // ── The blocks row, and the content warnings it opens ────────────────────
  // `block.contentWarning` is also the panel's own heading, so the pill and
  // the panel it opens say the same words.
  "composePage.block.contentWarning": "Content warning",
  "composePage.block.poll": "Add a poll",
  "composePage.warning.medical": "Medical detail",
  "composePage.warning.violence": "Violence",
  "composePage.warning.substances": "Substances",
  "composePage.warning.family": "Family rejection",
  "composePage.warning.sexual": "Sexual content",
  "composePage.warning.selfHarm": "Suicide or self-harm",
  "composePage.warning.housingLoss": "Housing loss",
  "composePage.warning.police": "Police",
  "composePage.warning.hint":
    "The card carries a CW pill, and the excerpt stays hidden until someone chooses to read it.",

  // ── Poll ─────────────────────────────────────────────────────────────────
  // `poll.closes.*` is built as t(`…poll.closes.${value}`) over `PollCloses`,
  // so all four suffixes have to exist.
  "composePage.poll.title": "Poll",
  "composePage.poll.hint":
    "{min} to {max} options. Results show once you have voted.",
  "composePage.poll.optionLabel": "Option {number}",
  "composePage.poll.removeOption": "Remove option {number}",
  "composePage.poll.addOption": "Add option",
  "composePage.poll.maxReached": "{max} options is the limit.",
  "composePage.poll.allowMultiple": "Allow more than one choice",
  "composePage.poll.closesLabel": "Closes",
  "composePage.poll.closes.never": "Never",
  "composePage.poll.closes.3d": "3 days",
  "composePage.poll.closes.1w": "1 week",
  "composePage.poll.closes.2w": "2 weeks",

  // ── Where does it go? (the category grid) ────────────────────────────────
  // One line under each category name.
  "composePage.section.category.title": "Where does it go?",
  "composePage.section.category.hint": "People find the forum by category.",
  "composePage.category.general.description": "Anything that fits nowhere else",
  "composePage.category.housing.description": "Flats, rooms, landlords, scams",
  "composePage.category.health.description":
    "GPs, clinics, therapy, mental health",
  "composePage.category.arts.description": "Film, music, exhibitions, making",
  "composePage.category.activism.description":
    "Ideas, campaigns, the community fund",
  "composePage.category.guides.description": "How-tos and living indexes",
  "composePage.category.jobs.description": "Openings, skills, trades",
  "composePage.category.trans.description": "Healthcare, legal, community",
  "composePage.category.fallbackDescription": "A place for posts on this topic",
  "composePage.category.suggestion": "Sounds like {category}",
  "composePage.category.recentIn": "Recently in {category}",

  // ── Who sees it? (the audience list) ─────────────────────────────────────
  "composePage.section.audience.title": "Who sees it?",
  "composePage.section.audience.hint": "Everyone, or one of your communities.",
  "composePage.audience.townSquare": "The town square",
  "composePage.audience.townSquareSub": "Every member sees it in the forum.",
  "composePage.audience.private": "Private",
  "composePage.audience.privateSub": "Only its members can read or find this.",
  "composePage.audience.openSub": "Any member can read it here.",
  "composePage.audience.memberCount_one": "{count} member",
  "composePage.audience.memberCount_other": "{count} members",
  "composePage.audience.crossPost": "Also show in the town square",
  "composePage.audience.crossPostHint":
    "Members outside the community see it in the forum, and the community keeps its own copy.",

  // ── Details ──────────────────────────────────────────────────────────────
  // `details.language.*` is built as t(`…details.language.${choice}`) over the
  // three offered choices and over the detected one, and `closeAfter.*` as
  // t(`…closeAfter.${choice}`) over `CloseAfter`, so every suffix has to exist.
  // `section.optional` is shared by the Details and Tags heads. Every
  // neighbourhood other than this one is a proper noun and stays a value.
  "composePage.section.details.title": "Details",
  "composePage.section.details.hint":
    "Only what applies to this post appears here.",
  "composePage.section.optional": "optional",
  "composePage.details.language": "Language",
  "composePage.details.language.pt": "Portuguese",
  "composePage.details.language.en": "English",
  "composePage.details.language.both": "PT + EN",
  "composePage.details.languageDetected": "This reads as {language}.",
  "composePage.details.neighbourhood": "Neighbourhood",
  "composePage.details.neighbourhoodHint":
    "Puts it on the map and in local filters.",
  "composePage.details.closeAfter": "Close automatically",
  "composePage.details.closeAfterHint":
    "A time-bound post closes itself, and you get a nudge to renew it.",
  "composePage.closeAfter.never": "Never",
  "composePage.closeAfter.2w": "2 weeks",
  "composePage.closeAfter.30d": "30 days",
  "composePage.closeAfter.90d": "90 days",
  "composePage.closeAfter.poll": "When the poll closes",
  "composePage.neighbourhood.other": "Other",

  // ── Tags ─────────────────────────────────────────────────────────────────
  "composePage.section.tags.title": "Tags",
  "composePage.section.tags.hint": "How people find this later.",
  "composePage.tags.counter": "{count}/{max}",
  "composePage.tags.placeholder": "Add a tag and press Enter",
  "composePage.tags.inputLabel": "Tags",
  "composePage.tags.inputHint": "Up to {max} tags. Press Enter to add one.",
  "composePage.tags.full": "That is all {max} tags.",
  "composePage.tags.suggestLabel": "Suggested",

  // ── The rail shell ───────────────────────────────────────────────────────
  "composePage.rail.label": "Preview and checks",
  "composePage.rail.lead":
    "See how it will look, whether it has been asked already, and what is still missing.",
  "composePage.rail.tabsLabel": "Which panel to show",
  "composePage.rail.tabPreview": "Preview",
  "composePage.rail.tabSimilar": "Similar",
  "composePage.rail.tabChecklist": "Ready",
  "composePage.rail.note":
    "Be kind, be useful. You can edit a post after publishing, and you can take your own thread down.",
  "composePage.rail.houseRules": "House rules",

  // ── Posting as ───────────────────────────────────────────────────────────
  // `{categories}` arrives already joined by `Intl.ListFormat`.
  "composePage.postingAs.heading": "Posting as",
  "composePage.postingAs.officialSwitch": "Post as QueerPulse Official",
  "composePage.postingAs.officialSub":
    "On behalf of the team, by {name}. The byline says so.",
  "composePage.postingAs.anonymousSub":
    "Your name is hidden. Moderators can still see it is you.",
  "composePage.postingAs.yourNameSub": "Your name, linked to your profile",
  "composePage.postingAs.anonymousLabel": "Post without my name",
  "composePage.postingAs.anonymousHint":
    "Moderators still see who wrote it, so the thread stays safe to moderate.",
  "composePage.postingAs.anonymousElsewhere":
    "Offered in {categories}, where a name can cost someone their home or their care.",
  "composePage.postingAs.anonymousBlockedByOfficial":
    "Turn the QueerPulse Official byline off to post without your name.",
  "composePage.postingAs.coAuthorLabel": "Write it with someone",
  "composePage.postingAs.coAuthorHint":
    "They can edit the draft and appear on the byline.",
  "composePage.postingAs.coAuthorEmpty":
    "Nobody to add yet. Co-authors come from the members you already write with.",

  // ── The preview card ─────────────────────────────────────────────────────
  "composePage.preview.heading": "How it will look",
  "composePage.preview.titlePlaceholder": "Your title shows here",
  "composePage.preview.excerptPlaceholder":
    "The first lines of your post become the excerpt people read in the list.",
  "composePage.preview.contentWarningPill": "Warning · {warnings}",
  "composePage.preview.showAnyway": "Show anyway",
  "composePage.preview.hideAgain": "Hide again",
  "composePage.preview.officialName": "QueerPulse Official",
  "composePage.preview.officialVia": "via {name}",
  "composePage.preview.anonymousName": "A member",
  "composePage.preview.withCoAuthor": "with {name}",
  "composePage.preview.pollPickOne": "Pick one",
  "composePage.preview.pollPickMany": "Pick as many as apply",
  "composePage.preview.pollNoVotes": "No votes yet",
  "composePage.preview.seenByEveryone": "Seen by everyone in the town square",
  "composePage.preview.seenByCommunity": "Seen by the members of {community}",
  "composePage.preview.seenByCommunityMembers_one":
    "Seen by {formatted} member of {community}",
  "composePage.preview.seenByCommunityMembers_other":
    "Seen by {formatted} members of {community}",
  "composePage.preview.seenByEveryoneAndCommunity":
    "Seen by everyone, and pinned in {community}",
  "composePage.preview.linkUnfurlPlaceholder":
    "The link preview appears here once you publish.",

  // ── Already discussed? ───────────────────────────────────────────────────
  // `replyInsteadContext` is appended visually hidden after the button's own
  // text, so the accessible name reads "Reply there instead: <title>".
  "composePage.similar.heading": "Already discussed?",
  "composePage.similar.count_one": "{formatted} found",
  "composePage.similar.count_other": "{formatted} found",
  "composePage.similar.prompt":
    "As you write a title, threads already covering it show up here, so you can join one instead of starting over.",
  "composePage.similar.empty": "Nothing similar yet. Looks like you are first.",
  "composePage.similar.why":
    "If one of these is your question, replying there gets you an answer faster and keeps the forum tidy.",
  "composePage.similar.duplicateFlag": "The same question",
  "composePage.similar.replyInstead": "Reply there instead",
  "composePage.similar.replyInsteadContext": ": {title}",
  "composePage.similar.announce_one": "{formatted} thread already covers this",
  "composePage.similar.announce_other":
    "{formatted} threads already cover this",

  // ── Ready to post (the checklist) ────────────────────────────────────────
  // `stateDone` / `stateToDo` are visually hidden per row, and `progress` /
  // `allRequiredDone` is the one polite live line for the whole block.
  "composePage.checklist.title": "A clear title",
  "composePage.checklist.body": "Enough context to answer",
  "composePage.checklist.bodyHint_one": "{count} more character",
  "composePage.checklist.bodyHint_other": "{count} more characters",
  "composePage.checklist.category": "A category",
  "composePage.checklist.kind": "Kind of post",
  "composePage.checklist.tag": "A tag or two",
  "composePage.checklist.heading": "Ready to post",
  "composePage.checklist.stateDone": "done",
  "composePage.checklist.stateToDo": "still to do",
  "composePage.checklist.progress": "{done} of {total} required steps done",
  "composePage.checklist.allRequiredDone": "Everything required is done.",

  // ── The footer, and what stops a publish ─────────────────────────────────
  "composePage.foot.ready": "Ready to publish",
  "composePage.foot.notReady":
    "Add a title, enough context and a category to publish.",
  "composePage.foot.shortcutHint": "to publish",
  "composePage.foot.statusLabel": "Draft status",
  "composePage.blocker.duplicateTitle":
    "Looks like a duplicate. Reply there, or change the title.",
  "composePage.blocker.unacknowledgedDoxxing":
    "Confirm the address check above to publish.",
  "composePage.blocker.pollNeedsTwoOptions":
    "A poll needs at least two options.",
  "composePage.blocker.tooManyPhotos":
    "Four photos is the limit. Remove one to publish.",

  // ── The publish menu ─────────────────────────────────────────────────────
  // Built as t(`…publishMenu.${mode}.label`) over `PublishMode`, so all three
  // modes need both halves.
  "composePage.publishMenu.triggerAria": "More ways to publish",
  "composePage.publishMenu.now.label": "Publish now",
  "composePage.publishMenu.now.sub":
    "Live straight away. Thirty seconds to undo.",
  "composePage.publishMenu.schedule.label": "Schedule…",
  "composePage.publishMenu.schedule.sub":
    "Pick a day and a time. Good for announcements.",
  "composePage.publishMenu.review.label": "Ask a moderator to read it first",
  "composePage.publishMenu.review.sub":
    "For guides and tender subjects. Usually within a day.",

  // ── Shared by the overlays ───────────────────────────────────────────────
  "composePage.overlay.back": "Back",
  "composePage.overlay.close": "Close",

  // ── Keep this as a draft? ────────────────────────────────────────────────
  // `confirmClose.body` carries a <b> run and renders through <Translation>.
  "composePage.confirmClose.title": "Keep this as a draft?",
  "composePage.confirmClose.body":
    "We hold <b>{summary}</b> exactly as it is. It will be here next time you open New post, on any device.",
  "composePage.confirmClose.bodyUntitled":
    "We hold what you have written exactly as it is. It will be here next time you open New post, on any device.",
  "composePage.confirmClose.discard": "Discard",
  "composePage.confirmClose.keepWriting": "Keep writing",
  "composePage.confirmClose.keepDraft": "Keep draft",

  // ── The first-post read-through ──────────────────────────────────────────
  "composePage.firstPost.title": "Your first post. <em>Quick look?</em>",
  "composePage.firstPost.sub":
    "Just this once, so you know exactly what goes out and who sees it.",
  "composePage.firstPost.rowTitle": "Title",
  "composePage.firstPost.rowCategory": "Category",
  "composePage.firstPost.rowAudience": "Who sees it",
  "composePage.firstPost.rowPostingAs": "Posting as",
  "composePage.firstPost.rowWarnings": "Content warnings",
  "composePage.firstPost.rowPhotos": "Photos",
  "composePage.firstPost.photoCount_one": "{count} photo",
  "composePage.firstPost.photoCount_other": "{count} photos",
  "composePage.firstPost.skip": "Don't show this again",
  "composePage.firstPost.confirm": "Looks right, publish",

  // ── Schedule ─────────────────────────────────────────────────────────────
  "composePage.schedule.title": "Schedule this post",
  "composePage.schedule.sub":
    "It publishes itself at the time you pick, under the same name and the same audience. Until then it lives in your drafts.",
  "composePage.schedule.fieldLabel": "Day and time",
  "composePage.schedule.helper": "Times are shown in your own time zone.",
  "composePage.schedule.errorMissing": "Pick a day and a time first.",
  "composePage.schedule.errorPast": "Pick a moment that is still to come.",
  "composePage.schedule.errorTooFar":
    "Scheduling reaches one year ahead. Pick a nearer day.",
  "composePage.schedule.confirm": "Schedule",

  // ── Reply there instead? ─────────────────────────────────────────────────
  "composePage.replyInstead.title": "Reply there <em>instead?</em>",
  "composePage.replyInstead.body":
    "Your text moves into <b>{title}</b> as a reply. Everyone already following that thread hears about it, which is usually the fastest route to an answer.",
  "composePage.replyInstead.previewLabel": "Your reply",
  "composePage.replyInstead.emptyPreview": "Nothing written yet.",
  "composePage.replyInstead.keep": "Keep my own post",
  "composePage.replyInstead.move": "Move it as a reply",

  // ── Keyboard shortcuts ───────────────────────────────────────────────────
  "composePage.shortcuts.title": "Keyboard shortcuts",
  "composePage.shortcuts.publish": "Publish",
  "composePage.shortcuts.close": "Close. Your draft is kept.",
  "composePage.shortcuts.format": "Bold or italic",
  "composePage.shortcuts.mention": "Mention a member, or add a tag inline",
  "composePage.shortcuts.move": "Move between categories and audiences",
  "composePage.shortcuts.nextField": "Next field. Focus stays inside the page.",
  "composePage.shortcuts.thisList": "This list",

  // ── Published ────────────────────────────────────────────────────────────
  // The three `*Title` keys carry the coral <em> run.
  "composePage.success.townSquare": "the town square",
  "composePage.success.nowTitle": "Posted to <em>{audience}</em>",
  "composePage.success.nowBody":
    "Your thread is at the top of the forum. Members can reply, upvote, and help. You have thirty seconds to take it back.",
  "composePage.success.nowBodyPermanent":
    "Members have been notified. From here on, edit it or take it down from the thread itself.",
  "composePage.success.unpublish": "Unpublish",
  "composePage.success.scheduledTitle": "Scheduled for <em>{when}</em>",
  "composePage.success.scheduledBody":
    "It sits in your drafts until then. You can edit it or cancel it there.",
  "composePage.success.reviewTitle": "Sent to <em>the moderators</em>",
  "composePage.success.reviewBody":
    "Someone on the team reads it within a day, usually sooner. You hear back either way, and it stays in your drafts until then.",
  "composePage.success.shareLabel": "Share this post",
  "composePage.success.copyLink": "Copy link",
  "composePage.success.linkCopiedToast": "Link copied.",
  "composePage.success.linkCopyFailedToast":
    "Copying did not work. Select the link and copy it by hand.",
  "composePage.success.whatsApp": "WhatsApp",
  "composePage.success.opensInNewTab": "(opens in a new tab)",
  "composePage.success.pinToProfile": "Pin to my profile",
  "composePage.success.postToCommunity": "Also post to a community",
  "composePage.success.followReplies": "Tell me when someone replies",
  "composePage.success.viewPost": "View post",
};

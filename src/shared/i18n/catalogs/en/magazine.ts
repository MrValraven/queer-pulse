import type { Catalog } from "../../types";

/**
 * Magazine — chrome-only catalog. Article bodies, headlines, standfirsts,
 * pull-quotes, author bios and bylines are editorial content: in live mode
 * they arrive from the API as a writer's own authored text, so they are
 * deliberately left as bare English literals in the data files and are NOT
 * routed through this catalog. Only platform-authored chrome (nav, section
 * headings, CTAs, form/editor UI, status vocabulary, empty/error states)
 * lives here. See `.superpowers/sdd/sweep-magazine-report.md` for the full
 * content-vs-chrome judgement log.
 */
export const magazine: Catalog = {
  // ── Shared format composers (magazineFormat.ts) ─────────────────────────
  "format.minRead": "{count} min read",
  "format.minReadApprox": "~ {count} min read",
  "format.words_one": "{count} word",
  "format.words_other": "{count} words",
  "format.readsThisWeek": "{reads} reads this week",
  "format.published": "Published {date}",
  "format.issueArticles_one": "Issue {issue} · {count} article",
  "format.issueArticles_other": "Issue {issue} · {count} articles",
  "format.issueLabel": "Issue {number}",
  "format.min": "{count} min",

  // ── MagazineMasthead ─────────────────────────────────────────────────────
  "masthead.sectionsAriaLabel": "Magazine sections",
  "masthead.tagline": "Published the first of every month",
  "masthead.nav.current": "Current issue",
  "masthead.nav.issues": "Issues",
  "masthead.nav.covers": "Covers",
  "masthead.nav.longreads": "Long reads",
  "masthead.nav.stories": "Stories",
  "masthead.nav.newsletter": "Newsletter",
  "masthead.nav.write": "Write for us",

  // ── MagazinePage ─────────────────────────────────────────────────────────
  "landing.meta.title": "The Magazine — QueerPulse",
  "landing.meta.description":
    "Essays, features, interviews and criticism from queer Lisbon — the QueerPulse magazine.",
  "landing.inIssueAriaLabel": "In this issue",
  "landing.inIssueLabel": "In this issue",
  "landing.nav.features": "Features",
  "landing.nav.essays": "Essays",
  "landing.nav.interviews": "Interviews",
  "landing.nav.reviews": "Reviews",
  "landing.nav.communityLife": "Community Life",
  "landing.nav.letters": "Letters",
  "landing.nav.archive": "Archive",
  "landing.subpageIndexTitle": "More from the Magazine",
  "landing.subpages.covers.label": "Cover gallery",
  "landing.subpages.covers.blurb": "Every cover we've published, in one place.",
  "landing.subpages.longreads.label": "Long reads",
  "landing.subpages.longreads.blurb":
    "Our longest, deepest reporting and essays.",
  "landing.subpages.newsletter.label": "Newsletter",
  "landing.subpages.newsletter.blurb":
    "Past editions of the QueerPulse newsletter.",

  // ── MagazineCover ────────────────────────────────────────────────────────
  "cover.coverAlt": "Cover portrait",
  "cover.coverPlaceholder": "Cover portrait — full bleed, dramatic lighting",
  "cover.coverImageLabel": "Cover · June 2026",
  "cover.kicker": "Cover story · Feature",
  "cover.photographyBy": "Photography by",
  "cover.readFullFeatureCta": "Read the full feature",

  // ── MagazineSections ─────────────────────────────────────────────────────
  "sections.features.title": "This month's <em>features</em>",
  "sections.features.allCta": "All this month's features →",
  "sections.essayOfMonthKicker": "Essay of the month",
  "sections.readEssayCta": "Read the essay",
  "sections.essays.title": "<em>Essays</em>",
  "sections.essays.allCta": "All essays →",
  "sections.interviews.title": "<em>Interviews</em>",
  "sections.interviews.allCta": "All interviews →",
  "sections.reviews.title": "<em>Reviews</em>",
  "sections.reviews.allCta": "All reviews →",
  "sections.communityLife.title": "Community <em>life</em>",
  "sections.communityLife.allCta": "All community life →",
  "sections.letters.title": "Letters to the <em>editors</em>",
  "sections.archive.title": "Past <em>issues</em>",
  "sections.archive.allCta": "All past issues →",
  "sections.submit.title": "Write for <em>the magazine.</em>",
  "sections.submit.body":
    "We publish essays, features, reviews, interviews, and criticism from community members. No formal credentials required — just something worth saying.",
  "sections.submit.cta": "Pitch us",
  "sections.verdict.essential": "Essential",
  "sections.verdict.recommended": "Recommended",

  // ── ArticlePage ──────────────────────────────────────────────────────────
  "article.notFoundMetaTitle": "Article not found — QueerPulse Magazine",
  "article.notFoundTitle": "We couldn't find that piece.",
  "article.notFoundBody":
    "The article may have moved, or the link may be incomplete.",
  "article.notFoundCta": "Back to the magazine",
  "article.pageTitleSuffix": " — QueerPulse Magazine",
  "article.backToMagazine": "← Magazine",
  "article.relatedHeading": "Keep <em>reading</em>",

  // ── relationReason() (data/articles.tsx) ────────────────────────────────
  "relation.sameAuthor": "Same author",
  "relation.sameTag": "Same tag: {tag}",
  "relation.sameSection": "Same section: {section}",
  "relation.editorsPick": "Editor's pick",

  // ── ArticleToolbar ───────────────────────────────────────────────────────
  "toolbar.ariaLabel": "Reading tools",
  "toolbar.textSizeGroupAriaLabel": "Adjust text size",
  "toolbar.decreaseTextSizeAriaLabel": "Decrease text size",
  "toolbar.increaseTextSizeAriaLabel": "Increase text size",
  "toolbar.removeFromReadingListAriaLabel": "Remove from reading list",
  "toolbar.saveToReadingListAriaLabel": "Save to reading list",
  "toolbar.savedCta": "Saved",
  "toolbar.saveCta": "Save",
  "toolbar.copyLinkAriaLabel": "Copy a link to this article",
  "toolbar.shareCta": "Share",
  "toolbar.savedHint": "In your list",
  "toolbar.savedToast": "Saved to your reading list",
  "toolbar.removedToast": "Removed from your reading list",
  "toolbar.linkCopiedToast": "Link copied to clipboard",
  "toolbar.linkCopyErrorToast": "Could not copy the link",
  "toolbar.fallbackTitle": "This article",

  // ── Issue chrome — shared by IssueCover, IssueContents, IssuesPage ────────
  "issue.backToAllIssues": "← All issues",
  "issue.currentPill": "Current",
  "issue.badge": "Issue <em>{number}</em>",
  "issue.stats.featuresCount_one": "{count} feature",
  "issue.stats.featuresCount_other": "{count} features",
  "issue.stats.pagesCount_one": "{count} page",
  "issue.stats.pagesCount_other": "{count} pages",
  "issue.stats.contributorsCount_one": "{count} contributor",
  "issue.stats.contributorsCount_other": "{count} contributors",
  "issue.stats.longReadCount_one": "{count} long-read",
  "issue.stats.longReadCount_other": "{count} long-reads",
  "issue.stats.publishedPrefix": "Published",
  "issue.coverAlt": "Issue {number} cover",
  "issue.letterEyebrow": "Editor's letter",
  "issue.readCta": "Read issue {number} →",
  "issue.orderPrintCta": "Order print · {price}",

  // ── IssueContents ────────────────────────────────────────────────────────
  "contents.heading.coverStory": "Cover story",
  "contents.heading.features": "Features",
  "contents.heading.profiles": "Profiles",
  "contents.tocHeading": "Table of <em>contents</em>",
  "contents.pageLabel": "page",
  "contents.contributorsHeading": "This issue's <em>contributors</em>",
  "contents.contributorsSubtitle_one":
    "{count} community member made Issue {issue}. Writers, an illustrator, and the editors who held it together.",
  "contents.contributorsSubtitle_other":
    "{count} community members made Issue {issue}. Writers, an illustrator, and the editors who held it together.",
  "contents.print.eyebrow": "Print edition",
  "contents.print.heading": "Hold it <em>in your hands.</em>",
  "contents.print.body":
    "Issue {issue} is available as a <b>limited print run</b> — {pages} pages, risograph cover, printed in Marvila. Members get it at cost; proceeds fund the next issue's contributors.",
  "contents.print.orderCta": "Order the print edition — {price}",
  "contents.print.readOnlineCta": "Read online free",
  "contents.print.imageAlt": "Print edition mockup · Issue {issue}",

  // ── IssuesPage ───────────────────────────────────────────────────────────
  "issues.eyebrow": "Magazine · all editions",
  "issues.heroTitle": "Nine issues, <em>quarterly</em>, since 2024.",
  "issues.heroDek":
    "A magazine that takes its time. Risograph print, free in PDF, paid in paper. Each issue circles a single question — health, work, the city, what we owe each other. Sustainer members get them in the mail.",
  "issues.stats.issuesPublished_one": "{count} issue published",
  "issues.stats.issuesPublished_other": "{count} issues published",
  "issues.stats.articlesArchived_one": "{count} article archived",
  "issues.stats.articlesArchived_other": "{count} articles archived",
  "issues.stats.contributorsAllTime_one": "{count} contributor all-time",
  "issues.stats.contributorsAllTime_other": "{count} contributors all-time",
  "issues.stats.languagesTranslated_one": "{count} language translated",
  "issues.stats.languagesTranslated_other": "{count} languages translated",
  "issues.current.eyebrow": "Current issue · published {date}",
  "issues.current.coverPlaceholder": "Issue {number} cover",
  "issues.archiveHeading": "The full <em>archive</em>",
  "issues.viewCoversCta": "Covers",
  "issues.viewListCta": "List",

  // ── AuthorPage ───────────────────────────────────────────────────────────
  "author.notFoundTitle": "We couldn't find that writer.",
  "author.notFoundBody":
    "They may have moved on, or the link may be incomplete.",
  "author.notFoundCta": "Back to the magazine",

  // ── AuthorHeader ─────────────────────────────────────────────────────────
  "author.followingToast": "Following {name}",
  "author.unfollowedToast": "Unfollowed {name}",
  "author.followingCta": "Following",
  "author.followWriterCta": "Follow writer",
  "author.portraitAlt": "Portrait of {slug}",
  "author.portraitPlaceholder": "Portrait",

  // ── AuthorWork ───────────────────────────────────────────────────────────
  "author.work.mostRecentHeading": "Most recent · <em>featured</em>",
  "author.work.featuredImageAlt": "Hero image for {name}'s featured story",
  "author.work.featuredImagePlaceholder": "Featured story",
  "author.work.selectedWorkHeading": "Selected work",
  "author.work.allArticlesCta_one": "All {count} article →",
  "author.work.allArticlesCta_other": "All {count} articles →",
  "author.work.seeAllPicksCta": "See all picks →",
  "author.work.findElsewhereHeading": "Find {name} <em>elsewhere</em>",

  // ── AudioPlayerPage tabs ─────────────────────────────────────────────────
  "audio.tabs.showNotes": "Show notes",
  "audio.tabs.chapters": "Chapters · {count}",
  "audio.tabs.transcript": "Transcript",

  // ── AudioPlayerControls ──────────────────────────────────────────────────
  "audio.controls.previousChapter": "Previous chapter",
  "audio.controls.back15s": "-15s",
  "audio.controls.pause": "Pause",
  "audio.controls.play": "Play",
  "audio.controls.forward30s": "+30s",
  "audio.controls.nextChapter": "Next chapter",
  "audio.controls.saveCta": "Save",
  "audio.controls.likeCta": "Like",
  "audio.controls.sleepCta": "Sleep",
  "audio.controls.cancelSleepTimer": "Cancel sleep timer",

  // ── AudioPlayerMain ──────────────────────────────────────────────────────
  "audio.linkCopiedToast": "Link copied",
  "audio.backToShow": "← Back to show",
  "audio.shareTitle": "Share",
  "audio.castTitle": "Cast / AirPlay",
  "audio.seekAriaLabel": "Seek",

  // ── AudioPlayerModals ────────────────────────────────────────────────────
  "audio.modal.closeAriaLabel": "Close",
  "audio.cast.connectedToast": "Connected to {name}",
  "audio.cast.streamingTitle": "Streaming to <em>{name}</em>",
  "audio.cast.playingOnDevice": "{kind} · audio is now playing on this device.",
  "audio.cast.chooseAnotherCta": "Choose another",
  "audio.cast.doneCta": "Done",
  "audio.cast.eyebrow": "Cast · AirPlay",
  "audio.cast.nearbyDevicesTitle": "Nearby devices",
  "audio.cast.pickDeviceSub":
    "Pick a speaker or screen to stream this episode to.",
  "audio.sleep.eyebrow": "Sleep timer",
  "audio.sleep.title": "Stop playing after…",
  "audio.sleep.sub":
    "Playback fades out and pauses when the timer reaches zero.",
  "audio.sleep.minutesLabel": "minutes",
  "audio.sleep.turnOffCta": "Turn off timer",
  "audio.transcriptModal.eyebrow": "Transcript · Episode {number}",
  "audio.transcriptModal.title": "Preview & download",
  "audio.transcriptModal.sub":
    "Full transcript with speaker labels and timestamps.",
  "audio.transcriptModal.downloadCta": "Download .txt",
  "audio.transcriptModal.closeCta": "Close",

  // ── AudioPlayerTabs ──────────────────────────────────────────────────────
  "audio.tabs.searchPlaceholder": "Search transcript",
  "audio.tabs.autoScroll": "Auto-scroll",
  "audio.tabs.autoScrollOn": "Auto-scroll · on",
  "audio.tabs.downloadCta": "Download",
  "audio.tabs.nowPlaying": "Now",

  // ══════════════════ Editor dashboard (staff-only) ════════════════════════
  // Piece/pitch RECORDS (titles, notes, activity feed, section names) are
  // left as English mock data — editorial-database content, not chrome.
  // Only the platform-authored dashboard UI is translated below.

  // ── Stage vocabulary — label-key indirection (Stage stays the stored id) ──
  "editor.stage.commissioned": "Commissioned",
  "editor.stage.drafting": "Drafting",
  "editor.stage.inReview": "In review",
  "editor.stage.firstEdit": "First edit",
  "editor.stage.copyedit": "Copyedit",
  "editor.stage.factCheck": "Fact-check",
  "editor.stage.sensitivityRead": "Sensitivity read",
  "editor.stage.ready": "Ready",

  // ── dueInfo() / blockedLine() composers (editorDashboard.data.ts) ─────────
  "editor.due.ready": "Ready",
  "editor.due.today": "Today",
  "editor.due.late": "Late · {days}d",
  "editor.due.inDays": "in {days}d",
  "editor.blocked.inYourCourt": "→ in your court",
  "editor.blocked.inEditorsCourt": "→ in {editor}’s court",
  "editor.blocked.waitingOnWriter": "waiting on {name}",

  // ── EditorDashboardHeader ──────────────────────────────────────────────
  "editor.header.eyebrow": "Editorial · Issue {number} dashboard",
  "editor.header.title": "Issue {number} · <em>{theme}</em>",
  "editor.header.meta":
    "Closes <b>{closes}</b> · publishes <b>{publishes}</b> · <b>{editors}</b> editing",
  "editor.header.viewingAs": "Viewing as",
  "editor.header.viewingAsAria": "View the dashboard as this editor",
  "editor.header.commissionCta": "+ Commission",

  // ── EditorStats ────────────────────────────────────────────────────────
  "editor.stats.piecesInFlight": "Pieces in flight",
  "editor.stats.readyToLayOut": "Ready to lay out",
  "editor.stats.behindSchedule": "Behind schedule",
  "editor.stats.pitchesInInbox": "Pitches in inbox",

  // ── EditorBulkBar ──────────────────────────────────────────────────────
  "editor.bulkBar.selected_one": "{count} pitch selected",
  "editor.bulkBar.selected_other": "{count} pitches selected",
  "editor.bulkBar.accept": "Accept",
  "editor.bulkBar.maybe": "Maybe",
  "editor.bulkBar.decline": "Decline",
  "editor.bulkBar.clear": "Clear",
  "editor.bulkBar.note":
    "Accepting or declining sends each writer a templated reply automatically.",

  // ── EditorToolbar ──────────────────────────────────────────────────────
  "editor.toolbar.searchPlaceholder": "Search pieces, pitches, contributors…",
  "editor.toolbar.searchAria": "Search",
  "editor.toolbar.clearSearchAria": "Clear search",
  "editor.toolbar.filterEditorAria": "Filter by editor",
  "editor.toolbar.allEditors": "All editors",
  "editor.toolbar.filterStatusAria": "Filter by status",
  "editor.toolbar.status.all": "All statuses",
  "editor.toolbar.status.late": "Late",
  "editor.toolbar.status.blocked": "In an editor’s court",
  "editor.toolbar.status.ready": "Ready",
  "editor.toolbar.filterSectionAria": "Filter by section",
  "editor.toolbar.allSections": "All sections",
  "editor.toolbar.sortAria": "Sort pieces",
  "editor.toolbar.sort.due": "Sort · deadline",
  "editor.toolbar.sort.status": "Sort · stage",
  "editor.toolbar.sort.editor": "Sort · editor",
  "editor.toolbar.sort.section": "Sort · section",
  "editor.toolbar.sort.words": "Sort · length",
  "editor.toolbar.myQueueOn": "My queue · on",
  "editor.toolbar.myQueue": "My queue",
  "editor.toolbar.shortcutsHint": "Press <kbd>?</kbd> for shortcuts",

  // ── EditorPiecesTable ──────────────────────────────────────────────────
  "editor.piecesTable.heading": "Pieces · <em>in flight</em>",
  "editor.piecesTable.countLabel": "{count} · {sort}",
  "editor.piecesTable.columnPieceEditorArt": "Piece · editor · art",
  "editor.piecesTable.columnStage": "Stage",
  "editor.piecesTable.columnDue": "Due",
  "editor.piecesTable.emptyNoneTitle": "Nothing in flight yet",
  "editor.piecesTable.emptyNoneBody":
    "No pieces are in the pipeline right now. Accept a pitch below or commission one, and it'll land here to edit.",
  "editor.piecesTable.emptyFilteredTitle": "No pieces match",
  "editor.piecesTable.emptyFilteredBody": "Try clearing the search or filters.",
  "editor.piecesTable.clearFiltersCta": "Clear filters",

  // ── EditorPieceRow ─────────────────────────────────────────────────────
  "editor.pieceRow.withEditor": "with {editor}",
  "editor.pieceRow.newVoice": "new voice",
  "editor.pieceRow.open": "Open",
  "editor.pieceRow.moreActionsAria": "More actions",

  // ── EditorPopover (Popover / StageMenu / AssignMenu / MoreMenu) ───────────
  "editor.popover.movePiece": "Move “{title}”",
  "editor.popover.current": "current",
  "editor.popover.editorForPiece": "Editor for this piece",
  "editor.popover.piecesCount_one": "{count} piece",
  "editor.popover.piecesCount_other": "{count} pieces",
  "editor.popover.piecesCountCurrent_one": "{count} piece · current",
  "editor.popover.piecesCountCurrent_other": "{count} pieces · current",
  "editor.popover.handOffWithNote": "Hand off with a note…",
  "editor.popover.nudge": "Nudge {name}…",
  "editor.popover.handOffToCoEditor": "Hand off to co-editor…",
  "editor.popover.previewInLayout": "Preview in layout",
  "editor.popover.duplicateBrief": "Duplicate brief",

  // ── EditorPitchInbox ───────────────────────────────────────────────────
  "editor.pitchInbox.heading": "Pitch inbox · <em>{total}</em>",
  "editor.pitchInbox.subhead": "avg response 6 days · triage in bulk ↓",
  "editor.pitchInbox.emptyMatch": "No pitches match “{query}”",
  "editor.pitchInbox.selectAria": "Select pitch from {name}",
  "editor.pitchInbox.showMore": "Show {count} more pitches →",
  "editor.pitchInbox.yes": "Yes",
  "editor.pitchInbox.maybe": "Maybe",
  "editor.pitchInbox.no": "No",

  // ── EditorNeedsStrip ───────────────────────────────────────────────────
  "editor.needsStrip.allClear":
    "You’re all clear, {name}. Nothing late and nothing waiting in your court. <emph>Nice.</emph>",
  "editor.needsStrip.heading": "Needs you now · <em>{count}</em>",
  "editor.needsStrip.yourCourt": "Your court",
  "editor.needsStrip.writerHasntFiled": "Writer hasn’t filed",
  "editor.needsStrip.overdueAt": "Overdue at {stage}",
  "editor.needsStrip.sittingInCourt": "Sitting in your court · {stage}",
  "editor.needsStrip.chase": "Chase {name}",
  "editor.needsStrip.pickUp": "Pick up",

  // ── EditorModals: Chase / Handoff / Shortcuts ─────────────────────────
  "editor.modals.chase.eyebrowFirstTime": "Nudge · first-time contributor",
  "editor.modals.chase.eyebrow": "Nudge · contributor",
  "editor.modals.chase.title": "Message {name}",
  "editor.modals.chase.cancel": "Cancel",
  "editor.modals.chase.send": "Send nudge",
  "editor.modals.chase.softHint":
    "Softer tone — this is one of their first pieces with us.",
  "editor.modals.chase.messageAria": "Message to contributor",
  "editor.modals.chase.offerExtension": "Offer a deadline extension",
  "editor.modals.chase.bodyNewVoice":
    "Hi {name} — no pressure at all, just checking in on “{title}”. How's it feeling? Happy to hop on a call or push the date if that would help. We're really glad to have you in this issue.",
  "editor.modals.chase.bodyReturning":
    "Hi {name} — gentle nudge on “{title}”, currently at {stage} and due {due}. Let me know if anything's getting in the way, and we'll sort it together.",
  "editor.modals.handoff.eyebrow": "Hand off",
  "editor.modals.handoff.title": "Pass “{title}”",
  "editor.modals.handoff.cancel": "Cancel",
  "editor.modals.handoff.cta": "Hand off",
  "editor.modals.handoff.handTo": "Hand to",
  "editor.modals.handoff.noteLabel": "Note",
  "editor.modals.handoff.noteWriterWaiting":
    "@{editor} handing this over — it's at {stage}, still waiting on the writer. Shout if you want context.",
  "editor.modals.handoff.noteReady":
    "@{editor} handing this over — it's at {stage}, ready for your eyes. Shout if you want context.",
  "editor.modals.shortcuts.eyebrow": "Keyboard",
  "editor.modals.shortcuts.title": "Shortcuts",
  "editor.modals.shortcuts.gotIt": "Got it",
  "editor.modals.shortcuts.moveBetweenPieces": "Move between pieces",
  "editor.modals.shortcuts.openFocusedPiece": "Open focused piece",
  "editor.modals.shortcuts.nudgeWriter": "Nudge writer of focused piece",
  "editor.modals.shortcuts.acceptDeclineMaybe":
    "Accept / decline / maybe top pitch",
  "editor.modals.shortcuts.search": "Search",
  "editor.modals.shortcuts.thisHelp": "This help",

  // ── EditorSideCards ────────────────────────────────────────────────────
  "editor.sideCards.progressHeading": "Issue {number} progress",
  "editor.sideCards.piecesReady": "Pieces ready",
  "editor.sideCards.wordCount": "Word count",
  "editor.sideCards.timeToClose": "Time to close",
  "editor.sideCards.daysLeft_one": "{count} day",
  "editor.sideCards.daysLeft_other": "{count} days",
  "editor.sideCards.editorLoadHeading": "Editor load",
  "editor.sideCards.you": "you",
  "editor.sideCards.piecesWords": "{count} pieces · {words}w",
  "editor.sideCards.lateCount_one": "{count} late",
  "editor.sideCards.lateCount_other": "{count} late",
  "editor.sideCards.loadHintOtherMore":
    "{editor} is carrying {amount} more words. Reassign to balance.",
  "editor.sideCards.loadHintBalanced":
    "Load is evenly balanced across editors.",
  "editor.sideCards.sectionBudgetHeading": "Section budget",
  "editor.sideCards.slotsOpen_one": "{count} slot open",
  "editor.sideCards.slotsOpen_other": "{count} slots open",
  "editor.sideCards.needCount": "need {count}",
  "editor.sideCards.filledAria": "filled",
  "editor.sideCards.contributorsHeading": "Contributors · this issue",
  "editor.sideCards.newVoices": "new voices",
  "editor.sideCards.returning": "returning",
  "editor.sideCards.contributorPay": "Contributor pay",
  "editor.sideCards.paid": "paid",
  "editor.sideCards.awaiting": "awaiting",
  "editor.sideCards.toInvoice": "to invoice",
  "editor.sideCards.matching": "Matching: {names}",
  "editor.sideCards.noContributorMatch": "No contributor matches",
  "editor.sideCards.seeContributorProfiles": "See contributor profiles →",
  "editor.sideCards.recentActivity": "Recent activity",
  "editor.sideCards.quickActions": "Quick actions",
  "editor.sideCards.sendPitchDecisions": "→ Send pitch decisions in bulk",
  "editor.sideCards.emailContributorsWaiting": "→ Email contributors waiting",
  "editor.sideCards.previewIssueLayout": "→ Preview issue layout",
  "editor.sideCards.exportContributorList": "→ Export contributor list (CSV)",

  // ── EditorDashboardPage ────────────────────────────────────────────────
  "editor.page.emptyTitle": "The desk is clear",
  "editor.page.emptyDescription":
    "No pieces in flight and no pitches waiting. When writers pitch or you commission a piece, it'll show up here to triage and edit.",
  "editor.page.everyPitchLoaded": "That’s every pitch loaded in this prototype",

  // ── useEditorDashboard / useEditorKeyboard toasts ──────────────────────
  "editor.toast.stageChanged": "“{title}” → {stage}",
  "editor.toast.reassigned": "Reassigned to {editor}",
  "editor.toast.handedOff": "Handed to {editor} with a note",
  "editor.toast.triageAccepted": "Accepted",
  "editor.toast.triageMaybeSaved": "Saved to Maybe",
  "editor.toast.triageDeclined": "Declined",
  "editor.toast.triageSingle": "{verdict} · {name}",
  "editor.toast.bulkAccepted": "Accepted",
  "editor.toast.bulkMaybeMoved": "Moved to Maybe",
  "editor.toast.bulkDeclined": "Declined",
  "editor.toast.bulkResult_one":
    "{verdict} {count} pitch · templated replies sent",
  "editor.toast.bulkResult_other":
    "{verdict} {count} pitches · templated replies sent",
  "editor.toast.nudgeSent": "Nudge sent to {name}",
  "editor.toast.briefDuplicated": "Brief duplicated to drafts",
  "editor.toast.openingBulkTriage": "Opening bulk pitch triage",
  "editor.toast.draftingReminders":
    "Drafting reminders to {count} contributors",
  "editor.toast.contributorListExported": "Contributor list exported (CSV)",

  // ══════════════════ Submit Story wizard ══════════════════════════════════
  // `INITIAL_DRAFT` (the example headline/byline/deck/body) is left as
  // English mock content — a first-person example essay, not chrome.

  // ── SubmitStoryIntro ───────────────────────────────────────────────────
  "submitStory.intro.eyebrow": "Pitch a story",
  "submitStory.intro.title": "Got something <em>worth telling?</em>",
  "submitStory.intro.lead":
    "The QueerPulse magazine is written by the community. You don't need a byline or an agent — just a story that matters and an honest way of telling it.",
  "submitStory.intro.lookingFor.specific.title":
    "The specific over the general",
  "submitStory.intro.lookingFor.specific.body":
    "One supper club, one street, one afternoon. We trust the small story to carry the big one.",
  "submitStory.intro.lookingFor.beyond.title": "Lisbon and beyond",
  "submitStory.intro.lookingFor.beyond.body":
    "Rooted here, but we publish diaspora and visitor voices too. Place matters; borders less so.",
  "submitStory.intro.lookingFor.pay.title": "We pay, always",
  "submitStory.intro.lookingFor.pay.body":
    'Every published piece is paid fairly — rates shared upfront, no "exposure" ever.',
  "submitStory.intro.stepsHeading": "What happens next",
  "submitStory.intro.step.reply":
    "A reply within two weeks — yes, no, or let's talk.",
  "submitStory.intro.step.assigned":
    "If it's a yes, an editor is assigned and you agree a rate and deadline.",
  "submitStory.intro.step.copyright":
    "You keep the copyright. We license it, we don't own it.",

  // ── SubmitStorySidebar ─────────────────────────────────────────────────
  "submitStory.sidebar.guidelinesHeading": "Editorial guidelines",
  "submitStory.sidebar.guideline.length.term": "800–2,500 words",
  "submitStory.sidebar.guideline.length.detail":
    "for most sections. Long reads up to 4,000.",
  "submitStory.sidebar.guideline.experience.term": "Write from experience.",
  "submitStory.sidebar.guideline.experience.detail":
    "First-person or closely reported. Not punditry.",
  "submitStory.sidebar.guideline.noPromo.term": "No promotional content.",
  "submitStory.sidebar.guideline.noPromo.detail":
    "The magazine doesn't carry advertising or sponsored pieces.",
  "submitStory.sidebar.guideline.language.term": "Portuguese or English",
  "submitStory.sidebar.guideline.language.detail": "— we publish both.",
  "submitStory.sidebar.guideline.deadlines.term": "Deadlines are firm.",
  "submitStory.sidebar.guideline.deadlines.detail":
    "Late submissions go to the following issue.",
  "submitStory.sidebar.afterSubmitHeading": "After you submit",
  "submitStory.sidebar.afterSubmit.response":
    "Our editors respond within <strong>5 working days</strong> with acceptance, a request for edits, or a pass with notes.",
  "submitStory.sidebar.afterSubmit.approve":
    "Accepted pieces go through one round of editing. <strong>You approve the final version</strong> before it publishes.",
  "submitStory.sidebar.afterSubmit.licence":
    "You retain copyright. <strong>QueerPulse has a non-exclusive licence</strong> to publish in the magazine and archive.",
  "submitStory.sidebar.questionsHeading": "Questions?",
  "submitStory.sidebar.questionsBody":
    "Email the editorial team or check past issues for a sense of what we publish.",
  "submitStory.sidebar.emailCta": "Email editorial",

  // ── SubmitStorySuccess ─────────────────────────────────────────────────
  "submitStory.success.title": "We're <em>reading.</em>",
  "submitStory.success.sub":
    "Thank you for trusting us with “{title}”. Whatever happens, the copyright stays yours.",
  "submitStory.success.defaultTitle": "your story",
  "submitStory.success.timeline.readsEvery":
    "An editor reads every pitch personally.",
  "submitStory.success.timeline.hearBy":
    "You'll hear from us by <strong>{date}</strong> — yes, no, or let's talk.",
  "submitStory.success.timeline.ifYes":
    "If it's a yes, we agree a rate and deadline together.",
  "submitStory.success.backCta": "Back to the magazine",
  "submitStory.success.pastIssuesCta": "Read past issues",

  // ── SubmitStoryMeta ────────────────────────────────────────────────────
  "submitStory.meta.heading": "Story <em>details</em>",
  "submitStory.meta.sectionLabel": "Section",
  "submitStory.meta.sectionPlaceholder": "Choose a section…",
  "submitStory.meta.section.longRead": "Long read",
  "submitStory.meta.section.personalEssay": "Personal essay",
  "submitStory.meta.section.interview": "Interview",
  "submitStory.meta.section.opinion": "Opinion",
  "submitStory.meta.section.communityReport": "Community report",
  "submitStory.meta.section.shortFiction": "Short fiction",
  "submitStory.meta.section.photography": "Photography",
  "submitStory.meta.bylineLabel": "Byline",
  "submitStory.meta.bylineNoteLabel": "Byline note",
  "submitStory.meta.optional": "optional",
  "submitStory.meta.bylineNotePlaceholder": "e.g. writes about housing",
  "submitStory.meta.tagsLabel": "Tags",
  "submitStory.meta.commaSeparated": "comma separated",
  "submitStory.meta.tagsPlaceholder": "e.g. housing, identity, Lisbon",
  "submitStory.meta.statusDraft": "Draft",

  // ── SubmitStoryWriter ──────────────────────────────────────────────────
  "submitStory.writer.tool.bold": "Bold",
  "submitStory.writer.tool.italic": "Italic",
  "submitStory.writer.tool.link": "Link",
  "submitStory.writer.tool.heading": "Heading",
  "submitStory.writer.tool.quote": "Block quote",
  "submitStory.writer.tool.bullet": "Bullet list",
  "submitStory.writer.tool.image": "Image",
  "submitStory.writer.autosaved": "Autosaved",
  "submitStory.writer.unsaved": "Unsaved…",
  "submitStory.writer.headlineAria": "Headline",
  "submitStory.writer.headlinePlaceholder": "Your headline",
  "submitStory.writer.standfirstAria": "Standfirst",
  "submitStory.writer.standfirstPlaceholder":
    "A sentence or two that draws the reader in…",
  "submitStory.writer.bodyAria": "Story body",
  "submitStory.writer.bodyPlaceholder": "Start writing…",
  "submitStory.writer.wordCount_one": "{count} word",
  "submitStory.writer.wordCount_other": "{count} words",

  // ── SubmitStoryEditor ──────────────────────────────────────────────────
  "submitStory.editor.draftSaved": "Draft saved.",
  "submitStory.editor.chooseSectionError":
    "Choose a section for your piece first.",
  "submitStory.editor.needHeadlineError":
    "Your story needs a headline before it goes to editors.",
  "submitStory.editor.minWordsError":
    "A little more to go — at least {min} words before you submit.",
  "submitStory.editor.submitError":
    "Couldn't submit your story right now — please try again.",
  "submitStory.editor.saveDraftCta": "Save draft",
  "submitStory.editor.submittingCta": "Submitting…",
  "submitStory.editor.submitCta": "Submit for review",

  // ── SubmitStoryCover ───────────────────────────────────────────────────
  "submitStory.cover.previewAlt": "Cover preview",
  "submitStory.cover.replaceCta": "Replace",
  "submitStory.cover.removeCta": "Remove",
  "submitStory.cover.uploading": "Uploading…",
  "submitStory.cover.addCta": "Add a cover image",
  "submitStory.cover.hint":
    "JPG, PNG or WebP · min 1200 × 600px · displayed at top of published story",
  "submitStory.cover.uploadingProgress": "Uploading… {progress}%",
  "submitStory.cover.errorFallback":
    "We couldn't add that cover. Please try again.",

  // ── submitStory.data.ts: ISSUE (the open-for-submissions issue record) ──
  "submitStory.issue.badge": "Issue {number}",
  "submitStory.issue.name": "{monthYear} issue · Open for submissions",
  "submitStory.issue.deadline": "Submission deadline: {date}",

  // ══════════════════ Pitch Tracker ═════════════════════════════════════════
  // PitchCard/PitchStages per-pitch fields (statusLabel, stage labels, action
  // labels) are populated by BOTH the mock `PITCHES` array and the live
  // `submissionToPitch` adapter (magazine.adapters.tsx) as already-resolved
  // English strings computed outside the render tree (inside `useQuery`'s
  // queryFn) — not reactive to a language switch. Correctly localizing them
  // needs the `Pitch`/`PitchStage`/`PitchAction` types reshaped to carry
  // stable keys (label-key indirection) the components resolve via `t()`,
  // with the adapter updated to emit those keys instead of English text.
  // Left unswept this pass; only the container chrome below is translated.

  // ── PitchTrackerHeader ─────────────────────────────────────────────────
  "pitchTracker.header.eyebrow": "Magazine · your pitches",
  "pitchTracker.header.title": "Where every pitch <em>actually is.</em>",
  "pitchTracker.header.lead":
    "{active} pitches active · {published} published all-time. Editorial replies within <b>~ {days} days</b>.",
  "pitchTracker.header.newPitchCta": "+ New pitch",

  // ── PitchTabs ──────────────────────────────────────────────────────────
  "pitchTracker.tabs.ariaLabel": "Pitch status",
  "pitchTracker.tabs.all": "All",
  "pitchTracker.tabs.review": "In review",
  "pitchTracker.tabs.commissioned": "Commissioned",
  "pitchTracker.tabs.published": "Published",
  "pitchTracker.tabs.closed": "Closed",

  // ── PitchTrackerPage ───────────────────────────────────────────────────
  "pitchTracker.page.emptyTitle": "Nothing in this view.",
  "pitchTracker.page.emptyBody":
    "No pitches here right now. Switch tabs, or start something new from the New pitch button above.",
  "pitchTracker.page.withdrawnToast": "Pitch withdrawn",
  "pitchTracker.page.undoCta": "Undo",
  "pitchTracker.page.stubToast": "{label} — coming soon in this prototype",

  // ══════════════════ NewsletterSubscribe ═══════════════════════════════════
  "newsletter.subscribe.streamLabel.all": "all three newsletters",
  "newsletter.subscribe.streamLabel.dispatch": "the Community dispatch",
  "newsletter.subscribe.streamLabel.long": "the Long reads monthly",
  "newsletter.subscribe.streamLabel.trans": "the Trans Hub bulletin",
  "newsletter.subscribe.confirmToast":
    "Almost there — check your inbox to confirm",
  "newsletter.subscribe.doneTitle": "One more <em>step.</em>",
  "newsletter.subscribe.doneBody":
    "We'll send <strong>{stream}</strong> to <strong>{email}</strong>.",
  "newsletter.subscribe.doneNext":
    "Check your inbox to confirm — the link expires in 48 hours. You can change which streams you get from any email.",
  "newsletter.subscribe.anotherCta": "Subscribe another email",
  "newsletter.subscribe.emailPlaceholder": "you@example.com",
  "newsletter.subscribe.submitCta": "Subscribe →",
  "newsletter.subscribe.footAll": "Pick which newsletters you want in step 2. ",
  "newsletter.subscribe.footOne":
    "You'll get <strong>{stream}</strong> — adjust in step 2. ",
  "newsletter.subscribe.footShared":
    "Unsubscribe one-tap from any email. We never share your address.",

  // ══════════════════ PrintOrderModal (Issue 09 print run) ══════════════════
  "printOrder.dialogAria": "Order the print edition",
  "printOrder.closeAria": "Close",
  "printOrder.success.title": "It's on its <em>way to you.</em>",
  "printOrder.success.body_one":
    "{count} copy of <b>{issue}</b> reserved from the print run. We'll email <b>{email}</b> when it ships from Marvila — usually within a week. Thank you for funding the next issue's contributors.",
  "printOrder.success.body_other":
    "{count} copies of <b>{issue}</b> reserved from the print run. We'll email <b>{email}</b> when it ships from Marvila — usually within a week. Thank you for funding the next issue's contributors.",
  "printOrder.success.doneCta": "Done",
  "printOrder.eyebrow": "Print edition · {issue}",
  "printOrder.title": "Order the <em>print run.</em>",
  "printOrder.lead":
    "{pages} pages, risograph cover, printed in Marvila. <b>€{price} at cost</b> — proceeds fund the next issue's contributors.",
  "printOrder.copiesLabel": "Copies",
  "printOrder.fewerCopiesAria": "Fewer copies",
  "printOrder.moreCopiesAria": "More copies",
  "printOrder.emailFieldLabel": "Email for shipping updates",
  "printOrder.emailFieldHelper":
    "We only use this to tell you when your copy ships.",
  "printOrder.emailPlaceholder": "you@example.com",
  "printOrder.cancelCta": "← Cancel",
  "printOrder.placingCta": "Placing your order…",
  "printOrder.placeCta": "Place order — €{total}",

  // ══════════════════ CoverGalleryPage ══════════════════════════════════════
  // COVERS/STATS/ILLUS records (each cover's theme, artist credits, print
  // stats) are specific-issue content — left as English mock data.
  "coverGallery.backLink": "the Magazine",
  "coverGallery.eyebrow": "Magazine · all covers · 2024 → present",
  "coverGallery.title": "Nine <em>covers,</em> one each season.",
  "coverGallery.dek":
    "Every QueerPulse Magazine cover, in order. Risograph-printed in Lisbon, sized A5. Each was made by a different artist working with the editorial team. <em>Press is welcome to use any of these images</em> under the terms in our <a>press kit</a>.",
  "coverGallery.madeWithHeading": "Made <em>with</em>",
  "coverGallery.madeWithSub":
    "Cover artists, in cover order. Most are members; two we commissioned externally.",
};

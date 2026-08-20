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
  "masthead.nav.stories": "Stories",
  "masthead.nav.authors": "Writers",
  "masthead.nav.write": "Write for us",
  "masthead.nav.sections": "Sections",

  // ── MagazinePage ─────────────────────────────────────────────────────────
  "landing.meta.title": "The Magazine: QueerPulse",
  "landing.meta.description":
    "Essays, features, interviews and criticism from queer Lisbon: the QueerPulse magazine.",
  "landing.inIssueAriaLabel": "In this issue",
  "landing.inIssueLabel": "In this issue",
  "landing.nav.features": "Features",
  "landing.nav.essays": "Essays",
  "landing.nav.interviews": "Interviews",
  "landing.nav.reviews": "Reviews",
  "landing.nav.communityLife": "Community Life",
  "landing.nav.letters": "Letters",
  "landing.nav.archive": "Archive",

  // ── MagazineCover ────────────────────────────────────────────────────────
  "cover.coverAlt": "Cover portrait",
  "cover.coverPlaceholder": "Cover portrait: full bleed, dramatic lighting",
  "cover.coverImageLabel": "Cover · June 2026",
  "cover.kicker": "Cover story · Feature",
  "cover.byline": "By",
  "cover.photographyBy": "Photography by",
  "cover.readFullFeatureCta": "Read the full feature",

  // ── MagazineSections ─────────────────────────────────────────────────────
  // "sections.live.*" is MagazineLiveSections' heading (real published
  // articles, live mode only) — distinct from "sections.features.title"
  // below, which is demo-mode's curated (fabricated) "this month's picks".
  "sections.live.title": "Latest <em>from the magazine</em>",
  "sections.features.title": "This month's <em>features</em>",
  "sections.features.allCta": "All this month's features",
  "sections.essayOfMonthKicker": "Essay of the month",
  "sections.readEssayCta": "Read the essay",
  "sections.essays.title": "<em>Essays</em>",
  "sections.essays.allCta": "All essays",
  "sections.interviews.title": "<em>Interviews</em>",
  "sections.interviews.allCta": "All interviews",
  "sections.reviews.title": "<em>Reviews</em>",
  "sections.reviews.allCta": "All reviews",
  "sections.communityLife.title": "Community <em>life</em>",
  "sections.communityLife.allCta": "All community life",
  "sections.letters.title": "Letters to the <em>editors</em>",
  "sections.archive.title": "Past <em>issues</em>",
  "sections.archive.allCta": "All past issues",
  "sections.submit.title": "Write for <em>the magazine.</em>",
  "sections.submit.body":
    "We publish essays, features, reviews, interviews, and criticism from community members. No formal credentials required: just something worth saying.",
  "sections.submit.cta": "Pitch us",
  "sections.verdict.essential": "Essential",
  "sections.verdict.recommended": "Recommended",
  // Live mode has no published issues yet — an honest "coming soon" replaces
  // the fabricated article rails (the demo mock stays in demo mode).
  "sections.emptyLive.title": "The magazine is coming soon",
  "sections.emptyLive.description":
    "Our first issue is on the way. We're lining up essays, features, interviews and reviews from the community. Check back soon, or pitch us something to run in it.",

  // ── ArticlePage ──────────────────────────────────────────────────────────
  "article.notFoundMetaTitle": "Article not found: QueerPulse Magazine",
  "article.notFoundTitle": "We couldn't find that piece.",
  "article.notFoundBody":
    "The article may have moved, or the link may be incomplete.",
  "article.notFoundCta": "Back to the magazine",
  "article.pageTitleSuffix": ": QueerPulse Magazine",
  "article.backToMagazine": "Magazine",
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

  // ── Deck reader chrome — DeckViewer, DeckControls, DeckPresentButton,
  // slide components, and the FeaturedDeck block ──────────────────────────
  "deck.present": "Present",
  "deck.close": "Close",
  "deck.next": "Next slide",
  "deck.prev": "Previous slide",
  "deck.slideCounter": "{current} / {total}",
  "deck.goToSlide": "Go to slide {n}",
  "deck.tapToReveal": "Tap to reveal",
  "deck.beforeAfterHint": "Drag to compare",
  "deck.end": "You've reached the end",
  "deck.backToMagazine": "Back to the magazine",
  "deck.badge": "Interactive",
  "deck.start": "Start the story",

  // ── Deck-authoring editor — DeckMetaForm, DeckSlidesEditor, SlideEditorCard,
  // ImageUrlField, DeckEditorPage (staff-only) ─────────────────────────────
  "deck.editor.imageUrlInvalid": "Enter a valid image URL",
  "deck.editor.slug": "Slug",
  "deck.editor.title": "Title",
  "deck.editor.kicker": "Kicker",
  "deck.editor.section": "Section",
  "deck.editor.byline": "Byline",
  "deck.editor.role": "Role",
  "deck.editor.readTime": "Read time",
  "deck.editor.authorBio": "Author bio",
  "deck.editor.tags": "Tags",
  "deck.editor.related": "Related",
  "deck.editor.cover": "Cover image",
  "deck.editor.coverDesc": "Cover description",
  "deck.editor.slideNumber": "Slide {n}",
  "deck.editor.addSlide": "Add slide",
  "deck.editor.addSlideLayout": "Layout",
  "deck.editor.addSlideHint":
    "Every slide is the reader's real component. This preview cannot drift.",
  "deck.editor.moveUp": "Move up",
  "deck.editor.moveDown": "Move down",
  "deck.editor.removeSlide": "Remove slide",
  "deck.editor.summaryEmpty": "Empty slide",
  "deck.editor.layout.text": "Text",
  "deck.editor.layout.image": "Image",
  "deck.editor.layout.stat": "Stat",
  "deck.editor.layout.beforeAfter": "Before / after",
  "deck.editor.layout.reveal": "Reveal",
  "deck.editor.field.eyebrow": "Eyebrow",
  "deck.editor.field.heading": "Heading",
  "deck.editor.field.body": "Body",
  "deck.editor.field.pull": "Pull quote",
  "deck.editor.field.align": "Alignment",
  "deck.editor.field.alignDefault": "Default",
  "deck.editor.field.alignLeft": "Left",
  "deck.editor.field.alignCenter": "Center",
  "deck.editor.field.imageSrc": "Image URL",
  "deck.editor.field.alt": "Alt text",
  "deck.editor.field.caption": "Caption",
  "deck.editor.field.tint": "Tint",
  "deck.editor.field.value": "Value",
  "deck.editor.field.unit": "Unit",
  "deck.editor.field.label": "Label",
  "deck.editor.field.source": "Source",
  "deck.editor.field.before": "Before",
  "deck.editor.field.after": "After",
  "deck.editor.field.prompt": "Prompt",
  "deck.editor.field.hidden": "Hidden until tapped",
  "deck.editor.tint.coral": "Coral",
  "deck.editor.tint.jade": "Jade",
  "deck.editor.tint.plum": "Plum",
  "deck.editor.tint.auth": "Solid",
  "deck.editor.newTitle": "New deck",
  "deck.editor.editTitle": "Edit deck",
  "deck.editor.saveDraft": "Save draft",
  "deck.editor.publish": "Publish",
  "deck.editor.unpublish": "Unpublish",
  "deck.editor.delete": "Delete",
  "deck.editor.leaveConfirm":
    "You have unsaved changes. Leave without saving?",
  "deck.editor.previewEmpty": "Add a slide to preview",
  "deck.editor.preview.title": "Preview",
  "deck.editor.preview.emptySlide": "Start filling in this slide to see it here.",
  "deck.editor.budget.headingOver": "Too long. It will clip on a phone",
  "deck.editor.budget.headingOk": "Fits on the narrowest phone",
  "deck.editor.budget.bodyOver": "A slide is not a paragraph",
  "deck.editor.budget.bodyOk": "Short enough to read at a glance",
  "deck.editor.budget.count": "{count} / {max} characters",
  "deck.editor.saved": "Draft saved",
  "deck.editor.publishedToast": "Deck published",
  "deck.editor.deletedToast": "Deck deleted",
  "deck.editor.saveError": "We couldn't save your deck. Please try again.",
  "deck.editor.backToDashboard": "Back to dashboard",
  "deck.editor.metaTitle": "Deck details",
  "deck.editor.untitled": "Untitled deck",
  "deck.editor.header.subtitle": "Deck · {count} slides",
  "deck.editor.unsavedChanges": "Unsaved changes",
  "deck.editor.convert": "Make it prose",
  "deck.editor.slidesHeading": "Slides",
  "deck.editor.slidesCount": "{count} of {max} · click a slide to edit",
  "deck.editor.slidesCapped": "40-slide maximum reached",
  "deck.editor.publish.notNowNote":
    "This ships as soon as you press Publish. Deck scheduling isn't wired up yet.",
  "deck.editor.publish.checklist.cover": "Cover slide set",
  "deck.editor.publish.checklist.source":
    "Source line on every stat slide (optional)",
  "deck.editor.publish.checklist.sourcePending":
    "Source line on every stat slide (optional, none yet)",
  "deck.editor.danger.title": "Danger zone",
  "deck.editor.danger.body":
    "Deleting a deck removes it everywhere it's linked. This can't be undone.",
  "deck.editor.danger.cta": "Delete this deck",
  "deck.editor.deleteModal.title": "Delete this deck?",
  "deck.editor.deleteModal.body":
    "This removes the deck and every slide in it. Readers who already have the link will see a 404.",
  "deck.editor.convertModal.title": "Turn this into prose?",
  "deck.editor.convertModal.body":
    "Text and image slides carry straight over into article blocks, and each stat becomes a stats block. Interactive slides (before/after, reveal) have no article equivalent and will be dropped. This can't be undone.",
  "deck.editor.convertModal.cta": "Convert to article",
  "deck.editor.convertModal.toast": "Deck-to-article conversion isn't wired up yet.",
  "deck.editor.convertModal.successToast": "Converted to an article draft.",
  "deck.editor.convertModal.partialToast":
    "Converted, but {dropped} couldn't carry over and were dropped.",
  "deck.editor.convertModal.errorToast": "We couldn't convert this deck. Please try again.",

  // ── Issue chrome — shared by IssueCover, IssueContents, IssuesPage ────────
  "issue.backToAllIssues": "All issues",
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
  "issue.readCta": "Read issue {number}",
  "issue.orderPrintCta": "Order print · {price}",
  // Live mode: shown when there is no published issue to read yet.
  "issue.emptyLiveTitle": "This issue isn't out yet",
  "issue.emptyLiveBody":
    "The current issue is still being put together. Check back soon, or pitch us a piece to run in it.",

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
    "Issue {issue} is available as a <b>limited print run</b>: {pages} pages, risograph cover, printed in Marvila. Members get it at cost; proceeds fund the next issue's contributors.",
  "contents.print.orderCta": "Order the print edition: {price}",
  "contents.print.readOnlineCta": "Read online free",
  "contents.print.imageAlt": "Print edition mockup · Issue {issue}",

  // ── IssuesPage ───────────────────────────────────────────────────────────
  "issues.eyebrow": "Magazine · all editions",
  "issues.heroTitle": "Nine issues, <em>quarterly</em>, since 2024.",
  "issues.heroDek":
    "A magazine that takes its time. Risograph print, free in PDF, paid in paper. Each issue circles a single question: health, work, the city, what we owe each other. Sustainer members get them in the mail.",
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
  "issues.archiveErrorTitle": "We couldn't load the archive.",
  "issues.archiveErrorBody":
    "Something interrupted us on the way to the back issues. Give it another try.",
  "issues.archiveRetryCta": "Try again",
  "issues.archiveEmptyTitle": "No issues to show yet.",
  "issues.archiveEmptyBody":
    "The archive is still being set. The first editions will land here soon.",

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
  "author.work.allArticlesCta_one": "All {count} article",
  "author.work.allArticlesCta_other": "All {count} articles",
  "author.work.seeAllPicksCta": "See all picks",
  "author.work.findElsewhereHeading": "Find {name} <em>elsewhere</em>",
  "author.work.noArticlesYet": "{name} hasn't published anything yet. Check back soon.",

  // ── AuthorsDirectoryPage ─────────────────────────────────────────────────
  "authorsDirectory.eyebrow": "Magazine · writers",
  "authorsDirectory.title": "Everyone writing for the magazine.",
  "authorsDirectory.sub":
    "Reporters, essayists, and interviewers, all in one place. Pick a name to read their work.",
  "authorsDirectory.errorTitle": "We couldn't load the writers.",
  "authorsDirectory.errorBody":
    "Something interrupted us on the way here. Give it another try.",
  "authorsDirectory.emptyTitle": "No writers to show yet.",
  "authorsDirectory.emptyBody":
    "The directory is still being set up. Bylines will land here soon.",

  // ── MagazineSectionsPage (CNT-20) ────────────────────────────────────────
  "sections.eyebrow": "Magazine · sections",
  "sections.title": "Browse by section.",
  "sections.sub":
    "Every part of the magazine, from cover features to the last word. Pick a section to see what's run there.",
  "sections.errorTitle": "We couldn't load the sections.",
  "sections.errorBody":
    "Something interrupted us on the way here. Give it another try.",
  "sections.emptyTitle": "No sections to show yet.",
  "sections.emptyBody": "The section taxonomy is still being set up.",
  "sections.articleCount_one": "{count} piece",
  "sections.articleCount_other": "{count} pieces",

  // ── MagazineSectionArticlesPage (CNT-20) ─────────────────────────────────
  "sectionArticles.eyebrow": "Magazine · section",
  "sectionArticles.backCta": "All sections",
  "sectionArticles.errorTitle": "We couldn't load this section.",
  "sectionArticles.errorBody":
    "Something interrupted us on the way here. Give it another try.",
  "sectionArticles.emptyTitle": "Nothing published here yet.",
  "sectionArticles.emptyBody":
    "This section is still waiting on its first piece. Check back soon.",

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
  "editor.pitchInbox.showMore": "Show {count} more pitches",
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
    "Softer tone: this is one of their first pieces with us.",
  "editor.modals.chase.messageAria": "Message to contributor",
  "editor.modals.chase.offerExtension": "Offer a deadline extension",
  "editor.modals.chase.bodyNewVoice":
    "Hi {name}, no pressure at all, just checking in on “{title}”. How's it feeling? Happy to hop on a call or push the date if that would help. We're really glad to have you in this issue.",
  "editor.modals.chase.bodyReturning":
    "Hi {name}, gentle nudge on “{title}”, currently at {stage} and due {due}. Let me know if anything's getting in the way, and we'll sort it together.",
  "editor.modals.handoff.eyebrow": "Hand off",
  "editor.modals.handoff.title": "Pass “{title}”",
  "editor.modals.handoff.cancel": "Cancel",
  "editor.modals.handoff.cta": "Hand off",
  "editor.modals.handoff.handTo": "Hand to",
  "editor.modals.handoff.noteLabel": "Note",
  "editor.modals.handoff.noteWriterWaiting":
    "@{editor} handing this over. It's at {stage}, still waiting on the writer. Shout if you want context.",
  "editor.modals.handoff.noteReady":
    "@{editor} handing this over. It's at {stage}, ready for your eyes. Shout if you want context.",
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
  "editor.sideCards.seeContributorProfiles": "See contributor profiles",
  "editor.sideCards.recentActivity": "Recent activity",
  "editor.sideCards.quickActions": "Quick actions",
  "editor.sideCards.sendPitchDecisions": "Send pitch decisions in bulk",
  "editor.sideCards.emailContributorsWaiting": "Email contributors waiting",
  "editor.sideCards.previewIssueLayout": "Preview issue layout",
  "editor.sideCards.exportContributorList": "Export contributor list (CSV)",

  // ── EditorDecksSection ──────────────────────────────────────────────────
  "editor.decks.title": "Interactive decks",
  "editor.decks.countLabel": "{count} decks",
  "editor.decks.columnTitle": "Title",
  "editor.decks.columnSection": "Section",
  "editor.decks.columnStatus": "Status",
  "editor.decks.emptyTitle": "No decks yet",
  "editor.decks.emptyBody":
    "Interactive slide decks you create will show up here. Start one and publish it whenever it's ready.",
  "editor.decks.new": "New deck",
  "editor.decks.statusPublished": "Published",
  "editor.decks.statusDraft": "Draft",
  "editor.decks.edit": "Edit",

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

  // ══════════════════ Editor desk (Phase 1 redesign) ═══════════════════════
  // The desk/* components render a newer, more detailed dashboard than the
  // `editor.*` section above (a different Stage set, different composition)
  // — these `desk.*` keys are that dashboard's own chrome. Raw `Stage`
  // strings echoed directly as display text (StagePill, FormatBadge,
  // PiecesBoard's column headings/stage-select options, IssuePlan's slot
  // caption) are left unswept here, same as `pitchTracker.stage.*`'s note
  // above — a literal stage id doubling as display text is a bigger
  // label-key project, out of this pass's scope.

  // ── DeskHeader ───────────────────────────────────────────────────────────
  "desk.header.layout.pipeline": "Pipeline",
  "desk.header.layout.board": "Board",
  "desk.header.layout.issuePlan": "Issue plan",
  "desk.header.eyebrow": "Issue {number} · {theme}",
  "desk.header.title": "The desk",
  "desk.header.meta": "Closes {closes} · publishes {publishes}",
  "desk.header.daysLeft": "{days} days",
  "desk.header.toClose": "to close",
  "desk.header.slotsFilled": "{filled} of {slots} slots filled",
  "desk.header.viewingAs": "Viewing as",
  "desk.header.viewingAsEditorAria": "Viewing as editor",
  "desk.header.commissionCta": "Commission",
  "desk.header.produce": "Issue production",
  "desk.header.slotsFilledAria": "Issue slots filled",
  "desk.header.layoutAria": "Desk layout",
  "desk.header.highlightsEyebrow": "Standalone highlights",
  "desk.header.highlightsMeta":
    "Pieces that run on their own across the platform, not tied to any one issue.",

  // ── DeskTrackTabs (Highlights ⇄ Issue) ───────────────────────────────────
  "desk.trackTabs.highlights": "Highlights",
  "desk.trackTabs.issue": "Issue {number}",
  "desk.trackTabs.issueNoNumber": "Issue",

  // ── Track reassignment (piece row action) ────────────────────────────────
  "desk.reassign.addToIssue": "Add to issue {number}",
  "desk.reassign.makeStandalone": "Make standalone",
  "desk.reassign.addedToIssueToast": "Added to issue {number}.",
  "desk.reassign.madeStandaloneToast": "Now a standalone highlight.",
  "desk.reassign.failedToast": "That didn't save. Give it another try.",

  // ── NeedsStrip ───────────────────────────────────────────────────────────
  "desk.needsStrip.lateDue": "Late · due {due}",
  "desk.needsStrip.waitingOnYou": "Waiting on you",
  "desk.needsStrip.chase": "Chase",
  "desk.needsStrip.pickUp": "Pick it up",
  "desk.needsStrip.open": "Open",

  // ── DeskStats ────────────────────────────────────────────────────────────
  "desk.stats.inFlight": "in flight",
  "desk.stats.readyToLayOut": "ready to lay out",
  "desk.stats.behindSchedule": "behind schedule",
  "desk.stats.pitchesWaiting": "pitches waiting",

  // ── DeskToolbar ──────────────────────────────────────────────────────────
  "desk.toolbar.searchPlaceholder": "Search pieces, authors, sections…",
  "desk.toolbar.searchAria": "Search",
  "desk.toolbar.formatAria": "Format",
  "desk.toolbar.format.everything": "Everything",
  "desk.toolbar.format.articles": "Articles",
  "desk.toolbar.format.decks": "Decks",
  "desk.toolbar.myQueue": "My queue",
  "desk.toolbar.sortAria": "Sort",
  "desk.toolbar.sort.due": "Sort · due date",
  "desk.toolbar.sort.stage": "Sort · stage",
  "desk.toolbar.sort.section": "Sort · section",
  "desk.toolbar.shortcuts": "Shortcuts",

  // ── SavedViews ───────────────────────────────────────────────────────────
  "desk.savedViews.saveThisView": "Save this view",

  // ── PiecesPipeline ───────────────────────────────────────────────────────
  "desk.pipeline.emptyTitle": "The desk is clear",
  "desk.pipeline.emptyDescription": "Nothing matches that filter right now.",
  "desk.pipeline.columnPiece": "Piece",
  "desk.pipeline.columnStage": "Stage",
  "desk.pipeline.columnWaitingOn": "Waiting on",
  "desk.pipeline.columnDue": "Due",

  // ── PieceRow ─────────────────────────────────────────────────────────────
  "desk.pieceRow.newVoice": "New voice",
  "desk.pieceRow.writer": "Writer",
  "desk.pieceRow.you": "You",
  "desk.pieceRow.nobody": "Nobody",
  "desk.pieceRow.edit": "Edit",
  "desk.pieceRow.chase": "Chase",
  "desk.pieceRow.handOff": "Hand off",

  // ── PiecesBoard ──────────────────────────────────────────────────────────
  "desk.board.columnEmpty": "Empty",
  "desk.board.moveStageAria": "Move stage",

  // ── IssuePlan ────────────────────────────────────────────────────────────
  "desk.issuePlan.slotsFilled": "{filled} of {target} · {note}",
  "desk.issuePlan.slotsOpen_one": "{count} slot open",
  "desk.issuePlan.slotsOpen_other": "{count} slots open",
  "desk.issuePlan.full": "Full",
  "desk.issuePlan.commissionFor": "Commission for {section}",
  "desk.issuePlan.slidesCount_one": "{count} slide",
  "desk.issuePlan.slidesCount_other": "{count} slides",
  "desk.issuePlan.lateSuffix": " · late",

  // ── PitchInbox ───────────────────────────────────────────────────────────
  "desk.pitchInbox.heading": "Pitch inbox",
  "desk.pitchInbox.countLabel_one": "{count} pitch",
  "desk.pitchInbox.countLabel_other": "{count} pitches",
  "desk.pitchInbox.emptyTitle": "Inbox empty",

  // ── PitchRow ─────────────────────────────────────────────────────────────
  "desk.pitchRow.selectAria": "Select {title}",
  "desk.pitchRow.firstPitchSuffix": " · first pitch",
  "desk.pitchRow.betterAsDeck": "Better as a deck",
  "desk.pitchRow.commission": "Commission",
  "desk.pitchRow.maybe": "Maybe",
  "desk.pitchRow.pass": "Pass",

  // ── BulkTriageBar ────────────────────────────────────────────────────────
  "desk.bulkTriage.selected_one": "{count} pitch selected",
  "desk.bulkTriage.selected_other": "{count} pitches selected",
  "desk.bulkTriage.ariaLabel": "Bulk pitch triage",
  "desk.bulkTriage.clearSelection": "Clear selection",
  "desk.bulkTriage.maybe": "Maybe",
  "desk.bulkTriage.passKindly": "Pass, kindly",

  // ── DeskSidebar ──────────────────────────────────────────────────────────
  "desk.sidebar.issueStanding": "Where the issue stands",
  "desk.sidebar.noPiecesYet": "No pieces in the pipeline yet.",
  "desk.sidebar.editorLoad": "Editor load",
  "desk.sidebar.noEditorsYet": "No editors assigned yet.",
  "desk.sidebar.activity": "Activity",
  "desk.sidebar.nothingHereYet": "Nothing here yet.",
  "desk.sidebar.someone": "Someone",

  // ── DeskStates ───────────────────────────────────────────────────────────
  "desk.states.emptyIssueTitle": "Issue {number} is empty",
  "desk.states.emptyIssueDescription":
    "Nothing has been commissioned yet. Start the pipeline with your first piece.",
  "desk.states.commissionPiece": "Commission a piece",
  "desk.states.errorBand":
    "Could not reach the pipeline. Showing what we last had.",
  "desk.states.tryAgain": "Try again",

  // ── CommandPalette ───────────────────────────────────────────────────────
  "desk.palette.kindArticle": "Article",
  "desk.palette.kindDeck": "Deck",
  "desk.palette.kindAction": "Action",
  "desk.palette.newPiece": "New piece",
  "desk.palette.goToDesk": "Go to the desk",
  "desk.palette.ariaLabel": "Command palette",
  "desk.palette.searchPlaceholder": "Jump to a piece, or start a new one…",
  "desk.palette.searchAria": "Search the desk",
  "desk.palette.commandsAria": "Commands",
  "desk.palette.noResults": "Nothing matches “{query}”.",

  // ── DeskNotifications ────────────────────────────────────────────────────
  "desk.notifications.ariaLabel": "Desk notifications",
  "desk.notifications.sinceFriday": "Since Friday",
  "desk.notifications.subhead":
    "What happened on the desk while you were away.",
  "desk.notifications.empty":
    "You're all caught up. Nothing new since you last looked.",
  "desk.notifications.markAllRead": "Mark all as read",

  // ── MagazineDeskShell (the editor's left rail) ───────────────────────────
  "deskShell.issueEyebrow": "Issue {number} · {theme}",
  "deskShell.menuAria": "Magazine desk sections",
  "deskShell.nav.desk": "Desk",
  "deskShell.nav.pitches": "Pitches",
  "deskShell.nav.issue": "Issue",
  "deskShell.bellCountAria": "Since Friday: {count} new",
  "deskShell.openNow": "Open now",
  "deskShell.newPiece": "New piece",
  "deskShell.kbdHintSuffix": "to jump · ? for keys",
  "deskShell.backToPlatform": "Back to QueerPulse",

  // ── DeskModals (shared chrome across Commission/Pass/Chase/Handoff/Shortcuts) ──
  "desk.modals.cancel": "Cancel",
  "desk.modals.noteLabel": "Your note",
  "desk.modals.shortcuts.title": "Keyboard",
  "desk.modals.shortcuts.gotIt": "Got it",

  // ── CommissionModal ──────────────────────────────────────────────────────
  "desk.modals.commission.titleFromPitch": "Commission this pitch",
  "desk.modals.commission.titleFromScratch": "Write the brief",
  "desk.modals.commission.sendBrief": "Send the brief",
  "desk.modals.commission.bodyFromPitch":
    "You're commissioning {byline}'s pitch. Set the essentials below, and the brief goes straight to them.",
  "desk.modals.commission.bodyFromScratch":
    "Set the essentials below, and we'll get a brief in front of a writer.",
  "desk.modals.commission.angleLabel": "The angle",
  "desk.modals.commission.sectionLabel": "Section",
  "desk.modals.commission.wordsLabel": "Words",
  "desk.modals.commission.dueDateLabel": "Due date",
  "desk.modals.commission.feeLabel": "Fee",
  "desk.modals.commission.feePlaceholder": "e.g. €150",
  "desk.modals.commission.trackLabel": "Where it runs",
  "desk.modals.commission.trackHighlights": "Standalone",
  "desk.modals.commission.trackIssue": "Issue {number}",

  // ── PassModal ────────────────────────────────────────────────────────────
  "desk.modals.pass.title": "Pass on “{title}”",
  "desk.modals.pass.send": "Send it",
  "desk.modals.pass.body":
    "A pass lands easier with a real reason. Pick a starting point below, or write your own. Either way, the writer hears from a real person.",
  "desk.modals.pass.startingPoints": "Starting points",

  // ── ChaseModal (Phase 7 Wave F: embeds PieceThread, no separate compose step) ─
  "desk.modals.chase.title": "Chase {name}",
  "desk.modals.chase.body": "A quick, human nudge to keep things moving gently.",

  // ── HandoffModal ─────────────────────────────────────────────────────────
  "desk.modals.handoff.title": "Hand off",
  "desk.modals.handoff.cta": "Hand off",
  "desk.modals.handoff.body":
    "Hand “{title}” to another editor. They pick up right where you left off.",
  "desk.modals.handoff.toLabel": "To",

  // ── DeskView ─────────────────────────────────────────────────────────────
  "desk.view.notificationsAria": "Notifications",

  // ── EditorDashboardPage ──────────────────────────────────────────────────
  "desk.page.stubOpensLater": "Opens in a later release.",
  "desk.page.savingViewsUnavailable":
    "Saving custom views isn't available yet.",
  "desk.page.notificationsNotWired":
    "Notifications aren't wired to real navigation yet.",

  // ══════════════════ Piece record (Phase 2) ═══════════════════════════════
  // Brief/Care/Money/History/After. Record content (audit `what` text, letter
  // bodies, correction text, brief angle/wants/avoid/art, care subject notes,
  // safety-flag notes, sensitivity-read checklist labels, stage names) comes
  // from `record`/`DEMO_RECORD` — editorial-database content, not chrome — and
  // is deliberately left untranslated. Only platform-authored chrome (labels,
  // buttons, section titles, static copy) is translated below.

  // ── PieceRecordPage ──────────────────────────────────────────────────────
  "piece.header.backToDesk": "Back to the desk",
  "piece.header.openDraft": "Open the draft",
  "piece.header.publish": "Publish",
  "piece.header.publishToast": "Publishing arrives with issue production",
  "piece.header.formatArticle": "Article",
  "piece.header.formatDeck": "Deck",
  "piece.header.inAnIssue": "In an issue",
  "piece.header.notScheduled": "Not yet scheduled",
  "piece.header.notFoundTitle": "We couldn't open this piece",
  "piece.header.notFoundDescription":
    "It may have been removed, or the link is out of date.",

  // ── PieceTabsNav ─────────────────────────────────────────────────────────
  "piece.tabs.ariaLabel": "Piece record sections",
  "piece.tabs.brief": "Brief",
  "piece.tabs.care": "Care",
  "piece.tabs.money": "Money",
  "piece.tabs.history": "History",
  "piece.tabs.after": "After",

  // ── StageStepper ─────────────────────────────────────────────────────────
  "piece.stageStepper.heading": "Where it is",

  // ── PublishGateCard ──────────────────────────────────────────────────────
  "piece.gate.heading": "Publish gate",
  "piece.gate.notAdvisory":
    "The gate is not advisory. Nothing here can be overridden by one person alone.",
  "piece.gate.publish": "Publish",

  // ── MoneyMiniCard ────────────────────────────────────────────────────────
  "piece.moneyMini.heading": "Money",
  "piece.moneyMini.noFeeYet": "No fee agreed yet",
  "piece.moneyMini.statusAgreed": "Fee agreed",
  "piece.moneyMini.statusApprovedUnpaid": "Approved, unpaid",
  "piece.moneyMini.statusPaid": "Paid",
  "piece.moneyMini.openMoney": "Open money",

  // ── BriefTab ─────────────────────────────────────────────────────────────
  "piece.brief.noBriefYet": "No brief recorded yet.",
  "piece.brief.commissionHeading": "The commission",
  "piece.brief.commissioned": "Commissioned",
  "piece.brief.due": "Due",
  "piece.brief.noDateSet": "No date set",
  "piece.brief.length": "Length",
  "piece.brief.noTargetSet": "No target set",
  "piece.brief.filedAt": "Filed at",
  "piece.brief.notFiledYet": "Not filed yet",
  "piece.brief.fee": "Fee",
  "piece.brief.killFee": "Kill fee",
  "piece.brief.overWordsWarning":
    "Filed {count} words over the brief. Cut before layout, or move a section to the deck.",
  "piece.brief.whatWeAskedFor": "What we asked for",
  "piece.brief.avoidLabel": "Avoid.",
  "piece.brief.artLabel": "Art.",
  "piece.brief.sendToWriter": "Send to writer",
  "piece.brief.saveAsTemplate": "Save as template",
  "piece.brief.similarHeading": "We have run this before",
  "piece.brief.similarIssueBy": "· issue {issue} · {by}",
  "piece.brief.readButton": "Read",

  // ── MoneyTab ─────────────────────────────────────────────────────────────
  "piece.money.noPaymentYet": "No payment recorded yet.",
  "piece.money.feeHeading": "Fee",
  "piece.money.agreedFee": "Agreed fee",
  "piece.money.expenses": "Expenses",
  "piece.money.noneFiled": "None filed",
  "piece.money.invoice": "Invoice",
  "piece.money.notReceived": "Not received",
  "piece.money.filed": "Filed",
  "piece.money.notFiled": "Not filed",
  "piece.money.terms": "Terms",
  "piece.money.payBy": "Pay by",
  "piece.money.noDateSet": "No date set",
  "piece.money.unpaidWarning":
    "Approved but unpaid. Paying on time is the part of this job the community actually judges us on.",
  "piece.money.markForPayment": "Mark for payment",
  "piece.money.tellTheWriter": "Tell the writer",

  // ── CareTab + CareSubjectRow ─────────────────────────────────────────────
  "piece.care.heading": "Care and consent",
  "piece.care.noCareRecordYet":
    "No care record has been started for this piece yet.",
  "piece.care.sensitivityReadHeading": "Sensitivity read",
  "piece.care.readerMeta": "{role} · asked {askedOn} · due {dueOn}",
  "piece.care.readProgress":
    "{done} of {total} · a read is not a rubber stamp. {reader} can send it back at any point.",
  "piece.care.nudgeReader": "Nudge the reader",
  "piece.care.nudgedToast": "Nudged {reader}.",
  "piece.care.askSecondReader": "Ask a second reader",
  "piece.care.secondReaderToast": "Asked for a second reader.",
  "piece.care.noReadRequestedYet":
    "No sensitivity read has been requested yet.",
  "piece.care.askForRead": "Ask for a sensitivity read",
  "piece.care.askForReadToast": "Asked for a sensitivity read.",
  "piece.care.peopleHeading": "People in this piece",
  "piece.care.peopleSubline":
    "Consent is collected per person, row by row. Publish is blocked until every row is settled.",
  "piece.care.contentNotesHeading": "Content notes",
  "piece.care.contentNotesSubline":
    "Shown to readers above the piece. Written by the author, checked by you.",
  "piece.care.addContentNote": "Add",
  "piece.care.contentNoteAddedToast": "Content note added.",
  "piece.care.safetyFlagsHeading": "Safety flags",
  "piece.care.flagged": "Flagged",
  "piece.care.clear": "Clear",
  "piece.care.consentGiven": "Consented",
  "piece.care.consentPending": "Consent pending",
  "piece.care.consentPseudonym": "Pseudonym",
  "piece.care.rightOfReply": "Right of reply · {reply}",
  "piece.care.named": "Named",
  "piece.care.outPublicly": "Out publicly",
  "piece.care.quotesReadBack": "Quotes read back",
  "piece.care.sendConsentForm": "Send consent form",
  "piece.care.consentFormSentToast": "Sent a consent form to {name}.",

  // ── HistoryTab ───────────────────────────────────────────────────────────
  "piece.history.heading": "Everything that happened",
  "piece.history.unknownActor": "Unknown",
  "piece.history.footer":
    "State changes, publishes and restores are kept for the life of the magazine.",

  // ── AfterTab ─────────────────────────────────────────────────────────────
  "piece.after.lettersHeading": "Letters",
  "piece.after.noLettersYet": "No letters from readers yet.",
  "piece.after.sendToAuthor": "Send to author",
  "piece.after.sendToAuthorToast": "Messaging your author isn't wired up yet.",
  "piece.after.runInLetters": "Run in letters",
  "piece.after.removeFromLetters": "Remove from letters",
  "piece.after.correctionsHeading": "Corrections",
  "piece.after.correctionPublished": "Published {date}",
  "piece.after.correctionFiled": "Filed {date}",
  "piece.after.correctionsFooter":
    "A correction is published as a dated note at the foot of the piece. We never edit silently.",
  "piece.after.correctionAriaLabel": "Correction text",
  "piece.after.correctionPlaceholder": "What was wrong, and what is right.",
  "piece.after.publishCorrection": "Publish correction",
  "piece.after.notifyPeopleNamed": "Notify the people named",

  // ══════════════════ Submit Story wizard ══════════════════════════════════
  // `INITIAL_DRAFT` (the example headline/byline/deck/body) is left as
  // English mock content — a first-person example essay, not chrome.

  // ── SubmitStoryIntro ───────────────────────────────────────────────────
  "submitStory.intro.eyebrow": "Pitch a story",
  "submitStory.intro.title": "Got something <em>worth telling?</em>",
  "submitStory.intro.lead":
    "The QueerPulse magazine is written by the community. You don't need a byline or an agent: just a story that matters and an honest way of telling it.",
  "submitStory.intro.lookingFor.specific.title":
    "The specific over the general",
  "submitStory.intro.lookingFor.specific.body":
    "One supper club, one street, one afternoon. We trust the small story to carry the big one.",
  "submitStory.intro.lookingFor.beyond.title": "Lisbon and beyond",
  "submitStory.intro.lookingFor.beyond.body":
    "Rooted here, but we publish diaspora and visitor voices too. Place matters; borders less so.",
  "submitStory.intro.lookingFor.pay.title": "We pay, always",
  "submitStory.intro.lookingFor.pay.body":
    'Every published piece is paid fairly: rates shared upfront, no "exposure" ever.',
  "submitStory.intro.stepsHeading": "What happens next",
  "submitStory.intro.step.reply":
    "A reply within two weeks: yes, no, or let's talk.",
  "submitStory.intro.step.assigned":
    "If it's a yes, an editor is assigned and you agree a rate and deadline.",
  "submitStory.intro.step.copyright":
    "You keep the copyright. We only license it.",

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
  "submitStory.sidebar.guideline.language.detail": "We publish both.",
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
    "You'll hear from us by <strong>{date}</strong>: yes, no, or let's talk.",
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
  "submitStory.writer.autosaved": "Draft saved",
  "submitStory.writer.saving": "Saving…",
  "submitStory.writer.unsaved": "Not saved",
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
  "submitStory.editor.draftSaved": "Draft saved. It'll be here when you come back.",
  "submitStory.editor.draftSaveError":
    "We couldn't save your draft. Your browser may be blocking storage.",
  "submitStory.resume.text":
    "You left a story unfinished. <b>Pick up where you left off?</b>",
  "submitStory.resume.startFresh": "Start fresh",
  "submitStory.resume.resume": "Resume draft",
  "submitStory.editor.chooseSectionError":
    "Choose a section for your piece first.",
  "submitStory.editor.needHeadlineError":
    "Your story needs a headline before it goes to editors.",
  "submitStory.editor.minWordsError":
    "A little more to go: at least {min} words before you submit.",
  "submitStory.editor.submitError":
    "Couldn't submit your story right now. Please try again.",
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
  "submitStory.cover.progressLabel": "Cover upload progress",
  "submitStory.cover.errorFallback":
    "We couldn't add that cover. Please try again.",

  // ── submitStory.data.ts: ISSUE (the open-for-submissions issue record) ──
  "submitStory.issue.badge": "Issue {number}",
  "submitStory.issue.name": "{monthYear} issue · Open for submissions",
  "submitStory.issue.deadline": "Submission deadline: {date}",

  // ══════════════════ Pitch Tracker ═════════════════════════════════════════
  // PitchCard/PitchStages statusLabel/stage labels: RESOLVED this pass —
  // `Pitch`/`PitchStage` were reshaped to carry `statusLabelKey`/`labelKey`
  // (label-key indirection), and both the mock `PITCHES` array and the live
  // `submissionToPitch` adapter (magazine.adapters.tsx) now emit stable
  // catalog keys instead of pre-resolved English strings; components resolve
  // via `t()`. `pitchTracker.stage.*` is shared vocabulary between mock and
  // live; `pitchTracker.pitch.<id>.statusLabel` is mock-only (pitch-specific
  // demo copy); `pitchTracker.statusLabel.*` is the live adapter's generic
  // per-`SubmissionStatus` set. PitchAction `actions[].label` (e.g. "Message
  // Marta", "14 comments") remains unswept — content/chrome-mixed and
  // name/count-fused, not a clean label-key case.

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
  "pitchTracker.page.stubToast": "{label}: coming soon in this prototype",

  // ── Shared stage-rail vocabulary (PitchStages.tsx) ──────────────────────
  "pitchTracker.stage.pitched": "Pitched",
  "pitchTracker.stage.accepted": "Accepted",
  "pitchTracker.stage.firstDraft": "First draft",
  "pitchTracker.stage.firstEdit": "First edit",
  "pitchTracker.stage.layOut": "Lay out",
  "pitchTracker.stage.published": "Published",
  "pitchTracker.stage.inReview": "In review",
  "pitchTracker.stage.decision": "Decision",
  "pitchTracker.stage.draft": "Draft",
  "pitchTracker.stage.edit": "Edit",
  "pitchTracker.stage.out": "Out",
  "pitchTracker.stage.reviewed": "Reviewed",
  "pitchTracker.stage.closed": "Closed",

  // ── Live submissionToPitch adapter's generic per-status labels ──────────
  "pitchTracker.statusLabel.draft": "Draft",
  "pitchTracker.statusLabel.submitted": "Submitted · awaiting review",
  "pitchTracker.statusLabel.inReview": "In review",
  "pitchTracker.statusLabel.accepted": "Accepted",
  "pitchTracker.statusLabel.published": "Published",
  "pitchTracker.statusLabel.rejected": "Not accepted this issue",

  // ── Mock PITCHES per-pitch statusLabel (demo-only, pitch-specific copy) ──
  "pitchTracker.pitch.pharmacist.statusLabel": "In edit · w/ Marta",
  "pitchTracker.pitch.fourDayWeek.statusLabel": "In review",
  "pitchTracker.pitch.commissionedMap.statusLabel": "Commissioned",
  "pitchTracker.pitch.hostingBadly.statusLabel": "Published",
  "pitchTracker.pitch.risoPrinting.statusLabel": "Published",
  "pitchTracker.pitch.oweOurExes.statusLabel": "Not this issue · close fit",

  // ══════════════════ PrintOrderModal (Issue 09 print run) ══════════════════
  "printOrder.dialogAria": "Order the print edition",
  "printOrder.closeAria": "Close",
  "printOrder.success.title": "It's on its <em>way to you.</em>",
  "printOrder.success.body_one":
    "{count} copy of <b>{issue}</b> reserved from the print run. We'll email <b>{email}</b> when it ships from Marvila, usually within a week. Thank you for funding the next issue's contributors.",
  "printOrder.success.body_other":
    "{count} copies of <b>{issue}</b> reserved from the print run. We'll email <b>{email}</b> when it ships from Marvila, usually within a week. Thank you for funding the next issue's contributors.",
  "printOrder.success.doneCta": "Done",
  "printOrder.eyebrow": "Print edition · {issue}",
  "printOrder.title": "Order the <em>print run.</em>",
  "printOrder.lead":
    "{pages} pages, risograph cover, printed in Marvila. <b>€{price} at cost</b>. Proceeds fund the next issue's contributors.",
  "printOrder.copiesLabel": "Copies",
  "printOrder.fewerCopiesAria": "Fewer copies",
  "printOrder.moreCopiesAria": "More copies",
  "printOrder.emailFieldLabel": "Email for shipping updates",
  "printOrder.emailFieldHelper":
    "We only use this to tell you when your copy ships.",
  "printOrder.emailPlaceholder": "you@example.com",
  "printOrder.cancelCta": "Cancel",
  "printOrder.placingCta": "Placing your order…",
  "printOrder.placeCta": "Place order: €{total}",

  // ══════════════════ Story showcase pages ══════════════════════════════════
  // StoryPage/StoryTomasPage/StorySafetyPage + their *Article components are
  // full standalone magazine features (headline, byline name, category tag,
  // read time, article body, quotes, author bios) — editorial content, same
  // treatment as `data/articles.tsx`. Only the connecting byline word, the
  // shared "more from the community" heading, the profile-link CTA and the
  // closing Outro CTAs are platform chrome, translated below.
  "story.wordsBy": "Words by",
  "story.moreHeading": "More from <em>the community</em>",
  "story.viewProfileCta": "View profile",
  "story.outro.studio.title":
    "Want to be part of what <em>gets written about next?</em>",
  "story.outro.studio.sub":
    "The stories are about the people in the room. Join us.",
  "story.outro.tomas.title":
    "Want to join Tomás's table? <em>Join the room first.</em>",
  "story.outro.tomas.sub":
    "The supper club, the network, the gatherings: it all starts with an invitation from someone who knows you.",
  "story.outro.safety.title": "Read it and think it sounds <em>right?</em>",
  "story.outro.safety.sub":
    "We're not for everyone. But if this resonates, you might be for us.",
  // Byline author for the safety piece — the platform team, not an individual
  // writer, so it is chrome and translated (read time and date stay editorial).
  "story.safety.byline": "The QueerPulse team",

  // ══════════════════ Article editor (ArticleEditorPage + desk/editor/*) ═══
  // Chrome for the block-based article-writing surface. The headline/
  // standfirst RichText content, every block's own html (paragraph/heading/
  // pullQuote/quote/image caption/qa/stats), and the DEMO_ARTICLE fixture
  // (blocks, versions, comments) are editorial CONTENT — deliberately left
  // untranslated, same treatment as the rest of this file. Only the editor's
  // own UI — labels, buttons, placeholders, empty states, aria-labels,
  // block-kind names, and toast stubs — is translated below.

  // ── ArticleEditorHeader / ArticleEditorPage ──────────────────────────────
  "write.header.backAria": "Back to the piece record",
  "write.header.untitled": "Untitled draft",
  "write.header.unsectioned": "Unsectioned",
  "write.header.subtitle": "Article · {section} · {issue} · {saved}",
  "write.header.viewLabel": "View",
  "write.header.sendOn": "Send on",
  "write.header.sendOnTo": "Send to {stage}",
  "write.header.publish": "Publish",
  "write.header.unpublish": "Unpublish",
  "write.header.statusPublished": "Published",
  "write.header.statusScheduled": "Scheduled",
  "write.header.statusDraft": "Draft",
  "write.header.publishedToast": "Article published",
  "write.header.scheduledToast": "Article scheduled",
  "write.header.unpublishedToast": "Article unpublished",
  "write.header.publishError": "Couldn't publish, try again",
  "write.header.publishNotReadyError":
    "Add a standfirst and alt text on every image before publishing.",
  "write.header.savedSaving": "Saving…",
  "write.header.savedError": "Couldn't save, will retry",
  "write.header.savedOk": "All changes saved",
  "write.header.issueScheduled": "Scheduled in an issue",

  // ── Draft/Shape/Read mode seg (editorMode.ts) ────────────────────────────
  "write.mode.draft": "Draft",
  "write.mode.shape": "Shape",
  "write.mode.read": "Read",

  // ── ArticleEditorStatus ───────────────────────────────────────────────────
  "write.status.notFoundTitle": "This draft couldn't be found",

  // ── ArticleDocument ───────────────────────────────────────────────────────
  "write.document.headlinePlaceholder": "Headline",
  "write.document.standfirstPlaceholder":
    "Standfirst: the one or two sentences under the headline",
  "write.document.addBlockHint": "or type / in an empty paragraph",

  // ── Block kinds (blockKinds.ts is not a component — these are translated
  // at each render site: SlashMenu, ArticleDocument's add-bar, and the block
  // type tag in ArticleBlockEditor) ────────────────────────────────────────
  "write.blockKind.paragraph.label": "Paragraph",
  "write.blockKind.paragraph.hint": "Text",
  "write.blockKind.heading.label": "Section heading",
  "write.blockKind.heading.hint": "H2",
  "write.blockKind.pullQuote.label": "Pull quote",
  "write.blockKind.pullQuote.hint": "Display",
  "write.blockKind.quote.label": "Attributed quote",
  "write.blockKind.quote.hint": "Cited",
  "write.blockKind.image.label": "Image",
  "write.blockKind.image.hint": "Upload",
  "write.blockKind.qa.label": "Interview Q&A",
  "write.blockKind.qa.hint": "Pair",
  "write.blockKind.stats.label": "Stat row",
  "write.blockKind.stats.hint": "Numbers",

  // ── ArticleBlockEditor ────────────────────────────────────────────────────
  "write.block.moveUpAria": "Move block up",
  "write.block.moveDownAria": "Move block down",
  "write.block.removeAria": "Remove block",
  "write.block.paragraphPlaceholder": "Write, or press / for a block",
  "write.block.headingPlaceholder": "Section heading",
  "write.block.pullQuotePlaceholder": "Pull quote",

  // ── ArticleBlockKindFields ────────────────────────────────────────────────
  "write.block.quotePlaceholder": "Quoted speech",
  "write.block.attributionPlaceholder": "Attribution",
  "write.block.attributionAria": "Quote attribution",
  "write.block.questionPlaceholder": "Question",
  "write.block.whoPlaceholder": "Who's answering",
  "write.block.whoAria": "Interview subject name",
  "write.block.answerPlaceholder": "Answer",
  "write.block.statValuePlaceholder": "61%",
  "write.block.statLabelPlaceholder": "Label",
  "write.block.statValueAria": "Stat {number} value",
  "write.block.statLabelAria": "Stat {number} label",
  "write.block.statRemoveAria": "Remove stat {number}",
  "write.block.addStat": "Add stat",
  "write.block.imageUrlLabel": "Image URL",

  // ── ImageBlockControls ────────────────────────────────────────────────────
  "write.image.altLabel": "Alt text",
  "write.image.altError": "Required for screen readers and captions.",
  "write.image.tintLabel": "Tint",
  "write.image.tintAria": "Tint: {tint}",
  "write.image.tint.coral": "Coral",
  "write.image.tint.jade": "Jade",
  "write.image.tint.plum": "Plum",
  "write.image.tint.violet": "Violet",
  "write.image.creditLabel": "Credit",
  "write.image.creditError": "Required before this ships.",
  "write.image.rightsLabel": "Rights",
  "write.image.rights.commissioned": "Commissioned",
  "write.image.rights.licensed": "Licensed",
  "write.image.rights.courtesy": "Courtesy",
  "write.image.rights.cc": "Creative Commons",
  "write.image.cropAria": "Crop ratio",
  "write.image.focalAria": "Focal point: {x}% horizontal, {y}% vertical",
  "write.image.captionPlaceholder": "Caption",

  // ── SelectionToolbar ──────────────────────────────────────────────────────
  "write.selection.toolbarAria": "Text formatting",
  "write.selection.emphasis": "Emphasis",
  "write.selection.strong": "Strong",
  "write.selection.link": "Link",

  // ── PublishRail ────────────────────────────────────────────────────────────
  "write.publish.title": "Publish",
  "write.publish.whenLabel": "When it ships",
  "write.publish.now": "Now",
  "write.publish.schedule": "Schedule",
  "write.publish.withIssue": "With issue",
  "write.publish.scheduleLabel": "Publish at",
  "write.publish.scheduleNote": "Publishes automatically at the date and time you pick.",
  "write.publish.scheduleInvalid": "Pick a date and time in the future.",
  "write.publish.issueNote": "Ships automatically when its issue goes out.",
  "write.publish.checklistHeading": "Before it ships · {done}/{total}",
  "write.publish.cta": "Publish",
  "write.publish.scheduleCta": "Schedule",
  "write.publish.unpublishCta": "Unpublish",
  "write.publish.checklist.standfirst": "Standfirst written",
  "write.publish.checklist.alts": "Alt text on every image",
  "write.publish.checklist.altsPending": "Alt text on every image (none yet)",
  "write.publish.checklist.sensitivity":
    "Sensitivity read: handled in the piece record",
  "write.publish.checklist.source": "Source line on the stat row (optional)",

  // ── ArticleMetaRail ────────────────────────────────────────────────────────
  "write.meta.title": "Piece meta",
  "write.meta.sectionLabel": "Section",
  "write.meta.bylineLabel": "Byline",
  "write.meta.bylineHelper": "Set on the piece record's Brief tab.",
  "write.meta.roleLabel": "Role",
  "write.meta.roleHelper": "A credit-line qualifier, e.g. “Contributing editor”.",
  "write.meta.tagsLabel": "Tags",
  "write.meta.tagsHelper": "Comma-separated.",
  "write.meta.slugLabel": "Slug",
  "write.meta.slugHelper": "Server-generated.",
  "write.meta.metaDescriptionLabel": "Meta description",
  "write.meta.metaDescriptionHelper":
    "Shown in search results and link previews. Optional.",
  "write.meta.socialImageLabel": "Social image",
  "write.meta.socialImageHelper": "Image URL used when this article is shared. Optional.",
  "write.meta.canonicalUrlLabel": "Canonical URL",
  "write.meta.canonicalUrlHelper":
    "Only set this if the article is republished from elsewhere. Optional.",
  "write.meta.wordCountLabel": "Word count",
  "write.meta.readTimeLabel": "Read time",

  // ── NotesRail ────────────────────────────────────────────────────────────
  "write.notes.title": "Notes",
  "write.notes.loading": "Loading notes…",
  "write.notes.empty": "No notes on this draft.",
  "write.notes.you": "You",
  "write.notes.reply": "Reply",
  "write.notes.resolve": "Resolve",
  "write.notes.reopen": "Reopen",
  "write.notes.resolvedChip": "Resolved",
  "write.notes.addAria": "Add a note",
  "write.notes.addPlaceholder": "Leave a note on this draft…",
  "write.notes.addCta": "Add note",
  "write.notes.addToast": "Note added.",
  "write.notes.replyAria": "Reply to {who}",
  "write.notes.replyPlaceholder": "Write a reply…",
  "write.notes.replySend": "Send reply",
  "write.notes.replyToast": "Reply added.",
  "write.notes.resolveToast": "Marked as resolved.",
  "write.notes.reopenToast": "Reopened.",

  // ── VersionsRail (Phase 7 Wave E — snapshot + restore + diff) ─────────────
  "write.versions.title": "History",
  "write.versions.loading": "Loading versions…",
  "write.versions.empty": "No earlier versions recorded.",
  "write.versions.you": "You",
  "write.versions.saveCta": "Save a version",
  "write.versions.saveToast": "Version saved.",
  "write.versions.manualSaveLabel": "Saved manually",
  "write.versions.compare": "Compare",
  "write.versions.restore": "Restore",
  "write.versions.restoreToast": "Restored \"{label}\".",
  "write.versions.restoredFromLabel": "Restored from {label}",
  "write.versions.restoreModal.title": "Restore \"{label}\"?",
  "write.versions.restoreModal.body":
    "Restore this version? Your current draft is saved first, so nothing is lost.",
  "write.versions.restoreModal.cancel": "Cancel",
  "write.versions.restoreModal.confirm": "Restore this version",
  "write.versions.restoreModal.restoring": "Restoring…",
  "write.versions.diff.title": "Compare versions",
  "write.versions.diff.sub": "\"{label}\" by {author} · {when}",
  "write.versions.diff.loading": "Loading version…",
  "write.versions.diff.error": "Couldn't load this version.",
  "write.versions.diff.empty": "Nothing to compare. This version has no blocks.",
  "write.versions.diff.before": "This version",
  "write.versions.diff.now": "Current draft",
  "write.versions.diff.status.unchanged": "Unchanged",
  "write.versions.diff.status.changed": "Changed",
  "write.versions.diff.status.added": "Added since",
  "write.versions.diff.status.removed": "Removed since",

  // ══════════════════ Issue production (Phase 5) ═══════════════════════════
  // IssueProductionPage + desk/issue/* — running order, cover & contents,
  // digest & social, ship checklist/modal, archive search. Piece titles,
  // sections, blurbs and archive rows are data, not chrome, and are left
  // untranslated same as the rest of the desk.

  // ── IssueProductionPage header + not-found state ────────────────────────
  "issue.header.backToDesk": "Back to the desk",
  "issue.header.notFoundTitle": "Issue not found",
  "issue.header.notFoundDescription":
    "This issue isn't in production yet, or the number doesn't match one on the desk.",
  "issue.header.title": "Issue {number} · {theme}",
  "issue.header.laidOut": "{ready} of {total} laid out",
  "issue.header.proof": "Proof",
  "issue.header.proofToast": "Proof PDF generated for the printer",

  // ── ShipChecklistCard + ShipIssueModal ──────────────────────────────────
  "issue.ship.cta": "Ship the issue",
  "issue.ship.checklistHeading": "Ship checklist",
  "issue.ship.modalTitle": "Ship issue {number}?",
  "issue.ship.modalSubWithDate":
    "Pieces publish together at 09:00 on {date}, in the running order you set. The digest goes at the same moment.",
  "issue.ship.modalSubNoDate":
    "Pieces publish together at 09:00, in the running order you set. The digest goes at the same moment.",
  "issue.ship.notYet": "Not yet",
  "issue.ship.shipIt": "Ship it",
  "issue.ship.warnNote":
    "Pieces still behind the publish gate will hold and publish later. The issue does not wait for them.",

  // ── IssueTabsNav ─────────────────────────────────────────────────────────
  "issue.tabs.ariaLabel": "Issue production sections",
  "issue.tabs.runningOrder": "Running order",
  "issue.tabs.coverContents": "Cover & contents",
  "issue.tabs.digestSocial": "Digest & social",
  "issue.tabs.archive": "Archive",

  // ── PagesCard ────────────────────────────────────────────────────────────
  "issue.pages.heading": "Pages",
  "issue.pages.editorial": "Editorial",
  "issue.pages.total": "Total",
  "issue.pages.spare_one": "{count} page spare",
  "issue.pages.spare_other": "{count} pages spare",

  // ── RunningOrderTab ──────────────────────────────────────────────────────
  "issue.runOrder.deckNoPageCount": "Deck: no page count",
  "issue.runOrder.pagesPrefix": "pp. {pages}",
  "issue.runOrder.laidOut": "Laid out",
  "issue.runOrder.inLayout": "In layout",
  "issue.runOrder.moveEarlierAria":
    "Move “{title}” earlier in the running order",
  "issue.runOrder.moveLaterAria": "Move “{title}” later in the running order",
  "issue.runOrder.open": "Open",

  // ── CoverContentsTab ─────────────────────────────────────────────────────
  "issue.cover.heading": "Cover",
  "issue.cover.artPlaceholder": "Cover art",
  "issue.cover.imageUrlLabel": "Cover image URL",
  "issue.cover.imageUrlPlaceholder": "https://…",
  "issue.cover.coverlineLabel": "Coverline {n}",
  "issue.cover.hint": "Coverlines are not headlines. Shorter, flatter, no puns.",
  "issue.contents.heading": "Contents",
  "issue.contents.blurbLabel": "Contents blurb",
  "issue.contents.blurbPlaceholder": "One sentence, written by the desk.",

  // ── DigestSocialTab ──────────────────────────────────────────────────────
  "issue.digest.heading": "Members' digest",
  "issue.digest.hint":
    "Goes out at 09:00 on the day the issue publishes. Order here is the order in the email.",
  "issue.digest.includeAria": "Include “{title}” in the members' digest",
  "issue.digest.editBlurbAria": "Edit digest blurb for “{title}”",
  "issue.digest.save": "Save",
  "issue.digest.cancel": "Cancel",
  "issue.digest.edit": "Edit",
  "issue.digest.sendTest": "Send me a test",
  "issue.digest.sendTestToast": "A test digest is on its way to your inbox.",
  "issue.digest.sendTestError": "We couldn't send the test digest. Please try again.",
  "issue.digest.scheduleWithIssue": "Schedule with the issue",
  "issue.digest.scheduledWithIssue": "Scheduled with the issue",
  "issue.digest.scheduleToast": "The digest will go out with the issue.",
  "issue.digest.scheduleOffToast": "The digest will no longer go out automatically with this issue.",
  "issue.digest.alreadySent": "Sent to subscribers on {date}",
  "issue.digest.socialHeading": "Social out",
  "issue.digest.socialAltHint":
    "Alt text is copied from the image, so it's always filled in.",

  // ── ArchiveTab ───────────────────────────────────────────────────────────
  "issue.archive.heading": "Archive",
  "issue.archive.emptyTitle": "No archive to search yet",
  "issue.archive.emptyDescription":
    "Past issues will show up here once they're indexed. Checked automatically at commission time.",
  "issue.archive.searchPlaceholder": "Have we run this before?",
  "issue.archive.searchAria":
    "Search the magazine archive by title, byline or tag",
  "issue.archive.noMatches": "Nothing matches “{query}”.",
  "issue.archive.entryMeta": "issue {issue} · {by} · {tags}",
  "issue.archive.read": "Read",
  "issue.archive.readToast": "Opening “{title}” isn't wired up yet.",
  "issue.archive.checkedAutomatically": "Checked automatically at commission time.",

  // ══════════════════ Writer workspace (Phase 6) ═══════════════════════════
  // `/magazine/writer` — a contributor's own scoped view of their
  // assignments, pitches and payments. Record content (assignment titles,
  // notes, section names, stage/state labels, pitch and payment status text)
  // arrives from the API as editorial-database prose and is deliberately
  // left untranslated, same judgement as the editor desk above. Only
  // platform-authored chrome is translated below.

  // ── WriterWorkspacePage ──────────────────────────────────────────────────
  "writer.tabs.work": "Your work",
  "writer.tabs.pitches": "Your pitches",
  "writer.tabs.payments": "Payments",
  "writer.tabs.ariaLabel": "Writer workspace tabs",
  "writer.page.errorTitle": "Your workspace didn't load",
  "writer.page.errorDescription":
    "Something went wrong fetching your assignments. Try refreshing the page.",

  // ── AssignmentCard ───────────────────────────────────────────────────────
  "writer.work.emptyTitle": "No assignments yet",
  "writer.work.emptyDescription":
    "When an editor commissions you, it shows up here.",
  "writer.work.dueLabel": "Due",
  "writer.work.noDateSet": "No date set",
  "writer.work.lengthLabel": "Length",
  "writer.work.length": "{words} / {target} words",
  "writer.work.notFiledYet": "Not filed yet",
  "writer.work.feeLabel": "Fee",
  "writer.work.paymentLabel": "Payment",
  "writer.work.fileDraft": "File a draft",
  "writer.work.readBrief": "Read the brief",
  "writer.work.readBriefToast":
    "The full brief lives on the piece record. Coming soon here.",
  "writer.work.messageEditor": "Message editor",
  "writer.work.activeBadge": "Active",
  "writer.work.setActive": "Use for byline & terms",

  // ── BriefDetailModal ─────────────────────────────────────────────────────
  "writer.brief.title": "Brief — {title}",
  "writer.brief.angleLabel": "Angle",
  "writer.brief.wantsLabel": "What we want",
  "writer.brief.emptyWants": "No specific asks noted.",
  "writer.brief.avoidLabel": "What to avoid",
  "writer.brief.wordCountLabel": "Target length",
  "writer.brief.rateLabel": "Rate",
  "writer.brief.killFeeLabel": "Kill fee",
  "writer.brief.commissionedByLabel": "Commissioned by",
  "writer.brief.commissionedOnLabel": "Commissioned on",
  "writer.brief.noBrief": "No brief has been written for this piece yet.",
  "writer.brief.close": "Close",

  // ── WriterPitchesTab ─────────────────────────────────────────────────────
  "writer.pitches.emptyTitle": "No pitches yet",
  "writer.pitches.emptyDescription":
    "Send one below. A person reads every pitch, and answers within 5 days.",
  "writer.pitches.sentMeta": "Sent {sent} · answered within 5 days",
  "writer.pitches.formHeading": "Pitch something",
  "writer.pitches.titleLabel": "Working title",
  "writer.pitches.titlePlaceholder": "What's the piece called, roughly?",
  "writer.pitches.noteLabel": "What it is",
  "writer.pitches.notePlaceholder": "The idea, why now, and who it's for.",
  "writer.pitches.send": "Send it",

  // ── WriterPaymentsTab ────────────────────────────────────────────────────
  "writer.payments.emptyTitle": "No payments yet",
  "writer.payments.emptyDescription":
    "Once a piece is filed and approved, its payment shows up here.",
  "writer.payments.issueLabel": "Issue {issue}",
  "writer.payments.unscheduled": "Unscheduled",
  "writer.payments.terms":
    "21-day terms. If we're late, it says so here before you have to ask.",

  // ── AgreedTermsCard ──────────────────────────────────────────────────────
  "writer.terms.heading": "What you agreed to",
  "writer.terms.body":
    "Every commission carries the same terms: fee, kill fee, deadline, and what happens if the piece changes shape.",
  "writer.terms.killFeeLabel": "Kill fee",
  "writer.terms.rightsLabel": "Rights",
  "writer.terms.editsLabel": "Edits",
  "writer.terms.emptyState": "No active commission yet. Terms show up once you have one.",

  // ── BylineSafetyCard ─────────────────────────────────────────────────────
  "writer.byline.heading": "Your safety",
  "writer.byline.body":
    "You choose the byline on every piece, and can change it up to the moment it publishes.",
  "writer.byline.fieldLabel": "Byline for “{title}”",
  "writer.byline.anonymous": "Anonymous",
  "writer.byline.emptyState": "No active assignment to set a byline for yet.",

  // ── FileDraftModal ───────────────────────────────────────────────────────
  "writer.fileDraft.title": "File “{title}”",
  "writer.fileDraft.cancel": "Cancel",
  "writer.fileDraft.submit": "File it",
  "writer.fileDraft.body":
    "Paste it, drop a document, or write it here. It arrives on the desk as clean blocks, ready to edit.",
  "writer.fileDraft.fieldLabel": "Draft",
  "writer.fileDraft.fieldHelper":
    "Uploading a document is coming soon. Pasting works today.",
  "writer.fileDraft.placeholder": "Paste your draft here…",
  "writer.fileDraft.wordCountWithTarget":
    "Word count is checked against your brief ({target} words). Over is fine.",
  "writer.fileDraft.wordCountNoTarget":
    "Word count is checked against your brief. Over is fine.",

  // ── MessageEditorModal (Phase 7 Wave F) ─────────────────────────────────
  "writer.messages.title": "Messages · {title}",

  // ── EditorMessageCard ("From your editor" rail card, Phase 7 Wave F) ───
  "writer.editorMessage.heading": "From your editor",
  "writer.editorMessage.fromLabel": "{name}",
  "writer.editorMessage.loading": "Loading…",
  "writer.editorMessage.noMessagesYet": "No messages yet. Say hello.",
  "writer.editorMessage.emptyState": "No active commission yet.",

  // ── PieceThread (shared editor↔writer message thread, Phase 7 Wave F) ──
  "pieceThread.you": "You",
  "pieceThread.emptyTitle": "No messages yet",
  "pieceThread.emptyDescription": "Say hello. Chases and questions live here now, instead of email.",
  "pieceThread.errorState": "Couldn't load this thread. Try again in a moment.",
  "pieceThread.composerAria": "Message",
  "pieceThread.composerPlaceholder": "Write a message…",
  "pieceThread.send": "Send",
  "pieceThread.sentToast": "Message sent.",

  // ══════════════════ Apply to write ═══════════════════════════════════════
  "applyToWrite.intro.eyebrow": "Write for us",
  "applyToWrite.intro.title": "Show us <em>what you've got.</em>",
  "applyToWrite.intro.lead":
    "Every story that reaches an editor starts here. Tell us why you want to write for QueerPulse and share a sample of your writing: pasted in, or a link to something you've already published.",
  "applyToWrite.form.pitchNoteLabel": "Why do you want to write for us?",
  "applyToWrite.form.pitchNotePlaceholder": "A sentence or two is plenty.",
  "applyToWrite.form.sampleTextLabel": "Paste a writing sample",
  "applyToWrite.form.sampleTextPlaceholder": "Paste a piece of your writing here.",
  "applyToWrite.form.sampleLinkLabel": "…or link to something you've published",
  "applyToWrite.form.sampleLinkPlaceholder": "https://",
  "applyToWrite.form.sampleRequiredError":
    "Include a writing sample: paste some text or add a link.",
  "applyToWrite.form.submitCta": "Send application",
  "applyToWrite.form.submittingCta": "Sending…",
  "applyToWrite.form.submitError": "Something went wrong. Try again.",
  "applyToWrite.pending.title": "Your application is <em>under review.</em>",
  "applyToWrite.pending.body":
    "An editor will read your sample and get back to you. This usually takes a couple of weeks.",
  "applyToWrite.declined.title": "Not this time",
  "applyToWrite.declined.body": "Thanks for applying. This one wasn't a fit.",
  "applyToWrite.declined.reviewNoteLabel": "From the editors:",
  "applyToWrite.declined.reapplyCta": "Apply again",
  "applyToWrite.approved.title": "You're a QueerPulse writer",
  "applyToWrite.approved.body":
    "Your application was approved. Head over to the submission page to send your first pitch.",
  "applyToWrite.approved.cta": "Start writing",
  "applyToWrite.backCta": "Back to the magazine",

  // ── ArticleComments (comments/) — CNT-10 reader comments ────────────────
  "comments.heading_one": "{count} comment",
  "comments.heading_other": "{count} comments",
  "comments.empty": "No comments yet: be the first to say something.",
  "comments.reply": "Reply",
  "comments.edit": "Edit",
  "comments.delete": "Delete",
  "comments.editedMark": "(edited)",
  "comments.tombstone": "This comment was deleted.",
  "comments.composer.placeholder": "Add a comment…",
  "comments.composer.replyPlaceholder": "Write a reply…",
  "comments.composer.editPlaceholder": "Edit your comment…",
  "comments.composer.post": "Post comment",
  "comments.composer.postReply": "Post reply",
  "comments.composer.saveEdit": "Save",
  "comments.composer.cancel": "Cancel",
  "comments.report.cta": "Report",
  "comments.report.title": "Report this comment",
  "comments.report.sub": "Tell us what's wrong with {name}'s comment.",
  "comments.report.reasonGroupAria": "Reason for reporting",
  "comments.report.cancel": "Cancel",
  "comments.report.sendCta": "Send report",
  "comments.report.sending": "Sending…",
  "comments.report.confirmTitle": "Report <em>sent</em>",
  "comments.report.confirmBody": "Thanks. A moderator will review {name}'s comment.",
  "comments.report.done": "Done",
  "comments.report.errorTitle": "Something went wrong",
  "comments.report.errorBody": "We couldn't send your report. Please try again.",
  "comments.report.retryCta": "Try again",
};

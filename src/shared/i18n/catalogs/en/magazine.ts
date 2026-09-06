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
  // Brand wordmark's second line ("QueerPulse" itself is a proper noun, kept
  // untranslated per the pt-PT glossary and rendered as a literal, not a key).
  "masthead.brandMagazine": "Magazine",
  "masthead.tagline": "Published the first of every month",
  "masthead.nav.current": "Current issue",
  "masthead.nav.issues": "Issues",
  "masthead.nav.stories": "Stories",
  "masthead.nav.authors": "Writers",
  "masthead.nav.write": "Write for us",
  "masthead.nav.sections": "Sections",
  "masthead.nav.search": "Search",

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

  // ── The editor-arranged front (MagazineLiveSections / MagazineFrontLead,
  //    CON-13) — chrome around the current issue's own run order. The section
  //    rail headings are the desk's own section names and stay as they were
  //    written, so they are not keys.
  "front.leadKicker": "Cover story",
  "front.coverLabel": "Cover · Issue {number}",
  "front.moreInIssue": "More <em>in this issue</em>",
  "front.fromTheMagazine": "From the magazine",

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

  // ── Members-only wall (MagazineSignInWall, CON-07) ───────────────────────
  // A 401 from the magazine read endpoints means "you are not signed in",
  // never "nothing is published". Shown to a logged-out visitor who followed a
  // shared article link, with a ?next= sign-in CTA back to where they landed.
  "signInWall.title": "The magazine is for members",
  "signInWall.description":
    "Essays, features, interviews and reviews from the community live behind the member wall, so writers know who is reading them. Sign in to pick up where you left off.",
  "signInWall.signInCta": "Sign in to read",
  "signInWall.requestInviteCta": "Request an invite",

  // ── ArticlePage ──────────────────────────────────────────────────────────
  "article.notFoundMetaTitle": "Article not found: QueerPulse Magazine",
  "article.notFoundTitle": "We couldn't find that piece.",
  "article.notFoundBody":
    "The article may have moved, or the link may be incomplete.",
  "article.notFoundCta": "Back to the magazine",
  "article.pageTitleSuffix": ": QueerPulse Magazine",
  "article.backToMagazine": "Magazine",
  "article.relatedHeading": "Keep <em>reading</em>",

  // ── ArticleNotes: content notes (CON-06) and corrections (CON-02) ────────
  "article.contentNotesHeading": "Content notes",
  "article.contentNotesDismissAria": "Hide the content notes for this piece",
  "article.correctionsHeading": "Corrections",

  // ── CON-16: the dated lifecycle banner and the language switcher ────────
  // Chrome only. The journalism itself is never in this catalog: a translated
  // piece is its own article row with its own byline (see the `locale` /
  // `translation_of` model), which is the whole point of CON-16.
  "article.lifecycle.publishedOn": "Published {date}",
  "article.lifecycle.readReplacement": "Read {title}",
  "article.lifecycle.reviewDue": "We will look at this again on {date}.",
  "article.lifecycle.under_review.heading": "We are checking this piece",
  "article.lifecycle.under_review.changedOn": "under review since {date}",
  "article.lifecycle.under_review.fallbackNote":
    "Something this piece describes has changed. We are going through it now, so parts of it may already be out of date.",
  "article.lifecycle.archived.heading": "From the archive",
  "article.lifecycle.archived.changedOn": "archived {date}",
  "article.lifecycle.archived.fallbackNote":
    "We keep this piece as a record of its time. It is no longer maintained, so read it as history.",
  "article.lifecycle.superseded.heading": "There is a newer piece",
  "article.lifecycle.superseded.changedOn": "replaced {date}",
  "article.lifecycle.superseded.fallbackNote":
    "A newer piece covers this ground. This one stays here as a record.",
  "article.language.label": "Read in",
  "article.language.onlyIn": "This piece is only in {language} for now.",
  "article.language.inProgress": "{language} in progress",
  "article.language.translatedBy": "Translated by {name}",

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
  "deck.editor.saveDraft": "Save draft",
  "deck.editor.publish": "Publish",
  "deck.editor.unpublish": "Unpublish",
  "deck.editor.delete": "Delete",
  "deck.editor.leaveConfirm": "You have unsaved changes. Leave without saving?",
  "deck.editor.previewEmpty": "Add a slide to preview",
  "deck.editor.preview.title": "Preview",
  "deck.editor.preview.emptySlide":
    "Start filling in this slide to see it here.",
  "deck.editor.budget.headingOver": "Too long. It will clip on a phone",
  "deck.editor.budget.headingOk": "Fits on the narrowest phone",
  "deck.editor.budget.bodyOver": "A slide is not a paragraph",
  "deck.editor.budget.bodyOk": "Short enough to read at a glance",
  "deck.editor.budget.count": "{count} / {max} characters",
  "deck.editor.saved": "Draft saved",
  "deck.editor.publishedToast": "Deck published",
  "deck.editor.scheduledToast": "Deck scheduled",
  "deck.editor.unpublishedToast": "Deck unpublished",
  "deck.editor.deletedToast": "Deck deleted",
  "deck.editor.saveError": "We couldn't save your deck. Please try again.",
  "deck.editor.publishNotReadyError":
    "Add at least one slide, and alt text on every image, before publishing.",
  // ENG-112: a published or piece-linked deck can no longer be deleted, so the
  // refusal has to say which of the two it is and what unblocks it.
  "deck.editor.deleteBlockedPublished":
    "Unpublish this deck before deleting it.",
  "deck.editor.deleteBlockedLinked":
    "This deck belongs to a piece in the desk. Delete the piece to remove both.",
  "deck.editor.backToDashboard": "Back to dashboard",
  "deck.editor.metaTitle": "Deck details",
  "deck.editor.untitled": "Untitled deck",
  "deck.editor.header.subtitle": "Deck · {count} slides",
  "deck.editor.unsavedChanges": "Unsaved changes",
  "deck.editor.convert": "Make it prose",
  "deck.editor.slidesHeading": "Slides",
  "deck.editor.slidesCount": "{count} of {max} · click a slide to edit",
  "deck.editor.slidesCapped": "40-slide maximum reached",
  // PRD-131 wired deck scheduling, so the rail now says what will actually
  // happen: ride the issue, wait for a date, or go now.
  "deck.editor.publish.issueLinked":
    "Ships automatically when issue {number} goes out.",
  "deck.editor.publish.issueUnlinked":
    "This deck is not in an issue yet. Add it to one from its piece record, or publish it now or on a date.",
  "deck.editor.publish.scheduledFor":
    "Scheduled for {date} at {time}. Readers cannot see it until then.",
  "deck.editor.publish.checklist.cover": "Cover slide set",
  "deck.editor.publish.checklist.source":
    "Source line on every stat slide (optional)",
  "deck.editor.publish.checklist.sourcePending":
    "Source line on every stat slide (optional, none yet)",
  "deck.editor.danger.title": "Danger zone",
  "deck.editor.danger.body":
    "Deleting a deck removes it everywhere it's linked. This can't be undone.",
  "deck.editor.danger.blockedPublished":
    "This deck is live. Unpublish it first, then it can be deleted.",
  "deck.editor.danger.blockedLinked":
    "This deck belongs to a piece in the desk. Delete the piece, which removes the deck with it.",
  "deck.editor.danger.cta": "Delete this deck",
  "deck.editor.deleteModal.title": "Delete this deck?",
  // Replaces the old flat body, which promised readers a 404. ENG-112 blocks
  // deleting a published deck outright, so no reader can reach that state.
  "deck.editor.deleteModal.detail_one":
    "Deleting removes {title} and its {count} slide. There is no undo, and no copy is kept.",
  "deck.editor.deleteModal.detail_other":
    "Deleting removes {title} and its {count} slides. There is no undo, and no copy is kept.",
  "deck.editor.deleteModal.draftOnly":
    "Only a draft deck can be deleted, so nobody outside the desk loses anything.",
  "deck.editor.convertModal.title": "Turn this into prose?",
  "deck.editor.convertModal.body":
    "Text and image slides carry straight over into article blocks, and each stat becomes a stats block. Interactive slides (before/after, reveal) have no article equivalent and will be dropped. This can't be undone.",
  "deck.editor.convertModal.cta": "Convert to article",
  "deck.editor.convertModal.successToast": "Converted to an article draft.",
  "deck.editor.convertModal.partialToast":
    "Converted, but {dropped} couldn't carry over and were dropped.",
  "deck.editor.convertModal.errorToast":
    "We couldn't convert this deck. Please try again.",

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

  // ── IssueContentsPanel (live) ────────────────────────────────────────────
  // The desk's curated running order and per-piece blurbs, on the issue's own
  // page. This curation used to be destined for an email; QueerPulse sends
  // none, so nothing here may promise a delivery.
  "contents.liveHeading": "In this <em>issue</em>",
  "contents.liveMeta_one": "{count} piece, in the order the desk arranged it",
  "contents.liveMeta_other":
    "{count} pieces, in the order the desk arranged them",

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
  "issues.archiveAriaLabel": "The full archive",
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
  // CON-11 — the byline as a real person: the link back to the member
  // account behind it, and the editor for whoever may fill it in.
  "author.viewMemberProfile": "See {name}'s member profile",
  "author.editBylineCta": "Edit this byline",
  "author.editMyBylineCta": "Edit my author profile",
  "author.editor.eyebrow": "Magazine · byline",
  "author.editor.title": "Author profile",
  "author.editor.sub":
    "This is what readers see beside your name on every piece you publish.",
  "author.editor.nameLabel": "Byline name",
  "author.editor.nameHelper":
    "Printed on published pieces. Only editors can change it.",
  "author.editor.nameRequired": "A byline needs a name.",
  "author.editor.bioLabel": "Bio",
  "author.editor.bioHelper":
    "A couple of lines about the writer, shown on the author page and under each piece.",
  "author.editor.portraitLabel": "Portrait",
  "author.editor.portraitAlt": "Author portrait preview",
  "author.editor.saveCta": "Save",
  "author.editor.savingCta": "Saving…",
  "author.editor.cancelCta": "Cancel",
  "author.editor.savedToast": "Author profile updated.",
  "author.editor.errorToast": "We couldn't save that. Try again.",

  // ── AuthorWork ───────────────────────────────────────────────────────────
  "author.work.mostRecentHeading": "Most recent · <em>featured</em>",
  "author.work.featuredImageAlt": "Hero image for {name}'s featured story",
  "author.work.featuredImagePlaceholder": "Featured story",
  "author.work.selectedWorkHeading": "Selected work",
  "author.work.allArticlesCta_one": "All {count} article",
  "author.work.allArticlesCta_other": "All {count} articles",
  "author.work.seeAllPicksCta": "See all picks",
  "author.work.findElsewhereHeading": "Find {name} <em>elsewhere</em>",
  "author.work.noArticlesYet":
    "{name} hasn't published anything yet. Check back soon.",

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
  // CON-11 — the directory shows people, not just names.
  "authorsDirectory.noBio": "No bio yet.",
  "authorsDirectory.pieceCount_one": "{count} piece",
  "authorsDirectory.pieceCount_other": "{count} pieces",
  "authorsDirectory.memberChip": "Member",

  // ── ProfileWritingSection (CON-11) ───────────────────────────────────────
  "profileWriting.selfTitle": "Your <em>writing</em>",
  "profileWriting.visitorTitle": "{firstName}'s <em>writing</em>",
  "profileWriting.sub_one": "{count} piece published in the magazine.",
  "profileWriting.sub_other": "{count} pieces published in the magazine.",
  "profileWriting.allCta_one": "See all {count} piece",
  "profileWriting.allCta_other": "See all {count} pieces",

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

  // ── Magazine search + tag browse (CON-12) ────────────────────────────────
  // The tags themselves are editorial vocabulary and print as authored; only
  // the chrome around them is translated.
  "tags.listAriaLabel": "Tags on this piece",
  "search.formAriaLabel": "Search the magazine",
  "search.fieldAriaLabel": "Search the magazine",
  "search.placeholder": "A name, a place, a subject",
  "search.submitCta": "Search",
  "search.metaTitle": "Search the magazine",
  "search.metaDescription":
    "Search every piece the magazine has published, and browse by tag.",
  "search.eyebrow": "Magazine · search",
  "search.heading": "Search the magazine.",
  "search.taggedLabel": "Tagged",
  "search.resultCount_one": "{count} piece found",
  "search.resultCount_other": "{count} pieces found",
  "search.promptTitle": "What are you looking for?",
  "search.promptBody":
    "Search everything we have published, headlines and bodies alike. Or follow a tag from any article to see what else we have run on it.",
  "search.errorTitle": "We couldn't run that search.",
  "search.errorBody":
    "Something interrupted us on the way there. Your words are still in the field, so give it another try.",
  "search.retryCta": "Try again",
  "search.emptyTitle": "Nothing matched that.",
  "search.emptyBody":
    "We haven't published on this yet, or it goes by another name here. Try fewer words, or browse by section.",

  // ══════════════════ Editor dashboard (staff-only) ════════════════════════
  // Piece/pitch RECORDS (titles, notes, activity feed, section names) are
  // left as English mock data — editorial-database content, not chrome.
  // Only the platform-authored dashboard UI is translated below.

  // ── Stage vocabulary — label-key indirection (Stage stays the stored id) ──

  // ── dueInfo() / blockedLine() composers (editorDashboard.data.ts) ─────────

  // ── EditorDashboardHeader ──────────────────────────────────────────────
  "editor.header.title": "Issue {number} · <em>{theme}</em>",
  "editor.header.meta":
    "Closes <b>{closes}</b> · publishes <b>{publishes}</b> · <b>{editors}</b> editing",

  // ── EditorStats ────────────────────────────────────────────────────────

  // ── EditorBulkBar ──────────────────────────────────────────────────────

  // ── EditorToolbar ──────────────────────────────────────────────────────

  // ── EditorPiecesTable ──────────────────────────────────────────────────

  // ── EditorPieceRow ─────────────────────────────────────────────────────

  // ── EditorPopover (Popover / StageMenu / AssignMenu / MoreMenu) ───────────

  // ── EditorPitchInbox ───────────────────────────────────────────────────

  // ── EditorNeedsStrip ───────────────────────────────────────────────────

  // ── EditorModals: Chase / Handoff / Shortcuts ─────────────────────────

  // ── EditorSideCards ────────────────────────────────────────────────────

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

  // ── useEditorDashboard / useEditorKeyboard toasts ──────────────────────

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
  "desk.header.writeCta": "Write",

  // ── Write (a piece the editor writes themselves) ─────────────────────────
  "desk.write.untitledTitle": "Untitled piece",
  "desk.write.editorNotReady":
    "Still loading your editor profile. Try again in a moment.",
  "desk.write.noSection":
    "No sections are set up yet, so there is nowhere for this piece to run.",
  // PRD-130: distinct from `noSection` above, which is the honest "this
  // magazine has none configured" case. These two are the taxonomy fetch still
  // in flight, and the taxonomy fetch having failed.
  "desk.write.sectionsLoading":
    "Still loading the section list. Try again in a moment.",
  "desk.write.sectionsUnavailable":
    "The section list could not be loaded, so this piece has nowhere to run. Reload the desk and try again.",
  "desk.header.produce": "Issue production",
  "desk.header.slotsFilledAria": "Issue slots filled",
  "desk.header.layoutAria": "Desk layout",
  "desk.header.metaPublishesOnly": "Publishes {publishes}",
  "desk.header.unassignedEyebrow": "Not in an issue yet",
  "desk.header.unassignedMeta":
    "Pieces waiting to be filed. Assign one to an issue when you know where it runs.",

  // ── Issue switcher + create (desk header) ────────────────────────────────
  "desk.header.workingOn": "Working on",
  "desk.header.workingOnAria": "Which issue you are working on",
  "desk.header.issueOption": "Issue {number} · {title}",
  "desk.header.newIssueCta": "New issue",

  // ── DeskTrackTabs (Unassigned ⇄ Issue) ───────────────────────────────────
  "desk.trackTabs.unassigned": "Unassigned",
  "desk.trackTabs.issue": "Issue {number}",
  "desk.trackTabs.issueNoNumber": "Issue",

  // ── Issue assignment (piece row action + picker) ─────────────────────────
  "desk.reassign.addToIssue": "Add to issue…",
  "desk.reassign.moveIssue": "Move issue…",
  "desk.reassign.addedToIssueToast": "Added to issue {number}.",
  "desk.reassign.madeUnassignedToast": "Back in the unassigned pool.",
  "desk.reassign.failedToast": "That didn't save. Give it another try.",

  "desk.assignIssue.title": "Which issue does this run in?",
  "desk.assignIssue.subPieces_one": "{count} piece",
  "desk.assignIssue.subPieces_other": "{count} pieces",
  "desk.assignIssue.issueOption": "Issue {number} · {title}",
  "desk.assignIssue.issueOptionMeta": "{filled} of {slots} slots filled",
  "desk.assignIssue.unassignedOption": "No issue",
  "desk.assignIssue.unassignedOptionMeta":
    "Leave it in the unassigned pool for now.",
  "desk.assignIssue.currentSuffix": "where it is now",
  "desk.assignIssue.confirm_one": "Move it",
  "desk.assignIssue.confirm_other": "Move {count} pieces",

  // ── New issue modal ──────────────────────────────────────────────────────
  "desk.newIssue.title": "Create a magazine issue",
  "desk.newIssue.sub":
    "Everything else (the cover, the running order, the digest) is set up on the issue's own page once it exists.",
  "desk.newIssue.numberLabel": "Number",
  "desk.newIssue.numberHelper":
    "Digits only. \u201c1\u201d becomes \u201c01\u201d.",
  "desk.newIssue.publishesLabel": "Publishes",
  "desk.newIssue.publishesHelper":
    "Optional. Leave it open and set the date when you know it.",
  "desk.newIssue.titleLabel": "Title",
  "desk.newIssue.titlePlaceholder": "The long way round",
  "desk.newIssue.themeLabel": "Theme",
  "desk.newIssue.themeHelper": "One or two words. It shows beside the number.",
  "desk.newIssue.themePlaceholder": "Aftercare",
  "desk.newIssue.create": "Create issue",
  "desk.newIssue.creating": "Creating\u2026",
  "desk.newIssue.createdToast": "Issue {number} created. You're on it now.",
  "desk.newIssue.duplicateNumberError": "Issue {number} already exists.",
  "desk.newIssue.saveFailedError": "That didn't save. Give it another try.",

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
  "desk.savedViews.lateOrAtRisk": "Late or at risk",
  "desk.savedViews.waitingOnArt": "Waiting on art",
  "desk.savedViews.needsSensitivityRead": "Needs a sensitivity read",
  "desk.savedViews.unpaidAfterFiling": "Unpaid after filing",

  // ── PiecesPipeline ───────────────────────────────────────────────────────
  "desk.pipeline.emptyTitle": "The desk is clear",
  "desk.pipeline.emptyDescription": "Nothing matches that filter right now.",
  "desk.pipeline.columnPiece": "Piece",
  "desk.pipeline.columnStage": "Stage",
  "desk.pipeline.columnWaitingOn": "Waiting on",
  "desk.pipeline.columnDue": "Due",
  "desk.pipeline.selectAllAria": "Select every piece shown",

  // ── PieceRow ─────────────────────────────────────────────────────────────
  "desk.pieceRow.newVoice": "New voice",
  "desk.pieceRow.writer": "Writer",
  "desk.pieceRow.you": "You",
  "desk.pieceRow.nobody": "Nobody",
  "desk.pieceRow.edit": "Edit",
  "desk.pieceRow.chase": "Chase",
  "desk.pieceRow.handOff": "Hand off",
  "desk.pieceRow.selectAria": "Select {title}",

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

  // ── Bulk assign to issue (pipeline rows) ─────────────────────────────────
  "desk.bulkAssign.selected_one": "{count} piece selected",
  "desk.bulkAssign.selected_other": "{count} pieces selected",
  "desk.bulkAssign.ariaLabel": "Bulk assign to issue",
  "desk.bulkAssign.clearSelection": "Clear selection",
  "desk.bulkAssign.assignToIssue": "Assign to issue\u2026",
  "desk.bulkAssign.assignedToast_one": "{count} piece moved to issue {number}.",
  "desk.bulkAssign.assignedToast_other":
    "{count} pieces moved to issue {number}.",
  "desk.bulkAssign.unassignedToast_one":
    "{count} piece back in the unassigned pool.",
  "desk.bulkAssign.unassignedToast_other":
    "{count} pieces back in the unassigned pool.",

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
    "Nothing has been filed yet. Start the pipeline with your first piece.",
  "desk.states.writePiece": "Write a piece",
  "desk.states.commissionPiece": "Commission a piece",
  "desk.states.errorBand":
    "Could not reach the pipeline. Showing what we last had.",
  "desk.states.tryAgain": "Try again",

  // ── CommandPalette ───────────────────────────────────────────────────────
  "desk.palette.kindArticle": "Article",
  "desk.palette.kindDeck": "Deck",
  "desk.palette.kindAction": "Action",
  "desk.palette.writePiece": "Write a piece",
  "desk.palette.goToDesk": "Go to the desk",
  "desk.palette.ariaLabel": "Command palette",
  "desk.palette.searchPlaceholder": "Jump to a piece, or start a new one…",
  "desk.palette.searchAria": "Search the desk",
  "desk.palette.commandsAria": "Commands",
  "desk.palette.noResults": "Nothing matches “{query}”.",

  // ── MagazineDeskShell (the editor's left rail) ───────────────────────────
  "deskShell.issueEyebrow": "Issue {number} · {theme}",
  "deskShell.menuAria": "Magazine desk sections",
  "deskShell.nav.desk": "Desk",
  "deskShell.nav.issue": "Issue",
  "deskShell.nav.lifecycle": "Archive",
  "deskShell.openNow": "Open now",
  "deskShell.writePiece": "Write",
  "deskShell.kbdHintSuffix": "to jump · ? for keys",
  "deskShell.backToPlatform": "Back to QueerPulse",

  // ── DeskModals (shared chrome across Commission/Pass/Chase/Handoff/Shortcuts) ──
  "desk.modals.cancel": "Cancel",
  "desk.modals.noteLabel": "Your note",
  "desk.modals.shortcuts.title": "Keyboard",
  "desk.modals.shortcuts.gotIt": "Got it",
  // The chord itself ("j / k", "⌘K") is rendered verbatim and stays out of the
  // catalog: a key name is the same in every locale. Only what it does is copy.
  "desk.modals.shortcuts.moveBetween": "Move between pieces",
  "desk.modals.shortcuts.openFocused": "Open the focused piece",
  "desk.modals.shortcuts.chaseWriter": "Chase the writer",
  "desk.modals.shortcuts.writeYourself": "Write a piece yourself",
  "desk.modals.shortcuts.triageTopPitch": "Triage the top pitch",
  "desk.modals.shortcuts.jumpAnywhere": "Jump anywhere, or start a piece",
  "desk.modals.shortcuts.thisList": "This list",

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
  "desk.modals.commission.trackUnassigned": "No issue",
  "desk.modals.commission.trackIssue": "Issue {number}",
  // PRD-130: the Section picker and Send brief are disabled together whenever
  // the section list is empty, and this says why rather than offering an
  // empty dropdown.
  "desk.modals.commission.sectionsUnavailable":
    "The section list has not loaded, so there is nowhere for this brief to run yet.",
  "desk.modals.commission.sectionsEmptyOption": "No sections available",

  // ── PassModal ────────────────────────────────────────────────────────────
  "desk.modals.pass.title": "Pass on “{title}”",
  "desk.modals.pass.send": "Send it",
  "desk.modals.pass.body":
    "A pass lands easier with a real reason. Pick a starting point below, or write your own. Either way, the writer hears from a real person.",
  "desk.modals.pass.startingPoints": "Starting points",
  // Each `label` names a chip; each `body` is seeded into the editable note the
  // writer eventually reads, so it has to stand as real prose from an editor.
  // The deck template's chip reuses `desk.pitchRow.betterAsDeck`, so only its
  // body is here.
  "desk.modals.pass.templates.notForUs.label": "Not for us",
  "desk.modals.pass.templates.notForUs.body":
    "Thank you for trusting us with this. It is not the right fit for QueerPulse. We are not the home this piece deserves, and I would rather say so than sit on it. Please do send us the next one.",
  "desk.modals.pass.templates.notNow.label": "Not now",
  "desk.modals.pass.templates.notNow.body":
    "I like this a lot, but issue 14 is full and the timing works against it. Can I come back to you for issue 16, when the theme is closer? No obligation either way.",
  "desk.modals.pass.templates.anotherSection.label": "Try another section",
  "desk.modals.pass.templates.anotherSection.body":
    "This does not work as a feature, but it would sit beautifully in Service: shorter, more practical, same reporting. Want me to commission it that way?",
  "desk.modals.pass.templates.betterAsDeck.body":
    "The reporting is strong but the shape is wrong: this wants to be a deck. If you are up for it, I would commission it as eight or nine slides.",

  // ── ChaseModal (Phase 7 Wave F: embeds PieceThread, no separate compose step) ─
  "desk.modals.chase.title": "Chase {name}",
  "desk.modals.chase.body":
    "A quick, human nudge to keep things moving gently.",

  // ── HandoffModal ─────────────────────────────────────────────────────────
  "desk.modals.handoff.title": "Hand off",
  "desk.modals.handoff.cta": "Hand off",
  "desk.modals.handoff.body":
    "Hand “{title}” to another editor. They pick up right where you left off.",
  "desk.modals.handoff.toLabel": "To",

  // ── Editorial pipeline stage names (desk/stageLabels.ts) ─────────────────
  // Supersedes the "left unswept here" note in this section's header: the raw
  // `Stage` ids that StagePill, StageStepper, PiecesBoard's column headings and
  // stage picker, IssuePlan's slot cards and `usePieceMutations`' "Moved to
  // {stage}" toast all echoed as display text now resolve through one lookup.
  //
  // Kept separate from `pitchTracker.stage.*` on purpose. That set is the
  // MEMBER-facing pitch journey (Pitched / Accepted / First draft); this one is
  // the desk's editorial pipeline. Three of them collide in English by
  // accident, and the Portuguese diverges. Merging them would tie a member's
  // vocabulary to an internal workflow. Genders agree with "peça" (feminine).
  "desk.stage.commissioned": "Commissioned",
  "desk.stage.drafting": "Drafting",
  "desk.stage.inReview": "In review",
  "desk.stage.edit": "Edit",
  "desk.stage.sensitivityRead": "Sensitivity read",
  "desk.stage.layout": "Layout",
  "desk.stage.ready": "Ready",
  "desk.stage.published": "Published",

  // ── Desk mutation toasts (usePieceMutations / usePitchMutations) ─────────
  // `TRIAGE_TOAST_KEY.commission` deliberately points at
  // `desk.pieceToast.commissioned`: the verdict IS a commission, same copy.
  // These stay distinct from `piece.brief.commissioned`, which is a key/value
  // FIELD LABEL in the Brief tab and wants a different Portuguese form.
  "desk.pieceToast.commissioned": "Commissioned",
  "desk.pieceToast.draftStarted": "Draft started",
  "desk.pieceToast.movedToStage": "Moved to {stage}",
  "desk.pieceToast.handedOff": "Handed off",
  "desk.pieceToast.deleted": "Deleted",
  "desk.pitchToast.maybe": "Marked as maybe",
  "desk.pitchToast.passed": "Pitch passed",
  "desk.pitchToast.added": "Pitch added",

  // ── DeskView ─────────────────────────────────────────────────────────────

  // ── EditorDashboardPage ──────────────────────────────────────────────────
  "desk.page.savingViewsUnavailable":
    "Saving custom views isn't available yet.",

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

  // ── Publish / unpublish from the piece record (PRD-119, PRD-120) ─────────
  // The care gate is enforced server-side, so the client copy has two jobs:
  // say what is holding the piece before the editor presses anything, and
  // render the desk's own refusal honestly when it comes back anyway (another
  // editor opened a care item between the render and the click).
  "piece.publish.openCareTab": "Open the Care tab",
  "piece.publish.unpublish": "Unpublish",
  "piece.publish.viewLive": "View live",
  "piece.publish.viewLiveAria": "View “{title}” as readers see it",
  "piece.publish.liveSince": "Live since {date}",
  "piece.publish.scheduledFor": "Scheduled for {date}",
  "piece.publish.blockedByGate_one":
    "Publish is blocked: {count} care item is still open.",
  "piece.publish.blockedByGate_other":
    "Publish is blocked: {count} care items are still open.",
  "piece.publish.blockedToast_one":
    "Resolve the {count} open care item before publishing.",
  "piece.publish.blockedToast_other":
    "Resolve the {count} open care items before publishing.",
  "piece.publish.publishedToast": "Published. It is live for readers now.",
  "piece.publish.unpublishedToast":
    "Taken down. Readers can no longer reach it.",
  "piece.publish.failedToast": "Could not publish this piece. Try again.",
  "piece.publish.unpublishFailedToast":
    "Could not take this piece down. Try again.",
  "piece.publish.refusedCareGateHeading": "Held by the care gate",
  "piece.publish.refusedCareGateToast":
    "This piece is still behind its care gate.",
  "piece.publish.refusedNotReadyHeading": "Not ready to publish",
  "piece.publish.refusedNotReadyToast":
    "This piece is not ready to publish yet.",
  "piece.publish.refusedNoDetail":
    "The desk gave no reason. Reload the record and try again.",
  "piece.publish.confirmPublishTitle": "Publish “{title}”?",
  "piece.publish.confirmPublishSub": "It goes live to readers straight away.",
  "piece.publish.confirmPublishBody":
    "The writer is told it went out. You can take it down again at any time, and nothing is deleted when you do.",
  "piece.publish.confirmPublishCta": "Publish it",
  "piece.publish.confirmUnpublishTitle": "Take “{title}” down?",
  "piece.publish.confirmUnpublishSub": "Readers lose access to it immediately.",
  "piece.publish.confirmUnpublishBody":
    "Nothing is deleted. The piece goes back to Ready and you can publish it again whenever you want.",
  "piece.publish.confirmUnpublishCta": "Take it down",
  "piece.publish.confirmCancel": "Not yet",

  // ── Piece record demo toasts (api/useRecordMutations.ts) ─────────────────
  // Demo mode only, where the record is static and the mutation resolves with
  // no network call. Demo is a real surface, so they are translated.
  "piece.recordToast.saved": "Saved",
  "piece.recordToast.markedPaid": "Marked paid",
  "piece.recordToast.letterAdded": "Letter added",
  "piece.recordToast.markedRunInLetters": "Marked to run in letters",
  "piece.recordToast.removedFromLetters": "Removed from letters",
  "piece.recordToast.correctionPublished": "Correction published",

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
  "piece.money.noFeeAgreed": "No fee agreed",
  "piece.money.feeAsFiled": "Fee, as filed: {text}",
  "piece.money.expensesAsFiled": "Expenses, as filed: {text}",
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
  "submitStory.editor.draftSaved":
    "Draft saved. It'll be here when you come back.",
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
  "pitchTracker.header.newPitchCta": "+ New pitch",
  // PRD-129 replaced `pitchTracker.header.lead`, which interpolated three
  // hardcoded prototype numbers and promised a turnaround nothing measures.
  // Two pluralized fragments over real counts, rendered by `Translation`.
  "pitchTracker.header.leadActive_one": "{count} pitch with the desk right now",
  "pitchTracker.header.leadActive_other":
    "{count} pitches with the desk right now",
  "pitchTracker.header.leadPublished_one": "<b>{count} published</b> all-time",
  "pitchTracker.header.leadPublished_other":
    "<b>{count} published</b> all-time",

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
  "pitchTracker.page.loadErrorTitle": "We couldn't load your pitches",
  "pitchTracker.page.loadErrorBody":
    "Everything you sent is still with the desk. Try again in a moment.",

  // ── Withdrawing a pitch (PRD-125) ────────────────────────────────────────
  // Live mode. `pitchTracker.page.withdrawnToast` above stays as the DEMO
  // undo-able toast; a live withdrawal is final, so it says so and offers no
  // Undo. The decided case is the 409 the desk answers with when it got there
  // first, which is a real outcome rather than a failure.
  "pitchTracker.card.withdrawCta": "Withdraw",
  "pitchTracker.withdraw.confirmTitle": "Withdraw this pitch?",
  "pitchTracker.withdraw.confirmBody":
    "The desk stops seeing it and it leaves your tracker. You cannot undo this, though you are always welcome to pitch the story again.",
  "pitchTracker.withdraw.confirmCta": "Withdraw pitch",
  "pitchTracker.withdraw.doneToast": "Pitch withdrawn.",
  "pitchTracker.withdraw.decidedToast":
    "The desk has already answered this pitch, so it can no longer be withdrawn.",
  "pitchTracker.withdraw.failedToast":
    "We couldn't withdraw that pitch. Try again in a moment.",

  // ── PitchCard ─────────────────────────────────────────────────────────
  // The note author/body are an editor's own words (content); only the
  // "{author} wrote:" chrome phrase around them is translated.
  "pitchTracker.card.noteWrote": "{author} wrote:",
  // Byline for the reply a live decision carries. The desk speaks as the desk
  // here: the bell and this card never name which staff member decided.
  "pitchTracker.card.deskAuthor": "The desk",

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
  // A commission is a yes that also put the piece in the desk's pitch inbox,
  // so it reads differently from a plain "Accepted".
  "pitchTracker.statusLabel.commissioned": "Commissioned",

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
  "write.header.savedUnsaved": "Unsaved changes",
  "write.header.retrySave": "Retry save",
  "write.header.leaveConfirm":
    "Some edits haven't reached the server yet. Leave the editor?",
  "write.header.issueScheduled": "Scheduled in an issue",
  "write.header.savedConflict": "Saving paused",

  // ── Save conflict (ENG-111) ──────────────────────────────────────────────
  // A second editor saved this article after this tab loaded it. Autosave
  // stops instead of overwriting them, so the copy has to be blunt that
  // reloading costs this tab's edits.
  "write.conflict.heading": "This draft moved on",
  "write.conflict.body":
    "Someone else saved this article after you opened it, so we stopped saving rather than write over their work. Reloading brings in the current version and discards the edits in this tab, so copy anything you want to keep first.",
  "write.conflict.reloadCta": "Reload the current draft",

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

  // ── ImageBlockControls ────────────────────────────────────────────────────
  "write.image.sourceLabel": "The picture",
  "write.image.sourceHelper":
    "Upload the art for this spot. Freeform crop: the frame and focal point below decide how it runs.",
  "write.image.sourcePlaceholder": "No picture yet",
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
  "write.selection.linkFieldLabel": "Link address",
  "write.selection.linkPlaceholder": "https://example.com",
  "write.selection.linkApply": "Add link",
  "write.selection.linkCancel": "Cancel link",
  "write.selection.linkInvalid":
    "Use a full web address like https://example.com, or an email address like mailto:hello@example.com.",

  // ── PublishRail ────────────────────────────────────────────────────────────
  "write.publish.title": "Publish",
  "write.publish.whenLabel": "When it ships",
  "write.publish.now": "Now",
  "write.publish.schedule": "Schedule",
  "write.publish.withIssue": "With issue",
  "write.publish.scheduleLabel": "Publish at",
  "write.publish.scheduleNote":
    "Publishes automatically at the date and time you pick.",
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
  // ENG-111: the server's own refusal, surfaced in the rail. The not-ready
  // toast reuses `write.header.publishNotReadyError` above, which already says
  // exactly what to add.
  "write.publish.gate.careHeading":
    "The care gate is still open on this piece.",
  "write.publish.gate.notReadyHeading":
    "The saved draft is not ready to publish.",
  "write.publish.gate.careToast":
    "Publish is blocked while the care gate is open.",

  // ── ArticleMetaRail ────────────────────────────────────────────────────────
  "write.meta.title": "Piece meta",
  "write.meta.sectionLabel": "Section",
  "write.meta.bylineLabel": "Byline",
  "write.meta.bylineHelper": "Set on the piece record's Brief tab.",
  "write.meta.roleLabel": "Role",
  "write.meta.roleHelper":
    "A credit-line qualifier, e.g. “Contributing editor”.",
  "write.meta.tagsLabel": "Tags",
  "write.meta.tagsHelper": "Comma-separated.",
  "write.meta.slugLabel": "Slug",
  "write.meta.slugHelper": "Server-generated.",
  "write.meta.metaDescriptionLabel": "Meta description",
  "write.meta.metaDescriptionHelper":
    "Shown in search results and link previews. Optional.",
  "write.meta.heroImageLabel": "Lead art",
  "write.meta.heroImageHelper":
    "The picture that opens the piece and rides on every card pointing at it. At least 1200 by 600.",
  "write.meta.heroImagePlaceholder": "No lead art yet",
  "write.meta.socialImageLabel": "Social image",
  "write.meta.socialImageHelper":
    "Image URL used when this article is shared. Optional.",
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
  "write.versions.restoreToast": 'Restored "{label}".',
  "write.versions.restoredFromLabel": "Restored from {label}",
  "write.versions.restoreModal.title": 'Restore "{label}"?',
  "write.versions.restoreModal.body":
    "Restore this version? Your current draft is saved first, so nothing is lost.",
  "write.versions.restoreModal.cancel": "Cancel",
  "write.versions.restoreModal.confirm": "Restore this version",
  "write.versions.restoreModal.restoring": "Restoring…",
  "write.versions.diff.title": "Compare versions",
  "write.versions.diff.sub": '"{label}" by {author} · {when}',
  "write.versions.diff.loading": "Loading version…",
  "write.versions.diff.error": "Couldn't load this version.",
  "write.versions.diff.empty":
    "Nothing to compare. This version has no blocks.",
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
  // ENG-110 / PRD-126: shipping schedules rather than publishes when the issue
  // carries a future publish date, and the outcome is reported afterwards
  // instead of being assumed. Nothing here may describe a delivery: CON-05
  // removed the email digest and QueerPulse sends none.
  "issue.ship.schedulesForNote":
    "Shipping does not publish anything today. Every eligible piece is scheduled to go live at 09:00 on {date}.",
  "issue.ship.publishesNowNote":
    "Every eligible piece goes live to readers as soon as you ship.",
  "issue.ship.lastShipHeading": "Last shipped {date}",
  "issue.ship.lastShipPublished_one": "{count} piece publishes at {date}.",
  "issue.ship.lastShipPublished_other": "{count} pieces publish at {date}.",
  "issue.ship.heldHeading_one": "{count} piece was held",
  "issue.ship.heldHeading_other": "{count} pieces were held",
  "issue.ship.heldLastTimeHeading_one": "The last ship held {count} piece",
  "issue.ship.heldLastTimeHeading_other": "The last ship held {count} pieces",

  // ── Issue production toasts ──────────────────────────────────────────────
  // `issuePanelSaved` deliberately renames the old hardcoded "Digest saved":
  // CON-05 retired the members' email digest and that tab is now the Issue
  // panel. A toast naming a surface that no longer exists is a lie.
  "issue.toast.runOrderSaved": "Running order saved",
  "issue.toast.issuePanelSaved": "Issue panel saved",
  "issue.toast.coverSaved": "Cover saved",
  "issue.toast.shipped": "Issue shipped",
  "issue.toast.contentsBlurbSaved": "Contents blurb saved",

  // ── IssueTabsNav ─────────────────────────────────────────────────────────
  "issue.tabs.ariaLabel": "Issue production sections",
  "issue.tabs.runningOrder": "Running order",
  "issue.tabs.coverContents": "Cover & contents",
  "issue.tabs.digestSocial": "Issue panel & social",
  "issue.tabs.archive": "Archive",

  // ── PagesCard ────────────────────────────────────────────────────────────
  "issue.publishDate.heading": "Publish date",
  "issue.publishDate.set": "This issue is set to run on {date}.",
  "issue.publishDate.unset":
    "Not scheduled yet. Set a date whenever you know it, or let shipping stamp today's.",
  "issue.publishDate.save": "Save date",
  "issue.publishDate.clear": "Clear date",
  "issue.publishDate.saving": "Saving\u2026",
  "issue.publishDate.savedToast": "Issue set to run on {date}.",
  "issue.publishDate.clearedToast":
    "Publish date cleared. The issue is unscheduled again.",
  "issue.pages.heading": "Pages",
  "issue.pages.editorial": "Editorial",
  "issue.pages.total": "Total",
  "issue.pages.spare_one": "{count} page spare",
  "issue.pages.spare_other": "{count} pages spare",

  // ── IssueCostsCard (CON-18) ──────────────────────────────────────────────
  "issue.costs.heading": "What this issue cost",
  "issue.costs.fees": "Fees",
  "issue.costs.expenses": "Expenses",
  "issue.costs.total": "Total",
  "issue.costs.paid": "Paid",
  "issue.costs.outstanding": "Still owed",
  "issue.costs.nothingPriced": "Nothing on this issue carries a fee yet.",
  "issue.costs.loadFailed": "The costs could not be loaded just now.",
  "issue.costs.unpriced_one":
    "{count} payment has no amount, so it sits outside these totals.",
  "issue.costs.unpriced_other":
    "{count} payments have no amount, so they sit outside these totals.",
  "issue.costs.coverage_one":
    "{payments} payments across {count} piece in this issue.",
  "issue.costs.coverage_other":
    "{payments} payments across {count} pieces in this issue.",

  // ── RunningOrderTab ──────────────────────────────────────────────────────
  "issue.runOrder.deckNoPageCount": "Deck: no page count",
  "issue.runOrder.pagesPrefix": "pp. {pages}",
  "issue.runOrder.laidOut": "Laid out",

  // ── Add pieces panel (issue production, running order tab) ───────────────
  "issue.addPieces.title": "Add pieces to this issue",
  "issue.addPieces.sub":
    "Pull from the pieces that aren't in an issue yet. They land at the end of the running order.",
  "issue.addPieces.addCtaEmpty": "Add to issue {number}",
  "issue.addPieces.addCta_one": "Add 1 to issue {number}",
  "issue.addPieces.addCta_other": "Add {count} to issue {number}",
  "issue.addPieces.searchPlaceholder": "Search unassigned pieces\u2026",
  "issue.addPieces.searchLabel": "Search unassigned pieces",
  "issue.addPieces.noMatches": "Nothing matches that search.",
  "issue.addPieces.emptyTitle": "Everything is filed",
  "issue.addPieces.emptyDescription":
    "No pieces are waiting to be assigned. Commission one from the desk to start.",
  "issue.addPieces.addedToast_one": "{count} piece added to issue {number}.",
  "issue.addPieces.addedToast_other": "{count} pieces added to issue {number}.",
  "issue.addPieces.failedToast": "That didn't save. Give it another try.",
  "issue.runOrder.inLayout": "In layout",
  "issue.runOrder.moveEarlierAria":
    "Move “{title}” earlier in the running order",
  "issue.runOrder.moveLaterAria": "Move “{title}” later in the running order",
  "issue.runOrder.open": "Open",
  "issue.runOrder.movedAnnouncement":
    "Moved “{title}” to position {position} of {total}",

  // ── CoverContentsTab ─────────────────────────────────────────────────────
  "issue.cover.heading": "Cover",
  "issue.cover.artPlaceholder": "Cover art",
  // PRD-128 replaced the raw URL field with a real upload, so the label names
  // the artwork rather than the address it used to be pasted from.
  "issue.cover.imageLabel": "Cover image",
  "issue.cover.imageHelper":
    "The plate that fronts the issue everywhere it appears. At least 1200 by 600.",
  "issue.cover.imagePlaceholder": "No cover image yet",
  "issue.cover.coverlineLabel": "Coverline {n}",
  "issue.cover.hint":
    "Coverlines are not headlines. Shorter, flatter, no puns.",
  "issue.contents.heading": "Contents",
  "issue.contents.blurbLabel": "Contents blurb",
  "issue.contents.blurbPlaceholder": "One sentence, written by the desk.",

  // ── DigestSocialTab ──────────────────────────────────────────────────────
  // CON-05: this tab used to curate an EMAIL. QueerPulse delivers none, so the
  // send path is gone and the same curation now feeds the "In this issue"
  // panel on the issue's public page, plus one in-app announcement on ship.
  // No string here may describe a delivery. The `issue.digest.*` key prefix is
  // historical; the copy underneath it is not.
  "issue.digest.heading": "Issue panel",
  "issue.digest.hint":
    "This is what readers see on the issue's page. Order here is the reading order.",
  "issue.digest.includeAria": "Show “{title}” on the issue panel",
  "issue.digest.editBlurbAria": "Edit the issue-panel blurb for “{title}”",
  "issue.digest.save": "Save",
  "issue.digest.cancel": "Cancel",
  "issue.digest.edit": "Edit",
  "issue.digest.previewPanel": "See the reader's page",
  "issue.digest.announceWithIssue": "Announce with the issue",
  "issue.digest.announceScheduled": "Announcing with the issue",
  "issue.digest.announceOnToast":
    "Members get a notification when this issue ships.",
  "issue.digest.announceOffToast":
    "Shipping this issue will no longer notify members.",
  "issue.digest.alreadyAnnounced": "Announced to members on {date}",
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
  "issue.archive.checkedAutomatically":
    "Checked automatically at commission time.",

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
  "writer.page.heading": "Your desk",
  "writer.page.openCount_one": "{count} assignment open",
  "writer.page.openCount_other": "{count} assignments open",
  "writer.page.nextDue": "next due {date}",
  "writer.page.nothingOpen": "Nothing open right now",
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
  "writer.work.messageEditor": "Message editor",
  "writer.work.activeBadge": "Active",
  "writer.work.setActive": "Use for byline & terms",
  // Replaces the raw `magazine_payment.status` enum a writer was reading on
  // their own card ("approved_unpaid"). Kept apart from
  // `piece.moneyMini.status*`, which is the editor's side of the same fact.
  "writer.work.paymentStatus.agreed": "Agreed",
  "writer.work.paymentStatus.approvedUnpaid": "Approved, unpaid",
  "writer.work.paymentStatus.paid": "Paid",

  // ── BriefDetailModal ─────────────────────────────────────────────────────
  "writer.brief.title": "Brief: {title}",
  "writer.brief.angleLabel": "Angle",
  "writer.brief.wantsLabel": "What we want",
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
  "writer.pitches.sentToast": "Pitch sent.",

  // ── WriterPaymentsTab ────────────────────────────────────────────────────
  "writer.payments.emptyTitle": "No payments yet",
  "writer.payments.emptyDescription":
    "Once a piece is filed and approved, its payment shows up here.",
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
  "writer.terms.emptyState":
    "No active commission yet. Terms show up once you have one.",

  // ── BylineSafetyCard ─────────────────────────────────────────────────────
  "writer.byline.heading": "Your safety",
  "writer.byline.body":
    "You choose the byline on every piece, and can change it up to the moment it publishes.",
  "writer.byline.fieldLabel": "Byline for “{title}”",
  "writer.byline.anonymous": "Anonymous",
  "writer.byline.emptyState": "No active assignment to set a byline for yet.",
  "writer.byline.updatedToast": "Byline updated.",

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
  "writer.fileDraft.filedToast": "Draft filed.",
  "writer.fileDraft.filing": "Filing…",
  "writer.fileDraft.failed":
    "That did not go through. Your text is still here, try filing again.",
  // Filing is no longer a blind overwrite: the writer picks what happens to
  // the draft on the desk, and a version saved after they opened the modal
  // stops the file until they have seen it.
  "writer.fileDraft.conflictHeading": "This draft changed since you loaded it",
  "writer.fileDraft.conflictBody":
    "Your editor saved this article after you opened it. Reload the draft to see their version before you file, so nothing of theirs is lost. Your text stays in the box.",
  "writer.fileDraft.conflictReload": "Reload the draft",
  "writer.fileDraft.currentDraftWords":
    "The draft on the desk right now: {words} words, edits included.",
  "writer.fileDraft.loadCurrentDraft": "Start from the current draft",
  "writer.fileDraft.modeLabel": "What happens to the draft",
  "writer.fileDraft.modeAppend": "Add my text to the end",
  "writer.fileDraft.modeReplace": "Replace the whole draft with my text",
  "writer.fileDraft.modeAppendHelper":
    "Filing the same text twice adds it once. Nothing already on the desk is touched.",
  "writer.fileDraft.modeReplaceHelper":
    "Your editor's version is saved first, so they can put it back from the version history.",

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
  "pieceThread.emptyDescription":
    "Say hello. Chases and questions live here now, instead of email.",
  "pieceThread.errorState": "Couldn't load this thread. Try again in a moment.",
  "pieceThread.composerAria": "Message",
  "pieceThread.composerPlaceholder": "Write a message…",
  "pieceThread.send": "Send",
  "pieceThread.sentToast": "Message sent.",

  // ══════════════════ Apply to write ═══════════════════════════════════════
  "applyToWrite.intro.title": "Show us <em>what you've got.</em>",
  "applyToWrite.intro.lead":
    "Every story that reaches an editor starts here. Tell us why you want to write for QueerPulse and share a sample of your writing: pasted in, or a link to something you've already published.",
  "applyToWrite.form.pitchNoteLabel": "Why do you want to write for us?",
  "applyToWrite.form.pitchNotePlaceholder": "A sentence or two is plenty.",
  "applyToWrite.form.sampleTextLabel": "Paste a writing sample",
  "applyToWrite.form.sampleTextPlaceholder":
    "Paste a piece of your writing here.",
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

  // ── ArticleComments (comments/) — CNT-10 reader comments ────────────────
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
  "comments.report.confirmBody":
    "Thanks. A moderator will review {name}'s comment.",
  "comments.report.done": "Done",
  "comments.report.errorTitle": "Something went wrong",
  "comments.report.errorBody":
    "We couldn't send your report. Please try again.",
  "comments.report.retryCta": "Try again",

  // ── Shared load-failure panel (MagazineLoadError, FE-CNT-08) ─────────────
  // Distinct from the not-found walls above: a 404 means the piece does not
  // exist, this means the request failed and is worth retrying.
  "load.errorMetaTitle": "Couldn't load: QueerPulse Magazine",
  "load.errorTitle": "We couldn't load this.",
  "load.errorBody":
    "Something interrupted us on the way here. The piece is still there, so give it another try.",
  "load.retryCta": "Try again",
  "load.backCta": "Back to the magazine",

  // ── Page metadata for the ungated reading surfaces (FE-CNT-12) ───────────
  "author.notFoundMetaTitle": "Writer not found: QueerPulse Magazine",
  "author.metaTitle": "{name}: QueerPulse Magazine",
  "author.metaDescription":
    "Everything {name} has written for QueerPulse Magazine.",
  "issue.metaTitle": "Issue {number}, {title}: QueerPulse Magazine",
  "issue.metaTitleNumberOnly": "Issue {number}: QueerPulse Magazine",
  "issue.metaTitleFallback": "The issue: QueerPulse Magazine",
  "issue.metaDescription": "One issue of QueerPulse Magazine, cover to cover.",
  "sectionArticles.metaTitle": "{section}: QueerPulse Magazine",
  "sectionArticles.metaDescription": "Every piece we've run in {section}.",

  // ── Live adapters (magazine.adapters.tsx, FE-CNT-16) ─────────────────────
  // Labels the live API rows are rendered with. They used to be built by
  // string concatenation in the adapter, so Portuguese readers saw English
  // issue chrome on live author pages and issue covers.
  "live.issueBadge": "Issue {number}",
  "live.issueBadgeCurrent": "Issue {number} · Current",
  "live.issueBadgeInaugural": "Issue {number} · Inaugural",
  "live.issueCover": "Issue {number} · {title}",
  "live.publishedOn": "Published {date}",
  "live.fromTheMagazine": "From the magazine",
  "live.sectionFallback": "Feature",
  "live.featureIssue": "Feature · Issue {number}",
  "live.readMinutes": "{minutes} min",
  "live.web": "Web",

  // ── Article editor: slash menu + block removal undo ──────────────────────
  "write.slash.menuAria": "Insert a block",
  "write.block.removedToast": "Block removed.",
  "write.block.undoRemove": "Undo",

  // ── Reader comments: delete confirmation (FE-CNT-11) ─────────────────────
  "comments.deleteConfirm.title": "Delete this comment?",
  "comments.deleteConfirm.body":
    "It will be replaced with a note saying the comment was deleted. This can't be undone.",
  "comments.deleteConfirm.cta": "Delete comment",

  // ── CON-16: the lifecycle desk (/magazine/editor/lifecycle) ──────────────
  "lifecycle.pageTitle": "Archive · QueerPulse Magazine",
  "lifecycle.heading": "The archive",
  "lifecycle.blurb":
    "Where every published piece stands today, and which ones the desk promised to check again. Retiring a piece keeps it readable and gives the reader a dated note, so nothing anyone shared turns into a dead link.",
  "lifecycle.horizon": "{days} days",
  "lifecycle.horizonAria": "How far ahead the review queue looks",
  "lifecycle.saved": "Saved. Readers see this on the piece now.",
  "lifecycle.saveFailed": "That didn't save. Try again.",

  "lifecycle.state.live": "Live",
  "lifecycle.state.underReview": "Under review",
  "lifecycle.state.archived": "Archived",
  "lifecycle.state.superseded": "Superseded",
  "lifecycle.hint.live":
    "Current. We stand by it as written, and no banner shows.",
  "lifecycle.hint.underReview":
    "We are re-checking it against the law or the service as they stand now. Readers are told parts may be out of date.",
  "lifecycle.hint.archived":
    "Of its time. Kept as a record, no longer maintained, and read as history.",
  "lifecycle.hint.superseded":
    "A newer piece replaces it. The banner sends the reader straight there.",

  "lifecycle.counts.overdue": "Overdue",

  "lifecycle.queue.heading": "Due for a look",
  "lifecycle.queue.blurb":
    "Pieces the desk promised to re-check, oldest promise first. Most are still live, because nobody has looked yet.",
  "lifecycle.queue.empty": "Nothing is due in this window.",
  "lifecycle.flagged.heading": "Carrying a banner",
  "lifecycle.flagged.blurb":
    "Everything a reader currently sees a note on. A piece can be here and in the queue above at the same time.",
  "lifecycle.flagged.empty": "Every published piece is live.",

  "lifecycle.row.published": "published {date}",
  "lifecycle.row.replacedBy": "Replaced by {title}",
  "lifecycle.row.dueIn": "Due in {days} days",
  "lifecycle.row.overdueBy": "{days} days overdue",
  "lifecycle.row.noReview": "No review set",
  "lifecycle.row.edit": "Set status",
  "lifecycle.row.editAria": "Set the status of {title}",

  "lifecycle.modal.eyebrow": "Lifecycle",
  "lifecycle.modal.sub":
    "This is what a reader sees at the top of the piece. The piece stays published and stays in the archive either way.",
  "lifecycle.modal.stateLabel": "Where this piece stands",
  "lifecycle.modal.replacementLabel": "The piece that replaces it",
  "lifecycle.modal.replacementHelper":
    "Its slug, the part after ?id= in its address.",
  "lifecycle.modal.replacementRequired":
    "A superseded piece needs somewhere to send the reader.",
  "lifecycle.modal.noteLabel": "What to tell the reader",
  "lifecycle.modal.noteHelper":
    "One sentence in your own words. Leave it blank and the piece gets the general wording for this status.",
  "lifecycle.modal.reviewLabel": "Check this again on",
  "lifecycle.modal.reviewHelper":
    "The day this lands back on the desk. Readers see the promise too.",
  "lifecycle.modal.cancel": "Cancel",
  "lifecycle.modal.save": "Save status",

  "lifecycle.row.languages": "Languages",
  "lifecycle.row.languagesAria": "Languages for {title}",
  "lifecycle.languages.eyebrow": "Languages",
  "lifecycle.languages.sub":
    "A translation is its own piece: its own address, its own byline for whoever translates it, and its own publish date. It ships when the translator is done.",
  "lifecycle.languages.published": "Published",
  "lifecycle.languages.drafting": "Still drafting",
  "lifecycle.languages.translator": "translated by {name}",
  "lifecycle.languages.emptyTitle": "One language so far",
  "lifecycle.languages.emptyBody":
    "Open a translation below and it arrives on the desk with the original's paragraphs already in place.",
  "lifecycle.languages.localeLabel": "Translate into",
  "lifecycle.languages.localePlaceholder": "Pick a language",
  "lifecycle.languages.translatorLabel": "Who is translating it",
  "lifecycle.languages.translatorHelper":
    "Their name as it should read in the credit. Leave it blank and credit them later.",
  "lifecycle.languages.open": "Open translation",
  "lifecycle.languages.opened": "Translation opened at {slug}.",
  "lifecycle.languages.openFailed": "That didn't open. Try again.",
  "lifecycle.languages.allDone":
    "This piece already exists in every language we publish.",

  // ── Reader: the decks index (PRD-105) ───────────────────────────────────
  // The front showed only the newest deck, and neither search, the section
  // browse nor an issue's run order carried decks, so every older deck left
  // the magazine the moment a second one published.
  "decks.metaTitle": "Interactive decks",
  "decks.metaDescription":
    "Every interactive deck the magazine has published, newest first.",
  "decks.eyebrow": "Magazine · decks",
  "decks.title": "Interactive decks.",
  "decks.sub":
    "Stories the magazine tells slide by slide: reported features, photo essays and data pieces you move through at your own pace.",
  "decks.count_one": "{count} deck",
  "decks.count_other": "{count} decks",
  "decks.emptyTitle": "No decks yet.",
  "decks.emptyBody":
    "The magazine has not published an interactive deck yet. When it does, it will be here.",
  "decks.errorTitle": "We couldn't load the decks.",
  "decks.errorBody": "Something interrupted us on the way here. Try again.",
  "decks.retryCta": "Try again",
  "decks.loadMoreCta": "Load more decks",
  "decks.loadingMore": "Loading…",
  "decks.frontRailTitle": "Interactive <em>decks</em>",
  "decks.allCta": "All decks",
  "masthead.nav.decks": "Decks",

  // ── Reader: the deck page's own share and meta (DES-103) ────────────────
  "deck.share": "Share",
  "deck.shareCopied": "Link copied",
  "deck.metaDescription":
    "An interactive slide deck by {byline}, in the QueerPulse magazine.",

  // ── Reader: paged article lists (PRD-103) ───────────────────────────────
  // Search, tag browse and the section drill-down all stopped at the
  // backend's 20-row page while printing the full total.
  "articleRows.loadMoreCta": "Load more",
  "articleRows.loadingMore": "Loading…",
  "search.byAuthorLabel": "Written by",

  // ── Reader: long-read aids (PRD-113) ────────────────────────────────────
  "toolbar.shareArticleAriaLabel": "Share this article",
  "reader.progressAriaLabel": "Reading progress",
  "reader.contentsAriaLabel": "Article contents",
  "reader.contentsCta": "Contents",
  "reader.resumeText": "You left off {percent}% into this piece.",
  "reader.resumeCta": "Pick up where you were",
  "reader.resumeDismissAriaLabel": "Dismiss",

  // ── Reader comments: paging and the blanked-row label ───────────────────
  // The heading counts THREADS, which is what the endpoint's `total` is, so
  // it says conversations rather than claiming a comment count it does not
  // have. Replaces the retired `comments.heading_*`.
  "comments.headingThreads_one": "{count} conversation",
  "comments.headingThreads_other": "{count} conversations",
  "comments.loadMore": "Load more",
  "comments.loadingMore": "Loading…",
  // Fills the NAME slot on a blanked row, beside the `comments.tombstone`
  // body. Deliberately the same words the forum's own tombstone uses
  // (`forum:tombstone.author`), so one concept does not carry two terms.
  "comments.unknownAuthor": "[deleted]",
  "comments.report.subUnknown": "Tell us what's wrong with this comment.",
  "comments.report.confirmBodyUnknown":
    "Thanks. A moderator will review this comment.",

  // ── Submit a story: the real open issue (PRD-106) ───────────────────────
  // Replaces a hardcoded issue number and a deadline that had already passed.
  // Both values now come from `GET /magazine/issues/open`, and the deadline
  // line is dropped entirely when the desk has set none.
  "submitStory.issue.nameUndated": "Open for submissions",
  "submitStory.issue.noneOpen":
    "No issue is open for submissions right now. Send your pitch anyway and the desk will read it for the next one.",
  "issue.submissionDeadline.heading": "Submissions",
  "issue.submissionDeadline.label": "Submission deadline",
  "issue.submissionDeadline.hint":
    "The date writers see on the submit-story form. Leave it empty and the form shows no deadline at all.",
  "issue.submissionDeadline.savedToast": "Submission deadline saved",

  // ── Pitch tracker (DES-100) ─────────────────────────────────────────────
  // The date is locale-formatted by `fmt` before it reaches the key.
  "pitchTracker.card.submittedOn": "Submitted {date}",
};

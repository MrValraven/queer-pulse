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
  "format.readsThisWeek": "{count} reads this week",
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
  "author.notFoundBody": "They may have moved on, or the link may be incomplete.",
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
  "audio.cast.pickDeviceSub": "Pick a speaker or screen to stream this episode to.",
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
};

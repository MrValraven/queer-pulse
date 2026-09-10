/**
 * Per-day release notes: the curated highlight entry ids for each shipping day,
 * keyed by the entry date label, newest first. Up to three ids a member would
 * care about most; a day with three entries or fewer lists none, the page shows
 * them all anyway. The one-line headline for the day lives in the catalogs as
 * `marketing:changelog.releases.<yyyy-mm-dd>.headline`. Versions are computed,
 * see `assignVersions` in changelogReleases.ts.
 */
export const CHANGELOG_RELEASE_NOTES: Record<string, { highlights: string[] }> =
  {
    "10 Sep 2026": {
      // One entry this day, so the page shows it in full and needs no
      // curated highlights (see the rule in the file header).
      highlights: [],
    },
    "9 Sep 2026": {
      highlights: [
        "run-your-gathering-from-its-own-page",
        "delete-a-piece-from-the-desk",
        "the-changelog-reads-as-releases",
      ],
    },
    "8 Sep 2026": {
      highlights: [
        "link-people-and-places-from-your-bio",
        "a-library-of-shared-values-to-choose-from",
        "switch-language-from-your-account-menu",
      ],
    },
    "6 Sep 2026": {
      highlights: [
        "send-a-document-in-a-message",
        "online-gatherings-now-have-a-join-link",
        "reporting-without-an-account",
      ],
    },
    "3 Sep 2026": {
      highlights: [
        "the-installed-app-now-opens-on-a-heartbeat",
        "the-installed-app-now-opens-on-your-feed",
        "a-community-page-now-fits-a-phone-screen",
      ],
    },
    "1 Sep 2026": {
      highlights: [
        "what-you-submit-now-reaches-a-person",
        "browse-the-professional-directory-by-profession",
        "the-app-follows-your-browsers-text-size",
      ],
    },
    "31 Aug 2026": {
      highlights: [
        "one-place-for-everything-you-have-sent",
        "message-a-business-without-leaving",
        "losing-your-google-account-is-no-longer-final",
      ],
    },
    "30 Aug 2026": { highlights: [] },
    "29 Aug 2026": {
      highlights: [
        "pages-open-the-moment-you-click-them",
        "member-filters-show-how-many-people-are-behind-each-one",
        "the-nomination-form-becomes-a-form",
      ],
    },
    "28 Aug 2026": {
      highlights: [
        "the-communities-filters-fold-away",
        "your-sort-and-your-location-both-count",
        "pages-that-get-to-the-point",
      ],
    },
    "27 Aug 2026": { highlights: [] },
    "26 Aug 2026": {
      highlights: [
        "the-housing-board-is-open",
        "members-can-put-something-to-a-vote",
        "hosts-run-their-own-door",
      ],
    },
    "25 Aug 2026": {
      highlights: [
        "listing-pages-rebuild",
        "say-what-you-do-on-your-profile",
        "magazine-issues-run-the-desk",
      ],
    },
    "24 Aug 2026": {
      highlights: ["community-card-live-preview", "card-co-owner-role"],
    },
    "23 Aug 2026": {
      highlights: [
        "community-co-owners",
        "community-announcements",
        "community-notification-levels",
      ],
    },
    "22 Aug 2026": {
      highlights: [
        "membership-cards",
        "card-designer",
        "printed-membership-cards",
      ],
    },
    "21 Aug 2026": {
      highlights: [
        "push-preview-privacy",
        "community-tags-discovery",
        "account-menu-install-app",
      ],
    },
    "20 Aug 2026": {
      highlights: [
        "messages-message-requests",
        "myevents-calendar-feed-subscribe",
        "governance-proposals-voting",
      ],
    },
    "19 Aug 2026": { highlights: [] },
    "18 Aug 2026": {
      highlights: [
        "profile-who-sees-what-controls",
        "directory-ownership-claims",
        "add-to-calendar-modal",
      ],
    },
    "14 Aug 2026": { highlights: ["recognition-xp", "reframe-your-photos"] },
    "13 Aug 2026": {
      highlights: [
        "housing-listing-discovery",
        "verification-request-review",
        "getting-started-checklist",
      ],
    },
    "12 Aug 2026": {
      highlights: [
        "vetted-housing-groups",
        "flatmate-explainable-matching",
        "messaging-safety-block-report-pii",
      ],
    },
    "11 Aug 2026": {
      highlights: [
        "poet-rich-poems",
        "persona-photo-gallery",
        "profile-your-network",
      ],
    },
    "10 Aug 2026": {
      highlights: [
        "persona-pages-redesigned",
        "magazine-article-editor",
        "my-uploads",
      ],
    },
    "9 Aug 2026": {
      highlights: ["vouch-for-a-safe-space", "invite-only-community-tier"],
    },
    "5 Aug 2026": {
      highlights: [
        "collections-are-here",
        "follow-topics-you-care-about",
        "your-mentions-in-one-place",
      ],
    },
    "4 Aug 2026": {
      highlights: [
        "community-activity-in-your-feed",
        "forum-upvotes-tags-search",
        "instagram-style-mobile-profile",
      ],
    },
    "3 Aug 2026": {
      highlights: [
        "platform-wide-search",
        "real-notification-settings",
        "save-events-communities",
      ],
    },
    "31 Jul 2026": {
      highlights: ["directory-detail-polish", "review-author-avatars"],
    },
    "30 Jul 2026": {
      highlights: [
        "global-search",
        "safe-spaces-in-directory",
        "cinema-live-streaming",
      ],
    },
    "29 Jul 2026": {
      highlights: ["group-chats", "message-search", "events-hub"],
    },
    "28 Jul 2026": { highlights: ["event-photos", "push-notifications"] },
    "25 Jul 2026": { highlights: [] },
    "23 Jul 2026": { highlights: [] },
    "22 Jul 2026": { highlights: [] },
    "21 Jul 2026": { highlights: [] },
    "20 Jul 2026": { highlights: [] },
    "19 Jul 2026": { highlights: [] },
    "18 Jul 2026": { highlights: [] },
    "17 Jul 2026": { highlights: [] },
    "16 Jul 2026": { highlights: [] },
    "15 Jul 2026": { highlights: [] },
    "6 Jul 2026": { highlights: [] },
    "5 Jul 2026": { highlights: [] },
    "3 Jul 2026": { highlights: [] },
    "1 Jul 2026": { highlights: [] },
    "30 Jun 2026": { highlights: [] },
    "29 Jun 2026": { highlights: [] },
    "28 Jun 2026": { highlights: [] },
    "20 Jun 2026": { highlights: [] },
    "10 Jun 2026": { highlights: [] },
  };

import { routes } from "../../app/routeMap";

/** Dev-history category — drives the badge colour and the filter chips. */
export type ChangelogCategory =
  "feature" | "improvement" | "infrastructure" | "fix";

export interface ChangelogEntryTag {
  /** Catalog key for the "See X →" label. */
  labelKey: string;
  /** Destination route (from `routes`). */
  to: string;
}

export interface ChangelogEntry {
  /** Stable slug; also the i18n sub-namespace for this entry. */
  id: string;
  category: ChangelogCategory;
  /** Display date label, rendered as-is (e.g. "28 Jul 2026"). */
  date: string;
  /** Catalog key: `marketing:changelog.entries.<id>.title`. */
  titleKey: string;
  /** Catalog key: `marketing:changelog.entries.<id>.body`. */
  bodyKey: string;
  /** Optional deep link chip. */
  tag?: ChangelogEntryTag;
}

export interface ChangelogYear {
  year: string;
  entries: ChangelogEntry[];
}

/** A single day's worth of entries, for grouping the timeline by date. */
export interface ChangelogDay {
  date: string;
  entries: ChangelogEntry[];
}

/**
 * Collapse an already date-ordered list into day groups, so the timeline shows
 * each date once with its entries stacked beneath it. Consecutive entries that
 * share a `date` are folded together, preserving order.
 */
export function groupEntriesByDay(entries: ChangelogEntry[]): ChangelogDay[] {
  const days: ChangelogDay[] = [];
  for (const entry of entries) {
    const currentDay = days[days.length - 1];
    if (currentDay && currentDay.date === entry.date) {
      currentDay.entries.push(entry);
    } else {
      days.push({ date: entry.date, entries: [entry] });
    }
  }
  return days;
}

/** Badge label per category. */
export const TYPE_BADGE_KEYS: Record<ChangelogCategory, string> = {
  feature: "marketing:changelog.badge.feature",
  improvement: "marketing:changelog.badge.improvement",
  infrastructure: "marketing:changelog.badge.infrastructure",
  fix: "marketing:changelog.badge.fix",
};

/** Filter chips shown above the timeline. */
export const FILTERS: { id: ChangelogCategory | "all"; labelKey: string }[] = [
  { id: "all", labelKey: "marketing:changelog.filter.all" },
  { id: "feature", labelKey: "marketing:changelog.filter.feature" },
  { id: "improvement", labelKey: "marketing:changelog.filter.improvement" },
  {
    id: "infrastructure",
    labelKey: "marketing:changelog.filter.infrastructure",
  },
  { id: "fix", labelKey: "marketing:changelog.filter.fix" },
];

/** Build a title/body key pair for an entry id. */
const entryKeys = (id: string) => ({
  titleKey: `marketing:changelog.entries.${id}.title`,
  bodyKey: `marketing:changelog.entries.${id}.body`,
});

/**
 * Real development milestones, newest-first, curated from the project's commit
 * history plus the most recent (uncommitted) major pushes. All history is 2026,
 * so there is a single year block.
 */
export const CHANGELOG_DATA: ChangelogYear[] = [
  {
    year: "2026",
    entries: [
      {
        id: "community-house-rules",
        category: "feature",
        date: "23 Aug 2026",
        ...entryKeys("community-house-rules"),
        tag: {
          labelKey: "marketing:changelog.tag.communities",
          to: routes.communities,
        },
      },
      {
        id: "community-removal-bars-return",
        category: "improvement",
        date: "23 Aug 2026",
        ...entryKeys("community-removal-bars-return"),
        tag: {
          labelKey: "marketing:changelog.tag.communities",
          to: routes.communities,
        },
      },
      {
        id: "community-announcements",
        category: "feature",
        date: "23 Aug 2026",
        ...entryKeys("community-announcements"),
        tag: {
          labelKey: "marketing:changelog.tag.communities",
          to: routes.communities,
        },
      },
      {
        id: "community-notification-levels",
        category: "feature",
        date: "23 Aug 2026",
        ...entryKeys("community-notification-levels"),
        tag: {
          labelKey: "marketing:changelog.tag.communities",
          to: routes.communities,
        },
      },
      {
        id: "community-invites-any-time",
        category: "feature",
        date: "23 Aug 2026",
        ...entryKeys("community-invites-any-time"),
        tag: {
          labelKey: "marketing:changelog.tag.communities",
          to: routes.communities,
        },
      },
      {
        id: "community-join-review-context",
        category: "improvement",
        date: "23 Aug 2026",
        ...entryKeys("community-join-review-context"),
        tag: {
          labelKey: "marketing:changelog.tag.communities",
          to: routes.communities,
        },
      },
      {
        id: "community-resources-shelf",
        category: "feature",
        date: "23 Aug 2026",
        ...entryKeys("community-resources-shelf"),
        tag: {
          labelKey: "marketing:changelog.tag.communities",
          to: routes.communities,
        },
      },
      {
        id: "community-co-ownership",
        category: "feature",
        date: "23 Aug 2026",
        ...entryKeys("community-co-ownership"),
        tag: {
          labelKey: "marketing:changelog.tag.communities",
          to: routes.communities,
        },
      },
      {
        id: "community-governance-history",
        category: "feature",
        date: "23 Aug 2026",
        ...entryKeys("community-governance-history"),
        tag: {
          labelKey: "marketing:changelog.tag.communities",
          to: routes.communities,
        },
      },
      {
        id: "community-public-teaser",
        category: "feature",
        date: "23 Aug 2026",
        ...entryKeys("community-public-teaser"),
        tag: {
          labelKey: "marketing:changelog.tag.communities",
          to: routes.communities,
        },
      },
      {
        id: "community-place-and-language",
        category: "improvement",
        date: "23 Aug 2026",
        ...entryKeys("community-place-and-language"),
        tag: {
          labelKey: "marketing:changelog.tag.communities",
          to: routes.communities,
        },
      },
      {
        id: "community-welcome-and-search",
        category: "improvement",
        date: "23 Aug 2026",
        ...entryKeys("community-welcome-and-search"),
        tag: {
          labelKey: "marketing:changelog.tag.communities",
          to: routes.communities,
        },
      },
      {
        id: "community-insight-trends",
        category: "improvement",
        date: "23 Aug 2026",
        ...entryKeys("community-insight-trends"),
        tag: {
          labelKey: "marketing:changelog.tag.communities",
          to: routes.communities,
        },
      },
      {
        id: "community-pause-reason",
        category: "fix",
        date: "23 Aug 2026",
        ...entryKeys("community-pause-reason"),
        tag: {
          labelKey: "marketing:changelog.tag.communities",
          to: routes.communities,
        },
      },
      {
        id: "community-card-covers",
        category: "improvement",
        date: "23 Aug 2026",
        ...entryKeys("community-card-covers"),
        tag: {
          labelKey: "marketing:changelog.tag.communities",
          to: routes.communities,
        },
      },
      {
        id: "community-founded-month",
        category: "improvement",
        date: "23 Aug 2026",
        ...entryKeys("community-founded-month"),
        tag: {
          labelKey: "marketing:changelog.tag.communities",
          to: routes.communities,
        },
      },
      {
        id: "card-text-legibility",
        category: "improvement",
        date: "23 Aug 2026",
        ...entryKeys("card-text-legibility"),
        tag: {
          labelKey: "marketing:changelog.tag.myCards",
          to: routes.myCards,
        },
      },
      {
        id: "my-communities-cards",
        category: "improvement",
        date: "23 Aug 2026",
        ...entryKeys("my-communities-cards"),
        tag: {
          labelKey: "marketing:changelog.tag.communities",
          to: routes.communities,
        },
      },
      {
        id: "cards-load-whole",
        category: "improvement",
        date: "23 Aug 2026",
        ...entryKeys("cards-load-whole"),
        tag: {
          labelKey: "marketing:changelog.tag.myCards",
          to: routes.myCards,
        },
      },
      {
        id: "pronouns-on-membership-cards",
        category: "feature",
        date: "23 Aug 2026",
        ...entryKeys("pronouns-on-membership-cards"),
        tag: {
          labelKey: "marketing:changelog.tag.myCards",
          to: routes.myCards,
        },
      },
      {
        id: "printed-membership-cards",
        category: "feature",
        date: "22 Aug 2026",
        ...entryKeys("printed-membership-cards"),
        tag: {
          labelKey: "marketing:changelog.tag.communities",
          to: routes.communities,
        },
      },
      {
        id: "profile-back-to-origin",
        category: "improvement",
        date: "22 Aug 2026",
        ...entryKeys("profile-back-to-origin"),
        tag: {
          labelKey: "marketing:changelog.tag.members",
          to: routes.members,
        },
      },
      {
        id: "card-holder-open-card",
        category: "improvement",
        date: "22 Aug 2026",
        ...entryKeys("card-holder-open-card"),
        tag: {
          labelKey: "marketing:changelog.tag.communities",
          to: routes.communities,
        },
      },
      {
        id: "card-photo-legibility",
        category: "improvement",
        date: "22 Aug 2026",
        ...entryKeys("card-photo-legibility"),
        tag: {
          labelKey: "marketing:changelog.tag.myCards",
          to: routes.myCards,
        },
      },
      {
        id: "card-member-photos",
        category: "feature",
        date: "22 Aug 2026",
        ...entryKeys("card-member-photos"),
        tag: {
          labelKey: "marketing:changelog.tag.myCards",
          to: routes.myCards,
        },
      },
      {
        id: "card-two-sides",
        category: "feature",
        date: "22 Aug 2026",
        ...entryKeys("card-two-sides"),
        tag: {
          labelKey: "marketing:changelog.tag.myCards",
          to: routes.myCards,
        },
      },
      {
        id: "cohost-invite-copy",
        category: "fix",
        date: "22 Aug 2026",
        ...entryKeys("cohost-invite-copy"),
      },
      {
        id: "card-backgrounds",
        category: "feature",
        date: "22 Aug 2026",
        ...entryKeys("card-backgrounds"),
      },
      {
        id: "card-designer",
        category: "improvement",
        date: "22 Aug 2026",
        ...entryKeys("card-designer"),
      },
      {
        id: "membership-cards",
        category: "feature",
        date: "22 Aug 2026",
        ...entryKeys("membership-cards"),
        tag: {
          labelKey: "marketing:changelog.tag.myCards",
          to: routes.myCards,
        },
      },
      {
        id: "push-preview-privacy",
        category: "feature",
        date: "21 Aug 2026",
        ...entryKeys("push-preview-privacy"),
        tag: {
          labelKey: "marketing:changelog.tag.settings",
          to: routes.settings,
        },
      },
      {
        id: "honest-success-states",
        category: "fix",
        date: "21 Aug 2026",
        ...entryKeys("honest-success-states"),
      },
      {
        id: "reports-really-filed",
        category: "fix",
        date: "21 Aug 2026",
        ...entryKeys("reports-really-filed"),
        tag: {
          labelKey: "marketing:changelog.tag.safety",
          to: routes.safety,
        },
      },
      {
        id: "message-previews-and-drafts",
        category: "fix",
        date: "21 Aug 2026",
        ...entryKeys("message-previews-and-drafts"),
        tag: {
          labelKey: "marketing:changelog.tag.messages",
          to: routes.messages,
        },
      },
      {
        id: "moderation-holds",
        category: "improvement",
        date: "21 Aug 2026",
        ...entryKeys("moderation-holds"),
      },
      {
        id: "housing-listings-stay-reviewed",
        category: "improvement",
        date: "21 Aug 2026",
        ...entryKeys("housing-listings-stay-reviewed"),
        tag: {
          labelKey: "marketing:changelog.tag.housing",
          to: routes.housing,
        },
      },
      {
        id: "article-titles-render-plain",
        category: "fix",
        date: "21 Aug 2026",
        ...entryKeys("article-titles-render-plain"),
        tag: {
          labelKey: "marketing:changelog.tag.magazine",
          to: routes.magazine,
        },
      },
      {
        id: "communities-hub-hero-restore",
        category: "improvement",
        date: "21 Aug 2026",
        ...entryKeys("communities-hub-hero-restore"),
        tag: {
          labelKey: "marketing:changelog.tag.communities",
          to: routes.communities,
        },
      },
      {
        id: "community-tags-discovery",
        category: "feature",
        date: "21 Aug 2026",
        ...entryKeys("community-tags-discovery"),
        tag: {
          labelKey: "marketing:changelog.tag.communities",
          to: routes.communities,
        },
      },
      {
        id: "community-tags",
        category: "feature",
        date: "21 Aug 2026",
        ...entryKeys("community-tags"),
        tag: {
          labelKey: "marketing:changelog.tag.communities",
          to: routes.communities,
        },
      },
      {
        id: "account-menu-install-app",
        category: "feature",
        date: "21 Aug 2026",
        ...entryKeys("account-menu-install-app"),
      },
      {
        id: "homepage-housing-personas-showcase",
        category: "improvement",
        date: "21 Aug 2026",
        ...entryKeys("homepage-housing-personas-showcase"),
      },
      {
        id: "resources-guide-rating",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("resources-guide-rating"),
        tag: {
          labelKey: "marketing:changelog.tag.guideRating",
          to: routes.legal,
        },
      },
      {
        id: "resource-listings-and-suggestions",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("resource-listings-and-suggestions"),
        tag: { labelKey: "marketing:changelog.tag.legal", to: routes.legal },
      },
      {
        id: "admin-sitewide-announcement",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("admin-sitewide-announcement"),
      },
      {
        id: "admin-reports-page",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("admin-reports-page"),
      },
      {
        id: "magazine-sections-browse",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("magazine-sections-browse"),
        tag: {
          labelKey: "marketing:changelog.tag.magazineSections",
          to: routes.magazineSections,
        },
      },
      {
        id: "magazine-digest-real-send",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("magazine-digest-real-send"),
      },
      {
        id: "magazine-deck-convert-to-article",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("magazine-deck-convert-to-article"),
      },
      {
        id: "magazine-writer-read-brief",
        category: "fix",
        date: "20 Aug 2026",
        ...entryKeys("magazine-writer-read-brief"),
        tag: {
          labelKey: "marketing:changelog.tag.magazineWriter",
          to: routes.magazineWriter,
        },
      },
      {
        id: "admin-trust-network-cite-evidence",
        category: "fix",
        date: "20 Aug 2026",
        ...entryKeys("admin-trust-network-cite-evidence"),
      },
      {
        id: "admin-trust-network-ring-detection",
        category: "improvement",
        date: "20 Aug 2026",
        ...entryKeys("admin-trust-network-ring-detection"),
      },
      {
        id: "admin-reporter-credibility",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("admin-reporter-credibility"),
      },
      {
        id: "admin-housing-moderator-role",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("admin-housing-moderator-role"),
      },
      {
        id: "gatherings-manage-attendees-remove-promote",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("gatherings-manage-attendees-remove-promote"),
        tag: {
          labelKey: "marketing:changelog.tag.gatherings",
          to: routes.gatherings,
        },
      },
      {
        id: "myevents-calendar-feed-subscribe",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("myevents-calendar-feed-subscribe"),
        tag: {
          labelKey: "marketing:changelog.tag.myEvents",
          to: routes.myEvents,
        },
      },
      {
        id: "gatherings-recap-more-from-host",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("gatherings-recap-more-from-host"),
        tag: {
          labelKey: "marketing:changelog.tag.gatherings",
          to: routes.gatherings,
        },
      },
      {
        id: "myevents-rsvp-actions-real",
        category: "fix",
        date: "20 Aug 2026",
        ...entryKeys("myevents-rsvp-actions-real"),
        tag: {
          labelKey: "marketing:changelog.tag.myEvents",
          to: routes.myEvents,
        },
      },
      {
        id: "myevents-block-host-real",
        category: "fix",
        date: "20 Aug 2026",
        ...entryKeys("myevents-block-host-real"),
        tag: {
          labelKey: "marketing:changelog.tag.myEvents",
          to: routes.myEvents,
        },
      },
      {
        id: "myevents-reminder-indicator-honest",
        category: "fix",
        date: "20 Aug 2026",
        ...entryKeys("myevents-reminder-indicator-honest"),
        tag: {
          labelKey: "marketing:changelog.tag.myEvents",
          to: routes.myEvents,
        },
      },
      {
        id: "gatherings-edit-date-time-fix",
        category: "fix",
        date: "20 Aug 2026",
        ...entryKeys("gatherings-edit-date-time-fix"),
        tag: {
          labelKey: "marketing:changelog.tag.gatherings",
          to: routes.gatherings,
        },
      },
      {
        id: "gatherings-cancelled-page-real-content",
        category: "fix",
        date: "20 Aug 2026",
        ...entryKeys("gatherings-cancelled-page-real-content"),
        tag: {
          labelKey: "marketing:changelog.tag.gatherings",
          to: routes.gatherings,
        },
      },
      {
        id: "gatherings-cohost-roster-visible",
        category: "fix",
        date: "20 Aug 2026",
        ...entryKeys("gatherings-cohost-roster-visible"),
        tag: {
          labelKey: "marketing:changelog.tag.gatherings",
          to: routes.gatherings,
        },
      },
      {
        id: "gatherings-remove-pricing-step",
        category: "improvement",
        date: "20 Aug 2026",
        ...entryKeys("gatherings-remove-pricing-step"),
        tag: {
          labelKey: "marketing:changelog.tag.gatherings",
          to: routes.gatherings,
        },
      },
      {
        id: "messages-message-requests",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("messages-message-requests"),
        tag: {
          labelKey: "marketing:changelog.tag.messages",
          to: routes.messages,
        },
      },
      {
        id: "messages-mute-conversation",
        category: "improvement",
        date: "20 Aug 2026",
        ...entryKeys("messages-mute-conversation"),
        tag: {
          labelKey: "marketing:changelog.tag.messages",
          to: routes.messages,
        },
      },
      {
        id: "messages-search-in-chat",
        category: "improvement",
        date: "20 Aug 2026",
        ...entryKeys("messages-search-in-chat"),
        tag: {
          labelKey: "marketing:changelog.tag.messages",
          to: routes.messages,
        },
      },
      {
        id: "governance-proposals-voting",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("governance-proposals-voting"),
        tag: {
          labelKey: "marketing:changelog.tag.governance",
          to: routes.governance,
        },
      },
      {
        id: "governance-figures-honesty",
        category: "improvement",
        date: "20 Aug 2026",
        ...entryKeys("governance-figures-honesty"),
        tag: {
          labelKey: "marketing:changelog.tag.governance",
          to: routes.governance,
        },
      },
      {
        id: "communities-sister-demo-only",
        category: "fix",
        date: "20 Aug 2026",
        ...entryKeys("communities-sister-demo-only"),
        tag: {
          labelKey: "marketing:changelog.tag.communities",
          to: routes.communities,
        },
      },
      {
        id: "communities-category-filter",
        category: "fix",
        date: "20 Aug 2026",
        ...entryKeys("communities-category-filter"),
        tag: {
          labelKey: "marketing:changelog.tag.communities",
          to: routes.communities,
        },
      },
      {
        id: "communities-archive-reversible",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("communities-archive-reversible"),
        tag: {
          labelKey: "marketing:changelog.tag.communities",
          to: routes.communities,
        },
      },
      {
        id: "changemakers-nomination-reason",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("changemakers-nomination-reason"),
        tag: {
          labelKey: "marketing:changelog.tag.changemakers",
          to: routes.changemakers,
        },
      },
      {
        id: "changemakers-nomination-review",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("changemakers-nomination-review"),
        tag: {
          labelKey: "marketing:changelog.tag.changemakers",
          to: routes.changemakers,
        },
      },
      {
        id: "changemakers-connect-honest",
        category: "fix",
        date: "20 Aug 2026",
        ...entryKeys("changemakers-connect-honest"),
        tag: {
          labelKey: "marketing:changelog.tag.changemakers",
          to: routes.changemakers,
        },
      },
      {
        id: "moderation-assign-to-me",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("moderation-assign-to-me"),
      },
      {
        id: "moderation-report-history-link",
        category: "improvement",
        date: "20 Aug 2026",
        ...entryKeys("moderation-report-history-link"),
      },
      {
        id: "moderation-resolution-detail",
        category: "fix",
        date: "20 Aug 2026",
        ...entryKeys("moderation-resolution-detail"),
      },
      {
        id: "moderation-sla-overdue",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("moderation-sla-overdue"),
      },
      {
        id: "moderation-bulk-actions-expanded",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("moderation-bulk-actions-expanded"),
      },
      {
        id: "moderation-appeal-integrity",
        category: "fix",
        date: "20 Aug 2026",
        ...entryKeys("moderation-appeal-integrity"),
      },
      {
        id: "forum-write-rate-limit",
        category: "improvement",
        date: "20 Aug 2026",
        ...entryKeys("forum-write-rate-limit"),
        tag: { labelKey: "marketing:changelog.tag.forum", to: routes.forum },
      },
      {
        id: "forum-first-post-accuracy",
        category: "fix",
        date: "20 Aug 2026",
        ...entryKeys("forum-first-post-accuracy"),
        tag: { labelKey: "marketing:changelog.tag.forum", to: routes.forum },
      },
      {
        id: "forum-lock-reason",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("forum-lock-reason"),
        tag: { labelKey: "marketing:changelog.tag.forum", to: routes.forum },
      },
      {
        id: "forum-shareable-filters",
        category: "improvement",
        date: "20 Aug 2026",
        ...entryKeys("forum-shareable-filters"),
        tag: { labelKey: "marketing:changelog.tag.forum", to: routes.forum },
      },
      {
        id: "forum-search-hint",
        category: "improvement",
        date: "20 Aug 2026",
        ...entryKeys("forum-search-hint"),
        tag: { labelKey: "marketing:changelog.tag.forum", to: routes.forum },
      },
      {
        id: "forum-most-helpful-real",
        category: "fix",
        date: "20 Aug 2026",
        ...entryKeys("forum-most-helpful-real"),
        tag: { labelKey: "marketing:changelog.tag.forum", to: routes.forum },
      },
      {
        id: "recognition-locked-badges-honest",
        category: "fix",
        date: "20 Aug 2026",
        ...entryKeys("recognition-locked-badges-honest"),
        tag: { labelKey: "marketing:changelog.tag.badges", to: routes.badges },
      },
      {
        id: "recognition-vouch-perk-copy",
        category: "fix",
        date: "20 Aug 2026",
        ...entryKeys("recognition-vouch-perk-copy"),
        tag: { labelKey: "marketing:changelog.tag.vouch", to: routes.vouch },
      },
      {
        id: "recognition-visible-on-profiles",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("recognition-visible-on-profiles"),
        tag: { labelKey: "marketing:changelog.tag.badges", to: routes.badges },
      },
      {
        id: "vouch-daily-cap",
        category: "improvement",
        date: "20 Aug 2026",
        ...entryKeys("vouch-daily-cap"),
        tag: { labelKey: "marketing:changelog.tag.vouch", to: routes.vouch },
      },
      {
        id: "magazine-article-publish-schedule",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("magazine-article-publish-schedule"),
        tag: {
          labelKey: "marketing:changelog.tag.magazine",
          to: routes.magazine,
        },
      },
      {
        id: "magazine-writer-draft-paste-fix",
        category: "fix",
        date: "20 Aug 2026",
        ...entryKeys("magazine-writer-draft-paste-fix"),
        tag: {
          labelKey: "marketing:changelog.tag.magazineWriter",
          to: routes.magazineWriter,
        },
      },
      {
        id: "magazine-live-discovery",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("magazine-live-discovery"),
        tag: {
          labelKey: "marketing:changelog.tag.magazine",
          to: routes.magazine,
        },
      },
      {
        id: "culture-submissions-real",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("culture-submissions-real"),
        tag: {
          labelKey: "marketing:changelog.tag.culture",
          to: routes.culture,
        },
      },
      {
        id: "culture-radio-honest",
        category: "fix",
        date: "20 Aug 2026",
        ...entryKeys("culture-radio-honest"),
        tag: {
          labelKey: "marketing:changelog.tag.culture",
          to: routes.culture,
        },
      },
      {
        id: "newsletter-unsubscribe",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("newsletter-unsubscribe"),
      },
      {
        id: "resources-crisis-hotline-coverage",
        category: "fix",
        date: "20 Aug 2026",
        ...entryKeys("resources-crisis-hotline-coverage"),
        tag: { labelKey: "marketing:changelog.tag.safety", to: routes.safety },
      },
      {
        id: "resources-library-consolidated",
        category: "improvement",
        date: "20 Aug 2026",
        ...entryKeys("resources-library-consolidated"),
        tag: {
          labelKey: "marketing:changelog.tag.library",
          to: routes.resources,
        },
      },
      {
        id: "resources-guide-freshness",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("resources-guide-freshness"),
        tag: {
          labelKey: "marketing:changelog.tag.library",
          to: routes.resources,
        },
      },
      {
        id: "resources-suggest-edit-expanded",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("resources-suggest-edit-expanded"),
        tag: {
          labelKey: "marketing:changelog.tag.library",
          to: routes.resources,
        },
      },
      {
        id: "directory-review-reporting",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("directory-review-reporting"),
        tag: {
          labelKey: "marketing:changelog.tag.directory",
          to: routes.directory,
        },
      },
      {
        id: "directory-search-pagination",
        category: "improvement",
        date: "20 Aug 2026",
        ...entryKeys("directory-search-pagination"),
        tag: {
          labelKey: "marketing:changelog.tag.directory",
          to: routes.directory,
        },
      },
      {
        id: "directory-edit-suggestions-applied",
        category: "fix",
        date: "20 Aug 2026",
        ...entryKeys("directory-edit-suggestions-applied"),
        tag: {
          labelKey: "marketing:changelog.tag.directory",
          to: routes.directory,
        },
      },
      {
        id: "topics-follow-notifications-and-directory",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("topics-follow-notifications-and-directory"),
        tag: { labelKey: "marketing:changelog.tag.topics", to: routes.topics },
      },
      {
        id: "search-topics-real-results",
        category: "improvement",
        date: "20 Aug 2026",
        ...entryKeys("search-topics-real-results"),
        tag: { labelKey: "marketing:changelog.tag.search", to: routes.search },
      },
      {
        id: "push-devices-list",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("push-devices-list"),
        tag: {
          labelKey: "marketing:changelog.tag.pushDevices",
          to: routes.pushDevices,
        },
      },
      {
        id: "feed-connections-tab",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("feed-connections-tab"),
        tag: { labelKey: "marketing:changelog.tag.feed", to: routes.feed },
      },
      {
        id: "connections-report-now-files",
        category: "fix",
        date: "20 Aug 2026",
        ...entryKeys("connections-report-now-files"),
        tag: {
          labelKey: "marketing:changelog.tag.connections",
          to: routes.connections,
        },
      },
      {
        id: "housing-my-listings",
        category: "feature",
        date: "20 Aug 2026",
        ...entryKeys("housing-my-listings"),
        tag: {
          labelKey: "marketing:changelog.tag.housing",
          to: routes.housing,
        },
      },
      {
        id: "appeal-outcome-tracking",
        category: "fix",
        date: "20 Aug 2026",
        ...entryKeys("appeal-outcome-tracking"),
        tag: {
          labelKey: "marketing:changelog.tag.appealOutcome",
          to: routes.appealOutcome,
        },
      },
      {
        id: "quickexit-more-pages",
        category: "improvement",
        date: "20 Aug 2026",
        ...entryKeys("quickexit-more-pages"),
        tag: { labelKey: "marketing:changelog.tag.safety", to: routes.safety },
      },
      {
        id: "legal-links-reconciled",
        category: "improvement",
        date: "20 Aug 2026",
        ...entryKeys("legal-links-reconciled"),
        tag: { labelKey: "marketing:changelog.tag.terms", to: routes.terms },
      },
      {
        id: "hate-crime-resources-linked",
        category: "improvement",
        date: "20 Aug 2026",
        ...entryKeys("hate-crime-resources-linked"),
        tag: {
          labelKey: "marketing:changelog.tag.hateCrime",
          to: routes.hateCrime,
        },
      },
      {
        id: "listing-quick-edit",
        category: "improvement",
        date: "20 Aug 2026",
        ...entryKeys("listing-quick-edit"),
        tag: {
          labelKey: "marketing:changelog.tag.directory",
          to: routes.directory,
        },
      },
      {
        id: "getting-started-xp-not-awarded-fix",
        category: "fix",
        date: "19 Aug 2026",
        ...entryKeys("getting-started-xp-not-awarded-fix"),
        tag: {
          labelKey: "marketing:changelog.tag.gettingStarted",
          to: routes.gettingStarted,
        },
      },
      {
        id: "badges-levels-v2-redesign",
        category: "feature",
        date: "19 Aug 2026",
        ...entryKeys("badges-levels-v2-redesign"),
        tag: { labelKey: "marketing:changelog.tag.badges", to: routes.badges },
      },
      {
        id: "listing-preview-matches-card",
        category: "fix",
        date: "18 Aug 2026",
        ...entryKeys("listing-preview-matches-card"),
        tag: {
          labelKey: "marketing:changelog.tag.directory",
          to: routes.directory,
        },
      },
      {
        id: "profile-shapings-editor",
        category: "fix",
        date: "18 Aug 2026",
        ...entryKeys("profile-shapings-editor"),
        tag: {
          labelKey: "marketing:changelog.tag.members",
          to: routes.members,
        },
      },
      {
        id: "xp-breakdown",
        category: "feature",
        date: "18 Aug 2026",
        ...entryKeys("xp-breakdown"),
        tag: {
          labelKey: "marketing:changelog.tag.gettingStarted",
          to: routes.gettingStarted,
        },
      },
      {
        id: "profile-hero-rail-redesign",
        category: "improvement",
        date: "18 Aug 2026",
        ...entryKeys("profile-hero-rail-redesign"),
        tag: {
          labelKey: "marketing:changelog.tag.members",
          to: routes.members,
        },
      },
      {
        id: "profile-rail-stats-redesign",
        category: "improvement",
        date: "18 Aug 2026",
        ...entryKeys("profile-rail-stats-redesign"),
        tag: {
          labelKey: "marketing:changelog.tag.members",
          to: routes.members,
        },
      },
      {
        id: "profile-who-sees-what-controls",
        category: "feature",
        date: "18 Aug 2026",
        ...entryKeys("profile-who-sees-what-controls"),
        tag: {
          labelKey: "marketing:changelog.tag.members",
          to: routes.members,
        },
      },
      {
        id: "profile-your-data-panel",
        category: "feature",
        date: "18 Aug 2026",
        ...entryKeys("profile-your-data-panel"),
        tag: {
          labelKey: "marketing:changelog.tag.members",
          to: routes.members,
        },
      },
      {
        id: "profile-board-work-name-qr-updates",
        category: "improvement",
        date: "18 Aug 2026",
        ...entryKeys("profile-board-work-name-qr-updates"),
        tag: {
          labelKey: "marketing:changelog.tag.members",
          to: routes.members,
        },
      },
      {
        id: "gathering-venue-directory-link",
        category: "feature",
        date: "18 Aug 2026",
        ...entryKeys("gathering-venue-directory-link"),
        tag: {
          labelKey: "marketing:changelog.tag.gatherings",
          to: routes.gatherings,
        },
      },
      {
        id: "add-to-calendar-picker-redesign",
        category: "improvement",
        date: "18 Aug 2026",
        ...entryKeys("add-to-calendar-picker-redesign"),
        tag: {
          labelKey: "marketing:changelog.tag.myEvents",
          to: routes.myEvents,
        },
      },
      {
        id: "local-directory-card-redesign",
        category: "improvement",
        date: "18 Aug 2026",
        ...entryKeys("local-directory-card-redesign"),
        tag: {
          labelKey: "marketing:changelog.tag.directory",
          to: routes.directory,
        },
      },
      {
        id: "forum-thread-pinning",
        category: "feature",
        date: "18 Aug 2026",
        ...entryKeys("forum-thread-pinning"),
        tag: { labelKey: "marketing:changelog.tag.forum", to: routes.forum },
      },
      {
        id: "magazine-desk-notifications-cleanup",
        category: "fix",
        date: "18 Aug 2026",
        ...entryKeys("magazine-desk-notifications-cleanup"),
      },
      {
        id: "volunteer-opportunity-edit-parity",
        category: "improvement",
        date: "18 Aug 2026",
        ...entryKeys("volunteer-opportunity-edit-parity"),
        tag: {
          labelKey: "marketing:changelog.tag.volunteer",
          to: routes.volunteer,
        },
      },
      {
        id: "local-directory-sort-fix",
        category: "fix",
        date: "18 Aug 2026",
        ...entryKeys("local-directory-sort-fix"),
      },
      {
        id: "side-quests-getting-started",
        category: "feature",
        date: "18 Aug 2026",
        ...entryKeys("side-quests-getting-started"),
        tag: {
          labelKey: "marketing:changelog.tag.gettingStarted",
          to: routes.gettingStarted,
        },
      },
      {
        id: "member-directory-filters-fix",
        category: "fix",
        date: "18 Aug 2026",
        ...entryKeys("member-directory-filters-fix"),
        tag: {
          labelKey: "marketing:changelog.tag.members",
          to: routes.members,
        },
      },
      {
        id: "directory-ownership-claims",
        category: "feature",
        date: "18 Aug 2026",
        ...entryKeys("directory-ownership-claims"),
        tag: {
          labelKey: "marketing:changelog.tag.directory",
          to: routes.directory,
        },
      },
      {
        id: "session-expired-toast-fix",
        category: "fix",
        date: "18 Aug 2026",
        ...entryKeys("session-expired-toast-fix"),
      },
      {
        id: "join-request-form-fix",
        category: "fix",
        date: "18 Aug 2026",
        ...entryKeys("join-request-form-fix"),
        tag: {
          labelKey: "marketing:changelog.tag.communities",
          to: routes.communities,
        },
      },
      {
        id: "community-pulse-and-insights",
        category: "feature",
        date: "18 Aug 2026",
        ...entryKeys("community-pulse-and-insights"),
        tag: {
          labelKey: "marketing:changelog.tag.communities",
          to: routes.communities,
        },
      },
      {
        id: "onboarding-identity-and-notifications",
        category: "improvement",
        date: "18 Aug 2026",
        ...entryKeys("onboarding-identity-and-notifications"),
        tag: {
          labelKey: "marketing:changelog.tag.gettingStarted",
          to: routes.gettingStarted,
        },
      },
      {
        id: "getting-started-vouch-fix",
        category: "fix",
        date: "18 Aug 2026",
        ...entryKeys("getting-started-vouch-fix"),
        tag: {
          labelKey: "marketing:changelog.tag.gettingStarted",
          to: routes.gettingStarted,
        },
      },
      {
        id: "admin-invite-quota-controls",
        category: "improvement",
        date: "18 Aug 2026",
        ...entryKeys("admin-invite-quota-controls"),
      },
      {
        id: "invite-approval-email",
        category: "feature",
        date: "18 Aug 2026",
        ...entryKeys("invite-approval-email"),
        tag: {
          labelKey: "marketing:changelog.tag.requestInvite",
          to: routes.requestInvite,
        },
      },
      {
        id: "join-request-mutual-member-field",
        category: "improvement",
        date: "18 Aug 2026",
        ...entryKeys("join-request-mutual-member-field"),
        tag: {
          labelKey: "marketing:changelog.tag.requestInvite",
          to: routes.requestInvite,
        },
      },
      {
        id: "post-opportunity-team-picker",
        category: "improvement",
        date: "18 Aug 2026",
        ...entryKeys("post-opportunity-team-picker"),
        tag: {
          labelKey: "marketing:changelog.tag.postVolunteer",
          to: routes.postVolunteer,
        },
      },
      {
        id: "join-request-invite-email",
        category: "fix",
        date: "18 Aug 2026",
        ...entryKeys("join-request-invite-email"),
      },
      {
        id: "article-editor-header-and-send-on",
        category: "fix",
        date: "18 Aug 2026",
        ...entryKeys("article-editor-header-and-send-on"),
        tag: {
          labelKey: "marketing:changelog.tag.magazineDesk",
          to: routes.magazineEditor,
        },
      },
      {
        id: "gathering-rsvp-fix",
        category: "fix",
        date: "18 Aug 2026",
        ...entryKeys("gathering-rsvp-fix"),
        tag: {
          labelKey: "marketing:changelog.tag.gatherings",
          to: routes.gatherings,
        },
      },
      {
        id: "add-to-calendar-modal",
        category: "feature",
        date: "18 Aug 2026",
        ...entryKeys("add-to-calendar-modal"),
        tag: {
          labelKey: "marketing:changelog.tag.myEvents",
          to: routes.myEvents,
        },
      },
      {
        id: "recognition-xp",
        category: "feature",
        date: "14 Aug 2026",
        ...entryKeys("recognition-xp"),
      },
      {
        id: "communities-explained",
        category: "improvement",
        date: "14 Aug 2026",
        ...entryKeys("communities-explained"),
        tag: {
          labelKey: "marketing:changelog.tag.aboutCommunities",
          to: routes.communities,
        },
      },
      {
        id: "smoother-drag-reorder",
        category: "improvement",
        date: "14 Aug 2026",
        ...entryKeys("smoother-drag-reorder"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofiles,
        },
      },
      {
        id: "poem-translations",
        category: "feature",
        date: "14 Aug 2026",
        ...entryKeys("poem-translations"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofiles,
        },
      },
      {
        id: "reframe-your-photos",
        category: "feature",
        date: "14 Aug 2026",
        ...entryKeys("reframe-your-photos"),
      },
      {
        id: "guidelines-agree-self-tick",
        category: "improvement",
        date: "13 Aug 2026",
        ...entryKeys("guidelines-agree-self-tick"),
      },
      {
        id: "adults-only-explainer-modal",
        category: "improvement",
        date: "13 Aug 2026",
        ...entryKeys("adults-only-explainer-modal"),
      },
      {
        id: "unified-date-picker",
        category: "improvement",
        date: "13 Aug 2026",
        ...entryKeys("unified-date-picker"),
      },
      {
        id: "protect-your-work",
        category: "feature",
        date: "13 Aug 2026",
        ...entryKeys("protect-your-work"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofiles,
        },
      },
      {
        id: "verification-signals-bulk-keyboard",
        category: "feature",
        date: "13 Aug 2026",
        ...entryKeys("verification-signals-bulk-keyboard"),
      },
      {
        id: "excerpt-line-editor-reorder",
        category: "improvement",
        date: "13 Aug 2026",
        ...entryKeys("excerpt-line-editor-reorder"),
      },
      {
        id: "collaborator-member-picker",
        category: "improvement",
        date: "13 Aug 2026",
        ...entryKeys("collaborator-member-picker"),
      },
      {
        id: "unified-searchable-select",
        category: "improvement",
        date: "13 Aug 2026",
        ...entryKeys("unified-searchable-select"),
      },
      {
        id: "persona-date-month-picker",
        category: "improvement",
        date: "13 Aug 2026",
        ...entryKeys("persona-date-month-picker"),
      },
      {
        id: "verification-request-review",
        category: "feature",
        date: "13 Aug 2026",
        ...entryKeys("verification-request-review"),
      },
      {
        id: "verification-audit-trail",
        category: "feature",
        date: "13 Aug 2026",
        ...entryKeys("verification-audit-trail"),
      },
      {
        id: "community-safety-enforcement",
        category: "feature",
        date: "13 Aug 2026",
        ...entryKeys("community-safety-enforcement"),
      },
      {
        id: "member-directory-filter-crossfade",
        category: "fix",
        date: "13 Aug 2026",
        ...entryKeys("member-directory-filter-crossfade"),
        tag: {
          labelKey: "marketing:changelog.tag.members",
          to: routes.members,
        },
      },
      {
        id: "community-settings-persist",
        category: "feature",
        date: "13 Aug 2026",
        ...entryKeys("community-settings-persist"),
      },
      {
        id: "community-health-explainer",
        category: "improvement",
        date: "13 Aug 2026",
        ...entryKeys("community-health-explainer"),
      },
      {
        id: "modals-cover-full-screen",
        category: "fix",
        date: "13 Aug 2026",
        ...entryKeys("modals-cover-full-screen"),
      },
      {
        id: "inbox-menu-dropdown-visibility",
        category: "fix",
        date: "13 Aug 2026",
        ...entryKeys("inbox-menu-dropdown-visibility"),
      },
      {
        id: "governance-editable-finances",
        category: "feature",
        date: "13 Aug 2026",
        ...entryKeys("governance-editable-finances"),
      },
      {
        id: "governance-chart-upgrade",
        category: "improvement",
        date: "13 Aug 2026",
        ...entryKeys("governance-chart-upgrade"),
      },
      {
        id: "landing-live-preview",
        category: "improvement",
        date: "13 Aug 2026",
        ...entryKeys("landing-live-preview"),
      },
      {
        id: "personas-in-directory",
        category: "improvement",
        date: "13 Aug 2026",
        ...entryKeys("personas-in-directory"),
      },
      {
        id: "therapist-personas-directory",
        category: "feature",
        date: "13 Aug 2026",
        ...entryKeys("therapist-personas-directory"),
      },
      {
        id: "housing-neighbourhoods-map",
        category: "feature",
        date: "13 Aug 2026",
        ...entryKeys("housing-neighbourhoods-map"),
        tag: {
          labelKey: "marketing:changelog.tag.housing",
          to: routes.housing,
        },
      },
      {
        id: "concern-intake-live",
        category: "feature",
        date: "13 Aug 2026",
        ...entryKeys("concern-intake-live"),
        tag: {
          labelKey: "marketing:changelog.tag.governance",
          to: routes.governance,
        },
      },
      {
        id: "housing-outro-band",
        category: "fix",
        date: "13 Aug 2026",
        ...entryKeys("housing-outro-band"),
        tag: {
          labelKey: "marketing:changelog.tag.housing",
          to: routes.housing,
        },
      },
      {
        id: "gathering-audience-scope",
        category: "feature",
        date: "13 Aug 2026",
        ...entryKeys("gathering-audience-scope"),
        tag: {
          labelKey: "marketing:changelog.tag.gatherings",
          to: routes.gatherings,
        },
      },
      {
        id: "unified-pronoun-picker",
        category: "improvement",
        date: "13 Aug 2026",
        ...entryKeys("unified-pronoun-picker"),
        tag: {
          labelKey: "marketing:changelog.tag.editProfile",
          to: routes.editProfile,
        },
      },
      {
        id: "work-profile-skills-focus",
        category: "feature",
        date: "13 Aug 2026",
        ...entryKeys("work-profile-skills-focus"),
        tag: {
          labelKey: "marketing:changelog.tag.workProfile",
          to: routes.workProfile,
        },
      },
      {
        id: "profile-personal-fields",
        category: "improvement",
        date: "13 Aug 2026",
        ...entryKeys("profile-personal-fields"),
        tag: {
          labelKey: "marketing:changelog.tag.editProfile",
          to: routes.editProfile,
        },
      },
      {
        id: "feed-avatar-to-profile",
        category: "improvement",
        date: "13 Aug 2026",
        ...entryKeys("feed-avatar-to-profile"),
        tag: {
          labelKey: "marketing:changelog.tag.feed",
          to: routes.feed,
        },
      },
      {
        id: "affirming-housing-baseline",
        category: "feature",
        date: "13 Aug 2026",
        ...entryKeys("affirming-housing-baseline"),
        tag: {
          labelKey: "marketing:changelog.tag.housing",
          to: routes.housing,
        },
      },
      {
        id: "housing-listing-discovery",
        category: "feature",
        date: "13 Aug 2026",
        ...entryKeys("housing-listing-discovery"),
        tag: {
          labelKey: "marketing:changelog.tag.housing",
          to: routes.housing,
        },
      },
      {
        id: "housing-viewings-reviews",
        category: "feature",
        date: "13 Aug 2026",
        ...entryKeys("housing-viewings-reviews"),
        tag: {
          labelKey: "marketing:changelog.tag.housingViewings",
          to: routes.housingViewings,
        },
      },
      {
        id: "housing-listing-integrity",
        category: "feature",
        date: "13 Aug 2026",
        ...entryKeys("housing-listing-integrity"),
        tag: {
          labelKey: "marketing:changelog.tag.housing",
          to: routes.housing,
        },
      },
      {
        id: "vouch-multiple-relationships",
        category: "improvement",
        date: "13 Aug 2026",
        ...entryKeys("vouch-multiple-relationships"),
        tag: {
          labelKey: "marketing:changelog.tag.members",
          to: routes.members,
        },
      },
      {
        id: "getting-started-checklist",
        category: "feature",
        date: "13 Aug 2026",
        ...entryKeys("getting-started-checklist"),
        tag: {
          labelKey: "marketing:changelog.tag.gettingStarted",
          to: routes.gettingStarted,
        },
      },
      {
        id: "housing-scam-safety-tenant-rights",
        category: "feature",
        date: "12 Aug 2026",
        ...entryKeys("housing-scam-safety-tenant-rights"),
        tag: {
          labelKey: "marketing:changelog.tag.tenantRights",
          to: routes.tenantRights,
        },
      },
      {
        id: "housing-map-area-privacy",
        category: "feature",
        date: "12 Aug 2026",
        ...entryKeys("housing-map-area-privacy"),
        tag: {
          labelKey: "marketing:changelog.tag.housing",
          to: routes.housing,
        },
      },
      {
        id: "messaging-safety-block-report-pii",
        category: "feature",
        date: "12 Aug 2026",
        ...entryKeys("messaging-safety-block-report-pii"),
        tag: {
          labelKey: "marketing:changelog.tag.messages",
          to: routes.messages,
        },
      },
      {
        id: "flatmate-pronoun-pre-share",
        category: "feature",
        date: "12 Aug 2026",
        ...entryKeys("flatmate-pronoun-pre-share"),
        tag: {
          labelKey: "marketing:changelog.tag.flatmates",
          to: routes.flatmates,
        },
      },
      {
        id: "flatmate-discovery-mode",
        category: "feature",
        date: "12 Aug 2026",
        ...entryKeys("flatmate-discovery-mode"),
        tag: {
          labelKey: "marketing:changelog.tag.flatmates",
          to: routes.flatmates,
        },
      },
      {
        id: "vetted-housing-groups",
        category: "feature",
        date: "12 Aug 2026",
        ...entryKeys("vetted-housing-groups"),
        tag: {
          labelKey: "marketing:changelog.tag.housing",
          to: routes.housingGroups,
        },
      },
      {
        id: "onboarding-set-up-personas-after",
        category: "improvement",
        date: "12 Aug 2026",
        ...entryKeys("onboarding-set-up-personas-after"),
        tag: {
          labelKey: "marketing:changelog.tag.personas",
          to: routes.subprofilesDashboard,
        },
      },
      {
        id: "pin-favorite-chats-inbox-tabs",
        category: "feature",
        date: "12 Aug 2026",
        ...entryKeys("pin-favorite-chats-inbox-tabs"),
        tag: {
          labelKey: "marketing:changelog.tag.messages",
          to: routes.messages,
        },
      },
      {
        id: "identity-verification-honest-badges",
        category: "feature",
        date: "12 Aug 2026",
        ...entryKeys("identity-verification-honest-badges"),
        tag: {
          labelKey: "marketing:changelog.tag.flatmates",
          to: routes.flatmates,
        },
      },
      {
        id: "flatmate-explainable-matching",
        category: "feature",
        date: "12 Aug 2026",
        ...entryKeys("flatmate-explainable-matching"),
        tag: {
          labelKey: "marketing:changelog.tag.flatmates",
          to: routes.flatmates,
        },
      },
      {
        id: "flatmate-safe-space-identity",
        category: "feature",
        date: "12 Aug 2026",
        ...entryKeys("flatmate-safe-space-identity"),
        tag: {
          labelKey: "marketing:changelog.tag.flatmates",
          to: routes.flatmates,
        },
      },
      {
        id: "gatherings-manage-rsvp-recap-live",
        category: "feature",
        date: "12 Aug 2026",
        ...entryKeys("gatherings-manage-rsvp-recap-live"),
        tag: {
          labelKey: "marketing:changelog.tag.gatherings",
          to: routes.gatherings,
        },
      },
      {
        id: "coop-template-portuguese",
        category: "improvement",
        date: "12 Aug 2026",
        ...entryKeys("coop-template-portuguese"),
        tag: {
          labelKey: "marketing:changelog.tag.housing",
          to: routes.housingCoop,
        },
      },
      {
        id: "privacy-policy-refresh",
        category: "improvement",
        date: "12 Aug 2026",
        ...entryKeys("privacy-policy-refresh"),
        tag: {
          labelKey: "marketing:changelog.tag.privacy",
          to: routes.privacy,
        },
      },
      {
        id: "members-explainer-modal",
        category: "feature",
        date: "12 Aug 2026",
        ...entryKeys("members-explainer-modal"),
        tag: {
          labelKey: "marketing:changelog.tag.requestInvite",
          to: routes.requestInvite,
        },
      },
      {
        id: "invite-request-mutual-email",
        category: "improvement",
        date: "12 Aug 2026",
        ...entryKeys("invite-request-mutual-email"),
        tag: {
          labelKey: "marketing:changelog.tag.requestInvite",
          to: routes.requestInvite,
        },
      },
      {
        id: "report-form-guide-split",
        category: "improvement",
        date: "12 Aug 2026",
        ...entryKeys("report-form-guide-split"),
        tag: {
          labelKey: "marketing:changelog.tag.safety",
          to: routes.reporting,
        },
      },
      {
        id: "safety-page-report-form",
        category: "improvement",
        date: "12 Aug 2026",
        ...entryKeys("safety-page-report-form"),
        tag: {
          labelKey: "marketing:changelog.tag.safety",
          to: routes.safety,
        },
      },
      {
        id: "public-profile-eligibility-live",
        category: "improvement",
        date: "12 Aug 2026",
        ...entryKeys("public-profile-eligibility-live"),
        tag: {
          labelKey: "marketing:changelog.tag.profile",
          to: routes.accountProfile,
        },
      },
      {
        id: "public-profile-eligibility-tracker",
        category: "improvement",
        date: "11 Aug 2026",
        ...entryKeys("public-profile-eligibility-tracker"),
        tag: {
          labelKey: "marketing:changelog.tag.profile",
          to: routes.accountProfile,
        },
      },
      {
        id: "how-communities-work-page",
        category: "feature",
        date: "11 Aug 2026",
        ...entryKeys("how-communities-work-page"),
        tag: {
          labelKey: "marketing:changelog.tag.aboutCommunities",
          to: routes.communities,
        },
      },
      {
        id: "guidelines-read-gate",
        category: "improvement",
        date: "11 Aug 2026",
        ...entryKeys("guidelines-read-gate"),
        tag: {
          labelKey: "marketing:changelog.tag.guidelines",
          to: routes.guidelines,
        },
      },
      {
        id: "guidelines-in-sheet",
        category: "improvement",
        date: "11 Aug 2026",
        ...entryKeys("guidelines-in-sheet"),
        tag: {
          labelKey: "marketing:changelog.tag.guidelines",
          to: routes.guidelines,
        },
      },
      {
        id: "coming-out-guide-public",
        category: "fix",
        date: "11 Aug 2026",
        ...entryKeys("coming-out-guide-public"),
        tag: {
          labelKey: "marketing:changelog.tag.comingOut",
          to: routes.comingOut,
        },
      },
      {
        id: "poem-editor-v2",
        category: "improvement",
        date: "11 Aug 2026",
        ...entryKeys("poem-editor-v2"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofiles,
        },
      },
      {
        id: "under18-open-invite",
        category: "improvement",
        date: "11 Aug 2026",
        ...entryKeys("under18-open-invite"),
        tag: {
          labelKey: "marketing:changelog.tag.library",
          to: routes.library,
        },
      },
      {
        id: "adults-only-explainer",
        category: "improvement",
        date: "11 Aug 2026",
        ...entryKeys("adults-only-explainer"),
        tag: {
          labelKey: "marketing:changelog.tag.terms",
          to: routes.terms,
        },
      },
      {
        id: "persona-excerpt-crash-fix",
        category: "fix",
        date: "11 Aug 2026",
        ...entryKeys("persona-excerpt-crash-fix"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofiles,
        },
      },
      {
        id: "poem-line-break-fix",
        category: "fix",
        date: "11 Aug 2026",
        ...entryKeys("poem-line-break-fix"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofiles,
        },
      },
      {
        id: "meganav-highlight-illustrations",
        category: "improvement",
        date: "11 Aug 2026",
        ...entryKeys("meganav-highlight-illustrations"),
      },
      {
        id: "poet-rich-poems",
        category: "feature",
        date: "11 Aug 2026",
        ...entryKeys("poet-rich-poems"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofiles,
        },
      },
      {
        id: "persona-editor-drag-reorder",
        category: "feature",
        date: "11 Aug 2026",
        ...entryKeys("persona-editor-drag-reorder"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofiles,
        },
      },
      {
        id: "persona-item-link-picker-size",
        category: "fix",
        date: "11 Aug 2026",
        ...entryKeys("persona-item-link-picker-size"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofiles,
        },
      },
      {
        id: "persona-editor-wide-sheet",
        category: "improvement",
        date: "11 Aug 2026",
        ...entryKeys("persona-editor-wide-sheet"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofiles,
        },
      },
      {
        id: "community-featured-cards",
        category: "feature",
        date: "11 Aug 2026",
        ...entryKeys("community-featured-cards"),
        tag: {
          labelKey: "marketing:changelog.tag.communities",
          to: routes.communities,
        },
      },
      {
        id: "media-in-use-references",
        category: "feature",
        date: "11 Aug 2026",
        ...entryKeys("media-in-use-references"),
      },
      {
        id: "homepage-featured-photo-fix",
        category: "fix",
        date: "11 Aug 2026",
        ...entryKeys("homepage-featured-photo-fix"),
      },
      {
        id: "admin-media-filter-by-uploader",
        category: "improvement",
        date: "11 Aug 2026",
        ...entryKeys("admin-media-filter-by-uploader"),
      },
      {
        id: "persona-preview-banner-bleed",
        category: "improvement",
        date: "11 Aug 2026",
        ...entryKeys("persona-preview-banner-bleed"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofiles,
        },
      },
      {
        id: "magazine-archive-truthful-hero",
        category: "fix",
        date: "11 Aug 2026",
        ...entryKeys("magazine-archive-truthful-hero"),
        tag: {
          labelKey: "marketing:changelog.tag.magazine",
          to: routes.issues,
        },
      },
      {
        id: "persona-families-expansion",
        category: "feature",
        date: "11 Aug 2026",
        ...entryKeys("persona-families-expansion"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofiles,
        },
      },
      {
        id: "pole-dancer-persona",
        category: "feature",
        date: "11 Aug 2026",
        ...entryKeys("pole-dancer-persona"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofilesDashboard,
        },
      },
      {
        id: "astrologer-persona",
        category: "feature",
        date: "11 Aug 2026",
        ...entryKeys("astrologer-persona"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofilesDashboard,
        },
      },
      {
        id: "crisp-profile-photos",
        category: "fix",
        date: "11 Aug 2026",
        ...entryKeys("crisp-profile-photos"),
      },
      {
        id: "developer-persona-banner",
        category: "fix",
        date: "11 Aug 2026",
        ...entryKeys("developer-persona-banner"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofilesDashboard,
        },
      },
      {
        id: "persona-preview-edit-hidden",
        category: "fix",
        date: "11 Aug 2026",
        ...entryKeys("persona-preview-edit-hidden"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofilesDashboard,
        },
      },
      {
        id: "persona-solo-card-wide",
        category: "improvement",
        date: "11 Aug 2026",
        ...entryKeys("persona-solo-card-wide"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofilesDashboard,
        },
      },
      {
        id: "persona-performance-row-mobile",
        category: "fix",
        date: "11 Aug 2026",
        ...entryKeys("persona-performance-row-mobile"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofilesDashboard,
        },
      },
      {
        id: "endorse-persona-by-owner-name",
        category: "improvement",
        date: "11 Aug 2026",
        ...entryKeys("endorse-persona-by-owner-name"),
      },
      {
        id: "landing-featured-member-card",
        category: "improvement",
        date: "11 Aug 2026",
        ...entryKeys("landing-featured-member-card"),
        tag: {
          labelKey: "marketing:changelog.tag.members",
          to: routes.members,
        },
      },
      {
        id: "session-expiry-csrf-fix",
        category: "fix",
        date: "11 Aug 2026",
        ...entryKeys("session-expiry-csrf-fix"),
      },
      {
        id: "persona-image-remove-confirm",
        category: "improvement",
        date: "11 Aug 2026",
        ...entryKeys("persona-image-remove-confirm"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofilesDashboard,
        },
      },
      {
        id: "persona-craft-pass",
        category: "improvement",
        date: "11 Aug 2026",
        ...entryKeys("persona-craft-pass"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofilesDashboard,
        },
      },
      {
        id: "persona-audit-hardening",
        category: "improvement",
        date: "11 Aug 2026",
        ...entryKeys("persona-audit-hardening"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofilesDashboard,
        },
      },
      {
        id: "persona-followers-owner-view",
        category: "feature",
        date: "11 Aug 2026",
        ...entryKeys("persona-followers-owner-view"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofilesDashboard,
        },
      },
      {
        id: "persona-image-reuse-uploads",
        category: "feature",
        date: "11 Aug 2026",
        ...entryKeys("persona-image-reuse-uploads"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofilesDashboard,
        },
      },
      {
        id: "persona-banner-quality",
        category: "improvement",
        date: "11 Aug 2026",
        ...entryKeys("persona-banner-quality"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofilesDashboard,
        },
      },
      {
        id: "modal-close-scroll-jump",
        category: "fix",
        date: "11 Aug 2026",
        ...entryKeys("modal-close-scroll-jump"),
      },
      {
        id: "persona-gallery-multi-add",
        category: "feature",
        date: "11 Aug 2026",
        ...entryKeys("persona-gallery-multi-add"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofilesDashboard,
        },
      },
      {
        id: "persona-gallery-lightbox",
        category: "improvement",
        date: "11 Aug 2026",
        ...entryKeys("persona-gallery-lightbox"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofilesDashboard,
        },
      },
      {
        id: "persona-gig-images",
        category: "fix",
        date: "11 Aug 2026",
        ...entryKeys("persona-gig-images"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofilesDashboard,
        },
      },
      {
        id: "persona-save-all-changes",
        category: "feature",
        date: "11 Aug 2026",
        ...entryKeys("persona-save-all-changes"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofilesDashboard,
        },
      },
      {
        id: "persona-project-links",
        category: "feature",
        date: "11 Aug 2026",
        ...entryKeys("persona-project-links"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofilesDashboard,
        },
      },
      {
        id: "fix-persona-avatar-overlap",
        category: "fix",
        date: "11 Aug 2026",
        ...entryKeys("fix-persona-avatar-overlap"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofilesDashboard,
        },
      },
      {
        id: "network-modal-search",
        category: "improvement",
        date: "11 Aug 2026",
        ...entryKeys("network-modal-search"),
      },
      {
        id: "persona-page-motion",
        category: "improvement",
        date: "11 Aug 2026",
        ...entryKeys("persona-page-motion"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofilesDashboard,
        },
      },
      {
        id: "endorse-with-note",
        category: "feature",
        date: "11 Aug 2026",
        ...entryKeys("endorse-with-note"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofilesDashboard,
        },
      },
      {
        id: "persona-banner-bleed",
        category: "feature",
        date: "11 Aug 2026",
        ...entryKeys("persona-banner-bleed"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofilesDashboard,
        },
      },
      {
        id: "persona-hero-actions-tidy",
        category: "improvement",
        date: "11 Aug 2026",
        ...entryKeys("persona-hero-actions-tidy"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofilesDashboard,
        },
      },
      {
        id: "fix-member-filter-collapse",
        category: "fix",
        date: "11 Aug 2026",
        ...entryKeys("fix-member-filter-collapse"),
        tag: {
          labelKey: "marketing:changelog.tag.members",
          to: routes.members,
        },
      },
      {
        id: "fix-persona-hero-theme-colors",
        category: "fix",
        date: "11 Aug 2026",
        ...entryKeys("fix-persona-hero-theme-colors"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofilesDashboard,
        },
      },
      {
        id: "persona-photo-gallery",
        category: "feature",
        date: "11 Aug 2026",
        ...entryKeys("persona-photo-gallery"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofilesDashboard,
        },
      },
      {
        id: "profile-your-network",
        category: "feature",
        date: "11 Aug 2026",
        ...entryKeys("profile-your-network"),
      },
      {
        id: "fix-page-top-nav-overlap",
        category: "fix",
        date: "11 Aug 2026",
        ...entryKeys("fix-page-top-nav-overlap"),
      },
      {
        id: "nav-rail-redesign",
        category: "improvement",
        date: "11 Aug 2026",
        ...entryKeys("nav-rail-redesign"),
      },
      {
        id: "persona-photo-enlarge",
        category: "improvement",
        date: "11 Aug 2026",
        ...entryKeys("persona-photo-enlarge"),
      },
      {
        id: "persona-mobile-hero",
        category: "improvement",
        date: "11 Aug 2026",
        ...entryKeys("persona-mobile-hero"),
      },
      {
        id: "fix-persona-save-conflict",
        category: "fix",
        date: "11 Aug 2026",
        ...entryKeys("fix-persona-save-conflict"),
      },
      {
        id: "magazine-desk-two-tracks",
        category: "feature",
        date: "11 Aug 2026",
        ...entryKeys("magazine-desk-two-tracks"),
        tag: {
          labelKey: "marketing:changelog.tag.magazineDesk",
          to: routes.magazineEditor,
        },
      },
      {
        id: "photo-metadata-strip-hardening",
        category: "improvement",
        date: "11 Aug 2026",
        ...entryKeys("photo-metadata-strip-hardening"),
      },
      {
        id: "fix-persona-cover-overlay-leak",
        category: "fix",
        date: "11 Aug 2026",
        ...entryKeys("fix-persona-cover-overlay-leak"),
      },
      {
        id: "members-filter-panel-polish",
        category: "improvement",
        date: "11 Aug 2026",
        ...entryKeys("members-filter-panel-polish"),
        tag: {
          labelKey: "marketing:changelog.tag.members",
          to: routes.members,
        },
      },
      {
        id: "fix-persona-stage-dark-legibility",
        category: "fix",
        date: "11 Aug 2026",
        ...entryKeys("fix-persona-stage-dark-legibility"),
      },
      {
        id: "fix-persona-preview-avatar",
        category: "fix",
        date: "11 Aug 2026",
        ...entryKeys("fix-persona-preview-avatar"),
      },
      {
        id: "fix-vouch-success-self-face",
        category: "fix",
        date: "11 Aug 2026",
        ...entryKeys("fix-vouch-success-self-face"),
      },
      {
        id: "persona-readiness-estimate",
        category: "improvement",
        date: "11 Aug 2026",
        ...entryKeys("persona-readiness-estimate"),
      },
      {
        id: "fix-persona-item-drawer-scroll",
        category: "fix",
        date: "11 Aug 2026",
        ...entryKeys("fix-persona-item-drawer-scroll"),
      },
      {
        id: "my-uploads",
        category: "feature",
        date: "10 Aug 2026",
        ...entryKeys("my-uploads"),
      },
      {
        id: "profile-photo-picker",
        category: "feature",
        date: "10 Aug 2026",
        ...entryKeys("profile-photo-picker"),
      },
      {
        id: "fix-persona-image-persistence",
        category: "fix",
        date: "10 Aug 2026",
        ...entryKeys("fix-persona-image-persistence"),
      },
      {
        id: "dark-ghost-button-contrast",
        category: "fix",
        date: "10 Aug 2026",
        ...entryKeys("dark-ghost-button-contrast"),
      },
      {
        id: "admin-media-delete-and-preview-fix",
        category: "improvement",
        date: "10 Aug 2026",
        ...entryKeys("admin-media-delete-and-preview-fix"),
      },
      {
        id: "persona-editor-live-preview",
        category: "improvement",
        date: "10 Aug 2026",
        ...entryKeys("persona-editor-live-preview"),
      },
      {
        id: "fix-uploaded-avatar-not-showing",
        category: "fix",
        date: "10 Aug 2026",
        ...entryKeys("fix-uploaded-avatar-not-showing"),
      },
      {
        id: "fix-image-preview-csp",
        category: "fix",
        date: "10 Aug 2026",
        ...entryKeys("fix-image-preview-csp"),
      },
      {
        id: "use-google-profile-photo",
        category: "feature",
        date: "10 Aug 2026",
        ...entryKeys("use-google-profile-photo"),
      },
      {
        id: "skip-link-keyboard-only",
        category: "fix",
        date: "10 Aug 2026",
        ...entryKeys("skip-link-keyboard-only"),
      },
      {
        id: "enlarge-profile-photo",
        category: "improvement",
        date: "10 Aug 2026",
        ...entryKeys("enlarge-profile-photo"),
      },
      {
        id: "tap-notification-to-profile",
        category: "improvement",
        date: "10 Aug 2026",
        ...entryKeys("tap-notification-to-profile"),
        tag: {
          labelKey: "marketing:changelog.tag.notifications",
          to: routes.notifications,
        },
      },
      {
        id: "more-push-notifications",
        category: "improvement",
        date: "10 Aug 2026",
        ...entryKeys("more-push-notifications"),
        tag: {
          labelKey: "marketing:changelog.tag.settings",
          to: routes.settings,
        },
      },
      {
        id: "localized-push-notifications",
        category: "improvement",
        date: "10 Aug 2026",
        ...entryKeys("localized-push-notifications"),
        tag: {
          labelKey: "marketing:changelog.tag.settings",
          to: routes.settings,
        },
      },
      {
        id: "magazine-desk-workspace-nav",
        category: "improvement",
        date: "10 Aug 2026",
        ...entryKeys("magazine-desk-workspace-nav"),
        tag: {
          labelKey: "marketing:changelog.tag.magazineDesk",
          to: routes.magazineEditor,
        },
      },
      {
        id: "richer-push-notifications",
        category: "improvement",
        date: "10 Aug 2026",
        ...entryKeys("richer-push-notifications"),
        tag: {
          labelKey: "marketing:changelog.tag.messages",
          to: routes.messages,
        },
      },
      {
        id: "admin-uploaded-images",
        category: "feature",
        date: "10 Aug 2026",
        ...entryKeys("admin-uploaded-images"),
        tag: {
          labelKey: "marketing:changelog.entries.admin-uploaded-images.tag",
          to: routes.adminMedia,
        },
      },
      {
        id: "magazine-desk-polish-sweep",
        category: "improvement",
        date: "10 Aug 2026",
        ...entryKeys("magazine-desk-polish-sweep"),
        tag: {
          labelKey: "marketing:changelog.tag.magazine",
          to: routes.magazineEditor,
        },
      },
      {
        id: "magazine-piece-messaging",
        category: "feature",
        date: "10 Aug 2026",
        ...entryKeys("magazine-piece-messaging"),
        tag: {
          labelKey: "marketing:changelog.tag.magazine",
          to: routes.magazineEditor,
        },
      },
      {
        id: "live-press-kit-real-data",
        category: "feature",
        date: "10 Aug 2026",
        ...entryKeys("live-press-kit-real-data"),
        tag: {
          labelKey: "marketing:changelog.tag.pressKit",
          to: routes.pressKit,
        },
      },
      {
        id: "communities-and-home-merged",
        category: "improvement",
        date: "10 Aug 2026",
        ...entryKeys("communities-and-home-merged"),
        tag: {
          labelKey: "marketing:changelog.tag.communities",
          to: routes.communities,
        },
      },
      {
        id: "silent-session-recovery",
        category: "fix",
        date: "10 Aug 2026",
        ...entryKeys("silent-session-recovery"),
      },
      {
        id: "magazine-article-versions",
        category: "feature",
        date: "10 Aug 2026",
        ...entryKeys("magazine-article-versions"),
        tag: {
          labelKey: "marketing:changelog.tag.magazine",
          to: routes.magazineEditor,
        },
      },
      {
        id: "magazine-article-comments",
        category: "feature",
        date: "10 Aug 2026",
        ...entryKeys("magazine-article-comments"),
        tag: {
          labelKey: "marketing:changelog.tag.magazine",
          to: routes.magazineEditor,
        },
      },
      {
        id: "magazine-desk-live-notifications",
        category: "feature",
        date: "10 Aug 2026",
        ...entryKeys("magazine-desk-live-notifications"),
        tag: {
          labelKey: "marketing:changelog.tag.magazine",
          to: routes.magazineEditor,
        },
      },
      {
        id: "magazine-desk-wave-b-fixes",
        category: "fix",
        date: "10 Aug 2026",
        ...entryKeys("magazine-desk-wave-b-fixes"),
        tag: {
          labelKey: "marketing:changelog.tag.magazine",
          to: routes.magazineEditor,
        },
      },
      {
        id: "magazine-commission-editor-fix",
        category: "fix",
        date: "10 Aug 2026",
        ...entryKeys("magazine-commission-editor-fix"),
        tag: {
          labelKey: "marketing:changelog.tag.magazine",
          to: routes.magazineEditor,
        },
      },
      {
        id: "events-page-utility-redesign",
        category: "improvement",
        date: "10 Aug 2026",
        ...entryKeys("events-page-utility-redesign"),
        tag: {
          labelKey: "marketing:changelog.tag.events",
          to: routes.events,
        },
      },
      {
        id: "magazine-writer-workspace",
        category: "feature",
        date: "10 Aug 2026",
        ...entryKeys("magazine-writer-workspace"),
        tag: {
          labelKey: "marketing:changelog.tag.magazineWriter",
          to: routes.magazineWriter,
        },
      },
      {
        id: "magazine-issue-production",
        category: "feature",
        date: "10 Aug 2026",
        ...entryKeys("magazine-issue-production"),
        tag: {
          labelKey: "marketing:changelog.tag.magazine",
          to: routes.magazineEditor,
        },
      },
      {
        id: "persona-discovery-nudges",
        category: "feature",
        date: "10 Aug 2026",
        ...entryKeys("persona-discovery-nudges"),
        tag: {
          labelKey: "marketing:changelog.tag.personas",
          to: routes.subprofiles,
        },
      },
      {
        id: "magazine-deck-editor-redesign",
        category: "feature",
        date: "10 Aug 2026",
        ...entryKeys("magazine-deck-editor-redesign"),
        tag: {
          labelKey: "marketing:changelog.tag.magazine",
          to: routes.magazineEditor,
        },
      },
      {
        id: "persona-directory-redesign",
        category: "feature",
        date: "10 Aug 2026",
        ...entryKeys("persona-directory-redesign"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofiles,
        },
      },
      {
        id: "persona-editor-redesign",
        category: "feature",
        date: "10 Aug 2026",
        ...entryKeys("persona-editor-redesign"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofilesDashboard,
        },
      },
      {
        id: "magazine-article-editor",
        category: "feature",
        date: "10 Aug 2026",
        ...entryKeys("magazine-article-editor"),
        tag: {
          labelKey: "marketing:changelog.tag.magazine",
          to: routes.magazineEditor,
        },
      },
      {
        id: "events-and-my-events-merged",
        category: "improvement",
        date: "10 Aug 2026",
        ...entryKeys("events-and-my-events-merged"),
        tag: {
          labelKey: "marketing:changelog.tag.events",
          to: routes.events,
        },
      },
      {
        id: "persona-dashboard-redesign",
        category: "feature",
        date: "10 Aug 2026",
        ...entryKeys("persona-dashboard-redesign"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofilesDashboard,
        },
      },
      {
        id: "magazine-piece-record",
        category: "feature",
        date: "10 Aug 2026",
        ...entryKeys("magazine-piece-record"),
        tag: {
          labelKey: "marketing:changelog.tag.magazine",
          to: routes.magazineEditor,
        },
      },
      {
        id: "persona-page-unavailable-reasons",
        category: "improvement",
        date: "10 Aug 2026",
        ...entryKeys("persona-page-unavailable-reasons"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofiles,
        },
      },
      {
        id: "saved-and-searched-lists-load",
        category: "fix",
        date: "10 Aug 2026",
        ...entryKeys("saved-and-searched-lists-load"),
      },
      {
        id: "magazine-desk-redesign",
        category: "feature",
        date: "10 Aug 2026",
        ...entryKeys("magazine-desk-redesign"),
        tag: {
          labelKey: "marketing:changelog.tag.magazine",
          to: routes.magazineEditor,
        },
      },
      {
        id: "admin-overview-stat-grid-responsive",
        category: "fix",
        date: "10 Aug 2026",
        ...entryKeys("admin-overview-stat-grid-responsive"),
      },
      {
        id: "trust-network-mobile-graph-first",
        category: "fix",
        date: "10 Aug 2026",
        ...entryKeys("trust-network-mobile-graph-first"),
      },
      {
        id: "persona-pages-redesigned",
        category: "feature",
        date: "10 Aug 2026",
        ...entryKeys("persona-pages-redesigned"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofiles,
        },
      },
      {
        id: "meet-the-table",
        category: "feature",
        date: "10 Aug 2026",
        ...entryKeys("meet-the-table"),
        tag: {
          labelKey: "marketing:changelog.tag.gatherings",
          to: routes.gatherings,
        },
      },
      {
        id: "settings-mobile-nav-strips",
        category: "improvement",
        date: "9 Aug 2026",
        ...entryKeys("settings-mobile-nav-strips"),
        tag: {
          labelKey: "marketing:changelog.tag.editProfile",
          to: routes.editProfile,
        },
      },
      {
        id: "places-card-mobile-foot",
        category: "fix",
        date: "9 Aug 2026",
        ...entryKeys("places-card-mobile-foot"),
      },
      {
        id: "vouch-for-a-safe-space",
        category: "feature",
        date: "9 Aug 2026",
        ...entryKeys("vouch-for-a-safe-space"),
        tag: {
          labelKey: "marketing:changelog.tag.safeSpaces",
          to: routes.safeSpaces,
        },
      },
      {
        id: "my-events-change-list-live",
        category: "improvement",
        date: "9 Aug 2026",
        ...entryKeys("my-events-change-list-live"),
        tag: {
          labelKey: "marketing:changelog.tag.myEvents",
          to: routes.myEvents,
        },
      },
      {
        id: "applications-inside-work-hub",
        category: "improvement",
        date: "9 Aug 2026",
        ...entryKeys("applications-inside-work-hub"),
        tag: {
          labelKey: "marketing:changelog.tag.work",
          to: routes.work,
        },
      },
      {
        id: "invite-only-community-tier",
        category: "fix",
        date: "9 Aug 2026",
        ...entryKeys("invite-only-community-tier"),
        tag: {
          labelKey: "marketing:changelog.tag.communities",
          to: routes.communities,
        },
      },
      {
        id: "navbar-wordmark-no-wrap",
        category: "fix",
        date: "5 Aug 2026",
        ...entryKeys("navbar-wordmark-no-wrap"),
      },
      {
        id: "mobile-edit-profile-refresh",
        category: "improvement",
        date: "5 Aug 2026",
        ...entryKeys("mobile-edit-profile-refresh"),
      },
      {
        id: "mobile-profile-header-refresh",
        category: "improvement",
        date: "5 Aug 2026",
        ...entryKeys("mobile-profile-header-refresh"),
      },
      {
        id: "onboarding-join-and-leave",
        category: "fix",
        date: "5 Aug 2026",
        ...entryKeys("onboarding-join-and-leave"),
      },
      {
        id: "profile-edit-save-bar-mobile",
        category: "fix",
        date: "5 Aug 2026",
        ...entryKeys("profile-edit-save-bar-mobile"),
      },
      {
        id: "follow-topics-you-care-about",
        category: "feature",
        date: "5 Aug 2026",
        ...entryKeys("follow-topics-you-care-about"),
      },
      {
        id: "event-change-alerts",
        category: "feature",
        date: "5 Aug 2026",
        ...entryKeys("event-change-alerts"),
        tag: {
          labelKey: "marketing:changelog.tag.notifications",
          to: routes.notifications,
        },
      },
      {
        id: "forms-that-really-submit",
        category: "improvement",
        date: "5 Aug 2026",
        ...entryKeys("forms-that-really-submit"),
      },
      {
        id: "trust-network-replay-timeline",
        category: "improvement",
        date: "5 Aug 2026",
        ...entryKeys("trust-network-replay-timeline"),
      },
      {
        id: "pronouns-on-member-cards",
        category: "improvement",
        date: "5 Aug 2026",
        ...entryKeys("pronouns-on-member-cards"),
        tag: {
          labelKey: "marketing:changelog.tag.feed",
          to: routes.feed,
        },
      },
      {
        id: "trust-network-legend-withdrawn",
        category: "fix",
        date: "5 Aug 2026",
        ...entryKeys("trust-network-legend-withdrawn"),
      },
      {
        id: "save-events-for-later",
        category: "feature",
        date: "5 Aug 2026",
        ...entryKeys("save-events-for-later"),
        tag: {
          labelKey: "marketing:changelog.tag.gatherings",
          to: routes.gatherings,
        },
      },
      {
        id: "collections-are-here",
        category: "feature",
        date: "5 Aug 2026",
        ...entryKeys("collections-are-here"),
      },
      {
        id: "your-mentions-in-one-place",
        category: "feature",
        date: "5 Aug 2026",
        ...entryKeys("your-mentions-in-one-place"),
      },
      {
        id: "new-moderation-tools",
        category: "improvement",
        date: "5 Aug 2026",
        ...entryKeys("new-moderation-tools"),
      },
      {
        id: "reports-reach-the-team",
        category: "fix",
        date: "5 Aug 2026",
        ...entryKeys("reports-reach-the-team"),
        tag: {
          labelKey: "marketing:changelog.tag.forum",
          to: routes.forum,
        },
      },
      {
        id: "chat-recovers-after-reconnect",
        category: "improvement",
        date: "5 Aug 2026",
        ...entryKeys("chat-recovers-after-reconnect"),
        tag: {
          labelKey: "marketing:changelog.tag.messages",
          to: routes.messages,
        },
      },
      {
        id: "honest-live-states",
        category: "fix",
        date: "5 Aug 2026",
        ...entryKeys("honest-live-states"),
      },
      {
        id: "community-activity-in-your-feed",
        category: "feature",
        date: "4 Aug 2026",
        ...entryKeys("community-activity-in-your-feed"),
        tag: {
          labelKey: "marketing:changelog.tag.feed",
          to: routes.feed,
        },
      },
      {
        id: "assignable-staff-roles",
        category: "feature",
        date: "4 Aug 2026",
        ...entryKeys("assignable-staff-roles"),
        tag: {
          labelKey: "marketing:changelog.entries.assignable-staff-roles.tag",
          to: routes.adminMembers,
        },
      },
      {
        id: "feed-scroll-no-longer-sticks",
        category: "fix",
        date: "4 Aug 2026",
        ...entryKeys("feed-scroll-no-longer-sticks"),
        tag: {
          labelKey: "marketing:changelog.tag.feed",
          to: routes.feed,
        },
      },
      {
        id: "fresh-feed-card-layout",
        category: "improvement",
        date: "4 Aug 2026",
        ...entryKeys("fresh-feed-card-layout"),
        tag: {
          labelKey: "marketing:changelog.tag.feed",
          to: routes.feed,
        },
      },
      {
        id: "mobile-profile-top-breathing-room",
        category: "improvement",
        date: "4 Aug 2026",
        ...entryKeys("mobile-profile-top-breathing-room"),
      },
      {
        id: "accessible-names-screen-readers",
        category: "improvement",
        date: "4 Aug 2026",
        ...entryKeys("accessible-names-screen-readers"),
      },
      {
        id: "feature-communities-cta-jump",
        category: "fix",
        date: "4 Aug 2026",
        ...entryKeys("feature-communities-cta-jump"),
        tag: {
          labelKey:
            "marketing:changelog.entries.feature-communities-cta-jump.tag",
          to: `${routes.editProfile}#communities`,
        },
      },
      {
        id: "live-homepage-curated-sections",
        category: "feature",
        date: "4 Aug 2026",
        ...entryKeys("live-homepage-curated-sections"),
      },
      {
        id: "featured-homepage-consent-toggle",
        category: "feature",
        date: "4 Aug 2026",
        ...entryKeys("featured-homepage-consent-toggle"),
        tag: {
          labelKey:
            "marketing:changelog.entries.featured-homepage-consent-toggle.tag",
          to: `${routes.settings}?pane=visibility`,
        },
      },
      {
        id: "icons-not-text-symbols",
        category: "improvement",
        date: "4 Aug 2026",
        ...entryKeys("icons-not-text-symbols"),
      },
      {
        id: "message-alerts-out-of-notifications",
        category: "improvement",
        date: "4 Aug 2026",
        ...entryKeys("message-alerts-out-of-notifications"),
        tag: {
          labelKey: "marketing:changelog.tag.messages",
          to: routes.messages,
        },
      },
      {
        id: "shared-ui-consistency",
        category: "improvement",
        date: "4 Aug 2026",
        ...entryKeys("shared-ui-consistency"),
      },
      {
        id: "balanced-feed-grid",
        category: "improvement",
        date: "4 Aug 2026",
        ...entryKeys("balanced-feed-grid"),
        tag: {
          labelKey: "marketing:changelog.tag.feed",
          to: routes.feed,
        },
      },
      {
        id: "no-sideways-scroll-on-mobile",
        category: "fix",
        date: "4 Aug 2026",
        ...entryKeys("no-sideways-scroll-on-mobile"),
      },
      {
        id: "no-placeholder-people-in-live",
        category: "fix",
        date: "4 Aug 2026",
        ...entryKeys("no-placeholder-people-in-live"),
      },
      {
        id: "honest-roadmap-promises",
        category: "feature",
        date: "4 Aug 2026",
        ...entryKeys("honest-roadmap-promises"),
        tag: {
          labelKey: "marketing:changelog.tag.roadmap",
          to: routes.roadmap,
        },
      },
      {
        id: "invite-resend-and-qr",
        category: "feature",
        date: "4 Aug 2026",
        ...entryKeys("invite-resend-and-qr"),
        tag: {
          labelKey: "marketing:changelog.entries.invite-resend-and-qr.tag",
          to: routes.invite,
        },
      },
      {
        id: "smoother-onboarding-first-minutes",
        category: "improvement",
        date: "4 Aug 2026",
        ...entryKeys("smoother-onboarding-first-minutes"),
      },
      {
        id: "events-open-at-top",
        category: "fix",
        date: "4 Aug 2026",
        ...entryKeys("events-open-at-top"),
        tag: {
          labelKey: "marketing:changelog.entries.events-open-at-top.tag",
          to: routes.events,
        },
      },
      {
        id: "chat-header-tap-to-profile",
        category: "improvement",
        date: "4 Aug 2026",
        ...entryKeys("chat-header-tap-to-profile"),
        tag: {
          labelKey:
            "marketing:changelog.entries.chat-header-tap-to-profile.tag",
          to: routes.messages,
        },
      },
      {
        id: "sheet-close-scroll-jump-fix",
        category: "fix",
        date: "4 Aug 2026",
        ...entryKeys("sheet-close-scroll-jump-fix"),
      },
      {
        id: "listings-moderation-console",
        category: "feature",
        date: "4 Aug 2026",
        ...entryKeys("listings-moderation-console"),
      },
      {
        id: "mobile-account-you-tab",
        category: "improvement",
        date: "4 Aug 2026",
        ...entryKeys("mobile-account-you-tab"),
        tag: {
          labelKey: "marketing:changelog.tag.profile",
          to: routes.accountProfile,
        },
      },
      {
        id: "instagram-style-mobile-profile",
        category: "improvement",
        date: "4 Aug 2026",
        ...entryKeys("instagram-style-mobile-profile"),
        tag: {
          labelKey: "marketing:changelog.tag.profile",
          to: routes.accountProfile,
        },
      },
      {
        id: "forum-upvotes-tags-search",
        category: "feature",
        date: "4 Aug 2026",
        ...entryKeys("forum-upvotes-tags-search"),
        tag: {
          labelKey: "marketing:changelog.entries.forum-upvotes-tags-search.tag",
          to: routes.forum,
        },
      },
      {
        id: "list-business-wizard-overhaul",
        category: "feature",
        date: "4 Aug 2026",
        ...entryKeys("list-business-wizard-overhaul"),
        tag: {
          labelKey:
            "marketing:changelog.entries.list-business-wizard-overhaul.tag",
          to: routes.listBusiness,
        },
      },
      {
        id: "mobile-experience-pass",
        category: "improvement",
        date: "4 Aug 2026",
        ...entryKeys("mobile-experience-pass"),
      },
      {
        id: "magazine-deck-authoring",
        category: "feature",
        date: "4 Aug 2026",
        ...entryKeys("magazine-deck-authoring"),
      },
      {
        id: "moderation-outcome-notifications",
        category: "feature",
        date: "4 Aug 2026",
        ...entryKeys("moderation-outcome-notifications"),
      },
      {
        id: "community-page-polish",
        category: "improvement",
        date: "4 Aug 2026",
        ...entryKeys("community-page-polish"),
      },
      {
        id: "job-application-status",
        category: "feature",
        date: "4 Aug 2026",
        ...entryKeys("job-application-status"),
      },
      {
        id: "data-request-history",
        category: "feature",
        date: "4 Aug 2026",
        ...entryKeys("data-request-history"),
      },
      {
        id: "community-settings-controls",
        category: "feature",
        date: "4 Aug 2026",
        ...entryKeys("community-settings-controls"),
      },
      {
        id: "feed-keeps-loading",
        category: "improvement",
        date: "4 Aug 2026",
        ...entryKeys("feed-keeps-loading"),
      },
      {
        id: "faster-first-load",
        category: "improvement",
        date: "4 Aug 2026",
        ...entryKeys("faster-first-load"),
      },
      {
        id: "readable-text-contrast",
        category: "improvement",
        date: "4 Aug 2026",
        ...entryKeys("readable-text-contrast"),
      },
      {
        id: "ios-splash-screens",
        category: "improvement",
        date: "4 Aug 2026",
        ...entryKeys("ios-splash-screens"),
      },
      {
        id: "removed-content-stays-hidden",
        category: "fix",
        date: "4 Aug 2026",
        ...entryKeys("removed-content-stays-hidden"),
      },
      {
        id: "help-demo-example-live-hidden",
        category: "fix",
        date: "4 Aug 2026",
        ...entryKeys("help-demo-example-live-hidden"),
      },
      {
        id: "smaller-help-icon",
        category: "fix",
        date: "4 Aug 2026",
        ...entryKeys("smaller-help-icon"),
      },
      {
        id: "community-rules-and-tags-polish",
        category: "fix",
        date: "4 Aug 2026",
        ...entryKeys("community-rules-and-tags-polish"),
      },
      {
        id: "co-owned-subprofiles",
        category: "feature",
        date: "4 Aug 2026",
        ...entryKeys("co-owned-subprofiles"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofilesDashboard,
        },
      },
      {
        id: "smoother-mobile-navigation",
        category: "improvement",
        date: "3 Aug 2026",
        ...entryKeys("smoother-mobile-navigation"),
      },
      {
        id: "magazine-slide-decks",
        category: "feature",
        date: "3 Aug 2026",
        ...entryKeys("magazine-slide-decks"),
        tag: {
          labelKey: "marketing:changelog.tag.magazine",
          to: routes.issues,
        },
      },
      {
        id: "real-notification-settings",
        category: "feature",
        date: "3 Aug 2026",
        ...entryKeys("real-notification-settings"),
        tag: {
          labelKey: "marketing:changelog.tag.settings",
          to: routes.settings,
        },
      },
      {
        id: "platform-wide-search",
        category: "feature",
        date: "3 Aug 2026",
        ...entryKeys("platform-wide-search"),
        tag: {
          labelKey: "marketing:changelog.tag.search",
          to: routes.search,
        },
      },
      {
        id: "save-events-communities",
        category: "feature",
        date: "3 Aug 2026",
        ...entryKeys("save-events-communities"),
      },
      {
        id: "invite-revoke-oversight",
        category: "feature",
        date: "3 Aug 2026",
        ...entryKeys("invite-revoke-oversight"),
      },
      {
        id: "moderation-completeness",
        category: "improvement",
        date: "3 Aug 2026",
        ...entryKeys("moderation-completeness"),
      },
      {
        id: "account-media-safety",
        category: "improvement",
        date: "3 Aug 2026",
        ...entryKeys("account-media-safety"),
      },
      {
        id: "legal-notice-imprint",
        category: "feature",
        date: "3 Aug 2026",
        ...entryKeys("legal-notice-imprint"),
        tag: {
          labelKey: "marketing:changelog.tag.imprint",
          to: routes.imprint,
        },
      },
      {
        id: "messages-list-virtualization",
        category: "improvement",
        date: "3 Aug 2026",
        ...entryKeys("messages-list-virtualization"),
      },
      {
        id: "live-mode-honesty-sweep",
        category: "fix",
        date: "3 Aug 2026",
        ...entryKeys("live-mode-honesty-sweep"),
      },
      {
        id: "trust-network-invite-vs-vouch",
        category: "improvement",
        date: "3 Aug 2026",
        ...entryKeys("trust-network-invite-vs-vouch"),
        tag: {
          labelKey: "marketing:changelog.tag.trustNetwork",
          to: routes.adminMembers,
        },
      },
      {
        id: "frontend-reliability-hardening",
        category: "fix",
        date: "3 Aug 2026",
        ...entryKeys("frontend-reliability-hardening"),
      },
      {
        id: "screen-help-signs",
        category: "feature",
        date: "3 Aug 2026",
        ...entryKeys("screen-help-signs"),
      },
      {
        id: "crisp-profile-photos",
        category: "fix",
        date: "3 Aug 2026",
        ...entryKeys("crisp-profile-photos"),
      },
      {
        id: "performance-cost-hardening",
        category: "infrastructure",
        date: "3 Aug 2026",
        ...entryKeys("performance-cost-hardening"),
      },
      {
        id: "accessibility-i18n-pwa-hardening",
        category: "improvement",
        date: "3 Aug 2026",
        ...entryKeys("accessibility-i18n-pwa-hardening"),
      },
      {
        id: "launch-hardening-p1",
        category: "fix",
        date: "3 Aug 2026",
        ...entryKeys("launch-hardening-p1"),
      },
      {
        id: "remove-listings-from-moderation",
        category: "feature",
        date: "3 Aug 2026",
        ...entryKeys("remove-listings-from-moderation"),
      },
      {
        id: "sent-invites-status-filter",
        category: "improvement",
        date: "3 Aug 2026",
        ...entryKeys("sent-invites-status-filter"),
        tag: {
          labelKey: "marketing:changelog.tag.invite",
          to: routes.invite,
        },
      },
      {
        id: "onboarding-one-time-guard",
        category: "fix",
        date: "3 Aug 2026",
        ...entryKeys("onboarding-one-time-guard"),
      },
      {
        id: "trust-network-replay-by-joins",
        category: "improvement",
        date: "3 Aug 2026",
        ...entryKeys("trust-network-replay-by-joins"),
        tag: {
          labelKey: "marketing:changelog.tag.trustNetwork",
          to: routes.adminMembers,
        },
      },
      {
        id: "chef-mixologist-therapist-personas",
        category: "feature",
        date: "3 Aug 2026",
        ...entryKeys("chef-mixologist-therapist-personas"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofiles,
        },
      },
      {
        id: "connections-card-polish",
        category: "fix",
        date: "3 Aug 2026",
        ...entryKeys("connections-card-polish"),
        tag: {
          labelKey: "marketing:changelog.tag.connections",
          to: routes.connections,
        },
      },
      {
        id: "lightbox-focus-a11y",
        category: "fix",
        date: "3 Aug 2026",
        ...entryKeys("lightbox-focus-a11y"),
        tag: {
          labelKey: "marketing:changelog.tag.directory",
          to: routes.directory,
        },
      },
      {
        id: "directory-detail-polish",
        category: "improvement",
        date: "31 Jul 2026",
        ...entryKeys("directory-detail-polish"),
        tag: {
          labelKey: "marketing:changelog.tag.directory",
          to: routes.directory,
        },
      },
      {
        id: "review-author-avatars",
        category: "feature",
        date: "31 Jul 2026",
        ...entryKeys("review-author-avatars"),
        tag: {
          labelKey: "marketing:changelog.tag.directory",
          to: routes.directory,
        },
      },
      {
        id: "verification-in-context",
        category: "improvement",
        date: "31 Jul 2026",
        ...entryKeys("verification-in-context"),
        tag: {
          labelKey: "marketing:changelog.tag.directory",
          to: routes.directory,
        },
      },
      {
        id: "directory-collapsible-filters",
        category: "improvement",
        date: "31 Jul 2026",
        ...entryKeys("directory-collapsible-filters"),
        tag: {
          labelKey: "marketing:changelog.tag.directory",
          to: routes.directory,
        },
      },
      {
        id: "safe-spaces-in-directory",
        category: "feature",
        date: "30 Jul 2026",
        ...entryKeys("safe-spaces-in-directory"),
        tag: {
          labelKey: "marketing:changelog.tag.directory",
          to: routes.directory,
        },
      },
      {
        id: "session-refresh-csrf-race",
        category: "fix",
        date: "30 Jul 2026",
        ...entryKeys("session-refresh-csrf-race"),
      },
      {
        id: "directory-category-unify",
        category: "fix",
        date: "30 Jul 2026",
        ...entryKeys("directory-category-unify"),
        tag: {
          labelKey: "marketing:changelog.tag.directory",
          to: routes.directory,
        },
      },
      {
        id: "messages-badge-count",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("messages-badge-count"),
        tag: {
          labelKey: "marketing:changelog.tag.messages",
          to: routes.messages,
        },
      },
      {
        id: "notifications-coverage",
        category: "feature",
        date: "30 Jul 2026",
        ...entryKeys("notifications-coverage"),
        tag: {
          labelKey: "marketing:changelog.tag.notifications",
          to: routes.notifications,
        },
      },
      {
        id: "members-collapsible-filters",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("members-collapsible-filters"),
        tag: {
          labelKey: "marketing:changelog.tag.members",
          to: routes.members,
        },
      },
      {
        id: "activism-volunteer-merge",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("activism-volunteer-merge"),
        tag: {
          labelKey: "marketing:changelog.tag.volunteer",
          to: routes.volunteer,
        },
      },
      {
        id: "spaces-map-pins",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("spaces-map-pins"),
        tag: {
          labelKey: "marketing:changelog.tag.directory",
          to: routes.directory,
        },
      },
      {
        id: "creatives-subprofile",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("creatives-subprofile"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofilesDashboard,
        },
      },
      {
        id: "gathering-create-fix",
        category: "fix",
        date: "30 Jul 2026",
        ...entryKeys("gathering-create-fix"),
        tag: {
          labelKey: "marketing:changelog.tag.gatherings",
          to: routes.gatherings,
        },
      },
      {
        id: "moderation-takedowns",
        category: "fix",
        date: "30 Jul 2026",
        ...entryKeys("moderation-takedowns"),
      },
      {
        id: "directory-photos-crisp",
        category: "fix",
        date: "30 Jul 2026",
        ...entryKeys("directory-photos-crisp"),
        tag: {
          labelKey: "marketing:changelog.tag.directory",
          to: routes.directory,
        },
      },
      {
        id: "admin-role-management",
        category: "infrastructure",
        date: "30 Jul 2026",
        ...entryKeys("admin-role-management"),
      },
      {
        id: "appeal-submission",
        category: "feature",
        date: "30 Jul 2026",
        ...entryKeys("appeal-submission"),
        tag: {
          labelKey: "marketing:changelog.tag.safety",
          to: routes.appealSubmit,
        },
      },
      {
        id: "honest-report-failures",
        category: "fix",
        date: "30 Jul 2026",
        ...entryKeys("honest-report-failures"),
        tag: { labelKey: "marketing:changelog.tag.safety", to: routes.report },
      },
      {
        id: "directory-filters-and-accurate-recognition",
        category: "fix",
        date: "30 Jul 2026",
        ...entryKeys("directory-filters-and-accurate-recognition"),
        tag: {
          labelKey: "marketing:changelog.tag.members",
          to: routes.members,
        },
      },
      {
        id: "navigation-resilience",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("navigation-resilience"),
      },
      {
        id: "search-page-launcher",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("search-page-launcher"),
        tag: { labelKey: "marketing:changelog.tag.search", to: routes.search },
      },
      {
        id: "donate-honest-live",
        category: "fix",
        date: "30 Jul 2026",
        ...entryKeys("donate-honest-live"),
      },
      {
        id: "gathering-manage-coming-soon",
        category: "fix",
        date: "30 Jul 2026",
        ...entryKeys("gathering-manage-coming-soon"),
        tag: {
          labelKey: "marketing:changelog.tag.gatherings",
          to: routes.events,
        },
      },
      {
        id: "search-member-avatars",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("search-member-avatars"),
        tag: { labelKey: "marketing:changelog.tag.search", to: routes.search },
      },
      {
        id: "search-real-topics",
        category: "fix",
        date: "30 Jul 2026",
        ...entryKeys("search-real-topics"),
        tag: { labelKey: "marketing:changelog.tag.search", to: routes.search },
      },
      {
        id: "cinema-honest-live",
        category: "fix",
        date: "30 Jul 2026",
        ...entryKeys("cinema-honest-live"),
        tag: { labelKey: "marketing:changelog.tag.cinema", to: routes.cinema },
      },
      {
        id: "global-search",
        category: "feature",
        date: "30 Jul 2026",
        ...entryKeys("global-search"),
        tag: { labelKey: "marketing:changelog.tag.search", to: routes.search },
      },
      {
        id: "studio-coming-soon",
        category: "fix",
        date: "30 Jul 2026",
        ...entryKeys("studio-coming-soon"),
        tag: { labelKey: "marketing:changelog.tag.studio", to: routes.studio },
      },
      {
        id: "cinema-live-streaming",
        category: "feature",
        date: "30 Jul 2026",
        ...entryKeys("cinema-live-streaming"),
        tag: { labelKey: "marketing:changelog.tag.cinema", to: routes.cinema },
      },
      {
        id: "employer-reviews-live",
        category: "feature",
        date: "30 Jul 2026",
        ...entryKeys("employer-reviews-live"),
        tag: {
          labelKey: "marketing:changelog.tag.employerReviews",
          to: routes.employerReviews,
        },
      },
      {
        id: "block-mute-from-profile",
        category: "feature",
        date: "30 Jul 2026",
        ...entryKeys("block-mute-from-profile"),
        tag: { labelKey: "marketing:changelog.tag.safety", to: routes.safety },
      },
      {
        id: "event-push-reminders",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("event-push-reminders"),
        tag: { labelKey: "marketing:changelog.tag.events", to: routes.events },
      },
      {
        id: "report-more-surfaces",
        category: "feature",
        date: "30 Jul 2026",
        ...entryKeys("report-more-surfaces"),
        tag: { labelKey: "marketing:changelog.tag.safety", to: routes.safety },
      },
      {
        id: "profile-photo-pronouns",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("profile-photo-pronouns"),
        tag: {
          labelKey: "marketing:changelog.tag.editProfile",
          to: routes.editProfile,
        },
      },
      {
        id: "mobile-form-keyboard",
        category: "fix",
        date: "30 Jul 2026",
        ...entryKeys("mobile-form-keyboard"),
      },
      {
        id: "magazine-real-content",
        category: "fix",
        date: "30 Jul 2026",
        ...entryKeys("magazine-real-content"),
        tag: {
          labelKey: "marketing:changelog.tag.magazine",
          to: routes.issues,
        },
      },
      {
        id: "community-roadmap",
        category: "feature",
        date: "30 Jul 2026",
        ...entryKeys("community-roadmap"),
        tag: {
          labelKey: "marketing:changelog.tag.roadmap",
          to: routes.roadmap,
        },
      },
      {
        id: "listing-photos",
        category: "feature",
        date: "30 Jul 2026",
        ...entryKeys("listing-photos"),
        tag: {
          labelKey: "marketing:changelog.tag.directory",
          to: routes.directory,
        },
      },
      {
        id: "business-page-live",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("business-page-live"),
        tag: {
          labelKey: "marketing:changelog.tag.directory",
          to: routes.directory,
        },
      },
      {
        id: "business-actions",
        category: "feature",
        date: "30 Jul 2026",
        ...entryKeys("business-actions"),
        tag: {
          labelKey: "marketing:changelog.tag.directory",
          to: routes.directory,
        },
      },
      {
        id: "business-reviews-trust",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("business-reviews-trust"),
        tag: {
          labelKey: "marketing:changelog.tag.directory",
          to: routes.directory,
        },
      },
      {
        id: "business-discovery",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("business-discovery"),
        tag: {
          labelKey: "marketing:changelog.tag.directory",
          to: routes.directory,
        },
      },
      {
        id: "directory-filters-upgrade",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("directory-filters-upgrade"),
        tag: {
          labelKey: "marketing:changelog.tag.directory",
          to: routes.directory,
        },
      },
      {
        id: "public-profile-badge",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("public-profile-badge"),
        tag: {
          labelKey: "marketing:changelog.tag.profile",
          to: routes.accountProfile,
        },
      },
      {
        id: "here-for-hero",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("here-for-hero"),
        tag: {
          labelKey: "marketing:changelog.tag.profile",
          to: routes.accountProfile,
        },
      },
      {
        id: "directory-view-switcher",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("directory-view-switcher"),
        tag: {
          labelKey: "marketing:changelog.tag.directory",
          to: routes.directory,
        },
      },
      {
        id: "profile-links-fix",
        category: "fix",
        date: "30 Jul 2026",
        ...entryKeys("profile-links-fix"),
        tag: {
          labelKey: "marketing:changelog.tag.profile",
          to: routes.accountProfile,
        },
      },
      {
        id: "subprofiles-showcase",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("subprofiles-showcase"),
        tag: {
          labelKey: "marketing:changelog.tag.profile",
          to: routes.accountProfile,
        },
      },
      {
        id: "real-directory-map",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("real-directory-map"),
        tag: {
          labelKey: "marketing:changelog.tag.directory",
          to: routes.directory,
        },
      },
      {
        id: "reply-threads",
        category: "feature",
        date: "30 Jul 2026",
        ...entryKeys("reply-threads"),
        tag: { labelKey: "marketing:changelog.tag.forum", to: routes.forum },
      },
      {
        id: "copy-subprofile",
        category: "feature",
        date: "30 Jul 2026",
        ...entryKeys("copy-subprofile"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofilesDashboard,
        },
      },
      {
        id: "smoother-chat",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("smoother-chat"),
        tag: {
          labelKey: "marketing:changelog.tag.messages",
          to: routes.messages,
        },
      },
      {
        id: "safe-space-view-page",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("safe-space-view-page"),
        tag: {
          labelKey: "marketing:changelog.tag.directory",
          to: routes.directory,
        },
      },
      {
        id: "swipe-members-highlight",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("swipe-members-highlight"),
        tag: {
          labelKey: "marketing:changelog.tag.members",
          to: routes.members,
        },
      },
      {
        id: "mention-names",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("mention-names"),
        tag: {
          labelKey: "marketing:changelog.tag.messages",
          to: routes.messages,
        },
      },
      {
        id: "forward-to-groups",
        category: "feature",
        date: "30 Jul 2026",
        ...entryKeys("forward-to-groups"),
        tag: {
          labelKey: "marketing:changelog.tag.messages",
          to: routes.messages,
        },
      },
      {
        id: "invite-state-page",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("invite-state-page"),
      },
      {
        id: "chat-shortcuts",
        category: "improvement",
        date: "29 Jul 2026",
        ...entryKeys("chat-shortcuts"),
        tag: {
          labelKey: "marketing:changelog.tag.messages",
          to: routes.messages,
        },
      },
      {
        id: "events-hub",
        category: "feature",
        date: "29 Jul 2026",
        ...entryKeys("events-hub"),
        tag: { labelKey: "marketing:changelog.tag.events", to: routes.events },
      },
      {
        id: "gifs-in-chat",
        category: "feature",
        date: "29 Jul 2026",
        ...entryKeys("gifs-in-chat"),
      },
      {
        id: "privacy-and-speed",
        category: "improvement",
        date: "29 Jul 2026",
        ...entryKeys("privacy-and-speed"),
      },
      {
        id: "leaner-prerendering",
        category: "infrastructure",
        date: "29 Jul 2026",
        ...entryKeys("leaner-prerendering"),
      },
      {
        id: "admin-governance-real-data",
        category: "improvement",
        date: "29 Jul 2026",
        ...entryKeys("admin-governance-real-data"),
      },
      {
        id: "sign-in-fix",
        category: "fix",
        date: "29 Jul 2026",
        ...entryKeys("sign-in-fix"),
      },
      {
        id: "accessibility-mobile-polish",
        category: "improvement",
        date: "29 Jul 2026",
        ...entryKeys("accessibility-mobile-polish"),
      },
      {
        id: "platform-hardening",
        category: "infrastructure",
        date: "29 Jul 2026",
        ...entryKeys("platform-hardening"),
      },
      {
        id: "composer-reaction-polish",
        category: "fix",
        date: "29 Jul 2026",
        ...entryKeys("composer-reaction-polish"),
        tag: {
          labelKey: "marketing:changelog.tag.messages",
          to: routes.messages,
        },
      },
      {
        id: "chat-mentions",
        category: "feature",
        date: "29 Jul 2026",
        ...entryKeys("chat-mentions"),
        tag: {
          labelKey: "marketing:changelog.tag.messages",
          to: routes.messages,
        },
      },
      {
        id: "group-chats",
        category: "feature",
        date: "29 Jul 2026",
        ...entryKeys("group-chats"),
        tag: {
          labelKey: "marketing:changelog.tag.messages",
          to: routes.messages,
        },
      },
      {
        id: "message-search",
        category: "feature",
        date: "29 Jul 2026",
        ...entryKeys("message-search"),
        tag: {
          labelKey: "marketing:changelog.tag.messages",
          to: routes.messages,
        },
      },
      {
        id: "link-previews",
        category: "feature",
        date: "29 Jul 2026",
        ...entryKeys("link-previews"),
        tag: {
          labelKey: "marketing:changelog.tag.messages",
          to: routes.messages,
        },
      },
      {
        id: "forward-pin-star",
        category: "feature",
        date: "29 Jul 2026",
        ...entryKeys("forward-pin-star"),
        tag: {
          labelKey: "marketing:changelog.tag.messages",
          to: routes.messages,
        },
      },
      {
        id: "read-receipts",
        category: "improvement",
        date: "29 Jul 2026",
        ...entryKeys("read-receipts"),
        tag: {
          labelKey: "marketing:changelog.tag.messages",
          to: routes.messages,
        },
      },
      {
        id: "message-gestures",
        category: "improvement",
        date: "29 Jul 2026",
        ...entryKeys("message-gestures"),
        tag: {
          labelKey: "marketing:changelog.tag.messages",
          to: routes.messages,
        },
      },
      {
        id: "message-drafts",
        category: "improvement",
        date: "29 Jul 2026",
        ...entryKeys("message-drafts"),
        tag: {
          labelKey: "marketing:changelog.tag.messages",
          to: routes.messages,
        },
      },
      {
        id: "offline-outbox",
        category: "improvement",
        date: "29 Jul 2026",
        ...entryKeys("offline-outbox"),
        tag: {
          labelKey: "marketing:changelog.tag.messages",
          to: routes.messages,
        },
      },
      {
        id: "typing-indicator",
        category: "improvement",
        date: "29 Jul 2026",
        ...entryKeys("typing-indicator"),
        tag: {
          labelKey: "marketing:changelog.tag.messages",
          to: routes.messages,
        },
      },
      {
        id: "moderation-actions",
        category: "fix",
        date: "29 Jul 2026",
        ...entryKeys("moderation-actions"),
      },
      {
        id: "listing-preview-and-ask",
        category: "improvement",
        date: "29 Jul 2026",
        ...entryKeys("listing-preview-and-ask"),
      },
      {
        id: "business-map-pin",
        category: "feature",
        date: "29 Jul 2026",
        ...entryKeys("business-map-pin"),
        tag: {
          labelKey: "marketing:changelog.tag.directory",
          to: routes.directory,
        },
      },
      {
        id: "profile-editing",
        category: "feature",
        date: "29 Jul 2026",
        ...entryKeys("profile-editing"),
        tag: {
          labelKey: "marketing:changelog.tag.profile",
          to: routes.accountProfile,
        },
      },
      {
        id: "profile-communities-save",
        category: "fix",
        date: "29 Jul 2026",
        ...entryKeys("profile-communities-save"),
        tag: {
          labelKey: "marketing:changelog.tag.profile",
          to: routes.accountProfile,
        },
      },
      {
        id: "mention-types",
        category: "improvement",
        date: "29 Jul 2026",
        ...entryKeys("mention-types"),
        tag: { labelKey: "marketing:changelog.tag.forum", to: routes.forum },
      },
      {
        id: "clear-errors",
        category: "improvement",
        date: "29 Jul 2026",
        ...entryKeys("clear-errors"),
      },
      {
        id: "messaging-reactions",
        category: "fix",
        date: "29 Jul 2026",
        ...entryKeys("messaging-reactions"),
        tag: {
          labelKey: "marketing:changelog.tag.messages",
          to: routes.messages,
        },
      },
      {
        id: "event-photos",
        category: "feature",
        date: "28 Jul 2026",
        ...entryKeys("event-photos"),
        tag: {
          labelKey: "marketing:changelog.tag.gatherings",
          to: routes.gatherings,
        },
      },
      {
        id: "mentions",
        category: "feature",
        date: "28 Jul 2026",
        ...entryKeys("mentions"),
        tag: { labelKey: "marketing:changelog.tag.forum", to: routes.forum },
      },
      {
        id: "push-notifications",
        category: "feature",
        date: "28 Jul 2026",
        ...entryKeys("push-notifications"),
        tag: {
          labelKey: "marketing:changelog.tag.settings",
          to: routes.messages,
        },
      },
      {
        id: "delete-conversation",
        category: "feature",
        date: "28 Jul 2026",
        ...entryKeys("delete-conversation"),
        tag: {
          labelKey: "marketing:changelog.tag.messages",
          to: routes.messages,
        },
      },
      {
        id: "profile-communities",
        category: "feature",
        date: "28 Jul 2026",
        ...entryKeys("profile-communities"),
        tag: {
          labelKey: "marketing:changelog.tag.communities",
          to: routes.communities,
        },
      },
      {
        id: "subprofiles-upgrade",
        category: "feature",
        date: "25 Jul 2026",
        ...entryKeys("subprofiles-upgrade"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofiles,
        },
      },
      {
        id: "messaging-upgrades",
        category: "feature",
        date: "25 Jul 2026",
        ...entryKeys("messaging-upgrades"),
        tag: {
          labelKey: "marketing:changelog.tag.messages",
          to: routes.messages,
        },
      },
      {
        id: "housing",
        category: "feature",
        date: "23 Jul 2026",
        ...entryKeys("housing"),
        tag: {
          labelKey: "marketing:changelog.tag.housing",
          to: routes.housing,
        },
      },
      {
        id: "routing-cleanup",
        category: "fix",
        date: "23 Jul 2026",
        ...entryKeys("routing-cleanup"),
      },
      {
        id: "maps",
        category: "feature",
        date: "22 Jul 2026",
        ...entryKeys("maps"),
        tag: {
          labelKey: "marketing:changelog.tag.directory",
          to: routes.directory,
        },
      },
      {
        id: "genesis",
        category: "infrastructure",
        date: "21 Jul 2026",
        ...entryKeys("genesis"),
      },
      {
        id: "pwa-mobile",
        category: "infrastructure",
        date: "20 Jul 2026",
        ...entryKeys("pwa-mobile"),
      },
      {
        id: "deploy-stability",
        category: "fix",
        date: "20 Jul 2026",
        ...entryKeys("deploy-stability"),
      },
      {
        id: "performance-staff",
        category: "improvement",
        date: "19 Jul 2026",
        ...entryKeys("performance-staff"),
      },
      {
        id: "accessibility",
        category: "improvement",
        date: "18 Jul 2026",
        ...entryKeys("accessibility"),
      },
      {
        id: "i18n-complete",
        category: "infrastructure",
        date: "17 Jul 2026",
        ...entryKeys("i18n-complete"),
      },
      {
        id: "subprofiles",
        category: "feature",
        date: "16 Jul 2026",
        ...entryKeys("subprofiles"),
        tag: {
          labelKey: "marketing:changelog.tag.subprofiles",
          to: routes.subprofiles,
        },
      },
      {
        id: "live-backend",
        category: "infrastructure",
        date: "15 Jul 2026",
        ...entryKeys("live-backend"),
      },
      {
        id: "landing",
        category: "improvement",
        date: "6 Jul 2026",
        ...entryKeys("landing"),
      },
      {
        id: "studio-cinema",
        category: "feature",
        date: "5 Jul 2026",
        ...entryKeys("studio-cinema"),
        tag: { labelKey: "marketing:changelog.tag.cinema", to: routes.cinema },
      },
      {
        id: "tickets",
        category: "feature",
        date: "3 Jul 2026",
        ...entryKeys("tickets"),
      },
      {
        id: "business-directory",
        category: "feature",
        date: "1 Jul 2026",
        ...entryKeys("business-directory"),
        tag: {
          labelKey: "marketing:changelog.tag.directory",
          to: routes.directory,
        },
      },
      {
        id: "invite-flow",
        category: "feature",
        date: "30 Jun 2026",
        ...entryKeys("invite-flow"),
      },
      {
        id: "moderation-trust",
        category: "feature",
        date: "29 Jun 2026",
        ...entryKeys("moderation-trust"),
      },
      {
        id: "communities-forum",
        category: "feature",
        date: "28 Jun 2026",
        ...entryKeys("communities-forum"),
        tag: { labelKey: "marketing:changelog.tag.forum", to: routes.forum },
      },
      {
        id: "onboarding",
        category: "feature",
        date: "20 Jun 2026",
        ...entryKeys("onboarding"),
      },
      {
        id: "launch",
        category: "feature",
        date: "10 Jun 2026",
        ...entryKeys("launch"),
      },
    ],
  },
];

import { routes } from "../../app/routeMap";

/** Dev-history category — drives the badge colour and the filter chips. */
export type ChangelogCategory =
  | "feature"
  | "improvement"
  | "infrastructure"
  | "fix";

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
        id: "group-chats",
        category: "feature",
        date: "29 Jul 2026",
        ...entryKeys("group-chats"),
        tag: { labelKey: "marketing:changelog.tag.messages", to: routes.messages },
      },
      {
        id: "message-search",
        category: "feature",
        date: "29 Jul 2026",
        ...entryKeys("message-search"),
        tag: { labelKey: "marketing:changelog.tag.messages", to: routes.messages },
      },
      {
        id: "link-previews",
        category: "feature",
        date: "29 Jul 2026",
        ...entryKeys("link-previews"),
        tag: { labelKey: "marketing:changelog.tag.messages", to: routes.messages },
      },
      {
        id: "forward-pin-star",
        category: "feature",
        date: "29 Jul 2026",
        ...entryKeys("forward-pin-star"),
        tag: { labelKey: "marketing:changelog.tag.messages", to: routes.messages },
      },
      {
        id: "read-receipts",
        category: "improvement",
        date: "29 Jul 2026",
        ...entryKeys("read-receipts"),
        tag: { labelKey: "marketing:changelog.tag.messages", to: routes.messages },
      },
      {
        id: "message-gestures",
        category: "improvement",
        date: "29 Jul 2026",
        ...entryKeys("message-gestures"),
        tag: { labelKey: "marketing:changelog.tag.messages", to: routes.messages },
      },
      {
        id: "message-drafts",
        category: "improvement",
        date: "29 Jul 2026",
        ...entryKeys("message-drafts"),
        tag: { labelKey: "marketing:changelog.tag.messages", to: routes.messages },
      },
      {
        id: "offline-outbox",
        category: "improvement",
        date: "29 Jul 2026",
        ...entryKeys("offline-outbox"),
        tag: { labelKey: "marketing:changelog.tag.messages", to: routes.messages },
      },
      {
        id: "typing-indicator",
        category: "improvement",
        date: "29 Jul 2026",
        ...entryKeys("typing-indicator"),
        tag: { labelKey: "marketing:changelog.tag.messages", to: routes.messages },
      },
      {
        id: "moderation-actions",
        category: "fix",
        date: "29 Jul 2026",
        ...entryKeys("moderation-actions"),
      },
      {
        id: "business-map-pin",
        category: "feature",
        date: "29 Jul 2026",
        ...entryKeys("business-map-pin"),
        tag: { labelKey: "marketing:changelog.tag.directory", to: routes.directory },
      },
      {
        id: "profile-editing",
        category: "feature",
        date: "29 Jul 2026",
        ...entryKeys("profile-editing"),
        tag: { labelKey: "marketing:changelog.tag.profile", to: routes.accountProfile },
      },
      {
        id: "profile-communities-save",
        category: "fix",
        date: "29 Jul 2026",
        ...entryKeys("profile-communities-save"),
        tag: { labelKey: "marketing:changelog.tag.profile", to: routes.accountProfile },
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
        tag: { labelKey: "marketing:changelog.tag.messages", to: routes.messages },
      },
      {
        id: "event-photos",
        category: "feature",
        date: "28 Jul 2026",
        ...entryKeys("event-photos"),
        tag: { labelKey: "marketing:changelog.tag.gatherings", to: routes.gatherings },
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
        tag: { labelKey: "marketing:changelog.tag.settings", to: routes.messages },
      },
      {
        id: "delete-conversation",
        category: "feature",
        date: "28 Jul 2026",
        ...entryKeys("delete-conversation"),
        tag: { labelKey: "marketing:changelog.tag.messages", to: routes.messages },
      },
      {
        id: "profile-communities",
        category: "feature",
        date: "28 Jul 2026",
        ...entryKeys("profile-communities"),
        tag: { labelKey: "marketing:changelog.tag.communities", to: routes.communities },
      },
      {
        id: "subprofiles-upgrade",
        category: "feature",
        date: "25 Jul 2026",
        ...entryKeys("subprofiles-upgrade"),
        tag: { labelKey: "marketing:changelog.tag.subprofiles", to: routes.subprofiles },
      },
      {
        id: "messaging-upgrades",
        category: "feature",
        date: "25 Jul 2026",
        ...entryKeys("messaging-upgrades"),
        tag: { labelKey: "marketing:changelog.tag.messages", to: routes.messages },
      },
      {
        id: "housing",
        category: "feature",
        date: "23 Jul 2026",
        ...entryKeys("housing"),
        tag: { labelKey: "marketing:changelog.tag.housing", to: routes.housing },
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
        tag: { labelKey: "marketing:changelog.tag.directory", to: routes.directory },
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
        tag: { labelKey: "marketing:changelog.tag.subprofiles", to: routes.subprofiles },
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
        tag: { labelKey: "marketing:changelog.tag.directory", to: routes.directory },
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

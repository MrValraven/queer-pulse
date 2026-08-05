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
          labelKey: "marketing:changelog.entries.feature-communities-cta-jump.tag",
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
          labelKey: "marketing:changelog.entries.featured-homepage-consent-toggle.tag",
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
          labelKey: "marketing:changelog.entries.chat-header-tap-to-profile.tag",
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
          labelKey: "marketing:changelog.entries.list-business-wizard-overhaul.tag",
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
        tag: { labelKey: "marketing:changelog.tag.members", to: routes.members },
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
        tag: { labelKey: "marketing:changelog.tag.donate", to: routes.donate },
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
        tag: { labelKey: "marketing:changelog.tag.magazine", to: routes.issues },
      },
      {
        id: "community-roadmap",
        category: "feature",
        date: "30 Jul 2026",
        ...entryKeys("community-roadmap"),
        tag: { labelKey: "marketing:changelog.tag.roadmap", to: routes.roadmap },
      },
      {
        id: "listing-photos",
        category: "feature",
        date: "30 Jul 2026",
        ...entryKeys("listing-photos"),
        tag: { labelKey: "marketing:changelog.tag.directory", to: routes.directory },
      },
      {
        id: "business-page-live",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("business-page-live"),
        tag: { labelKey: "marketing:changelog.tag.directory", to: routes.directory },
      },
      {
        id: "business-actions",
        category: "feature",
        date: "30 Jul 2026",
        ...entryKeys("business-actions"),
        tag: { labelKey: "marketing:changelog.tag.directory", to: routes.directory },
      },
      {
        id: "business-reviews-trust",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("business-reviews-trust"),
        tag: { labelKey: "marketing:changelog.tag.directory", to: routes.directory },
      },
      {
        id: "business-discovery",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("business-discovery"),
        tag: { labelKey: "marketing:changelog.tag.directory", to: routes.directory },
      },
      {
        id: "directory-filters-upgrade",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("directory-filters-upgrade"),
        tag: { labelKey: "marketing:changelog.tag.directory", to: routes.directory },
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
        tag: { labelKey: "marketing:changelog.tag.profile", to: routes.accountProfile },
      },
      {
        id: "directory-view-switcher",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("directory-view-switcher"),
        tag: { labelKey: "marketing:changelog.tag.directory", to: routes.directory },
      },
      {
        id: "profile-links-fix",
        category: "fix",
        date: "30 Jul 2026",
        ...entryKeys("profile-links-fix"),
        tag: { labelKey: "marketing:changelog.tag.profile", to: routes.accountProfile },
      },
      {
        id: "subprofiles-showcase",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("subprofiles-showcase"),
        tag: { labelKey: "marketing:changelog.tag.profile", to: routes.accountProfile },
      },
      {
        id: "real-directory-map",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("real-directory-map"),
        tag: { labelKey: "marketing:changelog.tag.directory", to: routes.directory },
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
        tag: { labelKey: "marketing:changelog.tag.subprofiles", to: routes.subprofilesDashboard },
      },
      {
        id: "smoother-chat",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("smoother-chat"),
        tag: { labelKey: "marketing:changelog.tag.messages", to: routes.messages },
      },
      {
        id: "safe-space-view-page",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("safe-space-view-page"),
        tag: { labelKey: "marketing:changelog.tag.directory", to: routes.directory },
      },
      {
        id: "swipe-members-highlight",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("swipe-members-highlight"),
        tag: { labelKey: "marketing:changelog.tag.members", to: routes.members },
      },
      {
        id: "mention-names",
        category: "improvement",
        date: "30 Jul 2026",
        ...entryKeys("mention-names"),
        tag: { labelKey: "marketing:changelog.tag.messages", to: routes.messages },
      },
      {
        id: "forward-to-groups",
        category: "feature",
        date: "30 Jul 2026",
        ...entryKeys("forward-to-groups"),
        tag: { labelKey: "marketing:changelog.tag.messages", to: routes.messages },
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
        tag: { labelKey: "marketing:changelog.tag.messages", to: routes.messages },
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
        tag: { labelKey: "marketing:changelog.tag.messages", to: routes.messages },
      },
      {
        id: "chat-mentions",
        category: "feature",
        date: "29 Jul 2026",
        ...entryKeys("chat-mentions"),
        tag: { labelKey: "marketing:changelog.tag.messages", to: routes.messages },
      },
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

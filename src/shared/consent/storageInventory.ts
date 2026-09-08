/**
 * The single source of truth for **everything QueerPulse puts on a visitor's
 * device**, rendered by both disclosure surfaces:
 *
 * - `ConsentPreferences` — the in-app preference center, behind a per-row
 *   "what this stores" disclosure.
 * - `CookieCategoryCards` — the long-form `/cookies` page.
 *
 * One list, two consumers, so the two can never disagree. Before this existed
 * each surface carried its own hand-written table and `/cookies` published
 * seven cookie names (`qp_session`, `qp_csrf`, `qp_auth`, `qp_prefs`,
 * `qp_theme`, `qp_lang`, `qp_notif`) that **nothing in either repo ever set** —
 * a transparency page that was itself inaccurate.
 *
 * ## Keeping it true
 *
 * Every `names` entry below is copied from the code that actually writes it, so
 * adding a cookie or a storage key means adding a row here. The cookies come
 * from the backend (`src/auth/auth-cookies.ts`, `src/security/csrf.controller.ts`);
 * the device-storage rows come from the call sites listed in each `sourceHint`.
 *
 * ## i18n Pattern A
 *
 * `names` are technical identifiers and are NEVER translated. Everything a
 * human reads — purpose, lifetime — resolves through `t()`, since "Until you
 * clear it" and "15 minutes" both read differently in pt-PT.
 */

/** Where the value physically lives. Drives the "kind" column's label. */
export type StorageKind =
  "cookie" | "localStorage" | "sessionStorage" | "indexedDb" | "cache";

/**
 * Which consent row owns the entry.
 *
 * `necessary` and `functional` are BOTH always-on — functional storage holds a
 * member's own choices (theme, language, unsent drafts), which we honour rather
 * than gate behind a toggle they'd have to re-accept every visit. The consent
 * modal therefore shows them together under its one locked row; `/cookies`
 * keeps them as two cards, which is the distinction the ePrivacy wording draws.
 */
export type StorageCategory = "necessary" | "functional" | "monitoring";

export interface StorageEntry {
  id: string;
  /**
   * The literal names as they appear in the browser's storage inspector. A row
   * carries more than one when a single purpose spans several keys (all the
   * a11y preferences) or when the name varies by environment (the CSRF cookie
   * takes the `__Host-` prefix in production only).
   */
  names: string[];
  kind: StorageKind;
  category: StorageCategory;
  purposeKey: string;
  lifetimeKey: string;
  /**
   * Where in the source this is written, so the next person to audit this list
   * can check a row without grepping. Never rendered.
   */
  sourceHint: string;
}

const NS = "shared:consent.storage";

export const STORAGE_INVENTORY: StorageEntry[] = [
  // ── Cookies (set by the backend) ────────────────────────────────────────────
  {
    id: "accessToken",
    names: ["access_token"],
    kind: "cookie",
    category: "necessary",
    purposeKey: `${NS}.accessToken.purpose`,
    lifetimeKey: `${NS}.lifetime.minutes15`,
    sourceHint: "backend: src/auth/auth-cookies.ts (setAuthCookies)",
  },
  {
    id: "refreshToken",
    names: ["refresh_token"],
    kind: "cookie",
    category: "necessary",
    purposeKey: `${NS}.refreshToken.purpose`,
    lifetimeKey: `${NS}.lifetime.days30`,
    sourceHint: "backend: src/auth/auth-cookies.ts (setAuthCookies)",
  },
  {
    id: "csrfToken",
    names: ["csrf_token", "__Host-csrf_token"],
    kind: "cookie",
    category: "necessary",
    purposeKey: `${NS}.csrfToken.purpose`,
    lifetimeKey: `${NS}.lifetime.days31`,
    sourceHint: "backend: src/security/csrf.controller.ts (issue)",
  },
  {
    id: "oauthState",
    names: ["oauth_state"],
    kind: "cookie",
    category: "necessary",
    purposeKey: `${NS}.oauthState.purpose`,
    lifetimeKey: `${NS}.lifetime.minutes10`,
    sourceHint: "backend: src/auth/auth-cookies.ts (setOAuthStateCookie)",
  },

  // ── Strictly necessary device storage ───────────────────────────────────────
  {
    id: "consentChoice",
    names: ["qp.consent.v1"],
    kind: "localStorage",
    category: "necessary",
    purposeKey: `${NS}.consentChoice.purpose`,
    lifetimeKey: `${NS}.lifetime.untilCleared`,
    sourceHint: "app/providers/ConsentProvider.tsx",
  },
  {
    id: "signInProgress",
    names: [
      "qp.auth.preparing",
      "qp_reauth_token",
      "qp_reauth_expires_at",
      "qp.inviteWelcome",
      "qp.staleChunkReloadAt",
    ],
    kind: "sessionStorage",
    category: "necessary",
    purposeKey: `${NS}.signInProgress.purpose`,
    lifetimeKey: `${NS}.lifetime.untilTabClosed`,
    sourceHint:
      "app/providers/AuthProvider.tsx, features/settings/api/useReauthToken.ts, features/auth/api/pendingInvite.ts, shared/lib/staleChunkReload.ts",
  },

  // ── Functional device storage (your own choices — always on) ────────────────
  {
    id: "displayPreferences",
    names: [
      "qp-theme",
      "qp.lang",
      "qp-lang",
      "qp-nav-mode",
      "qp-nav-collapsed",
      "qp-installed",
      "qp:a11y:reduce-motion",
      "qp:a11y:text-scale",
      "qp:a11y:wide-spacing",
      "qp:a11y:focus-rings",
      "qp:a11y:skip-link",
    ],
    kind: "localStorage",
    category: "functional",
    purposeKey: `${NS}.displayPreferences.purpose`,
    lifetimeKey: `${NS}.lifetime.untilCleared`,
    sourceHint:
      "app/providers/{Theme,NavMode,DisplayMode,Accessibility}Provider.tsx, shared/i18n/locale.ts, features/settings/skipLinkPref.ts",
  },
  {
    id: "notificationPreferences",
    names: ["qp-push → prefs"],
    kind: "indexedDb",
    category: "functional",
    purposeKey: `${NS}.notificationPreferences.purpose`,
    lifetimeKey: `${NS}.lifetime.untilCleared`,
    sourceHint: "pushLang.ts, pushPrivacy.ts, pushSubStore.ts",
  },
  {
    id: "onboarding",
    names: [
      "qp.onboarding.step",
      "qp.joinRequestStatus.v1",
      "qp-launch-member",
    ],
    kind: "localStorage",
    category: "functional",
    purposeKey: `${NS}.onboarding.purpose`,
    lifetimeKey: `${NS}.lifetime.untilCleared`,
    sourceHint:
      "features/auth/OnboardingPage.tsx, features/auth/api/joinRequestStatusToken.ts, features/system/appLaunch.utils.ts",
  },
  {
    id: "drafts",
    names: [
      "qp.drafts.v1",
      "qp.messages.drafts.v1",
      "qp.forum.draft.fields.*",
      "qp-postjob-draft",
      "qp-story-draft-v1",
      "qp-listing-draft-v2",
      "qp-listing-edit-draft.v1.*",
      "qp.community-draft.*",
    ],
    kind: "localStorage",
    category: "functional",
    purposeKey: `${NS}.drafts.purpose`,
    lifetimeKey: `${NS}.lifetime.untilPostedOrCleared`,
    sourceHint:
      "app/providers/DraftsProvider.tsx, features/messages/drafts.ts, features/forum/forumDraftSnapshot.ts, features/economy/usePostJobForm.ts, features/magazine/useStoryDraft.ts, features/marketing/listBusiness/*",
  },
  {
    id: "outbox",
    names: [
      "qp.messages.outbox.v1",
      "qp.messages.conversationPrefs.v1",
      "qp.demo.deletedConversations",
    ],
    kind: "localStorage",
    category: "functional",
    purposeKey: `${NS}.outbox.purpose`,
    lifetimeKey: `${NS}.lifetime.untilDelivered`,
    sourceHint:
      "features/messages/outbox.ts, features/messages/conversationPrefs.ts, app/providers/DeletedConversationsProvider.tsx",
  },
  {
    id: "yourLists",
    names: [
      "qp.saved.v1",
      "qp.connections.v1",
      "qp.vouches.v1",
      "qp.social.v1",
      "qp.profileTheme.v1",
      "qp.nudges.v1",
    ],
    kind: "localStorage",
    category: "functional",
    purposeKey: `${NS}.yourLists.purpose`,
    lifetimeKey: `${NS}.lifetime.untilCleared`,
    sourceHint:
      "app/providers/{Saved,Connections,Vouch,ProfileTheme,Nudges}Provider.tsx, app/providers/useSocialStore.ts",
  },
  {
    id: "dismissals",
    names: [
      "qp.announcement.dismissedVersion.v1",
      "qp.installNudge.snoozedAt",
      "qp.suggestedPeople.hidden",
      "qp_forum_prompt_dismissed",
      "qp-badges-muted-categories",
      "qp-badges-story-notes",
    ],
    kind: "localStorage",
    category: "functional",
    purposeKey: `${NS}.dismissals.purpose`,
    lifetimeKey: `${NS}.lifetime.untilCleared`,
    sourceHint:
      "shared/components/system/useAnnouncementDismissal.ts, features/system/InstallNudge.tsx, features/feed/SuggestedPeopleStrip.tsx, features/forum/useForumFirstPostPrompt.ts, features/members/useBadgePreferences.ts",
  },
  {
    id: "readingPlace",
    names: [
      "qp:search:recents",
      "queerpulse:magazine:reading-position:*",
      "queerpulse.arriving.checklist.v1",
      "qp.accountExport.jobId.*",
    ],
    kind: "localStorage",
    category: "functional",
    purposeKey: `${NS}.readingPlace.purpose`,
    lifetimeKey: `${NS}.lifetime.untilCleared`,
    sourceHint:
      "features/members/searchRecents.ts, features/magazine/useArticleReadingPosition.ts, features/marketing/ArrivingChecklist.tsx, features/members/AccountDataExport.tsx",
  },
  {
    id: "panelLayout",
    names: [
      "qp.members.filterSections",
      "qp.members.filtersPanelOpen",
      "qp.adminNav.collapsed",
      "qp.adminNav.open",
      "qp.governancePolicy.railCollapsed",
      "qp.governancePolicy.previewCollapsed",
      "qp.roadmap.filters",
    ],
    kind: "localStorage",
    category: "functional",
    purposeKey: `${NS}.panelLayout.purpose`,
    lifetimeKey: `${NS}.lifetime.untilCleared`,
    sourceHint:
      "features/members/MemberDirectoryFilterPage.tsx, shared/components/layout/AdminShell.tsx, features/admin/*",
  },
  {
    id: "calculators",
    names: [
      "qp.economy.issuer",
      "qp.economy.ivaEntries",
      "qp.economy.rateBoard",
      "qp.economy.setAsidePot",
    ],
    kind: "localStorage",
    category: "functional",
    purposeKey: `${NS}.calculators.purpose`,
    lifetimeKey: `${NS}.lifetime.untilCleared`,
    sourceHint:
      "features/economy/{tools/useIssuer,IvaTrackerPage,RateBoardPage,setAside.data}.ts",
  },
  {
    id: "previewMode",
    names: [
      "qp.demoMode.v1",
      "qp_logged_in",
      "qp:demo:roadmap:v2",
      "qp-employer-affiliation",
      "qp-posted-jobs",
    ],
    kind: "localStorage",
    category: "functional",
    purposeKey: `${NS}.previewMode.purpose`,
    lifetimeKey: `${NS}.lifetime.untilCleared`,
    sourceHint:
      "app/providers/DemoModeProvider.tsx, app/providers/useDemoSession.ts, features/admin/adminRoadmap.data.ts",
  },
  {
    id: "offlineFiles",
    names: ["qp-assets", "qp-fonts", "qp-navigations"],
    kind: "cache",
    category: "functional",
    purposeKey: `${NS}.offlineFiles.purpose`,
    lifetimeKey: `${NS}.lifetime.untilCleared`,
    sourceHint: "src/sw.ts (workbox runtime caches)",
  },

  // ── Opt-in ──────────────────────────────────────────────────────────────────
  {
    id: "monitoring",
    names: ["Sentry"],
    kind: "cookie",
    category: "monitoring",
    purposeKey: `${NS}.monitoring.purpose`,
    lifetimeKey: `${NS}.lifetime.onlyWhenOn`,
    sourceHint: "shared/observability/sentry.ts (loaded only after consent)",
  },
];

/**
 * The entries a consent row is answerable for.
 *
 * The locked "strictly necessary" row covers `functional` too: both are
 * always-on, and splitting them in a two-row modal would leave a member
 * wondering which toggle the theme preference hangs off. `/cookies` keeps the
 * finer split by filtering on the category directly.
 */
export function entriesForConsentRow(
  row: "necessary" | "monitoring",
): StorageEntry[] {
  if (row === "monitoring") {
    return STORAGE_INVENTORY.filter((entry) => entry.category === "monitoring");
  }
  return STORAGE_INVENTORY.filter(
    (entry) =>
      entry.category === "necessary" || entry.category === "functional",
  );
}

/** The entries in one category, for the `/cookies` page's per-category cards. */
export function entriesInCategory(category: StorageCategory): StorageEntry[] {
  return STORAGE_INVENTORY.filter((entry) => entry.category === category);
}

/** i18n key for a `StorageKind`'s human label ("Cookie", "On your device", …). */
export function kindLabelKey(kind: StorageKind): string {
  return `${NS}.kind.${kind}`;
}

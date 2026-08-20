import type { Catalog } from "../../types";

/** Shared chrome: brand, primary CTAs, cross-cutting UI verbs, and examples. */
export const common: Catalog = {
  // Brand
  "brand.name": "QueerPulse",
  "brand.tagline": "A queer professional network, rooted in Lisbon.",

  // Primary CTAs
  "cta.requestInvite": "Request an invite",
  "cta.exploreMembers": "Explore profiles",
  "cta.backHome": "Back to home",
  "cta.signIn": "Sign in",
  "cta.signOut": "Sign out",
  "cta.search": "Search",

  // Language switcher
  "language.label": "Language",
  "language.en": "English",
  "language.pt": "Português",

  // Optimistic-write failures — shown when a save/remove is rolled back because
  // the API call failed (SavedProvider, DraftsProvider).
  "toast.saveFailed": "That didn't save. Check your connection and try again.",
  "toast.removeFailed": "That didn't update. Check your connection and try again.",

  // Reusable branded query-error state (a failed live fetch) — shown by pages
  // that swap their whole board for a retryable error instead of a false-empty
  // or an eternal skeleton (events hub, community detail, admin moderation).
  "error.title": "Something went wrong",
  "error.description":
    "We couldn't load this right now. Check your connection and try again.",
  "error.retry": "Try again",

  // Interpolation + pluralization examples (proves the helpers, and reusable).
  "greeting.welcome": "Welcome back, {name}",
  "members.count_one": "{count} member",
  "members.count_other": "{count} members",

  // Trust Network admin inspector's real deep-link into the moderation queue
  // (replaces two fake-success buttons that fired a toast and did nothing).
  // Lives here rather than admin.ts, which another change owns this wave.
  "cta.openModerationQueue": "Open in moderation queue",
  "toast.openedModerationQueue": "Opened {name}'s reports in the moderation queue.",
};

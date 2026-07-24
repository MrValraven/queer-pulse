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
  "toast.saveFailed": "That didn't save — check your connection and try again.",
  "toast.removeFailed": "That didn't update — check your connection and try again.",

  // Interpolation + pluralization examples (proves the helpers, and reusable).
  "greeting.welcome": "Welcome back, {name}",
  "members.count_one": "{count} member",
  "members.count_other": "{count} members",
};

import type { LinkVisibility, Visibility } from "./api/subprofiles.api";

// ── Publish thresholds (mirror contract C5) ──────────────────────────────────

/** Minimum bio length before an unlinked persona can go live. */
export const MIN_BIO = 80;
/** Server-side cap, surfaced here as a friendly limit on the Add affordance. */
export const MAX_ITEMS_PER_SECTION = 100;

// ── Meta-form options + copy ─────────────────────────────────────────────────

export const VISIBILITY_OPTIONS: {
  value: Visibility;
  label: string;
  help: string;
}[] = [
  {
    value: "open",
    label: "Open to everyone",
    help: "Anyone in the community can find and view this persona.",
  },
  {
    value: "network",
    label: "Your network",
    help: "Only people you're connected with can see it.",
  },
  {
    value: "private",
    label: "Just you",
    help: "Kept to yourself while you shape it.",
  },
];

/** Segmented-control labels for the link-visibility choice. */
export const LINK_OPTIONS = ["Linked", "Standalone"] as const;

export const LINK_TO_LABEL: Record<LinkVisibility, string> = {
  linked: "Linked",
  unlinked: "Standalone",
};

export const LINK_HELP: Record<LinkVisibility, string> = {
  linked:
    "Shown on your main profile as another side of you — people can see the two are the same person.",
  unlinked:
    "Stands on its own, with no visible tie to your main profile. It earns a public handle once it passes the completeness check.",
};

// ── Per-field labels for the item editor ─────────────────────────────────────
// Generic, friendly labels for the generalized item columns. Each section only
// renders the fields listed in SECTION_META[section].fields.

export const FIELD_META: Record<
  string,
  { label: string; placeholder: string; multiline?: boolean }
> = {
  title: { label: "Title", placeholder: "What's it called?" },
  subtitle: { label: "Subtitle", placeholder: "A label, venue or publisher" },
  description: {
    label: "Description",
    placeholder: "A sentence or two",
    multiline: true,
  },
  url: { label: "Link", placeholder: "https://" },
  date: { label: "Date", placeholder: "e.g. 2025" },
  meta: { label: "Detail", placeholder: "A short note" },
  tags: { label: "Tags", placeholder: "e.g. React, TypeScript" },
};

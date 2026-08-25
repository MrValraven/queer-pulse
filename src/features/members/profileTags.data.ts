/**
 * Curated vocabulary for the profile "Tags" field (the skills/craft words shown
 * on a member's profile and matched by the members-directory `tags` filter).
 *
 * This is a UI-only allow-list: the backend stores whatever strings we send and
 * matches them **literally** when filtering the directory, so every value here
 * must be the exact word we want searchable — keep casing and spelling stable.
 * Members pick only from this list; they can't invent new tags. Legacy tags that
 * predate the list still display on a profile, they just can't be re-added.
 *
 * Seeded from economy's SKILL_SUGGESTIONS and broadened for profiles. Edit freely
 * — this is the single place to grow or prune the vocabulary.
 */

export interface ProfileTagCategory {
  id: string;
  /** i18n key resolved at render time. Never render `id` directly. */
  labelKey: string;
  tags: readonly string[];
}

/**
 * The vocabulary, grouped. This is the source of truth: the flat
 * `PROFILE_TAG_OPTIONS` allow-list below is derived from it, so adding a tag
 * here is all it takes to make it both searchable and browsable.
 *
 * Every `labelKey` must exist in the members catalog (EN and PT).
 */
export const PROFILE_TAG_CATEGORIES: readonly ProfileTagCategory[] = [
  {
    id: "design",
    labelKey: "members:profileEdit.tagCategory.design",
    tags: [
      "Graphic design",
      "Illustration",
      "Figma",
      "Adobe Illustrator",
      "UX research",
      "Brand strategy",
      "Photography",
      "Video editing",
      "Animation",
    ],
  },
  {
    id: "words",
    labelKey: "members:profileEdit.tagCategory.words",
    tags: [
      "Copywriting",
      "Editing",
      "Grant writing",
      "Translation",
      "Social media",
      "Public speaking",
    ],
  },
  {
    id: "tech",
    labelKey: "members:profileEdit.tagCategory.tech",
    tags: ["Web development", "React", "Data analysis", "Product management"],
  },
  {
    id: "community",
    labelKey: "members:profileEdit.tagCategory.community",
    tags: [
      "Community organising",
      "Event production",
      "Fundraising",
      "Facilitation",
      "Mentoring",
      "Peer support",
      "Trauma-informed care",
      "Harm reduction",
      "Accessibility",
    ],
  },
  {
    id: "practical",
    labelKey: "members:profileEdit.tagCategory.practical",
    tags: [
      "Bookkeeping",
      "Legal support",
      "Immigration paperwork",
      "Teaching",
      "Cooking",
      "Carpentry",
      "Gardening",
    ],
  },
  {
    id: "performance",
    labelKey: "members:profileEdit.tagCategory.performance",
    tags: ["Music production", "DJing", "Performance", "Poetry"],
  },
];

/**
 * Flat allow-list, derived from the categories above. Type-ahead search and the
 * canonical-casing lookup in `TagEditor` both read this.
 */
export const PROFILE_TAG_OPTIONS: readonly string[] =
  PROFILE_TAG_CATEGORIES.flatMap((category) => category.tags);

/**
 * A short set surfaced as one-tap "quick add" chips before the member searches.
 * Must be a subset of PROFILE_TAG_OPTIONS.
 */
export const POPULAR_PROFILE_TAGS: readonly string[] = [
  "Graphic design",
  "Illustration",
  "Copywriting",
  "Community organising",
  "Photography",
  "Web development",
];

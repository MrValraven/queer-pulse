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
export const PROFILE_TAG_OPTIONS: readonly string[] = [
  // Design & visual craft
  "Graphic design",
  "Illustration",
  "Figma",
  "Adobe Illustrator",
  "UX research",
  "Brand strategy",
  "Photography",
  "Video editing",
  "Animation",
  // Words & communication
  "Copywriting",
  "Editing",
  "Grant writing",
  "Translation",
  "Social media",
  "Public speaking",
  // Tech
  "Web development",
  "React",
  "Data analysis",
  "Product management",
  // Community, care & organising
  "Community organising",
  "Event production",
  "Fundraising",
  "Facilitation",
  "Mentoring",
  "Peer support",
  "Trauma-informed care",
  "Harm reduction",
  "Accessibility",
  // Practical & professional
  "Bookkeeping",
  "Legal support",
  "Immigration paperwork",
  "Teaching",
  "Cooking",
  "Carpentry",
  "Gardening",
  // Music & performance
  "Music production",
  "DJing",
  "Performance",
  "Poetry",
];

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

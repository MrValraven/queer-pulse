/**
 * Curated vocabulary for forum thread tags (the `#word` chips on a thread and
 * the words the thread list filters by).
 *
 * This is a UI-only allow-list: the backend stores whatever strings we send and
 * the thread-list filter matches them **literally**, so every value here must be
 * the exact word we want findable. Members pick only from this list; they can't
 * invent new tags. Tags that predate the list still display on a thread and can
 * still be removed, they just can't be re-added.
 *
 * Values are lowercase single words on purpose: that is what
 * `ComposeTagsField` normalises to, what `#{tag}` renders, and what rides the
 * `?tag=` filter link, so a stray capital or a space would file the same topic
 * twice. Edit freely — this is the single place to grow or prune the vocabulary.
 */

export interface ForumTagCategory {
  id: string;
  /** i18n key resolved at render time. Never render `id` directly. */
  labelKey: string;
  tags: readonly string[];
}

/**
 * The vocabulary, grouped. This is the source of truth: the flat
 * `FORUM_TAG_OPTIONS` allow-list below is derived from it, so adding a tag here
 * is all it takes to make it searchable, browsable and quick-addable.
 *
 * Every `labelKey` must exist in the forum catalog (EN and PT).
 */
export const FORUM_TAG_CATEGORIES: readonly ForumTagCategory[] = [
  {
    id: "life",
    labelKey: "forum:tagCategory.life",
    tags: ["housing", "jobs", "money", "legal", "migration", "study", "safety"],
  },
  {
    id: "health",
    labelKey: "forum:tagCategory.health",
    tags: [
      "health",
      "healthcare",
      "trans",
      "hrt",
      "therapy",
      "hiv",
      "disability",
    ],
  },
  {
    id: "community",
    labelKey: "forum:tagCategory.community",
    tags: [
      "welcome",
      "intros",
      "meetups",
      "spaces",
      "events",
      "volunteering",
      "dating",
      "family",
      "parenting",
      "elders",
    ],
  },
  {
    id: "culture",
    labelKey: "forum:tagCategory.culture",
    tags: [
      "culture",
      "film",
      "music",
      "books",
      "art",
      "nightlife",
      "bookshop",
      "photography",
      "fashion",
      "sport",
    ],
  },
  {
    id: "activism",
    labelKey: "forum:tagCategory.activism",
    tags: [
      "activism",
      "rights",
      "inclusion",
      "protest",
      "grants",
      "fund",
      "proposal",
      "vote",
      "research",
    ],
  },
  {
    id: "platform",
    labelKey: "forum:tagCategory.platform",
    tags: ["platform", "feedback", "guide", "resources", "help", "moderation"],
  },
];

/**
 * Flat allow-list, derived from the categories above. The type-ahead search and
 * the canonical lookup in `ComposeTagsField` both read this.
 */
export const FORUM_TAG_OPTIONS: readonly string[] =
  FORUM_TAG_CATEGORIES.flatMap((category) => category.tags);

/**
 * A short set surfaced as one-tap quick-add chips before anyone searches.
 * Must be a subset of FORUM_TAG_OPTIONS.
 */
export const POPULAR_FORUM_TAGS: readonly string[] = [
  "housing",
  "health",
  "trans",
  "events",
  "jobs",
  "guide",
];

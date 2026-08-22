/**
 * Curated community tags — a fixed, backend-shared vocabulary (NOT free text)
 * owners/mods pick from when editing a community, shown as pills on every
 * community card variant, and filterable on the Discover page.
 *
 * The 53 slugs below are the exact wire values a separate backend build keys
 * off (`communities.tags`) — do not rename, add, or remove a slug here without
 * a matching backend change. `enLabel` exists only to seed the English i18n
 * catalog entries (`communities:tag.<slug>`) at build time; render code must
 * always resolve a tag's display label through `t(COMMUNITY_TAG_LABEL_KEY[id])`,
 * never this constant directly, so every surface stays translated.
 */

export interface CommunityTagOption {
  id: string;
  /** Seeds the i18n catalog only — never read directly at render time. */
  enLabel: string;
  labelKey: string;
}

function tagOption(id: string, enLabel: string): CommunityTagOption {
  return { id, enLabel, labelKey: `communities:tag.${id}` };
}

// Group: identity & community focus
const IDENTITY_FOCUS_TAGS: CommunityTagOption[] = [
  tagOption("trans-nonbinary", "Trans & Nonbinary"),
  tagOption("sapphic-wlw", "Sapphic / WLW"),
  tagOption("gay-men", "Gay Men"),
  tagOption("bisexual-pan", "Bisexual & Pan"),
  tagOption("asexual-aromantic", "Asexual & Aromantic"),
  tagOption("two-spirit", "Two-Spirit"),
  tagOption("intersex", "Intersex"),
  tagOption("bipoc-led", "BIPOC-Led"),
  tagOption("disability-chronic-illness", "Disability & Chronic Illness"),
  tagOption("neurodivergent", "Neurodivergent"),
  tagOption("deaf-hard-of-hearing", "Deaf & Hard of Hearing"),
  tagOption("elders-50-plus", "Elders (50+)"),
  tagOption("youth-18-24", "Youth (18-24)"),
  tagOption("parents-family", "Parents & Family"),
  tagOption("polyamory-enm", "Polyamory & ENM"),
  tagOption("leather-kink", "Leather & Kink"),
  tagOption("bear-cub", "Bear & Cub"),
  tagOption("drag-performance", "Drag & Performance"),
];

// Group: format & vibe
const FORMAT_VIBE_TAGS: CommunityTagOption[] = [
  tagOption("beginner-friendly", "Beginner Friendly"),
  tagOption("in-person-meetups", "In-Person Meetups"),
  tagOption("virtual-online", "Virtual/Online"),
  tagOption("local-city-based", "Local/City-Based"),
  tagOption("peer-support", "Peer Support"),
  tagOption("discussion-group", "Discussion Group"),
  tagOption("book-club", "Book Club"),
  tagOption("study-group", "Study Group"),
  tagOption("game-night", "Game Night"),
  tagOption("sober-substance-free", "Sober & Substance-Free"),
  tagOption("twelve-step-recovery", "12-Step & Recovery"),
  tagOption("creative-collective", "Creative Collective"),
  tagOption("mentorship", "Mentorship"),
];

// Group: focus & interests
const FOCUS_INTEREST_TAGS: CommunityTagOption[] = [
  tagOption("mental-health", "Mental Health"),
  tagOption("coming-out-support", "Coming Out Support"),
  tagOption("health-wellness", "Health & Wellness"),
  tagOption("career-networking", "Career & Networking"),
  tagOption("housing-roommates", "Housing & Roommates"),
  tagOption("legal-immigration", "Legal & Immigration"),
  tagOption("faith-spirituality", "Faith & Spirituality"),
  tagOption("sports-fitness", "Sports & Fitness"),
  tagOption("outdoors-hiking", "Outdoors & Hiking"),
  tagOption("music", "Music"),
  tagOption("film-tv", "Film & TV"),
  tagOption("tech-gaming", "Tech & Gaming"),
  tagOption("fashion-style", "Fashion & Style"),
  tagOption("food-cooking", "Food & Cooking"),
  tagOption("arts-crafts", "Arts & Crafts"),
  tagOption("activism-mutual-aid", "Activism & Mutual Aid"),
  tagOption("politics-advocacy", "Politics & Advocacy"),
  tagOption("nightlife-events", "Nightlife & Events"),
];

// Group: health & identity
const HEALTH_IDENTITY_TAGS: CommunityTagOption[] = [
  tagOption("hiv-wellness", "HIV+ & Wellness"),
  tagOption("trans-health-medical", "Trans Health & Medical"),
  tagOption("sex-worker-allies", "Sex Worker Allies"),
  tagOption("accessibility-first", "Accessibility-First"),
];

/** Every curated tag, in group order — the edit modal's and discover filter's
 *  full picker pool. */
export const COMMUNITY_TAGS: CommunityTagOption[] = [
  ...IDENTITY_FOCUS_TAGS,
  ...FORMAT_VIBE_TAGS,
  ...FOCUS_INTEREST_TAGS,
  ...HEALTH_IDENTITY_TAGS,
];

/** id → labelKey, for resolving a stored tag id back to a display label
 *  wherever the full `COMMUNITY_TAGS` list isn't at hand (card pills, applied
 *  filter chips). */
export const COMMUNITY_TAG_LABEL_KEY: Record<string, string> =
  Object.fromEntries(COMMUNITY_TAGS.map((tag) => [tag.id, tag.labelKey]));

/** The full set of valid tag ids, for defensively dropping anything a stale
 *  client or backend sends that this build doesn't recognise. */
export const COMMUNITY_TAG_IDS: Set<string> = new Set(
  COMMUNITY_TAGS.map((tag) => tag.id),
);

/** An owner/mod may pick at most this many tags when editing a community —
 *  keeps the pill row on every card variant readable rather than a wall of chips. */
export const MAX_COMMUNITY_TAGS = 8;

/** How many tag pills a community card variant shows before implying the rest —
 *  see each card's own doc comment for why its cap is what it is. */
export const CARD_TAG_DISPLAY_CAP = 3;

/**
 * Small, hand-picked clusters of tags that commonly overlap in meaning — not
 * an exhaustive taxonomy of the 53-tag vocab, just the clearest pairs worth a
 * soft nudge in the tag picker (`CommunityTagPicker.tsx`) when 2+ of a
 * cluster are selected together. Purely informational: it never blocks
 * toggling a tag or submitting the form.
 */
export const TAG_OVERLAP_CLUSTERS: string[][] = [
  ["sober-substance-free", "twelve-step-recovery"],
  ["trans-nonbinary", "trans-health-medical"],
  ["disability-chronic-illness", "accessibility-first"],
  ["mental-health", "peer-support"],
];

/** True once 2+ of the given tag ids fall in the same overlap cluster —
 *  drives `CommunityTagPicker`'s soft "these often go together" hint. */
export function hasOverlappingTags(selectedIds: string[]): boolean {
  const selected = new Set(selectedIds);
  return TAG_OVERLAP_CLUSTERS.some(
    (cluster) => cluster.filter((id) => selected.has(id)).length >= 2,
  );
}

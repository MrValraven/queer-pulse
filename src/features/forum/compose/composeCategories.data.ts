import type { IconType } from "react-icons";
import { CATS } from "../forum.data";

// ── What the composer knows about a category that the forum list does not ────
// The list needs an id, a label and an icon; `CATS` carries exactly those. The
// composer's category grid also needs a one-line description under each name,
// and the "Sounds like Housing" suggestion chip needs the keywords that point
// at one from the draft text.
//
// Both are DERIVED from `CATS` rather than re-listed beside it: a curated copy
// of a taxonomy drifts from the taxonomy the moment either moves, and this is
// the second list in the same feature. The extras live in one record keyed by
// the same ids, and the array below is built by walking `CATS` itself, so
// order, labels and icons can only ever come from one place.

/** The extras one category carries inside the composer. */
interface ComposeCategoryDetail {
  /** Catalog key for the one-line description under the name. */
  descriptionKey: string;
  /**
   * Keywords that suggest this category from the draft's title plus body.
   * Copied verbatim from the design prototype: they are tuned across English
   * and Portuguese together (`flat|quarto`, `doctor|médic`), which is why they
   * are not regenerated from the English label.
   */
  keyword: RegExp;
}

const CATEGORY_DETAILS: Record<string, ComposeCategoryDetail> = {
  // `general` matches anything on purpose, mirroring the prototype's `/./`. It
  // is the bucket for a post that fits nowhere else, so it is also the one
  // category the suggestion scan skips: a catch-all that always matches would
  // win every suggestion and the chip would never say anything useful.
  general: {
    descriptionKey: "forum:composePage.category.general.description",
    keyword: /./,
  },
  housing: {
    descriptionKey: "forum:composePage.category.housing.description",
    keyword:
      /\b(flat|room|rent|landlord|fiador|deposit|flatmate|lease|apartment|housing|quarto|casa|renda)/i,
  },
  health: {
    descriptionKey: "forum:composePage.category.health.description",
    keyword:
      /\b(gp|doctor|clinic|therap|sns|health|dentist|psych|anxiety|médic|saúde)/i,
  },
  arts: {
    descriptionKey: "forum:composePage.category.arts.description",
    keyword:
      /\b(film|music|exhibit|gig|screen|book|art|theatre|zine|drag|cinema|música)/i,
  },
  activism: {
    descriptionKey: "forum:composePage.category.activism.description",
    keyword:
      /\b(proposal|propos|vote|campaign|grant|fund|protest|march|petition|votação)/i,
  },
  guides: {
    descriptionKey: "forum:composePage.category.guides.description",
    keyword: /\b(guide|how to|resources|checklist|index|step|guia)/i,
  },
  jobs: {
    descriptionKey: "forum:composePage.category.jobs.description",
    keyword:
      /\b(hiring|job|work|freelance|skill|opening|salary|cv|emprego|trabalho)/i,
  },
  trans: {
    descriptionKey: "forum:composePage.category.trans.description",
    keyword:
      /\b(trans|hrt|name change|non-binary|nonbinary|gender|binder|género)/i,
  },
};

/**
 * A regex that matches nothing, for a category added to `CATS` before its
 * composer copy lands. It keeps the grid complete (the member can still file
 * the post there) and keeps the suggestion chip quiet about a category nobody
 * has written keywords for yet.
 */
const MATCHES_NOTHING = /(?!)/;

/** One card in the composer's "Where does it go?" grid. */
export interface ComposeCategory {
  id: string;
  nameKey: string;
  icon: IconType;
  descriptionKey: string;
  keyword: RegExp;
}

/**
 * The categories a post can be filed under, in `CATS` order, without the
 * synthetic `all` bucket (which is a list filter, never a destination).
 */
export const COMPOSE_CATEGORIES: readonly ComposeCategory[] = CATS.filter(
  (category) => category.id !== "all",
).map((category) => ({
  id: category.id,
  nameKey: category.nameKey,
  icon: category.icon,
  descriptionKey:
    CATEGORY_DETAILS[category.id]?.descriptionKey ??
    "forum:composePage.category.fallbackDescription",
  keyword: CATEGORY_DETAILS[category.id]?.keyword ?? MATCHES_NOTHING,
}));

/** Every id the grid offers, for validating a restored draft's category. */
export const COMPOSE_CATEGORY_IDS: readonly string[] = COMPOSE_CATEGORIES.map(
  (category) => category.id,
);

/**
 * The categories the suggestion chip scans, in order, first match wins. The
 * catch-all `general` is skipped for the reason given on its entry above.
 */
export const SUGGESTABLE_CATEGORIES: readonly ComposeCategory[] =
  COMPOSE_CATEGORIES.filter((category) => category.id !== "general");

/**
 * Tags worth offering under the tag box, per category. Member-authored values
 * rather than catalog keys: a tag is the literal string the thread is filed
 * under and the one the browse page matches on, so translating it would file
 * the same thread under two different tags in two languages.
 */
export const TAG_SUGGESTIONS: Record<string, readonly string[]> = {
  general: ["welcome", "lisbon", "question"],
  housing: ["housing", "flatshare", "fiador", "scams"],
  health: ["health", "gp", "therapy", "sns"],
  arts: ["film", "music", "exhibition", "zine"],
  activism: ["proposal", "vote", "fund", "grants"],
  guides: ["guide", "resources", "checklist"],
  jobs: ["jobs", "hiring", "freelance"],
  trans: ["trans", "healthcare", "legal", "hrt"],
};

/**
 * Where posting without a name is offered. These are the three categories
 * where saying a true thing under your own name can cost a member their
 * housing, their healthcare or their safety.
 */
export const ANONYMOUS_CATEGORIES: readonly string[] = [
  "health",
  "housing",
  "trans",
];

/** Where a neighbourhood is worth asking for: the answer changes by area. */
export const NEIGHBOURHOOD_CATEGORIES: readonly string[] = [
  "housing",
  "jobs",
  "arts",
];

/**
 * Where an automatic close is offered. A room that is taken and a job that is
 * filled both keep drawing replies long after the answer stopped existing.
 */
export const CLOSE_AFTER_CATEGORIES: readonly string[] = ["housing", "jobs"];

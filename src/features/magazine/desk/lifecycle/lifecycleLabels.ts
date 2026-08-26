import type { IconType } from "react-icons";
import {
  FiArchive,
  FiArrowRight,
  FiCheckCircle,
  FiRefreshCw,
} from "react-icons/fi";
import type { ArticleLifecycle, ContentLocale } from "../../api/magazine.api";

/**
 * CON-16 — the desk's vocabulary for the four lifecycle states, in one place
 * so the board, the row and the edit modal never drift apart.
 *
 * Catalog keys rather than literals: this is chrome, and chrome translates.
 * (The journalism these rows point at has its own translation model and never
 * goes near the catalogs.)
 */
export const LIFECYCLE_LABEL_KEY: Record<ArticleLifecycle, string> = {
  live: "magazine:lifecycle.state.live",
  under_review: "magazine:lifecycle.state.underReview",
  archived: "magazine:lifecycle.state.archived",
  superseded: "magazine:lifecycle.state.superseded",
};

/** One line saying what each state promises the reader, shown in the picker
 *  so an editor is choosing a meaning rather than a word. */
export const LIFECYCLE_HINT_KEY: Record<ArticleLifecycle, string> = {
  live: "magazine:lifecycle.hint.live",
  under_review: "magazine:lifecycle.hint.underReview",
  archived: "magazine:lifecycle.hint.archived",
  superseded: "magazine:lifecycle.hint.superseded",
};

export const LIFECYCLE_ICON: Record<ArticleLifecycle, IconType> = {
  live: FiCheckCircle,
  under_review: FiRefreshCw,
  archived: FiArchive,
  superseded: FiArrowRight,
};

export const LIFECYCLE_ORDER: ArticleLifecycle[] = [
  "live",
  "under_review",
  "archived",
  "superseded",
];

/** The language's own name in that language. Never a flag: a flag is a
 *  country, and a language is not one. */
export const CONTENT_LOCALE_LABEL: Record<ContentLocale, string> = {
  en: "English",
  pt: "Português",
};

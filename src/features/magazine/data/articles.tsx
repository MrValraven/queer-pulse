import { isValidElement, type ReactNode } from "react";
import type { AvatarTint } from "../../../shared/components/ui/Avatar";
import type { TFunction } from "../../../shared/i18n/types";

/** A paragraph (plain text or rich JSX) or a pull quote. */
export type ArticleBlock = ReactNode | { pull: string };

/** True when a body block is a pull quote rather than a renderable node. */
export function isPullQuote(block: ArticleBlock): block is { pull: string } {
  return (
    typeof block === "object" &&
    block !== null &&
    !isValidElement(block) &&
    "pull" in block
  );
}

export interface Article {
  id: string;
  kicker: string;
  section: string;
  title: ReactNode;
  byline: string;
  role: string | null;
  date: string;
  readTime: string;
  initials: string;
  tint: AvatarTint;
  imgDesc: string;
  /** Optional hero image URL; falls back to the tinted placeholder when absent. */
  image?: string;
  authorBio: string;
  /** Topical tags used both for display and to explain why pieces relate. */
  tags: string[];
  related: string[];
  body: ArticleBlock[];
}

/**
 * Why a related article is being recommended, derived from shared fields.
 * Used to render a small relationship badge on each related card. This badge
 * is platform chrome (an algorithm's own explanation), so it is translated —
 * the tag/section names it interpolates are the article's own content
 * fields and stay in English either way.
 */
export function relationReason(
  current: Article,
  candidate: Article,
  t: TFunction,
): string {
  if (candidate.byline === current.byline)
    return t("magazine:relation.sameAuthor");
  const sharedTag = candidate.tags.find((tag) => current.tags.includes(tag));
  if (sharedTag) return t("magazine:relation.sameTag", { tag: sharedTag });
  if (candidate.section === current.section)
    return t("magazine:relation.sameSection", { section: candidate.section });
  return t("magazine:relation.editorsPick");
}


export const defaultArticleId = "city-changed";

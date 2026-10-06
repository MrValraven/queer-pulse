import { routes } from "../../app/routeMap";
import type { TFunction } from "../../shared/i18n/types";

/** Long enough for a standfirst to land whole, short enough that the link
 *  still shows above the fold of a chat bubble. */
export const SHARE_DESCRIPTION_MAX_LENGTH = 200;

/** The fields of an article the share message reads. */
export interface ShareMessageArticle {
  title: string;
  /** The line the desk wrote under the headline. Preferred when present. */
  standfirst?: string;
  /** The saved-card blurb: the dek, or the first paragraph. */
  description?: string;
  byline?: string;
}

/**
 * The article's own address, the same form the language switcher links to:
 * the slug, plus the language of the piece on screen when it has one. A
 * translation is an article at its own slug, and `?lang=` keeps a Portuguese
 * piece Portuguese for a recipient whose interface is set to English. Every
 * other parameter on the reader's URL is theirs alone and stays behind.
 */
export function articleSharePath(slug: string, locale?: string | null): string {
  const path = `${routes.article}?id=${encodeURIComponent(slug)}`;
  return locale ? `${path}&lang=${encodeURIComponent(locale)}` : path;
}

/**
 * Collapse whitespace and cap a long passage at the last whole word that
 * fits, closing it with an ellipsis. A short passage passes through as is.
 */
export function capOnWordBoundary(text: string, maxLength: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  const head = clean.slice(0, maxLength - 1);
  const lastSpace = head.lastIndexOf(" ");
  // A single unbroken run (a long URL, say) is cut where it reaches the cap.
  const cut = lastSpace > maxLength / 2 ? head.slice(0, lastSpace) : head;
  return `${cut.replace(/[\s,;:.-]+$/, "")}…`;
}

/**
 * The lines a reader passes on when they share an article: the title, the
 * standfirst (or the blurb), and who wrote it. A line with nothing to say is
 * left out. `ShareMenu` adds the link as the last line.
 */
export function buildArticleShareMessage(
  article: ShareMessageArticle,
  t: TFunction,
): string {
  const summary = article.standfirst?.trim() || article.description?.trim();
  const byline = article.byline?.trim();
  return [
    article.title.trim(),
    summary ? capOnWordBoundary(summary, SHARE_DESCRIPTION_MAX_LENGTH) : "",
    byline ? t("magazine:toolbar.shareMessage.byline", { byline }) : "",
  ]
    .filter(Boolean)
    .join("\n");
}

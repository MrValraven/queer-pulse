import { asTypedBlock, type Article } from "./data/articles";
import { htmlToPlainText } from "./desk/editor/plainText";
import { nodeToText } from "./nodeText";

/**
 * PRD-113: one entry in an article's table of contents.
 *
 * A 25-minute read offered the reader no way to see its shape or to skip to a
 * section. The outline is derived from the piece's OWN headings, so the desk
 * never has to author a second structure and a contents list can never drift
 * from the body it describes.
 */
export interface ArticleOutlineEntry {
  /** DOM id of the heading this entry jumps to. */
  anchorId: string;
  /** The heading, flattened to plain text for the list. */
  label: string;
}

/**
 * The DOM id given to a rendered heading. Both body renderers call this, and so
 * does the contents list, so the two can never disagree: the block renderer
 * keys on the block's own stable id, the legacy renderer on its position.
 */
export function articleHeadingAnchorId(blockKey: string | number): string {
  return `article-heading-${blockKey}`;
}

function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Every heading in an article, in reading order.
 *
 * Mirrors `ArticleReaderBody`'s choice of renderer exactly: the typed `blocks`
 * when the piece has them, otherwise the legacy `body` array. Headings that
 * flatten to nothing (an empty block the editor left behind) are dropped rather
 * than rendered as a blank row.
 */
export function buildArticleOutline(article: Article): ArticleOutlineEntry[] {
  const entries: ArticleOutlineEntry[] = [];

  if (article.blocks && article.blocks.length > 0) {
    for (const block of article.blocks) {
      if (block.kind !== "heading") continue;
      const label = collapseWhitespace(htmlToPlainText(block.html));
      if (label)
        entries.push({ anchorId: articleHeadingAnchorId(block.id), label });
    }
    return entries;
  }

  article.body.forEach((block, index) => {
    const typed = asTypedBlock(block);
    if (typed?.kind !== "heading") return;
    const label = collapseWhitespace(nodeToText(typed.text));
    if (label) entries.push({ anchorId: articleHeadingAnchorId(index), label });
  });
  return entries;
}

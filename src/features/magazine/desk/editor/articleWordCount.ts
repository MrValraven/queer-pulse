import type { ArticleBlock } from "../../api/pieces.api";

/** Mirrors the backend's `readMinutes` derivation
 * (`ceil(words/220)`, minimum 1 — see the Phase 3 plan's Task 3). Computed
 * client-side here too so the document's byline row and the meta rail's
 * read-time show the CURRENT draft, not the server's last-saved value
 * (which lags behind by up to the ~1.2s autosave debounce). */
const WORDS_PER_MINUTE = 220;

/** Strips markup down to its text content — shared with
 * `articlePublishChecklist.ts` (an empty-after-stripping standfirst still
 * fails the "written" check) and the editor header's plain-text title. */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ");
}

/** The words a reader would actually encounter in one block, across every
 * kind's text-bearing fields. */
function wordsInBlock(block: ArticleBlock): string {
  switch (block.kind) {
    case "paragraph":
    case "heading":
    case "pullQuote":
      return stripHtml(block.html);
    case "quote":
      return `${stripHtml(block.html)} ${block.cite}`;
    case "qa":
      return `${stripHtml(block.q)} ${stripHtml(block.html)} ${block.who}`;
    case "image":
      return stripHtml(block.caption);
    case "stats":
      return block.items.map((item) => `${item.value} ${item.label}`).join(" ");
    default: {
      // Exhaustiveness guard: TypeScript rejects an unhandled kind here.
      const exhaustive: never = block;
      return exhaustive;
    }
  }
}

/** Word count across every block's html (tags stripped), plus the title and
 * standfirst — the same fields a reader actually sees. */
export function countArticleWords(
  blocks: ArticleBlock[],
  title: string,
  standfirst: string,
): number {
  const text = [stripHtml(title), stripHtml(standfirst), ...blocks.map(wordsInBlock)].join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

export function estimateReadMinutes(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

import type { ArticleBlock } from "../../api/pieces.api";
import { htmlToPlainText } from "./plainText";

/** Mirrors the backend's `readMinutes` derivation
 * (`ceil(words/220)`, minimum 1 — see the Phase 3 plan's Task 3). Computed
 * client-side here too so the document's byline row and the meta rail's
 * read-time show the CURRENT draft, not the server's last-saved value
 * (which lags behind by up to the ~1.2s autosave debounce). */
const WORDS_PER_MINUTE = 220;

/**
 * Reduces markup to the text a reader would actually see — shared with
 * `articlePublishChecklist.ts` (an empty-after-stripping standfirst still
 * fails the "written" check), `versionDiffAlgorithm.ts` and
 * `desk/deck/slideBudget.ts`.
 *
 * FE-CNT-13: this used to be `html.replace(/<[^>]*>/g, " ")`, which strips
 * tags but leaves HTML ENTITIES encoded. A contentEditable writes `&` as
 * `&amp;` and a trailing space as `&nbsp;`, so the regex version counted
 * `&nbsp;` as a word and let a standfirst consisting only of `&nbsp;` satisfy
 * the publish checklist's "written" test. It now delegates to
 * `htmlToPlainText`, which parses in an inert `<template>` and returns
 * `textContent` with non-breaking spaces collapsed, so an entity-only value
 * correctly reduces to the empty string.
 */
export function stripHtml(html: string): string {
  return htmlToPlainText(html);
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

import type { ArticleBlock } from "../../api/pieces.api";
import { stripHtml } from "./articleWordCount";

export type VersionDiffStatus = "unchanged" | "changed" | "added" | "removed";

export interface VersionDiffRow {
  /** The block's own id, or a positional fallback (`__index_N`) for a block
   *  with no id — stable enough to use as a React `key`. */
  key: string;
  status: VersionDiffStatus;
  /** The block's readable text in the CURRENT draft, `null` when the block
   *  only exists in the compared version ("removed"). */
  currentText: string | null;
  /** The block's readable text in the compared VERSION, `null` when the
   *  block only exists in the current draft ("added"). */
  versionText: string | null;
}

/** A block's readable text across every kind's text-bearing fields — the
 *  same fields a reader (or an editor scanning a diff) would notice changed.
 *  Deliberately separate from `articleWordCount.ts`'s `wordsInBlock` (that
 *  one is tuned for a word COUNT, this one for a readable comparison string,
 *  e.g. it keeps punctuation and doesn't need to be word-splittable). */
function blockDiffText(block: ArticleBlock): string {
  switch (block.kind) {
    case "paragraph":
    case "heading":
    case "pullQuote":
      return stripHtml(block.html).trim();
    case "quote":
      return `${stripHtml(block.html).trim()} — ${block.cite}`;
    case "qa":
      return `${stripHtml(block.q).trim()} ${stripHtml(block.html).trim()}`;
    case "image":
      return stripHtml(block.caption).trim();
    case "stats":
      return block.items.map((item) => `${item.value} — ${item.label}`).join(" · ");
    default: {
      // Exhaustiveness guard: TypeScript rejects an unhandled kind here.
      const exhaustive: never = block;
      return exhaustive;
    }
  }
}

/** A block's id where it has one, else a positional key — so two blocks at
 *  the same index with no id are still compared against each other (the
 *  "match by id where present, else by index" rule from the Wave E plan). */
function blockKey(block: ArticleBlock, index: number): string {
  return block.id.trim() !== "" ? block.id : `__index_${index}`;
}

/**
 * A lightweight, per-block (not per-character) diff between the article's
 * CURRENT blocks and one earlier VERSION's blocks — the `VersionDiff` view's
 * data source. Every current block is either unchanged, changed, or "added"
 * (no match in the version); every version block with no match in current is
 * "removed". Order follows the current draft first, then any removed blocks
 * appended at the end in their original version order — this is a rail-sized
 * comparison aid, not a reconciling line-diff, so it doesn't try to interleave
 * removed rows back into their original position.
 */
export function computeVersionDiff(
  currentBlocks: ArticleBlock[],
  versionBlocks: ArticleBlock[],
): VersionDiffRow[] {
  const versionByKey = new Map(
    versionBlocks.map((block, index) => [blockKey(block, index), block] as const),
  );
  const matchedVersionKeys = new Set<string>();

  const rows: VersionDiffRow[] = currentBlocks.map((block, index) => {
    const key = blockKey(block, index);
    const currentText = blockDiffText(block);
    const versionBlock = versionByKey.get(key);
    if (!versionBlock) {
      return { key, status: "added", currentText, versionText: null };
    }
    matchedVersionKeys.add(key);
    const versionText = blockDiffText(versionBlock);
    return {
      key,
      status: currentText === versionText ? "unchanged" : "changed",
      currentText,
      versionText,
    };
  });

  versionBlocks.forEach((block, index) => {
    const key = blockKey(block, index);
    if (matchedVersionKeys.has(key)) return;
    rows.push({ key, status: "removed", currentText: null, versionText: blockDiffText(block) });
  });

  return rows;
}

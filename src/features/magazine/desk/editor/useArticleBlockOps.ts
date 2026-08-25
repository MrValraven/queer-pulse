import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { ArticleBlock } from "../../api/pieces.api";
import type { ArticleBlockKind } from "./blockKinds";

/** A fresh id for a newly-inserted block. Prefers `crypto.randomUUID` (every
 * evergreen browser this app targets has it); the timestamp+random fallback
 * only matters for an older/embedded WebView without it. */
export function freshBlockId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `b${Date.now()}${Math.random().toString(16).slice(2)}`;
}

/** Minimal HTML-escaping for plain text dropped into a block's `html` field
 * (paste-as-blocks) — the text never carries real markup, so this only needs
 * to stop it from being interpreted as any. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** One paragraph block per (already split, already trimmed, non-empty) text
 * — the paste-as-blocks shape, shared by `pasteParagraphsAfter` below (split
 * out of a document paste) and `FileDraftModal` (split out of a whole pasted
 * draft), so the two paths never produce structurally different blocks. */
export function createParagraphBlocks(texts: string[]): ArticleBlock[] {
  return texts.map((text) => ({
    id: freshBlockId(),
    kind: "paragraph",
    html: escapeHtml(text),
  }));
}

/** Splits raw pasted text into paragraph strings on blank lines, trimmed and
 * with empty groups dropped — the exact rule `ArticleDocument`'s in-document
 * paste handler uses, reused so a whole draft pasted into `FileDraftModal`
 * segments identically. */
export function splitIntoParagraphTexts(text: string): string[] {
  return text
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/** A brand-new, empty block of `kind`, seeded with the same defaults the
 * design prototype uses (e.g. a fresh image block starts on the first crop
 * ratio and a centred focal point). Always gets its own fresh id — callers
 * must never reuse an id from another block. */
export function createEmptyBlock(kind: ArticleBlockKind): ArticleBlock {
  const id = freshBlockId();
  switch (kind) {
    case "paragraph":
      return { id, kind, html: "" };
    case "heading":
      return { id, kind, html: "" };
    case "pullQuote":
      return { id, kind, html: "" };
    case "quote":
      return { id, kind, html: "", cite: "" };
    case "image":
      return {
        id,
        kind,
        alt: "",
        caption: "",
        credit: "",
        rights: "commissioned",
        tint: "coral",
        crop: "16:9",
        focal: { x: 0.5, y: 0.5 },
      };
    case "qa":
      return { id, kind, q: "", html: "", who: "" };
    case "stats":
      return { id, kind, items: [{ value: "", label: "" }] };
    default: {
      // Exhaustiveness guard: TypeScript rejects an unhandled kind here.
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

export interface ArticleBlockOps {
  changeBlock: (id: string, next: ArticleBlock) => void;
  moveBlock: (id: string, direction: "up" | "down") => void;
  removeBlock: (id: string) => void;
  /** Re-inserts a previously removed block at `index` — the Undo half of a
   * block delete (FE-CNT-11). Clamped, so a stale index from a list that has
   * changed since the delete lands at the end rather than throwing away the
   * block. */
  restoreBlock: (index: number, block: ArticleBlock) => void;
  /** Inserts a fresh block of `kind` right after `index`, returning its new
   * id so the caller can select it. */
  insertBlockAfter: (index: number, kind: ArticleBlockKind) => string;
  /** Inserts one paragraph block per (already split, already trimmed) text
   * right after `index` — the paste-as-blocks path. */
  pasteParagraphsAfter: (index: number, texts: string[]) => void;
}

/**
 * Every immutable block-array operation the article editor needs, kept out
 * of `ArticleEditorPage` so its own state wiring stays readable. Every op
 * replaces the array wholesale (never mutates in place) — `ArticleDocument`
 * keys each block editor on `block.id`, never index, so a wholesale replace
 * never remounts an unrelated block's `RichText` and drops its caret.
 */
export function useArticleBlockOps(
  setBlocks: Dispatch<SetStateAction<ArticleBlock[]>>,
): ArticleBlockOps {
  const changeBlock = useCallback(
    (id: string, next: ArticleBlock) => {
      setBlocks((previous) =>
        previous.map((block) => (block.id === id ? next : block)),
      );
    },
    [setBlocks],
  );

  const moveBlock = useCallback(
    (id: string, direction: "up" | "down") => {
      setBlocks((previous) => {
        const index = previous.findIndex((block) => block.id === id);
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (index < 0 || targetIndex < 0 || targetIndex >= previous.length)
          return previous;
        const next = previous.slice();
        const moved = next[index];
        const displaced = next[targetIndex];
        if (!moved || !displaced) return previous;
        next[index] = displaced;
        next[targetIndex] = moved;
        return next;
      });
    },
    [setBlocks],
  );

  const removeBlock = useCallback(
    (id: string) => {
      setBlocks((previous) => previous.filter((block) => block.id !== id));
    },
    [setBlocks],
  );

  const restoreBlock = useCallback(
    (index: number, block: ArticleBlock) => {
      setBlocks((previous) => {
        const next = previous.slice();
        next.splice(Math.min(Math.max(index, 0), previous.length), 0, block);
        return next;
      });
    },
    [setBlocks],
  );

  const insertBlockAfter = useCallback(
    (index: number, kind: ArticleBlockKind) => {
      const block = createEmptyBlock(kind);
      setBlocks((previous) => {
        const next = previous.slice();
        next.splice(index + 1, 0, block);
        return next;
      });
      return block.id;
    },
    [setBlocks],
  );

  const pasteParagraphsAfter = useCallback(
    (index: number, texts: string[]) => {
      const paragraphBlocks = createParagraphBlocks(texts);
      setBlocks((previous) => {
        const next = previous.slice();
        next.splice(index + 1, 0, ...paragraphBlocks);
        return next;
      });
    },
    [setBlocks],
  );

  return {
    changeBlock,
    moveBlock,
    removeBlock,
    restoreBlock,
    insertBlockAfter,
    pasteParagraphsAfter,
  };
}

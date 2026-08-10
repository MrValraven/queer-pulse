// The typed block kinds the article editor can insert, and their shared
// labels. Mirrors the `ArticleBlock` discriminated union that the backend
// validates and stores as jsonb on `magazine_article.blocks` (see Task 1,
// `magazine-article-blocks.validation.ts`). Kept dependency-free so both the
// slash menu (Task 6) and the block renderer (Task 7) can import it.

export type ArticleBlockKind =
  | "paragraph"
  | "heading"
  | "pullQuote"
  | "quote"
  | "image"
  | "qa"
  | "stats";

export interface BlockKindOption {
  kind: ArticleBlockKind;
}

// Human labels/hints live in the `magazine:write.blockKind.<kind>.label` /
// `.hint` catalog keys (EN+PT), not here — this file is plain data, not a
// component, so it has no `t()` to call. Every render site (`SlashMenu`,
// `ArticleDocument`'s add-bar, the block-type tag in `ArticleBlockEditor`)
// builds the key itself: `` t(`magazine:write.blockKind.${kind}.label`) ``.

/** Rows for the slash-insert menu, in insertion order. */
export const BLOCK_KINDS: BlockKindOption[] = [
  { kind: "paragraph" },
  { kind: "heading" },
  { kind: "pullQuote" },
  { kind: "quote" },
  { kind: "image" },
  { kind: "qa" },
  { kind: "stats" },
];

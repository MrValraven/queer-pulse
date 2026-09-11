// The typed block kinds the article editor can insert, and their shared
// labels. Mirrors the `ArticleBlock` discriminated union that the backend
// validates and stores as jsonb on `magazine_article.blocks` (see Task 1,
// `magazine-article-blocks.validation.ts`). Its only import is the type-only
// `SlashMenuOption` from the shared slash menu, so any editor file can import
// it without pulling in runtime code.

import type { SlashMenuOption } from "../../../../shared/components/richText/SlashMenu";

export type ArticleBlockKind =
  "paragraph" | "heading" | "pullQuote" | "quote" | "image" | "qa" | "stats";

export interface BlockKindOption {
  kind: ArticleBlockKind;
}

// Human labels and hints live in the `magazine:write.blockKind.<kind>.label`
// and `.hint` catalog keys (EN+PT). `blockKindSlashOptions` below turns them
// into finished strings with the `t` its caller passes in, and `SlashMenu`
// renders those strings as given. The other render sites (`ArticleDocument`'s
// add-bar, the block-type tag in `ArticleBlockEditor`) build the key
// themselves: `` t(`magazine:write.blockKind.${kind}.label`) ``.

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

/** The article block kinds as `SlashMenu` rows, labelled in the reader's
 * language. Takes `t` because this file has no hook to call. */
export function blockKindSlashOptions(
  t: (key: string) => string,
): SlashMenuOption[] {
  return BLOCK_KINDS.map((option) => ({
    id: option.kind,
    label: t(`magazine:write.blockKind.${option.kind}.label`),
    hint: t(`magazine:write.blockKind.${option.kind}.hint`),
  }));
}

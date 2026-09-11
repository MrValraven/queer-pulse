import type { GuideBlockKind } from "../api/adminResourceGuides.api";

const MARKDOWN_PREFIXES: readonly { prefix: string; kind: GuideBlockKind }[] = [
  { prefix: "## ", kind: "subheading" },
  { prefix: "- ", kind: "listItem" },
  { prefix: "* ", kind: "listItem" },
  { prefix: "> ", kind: "note" },
];

/**
 * The kind a block becomes when its whole raw text is a markdown prefix just
 * typed into an empty block. `blockText` is the unnormalized text content: a
 * contentEditable stores the trailing space as a non-breaking space.
 */
export function matchMarkdownShortcut(
  blockText: string,
  currentKind: GuideBlockKind,
): GuideBlockKind | null {
  const normalized = blockText.replace(/\u00a0/g, " ");
  const match = MARKDOWN_PREFIXES.find((entry) => entry.prefix === normalized);
  if (!match || match.kind === currentKind) return null;
  return match.kind;
}

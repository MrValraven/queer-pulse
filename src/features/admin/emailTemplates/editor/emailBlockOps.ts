import type { EmailBlock, EmailBlockType } from "../emailTemplate.types";

function newBlockId(): string {
  return typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `block-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** A fresh block with sensible starting content, so a new block previews as
 *  something instead of collapsing to nothing. */
export function createBlock(type: EmailBlockType): EmailBlock {
  const id = newBlockId();
  switch (type) {
    case "heading":
      return { id, type, level: 2, text: "" };
    case "paragraph":
      return { id, type, text: "" };
    case "button":
      return { id, type, label: "", href: "" };
    case "image":
      return { id, type, src: "", alt: "", width: 600 };
    case "divider":
      return { id, type };
    case "spacer":
      return { id, type, size: "md" };
    case "html":
      return { id, type, html: "" };
  }
}

export function moveBlock(
  blocks: EmailBlock[],
  index: number,
  delta: -1 | 1,
): EmailBlock[] {
  const target = index + delta;
  if (
    index < 0 ||
    index >= blocks.length ||
    target < 0 ||
    target >= blocks.length
  ) {
    return blocks;
  }
  const reordered = [...blocks];
  const [moved] = reordered.splice(index, 1);
  if (!moved) return blocks;
  reordered.splice(target, 0, moved);
  return reordered;
}

export function updateBlock(
  blocks: EmailBlock[],
  id: string,
  next: EmailBlock,
): EmailBlock[] {
  return blocks.map((block) => (block.id === id ? next : block));
}

export function removeBlock(blocks: EmailBlock[], id: string): EmailBlock[] {
  return blocks.filter((block) => block.id !== id);
}

/** A copy with new ids, for starting Portuguese from the English blocks. */
export function withFreshIds(blocks: EmailBlock[]): EmailBlock[] {
  return blocks.map((block) => ({ ...block, id: newBlockId() }));
}

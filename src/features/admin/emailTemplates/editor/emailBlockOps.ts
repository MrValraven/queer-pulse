import type {
  EmailBlock,
  EmailBlockType,
  EmailFeatureItem,
} from "../emailTemplate.types";

function newBlockId(): string {
  return typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `block-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** A blank feature list row, wearing the first icon until the admin picks. */
export function createFeatureItem(): EmailFeatureItem {
  return { icon: "communities", title: "", text: "" };
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
    case "hero":
      return { id, type, eyebrow: "", headline: "", text: "" };
    case "ticket":
      return {
        id,
        type,
        label: "",
        title: "",
        text: "",
        buttonLabel: "",
        href: "",
      };
    case "featureList":
      return { id, type, items: [createFeatureItem()] };
    case "signature":
      return { id, type, name: "", role: "", note: "", photoUrl: "" };
  }
}

/** Moves one entry a step up or down; a move off either end returns the list
 *  unchanged. Shared by blocks and feature list rows. */
export function moveInList<Entry>(
  entries: Entry[],
  index: number,
  delta: -1 | 1,
): Entry[] {
  const target = index + delta;
  if (
    index < 0 ||
    index >= entries.length ||
    target < 0 ||
    target >= entries.length
  ) {
    return entries;
  }
  const reordered = [...entries];
  const [moved] = reordered.splice(index, 1);
  if (moved === undefined) return entries;
  reordered.splice(target, 0, moved);
  return reordered;
}

export function moveBlock(
  blocks: EmailBlock[],
  index: number,
  delta: -1 | 1,
): EmailBlock[] {
  return moveInList(blocks, index, delta);
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

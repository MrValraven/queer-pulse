import { describe, expect, it } from "vitest";
import type { EmailBlock } from "../emailTemplate.types";
import {
  createBlock,
  moveBlock,
  removeBlock,
  updateBlock,
  withFreshIds,
} from "./emailBlockOps";

const blocks: EmailBlock[] = [
  { id: "a", type: "divider" },
  { id: "b", type: "paragraph", text: "B" },
  { id: "c", type: "spacer", size: "sm" },
];

describe("emailBlockOps", () => {
  it("moves a block and ignores moves off either end", () => {
    expect(moveBlock(blocks, 0, 1).map((block) => block.id)).toEqual([
      "b",
      "a",
      "c",
    ]);
    expect(moveBlock(blocks, 0, -1)).toBe(blocks);
    expect(moveBlock(blocks, 2, 1)).toBe(blocks);
  });

  it("updates and removes by id", () => {
    const next = updateBlock(blocks, "b", {
      id: "b",
      type: "paragraph",
      text: "New",
    });
    expect(next[1]).toEqual({ id: "b", type: "paragraph", text: "New" });
    expect(removeBlock(blocks, "a").map((block) => block.id)).toEqual([
      "b",
      "c",
    ]);
  });

  it("creates blocks with unique ids and starting fields", () => {
    const first = createBlock("image");
    const second = createBlock("image");
    expect(first.id).not.toBe(second.id);
    expect(first).toMatchObject({ type: "image", width: 600 });
  });

  it("copies blocks with fresh ids and the same content", () => {
    const copied = withFreshIds(blocks);
    expect(copied.map((block) => block.id)).not.toEqual(
      blocks.map((block) => block.id),
    );
    expect(copied[1]).toMatchObject({ type: "paragraph", text: "B" });
  });
});

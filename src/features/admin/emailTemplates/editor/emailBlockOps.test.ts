import { describe, expect, it } from "vitest";
import type { EmailBlock } from "../emailTemplate.types";
import {
  createBlock,
  moveBlock,
  moveInList,
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

  it("starts the new block types blank, with one feature list row", () => {
    expect(createBlock("hero")).toMatchObject({
      type: "hero",
      eyebrow: "",
      headline: "",
      text: "",
    });
    expect(createBlock("ticket")).toMatchObject({
      type: "ticket",
      label: "",
      title: "",
      text: "",
      buttonLabel: "",
      href: "",
    });
    expect(createBlock("signature")).toMatchObject({
      type: "signature",
      name: "",
      role: "",
      note: "",
      photoUrl: "",
    });
    expect(createBlock("featureList")).toMatchObject({
      type: "featureList",
      items: [{ icon: "communities", title: "", text: "" }],
    });
  });

  it("moves feature list rows the same way as blocks", () => {
    expect(moveInList(["x", "y", "z"], 2, -1)).toEqual(["x", "z", "y"]);
    const rows = ["x", "y"];
    expect(moveInList(rows, 1, 1)).toBe(rows);
  });

  it("copies blocks with fresh ids and the same content", () => {
    const copied = withFreshIds(blocks);
    expect(copied.map((block) => block.id)).not.toEqual(
      blocks.map((block) => block.id),
    );
    expect(copied[1]).toMatchObject({ type: "paragraph", text: "B" });
  });
});

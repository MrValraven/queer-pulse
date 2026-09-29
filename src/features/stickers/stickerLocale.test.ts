import { describe, expect, it } from "vitest";
import {
  stickerIndexOf,
  stickerLabelIn,
  stickerPackNameIn,
} from "./stickerLocale";
import { DEMO_STICKER_PACKS } from "./demoStickerPacks.data";

describe("stickerLabelIn", () => {
  it("picks the Portuguese name for a Portuguese reader", () => {
    const sticker = { label: "Blip says hi", labelPt: "Blip diz olá" };
    expect(stickerLabelIn(sticker, "pt")).toBe("Blip diz olá");
    expect(stickerLabelIn(sticker, "en")).toBe("Blip says hi");
  });

  it("falls back to the English name when the Portuguese one is missing", () => {
    expect(stickerLabelIn({ label: "Blip", labelPt: null }, "pt")).toBe("Blip");
    expect(stickerLabelIn({ label: "Blip" }, "pt")).toBe("Blip");
    expect(stickerLabelIn({ label: "Blip", labelPt: "" }, "pt")).toBe("Blip");
  });
});

describe("stickerPackNameIn", () => {
  it("picks by language with the English fallback", () => {
    const pack = { name: "Tea, shade and sparkle", namePt: "Cusquice" };
    expect(stickerPackNameIn(pack, "pt")).toBe("Cusquice");
    expect(stickerPackNameIn(pack, "en")).toBe("Tea, shade and sparkle");
    expect(stickerPackNameIn({ name: "Blip", namePt: null }, "pt")).toBe(
      "Blip",
    );
  });
});

describe("stickerIndexOf", () => {
  it("indexes every sticker by id and reuses the index for the same array", () => {
    const stickerIndex = stickerIndexOf(DEMO_STICKER_PACKS);
    expect(stickerIndex.get("demo-sticker-blip-hug")?.label).toBe("Blip hug");
    expect(stickerIndexOf(DEMO_STICKER_PACKS)).toBe(stickerIndex);
  });

  it("gives every demo sticker a Portuguese name", () => {
    for (const pack of DEMO_STICKER_PACKS) {
      expect(pack.namePt).toBeTruthy();
      for (const sticker of pack.stickers) expect(sticker.labelPt).toBeTruthy();
    }
  });
});

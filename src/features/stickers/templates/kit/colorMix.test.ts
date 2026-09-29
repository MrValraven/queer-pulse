import { describe, expect, it } from "vitest";
import { mixHex, tint } from "./colorMix";

describe("mixHex", () => {
  it("mixes two colours by the given amount", () => {
    expect(mixHex("#000000", "#ffffff", 0.5)).toBe("#808080");
  });

  it("keeps `color` unchanged at amount 0", () => {
    expect(mixHex("#e8775a", "#ffffff", 0)).toBe("#e8775a");
  });

  it("gives `otherColor` at amount 1", () => {
    expect(mixHex("#e8775a", "#123456", 1)).toBe("#123456");
  });

  it("clamps amount to the 0..1 range", () => {
    expect(mixHex("#000000", "#ffffff", 2)).toBe("#ffffff");
    expect(mixHex("#000000", "#ffffff", -1)).toBe("#000000");
  });

  it("always returns a lowercase #rrggbb string", () => {
    const mixed = mixHex("#FF0000", "#00FF00", 0.5);
    expect(mixed).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe("tint", () => {
  it("keeps the colour unchanged at amount 0", () => {
    expect(tint("#e8775a", 0)).toBe("#e8775a");
  });

  it("lightens toward white", () => {
    expect(tint("#000000", 0.5)).toBe("#808080");
    expect(tint("#000000", 1)).toBe("#ffffff");
  });
});

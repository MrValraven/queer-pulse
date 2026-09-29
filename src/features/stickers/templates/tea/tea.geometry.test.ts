import { describe, expect, it } from "vitest";
import { primitivesToSvg } from "../../render/primitivesToSvg";
import { primitivesBounds } from "../kit/fitToCanvas";
import { STICKER_FIT_MARGIN, STICKER_SIZE } from "../kit/palette";
import { teaGeometry } from "./tea.geometry";
import { TEA_ITEMS } from "./tea.items.data";
import { TEA_DEFAULTS, type TeaStyle } from "./tea.params";

/** Floating-point slack around the fitted margin, well below a pixel. */
const BOUNDS_TOLERANCE = 0.05;
const CANVAS_MIN = STICKER_FIT_MARGIN;
const CANVAS_MAX = STICKER_SIZE - STICKER_FIT_MARGIN;

const ACCENT_COLORS: readonly string[] = ["#e8775a", "#8b5cf6"];

function styleWith(accentColor: string): TeaStyle {
  return { ...TEA_DEFAULTS, accentColor };
}

describe("teaGeometry", () => {
  it("renders every item without throwing", () => {
    for (const item of TEA_ITEMS) {
      expect(() => teaGeometry(TEA_DEFAULTS, item.id)).not.toThrow();
    }
  });

  it("keeps every item's bounds inside the fitted canvas margin", () => {
    for (const item of TEA_ITEMS) {
      const primitives = teaGeometry(TEA_DEFAULTS, item.id);
      const bounds = primitivesBounds(primitives);
      if (!bounds) throw new Error(`${item.id} produced no primitives`);
      expect(bounds.minX).toBeGreaterThanOrEqual(CANVAS_MIN - BOUNDS_TOLERANCE);
      expect(bounds.minY).toBeGreaterThanOrEqual(CANVAS_MIN - BOUNDS_TOLERANCE);
      expect(bounds.maxX).toBeLessThanOrEqual(CANVAS_MAX + BOUNDS_TOLERANCE);
      expect(bounds.maxY).toBeLessThanOrEqual(CANVAS_MAX + BOUNDS_TOLERANCE);
    }
  });

  it("produces a deterministic SVG for the same style and item", () => {
    for (const item of TEA_ITEMS) {
      const firstSvg = primitivesToSvg(
        teaGeometry(TEA_DEFAULTS, item.id),
        STICKER_SIZE,
      );
      const secondSvg = primitivesToSvg(
        teaGeometry(TEA_DEFAULTS, item.id),
        STICKER_SIZE,
      );
      expect(secondSvg).toBe(firstSvg);
    }
  });

  it("carries the accent colour somewhere in every item's primitive tree", () => {
    for (const accentColor of ACCENT_COLORS) {
      for (const item of TEA_ITEMS) {
        const primitives = teaGeometry(styleWith(accentColor), item.id);
        expect(JSON.stringify(primitives)).toContain(accentColor);
      }
    }
  });

  it("rejects an item id it cannot paint", () => {
    expect(() => teaGeometry(TEA_DEFAULTS, "not-a-tea-item")).toThrow(
      "Unknown Tea item: not-a-tea-item",
    );
  });

  it("rejects an inherited property name as an item id", () => {
    expect(() => teaGeometry(TEA_DEFAULTS, "constructor")).toThrow(
      "Unknown Tea item: constructor",
    );
  });
});

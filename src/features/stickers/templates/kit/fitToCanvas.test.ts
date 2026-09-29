import { describe, expect, it } from "vitest";
import type { GroupPrimitive, RectPrimitive } from "../primitives";
import { applyFit, fitTransform, primitivesBounds } from "./fitToCanvas";

describe("primitivesBounds", () => {
  it("returns null for an empty tree", () => {
    expect(primitivesBounds([])).toBeNull();
  });

  it("widens bounds by half the stroke width", () => {
    const rect: RectPrimitive = {
      type: "rect",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    };
    const strokedRect: RectPrimitive = { ...rect, strokeWidth: 20 };
    const plainBounds = primitivesBounds([rect]);
    const strokedBounds = primitivesBounds([strokedRect]);
    if (!plainBounds || !strokedBounds) throw new Error("expected bounds");
    expect(strokedBounds.minX).toBeCloseTo(plainBounds.minX - 10);
    expect(strokedBounds.maxX).toBeCloseTo(plainBounds.maxX + 10);
    expect(strokedBounds.minY).toBeCloseTo(plainBounds.minY - 10);
    expect(strokedBounds.maxY).toBeCloseTo(plainBounds.maxY + 10);
  });

  it("swaps width and height when a group rotates 90 degrees", () => {
    const rect: RectPrimitive = {
      type: "rect",
      x: 0,
      y: 0,
      width: 100,
      height: 40,
    };
    const rotatedGroup: GroupPrimitive = {
      type: "group",
      rotationDeg: 90,
      children: [rect],
    };
    const plainBounds = primitivesBounds([rect]);
    const rotatedBounds = primitivesBounds([rotatedGroup]);
    if (!plainBounds || !rotatedBounds) throw new Error("expected bounds");
    const plainWidth = plainBounds.maxX - plainBounds.minX;
    const plainHeight = plainBounds.maxY - plainBounds.minY;
    const rotatedWidth = rotatedBounds.maxX - rotatedBounds.minX;
    const rotatedHeight = rotatedBounds.maxY - rotatedBounds.minY;
    expect(rotatedWidth).toBeCloseTo(plainHeight);
    expect(rotatedHeight).toBeCloseTo(plainWidth);
  });

  it("caps bounds to a clipRect smaller than its child", () => {
    const rect: RectPrimitive = {
      type: "rect",
      x: 0,
      y: 0,
      width: 400,
      height: 400,
    };
    const clippedGroup: GroupPrimitive = {
      type: "group",
      clipRect: { x: 100, y: 100, width: 50, height: 50 },
      children: [rect],
    };
    const bounds = primitivesBounds([clippedGroup]);
    expect(bounds).toEqual({ minX: 100, minY: 100, maxX: 150, maxY: 150 });
  });

  it("caps bounds to a clipPath smaller than its child", () => {
    const rect: RectPrimitive = {
      type: "rect",
      x: 0,
      y: 0,
      width: 400,
      height: 400,
    };
    const clipPathGroup: GroupPrimitive = {
      type: "group",
      clipPath: [
        { type: "moveTo", x: 100, y: 100 },
        { type: "lineTo", x: 150, y: 100 },
        { type: "lineTo", x: 150, y: 150 },
        { type: "lineTo", x: 100, y: 150 },
        { type: "close" },
      ],
      children: [rect],
    };
    const bounds = primitivesBounds([clipPathGroup]);
    expect(bounds).toEqual({ minX: 100, minY: 100, maxX: 150, maxY: 150 });
  });

  it("returns null when a clipRect does not overlap its child at all", () => {
    const rect: RectPrimitive = {
      type: "rect",
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    };
    const clippedGroup: GroupPrimitive = {
      type: "group",
      clipRect: { x: 1000, y: 1000, width: 10, height: 10 },
      children: [rect],
    };
    expect(primitivesBounds([clippedGroup])).toBeNull();
  });
});

describe("fitTransform and applyFit", () => {
  it("centres a 100x100 rect at (0,0) on 256,256", () => {
    const rect: RectPrimitive = {
      type: "rect",
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    };
    const bounds = primitivesBounds([rect]);
    if (!bounds) throw new Error("expected bounds");
    const transform = fitTransform(bounds);
    const fittedBounds = primitivesBounds(applyFit([rect], transform));
    if (!fittedBounds) throw new Error("expected fitted bounds");
    expect((fittedBounds.minX + fittedBounds.maxX) / 2).toBeCloseTo(256);
    expect((fittedBounds.minY + fittedBounds.maxY) / 2).toBeCloseTo(256);
  });

  it("keeps the fitted primitives inside the [26, 486] margin on both axes", () => {
    const rect: RectPrimitive = {
      type: "rect",
      x: 10,
      y: 40,
      width: 220,
      height: 90,
    };
    const bounds = primitivesBounds([rect]);
    if (!bounds) throw new Error("expected bounds");
    const transform = fitTransform(bounds);
    const fittedBounds = primitivesBounds(applyFit([rect], transform));
    if (!fittedBounds) throw new Error("expected fitted bounds");
    expect(fittedBounds.minX).toBeGreaterThanOrEqual(26);
    expect(fittedBounds.minY).toBeGreaterThanOrEqual(26);
    expect(fittedBounds.maxX).toBeLessThanOrEqual(486);
    expect(fittedBounds.maxY).toBeLessThanOrEqual(486);
  });
});

import { describe, expect, it } from "vitest";
import { flagStripesOf } from "../../../shared/data/flagStripes.data";
import type { Primitive } from "./primitives";
import { unoReverseGeometry } from "./unoReverse.geometry";
import {
  STICKER_CANVAS_SIZE,
  UNO_CARD_HEIGHT,
  UNO_CARD_WIDTH,
  UNO_CARD_X,
  UNO_CARD_Y,
  UNO_REVERSE_DEFAULTS,
  UNO_REVERSE_FLAG_IDS,
} from "./unoReverse.params";

/** Every point any primitive in the tree touches, in canvas coordinates,
 *  with each group's transform applied, each shape's stroke width included,
 *  and a group's clip rectangle intersected with what its children can
 *  reach. Used to prove nothing escapes a boundary, which a wrong scale, a
 *  wrong translate, or a missing clip would cause. */
function pointsOf(
  primitives: Primitive[],
  offsetX = 0,
  offsetY = 0,
  scale = 1,
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const place = (x: number, y: number) => {
    points.push({ x: offsetX + x * scale, y: offsetY + y * scale });
  };
  for (const primitive of primitives) {
    if (primitive.type === "rect") {
      const halfStrokeWidth = (primitive.strokeWidth ?? 0) / 2;
      place(primitive.x - halfStrokeWidth, primitive.y - halfStrokeWidth);
      place(
        primitive.x + primitive.width + halfStrokeWidth,
        primitive.y + primitive.height + halfStrokeWidth,
      );
    } else if (primitive.type === "ellipse") {
      // A rotated ellipse's true half-extent on each axis is
      // sqrt((radiusX*cos)^2 + (radiusY*sin)^2) for x and the same with sin
      // and cos swapped for y, which is smaller than the larger radius alone
      // and is what the stroke is centred on.
      const rotationRadians = ((primitive.rotationDeg ?? 0) * Math.PI) / 180;
      const cosine = Math.cos(rotationRadians);
      const sine = Math.sin(rotationRadians);
      const halfStrokeWidth = (primitive.strokeWidth ?? 0) / 2;
      const reachX =
        Math.sqrt(
          (primitive.radiusX * cosine) ** 2 + (primitive.radiusY * sine) ** 2,
        ) + halfStrokeWidth;
      const reachY =
        Math.sqrt(
          (primitive.radiusX * sine) ** 2 + (primitive.radiusY * cosine) ** 2,
        ) + halfStrokeWidth;
      place(primitive.centerX - reachX, primitive.centerY - reachY);
      place(primitive.centerX + reachX, primitive.centerY + reachY);
    } else if (primitive.type === "path") {
      const halfStrokeWidth = (primitive.strokeWidth ?? 0) / 2;
      for (const command of primitive.commands) {
        if (command.type !== "close") {
          place(command.x - halfStrokeWidth, command.y - halfStrokeWidth);
          place(command.x + halfStrokeWidth, command.y + halfStrokeWidth);
        }
      }
    } else {
      const childOffsetX = offsetX + (primitive.translateX ?? 0) * scale;
      const childOffsetY = offsetY + (primitive.translateY ?? 0) * scale;
      const childScale = scale * (primitive.scale ?? 1);
      const childPoints = pointsOf(
        primitive.children,
        childOffsetX,
        childOffsetY,
        childScale,
      );
      if (primitive.clipRect) {
        // A clip constrains what actually reaches the page to the
        // intersection with the clip rectangle, regardless of how far the
        // unclipped children's own geometry would otherwise reach.
        const clipMinX = childOffsetX + primitive.clipRect.x * childScale;
        const clipMaxX =
          childOffsetX +
          (primitive.clipRect.x + primitive.clipRect.width) * childScale;
        const clipMinY = childOffsetY + primitive.clipRect.y * childScale;
        const clipMaxY =
          childOffsetY +
          (primitive.clipRect.y + primitive.clipRect.height) * childScale;
        points.push(
          ...childPoints.map((point) => ({
            x: Math.min(Math.max(point.x, clipMinX), clipMaxX),
            y: Math.min(Math.max(point.y, clipMinY), clipMaxY),
          })),
        );
      } else {
        points.push(...childPoints);
      }
    }
  }
  return points;
}

describe("unoReverseGeometry", () => {
  it("paints one band per stripe for every flag it offers", () => {
    for (const flagId of UNO_REVERSE_FLAG_IDS) {
      const primitives = unoReverseGeometry({
        ...UNO_REVERSE_DEFAULTS,
        flagId,
      });
      const clipGroup = primitives.find(
        (primitive) => primitive.type === "group" && primitive.clipRect,
      );
      expect(clipGroup).toBeDefined();
      expect(clipGroup?.type === "group" && clipGroup.children).toHaveLength(
        flagStripesOf(flagId).length,
      );
    }
  });

  it("keeps every drawn point inside the sticker square", () => {
    for (const flagId of UNO_REVERSE_FLAG_IDS) {
      for (const point of pointsOf(
        unoReverseGeometry({ ...UNO_REVERSE_DEFAULTS, flagId }),
      )) {
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(point.y).toBeGreaterThanOrEqual(0);
        expect(point.x).toBeLessThanOrEqual(STICKER_CANVAS_SIZE);
        expect(point.y).toBeLessThanOrEqual(STICKER_CANVAS_SIZE);
      }
    }
  });

  it("centres the card rect the geometry returns in the square", () => {
    const primitives = unoReverseGeometry(UNO_REVERSE_DEFAULTS);
    const cardRect = primitives.find((primitive) => primitive.type === "rect");
    expect(cardRect).toBeDefined();
    if (!cardRect || cardRect.type !== "rect") {
      throw new Error("unoReverseGeometry did not return a card rect");
    }
    expect(cardRect.x).toBe(UNO_CARD_X);
    expect(cardRect.y).toBe(UNO_CARD_Y);
    expect(cardRect.width).toBe(UNO_CARD_WIDTH);
    expect(cardRect.height).toBe(UNO_CARD_HEIGHT);
    expect(cardRect.x * 2 + cardRect.width).toBe(STICKER_CANVAS_SIZE);
    expect(cardRect.y * 2 + cardRect.height).toBe(STICKER_CANVAS_SIZE);
  });

  it("keeps every drawn point inside the card, stroke width included, across ring angle and frame width", () => {
    const ringAnglesDeg = [-45, 0, 45];
    const frameWidths = [0, 40];
    for (const flagId of UNO_REVERSE_FLAG_IDS) {
      for (const ringAngleDeg of ringAnglesDeg) {
        for (const frameWidth of frameWidths) {
          const primitives = unoReverseGeometry({
            ...UNO_REVERSE_DEFAULTS,
            flagId,
            ringAngleDeg,
            frameWidth,
          });
          for (const point of pointsOf(primitives)) {
            expect(point.x).toBeGreaterThanOrEqual(UNO_CARD_X);
            expect(point.y).toBeGreaterThanOrEqual(UNO_CARD_Y);
            expect(point.x).toBeLessThanOrEqual(UNO_CARD_X + UNO_CARD_WIDTH);
            expect(point.y).toBeLessThanOrEqual(UNO_CARD_Y + UNO_CARD_HEIGHT);
          }
        }
      }
    }
  });

  it("drops exactly the two corner glyphs when corner arrows are off", () => {
    const withArrows = unoReverseGeometry({
      ...UNO_REVERSE_DEFAULTS,
      hasCornerArrows: true,
    });
    const withoutArrows = unoReverseGeometry({
      ...UNO_REVERSE_DEFAULTS,
      hasCornerArrows: false,
    });
    expect(withArrows).toHaveLength(withoutArrows.length + 2);
  });

  it("rejects a flag it cannot paint", () => {
    expect(() =>
      unoReverseGeometry({ ...UNO_REVERSE_DEFAULTS, flagId: "progress" }),
    ).toThrow("Unknown flag id");
  });
});

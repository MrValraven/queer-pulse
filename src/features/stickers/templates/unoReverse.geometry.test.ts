import { describe, expect, it } from "vitest";
import {
  INTERSEX_COLORS,
  PROGRESS_CHEVRON_COLORS,
  STRIPED_FLAG_IDS,
  flagStripesOf,
} from "../../../shared/data/flagStripes.data";
import type {
  GroupPrimitive,
  PathCommand,
  PathPrimitive,
  Primitive,
  RectPrimitive,
} from "./primitives";
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

/** The clip group holding the flag's own design, which is the first clipped
 *  group the geometry paints. */
function flagGroupOf(primitives: Primitive[]): GroupPrimitive {
  const flagGroup = primitives.find(
    (primitive): primitive is GroupPrimitive =>
      primitive.type === "group" && primitive.clipRect !== undefined,
  );
  if (!flagGroup) {
    throw new Error("unoReverseGeometry did not return a clipped flag group");
  }
  return flagGroup;
}

describe("unoReverseGeometry", () => {
  it("offers every card flag in the picker order", () => {
    expect(UNO_REVERSE_FLAG_IDS).toEqual([
      "rainbow",
      "progress",
      ...STRIPED_FLAG_IDS.filter((flagId) => flagId !== "rainbow"),
      "intersex",
    ]);
  });

  it("paints one band per stripe for every striped flag", () => {
    for (const flagId of STRIPED_FLAG_IDS) {
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

  it("paints the Progress chevron as five nested polygons over the rainbow", () => {
    const flagGroup = flagGroupOf(
      unoReverseGeometry({ ...UNO_REVERSE_DEFAULTS, flagId: "progress" }),
    );
    const clipRect = flagGroup.clipRect;
    if (!clipRect) throw new Error("the flag group has no clip");
    const ground = flagGroup.children.filter(
      (primitive): primitive is RectPrimitive => primitive.type === "rect",
    );
    expect(ground.map((primitive) => primitive.fill)).toEqual(
      flagStripesOf("rainbow").map((band) => band.color),
    );

    const chevron = flagGroup.children.filter(
      (primitive): primitive is PathPrimitive => primitive.type === "path",
    );
    // Back to front: the black outer triangle first, the white one last.
    expect(chevron.map((primitive) => primitive.fill)).toEqual(
      PROGRESS_CHEVRON_COLORS,
    );
    const firstChevronBand = chevron[0];
    if (!firstChevronBand) throw new Error("the chevron has no bands");
    expect(flagGroup.children.indexOf(firstChevronBand)).toBe(ground.length);

    const centerY = clipRect.y + clipRect.height / 2;
    const apexDistances = chevron.map((primitive) => {
      const points = primitive.commands.filter(
        (command): command is Exclude<PathCommand, { type: "close" }> =>
          command.type !== "close",
      );
      expect(points).toHaveLength(3);
      const [top, apex, bottom] = points;
      if (!top || !apex || !bottom) throw new Error("a chevron lost a point");
      // Both ends sit on the hoist, the apex on the vertical centre line,
      // and each arm runs at 45 degrees.
      expect(top.x).toBeCloseTo(clipRect.x);
      expect(bottom.x).toBeCloseTo(clipRect.x);
      expect(apex.y).toBeCloseTo(centerY);
      const apexDistance = apex.x - clipRect.x;
      expect(centerY - top.y).toBeCloseTo(apexDistance);
      expect(bottom.y - centerY).toBeCloseTo(apexDistance);
      return apexDistance;
    });

    // The outer apex lands near the middle of the card's width.
    const outerApexShare = (apexDistances[0] ?? 0) / clipRect.width;
    expect(outerApexShare).toBeGreaterThanOrEqual(0.45);
    expect(outerApexShare).toBeLessThanOrEqual(0.55);
    // Equal steps between the nested triangles make the bands parallel and
    // of one width, and the white triangle keeps one step of its own.
    const step = (apexDistances[0] ?? 0) / apexDistances.length;
    apexDistances.forEach((apexDistance, index) => {
      expect(apexDistance).toBeCloseTo(step * (apexDistances.length - index));
    });
  });

  it("paints the Intersex flag as a centred purple ring on a yellow field", () => {
    const flagGroup = flagGroupOf(
      unoReverseGeometry({ ...UNO_REVERSE_DEFAULTS, flagId: "intersex" }),
    );
    const clipRect = flagGroup.clipRect;
    if (!clipRect) throw new Error("the flag group has no clip");
    const [field, ring] = flagGroup.children;
    expect(flagGroup.children).toHaveLength(2);
    if (field?.type !== "rect" || ring?.type !== "ellipse") {
      throw new Error("expected a field rect and a ring ellipse");
    }
    expect(field.fill).toBe(INTERSEX_COLORS.field);
    expect(field).toMatchObject({
      x: clipRect.x,
      y: clipRect.y,
      width: clipRect.width,
      height: clipRect.height,
    });

    expect(ring.fill).toBeUndefined();
    expect(ring.stroke).toBe(INTERSEX_COLORS.ring);
    expect(ring.radiusX).toBe(ring.radiusY);
    expect(ring.centerX).toBeCloseTo(clipRect.x + clipRect.width / 2);
    expect(ring.centerY).toBeCloseTo(clipRect.y + clipRect.height / 2);
    const strokeWidth = ring.strokeWidth ?? 0;
    const outerDiameterShare =
      (ring.radiusX * 2 + strokeWidth) / clipRect.width;
    // The ring rounds the centre glyph's arrow tips and stays inside the
    // flag with room to spare on either side.
    expect(outerDiameterShare).toBeGreaterThanOrEqual(0.72);
    expect(outerDiameterShare).toBeLessThanOrEqual(0.8);
    const thicknessShare = strokeWidth / (ring.radiusX * 2 + strokeWidth);
    expect(thicknessShare).toBeGreaterThanOrEqual(0.13);
    expect(thicknessShare).toBeLessThanOrEqual(0.17);
  });

  it("rejects a flag it cannot paint", () => {
    expect(() =>
      unoReverseGeometry({ ...UNO_REVERSE_DEFAULTS, flagId: "not-a-flag" }),
    ).toThrow("Unknown flag id: not-a-flag");
  });
});

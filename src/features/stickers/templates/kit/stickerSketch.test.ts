import { describe, expect, it } from "vitest";
import type { GroupPrimitive, Primitive, RectPrimitive } from "../primitives";
import { createSketch, whiteUnderlayOf, withHalo } from "./stickerSketch";

function isGroupPrimitive(primitive: Primitive): primitive is GroupPrimitive {
  return primitive.type === "group";
}

function flattenPrimitives(primitives: readonly Primitive[]): Primitive[] {
  const flattened: Primitive[] = [];
  for (const primitive of primitives) {
    flattened.push(primitive);
    if (isGroupPrimitive(primitive)) {
      flattened.push(...flattenPrimitives(primitive.children));
    }
  }
  return flattened;
}

function isWhitePaintedPrimitive(primitive: Primitive): boolean {
  if (isGroupPrimitive(primitive)) return false;
  return primitive.fill === "#ffffff" || primitive.stroke === "#ffffff";
}

const SAMPLE_RECT: RectPrimitive = {
  type: "rect",
  x: 100,
  y: 100,
  width: 60,
  height: 40,
  fill: "#e8775a",
};

describe("createSketch", () => {
  it("puts the white underlay first when the die-cut is on", () => {
    const sketch = createSketch();
    sketch.silhouette(SAMPLE_RECT);
    const built = sketch.build({ hasDieCut: true });
    const outerGroup = built[0];
    if (!outerGroup || !isGroupPrimitive(outerGroup)) {
      throw new Error("expected the outer fit group");
    }
    const firstChild = outerGroup.children[0];
    if (!firstChild) throw new Error("expected the underlay first");
    expect(isWhitePaintedPrimitive(firstChild)).toBe(true);
  });

  it("has no primitive with a white fill or stroke coming from the underlay when the die-cut is off", () => {
    const sketch = createSketch();
    sketch.silhouette(SAMPLE_RECT);
    const built = sketch.build({ hasDieCut: false });
    const flattened = flattenPrimitives(built);
    expect(flattened.some(isWhitePaintedPrimitive)).toBe(false);
  });

  it("keeps the outer group's fit identical whether the die-cut is on or off", () => {
    const sketch = createSketch();
    sketch.silhouette(SAMPLE_RECT);
    const withDieCut = sketch.build({ hasDieCut: true })[0];
    const withoutDieCut = sketch.build({ hasDieCut: false })[0];
    if (
      !withDieCut ||
      !isGroupPrimitive(withDieCut) ||
      !withoutDieCut ||
      !isGroupPrimitive(withoutDieCut)
    ) {
      throw new Error("expected the outer fit group");
    }
    expect(withoutDieCut.scale).toBe(withDieCut.scale);
    expect(withoutDieCut.translateX).toBe(withDieCut.translateX);
    expect(withoutDieCut.translateY).toBe(withDieCut.translateY);
  });

  it("paints without adding an underlay copy", () => {
    const sketch = createSketch();
    sketch.paint(SAMPLE_RECT);
    const built = sketch.build({ hasDieCut: true });
    const flattened = flattenPrimitives(built);
    expect(flattened.some(isWhitePaintedPrimitive)).toBe(false);
  });

  it("puts an underlay() primitive before painted primitives when the die-cut is on, drops it when off, and never changes the fit", () => {
    const sketch = createSketch();
    const whiteBacking: RectPrimitive = {
      type: "rect",
      x: 90,
      y: 90,
      width: 80,
      height: 60,
      fill: "#ffffff",
    };
    sketch.underlay(whiteBacking);
    sketch.paint(SAMPLE_RECT);

    const withDieCut = sketch.build({ hasDieCut: true });
    const outerGroupWithDieCut = withDieCut[0];
    if (!outerGroupWithDieCut || !isGroupPrimitive(outerGroupWithDieCut)) {
      throw new Error("expected the outer fit group");
    }
    expect(outerGroupWithDieCut.children).toEqual([whiteBacking, SAMPLE_RECT]);

    const withoutDieCut = sketch.build({ hasDieCut: false });
    const outerGroupWithoutDieCut = withoutDieCut[0];
    if (
      !outerGroupWithoutDieCut ||
      !isGroupPrimitive(outerGroupWithoutDieCut)
    ) {
      throw new Error("expected the outer fit group");
    }
    expect(outerGroupWithoutDieCut.children).toEqual([SAMPLE_RECT]);

    expect(outerGroupWithoutDieCut.scale).toBe(outerGroupWithDieCut.scale);
    expect(outerGroupWithoutDieCut.translateX).toBe(
      outerGroupWithDieCut.translateX,
    );
    expect(outerGroupWithoutDieCut.translateY).toBe(
      outerGroupWithDieCut.translateY,
    );
  });
});

describe("whiteUnderlayOf", () => {
  it("turns a clipPath group into its clip shape filled white", () => {
    const clipPathGroup: GroupPrimitive = {
      type: "group",
      translateX: 10,
      clipPath: [
        { type: "moveTo", x: 0, y: 0 },
        { type: "lineTo", x: 10, y: 0 },
        { type: "lineTo", x: 10, y: 10 },
        { type: "close" },
      ],
      children: [SAMPLE_RECT],
    };
    const underlay = whiteUnderlayOf(clipPathGroup, 44);
    if (!isGroupPrimitive(underlay)) throw new Error("expected a group");
    expect(underlay.translateX).toBe(10);
    expect(underlay.children).toHaveLength(1);
    const [clipShape] = underlay.children;
    if (!clipShape || clipShape.type !== "path") {
      throw new Error("expected a path");
    }
    expect(clipShape.commands).toEqual(clipPathGroup.clipPath);
    expect(clipShape.fill).toBe("#ffffff");
    expect(clipShape.stroke).toBe("#ffffff");
    expect(clipShape.strokeWidth).toBe(44);
  });

  it("leaves an open path unfilled even when the source has a fill", () => {
    const openPath: Primitive = {
      type: "path",
      commands: [
        { type: "moveTo", x: 0, y: 0 },
        { type: "lineTo", x: 10, y: 0 },
      ],
      fill: "#e8775a",
      stroke: "#1b1b1b",
      strokeWidth: 4,
    };
    const underlay = whiteUnderlayOf(openPath, 10);
    if (underlay.type !== "path") throw new Error("expected a path");
    expect(underlay.fill).toBeUndefined();
    expect(underlay.stroke).toBe("#ffffff");
    expect(underlay.strokeWidth).toBe(14);
  });
});

describe("withHalo", () => {
  it("doubles the primitive count and puts the halo copies first", () => {
    const primitives: Primitive[] = [SAMPLE_RECT];
    const haloed = withHalo(primitives, "#f7f3ee", 10);
    expect(haloed).toHaveLength(primitives.length * 2);
    const [haloCopy, original] = haloed;
    if (
      !haloCopy ||
      haloCopy.type !== "rect" ||
      !original ||
      original.type !== "rect"
    ) {
      throw new Error("expected rect primitives");
    }
    expect(haloCopy.fill).toBe("#f7f3ee");
    expect(haloCopy.stroke).toBe("#f7f3ee");
    expect(haloCopy.strokeWidth).toBe(10);
    expect(original).toEqual(SAMPLE_RECT);
  });
});

import { describe, expect, it } from "vitest";
import { HULL_PADDING_PX, convexHull, sceneHullPath } from "./vouchSceneHulls";

describe("sceneHullPath", () => {
  it("returns null for fewer than three points", () => {
    expect(
      sceneHullPath(
        [
          { x: 0, y: 0 },
          { x: 10, y: 10 },
        ],
        HULL_PADDING_PX,
      ),
    ).toBeNull();
  });

  it("returns a closed rounded path for a square", () => {
    const path = sceneHullPath(
      [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ],
      HULL_PADDING_PX,
    );
    expect(path).not.toBeNull();
    expect(path!.startsWith("M")).toBe(true);
    expect(path!.endsWith("Z")).toBe(true);
    expect(path!.match(/A/g)).toHaveLength(4);
    expect(path!.startsWith(`M0 -${HULL_PADDING_PX}`)).toBe(true);
  });

  it("draws a circle when every point is the same", () => {
    const path = sceneHullPath(
      [
        { x: 5, y: 5 },
        { x: 5, y: 5 },
        { x: 5, y: 5 },
      ],
      HULL_PADDING_PX,
    );
    expect(path!.endsWith("Z")).toBe(true);
    expect(path!.match(/A/g)).toHaveLength(2);
  });
});

describe("convexHull", () => {
  it("drops interior and collinear points", () => {
    const hull = convexHull([
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 100, y: 0 },
      { x: 50, y: 50 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ]);
    expect(hull).toHaveLength(4);
  });
});

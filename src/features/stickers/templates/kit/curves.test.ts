import { describe, expect, it } from "vitest";
import {
  arc,
  burst,
  ellipsePoints,
  fourPointStar,
  heartPoints,
  quadraticBezier,
  rotatePoints,
  toPathCommands,
} from "./curves";

describe("arc", () => {
  it("starts and ends exactly on the given points", () => {
    const points = arc(0, 0, 100, 0, 20);
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    if (!firstPoint || !lastPoint) {
      throw new Error("expected a first and a last point");
    }
    expect(firstPoint[0]).toBeCloseTo(0);
    expect(firstPoint[1]).toBeCloseTo(0);
    expect(lastPoint[0]).toBeCloseTo(100);
    expect(lastPoint[1]).toBeCloseTo(0);
  });

  it("bulges away from the straight line at the midpoint", () => {
    const points = arc(0, 0, 100, 0, 20, 2);
    const midpoint = points[1];
    if (!midpoint) throw new Error("expected a midpoint");
    expect(midpoint[0]).toBeCloseTo(50);
    expect(midpoint[1]).toBeCloseTo(20);
  });
});

describe("quadraticBezier", () => {
  it("starts at `start` and ends at `end`", () => {
    const points = quadraticBezier([0, 0], [50, 100], [100, 0]);
    expect(points[0]).toEqual([0, 0]);
    expect(points[points.length - 1]).toEqual([100, 0]);
  });
});

describe("ellipsePoints", () => {
  it("starts on the positive x axis at angle 0 by default", () => {
    const [firstPoint] = ellipsePoints(10, 20, 5, 8);
    if (!firstPoint) throw new Error("expected a first point");
    expect(firstPoint[0]).toBeCloseTo(15);
    expect(firstPoint[1]).toBeCloseTo(20);
  });

  it("samples `steps` + 1 points across the given angle span", () => {
    const points = ellipsePoints(0, 0, 10, 10, 0, Math.PI, 10);
    expect(points).toHaveLength(11);
  });
});

describe("fourPointStar", () => {
  it("has 8 vertices with the first point straight up", () => {
    const points = fourPointStar(0, 0, 100);
    expect(points).toHaveLength(8);
    expect(points[0]?.[0]).toBeCloseTo(0);
    expect(points[0]?.[1]).toBeCloseTo(-100);
  });

  it("alternates the outer radius with the inner radius", () => {
    const points = fourPointStar(0, 0, 100, 0.5);
    const innerPoint = points[1];
    if (!innerPoint) throw new Error("expected an inner point");
    const distanceFromCenter = Math.hypot(innerPoint[0], innerPoint[1]);
    expect(distanceFromCenter).toBeCloseTo(50);
  });
});

describe("burst", () => {
  it("returns twice `spikes` points", () => {
    expect(burst(0, 0, 100, 0.55, 6)).toHaveLength(12);
  });

  it("rotates the first point by `spin` radians off straight up", () => {
    const [firstPoint] = burst(0, 0, 100, 0.55, 8, 0);
    if (!firstPoint) throw new Error("expected a first point");
    expect(firstPoint[0]).toBeCloseTo(0);
    expect(firstPoint[1]).toBeCloseTo(-100);
  });
});

describe("heartPoints", () => {
  it("returns `steps` points", () => {
    expect(heartPoints(0, 0, 1, 32)).toHaveLength(32);
  });

  it("starts on the vertical centre line", () => {
    const [firstPoint] = heartPoints(50, 50, 2);
    if (!firstPoint) throw new Error("expected a first point");
    expect(firstPoint[0]).toBeCloseTo(50);
  });
});

describe("rotatePoints", () => {
  it("rotates a point 90 degrees about the given origin", () => {
    const [rotatedPoint] = rotatePoints([[10, 0]], 90, 0, 0);
    if (!rotatedPoint) throw new Error("expected a rotated point");
    expect(rotatedPoint[0]).toBeCloseTo(0);
    expect(rotatedPoint[1]).toBeCloseTo(10);
  });

  it("leaves the origin point itself unchanged", () => {
    const [rotatedPoint] = rotatePoints([[5, 5]], 40, 5, 5);
    if (!rotatedPoint) throw new Error("expected a rotated point");
    expect(rotatedPoint[0]).toBeCloseTo(5);
    expect(rotatedPoint[1]).toBeCloseTo(5);
  });
});

describe("toPathCommands", () => {
  it("returns an empty array for no points", () => {
    expect(toPathCommands([], true)).toEqual([]);
  });

  it("emits moveTo, then lineTo, then close when closed", () => {
    const commands = toPathCommands(
      [
        [0, 0],
        [10, 0],
        [10, 10],
      ],
      true,
    );
    expect(commands).toEqual([
      { type: "moveTo", x: 0, y: 0 },
      { type: "lineTo", x: 10, y: 0 },
      { type: "lineTo", x: 10, y: 10 },
      { type: "close" },
    ]);
  });

  it("omits close when not closed", () => {
    const commands = toPathCommands(
      [
        [0, 0],
        [10, 0],
      ],
      false,
    );
    expect(commands.some((command) => command.type === "close")).toBe(false);
  });
});

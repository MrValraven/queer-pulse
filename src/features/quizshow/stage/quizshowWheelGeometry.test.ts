import { describe, expect, it } from "vitest";
import {
  wheelLabelFit,
  wheelPegPoints,
  wheelPolarPoint,
  wheelSliceGeometries,
} from "./quizshowWheelGeometry";

/** The hub's radius plus half its 1.2 unit ring stroke. */
const HUB_RING_OUTER_RADIUS = 23.6;

/** The same 4 decimal rounding the geometry uses in its path strings. */
function rounded(value: number): number {
  return Math.round(value * 10000) / 10000 + 0;
}

/** Labels start at r 90 and run inward by the estimated glyph width (0.6 em). */
function labelEndRadius(fit: { text: string; fontSize: number }): number {
  return 90 - 0.6 * Array.from(fit.text).length * fit.fontSize;
}

function firstOf<Item>(items: readonly Item[]): Item {
  const first = items.at(0);
  if (first === undefined) throw new Error("expected at least one item");
  return first;
}

describe("wheel geometry", () => {
  it("puts 0 degrees at 12 o'clock and 270 at 9 o'clock", () => {
    const top = wheelPolarPoint(100, 0);
    expect(top.x).toBeCloseTo(0, 6);
    expect(top.y).toBeCloseTo(-100, 6);
    expect(wheelPolarPoint(100, 90).x).toBeCloseTo(100, 6);
    expect(wheelPolarPoint(100, 270).x).toBeCloseTo(-100, 6);
  });

  it("splits four slices into quarters with labels reading rim to hub", () => {
    const slices = wheelSliceGeometries(4);
    expect(slices.map((slice) => slice.middleDegrees)).toEqual([
      45, 135, 225, 315,
    ]);
    expect(slices.map((slice) => slice.labelRotation)).toEqual([
      135, 225, 315, 405,
    ]);
    expect(firstOf(slices).labelPoint.x).toBeCloseTo(
      wheelPolarPoint(90, 45).x,
      6,
    );
  });

  it("draws a full disc for one slice", () => {
    const only = firstOf(wheelSliceGeometries(1));
    expect(only.middleDegrees).toBe(180);
    expect(only.path.match(/A/g)).toHaveLength(2);
    expect(only.path).not.toContain("L");
    expect(only.winnerPath.match(/A/g)).toHaveLength(2);
    expect(wheelPegPoints(1)).toHaveLength(1);
  });

  it("puts one peg on every boundary", () => {
    const pegs = wheelPegPoints(8);
    expect(pegs).toHaveLength(8);
    expect(firstOf(pegs).y).toBeCloseTo(-102.8, 6);
  });

  it("splits two slices into halves with the winner inset on both sides", () => {
    const [first, second] = wheelSliceGeometries(2);
    if (first === undefined || second === undefined) {
      throw new Error("expected two slices");
    }
    expect(first.path).toBe("M0 0 L0 -99 A99 99 0 0 1 0 99 Z");
    expect(second.path).toBe("M0 0 L0 99 A99 99 0 0 1 0 -99 Z");
    expect([first.middleDegrees, second.middleDegrees]).toEqual([90, 270]);
    const insetStart = wheelPolarPoint(98.4, 0.4);
    const insetEnd = wheelPolarPoint(98.4, 179.6);
    expect(first.winnerPath).toBe(
      `M0 0 L${rounded(insetStart.x)} ${rounded(insetStart.y)} A98.4 98.4 0 0 1 ${rounded(insetEnd.x)} ${rounded(insetEnd.y)} Z`,
    );
    expect(insetStart.x).toBeGreaterThan(0);
  });

  it("fits short labels at the largest size", () => {
    expect(wheelLabelFit("Music")).toEqual({ text: "Music", fontSize: 8.2 });
  });

  it("keeps a 17 character label whole and clear of the hub", () => {
    const title = "Dates and numbers";
    expect(Array.from(title)).toHaveLength(17);
    const fit = wheelLabelFit(title);
    expect(fit.text).toBe(title);
    expect(fit.fontSize).toBeCloseTo(62 / (0.6 * 17), 6);
    expect(labelEndRadius(fit)).toBeGreaterThanOrEqual(28 - 1e-9);
    expect(labelEndRadius(fit)).toBeGreaterThan(HUB_RING_OUTER_RADIUS);
  });

  it("keeps a 19 character label whole at about 5.44 units, clear of the hub", () => {
    for (const title of ["Detetor de mentiras", "Drag Name Generator"]) {
      expect(Array.from(title)).toHaveLength(19);
      const fit = wheelLabelFit(title);
      expect(fit.text).toBe(title);
      expect(fit.fontSize).toBeCloseTo(62 / (0.6 * 19), 6);
      expect(fit.fontSize).toBeCloseTo(5.44, 2);
      expect(labelEndRadius(fit)).toBeGreaterThan(HUB_RING_OUTER_RADIUS);
    }
  });

  it("still shortens a 20 character label at the smallest size, ending before the hub ring", () => {
    const title = "Drag Name Generators";
    expect(Array.from(title)).toHaveLength(20);
    const fit = wheelLabelFit(title);
    expect(fit).toEqual({ text: "Drag Name Generato…", fontSize: 5.4 });
    expect(labelEndRadius(fit)).toBeGreaterThanOrEqual(26);
  });

  it("shortens long labels to 19 characters with the ellipsis", () => {
    const long = wheelLabelFit("The longest category title anyone could write");
    expect(long.fontSize).toBe(5.4);
    expect(long.text).toBe("The longest catego…");
    expect(labelEndRadius(long)).toBeGreaterThanOrEqual(26);
  });

  it("counts and cuts labels by code points", () => {
    const wideCharacter = "\u{1D49C}";
    const astralTitle = wideCharacter.repeat(30);
    const fit = wheelLabelFit(astralTitle);
    expect(fit.fontSize).toBe(5.4);
    expect(Array.from(fit.text)).toHaveLength(19);
    expect(fit.text).toBe(`${wideCharacter.repeat(18)}…`);
    const shortAstral = wheelLabelFit(wideCharacter.repeat(10));
    expect(shortAstral.fontSize).toBeCloseTo(62 / (0.6 * 10), 6);
  });
});

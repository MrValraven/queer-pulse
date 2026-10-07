import { describe, expect, it } from "vitest";
import {
  CONSTELLATION_LIMIT,
  ORBIT_CAPACITY,
  ORBIT_RADII,
  layoutConstellation,
  onlineAddressOf,
  outerTurnFor,
} from "./onlineConstellation";

const distanceOf = (node: { x: number; y: number }) =>
  Math.hypot(node.x, node.y);

describe("layoutConstellation", () => {
  it("fills the inner orbit first, starting at twelve o'clock", () => {
    const nodes = layoutConstellation(["a", "b", "c"]);
    expect(nodes.map((node) => node.orbit)).toEqual([0, 0, 0]);
    expect(nodes[0]).toMatchObject({ item: "a", x: 0, y: -ORBIT_RADII[0] });
    for (const node of nodes) {
      expect(distanceOf(node)).toBeCloseTo(ORBIT_RADII[0], 1);
    }
  });

  it("keeps a handful on the inner orbit alone", () => {
    const items = Array.from({ length: ORBIT_CAPACITY[0] }, (_, i) => i);
    const orbits = layoutConstellation(items).map((node) => node.orbit);
    expect(orbits.every((orbit) => orbit === 0)).toBe(true);
  });

  it("splits a larger set across both orbits instead of leaving a straggler", () => {
    const nodes = layoutConstellation([1, 2, 3, 4, 5, 6]);
    const outer = nodes.filter((node) => node.orbit === 1);
    expect(outer).toHaveLength(3);
    for (const node of outer) {
      expect(distanceOf(node)).toBeCloseTo(ORBIT_RADII[1], 1);
    }
  });

  it("never puts more on the inner orbit than it holds", () => {
    const items = Array.from({ length: CONSTELLATION_LIMIT }, (_, i) => i);
    const inner = layoutConstellation(items).filter((node) => node.orbit === 0);
    expect(inner).toHaveLength(ORBIT_CAPACITY[0]);
  });

  it("turns the outer orbit half a step so no node sits on an inner spoke", () => {
    const nodes = layoutConstellation([1, 2, 3, 4, 5, 6]);
    const firstOuter = nodes.find((node) => node.orbit === 1)!;
    // Three on the outer orbit, the first turned a sixth of a turn past noon.
    expect(firstOuter.x).toBeCloseTo(
      Math.cos(-Math.PI / 6) * ORBIT_RADII[1],
      1,
    );
    expect(firstOuter.y).toBeCloseTo(
      Math.sin(-Math.PI / 6) * ORBIT_RADII[1],
      1,
    );
  });

  it("keeps every inner and outer node clear of each other at any count", () => {
    // A node is 18% of the stage wide, so two centres closer than that touch.
    for (let count = 6; count <= CONSTELLATION_LIMIT; count += 1) {
      const nodes = layoutConstellation(
        Array.from({ length: count }, (_, i) => i),
      );
      const inner = nodes.filter((node) => node.orbit === 0);
      const outer = nodes.filter((node) => node.orbit === 1);
      for (const outerNode of outer) {
        for (const innerNode of inner) {
          const apart = Math.hypot(
            outerNode.x - innerNode.x,
            outerNode.y - innerNode.y,
          );
          expect(apart).toBeGreaterThan(19);
        }
      }
    }
  });

  it("turns the outer orbit off the inner spokes for nine businesses", () => {
    // Four inner and five outer: half a step put one outer node on a spoke.
    const turn = outerTurnFor(4, 5);
    expect(turn).toBeCloseTo((Math.PI * 2 * 27) / 360, 5);
  });

  it("seats at most CONSTELLATION_LIMIT, keeping the order it was given", () => {
    const items = Array.from({ length: CONSTELLATION_LIMIT + 4 }, (_, i) => i);
    const nodes = layoutConstellation(items);
    expect(nodes).toHaveLength(CONSTELLATION_LIMIT);
    expect(nodes.map((node) => node.item)).toEqual(
      items.slice(0, CONSTELLATION_LIMIT),
    );
  });

  it("keeps every node inside the stage", () => {
    const items = Array.from({ length: CONSTELLATION_LIMIT }, (_, i) => i);
    for (const node of layoutConstellation(items)) {
      expect(Math.abs(node.x)).toBeLessThan(50);
      expect(Math.abs(node.y)).toBeLessThan(50);
    }
  });

  it("draws nothing for no businesses", () => {
    expect(layoutConstellation([])).toEqual([]);
  });
});

describe("onlineAddressOf", () => {
  it("prefers the website, reduced to its bare hostname", () => {
    expect(
      onlineAddressOf({
        website: "https://www.fiosolto.pt/loja",
        instagram: "@fiosolto",
      }),
    ).toBe("fiosolto.pt");
  });

  it("falls back to the Instagram profile", () => {
    expect(onlineAddressOf({ instagram: "@peitolivre" })).toBe(
      "instagram.com/peitolivre",
    );
  });

  it("has nothing to show without either", () => {
    expect(onlineAddressOf({ website: "  " })).toBeNull();
  });
});

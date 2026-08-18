import { describe, expect, it } from "vitest";
import { freguesiaBounds } from "./freguesiaBounds";

describe("freguesiaBounds", () => {
  it("returns null for an unknown name", () => {
    expect(freguesiaBounds(["Nowhere"])).toBeNull();
  });

  it("returns null for an empty list", () => {
    expect(freguesiaBounds([])).toBeNull();
  });

  it("returns the bounding box of a single named parish", () => {
    const bounds = freguesiaBounds(["Marvila"]);
    expect(bounds).not.toBeNull();
    const [[minLng, minLat], [maxLng, maxLat]] = bounds!;
    expect(minLng).toBeLessThan(maxLng);
    expect(minLat).toBeLessThan(maxLat);
  });

  it("unions the bounding boxes of multiple named parishes", () => {
    const single = freguesiaBounds(["Marvila"])!;
    const union = freguesiaBounds(["Marvila", "Belém"])!;
    expect(union[0][0]).toBeLessThanOrEqual(single[0][0]);
    expect(union[0][1]).toBeLessThanOrEqual(single[0][1]);
    expect(union[1][0]).toBeGreaterThanOrEqual(single[1][0]);
    expect(union[1][1]).toBeGreaterThanOrEqual(single[1][1]);
  });

  it("skips unknown names mixed in with known ones", () => {
    const known = freguesiaBounds(["Marvila"]);
    const mixed = freguesiaBounds(["Marvila", "Nowhere"]);
    expect(mixed).toEqual(known);
  });
});

import { describe, expect, it } from "vitest";
import { freguesiaAt } from "./freguesiaAt";
import { FREGUESIAS } from "./freguesias.data";

describe("freguesiaAt", () => {
  it("places every parish's label point inside that parish", () => {
    for (const feature of FREGUESIAS.features) {
      const [longitude, latitude] = feature.properties.labelPoint;
      expect(freguesiaAt(latitude, longitude)).toBe(feature.properties.name);
    }
  });

  it("returns null for a point outside every parish", () => {
    expect(freguesiaAt(38.6, -9.4)).toBeNull();
  });
});

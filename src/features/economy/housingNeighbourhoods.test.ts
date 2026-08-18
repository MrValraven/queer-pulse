import { describe, expect, it } from "vitest";
import {
  LISBON_HOUSING_NEIGHBOURHOODS,
  neighbourhoodCentroid,
} from "./housingNeighbourhoods";

describe("neighbourhoodCentroid", () => {
  it("resolves accent- and case-insensitively", () => {
    expect(neighbourhoodCentroid("arroios")).toEqual({
      latitude: 38.72984,
      longitude: -9.13881,
    });
    expect(neighbourhoodCentroid("Arroios")).not.toBeNull();
  });

  it("resolves a name with diacritics case-insensitively", () => {
    expect(neighbourhoodCentroid("misericordia")).not.toBeNull();
    expect(neighbourhoodCentroid("Misericórdia")).not.toBeNull();
  });

  it("returns null for an unknown area", () => {
    expect(neighbourhoodCentroid("Nowhere")).toBeNull();
  });

  it("has a centroid for every listed neighbourhood", () => {
    for (const entry of LISBON_HOUSING_NEIGHBOURHOODS) {
      expect(neighbourhoodCentroid(entry.name)).not.toBeNull();
    }
  });

  it("lists all 24 Lisbon freguesias", () => {
    expect(LISBON_HOUSING_NEIGHBOURHOODS).toHaveLength(24);
  });
});

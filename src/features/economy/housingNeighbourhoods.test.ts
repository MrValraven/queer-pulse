import { describe, expect, it } from "vitest";
import {
  LISBON_HOUSING_NEIGHBOURHOODS,
  neighbourhoodCentroid,
} from "./housingNeighbourhoods";

describe("neighbourhoodCentroid", () => {
  it("resolves accent- and case-insensitively", () => {
    expect(neighbourhoodCentroid("principe real")).toEqual({
      latitude: 38.7176,
      longitude: -9.1503,
    });
    expect(neighbourhoodCentroid("Príncipe Real")).not.toBeNull();
  });

  it("returns null for an unknown area", () => {
    expect(neighbourhoodCentroid("Nowhere")).toBeNull();
  });

  it("has a centroid for every listed neighbourhood", () => {
    for (const entry of LISBON_HOUSING_NEIGHBOURHOODS) {
      expect(neighbourhoodCentroid(entry.name)).not.toBeNull();
    }
  });
});

import { describe, expect, it } from "vitest";
import {
  LISBON_HOUSING_NEIGHBOURHOODS,
  neighbourhoodCentroid,
} from "./housingNeighbourhoods";
import { FREGUESIAS } from "../../shared/components/map/freguesias.data";

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

  it("lists every freguesia the map draws, one entry each", () => {
    expect(LISBON_HOUSING_NEIGHBOURHOODS).toHaveLength(
      FREGUESIAS.features.length,
    );
    const names = LISBON_HOUSING_NEIGHBOURHOODS.map((entry) => entry.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("lists all 24 Lisbon freguesias first", () => {
    const lisbonNames = LISBON_HOUSING_NEIGHBOURHOODS.slice(0, 24).map(
      (entry) => entry.name,
    );
    expect(lisbonNames[0]).toBe("Ajuda");
    expect(lisbonNames).toContain("Parque das Nações");
    expect(lisbonNames).toContain("São Domingos de Benfica");
    expect(lisbonNames[23]).toBe("São Vicente");
    expect(LISBON_HOUSING_NEIGHBOURHOODS[24]?.name).toBe("Costa de Caparica");
  });
});

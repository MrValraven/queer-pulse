import { describe, expect, it } from "vitest";
import {
  LISBON_NEIGHBOURHOODS,
  LISBON_NEIGHBOURHOOD_NAMES,
  isLisbonNeighbourhood,
} from "./lisbonNeighbourhoods";

describe("LISBON_NEIGHBOURHOODS", () => {
  it("carries the 24 freguesias plus the informal bairros", () => {
    const freguesias = LISBON_NEIGHBOURHOODS.filter(
      (entry) => entry.kind === "freguesia",
    );
    expect(freguesias).toHaveLength(24);
    expect(LISBON_NEIGHBOURHOODS).toHaveLength(33);
  });

  it("lists no name twice", () => {
    expect(new Set(LISBON_NEIGHBOURHOOD_NAMES).size).toBe(
      LISBON_NEIGHBOURHOOD_NAMES.length,
    );
  });

  it("puts the everyday bairros before the official parishes", () => {
    const firstFreguesia = LISBON_NEIGHBOURHOODS.findIndex(
      (entry) => entry.kind === "freguesia",
    );
    const lastBairro = LISBON_NEIGHBOURHOODS.map(
      (entry) => entry.kind,
    ).lastIndexOf("bairro");
    expect(lastBairro).toBeLessThan(firstFreguesia);
  });

  it("offers both the bairro and the freguesia a member might name", () => {
    // The overlap is deliberate: Bairro Alto sits inside Misericórdia, and a
    // member should be able to say either.
    expect(isLisbonNeighbourhood("Bairro Alto")).toBe(true);
    expect(isLisbonNeighbourhood("Misericórdia")).toBe(true);
    expect(isLisbonNeighbourhood("Arroios")).toBe(true);
  });

  it("does not claim a place outside the list", () => {
    expect(isLisbonNeighbourhood("Cedofeita, Porto")).toBe(false);
    expect(isLisbonNeighbourhood("")).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { distanceInMetres } from "./geoDistance";

// Two real Lisbon pins from BUSINESS_COORDS, roughly 500 m apart on foot.
const ATELIER_PULSO = { latitude: 38.7167, longitude: -9.149 };
const BAIRRO_ALTO_STUDIO = { latitude: 38.7128, longitude: -9.146 };

describe("distanceInMetres", () => {
  it("is zero for the same point", () => {
    expect(distanceInMetres(ATELIER_PULSO, ATELIER_PULSO)).toBe(0);
  });

  it("measures a short city walk", () => {
    const metres = distanceInMetres(ATELIER_PULSO, BAIRRO_ALTO_STUDIO);
    expect(metres).toBeGreaterThan(450);
    expect(metres).toBeLessThan(600);
  });

  it("is symmetric", () => {
    expect(distanceInMetres(ATELIER_PULSO, BAIRRO_ALTO_STUDIO)).toBeCloseTo(
      distanceInMetres(BAIRRO_ALTO_STUDIO, ATELIER_PULSO),
      6,
    );
  });

  it("measures a degree of latitude at about 111 km", () => {
    const metres = distanceInMetres(
      { latitude: 38, longitude: -9 },
      { latitude: 39, longitude: -9 },
    );
    expect(metres).toBeGreaterThan(111_000);
    expect(metres).toBeLessThan(111_600);
  });

  it("handles antipodal-ish spans without NaN", () => {
    const metres = distanceInMetres(
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 180 },
    );
    expect(Number.isFinite(metres)).toBe(true);
    expect(metres).toBeGreaterThan(20_000_000);
  });
});

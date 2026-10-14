import { describe, expect, it } from "vitest";
import { kWeightingCoefficients } from "./studioKWeighting";

describe("kWeightingCoefficients", () => {
  it("matches the BS.1770-4 table at 48 kHz", () => {
    const { shelf, highPass } = kWeightingCoefficients(48000);
    expect(shelf.b0).toBeCloseTo(1.53512485958697, 8);
    expect(shelf.b1).toBeCloseTo(-2.69169618940638, 8);
    expect(shelf.b2).toBeCloseTo(1.19839281085285, 8);
    expect(shelf.a1).toBeCloseTo(-1.69065929318241, 8);
    expect(shelf.a2).toBeCloseTo(0.73248077421585, 8);
    expect(highPass.b0).toBe(1);
    expect(highPass.b1).toBe(-2);
    expect(highPass.b2).toBe(1);
    expect(highPass.a1).toBeCloseTo(-1.99004745483398, 8);
    expect(highPass.a2).toBeCloseTo(0.99007225036621, 8);
  });

  it("derives different coefficients for 44.1 kHz", () => {
    const at48 = kWeightingCoefficients(48000);
    const at44 = kWeightingCoefficients(44100);
    expect(at44.shelf.a1).not.toBeCloseTo(at48.shelf.a1, 3);
    expect(at44.highPass.a1).not.toBeCloseTo(at48.highPass.a1, 5);
  });
});

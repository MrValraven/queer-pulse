import { describe, expect, it } from "vitest";
import { nextVisualRotation } from "./visualRotation";

describe("nextVisualRotation", () => {
  it("turns the short way round", () => {
    expect(nextVisualRotation(0, 90)).toBe(90);
    expect(nextVisualRotation(90, 0)).toBe(0);
    expect(nextVisualRotation(270, 0)).toBe(360);
    expect(nextVisualRotation(0, 270)).toBe(-90);
    expect(nextVisualRotation(360, 90)).toBe(450);
  });

  it("stays put when the shown angle already matches the target", () => {
    expect(nextVisualRotation(450, 90)).toBe(450);
    expect(nextVisualRotation(-90, 270)).toBe(-90);
  });

  it("turns clockwise for a half turn", () => {
    expect(nextVisualRotation(0, 180)).toBe(180);
    expect(nextVisualRotation(90, 270)).toBe(270);
  });

  it("starts from a negative shown angle", () => {
    expect(nextVisualRotation(-90, 0)).toBe(0);
    expect(nextVisualRotation(-90, 180)).toBe(-180);
  });
});

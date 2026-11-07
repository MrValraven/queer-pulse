import { describe, expect, it, vi } from "vitest";
import { VJ_HAPTIC_PATTERNS, vibrateVj } from "./vjHaptics";

describe("vibrateVj", () => {
  it("vibrates with the refused pattern", () => {
    const vibrate = vi.fn(() => true);
    expect(vibrateVj("refused", { vibrate })).toBe(true);
    expect(vibrate).toHaveBeenCalledWith([30, 40, 30]);
  });

  it("vibrates with a single pulse for a press", () => {
    const vibrate = vi.fn(() => true);
    expect(vibrateVj("press", { vibrate })).toBe(true);
    expect(vibrate).toHaveBeenCalledWith(VJ_HAPTIC_PATTERNS.press);
  });

  it("returns false where vibrate is missing", () => {
    expect(vibrateVj("latch", {})).toBe(false);
  });

  it("swallows a throwing vibrate", () => {
    const vibrate = vi.fn((): boolean => {
      throw new Error("vibrate blocked");
    });
    expect(vibrateVj("downbeat", { vibrate })).toBe(false);
    expect(vibrate).toHaveBeenCalledTimes(1);
  });

  it("reports false when the device declines", () => {
    expect(vibrateVj("release", { vibrate: () => false })).toBe(false);
  });
});

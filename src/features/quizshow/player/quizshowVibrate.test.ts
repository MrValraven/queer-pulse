import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  QUIZSHOW_VIBRATION_STORAGE_KEY,
  isVibrationOn,
  setVibrationOn,
  vibrateForReveal,
} from "./quizshowVibrate";

describe("quizshowVibrate", () => {
  let vibrate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    window.localStorage.removeItem(QUIZSHOW_VIBRATION_STORAGE_KEY);
    vibrate = vi.fn().mockReturnValue(true);
    Object.defineProperty(navigator, "vibrate", {
      configurable: true,
      writable: true,
      value: vibrate,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.removeItem(QUIZSHOW_VIBRATION_STORAGE_KEY);
  });

  it("is on by default and buzzes on a reveal", () => {
    expect(isVibrationOn()).toBe(true);
    vibrateForReveal(true);
    expect(vibrate).toHaveBeenCalledWith([40]);
  });

  it("stops navigator.vibrate once switched off, and keeps the choice", () => {
    setVibrationOn(false);
    expect(window.localStorage.getItem(QUIZSHOW_VIBRATION_STORAGE_KEY)).toBe(
      "false",
    );
    expect(isVibrationOn()).toBe(false);
    vibrateForReveal(false);
    vibrateForReveal(null);
    expect(vibrate).not.toHaveBeenCalled();

    setVibrationOn(true);
    vibrateForReveal(false);
    expect(vibrate).toHaveBeenCalledWith([20, 60, 20]);
  });

  it("keeps the default when the storage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => setVibrationOn(false)).not.toThrow();
    expect(isVibrationOn()).toBe(true);
    vibrateForReveal(null);
    expect(vibrate).toHaveBeenCalledWith([15]);
  });
});

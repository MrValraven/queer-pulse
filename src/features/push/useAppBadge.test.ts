import { describe, expect, it, vi } from "vitest";
import { applyAppBadge } from "./useAppBadge";

describe("applyAppBadge", () => {
  it("sets the badge to a positive count", () => {
    const setAppBadge = vi.fn().mockResolvedValue(undefined);
    const clearAppBadge = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { setAppBadge, clearAppBadge });
    applyAppBadge(3);
    expect(setAppBadge).toHaveBeenCalledWith(3);
    expect(clearAppBadge).not.toHaveBeenCalled();
  });

  it("clears the badge at zero", () => {
    const setAppBadge = vi.fn().mockResolvedValue(undefined);
    const clearAppBadge = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { setAppBadge, clearAppBadge });
    applyAppBadge(0);
    expect(clearAppBadge).toHaveBeenCalled();
    expect(setAppBadge).not.toHaveBeenCalled();
  });

  it("does nothing where the Badging API is missing", () => {
    vi.stubGlobal("navigator", {});
    expect(() => applyAppBadge(2)).not.toThrow();
  });

  it("swallows a rejected badge call", async () => {
    const setAppBadge = vi.fn().mockRejectedValue(new Error("not installed"));
    vi.stubGlobal("navigator", { setAppBadge });
    expect(() => applyAppBadge(1)).not.toThrow();
    await Promise.resolve();
  });
});

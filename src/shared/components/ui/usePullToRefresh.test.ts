import { describe, expect, it } from "vitest";
import { PULL_MAX_PX, resolvePull } from "./usePullToRefresh";

describe("resolvePull", () => {
  it("does not arm a refresh with no drag", () => {
    expect(resolvePull(0, 80).shouldRefresh).toBe(false);
  });

  it("arms a refresh once the eased pull clears the threshold", () => {
    expect(resolvePull(120, 80).shouldRefresh).toBe(true);
  });

  it("never pulls on an upward drag", () => {
    expect(resolvePull(-30, 80).pull).toBe(0);
    expect(resolvePull(-30, 80).shouldRefresh).toBe(false);
  });

  it("eases the pull to grow slower than the raw finger travel", () => {
    const { pull } = resolvePull(120, 80);
    expect(pull).toBeGreaterThan(0);
    expect(pull).toBeLessThan(120);
  });

  it("clamps the pull at PULL_MAX_PX for a very large drag", () => {
    expect(resolvePull(5000, 80).pull).toBe(PULL_MAX_PX);
  });

  it("treats a pull exactly at the threshold as arming (>= boundary)", () => {
    // A huge drag clamps the pull to exactly PULL_MAX_PX; using that as the
    // threshold exercises the >= boundary without relying on inverting the
    // easing curve.
    expect(resolvePull(5000, PULL_MAX_PX).shouldRefresh).toBe(true);
  });
});

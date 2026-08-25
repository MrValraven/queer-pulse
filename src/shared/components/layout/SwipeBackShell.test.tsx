import { describe, expect, it } from "vitest";
import { canGoBack } from "./canGoBack";

/**
 * The pure guard behind the edge-swipe-back gesture: idx 0 is the tab's
 * landing entry — swiping back there has nothing to pop to, so the gesture
 * must no-op rather than dead-end. Everything past it can pop.
 */
describe("canGoBack", () => {
  it("is false at the first history entry", () => {
    expect(canGoBack(0)).toBe(false);
  });

  it("is true once history has entries behind it", () => {
    expect(canGoBack(3)).toBe(true);
  });
});

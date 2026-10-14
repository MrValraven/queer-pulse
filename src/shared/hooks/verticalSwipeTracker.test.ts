import { describe, expect, it } from "vitest";
import { createVerticalSwipeTracker } from "./verticalSwipeTracker";

describe("createVerticalSwipeTracker", () => {
  it("counts a long slow drag down", () => {
    const tracker = createVerticalSwipeTracker({ direction: "down" });
    tracker.start(100, 0);
    expect(tracker.move(180)).toBe(80);
    expect(tracker.end(230, 2000)).toBe(true);
  });

  it("counts a short fast flick and refuses a short slow drag", () => {
    const flick = createVerticalSwipeTracker({ direction: "up" });
    flick.start(500, 0);
    expect(flick.end(460, 50)).toBe(true);
    const slow = createVerticalSwipeTracker({ direction: "up" });
    slow.start(500, 0);
    expect(slow.end(460, 1000)).toBe(false);
  });

  it("ignores travel the wrong way", () => {
    const tracker = createVerticalSwipeTracker({ direction: "down" });
    tracker.start(300, 0);
    expect(tracker.move(100)).toBe(0);
    expect(tracker.end(50, 10)).toBe(false);
  });

  it("forgets the gesture on cancel", () => {
    const tracker = createVerticalSwipeTracker({ direction: "down" });
    tracker.start(0, 0);
    tracker.cancel();
    expect(tracker.isActive()).toBe(false);
    expect(tracker.end(500, 10)).toBe(false);
  });
});

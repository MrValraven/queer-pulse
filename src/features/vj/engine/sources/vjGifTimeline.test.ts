import { describe, expect, it } from "vitest";
import { createVjGifTimeline, vjGifFrameIndexAt } from "./vjGifTimeline";

describe("vjGifTimeline", () => {
  it("plays a 10 ms frame delay as 100 ms", () => {
    const timeline = createVjGifTimeline([10, 50, 0]);
    expect(Array.from(timeline.frameStartsMs)).toEqual([0, 100, 150]);
    expect(timeline.totalMs).toBe(250);
    expect(createVjGifTimeline([20]).totalMs).toBe(20);
  });

  it("finds the frame for any position", () => {
    const timeline = createVjGifTimeline([100, 200, 300]);
    expect(vjGifFrameIndexAt(timeline, 0)).toBe(0);
    expect(vjGifFrameIndexAt(timeline, 99)).toBe(0);
    expect(vjGifFrameIndexAt(timeline, 100)).toBe(1);
    expect(vjGifFrameIndexAt(timeline, 299)).toBe(1);
    expect(vjGifFrameIndexAt(timeline, 300)).toBe(2);
    expect(vjGifFrameIndexAt(timeline, 599)).toBe(2);
    // Past the end and before the start wrap around the timeline.
    expect(vjGifFrameIndexAt(timeline, 600)).toBe(0);
    expect(vjGifFrameIndexAt(timeline, 750)).toBe(1);
    expect(vjGifFrameIndexAt(timeline, -50)).toBe(2);
  });

  it("handles a single-frame GIF", () => {
    const timeline = createVjGifTimeline([0]);
    expect(timeline.frameStartsMs.length).toBe(1);
    expect(timeline.totalMs).toBe(100);
    expect(vjGifFrameIndexAt(timeline, 0)).toBe(0);
    expect(vjGifFrameIndexAt(timeline, 12_345)).toBe(0);
    expect(vjGifFrameIndexAt(createVjGifTimeline([]), 40)).toBe(0);
  });
});

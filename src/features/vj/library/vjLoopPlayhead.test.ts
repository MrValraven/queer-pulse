import { describe, expect, it } from "vitest";
import {
  clampVjLoopSpan,
  formatVjLoopTime,
  vjLoopPatchOf,
  vjLoopPlayheadMs,
  vjLoopSpanOf,
} from "./vjLoopPlayhead";

const DURATION_MS = 8000;

describe("vjLoopPlayhead", () => {
  it("reads a video with no stored points as the whole clip", () => {
    expect(
      vjLoopSpanOf({
        mediaKind: "video",
        durationMs: DURATION_MS,
        loopInMs: null,
        loopOutMs: null,
      }),
    ).toEqual({ inMs: 0, outMs: DURATION_MS });
    expect(
      vjLoopSpanOf({
        mediaKind: "video",
        durationMs: DURATION_MS,
        loopInMs: 1500,
        loopOutMs: null,
      }),
    ).toEqual({ inMs: 1500, outMs: DURATION_MS });
  });

  it("reads a GIF as having no loop span", () => {
    expect(
      vjLoopSpanOf({
        mediaKind: "gif",
        durationMs: null,
        loopInMs: null,
        loopOutMs: null,
      }),
    ).toBeNull();
    expect(
      vjLoopSpanOf({
        mediaKind: "video",
        durationMs: null,
        loopInMs: null,
        loopOutMs: null,
      }),
    ).toBeNull();
  });

  it("keeps the handles 250 ms apart", () => {
    expect(
      clampVjLoopSpan({ inMs: 3900, outMs: 4000 }, "in", DURATION_MS),
    ).toEqual({ inMs: 3750, outMs: 4000 });
    expect(
      clampVjLoopSpan({ inMs: 3000, outMs: 3100 }, "out", DURATION_MS),
    ).toEqual({ inMs: 3000, outMs: 3250 });
    // Dragged past the other handle, the moved one still stops 250 ms short.
    expect(
      clampVjLoopSpan({ inMs: 6000, outMs: 4000 }, "in", DURATION_MS),
    ).toEqual({ inMs: 3750, outMs: 4000 });
  });

  it("stops a handle at the clip's ends", () => {
    expect(
      clampVjLoopSpan({ inMs: -400, outMs: 5000 }, "in", DURATION_MS),
    ).toEqual({ inMs: 0, outMs: 5000 });
    expect(
      clampVjLoopSpan({ inMs: 1000, outMs: 9999 }, "out", DURATION_MS),
    ).toEqual({ inMs: 1000, outMs: DURATION_MS });
    // An end handle pulled to 0 stops one minimum length in.
    expect(clampVjLoopSpan({ inMs: 0, outMs: 0 }, "out", DURATION_MS)).toEqual({
      inMs: 0,
      outMs: 250,
    });
  });

  it("sends null for a start at 0 and an end at the duration", () => {
    expect(vjLoopPatchOf({ inMs: 0, outMs: DURATION_MS }, DURATION_MS)).toEqual(
      { loopInMs: null, loopOutMs: null },
    );
    expect(vjLoopPatchOf({ inMs: 0, outMs: 6000 }, DURATION_MS)).toEqual({
      loopInMs: null,
      loopOutMs: 6000,
    });
    expect(
      vjLoopPatchOf({ inMs: 1200, outMs: DURATION_MS }, DURATION_MS),
    ).toEqual({ loopInMs: 1200, loopOutMs: null });
  });

  it("loops back to the start in loop mode", () => {
    const span = { inMs: 1000, outMs: 3000 };
    expect(vjLoopPlayheadMs(500, span, "loop", 1)).toBe(1500);
    expect(vjLoopPlayheadMs(2500, span, "loop", 1)).toBe(1500);
  });

  it("bounces at the end in ping-pong", () => {
    const span = { inMs: 1000, outMs: 3000 };
    expect(vjLoopPlayheadMs(1500, span, "pingPong", 1)).toBe(2500);
    expect(vjLoopPlayheadMs(2500, span, "pingPong", 1)).toBe(2500);
    expect(vjLoopPlayheadMs(4000, span, "pingPong", 1)).toBe(1000);
  });

  it("speeds the playhead up at 2x", () => {
    const span = { inMs: 0, outMs: 4000 };
    expect(vjLoopPlayheadMs(1000, span, "loop", 2)).toBe(2000);
    expect(vjLoopPlayheadMs(3000, span, "pingPong", 2)).toBe(2000);
  });

  it("formats tenths of a second", () => {
    expect(formatVjLoopTime(1234)).toBe("0:01.2");
    expect(formatVjLoopTime(0)).toBe("0:00.0");
    expect(formatVjLoopTime(75_960)).toBe("1:15.9");
  });

  it("writes the tenths with the locale's decimal mark", () => {
    expect(formatVjLoopTime(1500, "en")).toBe("0:01.5");
    expect(formatVjLoopTime(1500, "pt-PT")).toBe("0:01,5");
    expect(formatVjLoopTime(75_960, "pt-PT")).toBe("1:15,9");
  });
});

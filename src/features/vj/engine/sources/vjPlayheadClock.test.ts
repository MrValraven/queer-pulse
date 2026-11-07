import { describe, expect, it } from "vitest";
import type {
  VjEffectSetting,
  VjEffectSettings,
} from "../../../../shared/contracts/vj";
import {
  advanceVjPlayhead,
  initialVjPlayhead,
  needsVjFrameRing,
  vjPlayheadEffectsOf,
  type VjPlayheadEffects,
} from "./vjPlayheadClock";

const LOOP_CLIP = { defaultSpeed: 1, loopMode: "loop" } as const;
const PING_PONG_CLIP = { defaultSpeed: 1, loopMode: "pingPong" } as const;
const BEAT_PERIOD_MS = 400;

function switchedOn(amount = 1): VjEffectSetting {
  return { isOn: true, amount, variant: null };
}

function effectsOf(
  settings: VjEffectSettings,
  clip: { defaultSpeed: 1; loopMode: "loop" | "pingPong" } = LOOP_CLIP,
): VjPlayheadEffects {
  return vjPlayheadEffectsOf(settings, 1, clip);
}

describe("vjPlayheadClock", () => {
  it("holds the position while frozen", () => {
    const effects = effectsOf({ freeze: switchedOn() });
    const playhead = initialVjPlayhead(1500);
    const window = { startMs: 0, endMs: 4000 };
    const next = advanceVjPlayhead(playhead, window, effects, 16, 3, 500);
    expect(next).toBe(playhead);
    expect(next.positionMs).toBe(1500);
    const later = advanceVjPlayhead(next, window, effects, 1000, 5, 500);
    expect(later.positionMs).toBe(1500);
  });

  it("lets freeze win over stutter and stutter over reverse", () => {
    expect(
      effectsOf({
        freeze: switchedOn(),
        stutter: switchedOn(0.5),
        reverse: switchedOn(),
      }).mode,
    ).toBe("frozen");
    expect(
      effectsOf({ stutter: switchedOn(0.5), reverse: switchedOn() }).mode,
    ).toBe("stutter");
    expect(effectsOf({ reverse: switchedOn() }).mode).toBe("reverse");
    expect(effectsOf({ pingPong: switchedOn() }).mode).toBe("pingPong");
    expect(
      effectsOf({ reverse: { isOn: false, amount: 1, variant: null } }).mode,
    ).toBe("forward");
  });

  it("uses the clip's ping-pong loop mode when no playhead effect is on", () => {
    expect(effectsOf({}, PING_PONG_CLIP).mode).toBe("pingPong");
    expect(effectsOf({}, LOOP_CLIP).mode).toBe("forward");
    expect(effectsOf({ reverse: switchedOn() }, PING_PONG_CLIP).mode).toBe(
      "reverse",
    );
    expect(effectsOf({ freeze: switchedOn() }, PING_PONG_CLIP).mode).toBe(
      "frozen",
    );
  });

  it("repeats a slice of 1 - 0.75 x amount beats while stuttering", () => {
    const effects = effectsOf({ stutter: switchedOn(1) });
    expect(effects.stutterSliceBeats).toBeCloseTo(0.25);
    expect(effectsOf({ stutter: switchedOn(0) }).stutterSliceBeats).toBe(1);
    expect(
      effectsOf({ stutter: switchedOn(0.5) }).stutterSliceBeats,
    ).toBeCloseTo(0.625);
    const window = { startMs: 0, endMs: 10_000 };
    // A slice of 0.25 beats at 400 ms a beat covers 100 ms of media.
    const sliceStart = advanceVjPlayhead(
      initialVjPlayhead(1000),
      window,
      effects,
      16,
      0,
      BEAT_PERIOD_MS,
    );
    expect(sliceStart.positionMs).toBe(1000);
    expect(sliceStart.stutterAnchorMs).toBe(1000);
    expect(sliceStart.stutterSliceIndex).toBe(0);
    const insideSlice = advanceVjPlayhead(
      sliceStart,
      window,
      effects,
      50,
      0.125,
      BEAT_PERIOD_MS,
    );
    expect(insideSlice.positionMs).toBeCloseTo(1050);
    // The next slice starts back at the anchor: the slice repeats.
    const repeatedSlice = advanceVjPlayhead(
      insideSlice,
      window,
      effects,
      70,
      0.3,
      BEAT_PERIOD_MS,
    );
    expect(repeatedSlice.stutterSliceIndex).toBe(1);
    expect(repeatedSlice.stutterAnchorMs).toBe(1000);
    expect(repeatedSlice.positionMs).toBeCloseTo(1020);
    // After the repeat the anchor moves on to the end of the slice.
    const nextSlice = advanceVjPlayhead(
      repeatedSlice,
      window,
      effects,
      100,
      0.55,
      BEAT_PERIOD_MS,
    );
    expect(nextSlice.stutterSliceIndex).toBe(2);
    expect(nextSlice.stutterAnchorMs).toBeCloseTo(1100);
    expect(nextSlice.positionMs).toBeCloseTo(1120);
    expect(needsVjFrameRing(effects)).toBe(true);
  });

  it("wraps a reverse playhead from the window start to its end", () => {
    const effects = effectsOf({ reverse: switchedOn() });
    const window = { startMs: 1000, endMs: 2000 };
    const next = advanceVjPlayhead(
      initialVjPlayhead(1050),
      window,
      effects,
      100,
      0,
      BEAT_PERIOD_MS,
    );
    expect(next.positionMs).toBe(1950);
    expect(next.direction).toBe(-1);
    const forward = advanceVjPlayhead(
      initialVjPlayhead(1950),
      window,
      effectsOf({}),
      100,
      0,
      BEAT_PERIOD_MS,
    );
    expect(forward.positionMs).toBe(1050);
    expect(forward.direction).toBe(1);
  });

  it("turns at both ends in ping-pong", () => {
    const effects = effectsOf({ pingPong: switchedOn() });
    const window = { startMs: 0, endMs: 1000 };
    const atEnd = advanceVjPlayhead(
      initialVjPlayhead(950),
      window,
      effects,
      100,
      0,
      BEAT_PERIOD_MS,
    );
    expect(atEnd.positionMs).toBe(950);
    expect(atEnd.direction).toBe(-1);
    const backward = advanceVjPlayhead(
      atEnd,
      window,
      effects,
      400,
      0,
      BEAT_PERIOD_MS,
    );
    expect(backward.positionMs).toBe(550);
    expect(backward.direction).toBe(-1);
    const atStart = advanceVjPlayhead(
      { ...backward, positionMs: 50 },
      window,
      effects,
      100,
      0,
      BEAT_PERIOD_MS,
    );
    expect(atStart.positionMs).toBe(50);
    expect(atStart.direction).toBe(1);
  });

  it("multiplies stage speed by the clip default speed and clamps it", () => {
    expect(
      vjPlayheadEffectsOf({}, 1.5, { defaultSpeed: 2, loopMode: "loop" }).rate,
    ).toBe(3);
    expect(
      vjPlayheadEffectsOf({}, 4, { defaultSpeed: 4, loopMode: "loop" }).rate,
    ).toBe(4);
    expect(
      vjPlayheadEffectsOf({}, 0.25, { defaultSpeed: 0.25, loopMode: "loop" })
        .rate,
    ).toBe(0.25);
    const fastEffects = vjPlayheadEffectsOf({}, 1.5, {
      defaultSpeed: 2,
      loopMode: "loop",
    });
    const next = advanceVjPlayhead(
      initialVjPlayhead(0),
      { startMs: 0, endMs: 10_000 },
      fastEffects,
      100,
      0,
      BEAT_PERIOD_MS,
    );
    expect(next.positionMs).toBe(300);
  });

  it("needs the frame ring only for reverse, ping-pong and stutter", () => {
    expect(needsVjFrameRing(effectsOf({ reverse: switchedOn() }))).toBe(true);
    expect(needsVjFrameRing(effectsOf({ pingPong: switchedOn() }))).toBe(true);
    expect(needsVjFrameRing(effectsOf({}, PING_PONG_CLIP))).toBe(true);
    expect(needsVjFrameRing(effectsOf({ stutter: switchedOn(0.5) }))).toBe(
      true,
    );
    expect(needsVjFrameRing(effectsOf({}))).toBe(false);
    expect(needsVjFrameRing(effectsOf({ freeze: switchedOn() }))).toBe(false);
  });
});

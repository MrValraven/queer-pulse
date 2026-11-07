import { describe, expect, it } from "vitest";
import { VJ_PAD_LATCH_MAX_MS } from "../../vj.constants";
import {
  VJ_PAD_TUNE_HOLD_MS,
  vjPadPressCancel,
  vjPadPressDown,
  vjPadPressUp,
  vjShouldOpenTuner,
  type VjPadPress,
} from "./vjPadPress";

const offPress: VjPadPress = { wasOn: false, startedAt: 1_000 };
const latchedPress: VjPadPress = { wasOn: true, startedAt: 1_000 };

describe("vjPadPress", () => {
  it("a short press on an off pad latches it", () => {
    expect(vjPadPressDown(false)).toBe("on");
    expect(vjPadPressUp(offPress, 1_120, false)).toEqual({
      send: null,
      result: "latched",
    });
  });

  it("a long press on an off pad is momentary and sends off on release", () => {
    expect(vjPadPressUp(offPress, 1_900, false)).toEqual({
      send: "off",
      result: "momentaryEnded",
    });
  });

  it("a short press on a latched pad unlatches it", () => {
    expect(vjPadPressDown(true)).toBeNull();
    expect(vjPadPressUp(latchedPress, 1_150, false)).toEqual({
      send: "off",
      result: "unlatched",
    });
  });

  it("holding a latched pad still for 500 ms opens the tuner and sends nothing on release", () => {
    const tuneAt = latchedPress.startedAt + VJ_PAD_TUNE_HOLD_MS;
    expect(vjShouldOpenTuner(latchedPress, tuneAt - 1, false)).toBe(false);
    expect(vjShouldOpenTuner(latchedPress, tuneAt, false)).toBe(true);
    expect(vjPadPressUp(latchedPress, tuneAt + 300, true)).toEqual({
      send: null,
      result: "tuned",
    });
  });

  it("moving clears the tune hold", () => {
    const tuneAt = latchedPress.startedAt + VJ_PAD_TUNE_HOLD_MS;
    expect(vjShouldOpenTuner(latchedPress, tuneAt + 200, true)).toBe(false);
    expect(vjShouldOpenTuner(offPress, tuneAt + 200, false)).toBe(false);
  });

  it("a cancel undoes the on it sent", () => {
    expect(vjPadPressCancel(offPress, true)).toEqual({
      send: "off",
      result: "cancelled",
    });
    expect(vjPadPressCancel(offPress, false)).toEqual({
      send: null,
      result: "cancelled",
    });
    expect(vjPadPressCancel(latchedPress, false)).toEqual({
      send: null,
      result: "cancelled",
    });
  });

  it("250 ms exactly counts as a hold", () => {
    const releasedAt = offPress.startedAt + VJ_PAD_LATCH_MAX_MS;
    expect(VJ_PAD_LATCH_MAX_MS).toBe(250);
    expect(vjPadPressUp(offPress, releasedAt, false)).toEqual({
      send: "off",
      result: "momentaryEnded",
    });
    expect(vjPadPressUp(offPress, releasedAt - 1, false).result).toBe(
      "latched",
    );
  });
});

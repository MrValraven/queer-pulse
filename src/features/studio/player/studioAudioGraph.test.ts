import { describe, expect, it, vi } from "vitest";
import {
  equalPowerCurve,
  equalPowerParam,
  rampParam,
} from "./studioAudioGraph";

/** Like a browser cancelling a running curve: the cancel restores the value
 *  from before the automation (1 here). */
class FakeParam {
  value: number;
  constructor(value: number) {
    this.value = value;
  }
  cancelScheduledValues = vi.fn(() => {
    this.value = 1;
  });
  setValueAtTime = vi.fn((level: number) => {
    this.value = level;
  });
  linearRampToValueAtTime = vi.fn((level: number) => {
    this.value = level;
  });
  setValueCurveAtTime = vi.fn((curve: Float32Array) => {
    this.value = curve[curve.length - 1] ?? this.value;
  });
}

/** Like Chrome and Safari: the hold keeps the level the curve reached. */
class HoldingFakeParam extends FakeParam {
  cancelAndHoldAtTime = vi.fn();
}

const createFakeParam = (value: number) => new FakeParam(value);
const contextAt = (currentTime: number) =>
  ({ currentTime }) as unknown as BaseAudioContext;
const asParam = (param: FakeParam) => param as unknown as AudioParam;

describe("equalPowerCurve", () => {
  it("fades in from exactly 0 to exactly 1", () => {
    const curve = equalPowerCurve("in");
    expect(curve[0]).toBe(0);
    expect(curve[curve.length - 1]).toBe(1);
    expect(curve).toHaveLength(129);
  });

  it("fades out from the given level to exactly 0", () => {
    const curve = equalPowerCurve("out", 0.6, 16);
    expect(curve).toHaveLength(17);
    expect(curve[0]).toBeCloseTo(0.6, 6);
    expect(curve[16]).toBe(0);
  });

  it("keeps a pair at constant power and rises steadily", () => {
    const incoming = equalPowerCurve("in");
    const outgoing = equalPowerCurve("out");
    incoming.forEach((incomingLevel, index) => {
      const outgoingLevel = outgoing[index] ?? Number.NaN;
      expect(incomingLevel ** 2 + outgoingLevel ** 2).toBeCloseTo(1, 5);
      if (index > 0)
        expect(incomingLevel).toBeGreaterThan(incoming[index - 1] ?? 1);
    });
    expect(incoming[64]).toBeCloseTo(Math.SQRT1_2, 5);
  });
});

describe("rampParam", () => {
  it("ramps from the level read before the cancel", () => {
    const param = createFakeParam(0.4);
    rampParam(asParam(param), contextAt(2), { to: 0, seconds: 0.03 });
    expect(param.cancelScheduledValues).toHaveBeenCalledWith(2);
    expect(param.setValueAtTime).toHaveBeenCalledWith(0.4, 2);
    expect(param.linearRampToValueAtTime).toHaveBeenCalledWith(0, 2.03);
  });

  it("clears the whole timeline when a kept curve refuses the new events", () => {
    const param = createFakeParam(0.4);
    param.setValueAtTime.mockImplementationOnce(() => {
      throw new DOMException("inside a curve", "NotSupportedError");
    });
    rampParam(asParam(param), contextAt(2), { to: 1, seconds: 0.05 });
    expect(param.cancelScheduledValues.mock.calls).toEqual([[2], [0]]);
    expect(param.setValueAtTime).toHaveBeenLastCalledWith(0.4, 2);
    expect(param.linearRampToValueAtTime).toHaveBeenLastCalledWith(1, 2.05);
  });

  it("holds a running curve at its level where the browser can", () => {
    const param = new HoldingFakeParam(0.4);
    rampParam(asParam(param), contextAt(2), { to: 0, seconds: 0.03 });
    expect(param.cancelAndHoldAtTime).toHaveBeenCalledWith(2);
    expect(param.cancelScheduledValues).not.toHaveBeenCalled();
    expect(param.setValueAtTime).toHaveBeenCalledWith(0.4, 2);
    expect(param.linearRampToValueAtTime).toHaveBeenCalledWith(0, 2.03);
  });

  it("cancels from now where the browser has no hold", () => {
    const param = createFakeParam(0.4);
    expect("cancelAndHoldAtTime" in param).toBe(false);
    rampParam(asParam(param), contextAt(2), { to: 0, seconds: 0.03 });
    expect(param.cancelScheduledValues.mock.calls).toEqual([[2]]);
  });

  it("still clears the whole timeline after a hold when the events are refused", () => {
    const param = new HoldingFakeParam(0.4);
    param.setValueAtTime.mockImplementationOnce(() => {
      throw new DOMException("inside a curve", "NotSupportedError");
    });
    rampParam(asParam(param), contextAt(2), { to: 1, seconds: 0.05 });
    expect(param.cancelAndHoldAtTime.mock.calls).toEqual([[2]]);
    expect(param.cancelScheduledValues.mock.calls).toEqual([[0]]);
    expect(param.setValueAtTime).toHaveBeenLastCalledWith(0.4, 2);
  });
});

describe("equalPowerParam", () => {
  it("fades out along a curve from the level read before the cancel", () => {
    const param = createFakeParam(0.5);
    equalPowerParam(asParam(param), contextAt(3), {
      direction: "out",
      seconds: 4,
    });
    const curve = param.setValueCurveAtTime.mock.lastCall?.[0];
    expect(param.setValueCurveAtTime).toHaveBeenCalledWith(curve, 3, 4);
    expect(curve?.[0]).toBeCloseTo(0.5, 6);
    expect(curve?.[curve.length - 1]).toBe(0);
  });

  it("sets the end level at once for zero seconds", () => {
    const param = createFakeParam(0.5);
    equalPowerParam(asParam(param), contextAt(3), {
      direction: "in",
      seconds: 0,
    });
    expect(param.setValueCurveAtTime).not.toHaveBeenCalled();
    expect(param.setValueAtTime).toHaveBeenLastCalledWith(1, 3);
  });

  it("falls back to a linear fade when value curves are refused", () => {
    const param = createFakeParam(0.5);
    param.setValueCurveAtTime.mockImplementation(() => {
      throw new DOMException("curves refused", "NotSupportedError");
    });
    equalPowerParam(asParam(param), contextAt(3), {
      direction: "in",
      seconds: 4,
    });
    expect(param.setValueAtTime).toHaveBeenLastCalledWith(0, 3);
    expect(param.linearRampToValueAtTime).toHaveBeenLastCalledWith(1, 7);
  });
});

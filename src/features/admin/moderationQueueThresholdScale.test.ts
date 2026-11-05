import { describe, expect, it } from "vitest";
import type { ModerationQueueThresholdBandDTO } from "./api/moderationHealth.api";
import {
  readThresholdMeter,
  thresholdMeterLevel,
} from "./moderationQueueThresholdScale";

/**
 * The depth band the fixtures ship with. The scale runs to critical * 1.25,
 * so 25 * 1.25 = 31.25: the warning tick sits at 10 / 31.25 = 0.32 and the
 * critical tick at 25 / 31.25 = 0.8.
 */
const depthBand: ModerationQueueThresholdBandDTO = {
  warning: 10,
  critical: 25,
};

/** The oldest-item band in hours. Its scale runs to 72 * 1.25 = 90. */
const oldestHoursBand: ModerationQueueThresholdBandDTO = {
  warning: 24,
  critical: 72,
};

describe("readThresholdMeter", () => {
  it("draws an empty track for a value of zero", () => {
    const reading = readThresholdMeter(0, depthBand);
    expect(reading.fillFraction).toBe(0);
    expect(reading.level).toBe("calm");
  });

  it("places the ticks at warning and critical over the scale maximum", () => {
    const reading = readThresholdMeter(0, depthBand);
    expect(reading.warningPosition).toBeCloseTo(0.32);
    expect(reading.criticalPosition).toBeCloseTo(0.8);
  });

  it("draws the minimum visible sliver for a value just above zero", () => {
    const reading = readThresholdMeter(0.1, depthBand);
    expect(reading.fillFraction).toBe(0.03);
    expect(reading.level).toBe("calm");
  });

  it("fills to the warning tick for a value at the warning level", () => {
    const reading = readThresholdMeter(10, depthBand);
    expect(reading.fillFraction).toBeCloseTo(0.32);
    expect(reading.fillFraction).toBeCloseTo(reading.warningPosition);
    expect(reading.level).toBe("warning");
  });

  it("fills between the ticks for a value between warning and critical", () => {
    const reading = readThresholdMeter(15, depthBand);
    expect(reading.fillFraction).toBeCloseTo(0.48);
    expect(reading.fillFraction).toBeGreaterThan(reading.warningPosition);
    expect(reading.fillFraction).toBeLessThan(reading.criticalPosition);
    expect(reading.level).toBe("warning");
  });

  it("fills to the critical tick and leaves headroom for a value exactly at critical", () => {
    const reading = readThresholdMeter(25, depthBand);
    expect(reading.fillFraction).toBeCloseTo(0.8);
    expect(reading.fillFraction).toBeCloseTo(reading.criticalPosition);
    expect(reading.fillFraction).toBeLessThan(1);
    expect(reading.level).toBe("critical");
  });

  it("overflows the critical tick for a value past critical", () => {
    const reading = readThresholdMeter(30, depthBand);
    expect(reading.fillFraction).toBeCloseTo(0.96);
    expect(reading.fillFraction).toBeGreaterThan(reading.criticalPosition);
    expect(reading.level).toBe("critical");
  });

  it("fills the whole track at exactly 1.25 times critical", () => {
    expect(readThresholdMeter(31.25, depthBand).fillFraction).toBe(1);
  });

  it("clamps the fill to a full track for a value past 1.25 times critical", () => {
    const reading = readThresholdMeter(400, depthBand);
    expect(reading.fillFraction).toBe(1);
    expect(reading.level).toBe("critical");
  });

  it("puts both ticks at the same position when warning equals critical", () => {
    const flatBand: ModerationQueueThresholdBandDTO = {
      warning: 5,
      critical: 5,
    };
    const reading = readThresholdMeter(5, flatBand);
    expect(reading.warningPosition).toBeCloseTo(0.8);
    expect(reading.criticalPosition).toBeCloseTo(0.8);
    expect(reading.warningPosition).toBe(reading.criticalPosition);
    expect(reading.level).toBe("critical");
    expect(readThresholdMeter(4, flatBand).level).toBe("calm");
  });

  describe("with a critical level of zero", () => {
    const zeroBand: ModerationQueueThresholdBandDTO = {
      warning: 0,
      critical: 0,
    };

    it("draws an empty track with both ticks at the start for a value of zero", () => {
      const reading = readThresholdMeter(0, zeroBand);
      expect(reading.fillFraction).toBe(0);
      expect(reading.warningPosition).toBe(0);
      expect(reading.criticalPosition).toBe(0);
      // A zero band trips at zero under the "at or above" rule, so an empty
      // reading on a zero band reads critical.
      expect(reading.level).toBe("critical");
    });

    it("draws a full track for any value above zero", () => {
      const reading = readThresholdMeter(3, zeroBand);
      expect(reading.fillFraction).toBe(1);
      expect(reading.level).toBe("critical");
    });

    it("returns finite numbers for every field", () => {
      for (const value of [0, 0.5, 3]) {
        const reading = readThresholdMeter(value, zeroBand);
        expect(Number.isFinite(reading.fillFraction)).toBe(true);
        expect(Number.isFinite(reading.warningPosition)).toBe(true);
        expect(Number.isFinite(reading.criticalPosition)).toBe(true);
      }
    });
  });

  describe("with fractional hours", () => {
    it("fills in proportion to the hours over the scale maximum", () => {
      const reading = readThresholdMeter(3.5, oldestHoursBand);
      expect(reading.fillFraction).toBeCloseTo(3.5 / 90);
      expect(reading.warningPosition).toBeCloseTo(24 / 90);
      expect(reading.criticalPosition).toBeCloseTo(0.8);
      expect(reading.level).toBe("calm");
    });

    it("raises a small fraction of an hour to the minimum visible sliver", () => {
      expect(readThresholdMeter(0.5, oldestHoursBand).fillFraction).toBe(0.03);
    });

    it("moves to the next level once the hours cross a threshold", () => {
      expect(readThresholdMeter(23.9, oldestHoursBand).level).toBe("calm");
      expect(readThresholdMeter(24.5, oldestHoursBand).level).toBe("warning");
      expect(readThresholdMeter(71.9, oldestHoursBand).level).toBe("warning");
      expect(readThresholdMeter(72.25, oldestHoursBand).level).toBe("critical");
    });
  });
});

describe("thresholdMeterLevel", () => {
  it("reads calm below the warning level", () => {
    expect(thresholdMeterLevel(9, depthBand)).toBe("calm");
    expect(thresholdMeterLevel(0, depthBand)).toBe("calm");
  });

  it("reads warning at the warning level", () => {
    expect(thresholdMeterLevel(10, depthBand)).toBe("warning");
  });

  it("reads warning just under the critical level", () => {
    expect(thresholdMeterLevel(24, depthBand)).toBe("warning");
  });

  it("reads critical at the critical level", () => {
    expect(thresholdMeterLevel(25, depthBand)).toBe("critical");
  });

  it("reads critical above the critical level", () => {
    expect(thresholdMeterLevel(26, depthBand)).toBe("critical");
  });
});

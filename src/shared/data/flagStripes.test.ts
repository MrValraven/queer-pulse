import { describe, expect, it } from "vitest";
import {
  CARD_BACKGROUND_PRESETS,
  backgroundPresetValue,
} from "../../features/cards/cardBackgrounds.data";
import {
  STRIPED_FLAG_IDS,
  flagBandSpans,
  flagStripesOf,
  stripeGradient,
} from "./flagStripes.data";

describe("stripeGradient", () => {
  it("reproduces the equal-band stops the card presets shipped with", () => {
    expect(stripeGradient(flagStripesOf("rainbow"))).toBe(
      "linear-gradient(to bottom, #e40303 0% 16.666666666666668%, #ff8c00 16.666666666666668% 33.333333333333336%, #ffed00 33.333333333333336% 50%, #008026 50% 66.66666666666667%, #24408e 66.66666666666667% 83.33333333333334%, #732982 83.33333333333334% 100%)",
    );
    expect(stripeGradient(flagStripesOf("transgender"))).toBe(
      "linear-gradient(to bottom, #5bcefa 0% 20%, #f5a9b8 20% 40%, #ffffff 40% 60%, #f5a9b8 60% 80%, #5bcefa 80% 100%)",
    );
    expect(stripeGradient(flagStripesOf("agender"))).toBe(
      "linear-gradient(to bottom, #000000 0% 14.285714285714286%, #bcc4c7 14.285714285714286% 28.571428571428573%, #ffffff 28.571428571428573% 42.85714285714286%, #b7f684 42.85714285714286% 57.142857142857146%, #ffffff 57.142857142857146% 71.42857142857143%, #bcc4c7 71.42857142857143% 85.71428571428572%, #000000 85.71428571428572% 100%)",
    );
  });

  it("reproduces the weighted stops for the bisexual flag", () => {
    expect(stripeGradient(flagStripesOf("bisexual"))).toBe(
      "linear-gradient(to bottom, #d60270 0% 40%, #9b4f96 40% 60%, #0038a8 60% 100%)",
    );
  });
});

describe("the card preset catalogue", () => {
  it("still exposes every id the backend validates against", () => {
    expect(CARD_BACKGROUND_PRESETS.map((preset) => preset.id)).toEqual([
      "rainbow",
      "progress",
      "transgender",
      "bisexual",
      "lesbian",
      "pansexual",
      "asexual",
      "aromantic",
      "nonbinary",
      "genderfluid",
      "genderqueer",
      "agender",
      "intersex",
    ]);
  });

  it("gives every preset a label key and a non-empty background", () => {
    for (const preset of CARD_BACKGROUND_PRESETS) {
      expect(preset.labelKey).toBe(`cards:flag.${preset.id}`);
      expect(backgroundPresetValue(preset.id)).toBe(preset.background);
      expect(preset.background.length).toBeGreaterThan(0);
    }
  });

  it("builds the striped presets from the registry", () => {
    for (const flagId of STRIPED_FLAG_IDS) {
      expect(backgroundPresetValue(flagId)).toBe(
        stripeGradient(flagStripesOf(flagId)),
      );
    }
  });
});

describe("flagBandSpans", () => {
  it("covers the full height with contiguous spans", () => {
    for (const flagId of STRIPED_FLAG_IDS) {
      const spans = flagBandSpans(flagId);
      expect(spans).toHaveLength(flagStripesOf(flagId).length);
      const [firstSpan] = spans;
      const lastSpan = spans[spans.length - 1];
      if (!firstSpan || !lastSpan) {
        throw new Error(`flagBandSpans(${flagId}) returned no spans`);
      }
      expect(firstSpan.start).toBe(0);
      expect(lastSpan.end).toBeCloseTo(1, 10);
      let previousSpan = firstSpan;
      for (const span of spans.slice(1)) {
        expect(span.start).toBeCloseTo(previousSpan.end, 10);
        previousSpan = span;
      }
    }
  });

  it("throws on an unknown flag", () => {
    expect(() => flagBandSpans("not-a-flag")).toThrow("Unknown flag id");
  });
});

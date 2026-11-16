import { describe, expect, it } from "vitest";
import { clampDraftStep, draftStepLineArgs } from "./draftProgress";

describe("clampDraftStep", () => {
  it("reads a negative step as the first step", () => {
    expect(clampDraftStep(-1)).toBe(0);
  });

  it("rounds a fractional step down", () => {
    expect(clampDraftStep(2.7)).toBe(2);
  });

  it("lands a step past the review on the last step", () => {
    expect(clampDraftStep(9)).toBe(5);
  });

  it("reads NaN as the first step", () => {
    expect(clampDraftStep(Number.NaN)).toBe(0);
  });

  it("keeps a step inside the range as it is", () => {
    expect(clampDraftStep(4)).toBe(4);
  });
});

describe("draftStepLineArgs", () => {
  it("numbers the step from one and names its pill", () => {
    expect(draftStepLineArgs(2)).toEqual({
      number: 3,
      total: 6,
      labelKey: "marketing:listBusiness.wizard.pill.story",
    });
  });

  it("names the review pill for a step past the end", () => {
    expect(draftStepLineArgs(12)).toEqual({
      number: 6,
      total: 6,
      labelKey: "marketing:listBusiness.wizard.pill.review",
    });
  });
});

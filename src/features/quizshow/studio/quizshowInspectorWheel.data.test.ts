import { describe, expect, it } from "vitest";
import { QUIZSHOW_LIMITS } from "../../../shared/contracts/quizshow";
import {
  WHEEL_SLICE_COUNT_CHOICES,
  choiceOfSliceCount,
  sliceCountOfChoice,
} from "./quizshowInspectorWheel.data";

describe("quizshowInspectorWheel.data", () => {
  it("lists Auto first, then 2 to 8", () => {
    expect(WHEEL_SLICE_COUNT_CHOICES).toEqual([
      "auto",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
    ]);
  });

  it("keeps its numeric entries equal to wheelSlicesMin..wheelSlicesMax", () => {
    const numericChoices = WHEEL_SLICE_COUNT_CHOICES.filter(
      (choice) => choice !== "auto",
    ).map(Number);
    const limitCounts = Array.from(
      {
        length:
          QUIZSHOW_LIMITS.wheelSlicesMax - QUIZSHOW_LIMITS.wheelSlicesMin + 1,
      },
      (_, offset) => QUIZSHOW_LIMITS.wheelSlicesMin + offset,
    );
    expect(numericChoices).toEqual(limitCounts);
  });

  it("reads Auto as no stored count", () => {
    expect(sliceCountOfChoice("auto")).toBeNull();
  });

  it("reads a number choice as that count", () => {
    expect(sliceCountOfChoice("5")).toBe(5);
    expect(sliceCountOfChoice("2")).toBe(2);
    expect(sliceCountOfChoice("8")).toBe(8);
  });

  it("reads a null count as Auto", () => {
    expect(choiceOfSliceCount(null)).toBe("auto");
  });

  it("reads a stored count as its choice", () => {
    expect(choiceOfSliceCount(5)).toBe("5");
    expect(choiceOfSliceCount(8)).toBe("8");
  });

  it("reads a count outside 2 to 8 as Auto", () => {
    expect(choiceOfSliceCount(1)).toBe("auto");
    expect(choiceOfSliceCount(9)).toBe("auto");
  });

  it("round trips every choice", () => {
    for (const choice of WHEEL_SLICE_COUNT_CHOICES) {
      expect(choiceOfSliceCount(sliceCountOfChoice(choice))).toBe(choice);
    }
  });
});

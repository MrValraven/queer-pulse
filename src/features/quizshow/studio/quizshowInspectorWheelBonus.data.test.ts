import { describe, expect, it } from "vitest";
import {
  WHEEL_BONUS_CHOICES,
  bonusOfChoice,
} from "./quizshowInspectorWheelBonus.data";

describe("quizshowInspectorWheelBonus.data", () => {
  it("maps the choices to 0, 250, 500 and 1000 in order", () => {
    expect(WHEEL_BONUS_CHOICES.map(bonusOfChoice)).toEqual([0, 250, 500, 1000]);
  });

  it("reads a choice id as its number", () => {
    expect(bonusOfChoice("500")).toBe(500);
    expect(bonusOfChoice("0")).toBe(0);
  });
});

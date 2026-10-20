import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { QUIZSHOW_TEAM_COLOR_KEYS } from "../../shared/contracts/quizshow";
import {
  QUIZSHOW_ANSWER_SWATCH_KEYS,
  QUIZSHOW_SWATCHES,
  answerSwatchFor,
  trueFalseSwatchFor,
} from "./quizshowSwatches";

const colors = readFileSync("src/styles/tokens/colors.css", "utf8");
const [lightBlock = "", darkBlock = ""] = colors.split('[data-theme="dark"] {');

describe("quizshow swatches", () => {
  it("gives every team key its own shape icon", () => {
    const icons = QUIZSHOW_TEAM_COLOR_KEYS.map(
      (colorKey) => QUIZSHOW_SWATCHES[colorKey].icon,
    );
    expect(new Set(icons).size).toBe(8);
  });
  it("defines a fill and an ink token for every key in both themes", () => {
    for (const colorKey of QUIZSHOW_TEAM_COLOR_KEYS) {
      expect(lightBlock).toContain(`--quizshow-${colorKey}:`);
      expect(lightBlock).toContain(`--quizshow-${colorKey}-ink:`);
      expect(darkBlock).toContain(`--quizshow-${colorKey}:`);
      expect(darkBlock).toContain(`--quizshow-${colorKey}-ink:`);
    }
  });
  it("maps answer slots and true or false to distinct shapes", () => {
    expect(new Set(QUIZSHOW_ANSWER_SWATCH_KEYS).size).toBe(4);
    expect(answerSwatchFor(0).colorKey).toBe("triangle");
    expect(trueFalseSwatchFor(true).colorKey).toBe("square");
    expect(trueFalseSwatchFor(false).colorKey).toBe("triangle");
  });
});

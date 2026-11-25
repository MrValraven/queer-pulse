import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  QUIZSHOW_TEAM_COLOR_KEYS,
  QUIZSHOW_TEAM_SHAPES,
} from "../../shared/contracts/quizshow";
import type { TranslateOptions } from "../../shared/i18n/types";
import {
  QUIZSHOW_ANSWER_SWATCH_KEYS,
  QUIZSHOW_SWATCHES,
  answerSwatchFor,
  shapeOfColorKey,
  teamShapeLabel,
  tierOfColorKey,
  trueFalseSwatchFor,
} from "./quizshowSwatches";

const colors = readFileSync("src/styles/tokens/colors.css", "utf8");
const [lightBlock = "", darkBlock = ""] = colors.split('[data-theme="dark"] {');

/** A stand-in translator: shape keys read "Circle"-style names, the tier key joins its tokens. */
function fakeTranslate(key: string, options?: TranslateOptions): string {
  if (key === "quizshow:teams.tierLabel") {
    return `${String(options?.shape)} ${String(options?.tier)}`;
  }
  const shapeName = key.replace("quizshow:teams.shape.", "");
  return shapeName.charAt(0).toUpperCase() + shapeName.slice(1);
}

describe("quizshow swatches", () => {
  it("holds one swatch for each of the 24 team keys", () => {
    expect(Object.keys(QUIZSHOW_SWATCHES)).toHaveLength(24);
    for (const colorKey of QUIZSHOW_TEAM_COLOR_KEYS) {
      expect(QUIZSHOW_SWATCHES[colorKey].colorKey).toBe(colorKey);
    }
  });
  it("gives every shape its own icon, shared by its three tiers", () => {
    const icons = QUIZSHOW_TEAM_COLOR_KEYS.map(
      (colorKey) => QUIZSHOW_SWATCHES[colorKey].icon,
    );
    expect(new Set(icons).size).toBe(8);
    expect(QUIZSHOW_SWATCHES.star_3.icon).toBe(QUIZSHOW_SWATCHES.star.icon);
  });
  it("maps each key to its shape and tier", () => {
    expect(shapeOfColorKey("circle")).toBe("circle");
    expect(shapeOfColorKey("circle_2")).toBe("circle");
    expect(shapeOfColorKey("moon_3")).toBe("moon");
    expect(tierOfColorKey("circle")).toBe(1);
    expect(tierOfColorKey("hexagon_2")).toBe(2);
    expect(tierOfColorKey("heart_3")).toBe(3);
    const tierCounts = [1, 2, 3].map(
      (tier) =>
        QUIZSHOW_TEAM_COLOR_KEYS.filter(
          (colorKey) => QUIZSHOW_SWATCHES[colorKey].tier === tier,
        ).length,
    );
    expect(tierCounts).toEqual([8, 8, 8]);
  });
  it("reads the colour tokens from the shape, so tiers share them", () => {
    expect(QUIZSHOW_SWATCHES.diamond_2.fillVar).toBe("var(--quizshow-diamond)");
    expect(QUIZSHOW_SWATCHES.diamond_3.inkVar).toBe(
      "var(--quizshow-diamond-ink)",
    );
  });
  it("names tier 1 by its shape and the other tiers with their numeral", () => {
    expect(teamShapeLabel("circle", fakeTranslate)).toBe("Circle");
    expect(teamShapeLabel("circle_2", fakeTranslate)).toBe("Circle 2");
    expect(teamShapeLabel("moon_3", fakeTranslate)).toBe("Moon 3");
  });
  it("defines a fill and an ink token for every shape in both themes", () => {
    for (const shape of QUIZSHOW_TEAM_SHAPES) {
      expect(lightBlock).toContain(`--quizshow-${shape}:`);
      expect(lightBlock).toContain(`--quizshow-${shape}-ink:`);
      expect(darkBlock).toContain(`--quizshow-${shape}:`);
      expect(darkBlock).toContain(`--quizshow-${shape}-ink:`);
    }
  });
  it("maps answer slots and true or false to distinct shapes", () => {
    expect(new Set(QUIZSHOW_ANSWER_SWATCH_KEYS).size).toBe(4);
    expect(answerSwatchFor(0).colorKey).toBe("triangle");
    expect(trueFalseSwatchFor(true).colorKey).toBe("square");
    expect(trueFalseSwatchFor(false).colorKey).toBe("triangle");
  });
});

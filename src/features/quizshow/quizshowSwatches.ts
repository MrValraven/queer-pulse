import type { IconType } from "react-icons";
import {
  LuCircle,
  LuDiamond,
  LuHeart,
  LuHexagon,
  LuMoon,
  LuSquare,
  LuStar,
  LuTriangle,
} from "react-icons/lu";
import {
  QUIZSHOW_TEAM_COLOR_KEYS,
  type QuizshowTeamColorKey,
} from "../../shared/contracts/quizshow";

export interface QuizshowSwatch {
  colorKey: QuizshowTeamColorKey;
  icon: IconType;
  fillVar: string;
  inkVar: string;
  labelKey: string;
}

const SWATCH_ICONS: Record<QuizshowTeamColorKey, IconType> = {
  circle: LuCircle,
  triangle: LuTriangle,
  square: LuSquare,
  diamond: LuDiamond,
  star: LuStar,
  hexagon: LuHexagon,
  heart: LuHeart,
  moon: LuMoon,
};

function buildSwatch(colorKey: QuizshowTeamColorKey): QuizshowSwatch {
  return {
    colorKey,
    icon: SWATCH_ICONS[colorKey],
    fillVar: `var(--quizshow-${colorKey})`,
    inkVar: `var(--quizshow-${colorKey}-ink)`,
    labelKey: `quizshow:teams.shape.${colorKey}`,
  };
}

export const QUIZSHOW_SWATCHES = Object.fromEntries(
  QUIZSHOW_TEAM_COLOR_KEYS.map((colorKey) => [colorKey, buildSwatch(colorKey)]),
) as Record<QuizshowTeamColorKey, QuizshowSwatch>;

/** Multiple choice option index to swatch: 0 triangle, 1 diamond, 2 circle, 3 square. */
export const QUIZSHOW_ANSWER_SWATCH_KEYS = [
  "triangle",
  "diamond",
  "circle",
  "square",
] as const;

export function answerSwatchFor(optionIndex: number): QuizshowSwatch {
  const swatchKey = QUIZSHOW_ANSWER_SWATCH_KEYS[optionIndex];
  if (swatchKey === undefined) {
    throw new RangeError(`No answer swatch for option index ${optionIndex}`);
  }
  return QUIZSHOW_SWATCHES[swatchKey];
}

/** True is the green square, False the vermillion triangle. */
export function trueFalseSwatchFor(isTrue: boolean): QuizshowSwatch {
  return QUIZSHOW_SWATCHES[isTrue ? "square" : "triangle"];
}

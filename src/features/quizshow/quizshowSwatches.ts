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
  QUIZSHOW_TEAM_SHAPES,
  type QuizshowTeamColorKey,
  type QuizshowTeamShape,
} from "../../shared/contracts/quizshow";
import type { TFunction } from "../../shared/i18n/types";

/** Tier 1 draws solid, tier 2 an outline with a "2" badge, tier 3 a dotted fill with a "3" badge (C2.1). */
export type QuizshowSwatchTier = 1 | 2 | 3;

export interface QuizshowSwatch {
  colorKey: QuizshowTeamColorKey;
  shape: QuizshowTeamShape;
  tier: QuizshowSwatchTier;
  icon: IconType;
  /** The shape's colour token: the three tiers of a shape share it. */
  fillVar: string;
  inkVar: string;
  /** The tier 1 shape name (`quizshow:teams.shape.<shape>`); read a team's full name through `teamShapeLabel`. */
  labelKey: string;
}

const SHAPE_ICONS: Record<QuizshowTeamShape, IconType> = {
  circle: LuCircle,
  triangle: LuTriangle,
  square: LuSquare,
  diamond: LuDiamond,
  star: LuStar,
  hexagon: LuHexagon,
  heart: LuHeart,
  moon: LuMoon,
};

const TIER_SUFFIXES: ReadonlyArray<readonly [string, QuizshowSwatchTier]> = [
  ["_2", 2],
  ["_3", 3],
];

/** The tier a team key draws: "circle" 1, "circle_2" 2, "circle_3" 3. */
export function tierOfColorKey(
  colorKey: QuizshowTeamColorKey,
): QuizshowSwatchTier {
  const suffixMatch = TIER_SUFFIXES.find(([suffix]) =>
    colorKey.endsWith(suffix),
  );
  return suffixMatch === undefined ? 1 : suffixMatch[1];
}

/** The shape a team key draws, whatever its tier: "moon_3" is a moon. */
export function shapeOfColorKey(
  colorKey: QuizshowTeamColorKey,
): QuizshowTeamShape {
  const shapeName =
    tierOfColorKey(colorKey) === 1 ? colorKey : colorKey.slice(0, -2);
  const shape = QUIZSHOW_TEAM_SHAPES.find(
    (candidate) => candidate === shapeName,
  );
  if (shape === undefined) {
    throw new RangeError(`No team shape for colour key ${colorKey}`);
  }
  return shape;
}

function buildSwatch(colorKey: QuizshowTeamColorKey): QuizshowSwatch {
  const shape = shapeOfColorKey(colorKey);
  return {
    colorKey,
    shape,
    tier: tierOfColorKey(colorKey),
    icon: SHAPE_ICONS[shape],
    fillVar: `var(--quizshow-${shape})`,
    inkVar: `var(--quizshow-${shape}-ink)`,
    labelKey: `quizshow:teams.shape.${shape}`,
  };
}

/** All 24 team keys, tier 1 first (the auto-assign order). */
export const QUIZSHOW_SWATCHES = Object.fromEntries(
  QUIZSHOW_TEAM_COLOR_KEYS.map((colorKey) => [colorKey, buildSwatch(colorKey)]),
) as Record<QuizshowTeamColorKey, QuizshowSwatch>;

/** The team's accessible name: "Circle", or "Circle 2" through quizshow:teams.tierLabel. */
export function teamShapeLabel(
  colorKey: QuizshowTeamColorKey,
  t: TFunction,
): string {
  const swatch = QUIZSHOW_SWATCHES[colorKey];
  const shapeLabel = t(swatch.labelKey);
  if (swatch.tier === 1) {
    return shapeLabel;
  }
  return t("quizshow:teams.tierLabel", {
    shape: shapeLabel,
    tier: swatch.tier,
  });
}

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

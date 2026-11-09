/** Pure geometry for the Pulse Live wheel disc, copied from the approved TV mockup. */

export const QUIZSHOW_WHEEL_VIEWBOX = "-110 -110 220 220";

/** SVG user units, copied from the mockup. */
export const QUIZSHOW_WHEEL_RADII = {
  /** The halo disc's outer edge; its gradient peaks at r 109 and is clear past r 114. */
  rimHalo: 114,
  rimFill: 106,
  rimLine: 99.4,
  slice: 99,
  winner: 98.4,
  label: 90,
  peg: 102.8,
  pegDot: 2.1,
  hub: 23,
  hubLine: 19.5,
} as const;

export interface QuizshowWheelPoint {
  x: number;
  y: number;
}

export interface QuizshowWheelSliceGeometry {
  sliceIndex: number;
  startDegrees: number;
  endDegrees: number;
  middleDegrees: number;
  /** Wedge at radii.slice. */
  path: string;
  /** Wedge at radii.winner, inset 0.4 degrees each side (full circle for one slice). */
  winnerPath: string;
  /** wheelPolarPoint(radii.label, middle). */
  labelPoint: QuizshowWheelPoint;
  /** middle + 90: the text runs from the rim toward the hub. */
  labelRotation: number;
}

const FULL_TURN_DEGREES = 360;
const WINNER_INSET_DEGREES = 0.4;
/** From r 90 inward, a label of this length ends near r 28, clear of the hub ring at r 23.6. */
const LABEL_AVAILABLE_LENGTH = 62;
/** A generous average glyph width for the serif, so a measured label never runs past its estimate. */
const LABEL_GLYPH_WIDTH_EM = 0.6;
/** Low enough that a 19 character title stays whole (about 5.44 units). */
const LABEL_FONT_SIZE_MIN = 5.4;
const LABEL_FONT_SIZE_MAX = 8.2;
/** At the smallest size the label holds this many characters, the ellipsis included. */
const LABEL_MAX_CHARACTERS = Math.floor(
  LABEL_AVAILABLE_LENGTH / (LABEL_GLYPH_WIDTH_EM * LABEL_FONT_SIZE_MIN),
);
const ELLIPSIS = "…";

/** Keeps the path strings short; 4 decimals is far below a pixel at any stage size. */
function roundCoordinate(value: number): number {
  return Math.round(value * 10000) / 10000 + 0;
}

/** 0 degrees is 12 o'clock, clockwise; SVG y grows downward. */
export function wheelPolarPoint(
  radius: number,
  degrees: number,
): QuizshowWheelPoint {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return { x: radius * Math.cos(radians), y: radius * Math.sin(radians) };
}

/** A pie wedge from the centre; a sweep of 360 or more draws a full circle (two arcs, no line). */
export function wheelWedgePath(
  radius: number,
  startDegrees: number,
  endDegrees: number,
): string {
  if (endDegrees - startDegrees >= FULL_TURN_DEGREES) {
    return `M0 ${-radius} A${radius} ${radius} 0 1 1 0 ${radius} A${radius} ${radius} 0 1 1 0 ${-radius} Z`;
  }
  const start = wheelPolarPoint(radius, startDegrees);
  const end = wheelPolarPoint(radius, endDegrees);
  const largeArcFlag = endDegrees - startDegrees > 180 ? 1 : 0;
  return `M0 0 L${roundCoordinate(start.x)} ${roundCoordinate(start.y)} A${radius} ${radius} 0 ${largeArcFlag} 1 ${roundCoordinate(end.x)} ${roundCoordinate(end.y)} Z`;
}

export function wheelSliceGeometries(
  drawnCount: number,
): QuizshowWheelSliceGeometry[] {
  if (drawnCount < 1) return [];
  const sweepDegrees = FULL_TURN_DEGREES / drawnCount;
  const isSingleSlice = drawnCount === 1;
  return Array.from({ length: drawnCount }, (_unused, sliceIndex) => {
    const startDegrees = sliceIndex * sweepDegrees;
    const endDegrees = startDegrees + sweepDegrees;
    const middleDegrees = startDegrees + sweepDegrees / 2;
    return {
      sliceIndex,
      startDegrees,
      endDegrees,
      middleDegrees,
      path: wheelWedgePath(
        QUIZSHOW_WHEEL_RADII.slice,
        startDegrees,
        endDegrees,
      ),
      winnerPath: isSingleSlice
        ? wheelWedgePath(QUIZSHOW_WHEEL_RADII.winner, startDegrees, endDegrees)
        : wheelWedgePath(
            QUIZSHOW_WHEEL_RADII.winner,
            startDegrees + WINNER_INSET_DEGREES,
            endDegrees - WINNER_INSET_DEGREES,
          ),
      labelPoint: wheelPolarPoint(QUIZSHOW_WHEEL_RADII.label, middleDegrees),
      labelRotation: middleDegrees + 90,
    };
  });
}

/** Pegs on the drawnCount slice boundaries at radii.peg. */
export function wheelPegPoints(drawnCount: number): QuizshowWheelPoint[] {
  if (drawnCount < 1) return [];
  const sweepDegrees = FULL_TURN_DEGREES / drawnCount;
  return Array.from({ length: drawnCount }, (_unused, pegIndex) =>
    wheelPolarPoint(QUIZSHOW_WHEEL_RADII.peg, pegIndex * sweepDegrees),
  );
}

/**
 * Label text and font size (user units) that fit between the rim and the hub.
 * Lengths count code points, so a character outside the basic plane counts
 * once and a cut never splits it.
 */
export function wheelLabelFit(title: string): {
  text: string;
  fontSize: number;
} {
  const characters = Array.from(title);
  const rawFontSize =
    LABEL_AVAILABLE_LENGTH /
    (LABEL_GLYPH_WIDTH_EM * Math.max(characters.length, 1));
  if (rawFontSize < LABEL_FONT_SIZE_MIN) {
    const keptText = characters
      .slice(0, LABEL_MAX_CHARACTERS - 1)
      .join("")
      .trimEnd();
    return { text: `${keptText}${ELLIPSIS}`, fontSize: LABEL_FONT_SIZE_MIN };
  }
  return {
    text: title,
    fontSize: Math.min(rawFontSize, LABEL_FONT_SIZE_MAX),
  };
}

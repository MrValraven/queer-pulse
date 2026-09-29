import {
  arc,
  ellipsePoints,
  fourPointStar,
  quadraticBezier,
  rotatePoints,
  type Point,
} from "../../kit/curves";
import { ellipseOf, lineOf, pathOf } from "../../kit/shapes";
import type { StickerSketch } from "../../kit/stickerSketch";
import { TEA_PALETTE, type TeaArt, type TeaItemId } from "../tea.params";

/**
 * Tea art group one, ported from `tea-reference.mjs`: `spill-the-tea`,
 * `throwing-shade`, `sparkles`, `mother`. Each function draws in the
 * reference's own call order, so the sketch's underlay and paint layers
 * come out in the same order the reference's `under`/`paint` arrays did.
 */

const spillTheTeaArt: TeaArt = (
  sketch: StickerSketch,
  accentColor: string,
): void => {
  // The puddle and its flying drops.
  sketch.silhouette(
    pathOf(
      [
        ...ellipsePoints(200, 410, 168, 50, 0, Math.PI),
        [60, 396],
        [48, 360],
        [84, 380],
        [96, 340],
        [124, 372],
        [150, 350],
      ],
      { fill: TEA_PALETTE.tea, stroke: TEA_PALETTE.ink, strokeWidth: 8 },
    ),
    { cutWidth: 36 },
  );
  sketch.paint(
    pathOf(ellipsePoints(170, 408, 56, 13), { fill: TEA_PALETTE.teaLight }),
  );
  const puddleDroplets: readonly [number, number, number][] = [
    [70, 300, 16],
    [112, 262, 11],
    [300, 330, 13],
    [338, 368, 9],
    [150, 300, 9],
  ];
  for (const [dropletX, dropletY, dropletRadius] of puddleDroplets) {
    sketch.silhouette(
      ellipseOf(dropletX, dropletY, dropletRadius * 0.8, dropletRadius, {
        fill: TEA_PALETTE.tea,
        stroke: TEA_PALETTE.ink,
        strokeWidth: 6,
      }),
      { cutWidth: 20 },
    );
  }

  // The tipped cup, rotated into place around its own centre.
  const cupCenterX = 342;
  const cupCenterY = 186;
  const cupRotationDeg = -58;
  const rotateAroundCup = (points: readonly Point[]): Point[] =>
    rotatePoints(
      points.map(([x, y]): Point => [x + cupCenterX, y + cupCenterY]),
      cupRotationDeg,
      cupCenterX,
      cupCenterY,
    );
  const cupBodyPoints: Point[] = [
    [-92, -70],
    [92, -70],
    [76, 58],
    ...ellipsePoints(0, 58, 76, 34, 0, Math.PI).slice(1),
    [-92, -70],
  ];
  const cupHandlePoints = ellipsePoints(
    84,
    -4,
    40,
    44,
    -Math.PI / 2,
    Math.PI / 2,
  );
  sketch.silhouette(
    lineOf(rotateAroundCup(cupHandlePoints), TEA_PALETTE.ink, 30),
    { cutWidth: 34 },
  );
  sketch.paint(lineOf(rotateAroundCup(cupHandlePoints), TEA_PALETTE.cream, 14));
  sketch.silhouette(
    pathOf(rotateAroundCup(cupBodyPoints), {
      fill: TEA_PALETTE.cream,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 9,
    }),
    { cutWidth: 35 },
  );
  const cupBandPoints: Point[] = [
    [-88, -38],
    [88, -38],
    [86, -18],
    [-86, -18],
  ];
  sketch.paint(pathOf(rotateAroundCup(cupBandPoints), { fill: accentColor }));
  sketch.silhouette(
    pathOf(rotateAroundCup(ellipsePoints(0, -70, 92, 26)), {
      fill: TEA_PALETTE.teaDark,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 9,
    }),
    { cutWidth: 35 },
  );

  // The pour leaves the mouth over the low lip of the rim, arcs out, and
  // falls into the puddle, pouring from inside the rim on its way back.
  // `rotateAroundCup` always returns one point per point given, but
  // `noUncheckedIndexedAccess` still types an index read as possibly
  // `undefined`; this single-point helper narrows that back to `Point`.
  const rotatePointAroundCup = (point: Point): Point => {
    const [rotatedPoint] = rotateAroundCup([point]);
    if (!rotatedPoint) throw new Error("expected a rotated point");
    return rotatedPoint;
  };
  const rimPointAt = (theta: number): Point =>
    rotatePointAroundCup([92 * Math.cos(theta), -70 + 26 * Math.sin(theta)]);
  const pourLipUpper = rimPointAt(Math.PI * 0.78);
  const pourLipLower = rimPointAt(Math.PI * 1.2);
  const pourInnerArc: Point[] = [];
  for (let stepIndex = 0; stepIndex <= 12; stepIndex += 1) {
    const theta = Math.PI * 1.2 - (stepIndex / 12) * Math.PI * 0.42;
    pourInnerArc.push(
      rotatePointAroundCup([
        92 * 0.78 * Math.cos(theta) - 6,
        -70 + 26 * 0.7 * Math.sin(theta),
      ]),
    );
  }
  const pourStream: Point[] = [
    pourLipUpper,
    ...quadraticBezier(
      pourLipUpper,
      [pourLipUpper[0] - 70, pourLipUpper[1] + 10],
      [196, 392],
    ).slice(1),
    [238, 396],
    ...quadraticBezier(
      [238, 396],
      [pourLipLower[0] - 10, pourLipLower[1] + 80],
      pourLipLower,
    ).slice(1),
    ...pourInnerArc,
  ];
  sketch.silhouette(
    pathOf(pourStream, {
      fill: TEA_PALETTE.tea,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 8,
    }),
    { cutWidth: 22 },
  );
  sketch.paint(
    pathOf(
      [
        ...quadraticBezier(
          [pourLipUpper[0] - 8, pourLipUpper[1] + 14],
          [pourLipUpper[0] - 50, pourLipUpper[1] + 40],
          [214, 360],
          10,
        ),
        ...quadraticBezier(
          [222, 360],
          [pourLipUpper[0] - 40, pourLipUpper[1] + 44],
          [pourLipUpper[0] + 2, pourLipUpper[1] + 16],
          10,
        ),
      ],
      { fill: TEA_PALETTE.teaLight },
    ),
  );
  sketch.silhouette(
    pathOf(fourPointStar(468, 330, 26), {
      fill: TEA_PALETTE.spark,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 6,
    }),
    { cutWidth: 20 },
  );
};

/** One sunglasses lens (or the bridge, at a small width/height): a flat
 *  top-inner edge and a bulging lower-outer edge. */
function lensShapeOf(x: number, y: number, w: number, h: number): Point[] {
  return [
    [x - w, y],
    [x + w, y],
    [x + w * 0.92, y + h * 0.7],
    // The reference's own `arc` default is 18 steps (the shared kit default
    // is 16 for other callers), so the step count is passed explicitly here
    // to keep this lens curve identical to the reference.
    ...arc(
      x + w * 0.92,
      y + h * 0.7,
      x - w * 0.92,
      y + h * 0.7,
      h * 0.36,
      18,
    ).slice(1),
  ];
}

/** The shade the glasses throw onto the ground below and behind them. */
function shadowOf(points: readonly Point[]): Point[] {
  return points.map(([x, y]): Point => [
    x * 0.86 + 62 + (y - 162) * 0.35,
    372 + (y - 162) * 0.42,
  ]);
}

const throwingShadeArt: TeaArt = (
  sketch: StickerSketch,
  accentColor: string,
): void => {
  // Sun, top left, with its rays.
  for (let rayIndex = 0; rayIndex < 8; rayIndex += 1) {
    const angle = (rayIndex / 8) * Math.PI * 2;
    sketch.silhouette(
      lineOf(
        [
          [74 + Math.cos(angle) * 46, 74 + Math.sin(angle) * 46],
          [74 + Math.cos(angle) * 66, 74 + Math.sin(angle) * 66],
        ],
        TEA_PALETTE.goldDark,
        8,
      ),
      { cutWidth: 22 },
    );
  }
  sketch.silhouette(
    ellipseOf(74, 74, 32, 32, {
      fill: TEA_PALETTE.gold,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 7,
    }),
    { cutWidth: 23 },
  );

  // The glasses' shadow, thrown onto the ground, using the final shadow
  // mapping: x * 0.86 + 62 + (y - 162) * 0.35, 372 + (y - 162) * 0.42.
  sketch.silhouette(
    pathOf(shadowOf(lensShapeOf(170, 162, 88, 104)), {
      fill: TEA_PALETTE.shadow,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 6,
    }),
    { cutWidth: 24 },
  );
  sketch.silhouette(
    pathOf(shadowOf(lensShapeOf(366, 162, 88, 104)), {
      fill: TEA_PALETTE.shadow,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 6,
    }),
    { cutWidth: 24 },
  );
  const bridgePoints: Point[] = [
    [250, 164],
    [288, 164],
    [284, 188],
    [254, 188],
  ];
  sketch.silhouette(
    pathOf(shadowOf(bridgePoints), {
      fill: TEA_PALETTE.shadow,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 5,
    }),
    { cutWidth: 15 },
  );

  // The glasses themselves, in the accent colour.
  sketch.silhouette(
    pathOf(lensShapeOf(170, 162, 88, 104), {
      fill: accentColor,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 9,
    }),
    { cutWidth: 35 },
  );
  sketch.silhouette(
    pathOf(lensShapeOf(366, 162, 88, 104), {
      fill: accentColor,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 9,
    }),
    { cutWidth: 35 },
  );
  sketch.silhouette(
    pathOf(bridgePoints, {
      fill: accentColor,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 8,
    }),
    { cutWidth: 22 },
  );

  // The dark lenses and their single glint, over each accent lens.
  for (const lensCenterX of [170, 366]) {
    sketch.paint(
      pathOf(lensShapeOf(lensCenterX, 176, 70, 82), {
        fill: TEA_PALETTE.night,
      }),
    );
    sketch.paint(
      pathOf(
        [
          [lensCenterX - 48, 186],
          [lensCenterX - 22, 186],
          [lensCenterX - 56, 244],
          [lensCenterX - 66, 232],
        ],
        { fill: TEA_PALETTE.nightShine },
      ),
    );
  }
};

const sparklesArt: TeaArt = (
  sketch: StickerSketch,
  accentColor: string,
): void => {
  sketch.silhouette(
    pathOf(fourPointStar(200, 300, 176, 0.28), {
      fill: TEA_PALETTE.gold,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 9,
    }),
    { cutWidth: 35 },
  );
  sketch.paint(
    pathOf(fourPointStar(200, 300, 96, 0.28), { fill: TEA_PALETTE.spark }),
  );
  sketch.silhouette(
    pathOf(fourPointStar(392, 150, 92, 0.3), {
      fill: TEA_PALETTE.gold,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 8,
    }),
    { cutWidth: 36 },
  );
  sketch.paint(
    pathOf(fourPointStar(392, 150, 48, 0.3), { fill: TEA_PALETTE.spark }),
  );
  sketch.silhouette(
    pathOf(fourPointStar(132, 92, 50, 0.32), {
      fill: accentColor,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 7,
    }),
    { cutWidth: 37 },
  );
};

const motherArt: TeaArt = (
  sketch: StickerSketch,
  accentColor: string,
): void => {
  const crownRotationDeg = -12;
  const crownPivotX = 256;
  const crownPivotY = 300;
  const crownPoints = rotatePoints(
    [
      [96, 380],
      [70, 146],
      [176, 256],
      [256, 104],
      [336, 256],
      [442, 146],
      [416, 380],
    ],
    crownRotationDeg,
    crownPivotX,
    crownPivotY,
  );
  sketch.silhouette(
    pathOf(crownPoints, {
      fill: TEA_PALETTE.gold,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 9,
    }),
    { cutWidth: 35 },
  );
  const bandPoints = rotatePoints(
    [
      [86, 350],
      [426, 350],
      [426, 420],
      [86, 420],
    ],
    crownRotationDeg,
    crownPivotX,
    crownPivotY,
  );
  sketch.silhouette(
    pathOf(bandPoints, {
      fill: TEA_PALETTE.goldDark,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 9,
    }),
    { cutWidth: 35 },
  );
  const tipPoints = rotatePoints(
    [
      [70, 146],
      [256, 104],
      [442, 146],
    ],
    crownRotationDeg,
    crownPivotX,
    crownPivotY,
  );
  for (const [tipX, tipY] of tipPoints) {
    sketch.silhouette(
      ellipseOf(tipX, tipY, 22, 22, {
        fill: accentColor,
        stroke: TEA_PALETTE.ink,
        strokeWidth: 7,
      }),
      { cutWidth: 23 },
    );
  }
  const gemPoints = rotatePoints(
    [
      [172, 385],
      [256, 385],
      [340, 385],
    ],
    crownRotationDeg,
    crownPivotX,
    crownPivotY,
  );
  gemPoints.forEach(([gemX, gemY], gemIndex) => {
    const isCenterGem = gemIndex === 1;
    const gemRadius = isCenterGem ? 22 : 16;
    sketch.paint(
      ellipseOf(gemX, gemY, gemRadius, gemRadius, {
        fill: isCenterGem ? accentColor : TEA_PALETTE.teal,
        stroke: TEA_PALETTE.ink,
        strokeWidth: 6,
      }),
    );
  });
  const shinePoints = rotatePoints(
    [
      [112, 330],
      [128, 330],
      [110, 196],
      [96, 190],
    ],
    crownRotationDeg,
    crownPivotX,
    crownPivotY,
  );
  sketch.paint(pathOf(shinePoints, { fill: TEA_PALETTE.goldLight }));
  sketch.silhouette(
    pathOf(fourPointStar(456, 70, 32), {
      fill: TEA_PALETTE.spark,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 6,
    }),
    { cutWidth: 20 },
  );
  sketch.silhouette(
    pathOf(fourPointStar(470, 280, 20), {
      fill: TEA_PALETTE.cream,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 6,
    }),
    { cutWidth: 20 },
  );
  sketch.silhouette(
    pathOf(fourPointStar(48, 250, 22), {
      fill: TEA_PALETTE.spark,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 6,
    }),
    { cutWidth: 20 },
  );
};

export const TEA_ART_GROUP_ONE: Readonly<
  Record<
    Extract<
      TeaItemId,
      "spill-the-tea" | "throwing-shade" | "sparkles" | "mother"
    >,
    TeaArt
  >
> = {
  "spill-the-tea": spillTheTeaArt,
  "throwing-shade": throwingShadeArt,
  sparkles: sparklesArt,
  mother: motherArt,
};

import type { Primitive } from "../../primitives";
import { tint } from "../../kit/colorMix";
import {
  burst,
  ellipsePoints,
  fourPointStar,
  quadraticBezier,
  rotatePoints,
  type Point,
} from "../../kit/curves";
import { ellipseOf, lineOf, pathOf, rectOf } from "../../kit/shapes";
import type { StickerSketch } from "../../kit/stickerSketch";
import { TEA_PALETTE, type TeaArt } from "../tea.params";

/**
 * Tea art, group three: Ate, The walk, Let's dance, Fan clack. Ported from
 * `tea-reference.mjs`, with every underlay cutWidth derived from the
 * coordinator's binding rule: reference underlay stroke width minus the
 * painted primitive's own stroke width.
 */

/** `api.sparkle`'s fixed underlay stroke width (26) minus its painted stroke
 *  width (6). */
const SPARKLE_CUT_WIDTH = 20;
/** `api.burst`'s fixed underlay stroke width (30) minus its painted stroke
 *  width (6). */
const BURST_CUT_WIDTH = 24;

function paintSparkle(
  sketch: StickerSketch,
  x: number,
  y: number,
  radius: number,
  fill: string,
): void {
  sketch.silhouette(
    pathOf(fourPointStar(x, y, radius), {
      fill,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 6,
    }),
    { cutWidth: SPARKLE_CUT_WIDTH },
  );
}

function paintBurst(
  sketch: StickerSketch,
  x: number,
  y: number,
  radius: number,
  fill: string,
  spikeCount: number,
): void {
  sketch.silhouette(
    pathOf(burst(x, y, radius, 0.55, spikeCount, 0.2), {
      fill,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 6,
    }),
    { cutWidth: BURST_CUT_WIDTH },
  );
}

const ATE_PLATE_CENTER_X = 256;
const ATE_PLATE_CENTER_Y = 300;

function drawAte(sketch: StickerSketch, accentColor: string): void {
  sketch.silhouette(
    ellipseOf(ATE_PLATE_CENTER_X, ATE_PLATE_CENTER_Y, 176, 100, {
      fill: TEA_PALETTE.paper,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 9,
    }),
    { cutWidth: 35 },
  );
  sketch.paint(
    ellipseOf(ATE_PLATE_CENTER_X, ATE_PLATE_CENTER_Y, 122, 64, {
      fill: TEA_PALETTE.plateInner,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 6,
    }),
  );
  sketch.paint(
    lineOf(
      ellipsePoints(
        ATE_PLATE_CENTER_X,
        ATE_PLATE_CENTER_Y,
        150,
        84,
        Math.PI * 1.1,
        Math.PI * 1.45,
      ),
      accentColor,
      10,
    ),
  );

  // The fork and knife rest crossed on the rim: rotate their point arrays
  // about the plate center the same way the reference does, computing plain
  // canvas coordinates directly.
  const fork = (points: readonly Point[]): Point[] =>
    rotatePoints(points, 38, ATE_PLATE_CENTER_X, ATE_PLATE_CENTER_Y);
  const knife = (points: readonly Point[]): Point[] =>
    rotatePoints(points, -38, ATE_PLATE_CENTER_X, ATE_PLATE_CENTER_Y);

  sketch.silhouette(
    pathOf(
      fork([
        [244, 96],
        [268, 96],
        [268, 330],
        [244, 330],
      ]),
      { fill: TEA_PALETTE.silver, stroke: TEA_PALETTE.ink, strokeWidth: 7 },
    ),
    { cutWidth: 37 },
  );
  sketch.silhouette(
    pathOf(
      fork([
        [228, 60],
        [284, 60],
        [284, 132],
        [228, 132],
      ]),
      { fill: TEA_PALETTE.silver, stroke: TEA_PALETTE.ink, strokeWidth: 7 },
    ),
    { cutWidth: 29 },
  );
  sketch.paint(
    pathOf(
      fork([
        [243, 60],
        [243, 104],
      ]),
      {
        stroke: TEA_PALETTE.ink,
        strokeWidth: 6,
        isClosed: false,
      },
    ),
  );
  sketch.paint(
    pathOf(
      fork([
        [269, 60],
        [269, 104],
      ]),
      {
        stroke: TEA_PALETTE.ink,
        strokeWidth: 6,
        isClosed: false,
      },
    ),
  );
  sketch.silhouette(
    pathOf(
      knife([
        [240, 70],
        [272, 60],
        [276, 230],
        [244, 232],
      ]),
      { fill: TEA_PALETTE.silver, stroke: TEA_PALETTE.ink, strokeWidth: 7 },
    ),
    { cutWidth: 37 },
  );
  sketch.silhouette(
    pathOf(
      knife([
        [240, 222],
        [276, 222],
        [276, 338],
        [240, 338],
      ]),
      { fill: accentColor, stroke: TEA_PALETTE.ink, strokeWidth: 8 },
    ),
    { cutWidth: 36 },
  );

  paintSparkle(sketch, 330, 332, 30, TEA_PALETTE.paper);
  paintSparkle(sketch, 180, 320, 14, TEA_PALETTE.paper);
  paintSparkle(sketch, 430, 440, 26, TEA_PALETTE.spark);
}

function drawTheWalk(sketch: StickerSketch, accentColor: string): void {
  paintBurst(sketch, 396, 452, 50, TEA_PALETTE.spark, 9);

  const motionLines: readonly [footY: number, motionLength: number][] = [
    [180, 120],
    [230, 160],
    [280, 110],
  ];
  for (const [footY, motionLength] of motionLines) {
    const lineY = footY - 70;
    sketch.silhouette(
      lineOf(
        [
          [40, lineY],
          [40 + motionLength * 0.7, lineY],
        ],
        TEA_PALETTE.ink,
        9,
      ),
      { cutWidth: 26 },
    );
  }

  const shoeOutline: Point[] = [
    ...quadraticBezier([60, 402], [70, 340], [150, 330]),
    ...quadraticBezier([150, 330], [240, 318], [300, 238]).slice(1),
    ...quadraticBezier([300, 238], [350, 170], [410, 176]).slice(1),
    ...quadraticBezier([410, 176], [456, 184], [446, 232]).slice(1),
    [420, 250],
    [410, 432],
    [384, 432],
    [378, 276],
    ...quadraticBezier([378, 276], [300, 330], [230, 390]).slice(1),
    ...quadraticBezier([230, 390], [150, 424], [60, 402]).slice(1),
  ];
  sketch.silhouette(
    pathOf(shoeOutline, {
      fill: accentColor,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 9,
    }),
    { cutWidth: 35 },
  );

  const heelShadow: Point[] = [
    ...quadraticBezier([60, 402], [150, 424], [230, 390]),
    ...quadraticBezier([230, 390], [300, 330], [378, 276]).slice(1),
    [378, 296],
    ...quadraticBezier([378, 296], [300, 350], [230, 408]).slice(1),
    ...quadraticBezier([230, 408], [150, 440], [62, 414]).slice(1),
  ];
  sketch.paint(pathOf(heelShadow, { fill: TEA_PALETTE.ink }));

  const soleHighlight: Point[] = [
    ...quadraticBezier([150, 336], [220, 326], [262, 280]),
    [276, 292],
    ...quadraticBezier([262, 300], [220, 340], [150, 350]).slice(1),
  ];
  sketch.paint(pathOf(soleHighlight, { fill: TEA_PALETTE.paper }));

  paintSparkle(sketch, 470, 90, 26, TEA_PALETTE.spark);
}

const DISCO_CENTER_X = 256;
const DISCO_CENTER_Y = 270;
const DISCO_BEAM_RADIUS = 232;
/** Half the disco ball body's rounded-rect clip side (304), so the clip
 *  reads as the reference's r-152 circle. */
const DISCO_FACET_CLIP_SIDE = 304;

function drawLetsDance(sketch: StickerSketch, accentColor: string): void {
  const accentBeamColor = tint(accentColor, 0.6);
  for (let beamIndex = 0; beamIndex < 8; beamIndex += 1) {
    const beamAngle = (beamIndex / 8) * Math.PI * 2 + 0.2;
    const startAngle = beamAngle - 0.08;
    const endAngle = beamAngle + 0.08;
    const beamFill = beamIndex % 2 ? TEA_PALETTE.beamLight : accentBeamColor;
    sketch.silhouette(
      pathOf(
        [
          [DISCO_CENTER_X, DISCO_CENTER_Y],
          [
            DISCO_CENTER_X + Math.cos(startAngle) * DISCO_BEAM_RADIUS,
            DISCO_CENTER_Y + Math.sin(startAngle) * DISCO_BEAM_RADIUS,
          ],
          [
            DISCO_CENTER_X + Math.cos(endAngle) * DISCO_BEAM_RADIUS,
            DISCO_CENTER_Y + Math.sin(endAngle) * DISCO_BEAM_RADIUS,
          ],
        ],
        { fill: beamFill, stroke: TEA_PALETTE.ink, strokeWidth: 5 },
      ),
      { cutWidth: 19 },
    );
  }

  sketch.silhouette(
    lineOf(
      [
        [DISCO_CENTER_X, 24],
        [DISCO_CENTER_X, 110],
      ],
      TEA_PALETTE.ink,
      8,
    ),
    { cutWidth: 26 },
  );

  sketch.silhouette(
    ellipseOf(DISCO_CENTER_X, DISCO_CENTER_Y, 156, 156, {
      fill: TEA_PALETTE.discoBase,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 9,
    }),
    { cutWidth: 35 },
  );

  const facetPrimitives: Primitive[] = [];
  for (let rowIndex = 0; rowIndex < 11; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < 11; columnIndex += 1) {
      const facetX = 100 + columnIndex * 29;
      const facetY = 114 + rowIndex * 29;
      const hash =
        Math.abs(
          Math.sin(rowIndex * 12.9898 + columnIndex * 78.233) * 43758.5453,
        ) % 1;
      const facetFill =
        hash < 0.12
          ? accentColor
          : hash < 0.32
            ? TEA_PALETTE.paper
            : hash < 0.5
              ? TEA_PALETTE.discoMid
              : hash < 0.75
                ? TEA_PALETTE.discoLight
                : TEA_PALETTE.discoPale;
      facetPrimitives.push(
        rectOf(facetX, facetY, 27, 27, 0, { fill: facetFill }),
      );
    }
  }
  const facetsGroup: Primitive = {
    type: "group",
    clipRect: {
      x: DISCO_CENTER_X - DISCO_FACET_CLIP_SIDE / 2,
      y: DISCO_CENTER_Y - DISCO_FACET_CLIP_SIDE / 2,
      width: DISCO_FACET_CLIP_SIDE,
      height: DISCO_FACET_CLIP_SIDE,
      radius: DISCO_FACET_CLIP_SIDE / 2,
    },
    children: facetPrimitives,
  };
  sketch.paint(facetsGroup);
  sketch.paint(
    ellipseOf(DISCO_CENTER_X, DISCO_CENTER_Y, 156, 156, {
      stroke: TEA_PALETTE.ink,
      strokeWidth: 9,
    }),
  );

  paintSparkle(sketch, 190, 200, 30, TEA_PALETTE.paper);
  paintSparkle(sketch, 454, 90, 24, TEA_PALETTE.spark);
  paintSparkle(sketch, 60, 430, 20, TEA_PALETTE.spark);
}

const FAN_PIVOT_X = 226;
const FAN_PIVOT_Y = 392;

function drawFanClack(sketch: StickerSketch, accentColor: string): void {
  for (let bladeIndex = 0; bladeIndex < 8; bladeIndex += 1) {
    const startAngle = ((-172 + bladeIndex * 17) * Math.PI) / 180;
    const endAngle = ((-172 + (bladeIndex + 1) * 17) * Math.PI) / 180;
    const bladeRadius = 226;
    const bladeFill = bladeIndex % 2 ? TEA_PALETTE.cream : accentColor;
    sketch.silhouette(
      pathOf(
        [
          [FAN_PIVOT_X, FAN_PIVOT_Y],
          [
            FAN_PIVOT_X + Math.cos(startAngle) * bladeRadius,
            FAN_PIVOT_Y + Math.sin(startAngle) * bladeRadius,
          ],
          [
            FAN_PIVOT_X + Math.cos(endAngle) * bladeRadius,
            FAN_PIVOT_Y + Math.sin(endAngle) * bladeRadius,
          ],
        ],
        { fill: bladeFill, stroke: TEA_PALETTE.ink, strokeWidth: 6 },
      ),
      { cutWidth: 38 },
    );
  }

  sketch.silhouette(
    ellipseOf(FAN_PIVOT_X, FAN_PIVOT_Y, 16, 16, {
      fill: TEA_PALETTE.gold,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 6,
    }),
    { cutWidth: 24 },
  );

  for (const motionRadius of [252, 280]) {
    sketch.silhouette(
      lineOf(
        ellipsePoints(
          FAN_PIVOT_X,
          FAN_PIVOT_Y,
          motionRadius,
          motionRadius,
          -0.85,
          -0.3,
          12,
        ),
        TEA_PALETTE.ink,
        8,
      ),
      { cutWidth: 24 },
    );
  }

  paintBurst(sketch, 430, 318, 48, TEA_PALETTE.spark, 9);

  sketch.silhouette(
    lineOf(
      [
        [FAN_PIVOT_X, FAN_PIVOT_Y + 16],
        [FAN_PIVOT_X + 8, FAN_PIVOT_Y + 64],
      ],
      TEA_PALETTE.goldDark,
      8,
    ),
    { cutWidth: 26 },
  );

  sketch.silhouette(
    ellipseOf(FAN_PIVOT_X + 10, FAN_PIVOT_Y + 74, 12, 16, {
      fill: TEA_PALETTE.gold,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 6,
    }),
    { cutWidth: 20 },
  );
}

export const TEA_ART_GROUP_THREE: Readonly<
  Record<"ate" | "the-walk" | "lets-dance" | "fan-clack", TeaArt>
> = {
  ate: drawAte,
  "the-walk": drawTheWalk,
  "lets-dance": drawLetsDance,
  "fan-clack": drawFanClack,
};

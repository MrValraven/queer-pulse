import { mixHex, tint } from "../../kit/colorMix";
import {
  ellipsePoints,
  fourPointStar,
  heartPoints,
  quadraticBezier,
  rotatePoints,
  type Point,
} from "../../kit/curves";
import { drawHand } from "../../kit/hand";
import {
  ellipseOf,
  lineOf,
  pathOf,
  rectOf,
  rotateAbout,
} from "../../kit/shapes";
import type { StickerSketch } from "../../kit/stickerSketch";
import { TEA_PALETTE, type TeaArt } from "../tea.params";

/**
 * Tea art, group two: Receipts, Watching, Unbothered, Mwah. Ported from
 * `tea-reference.mjs` `STICKERS` (same four entries) per the wave B die-cut
 * ruling: `cutWidth` passed to `sketch.silhouette` is always computed as the
 * reference's underlay stroke-width minus the strokeWidth of the primitive
 * painted.
 */

/** `api.sparkle(x, y, r, fill)`: a four-point star, ink stroke 6, cut 26 in
 *  the reference (underlay width 26) so cutWidth = 26 - 6 = 20. */
function drawSparkle(
  sketch: StickerSketch,
  centerX: number,
  centerY: number,
  radius: number,
  fillColor: string = TEA_PALETTE.spark,
): void {
  sketch.silhouette(
    pathOf(fourPointStar(centerX, centerY, radius), {
      fill: fillColor,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 6,
    }),
    { cutWidth: 20 },
  );
}

const drawReceipts: TeaArt = (sketch, accentColor) => {
  const zigzagPoints: Point[] = [];
  for (let stepIndex = 0; stepIndex <= 10; stepIndex += 1) {
    zigzagPoints.push([148 + stepIndex * 22, stepIndex % 2 ? 42 : 58]);
  }
  // Torn receipt body: reference `stroke: 9`, default `cut: 44` -> cutWidth 35.
  sketch.silhouette(
    pathOf([...zigzagPoints, [368, 380], [148, 380]], {
      fill: TEA_PALETTE.paper,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 9,
    }),
    { cutWidth: 35 },
  );

  const lineItems: readonly [lineY: number, lineWidth: number][] = [
    [92, 150],
    [124, 120],
    [156, 160],
    [188, 110],
    [220, 150],
    [252, 130],
    [284, 150],
  ];
  for (const [lineY, lineWidth] of lineItems) {
    sketch.paint(
      rectOf(176, lineY, lineWidth, 12, 6, { fill: TEA_PALETTE.receiptLine }),
    );
  }

  sketch.paint(rectOf(170, 214, 176, 26, 6, { fill: TEA_PALETTE.highlighter }));
  sketch.paint(
    rectOf(176, 220, 160, 14, 7, { fill: TEA_PALETTE.receiptLineDark }),
  );

  const circledLinePoints = rotatePoints(
    ellipsePoints(258, 226, 112, 34, 0, Math.PI * 2.1),
    -6,
    258,
    226,
  );
  sketch.paint(
    pathOf(circledLinePoints, {
      stroke: TEA_PALETTE.red,
      strokeWidth: 9,
      lineCap: "round",
    }),
  );

  sketch.paint(rectOf(176, 316, 164, 18, 9, { fill: TEA_PALETTE.ink }));
  sketch.paint(rectOf(176, 344, 96, 14, 7, { fill: accentColor }));

  drawHand(sketch, {
    x: 258,
    y: 420,
    angleDeg: 0,
    size: 0.95,
    fill: TEA_PALETTE.cream,
    thumbSide: "left",
  });

  drawSparkle(sketch, 440, 110, 28);
  drawSparkle(sketch, 70, 190, 22);
};

const drawWatching: TeaArt = (sketch, accentColor) => {
  const popcornPuffs: readonly [
    puffX: number,
    puffY: number,
    puffRadius: number,
  ][] = [
    [160, 196, 44],
    [226, 164, 50],
    [300, 176, 46],
    [356, 214, 38],
    [128, 236, 36],
    [262, 222, 44],
  ];
  // Reference `stroke: 7`, `cut: 36` -> cutWidth 29.
  for (const [puffX, puffY, puffRadius] of popcornPuffs) {
    sketch.silhouette(
      ellipseOf(puffX, puffY, puffRadius, puffRadius * 0.9, {
        fill: TEA_PALETTE.cream,
        stroke: TEA_PALETTE.ink,
        strokeWidth: 7,
      }),
      { cutWidth: 29 },
    );
  }
  for (const [puffX, puffY, puffRadius] of popcornPuffs) {
    sketch.paint(
      ellipseOf(
        puffX + puffRadius * 0.22,
        puffY + puffRadius * 0.28,
        puffRadius * 0.34,
        puffRadius * 0.26,
        { fill: TEA_PALETTE.spark },
      ),
    );
  }

  const kernels: readonly [
    kernelX: number,
    kernelY: number,
    kernelRadius: number,
    kernelRotationDeg: number,
  ][] = [
    [96, 120, 20, 20],
    [420, 110, 18, -30],
    [400, 60, 13, 10],
  ];
  // Reference `stroke: 6`, `cut: 26` -> cutWidth 20.
  for (const [kernelX, kernelY, kernelRadius, kernelRotationDeg] of kernels) {
    sketch.silhouette(
      ellipseOf(kernelX, kernelY, kernelRadius, kernelRadius * 0.85, {
        fill: TEA_PALETTE.cream,
        stroke: TEA_PALETTE.ink,
        strokeWidth: 6,
        rotationDeg: kernelRotationDeg,
      }),
      { cutWidth: 20 },
    );
  }

  const bucketPoints: readonly Point[] = [
    [112, 268],
    [400, 268],
    [358, 480],
    [154, 480],
  ];
  // Reference `stroke: 9`, default `cut: 44` -> cutWidth 35.
  sketch.silhouette(
    pathOf(bucketPoints, {
      fill: TEA_PALETTE.paper,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 9,
    }),
    { cutWidth: 35 },
  );

  // The bucket's top x mapped onto its slanted bottom edge, so each stripe's
  // sides follow the bucket's taper.
  const bucketBottomXFor = (topX: number) => 154 + ((topX - 112) / 288) * 204;
  for (let stripeIndex = 0; stripeIndex < 3; stripeIndex += 1) {
    const stripeLeftX = 144 + stripeIndex * 92;
    const stripeRightX = stripeLeftX + 46;
    sketch.paint(
      pathOf(
        [
          [stripeLeftX, 272],
          [stripeRightX, 272],
          [bucketBottomXFor(stripeRightX), 476],
          [bucketBottomXFor(stripeLeftX), 476],
        ],
        { fill: accentColor },
      ),
    );
  }
  sketch.paint(
    pathOf(bucketPoints, { stroke: TEA_PALETTE.ink, strokeWidth: 9 }),
  );

  // The eyes peeking over the rim, side-eyeing: no box behind them, painted
  // straight onto the already-cut bucket and popcorn.
  sketch.paint(
    ellipseOf(220, 268, 30, 22, {
      fill: TEA_PALETTE.paper,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 7,
    }),
  );
  sketch.paint(
    ellipseOf(294, 268, 30, 22, {
      fill: TEA_PALETTE.paper,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 7,
    }),
  );
  sketch.paint(ellipseOf(236, 270, 12, 14, { fill: TEA_PALETTE.ink }));
  sketch.paint(ellipseOf(310, 270, 12, 14, { fill: TEA_PALETTE.ink }));
  sketch.paint(
    lineOf(
      [
        [190, 244],
        [250, 238],
      ],
      TEA_PALETTE.ink,
      8,
    ),
  );
  sketch.paint(
    lineOf(
      [
        [264, 238],
        [324, 244],
      ],
      TEA_PALETTE.ink,
      8,
    ),
  );

  sketch.paint(
    pathOf(
      [
        [112, 296],
        [400, 296],
      ],
      { stroke: TEA_PALETTE.ink, strokeWidth: 9, isClosed: false },
    ),
  );
};

const drawUnbothered: TeaArt = (sketch, accentColor) => {
  drawHand(sketch, {
    x: 236,
    y: 318,
    angleDeg: 38,
    size: 1.55,
    fill: TEA_PALETTE.cream,
    nailColor: accentColor,
    thumbSide: "right",
  });

  const bottlePivotX = 362;
  const bottlePivotY = 104;
  // Polish bottle body: fill and stroke both ink, reference `stroke: 8`
  // (default), `cut: 44` (default) -> cutWidth 36.
  sketch.silhouette(
    rotateAbout(
      [
        rectOf(344, 56, 36, 96, 12, {
          fill: TEA_PALETTE.ink,
          stroke: TEA_PALETTE.ink,
          strokeWidth: 8,
        }),
      ],
      38,
      bottlePivotX,
      bottlePivotY,
    ),
    { cutWidth: 36 },
  );
  // Brush tip: reference `stroke: 6`, `cut: 28` -> cutWidth 22.
  sketch.silhouette(
    rotateAbout(
      [
        rectOf(354, 140, 16, 44, 6, {
          fill: accentColor,
          stroke: TEA_PALETTE.ink,
          strokeWidth: 6,
        }),
      ],
      38,
      bottlePivotX,
      bottlePivotY,
    ),
    { cutWidth: 22 },
  );

  drawSparkle(sketch, 92, 96, 34);
  drawSparkle(sketch, 160, 46, 18, TEA_PALETTE.cream);
  drawSparkle(sketch, 454, 300, 22);
};

const drawMwah: TeaArt = (sketch, accentColor) => {
  const upperLipPoints: Point[] = [
    ...quadraticBezier([60, 262], [120, 150], [206, 176]),
    ...quadraticBezier([206, 176], [240, 186], [256, 214]).slice(1),
    ...quadraticBezier([256, 214], [272, 186], [306, 176]).slice(1),
    ...quadraticBezier([306, 176], [392, 150], [452, 262]).slice(1),
    ...quadraticBezier([452, 262], [256, 244], [60, 262]).slice(1),
  ];
  const lowerLipPoints: Point[] = [
    ...quadraticBezier([70, 272], [256, 256], [442, 272]),
    ...quadraticBezier([442, 272], [380, 400], [256, 398]).slice(1),
    ...quadraticBezier([256, 398], [132, 400], [70, 272]).slice(1),
  ];
  // Both lips: reference `stroke: 9`, default `cut: 44` -> cutWidth 35.
  sketch.silhouette(
    pathOf(upperLipPoints, {
      fill: accentColor,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 9,
    }),
    { cutWidth: 35 },
  );
  sketch.silhouette(
    pathOf(lowerLipPoints, {
      fill: accentColor,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 9,
    }),
    { cutWidth: 35 },
  );

  sketch.paint(
    lineOf(
      quadraticBezier([90, 270], [256, 262], [422, 270]),
      TEA_PALETTE.ink,
      7,
    ),
  );

  // A white shine at opacity 0.35 over the lower lip: tint(accent, 0.35).
  sketch.paint(ellipseOf(210, 330, 46, 16, { fill: tint(accentColor, 0.35) }));

  // The teeth-gap marks are ink at opacity 0.35 over the lower lip, so the
  // composite mixes toward ink: the generic `mixHex` helper, since `tint`
  // always mixes toward white.
  const dimpleLineColor = mixHex(accentColor, TEA_PALETTE.ink, 0.35);
  const dimplePositions: readonly [
    dimpleX: number,
    dimpleEndOffsetX: number,
  ][] = [
    [150, -8],
    [200, -8],
    [312, 8],
    [362, 8],
  ];
  for (const [dimpleX, dimpleEndOffsetX] of dimplePositions) {
    sketch.paint(
      lineOf(
        [
          [dimpleX, 300],
          [dimpleX + dimpleEndOffsetX, 356],
        ],
        dimpleLineColor,
        4,
      ),
    );
  }

  // Reference `heart(430, 110, 2.2)`, `stroke: 7`, `cut: 30` -> cutWidth 23.
  sketch.silhouette(
    pathOf(heartPoints(430, 110, 2.2, 48), {
      fill: TEA_PALETTE.red,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 7,
    }),
    { cutWidth: 23 },
  );
  // Reference `heart(372, 58, 1.2)`, `stroke: 6`, `cut: 26` -> cutWidth 20.
  sketch.silhouette(
    pathOf(heartPoints(372, 58, 1.2, 48), {
      fill: TEA_PALETTE.red,
      stroke: TEA_PALETTE.ink,
      strokeWidth: 6,
    }),
    { cutWidth: 20 },
  );
};

export const TEA_ART_GROUP_TWO: Readonly<
  Record<"receipts" | "watching" | "unbothered" | "mwah", TeaArt>
> = {
  receipts: drawReceipts,
  watching: drawWatching,
  unbothered: drawUnbothered,
  mwah: drawMwah,
};

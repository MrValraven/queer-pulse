import { heartPoints, type Point } from "../../kit/curves";
import { ellipseOf, lineOf, pathOf } from "../../kit/shapes";
import type { StickerSketch } from "../../kit/stickerSketch";
import type { Primitive } from "../../primitives";
import { BLIP_COLORS, type BlipAntenna, type BlipFrame } from "../blip.params";

/**
 * Blip's antenna: its trace shape and tip are the pose's mood. Ported from
 * the antenna `switch` in `renderBlip` (blip-reference.mjs lines 101-136).
 * `droopLeft` is the Facepalm-only mood; Facepalm is parked, so it is not
 * part of `BlipAntenna` and is not handled here.
 */

const ANTENNA_SCALE = 1.5;
const TRACE_STROKE_WIDTH = 12;
/** Reference underlay stroke-width 38 minus the trace's own stroke-width 12
 *  (blip-reference.mjs line 121, 124). */
const TRACE_CUT_WIDTH = 26;

const TIP_RADIUS = 21;
const TIP_STROKE_WIDTH = 8;
/** `whiteUnderlayOf` keeps the circle's own radius and centres a stroke of
 *  (own stroke 8 + cutWidth) on its edge, so the white disc's outer edge
 *  sits at radius 21 + (8 + cutWidth) / 2. The reference's white disc is
 *  r = tipR + 15 = 36 (line 123), so cutWidth solves
 *  21 + (8 + cutWidth) / 2 = 36, giving 22. */
const TIP_CUT_WIDTH = 22;

const HEART_TIP_SCALE = 1.9;
const HEART_TIP_STROKE_WIDTH = 7;
/** Reference underlay stroke-width 30 minus the heart tip's own stroke-width
 *  7 (blip-reference.mjs lines 123, 126): same heart shape, restroked. */
const HEART_TIP_CUT_WIDTH = 23;

const SPARK_TICK_ANGLES_DEG = [-150, -95, -35];
const SPARK_TICK_INNER_RADIUS = 32;
const SPARK_TICK_OUTER_RADIUS = 50;
const SPARK_TICK_STROKE_WIDTH = 8;
/** Reference underlay stroke-width 26 minus the tick's own stroke-width 8
 *  (blip-reference.mjs lines 133-134). */
const SPARK_TICK_CUT_WIDTH = 18;
const MOODS_WITH_SPARK_TICKS: readonly BlipAntenna[] = [
  "spike",
  "exclaim",
  "angry",
];

const TIP_COLOR_BY_ANTENNA: Record<BlipAntenna, string> = {
  steady: BLIP_COLORS.coral,
  spike: BLIP_COLORS.spark,
  heart: BLIP_COLORS.heart,
  droop: BLIP_COLORS.sadTip,
  wave: BLIP_COLORS.coral,
  question: BLIP_COLORS.coral,
  exclaim: BLIP_COLORS.spark,
  angry: BLIP_COLORS.angryTip,
};

interface AntennaShape {
  localTracePoints: readonly Point[];
  localTip: Point;
}

function steadyShape(): AntennaShape {
  return {
    localTracePoints: [
      [0, 6],
      [0, -40],
      [10, -40],
      [18, -64],
      [28, -26],
      [36, -46],
      [46, -46],
    ],
    localTip: [60, -46],
  };
}

/** `spike` and `angry` share one trace (blip-reference.mjs line 109). */
function spikeShape(): AntennaShape {
  return {
    localTracePoints: [
      [0, 6],
      [0, -40],
      [8, -40],
      [16, -92],
      [26, -18],
      [34, -80],
      [44, -48],
      [50, -48],
    ],
    localTip: [64, -48],
  };
}

function heartShape(): AntennaShape {
  return {
    localTracePoints: [
      [0, 6],
      [0, -40],
      [10, -40],
      [18, -60],
      [26, -30],
      [34, -44],
      [42, -44],
    ],
    localTip: [58, -46],
  };
}

const DROOP_ARC_STEPS = 16;
const DROOP_ARC_RADIUS = 24;
const DROOP_ARC_CENTER_Y = -30;
const DROOP_TIP_X_OFFSET = 4;
const DROOP_TIP_Y_OFFSET = 14;

/** The smoothed hook: a 16-step arc from straight up, sweeping right and
 *  down (blip-reference.mjs line 112, the `droop` case). */
function droopShape(): AntennaShape {
  const points: Point[] = [
    [0, 6],
    [0, DROOP_ARC_CENTER_Y],
  ];
  let lastPoint: Point = [0, DROOP_ARC_CENTER_Y];
  for (let stepIndex = 0; stepIndex <= DROOP_ARC_STEPS; stepIndex += 1) {
    const angle = Math.PI + (stepIndex / DROOP_ARC_STEPS) * Math.PI * 1.3;
    const point: Point = [
      DROOP_ARC_RADIUS + Math.cos(angle) * DROOP_ARC_RADIUS,
      DROOP_ARC_CENTER_Y + Math.sin(angle) * DROOP_ARC_RADIUS,
    ];
    points.push(point);
    lastPoint = point;
  }
  return {
    localTracePoints: points,
    localTip: [
      lastPoint[0] + DROOP_TIP_X_OFFSET,
      lastPoint[1] + DROOP_TIP_Y_OFFSET,
    ],
  };
}

const WAVE_STEPS = 10;

function waveShape(): AntennaShape {
  const points: Point[] = [
    [0, 6],
    [0, -40],
  ];
  for (let stepIndex = 1; stepIndex <= WAVE_STEPS; stepIndex += 1) {
    points.push([stepIndex * 5, -40 - Math.sin(stepIndex / 1.6) * 6]);
  }
  return { localTracePoints: points, localTip: [62, -40] };
}

const QUESTION_HOOK_STEPS = 14;
const QUESTION_HOOK_RADIUS = 18;
const QUESTION_HOOK_CENTER_Y = -60;

function questionShape(): AntennaShape {
  const points: Point[] = [
    [0, 6],
    [0, -44],
  ];
  for (let stepIndex = 0; stepIndex <= QUESTION_HOOK_STEPS; stepIndex += 1) {
    const angle = Math.PI + (stepIndex / QUESTION_HOOK_STEPS) * Math.PI * 1.45;
    points.push([
      QUESTION_HOOK_RADIUS + Math.cos(angle) * QUESTION_HOOK_RADIUS,
      QUESTION_HOOK_CENTER_Y + Math.sin(angle) * QUESTION_HOOK_RADIUS,
    ]);
  }
  return { localTracePoints: points, localTip: [22, -100] };
}

function exclaimShape(): AntennaShape {
  return {
    localTracePoints: [
      [0, 6],
      [0, -86],
    ],
    localTip: [0, -104],
  };
}

function antennaShapeOf(antenna: BlipAntenna): AntennaShape {
  switch (antenna) {
    case "steady":
      return steadyShape();
    case "spike":
    case "angry":
      return spikeShape();
    case "heart":
      return heartShape();
    case "droop":
      return droopShape();
    case "wave":
      return waveShape();
    case "question":
      return questionShape();
    case "exclaim":
      return exclaimShape();
  }
}

/** Local antenna-space point to canvas space: scale 1.5 from
 *  (antennaX, antennaY) (blip-reference.mjs line 104). */
function antennaPoint(frame: BlipFrame, local: Point): Point {
  return [
    frame.antennaX + local[0] * ANTENNA_SCALE,
    frame.antennaY + local[1] * ANTENNA_SCALE,
  ];
}

interface TipPaint {
  primitive: Primitive;
  cutWidth: number;
}

function tipPaintOf(tip: Point, antenna: BlipAntenna): TipPaint {
  const tipColor = TIP_COLOR_BY_ANTENNA[antenna];
  if (antenna === "heart") {
    return {
      primitive: pathOf(heartPoints(tip[0], tip[1], HEART_TIP_SCALE), {
        fill: tipColor,
        stroke: BLIP_COLORS.ink,
        strokeWidth: HEART_TIP_STROKE_WIDTH,
      }),
      cutWidth: HEART_TIP_CUT_WIDTH,
    };
  }
  return {
    primitive: ellipseOf(tip[0], tip[1], TIP_RADIUS, TIP_RADIUS, {
      fill: tipColor,
      stroke: BLIP_COLORS.ink,
      strokeWidth: TIP_STROKE_WIDTH,
    }),
    cutWidth: TIP_CUT_WIDTH,
  };
}

function sparkTickPoints(tip: Point, angleDeg: number): [Point, Point] {
  const radians = (angleDeg * Math.PI) / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  return [
    [
      tip[0] + cosine * SPARK_TICK_INNER_RADIUS,
      tip[1] + sine * SPARK_TICK_INNER_RADIUS,
    ],
    [
      tip[0] + cosine * SPARK_TICK_OUTER_RADIUS,
      tip[1] + sine * SPARK_TICK_OUTER_RADIUS,
    ],
  ];
}

/** Port of `renderBlip`'s antenna trace, tip and spark ticks
 *  (blip-reference.mjs lines 101-136), in the reference's paint order. */
export function drawBlipAntenna(
  sketch: StickerSketch,
  frame: BlipFrame,
  antenna: BlipAntenna,
): void {
  const shape = antennaShapeOf(antenna);
  const tracePoints = shape.localTracePoints.map((point) =>
    antennaPoint(frame, point),
  );
  const tip = antennaPoint(frame, shape.localTip);

  sketch.silhouette(lineOf(tracePoints, BLIP_COLORS.ink, TRACE_STROKE_WIDTH), {
    cutWidth: TRACE_CUT_WIDTH,
  });

  const tipPaint = tipPaintOf(tip, antenna);
  sketch.silhouette(tipPaint.primitive, { cutWidth: tipPaint.cutWidth });

  if (MOODS_WITH_SPARK_TICKS.includes(antenna)) {
    for (const angleDeg of SPARK_TICK_ANGLES_DEG) {
      sketch.silhouette(
        lineOf(
          sparkTickPoints(tip, angleDeg),
          BLIP_COLORS.ink,
          SPARK_TICK_STROKE_WIDTH,
        ),
        { cutWidth: SPARK_TICK_CUT_WIDTH },
      );
    }
  }
}

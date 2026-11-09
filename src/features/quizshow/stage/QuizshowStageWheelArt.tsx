import type { Ref } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  QUIZSHOW_WHEEL_RADII,
  QUIZSHOW_WHEEL_VIEWBOX,
} from "./quizshowWheelGeometry";
import styles from "./QuizshowStageWheel.module.css";

/* The still layers of the stage wheel, drawn in the approved mockup's units.
   Every colour comes from a class reading a --qs-wheel-* token; no layer uses
   a filter blur (contract 7.4): glows are gradients or translucent strokes. */

/** The halo's gradient stops along its radius: clear at r 102.6, the token at r 109, clear at r 114. */
const RIM_HALO_CLEAR_INNER_OFFSET = 0.9;
const RIM_HALO_PEAK_OFFSET = 0.956;
const RIM_STROKE = 1.1;
const RIM_LINE_STROKE = 0.6;
const RIM_FILL_INNER_OFFSET = 0.86;
const HUB_RING_STROKE = 1.2;
const HUB_LINE_STROKE = 0.5;
const HUB_COUNT_Y = -1.5;
const HUB_COUNT_FONT_SIZE = 13;
const HUB_LABEL_Y = 9;
const HUB_LABEL_FONT_SIZE = 4.4;
const HUB_LABEL_LETTER_SPACING = 0.8;

/** The pointer at 9 o'clock, from the mockup: the blade, its highlight and the pivot dot. */
const POINTER_BLADE_PATH =
  "M-95.5 0 L-114 -7.2 Q-124 -7.4 -125 0 Q-124 7.4 -114 7.2 Z";
const POINTER_HIGHLIGHT_PATH = "M-99 -1.2 L-113 -5.4";
const POINTER_HIGHLIGHT_STROKE = 0.8;
const POINTER_PIVOT = { x: -118.5, radius: 2 } as const;
/** A still glow under the blade in place of the mockup's drop shadow filter. */
const POINTER_HALO = { x: -110, y: 1.5, radiusX: 17, radiusY: 10 } as const;

/** Gradient ids for one wheel; `idPrefix` comes from useId so two wheels never share one. */
function wheelGradientId(idPrefix: string, name: string): string {
  return `${idPrefix}-${name}`;
}

function gradientUrl(idPrefix: string, name: string): string {
  return `url(#${wheelGradientId(idPrefix, name)})`;
}

/** The ring behind the disc: a soft gradient halo, the rim with its gradient edge and the inner line. */
export function QuizshowWheelRim({ idPrefix }: { idPrefix: string }) {
  return (
    <svg
      className={styles.layer}
      viewBox={QUIZSHOW_WHEEL_VIEWBOX}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id={wheelGradientId(idPrefix, "rim-stroke")}
          x1="0"
          y1="-1"
          x2="0"
          y2="1"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0" className={styles.rimStrokeStart} />
          <stop offset="0.5" className={styles.rimStrokeMid} />
          <stop offset="1" className={styles.rimStrokeEnd} />
        </linearGradient>
        <radialGradient id={wheelGradientId(idPrefix, "rim-halo")}>
          <stop
            offset={RIM_HALO_CLEAR_INNER_OFFSET}
            className={styles.rimHaloClear}
          />
          <stop offset={RIM_HALO_PEAK_OFFSET} className={styles.rimHaloPeak} />
          <stop offset="1" className={styles.rimHaloClear} />
        </radialGradient>
        <radialGradient id={wheelGradientId(idPrefix, "rim-fill")}>
          <stop
            offset={RIM_FILL_INNER_OFFSET}
            className={styles.rimFillInner}
          />
          <stop offset="1" className={styles.rimFillOuter} />
        </radialGradient>
      </defs>
      <circle
        r={QUIZSHOW_WHEEL_RADII.rimHalo}
        fill={gradientUrl(idPrefix, "rim-halo")}
        data-quizshow-wheel-rim-halo=""
      />
      <circle
        r={QUIZSHOW_WHEEL_RADII.rimFill}
        fill={gradientUrl(idPrefix, "rim-fill")}
        stroke={gradientUrl(idPrefix, "rim-stroke")}
        strokeWidth={RIM_STROKE}
      />
      <circle
        className={styles.rimLine}
        r={QUIZSHOW_WHEEL_RADII.rimLine}
        strokeWidth={RIM_LINE_STROKE}
      />
    </svg>
  );
}

/** The slim pointer; the frame loop kicks it through `ref` as each peg passes. */
export function QuizshowWheelPointer({
  idPrefix,
  ref,
}: {
  idPrefix: string;
  ref: Ref<SVGGElement>;
}) {
  return (
    <g ref={ref} className={styles.pointer} data-quizshow-wheel-pointer="">
      <path
        d={POINTER_BLADE_PATH}
        fill={gradientUrl(idPrefix, "pointer-fill")}
      />
      <path
        className={styles.pointerHighlight}
        d={POINTER_HIGHLIGHT_PATH}
        strokeWidth={POINTER_HIGHLIGHT_STROKE}
      />
      <circle
        className={styles.pointerPivot}
        cx={POINTER_PIVOT.x}
        cy={0}
        r={POINTER_PIVOT.radius}
      />
    </g>
  );
}

function OverlayGradients({ idPrefix }: { idPrefix: string }) {
  return (
    <defs>
      <radialGradient id={wheelGradientId(idPrefix, "depth")}>
        <stop offset="0.7" className={styles.depthClear} />
        <stop offset="1" className={styles.depthShade} />
      </radialGradient>
      <linearGradient
        id={wheelGradientId(idPrefix, "sheen")}
        x1="0.15"
        y1="0"
        x2="0.6"
        y2="0.75"
      >
        <stop offset="0" className={styles.sheenLight} />
        <stop offset="0.55" className={styles.sheenClear} />
      </linearGradient>
      <radialGradient
        id={wheelGradientId(idPrefix, "hub-fill")}
        cx="0.35"
        cy="0.3"
      >
        <stop offset="0" className={styles.hubInner} />
        <stop offset="1" className={styles.hubOuter} />
      </radialGradient>
      <linearGradient
        id={wheelGradientId(idPrefix, "hub-ring")}
        x1="0"
        y1="0"
        x2="1"
        y2="1"
      >
        <stop offset="0" className={styles.hubRingStart} />
        <stop offset="0.5" className={styles.hubRingMid} />
        <stop offset="1" className={styles.hubRingEnd} />
      </linearGradient>
      <linearGradient
        id={wheelGradientId(idPrefix, "pointer-fill")}
        x1="0"
        y1="0"
        x2="1"
        y2="0"
      >
        <stop offset="0" className={styles.pointerStart} />
        <stop offset="1" className={styles.pointerEnd} />
      </linearGradient>
      <radialGradient id={wheelGradientId(idPrefix, "pointer-halo")}>
        <stop offset="0" className={styles.pointerHaloCore} />
        <stop offset="1" className={styles.pointerHaloClear} />
      </radialGradient>
    </defs>
  );
}

/**
 * Glass over the turning disc: the depth shade and the sheen, the hub with
 * the slices left, and the pointer on its still halo.
 */
export function QuizshowWheelOverlay({
  idPrefix,
  drawnCount,
  pointerRef,
}: {
  idPrefix: string;
  drawnCount: number;
  pointerRef: Ref<SVGGElement>;
}) {
  const { t } = useTranslation();
  return (
    <svg
      className={styles.layer}
      viewBox={QUIZSHOW_WHEEL_VIEWBOX}
      aria-hidden="true"
      focusable="false"
    >
      <OverlayGradients idPrefix={idPrefix} />
      <circle
        r={QUIZSHOW_WHEEL_RADII.slice}
        fill={gradientUrl(idPrefix, "depth")}
      />
      <circle
        r={QUIZSHOW_WHEEL_RADII.slice}
        fill={gradientUrl(idPrefix, "sheen")}
      />
      <circle
        r={QUIZSHOW_WHEEL_RADII.hub}
        fill={gradientUrl(idPrefix, "hub-fill")}
        stroke={gradientUrl(idPrefix, "hub-ring")}
        strokeWidth={HUB_RING_STROKE}
      />
      <circle
        className={styles.rimLine}
        r={QUIZSHOW_WHEEL_RADII.hubLine}
        strokeWidth={HUB_LINE_STROKE}
      />
      <text
        className={styles.hubCount}
        y={HUB_COUNT_Y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={HUB_COUNT_FONT_SIZE}
        data-quizshow-wheel-hub-count=""
      >
        {drawnCount}
      </text>
      <text
        className={styles.hubLabel}
        y={HUB_LABEL_Y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={HUB_LABEL_FONT_SIZE}
        letterSpacing={HUB_LABEL_LETTER_SPACING}
      >
        {t("quizshow:stage.wheel.hubLeft")}
      </text>
      <ellipse
        cx={POINTER_HALO.x}
        cy={POINTER_HALO.y}
        rx={POINTER_HALO.radiusX}
        ry={POINTER_HALO.radiusY}
        fill={gradientUrl(idPrefix, "pointer-halo")}
      />
      <QuizshowWheelPointer idPrefix={idPrefix} ref={pointerRef} />
    </svg>
  );
}

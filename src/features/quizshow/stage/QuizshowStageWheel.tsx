import { useId, useRef, useState, type Ref } from "react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowLanguage,
  QuizshowWheelSlice,
  QuizshowWheelSpin,
} from "../../../shared/contracts/quizshow";
import { serverNow } from "../realtime/quizshowClock";
import {
  wheelSliceTones,
  wheelSpinLandsAt,
  type QuizshowWheelSliceTone,
} from "../quizshowWheel";
import {
  QUIZSHOW_WHEEL_RADII,
  QUIZSHOW_WHEEL_VIEWBOX,
  wheelLabelFit,
  wheelPegPoints,
  wheelSliceGeometries,
  type QuizshowWheelSliceGeometry,
} from "./quizshowWheelGeometry";
import { QUIZSHOW_WHEEL_PANEL_DELAY_MS } from "./quizshowWheelMotion";
import type { QuizshowStageSize } from "./quizshowText";
import {
  wheelSliceTitleOf,
  type QuizshowRoundKindRows,
} from "./quizshowWheelCopy";
import {
  QuizshowWheelOverlay,
  QuizshowWheelRim,
} from "./QuizshowStageWheelArt";
import { useQuizshowWheelClock } from "./useQuizshowWheelClock";
import {
  useQuizshowWheelSpin,
  wheelSpinIdentity,
} from "./useQuizshowWheelSpin";
import styles from "./QuizshowStageWheel.module.css";

export interface QuizshowStageWheelProps {
  /** The drawn slices: `wheel.slices` with `isPlayed` false, running order (use `drawnWheelSlicesOf`). */
  slices: readonly QuizshowWheelSlice[];
  /** The session's round rows, so a blank slice title reads "Round N". */
  rounds: QuizshowRoundKindRows;
  /** null rests the wheel at 0 degrees (every view with no spin rests there, contract 4.5). */
  spin: QuizshowWheelSpin | null;
  clockOffsetMs: number;
  language: QuizshowLanguage;
  size: QuizshowStageSize;
}

const SIZE_CLASS: Record<QuizshowStageSize, string | undefined> = {
  screen: styles.screen,
  phone: styles.phone,
  preview: styles.preview,
};

const TONE_STOP_CLASS: Record<
  QuizshowWheelSliceTone,
  { inner: string | undefined; outer: string | undefined }
> = {
  plum: { inner: styles.plumInner, outer: styles.plumOuter },
  rose: { inner: styles.roseInner, outer: styles.roseOuter },
  bonus: { inner: styles.bonusInner, outer: styles.bonusOuter },
  bonusAlt: { inner: styles.bonusAltInner, outer: styles.bonusAltOuter },
};
const SLICE_TONES: readonly QuizshowWheelSliceTone[] = [
  "plum",
  "rose",
  "bonus",
  "bonusAlt",
];

const SLICE_EDGE_STROKE = 0.5;
/** Two stacked glow strokes under the winner line: wide and faint, then narrow and brighter. */
const WINNER_GLOW_WIDE_STROKE = 5;
const WINNER_GLOW_NEAR_STROKE = 2.5;
const WINNER_STROKE = 0.9;
const LABEL_LETTER_SPACING = 0.1;
const LABEL_TITLE_Y_WITH_BONUS = -2.2;
const BONUS_LINE_X = 0.4;
const BONUS_LINE_Y = 7;
const BONUS_LINE_FONT_SIZE = 5;
const BONUS_LINE_LETTER_SPACING = 0.3;
const PEG_EDGE_STROKE = 0.5;

/** The tone gradient's id inside one wheel; `idPrefix` comes from useId. */
function toneGradientId(idPrefix: string, tone: QuizshowWheelSliceTone) {
  return `${idPrefix}-tone-${tone}`;
}

/** True when the spin has already stopped by the clock right now (contract 7.3). */
function isLandingPast(
  spin: QuizshowWheelSpin | null,
  clockOffsetMs: number,
): boolean {
  if (spin === null) return false;
  return serverNow(Date.now(), clockOffsetMs) >= wheelSpinLandsAt(spin);
}

/**
 * Whether the landing shows, and whether the spin had already stopped when
 * this wheel first saw it (a mount, attach or reconnect after the stop, even
 * inside the panel delay): that one shows at once with no fade (contract 7.3).
 */
function useWheelLanding(
  spin: QuizshowWheelSpin | null,
  clockOffsetMs: number,
): { isLanded: boolean; isLandedOnArrival: boolean } {
  const clock = useQuizshowWheelClock(
    spin,
    clockOffsetMs,
    QUIZSHOW_WHEEL_PANEL_DELAY_MS,
  );
  const spinIdentity = wheelSpinIdentity(spin);
  const [arrival, setArrival] = useState(() => ({
    spinIdentity,
    isLanded: isLandingPast(spin, clockOffsetMs),
  }));
  let isLandedOnArrival = arrival.isLanded;
  // A new spin: judge its arrival now, during render, so the first paint is right.
  if (arrival.spinIdentity !== spinIdentity) {
    isLandedOnArrival = isLandingPast(spin, clockOffsetMs);
    setArrival({ spinIdentity, isLanded: isLandedOnArrival });
  }
  return {
    isLanded: isLandedOnArrival || clock.isLanded,
    isLandedOnArrival,
  };
}

function WheelSliceLabel({
  slice,
  rounds,
  geometry,
  language,
  shouldShowBonusLine,
}: {
  slice: QuizshowWheelSlice;
  rounds: QuizshowRoundKindRows;
  geometry: QuizshowWheelSliceGeometry;
  language: QuizshowLanguage;
  shouldShowBonusLine: boolean;
}) {
  const { t } = useTranslation();
  const fit = wheelLabelFit(wheelSliceTitleOf(slice, rounds, language, t));
  // Without the bonus line the title stays centred in the slice.
  const hasBonus = shouldShowBonusLine && slice.wheelBonus > 0;
  const { labelPoint, labelRotation } = geometry;
  return (
    <g
      transform={`translate(${labelPoint.x} ${labelPoint.y}) rotate(${labelRotation})`}
    >
      <text
        className={styles.label}
        x={0}
        y={hasBonus ? LABEL_TITLE_Y_WITH_BONUS : 0}
        dominantBaseline="middle"
        fontSize={fit.fontSize}
        letterSpacing={LABEL_LETTER_SPACING}
      >
        {fit.text}
      </text>
      {hasBonus ? (
        <text
          className={styles.bonusLabel}
          x={BONUS_LINE_X}
          y={BONUS_LINE_Y}
          dominantBaseline="middle"
          fontSize={BONUS_LINE_FONT_SIZE}
          letterSpacing={BONUS_LINE_LETTER_SPACING}
        >
          {t("quizshow:stage.wheel.sliceBonus", { points: slice.wheelBonus })}
        </text>
      ) : null}
    </g>
  );
}

/** The turning layer: one gradient per tone, the slices with labels and winner outline, then the pegs. */
function WheelSpinnerLayer({
  slices,
  rounds,
  winnerSliceIndex,
  idPrefix,
  language,
  shouldShowBonusLine,
  spinnerRef,
}: {
  slices: readonly QuizshowWheelSlice[];
  rounds: QuizshowRoundKindRows;
  winnerSliceIndex: number | null;
  idPrefix: string;
  language: QuizshowLanguage;
  shouldShowBonusLine: boolean;
  spinnerRef: Ref<SVGSVGElement>;
}) {
  const geometries = wheelSliceGeometries(slices.length);
  const tones = wheelSliceTones(slices);
  const pegPoints = wheelPegPoints(slices.length);
  return (
    <svg
      ref={spinnerRef}
      className={`${styles.layer} ${styles.spinner}`}
      viewBox={QUIZSHOW_WHEEL_VIEWBOX}
      aria-hidden="true"
      focusable="false"
      data-quizshow-wheel-spinner=""
    >
      <defs>
        {SLICE_TONES.map((tone) => (
          <radialGradient
            key={tone}
            id={toneGradientId(idPrefix, tone)}
            gradientUnits="userSpaceOnUse"
            cx="0"
            cy="0"
            r={QUIZSHOW_WHEEL_RADII.slice}
          >
            <stop offset="0.2" className={TONE_STOP_CLASS[tone].inner} />
            <stop offset="1" className={TONE_STOP_CLASS[tone].outer} />
          </radialGradient>
        ))}
      </defs>
      {slices.map((slice, sliceIndex) => {
        const geometry = geometries[sliceIndex];
        if (geometry === undefined) return null;
        const toneId = toneGradientId(idPrefix, tones[sliceIndex] ?? "plum");
        return (
          <g
            key={slice.roundIndex}
            className={styles.slice}
            data-slice-index={sliceIndex}
            data-winner={String(sliceIndex === winnerSliceIndex)}
          >
            <path d={geometry.path} fill={`url(#${toneId})`} />
            <path
              className={styles.sliceEdge}
              d={geometry.path}
              strokeWidth={SLICE_EDGE_STROKE}
            />
            <g className={styles.winnerOutline}>
              <path
                className={styles.winnerGlowWide}
                d={geometry.winnerPath}
                strokeWidth={WINNER_GLOW_WIDE_STROKE}
              />
              <path
                className={styles.winnerGlowNear}
                d={geometry.winnerPath}
                strokeWidth={WINNER_GLOW_NEAR_STROKE}
              />
              <path
                className={styles.winnerLine}
                d={geometry.winnerPath}
                strokeWidth={WINNER_STROKE}
              />
            </g>
            <WheelSliceLabel
              slice={slice}
              rounds={rounds}
              geometry={geometry}
              language={language}
              shouldShowBonusLine={shouldShowBonusLine}
            />
          </g>
        );
      })}
      {pegPoints.map((pegPoint, pegIndex) => (
        <circle
          // Pegs are fixed positions on the slice boundaries; the index is their identity.
          key={pegIndex}
          className={styles.peg}
          cx={pegPoint.x}
          cy={pegPoint.y}
          r={QUIZSHOW_WHEEL_RADII.pegDot}
          strokeWidth={PEG_EDGE_STROKE}
          data-quizshow-wheel-peg=""
        />
      ))}
    </svg>
  );
}

/**
 * The Pulse Live wheel disc, shared by the TV, the player phone, the remote's
 * preview and the studio. Three stacked layers: the still rim, the spinner
 * that the frame loop turns from the server clock, and the still glass with
 * the hub and the pointer. On the landing the other slices dim and the winner
 * gets its outline.
 */
export function QuizshowStageWheel({
  slices,
  rounds,
  spin,
  clockOffsetMs,
  language,
  size,
}: QuizshowStageWheelProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const idPrefix = `quizshow-wheel-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const spinnerRef = useRef<SVGSVGElement | null>(null);
  const pointerRef = useRef<SVGGElement | null>(null);
  // Defensive: a caller handing the whole view's slices still draws only the drawn ones.
  const drawnSlices = slices.filter((slice) => !slice.isPlayed);
  const drawnCount = drawnSlices.length;
  const { isLanded, isLandedOnArrival } = useWheelLanding(spin, clockOffsetMs);

  useQuizshowWheelSpin({
    spinnerRef,
    pointerRef,
    spin,
    drawnCount,
    clockOffsetMs,
    isReducedMotion: reducedMotion,
  });

  const winnerSliceIndex =
    spin !== null && isLanded ? spin.landedSliceIndex : null;

  return (
    <div
      className={`${styles.wheel} ${SIZE_CLASS[size] ?? ""}`}
      role="img"
      aria-label={t("quizshow:stage.wheel.ariaLabel", { count: drawnCount })}
      data-quizshow-wheel=""
      data-landed={String(isLanded)}
      data-landed-on-arrival={String(isLandedOnArrival)}
      data-reduced-motion={String(reducedMotion)}
      data-size={size}
    >
      <div className={styles.disc}>
        <QuizshowWheelRim idPrefix={idPrefix} />
        <WheelSpinnerLayer
          slices={drawnSlices}
          rounds={rounds}
          winnerSliceIndex={winnerSliceIndex}
          idPrefix={idPrefix}
          language={language}
          // The phone shows the bonus in its own chip; its small disc line
          // would sit below the contrast floor, so the disc leaves it out.
          shouldShowBonusLine={size !== "phone"}
          spinnerRef={spinnerRef}
        />
        <QuizshowWheelOverlay
          idPrefix={idPrefix}
          drawnCount={drawnCount}
          pointerRef={pointerRef}
        />
      </div>
    </div>
  );
}

import type { CSSProperties, KeyboardEvent } from "react";
import { useFormat } from "../../../shared/i18n/format";
import { intlLocale } from "../../../shared/i18n/locale";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { formatVjLoopTime, type VjLoopSpan } from "./vjLoopPlayhead";
import styles from "./VjClipPlayback.module.css";

/** Pointer drags move in 10 ms steps; the keyboard moves 100 ms an arrow
 *  press and a second a Page key, so a long clip stays quick to cross. */
const POINTER_STEP_MS = 10;
const KEY_STEP_MS = 100;
const PAGE_STEP_MS = 1000;

/** The change a key makes to a handle, or null for a key it leaves alone. */
function keyTargetOf(
  key: string,
  valueMs: number,
  durationMs: number,
): number | null {
  switch (key) {
    case "ArrowLeft":
    case "ArrowDown":
      return valueMs - KEY_STEP_MS;
    case "ArrowRight":
    case "ArrowUp":
      return valueMs + KEY_STEP_MS;
    case "PageDown":
      return valueMs - PAGE_STEP_MS;
    case "PageUp":
      return valueMs + PAGE_STEP_MS;
    case "Home":
      return 0;
    case "End":
      return durationMs;
    default:
      return null;
  }
}

interface VjLoopScrubberProps {
  durationMs: number;
  span: VjLoopSpan;
  onMove: (which: "in" | "out", ms: number) => void;
  onRelease: () => void;
  describedBy?: string;
}

/**
 * The loop points on one track: two native range inputs laid over each other,
 * so each handle is a real slider for the keyboard and screen readers. Only
 * the thumbs take the pointer, so both stay grabbable where they meet.
 */
export function VjLoopScrubber({
  durationMs,
  span,
  onMove,
  onRelease,
  describedBy,
}: VjLoopScrubberProps) {
  const { t, language } = useTranslation();
  const format = useFormat();
  const locale = intlLocale(language);
  const valueTextOf = (ms: number) =>
    t("vj:playback.loopPointValue", {
      seconds: format.number(ms / 1000, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
    });
  const fractionOf = (ms: number) =>
    durationMs > 0 ? Math.min(Math.max(ms / durationMs, 0), 1) : 0;
  // Where the handles meet, the one with room to move sits on top.
  const isStartRaised = durationMs - span.outMs < span.inMs;

  const trackStyle = {
    "--vj-loop-in": fractionOf(span.inMs),
    "--vj-loop-out": fractionOf(span.outMs),
  } as CSSProperties;

  return (
    <div className={styles.scrubber}>
      <div className={styles.handles} style={trackStyle}>
        <div className={styles.track} aria-hidden="true">
          <div className={styles.trackSpan} />
        </div>
        <VjLoopHandle
          which="in"
          valueMs={span.inMs}
          durationMs={durationMs}
          label={t("vj:playback.loopStart")}
          valueText={valueTextOf(span.inMs)}
          describedBy={describedBy}
          isRaised={isStartRaised}
          onMove={onMove}
          onRelease={onRelease}
        />
        <VjLoopHandle
          which="out"
          valueMs={span.outMs}
          durationMs={durationMs}
          label={t("vj:playback.loopEnd")}
          valueText={valueTextOf(span.outMs)}
          describedBy={describedBy}
          isRaised={false}
          onMove={onMove}
          onRelease={onRelease}
        />
      </div>
      <div className={styles.readouts} aria-hidden="true">
        <span>{formatVjLoopTime(span.inMs, locale)}</span>
        <span className={styles.readoutLength}>
          {t("vj:playback.loopLength", {
            length: formatVjLoopTime(span.outMs - span.inMs, locale),
          })}
        </span>
        <span>{formatVjLoopTime(span.outMs, locale)}</span>
      </div>
    </div>
  );
}

interface VjLoopHandleProps {
  which: "in" | "out";
  valueMs: number;
  durationMs: number;
  label: string;
  valueText: string;
  describedBy?: string;
  isRaised: boolean;
  onMove: (which: "in" | "out", ms: number) => void;
  onRelease: () => void;
}

/** One handle: a native range input over the shared track. */
function VjLoopHandle({
  which,
  valueMs,
  durationMs,
  label,
  valueText,
  describedBy,
  isRaised,
  onMove,
  onRelease,
}: VjLoopHandleProps) {
  const moveByKey = (event: KeyboardEvent<HTMLInputElement>) => {
    const targetMs = keyTargetOf(event.key, valueMs, durationMs);
    if (targetMs === null) return;
    event.preventDefault();
    onMove(which, targetMs);
  };

  return (
    <input
      type="range"
      className={styles.handle}
      min={0}
      max={durationMs}
      step={POINTER_STEP_MS}
      value={valueMs}
      aria-label={label}
      aria-valuetext={valueText}
      aria-describedby={describedBy}
      data-handle={which}
      data-raised={isRaised || undefined}
      onChange={(event) => onMove(which, Number(event.currentTarget.value))}
      onKeyDown={moveByKey}
      onKeyUp={onRelease}
      onPointerUp={onRelease}
      onPointerCancel={onRelease}
      onBlur={onRelease}
    />
  );
}

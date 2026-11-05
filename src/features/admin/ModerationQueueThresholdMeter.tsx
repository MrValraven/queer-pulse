import type { ModerationQueueThresholdBandDTO } from "./api/moderationHealth.api";
import { readThresholdMeter } from "./moderationQueueThresholdScale";
import styles from "./ModerationQueueHealth.module.css";

const LEVEL_FILL_CLASS = {
  calm: styles.meterFillCalm,
  warning: styles.meterFillWarning,
  critical: styles.meterFillCritical,
} as const;

/**
 * How close one figure sits to its warning and critical levels, as a track
 * with a fill and two ticks.
 *
 * Hidden from assistive technology on purpose: the threshold note beside it
 * says the same thing in words, and the fill colour is reinforcement on top of
 * that note and the severity chip.
 */
export function ModerationQueueThresholdMeter({
  value,
  band,
}: {
  value: number;
  band: ModerationQueueThresholdBandDTO;
}) {
  const reading = readThresholdMeter(value, band);
  return (
    <div className={styles.meter} aria-hidden>
      <div className={styles.meterTrack}>
        <div
          className={[styles.meterFill, LEVEL_FILL_CLASS[reading.level]].join(
            " ",
          )}
          style={{ transform: `scaleX(${reading.fillFraction})` }}
        />
      </div>
      <span
        className={[styles.meterTick, styles.meterTickWarning].join(" ")}
        style={{ left: `${reading.warningPosition * 100}%` }}
      />
      <span
        className={[styles.meterTick, styles.meterTickCritical].join(" ")}
        style={{ left: `${reading.criticalPosition * 100}%` }}
      />
    </div>
  );
}

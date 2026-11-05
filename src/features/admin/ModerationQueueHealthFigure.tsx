import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ModerationQueueThresholdBandDTO } from "./api/moderationHealth.api";
import { thresholdNote } from "./moderationQueueThresholdNote";
import { ModerationQueueThresholdMeter } from "./ModerationQueueThresholdMeter";
import styles from "./ModerationQueueHealth.module.css";

/**
 * One of the three figures a queue's severity is decided on, read at a glance:
 * the reading large, a meter showing how close it sits to its levels, and the
 * threshold note (`thresholdNote`) that says the same in words.
 *
 * `measured` is absent when the reading is a statement (an empty queue has no
 * longest wait), so the figure shows that statement quietly and draws the
 * meter only for readings measured against a level. A measured reading rolls
 * to its new value on a refresh; `measured.reading` sets the roll direction.
 */
export function ModerationQueueHealthFigure({
  label,
  value,
  measured,
}: {
  label: string;
  value: string;
  measured?: {
    reading: number;
    band: ModerationQueueThresholdBandDTO;
  };
}) {
  const { t } = useTranslation();
  const format = useFormat();
  return (
    <div className={styles.figure}>
      <dt className={styles.figureLabel}>{label}</dt>
      <dd
        className={[styles.figureValue, !measured && styles.figureValueMuted]
          .filter(Boolean)
          .join(" ")}
      >
        {measured ? (
          <RollingNumber value={value} numericValue={measured.reading} />
        ) : (
          value
        )}
      </dd>
      {measured && (
        <dd className={styles.figureBand}>
          <ModerationQueueThresholdMeter
            value={measured.reading}
            band={measured.band}
          />
          <span className={styles.figureNote}>
            {thresholdNote(
              measured.reading,
              measured.band,
              (level) => format.number(level),
              t,
            )}
          </span>
        </dd>
      )}
    </div>
  );
}

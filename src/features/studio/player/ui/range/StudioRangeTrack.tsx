import type { StudioRangeFractionSpan } from "./studioRange.types";
import styles from "./StudioRangeTrack.module.css";

interface StudioRangeTrackProps {
  tickFractions?: readonly number[];
  bufferedSpans?: readonly StudioRangeFractionSpan[];
}

/** The default rail: buffered spans, hover ghost, fill, chapter ticks and thumb. */
export function StudioRangeTrack({
  tickFractions,
  bufferedSpans,
}: StudioRangeTrackProps) {
  return (
    <div className={styles.track} aria-hidden="true">
      <div className={styles.rail}>
        {bufferedSpans?.map((span) => (
          <span
            key={`${span.startFraction}-${span.endFraction}`}
            className={styles.buffered}
            style={{
              insetInlineStart: `${span.startFraction * 100}%`,
              inlineSize: `${Math.max(0, span.endFraction - span.startFraction) * 100}%`,
            }}
          />
        ))}
        <span className={styles.ghost} />
        <span className={styles.fill} />
        {tickFractions?.map((fraction, index) => (
          <span
            key={`${fraction}-${index}`}
            className={styles.tick}
            data-chapter-tick=""
            style={{ insetInlineStart: `${fraction * 100}%` }}
          />
        ))}
      </div>
      <div className={styles.thumbRail}>
        <span className={styles.thumb} />
      </div>
    </div>
  );
}

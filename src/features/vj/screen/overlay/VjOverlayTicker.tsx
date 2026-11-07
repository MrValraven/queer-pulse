import type { CSSProperties, JSX } from "react";
import { cx } from "../../../../shared/lib/cx";
import styles from "./VjOverlay.module.css";

const TICKER_BASE_SECONDS = 12;
const TICKER_SECONDS_PER_CHARACTER = 0.15;

/** One ticker pass: 12 s plus 0.15 s for every character (v1 timing). */
function vjTickerDurationSeconds(text: string): number {
  const characterCount = Array.from(text).length;
  const seconds =
    TICKER_BASE_SECONDS + TICKER_SECONDS_PER_CHARACTER * characterCount;
  return Math.round(seconds * 100) / 100;
}

/**
 * The ticker line: it enters at the right edge and leaves at the left, looping.
 * Static on the remote's mirror, where a crawl that small cannot be read.
 */
export function VjOverlayTicker({
  text,
  isStatic,
}: {
  text: string;
  isStatic: boolean;
}): JSX.Element {
  if (isStatic) {
    return <p className={cx(styles.tickerText, styles.tickerStatic)}>{text}</p>;
  }
  const durationSeconds = vjTickerDurationSeconds(text);
  const trackStyle = {
    "--vj-ticker-duration": `${durationSeconds}s`,
  } as CSSProperties;
  return (
    <p className={styles.tickerText}>
      <span
        className={styles.tickerTrack}
        style={trackStyle}
        data-vj-ticker-seconds={durationSeconds}
      >
        {text}
      </span>
    </p>
  );
}

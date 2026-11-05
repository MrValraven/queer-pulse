import type { CSSProperties, JSX } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import type { VjOverlay } from "../../../shared/contracts/vj";
import { cx } from "../../../shared/lib/cx";
import styles from "./VjStage.module.css";

interface VjOverlayTextProps {
  overlay: VjOverlay;
  size: "screen" | "mirror";
}

const OVERLAY_FADE_SECONDS = 0.4;
const TICKER_BASE_SECONDS = 12;
const TICKER_SECONDS_PER_CHARACTER = 0.15;

/** One ticker pass: 12 s plus 0.15 s for every character. */
function vjTickerDurationSeconds(text: string): number {
  const characterCount = Array.from(text).length;
  const seconds =
    TICKER_BASE_SECONDS + TICKER_SECONDS_PER_CHARACTER * characterCount;
  return Math.round(seconds * 100) / 100;
}

function VjTickerLine({
  text,
  isStatic,
}: {
  text: string;
  isStatic: boolean;
}): JSX.Element {
  if (isStatic) return <p className={styles.tickerText}>{text}</p>;
  const trackStyle = {
    "--vj-ticker-duration": `${vjTickerDurationSeconds(text)}s`,
  } as CSSProperties;
  return (
    <p className={styles.tickerText}>
      <span
        className={styles.tickerTrack}
        style={trackStyle}
        data-vj-ticker-seconds={vjTickerDurationSeconds(text)}
      >
        {text}
      </span>
    </p>
  );
}

/**
 * The overlay line: "big" centred in Fraunces, or a "ticker" crossing the
 * bottom of the screen. Show, hide and a new line fade (0.4 s opacity). The
 * projector keeps that timing always; the remote's mirror follows the
 * reduced-motion preference.
 */
export function VjOverlayText({
  overlay,
  size,
}: VjOverlayTextProps): JSX.Element {
  const { reducedMotion } = useMotionPrefs();
  const isMirror = size === "mirror";
  const text = overlay.text.trim();
  const isShown = overlay.isVisible && text !== "";
  const fadeSeconds = isMirror && reducedMotion ? 0 : OVERLAY_FADE_SECONDS;
  return (
    <div
      className={cx(styles.overlay, isMirror && styles.overlayMirror)}
      data-vj-overlay=""
    >
      <AnimatePresence mode="wait" initial={false}>
        {isShown ? (
          <m.div
            key={`${overlay.style}:${text}`}
            className={
              overlay.style === "big" ? styles.overlayBig : styles.overlayTicker
            }
            data-vj-overlay-style={overlay.style}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: fadeSeconds, ease: "linear" }}
          >
            {overlay.style === "big" ? (
              <p className={styles.bigText}>{text}</p>
            ) : (
              <VjTickerLine text={text} isStatic={isMirror} />
            )}
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

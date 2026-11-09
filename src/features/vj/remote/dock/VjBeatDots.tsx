import { useCallback, useEffect, useRef } from "react";
import type { VjBeatPosition, VjTempo } from "../../../../shared/contracts/vj";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useVjBeatTicker } from "../hooks/useVjBeatTicker";
import type { VjRemoteClock } from "../hooks/useVjRemoteClock";
import styles from "./VjDockRows.module.css";

const VJ_BEAT_DOT_INDEXES = [0, 1, 2, 3] as const;

export interface VjBeatDotsProps {
  tempo: VjTempo | null;
  clock: VjRemoteClock;
  /** The help caption's id while help is on; read while the dots show as an
   *  image (the clock still syncing), since the ticking dots are hidden. */
  describedBy?: string;
}

/**
 * Four dots on the synced clock, the first one the "1" of the bar. The beat
 * ticker writes `data-beat` on the container through a ref, so the beat costs
 * no React render, and the lit dot grows through a CSS transform. Only the
 * dots move: the rest of the remote stays still. Under reduced motion no dot
 * moves and the beat number (1 to 4) shows instead. The dots read hollow
 * until the clock has synced with the screens.
 */
export function VjBeatDots({ tempo, clock, describedBy }: VjBeatDotsProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const containerRef = useRef<HTMLSpanElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const shownBeatRef = useRef<number | null>(null);
  const isTicking = clock.isSynced && tempo !== null;

  const handleFrame = useCallback((position: VjBeatPosition) => {
    if (position.beatInBar === shownBeatRef.current) return;
    shownBeatRef.current = position.beatInBar;
    containerRef.current?.setAttribute("data-beat", String(position.beatInBar));
    if (numberRef.current !== null) {
      numberRef.current.textContent = String(position.beatInBar + 1);
    }
  }, []);

  useVjBeatTicker({ clock, tempo, onFrame: handleFrame, isEnabled: isTicking });

  // A stopped ticker or a switch between dots and number starts the
  // container over, so the next frame writes the beat afresh.
  useEffect(() => {
    shownBeatRef.current = null;
    if (!isTicking) containerRef.current?.removeAttribute("data-beat");
  }, [isTicking, reducedMotion]);

  const syncingLabel = clock.isSynced ? undefined : t("vj:tempo.syncing");
  return (
    <span
      ref={containerRef}
      className={styles.beatDots}
      data-vj-beat-dots=""
      data-synced={String(clock.isSynced)}
      data-reduced-motion={reducedMotion ? "true" : undefined}
      role={clock.isSynced ? undefined : "img"}
      aria-label={syncingLabel}
      aria-describedby={clock.isSynced ? undefined : describedBy}
      aria-hidden={clock.isSynced ? true : undefined}
      title={syncingLabel}
    >
      {reducedMotion ? (
        <span ref={numberRef} className={styles.beatNumber} />
      ) : (
        VJ_BEAT_DOT_INDEXES.map((dotIndex) => (
          <span
            key={dotIndex}
            className={styles.beatDot}
            data-vj-beat-dot={dotIndex}
          />
        ))
      )}
    </span>
  );
}

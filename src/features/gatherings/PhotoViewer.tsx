import { useCallback, useEffect, useRef, useState } from "react";
import {
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiPlay,
  FiPause,
} from "react-icons/fi";
import { useScrollLock, usePrefersReducedMotion } from "../../shared/hooks";
import type { Pic } from "./gatheringPhotos.data";
import styles from "./PhotoViewer.module.css";

const AUTO_MS = 3200;

export function PhotoViewer({
  pics,
  startIndex,
  slideshow = false,
  onClose,
}: {
  pics: Pic[];
  startIndex: number;
  slideshow?: boolean;
  onClose: () => void;
}) {
  useScrollLock();
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(startIndex);
  // Auto-advance only starts on for slideshow, and never when reduced motion is on.
  const [playing, setPlaying] = useState(slideshow && !reduced);
  const timer = useRef<number | null>(null);

  const go = useCallback(
    (dir: number) => setIndex((i) => (i + dir + pics.length) % pics.length),
    [pics.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  useEffect(() => {
    if (!playing || reduced) return;
    timer.current = window.setInterval(() => go(1), AUTO_MS);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [playing, reduced, go]);

  const pic = pics[index]!;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.topbar}>
        <span className={styles.counter}>
          {index + 1} / {pics.length}
        </span>
        <div className={styles.topActions}>
          {!reduced && (
            <button
              type="button"
              className={styles.iconBtn}
              aria-pressed={playing}
              aria-label={playing ? "Pause slideshow" : "Play slideshow"}
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? <FiPause /> : <FiPlay />}
            </button>
          )}
          <button
            type="button"
            className={styles.iconBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>
      </div>

      <div className={styles.stage}>
        <button
          type="button"
          className={styles.nav}
          onClick={() => go(-1)}
          aria-label="Previous photo"
        >
          <FiChevronLeft />
        </button>

        <div className={[styles.frame, styles[pic.tint]].join(" ")}>
          {pic.tag && (
            <span
              className={[styles.tag, pic.tagAccent && styles.tagAccent]
                .filter(Boolean)
                .join(" ")}
            >
              {pic.tag}
            </span>
          )}
          <span className={styles.frameLabel}>{pic.label}</span>
          <div className={styles.progress}>
            {pics.map((_, i) => (
              <span
                key={i}
                className={[styles.dot, i === index && styles.dotActive]
                  .filter(Boolean)
                  .join(" ")}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          className={styles.nav}
          onClick={() => go(1)}
          aria-label="Next photo"
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useScrollLock } from "../../hooks";
import { useTranslation } from "../../i18n/useTranslation";
import styles from "./StagedLoader.module.css";

/**
 * How long the work gets to finish before the overlay appears at all. A warm
 * cache, a back-navigation, or a fast connection settles well inside this, and
 * flashing a full-screen take-over for 120ms reads as a glitch. Anything slower
 * than this was going to be a visible wait either way, and the checklist is
 * better than a half-painted page.
 */
const GRACE_MS = 200;
/** Fade-out duration. Keep in sync with the CSS opacity transition. */
const EXIT_MS = 420;

function CheckIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12.5l4 4L19 7"
        stroke="var(--jade)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface StagedLoaderProps {
  /** Whether the underlying work is still running. */
  isActive: boolean;
  /** Translation keys, in order, one per stage. */
  steps: readonly string[];
  /** Index of the stage currently running. Everything before it reads as done. */
  activeIndex: number;
  /** Heading above the checklist (a translation key). */
  titleKey: string;
  /** Italic line under the checklist (a translation key). */
  captionKey: string;
  /** Screen-reader label for the overlay (a translation key). */
  ariaLabelKey: string;
}

/**
 * A full-screen checklist take-over for work that happens in visible stages —
 * fetch, then assemble, then wait on media. Generalised out of `RoomLoader`,
 * which does the same thing for the post-sign-in moment but reads its state
 * straight from the auth context; this one is driven entirely by props, so any
 * page can hold its own reveal.
 *
 * Two behaviours matter more than the visuals. It does not mount until
 * `GRACE_MS` of `isActive` have passed, so fast loads show nothing at all. And
 * it portals to `document.body`: a `position: fixed` scrim rendered inside a
 * transformed ancestor is trapped by that ancestor's containing block and
 * covers only part of the viewport.
 */
export function StagedLoader({
  isActive,
  steps,
  activeIndex,
  titleKey,
  captionKey,
  ariaLabelKey,
}: StagedLoaderProps) {
  const { t } = useTranslation();
  // `isMounted` keeps the overlay in the tree through its fade-out; `isShown`
  // drives the opacity transition (false on mount and again during exit).
  const [isMounted, setIsMounted] = useState(false);
  const [isShown, setIsShown] = useState(false);
  useScrollLock(isMounted);

  useEffect(() => {
    if (isActive) {
      let fadeFrame = 0;
      // Hold the grace period first. Only work that outlives it earns a loader.
      const graceTimer = window.setTimeout(() => {
        setIsMounted(true);
        fadeFrame = requestAnimationFrame(() => setIsShown(true));
      }, GRACE_MS);
      return () => {
        window.clearTimeout(graceTimer);
        cancelAnimationFrame(fadeFrame);
      };
    }
    const fadeFrame = requestAnimationFrame(() => setIsShown(false));
    const unmountTimer = window.setTimeout(() => setIsMounted(false), EXIT_MS);
    return () => {
      cancelAnimationFrame(fadeFrame);
      window.clearTimeout(unmountTimer);
    };
  }, [isActive]);

  if (!isMounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={[styles.overlay, isShown ? styles.shown : ""]
        .filter(Boolean)
        .join(" ")}
      role="status"
      aria-live="polite"
      aria-label={t(ariaLabelKey)}
    >
      <div className={styles.inner}>
        <h2 className={styles.title}>{t(titleKey)}</h2>
        <ul className={styles.steps}>
          {steps.map((stepKey, stepIndex) => {
            const state =
              stepIndex < activeIndex
                ? "done"
                : stepIndex === activeIndex
                  ? "active"
                  : "pending";
            return (
              <li
                key={stepKey}
                className={[styles.step, styles[state]].join(" ")}
              >
                <span className={styles.icon} aria-hidden>
                  {state === "done" ? (
                    <CheckIcon />
                  ) : state === "active" ? (
                    <span className={styles.spinner} />
                  ) : (
                    <span className={styles.pendingDot} />
                  )}
                </span>
                {t(stepKey)}
              </li>
            );
          })}
        </ul>
        <p className={styles.caption}>{t(captionKey)}</p>
      </div>
    </div>,
    document.body,
  );
}

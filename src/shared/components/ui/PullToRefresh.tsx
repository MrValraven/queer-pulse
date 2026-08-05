import { type ReactNode } from "react";
import { m, useTransform } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/MotionProvider";
import { usePullToRefresh, DEFAULT_THRESHOLD_PX } from "./usePullToRefresh";
import { Spinner } from "./Spinner";
import styles from "./PullToRefresh.module.css";

/**
 * Wraps a scrollable feed with a pull-to-refresh gesture. Dragging down from
 * the top of the container slides the content down (transform-only, driven
 * by a `MotionValue` — no per-frame React state) to uncover a jade arrow
 * indicator; releasing past the threshold swaps it for a spinning `Spinner`
 * and calls `onRefresh`. Purely a progressive enhancement: the feed's normal
 * data path (initial fetch, a query refetch, an explicit "Try again" on
 * error) is the non-gesture equivalent that still gets the same fresh data —
 * this only adds the gesture shortcut on top of it.
 *
 * Under `prefers-reduced-motion`, the content never visibly slides and the
 * threshold arrow is skipped — only the coarse `refreshing` state appears
 * (the `Spinner`, whose own CSS already runs a slower spin under reduced
 * motion). The gesture mechanics (engage-at-top, threshold, `onRefresh`) are
 * identical either way.
 */
export function PullToRefresh({
  onRefresh,
  disabled,
  scrollable,
  children,
}: {
  onRefresh: () => Promise<unknown>;
  disabled?: boolean;
  /** Establish an internal scroll container (`overflow-y: auto; height: 100%`)
   *  for a `fullHeight` layout whose rows overflow THIS wrapper rather than the
   *  window — currently only Messages' thread list. Omit on window-scrolled
   *  pages: an internal scroller there sub-pixel-traps the page's own scroll. */
  scrollable?: boolean;
  children: ReactNode;
}) {
  const { reducedMotion } = useMotionPrefs();
  const { pull, refreshing, bind } = usePullToRefresh({ onRefresh, disabled });

  const contentY = useTransform(pull, (value) => (reducedMotion ? 0 : value));
  const arrowOpacity = useTransform(pull, [0, DEFAULT_THRESHOLD_PX], [0, 1]);
  const arrowRotate = useTransform(pull, [0, DEFAULT_THRESHOLD_PX], [0, 180]);

  return (
    <div
      className={[styles.container, scrollable && styles.scrollable]
        .filter(Boolean)
        .join(" ")}
      {...bind}
    >
      <div className={styles.indicator}>
        {refreshing && <Spinner className={styles.spinnerJade} />}
        {!refreshing && !reducedMotion && (
          <m.span
            className={styles.arrow}
            style={{ opacity: arrowOpacity, rotate: arrowRotate }}
          />
        )}
      </div>
      <m.div className={styles.content} style={{ y: contentY }}>
        {children}
      </m.div>
      <span className="visuallyHidden" role="status" aria-live="polite">
        {refreshing ? "Refreshing…" : ""}
      </span>
    </div>
  );
}

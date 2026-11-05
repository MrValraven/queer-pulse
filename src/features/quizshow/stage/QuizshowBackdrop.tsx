import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import styles from "./QuizshowBackdrop.module.css";

export type QuizshowBackdropVariant = "stage" | "phone" | "studio";

interface QuizshowBackdropProps {
  variant: QuizshowBackdropVariant;
}

/**
 * The velvet backdrop behind every Pulse Live surface. It is an `aria-hidden`
 * layer that fills its parent, so the parent sets `position: relative` and
 * `isolation: isolate`.
 *
 * - `stage`: three colour fields and a swaying spotlight (TV, previews).
 * - `phone`: two fields, slower drift, with the spotlight kept.
 * - `studio`: one faint field, no spotlight.
 *
 * Fields and spotlight move by `transform` only, and hold still under reduced
 * motion.
 */
export function QuizshowBackdrop({ variant }: QuizshowBackdropProps) {
  const { reducedMotion } = useMotionPrefs();
  const hasRose = variant === "stage";
  const hasCoral = variant !== "studio";
  const hasSpot = variant !== "studio";

  return (
    <div
      className={`${styles.root} ${reducedMotion ? styles.still : ""}`}
      data-variant={variant}
      aria-hidden="true"
    >
      {hasCoral ? <div className={`${styles.field} ${styles.coral}`} /> : null}
      <div className={`${styles.field} ${styles.plum}`} />
      {hasRose ? <div className={`${styles.field} ${styles.rose}`} /> : null}
      <div className={styles.veil} />
      {hasSpot ? <div className={styles.spot} /> : null}
      <div className={styles.grain} />
    </div>
  );
}

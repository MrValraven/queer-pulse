import { m } from "motion/react";
import { FiCheck } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import styles from "./QuizshowPlayer.module.css";

const WAIT_DOT_KEYS = ["first", "second", "third"] as const;

/** Three dots that breathe one after another: waiting, calmly. Still under reduced motion. */
export function QuizshowWaitDots() {
  const { reducedMotion } = useMotionPrefs();
  return (
    <span className={styles.waitDots} aria-hidden="true">
      {WAIT_DOT_KEYS.map((dotKey, dotIndex) =>
        reducedMotion ? (
          <span key={dotKey} className={styles.waitDot} />
        ) : (
          <m.span
            key={dotKey}
            className={styles.waitDot}
            animate={{ opacity: [0.25, 0.9, 0.25], scale: [0.85, 1, 0.85] }}
            transition={{
              duration: 1.8,
              ease: "easeInOut",
              repeat: Infinity,
              delay: dotIndex * 0.3,
            }}
          />
        ),
      )}
    </span>
  );
}

/** The answer is in: a jade check, the words, and a calm wait. No count, since players hold none.
 *  Pair it with `QuizshowLockedStatus`, which is mounted before the lock and so is always announced. */
export function QuizshowLockedPanel({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    // The caller keeps a persistent status region that says the lock; this panel is for the eye.
    <div className={styles.locked}>
      <span className={styles.lockedMark} aria-hidden="true">
        <FiCheck fill="none" />
      </span>
      <span className={styles.lockedText}>
        <span className={styles.lockedTitle}>{title}</span>
        <span className={styles.lockedBody}>{body}</span>
      </span>
      <QuizshowWaitDots />
    </div>
  );
}

/** A status region mounted before the lock, empty until the answer locks, so the words are read out. */
export function QuizshowLockedStatus({ text }: { text: string | null }) {
  return (
    <span role="status" className={styles.visuallyHidden}>
      {text ?? ""}
    </span>
  );
}

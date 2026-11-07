import type { JSX } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { VjMirrorRing as VjMirrorRingValue } from "../rules/vjMirrorRing";
import { vjMirrorRingCopy } from "./vjMirrorStyle";
import styles from "./VjMirror.module.css";

/** The ring's radius in its 28 unit box, leaving room for the stroke. */
const VJ_RING_RADIUS = 12;
/** The app's ease token (--ease) and fast duration (--dur-fast). */
const VJ_RING_FADE = { duration: 0.15, ease: [0.22, 0.68, 0.16, 1] as const };

export interface VjMirrorRingProps {
  ring: VjMirrorRingValue;
}

/**
 * The 28px countdown ring beside the mirror: coral while a quantized change
 * waits for its applyAt, muted while the shuffle counts to its next clip. The
 * stroke fills as the change comes closer and the seconds sit inside. The
 * spoken label counts whole seconds, so the status region changes at most
 * once a second.
 */
export function VjMirrorRing({ ring }: VjMirrorRingProps): JSX.Element {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const copy = vjMirrorRingCopy(ring);
  const progress = ring.kind === "none" ? 0 : ring.progress;
  const seconds = copy === null ? null : Number(copy.values.seconds);

  return (
    <div className={styles.ringSlot} data-vj-mirror-ring={ring.kind}>
      <AnimatePresence initial={false}>
        {ring.kind !== "none" ? (
          <m.svg
            key="ring"
            className={styles.ring}
            data-kind={ring.kind}
            viewBox="0 0 28 28"
            aria-hidden="true"
            focusable="false"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={reducedMotion ? { duration: 0 } : VJ_RING_FADE}
          >
            <circle
              className={styles.ringTrack}
              cx="14"
              cy="14"
              r={VJ_RING_RADIUS}
              fill="none"
            />
            <circle
              className={styles.ringFill}
              cx="14"
              cy="14"
              r={VJ_RING_RADIUS}
              fill="none"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={1 - progress}
              transform="rotate(-90 14 14)"
              data-vj-ring-progress={progress.toFixed(2)}
            />
            <text
              className={styles.ringSeconds}
              x="14"
              y="14"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {seconds}
            </text>
          </m.svg>
        ) : null}
      </AnimatePresence>
      <p className="visuallyHidden" role="status">
        {copy === null ? "" : t(copy.key, copy.values)}
      </p>
    </div>
  );
}

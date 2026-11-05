import { useRef } from "react";
import { m } from "motion/react";
import { FiActivity } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { registerVjTap } from "../live/vjTapTempo";
import styles from "./VjSheets.module.css";

/** Taps before this many do not send: the first two only start the count. */
const TAPS_BEFORE_FIRST_SEND = 2;
/** At most one tempo sent per this many milliseconds. */
const TAP_SEND_MIN_GAP_MS = 250;

/**
 * Tap tempo: tap along with the beat. Each tap after the second hands the
 * averaged tempo to onTempo, at most once every 250 ms. Each press answers
 * with a small squeeze (none under reduced motion).
 */
export function VjTapTempoButton({
  onTempo,
  isBlocked,
}: {
  onTempo: (bpm: number) => void;
  isBlocked: boolean;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const tapTimesRef = useRef<number[]>([]);
  const lastSentAtRef = useRef<number | null>(null);

  const handleTap = () => {
    if (isBlocked) return;
    const now = Date.now();
    const { tapTimes, bpm } = registerVjTap(tapTimesRef.current, now);
    tapTimesRef.current = tapTimes;
    if (bpm === null || tapTimes.length <= TAPS_BEFORE_FIRST_SEND) return;
    const lastSentAt = lastSentAtRef.current;
    if (lastSentAt !== null && now - lastSentAt < TAP_SEND_MIN_GAP_MS) return;
    lastSentAtRef.current = now;
    onTempo(bpm);
  };

  return (
    <m.button
      type="button"
      className={styles.tapButton}
      aria-disabled={isBlocked}
      whileTap={reducedMotion || isBlocked ? undefined : { scale: 0.95 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      onClick={handleTap}
    >
      <FiActivity aria-hidden fill="none" />
      {t("vj:shuffle.tapTempo")}
    </m.button>
  );
}

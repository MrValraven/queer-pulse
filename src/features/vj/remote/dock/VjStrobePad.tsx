/**
 * The strobe pad, always first in the row (design 7). It runs the same press
 * machine as the effect pads, sending "on" and "off" for `padId: "strobe"`;
 * the dispatcher sends `setStrobe` and asks for flash consent first. While
 * the strobe runs, a small ring in the top-left corner (across from the
 * flash mark) counts down the seconds left of the server's 10 s cap from
 * `effects.strobeStartedAt`. The pad holds a steady
 * fill: the screens flash, the remote stays still.
 */
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { VJ_LIMITS, type VjEffects } from "../../../../shared/contracts/vj";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useVjPadPress } from "../hooks/useVjPadPress";
import { useVjMidiLearnTarget } from "../midi/useVjMidiLearnTarget";
import { VjPadButton, type VjPadSendHandler } from "./VjEffectPad";
import { useVjShortLabel, vjPadLabelKey } from "./vjPadLabel";
import styles from "./VjPads.module.css";

/** How often the countdown redraws. */
const VJ_STROBE_TICK_MS = 250;
/** The ring's radius inside its 20 by 20 box, leaving room for the stroke. */
const VJ_STROBE_RING_RADIUS = 8.5;

/** Milliseconds left of the strobe's cap, clamped to 0..strobeMaxDurationMs. */
function vjStrobeMsLeft(
  strobeStartedAt: number | null,
  serverNow: number,
): number {
  if (strobeStartedAt === null) return VJ_LIMITS.strobeMaxDurationMs;
  const leftMs = VJ_LIMITS.strobeMaxDurationMs - (serverNow - strobeStartedAt);
  return Math.min(VJ_LIMITS.strobeMaxDurationMs, Math.max(0, leftMs));
}

/** Synced server time, redrawn every 250 ms while the strobe counts down. */
function useVjStrobeNow(isCounting: boolean, serverNow: () => number): number {
  const serverNowRef = useRef(serverNow);
  useEffect(() => {
    serverNowRef.current = serverNow;
  });
  const [now, setNow] = useState(() => serverNow());
  useEffect(() => {
    if (!isCounting) return undefined;
    const readClock = () => setNow(serverNowRef.current());
    const firstRead = setTimeout(readClock, 0);
    const intervalId = setInterval(readClock, VJ_STROBE_TICK_MS);
    return () => {
      clearTimeout(firstRead);
      clearInterval(intervalId);
    };
  }, [isCounting]);
  return now;
}

/** The app's fast duration (--dur-fast) and ease (--ease). */
const VJ_COUNTDOWN_TRANSITION = {
  duration: 0.15,
  ease: [0.22, 0.68, 0.16, 1] as const,
};

function VjStrobeCountdown({ id, msLeft }: { id: string; msLeft: number }) {
  const { t } = useTranslation();
  const seconds = Math.ceil(msLeft / 1000);
  const share = msLeft / VJ_LIMITS.strobeMaxDurationMs;
  const { reducedMotion } = useMotionPrefs();
  return (
    <m.span
      className={styles.countdown}
      data-vj-strobe-countdown=""
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={reducedMotion ? { duration: 0 } : VJ_COUNTDOWN_TRANSITION}
    >
      <svg className={styles.countdownRing} viewBox="0 0 20 20" aria-hidden>
        <circle
          className={styles.countdownTrack}
          cx="10"
          cy="10"
          r={VJ_STROBE_RING_RADIUS}
        />
        <circle
          className={styles.countdownArc}
          cx="10"
          cy="10"
          r={VJ_STROBE_RING_RADIUS}
          pathLength={100}
          strokeDasharray="100"
          strokeDashoffset={String(100 - share * 100)}
        />
      </svg>
      <span className={styles.countdownSeconds} aria-hidden>
        {seconds}
      </span>
      <span id={id} className="visuallyHidden">
        {t("vj:effects.strobeRemaining", { seconds })}
      </span>
    </m.span>
  );
}

export interface VjStrobePadProps {
  effects: VjEffects;
  /** What the pad shows now (the optimistic value while a send waits). */
  isOn: boolean;
  isPending: boolean;
  isBlocked: boolean;
  onPadSend: VjPadSendHandler;
  /** Synced server epoch ms (`clock.serverNow`). */
  serverNow: () => number;
  /** The status line naming why the controls are blocked, for aria-describedby. */
  describedBy?: string;
}

export function VjStrobePad({
  effects,
  isOn,
  isPending,
  isBlocked,
  onPadSend,
  serverNow,
  describedBy,
}: VjStrobePadProps) {
  const { t } = useTranslation();
  const padRef = useRef<HTMLButtonElement>(null);
  const countdownId = useId();
  const { handlers, isPressed } = useVjPadPress({
    isOn,
    isBlocked,
    onSend: (send) => onPadSend("strobe", send, padRef.current),
    // The strobe has nothing to tune: its rate and length are fixed, so a
    // long hold of a running strobe still turns it off on release.
    onOpenTuner: () => undefined,
    isTunable: false,
  });
  const { learnProps } = useVjMidiLearnTarget({ kind: "pad", padId: "strobe" });
  const label = t("vj:effects.strobe");
  const shortLabel = useVjShortLabel(vjPadLabelKey("strobe"), label);
  const isCounting = effects.isStrobing && effects.strobeStartedAt !== null;
  const now = useVjStrobeNow(isCounting, serverNow);
  const msLeft = vjStrobeMsLeft(effects.strobeStartedAt, now);
  const describedByIds =
    [isCounting ? countdownId : null, describedBy].filter(Boolean).join(" ") ||
    undefined;
  return (
    <VjPadButton
      ref={padRef}
      padId="strobe"
      label={label}
      shortLabel={shortLabel}
      isOn={isOn}
      isPending={isPending}
      isBlocked={isBlocked}
      isPressed={isPressed}
      isFlashCapable
      isBeatSynced={false}
      handlers={handlers}
      learnProps={learnProps}
      describedBy={describedByIds}
    >
      <AnimatePresence initial={false}>
        {isCounting && (
          <VjStrobeCountdown key="countdown" id={countdownId} msLeft={msLeft} />
        )}
      </AnimatePresence>
    </VjPadButton>
  );
}

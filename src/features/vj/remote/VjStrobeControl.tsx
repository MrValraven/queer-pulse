import { useEffect, useId, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiAlertTriangle } from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button, Collapse } from "../../../shared/components/ui";
import { VJ_LIMITS, type VjEffects } from "../../../shared/contracts/vj";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { useVjCommandRunner } from "./useVjCommandRunner";
import { VjSheetAlert } from "./VjSheetAlert";
import { useVjStrobeConsent } from "./useVjStrobeConsent";
import styles from "./VjSheets.module.css";

type VjRun = ReturnType<typeof useVjCommandRunner>["run"];

/** How often the countdown redraws. */
const STROBE_COUNTDOWN_TICK_MS = 250;
const SWAP_EASE = [0.22, 0.68, 0.16, 1] as const;

/** Whole seconds left of the 10 s strobe, from when the server says it started, clamped to 0..10. */
function vjStrobeSecondsLeft(
  strobeStartedAt: number | null,
  now: number,
): number {
  const maxSeconds = VJ_LIMITS.strobeMaxDurationMs / 1000;
  if (strobeStartedAt === null) return maxSeconds;
  const leftMs = VJ_LIMITS.strobeMaxDurationMs - (now - strobeStartedAt);
  return Math.min(maxSeconds, Math.max(0, Math.ceil(leftMs / 1000)));
}

/** The countdown while strobe is on, redrawn every 250 ms. */
function useStrobeSecondsLeft(effects: VjEffects): number {
  const [now, setNow] = useState(() => Date.now());
  const isCounting = effects.isStrobing && effects.strobeStartedAt !== null;
  useEffect(() => {
    if (!isCounting) return undefined;
    const intervalId = window.setInterval(
      () => setNow(Date.now()),
      STROBE_COUNTDOWN_TICK_MS,
    );
    return () => window.clearInterval(intervalId);
  }, [isCounting, effects.strobeStartedAt]);
  return vjStrobeSecondsLeft(effects.strobeStartedAt, now);
}

/**
 * What the status region says: the seconds left when this strobe started
 * (or when this remote first saw it) and 0 once it runs out. The countdown in
 * between is drawn and stays quiet, so a screen reader hears only the start
 * and the end.
 */
function useAnnouncedStrobeSeconds(
  effects: VjEffects,
  secondsLeft: number,
): number | null {
  const [announcedStart, setAnnouncedStart] = useState<{
    strobeStartedAt: number | null;
    seconds: number;
  } | null>(null);
  const isNewStrobe =
    effects.isStrobing &&
    (announcedStart === null ||
      announcedStart.strobeStartedAt !== effects.strobeStartedAt);
  if (isNewStrobe) {
    setAnnouncedStart({
      strobeStartedAt: effects.strobeStartedAt,
      seconds: secondsLeft,
    });
  }
  if (!effects.isStrobing) return null;
  if (secondsLeft === 0) return 0;
  return isNewStrobe ? secondsLeft : (announcedStart?.seconds ?? secondsLeft);
}

/**
 * Strobe (design 6.4). The first Start strobe in a show opens the seizure
 * warning with Start strobe now; that second tap records consent and sends.
 * Later in the same show one tap sends. While on: Stop strobe and the seconds
 * left. Nothing here sets a rate: every screen caps it at 3 flashes a second.
 */
export function VjStrobeControl({
  effects,
  stageEpoch,
  run,
  isBlocked,
}: {
  effects: VjEffects;
  stageEpoch: string;
  run: VjRun;
  isBlocked: boolean;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { hasConsented, consent } = useVjStrobeConsent(stageEpoch);
  const titleId = useId();
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const secondsLeft = useStrobeSecondsLeft(effects);
  const announcedSeconds = useAnnouncedStrobeSeconds(effects, secondsLeft);
  const isHeld = isBlocked || isSending;
  const isWarningShown = isWarningOpen && !effects.isStrobing;

  const sendStrobe = async (isStrobing: boolean) => {
    setIsSending(true);
    const outcome = await run("setStrobe", isStrobing);
    setIsSending(false);
    setErrorKey(outcome.ok ? null : outcome.errorKey);
  };

  const handleStart = () => {
    if (isHeld) return;
    if (!hasConsented) {
      setIsWarningOpen(true);
      return;
    }
    void sendStrobe(true);
  };

  const handleConfirm = () => {
    if (isHeld) return;
    consent();
    setIsWarningOpen(false);
    void sendStrobe(true);
  };

  const handleStop = () => {
    if (isHeld) return;
    void sendStrobe(false);
  };

  const swapDuration = reducedMotion ? 0 : 0.15;
  return (
    <section className={styles.strobe} aria-labelledby={titleId}>
      <div className={styles.strobeHead}>
        <h4 id={titleId} className={styles.sectionTitle}>
          {t("vj:effects.strobe")}
        </h4>
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={effects.isStrobing ? "stop" : "start"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: swapDuration, ease: SWAP_EASE }}
          >
            {effects.isStrobing ? (
              <Button
                variant="stage"
                size="sm"
                aria-disabled={isHeld}
                onClick={handleStop}
              >
                {t("vj:effects.strobeStop")}
              </Button>
            ) : (
              <Button
                variant="stage-ghost"
                size="sm"
                aria-disabled={isHeld}
                aria-expanded={hasConsented ? undefined : isWarningShown}
                onClick={handleStart}
              >
                {t("vj:effects.strobeStart")}
              </Button>
            )}
          </m.div>
        </AnimatePresence>
      </div>
      <Collapse isOpen={effects.isStrobing}>
        <p className={styles.strobeRemaining} aria-hidden>
          {t("vj:effects.strobeRemaining", { seconds: secondsLeft })}
        </p>
      </Collapse>
      <p className={styles.visuallyHidden} role="status">
        {announcedSeconds === null
          ? ""
          : t("vj:effects.strobeRemaining", { seconds: announcedSeconds })}
      </p>
      <Collapse isOpen={isWarningShown}>
        <div className={styles.warning}>
          <p role="alert" className={styles.warningText}>
            <FiAlertTriangle
              aria-hidden
              fill="none"
              className={styles.warningIcon}
            />
            <span>{t("vj:effects.strobeWarning")}</span>
          </p>
          <Button
            variant="stage"
            aria-disabled={isHeld}
            onClick={handleConfirm}
          >
            {t("vj:effects.strobeConfirm")}
          </Button>
        </div>
      </Collapse>
      <p className={styles.hint}>{t("vj:effects.strobeHint")}</p>
      <VjSheetAlert errorKey={errorKey} />
    </section>
  );
}

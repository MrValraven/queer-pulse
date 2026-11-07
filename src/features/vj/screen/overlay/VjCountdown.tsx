import { useEffect, useState, type JSX } from "react";
import { AnimatePresence, m } from "motion/react";
import type { VjCountdown } from "../../../../shared/contracts/vj";
import { cx } from "../../../../shared/lib/cx";
import type { VjClockReader } from "../../engine/vjEngineLook";
import type { VjBesideCard, VjBesideLogo } from "./VjOverlayLine";
import { formatVjCountdown, vjCountdownSecondsLeft } from "./vjCountdownFormat";
import styles from "./VjOverlay.module.css";

const MS_PER_SECOND = 1000;

interface VjCountdownTick {
  targetAt: number;
  secondsLeft: number;
}

/**
 * Whole seconds left before `targetAt` on the synced clock. Each tick is a
 * timeout aimed at the next whole second before the target, so the digits
 * change on the second on every screen. Holds 0 from the target on.
 */
function useVjCountdownSecondsLeft(
  targetAt: number,
  clock: VjClockReader,
): number {
  const [tick, setTick] = useState<VjCountdownTick>(() => ({
    targetAt,
    secondsLeft: vjCountdownSecondsLeft(targetAt - clock.serverNow()),
  }));
  let current = tick;
  if (tick.targetAt !== targetAt) {
    current = {
      targetAt,
      secondsLeft: vjCountdownSecondsLeft(targetAt - clock.serverNow()),
    };
    setTick(current);
  }
  const { secondsLeft } = current;

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const nextSecondAt = targetAt - (secondsLeft - 1) * MS_PER_SECOND;
    const delayMs = Math.max(
      0,
      Math.ceil(clock.toLocalTime(nextSecondAt) - performance.now()),
    );
    const timeoutId = window.setTimeout(() => {
      setTick((previous) => {
        if (previous.targetAt !== targetAt) return previous;
        // The timeout was aimed at this second, so it always moves on by at
        // least one; the clock reading catches up a jump forward.
        const measured = vjCountdownSecondsLeft(targetAt - clock.serverNow());
        return {
          targetAt,
          secondsLeft: Math.min(previous.secondsLeft - 1, measured),
        };
      });
    }, delayMs);
    return () => window.clearTimeout(timeoutId);
  }, [targetAt, secondsLeft, clock]);

  return secondsLeft;
}

function VjCountdownFace({
  targetAt,
  label,
  clock,
}: {
  targetAt: number;
  label: string;
  clock: VjClockReader;
}): JSX.Element {
  const secondsLeft = useVjCountdownSecondsLeft(targetAt, clock);
  return (
    <>
      {label === "" ? null : (
        <p className={styles.countdownLabel} data-vj-countdown-label="">
          {label}
        </p>
      )}
      <p className={styles.countdownDigits} data-vj-countdown-digits="">
        {formatVjCountdown(secondsLeft * MS_PER_SECOND)}
      </p>
    </>
  );
}

export interface VjCountdownTimerProps {
  countdown: VjCountdown;
  clock: VjClockReader;
  /** Top unless the overlay line sits at the top. */
  placement: "top" | "bottom";
  fadeSeconds: number;
  /**
   * The shown event card a bottom countdown must keep clear of (the same
   * clearance the bottom line keeps). Null when the countdown is not at the
   * bottom or no card is shown.
   */
  besideCard?: VjBesideCard | null;
  /** The side of a logo in a bottom corner that a bottom countdown keeps clear. */
  besideLogo?: VjBesideLogo | null;
}

/**
 * The countdown: the label as an eyebrow over tabular digits. It reads 0:00 from
 * `targetAt` until the server hides it (`VJ_LIMITS.countdownHoldMs` later).
 */
export function VjCountdownTimer({
  countdown,
  clock,
  placement,
  fadeSeconds,
  besideCard = null,
  besideLogo = null,
}: VjCountdownTimerProps): JSX.Element {
  const targetAt = countdown.targetAt;
  const isShown = countdown.isVisible && targetAt !== null;
  // Making room for a card or logo fades the countdown out and back in beside
  // it, the way the line does, so the digits never jump sideways.
  const clearanceKey = [
    besideCard === null ? "" : `${besideCard.side}:${besideCard.kind}`,
    besideLogo ?? "",
  ].join("|");
  return (
    <AnimatePresence initial={false}>
      {isShown ? (
        <m.div
          key={`countdown:${targetAt}:${clearanceKey}`}
          className={cx(
            styles.countdownFrame,
            placement === "top" ? styles.countdownTop : styles.countdownBottom,
          )}
          data-vj-countdown={placement}
          data-vj-beside-card={besideCard?.side}
          data-vj-beside-card-kind={besideCard?.kind}
          data-vj-beside-logo={besideLogo ?? undefined}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: fadeSeconds, ease: "linear" }}
        >
          <VjCountdownFace
            targetAt={targetAt}
            label={countdown.label.trim()}
            clock={clock}
          />
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}

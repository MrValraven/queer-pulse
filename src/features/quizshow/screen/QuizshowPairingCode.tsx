import { useId, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Collapse, Spinner } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { SCREEN_EASE_OUT } from "./quizshowScreenMotion";
import styles from "./QuizshowPairingCode.module.css";

interface QuizshowPairingDigitsProps {
  /** The 6-digit code; null shows a spinner while it is on its way. */
  pairingCode: string | null;
  /** `compact` draws the digits smaller, for a corner of the stage. */
  size?: "full" | "compact";
}

/**
 * The code's glass digit tiles, or a spinner while the code is on its way.
 * The spinner fades into the code and one code into the next (reduced motion
 * swaps at once). Screen readers hear the digits one by one, so a host
 * reading the code aloud to the remote gets every digit.
 */
export function QuizshowPairingDigits({
  pairingCode,
  size = "full",
}: QuizshowPairingDigitsProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const digits = pairingCode === null ? [] : pairingCode.split("");
  return (
    <div className={styles.codeSlot} data-size={size}>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={pairingCode ?? "starting"}
          className={styles.codeFrame}
          initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.96 }}
          transition={{
            duration: reducedMotion ? 0 : 0.25,
            ease: SCREEN_EASE_OUT,
          }}
        >
          {pairingCode === null ? (
            <Spinner />
          ) : (
            <p className={styles.codeLine}>
              <span className="visuallyHidden">
                {t("quizshow:tv.codeLabel", { code: digits.join(" ") })}
              </span>
              <span className={styles.code} aria-hidden="true">
                {digits.map((digit, digitIndex) => (
                  // A digit can repeat, so its place in the code keys it.
                  <span key={digitIndex} className={styles.digit}>
                    {digit}
                  </span>
                ))}
              </span>
            </p>
          )}
        </m.div>
      </AnimatePresence>
    </div>
  );
}

interface QuizshowPairingCodeProps {
  /** The page's heading, such as "Show Pulse Live on this screen". */
  title: string;
  /** What to do with the code, such as "On your remote, tap Pair a screen and enter this code". */
  body: string;
  /** The 6-digit code; null shows a spinner while it is on its way. */
  pairingCode: string | null;
  /** Hide the code slot entirely (demo, a failed start). While a new code is on its way the slot shows a spinner. */
  isCodeHidden?: boolean;
  /** Status lines and actions under the code. */
  children?: ReactNode;
}

/**
 * The big pairing code a TV or a helper's phone shows (contract 6.5), with a
 * title and a body.
 */
export function QuizshowPairingCode({
  title,
  body,
  pairingCode,
  isCodeHidden = false,
  children,
}: QuizshowPairingCodeProps) {
  const titleId = useId();
  return (
    <section className={styles.panel} aria-labelledby={titleId}>
      <h1 id={titleId} className={styles.title}>
        {title}
      </h1>
      <p className={styles.body}>{body}</p>
      <Collapse isOpen={!isCodeHidden}>
        <QuizshowPairingDigits pairingCode={pairingCode} />
      </Collapse>
      {children}
    </section>
  );
}

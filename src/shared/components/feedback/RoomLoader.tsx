import { useEffect, useState } from "react";
import { useAuth } from "../../../app/providers/authContext";
import { useScrollLock } from "../../hooks";
import { useTranslation } from "../../i18n/useTranslation";
import { Translation } from "../../i18n/Translation";
import styles from "./RoomLoader.module.css";

const STEP_KEYS = [
  "shared:feedback.roomLoader.steps.signingIn",
  "shared:feedback.roomLoader.steps.gettingData",
  "shared:feedback.roomLoader.steps.preparingRoom",
];
const STEP_MS = 750;

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

/**
 * Full-screen plum take-over shown briefly after an explicit sign-in, while we
 * "get your data and prepare the room". Driven by `useAuth().preparing`; it runs
 * a short checklist sequence and then calls `endPreparing()` to dismiss itself.
 */
/** How long the fade-out lasts; keep in sync with the CSS opacity transition. */
const EXIT_MS = 520;

export function RoomLoader() {
  const { preparing, endPreparing } = useAuth();
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  // `mounted` keeps the overlay in the tree through its fade-out; `shown` drives
  // the opacity/transform transition (false on mount and during exit).
  const [mounted, setMounted] = useState(preparing);
  const [shown, setShown] = useState(false);
  useScrollLock(mounted);

  // Mount + reset on one frame, fade in on the next; fade out + unmount when
  // preparing ends. State changes run inside rAF/timeout callbacks (not the
  // effect body) so they don't fire synchronously during the effect.
  useEffect(() => {
    if (preparing) {
      let fadeRaf = 0;
      const mountRaf = requestAnimationFrame(() => {
        setMounted(true);
        setStep(0);
        fadeRaf = requestAnimationFrame(() => setShown(true));
      });
      return () => {
        cancelAnimationFrame(mountRaf);
        cancelAnimationFrame(fadeRaf);
      };
    }
    const fadeRaf = requestAnimationFrame(() => setShown(false));
    const t = window.setTimeout(() => setMounted(false), EXIT_MS);
    return () => {
      cancelAnimationFrame(fadeRaf);
      window.clearTimeout(t);
    };
  }, [preparing]);

  // Run the checklist sequence while preparing, then dismiss.
  useEffect(() => {
    if (!preparing) return;
    let current = 0;
    const id = window.setInterval(() => {
      current += 1;
      setStep(current);
      if (current >= STEP_KEYS.length) {
        window.clearInterval(id);
        window.setTimeout(endPreparing, 600);
      }
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, [preparing, endPreparing]);

  if (!mounted) return null;

  return (
    <div
      className={`${styles.overlay} ${shown ? styles.shown : ""}`}
      role="status"
      aria-live="polite"
      aria-label={t("shared:feedback.roomLoader.ariaLabel")}
    >
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.dot} aria-hidden />
          Queer<span className={styles.brandItalic}>Pulse</span>
        </div>

        <h2 className={styles.title}>
          <Translation
            i18nKey="shared:feedback.roomLoader.title"
            components={{ em: <em /> }}
          />
        </h2>

        <ul className={styles.steps}>
          {STEP_KEYS.map((stepKey, stepIndex) => {
            const state =
              stepIndex < step ? "done" : stepIndex === step ? "active" : "pending";
            return (
              <li key={stepKey} className={`${styles.step} ${styles[state]}`}>
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

        <p className={styles.caption}>{t("shared:feedback.roomLoader.caption")}</p>
      </div>
    </div>
  );
}

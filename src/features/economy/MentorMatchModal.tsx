import { useEffect, useState } from "react";
import { FiClock } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type Mode } from "./mentorship.data";
import {
  MenteeSteps,
  MentorSteps,
  MentorMatchSuccess,
} from "./MentorMatchSteps";
import styles from "./MentorshipPage.module.css";

export function MentorMatchModal({
  mode,
  onClose,
}: {
  mode: Mode;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  useScrollLock();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const [step, setStep] = useState(1);

  const total = mode === "mentee" ? 3 : 2;
  const done = step > total;
  const fill = done ? 100 : (step / total) * 100;

  return (
    <div
      className={styles.overlay}
      // Backdrop click is a mouse-only shortcut; Esc and the close button
      // already provide the keyboard path, so this div is not interactive.
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={
          mode === "mentee"
            ? t("economy:mentorship.match.findMentorAria")
            : t("economy:mentorship.match.becomeMentorAria")
        }
      >
        <button
          type="button"
          className={styles.modalClose}
          onClick={onClose}
          aria-label={t("economy:mentorship.match.closeAria")}
        >
          ×
        </button>
        {!demoMode ? (
          // No mentor-matching endpoint yet — an honest coming-soon rather than
          // walking the member through a wizard that fakes a match on submit.
          <div className={styles.mmSuccess}>
            <div className={styles.mmSuccessIcon}>
              <FiClock />
            </div>
            <div className={styles.mmTitle} style={{ fontSize: 24 }}>
              {t("economy:comingSoon.title")} {t("economy:comingSoon.em")}
            </div>
            <p className={styles.mmDesc}>{t("economy:comingSoon.body")}</p>
            <Button type="button" variant="ghost" onClick={onClose}>
              {t("economy:comingSoon.close")}
            </Button>
          </div>
        ) : (
          <>
            <div className={styles.mmBar}>
              <div
                className={styles.mmFill}
                style={{ transform: `scaleX(${fill / 100})` }}
              />
            </div>
            <div className={styles.mmLabel}>
              {done
                ? t("economy:mentorship.match.done")
                : t("economy:mentorship.match.stepOf", { step, total })}
            </div>

            {done ? (
              <MentorMatchSuccess mode={mode} onClose={onClose} />
            ) : mode === "mentee" ? (
              <MenteeSteps step={step} setStep={setStep} />
            ) : (
              <MentorSteps step={step} setStep={setStep} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

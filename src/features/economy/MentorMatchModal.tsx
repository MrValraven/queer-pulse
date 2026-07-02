import { useEffect, useState } from "react";
import { useScrollLock } from "../../shared/hooks";
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
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={mode === "mentee" ? "Find a mentor" : "Become a mentor"}
      >
        <button
          type="button"
          className={styles.modalClose}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className={styles.mmBar}>
          <div
            className={styles.mmFill}
            style={{ transform: `scaleX(${fill / 100})` }}
          />
        </div>
        <div className={styles.mmLabel}>
          {done ? "Done!" : `Step ${step} of ${total}`}
        </div>

        {done ? (
          <MentorMatchSuccess mode={mode} onClose={onClose} />
        ) : mode === "mentee" ? (
          <MenteeSteps step={step} setStep={setStep} />
        ) : (
          <MentorSteps step={step} setStep={setStep} />
        )}
      </div>
    </div>
  );
}

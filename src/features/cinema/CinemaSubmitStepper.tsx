import { FiCheck } from "react-icons/fi";
import { SUBMIT_STEPS } from "./cinemaSubmit.data";
import styles from "./CinemaSubmitPage.module.css";

interface StepperProps {
  step: number;
  /** Highest step reached — steps up to here are clickable. */
  reached: number;
  onGo: (n: number) => void;
}

/** Five-stage progress stepper. Done steps get a jade tick and jump back;
 * future steps are disabled until reached. */
export function CinemaSubmitStepper({ step, reached, onGo }: StepperProps) {
  return (
    <div
      className={styles.stepper}
      role="tablist"
      aria-label="Submission steps"
    >
      {SUBMIT_STEPS.map((s, i) => {
        const active = i === step;
        const done = i < step;
        const reachable = i <= reached;
        return (
          <button
            key={s.label}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={!reachable}
            onClick={() => reachable && onGo(i)}
            className={[
              styles.step,
              active && styles.stepActive,
              done && styles.stepDone,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className={styles.stepNum}>
              {done ? <FiCheck size={14} aria-hidden /> : i + 1}
            </span>
            <span>
              <span className={styles.stepLabel}>{s.label}</span>
              <span className={styles.stepSub}>{s.sub}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

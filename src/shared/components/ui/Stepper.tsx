import { type CSSProperties, type ReactNode } from "react";
import { FiCheck } from "react-icons/fi";
import styles from "./Stepper.module.css";

export type StepperSize = "sm" | "md" | "lg";
export type StepperMarker = "check" | "number";

export interface StepperStep {
  key: string;
  /** Text under the dot. Omit on every step to render no labels row. */
  label?: ReactNode;
  /** Accessible name when the visible label is absent or icon-only. */
  ariaLabel?: string;
}

export interface StepperProps {
  steps: StepperStep[];
  /** Index of the active step. */
  current: number;
  size?: StepperSize;
  marker?: StepperMarker;
  /** Render the coral progress fill line. Default true. */
  showFill?: boolean;
  /** Provide to make completed steps jump-back buttons. */
  onStepClick?: (index: number) => void;
  /** Which steps are clickable. Default: completed steps (index < current). */
  isStepClickable?: (index: number) => boolean;
  /** Required accessible name for the progress nav. */
  ariaLabel: string;
  className?: string;
}

const sizeClass: Record<StepperSize, string> = {
  sm: styles.sizeSm!,
  md: styles.sizeMd!,
  lg: styles.sizeLg!,
};

export function Stepper({
  steps,
  current,
  size = "md",
  marker = "check",
  showFill = true,
  onStepClick,
  isStepClickable,
  ariaLabel,
  className,
}: StepperProps) {
  const count = steps.length;
  const clampedCurrent = Math.min(Math.max(current, 0), Math.max(count - 1, 0));
  const fillFraction = count > 1 ? clampedCurrent / (count - 1) : 0;

  const stepIsClickable = (index: number) =>
    onStepClick != null &&
    (isStepClickable ? isStepClickable(index) : index < current);

  return (
    <nav
      aria-label={ariaLabel}
      className={[
        styles.stepper,
        sizeClass[size],
        marker === "number" ? styles.markerNumber : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--stepper-count": count } as CSSProperties}
    >
      <div className={styles.track}>
        {showFill && (
          <span
            className={styles.fill}
            style={{ transform: `scaleX(${fillFraction})` }}
            aria-hidden
          />
        )}
        <ol className={styles.list}>
          {steps.map((step, index) => {
            const done = index < current;
            const isCurrent = index === current;
            const stateClass = done
              ? styles.done
              : isCurrent
                ? styles.current
                : "";
            const canClick = stepIsClickable(index);

            const dot = (
              <span className={styles.dot}>
                {done ? (
                  <FiCheck className={styles.check} aria-hidden />
                ) : marker === "number" ? (
                  <span className={styles.num}>{index + 1}</span>
                ) : (
                  <span className={styles.pip} aria-hidden />
                )}
              </span>
            );
            const labelElement =
              step.label != null ? (
                <span className={styles.label}>{step.label}</span>
              ) : null;
            const nodeClass = [styles.node, stateClass]
              .filter(Boolean)
              .join(" ");

            return (
              <li key={step.key} className={styles.item}>
                {canClick ? (
                  <button
                    type="button"
                    className={[nodeClass, styles.nodeButton].join(" ")}
                    onClick={() => onStepClick?.(index)}
                    aria-current={isCurrent ? "step" : undefined}
                    aria-label={step.ariaLabel}
                  >
                    {dot}
                    {labelElement}
                  </button>
                ) : (
                  <span
                    className={nodeClass}
                    aria-current={isCurrent ? "step" : undefined}
                    aria-label={
                      step.label == null ? step.ariaLabel : undefined
                    }
                  >
                    {dot}
                    {labelElement}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

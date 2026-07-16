import { FiAlertCircle, FiCheck, FiClock } from "react-icons/fi";
import { PUBLISH_REQUIREMENTS } from "./publishChecklist.data";
import styles from "./PublishChecklist.module.css";

interface PublishChecklistProps {
  /** The exact contract-C5 unmet codes from the publish gate. */
  unmet: string[];
  /**
   * True when the failure couldn't be read (e.g. live mode surfaced only an
   * error message, not the 422 `{unmet}` body). Every requirement then renders
   * as "still to check" instead of a definite pass/fail.
   */
  unknown?: boolean;
}

type RowState = "pass" | "fail" | "unknown";

const STATE_LABEL: Record<RowState, string> = {
  pass: "Done",
  fail: "Needs attention",
  unknown: "Still to check",
};

/**
 * The completeness requirements an unlinked persona must meet to publish, each
 * with a pass / fail (or unknown) state and warm, actionable copy. Shown when a
 * publish attempt is rejected; the editor page renders the plum success panel
 * instead once every requirement is met.
 */
export function PublishChecklist({
  unmet,
  unknown = false,
}: PublishChecklistProps) {
  return (
    <div className={styles.card} role="status" aria-live="polite">
      <h3 className={styles.title}>
        Almost <em>there</em>
      </h3>
      <p className={styles.lede}>
        {unknown
          ? "We couldn't publish this just yet. Run through these and try again."
          : "A few things to finish before this persona can stand on its own."}
      </p>
      <ul className={styles.list}>
        {PUBLISH_REQUIREMENTS.map((req) => {
          const failedCode = unknown
            ? null
            : (req.codes.find((c) => unmet.includes(c)) ?? null);
          const state: RowState = unknown
            ? "unknown"
            : failedCode
              ? "fail"
              : "pass";
          const detail = failedCode ? req.fail[failedCode] : req.met;
          return (
            <li key={req.key} className={styles.row} data-state={state}>
              <span className={styles.icon} aria-hidden>
                {state === "pass" ? (
                  <FiCheck size={15} />
                ) : state === "fail" ? (
                  <FiAlertCircle size={15} />
                ) : (
                  <FiClock size={15} />
                )}
              </span>
              <span className={styles.text}>
                <span className={styles.rowTitle}>{req.title}</span>
                <span className={styles.rowHelp}>{detail}</span>
              </span>
              <span className={styles.srOnly}>{STATE_LABEL[state]}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

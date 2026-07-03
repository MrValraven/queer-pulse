import { FiAlertCircle } from "react-icons/fi";
import type { PostJobForm } from "./usePostJobForm";
import styles from "./PostJobPage.module.css";

export function PostJobStepDetails({
  form,
  showErrors,
}: {
  form: PostJobForm;
  showErrors: boolean;
}) {
  const { state, patch } = form;
  const titleMissing = showErrors && !state.title.trim();
  const descMissing = showErrors && !state.description.trim();

  return (
    <>
      <div className={styles.stepHead}>
        <div className={styles.eyebrow}>Step 2 of 5</div>
        <h1 className={styles.stepTitle}>
          The <em>details</em>
        </h1>
        <p className={styles.stepSub}>
          A clear title and an honest description get far more useful responses.
        </p>
      </div>

      <div className={styles.card}>
        <div
          className={[styles.field, titleMissing && styles.fieldErr]
            .filter(Boolean)
            .join(" ")}
        >
          <div className={styles.label}>
            Title <span className={styles.req}>*</span>
            <span
              className={[
                styles.counter,
                state.title.length > 80 && styles.counterOver,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {state.title.length}/80
            </span>
          </div>
          <input
            className={styles.input}
            type="text"
            maxLength={90}
            value={state.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder='e.g. "Junior graphic designer, editorial focus"'
          />
          <div className={styles.error}>
            <FiAlertCircle size={13} aria-hidden /> Give your listing a title.
          </div>
        </div>

        <div
          className={[styles.field, descMissing && styles.fieldErr]
            .filter(Boolean)
            .join(" ")}
        >
          <div className={styles.label}>
            What you&apos;re looking for <span className={styles.req}>*</span>
            <span className={styles.counter}>
              {state.description.length} chars
            </span>
          </div>
          <textarea
            className={styles.textarea}
            value={state.description}
            onChange={(e) => patch({ description: e.target.value })}
            placeholder="Describe the work, who it's for, and what success looks like — write as you'd explain it to a member at an event."
          />
          <div className={styles.error}>
            <FiAlertCircle size={13} aria-hidden /> Add a description.
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>
          Timeline <span className={styles.muted}>· optional</span>
        </div>
        <div className={styles.fieldRow} style={{ marginTop: 12 }}>
          <div className={styles.field}>
            <div className={styles.label}>Apply by</div>
            <input
              className={styles.input}
              type="date"
              value={state.deadline}
              onChange={(e) => patch({ deadline: e.target.value })}
            />
          </div>
          <div className={styles.field}>
            <div className={styles.label}>Start date</div>
            <input
              className={styles.input}
              type="text"
              value={state.startDate}
              onChange={(e) => patch({ startDate: e.target.value })}
              placeholder="e.g. ASAP, June, flexible"
            />
          </div>
        </div>
      </div>
    </>
  );
}

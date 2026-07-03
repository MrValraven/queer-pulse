import { FiAlertCircle } from "react-icons/fi";
import {
  CATEGORIES,
  COMMITMENTS,
  FORMATS,
  SENIORITY,
  TIMEZONES,
} from "./postJob.data";
import type { PostJobForm } from "./usePostJobForm";
import styles from "./PostJobPage.module.css";

function Select({
  label,
  value,
  options,
  onChange,
  optional,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  optional?: boolean;
}) {
  return (
    <div className={styles.field}>
      <div className={styles.label}>
        {label}
        {optional && <span className={styles.opt}>optional</span>}
      </div>
      <select
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

export function PostJobStepType({
  form,
  showErrors,
}: {
  form: PostJobForm;
  showErrors: boolean;
}) {
  const { state, patch, needsCity, showsTimezone } = form;
  const cityMissing = showErrors && needsCity && !state.city.trim();

  return (
    <>
      <div className={styles.stepHead}>
        <div className={styles.eyebrow}>Step 1 of 5</div>
        <h1 className={styles.stepTitle}>
          The <em>role</em>
        </h1>
        <p className={styles.stepSub}>
          How the work is structured. These become the main filters members
          search the board by.
        </p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Arrangement</div>
        <div className={styles.cardSub}>
          The shape of the role — pick the closest fit.
        </div>
        <div className={styles.fieldRow}>
          <Select
            label="Category"
            value={state.category}
            options={CATEGORIES}
            onChange={(v) => patch({ category: v })}
          />
          <Select
            label="Commitment"
            value={state.commitment}
            options={COMMITMENTS}
            onChange={(v) => patch({ commitment: v })}
          />
        </div>
        <div className={styles.fieldRow}>
          <Select
            label="Experience level"
            value={state.seniority}
            options={SENIORITY}
            onChange={(v) => patch({ seniority: v })}
            optional
          />
          <Select
            label="Format"
            value={state.format}
            options={FORMATS}
            onChange={(v) => patch({ format: v })}
          />
        </div>

        {needsCity && (
          <div
            className={[styles.field, cityMissing && styles.fieldErr]
              .filter(Boolean)
              .join(" ")}
          >
            <div className={styles.label}>
              Location <span className={styles.req}>*</span>
            </div>
            <input
              className={styles.input}
              type="text"
              value={state.city}
              onChange={(e) => patch({ city: e.target.value })}
              placeholder="e.g. Arroios, Lisbon — or a neighbourhood / district"
            />
            <div className={styles.error}>
              <FiAlertCircle size={13} aria-hidden /> Add where this is based.
            </div>
          </div>
        )}

        {showsTimezone && (
          <Select
            label="Timezone"
            value={state.timezone}
            options={TIMEZONES}
            onChange={(v) => patch({ timezone: v })}
            optional
          />
        )}
      </div>
    </>
  );
}

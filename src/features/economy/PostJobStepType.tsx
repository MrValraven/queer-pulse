import { useId } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  CATEGORIES,
  COMMITMENTS,
  FORMATS,
  SENIORITY,
  TIMEZONES,
  type Option,
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
  options: Option[];
  onChange: (v: string) => void;
  optional?: boolean;
}) {
  const { t } = useTranslation();
  const fieldId = useId();
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={`${fieldId}-select`}>
        {label}
        {optional && (
          <span className={styles.opt}>
            {t("economy:postJob.field.optional")}
          </span>
        )}
      </label>
      <select
        id={`${fieldId}-select`}
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.labelKey)}
          </option>
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
  const { t } = useTranslation();
  const fieldId = useId();
  const { state, patch, needsCity, showsTimezone } = form;
  const cityMissing = showErrors && needsCity && !state.city.trim();

  return (
    <>
      <div className={styles.stepHead}>
        <div className={styles.eyebrow}>
          {t("economy:postJob.step1.eyebrow")}
        </div>
        <h1 className={styles.stepTitle}>
          <Translation
            i18nKey="economy:postJob.step1.title"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.stepSub}>{t("economy:postJob.step1.sub")}</p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>
          {t("economy:postJob.step1.arrangementTitle")}
        </div>
        <div className={styles.cardSub}>
          {t("economy:postJob.step1.arrangementSub")}
        </div>
        <div className={styles.fieldRow}>
          <Select
            label={t("economy:postJob.field.category")}
            value={state.category}
            options={CATEGORIES}
            onChange={(v) => patch({ category: v })}
          />
          <Select
            label={t("economy:postJob.field.commitment")}
            value={state.commitment}
            options={COMMITMENTS}
            onChange={(v) => patch({ commitment: v })}
          />
        </div>
        <div className={styles.fieldRow}>
          <Select
            label={t("economy:postJob.field.experienceLevel")}
            value={state.seniority}
            options={SENIORITY}
            onChange={(v) => patch({ seniority: v })}
            optional
          />
          <Select
            label={t("economy:postJob.field.format")}
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
            <label className={styles.label} htmlFor={`${fieldId}-city`}>
              {t("economy:postJob.field.location")}{" "}
              <span className={styles.req}>*</span>
            </label>
            <input
              id={`${fieldId}-city`}
              className={styles.input}
              type="text"
              value={state.city}
              onChange={(e) => patch({ city: e.target.value })}
              placeholder={t("economy:postJob.step1.locationPlaceholder")}
            />
            <div className={styles.error}>
              <FiAlertCircle size={13} aria-hidden />{" "}
              {t("economy:postJob.step1.locationError")}
            </div>
          </div>
        )}

        {showsTimezone && (
          <Select
            label={t("economy:postJob.field.timezone")}
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

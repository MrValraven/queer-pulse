import { useId } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { PostJobForm } from "./usePostJobForm";
import styles from "./PostJobPage.module.css";

const TITLE_MAX = 80;

export function PostJobStepDetails({
  form,
  showErrors,
}: {
  form: PostJobForm;
  showErrors: boolean;
}) {
  const { t } = useTranslation();
  const fieldId = useId();
  const { state, patch } = form;
  const titleMissing = showErrors && !state.title.trim();
  const descMissing = showErrors && !state.description.trim();

  return (
    <>
      <div className={styles.stepHead}>
        <div className={styles.eyebrow}>
          {t("economy:postJob.step2.eyebrow")}
        </div>
        <h1 className={styles.stepTitle}>
          <Translation
            i18nKey="economy:postJob.step2.title"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.stepSub}>{t("economy:postJob.step2.sub")}</p>
      </div>

      <div className={styles.card}>
        <div
          className={[styles.field, titleMissing && styles.fieldErr]
            .filter(Boolean)
            .join(" ")}
        >
          <label className={styles.label} htmlFor={`${fieldId}-title`}>
            {t("economy:postJob.field.title")}{" "}
            <span className={styles.req}>*</span>
            <span
              className={[
                styles.counter,
                state.title.length > TITLE_MAX && styles.counterOver,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {t("economy:postJob.step2.titleCounter", {
                used: state.title.length,
                max: TITLE_MAX,
              })}
            </span>
          </label>
          <input
            id={`${fieldId}-title`}
            className={styles.input}
            type="text"
            maxLength={90}
            value={state.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder={t("economy:postJob.step2.titlePlaceholder")}
          />
          <div className={styles.error}>
            <FiAlertCircle size={13} aria-hidden />{" "}
            {t("economy:postJob.step2.titleError")}
          </div>
        </div>

        <div
          className={[styles.field, descMissing && styles.fieldErr]
            .filter(Boolean)
            .join(" ")}
        >
          <label className={styles.label} htmlFor={`${fieldId}-desc`}>
            {t("economy:postJob.step2.lookingForLabel")}{" "}
            <span className={styles.req}>*</span>
            <span className={styles.counter}>
              {t("economy:postJob.step2.charsCount", {
                count: state.description.length,
              })}
            </span>
          </label>
          <textarea
            id={`${fieldId}-desc`}
            className={styles.textarea}
            value={state.description}
            onChange={(e) => patch({ description: e.target.value })}
            placeholder={t("economy:postJob.step2.descriptionPlaceholder")}
          />
          <div className={styles.error}>
            <FiAlertCircle size={13} aria-hidden />{" "}
            {t("economy:postJob.step2.descriptionError")}
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>
          {t("economy:postJob.step2.timelineTitle")}{" "}
          <span className={styles.muted}>
            · {t("economy:postJob.field.optional")}
          </span>
        </div>
        <div className={styles.fieldRow} style={{ marginTop: 12 }}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={`${fieldId}-deadline`}>
              {t("economy:postJob.step2.applyBy")}
            </label>
            <input
              id={`${fieldId}-deadline`}
              className={styles.input}
              type="date"
              value={state.deadline}
              onChange={(e) => patch({ deadline: e.target.value })}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={`${fieldId}-start`}>
              {t("economy:postJob.step2.startDate")}
            </label>
            <input
              id={`${fieldId}-start`}
              className={styles.input}
              type="text"
              value={state.startDate}
              onChange={(e) => patch({ startDate: e.target.value })}
              placeholder={t("economy:postJob.step2.startDatePlaceholder")}
            />
          </div>
        </div>
      </div>
    </>
  );
}

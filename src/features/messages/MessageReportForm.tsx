// src/features/messages/MessageReportForm.tsx
import { useId } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ReportReasonOption } from "../safety/api/useReportReasons";
import styles from "./MessageReportModal.module.css";

export interface MessageReportFormProps {
  reasons: ReportReasonOption[];
  reason: string;
  onReasonChange: (code: string) => void;
  detail: string;
  onDetailChange: (value: string) => void;
  /** Only the "other" reason requires 10 characters of detail — every other
   *  reason code is specific enough on its own (PRD-368). */
  isDetailRequired: boolean;
  isAnonymous: boolean;
  onAnonymousChange: (value: boolean) => void;
  /** Absent hides the row entirely: own message (never reaches this form —
   *  `canReport` already excludes it), an official thread, or a counterpart
   *  already blocked. */
  alsoBlockLabel?: string;
  alsoBlock: boolean;
  onAlsoBlockChange: (value: boolean) => void;
}

const DETAIL_MIN_LENGTH = 10;

/** The report form's fields, split out of `MessageReportModal` to keep it
 *  under the component size cap. Purely presentational — all state lives in
 *  the parent. */
export function MessageReportForm({
  reasons,
  reason,
  onReasonChange,
  detail,
  onDetailChange,
  isDetailRequired,
  isAnonymous,
  onAnonymousChange,
  alsoBlockLabel,
  alsoBlock,
  onAlsoBlockChange,
}: MessageReportFormProps) {
  const { t } = useTranslation();
  const detailFieldId = useId();
  const trimmedLength = detail.trim().length;
  const charsLeft = DETAIL_MIN_LENGTH - trimmedLength;

  return (
    <>
      <div className={styles.reportLabel}>
        {t("safety:reportPerson.form.reasonLabel")}
      </div>
      <div className={styles.reportOpts}>
        {reasons.map((option) => (
          <label
            key={option.code}
            className={[
              styles.reportOpt,
              reason === option.code && styles.reportOptChecked,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <input
              type="radio"
              name="message-report-reason"
              value={option.code}
              checked={reason === option.code}
              onChange={() => onReasonChange(option.code)}
            />
            {option.label}
          </label>
        ))}
      </div>

      <label className={styles.reportLabel} htmlFor={detailFieldId}>
        {t("safety:reportPerson.form.detailLabel")}
      </label>
      <textarea
        id={detailFieldId}
        className={styles.reportTextarea}
        placeholder={t("safety:reportPerson.form.detailPlaceholder")}
        value={detail}
        onChange={(event) => onDetailChange(event.target.value)}
      />
      {isDetailRequired && (
        <div className={styles.reportCounter}>
          {charsLeft > 0
            ? t("safety:reportPerson.form.charsRemaining", {
                count: charsLeft,
              })
            : t("safety:reportPerson.form.charsCount", {
                count: trimmedLength,
              })}
        </div>
      )}

      <label className={styles.anonymousRow}>
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(event) => onAnonymousChange(event.target.checked)}
        />
        {t("messages:report.anonymousLabel")}
      </label>
      <p className={styles.anonymousHelper}>
        {t("safety:report.form.identity.anonymousHelper")}
      </p>

      {alsoBlockLabel && (
        <label className={styles.alsoBlockRow}>
          <input
            type="checkbox"
            checked={alsoBlock}
            onChange={(event) => onAlsoBlockChange(event.target.checked)}
          />
          {alsoBlockLabel}
        </label>
      )}
    </>
  );
}

// src/features/messages/MessageReportForm.tsx
import { useId, type RefObject } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ReportReasonOption } from "../safety/api/useReportReasons";
import styles from "./MessageReportModal.module.css";

export interface MessageReportFormProps {
  reasons: ReportReasonOption[];
  reason: string | null;
  onReasonChange: (code: string) => void;
  /** Lets the parent's blocked submit move focus to what is still missing. */
  firstReasonRef: RefObject<HTMLInputElement | null>;
  detailRef: RefObject<HTMLTextAreaElement | null>;
  /** Id of the "what's missing" slot, which the parent's submit points at
   *  through `aria-describedby` while it is blocked. */
  missingHintId: string;
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
  firstReasonRef,
  detailRef,
  missingHintId,
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
  const reasonLabelId = useId();
  const detailFieldId = useId();
  const trimmedLength = detail.trim().length;
  const charsLeft = DETAIL_MIN_LENGTH - trimmedLength;
  // One slot under the textarea says what is still missing: the reason
  // first, then the character count "other" asks for.
  let counterText = t("safety:reportPerson.form.charsCount", {
    count: trimmedLength,
  });
  if (reason === null) {
    counterText = t("safety:reportPerson.form.reasonMissing");
  } else if (charsLeft > 0) {
    counterText = t("safety:reportPerson.form.charsRemaining", {
      count: charsLeft,
    });
  }

  return (
    <>
      <div id={reasonLabelId} className={styles.reportLabel}>
        {t("safety:reportPerson.form.reasonLabel")}
      </div>
      <div
        className={styles.reportOpts}
        role="radiogroup"
        aria-labelledby={reasonLabelId}
        aria-required="true"
      >
        {reasons.map((option, optionIndex) => (
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
              ref={optionIndex === 0 ? firstReasonRef : undefined}
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
        ref={detailRef}
        id={detailFieldId}
        className={styles.reportTextarea}
        placeholder={t("safety:reportPerson.form.detailPlaceholder")}
        value={detail}
        onChange={(event) => onDetailChange(event.target.value)}
      />
      {(reason === null || isDetailRequired) && (
        <div id={missingHintId} className={styles.reportCounter}>
          {counterText}
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

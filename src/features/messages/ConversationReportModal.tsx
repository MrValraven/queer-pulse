// src/features/messages/ConversationReportModal.tsx
import { useId, useState } from "react";
import { Button } from "../../shared/components/ui";
import { Modal } from "../../shared/components/ui/Modal";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCreateReport } from "../safety/api/useCreateReport";
import { useReportSubmissionError } from "../safety/api/reportSubmissionError";
import { asReasonCode, useReportReasons } from "../safety/api/useReportReasons";
import { logError } from "../../shared/observability/logger";
import styles from "./MessagesPage.module.css";

export interface ConversationReportModalProps {
  /** The counterpart's user id (live) — falls back to their slug in demo mode,
   *  where the report never leaves the device (see `useCreateReport`). */
  subjectId: string;
  /** First name, for the title/toast copy. */
  name: string;
  onClose: () => void;
}

/**
 * Report the person on the other end of a DM — not a single message, the
 * member themself (spec 03's `member` report subject). Opened from
 * `ConversationSafetyMenu`, alongside Block. Structurally a twin of
 * `MessageReportModal` (same reason-taxonomy + detail-textarea shape, same
 * `/reports` mutation) with `subjectType: "member"` instead of `"message"`,
 * so the reason set matches the member-shaped taxonomy (outing/doxxing/
 * harassment/unwanted contact/impersonation/discrimination) rather than the
 * message one.
 */
export function ConversationReportModal({
  subjectId,
  name,
  onClose,
}: ConversationReportModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  // Server-owned taxonomy when it answers, the local one instantly and
  // silently when it does not. Never a spinner, never an empty list.
  const reasons = useReportReasons("member");
  const [reason, setReason] = useState<string>(reasons[0]!.code);
  const detailFieldId = useId();
  const [detail, setDetail] = useState("");
  const [done, setDone] = useState(false);
  const createReport = useCreateReport();
  const describeReportError = useReportSubmissionError();

  const canSubmit = detail.trim().length >= 10;
  const charsLeft = 10 - detail.trim().length;

  const submit = () => {
    if (!canSubmit || createReport.isPending) return;
    createReport.mutate(
      {
        subjectType: "member",
        subjectId,
        reasonCode: asReasonCode(reason),
        detail: detail.trim(),
      },
      {
        onSuccess: () => setDone(true),
        onError: (error) => {
          logError(error, { scope: "messages.reportMember" });
          // Never tell a reporter "received" when the report didn't land —
          // surface an honest error and keep the form filled in to retry. A
          // rolling flood cap answers with its own member-facing explanation,
          // which `describeReportError` shows in place of the generic line.
          showToast(
            describeReportError(error, t("safety:flag.error")),
            "error",
          );
        },
      },
    );
  };

  if (done) {
    return (
      <Modal
        title={t("safety:flag.success.title")}
        onClose={onClose}
        footer={
          <Button variant="ghost" onClick={onClose}>
            {t("safety:flag.success.doneCta")}
          </Button>
        }
      >
        <p>{t("safety:flag.success.body")}</p>
      </Modal>
    );
  }

  return (
    <Modal
      title={t("messages:report.memberTitle", { name })}
      onClose={onClose}
      sub={t("safety:flag.form.lead")}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("safety:flag.form.cancelCta")}
          </Button>
          <Button
            variant="primary"
            onClick={submit}
            disabled={!canSubmit || createReport.isPending}
          >
            {createReport.isPending
              ? t("safety:flag.form.submitting")
              : t("safety:flag.form.submitCta")}
          </Button>
        </>
      }
    >
      <div className={styles.reportLabel}>
        {t("safety:flag.form.concernLabel")}
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
              name="conversation-report-reason"
              value={option.code}
              checked={reason === option.code}
              onChange={() => setReason(option.code)}
            />
            {option.label}
          </label>
        ))}
      </div>
      <label className={styles.reportLabel} htmlFor={detailFieldId}>
        {t("safety:flag.form.detailLabel")}
      </label>
      <textarea
        id={detailFieldId}
        className={styles.reportTextarea}
        placeholder={t("safety:flag.form.detailPlaceholder")}
        value={detail}
        onChange={(event) => setDetail(event.target.value)}
      />
      <div className={styles.reportCounter}>
        {charsLeft > 0
          ? t("safety:flag.form.charsRemaining", { count: charsLeft })
          : t("safety:flag.form.charsCount", { count: detail.trim().length })}
      </div>
    </Modal>
  );
}

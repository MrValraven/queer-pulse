// src/features/messages/MessageReportModal.tsx
import { useId, useState } from "react";
import { Button } from "../../shared/components/ui";
import { Modal } from "../../shared/components/ui/Modal";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useCreateReport } from "../safety/api/useCreateReport";
import { useReportSubmissionError } from "../safety/api/reportSubmissionError";
import { asReasonCode, useReportReasons } from "../safety/api/useReportReasons";
import { logError } from "../../shared/observability/logger";
import styles from "./MessagesPage.module.css";

export interface MessageReportModalProps {
  /** The reported message's server id (report is a live-only action). */
  messageId: string;
  onClose: () => void;
}

/** Report a single message. Mirrors the safety FlagModal flow (reason radios +
 *  detail), but with `subjectType: "message"` and the message id as subject.
 *  Reason labels come from the shared safety taxonomy; the report POSTs to the
 *  same `/reports` endpoint. */
export function MessageReportModal({
  messageId,
  onClose,
}: MessageReportModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  // Server-owned taxonomy when it answers, the local one instantly and
  // silently when it does not. Never a spinner, never an empty list.
  const reasons = useReportReasons("message");
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
        subjectType: "message",
        subjectId: messageId,
        reasonCode: asReasonCode(reason),
        detail: detail.trim(),
      },
      {
        onSuccess: () => setDone(true),
        onError: (error) => {
          logError(error, { scope: "messages.reportMessage" });
          // Never tell a reporter "received" when the report didn't land —
          // surface an honest error and keep the form filled in to retry. A
          // rolling flood cap answers with its own member-facing explanation,
          // which `describeReportError` shows in place of the generic line.
          showToast(
            describeReportError(error, t("safety:reportPerson.error")),
            "error",
          );
        },
      },
    );
  };

  if (done) {
    return (
      <Modal
        title={
          <Translation
            i18nKey="safety:reportPerson.success.title"
            components={{ em: <em /> }}
          />
        }
        onClose={onClose}
        footer={
          <Button variant="ghost" onClick={onClose}>
            {t("safety:reportPerson.success.doneCta")}
          </Button>
        }
      >
        <p>{t("safety:reportPerson.success.body")}</p>
      </Modal>
    );
  }

  return (
    <Modal
      title={t("messages:report.title")}
      onClose={onClose}
      sub={t("safety:reportPerson.form.lead")}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("safety:reportPerson.form.cancelCta")}
          </Button>
          <Button
            variant="primary"
            onClick={submit}
            disabled={!canSubmit || createReport.isPending}
          >
            {createReport.isPending
              ? t("safety:reportPerson.form.submitting")
              : t("safety:reportPerson.form.submitCta")}
          </Button>
        </>
      }
    >
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
              onChange={() => setReason(option.code)}
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
        onChange={(event) => setDetail(event.target.value)}
      />
      <div className={styles.reportCounter}>
        {charsLeft > 0
          ? t("safety:reportPerson.form.charsRemaining", { count: charsLeft })
          : t("safety:reportPerson.form.charsCount", {
              count: detail.trim().length,
            })}
      </div>
    </Modal>
  );
}

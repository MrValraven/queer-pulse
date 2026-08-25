// src/features/messages/MessageReportModal.tsx
import { useId, useMemo, useState } from "react";
import { Button } from "../../shared/components/ui";
import { Modal } from "../../shared/components/ui/Modal";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCreateReport } from "../safety/api/useCreateReport";
import {
  REASON_LABEL_KEYS,
  SUBJECT_REASONS,
  type ReasonCode,
} from "../safety/reportReasons";
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
  const reasons = useMemo(
    () =>
      SUBJECT_REASONS.message.map((code) => ({
        code,
        label: t(REASON_LABEL_KEYS[code]),
      })),
    [t],
  );
  const [reason, setReason] = useState<ReasonCode>(reasons[0]!.code);
  const detailFieldId = useId();
  const [detail, setDetail] = useState("");
  const [done, setDone] = useState(false);
  const createReport = useCreateReport();

  const canSubmit = detail.trim().length >= 10;
  const charsLeft = 10 - detail.trim().length;

  const submit = () => {
    if (!canSubmit || createReport.isPending) return;
    createReport.mutate(
      {
        subjectType: "message",
        subjectId: messageId,
        reasonCode: reason,
        detail: detail.trim(),
      },
      {
        onSuccess: () => setDone(true),
        onError: (error) => {
          logError(error, { scope: "messages.reportMessage" });
          // Never tell a reporter "received" when the report didn't land —
          // surface an honest error and keep the form filled in to retry.
          showToast(t("safety:flag.error"), "error");
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
      title={t("messages:report.title")}
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

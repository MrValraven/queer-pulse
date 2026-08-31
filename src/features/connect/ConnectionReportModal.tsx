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
import styles from "./ConnectionsPage.module.css";

export interface ConnectionReportModalProps {
  /** The connection's slug — `CreateReportInput.subjectId` accepts a slug/uuid
   *  for a `member` subject, same as `ConversationReportModal`'s fallback. */
  subjectId: string;
  /** First name, for the title/toast copy. */
  name: string;
  onClose: () => void;
}

/**
 * Report a connection — the "Report" item in the connections card's
 * kebab menu. Structurally a twin of `ConversationReportModal` (same
 * reason-taxonomy + detail-textarea shape, same `/reports` mutation),
 * `subjectType: "member"`, kept as its own component per this codebase's
 * established pattern (each surface owns its report modal, sharing the
 * `useCreateReport` mutation + `reportReasons` taxonomy underneath).
 */
export function ConnectionReportModal({
  subjectId,
  name,
  onClose,
}: ConnectionReportModalProps) {
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
          logError(error, { scope: "connect.reportConnection" });
          // Never claim "report sent" for one that didn't land — surface an
          // honest error and keep the form filled in so the reporter can
          // retry without re-picking a reason. A rolling flood cap answers
          // with its own member-facing explanation, which
          // `describeReportError` shows in place of the generic line.
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
      title={t("connect:moreMenu.reportTitle", { name })}
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
              name="connection-report-reason"
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

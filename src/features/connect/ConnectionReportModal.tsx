import { useId, useRef, useState } from "react";
import { Button } from "../../shared/components/ui";
import { Modal } from "../../shared/components/ui/Modal";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useCreateReport } from "../safety/api/useCreateReport";
import { useReportSubmissionError } from "../safety/api/reportSubmissionError";
import { asReasonCode, useReportReasons } from "../safety/api/useReportReasons";
import { logError } from "../../shared/observability/logger";
import { focusControl } from "../../shared/lib/focusFirstError";
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
  const [reason, setReason] = useState<string | null>(null);
  const reasonLabelId = useId();
  const detailFieldId = useId();
  const missingHintId = useId();
  const firstReasonRef = useRef<HTMLInputElement>(null);
  const detailRef = useRef<HTMLTextAreaElement>(null);
  const [detail, setDetail] = useState("");
  const [done, setDone] = useState(false);
  const createReport = useCreateReport();
  const describeReportError = useReportSubmissionError();

  const canSubmit = reason !== null && detail.trim().length >= 10;
  const charsLeft = 10 - detail.trim().length;
  // One slot under the textarea says what is still missing: the reason
  // first, then the character count. The blocked submit points at it.
  let counterText = t("safety:reportPerson.form.charsCount", {
    count: detail.trim().length,
  });
  if (reason === null) {
    counterText = t("safety:reportPerson.form.reasonMissing");
  } else if (charsLeft > 0) {
    counterText = t("safety:reportPerson.form.charsRemaining", {
      count: charsLeft,
    });
  }

  const submit = () => {
    if (createReport.isPending) return;
    if (!canSubmit || reason === null) {
      // The submit stays focusable while blocked, so a press lands the
      // reporter on the field that still needs them.
      focusControl(
        reason === null ? firstReasonRef.current : detailRef.current,
      );
      return;
    }
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
          {/* aria-disabled keeps the submit in the tab order, so the hint it
              points at is heard and an early press can move focus. */}
          <Button
            variant="primary"
            onClick={submit}
            aria-disabled={!canSubmit || createReport.isPending}
            aria-describedby={canSubmit ? undefined : missingHintId}
          >
            {createReport.isPending
              ? t("safety:reportPerson.form.submitting")
              : t("safety:reportPerson.form.submitCta")}
          </Button>
        </>
      }
    >
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
        ref={detailRef}
        id={detailFieldId}
        className={styles.reportTextarea}
        placeholder={t("safety:reportPerson.form.detailPlaceholder")}
        value={detail}
        onChange={(event) => setDetail(event.target.value)}
      />
      <div id={missingHintId} className={styles.reportCounter}>
        {counterText}
      </div>
    </Modal>
  );
}

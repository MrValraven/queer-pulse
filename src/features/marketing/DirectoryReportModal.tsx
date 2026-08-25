import { useState } from "react";
import { FiCheck, FiAlertTriangle } from "react-icons/fi";
import { Button, ModalSheet, Sending } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { logError } from "../../shared/observability/logger";
import { REASON_LABEL_KEYS, type ReasonCode } from "../safety/reportReasons";
import { REVIEW_REPORT_REASONS, useReportReview } from "./api/useReportReview";
import { useReportQuestion } from "./api/useReportQuestion";
import styles from "./DirectoryReportModal.module.css";

/** Which kind of member-authored content is being reported. Both file through
 *  the same `POST /reports` pipeline and offer the same reasons; only the
 *  subject type and the heading copy differ. */
export type DirectoryReportSubject = "review" | "question";

interface Props {
  /** The subject's own uuid — the report's `subjectId`. */
  subjectId: string;
  subjectKind: DirectoryReportSubject;
  /** The author's display name, for the heading. */
  authorName: string;
  onClose: () => void;
}

const TITLE_KEYS: Record<DirectoryReportSubject, string> = {
  review: "marketing:directory.detail.reportReview.title",
  question: "marketing:directory.detail.reportQuestion.title",
};
const SUB_KEYS: Record<DirectoryReportSubject, string> = {
  review: "marketing:directory.detail.reportReview.sub",
  question: "marketing:directory.detail.reportQuestion.sub",
};

/**
 * "Report this" for a directory review or a public question: pick a reason →
 * real submit → the plum-panel confirmation (or an honest retry panel on
 * failure). Mirrors `forum/ReportReplyModal`'s pick-reason/submit/confirm shape
 * exactly. Both subjects share one modal because a question is abusive in the
 * same ways a review is; only the subject type sent to `POST /reports` and the
 * heading copy differ.
 */
export function DirectoryReportModal({
  subjectId,
  subjectKind,
  authorName,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const [reason, setReason] = useState<ReasonCode | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  // Both hooks are plain `useMutation` calls with no side effects until
  // `.mutate`, so calling both unconditionally keeps hook order stable.
  const reportReview = useReportReview();
  const reportQuestion = useReportQuestion();

  const firstName = authorName.split(" ")[0] ?? authorName;
  const title = t(TITLE_KEYS[subjectKind]);

  const submit = () => {
    if (!reason) return;
    setStatus("sending");
    const onSettled = {
      onSuccess: () => setStatus("done"),
      onError: (error: Error) => {
        logError(error, { scope: `marketing.report.${subjectKind}` });
        setStatus("error");
      },
    };
    if (subjectKind === "question") {
      reportQuestion.mutate(
        { questionId: subjectId, reasonCode: reason },
        onSettled,
      );
      return;
    }
    reportReview.mutate({ reviewId: subjectId, reasonCode: reason }, onSettled);
  };

  if (status === "done") {
    return (
      <ModalSheet
        onClose={onClose}
        success
        ariaLabel={title}
      >
        <div className={styles.confirm}>
          <span className={styles.confirmIcon} aria-hidden>
            <FiCheck />
          </span>
          <h2 className={styles.confirmTitle}>
            <Translation
              i18nKey="marketing:directory.detail.reportReview.confirmTitle"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.confirmBody}>
            {t("marketing:directory.detail.reportReview.confirmBody")}
          </p>
          <div className={styles.confirmActions}>
            <Button variant="ghost-dark" onClick={onClose}>
              {t("marketing:directory.detail.reportReview.done")}
            </Button>
          </div>
        </div>
      </ModalSheet>
    );
  }

  if (status === "error") {
    return (
      <ModalSheet
        onClose={onClose}
        ariaLabel={title}
      >
        <div className={styles.errorPanel}>
          <span className={styles.errorIcon} aria-hidden>
            <FiAlertTriangle />
          </span>
          <h2 className={styles.errorTitle}>
            {t("marketing:directory.detail.reportReview.errorTitle")}
          </h2>
          <p className={styles.errorBody}>
            {t("marketing:directory.detail.reportReview.errorBody")}
          </p>
          <div className={styles.errorActions}>
            <Button variant="ghost" type="button" onClick={onClose}>
              {t("marketing:directory.detail.reportReview.cancel")}
            </Button>
            <Button variant="primary" type="button" onClick={submit}>
              {t("marketing:directory.detail.reportReview.retryCta")}
            </Button>
          </div>
        </div>
      </ModalSheet>
    );
  }

  return (
    <ModalSheet
      onClose={onClose}
      ariaLabel={title}
    >
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.sub}>
        {t(SUB_KEYS[subjectKind], { name: firstName })}
      </p>
      <div
        className={styles.reasons}
        role="radiogroup"
        aria-label={t("marketing:directory.detail.reportReview.reasonGroupAria")}
      >
        {REVIEW_REPORT_REASONS.map((code) => {
          const on = reason === code;
          return (
            <button
              key={code}
              type="button"
              role="radio"
              aria-checked={on}
              className={[styles.reason, on && styles.reasonOn]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setReason(code)}
            >
              <span className={styles.radio} aria-hidden />
              {t(REASON_LABEL_KEYS[code])}
            </button>
          );
        })}
      </div>
      <div className={styles.actions}>
        <Button
          variant="ghost"
          type="button"
          onClick={onClose}
          disabled={status === "sending"}
        >
          {t("marketing:directory.detail.reportReview.cancel")}
        </Button>
        <Button
          variant="primary"
          type="button"
          onClick={submit}
          disabled={!reason || status === "sending"}
        >
          {status === "sending" ? (
            <Sending label={t("marketing:directory.detail.reportReview.sending")} />
          ) : (
            t("marketing:directory.detail.reportReview.sendCta")
          )}
        </Button>
      </div>
    </ModalSheet>
  );
}

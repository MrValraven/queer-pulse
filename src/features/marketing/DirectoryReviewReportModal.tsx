import { useState } from "react";
import { FiCheck, FiAlertTriangle } from "react-icons/fi";
import { Button, ModalSheet, Sending } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { logError } from "../../shared/observability/logger";
import { REASON_LABEL_KEYS, type ReasonCode } from "../safety/reportReasons";
import { REVIEW_REPORT_REASONS, useReportReview } from "./api/useReportReview";
import styles from "./DirectoryReviewReportModal.module.css";

interface Props {
  /** The review's own uuid — the report's `subjectId`. */
  reviewId: string;
  /** The reviewer's display name, for the heading. */
  reviewerName: string;
  onClose: () => void;
}

/**
 * "Report this review" (gap-audit HSG-6): pick a reason → real submit → the
 * plum-panel confirmation (or an honest retry panel on failure). Mirrors
 * `forum/ReportReplyModal`'s pick-reason/submit/confirm shape exactly, scoped
 * to a single directory review instead of a forum post/reply.
 */
export function DirectoryReviewReportModal({
  reviewId,
  reviewerName,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const [reason, setReason] = useState<ReasonCode | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  const reportReview = useReportReview();

  const firstName = reviewerName.split(" ")[0] ?? reviewerName;

  const submit = () => {
    if (!reason) return;
    setStatus("sending");
    reportReview.mutate(
      { reviewId, reasonCode: reason },
      {
        onSuccess: () => setStatus("done"),
        onError: (error) => {
          logError(error, { scope: "marketing.reportReview" });
          setStatus("error");
        },
      },
    );
  };

  if (status === "done") {
    return (
      <ModalSheet
        onClose={onClose}
        success
        ariaLabel={t("marketing:directory.detail.reportReview.title")}
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
        ariaLabel={t("marketing:directory.detail.reportReview.title")}
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
      ariaLabel={t("marketing:directory.detail.reportReview.title")}
    >
      <h2 className={styles.title}>
        {t("marketing:directory.detail.reportReview.title")}
      </h2>
      <p className={styles.sub}>
        {t("marketing:directory.detail.reportReview.sub", { name: firstName })}
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

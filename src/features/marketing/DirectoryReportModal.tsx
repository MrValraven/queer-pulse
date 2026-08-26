import { useState } from "react";
import { FiCheck, FiAlertTriangle } from "react-icons/fi";
import { Button, ModalSheet, Sending } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { logError } from "../../shared/observability/logger";
import type { ReportSubjectType } from "../safety/reportReasons";
import { useCreateReport } from "../safety/api/useCreateReport";
import { asReasonCode, useReportReasons } from "../safety/api/useReportReasons";
import { useReportSubmissionError } from "../safety/api/reportSubmissionError";
import styles from "./DirectoryReportModal.module.css";

/** Which kind of member-authored content is being reported. Both file through
 *  the same `POST /reports` pipeline and offer the same reasons; only the
 *  subject type and the heading copy differ. */
export type DirectoryReportSubject = "review" | "question";

interface Props {
  /** The subject's own uuid — the report's `subjectId`. */
  subjectId: string;
  subjectKind: DirectoryReportSubject;
  /**
   * The author's display name, for the heading. Reviews only: a review has one
   * author, so naming them is accurate and grounding. A public question and
   * the answer under it are one reportable thing written by up to two people,
   * so that surface names nobody rather than telling somebody reporting the
   * answer that they are reporting the asker's question.
   */
  authorName?: string;
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
 * Which shared subject type each of this modal's two kinds files as, so the
 * reasons come from the one taxonomy every other report surface reads.
 *
 * Both kinds used to render `REVIEW_REPORT_REASONS`, a local copy of the
 * REVIEW list. That was wrong for a question: the backend catalogue offers a
 * question `outing`, `doxxing` and `off_topic`, and the review list has none
 * of the three. `outing` and `doxxing` are the only codes that derive
 * emergency severity server-side, so somebody outed in a public question on a
 * venue's page could file it only as "Something else".
 */
const SUBJECT_TYPES: Record<DirectoryReportSubject, ReportSubjectType> = {
  review: "review",
  question: "listing_public_question",
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
  const [reason, setReason] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  // One mutation for both kinds. They used to be two hand-rolled `apiPost`
  // hooks, kept out of the shared wrapper because `ReportSubjectType` listed
  // neither `review` nor `listing_public_question`. It lists both now.
  // `useCreateReport` carries the same `meta: { silentError: true }` those two
  // did, so this modal's own error panel below is still the only thing shown.
  const createReport = useCreateReport();
  const subjectType = SUBJECT_TYPES[subjectKind];
  // Server-owned taxonomy, falling back to the local one instantly and
  // silently: a member reaching for this button gets a working form either way.
  const reasons = useReportReasons(subjectType);
  const describeReportError = useReportSubmissionError();
  // What the failure panel says. A rolling flood cap refusal carries its own
  // member-facing explanation from the server, so the panel shows that instead
  // of the generic body copy; every other failure keeps the generic line.
  const [failureMessage, setFailureMessage] = useState<string | null>(null);

  // Only the review copy interpolates it; the question copy names nobody.
  const firstName = authorName ? (authorName.split(" ")[0] ?? authorName) : "";
  const title = t(TITLE_KEYS[subjectKind]);

  const submit = () => {
    if (!reason) return;
    setStatus("sending");
    setFailureMessage(null);
    const onSettled = {
      onSuccess: () => setStatus("done"),
      onError: (error: Error) => {
        logError(error, { scope: `marketing.report.${subjectKind}` });
        setFailureMessage(
          describeReportError(
            error,
            t("marketing:directory.detail.reportReview.errorBody"),
          ),
        );
        setStatus("error");
      },
    };
    createReport.mutate(
      { subjectType, subjectId, reasonCode: asReasonCode(reason) },
      onSettled,
    );
  };

  if (status === "done") {
    return (
      <ModalSheet onClose={onClose} success ariaLabel={title}>
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
      <ModalSheet onClose={onClose} ariaLabel={title}>
        <div className={styles.errorPanel}>
          <span className={styles.errorIcon} aria-hidden>
            <FiAlertTriangle />
          </span>
          <h2 className={styles.errorTitle}>
            {t("marketing:directory.detail.reportReview.errorTitle")}
          </h2>
          <p className={styles.errorBody} role="alert">
            {failureMessage ??
              t("marketing:directory.detail.reportReview.errorBody")}
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
    <ModalSheet onClose={onClose} ariaLabel={title}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.sub}>
        {t(SUB_KEYS[subjectKind], { name: firstName })}
      </p>
      <div
        className={styles.reasons}
        role="radiogroup"
        aria-label={t(
          "marketing:directory.detail.reportReview.reasonGroupAria",
        )}
      >
        {reasons.map((option) => {
          const on = reason === option.code;
          return (
            <button
              key={option.code}
              type="button"
              role="radio"
              aria-checked={on}
              className={[styles.reason, on && styles.reasonOn]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setReason(option.code)}
            >
              <span className={styles.radio} aria-hidden />
              {option.label}
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
            <Sending
              label={t("marketing:directory.detail.reportReview.sending")}
            />
          ) : (
            t("marketing:directory.detail.reportReview.sendCta")
          )}
        </Button>
      </div>
    </ModalSheet>
  );
}

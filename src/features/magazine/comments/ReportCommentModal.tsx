import { useState } from "react";
import { FiCheck, FiAlertTriangle } from "react-icons/fi";
import {
  Button,
  ModalSheet,
  RadioCardGroup,
  Sending,
} from "../../../shared/components/ui";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useCreateReport } from "../../safety/api/useCreateReport";
import { useReportSubmissionError } from "../../safety/api/reportSubmissionError";
import {
  asReasonCode,
  useReportReasons,
} from "../../safety/api/useReportReasons";
import { logError } from "../../../shared/observability/logger";
import styles from "./ArticleComments.module.css";

interface ReportCommentModalProps {
  /** Whose comment is being reported — shown in the heading. */
  authorName: string;
  /** The reported comment's real id (the report's `subjectId`). */
  subjectId: string;
  onClose: () => void;
}

/** Pick a reason → real submit → plum-panel confirmation (or an honest retry
 *  panel on failure). Adapted from `forum/ReportReplyModal.tsx` — identical
 *  flow, `subjectType` fixed to `"magazine_comment"` (a reader comment is
 *  never reported as anything else, so there's no prop for it). */
export function ReportCommentModal({
  authorName,
  subjectId,
  onClose,
}: ReportCommentModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  const createReport = useCreateReport();
  const describeReportError = useReportSubmissionError();
  // What the failure panel says. A rolling flood cap refusal carries its own
  // member-facing explanation from the server, so the panel shows that instead
  // of the generic body copy; every other failure keeps the generic line.
  const [failureMessage, setFailureMessage] = useState<string | null>(null);
  // See `ReportReplyModal`: server taxonomy, local instant fallback, and the
  // labels are now translated rather than the English `REASON_LABELS`.
  const REASONS = useReportReasons("magazine_comment");
  const firstName = authorName.split(" ")[0] ?? authorName;

  const submit = () => {
    if (!reason) return;
    setStatus("sending");
    setFailureMessage(null);
    createReport.mutate(
      {
        subjectType: "magazine_comment",
        subjectId,
        reasonCode: asReasonCode(reason),
      },
      {
        onSuccess: () => setStatus("done"),
        onError: (err) => {
          logError(err, { scope: "magazine.reportComment" });
          setFailureMessage(
            describeReportError(err, t("magazine:comments.report.errorBody")),
          );
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
        ariaLabel={t("magazine:comments.report.title")}
      >
        <div className={styles.confirm}>
          <span className={styles.confirmIcon} aria-hidden>
            <FiCheck />
          </span>
          <h2 className={styles.confirmTitle}>
            <Translation
              i18nKey="magazine:comments.report.confirmTitle"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.confirmBody}>
            {t("magazine:comments.report.confirmBody", { name: firstName })}
          </p>
          <div className={styles.confirmActions}>
            <Button variant="ghost-dark" onClick={onClose}>
              {t("magazine:comments.report.done")}
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
        ariaLabel={t("magazine:comments.report.title")}
      >
        <div className={styles.errorPanel}>
          <span className={styles.errorIcon} aria-hidden>
            <FiAlertTriangle />
          </span>
          <h2 className={styles.errorTitle}>
            {t("magazine:comments.report.errorTitle")}
          </h2>
          <p className={styles.errorBody} role="alert">
            {failureMessage ?? t("magazine:comments.report.errorBody")}
          </p>
          <div className={styles.errorActions}>
            <Button variant="ghost" type="button" onClick={onClose}>
              {t("magazine:comments.report.cancel")}
            </Button>
            <Button variant="primary" type="button" onClick={submit}>
              {t("magazine:comments.report.retryCta")}
            </Button>
          </div>
        </div>
      </ModalSheet>
    );
  }

  return (
    <ModalSheet
      onClose={onClose}
      ariaLabel={t("magazine:comments.report.title")}
    >
      <h2 className={styles.title}>{t("magazine:comments.report.title")}</h2>
      <p className={styles.sub}>
        {t("magazine:comments.report.sub", { name: firstName })}
      </p>
      <RadioCardGroup
        className={styles.reasons}
        optionClassName={styles.reason}
        checkedClassName={styles.reasonOn}
        ariaLabel={t("magazine:comments.report.reasonGroupAria")}
        value={reason ?? ""}
        onChange={setReason}
        options={REASONS.map((r) => ({
          id: r.code,
          render: (
            <>
              <span className={styles.radio} aria-hidden />
              {r.label}
            </>
          ),
        }))}
      />
      <div className={styles.actions}>
        <Button
          variant="ghost"
          type="button"
          onClick={onClose}
          disabled={status === "sending"}
        >
          {t("magazine:comments.report.cancel")}
        </Button>
        <Button
          variant="primary"
          type="button"
          onClick={submit}
          disabled={!reason || status === "sending"}
        >
          {status === "sending" ? (
            <Sending label={t("magazine:comments.report.sending")} />
          ) : (
            t("magazine:comments.report.sendCta")
          )}
        </Button>
      </div>
    </ModalSheet>
  );
}

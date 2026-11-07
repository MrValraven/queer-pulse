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
import {
  asReasonCode,
  useReportReasons,
} from "../../safety/api/useReportReasons";
import { logError } from "../../../shared/observability/logger";
import {
  reportCommentErrorCopy,
  type ReportCommentErrorCopy,
} from "./reportCommentError";
import styles from "./ArticleComments.module.css";

interface ReportCommentModalProps {
  /**
   * Whose comment is being reported, shown in the heading. `null` when the
   * comment carries no author name (a tombstoned or moderation-blanked row),
   * and the sheet then uses its subject-free copy. ENG-102: the caller used to
   * fall back to the VIEWER's own initials here, so the sheet named the
   * reporter as the person they were reporting.
   */
  authorName: string | null;
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
  // What the failure panel says: the catalog key of the specific cause (see
  // `reportCommentError.ts`), resolved at render so a lazy namespace that lands
  // late still shows its text.
  const [failure, setFailure] = useState<ReportCommentErrorCopy | null>(null);
  // See `ReportReplyModal`: server taxonomy, local instant fallback, and the
  // labels are now translated rather than the English `REASON_LABELS`.
  const REASONS = useReportReasons("magazine_comment");
  const reportedFirstName = authorName
    ? (authorName.split(" ")[0] ?? authorName)
    : null;

  const submit = () => {
    if (!reason) return;
    setStatus("sending");
    setFailure(null);
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
          setFailure(reportCommentErrorCopy(err));
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
            {reportedFirstName
              ? t("magazine:comments.report.confirmBody", {
                  name: reportedFirstName,
                })
              : t("magazine:comments.report.confirmBodyUnknown")}
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
            {t("magazine:comments.report.error.title")}
          </h2>
          <p className={styles.errorBody} role="alert">
            {failure ? t(failure.key, failure.values) : null}
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
        {reportedFirstName
          ? t("magazine:comments.report.sub", { name: reportedFirstName })
          : t("magazine:comments.report.subUnknown")}
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

import { useMemo, useState } from "react";
import { FiCheck, FiAlertTriangle } from "react-icons/fi";
import { Button, ModalSheet, Sending } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCreateReport } from "../safety/api/useCreateReport";
import {
  reasonsFor,
  type ReasonCode,
  type ReportSubjectType,
} from "../safety/reportReasons";
import { logError } from "../../shared/observability/logger";
import styles from "./ReportReplyModal.module.css";

interface ReportReplyModalProps {
  /** Whose content is being reported — shown in the heading. */
  authorName: string;
  /** Content id of the reported post — the report's `subjectId`. For a reply
   *  this is the reply's real `postId`; for the opening post it is the OP's
   *  `opPostId` (NOT the FE-synthetic thread id). */
  subjectId: string;
  /** What kind of forum content this is: the opening post (`"post"`) or a reply
   *  (`"reply"`). Drives both the report payload and the offered reasons. */
  subjectType: Extract<ReportSubjectType, "post" | "reply">;
  onClose: () => void;
}

/** Pick a reason → real submit → plum-panel confirmation (or an honest retry
 *  panel on failure). Used for both the opening post and individual replies. */
export function ReportReplyModal({
  authorName,
  subjectId,
  subjectType,
  onClose,
}: ReportReplyModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState<ReasonCode | null>(null);
  const [status, setStatus] = useState<
    "idle" | "sending" | "done" | "error"
  >("idle");
  const createReport = useCreateReport();

  // Reasons are subject-specific (post vs reply); recompute if the target
  // changes while mounted.
  const REASONS = useMemo(() => reasonsFor(subjectType), [subjectType]);

  const firstName = authorName.split(" ")[0] ?? authorName;

  const submit = () => {
    if (!reason) return;
    setStatus("sending");
    // Demo resolves after a short delay; live POSTs /reports. Same confirmation.
    createReport.mutate(
      { subjectType, subjectId, reasonCode: reason },
      {
        onSuccess: () => setStatus("done"),
        onError: (err) => {
          // A failed report must NOT show the success panel — surface a distinct
          // retry state so the member knows nothing was submitted.
          logError(err, { scope: "forum.reportReply" });
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
        ariaLabel={t("forum:reportReply.title")}
      >
        <div className={styles.confirm}>
          <span className={styles.confirmIcon} aria-hidden>
            <FiCheck />
          </span>
          <h2 className={styles.confirmTitle}>
            <Translation
              i18nKey="forum:reportReply.confirmTitle"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.confirmBody}>
            {t("forum:reportReply.confirmBody", { name: firstName })}
          </p>
          <div className={styles.confirmActions}>
            <Button variant="ghost-dark" onClick={onClose}>
              {t("forum:reportReply.done")}
            </Button>
          </div>
        </div>
      </ModalSheet>
    );
  }

  if (status === "error") {
    return (
      <ModalSheet onClose={onClose} ariaLabel={t("forum:reportReply.title")}>
        <div className={styles.errorPanel}>
          <span className={styles.errorIcon} aria-hidden>
            <FiAlertTriangle />
          </span>
          <h2 className={styles.errorTitle}>
            {t("forum:reportReply.errorTitle")}
          </h2>
          <p className={styles.errorBody}>{t("forum:reportReply.errorBody")}</p>
          <div className={styles.errorActions}>
            <Button variant="ghost" type="button" onClick={onClose}>
              {t("forum:reportReply.cancel")}
            </Button>
            <Button variant="primary" type="button" onClick={submit}>
              {t("forum:reportReply.retryCta")}
            </Button>
          </div>
        </div>
      </ModalSheet>
    );
  }

  return (
    <ModalSheet onClose={onClose} ariaLabel={t("forum:reportReply.title")}>
      <h2 className={styles.title}>{t("forum:reportReply.title")}</h2>
      <p className={styles.sub}>
        {t("forum:reportReply.sub", { name: firstName })}
      </p>
      <div
        className={styles.reasons}
        role="radiogroup"
        aria-label={t("forum:reportReply.reasonGroupAria")}
      >
        {REASONS.map((r) => {
          const on = reason === r.code;
          return (
            <button
              key={r.code}
              type="button"
              role="radio"
              aria-checked={on}
              className={[styles.reason, on && styles.reasonOn]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setReason(r.code)}
            >
              <span className={styles.radio} aria-hidden />
              {r.label}
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
          {t("forum:reportReply.cancel")}
        </Button>
        <Button
          variant="primary"
          type="button"
          onClick={submit}
          disabled={!reason || status === "sending"}
        >
          {status === "sending" ? (
            <Sending label={t("forum:reportReply.sending")} />
          ) : (
            t("forum:reportReply.sendCta")
          )}
        </Button>
      </div>
    </ModalSheet>
  );
}

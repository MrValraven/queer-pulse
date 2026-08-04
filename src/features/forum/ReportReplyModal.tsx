import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Button, ModalSheet, Sending } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCreateReport } from "../safety/api/useCreateReport";
import { reasonsFor, type ReasonCode } from "../safety/reportReasons";
import { logError } from "../../shared/observability/logger";
import styles from "./ReportReplyModal.module.css";

const REASONS = reasonsFor("reply");

interface ReportReplyModalProps {
  /** Whose reply is being reported — shown in the heading. */
  authorName: string;
  /** Content id of the reported reply — the report's `subjectId`. */
  subjectId: string;
  onClose: () => void;
}

/** Pick a reason → real submit → plum-panel confirmation. */
export function ReportReplyModal({
  authorName,
  subjectId,
  onClose,
}: ReportReplyModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState<ReasonCode | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const createReport = useCreateReport();

  const firstName = authorName.split(" ")[0] ?? authorName;

  const submit = () => {
    if (!reason) return;
    setStatus("sending");
    // Demo resolves after a short delay; live POSTs /reports. Same confirmation.
    createReport.mutate(
      { subjectType: "reply", subjectId, reasonCode: reason },
      {
        onSuccess: () => setStatus("done"),
        onError: (err) => {
          logError(err, { scope: "forum.reportReply" });
          setStatus("done");
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

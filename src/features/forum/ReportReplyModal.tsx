import { useEffect, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
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
  useScrollLock();
  const [reason, setReason] = useState<ReasonCode | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const createReport = useCreateReport();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

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

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={
          status === "done"
            ? `${styles.dialog} ${styles.dialogConfirm}`
            : styles.dialog
        }
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
        onClick={(e) => e.stopPropagation()}
      >
        {status === "done" ? (
          <div>
            <span className={styles.confirmIcon} aria-hidden>
              <FiCheck />
            </span>
            <h2 id="report-title" className={styles.confirmTitle}>
              Thank you — <em>we're on it.</em>
            </h2>
            <p className={styles.confirmBody}>
              A moderator will take a look. Reports stay private, and{" "}
              {authorName.split(" ")[0]} won't know it came from you.
            </p>
            <div className={styles.confirmActions}>
              <Button variant="ghost-dark" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h2 id="report-title" className={styles.title}>
              Report this reply
            </h2>
            <p className={styles.sub}>
              Let a moderator know what's wrong with {authorName.split(" ")[0]}
              's reply. This is private — no one is notified that you reported
              it.
            </p>
            <div
              className={styles.reasons}
              role="radiogroup"
              aria-label="Reason for reporting"
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
                Cancel
              </Button>
              <Button
                variant="primary"
                type="button"
                onClick={submit}
                disabled={!reason || status === "sending"}
              >
                {status === "sending" ? (
                  <>
                    <span className={styles.spinner} aria-hidden />
                    Sending…
                  </>
                ) : (
                  "Send report"
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

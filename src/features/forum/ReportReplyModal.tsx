import { useEffect, useRef, useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import styles from "./ReportReplyModal.module.css";

const REASONS = [
  "Harassment or a personal attack",
  "Hate speech or a slur",
  "Spam or self-promotion",
  "Off-topic or disruptive",
  "Something else",
] as const;

interface ReportReplyModalProps {
  /** Whose reply is being reported — shown in the heading. */
  authorName: string;
  onClose: () => void;
}

/** Pick a reason → short loading → plum-panel confirmation. */
export function ReportReplyModal({
  authorName,
  onClose,
}: ReportReplyModalProps) {
  useScrollLock();
  const [reason, setReason] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const submit = () => {
    if (!reason) return;
    setStatus("sending");
    timer.current = window.setTimeout(() => setStatus("done"), 900);
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
                const on = reason === r;
                return (
                  <button
                    key={r}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    className={[styles.reason, on && styles.reasonOn]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => setReason(r)}
                  >
                    <span className={styles.radio} aria-hidden />
                    {r}
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

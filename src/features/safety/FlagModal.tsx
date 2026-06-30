import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import styles from "./FlagModal.module.css";

const REASONS = [
  "A harassment or safety incident",
  "Discrimination or misgendering",
  "Staff didn't intervene when needed",
  "An accessibility problem",
  "The atmosphere has changed",
  "Other concern",
];

export function FlagModal({
  spaceName,
  onClose,
  onSubmitted,
}: {
  spaceName: string;
  onClose: () => void;
  onSubmitted?: (reason: string, detail: string) => void;
}) {
  const [reason, setReason] = useState(REASONS[0]!);
  const [detail, setDetail] = useState("");
  const [done, setDone] = useState(false);
  useScrollLock();

  const canSubmit = detail.trim().length >= 10;

  const submit = () => {
    if (!canSubmit) return;
    onSubmitted?.(reason, detail.trim());
    setDone(true);
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className={styles.scroll}>
          {done ? (
            <div>
              <div className={styles.successIcon}>
                <svg viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className={styles.title}>
                Flag <em>received.</em>
              </div>
              <p className={styles.sub}>
                Thank you. A moderator will read your report.{" "}
                <b>
                  Three independent flags trigger an immediate review and
                  temporary suspension of the badge
                </b>{" "}
                — your report counts toward that. We may contact you for detail,
                but never the venue.
              </p>
              <div className={styles.actions}>
                <Button
                  variant="ghost"
                  className={styles.full}
                  onClick={onClose}
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className={styles.eye}>Flag a safe space</div>
              <div className={styles.title}>
                What happened at <em>{spaceName}?</em>
              </div>
              <p className={styles.sub}>
                Flags are how we know when a space slips. Tell us what you saw —
                specifics help the review panel. Your name is never shared with
                the venue.
              </p>

              <div className={styles.label}>What's the concern?</div>
              <div className={styles.opts}>
                {REASONS.map((r) => (
                  <label
                    key={r}
                    className={[styles.opt, reason === r && styles.optChecked]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <input
                      type="radio"
                      name="flag-reason"
                      value={r}
                      checked={reason === r}
                      onChange={() => setReason(r)}
                    />
                    {r}
                  </label>
                ))}
              </div>

              <div className={styles.label}>Tell us what happened</div>
              <textarea
                className={styles.textarea}
                placeholder="When did it happen, what did you see or experience, and who was involved? Be as specific as you're comfortable with."
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
              />
              <div className={styles.counter}>
                {detail.trim().length < 10
                  ? `${10 - detail.trim().length} more characters to submit`
                  : `${detail.trim().length} characters`}
              </div>

              <div className={styles.note}>
                <svg viewBox="0 0 24 24">
                  <rect x={3} y={11} width={18} height={11} rx={2} />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Reports are confidential. Moderators see your name; the venue
                never does. In an emergency, call <strong>112</strong> first.
              </div>

              <div className={styles.actions}>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className={styles.full}
                  onClick={submit}
                  disabled={!canSubmit}
                >
                  Submit flag
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

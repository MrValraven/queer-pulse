import { useState } from "react";
import { FiShield } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import styles from "./VouchModal.module.css";

const RELATIONSHIPS = [
  "I go here regularly",
  "I've been once or twice",
  "I work or volunteer here",
  "I came with a friend who needed it",
];

/**
 * Add a safety vouch for a verified space. A short relationship + note form that
 * runs loading → animated plum-panel success. Self-contained: owns its own state
 * and locks scroll while mounted.
 */
export function VouchModal({
  spaceName,
  onClose,
}: {
  spaceName: string;
  onClose: () => void;
}) {
  const [relationship, setRelationship] = useState(RELATIONSHIPS[0]);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"form" | "loading" | "done">("form");
  useScrollLock();

  const canSubmit = note.trim().length >= 12;

  const submit = () => {
    if (!canSubmit) return;
    setStatus("loading");
    window.setTimeout(() => setStatus("done"), 1100);
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
          {status === "done" ? (
            <div className={styles.success}>
              <div className={styles.successIcon}>
                <FiShield size={28} />
              </div>
              <div className={styles.successTitle}>
                Your vouch is <em>in.</em>
              </div>
              <p className={styles.successSub}>
                Thank you for standing behind <b>{spaceName}</b>. Member vouches
                are how others know a space is safe before they ever walk in —
                yours will appear once a moderator confirms it.
              </p>
              <div className={styles.successActions}>
                <Button
                  variant="ghost-dark"
                  className={styles.full}
                  onClick={onClose}
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className={styles.eye}>Add your vouch</div>
              <div className={styles.title}>
                Stand behind <em>{spaceName}</em>
              </div>
              <p className={styles.sub}>
                A vouch is a short, honest note about why this space feels safe
                to you. Specifics help other members trust it.
              </p>

              <div className={styles.label}>How do you know this space?</div>
              <div className={styles.opts}>
                {RELATIONSHIPS.map((r) => (
                  <label
                    key={r}
                    className={[
                      styles.opt,
                      relationship === r && styles.optChecked,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <input
                      type="radio"
                      name="vouch-relationship"
                      value={r}
                      checked={relationship === r}
                      onChange={() => setRelationship(r)}
                    />
                    {r}
                  </label>
                ))}
              </div>

              <div className={styles.label}>Your note</div>
              <textarea
                className={styles.textarea}
                placeholder="What makes this space feel safe to you? Staff, atmosphere, accessibility, a moment that mattered…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className={styles.counter}>
                {note.trim().length < 12
                  ? `${12 - note.trim().length} more characters to submit`
                  : `${note.trim().length} characters`}
              </div>

              <div className={styles.actions}>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className={styles.full}
                  onClick={submit}
                  disabled={!canSubmit || status === "loading"}
                >
                  {status === "loading" ? "Submitting…" : "Add my vouch"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

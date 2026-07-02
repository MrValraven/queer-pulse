import { useEffect, useState } from "react";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { PostProfileForm } from "./PostProfileForm";
import styles from "./FlatmatesPage.module.css";

export function PostProfileModal({ onClose }: { onClose: () => void }) {
  useScrollLock();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Post your flatmate profile"
      >
        <button
          type="button"
          className={styles.modalX}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {submitted ? (
          <div className={styles.success}>
            <div className={styles.successIcon}>
              <svg
                viewBox="0 0 28 28"
                fill="none"
                stroke="var(--jade)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 14l6 6L23 8" />
              </svg>
            </div>
            <h2>
              You're on the <em>board.</em>
            </h2>
            <p>
              Your profile is live. Members will reach out directly — keep an
              eye on your QueerPulse messages.
            </p>
            <Button type="button" variant="ghost" onClick={onClose}>
              Back to profiles
            </Button>
          </div>
        ) : (
          <PostProfileForm
            onSubmit={() => setSubmitted(true)}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}

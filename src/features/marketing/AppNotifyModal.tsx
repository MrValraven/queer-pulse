import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import styles from "./MarketingModal.module.css";

export type AppPlatform = "iOS" | "Android";

export function AppNotifyModal({
  platform,
  onClose,
}: {
  platform: AppPlatform;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  useScrollLock();

  const valid = /.+@.+\..+/.test(email);

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`${styles.modal} ${sent ? styles.modalSuccess : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Get notified at launch"
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        {sent ? (
          <div className={styles.success}>
            <div className={styles.successIcon}>
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M5 12.5l4 4L19 7" />
              </svg>
            </div>
            <h2>
              We'll let you <em>know.</em>
            </h2>
            <p>
              You're on the list for the {platform} launch. We'll email{" "}
              <b>{email}</b> the day it lands — and nothing else.
            </p>
            <Button size="lg" variant="ghost-dark" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (valid) setSent(true);
            }}
          >
            <div className={styles.eye}>
              {platform === "iOS" ? "App Store" : "Google Play"} · coming soon
            </div>
            <h2 className={styles.title}>
              QueerPulse is coming to <em>{platform}.</em>
            </h2>
            <p className={styles.lead}>
              The app isn't in the store yet. Drop your email and we'll let you
              know the moment the {platform} build is live. No marketing, no
              lists you didn't ask for.
            </p>
            <div className={styles.field}>
              <label htmlFor="notify-email">
                Your email <span className={styles.req}>*</span>
              </label>
              <input
                id="notify-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoFocus
              />
              <span className={styles.hint}>
                We'll only use this for the launch heads-up.
              </span>
            </div>
            <div className={styles.foot}>
              <button type="button" className={styles.back} onClick={onClose}>
                ← Maybe later
              </button>
              <Button size="lg" type="submit" disabled={!valid}>
                Notify me →
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

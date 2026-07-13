import { FiAlertCircle } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import type { DeleteOption } from "./deleteAccount.data";
import type { DeletionRequest } from "./api/account.api";
import styles from "./DeleteAccountPage.module.css";

/** The two mutually-exclusive account-off-ramp cards (deactivate / delete). */
export function DeleteOptionCards({
  opt,
  setOpt,
}: {
  opt: DeleteOption;
  setOpt: (o: DeleteOption) => void;
}) {
  return (
    <div className={styles.optionGrid}>
      <div
        className={[
          styles.optCard,
          opt === "deactivate" && styles.optCardSelected,
        ]
          .filter(Boolean)
          .join(" ")}
        role="button"
        tabIndex={0}
        aria-pressed={opt === "deactivate"}
        onClick={() => setOpt("deactivate")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpt("deactivate");
          }
        }}
      >
        <div className={styles.optRadio}>
          <div className={styles.optRadioInner} />
        </div>
        <div className={`${styles.optIcon} ${styles.optIconDefault}`}>
          <svg
            className={styles.optIconSvg}
            viewBox="0 0 20 20"
            stroke="var(--plum)"
          >
            <circle cx="10" cy="10" r="8" />
            <line x1="7" y1="10" x2="13" y2="10" />
          </svg>
        </div>
        <div className={styles.optTitle}>Deactivate</div>
        <div className={styles.optDesc}>
          Your profile becomes invisible. Your data is preserved. You can
          reactivate any time by signing back in.
        </div>
        <div className={`${styles.optTag} ${styles.optTagRev}`}>Reversible</div>
      </div>
      <div
        className={[
          styles.optCard,
          styles.optCardDanger,
          opt === "delete" && styles.optCardSelected,
        ]
          .filter(Boolean)
          .join(" ")}
        role="button"
        tabIndex={0}
        aria-pressed={opt === "delete"}
        onClick={() => setOpt("delete")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpt("delete");
          }
        }}
      >
        <div className={styles.optRadio}>
          <div className={styles.optRadioInner} />
        </div>
        <div className={`${styles.optIcon} ${styles.optIconDanger}`}>
          <svg
            className={styles.optIconSvg}
            viewBox="0 0 20 20"
            stroke="var(--accent-ink)"
          >
            <polyline points="4,5 16,5" />
            <path d="M7 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M6 5l.6 11h6.8l.6-11" />
          </svg>
        </div>
        <div className={`${styles.optTitle} ${styles.optTitleDanger}`}>
          Delete account
        </div>
        <div className={styles.optDesc}>
          Permanently erases your account and all associated data within 30
          days. This cannot be undone.
        </div>
        <div className={`${styles.optTag} ${styles.optTagPerm}`}>Permanent</div>
      </div>
    </div>
  );
}

/**
 * Shown in place of the delete form when a deletion request is already pending
 * (from `GET /account/deletion-request`). Honest, cancellable during grace.
 */
export function DeletePendingBanner({
  request,
  onCancel,
  cancelling,
}: {
  request: DeletionRequest;
  onCancel: () => void;
  cancelling: boolean;
}) {
  const when = new Date(request.scheduledErasureAt).toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );
  return (
    <div className={styles.pauseStrip}>
      <FiAlertCircle className={styles.pauseStripIcon} aria-hidden="true" />
      <div>
        <p className={styles.pauseStripText}>
          <strong>Your account is scheduled for deletion.</strong> Everything is
          hidden now and will be permanently erased on <strong>{when}</strong>.
          Changed your mind? You can still cancel and pick up where you left
          off.
        </p>
        <Button
          variant="primary"
          onClick={onCancel}
          disabled={cancelling}
          style={{ marginTop: 12 }}
        >
          {cancelling ? "Cancelling…" : "Cancel deletion"}
        </Button>
      </div>
    </div>
  );
}

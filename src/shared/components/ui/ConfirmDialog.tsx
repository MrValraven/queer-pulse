import { type ReactNode } from "react";
import { Button } from "./Button";
import { FormField } from "./FormField";
import { Modal } from "./Modal";
import { useTranslation } from "../../i18n/useTranslation";
import styles from "./ConfirmDialog.module.css";

/** Optional reason capture — an inline textarea the caller owns the state of. */
export interface ConfirmDialogReason {
  value: string;
  onChange: (value: string) => void;
  /** Visible field label. */
  label: string;
  placeholder?: string;
  /** When true, Confirm stays disabled until the reason is non-empty. */
  required?: boolean;
  /**
   * With `required`, the trimmed length the reason must reach before Confirm
   * enables. Defaults to 1, which is the plain non-empty rule every existing
   * caller already gets. Set it where the server enforces a floor of its own,
   * so the dialog stops the moderator instead of sending a request that comes
   * back 400: the staff-role grant/revoke reason takes 10 (PRD-288).
   */
  minLength?: number;
  /** Caps the textarea length and shows a live `used/max` counter. */
  maxLength?: number;
}

export interface ConfirmDialogProps {
  /** The dialog only mounts (scroll-lock, focus-trap) while this is true. */
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  /** Supporting copy under the title. Use `children` for richer bodies. */
  description?: ReactNode;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  /** `destructive` renders the confirm action in the danger variant. */
  tone?: "default" | "destructive";
  /** True while the confirmed action is in flight — disables both buttons. */
  loading?: boolean;
  reason?: ConfirmDialogReason;
  children?: ReactNode;
}

/**
 * Confirm/cancel dialog built on the shared `Modal` — scroll-lock, Escape,
 * click-out, focus-trap and focus-restore all come from `Modal`. Consolidates
 * the per-feature confirm modals (forum delete, admin remove/bulk-remove/
 * send-back, delete-conversation): title + optional description/children, an
 * optional reason textarea, and a Cancel + Confirm footer. The confirm button
 * takes the `danger` variant when `tone="destructive"`, and stays disabled
 * while `loading` or while a `required` reason is short of its
 * `minLength` (empty, by default).
 *
 * Mount only while open (the caller gates on `open`, and `Modal`'s a11y setup
 * runs per open) — this component also returns `null` when closed as a guard.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = "default",
  loading = false,
  reason,
  children,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  if (!open) return null;

  const reasonMissing = Boolean(
    reason?.required &&
    reason.value.trim().length < Math.max(1, reason.minLength ?? 1),
  );
  const confirmDisabled = loading || reasonMissing;

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel ?? t("shared:confirmDialog.cancel")}
          </Button>
          <Button
            variant={tone === "destructive" ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={confirmDisabled}
          >
            {confirmLabel ?? t("shared:confirmDialog.confirm")}
          </Button>
        </>
      }
    >
      {description && <p className={styles.description}>{description}</p>}
      {children}
      {reason && (
        <div className={styles.reason}>
          <FormField label={reason.label} required={reason.required}>
            <textarea
              value={reason.value}
              rows={3}
              placeholder={reason.placeholder}
              maxLength={reason.maxLength}
              onChange={(event) => reason.onChange(event.target.value)}
            />
          </FormField>
          {reason.maxLength != null && (
            <span className={styles.reasonCount} aria-hidden>
              {reason.value.length}/{reason.maxLength}
            </span>
          )}
        </div>
      )}
    </Modal>
  );
}

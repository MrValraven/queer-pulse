import { useEffect, useId, type ReactNode } from "react";
import { FiAlertCircle, FiCheck, FiLoader } from "react-icons/fi";
import { normalizeHandle } from "../../shared/handles";
import {
  useHandleAvailability,
  type HandleAvailability,
  type HandleStatus,
} from "./api/useHandleAvailability";
import {
  USERNAME_CHECKING,
  USERNAME_FREE,
  USERNAME_REASON_COPY,
  USERNAME_YOURS,
} from "./usernameField.data";
import styles from "./UsernameField.module.css";

interface UsernameFieldProps {
  /** Controlled value (without the leading `@`). */
  value: string;
  onChange: (value: string) => void;
  /** The member's existing username/handle — never reads as "taken against self". */
  currentName?: string;
  label?: string;
  hint?: ReactNode;
  /** Notified whenever availability changes, so a host can block its save. */
  onStatusChange?: (availability: HandleAvailability) => void;
}

const STATUS_ICON: Record<HandleStatus, ReactNode> = {
  idle: null,
  checking: <FiLoader aria-hidden />,
  available: <FiCheck aria-hidden />,
  unavailable: <FiAlertCircle aria-hidden />,
};

/**
 * A reusable `@username` field with live, debounced availability across the
 * whole handle namespace. Reused by the Settings profile edit and the subprofile
 * handle field so both reflect the same collisions. State is shown with an icon
 * AND a message (never colour alone), and announced via an `aria-live` region.
 */
export function UsernameField({
  value,
  onChange,
  currentName,
  label = "Username",
  hint,
  onStatusChange,
}: UsernameFieldProps) {
  const inputId = useId();
  const statusId = useId();
  const availability = useHandleAvailability(value, { currentName });
  const { status, reason } = availability;

  useEffect(() => {
    onStatusChange?.(availability);
    // Re-run only when the verdict changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, reason, onStatusChange]);

  const isSelf =
    value.trim().length > 0 &&
    !!currentName &&
    normalizeHandle(value) === normalizeHandle(currentName);

  let message: string | null = null;
  if (status === "checking") message = USERNAME_CHECKING;
  else if (status === "available")
    message = isSelf ? USERNAME_YOURS : USERNAME_FREE;
  else if (status === "unavailable" && reason)
    message = USERNAME_REASON_COPY[reason];

  const invalid = status === "unavailable";

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <div className={styles.inputWrap} data-state={status}>
        <span className={styles.at} aria-hidden>
          @
        </span>
        <input
          id={inputId}
          className={styles.input}
          type="text"
          inputMode="text"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="yourname"
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase())}
          aria-invalid={invalid || undefined}
          aria-describedby={statusId}
        />
      </div>

      <p
        id={statusId}
        className={styles.status}
        data-state={status}
        role="status"
        aria-live="polite"
      >
        {message ? (
          <>
            <span className={styles.statusIcon}>{STATUS_ICON[status]}</span>
            {message}
          </>
        ) : hint ? (
          <span className={styles.hint}>{hint}</span>
        ) : null}
      </p>
    </div>
  );
}

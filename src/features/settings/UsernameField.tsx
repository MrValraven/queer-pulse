import { useEffect, useId, useRef, type ReactNode } from "react";
import { FiAlertCircle, FiCheck, FiLoader } from "react-icons/fi";
import { normalizeHandle } from "../../shared/handles";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  useHandleAvailability,
  type HandleAvailability,
  type HandleStatus,
} from "./api/useHandleAvailability";
import {
  USERNAME_CHECKING_KEY,
  USERNAME_FREE_KEY,
  USERNAME_REASON_KEYS,
  USERNAME_YOURS_KEY,
} from "./usernameField.data";
import styles from "./UsernameField.module.css";

interface UsernameFieldProps {
  /** Controlled value (without the leading `@`). */
  value: string;
  onChange: (value: string) => void;
  /** The member's existing username or handle, which reads as "yours" when typed. */
  currentName?: string;
  label?: string;
  hint?: ReactNode;
  /** A host-owned validation error (a rule the availability check cannot see).
   *  When set it takes the status line, marks the input invalid and hides the
   *  "looks free" verdict, so the field never reads as fine and wrong at once. */
  error?: string;
  /** The adornment before the input. Defaults to `@`. */
  prefix?: ReactNode;
  /** Defaults to the Settings username placeholder. */
  placeholder?: string;
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
  label,
  hint,
  error,
  prefix = "@",
  placeholder,
  onStatusChange,
}: UsernameFieldProps) {
  const { t } = useTranslation();
  const inputId = useId();
  const statusId = useId();
  const availability = useHandleAvailability(value, { currentName });
  const { status, reason } = availability;

  // Notify the parent when the availability *verdict* changes. The callback and
  // the availability object are read through latest-refs so the effect's deps
  // stay honest ([status, reason]) without re-firing on every render or when the
  // parent passes a fresh inline onStatusChange.
  const onStatusChangeRef = useRef(onStatusChange);
  const availabilityRef = useRef(availability);
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
    availabilityRef.current = availability;
  });
  useEffect(() => {
    onStatusChangeRef.current?.(availabilityRef.current);
  }, [status, reason]);

  const isSelf =
    value.trim().length > 0 &&
    !!currentName &&
    normalizeHandle(value) === normalizeHandle(currentName);

  let message: string | null = null;
  if (error) message = error;
  else if (status === "checking") message = t(USERNAME_CHECKING_KEY);
  else if (status === "available")
    message = t(isSelf ? USERNAME_YOURS_KEY : USERNAME_FREE_KEY);
  else if (status === "unavailable" && reason)
    message = t(USERNAME_REASON_KEYS[reason]);

  const resolvedLabel = label ?? t("settings:usernameField.defaultLabel");
  // A host error shows as the same red, invalid state an unavailable handle does.
  const displayState: HandleStatus = error ? "unavailable" : status;
  const isInvalid = displayState === "unavailable";

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={inputId}>
        {resolvedLabel}
      </label>
      <div className={styles.inputWrap} data-state={displayState}>
        <span className={styles.at} aria-hidden>
          {prefix}
        </span>
        <input
          id={inputId}
          className={styles.input}
          type="text"
          inputMode="text"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder={placeholder ?? t("settings:usernameField.placeholder")}
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase())}
          aria-invalid={isInvalid || undefined}
          aria-describedby={statusId}
        />
      </div>

      <p
        id={statusId}
        className={styles.status}
        data-state={displayState}
        role="status"
        aria-live="polite"
      >
        {message ? (
          <>
            <span className={styles.statusIcon}>
              {STATUS_ICON[displayState]}
            </span>
            {message}
          </>
        ) : hint ? (
          <span className={styles.hint}>{hint}</span>
        ) : null}
      </p>
    </div>
  );
}

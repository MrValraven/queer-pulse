import { useId, type ReactNode } from "react";
import styles from "./FormField.module.css";

interface FormFieldProps {
  /** Visible field label. Omit for fields that supply their own labelling. */
  label?: ReactNode;
  /** Marks the field required (adds a coral `*` and sets `aria-required` hint). */
  required?: boolean;
  /** Helper text shown below the control when there's no error. */
  helper?: ReactNode;
  /** Error message — shown in coral and sets `aria-invalid` on the control. */
  error?: ReactNode;
  /** Success message — shown in jade (e.g. "Username available"). */
  ok?: ReactNode;
  /** Optional trailing label content, e.g. a live character count. */
  labelAside?: ReactNode;
  className?: string;
  /** The control: an `<input>`, `<textarea>`, `<select>`, or custom node. */
  children: ReactNode;
}

/**
 * Label + control + helper/error scaffold. The control is passed as a child so
 * any native element works; styling is applied via the descendant selectors in
 * the CSS module, so callers don't add a className to the input itself.
 *
 * For accessibility, pass the generated `id` through if you need to associate a
 * specific control — most callers can rely on the wrapping `<label>`.
 */
export function FormField({
  label,
  required = false,
  helper,
  error,
  ok,
  labelAside,
  className,
  children,
}: FormFieldProps) {
  const errorId = useId();
  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      {label && (
        <label className={styles.label}>
          <span>
            {label}
            {required && (
              <>
                {" "}
                <span className={styles.req} aria-hidden>
                  *
                </span>
              </>
            )}
          </span>
          {labelAside && <span className={styles.charCount}>{labelAside}</span>}
        </label>
      )}
      <div className={styles.wrap}>{children}</div>
      {error ? (
        <span className={styles.error} id={errorId} role="alert">
          {error}
        </span>
      ) : ok ? (
        <span className={styles.ok}>{ok}</span>
      ) : (
        helper && <span className={styles.helper}>{helper}</span>
      )}
    </div>
  );
}

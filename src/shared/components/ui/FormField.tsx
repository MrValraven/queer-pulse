import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  type ReactElement,
  type ReactNode,
} from "react";
import styles from "./FormField.module.css";

interface FormFieldProps {
  /** Visible field label. Omit for fields that supply their own labelling. */
  label?: ReactNode;
  /** Marks the field required: adds a coral `*` and sets `aria-required` on the control. */
  required?: boolean;
  /** Helper text shown below the control; also becomes the control's description. */
  helper?: ReactNode;
  /** Error message — shown in coral and sets `aria-invalid` on the control. */
  error?: ReactNode;
  /** Success message — shown in jade (e.g. "Username available"). */
  ok?: ReactNode;
  /** Optional trailing label content, e.g. a live character count. */
  labelAside?: ReactNode;
  className?: string;
  /** Optional id on the field wrapper — e.g. a scroll/anchor target. */
  id?: string;
  /** The control: an `<input>`, `<textarea>`, `<select>`, or custom node. */
  children: ReactNode;
}

/** The accessibility props this component injects into a native control. */
type ControlProps = {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-required"?: boolean | "true" | "false";
};

/**
 * The child we can safely wire up: a single element rendering either a host
 * (native) element (`typeof type === "string"`) or a custom control that has
 * opted in by declaring a truthy static `formFieldControl` — its contract being
 * that it forwards the injected `id`/`aria-*` onto its own focusable control
 * (as `Select` does, onto its trigger button).
 *
 * Any other custom component is deliberately excluded. Nothing guarantees it
 * spreads unknown props onto its control — most in this repo don't — so
 * injecting would either vanish silently or, worse, land `aria-invalid` on a
 * wrapper `<div>`, and the `<label htmlFor>` would point at an id that never
 * reaches the DOM. Multi-child and text children are excluded for the same
 * reason. Those cases degrade to exactly the old markup (label without
 * `htmlFor`); the caller stays responsible for labelling, as `ChipSelect`'s
 * `label`/`labelledBy` props do.
 */
function wireableControl(children: ReactNode): ReactElement<ControlProps> | null {
  if (Children.count(children) !== 1 || !isValidElement(children)) return null;
  const only = children as ReactElement<ControlProps>;
  if (typeof only.type === "string") return only;
  const optedIn =
    typeof only.type === "function" &&
    (only.type as { formFieldControl?: boolean }).formFieldControl === true;
  return optedIn ? only : null;
}

/**
 * Label + control + helper/error scaffold. The control is passed as a child so
 * any native element works; styling is applied via the descendant selectors in
 * the CSS module, so callers don't add a className to the input itself.
 *
 * When that child is a native control, this component owns its accessibility
 * wiring — `id` + `htmlFor`, `aria-describedby` for the helper/error text,
 * `aria-invalid`, `aria-required` — so no call site has to repeat it. A caller
 * that passes its own `id` keeps it; the label follows the caller's id rather
 * than clobbering it.
 */
export function FormField({
  label,
  required = false,
  helper,
  error,
  ok,
  labelAside,
  className,
  id,
  children,
}: FormFieldProps) {
  const uid = useId();
  const controlId = `${uid}-control`;
  const helperId = `${uid}-helper`;
  const errorId = `${uid}-error`;

  const control = wireableControl(children);
  // The helper stays visible alongside an error rather than being replaced by
  // it: the hint is what tells you how to fix the thing that just failed.
  const describedBy =
    [
      control?.props["aria-describedby"],
      helper ? helperId : null,
      error ? errorId : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  const wiredControl = control
    ? cloneElement(control, {
        id: control.props.id ?? controlId,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : control.props["aria-invalid"],
        "aria-required": required ? true : control.props["aria-required"],
      })
    : children;

  const labelFor = control ? (control.props.id ?? controlId) : undefined;

  return (
    <div
      id={id}
      className={[styles.field, className].filter(Boolean).join(" ")}
    >
      {label && (
        <label className={styles.label} htmlFor={labelFor}>
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
      <div className={styles.wrap}>{wiredControl}</div>
      {helper && (
        <span className={styles.helper} id={helperId}>
          {helper}
        </span>
      )}
      {error ? (
        <span className={styles.error} id={errorId} role="alert">
          {error}
        </span>
      ) : (
        ok && <span className={styles.ok}>{ok}</span>
      )}
    </div>
  );
}

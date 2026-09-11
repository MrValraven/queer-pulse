import { useId, type ReactNode } from "react";
import styles from "./EditDetailsModal.module.css";

/**
 * One titled part of the edit-details modal. The form is long, so on a phone
 * the host reads it in named parts: the gathering, when and where, who it is
 * for, taking care, and RSVPs. The modal's own title is an `h3`, so these are
 * `h4`s.
 *
 * Each part is a named group, so a screen reader hears where its fields
 * belong while the dialog stays the only landmark.
 */
export function EditDetailsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const headingId = useId();
  return (
    <div role="group" className={styles.section} aria-labelledby={headingId}>
      <h4 id={headingId} className={styles.sectionTitle}>
        {title}
      </h4>
      {children}
    </div>
  );
}

/**
 * A modal field with no single native control (chips, a switch list, the
 * cover, the cost segment), drawn in the modal's look: the uppercase label,
 * then the hint, then the control.
 *
 * A group of buttons is not a labelable element, so the label is a plain
 * element whose id the control takes as `aria-labelledby`. The ids reach the
 * control through `children`.
 */
export function EditDetailsGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: (ids: { labelId: string; hintId: string | undefined }) => ReactNode;
}) {
  const labelId = useId();
  const hintId = hint ? `${labelId}-hint` : undefined;
  return (
    <div className={styles.group}>
      <div id={labelId} className={styles.groupLabel}>
        {label}
      </div>
      {hint && (
        <p id={hintId} className={styles.groupHint}>
          {hint}
        </p>
      )}
      {children({ labelId, hintId })}
    </div>
  );
}

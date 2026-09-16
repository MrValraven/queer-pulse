import type { ReactNode } from "react";
import { FiCheck } from "react-icons/fi";
import styles from "./ForwardPickerModal.module.css";

interface ForwardRecipientRowProps {
  isSelected: boolean;
  isAtCap: boolean;
  isSending: boolean;
  capNoticeId: string;
  onToggle: () => void;
  children: ReactNode;
}

/**
 * One row in `ForwardRecipientList`: a native `<input type="checkbox">`
 * inside a `<label>`, so it is announced and operated the same way any
 * other checkbox list is, with a trailing check circle mirroring
 * `MemberSelectList`'s own visual. Shared by the People and Groups
 * fieldsets. Extracted into its own file purely to keep
 * `ForwardRecipientList` under the line cap.
 */
export function ForwardRecipientRow({
  isSelected,
  isAtCap,
  isSending,
  capNoticeId,
  onToggle,
  children,
}: ForwardRecipientRowProps) {
  const isCapDisabled = isAtCap && !isSelected;
  return (
    <li>
      <label
        className={[styles.row, isSelected && styles.rowSelected]
          .filter(Boolean)
          .join(" ")}
      >
        <input
          type="checkbox"
          className={styles.rowCheckbox}
          checked={isSelected}
          disabled={isSending}
          aria-disabled={isCapDisabled || undefined}
          aria-describedby={isCapDisabled ? capNoticeId : undefined}
          // A capped, unselected row stays focusable, with its state
          // announced via `aria-disabled` rather than the native `disabled`
          // attribute (which would pull it out of tab order entirely). The
          // click is simply ignored before it can flip the checkbox.
          onClick={(event) => {
            if (isCapDisabled) event.preventDefault();
          }}
          onChange={() => {
            if (isCapDisabled) return;
            onToggle();
          }}
        />
        {children}
        <span
          className={[styles.check, isSelected && styles.checkOn]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        >
          {isSelected && <FiCheck />}
        </span>
      </label>
    </li>
  );
}

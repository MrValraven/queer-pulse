import { useState } from "react";
import { FiX } from "react-icons/fi";
import { Button, FormField } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import styles from "./GatheringModals.module.css";

export function InlineEditModal({
  label,
  initialValue,
  multiline = false,
  onClose,
  onSave,
}: {
  label: string;
  initialValue: string;
  multiline?: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
}) {
  useScrollLock();
  const [value, setValue] = useState(initialValue);
  const canSave = value.trim().length > 0 && value !== initialValue;

  const save = () => {
    if (value.trim().length === 0) return;
    onSave(value.trim());
    onClose();
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close"
        >
          <FiX />
        </button>
        <div className={styles.eye}>Edit</div>
        <div className={styles.title}>{label}</div>

        <div className={styles.fields}>
          <FormField>
            {multiline ? (
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
              />
            ) : (
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
              />
            )}
          </FormField>
        </div>

        <div className={styles.actions}>
          <Button variant="primary" onClick={save} disabled={!canSave}>
            Save
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

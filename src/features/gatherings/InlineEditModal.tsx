import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { Button, FormField } from "../../shared/components/ui";
import { useScrollLock } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./GatheringModals.module.css";

export function InlineEditModal({
  /** A plain, already-translated noun, e.g. "date" or "description". */
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
  const { t } = useTranslation();
  useScrollLock();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const [value, setValue] = useState(initialValue);
  const canSave = value.trim().length > 0 && value !== initialValue;

  const save = () => {
    if (value.trim().length === 0) return;
    onSave(value.trim());
    onClose();
  };

  const editTitle = t("gatherings:manage.inlineEdit.title", { label });

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={editTitle}
        className={styles.modal}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={t("gatherings:manage.closeAria")}
        >
          <FiX />
        </button>
        <div className={styles.eye}>{t("gatherings:manage.inlineEdit.eyebrow")}</div>
        <div className={styles.title}>{editTitle}</div>

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
            {t("gatherings:manage.inlineEdit.saveCta")}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {t("gatherings:manage.cancelCta")}
          </Button>
        </div>
      </div>
    </div>
  );
}

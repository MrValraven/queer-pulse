import { useState } from "react";
import { Button, FormField, Modal } from "../../shared/components/ui";
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
  const [value, setValue] = useState(initialValue);
  const canSave = value.trim().length > 0 && value !== initialValue;

  const save = () => {
    if (value.trim().length === 0) return;
    onSave(value.trim());
    onClose();
  };

  const editTitle = t("gatherings:manage.inlineEdit.title", { label });

  return (
    <Modal
      eyebrow={t("gatherings:manage.inlineEdit.eyebrow")}
      title={editTitle}
      onClose={onClose}
      footer={
        <>
          <Button variant="primary" onClick={save} disabled={!canSave}>
            {t("gatherings:manage.inlineEdit.saveCta")}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {t("gatherings:manage.cancelCta")}
          </Button>
        </>
      }
    >
      <div className={styles.fields}>
        <FormField>
          {multiline ? (
            <textarea
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          )}
        </FormField>
      </div>
    </Modal>
  );
}

import { useState } from "react";
import { Modal, Button, FormField } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./DeskModals.module.css";

interface HandoffModalProps {
  piece: { title: string };
  editors: { id: string; name: string }[];
  onClose: () => void;
  onHandoff: (editorId: string) => void;
}

/** Hand a piece to another editor on the desk. */
export function HandoffModal({
  piece,
  editors,
  onClose,
  onHandoff,
}: HandoffModalProps) {
  const { t } = useTranslation();
  const [editorId, setEditorId] = useState(editors[0]?.id ?? "");
  return (
    <Modal
      title={t("magazine:desk.modals.handoff.title")}
      onClose={onClose}
      footer={
        <div className={styles.actions}>
          <Button variant="ghost" onClick={onClose}>
            {t("magazine:desk.modals.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onHandoff(editorId);
              onClose();
            }}
            disabled={!editorId}
          >
            {t("magazine:desk.modals.handoff.cta")}
          </Button>
        </div>
      }
    >
      <p className={styles.body}>
        {t("magazine:desk.modals.handoff.body", { title: piece.title })}
      </p>
      <FormField label={t("magazine:desk.modals.handoff.toLabel")}>
        <select
          value={editorId}
          onChange={(event) => setEditorId(event.target.value)}
        >
          {editors.map((editor) => (
            <option key={editor.id} value={editor.id}>
              {editor.name}
            </option>
          ))}
        </select>
      </FormField>
    </Modal>
  );
}

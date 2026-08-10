import { useState } from "react";
import { Modal, Button, FilterChips, FormField } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { PASS_TEMPLATES } from "./deskModals.data";
import styles from "./DeskModals.module.css";

export interface PassPayload {
  body: string;
}

interface PassModalProps {
  pitch: { title: string };
  onClose: () => void;
  onPass: (payload: PassPayload) => void;
}

/**
 * Pass on a pitch, with a human note instead of a form rejection. A template
 * chip fills the textarea as a starting point — the writer still gets your
 * own words, not a canned line, since the text stays fully editable after.
 */
export function PassModal({ pitch, onClose, onPass }: PassModalProps) {
  const { t } = useTranslation();
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [body, setBody] = useState("");

  const applyTemplate = (id: string) => {
    const template = PASS_TEMPLATES.find((candidate) => candidate.id === id);
    if (!template) return;
    setTemplateId(id);
    setBody(template.body);
  };

  const send = () => {
    onPass({ body: body.trim() });
    onClose();
  };

  return (
    <Modal
      title={t("magazine:desk.modals.pass.title", { title: pitch.title })}
      onClose={onClose}
      footer={
        <div className={styles.actions}>
          <Button variant="ghost" onClick={onClose}>
            {t("magazine:desk.modals.cancel")}
          </Button>
          <Button variant="primary" onClick={send} disabled={body.trim().length === 0}>
            {t("magazine:desk.modals.pass.send")}
          </Button>
        </div>
      }
    >
      <p className={styles.body}>{t("magazine:desk.modals.pass.body")}</p>
      <div className={styles.templates}>
        <FilterChips
          label={t("magazine:desk.modals.pass.startingPoints")}
          options={PASS_TEMPLATES.map((template) => ({
            value: template.id,
            label: template.label,
          }))}
          value={templateId ?? ""}
          onChange={applyTemplate}
        />
      </div>
      <FormField label={t("magazine:desk.modals.noteLabel")}>
        <textarea
          rows={6}
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
      </FormField>
    </Modal>
  );
}

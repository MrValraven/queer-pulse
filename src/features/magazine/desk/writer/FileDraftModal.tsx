import { useState } from "react";
import { Button, FormField, Modal } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { WriterAssignmentDto } from "../../api/writerWorkspace.api";
import modalStyles from "../DeskModals.module.css";

export interface FileDraftModalProps {
  assignment: WriterAssignmentDto;
  onClose: () => void;
  onFile: (pieceId: string) => void;
}

/**
 * File-a-draft confirmation for an assignment (`POST
 * /magazine/writer/pieces/:id/file`, which moves the piece drafting →
 * in_review). The paste/upload area is a stub — there's no draft-body
 * endpoint yet, so filing here just advances the stage; the real content
 * still moves through the article/deck editor.
 */
export function FileDraftModal({ assignment, onClose, onFile }: FileDraftModalProps) {
  const { t } = useTranslation();
  const [draftText, setDraftText] = useState("");

  function handleFile() {
    onFile(assignment.id);
    onClose();
  }

  return (
    <Modal
      title={t("magazine:writer.fileDraft.title", { title: assignment.title })}
      onClose={onClose}
      footer={
        <div className={modalStyles.actions}>
          <Button variant="ghost" onClick={onClose}>
            {t("magazine:writer.fileDraft.cancel")}
          </Button>
          <Button variant="primary" onClick={handleFile}>
            {t("magazine:writer.fileDraft.submit")}
          </Button>
        </div>
      }
    >
      <p className={modalStyles.body}>{t("magazine:writer.fileDraft.body")}</p>
      <FormField
        label={t("magazine:writer.fileDraft.fieldLabel")}
        helper={t("magazine:writer.fileDraft.fieldHelper")}
      >
        <textarea
          rows={8}
          value={draftText}
          onChange={(event) => setDraftText(event.target.value)}
          placeholder={t("magazine:writer.fileDraft.placeholder")}
        />
      </FormField>
      <p className={modalStyles.body}>
        {assignment.target !== null
          ? t("magazine:writer.fileDraft.wordCountWithTarget", { target: assignment.target })
          : t("magazine:writer.fileDraft.wordCountNoTarget")}
      </p>
    </Modal>
  );
}

import { useState } from "react";
import { Button, FormField, Modal } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { ArticleBlock } from "../../api/pieces.api";
import type { WriterAssignmentDto } from "../../api/writerWorkspace.api";
import { createParagraphBlocks, splitIntoParagraphTexts } from "../editor/useArticleBlockOps";
import modalStyles from "../DeskModals.module.css";

export interface FileDraftModalProps {
  assignment: WriterAssignmentDto;
  onClose: () => void;
  /** `blocks` is only passed when `draftText` had real content — a whole
   *  pasted draft converted to paragraph blocks (split on blank lines, same
   *  rule `ArticleDocument`'s in-editor paste uses). */
  onFile: (pieceId: string, blocks?: ArticleBlock[]) => void;
}

/**
 * File-a-draft confirmation for an assignment (`POST
 * /magazine/writer/pieces/:id/file`, which moves the piece drafting →
 * in_review). The paste area used to capture `draftText` into state and
 * discard it on file — a real data-loss bug (a writer who pasted their whole
 * draft here lost it). Non-empty text is now converted to paragraph blocks
 * and sent along with the file action, which appends them to the piece's
 * article draft server-side before it advances stage.
 */
export function FileDraftModal({ assignment, onClose, onFile }: FileDraftModalProps) {
  const { t } = useTranslation();
  const [draftText, setDraftText] = useState("");

  function handleFile() {
    const paragraphTexts = splitIntoParagraphTexts(draftText);
    onFile(assignment.id, paragraphTexts.length > 0 ? createParagraphBlocks(paragraphTexts) : undefined);
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

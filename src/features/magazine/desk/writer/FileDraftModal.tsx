import { useState } from "react";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import {
  Button,
  FormField,
  Modal,
  Select,
} from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  isArticleDraftConflict,
  type ArticleBlock,
} from "../../api/pieces.api";
import { useWriterDraft } from "../../api/useWriterWorkspace";
import type {
  FileDraftBody,
  FileDraftMode,
  WriterAssignmentDto,
} from "../../api/writerWorkspace.api";
import {
  createParagraphBlocks,
  paragraphTextsFromBlocks,
  splitIntoParagraphTexts,
} from "../editor/useArticleBlockOps";
import modalStyles from "../DeskModals.module.css";

/** The half of `FileDraftBody` the modal decides, kept separate from `blocks`
 *  so the existing `onFile(pieceId, blocks)` call shape still type-checks. */
export type FileDraftOptions = Pick<FileDraftBody, "expectedVersion" | "mode">;

export interface FileDraftModalProps {
  assignment: WriterAssignmentDto;
  onClose: () => void;
  /**
   * `blocks` is only passed when the paste box had real content — a whole
   * pasted draft converted to paragraph blocks (split on blank lines, same
   * rule `ArticleDocument`'s in-editor paste uses).
   *
   * Returning the filing's promise (a parent wired to `mutateAsync`) lets this
   * modal hold the writer's text on screen until the filing lands, and show
   * the 409 conflict state instead of closing over a failure. A parent that
   * returns nothing (`mutate`) keeps the old fire-and-forget close.
   */
  onFile: (
    pieceId: string,
    blocks?: ArticleBlock[],
    options?: FileDraftOptions,
  ) => void | Promise<unknown>;
}

/**
 * File-a-draft for an assignment (`POST /magazine/writer/pieces/:id/file`,
 * which moves the piece drafting → in_review).
 *
 * The modal now READS the draft as well as writing to it (PRD-122a). A writer
 * could previously only push text at a piece they had never seen: there was no
 * writer-facing route that returned the article, so "you see them before they
 * ship" — printed on every assignment as an agreed term — was not true. The
 * current draft, its word count and the version it is at are all loaded here,
 * and "start from the current draft" seeds the box with the editor's version
 * so a revision is a revision rather than a second copy.
 *
 * Two things follow from that read:
 *
 *   - `expectedVersion` rides along on the filing, so a draft an editor has
 *     saved since is refused with 409 rather than silently overwritten. The
 *     conflict is a blocking state that KEEPS the writer's text on screen,
 *     matching `ArticleDraftConflictBanner` on the editor side.
 *   - A writer can `replace` what they filed instead of only appending to it.
 *     The server snapshots the pre-replace body first, so an editor's work
 *     stays recoverable from the VersionsRail.
 */
export function FileDraftModal({
  assignment,
  onClose,
  onFile,
}: FileDraftModalProps) {
  const { t } = useTranslation();
  const [draftText, setDraftText] = useState("");
  const [mode, setMode] = useState<FileDraftMode>("append");
  const [isFiling, setIsFiling] = useState(false);
  const [fileError, setFileError] = useState<unknown>(null);
  const {
    draft,
    isLoading: isDraftLoading,
    refetch: refetchDraft,
  } = useWriterDraft(assignment.id);

  const hasExistingDraft = draft !== null && draft.words > 0;
  const isConflict = fileError !== null && isArticleDraftConflict(fileError);

  function loadCurrentDraft() {
    if (draft === null) return;
    // Blank lines between paragraphs: the same separator `splitIntoParagraphTexts`
    // reads back, so what the writer edits here round-trips to the same blocks.
    setDraftText(paragraphTextsFromBlocks(draft.blocks).join("\n\n"));
    // Revising the editor's own text and then APPENDING it would file the piece
    // twice over, so seeding the box picks the mode that matches the intent.
    setMode("replace");
  }

  async function handleFile() {
    const paragraphTexts = splitIntoParagraphTexts(draftText);
    const blocks =
      paragraphTexts.length > 0
        ? createParagraphBlocks(paragraphTexts)
        : undefined;

    setFileError(null);
    const filing = onFile(assignment.id, blocks, {
      mode: blocks === undefined ? undefined : mode,
      // Undefined while the draft read is still in flight, which the server
      // treats as "no declared base version" exactly as it did before.
      expectedVersion: draft?.version,
    });

    if (!(filing instanceof Promise)) {
      onClose();
      return;
    }

    setIsFiling(true);
    try {
      await filing;
      onClose();
    } catch (error) {
      setFileError(error);
    } finally {
      setIsFiling(false);
    }
  }

  async function handleReloadDraft() {
    setFileError(null);
    await refetchDraft();
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
          <Button
            variant="primary"
            onClick={() => void handleFile()}
            disabled={isFiling}
            aria-busy={isFiling}
          >
            {isFiling
              ? t("magazine:writer.fileDraft.filing")
              : t("magazine:writer.fileDraft.submit")}
          </Button>
        </div>
      }
    >
      <p className={modalStyles.body}>{t("magazine:writer.fileDraft.body")}</p>

      {isConflict && (
        <div className={modalStyles.body} role="alert">
          <b>
            <FiAlertTriangle aria-hidden />{" "}
            {t("magazine:writer.fileDraft.conflictHeading")}
          </b>
          <p>{t("magazine:writer.fileDraft.conflictBody")}</p>
          <Button
            variant="plum"
            size="sm"
            onClick={() => void handleReloadDraft()}
          >
            <FiRefreshCw aria-hidden />
            {t("magazine:writer.fileDraft.conflictReload")}
          </Button>
        </div>
      )}

      {fileError !== null && !isConflict && (
        <p className={modalStyles.body} role="alert">
          {t("magazine:writer.fileDraft.failed")}
        </p>
      )}

      {!isDraftLoading && hasExistingDraft && (
        <div className={modalStyles.body}>
          <p>
            {t("magazine:writer.fileDraft.currentDraftWords", {
              words: draft.words,
            })}
          </p>
          <Button variant="ghost" size="sm" onClick={loadCurrentDraft}>
            {t("magazine:writer.fileDraft.loadCurrentDraft")}
          </Button>
        </div>
      )}

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

      {hasExistingDraft && (
        <div className={modalStyles.field}>
          <Select
            label={t("magazine:writer.fileDraft.modeLabel")}
            value={mode}
            onChange={(value) =>
              setMode(value === "replace" ? "replace" : "append")
            }
            options={[
              {
                value: "append",
                label: t("magazine:writer.fileDraft.modeAppend"),
              },
              {
                value: "replace",
                label: t("magazine:writer.fileDraft.modeReplace"),
              },
            ]}
          />
          <p className={modalStyles.body}>
            {mode === "replace"
              ? t("magazine:writer.fileDraft.modeReplaceHelper")
              : t("magazine:writer.fileDraft.modeAppendHelper")}
          </p>
        </div>
      )}

      <p className={modalStyles.body}>
        {assignment.target !== null
          ? t("magazine:writer.fileDraft.wordCountWithTarget", {
              target: assignment.target,
            })
          : t("magazine:writer.fileDraft.wordCountNoTarget")}
      </p>
    </Modal>
  );
}

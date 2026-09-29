import { useState } from "react";
import {
  Modal,
  Button,
  FormField,
  Select,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./DeskModals.module.css";

interface HandoffModalProps {
  /** `byline` names a current writer the roster lacks (a member's pitch is
   *  written by its submitter, who holds no writer role). */
  piece: { title: string; byline: string };
  editors: { id: string; name: string }[];
  writers: { id: string; name: string }[];
  /** True while the writer roster loads or after it failed. */
  isWriterListUnavailable: boolean;
  /** The piece's editor today, `""` when it has none. */
  currentEditorId: string;
  /** The piece's writer today, `null` for none. */
  currentWriterId: string | null;
  onClose: () => void;
  /** `writerId` is `null` for "No writer". */
  onHandoff: (editorId: string, writerId: string | null) => void;
}

/** Hand a piece to another editor on the desk, and set who writes it. */
export function HandoffModal({
  piece,
  editors,
  writers,
  isWriterListUnavailable,
  currentEditorId,
  currentWriterId,
  onClose,
  onHandoff,
}: HandoffModalProps) {
  const { t } = useTranslation();
  const [editorId, setEditorId] = useState(
    currentEditorId || (editors[0]?.id ?? ""),
  );
  const [writerId, setWriterId] = useState(currentWriterId ?? "");
  // A missing writer folds to `null` on both sides, so an undefined and a
  // null current writer compare equal. The button stays disabled until the
  // editor or the writer actually moves, so pressing it always sends the
  // hand-off it announced.
  const hasChange =
    editorId !== currentEditorId ||
    (writerId || null) !== (currentWriterId ?? null);
  function handleHandoff(): void {
    if (!editorId || !hasChange) return;
    onHandoff(editorId, writerId || null);
    onClose();
  }
  const offRosterWriterOption =
    currentWriterId && !writers.some((writer) => writer.id === currentWriterId)
      ? { value: currentWriterId, label: piece.byline }
      : null;
  const writerOptions = [
    { value: "", label: t("magazine:desk.modals.handoff.writerNone") },
    ...(offRosterWriterOption ? [offRosterWriterOption] : []),
    ...writers.map((writer) => ({ value: writer.id, label: writer.name })),
  ];
  // "Hand off" reads as the row's writer-assignment verb exactly when the
  // piece has no writer yet, so the Writer select leads in that case; a
  // piece with a writer already keeps the editor pick ("To") leading.
  const isWriterFirst = !currentWriterId;
  const editorField = (
    <FormField label={t("magazine:desk.modals.handoff.toLabel")}>
      <Select
        value={editorId}
        onChange={(value) => setEditorId(value ?? "")}
        options={editors.map((editor) => ({
          value: editor.id,
          label: editor.name,
        }))}
      />
    </FormField>
  );
  const writerField = (
    <FormField
      label={t("magazine:desk.modals.handoff.writerLabel")}
      helper={
        isWriterListUnavailable
          ? t("magazine:desk.modals.handoff.writersUnavailable")
          : undefined
      }
    >
      <Select
        value={writerId}
        onChange={(value) => setWriterId(value ?? "")}
        disabled={isWriterListUnavailable}
        options={writerOptions}
      />
    </FormField>
  );
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
            // `aria-disabled` keeps the button focusable, so a keyboard
            // user still lands on it. `handleHandoff` guards the same
            // condition for anything that ignores the attribute.
            aria-disabled={!editorId || !hasChange}
            onClick={handleHandoff}
          >
            {t("magazine:desk.modals.handoff.cta")}
          </Button>
        </div>
      }
    >
      <p className={styles.body}>
        {t("magazine:desk.modals.handoff.body", { title: piece.title })}
      </p>
      {isWriterFirst ? (
        <>
          {writerField}
          {editorField}
        </>
      ) : (
        <>
          {editorField}
          {writerField}
        </>
      )}
    </Modal>
  );
}

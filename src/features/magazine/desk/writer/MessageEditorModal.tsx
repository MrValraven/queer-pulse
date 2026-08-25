import { Modal } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { WriterAssignmentDto } from "../../api/writerWorkspace.api";
import { PieceThread } from "../PieceThread";

export interface MessageEditorModalProps {
  assignment: WriterAssignmentDto;
  onClose: () => void;
}

/**
 * The writer side of the editor↔writer thread (Phase 7 Wave F) — opened from
 * `AssignmentCard`'s "Message editor" action and `EditorMessageCard`'s "Open
 * thread" affordance. Reads and posts through the same `PieceThread`
 * component the desk's Chase modal uses (`side="writer"` here); posting
 * notifies the assigned editor server-side.
 */
export function MessageEditorModal({
  assignment,
  onClose,
}: MessageEditorModalProps) {
  const { t } = useTranslation();
  return (
    <Modal
      title={t("magazine:writer.messages.title", { title: assignment.title })}
      onClose={onClose}
    >
      <PieceThread pieceId={assignment.id} side="writer" />
    </Modal>
  );
}

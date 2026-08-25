import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useFormat } from "../../../../shared/i18n/format";
import { formatRelative } from "../../../../shared/lib/date";
import { usePieceMessages } from "../../api/usePieceMessages";
import type { WriterAssignmentDto } from "../../api/writerWorkspace.api";
import pieceStyles from "../pieceTabs.module.css";

export interface EditorMessageCardProps {
  /** The rail's active assignment (`WriterWorkspacePage`), or `undefined` when
   *  the writer has no assignments. */
  assignment: WriterAssignmentDto | undefined;
  onOpenThread: (assignment: WriterAssignmentDto) => void;
}

/**
 * The erail "From your editor" card — the real latest incoming message on
 * the writer's current assignment's thread (Phase 7 Wave F), replacing what
 * used to be static copy. Same active-assignment source
 * `AgreedTermsCard`/`BylineSafetyCard` already use in this rail.
 */
export function EditorMessageCard({
  assignment,
  onOpenThread,
}: EditorMessageCardProps) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const current = assignment;
  const { messages, isLoading } = usePieceMessages(current?.id ?? "", "writer");
  const latestFromEditor = [...messages]
    .reverse()
    .find((message) => !message.fromMe);

  return (
    <div className={pieceStyles.card}>
      <h3>{t("magazine:writer.editorMessage.heading")}</h3>
      {!current ? (
        <p className={pieceStyles.tiny}>
          {t("magazine:writer.editorMessage.emptyState")}
        </p>
      ) : isLoading ? (
        <p className={pieceStyles.tiny}>
          {t("magazine:writer.editorMessage.loading")}
        </p>
      ) : latestFromEditor ? (
        <>
          <p className={pieceStyles.tiny}>
            {t("magazine:writer.editorMessage.fromLabel", {
              name: latestFromEditor.author,
            })}
            {" · "}
            {formatRelative(latestFromEditor.createdAt, formatters) ||
              latestFromEditor.createdAt}
          </p>
          <div className={pieceStyles.note}>{latestFromEditor.body}</div>
        </>
      ) : (
        <p className={pieceStyles.tiny}>
          {t("magazine:writer.editorMessage.noMessagesYet")}
        </p>
      )}
      {current && (
        <Button size="sm" variant="ghost" onClick={() => onOpenThread(current)}>
          {t("magazine:writer.work.messageEditor")}
        </Button>
      )}
    </div>
  );
}

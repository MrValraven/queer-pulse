import { useState, type KeyboardEvent } from "react";
import { FiSend } from "react-icons/fi";
import { Button, EmptyState, SkeletonLine } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { usePieceMessages, usePieceMessageMutations, type PieceThreadSide } from "../api/usePieceMessages";
import { PieceThreadMessage } from "./PieceThreadMessage";
import styles from "./PieceThread.module.css";

export interface PieceThreadProps {
  pieceId: string;
  side: PieceThreadSide;
}

/**
 * The editor↔writer per-piece message thread (Phase 7 Wave F) — ONE shared
 * view for both surfaces, since `PieceMessageDto` is identical either way
 * (`fromMe` is server-computed against whoever is asking; only the base path
 * differs). Reused inside the desk's Chase modal (`side="editor"`) and the
 * writer workspace's "Message editor" thread + "From your editor" summary
 * (`side="writer"`). Posting is a normal send here — Chase has no separate
 * "confirm" step anymore, sending the message IS the chase (and notifies the
 * other party server-side).
 */
export function PieceThread({ pieceId, side }: PieceThreadProps) {
  const { t } = useTranslation();
  const { messages, isLoading, isError } = usePieceMessages(pieceId, side);
  const { send } = usePieceMessageMutations(pieceId, side);
  const [draft, setDraft] = useState("");

  function handleSend(): void {
    const trimmed = draft.trim();
    if (!trimmed || send.isPending) return;
    send.mutate(trimmed);
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className={styles.thread}>
      <div className={styles.messages} aria-live="polite">
        {isLoading ? (
          <div className={styles.loading} aria-hidden>
            <SkeletonLine width="70%" height={14} />
            <SkeletonLine width="45%" height={14} />
          </div>
        ) : isError ? (
          <p className={styles.tiny}>{t("magazine:pieceThread.errorState")}</p>
        ) : messages.length === 0 ? (
          <EmptyState
            compact
            title={t("magazine:pieceThread.emptyTitle")}
            description={t("magazine:pieceThread.emptyDescription")}
          />
        ) : (
          messages.map((message) => <PieceThreadMessage key={message.id} message={message} />)
        )}
      </div>

      <div className={styles.composer}>
        <textarea
          aria-label={t("magazine:pieceThread.composerAria")}
          placeholder={t("magazine:pieceThread.composerPlaceholder")}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
        />
        <Button
          size="sm"
          variant="primary"
          onClick={handleSend}
          disabled={!draft.trim() || send.isPending}
        >
          <FiSend aria-hidden /> {t("magazine:pieceThread.send")}
        </Button>
      </div>
    </div>
  );
}

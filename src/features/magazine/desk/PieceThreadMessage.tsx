import { useFormat } from "../../../shared/i18n/format";
import { formatRelative } from "../../../shared/lib/date";
import { cx } from "../../../shared/lib/cx";
import type { PieceMessageDto } from "../api/pieces.api";
import styles from "./PieceThread.module.css";

export interface PieceThreadMessageProps {
  message: PieceMessageDto;
}

/**
 * One chat bubble inside `PieceThread` — aligned right/accent when
 * `message.fromMe` (server-computed against the requester), left/neutral
 * otherwise. Falls back to the raw ISO timestamp if `formatRelative` can't
 * parse it, same convention as `CommentThread`.
 */
export function PieceThreadMessage({ message }: PieceThreadMessageProps) {
  const formatters = useFormat();
  const timeLabel = formatRelative(message.createdAt, formatters) || message.createdAt;

  return (
    <div className={cx(styles.bubbleRow, message.fromMe && styles.bubbleRowMine)}>
      <div className={cx(styles.bubble, message.fromMe && styles.bubbleMine)}>
        <div className={styles.bubbleMeta}>
          <span className={styles.bubbleAuthor}>{message.author}</span>
          <span className={styles.bubbleTime}>{timeLabel}</span>
        </div>
        <p className={styles.bubbleBody}>{message.body}</p>
      </div>
    </div>
  );
}

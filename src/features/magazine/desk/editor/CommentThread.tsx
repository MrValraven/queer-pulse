import { useState } from "react";
import { Button } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useFormat } from "../../../../shared/i18n/format";
import { formatRelative } from "../../../../shared/lib/date";
import type { ArticleCommentDto } from "../../api/pieces.api";
import { CommentItem } from "./CommentItem";
import styles from "../pieceTabs.module.css";

export interface CommentThreadProps {
  comment: ArticleCommentDto;
  onReply: (commentId: string, body: string) => void;
  onToggleResolve: (commentId: string, resolved: boolean) => void;
}

/**
 * One top-level comment, its oldest-first replies, and this thread's own
 * reply composer. Replies never get their own Reply/Resolve affordance — a
 * reply always targets the top-level comment it's shown under, never
 * another reply (see `ArticleCommentDto`'s doc comment), so nesting stops at
 * one level and there is nothing to thread further.
 */
export function CommentThread({ comment, onReply, onToggleResolve }: CommentThreadProps) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  function timeLabelFor(createdAt: string): string {
    return formatRelative(createdAt, formatters) || createdAt;
  }

  function handleSendReply() {
    const trimmed = replyText.trim();
    if (!trimmed) return;
    onReply(comment.id, trimmed);
    setReplyText("");
    setIsReplying(false);
  }

  return (
    <div className={styles.thread}>
      <CommentItem
        author={comment.author}
        timeLabel={timeLabelFor(comment.createdAt)}
        body={comment.body}
        resolved={comment.resolved}
        actions={
          <div className={styles.row}>
            <Button size="sm" variant="ghost" onClick={() => setIsReplying((open) => !open)}>
              {t("magazine:write.notes.reply")}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onToggleResolve(comment.id, !comment.resolved)}>
              {comment.resolved ? t("magazine:write.notes.reopen") : t("magazine:write.notes.resolve")}
            </Button>
          </div>
        }
      />

      {comment.replies.length > 0 && (
        <div className={styles.replies}>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              author={reply.author}
              timeLabel={timeLabelFor(reply.createdAt)}
              body={reply.body}
              resolved={reply.resolved}
            />
          ))}
        </div>
      )}

      {isReplying && (
        <div className={styles.replies}>
          <div className={styles.field}>
            <textarea
              aria-label={t("magazine:write.notes.replyAria", { who: comment.author })}
              placeholder={t("magazine:write.notes.replyPlaceholder")}
              value={replyText}
              onChange={(event) => setReplyText(event.target.value)}
            />
          </div>
          <Button size="sm" onClick={handleSendReply}>
            {t("magazine:write.notes.replySend")}
          </Button>
        </div>
      )}
    </div>
  );
}

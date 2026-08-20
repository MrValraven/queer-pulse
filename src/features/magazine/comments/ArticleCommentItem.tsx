import { useState } from "react";
import { Avatar } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import type { ReaderCommentDTO } from "./readerComments.api";
import { ArticleCommentComposer } from "./ArticleCommentComposer";
import styles from "./ArticleComments.module.css";

export function ArticleCommentItem({
  comment,
  onReply,
  onEdit,
  onDelete,
  onReport,
}: {
  comment: ReaderCommentDTO;
  onReply: (parentId: string, body: string) => void;
  onEdit: (id: string, body: string) => void;
  onDelete: (id: string) => void;
  onReport: (comment: ReaderCommentDTO) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const [replying, setReplying] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function renderOne(item: ReaderCommentDTO, isReply: boolean) {
    return (
      <div key={item.id} className={isReply ? styles.reply : styles.comment}>
        <Avatar
          initials={(item.author.displayName || "?").slice(0, 1)}
          src={item.author.avatarUrl ?? undefined}
          name={item.author.displayName}
          size={isReply ? 30 : 38}
        />
        <div className={styles.commentBody}>
          <div className={styles.commentHead}>
            <span className={styles.commentName}>{item.author.displayName}</span>
            <span className={styles.commentTime}>
              {fmt.date(new Date(item.createdAt))}
            </span>
          </div>
          {item.deleted ? (
            <p className={styles.tombstone}>{t("magazine:comments.tombstone")}</p>
          ) : editingId === item.id ? (
            <ArticleCommentComposer
              initialValue={item.body}
              placeholderKey="magazine:comments.composer.editPlaceholder"
              submitLabelKey="magazine:comments.composer.saveEdit"
              onCancel={() => setEditingId(null)}
              onSubmit={(body) => {
                onEdit(item.id, body);
                setEditingId(null);
              }}
              focusOnMount
            />
          ) : (
            <>
              <p className={styles.commentText}>{item.body}</p>
              {item.editedAt && (
                <span className={styles.editedMark}>
                  {t("magazine:comments.editedMark")}
                </span>
              )}
              <div className={styles.commentActions}>
                {!isReply && (
                  <button
                    type="button"
                    className={styles.actionLink}
                    onClick={() => setReplying((v) => !v)}
                  >
                    {t("magazine:comments.reply")}
                  </button>
                )}
                {item.canEdit && (
                  <button
                    type="button"
                    className={styles.actionLink}
                    onClick={() => setEditingId(item.id)}
                  >
                    {t("magazine:comments.edit")}
                  </button>
                )}
                {item.canDelete && (
                  <button
                    type="button"
                    className={styles.actionLink}
                    onClick={() => onDelete(item.id)}
                  >
                    {t("magazine:comments.delete")}
                  </button>
                )}
                {!item.canDelete && (
                  <button
                    type="button"
                    className={styles.actionLink}
                    onClick={() => onReport(item)}
                  >
                    {t("magazine:comments.report.cta")}
                  </button>
                )}
              </div>
            </>
          )}
          {!isReply && replying && (
            <ArticleCommentComposer
              placeholderKey="magazine:comments.composer.replyPlaceholder"
              submitLabelKey="magazine:comments.composer.postReply"
              onCancel={() => setReplying(false)}
              onSubmit={(body) => {
                onReply(item.id, body);
                setReplying(false);
              }}
              focusOnMount
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.thread}>
      {renderOne(comment, false)}
      {comment.replies.length > 0 && (
        <div className={styles.repliesList}>
          {comment.replies.map((reply) => renderOne(reply, true))}
        </div>
      )}
    </div>
  );
}

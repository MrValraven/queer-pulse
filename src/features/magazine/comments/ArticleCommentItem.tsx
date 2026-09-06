import { useState } from "react";
import { Avatar, Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import type { ReaderCommentDTO } from "./readerComments.api";
import { ArticleCommentComposer } from "./ArticleCommentComposer";
import styles from "./ArticleComments.module.css";

/**
 * A comment with nothing left to read: tombstoned by its author, removed by a
 * moderator, or blanked on the way out because it is hidden (the response
 * empties `body` and the author for all three, ENG-102). Everything a member
 * could do TO the comment hangs off this: an empty card must never carry a
 * live Reply, Report, Edit or Delete.
 */
function isUnavailableComment(comment: ReaderCommentDTO): boolean {
  return comment.deleted || comment.body.trim().length === 0;
}

export function ArticleCommentItem({
  comment,
  onReply,
  onEdit,
  onDelete,
  onReport,
}: {
  comment: ReaderCommentDTO;
  /** Returns the mutation promise so the composer only clears on success. */
  onReply: (parentId: string, body: string) => void | Promise<unknown>;
  /** Returns the mutation promise so the composer only clears on success. */
  onEdit: (id: string, body: string) => void | Promise<unknown>;
  /** Hands the whole comment up so the list can confirm before deleting
   *  (FE-CNT-11) — deleting straight from this click had no undo. */
  onDelete: (comment: ReaderCommentDTO) => void;
  onReport: (comment: ReaderCommentDTO) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const [replying, setReplying] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function renderOne(item: ReaderCommentDTO, isReply: boolean) {
    const isUnavailable = isUnavailableComment(item);
    const authorName = item.author.displayName.trim();
    // A blanked row arrives with an empty author, so the name slot would
    // otherwise render as a gap beside the timestamp.
    const displayedName =
      isUnavailable || !authorName
        ? t("magazine:comments.unknownAuthor")
        : authorName;

    return (
      <div key={item.id} className={isReply ? styles.reply : styles.comment}>
        <Avatar
          initials={displayedName.slice(0, 1)}
          src={isUnavailable ? undefined : (item.author.avatarUrl ?? undefined)}
          name={displayedName}
          size={isReply ? 30 : 38}
        />
        <div className={styles.commentBody}>
          <div className={styles.commentHead}>
            <span className={styles.commentName}>{displayedName}</span>
            <span className={styles.commentTime}>
              {fmt.date(new Date(item.createdAt))}
            </span>
          </div>
          {isUnavailable ? (
            <p className={styles.tombstone}>
              {t("magazine:comments.tombstone")}
            </p>
          ) : editingId === item.id ? (
            <ArticleCommentComposer
              initialValue={item.body}
              placeholderKey="magazine:comments.composer.editPlaceholder"
              submitLabelKey="magazine:comments.composer.saveEdit"
              onCancel={() => setEditingId(null)}
              onSubmit={async (body) => {
                await onEdit(item.id, body);
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
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => setReplying((isOpen) => !isOpen)}
                  >
                    {t("magazine:comments.reply")}
                  </Button>
                )}
                {item.canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => setEditingId(item.id)}
                  >
                    {t("magazine:comments.edit")}
                  </Button>
                )}
                {item.canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => onDelete(item)}
                  >
                    {t("magazine:comments.delete")}
                  </Button>
                )}
                {!item.canDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => onReport(item)}
                  >
                    {t("magazine:comments.report.cta")}
                  </Button>
                )}
              </div>
            </>
          )}
          {!isReply && !isUnavailable && replying && (
            <ArticleCommentComposer
              placeholderKey="magazine:comments.composer.replyPlaceholder"
              submitLabelKey="magazine:comments.composer.postReply"
              onCancel={() => setReplying(false)}
              onSubmit={async (body) => {
                await onReply(item.id, body);
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

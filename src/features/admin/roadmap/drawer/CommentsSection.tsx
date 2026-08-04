import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { AdminItemCommentDTO } from "../../api/roadmapAdmin.types";
import { AdminChip } from "../../ui";
import styles from "./ItemDrawer.module.css";

/**
 * Comments — read-only. `useAdminRoadmapMutations()` has no comment-hide or
 * comment-delete action (only item/idea/team mutations exist), so a
 * "Hide"/"Delete" control here would either be a no-op or fake local-only
 * state that looks like it moderates but doesn't persist. Rendering the
 * list plainly (with a hidden-state chip, since `hidden` is real data even
 * without a way to flip it from here) is the honest option; a real
 * comment-moderation endpoint is a gap for a future task, not this one.
 */
export function CommentsSection({
  comments,
}: {
  comments: AdminItemCommentDTO[];
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>
        {t("admin:roadmap.drawer.comments.title")}
      </h3>

      {comments.length === 0 ? (
        <p className={styles.emptyNote}>
          {t("admin:roadmap.drawer.comments.empty")}
        </p>
      ) : (
        <div className={styles.commentList}>
          {comments.map((comment) => (
            <div key={comment.id} className={styles.commentRow}>
              <div className={styles.commentHead}>
                <span className={styles.commentAuthor}>
                  {comment.authorLabel}
                </span>
                <span className={styles.commentDate}>
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
                {comment.hidden && (
                  <AdminChip tone="warn">
                    {t("admin:roadmap.drawer.comments.hiddenStatus")}
                  </AdminChip>
                )}
              </div>
              <p className={styles.commentBody}>{comment.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

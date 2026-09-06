import { useState } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  Button,
  ConfirmDialog,
  SkeletonLine,
} from "../../../shared/components/ui";
import { useReaderComments } from "./useReaderComments";
import { useReaderCommentMutations } from "./useReaderCommentMutations";
import { ArticleCommentComposer } from "./ArticleCommentComposer";
import { ArticleCommentItem } from "./ArticleCommentItem";
import { ReportCommentModal } from "./ReportCommentModal";
import type { ReaderCommentDTO } from "./readerComments.api";
import styles from "./ArticleComments.module.css";

/** The bottom-of-article public reader-comments module (CNT-10): sort-free
 *  list (newest top-level first, per the backend's ordering contract), a
 *  top composer, and per-comment reply/edit/delete/report actions. A
 *  smaller, flat sibling of the forum's recursive comment tree — see the
 *  plan's Global Constraints for why this isn't built on top of
 *  `ThreadReplies`/`ThreadReplyNode`. */
export function ArticleComments({ articleSlug }: { articleSlug: string }) {
  const { t } = useTranslation();
  const {
    comments,
    totalThreads,
    hasMore,
    loadMore,
    isLoading,
    isLoadingMore,
  } = useReaderComments(articleSlug);
  const { create, edit, remove } = useReaderCommentMutations(articleSlug);
  const [reportTarget, setReportTarget] = useState<ReaderCommentDTO | null>(
    null,
  );
  // FE-CNT-11: deleting used to fire straight from the click, with no confirm
  // and no undo. The shared ConfirmDialog is the same pattern the deck editor
  // already routes its destructive actions through.
  const [deleteTarget, setDeleteTarget] = useState<ReaderCommentDTO | null>(
    null,
  );

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await remove.mutateAsync(deleteTarget.id);
    } catch {
      // The global mutation toast reports it; keep the dialog's own state
      // tidy either way.
    } finally {
      setDeleteTarget(null);
    }
  }

  return (
    <section
      className={styles.section}
      aria-labelledby="article-comments-heading"
    >
      <div className="wrap">
        {/* PRD-108: the server's `total` counts top-level THREADS, so the
            heading names conversations. It used to say "34 comments" while
            counting nothing a reply added. */}
        <h2 id="article-comments-heading" className={styles.heading}>
          {t("magazine:comments.headingThreads", { count: totalThreads })}
        </h2>

        <div className={styles.topComposer}>
          <ArticleCommentComposer
            placeholderKey="magazine:comments.composer.placeholder"
            submitLabelKey="magazine:comments.composer.post"
            onSubmit={(body) => create.mutateAsync({ body })}
          />
        </div>

        {isLoading ? (
          <div className={styles.skeletonList} aria-hidden>
            <SkeletonLine width="60%" height={16} />
            <SkeletonLine width="90%" height={14} style={{ marginTop: 8 }} />
          </div>
        ) : comments.length === 0 ? (
          <p className={styles.empty}>{t("magazine:comments.empty")}</p>
        ) : (
          <>
            <div className={styles.list}>
              {comments.map((comment) => (
                <ArticleCommentItem
                  key={comment.id}
                  comment={comment}
                  onReply={(parentId, body) =>
                    create.mutateAsync({ body, parentId })
                  }
                  onEdit={(id, body) => edit.mutateAsync({ id, body })}
                  onDelete={setDeleteTarget}
                  onReport={setReportTarget}
                />
              ))}
            </div>

            {hasMore && (
              <div className={styles.loadMore}>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isLoadingMore}
                  onClick={loadMore}
                >
                  {isLoadingMore
                    ? t("magazine:comments.loadingMore")
                    : t("magazine:comments.loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
        tone="destructive"
        loading={remove.isPending}
        title={t("magazine:comments.deleteConfirm.title")}
        description={t("magazine:comments.deleteConfirm.body")}
        confirmLabel={t("magazine:comments.deleteConfirm.cta")}
      />

      {reportTarget && (
        // ENG-102: this used to fall back to the REPORTER's own initials when
        // the reported comment carried no author name, so the sheet asked a
        // member what was wrong with their own comment. A nameless comment now
        // gets the subject-free copy instead.
        <ReportCommentModal
          authorName={reportTarget.author.displayName.trim() || null}
          subjectId={reportTarget.id}
          onClose={() => setReportTarget(null)}
        />
      )}
    </section>
  );
}

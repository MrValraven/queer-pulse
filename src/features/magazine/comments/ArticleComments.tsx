import { useState } from "react";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { SkeletonLine } from "../../../shared/components/ui";
import { useProfileData } from "../../../app/providers/useProfile";
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
  const { profile } = useProfileData();
  const { comments, total, isLoading } = useReaderComments(articleSlug);
  const { create, edit, remove } = useReaderCommentMutations(articleSlug);
  const [reportTarget, setReportTarget] = useState<ReaderCommentDTO | null>(
    null,
  );

  return (
    <section
      className={styles.section}
      aria-labelledby="article-comments-heading"
    >
      <div className="wrap">
        <h2 id="article-comments-heading" className={styles.heading}>
          {t("magazine:comments.heading", { count: total })}
        </h2>

        <div className={styles.topComposer}>
          <ArticleCommentComposer
            placeholderKey="magazine:comments.composer.placeholder"
            submitLabelKey="magazine:comments.composer.post"
            onSubmit={(body) => create.mutate({ body })}
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
          <div className={styles.list}>
            {comments.map((comment) => (
              <ArticleCommentItem
                key={comment.id}
                comment={comment}
                onReply={(parentId, body) => create.mutate({ body, parentId })}
                onEdit={(id, body) => edit.mutate({ id, body })}
                onDelete={(id) => remove.mutate(id)}
                onReport={setReportTarget}
              />
            ))}
          </div>
        )}
      </div>

      {reportTarget && (
        <ReportCommentModal
          authorName={reportTarget.author.displayName || profile.initials}
          subjectId={reportTarget.id}
          onClose={() => setReportTarget(null)}
        />
      )}
    </section>
  );
}

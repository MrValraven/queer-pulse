import { useEffect, useId, useRef, useState } from "react";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { AdminPageHeader } from "./ui";
import {
  useAdminForumReview,
  useReviewForumThread,
} from "./api/useAdminForumReview";
import {
  isForumReviewConflict,
  type AdminForumReviewThread,
  type ForumReviewDecision,
} from "./api/adminForumReview.api";
import { AdminForumReviewRow } from "./AdminForumReviewRow";
import { AdminForumReviewRejectModal } from "./AdminForumReviewRejectModal";
import submissionStyles from "./AdminSubmissionList.module.css";
import styles from "./AdminForumReviewPage.module.css";

function RowsSkeleton() {
  return (
    <div className={submissionStyles.rows}>
      {[0, 1, 2].map((skeletonIndex) => (
        <SkeletonLine
          key={skeletonIndex}
          height={132}
          style={{ borderRadius: "var(--radius-card)" }}
        />
      ))}
    </div>
  );
}

/**
 * The staff forum review queue (PRD-461): every thread a member held back for a
 * moderator, newest first. Nobody else can see these threads until one of them
 * is approved, so the page opens straight on the list.
 *
 * Approving publishes the thread and tells its author; declining keeps it
 * hidden and tells the author, with an optional note. A decided row leaves the
 * list once the server agrees, and focus moves to the page heading because the
 * button that held it went with the row.
 *
 * Demo mode reads the colocated fixture; live mode pages
 * `GET /admin/forum/review` by cursor.
 */
export function AdminForumReviewPage() {
  const { t } = useTranslation();
  const headingId = useId();
  const [declining, setDeclining] = useState<AdminForumReviewThread | null>(
    null,
  );
  const {
    threads,
    isLoading,
    isError,
    isFetchNextPageError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAdminForumReview();
  const { review, isPending } = useReviewForumThread();

  // Focus moves to the heading from an effect, so it lands after the decline
  // dialog's own cleanup has handed focus back to the row's Decline button.
  // A deleted child's passive cleanups run before this parent's effects in the
  // same commit. The ref keeps a plain Cancel out of it: only a decision asks.
  const isHeadingFocusPendingRef = useRef(false);
  const [headingFocusRequest, setHeadingFocusRequest] = useState(0);
  useEffect(() => {
    if (!isHeadingFocusPendingRef.current || declining) return;
    isHeadingFocusPendingRef.current = false;
    document.getElementById(headingId)?.focus();
  }, [headingFocusRequest, declining, headingId]);

  const settleOnHeading = () => {
    isHeadingFocusPendingRef.current = true;
    setDeclining(null);
    setHeadingFocusRequest((request) => request + 1);
  };

  const runReview = (
    thread: AdminForumReviewThread,
    decision: ForumReviewDecision,
    note?: string,
  ) => {
    review(
      { slug: thread.slug, decision, note },
      {
        onSuccess: settleOnHeading,
        // Someone else decided first: the row is on its way out, so the
        // dialog about it closes too. Any other failure keeps it open.
        onError: (error) => {
          if (isForumReviewConflict(error)) settleOnHeading();
        },
      },
    );
  };

  // A failed "load more" or background refetch also sets `isError`; the full
  // error state is for a queue with nothing to show, so loaded rows stay.
  const hasQueueFailed = isError && threads.length === 0;

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:adminForumReview.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          titleId={headingId}
          eyebrow={t("admin:adminForumReview.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:adminForumReview.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:adminForumReview.header.sub")}
        />
      </FadeIn>

      <FadeIn delay={60}>
        {isLoading ? (
          <RowsSkeleton />
        ) : hasQueueFailed ? (
          <p className={submissionStyles.emptyLine} role="alert">
            {t("admin:adminForumReview.error")}
          </p>
        ) : threads.length === 0 ? (
          <p className={submissionStyles.emptyLine}>
            {t("admin:adminForumReview.empty")}
          </p>
        ) : (
          <>
            <div className={submissionStyles.rows}>
              {threads.map((thread) => (
                <AdminForumReviewRow
                  key={thread.id}
                  thread={thread}
                  isPending={isPending}
                  onApprove={() => runReview(thread, "approve")}
                  onDecline={() => setDeclining(thread)}
                />
              ))}
            </div>
            {hasNextPage && (
              <div
                className={`${submissionStyles.loadMore} ${styles.loadMore}`}
              >
                {isFetchNextPageError && (
                  <p className={submissionStyles.emptyLine} role="alert">
                    {t("admin:adminForumReview.error")}
                  </p>
                )}
                <Button
                  variant="ghost"
                  size="md"
                  disabled={isFetchingNextPage}
                  onClick={() => void fetchNextPage()}
                >
                  {isFetchingNextPage
                    ? t("admin:adminForumReview.loadingMore")
                    : t("admin:adminForumReview.loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </FadeIn>

      {declining && (
        <AdminForumReviewRejectModal
          threadTitle={declining.title}
          isPending={isPending}
          onSubmit={(note) => runReview(declining, "reject", note)}
          onClose={() => setDeclining(null)}
        />
      )}
    </AdminShell>
  );
}

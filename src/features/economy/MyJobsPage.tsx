import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import {
  Button,
  ConfirmDialog,
  LoadErrorState,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { routes } from "../../app/routeMap";
import { describeError } from "../../shared/api/errorMessage";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCloseJob, useMyJobs } from "./api/jobOwner.hooks";
import { MyJobCard, MyJobsEmpty, MyJobsSkeleton } from "./MyJobsSections";
import styles from "./MyJobsPage.module.css";

/**
 * PRD-44: the index of jobs a member published.
 *
 * `GET /me/jobs` had no frontend caller at all, so a poster's only way back
 * into a listing was a slug they still happened to hold, and a wrong salary
 * band could be closed but never corrected. Housing and volunteering both had
 * a "mine" index plus an edit path; this is the jobs board's.
 *
 * A failed fetch surfaces as `LoadErrorState` with a retry, never as the empty
 * state. Telling a poster "you have not posted a job yet" because a request
 * timed out reads as "your listings are gone".
 */
export function MyJobsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const {
    rows,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useMyJobs();
  const closeJob = useCloseJob();
  const [closingSlug, setClosingSlug] = useState<string | null>(null);
  const [busySlug, setBusySlug] = useState<string | null>(null);

  function handleClose() {
    if (!closingSlug) return;
    const slug = closingSlug;
    setBusySlug(slug);
    closeJob.mutate(slug, {
      onSuccess: () => {
        showToast(t("economy:myJobs.toast.closed"), "success");
        setClosingSlug(null);
      },
      onError: (error) => {
        showToast(
          describeError(
            t("economy:myJobs.toast.closeError"),
            error,
            t("shared:apiError.tryAgainTail"),
          ),
          "error",
        );
        setClosingSlug(null);
      },
      onSettled: () => setBusySlug(null),
    });
  }

  return (
    <PageShell>
      <div className={styles.page}>
        <header className={styles.head}>
          <div className={styles.eyebrow}>{t("economy:myJobs.eyebrow")}</div>
          <h1 className={styles.title}>
            <Translation
              i18nKey="economy:myJobs.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.sub}>{t("economy:myJobs.sub")}</p>
          <Button variant="ghost" size="md" to={routes.postJob}>
            {t("economy:myJobs.postCta")}
          </Button>
        </header>

        {isLoading ? (
          <MyJobsSkeleton />
        ) : isError ? (
          <LoadErrorState
            onRetry={refetch}
            title={t("economy:myJobs.error.title")}
            description={t("economy:myJobs.error.description")}
          />
        ) : rows.length === 0 ? (
          <MyJobsEmpty />
        ) : (
          <>
            <div className={styles.list}>
              {rows.map((job) => (
                <MyJobCard
                  key={job.slug}
                  job={job}
                  isBusy={busySlug === job.slug}
                  onClose={() => setClosingSlug(job.slug)}
                />
              ))}
            </div>
            {hasNextPage && (
              <div className={styles.more}>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={fetchNextPage}
                  disabled={isFetchingNextPage}
                >
                  {t(
                    isFetchingNextPage
                      ? "economy:myJobs.loadingMore"
                      : "economy:myJobs.loadMore",
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={closingSlug !== null}
        onClose={() => setClosingSlug(null)}
        onConfirm={handleClose}
        title={t("economy:myJobs.close.confirmTitle")}
        description={t("economy:myJobs.close.confirmBody")}
        tone="destructive"
        loading={closeJob.isPending}
        confirmLabel={t("economy:myJobs.close.confirmCta")}
      />
    </PageShell>
  );
}

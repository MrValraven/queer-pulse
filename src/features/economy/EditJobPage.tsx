import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiAlertCircle, FiLock } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import {
  Button,
  EmptyState,
  LoadErrorState,
  SkeletonLine,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { ApiError } from "../../shared/api/client";
import { describeError } from "../../shared/api/errorMessage";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useJobEditSource, useUpdateJob } from "./api/jobOwner.hooks";
import type { JobEditDraft } from "./api/jobOwner.adapters";
import { useEditJobForm } from "./EditJobFormState";
import {
  EditJobExtrasFields,
  EditJobPayFields,
  EditJobRoleFields,
} from "./EditJobFields";
import styles from "./EditJobPage.module.css";

/**
 * PRD-44: the poster corrects their own listing.
 *
 * `PATCH /jobs/:slug` shipped with no frontend caller, so a wrong salary band,
 * a stale deadline or a typo in the title could only be closed, never fixed.
 * The slug does not change when the title does (`JobsService.update` never
 * re-allocates it), so a save lands the poster back on the same detail page.
 * Editing neither re-opens moderation nor sends a notification: it is a quiet
 * correction, and the copy says so.
 */
export function EditJobPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const source = useJobEditSource(slug);

  return (
    <PageShell>
      <div className={styles.page}>
        <header className={styles.head}>
          <div className={styles.eyebrow}>{t("economy:editJob.eyebrow")}</div>
          <h1 className={styles.title}>
            <Translation
              i18nKey="economy:editJob.title"
              components={{ em: <em /> }}
            />
          </h1>
          <p className={styles.sub}>{t("economy:editJob.sub")}</p>
        </header>

        {source.isLoading ? (
          <EditJobSkeleton />
        ) : source.isError ? (
          <EditJobLoadError
            error={source.error}
            onRetry={() => void source.refetch()}
          />
        ) : !source.data ? (
          <EditJobMissing />
        ) : (
          <EditJobFormBody slug={slug ?? ""} initial={source.data} />
        )}
      </div>
    </PageShell>
  );
}

function EditJobSkeleton() {
  return (
    <div className={styles.card} aria-busy="true">
      <SkeletonLine width={180} height={20} />
      <SkeletonLine width="100%" height={44} style={{ marginTop: 16 }} />
      <SkeletonLine width="100%" height={120} style={{ marginTop: 14 }} />
      <SkeletonLine width="60%" height={44} style={{ marginTop: 14 }} />
    </div>
  );
}

/** A listing that is not yours and a listing that is gone are different facts. */
function EditJobLoadError({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  const status = error instanceof ApiError ? error.status : null;

  if (status === 403) {
    return (
      <EmptyState
        icon={<FiLock />}
        title={t("economy:editJob.forbidden.title")}
        description={t("economy:editJob.forbidden.description")}
        action={{ label: t("economy:editJob.backToJobs"), to: routes.myJobs }}
      />
    );
  }
  if (status === 404) return <EditJobMissing />;

  return (
    <LoadErrorState
      onRetry={onRetry}
      title={t("economy:editJob.error.title")}
      description={t("economy:editJob.error.description")}
    />
  );
}

function EditJobMissing() {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<FiAlertCircle />}
      title={t("economy:editJob.missing.title")}
      description={t("economy:editJob.missing.description")}
      action={{ label: t("economy:editJob.backToJobs"), to: routes.myJobs }}
    />
  );
}

/**
 * The form itself, mounted only once the prefill has arrived so
 * `useEditJobForm` can seed both its working draft and the untouched baseline
 * the PATCH body is diffed against.
 */
function EditJobFormBody({
  slug,
  initial,
}: {
  slug: string;
  initial: JobEditDraft;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const form = useEditJobForm(initial);
  const updateJob = useUpdateJob(slug);
  const [showErrors, setShowErrors] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function handleSave() {
    setShowErrors(true);
    setSaveError(null);
    if (!form.isValid || !form.hasChanges) return;
    updateJob.mutate(form.buildBody(), {
      onSuccess: () => {
        showToast(t("economy:editJob.toast.saved"), "success");
        void navigate(`${routes.jobs}/${slug}`);
      },
      onError: (error) => {
        const status = error instanceof ApiError ? error.status : null;
        if (status === 403) {
          setSaveError(t("economy:editJob.forbidden.description"));
          return;
        }
        if (status === 404) {
          setSaveError(t("economy:editJob.missing.description"));
          return;
        }
        // A 400 carries the validator's own sentence, which names the field
        // that was refused. Showing it beats a generic "that didn't work".
        setSaveError(
          describeError(
            t("economy:editJob.saveFailed"),
            error,
            t("shared:apiError.tryAgainTail"),
          ),
        );
      },
    });
  }

  return (
    <>
      <p className={styles.quietNote}>{t("economy:editJob.quietNote")}</p>

      <EditJobRoleFields form={form} showErrors={showErrors} />
      <EditJobPayFields form={form} showErrors={showErrors} />
      <EditJobExtrasFields form={form} showErrors={showErrors} />

      {saveError && (
        <p className={styles.saveError} role="alert">
          {saveError}
        </p>
      )}

      <div className={styles.foot}>
        <Button variant="ghost" size="lg" to={`${routes.jobs}/${slug}`}>
          {t("economy:editJob.cancel")}
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={handleSave}
          disabled={updateJob.isPending || !form.hasChanges}
        >
          {t(
            updateJob.isPending
              ? "economy:editJob.saving"
              : "economy:editJob.save",
          )}
        </Button>
      </div>
    </>
  );
}

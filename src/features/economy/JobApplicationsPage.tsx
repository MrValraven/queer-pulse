import { useState } from "react";
import { useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { ConfirmDialog } from "../../shared/components/ui";
import { describeError } from "../../shared/api/errorMessage";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useJob } from "./api/useJob";
import {
  useDecideJobApplication,
  useJobApplications,
} from "./api/useJobApplications";
import type { JobApplicationDecision } from "./api/jobs.api";
import { JobApplicantCard } from "./JobApplicantCard";
import {
  JobApplicationsEmpty,
  JobApplicationsError,
  JobApplicationsHeader,
  JobApplicationsSkeleton,
} from "./JobApplicationsSections";
import styles from "./JobApplicationsPage.module.css";

interface PendingDecision {
  applicationId: string;
  status: JobApplicationDecision;
}

/**
 * The employer side of a job posting (BE-HSG-16): everyone who applied, what
 * they wrote, and the decision flow. Until `PATCH /jobs/:slug/applications/:id`
 * had a frontend, every application stayed `submitted` for both sides, so an
 * applicant's status never moved.
 *
 * Accept and decline are irreversible, so both go through `ConfirmDialog`.
 * Starting a review is a soft move and goes straight through. Nothing on screen
 * changes before the server answers, and a refusal (403 not the poster, 409
 * already decided) is written onto the row it belongs to instead of a toast
 * that leaves the list looking as if the decision took.
 */
export function JobApplicationsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { data: job } = useJob(slug);
  const applicationsQuery = useJobApplications(slug);
  const decideApplication = useDecideJobApplication(slug ?? "");
  const [pending, setPending] = useState<PendingDecision | null>(null);
  const [busyApplicationId, setBusyApplicationId] = useState<string | null>(
    null,
  );
  const [rowError, setRowError] = useState<{
    applicationId: string;
    message: string;
  } | null>(null);

  const applications = applicationsQuery.data ?? [];
  const waitingCount = applications.filter(
    (application) =>
      application.status === "submitted" || application.status === "reviewing",
  ).length;

  function runDecision(decision: PendingDecision) {
    setRowError(null);
    setBusyApplicationId(decision.applicationId);
    decideApplication.mutate(decision, {
      onSuccess: () => setPending(null),
      onError: (error) => {
        setPending(null);
        setRowError({
          applicationId: decision.applicationId,
          message: describeError(
            t("economy:jobApplications.decideFailed"),
            error,
            t("shared:apiError.tryAgainTail"),
          ),
        });
      },
      onSettled: () => setBusyApplicationId(null),
    });
  }

  function handleDecide(applicationId: string, status: JobApplicationDecision) {
    // A soft move into review is reversible in practice (the poster can still
    // accept or decline afterwards), so it needs no confirm step. Accept and
    // decline are final, so they do.
    if (status === "reviewing") {
      runDecision({ applicationId, status });
      return;
    }
    setPending({ applicationId, status });
  }

  return (
    <PageShell>
      <div className={styles.page}>
        <JobApplicationsHeader
          jobTitle={job?.title ?? t("economy:jobApplications.fallbackJobTitle")}
          jobSlug={slug ?? ""}
          waitingCount={waitingCount}
          totalCount={applications.length}
        />

        {applicationsQuery.isLoading ? (
          <JobApplicationsSkeleton />
        ) : applicationsQuery.isError ? (
          <JobApplicationsError
            error={applicationsQuery.error}
            onRetry={() => void applicationsQuery.refetch()}
          />
        ) : applications.length === 0 ? (
          <JobApplicationsEmpty />
        ) : (
          <div className={styles.list}>
            {applications.map((application) => (
              <JobApplicantCard
                key={application.id}
                application={application}
                isBusy={busyApplicationId === application.id}
                error={
                  rowError?.applicationId === application.id
                    ? rowError.message
                    : null
                }
                onDecide={(status) => handleDecide(application.id, status)}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={pending !== null && pending.status !== "reviewing"}
        onClose={() => setPending(null)}
        onConfirm={() => {
          if (pending) runDecision(pending);
        }}
        title={t(
          pending?.status === "accepted"
            ? "economy:jobApplications.confirmAccept.title"
            : "economy:jobApplications.confirmDecline.title",
        )}
        description={t(
          pending?.status === "accepted"
            ? "economy:jobApplications.confirmAccept.body"
            : "economy:jobApplications.confirmDecline.body",
        )}
        tone={pending?.status === "declined" ? "destructive" : "default"}
        loading={decideApplication.isPending}
        confirmLabel={t(
          pending?.status === "accepted"
            ? "economy:jobApplications.confirmAccept.cta"
            : "economy:jobApplications.confirmDecline.cta",
        )}
      />
    </PageShell>
  );
}

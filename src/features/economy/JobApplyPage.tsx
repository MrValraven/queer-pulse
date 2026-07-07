import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import {
  FadeIn,
  SuccessPanel,
  Button,
  SkeletonLine,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { ApiError } from "../../shared/api/client";
import { routes } from "../../app/routeMap";
import { JOBS } from "./jobs.data";
import { APPLICANT, AVAILABILITY } from "./jobApply.data";
import { useJob } from "./api/useJob";
import { useApplyToJob } from "./api/useJobMutations";
import type {
  CreateJobApplicationDto,
  JobApplicationAnswer,
} from "./api/jobs.api";
import { JobApplyHeader } from "./JobApplyHeader";
import { JobApplyForm, type JobApplyFields } from "./JobApplyForm";
import { JobApplySidebar } from "./JobApplySidebar";
import styles from "./JobApplyPage.module.css";

const INITIAL: JobApplyFields = {
  name: APPLICANT.name,
  pronouns: APPLICANT.pronouns,
  email: APPLICANT.email,
  location: APPLICANT.location,
  cvName: "",
  site: "",
  instagram: "",
  profileUrl: APPLICANT.profileUrl,
  letter: "",
  when: "now",
  salary: "",
  extra: "",
};

/** Map the apply form into the application DTO the API expects. */
function toApplicationDto(fields: JobApplyFields): CreateJobApplicationDto {
  const availability =
    AVAILABILITY.find((a) => a.value === fields.when)?.title ?? fields.when;
  const answers: JobApplicationAnswer[] = [
    { question: "Available from", answer: availability },
  ];
  const add = (question: string, value: string) => {
    if (value.trim()) answers.push({ question, answer: value.trim() });
  };
  add("Salary expectation", fields.salary);
  add("Based in", fields.location);
  add("Pronouns", fields.pronouns);
  add("Portfolio / site", fields.site);
  add("Instagram", fields.instagram);
  add("Anything else", fields.extra);
  return { coverNote: fields.letter.trim() || undefined, answers };
}

export function JobApplyPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const { data: fetchedJob, isLoading } = useJob(slug);
  const apply = useApplyToJob(slug ?? "");
  const [fields, setFields] = useState<JobApplyFields>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const pct = useMemo(() => {
    let filled = [
      fields.name,
      fields.email,
      fields.location,
      fields.letter,
    ].filter((v) => v.trim().length > 0).length;
    if (fields.cvName) filled += 1;
    return Math.min(100, Math.round((filled / 5) * 100));
  }, [fields]);

  // Demo resolves synchronously from the mock board (no loading flash); live
  // reads the fetched job and shows a skeleton while it loads.
  const job =
    fetchedJob ??
    (demoMode ? (JOBS.find((j) => j.slug === slug) ?? null) : null);

  if (!job) {
    if (!demoMode && isLoading) {
      return (
        <PageShell>
          <div className={styles.page}>
            <Link to={routes.jobs} className={styles.back}>
              ← Back to jobs
            </Link>
            <SkeletonLine width="60%" height={32} style={{ marginTop: 24 }} />
            <SkeletonLine width="90%" height={16} style={{ marginTop: 16 }} />
          </div>
        </PageShell>
      );
    }
    return <Navigate to={routes.jobs} replace />;
  }

  const deadlineFull =
    job.deadline === "Open" ? "Open" : `${job.deadline} 2026`;
  const jobPath = `${routes.jobs}/${job.slug}`;

  function setField<K extends keyof JobApplyFields>(
    key: K,
    value: JobApplyFields[K],
  ) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  function saveDraft() {
    showToast("Draft saved — picks back up whenever you're ready.", "success");
  }

  function submit() {
    if (!fields.name.trim() || !fields.email.trim()) {
      showToast("Add your name and email before sending.", "error");
      return;
    }
    setSubmitting(true);
    if (demoMode) {
      setTimeout(() => {
        setSubmitting(false);
        setSubmitted(true);
      }, 1400);
      return;
    }
    apply.mutate(toApplicationDto(fields), {
      onSuccess: () => {
        setSubmitting(false);
        setSubmitted(true);
      },
      onError: (err) => {
        setSubmitting(false);
        if (err instanceof ApiError && err.status === 409) {
          showToast(
            "You've already applied to this role — check your applications.",
            "error",
          );
        } else {
          showToast(
            "We couldn't send your application. Please try again.",
            "error",
          );
        }
      },
    });
  }

  return (
    <PageShell>
      <div className={styles.page}>
        <Link to={jobPath} className={styles.back}>
          ← Back to job
        </Link>

        {submitted ? (
          <FadeIn>
            <div className={styles.success}>
              <SuccessPanel
                title="Your application's on its way to"
                em={job.org}
                closeLabel="Track your application"
                onClose={() => navigate(routes.applicationStatus)}
                steps={[
                  `${job.org} will see your QueerPulse profile and everything you attached.`,
                  "You'll get a notification the moment they respond.",
                  "Most teams here reply within 10 days.",
                ]}
                footer={
                  <Button variant="ghost-dark" to={routes.jobs}>
                    Back to all jobs
                  </Button>
                }
              >
                Sent to {job.org} for the {job.title} role. Nothing else to do
                right now — the ball's in their court.
              </SuccessPanel>
            </div>
          </FadeIn>
        ) : (
          <FadeIn>
            <JobApplyHeader job={job} deadlineFull={deadlineFull} pct={pct} />
            <div className={styles.grid}>
              <JobApplyForm
                job={job}
                fields={fields}
                setField={setField}
                submitting={submitting}
                onSaveDraft={saveDraft}
                onSubmit={submit}
              />
              <JobApplySidebar job={job} deadlineFull={deadlineFull} />
            </div>
          </FadeIn>
        )}
      </div>
    </PageShell>
  );
}

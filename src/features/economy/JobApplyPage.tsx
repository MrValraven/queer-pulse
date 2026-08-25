import { useMemo, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import {
  FadeIn,
  SuccessPanel,
  Button,
  SkeletonLine,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { useProfileData } from "../../app/providers/useProfile";
import type { AuthUser } from "../auth/api/auth.api";
import { ApiError } from "../../shared/api/client";
import { routes } from "../../app/routeMap";
import { JOBS } from "./jobs.data";
import { APPLICANT, AVAILABILITY_ANSWER } from "./jobApply.data";
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

/** Demo-mode seed: the mock applicant persona, kept exactly as before so the
 *  prototype pre-fills the form as a showcase. */
const DEMO_INITIAL: JobApplyFields = {
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

/**
 * Live-mode seed: identity pre-filled from the SIGNED-IN member (never the demo
 * persona), blank where the profile has no value. Name/pronouns/email/profile
 * URL come straight from the auth session (present the moment the gated route
 * renders); `location` comes from the member's own profile, which is still the
 * seed fallback until its fetch lands — so it stays blank while loading rather
 * than flash a placeholder location the applicant didn't enter.
 */
function liveInitialFields(
  user: AuthUser | null,
  hood: string,
  isProfileLoading: boolean,
): JobApplyFields {
  const profile = user?.profile;
  const name = profile ? `${profile.firstName} ${profile.lastName}`.trim() : "";
  return {
    name,
    pronouns: profile?.pronouns ?? "",
    email: user?.email ?? "",
    location: isProfileLoading ? "" : hood,
    cvName: "",
    site: "",
    instagram: "",
    profileUrl: profile?.slug ? `queerpulse.app/p/${profile.slug}` : "",
    letter: "",
    when: "now",
    salary: "",
    extra: "",
  };
}

/** Map the apply form into the application DTO the API expects. */
function toApplicationDto(fields: JobApplyFields): CreateJobApplicationDto {
  const availability = AVAILABILITY_ANSWER[fields.when] ?? fields.when;
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
  const { t } = useTranslation();
  const fmt = useFormat();
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const { profile, isProfileLoading } = useProfileData();
  const { data: fetchedJob, isLoading } = useJob(slug);
  const apply = useApplyToJob(slug ?? "");
  // Derived inside the component so the live seed can read the session/profile
  // hooks. Demo keeps the mock persona; live pre-fills from the signed-in member
  // (see `liveInitialFields`), never the mock.
  const [fields, setFields] = useState<JobApplyFields>(() =>
    demoMode
      ? DEMO_INITIAL
      : liveInitialFields(user, profile.hood, isProfileLoading),
  );
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
              <FiArrowLeft aria-hidden /> {t("economy:jobApply.backToJobs")}
            </Link>
            <SkeletonLine width="60%" height={32} style={{ marginTop: 24 }} />
            <SkeletonLine width="90%" height={16} style={{ marginTop: 16 }} />
          </div>
        </PageShell>
      );
    }
    return <Navigate to={routes.jobs} replace />;
  }

  const deadlineFull = job.deadline
    ? fmt.date(job.deadline)
    : t("economy:jobs.card.deadlineOpen");
  const jobPath = `${routes.jobs}/${job.slug}`;

  function setField<K extends keyof JobApplyFields>(
    key: K,
    value: JobApplyFields[K],
  ) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  function saveDraft() {
    showToast(t("economy:jobApply.toast.draftSaved"), "success");
  }

  function submit() {
    if (!fields.name.trim() || !fields.email.trim()) {
      showToast(t("economy:jobApply.error.missingFields"), "error");
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
          showToast(t("economy:jobApply.error.alreadyApplied"), "error");
        } else {
          showToast(t("economy:jobApply.error.generic"), "error");
        }
      },
    });
  }

  return (
    <PageShell>
      <div className={styles.page}>
        <Link to={jobPath} className={styles.back}>
          <FiArrowLeft aria-hidden /> {t("economy:jobApply.backToJob")}
        </Link>

        {submitted ? (
          <FadeIn>
            <div className={styles.success}>
              <SuccessPanel
                title={t("economy:jobApply.success.title")}
                em={job.organization}
                closeLabel={t("economy:jobApply.success.closeLabel")}
                onClose={() => void navigate(routes.applicationStatus)}
                steps={[
                  t("economy:jobApply.success.step1", {
                    org: job.organization,
                  }),
                  t("economy:jobApply.success.step2"),
                  t("economy:jobApply.success.step3"),
                ]}
                footer={
                  <Button variant="ghost-dark" to={routes.jobs}>
                    {t("economy:jobApply.success.footerCta")}
                  </Button>
                }
              >
                {t("economy:jobApply.success.body", {
                  org: job.organization,
                  title: job.title,
                })}
              </SuccessPanel>
            </div>
          </FadeIn>
        ) : (
          <FadeIn>
            <JobApplyHeader
              job={job}
              deadlineFull={deadlineFull}
              percent={pct}
            />
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

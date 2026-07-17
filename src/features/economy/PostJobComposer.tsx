import { useState } from "react";
import { FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { usePostedJobs } from "../../app/providers/PostedJobsProvider";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { ApiError } from "../../shared/api/client";
import { useCreateJob } from "./api/useJobMutations";
import { postJobStateToCreateJobDto } from "./api/jobs.adapters";
import { routes } from "../../app/routeMap";
import { PostJobStepper } from "./PostJobStepper";
import { PostJobStepType } from "./PostJobStepType";
import { PostJobStepDetails } from "./PostJobStepDetails";
import { PostJobStepPay } from "./PostJobStepPay";
import { PostJobStepScreening } from "./PostJobStepScreening";
import { PostJobStepReview } from "./PostJobStepReview";
import { PostJobSidebar } from "./PostJobSidebar";
import { PostJobPreviewModal } from "./PostJobPreviewModal";
import { usePostJobForm } from "./usePostJobForm";
import type { CompanyProfile } from "./companies.data";
import type { Job } from "./jobs.data";
import styles from "./PostJobPage.module.css";

const LAST = 4;

export function PostJobComposer({
  company,
  role,
  onSwitchCompany,
  onPublished,
}: {
  company: CompanyProfile;
  role: string;
  onSwitchCompany: () => void;
  onPublished: (job: Job) => void;
}) {
  const { t } = useTranslation();
  const form = usePostJobForm();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { addJob } = usePostedJobs();
  const { demoMode } = useDemoMode();
  const createJob = useCreateJob();
  const [showErrors, setShowErrors] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { step, setStep } = form;

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goTo(target: number) {
    if (target <= step) {
      setStep(target);
      scrollTop();
      return;
    }
    for (let k = step; k < target; k++) {
      if (!form.stepValid(k)) {
        setStep(k);
        setShowErrors(true);
        return;
      }
    }
    setShowErrors(false);
    setStep(target);
    scrollTop();
  }

  function next() {
    if (!form.stepValid(step)) {
      setShowErrors(true);
      showToast(t("economy:postJob.toast.fillHighlighted"), "error");
      return;
    }
    setShowErrors(false);
    setStep(Math.min(step + 1, LAST));
    scrollTop();
  }

  function prev() {
    setStep(Math.max(step - 1, 0));
    scrollTop();
  }

  async function publish() {
    if (!form.canPublish) {
      setShowErrors(true);
      showToast(t("economy:postJob.toast.agreeRequired"), "error");
      return;
    }
    const job = form.toJob(company, role);
    // Demo keeps PostedJobsProvider as the local source of posted jobs.
    if (demoMode) {
      addJob(job);
      form.clearDraft();
      onPublished(job);
      scrollTop();
      return;
    }
    // Live: POST /jobs for the affiliated company (403 if not on its team).
    try {
      await createJob.mutateAsync(
        postJobStateToCreateJobDto(form.state, company, role),
      );
      form.clearDraft();
      onPublished(job);
      scrollTop();
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        showToast(
          t("economy:postJob.toast.notAuthorised", {
            company: company.nameText,
          }),
          "error",
        );
      } else {
        showToast(t("economy:postJob.toast.publishError"), "error");
      }
    }
  }

  return (
    <>
      <div className={styles.topbar}>
        <button
          type="button"
          className={styles.back}
          onClick={() => navigate(routes.jobs)}
        >
          <FiChevronLeft aria-hidden /> {t("economy:postJob.topbar.back")}
        </button>
        <span className={styles.spacerFlex} />
        <span className={styles.autosave}>
          <span className={styles.svDot} aria-hidden />
          {form.justSaved
            ? t("economy:postJob.topbar.savedJustNow")
            : t("economy:postJob.topbar.autosaves")}
        </span>
      </div>

      <div className={styles.layout}>
        <div>
          <PostJobStepper step={step} onGo={goTo} />

          {step === 0 && (
            <PostJobStepType form={form} showErrors={showErrors} />
          )}
          {step === 1 && (
            <PostJobStepDetails form={form} showErrors={showErrors} />
          )}
          {step === 2 && <PostJobStepPay form={form} />}
          {step === 3 && (
            <PostJobStepScreening
              form={form}
              company={company}
              role={role}
              onSwitchCompany={onSwitchCompany}
            />
          )}
          {step === 4 && (
            <PostJobStepReview form={form} company={company} onEdit={goTo} />
          )}

          <div className={styles.stepNav}>
            {step > 0 && (
              <Button variant="ghost" onClick={prev}>
                {t("economy:postJob.nav.back")}
              </Button>
            )}
            <span className={styles.spacerFlex} />
            {step < LAST ? (
              <Button variant="primary" onClick={next}>
                {t("economy:postJob.nav.continue")}
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() =>
                    showToast(t("economy:postJob.toast.saveDraft"), "success")
                  }
                >
                  {t("economy:postJob.nav.saveDraft")}
                </Button>
                <Button
                  variant="primary"
                  disabled={!form.canPublish || createJob.isPending}
                  onClick={publish}
                >
                  {createJob.isPending
                    ? t("economy:postJob.nav.publishing")
                    : t("economy:postJob.nav.publish")}
                </Button>
              </>
            )}
          </div>
        </div>

        <PostJobSidebar
          form={form}
          company={company}
          onOpenFull={() => setPreviewOpen(true)}
        />
      </div>

      {previewOpen && (
        <PostJobPreviewModal
          form={form}
          company={company}
          role={role}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </>
  );
}

import { useState } from "react";
import { FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { usePostedJobs } from "../../app/providers/PostedJobsProvider";
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
  const form = usePostJobForm();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { addJob } = usePostedJobs();
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
      showToast("Please fill the highlighted fields.", "error");
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

  function publish() {
    if (!form.canPublish) {
      setShowErrors(true);
      showToast(
        "Add a title, description, and agree to the Code of Care.",
        "error",
      );
      return;
    }
    const job = form.toJob(company, role);
    addJob(job);
    form.clearDraft();
    onPublished(job);
    scrollTop();
  }

  return (
    <>
      <div className={styles.topbar}>
        <button
          type="button"
          className={styles.back}
          onClick={() => navigate(routes.jobs)}
        >
          <FiChevronLeft aria-hidden /> Jobs &amp; skills
        </button>
        <span className={styles.spacerFlex} />
        <span className={styles.autosave}>
          <span className={styles.svDot} aria-hidden />
          {form.justSaved ? "Saved just now" : "Draft autosaves as you type"}
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
                ← Back
              </Button>
            )}
            <span className={styles.spacerFlex} />
            {step < LAST ? (
              <Button variant="primary" onClick={next}>
                Continue →
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() =>
                    showToast("Draft saved to your company.", "success")
                  }
                >
                  Save draft
                </Button>
                <Button
                  variant="primary"
                  disabled={!form.canPublish}
                  onClick={publish}
                >
                  Publish listing
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

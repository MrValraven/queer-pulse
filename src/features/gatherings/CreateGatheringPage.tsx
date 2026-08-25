import { useCallback, useState } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { FadeIn, Stepper } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useUnsavedChangesGuard, useWizardForm } from "../../shared/hooks";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { PILL_LABEL_KEYS, TIP_KEYS, TOTAL_STEPS } from "./createGathering.data";
import { useGatheringForm } from "./useGatheringForm";
import { useCreateEvent } from "./api/useEventMutations";
import { formToCreateEventDto } from "./api/events.adapters";
import { CREATE_GATHERING_COMMUNITY_PARAM } from "./data";
import { CreateGatheringSuccess } from "./CreateGatheringSuccess";
import {
  CapacityStep,
  DatePlaceStep,
  RepeatsStep,
  ReviewStep,
  TypeStep,
} from "./steps";
import styles from "./CreateGatheringPage.module.css";

export function CreateGatheringPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation();
  // The slug the backend assigns on a successful create — used to send the
  // organiser to their real gathering page (null in demo, where nothing is
  // persisted, so the CTA falls back to the events board).
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  // The success screen lives outside the wizard's step machine: publishing runs
  // the real createEvent mutation, so we only flip to success from its onSuccess
  // (never from the simulated submit lifecycle).
  const [published, setPublished] = useState(false);
  // A community's Events tab links here as `?community=<slug>` so the host
  // lands with that community already picked (see `createGatheringPath`). Read
  // once, on mount, by the form hook: changing the URL afterwards does not
  // overwrite a pick the host has since made.
  const [searchParams] = useSearchParams();
  const form = useGatheringForm({
    communitySlug: searchParams.get(CREATE_GATHERING_COMMUNITY_PARAM) ?? "",
  });
  const createEvent = useCreateEvent();

  // Per-step required-field gate (0-based indices): step 0 needs a format and a
  // name so a nameless/typeless gathering can never advance or publish; step 1
  // needs a real future start; the final step needs all three confirmations.
  // Every other step is optional and always advanceable.
  const isStepComplete = useCallback(
    (stepIndex: number) => {
      if (stepIndex === 0)
        return Boolean(form.type) && form.title.trim().length > 0;
      if (stepIndex === 1) return form.dateValid;
      if (stepIndex === 2) return form.recurrenceValid;
      if (stepIndex === TOTAL_STEPS - 1) return form.allChecked;
      return true;
    },
    [
      form.type,
      form.title,
      form.dateValid,
      form.recurrenceValid,
      form.allChecked,
    ],
  );
  const {
    currentStepIndex,
    canAdvanceFromStep,
    goToNextStep,
    goToPreviousStep,
  } = useWizardForm({ stepCount: TOTAL_STEPS, isStepComplete });
  const isLastStep = currentStepIndex === TOTAL_STEPS - 1;

  // Warn before an in-progress gathering is abandoned. Inactive once the
  // gathering is published so the success CTAs — and, in live mode, the automatic
  // redirect to the new event page — navigate freely without a false prompt.
  useUnsavedChangesGuard({
    active: form.dirty && !published && !createEvent.isPending,
    confirmMessage: t("gatherings:create.nav.leaveConfirm"),
  });

  const publishPending = isLastStep && createEvent.isPending;
  const nextDisabled = !canAdvanceFromStep(currentStepIndex) || publishPending;
  const nextHint =
    currentStepIndex === 0 && !canAdvanceFromStep(0)
      ? t("gatherings:create.nav.detailsHint")
      : currentStepIndex === 1 && !form.dateValid
        ? t("gatherings:create.nav.dateHint")
        : currentStepIndex === 2 && !form.recurrenceValid
          ? t("gatherings:create.nav.repeatsHint")
          : isLastStep && !form.allChecked
            ? t("gatherings:create.nav.publishHint")
            : undefined;

  const next = () => {
    if (!canAdvanceFromStep(currentStepIndex)) return;
    if (isLastStep) {
      if (createEvent.isPending) return;
      // Only celebrate on a real success. The old code advanced to the success
      // step and toasted "published" synchronously, before the request settled,
      // so a rejected create (e.g. a 400) still showed the success panel and its
      // CTA. Now the success screen and toast fire from onSuccess; a failure keeps
      // the organiser on the review step with an error toast so they can retry.
      createEvent.mutate(formToCreateEventDto(form), {
        onSuccess: ({ slug }) => {
          if (slug) setCreatedSlug(slug);
          setPublished(true);
          showToast(t("gatherings:create.toast.published"), "success");
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
        onError: () =>
          showToast(t("gatherings:create.toast.publishError"), "error"),
      });
      return;
    }
    goToNextStep();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const back = () => {
    if (currentStepIndex === 0) void navigate(routes.host);
    else goToPreviousStep();
  };

  // Sidebar tip tracks the on-screen step; the success screen keeps the review
  // tip (matching the previous 1-indexed `min(step, TOTAL_STEPS)` behaviour).
  const tipIndex = published ? TOTAL_STEPS - 1 : currentStepIndex;

  return (
    <PageShell>
      <section className={styles.section}>
        <div className="wrap">
          <div className={styles.head}>
            <div className={styles.eye}>{t("gatherings:create.eyebrow")}</div>
            <h2 className={styles.title}>
              <Translation
                i18nKey="gatherings:create.title"
                components={{ em: <em /> }}
              />
            </h2>
            <p className={styles.sub}>{t("gatherings:create.lead")}</p>
          </div>

          {!published && (
            <div className={styles.progressWrap}>
              <Stepper
                steps={PILL_LABEL_KEYS.map((labelKey) => ({
                  key: labelKey,
                  label: t(labelKey),
                }))}
                current={currentStepIndex}
                ariaLabel={t("gatherings:create.eyebrow")}
              />
            </div>
          )}

          <div className={styles.layout}>
            <div>
              {!published && (
                <FadeIn key={currentStepIndex}>
                  {currentStepIndex === 0 && <TypeStep form={form} />}
                  {currentStepIndex === 1 && <DatePlaceStep form={form} />}
                  {currentStepIndex === 2 && <RepeatsStep form={form} />}
                  {currentStepIndex === 3 && <CapacityStep form={form} />}
                  {currentStepIndex === 4 && <ReviewStep form={form} />}
                </FadeIn>
              )}

              {published && (
                <CreateGatheringSuccess
                  access={form.access}
                  createdSlug={createdSlug}
                />
              )}

              {!published && (
                <div className={styles.nav}>
                  <button type="button" className={styles.back} onClick={back}>
                    {currentStepIndex === 0 ? (
                      t("gatherings:create.nav.cancel")
                    ) : (
                      <>
                        <FiArrowLeft aria-hidden />{" "}
                        {t("gatherings:create.nav.back")}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className={styles.next}
                    onClick={next}
                    disabled={nextDisabled}
                    title={nextHint}
                  >
                    {isLastStep ? (
                      <>
                        {t("gatherings:create.nav.publish")}{" "}
                        <FiArrowRight aria-hidden />
                      </>
                    ) : (
                      <>
                        {t("gatherings:create.nav.continue")}{" "}
                        <FiArrowRight aria-hidden />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <aside className={styles.sidebar}>
              <div className={styles.tipCard}>
                <div className={styles.tipTitle}>
                  {t("gatherings:create.sidebar.tipLabel")}
                </div>
                <div className={styles.tipBody}>{t(TIP_KEYS[tipIndex]!)}</div>
              </div>
              <div className={styles.tipCard}>
                <div className={styles.tipTitle}>
                  {t("gatherings:create.sidebar.afterTitle")}
                </div>
                <div className={styles.tipBody}>
                  {t("gatherings:create.sidebar.afterBody")}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

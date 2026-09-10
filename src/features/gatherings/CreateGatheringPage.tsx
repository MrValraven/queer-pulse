import { useCallback, useMemo, useState } from "react";
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
import {
  CREATE_GATHERING_COMMUNITY_PARAM,
  DUPLICATE_GATHERING_PARAM,
} from "./data";
import { gatheringToFormSeed } from "./gatheringSeed";
import { useEvent } from "./api/useEvent";
import { CreateGatheringSuccess } from "./CreateGatheringSuccess";
import {
  CapacityStep,
  DatePlaceStep,
  RepeatsStep,
  ReviewStep,
  StepRequirementChecklist,
  TypeStep,
} from "./steps";
import {
  isStepSatisfied,
  visibleStepRequirements,
} from "./createGatheringSteps";
import styles from "./CreateGatheringPage.module.css";

/** Ties the Next button to the checklist naming what is blocking it. Only one
 *  create-gathering wizard is ever on screen, so a constant is enough. */
const GATE_ID = "create-gathering-requirements";

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
  // "Run this again" (PRD-190): `?duplicate=<slug>` fetches that gathering and
  // seeds the wizard from it. The fetch is asynchronous, so the seed is applied
  // by `useGatheringForm` whenever it lands rather than only on mount —
  // `useMemo` keeps its identity stable so it is applied exactly once.
  const duplicateSlug = searchParams.get(DUPLICATE_GATHERING_PARAM);
  const { data: duplicateSource } = useEvent(duplicateSlug ?? undefined);
  const seed = useMemo(
    () =>
      duplicateSlug && duplicateSource
        ? gatheringToFormSeed(duplicateSource.gathering)
        : undefined,
    [duplicateSlug, duplicateSource],
  );
  const form = useGatheringForm({
    communitySlug: searchParams.get(CREATE_GATHERING_COMMUNITY_PARAM) ?? "",
    ...(seed ? { seed } : {}),
  });
  const createEvent = useCreateEvent();

  // Which fields a step demands, and why the button is dark, both come from
  // `createGatheringSteps.ts`. They used to be written twice here: a gate that
  // disabled the button and a separate ternary that wrote its tooltip. The two
  // had drifted apart.
  const isStepComplete = useCallback(
    (stepIndex: number) => isStepSatisfied(form, stepIndex),
    [form],
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
  const requirements = visibleStepRequirements(form, currentStepIndex);

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
                  accessibilityAnswers={form.accessibilityAnswers}
                  createdSlug={createdSlug}
                />
              )}

              {!published && (
                <StepRequirementChecklist
                  id={GATE_ID}
                  requirements={requirements}
                  isLastStep={isLastStep}
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
                  {/* `aria-disabled` rather than `disabled`: a disabled button
                      cannot be focused, so a keyboard or screen-reader user had
                      no way to reach the button OR the reason it was dark. The
                      click handler already refuses to advance an unsatisfied
                      step, so the behaviour is unchanged. */}
                  <button
                    type="button"
                    className={styles.next}
                    onClick={next}
                    aria-disabled={nextDisabled}
                    aria-describedby={GATE_ID}
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

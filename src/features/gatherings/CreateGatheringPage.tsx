import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAward, FiCheck } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { Button, FadeIn } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  PILL_LABEL_KEYS,
  TIP_KEYS,
  TOTAL_STEPS,
  accessLabelKey,
} from "./createGathering.data";
import { useGatheringForm } from "./useGatheringForm";
import { useCreateEvent } from "./api/useEventMutations";
import { formToCreateEventDto } from "./api/events.adapters";
import {
  CapacityStep,
  DatePlaceStep,
  PricingStep,
  ReviewStep,
  TypeStep,
} from "./CreateGatheringSteps";
import styles from "./CreateGatheringPage.module.css";

export function CreateGatheringPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const form = useGatheringForm();
  const createEvent = useCreateEvent();

  const isSuccess = step === 6;
  const fill = ((step - 1) / TOTAL_STEPS) * 100;
  const canPublish = step !== TOTAL_STEPS || form.allChecked;

  const next = () => {
    if (step === TOTAL_STEPS) {
      if (!form.allChecked) return;
      createEvent.mutate(formToCreateEventDto(form), {
        onError: () =>
          showToast(t("gatherings:create.toast.publishError"), "error"),
      });
      setStep(6);
      showToast(t("gatherings:create.toast.published"), "success");
    } else {
      setStep((s) => s + 1);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const back = () => {
    if (step === 1) navigate(routes.host);
    else setStep((s) => s - 1);
  };

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

          {!isSuccess && (
            <div className={styles.progressWrap}>
              <div className={styles.stepPills}>
                {PILL_LABEL_KEYS.map((labelKey, i) => {
                  const s = i + 1;
                  const cls =
                    s < step
                      ? styles.pillDone
                      : s === step
                        ? styles.pillActive
                        : styles.pillPending;
                  return (
                    <div key={labelKey} className={`${styles.pill} ${cls}`}>
                      {t(labelKey)}
                    </div>
                  );
                })}
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ transform: `scaleX(${fill / 100})` }}
                />
              </div>
            </div>
          )}

          <div className={styles.layout}>
            <div>
              {!isSuccess && (
                <FadeIn key={step}>
                  {step === 1 && <TypeStep form={form} />}
                  {step === 2 && <DatePlaceStep form={form} />}
                  {step === 3 && <CapacityStep form={form} />}
                  {step === 4 && <PricingStep form={form} />}
                  {step === 5 && <ReviewStep form={form} />}
                </FadeIn>
              )}

              {isSuccess && (
                <div className={styles.success}>
                  <div className={styles.successIcon}>
                    <FiAward />
                  </div>
                  <div className={styles.successTitle}>
                    <Translation
                      i18nKey="gatherings:create.success.title"
                      components={{ em: <em /> }}
                    />
                  </div>
                  <p className={styles.successSub}>
                    {t("gatherings:create.success.body")}
                  </p>
                  {form.access.size > 0 && (
                    <div className={styles.successAccess}>
                      <span className={styles.successAccessLbl}>
                        {t("gatherings:create.success.accessLabel")}
                      </span>
                      <div className={styles.successAccessTags}>
                        {[...form.access].map((a) => (
                          <span key={a} className={styles.successAccessTag}>
                            <FiCheck /> {t(accessLabelKey(a) ?? a)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className={styles.successActions}>
                    <Button to={routes.gathering} variant="ghost-dark">
                      {t("gatherings:create.success.viewCta")} →
                    </Button>
                    <Button to={routes.event} variant="primary">
                      {t("gatherings:create.success.eventCta")} →
                    </Button>
                  </div>
                </div>
              )}

              {!isSuccess && (
                <div className={styles.nav}>
                  <button type="button" className={styles.back} onClick={back}>
                    {step === 1 ? (
                      t("gatherings:create.nav.cancel")
                    ) : (
                      <>← {t("gatherings:create.nav.back")}</>
                    )}
                  </button>
                  <button
                    type="button"
                    className={styles.next}
                    onClick={next}
                    disabled={!canPublish}
                    title={
                      !canPublish
                        ? t("gatherings:create.nav.publishHint")
                        : undefined
                    }
                  >
                    {step === TOTAL_STEPS ? (
                      <>{t("gatherings:create.nav.publish")} →</>
                    ) : (
                      <>{t("gatherings:create.nav.continue")} →</>
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
                <div className={styles.tipBody}>
                  {t(TIP_KEYS[Math.min(step, TOTAL_STEPS) - 1]!)}
                </div>
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

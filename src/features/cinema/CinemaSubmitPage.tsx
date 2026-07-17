import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  FadeIn,
  Spinner,
  SuccessPanel,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { routes } from "../../app/routeMap";
import { CinemaShell } from "./CinemaShell";
import { PROMISE_ROWS, SUBMIT_STEPS } from "./cinemaSubmit.data";
import { useSubmitForm } from "./useSubmitForm";
import { CinemaSubmitStepper } from "./CinemaSubmitStepper";
import { CinemaSubmitAside } from "./CinemaSubmitAside";
import { CinemaSubmitStep1 } from "./CinemaSubmitStep1";
import {
  CinemaSubmitStep2,
  CinemaSubmitStep3,
  CinemaSubmitStep4,
} from "./CinemaSubmitSteps234";
import { CinemaSubmitReview } from "./CinemaSubmitReview";
import type { SubmitDraft } from "./useSubmitForm";
import styles from "./CinemaSubmitPage.module.css";

type Phase = "form" | "sending" | "success";

const NEXT_LABEL_KEYS = [
  "cinema:submit.nav.next.accessibility",
  "cinema:submit.nav.next.rights",
  "cinema:submit.nav.next.revenue",
  "cinema:submit.nav.next.review",
  "cinema:submit.nav.next.submit",
];

/** Per-step gate: what must be filled before advancing. */
function blocker(step: number, d: SubmitDraft, t: TFunction): string | null {
  if (step === 0) {
    if (!d.title.trim()) return t("cinema:submit.blocker.title");
    if (!d.synopsis.trim()) return t("cinema:submit.blocker.synopsis");
    if (!d.screener.trim()) return t("cinema:submit.blocker.screener");
  }
  if (step === 2 && !d.rightsConfirmed)
    return t("cinema:submit.blocker.rights");
  if (step === 4 && !d.agreed) return t("cinema:submit.blocker.agree");
  return null;
}

export function CinemaSubmitPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const form = useSubmitForm();
  const { draft } = form;

  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(0);
  const [phase, setPhase] = useState<Phase>("form");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const scrollUp = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const goTo = (n: number) => {
    setStep(n);
    setReached((r) => Math.max(r, n));
    scrollUp();
  };

  const next = () => {
    const block = blocker(step, draft, t);
    if (block) {
      showToast(block, "info");
      return;
    }
    if (step < SUBMIT_STEPS.length - 1) {
      goTo(step + 1);
      return;
    }
    setPhase("sending");
    scrollUp();
    timer.current = setTimeout(() => {
      setPhase("success");
      showToast(t("cinema:submit.toast.submitted"), "success");
      scrollUp();
    }, 1600);
  };

  const back = () => {
    if (step === 0) navigate(routes.cinema);
    else goTo(step - 1);
  };

  return (
    <CinemaShell>
      <div className={styles.light}>
        <section className={styles.subHeader}>
          <div className={`wrap ${styles.shInner}`}>
            <div>
              <div className={styles.shEb}>
                {t("cinema:submit.header.eyebrow")}
              </div>
              <h1 className={styles.shTitle}>
                <Translation
                  i18nKey="cinema:submit.header.title"
                  components={{ em: <em /> }}
                />
              </h1>
              <p className={styles.shSub}>{t("cinema:submit.header.sub")}</p>
            </div>
            <div className={styles.promise}>
              <div className={styles.spHead}>
                {t("cinema:submit.promise.heading")}
              </div>
              {PROMISE_ROWS.map((r) => (
                <div key={r.labelKey} className={styles.spRow}>
                  <span className="k">{t(r.labelKey)}</span>
                  <span className="v">
                    {r.valueKey ? (
                      <Translation
                        i18nKey={r.valueKey}
                        components={{ em: <em /> }}
                      />
                    ) : (
                      <>
                        {r.pre}
                        <em>{r.em}</em>
                        {r.post}
                      </>
                    )}
                  </span>
                </div>
              ))}
              <div className={styles.spNote}>
                {t("cinema:submit.promise.note")}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.subBody}>
          <div className={`wrap ${styles.sbInner}`}>
            {phase === "success" ? (
              <SubmitDone
                onAnother={() => {
                  form.reset();
                  setStep(0);
                  setReached(0);
                  setPhase("form");
                  scrollUp();
                }}
              />
            ) : phase === "sending" ? (
              <div className={styles.formBlock}>
                <div style={{ textAlign: "center", padding: "48px 0" }}>
                  <Spinner />
                  <p
                    style={{
                      marginTop: 18,
                      fontFamily: "var(--serif)",
                      fontStyle: "italic",
                      fontSize: 20,
                      color: "var(--plum)",
                    }}
                  >
                    {t("cinema:submit.sending.text")}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <CinemaSubmitStepper
                  step={step}
                  reached={reached}
                  onGo={goTo}
                />
                <FadeIn key={step}>
                  {step === 0 && <CinemaSubmitStep1 form={form} />}
                  {step === 1 && <CinemaSubmitStep2 form={form} />}
                  {step === 2 && <CinemaSubmitStep3 form={form} />}
                  {step === 3 && <CinemaSubmitStep4 form={form} />}
                  {step === 4 && (
                    <CinemaSubmitReview form={form} onEdit={goTo} />
                  )}
                  <div className={styles.formNav}>
                    <span className={styles.hint}>
                      {t("cinema:submit.nav.hint", {
                        step: step + 1,
                        total: SUBMIT_STEPS.length,
                      })}
                    </span>
                    <div className={styles.navBtns}>
                      <Button
                        variant="ghost"
                        onClick={
                          step === 0
                            ? () =>
                                showToast(
                                  t("cinema:submit.toast.draftSaved"),
                                  "success",
                                )
                            : back
                        }
                      >
                        {step === 0
                          ? t("cinema:submit.nav.saveDraft")
                          : t("cinema:submit.nav.back")}
                      </Button>
                      <Button onClick={next}>
                        {t(NEXT_LABEL_KEYS[step]!)}
                      </Button>
                    </div>
                  </div>
                </FadeIn>
              </div>
            )}

            {phase !== "success" && <CinemaSubmitAside />}
          </div>
        </section>
      </div>
    </CinemaShell>
  );
}

function SubmitDone({ onAnother }: { onAnother: () => void }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div style={{ gridColumn: "1 / -1" }}>
      <SuccessPanel
        title={t("cinema:submit.success.title")}
        em={t("cinema:submit.success.em")}
        onClose={() => navigate(routes.cinema)}
        closeLabel={t("cinema:submit.success.closeLabel")}
        steps={[
          t("cinema:submit.success.step1"),
          t("cinema:submit.success.step2"),
          t("cinema:submit.success.step3"),
        ]}
        footer={
          <Button variant="ghost-dark" onClick={onAnother}>
            {t("cinema:submit.success.anotherCta")}
          </Button>
        }
      >
        {t("cinema:submit.success.body")}
      </SuccessPanel>
    </div>
  );
}

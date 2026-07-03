import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  FadeIn,
  Spinner,
  SuccessPanel,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
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

const NEXT_LABELS = [
  "Next: Accessibility →",
  "Next: Rights →",
  "Next: Revenue →",
  "Review your film →",
  "Submit your film →",
];

/** Per-step gate: what must be filled before advancing. */
function blocker(step: number, d: SubmitDraft): string | null {
  if (step === 0) {
    if (!d.title.trim()) return "Add your film's title first.";
    if (!d.synopsis.trim()) return "A short synopsis, in your own words.";
    if (!d.screener.trim()) return "Paste a screener link so we can watch it.";
  }
  if (step === 2 && !d.rightsConfirmed)
    return "Please confirm you hold the rights.";
  if (step === 4 && !d.agreed) return "Agree to the co-op terms to submit.";
  return null;
}

export function CinemaSubmitPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
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
    const block = blocker(step, draft);
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
      showToast("Your film is with the programming team", "success");
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
                For filmmakers · open submission
              </div>
              <h1 className={styles.shTitle}>
                Submit <em>your</em> film.
              </h1>
              <p className={styles.shSub}>
                The cinema is open to any queer filmmaker — community member or
                not. Five steps, 20 minutes. You choose your revenue model. The
                split is the same for everyone: 80% of every rent or buy comes
                to you.
              </p>
            </div>
            <div className={styles.promise}>
              <div className={styles.spHead}>The promise, in numbers</div>
              {PROMISE_ROWS.map((r) => (
                <div key={r.k} className={styles.spRow}>
                  <span className="k">{r.k}</span>
                  <span className="v">
                    {r.pre}
                    <em>{r.em}</em>
                    {r.post}
                  </span>
                </div>
              ))}
              <div className={styles.spNote}>
                Non-exclusive means you can still show elsewhere — festivals,
                your own site, other platforms. We hold no lock-in.
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
                    Sending your film to the programming team…
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
                      Step {step + 1} of {SUBMIT_STEPS.length} · Progress saves
                      automatically
                    </span>
                    <div className={styles.navBtns}>
                      <Button
                        variant="ghost"
                        onClick={
                          step === 0
                            ? () =>
                                showToast(
                                  "Draft saved to this device",
                                  "success",
                                )
                            : back
                        }
                      >
                        {step === 0 ? "Save draft" : "← Back"}
                      </Button>
                      <Button onClick={next}>{NEXT_LABELS[step]}</Button>
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
  return (
    <div style={{ gridColumn: "1 / -1" }}>
      <SuccessPanel
        title="Your film is"
        em="in the queue."
        onClose={() => navigate(routes.cinema)}
        closeLabel="Back to the cinema"
        steps={[
          "A human watches it within 10–14 days — every submission, no exceptions.",
          "We write back either way, with specific notes if it's a no.",
          "If it's a yes, you're paid within 7 days of every rent, buy, and tip.",
        ]}
        footer={
          <Button variant="ghost-dark" onClick={onAnother}>
            Submit another film
          </Button>
        }
      >
        Thank you for trusting us with it. Non-exclusive means nothing changes
        for you elsewhere — keep showing it wherever you like while we take a
        look.
      </SuccessPanel>
    </div>
  );
}

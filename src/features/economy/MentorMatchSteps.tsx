import { useState } from "react";
import { LuSprout, LuTreeDeciduous } from "react-icons/lu";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { MENTEE_AREAS, MENTOR_AREAS, type Mode } from "./mentorship.data";
import styles from "./MentorshipPage.module.css";

function CheckGrid({ options }: { options: string[] }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  return (
    <div className={styles.mmCheckGrid}>
      {options.map((o) => (
        <label
          key={o}
          className={[styles.mmCheck, checked.has(o) && styles.mmCheckActive]
            .filter(Boolean)
            .join(" ")}
        >
          <input
            type="checkbox"
            checked={checked.has(o)}
            onChange={() =>
              setChecked((prev) => {
                const n = new Set(prev);
                if (n.has(o)) n.delete(o);
                else n.add(o);
                return n;
              })
            }
          />
          {o}
        </label>
      ))}
    </div>
  );
}

export function MentorMatchSuccess({
  mode,
  onClose,
}: {
  mode: Mode;
  onClose: () => void;
}) {
  return (
    <div className={styles.mmSuccess}>
      <div className={styles.mmSuccessIcon}>
        {mode === "mentee" ? <LuSprout /> : <LuTreeDeciduous />}
      </div>
      <div className={styles.mmTitle} style={{ fontSize: 24 }}>
        {mode === "mentee" ? "Request received." : "Thank you."}
      </div>
      <p className={styles.mmDesc}>
        {mode === "mentee"
          ? "We'll review your request and send you a match suggestion within 2 weeks. The introduction will come by email."
          : "We'll add you to the mentor pool and reach out when we have a good match for you. It means a lot."}
      </p>
      <Button type="button" variant="ghost" onClick={onClose}>
        Done
      </Button>
    </div>
  );
}

export function MenteeSteps({
  step,
  setStep,
}: {
  step: number;
  setStep: (s: number) => void;
}) {
  const { showToast } = useToast();
  return (
    <>
      {step === 1 && (
        <>
          <div className={styles.mmEye}>Finding you a mentor</div>
          <div className={styles.mmTitle}>What do you need help with?</div>
          <p className={styles.mmDesc}>
            Pick the areas where you'd most benefit from guidance. We'll match
            you with someone who has direct experience there.
          </p>
          <CheckGrid options={MENTEE_AREAS} />
          <div className={styles.mmNav}>
            <span />
            <Button
              type="button"
              variant="primary"
              className={styles.mmContinue}
              onClick={() => setStep(2)}
            >
              Continue →
            </Button>
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <div className={styles.mmEye}>About you</div>
          <div className={styles.mmTitle}>What should your mentor know?</div>
          <div className={styles.mmFields}>
            <input
              className={styles.mmInput}
              type="text"
              placeholder="Your name"
            />
            <input
              className={styles.mmInput}
              type="text"
              placeholder="Your role or practice"
            />
            <select className={styles.mmSelect} defaultValue="">
              <option value="">How often would you like to meet?</option>
              <option>Once a month</option>
              <option>Twice a month</option>
              <option>As needed</option>
            </select>
            <textarea
              className={styles.mmTextarea}
              rows={3}
              placeholder="A sentence about what's going on and what kind of support would help…"
            />
          </div>
          <div className={styles.mmNav}>
            <button
              type="button"
              className={styles.mmBack}
              onClick={() => setStep(1)}
            >
              ← Back
            </button>
            <Button
              type="button"
              variant="primary"
              className={styles.mmContinue}
              onClick={() => setStep(3)}
            >
              Continue →
            </Button>
          </div>
        </>
      )}
      {step === 3 && (
        <>
          <div className={styles.mmEye}>Almost done</div>
          <div className={styles.mmTitle}>How do we reach you?</div>
          <div className={styles.mmFields}>
            <input
              className={styles.mmInput}
              type="email"
              placeholder="Your email address"
            />
          </div>
          <p className={styles.mmDesc}>
            We'll review your request and suggest a match within 2 weeks. You'll
            get an email introduction and can take it from there.
          </p>
          <div className={styles.mmNav}>
            <button
              type="button"
              className={styles.mmBack}
              onClick={() => setStep(2)}
            >
              ← Back
            </button>
            <Button
              type="button"
              variant="primary"
              className={styles.mmContinue}
              onClick={() => {
                setStep(4);
                showToast("Match request received", "success");
              }}
            >
              Submit →
            </Button>
          </div>
        </>
      )}
    </>
  );
}

export function MentorSteps({
  step,
  setStep,
}: {
  step: number;
  setStep: (s: number) => void;
}) {
  const { showToast } = useToast();
  return (
    <>
      {step === 1 && (
        <>
          <div className={styles.mmEye}>Becoming a mentor</div>
          <div className={styles.mmTitle}>What can you offer?</div>
          <p className={styles.mmDesc}>
            You don't need to be an expert. You need to have navigated something
            that someone else is currently navigating.
          </p>
          <CheckGrid options={MENTOR_AREAS} />
          <div className={styles.mmNav}>
            <span />
            <Button
              type="button"
              variant="primary"
              className={styles.mmContinue}
              onClick={() => setStep(2)}
            >
              Continue →
            </Button>
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <div className={styles.mmEye}>Your capacity</div>
          <div className={styles.mmTitle}>How much time can you give?</div>
          <div className={styles.mmFields}>
            <input
              className={styles.mmInput}
              type="text"
              placeholder="Your name and role"
            />
            <select className={styles.mmSelect} defaultValue="">
              <option value="">How many mentees per quarter?</option>
              <option>1 mentee</option>
              <option>2 mentees</option>
              <option>3 mentees</option>
            </select>
            <select className={styles.mmSelect} defaultValue="">
              <option value="">Preferred meeting format</option>
              <option>In-person in Lisbon</option>
              <option>Video call</option>
              <option>Either works</option>
            </select>
            <input
              className={styles.mmInput}
              type="email"
              placeholder="Your email address"
            />
          </div>
          <div className={styles.mmNav}>
            <button
              type="button"
              className={styles.mmBack}
              onClick={() => setStep(1)}
            >
              ← Back
            </button>
            <Button
              type="button"
              variant="primary"
              className={styles.mmContinue}
              onClick={() => {
                setStep(3);
                showToast("Added to the mentor pool", "success");
              }}
            >
              Submit →
            </Button>
          </div>
        </>
      )}
    </>
  );
}

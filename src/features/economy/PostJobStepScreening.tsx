import { FiCheck, FiPlus, FiTrash2 } from "react-icons/fi";
import { INCLUSIVITY } from "./postJob.data";
import { CheckGrid } from "./PostJobControls";
import { PostJobSkills } from "./PostJobSkills";
import type { CompanyProfile } from "./companies.data";
import type { PostJobForm } from "./usePostJobForm";
import styles from "./PostJobPage.module.css";

function companyLocation(company: CompanyProfile): string {
  return (
    company.info.find((row) => /office|location/i.test(row.label))?.value ??
    "Lisbon"
  );
}

export function PostJobStepScreening({
  form,
  company,
  role,
  onSwitchCompany,
}: {
  form: PostJobForm;
  company: CompanyProfile;
  role: string;
  onSwitchCompany: () => void;
}) {
  const { state, patch, toggleIn } = form;

  function setQuestion(i: number, v: string) {
    patch({ screening: state.screening.map((q, idx) => (idx === i ? v : q)) });
  }
  function addQuestion() {
    if (state.screening.length < 3)
      patch({ screening: [...state.screening, ""] });
  }
  function removeQuestion(i: number) {
    patch({ screening: state.screening.filter((_, idx) => idx !== i) });
  }

  return (
    <>
      <div className={styles.stepHead}>
        <div className={styles.eyebrow}>Step 4 of 5</div>
        <h1 className={styles.stepTitle}>
          Skills, <em>screening</em> &amp; who&apos;s posting
        </h1>
        <p className={styles.stepSub}>
          This is where QueerPulse listings do more than a generic job board.
        </p>
      </div>

      <PostJobSkills form={form} />

      <div className={styles.card}>
        <div className={styles.cardTitle}>
          Screening questions <span className={styles.muted}>· optional</span>
        </div>
        <div className={styles.cardSub}>
          Ask up to 3 questions respondents must answer. Great for filtering
          quickly.
        </div>
        <div className={styles.sqList}>
          {state.screening.map((q, i) => (
            <div key={i} className={styles.sqItem}>
              <span className={styles.sqNum}>{i + 1}</span>
              <input
                className={styles.input}
                value={q}
                onChange={(e) => setQuestion(i, e.target.value)}
                placeholder="e.g. Are you based in Portugal?"
              />
              <button
                type="button"
                className={styles.sqDel}
                aria-label="Remove question"
                onClick={() => removeQuestion(i)}
              >
                <FiTrash2 size={15} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className={styles.sqAdd}
          onClick={addQuestion}
          disabled={state.screening.length >= 3}
        >
          <FiPlus size={14} aria-hidden /> Add a question
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>This space is…</div>
        <div className={styles.cardSub}>
          Optional signals that tell members what to expect. Only tick
          what&apos;s genuinely true.
        </div>
        <CheckGrid
          options={INCLUSIVITY}
          selected={state.inclusivity}
          onToggle={(v) => toggleIn("inclusivity", v)}
        />
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Who&apos;s posting</div>
        <div className={styles.cardSub}>
          Roles are posted as your verified company — this is what keeps the
          board trustworthy.
        </div>
        <div className={styles.identity}>
          <span className={styles.identityLogo}>{company.logo}</span>
          <div>
            <div className={styles.identityName}>
              {company.nameText}
              <span
                className={styles.identityBadge}
                aria-label="Verified employer"
              >
                <FiCheck aria-hidden />
              </span>
            </div>
            <div className={styles.identitySub}>
              {role} · {companyLocation(company)}
            </div>
          </div>
          <button
            type="button"
            className={styles.identitySwitch}
            onClick={onSwitchCompany}
          >
            Not you?
          </button>
        </div>
      </div>
    </>
  );
}

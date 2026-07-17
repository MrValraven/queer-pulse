import { FiCheck, FiPlus, FiTrash2 } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
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
  const { t } = useTranslation();
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
        <div className={styles.eyebrow}>
          {t("economy:postJob.step4.eyebrow")}
        </div>
        <h1 className={styles.stepTitle}>
          <Translation
            i18nKey="economy:postJob.step4.title"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.stepSub}>{t("economy:postJob.step4.sub")}</p>
      </div>

      <PostJobSkills form={form} />

      <div className={styles.card}>
        <div className={styles.cardTitle}>
          {t("economy:postJob.step4.screeningTitle")}{" "}
          <span className={styles.muted}>
            · {t("economy:postJob.field.optional")}
          </span>
        </div>
        <div className={styles.cardSub}>
          {t("economy:postJob.step4.screeningSub")}
        </div>
        <div className={styles.sqList}>
          {state.screening.map((q, i) => (
            <div key={i} className={styles.sqItem}>
              <span className={styles.sqNum}>{i + 1}</span>
              <input
                className={styles.input}
                value={q}
                onChange={(e) => setQuestion(i, e.target.value)}
                placeholder={t("economy:postJob.step4.questionPlaceholder")}
              />
              <button
                type="button"
                className={styles.sqDel}
                aria-label={t("economy:postJob.step4.removeQuestionAria")}
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
          <FiPlus size={14} aria-hidden />{" "}
          {t("economy:postJob.step4.addQuestion")}
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>
          {t("economy:postJob.step4.spaceIsTitle")}
        </div>
        <div className={styles.cardSub}>
          {t("economy:postJob.step4.spaceIsSub")}
        </div>
        <CheckGrid
          options={INCLUSIVITY}
          selected={state.inclusivity}
          onToggle={(v) => toggleIn("inclusivity", v)}
        />
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>
          {t("economy:postJob.step4.whosPostingTitle")}
        </div>
        <div className={styles.cardSub}>
          {t("economy:postJob.step4.whosPostingSub")}
        </div>
        <div className={styles.identity}>
          <span className={styles.identityLogo}>{company.logo}</span>
          <div>
            <div className={styles.identityName}>
              {company.nameText}
              <span
                className={styles.identityBadge}
                aria-label={t("economy:postJob.step4.verifiedEmployerAria")}
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
            {t("economy:postJob.step4.notYou")}
          </button>
        </div>
      </div>
    </>
  );
}

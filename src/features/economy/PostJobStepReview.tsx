import { useId } from "react";
import { FiCheck } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CONTACT_METHODS } from "./postJob.data";
import { buildReviewRows } from "./postJobReview.data";
import { routes } from "../../app/routeMap";
import type { CompanyProfile } from "./companies.data";
import type { PostJobForm } from "./usePostJobForm";
import styles from "./PostJobPage.module.css";

export function PostJobStepReview({
  form,
  company,
  onEdit,
}: {
  form: PostJobForm;
  company: CompanyProfile;
  onEdit: (step: number) => void;
}) {
  const { t } = useTranslation();
  const fieldId = useId();
  const { state, patch, toggleIn } = form;
  const showEmail = state.contacts.includes("Email");
  const showLink = state.contacts.includes("External link");
  const rows = buildReviewRows(form, company, t);

  return (
    <>
      <div className={styles.stepHead}>
        <div className={styles.eyebrow}>
          {t("economy:postJob.step5.eyebrow")}
        </div>
        <h1 className={styles.stepTitle}>
          <Translation
            i18nKey="economy:postJob.step5.title"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.stepSub}>{t("economy:postJob.step5.sub")}</p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>
          {t("economy:postJob.step5.respondTitle")}
        </div>
        <div className={styles.cardSub}>
          {t("economy:postJob.step5.respondSub")}
        </div>
        <div className={styles.contactGrid}>
          {CONTACT_METHODS.map((m) => {
            const on = state.contacts.includes(m);
            return (
              <button
                key={m}
                type="button"
                role="checkbox"
                aria-checked={on}
                className={[styles.checkOpt, on && styles.checkOptSel]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => toggleIn("contacts", m)}
              >
                <span className={styles.checkBox} aria-hidden>
                  <FiCheck />
                </span>
                <span>{m}</span>
              </button>
            );
          })}
        </div>
        {showEmail && (
          <div className={styles.field} style={{ marginTop: 14 }}>
            <label className={styles.label} htmlFor={`${fieldId}-email`}>
              {t("economy:postJob.step5.emailLabel")}
            </label>
            <input
              id={`${fieldId}-email`}
              className={styles.input}
              type="email"
              value={state.email}
              onChange={(e) => patch({ email: e.target.value })}
              placeholder={t("economy:postJob.step5.emailPlaceholder")}
            />
          </div>
        )}
        {showLink && (
          <div className={styles.field} style={{ marginTop: 14 }}>
            <label className={styles.label} htmlFor={`${fieldId}-link`}>
              {t("economy:postJob.step5.linkLabel")}
            </label>
            <input
              id={`${fieldId}-link`}
              className={styles.input}
              type="url"
              value={state.link}
              onChange={(e) => patch({ link: e.target.value })}
              placeholder={t("economy:postJob.step5.linkPlaceholder")}
            />
          </div>
        )}
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>
          {t("economy:postJob.step5.summaryTitle")}
        </div>
        <div className={styles.reviewGrid} style={{ marginTop: 8 }}>
          {rows.map((r) => (
            <div key={r.k} className={styles.reviewRow}>
              <span className={styles.reviewK}>{r.k}</span>
              <span
                className={[styles.reviewV, r.empty && styles.empty]
                  .filter(Boolean)
                  .join(" ")}
              >
                {r.v}
              </span>
              <button
                type="button"
                className={styles.reviewEdit}
                onClick={() => onEdit(r.step)}
              >
                {t("economy:postJob.step5.editCta")}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.card}>
        <button
          type="button"
          className={[styles.agreeBox, state.agreed && styles.agreeOn]
            .filter(Boolean)
            .join(" ")}
          onClick={() => patch({ agreed: !state.agreed })}
        >
          <span className={styles.agreeCheck} aria-hidden>
            <FiCheck />
          </span>
          <span className={styles.agreeTxt}>
            <Translation
              i18nKey="economy:postJob.step5.agreement"
              components={{
                link: (
                  <Link
                    to={routes.codeOfConduct}
                    onClick={(e) => e.stopPropagation()}
                  />
                ),
                strong: <strong />,
              }}
            />
          </span>
        </button>
      </div>
    </>
  );
}

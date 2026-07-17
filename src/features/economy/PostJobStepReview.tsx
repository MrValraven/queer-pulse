import { FiCheck } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  CATEGORIES,
  COMMITMENTS,
  FORMATS,
  CONTACT_METHODS,
  optionLabel,
} from "./postJob.data";
import { routes } from "../../app/routeMap";
import type { CompanyProfile } from "./companies.data";
import type { PostJobForm } from "./usePostJobForm";
import styles from "./PostJobPage.module.css";

interface Row {
  k: string;
  v: string;
  step: number;
  empty?: boolean;
}

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
  const { state, patch, toggleIn, payLabel } = form;
  const showEmail = state.contacts.includes("Email");
  const showLink = state.contacts.includes("External link");
  const dash = t("economy:postJob.step5.dash");

  const rows: Row[] = [
    {
      k: t("economy:postJob.field.title"),
      v: state.title || dash,
      step: 1,
      empty: !state.title,
    },
    {
      k: t("economy:postJob.field.category"),
      v: optionLabel(CATEGORIES, state.category, t),
      step: 0,
    },
    {
      k: t("economy:postJob.field.arrangement"),
      v: `${optionLabel(COMMITMENTS, state.commitment, t)} · ${optionLabel(FORMATS, state.format, t)}`,
      step: 0,
    },
    ...(state.seniority !== "Any level"
      ? [{ k: t("economy:postJob.field.level"), v: state.seniority, step: 0 }]
      : []),
    ...(form.needsCity
      ? [
          {
            k: t("economy:postJob.field.where"),
            v: state.city || dash,
            step: 0,
            empty: !state.city,
          },
        ]
      : []),
    {
      k: t("economy:postJob.field.description"),
      v: state.description
        ? state.description.slice(0, 90) +
          (state.description.length > 90 ? "…" : "")
        : dash,
      step: 1,
      empty: !state.description,
    },
    {
      k: t("economy:postJob.field.pay"),
      v: payLabel || t("economy:postJob.step5.notSpecified"),
      step: 2,
      empty: !payLabel,
    },
    ...(state.benefits.length
      ? [
          {
            k: t("economy:postJob.field.perks"),
            v: state.benefits.join(", "),
            step: 2,
          },
        ]
      : []),
    ...(state.inclusivity.length
      ? [
          {
            k: t("economy:postJob.field.thisSpaceIs"),
            v: state.inclusivity.join(", "),
            step: 3,
          },
        ]
      : []),
    ...(state.tags.length
      ? [
          {
            k: t("economy:postJob.field.skills"),
            v: state.tags.join(", "),
            step: 3,
          },
        ]
      : []),
    ...(state.screening.filter(Boolean).length
      ? [
          {
            k: t("economy:postJob.field.screening"),
            v: t("economy:postJob.step5.questionCount", {
              count: state.screening.filter(Boolean).length,
            }),
            step: 3,
          },
        ]
      : []),
    { k: t("economy:postJob.field.postingAs"), v: company.nameText, step: 3 },
    {
      k: t("economy:postJob.field.respondVia"),
      v: state.contacts.join(", ") || dash,
      step: 4,
      empty: !state.contacts.length,
    },
  ];

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
            <div className={styles.label}>
              {t("economy:postJob.step5.emailLabel")}
            </div>
            <input
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
            <div className={styles.label}>
              {t("economy:postJob.step5.linkLabel")}
            </div>
            <input
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

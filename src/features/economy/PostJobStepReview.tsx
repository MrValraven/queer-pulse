import { FiCheck } from "react-icons/fi";
import { Link } from "react-router-dom";
import { CONTACT_METHODS } from "./postJob.data";
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
  const { state, patch, toggleIn, payLabel } = form;
  const showEmail = state.contacts.includes("Email");
  const showLink = state.contacts.includes("External link");

  const rows: Row[] = [
    { k: "Title", v: state.title || "—", step: 1, empty: !state.title },
    { k: "Category", v: state.category, step: 0 },
    { k: "Arrangement", v: `${state.commitment} · ${state.format}`, step: 0 },
    ...(state.seniority !== "Any level"
      ? [{ k: "Level", v: state.seniority, step: 0 }]
      : []),
    ...(form.needsCity
      ? [{ k: "Where", v: state.city || "—", step: 0, empty: !state.city }]
      : []),
    {
      k: "Description",
      v: state.description
        ? state.description.slice(0, 90) +
          (state.description.length > 90 ? "…" : "")
        : "—",
      step: 1,
      empty: !state.description,
    },
    { k: "Pay", v: payLabel || "Not specified", step: 2, empty: !payLabel },
    ...(state.benefits.length
      ? [{ k: "Perks", v: state.benefits.join(", "), step: 2 }]
      : []),
    ...(state.inclusivity.length
      ? [{ k: "This space is", v: state.inclusivity.join(", "), step: 3 }]
      : []),
    ...(state.tags.length
      ? [{ k: "Skills", v: state.tags.join(", "), step: 3 }]
      : []),
    ...(state.screening.filter(Boolean).length
      ? [
          {
            k: "Screening",
            v: `${state.screening.filter(Boolean).length} question(s)`,
            step: 3,
          },
        ]
      : []),
    { k: "Posting as", v: company.nameText, step: 3 },
    {
      k: "Respond via",
      v: state.contacts.join(", ") || "—",
      step: 4,
      empty: !state.contacts.length,
    },
  ];

  return (
    <>
      <div className={styles.stepHead}>
        <div className={styles.eyebrow}>Step 5 of 5</div>
        <h1 className={styles.stepTitle}>
          Respond &amp; <em>review</em>
        </h1>
        <p className={styles.stepSub}>
          Choose how people reach you, then give it one last look.
        </p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>How to respond</div>
        <div className={styles.cardSub}>
          Pick one or more. Selected methods reveal their own field.
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
            <div className={styles.label}>Email address</div>
            <input
              className={styles.input}
              type="email"
              value={state.email}
              onChange={(e) => patch({ email: e.target.value })}
              placeholder="you@example.com"
            />
          </div>
        )}
        {showLink && (
          <div className={styles.field} style={{ marginTop: 14 }}>
            <div className={styles.label}>External link</div>
            <input
              className={styles.input}
              type="url"
              value={state.link}
              onChange={(e) => patch({ link: e.target.value })}
              placeholder="https://…"
            />
          </div>
        )}
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Summary</div>
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
                Edit
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
            I confirm this listing follows the{" "}
            <Link
              to={routes.codeOfConduct}
              onClick={(e) => e.stopPropagation()}
            >
              Code of Care
            </Link>{" "}
            — no discrimination on identity, and pay that&apos;s fair.{" "}
            <strong>
              QueerPulse is a solidarity space, not an exploitation channel.
            </strong>
          </span>
        </button>
      </div>
    </>
  );
}

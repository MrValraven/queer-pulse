import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { ModalShell } from "./ModalKit";
import type { CompanyProfile } from "./companies.data";
import type { PostJobForm } from "./usePostJobForm";
import styles from "./PostJobPage.module.css";

export function PostJobPreviewModal({
  form,
  company,
  role,
  onClose,
}: {
  form: PostJobForm;
  company: CompanyProfile;
  role: string;
  onClose: () => void;
}) {
  const { state, payLabel } = form;

  const meta: [string, string][] = [
    ["Category", state.category],
    ["Format", state.format],
    ["Commitment", state.commitment],
  ];
  if (state.seniority !== "Any level") meta.push(["Level", state.seniority]);
  if (form.needsCity && state.city) meta.push(["Where", state.city]);
  if (form.showsTimezone && state.timezone !== "No preference")
    meta.push(["Timezone", state.timezone]);
  if (payLabel) meta.push(["Pay", payLabel]);
  if (state.startDate) meta.push(["Starts", state.startDate]);

  const screening = state.screening.filter(Boolean);
  const contactTxt = state.contacts.join(", ") || "Platform message";

  return (
    <ModalShell onClose={onClose} wide ariaLabel="Listing preview">
      <div className={styles.mlType}>Hiring</div>
      <h2 className={styles.mlTitle}>{state.title || "Untitled listing"}</h2>
      <div className={styles.mlPoster}>
        <span className={styles.affLogo}>{company.logo}</span>
        <div>
          <div className={styles.identityName} style={{ color: "var(--plum)" }}>
            {company.nameText}
            <span className={styles.identityBadge}>
              <FiCheck aria-hidden />
            </span>
          </div>
          <div className={styles.affMeta}>{role} · verified employer</div>
        </div>
      </div>

      <div className={styles.mlMetaRow}>
        {meta.map(([k, v]) => (
          <div key={k}>
            <div className={styles.mlMetaK}>{k}</div>
            <div className={styles.mlMetaV}>{v}</div>
          </div>
        ))}
      </div>

      <div className={styles.mlSection}>
        <h4>About this role</h4>
        <div className={styles.mlDesc}>
          {state.description || "No description yet."}
        </div>
      </div>

      {state.benefits.length > 0 && (
        <div className={styles.mlSection}>
          <h4>Benefits &amp; perks</h4>
          <div className={styles.mlChips}>
            {state.benefits.map((b) => (
              <span key={b} className={styles.mlChip}>
                {b}
              </span>
            ))}
          </div>
        </div>
      )}

      {state.inclusivity.length > 0 && (
        <div className={styles.mlSection}>
          <h4>This space is</h4>
          <div className={styles.mlChips}>
            {state.inclusivity.map((b) => (
              <span
                key={b}
                className={[styles.mlChip, styles.mlChipIncl].join(" ")}
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      )}

      {state.tags.length > 0 && (
        <div className={styles.mlSection}>
          <h4>Skills</h4>
          <div className={styles.mlChips}>
            {state.tags.map((t) => (
              <span key={t} className={styles.mlChip}>
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {screening.length > 0 && (
        <div className={styles.mlSection}>
          <h4>You&apos;ll be asked</h4>
          <ul className={styles.mlSq}>
            {screening.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.nudge} style={{ marginTop: 20 }}>
        <span>
          Respond via <strong>{contactTxt}</strong>
        </span>
        <span style={{ marginLeft: "auto" }}>
          <Button variant="primary" size="md" disabled>
            Respond
          </Button>
        </span>
      </div>
    </ModalShell>
  );
}

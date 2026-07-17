import { FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModalShell } from "./ModalKit";
import {
  CATEGORIES,
  COMMITMENTS,
  FORMATS,
  TIMEZONES,
  optionLabel,
} from "./postJob.data";
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
  const { t } = useTranslation();
  const { state, payLabel } = form;

  const meta: [string, string][] = [
    [
      t("economy:postJob.field.category"),
      optionLabel(CATEGORIES, state.category, t),
    ],
    [t("economy:postJob.field.format"), optionLabel(FORMATS, state.format, t)],
    [
      t("economy:postJob.field.commitment"),
      optionLabel(COMMITMENTS, state.commitment, t),
    ],
  ];
  if (state.seniority !== "Any level")
    meta.push([t("economy:postJob.field.level"), state.seniority]);
  if (form.needsCity && state.city)
    meta.push([t("economy:postJob.field.where"), state.city]);
  if (form.showsTimezone && state.timezone !== "No preference")
    meta.push([
      t("economy:postJob.field.timezone"),
      optionLabel(TIMEZONES, state.timezone, t),
    ]);
  if (payLabel) meta.push([t("economy:postJob.field.pay"), payLabel]);
  if (state.startDate)
    meta.push([t("economy:postJob.field.starts"), state.startDate]);

  const screening = state.screening.filter(Boolean);
  const contactTxt = state.contacts.join(", ") || "Platform message";

  return (
    <ModalShell
      onClose={onClose}
      wide
      ariaLabel={t("economy:postJob.preview.ariaLabel")}
    >
      <div className={styles.mlType}>{t("economy:postJob.sidebar.hiring")}</div>
      <h2 className={styles.mlTitle}>
        {state.title || t("economy:postJob.preview.untitled")}
      </h2>
      <div className={styles.mlPoster}>
        <span className={styles.affLogo}>{company.logo}</span>
        <div>
          <div className={styles.identityName} style={{ color: "var(--plum)" }}>
            {company.nameText}
            <span className={styles.identityBadge}>
              <FiCheck aria-hidden />
            </span>
          </div>
          <div className={styles.affMeta}>
            {role} · {t("economy:postJob.preview.verifiedEmployer")}
          </div>
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
        <h4>{t("economy:postJob.preview.aboutRole")}</h4>
        <div className={styles.mlDesc}>
          {state.description || t("economy:postJob.preview.noDescription")}
        </div>
      </div>

      {state.benefits.length > 0 && (
        <div className={styles.mlSection}>
          <h4>{t("economy:postJob.step3.benefitsTitle")}</h4>
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
          <h4>{t("economy:postJob.preview.inclusivityTitle")}</h4>
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
          <h4>{t("economy:postJob.skills.title")}</h4>
          <div className={styles.mlChips}>
            {state.tags.map((tag) => (
              <span key={tag} className={styles.mlChip}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {screening.length > 0 && (
        <div className={styles.mlSection}>
          <h4>{t("economy:postJob.preview.youllBeAsked")}</h4>
          <ul className={styles.mlSq}>
            {screening.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.nudge} style={{ marginTop: 20 }}>
        <span>
          {t("economy:postJob.preview.respondViaLabel")}{" "}
          <strong>{contactTxt}</strong>
        </span>
        <span style={{ marginLeft: "auto" }}>
          <Button variant="primary" size="md" disabled>
            {t("economy:postJob.preview.respondCta")}
          </Button>
        </span>
      </div>
    </ModalShell>
  );
}

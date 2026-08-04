import { FiArrowRight } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  CATEGORIES,
  COMMITMENTS,
  FORMATS,
  SENIORITY,
  optionLabel,
} from "./postJob.data";
import type { CompanyProfile } from "./companies.data";
import type { PostJobForm } from "./usePostJobForm";
import styles from "./PostJobPage.module.css";

export function PostJobSidebar({
  form,
  company,
  onOpenFull,
}: {
  form: PostJobForm;
  company: CompanyProfile;
  onOpenFull: () => void;
}) {
  const { t } = useTranslation();
  const { state, payLabel } = form;
  const chips = [
    optionLabel(CATEGORIES, state.category, t),
    optionLabel(FORMATS, state.format, t),
    optionLabel(COMMITMENTS, state.commitment, t),
  ];
  if (state.seniority !== "Any level")
    chips.push(optionLabel(SENIORITY, state.seniority, t));
  const desc = state.description
    ? state.description.slice(0, 150) +
      (state.description.length > 150 ? "…" : "")
    : "";

  return (
    <aside>
      <div className={styles.sideCard}>
        <h3 className={styles.sideH}>
          {t("economy:postJob.sidebar.livePreview")}
          <button type="button" className={styles.expand} onClick={onOpenFull}>
            {t("economy:postJob.sidebar.fullView")}
          </button>
        </h3>
        <div className={styles.previewCard}>
          <div className={styles.pvTop}>
            <span className={styles.pvType}>
              {t("economy:postJob.sidebar.hiring")}
            </span>
            {payLabel && <span className={styles.pvComp}>{payLabel}</span>}
          </div>
          <div className={styles.previewTitle}>
            {state.title || t("economy:postJob.sidebar.titlePlaceholder")}
          </div>
          <div className={styles.pvPoster}>
            <span className={styles.pvAv}>{company.logo}</span>
            <span className={styles.pvPosterName}>{company.nameText}</span>
          </div>
          <div
            className={[styles.previewDesc, !desc && styles.empty]
              .filter(Boolean)
              .join(" ")}
          >
            {desc || t("economy:postJob.sidebar.descPlaceholder")}
          </div>
          <div className={styles.previewMeta}>
            {chips.map((c) => (
              <span key={c} className={styles.previewChip}>
                {c}
              </span>
            ))}
            {state.inclusivity.slice(0, 2).map((c) => (
              <span
                key={c}
                className={[styles.previewChip, styles.previewChipIncl].join(
                  " ",
                )}
              >
                {c}
              </span>
            ))}
          </div>
          <button
            type="button"
            className={styles.viewFull}
            onClick={onOpenFull}
          >
            {t("economy:postJob.sidebar.viewFullCta")}{" "}
            <FiArrowRight aria-hidden />
          </button>
        </div>
      </div>

      <div className={styles.sideCard}>
        <h3 className={styles.sideH}>
          {t("economy:postJob.sidebar.howThisWorks")}
        </h3>
        <div className={styles.sideList}>
          <div className={styles.sideItem}>
            <span className={styles.sideDot} aria-hidden />
            <span className={styles.sideText}>
              <Translation
                i18nKey="economy:postJob.sidebar.point1"
                components={{ strong: <strong /> }}
              />
            </span>
          </div>
          <div className={styles.sideItem}>
            <span className={styles.sideDot} aria-hidden />
            <span className={styles.sideText}>
              <Translation
                i18nKey="economy:postJob.sidebar.point2"
                components={{ strong: <strong /> }}
              />
            </span>
          </div>
          <div className={styles.sideItem}>
            <span className={styles.sideDot} aria-hidden />
            <span className={styles.sideText}>
              <Translation
                i18nKey="economy:postJob.sidebar.point3"
                components={{ strong: <strong /> }}
              />
            </span>
          </div>
          <div className={styles.sideItem}>
            <span className={styles.sideDot} aria-hidden />
            <span className={styles.sideText}>
              <Translation
                i18nKey="economy:postJob.sidebar.point4"
                components={{ strong: <strong /> }}
              />
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

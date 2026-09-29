import {
  FiArrowLeft,
  FiCheckCircle,
  FiEdit2,
  FiEye,
  FiEyeOff,
  FiGlobe,
} from "react-icons/fi";
import type { ReactNode } from "react";
import { routes } from "../../../app/routeMap";
import { Button } from "../../../shared/components/ui";
import { LanguageSwitcher } from "../../../shared/i18n/LanguageSwitcher";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { AdminResourceGuideDTO } from "../api/adminResourceGuides.api";
import styles from "./GuidePreview.module.css";

/** Which of the reader gate's two conditions this guide fails, if any. */
function visibilityNoteKey(guide: AdminResourceGuideDTO): string {
  const isPublished = guide.publishedAt !== null;
  const isReviewed = guide.lastReviewedOn !== null;
  if (!isPublished && !isReviewed) {
    return "admin:guidePreview.bar.unpublishedNeverReviewed";
  }
  if (!isPublished) return "admin:guidePreview.bar.unpublished";
  if (!isReviewed) return "admin:guidePreview.bar.neverReviewed";
  return "admin:guidePreview.bar.public";
}

/** One status line under the title. On a phone it clips to a single line, so
 *  the full sentence rides along as the tooltip. */
function BarNote({
  icon,
  text,
  isWarning,
}: {
  icon: ReactNode;
  text: string;
  isWarning: boolean;
}) {
  return (
    <p
      className={
        isWarning ? `${styles.note} ${styles.noteHidden}` : styles.note
      }
      title={text}
    >
      {icon}
      <span className={styles.noteText}>{text}</span>
    </p>
  );
}

/**
 * The admin strip above a previewed guide: what is being previewed, whether
 * readers can see it right now, and the actions an editor reaches for next.
 *
 * It carries no heading, because the page below brings its own h1. The EN/PT
 * switch is the app's own language switch, since the hardcoded guide pages
 * read the app locale and the managed body follows it too.
 */
export function GuidePreviewBar({
  guide,
  onReview,
}: {
  guide: AdminResourceGuideDTO;
  onReview: () => void;
}) {
  const { t, language } = useTranslation();
  const isPublic = guide.publishedAt !== null && guide.lastReviewedOn !== null;
  const title = (language === "pt" && guide.titlePt) || guide.title;
  // A managed guide with no Portuguese sections shows Portuguese readers the
  // English body. A hardcoded page carries its own Portuguese copy.
  const isMissingPortuguese =
    language === "pt" && guide.sections.length > 0 && !guide.sectionsPt?.length;
  const editLabel = t("admin:adminResourceGuides.row.editCta");
  const backLabel = t("admin:guideWorkspace.backToGuidesCta");

  return (
    <div
      className={styles.bar}
      role="region"
      aria-label={t("admin:guidePreview.bar.label")}
    >
      <div className={`wrap ${styles.inner}`}>
        <div className={styles.summary}>
          <p className={styles.heading}>
            <span className={styles.eyebrow}>
              <FiEye aria-hidden />
              {t("admin:guidePreview.bar.eyebrow")}
            </span>
            <span className={styles.title}>{title}</span>
          </p>
          <BarNote
            icon={
              isPublic ? (
                <FiCheckCircle aria-hidden />
              ) : (
                <FiEyeOff aria-hidden />
              )
            }
            text={t(visibilityNoteKey(guide))}
            isWarning={!isPublic}
          />
          {isMissingPortuguese && (
            <BarNote
              icon={<FiGlobe aria-hidden />}
              text={t("admin:guidePreview.bar.portugueseMissing")}
              isWarning={false}
            />
          )}
        </div>
        <div className={styles.actions}>
          <div className={styles.languageSlot}>
            <LanguageSwitcher />
          </div>
          <div className={styles.actionButtons}>
            <Button variant="ghost-dark" size="sm" onClick={onReview}>
              <FiCheckCircle aria-hidden />
              {t("admin:adminResourceGuides.row.reviewCta")}
            </Button>
            <Button
              variant="ghost-dark"
              size="sm"
              to={`${routes.adminResourceGuideEdit}/${guide.id}`}
              title={editLabel}
            >
              <FiEdit2 aria-hidden />
              <span className={styles.iconOnlyLabel}>{editLabel}</span>
            </Button>
            <Button
              variant="ghost-dark"
              size="sm"
              to={routes.adminResourceGuides}
              title={backLabel}
            >
              <FiArrowLeft aria-hidden />
              <span className={styles.iconOnlyLabel}>{backLabel}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiEyeOff,
} from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { formatDate } from "../../shared/lib/date";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AdminResourceGuideDTO } from "./api/adminResourceGuides.api";
import styles from "./AdminResourceGuidesPage.module.css";

export interface AdminResourceGuideRowsProps {
  guides: AdminResourceGuideDTO[];
  onEdit: (guide: AdminResourceGuideDTO) => void;
  onReview: (guide: AdminResourceGuideDTO) => void;
}

const TODAY = () => new Date().toISOString().slice(0, 10);

/**
 * One row per guide, leading with its freshness.
 *
 * The review state is the first thing on the row rather than a detail at the
 * end, because this list exists to answer "which guides are stale?" — a
 * question nobody on the team could answer at all before CON-09, since the
 * only freshness field was set by hand with a SQL statement.
 */
export function AdminResourceGuideRows({
  guides,
  onEdit,
  onReview,
}: AdminResourceGuideRowsProps) {
  const { t } = useTranslation();
  const today = TODAY();

  return (
    <div className={styles.rows}>
      {guides.map((guide) => {
        const isOverdue =
          guide.reviewDueOn !== null && guide.reviewDueOn < today;
        return (
          <div key={guide.id} className={styles.row}>
            <div className={styles.rowMain}>
              <div className={styles.rowTop}>
                <span className={styles.rowName}>{guide.title}</span>
                {!guide.publishedAt && (
                  <span className={styles.rowFlag}>
                    <FiEyeOff aria-hidden />
                    {t("admin:adminResourceGuides.row.unpublished")}
                  </span>
                )}
                {guide.sections.length === 0 && (
                  <span className={styles.rowFlag}>
                    {t("admin:adminResourceGuides.row.notManaged")}
                  </span>
                )}
              </div>
              <div className={styles.rowMeta}>
                <span className={styles.rowSlug}>{guide.slug}</span>
                <span>{guide.category}</span>
                <span
                  className={isOverdue ? styles.rowOverdue : styles.rowReview}
                >
                  {guide.lastReviewedOn ? (
                    <>
                      <FiCheckCircle aria-hidden />
                      {guide.reviewedBy
                        ? t("admin:adminResourceGuides.row.reviewedBy", {
                            date: formatDate(guide.lastReviewedOn),
                            reviewer: guide.reviewedBy,
                          })
                        : t("admin:adminResourceGuides.row.reviewed", {
                            date: formatDate(guide.lastReviewedOn),
                          })}
                    </>
                  ) : (
                    <>
                      <FiClock aria-hidden />
                      {t("admin:adminResourceGuides.row.neverReviewed")}
                    </>
                  )}
                </span>
                {isOverdue && guide.reviewDueOn && (
                  <span className={styles.rowOverdue}>
                    <FiAlertCircle aria-hidden />
                    {t("admin:adminResourceGuides.row.overdue", {
                      date: formatDate(guide.reviewDueOn),
                    })}
                  </span>
                )}
              </div>
            </div>
            <div className={styles.rowActions}>
              <Button variant="ghost" size="sm" onClick={() => onReview(guide)}>
                {t("admin:adminResourceGuides.row.reviewCta")}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onEdit(guide)}>
                {t("admin:adminResourceGuides.row.editCta")}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

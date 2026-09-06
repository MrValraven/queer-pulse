import { FiAlertCircle, FiCheckCircle, FiClock, FiGlobe } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { formatDate } from "../../shared/lib/date";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AdminGlossaryTermDTO } from "./api/adminResourceGuides.api";
import styles from "./AdminGlossaryPage.module.css";

export interface AdminGlossaryRowsProps {
  terms: AdminGlossaryTermDTO[];
  onEdit: (term: AdminGlossaryTermDTO) => void;
  onReview: (term: AdminGlossaryTermDTO) => void;
  onDelete: (term: AdminGlossaryTermDTO) => void;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * One row per glossary term, leading with the two things that make a term
 * wrong for a reader: nobody has checked it, and it has no Portuguese.
 *
 * The public glossary ships an EN/PT toggle and falls back to the English
 * definition when the Portuguese one is missing, so an untranslated term reads
 * as a translated one. Flagging it on the row is what lets an editor find the
 * gap without opening all of them.
 */
export function AdminGlossaryRows({
  terms,
  onEdit,
  onReview,
  onDelete,
}: AdminGlossaryRowsProps) {
  const { t } = useTranslation();
  const today = todayIsoDate();

  return (
    <div className={styles.rows}>
      {terms.map((term) => {
        const isOverdue = term.reviewDueOn !== null && term.reviewDueOn < today;
        return (
          <div key={term.id} className={styles.row}>
            <div className={styles.rowMain}>
              <div className={styles.rowTop}>
                <span className={styles.rowName}>{term.term}</span>
                {!term.definitionPt && (
                  <span className={styles.rowFlag}>
                    <FiGlobe aria-hidden />
                    {t("admin:adminGlossary.row.noPortuguese")}
                  </span>
                )}
              </div>
              <div className={styles.rowMeta}>
                <span className={styles.rowSlug}>{term.slug}</span>
                {term.category && <span>{term.category}</span>}
                <span
                  className={isOverdue ? styles.rowOverdue : styles.rowReview}
                >
                  {term.lastReviewedOn ? (
                    <>
                      <FiCheckCircle aria-hidden />
                      {term.reviewedBy
                        ? t("admin:adminResourceGuides.row.reviewedBy", {
                            date: formatDate(term.lastReviewedOn),
                            reviewer: term.reviewedBy,
                          })
                        : t("admin:adminResourceGuides.row.reviewed", {
                            date: formatDate(term.lastReviewedOn),
                          })}
                    </>
                  ) : (
                    <>
                      <FiClock aria-hidden />
                      {t("admin:adminResourceGuides.row.neverReviewed")}
                    </>
                  )}
                </span>
                {isOverdue && term.reviewDueOn && (
                  <span className={styles.rowOverdue}>
                    <FiAlertCircle aria-hidden />
                    {t("admin:adminResourceGuides.row.overdue", {
                      date: formatDate(term.reviewDueOn),
                    })}
                  </span>
                )}
              </div>
            </div>
            <div className={styles.rowActions}>
              <Button variant="ghost" size="sm" onClick={() => onReview(term)}>
                {t("admin:adminResourceGuides.row.reviewCta")}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onEdit(term)}>
                {t("admin:adminResourceGuides.row.editCta")}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(term)}>
                {t("admin:common.delete")}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

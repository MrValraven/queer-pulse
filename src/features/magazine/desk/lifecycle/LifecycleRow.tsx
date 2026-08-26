import { Link } from "react-router-dom";
import { FiEdit3, FiGlobe } from "react-icons/fi";
import { Button } from "../../../../shared/components/ui";
import { routes } from "../../../../app/routeMap";
import { formatDate } from "../../../../shared/lib/date";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { ArticleLifecycleRecordDTO } from "../../api/lifecycle.api";
import {
  CONTENT_LOCALE_LABEL,
  LIFECYCLE_ICON,
  LIFECYCLE_LABEL_KEY,
} from "./lifecycleLabels";
import styles from "./LifecycleBoard.module.css";

export interface LifecycleRowProps {
  record: ArticleLifecycleRecordDTO;
  /** Absent in demo mode, where there is no write path and the row is a
   *  read-only illustration rather than a control that would fake a save. */
  onEdit?: (record: ArticleLifecycleRecordDTO) => void;
  /** Opens the piece's languages panel. Absent in demo mode for the same
   *  reason as `onEdit`. */
  onLanguages?: (record: ArticleLifecycleRecordDTO) => void;
}

/**
 * CON-16 — one piece on the lifecycle board.
 *
 * The row leads with the headline and answers three questions next to it:
 * where the piece stands, when the desk last said so, and whether a promised
 * re-review has come due. An overdue promise is the one thing here that is
 * genuinely urgent, so it is the one thing coloured.
 */
export function LifecycleRow({
  record,
  onEdit,
  onLanguages,
}: LifecycleRowProps) {
  const { t, language } = useTranslation();
  const Icon = LIFECYCLE_ICON[record.lifecycle];
  const isOverdue =
    record.reviewDueInDays !== null && record.reviewDueInDays < 0;

  return (
    <li className={styles.row}>
      <span
        className={`${styles.stateChip} ${styles[record.lifecycle] ?? ""}`}
        title={t(LIFECYCLE_LABEL_KEY[record.lifecycle])}
      >
        <Icon aria-hidden />
        {t(LIFECYCLE_LABEL_KEY[record.lifecycle])}
      </span>

      <div className={styles.rowMain}>
        <Link
          className={styles.rowTitle}
          to={`${routes.article}?id=${encodeURIComponent(record.slug)}`}
        >
          {record.title}
        </Link>
        <span className={styles.rowMeta}>
          {record.section}
          {record.publishedAt && (
            <>
              {" · "}
              {t("magazine:lifecycle.row.published", {
                date: formatDate(record.publishedAt, language),
              })}
            </>
          )}
          {record.locale !== "en" && (
            <>
              {" · "}
              {CONTENT_LOCALE_LABEL[record.locale]}
            </>
          )}
        </span>
        {record.lifecycleNote && (
          <span className={styles.rowNote}>{record.lifecycleNote}</span>
        )}
        {record.supersededBy && (
          <Link
            className={styles.rowReplacement}
            to={`${routes.article}?id=${encodeURIComponent(record.supersededBy.slug)}`}
          >
            {t("magazine:lifecycle.row.replacedBy", {
              title: record.supersededBy.title,
            })}
          </Link>
        )}
      </div>

      <span
        className={`${styles.due} ${isOverdue ? styles.dueOverdue : ""}`.trim()}
      >
        {record.reviewDueOn
          ? isOverdue
            ? t("magazine:lifecycle.row.overdueBy", {
                days: Math.abs(record.reviewDueInDays ?? 0),
              })
            : t("magazine:lifecycle.row.dueIn", {
                days: record.reviewDueInDays ?? 0,
              })
          : t("magazine:lifecycle.row.noReview")}
      </span>

      {record.pieceId && (onEdit || onLanguages) && (
        <span className={styles.rowActions}>
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(record)}
              aria-label={t("magazine:lifecycle.row.editAria", {
                title: record.title,
              })}
            >
              <FiEdit3 aria-hidden /> {t("magazine:lifecycle.row.edit")}
            </Button>
          )}
          {onLanguages && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLanguages(record)}
              aria-label={t("magazine:lifecycle.row.languagesAria", {
                title: record.title,
              })}
            >
              <FiGlobe aria-hidden /> {t("magazine:lifecycle.row.languages")}
            </Button>
          )}
        </span>
      )}
    </li>
  );
}

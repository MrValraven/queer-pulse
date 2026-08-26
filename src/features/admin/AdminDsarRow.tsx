import { AdminChip } from "./ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import {
  DSAR_ARTICLE_KEY,
  DSAR_STATUS_TONE,
  dsarClockView,
  shortDate,
} from "./adminDsarClock";
import type { AdminDsarRequestDTO } from "./api/adminDsar.api";
import styles from "./AdminDsarPage.module.css";

/**
 * One request in the queue. The whole row is the control that opens the detail
 * pane, so it is a real `<button>` with an accessible name naming the request
 * by its reference, never a clickable `<div>`.
 *
 * The statutory clock is deliberately rendered three ways at once: the left
 * edge tone, the countdown chip's own wording, and the "due {date}" line. An
 * overdue request has to be unmissable to a reviewer scanning fifty rows, and
 * colour alone would carry that meaning for nobody who cannot see it.
 */
export function AdminDsarRow({
  request,
  onOpen,
}: {
  request: AdminDsarRequestDTO;
  onOpen: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const clock = dsarClockView(request);
  const memberName = request.member?.name ?? t("admin:adminDsar.unknownMember");
  const rowClassName = [
    styles.row,
    request.isOverdue
      ? styles.rowOverdue
      : clock.copyKey === "urgent" || clock.copyKey === "dueToday"
        ? styles.rowUrgent
        : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={rowClassName}
      onClick={onOpen}
      aria-label={t("admin:adminDsar.row.openAriaLabel", {
        reference: request.reference,
      })}
    >
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <span className={styles.reference}>{request.reference}</span>
          <AdminChip tone="plum" dot>
            {t(`admin:adminDsar.article.${DSAR_ARTICLE_KEY[request.article]}`)}
          </AdminChip>
        </div>
        <div className={styles.rowMeta}>
          {t("admin:adminDsar.row.filedBy", { name: memberName })}
        </div>
        <p className={styles.rowDetails}>{request.details}</p>
        <div className={styles.rowDates}>
          {t("admin:adminDsar.row.dueBy", {
            date: shortDate(fmt, request.dueBy),
          })}
        </div>
      </div>
      <div className={styles.rowSide}>
        <AdminChip tone={clock.tone} dot>
          {t(`admin:adminDsar.clock.${clock.copyKey}`, { days: clock.days })}
        </AdminChip>
        <AdminChip tone={DSAR_STATUS_TONE[request.status]}>
          {t(`admin:adminDsar.status.${request.status}`)}
        </AdminChip>
      </div>
    </button>
  );
}

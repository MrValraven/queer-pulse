import type { ReactNode } from "react";
import { AdminChip, AdminDrawer } from "./ui";
import { AdminDsarOutcomeForm } from "./AdminDsarOutcomeForm";
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

/** One labelled read-out in the drawer body. */
function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailLabel}>{label}</span>
      <div className={styles.detailValue}>{children}</div>
    </div>
  );
}

/**
 * The full read-out for one data-subject request, opened from a queue row.
 * The list hook already returns the whole {@link AdminDsarRequestDTO}, so this
 * renders without a second fetch and without a demo/live branch of its own.
 *
 * The body stays a read-out; the single action lives in the footer
 * ({@link AdminDsarOutcomeForm}), which owns the outcome note and the mutation.
 */
export function AdminDsarDrawer({
  request,
  onClose,
  onUpdated,
}: {
  request: AdminDsarRequestDTO;
  onClose: () => void;
  onUpdated: (updated: AdminDsarRequestDTO) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const clock = dsarClockView(request);

  return (
    <AdminDrawer
      label={t("admin:adminDsar.drawer.label", {
        reference: request.reference,
      })}
      onClose={onClose}
      head={
        <div className={styles.drawerHead}>
          <span className={styles.reference}>{request.reference}</span>
          <div className={styles.drawerChips}>
            <AdminChip tone="plum" dot>
              {t(
                `admin:adminDsar.article.${DSAR_ARTICLE_KEY[request.article]}`,
              )}
            </AdminChip>
            <AdminChip tone={DSAR_STATUS_TONE[request.status]}>
              {t(`admin:adminDsar.status.${request.status}`)}
            </AdminChip>
            <AdminChip tone={clock.tone} dot>
              {t(`admin:adminDsar.clock.${clock.copyKey}`, {
                days: clock.days,
              })}
            </AdminChip>
          </div>
        </div>
      }
      foot={<AdminDsarOutcomeForm request={request} onUpdated={onUpdated} />}
    >
      <DetailRow label={t("admin:adminDsar.drawer.member")}>
        {request.member?.name ?? t("admin:adminDsar.unknownMember")}
      </DetailRow>
      <DetailRow label={t("admin:adminDsar.drawer.asked")}>
        {request.details}
      </DetailRow>
      {request.scopes.length > 0 && (
        <DetailRow label={t("admin:adminDsar.drawer.scopes")}>
          <div className={styles.scopeRow}>
            {request.scopes.map((scope) => (
              <AdminChip key={scope} tone="ghost">
                {scope}
              </AdminChip>
            ))}
          </div>
        </DetailRow>
      )}
      <DetailRow label={t("admin:adminDsar.drawer.filed")}>
        {shortDate(fmt, request.submittedAt)}
      </DetailRow>
      <DetailRow label={t("admin:adminDsar.drawer.due")}>
        {shortDate(fmt, request.dueBy)}
      </DetailRow>
      {request.respondedAt && (
        <DetailRow label={t("admin:adminDsar.drawer.answered")}>
          {shortDate(fmt, request.respondedAt)}
        </DetailRow>
      )}
      {request.context && (
        <DetailRow label={t("admin:adminDsar.drawer.context")}>
          {request.context}
        </DetailRow>
      )}
      {request.outcomeNote && (
        <DetailRow label={t("admin:adminDsar.drawer.outcome")}>
          {request.outcomeNote}
        </DetailRow>
      )}
    </AdminDrawer>
  );
}

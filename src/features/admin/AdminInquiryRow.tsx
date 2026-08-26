import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat, type Formatters } from "../../shared/i18n/format";
import { AdminChip } from "./ui";
import { AdminWaitingChip } from "./AdminSubmissionQueue";
import { ADMIN_SUBMISSION_STATUS_TONE } from "./adminSubmissionMeta";
import type { AdminInquiryDTO } from "./api/adminInquiries.api";
import styles from "./AdminSubmissionList.module.css";

function shortDate(fmt: Formatters, iso: string): string {
  return fmt.date(new Date(iso), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * One message from `/about/contact` — the escape hatch the sign-in page, the
 * under-18 notice and the request-invite confirmation all point at, so the
 * person behind a row here is usually somebody already stuck.
 *
 * "Handled" is a note to the rest of the staff that a human has read it and
 * answered from their own inbox. Nothing on this row sends anything: QueerPulse
 * has no email delivery, and the address is here to be copied, not messaged
 * from the console.
 */
export function AdminInquiryRow({
  inquiry,
  onSetStatus,
  pending,
}: {
  inquiry: AdminInquiryDTO;
  onSetStatus: (status: "new" | "handled") => void;
  pending: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const isWaiting = inquiry.status === "new";

  return (
    <div className={styles.row}>
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <span className={styles.rowName}>{inquiry.name}</span>
          <AdminChip tone={inquiry.kind === "partner" ? "violet" : "plum"}>
            {t(`admin:adminIntakes.inquiryKind.${inquiry.kind}`)}
          </AdminChip>
          <AdminChip
            tone={ADMIN_SUBMISSION_STATUS_TONE[inquiry.status] ?? "plum"}
            dot
          >
            {t(`admin:adminIntakes.inquiryStatus.${inquiry.status}`)}
          </AdminChip>
          {isWaiting && <AdminWaitingChip since={inquiry.createdAt} />}
        </div>

        <div className={styles.rowMeta}>
          {t("admin:adminIntakes.row.contactEmail", { email: inquiry.email })}
        </div>
        {inquiry.orgName && (
          <div className={styles.rowMeta}>
            {t("admin:adminIntakes.row.org", { org: inquiry.orgName })}
          </div>
        )}
        {inquiry.subject && (
          <div className={styles.rowSubject}>{inquiry.subject}</div>
        )}
        <p className={styles.rowNote}>{inquiry.body}</p>

        <div className={styles.rowDates}>
          {t("admin:adminIntakes.row.arrived", {
            date: shortDate(fmt, inquiry.createdAt),
          })}
        </div>
        {inquiry.handledAt && (
          <div className={styles.rowDates}>
            {inquiry.handledBy
              ? t("admin:adminIntakes.row.handledBy", {
                  date: shortDate(fmt, inquiry.handledAt),
                  name: inquiry.handledBy.name,
                })
              : t("admin:adminIntakes.row.handledNoOne", {
                  date: shortDate(fmt, inquiry.handledAt),
                })}
          </div>
        )}
      </div>

      <div className={styles.rowActions}>
        <div className={styles.rowActionButtons}>
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => onSetStatus(isWaiting ? "handled" : "new")}
          >
            {isWaiting
              ? t("admin:adminIntakes.action.markHandled")
              : t("admin:adminIntakes.action.reopen")}
          </Button>
        </div>
      </div>
    </div>
  );
}

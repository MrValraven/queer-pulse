import { LoadErrorState, SkeletonLine } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { AMBASSADOR_FOCUS_LABEL_KEY } from "../../../shared/ambassadors/ambassadorFocusAreas.data";
import { AdminChip, AdminDrawer } from "../ui";
import type { AdminAmbassadorDTO } from "./adminAmbassadors.api";
import { useAdminAmbassadorHistory } from "./useAdminAmbassadors";
import styles from "./AdminAmbassadorsPage.module.css";

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
};

/** One grant in the member's record: when, by whom and why it started, and
 *  the same for its revoke once there is one. */
function HistoryEntry({ grant }: { grant: AdminAmbassadorDTO }) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const formatWhen = (iso: string) =>
    formatters.date(new Date(iso), DATE_OPTIONS);
  const unknownStaff = t("admin:ambassadors.row.unknownStaff");

  return (
    <li className={styles.historyEntry}>
      <div className={styles.rowChips}>
        <AdminChip tone="coral">
          {t(AMBASSADOR_FOCUS_LABEL_KEY[grant.focusArea])}
        </AdminChip>
        <AdminChip tone={grant.revokedAt ? "ghost" : "jade"}>
          {grant.revokedAt
            ? t("admin:ambassadors.history.revoked")
            : t("admin:ambassadors.history.active")}
        </AdminChip>
      </div>
      <dl className={styles.facts}>
        <div className={styles.fact}>
          <dt>
            {grant.revokedAt
              ? t("admin:ambassadors.history.grantedOn")
              : t("admin:ambassadors.row.since")}
          </dt>
          <dd>{formatWhen(grant.grantedAt)}</dd>
        </div>
        <div className={styles.fact}>
          <dt>{t("admin:ambassadors.row.grantedBy")}</dt>
          <dd>{grant.grantedBy?.name ?? unknownStaff}</dd>
        </div>
        <div className={`${styles.fact} ${styles.factWide}`}>
          <dt>{t("admin:ambassadors.row.grantReason")}</dt>
          <dd>{grant.grantReason}</dd>
        </div>
        {grant.revokedAt && (
          <>
            <div className={styles.fact}>
              <dt>{t("admin:ambassadors.row.revokedOn")}</dt>
              <dd>{formatWhen(grant.revokedAt)}</dd>
            </div>
            <div className={styles.fact}>
              <dt>{t("admin:ambassadors.row.revokedBy")}</dt>
              <dd>{grant.revokedBy?.name ?? unknownStaff}</dd>
            </div>
            <div className={`${styles.fact} ${styles.factWide}`}>
              <dt>{t("admin:ambassadors.row.revokeReason")}</dt>
              <dd>{grant.revokeReason}</dd>
            </div>
          </>
        )}
      </dl>
    </li>
  );
}

/**
 * Every grant one member has held, active and revoked, newest first, read
 * from `GET /admin/ambassadors/history?userId=`. Opened from a row's History
 * button; the page mounts it only while open, as `AdminDrawer` expects.
 */
export function AdminAmbassadorHistoryDrawer({
  member,
  onClose,
}: {
  member: AdminAmbassadorDTO["member"];
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const name = `${member.firstName} ${member.lastName}`.trim();
  const {
    data: grants = [],
    isLoading,
    isError,
    refetch,
  } = useAdminAmbassadorHistory(member.userId);

  return (
    <AdminDrawer
      label={t("admin:ambassadors.history.label", { name })}
      onClose={onClose}
      head={
        <div className={styles.historyHead}>
          <span className={styles.focusCaption}>
            {t("admin:ambassadors.history.title")}
          </span>
          <h2 className={styles.historyTitle}>{name}</h2>
          <span className={styles.rowSlug}>@{member.slug}</span>
        </div>
      }
    >
      {isLoading ? (
        <SkeletonLine height={132} />
      ) : isError ? (
        <LoadErrorState
          compact
          description={t("admin:ambassadors.history.error")}
          onRetry={() => void refetch()}
        />
      ) : grants.length === 0 ? (
        <p className={styles.emptyLine}>
          {t("admin:ambassadors.history.empty")}
        </p>
      ) : (
        <ol className={styles.historyList}>
          {grants.map((grant) => (
            <HistoryEntry key={grant.id} grant={grant} />
          ))}
        </ol>
      )}
    </AdminDrawer>
  );
}

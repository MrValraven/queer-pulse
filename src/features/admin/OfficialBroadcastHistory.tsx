import { SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDate } from "../../shared/lib/date";
import {
  AdminChip,
  AdminEmptyState,
  AdminNotice,
  AdminPanel,
  adminTableClasses,
  type AdminTone,
} from "./ui";
import type {
  OfficialBroadcastDTO,
  OfficialBroadcastStatusDTO,
} from "./api/adminOfficialMessages.api";
import { useOfficialBroadcasts } from "./api/useAdminOfficialMessages";
import styles from "./AdminOfficialMessagesPage.module.css";

const STATUS_TONE: Record<OfficialBroadcastStatusDTO, AdminTone> = {
  pending: "ghost",
  sending: "amber",
  completed: "jade",
  failed: "danger",
};

const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

/** The newest 50 broadcasts, each with its status and delivery progress. */
export function OfficialBroadcastHistory() {
  const { t } = useTranslation();
  const { data: broadcasts, isLoading, isError } = useOfficialBroadcasts();

  return (
    <AdminPanel
      title={t("admin:officialMessages.history.title")}
      titleId="official-broadcast-history-title"
      padding="flush"
    >
      {isLoading ? (
        <div className={styles.historyInset}>
          <SkeletonLine />
          <SkeletonLine />
        </div>
      ) : isError ? (
        <div className={styles.historyInset}>
          <AdminNotice tone="error">
            {t("admin:officialMessages.history.loadFailed")}
          </AdminNotice>
        </div>
      ) : !broadcasts || broadcasts.length === 0 ? (
        <div className={styles.historyInset}>
          <AdminEmptyState
            size="inline"
            title={t("admin:officialMessages.history.empty")}
          />
        </div>
      ) : (
        <ul className={styles.historyList}>
          {broadcasts.map((broadcast) => (
            <OfficialBroadcastRow key={broadcast.id} broadcast={broadcast} />
          ))}
        </ul>
      )}
    </AdminPanel>
  );
}

function OfficialBroadcastRow({
  broadcast,
}: {
  broadcast: OfficialBroadcastDTO;
}) {
  const { t, language } = useTranslation();
  return (
    <li className={[adminTableClasses.row, styles.historyRow].join(" ")}>
      <p className={styles.historyBody}>{broadcast.body}</p>
      <div className={styles.historyMeta}>
        <AdminChip tone={STATUS_TONE[broadcast.status]} dot>
          {t(`admin:officialMessages.status.${broadcast.status}`)}
        </AdminChip>
        <span>
          {t("admin:officialMessages.history.progress", {
            delivered: broadcast.deliveredCount,
            total: broadcast.recipientCount,
          })}
        </span>
        <span>
          {formatDate(broadcast.createdAt, language, DATE_TIME_OPTIONS)}
        </span>
        <span>
          {broadcast.actorName
            ? t("admin:officialMessages.history.sentBy", {
                name: broadcast.actorName,
              })
            : t("admin:officialMessages.history.sentByErased")}
        </span>
      </div>
    </li>
  );
}

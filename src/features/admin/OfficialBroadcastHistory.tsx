import { SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { formatDate } from "../../shared/lib/date";
import { AdminChip, type AdminTone } from "./ui";
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
    <section
      className={styles.history}
      aria-labelledby="official-broadcast-history-title"
    >
      <h2 id="official-broadcast-history-title" className={styles.panelTitle}>
        {t("admin:officialMessages.history.title")}
      </h2>
      {isLoading ? (
        <div className={styles.historyList}>
          <SkeletonLine />
          <SkeletonLine />
        </div>
      ) : isError ? (
        <p className={styles.historyEmpty} role="alert">
          {t("admin:officialMessages.history.loadFailed")}
        </p>
      ) : !broadcasts || broadcasts.length === 0 ? (
        <p className={styles.historyEmpty}>
          {t("admin:officialMessages.history.empty")}
        </p>
      ) : (
        <ul className={styles.historyList}>
          {broadcasts.map((broadcast) => (
            <OfficialBroadcastRow key={broadcast.id} broadcast={broadcast} />
          ))}
        </ul>
      )}
    </section>
  );
}

function OfficialBroadcastRow({
  broadcast,
}: {
  broadcast: OfficialBroadcastDTO;
}) {
  const { t, language } = useTranslation();
  return (
    <li className={styles.historyRow}>
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

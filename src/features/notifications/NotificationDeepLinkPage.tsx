import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../../shared/components/layout";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import {
  ConnectionCard,
  GatheringCard,
  ReplyCard,
  MentionCard,
  ModerationCard,
} from "./NotificationDeepLinkCards";
import {
  NOTIF_TYPES,
  buildSummaries,
  type NotifType,
} from "./notificationDeepLink.data";
import styles from "./NotificationDeepLinkPage.module.css";

const cardFor: Record<NotifType, ReactNode> = {
  connection: <ConnectionCard />,
  gathering: <GatheringCard />,
  reply: <ReplyCard />,
  mention: <MentionCard />,
  moderation: <ModerationCard />,
};

export function NotificationDeepLinkPage() {
  const { t } = useTranslation();
  const [type, setType] = useState<NotifType>("connection");
  const summaries = useMemo(() => buildSummaries(t), [t]);

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.strip}>
          <Link to={routes.notifications} className={styles.stripBack}>
            {t("notifications:deepLink.back")}
          </Link>
          <div className={styles.stripSep} />
          <div className={styles.stripSummary}>{summaries[type]}</div>
        </div>

        <div className={styles.typeBar}>
          {NOTIF_TYPES.map((notifType) => (
            <button
              type="button"
              key={notifType.id}
              className={`${styles.typeBtn} ${type === notifType.id ? styles.active : ""}`}
              onClick={() => setType(notifType.id)}
            >
              {t(notifType.labelKey)}
            </button>
          ))}
        </div>

        <div className={styles.contentArea}>{cardFor[type]}</div>
      </div>
    </AppShell>
  );
}

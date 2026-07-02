import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "../../shared/components/layout";
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
  SUMMARIES,
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
  const [type, setType] = useState<NotifType>("connection");

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.strip}>
          <Link to={routes.notifications} className={styles.stripBack}>
            ← Notifications
          </Link>
          <div className={styles.stripSep} />
          <div className={styles.stripSummary}>{SUMMARIES[type]}</div>
        </div>

        <div className={styles.typeBar}>
          {NOTIF_TYPES.map((t) => (
            <button
              type="button"
              key={t.id}
              className={`${styles.typeBtn} ${type === t.id ? styles.active : ""}`}
              onClick={() => setType(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className={styles.contentArea}>{cardFor[type]}</div>
      </div>
    </AppShell>
  );
}

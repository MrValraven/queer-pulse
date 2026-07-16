import { useTranslation } from "../../shared/i18n/useTranslation";
import type { App } from "./dating.data";
import styles from "./DatingPage.module.css";

export function DatingAppCard({ app }: { app: App }) {
  const { t } = useTranslation();
  return (
    <div className={styles.appCard}>
      <div className={styles.appTop}>
        <div
          className={styles.appIcon}
          style={{ background: app.iconBg, color: app.iconColor }}
        >
          {app.icon}
        </div>
        <div>
          <div className={styles.appName}>{app.name}</div>
          <div className={styles.appFor}>{t(app.audienceKey)}</div>
        </div>
      </div>
      <p className={styles.appBody}>{t(app.bodyKey)}</p>
      <div className={styles.appTags}>
        {app.tagKeys.map((tagKey) => (
          <span key={tagKey} className={styles.appTag}>
            {t(tagKey)}
          </span>
        ))}
      </div>
      <p className={styles.appCommunity}>{t(app.quoteKey)}</p>
    </div>
  );
}

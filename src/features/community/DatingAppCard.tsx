import type { App } from "./dating.data";
import styles from "./DatingPage.module.css";

export function DatingAppCard({ app }: { app: App }) {
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
          <div className={styles.appFor}>{app.audience}</div>
        </div>
      </div>
      <p className={styles.appBody}>{app.body}</p>
      <div className={styles.appTags}>
        {app.tags.map((t) => (
          <span key={t} className={styles.appTag}>
            {t}
          </span>
        ))}
      </div>
      <p className={styles.appCommunity}>{app.quote}</p>
    </div>
  );
}

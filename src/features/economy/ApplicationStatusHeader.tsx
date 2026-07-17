import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Cat } from "./applicationStatus.data";
import styles from "./ApplicationStatusPage.module.css";

export function ApplicationStatusHeader({
  activeCount,
  sentCount,
}: {
  activeCount: number;
  sentCount: number;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.head}>
      <div>
        <div className={styles.eyebrow}>
          {t("economy:applicationStatus.header.eyebrow")}
        </div>
        <h1 className={styles.h1}>
          <Translation
            i18nKey="economy:applicationStatus.header.title"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.sub}>
          {t("economy:applicationStatus.header.sub")}
        </p>
      </div>
      <div>
        <div className={styles.counter}>
          <em>{activeCount}</em>{" "}
          <span className={styles.counterSent}>
            {t("economy:applicationStatus.header.counterSent", {
              count: sentCount,
            })}
          </span>
        </div>
        <div className={styles.counterL}>
          {t("economy:applicationStatus.header.activeLabel")}
        </div>
      </div>
    </div>
  );
}

export function ApplicationStatusTabs({
  tabs,
  tab,
  setTab,
}: {
  tabs: { id: Cat | "all"; labelKey: string; count: number }[];
  tab: Cat | "all";
  setTab: (t: Cat | "all") => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.tabs}>
      {tabs.map((tabItem) => (
        <button
          key={tabItem.id}
          type="button"
          className={[styles.tab, tab === tabItem.id && styles.tabActive]
            .filter(Boolean)
            .join(" ")}
          onClick={() => setTab(tabItem.id)}
        >
          {t(tabItem.labelKey)}{" "}
          <span className={styles.tabCount}>{tabItem.count}</span>
        </button>
      ))}
    </div>
  );
}

export function ApplicationStatusLegend() {
  const { t } = useTranslation();
  return (
    <div className={styles.legend}>
      <span className={styles.legendLabel}>
        {t("economy:applicationStatus.legend.key")}
      </span>
      <span className={styles.legendItem}>
        <span className={`${styles.legendDot} ${styles.legendDone}`} />{" "}
        {t("economy:applicationStatus.legend.done")}
      </span>
      <span className={styles.legendItem}>
        <span className={`${styles.legendDot} ${styles.legendActive}`} />{" "}
        {t("economy:applicationStatus.legend.active")}
      </span>
      <span className={styles.legendItem}>
        <span className={`${styles.legendDot} ${styles.legendUpcoming}`} />{" "}
        {t("economy:applicationStatus.legend.upcoming")}
      </span>
      <span className={styles.legendItem}>
        <span className={`${styles.legendDot} ${styles.legendClosed}`} />{" "}
        {t("economy:applicationStatus.legend.closed")}
      </span>
    </div>
  );
}

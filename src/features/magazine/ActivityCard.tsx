import { useTranslation } from "../../shared/i18n/useTranslation";
import { ACTIVITY } from "./editorDashboard.data";
import { cx } from "../../shared/lib/cx";
import { SideCard } from "./SideCard";
import styles from "./EditorDashboardPage.module.css";

/** Recent editorial activity feed. */
export function ActivityCard() {
  const { t } = useTranslation();
  const dotClass = {
    coral: styles.tCoral,
    jade: styles.tJade,
    plum: styles.tPlum,
  };
  return (
    <SideCard title={t("magazine:editor.sideCards.recentActivity")}>
      {ACTIVITY.map((item, index) => (
        <div key={index} className={styles.actRow}>
          <span className={cx(styles.actDot, dotClass[item.tint])} />
          <div>
            <span className={styles.actTxt}>
              <b>{item.who}</b> {item.act} <i>{item.obj}</i>
            </span>
            <span className={styles.actWhen}>{item.when}</span>
          </div>
        </div>
      ))}
    </SideCard>
  );
}

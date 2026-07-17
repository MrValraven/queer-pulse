import { FiCheck } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { GROUPS } from "./readingGroups.data";
import styles from "./ReadingGroupsPage.module.css";

/**
 * Plum success panel listing the reading groups the member has joined the
 * waitlist for, with their position. Real local state lives in the parent.
 */
export function WaitlistPanel({
  waitlist,
}: {
  waitlist: Record<string, number>;
}) {
  const { t } = useTranslation();
  if (Object.keys(waitlist).length === 0) return null;

  return (
    <div className={styles.waitlistPanel}>
      <div className={styles.wpHead}>
        <FiCheck aria-hidden />
        <h3>
          <Translation
            i18nKey="community:readingGroups.waitlist.heading"
            components={{ em: <em /> }}
          />
        </h3>
      </div>
      <p className={styles.wpSub}>
        {t("community:readingGroups.waitlist.sub")}
      </p>
      <ul className={styles.wpList}>
        {Object.entries(waitlist).map(([id, position]) => {
          const group = GROUPS.find((g) => g.id === id);
          if (!group) return null;
          return (
            <li key={id} className={styles.wpRow}>
              <span className={styles.wpName}>{group.name}</span>
              <span className={styles.wpPos}>
                {t("community:readingGroups.waitlist.position", { position })}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

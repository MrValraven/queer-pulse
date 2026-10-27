import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { AudiencePoint } from "./audiences.data";
import styles from "./AudiencePointGrid.module.css";

/** A grid of short points, each an icon, a `<h3>` and a sentence. The CSS
 *  picks the columns from `data-count`, so no row ends on a lone card. */
export function AudiencePointGrid({
  points,
}: {
  points: readonly AudiencePoint[];
}) {
  const { t } = useTranslation();
  return (
    <ul className={styles.grid} data-count={points.length}>
      {points.map(({ pointId, titleKey, bodyKey, Icon }) => (
        <li key={pointId} className={styles.point}>
          <span className={styles.icon}>
            <Icon aria-hidden />
          </span>
          <h3 className={styles.title}>{t(titleKey)}</h3>
          <p className={styles.body}>{t(bodyKey)}</p>
        </li>
      ))}
    </ul>
  );
}

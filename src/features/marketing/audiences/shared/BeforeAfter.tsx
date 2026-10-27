import type { ReactNode } from "react";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { AudienceListItem } from "./audiences.data";
import styles from "./BeforeAfter.module.css";

function ItemList({ items }: { items: readonly AudienceListItem[] }) {
  const { t } = useTranslation();
  return (
    <ul className={styles.list}>
      {items.map(({ itemId, labelKey, Icon }) => (
        <li key={itemId} className={styles.item}>
          <Icon aria-hidden className={styles.itemIcon} />
          <span>{t(labelKey)}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The "All in one place" comparison: the tools an audience juggles today on
 * one side, what QueerPulse puts in their place on the other, with an
 * optional visual under the second list.
 */
export function BeforeAfter({
  beforeItems,
  afterItems,
  afterVisual,
}: {
  beforeItems: readonly AudienceListItem[];
  afterItems: readonly AudienceListItem[];
  afterVisual?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.columns}>
      <div className={styles.before}>
        <h3 className={styles.heading}>{t("audiences:beforeAfter.before")}</h3>
        <ItemList items={beforeItems} />
      </div>
      <div className={styles.after}>
        <h3 className={styles.heading}>{t("audiences:beforeAfter.after")}</h3>
        <ItemList items={afterItems} />
        {afterVisual && <div className={styles.visual}>{afterVisual}</div>}
      </div>
    </div>
  );
}

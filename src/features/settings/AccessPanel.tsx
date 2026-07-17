import { useMemo } from "react";
import { buildAccessItems } from "./membership.data";
import { CheckIcon } from "./MembershipIcons";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import styles from "./MembershipPage.module.css";

export function AccessPanel() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const accessItems = useMemo(() => buildAccessItems(t, fmt), [t, fmt]);

  return (
    <div className={styles.panel}>
      <p className={styles.accessLead}>
        {t("settings:membership.access.lead")}
      </p>
      <div className={styles.acList}>
        {accessItems.map((item) => (
          <div key={item.id} className={styles.acItem}>
            <div className={styles.acIc}>
              <CheckIcon />
            </div>
            <span className={styles.acLabel}>{item.label}</span>
            <span className={styles.acNote}>{item.note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

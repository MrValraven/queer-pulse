import { FiCheck } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { resolvePresetRules } from "./startCommunity.data";
import styles from "./QuickStartCommunity.module.css";

/** The shared values the community opens with, shown to read before anyone joins. */
export function QuickStartSharedValues({ rules }: { rules: string[] }) {
  const { t } = useTranslation();
  const valueTexts = resolvePresetRules(rules, t);
  return (
    <section className={styles.values}>
      <h2 id="quick-start-values-heading" className={styles.groupLabel}>
        {t("communities:start.quick.values.heading")}
      </h2>
      <ul
        className={styles.valuesList}
        aria-labelledby="quick-start-values-heading"
      >
        {valueTexts.map((valueText, valueIndex) => (
          <li key={rules[valueIndex] ?? valueText} className={styles.valueItem}>
            <FiCheck size={14} aria-hidden className={styles.valueIcon} />
            <span>{valueText}</span>
          </li>
        ))}
      </ul>
      <p className={styles.valuesNote}>
        {t("communities:start.quick.values.editLater")}
      </p>
    </section>
  );
}

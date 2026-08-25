import { SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { usePressKitFacts } from "./api/useAdminPressKit";
import styles from "./AdminPressKitPage.module.css";

/**
 * Read-only preview of the auto-derived headline `facts` the public press kit
 * shows (`GET /press-kit`). Admins can't edit these here — the numbers are
 * computed from platform data — but seeing them next to the editable coverage
 * and team lists keeps the whole kit legible from one screen.
 *
 * Each fact's `key` resolves to a human label via `marketing:pressKit.facts.
 * <key>`; when no such key exists (a number the marketing catalog hasn't named
 * yet), the raw `key` is shown rather than a bare translation code.
 */
export function AdminPressFactsPanel() {
  const { t } = useTranslation();
  const { facts, isLoading } = usePressKitFacts();

  return (
    <aside
      className={styles.factsPanel}
      aria-label={t("admin:pressKit.facts.title")}
    >
      <h2 className={styles.factsTitle}>{t("admin:pressKit.facts.title")}</h2>
      <p className={styles.factsSub}>{t("admin:pressKit.facts.sub")}</p>

      {isLoading ? (
        <div className={styles.factsList}>
          <SkeletonLine height={44} style={{ borderRadius: 12 }} />
          <SkeletonLine height={44} style={{ borderRadius: 12 }} />
          <SkeletonLine height={44} style={{ borderRadius: 12 }} />
        </div>
      ) : facts.length === 0 ? (
        <p className={styles.factsEmpty}>{t("admin:pressKit.facts.empty")}</p>
      ) : (
        <dl className={styles.factsList}>
          {facts.map((fact) => {
            const labelKey = `marketing:pressKit.facts.${fact.key}`;
            const resolved = t(labelKey);
            const label = resolved === labelKey ? fact.key : resolved;
            return (
              <div key={fact.key} className={styles.factRow}>
                <dt className={styles.factLabel}>{label}</dt>
                <dd className={styles.factValue}>{fact.value}</dd>
              </div>
            );
          })}
        </dl>
      )}
    </aside>
  );
}

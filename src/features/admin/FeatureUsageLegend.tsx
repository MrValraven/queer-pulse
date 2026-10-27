import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminChip } from "./ui";
import { STATE_CATALOG_SUFFIX, STATE_TONE } from "./featureUsageLabels";
import type { FeatureUsageState } from "./api/adminFeatureUsage.api";
import styles from "./AdminFeatureUsagePage.module.css";

const LEGEND_STATES: FeatureUsageState[] = [
  "browsed-but-empty",
  "busy",
  "quiet",
  "not-launched",
];

export function FeatureUsageStateBadge({
  state,
}: {
  state: FeatureUsageState;
}) {
  const { t } = useTranslation();
  const suffix = STATE_CATALOG_SUFFIX[state];
  return (
    <AdminChip tone={STATE_TONE[state]}>
      {t(`admin:featureUsage.state.${suffix}.label`)}
    </AdminChip>
  );
}

/** The four state cards above the table. `browsed-but-empty` leads the row
 *  and carries the accent treatment (`legendCard_browsedButEmpty`) so it
 *  reads as the panel's headline finding, the primary signal among four states. */
export function FeatureUsageLegend() {
  const { t } = useTranslation();

  return (
    <div className={styles.legend}>
      {LEGEND_STATES.map((state) => {
        const suffix = STATE_CATALOG_SUFFIX[state];
        return (
          <div
            key={state}
            className={[
              styles.legendCard,
              state === "browsed-but-empty" &&
                styles.legendCard_browsedButEmpty,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <FeatureUsageStateBadge state={state} />
            <p className={styles.legendExplainer}>
              {t(`admin:featureUsage.state.${suffix}.explainer`)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

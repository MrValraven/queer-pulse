import { useId, useState } from "react";
import { FiInfo } from "react-icons/fi";
import { Tooltip } from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FeatureUsageRow } from "./FeatureUsageRow";
import {
  formatDayRange,
  type FeatureUsageRangeSelection,
  type FeatureUsageWindow,
} from "./featureUsageRange";
import type {
  AdminFeatureUsageDTO,
  ClassifiedFeature,
} from "./api/adminFeatureUsage.api";
import styles from "./AdminFeatureUsagePage.module.css";

/** The Reach column header: its label, an info button whose tooltip says
 *  what reach measures, and a quiet subline naming the earlier days every
 *  row's comparison is measured against, so the rows themselves carry no
 *  dates. The bubble portals (`floating-top`) because the scrolling table
 *  wrapper clips anything drawn inside it, and it is decorative, so the same
 *  text also reaches the button through a visually hidden description. */
function FeatureUsageReachHeader({
  usageWindow,
}: {
  usageWindow: FeatureUsageWindow;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const reachInfoId = useId();
  const reachInfo = t("admin:featureUsage.column.reachInfo");
  const previousDates = formatDayRange(
    usageWindow.previousRangeStart,
    usageWindow.previousRangeEnd,
    fmt,
    t,
  );

  return (
    <span className={styles.reachHeaderStack}>
      <span className={styles.reachHeader}>
        {t("admin:featureUsage.column.reach")}
        <Tooltip placement="floating-top" label={reachInfo}>
          <button
            type="button"
            className={styles.reachInfoBtn}
            aria-label={t("admin:featureUsage.column.reachInfoLabel")}
            aria-describedby={reachInfoId}
          >
            <FiInfo aria-hidden />
          </button>
        </Tooltip>
        <span id={reachInfoId} className={styles.srOnly}>
          {reachInfo}
        </span>
      </span>
      <span className={styles.reachHeaderVs}>
        {t("admin:featureUsage.column.reachVs", { dates: previousDates })}
      </span>
    </span>
  );
}

/**
 * The feature table. It owns which rows are open, so a range change (which
 * keeps this table mounted while the new range loads) leaves the open rows
 * open. While `isStale` the previous range is still on screen, so the table
 * dims and reports itself busy until the new numbers land.
 */
export function FeatureUsageTable({
  features,
  usageWindow,
  reachMedian,
  hasReachSignal,
  selection,
  drillDowns,
  isStale,
}: {
  features: ClassifiedFeature[];
  usageWindow: FeatureUsageWindow;
  reachMedian: number;
  hasReachSignal: boolean;
  selection: FeatureUsageRangeSelection;
  drillDowns: AdminFeatureUsageDTO["drillDowns"];
  isStale: boolean;
}) {
  const { t } = useTranslation();
  const [expandedFeatureKeys, setExpandedFeatureKeys] = useState<Set<string>>(
    () => new Set(),
  );

  const toggleExpanded = (featureKey: string) => {
    setExpandedFeatureKeys((previous) => {
      const next = new Set(previous);
      if (next.has(featureKey)) next.delete(featureKey);
      else next.add(featureKey);
      return next;
    });
  };

  return (
    <div
      className={[styles.tableWrap, isStale && styles.tableWrapStale]
        .filter(Boolean)
        .join(" ")}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- the table scrolls horizontally, so the wrapper is deliberately focusable: without it a keyboard-only user cannot scroll to the reach and depth columns at all. Same justification as DeckViewer.tsx and MessageBubble.tsx.
      tabIndex={0}
      role="region"
      aria-label={t("admin:featureUsage.table.caption")}
      aria-busy={isStale}
    >
      <table className={styles.table}>
        <caption className={styles.srOnly}>
          {t("admin:featureUsage.table.caption")}
        </caption>
        <thead>
          <tr>
            <th scope="col" className={styles.fitColumn}>
              {t("admin:featureUsage.column.feature")}
            </th>
            <th
              scope="col"
              className={`${styles.fitColumn} ${styles.stateCell}`}
            >
              <span className={styles.stateCellContent}>
                {t("admin:featureUsage.column.state")}
              </span>
            </th>
            <th scope="col" className={styles.reachColumn}>
              <FeatureUsageReachHeader usageWindow={usageWindow} />
            </th>
            <th scope="col" className={styles.numberCell}>
              {t("admin:featureUsage.column.created")}
            </th>
            <th scope="col" className={styles.numberCell}>
              {t("admin:featureUsage.column.total")}
            </th>
            <th scope="col" className={styles.srOnly}>
              {t("admin:featureUsage.column.details")}
            </th>
          </tr>
        </thead>
        <tbody>
          {features.length === 0 ? (
            <tr>
              <td colSpan={6} className={styles.emptyCell}>
                {t("admin:featureUsage.empty")}
              </td>
            </tr>
          ) : (
            features.map((feature) => (
              <FeatureUsageRow
                key={feature.featureKey}
                feature={feature}
                usageWindow={usageWindow}
                reachMedian={reachMedian}
                hasReachSignal={hasReachSignal}
                selection={selection}
                drillDowns={drillDowns}
                isExpanded={expandedFeatureKeys.has(feature.featureKey)}
                onToggleExpand={toggleExpanded}
                isStale={isStale}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

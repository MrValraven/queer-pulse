import { useState } from "react";
import type { IconType } from "react-icons";
import {
  FiActivity,
  FiAlertTriangle,
  FiInfo,
  FiMoon,
  FiToggleLeft,
} from "react-icons/fi";
import { Collapse, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { AdminPageHeader } from "./ui";
import { AdminStatGrid } from "./AdminStatGrid";
import type { StatCard } from "./adminDashboard.data";
import { useAdminFeatureUsage } from "./api/useAdminFeatureUsage";
import { featureUsageErrorKey } from "./api/featureUsageErrorCode";
import type {
  ClassifiedFeature,
  FeatureUsageState,
} from "./api/adminFeatureUsage.api";
import type { FeatureUsageRangeSelection } from "./featureUsageRange";
import { STATE_CATALOG_SUFFIX } from "./featureUsageLabels";
import { FeatureUsageRangeControl } from "./FeatureUsageRangeControl";
import { FeatureUsageLegend } from "./FeatureUsageLegend";
import { FeatureUsageTable } from "./FeatureUsageTable";
import styles from "./AdminFeatureUsagePage.module.css";

const HEADLINE_TILES: {
  state: FeatureUsageState;
  icon: IconType;
  dir: StatCard["trend"]["dir"];
}[] = [
  { state: "browsed-but-empty", icon: FiAlertTriangle, dir: "warn" },
  { state: "busy", icon: FiActivity, dir: "up" },
  { state: "quiet", icon: FiMoon, dir: "warn" },
  { state: "not-launched", icon: FiToggleLeft, dir: "warn" },
];

/** Four headline tiles, one per state, built on the shared
 *  `AdminStatGrid`/`StatCard` tile markup. It returns catalog keys, leaving
 *  resolution to the caller; it needs no `t` and stays trivially testable. */
function buildHeadlineStats(features: ClassifiedFeature[]): StatCard[] {
  return HEADLINE_TILES.map(({ state, icon, dir }) => {
    const suffix = STATE_CATALOG_SUFFIX[state];
    return {
      labelKey: `admin:featureUsage.state.${suffix}.label`,
      icon,
      value: features.filter((feature) => feature.state === state).length,
      trend: { dir, key: `admin:featureUsage.stat.${suffix}.trend` },
      footKey: `admin:featureUsage.state.${suffix}.explainer`,
    };
  });
}

/**
 * Reach and depth per product feature (PRD's feature-usage awareness work).
 * This page emphasizes classification over raw tallies: two features with
 * identical reach can be in completely different states depending on whether
 * anyone created anything. The key insight is `browsed-but-empty` (healthy reach
 * with near-zero creation), which signals the path itself is stopping people.
 * It gets the accent legend card, the tinted table row, and the `danger` badge;
 * every other state is informational.
 *
 * `feed`, `cinema` and `content` are reach-only: they have no member-authored
 * rows to count, so their Created/Total cells render the backend's `reason`
 * string. Coercing `null` to a `0` or a dash would misread "there is nothing
 * here to create" as "checked, and it was empty", the exact confusion this
 * page exists to prevent.
 *
 * The range control lives outside every `FadeIn`: `FadeIn` opens a stacking
 * context that clips anything rendered inside it, and the control stays
 * mounted through loading, so a reader can always change the range back.
 */
export function AdminFeatureUsagePage() {
  const { t } = useTranslation();
  const [selection, setSelection] = useState<FeatureUsageRangeSelection>({
    kind: "preset",
    rangeDays: 30,
  });
  const {
    features,
    drillDowns,
    hasReachSignal,
    isLoading,
    isError,
    isStale,
    window: usageWindow,
    reachMedian,
    errorCode,
  } = useAdminFeatureUsage(selection);

  return (
    <AdminShell
      title={
        <Translation
          i18nKey="admin:featureUsage.title"
          components={{ em: <em /> }}
        />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:featureUsage.eyebrow")}
          title={
            <Translation
              i18nKey="admin:featureUsage.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:featureUsage.sub")}
        />
      </FadeIn>

      <FeatureUsageRangeControl
        selection={selection}
        onSelectionChange={setSelection}
        window={usageWindow}
      />

      {isError ? (
        // A failed fetch stops here, before the stat tiles, the legend and
        // the table, so a failed request never reads as a full page of
        // confident zeros. The line names the cause the backend reported.
        <div className={styles.reachSignalNotice} role="alert">
          <FiAlertTriangle aria-hidden />
          <p>{t(featureUsageErrorKey(errorCode ?? "unknown"))}</p>
        </div>
      ) : isLoading || usageWindow === null ? (
        <div className={styles.skeletons}>
          <SkeletonLine height={104} style={{ borderRadius: 12 }} />
          <SkeletonLine height={320} style={{ borderRadius: 12 }} />
        </div>
      ) : (
        <>
          {/* Reach comes back `0` platform-wide right after deploy and for
              any range predating the usage table, while created rows are
              reconstructed historically and non-zero. The backend refuses to
              classify anything `browsed-but-empty` in that situation, so a
              reach outage never reads as a platform-wide finding; this
              notice says so plainly so the table's states stay explained.
              The table itself still renders, because created-row counts are
              still true even without a reach signal. */}
          <Collapse isOpen={!hasReachSignal}>
            <div className={styles.reachSignalNotice} role="status">
              <FiInfo aria-hidden />
              <p>{t("admin:featureUsage.noReachSignal.notice")}</p>
            </div>
          </Collapse>
          <AdminStatGrid metrics={buildHeadlineStats(features)} />
          <FadeIn delay={100}>
            <FeatureUsageLegend />
            <p className={styles.note}>
              {t("admin:featureUsage.reachOnlyNote")}
            </p>
            <FeatureUsageTable
              features={features}
              usageWindow={usageWindow}
              reachMedian={reachMedian}
              hasReachSignal={hasReachSignal}
              selection={selection}
              drillDowns={drillDowns}
              isStale={isStale}
            />
          </FadeIn>
        </>
      )}
    </AdminShell>
  );
}

import { useId, useState } from "react";
import type { IconType } from "react-icons";
import {
  FiActivity,
  FiAlertTriangle,
  FiChevronRight,
  FiInfo,
  FiMoon,
  FiToggleLeft,
  FiTrendingDown,
  FiTrendingUp,
} from "react-icons/fi";
import { LinePath } from "@visx/shape";
import { linearScale } from "../../shared/components/charts";
import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import { routes } from "../../app/routeMap";
import { AdminChip, AdminPageHeader, AdminSeg, type AdminTone } from "./ui";
import { AdminStatGrid } from "./AdminStatGrid";
import type { StatCard } from "./adminDashboard.data";
import { useAdminFeatureUsage } from "./api/useAdminFeatureUsage";
import type {
  AdminFeatureUsageDTO,
  ClassifiedFeature,
  FeatureUsageState,
} from "./api/adminFeatureUsage.api";
import styles from "./AdminFeatureUsagePage.module.css";

/** Badge tone per state. `browsed-but-empty` gets `danger`: it is the row
 *  this whole panel exists to surface. */
const STATE_TONE: Record<FeatureUsageState, AdminTone> = {
  busy: "jade",
  "browsed-but-empty": "danger",
  quiet: "amber",
  "not-launched": "ghost",
};

/** The catalog key segment for each state, since a kebab-case DTO value
 *  cannot be spliced straight into a dotted catalog path. */
const STATE_CATALOG_SUFFIX: Record<FeatureUsageState, string> = {
  busy: "busy",
  "browsed-but-empty": "browsedButEmpty",
  quiet: "quiet",
  "not-launched": "notLaunched",
};

/** The three features whose drill-down the backend actually populates. Every
 *  other `featureKey` renders no expand control at all. */
const DRILL_DOWN_FEATURE_KEYS = new Set([
  "housingListings",
  "forum",
  "communities",
]);

const FEATURE_USAGE_RANGE_DAYS_OPTIONS = [7, 30, 90] as const;
type FeatureUsageRangeDays = (typeof FEATURE_USAGE_RANGE_DAYS_OPTIONS)[number];

/** `camelCase` → "Capitalised words", e.g. `flatmateProfiles` → "Flatmate
 *  profiles". Only the fallback path below calls this; a labelled feature
 *  never reaches it. */
function humanizeFeatureKey(featureKey: string): string {
  const words = featureKey
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(" ")
    .filter(Boolean);
  if (words.length === 0) return featureKey;
  const [firstWord, ...restWords] = words;
  return [
    firstWord!.charAt(0).toUpperCase() + firstWord!.slice(1),
    ...restWords,
  ].join(" ");
}

/**
 * A feature's display name, catalog-first with a humanised fallback.
 *
 * The backend's tracked feature list comes from `launchedFeatures` and can
 * grow at any time; a demo fixture or a catalog merge can only ever cover the
 * keys known when it was written. `useTranslation`'s `t()` has no
 * default-value argument (`translate.ts`'s `resolveEntry` either returns the
 * resolved string or `undefined`, and `I18nProvider`'s `t()` echoes the raw
 * key back on a full miss; see `I18nProvider.tsx`'s `return key;` for details), so a
 * miss is detected here by comparing the result to the key itself. A raw
 * catalog key on an admin page ("admin:featureUsage.feature.housingGroups")
 * is a worse failure than an imperfect but readable fallback label, so an
 * unlabelled feature reads as "Housing groups" rather than as a bug.
 */
function featureDisplayName(featureKey: string, t: TFunction): string {
  const catalogKey = `admin:featureUsage.feature.${featureKey}`;
  const resolved = t(catalogKey);
  return resolved === catalogKey ? humanizeFeatureKey(featureKey) : resolved;
}

/**
 * The explanation shown in a reach-only feature's merged Created/Total cell.
 * Resolved catalog-first so `feed`, `content` and `cinema` read in the
 * viewer's language, with two floors under it so the cell can never end up
 * blank: the backend's own `reason` (English, but real), then a generic
 * translated line. `resolveEntry`'s echo-the-key-back behaviour on a miss is
 * what `featureDisplayName` above already relies on to detect a miss, reused
 * here the same way.
 */
function reachOnlyReason(feature: ClassifiedFeature, t: TFunction): string {
  const catalogKey = `admin:featureUsage.reachOnlyReason.${feature.featureKey}`;
  const resolved = t(catalogKey);
  if (resolved !== catalogKey) return resolved;
  if (feature.reason) return feature.reason;
  return t("admin:featureUsage.reachOnlyReason.generic");
}

type ReachDirection = "up" | "down" | "flat";

function reachDirection(feature: ClassifiedFeature): ReachDirection {
  if (feature.reach === feature.reachPrevious) return "flat";
  return feature.reach > feature.reachPrevious ? "up" : "down";
}

/** The reach column's direction line. Guards the two cases a plain percent
 *  formula cannot express: no previous reach to compare against at all, and
 *  no previous reach within this range (an undefined percent rather than
 *  a computed infinity). */
function reachTrendText(
  feature: ClassifiedFeature,
  t: TFunction,
  fmt: Formatters,
): string {
  if (feature.reachPrevious === 0) {
    return feature.reach === 0
      ? t("admin:featureUsage.reachTrend.none")
      : t("admin:featureUsage.reachTrend.new");
  }
  const percentChange =
    (feature.reach - feature.reachPrevious) / feature.reachPrevious;
  return t("admin:featureUsage.reachTrend.change", {
    percent: fmt.number(percentChange, {
      style: "percent",
      signDisplay: "exceptZero",
    }),
  });
}

/** Four headline tiles, one per state, reusing `AdminStatGrid`/`StatCard`
 *  rather than inventing new tile markup. It returns catalog keys, leaving
 * resolution to the caller; it needs no `t` and stays trivially testable. */
function buildHeadlineStats(features: ClassifiedFeature[]): StatCard[] {
  const countInState = (state: FeatureUsageState) =>
    features.filter((feature) => feature.state === state).length;

  const tiles: {
    state: FeatureUsageState;
    icon: IconType;
    dir: StatCard["trend"]["dir"];
  }[] = [
    { state: "browsed-but-empty", icon: FiAlertTriangle, dir: "warn" },
    { state: "busy", icon: FiActivity, dir: "up" },
    { state: "quiet", icon: FiMoon, dir: "warn" },
    { state: "not-launched", icon: FiToggleLeft, dir: "warn" },
  ];

  return tiles.map(({ state, icon, dir }) => {
    const suffix = STATE_CATALOG_SUFFIX[state];
    return {
      labelKey: `admin:featureUsage.state.${suffix}.label`,
      icon,
      value: countInState(state),
      trend: { dir, key: `admin:featureUsage.stat.${suffix}.trend` },
      footKey: `admin:featureUsage.state.${suffix}.explainer`,
    };
  });
}

/** A two-point line from the previous range's reach to this range's, coloured
 *  by direction. Decorative: the adjacent text already carries the number and
 *  the direction, so the mark is `aria-hidden`. */
function FeatureUsageSparkline({
  previous,
  current,
  direction,
}: {
  previous: number;
  current: number;
  direction: ReachDirection;
}) {
  const width = 56;
  const height = 20;
  const paddingX = 3;
  const paddingY = 3;
  const valueScale = linearScale(
    Math.max(previous, current, 1),
    paddingY,
    height - paddingY,
  );
  const points = [
    { x: paddingX, y: valueScale(previous) },
    { x: width - paddingX, y: valueScale(current) },
  ];
  const stroke =
    direction === "up"
      ? "var(--jade)"
      : direction === "down"
        ? "var(--danger)"
        : "var(--ink-40)";

  return (
    <svg
      className={styles.sparkline}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
    >
      <LinePath
        data={points}
        x={(point) => point.x}
        y={(point) => point.y}
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={points[1]!.x} cy={points[1]!.y} r={2.5} fill={stroke} />
    </svg>
  );
}

function FeatureUsageStateBadge({ state }: { state: FeatureUsageState }) {
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
function FeatureUsageLegend() {
  const { t } = useTranslation();
  const states: FeatureUsageState[] = [
    "browsed-but-empty",
    "busy",
    "quiet",
    "not-launched",
  ];

  return (
    <div className={styles.legend}>
      {states.map((state) => {
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
            <AdminChip tone={STATE_TONE[state]}>
              {t(`admin:featureUsage.state.${suffix}.label`)}
            </AdminChip>
            <p className={styles.legendExplainer}>
              {t(`admin:featureUsage.state.${suffix}.explainer`)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function FeatureUsageDetailItem({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className={styles.detailItem}>
      <span className={styles.detailValue}>{value}</span>
      <span className={styles.detailLabel}>{label}</span>
    </div>
  );
}

/** One drill-down's inline content. `communities`'s `stillPostingThisWeek` is
 *  a rolling 7-day count regardless of the range selector above the table, so
 *  its note is the one thing here that cannot be left implicit. */
function FeatureUsageDrillDown({
  featureKey,
  drillDowns,
}: {
  featureKey: string;
  drillDowns: AdminFeatureUsageDTO["drillDowns"];
}) {
  const { t } = useTranslation();
  const fmt = useFormat();

  if (featureKey === "housingListings") {
    const data = drillDowns.housingListings;
    return (
      <div className={styles.detailGrid}>
        <FeatureUsageDetailItem
          value={fmt.number(data.listings)}
          label={t("admin:featureUsage.drillDown.housingListings.listings")}
        />
        <FeatureUsageDetailItem
          value={fmt.number(data.savedSearches)}
          label={t(
            "admin:featureUsage.drillDown.housingListings.savedSearches",
          )}
        />
        <FeatureUsageDetailItem
          value={fmt.number(data.viewings)}
          label={t("admin:featureUsage.drillDown.housingListings.viewings")}
        />
      </div>
    );
  }

  if (featureKey === "forum") {
    const data = drillDowns.forum;
    return (
      <div className={styles.detailGrid}>
        <FeatureUsageDetailItem
          value={fmt.number(data.threads)}
          label={t("admin:featureUsage.drillDown.forum.threads")}
        />
        <FeatureUsageDetailItem
          value={fmt.number(data.replies)}
          label={t("admin:featureUsage.drillDown.forum.replies")}
        />
      </div>
    );
  }

  if (featureKey === "communities") {
    const data = drillDowns.communities;
    return (
      <div className={styles.detailGrid}>
        <FeatureUsageDetailItem
          value={fmt.number(data.created)}
          label={t("admin:featureUsage.drillDown.communities.created")}
        />
        <FeatureUsageDetailItem
          value={fmt.number(data.stillPostingThisWeek)}
          label={t(
            "admin:featureUsage.drillDown.communities.stillPostingThisWeek",
          )}
        />
        <p className={styles.detailNote}>
          {t("admin:featureUsage.drillDown.communities.stillPostingNote")}
        </p>
      </div>
    );
  }

  return null;
}

const REACH_TREND_ICON: Record<ReachDirection, IconType | null> = {
  up: FiTrendingUp,
  down: FiTrendingDown,
  flat: null,
};

/** One table row, plus its inline drill-down row when expanded. A reach-only
 *  feature (`depth`/`depthTotal` both `null`) merges the Created and Total
 *  cells into one, holding the `reason` string rather than a dash or a `0`;
 *  either would misread "nothing here to create" as "checked, and it was empty". */
function FeatureUsageRow({
  feature,
  drillDowns,
  isExpanded,
  onToggleExpand,
}: {
  feature: ClassifiedFeature;
  drillDowns: AdminFeatureUsageDTO["drillDowns"];
  isExpanded: boolean;
  onToggleExpand: (featureKey: string) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const featureName = featureDisplayName(feature.featureKey, t);
  const hasDrillDown = DRILL_DOWN_FEATURE_KEYS.has(feature.featureKey);
  const direction = reachDirection(feature);
  const TrendIcon = REACH_TREND_ICON[direction];
  const detailId = `feature-usage-detail-${feature.featureKey}`;

  return (
    <>
      <tr
        className={[
          feature.state === "browsed-but-empty" && styles.rowBrowsedButEmpty,
          !feature.isLaunched && styles.rowNotLaunched,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <th scope="row" className={styles.featureCell}>
          {featureName}
        </th>
        <td>
          <FeatureUsageStateBadge state={feature.state} />
        </td>
        <td className={styles.reachCell}>
          <span className={styles.reachValue}>{fmt.number(feature.reach)}</span>
          <span
            className={[
              styles.reachTrend,
              direction !== "flat" && styles[`reachTrend_${direction}`],
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <FeatureUsageSparkline
              previous={feature.reachPrevious}
              current={feature.reach}
              direction={direction}
            />
            {TrendIcon && <TrendIcon aria-hidden />}
            {reachTrendText(feature, t, fmt)}
          </span>
        </td>
        {feature.depth !== null && feature.depthTotal !== null ? (
          <>
            <td className={styles.numberCell}>{fmt.number(feature.depth)}</td>
            <td className={styles.numberCell}>
              {fmt.number(feature.depthTotal)}
            </td>
          </>
        ) : (
          <td className={styles.depthReason} colSpan={2}>
            <strong>{t("admin:featureUsage.notApplicable")}</strong>{" "}
            {reachOnlyReason(feature, t)}
          </td>
        )}
        <td className={styles.expandCell}>
          {hasDrillDown && (
            <button
              type="button"
              className={[styles.expandBtn, isExpanded && styles.expandBtnOpen]
                .filter(Boolean)
                .join(" ")}
              aria-expanded={isExpanded}
              aria-controls={detailId}
              aria-label={
                isExpanded
                  ? t("admin:featureUsage.drillDown.collapseLabel", {
                      feature: featureName,
                    })
                  : t("admin:featureUsage.drillDown.expandLabel", {
                      feature: featureName,
                    })
              }
              onClick={() => onToggleExpand(feature.featureKey)}
            >
              <FiChevronRight aria-hidden />
            </button>
          )}
        </td>
      </tr>
      {hasDrillDown && (
        <tr className={styles.detailRow} hidden={!isExpanded}>
          <td colSpan={6} id={detailId}>
            {isExpanded && (
              <FeatureUsageDrillDown
                featureKey={feature.featureKey}
                drillDowns={drillDowns}
              />
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function FeatureUsageTable({
  features,
  drillDowns,
  expandedFeatureKeys,
  onToggleExpand,
}: {
  features: ClassifiedFeature[];
  drillDowns: AdminFeatureUsageDTO["drillDowns"];
  expandedFeatureKeys: Set<string>;
  onToggleExpand: (featureKey: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={styles.tableWrap}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- the table scrolls horizontally, so the wrapper is deliberately focusable: without it a keyboard-only user cannot scroll to the reach and depth columns at all. Same justification as DeckViewer.tsx and MessageBubble.tsx.
      tabIndex={0}
      role="region"
      aria-label={t("admin:featureUsage.table.caption")}
    >
      <table className={styles.table}>
        <caption className={styles.srOnly}>
          {t("admin:featureUsage.table.caption")}
        </caption>
        <thead>
          <tr>
            <th scope="col">{t("admin:featureUsage.column.feature")}</th>
            <th scope="col">{t("admin:featureUsage.column.state")}</th>
            <th scope="col">{t("admin:featureUsage.column.reach")}</th>
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
                drillDowns={drillDowns}
                isExpanded={expandedFeatureKeys.has(feature.featureKey)}
                onToggleExpand={onToggleExpand}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
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
 * string instead of a `0` or a dash. Coercing `null` to either would misread
 * "there is nothing here to create" as "checked, and it was empty", the exact
 * confusion this page exists to prevent.
 *
 * The range selector lives outside every `FadeIn`: `FadeIn` opens a stacking
 * context that clips anything rendered inside it, and although `AdminSeg`
 * here is a segmented control rather than a popover dropdown, keeping the
 * range control outside the animated block is what keeps it safe if a
 * dropdown ever replaces it.
 */
export function AdminFeatureUsagePage() {
  const { t } = useTranslation();
  const rangeLabelId = useId();
  const [rangeDays, setRangeDays] = useState<FeatureUsageRangeDays>(30);
  const [expandedFeatureKeys, setExpandedFeatureKeys] = useState<Set<string>>(
    new Set(),
  );
  const { features, drillDowns, hasReachSignal, isLoading, isError } =
    useAdminFeatureUsage(rangeDays);

  const toggleExpanded = (featureKey: string) => {
    setExpandedFeatureKeys((previous) => {
      const next = new Set(previous);
      if (next.has(featureKey)) next.delete(featureKey);
      else next.add(featureKey);
      return next;
    });
  };

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

      {/* Kept mounted through loading, outside every FadeIn, so a reader can
          always change the range back. */}
      <div className={styles.rangeRow}>
        <span id={rangeLabelId} className={styles.rangeLabel}>
          {t("admin:featureUsage.rangeLabel")}
        </span>
        <AdminSeg
          options={FEATURE_USAGE_RANGE_DAYS_OPTIONS.map((option) => ({
            value: String(option),
            label: t(`admin:featureUsage.range.d${option}`),
          }))}
          value={String(rangeDays)}
          onChange={(next) =>
            setRangeDays(Number(next) as FeatureUsageRangeDays)
          }
          ariaLabelledby={rangeLabelId}
        />
      </div>

      {isLoading ? (
        <div className={styles.skeletons}>
          <SkeletonLine height={104} style={{ borderRadius: 12 }} />
          <SkeletonLine height={320} style={{ borderRadius: 12 }} />
        </div>
      ) : isError ? (
        // A failed fetch stops here, before the stat tiles, the legend and
        // the table: none of them render, rather than a full page of
        // confident zeros with nothing on screen saying the request failed.
        <div className={styles.reachSignalNotice} role="alert">
          <FiAlertTriangle aria-hidden />
          <p>{t("admin:featureUsage.loadError")}</p>
        </div>
      ) : (
        <>
          {/* Reach comes back `0` platform-wide right after deploy and for
              any range predating the usage table, while created rows are
              reconstructed historically and non-zero. The backend refuses to
              classify anything `browsed-but-empty` in that situation rather
              than have a reach outage read as a platform-wide finding; this
              notice says so plainly instead of letting the table's states go
              unexplained. The table itself still renders, unhidden, because
              created-row counts are still true even without a reach signal. */}
          {!hasReachSignal && (
            <div className={styles.reachSignalNotice} role="status">
              <FiInfo aria-hidden />
              <p>{t("admin:featureUsage.noReachSignal.notice")}</p>
            </div>
          )}
          <AdminStatGrid metrics={buildHeadlineStats(features)} />
          <FadeIn delay={100}>
            <FeatureUsageLegend />
            <p className={styles.note}>
              {t("admin:featureUsage.reachOnlyNote")}
            </p>
            <FeatureUsageTable
              features={features}
              drillDowns={drillDowns}
              expandedFeatureKeys={expandedFeatureKeys}
              onToggleExpand={toggleExpanded}
            />
          </FadeIn>
        </>
      )}
    </AdminShell>
  );
}

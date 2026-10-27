import { useState, type MouseEvent } from "react";
import { FiChevronRight } from "react-icons/fi";
import { Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { FeatureUsageStateBadge } from "./FeatureUsageLegend";
import { FeatureUsageReachCell } from "./FeatureUsageReachCell";
import { FeatureUsageDetailPanel } from "./FeatureUsageDetailPanel";
import { featureDisplayName, reachOnlyReason } from "./featureUsageLabels";
import type {
  FeatureUsageRangeSelection,
  FeatureUsageWindow,
} from "./featureUsageRange";
import type {
  AdminFeatureUsageDTO,
  ClassifiedFeature,
} from "./api/adminFeatureUsage.api";
import styles from "./AdminFeatureUsagePage.module.css";

/** Clicks on these keep their own meaning, so the row leaves them alone. */
const ROW_TOGGLE_IGNORED_TARGETS = 'button, a, input, [role="button"]';

/** True when the click is the release of a drag that selected text in the
 *  row, so copying a number never folds the row open or shut. */
function isEndOfTextSelection(): boolean {
  const textSelection = document.getSelection();
  return (
    textSelection !== null &&
    !textSelection.isCollapsed &&
    textSelection.toString().length > 0
  );
}

/**
 * One table row plus its detail row. Every row expands, a not-launched one
 * included (its panel shows the zeros as they are). A reach-only feature
 * (`depth`/`depthTotal` both `null`) merges the Created and Total cells into
 * one that holds its `reason` string: a dash or a `0` there would misread
 * "nothing here to create" as "checked, and it was empty".
 *
 * The detail row is always in the table. Its cell carries no padding (the
 * panel owns it) and stays untinted until the row opens, then keeps the tint
 * (a browsed-but-empty row's red edge included) until the fold has finished
 * closing.
 */
export function FeatureUsageRow({
  feature,
  usageWindow,
  reachMedian,
  hasReachSignal,
  selection,
  drillDowns,
  isExpanded,
  onToggleExpand,
  isStale,
}: {
  feature: ClassifiedFeature;
  usageWindow: FeatureUsageWindow;
  reachMedian: number;
  hasReachSignal: boolean;
  selection: FeatureUsageRangeSelection;
  drillDowns: AdminFeatureUsageDTO["drillDowns"];
  isExpanded: boolean;
  onToggleExpand: (featureKey: string) => void;
  /** True while the previous range is still on screen and a new one loads. */
  isStale: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const [isDetailShown, setIsDetailShown] = useState(isExpanded);
  const featureName = featureDisplayName(feature.featureKey, t);
  const detailId = `feature-usage-detail-${feature.featureKey}`;
  const isDetailTinted = isExpanded || isDetailShown;

  const toggle = () => {
    if (!isExpanded) setIsDetailShown(true);
    onToggleExpand(feature.featureKey);
  };

  const handleRowClick = (event: MouseEvent<HTMLTableRowElement>) => {
    const target = event.target;
    if (target instanceof Element && target.closest(ROW_TOGGLE_IGNORED_TARGETS))
      return;
    if (isEndOfTextSelection()) return;
    toggle();
  };

  return (
    <>
      {/* The row click is a pointer shortcut; the chevron button in the
          last cell is the keyboard path and carries aria-expanded. */}
      <tr
        className={[
          styles.row,
          isDetailTinted && styles.rowOpen,
          feature.state === "browsed-but-empty" && styles.rowBrowsedButEmpty,
          !feature.isLaunched && styles.rowNotLaunched,
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={handleRowClick}
      >
        {/* On a narrow table the State column folds away visually and its
            chip shows under the name. The State cell stays in the table for
            screen readers, so the chip under the name is aria-hidden and
            the state is announced once. */}
        <th scope="row" className={styles.featureCell}>
          <span className={styles.featureName}>{featureName}</span>
          <span className={styles.featureStateInline} aria-hidden>
            <FeatureUsageStateBadge state={feature.state} />
          </span>
        </th>
        <td className={styles.stateCell}>
          <span className={styles.stateCellContent}>
            <FeatureUsageStateBadge state={feature.state} />
          </span>
        </td>
        <td className={styles.reachCell}>
          <FeatureUsageReachCell
            feature={feature}
            window={usageWindow}
            reachMedian={reachMedian}
            hasReachSignal={hasReachSignal}
          />
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
            <span className={styles.depthReasonText}>
              <strong>{t("admin:featureUsage.notApplicable")}</strong>{" "}
              {reachOnlyReason(feature, t)}
            </span>
          </td>
        )}
        <td className={styles.expandCell}>
          <button
            type="button"
            className={
              isExpanded
                ? `${styles.expandBtn} ${styles.expandBtnOpen}`
                : styles.expandBtn
            }
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
            onClick={toggle}
          >
            <FiChevronRight aria-hidden />
          </button>
        </td>
      </tr>
      {/* Hidden from assistive tech only once it is shut and the fold has
          finished closing; the id stays so the chevron's aria-controls
          always resolves. */}
      <tr aria-hidden={isDetailTinted ? undefined : true}>
        <td
          colSpan={6}
          id={detailId}
          className={[
            styles.detailCell,
            isDetailTinted && styles.detailCellOpen,
            isDetailTinted &&
              feature.state === "browsed-but-empty" &&
              styles.detailCellBrowsedButEmpty,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <Collapse
            isOpen={isExpanded}
            className={styles.detailSticky}
            onExitComplete={() => setIsDetailShown(false)}
          >
            <FeatureUsageDetailPanel
              feature={feature}
              featureName={featureName}
              window={usageWindow}
              selection={selection}
              drillDowns={drillDowns}
              isStale={isStale}
            />
          </Collapse>
        </td>
      </tr>
    </>
  );
}

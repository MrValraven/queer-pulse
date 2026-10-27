import type { CSSProperties } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./AdminBarCharts.module.css";

export interface ReportSeriesItem {
  id: string;
  labelKey: string;
  color: string;
}

interface ReportsByTypeLegendProps {
  series: readonly ReportSeriesItem[];
  hiddenIds: ReadonlySet<string>;
  onToggle: (seriesId: string) => void;
}

/** Legend whose items switch a series on or off. The last visible series
 *  stays on so the chart never empties itself. */
export function ReportsByTypeLegend({
  series,
  hiddenIds,
  onToggle,
}: ReportsByTypeLegendProps) {
  const { t } = useTranslation();
  const visibleCount = series.length - hiddenIds.size;
  return (
    <div
      className={styles.legendToggles}
      role="group"
      aria-label={t("admin:dashboard.charts.reportsByType.legendLabel")}
    >
      {series.map((seriesItem) => {
        const isOn = !hiddenIds.has(seriesItem.id);
        const isLastVisible = isOn && visibleCount <= 1;
        return (
          <button
            key={seriesItem.id}
            type="button"
            className={`${styles.legendToggle} ${isOn ? "" : styles.legendToggleOff}`}
            aria-pressed={isOn}
            aria-disabled={isLastVisible || undefined}
            title={
              isLastVisible
                ? t("admin:dashboard.charts.reportsByType.keepOne")
                : undefined
            }
            onClick={() => {
              if (!isLastVisible) onToggle(seriesItem.id);
            }}
          >
            <span
              className={styles.legendSwatch}
              style={{ "--series-color": seriesItem.color } as CSSProperties}
            />
            {t(seriesItem.labelKey)}
          </button>
        );
      })}
    </div>
  );
}

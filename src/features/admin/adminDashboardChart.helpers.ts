import type { LegendItem } from "../../shared/components/charts";
import { useFormat } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import type { GrowthPoint } from "./adminDashboard.data";

/* Non-component helpers split out of AdminDashboardChartParts.tsx so that file
 * only exports components (react-refresh/only-export-components). */

export interface GrowthTip {
  label: string;
  joined: number;
  churned: number | null;
}

/** Builds the member-growth legend items — joined (always) plus churned,
 *  which falls back to a muted "not measured yet" entry when no churn
 *  data is available yet. Extracted to keep MemberGrowthChart under the
 *  200-line component limit. */
export function growthLegendItems(
  hasChurnData: boolean,
  t: TFunction,
): LegendItem[] {
  return [
    {
      color: "var(--jade)",
      label: t("admin:dashboard.charts.legend.joined"),
      dot: true,
    },
    hasChurnData
      ? {
          color: "var(--accent-ink)",
          label: t("admin:dashboard.charts.legend.churned"),
          dot: true,
        }
      : {
          color: "",
          muted: true,
          label: `${t("admin:dashboard.charts.legend.churned")} · ${t("admin:dashboard.notMeasuredYet")}`,
        },
  ];
}

/** Builds a growth point's tooltip datum plus the aria-label announced when a
 *  keyboard user focuses that point. Extracted to keep MemberGrowthChart under
 *  the 200-line component limit. */
export function growthPointTip(
  point: GrowthPoint,
  fmt: ReturnType<typeof useFormat>,
  t: TFunction,
): { datum: GrowthTip; ariaLabel: string } {
  const datum: GrowthTip = {
    label: point.date
      ? fmt.date(point.date, { month: "short" })
      : t("admin:dashboard.charts.memberGrowth.title"),
    joined: point.joined,
    churned: point.churned,
  };
  const ariaLabel =
    `${datum.label}: ${t("admin:dashboard.charts.legend.joined")} ${point.joined}` +
    (point.churned !== null
      ? `, ${t("admin:dashboard.charts.legend.churned")} ${point.churned}`
      : "");
  return { datum, ariaLabel };
}

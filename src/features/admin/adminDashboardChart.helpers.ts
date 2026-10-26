import type { LegendItem } from "../../shared/components/charts";
import { useFormat } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import type { GrowthPoint } from "./adminDashboard.data";

/* Non-component helpers split out of AdminDashboardChartParts.tsx so that file
 * only exports components (react-refresh/only-export-components). */

export interface GrowthTip {
  label: string;
  total: number;
  joined: number;
  churned: number | null;
}

/** True when the point at `index` is the first one in its calendar month, so
 *  the x-axis prints each month once under the week it starts in. */
export function startsNewMonth(points: GrowthPoint[], index: number): boolean {
  const current = points[index];
  const previous = points[index - 1];
  if (!current) return false;
  if (!previous) return true;
  return (
    current.date.getMonth() !== previous.date.getMonth() ||
    current.date.getFullYear() !== previous.date.getFullYear()
  );
}

/** Builds the member-growth legend items: total members (always) plus churned,
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
      label: t("admin:dashboard.charts.memberGrowth.totalMembers"),
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
    label: fmt.date(point.date, { day: "numeric", month: "short" }),
    total: point.total,
    joined: point.joined,
    churned: point.churned,
  };
  const ariaLabel =
    `${datum.label}: ${t("admin:dashboard.charts.memberGrowth.totalMembers")} ${fmt.number(point.total)}` +
    `, ${t("admin:dashboard.charts.memberGrowth.joinedThatWeek")} +${fmt.number(point.joined)}` +
    (point.churned !== null
      ? `, ${t("admin:dashboard.charts.legend.churned")} ${point.churned}`
      : "");
  return { datum, ariaLabel };
}

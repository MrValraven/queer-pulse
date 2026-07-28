import type { ReactNode } from "react";
import {
  useChartTooltip,
  type LegendItem,
} from "../../shared/components/charts";
import { useFormat } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import type { GrowthPoint } from "./adminDashboard.data";
import styles from "./AdminDashboardPage.module.css";
import chartStyles from "../../shared/components/charts/charts.module.css";

/** The cursor-following tooltip bubble shared by every dashboard chart. Renders
 *  nothing until a mark is hovered/focused, then draws the token-styled portal
 *  bubble and hands the active datum to `children`. Extracted so each chart
 *  component stays under the 200-line limit and the portal boilerplate lives in
 *  one place. */
export function ChartTooltip<Datum>({
  tip,
  children,
}: {
  tip: ReturnType<typeof useChartTooltip<Datum>>;
  children: (data: Datum) => ReactNode;
}) {
  if (!tip.tooltipOpen || !tip.tooltipData) return null;
  return (
    <tip.TooltipInPortal
      top={tip.tooltipTop}
      left={tip.tooltipLeft}
      className={chartStyles.tip}
      unstyled
    >
      {children(tip.tooltipData)}
    </tip.TooltipInPortal>
  );
}

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

/** The highlighted spike marker (dot + label) drawn over the member-growth line
 *  at its peak-join month. Extracted to keep MemberGrowthChart under the
 *  200-line component limit. */
export function GrowthSpike({
  x,
  y,
  label,
}: {
  x: number;
  y: number;
  label: string;
}) {
  return (
    <>
      <circle
        cx={x}
        cy={y}
        r={5}
        fill="var(--accent)"
        stroke="var(--paper)"
        strokeWidth={2}
      />
      <text x={x} y={y - 12} textAnchor="middle" className={styles.chSpike}>
        {label}
      </text>
    </>
  );
}

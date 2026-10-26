import type { ReactNode } from "react";
import { useChartTooltip } from "../../shared/components/charts";
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

import type { ReactNode } from "react";
import type { useChartTooltip } from "./ChartTooltip";
import styles from "./charts.module.css";

/** The cursor-following tooltip bubble shared by chart components. Renders
 *  nothing until a mark is hovered/focused, then draws the token-styled portal
 *  bubble and hands the active datum to `children`. Kept in its own file (not
 *  inlined in a chart, and not alongside {@link useChartTooltip}) because
 *  `tip.TooltipInPortal` wraps a ref that must not be read directly in the
 *  component that created it via `useChartTooltip`. */
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
      className={styles.tip}
      unstyled
    >
      {children(tip.tooltipData)}
    </tip.TooltipInPortal>
  );
}

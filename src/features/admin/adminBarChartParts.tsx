import { localPoint } from "@visx/event";
import { markFocusProps } from "../../shared/components/charts";
import styles from "./AdminBarCharts.module.css";

export interface TooltipControls<Datum> {
  showTooltip: (args: {
    tooltipLeft?: number;
    tooltipTop?: number;
    tooltipData?: Datum;
  }) => void;
  hideTooltip: () => void;
}

interface ColumnHitAreaProps<Datum> {
  columnIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  ariaLabel: string;
  datum: Datum;
  tip: TooltipControls<Datum>;
  onActiveChange: (columnIndex: number | null) => void;
}

/** The invisible, keyboard-focusable strip over a whole column. Hover or focus
 *  opens the shared tooltip and reports the active column so the chart can
 *  highlight it and dim the rest. */
export function ColumnHitArea<Datum>({
  columnIndex,
  x,
  y,
  width,
  height,
  ariaLabel,
  datum,
  tip,
  onActiveChange,
}: ColumnHitAreaProps<Datum>) {
  const focusProps = markFocusProps(tip, {
    label: ariaLabel,
    x: x + width / 2,
    y: y + height / 3,
    datum,
  });
  return (
    <rect
      {...focusProps}
      className={`${styles.hitArea} ${styles.hitFocus}`}
      x={x}
      y={y}
      width={width}
      height={height}
      rx={8}
      fill="transparent"
      onMouseMove={(event) => {
        const point = localPoint(event);
        onActiveChange(columnIndex);
        tip.showTooltip({
          tooltipLeft: point?.x,
          tooltipTop: point?.y,
          tooltipData: datum,
        });
      }}
      onMouseLeave={() => {
        onActiveChange(null);
        tip.hideTooltip();
      }}
      onFocus={(event) => {
        onActiveChange(columnIndex);
        focusProps.onFocus(event);
      }}
      onBlur={(event) => {
        onActiveChange(null);
        focusProps.onBlur(event);
      }}
    />
  );
}

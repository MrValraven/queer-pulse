import type { FocusEventHandler, KeyboardEventHandler } from "react";
import { useTooltip, useTooltipInPortal } from "@visx/tooltip";

/**
 * Bundles visx's tooltip state and portal container into one hook. Put
 * `containerRef` on the positioned `.plot` wrapper around the `<svg>`, translate
 * pointer events with `localPoint` (from `@visx/event`), and render
 * `<TooltipInPortal top={tooltipTop} left={tooltipLeft} className={styles.tip}
 * unstyled>` for a token-styled bubble that follows the cursor and flips near
 * edges (detectBounds).
 */
export function useChartTooltip<Datum>() {
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<Datum>();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    detectBounds: true,
    scroll: true,
  });

  return {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
    containerRef,
    TooltipInPortal,
  };
}

/** The two tooltip controls a focusable mark needs — a structural subset of
 *  what {@link useChartTooltip} returns, so the whole hook result is assignable. */
interface TooltipControls<Datum> {
  showTooltip: (args: {
    tooltipLeft?: number;
    tooltipTop?: number;
    tooltipData?: Datum;
  }) => void;
  hideTooltip: () => void;
}

/**
 * Keyboard-accessibility props for an interactive chart mark. Makes the mark
 * focusable and, on focus, opens the shared tooltip at the mark's own
 * coordinates — the keyboard equivalent of mouse hover; blur or Escape closes
 * it. Spread onto an SVG `<rect>`/`<circle>` alongside its mouse handlers, and
 * give the mark the kit's `.mark` class for the focus ring. `x`/`y` are the
 * mark's centre in SVG user units, which equal container pixels because the
 * chart's `viewBox` matches its rendered size.
 */
export function markFocusProps<Datum>(
  tooltip: TooltipControls<Datum>,
  mark: { label: string; x: number; y: number; datum: Datum },
): {
  tabIndex: 0;
  role: "img";
  "aria-label": string;
  onFocus: FocusEventHandler<SVGElement>;
  onBlur: FocusEventHandler<SVGElement>;
  onKeyDown: KeyboardEventHandler<SVGElement>;
} {
  return {
    tabIndex: 0,
    role: "img",
    "aria-label": mark.label,
    onFocus: () =>
      tooltip.showTooltip({
        tooltipLeft: mark.x,
        tooltipTop: mark.y,
        tooltipData: mark.datum,
      }),
    onBlur: () => tooltip.hideTooltip(),
    onKeyDown: (event) => {
      if (event.key === "Escape") tooltip.hideTooltip();
    },
  };
}

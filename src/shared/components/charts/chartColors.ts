/**
 * Non-series chart ink — grid lines, area fill, and axis text — as design
 * tokens. Series colors (jade/amber/danger/accent/violet) come from the data
 * (e.g. REPORT_SERIES), never hardcoded here.
 */
export const CHART_INK = {
  /** Faint gridlines on the hairline channels, which flip to light ink in
   *  dark mode so the grid stays visible on the dark paper. */
  grid: "rgba(var(--line-rgb),.08)",
  /** Jade area fill under the member-growth line. */
  area: "rgba(var(--jade-rgb),.10)",
  /** The hover/focus guide a line chart drops from the plot top to the
   *  baseline under the active point. Stronger than the grid so it reads as
   *  the reading's own mark, on the same flipping hairline channels. */
  guide: "rgba(var(--line-rgb),.32)",
} as const;

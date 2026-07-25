/**
 * Non-series chart ink — grid lines, area fill, and axis text — as design
 * tokens. Series colors (jade/amber/danger/accent/violet) come from the data
 * (e.g. REPORT_SERIES), never hardcoded here.
 */
export const CHART_INK = {
  /** Faint gridlines — matches the value used by the current hand-rolled charts. */
  grid: "rgba(45,27,61,.08)",
  /** Jade area fill under the member-growth line. */
  area: "rgba(var(--jade-rgb),.10)",
} as const;

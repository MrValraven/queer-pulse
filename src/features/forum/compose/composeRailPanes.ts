// ── The rail's panes, shared by the compact openers and the sheet ───────────

/** Which block the sheet is showing. */
export type ComposeRailPane = "preview" | "similar" | "checklist";

export const PANES: readonly ComposeRailPane[] = [
  "preview",
  "similar",
  "checklist",
];

export const PANE_LABEL_KEY: Record<ComposeRailPane, string> = {
  preview: "forum:composePage.rail.tabPreview",
  similar: "forum:composePage.rail.tabSimilar",
  checklist: "forum:composePage.rail.tabChecklist",
};

/** The numbers the tabs carry, when they have one worth showing. */
export interface PaneCounts {
  similarCount?: number;
  readyCount?: number;
  readyTotal?: number;
}

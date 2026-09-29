/**
 * Demo-mode saved desk views. Demo has no backend, so views live in this
 * browser's `localStorage`, which lets an editor trying the desk save, rename
 * and delete views and still find them after a reload. Every storage access
 * is wrapped: private windows and blocked site data throw on the accessor
 * itself, and the desk must still load with the seeds.
 */

import type { DeskView } from "./deskViews.api";

export const DEMO_DESK_VIEWS_STORAGE_KEY = "qp.demo.deskViews";

/** What a first visit sees: one view built from a single focus chip that
 *  really narrows the demo issue, and one section view that no chip narrows
 *  to (the earlier "My queue" seed only replayed the Mine chip). Focus
 *  chips combine as AND, so a seed naming two chips that never both hold on
 *  the same demo piece would always come up empty. */
export const DEMO_DESK_VIEW_SEEDS: DeskView[] = [
  {
    id: "demo-view-close-week",
    name: "Close week: late work",
    query: { track: "issue", focus: ["late"], sort: "due" },
    position: 0,
  },
  {
    id: "demo-view-essays-section",
    name: "Essays section",
    query: { sections: ["Essays"], groupBy: "stage" },
    position: 1,
  },
];

function isStoredView(value: unknown): value is DeskView {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<DeskView>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.position === "number" &&
    typeof candidate.query === "object" &&
    candidate.query !== null
  );
}

/** This session's latest write, so a blocked or full storage still shows the
 *  change until the next reload. Equal to the stored copy whenever the write
 *  succeeded. */
let sessionViews: DeskView[] | null = null;

/** The demo views in order: this session's latest write, else the stored
 *  copy, else the seeds. */
export function readDemoDeskViews(): DeskView[] {
  if (sessionViews !== null) return [...sessionViews];
  try {
    const raw = window.localStorage.getItem(DEMO_DESK_VIEWS_STORAGE_KEY);
    if (raw === null) return [...DEMO_DESK_VIEW_SEEDS];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...DEMO_DESK_VIEW_SEEDS];
    return parsed
      .filter(isStoredView)
      .sort((first, second) => first.position - second.position);
  } catch {
    return [...DEMO_DESK_VIEW_SEEDS];
  }
}

/** Persists the demo views. A failed write still holds for this session. */
export function writeDemoDeskViews(views: DeskView[]): void {
  sessionViews = [...views];
  try {
    window.localStorage.setItem(
      DEMO_DESK_VIEWS_STORAGE_KEY,
      JSON.stringify(views),
    );
  } catch {
    // Storage blocked or full: `sessionViews` carries the change.
  }
}

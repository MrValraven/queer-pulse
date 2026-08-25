import type {
  AdminRoadmapIdeaDTO,
  AdminRoadmapItemDTO,
} from "../api/roadmapAdmin.types";
import type { RoadmapSort } from "./state/roadmapFiltersTypes";

/** The 9 views, in tab order. */
export type RoadmapTabId =
  | "board"
  | "timeline"
  | "guides"
  | "capacity"
  | "ideas"
  | "notBuilding"
  | "heroStats"
  | "publicPreview"
  | "archive";

export interface RoadmapTabDef {
  id: RoadmapTabId;
  labelKey: string;
  /** Only Board and Timeline show the search/filter/sort toolbar — the
   *  other 7 views have nothing for it to filter (a checklist, a roster, a
   *  hero-stat editor, …). */
  showsToolbar: boolean;
}

export const ROADMAP_TABS: RoadmapTabDef[] = [
  { id: "board", labelKey: "admin:roadmap.tabs.board", showsToolbar: true },
  {
    id: "timeline",
    labelKey: "admin:roadmap.tabs.timeline",
    showsToolbar: true,
  },
  { id: "guides", labelKey: "admin:roadmap.tabs.guides", showsToolbar: false },
  {
    id: "capacity",
    labelKey: "admin:roadmap.tabs.capacity",
    showsToolbar: false,
  },
  {
    id: "ideas",
    labelKey: "admin:roadmap.tabs.memberIdeas",
    showsToolbar: false,
  },
  {
    id: "notBuilding",
    labelKey: "admin:roadmap.tabs.notBuilding",
    showsToolbar: false,
  },
  {
    id: "heroStats",
    labelKey: "admin:roadmap.tabs.heroStats",
    showsToolbar: false,
  },
  {
    id: "publicPreview",
    labelKey: "admin:roadmap.tabs.publicPreview",
    showsToolbar: false,
  },
  {
    id: "archive",
    labelKey: "admin:roadmap.tabs.archive",
    showsToolbar: false,
  },
];

export interface SavedViewDef {
  /** Matches a `SAVED_VIEW_PREDICATES` key in `state/roadmapFiltersTypes.ts`. */
  id: string;
  labelKey: string;
}

/** The 7 saved-view chips, in prototype order. */
export const SAVED_VIEWS: SavedViewDef[] = [
  { id: "late", labelKey: "admin:roadmap.savedViews.late" },
  { id: "unassigned", labelKey: "admin:roadmap.savedViews.unassigned" },
  { id: "blocked", labelKey: "admin:roadmap.savedViews.blocked" },
  { id: "stale", labelKey: "admin:roadmap.savedViews.stale" },
  { id: "guidesOnly", labelKey: "admin:roadmap.savedViews.guidesOnly" },
  { id: "needsSafety", labelKey: "admin:roadmap.savedViews.needsSafety" },
  { id: "needsFunding", labelKey: "admin:roadmap.savedViews.needsFunding" },
];

export interface SortOptionDef {
  value: RoadmapSort;
  labelKey: string;
}

export const SORT_OPTIONS: SortOptionDef[] = [
  { value: "manual", labelKey: "admin:roadmap.toolbar.sortManual" },
  { value: "votes", labelKey: "admin:roadmap.toolbar.sortVotes" },
  { value: "priority", labelKey: "admin:roadmap.toolbar.sortPriority" },
  { value: "stale", labelKey: "admin:roadmap.toolbar.sortStale" },
];

/** Distinct item categories, alphabetised — the toolbar's category select
 *  reads live values off the current items rather than a fixed vocabulary,
 *  since `category` is admin free text (the seed already has one item
 *  outside the 9 named `roadmap.categories.*` translations). */
export function getUniqueCategories(items: AdminRoadmapItemDTO[]): string[] {
  return Array.from(new Set(items.map((item) => item.category))).sort((a, b) =>
    a.localeCompare(b),
  );
}

/** Live counts shown on the tab bar — only where a cheap, unambiguous count
 *  exists; the rest (Guides/Capacity/Hero stats/Public preview) render
 *  without one rather than guess at what "count" would mean there. */
export function buildTabCounts(
  items: AdminRoadmapItemDTO[],
  ideas: AdminRoadmapIdeaDTO[],
): Partial<Record<RoadmapTabId, number>> {
  return {
    board: items.filter((item) => !item.archived).length,
    ideas: ideas.filter((idea) => idea.status === "pending").length,
    notBuilding: ideas.filter((idea) => idea.status === "dismissed").length,
    archive: items.filter((item) => item.archived).length,
  };
}

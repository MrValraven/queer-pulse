import { routes } from "../../../app/routeMap";
import { DEFAULT_CULTURAL_PRODUCTION_TAB } from "./culturalProductionUrl.data";

/** The search params the page keeps its state in (contract 10.1). */
export const CULTURAL_PRODUCTION_PARAM = {
  tab: "tab",
  idea: "idea",
  task: "task",
  assignedTo: "assignedTo",
  status: "status",
  ideaStatus: "ideaStatus",
  eventType: "eventType",
} as const;

export type CulturalProductionTab = "ideas" | "tasks" | "guides";

/** The page on one tab; the default tab answers the bare route. */
export const culturalTabHref = (tab: CulturalProductionTab): string =>
  tab === DEFAULT_CULTURAL_PRODUCTION_TAB
    ? routes.adminCulturalProduction
    : `${routes.adminCulturalProduction}?${CULTURAL_PRODUCTION_PARAM.tab}=${tab}`;

/** The Ideas tab with one idea's drawer open. */
export const culturalIdeaHref = (ideaId: string): string =>
  `${routes.adminCulturalProduction}?${CULTURAL_PRODUCTION_PARAM.tab}=ideas&${CULTURAL_PRODUCTION_PARAM.idea}=${encodeURIComponent(ideaId)}`;

/** The Tasks tab with one task's drawer open. */
export const culturalTaskHref = (taskId: string): string =>
  `${routes.adminCulturalProduction}?${CULTURAL_PRODUCTION_PARAM.tab}=tasks&${CULTURAL_PRODUCTION_PARAM.task}=${encodeURIComponent(taskId)}`;

/** The Tasks tab on the viewer's own tasks: the nav item's destination
 *  (`CULTURAL_PRODUCTION_NAV_TO` in `adminNav.data.ts` holds the same
 *  string). */
export const CULTURAL_MY_TASKS_HREF = `${routes.adminCulturalProduction}?${CULTURAL_PRODUCTION_PARAM.tab}=tasks&${CULTURAL_PRODUCTION_PARAM.assignedTo}=me`;

/** One guide's page, with the id encoded. */
export const culturalGuidePath = (guideId: string): string =>
  `${routes.adminCulturalProduction}/guides/${encodeURIComponent(guideId)}`;

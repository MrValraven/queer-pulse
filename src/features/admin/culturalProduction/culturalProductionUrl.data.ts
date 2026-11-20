import type { CulturalTaskStatus } from "./api/culturalProduction.types";
import type { CulturalProductionTab } from "./culturalProductionPaths";

/** The page's tabs, in the order they show. */
export const CULTURAL_PRODUCTION_TABS: readonly CulturalProductionTab[] = [
  "ideas",
  "tasks",
  "guides",
];

/** The tab a bare `/admin/cultural-production` (or an unknown `tab`) opens. */
export const DEFAULT_CULTURAL_PRODUCTION_TAB: CulturalProductionTab = "ideas";

/** The task status control's value: Open (todo and doing), All, or one
 *  status. */
export type CulturalTaskStatusView = "open" | "all" | CulturalTaskStatus;

/** The task status view a missing (or unknown) `status` param reads as. */
export const DEFAULT_CULTURAL_TASK_STATUS_VIEW: CulturalTaskStatusView = "open";

/** The `status` param value that lifts the status filter. */
export const ALL_TASK_STATUSES_PARAM_VALUE = "all";

/** The `location.state` key that marks a history entry a drawer open
 *  pushed, so closing that drawer steps back. */
export const CULTURAL_DRAWER_PUSHED_STATE_KEY = "culturalDrawerPushed";

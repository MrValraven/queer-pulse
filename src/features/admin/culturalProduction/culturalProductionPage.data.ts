import type { CulturalProductionTab } from "./culturalProductionPaths";

/** The tab strip's id prefix: tab `cultural-production-tab-<id>`, panel
 *  `cultural-production-panel-<id>`. */
export const CULTURAL_PRODUCTION_TABS_ID_PREFIX = "cultural-production";

/** Each tab's label key (namespace `admin`). */
export const CULTURAL_PRODUCTION_TAB_LABEL_KEYS: Record<
  CulturalProductionTab,
  string
> = {
  ideas: "admin:culturalProduction.tabs.ideas",
  tasks: "admin:culturalProduction.tabs.tasks",
  guides: "admin:culturalProduction.tabs.guides",
};

/** The panel id for one tab, matching the `aria-controls` AdminTabs sets. */
export const culturalProductionPanelId = (tab: CulturalProductionTab): string =>
  `${CULTURAL_PRODUCTION_TABS_ID_PREFIX}-panel-${tab}`;

/** The tab id for one tab, matching the id AdminTabs sets. */
export const culturalProductionTabId = (tab: CulturalProductionTab): string =>
  `${CULTURAL_PRODUCTION_TABS_ID_PREFIX}-tab-${tab}`;

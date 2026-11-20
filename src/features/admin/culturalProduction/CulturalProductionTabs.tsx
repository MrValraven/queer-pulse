import { AnimatePresence } from "motion/react";
import { ViewFade } from "../../../shared/components/ui/ViewFade";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminTabs, type AdminTab } from "../ui";
import { useCulturalTaskDueCount } from "./api/useCulturalTaskDueCount";
import type { CulturalProductionTab } from "./culturalProductionPaths";
import {
  CULTURAL_PRODUCTION_TABS_ID_PREFIX,
  CULTURAL_PRODUCTION_TAB_LABEL_KEYS,
  culturalProductionPanelId,
  culturalProductionTabId,
} from "./culturalProductionPage.data";
import { CULTURAL_PRODUCTION_TABS } from "./culturalProductionUrl.data";
import type { CulturalProductionUrl } from "./useCulturalProductionUrl";
import { GuidesTab } from "./GuidesTab";
import { IdeasTab } from "./IdeasTab";
import { TasksTab } from "./TasksTab";
import styles from "./AdminCulturalProduction.module.css";

function isCulturalProductionTab(
  value: string,
): value is CulturalProductionTab {
  return CULTURAL_PRODUCTION_TABS.some((tab) => tab === value);
}

/** The Tasks tab's pill: the viewer's open tasks due today or overdue, in
 *  the alert tone while any are. */
function useTasksTabCount(): Pick<
  AdminTab,
  "count" | "tone" | "countAriaLabel" | "isCountUnavailable"
> {
  const { t } = useTranslation();
  const dueCount = useCulturalTaskDueCount({ isEnabled: true });
  const count = dueCount.data;
  if (count === undefined) return { isCountUnavailable: dueCount.isError };
  return {
    count,
    tone: count > 0 ? "alert" : undefined,
    countAriaLabel: t("admin:culturalProduction.tabs.tasksDueAria", {
      count,
    }),
  };
}

/**
 * The page's three sections: Ideas, Tasks (with the due count) and Guides.
 * The tab lives in the URL, so a link lands on the same section; the panel
 * fades from one section to the next.
 */
export function CulturalProductionTabs({
  url,
}: {
  url: CulturalProductionUrl;
}) {
  const { t } = useTranslation();
  const tasksCount = useTasksTabCount();
  const tabs: AdminTab[] = CULTURAL_PRODUCTION_TABS.map((tab) => ({
    id: tab,
    label: t(CULTURAL_PRODUCTION_TAB_LABEL_KEYS[tab]),
    ...(tab === "tasks" ? tasksCount : {}),
  }));

  return (
    <>
      <AdminTabs
        idPrefix={CULTURAL_PRODUCTION_TABS_ID_PREFIX}
        label={t("admin:culturalProduction.tabs.label")}
        tabs={tabs}
        active={url.tab}
        onChange={(nextTab) => {
          if (isCulturalProductionTab(nextTab) && nextTab !== url.tab)
            url.setTab(nextTab);
        }}
      />
      <div
        className={styles.panel}
        role="tabpanel"
        id={culturalProductionPanelId(url.tab)}
        aria-labelledby={culturalProductionTabId(url.tab)}
        tabIndex={0}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <ViewFade key={url.tab}>
            {url.tab === "ideas" && (
              <IdeasTab onOpenIdea={(ideaId: string) => url.openIdea(ideaId)} />
            )}
            {url.tab === "tasks" && (
              <TasksTab onOpenTask={(taskId: string) => url.openTask(taskId)} />
            )}
            {url.tab === "guides" && <GuidesTab />}
          </ViewFade>
        </AnimatePresence>
      </div>
    </>
  );
}

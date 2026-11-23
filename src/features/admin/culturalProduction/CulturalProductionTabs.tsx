import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { MeasuredHeightFrame } from "../../../shared/components/layout/MeasuredHeightFrame";
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
import { CULTURAL_TAB_ENTRANCE_MS } from "./useEntranceViewKey";
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

/** `--dur-base`, the height glide of `MeasuredHeightFrame`, in milliseconds. */
const PANEL_GLIDE_MS = 250;
/** How long after a tab switch the panel frame eases its height: the hold,
 *  one glide, and a little slack for the last frame. */
const TAB_SWITCH_EASING_MS = CULTURAL_TAB_ENTRANCE_MS + PANEL_GLIDE_MS + 80;

/**
 * Keeps the tab panel's height steady through a tab switch.
 *
 * The leaving section is lifted out of the flow while it fades, so the panel
 * would drop to the height of the arriving section's first view (often its
 * loading outline) and then grow again when its data lands. Instead the
 * panel keeps the height it had (a `min-height`) while the arriving section
 * fades in, then lets go, and the frame around it eases to the new height in
 * one glide. Growing is never held, so a taller section opens at once.
 * Between switches the frame follows the panel as it is (`auto`), and each
 * section's own frame eases its list. Reduced motion skips the hold.
 */
function useTabSwitchHeight(tab: CulturalProductionTab) {
  const { reducedMotion: isReducedMotion } = useMotionPrefs();
  const panelRef = useRef<HTMLDivElement>(null);
  const lastPanelHeightRef = useRef<number | null>(null);
  const heldForTabRef = useRef(tab);
  const [shownTab, setShownTab] = useState(tab);
  const [isSwitchingTab, setIsSwitchingTab] = useState(false);
  if (tab !== shownTab) {
    setShownTab(tab);
    setIsSwitchingTab(true);
  }

  // The panel height on screen, kept current so a switch knows the height
  // it is leaving before the leaving section drops out of the flow.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const observer = new ResizeObserver(() => {
      lastPanelHeightRef.current = panel.getBoundingClientRect().height;
    });
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (heldForTabRef.current === tab) return;
    heldForTabRef.current = tab;
    const panel = panelRef.current;
    const heldHeight = lastPanelHeightRef.current;
    if (!panel || heldHeight === null || isReducedMotion) return;
    panel.style.minHeight = `${heldHeight}px`;
    const timerId = window.setTimeout(() => {
      panel.style.minHeight = "";
    }, CULTURAL_TAB_ENTRANCE_MS);
    return () => {
      window.clearTimeout(timerId);
      panel.style.minHeight = "";
    };
  }, [tab, isReducedMotion]);

  useEffect(() => {
    if (!isSwitchingTab) return;
    const timerId = window.setTimeout(
      () => setIsSwitchingTab(false),
      TAB_SWITCH_EASING_MS,
    );
    return () => window.clearTimeout(timerId);
  }, [isSwitchingTab, shownTab]);

  return { panelRef, isSwitchingTab };
}

/**
 * The page's three sections: Ideas, Tasks (with the due count) and Guides.
 * The tab lives in the URL, so a link lands on the same section; the panel
 * fades from one section to the next and eases to the new height once
 * (`useTabSwitchHeight`).
 */
export function CulturalProductionTabs({
  url,
}: {
  url: CulturalProductionUrl;
}) {
  const { t } = useTranslation();
  const tasksCount = useTasksTabCount();
  const { panelRef, isSwitchingTab } = useTabSwitchHeight(url.tab);
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
      <MeasuredHeightFrame shouldAnimateHeight={isSwitchingTab}>
        <div
          ref={panelRef}
          className={styles.panel}
          role="tabpanel"
          id={culturalProductionPanelId(url.tab)}
          aria-labelledby={culturalProductionTabId(url.tab)}
          tabIndex={0}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <ViewFade key={url.tab}>
              {url.tab === "ideas" && (
                <IdeasTab
                  onOpenIdea={(ideaId: string) => url.openIdea(ideaId)}
                />
              )}
              {url.tab === "tasks" && (
                <TasksTab
                  onOpenTask={(taskId: string) => url.openTask(taskId)}
                />
              )}
              {url.tab === "guides" && <GuidesTab />}
            </ViewFade>
          </AnimatePresence>
        </div>
      </MeasuredHeightFrame>
    </>
  );
}

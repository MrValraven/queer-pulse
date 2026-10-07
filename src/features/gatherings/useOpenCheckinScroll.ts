import { useEffect, useRef } from "react";
import { prefersReducedMotionNow } from "../../shared/hooks/usePrefersReducedMotion";
import { MANAGE_TAB_PANEL_ID, type ManageGatheringTab } from "./gatheringPaths";

/**
 * On a phone the Check-in list sits below the header, so a press on "Open
 * check-in" scrolls the tab panel to the top once the tab has switched, then
 * moves focus into it (the header button has scrolled out of view by then).
 * Returns the press handler.
 */
export function useOpenCheckinScroll(
  activeTab: ManageGatheringTab,
  selectTab: (tab: ManageGatheringTab) => void,
): () => void {
  const shouldScrollToPanelRef = useRef(false);
  const scrollPanelIntoView = () => {
    const panel = document.getElementById(MANAGE_TAB_PANEL_ID);
    if (!panel) return;
    panel.scrollIntoView({
      block: "start",
      behavior: prefersReducedMotionNow() ? "auto" : "smooth",
    });
    panel.focus({ preventScroll: true });
  };
  useEffect(() => {
    if (!shouldScrollToPanelRef.current || activeTab !== "checkin") return;
    shouldScrollToPanelRef.current = false;
    scrollPanelIntoView();
  }, [activeTab]);
  return () => {
    if (activeTab === "checkin") {
      scrollPanelIntoView();
      return;
    }
    shouldScrollToPanelRef.current = true;
    selectTab("checkin");
  };
}

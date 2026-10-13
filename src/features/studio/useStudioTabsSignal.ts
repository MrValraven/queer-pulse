import { useLayoutEffect } from "react";

const STUDIO_TABS_ATTRIBUTE = "data-studio-tabs";

// Counted so a route change between two Studio shell pages (one mounting while
// the other unmounts, in either order) never drops the signal mid-visit.
let mountedTabBarCount = 0;

/** Stamps `<html data-studio-tabs="true">` while a StudioTabBar is mounted.
 *  standalone.css reads it at <=880px to raise `--bottom-inset` by the tab
 *  bar's height, so the player bar, the consent banner and QuickExit sit
 *  above it. A layout effect, so the attribute lands before the first paint
 *  and the bar never shows one frame with the old inset. Same technique as
 *  useStudioShellSignal. */
export function useStudioTabsSignal() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    mountedTabBarCount += 1;
    root.setAttribute(STUDIO_TABS_ATTRIBUTE, "true");
    return () => {
      mountedTabBarCount -= 1;
      if (mountedTabBarCount === 0) root.removeAttribute(STUDIO_TABS_ATTRIBUTE);
    };
  }, []);
}

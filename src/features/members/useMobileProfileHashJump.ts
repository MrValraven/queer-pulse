import { useEffect, useRef, type RefObject } from "react";
import { useLocation } from "react-router-dom";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import {
  MOBILE_PROFILE_HASH_TABS,
  type MobileProfileTabKey,
} from "./mobileProfileTabs.data";

/** Frames to wait for the target section to mount after its tab opens. */
const MAX_FRAMES_TO_WAIT_FOR_TARGET = 30;

/** The tab a URL hash points into, when that tab is on the bar. */
export function tabKeyForHash(
  hash: string,
  visibleTabKeys: readonly MobileProfileTabKey[],
): MobileProfileTabKey | null {
  const tabKey = MOBILE_PROFILE_HASH_TABS[hash.slice(1)];
  return tabKey !== undefined && visibleTabKeys.includes(tabKey)
    ? tabKey
    : null;
}

/**
 * Makes `#places`-style links work on the tabbed mobile profile. When the URL
 * hash points into a tab, that tab opens (first load and every later hash
 * navigation while mounted) and, once the section exists, the page scrolls it
 * below the sticky tab bar and moves focus to it. Scrolling is instant under
 * reduced motion. It runs once per navigation entry, so flipping tabs by hand
 * afterwards never yanks the page back.
 */
export function useMobileProfileHashJump({
  visibleTabKeys,
  activeTab,
  selectTab,
  tabListRef,
}: {
  visibleTabKeys: readonly MobileProfileTabKey[];
  activeTab: MobileProfileTabKey;
  selectTab: (tabKey: MobileProfileTabKey) => void;
  tabListRef: RefObject<HTMLDivElement | null>;
}) {
  const { hash, key: locationKey } = useLocation();
  const { reducedMotion } = useMotionPrefs();
  const jumpedLocationKeyRef = useRef<string | null>(null);
  const hashTabKey = tabKeyForHash(hash, visibleTabKeys);

  useEffect(() => {
    if (hashTabKey !== null) selectTab(hashTabKey);
    // `selectTab` is a state setter; the navigation entry is the trigger.
  }, [locationKey, hashTabKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (hashTabKey === null || activeTab !== hashTabKey) return;
    if (jumpedLocationKeyRef.current === locationKey) return;
    const sectionId = hash.slice(1);
    let framesLeft = MAX_FRAMES_TO_WAIT_FOR_TARGET;
    let frameId = 0;
    function jumpWhenSectionExists() {
      const section = document.getElementById(sectionId);
      if (section === null) {
        framesLeft -= 1;
        if (framesLeft > 0)
          frameId = requestAnimationFrame(jumpWhenSectionExists);
        return;
      }
      jumpedLocationKeyRef.current = locationKey;
      const tabList = tabListRef.current;
      const stickyTop = tabList
        ? Number.parseFloat(getComputedStyle(tabList).top) || 0
        : 0;
      const barHeight = tabList?.getBoundingClientRect().height ?? 0;
      window.scrollTo({
        top:
          section.getBoundingClientRect().top +
          window.scrollY -
          stickyTop -
          barHeight,
        behavior: reducedMotion ? "instant" : "smooth",
      });
      section.focus({ preventScroll: true });
    }
    // One frame later, so this lands after the router-level scroll manager
    // has handled the same navigation (it scrolls to top while the section
    // is still absent).
    frameId = requestAnimationFrame(jumpWhenSectionExists);
    return () => cancelAnimationFrame(frameId);
  }, [hash, hashTabKey, activeTab, locationKey, reducedMotion, tabListRef]);
}

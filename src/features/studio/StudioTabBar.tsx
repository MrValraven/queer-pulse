import { useEffect, useLayoutEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { scrollBus } from "../../app/scrollBus";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  STUDIO_TABS,
  studioTabKeyOfPath,
  type StudioTabKey,
} from "./studioTabBar.data";
import { useStudioTabsSignal } from "./useStudioTabsSignal";
import styles from "./StudioTabBar.module.css";

/** The section the member last opened from a tab, for pages any section can
 *  open: an album reached from Library keeps Library lit. Every shell (one
 *  per page) reads the same value, and it resets to Home once no tab bar is
 *  mounted (the member left Studio). */
let lastSectionKey: StudioTabKey = "home";
let mountedTabBarCount = 0;
const sectionListeners = new Set<() => void>();

function subscribeToSection(listener: () => void): () => void {
  sectionListeners.add(listener);
  return () => sectionListeners.delete(listener);
}

function readLastSection(): StudioTabKey {
  return lastSectionKey;
}

function rememberSection(sectionKey: StudioTabKey): void {
  if (sectionKey === lastSectionKey) return;
  lastSectionKey = sectionKey;
  for (const listener of sectionListeners) listener();
}

/** The lit tab: the section that owns the path, else the one last opened. */
function useActiveStudioTab(pathname: string): StudioTabKey {
  const ownerKey = studioTabKeyOfPath(pathname);
  const rememberedKey = useSyncExternalStore(
    subscribeToSection,
    readLastSection,
    readLastSection,
  );
  useLayoutEffect(() => {
    if (ownerKey) rememberSection(ownerKey);
  }, [ownerKey]);
  useEffect(() => {
    mountedTabBarCount += 1;
    return () => {
      mountedTabBarCount -= 1;
      // Deferred, so a page swap (one bar unmounting while the next mounts
      // in the same commit) keeps the section.
      queueMicrotask(() => {
        if (mountedTabBarCount === 0) lastSectionKey = "home";
      });
    };
  }, []);
  return ownerKey ?? rememberedKey;
}

/**
 * Studio's phone navigation: a fixed bottom tab bar at <=880px, where the
 * left rail hides. Its height reaches `--bottom-inset` through
 * useStudioTabsSignal, so the player bar and the other bottom-anchored UI sit
 * above it. The spacer keeps the end of the page clear of the bar.
 *
 * Tabs light by section, so Library stays lit on a playlist, Liked songs or
 * an album opened from the library. Tapping the lit tab on its own root page
 * scrolls back to the top, as the app's bottom bar does; on a page deeper in
 * the section it returns to the root.
 *
 * The bar portals to <body>: RouteTransition and SwipeBackShell transform the
 * routed page, and a transformed ancestor re-anchors `position: fixed` to
 * itself, so the bar would ride the page slide off screen. The spacer stays
 * in flow where it is.
 */
export function StudioTabBar() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const activeKey = useActiveStudioTab(pathname);
  useStudioTabsSignal();

  return (
    <>
      <div className={styles.spacer} aria-hidden />
      {createPortal(
        <nav aria-label={t("studio:shell.tabs.label")} className={styles.bar}>
          {STUDIO_TABS.map((tab) => {
            const isActive = tab.key === activeKey;
            const isOnTabRoot = pathname === tab.to;
            const TabIcon = isActive ? tab.activeIcon : tab.icon;
            return (
              <Link
                key={tab.key}
                to={tab.to}
                className={styles.tab}
                // The tab's own root page is the current page; a page deeper
                // in its section reads as the current section.
                aria-current={
                  isOnTabRoot ? "page" : isActive ? "true" : undefined
                }
                data-active={isActive || undefined}
                onClick={(event) => {
                  if (!isActive || !isOnTabRoot) return;
                  event.preventDefault();
                  scrollBus.requestScrollToTop();
                }}
              >
                <TabIcon className={styles.icon} aria-hidden />
                <span className={styles.label}>{t(tab.labelKey)}</span>
              </Link>
            );
          })}
        </nav>,
        document.body,
      )}
    </>
  );
}

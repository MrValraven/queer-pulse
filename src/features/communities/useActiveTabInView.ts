import { useEffect, useRef, type RefObject } from "react";
import { useLocation } from "react-router-dom";
import { prefersReducedMotionNow } from "../../shared/hooks/usePrefersReducedMotion";

/** The hash a link appends to land on the community tab strip. Matches the
 *  `id` LivingHubTabs puts on the strip's wrapper. */
const TAB_STRIP_HASH = "#community-tabs";

/** A computed `scroll-padding-*` length in pixels; `auto` counts as zero. */
function scrollPaddingPixels(value: string): number {
  const pixels = Number.parseFloat(value);
  return Number.isFinite(pixels) ? pixels : 0;
}

/**
 * Where the strip's `scrollLeft` should land so the selected tab shows in
 * full, or null when it already does. Positions are in the strip's scroll
 * coordinates (border excluded, the current scroll added back), and each
 * candidate is a snap point: a tab's start minus the strip's start scroll
 * padding. The strip snaps tabs by their start (`scroll-snap-align: start`),
 * so landing between snap points would let the browser pull the selected
 * tab's badge back out of view.
 */
function scrollTargetFor(
  tablist: HTMLElement,
  selectedTab: HTMLElement,
): number | null {
  const stripBox = tablist.getBoundingClientRect();
  const stripStyle = getComputedStyle(tablist);
  const paddingStart = scrollPaddingPixels(stripStyle.scrollPaddingLeft);
  const paddingEnd = scrollPaddingPixels(stripStyle.scrollPaddingRight);
  const startOf = (element: HTMLElement) =>
    element.getBoundingClientRect().left -
    stripBox.left -
    tablist.clientLeft +
    tablist.scrollLeft;
  const snapPointOf = (element: HTMLElement) => startOf(element) - paddingStart;

  const selectedStart = startOf(selectedTab);
  const selectedEnd = selectedStart + selectedTab.offsetWidth;
  const visibleStart = tablist.scrollLeft + paddingStart;
  const visibleEnd = tablist.scrollLeft + tablist.clientWidth - paddingEnd;

  if (selectedStart < visibleStart) return snapPointOf(selectedTab);
  if (selectedEnd <= visibleEnd) return null;

  // Overflowing the end: the leftmost snap point that still shows the whole
  // selected tab keeps as many earlier tabs in view as possible.
  const visibleWidth = tablist.clientWidth - paddingStart - paddingEnd;
  // Array.from: the app's tsconfig `lib` has no DOM.Iterable, so a NodeList
  // cannot go straight into for...of.
  const tabs = Array.from(
    tablist.querySelectorAll<HTMLElement>('[role="tab"]'),
  );
  for (const tab of tabs) {
    const tabStart = startOf(tab);
    if (tabStart > selectedStart) break;
    if (selectedEnd - tabStart <= visibleWidth) return snapPointOf(tab);
  }
  return snapPointOf(selectedTab);
}

/** The interactions that mean the viewer is moving the strip themselves. */
const USER_SCROLL_EVENTS = ["pointerdown", "wheel", "touchstart"] as const;

/**
 * Scrolls the strip inside `wrapper` so its selected tab shows in full. Does
 * nothing when the strip fits (desktop) or the tab is already in view.
 */
function bringSelectedTabIntoView(
  wrapper: HTMLElement | null,
  shouldGlide: boolean,
): void {
  const tablist = wrapper?.querySelector<HTMLElement>('[role="tablist"]');
  const selectedTab = tablist?.querySelector<HTMLElement>(
    '[role="tab"][aria-selected="true"]',
  );
  if (!tablist || !selectedTab) return;
  // A strip that fits (desktop) has nothing to scroll.
  if (tablist.scrollWidth <= tablist.clientWidth) return;

  const target = scrollTargetFor(tablist, selectedTab);
  if (target === null) return;
  tablist.scrollTo({
    left: Math.max(0, target),
    behavior: shouldGlide ? "smooth" : "auto",
  });
}

/**
 * Keeps the selected tab inside the visible stretch of a tab strip that
 * scrolls sideways (the community tabs do on a phone). A link that lands on
 * `?tab=volunteering` would otherwise open the strip at its start, with the
 * selected tab past the right edge.
 *
 * It moves only the strip's own `scrollLeft`, so the page keeps its vertical
 * position, and only when the tab sits partly or wholly outside the strip.
 * The first adjustment jumps; later ones glide, unless the viewer asked for
 * reduced motion.
 *
 * The strip can change after that first adjustment: a tab that loads late
 * (Volunteering arrives after its own fetch) pushes the selected tab back out
 * of view. So it watches the strip's tabs and their sizes and brings the
 * selected tab back, until the viewer touches, drags or wheels the strip
 * themselves; from then on it leaves the strip where they put it.
 *
 * It also lands a `#community-tabs` link on the strip. The page scroll
 * restorer looks the hash up during navigation, before the community has
 * loaded and the strip exists, so it finds nothing. Once the wrapper mounts,
 * this scrolls it to the top of the page, once per navigation.
 *
 * `wrapperRef` points at the strip's wrapper (the `#community-tabs`
 * element), which contains the `role="tablist"`; the shared `Tabs` keeps its
 * own tablist ref.
 */
export function useActiveTabInView(
  wrapperRef: RefObject<HTMLElement | null>,
  activeTabId: string,
): void {
  const hasRunRef = useRef(false);
  const handledLocationKeyRef = useRef<string | null>(null);
  const { hash, key: locationKey } = useLocation();

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (hash !== TAB_STRIP_HASH || !wrapper) return;
    if (handledLocationKeyRef.current === locationKey) return;
    handledLocationKeyRef.current = locationKey;
    wrapper.scrollIntoView({ block: "start", behavior: "instant" });
  }, [wrapperRef, hash, locationKey]);

  useEffect(() => {
    const isFirstRun = !hasRunRef.current;
    hasRunRef.current = true;
    const shouldGlide = !isFirstRun && !prefersReducedMotionNow();
    bringSelectedTabIntoView(wrapperRef.current, shouldGlide);
  }, [wrapperRef, activeTabId]);

  // Re-align when the strip's tabs or sizes change, until the viewer scrolls
  // the strip themselves. Observing the wrapper (and re-reading the tablist
  // each time) survives the tablist being re-rendered.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    let pendingFrameId = 0;
    const realign = () => {
      cancelAnimationFrame(pendingFrameId);
      pendingFrameId = requestAnimationFrame(() =>
        bringSelectedTabIntoView(wrapper, !prefersReducedMotionNow()),
      );
    };
    const resizeObserver =
      typeof ResizeObserver === "function" ? new ResizeObserver(realign) : null;
    // The tablist's own box keeps its width when a tab is added (it only
    // overflows further), so each tab is watched too.
    const observeSizes = () => {
      if (!resizeObserver) return;
      resizeObserver.disconnect();
      resizeObserver.observe(wrapper);
      const stripElements = Array.from(
        wrapper.querySelectorAll<HTMLElement>('[role="tablist"], [role="tab"]'),
      );
      for (const element of stripElements) resizeObserver.observe(element);
    };
    const mutationObserver =
      typeof MutationObserver === "function"
        ? new MutationObserver(() => {
            observeSizes();
            realign();
          })
        : null;
    observeSizes();
    mutationObserver?.observe(wrapper, { childList: true, subtree: true });

    const stopWatching = () => {
      cancelAnimationFrame(pendingFrameId);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      for (const eventName of USER_SCROLL_EVENTS) {
        wrapper.removeEventListener(eventName, stopWatching);
      }
    };
    for (const eventName of USER_SCROLL_EVENTS) {
      wrapper.addEventListener(eventName, stopWatching, { passive: true });
    }
    return stopWatching;
  }, [wrapperRef]);
}

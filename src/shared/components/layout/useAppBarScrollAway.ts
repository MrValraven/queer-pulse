import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { isScrollLocked } from "../../hooks/useScrollLock";

/**
 * How far the page must travel in one direction, in px, before the bar reacts.
 * Swallows the few pixels a thumb or a momentum fling wobbles through at a
 * direction change, so the bar does not flicker in and out.
 */
const DIRECTION_TOLERANCE_PX = 8;

/**
 * The bar always shows this close to the top of the page: about its own
 * height, so it never lifts off while the page's first lines sit under it.
 */
const TOP_REVEAL_ZONE_PX = 56;

/** Stamped on <html> while the bar is away. standalone.css reads it. */
const HIDDEN_ATTRIBUTE = "data-app-bar-hidden";

/**
 * Hide-on-scroll for the mobile app bar. The bar lifts out of view while the
 * member scrolls DOWN the window and slides back the moment they scroll UP,
 * reach the top of the page, or navigate, so every page opens with it showing.
 *
 * While the bar is away this stamps `data-app-bar-hidden` on <html>, and
 * standalone.css lifts `--sticky-top` to the notch, so sticky in-page strips
 * (settings pills, profile tabs, the Local filter bar) rise with the bar
 * instead of pinning under a bar-sized gap.
 *
 * Window scroll only: a route that scrolls inside its own pane (Messages)
 * hides the app bar outright.
 */
export function useAppBarScrollAway(isEnabled: boolean): {
  isAppBarScrolledAway: boolean;
  revealAppBar: () => void;
} {
  const { key: locationKey } = useLocation();
  // WHICH location hid the bar. A navigation changes the key, so the new page
  // opens with the bar showing without resetting state inside an effect.
  const [hiddenAtLocationKey, setHiddenAtLocationKey] = useState<string | null>(
    null,
  );
  const isAppBarScrolledAway = isEnabled && hiddenAtLocationKey === locationKey;

  useEffect(() => {
    if (!isEnabled) return;
    // Taken from the first measured frame rather than now: ScrollManager may
    // still move the window for this navigation (a Back restoring its offset),
    // and that jump is not the member scrolling.
    let lastScrollY: number | null = null;
    let travelledDistance = 0;
    let frameId = 0;

    const measure = () => {
      frameId = 0;
      // A modal's scroll lock pins the body, snapping the window to 0 and back
      // again on release. Neither is the member scrolling, and the release
      // lands on the same offset recorded before the lock engaged.
      if (isScrollLocked()) return;
      const maxScrollY = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      // iOS rubber-banding reports offsets past both ends of the page. The
      // bounce back from the bottom would otherwise read as scrolling up.
      const scrollY = Math.min(Math.max(window.scrollY, 0), maxScrollY);
      const previousScrollY = lastScrollY ?? scrollY;
      lastScrollY = scrollY;

      if (scrollY <= TOP_REVEAL_ZONE_PX) {
        travelledDistance = 0;
        setHiddenAtLocationKey(null);
        return;
      }
      const scrollDelta = scrollY - previousScrollY;
      if (scrollDelta === 0) return;
      const isSameDirection =
        Math.sign(scrollDelta) === Math.sign(travelledDistance);
      travelledDistance = isSameDirection
        ? travelledDistance + scrollDelta
        : scrollDelta;
      if (travelledDistance > DIRECTION_TOLERANCE_PX) {
        setHiddenAtLocationKey(locationKey);
      } else if (travelledDistance < -DIRECTION_TOLERANCE_PX) {
        setHiddenAtLocationKey(null);
      }
    };

    // One measurement per frame, however many scroll events the frame fires.
    const scheduleMeasure = () => {
      if (frameId === 0) frameId = window.requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    return () => {
      window.removeEventListener("scroll", scheduleMeasure);
      if (frameId !== 0) window.cancelAnimationFrame(frameId);
    };
  }, [isEnabled, locationKey]);

  useEffect(() => {
    const root = document.documentElement;
    if (isAppBarScrolledAway) root.setAttribute(HIDDEN_ATTRIBUTE, "true");
    else root.removeAttribute(HIDDEN_ATTRIBUTE);
    return () => root.removeAttribute(HIDDEN_ATTRIBUTE);
  }, [isAppBarScrolledAway]);

  const revealAppBar = useCallback(() => setHiddenAtLocationKey(null), []);
  return { isAppBarScrolledAway, revealAppBar };
}

import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "../shared/i18n/useTranslation";
import { getDocumentBaseTitle } from "../shared/seo/documentTitleBadge";
import { defaultMeta } from "../shared/seo/seo.data";
import { findMainLandmark, watchForReplacedMain } from "./mainLandmarkFocus";

/**
 * How long to wait for the incoming route to write its own document title
 * before announcing whatever is on screen. A route's title is written from an
 * effect *inside* the routed tree (`useDocumentMeta`), and most routes are lazy
 * chunks, so on a cold navigation the title can land a few hundred ms after the
 * URL changes. Past this deadline a slightly generic announcement beats silence.
 */
const TITLE_SETTLE_TIMEOUT_MS = 1500;

/**
 * Best available human name for the page currently on screen, in priority
 * order:
 *
 * 1. The document title without its unread count (`getDocumentBaseTitle()`):
 *    the route's own `<PageMeta>` title, which is written for humans and
 *    already localised.
 * 2. The main landmark's `<h1>`: gated routes (the feed, the local directory)
 *    deliberately render no `<PageMeta>`, so their title is still the neutral
 *    site default and the heading is the only thing that names the page.
 * 3. The generic fallback string, for a route with neither.
 */
function resolvePageName(genericFallback: string): string {
  const title = getDocumentBaseTitle().trim();
  if (title.length > 0 && title !== defaultMeta.title) return title;

  const heading = findMainLandmark()
    ?.querySelector("h1")
    ?.textContent?.trim()
    .replace(/\s+/gu, " ");
  if (heading) return heading;

  return genericFallback;
}

/**
 * Announces every in-app navigation to screen readers, and lands focus in the
 * new page's content.
 *
 * A single-page app changes the whole page under the reader without any of the
 * signals a real document load gives it, so without this a navigation is
 * completely silent: the URL and the content change, and the reader keeps
 * sitting wherever it was. `ScrollManager` (its sibling) only moves the scroll
 * position, and `RouteTransition` only animates.
 *
 * **Ordering against the document title.** The title is written by
 * `useDocumentMeta`, from an effect belonging to the routed page (a descendant
 * of this component's *later* sibling) and behind a `Suspense` boundary for
 * every lazily-loaded route. So at the moment this effect runs, `document.title`
 * is still the OUTGOING page's. Reading it once would announce the page the
 * visitor just left. Instead we subscribe: a `MutationObserver` on `<head>`
 * announces the instant the new title lands, a post-paint frame catches the
 * already-warm case where the write beat the observer, and a deadline
 * (`TITLE_SETTLE_TIMEOUT_MS`) guarantees an announcement even for a route that
 * never sets a title of its own. The observer also fires when the unread count
 * in front of the title changes (a message arriving mid-navigation), but every
 * compare reads `getDocumentBaseTitle()`, so a count change leaves the page's
 * own title equal to the outgoing one and cannot settle early with its name.
 *
 * **Ordering against `ScrollManager`.** Mounted immediately after it, so its
 * scroll work (top-of-page on a fresh navigation, the remembered offset on a
 * POP) is committed first, and the focus move here passes
 * `{ preventScroll: true }`, so it can never drag the viewport away from a
 * restored position. An in-page `#hash` target is left alone entirely. When the
 * focused `<main>` is a loading skeleton's, `watchForReplacedMain` hands focus
 * on to the page's own `<main>` once it replaces it.
 *
 * Never gated behind the reduce-motion / accessibility preferences: this is
 * orientation, which every visitor needs.
 */
export function RouteAnnouncer() {
  const location = useLocation();
  const { pathname } = location;
  const { t } = useTranslation();
  const [announcement, setAnnouncement] = useState("");

  // Latest location and translator, readable from the pathname-keyed effect
  // below without becoming dependencies of it. A hash-only or query-only change
  // is not a page change, and switching language must not re-announce.
  const locationRef = useRef(location);
  const translateRef = useRef(t);

  // The first render is the browser's own document load, which the screen
  // reader already announces. Announcing again would say the page name twice.
  const hasNavigatedRef = useRef(false);
  const titleBeforeNavigationRef = useRef("");

  // Declared BEFORE the navigation effect below so it always runs first: on the
  // render that commits a navigation, the refs already hold that navigation's
  // location and the current translator by the time the effect reads them.
  useEffect(() => {
    locationRef.current = location;
    translateRef.current = t;
  });

  useEffect(() => {
    if (!hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      titleBeforeNavigationRef.current = getDocumentBaseTitle();
      return;
    }

    const titleAtNavigationStart = titleBeforeNavigationRef.current;
    // Where focus sat when the navigation started (usually the link that was
    // activated, which may live in the persistent chrome and so still be
    // mounted). If it has moved somewhere else by the time we settle, the
    // visitor has already started using the new page and we must not yank
    // focus out from under them.
    const activeElementAtNavigationStart = document.activeElement;

    // Clear first so the region's text is guaranteed to CHANGE when the new
    // name lands. Two pages can legitimately share a name (a paginated list, a
    // route that renders no `<PageMeta>`), and a live region handed identical
    // text is not re-read by any screen reader. The clear and the write land in
    // separate commits, so the text node genuinely changes either way.
    setAnnouncement("");

    let isSettled = false;
    let titleObserver: MutationObserver | null = null;
    let deadlineTimeoutId = 0;
    let paintFrameId = 0;
    let stopWatchingReplacedMain = (): void => {};

    const stopWatching = (): void => {
      titleObserver?.disconnect();
      window.clearTimeout(deadlineTimeoutId);
      window.cancelAnimationFrame(paintFrameId);
    };

    const moveFocusToMainLandmark = (): void => {
      // An in-page anchor (`/guides#faq`) has its own target and ScrollManager
      // has already jumped there, and pulling focus up to <main> would undo it.
      if (locationRef.current.hash) return;
      const activeElement = document.activeElement;
      if (
        activeElement !== activeElementAtNavigationStart &&
        activeElement !== null &&
        activeElement !== document.body
      ) {
        return;
      }
      // preventScroll: focusing an element scrolls it into view by default,
      // which would fight the offset ScrollManager just restored on a POP.
      const mainLandmark = findMainLandmark();
      mainLandmark?.focus({ preventScroll: true });
      // A loading skeleton's `<main>` is about to be swapped for the page's.
      if (mainLandmark && document.activeElement === mainLandmark) {
        stopWatchingReplacedMain = watchForReplacedMain(mainLandmark);
      }
    };

    const settle = (): void => {
      if (isSettled) return;
      isSettled = true;
      stopWatching();
      titleBeforeNavigationRef.current = getDocumentBaseTitle();
      setAnnouncement(
        resolvePageName(
          translateRef.current("shared:routeAnnouncer.pageLoaded"),
        ),
      );
      moveFocusToMainLandmark();
    };

    const settleIfTitleChanged = (): void => {
      if (getDocumentBaseTitle() !== titleAtNavigationStart) settle();
    };

    // `document.title` writes mutate the text inside the existing <title>, and
    // a route swapping its meta can replace head nodes wholesale, so watch the
    // whole head. The callback is a single string compare, so the extra meta
    // upserts `useDocumentMeta` performs alongside the title cost nothing.
    titleObserver = new MutationObserver(settleIfTitleChanged);
    titleObserver.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    // The route's component was already warm and wrote its title before this
    // effect ran, so no mutation is coming: check once after paint.
    paintFrameId = window.requestAnimationFrame(settleIfTitleChanged);
    deadlineTimeoutId = window.setTimeout(settle, TITLE_SETTLE_TIMEOUT_MS);

    return () => {
      isSettled = true;
      stopWatching();
      stopWatchingReplacedMain();
    };
  }, [pathname]);

  return (
    <p className="visuallyHidden" role="status" aria-live="polite">
      {announcement}
    </p>
  );
}

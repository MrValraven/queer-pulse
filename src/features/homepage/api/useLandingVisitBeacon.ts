import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useIsVisitorPreviewRequested } from "../../../shared/components/layout/visitorPreviewContext";
import { computeLandingSource } from "../lib/landingVisitSource";
import {
  LANDING_VISIT_PAGE_PATH,
  sendLandingVisit,
  type LandingVisitPage,
} from "./landingVisitBeacon";

/**
 * The pages whose count is settled for this page load, one entry per page, so
 * a visitor who navigates away and back within the SPA counts once for each
 * page. Held in memory only: the beacon writes nothing to localStorage,
 * sessionStorage or cookies, and a reload counts again.
 */
const sentPages = new Set<LandingVisitPage>();

/** Test-only: lets each test start from a fresh page load. */
export function resetLandingVisitBeaconForTests(): void {
  sentPages.clear();
}

/**
 * Counts one anonymous visit to a landing page (`home` at `/`, `studio` at
 * `/studio`). It waits until the session check has settled, then fires only
 * for a signed-out visitor on that page's path in live mode, and skips
 * automated browsers (`navigator.webdriver`). A visitor who is signed in once
 * the check settles never counts that page for this page load, so a member
 * who signs out and lands there stays uncounted. The request carries only a
 * source label (see `computeLandingSource`) and the page name.
 *
 * A staffer's visitor preview (`?preview=visitor`, see
 * `visitorPreviewContext.ts`) reads a signed-out session here, yet the person
 * looking is signed in, so it is handled like a signed-in visit: it never
 * counts, and it closes counting for that page for the rest of this page
 * load.
 */
export function useLandingVisitBeacon(page: LandingVisitPage = "home"): void {
  const { demoMode } = useDemoMode();
  const { checking, loggedIn } = useAuth();
  const { pathname } = useLocation();
  const isVisitorPreview = useIsVisitorPreviewRequested();
  const pathWithoutTrailingSlash =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  const isOnPagePath =
    pathWithoutTrailingSlash === LANDING_VISIT_PAGE_PATH[page];

  useEffect(() => {
    if (sentPages.has(page)) return;
    if (isVisitorPreview) {
      sentPages.add(page);
      return;
    }
    if (checking) return;
    if (loggedIn) {
      sentPages.add(page);
      return;
    }
    if (demoMode || !isOnPagePath) return;
    if (navigator.webdriver) return;
    sentPages.add(page);
    const source = computeLandingSource(
      window.location.search,
      document.referrer,
      window.location.host,
    );
    void sendLandingVisit(source, page);
  }, [page, demoMode, checking, loggedIn, isOnPagePath, isVisitorPreview]);
}

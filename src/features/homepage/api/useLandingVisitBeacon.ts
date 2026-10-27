import { useEffect } from "react";
import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useIsLandingVisitor } from "../../../shared/components/layout/useIsLandingVisitor";
import { useIsVisitorPreviewRequested } from "../../../shared/components/layout/visitorPreviewContext";
import { computeLandingSource } from "../lib/landingVisitSource";
import { sendLandingVisit } from "./landingVisitBeacon";

/**
 * Once per page load, so a visitor who navigates away and back within the
 * SPA counts once. Held in memory only: the beacon writes nothing to
 * localStorage, sessionStorage or cookies, and a reload counts again.
 */
let hasSentLandingVisit = false;

/** Test-only: lets each test start from a fresh page load. */
export function resetLandingVisitBeaconForTests(): void {
  hasSentLandingVisit = false;
}

/**
 * Counts one anonymous visit to the landing page. It waits until the session
 * check has settled, then fires only for a signed-out visitor on `/` in live
 * mode, and skips automated browsers (`navigator.webdriver`). A visitor who
 * is signed in once the check settles never counts for this page load, so a
 * member who signs out and lands on `/` stays uncounted. The request carries
 * only a source label (see `computeLandingSource`).
 *
 * A staffer's visitor preview (`?preview=visitor`, see
 * `visitorPreviewContext.ts`) reads a signed-out session here, yet the person
 * looking is signed in, so it is handled like a signed-in visit: it never
 * counts, and it closes counting for the rest of this page load.
 */
export function useLandingVisitBeacon(): void {
  const { demoMode } = useDemoMode();
  const { checking, loggedIn } = useAuth();
  const isLandingVisitor = useIsLandingVisitor();
  const isVisitorPreview = useIsVisitorPreviewRequested();

  useEffect(() => {
    if (hasSentLandingVisit) return;
    if (isVisitorPreview) {
      hasSentLandingVisit = true;
      return;
    }
    if (checking) return;
    if (loggedIn) {
      hasSentLandingVisit = true;
      return;
    }
    if (demoMode || !isLandingVisitor) return;
    if (navigator.webdriver) return;
    hasSentLandingVisit = true;
    const source = computeLandingSource(
      window.location.search,
      document.referrer,
      window.location.host,
    );
    void sendLandingVisit(source);
  }, [demoMode, checking, loggedIn, isLandingVisitor, isVisitorPreview]);
}

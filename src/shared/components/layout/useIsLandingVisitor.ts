import { useLocation } from "react-router-dom";
import { useAuth } from "../../../app/providers/authContext";
import { routes } from "../../../app/routeMap";
import { useIsVisitorPreviewRequested } from "./visitorPreviewContext";

/**
 * Whether a signed-out visitor is reading the landing page.
 *
 * The landing page is a single pitch read top to bottom, so for that visitor
 * the chrome narrows to it: `Navbar` swaps in the focused `LandingNav`, and
 * `BottomTabBar` renders nothing on a phone. One predicate for both, so the two
 * bars can never disagree about which page is the landing page. A signed-in
 * member on `/` keeps the ordinary chrome.
 *
 * A staffer's visitor preview of `/` (`?preview=visitor`, see
 * `visitorPreviewContext.ts`) counts as a visitor too. The chrome sits above
 * the page's signed-out stand-in and reads the real session, so it learns
 * about the preview here.
 */
export function useIsLandingVisitor(): boolean {
  const { loggedIn } = useAuth();
  const { pathname } = useLocation();
  const isVisitorPreview = useIsVisitorPreviewRequested();
  return (!loggedIn || isVisitorPreview) && pathname === routes.homepage;
}

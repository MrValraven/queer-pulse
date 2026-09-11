import { useLocation } from "react-router-dom";
import { useAuth } from "../../../app/providers/authContext";
import { routes } from "../../../app/routeMap";

/**
 * Whether a signed-out visitor is reading the landing page.
 *
 * The landing page is a single pitch read top to bottom, so for that visitor
 * the chrome narrows to it: `Navbar` swaps in the focused `LandingNav`, and
 * `BottomTabBar` renders nothing on a phone. One predicate for both, so the two
 * bars can never disagree about which page is the landing page. A signed-in
 * member on `/` keeps the ordinary chrome.
 */
export function useIsLandingVisitor(): boolean {
  const { loggedIn } = useAuth();
  const { pathname } = useLocation();
  return !loggedIn && pathname === routes.homepage;
}

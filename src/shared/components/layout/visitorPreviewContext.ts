import { createContext, useContext } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../app/providers/authContext";
import { elevatingCapabilities } from "../../../app/authGate";
import { routes } from "../../../app/routeMap";
import { useMyStaffRoles } from "../../../features/auth/api/useMyStaffRoles";

/**
 * Visitor preview: lets staff who curate the landing page open `/` or
 * `/studio` with `?preview=visitor` and read the page exactly as a signed-out
 * visitor would. The quick links on `/admin/landing` open these URLs in a new
 * tab.
 *
 * The preview is a view only. `VisitorPreview` re-provides `AuthContext` to
 * the page subtree with a signed-out value, so every section that branches on
 * `useAuth().loggedIn` (the hero, the outro, the live sections' data source)
 * renders its visitor version. The real session is untouched: the cookie
 * stays, nothing signs out, and leaving the page through a link that drops the
 * query string brings the member view straight back.
 *
 * The chrome mounted above the route (Navbar, BottomTabBar, AppChrome's html
 * flag) reads the real session, so it asks `useIsVisitorPreviewRequested`
 * through `useIsLandingVisitor` to narrow to the landing bar the same way.
 *
 * The anonymous landing visit counter never counts a preview: the person
 * looking is a signed-in staffer (see `useLandingVisitBeacon`).
 */

/** The query string that asks for the preview: `?preview=visitor`. */
export const VISITOR_PREVIEW_PARAM = "preview";
export const VISITOR_PREVIEW_VALUE = "visitor";

/** True inside an active `VisitorPreview`. */
export const VisitorPreviewContext = createContext(false);

/** Whether this subtree is rendering under an active visitor preview. */
export function useIsInVisitorPreview(): boolean {
  return useContext(VisitorPreviewContext);
}

/**
 * Whether the URL asks for the visitor preview AND the real session may have
 * it: signed in, holding a grant that reaches `/admin/landing` (the same
 * capabilities the route gate checks, admins included; demo grants every
 * one). Anyone else gets the ordinary page and the parameter does nothing.
 *
 * Inside an active `VisitorPreview` the auth context is the signed-out stand-in,
 * so the session checks below would read false there. The context flag covers
 * that case, so the answer is the same above and below the wrapper.
 */
export function useIsVisitorPreviewRequested(): boolean {
  const isInVisitorPreview = useIsInVisitorPreview();
  const { loggedIn, checking } = useAuth();
  const staffRoles = useMyStaffRoles();
  const { search } = useLocation();
  if (isInVisitorPreview) return true;
  if (checking || !loggedIn) return false;
  const isParamPresent =
    new URLSearchParams(search).get(VISITOR_PREVIEW_PARAM) ===
    VISITOR_PREVIEW_VALUE;
  if (!isParamPresent) return false;
  return elevatingCapabilities(routes.adminLanding).some((capability) =>
    staffRoles.includes(capability),
  );
}

/** `path` with the visitor preview query string, for the admin quick links. */
export function visitorPreviewHref(path: string): string {
  return `${path}?${VISITOR_PREVIEW_PARAM}=${VISITOR_PREVIEW_VALUE}`;
}

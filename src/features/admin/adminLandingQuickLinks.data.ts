import { routes } from "../../app/routeMap";
import { visitorPreviewHref } from "../../shared/components/layout/visitorPreviewContext";

/** One quick link on `/admin/landing`: a signed-out landing page to open. */
export interface AdminLandingQuickLink {
  id: string;
  labelKey: string;
  href: string;
}

/**
 * The signed-out landing pages a curator can open as a visitor sees them.
 * Each href carries `?preview=visitor` (see `visitorPreviewContext.ts`), which
 * renders the visitor version for staff who can reach this page.
 */
export const ADMIN_LANDING_QUICK_LINKS: AdminLandingQuickLink[] = [
  {
    id: "homepage",
    labelKey: "admin:landing.quickLinks.homepage",
    href: visitorPreviewHref(routes.homepage),
  },
  {
    id: "studio",
    labelKey: "admin:landing.quickLinks.studio",
    href: visitorPreviewHref(routes.studioLanding),
  },
];

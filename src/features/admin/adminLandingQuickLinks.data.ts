import { routes } from "../../app/routeMap";
import { visitorPreviewHref } from "../../shared/components/layout/visitorPreviewContext";

/** One quick link on `/admin/landing`: a public landing page to open. */
export interface AdminLandingQuickLink {
  id: string;
  labelKey: string;
  href: string;
}

/**
 * The public landing pages a curator can open from `/admin/landing`.
 * The homepage and Studio hrefs carry `?preview=visitor` (see
 * `visitorPreviewContext.ts`), which renders the visitor version for staff who
 * can reach this page. The four audience pages (`/for/*`) have no visitor
 * preview yet, so they open with the real session and a signed-in staffer sees
 * the member call to action there.
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
  {
    id: "forBusinesses",
    labelKey: "admin:landing.quickLinks.forBusinesses",
    href: routes.forBusinesses,
  },
  {
    id: "forCommunities",
    labelKey: "admin:landing.quickLinks.forCommunities",
    href: routes.forCommunities,
  },
  {
    id: "forPerformers",
    labelKey: "admin:landing.quickLinks.forPerformers",
    href: routes.forPerformers,
  },
  {
    id: "forPractitioners",
    labelKey: "admin:landing.quickLinks.forPractitioners",
    href: routes.forPractitioners,
  },
];

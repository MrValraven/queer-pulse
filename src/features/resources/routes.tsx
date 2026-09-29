import { Navigate, Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";
import { GUIDE_ROUTES } from "./guidePages";
import { ManagedGuide } from "./ManagedGuide";

const GuideIndexPage = lazyNamed(
  () => import("./GuideIndexPage"),
  "GuideIndexPage",
);
const ResourceGuidePage = lazyNamed(
  () => import("./ResourceGuidePage"),
  "ResourceGuidePage",
);

const GlossaryPage = lazyNamed(() => import("./GlossaryPage"), "GlossaryPage");

/** Resources & wellbeing: health guides, the therapist directory, glossary,
 *  identity/community guides, and the general safety overview. */
export function resourceRoutes() {
  return (
    <>
      {GUIDE_ROUTES.map(({ path, slug, Page }) => (
        <Route
          key={path}
          path={path}
          element={<ManagedGuide slug={slug} fallback={<Page />} />}
        />
      ))}
      <Route path={routes.glossary} element={<GlossaryPage />} />
      {/* CNT-11: retired in favor of the one real, backend-driven library at
          routes.resources ("/resources", features/marketing/ResourceLibraryPage);
          old links/bookmarks land there instead of a second, static-mock
          "library" surface. */}
      <Route
        path={routes.library}
        element={<Navigate to={routes.resources} replace />}
      />
      {/* CON-10: the category-grouped index of EVERY guide route. */}
      <Route path={routes.guideIndex} element={<GuideIndexPage />} />
      {/* CON-08: the slug-addressable renderer for a database-managed guide,
          and the honest landing place for a guide whose curated route is
          missing. It shares no path prefix with the static guide routes
          above, so neither can shadow the other. */}
      <Route
        path={`${routes.resourceGuide}/:slug`}
        element={<ResourceGuidePage />}
      />
    </>
  );
}

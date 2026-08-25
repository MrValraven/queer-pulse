import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const SubprofilePage = lazyNamed(
  () => import("./SubprofilePage"),
  "SubprofilePage",
);
const SubprofileDirectoryPage = lazyNamed(
  () => import("./SubprofileDirectoryPage"),
  "SubprofileDirectoryPage",
);
const MySubprofilesPage = lazyNamed(
  () => import("./MySubprofilesPage"),
  "MySubprofilesPage",
);
const SubprofileEditorPage = lazyNamed(
  () => import("./SubprofileEditorPage"),
  "SubprofileEditorPage",
);

/** Linked personas, standalone personas, the public persona directory, and the
 *  owner's persona dashboard + editor. */
export function subprofileRoutes() {
  return (
    <>
      {/* Linked persona nested under its owner's main profile. A two-segment
          path never shadows the one-segment `:slug` route in react-router
          v7 (a `/members/x` URL only matches `:slug`; `/members/x/y` only this). */}
      <Route
        path={`${routes.members}/:slug/:subslug`}
        element={<SubprofilePage />}
      />
      {/* Standalone (unlinked) persona by its global handle. */}
      <Route path="/p/:handle" element={<SubprofilePage />} />
      {/* Public persona directory. */}
      <Route path={routes.subprofiles} element={<SubprofileDirectoryPage />} />
      <Route
        path={routes.subprofilesDashboard}
        element={<MySubprofilesPage />}
      />
      <Route
        path={`${routes.subprofilesDashboard}/:id/edit`}
        element={<SubprofileEditorPage />}
      />
    </>
  );
}

import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const ConnectionsPage = lazyNamed(
  () => import("./ConnectionsPage"),
  "ConnectionsPage",
);

/** The member's connections surface. */
export function connectRoutes() {
  return (
    <>
      <Route path={routes.connections} element={<ConnectionsPage />} />
    </>
  );
}

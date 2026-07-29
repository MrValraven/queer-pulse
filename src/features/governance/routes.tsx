import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const GovernancePage = lazyNamed(() => import("./GovernancePage"), "GovernancePage");

/** The public governance overview page. */
export function governanceRoutes() {
  return (
    <>
      <Route path={routes.governance} element={<GovernancePage />} />
    </>
  );
}

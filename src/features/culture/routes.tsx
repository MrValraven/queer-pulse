import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const CulturePage = lazyNamed(() => import("./CulturePage"), "CulturePage");

/** The culture landing page. */
export function cultureRoutes() {
  return (
    <>
      <Route path={routes.culture} element={<CulturePage />} />
    </>
  );
}

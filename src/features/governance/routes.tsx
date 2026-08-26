import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const GovernancePage = lazyNamed(
  () => import("./GovernancePage"),
  "GovernancePage",
);

const TransparencyPage = lazyNamed(
  () => import("./TransparencyPage"),
  "TransparencyPage",
);

/** The public governance overview page, and the Transparency Report the
 *  Constitution's Article VI names. */
export function governanceRoutes() {
  return (
    <>
      <Route path={routes.governance} element={<GovernancePage />} />
      <Route path={routes.transparencyReport} element={<TransparencyPage />} />
    </>
  );
}

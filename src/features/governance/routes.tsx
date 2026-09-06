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

const ConcernStatusPage = lazyNamed(
  () => import("./ConcernStatusPage"),
  "ConcernStatusPage",
);

/**
 * The public governance overview page, the Transparency Report the
 * Constitution's Article VI names, and the concern status lookup (PRD-261).
 *
 * All three are public. The status page especially: a concern can be raised
 * without an account, so the person checking back usually has no session, and
 * their reference code is the only credential the route accepts.
 */
export function governanceRoutes() {
  return (
    <>
      <Route path={routes.governance} element={<GovernancePage />} />
      <Route path={routes.transparencyReport} element={<TransparencyPage />} />
      <Route path={routes.concernStatus} element={<ConcernStatusPage />} />
    </>
  );
}

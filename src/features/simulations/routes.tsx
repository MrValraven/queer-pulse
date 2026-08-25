import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const SimulationsHome = lazyNamed(
  () => import("./SimulationsHome"),
  "SimulationsHome",
);
const SimulationPlayer = lazyNamed(
  () => import("./SimulationPlayer"),
  "SimulationPlayer",
);

/** Dev-only sandbox routes. In production this returns null, so /simulations/*
 *  falls through to the NotFound route and the demo admin-guard bypass can
 *  never be reached in prod. */
export function simulationRoutes() {
  if (!import.meta.env.DEV) return null;
  return (
    <>
      <Route path={routes.simulations} element={<SimulationsHome />} />
      <Route
        path={`${routes.simulations}/:id`}
        element={<SimulationPlayer />}
      />
    </>
  );
}

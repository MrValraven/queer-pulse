import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";
import { CrashOnRender } from "./CrashOnRender";
import { FirstLoadPreview } from "./FirstLoadPreview";

const SimulationsHome = lazyNamed(
  () => import("./SimulationsHome"),
  "SimulationsHome",
);
const SimulationPlayer = lazyNamed(
  () => import("./SimulationPlayer"),
  "SimulationPlayer",
);

/** The page the "page crash" simulation boots. More specific than `:id`, so
 *  the router ranks it first. */
export const CRASH_PREVIEW_PATH = `${routes.simulations}/preview/crash`;

/** The page the "first load" simulations boot: the session-check loader
 *  handing over to the route fallback's, then the feed. Ranked above `:id`
 *  the same way. */
export const LOADER_PREVIEW_PATH = `${routes.simulations}/preview/first-load`;

/** Dev-only sandbox routes. In production this returns null, so /simulations/*
 *  falls through to the NotFound route and the demo admin-guard bypass can
 *  never be reached in prod. */
export function simulationRoutes() {
  if (!import.meta.env.DEV) return null;
  return (
    <>
      <Route path={routes.simulations} element={<SimulationsHome />} />
      <Route path={CRASH_PREVIEW_PATH} element={<CrashOnRender />} />
      <Route path={LOADER_PREVIEW_PATH} element={<FirstLoadPreview />} />
      <Route
        path={`${routes.simulations}/:id`}
        element={<SimulationPlayer />}
      />
    </>
  );
}

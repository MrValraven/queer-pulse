import { Navigate, Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const EventsPage = lazyNamed(
  () => import("./EventsPage"),
  "EventsPage",
  routes.events,
);

/** The merged events surface: the personal dashboard + discovery under one
 *  `/events` route, with `/account/events` redirecting in. */
export function myEventsRoutes() {
  return (
    <>
      <Route path={routes.events} element={<EventsPage />} />
      <Route
        path={routes.myEvents}
        element={<Navigate to={routes.events} replace />}
      />
    </>
  );
}

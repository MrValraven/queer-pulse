import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const MyEventsPage = lazyNamed(() => import("./MyEventsPage"), "MyEventsPage");

/** The member's personal events list. */
export function myEventsRoutes() {
  return (
    <>
      <Route path={routes.myEvents} element={<MyEventsPage />} />
    </>
  );
}

import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const NotificationsPage = lazyNamed(() => import("./NotificationsPage"), "NotificationsPage");

/** The member notifications inbox. */
export function notificationsRoutes() {
  return (
    <>
      <Route path={routes.notifications} element={<NotificationsPage />} />
    </>
  );
}

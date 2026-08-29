import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const MessagesPage = lazyNamed(
  () => import("./MessagesPage"),
  "MessagesPage",
  routes.messages,
);

/** Direct messages / chat surface. */
export function messagesRoutes() {
  return (
    <>
      <Route path={routes.messages} element={<MessagesPage />} />
    </>
  );
}

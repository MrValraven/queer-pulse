import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const MessagesPage = lazyNamed(
  () => import("./MessagesPage"),
  "MessagesPage",
  routes.messages,
);

/** PRD-358: the group invite-link landing page. Lazy like every other route
 *  here; nothing in the app links to it ahead of time (it is only ever
 *  reached from a link shared outside the app), so it carries no
 *  `prefetchFor` pattern. */
const JoinGroupPage = lazyNamed(
  () => import("./JoinGroupPage"),
  "JoinGroupPage",
);

/** Direct messages / chat surface, plus the group invite-link landing page. */
export function messagesRoutes() {
  return (
    <>
      <Route path={routes.messages} element={<MessagesPage />} />
      <Route path={`${routes.groupJoin}/:token`} element={<JoinGroupPage />} />
    </>
  );
}

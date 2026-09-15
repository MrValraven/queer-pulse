import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const ForumPage = lazyNamed(() => import("./ForumPage"), "ForumPage");
const ThreadPage = lazyNamed(() => import("./ThreadPage"), "ThreadPage");
const ForumNewPostPage = lazyNamed(
  () => import("./compose/ForumNewPostPage"),
  "ForumNewPostPage",
  routes.forumNew,
);

/** The forum index, the full-page composer, and thread detail pages. */
export function forumRoutes() {
  return (
    <>
      <Route path={routes.forum} element={<ForumPage />} />
      <Route path={routes.forumNew} element={<ForumNewPostPage />} />
      <Route path="/thread" element={<ThreadPage />} />
      <Route path="/thread/:id" element={<ThreadPage />} />
    </>
  );
}

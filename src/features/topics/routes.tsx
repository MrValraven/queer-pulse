import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const TopicPage = lazyNamed(() => import("./TopicPage"), "TopicPage");
const TopicsDirectoryPage = lazyNamed(
  () => import("./TopicsDirectoryPage"),
  "TopicsDirectoryPage",
);

/** A community topic (hashtag) feed page, plus the topics directory
 *  (DISC-4) — `routes.topics` (`/topics`), distinct from the per-tag feed
 *  (`routes.topic`, `/topic/:tag`). */
export function topicRoutes() {
  return (
    <>
      <Route path={routes.topics} element={<TopicsDirectoryPage />} />
      <Route path={`${routes.topic}/:tag`} element={<TopicPage />} />
    </>
  );
}

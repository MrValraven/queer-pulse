import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const TopicPage = lazyNamed(() => import("./TopicPage"), "TopicPage");

/** A community topic (hashtag) feed page. */
export function topicRoutes() {
  return (
    <>
      <Route path={`${routes.topic}/:tag`} element={<TopicPage />} />
    </>
  );
}

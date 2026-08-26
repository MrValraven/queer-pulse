import { Route } from "react-router-dom";
import { lazyNamed } from "../../app/routeHelpers";

import { FEED_MUTED_PATH } from "./feedMutedPath";

const FeedPage = lazyNamed(() => import("./FeedPage"), "FeedPage");
const FeedMutedSourcesPage = lazyNamed(
  () => import("./FeedMutedSourcesPage"),
  "FeedMutedSourcesPage",
);

/** The member home feed, plus the managed list of feed sources the member has
 *  turned down (SOC-18). Registered here rather than in `app/routes.tsx` so a
 *  page that belongs entirely to this feature needs no shared-file change. */
export function feedRoutes() {
  return (
    <>
      <Route path="/feed" element={<FeedPage />} />
      <Route path={FEED_MUTED_PATH} element={<FeedMutedSourcesPage />} />
    </>
  );
}

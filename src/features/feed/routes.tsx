import { Route } from "react-router-dom";
import { lazyNamed } from "../../app/routeHelpers";

const FeedPage = lazyNamed(() => import("./FeedPage"), "FeedPage");

/** The member home feed. */
export function feedRoutes() {
  return (
    <>
      <Route path="/feed" element={<FeedPage />} />
    </>
  );
}

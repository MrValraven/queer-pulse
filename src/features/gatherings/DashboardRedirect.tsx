import { Navigate, useParams } from "react-router-dom";
import { gatheringSlugFromParam, manageGatheringPath } from "./gatheringPaths";

/** The old day-of dashboard lives on as Manage's Check-in tab; old links
 *  (notifications, bookmarks) land there. */
export function DashboardRedirect() {
  const { slug: param } = useParams();
  const slug = gatheringSlugFromParam(param ?? "");
  return <Navigate replace to={manageGatheringPath(slug, "checkin")} />;
}

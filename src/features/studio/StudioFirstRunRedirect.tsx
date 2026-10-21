import { Navigate } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { STUDIO_WELCOME_REQUEST_STATE } from "./studioFirstRunConstants";

/** The old welcome page's address, in both modes: Studio home with the
 *  welcome open on top (StudioFirstRun). Kept light, so the route table
 *  never pulls the welcome itself in. */
export function StudioFirstRunRedirect() {
  return (
    <Navigate to={routes.studio} replace state={STUDIO_WELCOME_REQUEST_STATE} />
  );
}

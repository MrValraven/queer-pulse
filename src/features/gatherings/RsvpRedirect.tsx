import { Navigate, useSearchParams } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { gatheringPath } from "./data";

/**
 * Live-mode retirement of the standalone `/rsvp` page: RSVP is now an action
 * *inside* the gathering detail, so there is no separate confirmation page
 * in live. If the URL still carries the originating
 * `?event=<slug>`, send the member to that gathering; otherwise to the events
 * board. Demo keeps the static `RsvpPage` reading-group confirmation.
 */
export function RsvpRedirect() {
  const [searchParams] = useSearchParams();
  const eventSlug = searchParams.get("event");
  return (
    <Navigate
      to={eventSlug ? gatheringPath(eventSlug) : routes.events}
      replace
    />
  );
}

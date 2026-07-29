import { Navigate, Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const EventsHubPage = lazyNamed(() => import("./EventsHubPage"), "EventsHubPage");
const GatheringPage = lazyNamed(() => import("./GatheringPage"), "GatheringPage");
const GatheringRecapPage = lazyNamed(() => import("./GatheringRecapPage"), "GatheringRecapPage");
const GatheringCancelledPage = lazyNamed(() => import("./GatheringCancelledPage"), "GatheringCancelledPage");
const GatheringDashboardPage = lazyNamed(() => import("./GatheringDashboardPage"), "GatheringDashboardPage");
const ManageGatheringPage = lazyNamed(() => import("./ManageGatheringPage"), "ManageGatheringPage");
const GatheringPhotosPage = lazyNamed(() => import("./GatheringPhotosPage"), "GatheringPhotosPage");
const CoHostInvitePage = lazyNamed(() => import("./CoHostInvitePage"), "CoHostInvitePage");
const EventPage = lazyNamed(() => import("./EventPage"), "EventPage");
const RsvpPage = lazyNamed(() => import("./RsvpPage"), "RsvpPage");
const CheckoutPage = lazyNamed(() => import("./checkout/CheckoutPage"), "CheckoutPage");
const HostPage = lazyNamed(() => import("./HostPage"), "HostPage");
const CreateGatheringPage = lazyNamed(() => import("./CreateGatheringPage"), "CreateGatheringPage");

/** The gatherings surface: calendar, events, a gathering's detail + management
 *  sub-pages, RSVP/checkout, hosting, and the gatherings index. */
export function gatheringRoutes() {
  return (
    <>
      <Route
        path={routes.calendar}
        element={<Navigate to={`${routes.events}?view=calendar`} replace />}
      />
      <Route path={routes.events} element={<EventsHubPage />} />
      {/* `/gathering/:slug` (singular) and the flat `/gathering-*` routes were
          unified under `/gatherings/:slug/...`. Hard cutover — no redirect shims. */}
      <Route path={`${routes.gatherings}/:slug`} element={<GatheringPage />} />
      <Route
        path={`${routes.gatherings}/:slug/recap`}
        element={<GatheringRecapPage />}
      />
      <Route
        path={`${routes.gatherings}/:slug/cancelled`}
        element={<GatheringCancelledPage />}
      />
      <Route
        path={`${routes.gatherings}/:slug/dashboard`}
        element={<GatheringDashboardPage />}
      />
      <Route
        path={`${routes.gatherings}/:slug/manage`}
        element={<ManageGatheringPage />}
      />
      <Route
        path={`${routes.gatherings}/:slug/photos`}
        element={<GatheringPhotosPage />}
      />
      <Route
        path={`${routes.gatherings}/:slug/co-host-invite`}
        element={<CoHostInvitePage />}
      />
      <Route path={routes.event} element={<EventPage />} />
      <Route path={routes.rsvp} element={<RsvpPage />} />
      <Route path={routes.rsvpTicket} element={<RsvpPage />} />
      <Route path={routes.checkout} element={<CheckoutPage />} />
      <Route path={routes.host} element={<HostPage />} />
      <Route path={routes.createGathering} element={<CreateGatheringPage />} />
      <Route path={routes.gatherings} element={<Navigate to={routes.events} replace />} />
    </>
  );
}

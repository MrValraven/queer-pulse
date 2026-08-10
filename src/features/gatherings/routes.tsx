import { Navigate, Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";
import { GatheringComingSoon } from "./GatheringComingSoon";

const GatheringPage = lazyNamed(() => import("./GatheringPage"), "GatheringPage");
const GatheringRecapPage = lazyNamed(() => import("./GatheringRecapPage"), "GatheringRecapPage");
const GatheringCancelledPage = lazyNamed(() => import("./GatheringCancelledPage"), "GatheringCancelledPage");
const GatheringDashboardPage = lazyNamed(() => import("./GatheringDashboardPage"), "GatheringDashboardPage");
const ManageGatheringPage = lazyNamed(() => import("./ManageGatheringPage"), "ManageGatheringPage");
const GatheringManageComingSoon = lazyNamed(() => import("./GatheringManageComingSoon"), "GatheringManageComingSoon");
const GatheringPhotosPage = lazyNamed(() => import("./GatheringPhotosPage"), "GatheringPhotosPage");
const CoHostInvitePage = lazyNamed(() => import("./CoHostInvitePage"), "CoHostInvitePage");
const EventPage = lazyNamed(() => import("./EventPage"), "EventPage");
const RsvpPage = lazyNamed(() => import("./RsvpPage"), "RsvpPage");
const HostPage = lazyNamed(() => import("./HostPage"), "HostPage");
const CreateGatheringPage = lazyNamed(() => import("./CreateGatheringPage"), "CreateGatheringPage");

/** The gatherings surface: calendar, events, a gathering's detail + management
 *  sub-pages, RSVP, hosting, and the gatherings index.
 *
 *  Several routes here are demo-only prototypes each fixed to a single mock
 *  gathering — the `/manage` dashboard, the standalone `/event` detail, the
 *  `/rsvp` confirmation, the co-host invite, and the recap. They fire real
 *  RSVP / un-RSVP / invite-response mutations (or, for the recap, orphan a real
 *  photo upload) at a hardcoded slug/id that ignores the route, so in LIVE mode
 *  they resolve to an honest coming-soon instead — no real write can target
 *  that hardcoded id. The real event surface is `/gatherings/:slug` (really
 *  wired). Every other route here is really wired too. */
export function gatheringRoutes(demoMode: boolean) {
  return (
    <>
      <Route
        path={routes.calendar}
        element={
          <Navigate
            to={`${routes.events}?tab=discover&view=calendar`}
            replace
          />
        }
      />
      {/* `/gathering/:slug` (singular) and the flat `/gathering-*` routes were
          unified under `/gatherings/:slug/...`. Hard cutover — no redirect shims. */}
      <Route path={`${routes.gatherings}/:slug`} element={<GatheringPage />} />
      <Route
        path={`${routes.gatherings}/:slug/recap`}
        element={
          demoMode ? (
            <GatheringRecapPage />
          ) : (
            <GatheringComingSoon variant="recap" />
          )
        }
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
        element={
          demoMode ? <ManageGatheringPage /> : <GatheringManageComingSoon />
        }
      />
      <Route
        path={`${routes.gatherings}/:slug/photos`}
        element={<GatheringPhotosPage />}
      />
      <Route
        path={`${routes.gatherings}/:slug/co-host-invite`}
        element={
          demoMode ? <CoHostInvitePage /> : <GatheringComingSoon variant="cohost" />
        }
      />
      <Route
        path={routes.event}
        element={demoMode ? <EventPage /> : <GatheringComingSoon variant="event" />}
      />
      <Route
        path={routes.rsvp}
        element={demoMode ? <RsvpPage /> : <GatheringComingSoon variant="rsvp" />}
      />
      <Route
        path={routes.rsvpTicket}
        element={demoMode ? <RsvpPage /> : <GatheringComingSoon variant="rsvp" />}
      />
      <Route path={routes.host} element={<HostPage />} />
      <Route path={routes.createGathering} element={<CreateGatheringPage />} />
      <Route path={routes.gatherings} element={<Navigate to={routes.events} replace />} />
    </>
  );
}

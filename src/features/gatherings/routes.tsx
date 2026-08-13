import { Navigate, Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";
import { GatheringComingSoon } from "./GatheringComingSoon";

const GatheringPage = lazyNamed(() => import("./GatheringPage"), "GatheringPage");
const GatheringRecapPage = lazyNamed(() => import("./GatheringRecapPage"), "GatheringRecapPage");
const GatheringCancelledPage = lazyNamed(() => import("./GatheringCancelledPage"), "GatheringCancelledPage");
const GatheringDashboardPage = lazyNamed(() => import("./GatheringDashboardPage"), "GatheringDashboardPage");
const ManageGatheringPage = lazyNamed(() => import("./ManageGatheringPage"), "ManageGatheringPage");
const GatheringPhotosPage = lazyNamed(() => import("./GatheringPhotosPage"), "GatheringPhotosPage");
const CoHostInvitePage = lazyNamed(() => import("./CoHostInvitePage"), "CoHostInvitePage");
const EventPage = lazyNamed(() => import("./EventPage"), "EventPage");
const RsvpPage = lazyNamed(() => import("./RsvpPage"), "RsvpPage");
const RsvpRedirect = lazyNamed(() => import("./RsvpRedirect"), "RsvpRedirect");
const HostPage = lazyNamed(() => import("./HostPage"), "HostPage");
const CreateGatheringPage = lazyNamed(() => import("./CreateGatheringPage"), "CreateGatheringPage");

/** The gatherings surface: calendar, events, a gathering's detail + management
 *  sub-pages, RSVP, hosting, and the gatherings index.
 *
 *  RSVP (`/rsvp`, `/rsvp-ticket`), the recap, and the `/manage` dashboard are
 *  now really wired: each resolves the real event off the route (or, for RSVP,
 *  the `?event=` slug) and drives the existing rsvp / un-rsvp / update / cancel /
 *  cohost / attach-photo hooks against that real id, keeping its colocated
 *  `*.data.ts` mock as the demo fallback.
 *
 *  Two prototypes stay demo-only and resolve to an honest coming-soon in LIVE
 *  mode: the standalone `/event` detail and the co-host invite. The `/event`
 *  page is pinned to a single mock event with no live subject, and the co-host
 *  invite needs a net-new backend invite→accept entity (out of scope this pass),
 *  so neither has a real id a live write could target. The real event surface is
 *  `/gatherings/:slug` (really wired); every other route here is really wired
 *  too. */
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
      {/* Really wired: the recap resolves the real event off `:slug` and, in
          live mode, attaches uploads to it + lists its real photos. Demo keeps
          the full static recap prototype. */}
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
      {/* Really wired: manage resolves the real event off `:slug` and drives
          update / cancel / attendees / cohost / invite against it (organizer-
          gated server-side). Demo keeps the static dashboard prototype. */}
      <Route
        path={`${routes.gatherings}/:slug/manage`}
        element={<ManageGatheringPage />}
      />
      <Route
        path={`${routes.gatherings}/:slug/photos`}
        element={<GatheringPhotosPage />}
      />
      {/* DEFERRED — stays gated in live. Unlike RSVP / recap / manage, a real
          co-host invite needs a net-new backend entity + migration (an
          invite → accept flow); there is no existing endpoint to target, so a
          live write would have nowhere to go. Out of scope this pass. */}
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
      {/* RSVP is now an action INSIDE the gathering detail (GatheringRsvpControl),
          so the standalone confirmation page is retired in LIVE: `/rsvp` and
          `/rsvp-ticket` redirect to the originating gathering (`?event=<slug>`)
          or the events board. Demo keeps the static reading-group confirmation. */}
      <Route
        path={routes.rsvp}
        element={demoMode ? <RsvpPage /> : <RsvpRedirect />}
      />
      <Route
        path={routes.rsvpTicket}
        element={demoMode ? <RsvpPage /> : <RsvpRedirect />}
      />
      <Route path={routes.host} element={<HostPage />} />
      <Route path={routes.createGathering} element={<CreateGatheringPage />} />
      <Route path={routes.gatherings} element={<Navigate to={routes.events} replace />} />
    </>
  );
}

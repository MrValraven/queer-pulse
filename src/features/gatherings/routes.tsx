import { Navigate, Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const GatheringPage = lazyNamed(
  () => import("./GatheringPage"),
  "GatheringPage",
  `${routes.gatherings}/:slug`,
);
const GatheringRecapPage = lazyNamed(
  () => import("./GatheringRecapPage"),
  "GatheringRecapPage",
);
const GatheringCancelledPage = lazyNamed(
  () => import("./GatheringCancelledPage"),
  "GatheringCancelledPage",
);
const GatheringDashboardPage = lazyNamed(
  () => import("./GatheringDashboardPage"),
  "GatheringDashboardPage",
);
const ManageGatheringPage = lazyNamed(
  () => import("./ManageGatheringPage"),
  "ManageGatheringPage",
);
const GatheringPhotosPage = lazyNamed(
  () => import("./GatheringPhotosPage"),
  "GatheringPhotosPage",
);
const CoHostInvitePage = lazyNamed(
  () => import("./CoHostInvitePage"),
  "CoHostInvitePage",
);
const RsvpPage = lazyNamed(() => import("./RsvpPage"), "RsvpPage");
const RsvpRedirect = lazyNamed(() => import("./RsvpRedirect"), "RsvpRedirect");
const HostPage = lazyNamed(() => import("./HostPage"), "HostPage");
const CreateGatheringPage = lazyNamed(
  () => import("./CreateGatheringPage"),
  "CreateGatheringPage",
);

/** The gatherings surface: calendar, events, a gathering's detail + management
 *  sub-pages, RSVP, hosting, and the gatherings index.
 *
 *  RSVP (`/rsvp`), the recap, the `/manage` dashboard, and the cohost invite
 *  are all really wired: each resolves the real event/invite off the route
 *  (or, for RSVP, the `?event=` slug) and drives the existing rsvp / un-rsvp /
 *  update / cancel / cohost / attach-photo hooks against that real id, keeping
 *  its colocated
 *
 *  The real event surface is `/gatherings/:slug`; every route here is really
 *  wired. The standalone `/event` prototype detail was retired and now
 *  redirects to the events board. */
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
      <Route
        path={`${routes.gatherings}/:slug/co-host-invite/:inviteId`}
        element={<CoHostInvitePage />}
      />
      {/* The standalone `/event` prototype detail page is retired: it was
          pinned to a single mock gathering with no live subject, and the real
          detail surface is `/gatherings/:slug`. `/event` now redirects to the
          events board (see `LEGACY_REDIRECTS` in `routes.redirects.data.ts`). */}
      {/* RSVP is now an action INSIDE the gathering detail (GatheringRsvpControl),
          so the standalone confirmation page is retired in LIVE: `/rsvp`
          redirects to the originating gathering (`?event=<slug>`) or the
          events board. Demo keeps the static reading-group confirmation. The
          ticket itself lives in EventTicketModal (My Events), not a route. */}
      <Route
        path={routes.rsvp}
        element={demoMode ? <RsvpPage /> : <RsvpRedirect />}
      />
      <Route path={routes.host} element={<HostPage />} />
      <Route path={routes.createGathering} element={<CreateGatheringPage />} />
      <Route
        path={routes.gatherings}
        element={<Navigate to={routes.events} replace />}
      />
    </>
  );
}

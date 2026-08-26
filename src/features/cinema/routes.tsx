import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";

const CinemaPage = lazyNamed(() => import("./CinemaPage"), "CinemaPage");
const CinemaBrowsePage = lazyNamed(
  () => import("./CinemaBrowsePage"),
  "CinemaBrowsePage",
);
const CinemaCollectionsPage = lazyNamed(
  () => import("./CinemaCollectionsPage"),
  "CinemaCollectionsPage",
);
const CinemaCollectionPage = lazyNamed(
  () => import("./CinemaCollectionPage"),
  "CinemaCollectionPage",
);
const CinemaMembershipPage = lazyNamed(
  () => import("./CinemaMembershipPage"),
  "CinemaMembershipPage",
);
const WatchPage = lazyNamed(() => import("./WatchPage"), "WatchPage");
const CinemaFilmmakerPage = lazyNamed(
  () => import("./CinemaFilmmakerPage"),
  "CinemaFilmmakerPage",
);
const CinemaCuratorPage = lazyNamed(
  () => import("./CinemaCuratorPage"),
  "CinemaCuratorPage",
);
const CinemaAboutPage = lazyNamed(
  () => import("./CinemaAboutPage"),
  "CinemaAboutPage",
);
const CinemaSubmitPage = lazyNamed(
  () => import("./CinemaSubmitPage"),
  "CinemaSubmitPage",
);
const CinemaShortsPage = lazyNamed(
  () => import("./CinemaShortsPage"),
  "CinemaShortsPage",
);
const CinemaOpenCallsPage = lazyNamed(
  () => import("./CinemaOpenCallsPage"),
  "CinemaOpenCallsPage",
);
const CinemaRightsPage = lazyNamed(
  () => import("./CinemaRightsPage"),
  "CinemaRightsPage",
);
const FilmPage = lazyNamed(() => import("./FilmPage"), "FilmPage");
const CinemaComingSoon = lazyNamed(
  () => import("./CinemaComingSoon"),
  "CinemaComingSoon",
);

/** The cinema: browsing, collections, membership, watching, filmmaker/curator
 *  pages, submissions, shorts, open calls, rights, and a film's detail page.
 *
 *  Cinema is not launched: the backend ships
 *  `launchedFeatures.cinema = { launched: false }`, so every `/cinema/*` call
 *  404s, and the pages below are fabricated `*.data.ts` content: a EUR 7 and
 *  EUR 20 per month membership with no payment path behind it, a public ledger
 *  quoting money paid to filmmakers, and a 142-film catalogue that is empty.
 *  So in LIVE mode (`demoMode === false`) the entire `/cinema/*` surface
 *  resolves to a single honest not-launched page, the same treatment
 *  `studioRoutes` gives Studio. Demo mode keeps the full mock experience.
 *
 *  To launch: flip `launchedFeatures.cinema.launched` in the backend (which
 *  makes the MUX_* env vars mandatory at boot) and delete the `!demoMode`
 *  branch below. CON-03. */
export function cinemaRoutes(demoMode: boolean) {
  if (!demoMode) {
    // `/film` is the one cinema page registered outside the `/cinema` prefix,
    // so it needs its own entry or it would fall through to the 404 page.
    return (
      <>
        <Route path="/cinema/*" element={<CinemaComingSoon />} />
        <Route path={routes.film} element={<CinemaComingSoon />} />
      </>
    );
  }
  return (
    <>
      <Route path={routes.cinema} element={<CinemaPage />} />
      <Route path="/cinema/browse" element={<CinemaBrowsePage />} />
      <Route
        path={routes.cinemaCollections}
        element={<CinemaCollectionsPage />}
      />
      <Route
        path={`${routes.cinemaCollections}/:slug`}
        element={<CinemaCollectionPage />}
      />
      <Route
        path={routes.cinemaMembership}
        element={<CinemaMembershipPage />}
      />
      <Route path={routes.cinemaWatch} element={<WatchPage />} />
      <Route
        path={`${routes.cinemaFilmmaker}/:slug`}
        element={<CinemaFilmmakerPage />}
      />
      <Route
        path={`${routes.cinemaCurator}/:slug`}
        element={<CinemaCuratorPage />}
      />
      <Route path={routes.cinemaAbout} element={<CinemaAboutPage />} />
      <Route path={routes.cinemaSubmit} element={<CinemaSubmitPage />} />
      <Route path={routes.cinemaShorts} element={<CinemaShortsPage />} />
      <Route path={routes.cinemaOpenCalls} element={<CinemaOpenCallsPage />} />
      <Route path={routes.cinemaRights} element={<CinemaRightsPage />} />
      <Route path={routes.film} element={<FilmPage />} />
    </>
  );
}

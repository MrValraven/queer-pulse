import { Navigate, Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";
import {
  QUIZSHOW_EDIT_ROUTE,
  QUIZSHOW_GAME_PRINT_ROUTE,
  QUIZSHOW_GAME_REMOTE_ROUTE,
  QUIZSHOW_GAME_ROUTE,
  QUIZSHOW_GAME_SCREEN_ROUTE,
  QUIZSHOW_GAMES_ROUTE,
  QUIZSHOW_HELPER_PAIR_ROUTE,
  QUIZSHOW_HELPER_REMOTE_ROUTE,
  QUIZSHOW_PLAY_CODE_ROUTE,
  QUIZSHOW_PRINT_ROUTE,
  QUIZSHOW_REMOTE_ROUTE,
  QUIZSHOW_SCREEN_ROUTE,
  QUIZSHOW_TV_ROUTE,
} from "./quizshowPaths";
import { PageKeyedByParam } from "./PageKeyedByParam";

const QuizshowScreenPage = lazyNamed(
  () => import("./screen/QuizshowScreenPage"),
  "QuizshowScreenPage",
  QUIZSHOW_SCREEN_ROUTE,
);
const QuizshowRemotePage = lazyNamed(
  () => import("./remote/QuizshowRemotePage"),
  "QuizshowRemotePage",
  QUIZSHOW_REMOTE_ROUTE,
);
const QuizshowEventStudioPage = lazyNamed(
  () => import("./event/QuizshowEventStudioPage"),
  "QuizshowEventStudioPage",
  QUIZSHOW_EDIT_ROUTE,
);
const QuizshowGamePage = lazyNamed(
  () => import("./games/QuizshowGamePage"),
  "QuizshowGamePage",
  QUIZSHOW_GAME_ROUTE,
);
const QuizshowGameScreenPage = lazyNamed(
  () => import("./screen/QuizshowGameScreenPage"),
  "QuizshowGameScreenPage",
  QUIZSHOW_GAME_SCREEN_ROUTE,
);
const QuizshowGameRemotePage = lazyNamed(
  () => import("./remote/QuizshowGameRemotePage"),
  "QuizshowGameRemotePage",
  QUIZSHOW_GAME_REMOTE_ROUTE,
);
const QuizshowTvPage = lazyNamed(
  () => import("./screen/QuizshowTvPage"),
  "QuizshowTvPage",
  QUIZSHOW_TV_ROUTE,
);
const QuizshowHelperPairPage = lazyNamed(
  () => import("./remote/QuizshowHelperPairPage"),
  "QuizshowHelperPairPage",
  QUIZSHOW_HELPER_PAIR_ROUTE,
);
const QuizshowHelperRemotePage = lazyNamed(
  () => import("./remote/QuizshowHelperRemotePage"),
  "QuizshowHelperRemotePage",
  QUIZSHOW_HELPER_REMOTE_ROUTE,
);
const QuizshowEventPrintPage = lazyNamed(
  () => import("./builder/QuizshowPrintPage"),
  "QuizshowEventPrintPage",
  QUIZSHOW_PRINT_ROUTE,
);
const QuizshowGamePrintPage = lazyNamed(
  () => import("./builder/QuizshowPrintPage"),
  "QuizshowGamePrintPage",
  QUIZSHOW_GAME_PRINT_ROUTE,
);
// One lazy import serves both `/play` (asks for a code) and `/play/:code`.
const QuizshowPlayPage = lazyNamed(
  () => import("./player/QuizshowPlayPage"),
  "QuizshowPlayPage",
  [routes.play, QUIZSHOW_PLAY_CODE_ROUTE],
);

/**
 * Pulse Live (quizshow): the presenter screen and the host's remote under an
 * event or a game, the event's quiz editor, the game pages (each one the
 * game's editor), the print sheets, the TV pairing page, the helper remote and
 * the player's `/play` pages.
 *
 * Public (reachable signed out, see `authGate.ts`): `/play/:code`, which shows
 * its own pre-sign-in card, and `/play/tv`, which a TV opens with no account.
 * Members only: `/play`, My games under `/play/games` (both print sheets
 * included), the helper pairing page `/play/remote`, its remote
 * `/play/remote/:sessionId`, and everything under an event's `quizshow` path
 * (the event print sheet too). Until launch, `AppRoutes` (`app/routes.tsx`)
 * sends a signed-in member for whom `useIsQuizshowVisible` is false from the
 * hosting paths alone (`isQuizshowHostingPath` in `authGate.ts`: the event's
 * quizshow pages and `/play/games` with everything under it) to the roadmap.
 * `/play`, `/play/:code`, `/play/tv` and `/play/remote` stay open to every
 * signed-in member, so anyone can join a game or help run one.
 *
 * Every static `/play/*` path is registered before `/play/:code`. React Router
 * ranks routes by specificity, so the order is for the reader.
 */
export function quizshowRoutes() {
  return (
    <>
      <Route
        path={QUIZSHOW_SCREEN_ROUTE}
        element={
          <PageKeyedByParam paramName="slug" page={QuizshowScreenPage} />
        }
      />
      <Route
        path={QUIZSHOW_REMOTE_ROUTE}
        element={
          <PageKeyedByParam paramName="slug" page={QuizshowRemotePage} />
        }
      />
      <Route
        path={QUIZSHOW_EDIT_ROUTE}
        element={
          <PageKeyedByParam paramName="slug" page={QuizshowEventStudioPage} />
        }
      />
      <Route
        path={QUIZSHOW_GAMES_ROUTE}
        element={<Navigate to={routes.play} replace />}
      />
      <Route
        path={QUIZSHOW_GAME_ROUTE}
        element={
          <PageKeyedByParam paramName="gameId" page={QuizshowGamePage} />
        }
      />
      <Route
        path={QUIZSHOW_GAME_SCREEN_ROUTE}
        element={
          <PageKeyedByParam paramName="gameId" page={QuizshowGameScreenPage} />
        }
      />
      <Route
        path={QUIZSHOW_GAME_REMOTE_ROUTE}
        element={
          <PageKeyedByParam paramName="gameId" page={QuizshowGameRemotePage} />
        }
      />
      <Route
        path={QUIZSHOW_PRINT_ROUTE}
        element={
          <PageKeyedByParam paramName="slug" page={QuizshowEventPrintPage} />
        }
      />
      <Route
        path={QUIZSHOW_GAME_PRINT_ROUTE}
        element={
          <PageKeyedByParam paramName="gameId" page={QuizshowGamePrintPage} />
        }
      />
      <Route path={QUIZSHOW_TV_ROUTE} element={<QuizshowTvPage />} />
      <Route
        path={QUIZSHOW_HELPER_PAIR_ROUTE}
        element={<QuizshowHelperPairPage />}
      />
      <Route
        path={QUIZSHOW_HELPER_REMOTE_ROUTE}
        element={
          <PageKeyedByParam
            paramName="sessionId"
            page={QuizshowHelperRemotePage}
          />
        }
      />
      <Route
        path={routes.play}
        element={<PageKeyedByParam paramName="code" page={QuizshowPlayPage} />}
      />
      <Route
        path={QUIZSHOW_PLAY_CODE_ROUTE}
        element={<PageKeyedByParam paramName="code" page={QuizshowPlayPage} />}
      />
    </>
  );
}

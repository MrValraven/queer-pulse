import { Navigate, Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";
import {
  QUIZSHOW_GAME_REMOTE_ROUTE,
  QUIZSHOW_GAME_ROUTE,
  QUIZSHOW_GAME_SCREEN_ROUTE,
  QUIZSHOW_GAMES_ROUTE,
  QUIZSHOW_PLAY_CODE_ROUTE,
  QUIZSHOW_REMOTE_ROUTE,
  QUIZSHOW_SCREEN_ROUTE,
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
// One lazy import serves both `/play` (asks for a code) and `/play/:code`.
const QuizshowPlayPage = lazyNamed(
  () => import("./player/QuizshowPlayPage"),
  "QuizshowPlayPage",
  [routes.play, QUIZSHOW_PLAY_CODE_ROUTE],
);

/**
 * Pulse Live (quizshow): the presenter screen and the host's remote under an
 * event or a game, the game pages, and the player's `/play` pages. The player
 * routes are members only (gated in `authGate.ts`). Until launch, `AppRoutes`
 * (`app/routes.tsx`) sends a signed-in member for whom `useIsQuizshowVisible`
 * is false from the hosting paths alone (`isQuizshowHostingPath` in
 * `authGate.ts`: the event screen and remote, `/play/games` and everything
 * under it) to the roadmap. `/play` and `/play/:code` stay open to every
 * signed-in member, so anyone can join a game they were given a code for.
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

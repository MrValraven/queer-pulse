import { Route } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { lazyNamed } from "../../app/routeHelpers";
import {
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
// One lazy import serves both `/play` (asks for a code) and `/play/:code`.
const QuizshowPlayPage = lazyNamed(
  () => import("./player/QuizshowPlayPage"),
  "QuizshowPlayPage",
  [routes.play, QUIZSHOW_PLAY_CODE_ROUTE],
);

/**
 * Pulse Live (quizshow): the presenter screen and the host's remote under an
 * event, and the player's `/play` pages. The player routes are members only
 * (gated in `authGate.ts`). Until launch, `AppRoutes` (`app/routes.tsx`) sends
 * a signed-in member for whom `useIsQuizshowVisible` is false from every route
 * here to the roadmap (`isQuizshowPath` in `authGate.ts`), so only early-access
 * members, demo and `pnpm dev` reach these pages.
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

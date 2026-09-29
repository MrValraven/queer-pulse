import { Route } from "react-router-dom";
import { lazyNamed } from "../../app/routeHelpers";
import { routes } from "../../app/routeMap";

const GoTogetherQuestionnairePage = lazyNamed(
  () => import("./questionnaire/GoTogetherQuestionnairePage"),
  "GoTogetherQuestionnairePage",
);
const GoTogetherFeedbackPage = lazyNamed(
  () => import("./feedback/GoTogetherFeedbackPage"),
  "GoTogetherFeedbackPage",
);

/** The Go together surface: the standalone friend-match questionnaire and the
 *  day-after meet-again feedback prompt. Both are reached from a gathering's
 *  card or a notification, so neither route carries a `:slug`. */
export function goTogetherRoutes() {
  return (
    <>
      <Route
        path={routes.goTogetherQuestionnaire}
        element={<GoTogetherQuestionnairePage />}
      />
      <Route
        path={`${routes.goTogetherFeedback}/:groupId`}
        element={<GoTogetherFeedbackPage />}
      />
    </>
  );
}

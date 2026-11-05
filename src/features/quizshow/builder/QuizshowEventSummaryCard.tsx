import { useId, useMemo } from "react";
import { FiEdit3 } from "react-icons/fi";
import type { QuizshowQuizResponse } from "../../../shared/contracts/quizshow";
import {
  Button,
  LoadErrorState,
  SkeletonLine,
} from "../../../shared/components/ui";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useEvent } from "../../gatherings/api/useEvent";
import { quizshowErrorCodeOf, quizshowErrorKeyOf } from "../api/quizshowErrors";
import { useQuizshowQuiz } from "../api/useQuizshowQuiz";
import { QuizshowResultsCard } from "../event/QuizshowResultsCard";
import { QuizshowGameCover } from "../games/QuizshowGameCover";
import { quizshowEditPath } from "../quizshowPaths";
import { eventScope, type QuizshowEventScope } from "../quizshowScope";
import {
  questionCountOf,
  summaryStatusOf,
  useLastPresent,
  useSavedQuizTryOut,
} from "./quizshowEventSummary";
import { quizshowProblemsFromServer } from "./quizshowValidation";
import { QuizshowLiveSessionPanel } from "./QuizshowLiveSessionPanel";
import { QuizshowOpenLobbyButton } from "./QuizshowOpenLobbyButton";
import { QuizshowTryItButton } from "./QuizshowTryItButton";
import styles from "./QuizshowEventSummaryCard.module.css";

const NO_PICKED_PREVIEWS: ReadonlyMap<string, string> = new Map();

function QuizshowEventSummaryLoaded({
  scope,
  data,
}: {
  scope: QuizshowEventScope;
  data: QuizshowQuizResponse;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  // The event's own read, for the cover of a quiz with no title of its own.
  const eventTitle = useEvent(scope.eventSlug).data?.gathering.title ?? "";
  const { quiz, isAdultsEvent } = data;
  const tryOut = useSavedQuizTryOut(quiz, isAdultsEvent);
  const lobbyProblemCount = quizshowProblemsFromServer(data.problems).length;
  const status = summaryStatusOf(data, lobbyProblemCount, t);
  const shownLiveSession = useLastPresent(data.liveSession);
  const hasShownResults = useLastPresent(data.hasResults ? true : null);
  const coverTitle = quiz?.title.trim() ? quiz.title : eventTitle;

  return (
    <div className={styles.tab}>
      <section
        className={styles.card}
        aria-labelledby={headingId}
        data-has-cover={quiz !== null || undefined}
      >
        {/* No quiz yet has no slide to show: the card leads with the way in. */}
        {quiz !== null && (
          <div className={styles.cover}>
            <QuizshowGameCover
              title={coverTitle}
              roundCount={quiz.rounds.length}
              questionCount={questionCountOf(quiz)}
              isAdultsOnly={isAdultsEvent}
            />
          </div>
        )}
        <div className={styles.body}>
          <div className={styles.text}>
            <h2 id={headingId} className={styles.heading}>
              {t(
                quiz
                  ? "quizshow:builder.summary.title"
                  : "quizshow:builder.empty.title",
              )}
            </h2>
            <p className={styles.lead}>
              {t(
                quiz
                  ? "quizshow:builder.summary.lead"
                  : "quizshow:builder.empty.body",
              )}
            </p>
          </div>
          {status !== null && (
            <p className={styles.status} data-tone={status.tone} role="status">
              <span aria-hidden className={styles.statusDot} />
              {status.text}
            </p>
          )}
          <div className={styles.actions}>
            <Button to={quizshowEditPath(scope.eventSlug)}>
              <FiEdit3 aria-hidden />
              {t("quizshow:builder.summary.openEditor")}
            </Button>
            {tryOut.draft !== null && (
              <QuizshowTryItButton
                draft={tryOut.draft}
                pickedPreviewUrls={NO_PICKED_PREVIEWS}
                problems={tryOut.problems}
              />
            )}
            {/* An open game has its own panel below, with the screen and the remote. */}
            {quiz !== null && data.liveSession === null && (
              <QuizshowOpenLobbyButton
                scope={scope}
                appearance="secondary"
                isBlocked={lobbyProblemCount > 0}
                blockedReason={t("quizshow:builder.summary.lobbyBlocked")}
              />
            )}
          </div>
        </div>
      </section>
      <Collapse isOpen={data.liveSession !== null}>
        {shownLiveSession && (
          <QuizshowLiveSessionPanel
            scope={scope}
            liveSession={shownLiveSession}
          />
        )}
      </Collapse>
      {/* Mounted once the event keeps results, so an event without them asks for none. */}
      <Collapse isOpen={data.hasResults}>
        {hasShownResults && <QuizshowResultsCard scope={scope} canDelete />}
      </Collapse>
    </div>
  );
}

/**
 * The Manage page's Live game tab: a summary of the event's quiz in the app's
 * cream style. The quiz's title slide, the lobby state, Open the editor (the
 * full-screen studio), Try it and Open lobby, the open game's panel, and the
 * kept results.
 */
export function QuizshowEventSummaryCard({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const scope = useMemo(() => eventScope(slug), [slug]);
  const query = useQuizshowQuiz(scope, { isEnabled: true });
  if (query.data) {
    return <QuizshowEventSummaryLoaded scope={scope} data={query.data} />;
  }
  if (query.isPending) {
    return (
      <div className={styles.skeleton} aria-hidden>
        <SkeletonLine width="100%" height={180} />
      </div>
    );
  }
  return (
    <LoadErrorState
      headingLevel={2}
      title={t(quizshowErrorKeyOf(quizshowErrorCodeOf(query.error)))}
      description={t("quizshow:builder.loadError")}
      onRetry={() => void query.refetch()}
      isRetrying={query.isRefetching}
    />
  );
}

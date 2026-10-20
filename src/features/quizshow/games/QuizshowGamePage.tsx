import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, m } from "motion/react";
import { FiSearch } from "react-icons/fi";
import { useParams, useSearchParams } from "react-router-dom";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { routes } from "../../../app/routeMap";
import { ApiError } from "../../../shared/api/client";
import { PageShell } from "../../../shared/components/layout";
import {
  EmptyState,
  LoadErrorState,
  SkeletonLine,
} from "../../../shared/components/ui";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { PageMeta } from "../../../shared/seo/PageMeta";
import { useQuizshowQuiz } from "../api/useQuizshowQuiz";
import { QuizshowBuilder } from "../builder/QuizshowBuilder";
import type { QuizshowImportPicker } from "../builder/QuizshowImportButtons";
import { QuizshowResultsCard } from "../event/QuizshowResultsCard";
import {
  QUIZSHOW_GAME_START_COPY,
  QUIZSHOW_GAME_START_PARAM,
} from "../quizshowPaths";
import { gameScope } from "../quizshowScope";
import { QuizshowGameHeader } from "./QuizshowGameHeader";
import styles from "./QuizshowGamePage.module.css";

type GameBodyKey = "loading" | "missing" | "error" | "loaded";

/** What the header shows: the saved title and the 18+ flag. */
interface GameHeading {
  title: string;
  isAdultsOnly: boolean;
}

/**
 * Reads `?start=copy` once, then drops it from the address with `replace`,
 * so a reload or a Back press never opens the source picker a second time.
 * The page clears it when a delete starts, so the builder a failed delete
 * brings back never reopens the picker.
 */
function useInitialImportPicker(): [QuizshowImportPicker | null, () => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const [initialImportPicker, setInitialImportPicker] =
    useState<QuizshowImportPicker | null>(() =>
      searchParams.get(QUIZSHOW_GAME_START_PARAM) === QUIZSHOW_GAME_START_COPY
        ? "sources"
        : null,
    );
  const hasStartParam = searchParams.has(QUIZSHOW_GAME_START_PARAM);
  useEffect(() => {
    if (!hasStartParam) return;
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete(QUIZSHOW_GAME_START_PARAM);
        return next;
      },
      { replace: true },
    );
  }, [hasStartParam, setSearchParams]);
  const clearInitialImportPicker = useCallback(
    () => setInitialImportPicker(null),
    [],
  );
  return [initialImportPicker, clearInitialImportPicker];
}

/** A game the member owns at `/play/games/:gameId`: its quiz, lobby and kept results. */
export function QuizshowGamePage() {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const fade = { duration: reducedMotion ? 0 : 0.2 };
  const { gameId = "" } = useParams();
  const scope = useMemo(() => gameScope(gameId), [gameId]);
  const [initialImportPicker, clearInitialImportPicker] =
    useInitialImportPicker();
  // Set once the member confirms Delete game. The builder (and its unsaved
  // changes guard) and the results card leave at once, the game read stops,
  // and the header keeps the title it had until the page navigates away.
  const [leavingGame, setLeavingGame] = useState<GameHeading | null>(null);
  const query = useQuizshowQuiz(scope, { isEnabled: leavingGame === null });
  const gameData = query.data;
  const isNotFound =
    query.error instanceof ApiError && query.error.status === 404;
  const heading: GameHeading | null =
    leavingGame ??
    (gameData
      ? {
          title: gameData.quiz?.title ?? "",
          isAdultsOnly: gameData.isAdultsEvent,
        }
      : null);

  let bodyKey: GameBodyKey;
  let body: ReactNode;
  if (heading) {
    bodyKey = "loaded";
    body = (
      <>
        <QuizshowGameHeader
          gameId={gameId}
          title={heading.title}
          isAdultsOnly={heading.isAdultsOnly}
          onDeleteStart={() => {
            // The builder mounts again if the delete fails: the picker is spent by then.
            clearInitialImportPicker();
            setLeavingGame(heading);
          }}
          onDeleteFailed={() => setLeavingGame(null)}
        />
        {leavingGame === null && gameData ? (
          <>
            <QuizshowBuilder
              scope={scope}
              eventStartAt={null}
              initialImportPicker={initialImportPicker}
            />
            <Collapse isOpen={gameData.hasResults}>
              <div className={styles.results}>
                <QuizshowResultsCard scope={scope} canDelete />
              </div>
            </Collapse>
          </>
        ) : (
          // The builder leaves without an exit fade on purpose: its guard
          // must be gone before the delete resolves. The placeholder fades in.
          <m.div
            className={styles.skeleton}
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={fade}
          >
            <SkeletonLine width="100%" height={200} />
          </m.div>
        )}
      </>
    );
  } else if (query.isPending) {
    bodyKey = "loading";
    body = (
      <div className={styles.skeleton} aria-hidden>
        <SkeletonLine width="24%" height={14} />
        <SkeletonLine width="56%" height={40} />
        <SkeletonLine width="100%" height={200} />
      </div>
    );
  } else if (isNotFound) {
    bodyKey = "missing";
    body = (
      <EmptyState
        icon={<FiSearch fill="none" />}
        headingLevel={2}
        title={t("quizshow:errors.game_not_found")}
        action={{ label: t("quizshow:game.back"), to: routes.play }}
      />
    );
  } else {
    bodyKey = "error";
    body = (
      <LoadErrorState
        headingLevel={2}
        title={t("quizshow:game.loadError")}
        onRetry={() => void query.refetch()}
        isRetrying={query.isRefetching}
      />
    );
  }

  return (
    <PageShell>
      <PageMeta title={t("quizshow:game.metaTitle")} noIndex />
      <div className={styles.page}>
        <div className="wrap">
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={bodyKey}
              className={styles.body}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fade}
            >
              {body}
            </m.div>
          </AnimatePresence>
        </div>
      </div>
    </PageShell>
  );
}

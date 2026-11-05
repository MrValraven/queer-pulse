import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiAward, FiCopy, FiTrash2 } from "react-icons/fi";
import { useParams, useSearchParams } from "react-router-dom";
import { routes } from "../../../app/routeMap";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { PageMeta } from "../../../shared/seo/PageMeta";
import { useQuizshowQuiz } from "../api/useQuizshowQuiz";
import {
  QUIZSHOW_GAME_START_COPY,
  QUIZSHOW_GAME_START_PARAM,
} from "../quizshowPaths";
import { gameScope } from "../quizshowScope";
import { QuizshowBackdrop } from "../stage/QuizshowBackdrop";
import {
  QuizshowStudio,
  type QuizshowStudioMoreAction,
} from "../studio/QuizshowStudio";
import { QuizshowStudioDarkStamp } from "../studio/QuizshowStudioDarkStamp";
import { useQuizshowFramelessPage } from "../useQuizshowFramelessPage";
import { QuizshowGameResultsPanel } from "./QuizshowGameResultsPanel";
import { useQuizshowGameActions } from "./useQuizshowGameActions";
import styles from "./QuizshowGamePage.module.css";

const BACK_LINK = { to: routes.play, labelKey: "quizshow:game.back" };

/**
 * Reads `?start=copy` once, then drops it from the address with `replace`,
 * so a reload or a Back press never opens the source picker a second time.
 * The page clears it when a delete starts, so the studio a failed delete
 * brings back never reopens the picker.
 */
function useInitialImportPicker(): [boolean, () => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isInitialImportPicker, setIsInitialImportPicker] = useState(
    () =>
      searchParams.get(QUIZSHOW_GAME_START_PARAM) === QUIZSHOW_GAME_START_COPY,
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
    () => setIsInitialImportPicker(false),
    [],
  );
  return [isInitialImportPicker, clearInitialImportPicker];
}

/**
 * A game the member owns at `/play/games/:gameId`: its quiz in the studio,
 * with Show results, Duplicate game and Delete game in the studio's More
 * menu. The studio names a game that is gone or failed to load itself.
 */
export function QuizshowGamePage() {
  const { t } = useTranslation();
  // The studio and the leaving shell are both frameless; holding it here keeps the frame away between them.
  useQuizshowFramelessPage();
  const { gameId = "" } = useParams();
  const scope = useMemo(() => gameScope(gameId), [gameId]);
  const [isInitialImportPicker, clearInitialImportPicker] =
    useInitialImportPicker();
  // Set once the member confirms Delete game. The studio (and its unsaved
  // changes guard) leaves at once and this page's game read stops.
  const [isLeaving, setIsLeaving] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  // The same cache entry the studio reads, here only for whether results are kept.
  const query = useQuizshowQuiz(scope, { isEnabled: !isLeaving });
  const hasResults = query.data?.hasResults === true;
  // Deleted results close the panel, so it never reopens by itself when a later game keeps new ones.
  if (isResultsOpen && !hasResults) setIsResultsOpen(false);
  const gameActions = useQuizshowGameActions({
    gameId,
    onDeleteStart: () => {
      // The studio mounts again if the delete fails: the picker is spent by then.
      clearInitialImportPicker();
      setIsResultsOpen(false);
      setIsLeaving(true);
    },
    onDeleteFailed: () => setIsLeaving(false),
  });

  const moreActions: QuizshowStudioMoreAction[] = [
    ...(hasResults
      ? [
          {
            key: "results",
            labelKey: "quizshow:game.more.results",
            icon: FiAward,
            onSelect: () => setIsResultsOpen(true),
          },
        ]
      : []),
    {
      key: "duplicate",
      labelKey: "quizshow:game.duplicate",
      icon: FiCopy,
      onSelect: ({ saveFirst }) => void gameActions.duplicate(saveFirst),
    },
    {
      key: "delete",
      labelKey: "quizshow:game.delete",
      icon: FiTrash2,
      isDestructive: true,
      onSelect: gameActions.openDeleteConfirm,
    },
  ];

  return (
    <>
      <PageMeta title={t("quizshow:game.metaTitle")} noIndex />
      {isLeaving ? (
        // The studio leaves without an exit on purpose: its guard must be
        // gone before the delete resolves. The dark ground stays meanwhile.
        <div
          className={styles.leaving}
          data-theme="dark"
          data-qs-theme="dark"
          aria-busy="true"
        >
          <QuizshowBackdrop variant="studio" />
        </div>
      ) : (
        <QuizshowStudio
          scope={scope}
          backLink={BACK_LINK}
          moreActions={moreActions}
          initialImportPicker={isInitialImportPicker}
        >
          <AnimatePresence>
            {isResultsOpen && (
              <QuizshowGameResultsPanel
                key="game-results"
                scope={scope}
                onClose={() => setIsResultsOpen(false)}
              />
            )}
          </AnimatePresence>
        </QuizshowStudio>
      )}
      <AnimatePresence>
        {gameActions.isDeleteConfirmOpen && (
          <ConfirmDialog
            key="delete-game"
            open
            tone="destructive"
            loading={gameActions.isDeletePending}
            title={t("quizshow:game.deleteTitle")}
            description={t("quizshow:game.deleteBody")}
            confirmLabel={t("quizshow:game.delete")}
            cancelLabel={t("quizshow:common.cancel")}
            onConfirm={() => void gameActions.confirmDelete()}
            onClose={gameActions.closeDeleteConfirm}
          >
            <QuizshowStudioDarkStamp />
          </ConfirmDialog>
        )}
      </AnimatePresence>
    </>
  );
}

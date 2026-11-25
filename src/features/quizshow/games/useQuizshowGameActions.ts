import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";
import { routes } from "../../../app/routeMap";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { quizshowErrorCodeOf, quizshowErrorKeyOf } from "../api/quizshowErrors";
import {
  useDeleteQuizshowGame,
  useDuplicateQuizshowGame,
} from "../api/useQuizshowGames";
import { QUIZSHOW_GAME_START_PARAM, quizshowGamePath } from "../quizshowPaths";

/** `?start=open` on a game page: open the open-lobby dialog once (item 60). */
export const QUIZSHOW_GAME_START_OPEN = "open";

/** The copy's address after Duplicate and open: its page opens the lobby dialog once. */
function gamePathOpeningLobby(gameId: string): string {
  return `${quizshowGamePath(gameId)}?${QUIZSHOW_GAME_START_PARAM}=${QUIZSHOW_GAME_START_OPEN}`;
}

/**
 * What the game page hands its results panel (item 60): the panel leads with
 * Duplicate and open, and an edit link inside it closes the panel. Null
 * outside a game page, so the event's results card shows neither.
 */
export interface QuizshowGameResultsActions {
  duplicateAndOpen: (saveFirst: () => Promise<string | null>) => void;
  isDuplicatePending: boolean;
  closeResults: () => void;
}

export const QuizshowGameResultsActionsContext =
  createContext<QuizshowGameResultsActions | null>(null);

export function useQuizshowGameResultsActions(): QuizshowGameResultsActions | null {
  return useContext(QuizshowGameResultsActionsContext);
}

/**
 * The game page's whole-game actions, Duplicate game, Duplicate and open and
 * Delete game, with the delete's confirm state. All live in the studio's More
 * menu; Duplicate and open also leads the results panel.
 */
export function useQuizshowGameActions({
  gameId,
  onDeleteStart,
  onDeleteFailed,
}: {
  gameId: string;
  /** The member confirmed Delete game: the page swaps the studio for its leaving shell. */
  onDeleteStart: () => void;
  /** The delete was refused: the page brings the studio back. */
  onDeleteFailed: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const duplicateGame = useDuplicateQuizshowGame();
  const deleteGame = useDeleteQuizshowGame();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  // True from the press until the copy is made, so the wait for the save never duplicates twice.
  const isDuplicatingRef = useRef(false);
  // The same span for the button: the save first, then the copy.
  const [isDuplicating, setIsDuplicating] = useState(false);
  const { mutateAsync: duplicateGameAsync } = duplicateGame;

  const showErrorToast = useCallback(
    (error: unknown) => {
      showToast(t(quizshowErrorKeyOf(quizshowErrorCodeOf(error))), "error");
    },
    [showToast, t],
  );

  /**
   * The server copies the saved game, so the studio lands its autosave
   * first and the last few seconds of edits come along. When the save does
   * not go through, the toast names why and nothing is copied. With
   * `shouldOpenLobby`, the copy's page opens its open-lobby dialog once.
   */
  const duplicate = useCallback(
    async (
      saveFirst: () => Promise<string | null>,
      options?: { shouldOpenLobby?: boolean },
    ) => {
      if (isDuplicatingRef.current) return;
      isDuplicatingRef.current = true;
      setIsDuplicating(true);
      try {
        const refusal = await saveFirst();
        if (refusal !== null) {
          showToast(refusal, "error");
          return;
        }
        const copy = await duplicateGameAsync(gameId);
        showToast(t("quizshow:game.duplicated"), "success");
        void navigate(
          options?.shouldOpenLobby
            ? gamePathOpeningLobby(copy.gameId)
            : quizshowGamePath(copy.gameId),
        );
      } catch (error) {
        showErrorToast(error);
      } finally {
        isDuplicatingRef.current = false;
        setIsDuplicating(false);
      }
    },
    [duplicateGameAsync, gameId, navigate, showErrorToast, showToast, t],
  );

  const duplicateAndOpen = useCallback(
    (saveFirst: () => Promise<string | null>) =>
      void duplicate(saveFirst, { shouldOpenLobby: true }),
    [duplicate],
  );

  const confirmDelete = async () => {
    // Commit the page's leaving shell now, before the delete resolves: the
    // studio and its unsaved changes guard unmount, so the navigation below
    // is never held by a leave prompt over a deleted game.
    flushSync(onDeleteStart);
    try {
      await deleteGame.mutateAsync(gameId);
    } catch (error) {
      onDeleteFailed();
      setIsDeleteConfirmOpen(false);
      showErrorToast(error);
      return;
    }
    // Leave in the same tick the delete resolves: the mutation has dropped
    // this game's queries, and a page still on screen would refetch the
    // deleted id and flash a not found state.
    setIsDeleteConfirmOpen(false);
    void navigate(routes.play, { replace: true });
    showToast(t("quizshow:game.deleted"), "success");
  };

  return {
    duplicate,
    duplicateAndOpen,
    isDuplicatePending: isDuplicating,
    isDeletePending: deleteGame.isPending,
    isDeleteConfirmOpen,
    openDeleteConfirm: () => setIsDeleteConfirmOpen(true),
    closeDeleteConfirm: () => setIsDeleteConfirmOpen(false),
    confirmDelete,
  };
}

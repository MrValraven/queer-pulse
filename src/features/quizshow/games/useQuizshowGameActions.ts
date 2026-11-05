import { useRef, useState } from "react";
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
import { quizshowGamePath } from "../quizshowPaths";

/**
 * The game page's two whole-game actions, Duplicate game and Delete game,
 * with the delete's confirm state. Both live in the studio's More menu.
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

  const showErrorToast = (error: unknown) => {
    showToast(t(quizshowErrorKeyOf(quizshowErrorCodeOf(error))), "error");
  };

  /**
   * The server copies the saved game, so the studio lands its autosave
   * first and the last few seconds of edits come along. When the save does
   * not go through, the toast names why and nothing is copied.
   */
  const duplicate = async (saveFirst: () => Promise<string | null>) => {
    if (isDuplicatingRef.current || duplicateGame.isPending) return;
    isDuplicatingRef.current = true;
    try {
      const refusal = await saveFirst();
      if (refusal !== null) {
        showToast(refusal, "error");
        return;
      }
      const copy = await duplicateGame.mutateAsync(gameId);
      showToast(t("quizshow:game.duplicated"), "success");
      void navigate(quizshowGamePath(copy.gameId));
    } catch (error) {
      showErrorToast(error);
    } finally {
      isDuplicatingRef.current = false;
    }
  };

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
    isDeletePending: deleteGame.isPending,
    isDeleteConfirmOpen,
    openDeleteConfirm: () => setIsDeleteConfirmOpen(true),
    closeDeleteConfirm: () => setIsDeleteConfirmOpen(false),
    confirmDelete,
  };
}

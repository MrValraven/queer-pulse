import { useState } from "react";
import { flushSync } from "react-dom";
import { AnimatePresence } from "motion/react";
import { FiArrowLeft, FiCopy, FiTrash2 } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { routes } from "../../../app/routeMap";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Button } from "../../../shared/components/ui/Button";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { quizshowErrorCodeOf, quizshowErrorKeyOf } from "../api/quizshowErrors";
import {
  useDeleteQuizshowGame,
  useDuplicateQuizshowGame,
} from "../api/useQuizshowGames";
import { quizshowGamePath } from "../quizshowPaths";
import { FadingTag } from "./QuizshowGameRow";
import styles from "./QuizshowGamePage.module.css";

/**
 * The game page's header: the way back to Pulse Live, the game's title with
 * its 18+ tag, and the two whole-game actions. The delete mutation lives here
 * so its pending state re-renders the header alone and leaves the builder
 * below untouched.
 */
export function QuizshowGameHeader({
  gameId,
  title,
  isAdultsOnly,
  onDeleteStart,
  onDeleteFailed,
}: {
  gameId: string;
  title: string;
  isAdultsOnly: boolean;
  /** The member confirmed Delete game: the page swaps to its leaving body. */
  onDeleteStart: () => void;
  /** The delete was refused: the page brings the builder back. */
  onDeleteFailed: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const duplicateGame = useDuplicateQuizshowGame();
  const deleteGame = useDeleteQuizshowGame();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const trimmedTitle = title.trim();
  const displayTitle =
    trimmedTitle === "" ? t("quizshow:game.untitled") : trimmedTitle;

  const showErrorToast = (error: unknown) => {
    showToast(t(quizshowErrorKeyOf(quizshowErrorCodeOf(error))), "error");
  };

  const duplicate = async () => {
    if (duplicateGame.isPending) return;
    try {
      const copy = await duplicateGame.mutateAsync(gameId);
      showToast(t("quizshow:game.duplicated"), "success");
      void navigate(quizshowGamePath(copy.gameId));
    } catch (error) {
      showErrorToast(error);
    }
  };

  const confirmDelete = async () => {
    // Commit the page's leaving body now, before the delete resolves: the
    // builder and its unsaved changes guard unmount, so the navigation below
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

  return (
    <header className={styles.header}>
      <Link to={routes.play} className={styles.back}>
        <FiArrowLeft aria-hidden fill="none" />
        {t("quizshow:game.back")}
      </Link>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{displayTitle}</h1>
        <AnimatePresence initial={false}>
          {isAdultsOnly && (
            <FadingTag key="adults" className={styles.adultsTag}>
              {t("quizshow:games.row.adultsTag")}
            </FadingTag>
          )}
        </AnimatePresence>
      </div>
      <div className={styles.actions}>
        <Button
          variant="ghost"
          size="sm"
          aria-disabled={duplicateGame.isPending || undefined}
          onClick={() => void duplicate()}
        >
          <FiCopy aria-hidden fill="none" />
          {t("quizshow:game.duplicate")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDeleteConfirmOpen(true)}
        >
          <FiTrash2 aria-hidden fill="none" />
          {t("quizshow:game.delete")}
        </Button>
      </div>
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <ConfirmDialog
            key="delete-game"
            open
            tone="destructive"
            loading={deleteGame.isPending}
            title={t("quizshow:game.deleteTitle")}
            description={t("quizshow:game.deleteBody")}
            confirmLabel={t("quizshow:game.delete")}
            onConfirm={() => void confirmDelete()}
            onClose={() => setIsDeleteConfirmOpen(false)}
          />
        )}
      </AnimatePresence>
    </header>
  );
}

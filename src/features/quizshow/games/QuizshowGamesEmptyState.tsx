import { useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle } from "react-icons/fi";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Button, Collapse } from "../../../shared/components/ui";
import type { QuizshowStarterPackKey } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { quizshowErrorCodeOf, quizshowErrorKeyOf } from "../api/quizshowErrors";
import { useCreateQuizshowGame } from "../api/useQuizshowGames";
import { useQuizshowPacks } from "../api/useQuizshowQuiz";
import { QuizshowPackPicker } from "../builder/QuizshowPackPicker";
import { quizshowGamePath } from "../quizshowPaths";
import styles from "./QuizshowGames.module.css";

/** How a named new game starts: blank, or blank with its source picker opening on its page. */
export type QuizshowNewGameStart = "blank" | "copy";

interface QuizshowGamesEmptyStateProps {
  /** Opens My games' one New game dialog, which outlives this empty state. */
  onStartNewGame: (start: QuizshowNewGameStart) => void;
}

/** The empty My games: start from a pack, copy a game or event quiz, or start blank. */
export function QuizshowGamesEmptyState({
  onStartNewGame,
}: QuizshowGamesEmptyStateProps) {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const titleId = useId();
  const [isPackPickerOpen, setIsPackPickerOpen] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  // The picker loads the packs; this reads the same cache for the picked title.
  const packs = useQuizshowPacks({ isEnabled: false });
  const createGame = useCreateQuizshowGame();

  async function startFromPack(packKey: QuizshowStarterPackKey) {
    if (createGame.isPending) return;
    const pack = packs.data?.items.find((item) => item.key === packKey);
    setIsPackPickerOpen(false);
    setErrorKey(null);
    try {
      const response = await createGame.mutateAsync({
        title: pack?.title[language] ?? "",
        source: { from: "pack", packKey },
      });
      showToast(t("quizshow:games.new.created"), "success");
      void navigate(quizshowGamePath(response.gameId));
    } catch (error) {
      setErrorKey(quizshowErrorKeyOf(quizshowErrorCodeOf(error)));
    }
  }

  return (
    <section className={styles.emptyCard} aria-labelledby={titleId}>
      <h3 id={titleId} className={styles.emptyTitle}>
        {t("quizshow:home.myGames.emptyTitle")}
      </h3>
      <p className={styles.emptyBody}>{t("quizshow:home.myGames.emptyBody")}</p>
      <div className={styles.emptyActions}>
        <Button
          variant="soft"
          aria-disabled={createGame.isPending}
          onClick={() => {
            if (!createGame.isPending) setIsPackPickerOpen(true);
          }}
        >
          {t("quizshow:builder.empty.fromPack")}
        </Button>
        <Button variant="ghost" onClick={() => onStartNewGame("copy")}>
          {t("quizshow:import.fromCopy")}
        </Button>
        <Button variant="ghost" onClick={() => onStartNewGame("blank")}>
          {t("quizshow:builder.empty.blank")}
        </Button>
      </div>
      <Collapse isOpen={errorKey !== null}>
        <p className={styles.errorLine} role="alert">
          <FiAlertCircle aria-hidden fill="none" className={styles.errorIcon} />
          {errorKey === null ? null : t(errorKey)}
        </p>
      </Collapse>
      <QuizshowPackPicker
        isOpen={isPackPickerOpen}
        onClose={() => setIsPackPickerOpen(false)}
        onPick={(packKey) => void startFromPack(packKey)}
      />
    </section>
  );
}

import { useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { FiAlertCircle } from "react-icons/fi";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import { Button, Collapse } from "../../../shared/components/ui";
import type { QuizshowTemplateCard } from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { quizshowErrorCodeOf, quizshowErrorKeyOf } from "../api/quizshowErrors";
import { quizshowKeys } from "../api/quizshowKeys";
import { useCreateQuizshowGame } from "../api/useQuizshowGames";
import { QuizshowTemplatePicker } from "../builder/QuizshowTemplatePicker";
import { templateCardTitleOf } from "../templates/quizshowTemplateResponse";
import { quizshowGamePath } from "../quizshowPaths";
import styles from "./QuizshowGames.module.css";

/** How a named new game starts: blank, or blank with its source picker opening on its page. */
export type QuizshowNewGameStart = "blank" | "copy";

interface QuizshowGamesEmptyStateProps {
  /** Opens My games' one New game dialog, which outlives this empty state. */
  onStartNewGame: (start: QuizshowNewGameStart) => void;
}

/** The empty My games: start from a template, copy a game or event quiz, or start blank. */
export function QuizshowGamesEmptyState({
  onStartNewGame,
}: QuizshowGamesEmptyStateProps) {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { demoMode } = useDemoMode();
  const titleId = useId();
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const createGame = useCreateQuizshowGame();

  async function startFromTemplate(card: QuizshowTemplateCard) {
    if (createGame.isPending) return;
    setIsTemplatePickerOpen(false);
    setErrorKey(null);
    try {
      const response = await createGame.mutateAsync({
        title: templateCardTitleOf(card.title, language),
        source: { from: "template", templateId: card.id },
      });
      showToast(t("quizshow:games.new.created"), "success");
      void navigate(quizshowGamePath(response.gameId));
    } catch (error) {
      const errorCode = quizshowErrorCodeOf(error);
      if (errorCode === "quizshow_template_not_found") {
        // Unpublished or deleted since the picker loaded, so its card leaves the picker.
        void queryClient.invalidateQueries({
          queryKey: quizshowKeys.templateCards(demoMode),
        });
      }
      setErrorKey(quizshowErrorKeyOf(errorCode));
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
            if (!createGame.isPending) setIsTemplatePickerOpen(true);
          }}
        >
          {t("quizshow:builder.empty.fromTemplate")}
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
      {/* A game started from an adults template turns its 18+ switch on, so every template is open here. */}
      <QuizshowTemplatePicker
        isOpen={isTemplatePickerOpen}
        isAdultsAllowed
        onClose={() => setIsTemplatePickerOpen(false)}
        onPick={(card) => void startFromTemplate(card)}
      />
    </section>
  );
}

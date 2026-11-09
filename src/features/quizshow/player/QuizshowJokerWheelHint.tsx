import type { ReactNode } from "react";
import { FiStar } from "react-icons/fi";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import lobbyStyles from "./QuizshowPlayerLobby.module.css";

/**
 * The line shown while the wheel is up next: the joker is played on the round
 * card that follows it. Folds away once the joker is spent.
 */
export function QuizshowJokerWheelHint({
  isOpen,
}: {
  isOpen: boolean;
}): ReactNode {
  const { t } = useTranslation();
  return (
    <Collapse isOpen={isOpen}>
      {isOpen && (
        <p className={lobbyStyles.jokerWheelHint}>
          <FiStar aria-hidden="true" fill="none" />
          {t("quizshow:player.jokerOnRoundCard")}
        </p>
      )}
    </Collapse>
  );
}

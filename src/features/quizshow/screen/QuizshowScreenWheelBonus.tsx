import type { ReactNode } from "react";
import { FiAward } from "react-icons/fi";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type {
  QuizshowLanguage,
  QuizshowWheelBonusView,
} from "../../../shared/contracts/quizshow";
import {
  wheelBonusAwardCopy,
  type QuizshowRoundKindRows,
} from "../stage/quizshowWheelCopy";
import styles from "./QuizshowScreenWheel.module.css";

type WheelBonusVariant = "board" | "panel";

const VARIANT_CLASS: Record<WheelBonusVariant, string | undefined> = {
  board: styles.bonusBoard,
  panel: styles.bonusPanel,
};

function WheelBonusLine({
  bonus,
  rounds,
  language,
  variant,
}: {
  bonus: QuizshowWheelBonusView;
  rounds: QuizshowRoundKindRows;
  language: QuizshowLanguage;
  variant: WheelBonusVariant;
}) {
  const { t } = useTranslation();
  const award = wheelBonusAwardCopy(bonus, rounds, language, t);
  return (
    <div
      className={`${styles.bonusLine} ${VARIANT_CLASS[variant] ?? ""}`}
      data-quizshow-wheel-bonus={variant}
    >
      <p className={styles.bonusEyebrow}>
        <FiAward aria-hidden="true" fill="none" focusable="false" />
        {t("quizshow:stage.wheel.bonusAwardEyebrow")}
      </p>
      <p className={styles.bonusAward}>{t(award.key, award.values)}</p>
    </div>
  );
}

/** "Wheel bonus" eyebrow plus the award sentence, folding in and out. Board: under the leaderboard title. Panel: at the foot of the wheel's left panel. */
export function QuizshowScreenWheelBonus({
  bonus,
  rounds,
  language,
  variant,
}: {
  bonus: QuizshowWheelBonusView | null;
  rounds: QuizshowRoundKindRows;
  language: QuizshowLanguage;
  variant: "board" | "panel";
}): ReactNode {
  return (
    <Collapse isOpen={bonus !== null}>
      {bonus !== null && (
        <WheelBonusLine
          bonus={bonus}
          rounds={rounds}
          language={language}
          variant={variant}
        />
      )}
    </Collapse>
  );
}

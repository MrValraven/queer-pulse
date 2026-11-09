import type { ReactNode } from "react";
import { FiAward } from "react-icons/fi";
import { Collapse } from "../../../shared/components/ui/Collapse";
import type {
  QuizshowLanguage,
  QuizshowMe,
  QuizshowPlayMode,
  QuizshowWheelBonusView,
} from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  wheelBonusAwardCopy,
  wheelTitleOf,
  type QuizshowRoundKindRows,
} from "../stage/quizshowWheelCopy";
import { isMyWheelBonus } from "../stage/quizshowWheelView";
import styles from "./QuizshowPlayerWheel.module.css";

interface BonusBodyProps {
  bonus: QuizshowWheelBonusView;
  rounds: QuizshowRoundKindRows;
  isMine: boolean;
  playMode: QuizshowPlayMode;
  language: QuizshowLanguage;
}

function BonusBody({
  bonus,
  rounds,
  isMine,
  playMode,
  language,
}: BonusBodyProps): ReactNode {
  const { t } = useTranslation();
  if (isMine) {
    const mineKey =
      playMode === "teams"
        ? "quizshow:player.wheel.bonusMineTeam"
        : "quizshow:player.wheel.bonusMine";
    return (
      <div className={`${styles.bonusPanel} ${styles.bonusMine}`}>
        <FiAward className={styles.bonusIcon} aria-hidden="true" fill="none" />
        <div className={styles.bonusText}>
          <p className={styles.bonusHeadline}>{t(mineKey)}</p>
          <p className={styles.bonusDetail}>
            {t("quizshow:player.wheel.bonusMineDetail", {
              points: bonus.points,
              title: wheelTitleOf(
                bonus.sliceTitle,
                bonus.sliceRoundIndex,
                rounds,
                language,
                t,
              ),
            })}
          </p>
        </div>
      </div>
    );
  }
  const award = wheelBonusAwardCopy(bonus, rounds, language, t);
  return (
    <div className={`${styles.bonusPanel} ${styles.bonusOther}`}>
      <div className={styles.bonusText}>
        <p className={styles.bonusEyebrow}>
          {t("quizshow:stage.wheel.bonusAwardEyebrow")}
        </p>
        <p className={styles.bonusSentence}>{t(award.key, award.values)}</p>
      </div>
    </div>
  );
}

export interface QuizshowPhoneWheelBonusProps {
  bonus: QuizshowWheelBonusView | null;
  rounds: QuizshowRoundKindRows;
  me: QuizshowMe | null;
  playMode: QuizshowPlayMode;
  language: QuizshowLanguage;
}

/**
 * The wheel bonus on a phone. Winners get their own moment ("You won the wheel
 * bonus", or the team's version); everyone else reads who won. The panel folds
 * in and out; the stage's own announcement carries the award to assistive tech.
 */
export function QuizshowPhoneWheelBonus({
  bonus,
  rounds,
  me,
  playMode,
  language,
}: QuizshowPhoneWheelBonusProps): ReactNode {
  return (
    <div role="status" className={styles.bonusRegion}>
      <Collapse isOpen={bonus !== null}>
        {bonus !== null && (
          <BonusBody
            bonus={bonus}
            rounds={rounds}
            isMine={isMyWheelBonus(bonus, me, playMode)}
            playMode={playMode}
            language={language}
          />
        )}
      </Collapse>
    </div>
  );
}

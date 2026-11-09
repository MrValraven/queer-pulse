import {
  QUIZSHOW_WHEEL_BONUS_VALUES,
  type QuizshowWheelBonus,
} from "../../../shared/contracts/quizshow";

/** The radio ids of the Wheel bonus field, in display order. */
export const WHEEL_BONUS_CHOICES = QUIZSHOW_WHEEL_BONUS_VALUES.map(
  (bonus) => String(bonus) as `${QuizshowWheelBonus}`,
);

export type WheelBonusChoice = (typeof WHEEL_BONUS_CHOICES)[number];

/** The bonus a radio id stands for; an id outside the list means no bonus. */
export function bonusOfChoice(choice: WheelBonusChoice): QuizshowWheelBonus {
  return (
    QUIZSHOW_WHEEL_BONUS_VALUES.find((bonus) => String(bonus) === choice) ?? 0
  );
}

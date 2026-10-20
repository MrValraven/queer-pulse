import { useState, type Ref } from "react";
import { m } from "motion/react";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  QUIZSHOW_TEAM_COLOR_KEYS,
  type QuizshowLanguage,
  type QuizshowOption,
  type QuizshowTeamColorKey,
} from "../../../shared/contracts/quizshow";
import { reorderLayoutTransition } from "../../subprofiles/reorderMotion";
import { useRowDragReorder } from "../../subprofiles/useRowDragReorder";
import { moveItem } from "../builder/quizshowDraft";
import { QuizshowReorderControls } from "../builder/QuizshowReorderControls";
import { QuizshowShape } from "../QuizshowShape";
import {
  QUIZSHOW_ANSWER_SWATCH_KEYS,
  QUIZSHOW_SWATCHES,
} from "../quizshowSwatches";
import { optionLetter, pickQuizshowText } from "../stage/quizshowText";
import styles from "./QuizshowPlayer.module.css";

interface QuizshowOrderAnswerProps {
  options: readonly QuizshowOption[];
  language: QuizshowLanguage;
  isLocked: boolean;
  /** Paused or past the player's own deadline: sorting stays open, sending waits. */
  isHeld?: boolean;
  /** The order already sent, so a reload shows it. */
  lockedOrderIds?: readonly string[];
  onSubmit: (orderedIds: string[]) => void;
}

/** The same shapes the big screen draws: the four answer shapes, then two more for items five and six. */
const ORDER_SWATCH_KEYS: readonly QuizshowTeamColorKey[] = [
  ...QUIZSHOW_ANSWER_SWATCH_KEYS,
  ...QUIZSHOW_TEAM_COLOR_KEYS.filter(
    (colorKey) =>
      !(QUIZSHOW_ANSWER_SWATCH_KEYS as readonly string[]).includes(colorKey),
  ),
];

function orderedByIds(
  options: readonly QuizshowOption[],
  orderedIds: readonly string[] | undefined,
): QuizshowOption[] {
  if (orderedIds === undefined) return [...options];
  const optionById = new Map(options.map((option) => [option.id, option]));
  const ordered = orderedIds.flatMap((id) => optionById.get(id) ?? []);
  return ordered.length === options.length ? ordered : [...options];
}

/** The items as shown, sorted by drag or by the up and down buttons, then sent as one permutation. */
export function QuizshowOrderAnswer({
  options,
  language,
  isLocked,
  isHeld = false,
  lockedOrderIds,
  onSubmit,
}: QuizshowOrderAnswerProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const [orderedOptions, setOrderedOptions] = useState<QuizshowOption[]>(() =>
    orderedByIds(options, lockedOrderIds),
  );
  const moveOption = (fromIndex: number, toIndex: number) => {
    if (isLocked) return;
    setOrderedOptions((current) => moveItem(current, fromIndex, toIndex));
  };
  const { containerRef, draggingIndex, gripHandlers } =
    useRowDragReorder(moveOption);
  // Each item keeps the letter and shape it has on the big screen while it moves.
  const shownIndexById = new Map(
    options.map((option, shownIndex) => [option.id, shownIndex]),
  );

  return (
    <div className={styles.form}>
      <p className={styles.note}>{t("quizshow:player.orderHint")}</p>
      <ul
        ref={containerRef as unknown as Ref<HTMLUListElement>}
        inert={isLocked}
        className={`${styles.orderList} ${isLocked ? styles.orderListLocked : ""}`}
      >
        {orderedOptions.map((option, optionIndex) => {
          const number = optionIndex + 1;
          const shownIndex = shownIndexById.get(option.id) ?? optionIndex;
          const colorKey = ORDER_SWATCH_KEYS[shownIndex] ?? "star";
          return (
            <m.li
              key={option.id}
              className={styles.orderRow}
              layout={draggingIndex !== optionIndex}
              transition={{
                layout: reorderLayoutTransition(
                  reducedMotion || draggingIndex !== null,
                ),
              }}
            >
              <QuizshowReorderControls
                index={optionIndex}
                count={orderedOptions.length}
                moveUpLabel={t("quizshow:questions.order.moveUp", { number })}
                moveDownLabel={t("quizshow:questions.order.moveDown", {
                  number,
                })}
                dragLabel={t("quizshow:questions.order.drag", { number })}
                onMove={moveOption}
                gripHandlers={gripHandlers(optionIndex)}
              />
              <span className={styles.orderMark}>
                <QuizshowShape
                  colorKey={colorKey}
                  size="small"
                  label={t(QUIZSHOW_SWATCHES[colorKey].labelKey)}
                />
                <span className={styles.orderLetter}>
                  {optionLetter(shownIndex)}
                </span>
              </span>
              <span className={styles.orderText}>
                {pickQuizshowText(option.text, language)}
              </span>
            </m.li>
          );
        })}
      </ul>
      <Button
        type="button"
        variant="primary"
        aria-disabled={isLocked || isHeld}
        onClick={() => {
          if (isLocked || isHeld) return;
          onSubmit(orderedOptions.map((option) => option.id));
        }}
      >
        {t("quizshow:player.orderSubmit")}
      </Button>
    </div>
  );
}

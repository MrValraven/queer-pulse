import type { Ref } from "react";
import { AnimatePresence, m } from "motion/react";
import {
  FiChevronDown,
  FiChevronUp,
  FiMenu,
  FiPlus,
  FiX,
} from "react-icons/fi";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import {
  Button,
  Collapse,
  CollapseListItem,
  IconButton,
} from "../../../shared/components/ui";
import {
  QUIZSHOW_LIMITS,
  QUIZSHOW_TEAM_COLOR_KEYS,
  type QuizshowLanguage,
  type QuizshowOption,
  type QuizshowQuestionInput,
  type QuizshowTeamColorKey,
} from "../../../shared/contracts/quizshow";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { reorderLayoutTransition } from "../../subprofiles/reorderMotion";
import { useRowDragReorder } from "../../subprofiles/useRowDragReorder";
import { mintOptionId, moveItem } from "../builder/quizshowDraft";
import { useStudioCanvasScale } from "./quizshowStudioCanvasScale";
import { QuizshowShape } from "../QuizshowShape";
import {
  QUIZSHOW_ANSWER_SWATCH_KEYS,
  QUIZSHOW_SWATCHES,
} from "../quizshowSwatches";
import { QuizshowStudioSlideField } from "./QuizshowStudioSlideParts";
import {
  swatchStyleOf,
  useSlideProblemLine,
  withLanguageText,
} from "./quizshowStudioSlideText";
import styles from "./QuizshowStudioSlide.module.css";

type OrderQuestion = Extract<QuizshowQuestionInput, { type: "order" }>;

/** The four answer shapes, then two more for a fifth and sixth item, as the stage draws them. */
const ORDER_SWATCH_KEYS: readonly QuizshowTeamColorKey[] = [
  ...QUIZSHOW_ANSWER_SWATCH_KEYS,
  ...QUIZSHOW_TEAM_COLOR_KEYS.filter(
    (colorKey) =>
      !(QUIZSHOW_ANSWER_SWATCH_KEYS as readonly string[]).includes(colorKey),
  ),
];

/** The question with these items; its answer follows the item order. */
function withOptions(
  question: OrderQuestion,
  options: QuizshowOption[],
): OrderQuestion {
  return {
    ...question,
    options,
    answer: { orderedIds: options.map((option) => option.id) },
  };
}

interface QuizshowStudioSlideOrderProps {
  question: OrderQuestion;
  language: QuizshowLanguage;
  onChange: (question: QuizshowQuestionInput) => void;
}

/**
 * Put in order: the items as a column of stage tiles in the right order,
 * typed on in place. Drag a row by its grip, or move it with its arrows;
 * players see the items shuffled.
 */
export function QuizshowStudioSlideOrder({
  question,
  language,
  onChange,
}: QuizshowStudioSlideOrderProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { options } = question;
  const isAddAllowed = options.length < QUIZSHOW_LIMITS.orderItemsMax;
  const isRemoveAllowed = options.length > QUIZSHOW_LIMITS.orderItemsMin;
  const moveOption = (fromIndex: number, toIndex: number) =>
    onChange(withOptions(question, moveItem(options, fromIndex, toIndex)));
  // The slide is drawn on a scaled canvas, so the drag converts the pointer.
  const readScale = useStudioCanvasScale();
  const { containerRef, draggingIndex, gripHandlers } = useRowDragReorder(
    moveOption,
    { readScale },
  );
  const itemProblem = useSlideProblemLine("option_text_missing");
  return (
    <>
      <ul
        ref={containerRef as unknown as Ref<HTMLUListElement>}
        className={styles.orderList}
        data-count={options.length}
      >
        <AnimatePresence initial={false}>
          {options.map((option, optionIndex) => {
            const number = optionIndex + 1;
            const colorKey = ORDER_SWATCH_KEYS[optionIndex] ?? "star";
            const isFirst = optionIndex === 0;
            const isLast = optionIndex === options.length - 1;
            return (
              <CollapseListItem key={option.id}>
                <m.div
                  className={`${styles.tile} ${styles.orderRow}`}
                  data-dragging={draggingIndex === optionIndex}
                  style={swatchStyleOf(QUIZSHOW_SWATCHES[colorKey])}
                  layout={draggingIndex === optionIndex ? false : "position"}
                  transition={{
                    layout: reorderLayoutTransition(
                      reducedMotion || draggingIndex === optionIndex,
                    ),
                  }}
                >
                  <button
                    type="button"
                    className={styles.grip}
                    aria-label={t("quizshow:questions.order.drag", { number })}
                    onPointerDown={gripHandlers(optionIndex).onPointerDown}
                  >
                    <FiMenu aria-hidden />
                  </button>
                  <QuizshowShape
                    colorKey={colorKey}
                    size="medium"
                    label={null}
                    isGlowing
                  />
                  <span className={styles.letter} aria-hidden="true">
                    {number}
                  </span>
                  <QuizshowStudioSlideField
                    label={t("quizshow:questions.order.item", { number })}
                    value={option.text[language]}
                    placeholder={t("quizshow:studio.slide.itemPlaceholder")}
                    maxLength={QUIZSHOW_LIMITS.optionTextMax}
                    className={styles.tileField}
                    problemText={
                      option.text[language].trim() === ""
                        ? itemProblem
                        : undefined
                    }
                    onChange={(value) =>
                      onChange(
                        withOptions(
                          question,
                          options.map((existing, index) =>
                            index === optionIndex
                              ? {
                                  ...existing,
                                  text: withLanguageText(
                                    existing.text,
                                    language,
                                    value,
                                  ),
                                }
                              : existing,
                          ),
                        ),
                      )
                    }
                  />
                  <span className={styles.rowTools}>
                    <IconButton
                      size="sm"
                      tone="dark"
                      aria-label={t("quizshow:questions.order.moveUp", {
                        number,
                      })}
                      aria-disabled={isFirst}
                      onClick={() => {
                        if (!isFirst) moveOption(optionIndex, optionIndex - 1);
                      }}
                    >
                      <FiChevronUp aria-hidden />
                    </IconButton>
                    <IconButton
                      size="sm"
                      tone="dark"
                      aria-label={t("quizshow:questions.order.moveDown", {
                        number,
                      })}
                      aria-disabled={isLast}
                      onClick={() => {
                        if (!isLast) moveOption(optionIndex, optionIndex + 1);
                      }}
                    >
                      <FiChevronDown aria-hidden />
                    </IconButton>
                    <span
                      className={styles.tileRemove}
                      data-hidden={!isRemoveAllowed}
                    >
                      <IconButton
                        size="sm"
                        tone="dark"
                        aria-label={t("quizshow:questions.order.remove", {
                          number,
                        })}
                        onClick={() =>
                          onChange(
                            withOptions(
                              question,
                              options.filter(
                                (_existing, index) => index !== optionIndex,
                              ),
                            ),
                          )
                        }
                      >
                        <FiX aria-hidden />
                      </IconButton>
                    </span>
                  </span>
                </m.div>
              </CollapseListItem>
            );
          })}
        </AnimatePresence>
      </ul>
      <div className={styles.orderFoot}>
        <p className={styles.foot}>
          <strong>{t("quizshow:questions.order.label")}</strong>
          <span>{t("quizshow:questions.order.hint")}</span>
        </p>
        <Collapse isOpen={isAddAllowed}>
          <Button
            type="button"
            variant="stage-ghost"
            size="sm"
            onClick={() =>
              onChange(
                withOptions(question, [
                  ...options,
                  { id: mintOptionId(options), text: { en: "", pt: "" } },
                ]),
              )
            }
          >
            <FiPlus aria-hidden /> {t("quizshow:questions.order.add")}
          </Button>
        </Collapse>
      </div>
    </>
  );
}

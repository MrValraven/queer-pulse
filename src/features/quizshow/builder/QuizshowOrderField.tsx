import type { Ref } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiPlus, FiX } from "react-icons/fi";
import {
  QUIZSHOW_LIMITS,
  type QuizshowLanguage,
  type QuizshowLanguageMode,
  type QuizshowOption,
  type QuizshowQuestionInput,
} from "../../../shared/contracts/quizshow";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import {
  Button,
  Collapse,
  CollapseListItem,
  IconButton,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { reorderLayoutTransition } from "../../subprofiles/reorderMotion";
import { useRowDragReorder } from "../../subprofiles/useRowDragReorder";
import { mintOptionId, moveItem } from "./quizshowDraft";
import { QuizshowBilingualInput } from "./QuizshowBilingualInput";
import { QuizshowReorderControls } from "./QuizshowReorderControls";
import styles from "./QuizshowQuestionEditor.module.css";

type OrderQuestion = Extract<QuizshowQuestionInput, { type: "order" }>;

interface QuizshowOrderFieldProps {
  question: OrderQuestion;
  languages: QuizshowLanguageMode;
  missingLanguages: readonly QuizshowLanguage[];
  errorText: (language: QuizshowLanguage) => string;
  onChange: (question: QuizshowQuestionInput) => void;
}

/** The question with these items, its answer following the item order. */
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

/** Items in the right order; players see them shuffled. */
export function QuizshowOrderField({
  question,
  languages,
  missingLanguages,
  errorText,
  onChange,
}: QuizshowOrderFieldProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const { options } = question;
  const canAdd = options.length < QUIZSHOW_LIMITS.orderItemsMax;
  const canRemove = options.length > QUIZSHOW_LIMITS.orderItemsMin;
  const moveOption = (fromIndex: number, toIndex: number) =>
    onChange(withOptions(question, moveItem(options, fromIndex, toIndex)));
  const { containerRef, draggingIndex, gripHandlers } =
    useRowDragReorder(moveOption);

  return (
    <div className={styles.answerField}>
      <span className={styles.groupLabel}>
        {t("quizshow:questions.order.label")}
      </span>
      <span className={styles.hint}>{t("quizshow:questions.order.hint")}</span>
      <ul
        ref={containerRef as unknown as Ref<HTMLUListElement>}
        className={styles.rowList}
      >
        <AnimatePresence initial={false}>
          {options.map((option, optionIndex) => {
            const number = optionIndex + 1;
            const emptyLanguages = missingLanguages.filter(
              (language) => option.text[language].trim().length === 0,
            );
            return (
              <CollapseListItem key={option.id}>
                {/* Every row glides to its new slot on an arrow move or a
                    neighbour's swap; the held row follows the pointer, so it
                    takes no layout glide of its own. */}
                <m.div
                  className={styles.orderRow}
                  layout={draggingIndex === optionIndex ? false : "position"}
                  transition={{
                    layout: reorderLayoutTransition(
                      reducedMotion || draggingIndex === optionIndex,
                    ),
                  }}
                >
                  <QuizshowReorderControls
                    index={optionIndex}
                    count={options.length}
                    moveUpLabel={t("quizshow:questions.order.moveUp", {
                      number,
                    })}
                    moveDownLabel={t("quizshow:questions.order.moveDown", {
                      number,
                    })}
                    dragLabel={t("quizshow:questions.order.drag", { number })}
                    onMove={moveOption}
                    gripHandlers={gripHandlers(optionIndex)}
                  />
                  <QuizshowBilingualInput
                    label={t("quizshow:questions.order.item", { number })}
                    value={option.text}
                    languages={languages}
                    maxLength={QUIZSHOW_LIMITS.optionTextMax}
                    missingLanguages={emptyLanguages}
                    errorText={errorText}
                    onChange={(text) =>
                      onChange(
                        withOptions(
                          question,
                          options.map((existing, index) =>
                            index === optionIndex
                              ? { ...existing, text }
                              : existing,
                          ),
                        ),
                      )
                    }
                  />
                  <Collapse isOpen={canRemove}>
                    <IconButton
                      size="sm"
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
                  </Collapse>
                </m.div>
              </CollapseListItem>
            );
          })}
        </AnimatePresence>
      </ul>
      <Collapse isOpen={canAdd}>
        <Button
          type="button"
          variant="ghost"
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
  );
}

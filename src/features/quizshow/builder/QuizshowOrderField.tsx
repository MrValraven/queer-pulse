import { useId, type PointerEvent as ReactPointerEvent, type Ref } from "react";
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
import {
  QuizshowReorderArrows,
  QuizshowReorderGrip,
} from "./QuizshowReorderControls";
import styles from "./QuizshowQuestionEditor.module.css";

type OrderQuestion = Extract<QuizshowQuestionInput, { type: "order" }>;

interface QuizshowOrderFieldProps {
  question: OrderQuestion;
  languages: QuizshowLanguageMode;
  missingLanguages: readonly QuizshowLanguage[];
  errorText: (language: QuizshowLanguage) => string;
  /**
   * Only the item texts: no reorder, remove or add controls. The studio
   * inspector's other-language fields set it, so the inputs get the full width.
   */
  isTextOnly?: boolean;
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

interface OrderRowProps {
  question: OrderQuestion;
  option: QuizshowOption;
  optionIndex: number;
  languages: QuizshowLanguageMode;
  missingLanguages: readonly QuizshowLanguage[];
  errorText: (language: QuizshowLanguage) => string;
  isTextOnly: boolean;
  canRemove: boolean;
  /** This row follows the pointer right now. */
  isHeld: boolean;
  isMotionReduced: boolean;
  onMove: (fromIndex: number, toIndex: number) => void;
  gripHandlers: { onPointerDown: (event: ReactPointerEvent) => void };
  onChange: (question: QuizshowQuestionInput) => void;
}

/**
 * One item: the grip and "Item 1" with the up, down and remove buttons on
 * its first line, its texts across the row under them.
 */
function OrderRow({
  question,
  option,
  optionIndex,
  languages,
  missingLanguages,
  errorText,
  isTextOnly,
  canRemove,
  isHeld,
  isMotionReduced,
  onMove,
  gripHandlers,
  onChange,
}: OrderRowProps) {
  const { t } = useTranslation();
  const labelId = useId();
  const { options } = question;
  const number = optionIndex + 1;
  const emptyLanguages = missingLanguages.filter(
    (language) => option.text[language].trim().length === 0,
  );
  return (
    // Every row glides to its new slot on an arrow move or a neighbour's
    // swap; the held row follows the pointer, so it takes no layout glide of
    // its own.
    <m.div
      className={`${styles.orderRow} ${isTextOnly ? styles.textOnlyRow : ""}`}
      data-held={isHeld || undefined}
      layout={isHeld ? false : "position"}
      transition={{
        layout: reorderLayoutTransition(isMotionReduced || isHeld),
      }}
    >
      {!isTextOnly && (
        <span className={styles.rowLead}>
          <QuizshowReorderGrip
            dragLabel={t("quizshow:questions.order.drag", { number })}
            gripHandlers={gripHandlers}
          />
        </span>
      )}
      <span id={labelId} className={`${styles.groupLabel} ${styles.rowLabel}`}>
        {t("quizshow:questions.order.item", { number })}
      </span>
      {!isTextOnly && (
        <div className={styles.optionActions}>
          <QuizshowReorderArrows
            index={optionIndex}
            count={options.length}
            moveUpLabel={t("quizshow:questions.order.moveUp", { number })}
            moveDownLabel={t("quizshow:questions.order.moveDown", { number })}
            onMove={onMove}
          />
          <Collapse isOpen={canRemove}>
            <IconButton
              size="sm"
              aria-label={t("quizshow:questions.order.remove", { number })}
              onClick={() =>
                onChange(
                  withOptions(
                    question,
                    options.filter((_existing, index) => index !== optionIndex),
                  ),
                )
              }
            >
              <FiX aria-hidden />
            </IconButton>
          </Collapse>
        </div>
      )}
      <div className={styles.rowFields}>
        <QuizshowBilingualInput
          labelledById={labelId}
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
                  index === optionIndex ? { ...existing, text } : existing,
                ),
              ),
            )
          }
        />
      </div>
    </m.div>
  );
}

/** Items in the right order; players see them shuffled. */
export function QuizshowOrderField({
  question,
  languages,
  missingLanguages,
  errorText,
  isTextOnly = false,
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
          {options.map((option, optionIndex) => (
            <CollapseListItem key={option.id}>
              <OrderRow
                question={question}
                option={option}
                optionIndex={optionIndex}
                languages={languages}
                missingLanguages={missingLanguages}
                errorText={errorText}
                isTextOnly={isTextOnly}
                canRemove={canRemove}
                isHeld={draggingIndex === optionIndex}
                isMotionReduced={reducedMotion}
                onMove={moveOption}
                gripHandlers={gripHandlers(optionIndex)}
                onChange={onChange}
              />
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
      <Collapse isOpen={canAdd && !isTextOnly}>
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

import { useId, useState } from "react";
import { AnimatePresence } from "motion/react";
import type { IconType } from "react-icons";
import {
  FiBarChart2,
  FiCheckSquare,
  FiEdit3,
  FiGrid,
  FiHash,
  FiList,
} from "react-icons/fi";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { ConfirmDialog } from "../../../shared/components/ui/ConfirmDialog";
import { FormField } from "../../../shared/components/ui/FormField";
import { RadioCardGroup } from "../../../shared/components/ui/RadioCardGroup";
import {
  QUIZSHOW_LIMITS,
  QUIZSHOW_QUESTION_TYPES,
  type QuizshowQuestionInput,
  type QuizshowQuestionType,
  type QuizshowRoundKind,
} from "../../../shared/contracts/quizshow";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  changeQuestionType,
  isQuestionTypeChangeLossy,
} from "../builder/quizshowDraft";
import { typeChangeCopyOf, typeChangeLossOf } from "./quizshowTypeChange";
import { useQuizshowDarkDialog } from "../builder/useQuizshowDarkDialog";
import { useQuizshowStudio } from "./QuizshowStudioContext";
import styles from "./QuizshowStudioInspector.module.css";

/** Prompt is the party rounds' only type; the grid offers the quiz round's six. */
const GRID_TYPES = QUIZSHOW_QUESTION_TYPES.filter((type) => type !== "prompt");

/** The types a round's grid offers: a poll lives in quiz rounds only (contract 6.22). */
function gridTypesFor(roundKind: QuizshowRoundKind): QuizshowQuestionType[] {
  return roundKind === "quiz"
    ? GRID_TYPES
    : GRID_TYPES.filter((type) => type !== "poll");
}

const TYPE_ICONS: Partial<Record<QuizshowQuestionType, IconType>> = {
  multiple_choice: FiGrid,
  true_false: FiCheckSquare,
  type_answer: FiEdit3,
  order: FiList,
  closest_number: FiHash,
  poll: FiBarChart2,
};

interface QuestionFieldProps {
  question: QuizshowQuestionInput;
  onChange: (question: QuizshowQuestionInput) => void;
}

/**
 * The question types a quiz round allows, as a grid of icon cards. A change
 * that would remove an option with text or the answer asks first (item 19);
 * any other change applies at once.
 */
export function QuizshowInspectorTypeGrid({
  question,
  roundKind,
  roundIndex,
  questionIndex,
  onChange,
}: QuestionFieldProps & {
  roundKind: QuizshowRoundKind;
  roundIndex: number;
  questionIndex: number;
}) {
  const { t } = useTranslation();
  const { actions } = useQuizshowStudio();
  const darkDialogRef = useQuizshowDarkDialog();
  const [pendingType, setPendingType] = useState<QuizshowQuestionType | null>(
    null,
  );
  const applyType = (nextType: QuizshowQuestionType) =>
    onChange(changeQuestionType(question, nextType, roundKind));
  const pendingTypeName =
    pendingType === null ? "" : t(`quizshow:type.${pendingType}`);
  const pendingCopy =
    pendingType === null
      ? null
      : typeChangeCopyOf(
          typeChangeLossOf(question, pendingType, roundKind),
          pendingTypeName,
          t,
        );
  return (
    <>
      <RadioCardGroup
        value={question.type}
        ariaLabel={t("quizshow:questions.type.label")}
        className={styles.typeGrid}
        optionClassName={styles.typeCard}
        checkedClassName={styles.isChecked}
        onChange={(nextType) => {
          if (nextType === question.type) return;
          if (isQuestionTypeChangeLossy(question, nextType)) {
            setPendingType(nextType);
            return;
          }
          applyType(nextType);
        }}
        options={gridTypesFor(roundKind).map((type) => {
          const TypeIcon = TYPE_ICONS[type];
          return {
            id: type,
            render: (
              <>
                {TypeIcon && (
                  <TypeIcon
                    aria-hidden
                    fill="none"
                    className={styles.typeIcon}
                  />
                )}
                <span>{t(`quizshow:type.${type}`)}</span>
              </>
            ),
          };
        })}
      />
      <AnimatePresence>
        {pendingType !== null && pendingCopy !== null && (
          <ConfirmDialog
            open
            tone="destructive"
            title={t("quizshow:studio.typeChange.title")}
            description={pendingCopy.body}
            confirmLabel={pendingCopy.confirm}
            cancelLabel={t("quizshow:common.cancel")}
            initialFocus="cancel"
            onClose={() => setPendingType(null)}
            onConfirm={() => {
              // The studio's toast slot offers Undo for it, like a removal.
              if (actions.changeQuestionTypeWithUndo === undefined) {
                applyType(pendingType);
              } else {
                actions.changeQuestionTypeWithUndo(
                  roundIndex,
                  questionIndex,
                  pendingType,
                );
              }
              setPendingType(null);
            }}
          >
            <span ref={darkDialogRef} hidden />
          </ConfirmDialog>
        )}
      </AnimatePresence>
    </>
  );
}

type TimeChoice = "default" | "custom";

/** Seconds typed freely from 5 to 120; the draft takes each valid number as it is typed. */
function TimeLimitInput({
  seconds,
  onChange,
}: {
  seconds: number;
  onChange: (seconds: number) => void;
}) {
  const { t } = useTranslation();
  const [typedText, setTypedText] = useState<string | null>(null);
  const { timeLimitSecondsMin: minimum, timeLimitSecondsMax: maximum } =
    QUIZSHOW_LIMITS;
  const clamp = (value: number) =>
    Math.min(maximum, Math.max(minimum, Math.round(value)));
  // A committed change the typed text does not read as (an undo, a reload)
  // drops the typed copy at once, focused or not. Typing "3" commits 5, which
  // "3" still reads as through the clamp, so typing is never cut short.
  const [typedForSeconds, setTypedForSeconds] = useState(seconds);
  if (typedForSeconds !== seconds) {
    setTypedForSeconds(seconds);
    const typedNumber = Number(typedText);
    const isReadAsSeconds =
      typedText !== "" &&
      Number.isFinite(typedNumber) &&
      clamp(typedNumber) === seconds;
    if (typedText !== null && !isReadAsSeconds) setTypedText(null);
  }
  return (
    <FormField label={t("quizshow:questions.timeLimit.label")}>
      <input
        type="number"
        inputMode="numeric"
        className={styles.numberInput}
        min={minimum}
        max={maximum}
        value={typedText ?? String(seconds)}
        onChange={(event) => {
          setTypedText(event.target.value);
          const parsed = Number(event.target.value);
          if (event.target.value !== "" && Number.isFinite(parsed)) {
            onChange(clamp(parsed));
          }
        }}
        onBlur={() => setTypedText(null)}
      />
    </FormField>
  );
}

/** Time to answer (the round's default or a value) and points, for a quiz round's question. */
export function QuizshowInspectorScoring({
  question,
  roundTimeLimitSeconds,
  onChange,
}: QuestionFieldProps & {
  roundTimeLimitSeconds: number;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const timeLabelId = useId();
  const pointsLabelId = useId();
  const timeChoice: TimeChoice =
    question.timeLimitSeconds === null ? "default" : "custom";
  return (
    <>
      <div className={styles.fieldGroup}>
        <span id={timeLabelId} className={styles.fieldLabel}>
          {t("quizshow:studio.inspector.question.timeToAnswer")}
        </span>
        <RadioCardGroup<TimeChoice>
          value={timeChoice}
          ariaLabel={t("quizshow:studio.inspector.question.timeToAnswer")}
          ariaLabelledBy={timeLabelId}
          className={styles.segments}
          optionClassName={styles.segment}
          checkedClassName={styles.isChecked}
          onChange={(choice) =>
            onChange({
              ...question,
              timeLimitSeconds:
                choice === "default" ? null : roundTimeLimitSeconds,
            })
          }
          options={[
            {
              id: "default",
              render: t("quizshow:questions.timeLimit.roundDefault", {
                seconds: format.number(roundTimeLimitSeconds),
              }),
            },
            {
              id: "custom",
              render: t("quizshow:studio.inspector.question.timeCustom"),
            },
          ]}
        />
        <Collapse isOpen={question.timeLimitSeconds !== null}>
          <TimeLimitInput
            seconds={question.timeLimitSeconds ?? roundTimeLimitSeconds}
            onChange={(timeLimitSeconds) =>
              onChange({ ...question, timeLimitSeconds })
            }
          />
        </Collapse>
      </div>
      {/* A poll stores points and scores none (contract 6.22), so it offers none. */}
      <Collapse isOpen={question.type !== "poll"}>
        <div className={styles.fieldGroup}>
          <span id={pointsLabelId} className={styles.fieldLabel}>
            {t("quizshow:questions.points.label")}
          </span>
          <RadioCardGroup
            value={String(question.points)}
            ariaLabel={t("quizshow:questions.points.label")}
            ariaLabelledBy={pointsLabelId}
            className={styles.segments}
            optionClassName={styles.segment}
            checkedClassName={styles.isChecked}
            onChange={(points) =>
              onChange({ ...question, points: Number(points) })
            }
            options={QUIZSHOW_LIMITS.pointsValues.map((points) => ({
              id: String(points),
              render: format.number(points),
            }))}
          />
        </div>
      </Collapse>
    </>
  );
}

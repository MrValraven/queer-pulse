import { useId, useState } from "react";
import type { IconType } from "react-icons";
import { FiCheckSquare, FiEdit3, FiGrid, FiHash, FiList } from "react-icons/fi";
import { Collapse } from "../../../shared/components/ui/Collapse";
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
import { changeQuestionType } from "../builder/quizshowDraft";
import styles from "./QuizshowStudioInspector.module.css";

/** Prompt is the party rounds' only type; the grid offers the quiz round's five. */
const GRID_TYPES = QUIZSHOW_QUESTION_TYPES.filter((type) => type !== "prompt");

const TYPE_ICONS: Partial<Record<QuizshowQuestionType, IconType>> = {
  multiple_choice: FiGrid,
  true_false: FiCheckSquare,
  type_answer: FiEdit3,
  order: FiList,
  closest_number: FiHash,
};

interface QuestionFieldProps {
  question: QuizshowQuestionInput;
  onChange: (question: QuizshowQuestionInput) => void;
}

/** The question types a quiz round allows, as a grid of icon cards. */
export function QuizshowInspectorTypeGrid({
  question,
  roundKind,
  onChange,
}: QuestionFieldProps & { roundKind: QuizshowRoundKind }) {
  const { t } = useTranslation();
  return (
    <RadioCardGroup
      value={question.type}
      ariaLabel={t("quizshow:questions.type.label")}
      className={styles.typeGrid}
      optionClassName={styles.typeCard}
      checkedClassName={styles.isChecked}
      onChange={(nextType) => {
        if (nextType !== question.type) {
          onChange(changeQuestionType(question, nextType, roundKind));
        }
      }}
      options={GRID_TYPES.map((type) => {
        const TypeIcon = TYPE_ICONS[type];
        return {
          id: type,
          render: (
            <>
              {TypeIcon && (
                <TypeIcon aria-hidden fill="none" className={styles.typeIcon} />
              )}
              <span>{t(`quizshow:type.${type}`)}</span>
            </>
          ),
        };
      })}
    />
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
  closestHint,
  onChange,
}: QuestionFieldProps & {
  roundTimeLimitSeconds: number;
  /** Closest number: how it scores, as a note under the points. */
  closestHint?: string;
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
        {closestHint && <p className={styles.lead}>{closestHint}</p>}
      </div>
    </>
  );
}

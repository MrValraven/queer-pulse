import { useId } from "react";
import { FiPlus, FiTrash2, FiX } from "react-icons/fi";
import { Button, IconButton } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { Field, TextInput } from "../../gatherings/CreateGatheringFields";
import {
  MAX_HOST_OPTION_LENGTH,
  MAX_HOST_OPTIONS,
  MAX_HOST_PROMPT_LENGTH,
  MAX_HOST_QUESTIONS,
  MIN_HOST_OPTIONS,
} from "../goTogetherQuestionnaire.data";
import {
  nextDraftKey,
  type HostQuestionDraft,
} from "./goTogetherHostSettings.helpers";
import styles from "./GoTogetherHost.module.css";

function emptyQuestion(): HostQuestionDraft {
  return {
    key: nextDraftKey(),
    prompt: "",
    options: Array.from({ length: MIN_HOST_OPTIONS }, () => ({
      key: nextDraftKey(),
      label: "",
    })),
  };
}

interface QuestionCardProps {
  question: HostQuestionDraft;
  questionNumber: number;
  isLocked: boolean;
  onChange: (question: HostQuestionDraft) => void;
  onRemove: () => void;
}

/** One host question: its prompt and 2 to 4 answers. */
function HostQuestionCard({
  question,
  questionNumber,
  isLocked,
  onChange,
  onRemove,
}: QuestionCardProps) {
  const { t } = useTranslation();
  const promptId = useId();
  const answersLabelId = `${promptId}-answers`;
  const canRemoveOption =
    !isLocked && question.options.length > MIN_HOST_OPTIONS;
  const isAtOptionLimit = question.options.length >= MAX_HOST_OPTIONS;

  const setOptionLabel = (optionKey: string, label: string) =>
    onChange({
      ...question,
      options: question.options.map((option) =>
        option.key === optionKey ? { ...option, label } : option,
      ),
    });

  return (
    <div className={styles.questionCard}>
      <Field
        label={t("goTogether:host.questions.promptLabel", {
          number: questionNumber,
        })}
        htmlFor={promptId}
        count={`${question.prompt.length}/${MAX_HOST_PROMPT_LENGTH}`}
      >
        <TextInput
          id={promptId}
          value={question.prompt}
          maxLength={MAX_HOST_PROMPT_LENGTH}
          readOnly={isLocked}
          placeholder={t("goTogether:host.questions.promptPlaceholder")}
          onChange={(event) =>
            onChange({ ...question, prompt: event.target.value })
          }
        />
      </Field>
      <div id={answersLabelId} className={styles.answersLabel}>
        {t("goTogether:host.questions.answersLabel")}
      </div>
      <ul className={styles.answerList} aria-labelledby={answersLabelId}>
        {question.options.map((option, optionIndex) => (
          <li key={option.key} className={styles.answerRow}>
            <TextInput
              aria-label={t("goTogether:host.questions.answerLabel", {
                number: optionIndex + 1,
              })}
              value={option.label}
              maxLength={MAX_HOST_OPTION_LENGTH}
              readOnly={isLocked}
              onChange={(event) =>
                setOptionLabel(option.key, event.target.value)
              }
            />
            {canRemoveOption && (
              <IconButton
                aria-label={t("goTogether:host.questions.removeAnswer", {
                  number: optionIndex + 1,
                })}
                onClick={() =>
                  onChange({
                    ...question,
                    options: question.options.filter(
                      (candidate) => candidate.key !== option.key,
                    ),
                  })
                }
              >
                <FiX aria-hidden />
              </IconButton>
            )}
          </li>
        ))}
      </ul>
      {!isLocked && (
        <div className={styles.questionActions}>
          <Button
            variant="ghost"
            disabled={isAtOptionLimit}
            onClick={() =>
              onChange({
                ...question,
                options: [
                  ...question.options,
                  { key: nextDraftKey(), label: "" },
                ],
              })
            }
          >
            <FiPlus aria-hidden /> {t("goTogether:host.questions.addAnswer")}
          </Button>
          <Button variant="ghost" onClick={onRemove}>
            <FiTrash2 aria-hidden />{" "}
            {t("goTogether:host.questions.removeQuestion", {
              number: questionNumber,
            })}
          </Button>
        </div>
      )}
    </div>
  );
}

export interface GoTogetherHostQuestionsEditorProps {
  questions: HostQuestionDraft[];
  onChange: (questions: HostQuestionDraft[]) => void;
  isLocked: boolean;
  /** Whether the saved config already has at least one question: gates the
   *  re-ask hint below, since nobody can have answered an unsaved one. */
  hasSavedQuestions: boolean;
  /** Shown under the questions, e.g. a question with no prompt. */
  error?: string | null;
}

/** Up to 2 single-choice questions the host adds to the opt-in. Shared
 *  answers nudge people toward the same group. */
export function GoTogetherHostQuestionsEditor({
  questions,
  onChange,
  isLocked,
  hasSavedQuestions,
  error,
}: GoTogetherHostQuestionsEditorProps) {
  const { t } = useTranslation();
  const labelId = useId();
  const isAtQuestionLimit = questions.length >= MAX_HOST_QUESTIONS;
  const shouldShowReaskHint =
    !isLocked && questions.length > 0 && hasSavedQuestions;

  return (
    <Field
      label={t("goTogether:host.questions.label")}
      labelId={labelId}
      isOptional
      hint={
        shouldShowReaskHint ? (
          <>
            {t("goTogether:host.questions.hint")}{" "}
            {t("goTogether:host.questions.reaskHint")}
          </>
        ) : (
          t("goTogether:host.questions.hint")
        )
      }
      error={error}
    >
      <div
        role="group"
        aria-labelledby={labelId}
        aria-describedby={
          error ? `${labelId}-hint ${labelId}-error` : `${labelId}-hint`
        }
        className={styles.questionList}
      >
        {questions.map((question, questionIndex) => (
          <HostQuestionCard
            key={question.key}
            question={question}
            questionNumber={questionIndex + 1}
            isLocked={isLocked}
            onChange={(updated) =>
              onChange(
                questions.map((candidate) =>
                  candidate.key === updated.key ? updated : candidate,
                ),
              )
            }
            onRemove={() =>
              onChange(
                questions.filter((candidate) => candidate.key !== question.key),
              )
            }
          />
        ))}
        {!isLocked && (
          <Button
            variant="ghost"
            className={styles.addQuestion}
            disabled={isAtQuestionLimit}
            onClick={() => onChange([...questions, emptyQuestion()])}
          >
            <FiPlus aria-hidden /> {t("goTogether:host.questions.addQuestion")}
          </Button>
        )}
      </div>
    </Field>
  );
}

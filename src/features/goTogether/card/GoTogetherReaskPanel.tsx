import { useId, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useAnswerGoTogetherHostQuestions } from "../api/useGoTogetherMutations";
import type { HostAnswers, HostQuestion } from "../api/goTogether.types";
import { goTogetherKeys } from "../api/goTogetherKeys";
import {
  STATE_ICONS,
  answerAgainErrorKey,
  answerAgainQuestionsKey,
  shouldRefreshCardAfterAnswerAgain,
} from "./goTogetherCard.data";
import {
  useFocusCardHeading,
  useFocusHeadingAfterStateChange,
} from "./goTogetherCardFocus";
import {
  ErrorLine,
  LeaveMatchingButton,
  PanelHeader,
} from "./GoTogetherStatePanels";
import { HostQuestionStep } from "./HostQuestionStep";
import { useLeaveMatching } from "./useLeaveMatching";
import styles from "./GoTogetherCard.module.css";

/**
 * A waiting member whose host questions changed after they opted in. Only
 * the questions the card asks again show, each with the same choice cards
 * as the opt-in. Saving keeps them waiting with the rest of their answers,
 * and Stop looking stays beside it. A refusal that means the card is out of
 * date (grouped meanwhile, Go together switched off, the questions changed
 * again) refetches the card.
 */
export function GoTogetherReaskPanel({
  slug,
  questions,
}: {
  slug: string;
  questions: HostQuestion[];
}) {
  const { t } = useTranslation();
  const confirmHintId = useId();
  const queryClient = useQueryClient();
  const answerAgain = useAnswerGoTogetherHostQuestions(slug);
  const leaveMatching = useLeaveMatching(slug);
  const focusCardHeading = useFocusCardHeading();
  const focusHeadingAfterStateChange = useFocusHeadingAfterStateChange();
  const [answers, setAnswers] = useState<HostAnswers>({});
  // Option ids are positional, so a host edit can keep every id and change
  // what it means. When the asked questions change, the choices start over
  // (reset during render, so no stale choice is ever shown or sent).
  const questionsKey = answerAgainQuestionsKey(questions);
  const [answeredQuestionsKey, setAnsweredQuestionsKey] =
    useState(questionsKey);
  if (answeredQuestionsKey !== questionsKey) {
    setAnsweredQuestionsKey(questionsKey);
    setAnswers({});
  }
  // Presses on the unavailable save. Each one remounts the hint as an
  // alert, so a screen reader hears why nothing was sent.
  const [unavailablePressCount, setUnavailablePressCount] = useState(0);
  const hasAnsweredAll = questions.every((question) =>
    Boolean(answers[question.id]),
  );
  const isAskingOne = questions.length === 1;

  const submit = () => {
    if (answerAgain.isPending) return;
    if (!hasAnsweredAll) {
      setUnavailablePressCount((previous) => previous + 1);
      return;
    }
    answerAgain.mutate(
      {
        hostAnswers: Object.fromEntries(
          questions.map((question) => [
            question.id,
            answers[question.id] ?? "",
          ]),
        ),
      },
      {
        onSuccess: focusCardHeading,
        onError: (error) => {
          if (!shouldRefreshCardAfterAnswerAgain(error)) return;
          // The refetched state may replace this panel and its button.
          focusHeadingAfterStateChange();
          void queryClient.invalidateQueries({
            queryKey: goTogetherKeys.cardRoot,
          });
        },
      },
    );
  };

  return (
    <>
      <PanelHeader
        icon={STATE_ICONS.answerAgain}
        title={t(
          isAskingOne
            ? "goTogether:card.answerAgain.title"
            : "goTogether:card.answerAgain.titleMany",
        )}
        body={t(
          isAskingOne
            ? "goTogether:card.answerAgain.body"
            : "goTogether:card.answerAgain.bodyMany",
        )}
      />
      <div className={styles.flow}>
        {questions.map((question) => (
          <HostQuestionStep
            key={question.id}
            question={question}
            answer={answers[question.id] ?? ""}
            onAnswer={(optionId) =>
              setAnswers((previous) => ({
                ...previous,
                [question.id]: optionId,
              }))
            }
          />
        ))}
        <ErrorLine
          errorKey={
            answerAgainErrorKey(answerAgain.error) ?? leaveMatching.errorKey
          }
        />
        {!hasAnsweredAll && (
          <p
            key={unavailablePressCount}
            id={confirmHintId}
            className={styles.actionHint}
            role={unavailablePressCount > 0 ? "alert" : undefined}
          >
            {t("goTogether:card.optIn.hint.hostQuestions")}
          </p>
        )}
        <div className={styles.actions}>
          {/* Unavailable stays focusable (`aria-disabled`), so the hint is
              read with the button and a press says why. */}
          <Button
            variant="primary"
            onClick={submit}
            disabled={answerAgain.isPending}
            aria-disabled={!hasAnsweredAll || undefined}
            aria-describedby={hasAnsweredAll ? undefined : confirmHintId}
          >
            {answerAgain.isPending
              ? t("goTogether:card.optIn.sending")
              : t(
                  isAskingOne
                    ? "goTogether:card.answerAgain.save"
                    : "goTogether:card.answerAgain.saveMany",
                )}
          </Button>
          <LeaveMatchingButton leaveMatching={leaveMatching} />
        </div>
      </div>
    </>
  );
}

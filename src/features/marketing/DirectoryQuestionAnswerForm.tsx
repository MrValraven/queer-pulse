import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAnswerQuestion } from "./api/useAnswerQuestion";
import type { ListingPublicQuestion } from "./directoryPlaces";
import s from "./DirectoryQuestions.module.css";

interface Props {
  question: ListingPublicQuestion;
  /** The viewer's own listing ref, present only when they own this listing. */
  ownerRef: string;
  slug: string;
}

/**
 * The owner answering one of their own listing's public questions: a quiet
 * "Answer" affordance that opens an inline composer, seeded with the answer
 * already published when they are revising one. Only ever rendered on a
 * listing the viewer owns; the endpoint enforces the same thing.
 */
export function DirectoryQuestionAnswerForm({
  question,
  ownerRef,
  slug,
}: Props) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const answerQuestion = useAnswerQuestion(ownerRef, slug);
  const [isComposing, setIsComposing] = useState(false);
  const [answer, setAnswer] = useState(question.answer ?? "");

  const canSave = answer.trim().length > 0 && !answerQuestion.isPending;

  const openComposer = () => {
    setAnswer(question.answer ?? "");
    setIsComposing(true);
  };

  const handleSave = () => {
    if (!canSave) return;
    answerQuestion.mutate(
      { questionId: question.id, answer: answer.trim() },
      {
        onSuccess: () => {
          setIsComposing(false);
          showToast(
            t("marketing:directory.detail.questions.answerSuccessToast"),
            "success",
          );
        },
        onError: () =>
          showToast(
            t("marketing:directory.detail.questions.answerErrorToast"),
            "error",
          ),
      },
    );
  };

  if (!isComposing) {
    return (
      <Button variant="ghost" className={s.answerToggle} onClick={openComposer}>
        {question.answer
          ? t("marketing:directory.detail.questions.editAnswerCta")
          : t("marketing:directory.detail.questions.answerCta")}
      </Button>
    );
  }

  return (
    <div className={s.answerComposer}>
      <textarea
        className={s.answerInput}
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        placeholder={t(
          "marketing:directory.detail.questions.answerPlaceholder",
        )}
        rows={3}
        maxLength={2000}
        aria-label={t("marketing:directory.detail.questions.answerCta")}
      />
      <div className={s.answerComposerActions}>
        <Button variant="ghost" onClick={() => setIsComposing(false)}>
          {t("marketing:directory.detail.questions.answerCancel")}
        </Button>
        <Button variant="primary" disabled={!canSave} onClick={handleSave}>
          {answerQuestion.isPending
            ? t("marketing:directory.detail.questions.answerSaving")
            : t("marketing:directory.detail.questions.answerSave")}
        </Button>
      </div>
    </div>
  );
}

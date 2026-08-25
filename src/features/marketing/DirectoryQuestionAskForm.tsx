import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useAuth } from "../../app/providers/authContext";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { readAskQuestionReason, useAskQuestion } from "./api/useAskQuestion";
import s from "./DirectoryQuestions.module.css";

/** The backend's own bounds for a question body. */
const MIN_QUESTION_LENGTH = 8;
const MAX_QUESTION_LENGTH = 500;

/**
 * "Ask the owner something" composer.
 *
 * Member-gated, exactly like leaving a review and saving a listing: a
 * logged-out visitor reads every question and answer on the page and gets a
 * sign-in route when they want to add one of their own.
 *
 * A refusal is shown where the member is looking, in their own words where the
 * backend gave any: the throttle answers 429 with a plain quota reason (how
 * many questions, over what window), which is far more useful than a generic
 * failure toast, so it is rendered inline as the form's error.
 */
export function DirectoryQuestionAskForm({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useToast();
  const askQuestion = useAskQuestion(slug);
  const [body, setBody] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!user) {
    return (
      <div className={s.signIn}>
        {t("marketing:directory.detail.questions.signInPrompt")}{" "}
        <Link to={routes.signIn}>
          {t("marketing:directory.detail.questions.signInCta")}
        </Link>
      </div>
    );
  }

  const trimmedBody = body.trim();
  const canSubmit =
    trimmedBody.length >= MIN_QUESTION_LENGTH && !askQuestion.isPending;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setErrorMessage(null);
    askQuestion.mutate(trimmedBody, {
      onSuccess: () => {
        setBody("");
        showToast(
          t("marketing:directory.detail.questions.successToast"),
          "success",
        );
      },
      onError: (error) =>
        setErrorMessage(
          readAskQuestionReason(error) ??
            t("marketing:directory.detail.questions.errorGeneric"),
        ),
    });
  };

  return (
    <form className={s.askForm} onSubmit={handleSubmit}>
      <label className={s.askLabel} htmlFor="directory-ask-question">
        {t("marketing:directory.detail.questions.askLabel")}
      </label>
      <textarea
        id="directory-ask-question"
        className={s.askInput}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={t("marketing:directory.detail.questions.askPlaceholder")}
        rows={3}
        maxLength={MAX_QUESTION_LENGTH}
      />
      <div className={s.askFoot}>
        <span className={s.askHint}>
          {t("marketing:directory.detail.questions.askHint")}
        </span>
        <Button type="submit" variant="primary" disabled={!canSubmit}>
          {askQuestion.isPending
            ? t("marketing:directory.detail.questions.asking")
            : t("marketing:directory.detail.questions.askCta")}
        </Button>
      </div>
      {errorMessage && (
        <p className={s.askError} role="alert">
          {errorMessage}
        </p>
      )}
    </form>
  );
}

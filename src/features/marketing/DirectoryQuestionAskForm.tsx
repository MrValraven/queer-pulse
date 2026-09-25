import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { FiMessageSquare } from "react-icons/fi";
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
 * Collapsed by default to a single toggle button, so a fresh listing with no
 * questions yet does not open on a large empty form: the question list (or
 * its empty-state hint) is the first thing a visitor sees, and this sits
 * under it. Opening the toggle reveals the form (or the sign-in prompt) in
 * place and moves focus into it; Escape or a Cancel control collapses it
 * again and returns focus to the toggle once the collapse has actually
 * committed (mirrors the `isPreviouslyOpenRef` handoff in
 * `DirectoryReviewFormDisclosure`, since a focus call issued synchronously
 * inside the event handler runs before React has re-rendered the toggle back
 * into the tree and silently finds a null ref).
 *
 * Member-gated, exactly like leaving a review and saving a listing: a
 * logged-out visitor reads every question and answer on the page and, on
 * opening the toggle, gets a sign-in route to the compose form.
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
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const signInLinkRef = useRef<HTMLAnchorElement>(null);
  const isPreviouslyExpandedRef = useRef(false);

  // Track whether someone is signed in as a plain boolean.
  // AuthProvider.refresh() can replace the `user` object with a new one;
  // keying the focus effect below on that identity would rerun it and steal
  // focus back to the textarea while the member is mid-edit.
  const isSignedIn = Boolean(user);

  // Scoped to this listing so two instances (the live page and, in principle,
  // a rendered-twice preview) never collide on the same id.
  const textareaId = `directory-ask-question-${slug}`;

  const collapse = () => setIsExpanded(false);

  // Move focus in both directions once the change has actually committed:
  // into the panel's own first control on open, back to the toggle on a
  // genuine close. `isPreviouslyExpandedRef` guards the very first (collapsed)
  // render so mounting the page never steals focus for a button nobody
  // clicked; a synchronous `.focus()` call inside an event handler instead
  // (the earlier shape of `collapse`) fires before the toggle has
  // re-rendered back into the tree, so its ref reads null and focus is
  // silently dropped.
  useEffect(() => {
    if (isExpanded) {
      if (isSignedIn) {
        textareaRef.current?.focus();
      } else {
        signInLinkRef.current?.focus();
      }
    } else if (isPreviouslyExpandedRef.current) {
      toggleButtonRef.current?.focus();
    }
    isPreviouslyExpandedRef.current = isExpanded;
  }, [isExpanded, isSignedIn]);

  // Escape closes the panel from anywhere inside it. A plain onKeyDown on the
  // wrapping div/form would make it a static element with an interaction
  // handler, so this listens on the panel node itself instead, only while
  // open; it also covers every focusable control (including the submit
  // button) without wiring the handler onto each one individually.
  useEffect(() => {
    if (!isExpanded) return;
    const panelNode = panelRef.current;
    if (!panelNode) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      collapse();
    };
    panelNode.addEventListener("keydown", handleKeyDown);
    return () => panelNode.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded]);

  if (!isExpanded) {
    // Focus moves into the revealed form on open, and back to this button on
    // close (Escape or the form's own Cancel).
    return (
      <div className={s.askToggle}>
        <Button
          ref={toggleButtonRef}
          variant="ghost"
          onClick={() => setIsExpanded(true)}
        >
          <FiMessageSquare aria-hidden />
          {t("marketing:directory.detail.questions.askToggle")}
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div ref={panelRef} className={s.signIn}>
        {t("marketing:directory.detail.questions.signInPrompt")}{" "}
        <Link ref={signInLinkRef} to={routes.signIn}>
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
        collapse();
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
    <div ref={panelRef}>
      <form className={s.askForm} onSubmit={handleSubmit}>
        <label className={s.askLabel} htmlFor={textareaId}>
          {t("marketing:directory.detail.questions.askLabel")}
        </label>
        <textarea
          id={textareaId}
          ref={textareaRef}
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
          <div className={s.askFootActions}>
            <Button type="button" variant="ghost" onClick={collapse}>
              {t("marketing:directory.detail.questions.askCancel")}
            </Button>
            <Button type="submit" variant="primary" disabled={!canSubmit}>
              {askQuestion.isPending
                ? t("marketing:directory.detail.questions.asking")
                : t("marketing:directory.detail.questions.askCta")}
            </Button>
          </div>
        </div>
        {errorMessage && (
          <p className={s.askError} role="alert">
            {errorMessage}
          </p>
        )}
      </form>
    </div>
  );
}

import { useEffect, useId, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button, RadioCardGroup } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  useAcceptGoTogetherPair,
  useOptInGoTogether,
} from "../api/useGoTogetherMutations";
import type {
  HostAnswers,
  HostQuestion,
  OptInBody,
} from "../api/goTogether.types";
import { goTogetherKeys } from "../api/goTogetherKeys";
import { ChoiceCheck } from "./ChoiceCheck";
import { GoTogetherLensStep } from "./GoTogetherLensStep";
import { GoTogetherPartnerPicker } from "./GoTogetherPartnerPicker";
import {
  GO_MODE_OPTIONS,
  NO_LENS,
  cardErrorKey,
  shouldRefreshCardAfter,
  type GoMode,
  type LensChoice,
} from "./goTogetherCard.data";
import {
  focusFirstControlIn,
  useFocusHeadingAfterStateChange,
} from "./goTogetherCardFocus";
import styles from "./GoTogetherCard.module.css";

/** Where the form starts: empty for a first opt-in, the current choice when
 *  a waiting member changes how they are going. */
export interface OptInInitialValues {
  mode?: GoMode;
  partnerSlug?: string | null;
  lens?: LensChoice;
}

/**
 * The opt-in form. `optIn` asks solo or with a friend first; `acceptPair`
 * (the invitee answering a pair invite) skips that. Then the host questions,
 * the lens step and the confirm button. The form stays mounted across a
 * failed submit, so the chosen mode and answers survive an error. When it
 * opens from a button (Accept, Change how I'm going), focus moves to its
 * first control. `shouldShowModeTitle` shows the mode question on screen
 * for a form that opens with no panel title above it.
 */
export function GoTogetherOptInPanel({
  variant,
  hostQuestions,
  initialValues,
  shouldFocusOnOpen = false,
  shouldShowModeTitle = false,
  isPending,
  errorMessage,
  confirmLabel,
  onSubmit,
  onCancel,
}: {
  variant: "optIn" | "acceptPair";
  hostQuestions: HostQuestion[];
  initialValues?: OptInInitialValues;
  shouldFocusOnOpen?: boolean;
  shouldShowModeTitle?: boolean;
  isPending: boolean;
  errorMessage: string | null;
  confirmLabel: string;
  onSubmit: (body: OptInBody) => void;
  onCancel?: () => void;
}) {
  const { t } = useTranslation();
  const modeHeadingId = useId();
  const confirmHintId = useId();
  const flowRef = useRef<HTMLDivElement>(null);
  const isAcceptingPair = variant === "acceptPair";
  const [mode, setMode] = useState<GoMode | "">(initialValues?.mode ?? "");
  const [partnerSlug, setPartnerSlug] = useState<string | null>(
    initialValues?.partnerSlug ?? null,
  );
  const [hostAnswers, setHostAnswers] = useState<HostAnswers>({});
  const [lens, setLens] = useState<LensChoice>(initialValues?.lens ?? NO_LENS);
  const [hasLensConsent, setHasLensConsent] = useState(false);
  // Presses on the unavailable confirm. Each one remounts the hint as an
  // alert, so a screen reader hears why nothing was sent.
  const [unavailablePressCount, setUnavailablePressCount] = useState(0);

  const effectiveMode: GoMode | "" = isAcceptingPair ? "solo" : mode;
  const isModeReady =
    effectiveMode === "solo" || (effectiveMode === "pair" && !!partnerSlug);
  const hasAnsweredHost = hostQuestions.every((question) =>
    Boolean(hostAnswers[question.id]),
  );
  const isLensReady = lens === NO_LENS || hasLensConsent;
  const canConfirm = isModeReady && hasAnsweredHost && isLensReady;
  // What still blocks the confirm button, first missing step first.
  const confirmHintKey = !isModeReady
    ? "goTogether:card.optIn.hint.partner"
    : !hasAnsweredHost
      ? "goTogether:card.optIn.hint.hostQuestions"
      : !isLensReady
        ? "goTogether:card.optIn.hint.lensConsent"
        : null;

  useEffect(() => {
    if (shouldFocusOnOpen) focusFirstControlIn(flowRef.current);
  }, [shouldFocusOnOpen]);

  const submit = () => {
    if (isPending) return;
    if (!canConfirm) {
      setUnavailablePressCount((previous) => previous + 1);
      return;
    }
    const pairPartnerSlug =
      !isAcceptingPair && mode === "pair" ? partnerSlug : null;
    onSubmit({
      ...(pairPartnerSlug
        ? { mode: "pair" as const, partnerSlug: pairPartnerSlug }
        : { mode: "solo" as const }),
      // Only the questions on screen: a refetched card may have dropped one.
      hostAnswers: Object.fromEntries(
        hostQuestions.map((question) => [
          question.id,
          hostAnswers[question.id] ?? "",
        ]),
      ),
      lens: lens === NO_LENS ? null : lens,
      lensConsent: lens !== NO_LENS && hasLensConsent,
    });
  };

  return (
    <div className={styles.flow} ref={flowRef}>
      {!isAcceptingPair && (
        <fieldset className={styles.step}>
          <legend
            id={modeHeadingId}
            className={shouldShowModeTitle ? styles.stepTitle : styles.srOnly}
          >
            {t("goTogether:card.mode.title")}
          </legend>
          <RadioCardGroup<GoMode>
            value={mode}
            onChange={setMode}
            ariaLabel={t("goTogether:card.mode.title")}
            ariaLabelledBy={modeHeadingId}
            className={styles.modeChoices}
            optionClassName={styles.choice}
            checkedClassName={styles.choiceChecked}
            options={GO_MODE_OPTIONS.map((option) => ({
              id: option.id,
              render: (
                <>
                  <option.icon aria-hidden className={styles.choiceIcon} />
                  <span className={styles.choiceLabel}>
                    {t(option.labelKey)}
                  </span>
                  <span className={styles.choiceDescription}>
                    {t(option.descriptionKey)}
                  </span>
                  <ChoiceCheck isChecked={mode === option.id} />
                </>
              ),
            }))}
          />
        </fieldset>
      )}
      {!isAcceptingPair && mode === "pair" && (
        <GoTogetherPartnerPicker
          partnerSlug={partnerSlug}
          onPartnerChange={setPartnerSlug}
        />
      )}
      {effectiveMode !== "" && (
        <>
          {hostQuestions.map((question) => (
            <HostQuestionStep
              key={question.id}
              question={question}
              answer={hostAnswers[question.id] ?? ""}
              onAnswer={(optionId) =>
                setHostAnswers((previous) => ({
                  ...previous,
                  [question.id]: optionId,
                }))
              }
            />
          ))}
          <GoTogetherLensStep
            lens={lens}
            onLensChange={setLens}
            hasConsent={hasLensConsent}
            onConsentChange={setHasLensConsent}
          />
          {errorMessage && (
            <p className={styles.error} role="alert">
              {errorMessage}
            </p>
          )}
          {confirmHintKey && (
            <p
              key={unavailablePressCount}
              id={confirmHintId}
              className={styles.actionHint}
              role={unavailablePressCount > 0 ? "alert" : undefined}
            >
              {t(confirmHintKey)}
            </p>
          )}
          <div className={styles.actions}>
            {/* Unavailable stays focusable (`aria-disabled`), so the hint is
                read with the button and a press says why. */}
            <Button
              variant="primary"
              onClick={submit}
              disabled={isPending}
              aria-disabled={!canConfirm || undefined}
              aria-describedby={confirmHintKey ? confirmHintId : undefined}
            >
              {isPending ? t("goTogether:card.optIn.sending") : confirmLabel}
            </Button>
            {onCancel && (
              <Button variant="ghost" onClick={onCancel} disabled={isPending}>
                {t("goTogether:card.optIn.cancel")}
              </Button>
            )}
          </div>
        </>
      )}
      {effectiveMode === "" && onCancel && (
        <div className={styles.actions}>
          <Button variant="ghost" onClick={onCancel}>
            {t("goTogether:card.optIn.cancel")}
          </Button>
        </div>
      )}
    </div>
  );
}

/** One host question: the host's own prompt and options, single choice. */
function HostQuestionStep({
  question,
  answer,
  onAnswer,
}: {
  question: HostQuestion;
  answer: string;
  onAnswer: (optionId: string) => void;
}) {
  const headingId = useId();
  return (
    <fieldset className={styles.step}>
      <legend id={headingId} className={styles.stepTitle}>
        {question.prompt}
      </legend>
      <RadioCardGroup<string>
        value={answer}
        onChange={onAnswer}
        ariaLabel={question.prompt}
        ariaLabelledBy={headingId}
        className={styles.choices}
        optionClassName={styles.choice}
        checkedClassName={styles.choiceChecked}
        options={question.options.map((option) => ({
          id: option.id,
          render: (
            <>
              <span className={styles.choiceLabel}>{option.label}</span>
              <ChoiceCheck isChecked={answer === option.id} />
            </>
          ),
        }))}
      />
    </fieldset>
  );
}

/**
 * The opt-in form wired to its write. `optIn` posts the opt-in (a first
 * opt-in, or a waiting member changing how they go); `acceptPair` answers a
 * pair invite with the invitee's own host answers and lens.
 */
export function GoTogetherOptInFlow({
  slug,
  variant,
  hostQuestions,
  initialValues,
  shouldFocusOnOpen,
  shouldShowModeTitle,
  confirmLabel,
  onCancel,
  onDone,
}: {
  slug: string;
  variant: "optIn" | "acceptPair";
  hostQuestions: HostQuestion[];
  initialValues?: OptInInitialValues;
  shouldFocusOnOpen?: boolean;
  shouldShowModeTitle?: boolean;
  confirmLabel: string;
  onCancel?: () => void;
  onDone?: () => void;
}) {
  const optIn = useOptInGoTogether(slug);
  const acceptPair = useAcceptGoTogetherPair(slug);
  const mutation = variant === "acceptPair" ? acceptPair : optIn;
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const focusHeadingAfterStateChange = useFocusHeadingAfterStateChange();
  const errorKey = cardErrorKey(mutation.error);
  // Some refusals mean the card itself is out of date (already grouped,
  // matching closed): refetch it so the right state replaces the form.
  const callbacks = {
    onSuccess: () => onDone?.(),
    onError: (error: Error) => {
      if (!shouldRefreshCardAfter(error)) return;
      // The refetched state may replace this form and its focused button.
      focusHeadingAfterStateChange();
      void queryClient.invalidateQueries({ queryKey: goTogetherKeys.cardRoot });
    },
  };

  const submit = (body: OptInBody) => {
    if (variant === "acceptPair") {
      acceptPair.mutate(
        {
          hostAnswers: body.hostAnswers,
          lens: body.lens,
          lensConsent: body.lensConsent,
        },
        callbacks,
      );
      return;
    }
    optIn.mutate(body, callbacks);
  };

  return (
    <GoTogetherOptInPanel
      variant={variant}
      hostQuestions={hostQuestions}
      initialValues={initialValues}
      shouldFocusOnOpen={shouldFocusOnOpen}
      shouldShowModeTitle={shouldShowModeTitle}
      isPending={mutation.isPending}
      errorMessage={errorKey ? t(errorKey) : null}
      confirmLabel={confirmLabel}
      onSubmit={submit}
      onCancel={onCancel}
    />
  );
}

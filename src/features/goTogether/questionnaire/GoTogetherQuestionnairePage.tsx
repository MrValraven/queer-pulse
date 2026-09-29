import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiAlertCircle, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { routes } from "../../../app/routeMap";
import { useAuth } from "../../../app/providers/authContext";
import { useProfileData } from "../../../app/providers/useProfile";
import { PageShell } from "../../../shared/components/layout";
import {
  Button,
  Eyebrow,
  LoadErrorState,
  SkeletonCard,
  Stepper,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { safeInternalPath } from "../../../shared/lib/safeInternalPath";
import { goTogetherErrorCode } from "../api/goTogether.api";
import type { FriendMatchAnswers } from "../api/goTogether.types";
import {
  MAX_INTEREST_TAGS,
  MAX_MUSIC_TAGS,
} from "../goTogetherQuestionnaire.data";
import {
  useFriendMatchProfile,
  useSaveFriendMatchProfile,
} from "../api/useFriendMatchProfile";
import {
  QUESTIONNAIRE_STEPS,
  type QuestionnaireStepId,
} from "./questionnaireSteps.data";
import { questionnaireDraftKey } from "./questionnaireDraftStorage";
import { PickCounter } from "./PickCounter";
import {
  useQuestionnaireDraft,
  type QuestionnaireDraftState,
} from "./useQuestionnaireDraft";
import { AreaStep } from "./steps/AreaStep";
import { ConsentStep } from "./steps/ConsentStep";
import { DealbreakersStep } from "./steps/DealbreakersStep";
import { EnergyStep } from "./steps/EnergyStep";
import { HumourStep } from "./steps/HumourStep";
import { IntentStep } from "./steps/IntentStep";
import { InterestsStep } from "./steps/InterestsStep";
import { MusicStep } from "./steps/MusicStep";
import { ValuesStep } from "./steps/ValuesStep";
import styles from "./GoTogetherQuestionnaire.module.css";

/** Step-specific wording for a disabled Next or Save. Every other step
 *  uses the generic "Answer every question on this step" hint. */
const INCOMPLETE_HINT_KEYS: Partial<Record<QuestionnaireStepId, string>> = {
  interests: "goTogether:questionnaire.page.interestsHint",
  consent: "goTogether:questionnaire.page.consentHint",
};

/** The chip steps with a ceiling. Their pick counter rides in the sticky
 *  action bar, so the limit stays in view while the chips scroll. */
const PICK_LIMITS: Partial<
  Record<QuestionnaireStepId, { field: "interests" | "music"; maximum: number }>
> = {
  interests: { field: "interests", maximum: MAX_INTEREST_TAGS },
  music: { field: "music", maximum: MAX_MUSIC_TAGS },
};

function saveErrorKey(error: Error | null): string | null {
  if (error == null) return null;
  const code = goTogetherErrorCode(error);
  if (code === "GO_TOGETHER_INVALID_ANSWERS") {
    return "goTogether:questionnaire.error.invalid";
  }
  if (code === "GO_TOGETHER_CONSENT_REQUIRED") {
    return "goTogether:questionnaire.error.consent";
  }
  return "goTogether:questionnaire.error.generic";
}

function StepBody({
  questionnaire,
  headingId,
  onSkipArea,
}: {
  questionnaire: QuestionnaireDraftState;
  headingId: string;
  onSkipArea: () => void;
}) {
  const stepProps = { questionnaire, headingId };
  const stepId = QUESTIONNAIRE_STEPS[questionnaire.stepIndex]?.id;
  switch (stepId) {
    case "values":
      return <ValuesStep {...stepProps} />;
    case "humour":
      return <HumourStep {...stepProps} />;
    case "interests":
      return <InterestsStep {...stepProps} />;
    case "music":
      return <MusicStep {...stepProps} />;
    case "energy":
      return <EnergyStep {...stepProps} />;
    case "intent":
      return <IntentStep {...stepProps} />;
    case "dealbreakers":
      return <DealbreakersStep {...stepProps} />;
    case "area":
      return <AreaStep {...stepProps} onSkip={onSkipArea} />;
    case "consent":
      return <ConsentStep {...stepProps} />;
    default:
      return null;
  }
}

interface QuestionnaireActionsProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  /** Why Next or Save is unavailable, once the member has pressed it. */
  hintKey: string;
  isStepComplete: boolean;
  /** True after a press on the unavailable Next or Save of this step. */
  isHintShown: boolean;
  isSaving: boolean;
  returnPath: string;
  /** The pick counter on the chip steps, or nothing. */
  pickCounter: ReactNode;
  onBack: () => void;
  onNext: () => void;
  onSave: () => void;
  /** A press on Next or Save while the step is still incomplete. */
  onUnavailablePress: () => void;
}

/** The sticky Back / Next (or Save) bar, clear of the home indicator and the
 *  installed app's tab bar. An incomplete step keeps Next focusable but
 *  unavailable (`aria-disabled`), and a press on it says why in plain words,
 *  so the hint never crowds the screen before it is needed. */
function QuestionnaireActions({
  isFirstStep,
  isLastStep,
  hintKey,
  isStepComplete,
  isHintShown,
  isSaving,
  returnPath,
  pickCounter,
  onBack,
  onNext,
  onSave,
  onUnavailablePress,
}: QuestionnaireActionsProps) {
  const { t } = useTranslation();
  const hintId = useId();
  const backContent = (
    <>
      <FiArrowLeft aria-hidden /> {t("goTogether:questionnaire.page.back")}
    </>
  );
  const isUnavailable = !isStepComplete;
  const describedBy = isHintShown ? hintId : undefined;
  const pressPrimary = (action: () => void) => () => {
    if (isUnavailable) {
      onUnavailablePress();
      return;
    }
    action();
  };
  return (
    <div className={styles.actionBar}>
      {pickCounter}
      {isHintShown && (
        <p id={hintId} className={styles.actionHint} role="alert">
          {t(hintKey)}
        </p>
      )}
      <div className={styles.actionRow}>
        {isFirstStep ? (
          <Button variant="ghost" to={returnPath}>
            {backContent}
          </Button>
        ) : (
          <Button variant="ghost" onClick={onBack} disabled={isSaving}>
            {backContent}
          </Button>
        )}
        {isLastStep ? (
          <Button
            variant="primary"
            onClick={pressPrimary(onSave)}
            disabled={isSaving}
            aria-disabled={isUnavailable || undefined}
            aria-describedby={describedBy}
          >
            {t(
              isSaving
                ? "goTogether:questionnaire.page.saving"
                : "goTogether:questionnaire.page.save",
            )}
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={pressPrimary(onNext)}
            aria-disabled={isUnavailable || undefined}
            aria-describedby={describedBy}
          >
            {t("goTogether:questionnaire.page.next")}{" "}
            <FiArrowRight aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
}

interface QuestionnaireFlowProps {
  initialAnswers: FriendMatchAnswers | null;
  profileLanguages: readonly string[];
  /** From `questionnaireDraftKey(memberId)`. */
  storageKey: string;
  returnPath: string;
}

function QuestionnaireFlow({
  initialAnswers,
  profileLanguages,
  storageKey,
  returnPath,
}: QuestionnaireFlowProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const questionnaire = useQuestionnaireDraft({
    initialAnswers,
    profileLanguages,
    storageKey,
  });
  const saveMutation = useSaveFriendMatchProfile();
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shouldFocusHeadingRef = useRef(false);
  // The step whose unavailable Next or Save was pressed. Moving to another
  // step hides the hint again without a reset.
  const [hintStepIndex, setHintStepIndex] = useState<number | null>(null);
  const { stepIndex } = questionnaire;
  const totalSteps = QUESTIONNAIRE_STEPS.length;
  const currentStep = QUESTIONNAIRE_STEPS[stepIndex] ?? QUESTIONNAIRE_STEPS[0]!;
  const isLastStep = stepIndex === totalSteps - 1;
  const isStepComplete = questionnaire.isStepComplete(currentStep.id);
  const pickLimit = PICK_LIMITS[currentStep.id];
  const errorKey = saveErrorKey(saveMutation.error);

  // Every step change lands focus on the new heading, so keyboard and screen
  // reader users start the step at its question. The first render keeps the
  // browser's own focus.
  useEffect(() => {
    if (!shouldFocusHeadingRef.current) return;
    shouldFocusHeadingRef.current = false;
    headingRef.current?.focus();
  }, [stepIndex]);

  const goToStep = (nextIndex: number) => {
    shouldFocusHeadingRef.current = true;
    saveMutation.reset();
    questionnaire.setStepIndex(nextIndex);
  };

  const save = () => {
    const answers = questionnaire.toAnswers();
    if (answers == null) {
      // Only reachable from a resumed draft that lost an answer: send the
      // member to the first step still missing one.
      const firstIncompleteIndex = QUESTIONNAIRE_STEPS.findIndex(
        (step) => !questionnaire.isStepComplete(step.id),
      );
      if (firstIncompleteIndex >= 0) goToStep(firstIncompleteIndex);
      return;
    }
    if (!questionnaire.hasConsented) return;
    saveMutation.mutate(answers, {
      onSuccess: () => {
        questionnaire.clearSavedDraft();
        void navigate(returnPath);
      },
    });
  };

  return (
    <div className={styles.flow}>
      <header className={styles.header}>
        <Eyebrow>{t("goTogether:product.name")}</Eyebrow>
        <Stepper
          steps={QUESTIONNAIRE_STEPS.map((step) => ({
            key: step.id,
            ariaLabel: t(step.shortLabelKey),
          }))}
          current={stepIndex}
          size="sm"
          ariaLabel={t("goTogether:questionnaire.page.progressLabel")}
          className={styles.stepper}
        />
        <p className={styles.progress}>
          {t("goTogether:questionnaire.page.stepOf", {
            step: stepIndex + 1,
            total: totalSteps,
            label: t(currentStep.shortLabelKey),
          })}
        </p>
      </header>
      <section aria-labelledby={headingId} className={styles.stepBody}>
        <h1
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className={styles.title}
        >
          {t(currentStep.titleKey)}
        </h1>
        {stepIndex === 0 && (
          <p className={styles.pageIntro}>
            {t("goTogether:questionnaire.page.intro")}
          </p>
        )}
        <p className={styles.intro}>{t(currentStep.introKey)}</p>
        <StepBody
          questionnaire={questionnaire}
          headingId={headingId}
          onSkipArea={() => {
            questionnaire.setChoice("area", null);
            goToStep(stepIndex + 1);
          }}
        />
      </section>
      {errorKey != null && (
        <p className={styles.saveError} role="alert">
          <FiAlertCircle aria-hidden /> {t(errorKey)}
        </p>
      )}
      <QuestionnaireActions
        isFirstStep={stepIndex === 0}
        isLastStep={isLastStep}
        hintKey={
          INCOMPLETE_HINT_KEYS[currentStep.id] ??
          "goTogether:questionnaire.page.incompleteHint"
        }
        isStepComplete={isStepComplete}
        isHintShown={!isStepComplete && hintStepIndex === stepIndex}
        isSaving={saveMutation.isPending}
        returnPath={returnPath}
        pickCounter={
          pickLimit == null ? null : (
            <PickCounter
              count={questionnaire.draft[pickLimit.field].length}
              maximum={pickLimit.maximum}
            />
          )
        }
        onBack={() => goToStep(stepIndex - 1)}
        onNext={() => goToStep(stepIndex + 1)}
        onSave={save}
        onUnavailablePress={() => setHintStepIndex(stepIndex)}
      />
    </div>
  );
}

/**
 * The Go together questionnaire: nine short steps, answered once and
 * editable any time. Saved answers prefill every step; an unsaved draft
 * survives a reload. After a save it returns to `?return=` (a same-origin
 * path only) or to the gatherings list.
 */
export function GoTogetherQuestionnairePage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  // The repo's hardened guard: rejects backslashes and control characters
  // (`/%09/evil.example`), then checks the parsed origin.
  const returnPath = safeInternalPath(
    searchParams.get("return"),
    routes.gatherings,
  );
  const profileQuery = useFriendMatchProfile();
  // The languages prefill and the draft key are read once when the flow
  // mounts, so the flow waits for the member's own profile too.
  const { profile, isProfileLoading } = useProfileData();
  const { user } = useAuth();

  let content;
  if (profileQuery.isPending || isProfileLoading) {
    content = (
      <div className={styles.loading} aria-busy="true">
        <SkeletonCard />
      </div>
    );
  } else if (profileQuery.isError) {
    content = (
      <LoadErrorState
        title={t("goTogether:questionnaire.page.loadErrorTitle")}
        onRetry={() => void profileQuery.refetch()}
      />
    );
  } else {
    content = (
      <QuestionnaireFlow
        key={questionnaireDraftKey(user?.id)}
        initialAnswers={profileQuery.data.answers}
        profileLanguages={profile.languages ?? []}
        storageKey={questionnaireDraftKey(user?.id)}
        returnPath={returnPath}
      />
    );
  }

  return (
    <PageShell>
      <div className={styles.page}>{content}</div>
    </PageShell>
  );
}

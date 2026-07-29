import { useCallback, useState } from "react";
import { useSubmitFlow, type FlowStatus } from "./useSubmitFlow";

/**
 * Shared building blocks for the multi-step "wizard" forms scattered across the
 * app (list a business, start a community, post a job, post an opportunity,
 * apply to partner). Each of those used to hand-roll its own step index,
 * per-step "what's still missing" gate, required-field/touched validation and
 * submit lifecycle. These primitives consolidate the identical bits so a wizard
 * keeps only the parts that are genuinely bespoke to it.
 */

export interface UseWizardFormOptions {
  /** Total number of steps in the wizard — used to clamp navigation. */
  stepCount: number;
  /** Step the wizard starts on. Defaults to the first step (index 0). */
  initialStepIndex?: number;
  /**
   * Per-step gate. Return `true` when everything the given step requires has
   * been filled in; `goToNextStep` refuses to advance while it returns `false`.
   * Defaults to always-allowed, so a wizard whose page owns the gating (e.g.
   * showing inline errors before advancing) can leave this out.
   */
  isStepComplete?: (stepIndex: number) => boolean;
}

export interface WizardForm {
  /** Index of the step currently on screen. */
  currentStepIndex: number;
  /** Jump to an arbitrary step (clamped into range). */
  goToStep: (stepIndex: number) => void;
  /** Advance one step, but only when `isStepComplete(current)` allows it. */
  goToNextStep: () => void;
  /** Step one back (clamped at the first step). */
  goToPreviousStep: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  /** Whether the given step has met its requirements. */
  canAdvanceFromStep: (stepIndex: number) => boolean;
  /** idle → sending → done lifecycle, composed from `useSubmitFlow`. */
  submissionStatus: FlowStatus;
  isSending: boolean;
  isDone: boolean;
  submit: (onComplete?: () => void, durationMilliseconds?: number) => void;
  resetSubmission: () => void;
}

/**
 * Drives step navigation for a wizard form and folds in the simulated submit
 * lifecycle (via `useSubmitFlow`) so a single hook covers both concerns. Holds
 * no form data itself — the feature keeps its own draft/state hook and passes a
 * per-step `isStepComplete` gate in.
 */
export function useWizardForm({
  stepCount,
  initialStepIndex = 0,
  isStepComplete,
}: UseWizardFormOptions): WizardForm {
  const lastStepIndex = Math.max(stepCount - 1, 0);
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStepIndex);
  const submitFlow = useSubmitFlow();

  const clampStepIndex = useCallback(
    (stepIndex: number) => Math.min(Math.max(stepIndex, 0), lastStepIndex),
    [lastStepIndex],
  );

  const canAdvanceFromStep = useCallback(
    (stepIndex: number) => (isStepComplete ? isStepComplete(stepIndex) : true),
    [isStepComplete],
  );

  const goToStep = useCallback(
    (stepIndex: number) => setCurrentStepIndex(clampStepIndex(stepIndex)),
    [clampStepIndex],
  );

  const goToNextStep = useCallback(() => {
    setCurrentStepIndex((current) =>
      canAdvanceFromStep(current) ? clampStepIndex(current + 1) : current,
    );
  }, [canAdvanceFromStep, clampStepIndex]);

  const goToPreviousStep = useCallback(() => {
    setCurrentStepIndex((current) => clampStepIndex(current - 1));
  }, [clampStepIndex]);

  return {
    currentStepIndex,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    isFirstStep: currentStepIndex <= 0,
    isLastStep: currentStepIndex >= lastStepIndex,
    canAdvanceFromStep,
    submissionStatus: submitFlow.status,
    isSending: submitFlow.sending,
    isDone: submitFlow.done,
    submit: submitFlow.submit,
    resetSubmission: submitFlow.reset,
  };
}

/**
 * Turns a "still-missing items, keyed by step index" map into an `canAdvance`
 * predicate: a step is advanceable once it has no outstanding items. Shared by
 * the wizards that surface a per-step checklist (list a business, start a
 * community) and hold their step index in the page rather than the form hook.
 */
export function useStepGate(
  missingItemsByStep: Record<number, readonly unknown[]>,
): (stepIndex: number) => boolean {
  return useCallback(
    (stepIndex: number) => (missingItemsByStep[stepIndex]?.length ?? 0) === 0,
    [missingItemsByStep],
  );
}

export interface UseRequiredFieldValidationOptions<
  Values,
  FieldKey extends keyof Values,
> {
  /** The current form values. */
  values: Values;
  /** The subset of fields that must be non-blank to submit. */
  requiredFields: readonly FieldKey[];
  /** Message shown for a blank required field (once the form is submitted). */
  buildError: (field: FieldKey) => string;
}

export interface RequiredFieldValidation<FieldKey> {
  /** Required fields that are currently blank. */
  missingFields: FieldKey[];
  /** True when no required field is blank. */
  isValid: boolean;
  /** True once `markSubmitted` has fired — errors stay hidden until then. */
  hasBeenSubmitted: boolean;
  markSubmitted: () => void;
  /** The error for a field, or `null` while it's valid or not yet submitted. */
  errorFor: (field: FieldKey) => string | null;
}

/**
 * The "required fields + only show errors after a submit attempt" pattern used
 * by the single-screen application forms (post an opportunity, apply to
 * partner). A field counts as missing when its string form is blank, matching
 * the previous per-hook `REQUIRED.filter((f) => !String(state[f]).trim())`.
 */
export function useRequiredFieldValidation<
  Values,
  FieldKey extends keyof Values,
>({
  values,
  requiredFields,
  buildError,
}: UseRequiredFieldValidationOptions<Values, FieldKey>): RequiredFieldValidation<FieldKey> {
  const [hasBeenSubmitted, setHasBeenSubmitted] = useState(false);

  const missingFields = requiredFields.filter(
    (field) => !String(values[field]).trim(),
  );
  const isValid = missingFields.length === 0;

  const markSubmitted = useCallback(() => setHasBeenSubmitted(true), []);

  const errorFor = (field: FieldKey): string | null => {
    if (!hasBeenSubmitted) return null;
    return missingFields.includes(field) ? buildError(field) : null;
  };

  return {
    missingFields,
    isValid,
    hasBeenSubmitted,
    markSubmitted,
    errorFor,
  };
}

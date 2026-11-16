import { PILL_LABEL_KEYS, TOTAL_STEPS } from "./listBusiness.data";

const LAST_STEP = TOTAL_STEPS - 1;

/**
 * A stored draft step made safe to show and to seed the wizard with. An old or
 * hand-edited payload can carry anything: a negative, a fraction, a step past
 * the review. Non-finite or negative reads as 0, a fraction rounds down, and
 * anything past the last step lands on the last step.
 */
export function clampDraftStep(step: number): number {
  if (!Number.isFinite(step) || step < 0) return 0;
  return Math.min(Math.floor(step), LAST_STEP);
}

/** The values for the "Step {number} of {total}: {label}" line on a draft
 *  card, matching the wizard's own step line. `labelKey` is a catalog key. */
export function draftStepLineArgs(step: number): {
  number: number;
  total: number;
  labelKey: string;
} {
  const clampedStep = clampDraftStep(step);
  return {
    number: clampedStep + 1,
    total: TOTAL_STEPS,
    labelKey: PILL_LABEL_KEYS[clampedStep] ?? "",
  };
}

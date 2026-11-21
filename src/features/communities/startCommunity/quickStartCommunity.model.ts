import { TOTAL_STEPS, type CommunityDraft } from "./startCommunity.data";

/** One of the three steps of the quick start flow a phone opens on. */
export type QuickStep = 1 | 2 | 3;

export const QUICK_STEP_COUNT = 3;

/** The last quick step, where the founder opens the community. */
export const QUICK_OPEN_STEP: QuickStep = 3;

/** True for 1, 2 or 3, the only steps the quick flow has. */
export function isQuickStep(value: unknown): value is QuickStep {
  return value === 1 || value === 2 || value === 3;
}

/**
 * The catalog keys each quick step still needs before the founder can move on.
 * Step three asks for a shared value only when the draft holds none, because
 * the wizard's preset values stand in for the founder's own on the quick flow.
 */
export function quickMissingByStep(
  draft: CommunityDraft,
): Record<QuickStep, string[]> {
  const missing: Record<QuickStep, string[]> = { 1: [], 2: [], 3: [] };
  if (!draft.name.trim()) missing[1].push("communities:start.missing.name");
  if (!draft.type) missing[1].push("communities:start.missing.category");
  if (!draft.tagline.trim())
    missing[1].push("communities:start.missing.tagline");
  if (!draft.purpose.trim())
    missing[2].push("communities:start.missing.purpose");
  if (!draft.whoFor.trim()) missing[2].push("communities:start.missing.whoFor");
  if (draft.rules.length === 0)
    missing[3].push("communities:start.missing.rules");
  if (!draft.accessTier) missing[3].push("communities:start.missing.access");
  if (!draft.handle.trim()) missing[3].push("communities:start.missing.handle");
  if (!draft.consent) missing[3].push("communities:start.missing.consent");
  return missing;
}

const QUICK_STEPS: QuickStep[] = [1, 2, 3];

/** The first quick step with something missing, else the step that opens the community. */
export function firstOpenQuickStep(
  missing: Record<QuickStep, string[]>,
): QuickStep {
  const openStep = QUICK_STEPS.find(
    (quickStep) => missing[quickStep].length > 0,
  );
  return openStep ?? QUICK_OPEN_STEP;
}

/** The lowest wizard chapter with something missing, else the confirm chapter. */
export function firstOpenChapter(
  missingByStep: Record<number, string[]>,
): number {
  const openChapters = Object.entries(missingByStep)
    .filter(([, missingKeys]) => missingKeys.length > 0)
    .map(([chapter]) => Number(chapter));
  if (openChapters.length === 0) return TOTAL_STEPS - 1;
  return Math.min(...openChapters);
}

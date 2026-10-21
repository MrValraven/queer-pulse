import { useUnsavedChangesGuard } from "../../../shared/hooks/useUnsavedChangesGuard";
import { useTranslation } from "../../../shared/i18n/useTranslation";

export interface StudioUploadLeaveGuardState {
  /** Conversions, creates, PUTs or confirms still running. Leaving
   *  unmounts the flow, which stops them. */
  hasActiveUploads: boolean;
  /** Files that stopped (failed or cancelled) and wait in memory for Retry.
   *  Leaving drops them, so they would need adding again. */
  hasHeldFiles?: boolean;
  /** Release, track or episode details typed but not saved yet. */
  hasUnsavedDetails: boolean;
  /** Query params that name the draft on screen (`release`, and `episode`
   *  on the episode page). A move on the same path that keeps them is a
   *  step inside the flow; one that drops or changes them leaves it. */
  keptParams?: readonly string[];
}

/** The leave dialog's body: running uploads outrank held files, which
 *  outrank details, because a stopped upload costs the most to redo. */
export function leaveGuardMessageKeyOf({
  hasActiveUploads,
  hasHeldFiles = false,
}: StudioUploadLeaveGuardState): string {
  if (hasActiveUploads) return "studio:uploadFlow.leave.uploadsBody";
  if (hasHeldFiles) return "studio:uploadFlow.leave.heldFilesBody";
  return "studio:uploadFlow.leave.detailsBody";
}

/** Values that stand for "no draft yet": an empty param, or an episode's
 *  `new`. Only these may change, and only to the id the page just made. */
const PLACEHOLDER_VALUES: ReadonlySet<string> = new Set(["new"]);

/** The id each param may take next: the draft or episode this page itself
 *  just created. One upload page is mounted at a time. */
const expectedDraftValues = new Map<string, string>();

/** Called right before the page puts a just-created id in the address. */
export function expectDraftParam(param: string, value: string): void {
  expectedDraftValues.set(param, value);
}

/** True when `destination` keeps the draft this page stands on: every kept
 *  param stays as it is, or a placeholder becomes the id the page created. */
export function isStepWithinDraft(
  keptParams: readonly string[],
  current: URL,
  destination: URL,
  expected: ReadonlyMap<string, string> = expectedDraftValues,
): boolean {
  return keptParams.every((param) => {
    const before = current.searchParams.get(param);
    const after = destination.searchParams.get(param);
    if (after === before) return true;
    const isPlaceholder = before === null || PLACEHOLDER_VALUES.has(before);
    return isPlaceholder && after !== null && expected.get(param) === after;
  });
}

/**
 * Asks before the upload flow is left while uploads run, files wait for
 * Retry or details are unsaved: a nav click, a tab close, browser Back and
 * Android Back all prompt, so nothing stops silently. Moving between the
 * flow's own steps (same path, same draft) never prompts, and Back between
 * steps walks the steps; a link that drops the draft ("New release", the
 * creator Upload link, leaving an episode) asks like any other exit.
 */
export function useStudioUploadLeaveGuard(
  state: StudioUploadLeaveGuardState,
): void {
  const { t } = useTranslation();
  const keptParams = state.keptParams ?? ["release"];
  useUnsavedChangesGuard({
    active:
      state.hasActiveUploads ||
      (state.hasHeldFiles ?? false) ||
      state.hasUnsavedDetails,
    confirmMessage: t(leaveGuardMessageKeyOf(state)),
    guardBackButton: true,
    shouldAllowQueryChanges: true,
    shouldAllowNavigation: (destination) =>
      isStepWithinDraft(keptParams, new URL(window.location.href), destination),
  });
}

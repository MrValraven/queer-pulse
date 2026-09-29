import { ApiError } from "../../shared/api/client";
import { isAccountRestricted } from "../../shared/api/errorMessage";
import { isPersonaEditConflict } from "./api/personaEditConflict";
import { PUBLISH_REQUIREMENTS } from "./publishChecklist.data";

/** Every publish checklist code mapped to its translated fail copy. */
const FAIL_KEY_BY_UNMET_CODE: Record<string, string> = Object.fromEntries(
  PUBLISH_REQUIREMENTS.flatMap((requirement) =>
    Object.entries(requirement.failKey),
  ),
);

/**
 * The translated copy for a persona write's typed refusal, or null when the
 * error has none (the caller then falls back to its own copy):
 * - 403 `ACCOUNT_RESTRICTED` (ENG-448): the restriction copy naming the appeal.
 * - 409 `HANDLE_TAKEN` (a published rename that lost a claim race) and 422
 *   `SUBPROFILE_NOT_READY` (a handle the server will not issue), PRD-427:
 *   both carry `unmet` codes, and the publish checklist already holds the
 *   fail copy for each. The first code with copy wins; a `HANDLE_TAKEN` with
 *   no usable code reads as the taken-handle copy.
 */
export function personaRefusalMessageKey(error: unknown): string | null {
  if (isAccountRestricted(error)) return "shared:apiError.accountRestricted";
  if (!(error instanceof ApiError)) return null;
  const body = error.data as { code?: unknown; unmet?: unknown } | null;
  const isHandleTaken = error.status === 409 && body?.code === "HANDLE_TAKEN";
  const isNotReady =
    error.status === 422 && body?.code === "SUBPROFILE_NOT_READY";
  if (!isHandleTaken && !isNotReady) return null;
  const unmet = body?.unmet;
  const unmetCodes: unknown[] = Array.isArray(unmet) ? unmet : [];
  const failKey = unmetCodes
    .map((code) =>
      typeof code === "string" ? FAIL_KEY_BY_UNMET_CODE[code] : undefined,
    )
    .find((key): key is string => key !== undefined);
  if (failKey) return failKey;
  return isHandleTaken ? (FAIL_KEY_BY_UNMET_CODE.handle_taken ?? null) : null;
}

/** One dirty area's request inside the editor's save, and the baseline advance
 *  that runs only on its success. `run` receives the `editVersion` the request
 *  must carry as its `expectedEditVersion` and resolves with the persona the
 *  server saved, whose `editVersion` the next step carries (ENG-451). */
export interface EditorSaveStep {
  labelKey: string;
  run: (expectedEditVersion: number) => Promise<{ editVersion?: number }>;
  commit: () => void;
}

export interface EditorSaveChainOutcome {
  /** The persona's `editVersion` after the last step that saved. */
  editVersion: number;
  /** A step was refused because someone else saved the persona first. The
   *  chain stopped there: that step and every step after it did not run. */
  hasConflict: boolean;
  /** Label keys of the steps that failed for any other reason, plus the ones
   *  an indeterminate failure kept from running. */
  failedLabelKeys: string[];
  /** The error of the first step that failed for another reason, so the
   *  caller can name a single failure in its toast. */
  firstFailure: unknown;
}

/**
 * Whether a failed request may still have been saved: no HTTP answer at all (a
 * network error), the client's own 408 timeout, or a 5xx the server may have
 * sent after it committed. A 4xx answer is a refusal, and the contract says a
 * refused write changes nothing.
 */
function isIndeterminateFailure(error: unknown): boolean {
  if (!(error instanceof ApiError)) return true;
  return error.status === 408 || error.status >= 500;
}

/**
 * Run the editor's save steps strictly one after another. Each step
 * carries the `editVersion` the previous step's response returned, so the
 * editor's own save never conflicts with itself. A step whose response carries
 * no `editVersion` (a server that predates the field) leaves the carried value
 * as it was.
 *
 * A step refused with a 4xx changed nothing, so the chain moves on with the
 * same version and that area stays dirty. A step whose outcome is unknown
 * (`isIndeterminateFailure`) may have raised the version on the server, so
 * the chain stops there and reports it and every step after it as failed
 * without running them: one save makes at most one uncertain write. A 403
 * `ACCOUNT_RESTRICTED` stops it the same way. A
 * `PERSONA_EDIT_CONFLICT` stops the chain on the spot: every later request
 * would fail the same precondition, and the member first has to reload the
 * version someone else saved.
 */
export async function runEditorSaveChain(
  steps: EditorSaveStep[],
  loadedEditVersion: number,
): Promise<EditorSaveChainOutcome> {
  let editVersion = loadedEditVersion;
  const failedLabelKeys: string[] = [];
  let firstFailure: unknown = undefined;
  for (const [stepIndex, step] of steps.entries()) {
    try {
      const saved = await step.run(editVersion);
      editVersion = saved.editVersion ?? editVersion;
      step.commit();
    } catch (error) {
      if (isPersonaEditConflict(error)) {
        return {
          editVersion,
          hasConflict: true,
          failedLabelKeys,
          firstFailure,
        };
      }
      if (failedLabelKeys.length === 0) firstFailure = error;
      // ENG-448: a moderation restriction refuses every later write the same
      // way, so those steps are reported unsaved without being sent.
      if (isIndeterminateFailure(error) || isAccountRestricted(error)) {
        const unsavedSteps = steps.slice(stepIndex);
        failedLabelKeys.push(...unsavedSteps.map(({ labelKey }) => labelKey));
        return {
          editVersion,
          hasConflict: false,
          failedLabelKeys,
          firstFailure,
        };
      }
      failedLabelKeys.push(step.labelKey);
    }
  }
  return { editVersion, hasConflict: false, failedLabelKeys, firstFailure };
}

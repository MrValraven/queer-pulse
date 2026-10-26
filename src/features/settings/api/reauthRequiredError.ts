/**
 * Thrown by a step-up gated action that found no cached reauth token and has
 * just opened the code dialog (`beginReauth`). The action did nothing, so the
 * caller resets quietly: no success panel, no error toast, buttons enabled
 * again at once. Once the dialog confirms, the member presses the same button
 * again and the cached token is used.
 */
export class ReauthRequiredError extends Error {
  constructor() {
    super("Step-up confirmation required: the code dialog is open");
    this.name = "ReauthRequiredError";
  }
}

/** Whether `error` is the quiet "confirm it is you first" stop. */
export function isReauthRequiredError(
  error: unknown,
): error is ReauthRequiredError {
  return error instanceof ReauthRequiredError;
}

import { ApiError } from "../../../shared/api/client";

export type EmailTemplateSaveError =
  | { kind: "validation"; messages: string[] }
  | { kind: "notFound" }
  | { kind: "labelTaken" }
  | { kind: "other"; cause: unknown };

/**
 * Sorts a failed save into what the editor can act on. A 400 carries the
 * backend validator's named messages (`en.blocks[2].href: ...`), which are
 * shown as-is: they name the exact language and block to fix.
 */
export function classifySaveError(error: unknown): EmailTemplateSaveError {
  if (!(error instanceof ApiError)) return { kind: "other", cause: error };
  if (error.status === 404) return { kind: "notFound" };
  if (error.status === 409) return { kind: "labelTaken" };
  if (error.status === 400) {
    const message = (error.data as { message?: unknown } | undefined)?.message;
    const messages = Array.isArray(message)
      ? message.filter((entry): entry is string => typeof entry === "string")
      : typeof message === "string"
        ? [message]
        : [error.message];
    return { kind: "validation", messages };
  }
  return { kind: "other", cause: error };
}

import { ApiError } from "../../../../shared/api/client";
import type { PublishStatus } from "./PublishRail";

/**
 * The `PATCH .../article/publish` payload for the current click of the
 * Publish/Unpublish button, split out of `ArticleEditorPage#handlePublish`
 * to keep that component under the 200-line cap. Assumes the caller has
 * already gated the button so `scheduledAt` is a valid future instant
 * whenever `publishStatus === "schedule"` and `!published` — see
 * `isFutureInstant`/`publishDisabled` in `ArticleEditorPage`.
 */
export function buildPublishPayload(
  published: boolean,
  publishStatus: PublishStatus,
  scheduledAt: string | null,
): { publishedAt?: string | null } {
  if (published) return { publishedAt: null };
  if (publishStatus === "schedule") {
    return { publishedAt: new Date(scheduledAt!).toISOString() };
  }
  return {};
}

/** The i18n key for the success toast after that same publish action resolves. */
export function publishSuccessToastKey(
  published: boolean,
  publishStatus: PublishStatus,
): string {
  if (published) return "magazine:write.header.unpublishedToast";
  if (publishStatus === "schedule")
    return "magazine:write.header.scheduledToast";
  return "magazine:write.header.publishedToast";
}

/**
 * The two reasons the server refuses a publish, as it names them.
 *
 * `magazine_care_gate_open`: the piece is behind its care gate (the sign-offs
 * on the piece record, which this editor does not render at all).
 * `magazine_publish_not_ready`: the article itself is incomplete, which the
 * local checklist usually catches first but cannot when another editor has
 * changed the saved draft since this tab last read it.
 */
export type PublishGateCode =
  "magazine_care_gate_open" | "magazine_publish_not_ready";

/** A refused publish, with the specific items the desk still has to close. */
export interface PublishGateFailure {
  code: PublishGateCode;
  /** Server-authored, already human-readable, and rendered verbatim: these
   *  are care-gate item labels and readiness reasons the client cannot
   *  reconstruct, so there is nothing to translate them against. */
  openGateItems: string[];
}

function isPublishGateCode(value: unknown): value is PublishGateCode {
  return (
    value === "magazine_care_gate_open" ||
    value === "magazine_publish_not_ready"
  );
}

/**
 * Reads the structured refusal out of a failed publish, or null when the
 * failure was something else (an outage, a permission problem, a plain 400
 * from an older server).
 *
 * The point is that "Couldn't publish, try again" is a lie for these two: the
 * desk cannot fix them by trying again, and until the rail listed WHICH items
 * were open there was nowhere on the editor that said so. The payload is
 * validated field by field rather than cast, because it arrives as `unknown`
 * on `ApiError.data` and a mis-shaped body must degrade to the generic
 * failure instead of rendering `undefined`.
 */
export function readPublishGateFailure(
  error: unknown,
): PublishGateFailure | null {
  if (!(error instanceof ApiError) || error.status !== 400) return null;
  if (typeof error.data !== "object" || error.data === null) return null;
  const body = error.data as { code?: unknown; openGateItems?: unknown };
  if (!isPublishGateCode(body.code)) return null;
  return {
    code: body.code,
    openGateItems: Array.isArray(body.openGateItems)
      ? body.openGateItems.filter(
          (item): item is string => typeof item === "string",
        )
      : [],
  };
}

/** The i18n key for the toast that accompanies a refused publish. The rail
 *  carries the detail; the toast exists because Draft mode hides the rail
 *  entirely, so the click would otherwise look like it did nothing. */
export function publishGateToastKey(failure: PublishGateFailure): string {
  return failure.code === "magazine_care_gate_open"
    ? "magazine:write.publish.gate.careToast"
    : "magazine:write.header.publishNotReadyError";
}

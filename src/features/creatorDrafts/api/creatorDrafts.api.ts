import {
  ApiError,
  apiDelete,
  apiGet,
  apiPut,
} from "../../../shared/api/client";
import {
  CREATOR_DRAFT_ERROR_CODES,
  CREATOR_DRAFT_MAX_CODE_LENGTH,
  CREATOR_DRAFT_MAX_MISSING_CODES,
  CREATOR_DRAFT_MAX_PROGRESS_TOTAL,
  type CreatorDraftConflict,
  type CreatorDraftEnvelopeDTO,
  type CreatorDraftResponse,
  type CreatorDraftSaved,
  type CreatorDraftSlot,
  type SaveCreatorDraftBody,
} from "./creatorDrafts.types";

/** The route of one draft slot; `listing_edit` uses the `listing-edit` segment. */
export function creatorDraftPath(slot: CreatorDraftSlot): string {
  if (slot.kind === "listing_edit") {
    return `/me/creator-drafts/listing-edit/${encodeURIComponent(slot.listingRef ?? "")}`;
  }
  return `/me/creator-drafts/${slot.kind}`;
}

/** Reads a slot; an empty slot answers null. */
export async function getCreatorDraft(
  slot: CreatorDraftSlot,
): Promise<CreatorDraftResponse | null> {
  const envelope = await apiGet<CreatorDraftEnvelopeDTO>(
    creatorDraftPath(slot),
  );
  return envelope.draft;
}

/** Saves a slot with the caller's base revision. */
export function saveCreatorDraft(
  slot: CreatorDraftSlot,
  body: SaveCreatorDraftBody,
): Promise<CreatorDraftSaved> {
  return apiPut<CreatorDraftSaved>(creatorDraftPath(slot), clampSaveBody(body));
}

/** Deletes a slot; the server answers 204 and repeats are harmless. */
export async function deleteCreatorDraft(
  slot: CreatorDraftSlot,
): Promise<void> {
  await apiDelete<void>(creatorDraftPath(slot));
}

/** The `code` field of an API error body, when it is a string. */
export function creatorDraftErrorCode(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  const data = error.data;
  if (typeof data !== "object" || data === null) return null;
  const code = (data as { code?: unknown }).code;
  return typeof code === "string" ? code : null;
}

/** The revision and saved time of a draft conflict, or null for any other error. */
export function readCreatorDraftConflict(
  error: unknown,
): CreatorDraftConflict | null {
  if (!(error instanceof ApiError) || error.status !== 409) return null;
  if (
    creatorDraftErrorCode(error) !== CREATOR_DRAFT_ERROR_CODES.revisionConflict
  )
    return null;
  const data = error.data as { revision?: unknown; savedAt?: unknown };
  const revision = data.revision;
  const savedAt = data.savedAt;
  const isRevisionValid = typeof revision === "number" || revision === null;
  const isSavedAtValid = typeof savedAt === "string" || savedAt === null;
  if (!isRevisionValid || !isSavedAtValid) return null;
  return { revision, savedAt };
}

/** A creator-route 404 with no `creator_draft_*` code: the kind's feature is off. */
export function isCreatorDraftFeatureOff(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 404 &&
    creatorDraftErrorCode(error) === null
  );
}

/** The payload size in UTF-8 bytes, as the server measures it. */
export function creatorDraftPayloadBytes(
  payload: Record<string, unknown>,
): number {
  return new TextEncoder().encode(JSON.stringify(payload)).length;
}

/** Caps missing codes and progress to the contract limits. */
export function clampSaveBody(
  body: SaveCreatorDraftBody,
): SaveCreatorDraftBody {
  const missing =
    body.missing === null
      ? null
      : body.missing
          .slice(0, CREATOR_DRAFT_MAX_MISSING_CODES)
          .map((code) => code.slice(0, CREATOR_DRAFT_MAX_CODE_LENGTH));
  let progress = body.progress;
  if (progress !== null) {
    const total = Math.min(
      Math.max(progress.total, 1),
      CREATOR_DRAFT_MAX_PROGRESS_TOTAL,
    );
    progress = { done: Math.min(Math.max(progress.done, 0), total), total };
  }
  return { ...body, missing, progress };
}

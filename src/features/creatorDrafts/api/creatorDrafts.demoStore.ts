import { ApiError } from "../../../shared/api/client";
import { creatorDraftPayloadBytes } from "./creatorDrafts.api";
import {
  CREATOR_DRAFT_ERROR_CODES,
  CREATOR_DRAFT_MAX_PAYLOAD_BYTES,
  type CreatorDraftResponse,
  type CreatorDraftSaved,
  type CreatorDraftSlot,
  type SaveCreatorDraftBody,
} from "./creatorDrafts.types";

const demoDrafts = new Map<string, CreatorDraftResponse>();

function slotKey(slot: CreatorDraftSlot): string {
  return `${slot.kind}:${slot.listingRef ?? ""}`;
}

function conflictError(existing: CreatorDraftResponse | undefined): ApiError {
  return new ApiError(409, "Draft changed", {
    code: CREATOR_DRAFT_ERROR_CODES.revisionConflict,
    message: "Draft changed",
    revision: existing?.revision ?? null,
    savedAt: existing?.savedAt ?? null,
  });
}

/** Reads a demo slot as a copy; an empty slot answers null. */
export function demoGetCreatorDraft(
  slot: CreatorDraftSlot,
): Promise<CreatorDraftResponse | null> {
  const existing = demoDrafts.get(slotKey(slot));
  return Promise.resolve(existing ? structuredClone(existing) : null);
}

/** Saves a demo slot with the live revision rules. */
export function demoSaveCreatorDraft(
  slot: CreatorDraftSlot,
  body: SaveCreatorDraftBody,
): Promise<CreatorDraftSaved> {
  if (
    creatorDraftPayloadBytes(body.payload) > CREATOR_DRAFT_MAX_PAYLOAD_BYTES
  ) {
    return Promise.reject(
      new ApiError(413, "Draft too large", {
        code: CREATOR_DRAFT_ERROR_CODES.tooLarge,
      }),
    );
  }
  const key = slotKey(slot);
  const existing = demoDrafts.get(key);
  if ((existing?.revision ?? null) !== body.baseRevision)
    return Promise.reject(conflictError(existing));
  const saved: CreatorDraftResponse = {
    payload: structuredClone(body.payload),
    payloadVersion: body.payloadVersion,
    revision: (existing?.revision ?? 0) + 1,
    savedAt: new Date().toISOString(),
  };
  demoDrafts.set(key, saved);
  return Promise.resolve({ revision: saved.revision, savedAt: saved.savedAt });
}

/** Deletes a demo slot; repeats are harmless. */
export function demoDeleteCreatorDraft(slot: CreatorDraftSlot): Promise<void> {
  demoDrafts.delete(slotKey(slot));
  return Promise.resolve();
}

/** Empties the whole demo store (sign-out and tests). */
export function clearCreatorDraftDemoStore(): void {
  demoDrafts.clear();
}

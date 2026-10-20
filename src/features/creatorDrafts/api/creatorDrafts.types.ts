/** The draft kinds the creator routes store. */
export const STORED_CREATOR_DRAFT_KINDS = [
  "event",
  "listing_edit",
  "community",
] as const;
/** One stored draft kind. */
export type StoredCreatorDraftKind =
  (typeof STORED_CREATOR_DRAFT_KINDS)[number];
/** One draft slot: `listingRef` is set for `listing_edit` only. */
export interface CreatorDraftSlot {
  kind: StoredCreatorDraftKind;
  listingRef: string | null;
}
/** How far the creator got: valid steps out of the total. */
export interface CreatorDraftProgress {
  done: number;
  total: number;
}
/** The body of a draft save. */
export interface SaveCreatorDraftBody {
  payload: Record<string, unknown>;
  payloadVersion: number;
  baseRevision: number | null;
  progress: CreatorDraftProgress | null;
  missing: string[] | null;
}
/** The answer to a successful save. */
export interface CreatorDraftSaved {
  revision: number;
  savedAt: string;
}
/** A stored draft as the server returns it. */
export interface CreatorDraftResponse {
  payload: Record<string, unknown>;
  payloadVersion: number;
  revision: number;
  savedAt: string;
}
/** The GET envelope: a draft or an empty slot. */
export interface CreatorDraftEnvelopeDTO {
  draft: CreatorDraftResponse | null;
}
/** The 409's revision and saved time; both null when the server slot holds
 *  no live row (deleted elsewhere, published or expired). */
export interface CreatorDraftConflict {
  revision: number | null;
  savedAt: string | null;
}
/** The error codes the creator and admin draft routes answer with. */
export const CREATOR_DRAFT_ERROR_CODES = {
  revisionConflict: "creator_draft_revision_conflict",
  tooLarge: "creator_draft_too_large",
  listingUnavailable: "creator_draft_listing_unavailable",
  notFound: "creator_draft_not_found",
} as const;
/** Quiet time after the last edit before an autosave fires. */
export const CREATOR_DRAFT_AUTOSAVE_DELAY_MS = 1500;
/** Waits between retries after a failed save. */
export const CREATOR_DRAFT_RETRY_DELAYS_MS = [
  5_000, 15_000, 30_000, 60_000,
] as const;
/** The largest payload the server accepts. */
export const CREATOR_DRAFT_MAX_PAYLOAD_BYTES = 96 * 1024;
/** The payload version the editors write today. */
export const CREATOR_DRAFT_PAYLOAD_VERSION = 1;
/** The most missing codes a save may carry. */
export const CREATOR_DRAFT_MAX_MISSING_CODES = 50;
/** The longest missing code a save may carry. */
export const CREATOR_DRAFT_MAX_CODE_LENGTH = 64;
/** The largest progress total a save may carry. */
export const CREATOR_DRAFT_MAX_PROGRESS_TOTAL = 50;

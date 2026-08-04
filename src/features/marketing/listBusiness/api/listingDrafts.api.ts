import { apiDelete, apiGet, apiPost } from "../../../../shared/api/client";
import type { ListingDraft } from "../listBusiness.data";

// ── Backend DTOs ───────────────────────────────────────────────────────────
// Cross-device, auth-scoped, owner-only drafts for the list-a-business wizard.
// The backend stores `payload` as opaque JSON and round-trips it verbatim, so
// this is the ONLY place the payload shape is defined; a `ListingDraft` plus the
// step the member had reached, so a resume drops them back exactly where they
// left off.

/** The per-draft payload persisted server-side: the wizard draft + its step. */
export interface ListingDraftPayload {
  draft: ListingDraft;
  /** Wizard step index the member had reached (see `TOTAL_STEPS`). */
  step: number;
}

/** GET /listing-drafts list row — enough to render + resume the drafts list. */
export interface ListingDraftSummary {
  id: string;
  /** The place name typed so far — may be empty on a barely-started draft. */
  name: string;
  /** ISO 8601 timestamp of the last autosave. */
  updatedAt: string;
}

/** A single draft with its full payload (GET by id, or resume by token). */
export interface ListingDraftRecord {
  id: string;
  payload: ListingDraftPayload;
}

// ── Raw calls (one per endpoint) ────────────────────────────────────────────

/** GET /listing-drafts — the caller's in-progress drafts (owner-scoped). */
export const listListingDrafts = () =>
  apiGet<ListingDraftSummary[]>("/listing-drafts");

/**
 * POST /listing-drafts — upsert a draft. Omit `id` (or pass an unknown one) to
 * mint a new row; pass a known `id` to overwrite it in place. Returns the row
 * id so the autosave loop can keep writing back to the same draft.
 */
export const saveListingDraft = (payload: ListingDraftPayload, id?: string) =>
  apiPost<{ id: string }>(
    "/listing-drafts",
    id ? { id, payload } : { payload },
  );

/** GET /listing-drafts/:id — one owned draft with its full payload. */
export const getListingDraft = (id: string) =>
  apiGet<ListingDraftRecord>(`/listing-drafts/${id}`);

/** DELETE /listing-drafts/:id — discard an owned draft (204 No Content). */
export const deleteListingDraft = (id: string) =>
  apiDelete<void>(`/listing-drafts/${id}`);

/**
 * GET /listing-drafts/resume/:token — resolve a `?draft=<token>` deep link to
 * the draft it points at, so a member can pick up on another device.
 */
export const resumeListingDraft = (token: string) =>
  apiGet<ListingDraftRecord>(`/listing-drafts/resume/${token}`);

/**
 * POST /listing-drafts/:id/resume-link — ask the backend to email a resume
 * link (204). The platform ships WITHOUT a mailer at launch, so this is a
 * logged no-op server-side; the drafts LIST is the real cross-device path.
 * Declared for contract completeness; the client intentionally exposes no
 * "email me a link" button around it (nothing would arrive), so it stays a
 * best-effort secondary rather than a promise the product can't keep.
 */
export const sendListingDraftResumeLink = (id: string) =>
  apiPost<void>(`/listing-drafts/${id}/resume-link`);

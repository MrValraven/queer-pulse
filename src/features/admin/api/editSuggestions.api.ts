import { apiGet, apiPatch } from "../../../shared/api/client";
import type { MemberRefDTO } from "../../../shared/api/refs";

/** The 6 fields a member can flag as needing a correction — mirrors
 *  `SuggestEditField` in `marketing/api/useSuggestEdit.ts`, the member-facing
 *  submission side of this same feature. */
export type EditSuggestionField =
  | "hours"
  | "address"
  | "phone"
  | "website"
  | "description"
  | "other";

export type EditSuggestionStatus = "pending" | "accepted" | "dismissed";

/**
 * A member-submitted correction to a directory listing, as a moderator
 * triages it. `submittedBy` is nullable — the member who filed it may have
 * since been deleted/anonymised — same shape as `ListingDTO.submittedBy`.
 */
export interface EditSuggestionDTO {
  id: string;
  listingRef: string;
  listingName: string;
  field: EditSuggestionField;
  message: string;
  status: EditSuggestionStatus;
  submittedBy: MemberRefDTO | null;
  /** ISO 8601 timestamp. */
  createdAt: string;
}

/** GET /admin/listings/edit-suggestions — Moderator/Admin only. Omit `status`
 *  to fetch every suggestion regardless of where it is in its lifecycle. */
export const getEditSuggestions = (status?: EditSuggestionStatus) =>
  apiGet<EditSuggestionDTO[]>(
    `/admin/listings/edit-suggestions${status ? `?status=${status}` : ""}`,
  );

/** PATCH /admin/listings/edit-suggestions/:id — accept or dismiss a
 *  suggestion. Moderator/Admin only. */
export const patchEditSuggestionStatus = (
  id: string,
  status: "accepted" | "dismissed",
) =>
  apiPatch<EditSuggestionDTO>(`/admin/listings/edit-suggestions/${id}`, {
    status,
  });

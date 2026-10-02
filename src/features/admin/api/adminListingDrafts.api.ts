import { apiGet } from "../../../shared/api/client";
import { toItemsPage, type ItemsPage } from "../../../shared/api/pagination";
import type { MemberRefDTO } from "../../../shared/api/refs";
import type { ListingPath } from "../../marketing/listBusiness/listBusiness.data";

/** Days without an autosave after which a draft reads as stalled, i.e. the
 *  member has most likely stopped rather than paused. */
export const LISTING_DRAFT_STALLED_DAYS = 7;

/**
 * The member who started a draft. Carries `userId` on top of the usual
 * `MemberRefDTO` because the "reach out" action posts to
 * `POST /admin/official-messages/members/:memberId`, which is keyed by id.
 */
export interface ListingDraftOwnerDTO extends MemberRefDTO {
  userId: string;
}

/**
 * One unfinished list-a-business draft, as staff see it. Deliberately a
 * SUMMARY, never the wizard payload: the stored `ListingDraftPayload` holds the
 * owner's outing and guide consent decisions and their personal bio, which the
 * moderation queue already withholds from staff (`ModeratedListingDTO`). The
 * backend reads these four fields out of the opaque payload JSON and returns
 * nothing else from it.
 */
export interface AdminListingDraftDTO {
  id: string;
  /** Place name typed so far. Empty on a barely-started draft. */
  name: string;
  /** Neighbourhood picked so far. Empty until the basics step. */
  hood: string;
  /** Which wizard path the member chose. `""` before they chose one. */
  path: ListingPath | "";
  /** Zero-based wizard step they had reached (see `TOTAL_STEPS`). */
  step: number;
  /** Null when the member has since been erased. */
  owner: ListingDraftOwnerDTO | null;
  /** ISO 8601: the draft's first autosave. */
  createdAt: string;
  /** ISO 8601: its most recent autosave. */
  updatedAt: string;
}

/**
 * GET /admin/listing-drafts?page — every member's unfinished listing drafts,
 * most recently edited first, in the `{ items, total, page, pageSize }`
 * envelope. Admin only: the reach-out action is the Admin-only official
 * thread, and a draft is a member's unsubmitted work, so the moderator tier
 * and the `directory_moderator` grant are not admitted.
 */
export const getAdminListingDrafts = async (
  page?: number,
): Promise<ItemsPage<AdminListingDraftDTO>> => {
  const searchParams = new URLSearchParams();
  if (page) searchParams.set("page", String(page));
  const querySuffix = searchParams.toString();
  const response = await apiGet<
    AdminListingDraftDTO[] | ItemsPage<AdminListingDraftDTO>
  >(`/admin/listing-drafts${querySuffix ? `?${querySuffix}` : ""}`);
  return toItemsPage(response);
};

/** Whole days since the draft was last autosaved. */
export function draftIdleDays(draft: AdminListingDraftDTO, now = Date.now()) {
  const elapsedMs = now - new Date(draft.updatedAt).getTime();
  return Math.max(0, Math.floor(elapsedMs / 86_400_000));
}

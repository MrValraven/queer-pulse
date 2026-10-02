import { apiGet } from "../../../shared/api/client";
import { toItemsPage, type ItemsPage } from "../../../shared/api/pagination";
import type { MemberRefDTO } from "../../../shared/api/refs";
import type {
  ListingDraft,
  ListingPath,
} from "../../marketing/listBusiness/listBusiness.data";

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
 * One unfinished list-a-business draft, as it appears in the admin list. A
 * SUMMARY: the backend reads these four fields out of the opaque payload JSON
 * and returns nothing else from it. The business half of one draft is only
 * fetched when an admin opens it to finish as a team listing
 * (`getAdminListingDraft`).
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

/**
 * One draft opened to be finished as a team listing: the summary plus the
 * BUSINESS half of the member's wizard payload.
 *
 * The member's own answers never come back: the eight owner-personal fields,
 * `ownerRole`, the affirming pledge, and the queer-owned `badge` with its
 * `evidence` (a claim about the owner that outs them as much as `ownedBy`
 * does). The server leaves those keys out, and `teamDraftFromMemberDraft`
 * blanks them again on this side, so a server that sent one anyway still
 * could not put it on a listing. The member supplies them when they accept
 * the offer, as on any team-written listing.
 */
export interface AdminListingDraftDetailDTO extends AdminListingDraftDTO {
  payload: Partial<ListingDraft>;
}

/**
 * GET /admin/listing-drafts/:id — Admin only, like the list. Read-only: the
 * member's draft row is never written to from the console, so finishing it
 * as a team listing leaves their own copy exactly as they left it.
 */
export const getAdminListingDraft = (
  id: string,
): Promise<AdminListingDraftDetailDTO> =>
  apiGet<AdminListingDraftDetailDTO>(
    `/admin/listing-drafts/${encodeURIComponent(id)}`,
  );

/** Whole days since the draft was last autosaved. */
export function draftIdleDays(draft: AdminListingDraftDTO, now = Date.now()) {
  const elapsedMs = now - new Date(draft.updatedAt).getTime();
  return Math.max(0, Math.floor(elapsedMs / 86_400_000));
}

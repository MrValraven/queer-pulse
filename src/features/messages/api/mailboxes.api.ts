import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from "../../../shared/api/client";
import type { AuthorSummary } from "../../../shared/contracts/contracts";
import type {
  MailboxSummary,
  StaffNamesLockedReason,
} from "../../../shared/api/mailboxViewer";

export const getMailboxes = () =>
  apiGet<MailboxSummary[]>("/identities/mailboxes");

/**
 * `POST /conversations/:id/claim` (201). A lost race still resolves: it names
 * whoever holds the thread now, or reads all null when the thread came free
 * again. Decide "I hold it" with `claimedByUserId === myUserId` alone:
 * `isNewlyClaimed` reads true for an already-held claim here and false for a
 * no-op take-over.
 */
export interface ClaimResponse {
  claimedByUserId: string | null;
  isNewlyClaimed: boolean;
  claimedBy: AuthorSummary | null;
  claimedAt: string | null;
}

/** `POST /conversations/:id/claim/take-over` (201): atomic, guarded on
 *  `fromUserId` still holding the thread. `previousClaimant` is null when
 *  nothing was taken. */
export interface TakeOverClaimResponse extends ClaimResponse {
  previousClaimant: AuthorSummary | null;
}

/** `DELETE /conversations/:id/claim` (200 with a body). `isReleased` is false
 *  when the claim changed under the release; `claimedBy` then names the new
 *  holder. */
export interface ReleaseClaimResponse extends ClaimResponse {
  isReleased: boolean;
}

export const claimConversation = (conversationId: string) =>
  apiPost<ClaimResponse>(`/conversations/${conversationId}/claim`);

export const takeOverConversation = (
  conversationId: string,
  fromUserId: string,
) =>
  apiPost<TakeOverClaimResponse>(
    `/conversations/${conversationId}/claim/take-over`,
    { fromUserId },
  );

export const releaseConversation = (conversationId: string) =>
  apiDelete<ReleaseClaimResponse>(`/conversations/${conversationId}/claim`);

/** `IdentityAttributionDto`: the owner's switch, the caller's own preference,
 *  and whether the caller owns the mailbox. */
export interface MailboxAttribution {
  shouldShowStaffNames: boolean;
  shouldAllowMyName: boolean;
  isOwner: boolean;
  /** Whether the caller may change `shouldShowStaffNames`: the owner, or any
   *  staff member of a listing that has no owner (PRD-432). Absent from an
   *  older server; read `isOwner` then. */
  isAllowedToChangeStaffNames?: boolean;
  /** ENG-456: set when customers never see a staff name here, whatever both
   *  switches say. `shouldShowStaffNames` still reports the stored switch. */
  staffNamesLockedReason?: StaffNamesLockedReason | null;
}

export const getMailboxAttribution = (identityId: string) =>
  apiGet<MailboxAttribution>(`/identities/${identityId}/attribution`);

/** The owner, or any staff member of an ownerless listing: 403
 *  `IDENTITY_NOT_OWNER` otherwise, and 403 `IDENTITY_STAFF_NAMES_LOCKED` on
 *  an unlinked persona. */
export const setMailboxStaffNames = (
  identityId: string,
  shouldShowStaffNames: boolean,
) =>
  apiPatch<MailboxAttribution>(`/identities/${identityId}/attribution`, {
    shouldShowStaffNames,
  });

/** Any staff member, their own row. The body field is `shouldAllowNaming`. */
export const setMyStaffNaming = (
  identityId: string,
  shouldAllowNaming: boolean,
) =>
  apiPut<MailboxAttribution>(`/identities/${identityId}/staff-preferences/me`, {
    shouldAllowNaming,
  });

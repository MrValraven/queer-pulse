import { apiDelete, apiGet, apiPost } from "../../../shared/api/client";
import { toItemsPage } from "../../../shared/api/pagination";
import type { Paginated } from "../../../shared/api/refs";
import type { IdentityKind } from "../../../shared/contracts/contracts";

/**
 * Identity blocks: a business, persona or company the member has blocked.
 * A block closes every thread between the member and that identity, for both
 * sides. Mirrors `social.api.ts`'s member blocks; demo mode never reaches
 * this module.
 */

/** Mirrors the backend's `IdentityBlockDTO` (`social/social-response.ts`).
 *  The display fields read null when the identity's owner row has since
 *  gone. */
export interface IdentityBlockDTO {
  /** Stable block id. */
  id: string;
  identity: {
    id: string;
    kind: IdentityKind | null;
    displayName: string | null;
    handle: string | null;
    avatarUrl: string | null;
  };
  /** ISO creation time. */
  createdAt: string;
}

/** GET /identity-blocks: the identities the member has blocked. */
export async function getIdentityBlocks(page?: number) {
  const response = await apiGet<
    IdentityBlockDTO[] | Paginated<IdentityBlockDTO>
  >(`/identity-blocks${page ? `?page=${page}` : ""}`);
  return toItemsPage(response);
}

/** POST /identity-blocks/:identityId: idempotent (201). Refused with
 *  `IDENTITY_BLOCK_PERSON` for any profile identity (a person is blocked
 *  through `/blocks`) and `IDENTITY_BLOCK_OWN` for an identity the member
 *  staffs. */
export const blockIdentity = (identityId: string) =>
  apiPost<IdentityBlockDTO>(`/identity-blocks/${identityId}`);

/** DELETE /identity-blocks/:identityId: idempotent (204). */
export const unblockIdentity = (identityId: string) =>
  apiDelete<void>(`/identity-blocks/${identityId}`);

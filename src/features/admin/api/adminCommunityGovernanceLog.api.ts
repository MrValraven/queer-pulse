import { apiGet } from "../../../shared/api/client";

/**
 * The community governance audit trail
 * (`GET /admin/communities/:slug/governance-log`, admin-only). Mirrors the
 * backend's `AdminGovernanceLogEntryDTO`
 * (`src/admin-communities/admin-communities-response.ts`) field for field, and
 * the `Paginated<T>` envelope from `src/common/pagination.ts`.
 *
 * Kept self-contained (no cross-import of view-model types) the same way
 * `adminCommunities.api.ts` is.
 */

/**
 * The backend's `GovernanceLogAction` enum, over the wire as its string
 * values. Order here is the order the action filter offers them in: roster
 * actions first, then lifecycle, then settings.
 */
export const GOVERNANCE_LOG_ACTIONS = [
  "role_changed",
  "member_removed",
  "ownership_transferred",
  "owner_auto_promoted",
  "frozen",
  "unfrozen",
  "archived",
  "unarchived",
  "settings_changed",
] as const;

export type GovernanceLogAction = (typeof GOVERNANCE_LOG_ACTIONS)[number];

/** Compact display shape for the person who acted, or the person acted upon. */
export interface AdminGovernanceLogMemberDTO {
  slug: string;
  name: string;
  initials: string;
  avatarUrl: string | null;
}

export interface AdminGovernanceLogEntryDTO {
  id: string;
  action: GovernanceLogAction;
  /** Null for a system-driven action (auto-freeze, owner-erasure
   *  auto-promotion) or once the actor's account no longer resolves — the FK
   *  is ON DELETE SET NULL precisely so the entry outlives the person. */
  actor: AdminGovernanceLogMemberDTO | null;
  /** Null for actions with no single target (freeze/archive), or once the
   *  target's account no longer resolves. */
  target: AdminGovernanceLogMemberDTO | null;
  /** Free-form server-written context: `{ fromRole, toRole }` for a role
   *  change, `{ changes: { field: { from, to } } }` for a settings diff,
   *  `{ adminOverride: true }` when platform staff acted over the community's
   *  own owner. Never written by a client. */
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

/** The `Paginated<AdminGovernanceLogEntryDTO>` envelope, newest first. */
export interface AdminGovernanceLogPageDTO {
  items: AdminGovernanceLogEntryDTO[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminGovernanceLogParams {
  /** 1-based. Omitted from the query string when it's the first page, since
   *  the backend normalizes an absent page to 1 anyway. */
  page?: number;
  action?: GovernanceLogAction;
}

/** One community's governance audit trail, newest first. Admin-only — 403s
 *  otherwise, which the caller must surface as a failure rather than as an
 *  empty trail. */
export const getAdminCommunityGovernanceLog = (
  slug: string,
  params: AdminGovernanceLogParams,
) => {
  const search = new URLSearchParams();
  if (params.page && params.page > 1) search.set("page", String(params.page));
  if (params.action) search.set("action", params.action);
  const queryString = search.toString();
  return apiGet<AdminGovernanceLogPageDTO>(
    `/admin/communities/${slug}/governance-log${
      queryString ? `?${queryString}` : ""
    }`,
  );
};

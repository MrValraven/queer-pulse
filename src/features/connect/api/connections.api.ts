import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
} from "../../../shared/api/client";

/** The four buckets the backend groups connections into. The page's five tabs
 *  map onto these: "all" → all, "incoming" → incoming, "sent" → outgoing,
 *  "vouched" → vouched. "blocked" is owned by SocialProvider, not this endpoint. */
export type ConnectionApiTab = "all" | "incoming" | "outgoing" | "vouched";

/** How the current user relates to a connection, mirroring the mock vouch badge. */
export type ConnectionVouchBadge = "vouched-for-you" | "you-vouched" | "mutual";

/** The connection's lifecycle state, mirroring the backend `ConnectionStatus` enum. */
export type ConnectionStatus = "pending" | "accepted" | "declined" | "blocked";

/** How the connection relates to the current viewer, as the backend derives it. */
export type ConnectionDirection = "incoming" | "outgoing" | "connected";

/**
 * The other member's display fields, nested exactly as the backend returns them
 * (`ConnectionMemberView`). The backend owns name/role/avatar so the frontend no
 * longer needs the mock member registry to render a live card.
 */
export interface ConnectionMemberDTO {
  slug: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  pronouns: string | null;
  /** Tagline / role line shown under the name. */
  tagline: string | null;
}

/**
 * A single connection record as the backend returns it (`ConnectionListItem`).
 * Member fields are nested under `member`; the request's age is derived on the
 * client from `createdAt` / `respondedAt` (the backend sends raw ISO timestamps).
 */
export interface ConnectionDTO {
  /** Stable connection id — the target of PATCH /connections/:id and DELETE. */
  id: string;
  status: ConnectionStatus;
  direction: ConnectionDirection;
  /** The note attached to a request. */
  requestMessage: string | null;
  /** Why they reached out: `open:<id>` | `custom:<label>` | a REASONS id. */
  requestReason: string | null;
  /** ISO timestamp the request was created. */
  createdAt: string;
  /** ISO timestamp it was accepted/declined, or null while still pending. */
  respondedAt: string | null;
  /** The other member in the connection. */
  member: ConnectionMemberDTO;
  /** Accepted connections you share with this member. */
  mutuals: number;
  /** The vouch relationship between you and this member, or null. */
  vouchBadge: ConnectionVouchBadge | null;
  /** The mutual who introduced the requester (network intros only), else null. */
  introducedBy: ConnectionMemberDTO | null;
}

export interface ConnectionsPageDTO {
  items: ConnectionDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/** GET /connections?tab=… — the list for one tab. */
export function getConnections(tab: ConnectionApiTab, page?: number) {
  const q = new URLSearchParams({ tab });
  if (page) q.set("page", String(page));
  return apiGet<ConnectionsPageDTO>(`/connections?${q.toString()}`);
}

/** POST /connections — send a connection request. Returns the created record. */
export const sendConnection = (body: {
  toSlug: string;
  message?: string;
  /** Why they reached out: `open:<id>` | `custom:<label>` | a REASONS id. */
  reason?: string;
}) => apiPost<ConnectionDTO>("/connections", body);

/** The actions PATCH /connections/:id accepts. */
export type ConnectionAction = "accept" | "decline" | "block" | "unblock";

/** PATCH /connections/:id — respond to or manage a connection. */
export const respondConnection = (id: string, action: ConnectionAction) =>
  apiPatch<ConnectionDTO>(`/connections/${id}`, { action });

/** DELETE /connections/:id — remove an existing connection. */
export const removeConnection = (id: string) =>
  apiDelete<{ ok: true }>(`/connections/${id}`);

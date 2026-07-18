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

/**
 * A single connection record as the backend returns it. The backend owns the
 * member's display fields (name, role, avatar) and the relationship metadata
 * (mutuals, when you connected, the request message) — the frontend no longer
 * needs the mock member registry to render a live card.
 */
export interface ConnectionDTO {
  /** Stable connection id — the target of PATCH /connections/:id and DELETE. */
  id: string;
  /** The other member's profile slug. */
  slug: string;
  firstName: string;
  lastName: string;
  pronouns?: string;
  /** Tagline / role line shown under the name. */
  tagline?: string;
  avatarUrl?: string | null;
  tags?: string[];
  /** Shared connections count. */
  mutuals?: number;
  /** Human month/label the connection was formed, e.g. "Mar 2025". */
  since?: string;
  /** Relative time an incoming/sent request was created, e.g. "2h ago". */
  sentAgo?: string;
  /** The note attached to an incoming request. */
  requestMessage?: string;
  /** The vouch relationship between you and this member, if any. */
  vouchBadge?: ConnectionVouchBadge;
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

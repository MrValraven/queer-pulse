import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPostWithMeta,
} from "../../../shared/api/client";
import { toPage } from "../../../shared/api/pagination";
import type {
  ConversationResponse,
  GroupInviteSummary,
  GroupJoinPreview,
  MessageReactorsResponse,
  MessageRequestResponse,
  MessageResponse,
  MessageSearchResponse,
  Paginated,
  StarredMessagesResponse,
} from "../../../shared/contracts/contracts";
import type { GifAttachment } from "../../../shared/api/gifs";

// ── Messages DTOs + raw calls ────────────────────────────────────────────────
// Shapes come straight from src/shared/contracts/contracts.ts (the SDK target).
// PAGINATION: cursor-based (`Paginated<T>` = { data, pageInfo{nextCursor,hasMore} })
// for the message history — it's an infinite, newest-first thread the panel loads
// older on scroll-up. The conversations list is small enough to fetch in one page.

export type {
  ConversationResponse,
  MessageResponse,
  GroupInviteSummary,
  GroupJoinPreview,
};

/**
 * GET /conversations — the inbox list, most-recent first.
 * ENG-253: the backend now ALWAYS answers the cursor-paginated
 * `{ data, pageInfo }` envelope (default page size 30) instead of the whole
 * inbox as a bare array. This helper stays call-compatible with its existing
 * non-paging callers (e.g. `useIncomingMessageBanner.ts`'s own cache-priming
 * lookup) by resolving just the first page's `data`, which is fine for a
 * single-row lookup but is no longer the whole inbox. The inbox UI itself
 * pages properly through `getConversationsPage`/`useConversations` below;
 * `useIncomingMessageBanner.ts` should move onto that if it ever needs to see
 * past page 1 (an adjacent gap this build leaves for a follow-up; see this
 * build's report).
 */
export async function getConversations(): Promise<ConversationResponse[]> {
  const res = await apiGet<
    ConversationResponse[] | Paginated<ConversationResponse>
  >("/conversations");
  return toPage(res).data;
}

export interface GetConversationsPageOptions {
  /** Opaque keyset cursor from a previous page's `pageInfo.nextCursor`. */
  cursor?: string;
  /** 1-100, server default 30. */
  limit?: number;
  signal?: AbortSignal;
}

/**
 * GET /conversations?cursor=&limit= (ENG-253): the inbox, one cursor-
 * paginated page, most-recently-active first. `useConversations` pages
 * through this so the member's full inbox is actually reachable by paging
 * (the bug ENG-253 fixes: the old bare-array endpoint silently truncated at
 * a fixed count).
 */
export async function getConversationsPage(
  options: GetConversationsPageOptions = {},
): Promise<Paginated<ConversationResponse>> {
  const { cursor, limit, signal } = options;
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (limit) params.set("limit", String(limit));
  const qs = params.toString();
  const res = await apiGet<
    ConversationResponse[] | Paginated<ConversationResponse>
  >(`/conversations${qs ? `?${qs}` : ""}`, undefined, undefined, signal);
  return toPage(res);
}

/**
 * GET /conversations/:id (ENG-253): the full-detail single-conversation read.
 * Carries the real member roster (with per-member read/delivered watermarks)
 * and the full stored draft that a LIST row (`getConversationsPage` above) no
 * longer does; see `ConversationResponse.members`/`.draft`'s own docs. 404s
 * if the caller isn't a participant or the thread is invisible to them.
 */
export const getConversation = (conversationId: string, signal?: AbortSignal) =>
  apiGet<ConversationResponse>(
    `/conversations/${conversationId}`,
    undefined,
    undefined,
    signal,
  );

/**
 * GET /conversations/unread-count — the count of conversations with unread
 * messages, for the nav DM badge. Cheap counterpart to `getConversations`, so
 * the app-wide badge never pulls the whole inbox. Mirrors
 * `/notifications/unread-count`.
 */
export async function getConversationsUnreadCount(): Promise<number> {
  const res = await apiGet<{ count: number }>("/conversations/unread-count");
  return res?.count ?? 0;
}

/**
 * GET /conversations/:id/messages?cursor= — one backward page of history,
 * newest first. The backend answers with the `{ data, pageInfo }` envelope
 * (ENG-192); `toPage` still accepts a bare array from an older backend and
 * treats it as the single terminal page, so load-older simply stays off there.
 * `signal` is react-query's cancellation signal (ENG-201): switching threads
 * aborts the abandoned fetch instead of letting it finish in the background.
 */
export async function getMessages(
  conversationId: string,
  cursor?: string,
  signal?: AbortSignal,
): Promise<Paginated<MessageResponse>> {
  const searchParams = new URLSearchParams();
  if (cursor) searchParams.set("cursor", cursor);
  const queryString = searchParams.toString();
  const res = await apiGet<MessageResponse[] | Paginated<MessageResponse>>(
    `/conversations/${conversationId}/messages${queryString ? `?${queryString}` : ""}`,
    undefined,
    undefined,
    signal,
  );
  return toPage(res);
}

/**
 * ENG-222: messages resolved from a send whose response carried the
 * backend's `Idempotent-Replayed: true` header (`messaging.controller.ts:613`).
 * The server recognized the client's `clientMessageId` and handed back the
 * already-stored row instead of creating a new one (a retry, or the HTTP+WS
 * dual write path), so this was never a genuine first create. Tracked by
 * object identity rather than widening `sendMessage`/`sendDocumentMessage`'s
 * return shape, which `useMessageMutations.ts#useSendMessage` and everything
 * downstream of it depend on staying a bare `MessageResponse`. Read via
 * `wasMessageReplayed`; the WeakSet entry is eligible for GC the moment
 * nothing else references the message.
 */
const replayedMessages = new WeakSet<object>();

/** True when `message` is the exact object `sendMessage`/`sendDocumentMessage`
 *  resolved for a request the server answered as a replay (see
 *  `replayedMessages`). `useMessageDeliverCore.ts`'s send path reads this to
 *  skip whatever side effects should fire only on a genuine first create.
 *  False for a `MessageResponse` from any other source (history load, a
 *  socket frame, demo mode). */
export function wasMessageReplayed(message: MessageResponse): boolean {
  return replayedMessages.has(message);
}

/** POST /conversations/:id/messages — send. Rejects a blocked pair with 403.
 *  `clientMessageId` is the sender's idempotency key — the server dedupes on it,
 *  so a retry (or the HTTP + WS dual path) returns the same message, never two
 *  (ENG-222: flagged via `wasMessageReplayed` above when it does). */
export async function sendMessage(
  conversationId: string,
  body: string,
  replyToId?: string,
  clientMessageId?: string,
  forwarded?: boolean,
  attachment?: GifAttachment,
  kind?: "user" | "gif" | "image",
): Promise<MessageResponse> {
  const { data, headers } = await apiPostWithMeta<MessageResponse>(
    `/conversations/${conversationId}/messages`,
    {
      body,
      ...(replyToId ? { replyToId } : {}),
      ...(clientMessageId ? { clientMessageId } : {}),
      ...(forwarded ? { forwarded: true } : {}),
      ...((kind === "gif" || kind === "image") && attachment
        ? { kind, attachment }
        : {}),
    },
  );
  if (headers.get("Idempotent-Replayed") === "true") {
    replayedMessages.add(data);
  }
  return data;
}

/** GET /conversations/:id/pins — the conversation's SHARED pinned messages,
 *  newest-pin-first. */
export const getPinnedMessages = (conversationId: string) =>
  apiGet<MessageResponse[]>(`/conversations/${conversationId}/pins`);

/** POST /conversations/:id/messages/:messageId/pin — pin a message (shared). */
export const pinMessage = (conversationId: string, messageId: string) =>
  apiPost<{ ok: true }>(
    `/conversations/${conversationId}/messages/${messageId}/pin`,
    {},
  );

/** DELETE /conversations/:id/messages/:messageId/pin — unpin a message (shared). */
export const unpinMessage = (conversationId: string, messageId: string) =>
  apiDelete<{ ok: true }>(
    `/conversations/${conversationId}/messages/${messageId}/pin`,
  );

/** POST /conversations/:id/messages/:messageId/star — privately bookmark a message. */
export const starMessage = (conversationId: string, messageId: string) =>
  apiPost<{ ok: true }>(
    `/conversations/${conversationId}/messages/${messageId}/star`,
    {},
  );

/** DELETE /conversations/:id/messages/:messageId/star — remove my star. */
export const unstarMessage = (conversationId: string, messageId: string) =>
  apiDelete<{ ok: true }>(
    `/conversations/${conversationId}/messages/${messageId}/star`,
  );

export interface GetStarredMessagesOptions {
  /** Free-text term, matched server-side against the body, attachment
   *  caption/file name, sender name, group title, and DM counterpart name
   *  (PRD-374). Omitted or blank means no text filter. */
  q?: string;
  /** Narrows by kind; omitted means every kind. */
  type?: "photos" | "documents" | "links";
  /** Opaque keyset cursor from a previous page's `nextCursor`. */
  cursor?: string;
  limit?: number;
  /** react-query forwards its `queryFn` signal here so a superseded page
   *  request (a fresh keystroke, or a demo→live toggle) is cancelled instead
   *  of racing a stale one to the cache. */
  signal?: AbortSignal;
}

/** GET /messages/starred: my starred messages, newest-star-first, optionally
 *  narrowed by `q`/`type` and paged by `cursor` (PRD-374). */
export async function getStarredMessages(
  options: GetStarredMessagesOptions = {},
): Promise<StarredMessagesResponse> {
  const { q, type, cursor, limit, signal } = options;
  const params = new URLSearchParams();
  if (q && q.trim()) params.set("q", q.trim());
  if (type) params.set("type", type);
  if (cursor) params.set("cursor", cursor);
  if (limit) params.set("limit", String(limit));
  const qs = params.toString();
  return apiGet<StarredMessagesResponse>(
    `/messages/starred${qs ? `?${qs}` : ""}`,
    undefined,
    undefined,
    signal,
  );
}

/** PATCH /conversations/:id/messages/:messageId — edit own message (15-min window). */
export const editMessage = (
  conversationId: string,
  messageId: string,
  body: string,
) =>
  apiPatch<MessageResponse>(
    `/conversations/${conversationId}/messages/${messageId}`,
    { body },
  );

/** PATCH /conversations/:id — pin/unpin, favorite/unfavorite, or mute/unmute a
 *  chat (WhatsApp-style, CONVERSATION-scoped — distinct from the message-level
 *  pin in `pinMessage`/`unpinMessage`). Shares the same endpoint as
 *  `updateGroup` (title/avatar). The server caps a caller at 3 pinned chats
 *  and answers 409 past it (mirrored client-side before this ever fires — see
 *  `useTogglePin`). */
export const updateConversationPrefs = (
  conversationId: string,
  changes: {
    pinned?: boolean;
    favorite?: boolean;
    muted?: boolean;
    /** PRD-349: the mute MODE, a second axis independent of `muted` above
     *  (`"all"` \| `"mentionsOnly"`, see `useConversationPrefs.ts`'s
     *  `useToggleMuteMode`). Never bundled with `muted`/`mutedUntil` in the
     *  same call; the row menu sends this alone. */
    muteMode?: "all" | "mentionsOnly";
    mutedUntil?: string | null;
    archived?: boolean;
    markUnread?: boolean;
    draft?: string;
  },
) =>
  apiPatch<ConversationResponse>(`/conversations/${conversationId}`, changes);

/** POST /conversations — open (or reuse) a DM with a member by handle. */
export const startConversation = (recipientHandle: string) =>
  apiPost<ConversationResponse>("/conversations", { recipientHandle });

/**
 * POST /messages/request — a first-contact message to a member by handle,
 * addressed to someone the caller may or may not already be connected with.
 * When they're already connected the server delivers `body` as an ordinary
 * message and returns `conversationId`; otherwise it seeds a connection
 * request instead and returns `connectionRequestId` (the conversation
 * materializes once the recipient accepts — see the "Requests" inbox tab).
 * Used by `NewMessageModal`'s fall-through when the picked member isn't an
 * accepted connection yet.
 */
export const sendMessageRequest = (toSlug: string, body: string) =>
  apiPost<MessageRequestResponse>("/messages/request", { toSlug, body });

/** POST /conversations/group — create a group thread. Members are addressed by
 *  handle (slug); the caller becomes owner. Each member must be a connection and
 *  not blocked (server-enforced). Returns the new group's ConversationResponse. */
export const createGroup = (
  title: string,
  memberHandles: string[],
  avatarUrl?: string,
) =>
  apiPost<ConversationResponse>("/conversations/group", {
    title,
    memberHandles,
    ...(avatarUrl ? { avatarUrl } : {}),
  });

/** POST /conversations/:id/leave — the caller leaves a group (keeps history). */
export const leaveGroup = (conversationId: string) =>
  apiPost<{ ok: true }>(`/conversations/${conversationId}/leave`, {});

/** POST /conversations/:id/members — owner/admin adds members by handle. Each
 *  must be a connection + not blocked (server-enforced). Returns the group DTO. */
export const addGroupMembers = (
  conversationId: string,
  memberHandles: string[],
) =>
  apiPost<ConversationResponse>(`/conversations/${conversationId}/members`, {
    memberHandles,
  });

/** DELETE /conversations/:id/members/:userId — owner/admin removes a member
 *  (owner can't be removed; only owner removes an admin). Returns the group DTO. */
export const removeGroupMember = (conversationId: string, userId: string) =>
  apiDelete<ConversationResponse>(
    `/conversations/${conversationId}/members/${userId}`,
  );

/** PATCH /conversations/:id/members/:userId/role — OWNER promotes/demotes a
 *  member (`admin` | `member`). Returns the group DTO. */
export const changeGroupMemberRole = (
  conversationId: string,
  userId: string,
  role: "admin" | "member",
) =>
  apiPatch<ConversationResponse>(
    `/conversations/${conversationId}/members/${userId}/role`,
    { role },
  );

/** PATCH /conversations/:id — owner/admin edits a group's title/avatar/
 *  description (PRD-358; `description` posts a `group_description_changed`
 *  pill server-side, max 500 chars, trimmed + sanitised server-side like a
 *  caption). A title change posts `group_renamed`, an avatar change
 *  `group_photo_changed`. Returns the group DTO. */
export const updateGroup = (
  conversationId: string,
  changes: { title?: string; avatarUrl?: string; description?: string },
) =>
  apiPatch<ConversationResponse>(`/conversations/${conversationId}`, changes);

/** POST /conversations/:id/owner: owner transfers ownership to another
 *  active member; the actor becomes admin. Posts an `owner_changed` pill.
 *  Returns the group DTO. */
export const transferGroupOwnership = (
  conversationId: string,
  userId: string,
) =>
  apiPost<ConversationResponse>(`/conversations/${conversationId}/owner`, {
    userId,
  });

/** POST /conversations/:id/dissolve: owner ends the group for everyone
 *  (PRD-357): `dissolvedAt` is set, every active participant is left, the
 *  invite link disabled and pending invites revoked. Returns the (now
 *  read-only) group DTO. */
export const dissolveGroup = (conversationId: string) =>
  apiPost<ConversationResponse>(
    `/conversations/${conversationId}/dissolve`,
    {},
  );

/** POST /conversations/:id/invite-link: owner/admin creates (or rotates) the
 *  group's revocable invite link (PRD-358, no QR). Rotating invalidates any
 *  previously shared link. */
export const createGroupInviteLink = (conversationId: string) =>
  apiPost<{ inviteToken: string }>(
    `/conversations/${conversationId}/invite-link`,
    {},
  );

/** DELETE /conversations/:id/invite-link: owner/admin disables the group's
 *  invite link; any previously shared link stops working. */
export const disableGroupInviteLink = (conversationId: string) =>
  apiDelete<void>(`/conversations/${conversationId}/invite-link`);

/** GET /conversations/join/:token: unauthenticated-of-membership preview of
 *  the group an invite link points at (title/avatar/description/member
 *  count/whether the caller is already a member). 404s
 *  `INVITE_LINK_INVALID` for an unknown or dissolved link; throttled. */
export const getGroupJoinPreview = (token: string) =>
  apiGet<GroupJoinPreview>(`/conversations/join/${encodeURIComponent(token)}`);

/** POST /conversations/join/:token: the caller seats themself via the
 *  invite link (voluntary, so the "who can add me" preference is never
 *  consulted). Refused `REMOVED_FROM_GROUP` if this caller previously left
 *  or was removed; refused `GROUP_FULL`/`GROUP_DISSOLVED` as usual. Posts a
 *  `member_joined` (`value: "link"`) pill. Returns the group DTO. */
export const joinGroupByToken = (token: string) =>
  apiPost<ConversationResponse>(
    `/conversations/join/${encodeURIComponent(token)}`,
    {},
  );

/** GET /conversations/group-invites: pending group invites addressed to the
 *  caller (Requests tab). */
export const getGroupInvites = () =>
  apiGet<GroupInviteSummary[]>("/conversations/group-invites");

/** POST /conversations/group-invites/:inviteId/accept: the invitee seats
 *  themself (re-checks the cap, blocks and `GROUP_DISSOLVED` at accept time).
 *  Posts a `member_joined` (`value: "invite"`) pill. Returns the group DTO. */
export const acceptGroupInvite = (inviteId: string) =>
  apiPost<ConversationResponse>(
    `/conversations/group-invites/${inviteId}/accept`,
    {},
  );

/** POST /conversations/group-invites/:inviteId/decline: the invitee turns
 *  down the invite. */
export const declineGroupInvite = (inviteId: string) =>
  apiPost<void>(`/conversations/group-invites/${inviteId}/decline`, {});

/** DELETE /conversations/:id/invites/:inviteId: owner/admin revokes a
 *  pending invite before it's answered. */
export const revokeGroupInvite = (conversationId: string, inviteId: string) =>
  apiDelete<void>(`/conversations/${conversationId}/invites/${inviteId}`);

/** GET /messages/search?q= — cross-conversation body search, scoped server-side
 *  to the caller's conversations and floored by their `clearedAt`. Accepts an
 *  `AbortSignal` (react-query forwards its `queryFn` signal here) so a fast
 *  retype cancels the previous keystroke's still-in-flight request instead of
 *  letting it run to completion against the backend. */
/** `conversationId`, when supplied, scopes the search to that single thread
 *  ("search in this chat", opened from an already-open conversation) instead
 *  of the caller's whole inbox. */
export async function searchMessages(
  query: string,
  limit?: number,
  signal?: AbortSignal,
  conversationId?: string,
): Promise<MessageSearchResponse> {
  const params = new URLSearchParams({ q: query });
  if (limit) params.set("limit", String(limit));
  if (conversationId) params.set("conversationId", conversationId);
  return apiGet<MessageSearchResponse>(
    `/messages/search?${params.toString()}`,
    undefined,
    undefined,
    signal,
  );
}

/** POST /conversations/:id/read — advance the read watermark. Prefer
 *  `upToMessageId` (the newest message this client actually rendered): the
 *  server reads THAT message's own `created_at` server-side, so the receipt
 *  can never claim more than was genuinely shown (see `MarkReadDto` /
 *  `ConversationsService.markRead` in the backend). `lastReadAt` is the
 *  legacy client-clock form, honoured but clamped to `now()` server-side —
 *  only used as a fallback when no message id is known yet (see
 *  `useMarkRead`). Omitting both keeps the original "read up to now"
 *  behaviour. */
export const markConversationRead = (
  conversationId: string,
  options: { upToMessageId?: string; lastReadAt?: string },
) =>
  apiPost<{ ok: true }>(`/conversations/${conversationId}/read`, {
    ...(options.upToMessageId ? { upToMessageId: options.upToMessageId } : {}),
    ...(options.lastReadAt ? { lastReadAt: options.lastReadAt } : {}),
  });

/** POST /conversations/:id/messages/:messageId/reactions — add (or replace) my reaction. */
export const addMessageReaction = (
  conversationId: string,
  messageId: string,
  key: string,
) =>
  apiPost<{ ok: true }>(
    `/conversations/${conversationId}/messages/${messageId}/reactions`,
    { key },
  );

/** DELETE /conversations/:id/messages/:messageId/reactions/:key — remove my reaction. */
export const removeMessageReaction = (
  conversationId: string,
  messageId: string,
  key: string,
) =>
  apiDelete<{ ok: true }>(
    `/conversations/${conversationId}/messages/${messageId}/reactions/${encodeURIComponent(key)}`,
  );

/** GET /conversations/:id/messages/:messageId/reactions: who reacted (PRD-352). */
export const getMessageReactors = (
  conversationId: string,
  messageId: string,
  signal?: AbortSignal,
) =>
  apiGet<MessageReactorsResponse>(
    `/conversations/${conversationId}/messages/${messageId}/reactions`,
    undefined,
    undefined,
    signal,
  );

/** DELETE /conversations/:id/messages/:messageId — soft-delete a message. */
export const deleteMessage = (conversationId: string, messageId: string) =>
  apiDelete<{ ok: true }>(
    `/conversations/${conversationId}/messages/${messageId}`,
  );

/** DELETE /conversations/:id/messages/:messageId/for-me — hide ONE message
 *  from my own view only ("delete for me", PRD-227). Any participant may
 *  call this (not just the author) — sits beside `deleteMessage` above
 *  ("delete for everyone") without touching it; the other participant's copy
 *  is unaffected. */
export const deleteMessageForMe = (conversationId: string, messageId: string) =>
  apiDelete<{ ok: true }>(
    `/conversations/${conversationId}/messages/${messageId}/for-me`,
  );

/** DELETE /conversations/:id — delete the conversation for my account only
 *  (WhatsApp-style). The other member keeps their copy. */
export const deleteConversation = (conversationId: string) =>
  apiDelete<{ ok: true }>(`/conversations/${conversationId}`);

/**
 * POST /conversations/:id/messages — send a `kind:"document"` message
 * (PRD-226: a lease PDF, a flyer, a spreadsheet, plain text). A narrow sibling
 * of `sendMessage` above rather than a widened version of it: this file's
 * ownership is shared with another build pass touching `sendMessage` directly,
 * so this is appended standalone instead of editing that function's shape.
 * Hits the SAME endpoint and is equally idempotent on `clientMessageId`.
 */
export async function sendDocumentMessage(
  conversationId: string,
  body: string,
  attachment: import("../../../shared/api/documentAttachment").DocumentAttachment,
  replyToId?: string,
  clientMessageId?: string,
  forwarded?: boolean,
): Promise<MessageResponse> {
  const { data, headers } = await apiPostWithMeta<MessageResponse>(
    `/conversations/${conversationId}/messages`,
    {
      body,
      kind: "document",
      attachment,
      ...(replyToId ? { replyToId } : {}),
      ...(clientMessageId ? { clientMessageId } : {}),
      ...(forwarded ? { forwarded: true } : {}),
    },
  );
  // ENG-222: same idempotent-replay flag as `sendMessage` above, see
  // `wasMessageReplayed`'s own doc.
  if (headers.get("Idempotent-Replayed") === "true") {
    replayedMessages.add(data);
  }
  return data;
}

import { ApiError, apiGet, apiPost } from "../../../shared/api/client";

/**
 * PRD-372: speaking as QueerPulse through each member's official thread
 * (`/admin/official-messages`, Admin only). Mirrors the backend's
 * `AdminOfficialMessagesController`; response shapes mirror
 * `official-messages-response.ts`.
 */

/** Longest official message or broadcast body the server accepts. */
export const OFFICIAL_MESSAGE_MAX_LENGTH = 2000;

/** Shortest term the recipient typeahead fires on (matches the server). */
export const OFFICIAL_RECIPIENT_MIN_SEARCH_LENGTH = 2;

/** Machine codes the page branches on. */
export const OFFICIAL_RECIPIENT_NOT_FOUND_CODE = "OFFICIAL_RECIPIENT_NOT_FOUND";
export const OFFICIAL_BROADCAST_IDEMPOTENCY_CONFLICT_CODE =
  "OFFICIAL_BROADCAST_IDEMPOTENCY_CONFLICT";

export type OfficialBroadcastStatusDTO =
  "pending" | "sending" | "completed" | "failed";

/** One row of `GET /admin/official-messages/broadcasts`. */
export interface OfficialBroadcastDTO {
  id: string;
  body: string;
  actorId: string | null;
  actorName: string | null;
  status: OfficialBroadcastStatusDTO;
  recipientCount: number;
  deliveredCount: number;
  createdAt: string;
  completedAt: string | null;
}

/** One row of `GET /admin/official-messages/recipients?q=`. */
export interface OfficialRecipientDTO {
  userId: string;
  slug: string;
  name: string;
  initials: string;
  avatarUrl: string | null;
  status: string;
}

/** `POST /admin/official-messages/members/:memberId` result. */
export interface OfficialMessageSentDTO {
  conversationId: string;
  messageId: string;
  recipientId: string;
  createdAt: string;
}

export const searchOfficialRecipients = (term: string, signal?: AbortSignal) =>
  apiGet<OfficialRecipientDTO[]>(
    `/admin/official-messages/recipients?q=${encodeURIComponent(term)}`,
    undefined,
    undefined,
    signal,
  );

export const sendOfficialMessage = (memberId: string, body: string) =>
  apiPost<OfficialMessageSentDTO>(
    `/admin/official-messages/members/${encodeURIComponent(memberId)}`,
    { body },
  );

/** Answers 202 with the broadcast row; delivery continues in the background. */
export const createOfficialBroadcast = (body: string, idempotencyKey: string) =>
  apiPost<OfficialBroadcastDTO>("/admin/official-messages/broadcast", {
    body,
    idempotencyKey,
  });

export const getOfficialBroadcasts = () =>
  apiGet<OfficialBroadcastDTO[]>("/admin/official-messages/broadcasts");

/** The stable `code` on an official-messages error body, when there is one. */
export function officialMessagesErrorCode(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  const data = error.data;
  if (typeof data !== "object" || data === null || !("code" in data)) {
    return null;
  }
  const code = data.code;
  return typeof code === "string" ? code : null;
}

/** True while the server is still delivering this broadcast. */
export function isBroadcastUnfinished(broadcast: OfficialBroadcastDTO) {
  return broadcast.status === "pending" || broadcast.status === "sending";
}

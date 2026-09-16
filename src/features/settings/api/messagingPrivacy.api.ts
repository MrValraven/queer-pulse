import { apiGet, apiPut } from "../../../shared/api/client";
import type { WhoCanMessage } from "../../../shared/contracts/contracts";

/**
 * PRD-364/PRD-366: the four messaging-privacy controls, one row.
 *
 * `shareReadReceipts`/`shareTyping`/`sharePresence` are all RECIPROCAL —
 * turning one off also stops the member seeing that same signal from
 * everyone else, enforced server-side (`ChatGateway`/`ConversationsService`).
 * `whoCanMessage` is enforced by `ConnectionsService.resolveRequestGate`,
 * layered on top of profile visibility (the stricter of the two wins).
 */
export interface MessagingPrivacyDTO {
  shareReadReceipts: boolean;
  shareTyping: boolean;
  sharePresence: boolean;
  whoCanMessage: WhoCanMessage;
}

/** All four default to the platform's behaviour before this pane existed:
 *  sharing on, everyone may message. What a member who has never opened
 *  Settings gets, and what the pane renders before the first fetch resolves. */
export const DEFAULT_MESSAGING_PRIVACY: MessagingPrivacyDTO = {
  shareReadReceipts: true,
  shareTyping: true,
  sharePresence: true,
  whoCanMessage: "everyone",
};

/** GET /me/messaging-privacy: never 404s; synthesises the default when unset. */
export const getMessagingPrivacy = () =>
  apiGet<MessagingPrivacyDTO>("/me/messaging-privacy");

/** PUT /me/messaging-privacy: a PARTIAL update — only the fields passed
 *  change; the rest are left exactly as stored. Echoes back the full,
 *  persisted row. */
export const putMessagingPrivacy = (patch: Partial<MessagingPrivacyDTO>) =>
  apiPut<MessagingPrivacyDTO>("/me/messaging-privacy", patch);

import { apiGet, apiPost } from "../../../shared/api/client";

/**
 * Task 13: "Message" on a persona's or a company's public page, for
 * signed-in members. The enquiry lands in the identity's own mailbox,
 * answered by whoever staffs it. Addressed by the persona's uuid
 * (`GET /subprofiles/:id/contact`, `POST /subprofiles/:id/enquiries`) or the
 * company's slug (`GET /companies/:slug/contact`,
 * `POST /companies/:slug/enquiries`); mirrors
 * `queerpulse-backend/src/identity-contact/*.controller.ts`.
 */
export type IdentityContactTarget =
  { kind: "persona"; subprofileId: string } | { kind: "company"; slug: string };

/**
 * Why the caller cannot message this identity. Mirrors the backend's
 * `IdentityContactUnavailableReason` exactly: `own_mailbox` is told only to
 * someone who answers for it, `unstaffed` means nobody could answer yet,
 * `removed` is a moderation takedown, and `unavailable` covers a block in
 * either direction, reported without saying which side blocked which.
 */
export type IdentityContactUnavailableReason =
  "own_mailbox" | "unstaffed" | "removed" | "unavailable";

/**
 * Which counted cap is currently holding this member back. Mirrors the
 * backend's `IdentityEnquiryLimitReason`. The cap is one 20-per-day ceiling
 * shared with directory enquiries, so writing to a persona or a company
 * counts against the same daily budget as writing to a listing.
 */
export type IdentityEnquiryLimitReason =
  "wrote_to_this_mailbox_today" | "wrote_across_mailboxes_today";

/**
 * `GET /subprofiles/:id/contact` and `GET /companies/:slug/contact`:
 * whether this member can write to this persona or company, and what the
 * thread will allow afterwards.
 */
export interface IdentityContactDTO {
  canMessage: boolean;
  /** `null` exactly when `canMessage` is true. */
  unavailableReason: IdentityContactUnavailableReason | null;
  /** True until the mailbox first answers; the member's follow-ups wait on
   *  that reply. */
  followUpAwaitsReply: boolean;
  existingConversationId: string | null;
  /** A courtesy the send re-checks on its own: `POST …/enquiries` enforces
   *  the cap independently. */
  hasReachedEnquiryLimit: boolean;
  /** Which cap. `null` exactly when `hasReachedEnquiryLimit` is false. */
  enquiryLimitReason: IdentityEnquiryLimitReason | null;
  /** ISO 8601 instant the cap lifts, or `null` when nothing is capped. */
  enquiryLimitClearsAt: string | null;
}

/** `POST /subprofiles/:id/enquiries` and `POST /companies/:slug/enquiries`:
 *  where the member's message went. */
export interface IdentityEnquirySentDTO {
  conversationId: string;
  followUpAwaitsReply: boolean;
}

function identityContactPath(target: IdentityContactTarget): string {
  return target.kind === "persona"
    ? `/subprofiles/${encodeURIComponent(target.subprofileId)}/contact`
    : `/companies/${encodeURIComponent(target.slug)}/contact`;
}

function identityEnquiryPath(target: IdentityContactTarget): string {
  return target.kind === "persona"
    ? `/subprofiles/${encodeURIComponent(target.subprofileId)}/enquiries`
    : `/companies/${encodeURIComponent(target.slug)}/enquiries`;
}

/** The contact read. Plain `apiGet`: the backend answers a full
 *  `IdentityContactDTO` on every path. An unreachable persona or company is
 *  an object with `canMessage: false`, a stated answer. */
export const getIdentityContact = (
  target: IdentityContactTarget,
  signal?: AbortSignal,
) =>
  apiGet<IdentityContactDTO>(
    identityContactPath(target),
    undefined,
    undefined,
    signal,
  );

/**
 * Deliver a private enquiry to the persona's or company's mailbox as a
 * direct message from the member's own account.
 *
 * `asIdentityId` is deliberately never sent from here: a business, persona
 * or company cannot start a conversation (`IDENTITY_CANNOT_INITIATE`), so
 * leaving it out sends the enquiry as the member themselves, which is the
 * only caller this route accepts.
 */
export const sendIdentityEnquiry = (
  target: IdentityContactTarget,
  body: string,
) => apiPost<IdentityEnquirySentDTO>(identityEnquiryPath(target), { body });

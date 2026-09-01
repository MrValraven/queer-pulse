import { apiGet, apiPost } from "../../../shared/api/client";

/**
 * Why the business behind a listing cannot be written to. Mirrors the
 * backend's `ListingContactUnavailableReason` exactly, including the fact that
 * a block is reported as the direction-neutral `unavailable` and never as
 * "they blocked you": the endpoint must not become a way to test whether a
 * particular person has blocked you, so the frontend copy stays neutral too.
 */
export type ListingContactUnavailableReason =
  /** Nobody has claimed this entry, so the account attached to it belongs to
   *  the member who suggested the place rather than to the business. */
  | "unclaimed"
  /** Parked on a house account, or the owning account is gone or not active. */
  | "no_owner_account"
  /** The caller owns this listing. */
  | "own_listing"
  /** A block in either direction, reported without direction. */
  | "unavailable";

/**
 * Which counted cap is currently holding this member back. Mirrors the
 * backend's `ListingEnquiryLimitReason`.
 *
 * There is no remaining count here and there should never be one. The backend
 * withholds the numbers deliberately: a "1 left" beside a compose box reads as
 * a budget to spend, and the caps exist because a steady trickle of private
 * messages from one account is the shape that wears a small queer venue down.
 * What the member needs is whether they may write now, why not, and for how
 * long, which is exactly what these three fields carry.
 */
export type ListingEnquiryLimitReason =
  /** Already written to THIS business inside the last day. */
  | "wrote_to_this_business_today"
  /** Written to enough different businesses inside the last day. */
  | "wrote_across_directory_today";

/**
 * `GET /directory/:slug/contact` — whether this member can write to this
 * listing's business, and what the thread will allow afterwards.
 *
 * Every field here is something the member needs BEFORE they type, which is
 * why the detail page reads it up front rather than discovering it from a
 * rejected send.
 */
export interface ListingContactDTO {
  canMessageOwner: boolean;
  /** `null` exactly when `canMessageOwner` is true. */
  unavailableReason: ListingContactUnavailableReason | null;
  /**
   * The first enquiry lands, and after it the thread is closed to further
   * messages from EITHER side until a connection is accepted. Surfaced in the
   * composer so nobody writes expecting a conversation they cannot have.
   */
  replyRequiresConnection: boolean;
  /** The thread this member already has with this listing's owner, when they
   *  have written before. Backs the "open the conversation" shortcut. */
  existingConversationId: string | null;
  /**
   * A counted cap would refuse this member's next enquiry, so the composer
   * stays shut instead of opening onto a message that will be thrown away.
   *
   * Separate from `canMessageOwner`, which is a fact about the business. This
   * one is a fact about the caller and it is temporary, so the page keeps the
   * "open the conversation you already started" link beside it: that is the
   * thing a capped member should be doing.
   *
   * A COURTESY, NOT A GATE. The send path re-checks every cap on its own and
   * this read can be minutes stale by the time somebody finishes typing, so the
   * 429 handling in `useListingEnquiry` stays exactly where it is.
   */
  hasReachedEnquiryLimit: boolean;
  /** Which cap. `null` exactly when `hasReachedEnquiryLimit` is false. */
  enquiryLimitReason: ListingEnquiryLimitReason | null;
  /** ISO 8601 instant the cap actually lifts, or `null` when nothing is capped.
   *  The windows roll rather than resetting at midnight, so this is a real
   *  computed moment and it is safe to say it out loud. */
  enquiryLimitClearsAt: string | null;
}

/** `POST /directory/:slug/enquiries` — where the member's message went. */
export interface ListingEnquirySentDTO {
  /** Deep-link target: the 1:1 thread the enquiry was delivered into. */
  conversationId: string;
  enquiryId: string;
  replyRequiresConnection: boolean;
}

/**
 * The contact read. Plain `apiGet`, deliberately: the backend's `getContact`
 * returns a `ListingContactDTO` on every path and never `null` (an unreachable
 * owner is an object with `canMessageOwner: false`, which is an answer rather
 * than an absence), so there is no empty Nest body for `apiGetNullable` to
 * normalise here.
 */
export const getListingContact = (slug: string, signal?: AbortSignal) =>
  apiGet<ListingContactDTO>(
    `/directory/${encodeURIComponent(slug)}/contact`,
    undefined,
    undefined,
    signal,
  );

/** Deliver a private enquiry to the listing's business as a direct message. */
export const sendListingEnquiry = (slug: string, body: string) =>
  apiPost<ListingEnquirySentDTO>(
    `/directory/${encodeURIComponent(slug)}/enquiries`,
    { body },
  );

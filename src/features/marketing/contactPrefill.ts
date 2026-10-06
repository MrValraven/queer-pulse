import { routes } from "../../app/routeMap";
import type { InquiryKind } from "./api/inquiries.api";

/**
 * PRD-434. The contact form's topic for a correction to a business directory
 * listing. A message sent under it goes to the backend as its own
 * `listing_correction` inquiry kind, carrying the listing's ref, so the admin
 * inbox can label it and link to the listing.
 */
export const LISTING_CORRECTION_TOPIC = "listing_correction";

/**
 * A listing reference as the API issues it (`QPL-2026-0007`). Kept loose on
 * purpose, letters, digits and hyphens, so a future prefix still prefills,
 * while anything else in a hand-typed URL is ignored.
 */
const LISTING_REF_PATTERN = /^[A-Za-z0-9-]{3,40}$/;

/**
 * The contact form, opened for a correction to the listing with this
 * reference: the topic preselected and a note naming the ref above the
 * message, which is prepended to the body on submit. Shared by the
 * list-business success panel and the `listing_suggestion_*` notification
 * rows.
 */
export function listingCorrectionContactPath(listingRef: string): string {
  const params = new URLSearchParams({
    topic: LISTING_CORRECTION_TOPIC,
    ref: listingRef,
  });
  return `${routes.contact}?${params.toString()}`;
}

/** The `?ref=` value when it looks like a listing reference, trimmed. */
export function listingRefFromParam(value: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed && LISTING_REF_PATTERN.test(trimmed) ? trimmed : undefined;
}

/**
 * PRD-434. How a Contact message is filed: a listing correction goes as its
 * own `listing_correction` kind with the listing's ref (when the link carried
 * one), and every other topic as a plain `contact` message.
 */
export function contactInquiryRouting(
  topic: string,
  listingRef: string | undefined,
): { kind: InquiryKind; listingRef?: string } {
  if (topic !== LISTING_CORRECTION_TOPIC) return { kind: "contact" };
  return listingRef
    ? { kind: "listing_correction", listingRef }
    : { kind: "listing_correction" };
}

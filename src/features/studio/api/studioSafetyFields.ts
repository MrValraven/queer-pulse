import {
  STUDIO_CONTENT_WARNING_IDS,
  type StudioClaimantRole,
  type StudioContentWarningId,
  type StudioOwnerClaimDTO,
  type StudioOwnerClaimStatus,
} from "./studioSafety.types";

// Studio safety: the field mappers studio.adapters.ts needs. A leaf module
// (it imports no adapter), so the adapters can import it without a cycle.

const KNOWN_WARNING_IDS: ReadonlySet<string> = new Set(
  STUDIO_CONTENT_WARNING_IDS,
);

/** Warnings as the player and the pills read them: known ids only, each
 *  once, in D7 order. The server validates the same list, so nothing it
 *  stores is dropped here. */
export function contentWarningsOf(
  ids: readonly string[] | null | undefined,
): StudioContentWarningId[] {
  const present = new Set(
    (ids ?? []).filter((id) => KNOWN_WARNING_IDS.has(id)),
  );
  return STUDIO_CONTENT_WARNING_IDS.filter((id) => present.has(id));
}

/** A claim's link to the original, kept only when it is http or https. */
export function safeOriginalLinkOf(
  url: string | null | undefined,
): string | null {
  const trimmed = url?.trim() ?? "";
  return /^https?:\/\/\S+$/i.test(trimmed) ? trimmed : null;
}

/** The owner's view of a claim on one of their tracks. It never carries the
 *  claimant (spec 9). */
export interface StudioOwnerClaimView {
  id: string;
  trackId: string;
  status: StudioOwnerClaimStatus;
  originalWork: string;
  originalLink: string | null;
  details: string;
  claimantRole: StudioClaimantRole;
  counterNote: string | null;
  claimantReply: string | null;
  staffNote: string | null;
  acceptedAt: string;
  counteredAt: string | null;
  decidedAt: string | null;
  /** Accepted, and no counter-notice sent yet. */
  canCounter: boolean;
  /** Accepted or countered: the claim keeps the track offline. */
  isHolding: boolean;
}

/** Field by field, so whatever else a server sends (a claimant, a member
 *  id) never reaches the owner's screen. */
export function toOwnerClaimView(
  dto: StudioOwnerClaimDTO,
): StudioOwnerClaimView {
  return {
    id: dto.id,
    trackId: dto.trackId,
    status: dto.status,
    originalWork: dto.originalWork,
    originalLink: safeOriginalLinkOf(dto.originalLink),
    details: dto.details,
    claimantRole: dto.claimantRole,
    counterNote: dto.counterNote,
    claimantReply: dto.claimantReply,
    staffNote: dto.staffNote,
    acceptedAt: dto.acceptedAt,
    counteredAt: dto.counteredAt,
    decidedAt: dto.decidedAt,
    canCounter:
      dto.status === "accepted" &&
      dto.canCounter === true &&
      dto.counterNote === null,
    isHolding: dto.status === "accepted" || dto.status === "countered",
  };
}

/** Newest acceptedAt first, then id, as the contract orders the release's
 *  claims. */
export function newestAcceptedFirst(
  left: StudioOwnerClaimView,
  right: StudioOwnerClaimView,
): number {
  return (
    right.acceptedAt.localeCompare(left.acceptedAt) ||
    right.id.localeCompare(left.id)
  );
}

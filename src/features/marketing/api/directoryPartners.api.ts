import {
  ApiError,
  apiGet,
  type ResponseValidator,
} from "../../../shared/api/client";
import { validateDirectoryList } from "../../../shared/api/validation";
import type { DirectoryPlace, Tint } from "../directoryPlaces";
import type { DirectoryCardDTO } from "./directory.api";

/**
 * Frontend mirror of the directory partners wire contract
 * (QUEERPULSE-DIRECTORY-PARTNERS-CONTRACT-2026-11-02.md). Names match the
 * backend's `directory-partners.constants.ts` and `listing-response.ts`.
 */

/** The most businesses an admin can pick for the partners row. */
export const DIRECTORY_PARTNER_LIMIT = 12;

/** The longest partner note, counted in code points after trimming. */
export const DIRECTORY_PARTNER_NOTE_MAX = 140;

/** The backend's name for the card tint; the frontend calls it `Tint`. */
export type DirectoryTint = Tint;

/** One card of the public `GET /directory/partners` read, in position order. */
export interface DirectoryPartnerCardDTO extends DirectoryCardDTO {
  partnerNote: string | null;
}

/** Why a pick shows on the public row or stays off it. The first matching
 *  reason in this order wins on the server. */
export type DirectoryPartnerPublicState =
  | "showing"
  | "not_live"
  | "closed_for_good"
  | "hidden_by_owner"
  | "moderated"
  | "adult_only";

/** One pick as the admin Partners tab lists it. */
export interface AdminDirectoryPartnerDTO {
  /** The pick id. */
  id: string;
  listingId: string;
  /** For linking to `/admin/listings/:ref`. */
  listingRef: string;
  slug: string;
  name: string;
  cat: string;
  /** Can be `""` for an online-only listing. */
  hood: string;
  coverImage: string | null;
  tint: DirectoryTint;
  av: string;
  note: string | null;
  position: number;
  publicState: DirectoryPartnerPublicState;
}

/** One hit of the admin candidate search. */
export interface AdminDirectoryPartnerSearchResultDTO {
  listingId: string;
  slug: string;
  name: string;
  cat: string;
  hood: string;
  tint: DirectoryTint;
  av: string;
  isPartner: boolean;
}

/** Every reason code the partner routes can refuse with (contract section 4). */
export const DIRECTORY_PARTNER_REFUSAL_REASONS = [
  "listing_not_found",
  "partner_not_found",
  "listing_not_live",
  "listing_adult_only",
  "already_partner",
  "partner_limit_reached",
  "note_too_long",
  "order_mismatch",
] as const;

export type DirectoryPartnerRefusalReason =
  (typeof DIRECTORY_PARTNER_REFUSAL_REASONS)[number];

function isDirectoryPartnerRefusalReason(
  value: unknown,
): value is DirectoryPartnerRefusalReason {
  return (
    typeof value === "string" &&
    (DIRECTORY_PARTNER_REFUSAL_REASONS as readonly string[]).includes(value)
  );
}

/**
 * The reason code of a partner route refusal, read from the body's `reason`
 * field only. Returns null for anything else (a network failure, a 500, or a
 * reason this build does not know), so the caller can show its own copy for
 * that case.
 */
export function directoryPartnerRefusalOf(
  error: unknown,
): DirectoryPartnerRefusalReason | null {
  if (!(error instanceof ApiError)) return null;
  const body = error.data;
  if (typeof body !== "object" || body === null) return null;
  const reason = (body as { reason?: unknown }).reason;
  return isDirectoryPartnerRefusalReason(reason) ? reason : null;
}

/** A partner as the public row renders it: the adapted card plus its note. */
export interface DirectoryPartnerPlace {
  place: DirectoryPlace;
  note: string | null;
}

/** The card validator checks every card field; `partnerNote` is read through
 *  `partnerCardToPlace`, which treats a missing note as null. */
const validateDirectoryPartnerList: ResponseValidator<
  DirectoryPartnerCardDTO[]
> = (data) => validateDirectoryList(data) as DirectoryPartnerCardDTO[];

/** GET /directory/partners: the public partners row, ordered by position. */
export function getDirectoryPartners(
  signal?: AbortSignal,
): Promise<DirectoryPartnerCardDTO[]> {
  return apiGet<DirectoryPartnerCardDTO[]>(
    "/directory/partners",
    undefined,
    validateDirectoryPartnerList,
    signal,
  );
}

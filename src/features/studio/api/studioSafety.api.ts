import { ApiError, apiGet, apiPost } from "../../../shared/api/client";
import type { StudioPageDTO } from "./studio.types";
import {
  STUDIO_SAFETY_ERROR_CODES,
  type CounterStudioClaimBody,
  type CreateStudioClaimBody,
  type ReplyStudioClaimBody,
  type StudioAddContentWarningsBody,
  type StudioAdminClaimCountsDTO,
  type StudioAdminClaimDTO,
  type StudioAdminTrackDTO,
  type StudioClaimStatus,
  type StudioMarkExplicitBody,
  type StudioMyClaimDTO,
  type StudioOwnerClaimDTO,
  type StudioSafetyErrorCode,
} from "./studioSafety.types";

// One raw call per endpoint of the Studio safety and moderation contract
// (QUEERPULSE-STUDIO-SAFETY-MODERATION-CONTRACT-2026-10-14.md). The player
// gate has no route: nothing here hears about a play, a skip or a gate.

const segment = (id: string) => encodeURIComponent(id);

function queryOf(params: Record<string, string | null>): string {
  const search = new URLSearchParams();
  for (const [name, value] of Object.entries(params))
    if (value) search.set(name, value);
  const text = search.toString();
  return text ? `?${text}` : "";
}

/** A member's claim about a track they can hear. 409 `studio_claim_own_track`,
 *  `studio_claim_exists`, `studio_claim_limit`; 403 restricted; 429 past 3
 *  an hour. */
export const fileStudioClaim = (trackId: string, body: CreateStudioClaimBody) =>
  apiPost<StudioMyClaimDTO>(
    `/studio/tracks/${segment(trackId)}/copyright-claims`,
    body,
  );

/** The claimant's claims, newest first, 20 a page. */
export const getMyStudioClaims = (cursor: string | null) =>
  apiGet<StudioPageDTO<StudioMyClaimDTO>>(
    `/me/studio/copyright-claims${queryOf({ cursor })}`,
  );

/** One reply, only while countered. */
export const replyToStudioClaim = (
  claimId: string,
  body: ReplyStudioClaimBody,
) =>
  apiPost<StudioMyClaimDTO>(
    `/me/studio/copyright-claims/${segment(claimId)}/reply`,
    body,
  );

export const withdrawStudioClaim = (claimId: string) =>
  apiPost<StudioMyClaimDTO>(
    `/me/studio/copyright-claims/${segment(claimId)}/withdraw`,
  );

/** The owner's one counter-notice, only while accepted. */
export const counterStudioClaim = (
  claimId: string,
  body: CounterStudioClaimBody,
) =>
  apiPost<StudioOwnerClaimDTO>(
    `/studio/copyright-claims/${segment(claimId)}/counter`,
    body,
  );

/** The staff queue, oldest first. No status reads submitted and countered
 *  together, the work the badge counts. */
export const getAdminStudioClaims = (
  status: StudioClaimStatus | null,
  cursor: string | null,
) =>
  apiGet<StudioPageDTO<StudioAdminClaimDTO>>(
    `/admin/studio/copyright-claims${queryOf({ status, cursor })}`,
  );

export const getAdminStudioClaimCounts = () =>
  apiGet<StudioAdminClaimCountsDTO>("/admin/studio/copyright-claims/counts");

export type StudioClaimDecision = "accept" | "decline" | "uphold" | "reject";

/** Accept takes no body; decline, uphold and reject carry the note both
 *  sides read. */
export const decideStudioClaim = (
  claimId: string,
  decision: StudioClaimDecision,
  note: string | null,
) =>
  apiPost<StudioAdminClaimDTO>(
    `/admin/studio/copyright-claims/${segment(claimId)}/${decision}`,
    decision === "accept" ? undefined : { note },
  );

export const getAdminStudioTrack = (trackId: string) =>
  apiGet<StudioAdminTrackDTO>(`/admin/studio/tracks/${segment(trackId)}`);

export const markStudioTrackExplicit = (
  trackId: string,
  body: StudioMarkExplicitBody,
) =>
  apiPost<StudioAdminTrackDTO>(
    `/admin/studio/tracks/${segment(trackId)}/mark-explicit`,
    body,
  );

export const addStudioTrackWarnings = (
  trackId: string,
  body: StudioAddContentWarningsBody,
) =>
  apiPost<StudioAdminTrackDTO>(
    `/admin/studio/tracks/${segment(trackId)}/content-warnings`,
    body,
  );

const KNOWN_SAFETY_CODES: ReadonlySet<string> = new Set(
  STUDIO_SAFETY_ERROR_CODES,
);

/** The contract's stable `code` from an error body, when it is one of the
 *  safety codes. */
export function studioSafetyErrorCodeOf(
  error: unknown,
): StudioSafetyErrorCode | null {
  if (!(error instanceof ApiError)) return null;
  const body = error.data;
  if (!body || typeof body !== "object" || !("code" in body)) return null;
  const code = (body as { code?: unknown }).code;
  return typeof code === "string" && KNOWN_SAFETY_CODES.has(code)
    ? (code as StudioSafetyErrorCode)
    : null;
}

/** A listener reading a withheld track: 410 `studio_track_withheld`, which
 *  names nothing else. */
export function isStudioTrackWithheld(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 410 &&
    studioSafetyErrorCodeOf(error) === "studio_track_withheld"
  );
}

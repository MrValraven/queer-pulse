import type {
  StudioAdminReleaseSummaryDTO,
  StudioArtistRefDTO,
} from "./studio.types";

// ── Studio safety and moderation (QUEERPULSE-STUDIO-SAFETY-MODERATION-CONTRACT-2026-10-14.md) ──
// The new wire shapes, in their own file like personaPosts.types.ts. The
// fields this feature adds to existing DTOs sit on those DTOs in
// studio.types.ts.

/** D7, in this order. The effective list on the wire always follows it. */
export const STUDIO_CONTENT_WARNING_IDS = [
  "medical",
  "violence",
  "substances",
  "family-rejection",
  "sexual-content",
  "self-harm",
  "housing-loss",
  "police",
] as const;
export type StudioContentWarningId =
  (typeof STUDIO_CONTENT_WARNING_IDS)[number];
export const STUDIO_CONTENT_WARNINGS_MAX = 8;

export const STUDIO_CLAIM_STATUSES = [
  "submitted",
  "accepted",
  "declined",
  "countered",
  "upheld",
  "rejected",
  "withdrawn",
] as const;
export type StudioClaimStatus = (typeof STUDIO_CLAIM_STATUSES)[number];
export const STUDIO_CLAIM_LIVE_STATUSES: readonly StudioClaimStatus[] = [
  "submitted",
  "accepted",
  "countered",
];
/** The live statuses a claim holds a track under review with (an upheld
 *  claim also keeps the track offline, see STUDIO_CLAIM_WITHHOLDING_STATUSES). */
export const STUDIO_CLAIM_HOLDING_STATUSES: readonly StudioClaimStatus[] = [
  "accepted",
  "countered",
];
/** The statuses that keep a track offline (matches the backend restore rule). */
export const STUDIO_CLAIM_WITHHOLDING_STATUSES: readonly StudioClaimStatus[] = [
  "accepted",
  "countered",
  "upheld",
];
/** The statuses an owner can see on a claim against their track. */
export const STUDIO_CLAIM_OWNER_VISIBLE_STATUSES: readonly StudioClaimStatus[] =
  ["accepted", "countered", "upheld", "rejected"];
export const STUDIO_CLAIMANT_ROLES = ["rights_holder", "authorised"] as const;
export type StudioClaimantRole = (typeof STUDIO_CLAIMANT_ROLES)[number];
export type StudioOwnerClaimStatus = Extract<
  StudioClaimStatus,
  "accepted" | "countered" | "upheld" | "rejected"
>;

export const STUDIO_CLAIM_LIMITS = {
  originalWorkMax: 200,
  originalLinkMax: 500,
  detailsMax: 2000,
  counterNoteMax: 2000,
  replyMax: 1000,
  staffNoteMax: 1000,
  liveClaimsPerClaimant: 10,
  filingsPerHour: 3,
  pageSize: 20,
} as const;

/** The 14 codes the contract adds. STUDIO_ERROR_CODES spreads them
 *  (Task 5). */
export const STUDIO_SAFETY_ERROR_CODES = [
  "studio_track_withheld",
  "studio_track_explicit_locked",
  "studio_use_copyright_claim",
  "studio_claim_own_track",
  "studio_claim_exists",
  "studio_claim_limit",
  "studio_claim_not_countered",
  "studio_claim_already_replied",
  "studio_claim_not_live",
  "studio_claim_not_accepted",
  "studio_claim_not_submitted",
  "studio_claim_not_decidable",
  "studio_track_report_mismatch",
  "studio_track_report_not_open",
] as const;
export type StudioSafetyErrorCode = (typeof STUDIO_SAFETY_ERROR_CODES)[number];

/** The 410 a listener gets for a withheld track's page, stream or
 *  playlists. It names nothing. */
export interface StudioWithheldErrorBody {
  statusCode: 410;
  code: "studio_track_withheld";
  /** "This track is unavailable." */
  message: string;
  error: "Gone";
}

/** Owner view of a claim on one of their tracks. Never names the claimant. */
export interface StudioOwnerClaimDTO {
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
  canCounter: boolean;
}

export interface StudioMyClaimDTO {
  id: string;
  status: StudioClaimStatus;
  claimantRole: StudioClaimantRole;
  originalWork: string;
  originalLink: string | null;
  details: string;
  counterNote: string | null;
  claimantReply: string | null;
  staffNote: string | null;
  createdAt: string;
  acceptedAt: string | null;
  counteredAt: string | null;
  repliedAt: string | null;
  decidedAt: string | null;
  canReply: boolean;
  canWithdraw: boolean;
  /** A claim on a persona that was later unlinked is severed: it serves the
   *  snapshot taken at filing and id, release and artist are null. */
  track: {
    id: string | null;
    title: string;
    release: { id: string | null; title: string | null };
    artist: StudioArtistRefDTO | null;
    artistName: string;
  };
}

/** POST /studio/tracks/:id/copyright-claims */
export interface CreateStudioClaimBody {
  claimantRole: StudioClaimantRole;
  originalWork: string;
  originalLink?: string | null;
  details: string;
  goodFaith: true;
}

/** POST /me/studio/copyright-claims/:id/reply */
export interface ReplyStudioClaimBody {
  reply: string;
}

/** POST /studio/copyright-claims/:id/counter */
export interface CounterStudioClaimBody {
  note: string;
  goodFaith: true;
}

/** POST /admin/studio/copyright-claims/:id/decline, /uphold, /reject */
export interface StudioClaimDecisionBody {
  note: string;
}

export interface StudioClaimantRefDTO {
  id: string;
  slug: string;
  displayName: string;
  avatarUrl: string | null;
}

/** GET /admin/studio/copyright-claims, oldest first; also the answer of
 *  accept, decline, uphold and reject. */
export interface StudioAdminClaimDTO {
  id: string;
  status: StudioClaimStatus;
  claimantRole: StudioClaimantRole;
  originalWork: string;
  originalLink: string | null;
  details: string;
  counterNote: string | null;
  claimantReply: string | null;
  staffNote: string | null;
  createdAt: string;
  acceptedAt: string | null;
  counteredAt: string | null;
  repliedAt: string | null;
  decidedAt: string | null;
  claimant: StudioClaimantRefDTO;
  track: { id: string; title: string; position: number; isWithheld: boolean };
  release: StudioAdminReleaseSummaryDTO;
}

/** GET /admin/studio/copyright-claims/counts: the Claims tab badge is
 *  submitted plus countered, and the Disputes tab badge is the artists'
 *  takedown disputes still waiting for our team. */
export interface StudioAdminClaimCountsDTO {
  submitted: number;
  countered: number;
  disputesWaiting: number;
}

/** GET /admin/studio/tracks/:id; also the answer of mark-explicit and
 *  content-warnings. */
export interface StudioAdminTrackDTO {
  id: string;
  releaseId: string;
  position: number;
  title: string;
  durationSeconds: number | null;
  hasAudio: boolean;
  isExplicit: boolean;
  isExplicitLocked: boolean;
  contentWarnings: StudioContentWarningId[];
  artistContentWarnings: StudioContentWarningId[];
  staffContentWarnings: StudioContentWarningId[];
  isWithheld: boolean;
  release: StudioAdminReleaseSummaryDTO;
}

/** POST /admin/studio/tracks/:id/mark-explicit */
export interface StudioMarkExplicitBody {
  reportId?: string;
}

/** POST /admin/studio/tracks/:id/content-warnings */
export interface StudioAddContentWarningsBody {
  warnings: StudioContentWarningId[];
  reportId?: string;
}

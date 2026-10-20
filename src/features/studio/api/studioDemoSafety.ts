import { ApiError } from "../../../shared/api/client";
import { REASON_LABEL_KEYS } from "../../safety/reportReasons";
import type {
  StudioPageDTO,
  StudioReleaseDTO,
  StudioTrackSummaryDTO,
} from "./studio.types";
import { DEMO_RELEASES } from "./studioDemo.data";
import {
  DEMO_ARTIST_WARNINGS,
  DEMO_CLAIM_SEEDS,
  DEMO_LOCKED_EXPLICIT_TRACK_IDS,
  DEMO_SELF_CLAIMANT,
  DEMO_STAFF_WARNINGS,
  DEMO_TRACK_REPORT_SEEDS,
  type DemoClaimSeed,
} from "./studioDemoSafety.data";
import type { StudioReviewPage } from "./studioFlagReview.adapters";
import type { StudioClaimDecision } from "./studioSafety.api";
import type { StudioReviewTrackReportView } from "./studioSafety.adapters";
import { contentWarningsOf } from "./studioSafetyFields";
import {
  STUDIO_CLAIM_LIMITS,
  STUDIO_CLAIM_LIVE_STATUSES,
  STUDIO_CLAIM_OWNER_VISIBLE_STATUSES,
  STUDIO_CLAIM_WITHHOLDING_STATUSES,
  type CreateStudioClaimBody,
  type StudioAdminClaimCountsDTO,
  type StudioAdminClaimDTO,
  type StudioAdminTrackDTO,
  type StudioClaimStatus,
  type StudioContentWarningId,
  type StudioMyClaimDTO,
  type StudioOwnerClaimDTO,
  type StudioOwnerClaimStatus,
  type StudioSafetyErrorCode,
} from "./studioSafety.types";

// The demo's Studio safety store: claims, warnings, explicit marks and open
// track reports, in memory for the session, answering as the server would.

interface DemoSafetyState {
  claims: DemoClaimSeed[];
  artistWarnings: Map<string, StudioContentWarningId[]>;
  staffWarnings: Map<string, StudioContentWarningId[]>;
  lockedExplicit: Set<string>;
  trackReports: StudioReviewTrackReportView[];
}

function seed(): DemoSafetyState {
  return {
    claims: DEMO_CLAIM_SEEDS.map((claim) => ({ ...claim })),
    artistWarnings: new Map(Object.entries(DEMO_ARTIST_WARNINGS)),
    staffWarnings: new Map(Object.entries(DEMO_STAFF_WARNINGS)),
    lockedExplicit: new Set(DEMO_LOCKED_EXPLICIT_TRACK_IDS),
    trackReports: DEMO_TRACK_REPORT_SEEDS.map((report) => ({
      ...report,
      reasonLabelKey: REASON_LABEL_KEYS[report.reasonCode],
    })),
  };
}

let state = seed();
let claimSequence = 0;

/** Test seam: back to the seeds. */
export function resetDemoSafety(): void {
  state = seed();
  claimSequence = 0;
}

const safetyError = (status: number, code: StudioSafetyErrorCode) =>
  new ApiError(status, code, { statusCode: status, code, message: code });
const claimNotFound = () => new ApiError(404, "Claim not found");
const trackNotFound = () => new ApiError(404, "Track not found");

function trackRefOf(trackId: string) {
  for (const release of DEMO_RELEASES) {
    const track = release.tracks.find((candidate) => candidate.id === trackId);
    if (track) return { track, release };
  }
  return null;
}

function requireTrackRef(trackId: string) {
  const ref = trackRefOf(trackId);
  if (!ref) throw trackNotFound();
  return ref;
}

function replaceClaim(next: DemoClaimSeed): DemoClaimSeed {
  state.claims = state.claims.map((claim) =>
    claim.id === next.id ? next : claim,
  );
  return next;
}

const nowIso = () => new Date().toISOString();

export function demoWithheldTrackIds(): ReadonlySet<string> {
  return new Set(
    state.claims
      .filter((claim) =>
        STUDIO_CLAIM_WITHHOLDING_STATUSES.includes(claim.status),
      )
      .map((claim) => claim.trackId),
  );
}

export function demoEffectiveWarnings(
  trackId: string,
): StudioContentWarningId[] {
  return contentWarningsOf([
    ...(state.artistWarnings.get(trackId) ?? []),
    ...(state.staffWarnings.get(trackId) ?? []),
  ]);
}

export function demoIsExplicitLocked(trackId: string): boolean {
  return state.lockedExplicit.has(trackId);
}

export function demoSetArtistWarnings(
  trackId: string,
  ids: readonly string[],
): void {
  state.artistWarnings.set(trackId, contentWarningsOf(ids));
}

/** A row as the server sends it to this viewer: a listener's withheld row
 *  keeps its id and position and names nothing; an owner's row carries the
 *  two warning lists and the explicit lock. */
export function demoTrackWithSafety(
  track: StudioTrackSummaryDTO,
  isOwner: boolean,
): StudioTrackSummaryDTO {
  const isWithheld = demoWithheldTrackIds().has(track.id);
  if (isWithheld && !isOwner)
    return {
      id: track.id,
      position: track.position,
      title: "",
      durationSeconds: null,
      isExplicit: false,
      hasAudio: false,
      publishedAt: track.publishedAt,
      contentWarnings: [],
      isWithheld: true,
    };
  const withSafety: StudioTrackSummaryDTO = {
    ...track,
    isExplicit: track.isExplicit || state.lockedExplicit.has(track.id),
    contentWarnings: demoEffectiveWarnings(track.id),
    isWithheld,
  };
  if (!isOwner) return withSafety;
  return {
    ...withSafety,
    artistContentWarnings: contentWarningsOf(
      state.artistWarnings.get(track.id),
    ),
    staffContentWarnings: contentWarningsOf(state.staffWarnings.get(track.id)),
    isExplicitLocked: state.lockedExplicit.has(track.id),
  };
}

function toOwnerClaimDto(claim: DemoClaimSeed): StudioOwnerClaimDTO {
  return {
    id: claim.id,
    trackId: claim.trackId,
    status: claim.status as StudioOwnerClaimStatus,
    originalWork: claim.originalWork,
    originalLink: claim.originalLink,
    details: claim.details,
    claimantRole: claim.claimantRole,
    counterNote: claim.counterNote,
    claimantReply: claim.claimantReply,
    staffNote: claim.staffNote,
    acceptedAt: claim.acceptedAt ?? claim.createdAt,
    counteredAt: claim.counteredAt,
    decidedAt: claim.decidedAt,
    canCounter: claim.status === "accepted" && claim.counterNote === null,
  };
}

export function demoOwnerClaimsOfTrack(trackId: string): StudioOwnerClaimDTO[] {
  return state.claims
    .filter(
      (claim) =>
        claim.trackId === trackId &&
        STUDIO_CLAIM_OWNER_VISIBLE_STATUSES.includes(claim.status),
    )
    .map(toOwnerClaimDto);
}

export function demoOwnerClaimsOfRelease(
  release: StudioReleaseDTO,
): StudioOwnerClaimDTO[] {
  return release.tracks.flatMap((track) => demoOwnerClaimsOfTrack(track.id));
}

function toMyClaimDto(claim: DemoClaimSeed): StudioMyClaimDTO {
  const { track, release } = requireTrackRef(claim.trackId);
  return {
    id: claim.id,
    status: claim.status,
    claimantRole: claim.claimantRole,
    originalWork: claim.originalWork,
    originalLink: claim.originalLink,
    details: claim.details,
    counterNote: claim.counterNote,
    claimantReply: claim.claimantReply,
    staffNote: claim.staffNote,
    createdAt: claim.createdAt,
    acceptedAt: claim.acceptedAt,
    counteredAt: claim.counteredAt,
    repliedAt: claim.repliedAt,
    decidedAt: claim.decidedAt,
    canReply: claim.status === "countered" && claim.claimantReply === null,
    canWithdraw: STUDIO_CLAIM_LIVE_STATUSES.includes(claim.status),
    track: {
      id: track.id,
      title: track.title,
      release: { id: release.id, title: release.title },
      artist: release.artist,
      artistName: release.artist.name,
    },
  };
}

function toAdminClaimDto(claim: DemoClaimSeed): StudioAdminClaimDTO {
  const { track, release } = requireTrackRef(claim.trackId);
  return {
    ...toMyClaimDto(claim),
    claimant: claim.claimant,
    track: {
      id: track.id,
      title: track.title,
      position: track.position,
      isWithheld: demoWithheldTrackIds().has(track.id),
    },
    release: { ...release, takenDownAt: null },
  };
}

const onePage = <Item>(items: Item[]): StudioPageDTO<Item> => ({
  items,
  pageInfo: { nextCursor: null, hasMore: false },
});

export function demoFileClaim(
  trackId: string,
  body: CreateStudioClaimBody,
): StudioMyClaimDTO {
  const ref = trackRefOf(trackId);
  if (!ref || !ref.track.hasAudio) throw trackNotFound();
  if (ref.release.isOwner) throw safetyError(409, "studio_claim_own_track");
  const live = state.claims.filter(
    (claim) =>
      claim.isMine && STUDIO_CLAIM_LIVE_STATUSES.includes(claim.status),
  );
  if (live.some((claim) => claim.trackId === trackId))
    throw safetyError(409, "studio_claim_exists");
  if (live.length >= STUDIO_CLAIM_LIMITS.liveClaimsPerClaimant)
    throw safetyError(409, "studio_claim_limit");
  claimSequence += 1;
  const claim: DemoClaimSeed = {
    id: `demo-claim-filed-${claimSequence}`,
    trackId,
    claimant: DEMO_SELF_CLAIMANT,
    isMine: true,
    claimantRole: body.claimantRole,
    originalWork: body.originalWork.trim(),
    originalLink: body.originalLink?.trim() || null,
    details: body.details.trim(),
    status: "submitted",
    counterNote: null,
    claimantReply: null,
    staffNote: null,
    createdAt: nowIso(),
    acceptedAt: null,
    counteredAt: null,
    repliedAt: null,
    decidedAt: null,
  };
  state.claims = [claim, ...state.claims];
  return toMyClaimDto(claim);
}

export function demoMyClaimsPage(): StudioPageDTO<StudioMyClaimDTO> {
  return onePage(
    state.claims
      .filter((claim) => claim.isMine)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .map(toMyClaimDto),
  );
}

function requireMine(claimId: string): DemoClaimSeed {
  const claim = state.claims.find(
    (candidate) => candidate.id === claimId && candidate.isMine,
  );
  if (!claim) throw claimNotFound();
  return claim;
}

export function demoReplyToClaim(
  claimId: string,
  reply: string,
): StudioMyClaimDTO {
  const claim = requireMine(claimId);
  if (claim.status !== "countered")
    throw safetyError(409, "studio_claim_not_countered");
  if (claim.claimantReply !== null)
    throw safetyError(409, "studio_claim_already_replied");
  return toMyClaimDto(
    replaceClaim({
      ...claim,
      claimantReply: reply.trim(),
      repliedAt: nowIso(),
    }),
  );
}

export function demoWithdrawClaim(claimId: string): StudioMyClaimDTO {
  const claim = requireMine(claimId);
  if (!STUDIO_CLAIM_LIVE_STATUSES.includes(claim.status))
    throw safetyError(409, "studio_claim_not_live");
  return toMyClaimDto(replaceClaim({ ...claim, status: "withdrawn" }));
}

export function demoCounterClaim(
  claimId: string,
  note: string,
): StudioOwnerClaimDTO {
  const claim = state.claims.find((candidate) => candidate.id === claimId);
  const ref = claim ? trackRefOf(claim.trackId) : null;
  if (
    !claim ||
    !ref?.release.isOwner ||
    !STUDIO_CLAIM_OWNER_VISIBLE_STATUSES.includes(claim.status)
  )
    throw claimNotFound();
  if (claim.status !== "accepted")
    throw safetyError(409, "studio_claim_not_accepted");
  return toOwnerClaimDto(
    replaceClaim({
      ...claim,
      status: "countered",
      counterNote: note.trim(),
      counteredAt: nowIso(),
    }),
  );
}

export function demoAdminClaimsPage(
  status: StudioClaimStatus | null,
): StudioPageDTO<StudioAdminClaimDTO> {
  const isWanted = (claim: DemoClaimSeed) =>
    status === null
      ? claim.status === "submitted" || claim.status === "countered"
      : claim.status === status;
  return onePage(
    state.claims
      .filter(isWanted)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
      .map(toAdminClaimDto),
  );
}

export function demoAdminClaimCounts(): StudioAdminClaimCountsDTO {
  const countOf = (status: StudioClaimStatus) =>
    state.claims.filter((claim) => claim.status === status).length;
  return { submitted: countOf("submitted"), countered: countOf("countered") };
}

export function demoDecideClaim(
  claimId: string,
  decision: StudioClaimDecision,
  note: string | null,
): StudioAdminClaimDTO {
  const claim = state.claims.find((candidate) => candidate.id === claimId);
  if (!claim) throw claimNotFound();
  const decidedAt = nowIso();
  if (decision === "accept" || decision === "decline") {
    if (claim.status !== "submitted")
      throw safetyError(409, "studio_claim_not_submitted");
    return toAdminClaimDto(
      replaceClaim(
        decision === "accept"
          ? { ...claim, status: "accepted", acceptedAt: decidedAt }
          : { ...claim, status: "declined", staffNote: note, decidedAt },
      ),
    );
  }
  if (claim.status !== "accepted" && claim.status !== "countered")
    throw safetyError(409, "studio_claim_not_decidable");
  return toAdminClaimDto(
    replaceClaim({
      ...claim,
      status: decision === "uphold" ? "upheld" : "rejected",
      staffNote: note,
      decidedAt,
    }),
  );
}

export function demoTrackReportsPage(): StudioReviewPage<StudioReviewTrackReportView> {
  return { items: [...state.trackReports], nextCursor: null };
}

export function demoDismissTrackReport(reportId: string): void {
  state.trackReports = state.trackReports.filter(
    (report) => report.reportId !== reportId,
  );
}

export function demoAdminTrack(trackId: string): StudioAdminTrackDTO {
  const { track, release } = requireTrackRef(trackId);
  return {
    id: track.id,
    releaseId: release.id,
    position: track.position,
    title: track.title,
    durationSeconds: track.durationSeconds,
    hasAudio: track.hasAudio,
    isExplicit: track.isExplicit || state.lockedExplicit.has(track.id),
    isExplicitLocked: state.lockedExplicit.has(track.id),
    contentWarnings: demoEffectiveWarnings(track.id),
    artistContentWarnings: contentWarningsOf(
      state.artistWarnings.get(track.id),
    ),
    staffContentWarnings: contentWarningsOf(state.staffWarnings.get(track.id)),
    isWithheld: demoWithheldTrackIds().has(track.id),
    release: { ...release, takenDownAt: null },
  };
}

export function demoMarkExplicit(
  trackId: string,
  reportId?: string,
): StudioAdminTrackDTO {
  requireTrackRef(trackId);
  state.lockedExplicit.add(trackId);
  if (reportId) demoDismissTrackReport(reportId);
  return demoAdminTrack(trackId);
}

export function demoAddWarnings(
  trackId: string,
  warnings: readonly StudioContentWarningId[],
  reportId?: string,
): StudioAdminTrackDTO {
  requireTrackRef(trackId);
  state.staffWarnings.set(
    trackId,
    contentWarningsOf([
      ...(state.staffWarnings.get(trackId) ?? []),
      ...warnings,
    ]),
  );
  if (reportId) demoDismissTrackReport(reportId);
  return demoAdminTrack(trackId);
}

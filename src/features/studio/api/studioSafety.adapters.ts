import type { ModReportDTO } from "../../admin/api/moderation.api";
import { REASON_LABEL_KEYS, type ReasonCode } from "../../safety/reportReasons";
import {
  studioArtistPath,
  studioReleasePath,
  studioTrackPath,
} from "../studioPaths";
import { formatTrackTime } from "./studio.adapters";
import {
  toReviewReleaseView,
  type StudioReviewReleaseView,
} from "./studioFlagReview.adapters";
import { contentWarningsOf, safeOriginalLinkOf } from "./studioSafetyFields";
import {
  STUDIO_CLAIM_LIVE_STATUSES,
  type StudioAdminClaimDTO,
  type StudioAdminTrackDTO,
  type StudioClaimantRefDTO,
  type StudioClaimantRole,
  type StudioClaimStatus,
  type StudioContentWarningId,
  type StudioMyClaimDTO,
} from "./studioSafety.types";

/** The fields every claim view shares. */
interface StudioClaimBaseView {
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
}

function claimBaseOf(
  dto: StudioMyClaimDTO | StudioAdminClaimDTO,
): StudioClaimBaseView {
  return {
    id: dto.id,
    status: dto.status,
    claimantRole: dto.claimantRole,
    originalWork: dto.originalWork,
    originalLink: safeOriginalLinkOf(dto.originalLink),
    details: dto.details,
    counterNote: dto.counterNote,
    claimantReply: dto.claimantReply,
    staffNote: dto.staffNote,
    createdAt: dto.createdAt,
    acceptedAt: dto.acceptedAt,
    counteredAt: dto.counteredAt,
    repliedAt: dto.repliedAt,
    decidedAt: dto.decidedAt,
  };
}

/** The claimant's view: their claim, the artist's counter-notice and our
 *  team's note. */
export interface StudioMyClaimView extends StudioClaimBaseView {
  /** Countered and not replied to yet. */
  canReply: boolean;
  /** Submitted, accepted or countered. */
  canWithdraw: boolean;
  track: {
    /** Null on a severed claim. */
    id: string | null;
    title: string;
    href: string | null;
    releaseId: string | null;
    releaseTitle: string | null;
    releaseHref: string | null;
    artistName: string;
    artistHref: string | null;
  };
}

export function toMyClaimView(dto: StudioMyClaimDTO): StudioMyClaimView {
  return {
    ...claimBaseOf(dto),
    canReply:
      dto.canReply && dto.status === "countered" && dto.claimantReply === null,
    canWithdraw:
      dto.canWithdraw && STUDIO_CLAIM_LIVE_STATUSES.includes(dto.status),
    track: {
      id: dto.track.id,
      title: dto.track.title,
      href: dto.track.id === null ? null : studioTrackPath(dto.track.id),
      releaseId: dto.track.release.id,
      releaseTitle: dto.track.release.title,
      releaseHref:
        dto.track.release.id === null
          ? null
          : studioReleasePath(dto.track.release.id),
      artistName: dto.track.artistName,
      artistHref:
        dto.track.artist === null
          ? null
          : studioArtistPath(dto.track.artist.id),
    },
  };
}

/** The staff Claims tab card. Staff see who filed (contract decision). */
export interface StudioAdminClaimView extends StudioClaimBaseView {
  claimant: StudioClaimantRefDTO;
  track: {
    id: string;
    title: string;
    position: number;
    isWithheld: boolean;
    href: string;
  };
  release: StudioReviewReleaseView;
}

export function toAdminClaimView(
  dto: StudioAdminClaimDTO,
): StudioAdminClaimView {
  return {
    ...claimBaseOf(dto),
    claimant: {
      id: dto.claimant.id,
      slug: dto.claimant.slug,
      displayName: dto.claimant.displayName,
      avatarUrl: dto.claimant.avatarUrl,
    },
    track: {
      id: dto.track.id,
      title: dto.track.title,
      position: dto.track.position,
      isWithheld: dto.track.isWithheld,
      href: studioTrackPath(dto.track.id),
    },
    release: toReviewReleaseView(dto.release),
  };
}

/** The staff read of one track, for a track report card. */
export interface StudioAdminTrackView {
  id: string;
  releaseId: string;
  position: number;
  title: string;
  durationLabel: string | null;
  hasAudio: boolean;
  isExplicit: boolean;
  isExplicitLocked: boolean;
  contentWarnings: StudioContentWarningId[];
  artistContentWarnings: StudioContentWarningId[];
  staffContentWarnings: StudioContentWarningId[];
  isWithheld: boolean;
  href: string;
  release: StudioReviewReleaseView;
}

export function toAdminTrackView(
  dto: StudioAdminTrackDTO,
): StudioAdminTrackView {
  return {
    id: dto.id,
    releaseId: dto.releaseId,
    position: dto.position,
    title: dto.title,
    durationLabel: formatTrackTime(dto.durationSeconds),
    hasAudio: dto.hasAudio,
    isExplicit: dto.isExplicit,
    isExplicitLocked: dto.isExplicitLocked,
    contentWarnings: contentWarningsOf(dto.contentWarnings),
    artistContentWarnings: contentWarningsOf(dto.artistContentWarnings),
    staffContentWarnings: contentWarningsOf(dto.staffContentWarnings),
    isWithheld: dto.isWithheld,
    href: studioTrackPath(dto.id),
    release: toReviewReleaseView(dto.release),
  };
}

/** One open `studio_track` report from the shared moderation queue. */
export interface StudioReviewTrackReportView {
  reportId: string;
  trackId: string;
  reasonCode: ReasonCode;
  reasonLabelKey: string;
  createdAt: string;
}

export function toReviewTrackReportView(
  dto: ModReportDTO,
): StudioReviewTrackReportView {
  return {
    reportId: dto.id,
    trackId: dto.subjectId,
    reasonCode: dto.reasonCode,
    reasonLabelKey: REASON_LABEL_KEYS[dto.reasonCode],
    createdAt: dto.createdAt,
  };
}

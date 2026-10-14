import type { ImageSlotTint } from "../../../shared/components/ui";
import { gatheringPath } from "../../gatherings/gatheringPaths";
import {
  STUDIO_CREDIT_ROLE_LABEL_KEY,
  STUDIO_CREDIT_STATUS_LABEL_KEY,
} from "../studioDiscoveryLabels";
import {
  studioReleasePath,
  studioScenePath,
  studioTrackPath,
} from "../studioPaths";
import {
  isStudioCreditRole,
  isStudioMood,
  orderedCreditRoles,
  tintForId,
  toArtistRefView,
  toPersonaRefView,
  toReleaseCardView,
  type StudioArtistRefView,
  type StudioPersonaRefView,
  type StudioReleaseCardView,
} from "./studio.adapters";
import {
  STUDIO_PERSONA_CREDIT_STATUSES,
  type StudioAppearsOnCardDTO,
  type StudioCreditInboxDTO,
  type StudioCreditInboxRowDTO,
  type StudioCreditRole,
  type StudioCuratedPickDTO,
  type StudioCurationDTO,
  type StudioMood,
  type StudioMoodsDTO,
  type StudioPersonaCreditOwnerRowDTO,
  type StudioPersonaCreditStatus,
  type StudioSceneCardDTO,
  type StudioSceneDTO,
  type StudioSceneEventDTO,
} from "./studio.types";

// View models for the discovery surfaces that no v1 or v2 shape carries:
// curation, scenes, the credit editor and inbox, and Appears on. Live and
// demo both reach the pages through these functions.

const KNOWN_STATUSES: ReadonlySet<string> = new Set(
  STUDIO_PERSONA_CREDIT_STATUSES,
);

function isCreditStatus(value: string): value is StudioPersonaCreditStatus {
  return KNOWN_STATUSES.has(value);
}

/** Trimmed text, or null when nothing is left. */
function textOrNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export interface StudioCuratedPickView extends StudioReleaseCardView {
  /** The staff note, written in one language and shown as written. */
  note: string | null;
}

export interface StudioCurationView {
  featured: StudioCuratedPickView | null;
  staffPicks: StudioCuratedPickView[];
  newThisWeek: StudioCuratedPickView[];
}

export function toCuratedPickView(
  dto: StudioCuratedPickDTO,
): StudioCuratedPickView {
  return { ...toReleaseCardView(dto), note: textOrNull(dto.note) };
}

export function toCurationView(dto: StudioCurationDTO): StudioCurationView {
  return {
    featured: dto.featured ? toCuratedPickView(dto.featured) : null,
    staffPicks: dto.staffPicks.map(toCuratedPickView),
    newThisWeek: dto.newThisWeek.map(toCuratedPickView),
  };
}

/** The moods the server lists, in its order; a slug this client cannot name
 *  is dropped so every chip has a label. */
export function toMoodList(dto: StudioMoodsDTO): StudioMood[] {
  return dto.moods.filter(isStudioMood);
}

export interface StudioSceneCardView {
  id: string;
  slug: string;
  name: string;
  city: string;
  coverUrl: string | null;
  tint: ImageSlotTint;
  href: string;
}

export function toSceneCardView(dto: StudioSceneCardDTO): StudioSceneCardView {
  return {
    id: dto.id,
    slug: dto.slug,
    name: dto.name,
    city: dto.city,
    coverUrl: dto.coverUrl,
    tint: tintForId(dto.id),
    href: studioScenePath(dto.slug),
  };
}

export interface StudioSceneEventView {
  slug: string;
  title: string;
  startAt: string;
  endAt: string | null;
  timezone: string;
  isOnline: boolean;
  coverImageUrl: string | null;
  /** The venue, else the neighbourhood, else null. */
  placeName: string | null;
  href: string;
}

export function toSceneEventView(
  dto: StudioSceneEventDTO,
): StudioSceneEventView {
  return {
    slug: dto.slug,
    title: dto.title,
    startAt: dto.startAt,
    endAt: dto.endAt,
    timezone: dto.timezone,
    isOnline: dto.isOnline,
    coverImageUrl: dto.coverImageUrl,
    placeName: textOrNull(dto.venue) ?? textOrNull(dto.neighbourhood),
    href: gatheringPath(dto.slug),
  };
}

export interface StudioSceneView extends StudioSceneCardView {
  blurb: string | null;
  artists: StudioArtistRefView[];
  upcomingEvents: StudioSceneEventView[];
}

export function toSceneView(dto: StudioSceneDTO): StudioSceneView {
  return {
    ...toSceneCardView(dto),
    blurb: textOrNull(dto.blurb),
    artists: dto.artists.map(toArtistRefView),
    upcomingEvents: dto.upcomingEvents.map(toSceneEventView),
  };
}

export interface StudioPersonaCreditOwnerRowView {
  id: string;
  persona: StudioPersonaRefView;
  role: StudioCreditRole;
  roleLabelKey: string;
  status: StudioPersonaCreditStatus;
  statusLabelKey: string;
  /** False once the persona stops being public: the credit stays hidden on
   *  every public read and the row stays removable. */
  isPersonaPublic: boolean;
  createdAt: string;
}

export function toPersonaCreditOwnerRows(
  dtos: StudioPersonaCreditOwnerRowDTO[],
): StudioPersonaCreditOwnerRowView[] {
  return dtos.flatMap((dto) =>
    isStudioCreditRole(dto.role) && isCreditStatus(dto.status)
      ? [
          {
            id: dto.id,
            persona: toPersonaRefView(dto.persona),
            role: dto.role,
            roleLabelKey: STUDIO_CREDIT_ROLE_LABEL_KEY[dto.role],
            status: dto.status,
            statusLabelKey: STUDIO_CREDIT_STATUS_LABEL_KEY[dto.status],
            isPersonaPublic: dto.isPersonaPublic,
            createdAt: dto.createdAt,
          },
        ]
      : [],
  );
}

export interface StudioCreditInboxRowView {
  id: string;
  role: StudioCreditRole;
  roleLabelKey: string;
  status: "pending" | "accepted";
  /** The release's persona. The member behind it never reaches the client. */
  requestingPersona: StudioPersonaRefView;
  /** The viewer's own persona. */
  creditedPersona: StudioPersonaRefView;
  track: { id: string; title: string; href: string };
  release: {
    id: string;
    title: string;
    coverUrl: string | null;
    tint: ImageSlotTint;
    href: string;
  };
  createdAt: string;
  respondedAt: string | null;
}

export interface StudioCreditInboxView {
  requests: StudioCreditInboxRowView[];
  accepted: StudioCreditInboxRowView[];
}

export function toCreditInboxRowView(
  dto: StudioCreditInboxRowDTO,
): StudioCreditInboxRowView | null {
  if (!isStudioCreditRole(dto.role)) return null;
  return {
    id: dto.id,
    role: dto.role,
    roleLabelKey: STUDIO_CREDIT_ROLE_LABEL_KEY[dto.role],
    status: dto.status,
    requestingPersona: toPersonaRefView(dto.requestingPersona),
    creditedPersona: toPersonaRefView(dto.creditedPersona),
    track: {
      id: dto.track.id,
      title: dto.track.title,
      href: studioTrackPath(dto.track.id),
    },
    release: {
      id: dto.release.id,
      title: dto.release.title,
      coverUrl: dto.release.coverUrl,
      tint: tintForId(dto.release.id),
      href: studioReleasePath(dto.release.id),
    },
    createdAt: dto.createdAt,
    respondedAt: dto.respondedAt,
  };
}

function inboxRows(
  dtos: StudioCreditInboxRowDTO[],
  status: StudioCreditInboxRowDTO["status"],
): StudioCreditInboxRowView[] {
  return dtos.flatMap((dto) => {
    const row = dto.status === status ? toCreditInboxRowView(dto) : null;
    return row ? [row] : [];
  });
}

export function toCreditInboxView(
  dto: StudioCreditInboxDTO,
): StudioCreditInboxView {
  return {
    requests: inboxRows(dto.requests, "pending"),
    accepted: inboxRows(dto.accepted, "accepted"),
  };
}

export interface StudioAppearsOnCardView extends StudioReleaseCardView {
  roles: StudioCreditRole[];
  roleLabelKeys: string[];
}

export function toAppearsOnCardView(
  dto: StudioAppearsOnCardDTO,
): StudioAppearsOnCardView {
  const roles = orderedCreditRoles(dto.roles);
  return {
    ...toReleaseCardView(dto),
    roles,
    roleLabelKeys: roles.map((role) => STUDIO_CREDIT_ROLE_LABEL_KEY[role]),
  };
}

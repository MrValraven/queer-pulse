import { personaPath } from "../../../app/routeMap";
import type { ImageSlotTint } from "../../../shared/components/ui";
import { initialsFromName } from "../../../shared/lib/initials";
import { STUDIO_KIND_LABEL_KEY, tintForId } from "./studio.adapters";
import {
  STUDIO_LANDING_LIMITS,
  STUDIO_STATS_THRESHOLD,
  isStudioArtistPersonaKind,
} from "./studio.types";
import type {
  StudioLandingArtistCardDTO,
  StudioLandingDTO,
  StudioLandingNextEventDTO,
  StudioLandingPersonaDTO,
  StudioLandingPhotoDTO,
  StudioLandingPreviewCardDTO,
} from "./studioLanding.types";

export interface StudioLandingPersonaView {
  name: string;
  handle: string;
  /** Null for a kind this build does not know: no kind line. */
  kindLabelKey: string | null;
  avatarUrl: string | null;
  initials: string;
  tint: ImageSlotTint;
  /** Null without a handle: the persona has no page to open. */
  personaHref: string | null;
}

export interface StudioLandingNextEventView {
  slug: string;
  title: string;
  startAt: Date;
  timezone: string;
  area: string | null;
  isOnline: boolean;
  artist: StudioLandingPersonaView;
}

export interface StudioLandingPreviewView {
  id: string;
  trackTitle: string;
  durationSeconds: number;
  coverUrl: string | null;
  coverTint: ImageSlotTint;
  artist: StudioLandingPersonaView;
}

export interface StudioLandingArtistCardView {
  id: string;
  artist: StudioLandingPersonaView;
  quote: string | null;
  isFoundingArtist: boolean;
}

export interface StudioLandingPhotoView {
  url: string;
  altText: { en: string; pt: string };
  credit: string | null;
}

export interface StudioLandingView {
  counts: {
    artists: number | null;
    releases: number | null;
    eventsThisMonth: number | null;
  };
  /** The proof strip shows only with an artist count. */
  isProofShown: boolean;
  nextEvent: StudioLandingNextEventView | null;
  /** At most 5. */
  previews: StudioLandingPreviewView[];
  /** At most 6. */
  artists: StudioLandingArtistCardView[];
  /** "Meet the artists" shows from 2 cards. */
  isArtistsShown: boolean;
  photos: {
    hero: StudioLandingPhotoView | null;
    manifesto: StudioLandingPhotoView | null;
  };
}

/** A count below the floor, or one that is not a whole number, reads null:
 *  the landing never prints a small number. */
function publicCountOf(count: number | null | undefined): number | null {
  if (typeof count !== "number" || !Number.isInteger(count)) return null;
  return count >= STUDIO_STATS_THRESHOLD ? count : null;
}

function toPersonaView(dto: StudioLandingPersonaDTO): StudioLandingPersonaView {
  const handle = (dto.handle ?? "").trim();
  return {
    name: dto.name,
    handle,
    kindLabelKey: isStudioArtistPersonaKind(dto.kind)
      ? STUDIO_KIND_LABEL_KEY[dto.kind]
      : null,
    avatarUrl: dto.avatarUrl || null,
    initials: initialsFromName(dto.name, "?"),
    tint: tintForId(handle || dto.name),
    personaHref: handle ? personaPath(handle) : null,
  };
}

function toNextEventView(
  dto: StudioLandingNextEventDTO | null,
): StudioLandingNextEventView | null {
  if (!dto) return null;
  const startAt = new Date(dto.startAt);
  if (Number.isNaN(startAt.getTime())) return null;
  return {
    slug: dto.slug,
    title: dto.title,
    startAt,
    timezone: dto.timezone,
    area: dto.area,
    isOnline: dto.isOnline,
    artist: toPersonaView(dto.artist),
  };
}

function toPreviewView(
  dto: StudioLandingPreviewCardDTO,
): StudioLandingPreviewView {
  return {
    id: dto.id,
    trackTitle: dto.trackTitle,
    durationSeconds: dto.durationSeconds,
    coverUrl: dto.coverUrl || null,
    coverTint: tintForId(dto.id),
    artist: toPersonaView(dto.artist),
  };
}

function toArtistCardView(
  dto: StudioLandingArtistCardDTO,
): StudioLandingArtistCardView {
  return {
    id: dto.id,
    artist: toPersonaView(dto.artist),
    quote: dto.quote?.trim() ? dto.quote : null,
    isFoundingArtist: dto.isFoundingArtist === true,
  };
}

function toPhotoView(
  dto: StudioLandingPhotoDTO | null | undefined,
): StudioLandingPhotoView | null {
  if (!dto?.url) return null;
  return {
    url: dto.url,
    altText: { en: dto.altText?.en ?? "", pt: dto.altText?.pt ?? "" },
    credit: dto.credit?.trim() ? dto.credit : null,
  };
}

export function toStudioLandingView(dto: StudioLandingDTO): StudioLandingView {
  const counts = {
    artists: publicCountOf(dto.counts.artists),
    releases: publicCountOf(dto.counts.releases),
    eventsThisMonth: publicCountOf(dto.counts.eventsThisMonth),
  };
  const artists = (dto.artists ?? [])
    .slice(0, STUDIO_LANDING_LIMITS.artistCardsMax)
    .map(toArtistCardView);
  return {
    counts,
    isProofShown: counts.artists !== null,
    nextEvent: toNextEventView(dto.nextEvent),
    previews: (dto.previews ?? [])
      .slice(0, STUDIO_LANDING_LIMITS.previewsShown)
      .map(toPreviewView),
    artists,
    isArtistsShown: artists.length >= STUDIO_LANDING_LIMITS.artistCardsShownMin,
    photos: {
      hero: toPhotoView(dto.photos?.hero),
      manifesto: toPhotoView(dto.photos?.manifesto),
    },
  };
}

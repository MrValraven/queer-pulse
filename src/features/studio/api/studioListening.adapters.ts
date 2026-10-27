// Studio dashboard upgrade, Part 2: the listener's view models. This file
// holds the one identity mapper (contract 5.1): the supporter picker
// preview, the listener's "Shown as" and the artist's Top supporters card
// all render through toSupporterIdentityView, so each shows the same name,
// photo and link.
import { personaPath } from "../../../app/routeMap";
import type { ImageSlotTint } from "../../../shared/components/ui";
import { initialsFromName } from "../../../shared/lib/initials";
import {
  tintForId,
  toArtistRefView,
  toPlaylistPersonView,
  toSearchTrackView,
  toSupportLinkViews,
  type StudioArtistRefView,
  type StudioExternalLinkView,
  type StudioSearchTrackView,
} from "./studio.adapters";
import type { StudioPageDTO } from "./studio.types";
import { parsedDate, wholeCountOf } from "./studioDashboard.adapters";
import {
  STUDIO_LISTENING_RANGES,
  STUDIO_LISTENING_TOP_MAX,
  type StudioListenDTO,
  type StudioListeningRange,
  type StudioListeningSummaryDTO,
  type StudioListensPageDTO,
  type StudioSupporterIdentityDTO,
  type StudioSupporterStateDTO,
  type StudioSupportingResponseDTO,
} from "./studioListening.types";

export interface StudioSupporterIdentityView {
  kind: "account" | "persona";
  /** "account", or the persona id: a stable key and the picker's option id. */
  key: string;
  name: string;
  avatarUrl: string | null;
  initials: string;
  tint: ImageSlotTint;
  /** The member's profile or the persona's page; null renders without a link. */
  href: string | null;
}

export interface StudioListeningSummaryView {
  range: StudioListeningRange;
  totalListens: number;
  listeningDays: number;
  topArtists: { artist: StudioArtistRefView; listens: number }[];
  topTracks: { track: StudioSearchTrackView; listens: number }[];
  /** No listens in the range, and nothing to rank. */
  isEmpty: boolean;
}

export interface StudioListenView {
  id: string;
  playedAt: Date;
  track: StudioSearchTrackView | null;
}

export interface StudioSupportingView {
  artist: StudioArtistRefView;
  since: Date;
  shownAs: StudioSupporterIdentityView;
  supportLinks: StudioExternalLinkView[];
  isFollowing: boolean;
}

export interface StudioSupporterOptionView {
  shownAsSubprofileId: string | null;
  identity: StudioSupporterIdentityView;
}

export interface StudioSupporterStateView {
  isSupporting: boolean;
  shownAsSubprofileId: string | null;
  shownAs: StudioSupporterIdentityView | null;
  since: Date | null;
  options: StudioSupporterOptionView[];
}

export const SUPPORTER_ACCOUNT_KEY = "account";

function isListeningRange(range: string): range is StudioListeningRange {
  return (STUDIO_LISTENING_RANGES as readonly string[]).includes(range);
}

/** Null for an identity kind this build does not know. The account reads
 *  like the playlist people (trimmed name, initials, tint, profile link);
 *  a persona links to its page only while it is listenable and has a
 *  handle. */
export function toSupporterIdentityView(
  dto: StudioSupporterIdentityDTO,
): StudioSupporterIdentityView | null {
  switch (dto.kind) {
    case "account": {
      const person = toPlaylistPersonView(dto.member);
      return {
        kind: "account",
        key: SUPPORTER_ACCOUNT_KEY,
        name: person.name,
        avatarUrl: person.avatarUrl,
        initials: person.initials,
        tint: person.tint,
        href: person.href,
      };
    }
    case "persona": {
      const { persona } = dto;
      const name = persona.name.trim();
      return {
        kind: "persona",
        key: persona.id,
        name,
        avatarUrl: persona.avatarUrl,
        initials: initialsFromName(name, "QP"),
        tint: tintForId(persona.id),
        href:
          persona.isLinkable && persona.handle
            ? personaPath(persona.handle)
            : null,
      };
    }
    default:
      return null;
  }
}

/** The listener's own counts stay exact (no floor), read as whole numbers
 *  from 0. A range this build does not know reads as the one asked for. */
export function toListeningSummaryView(
  dto: StudioListeningSummaryDTO,
  requestedRange: StudioListeningRange,
): StudioListeningSummaryView {
  const totalListens = wholeCountOf(dto.totalListens);
  const topArtists = dto.topArtists
    .slice(0, STUDIO_LISTENING_TOP_MAX)
    .map((row) => ({
      artist: toArtistRefView(row.artist),
      listens: wholeCountOf(row.listens),
    }));
  const topTracks = dto.topTracks
    .slice(0, STUDIO_LISTENING_TOP_MAX)
    .map((row) => ({
      track: toSearchTrackView(row.track),
      listens: wholeCountOf(row.listens),
    }));
  return {
    range: isListeningRange(dto.range) ? dto.range : requestedRange,
    totalListens,
    listeningDays: wholeCountOf(dto.listeningDays),
    topArtists,
    topTracks,
    isEmpty:
      totalListens === 0 && topArtists.length === 0 && topTracks.length === 0,
  };
}

/** The contract page as the Studio page shape the cursor hooks read. A
 *  row whose time cannot be read is dropped. */
export function listensPageOf(
  dto: StudioListensPageDTO,
): StudioPageDTO<StudioListenDTO> {
  return {
    items: dto.items.filter((item) => parsedDate(item.playedAt) !== null),
    pageInfo: {
      nextCursor: dto.nextCursor,
      hasMore: dto.nextCursor !== null,
    },
  };
}

/** A null track is a row the listener cannot play now, shown as
 *  unavailable. Rows reach here through listensPageOf, so the time reads. */
export function toListenView(dto: StudioListenDTO): StudioListenView {
  return {
    id: dto.id,
    playedAt: parsedDate(dto.playedAt) ?? new Date(0),
    track: dto.track ? toSearchTrackView(dto.track) : null,
  };
}

/** Newest first, as sent. Support links follow the artist page's rule;
 *  a row whose identity or start date cannot be read is dropped. */
export function toSupportingViews(
  dto: StudioSupportingResponseDTO,
): StudioSupportingView[] {
  return dto.items.flatMap((item) => {
    const shownAs = toSupporterIdentityView(item.shownAs);
    const since = parsedDate(item.since);
    if (!shownAs || !since) return [];
    return [
      {
        artist: toArtistRefView(item.artist),
        since,
        shownAs,
        supportLinks: toSupportLinkViews(item.supportLinks),
        isFollowing: item.isFollowing,
      },
    ];
  });
}

/** Options keep the server order ("Your account" first); an option whose
 *  identity cannot be read is dropped. */
export function toSupporterStateView(
  dto: StudioSupporterStateDTO,
): StudioSupporterStateView {
  return {
    isSupporting: dto.isSupporting,
    shownAsSubprofileId: dto.shownAsSubprofileId,
    shownAs: dto.shownAs ? toSupporterIdentityView(dto.shownAs) : null,
    since: dto.since ? parsedDate(dto.since) : null,
    options: dto.options.flatMap((option) => {
      const identity = toSupporterIdentityView(option.identity);
      return identity
        ? [{ shownAsSubprofileId: option.shownAsSubprofileId, identity }]
        : [];
    }),
  };
}

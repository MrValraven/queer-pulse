import type { MemberSelectPerson } from "../../../../shared/components/ui";
import { foldForSearch } from "../../../connect/connectionsFilter";
import { musicEventManagePath } from "../musicEventPaths";
import type {
  AdminMusicEventLineupCountsDTO,
  AdminMusicEventListItemDTO,
  StudioArtistCandidateDTO,
} from "./musicEvents.types";

/** One row of the music events list, ready to render. */
export interface MusicEventRowView {
  slug: string;
  title: string;
  startAt: Date;
  /** The venue name, else the neighbourhood, else null. */
  venueLabel: string | null;
  /** The catalog format key; run it through `formatLabel` to show it. */
  formatKey: string | null;
  coverImageUrl: string | null;
  lineup: AdminMusicEventLineupCountsDTO;
  pendingInviteRequestCount: number;
  isCancelled: boolean;
  managePath: string;
}

/**
 * A Studio artist as the lineup picker lists them. `detail` holds the names
 * of their artist personas joined with ", ", or null when the server sent
 * none. Written as an `Omit` so it stays one type whether or not
 * `MemberSelectPerson` declares its own optional `detail`.
 */
export type StudioArtistPerson = Omit<MemberSelectPerson, "detail"> & {
  detail: string | null;
};

export function toMusicEventRow(
  dto: AdminMusicEventListItemDTO,
): MusicEventRowView {
  return {
    slug: dto.slug,
    title: dto.title,
    startAt: new Date(dto.startAt),
    venueLabel: dto.venue || dto.neighbourhood || null,
    formatKey: dto.eventType ?? null,
    coverImageUrl: dto.coverImageUrl ?? null,
    lineup: { ...dto.lineupCounts },
    pendingInviteRequestCount: dto.pendingInviteRequestCount,
    isCancelled: dto.status === "cancelled",
    managePath: musicEventManagePath(dto.slug),
  };
}

/**
 * Whether a candidate matches an already folded term, over the fields the
 * server matches: name, slug, persona name and handle. The demo search uses
 * it, and so does the live search while the next answer is on its way.
 */
export function matchesStudioArtist(
  candidate: StudioArtistCandidateDTO,
  foldedTerm: string,
): boolean {
  const haystack = [
    `${candidate.firstName} ${candidate.lastName}`,
    candidate.slug,
    ...candidate.artistPersonas.flatMap((persona) => [
      persona.displayName,
      persona.handle,
    ]),
  ].join(" ");
  return foldForSearch(haystack).includes(foldedTerm);
}

export function toStudioArtistPerson(
  dto: StudioArtistCandidateDTO,
): StudioArtistPerson {
  const personaNames = dto.artistPersonas
    .map((persona) => persona.displayName)
    .filter((displayName) => displayName.length > 0);
  return {
    slug: dto.slug,
    name: `${dto.firstName} ${dto.lastName}`.trim(),
    ...(dto.avatarUrl ? { avatarUrl: dto.avatarUrl } : {}),
    detail: personaNames.length > 0 ? personaNames.join(", ") : null,
  };
}

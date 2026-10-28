import type {
  StudioPlaylistCardView,
  StudioReleaseCardView,
} from "../studio/api/studio.adapters";
import { useStudioAccess } from "../studio/api/useStudioAccess";
import { useStudioArtist } from "../studio/api/useStudioArtist";
import {
  isStudioArtistPersonaKind,
  type StudioArtistPersonaKind,
} from "../studio/api/studio.types";
import { studioArtistPath } from "../studio/studioPaths";
import type { SubprofileKind, SubprofileSection } from "./api/subprofiles.api";

/** The persona section a Studio release shows in, for every Studio artist
 *  kind (spec 2). A kind added to STUDIO_FORMAT_BY_KIND fails to compile
 *  here until it has a section. */
const STUDIO_SECTION_BY_KIND: Record<
  StudioArtistPersonaKind,
  SubprofileSection
> = {
  musician: "discography",
  dj: "mixes",
  podcaster: "episodes",
  podcast_producer: "productions",
  poet: "poems",
  spoken_word: "pieces",
  drag: "shows",
  performer: "reel",
  dancer: "reel",
  voguer: "balls",
  burlesque: "acts",
};

/** The persona section a Studio release belongs in, by persona kind. */
export function studioSectionFor(
  kind: SubprofileKind,
): SubprofileSection | null {
  return isStudioArtistPersonaKind(kind) ? STUDIO_SECTION_BY_KIND[kind] : null;
}

export interface PersonaStudioContent {
  releases: StudioReleaseCardView[];
  playlists: StudioPlaylistCardView[];
}

const NO_STUDIO_CONTENT: PersonaStudioContent = { releases: [], playlists: [] };

/**
 * The persona's published Studio releases (in the server's order) and its
 * public playlists, for a viewer with a Studio grant, on the live page and
 * in the editor preview alike (Studio v2). Drafts and taken-down releases
 * never show: the artist read lists them apart, in ownerReleases, and this
 * reads the published list only. Nothing at all, and no request, for a
 * viewer without a grant or a persona of a kind that does not release in Studio.
 */
export function usePersonaStudio(persona: {
  id: string;
  kind: SubprofileKind;
}): PersonaStudioContent {
  const { hasAccess } = useStudioAccess();
  const isEnabled = hasAccess && studioSectionFor(persona.kind) !== null;
  const { artist } = useStudioArtist(persona.id, {
    isEnabled,
    isSilent: true,
  });
  if (!isEnabled || !artist) return NO_STUDIO_CONTENT;
  return { releases: artist.allReleases, playlists: artist.playlists };
}

/** The persona's Studio page link once its artist read has loaded, sharing
 *  the cached read of usePersonaStudio, for a viewer with a Studio grant;
 *  null otherwise. */
export function usePersonaStudioPagePath(persona: {
  id: string;
  kind: SubprofileKind;
}): string | null {
  const { hasAccess } = useStudioAccess();
  const isEnabled = hasAccess && studioSectionFor(persona.kind) !== null;
  const { artist } = useStudioArtist(persona.id, {
    isEnabled,
    isSilent: true,
  });
  if (!isEnabled || !artist) return null;
  return studioArtistPath(persona.id);
}

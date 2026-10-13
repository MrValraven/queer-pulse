import type {
  StudioPlaylistCardView,
  StudioReleaseCardView,
} from "../studio/api/studio.adapters";
import { useStudioAccess } from "../studio/api/useStudioAccess";
import { useStudioArtist } from "../studio/api/useStudioArtist";
import type { SubprofileKind } from "./api/subprofiles.api";

/** The persona section a Studio release belongs in, by persona kind. */
export function studioSectionFor(
  kind: SubprofileKind,
): "discography" | "mixes" | null {
  if (kind === "musician") return "discography";
  if (kind === "dj") return "mixes";
  return null;
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
 * viewer without a grant or a persona that is not a musician or DJ.
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

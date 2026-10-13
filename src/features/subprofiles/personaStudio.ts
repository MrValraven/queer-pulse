import type { StudioReleaseCardView } from "../studio/api/studio.adapters";
import { useStudioAccess } from "../studio/api/useStudioAccess";
import { useStudioArtist } from "../studio/api/useStudioArtist";
import type { SubprofileKind } from "./api/subprofiles.api";
import type { PersonaViewMode } from "./personaSkinRender";

/** The persona section a Studio release belongs in, by persona kind. */
export function studioSectionFor(
  kind: SubprofileKind,
): "discography" | "mixes" | null {
  if (kind === "musician") return "discography";
  if (kind === "dj") return "mixes";
  return null;
}

/** The persona's published Studio releases, for a viewer with a Studio grant
 *  on the live page. Empty (and no request) for everyone else. */
export function usePersonaStudioReleases(
  persona: { id: string; kind: SubprofileKind },
  mode: PersonaViewMode,
): StudioReleaseCardView[] {
  const { hasAccess } = useStudioAccess();
  const isEnabled =
    hasAccess && mode !== "preview" && studioSectionFor(persona.kind) !== null;
  const { artist } = useStudioArtist(persona.id, {
    isEnabled,
    isSilent: true,
  });
  if (!isEnabled || !artist) return [];
  return [...artist.releases, ...artist.singles];
}

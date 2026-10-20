import { useMemo } from "react";
import { getStudioWorks } from "./skins/studioWorks";
import { getTattooWorks } from "./skins/tattoo/tattooWorks";
import { useImageLightbox } from "./useImageLightbox";
import type {
  SubprofileItemView,
  SubprofileSectionView,
} from "./api/subprofiles.adapters";
import type { SubprofileKind } from "./api/subprofiles.api";

/** Which persona the lightbox serves. A tattoo artist's page builds its
 *  own plate list (`getTattooWorks`); every other kind uses the studio one. */
export interface StudioLightboxPersona {
  kind: SubprofileKind;
  featuredId: string | null;
}

/**
 * Owns the studio lightbox's open/closed state for `SubprofilePage`. `works`
 * is the flattened, stable index space every entry point resolves into (see
 * `getStudioWorks`): `SkinExtras`' `StudioChecklist` already enumerates this
 * exact array, so `openAt` takes its click index directly; a studio
 * `ItemTile` click carries the item instead, so `openItem` resolves it via
 * `works.indexOf(item)` — both land on the same picture. The open/move state
 * itself is the generic `useImageLightbox`, shared with the gallery lightbox.
 * A tattoo artist's page passes `persona`: its plates follow the page's
 * block order and skip items with no photo (see `getTattooWorks`).
 */
export function useStudioLightbox(
  sections: SubprofileSectionView[] | undefined,
  persona?: StudioLightboxPersona,
) {
  const isTattooArtist = persona?.kind === "tattoo_artist";
  const featuredId = persona?.featuredId ?? null;
  const works = useMemo<SubprofileItemView[]>(() => {
    if (!sections) return [];
    return isTattooArtist
      ? getTattooWorks(sections, featuredId)
      : getStudioWorks(sections);
  }, [sections, isTattooArtist, featuredId]);
  const lightbox = useImageLightbox(works);
  return { works, ...lightbox };
}

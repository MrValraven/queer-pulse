import { useMemo } from "react";
import { getStudioWorks } from "./skins/studioWorks";
import { useImageLightbox } from "./useImageLightbox";
import type {
  SubprofileItemView,
  SubprofileSectionView,
} from "./api/subprofiles.adapters";

/**
 * Owns the studio lightbox's open/closed state for `SubprofilePage`. `works`
 * is the flattened, stable index space every entry point resolves into (see
 * `getStudioWorks`): `SkinExtras`' `StudioChecklist` already enumerates this
 * exact array, so `openAt` takes its click index directly; a studio
 * `ItemTile` click carries the item instead, so `openItem` resolves it via
 * `works.indexOf(item)` — both land on the same picture. The open/move state
 * itself is the generic `useImageLightbox`, shared with the gallery lightbox.
 */
export function useStudioLightbox(
  sections: SubprofileSectionView[] | undefined,
) {
  const works = useMemo<SubprofileItemView[]>(
    () => (sections ? getStudioWorks(sections) : []),
    [sections],
  );
  const lightbox = useImageLightbox(works);
  return { works, ...lightbox };
}

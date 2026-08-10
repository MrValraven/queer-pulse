import { useMemo, useState } from "react";
import { getStudioWorks } from "./skins/studioWorks";
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
 * `works.indexOf(item)` — both land on the same picture.
 */
export function useStudioLightbox(sections: SubprofileSectionView[] | undefined) {
  const [index, setIndex] = useState<number | null>(null);

  const works = useMemo<SubprofileItemView[]>(
    () => (sections ? getStudioWorks(sections) : []),
    [sections],
  );

  function openAt(nextIndex: number) {
    if (nextIndex >= 0) setIndex(nextIndex);
  }

  function openItem(item: SubprofileItemView) {
    const nextIndex = works.indexOf(item);
    if (nextIndex >= 0) setIndex(nextIndex);
  }

  function close() {
    setIndex(null);
  }

  function move(delta: number) {
    setIndex((current) => {
      if (current === null || works.length === 0) return current;
      return (current + delta + works.length) % works.length;
    });
  }

  return { works, index, openAt, openItem, close, move };
}

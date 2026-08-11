import { useState } from "react";
import type { SubprofileItemView } from "./api/subprofiles.adapters";

/**
 * Open/close + wrap-around navigation state for an image lightbox over a flat,
 * stable `items` index space. Shared by the studio-work lightbox
 * (`useStudioLightbox`) and the universal gallery-photo lightbox on the persona
 * page — both index into a `SubprofileItemView[]` and differ only in which
 * items that is. `index === null` means closed.
 */
export function useImageLightbox(items: SubprofileItemView[]) {
  const [index, setIndex] = useState<number | null>(null);

  function openAt(nextIndex: number) {
    if (nextIndex >= 0 && nextIndex < items.length) setIndex(nextIndex);
  }

  function openItem(item: SubprofileItemView) {
    const nextIndex = items.indexOf(item);
    if (nextIndex >= 0) setIndex(nextIndex);
  }

  function close() {
    setIndex(null);
  }

  function move(delta: number) {
    setIndex((current) => {
      if (current === null || items.length === 0) return current;
      return (current + delta + items.length) % items.length;
    });
  }

  return { index, openAt, openItem, close, move };
}

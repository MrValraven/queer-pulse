import type {
  SubprofileItemView,
  SubprofileSectionView,
} from "../api/subprofiles.adapters";

/**
 * The persona's universal `gallery` photos, flattened into one stable array —
 * the index space the gallery lightbox opens into. Mirrors `getStudioWorks`
 * but for the caption-less `gallery` section, and applies the same
 * `.slice(0, 6)` cap `SubprofileSections` renders so the lightbox and the grid
 * stay in lockstep. A persona has at most one `gallery` section, but the
 * `flatMap` keeps this correct if that ever changes.
 */
export function getGalleryWorks(
  sections: SubprofileSectionView[],
): SubprofileItemView[] {
  return sections
    .filter((section) => section.section === "gallery")
    .flatMap((section) => section.items.slice(0, 6));
}

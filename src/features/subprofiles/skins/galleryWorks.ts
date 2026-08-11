import { flattenSectionItems } from "./flattenSectionItems";
import type {
  SubprofileItemView,
  SubprofileSectionView,
} from "../api/subprofiles.adapters";

/**
 * The persona's universal `gallery` photos, flattened into one stable array —
 * the index space the gallery lightbox opens into. Mirrors `getStudioWorks`
 * but for the caption-less `gallery` section, and applies the same
 * `.slice(0, 6)` cap `SubprofileSections` renders so the lightbox and the grid
 * stay in lockstep. Image-less items are filtered out FIRST (matching the grid),
 * so the lightbox never opens onto a blank cell and its indices align 1:1 with
 * the rendered photos. A persona has at most one `gallery` section, but the
 * `flatMap` keeps this correct if that ever changes.
 */
export function getGalleryWorks(
  sections: SubprofileSectionView[],
): SubprofileItemView[] {
  return flattenSectionItems(
    sections,
    (section) => section.section === "gallery",
    (items) => items.filter((item) => item.imageUrl).slice(0, 6),
  );
}

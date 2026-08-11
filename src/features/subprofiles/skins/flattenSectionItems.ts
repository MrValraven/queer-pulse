import type {
  SubprofileItemView,
  SubprofileSectionView,
} from "../api/subprofiles.adapters";

/**
 * Flatten the items of every section matching `predicate` (in section then
 * item order) into one stable array — the shared shape behind the lightbox
 * index spaces (`getStudioWorks`, `getGalleryWorks`). `mapItems` transforms
 * each matched section's items before they're flattened (e.g. the gallery's
 * image-only + 6-cap); it defaults to identity so a caller that wants every
 * item passes only a predicate.
 *
 * A plain data function (not a component) so it can share a module with the
 * skin-specific selectors without tripping `react-refresh/only-export-components`.
 */
export function flattenSectionItems(
  sections: SubprofileSectionView[],
  predicate: (section: SubprofileSectionView) => boolean,
  mapItems: (items: SubprofileItemView[]) => SubprofileItemView[] = (items) => items,
): SubprofileItemView[] {
  return sections.filter(predicate).flatMap((section) => mapItems(section.items));
}

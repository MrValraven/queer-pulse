import { VISUAL_SECTIONS } from "../subprofile-skins";
import { flattenSectionItems } from "./flattenSectionItems";
import type {
  SubprofileItemView,
  SubprofileSectionView,
} from "../api/subprofiles.adapters";

/**
 * The studio persona's full catalogue of work, flattened across every
 * visual section (in section then item order) into one stable array. This is
 * the canonical index space for the studio lightbox: `StudioChecklist`
 * (`StudioBlocks.tsx`) enumerates it to call `onOpenWork(index)`, and the
 * studio `ItemTile` (zoom-in click) + the page host's `StudioLightbox`
 * `items` prop MUST reuse this exact function so an index clicked from any
 * of the three entry points opens the same image.
 *
 * Kept in its own module (not colocated with the `StudioBlocks.tsx`
 * components) because it's a plain data function, not a component — mixing
 * the two in one file trips `react-refresh/only-export-components`.
 */
export function getStudioWorks(
  sections: SubprofileSectionView[],
): SubprofileItemView[] {
  return flattenSectionItems(sections, (section) =>
    VISUAL_SECTIONS.includes(section.section),
  );
}

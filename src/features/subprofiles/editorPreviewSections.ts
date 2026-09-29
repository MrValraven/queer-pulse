import type {
  SubprofileItemView,
  SubprofileSectionView,
  SubprofileView,
} from "./api/subprofiles.adapters";
import type { SubprofileEditorRow } from "./subprofileSectionEditorRows";
import type { SectionRowMap } from "./useEditorRowsState";

/**
 * Overlays the editor context's in-progress `sectionRows` onto a persona's
 * saved sections, so an add, edit, reorder, removal or feature toggle on any
 * content section (including gallery photos) shows in the live preview
 * before saving, the same way `EditorPreview` already overlays the
 * in-progress meta fields and the skin-block draft (design review M3).
 *
 * Reuses the saved section's metadata (`labelKey`/`icon`/`fields`) and only
 * swaps its `items`. A section absent from `sectionRows` falls back to the
 * saved items untouched, which should not happen in practice since every
 * allowed section is seeded once per persona (`useEditorRowsState.seedRows`).
 */
export function overlaySectionRows(
  subprofile: SubprofileView,
  sectionRows: SectionRowMap,
): { sections: SubprofileSectionView[]; featured: SubprofileItemView | null } {
  const sections = subprofile.sections.map((section) => {
    const rows = sectionRows[section.section];
    if (!rows) return section;
    return { ...section, items: rows.map(rowToItemView) };
  });
  return { sections, featured: findFeaturedItem(sections) };
}

/** Strip the client-only `_uid` off a working-list row, back to the
 *  persisted item shape the page renderer expects. */
function rowToItemView(row: SubprofileEditorRow): SubprofileItemView {
  const { _uid, ...item } = row;
  return item;
}

/** Find the single featured item across already-overlaid sections (mirrors
 *  `findFeatured` in `subprofiles.adapters.ts`, starting from view items
 *  already grouped by section, since the working rows are already
 *  view-shaped). `null` when nothing is featured. */
function findFeaturedItem(
  sections: SubprofileSectionView[],
): SubprofileItemView | null {
  for (const section of sections) {
    const featuredItem = section.items.find((item) => item.isFeatured);
    if (featuredItem) return featuredItem;
  }
  return null;
}

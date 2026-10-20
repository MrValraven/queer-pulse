import type {
  SubprofileItemView,
  SubprofileSectionView,
} from "../../api/subprofiles.adapters";
import type { SubprofileSection } from "../../api/subprofiles.api";

/** The tattoo sections whose photos the lightbox steps through, in the
 *  page's block order (`TATTOO_MAIN_BLOCKS`): flash, healed, scar work,
 *  cover-ups, wanna-dos, flash days, shop. The gallery has its own
 *  lightbox, and project sessions open none. */
export const TATTOO_LIGHTBOX_SECTIONS: readonly SubprofileSection[] = [
  "flash",
  "healed",
  "scar_work",
  "cover_ups",
  "wanna_dos",
  "flash_days",
  "shop",
];

/**
 * The tattoo page's lightbox plates: every item with a photo, section by
 * section in page order, then stored order inside a section. The starred
 * item is left out, as the page leaves it out of its block (it is the
 * spotlight). Items keep their identity, so a tile's `openItem(item)`
 * resolves by `indexOf`.
 */
export function getTattooWorks(
  sections: readonly SubprofileSectionView[],
  featuredId: string | null,
): SubprofileItemView[] {
  return TATTOO_LIGHTBOX_SECTIONS.flatMap((sectionKey) =>
    (
      sections.find((section) => section.section === sectionKey)?.items ?? []
    ).filter(
      (item) =>
        item.imageUrl !== "" && !item.isFeatured && item.id !== featuredId,
    ),
  );
}

import type { ListingDraft } from "./listBusiness.data";
import {
  emptyMenuDraft,
  type ListingMenuDraft,
  type ListingMenuSectionRow,
  type ListingMenuSubsectionRow,
} from "./listingMenu.data";

/** Run `next` on the draft's menu, starting from an empty menu when it has none. */
export function patchMenu(
  draft: ListingDraft,
  next: (menu: ListingMenuDraft) => ListingMenuDraft,
): ListingDraft {
  return { ...draft, menu: next(draft.menu ?? emptyMenuDraft()) };
}

/** Run `next` on the section with `sectionId`; every other section is untouched. */
export function patchSection(
  menu: ListingMenuDraft,
  sectionId: string,
  next: (section: ListingMenuSectionRow) => ListingMenuSectionRow,
): ListingMenuDraft {
  return {
    ...menu,
    sections: menu.sections.map((section) =>
      section.id === sectionId ? next(section) : section,
    ),
  };
}

/** Run `next` on one sub-section, found by its section id and its own id. */
export function patchSubsection(
  menu: ListingMenuDraft,
  sectionId: string,
  subsectionId: string,
  next: (subsection: ListingMenuSubsectionRow) => ListingMenuSubsectionRow,
): ListingMenuDraft {
  return patchSection(menu, sectionId, (section) => ({
    ...section,
    subsections: section.subsections.map((subsection) =>
      subsection.id === subsectionId ? next(subsection) : subsection,
    ),
  }));
}

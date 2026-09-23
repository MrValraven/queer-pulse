import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { ListingDraft } from "./listBusiness.data";
import {
  emptyMenuDraft,
  MAX_LISTING_MENU_ITEMS,
  MAX_LISTING_MENU_SECTIONS,
  menuItemCount,
  moveRowById,
  newMenuItemRow,
  newMenuSectionRow,
  type ListingMenuDietary,
  type ListingMenuDraft,
  type ListingMenuFile,
  type ListingMenuItemRow,
  type ListingMenuSectionRow,
  type ListingPricingMode,
} from "./listingMenu.data";

function patchMenu(
  draft: ListingDraft,
  next: (menu: ListingMenuDraft) => ListingMenuDraft,
): ListingDraft {
  return { ...draft, menu: next(draft.menu ?? emptyMenuDraft()) };
}

function patchSection(
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

/**
 * The menu's setters, beside each other like `useServiceSetters`. Sections
 * and items are addressed by their client-only ids, never by index. Adds are
 * no-ops at the section and item ceilings.
 */
export function useMenuSetters(
  setDraft: Dispatch<SetStateAction<ListingDraft>>,
) {
  const setPricingMode = useCallback(
    (pricingMode: ListingPricingMode) => {
      setDraft((draft) => ({ ...draft, pricingMode }));
    },
    [setDraft],
  );

  const addMenuSection = useCallback(() => {
    setDraft((draft) =>
      patchMenu(draft, (menu) =>
        menu.sections.length >= MAX_LISTING_MENU_SECTIONS ||
        menuItemCount(menu) >= MAX_LISTING_MENU_ITEMS
          ? menu
          : { ...menu, sections: [...menu.sections, newMenuSectionRow()] },
      ),
    );
  }, [setDraft]);

  const setMenuSectionTitle = useCallback(
    (sectionId: string, title: string) => {
      setDraft((draft) =>
        patchMenu(draft, (menu) =>
          patchSection(menu, sectionId, (section) => ({ ...section, title })),
        ),
      );
    },
    [setDraft],
  );

  const removeMenuSection = useCallback(
    (sectionId: string) => {
      setDraft((draft) =>
        patchMenu(draft, (menu) => ({
          ...menu,
          sections: menu.sections.filter((section) => section.id !== sectionId),
        })),
      );
    },
    [setDraft],
  );

  const moveMenuSection = useCallback(
    (sectionId: string, direction: -1 | 1) => {
      setDraft((draft) =>
        patchMenu(draft, (menu) => ({
          ...menu,
          sections: moveRowById(menu.sections, sectionId, direction),
        })),
      );
    },
    [setDraft],
  );

  const addMenuItem = useCallback(
    (sectionId: string) => {
      setDraft((draft) =>
        patchMenu(draft, (menu) =>
          menuItemCount(menu) >= MAX_LISTING_MENU_ITEMS
            ? menu
            : patchSection(menu, sectionId, (section) => ({
                ...section,
                items: [...section.items, newMenuItemRow()],
              })),
        ),
      );
    },
    [setDraft],
  );

  const setMenuItemField = useCallback(
    (
      sectionId: string,
      itemId: string,
      patch: Partial<Omit<ListingMenuItemRow, "id" | "dietary">>,
    ) => {
      setDraft((draft) =>
        patchMenu(draft, (menu) =>
          patchSection(menu, sectionId, (section) => ({
            ...section,
            items: section.items.map((item) =>
              item.id === itemId ? { ...item, ...patch } : item,
            ),
          })),
        ),
      );
    },
    [setDraft],
  );

  const toggleMenuItemDietary = useCallback(
    (sectionId: string, itemId: string, label: ListingMenuDietary) => {
      setDraft((draft) =>
        patchMenu(draft, (menu) =>
          patchSection(menu, sectionId, (section) => ({
            ...section,
            items: section.items.map((item) => {
              if (item.id !== itemId) return item;
              const isOn = item.dietary.includes(label);
              return {
                ...item,
                dietary: isOn
                  ? item.dietary.filter((existing) => existing !== label)
                  : [...item.dietary, label],
              };
            }),
          })),
        ),
      );
    },
    [setDraft],
  );

  const removeMenuItem = useCallback(
    (sectionId: string, itemId: string) => {
      setDraft((draft) =>
        patchMenu(draft, (menu) =>
          patchSection(menu, sectionId, (section) => ({
            ...section,
            items: section.items.filter((item) => item.id !== itemId),
          })),
        ),
      );
    },
    [setDraft],
  );

  const moveMenuItem = useCallback(
    (sectionId: string, itemId: string, direction: -1 | 1) => {
      setDraft((draft) =>
        patchMenu(draft, (menu) =>
          patchSection(menu, sectionId, (section) => ({
            ...section,
            items: moveRowById(section.items, itemId, direction),
          })),
        ),
      );
    },
    [setDraft],
  );

  const setMenuFile = useCallback(
    (file: ListingMenuFile | null) => {
      setDraft((draft) => patchMenu(draft, (menu) => ({ ...menu, file })));
    },
    [setDraft],
  );

  const setMenuLink = useCallback(
    (link: string) => {
      setDraft((draft) => patchMenu(draft, (menu) => ({ ...menu, link })));
    },
    [setDraft],
  );

  return {
    setPricingMode,
    addMenuSection,
    setMenuSectionTitle,
    removeMenuSection,
    moveMenuSection,
    addMenuItem,
    setMenuItemField,
    toggleMenuItemDietary,
    removeMenuItem,
    moveMenuItem,
    setMenuFile,
    setMenuLink,
  };
}

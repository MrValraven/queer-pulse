import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { ListingDraft } from "./listBusiness.data";
import {
  MAX_LISTING_MENU_ITEMS,
  MAX_LISTING_MENU_SUBSECTIONS,
  menuItemCount,
  moveRowById,
  newMenuItemRow,
  newMenuSubsectionRow,
  type ListingMenuDietary,
  type ListingMenuItemRow,
} from "./listingMenu.data";
import { patchMenu, patchSection, patchSubsection } from "./menuSetterPatches";

/**
 * The setters for sub-sections (Red, White and Rosé under Wines) and the
 * items inside them, beside `useMenuSetters`. Everything is addressed by
 * client-only ids, and no setter takes an index. Adds are no-ops at the
 * sub-section and item ceilings; a new sub-section starts with one blank
 * item, so it counts against the item ceiling too.
 */
export function useMenuSubsectionSetters(
  setDraft: Dispatch<SetStateAction<ListingDraft>>,
) {
  const addMenuSubsection = useCallback(
    (sectionId: string) => {
      setDraft((draft) =>
        patchMenu(draft, (menu) =>
          menuItemCount(menu) >= MAX_LISTING_MENU_ITEMS
            ? menu
            : patchSection(menu, sectionId, (section) =>
                section.subsections.length >= MAX_LISTING_MENU_SUBSECTIONS
                  ? section
                  : {
                      ...section,
                      subsections: [
                        ...section.subsections,
                        newMenuSubsectionRow(),
                      ],
                    },
              ),
        ),
      );
    },
    [setDraft],
  );

  const setMenuSubsectionTitle = useCallback(
    (sectionId: string, subsectionId: string, title: string) => {
      setDraft((draft) =>
        patchMenu(draft, (menu) =>
          patchSubsection(menu, sectionId, subsectionId, (subsection) => ({
            ...subsection,
            title,
          })),
        ),
      );
    },
    [setDraft],
  );

  const removeMenuSubsection = useCallback(
    (sectionId: string, subsectionId: string) => {
      setDraft((draft) =>
        patchMenu(draft, (menu) =>
          patchSection(menu, sectionId, (section) => ({
            ...section,
            subsections: section.subsections.filter(
              (subsection) => subsection.id !== subsectionId,
            ),
          })),
        ),
      );
    },
    [setDraft],
  );

  const moveMenuSubsection = useCallback(
    (sectionId: string, subsectionId: string, direction: -1 | 1) => {
      setDraft((draft) =>
        patchMenu(draft, (menu) =>
          patchSection(menu, sectionId, (section) => ({
            ...section,
            subsections: moveRowById(
              section.subsections,
              subsectionId,
              direction,
            ),
          })),
        ),
      );
    },
    [setDraft],
  );

  const addSubsectionItem = useCallback(
    (sectionId: string, subsectionId: string) => {
      setDraft((draft) =>
        patchMenu(draft, (menu) =>
          menuItemCount(menu) >= MAX_LISTING_MENU_ITEMS
            ? menu
            : patchSubsection(menu, sectionId, subsectionId, (subsection) => ({
                ...subsection,
                items: [
                  ...subsection.items,
                  { ...newMenuItemRow(), priceGlass: "", priceBottle: "" },
                ],
              })),
        ),
      );
    },
    [setDraft],
  );

  const setSubsectionItemField = useCallback(
    (
      sectionId: string,
      subsectionId: string,
      itemId: string,
      patch: Partial<Omit<ListingMenuItemRow, "id" | "dietary">>,
    ) => {
      setDraft((draft) =>
        patchMenu(draft, (menu) =>
          patchSubsection(menu, sectionId, subsectionId, (subsection) => ({
            ...subsection,
            items: subsection.items.map((item) =>
              item.id === itemId ? { ...item, ...patch } : item,
            ),
          })),
        ),
      );
    },
    [setDraft],
  );

  const toggleSubsectionItemDietary = useCallback(
    (
      sectionId: string,
      subsectionId: string,
      itemId: string,
      label: ListingMenuDietary,
    ) => {
      setDraft((draft) =>
        patchMenu(draft, (menu) =>
          patchSubsection(menu, sectionId, subsectionId, (subsection) => ({
            ...subsection,
            items: subsection.items.map((item) => {
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

  const removeSubsectionItem = useCallback(
    (sectionId: string, subsectionId: string, itemId: string) => {
      setDraft((draft) =>
        patchMenu(draft, (menu) =>
          patchSubsection(menu, sectionId, subsectionId, (subsection) => ({
            ...subsection,
            items: subsection.items.filter((item) => item.id !== itemId),
          })),
        ),
      );
    },
    [setDraft],
  );

  const moveSubsectionItem = useCallback(
    (
      sectionId: string,
      subsectionId: string,
      itemId: string,
      direction: -1 | 1,
    ) => {
      setDraft((draft) =>
        patchMenu(draft, (menu) =>
          patchSubsection(menu, sectionId, subsectionId, (subsection) => ({
            ...subsection,
            items: moveRowById(subsection.items, itemId, direction),
          })),
        ),
      );
    },
    [setDraft],
  );

  return {
    addMenuSubsection,
    setMenuSubsectionTitle,
    removeMenuSubsection,
    moveMenuSubsection,
    addSubsectionItem,
    setSubsectionItemField,
    toggleSubsectionItemDietary,
    removeSubsectionItem,
    moveSubsectionItem,
  };
}

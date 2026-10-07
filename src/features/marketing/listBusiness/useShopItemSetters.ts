import {
  useCallback,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { ListingDraft } from "./listBusiness.data";
import { moveRowById } from "./listingMenu.data";
import {
  MAX_LISTING_SHOP_ITEMS,
  newShopItemRow,
  type ListingShopItemRow,
} from "./listingShop.data";

function patchShopItems(
  draft: ListingDraft,
  next: (rows: ListingShopItemRow[]) => ListingShopItemRow[],
): ListingDraft {
  return { ...draft, shopItems: next(draft.shopItems ?? []) };
}

function patchShopItem(
  draft: ListingDraft,
  id: string,
  next: (row: ListingShopItemRow) => ListingShopItemRow,
): ListingDraft {
  return patchShopItems(draft, (rows) =>
    rows.map((row) => (row.id === id ? next(row) : row)),
  );
}

/**
 * "In the shop" setters. Items are addressed by their id. A photo picked this
 * session keeps its blob preview here, out of the draft, the way the gallery's
 * `photoPreviews` does: the draft is the payload, and a blob URL must never
 * reach it.
 */
export function useShopItemSetters(
  setDraft: Dispatch<SetStateAction<ListingDraft>>,
) {
  const [shopPhotoPreviews, setShopPhotoPreviews] = useState<
    Record<string, string>
  >({});

  const addShopItem = useCallback(
    () =>
      setDraft((draft) =>
        patchShopItems(draft, (rows) =>
          rows.length >= MAX_LISTING_SHOP_ITEMS
            ? rows
            : [...rows, newShopItemRow()],
        ),
      ),
    [setDraft],
  );
  const setShopItemField = useCallback(
    (
      id: string,
      patch: Partial<Pick<ListingShopItemRow, "name" | "price" | "link">>,
    ) =>
      setDraft((draft) =>
        patchShopItem(draft, id, (row) => ({ ...row, ...patch })),
      ),
    [setDraft],
  );
  const removeShopItem = useCallback(
    (id: string) => {
      setDraft((draft) =>
        patchShopItems(draft, (rows) => rows.filter((row) => row.id !== id)),
      );
      setShopPhotoPreviews(({ [id]: _removed, ...rest }) => rest);
    },
    [setDraft],
  );
  const moveShopItem = useCallback(
    (id: string, direction: -1 | 1) =>
      setDraft((draft) =>
        patchShopItems(draft, (rows) => moveRowById(rows, id, direction)),
      ),
    [setDraft],
  );
  const setShopItemPhoto = useCallback(
    (id: string, persist: string, preview: string) => {
      setDraft((draft) =>
        patchShopItem(draft, id, (row) => ({
          ...row,
          photo: { image: persist, alt: row.photo?.alt ?? "", caption: "" },
        })),
      );
      setShopPhotoPreviews((previews) => ({ ...previews, [id]: preview }));
    },
    [setDraft],
  );
  const setShopItemPhotoAlt = useCallback(
    (id: string, alt: string) =>
      setDraft((draft) =>
        patchShopItem(draft, id, (row) =>
          row.photo ? { ...row, photo: { ...row.photo, alt } } : row,
        ),
      ),
    [setDraft],
  );
  const removeShopItemPhoto = useCallback(
    (id: string) => {
      setDraft((draft) =>
        patchShopItem(draft, id, (row) => ({ ...row, photo: null })),
      );
      setShopPhotoPreviews(({ [id]: _removed, ...rest }) => rest);
    },
    [setDraft],
  );
  const clearShopPhotoPreviews = useCallback(
    () => setShopPhotoPreviews({}),
    [],
  );

  return {
    shopPhotoPreviews,
    addShopItem,
    setShopItemField,
    removeShopItem,
    moveShopItem,
    setShopItemPhoto,
    setShopItemPhotoAlt,
    removeShopItemPhoto,
    clearShopPhotoPreviews,
  };
}

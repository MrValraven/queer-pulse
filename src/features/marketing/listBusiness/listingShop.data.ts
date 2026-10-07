import { API_BASE_URL } from "../../../shared/api/config";
import {
  defaultPricingMode,
  pricingModeOf,
  type ListingPricingMode,
} from "./listingMenu.data";
import {
  isFilledOnlineLinkValid,
  isSellingOnline,
  recordOrEmpty,
  stringOrEmpty,
} from "./listingOnline.data";

/**
 * "In the shop": up to six things a business that sells online puts on its
 * page, each with a name, a price in its own words, an optional link and an
 * optional photo. Unlike service rows, an item's `id` is a real identifier
 * (a client-made uuid the server keeps), so it is sent and never regenerated.
 */

export const MAX_LISTING_SHOP_ITEMS = 6;
export const SHOP_ITEM_NAME_MAX = 60;
export const SHOP_ITEM_PRICE_MAX = 20;
export const SHOP_ITEM_LINK_MAX = 300;
/** The gallery photo's alt ceiling (`ListingGalleryPhotoDto`). */
export const SHOP_ITEM_ALT_MAX = 2000;

/** Same shape as a gallery photo. `image` is a storage key or a served URL. */
export interface ListingShopItemPhoto {
  image: string;
  alt: string;
  caption: string;
}

/** Request body (and the stored shape). Responses send `DirectoryShopItem`,
 *  the view shape, on every wire including the owner's (backend delta 3). */
export interface ListingShopItem {
  id: string;
  name: string;
  price: string;
  link: string;
  photo: ListingShopItemPhoto | null;
}

/** The editable row is the wire row: the id is already stable. */
export type ListingShopItemRow = ListingShopItem;

/** The response item on every wire, photo resolved like the gallery's
 *  (`image` null when unresolvable; a `crop` key may ride along and is
 *  ignored here). */
export interface DirectoryShopItem {
  id: string;
  name: string;
  price: string;
  link: string;
  photo: { image: string | null; alt: string; caption: string } | null;
}

export function newShopItemRow(): ListingShopItemRow {
  return {
    id: crypto.randomUUID(),
    name: "",
    price: "",
    link: "",
    photo: null,
  };
}

function shopPhotoFrom(raw: unknown): ListingShopItemPhoto | null {
  const record = recordOrEmpty(raw);
  const image = stringOrEmpty(record.image);
  if (!image) return null;
  return {
    image,
    alt: stringOrEmpty(record.alt),
    caption: stringOrEmpty(record.caption),
  };
}

/** Any received or resumed list read as editable request rows. Ids already
 *  there are kept; a row without one gets a fresh uuid. A photo keeps only
 *  `image`, `alt` and `caption` (the request refuses a `crop`), and a view
 *  photo whose image could not be resolved reads as no photo. */
export function toShopItemRows(raw: unknown): ListingShopItemRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, MAX_LISTING_SHOP_ITEMS).map((entry) => {
    const record = recordOrEmpty(entry);
    return {
      id: stringOrEmpty(record.id) || crypto.randomUUID(),
      name: stringOrEmpty(record.name),
      price: stringOrEmpty(record.price),
      link: stringOrEmpty(record.link),
      photo: shopPhotoFrom(record.photo),
    };
  });
}

/** A public payload's items. Nameless entries are dropped. */
export function toDirectoryShopItems(raw: unknown): DirectoryShopItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((entry) => {
    const record = recordOrEmpty(entry);
    const name = stringOrEmpty(record.name).trim();
    if (!name) return [];
    const photo =
      record.photo !== null && typeof record.photo === "object"
        ? recordOrEmpty(record.photo)
        : null;
    return [
      {
        id: stringOrEmpty(record.id) || name,
        name,
        price: stringOrEmpty(record.price),
        link: stringOrEmpty(record.link),
        photo: photo
          ? {
              image: stringOrEmpty(photo.image) || null,
              alt: stringOrEmpty(photo.alt),
              caption: stringOrEmpty(photo.caption),
            }
          : null,
      },
    ];
  });
}

/** A photo value something can load: a served or local URL as is, a bare
 *  storage key through `GET /files/<key>`, nothing for an empty value. */
export function shopPhotoDisplayUrl(image: string): string | null {
  if (!image) return null;
  if (/^(blob:|data:|https?:\/\/)/.test(image)) return image;
  return `${API_BASE_URL}/files/${image}`;
}

export function isBlankShopItem(item: ListingShopItem): boolean {
  return (
    item.name.trim() === "" &&
    item.price.trim() === "" &&
    item.link.trim() === "" &&
    item.photo === null
  );
}

export type ShopItemProblem = "name" | "link";

/** What is still wrong with a started item; null for a fine or blank one. */
export function shopItemProblem(item: ListingShopItem): ShopItemProblem | null {
  if (isBlankShopItem(item)) return null;
  if (item.name.trim() === "") return "name";
  const link = item.link.trim();
  const isLinkBad =
    link !== "" && !isFilledOnlineLinkValid(link, SHOP_ITEM_LINK_MAX);
  return isLinkBad ? "link" : null;
}

export function shopItemsValid(rows: readonly ListingShopItem[]): boolean {
  return rows.every((row) => shopItemProblem(row) === null);
}

/** The wire list: blank rows dropped, values trimmed, at most six. While the
 *  shop is the HIDDEN list, rows with a problem are dropped too, so a
 *  half-filled row nobody can see never blocks a save. */
export function shopItemsForPayload(
  rows: readonly ListingShopItemRow[],
  options: { shouldDropIncomplete: boolean },
): ListingShopItem[] {
  return rows
    .filter((row) => !isBlankShopItem(row))
    .filter(
      (row) => !options.shouldDropIncomplete || shopItemProblem(row) === null,
    )
    .slice(0, MAX_LISTING_SHOP_ITEMS)
    .map((row) => ({
      id: row.id,
      name: row.name.trim(),
      price: row.price.trim(),
      link: row.link.trim(),
      photo: row.photo
        ? {
            image: row.photo.image,
            alt: row.photo.alt.trim(),
            caption: row.photo.caption.trim(),
          }
        : null,
    }));
}

interface PricingSource {
  pricingMode?: unknown;
  cats: readonly string[];
  online: boolean;
  hasOnlineShop?: boolean;
}

/** The mode a save sends: "shop" only while the listing sells online
 *  (backend rule 2 falls back the same way). */
export function effectivePricingMode(
  source: PricingSource,
): ListingPricingMode {
  const mode = pricingModeOf(source);
  if (mode === "shop" && !isSellingOnline(source)) {
    return defaultPricingMode(source.cats, source.online);
  }
  return mode;
}

/** The modes the editor offers: Services or Shop online, Services or Menu
 *  for a place, all three for a place that sells online. A stored mode
 *  outside that set stays offered so the owner can see it and switch. */
export function pricingModeChoices(
  source: PricingSource,
): ListingPricingMode[] {
  const offered: ListingPricingMode[] = source.online
    ? ["services", "shop"]
    : isSellingOnline(source)
      ? ["services", "menu", "shop"]
      : ["services", "menu"];
  const current = pricingModeOf(source);
  return offered.includes(current) ? offered : [...offered, current];
}

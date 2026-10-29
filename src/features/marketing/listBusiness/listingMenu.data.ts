import { normalizeCategory } from "../localCategories";
import { WEBSITE_URL_RE, type ListingDraft } from "./listBusiness.data";
import {
  isBlankServiceRow,
  type ListingServiceRow,
} from "./listingServices.data";
import {
  canonicalMenuPrice,
  DEFAULT_LISTING_MENU_CURRENCY,
  menuCurrencyOf,
  menuPriceKind,
  type ListingMenuCurrency,
} from "./listingMenuPrice.data";

export type { ListingMenuCurrency };

/**
 * A bar's, café's or restaurant's menu: titled sections of priced items with
 * four fixed dietary labels, plus an optional file and an optional link.
 * A section can also hold sub-sections (Red, White and Rosé under Wines) whose
 * items carry an optional price per glass and an optional price per bottle.
 *
 * It sits beside the priced-services list; `pricingMode` picks which one the
 * public page shows, and both are kept whichever is on. The whole menu has one
 * currency and a new price is a plain number (see `listingMenuPrice.data`).
 * A price saved earlier as free text, like "4 EUR / 7 EUR" or "market price",
 * stays as it is until the owner types a number over it.
 */

export type ListingPricingMode = "services" | "menu" | "shop";
const PRICING_MODES: readonly ListingPricingMode[] = [
  "services",
  "menu",
  "shop",
];

export const LISTING_MENU_DIETARY = [
  "vegan",
  "vegetarian",
  "glutenFree",
  "alcoholFree",
] as const;
export type ListingMenuDietary = (typeof LISTING_MENU_DIETARY)[number];

/** Wire shapes, mirrored from the backend's `listing.entity.ts`. */
export interface ListingMenuItem {
  name: string;
  price: string;
  /** Only items inside a sub-section carry these two. */
  priceGlass?: string;
  priceBottle?: string;
  description: string;
  dietary: ListingMenuDietary[];
}
export interface ListingMenuSubsection {
  title: string;
  items: ListingMenuItem[];
}
export interface ListingMenuSection {
  title: string;
  items: ListingMenuItem[];
  subsections: ListingMenuSubsection[];
}
/** `url` is a storage key or its served `/files/...` URL (a local object URL
 *  in demo mode). `contentType` tells the page "PDF" from "photo". */
export interface ListingMenuFile {
  url: string;
  contentType: string;
  fileName: string;
}
export interface ListingMenu {
  sections: ListingMenuSection[];
  file: ListingMenuFile | null;
  link: string;
  currency: ListingMenuCurrency;
}

/** The wire shape for a PATCH/POST body: identical to `ListingMenu` except
 *  `file`, which carries only what the server accepts (`url`, `fileName`).
 *  `contentType` is server-authoritative (read back from storage, never
 *  trusted from a client) and the DTO does not declare it, so sending it
 *  trips the global `forbidNonWhitelisted` pipe with a 400. */
export type ListingMenuPayload = Omit<ListingMenu, "file"> & {
  file: { url: string; fileName: string } | null;
};

/** Editable shapes: each row carries a client-only `id` for React keys,
 *  stripped by `menuForPayload`. */
export interface ListingMenuItemRow extends ListingMenuItem {
  id: string;
}
export interface ListingMenuSubsectionRow {
  id: string;
  title: string;
  items: ListingMenuItemRow[];
}
export interface ListingMenuSectionRow {
  id: string;
  title: string;
  items: ListingMenuItemRow[];
  subsections: ListingMenuSubsectionRow[];
}
export interface ListingMenuDraft {
  sections: ListingMenuSectionRow[];
  file: ListingMenuFile | null;
  link: string;
  currency: ListingMenuCurrency;
}

/** Server ceilings, mirrored so the editor stops a member before the API does. */
export const MAX_LISTING_MENU_SECTIONS = 12;
export const MAX_LISTING_MENU_SUBSECTIONS = 8;
export const MAX_LISTING_MENU_ITEMS = 150;
export const MENU_SECTION_TITLE_MAX = 80;
export const MENU_SUBSECTION_TITLE_MAX = 80;
export const MENU_ITEM_NAME_MAX = 120;
export const MENU_ITEM_PRICE_MAX = 80;
export const MENU_ITEM_DESCRIPTION_MAX = 200;
export const MENU_LINK_MAX = 300;
export const MENU_FILE_NAME_MAX = 120;

/** Normalized categories that default a listing to a menu. */
const MENU_CATEGORIES: ReadonlySet<string> = new Set(["food", "nightlife"]);

let menuRowSequence = 0;
function nextMenuRowId(prefix: string): string {
  menuRowSequence += 1;
  return `${prefix}-${menuRowSequence}`;
}

export function emptyMenu(): ListingMenu {
  return {
    sections: [],
    file: null,
    link: "",
    currency: DEFAULT_LISTING_MENU_CURRENCY,
  };
}

export function emptyMenuDraft(): ListingMenuDraft {
  return {
    sections: [],
    file: null,
    link: "",
    currency: DEFAULT_LISTING_MENU_CURRENCY,
  };
}

export function newMenuItemRow(): ListingMenuItemRow {
  return {
    id: nextMenuRowId("menu-item"),
    name: "",
    price: "",
    description: "",
    dietary: [],
  };
}

/** A new section starts with one blank item, so the owner can type straight in. */
export function newMenuSectionRow(): ListingMenuSectionRow {
  return {
    id: nextMenuRowId("menu-section"),
    title: "",
    items: [newMenuItemRow()],
    subsections: [],
  };
}

/** A new sub-section starts with one blank item whose glass and bottle prices
 *  are present and empty, ready to type into. */
export function newMenuSubsectionRow(): ListingMenuSubsectionRow {
  return {
    id: nextMenuRowId("menu-subsection"),
    title: "",
    items: [{ ...newMenuItemRow(), priceGlass: "", priceBottle: "" }],
  };
}

function textOf(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function dietaryOf(value: unknown): ListingMenuDietary[] {
  if (!Array.isArray(value)) return [];
  return LISTING_MENU_DIETARY.filter((label) => value.includes(label));
}

function toMenuFile(value: unknown): ListingMenuFile | null {
  const record = (value ?? {}) as Record<string, unknown>;
  const url = textOf(record.url);
  if (url === "") return null;
  return {
    url,
    contentType: textOf(record.contentType),
    fileName: textOf(record.fileName),
  };
}

function toMenuItemRow(
  itemValue: unknown,
  hasGlassBottle: boolean,
): ListingMenuItemRow {
  const item = (itemValue ?? {}) as Record<string, unknown>;
  return {
    id: nextMenuRowId("menu-item"),
    name: textOf(item.name),
    price: textOf(item.price),
    ...(hasGlassBottle
      ? {
          priceGlass: textOf(item.priceGlass),
          priceBottle: textOf(item.priceBottle),
        }
      : {}),
    description: textOf(item.description),
    dietary: dietaryOf(item.dietary),
  };
}

function toMenuSubsectionRow(
  subsectionValue: unknown,
): ListingMenuSubsectionRow {
  const subsection = (subsectionValue ?? {}) as Record<string, unknown>;
  const items = Array.isArray(subsection.items) ? subsection.items : [];
  return {
    id: nextMenuRowId("menu-subsection"),
    title: textOf(subsection.title),
    items: items.map((itemValue) => toMenuItemRow(itemValue, true)),
  };
}

/**
 * Adopt whatever the server or a resumed local draft holds as an editable
 * menu, minting a key per section, sub-section and item. Takes `unknown`
 * because a draft saved before this feature existed has no menu at all, and a
 * menu saved before sub-sections has no `subsections` (it becomes `[]`).
 * Direct items never keep a glass or bottle price: only sub-section items do.
 */
export function toMenuDraft(input?: unknown): ListingMenuDraft {
  const record = (input ?? {}) as Record<string, unknown>;
  const sections = Array.isArray(record.sections) ? record.sections : [];
  return {
    sections: sections.map((sectionValue) => {
      const section = (sectionValue ?? {}) as Record<string, unknown>;
      const items = Array.isArray(section.items) ? section.items : [];
      const subsections = Array.isArray(section.subsections)
        ? section.subsections
        : [];
      return {
        id: nextMenuRowId("menu-section"),
        title: textOf(section.title),
        items: items.map((itemValue) => toMenuItemRow(itemValue, false)),
        subsections: subsections.map(toMenuSubsectionRow),
      };
    }),
    file: toMenuFile(record.file),
    link: textOf(record.link),
    currency: menuCurrencyOf(record.currency),
  };
}

/** Heal a menu that came off the wire: a section saved before sub-sections
 *  has no `subsections` and gets `[]`, so every reader can rely on the array. */
export function withMenuSubsections(menu: ListingMenu): ListingMenu {
  return {
    ...menu,
    sections: menu.sections.map((section) => ({
      ...section,
      subsections: Array.isArray(section.subsections)
        ? section.subsections
        : [],
    })),
  };
}

/** Nothing typed in the name, the price, the glass price or the bottle price:
 *  a blank line, skipped on send and free of errors. */
export function isBlankMenuItem(item: ListingMenuItem): boolean {
  return (
    item.name.trim() === "" &&
    item.price.trim() === "" &&
    (item.priceGlass ?? "").trim() === "" &&
    (item.priceBottle ?? "").trim() === ""
  );
}

/** `section` items are direct children of a section and need a price;
 *  `subsection` items price per glass and per bottle, both optional. */
export type MenuItemScope = "section" | "subsection";

/** `priceFormat`, `glassFormat`, `bottleFormat`: that price holds only
 *  separators ("." or ",") and no digit. Free text from before the currency
 *  feature is not a problem. */
export type MenuItemProblem =
  "name" | "price" | "priceFormat" | "glassFormat" | "bottleFormat";

export function menuItemProblem(
  item: ListingMenuItem,
  scope: MenuItemScope = "section",
): MenuItemProblem | null {
  if (isBlankMenuItem(item)) return null;
  if (item.name.trim() === "") return "name";
  if (scope === "subsection") {
    if (menuPriceKind(item.priceGlass ?? "") === "incomplete") {
      return "glassFormat";
    }
    if (menuPriceKind(item.priceBottle ?? "") === "incomplete") {
      return "bottleFormat";
    }
    return null;
  }
  const priceKind = menuPriceKind(item.price);
  if (priceKind === "empty") return "price";
  if (priceKind === "incomplete") return "priceFormat";
  return null;
}

/** A sub-section with at least one started item needs a title. */
export function menuSubsectionProblem(
  subsection: ListingMenuSubsectionRow,
): "title" | null {
  const hasStartedItem = subsection.items.some(
    (item) => !isBlankMenuItem(item),
  );
  return hasStartedItem && subsection.title.trim() === "" ? "title" : null;
}

/** A section with at least one started item, direct or inside a sub-section,
 *  needs a title. */
export function menuSectionProblem(
  section: ListingMenuSectionRow,
): "title" | null {
  const hasStartedItem =
    section.items.some((item) => !isBlankMenuItem(item)) ||
    section.subsections.some((subsection) =>
      subsection.items.some((item) => !isBlankMenuItem(item)),
    );
  return hasStartedItem && section.title.trim() === "" ? "title" : null;
}

export function menuValid(menu: ListingMenuDraft): boolean {
  return menu.sections.every(
    (section) =>
      menuSectionProblem(section) === null &&
      section.items.every((item) => menuItemProblem(item) === null) &&
      section.subsections.every(
        (subsection) =>
          menuSubsectionProblem(subsection) === null &&
          subsection.items.every(
            (item) => menuItemProblem(item, "subsection") === null,
          ),
      ),
  );
}

/** An empty link is valid (the field is optional); a non-empty one must be a
 *  real web address, the same shape `social.website` accepts, so it never
 *  resolves as an in-app relative path (e.g. `cafemouraria.pt/menu`). */
export function isMenuLinkValid(link: string): boolean {
  const trimmed = link.trim();
  return trimmed === "" || WEBSITE_URL_RE.test(trimmed);
}

/** Every item row, blank ones and sub-section items included: what the add
 *  button counts against. */
export function menuItemCount(menu: ListingMenuDraft): number {
  return menu.sections.reduce(
    (total, section) =>
      total +
      section.items.length +
      section.subsections.reduce(
        (subtotal, subsection) => subtotal + subsection.items.length,
        0,
      ),
    0,
  );
}

/** A typed glass or bottle price as sent: canonical for a plain amount and
 *  trimmed otherwise. "" means nothing is typed, and the key is then omitted. */
function optionalPriceOf(value: string | undefined): string {
  const trimmed = (value ?? "").trim();
  return canonicalMenuPrice(trimmed) ?? trimmed;
}

function dietaryForPayload(item: ListingMenuItem): ListingMenuDietary[] {
  return LISTING_MENU_DIETARY.filter((label) => item.dietary.includes(label));
}

/**
 * Shared by `menuForPayload` and `menuForDisplay`: text trimmed, blank items
 * and empty sections or sub-sections dropped, dietary labels in display order.
 * A direct item never sends a glass or bottle price. A sub-section item may
 * send an empty `price` and sends each glass and bottle price only when typed.
 * `shouldDropIncomplete` also drops half-filled items and untitled sections
 * and sub-sections; it is used when the menu is the HIDDEN list, whose
 * problems the owner cannot see, so they never block a save.
 */
function menuSectionsForPayload(
  menu: ListingMenuDraft,
  shouldDropIncomplete: boolean,
): ListingMenuSection[] {
  return menu.sections
    .map((section) => ({
      title: section.title.trim(),
      items: section.items
        .filter((item) => !isBlankMenuItem(item))
        .filter(
          (item) => !shouldDropIncomplete || menuItemProblem(item) === null,
        )
        .map((item) => ({
          name: item.name.trim(),
          price: canonicalMenuPrice(item.price) ?? item.price.trim(),
          description: item.description.trim(),
          dietary: dietaryForPayload(item),
        })),
      subsections: section.subsections
        .map((subsection) => ({
          title: subsection.title.trim(),
          items: subsection.items
            .filter((item) => !isBlankMenuItem(item))
            .filter(
              (item) =>
                !shouldDropIncomplete ||
                menuItemProblem(item, "subsection") === null,
            )
            .map((item) => {
              const priceGlass = optionalPriceOf(item.priceGlass);
              const priceBottle = optionalPriceOf(item.priceBottle);
              return {
                name: item.name.trim(),
                price: canonicalMenuPrice(item.price) ?? item.price.trim(),
                ...(priceGlass === "" ? {} : { priceGlass }),
                ...(priceBottle === "" ? {} : { priceBottle }),
                description: item.description.trim(),
                dietary: dietaryForPayload(item),
              };
            }),
        }))
        .filter((subsection) => subsection.items.length > 0)
        .filter(
          (subsection) => !shouldDropIncomplete || subsection.title !== "",
        ),
    }))
    .filter(
      (section) => section.items.length > 0 || section.subsections.length > 0,
    )
    .filter((section) => !shouldDropIncomplete || section.title !== "");
}

/**
 * The wire shape: ids stripped via `menuSectionsForPayload`, and `file`
 * narrowed to `{ url, fileName }`. `contentType` never goes out on the wire;
 * the server is authoritative for it (see `ListingMenuPayload`).
 */
export function menuForPayload(
  menu: ListingMenuDraft,
  options: { shouldDropIncomplete?: boolean } = {},
): ListingMenuPayload {
  const shouldDropIncomplete = options.shouldDropIncomplete ?? false;
  return {
    sections: menuSectionsForPayload(menu, shouldDropIncomplete),
    file: menu.file
      ? { url: menu.file.url, fileName: menu.file.fileName }
      : null,
    link: menu.link.trim(),
    currency: menu.currency,
  };
}

/** What a preview or a local listing shows: only complete, titled content.
 *  Keeps `file.contentType` (unlike `menuForPayload`), since the page uses it
 *  to label a PDF apart from a photo. */
export function menuForDisplay(menu?: unknown): ListingMenu {
  const draft = toMenuDraft(menu);
  return {
    sections: menuSectionsForPayload(draft, true),
    file: draft.file,
    link: draft.link.trim(),
    currency: draft.currency,
  };
}

/** An online-only listing defaults to services: Menu is not offered to it. */
export function defaultPricingMode(
  cats: readonly string[],
  isOnline = false,
): ListingPricingMode {
  if (isOnline) return "services";
  const isMenuCategory = cats.some((category) =>
    MENU_CATEGORIES.has(normalizeCategory(category)),
  );
  return isMenuCategory ? "menu" : "services";
}

/** The mode a draft or DTO is in. A draft from before this feature has none
 *  and gets its category's default. */
export function pricingModeOf(source: {
  pricingMode?: unknown;
  cats: readonly string[];
  online?: boolean;
}): ListingPricingMode {
  return PRICING_MODES.includes(source.pricingMode as ListingPricingMode)
    ? (source.pricingMode as ListingPricingMode)
    : defaultPricingMode(source.cats, source.online === true);
}

/** True once the owner has typed anything into any of the three lists. */
export function hasPricingContent(draft: {
  services?: ListingServiceRow[];
  menu?: ListingMenuDraft;
  shopItems?: ReadonlyArray<{
    name: string;
    price: string;
    link: string;
    photo: unknown;
  }>;
}): boolean {
  const hasServices = (draft.services ?? []).some(
    (row) => !isBlankServiceRow(row),
  );
  const menu = draft.menu ?? emptyMenuDraft();
  const hasMenu =
    menu.file !== null ||
    menu.link.trim() !== "" ||
    menu.sections.some(
      (section) =>
        section.title.trim() !== "" ||
        section.items.some((item) => !isBlankMenuItem(item)) ||
        section.subsections.some(
          (subsection) =>
            subsection.title.trim() !== "" ||
            subsection.items.some((item) => !isBlankMenuItem(item)),
        ),
    );
  const hasShop = (draft.shopItems ?? []).some(
    (item) =>
      item.name.trim() !== "" ||
      item.price.trim() !== "" ||
      item.link.trim() !== "" ||
      item.photo !== null,
  );
  return hasServices || hasMenu || hasShop;
}

/**
 * Re-default the mode when the categories or the listing's kind change, but
 * only while every list is still empty. Once the owner has typed anything,
 * their choice stands.
 */
export function applyCategoryPricingDefault(
  previous: ListingDraft,
  next: ListingDraft,
): ListingDraft {
  if (next.cats === previous.cats && next.online === previous.online) {
    return next;
  }
  if (hasPricingContent(next)) return next;
  return { ...next, pricingMode: defaultPricingMode(next.cats, next.online) };
}

/** Swap the row with `id` and its neighbour. Returns the SAME array when the
 *  move would go off either end, so a caller can skip a state update. */
export function moveRowById<Row extends { id: string }>(
  rows: Row[],
  id: string,
  direction: -1 | 1,
): Row[] {
  const index = rows.findIndex((row) => row.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= rows.length) return rows;
  const reordered = [...rows];
  const moved = reordered[index]!;
  reordered[index] = reordered[target]!;
  reordered[target] = moved;
  return reordered;
}

import { normalizeCategory } from "../localCategories";
import { WEBSITE_URL_RE, type ListingDraft } from "./listBusiness.data";
import {
  isBlankServiceRow,
  type ListingServiceRow,
} from "./listingServices.data";

/**
 * A bar's, café's or restaurant's menu: titled sections of priced items with
 * four fixed dietary labels, plus an optional file and an optional link.
 *
 * It sits beside the priced-services list; `pricingMode` picks which one the
 * public page shows, and both are kept whichever is on. Prices are free text
 * for the same reason services' prices are: "4 EUR / 7 EUR" and "market price"
 * are real menu prices.
 */

export type ListingPricingMode = "services" | "menu";

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
  description: string;
  dietary: ListingMenuDietary[];
}
export interface ListingMenuSection {
  title: string;
  items: ListingMenuItem[];
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
export interface ListingMenuSectionRow {
  id: string;
  title: string;
  items: ListingMenuItemRow[];
}
export interface ListingMenuDraft {
  sections: ListingMenuSectionRow[];
  file: ListingMenuFile | null;
  link: string;
}

/** Server ceilings, mirrored so the editor stops a member before the API does. */
export const MAX_LISTING_MENU_SECTIONS = 12;
export const MAX_LISTING_MENU_ITEMS = 150;
export const MENU_SECTION_TITLE_MAX = 80;
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
  return { sections: [], file: null, link: "" };
}

export function emptyMenuDraft(): ListingMenuDraft {
  return { sections: [], file: null, link: "" };
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

/**
 * Adopt whatever the server or a resumed local draft holds as an editable
 * menu, minting a key per section and item. Takes `unknown` because a draft
 * saved before this feature existed has no menu at all.
 */
export function toMenuDraft(input?: unknown): ListingMenuDraft {
  const record = (input ?? {}) as Record<string, unknown>;
  const sections = Array.isArray(record.sections) ? record.sections : [];
  return {
    sections: sections.map((sectionValue) => {
      const section = (sectionValue ?? {}) as Record<string, unknown>;
      const items = Array.isArray(section.items) ? section.items : [];
      return {
        id: nextMenuRowId("menu-section"),
        title: textOf(section.title),
        items: items.map((itemValue) => {
          const item = (itemValue ?? {}) as Record<string, unknown>;
          return {
            id: nextMenuRowId("menu-item"),
            name: textOf(item.name),
            price: textOf(item.price),
            description: textOf(item.description),
            dietary: dietaryOf(item.dietary),
          };
        }),
      };
    }),
    file: toMenuFile(record.file),
    link: textOf(record.link),
  };
}

/** Neither a name nor a price: a blank line, never sent, never an error. */
export function isBlankMenuItem(item: ListingMenuItem): boolean {
  return item.name.trim() === "" && item.price.trim() === "";
}

export type MenuItemProblem = "name" | "price";

export function menuItemProblem(item: ListingMenuItem): MenuItemProblem | null {
  if (isBlankMenuItem(item)) return null;
  if (item.name.trim() === "") return "name";
  if (item.price.trim() === "") return "price";
  return null;
}

/** A section with at least one started item needs a title. */
export function menuSectionProblem(
  section: ListingMenuSectionRow,
): "title" | null {
  const hasStartedItem = section.items.some((item) => !isBlankMenuItem(item));
  return hasStartedItem && section.title.trim() === "" ? "title" : null;
}

export function menuValid(menu: ListingMenuDraft): boolean {
  return menu.sections.every(
    (section) =>
      menuSectionProblem(section) === null &&
      section.items.every((item) => menuItemProblem(item) === null),
  );
}

/** An empty link is valid (the field is optional); a non-empty one must be a
 *  real web address, the same shape `social.website` accepts, so it never
 *  resolves as an in-app relative path (e.g. `cafemouraria.pt/menu`). */
export function isMenuLinkValid(link: string): boolean {
  const trimmed = link.trim();
  return trimmed === "" || WEBSITE_URL_RE.test(trimmed);
}

/** Every item row, blank ones included: what the add button counts against. */
export function menuItemCount(menu: ListingMenuDraft): number {
  return menu.sections.reduce(
    (total, section) => total + section.items.length,
    0,
  );
}

/**
 * Shared by `menuForPayload` and `menuForDisplay`: text trimmed, blank items
 * and empty sections dropped, dietary labels in display order.
 * `shouldDropIncomplete` also drops half-filled items and untitled sections;
 * it is used when the menu is the HIDDEN list, whose problems the owner
 * cannot see, so they never block a save.
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
          price: item.price.trim(),
          description: item.description.trim(),
          dietary: LISTING_MENU_DIETARY.filter((label) =>
            item.dietary.includes(label),
          ),
        })),
    }))
    .filter((section) => section.items.length > 0)
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
  };
}

export function defaultPricingMode(
  cats: readonly string[],
): ListingPricingMode {
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
}): ListingPricingMode {
  return source.pricingMode === "menu" || source.pricingMode === "services"
    ? source.pricingMode
    : defaultPricingMode(source.cats);
}

/** True once the owner has typed anything into either list. */
export function hasPricingContent(draft: {
  services?: ListingServiceRow[];
  menu?: ListingMenuDraft;
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
        section.items.some((item) => !isBlankMenuItem(item)),
    );
  return hasServices || hasMenu;
}

/**
 * Re-default the mode from the categories when they change, but only while
 * both lists are still empty. Once the owner has typed anything, their choice
 * stands.
 */
export function applyCategoryPricingDefault(
  previous: ListingDraft,
  next: ListingDraft,
): ListingDraft {
  if (next.cats === previous.cats) return next;
  if (hasPricingContent(next)) return next;
  return { ...next, pricingMode: defaultPricingMode(next.cats) };
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

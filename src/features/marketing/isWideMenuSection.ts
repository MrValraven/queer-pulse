import type {
  ListingMenuItem,
  ListingMenuSection,
} from "./listBusiness/listingMenu.data";

/** An item name longer than this needs more than half the menu column to sit
 *  on one or two lines. */
export const WIDE_MENU_ITEM_NAME_LENGTH = 34;

function hasText(value: string | undefined): boolean {
  return (value ?? "").trim() !== "";
}

function isWideMenuItem(item: ListingMenuItem): boolean {
  const hasDescription = hasText(item.description);
  const hasGlassAndBottlePrice =
    hasText(item.priceGlass) && hasText(item.priceBottle);
  const hasVeryLongName = item.name.trim().length > WIDE_MENU_ITEM_NAME_LENGTH;
  return hasDescription || hasGlassAndBottlePrice || hasVeryLongName;
}

/** Whether a menu section spans both columns of the two-column menu grid. A
 *  section with sub-sections, described items, glass / bottle prices or very
 *  long names needs the full width. Short name and price rows share a row
 *  with the next short section. */
export function isWideMenuSection(section: ListingMenuSection): boolean {
  const hasSubsections = section.subsections.length > 0;
  return hasSubsections || section.items.some(isWideMenuItem);
}

import type { Formatters } from "../../../shared/i18n/format";
import type { ListingMenuItem } from "./listingMenu.data";
import {
  formatMenuPrice,
  type ListingMenuCurrency,
} from "./listingMenuPrice.data";

/**
 * What the public page shows for one menu item's price. A glass or a bottle
 * price wins over `price`; with neither, `price` shows as a single amount, and
 * a blank `price` shows nothing. A plain amount goes through the locale's
 * currency format, and a legacy free-text price shows as it was written.
 */
export type MenuItemPriceDisplay =
  | { kind: "none" }
  | { kind: "single"; text: string }
  | { kind: "glassBottle"; glass: string; bottle: string }
  | { kind: "glassOnly"; glass: string }
  | { kind: "bottleOnly"; bottle: string };

export function menuItemPriceDisplay(
  item: ListingMenuItem,
  currency: ListingMenuCurrency,
  fmt: { currency: Formatters["currency"] },
): MenuItemPriceDisplay {
  const glassText = (item.priceGlass ?? "").trim();
  const bottleText = (item.priceBottle ?? "").trim();
  const hasGlass = glassText !== "";
  const hasBottle = bottleText !== "";
  if (hasGlass && hasBottle) {
    return {
      kind: "glassBottle",
      glass: formatMenuPrice(glassText, currency, fmt),
      bottle: formatMenuPrice(bottleText, currency, fmt),
    };
  }
  if (hasGlass) {
    return {
      kind: "glassOnly",
      glass: formatMenuPrice(glassText, currency, fmt),
    };
  }
  if (hasBottle) {
    return {
      kind: "bottleOnly",
      bottle: formatMenuPrice(bottleText, currency, fmt),
    };
  }
  if (item.price.trim() === "") return { kind: "none" };
  return { kind: "single", text: formatMenuPrice(item.price, currency, fmt) };
}

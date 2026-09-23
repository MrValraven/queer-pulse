import type { IconType } from "react-icons";
import { LuLeaf, LuVegan, LuWheatOff, LuWineOff } from "react-icons/lu";
import type { ListingMenuDietary } from "./listBusiness/listingMenu.data";

const DIETARY_ICONS: Record<ListingMenuDietary, IconType> = {
  vegan: LuVegan,
  vegetarian: LuLeaf,
  glutenFree: LuWheatOff,
  alcoholFree: LuWineOff,
};

/** The icon for one dietary label. Always decorative: the label text beside it
 *  is what a screen reader reads. */
export function DietaryIcon({ label }: { label: ListingMenuDietary }) {
  const Icon = DIETARY_ICONS[label];
  return <Icon aria-hidden focusable={false} />;
}

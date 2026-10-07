import { routes } from "../../app/routeMap";
import type { DirectoryPlace } from "./directoryPlaces";
import { asOnlineCategory, normalizeCategory } from "./localCategories";

/**
 * Where a detail page's category crumb leads. A place goes to the directory
 * filtered by its category. An online listing's category lives in the Online
 * tab, read through the online vocabulary (`asOnlineCategory`), so a legacy
 * place slug on an older online row still lands on a chip that exists. An 18+
 * listing also turns "Show 18+ shops" on: without it the tab never loads the
 * 18+ list and hides its chip. Its page is only reachable signed in, so the
 * flag always applies.
 */
export function directoryCategoryPath(
  place: Pick<DirectoryPlace, "cat" | "online" | "isAdultsOnly">,
): string {
  const isAdultsOnly = place.isAdultsOnly === true;
  if (!place.online && !isAdultsOnly) {
    return `${routes.directory}?cat=${normalizeCategory(place.cat)}`;
  }
  const onlineCategory = asOnlineCategory(place.cat);
  const adultFlag = isAdultsOnly ? "&adult=1" : "";
  return `${routes.directory}?view=online&cat=${onlineCategory}${adultFlag}`;
}

import type { TFunction } from "../../shared/i18n/types";
import { operatingStateOf, type DirectoryPlace } from "./directoryPlaces";
import { categoryLabel } from "./localCategories";
import { placeAreaParts, placeStreetLine } from "./placeArea";

/**
 * The street address as the page's "Copy address" pastes it: the street
 * line, then the neighbourhood and city it does not already carry. A listing
 * on the directory is public, so its address travels with the message.
 */
function fullAddress(place: DirectoryPlace): string {
  return [placeStreetLine(place), ...placeAreaParts(place)]
    .filter(Boolean)
    .join(", ");
}

/**
 * Where to find it, in the words the page uses, under the operating state the
 * page leads with when the business is anything other than open. A
 * permanently closed business has nowhere to send anybody, so its state
 * stands alone. A moved one gives the new address its banner shows, when the
 * owner left one. Every other listing gives its address, or "Online only" for
 * a business with no premises.
 */
function whereLines(place: DirectoryPlace, t: TFunction): string[] {
  const state = operatingStateOf(place);
  const stateLine =
    state === "open"
      ? ""
      : t(`marketing:directory.detail.operating.${state}.title`);
  if (state === "permanently_closed") return [stateLine];
  if (state === "moved") {
    const movedToAddress = place.operatingState?.movedToAddress?.trim();
    const movedLine = movedToAddress
      ? t("marketing:directory.detail.operating.moved.newAddress", {
          address: movedToAddress,
        })
      : "";
    return [stateLine, movedLine];
  }
  const placeLine = place.online
    ? t("marketing:directory.detail.onlineBusiness")
    : fullAddress(place);
  return [stateLine, placeLine];
}

/**
 * The words above the link when a member shares a directory listing: its
 * name, its category in the reader's language, and where to find it. Every
 * line comes from the catalog or the listing itself, and an empty line is
 * left out. `ShareMenu` adds the link as the last line.
 */
export function buildDirectoryShareMessage(
  place: DirectoryPlace,
  t: TFunction,
): string {
  return [
    place.name.trim(),
    place.cat ? categoryLabel(t, place.cat) : "",
    ...whereLines(place, t),
  ]
    .filter(Boolean)
    .join("\n");
}

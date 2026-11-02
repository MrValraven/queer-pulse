import { isSellingOnline } from "../listBusiness/listingOnline.data";
import type { DirectoryView } from "../useDirectoryFilters";
import { cardDtoToPlace } from "./directory.adapters";
import type {
  DirectoryPartnerCardDTO,
  DirectoryPartnerPlace,
} from "./directoryPartners.api";

/** A partner card adapted the same way the grid adapts its cards, with the
 *  admin's note kept beside it. A payload without the note reads as null. */
export function partnerCardToPlace(
  dto: DirectoryPartnerCardDTO,
): DirectoryPartnerPlace {
  return { place: cardDtoToPlace(dto), note: dto.partnerNote ?? null };
}

/**
 * The partners a directory view shows: the List view shows all of them, the
 * Online view keeps the ones that sell online, and the Map view shows none.
 */
export function partnersForView(
  partners: readonly DirectoryPartnerPlace[],
  view: DirectoryView,
): DirectoryPartnerPlace[] {
  if (view === "map") return [];
  if (view === "online") {
    return partners.filter(({ place }) => isSellingOnline(place));
  }
  return [...partners];
}

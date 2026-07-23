import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { LANDLORDS } from "../landlords";
import { getLandlords } from "./landlord.api";
import { cardDtoToLandlordCard, type LandlordCard } from "./landlord.adapters";

/** Landlord board cards. Demo → the LANDLORDS fixture (as cards); live →
 * GET /landlords. Empty array is a valid live state. */
export function useLandlords() {
  const { demoMode } = useDemoMode();
  return useQuery<LandlordCard[]>({
    queryKey: ["landlords", demoMode],
    initialData: demoMode ? LANDLORDS.map(toCard) : undefined,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      if (demoMode) return LANDLORDS.map(toCard);
      const page = await getLandlords();
      return page.items.map(cardDtoToLandlordCard);
    },
  });
}

function toCard(landlord: (typeof LANDLORDS)[number]): LandlordCard {
  return {
    slug: landlord.slug,
    name: landlord.name,
    initials: landlord.initials,
    tint: landlord.tint,
    photo: landlord.photo,
    hood: landlord.hood,
    stars: landlord.stars,
    note: landlord.note,
  };
}

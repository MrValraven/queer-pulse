import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  createHousingListing,
  type CreateHousingListingBody,
  type HousingListingDTO,
} from "./housingListing.api";

/** POST /housing-listings. Demo keeps a short "sending…" beat with no network
 * (matches the prototype's success panel); live creates the listing (→ review). */
export function useSubmitHousingListing() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<HousingListingDTO | null, Error, CreateHousingListingBody>({
    mutationFn: async (body) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        return null;
      }
      return createHousingListing(body);
    },
    onSuccess: () => {
      if (!demoMode) {
        void queryClient.invalidateQueries({ queryKey: ["housing-listings"] });
      }
    },
  });
}

import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getLandlord as getLandlordFixture, type Landlord } from "../landlords";
import { getLandlord } from "./landlord.api";
import { landlordDetailToLandlord } from "./landlord.adapters";

export function useLandlord(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  return useQuery<Landlord | null>({
    queryKey: ["landlord", demoMode, slug],
    initialData:
      demoMode && slug ? (getLandlordFixture(slug) ?? null) : undefined,
    queryFn: async () => {
      if (!slug) return null;
      if (demoMode) return getLandlordFixture(slug) ?? null;
      return landlordDetailToLandlord(await getLandlord(slug));
    },
  });
}

import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
import { getListing, type HousingListing } from "../housingListings";
import { getHousingListing } from "./housingListing.api";
import { listingDtoToHousingListing } from "./housingListing.adapters";

const HOUSING_LISTING_KEY = "housing-listing";

/** A single listing by slug. Demo reads the fixture; live fetches the detail.
 * `listingRef` (backend `ref`, needed for enquiries) is carried separately —
 * demo has none, so enquiries fake-succeed there.
 *
 * `language` sits in the query key because the adapter resolves the listing's
 * fact labels and rent through `t`/`fmt`: switching language has to re-derive
 * the view-model, not hand back a cached English one. */
export function useHousingListing(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();
  return useQuery<{ listing: HousingListing; ref: string | null } | null>({
    queryKey: [HOUSING_LISTING_KEY, demoMode, slug, language],
    initialData: demoMode && slug ? wrapDemo(getListing(slug)) : undefined,
    queryFn: async () => {
      if (!slug) return null;
      if (demoMode) return wrapDemo(getListing(slug));
      const dto = await getHousingListing(slug);
      return { listing: listingDtoToHousingListing(dto, t, fmt), ref: dto.ref };
    },
  });
}

function wrapDemo(listing: HousingListing | undefined) {
  return listing ? { listing, ref: null } : null;
}

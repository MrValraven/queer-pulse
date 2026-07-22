import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { PROFILES, type Profile } from "../flatmates.data";
import { getFlatmateProfiles, type FlatmateFilters } from "./flatmateProfile.api";
import { flatmateDtoToProfile } from "./flatmateProfile.adapters";

const FLATMATE_PROFILES_KEY = "flatmate-profiles";

/** The flatmate board. Demo returns the PROFILES fixture (client-filtered by
 * the board); live queries the member-only, match-ranked directory. */
export function useFlatmateProfiles(filters: FlatmateFilters = {}) {
  const { demoMode } = useDemoMode();
  return useQuery<Profile[]>({
    queryKey: [FLATMATE_PROFILES_KEY, demoMode, filters],
    initialData: demoMode ? PROFILES : undefined,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      if (demoMode) return PROFILES;
      const page = await getFlatmateProfiles(filters);
      return page.items.map(flatmateDtoToProfile);
    },
  });
}

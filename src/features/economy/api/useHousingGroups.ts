import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { VETTED_GROUPS, type VettedGroup } from "../housingGroups.data";
import { getHousingGroups } from "./housingGroups.api";
import { groupDtoToVettedGroup } from "./housingGroups.adapters";

const HOUSING_GROUPS_KEY = "housing-groups";

/**
 * The vetted housing groups directory. Demo mode returns the colocated fixture
 * and never hits the network. Live mode starts empty in production, so an empty
 * array is an honest, expected result — the grid renders `GroupEmptyState`.
 */
export function useHousingGroups() {
  const { demoMode } = useDemoMode();
  return useQuery<VettedGroup[]>({
    queryKey: [HOUSING_GROUPS_KEY, demoMode],
    initialData: demoMode ? VETTED_GROUPS : undefined,
    queryFn: async () => {
      if (demoMode) return VETTED_GROUPS;
      const dtos = await getHousingGroups();
      return dtos.map(groupDtoToVettedGroup);
    },
  });
}

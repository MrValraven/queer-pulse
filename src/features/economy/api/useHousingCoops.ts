import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { FORMING_COOPS, type FormingCoop } from "../housingCoop.data";
import { getHousingCoops } from "./housingCoop.api";
import { coopDtoToFormingCoop } from "./housingCoop.adapters";

const HOUSING_COOPS_KEY = "housing-coops";

/**
 * Co-ops currently forming (or operational) for the "forming now" grid. Demo
 * mode returns the colocated fixture and never hits the network. Live mode
 * starts with zero co-ops in production, so an empty array is an honest,
 * expected result here — the grid renders `CoopEmptyState` for it rather
 * than treating it as a loading or error condition.
 *
 * `coopDtoToFormingCoop` composes plain display strings itself (no `t`/`fmt`
 * dependency, unlike `cardDtoToCommunity`), so `demoMode` is the only value
 * that needs to sit in the query key.
 */
export function useHousingCoops() {
  const { demoMode } = useDemoMode();
  return useQuery<FormingCoop[]>({
    queryKey: [HOUSING_COOPS_KEY, demoMode],
    initialData: demoMode ? FORMING_COOPS : undefined,
    queryFn: async () => {
      if (demoMode) return FORMING_COOPS;
      const dtos = await getHousingCoops();
      return dtos.map(coopDtoToFormingCoop);
    },
  });
}

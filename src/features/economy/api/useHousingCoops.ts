import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useFormat } from "../../../shared/i18n/format";
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
 * `coopDtoToFormingCoop` composes the card's phase line, meta labels and CTA
 * through `t`/`fmt`, so `language` sits in the query key alongside `demoMode`:
 * switching language has to re-derive the cards rather than hand back the ones
 * built in the previous language.
 */
export function useHousingCoops() {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const fmt = useFormat();
  return useQuery<FormingCoop[]>({
    queryKey: [HOUSING_COOPS_KEY, demoMode, language],
    initialData: demoMode ? FORMING_COOPS : undefined,
    queryFn: async () => {
      if (demoMode) return FORMING_COOPS;
      const dtos = await getHousingCoops();
      return dtos.map((dto) => coopDtoToFormingCoop(dto, t, fmt));
    },
  });
}

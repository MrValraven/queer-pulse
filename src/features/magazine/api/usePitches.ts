import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getPitches } from "./pieces.api";
import { pitchDtoToView } from "./pieces.adapters";
import { DEMO_PITCHES, type Pitch } from "../data/desk.data";

/**
 * Editor desk's pitch inbox. Demo mode reads the static mock; live mode
 * calls `GET /magazine/admin/pitches` and adapts the DTOs to the view
 * shape shared with demo mode.
 */
export function usePitches() {
  const { demoMode } = useDemoMode();
  const query = useQuery<Pitch[]>({
    queryKey: ["magazine-pitches", demoMode],
    queryFn: async () => {
      if (demoMode) {
        return DEMO_PITCHES;
      }

      const pitchDtos = await getPitches();
      return pitchDtos.map(pitchDtoToView);
    },
  });

  return {
    pitches: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

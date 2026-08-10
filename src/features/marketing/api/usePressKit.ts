import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getPressKitPublic,
  type PressContactDTO,
  type PressCoverageDTO,
  type PressKitFactDTO,
  type PressKitResponseDTO,
} from "../../admin/api/pressKit.api";
import { demoPressKit } from "../pressKit.demo.data";

export interface PressKitResult {
  facts: PressKitFactDTO[];
  coverage: PressCoverageDTO[];
  contacts: PressContactDTO[];
  isLoading: boolean;
}

/**
 * The public press kit's admin-managed data, dual-mode — mirrors
 * `useLandingFeaturesPublic`.
 *
 * - **Demo**: the fabricated fixtures reshaped to the public DTO
 *   (`demoPressKit()`), no network call. This is the only path that reaches the
 *   fictional coverage / spokespeople / figures.
 * - **Live**: `GET /press-kit` — the facts the backend derives from platform
 *   data plus whatever coverage / contacts the admin team has published. An
 *   empty section returns an empty array; callers render nothing rather than
 *   fabricate content.
 *
 * Every section calls this hook independently; react-query dedupes them by the
 * shared `queryKey`, so the three sections share a single fetch.
 */
export function usePressKit(): PressKitResult {
  const { demoMode } = useDemoMode();

  const query = useQuery<PressKitResponseDTO>({
    queryKey: ["press-kit", demoMode],
    queryFn: () =>
      demoMode ? Promise.resolve(demoPressKit()) : getPressKitPublic(),
  });

  return {
    facts: query.data?.facts ?? [],
    coverage: query.data?.coverage ?? [],
    contacts: query.data?.contacts ?? [],
    isLoading: query.isLoading,
  };
}

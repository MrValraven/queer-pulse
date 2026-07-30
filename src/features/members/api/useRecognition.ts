import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { getRecognition } from "./recognition.api";
import {
  emptyRecognition,
  recognitionToModel,
  type Recognition,
} from "./recognition.adapters";
import { demoRecognition } from "../recognition.demo";

export interface RecognitionState extends Recognition {
  /** True while the live query is in flight; always false in demo mode. */
  isLoading: boolean;
  /** True when the live fetch has errored; always false in demo mode. Callers
   *  should render an error state rather than the zeroed placeholder. */
  isError: boolean;
  /**
   * True once the returned model reflects trustworthy data: always in demo mode,
   * and in live mode only after the backend fetch has actually landed. While a
   * live fetch is pending or has errored this is false, so consumers can skeleton
   * (or show a loading/error state) rather than render a placeholder as if it
   * were the member's real level/badge/perk counts.
   */
  hasRealData: boolean;
}

/**
 * A member's Recognition (level, badges, perks). Demo returns the mock model;
 * live calls GET /me/recognition (own) or /profiles/:slug/recognition (other).
 * The returned model is always a full `Recognition` so field access never
 * throws — but in LIVE mode the stand-in while loading/on error is a ZEROED
 * model (`emptyRecognition`), never the demo fixtures, so no fictional
 * level/badges/perks ever leak into production. Callers gate on
 * `isLoading`/`isError`/`hasRealData` to present the right state. React Query
 * dedupes the fetch, so the many components that call this share one request.
 */
export function useRecognition(slug?: string): RecognitionState {
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const target = slug ?? user?.profile.slug;
  const { data, isPending, isError } = useQuery<Recognition>({
    queryKey: ["recognition", demoMode, target ?? "me"],
    queryFn: async () => {
      if (demoMode) return demoRecognition;
      return recognitionToModel(await getRecognition(target));
    },
  });
  // Demo mode always renders the mock model. Live mode renders real data once it
  // lands, and a zeroed placeholder (guarded by the flags below) meanwhile.
  const model = demoMode ? demoRecognition : (data ?? emptyRecognition);
  return {
    ...model,
    isLoading: !demoMode && isPending,
    isError: !demoMode && isError,
    hasRealData: demoMode || (!!data && !isError),
  };
}

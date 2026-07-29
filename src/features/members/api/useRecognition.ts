import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { getRecognition } from "./recognition.api";
import { recognitionToModel, type Recognition } from "./recognition.adapters";
import { demoRecognition } from "../recognition.demo";

export interface RecognitionState extends Recognition {
  /** True while the live query is in flight; always false in demo mode. */
  isLoading: boolean;
  /**
   * True once the returned model reflects trustworthy data: always in demo mode,
   * and in live mode only after the backend fetch has actually landed. While a
   * live fetch is pending or has errored this is false, so consumers can skeleton
   * rather than render the demo placeholder as if it were the member's real
   * level/badge/perk counts.
   */
  hasRealData: boolean;
}

/**
 * A member's Recognition (level, badges, perks). Demo returns the mock model;
 * live calls GET /me/recognition (own) or /profiles/:slug/recognition (other).
 * The returned model is always a full `Recognition` (the demo model stands in
 * while live data loads so field access never throws), but `hasRealData`/
 * `isLoading` let callers avoid presenting that placeholder as real. React Query
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
  return {
    ...(data ?? demoRecognition),
    isLoading: !demoMode && isPending,
    hasRealData: demoMode || (!!data && !isError),
  };
}

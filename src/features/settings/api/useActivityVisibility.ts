import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import {
  getActivityVisibility,
  setActivityVisibility,
  type ActivityVisibilityDTO,
} from "../../members/api/activityVisibility.api";
import { toActivityBand, type ActivityBand } from "../../members/activityBand";
import { DEMO_ACTIVITY_VISIBILITY } from "../../members/activityBand.data";

export interface ActivityVisibilityResult {
  /** The band the member currently shows, or `null` when there is none. */
  band: ActivityBand | null;
  /**
   * Whether the band is hidden from other members. THE SWITCH VALUE for a
   * "hide" label; a "show" label must invert it at its own call site, which is
   * why this stays named after the stored field rather than after a checkbox.
   */
  isHidden: boolean;
  /** Flip it. Saves immediately, and no-ops in demo mode. */
  setHidden: (isHiddenNext: boolean) => void;
  /** True while the live value is first loading. */
  isLoading: boolean;
  /** True while a flip is in flight. */
  isSaving: boolean;
  /** True when there is no backend to write to, so `setHidden` does nothing. */
  isDemoMode: boolean;
}

/**
 * The member's opt-out for the coarse "recently active" band (PRD-04).
 *
 * The switch shipped inside the profile's "Who sees what" sheet, which owned
 * its own query and mutation inline, while Settings offered an inert
 * coming-soon row for the same privacy concept. Two homes for one switch, one
 * of them a lie. This is that fetch lifted into one hook so both surfaces read
 * and write the same thing.
 *
 * It deliberately keeps `WhoSeesWhatActivity`'s exact query key,
 * `["activityVisibility", demoMode]`, so the two surfaces share one cache
 * entry: a flip on either is immediately true on the other, with no refetch
 * and no chance of them disagreeing.
 *
 * No copy lives in here. Both call sites toast in their own namespace, so the
 * profile sheet keeps its `members:` strings and Settings keeps its own.
 */
export function useActivityVisibility(options?: {
  onSaved?: () => void;
  onError?: () => void;
}): ActivityVisibilityResult {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery<ActivityVisibilityDTO>({
    queryKey: ["activityVisibility", demoMode],
    enabled: !demoMode && loggedIn,
    queryFn: getActivityVisibility,
  });
  const visibility = demoMode ? DEMO_ACTIVITY_VISIBILITY : query.data;

  const mutation = useMutation({
    mutationFn: setActivityVisibility,
    onSuccess: (next) => {
      queryClient.setQueryData(["activityVisibility", demoMode], next);
      options?.onSaved?.();
    },
    onError: () => options?.onError?.(),
  });

  return {
    band: toActivityBand(visibility?.band ?? null),
    isHidden: Boolean(visibility?.isHidden),
    setHidden: (isHiddenNext: boolean) => {
      if (demoMode) return;
      mutation.mutate(isHiddenNext);
    },
    isLoading: !demoMode && query.isLoading,
    isSaving: mutation.isPending,
    isDemoMode: demoMode,
  };
}

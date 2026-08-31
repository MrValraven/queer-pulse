import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getMyAppeals, type MemberAppealDTO } from "./appeals.api";

export const MY_APPEALS_KEY = "myAppeals";

export interface MyAppealsResult {
  /** The member's own appeals, most recent first. */
  appeals: MemberAppealDTO[];
  /** True while the first fetch is in flight (drives the loading skeleton). */
  isLoading: boolean;
  /** True when the fetch failed (drives the error state). */
  isError: boolean;
  /** Re-runs the failed fetch. A member checking whether their appeal was
   *  heard must be able to try again rather than be told they filed none. */
  refetch: () => void;
}

/**
 * The signed-in member's own appeals, most recent first — live-mode only.
 * `AppealOutcomePage` branches on demo mode *before* this hook is ever
 * reached: demo keeps its interactive pending/overturned/upheld toggle
 * showcase (see `appealPanels.data.tsx`), which never touches the network, so
 * there is no mock fallback to keep in step here. The `enabled: !demoMode`
 * guard is defence in depth against the hook ever being called while demo
 * mode is on (there is no `GET /appeals/me` to answer it in that world).
 */
export function useMyAppeals(): MyAppealsResult {
  const { demoMode } = useDemoMode();
  const query = useQuery<MemberAppealDTO[]>({
    queryKey: [MY_APPEALS_KEY],
    enabled: !demoMode,
    queryFn: getMyAppeals,
  });
  return {
    appeals: query.data ?? [],
    isLoading: !demoMode && query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

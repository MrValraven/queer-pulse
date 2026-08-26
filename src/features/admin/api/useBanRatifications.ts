import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { PENDING_RATIFICATIONS } from "../adminModeration.data";
import type { Ratification } from "../adminModeration.data";
import { decideBanRatification, getBanRatifications } from "./moderation.api";
import { banRatificationDtoToView } from "./moderation.adapters";
import { useDemoAwareMutation } from "./demoAwareMutation";

/**
 * The permanent bans one moderator has asked for and no second moderator has
 * confirmed yet (TS-12).
 *
 * A plain query rather than an infinite one: a healthy queue holds a handful of
 * holds at a time, each lapsing within 72 hours, and the server already caps
 * the read. If this list is ever long enough to need paging, that is a signal
 * about the team rather than about the component.
 */
export function useBanRatifications() {
  const { demoMode } = useDemoMode();
  const query = useQuery<Ratification[]>({
    queryKey: ["mod-ratifications", demoMode],
    queryFn: async () => {
      if (demoMode) return PENDING_RATIFICATIONS;
      const rows = await getBanRatifications("pending");
      return rows.map(banRatificationDtoToView);
    },
    initialData: demoMode ? PENDING_RATIFICATIONS : undefined,
  });

  return {
    ratifications: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

export interface DecideRatificationVars {
  id: string;
  decision: "ratify" | "decline";
  note?: string;
}

/**
 * The second signature, or the refusal.
 *
 * Deliberately NOT wrapped in the queue's deferred-commit Undo pattern, unlike
 * every report action. Undo exists so a mis-click does not reach the member;
 * here the mis-click IS the removal of an account, and the protection against
 * it is the thing this whole feature adds: a second person had to agree. A
 * confirmation dialog in front of an immediate write is the honest shape, and
 * the way back afterwards is `PATCH /mod/users/:userId/suspension`, which also
 * withdraws any hold behind it.
 *
 * Invalidates the reports queue as well: a ratified ban writes a `ban` audit row
 * against the hold's report, so the resolved tab's outcome changes underneath.
 */
export function useDecideRatification() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useDemoAwareMutation<void, Error, DecideRatificationVars>({
    demoMode,
    demoLatencyMs: 0,
    // The pane toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    demoResult: () => undefined,
    live: async ({ id, decision, note }) => {
      await decideBanRatification(id, { decision, note });
    },
    onLiveSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["mod-ratifications"] });
      void queryClient.invalidateQueries({ queryKey: ["mod-reports"] });
    },
  });
}

import { useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { VjLiveDTO, VjLiveStoppedDTO } from "../../../shared/contracts/vj";
import { useToast } from "../../../shared/components/feedback/useToast";
import type { TFunction } from "../../../shared/i18n/types";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useDemoAwareMutation } from "../../admin/api/demoAwareMutation";
import { stopVjLive, stopVjLiveConnection } from "../api/vj.api";
import { vjKeys } from "../api/vjKeys";
import { vjLiveCountLine } from "./vjLiveCounts";

/** The live list without one connection; a stage left empty leaves too. */
function withoutConnection(live: VjLiveDTO, connectionId: string): VjLiveDTO {
  const stages = live.stages
    .map((stage) => ({
      ...stage,
      connections: stage.connections.filter(
        (connection) => connection.connectionId !== connectionId,
      ),
    }))
    .filter((stage) => stage.connections.length > 0);
  return { ...live, stages };
}

/** What the list said just before Stop everything: whether a show was held. */
interface VjLiveStopContext {
  idleStageCountBefore: number;
}

/** The success line: the counts stopped, else whether a held show was
 *  cleared, else that nothing was running. */
function stoppedLineOf(
  t: TFunction,
  stopped: VjLiveStoppedDTO,
  idleStageCountBefore: number,
): string {
  const countLine = vjLiveCountLine(
    t,
    {
      screenCount: stopped.stoppedScreenCount,
      remoteCount: stopped.stoppedRemoteCount,
    },
    { bothKey: "vj:live.stopped.both", oneKey: "vj:live.stopped.one" },
  );
  if (countLine !== null) return countLine;
  return idleStageCountBefore > 0
    ? t("vj:live.stopped.none")
    : t("vj:live.stopped.nothingRunning");
}

/** Stops every screen and remote in scope; the list reads again after. The
 *  success toast lives here, so it shows even when the dialog is gone. */
export function useStopVjLive(): UseMutationResult<
  VjLiveStoppedDTO,
  Error,
  void,
  VjLiveStopContext
> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const liveKey = vjKeys.live(demoMode);
  return useDemoAwareMutation<VjLiveStoppedDTO, Error, void, VjLiveStopContext>(
    {
      demoMode,
      demoLatencyMs: 0,
      meta: { silentError: true },
      demoResult: async () => {
        const { demoStopVjLive } = await import("../demo/vjDemoLive");
        return demoStopVjLive();
      },
      live: () => stopVjLive(),
      onMutate: () => ({
        idleStageCountBefore:
          queryClient.getQueryData<VjLiveDTO>(liveKey)?.idleStageCount ?? 0,
      }),
      onSuccess: (stopped, _variables, context) => {
        queryClient.setQueryData<VjLiveDTO>(liveKey, {
          stages: [],
          idleStageCount: 0,
        });
        showToast(
          stoppedLineOf(t, stopped, context?.idleStageCountBefore ?? 0),
          "success",
        );
      },
      onSettled: () => {
        void queryClient.invalidateQueries({ queryKey: liveKey });
      },
    },
  );
}

/** Stops one screen or remote. Its row leaves at once on success, and on a
 *  refusal the list reads again, so a device already gone leaves too. */
export function useStopVjLiveConnection(): UseMutationResult<
  VjLiveStoppedDTO,
  Error,
  { connectionId: string }
> {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const liveKey = vjKeys.live(demoMode);
  return useDemoAwareMutation<
    VjLiveStoppedDTO,
    Error,
    { connectionId: string }
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: { silentError: true },
    demoResult: async ({ connectionId }) => {
      const { demoStopVjLiveConnection } = await import("../demo/vjDemoLive");
      return demoStopVjLiveConnection(connectionId);
    },
    live: ({ connectionId }) => stopVjLiveConnection(connectionId),
    onSuccess: (_stopped, { connectionId }) => {
      queryClient.setQueryData<VjLiveDTO>(liveKey, (live) =>
        live === undefined ? live : withoutConnection(live, connectionId),
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: liveKey });
    },
  });
}

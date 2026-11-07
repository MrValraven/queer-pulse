import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useCallback } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { VjSceneDTO } from "../../../shared/contracts/vj";
import { getVjScenes } from "./vj.api";
import { vjKeys } from "./vjKeys";
import { VJ_LIVE_STALE_MS } from "./useVjPacks";

/** Saved scenes of the library (contract 6.2 "Scenes", keys 9.3). The keys hold
 *  the demo flag only, so scene names never reach a query key. */

function compareScenesByPosition(
  firstScene: VjSceneDTO,
  secondScene: VjSceneDTO,
): number {
  if (firstScene.position !== secondScene.position)
    return firstScene.position - secondScene.position;
  return firstScene.id < secondScene.id ? -1 : 1;
}

function scenesInPositionOrder(scenes: readonly VjSceneDTO[]): VjSceneDTO[] {
  return [...scenes].sort(compareScenesByPosition);
}

/** The pack's scenes, then the scenes with no pack, each in position order. A
 *  null pack gives the unfiled scenes. */
export function selectVjScenesForPack(
  scenes: readonly VjSceneDTO[],
  packId: string | null,
): VjSceneDTO[] {
  const orderedScenes = scenesInPositionOrder(scenes);
  const unfiledScenes = orderedScenes.filter((scene) => scene.packId === null);
  if (packId === null) return unfiledScenes;
  const packScenes = orderedScenes.filter((scene) => scene.packId === packId);
  return [...packScenes, ...unfiledScenes];
}

/** Every scene in position order; with `packId` set (null included), the
 *  `selectVjScenesForPack` view of the same cache, so every caller shares one
 *  cache entry. */
export function useVjScenes(options?: {
  packId?: string | null;
  isEnabled?: boolean;
}): UseQueryResult<VjSceneDTO[], Error> {
  const { demoMode } = useDemoMode();
  const packId = options?.packId;
  const isPackView = packId !== undefined;
  const selectForPack = useCallback(
    (scenes: VjSceneDTO[]) => selectVjScenesForPack(scenes, packId ?? null),
    [packId],
  );
  return useQuery<VjSceneDTO[], Error, VjSceneDTO[]>({
    queryKey: vjKeys.scenes(demoMode),
    enabled: options?.isEnabled ?? true,
    staleTime: demoMode ? Number.POSITIVE_INFINITY : VJ_LIVE_STALE_MS,
    // Live reads again when the admin comes back to the tab (v1 call 15); demo
    // follows other tabs through `useVjDemoLibrarySync`.
    refetchOnWindowFocus: !demoMode,
    meta: { silentError: true },
    select: isPackView ? selectForPack : undefined,
    queryFn: async ({ signal }) => {
      if (demoMode) {
        const { demoGetVjScenes } = await import("../demo/vjDemoStore");
        return scenesInPositionOrder(demoGetVjScenes().items);
      }
      return scenesInPositionOrder((await getVjScenes(signal)).items);
    },
  });
}

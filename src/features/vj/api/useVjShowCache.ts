import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { VjSceneDTO, VjSetlistDTO } from "../../../shared/contracts/vj";
import { vjReasonOf } from "../vjErrors";
import { vjKeys } from "./vjKeys";

/** Where a scene or set list write's answer lands in the cache (keys 9.3), and
 *  what it leaves for a read to settle. Shared by the scene and the set list
 *  writes. Only ids and DTOs pass through here; nothing is logged. */
export interface VjShowCacheWriter {
  /** Replaces the cached scene with the same id, or appends it when new. */
  putScene: (scene: VjSceneDTO) => void;
  setScenes: (scenes: VjSceneDTO[]) => void;
  dropScene: (sceneId: string) => void;
  /** Replaces the cached set list with the same id, or appends it when new. */
  putSetlist: (setlist: VjSetlistDTO) => void;
  setSetlists: (setlists: VjSetlistDTO[]) => void;
  dropSetlist: (setlistId: string) => void;
  invalidateScenes: () => void;
  invalidateSetlists: () => void;
  /** A refusal that says a scene, set list, pack or clip is gone reads scenes
   *  and set lists again (and clips for VJ_SCENE_CLIP_NOT_FOUND, packs for
   *  VJ_PACK_NOT_FOUND), so the stale row leaves the screen. */
  invalidateOnMissing: (cause: unknown) => void;
}

function putById<Row extends { id: string }>(
  rows: Row[] | undefined,
  row: Row,
): Row[] | undefined {
  if (rows === undefined) return rows;
  const hasRow = rows.some((cached) => cached.id === row.id);
  return hasRow
    ? rows.map((cached) => (cached.id === row.id ? row : cached))
    : [...rows, row];
}

function dropById<Row extends { id: string }>(
  rows: Row[] | undefined,
  rowId: string,
): Row[] | undefined {
  return rows?.filter((cached) => cached.id !== rowId);
}

export function useVjShowCacheWriter(): VjShowCacheWriter {
  const queryClient = useQueryClient();
  const { demoMode } = useDemoMode();
  return useMemo<VjShowCacheWriter>(() => {
    const invalidateKey = (queryKey: readonly unknown[]): void => {
      void queryClient.invalidateQueries({ queryKey });
    };
    return {
      putScene: (scene) => {
        queryClient.setQueryData<VjSceneDTO[]>(
          vjKeys.scenes(demoMode),
          (scenes) => putById(scenes, scene),
        );
      },
      setScenes: (scenes) => {
        queryClient.setQueryData(vjKeys.scenes(demoMode), scenes);
      },
      dropScene: (sceneId) => {
        queryClient.setQueryData<VjSceneDTO[]>(
          vjKeys.scenes(demoMode),
          (scenes) => dropById(scenes, sceneId),
        );
      },
      putSetlist: (setlist) => {
        queryClient.setQueryData<VjSetlistDTO[]>(
          vjKeys.setlists(demoMode),
          (setlists) => putById(setlists, setlist),
        );
      },
      setSetlists: (setlists) => {
        queryClient.setQueryData(vjKeys.setlists(demoMode), setlists);
      },
      dropSetlist: (setlistId) => {
        queryClient.setQueryData<VjSetlistDTO[]>(
          vjKeys.setlists(demoMode),
          (setlists) => dropById(setlists, setlistId),
        );
      },
      invalidateScenes: () => {
        invalidateKey(vjKeys.scenes(demoMode));
      },
      invalidateSetlists: () => {
        invalidateKey(vjKeys.setlists(demoMode));
      },
      invalidateOnMissing: (cause) => {
        const reason = vjReasonOf(cause);
        if (
          reason !== "VJ_SCENE_NOT_FOUND" &&
          reason !== "VJ_SETLIST_NOT_FOUND" &&
          reason !== "VJ_PACK_NOT_FOUND" &&
          reason !== "VJ_SCENE_CLIP_NOT_FOUND"
        ) {
          return;
        }
        invalidateKey(vjKeys.scenes(demoMode));
        invalidateKey(vjKeys.setlists(demoMode));
        if (reason === "VJ_SCENE_CLIP_NOT_FOUND") {
          invalidateKey(vjKeys.clips(demoMode));
        }
        if (reason === "VJ_PACK_NOT_FOUND") {
          invalidateKey(vjKeys.packs(demoMode));
        }
      },
    };
  }, [queryClient, demoMode]);
}

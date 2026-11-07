/**
 * The source clips of the active set list's scenes, in set list order
 * (contract 9.1 cache retention), so a scene recall starts from a cached
 * clip. Both library lists load only while a set list is active.
 */
import { useMemo, useState } from "react";
import { useVjScenes } from "../api/useVjScenes";
import { useVjSetlists } from "../api/useVjSetlists";
import { vjSceneClipIds } from "./vjRetainedClips";

const NO_CLIP_IDS: readonly string[] = [];

function isSameClipIdList(
  first: readonly string[],
  second: readonly string[],
): boolean {
  return (
    first.length === second.length &&
    first.every((clipId, clipIndex) => clipId === second[clipIndex])
  );
}

export function useVjScreenSetlistClips(
  activeSetlistId: string | null,
): readonly string[] {
  const isEnabled = activeSetlistId !== null;
  const setlists = useVjSetlists({ isEnabled }).data;
  const scenes = useVjScenes({ isEnabled }).data;

  const nextClipIds = useMemo(() => {
    if (activeSetlistId === null || setlists === undefined) return NO_CLIP_IDS;
    if (scenes === undefined) return NO_CLIP_IDS;
    const setlist = setlists.find((each) => each.id === activeSetlistId);
    if (setlist === undefined) return NO_CLIP_IDS;
    const sceneIds = [...setlist.items]
      .sort((first, second) => first.position - second.position)
      .map((item) => item.sceneId);
    return vjSceneClipIds(scenes, sceneIds);
  }, [activeSetlistId, setlists, scenes]);

  // The same ids keep the same list, so the retention set stays memoised.
  const [stableClipIds, setStableClipIds] = useState(nextClipIds);
  if (isSameClipIdList(stableClipIds, nextClipIds)) return stableClipIds;
  setStableClipIds(nextClipIds);
  return nextClipIds;
}

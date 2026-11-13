/**
 * Every clip the active set list names (sequences contract 6.1): clip steps,
 * scene sources and scene mix clips, each once, starting at the step after
 * `setlistIndex` and wrapping round, so the next step's clip is fetched
 * first and a timer advance lands on a cached clip. An armed set list
 * (index null) starts at its first step. Both library lists load only while
 * a set list is active; clip steps count before the scenes arrive.
 */
import { useMemo, useState } from "react";
import type { VjSceneDTO } from "../../../shared/contracts/vj";
import { useVjScenes } from "../api/useVjScenes";
import { useVjSetlists } from "../api/useVjSetlists";
import { vjSetlistClipIds } from "./vjRetainedClips";

const NO_CLIP_IDS: readonly string[] = [];
const NO_SCENES: readonly VjSceneDTO[] = [];

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
  setlistIndex: number | null,
): readonly string[] {
  const isEnabled = activeSetlistId !== null;
  const setlists = useVjSetlists({ isEnabled }).data;
  const scenes = useVjScenes({ isEnabled }).data;

  const nextClipIds = useMemo(() => {
    if (activeSetlistId === null || setlists === undefined) return NO_CLIP_IDS;
    const setlist = setlists.find((each) => each.id === activeSetlistId);
    if (setlist === undefined) return NO_CLIP_IDS;
    const startIndex = setlistIndex === null ? 0 : setlistIndex + 1;
    return vjSetlistClipIds(setlist.items, scenes ?? NO_SCENES, startIndex);
  }, [activeSetlistId, setlistIndex, setlists, scenes]);

  // The same ids keep the same list, so the retention set stays memoised.
  const [stableClipIds, setStableClipIds] = useState(nextClipIds);
  if (isSameClipIdList(stableClipIds, nextClipIds)) return stableClipIds;
  setStableClipIds(nextClipIds);
  return nextClipIds;
}

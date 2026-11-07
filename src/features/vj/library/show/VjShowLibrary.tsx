import { useMemo } from "react";
import type { VjClipDTO, VjPackDTO } from "../../../../shared/contracts/vj";
import { useVjClips } from "../../api/useVjClips";
import { VjScenePanel } from "./VjScenePanel";
import { VjSetlistPanel } from "./VjSetlistPanel";
import css from "./VjShowLibrary.module.css";

/**
 * The Scenes and set lists section of the library (`?view=show`). Both are
 * library wide, so they sit outside the pack rail: two columns from 880px
 * of frame width, one column below with Scenes first. The clip list feeds
 * the scene and set list thumbnails.
 */
export function VjShowLibrary({ packs }: { packs: readonly VjPackDTO[] }) {
  const clipsQuery = useVjClips();
  const clips = clipsQuery.data;
  const clipsById = useMemo(
    () =>
      new Map<string, VjClipDTO>((clips ?? []).map((clip) => [clip.id, clip])),
    [clips],
  );

  return (
    <div className={css.frame}>
      <div className={css.columns}>
        <VjScenePanel packs={packs} clipsById={clipsById} />
        <VjSetlistPanel clipsById={clipsById} />
      </div>
    </div>
  );
}

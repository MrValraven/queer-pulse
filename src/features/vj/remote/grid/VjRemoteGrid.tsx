import { useCallback, useMemo, useRef, type JSX } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import {
  VJ_GENERATOR_IDS,
  type VjClipDTO,
  type VjGeneratorId,
} from "../../../../shared/contracts/vj";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { filterVjClips } from "../rules/vjClipSearch";
import type { VjGridSource } from "../top/VjRemoteTopRow";
import { VjGeneratorTile } from "./VjGeneratorTile";
import { VjGridItem } from "./VjGridItem";
import { VjGridList } from "./VjGridList";
import { VjGridSearch } from "./VjGridSearch";
import { VjRemoteTile, type VjTileState } from "./VjRemoteTile";
import { VJ_GRID_ITEM_ATTRIBUTE, useVjGridFocus } from "./useVjGridFocus";
import styles from "./VjGrid.module.css";

export type { VjTileState } from "./VjRemoteTile";

/** The app's base duration (--dur-base) and ease-out (--ease-out). */
const VJ_EMPTY_TRANSITION = {
  duration: 0.25,
  ease: [0.16, 1, 0.3, 1] as const,
};

export interface VjRemoteGridSearch {
  isOpen: boolean;
  query: string;
  onQuery: (query: string) => void;
  onClose: () => void;
}

export interface VjRemoteGridProps {
  source: VjGridSource;
  /** The active pack's id: a change crossfades the whole grid to the new pack. */
  packKey?: string | null;
  clips: readonly VjClipDTO[];
  tileStateOf: (clipId: string) => VjTileState;
  liveGeneratorId: VjGeneratorId | null;
  liveGeneratorVariant: string | null;
  isCueMode: boolean;
  isBlocked: boolean;
  blockedReasonId?: string;
  /** The `vj:` key of the line shown when there are no clips at all. */
  emptyKey: string | null;
  emptyValues?: Record<string, string>;
  search: VjRemoteGridSearch;
  onTapClip: (clipId: string, index: number) => void;
  onToggleFavorite: (clipId: string, isFavorite: boolean) => void;
  /** Opens the sheet of clips that couldn't load, on the tapped badge's clip. */
  onShowClipFailure: (clipId: string) => void;
  onGoGenerator: (generatorId: VjGeneratorId, variant: string | null) => void;
  /** Whether a generator's send waits for its ack, for the tile's pending ring. */
  generatorIsPending?: (generatorId: VjGeneratorId) => boolean;
}

/** The line shown where the grid would be: a search miss or the caller's empty line. */
function useVjGridEmptyLine(
  props: VjRemoteGridProps,
  visibleClips: readonly VjClipDTO[],
): string | null {
  const { t } = useTranslation();
  if (props.source !== "pack" || visibleClips.length > 0) return null;
  const trimmedQuery = props.search.query.trim();
  if (props.search.isOpen && trimmedQuery !== "" && props.clips.length > 0) {
    return t("vj:grid.searchEmpty", { query: trimmedQuery });
  }
  return props.emptyKey === null ? null : t(props.emptyKey, props.emptyValues);
}

/**
 * The clip grid: three columns of 114px square tiles on a 390px phone and
 * more where the width allows. It shows the active pack's clips (filtered by
 * the open search) or the five generators. The grid is one tab stop and the
 * arrow keys move between tiles. A pack or source switch crossfades the
 * whole grid; inside one pack, tiles fade in and out as the search filters
 * them and the others glide to their new cells. The empty or search-miss line
 * fades in where the grid would be.
 */
export function VjRemoteGrid(props: VjRemoteGridProps): JSX.Element {
  const { source, clips, search, isBlocked, blockedReasonId } = props;
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  // The stage stays mounted while the lists inside it swap, so the arrow
  // keys keep one listener across a pack switch.
  const gridStageRef = useRef<HTMLDivElement>(null);
  const isPackSource = source === "pack";
  const gridKey = isPackSource ? `pack:${props.packKey ?? ""}` : "generators";
  const isSearchOpen = isPackSource && search.isOpen;
  const visibleClips = useMemo(
    () =>
      isSearchOpen
        ? filterVjClips(clips, search.query, { isFavoritesOnly: false })
        : [...clips],
    [clips, isSearchOpen, search.query],
  );
  const itemCount = isPackSource
    ? visibleClips.length
    : VJ_GENERATOR_IDS.length;
  const { tabIndexOf } = useVjGridFocus(gridStageRef, itemCount);
  const emptyLine = useVjGridEmptyLine(props, visibleClips);
  const { onClose: closeSearch } = search;

  // Escape takes the focus back to the grid's tab stop, so it is never lost.
  // Tiles on their way out are inert, so the stop is the first one outside.
  const closeSearchToGrid = useCallback(() => {
    const tabStops = gridStageRef.current?.querySelectorAll<HTMLElement>(
      `[${VJ_GRID_ITEM_ATTRIBUTE}][tabindex="0"]`,
    );
    Array.from(tabStops ?? [])
      .find((tabStop) => tabStop.closest("[inert]") === null)
      ?.focus({ preventScroll: true });
    closeSearch();
  }, [closeSearch]);

  return (
    <div className={styles.root} data-vj-remote-grid="" data-source={source}>
      <VjGridSearch
        isOpen={isSearchOpen}
        query={search.query}
        onQuery={search.onQuery}
        onClose={closeSearchToGrid}
      />
      <div role="status" className={styles.emptyRegion}>
        <AnimatePresence initial={false} mode="wait">
          {emptyLine !== null ? (
            <m.p
              key={emptyLine}
              className={styles.emptyLine}
              data-vj-grid-empty=""
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reducedMotion ? { duration: 0 } : VJ_EMPTY_TRANSITION}
            >
              {emptyLine}
            </m.p>
          ) : null}
        </AnimatePresence>
      </div>
      <div ref={gridStageRef} className={styles.gridStage}>
        <AnimatePresence initial={false} mode="popLayout">
          <VjGridList key={gridKey} label={t("vj:grid.label")}>
            {isPackSource
              ? visibleClips.map((clip, clipIndex) => (
                  <VjGridItem key={clip.id}>
                    <VjRemoteTile
                      clip={clip}
                      index={clipIndex}
                      state={props.tileStateOf(clip.id)}
                      isCueMode={props.isCueMode}
                      isBlocked={isBlocked}
                      blockedReasonId={blockedReasonId}
                      tabIndex={tabIndexOf(clipIndex)}
                      onTapClip={props.onTapClip}
                      onToggleFavorite={props.onToggleFavorite}
                      onShowFailure={props.onShowClipFailure}
                    />
                  </VjGridItem>
                ))
              : VJ_GENERATOR_IDS.map((generatorId, generatorIndex) => (
                  <VjGridItem key={generatorId}>
                    <VjGeneratorTile
                      generatorId={generatorId}
                      isLive={props.liveGeneratorId === generatorId}
                      isPending={
                        props.generatorIsPending?.(generatorId) ?? false
                      }
                      liveVariant={props.liveGeneratorVariant}
                      isBlocked={isBlocked}
                      blockedReasonId={blockedReasonId}
                      tabIndex={tabIndexOf(generatorIndex)}
                      onGoGenerator={props.onGoGenerator}
                    />
                  </VjGridItem>
                ))}
          </VjGridList>
        </AnimatePresence>
      </div>
    </div>
  );
}

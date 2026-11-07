import { useCallback, useMemo, useRef, type JSX } from "react";
import { AnimatePresence, m } from "motion/react";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { CollapseListItem } from "../../../../shared/components/ui/CollapseListItem";
import {
  VJ_GENERATOR_IDS,
  type VjClipDTO,
  type VjGeneratorId,
} from "../../../../shared/contracts/vj";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { filterVjClips } from "../rules/vjClipSearch";
import type { VjGridSource } from "../top/VjRemoteTopRow";
import { VjGeneratorTile } from "./VjGeneratorTile";
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
 * arrow keys move between tiles. Tiles fold in and out as the list changes,
 * and the empty or search-miss line fades in where the grid would be.
 */
export function VjRemoteGrid(props: VjRemoteGridProps): JSX.Element {
  const { source, clips, search, isBlocked, blockedReasonId } = props;
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const gridRef = useRef<HTMLUListElement>(null);
  const isPackSource = source === "pack";
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
  const { tabIndexOf } = useVjGridFocus(gridRef, itemCount);
  const emptyLine = useVjGridEmptyLine(props, visibleClips);
  const { onClose: closeSearch } = search;

  // Escape takes the focus back to the grid's tab stop, so it is never lost.
  const closeSearchToGrid = useCallback(() => {
    gridRef.current
      ?.querySelector<HTMLElement>(`[${VJ_GRID_ITEM_ATTRIBUTE}][tabindex="0"]`)
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
      <ul ref={gridRef} className={styles.grid} aria-label={t("vj:grid.label")}>
        <AnimatePresence initial={false}>
          {isPackSource
            ? visibleClips.map((clip, clipIndex) => (
                <CollapseListItem key={clip.id}>
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
                  />
                </CollapseListItem>
              ))
            : VJ_GENERATOR_IDS.map((generatorId, generatorIndex) => (
                <CollapseListItem key={generatorId}>
                  <VjGeneratorTile
                    generatorId={generatorId}
                    isLive={props.liveGeneratorId === generatorId}
                    isPending={props.generatorIsPending?.(generatorId) ?? false}
                    liveVariant={props.liveGeneratorVariant}
                    isBlocked={isBlocked}
                    blockedReasonId={blockedReasonId}
                    tabIndex={tabIndexOf(generatorIndex)}
                    onGoGenerator={props.onGoGenerator}
                  />
                </CollapseListItem>
              ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

/**
 * The library the remote reads (plan R26, moved out of the v1 page): the
 * packs, the active pack's clips, the grid's shown clips (favorites and
 * search together), every clip the page names by id, pack readiness across
 * the screens and the lead screen's next clip. The active pack follows the
 * newest received state; the live and mix clips follow the applied state
 * (`stage.state`), so the mirror names what the screens show now. Each
 * `library:changed` the stage passes on marks the library stale.
 */
import { useCallback, useEffect, useMemo } from "react";
import type {
  VjClipDTO,
  VjPackDTO,
  VjStageState,
} from "../../../../shared/contracts/vj";
import { useInvalidateVjLibrary } from "../../api/useInvalidateVjLibrary";
import { useVjClips } from "../../api/useVjClips";
import { useVjPackClips } from "../../api/useVjPackClips";
import { useVjPacks } from "../../api/useVjPacks";
import type { VjStageController } from "../../live/useVjStage";
import { filterVjClips, isVjSearchAvailable } from "../rules/vjClipSearch";
import {
  vjPackReadinessOf,
  type VjPackReadiness,
} from "../rules/vjPackReadiness";

const NO_PACKS: readonly VjPackDTO[] = [];
const NO_CLIPS: readonly VjClipDTO[] = [];

export interface VjRemoteLibraryOptions {
  searchQuery: string;
  isFavoritesOnly: boolean;
}

export interface VjRemoteLibrary {
  packs: readonly VjPackDTO[];
  hasLoadedPacks: boolean;
  activePackId: string | null;
  activePack: VjPackDTO | null;
  packClips: readonly VjClipDTO[];
  /** The grid's shown order: the pack's clips through favorites and search. */
  visibleClips: readonly VjClipDTO[];
  hasLoadedPackClips: boolean;
  /** The pack's clips plus, once loaded, every library clip. */
  clipsById: ReadonlyMap<string, VjClipDTO>;
  /** The clip the screens show now (`stage.state.liveClipId`). */
  liveClip: VjClipDTO | null;
  /** The mix clip the screens show now (`stage.state.mix.clipId`). */
  mixClip: VjClipDTO | null;
  readinessOf: (packId: string) => VjPackReadiness;
  isSearchAvailable: boolean;
  /** The connected lead screen's shuffle pick; null without one. */
  leadNextClipId: string | null;
}

/** Every clip id the page shows outside the grid: live, mix and history. */
export function vjRemoteNamedClipIds(
  shownState: VjStageState | null,
  latestState: VjStageState | null,
): string[] {
  const clipIds: string[] = [];
  for (const state of [shownState, latestState]) {
    if (state === null) continue;
    if (state.liveClipId !== null) clipIds.push(state.liveClipId);
    if (state.mix.clipId !== null) clipIds.push(state.mix.clipId);
  }
  clipIds.push(...(latestState?.recentClipIds ?? []));
  return clipIds;
}

export function useVjRemoteLibrary(
  stage: VjStageController,
  options: VjRemoteLibraryOptions,
): VjRemoteLibrary {
  const { searchQuery, isFavoritesOnly } = options;
  const { screens, subscribeLibrary } = stage;
  const shownState = stage.state;
  const latestState = stage.latestState;
  const packsQuery = useVjPacks();
  const packs = packsQuery.data ?? NO_PACKS;
  const activePackId = latestState?.activePackId ?? null;
  const packClipsQuery = useVjPackClips(activePackId);
  const packClips = packClipsQuery.data?.items ?? NO_CLIPS;
  const hasLoadedPackClips = packClipsQuery.data !== undefined;

  const packClipIds = useMemo(
    () => packClips.map((clip) => clip.id),
    [packClips],
  );
  const packClipIdSet = useMemo(() => new Set(packClipIds), [packClipIds]);
  // Wait for the pack's clips first, so a loading pack fetches nothing extra.
  const isLibraryNeeded =
    (activePackId === null || hasLoadedPackClips) &&
    vjRemoteNamedClipIds(shownState, latestState).some(
      (clipId) => !packClipIdSet.has(clipId),
    );
  const libraryClipsQuery = useVjClips({ isEnabled: isLibraryNeeded });
  const libraryClips = libraryClipsQuery.data;

  const invalidateLibrary = useInvalidateVjLibrary();
  useEffect(
    () => subscribeLibrary(invalidateLibrary),
    [subscribeLibrary, invalidateLibrary],
  );

  const clipsById = useMemo(() => {
    const byId = new Map<string, VjClipDTO>();
    for (const clip of libraryClips ?? NO_CLIPS) byId.set(clip.id, clip);
    for (const clip of packClips) byId.set(clip.id, clip);
    return byId;
  }, [libraryClips, packClips]);

  const visibleClips = useMemo(
    () => filterVjClips(packClips, searchQuery, { isFavoritesOnly }),
    [packClips, searchQuery, isFavoritesOnly],
  );

  const readinessOf = useCallback(
    (packId: string): VjPackReadiness => {
      const pack = packs.find((candidate) => candidate.id === packId);
      const isLoadedActivePack = packId === activePackId && hasLoadedPackClips;
      return vjPackReadinessOf(
        screens,
        { id: packId, clipCount: pack?.clipCount ?? 0 },
        isLoadedActivePack ? packClipIds : null,
      );
    },
    [packs, activePackId, hasLoadedPackClips, screens, packClipIds],
  );

  const clipOf = (clipId: string | null | undefined): VjClipDTO | null =>
    clipId === null || clipId === undefined
      ? null
      : (clipsById.get(clipId) ?? null);
  const activePack =
    packs.find((pack) => pack.id === activePackId) ??
    (activePackId === null ? null : (packClipsQuery.data?.pack ?? null));
  const leadScreen = screens.find(
    (screen) => screen.isConnected && screen.isLead,
  );

  return {
    packs,
    hasLoadedPacks: packsQuery.data !== undefined,
    activePackId,
    activePack,
    packClips,
    visibleClips,
    hasLoadedPackClips,
    clipsById,
    liveClip: clipOf(shownState?.liveClipId),
    mixClip: clipOf(shownState?.mix.clipId),
    readinessOf,
    isSearchAvailable: isVjSearchAvailable(packClips.length),
    leadNextClipId: leadScreen?.nextClipId ?? null,
  };
}

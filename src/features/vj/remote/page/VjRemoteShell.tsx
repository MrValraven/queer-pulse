/**
 * The remote's page frame (plan R27): the dark stage page, the sticky header
 * (top row and mirror band), the strips and the clip grid. Phone layout is
 * one column with the dock fixed under it; split layout puts the dock in a
 * second column beside them (VjRemoteLayout.module.css). Each band reads
 * what it needs from the session the page assembles: controls read
 * `stage.latestState`, the mirror reads the applied frames.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type CSSProperties,
  type JSX,
  type ReactNode,
} from "react";
import { AnimatePresence } from "motion/react";
import {
  vjSceneLookOf,
  type VjClipDTO,
  type VjSetlistDTO,
  type VjStageState,
} from "../../../../shared/contracts/vj";
import { MAIN_CONTENT_ID } from "../../../../shared/components/layout/SkipToContentLink";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { PageMeta } from "../../../../shared/seo/PageMeta";
import { QuizshowBackdrop } from "../../../quizshow/stage/QuizshowBackdrop";
import { useMotionPrefs } from "../../../../app/providers/motionPrefs";
import { useVjClips } from "../../api/useVjClips";
import { useVjPackEvent } from "../../api/useVjPackEvent";
import { useVjSceneMutations } from "../../api/useVjSceneMutations";
import { useVjScenes } from "../../api/useVjScenes";
import { useVjSetlists } from "../../api/useVjSetlists";
import { vjErrorKeyOf } from "../../vjErrors";
import { vjClipReadinessOf } from "../../live/vjScreensSummary";
import type { VjStageController } from "../../live/useVjStage";
import type { VjErrorValues } from "../../live/vjStageCommands";
import { VjClipFailureSummary } from "../failures/VjClipFailureSummary";
import { VjClipFailuresSheet } from "../failures/VjClipFailuresSheet";
import { useVjClipFailures } from "../failures/useVjClipFailures";
import { VjGridHelpLegend } from "../grid/VjGridHelpLegend";
import { VjRemoteGrid, type VjTileState } from "../grid/VjRemoteGrid";
import type { VjCueMode } from "../hooks/useVjCueMode";
import type { VjDockPads } from "../hooks/useVjDockPads";
import type { VjFlashConsent } from "../hooks/useVjFlashConsent";
import type { VjMirrorFrames } from "../hooks/useVjMirrorFrames";
import {
  useVjHelpCaptions,
  VjHelpCaptionsProvider,
} from "../hooks/useVjHelpCaptions";
import { useVjSyncedNow } from "../hooks/useVjSyncedNow";
import type { VjRemoteClock } from "../hooks/useVjRemoteClock";
import type { VjRemoteLayout } from "../hooks/useVjRemoteLayout";
import type { UseVjMidiResult } from "../midi/useVjMidi";
import type { UseVjMidiMappingsResult } from "../midi/useVjMidiMappings";
import { VjMirrorBand } from "../mirror/VjMirrorBand";
import {
  isVjMirrorRingCounting,
  vjMirrorRingOf,
  type VjMirrorRing,
} from "../rules/vjMirrorRing";
import { vjNextUpOf, type VjNextUp } from "../rules/vjNextUp";
import {
  VJ_SETLIST_STEP_GONE_KEYS,
  vjSetlistFlashingIndexOf,
  vjSetlistStepNameOf,
} from "../rules/vjSetlistPlayback";
import {
  vjMirrorRingWithinStep,
  type VjMirrorSequenceStatus,
} from "../mirror/vjMirrorStyle";
import { VjStrips } from "../strips/VjStrips";
import { useVjPackSwitch } from "../top/useVjPackSwitch";
import { VjPackSwitchConfirm } from "../top/VjPackSwitchConfirm";
import { VjRemoteTopRow, type VjGridSource } from "../top/VjRemoteTopRow";
import type { VjCommandName, VjRun } from "../useVjCommandRunner";
import type { VjRemoteOfflineReason } from "../vjRemoteOffline";
import { useVjSceneRecall, type VjRemoteActions } from "./useVjRemoteActions";
import type { VjRemoteLibrary } from "./useVjRemoteLibrary";
import type { VjRemoteSheets } from "./useVjRemoteSheets";
import { useVjGridTop } from "./useVjGridTop";
import styles from "./VjRemoteLayout.module.css";

/** The grid's own view state: which source, favorites only and the search. */
export interface VjRemoteView {
  gridSource: VjGridSource;
  setGridSource: (source: VjGridSource) => void;
  isFavoritesOnly: boolean;
  toggleFavoritesOnly: () => void;
  isSearchOpen: boolean;
  toggleSearch: () => void;
  closeSearch: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

/** Everything the shell, the dock and the sheets host read, assembled once by the page. */
export interface VjRemoteSession {
  stage: VjStageController;
  /** `stage.latestState`: every control reads it. */
  latestState: VjStageState | null;
  stateRevision: number | null;
  run: VjRun;
  /** The command runner's own pending check: a control holds while its command waits for the ack. */
  isCommandPending: (name: VjCommandName) => boolean;
  clock: VjRemoteClock;
  frames: VjMirrorFrames;
  layout: VjRemoteLayout;
  library: VjRemoteLibrary;
  actions: VjRemoteActions;
  cue: VjCueMode;
  dockPads: VjDockPads;
  flashConsent: VjFlashConsent;
  sheets: VjRemoteSheets;
  view: VjRemoteView;
  midi: UseVjMidiResult;
  midiMappings: UseVjMidiMappingsResult;
  onStartLearn: () => void;
  isBlocked: boolean;
  /** The status line's id while blocked, for every blocked control's aria-describedby. */
  blockedReasonId: string | undefined;
  statusLineId: string;
  offlineReason: VjRemoteOfflineReason | null;
  /** The newest refusal's copy key for the status line; null when none holds. */
  errorKey: string | null;
  /** The {max} or {min} `errorKey` interpolates; null when it takes none. */
  errorValues: VjErrorValues | null;
  /** A new object for each refusal the dispatcher named; null when none holds. */
  refusalStamp: object | null;
  onRefused: (errorKey: string | null) => void;
}

interface VjRemoteBandProps {
  session: VjRemoteSession;
}

/**
 * What the scenes sheet's sequence section reads from the page: the
 * sequence actions (every Play, Resume and step asks the flash warning
 * through them), the clips by id (a clip step's title, Add live clip),
 * which commands wait for their ack and the refusal the dock's status line
 * names, so the sheet can name it beside the control that was pressed.
 * The shell provides it around the sheets host, the same way the help
 * captions reach the sheets.
 */
export interface VjRemoteSetlistControls {
  actions: Pick<
    VjRemoteActions,
    "setlist" | "setlistLoopIsOn" | "isSetlistLoopPending"
  >;
  clipsById: ReadonlyMap<string, VjClipDTO>;
  isCommandPending: (name: VjCommandName) => boolean;
  /** The synced clock, so the active controls can count a playing step down. */
  clock: VjRemoteClock;
  /** The status line's refusal copy key; null when none holds. */
  errorKey: string | null;
  errorValues: VjErrorValues | null;
  /**
   * A new object for each refusal the dispatcher named, null when none
   * holds: a row compares it with the one it saw at its press, so a refusal
   * already standing before the press never shows under it.
   */
  refusalStamp: object | null;
}

export const VjRemoteSetlistContext =
  createContext<VjRemoteSetlistControls | null>(null);

/** The sequence controls; only the remote's shell provides them. */
export function useVjRemoteSetlistControls(): VjRemoteSetlistControls {
  const controls = useContext(VjRemoteSetlistContext);
  if (controls === null) {
    throw new Error(
      "useVjRemoteSetlistControls needs the remote shell's VjRemoteSetlistContext",
    );
  }
  return controls;
}

const NO_RING: VjMirrorRing = { kind: "none" };
const NO_NEXT_UP: VjNextUp = { kind: "none" };

/**
 * The next-up line's title: the cued or shuffle clip's title, or the next
 * step's scene name or clip title. A step whose scene or clip left the
 * library reads as gone.
 */
function useVjNextUpTitle(nextUp: VjNextUp, session: VjRemoteSession) {
  const { t } = useTranslation();
  const isSetlistNext = nextUp.kind === "setlist";
  const scenesQuery = useVjScenes({ isEnabled: isSetlistNext });
  const scenesById = useMemo(
    () => new Map((scenesQuery.data ?? []).map((scene) => [scene.id, scene])),
    [scenesQuery.data],
  );
  const { clipsById: shownClipsById } = session.library;
  // A clip step outside the active pack reads its title from the library.
  const nextClipId =
    nextUp.kind === "setlist" && nextUp.item.kind === "clip"
      ? nextUp.item.clipId
      : null;
  const isLibraryClipNeeded =
    nextClipId !== null && !shownClipsById.has(nextClipId);
  const libraryClipsQuery = useVjClips({ isEnabled: isLibraryClipNeeded });
  const clipsById = useMemo(
    () =>
      isLibraryClipNeeded && libraryClipsQuery.data !== undefined
        ? new Map(libraryClipsQuery.data.map((clip) => [clip.id, clip]))
        : shownClipsById,
    [isLibraryClipNeeded, libraryClipsQuery.data, shownClipsById],
  );
  if (nextUp.kind === "cue" || nextUp.kind === "shuffle") {
    return shownClipsById.get(nextUp.clipId)?.title ?? null;
  }
  if (nextUp.kind === "setlist") {
    // While the library loads, the step waits for its name.
    const isNameLoading =
      nextUp.item.kind === "scene"
        ? scenesQuery.data === undefined
        : isLibraryClipNeeded && libraryClipsQuery.data === undefined;
    if (isNameLoading) return null;
    return (
      vjSetlistStepNameOf(nextUp.item, scenesById, clipsById) ??
      t(VJ_SETLIST_STEP_GONE_KEYS[nextUp.item.kind])
    );
  }
  return null;
}

/** How many frames the scenes sheet gets to draw the row it opens at. */
const VJ_REVEAL_ROW_FRAMES = 30;

/**
 * Scrolls the sequence's row into view once the scenes sheet has drawn it,
 * so the band's status line opens the sheet at the sequence it names.
 */
function revealVjSetlistRow(setlistId: string, isReducedMotion: boolean) {
  let framesLeft = VJ_REVEAL_ROW_FRAMES;
  const tryReveal = () => {
    const row = document.querySelector<HTMLElement>(
      `[data-vj-scenes-sheet] [data-vj-setlist-row="${setlistId}"]`,
    );
    if (row !== null) {
      row.scrollIntoView({
        block: "center",
        behavior: isReducedMotion ? "auto" : "smooth",
      });
      return;
    }
    framesLeft -= 1;
    if (framesLeft > 0) requestAnimationFrame(tryReveal);
  };
  requestAnimationFrame(tryReveal);
}

/**
 * Why the active sequence stands still, for the band: paused, taken over,
 * waiting before a flashing step (named) or finished; null while it plays,
 * steps by hand or none is active.
 */
function useVjMirrorSequenceStatus(
  state: VjStageState | null,
  activeSetlist: VjSetlistDTO | null,
  clipsById: ReadonlyMap<string, VjClipDTO>,
): VjMirrorSequenceStatus | null {
  const { t } = useTranslation();
  const status =
    state === null || state.activeSetlistId === null
      ? null
      : state.setlistPlayback.status;
  const scenesQuery = useVjScenes({
    isEnabled: status === "needsFlashConsent",
  });
  switch (status) {
    case "paused":
      return { kind: "paused" };
    case "takenOver":
      return { kind: "takenOver" };
    case "finished":
      return { kind: "finished" };
    case "needsFlashConsent": {
      const flashingIndex =
        state === null || activeSetlist === null
          ? null
          : vjSetlistFlashingIndexOf(state, activeSetlist);
      const flashingItem =
        flashingIndex === null
          ? undefined
          : activeSetlist?.items[flashingIndex];
      if (flashingItem === undefined) {
        return { kind: "waitingFlash", stepName: t("vj:strip.setlistNext") };
      }
      const scenesById = new Map(
        (scenesQuery.data ?? []).map((scene) => [scene.id, scene]),
      );
      return {
        kind: "waitingFlash",
        stepName:
          vjSetlistStepNameOf(flashingItem, scenesById, clipsById) ??
          t(VJ_SETLIST_STEP_GONE_KEYS[flashingItem.kind]),
      };
    }
    default:
      return null;
  }
}

/**
 * The mirror band: the applied frames on the mini mirror, what comes next and
 * the countdown ring. The synced clock ticks here only, and only while the
 * ring has something to count down, so the rest of the page stays still.
 */
function VjRemoteMirror({ session }: VjRemoteBandProps): JSX.Element {
  const { frames, clock, latestState, library, cue, run, isBlocked } = session;
  const [isExpanded, setIsExpanded] = useState(false);
  const shownState = frames.shownState;
  const activePackId = library.activePackId;
  const activeSetlistId = latestState?.activeSetlistId ?? null;
  const setlistsQuery = useVjSetlists({ isEnabled: activeSetlistId !== null });
  const packEventQuery = useVjPackEvent(activePackId, {
    isEnabled: activePackId !== null,
  });
  const activeSetlist =
    setlistsQuery.data?.find((setlist) => setlist.id === activeSetlistId) ??
    null;
  const nextUp =
    latestState === null
      ? NO_NEXT_UP
      : vjNextUpOf({
          isCueMode: cue.isCueMode,
          armedClipId: cue.armedClipId,
          state: latestState,
          leadNextClipId: library.leadNextClipId,
          activeSetlist,
        });
  const nextUpTitle = useVjNextUpTitle(nextUp, session);
  const sequenceStatus = useVjMirrorSequenceStatus(
    latestState,
    activeSetlist,
    library.clipsById,
  );
  const { reducedMotion } = useMotionPrefs();
  const openSequence = () => {
    session.sheets.open("scenes");
    if (activeSetlistId !== null) {
      revealVjSetlistRow(activeSetlistId, reducedMotion);
    }
  };
  const isRingCounting =
    shownState !== null &&
    isVjMirrorRingCounting({
      nextApplyAt: frames.nextApplyAt,
      shuffle: shownState.shuffle,
      setlistPlayback: shownState.setlistPlayback,
    });
  const syncedNow = useVjSyncedNow(clock, { isEnabled: isRingCounting });
  const ring =
    shownState === null
      ? NO_RING
      : vjMirrorRingWithinStep(
          vjMirrorRingOf({
            serverNowMs: syncedNow,
            nextApplyAt: frames.nextApplyAt,
            frameReceivedAt: frames.frameReceivedAt,
            shuffle: shownState.shuffle,
            tempo: shownState.tempo,
            liveSince: shownState.liveSince,
            setlistPlayback: shownState.setlistPlayback,
          }),
          shownState.setlistPlayback.stepDurationMs,
        );
  const leadNextClipId = library.leadNextClipId;
  const canSkip =
    leadNextClipId !== null && (latestState?.shuffle.isOn ?? false);

  return (
    <VjMirrorBand
      frames={frames}
      clock={clock}
      liveClip={library.liveClip}
      mixClip={library.mixClip}
      pendingClip={
        frames.pendingState?.liveClipId
          ? (library.clipsById.get(frames.pendingState.liveClipId) ?? null)
          : null
      }
      eventCardData={packEventQuery.data?.card ?? null}
      nextUp={nextUp}
      nextUpTitle={nextUpTitle}
      pendingQuantize={frames.pendingState?.tempo.quantize ?? "off"}
      ring={ring}
      isExpanded={isExpanded}
      onToggleExpanded={() => setIsExpanded((wasExpanded) => !wasExpanded)}
      canSkip={canSkip}
      onSkip={() => {
        if (isBlocked || leadNextClipId === null) return;
        void run("goClip", leadNextClipId);
      }}
      isBlocked={isBlocked}
      blockedReasonId={session.blockedReasonId}
      sequenceStatus={sequenceStatus}
      onOpenSequence={openSequence}
    />
  );
}

/**
 * The sticky header: top row and mirror band, plus the not-preloaded pack
 * confirm. With help captions on, its legends make it too tall to pin on a
 * phone, so there it scrolls with the page (VjRemoteLayout.module.css).
 */
function VjRemoteHeader({ session }: VjRemoteBandProps): JSX.Element {
  const { library, view, run, stage, sheets, isBlocked } = session;
  const { isOn: isHelpOn } = useVjHelpCaptions();
  const setPack = useCallback(
    (packId: string) => run("setPack", packId),
    [run],
  );
  const packSwitch = useVjPackSwitch({
    activePackId: library.activePackId,
    readinessOf: library.readinessOf,
    setPack,
  });
  const { setGridSource } = view;
  const { request } = packSwitch;
  const requestPack = useCallback(
    (packId: string) => {
      setGridSource("pack");
      request(packId);
    },
    [setGridSource, request],
  );
  const confirmPack =
    packSwitch.confirm === null
      ? null
      : (library.packs.find((pack) => pack.id === packSwitch.confirm?.packId) ??
        null);

  return (
    <header
      className={styles.header}
      data-vj-remote-header=""
      data-vj-help={isHelpOn ? "on" : undefined}
    >
      <VjRemoteTopRow
        packs={library.packs}
        readinessOf={library.readinessOf}
        activePackId={library.activePackId}
        pendingPackId={packSwitch.pendingPackId}
        gridSource={view.gridSource}
        isFavoritesOnly={view.isFavoritesOnly}
        isShortHelpLegend={session.layout.layout === "phone"}
        isSearchAvailable={library.isSearchAvailable}
        isSearchOpen={view.isSearchOpen}
        screens={stage.screens}
        isScreensKnown={session.offlineReason === null}
        isBlocked={isBlocked}
        blockedReasonId={session.blockedReasonId}
        onRequestPack={requestPack}
        onShowGenerators={() => setGridSource("generators")}
        onToggleFavoritesOnly={view.toggleFavoritesOnly}
        onToggleSearch={view.toggleSearch}
        onOpenScreens={() => sheets.open("screens")}
      />
      <VjRemoteMirror session={session} />
      <AnimatePresence>
        {packSwitch.confirm !== null && confirmPack !== null ? (
          <VjPackSwitchConfirm
            key={packSwitch.confirm.packId}
            packName={confirmPack.name}
            currentPackName={library.activePack?.name ?? null}
            readiness={packSwitch.confirm.readiness}
            onAccept={packSwitch.accept}
            onDismiss={packSwitch.dismiss}
          />
        ) : null}
      </AnimatePresence>
    </header>
  );
}

/** "Scene 4": counts on from the list's length and skips a number a name already holds. */
function nextVjSceneName(
  takenNames: readonly string[],
  nameFor: (number: number) => string,
): string {
  const taken = new Set(
    takenNames.map((name) => name.trim().toLocaleLowerCase()),
  );
  let number = takenNames.length + 1;
  while (taken.has(nameFor(number).trim().toLocaleLowerCase())) number += 1;
  return nameFor(number);
}

/** The scenes strip and the history strip (one switched row when compact). */
function VjRemoteStripsBand({ session }: VjRemoteBandProps): JSX.Element {
  const { t } = useTranslation();
  const { latestState, library, actions, run, isBlocked, onRefused } = session;
  const activePackId = library.activePackId;
  const scenesQuery = useVjScenes({ packId: activePackId });
  const setlistsQuery = useVjSetlists();
  const { createScene } = useVjSceneMutations();
  const { pendingSceneId, recalledSceneId, recallScene } = useVjSceneRecall({
    run,
    isBlocked,
    onRefused,
    requestSceneFlashConsent: actions.requestSceneFlashConsent,
  });
  const scenes = scenesQuery.data ?? [];
  const activeSetlistId = latestState?.activeSetlistId ?? null;
  const activeSetlist =
    setlistsQuery.data?.find((setlist) => setlist.id === activeSetlistId) ??
    null;
  const { dispatch } = actions;
  const setlistPlayback = latestState?.setlistPlayback ?? null;
  const isSetlistPlayPending =
    session.isCommandPending("setlistSetPlaying") ||
    session.isCommandPending("setlistSelect");

  // The flash warning, when the look flashes, sits on the tapped chip.
  const recallSceneById = (sceneId: string) => {
    const scene = scenes.find((candidate) => candidate.id === sceneId);
    if (scene === undefined) return;
    const chip = document.querySelector<HTMLElement>(
      `[data-vj-scene-chip="${sceneId}"]`,
    );
    recallScene(scene, chip);
  };

  const saveScene = () => {
    if (latestState === null || createScene.isPending) return;
    const name = nextVjSceneName(
      scenes.map((scene) => scene.name),
      (number) => t("vj:scenes.defaultName", { number }),
    );
    void createScene
      .mutateAsync({
        name,
        packId: activePackId,
        look: vjSceneLookOf(latestState),
      })
      .then(undefined, (cause: unknown) => onRefused(vjErrorKeyOf(cause)));
  };

  return (
    <div className={styles.stripsBand}>
      <VjStrips
        isCompact={session.layout.isCompactStrips}
        scenesProps={{
          scenes,
          activeSetlist,
          setlistIndex: latestState?.setlistIndex ?? null,
          pendingSceneId,
          isBlocked,
          blockedReasonId: session.blockedReasonId,
          isSaving: createScene.isPending,
          onRecall: recallSceneById,
          onSaveScene: saveScene,
          onSetlistNext: () => dispatch({ kind: "setlistNext" }, "press"),
          onSetlistPrevious: () =>
            dispatch({ kind: "setlistPrevious" }, "press"),
          setlistStatus: setlistPlayback?.status ?? "manual",
          isSetlistLooping:
            activeSetlistId !== null &&
            actions.setlistLoopIsOn(
              activeSetlistId,
              setlistPlayback?.isLooping ?? false,
            ),
          isSetlistPlayPending,
          onSetlistTogglePlaying: actions.setlist.togglePlaying,
          // A set list names its own current scene; a one-off recall is tracked here.
          liveSceneId: activeSetlistId === null ? recalledSceneId : undefined,
          onOpenScenesSheet: () => session.sheets.open("scenes"),
        }}
        historyProps={{
          recentClipIds: latestState?.recentClipIds ?? [],
          clipsById: library.clipsById,
          isBlocked,
          blockedReasonId: session.blockedReasonId,
          onPrevious: () => dispatch({ kind: "previous" }, "press"),
          onGoClip: (clipId) => dispatch({ kind: "goClip", clipId }, "press"),
          liveClipId: latestState?.liveClipId ?? null,
        }}
      />
    </div>
  );
}

/** The grid's empty line: why there is no clip to show. */
function vjGridEmptyKeyOf(
  library: VjRemoteLibrary,
  isFavoritesOnly: boolean,
): string | null {
  if (!library.hasLoadedPacks) return null;
  if (library.packs.length === 0) return "vj:remote.noPacks";
  if (library.activePackId === null) return "vj:remote.pickPackHint";
  if (!library.hasLoadedPackClips) return null;
  if (library.packClips.length === 0) return "vj:remote.packEmpty";
  return isFavoritesOnly ? "vj:grid.favoritesEmpty" : null;
}

/**
 * The clip grid (or the generators) with each tile's live, pending and
 * readiness state, the line over it naming how many clips couldn't load,
 * and the sheet that says why for each one.
 */
function VjRemoteGridBand({ session }: VjRemoteBandProps): JSX.Element {
  const { library, actions, view, frames, stage, cue, isBlocked } = session;
  const shownState = frames.shownState;
  const pendingState = frames.pendingState;
  const shownLiveClipId = shownState?.liveClipId ?? null;
  const activePackId = library.activePackId;
  const { screens } = stage;
  const { tileStateOf: actionTileStateOf, dispatch } = actions;
  // The grid runs the search itself; favorites only narrows what it gets.
  const gridClips = useMemo(
    () =>
      view.isFavoritesOnly
        ? library.packClips.filter((clip) => clip.isFavorite)
        : library.packClips,
    [library.packClips, view.isFavoritesOnly],
  );

  const tileStateOf = useCallback(
    (clipId: string): VjTileState => {
      // A quantized change waits: the tile it names says when it lands.
      const isWaiting =
        pendingState !== null &&
        pendingState.liveClipId === clipId &&
        shownLiveClipId !== clipId;
      return {
        ...actionTileStateOf(clipId),
        isLive: shownLiveClipId === clipId,
        pendingQuantize: isWaiting ? pendingState.tempo.quantize : null,
        readiness: vjClipReadinessOf(screens, activePackId ?? "", clipId),
      };
    },
    [actionTileStateOf, pendingState, shownLiveClipId, screens, activePackId],
  );
  const failures = useVjClipFailures({
    clips: library.packClips,
    screens,
    activePackId,
    sheets: session.sheets,
  });
  const { showFailures } = failures;
  const showAllFailures = useCallback(() => showFailures(null), [showFailures]);

  // Where the grid starts, so the tiles can fit three rows above the dock.
  const gridTopRef = useVjGridTop();

  return (
    <section
      ref={gridTopRef}
      className={styles.gridBand}
      aria-busy={!library.hasLoadedPackClips}
    >
      <VjClipFailureSummary
        failedCount={failures.failedClips.length}
        isShown={view.gridSource === "pack"}
        onSeeWhy={showAllFailures}
      />
      <VjGridHelpLegend
        source={view.gridSource}
        failedCount={failures.failedClips.length}
        firstClipThumbnailUrl={gridClips[0]?.thumbnailUrl ?? null}
      />
      <VjRemoteGrid
        source={view.gridSource}
        packKey={activePackId}
        clips={gridClips}
        tileStateOf={tileStateOf}
        liveGeneratorId={shownState?.liveGeneratorId ?? null}
        liveGeneratorVariant={shownState?.liveGeneratorVariant ?? null}
        isCueMode={cue.isCueMode}
        isBlocked={isBlocked}
        blockedReasonId={session.blockedReasonId}
        emptyKey={vjGridEmptyKeyOf(library, view.isFavoritesOnly)}
        search={{
          isOpen: view.isSearchOpen,
          query: view.searchQuery,
          onQuery: view.setSearchQuery,
          onClose: view.closeSearch,
        }}
        onTapClip={(clipId) => dispatch({ kind: "goClip", clipId }, "press")}
        onToggleFavorite={actions.toggleFavorite}
        onShowClipFailure={showFailures}
        generatorIsPending={actions.generatorIsPending}
        onGoGenerator={(generatorId, variant) =>
          dispatch({ kind: "goGenerator", generatorId, variant }, "press")
        }
      />
      <AnimatePresence>
        {failures.isSheetOpen ? (
          <VjClipFailuresSheet
            key="failures"
            failedClips={failures.failedClips}
            focusClipId={failures.focusClipId}
            onClose={failures.closeFailures}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}

export interface VjRemoteShellProps {
  session: VjRemoteSession;
  /** The dock: inline in the split layout's second column; on a phone it portals itself. */
  dock: ReactNode;
  /** The phone dock's measured height; 0 keeps the CSS fallback. */
  dockHeight: number;
  /** Drawn after the page, inside the help captions provider: the sheets
   *  host and the flash warning read the "?" toggle from here. */
  children?: ReactNode;
}

export function VjRemoteShell({
  session,
  dock,
  dockHeight,
  children,
}: VjRemoteShellProps): JSX.Element {
  const { t } = useTranslation();
  const isPhone = session.layout.layout === "phone";
  const { setlist, setlistLoopIsOn, isSetlistLoopPending } = session.actions;
  const { clipsById } = session.library;
  const { isCommandPending, errorKey, errorValues, refusalStamp, clock } =
    session;
  const setlistControls = useMemo<VjRemoteSetlistControls>(
    () => ({
      actions: { setlist, setlistLoopIsOn, isSetlistLoopPending },
      clipsById,
      isCommandPending,
      clock,
      errorKey,
      errorValues,
      refusalStamp,
    }),
    [
      setlist,
      setlistLoopIsOn,
      isSetlistLoopPending,
      clipsById,
      isCommandPending,
      clock,
      errorKey,
      errorValues,
      refusalStamp,
    ],
  );
  // The measured dock, so the grid's last row always clears it.
  const pageStyle =
    isPhone && dockHeight > 0
      ? ({ "--vj-remote-bar-space": `${dockHeight}px` } as CSSProperties)
      : undefined;

  // The help captions provider wraps the dock too: on a phone the dock
  // portals itself, and the "?" toggle still reaches it through context.
  // The sequence controls reach the scenes sheet in the sheets host the
  // same way.
  return (
    <VjHelpCaptionsProvider>
      <VjRemoteSetlistContext.Provider value={setlistControls}>
        <div
          className={styles.page}
          style={pageStyle}
          data-theme="dark"
          data-vj-remote=""
          data-layout={session.layout.layout}
        >
          <div className={styles.backdrop}>
            <QuizshowBackdrop variant="phone" />
          </div>
          <PageMeta title={t("vj:remote.metaTitle")} noIndex />
          <div className={styles.frame}>
            <main id={MAIN_CONTENT_ID} tabIndex={-1} className={styles.main}>
              <h1 className={styles.visuallyHidden}>
                {t("vj:remote.metaTitle")}
              </h1>
              <VjRemoteHeader session={session} />
              <VjRemoteStripsBand session={session} />
              <VjRemoteGridBand session={session} />
            </main>
            {dock}
          </div>
        </div>
        {children}
      </VjRemoteSetlistContext.Provider>
    </VjHelpCaptionsProvider>
  );
}

/**
 * Everything the projector page renders (engine plan, Task E23): the applied
 * state and the 7.4 queue head from `useVjStage`, the synced clock, the
 * offline record, the clip cache with the 9.1 retention, the program, the
 * live and mix sources for the applied and the upcoming state, the event
 * card, the microphone tempo, the renderer and its health, and the identify
 * request. It also reports `screen:status` and keeps the record.
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import type {
  VjScreenHealth,
  VjStageRestore,
  VjStageState,
} from "../../../shared/contracts/vj";
import { vjClockReaderOf, type VjClockReader } from "../engine/vjEngineLook";
import {
  useVjStage,
  type VjStageController,
  type VjUpcomingFrame,
} from "../live/useVjStage";
import type { VjScreenIdentifyRequest } from "./overlay/VjScreenIdentify";
import { useVjMicTempo, type VjMicTempoState } from "./useVjMicTempo";
import {
  useVjScreenEventCard,
  type VjScreenEventCard,
} from "./useVjScreenEventCard";
import type { VjRendererHealth } from "./useVjScreenHealth";
import {
  useVjScreenPreload,
  type VjScreenPreloadResult,
} from "./useVjScreenPreload";
import { useVjScreenProgram } from "./useVjScreenProgram";
import { useVjScreenRecordSync } from "./useVjScreenRecordSync";
import { useVjScreenSetlistClips } from "./useVjScreenSetlistClips";
import { useVjScreenStatusReport } from "./useVjScreenStatusReport";
import {
  useReleaseUnadoptedVjSource,
  useVjSourceUrlLedger,
  useVjTargetClip,
  type VjSourceUrlLedger,
} from "./useVjTargetClip";
import type {
  VjRenderableClip,
  VjRenderableGenerator,
  VjRenderableSource,
} from "./vjLayerMachine";
import { INITIAL_VJ_RENDERER, type VjRendererState } from "./vjRendererKind";
import { vjScreenHealthOf } from "./vjScreenHealth";
import {
  readOrMintVjScreenId,
  readVjScreenRecord,
  vjStageRestoreOf,
} from "./vjScreenRecord";
import {
  resolveVjScreenLook,
  vjRenderableGeneratorOf,
  type VjScreenLiveSource,
} from "./vjScreenLook";
import type { VjStageHandle } from "./vjStageHandle";

export interface VjScreenShow extends VjScreenSources {
  stage: VjStageController;
  /** The applied state, or the record's on an offline start. */
  displayState: VjStageState | null;
  /** The 7.4 queue head; null while no frame waits. */
  upcoming: VjUpcomingFrame | null;
  preload: VjScreenPreloadResult;
  clock: VjClockReader;
  handleRef: RefObject<VjStageHandle | null>;
  ledger: VjSourceUrlLedger;
  renderer: VjRendererState;
  onRendererChange: (state: VjRendererState) => void;
  /** Null until the renderer reports its health. */
  health: VjScreenHealth | null;
  onHealth: (health: VjRendererHealth) => void;
  eventCard: VjScreenEventCard;
  mic: VjMicTempoState;
  identify: VjScreenIdentifyRequest | null;
  isOfflineStart: boolean;
}

/** The attach `restoreState`: the last look this screen saved. */
function readRestoreState(): VjStageRestore | null {
  const savedRecord = readVjScreenRecord();
  return savedRecord === null ? null : vjStageRestoreOf(savedRecord.state);
}

function readIsOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/** Each `screen:identify` frame as a request with a fresh key, so the same number shows again. */
function useVjScreenIdentifyRequest(
  subscribeIdentify: VjStageController["subscribeIdentify"],
): VjScreenIdentifyRequest | null {
  const [identify, setIdentify] = useState<VjScreenIdentifyRequest | null>(
    null,
  );
  useEffect(
    () =>
      subscribeIdentify((frame) => {
        setIdentify((current) => ({
          number: frame.number,
          durationMs: frame.durationMs,
          key: (current?.key ?? 0) + 1,
        }));
      }),
    [subscribeIdentify],
  );
  return identify;
}

/** The renderer's reading plus the cache bytes of every clip this screen holds. */
function useVjScreenHealthState(preload: VjScreenPreloadResult): {
  health: VjScreenHealth | null;
  onHealth: (health: VjRendererHealth) => void;
} {
  const [rendererHealth, setRendererHealth] = useState<VjRendererHealth | null>(
    null,
  );
  const { clips, extraClips, statuses, extraStatuses } = preload;
  const health = useMemo(
    () =>
      rendererHealth === null
        ? null
        : vjScreenHealthOf({
            ...rendererHealth,
            clips: [...clips, ...extraClips],
            statuses: [...statuses, ...extraStatuses],
          }),
    [rendererHealth, clips, extraClips, statuses, extraStatuses],
  );
  return { health, onHealth: setRendererHealth };
}

/** The renderer's sources: identity-stable, so the compositor re-targets only on a real change. */
export interface VjScreenSources {
  live: VjRenderableSource | null;
  mix: VjRenderableClip | null;
  /** The queue head's live source, so the engine pre-rolls it before applyAt. */
  upcomingLive: VjRenderableSource | null;
  upcomingMix: VjRenderableClip | null;
}

interface VjScreenSourcesInput {
  state: VjStageState | null;
  upcoming: VjUpcomingFrame | null;
  screenId: string;
  programClipId: string | null;
  preload: VjScreenPreloadResult;
  ledger: VjSourceUrlLedger;
  handleRef: RefObject<VjStageHandle | null>;
  /** True while the compositor draws: only it pre-rolls, so only it holds an upcoming URL. */
  isEngineDrawing: boolean;
}

function clipIdOf(source: VjScreenLiveSource): string | null {
  return source?.kind === "clip" ? source.clipId : null;
}

function useGeneratorSource(
  source: VjScreenLiveSource,
): VjRenderableGenerator | null {
  const generatorId = source?.kind === "generator" ? source.generatorId : null;
  const variant = source?.kind === "generator" ? source.generatorVariant : null;
  return useMemo(
    () =>
      generatorId === null
        ? null
        : vjRenderableGeneratorOf(generatorId, variant),
    [generatorId, variant],
  );
}

/**
 * The last upcoming target, kept after the queue head applies while the
 * applied state still plays its clip; forgotten once the clip changes, so a
 * later return to that clip never reuses a URL the engine let go.
 */
function useRememberedTarget(
  target: VjRenderableClip | null,
  appliedClipId: string | null,
): VjRenderableClip | null {
  const [remembered, setRemembered] = useState<VjRenderableClip | null>(null);
  if (target !== null && target !== remembered) setRemembered(target);
  const isStale =
    target === null &&
    remembered !== null &&
    remembered.clipId !== appliedClipId;
  if (isStale) setRemembered(null);
  return target ?? (isStale ? null : remembered);
}

/**
 * The pre-rolled target the engine cut to at applyAt, remembered only while
 * the engine draws. While the DOM renderer draws, nothing is remembered: the
 * DOM renderer applied the hook's own target, and the engine retired its
 * pre-roll, so a context that comes back keeps the DOM's applied URL.
 */
export function useVjEnginePreRolledTarget(
  nextTarget: VjRenderableClip | null,
  appliedClipId: string | null,
  isEngineDrawing: boolean,
): VjRenderableClip | null {
  const remembered = useRememberedTarget(
    isEngineDrawing ? nextTarget : null,
    isEngineDrawing ? appliedClipId : null,
  );
  return isEngineDrawing ? remembered : null;
}

/**
 * The target for `clipId`: the upcoming target the engine pre-rolled for it
 * (the engine cut to it at applyAt and keeps that source, so the hook's own
 * later URL for the same clip goes unadopted), else the hook's own, which
 * stays on the previous clip until the next one is read.
 */
function pickVjTarget(
  clipId: string | null,
  target: VjRenderableClip | null,
  preRolled: VjRenderableClip | null,
): VjRenderableClip | null {
  if (clipId !== null && preRolled?.clipId === clipId) return preRolled;
  return target;
}

/** The upcoming target when it names the wanted clip, else the current one (no pre-roll yet). */
function upcomingTargetOf(
  clipId: string | null,
  upcomingTarget: VjRenderableClip | null,
  current: VjRenderableClip | null,
): VjRenderableClip | null {
  if (clipId === null) return null;
  return upcomingTarget?.clipId === clipId ? upcomingTarget : current;
}

/**
 * Live and mix for the applied state and the queue head. One ledger owns
 * every URL; generators bypass it. The queue head gets its own targets only
 * for clips the applied state does not already play, and each target the
 * renderer did not adopt is released after commit.
 */
function useVjScreenSources(input: VjScreenSourcesInput): VjScreenSources {
  const { state, upcoming, screenId, preload, ledger, handleRef } = input;
  const look =
    state === null
      ? null
      : resolveVjScreenLook(state, screenId, input.programClipId);
  const upcomingLook =
    upcoming === null
      ? null
      : resolveVjScreenLook(
          upcoming.state,
          screenId,
          upcoming.state.liveClipId,
        );
  const targetPreload = useMemo(
    () => ({ ...preload, readyClipIds: preload.playableClipIds }),
    [preload],
  );
  const liveClipId = clipIdOf(look?.live ?? null);
  const mixClipId = look?.mixClipId ?? null;
  const nextLiveClipId = clipIdOf(upcomingLook?.live ?? null);
  const nextMixClipId = upcomingLook?.mixClipId ?? null;
  const targetOf = (displayedClipId: string | null) => ({
    displayedClipId,
    preload: targetPreload,
    ledger,
  });
  const liveTarget = useVjTargetClip(targetOf(liveClipId));
  const mixTarget = useVjTargetClip(targetOf(mixClipId));
  const nextLiveTarget = useVjTargetClip(
    targetOf(nextLiveClipId === liveClipId ? null : nextLiveClipId),
  );
  const nextMixTarget = useVjTargetClip(
    targetOf(nextMixClipId === mixClipId ? null : nextMixClipId),
  );
  useReleaseUnadoptedVjSource(handleRef, liveTarget, ledger);
  useReleaseUnadoptedVjSource(handleRef, mixTarget, ledger);
  useReleaseUnadoptedVjSource(handleRef, nextLiveTarget, ledger);
  useReleaseUnadoptedVjSource(handleRef, nextMixTarget, ledger);

  const engineLive = useVjEnginePreRolledTarget(
    nextLiveTarget,
    liveClipId,
    input.isEngineDrawing,
  );
  const engineMix = useVjEnginePreRolledTarget(
    nextMixTarget,
    mixClipId,
    input.isEngineDrawing,
  );
  const generator = useGeneratorSource(look?.live ?? null);
  const nextGenerator = useGeneratorSource(upcomingLook?.live ?? null);
  const live = generator ?? pickVjTarget(liveClipId, liveTarget, engineLive);
  const mix =
    mixClipId === null ? null : pickVjTarget(mixClipId, mixTarget, engineMix);
  return {
    live,
    mix,
    upcomingLive:
      upcoming === null
        ? null
        : (nextGenerator ??
          (nextLiveClipId === liveClipId
            ? live
            : upcomingTargetOf(nextLiveClipId, nextLiveTarget, liveTarget))),
    upcomingMix:
      upcoming === null || nextMixClipId === mixClipId
        ? mix
        : upcomingTargetOf(nextMixClipId, nextMixTarget, mix),
  };
}

export function useVjScreenShow(isFullscreen: boolean): VjScreenShow {
  const [record] = useState(readVjScreenRecord);
  const [screenId] = useState(readOrMintVjScreenId);
  const [isStartedOffline] = useState(readIsOffline);
  const stage = useVjStage({
    role: "screen",
    screenId,
    getRestoreState: readRestoreState,
  });
  const { serverNow, toLocalTime, seedClockOffset } = stage;
  const clock = useMemo(
    () => vjClockReaderOf({ serverNow, toLocalTime }),
    [serverNow, toLocalTime],
  );
  const [savedClockOffsetMs] = useState(() => record?.clockOffsetMs ?? null);
  useEffect(() => {
    // Once per mount: an offline reload keeps beat phase until a live sample arrives.
    if (savedClockOffsetMs !== null) seedClockOffset(savedClockOffsetMs);
  }, [seedClockOffset, savedClockOffsetMs]);

  const displayState = stage.state ?? record?.state ?? null;
  const packId = displayState?.activePackId ?? null;
  const setlistSceneClipIds = useVjScreenSetlistClips(
    displayState?.activeSetlistId ?? null,
  );
  const preload = useVjScreenPreload({
    packId,
    record,
    stage,
    screenId,
    setlistSceneClipIds,
  });
  const { clipById } = preload;
  const isFavorite = useCallback(
    (clipId: string) => clipById(clipId)?.isFavorite === true,
    [clipById],
  );
  const program = useVjScreenProgram({
    state: displayState,
    isConnected: stage.isConnected,
    isLead: stage.isLead,
    readyClipIds: preload.readyClipIds,
    isFavorite,
    clock,
    advance: stage.advance,
  });

  const [renderer, setRenderer] = useState(INITIAL_VJ_RENDERER);
  const handleRef = useRef<VjStageHandle | null>(null);
  const ledger = useVjSourceUrlLedger();
  const sources = useVjScreenSources({
    state: displayState,
    upcoming: stage.upcoming,
    screenId,
    programClipId: program.displayedClipId,
    preload,
    ledger,
    handleRef,
    isEngineDrawing: renderer.phase === "webgl2",
  });

  const recordCard =
    record !== null && record.pack?.id === packId ? record.eventCard : null;
  const eventCard = useVjScreenEventCard(packId, recordCard);
  const mic = useVjMicTempo({ clock });
  const { health, onHealth } = useVjScreenHealthState(preload);
  useVjScreenStatusReport({
    stage,
    isFullscreen,
    packId,
    statuses: preload.statuses,
    health,
    nextClipId: program.nextClipId,
    mic: mic.report,
  });

  const liveClipId = stage.state?.liveClipId ?? null;
  const liveClip = useMemo(
    () => (liveClipId === null ? null : clipById(liveClipId)),
    [liveClipId, clipById],
  );
  useVjScreenRecordSync({
    state: stage.state,
    pack: preload.pack,
    clips: preload.clips,
    liveClip,
    extraClips: preload.extraClips,
    eventCard: eventCard.card,
    clockOffsetMs: stage.clockOffsetMs,
  });
  const identify = useVjScreenIdentifyRequest(stage.subscribeIdentify);

  return {
    ...sources,
    stage,
    displayState,
    upcoming: stage.upcoming,
    preload,
    clock,
    handleRef,
    ledger,
    renderer,
    onRendererChange: setRenderer,
    health,
    onHealth,
    eventCard,
    mic,
    identify,
    isOfflineStart: isStartedOffline && stage.state === null,
  };
}

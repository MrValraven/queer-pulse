/**
 * Everything the projector page renders (engine plan, Task E23): the applied
 * state and the 7.4 queue head from `useVjStage`, the synced clock, the
 * offline record, the clip cache with the 9.1 retention, the program, the
 * live and mix sources for the applied and the upcoming state, the event
 * card, the microphone tempo, the renderer and its health, and the identify
 * request. It also reports `screen:status` and keeps the record.
 *
 * The simple renderer plays only the live clip. While it is the only
 * renderer on the stage, the mix clip and the queue head have nothing to
 * hold them, so their URLs are released; when the engine or the DOM
 * renderer mounts again, the page reads fresh URLs for them before handing
 * them over (useVjConsumableTarget). The queue head's live clip is the
 * exception: the simple renderer pre-rolls it too, so it stays held while the
 * engine or the simple renderer sits on the stage (useVjPreRollConsumer).
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
  VjRenderMode,
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
import { useVjScreenRenderMode } from "./useVjScreenRenderMode";
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
import type { VjClipCache } from "./vjClipCache";
import {
  INITIAL_VJ_RENDERER,
  vjRendererMountsOf,
  type VjRendererState,
} from "./vjRendererKind";
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
  /** The remote's choice, effects until a frame says otherwise; never stored. */
  renderMode: VjRenderMode;
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
  /** The queue head's live source, so the engine and the simple renderer pre-roll it before applyAt. */
  upcomingLive: VjRenderableSource | null;
  upcomingMix: VjRenderableClip | null;
  /** While a generator is live: the last clip the screen showed, for a simple renderer that mounts now. */
  fallbackClip: VjRenderableClip | null;
}

interface VjScreenSourcesInput {
  state: VjStageState | null;
  upcoming: VjUpcomingFrame | null;
  screenId: string;
  programClipId: string | null;
  preload: VjScreenPreloadResult;
  ledger: VjSourceUrlLedger;
  handleRef: RefObject<VjStageHandle | null>;
  /** The renderer state the stage reports: who draws, who pre-rolls, who mounts. */
  renderer: VjRendererState;
  consumer: VjSourceConsumer;
}

/** The renderers that play the mix clip and the queue head: the engine and the DOM renderer. */
export interface VjSourceConsumer {
  /** True while the engine or the DOM renderer is mounted. */
  isMounted: boolean;
  /** Counts the times the last of them unmounted: a target from an earlier epoch may have been released. */
  epoch: number;
}

/** Follows the renderer state the stage reports; a new epoch starts each time the last consumer leaves. */
export function useVjSourceConsumer(
  renderer: VjRendererState,
): VjSourceConsumer {
  const mounts = vjRendererMountsOf(renderer);
  return useVjMountConsumer(mounts.isEngineMounted || mounts.isDomMounted);
}

/**
 * The renderers that pre-roll the queue head's live clip: the engine and the
 * simple renderer. The DOM renderer takes no queue head, so a URL named while
 * it draws alone may be released and is read again for the next of them.
 */
export function useVjPreRollConsumer(
  renderer: VjRendererState,
): VjSourceConsumer {
  const mounts = vjRendererMountsOf(renderer);
  return useVjMountConsumer(mounts.isEngineMounted || mounts.isSimpleMounted);
}

/** The simple renderer alone: a new epoch each time it leaves the stage. */
export function useVjSimpleConsumer(
  renderer: VjRendererState,
): VjSourceConsumer {
  return useVjMountConsumer(vjRendererMountsOf(renderer).isSimpleMounted);
}

function useVjMountConsumer(isMounted: boolean): VjSourceConsumer {
  const [consumer, setConsumer] = useState<VjSourceConsumer>({
    isMounted,
    epoch: 0,
  });
  if (consumer.isMounted === isMounted) return consumer;
  const next = {
    isMounted,
    epoch: isMounted ? consumer.epoch : consumer.epoch + 1,
  };
  setConsumer(next);
  return next;
}

interface VjSeenTarget {
  target: VjRenderableClip | null;
  epoch: number;
  wasConsumerMounted: boolean;
}

interface VjRefreshedTarget {
  base: VjRenderableClip;
  epoch: number;
  clip: VjRenderableClip;
}

/**
 * Releases a URL this page read itself once it is no longer handed out,
 * unless a renderer on the stage holds it (that renderer reports it when it
 * lets go). A URL the page already released is ignored by the ledger.
 */
function useReleaseRetiredVjSource(
  handleRef: RefObject<VjStageHandle | null> | undefined,
  retired: VjRenderableClip | null,
  ledger: VjSourceUrlLedger,
): void {
  useEffect(() => {
    if (retired === null || handleRef === undefined) return;
    if (handleRef.current?.holdsSource(retired.sourceUrl) === true) return;
    ledger.release(retired.sourceUrl);
  }, [handleRef, retired, ledger]);
}

/**
 * A mix or queue-head target as the engine and the DOM renderer may take it.
 * While neither is mounted it answers null. A target first seen with neither
 * mounted, or in an earlier epoch, may carry a released URL: once a consumer
 * is mounted again it answers null until a fresh URL for the same clip is
 * read from the cache, then that fresh target. The arriving renderer takes
 * the clip as new, so it never plays a revoked URL. A fresh URL whose target
 * or epoch moved on before it was handed out goes back to the ledger when
 * `handleRef` is given and no renderer holds it.
 */
export function useVjConsumableTarget(input: {
  target: VjRenderableClip | null;
  consumer: VjSourceConsumer;
  cache: Pick<VjClipCache, "readObjectUrl">;
  ledger: VjSourceUrlLedger;
  handleRef?: RefObject<VjStageHandle | null>;
}): VjRenderableClip | null {
  const { target, consumer, cache, ledger, handleRef } = input;
  const [seen, setSeen] = useState<VjSeenTarget>(() => ({
    target,
    epoch: consumer.epoch,
    wasConsumerMounted: consumer.isMounted,
  }));
  let current = seen;
  if (seen.target !== target) {
    current = {
      target,
      epoch: consumer.epoch,
      wasConsumerMounted: consumer.isMounted,
    };
    setSeen(current);
  }
  const [refreshed, setRefreshed] = useState<VjRefreshedTarget | null>(null);
  const [retired, setRetired] = useState<VjRenderableClip | null>(null);
  const isStale =
    target !== null &&
    (!current.wasConsumerMounted || current.epoch !== consumer.epoch);
  const isRefreshedCurrent =
    refreshed !== null &&
    refreshed.base === target &&
    refreshed.epoch === consumer.epoch;
  if (refreshed !== null && !isRefreshedCurrent) {
    // Its target or epoch moved on: it is never handed out again.
    setRefreshed(null);
    setRetired(refreshed.clip);
  }
  useReleaseRetiredVjSource(handleRef, retired, ledger);
  const refreshedClip = isRefreshedCurrent ? refreshed.clip : null;
  const shouldRefresh = consumer.isMounted && isStale && refreshedClip === null;
  const { epoch } = consumer;

  useEffect(() => {
    if (!shouldRefresh || target === null) return undefined;
    let isCurrent = true;
    void cache.readObjectUrl(target.clipId).then(
      (sourceUrl) => {
        if (sourceUrl === null) return;
        if (!isCurrent) {
          URL.revokeObjectURL(sourceUrl);
          return;
        }
        ledger.adopt(sourceUrl);
        setRefreshed({ base: target, epoch, clip: { ...target, sourceUrl } });
      },
      () => undefined,
    );
    return () => {
      isCurrent = false;
    };
  }, [shouldRefresh, target, epoch, cache, ledger]);

  if (!consumer.isMounted || target === null) return null;
  return isStale ? refreshedClip : target;
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
 * The mix clip's pre-rolled target the engine cut to at applyAt, remembered
 * only while the engine draws (the mix is read fresh for an engine that comes
 * back, see useVjConsumableTarget). While the DOM renderer draws, nothing is
 * remembered: the
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
 * True while a renderer that pre-rolls the queue head draws: the engine
 * settled on WebGL, or the simple renderer, arriving, settled or leaving.
 */
export function isVjPreRollDrawing(renderer: VjRendererState): boolean {
  return (
    renderer.phase === "webgl2" || vjRendererMountsOf(renderer).isSimpleMounted
  );
}

/**
 * The pre-rolled live target the renderer cut to at applyAt. A new pre-roll
 * is taken in only while a renderer that pre-rolls draws (the DOM renderer
 * applies the hook's own target, so a context that comes back keeps the
 * DOM's applied URL). Once taken in, it is kept while its clip stays applied,
 * whichever renderer draws then: the hook's own URL for that clip went
 * unadopted and is released, so a renderer arriving later must get this one.
 */
export function useVjPreRolledLiveTarget(
  nextTarget: VjRenderableClip | null,
  appliedClipId: string | null,
  isPreRollDrawing: boolean,
): VjRenderableClip | null {
  return useRememberedTarget(
    isPreRollDrawing ? nextTarget : null,
    appliedClipId,
  );
}

interface VjFallbackRead {
  /** `clipId|epoch` of the simple renderer it was read for. */
  key: string;
  clip: VjRenderableClip;
}

/** The last clip `live` named; a generator or nothing live keeps it. */
function useLastLiveClip(
  live: VjRenderableSource | null,
): VjRenderableClip | null {
  const [lastLiveClip, setLastLiveClip] = useState<VjRenderableClip | null>(
    null,
  );
  const liveClip =
    live !== null && live.mediaKind !== "generator" ? live : null;
  if (liveClip !== null && liveClip.clipId !== lastLiveClip?.clipId) {
    setLastLiveClip(liveClip);
    return liveClip;
  }
  return lastLiveClip;
}

/**
 * While a generator is live (spec 4.2): a URL of its own for the last clip the
 * screen showed, so a simple renderer that mounts during the generator keeps
 * that clip on screen; with no earlier clip there is none and it shows black.
 * It is read as soon as the generator goes live, so it is ready the moment a
 * simple renderer mounts, and read again for each new simple renderer (the
 * stage releases what one held when it leaves). One that is no longer handed
 * out goes back to the ledger unless a renderer holds it.
 */
export function useVjSimpleFallbackClip(input: {
  live: VjRenderableSource | null;
  simpleConsumer: VjSourceConsumer;
  cache: Pick<VjClipCache, "readObjectUrl">;
  ledger: VjSourceUrlLedger;
  handleRef: RefObject<VjStageHandle | null>;
}): VjRenderableClip | null {
  const { live, simpleConsumer, cache, ledger, handleRef } = input;
  const lastLiveClip = useLastLiveClip(live);
  const isGeneratorLive = live?.mediaKind === "generator";
  const wantedKey =
    isGeneratorLive && lastLiveClip !== null
      ? `${lastLiveClip.clipId}|${String(simpleConsumer.epoch)}`
      : null;
  const [fallback, setFallback] = useState<VjFallbackRead | null>(null);
  const [retired, setRetired] = useState<VjRenderableClip | null>(null);
  if (fallback !== null && fallback.key !== wantedKey) {
    setFallback(null);
    setRetired(fallback.clip);
  }
  useReleaseRetiredVjSource(handleRef, retired, ledger);
  const isFallbackCurrent = fallback !== null && fallback.key === wantedKey;

  useEffect(() => {
    if (wantedKey === null || lastLiveClip === null || isFallbackCurrent) {
      return undefined;
    }
    let isCurrent = true;
    void cache.readObjectUrl(lastLiveClip.clipId).then(
      (sourceUrl) => {
        if (sourceUrl === null) return;
        if (!isCurrent) {
          URL.revokeObjectURL(sourceUrl);
          return;
        }
        ledger.adopt(sourceUrl);
        setFallback({ key: wantedKey, clip: { ...lastLiveClip, sourceUrl } });
      },
      () => undefined,
    );
    return () => {
      isCurrent = false;
    };
  }, [wantedKey, lastLiveClip, isFallbackCurrent, cache, ledger]);

  return isFallbackCurrent ? fallback.clip : null;
}

/**
 * The target for `clipId`: the upcoming target the engine pre-rolled for it
 * (the engine cut to it at applyAt and keeps that source, so the hook's own
 * later URL for the same clip goes unadopted), else the hook's own, which
 * stays on the previous clip until the next one is read.
 */
export function pickVjTarget(
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
  const preRollConsumer = useVjPreRollConsumer(input.renderer);
  const simpleConsumer = useVjSimpleConsumer(input.renderer);
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
  const consumableOf = (
    target: VjRenderableClip | null,
    consumer: VjSourceConsumer = input.consumer,
  ) => ({ target, consumer, cache: preload.cache, ledger, handleRef });
  const mixSource = useVjConsumableTarget(consumableOf(mixTarget));
  // The simple renderer pre-rolls the queue head as the engine does.
  const nextLiveSource = useVjConsumableTarget(
    consumableOf(nextLiveTarget, preRollConsumer),
  );
  const nextMixSource = useVjConsumableTarget(consumableOf(nextMixTarget));
  // A fresh URL the arriving renderer did not take goes back as well.
  useReleaseUnadoptedVjSource(handleRef, mixSource, ledger);
  useReleaseUnadoptedVjSource(handleRef, nextLiveSource, ledger);
  useReleaseUnadoptedVjSource(handleRef, nextMixSource, ledger);

  const preRolledLive = useVjPreRolledLiveTarget(
    nextLiveSource,
    liveClipId,
    isVjPreRollDrawing(input.renderer),
  );
  const engineMix = useVjEnginePreRolledTarget(
    nextMixSource,
    mixClipId,
    input.renderer.phase === "webgl2",
  );
  const generator = useGeneratorSource(look?.live ?? null);
  const nextGenerator = useGeneratorSource(upcomingLook?.live ?? null);
  const live = generator ?? pickVjTarget(liveClipId, liveTarget, preRolledLive);
  const mix =
    mixClipId === null ? null : pickVjTarget(mixClipId, mixSource, engineMix);
  const fallbackClip = useVjSimpleFallbackClip({
    live,
    simpleConsumer,
    cache: preload.cache,
    ledger,
    handleRef,
  });
  return {
    live,
    mix,
    fallbackClip,
    upcomingLive:
      upcoming === null
        ? null
        : (nextGenerator ??
          (nextLiveClipId === liveClipId
            ? live
            : upcomingTargetOf(nextLiveClipId, nextLiveSource, liveTarget))),
    upcomingMix:
      upcoming === null || nextMixClipId === mixClipId
        ? mix
        : upcomingTargetOf(nextMixClipId, nextMixSource, mix),
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
  const setlistClipIds = useVjScreenSetlistClips(
    displayState?.activeSetlistId ?? null,
    displayState?.setlistIndex ?? null,
  );
  const preload = useVjScreenPreload({
    packId,
    record,
    stage,
    screenId,
    setlistClipIds,
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
  const consumer = useVjSourceConsumer(renderer);
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
    renderer,
    consumer,
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
  const renderMode = useVjScreenRenderMode(stage.subscribeRenderMode);

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
    renderMode,
    isOfflineStart: isStartedOffline && stage.state === null,
  };
}

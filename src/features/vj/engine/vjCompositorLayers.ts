/**
 * The compositor's live layers (engine plan, Task E21): the pure layer
 * machine (`reduceVjLayers`) mapped onto engine sources, plus the registry
 * that owns every source the compositor created.
 *
 * - Slots map to sources by the clip the slot holds. A second URL for a clip
 *   a slot already holds is never adopted (v1 rule): the machine keeps the
 *   first clip object, so the new URL stays unheld and the page revokes it.
 * - `firstFrame` and `failed` come from source events, queued and drained at
 *   the start of the next animation frame so the machine only moves between
 *   frames.
 * - `fadeEnded` fires on the frame the transition's progress (elapsed frame
 *   time over `durationMs`) reaches 1; a catch-up eases the incoming layer to
 *   full over VJ_CATCH_UP_MS from wherever its transition stood.
 * - A source no slot draws any more is retired: the registry disposes it at
 *   the end of the next frame (the first frame that stopped drawing it) and
 *   reports each object URL nothing holds any more, once.
 */
import type {
  VjEffectSettings,
  VjPreloadFailure,
  VjSpeed,
  VjTransitionId,
} from "../../../shared/contracts/vj";
import { VJ_CATCH_UP_MS } from "../screen/VjClipLayer";
import {
  INITIAL_VJ_LAYERS,
  VJ_LAYER_NAMES,
  reduceVjLayers,
  type VjLayerEvent,
  type VjLayerMachineState,
  type VjLayerName,
  type VjRenderableSource,
} from "../screen/vjLayerMachine";
import type { VjProgramKey } from "./shaders/vjProgramKeys";
import {
  vjPlayheadEffectsOf,
  type VjPlayheadEffects,
} from "./sources/vjPlayheadClock";
import {
  vjEngineSourceKey,
  type VjEngineSource,
  type VjSourceEvents,
} from "./sources/vjSourceTypes";
import type { VjResolvedTransition } from "./vjEngineLook";

/** Where a source's events land once the registry drains them. */
export interface VjSourceListener {
  onFirstFrame(source: VjEngineSource): void;
  onFailed(source: VjEngineSource, failure: VjPreloadFailure): void;
}

export interface VjSourceHost {
  /** Builds the source for a renderable; its events reach `listener` when the next frame drains them. */
  create(
    renderable: VjRenderableSource,
    listener: VjSourceListener,
  ): VjEngineSource;
  /** A source no slot draws any more: disposed at the end of the next frame. */
  retire(source: VjEngineSource): void;
}

/** A source with the renderable it plays and its cached playhead effects. */
export interface VjHeldSource {
  source: VjEngineSource;
  renderable: VjRenderableSource;
  playhead: VjPlayheadEffects;
  playheadSettings: VjEffectSettings | null;
  playheadSpeed: VjSpeed | null;
}

/** Generators have no playhead: they run on uTime. */
const GENERATOR_PLAYHEAD: VjPlayheadEffects = Object.freeze({
  mode: "forward",
  rate: 1,
  stutterSliceBeats: 1,
});

export function heldVjSourceOf(
  source: VjEngineSource,
  renderable: VjRenderableSource,
): VjHeldSource {
  return {
    source,
    renderable,
    playhead: GENERATOR_PLAYHEAD,
    playheadSettings: null,
    playheadSpeed: null,
  };
}

/** The playhead effects for this look, rebuilt only when the settings or the speed changed. */
export function vjPlayheadOf(
  held: VjHeldSource,
  settings: VjEffectSettings,
  speed: VjSpeed,
): VjPlayheadEffects {
  const { renderable } = held;
  if (renderable.mediaKind === "generator") return GENERATOR_PLAYHEAD;
  if (held.playheadSettings === settings && held.playheadSpeed === speed) {
    return held.playhead;
  }
  held.playhead = vjPlayheadEffectsOf(settings, speed, renderable);
  held.playheadSettings = settings;
  held.playheadSpeed = speed;
  return held.playhead;
}

interface VjQueuedSourceEvent {
  holder: { source: VjEngineSource | null };
  listener: VjSourceListener;
  failure: VjPreloadFailure | null;
}

export interface VjSourceRegistryOptions {
  build(renderable: VjRenderableSource, events: VjSourceEvents): VjEngineSource;
  onReleased(sourceUrl: string): void;
  /** An object URL held with no source yet (the layer machine's pending target). */
  pendingSourceUrl(): string | null;
}

/**
 * Owns every source the compositor created: queues their events, disposes
 * retired ones after a frame and reports each URL nothing holds any more.
 */
export class VjSourceRegistry implements VjSourceHost {
  private readonly options: VjSourceRegistryOptions;
  /** Every source not disposed yet, with the object URL it plays. */
  private readonly urls = new Map<VjEngineSource, string>();
  private readonly retired: VjEngineSource[] = [];
  private readonly queue: VjQueuedSourceEvent[] = [];
  private heldUrls = new Set<string>();
  private isChanged = false;

  constructor(options: VjSourceRegistryOptions) {
    this.options = options;
  }

  create(
    renderable: VjRenderableSource,
    listener: VjSourceListener,
  ): VjEngineSource {
    const holder: { source: VjEngineSource | null } = { source: null };
    const events: VjSourceEvents = {
      onFirstFrame: () => {
        this.queue.push({ holder, listener, failure: null });
      },
      onFailed: (_key, failure) => {
        this.queue.push({ holder, listener, failure });
      },
    };
    const source = this.options.build(renderable, events);
    holder.source = source;
    this.urls.set(source, renderable.sourceUrl);
    this.isChanged = true;
    return source;
  }

  retire(source: VjEngineSource): void {
    if (!this.urls.has(source) || this.retired.includes(source)) return;
    this.retired.push(source);
    this.isChanged = true;
  }

  /** Something that holds a URL changed (a slot, the pending target). */
  markChanged(): void {
    this.isChanged = true;
  }

  /** Hands every queued source event to its listener; events of retired sources are dropped. */
  drainEvents(): void {
    for (let index = 0; index < this.queue.length; index += 1) {
      const event = this.queue[index];
      const source = event?.holder.source;
      if (!event || !source || this.isRetiredOrGone(source)) continue;
      if (event.failure === null) event.listener.onFirstFrame(source);
      else event.listener.onFailed(source, event.failure);
    }
    this.queue.length = 0;
  }

  /** Disposes the sources retired before this frame ended, then reports released URLs. */
  endFrame(): void {
    for (let index = 0; index < this.retired.length; index += 1) {
      const source = this.retired[index];
      if (!source) continue;
      source.dispose();
      this.urls.delete(source);
    }
    this.retired.length = 0;
    if (this.isChanged) this.reportReleasedUrls();
  }

  holdsSourceUrl(sourceUrl: string): boolean {
    if (sourceUrl === "") return false;
    for (const url of this.urls.values()) {
      if (url === sourceUrl) return true;
    }
    return this.options.pendingSourceUrl() === sourceUrl;
  }

  /** GPU bytes every source holds (textures, frame rings, decoded GIF frames). */
  byteSize(): number {
    let bytes = 0;
    for (const source of this.urls.keys()) bytes += source.byteSize();
    return bytes;
  }

  /** After a context restore: every source rebuilds its textures. */
  restoreAll(): void {
    for (const source of this.urls.keys()) source.restore();
  }

  /** Disposes everything and reports nothing: the page revokes its URLs on unmount (v1 rule). */
  disposeAll(): void {
    for (const source of this.urls.keys()) source.dispose();
    this.urls.clear();
    this.retired.length = 0;
    this.queue.length = 0;
    this.heldUrls.clear();
    this.isChanged = false;
  }

  private isRetiredOrGone(source: VjEngineSource): boolean {
    return !this.urls.has(source) || this.retired.includes(source);
  }

  private reportReleasedUrls(): void {
    this.isChanged = false;
    const nextHeld = new Set<string>();
    for (const url of this.urls.values()) {
      if (url !== "") nextHeld.add(url);
    }
    const pendingUrl = this.options.pendingSourceUrl();
    if (pendingUrl) nextHeld.add(pendingUrl);
    const previousHeld = this.heldUrls;
    this.heldUrls = nextHeld;
    for (const url of previousHeld) {
      if (!nextHeld.has(url)) this.options.onReleased(url);
    }
  }
}

/** What the frame draws from the layers: the reused answer of `advance`. */
export interface VjLayerDrawState {
  live: VjHeldSource | null;
  /** The source leaving under a running transition, else null. */
  outgoing: VjHeldSource | null;
  transition: {
    programKey: VjProgramKey;
    progress: number;
    seed: number;
  } | null;
  /** 0..1: the black curtain for "nothing live". */
  curtain: number;
}

/**
 * True once the frame shows what the layers were asked for: with a live
 * target, its source is drawn ready under a fully lowered curtain; with no
 * live target, any drawn frame counts.
 */
export function isVjLiveFrameShown(
  draw: VjLayerDrawState,
  hasLiveTarget: boolean,
): boolean {
  return (
    !hasLiveTarget ||
    (draw.live !== null && draw.live.source.isReady && draw.curtain <= 0)
  );
}

export interface VjCompositorLayersHooks {
  sources: VjSourceHost;
  /** The program a starting transition draws with, after the flash governor and failed programs. */
  transitionProgramOf(mode: VjTransitionId, nowMs: number): VjProgramKey;
  onClipFailed(clipId: string, failure: VjPreloadFailure): void;
  /** A slot or the pending target changed: held URLs may have changed. */
  onChange(): void;
}

function easeOutCubic(progress: number): number {
  const remaining = 1 - progress;
  return 1 - remaining * remaining * remaining;
}

/** A distinct glitch seed per transition. */
function transitionSeedOf(transitionCount: number): number {
  return ((transitionCount * 0.618034) % 1) * 100;
}

export class VjCompositorLayers implements VjSourceListener {
  state: VjLayerMachineState = INITIAL_VJ_LAYERS;
  readonly draw: VjLayerDrawState = {
    live: null,
    outgoing: null,
    transition: null,
    curtain: 1,
  };
  private readonly hooks: VjCompositorLayersHooks;
  private readonly held: Record<VjLayerName, VjHeldSource | null> = {
    a: null,
    b: null,
  };
  private readonly transitionDraw = {
    programKey: "transition.fade" as VjProgramKey,
    progress: 0,
    seed: 0,
  };
  private adoption: { clipId: string; held: VjHeldSource } | null = null;
  private appliedTargetKey: string | null | undefined = undefined;
  private fadeLayer: VjLayerName | null = null;
  private fadeClipId: string | null = null;
  private fadeStartMs = 0;
  private fadeProgress = 0;
  private catchUpStartMs: number | null = null;
  private catchUpFromProgress = 0;
  private transitionCount = 0;
  private curtainLevel = 1;
  private lastAdvanceMs: number | null = null;

  constructor(hooks: VjCompositorLayersHooks) {
    this.hooks = hooks;
  }

  /** True when the last `target` or `adoptSwap` named a source to show live. */
  get hasLiveTarget(): boolean {
    return typeof this.appliedTargetKey === "string";
  }

  heldOf(layer: VjLayerName): VjHeldSource | null {
    return this.held[layer];
  }

  /** The URL of a target waiting behind a catch-up (held with no source yet). */
  pendingSourceUrl(): string | null {
    const sourceUrl = this.state.pendingTarget?.clip.sourceUrl ?? "";
    return sourceUrl === "" ? null : sourceUrl;
  }

  /** True when this renderable (same `clipId|sourceUrl`) is the target the layers already follow. */
  isCurrentTarget(renderable: VjRenderableSource): boolean {
    return vjEngineSourceKey(renderable) === this.appliedTargetKey;
  }

  /** What should be live now; the same `clipId|sourceUrl` twice changes nothing. */
  target(
    renderable: VjRenderableSource | null,
    transition: VjResolvedTransition,
  ): void {
    const targetKey = renderable ? vjEngineSourceKey(renderable) : null;
    if (targetKey === this.appliedTargetKey) return;
    this.appliedTargetKey = targetKey;
    this.dispatch({ type: "target", clip: renderable, transition });
  }

  /** Pre-roll (decision 9): loads and primes the next live source hidden; null cancels it. */
  prepare(renderable: VjRenderableSource | null): void {
    this.dispatch({ type: "prepare", source: renderable });
  }

  /**
   * Swap (decision 12): the mix source moves into the free layer already
   * playing and primed, then the target arms it, so the old live source fades
   * out over the transition length. When the free layer is busy with a target
   * in flight, the mix source is retired and the clip loads like any target.
   */
  adoptSwap(
    renderable: VjRenderableSource,
    held: VjHeldSource,
    transition: VjResolvedTransition,
  ): void {
    this.adoption = { clipId: renderable.clipId, held };
    this.dispatch({ type: "prepare", source: renderable });
    if (this.adoption !== null) {
      this.adoption = null;
      this.hooks.sources.retire(held.source);
    } else {
      const layer = this.layerOf(held.source);
      if (layer !== null) {
        this.dispatch({ type: "firstFrame", layer, clipId: renderable.clipId });
      }
    }
    this.appliedTargetKey = vjEngineSourceKey(renderable);
    this.dispatch({
      type: "target",
      clip: renderable,
      transition: { mode: "fade", durationMs: transition.durationMs },
    });
  }

  onFirstFrame(source: VjEngineSource): void {
    const layer = this.layerOf(source);
    const held = layer === null ? null : this.held[layer];
    if (layer === null || !held) return;
    this.dispatch({
      type: "firstFrame",
      layer,
      clipId: held.renderable.clipId,
    });
  }

  onFailed(source: VjEngineSource, failure: VjPreloadFailure): void {
    const layer = this.layerOf(source);
    const held = layer === null ? null : this.held[layer];
    if (layer === null || !held) return;
    const clipId = held.renderable.clipId;
    const slot = this.state.slots[layer];
    const isLoadingThisClip =
      this.state.incoming?.layer === layer &&
      slot.phase === "loading" &&
      slot.clip?.clipId === clipId;
    this.dispatch({ type: "failed", layer, clipId });
    if (isLoadingThisClip) this.hooks.onClipFailed(clipId, failure);
  }

  /** Moves the running transition, catch-up and curtain to `nowMs`, then fills `draw`. */
  advance(nowMs: number): VjLayerDrawState {
    const deltaMs =
      this.lastAdvanceMs === null ? 0 : Math.max(0, nowMs - this.lastAdvanceMs);
    this.lastAdvanceMs = nowMs;
    this.advanceFade(nowMs);
    this.advanceCurtain(deltaMs);
    this.fillDraw();
    return this.draw;
  }

  /** Forgets every held source; the registry disposes them, with no release reports (compositor dispose). */
  disposeAll(): void {
    for (const layer of VJ_LAYER_NAMES) this.held[layer] = null;
    this.adoption = null;
    this.draw.live = null;
    this.draw.outgoing = null;
    this.draw.transition = null;
  }

  private layerOf(source: VjEngineSource): VjLayerName | null {
    if (this.held.a?.source === source) return "a";
    if (this.held.b?.source === source) return "b";
    return null;
  }

  private dispatch(event: VjLayerEvent): void {
    const next = reduceVjLayers(this.state, event);
    if (next === this.state) return;
    this.state = next;
    this.syncSources();
    this.hooks.onChange();
  }

  /** Each slot's source follows the clip the slot holds; leaving and empty slots hold none. */
  private syncSources(): void {
    for (const layer of VJ_LAYER_NAMES) {
      const slot = this.state.slots[layer];
      const wanted =
        slot.phase === "empty" || slot.phase === "leaving" ? null : slot.clip;
      const current = this.held[layer];
      if (current && wanted && current.renderable.clipId === wanted.clipId) {
        continue;
      }
      if (current) {
        this.held[layer] = null;
        this.hooks.sources.retire(current.source);
      }
      if (!wanted) continue;
      const adoption = this.adoption;
      if (adoption && adoption.clipId === wanted.clipId) {
        this.adoption = null;
        this.held[layer] = adoption.held;
        continue;
      }
      const source = this.hooks.sources.create(wanted, this);
      this.held[layer] = heldVjSourceOf(source, wanted);
    }
  }

  private resetFade(): void {
    this.fadeLayer = null;
    this.fadeClipId = null;
    this.fadeProgress = 0;
    this.catchUpStartMs = null;
  }

  private advanceFade(nowMs: number): void {
    const incoming = this.state.incoming;
    const slot = incoming ? this.state.slots[incoming.layer] : null;
    if (
      !incoming ||
      !slot ||
      (slot.phase !== "fadingIn" && slot.phase !== "catchingUp")
    ) {
      this.resetFade();
      return;
    }
    const clipId = slot.clip?.clipId ?? "";
    if (this.fadeLayer !== incoming.layer || this.fadeClipId !== clipId) {
      this.resetFade();
      this.fadeLayer = incoming.layer;
      this.fadeClipId = clipId;
      this.fadeStartMs = nowMs;
      this.transitionCount += 1;
      this.transitionDraw.programKey = this.hooks.transitionProgramOf(
        incoming.mode,
        nowMs,
      );
      this.transitionDraw.seed = transitionSeedOf(this.transitionCount);
    }
    if (slot.phase === "fadingIn") {
      this.fadeProgress =
        incoming.durationMs > 0
          ? Math.min(1, (nowMs - this.fadeStartMs) / incoming.durationMs)
          : 1;
      if (this.fadeProgress >= 1) {
        this.dispatch({ type: "fadeEnded", layer: incoming.layer, clipId });
      }
      return;
    }
    if (this.catchUpStartMs === null) {
      this.catchUpStartMs = nowMs;
      this.catchUpFromProgress = this.fadeProgress;
    }
    const catchUp = Math.min(1, (nowMs - this.catchUpStartMs) / VJ_CATCH_UP_MS);
    this.fadeProgress =
      this.catchUpFromProgress +
      (1 - this.catchUpFromProgress) * easeOutCubic(catchUp);
    if (catchUp >= 1) {
      this.dispatch({ type: "catchUpEnded", layer: incoming.layer, clipId });
    }
  }

  private advanceCurtain(deltaMs: number): void {
    const target = this.state.isBlackRequested ? 1 : 0;
    const fadeMs = this.state.curtainFadeMs;
    if (fadeMs <= 0) {
      this.curtainLevel = target;
      return;
    }
    const step = deltaMs / fadeMs;
    this.curtainLevel =
      target > this.curtainLevel
        ? Math.min(target, this.curtainLevel + step)
        : Math.max(target, this.curtainLevel - step);
  }

  private fillDraw(): void {
    const { state, draw } = this;
    const incoming = state.incoming;
    const isRising =
      incoming !== null &&
      this.fadeLayer === incoming.layer &&
      state.front !== null &&
      state.front !== incoming.layer;
    if (isRising && state.front !== null) {
      draw.live = this.held[incoming.layer];
      draw.outgoing = this.held[state.front];
      this.transitionDraw.progress = this.fadeProgress;
      draw.transition = this.transitionDraw;
    } else {
      draw.live = state.front === null ? null : this.held[state.front];
      draw.outgoing = null;
      draw.transition = null;
    }
    draw.curtain = this.curtainLevel;
  }
}

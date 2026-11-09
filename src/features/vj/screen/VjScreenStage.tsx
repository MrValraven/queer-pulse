/**
 * The projector's stage (engine plan, decision 13; Task E22; simple renderer
 * plan, Task T10): mounts the WebGL compositor, the DOM renderer and the
 * simple renderer as the renderer phase asks and hands them the same applied
 * state.
 *
 * - `probing`, `webgl2`: the WebGL stage alone.
 * - `webgl2Restoring`: the WebGL stage stays mounted with its canvas hidden,
 *   and the DOM renderer draws over it until the context comes back.
 * - `dom`: the backup DOM renderer alone.
 * - `simple`: the simple renderer the remote picked, alone.
 *
 * The hand-off (useVjRendererHandOff): a remote switch keeps the leaving
 * renderer mounted and drawing until the arriving one reports its first live
 * frame, or VJ_RENDERER_HAND_OFF_MAX_MS passes, and the leaving one unmounts
 * in that same commit. The renderers stack in DOM order (engine, DOM, simple),
 * each in its own slot, so a renderer keeps its instance while others come
 * and go. The simple renderer arrives on top at 1% opacity; the engine and
 * the DOM renderer arrive under the opaque simple stage, their first target
 * cut in. The projector never shows a frame no renderer drew.
 *
 * The simple renderer also takes the queue head (it pre-rolls the next clip)
 * and, while a generator is live, the page's fallback clip.
 *
 * Object URLs (useVjLeavingRendererSources): the handle answers true for a URL
 * any mounted renderer holds, and a URL one renderer releases reaches the page
 * only when no other mounted renderer holds it. What a renderer held when it
 * left is released once its unmount commits, unless another still holds it.
 */
import {
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useMemo,
  useRef,
  type JSX,
  type Ref,
  type RefObject,
} from "react";
import type {
  VjRenderer,
  VjRenderMode,
  VjStageState,
} from "../../../shared/contracts/vj";
import type { VjCompositor, VjScheduledLook } from "../engine/vjCompositor";
import {
  vjEngineLookOf,
  type VjClockReader,
  type VjEngineLayers,
  type VjEngineLook,
} from "../engine/vjEngineLook";
import { useVjLeavingRendererSources } from "./useVjLeavingRendererSources";
import { useVjRendererHandOff } from "./useVjRendererHandOff";
import { useVjRendererKind } from "./useVjRendererKind";
import { useVjScreenHealth } from "./useVjScreenHealth";
import { VjEngineStage, type VjEngineStageEvent } from "./VjEngineStage";
import type { VjRenderableClip, VjRenderableSource } from "./vjLayerMachine";
import {
  vjDrawingRendererOf,
  vjRendererMountsOf,
  type VjDrawingRenderer,
  type VjRendererMounts,
  type VjRendererState,
} from "./vjRendererKind";
import { VjSimpleRenderer } from "./VjSimpleRenderer";
import type { VjStageHandle } from "./vjStageHandle";
import { VjStageRenderer } from "./VjStageRenderer";

export interface VjScreenStageProps {
  /** The applied stage state (useVjStage's `state`, or the record's offline). */
  state: VjStageState;
  /** The 7.4 queue head (useVjStage's `upcoming`); `applyAt` is server epoch ms. */
  upcoming: { state: VjStageState; applyAt: number } | null;
  live: VjRenderableSource | null;
  upcomingLive: VjRenderableSource | null;
  mix: VjRenderableClip | null;
  upcomingMix: VjRenderableClip | null;
  /**
   * While a generator is live: the last clip the screen showed, with a URL of
   * its own, so a simple renderer that mounts now keeps that clip on screen.
   */
  fallbackClip?: VjRenderableClip | null;
  /** True on the lead screen only: only the lead strobes. */
  isStrobeEnabled: boolean;
  /** The show's render mode from the remote; `effects` until the remote asks. */
  renderMode: VjRenderMode;
  clock: VjClockReader;
  micLevelRef: RefObject<number | null> | null;
  handleRef: Ref<VjStageHandle>;
  onClipFailed: (clipId: string) => void;
  onSourceReleased: (sourceUrl: string) => void;
  onRendererChange: (state: VjRendererState) => void;
  onHealth: (health: {
    renderer: VjRenderer;
    frames: { fps: number; droppedFrames: number } | null;
    isEffectLoadHigh: boolean;
  }) => void;
}

/** The looks and layers of the applied state and of the queue head, each rebuilt only when its inputs change. */
function useVjStageLooks({
  state,
  upcoming,
  live,
  upcomingLive,
  mix,
  upcomingMix,
  isStrobeEnabled,
}: VjScreenStageProps) {
  const look = useMemo(
    () => vjEngineLookOf(state, { isStrobeEnabled }),
    [state, isStrobeEnabled],
  );
  const layers = useMemo<VjEngineLayers>(() => ({ live, mix }), [live, mix]);
  const next = useMemo<VjScheduledLook | null>(
    () =>
      upcoming === null
        ? null
        : {
            look: vjEngineLookOf(upcoming.state, { isStrobeEnabled }),
            layers: { live: upcomingLive, mix: upcomingMix },
            applyAtServerMs: upcoming.applyAt,
          },
    [upcoming, upcomingLive, upcomingMix, isStrobeEnabled],
  );
  return { look, layers, next };
}

/** Generators carry an empty URL: nothing to hold or release. */
function objectUrlsOf(
  sources: readonly (VjRenderableSource | null)[],
): string[] {
  const sourceUrls: string[] = [];
  for (const source of sources) {
    const sourceUrl = source?.sourceUrl ?? "";
    if (sourceUrl !== "" && !sourceUrls.includes(sourceUrl)) {
      sourceUrls.push(sourceUrl);
    }
  }
  return sourceUrls;
}

interface VjScreenStageHandlers {
  onEngineEvent: (event: VjEngineStageEvent) => void;
  onClipFailed: (renderer: VjDrawingRenderer, clipId: string) => void;
  onSourceReleased: (renderer: VjDrawingRenderer, sourceUrl: string) => void;
  onRendererShown: (renderer: "dom" | "simple") => void;
}

interface VjScreenStageRenderersProps {
  stage: VjScreenStageProps;
  look: VjEngineLook;
  layers: VjEngineLayers;
  next: VjScheduledLook | null;
  mounts: VjRendererMounts;
  /** The engine mounts under the leaving simple renderer: its first target cuts in. */
  isEngineArriving: boolean;
  handleRefs: Readonly<
    Record<VjDrawingRenderer, RefObject<VjStageHandle | null>>
  >;
  compositorRef: RefObject<VjCompositor | null>;
  handlers: VjScreenStageHandlers;
}

/**
 * The three renderers, each in a slot and with a key of its own, so each
 * keeps its instance (and the engine its canvas) while the others mount and
 * unmount. They stack in DOM order: the engine, the DOM renderer, then the
 * simple renderer on top.
 */
function VjScreenStageRenderers({
  stage,
  look,
  layers,
  next,
  mounts,
  isEngineArriving,
  handleRefs,
  compositorRef,
  handlers,
}: VjScreenStageRenderersProps): JSX.Element {
  const { state, live, mix, clock, isStrobeEnabled } = stage;
  return (
    <>
      {mounts.isEngineMounted ? (
        <VjEngineStage
          key="engine"
          look={look}
          layers={layers}
          next={next}
          clock={clock}
          micLevelRef={stage.micLevelRef}
          isHidden={mounts.isEngineHidden}
          handleRef={handleRefs.engine}
          compositorRef={compositorRef}
          onEvent={handlers.onEngineEvent}
          shouldCutFirstTarget={isEngineArriving}
        />
      ) : null}
      {mounts.isDomMounted ? (
        <VjStageRenderer
          key="dom"
          target={live}
          mix={{
            clip: mix,
            amount: state.mix.amount,
            blendMode: state.mix.blendMode,
          }}
          transition={look.transition}
          effects={state.effects}
          tempo={state.tempo}
          clock={clock}
          isStrobeEnabled={isStrobeEnabled}
          handleRef={handleRefs.dom}
          onClipFailed={(clipId) => handlers.onClipFailed("dom", clipId)}
          onSourceReleased={(sourceUrl) =>
            handlers.onSourceReleased("dom", sourceUrl)
          }
          shouldCutFirstTarget={mounts.isDomArriving}
          onShown={() => handlers.onRendererShown("dom")}
        />
      ) : null}
      {mounts.isSimpleMounted ? (
        <VjSimpleRenderer
          key="simple"
          target={live}
          upcoming={stage.upcomingLive}
          fallbackClip={stage.fallbackClip ?? null}
          transition={look.transition}
          speed={state.effects.speed}
          isBlackout={state.effects.isBlackout}
          blackoutFadeMs={look.blackoutFadeMs}
          isArriving={mounts.isSimpleArriving}
          handleRef={handleRefs.simple}
          onClipFailed={(clipId) => handlers.onClipFailed("simple", clipId)}
          onSourceReleased={(sourceUrl) =>
            handlers.onSourceReleased("simple", sourceUrl)
          }
          onShown={() => handlers.onRendererShown("simple")}
        />
      ) : null}
    </>
  );
}

export function VjScreenStage(props: VjScreenStageProps): JSX.Element {
  const { live, mix, handleRef, onClipFailed } = props;
  const renderer = useVjRendererKind(props.renderMode);
  const rendererState = renderer.state;
  const mounts = vjRendererMountsOf(rendererState);
  const drawingRenderer = vjDrawingRendererOf(rendererState);
  const compositorRef = useRef<VjCompositor | null>(null);
  const engineHandleRef = useRef<VjStageHandle | null>(null);
  const domHandleRef = useRef<VjStageHandle | null>(null);
  const simpleHandleRef = useRef<VjStageHandle | null>(null);
  const handleRefs = {
    engine: engineHandleRef,
    dom: domHandleRef,
    simple: simpleHandleRef,
  };
  const { look, layers, next } = useVjStageLooks(props);
  const leaving = useVjLeavingRendererSources({
    mounts,
    sourceUrls: objectUrlsOf([
      live,
      mix,
      props.upcomingLive,
      props.upcomingMix,
      props.fallbackClip ?? null,
    ]),
    handleRefs,
    onSourceReleased: props.onSourceReleased,
  });
  const dispatchRenderer = useVjRendererHandOff({
    state: rendererState,
    dispatch: renderer.dispatch,
    renderMode: props.renderMode,
    snapshotHeld: leaving.snapshotHeld,
  });

  const reportRendererChange = useEffectEvent((changedState: VjRendererState) =>
    props.onRendererChange(changedState),
  );
  useEffect(() => {
    reportRendererChange(rendererState);
  }, [rendererState]);
  useVjScreenHealth({
    renderer: rendererState,
    compositorRef,
    onHealth: props.onHealth,
  });

  useImperativeHandle(
    handleRef,
    () => ({
      holdsSource: (sourceUrl: string) =>
        engineHandleRef.current?.holdsSource(sourceUrl) === true ||
        domHandleRef.current?.holdsSource(sourceUrl) === true ||
        simpleHandleRef.current?.holdsSource(sourceUrl) === true,
    }),
    [],
  );

  /** A URL one renderer let go reaches the page only when no other mounted renderer still plays it. */
  const releaseFrom = (from: VjDrawingRenderer, sourceUrl: string): void => {
    if (!leaving.isHeldByOther(from, sourceUrl)) leaving.release(sourceUrl);
  };
  /** Only the renderer the phase draws with reports clip failures; a leaving one is on its way out. */
  const reportClipFailed = (from: VjDrawingRenderer, clipId: string): void => {
    if (from === drawingRenderer) onClipFailed(clipId);
  };
  const handlers: VjScreenStageHandlers = {
    onEngineEvent: (event) => {
      switch (event.type) {
        case "clipFailed":
          reportClipFailed("engine", event.clipId);
          return;
        case "sourceReleased":
          releaseFrom("engine", event.sourceUrl);
          return;
        default:
          dispatchRenderer(event);
      }
    },
    onClipFailed: reportClipFailed,
    onSourceReleased: releaseFrom,
    onRendererShown: (shownRenderer) =>
      dispatchRenderer({ type: "rendererShown", renderer: shownRenderer }),
  };

  return (
    <VjScreenStageRenderers
      stage={props}
      look={look}
      layers={layers}
      next={next}
      mounts={mounts}
      isEngineArriving={
        drawingRenderer === "engine" && rendererState.handOffFrom === "simple"
      }
      handleRefs={handleRefs}
      compositorRef={compositorRef}
      handlers={handlers}
    />
  );
}

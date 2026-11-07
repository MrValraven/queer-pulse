/**
 * The projector's stage (engine plan, decision 13; Task E22): picks the WebGL
 * compositor or the DOM renderer and hands both the same applied state.
 *
 * - `probing`, `webgl2`: the WebGL stage alone.
 * - `webgl2Restoring`: the WebGL stage stays mounted with its canvas hidden,
 *   and the DOM renderer draws over it until the context comes back.
 * - `dom`: the DOM renderer alone, for the page's life.
 *
 * Object URLs: while both renderers are mounted, the handle answers true for
 * a URL either one holds, and a URL one renderer releases reaches the page
 * only when the other does not hold it, so the page never revokes a URL a
 * mounted renderer still plays. Neither renderer reports anything on
 * unmount, so the URLs each one holds are read just before an event that
 * changes the phase, and once the leaving renderer's unmount commits, each
 * URL it held that the remaining renderer does not hold is released.
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
import type { VjRenderer, VjStageState } from "../../../shared/contracts/vj";
import type { VjCompositor, VjScheduledLook } from "../engine/vjCompositor";
import {
  vjEngineLookOf,
  type VjClockReader,
  type VjEngineLayers,
} from "../engine/vjEngineLook";
import { useVjRendererKind } from "./useVjRendererKind";
import { useVjScreenHealth } from "./useVjScreenHealth";
import { VjEngineStage, type VjEngineStageEvent } from "./VjEngineStage";
import type { VjRenderableClip, VjRenderableSource } from "./vjLayerMachine";
import {
  reduceVjRenderer,
  type VjRendererPhase,
  type VjRendererState,
} from "./vjRendererKind";
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
  /** True on the lead screen only: only the lead strobes. */
  isStrobeEnabled: boolean;
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

interface VjHeldSnapshot {
  engine: ReadonlySet<string>;
  dom: ReadonlySet<string>;
}

interface VjLeavingRendererInput {
  phase: VjRendererPhase;
  /** The object URLs the props hand the renderers (live, mix, and the queue head's). */
  sourceUrls: readonly string[];
  engineHandleRef: RefObject<VjStageHandle | null>;
  domHandleRef: RefObject<VjStageHandle | null>;
  onSourceReleased: (sourceUrl: string) => void;
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

/**
 * Releases the URLs a renderer took with it when it left the stage (WebGL
 * coming back unmounts the DOM renderer; a second loss unmounts the engine).
 * A renderer can only hold a URL its props named, so the candidates are every
 * URL the props named that a renderer may still hold.
 */
function useVjLeavingRendererSources({
  phase,
  sourceUrls,
  engineHandleRef,
  domHandleRef,
  onSourceReleased,
}: VjLeavingRendererInput) {
  const candidatesRef = useRef<Set<string>>(new Set());
  const snapshotRef = useRef<VjHeldSnapshot | null>(null);

  const isHeldByMounted = (sourceUrl: string): boolean =>
    engineHandleRef.current?.holdsSource(sourceUrl) === true ||
    domHandleRef.current?.holdsSource(sourceUrl) === true;

  /** Reports a URL to the page once and forgets it here. */
  const release = (sourceUrl: string): void => {
    candidatesRef.current.delete(sourceUrl);
    const snapshot = snapshotRef.current;
    if (snapshot !== null) {
      snapshotRef.current = {
        engine: withoutUrl(snapshot.engine, sourceUrl),
        dom: withoutUrl(snapshot.dom, sourceUrl),
      };
    }
    onSourceReleased(sourceUrl);
  };

  /** Called just before an event that changes the phase, while both handles still answer. */
  const snapshotHeld = (): void => {
    const engine = new Set<string>();
    const dom = new Set<string>();
    const candidates = new Set([...candidatesRef.current, ...sourceUrls]);
    for (const sourceUrl of candidates) {
      if (engineHandleRef.current?.holdsSource(sourceUrl) === true) {
        engine.add(sourceUrl);
      }
      if (domHandleRef.current?.holdsSource(sourceUrl) === true) {
        dom.add(sourceUrl);
      }
    }
    snapshotRef.current = { engine, dom };
  };

  /** After the phase commits: releases what the leaving renderer held and the remaining one does not. */
  const settleLeavingRenderer = useEffectEvent(() => {
    const snapshot = snapshotRef.current;
    snapshotRef.current = null;
    if (snapshot === null) return;
    const isEngineMounted = phase !== "dom";
    const isDomMounted = phase === "webgl2Restoring" || phase === "dom";
    const leftSourceUrls = new Set<string>([
      ...(isEngineMounted ? [] : snapshot.engine),
      ...(isDomMounted ? [] : snapshot.dom),
    ]);
    for (const sourceUrl of leftSourceUrls) {
      if (!isHeldByMounted(sourceUrl)) release(sourceUrl);
    }
  });

  /** Adds the URLs the props name and forgets what nothing names or holds any more (the page released it). */
  const trackNamedUrls = useEffectEvent((named: readonly string[]) => {
    const candidates = candidatesRef.current;
    for (const sourceUrl of named) candidates.add(sourceUrl);
    for (const sourceUrl of [...candidates]) {
      if (!named.includes(sourceUrl) && !isHeldByMounted(sourceUrl)) {
        candidates.delete(sourceUrl);
      }
    }
  });

  useEffect(() => {
    settleLeavingRenderer();
  }, [phase]);

  const sourceUrlsKey = sourceUrls.join("\n");
  useEffect(() => {
    trackNamedUrls(sourceUrlsKey === "" ? [] : sourceUrlsKey.split("\n"));
  }, [sourceUrlsKey]);

  return { release, snapshotHeld };
}

function withoutUrl(
  sourceUrls: ReadonlySet<string>,
  sourceUrl: string,
): ReadonlySet<string> {
  if (!sourceUrls.has(sourceUrl)) return sourceUrls;
  const remaining = new Set(sourceUrls);
  remaining.delete(sourceUrl);
  return remaining;
}

export function VjScreenStage(props: VjScreenStageProps): JSX.Element {
  const {
    state,
    mix,
    live,
    isStrobeEnabled,
    clock,
    micLevelRef,
    handleRef,
    onClipFailed,
    onSourceReleased,
  } = props;
  const renderer = useVjRendererKind();
  const rendererState = renderer.state;
  const { phase } = rendererState;
  const compositorRef = useRef<VjCompositor | null>(null);
  const engineHandleRef = useRef<VjStageHandle | null>(null);
  const domHandleRef = useRef<VjStageHandle | null>(null);
  const { look, layers, next } = useVjStageLooks(props);
  const leaving = useVjLeavingRendererSources({
    phase,
    sourceUrls: objectUrlsOf([
      live,
      mix,
      props.upcomingLive,
      props.upcomingMix,
    ]),
    engineHandleRef,
    domHandleRef,
    onSourceReleased,
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
        domHandleRef.current?.holdsSource(sourceUrl) === true,
    }),
    [],
  );

  const handleEngineEvent = (event: VjEngineStageEvent): void => {
    switch (event.type) {
      case "clipFailed":
        // While WebGL restores the DOM renderer is on screen and reports its own.
        if (phase !== "webgl2Restoring") onClipFailed(event.clipId);
        return;
      case "sourceReleased":
        if (domHandleRef.current?.holdsSource(event.sourceUrl) !== true) {
          leaving.release(event.sourceUrl);
        }
        return;
      default:
        // A renderer about to leave: read what both hold while both answer.
        if (reduceVjRenderer(rendererState, event).phase !== phase) {
          leaving.snapshotHeld();
        }
        renderer.dispatch(event);
    }
  };

  const handleDomSourceReleased = (sourceUrl: string): void => {
    if (engineHandleRef.current?.holdsSource(sourceUrl) === true) return;
    leaving.release(sourceUrl);
  };

  const isEngineMounted = phase !== "dom";
  const isDomMounted = phase === "webgl2Restoring" || phase === "dom";
  return (
    <>
      {isEngineMounted ? (
        <VjEngineStage
          look={look}
          layers={layers}
          next={next}
          clock={clock}
          micLevelRef={micLevelRef}
          isHidden={phase === "webgl2Restoring"}
          handleRef={engineHandleRef}
          compositorRef={compositorRef}
          onEvent={handleEngineEvent}
        />
      ) : null}
      {isDomMounted ? (
        <VjStageRenderer
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
          handleRef={domHandleRef}
          onClipFailed={onClipFailed}
          onSourceReleased={handleDomSourceReleased}
        />
      ) : null}
    </>
  );
}

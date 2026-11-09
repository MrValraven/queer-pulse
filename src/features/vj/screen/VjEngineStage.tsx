/**
 * The WebGL stage (engine plan, Task E22): hosts one VjCompositor, its canvas
 * and the media host its hidden video elements decode in, and hands the
 * compositor each look, its layers and the queued frame.
 *
 * The canvas is created in the layout effect that creates the compositor and
 * removed with it. Disposing the compositor loses its context for good, so a
 * second compositor (a remount, React's development double effect) needs a
 * fresh canvas to get a live context.
 */
import {
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type JSX,
  type Ref,
  type RefObject,
} from "react";
import { cx } from "../../../shared/lib/cx";
import {
  VjCompositor,
  type VjCompositorEvent,
  type VjScheduledLook,
} from "../engine/vjCompositor";
import type {
  VjClockReader,
  VjEngineLayers,
  VjEngineLook,
} from "../engine/vjEngineLook";
import { readVjPalette } from "../engine/vjPalette";
import { vjCanvasSize } from "../engine/vjRenderScale";
import type { VjStageHandle } from "./vjStageHandle";
import styles from "./VjEngineStage.module.css";

/** What the WebGL stage reports: the compositor's events, plus `ready` once it started. */
export type VjEngineStageEvent = VjCompositorEvent | { type: "ready" };

export interface VjEngineStageProps {
  look: VjEngineLook;
  layers: VjEngineLayers;
  /** The queue head (contract 7.4): pre-rolled at once, applied on the first frame at or after applyAt. */
  next: VjScheduledLook | null;
  clock: VjClockReader;
  micLevelRef: RefObject<number | null> | null;
  /** True while the context restores: the canvas hides and the DOM renderer draws on top. */
  isHidden: boolean;
  handleRef: Ref<VjStageHandle>;
  compositorRef: Ref<VjCompositor | null>;
  onEvent: (event: VjEngineStageEvent) => void;
  /** A hand-off arrival: the compositor cuts its first target in. Read once, when the compositor is created. */
  shouldCutFirstTarget?: boolean;
}

function assignVjRef<T>(ref: Ref<T> | undefined, value: T): void {
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  if (ref) ref.current = value;
}

/** Backing store for the full-bleed canvas: the window in device pixels, at most 1080p worth. */
function sizeVjCanvas(canvas: HTMLCanvasElement): void {
  const size = vjCanvasSize(
    window.innerWidth,
    window.innerHeight,
    window.devicePixelRatio,
  );
  if (canvas.width !== size.width) canvas.width = size.width;
  if (canvas.height !== size.height) canvas.height = size.height;
}

function createVjEngineCanvas(stage: HTMLElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.className = styles.canvas ?? "";
  canvas.setAttribute("aria-hidden", "true");
  canvas.setAttribute("data-vj-engine-canvas", "");
  sizeVjCanvas(canvas);
  stage.append(canvas);
  return canvas;
}

interface VjEngineLatest {
  clock: VjClockReader;
  micLevelRef: RefObject<number | null> | null;
  onEvent: (event: VjEngineStageEvent) => void;
  compositorRef: Ref<VjCompositor | null>;
  shouldCutFirstTarget: boolean;
}

/**
 * Creates the compositor once per mount. It reads the clock, the mic level,
 * the event callback and the compositor ref through `latestRef`, so new
 * props never rebuild it. `shouldCutFirstTarget` is read at creation only.
 */
function useVjCompositorHost(
  stageRef: RefObject<HTMLDivElement | null>,
  mediaHostRef: RefObject<HTMLDivElement | null>,
  latestRef: RefObject<VjEngineLatest>,
): RefObject<VjCompositor | null> {
  const instanceRef = useRef<VjCompositor | null>(null);
  useLayoutEffect(() => {
    const stage = stageRef.current;
    const mediaHost = mediaHostRef.current;
    if (stage === null || mediaHost === null) return;
    const canvas = createVjEngineCanvas(stage);
    const handleResize = (): void => sizeVjCanvas(canvas);
    window.addEventListener("resize", handleResize);
    const micLevelRef: RefObject<number | null> = {
      get current() {
        return latestRef.current.micLevelRef?.current ?? null;
      },
    };
    const result = VjCompositor.create({
      canvas,
      mediaHost,
      palette: readVjPalette(),
      clock: {
        serverNow: () => latestRef.current.clock.serverNow(),
        toLocalTime: (serverMs) =>
          latestRef.current.clock.toLocalTime(serverMs),
      },
      micLevelRef,
      onEvent: (event) => latestRef.current.onEvent(event),
      shouldCutFirstTarget: latestRef.current.shouldCutFirstTarget,
    });
    const compositor = result.ok ? result.compositor : null;
    const { compositorRef } = latestRef.current;
    instanceRef.current = compositor;
    assignVjRef(compositorRef, compositor);
    latestRef.current.onEvent(
      result.ok
        ? { type: "ready" }
        : { type: "unavailable", reason: result.reason },
    );
    return () => {
      window.removeEventListener("resize", handleResize);
      instanceRef.current = null;
      assignVjRef(compositorRef, null);
      compositor?.dispose();
      canvas.remove();
    };
  }, [stageRef, mediaHostRef, latestRef]);
  return instanceRef;
}

export function VjEngineStage({
  look,
  layers,
  next,
  clock,
  micLevelRef,
  isHidden,
  handleRef,
  compositorRef,
  onEvent,
  shouldCutFirstTarget = false,
}: VjEngineStageProps): JSX.Element {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const mediaHostRef = useRef<HTMLDivElement | null>(null);
  const latestRef = useRef<VjEngineLatest>({
    clock,
    micLevelRef,
    onEvent,
    compositorRef,
    shouldCutFirstTarget,
  });
  // Declared before the host, so the compositor's first events reach the
  // callback of the render that mounted it.
  useLayoutEffect(() => {
    latestRef.current = {
      clock,
      micLevelRef,
      onEvent,
      compositorRef,
      shouldCutFirstTarget,
    };
  });
  const instanceRef = useVjCompositorHost(stageRef, mediaHostRef, latestRef);

  // The look before the layers, in one effect: the layers' target uses the
  // look's transition. Declared before the schedule, so a frame React applies
  // arms its pre-rolled source before the next schedule replaces the pre-roll.
  useLayoutEffect(() => {
    const compositor = instanceRef.current;
    if (compositor === null) return;
    compositor.setLook(look);
    compositor.setLayers(layers);
  }, [instanceRef, look, layers]);

  useLayoutEffect(() => {
    instanceRef.current?.schedule(next);
  }, [instanceRef, next]);

  useImperativeHandle(
    handleRef,
    () => ({
      holdsSource: (sourceUrl: string) =>
        instanceRef.current?.holdsSource(sourceUrl) ?? false,
    }),
    [instanceRef],
  );

  return (
    <div
      ref={stageRef}
      className={cx(styles.stage, isHidden && styles.isHidden)}
      data-vj-engine-stage=""
      data-vj-hidden={isHidden ? "true" : undefined}
    >
      <div ref={mediaHostRef} className={styles.mediaHost} aria-hidden="true" />
    </div>
  );
}

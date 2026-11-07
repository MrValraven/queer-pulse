/**
 * The renderer's part of the screen health (contract 3.8; engine plan, Task
 * E22). One report right away when the renderer kind changes (no frame
 * reading yet), then one every VJ_SCREEN_STATUS_REPORT_INTERVAL_MS.
 *
 * - WebGL: frames and the effect load come from `compositor.readHealth()`.
 * - DOM (and while WebGL restores): a requestAnimationFrame sampler records
 *   every frame into a VjFrameStats; the DOM renderer has no adaptive render
 *   scale, so its effect load never reads high.
 */
import { useEffect, useEffectEvent, type RefObject } from "react";
import type { VjRenderer } from "../../../shared/contracts/vj";
import type { VjCompositor } from "../engine/vjCompositor";
import { VjFrameStats } from "../engine/vjFrameStats";
import { VJ_SCREEN_STATUS_REPORT_INTERVAL_MS } from "../vj.constants";
import { vjRendererOf, type VjRendererState } from "./vjRendererKind";

export interface VjRendererHealth {
  renderer: VjRenderer;
  frames: { fps: number; droppedFrames: number } | null;
  isEffectLoadHigh: boolean;
}

/** The engine's reading, or no frames while the compositor is not up yet. */
function readVjEngineHealth(compositor: VjCompositor | null): VjRendererHealth {
  if (compositor === null) {
    return { renderer: "webgl2", frames: null, isEffectLoadHigh: false };
  }
  const health = compositor.readHealth();
  return {
    renderer: "webgl2",
    frames: { fps: health.fps, droppedFrames: health.droppedFrames },
    isEffectLoadHigh: health.isEffectLoadHigh,
  };
}

export function useVjScreenHealth(input: {
  renderer: VjRendererState;
  compositorRef: RefObject<VjCompositor | null>;
  onHealth: (health: VjRendererHealth) => void;
}): void {
  const { compositorRef } = input;
  const rendererKind = vjRendererOf(input.renderer);
  const reportHealth = useEffectEvent((health: VjRendererHealth) =>
    input.onHealth(health),
  );

  useEffect(() => {
    if (rendererKind !== "webgl2") return;
    reportHealth({ renderer: "webgl2", frames: null, isEffectLoadHigh: false });
    const intervalHandle = window.setInterval(() => {
      reportHealth(readVjEngineHealth(compositorRef.current));
    }, VJ_SCREEN_STATUS_REPORT_INTERVAL_MS);
    return () => window.clearInterval(intervalHandle);
  }, [rendererKind, compositorRef]);

  useEffect(() => {
    if (rendererKind !== "dom") return;
    const stats = new VjFrameStats();
    let frameHandle = 0;
    // One closure for the page's life on DOM: the sampler allocates nothing per frame.
    const sampleFrame = (frameTimeMs: number): void => {
      stats.record(frameTimeMs);
      frameHandle = window.requestAnimationFrame(sampleFrame);
    };
    frameHandle = window.requestAnimationFrame(sampleFrame);
    reportHealth({ renderer: "dom", frames: null, isEffectLoadHigh: false });
    const intervalHandle = window.setInterval(() => {
      const reading = stats.read(performance.now());
      reportHealth({
        renderer: "dom",
        frames: { fps: reading.fps, droppedFrames: reading.droppedFrames },
        isEffectLoadHigh: false,
      });
    }, VJ_SCREEN_STATUS_REPORT_INTERVAL_MS);
    return () => {
      window.cancelAnimationFrame(frameHandle);
      window.clearInterval(intervalHandle);
    };
  }, [rendererKind]);
}

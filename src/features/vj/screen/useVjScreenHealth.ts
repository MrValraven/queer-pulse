/**
 * The renderer's part of the screen health (contract 3.8; engine plan, Task
 * E22). Then one report every VJ_SCREEN_STATUS_REPORT_INTERVAL_MS.
 *
 * - WebGL: one report right away when the kind changes (no frame reading
 *   yet), frames and the effect load from `compositor.readHealth()`.
 * - DOM (and while WebGL restores) and the simple renderer: a
 *   requestAnimationFrame sampler records every frame into a VjFrameStats and
 *   the report names the renderer ("dom" or "simple"). Neither has an
 *   adaptive render scale, so their effect load never reads high. The first
 *   report waits VJ_SAMPLED_FIRST_REPORT_DELAY_MS and carries the sampler's
 *   real frame figures, so the remote card never shows "0 frames a second"
 *   right after a switch. A report that finds no sampled frames is skipped
 *   and the regular interval reports instead, so the figure on the wire is
 *   always a measurement.
 */
import { useEffect, useEffectEvent, type RefObject } from "react";
import type { VjRenderer } from "../../../shared/contracts/vj";
import type { VjCompositor } from "../engine/vjCompositor";
import { VjFrameStats } from "../engine/vjFrameStats";
import { VJ_SCREEN_STATUS_REPORT_INTERVAL_MS } from "../vj.constants";
import { vjRendererOf, type VjRendererState } from "./vjRendererKind";

/**
 * How long the sampled renderers (dom, simple) collect frames before their
 * first report. About thirty frames at 60 Hz, enough for a real reading, and
 * short enough for the remote's switch to read the new renderer promptly.
 */
export const VJ_SAMPLED_FIRST_REPORT_DELAY_MS = 500;

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
    if (rendererKind === "webgl2") return;
    const stats = new VjFrameStats();
    let frameHandle = 0;
    // One closure per renderer kind: the sampler allocates nothing per frame.
    const sampleFrame = (frameTimeMs: number): void => {
      stats.record(frameTimeMs);
      frameHandle = window.requestAnimationFrame(sampleFrame);
    };
    frameHandle = window.requestAnimationFrame(sampleFrame);
    const reportSample = (): void => {
      const reading = stats.read(performance.now());
      // An empty sampler reads fps 0, which is no measurement: skip it.
      if (reading.fps <= 0) return;
      reportHealth({
        renderer: rendererKind,
        frames: { fps: reading.fps, droppedFrames: reading.droppedFrames },
        isEffectLoadHigh: false,
      });
    };
    const firstReportHandle = window.setTimeout(
      reportSample,
      VJ_SAMPLED_FIRST_REPORT_DELAY_MS,
    );
    const intervalHandle = window.setInterval(() => {
      const reading = stats.read(performance.now());
      reportHealth({
        renderer: rendererKind,
        frames: { fps: reading.fps, droppedFrames: reading.droppedFrames },
        isEffectLoadHigh: false,
      });
    }, VJ_SCREEN_STATUS_REPORT_INTERVAL_MS);
    return () => {
      window.cancelAnimationFrame(frameHandle);
      window.clearTimeout(firstReportHandle);
      window.clearInterval(intervalHandle);
    };
  }, [rendererKind]);
}

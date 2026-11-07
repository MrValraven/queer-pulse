import type { VjScreenStatus } from "../../../../../shared/contracts/vj";

/**
 * One line of a screen's health in the Screens sheet: a copy key, the values
 * it interpolates and its tone. A line whose figure changes between reports
 * names that figure in `rolling`, so the sheet can roll it like an odometer.
 */
export interface VjScreenHealthLine {
  key: string;
  values: Record<string, string | number>;
  tone: "plain" | "warning";
  /** The placeholder in `key` whose figure changes, and its raw number. */
  rolling?: { token: string; numericValue: number };
}

const RENDERER_KEY = {
  webgl2: "vj:screensSheet.rendererWebgl",
  dom: "vj:screensSheet.rendererDom",
} as const;

/**
 * What a screen says about itself: the renderer it draws with (the simple
 * renderer says some effects are off there), frames a second, dropped
 * frames, the clip cache size and a warning while the effect load runs too
 * heavy. Before its first report it says so in one line. A screen with the
 * mic on adds its level last.
 */
export function vjScreenHealthLines(
  screen: VjScreenStatus,
  formatBytes: (bytes: number) => string,
): VjScreenHealthLine[] {
  const { health, mic } = screen;
  const lines: VjScreenHealthLine[] = [];
  if (health === null) {
    lines.push({
      key: "vj:screensSheet.healthUnknown",
      values: {},
      tone: "plain",
    });
  } else {
    const framesPerSecond = Math.round(health.fps);
    lines.push(
      { key: RENDERER_KEY[health.renderer], values: {}, tone: "plain" },
      {
        key: "vj:screensSheet.fps",
        values: { fps: framesPerSecond },
        tone: "plain",
        rolling: { token: "fps", numericValue: framesPerSecond },
      },
      {
        key: "vj:screensSheet.dropped",
        values: { count: health.droppedFrames },
        tone: "plain",
        rolling: { token: "count", numericValue: health.droppedFrames },
      },
      {
        key: "vj:screensSheet.cache",
        values: { size: formatBytes(health.cacheBytes) },
        tone: "plain",
        rolling: { token: "size", numericValue: health.cacheBytes },
      },
    );
    if (health.isEffectLoadHigh) {
      lines.push({
        key: "vj:screensSheet.loadWarning",
        values: {},
        tone: "warning",
      });
    }
  }
  if (mic !== null) {
    const percent = Math.round(mic.level * 100);
    lines.push({
      key: "vj:screensSheet.micOn",
      values: { percent },
      tone: "plain",
      rolling: { token: "percent", numericValue: percent },
    });
  }
  return lines;
}

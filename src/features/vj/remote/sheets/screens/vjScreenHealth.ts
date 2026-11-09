import type { VjScreenStatus } from "../../../../../shared/contracts/vj";

/**
 * Which health line this is. It stays the same while the line's copy changes
 * (the renderer line names a new renderer in place), so the sheet keys each
 * line on it and only a line that comes or goes folds.
 */
export type VjScreenHealthLineId =
  "unknown" | "renderer" | "fps" | "dropped" | "cache" | "load" | "mic";

/**
 * One line of a screen's health in the Screens sheet: a stable id, a copy
 * key, the values it interpolates and its tone. A line whose figure changes
 * between reports names that figure in `rolling`, so the sheet can roll it
 * like an odometer.
 */
export interface VjScreenHealthLine {
  id: VjScreenHealthLineId;
  key: string;
  values: Record<string, string | number>;
  tone: "plain" | "warning";
  /** The placeholder in `key` whose figure changes, and its raw number. */
  rolling?: { token: string; numericValue: number };
  /** The action the sheet offers beside the line; only the load warning has one. */
  action?: "switchToSimple";
}

const RENDERER_KEY = {
  webgl2: "vj:screensSheet.rendererWebgl",
  dom: "vj:screensSheet.rendererDom",
  simple: "vj:screensSheet.rendererSimple",
} as const;

/**
 * What a screen says about itself: the renderer it draws with (the backup
 * renderer says some effects are off there, the simple renderer says it fades
 * only), frames a second, dropped
 * frames, the clip cache size and a warning while the effect load runs too
 * heavy. The load warning carries the `switchToSimple` action. Before its
 * first report it says so in one line. A screen with the mic on adds its
 * level last.
 */
export function vjScreenHealthLines(
  screen: VjScreenStatus,
  formatBytes: (bytes: number) => string,
): VjScreenHealthLine[] {
  const { health, mic } = screen;
  const lines: VjScreenHealthLine[] = [];
  if (health === null) {
    lines.push({
      id: "unknown",
      key: "vj:screensSheet.healthUnknown",
      values: {},
      tone: "plain",
    });
  } else {
    const framesPerSecond = Math.round(health.fps);
    lines.push(
      {
        id: "renderer",
        key: RENDERER_KEY[health.renderer],
        values: {},
        tone: "plain",
      },
      {
        id: "fps",
        key: "vj:screensSheet.fps",
        values: { fps: framesPerSecond },
        tone: "plain",
        rolling: { token: "fps", numericValue: framesPerSecond },
      },
      {
        id: "dropped",
        key: "vj:screensSheet.dropped",
        values: { count: health.droppedFrames },
        tone: "plain",
        rolling: { token: "count", numericValue: health.droppedFrames },
      },
      {
        id: "cache",
        key: "vj:screensSheet.cache",
        values: { size: formatBytes(health.cacheBytes) },
        tone: "plain",
        rolling: { token: "size", numericValue: health.cacheBytes },
      },
    );
    if (health.isEffectLoadHigh) {
      lines.push({
        id: "load",
        key: "vj:screensSheet.loadWarning",
        values: {},
        tone: "warning",
        action: "switchToSimple",
      });
    }
  }
  if (mic !== null) {
    const percent = Math.round(mic.level * 100);
    lines.push({
      id: "mic",
      key: "vj:screensSheet.micOn",
      values: { percent },
      tone: "plain",
      rolling: { token: "percent", numericValue: percent },
    });
  }
  return lines;
}

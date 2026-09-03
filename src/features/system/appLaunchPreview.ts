import type { LaunchSeason } from "./appLaunch.utils";

/**
 * Desktop preview of the boot sequence.
 *
 * The launch screen only ever runs on a cold start of the INSTALLED app, which
 * makes it the one surface you cannot look at while building it: no amount of
 * reloading a dev server reproduces it, and the alternative is deploying and
 * picking up a phone. This lets `/simulations` boot the real component inside
 * its device frame, driven entirely by URL flags, so what you are looking at is
 * the shipped code rather than a mock of it.
 *
 * Dev-only, and hard about it: a production build ignores these flags
 * completely, so nobody can hand somebody a link that covers the app with a
 * fake splash screen. That single check also covers the simulations sandbox,
 * which `isSandbox()` already gates to dev for the same reason.
 */
const SEASONS: readonly LaunchSeason[] = [
  "default",
  "pride",
  "remembrance",
  "summer",
];

/** Ceiling on the artificial hold, so a typo cannot wedge the preview. */
const MAX_HOLD_MS = 10_000;

export interface LaunchPreview {
  /** Forces the returning-member greeting with this first name. */
  name: string | null;
  /** Forces a seasonal variant instead of deriving one from today's date. */
  season: LaunchSeason | null;
  /**
   * Holds readiness open for this long. Without it a desktop preview is ready
   * on the first frame and you only ever see the minimum dwell — never the
   * determinate fill running out, the shimmer, or the status copy.
   */
  holdMs: number;
  /** Forces the offline path (longer handoff beat, offline status copy). */
  isOffline: boolean;
}

function parseHold(raw: string | null): number {
  if (!raw) return 0;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.min(parsed, MAX_HOLD_MS);
}

export function readLaunchPreview(): LaunchPreview | null {
  if (typeof window === "undefined") return null;
  if (!import.meta.env.DEV) return null;

  const params = new URLSearchParams(window.location.search);
  if (params.get("launch") !== "preview") return null;

  const season = params.get("launchSeason") as LaunchSeason | null;
  return {
    name: params.get("launchName"),
    season: season && SEASONS.includes(season) ? season : null,
    holdMs: parseHold(params.get("launchHold")),
    isOffline: params.get("launchOffline") === "1",
  };
}

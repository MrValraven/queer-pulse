/**
 * What the remote says about the screens: how many are live, and how ready
 * one clip is across every connected screen whose preload covers its pack.
 */
import type {
  VjClipReadyState,
  VjPreloadFailure,
  VjScreenClipStatus,
  VjScreenStatus,
} from "../../../shared/contracts/vj";

export type VjScreensSummary =
  | { kind: "none" }
  | { kind: "live"; liveCount: number; totalCount: number }
  | { kind: "offline"; totalCount: number };

export function summariseVjScreens(
  screens: readonly VjScreenStatus[],
): VjScreensSummary {
  if (screens.length === 0) return { kind: "none" };
  const liveCount = screens.filter((screen) => screen.isConnected).length;
  if (liveCount === 0) return { kind: "offline", totalCount: screens.length };
  return { kind: "live", liveCount, totalCount: screens.length };
}

export interface VjClipReadiness {
  state: VjClipReadyState | "unknown";
  progress: number;
  failure: VjPreloadFailure | null;
}

const UNKNOWN_READINESS: VjClipReadiness = {
  state: "unknown",
  progress: 0,
  failure: null,
};

/** A covering screen that has not listed the clip yet holds it as queued. */
function clipStatusOn(
  screen: VjScreenStatus,
  clipId: string,
): VjScreenClipStatus {
  return (
    screen.preload.clips.find((clipStatus) => clipStatus.clipId === clipId) ?? {
      clipId,
      state: "queued",
      progress: 0,
      failure: null,
    }
  );
}

/** One clip across every connected screen whose preload covers this pack. */
export function vjClipReadinessOf(
  screens: readonly VjScreenStatus[],
  packId: string,
  clipId: string,
): VjClipReadiness {
  const clipStatuses = screens
    .filter((screen) => screen.isConnected && screen.preload.packId === packId)
    .map((screen) => clipStatusOn(screen, clipId));
  if (clipStatuses.length === 0) return UNKNOWN_READINESS;

  const failedStatuses = clipStatuses.filter(
    (clipStatus) => clipStatus.state === "failed",
  );
  if (failedStatuses.length > 0) {
    const namedFailure = failedStatuses.find(
      (clipStatus) => clipStatus.failure !== null,
    );
    return {
      state: "failed",
      progress: 0,
      failure: namedFailure?.failure ?? null,
    };
  }
  if (clipStatuses.every((clipStatus) => clipStatus.state === "ready")) {
    return { state: "ready", progress: 1, failure: null };
  }
  const lowestProgress = Math.min(
    ...clipStatuses.map((clipStatus) =>
      clipStatus.state === "ready" ? 1 : clipStatus.progress,
    ),
  );
  const isAllQueued = clipStatuses.every(
    (clipStatus) => clipStatus.state === "queued",
  );
  return {
    state: isAllQueued ? "queued" : "loading",
    progress: Math.min(1, Math.max(0, lowestProgress)),
    failure: null,
  };
}

/** The `vj:` catalog key and values; `count` lets `t()` pick the `_one` or `_other` form. */
export function vjScreensSummaryKey(summary: VjScreensSummary): {
  key: string;
  values: Record<string, number>;
} {
  switch (summary.kind) {
    case "none":
      return { key: "vj:remote.screens.none", values: {} };
    case "offline":
      return {
        key: "vj:remote.screens.offline",
        values: { count: summary.totalCount },
      };
    case "live":
      if (summary.liveCount === summary.totalCount) {
        return {
          key: "vj:remote.screens.live",
          values: { count: summary.liveCount },
        };
      }
      return {
        key: "vj:remote.screens.partial",
        values: { live: summary.liveCount, total: summary.totalCount },
      };
  }
}

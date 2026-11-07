/**
 * How ready a pack is across the connected screens, for the pack tabs and the
 * switch confirm. Screens report preload for their current `preload.packId`
 * only (contract 3.8 adds no per-pack summary), so the active pack reads its
 * clip states through `vjClipReadinessOf` and any other pack reads
 * `notPreloaded` while a screen is connected.
 */
import type { VjScreenStatus } from "../../../../shared/contracts/vj";
import { vjClipReadinessOf } from "../../live/vjScreensSummary";

export type VjPackReadiness =
  | { kind: "noScreens" }
  | { kind: "ready"; readyCount: number; totalCount: number }
  | { kind: "partial"; readyCount: number; totalCount: number }
  | { kind: "notPreloaded"; totalCount: number };

/**
 * `packClipIds` holds the pack's clip ids in pack order when the pack is the
 * active one; pass null for any other pack. A clip counts as ready only when
 * every connected screen holds it, so the slowest screen sets the count.
 */
export function vjPackReadinessOf(
  screens: readonly VjScreenStatus[],
  pack: { id: string; clipCount: number },
  packClipIds: readonly string[] | null,
): VjPackReadiness {
  const connectedScreens = screens.filter((screen) => screen.isConnected);
  if (connectedScreens.length === 0) return { kind: "noScreens" };

  const coveringScreens = connectedScreens.filter(
    (screen) => screen.preload.packId === pack.id,
  );
  if (packClipIds === null || coveringScreens.length === 0) {
    return { kind: "notPreloaded", totalCount: pack.clipCount };
  }

  const totalCount = packClipIds.length;
  const isEveryScreenCovering =
    coveringScreens.length === connectedScreens.length;
  const readyCount = isEveryScreenCovering
    ? packClipIds.filter(
        (clipId) =>
          vjClipReadinessOf(connectedScreens, pack.id, clipId).state ===
          "ready",
      ).length
    : 0;
  if (readyCount === totalCount) {
    return { kind: "ready", readyCount, totalCount };
  }
  return { kind: "partial", readyCount, totalCount };
}

/** The confirm shows before switching to a pack that is not active and not fully preloaded. */
export function vjShouldConfirmPackSwitch(
  readiness: VjPackReadiness,
  isActive: boolean,
): boolean {
  if (isActive) return false;
  return readiness.kind === "partial" || readiness.kind === "notPreloaded";
}

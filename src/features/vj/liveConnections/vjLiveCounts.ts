import type { VjLiveDTO } from "../../../shared/contracts/vj";
import type { TFunction } from "../../../shared/i18n/types";

export interface VjLiveCounts {
  screenCount: number;
  remoteCount: number;
}

/** How many screens and remotes the live list holds, across every stage. */
export function vjLiveCountsOf(live: VjLiveDTO): VjLiveCounts {
  let screenCount = 0;
  let remoteCount = 0;
  for (const stage of live.stages) {
    for (const connection of stage.connections) {
      if (connection.role === "screen") screenCount += 1;
      else remoteCount += 1;
    }
  }
  return { screenCount, remoteCount };
}

/** The data attribute each row's Disconnect button carries, set in
 *  VjLiveConnectionList as `data-vj-live-disconnect`. */
export const VJ_LIVE_DISCONNECT_ATTRIBUTE = "data-vj-live-disconnect";

/** The row focus moves to once `connectionId` leaves: the next one, else the
 *  previous one, across every show; null when no other row is left. */
export function vjLiveNeighbourConnectionIdOf(
  live: VjLiveDTO,
  connectionId: string,
): string | null {
  const connectionIds = live.stages.flatMap((stage) =>
    stage.connections.map((connection) => connection.connectionId),
  );
  const index = connectionIds.indexOf(connectionId);
  if (index === -1) return null;
  return connectionIds[index + 1] ?? connectionIds[index - 1] ?? null;
}

/**
 * "2 screens and 1 remote", "1 screen" or "3 remotes", each count through its
 * own plural line; null when both are zero. `bothKey` and `oneKey` name the
 * sentence the counts sit in ({screens} and {remotes}, or {devices}).
 */
export function vjLiveCountLine(
  t: TFunction,
  counts: VjLiveCounts,
  sentence: { bothKey: string; oneKey: string },
): string | null {
  const screens = t("vj:live.screenCount", { count: counts.screenCount });
  const remotes = t("vj:live.remoteCount", { count: counts.remoteCount });
  if (counts.screenCount > 0 && counts.remoteCount > 0) {
    return t(sentence.bothKey, { screens, remotes });
  }
  if (counts.screenCount > 0) return t(sentence.oneKey, { devices: screens });
  if (counts.remoteCount > 0) return t(sentence.oneKey, { devices: remotes });
  return null;
}

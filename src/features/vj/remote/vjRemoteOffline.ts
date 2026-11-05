/**
 * Why the remote cannot send right now, and the line that names it. The
 * remote stays browsable while any reason holds; only its controls wait.
 */
import type { VjStageController } from "../live/useVjStage";
import type { VjConnectionRefusal } from "../realtime/vjTransport";
import { VJ_CONNECTION_REFUSAL_KEY } from "../vjErrors";

export type VjRemoteOfflineReason =
  | { kind: "network" }
  | { kind: "reconnecting" }
  | { kind: "refused"; refusal: VjConnectionRefusal };

/** Device offline: network; refused: the refusal; any other status but attached: reconnecting; attached: null. */
export function vjRemoteOfflineReasonOf(
  stage: Pick<VjStageController, "connection" | "refusal">,
  isOnline: boolean,
): VjRemoteOfflineReason | null {
  if (!isOnline) return { kind: "network" };
  const { status } = stage.connection;
  if (status === "refused") {
    const refusal = stage.refusal ?? stage.connection.refusal ?? "server_error";
    return { kind: "refused", refusal };
  }
  if (status !== "attached") return { kind: "reconnecting" };
  return null;
}

export function vjRemoteOfflineKeyOf(reason: VjRemoteOfflineReason): string {
  switch (reason.kind) {
    case "network":
      return "vj:remote.offline.network";
    case "reconnecting":
      return "vj:remote.offline.reconnecting";
    case "refused":
      return VJ_CONNECTION_REFUSAL_KEY[reason.refusal];
  }
}

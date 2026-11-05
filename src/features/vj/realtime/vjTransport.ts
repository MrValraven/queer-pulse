import type {
  VjAttachPayload,
  VjAttachRole,
  VjAttachSuccess,
} from "../../../shared/contracts/vj";
import type {
  VjAckFor,
  VjClientFrameName,
  VjClientPayload,
  VjScreenStatusPayload,
  VjServerFrame,
} from "./vjFrames";

export type VjConnectionStatus =
  "connecting" | "attached" | "reconnecting" | "refused";

export type VjConnectionRefusal =
  | "not_admin"
  | "screen_replaced"
  | "session_revoked"
  | "unauthorized"
  | "platform_locked"
  | "server_error";

export interface VjConnectionState {
  status: VjConnectionStatus;
  refusal: VjConnectionRefusal | null;
  attach: VjAttachSuccess | null;
}

export const INITIAL_VJ_CONNECTION: VjConnectionState = {
  status: "connecting",
  refusal: null,
  attach: null,
};

export interface VjTransportOptions {
  role: VjAttachRole;
  /** Called at every (re)attach, so a screen sends its latest saved state as restoreState. */
  buildAttachPayload: () => VjAttachPayload;
  onFrame: (frame: VjServerFrame) => void;
  onConnection: (connection: VjConnectionState) => void;
}

export interface VjTransport {
  connect(): void;
  /** Rejects with VjSendError while not attached or when no ack comes within VJ_ACK_TIMEOUT_MS. */
  send<Name extends VjClientFrameName>(
    name: Name,
    payload: VjClientPayload<Name>,
  ): Promise<VjAckFor<Name>>;
  /** screen:status, sent without an ack; dropped while not attached. */
  sendScreenStatus(payload: VjScreenStatusPayload): void;
  dispose(): void;
}

export class VjSendError extends Error {
  readonly frameName: string;
  readonly reason: "disconnected" | "timeout";

  constructor(frameName: string, reason: "disconnected" | "timeout") {
    super(`vj: ${frameName} ${reason}`);
    this.name = "VjSendError";
    this.frameName = frameName;
    this.reason = reason;
  }
}

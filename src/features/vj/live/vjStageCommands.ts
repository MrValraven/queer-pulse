/**
 * The remote's stage commands over a VjTransport (contract 6.2, 6.5.2, 6.6).
 * A command takes its stamp only when it is emitted, so a command refused
 * locally while the socket is down numbers nothing.
 */
import type {
  VjAck,
  VjCommandSuccess,
  VjOverlayStyle,
  VjShuffleIntervalKind,
  VjSocketErrorCode,
  VjSpeed,
  VjStageState,
  VjTransitionMode,
} from "../../../shared/contracts/vj";
import type { VjCommandStamper } from "../realtime/vjCommandStamp";
import type { VjClientFrameName, VjCommandStamp } from "../realtime/vjFrames";
import {
  VjSendError,
  type VjConnectionRefusal,
  type VjTransport,
} from "../realtime/vjTransport";
import {
  isVjSilentSocketCode,
  VJ_CONNECTION_REFUSAL_KEY,
  VJ_FAILURE_KEY,
  vjErrorKeyOf,
} from "../vjErrors";

export type VjCommandOutcome =
  | { ok: true; revision: number; isNoop: boolean }
  | {
      ok: false;
      code: VjSocketErrorCode | "offline" | "timeout" | "failed";
      /** Null for the three stale codes: the state the ack carries is applied and nothing shows. */
      errorKey: string | null;
    };

export interface VjStageCommands {
  setPack(packId: string | null): Promise<VjCommandOutcome>;
  goClip(clipId: string | null): Promise<VjCommandOutcome>;
  setTransition(patch: {
    mode?: VjTransitionMode;
    fadeMs?: number;
  }): Promise<VjCommandOutcome>;
  setOverlay(patch: {
    text?: string;
    style?: VjOverlayStyle;
    isVisible?: boolean;
  }): Promise<VjCommandOutcome>;
  setEffects(patch: {
    speed?: VjSpeed;
    isMonochrome?: boolean;
    isMirrored?: boolean;
    isHueCycling?: boolean;
    isBlackout?: boolean;
  }): Promise<VjCommandOutcome>;
  setStrobe(isStrobing: boolean): Promise<VjCommandOutcome>;
  setShuffle(patch: {
    isOn?: boolean;
    intervalKind?: VjShuffleIntervalKind;
    intervalValue?: number;
    bpm?: number;
  }): Promise<VjCommandOutcome>;
}

type VjCommandAck = VjAck<VjCommandSuccess>;

/**
 * The outcome of a frame that never left this page because the socket is
 * down. After a refusal the copy names the refusal (an expired session, a
 * replaced screen) so the error says why nothing can be sent.
 */
export function offlineVjCommandOutcome(
  frameName: VjClientFrameName,
  refusal: VjConnectionRefusal | null = null,
): VjCommandOutcome {
  return {
    ok: false,
    code: "offline",
    errorKey:
      refusal === null
        ? vjErrorKeyOf(new VjSendError(frameName, "disconnected"))
        : VJ_CONNECTION_REFUSAL_KEY[refusal],
  };
}

function outcomeOfSendFailure(cause: unknown): VjCommandOutcome {
  if (cause instanceof VjSendError) {
    return cause.reason === "timeout"
      ? { ok: false, code: "timeout", errorKey: VJ_FAILURE_KEY.timeout }
      : { ok: false, code: "offline", errorKey: vjErrorKeyOf(cause) };
  }
  return { ok: false, code: "failed", errorKey: vjErrorKeyOf(cause) };
}

/**
 * Sends one acked stage frame and maps its ack. A failure that carries
 * `state` hands it to onAckState (which runs it through the version check);
 * the three stale codes name nothing.
 */
export async function settleVjCommand(
  emit: () => Promise<VjCommandAck>,
  onAckState: (state: VjStageState) => void,
): Promise<VjCommandOutcome> {
  let ack: VjCommandAck;
  try {
    ack = await emit();
  } catch (cause) {
    return outcomeOfSendFailure(cause);
  }
  if (ack.ok) {
    return { ok: true, revision: ack.revision, isNoop: ack.isNoop };
  }
  if (ack.state !== undefined) onAckState(ack.state);
  return {
    ok: false,
    code: ack.code,
    errorKey: isVjSilentSocketCode(ack.code) ? null : vjErrorKeyOf(ack),
  };
}

/** Drops absent fields, so a patch carries only the fields it sets. */
function definedFieldsOf<Patch extends object>(patch: Patch): Patch {
  return Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined),
  ) as Patch;
}

/** Takes a stamp from the stamper only when it emits (attached), sends
 *  through the transport and maps the ack: ok gives { ok, revision, isNoop };
 *  a failure with `state` hands it to onAckState; a VjSendError gives
 *  "offline" (disconnected) or "timeout"; errorKey is null for
 *  isVjSilentSocketCode codes, else vjErrorKeyOf. While refused, the
 *  offline outcome names the refusal through currentRefusal. */
export function createVjStageCommands(
  transport: Pick<VjTransport, "send">,
  stamper: VjCommandStamper,
  onAckState: (state: VjStageState) => void,
  isAttached: () => boolean,
  currentRefusal: () => VjConnectionRefusal | null = () => null,
): VjStageCommands {
  const run = (
    frameName: VjClientFrameName,
    emit: (stamp: VjCommandStamp) => Promise<VjCommandAck>,
  ): Promise<VjCommandOutcome> => {
    if (!isAttached()) {
      return Promise.resolve(
        offlineVjCommandOutcome(frameName, currentRefusal()),
      );
    }
    const stamp = stamper.next();
    return settleVjCommand(() => emit(stamp), onAckState);
  };

  return {
    setPack: (packId) =>
      run("stage:setPack", (stamp) =>
        transport.send("stage:setPack", { packId, ...stamp }),
      ),
    goClip: (clipId) =>
      run("stage:goClip", (stamp) =>
        transport.send("stage:goClip", { clipId, ...stamp }),
      ),
    setTransition: (patch) =>
      run("stage:setTransition", (stamp) =>
        transport.send("stage:setTransition", {
          ...definedFieldsOf(patch),
          ...stamp,
        }),
      ),
    setOverlay: (patch) =>
      run("stage:setOverlay", (stamp) =>
        transport.send("stage:setOverlay", {
          ...definedFieldsOf(patch),
          ...stamp,
        }),
      ),
    setEffects: (patch) =>
      run("stage:setEffects", (stamp) =>
        transport.send("stage:setEffects", {
          ...definedFieldsOf(patch),
          ...stamp,
        }),
      ),
    setStrobe: (isStrobing) =>
      run("stage:setStrobe", (stamp) =>
        transport.send("stage:setStrobe", { isStrobing, ...stamp }),
      ),
    setShuffle: (patch) =>
      run("stage:setShuffle", (stamp) =>
        transport.send("stage:setShuffle", {
          ...definedFieldsOf(patch),
          ...stamp,
        }),
      ),
  };
}

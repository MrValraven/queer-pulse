/**
 * The remote's stage commands over a VjTransport (C 7.4, 7.5, 7.11).
 * A command takes its stamp only when it is emitted, so a command refused
 * locally while the socket is down numbers nothing. screen:identify is the
 * one unstamped remote frame.
 */
import type {
  VjAck,
  VjAckFailure,
  VjCommandSuccess,
  VjEffectSettingPatch,
  VjGeneratorId,
  VjScreenOverride,
  VjSetEffectsPayload,
  VjSocketErrorCode,
  VjStageState,
} from "../../../shared/contracts/vj";
import type { VjCommandStamper } from "../realtime/vjCommandStamp";
import type {
  VjClientFrameName,
  VjCommandFrameName,
  VjCommandPatch,
  VjCommandStamp,
} from "../realtime/vjFrames";
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
  vjErrorValuesOf,
} from "../vjErrors";

/** The {max} or {min} an error line interpolates. */
export interface VjErrorValues {
  max?: number | string;
  min?: number;
}

export type VjCommandFailureOutcome = {
  ok: false;
  code: VjSocketErrorCode | "offline" | "timeout" | "failed";
  /** Null for the silent codes: the state the ack carries is applied and nothing shows. */
  errorKey: string | null;
  /** The {max} or {min} the line interpolates (vjErrorValuesOf). */
  errorValues?: VjErrorValues;
};

export type VjCommandOutcome =
  | { ok: true; revision: number; isNoop: boolean; applyAt: number | null }
  | VjCommandFailureOutcome;

export type VjIdentifyOutcome =
  { ok: true; identifiedCount: number } | VjCommandFailureOutcome;

/** Skips the beat grid (C 7.4); only the three commands below may ask. */
export interface VjImmediateOption {
  isImmediate?: boolean;
}

export interface VjStageCommands {
  setPack(packId: string | null): Promise<VjCommandOutcome>;
  goClip(clipId: string | null): Promise<VjCommandOutcome>;
  goGenerator(
    generatorId: VjGeneratorId | null,
    variant?: string | null,
  ): Promise<VjCommandOutcome>;
  setTransition(
    patch: VjCommandPatch<"stage:setTransition">,
  ): Promise<VjCommandOutcome>;
  setOverlay(
    patch: VjCommandPatch<"stage:setOverlay">,
  ): Promise<VjCommandOutcome>;
  /** isImmediate travels only on a patch that holds isBlackout and nothing else. */
  setEffects(
    patch: VjCommandPatch<"stage:setEffects">,
  ): Promise<VjCommandOutcome>;
  /** isImmediate travels only when the strobe stops. */
  setStrobe(
    isStrobing: boolean,
    options?: VjImmediateOption,
  ): Promise<VjCommandOutcome>;
  setShuffle(
    patch: VjCommandPatch<"stage:setShuffle">,
  ): Promise<VjCommandOutcome>;
  setTempo(patch: VjCommandPatch<"stage:setTempo">): Promise<VjCommandOutcome>;
  setMix(patch: VjCommandPatch<"stage:setMix">): Promise<VjCommandOutcome>;
  swapMix(): Promise<VjCommandOutcome>;
  setScreenOverride(
    screenId: string,
    override: VjScreenOverride | null,
  ): Promise<VjCommandOutcome>;
  resetLook(options?: VjImmediateOption): Promise<VjCommandOutcome>;
  recallScene(sceneId: string): Promise<VjCommandOutcome>;
  setlistSelect(
    setlistId: string | null,
    index: number | null,
  ): Promise<VjCommandOutcome>;
  setlistNext(): Promise<VjCommandOutcome>;
  setlistPrevious(): Promise<VjCommandOutcome>;
  setCountdown(
    patch: VjCommandPatch<"stage:setCountdown">,
  ): Promise<VjCommandOutcome>;
  setLogo(patch: VjCommandPatch<"stage:setLogo">): Promise<VjCommandOutcome>;
  setEventCard(
    patch: VjCommandPatch<"stage:setEventCard">,
  ): Promise<VjCommandOutcome>;
  /** Unstamped (C 7.5). screenId null identifies every connected screen. */
  identifyScreen(screenId: string | null): Promise<VjIdentifyOutcome>;
}

type VjCommandAck = VjAck<VjCommandSuccess>;
type VjSend = Pick<VjTransport, "send">;
type VjRunCommand = (
  frameName: VjCommandFrameName,
  emit: (stamp: VjCommandStamp) => Promise<VjCommandAck>,
) => Promise<VjCommandOutcome>;

/**
 * The outcome of a frame that never left this page because the socket is
 * down. After a refusal the copy names the refusal (an expired session, a
 * replaced screen, an outdated client) so the error says why nothing can be sent.
 */
export function offlineVjCommandOutcome(
  frameName: VjClientFrameName,
  refusal: VjConnectionRefusal | null = null,
): VjCommandFailureOutcome {
  return {
    ok: false,
    code: "offline",
    errorKey:
      refusal === null
        ? vjErrorKeyOf(new VjSendError(frameName, "disconnected"))
        : VJ_CONNECTION_REFUSAL_KEY[refusal],
  };
}

function outcomeOfSendFailure(cause: unknown): VjCommandFailureOutcome {
  if (cause instanceof VjSendError) {
    return cause.reason === "timeout"
      ? { ok: false, code: "timeout", errorKey: VJ_FAILURE_KEY.timeout }
      : { ok: false, code: "offline", errorKey: vjErrorKeyOf(cause) };
  }
  return { ok: false, code: "failed", errorKey: vjErrorKeyOf(cause) };
}

/** Maps a failed ack: its state goes to onAckState, silent codes name nothing,
 *  and a line with a {max} or {min} carries the number. */
function outcomeOfAckFailure(
  ack: VjAckFailure,
  onAckState: (state: VjStageState) => void,
): VjCommandFailureOutcome {
  if (ack.state !== undefined) onAckState(ack.state);
  if (isVjSilentSocketCode(ack.code)) {
    return { ok: false, code: ack.code, errorKey: null };
  }
  const { max, min } = vjErrorValuesOf(ack);
  const errorValues: VjErrorValues = {
    ...(max === undefined ? {} : { max }),
    ...(min === undefined ? {} : { min }),
  };
  return {
    ok: false,
    code: ack.code,
    errorKey: vjErrorKeyOf(ack),
    ...(Object.keys(errorValues).length === 0 ? {} : { errorValues }),
  };
}

/**
 * Sends one acked stage frame and maps its ack. Success carries the ack's
 * applyAt; a failure that carries `state` hands it to onAckState (which runs
 * it through the version check); the silent codes name nothing.
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
  if (!ack.ok) return outcomeOfAckFailure(ack, onAckState);
  return {
    ok: true,
    revision: ack.revision,
    isNoop: ack.isNoop,
    applyAt: ack.applyAt,
  };
}

/** Drops absent fields, so a patch carries only the fields it sets. */
function definedFieldsOf<Patch extends object>(patch: Patch): Patch {
  return Object.fromEntries(
    Object.entries(patch).filter(([, value]) => value !== undefined),
  ) as Patch;
}

type VjEffectSettingsPatch = NonNullable<VjSetEffectsPayload["settings"]>;

/** Drops absent entries and absent fields inside each entry; a null entry
 *  stays, because it resets that effect (C 7.5). */
function definedSettingsOf(
  settings: VjEffectSettingsPatch,
): VjEffectSettingsPatch {
  return Object.fromEntries(
    Object.entries(settings)
      .filter(([, setting]) => setting !== undefined)
      .map(([effectId, setting]): [string, VjEffectSettingPatch | null] => [
        effectId,
        setting === null || setting === undefined
          ? null
          : definedFieldsOf(setting),
      ]),
  );
}

/**
 * A setEffects patch with undefined stripped at both levels (the demo's
 * structured clone keeps undefined keys). isImmediate stays only on a patch
 * that holds isBlackout and nothing else, the one setEffects the server lets
 * skip the beat (C 7.4).
 */
function effectsPatchOf(
  patch: VjCommandPatch<"stage:setEffects">,
): VjCommandPatch<"stage:setEffects"> {
  const { settings, isImmediate, ...fields } = patch;
  const definedPatch: VjCommandPatch<"stage:setEffects"> = {
    ...definedFieldsOf(fields),
    ...(settings === undefined
      ? {}
      : { settings: definedSettingsOf(settings) }),
  };
  const isBlackoutOnly =
    Object.keys(definedPatch).length === 1 &&
    definedPatch.isBlackout !== undefined;
  return isImmediate !== undefined && isBlackoutOnly
    ? { ...definedPatch, isImmediate }
    : definedPatch;
}

/** isImmediate when the caller gave it and the command may skip the beat. */
function immediateFieldOf(
  options: VjImmediateOption | undefined,
  isAllowed: boolean,
): { isImmediate?: boolean } {
  return options?.isImmediate === undefined || !isAllowed
    ? {}
    : { isImmediate: options.isImmediate };
}

/** The commands whose payload is a patch of optional fields. */
function patchCommandsOf(
  transport: VjSend,
  run: VjRunCommand,
): Pick<
  VjStageCommands,
  | "setTransition"
  | "setOverlay"
  | "setEffects"
  | "setShuffle"
  | "setTempo"
  | "setMix"
  | "setCountdown"
  | "setLogo"
  | "setEventCard"
> {
  return {
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
          ...effectsPatchOf(patch),
          ...stamp,
        }),
      ),
    setShuffle: (patch) =>
      run("stage:setShuffle", (stamp) =>
        transport.send("stage:setShuffle", {
          ...definedFieldsOf(patch),
          ...stamp,
        }),
      ),
    setTempo: (patch) =>
      run("stage:setTempo", (stamp) =>
        transport.send("stage:setTempo", {
          ...definedFieldsOf(patch),
          ...stamp,
        }),
      ),
    setMix: (patch) =>
      run("stage:setMix", (stamp) =>
        transport.send("stage:setMix", { ...definedFieldsOf(patch), ...stamp }),
      ),
    setCountdown: (patch) =>
      run("stage:setCountdown", (stamp) =>
        transport.send("stage:setCountdown", {
          ...definedFieldsOf(patch),
          ...stamp,
        }),
      ),
    setLogo: (patch) =>
      run("stage:setLogo", (stamp) =>
        transport.send("stage:setLogo", {
          ...definedFieldsOf(patch),
          ...stamp,
        }),
      ),
    setEventCard: (patch) =>
      run("stage:setEventCard", (stamp) =>
        transport.send("stage:setEventCard", {
          ...definedFieldsOf(patch),
          ...stamp,
        }),
      ),
  };
}

/** The commands that take plain arguments (or none). */
function scalarCommandsOf(
  transport: VjSend,
  run: VjRunCommand,
): Omit<
  VjStageCommands,
  keyof ReturnType<typeof patchCommandsOf> | "identifyScreen"
> {
  return {
    setPack: (packId) =>
      run("stage:setPack", (stamp) =>
        transport.send("stage:setPack", { packId, ...stamp }),
      ),
    goClip: (clipId) =>
      run("stage:goClip", (stamp) =>
        transport.send("stage:goClip", { clipId, ...stamp }),
      ),
    goGenerator: (generatorId, variant) =>
      run("stage:goGenerator", (stamp) =>
        transport.send("stage:goGenerator", {
          generatorId,
          ...(variant === undefined ? {} : { variant }),
          ...stamp,
        }),
      ),
    setStrobe: (isStrobing, options) =>
      run("stage:setStrobe", (stamp) =>
        transport.send("stage:setStrobe", {
          isStrobing,
          ...immediateFieldOf(options, !isStrobing),
          ...stamp,
        }),
      ),
    swapMix: () =>
      run("stage:swapMix", (stamp) => transport.send("stage:swapMix", stamp)),
    setScreenOverride: (screenId, override) =>
      run("stage:setScreenOverride", (stamp) =>
        transport.send("stage:setScreenOverride", {
          screenId,
          override,
          ...stamp,
        }),
      ),
    resetLook: (options) =>
      run("stage:resetLook", (stamp) =>
        transport.send("stage:resetLook", {
          ...immediateFieldOf(options, true),
          ...stamp,
        }),
      ),
    recallScene: (sceneId) =>
      run("stage:recallScene", (stamp) =>
        transport.send("stage:recallScene", { sceneId, ...stamp }),
      ),
    setlistSelect: (setlistId, index) =>
      run("stage:setlistSelect", (stamp) =>
        transport.send("stage:setlistSelect", { setlistId, index, ...stamp }),
      ),
    setlistNext: () =>
      run("stage:setlistNext", (stamp) =>
        transport.send("stage:setlistNext", stamp),
      ),
    setlistPrevious: () =>
      run("stage:setlistPrevious", (stamp) =>
        transport.send("stage:setlistPrevious", stamp),
      ),
  };
}

/** screen:identify carries no stamp; while detached it answers the offline outcome. */
async function identifyScreenWith(
  transport: VjSend,
  screenId: string | null,
  onAckState: (state: VjStageState) => void,
): Promise<VjIdentifyOutcome> {
  try {
    const ack = await transport.send("screen:identify", { screenId });
    if (!ack.ok) return outcomeOfAckFailure(ack, onAckState);
    return { ok: true, identifiedCount: ack.identifiedCount };
  } catch (cause) {
    return outcomeOfSendFailure(cause);
  }
}

/** Takes a stamp from the stamper only when it emits (attached), sends
 *  through the transport and maps the ack: ok gives { ok, revision, isNoop,
 *  applyAt }; a failure with `state` hands it to onAckState; a VjSendError
 *  gives "offline" (disconnected) or "timeout"; errorKey is null for
 *  isVjSilentSocketCode codes, else vjErrorKeyOf, with errorValues when the
 *  line names a number. While refused, the offline outcome names the
 *  refusal through currentRefusal. */
export function createVjStageCommands(
  transport: VjSend,
  stamper: VjCommandStamper,
  onAckState: (state: VjStageState) => void,
  isAttached: () => boolean,
  currentRefusal: () => VjConnectionRefusal | null = () => null,
): VjStageCommands {
  const run: VjRunCommand = (frameName, emit) => {
    if (!isAttached()) {
      return Promise.resolve(
        offlineVjCommandOutcome(frameName, currentRefusal()),
      );
    }
    const stamp = stamper.next();
    return settleVjCommand(() => emit(stamp), onAckState);
  };

  return {
    ...scalarCommandsOf(transport, run),
    ...patchCommandsOf(transport, run),
    identifyScreen: (screenId) =>
      isAttached()
        ? identifyScreenWith(transport, screenId, onAckState)
        : Promise.resolve(
            offlineVjCommandOutcome("screen:identify", currentRefusal()),
          ),
  };
}

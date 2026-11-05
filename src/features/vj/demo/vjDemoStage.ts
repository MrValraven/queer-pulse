// The demo VJ stage: contract 6.4 to 6.10 as a pure reducer, so two demo tabs
// get the same frames, acks and codes the live gateway sends.

import {
  createVjStageState,
  type VjLibraryChange,
  type VjStageState,
} from "../../../shared/contracts/vj";
import type { VjCommandFrameName } from "../realtime/vjFrames";
import {
  VJ_CLIENT_SEQUENCES_KEPT,
  VJ_SCREEN_OFFLINE_RETENTION_MS,
} from "../vj.constants";
import { isVjUuid } from "./vjDemoRules";
import {
  leadOf,
  reduceAttach,
  reduceDetach,
  refuse,
  screensUpdateTo,
  silent,
  VJ_DEMO_CONNECTION_LIFETIME_MS,
  withLeadChange,
  type VjDemoStage,
  type VjDemoStageContext,
  type VjDemoStageResult,
} from "./vjDemoScreens";
import { frameTo, stageFrame } from "./vjDemoStageInput";
import {
  applyVjStageCommand,
  isVjCommandFrameName,
  readVjRecord,
  readVjScreenStatusPayload,
} from "./vjDemoStageCommands";

export type {
  VjDemoOutgoing,
  VjDemoScreenEntry,
  VjDemoStage,
} from "./vjDemoScreens";

export type VjDemoStageEvent =
  | { kind: "attach"; tabId: string; payload: unknown }
  | { kind: "detach"; tabId: string }
  | { kind: "frame"; tabId: string; name: string; payload: unknown }
  | { kind: "strobeTimeout" }
  | { kind: "library"; change: VjLibraryChange }
  | { kind: "pruneOffline" };

export function createVjDemoStage(
  stageEpoch: string,
  now: number,
): VjDemoStage {
  return {
    state: createVjStageState(stageEpoch, now),
    screens: [],
    attached: {},
    clientSequences: [],
    connectionCounter: 0,
    highestScreenNumber: 0,
  };
}

function rememberSequence(
  sequences: VjDemoStage["clientSequences"],
  clientId: string,
  sequence: number,
): VjDemoStage["clientSequences"] {
  const kept = sequences.filter((entry) => entry.clientId !== clientId);
  return [...kept, { clientId, sequence }].slice(-VJ_CLIENT_SEQUENCES_KEPT);
}

function reduceCommand(
  stage: VjDemoStage,
  name: VjCommandFrameName,
  payload: unknown,
  context: VjDemoStageContext,
): VjDemoStageResult {
  const { clientId, commandSequence } = readVjRecord(payload);
  if (
    !isVjUuid(clientId) ||
    typeof commandSequence !== "number" ||
    !Number.isSafeInteger(commandSequence) ||
    commandSequence <= 0
  ) {
    return refuse(stage, "vj_client_id_invalid");
  }
  const stored = stage.clientSequences.find(
    (entry) => entry.clientId === clientId,
  );
  if (stored !== undefined && commandSequence <= stored.sequence) {
    return refuse(stage, "vj_stale_command", stage.state);
  }
  const sequenced: VjDemoStage = {
    ...stage,
    clientSequences: rememberSequence(
      stage.clientSequences,
      clientId,
      commandSequence,
    ),
  };
  const result = applyVjStageCommand(stage.state, name, payload, context);
  if ("error" in result) return refuse(sequenced, result.error);
  const ack = {
    ok: true,
    revision: result.state.revision,
    isNoop: result.isNoop,
  };
  if (result.isNoop) return { stage: sequenced, ack, outgoing: [] };
  return {
    stage: { ...sequenced, state: result.state },
    ack,
    outgoing: [
      frameTo("stage:state", stageFrame(result.state, "command", clientId)),
    ],
  };
}

function reduceAdvance(
  stage: VjDemoStage,
  tabId: string,
  payload: unknown,
  context: VjDemoStageContext,
): VjDemoStageResult {
  const { state } = stage;
  const { expectedClipSequence, clipId } = readVjRecord(payload);
  if (leadOf(stage.screens)?.tabId !== tabId)
    return refuse(stage, "vj_not_lead", state);
  if (!state.shuffle.isOn) return refuse(stage, "vj_shuffle_off", state);
  if (state.activePackId === null)
    return refuse(stage, "vj_no_active_pack", state);
  if (expectedClipSequence !== state.clipSequence)
    return refuse(stage, "vj_stale_clip_sequence", state);
  const liveClipId = isVjUuid(clipId) ? clipId.toLowerCase() : null;
  if (
    liveClipId === null ||
    !context.library.isClipInPack(state.activePackId, liveClipId)
  ) {
    return refuse(stage, "vj_clip_not_in_pack");
  }
  const next: VjStageState = {
    ...state,
    liveClipId,
    clipSequence: state.clipSequence + 1,
    revision: state.revision + 1,
    updatedAt: context.now,
  };
  return {
    stage: { ...stage, state: next },
    ack: { ok: true, revision: next.revision, isNoop: false },
    outgoing: [frameTo("stage:state", stageFrame(next, "shuffle"))],
  };
}

function reduceScreenStatus(
  stage: VjDemoStage,
  tabId: string,
  payload: unknown,
  now: number,
): VjDemoStageResult {
  const status = readVjScreenStatusPayload(payload);
  // A malformed report changes nothing, lastSeenAt included (as live).
  if (status === null) return silent(stage);
  const screens = stage.screens.map((entry) =>
    entry.tabId === tabId ? { ...entry, ...status, lastSeenAt: now } : entry,
  );
  return {
    stage: { ...stage, screens },
    ack: null,
    outgoing: [screensUpdateTo(screens, { role: "remote" })],
  };
}

function reduceFrame(
  stage: VjDemoStage,
  event: { tabId: string; name: string; payload: unknown },
  context: VjDemoStageContext,
): VjDemoStageResult {
  const { tabId, name, payload } = event;
  if (name === "vj:attach") return reduceAttach(stage, tabId, payload, context);
  if (name === "session:reauth") {
    const exp = Math.floor(
      (context.now + VJ_DEMO_CONNECTION_LIFETIME_MS) / 1000,
    );
    return { stage, ack: { ok: true, exp }, outgoing: [] };
  }
  const isCommand = isVjCommandFrameName(name);
  const isScreenFrame = name === "screen:advance" || name === "screen:status";
  if (!isCommand && !isScreenFrame) return silent(stage);
  const role = stage.attached[tabId];
  const hasAck = name !== "screen:status";
  if (role === undefined)
    return hasAck ? refuse(stage, "vj_not_attached") : silent(stage);
  if (isCommand)
    return role === "remote"
      ? reduceCommand(stage, name, payload, context)
      : refuse(stage, "vj_wrong_role");
  if (role !== "screen")
    return hasAck ? refuse(stage, "vj_wrong_role") : silent(stage);
  if (!hasAck) return reduceScreenStatus(stage, tabId, payload, context.now);
  const seen: VjDemoStage = {
    ...stage,
    screens: stage.screens.map((entry) =>
      entry.tabId === tabId ? { ...entry, lastSeenAt: context.now } : entry,
    ),
  };
  return reduceAdvance(seen, tabId, payload, context);
}

function reduceStrobeTimeout(
  stage: VjDemoStage,
  now: number,
): VjDemoStageResult {
  if (!stage.state.effects.isStrobing) return silent(stage);
  const state: VjStageState = {
    ...stage.state,
    effects: {
      ...stage.state.effects,
      isStrobing: false,
      strobeStartedAt: null,
    },
    revision: stage.state.revision + 1,
    updatedAt: now,
  };
  return {
    stage: { ...stage, state },
    ack: null,
    outgoing: [frameTo("stage:state", stageFrame(state, "strobe_timeout"))],
  };
}

/** Contract 6.10: relay to every attached tab, then apply to the stage. */
function reduceLibrary(
  stage: VjDemoStage,
  change: VjLibraryChange,
  now: number,
): VjDemoStageResult {
  const outgoing = [frameTo("library:changed", change)];
  let state = stage.state;
  if (
    change.kind === "pack_deleted" &&
    state.activePackId !== null &&
    change.packId?.toLowerCase() === state.activePackId
  ) {
    state = {
      ...state,
      activePackId: null,
      shuffle: { ...state.shuffle, isOn: false },
      clipSequence: state.clipSequence + 1,
    };
  }
  if (
    change.kind === "clip_deleted" &&
    state.liveClipId !== null &&
    change.clipId?.toLowerCase() === state.liveClipId
  ) {
    state = {
      ...state,
      liveClipId: null,
      clipSequence: state.clipSequence + 1,
    };
  }
  if (state === stage.state) return { stage, ack: null, outgoing };
  state = { ...state, revision: state.revision + 1, updatedAt: now };
  outgoing.push(frameTo("stage:state", stageFrame(state, "library")));
  return { stage: { ...stage, state }, ack: null, outgoing };
}

function reducePruneOffline(
  stage: VjDemoStage,
  now: number,
): VjDemoStageResult {
  // The retention runs from the disconnect (contract 6.7).
  const screens = stage.screens.filter(
    (entry) =>
      entry.tabId !== null ||
      entry.disconnectedAt === null ||
      now - entry.disconnectedAt <= VJ_SCREEN_OFFLINE_RETENTION_MS,
  );
  if (screens.length === stage.screens.length) return silent(stage);
  return {
    stage: { ...stage, screens },
    ack: null,
    outgoing: [screensUpdateTo(screens, { role: "remote" })],
  };
}

function reduceEvent(
  stage: VjDemoStage,
  event: VjDemoStageEvent,
  context: VjDemoStageContext,
): VjDemoStageResult {
  switch (event.kind) {
    case "attach":
      return reduceAttach(stage, event.tabId, event.payload, context);
    case "detach":
      return reduceDetach(stage, event.tabId, context.now);
    case "frame":
      return reduceFrame(stage, event, context);
    case "strobeTimeout":
      return reduceStrobeTimeout(stage, context.now);
    case "library":
      return reduceLibrary(stage, event.change, context.now);
    case "pruneOffline":
      return reducePruneOffline(stage, context.now);
  }
}

/** Applies one event; `ack` is null when the frame takes no acknowledgement. */
export function reduceVjDemoStage(
  stage: VjDemoStage,
  event: VjDemoStageEvent,
  context: VjDemoStageContext,
): VjDemoStageResult {
  return withLeadChange(
    reduceEvent(stage, event, context),
    leadOf(stage.screens),
  );
}

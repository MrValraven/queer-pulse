// The demo VJ stage's client frames (contract 7.3 to 7.9): clock:sync, the
// stamped remote commands, screen:identify, screens:setRenderMode,
// screen:advance and screen:status, plus the one change landing of contract 7.4 every applied
// change goes through. Pure. Mirrors landVjChange and the frame handlers of
// queerpulse-backend/src/vj/vj-stage.service.ts in the same order.

import {
  VJ_LIMITS,
  canonicalVjStageState,
  isSameVjStageContent,
  isVjRenderMode,
  type VjCommandSuccess,
  type VjStageCause,
  type VjStageState,
} from "../../../shared/contracts/vj";
import type { VjCommandFrameName } from "../realtime/vjFrames";
import { VJ_CLIENT_SEQUENCES_KEPT } from "../vj.constants";
import {
  NO_VJ_DEMO_STAMPS,
  withVjLiveClip,
  type VjDemoCommandContext,
  type VjDemoStamps,
} from "./vjDemoCommandKit";
import { adoptVjDemoMicTempo } from "./vjDemoMicTempo";
import { settleVjDemoChange } from "./vjDemoQuantize";
import { isVjUuid } from "./vjDemoRules";
import {
  VJ_DEMO_CONNECTION_LIFETIME_MS,
  leadOf,
  pruneOfflineVjDemoScreens,
  reduceAttach,
  refuse,
  screensUpdateTo,
  silent,
  type VjDemoStage,
  type VjDemoStageContext,
  type VjDemoStageResult,
} from "./vjDemoScreens";
import { applyVjStageCommand } from "./vjDemoStageCommands";
import {
  frameTo,
  isVjCommandFrameName,
  readVjRecord,
  readVjScreenStatusPayload,
  stageFrame,
  vjDemoAckSuccess,
  type VjDemoOutgoing,
} from "./vjDemoStageInput";

/** One accepted change on its way to the stage (contract 7.4 step 1). */
export interface VjDemoAcceptedChange {
  next: VjStageState;
  stamps: VjDemoStamps;
  isLookSwitch: boolean;
  isImmediate: boolean;
}

/** A change the server makes on its own (timers, mic adoption, library,
 *  shuffle advance): isLookSwitch and isImmediate false, empty stamps. */
export function serverVjDemoChange(next: VjStageState): VjDemoAcceptedChange {
  return {
    next,
    stamps: NO_VJ_DEMO_STAMPS,
    isLookSwitch: false,
    isImmediate: false,
  };
}

/** What landing one change answers: the stage after it, the command
 *  success fields, and the stage:state frame (none on a noop). */
export interface VjDemoLanding {
  stage: VjDemoStage;
  success: VjCommandSuccess;
  outgoing: VjDemoOutgoing[];
}

/**
 * Contract 7.4 for one accepted change, in the backend's order: screens
 * offline past their retention pruned first, the canonical next state, its applyAt from the cause, the overrides of
 * departed screens dropped after the grid check, the time stamps (the strobe
 * start always, so the 10 s strobe cap has its stamp), then the noop
 * compare. A noop answers applyAt null and leaves pendingApplyAt alone;
 * anything else sets pendingApplyAt, revision + 1 and updatedAt = now, and
 * broadcasts the frame with its applyAt.
 */
export function landVjDemoChange(
  stage: VjDemoStage,
  accepted: VjDemoAcceptedChange,
  cause: VjStageCause,
  sourceClientId: string | null,
  now: number,
): VjDemoLanding {
  const prunedStage: VjDemoStage = {
    ...stage,
    screens: pruneOfflineVjDemoScreens(stage.screens, now),
  };
  const previous = prunedStage.state;
  const settled = settleVjDemoChange({
    previous,
    next: canonicalVjStageState(accepted.next),
    stamps: accepted.stamps,
    now,
    pendingApplyAt: prunedStage.pendingApplyAt,
    isLookSwitch: accepted.isLookSwitch,
    isImmediate: accepted.isImmediate,
    cause,
    knownScreenIds: new Set(prunedStage.screens.map((entry) => entry.screenId)),
  });
  if (isSameVjStageContent(previous, settled.state)) {
    return {
      stage: prunedStage,
      success: { revision: previous.revision, isNoop: true, applyAt: null },
      outgoing: [],
    };
  }
  const { state, applyAt } = settled;
  return {
    stage: { ...prunedStage, state, pendingApplyAt: settled.pendingApplyAt },
    success: { revision: state.revision, isNoop: false, applyAt },
    outgoing: [
      frameTo("stage:state", stageFrame(state, cause, sourceClientId, applyAt)),
    ],
  };
}

/** A landing answered as a command ack built at `now`. */
function landingResult(landing: VjDemoLanding, now: number): VjDemoStageResult {
  return {
    stage: landing.stage,
    ack: vjDemoAckSuccess(now, landing.success),
    outgoing: landing.outgoing,
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

/** What a command rule reads besides the state and the payload. */
function commandContextOf(
  stage: VjDemoStage,
  context: VjDemoStageContext,
): VjDemoCommandContext {
  const lead = leadOf(stage.screens);
  return {
    now: context.now,
    library: context.library,
    connectedScreenIds: new Set(
      stage.screens
        .filter((entry) => entry.tabId !== null)
        .map((entry) => entry.screenId),
    ),
    isLeadMicOn: lead !== null && lead.mic !== null,
  };
}

/** A stamped remote command: the client id and stale checks, the rules
 *  (contract 7.5, 7.6), then the landing with cause `command`. */
export function reduceCommand(
  stage: VjDemoStage,
  name: VjCommandFrameName,
  payload: unknown,
  context: VjDemoStageContext,
): VjDemoStageResult {
  const { now } = context;
  const { clientId, commandSequence } = readVjRecord(payload);
  if (
    !isVjUuid(clientId) ||
    typeof commandSequence !== "number" ||
    !Number.isSafeInteger(commandSequence) ||
    commandSequence <= 0
  ) {
    return refuse(stage, "vj_client_id_invalid", now);
  }
  const stored = stage.clientSequences.find(
    (entry) => entry.clientId === clientId,
  );
  if (stored !== undefined && commandSequence <= stored.sequence) {
    return refuse(stage, "vj_stale_command", now, stage.state);
  }
  const sequenced: VjDemoStage = {
    ...stage,
    clientSequences: rememberSequence(
      stage.clientSequences,
      clientId,
      commandSequence,
    ),
  };
  const result = applyVjStageCommand(
    sequenced.state,
    name,
    payload,
    commandContextOf(sequenced, context),
  );
  if ("error" in result) return refuse(sequenced, result.error, now);
  const accepted: VjDemoAcceptedChange = {
    next: result.state,
    stamps: result.stamps,
    isLookSwitch: result.isLookSwitch,
    isImmediate: result.isImmediate,
  };
  return landingResult(
    landVjDemoChange(sequenced, accepted, "command", clientId, now),
    now,
  );
}

/** `screen:advance` (contract 7.5): the v1 order, then vj_clip_excluded, the
 *  pack clip read (vj_clip_not_in_pack, then vj_clip_not_favorite in
 *  favorites mode), and the change of `stage:goClip` with cause `shuffle`. */
export function reduceAdvance(
  stage: VjDemoStage,
  tabId: string,
  payload: unknown,
  context: VjDemoStageContext,
): VjDemoStageResult {
  const { now } = context;
  const { state } = stage;
  const { expectedClipSequence, clipId } = readVjRecord(payload);
  if (leadOf(stage.screens)?.tabId !== tabId) {
    return refuse(stage, "vj_not_lead", now, state);
  }
  if (!state.shuffle.isOn) return refuse(stage, "vj_shuffle_off", now, state);
  const packId = state.activePackId;
  if (packId === null) return refuse(stage, "vj_no_active_pack", now, state);
  if (expectedClipSequence !== state.clipSequence) {
    return refuse(stage, "vj_stale_clip_sequence", now, state);
  }
  if (!isVjUuid(clipId)) return refuse(stage, "vj_clip_not_in_pack", now);
  const nextClipId = clipId.toLowerCase();
  if (state.shuffle.excludedClipIds.includes(nextClipId)) {
    return refuse(stage, "vj_clip_excluded", now, state);
  }
  const packClip = context.library.readPackClipForAdvance(packId, nextClipId);
  if (packClip === null) return refuse(stage, "vj_clip_not_in_pack", now);
  if (state.shuffle.source === "favorites" && !packClip.isFavorite) {
    return refuse(stage, "vj_clip_not_favorite", now, state);
  }
  const accepted = serverVjDemoChange(withVjLiveClip(state, nextClipId));
  return landingResult(
    landVjDemoChange(stage, accepted, "shuffle", null, now),
    now,
  );
}

/** `screen:identify` from a remote (contract 7.5, 7.8): null names every
 *  connected screen, an id must name a connected one. One frame per target
 *  tab in number order; no state change. */
export function reduceIdentify(
  stage: VjDemoStage,
  payload: unknown,
  now: number,
): VjDemoStageResult {
  const { screenId } = readVjRecord(payload);
  const namedScreenId = isVjUuid(screenId) ? screenId.toLowerCase() : null;
  const targets = stage.screens
    .filter(
      (entry) =>
        entry.tabId !== null &&
        (screenId === null || entry.screenId === namedScreenId),
    )
    .sort((left, right) => left.number - right.number);
  if (screenId !== null && targets.length === 0) {
    return refuse(stage, "vj_screen_not_attached", now);
  }
  return {
    stage,
    ack: vjDemoAckSuccess(now, { identifiedCount: targets.length }),
    outgoing: targets.map((entry) =>
      frameTo(
        "screen:identify",
        { number: entry.number, durationMs: VJ_LIMITS.identifyDurationMs },
        { tabId: entry.tabId },
      ),
    ),
  };
}

/** `screens:setRenderMode` from a remote: a mode outside VJ_RENDER_MODES
 *  refuses vj_render_mode_invalid, then no connected screen refuses
 *  vj_no_screens_connected. One `screen:renderMode` frame per connected tab
 *  in number order, counted in the ack; nothing is stored, so the stage comes
 *  back unchanged. Mirrors the backend order; the demo has no rate limiter, as for identify. */
export function reduceSetRenderMode(
  stage: VjDemoStage,
  payload: unknown,
  now: number,
): VjDemoStageResult {
  const { mode } = readVjRecord(payload);
  if (!isVjRenderMode(mode)) {
    return refuse(stage, "vj_render_mode_invalid", now);
  }
  const targets = stage.screens
    .filter((entry) => entry.tabId !== null)
    .sort((left, right) => left.number - right.number);
  if (targets.length === 0) {
    return refuse(stage, "vj_no_screens_connected", now);
  }
  return {
    stage,
    ack: vjDemoAckSuccess(now, { reachedCount: targets.length }),
    outgoing: targets.map((entry) =>
      frameTo("screen:renderMode", { mode }, { tabId: entry.tabId }),
    ),
  };
}

/** `clock:sync` (contract 7.3): the server's clock, attached or not. */
export function reduceClockSync(
  stage: VjDemoStage,
  now: number,
): VjDemoStageResult {
  return { stage, ack: vjDemoAckSuccess(now, {}), outgoing: [] };
}

/** Contract 7.9 adoption on the lead's status: a `mic_tempo` change when the
 *  tempo follows the mic and the report moved it. The adoption time is kept
 *  even when the landing turns out a noop, as the backend does. */
function adoptLeadMicTempo(
  stage: VjDemoStage,
  tabId: string,
  now: number,
): { stage: VjDemoStage; outgoing: VjDemoOutgoing[] } {
  const lead = leadOf(stage.screens);
  if (lead === null || lead.tabId !== tabId || lead.mic === null) {
    return { stage, outgoing: [] };
  }
  const tempo = adoptVjDemoMicTempo({
    tempo: stage.state.tempo,
    mic: lead.mic,
    now,
    lastAdoptionAt: stage.lastMicAdoptionAt,
  });
  if (tempo === null) return { stage, outgoing: [] };
  const landing = landVjDemoChange(
    { ...stage, lastMicAdoptionAt: now },
    serverVjDemoChange({ ...stage.state, tempo }),
    "mic_tempo",
    null,
    now,
  );
  return { stage: landing.stage, outgoing: landing.outgoing };
}

/** `screen:status` (contract 7.9): the v1 pair and the v2 fields stored, the
 *  next clip only from the lead, the list relayed to remotes, then the lead
 *  mic adoption. A malformed v1 pair changes nothing, lastSeenAt included. */
export function reduceScreenStatus(
  stage: VjDemoStage,
  tabId: string,
  payload: unknown,
  now: number,
): VjDemoStageResult {
  const report = readVjScreenStatusPayload(payload, now);
  if (report === null) return silent(stage);
  const isLead = leadOf(stage.screens)?.tabId === tabId;
  const stored: VjDemoStage = {
    ...stage,
    screens: stage.screens.map((entry) =>
      entry.tabId === tabId
        ? {
            ...entry,
            ...report,
            nextClipId: isLead ? report.nextClipId : null,
            lastSeenAt: now,
          }
        : entry,
    ),
  };
  const adopted = adoptLeadMicTempo(stored, tabId, now);
  return {
    stage: adopted.stage,
    ack: null,
    outgoing: [
      screensUpdateTo(adopted.stage, { role: "remote" }),
      ...adopted.outgoing,
    ],
  };
}

/** The frame names a screen tab sends. */
function isScreenFrameName(name: string): boolean {
  return name === "screen:advance" || name === "screen:status";
}

/** One client frame: clock:sync before every attach check, then attach and
 *  reauth, then the role checks (v1, plus `screen:identify` and
 *  `screens:setRenderMode` from a remote only), then the frame's own reducer. */
export function reduceFrame(
  stage: VjDemoStage,
  event: { tabId: string; name: string; payload: unknown },
  context: VjDemoStageContext,
): VjDemoStageResult {
  const { tabId, name, payload } = event;
  const { now } = context;
  if (name === "clock:sync") return reduceClockSync(stage, now);
  if (name === "vj:attach") return reduceAttach(stage, tabId, payload, context);
  if (name === "session:reauth") {
    const exp = Math.floor((now + VJ_DEMO_CONNECTION_LIFETIME_MS) / 1000);
    return { stage, ack: vjDemoAckSuccess(now, { exp }), outgoing: [] };
  }
  const isCommand = isVjCommandFrameName(name);
  const isIdentify = name === "screen:identify";
  const isSetRenderMode = name === "screens:setRenderMode";
  if (
    !isCommand &&
    !isIdentify &&
    !isSetRenderMode &&
    !isScreenFrameName(name)
  ) {
    return silent(stage);
  }
  const role = stage.attached[tabId];
  const hasAck = name !== "screen:status";
  if (role === undefined) {
    return hasAck ? refuse(stage, "vj_not_attached", now) : silent(stage);
  }
  if (isCommand || isIdentify || isSetRenderMode) {
    if (role !== "remote") return refuse(stage, "vj_wrong_role", now);
    if (isCommand) return reduceCommand(stage, name, payload, context);
    return isIdentify
      ? reduceIdentify(stage, payload, now)
      : reduceSetRenderMode(stage, payload, now);
  }
  if (role !== "screen") {
    return hasAck ? refuse(stage, "vj_wrong_role", now) : silent(stage);
  }
  if (!hasAck) return reduceScreenStatus(stage, tabId, payload, now);
  const seen: VjDemoStage = {
    ...stage,
    screens: stage.screens.map((entry) =>
      entry.tabId === tabId ? { ...entry, lastSeenAt: now } : entry,
    ),
  };
  return reduceAdvance(seen, tabId, payload, context);
}

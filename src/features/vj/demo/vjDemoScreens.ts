// The demo VJ stage's screen list (contract 7.1, 7.8, 7.9 and v1 6.4, 6.7,
// 6.8): attach, detach, numbering, the lead and the frames the stage sends,
// pure.

import {
  VJ_CONTRACT_VERSION,
  canonicalVjStageState,
  type VjAttachRole,
  type VjAttachSuccess,
  type VjScreenHealth,
  type VjScreenMicReport,
  type VjScreenPreload,
  type VjScreenStatus,
  type VjSocketErrorCode,
  type VjStageState,
} from "../../../shared/contracts/vj";
import { VJ_SCREEN_OFFLINE_RETENTION_MS } from "../vj.constants";
import type { VjDemoLibraryLookup } from "./vjDemoCommandKit";
import { vjDemoAttachApplyAt } from "./vjDemoQuantize";
import { isVjUuid } from "./vjDemoRules";
import {
  frameTo,
  isVjRecord,
  readVjRecord,
  stageFrame,
  vjDemoAckFailure,
  vjDemoAckSuccess,
  type VjDemoOutgoing,
} from "./vjDemoStageInput";
import { restoreVjDemoStage } from "./vjDemoStageRestore";

export interface VjDemoScreenEntry {
  screenId: string;
  tabId: string | null;
  number: number;
  connectedAt: number | null;
  /** Stage-wide attach counter value; breaks a connectedAt tie for the lead. */
  connectionOrder: number;
  /** When the screen last went offline; the offline retention runs from it. */
  disconnectedAt: number | null;
  lastSeenAt: number;
  isFullscreen: boolean;
  preload: VjScreenPreload;
  /** Null until this connection reports health. */
  health: VjScreenHealth | null;
  /** The lead's shuffle pick; a follower's report is stored as null. */
  nextClipId: string | null;
  /** Null while the mic is off on this screen. */
  mic: VjScreenMicReport | null;
}

export interface VjDemoStage {
  state: VjStageState;
  screens: VjDemoScreenEntry[];
  attached: Record<string, VjAttachRole>;
  /** Most recent last, at most VJ_CLIENT_SEQUENCES_KEPT. */
  clientSequences: Array<{ clientId: string; sequence: number }>;
  /** Counts every screen attach; never decreases. */
  connectionCounter: number;
  /** The highest number ever given; a pruned screen's number is never reused. */
  highestScreenNumber: number;
  /** The last stamped applyAt (contract 7.4, memory only). */
  pendingApplyAt: number | null;
  /** When the lead's mic last moved the tempo (contract 7.9). */
  lastMicAdoptionAt: number | null;
}

export type { VjDemoOutgoing } from "./vjDemoStageInput";

export interface VjDemoStageContext {
  now: number;
  library: VjDemoLibraryLookup;
}

export interface VjDemoStageResult {
  stage: VjDemoStage;
  ack: unknown;
  outgoing: VjDemoOutgoing[];
}

/** A demo connection never expires inside one evening. */
export const VJ_DEMO_CONNECTION_LIFETIME_MS = 12 * 60 * 60 * 1000;

/** A refusal ack built at `now`, carrying `state` for the C 7.11 "state" codes. */
export function refuse(
  stage: VjDemoStage,
  code: VjSocketErrorCode,
  now: number,
  state?: VjStageState,
): VjDemoStageResult {
  return { stage, ack: vjDemoAckFailure(code, now, state), outgoing: [] };
}

export function silent(stage: VjDemoStage): VjDemoStageResult {
  return { stage, ack: null, outgoing: [] };
}

export function leadOf(screens: VjDemoScreenEntry[]): VjDemoScreenEntry | null {
  let lead: VjDemoScreenEntry | null = null;
  for (const entry of screens) {
    if (entry.tabId === null || entry.connectedAt === null) continue;
    const leadConnectedAt = lead?.connectedAt ?? null;
    const isEarlier =
      lead === null ||
      leadConnectedAt === null ||
      entry.connectedAt < leadConnectedAt ||
      (entry.connectedAt === leadConnectedAt &&
        entry.connectionOrder < lead.connectionOrder);
    if (isEarlier) lead = entry;
  }
  return lead;
}

/** The screens past their offline retention dropped (v1 note 12); the
 *  retention runs from the disconnect (contract 6.7). Hands back the same
 *  list when every screen stays. Mirrors pruneOfflineScreens of
 *  queerpulse-backend/src/vj/vj-stage.service.ts. */
export function pruneOfflineVjDemoScreens(
  screens: VjDemoScreenEntry[],
  now: number,
): VjDemoScreenEntry[] {
  const kept = screens.filter(
    (entry) =>
      entry.tabId !== null ||
      entry.disconnectedAt === null ||
      now - entry.disconnectedAt <= VJ_SCREEN_OFFLINE_RETENTION_MS,
  );
  return kept.length === screens.length ? screens : kept;
}

/** The screens sorted by number with the v2 fields (contract 7.9): the
 *  lead's next clip only while shuffle is on, the mic relayed as level,
 *  detected bpm and confidence. An offline screen relays null health and
 *  mic, so its meters stop with its tab; the stored entry stays as it is. */
function screenStatusesOf(
  stage: Pick<VjDemoStage, "screens" | "state">,
): VjScreenStatus[] {
  const lead = leadOf(stage.screens);
  const isShuffleOn = stage.state.shuffle.isOn;
  return [...stage.screens]
    .sort((left, right) => left.number - right.number)
    .map((entry) => {
      const isConnected = entry.tabId !== null;
      const isLead = lead !== null && entry.screenId === lead.screenId;
      return {
        screenId: entry.screenId,
        number: entry.number,
        isConnected,
        isLead,
        isFullscreen: entry.isFullscreen,
        connectedAt: entry.connectedAt,
        lastSeenAt: entry.lastSeenAt,
        preload: entry.preload,
        health: isConnected ? entry.health : null,
        nextClipId: isLead && isShuffleOn ? entry.nextClipId : null,
        mic:
          !isConnected || entry.mic === null
            ? null
            : {
                level: entry.mic.level,
                detectedBpm: entry.mic.bpm,
                confidence: entry.mic.confidence,
              },
      };
    });
}

export function screensUpdateTo(
  stage: Pick<VjDemoStage, "screens" | "state">,
  target: { tabId?: string | null; role?: VjAttachRole | null },
): VjDemoOutgoing {
  return frameTo(
    "screens:update",
    { screens: screenStatusesOf(stage) },
    target,
  );
}

function withoutTab(
  attached: Record<string, VjAttachRole>,
  tabId: string,
): Record<string, VjAttachRole> {
  const next = { ...attached };
  delete next[tabId];
  return next;
}

/** The attach success ack (contract 7.1), stamped with the server's clock. */
function attachSuccess(
  stage: VjDemoStage,
  role: VjAttachRole,
  now: number,
  screen: {
    isRestored: boolean;
    isLead: boolean | null;
    screenNumber: number | null;
  },
): { ok: true; serverNow: number } & VjAttachSuccess {
  return vjDemoAckSuccess(now, {
    role,
    connectionExpiresAt: now + VJ_DEMO_CONNECTION_LIFETIME_MS,
    stageEpoch: stage.state.stageEpoch,
    isRestored: screen.isRestored,
    isLead: screen.isLead,
    screenNumber: screen.screenNumber,
  });
}

/** The attach stage:state to one tab: the pending applyAt while it is ahead. */
function attachFrameTo(
  stage: VjDemoStage,
  tabId: string,
  now: number,
): VjDemoOutgoing {
  const applyAt = vjDemoAttachApplyAt(stage.pendingApplyAt, now);
  return frameTo(
    "stage:state",
    stageFrame(stage.state, "attach", null, applyAt),
    { tabId },
  );
}

function attachRemote(
  stage: VjDemoStage,
  tabId: string,
  now: number,
): VjDemoStageResult {
  const next: VjDemoStage = {
    ...stage,
    attached: { ...stage.attached, [tabId]: "remote" },
  };
  return {
    stage: next,
    ack: attachSuccess(next, "remote", now, {
      isRestored: false,
      isLead: null,
      screenNumber: null,
    }),
    outgoing: [
      attachFrameTo(next, tabId, now),
      screensUpdateTo(next, { tabId }),
    ],
  };
}

/** Contract 7.13 adoption at revision 0: the restored state, canonical, and
 *  no pending applyAt. Null when the stage keeps its state. */
function restoredStageOf(
  stage: VjDemoStage,
  restoreState: unknown,
  context: VjDemoStageContext,
): Pick<VjDemoStage, "state" | "pendingApplyAt"> | null {
  if (stage.state.revision !== 0 || !isVjRecord(restoreState)) return null;
  const state = canonicalVjStageState(
    restoreVjDemoStage(stage.state, restoreState, context.library, context.now),
  );
  return { state, pendingApplyAt: null };
}

/** The screen list with `screenId` pointed at the tab: a returning screen
 *  keeps its number and waits for its next status for health, next clip and
 *  mic; a new one takes the next number. */
function connectScreenEntry(
  stage: VjDemoStage,
  screenId: string,
  tabId: string,
  now: number,
): Pick<VjDemoStage, "screens" | "connectionCounter" | "highestScreenNumber"> {
  const existing = stage.screens.find((entry) => entry.screenId === screenId);
  const connectionCounter = stage.connectionCounter + 1;
  const connection = {
    tabId,
    connectedAt: now,
    connectionOrder: connectionCounter,
    disconnectedAt: null,
    lastSeenAt: now,
    health: null,
    nextClipId: null,
    mic: null,
  };
  if (existing !== undefined) {
    return {
      screens: stage.screens.map((entry) =>
        entry === existing ? { ...entry, ...connection } : entry,
      ),
      connectionCounter,
      highestScreenNumber: stage.highestScreenNumber,
    };
  }
  const highestScreenNumber = stage.highestScreenNumber + 1;
  const entry: VjDemoScreenEntry = {
    screenId,
    number: highestScreenNumber,
    isFullscreen: false,
    preload: { packId: null, clips: [] },
    ...connection,
  };
  return {
    screens: [...stage.screens, entry],
    connectionCounter,
    highestScreenNumber,
  };
}

function attachScreen(
  stage: VjDemoStage,
  tabId: string,
  record: Record<string, unknown>,
  context: VjDemoStageContext,
): VjDemoStageResult {
  const { now } = context;
  if (!isVjUuid(record.screenId)) {
    return refuse(stage, "vj_screen_id_invalid", now);
  }
  const screenId = record.screenId.toLowerCase();
  const outgoing: VjDemoOutgoing[] = [];
  let attached = stage.attached;
  const existing = stage.screens.find((entry) => entry.screenId === screenId);
  if (
    existing !== undefined &&
    existing.tabId !== null &&
    existing.tabId !== tabId
  ) {
    const replaced = {
      status: "error",
      code: "BAD_REQUEST",
      message: "replaced",
      domainCode: "vj_screen_replaced",
    };
    outgoing.push(frameTo("exception", replaced, { tabId: existing.tabId }));
    attached = withoutTab(attached, existing.tabId);
  }
  const restored = restoredStageOf(stage, record.restoreState, context);
  const next: VjDemoStage = {
    ...stage,
    ...(restored ?? {}),
    ...connectScreenEntry(stage, screenId, tabId, now),
    attached: { ...attached, [tabId]: "screen" },
  };
  const isRestored = restored !== null;
  const isLead = leadOf(next.screens)?.screenId === screenId;
  const screenNumber =
    next.screens.find((entry) => entry.screenId === screenId)?.number ?? 0;
  outgoing.push(
    isRestored
      ? frameTo("stage:state", stageFrame(next.state, "restore"))
      : attachFrameTo(next, tabId, now),
    frameTo("screen:role", { isLead }, { tabId }),
    screensUpdateTo(next, { role: "remote" }),
  );
  return {
    stage: next,
    ack: attachSuccess(next, "screen", now, {
      isRestored,
      isLead,
      screenNumber,
    }),
    outgoing,
  };
}

/** Contract 7.1 check order: vj_already_attached, the contract version
 *  (vj_client_outdated), then the v1 role checks. */
export function reduceAttach(
  stage: VjDemoStage,
  tabId: string,
  payload: unknown,
  context: VjDemoStageContext,
): VjDemoStageResult {
  if (stage.attached[tabId] !== undefined) {
    return refuse(stage, "vj_already_attached", context.now);
  }
  const record = readVjRecord(payload);
  if (record.contractVersion !== VJ_CONTRACT_VERSION) {
    return refuse(stage, "vj_client_outdated", context.now);
  }
  if (record.role === "remote") return attachRemote(stage, tabId, context.now);
  if (record.role === "screen")
    return attachScreen(stage, tabId, record, context);
  // The live ValidationPipe answers a malformed attach with an exception and no ack.
  const exception = {
    status: "error",
    code: "BAD_REQUEST",
    message: "invalid attach",
  };
  return {
    stage,
    ack: null,
    outgoing: [frameTo("exception", exception, { tabId })],
  };
}

export function reduceDetach(
  stage: VjDemoStage,
  tabId: string,
  now: number,
): VjDemoStageResult {
  const role = stage.attached[tabId];
  if (role === undefined) return silent(stage);
  const attached = withoutTab(stage.attached, tabId);
  if (role === "remote") return silent({ ...stage, attached });
  const screens = stage.screens.map((entry) =>
    entry.tabId === tabId
      ? { ...entry, tabId: null, connectedAt: null, disconnectedAt: now }
      : entry,
  );
  const next: VjDemoStage = { ...stage, attached, screens };
  return {
    stage: next,
    ack: null,
    outgoing: [screensUpdateTo(next, { role: "remote" })],
  };
}

/** Contract 6.8: a lead change tells both screens, skipping a tab already told. */
export function withLeadChange(
  result: VjDemoStageResult,
  leadBefore: VjDemoScreenEntry | null,
): VjDemoStageResult {
  const leadAfter = leadOf(result.stage.screens);
  if (leadBefore?.screenId === leadAfter?.screenId) return result;
  const toldTabIds = new Set(
    result.outgoing
      .filter((frame) => frame.name === "screen:role")
      .map((frame) => frame.targetTabId),
  );
  const outgoing = [...result.outgoing];
  const formerLead = result.stage.screens.find(
    (entry) => entry.screenId === leadBefore?.screenId,
  );
  const formerLeadTabId = formerLead?.tabId ?? null;
  if (formerLeadTabId !== null && !toldTabIds.has(formerLeadTabId)) {
    outgoing.push(
      frameTo("screen:role", { isLead: false }, { tabId: formerLeadTabId }),
    );
  }
  const leadAfterTabId = leadAfter?.tabId ?? null;
  if (leadAfterTabId !== null && !toldTabIds.has(leadAfterTabId)) {
    outgoing.push(
      frameTo("screen:role", { isLead: true }, { tabId: leadAfterTabId }),
    );
  }
  return { ...result, outgoing };
}

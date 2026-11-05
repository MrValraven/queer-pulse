// The demo VJ stage's screen list (contract 6.4, 6.7 and 6.8): attach,
// detach, numbering, the lead and the frames the stage sends, pure.

import {
  type VjAttachRole,
  type VjAttachSuccess,
  type VjScreenPreload,
  type VjScreenStatus,
  type VjSocketErrorCode,
  type VjStageRestore,
  type VjStageState,
} from "../../../shared/contracts/vj";
import type { VjDemoLibraryLookup } from "./vjDemoStore";
import { isVjUuid } from "./vjDemoRules";
import {
  readVjRecord,
  restoreVjStage,
  vjDemoAckFailure,
} from "./vjDemoStageCommands";
import {
  frameTo,
  isVjRecord,
  stageFrame,
  type VjDemoOutgoing,
} from "./vjDemoStageInput";

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

export function refuse(
  stage: VjDemoStage,
  code: VjSocketErrorCode,
  state?: VjStageState,
): VjDemoStageResult {
  return { stage, ack: vjDemoAckFailure(code, state), outgoing: [] };
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

function screenStatusesOf(screens: VjDemoScreenEntry[]): VjScreenStatus[] {
  const lead = leadOf(screens);
  return [...screens]
    .sort((left, right) => left.number - right.number)
    .map((entry) => ({
      screenId: entry.screenId,
      number: entry.number,
      isConnected: entry.tabId !== null,
      isLead: lead !== null && entry.screenId === lead.screenId,
      isFullscreen: entry.isFullscreen,
      connectedAt: entry.connectedAt,
      lastSeenAt: entry.lastSeenAt,
      preload: entry.preload,
    }));
}

export function screensUpdateTo(
  screens: VjDemoScreenEntry[],
  target: { tabId?: string | null; role?: VjAttachRole | null },
): VjDemoOutgoing {
  return frameTo(
    "screens:update",
    { screens: screenStatusesOf(screens) },
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

function attachSuccess(
  stage: VjDemoStage,
  role: VjAttachRole,
  now: number,
  screen: { isRestored: boolean; isLead: boolean | null },
): { ok: true } & VjAttachSuccess {
  return {
    ok: true,
    role,
    connectionExpiresAt: now + VJ_DEMO_CONNECTION_LIFETIME_MS,
    stageEpoch: stage.state.stageEpoch,
    isRestored: screen.isRestored,
    isLead: screen.isLead,
  };
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
    }),
    outgoing: [
      frameTo("stage:state", stageFrame(next.state, "attach"), { tabId }),
      screensUpdateTo(next.screens, { tabId }),
    ],
  };
}

function attachScreen(
  stage: VjDemoStage,
  tabId: string,
  record: Record<string, unknown>,
  context: VjDemoStageContext,
): VjDemoStageResult {
  const { restoreState } = record;
  if (!isVjUuid(record.screenId)) return refuse(stage, "vj_screen_id_invalid");
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
  const connectionCounter = stage.connectionCounter + 1;
  const connection = {
    tabId,
    connectedAt: context.now,
    connectionOrder: connectionCounter,
    disconnectedAt: null,
    lastSeenAt: context.now,
  };
  const highestScreenNumber =
    stage.highestScreenNumber + (existing === undefined ? 1 : 0);
  const screens: VjDemoScreenEntry[] = existing
    ? stage.screens.map((entry) =>
        entry === existing ? { ...entry, ...connection } : entry,
      )
    : [
        ...stage.screens,
        {
          screenId,
          number: highestScreenNumber,
          isFullscreen: false,
          preload: { packId: null, clips: [] },
          ...connection,
        },
      ];
  const isRestored = stage.state.revision === 0 && isVjRecord(restoreState);
  const state = isRestored
    ? {
        ...restoreVjStage(
          stage.state,
          restoreState as unknown as VjStageRestore,
          context.library,
        ),
        updatedAt: context.now,
      }
    : stage.state;
  const next: VjDemoStage = {
    ...stage,
    state,
    screens,
    attached: { ...attached, [tabId]: "screen" },
    connectionCounter,
    highestScreenNumber,
  };
  const isLead = leadOf(screens)?.screenId === screenId;
  outgoing.push(
    isRestored
      ? frameTo("stage:state", stageFrame(state, "restore"))
      : frameTo("stage:state", stageFrame(state, "attach"), { tabId }),
    frameTo("screen:role", { isLead }, { tabId }),
    screensUpdateTo(screens, { role: "remote" }),
  );
  return {
    stage: next,
    ack: attachSuccess(next, "screen", context.now, { isRestored, isLead }),
    outgoing,
  };
}

export function reduceAttach(
  stage: VjDemoStage,
  tabId: string,
  payload: unknown,
  context: VjDemoStageContext,
): VjDemoStageResult {
  if (stage.attached[tabId] !== undefined)
    return refuse(stage, "vj_already_attached");
  const record = readVjRecord(payload);
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
  return {
    stage: { ...stage, attached, screens },
    ack: null,
    outgoing: [screensUpdateTo(screens, { role: "remote" })],
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

/**
 * The one way to the stage: attaches as a screen or a remote through the
 * VJ transport (live socket or demo channel), feeds every clock sample into
 * one synced clock, runs received states through the C 7.4 client queue and
 * sends the remote's stamped commands and the lead screen's shuffle reports.
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  VJ_CONTRACT_VERSION,
  type VjAttachPayload,
  type VjLibraryChange,
  type VjScreenIdentifyFrame,
  type VjScreenRenderModeFrame,
  type VjScreenStatus,
  type VjScreenStatusPayload,
  type VjStageCause,
  type VjStageRestore,
  type VjStageState,
} from "../../../shared/contracts/vj";
import {
  createVjCommandStamper,
  type VjCommandStamper,
} from "../realtime/vjCommandStamp";
import { createVjTransport } from "../realtime/createVjTransport";
import type {
  VjConnectionRefusal,
  VjConnectionState,
} from "../realtime/vjTransport";
import {
  createVjClock,
  type VjClock,
  type VjClockOffsetSnapshot,
} from "./vjClock";
import type { VjUpcomingFrame } from "./vjFrameQueue";
import {
  createVjStageCommands,
  offlineVjCommandOutcome,
  settleVjCommand,
  type VjCommandOutcome,
  type VjStageCommands,
} from "./vjStageCommands";
import { useVjFrameQueue } from "./useVjFrameQueue";
import { useVjStageInbox } from "./useVjStageInbox";
import { useVjTransportSlot } from "./useVjTransportSlot";

export type {
  VjCommandOutcome,
  VjIdentifyOutcome,
  VjRenderModeOutcome,
  VjStageCommands,
} from "./vjStageCommands";
export type { VjUpcomingFrame } from "./vjFrameQueue";

export type VjStageAttach =
  | { role: "remote" }
  | {
      role: "screen";
      screenId: string;
      /** Read at every (re)attach. */
      getRestoreState: () => VjStageRestore | null;
    };

export interface VjStageController {
  isDemo: boolean;
  connection: VjConnectionState;
  /** connection.status === "attached" */
  isConnected: boolean;
  /** The state applied through the C 7.4 client queue at each frame's applyAt: what the screens show now.
   *  Screens render it; the remote mirror draws it. */
  state: VjStageState | null;
  /** Cause and sender of the frame `state` came from; null after an ack snap. */
  lastCause: VjStageCause | null;
  lastSourceClientId: string | null;
  /** The newest state received (frames and ack snaps), before its applyAt. Remote controls (pads lit, sliders) read it. */
  latestState: VjStageState | null;
  /** The earliest received frame still waiting for its applyAt; null when none waits. */
  upcoming: VjUpcomingFrame | null;
  /** Synced clock (C 3.6): one per mount, fed by every ack and clock:sync. */
  clock: VjClock;
  serverNow: () => number;
  toLocalTime: (serverMs: number) => number;
  isClockSynced: boolean;
  /** The current offset (server minus local ms); the screen saves it as VjScreenRecord.clockOffsetMs. */
  clockOffsetMs: number | null;
  /** Seeds the clock from a saved offset (offline reload) until a live sample arrives. */
  seedClockOffset: (offsetMs: number | null) => void;
  /** This page load's id, carried by every command. */
  clientId: string;
  /** Remote: from screens:update. */
  screens: readonly VjScreenStatus[];
  /** Screen: from the attach ack and then each screen:role. */
  isLead: boolean;
  /** Screen: VjAttachSuccess.screenNumber of the current attach; null for a remote or while detached. */
  screenNumber: number | null;
  refusal: VjConnectionRefusal | null;
  /** Remote. */
  commands: VjStageCommands;
  /** Screen (lead): reports the shuffle's next clip. */
  advance: (
    expectedClipSequence: number,
    clipId: string,
  ) => Promise<VjCommandOutcome>;
  /** Screen; the whole v2 payload, dropped while disconnected. */
  sendStatus: (status: VjScreenStatusPayload) => void;
  subscribeLibrary: (listener: (change: VjLibraryChange) => void) => () => void;
  /** Screen: every screen:identify frame this screen receives. */
  subscribeIdentify: (
    listener: (frame: VjScreenIdentifyFrame) => void,
  ) => () => void;
  /** Screen: every screen:renderMode frame this screen receives. */
  subscribeRenderMode: (
    listener: (frame: VjScreenRenderModeFrame) => void,
  ) => () => void;
}

function attachPayloadOf(attach: VjStageAttach): VjAttachPayload {
  return attach.role === "screen"
    ? {
        role: "screen",
        contractVersion: VJ_CONTRACT_VERSION,
        screenId: attach.screenId,
        restoreState: attach.getRestoreState(),
      }
    : { role: "remote", contractVersion: VJ_CONTRACT_VERSION };
}

/** The clock's offset as a store whose snapshot moves only when the clock
 *  notifies, so an offset nudge under VJ_CLOCK_NOTIFY_MIN_DELTA_MS (or any
 *  re-render between notifications) never rebuilds the controller. */
function createVjNotifiedOffsetStore(clock: VjClock) {
  let snapshot: VjClockOffsetSnapshot = {
    offsetMs: clock.offsetMs(),
    isSynced: clock.isSynced(),
  };
  const refresh = () => {
    const offsetMs = clock.offsetMs();
    const isSynced = clock.isSynced();
    if (snapshot.offsetMs !== offsetMs || snapshot.isSynced !== isSynced) {
      snapshot = { offsetMs, isSynced };
    }
  };
  return {
    subscribe: (listener: () => void): (() => void) => {
      // Catches a notification that came between the first render and now.
      refresh();
      return clock.subscribe(() => {
        refresh();
        listener();
      });
    },
    getSnapshot: (): VjClockOffsetSnapshot => snapshot,
  };
}

function useVjNotifiedClockOffset(clock: VjClock): VjClockOffsetSnapshot {
  const store = useMemo(() => createVjNotifiedOffsetStore(clock), [clock]);
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );
}

/** Flat clock readers over the per-mount clock, and its offset as React state. */
function useVjStageClock(clock: VjClock) {
  const { offsetMs, isSynced } = useVjNotifiedClockOffset(clock);
  const serverNow = useCallback(() => clock.serverNow(), [clock]);
  const toLocalTime = useCallback(
    (serverMs: number) => clock.toLocalTime(serverMs),
    [clock],
  );
  const seedClockOffset = useCallback(
    (seedMs: number | null) => clock.seedOffset(seedMs),
    [clock],
  );
  return useMemo(
    () => ({
      serverNow,
      toLocalTime,
      seedClockOffset,
      isClockSynced: isSynced,
      clockOffsetMs: offsetMs,
    }),
    [serverNow, toLocalTime, seedClockOffset, isSynced, offsetMs],
  );
}

type VjStageInbox = ReturnType<typeof useVjStageInbox>;
type VjStageSlot = ReturnType<typeof useVjTransportSlot>;

interface VjTransportLifetimeInput {
  attach: VjStageAttach;
  isDemoMode: boolean;
  clock: VjClock;
  inbox: VjStageInbox;
  slot: VjStageSlot;
  resetQueue: () => void;
}

/** One transport per mode, role and screen id; a new one starts from an empty queue and inbox. */
function useVjTransportLifetime(input: VjTransportLifetimeInput) {
  const { attach, isDemoMode, clock, resetQueue } = input;
  const { handleFrame, handleConnection, resetForNewTransport } = input.inbox;
  const { holdTransport, releaseTransport } = input.slot;
  const attachRef = useRef(attach);
  const role = attach.role;
  const screenId = attach.role === "screen" ? attach.screenId : null;

  useEffect(() => {
    attachRef.current = attach;
  });

  useEffect(() => {
    let isActive = true;
    // The clock keeps its samples: the server's clock did not move.
    resetQueue();
    resetForNewTransport();
    const transport = createVjTransport({
      role,
      isDemoMode,
      buildAttachPayload: () => attachPayloadOf(attachRef.current),
      onFrame: (frame) => {
        if (isActive) handleFrame(frame);
      },
      onConnection: (connection) => {
        if (isActive) handleConnection(connection);
      },
      onClockSample: (sample) => {
        if (isActive) clock.addSample(sample);
      },
    });
    holdTransport(transport);
    transport.connect();
    return () => {
      isActive = false;
      transport.dispose();
      releaseTransport(transport);
      resetQueue();
      resetForNewTransport();
    };
  }, [
    isDemoMode,
    role,
    screenId,
    clock,
    handleFrame,
    handleConnection,
    resetForNewTransport,
    resetQueue,
    holdTransport,
    releaseTransport,
  ]);
}

/** The remote's commands, the lead screen's advance and the screen status report. */
function useVjStageSends(
  inbox: VjStageInbox,
  slot: VjStageSlot,
  stamper: VjCommandStamper,
  receiveAckState: (state: VjStageState) => void,
) {
  const { isAttached, currentRefusal } = inbox;
  const { transportSend, sendScreenStatus } = slot;

  const commands = useMemo(
    () =>
      createVjStageCommands(
        transportSend,
        stamper,
        receiveAckState,
        isAttached,
        currentRefusal,
      ),
    [transportSend, stamper, receiveAckState, isAttached, currentRefusal],
  );

  const advance = useCallback(
    (expectedClipSequence: number, clipId: string) => {
      if (!isAttached()) {
        return Promise.resolve(
          offlineVjCommandOutcome("screen:advance", currentRefusal()),
        );
      }
      return settleVjCommand(
        () =>
          transportSend.send("screen:advance", {
            expectedClipSequence,
            clipId,
          }),
        receiveAckState,
      );
    },
    [transportSend, receiveAckState, isAttached, currentRefusal],
  );

  const sendStatus = useCallback(
    (status: VjScreenStatusPayload) => {
      if (!isAttached()) return;
      sendScreenStatus(status);
    },
    [isAttached, sendScreenStatus],
  );

  return { commands, advance, sendStatus };
}

export function useVjStage(attach: VjStageAttach): VjStageController {
  const { demoMode } = useDemoMode();
  const [clock] = useState(() => createVjClock());
  const [stamper] = useState(() => createVjCommandStamper());
  const queue = useVjFrameQueue(clock);
  const inbox = useVjStageInbox(queue.receiveFrame);
  const slot = useVjTransportSlot();
  useVjTransportLifetime({
    attach,
    isDemoMode: demoMode,
    clock,
    inbox,
    slot,
    resetQueue: queue.reset,
  });
  const { commands, advance, sendStatus } = useVjStageSends(
    inbox,
    slot,
    stamper,
    queue.receiveAckState,
  );
  const clockView = useVjStageClock(clock);
  const { applied, latest, upcoming } = queue;
  const { connection, screens, isLead, screenNumber } = inbox;
  const { subscribeLibrary, subscribeIdentify, subscribeRenderMode } = inbox;

  return useMemo<VjStageController>(
    () => ({
      isDemo: demoMode,
      connection,
      isConnected: connection.status === "attached",
      state: applied?.state ?? null,
      lastCause: applied?.cause ?? null,
      lastSourceClientId: applied?.sourceClientId ?? null,
      latestState: latest?.state ?? null,
      upcoming,
      clock,
      ...clockView,
      clientId: stamper.clientId,
      screens,
      isLead,
      screenNumber,
      refusal: connection.refusal,
      commands,
      advance,
      sendStatus,
      subscribeLibrary,
      subscribeIdentify,
      subscribeRenderMode,
    }),
    [
      demoMode,
      connection,
      applied,
      latest,
      upcoming,
      clock,
      clockView,
      stamper,
      screens,
      isLead,
      screenNumber,
      commands,
      advance,
      sendStatus,
      subscribeLibrary,
      subscribeIdentify,
      subscribeRenderMode,
    ],
  );
}

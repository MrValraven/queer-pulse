/**
 * The one way to the stage: attaches as a screen or a remote through the
 * VJ transport (live socket or demo channel), keeps the last applied state
 * through the stage version check (contract 6.5.1) and sends the remote's
 * stamped commands and the lead screen's shuffle reports.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type {
  VjAttachPayload,
  VjLibraryChange,
  VjScreenPreload,
  VjScreenStatus,
  VjStageCause,
  VjStageRestore,
  VjStageState,
} from "../../../shared/contracts/vj";
import { createVjCommandStamper } from "../realtime/vjCommandStamp";
import { createVjTransport } from "../realtime/createVjTransport";
import type {
  VjAckFor,
  VjClientFrameName,
  VjClientPayload,
  VjScreenStatusPayload,
  VjServerFrame,
} from "../realtime/vjFrames";
import {
  INITIAL_VJ_CONNECTION,
  VjSendError,
  type VjConnectionRefusal,
  type VjConnectionState,
  type VjTransport,
} from "../realtime/vjTransport";
import {
  createVjStageCommands,
  offlineVjCommandOutcome,
  settleVjCommand,
  type VjCommandOutcome,
  type VjStageCommands,
} from "./vjStageCommands";
import {
  shouldApplyVjStageState,
  vjVersionOf,
  type VjAppliedVersion,
} from "./vjStageVersion";

export type { VjCommandOutcome, VjStageCommands } from "./vjStageCommands";

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
  /** The last applied state. */
  state: VjStageState | null;
  /** The cause of the last applied stage:state; null after a snap to an ack's state. */
  lastCause: VjStageCause | null;
  lastSourceClientId: string | null;
  /** This page load's id, carried by every command. */
  clientId: string;
  /** Remote: from screens:update. */
  screens: readonly VjScreenStatus[];
  /** Screen: from the attach ack and then each screen:role. */
  isLead: boolean;
  refusal: VjConnectionRefusal | null;
  /** Remote. */
  commands: VjStageCommands;
  /** Screen (lead): reports the shuffle's next clip. */
  advance: (
    expectedClipSequence: number,
    clipId: string,
  ) => Promise<VjCommandOutcome>;
  /** Screen; dropped while disconnected. */
  sendStatus: (status: {
    isFullscreen: boolean;
    preload: VjScreenPreload;
  }) => void;
  subscribeLibrary: (listener: (change: VjLibraryChange) => void) => () => void;
}

interface VjAppliedStage {
  state: VjStageState | null;
  lastCause: VjStageCause | null;
  lastSourceClientId: string | null;
}

const EMPTY_APPLIED_STAGE: VjAppliedStage = {
  state: null,
  lastCause: null,
  lastSourceClientId: null,
};

const NO_SCREENS: readonly VjScreenStatus[] = [];

function attachPayloadOf(attach: VjStageAttach): VjAttachPayload {
  return attach.role === "screen"
    ? {
        role: "screen",
        screenId: attach.screenId,
        restoreState: attach.getRestoreState(),
      }
    : { role: "remote" };
}

/** Applied state, lead flag, screen list and library fan-out, fed by the transport's callbacks. */
function useVjStageInbox() {
  const [applied, setApplied] = useState<VjAppliedStage>(EMPTY_APPLIED_STAGE);
  const [connection, setConnection] = useState<VjConnectionState>(
    INITIAL_VJ_CONNECTION,
  );
  const [screens, setScreens] = useState<readonly VjScreenStatus[]>(NO_SCREENS);
  const [isLead, setIsLead] = useState(false);
  const appliedVersionRef = useRef<VjAppliedVersion | null>(null);
  const connectionRef = useRef<VjConnectionState>(INITIAL_VJ_CONNECTION);
  const libraryListenersRef = useRef(
    new Set<(change: VjLibraryChange) => void>(),
  );

  const applyState = useCallback(
    (
      state: VjStageState,
      cause: VjStageCause | null,
      sourceClientId: string | null,
    ) => {
      if (!shouldApplyVjStageState(appliedVersionRef.current, state)) return;
      appliedVersionRef.current = vjVersionOf(state);
      setApplied({
        state,
        lastCause: cause,
        lastSourceClientId: sourceClientId,
      });
    },
    [],
  );

  const applyAckState = useCallback(
    (state: VjStageState) => applyState(state, null, null),
    [applyState],
  );

  const handleFrame = useCallback(
    (frame: VjServerFrame) => {
      switch (frame.event) {
        case "stage:state":
          applyState(
            frame.payload.state,
            frame.payload.cause,
            frame.payload.sourceClientId,
          );
          return;
        case "screen:role":
          setIsLead(frame.payload.isLead);
          return;
        case "screens:update":
          setScreens(frame.payload.screens);
          return;
        case "library:changed":
          for (const listener of [...libraryListenersRef.current]) {
            listener(frame.payload);
          }
          return;
      }
    },
    [applyState],
  );

  const handleConnection = useCallback((next: VjConnectionState) => {
    connectionRef.current = next;
    setConnection(next);
    const leadFromAttach = next.attach?.isLead ?? null;
    if (next.status === "attached" && leadFromAttach !== null) {
      setIsLead(leadFromAttach);
    }
    if (next.status === "refused") setIsLead(false);
    // A detached remote cannot know which screens are live; the next
    // screens:update after reattach fills the list again.
    if (next.status !== "attached") setScreens(NO_SCREENS);
  }, []);

  /** A new transport starts from nothing: no version, connection, lead flag or screens. */
  const resetForNewTransport = useCallback(() => {
    appliedVersionRef.current = null;
    connectionRef.current = INITIAL_VJ_CONNECTION;
    setConnection(INITIAL_VJ_CONNECTION);
    setIsLead(false);
    setScreens(NO_SCREENS);
  }, []);

  const subscribeLibrary = useCallback(
    (listener: (change: VjLibraryChange) => void) => {
      const listeners = libraryListenersRef.current;
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    [],
  );

  const isAttached = useCallback(
    () => connectionRef.current.status === "attached",
    [],
  );

  const currentRefusal = useCallback((): VjConnectionRefusal | null => {
    const current = connectionRef.current;
    return current.status === "refused" ? current.refusal : null;
  }, []);

  return {
    applied,
    connection,
    screens,
    isLead,
    applyAckState,
    handleFrame,
    handleConnection,
    resetForNewTransport,
    subscribeLibrary,
    isAttached,
    currentRefusal,
  };
}

/** Holds the transport of the current mount; sends refuse as disconnected while none is held. */
function useVjTransportSlot() {
  const transportRef = useRef<VjTransport | null>(null);

  const holdTransport = useCallback((transport: VjTransport | null) => {
    transportRef.current = transport;
  }, []);

  const releaseTransport = useCallback((transport: VjTransport) => {
    if (transportRef.current === transport) transportRef.current = null;
  }, []);

  const transportSend = useMemo<Pick<VjTransport, "send">>(
    () => ({
      send<Name extends VjClientFrameName>(
        name: Name,
        payload: VjClientPayload<Name>,
      ): Promise<VjAckFor<Name>> {
        const transport = transportRef.current;
        if (transport === null) {
          return Promise.reject(new VjSendError(name, "disconnected"));
        }
        return transport.send(name, payload);
      },
    }),
    [],
  );

  const sendScreenStatus = useCallback((payload: VjScreenStatusPayload) => {
    transportRef.current?.sendScreenStatus(payload);
  }, []);

  return { holdTransport, releaseTransport, transportSend, sendScreenStatus };
}

export function useVjStage(attach: VjStageAttach): VjStageController {
  const { demoMode } = useDemoMode();
  const inbox = useVjStageInbox();
  const { handleFrame, handleConnection, resetForNewTransport, isAttached } =
    inbox;
  const { currentRefusal } = inbox;
  const { applyAckState } = inbox;
  const [stamper] = useState(() => createVjCommandStamper());
  const attachRef = useRef(attach);
  const { holdTransport, releaseTransport, transportSend, sendScreenStatus } =
    useVjTransportSlot();
  const role = attach.role;
  const screenId = attach.role === "screen" ? attach.screenId : null;

  useEffect(() => {
    attachRef.current = attach;
  });

  useEffect(() => {
    let isActive = true;
    resetForNewTransport();
    const transport = createVjTransport({
      role,
      isDemoMode: demoMode,
      buildAttachPayload: () => attachPayloadOf(attachRef.current),
      onFrame: (frame) => {
        if (isActive) handleFrame(frame);
      },
      onConnection: (connection) => {
        if (isActive) handleConnection(connection);
      },
    });
    holdTransport(transport);
    transport.connect();
    return () => {
      isActive = false;
      transport.dispose();
      releaseTransport(transport);
      resetForNewTransport();
    };
  }, [
    demoMode,
    role,
    screenId,
    handleFrame,
    handleConnection,
    resetForNewTransport,
    holdTransport,
    releaseTransport,
  ]);

  const commands = useMemo(
    () =>
      createVjStageCommands(
        transportSend,
        stamper,
        applyAckState,
        isAttached,
        currentRefusal,
      ),
    [transportSend, stamper, applyAckState, isAttached, currentRefusal],
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
        applyAckState,
      );
    },
    [transportSend, applyAckState, isAttached, currentRefusal],
  );

  const sendStatus = useCallback(
    (status: { isFullscreen: boolean; preload: VjScreenPreload }) => {
      if (!isAttached()) return;
      sendScreenStatus({
        isFullscreen: status.isFullscreen,
        preload: status.preload,
      });
    },
    [isAttached, sendScreenStatus],
  );

  const { applied, connection, screens, isLead, subscribeLibrary } = inbox;
  return useMemo<VjStageController>(
    () => ({
      isDemo: demoMode,
      connection,
      isConnected: connection.status === "attached",
      state: applied.state,
      lastCause: applied.lastCause,
      lastSourceClientId: applied.lastSourceClientId,
      clientId: stamper.clientId,
      screens,
      isLead,
      refusal: connection.refusal,
      commands,
      advance,
      sendStatus,
      subscribeLibrary,
    }),
    [
      demoMode,
      connection,
      applied,
      stamper,
      screens,
      isLead,
      commands,
      advance,
      sendStatus,
      subscribeLibrary,
    ],
  );
}

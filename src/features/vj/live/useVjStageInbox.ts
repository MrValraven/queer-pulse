import { useCallback, useRef, useState } from "react";
import {
  upgradeVjStageFieldsV2,
  type VjLibraryChange,
  type VjScreenIdentifyFrame,
  type VjScreenRenderModeFrame,
  type VjScreenStatus,
  type VjStageFrame,
  type VjStageState,
} from "../../../shared/contracts/vj";
import type { VjServerFrame } from "../realtime/vjFrames";
import {
  INITIAL_VJ_CONNECTION,
  type VjConnectionRefusal,
  type VjConnectionState,
} from "../realtime/vjTransport";

const NO_SCREENS: readonly VjScreenStatus[] = [];

/**
 * A received stage frame with its state run through the v2 upgrade, so a
 * state from a backend older than sequences (no `setlistPlayback`) reads
 * as a stage with no sequence playing. A payload whose state is not an
 * object comes back as it was.
 */
export function upgradeVjStageFrame(frame: VjStageFrame): VjStageFrame {
  const receivedState: unknown = frame.state;
  if (
    typeof receivedState !== "object" ||
    receivedState === null ||
    Array.isArray(receivedState)
  ) {
    return frame;
  }
  const upgradedState = upgradeVjStageFieldsV2(
    receivedState as Record<string, unknown>,
  );
  if (upgradedState === receivedState) return frame;
  return { ...frame, state: upgradedState as unknown as VjStageState };
}

/** A listener set with a subscribe that answers its unsubscribe. */
function useVjListenerSet<Payload>() {
  const listenersRef = useRef(new Set<(payload: Payload) => void>());

  const subscribe = useCallback((listener: (payload: Payload) => void) => {
    const listeners = listenersRef.current;
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const notify = useCallback((payload: Payload) => {
    for (const listener of [...listenersRef.current]) listener(payload);
  }, []);

  return { subscribe, notify };
}

/**
 * Connection, lead flag, screen list, library, identify and render mode fan-out, fed by the
 * transport's callbacks. Stage frames go to onStageFrame (the frame queue owns
 * the applied state).
 */
export function useVjStageInbox(onStageFrame: (frame: VjStageFrame) => void) {
  const [connection, setConnection] = useState<VjConnectionState>(
    INITIAL_VJ_CONNECTION,
  );
  const [screens, setScreens] = useState<readonly VjScreenStatus[]>(NO_SCREENS);
  const [isLead, setIsLead] = useState(false);
  const connectionRef = useRef<VjConnectionState>(INITIAL_VJ_CONNECTION);
  const library = useVjListenerSet<VjLibraryChange>();
  const identify = useVjListenerSet<VjScreenIdentifyFrame>();
  const renderMode = useVjListenerSet<VjScreenRenderModeFrame>();
  const notifyLibrary = library.notify;
  const notifyIdentify = identify.notify;
  const notifyRenderMode = renderMode.notify;

  const handleFrame = useCallback(
    (frame: VjServerFrame) => {
      switch (frame.event) {
        case "stage:state":
          onStageFrame(upgradeVjStageFrame(frame.payload));
          return;
        case "screen:role":
          setIsLead(frame.payload.isLead);
          return;
        case "screens:update":
          setScreens(frame.payload.screens);
          return;
        case "library:changed":
          notifyLibrary(frame.payload);
          return;
        case "screen:identify":
          notifyIdentify(frame.payload);
          return;
        case "screen:renderMode":
          notifyRenderMode(frame.payload);
          return;
      }
    },
    [onStageFrame, notifyLibrary, notifyIdentify, notifyRenderMode],
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

  /** A new transport starts from nothing: no connection, lead flag or screens. */
  const resetForNewTransport = useCallback(() => {
    connectionRef.current = INITIAL_VJ_CONNECTION;
    setConnection(INITIAL_VJ_CONNECTION);
    setIsLead(false);
    setScreens(NO_SCREENS);
  }, []);

  const isAttached = useCallback(
    () => connectionRef.current.status === "attached",
    [],
  );

  const currentRefusal = useCallback((): VjConnectionRefusal | null => {
    const current = connectionRef.current;
    return current.status === "refused" ? current.refusal : null;
  }, []);

  // A v1 demo attach ack carries no screenNumber; it reads as null.
  const screenNumber =
    connection.status === "attached"
      ? (connection.attach?.screenNumber ?? null)
      : null;

  return {
    connection,
    screens,
    isLead,
    screenNumber,
    handleFrame,
    handleConnection,
    resetForNewTransport,
    subscribeLibrary: library.subscribe,
    subscribeIdentify: identify.subscribe,
    subscribeRenderMode: renderMode.subscribe,
    isAttached,
    currentRefusal,
  };
}

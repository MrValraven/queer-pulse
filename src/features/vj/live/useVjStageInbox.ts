import { useCallback, useRef, useState } from "react";
import type {
  VjLibraryChange,
  VjScreenIdentifyFrame,
  VjScreenStatus,
  VjStageFrame,
} from "../../../shared/contracts/vj";
import type { VjServerFrame } from "../realtime/vjFrames";
import {
  INITIAL_VJ_CONNECTION,
  type VjConnectionRefusal,
  type VjConnectionState,
} from "../realtime/vjTransport";

const NO_SCREENS: readonly VjScreenStatus[] = [];

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
 * Connection, lead flag, screen list, library and identify fan-out, fed by the
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
  const notifyLibrary = library.notify;
  const notifyIdentify = identify.notify;

  const handleFrame = useCallback(
    (frame: VjServerFrame) => {
      switch (frame.event) {
        case "stage:state":
          onStageFrame(frame.payload);
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
      }
    },
    [onStageFrame, notifyLibrary, notifyIdentify],
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
    isAttached,
    currentRefusal,
  };
}

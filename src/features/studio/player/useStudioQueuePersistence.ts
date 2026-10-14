import { useCallback, useEffect, useRef } from "react";
import { EMPTY_QUEUE_STATE, type StudioQueueState } from "./studioQueueReducer";
import {
  clearQueueSnapshot,
  clearStudioQueueSnapshots,
  readQueueSnapshot,
  writeQueueSnapshot,
  type StudioQueueSnapshot,
} from "./studioQueueStorage";
import { clearStudioEpisodeMemory } from "./studioEpisodeMemory";

const POSITION_SAVE_INTERVAL_MS = 5000;

export interface StudioQueuePersistenceOptions {
  /** The signed-in member (the demo member in demo); null when signed out. */
  memberId: string | null;
  demoMode: boolean;
  /** The session check and the Studio access read have both answered. */
  isSessionSettled: boolean;
  /** Signed in with Studio access. */
  hasAccess: boolean;
  queueState: StudioQueueState;
  isPlaying: boolean;
  readQueue: () => StudioQueueState;
  readPositionSeconds: () => number;
  onRestore: (snapshot: StudioQueueSnapshot) => void;
  /** The member changed away from the queue's owner: empty the in-memory queue. */
  onReset: () => void;
}

/**
 * The tab's saved queue (spec 5.3): restored paused once the session settles
 * with access; written on every queue change, on pause, every five seconds
 * while playing and when the page hides; removed when the queue empties, when
 * access goes and on a switch between demo and live. Sign-out and Quick Exit
 * clear it from their own files. Live boot starts signed out while the
 * session is checked, so nothing here clears during that window.
 */
export function useStudioQueuePersistence(
  options: StudioQueuePersistenceOptions,
): { clearSavedQueue: () => void } {
  const {
    memberId,
    demoMode,
    isSessionSettled,
    hasAccess,
    queueState,
    isPlaying,
  } = options;
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });
  const canSave = memberId !== null && isSessionSettled && hasAccess;
  const isQueueEmpty = queueState.current === null;
  const previousDemoModeRef = useRef(demoMode);
  const allowedMemberRef = useRef<string | null>(null);
  /** The member the in-memory queue belongs to; null until it is claimed. */
  const queueOwnerRef = useRef<string | null>(null);
  /** True from onReset until the queue is observed empty. */
  const isAwaitingResetRef = useRef(false);
  /** The restored playhead, used for writes until playback starts. */
  const restoredPositionRef = useRef<number | null>(null);

  const positionToSave = () =>
    restoredPositionRef.current ?? optionsRef.current.readPositionSeconds();
  /** Claims the queue for the member on first write; false when it is another member's. */
  const mayWrite = (writerId: string): boolean => {
    if (isAwaitingResetRef.current) return false;
    if (queueOwnerRef.current === null) queueOwnerRef.current = writerId;
    return queueOwnerRef.current === writerId;
  };

  useEffect(() => {
    if (previousDemoModeRef.current === demoMode) return;
    previousDemoModeRef.current = demoMode;
    clearStudioQueueSnapshots();
  }, [demoMode]);

  useEffect(() => {
    if (!isSessionSettled) return;
    if (hasAccess && memberId) {
      allowedMemberRef.current = memberId;
      return;
    }
    const lostMember = allowedMemberRef.current;
    allowedMemberRef.current = null;
    if (lostMember) {
      clearQueueSnapshot(lostMember);
      // Studio artist kinds: losing Studio access clears the episode memory
      // with the saved queue (spec 5.7).
      clearStudioEpisodeMemory();
    }
  }, [memberId, isSessionSettled, hasAccess]);

  useEffect(() => {
    const owner = queueOwnerRef.current;
    if (owner === null || owner === memberId) return;
    queueOwnerRef.current = null;
    restoredPositionRef.current = null;
    isAwaitingResetRef.current = true;
    optionsRef.current.onReset();
  }, [memberId]);

  useEffect(() => {
    if (!canSave || !memberId) return;
    if (optionsRef.current.readQueue().current !== null) return;
    isAwaitingResetRef.current = false;
    const snapshot = readQueueSnapshot(memberId);
    if (!snapshot) return;
    queueOwnerRef.current = memberId;
    restoredPositionRef.current = snapshot.positionSeconds;
    optionsRef.current.onRestore(snapshot);
  }, [canSave, memberId, demoMode, isQueueEmpty]);

  useEffect(() => {
    // The untouched empty queue of a first render writes nothing, and a newer
    // state (a restore in flight) writes on its own render.
    if (!canSave || !memberId || queueState === EMPTY_QUEUE_STATE) return;
    if (optionsRef.current.readQueue() !== queueState) return;
    if (queueState.current === null) {
      if (queueOwnerRef.current === memberId) clearQueueSnapshot(memberId);
      return;
    }
    if (!mayWrite(memberId)) return;
    writeQueueSnapshot(memberId, {
      state: queueState,
      positionSeconds: positionToSave(),
    });
  }, [canSave, memberId, queueState, isPlaying]);

  useEffect(() => {
    if (isPlaying) restoredPositionRef.current = null;
  }, [isPlaying]);

  useEffect(() => {
    if (!canSave || !memberId) return;
    const saveNow = () => {
      const queue = optionsRef.current.readQueue();
      if (queue.current === null || !mayWrite(memberId)) return;
      writeQueueSnapshot(memberId, {
        state: queue,
        positionSeconds: positionToSave(),
      });
    };
    const saveWhenHidden = () => {
      if (document.visibilityState === "hidden") saveNow();
    };
    window.addEventListener("pagehide", saveNow);
    document.addEventListener("visibilitychange", saveWhenHidden);
    const intervalId = isPlaying
      ? window.setInterval(saveNow, POSITION_SAVE_INTERVAL_MS)
      : null;
    return () => {
      window.removeEventListener("pagehide", saveNow);
      document.removeEventListener("visibilitychange", saveWhenHidden);
      if (intervalId !== null) window.clearInterval(intervalId);
    };
  }, [canSave, memberId, isPlaying]);

  const clearSavedQueue = useCallback(() => {
    const currentMember = optionsRef.current.memberId;
    if (currentMember) clearQueueSnapshot(currentMember);
  }, []);
  return { clearSavedQueue };
}

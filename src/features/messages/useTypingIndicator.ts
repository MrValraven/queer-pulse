import { useCallback, useEffect, useRef, useState } from "react";
import { useTypingFrames } from "../../shared/api/realtime";

/** How long a "typing" signal lives without a refresh frame before it self-clears. */
const TYPING_TTL_MS = 4000;

export interface TypingState {
  /** True while at least one other participant is typing in the open thread. */
  typing: boolean;
  /** The user ids currently typing (a DM has at most one; a group may have
   *  several). Always OTHER people — never the signed-in member: the gateway
   *  excludes the sender's whole `user:<id>` room (not just their socket, which
   *  would still echo to their other devices), and the realtime client drops any
   *  self-frame that slips through. See realtime.ts's `typing` handler. */
  typingUserIds: string[];
}

/**
 * Who is currently typing in the open thread, driven by live `typing` frames.
 * Tracks EACH typer independently (per-user self-clearing timer) so a group can
 * show "Ana is typing" / "Ana and Bea are typing" / "Several people are typing…"
 * — the single-counterpart DM case is just the one-element path through the same
 * machinery (no forked hook). Always empty in demo mode (no socket). Resets on
 * thread switch and never leaves a timer running past unmount.
 */
export function useTypingIndicator(activeId: string): TypingState {
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);
  // Per-user auto-clear timers, keyed by userId — a typer clears on its own if a
  // `typing:false` frame never arrives, independently of the others.
  const timersRef = useRef<Map<string, number>>(new Map());

  const clearAllTimers = useCallback(() => {
    for (const timer of timersRef.current.values()) window.clearTimeout(timer);
    timersRef.current.clear();
  }, []);

  // Reset when the open thread changes.
  useEffect(() => {
    // Resets the realtime-driven typing state on thread switch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTypingUserIds([]);
    clearAllTimers();
  }, [activeId, clearAllTimers]);

  // Memoized so `useTypingFrames` (which resubscribes on handler identity change)
  // only re-attaches when the open thread changes.
  const handleTyping = useCallback(
    (frame: { conversationId: string; userId: string; isTyping: boolean }) => {
      if (frame.conversationId !== activeId) return;
      const timers = timersRef.current;
      const existing = timers.get(frame.userId);
      if (existing) window.clearTimeout(existing);
      if (frame.isTyping) {
        setTypingUserIds((previous) =>
          previous.includes(frame.userId)
            ? previous
            : [...previous, frame.userId],
        );
        timers.set(
          frame.userId,
          window.setTimeout(() => {
            timers.delete(frame.userId);
            setTypingUserIds((previous) =>
              previous.filter((id) => id !== frame.userId),
            );
          }, TYPING_TTL_MS),
        );
      } else {
        timers.delete(frame.userId);
        setTypingUserIds((previous) =>
          previous.filter((id) => id !== frame.userId),
        );
      }
    },
    [activeId],
  );
  useTypingFrames(handleTyping);

  useEffect(() => () => clearAllTimers(), [clearAllTimers]);

  return { typing: typingUserIds.length > 0, typingUserIds };
}

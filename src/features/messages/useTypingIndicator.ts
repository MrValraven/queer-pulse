import { useCallback, useEffect, useRef, useState } from "react";
import { useTypingFrames } from "../../shared/api/realtime";

/**
 * Whether the counterpart is currently typing in the open thread, driven by
 * live `typing` frames. Always false in demo mode (no socket). Auto-clears if a
 * `typing:false` frame never arrives, resets on thread switch, and never leaves
 * a timer running past unmount.
 */
export function useTypingIndicator(activeId: string): boolean {
  const [counterpartTyping, setCounterpartTyping] = useState(false);
  const typingClearRef = useRef<number | undefined>(undefined);

  // Reset when the open thread changes.
  useEffect(() => {
    setCounterpartTyping(false);
    window.clearTimeout(typingClearRef.current);
  }, [activeId]);

  // Memoized so `useTypingFrames` (which resubscribes on handler identity
  // change) only re-attaches when the open thread changes.
  const handleTyping = useCallback(
    (frame: { conversationId: string; userId: string; isTyping: boolean }) => {
      if (frame.conversationId !== activeId) return;
      setCounterpartTyping(frame.isTyping);
      window.clearTimeout(typingClearRef.current);
      if (frame.isTyping) {
        typingClearRef.current = window.setTimeout(
          () => setCounterpartTyping(false),
          4000,
        );
      }
    },
    [activeId],
  );
  useTypingFrames(handleTyping);

  useEffect(() => () => window.clearTimeout(typingClearRef.current), []);

  return counterpartTyping;
}

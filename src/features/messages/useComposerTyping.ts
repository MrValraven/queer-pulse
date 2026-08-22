// src/features/messages/useComposerTyping.ts
import { useEffect, useRef } from "react";
import { useEmitTyping } from "../../shared/api/realtime";

/**
 * The composer's throttled `typing:true`/`typing:false` frames — split out of
 * `Composer` to keep it under the line cap. Mirrors the gateway's own token
 * bucket: at most one `typing:true` every ~2s while the reader keeps typing,
 * an idle timer that emits `typing:false` ~3s after the last keystroke, and an
 * immediate `typing:false` on send/blur (never left to the idle timer, so the
 * counterpart's indicator clears the instant the reader stops, not seconds
 * later). The idle timer is cleared on unmount so a thread switch never lets
 * a stale timer fire `typing:false` against a conversation this composer
 * instance no longer represents.
 */
export function useComposerTyping(conversationId: string) {
  const emitTyping = useEmitTyping();
  /** Idle timer that emits `typing:false` ~3s after the last keystroke; also
   *  cleared (and re-armed) on send/blur so we never emit a late false-then-true. */
  const typingIdleTimerRef = useRef<number | undefined>(undefined);
  /** Last `Date.now()` a `typing:true` frame was sent — throttles emits to at
   *  most once per ~2s while the reader keeps typing. */
  const lastTypingSentRef = useRef(0);

  useEffect(() => {
    return () => window.clearTimeout(typingIdleTimerRef.current);
  }, []);

  /** Called on every draft keystroke: throttles the `typing:true` frame and
   *  (re-)arms the idle timer that emits `typing:false` on silence. */
  function notifyTyping() {
    const now = Date.now();
    if (now - lastTypingSentRef.current > 2000) {
      emitTyping(conversationId, true);
      lastTypingSentRef.current = now;
    }
    window.clearTimeout(typingIdleTimerRef.current);
    typingIdleTimerRef.current = window.setTimeout(() => {
      emitTyping(conversationId, false);
    }, 3000);
  }

  /** Called on send/blur: immediately tells the counterpart typing stopped,
   *  cancelling the idle timer rather than waiting for it. `resetThrottle`
   *  (true on send, false on blur) also clears the throttle window, matching
   *  the original per-call behaviour. */
  function stopTyping(resetThrottle: boolean) {
    window.clearTimeout(typingIdleTimerRef.current);
    emitTyping(conversationId, false);
    if (resetThrottle) lastTypingSentRef.current = 0;
  }

  return { notifyTyping, stopTyping };
}

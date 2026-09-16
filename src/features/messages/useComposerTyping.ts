// src/features/messages/useComposerTyping.ts
import { useEffect, useRef } from "react";
import { useEmitTyping } from "../../shared/api/realtime";
import { useMessagingPrivacy } from "../settings/api/useMessagingPrivacy";

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
 *
 * PRD-364: the server already drops a `shareTyping: false` member's frames
 * (`ChatGateway.handleTyping`) — this is a courtesy, not the enforcement — but
 * emitting them anyway would still cost a socket round trip and a rate-limit
 * token for nothing every time the member types. Reads the same
 * `useMessagingPrivacy` cache the settings pane owns, so a toggle flipped in
 * one tab takes effect in every open composer without a reload.
 */
export function useComposerTyping(conversationId: string) {
  const emitTyping = useEmitTyping();
  const { privacy } = useMessagingPrivacy();
  const sharesTypingRef = useRef(privacy.shareTyping);
  /** Idle timer that emits `typing:false` ~3s after the last keystroke; also
   *  cleared (and re-armed) on send/blur so we never emit a late false-then-true. */
  const typingIdleTimerRef = useRef<number | undefined>(undefined);
  /** Last `Date.now()` a `typing:true` frame was sent — throttles emits to at
   *  most once per ~2s while the reader keeps typing. */
  const lastTypingSentRef = useRef(0);

  // Mirrored into a ref (rather than read from `privacy` directly) so
  // `notifyTyping`/`stopTyping` — plain functions called from event handlers,
  // not hooks — always read the LATEST value without needing to be redeclared
  // every render.
  useEffect(() => {
    sharesTypingRef.current = privacy.shareTyping;
  }, [privacy.shareTyping]);

  useEffect(() => {
    return () => window.clearTimeout(typingIdleTimerRef.current);
  }, []);

  /** Called on every draft keystroke: throttles the `typing:true` frame and
   *  (re-)arms the idle timer that emits `typing:false` on silence. No-ops
   *  entirely when the member has turned off typing sharing (PRD-364). */
  function notifyTyping() {
    if (!sharesTypingRef.current) return;
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
   *  the original per-call behaviour. Still clears the local idle timer when
   *  sharing is off (nothing to emit, but a stale timer must not fire later),
   *  it just skips the frame itself. */
  function stopTyping(resetThrottle: boolean) {
    window.clearTimeout(typingIdleTimerRef.current);
    if (sharesTypingRef.current) {
      emitTyping(conversationId, false);
    }
    if (resetThrottle) lastTypingSentRef.current = 0;
  }

  return { notifyTyping, stopTyping };
}

/**
 * An animation frame loop that hands the beat position on the synced clock
 * to `onFrame`, with no React render per frame (the beat dots write to the
 * DOM themselves). The loop runs while enabled with a tempo and pauses while
 * the tab is hidden.
 */
import { useEffect, useRef } from "react";
import {
  vjBeatPositionAt,
  type VjBeatPosition,
  type VjTempo,
} from "../../../../shared/contracts/vj";
import type { VjRemoteClock } from "./useVjRemoteClock";

export interface VjBeatTickerOptions {
  clock: VjRemoteClock;
  tempo: VjTempo | null;
  onFrame: (position: VjBeatPosition) => void;
  isEnabled: boolean;
}

function isDocumentHidden(): boolean {
  return (
    typeof document !== "undefined" && document.visibilityState === "hidden"
  );
}

export function useVjBeatTicker(options: VjBeatTickerOptions): void {
  const { clock, tempo, onFrame, isEnabled } = options;
  const onFrameRef = useRef(onFrame);
  const clockRef = useRef(clock);
  const tempoRef = useRef(tempo);
  const hasTempo = tempo !== null;

  useEffect(() => {
    onFrameRef.current = onFrame;
    clockRef.current = clock;
    tempoRef.current = tempo;
  });

  useEffect(() => {
    if (!isEnabled || !hasTempo) return;
    let frameHandle: number | null = null;

    function tick() {
      frameHandle = null;
      const currentTempo = tempoRef.current;
      if (currentTempo !== null) {
        const serverTime = clockRef.current.serverNow();
        onFrameRef.current(vjBeatPositionAt(currentTempo, serverTime));
      }
      scheduleFrame();
    }
    function scheduleFrame() {
      if (frameHandle !== null || isDocumentHidden()) return;
      frameHandle = requestAnimationFrame(tick);
    }
    function cancelFrame() {
      if (frameHandle !== null) cancelAnimationFrame(frameHandle);
      frameHandle = null;
    }
    function handleVisibilityChange() {
      if (isDocumentHidden()) cancelFrame();
      else scheduleFrame();
    }

    scheduleFrame();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelFrame();
    };
  }, [isEnabled, hasTempo]);
}

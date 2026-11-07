// Mic tempo adoption for the demo server (contract 7.9): the lead screen's
// mic report moves the stage tempo while the remote follows the mic. Pure;
// the demo stage lands the result with cause `mic_tempo` through the settle
// step (no grid time). Mirrors adoptVjMicTempo of
// queerpulse-backend/src/vj/stage/vj-tempo-rules.ts.

import {
  VJ_BEATS_PER_BAR,
  VJ_LIMITS,
  vjBeatMs,
  vjBeatPositionAt,
  type VjScreenMicReport,
  type VjTempo,
} from "../../../shared/contracts/vj";
import { roundBpm } from "./vjDemoStageInput";

/** How far `serverTime` lies from the nearest beat of the tempo grid, in ms. */
function distanceToNearestBeatMs(tempo: VjTempo, serverTime: number): number {
  const beatMs = vjBeatMs(tempo.bpm);
  const phaseMs = vjBeatPositionAt(tempo, serverTime).phase * beatMs;
  return Math.min(phaseMs, beatMs - phaseMs);
}

/** C 7.9 adoption; null when a condition fails (a source other than mic, a
 *  missing bpm or beat, confidence under 0.6, under 2000 ms since the last
 *  adoption, or a change under 0.5 BPM and 40 ms of phase). The adopted grid
 *  keeps the bar position of `beatAt`. */
export function adoptVjDemoMicTempo(input: {
  tempo: VjTempo;
  mic: VjScreenMicReport;
  now: number;
  lastAdoptionAt: number | null;
}): VjTempo | null {
  const { tempo, mic, now, lastAdoptionAt } = input;
  if (tempo.source !== "mic" || mic.bpm === null || mic.beatAt === null) {
    return null;
  }
  if (mic.confidence < VJ_LIMITS.micConfidenceMin) return null;
  if (
    lastAdoptionAt !== null &&
    now - lastAdoptionAt < VJ_LIMITS.micTempoMinIntervalMs
  ) {
    return null;
  }
  const isBpmMoved = Math.abs(mic.bpm - tempo.bpm) >= VJ_LIMITS.micBpmDeltaMin;
  const isPhaseMoved =
    distanceToNearestBeatMs(tempo, mic.beatAt) >= VJ_LIMITS.micPhaseDriftMsMin;
  if (!isBpmMoved && !isPhaseMoved) return null;
  const position = vjBeatPositionAt(tempo, mic.beatAt);
  const beatInBar =
    (position.beatInBar + (position.phase >= 0.5 ? 1 : 0)) % VJ_BEATS_PER_BAR;
  const bpm = roundBpm(mic.bpm);
  return {
    bpm,
    downbeatAt: Math.round(mic.beatAt - beatInBar * vjBeatMs(bpm)),
    quantize: tempo.quantize,
    source: "mic",
  };
}

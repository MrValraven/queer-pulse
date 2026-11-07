/**
 * The seven frame uniforms every program declares (engine plan, Frame
 * uniforms), written once per animation frame into one reused object so the
 * frame loop allocates nothing. Beat values read the synced clock, so every
 * screen pulses on the same beat.
 */
import {
  VJ_BEATS_PER_BAR,
  vjBeatMs,
  writeVjBeatPositionAt,
  type VjBeatPosition,
  type VjSpeed,
  type VjTempo,
} from "../../../shared/contracts/vj";

export interface VjFrameUniformValues {
  uResolution: [number, number];
  /** Engine seconds, advancing at the stage speed. */
  uTime: number;
  /** Beats since `tempo.downbeatAt`: beat index plus phase. */
  uBeats: number;
  uBeatPhase: number;
  uBarPhase: number;
  /** 1 on the beat, decaying as exp(-6 * phase). */
  uBeatPulse: number;
  /** This screen's mic level when the mic is on, else uBeatPulse. */
  uDrive: number;
  beatIndex: number;
  beatPeriodMs: number;
  /** The engine time of the last write, so uTime integrates the speed; null before the first. */
  lastEngineTimeMs: number | null;
  /** The beat position each write fills in place. */
  readonly beatPosition: VjBeatPosition;
}

/** How fast the beat pulse decays across one beat. */
const VJ_BEAT_PULSE_DECAY = 6;
/** Longest engine-time step uTime takes in one frame, so a hidden tab never jumps generators. */
const VJ_MAX_TIME_STEP_MS = 250;

export function createVjFrameUniformValues(): VjFrameUniformValues {
  return {
    uResolution: [1, 1],
    uTime: 0,
    uBeats: 0,
    uBeatPhase: 0,
    uBarPhase: 0,
    uBeatPulse: 0,
    uDrive: 0,
    beatIndex: 0,
    beatPeriodMs: 500,
    lastEngineTimeMs: null,
    beatPosition: { beatIndex: 0, barIndex: 0, beatInBar: 0, phase: 0 },
  };
}

/** Fills `out` for this frame in place. */
export function writeVjFrameUniforms(
  out: VjFrameUniformValues,
  input: {
    engineTimeMs: number;
    speed: VjSpeed;
    serverNowMs: number;
    tempo: VjTempo;
    micLevel: number | null;
    width: number;
    height: number;
  },
): void {
  out.uResolution[0] = input.width;
  out.uResolution[1] = input.height;

  const previousEngineTimeMs = out.lastEngineTimeMs;
  const stepMs =
    previousEngineTimeMs === null
      ? input.engineTimeMs
      : Math.min(
          VJ_MAX_TIME_STEP_MS,
          Math.max(0, input.engineTimeMs - previousEngineTimeMs),
        );
  out.uTime += (stepMs * input.speed) / 1000;
  out.lastEngineTimeMs = input.engineTimeMs;

  const position = writeVjBeatPositionAt(
    out.beatPosition,
    input.tempo,
    input.serverNowMs,
  );
  out.beatIndex = position.beatIndex;
  out.beatPeriodMs = vjBeatMs(input.tempo.bpm);
  out.uBeats = position.beatIndex + position.phase;
  out.uBeatPhase = position.phase;
  out.uBarPhase = (position.beatInBar + position.phase) / VJ_BEATS_PER_BAR;
  out.uBeatPulse = Math.exp(-VJ_BEAT_PULSE_DECAY * position.phase);
  out.uDrive = input.micLevel ?? out.uBeatPulse;
}

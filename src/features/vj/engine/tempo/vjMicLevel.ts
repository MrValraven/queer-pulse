/**
 * The microphone level a screen shows and feeds to audio-reactive effects:
 * 0 at the -60 dBFS floor, 1 at the loudest recent moment. The loudest
 * moment (`peakDb`) is an auto-gain reference that jumps up at once and sinks
 * 6 dB per second, so it crosses the whole 60 dB range in 10 s and a quiet
 * room reads near full scale within 10 s of a loud passage ending.
 *
 * The level follows its target with a 30 ms attack and a 250 ms release
 * (95% of the way in each time). Pure: audio never leaves this function and
 * nothing is stored.
 */

/** The quietest level the meter tells apart from silence. */
export const VJ_MIC_FLOOR_DB = -60;
/** The auto-gain reference never sinks under this, so room hiss stays low on the meter. */
export const VJ_MIC_PEAK_MIN_DB = -45;
/** How fast the auto-gain reference sinks after a loud moment. */
export const VJ_MIC_PEAK_DECAY_DB_PER_SEC = 6;
export const VJ_MIC_ATTACK_MS = 30;
export const VJ_MIC_RELEASE_MS = 250;

/** Three time constants reach 95% of a step, so each time constant is a third of the named time. */
const ATTACK_TIME_CONSTANT_MS = VJ_MIC_ATTACK_MS / 3;
const RELEASE_TIME_CONSTANT_MS = VJ_MIC_RELEASE_MS / 3;
/** Amplitude of the -60 dBFS floor. */
const FLOOR_AMPLITUDE = 10 ** (VJ_MIC_FLOOR_DB / 20);

export interface VjMicLevel {
  /** 0..1. */
  level: number;
  /** The auto-gain reference in dBFS. */
  peakDb: number;
}

export function createVjMicLevel(): VjMicLevel {
  return { level: 0, peakDb: VJ_MIC_PEAK_MIN_DB };
}

function clampUnit(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/** dBFS of an RMS amplitude, raised to the floor when quieter. */
function decibelsOf(rms: number): number {
  const amplitude = Number.isFinite(rms) ? Math.min(1, Math.abs(rms)) : 0;
  return 20 * Math.log10(Math.max(FLOOR_AMPLITUDE, amplitude));
}

/** One step of the meter: `rms` is the newest hop's RMS (0..1, full scale
 *  1) and `deltaMs` the time since the previous step. */
export function updateVjMicLevel(
  state: VjMicLevel,
  rms: number,
  deltaMs: number,
): VjMicLevel {
  const stepMs = Number.isFinite(deltaMs) && deltaMs > 0 ? deltaMs : 0;
  const rmsDb = decibelsOf(rms);
  const sunkPeakDb =
    state.peakDb - (VJ_MIC_PEAK_DECAY_DB_PER_SEC * stepMs) / 1000;
  const peakDb = Math.max(VJ_MIC_PEAK_MIN_DB, rmsDb, sunkPeakDb);
  const target = clampUnit(
    (rmsDb - VJ_MIC_FLOOR_DB) / (peakDb - VJ_MIC_FLOOR_DB),
  );
  const timeConstantMs =
    target > state.level ? ATTACK_TIME_CONSTANT_MS : RELEASE_TIME_CONSTANT_MS;
  const blend = 1 - Math.exp(-stepMs / timeConstantMs);
  const level = clampUnit(state.level + (target - state.level) * blend);
  return { level, peakDb };
}

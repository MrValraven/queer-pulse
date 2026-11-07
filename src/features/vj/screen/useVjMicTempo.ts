/**
 * Microphone tempo for the projector screen (contract 3.8, 7.9, 9.2).
 *
 * While listening, every envelope batch from the mic input feeds the meter
 * level (`levelRef` every hop for the engine, `level` for the setup card at
 * most 10 times a second) and the onset detector. Onset strengths are
 * resampled to `VJ_TEMPO_RATE_HZ` into an 8 s ring; once a second of audio
 * time the tempo estimator runs on it and `vjMicReportOf` turns the estimate
 * into `report`, the mic part of `screen:status`. The beat converts from the
 * audio clock to server ms by reading `audioContext.currentTime` and
 * `clock.serverNow()` in the same tick.
 *
 * Privacy: the sound stays inside the mic input; only the level, bpm, beat
 * time and confidence leave this hook, and none of it is logged. The only
 * thing stored is the opt-in flag on this device
 * (`VJ_SCREEN_MIC_STORAGE_KEY`). With the opt-in on and the microphone
 * permission already granted, listening starts on mount with no prompt;
 * otherwise only the setup card button starts it.
 */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import type { VjScreenMicReport } from "../../../shared/contracts/vj";
import {
  startVjMicInput,
  type VjMicFailure,
  type VjMicSession,
} from "../engine/tempo/vjMicInput";
import {
  createVjMicLevel,
  updateVjMicLevel,
  type VjMicLevel,
} from "../engine/tempo/vjMicLevel";
import {
  createVjMicReportGate,
  vjMicReportOf,
  type VjMicReportGate,
} from "../engine/tempo/vjMicReportGate";
import {
  createVjOnsetDetector,
  pushVjEnvelope,
  type VjEnvelopeSample,
  type VjOnsetDetector,
} from "../engine/tempo/vjOnsetDetector";
import {
  estimateVjTempo,
  VJ_TEMPO_RATE_HZ,
  VJ_TEMPO_WINDOW_SEC,
  type VjTempoEstimate,
} from "../engine/tempo/vjTempoEstimator";
import type { VjClockReader } from "../engine/vjEngineLook";
import { VJ_SCREEN_MIC_STORAGE_KEY } from "../vj.constants";

export type VjMicStatus = "off" | "starting" | "listening" | "failed";

export interface VjMicTempoState {
  status: VjMicStatus;
  failure: VjMicFailure | null;
  /** UI level, updated at most 10 times a second. */
  level: number;
  /** The engine's per-frame level, written every hop; null while off. */
  levelRef: RefObject<number | null>;
  /** The status report; null while off (contract 3.8). */
  report: VjScreenMicReport | null;
  start: () => void;
  stop: () => void;
}

/** Audio seconds between tempo estimates. */
export const VJ_MIC_ESTIMATE_INTERVAL_SEC = 1;
/** Audio seconds between UI level updates (10 a second). */
export const VJ_MIC_UI_LEVEL_INTERVAL_SEC = 0.1;
const STRENGTH_RING_SIZE = VJ_TEMPO_RATE_HZ * VJ_TEMPO_WINDOW_SEC;

/** The first report while listening: the mic is on and nothing is heard yet. */
const LISTENING_REPORT: VjScreenMicReport = {
  level: 0,
  bpm: null,
  confidence: 0,
  beatAt: null,
};

// ── Device opt-in (contract 9.2) ──

/** Whether this screen had the mic on; anything but the stored "true" reads off. */
export function readVjMicOptIn(): boolean {
  try {
    return window.localStorage.getItem(VJ_SCREEN_MIC_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function writeVjMicOptIn(isOn: boolean): void {
  try {
    window.localStorage.setItem(
      VJ_SCREEN_MIC_STORAGE_KEY,
      isOn ? "true" : "false",
    );
  } catch {
    // Storage can be blocked; the opt-in then lasts for this visit only.
  }
}

/** Whether the browser already granted the mic, so starting asks nothing. */
async function isVjMicPermissionGranted(): Promise<boolean> {
  try {
    const permissions =
      typeof navigator === "undefined" ? undefined : navigator.permissions;
    if (permissions === undefined) return false;
    const permission = await permissions.query({ name: "microphone" });
    return permission.state === "granted";
  } catch {
    return false;
  }
}

// ── Analysis (pure apart from mutating its own buffers) ──

export interface VjMicAnalysis {
  detector: VjOnsetDetector;
  micLevel: VjMicLevel;
  gate: VjMicReportGate;
  /** Onset strengths at VJ_TEMPO_RATE_HZ, a ring of the last 8 s. */
  readonly strengths: Float32Array;
  /** The ring in time order, handed to the estimator. */
  readonly orderedStrengths: Float32Array;
  writeIndex: number;
  count: number;
  /** The 10 ms slot still collecting hops, and its strongest strength. */
  openSlot: number | null;
  openSlotStrength: number;
  previousTimeSec: number | null;
  nextEstimateSec: number | null;
  lastUiLevelSec: number | null;
}

export function createVjMicAnalysis(): VjMicAnalysis {
  return {
    detector: createVjOnsetDetector(),
    micLevel: createVjMicLevel(),
    gate: createVjMicReportGate(),
    strengths: new Float32Array(STRENGTH_RING_SIZE),
    orderedStrengths: new Float32Array(STRENGTH_RING_SIZE),
    writeIndex: 0,
    count: 0,
    openSlot: null,
    openSlotStrength: 0,
    previousTimeSec: null,
    nextEstimateSec: null,
    lastUiLevelSec: null,
  };
}

function commitStrength(analysis: VjMicAnalysis, strength: number): void {
  analysis.strengths[analysis.writeIndex] = strength;
  analysis.writeIndex = (analysis.writeIndex + 1) % STRENGTH_RING_SIZE;
  analysis.count = Math.min(STRENGTH_RING_SIZE, analysis.count + 1);
}

/** Resamples hop strengths to the estimator's rate: each 10 ms slot keeps
 *  its strongest hop, and a slot no hop reached reads 0. */
function pushStrength(
  analysis: VjMicAnalysis,
  timeSec: number,
  strength: number,
): void {
  const slot = Math.floor(timeSec * VJ_TEMPO_RATE_HZ);
  if (analysis.openSlot === null || slot <= analysis.openSlot) {
    analysis.openSlot ??= slot;
    analysis.openSlotStrength = Math.max(analysis.openSlotStrength, strength);
    return;
  }
  commitStrength(analysis, analysis.openSlotStrength);
  const emptySlots = Math.min(STRENGTH_RING_SIZE, slot - analysis.openSlot - 1);
  for (let index = 0; index < emptySlots; index += 1) {
    commitStrength(analysis, 0);
  }
  analysis.openSlot = slot;
  analysis.openSlotStrength = strength;
}

/** The estimate on the committed strengths; the last one sits at the middle
 *  of the slot before the open one. */
function estimateOf(analysis: VjMicAnalysis): VjTempoEstimate | null {
  if (analysis.openSlot === null || analysis.count === 0) return null;
  const firstIndex =
    (analysis.writeIndex - analysis.count + STRENGTH_RING_SIZE) %
    STRENGTH_RING_SIZE;
  for (let offset = 0; offset < analysis.count; offset += 1) {
    analysis.orderedStrengths[offset] =
      analysis.strengths[(firstIndex + offset) % STRENGTH_RING_SIZE] ?? 0;
  }
  const endTimeSec = (analysis.openSlot - 1 + 0.5) / VJ_TEMPO_RATE_HZ;
  return estimateVjTempo(
    analysis.orderedStrengths.subarray(0, analysis.count),
    endTimeSec,
  );
}

export interface VjMicBatchResult {
  /** 0..1 after the newest hop. */
  level: number;
  /** A UI level update is due. */
  shouldShowLevel: boolean;
  /** A tempo estimate ran on this batch, at `atSec` on the audio clock. */
  tempo: { estimate: VjTempoEstimate | null; atSec: number } | null;
}

/** Feeds one worklet batch through the meter, the onset detector and the
 *  strength ring; runs the estimator when a second of audio has passed. */
export function pushVjMicSamples(
  analysis: VjMicAnalysis,
  samples: readonly VjEnvelopeSample[],
): VjMicBatchResult {
  let shouldShowLevel = false;
  let isEstimateDue = false;
  let latestTimeSec = analysis.previousTimeSec ?? 0;
  for (const sample of samples) {
    const deltaMs =
      analysis.previousTimeSec === null
        ? 0
        : (sample.timeSec - analysis.previousTimeSec) * 1000;
    analysis.micLevel = updateVjMicLevel(
      analysis.micLevel,
      sample.rms,
      deltaMs,
    );
    analysis.previousTimeSec = sample.timeSec;
    latestTimeSec = sample.timeSec;
    pushStrength(
      analysis,
      sample.timeSec,
      pushVjEnvelope(analysis.detector, sample).strength,
    );
    if (
      analysis.lastUiLevelSec === null ||
      sample.timeSec - analysis.lastUiLevelSec >= VJ_MIC_UI_LEVEL_INTERVAL_SEC
    ) {
      analysis.lastUiLevelSec = sample.timeSec;
      shouldShowLevel = true;
    }
    analysis.nextEstimateSec ??= sample.timeSec + VJ_MIC_ESTIMATE_INTERVAL_SEC;
    if (sample.timeSec >= analysis.nextEstimateSec) {
      analysis.nextEstimateSec = sample.timeSec + VJ_MIC_ESTIMATE_INTERVAL_SEC;
      isEstimateDue = true;
    }
  }
  return {
    level: analysis.micLevel.level,
    shouldShowLevel,
    tempo: isEstimateDue
      ? { estimate: estimateOf(analysis), atSec: latestTimeSec }
      : null,
  };
}

/** Server epoch ms of a beat on the audio clock, read against the context's
 *  current audio time and the synced clock in the same tick. */
export function vjBeatAtServerMs(
  beatAtSec: number,
  audioNowSec: number,
  serverNowMs: number,
): number {
  return serverNowMs - (audioNowSec - beatAtSec) * 1000;
}

// ── The hook ──

export function useVjMicTempo(input: {
  clock: VjClockReader;
}): VjMicTempoState {
  const [status, setStatus] = useState<VjMicStatus>("off");
  const [failure, setFailure] = useState<VjMicFailure | null>(null);
  const [level, setLevel] = useState(0);
  const [report, setReport] = useState<VjScreenMicReport | null>(null);
  const levelRef = useRef<number | null>(null);
  const clockRef = useRef(input.clock);
  const sessionRef = useRef<VjMicSession | null>(null);
  const isActiveRef = useRef(false);
  /** Bumped on every start and release, so a late start or envelope from an
   *  older session is dropped. */
  const generationRef = useRef(0);

  useEffect(() => {
    clockRef.current = input.clock;
  }, [input.clock]);

  const release = useCallback(() => {
    generationRef.current += 1;
    isActiveRef.current = false;
    sessionRef.current?.stop();
    sessionRef.current = null;
    levelRef.current = null;
  }, []);

  const showOff = useCallback(
    (nextStatus: VjMicStatus, nextFailure: VjMicFailure | null) => {
      setStatus(nextStatus);
      setFailure(nextFailure);
      setLevel(0);
      setReport(null);
    },
    [],
  );

  const handleSamples = useCallback(
    (analysis: VjMicAnalysis, samples: readonly VjEnvelopeSample[]) => {
      const result = pushVjMicSamples(analysis, samples);
      levelRef.current = result.level;
      if (result.shouldShowLevel)
        setLevel(Math.round(result.level * 100) / 100);
      if (result.tempo === null) return;
      const { estimate, atSec } = result.tempo;
      const session = sessionRef.current;
      const beatAtServerMs =
        estimate === null || session === null
          ? null
          : vjBeatAtServerMs(
              estimate.beatAtSec,
              session.audioContext.currentTime,
              clockRef.current.serverNow(),
            );
      const next = vjMicReportOf(analysis.gate, {
        level: result.level,
        estimate,
        nowMs: atSec * 1000,
        beatAtServerMs,
      });
      analysis.gate = next.gate;
      setReport(next.report);
    },
    [],
  );

  const begin = useCallback(async () => {
    if (isActiveRef.current) return;
    isActiveRef.current = true;
    generationRef.current += 1;
    const generation = generationRef.current;
    const isCurrent = () => generationRef.current === generation;
    setStatus("starting");
    setFailure(null);
    const analysis = createVjMicAnalysis();
    const result = await startVjMicInput({
      onEnvelope: (samples) => {
        if (isCurrent()) handleSamples(analysis, samples);
      },
      onInterrupted: () => {
        if (!isCurrent()) return;
        release();
        showOff("failed", "interrupted");
      },
    });
    if (!isCurrent()) {
      if (result.ok) result.session.stop();
      return;
    }
    if (!result.ok) {
      release();
      showOff("failed", result.reason);
      return;
    }
    sessionRef.current = result.session;
    levelRef.current = 0;
    setLevel(0);
    setReport(LISTENING_REPORT);
    setStatus("listening");
  }, [handleSamples, release, showOff]);

  const start = useCallback(() => {
    writeVjMicOptIn(true);
    void begin();
  }, [begin]);

  const stop = useCallback(() => {
    writeVjMicOptIn(false);
    release();
    showOff("off", null);
  }, [release, showOff]);

  useEffect(() => {
    if (!readVjMicOptIn()) return;
    let isCancelled = false;
    void isVjMicPermissionGranted().then((isGranted) => {
      if (isGranted && !isCancelled) void begin();
    });
    return () => {
      isCancelled = true;
    };
  }, [begin]);

  useEffect(() => release, [release]);

  return { status, failure, level, levelRef, report, start, stop };
}

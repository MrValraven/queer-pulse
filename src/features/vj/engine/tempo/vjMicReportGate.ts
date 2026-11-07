/**
 * The mic part of `screen:status` (contract 3.8, 7.9), built from the tempo
 * estimates of the last few seconds (pure).
 *
 * `bpm` and `beatAt` stay null until the estimates have been confident
 * (`VJ_LIMITS.micConfidenceMin` or more) and within `VJ_MIC_STABLE_BPM` of the
 * newest for `VJ_MIC_STABLE_MS`, so a wandering guess never reaches the
 * server. The reported bpm is the mean of the stable estimates of the last
 * `VJ_MIC_STABLE_MS`, rounded to one decimal, which smooths the once a second
 * jitter well under the server's 0.5 BPM adoption step; the server adopts at
 * most every 2 s and only for a 0.5 BPM or 40 ms change (contract 7.9). Only
 * levels, tempi and beat times pass through; audio never leaves the device
 * and nothing is stored.
 */
import {
  VJ_LIMITS,
  type VjScreenMicReport,
} from "../../../../shared/contracts/vj";
import type { VjTempoEstimate } from "./vjTempoEstimator";

export const VJ_MIC_STABLE_MS = 4000;
export const VJ_MIC_STABLE_BPM = 1.5;

interface VjMicGateEntry {
  atMs: number;
  bpm: number;
}

export interface VjMicReportGate {
  /** The current run of confident estimates, oldest first: the last
   *  `VJ_MIC_STABLE_MS` plus the newest one older than that. */
  readonly entries: readonly VjMicGateEntry[];
}

export interface VjMicReportInput {
  /** 0..1 from `updateVjMicLevel`. */
  level: number;
  estimate: VjTempoEstimate | null;
  /** Local clock of the estimate, in ms. */
  nowMs: number;
  /** The estimate's beat converted to server epoch ms; null without one. */
  beatAtServerMs: number | null;
}

export function createVjMicReportGate(): VjMicReportGate {
  return { entries: [] };
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function clampUnit(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function isConfident(
  estimate: VjTempoEstimate | null,
): estimate is VjTempoEstimate {
  return (
    estimate !== null &&
    Number.isFinite(estimate.bpm) &&
    Number.isFinite(estimate.confidence) &&
    estimate.confidence >= VJ_LIMITS.micConfidenceMin
  );
}

/** Keeps the entries inside the stable window plus the newest one before it
 *  (older ones never decide stability). */
function prunedEntries(
  entries: readonly VjMicGateEntry[],
  nowMs: number,
): VjMicGateEntry[] {
  const firstInsideIndex = entries.findIndex(
    (entry) => nowMs - entry.atMs <= VJ_MIC_STABLE_MS,
  );
  if (firstInsideIndex === -1) return entries.slice(-1);
  return entries.slice(Math.max(0, firstInsideIndex - 1));
}

/** The entries of the newest stretch that stays within the stable band of
 *  the newest estimate, oldest first. */
function stableStretch(
  entries: readonly VjMicGateEntry[],
  newestBpm: number,
): VjMicGateEntry[] {
  let startIndex = entries.length;
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const entry = entries[index];
    if (!entry || Math.abs(entry.bpm - newestBpm) > VJ_MIC_STABLE_BPM) break;
    startIndex = index;
  }
  return entries.slice(startIndex);
}

function clampedBpm(bpm: number): number {
  return Math.min(
    VJ_LIMITS.bpmMax,
    Math.max(VJ_LIMITS.bpmMin, roundTo(bpm, 1)),
  );
}

/** The bpm to report: the mean of the stable stretch inside the window. */
function reportedBpmOf(
  stretch: readonly VjMicGateEntry[],
  nowMs: number,
): number {
  const inside = stretch.filter(
    (entry) => nowMs - entry.atMs <= VJ_MIC_STABLE_MS,
  );
  const counted = inside.length > 0 ? inside : stretch;
  const meanBpm =
    counted.reduce((sum, entry) => sum + entry.bpm, 0) / counted.length;
  return clampedBpm(meanBpm);
}

/** The mic part of screen:status: bpm and beatAt stay null until the
 *  estimate is confident and stable. */
export function vjMicReportOf(
  gate: VjMicReportGate,
  input: VjMicReportInput,
): { gate: VjMicReportGate; report: VjScreenMicReport } {
  const level = roundTo(clampUnit(input.level), 2);
  const confidence = roundTo(clampUnit(input.estimate?.confidence ?? 0), 2);
  const unstableReport: VjScreenMicReport = {
    level,
    bpm: null,
    confidence,
    beatAt: null,
  };
  if (!isConfident(input.estimate)) {
    return { gate: createVjMicReportGate(), report: unstableReport };
  }
  const entries = prunedEntries(
    [...gate.entries, { atMs: input.nowMs, bpm: input.estimate.bpm }],
    input.nowMs,
  );
  const stretch = stableStretch(entries, input.estimate.bpm);
  const stableSinceMs = stretch[0]?.atMs ?? input.nowMs;
  const isStable = input.nowMs - stableSinceMs >= VJ_MIC_STABLE_MS;
  if (!isStable) {
    return { gate: { entries }, report: unstableReport };
  }
  const bpm = reportedBpmOf(stretch, input.nowMs);
  const beatAt =
    input.beatAtServerMs !== null && Number.isFinite(input.beatAtServerMs)
      ? Math.round(input.beatAtServerMs)
      : null;
  return {
    gate: { entries },
    report: { level, bpm, confidence, beatAt },
  };
}

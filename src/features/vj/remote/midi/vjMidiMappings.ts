import { VJ_EFFECT_IDS } from "../../../../shared/contracts/vj";
import { VJ_REMOTE_MIDI_STORAGE_KEY } from "../../vj.constants";
import type { VjActionPhase, VjRemoteAction } from "../input/vjRemoteAction";
import type { VjPadId } from "../rules/vjDockPads";
import {
  vjMidiControlKeyOf,
  vjMidiNormalized,
  type VjMidiEvent,
} from "./vjMidiMessage";

/**
 * What a learned control drives. Clip targets are grid slots (Decisions 3),
 * so a controller keeps working after a pack switch.
 */
export type VjMidiTarget =
  | { kind: "clipSlot"; index: number }
  | { kind: "pad"; padId: VjPadId }
  | { kind: "crossfader" }
  | { kind: "transitionLength" }
  | { kind: "tapTempo" }
  | { kind: "go" }
  | { kind: "blackout" };

export interface VjMidiMapping {
  controlKey: string;
  target: VjMidiTarget;
}

export const VJ_MIDI_MAPPINGS_MAX = 128;

/** A CC at or above this value counts as pressed. */
const CC_PRESS_THRESHOLD = 64;
const CONTROL_KEY_PATTERN = /^(note|cc):([1-9]|1[0-6]):(\d{1,3})$/;
const DATA_BYTE_MAX = 127;

/** Crossfader and transition length follow a knob or fader; every other target is a press. */
export function isVjMidiContinuousTarget(target: VjMidiTarget): boolean {
  return target.kind === "crossfader" || target.kind === "transitionLength";
}

/** One stable string per target, so a target holds at most one control. */
export function vjMidiTargetKey(target: VjMidiTarget): string {
  if (target.kind === "clipSlot") return `clipSlot:${target.index}`;
  if (target.kind === "pad") return `pad:${target.padId}`;
  return target.kind;
}

function isVjMidiControlKey(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = CONTROL_KEY_PATTERN.exec(value);
  return match !== null && Number(match[3]) <= DATA_BYTE_MAX;
}

function isVjPadId(value: unknown): value is VjPadId {
  return (
    value === "strobe" ||
    (typeof value === "string" &&
      (VJ_EFFECT_IDS as readonly string[]).includes(value))
  );
}

function targetOf(raw: unknown): VjMidiTarget | null {
  if (typeof raw !== "object" || raw === null) return null;
  const candidate = raw as { kind?: unknown; index?: unknown; padId?: unknown };
  switch (candidate.kind) {
    case "clipSlot":
      return Number.isSafeInteger(candidate.index) &&
        (candidate.index as number) >= 0
        ? { kind: "clipSlot", index: candidate.index as number }
        : null;
    case "pad":
      return isVjPadId(candidate.padId)
        ? { kind: "pad", padId: candidate.padId }
        : null;
    case "crossfader":
    case "transitionLength":
    case "tapTempo":
    case "go":
    case "blackout":
      return { kind: candidate.kind };
    default:
      return null;
  }
}

/**
 * Stored mappings, validated row by row (contract 9.2). A bad value reads as
 * none; a malformed row, a second row for a control or a target already taken
 * is dropped; at most VJ_MIDI_MAPPINGS_MAX rows are kept.
 */
export function parseVjMidiMappings(raw: unknown): VjMidiMapping[] {
  if (!Array.isArray(raw)) return [];
  const mappings: VjMidiMapping[] = [];
  const seenControlKeys = new Set<string>();
  const seenTargetKeys = new Set<string>();
  for (const row of raw as unknown[]) {
    if (mappings.length >= VJ_MIDI_MAPPINGS_MAX) break;
    if (typeof row !== "object" || row === null) continue;
    const { controlKey, target: rawTarget } = row as {
      controlKey?: unknown;
      target?: unknown;
    };
    const target = targetOf(rawTarget);
    if (!isVjMidiControlKey(controlKey) || target === null) continue;
    const targetKey = vjMidiTargetKey(target);
    if (seenControlKeys.has(controlKey) || seenTargetKeys.has(targetKey)) {
      continue;
    }
    seenControlKeys.add(controlKey);
    seenTargetKeys.add(targetKey);
    mappings.push({ controlKey, target });
  }
  return mappings;
}

/**
 * Adds the mapping with one control to one target: any row holding the same
 * control or the same target is replaced. Past the cap the oldest rows drop.
 */
export function upsertVjMidiMapping(
  mappings: readonly VjMidiMapping[],
  mapping: VjMidiMapping,
): VjMidiMapping[] {
  const targetKey = vjMidiTargetKey(mapping.target);
  const kept = mappings.filter(
    (existing) =>
      existing.controlKey !== mapping.controlKey &&
      vjMidiTargetKey(existing.target) !== targetKey,
  );
  return [...kept, mapping].slice(-VJ_MIDI_MAPPINGS_MAX);
}

export function removeVjMidiMapping(
  mappings: readonly VjMidiMapping[],
  controlKey: string,
): VjMidiMapping[] {
  return mappings.filter((mapping) => mapping.controlKey !== controlKey);
}

/**
 * Which way a CC moved across the press threshold. An unknown previous value
 * reads as released, so a first message at 64 or above presses.
 */
function ccCrossingOf(
  previousValue: number | null | undefined,
  value: number,
): "up" | "down" | null {
  const wasPressed = (previousValue ?? 0) >= CC_PRESS_THRESHOLD;
  const isPressed = value >= CC_PRESS_THRESHOLD;
  if (isPressed && !wasPressed) return "up";
  if (!isPressed && wasPressed) return "down";
  return null;
}

function pressActionOf(target: VjMidiTarget): VjRemoteAction | null {
  switch (target.kind) {
    case "clipSlot":
      return { kind: "goClipAt", index: target.index };
    case "pad":
      return { kind: "pad", padId: target.padId };
    case "tapTempo":
      return { kind: "tapTempo" };
    case "go":
      return { kind: "go" };
    case "blackout":
      return { kind: "blackout" };
    default:
      return null;
  }
}

function continuousActionOf(
  target: VjMidiTarget,
  value: number,
): VjRemoteAction | null {
  const normalized = vjMidiNormalized(value);
  if (target.kind === "crossfader") {
    return { kind: "crossfader", amount: normalized };
  }
  if (target.kind === "transitionLength") {
    return { kind: "transitionLength", normalized };
  }
  return null;
}

/**
 * The action a message drives through its mapping, or null when the message
 * comes from another control or means nothing for this target.
 *
 * A note on presses; a note off releases a pad. A CC presses when it crosses
 * up through 64 and releases a pad when it crosses back down, so pass the
 * control's previous CC value (`previousValue`) to keep a turning knob from
 * pressing on every step. Crossfader and transition length take CC only, as a
 * `value` phase with the normalized value.
 */
export function vjMidiActionOf(
  mapping: VjMidiMapping,
  event: VjMidiEvent,
  previousValue?: number | null,
): { action: VjRemoteAction; phase: VjActionPhase } | null {
  if (vjMidiControlKeyOf(event) !== mapping.controlKey) return null;
  const { target } = mapping;
  if (isVjMidiContinuousTarget(target)) {
    if (event.kind !== "cc") return null;
    const action = continuousActionOf(target, event.value);
    return action === null ? null : { action, phase: "value" };
  }
  const action = pressActionOf(target);
  if (action === null) return null;
  if (event.kind === "noteOn") return { action, phase: "press" };
  const isPad = target.kind === "pad";
  if (event.kind === "noteOff") {
    return isPad ? { action, phase: "release" } : null;
  }
  if (event.kind !== "cc") return null;
  const crossing = ccCrossingOf(previousValue, event.value);
  if (crossing === "up") return { action, phase: "press" };
  if (crossing === "down" && isPad) return { action, phase: "release" };
  return null;
}

/** The mappings saved on this device; blocked storage or a bad value reads as none. */
export function readVjMidiMappings(): VjMidiMapping[] {
  try {
    const raw = window.localStorage.getItem(VJ_REMOTE_MIDI_STORAGE_KEY);
    if (raw === null) return [];
    return parseVjMidiMappings(JSON.parse(raw) as unknown);
  } catch {
    return [];
  }
}

/** Saves the mappings; an empty list clears the key. Blocked storage keeps them for this page load only. */
export function writeVjMidiMappings(mappings: readonly VjMidiMapping[]): void {
  try {
    if (mappings.length === 0) {
      window.localStorage.removeItem(VJ_REMOTE_MIDI_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(
      VJ_REMOTE_MIDI_STORAGE_KEY,
      JSON.stringify(mappings),
    );
  } catch {
    // Private mode or a full quota: the mappings stay in memory.
  }
}

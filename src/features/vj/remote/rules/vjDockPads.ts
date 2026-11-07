/**
 * The dock's effect pads (contract 9.2): the device keeps the effect ids of
 * the dock row, in order, under `VJ_REMOTE_DOCK_PADS_STORAGE_KEY` from
 * `../../vj.constants` (read and written by `useVjDockPads`). A bad or empty
 * value takes the first 8 ids of `VJ_EFFECT_IDS`.
 */
import {
  VJ_EFFECT_IDS,
  type VjEffectId,
} from "../../../../shared/contracts/vj";

export const VJ_DOCK_PADS_MAX = 12;

const VJ_DEFAULT_DOCK_PAD_COUNT = 8;

/** Contract 9.2: a bad or empty value takes the first 8 ids of VJ_EFFECT_IDS. */
export const VJ_DEFAULT_DOCK_PADS: readonly VjEffectId[] = VJ_EFFECT_IDS.slice(
  0,
  VJ_DEFAULT_DOCK_PAD_COUNT,
);

/** The pads row: strobe is a fixed first pad; the dock list follows. */
export type VjPadId = VjEffectId | "strobe";

const KNOWN_EFFECT_IDS: ReadonlySet<string> = new Set(VJ_EFFECT_IDS);

function isVjEffectId(value: unknown): value is VjEffectId {
  return typeof value === "string" && KNOWN_EFFECT_IDS.has(value);
}

/** Drops unknown ids and duplicates and caps at 12; anything left empty takes the default. */
export function parseVjDockPads(raw: unknown): VjEffectId[] {
  if (!Array.isArray(raw)) return [...VJ_DEFAULT_DOCK_PADS];
  const pads: VjEffectId[] = [];
  for (const entry of raw as unknown[]) {
    if (pads.length === VJ_DOCK_PADS_MAX) break;
    if (isVjEffectId(entry) && !pads.includes(entry)) pads.push(entry);
  }
  return pads.length === 0 ? [...VJ_DEFAULT_DOCK_PADS] : pads;
}

/** Appends the effect; a pad already docked keeps its place; a full dock answers "full". */
export function addVjDockPad(
  pads: readonly VjEffectId[],
  effectId: VjEffectId,
): VjEffectId[] | "full" {
  if (pads.includes(effectId)) return [...pads];
  if (pads.length >= VJ_DOCK_PADS_MAX) return "full";
  return [...pads, effectId];
}

export function removeVjDockPad(
  pads: readonly VjEffectId[],
  effectId: VjEffectId,
): VjEffectId[] {
  return pads.filter((padEffectId) => padEffectId !== effectId);
}

/** Swaps the pad with its neighbour; at the edge (or for a pad not docked) the order stays. */
export function moveVjDockPad(
  pads: readonly VjEffectId[],
  effectId: VjEffectId,
  direction: -1 | 1,
): VjEffectId[] {
  const movedPads = [...pads];
  const fromIndex = movedPads.indexOf(effectId);
  const toIndex = fromIndex + direction;
  const neighbourEffectId = movedPads[toIndex];
  if (fromIndex === -1 || neighbourEffectId === undefined) return movedPads;
  movedPads[fromIndex] = neighbourEffectId;
  movedPads[toIndex] = effectId;
  return movedPads;
}

/**
 * The MIDI mappings saved on this device (contract 9.2,
 * `VJ_REMOTE_MIDI_STORAGE_KEY`). Every mounted copy of the hook reads one
 * shared store, so a mapping learned in the MIDI sheet reaches the hook that
 * listens to the controller at once, and a change in another tab arrives
 * through the `storage` event.
 */
import { useCallback, useSyncExternalStore } from "react";
import { VJ_REMOTE_MIDI_STORAGE_KEY } from "../../vj.constants";
import {
  readVjMidiMappings,
  removeVjMidiMapping,
  upsertVjMidiMapping,
  writeVjMidiMappings,
  type VjMidiMapping,
} from "./vjMidiMappings";

export interface UseVjMidiMappingsResult {
  mappings: VjMidiMapping[];
  save: (mapping: VjMidiMapping) => void;
  remove: (controlKey: string) => void;
  removeAll: () => void;
}

const EMPTY_MAPPINGS: VjMidiMapping[] = [];

/** Read once per subscription cycle; also the in-memory copy when storage is blocked. */
let cachedMappings: VjMidiMapping[] | null = null;
const listeners = new Set<() => void>();

function snapshotOfVjMidiMappings(): VjMidiMapping[] {
  if (cachedMappings === null) cachedMappings = readVjMidiMappings();
  return cachedMappings;
}

function notifyVjMidiMappingsListeners(): void {
  for (const listener of [...listeners]) listener();
}

function onStorageEvent(event: StorageEvent): void {
  if (event.key !== null && event.key !== VJ_REMOTE_MIDI_STORAGE_KEY) return;
  cachedMappings = null;
  notifyVjMidiMappingsListeners();
}

function subscribeVjMidiMappings(listener: () => void): () => void {
  if (listeners.size === 0) window.addEventListener("storage", onStorageEvent);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size > 0) return;
    window.removeEventListener("storage", onStorageEvent);
    // Nobody reads the store now: the next mount reads storage afresh.
    cachedMappings = null;
  };
}

function updateVjMidiMappings(
  change: (current: readonly VjMidiMapping[]) => VjMidiMapping[],
): void {
  const nextMappings = change(snapshotOfVjMidiMappings());
  cachedMappings = nextMappings;
  writeVjMidiMappings(nextMappings);
  notifyVjMidiMappingsListeners();
}

function serverSnapshotOfVjMidiMappings(): VjMidiMapping[] {
  return EMPTY_MAPPINGS;
}

export function useVjMidiMappings(): UseVjMidiMappingsResult {
  const mappings = useSyncExternalStore(
    subscribeVjMidiMappings,
    snapshotOfVjMidiMappings,
    serverSnapshotOfVjMidiMappings,
  );

  const save = useCallback((mapping: VjMidiMapping) => {
    updateVjMidiMappings((current) => upsertVjMidiMapping(current, mapping));
  }, []);

  const remove = useCallback((controlKey: string) => {
    updateVjMidiMappings((current) => removeVjMidiMapping(current, controlKey));
  }, []);

  const removeAll = useCallback(() => {
    updateVjMidiMappings(() => []);
  }, []);

  return { mappings, save, remove, removeAll };
}

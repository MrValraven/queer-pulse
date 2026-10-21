import { useSyncExternalStore } from "react";

/**
 * Which rail folders the member opened or closed, and the one being renamed
 * in place. Module state for the tab, so the Create menu (a sibling of the
 * rail list) can open a new folder straight into rename, and a folder keeps
 * its state while the member moves between pages. Nothing is stored on the
 * device or sent anywhere; a reload starts with every folder closed except
 * the one holding the open playlist.
 */
interface RailFolderState {
  /** An explicit open (true) or close (false) by the member. */
  toggled: ReadonlyMap<string, boolean>;
  renamingFolderId: string | null;
}

let state: RailFolderState = { toggled: new Map(), renamingFolderId: null };
const listeners = new Set<() => void>();

function update(next: Partial<RailFolderState>) {
  state = { ...state, ...next };
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const snapshot = () => state;

export function useStudioRailFolderState(): RailFolderState {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

export function setRailFolderExpanded(folderId: string, isExpanded: boolean) {
  const toggled = new Map(state.toggled);
  toggled.set(folderId, isExpanded);
  update({ toggled });
}

/** Opens the folder and puts its name in an edit field. */
export function startRailFolderRename(folderId: string) {
  const toggled = new Map(state.toggled);
  toggled.set(folderId, true);
  update({ toggled, renamingFolderId: folderId });
}

export function endRailFolderRename() {
  if (state.renamingFolderId !== null) update({ renamingFolderId: null });
}

/** For tests: every folder closed again. */
export function resetRailFolderStateForTests() {
  state = { toggled: new Map(), renamingFolderId: null };
}
